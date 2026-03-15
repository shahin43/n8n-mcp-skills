# AGENTS.md

This file provides guidance to Coding agents, when working with this repository.

## Project Overview

This is the **n8n-mcp-and-skills** repository - a collection of expert skills for building flawless n8n workflows using the n8n-mcp MCP server.

**Architecture**:
- **n8n-mcp MCP Server**: Provides data access (800+ nodes, validation, templates, workflow management)
- **Skills**: 8 complementary skill files that provide expert guidance on HOW to use MCP tools
- **Together**: Expert workflow builder with progressive disclosure

## MCP Server Setup

This project depends on the `n8n-mcp` MCP server for workflow discovery, validation, testing, and lifecycle management. Configure the MCP server before doing any workflow work in this repository.

### Codex Setup

Use `.mcp.json.example` as the starting point, then create a local `.mcp.json` with your real n8n instance values.

Minimum Codex-compatible configuration:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Recommended setup flow:
1. Copy `.mcp.json.example` to `.mcp.json`
2. Set `N8N_API_URL` to your n8n base URL
3. Set `N8N_API_KEY` to a valid n8n API key
4. Ensure `npx n8n-mcp` is available in your environment
5. Start Codex with MCP enabled and confirm the `n8n-mcp` server is listed

### Optional: Certificate Bundle Support for Codex

If your n8n instance uses an internal CA, corporate TLS inspection, or a non-public certificate chain, Codex may need an explicit certificate bundle to let the Node-based MCP process trust the endpoint.

Example:

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key-here",
        "NODE_EXTRA_CA_CERTS": "/absolute/path/to/ca-bundle.pem",
        "SSL_CERT_FILE": "/absolute/path/to/ca-bundle.pem"
      }
    }
  }
}
```

Note: This comes up more often in Codex than Claude Code because Codex launches the MCP server as a separate Node process, which may not see the same trust configuration your browser, desktop app, or OS keychain already uses. In those environments, the certificate chain may already be trusted without extra configuration.

### Connection Checklist

When the connection is working, Codex should be able to:
- run `n8n_health_check`
- list workflows with `n8n_list_workflows`
- inspect workflow details with `n8n_get_workflow`

If connection fails, check these first:
- `N8N_API_URL` is the correct base URL and reachable from your machine
- `N8N_API_KEY` is valid and has the required access
- `npx n8n-mcp` is installed or resolvable
- your certificate bundle path is absolute and points to a readable PEM file

See `.mcp.json.example` for a ready-to-copy MCP configuration template.

## Repository Structure

```
├── .claude-plugin/        # Claude Code plugin config
├── .mcp.json              # MCP server configuration (create from .mcp.json.example)
├── .mcp.json.example      # MCP config template
├── AGENTS.md              # Codex, Cursor - generic coding agent instructions (this file)
├── CLAUDE.md              # Claude Code instructions
├── LICENSE                # MIT License
├── README.md              # Project overview
└── n8n-skills/            # Core skills repository
    ├── skills/            # 8 skill implementations
    │   ├── n8n-expression-syntax/     # Expression syntax ({{}} patterns)
    │   ├── n8n-mcp-tools-expert/     # MCP tool usage guide (HIGHEST PRIORITY)
    │   ├── n8n-workflow-patterns/     # 5 proven workflow patterns
    │   ├── n8n-ai-agent-builder/      # AI Agent node creation and wiring
    │   ├── n8n-validation-expert/     # Validation error fixing
    │   ├── n8n-node-configuration/   # Node setup guidance
    │   ├── n8n-code-javascript/      # JavaScript Code nodes
    │   └── n8n-code-python/          # Python Code nodes
    ├── evaluations/       # Test scenarios for each skill
    ├── docs/              # Documentation
    ├── dist/              # Distribution packages
    └── build.sh           # Build script
