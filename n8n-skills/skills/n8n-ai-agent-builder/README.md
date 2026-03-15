# n8n AI Agent Node Builder

**Stable slug**: `n8n-ai-agent-builder`
**Previous display name**: `n8n AI Agent Builder`

Production guide for creating and updating n8n AI Agent nodes.

---

## Purpose

Teaches coding agents how to build `AI Agent` nodes that are actually usable in production workflows, including prompt design, tool wiring, memory, output parsing, fallback models, and safety rules for action-taking agents.

## Activates On

- ai agent node
- create agent
- chat agent
- tool-using agent
- action agent
- agent memory
- output parser
- fallback model
- system message
- tool description

## File Count

4 files, production-focused coverage for AI Agent node creation

## Dependencies

**n8n-mcp tools**:
- `get_node` for current AI Agent node schema
- `search_nodes` for companion nodes
- `validate_node` for checking the AI Agent config
- `validate_workflow` for end-to-end validation
- `n8n_update_partial_workflow` for AI connection wiring

**Related skills**:
- n8n Workflow Blueprints
- n8n MCP Tooling
- n8n Node Setup & Dependencies
- n8n Validation & Recovery

## Coverage

### Core Topics

- current AI Agent node shape and constraints
- `promptType` selection
- system message design
- tool description design
- memory, output parser, and fallback model wiring
- safe action-agent design

### Reference Files

- `TOPOLOGIES.md` for reusable workflow layouts
- `PROMPT_PATTERNS.md` for prompt and tool-description templates

## Evaluations

3 scenarios:
1. **eval-001**: Build a chat agent with tools and memory
2. **eval-002**: Add output parser and fallback model correctly
3. **eval-003**: Design a safe action-taking agent

## Key Features

✅ Focused specifically on the `AI Agent` node  
✅ Reflects the current tool-using agent model  
✅ Covers `ai_languageModel`, `ai_tool`, `ai_memory`, and `ai_outputParser` wiring  
✅ Emphasizes system-message and tool-description quality  
✅ Includes action-safety guidance for real backend tools  

## Files

- **SKILL.md** - agent-facing workflow and implementation guidance
- **TOPOLOGIES.md** - reusable production layouts
- **PROMPT_PATTERNS.md** - system-message and tool-description templates
- **README.md** - contributor-facing metadata

## Success Metrics

**Expected outcomes**:
- AI Agent nodes are created with the correct companion connections
- agents use tools intentionally rather than unpredictably
- destructive tools are gated by confirmation rules
- structured-output use cases include output parsers
- production workflows validate more reliably

## Reference

- Official n8n docs: `https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/`
