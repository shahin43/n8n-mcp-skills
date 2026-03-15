---
name: n8n-ai-agent-builder
description: Specialized guide for creating and updating n8n AI Agent nodes. Use when building chat agents, tool-using agents, action agents, or any workflow that needs an @n8n/n8n-nodes-langchain.agent node with language model, tools, memory, output parser, or fallback model connections.
---

# n8n AI Agent Node Builder

Build production-ready AI Agent nodes in n8n.

Use this skill when the task is specifically about creating, wiring, or hardening an `AI Agent` node, not just generic workflow architecture.

---

## What This Skill Covers

- Choosing the right AI Agent topology
- Configuring the `AI Agent` node itself
- Wiring language models, tools, memory, output parsers, and fallback models
- Writing system messages and tool descriptions that actually work
- Handling action-taking agents safely
- Updating AI Agent workflows with `n8n-mcp`

For reusable layouts, read [TOPOLOGIES.md](TOPOLOGIES.md).

For system-message and tool-description patterns, read [PROMPT_PATTERNS.md](PROMPT_PATTERNS.md).

---

## Core Constraints

Treat these as defaults unless the user clearly needs something else:

1. The current n8n AI Agent node is a **Tools Agent**. Build around tool use rather than older agent-type variants.
2. Connect **at least one tool** to the agent.
3. Connect **one language model** to `ai_languageModel` before validating.
4. Add a **system message** through `parameters.options.systemMessage`.
5. Use narrow, explicit tool descriptions. The agent decides whether to call tools from those descriptions.
6. For destructive or state-changing actions, require explicit confirmation before the tool call.

---

## Build Sequence

When using `n8n-mcp`, follow this order:

1. Discover the agent node and companion nodes:
   - `get_node({nodeType: "nodes-langchain.agent"})`
   - `search_nodes({query: "chat trigger"})`
   - `search_nodes({query: "memory"})`
   - `search_nodes({query: "tool"})`
2. Pick the topology from [TOPOLOGIES.md](TOPOLOGIES.md).
3. Create the agent node with `promptType`, `text`, and `options.systemMessage`.
4. Add the language model connection with `sourceOutput: "ai_languageModel"`.
5. Add tool connections with `sourceOutput: "ai_tool"`.
6. Add optional memory, output parser, and fallback model connections.
7. Validate the workflow with `validate_workflow` or `n8n_validate_workflow`.

---

## Minimal Agent Node

Use `typeVersion: 3.1` for new workflows.

```json
{
  "id": "agent-node-id",
  "name": "AI Agent",
  "type": "@n8n/n8n-nodes-langchain.agent",
  "typeVersion": 3.1,
  "position": [640, 320],
  "parameters": {
    "promptType": "define",
    "text": "={{ $json.query }}",
    "options": {
      "systemMessage": "You are a reliable workflow assistant. Use tools only when needed. Do not claim actions were completed unless a tool confirms success."
    }
  }
}
```

Add the companion connections explicitly:

```json
{
  "type": "addConnection",
  "source": "OpenAI Chat Model",
  "target": "AI Agent",
  "sourceOutput": "ai_languageModel"
}
```

```json
{
  "type": "addConnection",
  "source": "Postgres Tool",
  "target": "AI Agent",
  "sourceOutput": "ai_tool"
}
```

Optional connections:

- `ai_memory` for conversation state
- `ai_outputParser` for structured output
- second `ai_languageModel` with fallback enabled

---

## Prompt Source Rules

Use `promptType: "auto"` only when the workflow is driven by a connected chat trigger.

Use `promptType: "define"` when:

- the workflow starts from a webhook, form, Slack event, schedule, or any non-chat trigger
- you need to map a custom field such as `={{ $json.query }}`
- you want deterministic control over what reaches the agent

Default to `define` unless the user explicitly wants a chat-trigger-driven agent.

---

## Production Defaults

### System Message

Every production agent should define:

- role
- scope
- tool-use rules
- safety constraints
- output expectations

Keep it operational. Avoid vague persona prompts.

Good structure:

1. Role
2. Responsibilities
3. Tool usage rules
4. Safety rules
5. Output contract

Use [PROMPT_PATTERNS.md](PROMPT_PATTERNS.md) for templates.

