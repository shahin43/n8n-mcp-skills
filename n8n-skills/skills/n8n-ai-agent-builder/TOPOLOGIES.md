# AI Agent Topologies

Use these layouts as defaults when building AI Agent workflows.

## 1. Chat Assistant

Use when the user wants a conversational agent inside n8n chat.

Pattern:

```text
Chat Trigger -> AI Agent -> Respond in chat
                ^    ^    ^
                |    |    |
             Model  Tool Memory
```

Recommended settings:

- `promptType: "auto"`
- memory enabled
- at least one tool connected
- system message optimized for conversation

Good for:

- support bots
- internal copilots
- data assistants

## 2. Workflow-Embedded Agent

Use when the workflow starts from webhook, Slack, form, or transformed input.

Pattern:

```text
Trigger -> Transform -> AI Agent -> Next node
                      ^    ^
                      |    |
                   Model  Tool(s)
```

Recommended settings:

- `promptType: "define"`
- `text: "={{ $json.query }}"` or equivalent
- no memory unless there is a true multi-turn session

Good for:

- Slack request handlers
- triage workflows
- enrichment steps

## 3. Action Proposal Agent

Use when the agent must suggest a change, wait for confirmation, and only then call an action tool.

Pattern:

```text
Trigger -> AI Agent -> Confirmation message
            ^   ^   ^
            |   |   |
         Model Query Tool Action Tool
```

Rules:

- action tool must be narrow
- explicit confirmation required
- tool input should use IDs, not free-form names
- tool can stay in mock mode until the action contract is stable

Good for:

- archive workflow proposals
- disable user proposals
- approval-driven operations

## 4. Structured Output Agent

Use when later nodes need strict fields rather than markdown.

Pattern:

```text
Trigger -> AI Agent -> Set / Switch / HTTP / DB
            ^   ^   ^
            |   |   |
         Model Tool Output Parser
```

Recommended settings:

- connect an output parser via `ai_outputParser`
- make the system message and parser schema agree
- validate downstream mappings

Good for:

- routers
- extractors
- workflow selectors
- tool dispatch planners

## 5. High-Availability Agent

Use when the workflow is user-facing and should survive model outages.

Pattern:

```text
Trigger -> AI Agent
            ^   ^
            |   |
       Primary LM Fallback LM
```

Recommended settings:

- enable fallback on the agent
- connect a primary model and a second model
- keep prompts provider-neutral when possible

Good for:

- customer-facing bots
- Slack assistants
- production support flows
