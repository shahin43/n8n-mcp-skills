# Skills Catalog

This folder contains the source of truth for all skill packages in this repository.

## Naming Model

Each skill has:

- A stable slug for folders, packaging, and evaluations
- A refactored display name for developer-facing docs

Keep the slug stable. Prefer changing the display name first when simplifying language.

## Current Skills

| Stable slug | Display name | Previous label | Evaluation folder | Focus |
|-------------|--------------|----------------|-------------------|-------|
| `n8n-expression-syntax` | `n8n Expressions & Data Mapping` | `n8n Expression Syntax` | `expression-syntax` | Expressions, `$json`, webhook body access |
| `n8n-mcp-tools-expert` | `n8n MCP Tooling` | `n8n MCP Tools Expert` | `mcp-tools` | MCP tool selection, workflow operations |
| `n8n-workflow-patterns` | `n8n Workflow Blueprints` | `n8n Workflow Patterns` | `workflow-patterns` | Reusable workflow architectures |
| `n8n-ai-agent-builder` | `n8n AI Agent Node Builder` | `n8n AI Agent Builder` | `ai-agent-builder` | AI Agent node creation, prompt design, tools, memory, output parsers |
| `n8n-validation-expert` | `n8n Validation & Recovery` | `n8n Validation Expert` | `validation-expert` | Validation loops, false positives, autofix |
| `n8n-node-configuration` | `n8n Node Setup & Dependencies` | `n8n Node Configuration` | `node-configuration` | Operation-aware configuration and dependencies |
| `n8n-code-javascript` | `n8n Code Node JavaScript` | `n8n Code JavaScript` | `code-javascript` | JavaScript Code node patterns |
| `n8n-code-python` | `n8n Code Node Python` | `n8n Code Python Skill` | `code-python` | Python Code node limitations and patterns |

## Folder Anatomy

Every skill folder should follow this shape:

```text
<skill-slug>/
├── SKILL.md
├── README.md
└── supporting reference files
```

Guidelines:

- `SKILL.md` is optimized for agent use
- `README.md` is optimized for contributors
- Supporting files should stay topic-focused
- Favor small, linkable references over one very large document

## When Adding a New Skill

1. Create the new skill folder under `skills/`
2. Add the matching evaluation folder under `evaluations/`
3. Register the skill in this catalog
4. Update any packaging or installation docs affected by the addition