```

Each skill has a `SKILL.md` with frontmatter and a `README.md`. Read these files for deep knowledge on each topic.

## Available MCP Tools

When the n8n-mcp server is connected, these tools are available:

### Node Discovery
- `search_nodes` - Find nodes by keyword (uses `nodes-base.*` format without `n8n-` prefix)
- `get_node` - Unified node info with detail levels (minimal, standard, full) and modes (info, docs, search_properties, versions)

### Validation
- `validate_node` - Validate node config with modes (minimal, full) and profiles (runtime, ai-friendly, strict)
- `validate_workflow` - Validate complete workflow structure

### Workflow Management
- `n8n_create_workflow` - Create new workflows (created inactive by default)
- `n8n_get_workflow` - Get workflow by ID
- `n8n_list_workflows` - List all workflows
- `n8n_update_partial_workflow` - Incremental updates (17 operation types including activateWorkflow)
- `n8n_update_full_workflow` - Full workflow replacement
- `n8n_delete_workflow` - Delete a workflow
- `n8n_validate_workflow` - Validate workflow by ID
- `n8n_autofix_workflow` - Auto-fix common validation issues
- `n8n_test_workflow` - Test workflow execution
- `n8n_executions` - View/manage execution history
- `n8n_deploy_template` - Deploy a template to n8n instance
- `n8n_workflow_versions` - Version history and rollback
- `n8n_health_check` - Check n8n instance health

### Templates
- `search_templates` - Search with modes: keyword, by_nodes, by_task, by_metadata
- `get_template` - Get template details

### Documentation
- `tools_documentation` - Meta-documentation for all tools

## Critical Knowledge

### n8n Expression Syntax

Expressions use `={{ }}` syntax (note the `=` prefix):

```
={{ $json.fieldName }}
={{ $json.body.data }}          // Webhook data is under $json.body
={{ $('Node Name').item.json.field }}  // Reference other nodes
={{ $now.toISO() }}             // Current datetime
={{ $env.MY_VAR }}              // Environment variable
```

**Critical gotcha**: Webhook/HTTP data is always under `$json.body`, not directly on `$json`.

**In Code nodes, do NOT use expression syntax**. Use direct JavaScript/Python variable access instead.

### Node Type Format

Two formats exist - use the right one for each context:
- **For MCP tools** (search_nodes, get_node, validate_node): Use `nodes-base.httpRequest` (no `n8n-` prefix)
- **In workflow JSON** (nodes array, type field): Use `n8n-nodes-base.httpRequest` (with `n8n-` prefix)

### Workflow Creation Pattern

Always follow this sequence:
1. `search_nodes` to find needed nodes
2. `get_node` (detail="standard") to understand operations and required fields
3. `n8n_create_workflow` with properly configured nodes
4. `n8n_validate_workflow` to check for issues
5. `n8n_autofix_workflow` if validation finds problems
6. `n8n_update_partial_workflow` with `activateWorkflow` to enable

### Most Common Tool Patterns

```
search_nodes → get_node                              (node discovery)
n8n_create_workflow → n8n_validate_workflow           (create + validate)
n8n_update_partial_workflow → n8n_validate_workflow   (edit + validate, most common)
```

### 5 Workflow Patterns

1. **Webhook Processing**: Webhook → Switch/IF → Process → Respond to Webhook
2. **HTTP API Integration**: Trigger → HTTP Request → Transform → Output
3. **Database Operations**: Trigger → Query → Transform → Store
4. **AI Agent Workflows**: AI Agent node with tool/memory connections (8 AI connection types)
5. **Scheduled Tasks**: Schedule Trigger → Fetch → Process → Notify

### JavaScript Code Node

```javascript
// Access input data
const items = $input.all();           // All items (Run Once mode)
const item = $input.item;             // Current item (Run Once per Item)

// Webhook data - ALWAYS under .body
const body = items[0].json.body;

// Must return array of objects with json key
return items.map(item => ({
  json: { processed: item.json.body.name }
}));

// HTTP requests
const response = await $helpers.httpRequest({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: { 'Authorization': 'Bearer token' }
});
```

### Python Code Node

```python
# Access input (note underscore prefix, not dollar sign)
items = _input.all()
item = _input.item

# CRITICAL: No external libraries (no requests, pandas, numpy)
# Use standard library only: json, datetime, re, math, etc.
import json
data = json.loads(items[0].json['body'])

# Return format
return [{"json": {"result": data}}]
```

### Node Configuration Rules

- Properties have dependencies (e.g., `sendBody: true` requires `contentType`)
- Always check `get_node` output for required fields per operation
- Credential nodes need `credentials` object with `id` and `name`
- Switch node outputs map to array indices in connections

### Validation

- Use `validate_workflow` after every create/update
- Common false positive: credential validation (credentials are checked at runtime, not build time)
- The validation-then-fix loop: validate → read errors → fix → re-validate
- `n8n_autofix_workflow` handles ~70% of common issues automatically

## Working with This Repository

### When Adding New Skills
1. Create skill directory under `n8n-skills/skills/`
2. Write `SKILL.md` with frontmatter (name, description)
3. Add reference files as needed
4. Create 3+ evaluations in `n8n-skills/evaluations/`

### Skill Files

Each skill's `SKILL.md` contains the full expert knowledge. When you need deep guidance on a topic, read the relevant skill file:

| Topic | File |
|-------|------|
| Expression syntax | `n8n-skills/skills/n8n-expression-syntax/SKILL.md` |
| MCP tool usage | `n8n-skills/skills/n8n-mcp-tools-expert/SKILL.md` |
| Workflow patterns | `n8n-skills/skills/n8n-workflow-patterns/SKILL.md` |
| AI Agent nodes | `n8n-skills/skills/n8n-ai-agent-builder/SKILL.md` |
| Validation errors | `n8n-skills/skills/n8n-validation-expert/SKILL.md` |
| Node configuration | `n8n-skills/skills/n8n-node-configuration/SKILL.md` |
| JavaScript code | `n8n-skills/skills/n8n-code-javascript/SKILL.md` |
| Python code | `n8n-skills/skills/n8n-code-python/SKILL.md` |

### Cross-Skill Workflow

When building a complete workflow:
1. Use **Workflow Patterns** knowledge to identify the right architecture
2. Use **AI Agent Builder** knowledge when the workflow needs an `AI Agent` node
3. Use **MCP Tools Expert** knowledge for correct tool calls
4. Use **Node Configuration** knowledge for proper node setup
5. Use **Expression Syntax** knowledge for data mapping between nodes
6. Use **Code JavaScript/Python** knowledge for custom logic in Code nodes
7. Use **Validation Expert** knowledge to validate and fix issues

## Requirements

- n8n-mcp MCP server installed (`npx n8n-mcp`) and configured
- Access to an n8n instance with API key
- Understanding of n8n workflow concepts

## License

MIT License - See LICENSE file for details.
