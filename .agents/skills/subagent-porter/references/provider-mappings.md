# Provider Mappings

Use this file to map tools and metadata fields while keeping body content consistent.

## Provider support matrix

| Provider | File format | Model field | Reasoning effort field |
| --- | --- | --- | --- |
| Claude Code | Markdown + YAML frontmatter | `model` | N/A |
| Gemini CLI | Markdown + YAML frontmatter | `model` | N/A |
| Codex | TOML role config | `model` | `model_reasoning_effort` |

## Tool-name mapping guide

Map source intent to provider-native tool names. Keep capability intent intact even when names differ.

| Intent | Claude Code | Gemini CLI | Codex |
| --- | --- | --- | --- |
| Keyword/code search | `Grep` | `grep_search` | `functions.exec_command` with `rg` |
| File discovery | `Glob` | `file_search` | `functions.exec_command` with `rg --files` or `find` |
| Symbol usage exploration | `Grep` + targeted reads | `list_code_usages` | `functions.exec_command` with `rg` patterns |
| File read | `Read` | `read_file` | `functions.exec_command` with `sed`/`cat` |
| Parallel first search batch | parallel tool calls where available | parallel tool calls where available | `multi_tool_use.parallel` with multiple `functions.exec_command` calls |

## Header/frontmatter mapping guide

### Claude Code frontmatter

- `name`
- `description`
- `tools`
- `model`
- `maxTurns` (optional)

### Gemini CLI frontmatter

- `name`
- `description`
- `kind` (`local`)
- `tools`
- `model`
- `max_turns` (optional)

### Codex role TOML

- `model`
- `model_reasoning_effort` (when confirmed)
- `sandbox_mode` (`read-only` for explorer-style agents)
- `developer_instructions` (body text)

Codex registration in `.codex/config.toml`:

- `[agents.<agent-name>]`
- `description`
- `config_file = "agents/<agent-name>.toml"`

