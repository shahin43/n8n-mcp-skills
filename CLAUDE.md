# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **n8n-mcp-and-skills** repository - a collection of Claude Code skills designed to teach AI assistants how to build flawless n8n workflows using the n8n-mcp MCP server.

**Purpose**: 8 complementary skills that provide expert guidance on using n8n-mcp MCP tools effectively for building n8n workflows.

**Architecture**:
- **n8n-mcp MCP Server**: Provides data access (800+ nodes, validation, templates, workflow management)
- **Claude Skills**: Provides expert guidance on HOW to use MCP tools
- **Together**: Expert workflow builder with progressive disclosure

## Repository Structure

```
├── .claude-plugin/        # Claude Code plugin configuration
├── .mcp.json              # MCP server configuration (create from .mcp.json.example)
├── .mcp.json.example      # MCP config template
├── AGENTS.md              # Codex, Cursor - generic coding agent instructions
├── CLAUDE.md              # Claude Code instructions (this file)
├── LICENSE                # MIT License
├── README.md              # Project overview
└── n8n-skills/            # Core skills repository
    ├── skills/            # Individual skill implementations
    │   ├── n8n-expression-syntax/
    │   ├── n8n-mcp-tools-expert/
    │   ├── n8n-workflow-patterns/
    │   ├── n8n-ai-agent-builder/
    │   ├── n8n-validation-expert/
    │   ├── n8n-node-configuration/
    │   ├── n8n-code-javascript/
    │   └── n8n-code-python/
    ├── evaluations/       # Test scenarios for each skill
    ├── docs/              # Documentation
    ├── dist/              # Distribution packages
    └── build.sh           # Build script
```

## The 8 Skills

### 1. n8n Expression Syntax
- Teaches correct n8n expression syntax ({{}} patterns)
- Covers common mistakes and fixes
- Critical gotcha: Webhook data under `$json.body`

### 2. n8n MCP Tools Expert (HIGHEST PRIORITY)
- Teaches how to use n8n-mcp MCP tools effectively
- Covers unified tools: `get_node`, `validate_node`, `search_nodes`
- Workflow management with `n8n_update_partial_workflow`
- New: `n8n_deploy_template`, `n8n_workflow_versions`, `activateWorkflow`

### 3. n8n Workflow Patterns
- Teaches proven workflow architectural patterns
- 5 patterns: webhook, HTTP API, database, AI, scheduled

### 4. n8n AI Agent Builder
- Teaches how to build production-ready AI Agent nodes
- Covers system messages, tools, memory, output parsers, and fallback models
- Focuses on safe action-taking agent design

### 5. n8n Validation Expert
- Interprets validation errors and guides fixing
- Handles false positives and validation loops
- Auto-fix with `n8n_autofix_workflow`

### 6. n8n Node Configuration
- Operation-aware node configuration guidance
- Property dependencies and common patterns

### 7. n8n Code JavaScript
- Write JavaScript in n8n Code nodes
- Data access patterns, `$helpers`, DateTime

### 8. n8n Code Python
- Write Python in n8n Code nodes
- Limitations awareness (no external libraries)

## Key MCP Tools

The n8n-mcp server provides these unified tools:

### Node Discovery
- `search_nodes` - Find nodes by keyword
- `get_node` - Unified node info with detail levels (minimal, standard, full) and modes (info, docs, search_properties, versions)

### Validation
- `validate_node` - Unified validation with modes (minimal, full) and profiles (runtime, ai-friendly, strict)
- `validate_workflow` - Complete workflow validation

### Workflow Management
- `n8n_create_workflow` - Create new workflows
- `n8n_update_partial_workflow` - Incremental updates (17 operation types including `activateWorkflow`)
- `n8n_validate_workflow` - Validate by ID
- `n8n_autofix_workflow` - Auto-fix common issues
- `n8n_deploy_template` - Deploy template to n8n instance
- `n8n_workflow_versions` - Version history and rollback
- `n8n_test_workflow` - Test execution
- `n8n_executions` - Manage executions

### Templates
- `search_templates` - Multiple modes (keyword, by_nodes, by_task, by_metadata)
- `get_template` - Get template details

### Guides
- `tools_documentation` - Meta-documentation for all tools
- `ai_agents_guide` - AI agent workflow guidance

## Important Patterns

### Most Common Tool Usage Pattern
```
search_nodes → get_node (18s avg between steps)
```

### Most Common Validation Pattern
```
n8n_update_partial_workflow → n8n_validate_workflow (7,841 occurrences)
Avg 23s thinking, 58s fixing
```

### Most Used Tool
```
n8n_update_partial_workflow (38,287 uses, 99.0% success)
Avg 56 seconds between edits
```

## Working with This Repository

### When Adding New Skills
1. Create skill directory under `n8n-skills/skills/`
2. Write SKILL.md with frontmatter
3. Add reference files as needed
4. Create 3+ evaluations in `n8n-skills/evaluations/`
5. Test thoroughly before committing

### Skill Activation
Skills activate automatically when queries match their description triggers:
- "How do I write n8n expressions?" → n8n Expression Syntax
- "Find me a Slack node" → n8n MCP Tools Expert
- "Build a webhook workflow" → n8n Workflow Patterns

### Cross-Skill Integration
Skills are designed to work together:
- Use n8n Workflow Patterns to identify structure
- Use n8n MCP Tools Expert to find nodes
- Use n8n Node Configuration for setup
- Use n8n Expression Syntax for data mapping
- Use n8n Code JavaScript/Python for custom logic
- Use n8n Validation Expert to validate

## Requirements

- n8n-mcp MCP server installed and configured
- Claude Code, Claude.ai, or Claude API access
- Understanding of n8n workflow concepts

## Distribution

Available as:
1. **Local Source**: Full source code and documentation
2. **Claude Code Plugin**: `npm install @anthropic/claude-code-plugin-n8n-skills`
3. **Individual Skill Uploads**: For Claude.ai users
