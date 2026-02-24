# Provider-Specific Patterns

Detection catalogue for identifying provider-locked expressions in SKILL.md
files and their references. Scan for these patterns to find text that needs
intent-based replacement.

## Claude Code

| Category | Pattern | Example |
|----------|---------|---------|
| Tool name | `Read` (as a tool) | "Use Read to...", "call Read" |
| Tool name | `Edit` | "Use Edit to modify..." |
| Tool name | `Write` | "Use Write to create..." |
| Tool name | `Glob` | "Use Glob to find files..." |
| Tool name | `Grep` | "Use Grep to search..." |
| Tool name | `WebSearch` | "Use WebSearch to..." |
| Tool name | `WebFetch` | "Use WebFetch to..." |
| Tool name | `AskUserQuestion` | "Use AskUserQuestion to..." |
| Tool name | `Task` (as a tool) | "Use Task to dispatch..." |
| Subagent dispatch | `Task tool:` + `subagent_type:` | `Task tool:\n  subagent_type: "code-explorer"` |
| Agent type ref | `subagent_type: "..."` | Provider-specific dispatch syntax |

### Detection hints

- `Read`, `Edit`, `Write`, `Glob`, `Grep` are common English words. Only match
  when used as tool/command references — look for surrounding context like "Use
  X to", "call X", "the X tool", backtick-wrapped `` `X` ``, or capitalized in
  a tool-invocation context.
- `AskUserQuestion`, `WebSearch`, `WebFetch` are unambiguous — always match.
- `Task` is ambiguous — only match when followed by `tool` or `subagent_type`.

## Gemini CLI

| Category | Pattern | Example |
|----------|---------|---------|
| Tool name | `grep_search` | "Use grep_search to..." |
| Tool name | `glob` (as a tool) | "Use glob to find..." |
| Tool name | `read_file` | "Use read_file to..." |
| Tool name | `read_many_files` | "Use read_many_files to..." |
| Tool name | `list_directory` | "Use list_directory to..." |
| Tool name | `google_web_search` | "Use google_web_search to..." |
| Tool name | `run_shell_command` | "Use run_shell_command to..." |
| Tool name | `ask_user` | "Use ask_user to..." |
| Agent dispatch | `run_agent` | `run_agent("code-explorer", ...)` |

### Detection hints

- `glob` is a common term. Only match when used as a tool reference (backtick-
  wrapped, "Use glob to", etc.), not as a general concept ("glob pattern").
- `grep_search`, `read_file`, `read_many_files`, `list_directory`,
  `google_web_search`, `run_shell_command`, `ask_user`, `run_agent` are unambiguous.

## Codex

| Category | Pattern | Example |
|----------|---------|---------|
| Function call | `functions.exec_command` | Codex function call syntax |
| Parallel call | `multi_tool_use.parallel` | Codex parallel execution syntax |
| Shell tool ref | `rg` (as a tool) | "Use `rg` to search..." |
| Shell tool ref | `find` (as a tool) | "Use `find` to locate..." |
| Shell tool ref | `cat` (as a tool) | "Use `cat` to read..." |
| Shell tool ref | `sed` (as a tool) | "Use `sed` to edit..." |

### Detection hints

- `functions.exec_command` and `multi_tool_use.parallel` are unambiguous.
- `rg`, `find`, `cat`, `sed` are real shell commands. Only match when presented
  as the recommended tool for a task (e.g., "Use `rg` to search the codebase"),
  not when mentioned as examples of what NOT to do or in non-tool contexts.
