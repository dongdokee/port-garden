---
name: subagent-porter
description: Convert an existing agent or subagent definition into multi-provider compatible outputs for Claude Code, Gemini CLI, and Codex. Use when a user asks to port a provider-specific agent prompt to one or more target providers while keeping the body nearly identical and only adapting provider-specific headers and tool names.
---

# Subagent Porter

Use this skill to convert one source agent definition into requested provider formats with high body uniformity.

## Required Clarifying Questions

Ask these questions before writing output files. Do not proceed until answers are explicit.

1. Which providers should be generated?
- Allowed values: `Claude Code`, `Gemini CLI`, `Codex`.
- Generate only requested providers.

2. Which model should be used for each requested provider?
- Confirm one model value per requested provider.

3. What reasoning effort should be used for each requested provider?
- If the provider supports reasoning effort, confirm the exact value.
- If the provider does not support reasoning effort, confirm `N/A`.

If the user says "use defaults," still confirm the concrete default values in one message before generating files.

## Workflow

1. Inspect input
- Read the source agent file.
- Extract source metadata, tool list, and body sections.
- Identify provider-specific lines in the body.

2. Build canonical body
- Preserve section order and behavior constraints.
- Keep body text 90-95% identical across providers.
- Limit provider-specific changes to:
  - header/frontmatter or TOML fields
  - tool-name lines
  - one short tool example line

3. Convert per requested provider
- Use mappings in `references/provider-mappings.md`.
- Use output skeletons in `references/output-templates.md`.
- Write only requested provider files.

4. Apply Codex wiring when Codex is requested
- Create `.codex/agents/<agent-name>.toml`.
- Register `[agents.<agent-name>]` in `.codex/config.toml` with `config_file`.

5. Validate
- Run checks from `references/validation-checklist.md`.
- Validate Gemini `tools` entries against Gemini built-in names; do not invent tool names.
- Ensure body diffs only include allowed differences.
- Ensure unrequested providers are not created.

6. Report
- Return created file paths.
- Return a compact table of confirmed `provider`, `model`, and `reasoning effort`.
- State any explicit assumptions.

## References

- Tool and schema mapping: `references/provider-mappings.md`
- Output skeletons: `references/output-templates.md`
- Validation steps: `references/validation-checklist.md`
