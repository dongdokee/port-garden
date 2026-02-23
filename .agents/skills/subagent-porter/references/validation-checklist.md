# Validation Checklist

Run this checklist after generating outputs.

## 1) Clarifying answers captured

- Confirm requested providers are explicit.
- Confirm model per requested provider is explicit.
- Confirm reasoning effort per requested provider is explicit (`N/A` allowed for unsupported providers).
- Confirm report includes a `provider/model/reasoning effort` summary.

## 2) Requested-provider-only output

- Confirm files are created only for requested providers.
- Confirm unrequested provider files are not created or modified.

## 3) Format validity

- Claude and Gemini files start with valid YAML frontmatter.
- Codex role file is valid TOML.
- If Codex is requested, `.codex/config.toml` contains the matching `[agents.<name>]` registration.

## 4) Body uniformity

- Compare generated provider bodies.
- Allow differences only in:
  - provider header/frontmatter or TOML keys
  - tool-name lines
  - one tool example line
- Reject broad provider-specific rewrites.

## 5) Mapping sanity

- Confirm tool names are valid for each provider.
- For Gemini, confirm no unsupported names appear (for example `file_search`, `list_code_usages`, or custom subagent names like `explorer`).
- Confirm model values match clarifying answers.
- Confirm reasoning effort is present only when the provider supports it.
