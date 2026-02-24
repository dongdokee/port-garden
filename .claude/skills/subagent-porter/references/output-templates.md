# Output Templates

Use these skeletons and fill placeholders with confirmed values.

## Common placeholders

- `<AGENT_NAME>`
- `<DESCRIPTION>`
- `<MODEL>`
- `<REASONING_EFFORT_OR_NA>`
- `<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>`

## Claude Code template (`.claude/agents/<agent-name>.md`)

```markdown
---
name: <AGENT_NAME>
description: <DESCRIPTION>
tools:
  - Read
  - Glob
  - Grep
model: <MODEL>
maxTurns: 12
---
<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>
```

## Gemini CLI template (`.gemini/agents/<agent-name>.md`)

```markdown
---
name: <AGENT_NAME>
description: <DESCRIPTION>
kind: local
tools:
  - grep_search
  - glob
  - read_file
  - read_many_files
  - list_directory
model: <MODEL>
max_turns: 12
---
<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>
```

## Codex role template (`.codex/agents/<agent-name>.toml`)

```toml
model = "<MODEL>"
model_reasoning_effort = "<REASONING_EFFORT_OR_NA>"
sandbox_mode = "read-only"
developer_instructions = """
<COMMON_BODY_WITH_MINIMAL_PROVIDER_LINES>
"""
```

If reasoning effort is `N/A` for the requested Codex conversion, omit `model_reasoning_effort` and note why in the report.

## Codex config registration template (`.codex/config.toml`)

```toml
[agents.<AGENT_NAME>]
description = "<DESCRIPTION>"
config_file = "agents/<AGENT_NAME>.toml"
```

Add this block only when Codex output is requested.
