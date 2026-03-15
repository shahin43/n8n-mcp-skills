#!/usr/bin/env node

/**
 * Bridges MCP stdio framing:
 * - Codex client -> Content-Length framed JSON-RPC
 * - n8n-mcp server -> newline-delimited JSON-RPC
 */
const { spawn } = require("child_process");

const child = spawn("npx", ["--yes", "n8n-mcp"], {
  env: process.env,
  stdio: ["pipe", "pipe", "pipe"],
});

child.stderr.on("data", (chunk) => {
  process.stderr.write(chunk);
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

let inbound = Buffer.alloc(0);
process.stdin.on("data", (chunk) => {
  inbound = Buffer.concat([inbound, chunk]);
  drainInbound();
});

process.stdin.on("end", () => {
  child.stdin.end();
});

function drainInbound() {
  while (true) {
    const headerEnd = inbound.indexOf("\r\n\r\n");
    if (headerEnd === -1) return;

    const headerText = inbound.slice(0, headerEnd).toString("utf8");
    const contentLength = parseContentLength(headerText);
    if (contentLength == null) {
      inbound = inbound.slice(headerEnd + 4);
      continue;
    }

    const frameEnd = headerEnd + 4 + contentLength;
    if (inbound.length < frameEnd) return;

    const body = inbound.slice(headerEnd + 4, frameEnd).toString("utf8");
    child.stdin.write(body + "\n");
    inbound = inbound.slice(frameEnd);
  }
}

function parseContentLength(headers) {
  const lines = headers.split("\r\n");
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    if (key !== "content-length") continue;
    const raw = line.slice(idx + 1).trim();
    const value = Number.parseInt(raw, 10);
    return Number.isFinite(value) ? value : null;
  }
  return null;
}

let outbound = "";
child.stdout.on("data", (chunk) => {
  outbound += chunk.toString("utf8");
  drainOutbound();
});

function drainOutbound() {
  while (true) {
    const newline = outbound.indexOf("\n");
    if (newline === -1) return;

    const line = outbound.slice(0, newline).trim();
    outbound = outbound.slice(newline + 1);
    if (!line) continue;

    const payload = Buffer.from(line, "utf8");
    process.stdout.write(`Content-Length: ${payload.length}\r\n\r\n`);
    process.stdout.write(payload);
  }
}
