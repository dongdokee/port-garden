# Replacement Guidelines

Intent-based conversion rules for replacing provider-specific expressions with
portable alternatives.

## Intent Mapping

| Intent | Provider-Specific Examples | Intent-Based Replacement |
|--------|---------------------------|--------------------------|
| Ask the user a question | `AskUserQuestion`, `ask_user` | "Ask the user" / "Ask a question" |
| Dispatch a subagent | `Task tool: subagent_type:`, `run_agent` | `` Dispatch the `agent-name` agent: `` |
| Search for files by pattern | `Glob`, `glob` (tool), `find` (tool) | "Search for files matching..." |
| Search codebase content | `Grep`, `grep_search`, `rg` (tool) | "Search the codebase for..." |
| Read a file | `Read` (tool), `read_file`, `read_many_files`, `cat` (tool) | "Read the file" / "Read these files" |
| Search the web | `WebSearch`, `google_search` | "Search the web for..." |
| Fetch a URL | `WebFetch` | "Fetch the URL" / "Retrieve the page" |
| Edit a file | `Edit` (tool), `sed` (tool) | "Modify the file" |
| Create a file | `Write` (tool) | "Create a file" / "Write a file" |
| Run a shell command | `run_shell_command`, `functions.exec_command` | "Run a command" / "Execute in the shell" |
| Parallel execution | `multi_tool_use.parallel`, parallel tool calls | "Run these tasks in parallel" |

## Conversion Principles

1. **Remove the tool name, keep the intent.** The reader should understand what
   to do without knowing which provider they're on.

   Bad: "Use Grep to find all references to the function"
   Good: "Search the codebase for all references to the function"

2. **Convert code block examples to intent-based format.** Replace provider-
   specific invocation syntax with a generic dispatch pattern.

   Bad:
   ```
   Task tool:
     subagent_type: "code-explorer"
     prompt: "Find files related to auth"
   ```

   Good:
   ```
   Dispatch the `code-explorer` agent:
     "Find files related to auth"
   ```

3. **Preserve agent names.** Names like `code-explorer`, `web-researcher`,
   `oracle` are semantic identifiers, not provider-specific. Keep them as-is.

4. **Scan `references/` files too.** Exploration scopes, templates, and other
   reference files often contain tool names in examples or checklists. These
   need the same treatment.

5. **Handle ambiguous words carefully.** Words like `Read`, `Edit`, `Write`,
   `Glob`, `Task`, `glob`, `find`, `cat`, `sed` have everyday English meanings.
   Only replace when they clearly refer to a tool invocation — check for
   surrounding context like backticks, "Use X to", or capitalization in a tool
   list.

6. **Don't over-generalize.** If a sentence says "Use Grep with the pattern
   `foo.*bar`", the replacement should preserve the specificity: "Search the
   codebase for the pattern `foo.*bar`" — not just "Search the codebase."

7. **Frontmatter is out of scope.** The YAML frontmatter (`name`, `description`,
   `tools`, `model`, etc.) is provider-specific by design and managed by
   `subagent-porter`. This skill only transforms the body and reference content.
