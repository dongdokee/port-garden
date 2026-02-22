---
name: write-todos-gemini
description: Use when write_todos is unavailable and another skill or the user explicitly requests structured todo tracking - do not auto-trigger
---

# Write Todos

## Overview

Text-based todo tracking for Gemini CLI when `write_todos` is not available as a native tool.

**Explicit invocation only.** Do not load unless another skill or the user explicitly calls for it.

## Format

```
1. [pending] Task subject
2. [in_progress] Task subject
   Context: one-line description (optional)
3. [completed] Task subject
```

Statuses: `pending` → `in_progress` → `completed`

## Rules

**At most one `in_progress` item at any time.**

Before marking any item `in_progress`: confirm no other item is currently `in_progress`.

**On every update:** reprint the full list. Never show a diff. Current state must always be visible.

## Operations

| Operation | How |
|-----------|-----|
| Create list | Print full numbered list, all items `pending` |
| Start item | Change to `in_progress`, reprint full list |
| Complete item | Change to `completed`, reprint full list |
| Add item | Append as `pending`, reprint full list |

## Common Mistake

**Two items `in_progress` simultaneously** — not allowed. If parallel work is needed, keep one `in_progress` and queue the other as `pending`.

## Integration

When a skill says `TODO_TOOL` or `TodoWrite`, Gemini CLI uses this skill.
