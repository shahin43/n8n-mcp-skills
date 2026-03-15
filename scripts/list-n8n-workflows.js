#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const DEFAULT_CONFIG = ".mcp.json";
const DEFAULT_SERVER = "n8n-mcp";
const DEFAULT_LIMIT = 10;
const REQUEST_TIMEOUT_MS = 30_000;

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(process.cwd(), options.configPath);
  const config = readJsonFile(configPath);
  const serverConfig = config?.mcpServers?.[options.serverName];

  if (!serverConfig) {
    throw new Error(
      `MCP server "${options.serverName}" was not found in ${configPath}`,
    );
  }

  if (!serverConfig.command) {
    throw new Error(
      `MCP server "${options.serverName}" is missing a command in ${configPath}`,
    );
  }

  const client = new JsonRpcLineClient({
    command: serverConfig.command,
    args: Array.isArray(serverConfig.args) ? serverConfig.args : [],
    env: { ...process.env, ...(serverConfig.env || {}) },
    cwd: process.cwd(),
  });

  try {
    await client.start();

    await client.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: {
        name: "codex-list-workflows-script",
        version: "1.0.0",
      },
    });

    client.notify("notifications/initialized", {});

    const response = await client.request("tools/call", {
      name: "n8n_list_workflows",
      arguments: {
        limit: options.limit,
      },
    });

    if (options.raw) {
      console.log(JSON.stringify(response, null, 2));
      return;
    }

    printToolResponse(response);
  } finally {
    client.stop();
  }
}

function parseArgs(argv) {
  const options = {
    configPath: DEFAULT_CONFIG,
    serverName: DEFAULT_SERVER,
    limit: DEFAULT_LIMIT,
    raw: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--config") {
      options.configPath = requireValue(argv, ++i, "--config");
      continue;
    }

    if (arg === "--server") {
      options.serverName = requireValue(argv, ++i, "--server");
      continue;
    }

    if (arg === "--limit") {
      const value = Number.parseInt(requireValue(argv, ++i, "--limit"), 10);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--limit must be a positive integer");
      }
      options.limit = value;
      continue;
    }

    if (arg === "--raw") {
      options.raw = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (!value) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

function printHelp() {
  console.log(`Usage: node scripts/list-n8n-workflows.js [options]

Options:
  --config <path>   Path to MCP config file (default: .mcp.json)
  --server <name>   MCP server name in config (default: n8n-mcp)
  --limit <count>   Max workflows to request (default: 10)
  --raw             Print the full MCP tool response
  --help            Show this message
`);
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Failed to read JSON from ${filePath}: ${error.message}`);
  }
}

function printToolResponse(response) {
  const textBlocks = Array.isArray(response?.content)
    ? response.content.filter((item) => item?.type === "text")
    : [];

  if (textBlocks.length === 0) {
    console.log(JSON.stringify(response, null, 2));
    return;
  }

  const combinedText = textBlocks.map((item) => item.text).join("\n");
  const parsed = tryParseJson(combinedText);

  if (!parsed) {
    console.log(combinedText);
    return;
  }

  if (parsed.success === false) {
    console.error(parsed.error || "n8n_list_workflows failed");
    if (parsed.code) {
      console.error(`code: ${parsed.code}`);
    }
    process.exitCode = 1;
    return;
  }

  const workflows = Array.isArray(parsed?.data?.data)
    ? parsed.data.data
    : Array.isArray(parsed?.data?.workflows)
      ? parsed.data.workflows
      : Array.isArray(parsed?.data)
        ? parsed.data
        : [];

  if (workflows.length === 0) {
    console.log("No workflows returned.");
    console.log(JSON.stringify(parsed, null, 2));
    return;
  }

  for (const workflow of workflows) {
    const id = workflow.id ?? "unknown";
    const name = workflow.name ?? "(unnamed)";
    const state = workflow.active ? "active" : "inactive";
    console.log(`${id}\t${state}\t${name}`);
  }
}

function tryParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

class JsonRpcLineClient {
  constructor({ command, args, env, cwd }) {
    this.command = command;
    this.args = args;
    this.env = env;
    this.cwd = cwd;
    this.nextId = 1;
    this.pending = new Map();
    this.stdoutBuffer = "";
    this.child = null;
  }

  start() {
    return new Promise((resolve, reject) => {
      this.child = spawn(this.command, this.args, {
        cwd: this.cwd,
        env: this.env,
        stdio: ["pipe", "pipe", "pipe"],
      });

      this.child.once("error", reject);
      this.child.once("spawn", resolve);

      this.child.stderr.on("data", (chunk) => {
        process.stderr.write(chunk);
      });

      this.child.stdout.on("data", (chunk) => {
        this.stdoutBuffer += chunk.toString("utf8");
        this.drainStdout();
      });

      this.child.on("exit", (code, signal) => {
        const suffix = signal
          ? `signal ${signal}`
          : `exit code ${code ?? "unknown"}`;
        const error = new Error(`MCP server exited with ${suffix}`);

        for (const { reject: rejectPending, timer } of this.pending.values()) {
          clearTimeout(timer);
          rejectPending(error);
        }
        this.pending.clear();
      });
    });
  }

  stop() {
    if (!this.child || this.child.killed) {
      return;
    }

    this.child.stdin.end();
    this.child.kill();
  }

  request(method, params) {
    const id = this.nextId;
    this.nextId += 1;

    const payload = {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for ${method} response`));
      }, REQUEST_TIMEOUT_MS);

      this.pending.set(id, { resolve, reject, timer });
      this.send(payload);
    });
  }

  notify(method, params) {
    this.send({
      jsonrpc: "2.0",
      method,
      params,
    });
  }

  send(payload) {
    if (!this.child) {
      throw new Error("MCP server is not running");
    }

    this.child.stdin.write(`${JSON.stringify(payload)}\n`);
  }

  drainStdout() {
    while (true) {
      const newlineIndex = this.stdoutBuffer.indexOf("\n");
      if (newlineIndex === -1) {
        return;
      }

      const line = this.stdoutBuffer.slice(0, newlineIndex).trim();
      this.stdoutBuffer = this.stdoutBuffer.slice(newlineIndex + 1);

      if (!line) {
        continue;
      }

      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        throw new Error(`Failed to parse server JSON-RPC line: ${error.message}`);
      }

      if (!Object.prototype.hasOwnProperty.call(message, "id")) {
        continue;
      }

      const pending = this.pending.get(message.id);
      if (!pending) {
        continue;
      }

      clearTimeout(pending.timer);
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(
          new Error(message.error.message || `JSON-RPC error for id ${message.id}`),
        );
        continue;
      }

      pending.resolve(message.result);
    }
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