### Tool Descriptions

Tool descriptions should answer:

- when to call the tool
- what input shape is required
- what the tool returns
- what the tool must never do without confirmation

Bad tool descriptions produce bad agent behavior faster than weak model choice.

### Memory

Add memory for:

- chatbots
- multi-turn assistants
- workflows where the user will follow up

Skip memory for:

- single-shot classification
- one-off extraction
- stateless backend helpers

### Output Parsers

Use an output parser when downstream nodes require deterministic structure.

Examples:

- router agents returning `{ "route": "sales" }`
- extraction agents returning strict JSON
- action proposal agents returning arrays of IDs

Do not rely on plain markdown when a later node needs machine-readable fields.

### Fallback Models

Enable fallback when the workflow is user-facing or business-critical.

This is especially useful for:

- chat support
- Slack bots
- always-on assistants
- workflows with expensive tool chains that should not fail due to one model outage

---

## Safe Action Agents

Action-taking agents are the easiest place to introduce unsafe behavior.

For any tool that archives, deletes, disables, updates, or sends externally:

1. In the system message, state that the agent must gather targets and ask for confirmation first.
2. In the tool description, repeat that the tool is only valid after confirmation.
3. Make the tool input explicit and narrow.
4. Prefer IDs over free-form names.
5. Return acknowledgement data from the tool so the agent can report real outcomes.

Pattern:

- analyze request
- fetch candidate records
- summarize proposed action
- ask for confirmation
- only then invoke the tool

If the tool is still in mock mode, say so in both the system message and tool description.

---

## MCP Update Patterns

For workflow JSON, use:

- Agent node type: `@n8n/n8n-nodes-langchain.agent`
- Chat model node type: provider-specific LangChain node
- Tool nodes connected with `sourceOutput: "ai_tool"`
- Memory nodes connected with `sourceOutput: "ai_memory"`
- Output parser nodes connected with `sourceOutput: "ai_outputParser"`

Examples:

```javascript
n8n_update_partial_workflow({
  id,
  operations: [
    {
      type: "addConnection",
      source: "OpenAI Chat Model",
      target: "AI Agent",
      sourceOutput: "ai_languageModel"
    },
    {
      type: "addConnection",
      source: "Code Tool",
      target: "AI Agent",
      sourceOutput: "ai_tool"
    },
    {
      type: "addConnection",
      source: "Conversation Memory",
      target: "AI Agent",
      sourceOutput: "ai_memory"
    }
  ]
})
```

For fallback models, connect the second model to the agent as another `ai_languageModel` connection and enable the fallback option on the agent node.

---

## Validation Checklist

- Agent node has `typeVersion: 3.1`
- Agent has `text` configured
- Agent has `options.systemMessage`
- Agent has one connected language model
- Agent has at least one connected tool
- `promptType` matches the trigger style
- Output parser is connected if strict JSON is required
- Destructive tools include confirmation rules
- Workflow validates after every update

---

## Common Mistakes

### 1. Building an agent with no tools

The current AI Agent node is for tool-using flows. If the task is pure prompting with no tools, consider whether a simpler LLM pattern is the better fit.

### 2. Forgetting the system message

Without a system message, the agent may still run, but it will be much less predictable.

### 3. Using `auto` prompt type in non-chat workflows

This breaks easily when the workflow starts from webhook or transformed data.

### 4. Vague tool descriptions

If the description says only "query database", expect poor tool selection and poor query scope.

### 5. Letting action tools accept loose input

Use explicit objects such as:

```json
{
  "action": "workflow_action",
  "values": ["workflow_id_1", "workflow_id_2"]
}
```

### 6. Forgetting AI connection types in MCP updates

`main` is not enough for language models, tools, memory, or parsers. Use the correct `sourceOutput`.

---

## When to Use Other Skills

- Use `n8n-workflow-patterns` to choose the broader architecture
- Use `n8n-mcp-tools-expert` to find nodes and update workflows
- Use `n8n-node-configuration` for operation-specific tool node setup
- Use `n8n-validation-expert` when the workflow fails validation
- Use `n8n-expression-syntax` when mapping prompt input or downstream fields

This skill is for the agent node itself and its immediate AI wiring.
