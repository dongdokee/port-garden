---
name: using-superpowers
description: Use when starting any conversation - establishes how to find and use skills, requiring Skill tool invocation before ANY response including clarifying questions
---

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.
</EXTREMELY-IMPORTANT>

## How to Access Skills

**In Claude Code:** Use the `Skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the Read tool on skill files.

**In Gemini Cli:** Use the `activate_skill` tool. When you invoke a skill, its content is loaded and presented to you—follow it directly. Never use the `read_file` tool on skill files.

**In other environments:** Check your platform's documentation for how skills are loaded.

# Using Skills

## The Rule

**Invoke relevant or requested skills BEFORE any response or action.** Even a 1% chance a skill might apply means that you should invoke the skill to check. If an invoked skill turns out to be wrong for the situation, you don't need to use it.

```dot
digraph skill_flow {
    "User message received" [shape=doublecircle];
    "Plan mode active? (Shift+Tab)" [shape=diamond];
    "About to EnterPlanMode?" [shape=doublecircle];
    "Already brainstormed?" [shape=diamond];
    "Invoke brainstorming skill" [shape=box];
    "Might any skill apply?" [shape=diamond];
    "Invoke Skill tool" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Has checklist?" [shape=diamond];
    "Create TodoWrite todo per item" [shape=box];
    "Follow skill exactly" [shape=box];
    "Respond (including clarifications)" [shape=doublecircle];

    "User message received" -> "Plan mode active? (Shift+Tab)";
    "Plan mode active? (Shift+Tab)" -> "Already brainstormed?" [label="yes"];
    "Plan mode active? (Shift+Tab)" -> "Might any skill apply?" [label="no"];

    "About to EnterPlanMode?" -> "Already brainstormed?";

    "Already brainstormed?" -> "Invoke brainstorming skill" [label="no"];
    "Already brainstormed?" -> "Might any skill apply?" [label="yes"];
    "Invoke brainstorming skill" -> "Might any skill apply?";

    "Might any skill apply?" -> "Invoke Skill tool" [label="yes, even 1%"];
    "Might any skill apply?" -> "Respond (including clarifications)" [label="definitely not"];
    "Invoke Skill tool" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Has checklist?";
    "Has checklist?" -> "Create TodoWrite todo per item" [label="yes"];
    "Has checklist?" -> "Follow skill exactly" [label="no"];
    "Create TodoWrite todo per item" -> "Follow skill exactly";
}
```

```dot
digraph codex_skill_flow {
    "User message received" [shape=doublecircle];
    "Plan Mode active?" [shape=diamond];
    "Is task creative or behavior-changing?" [shape=diamond];
    "Brainstorming already used this turn?" [shape=diamond];
    "Open brainstorming SKILL.md and follow it" [shape=box];
    "Might any listed skill apply? (>=1%)" [shape=diamond];
    "Open selected SKILL.md from available skills list" [shape=box];
    "Announce: 'Using [skill] to [purpose]'" [shape=box];
    "Skill includes checklist?" [shape=diamond];
    "Track checklist with task list tool allowed in current mode" [shape=box];
    "Follow skill instructions exactly" [shape=box];
    "Need clarification from user?" [shape=diamond];
    "Ask via request_user_input (Plan Mode)" [shape=box];
    "Respond or continue work" [shape=doublecircle];

    "User message received" -> "Plan Mode active?";
    "Plan Mode active?" -> "Is task creative or behavior-changing?" [label="yes"];
    "Plan Mode active?" -> "Might any listed skill apply? (>=1%)" [label="no"];

    "Is task creative or behavior-changing?" -> "Brainstorming already used this turn?" [label="yes"];
    "Is task creative or behavior-changing?" -> "Might any listed skill apply? (>=1%)" [label="no"];

    "Brainstorming already used this turn?" -> "Open brainstorming SKILL.md and follow it" [label="no"];
    "Brainstorming already used this turn?" -> "Might any listed skill apply? (>=1%)" [label="yes"];
    "Open brainstorming SKILL.md and follow it" -> "Might any listed skill apply? (>=1%)";

    "Might any listed skill apply? (>=1%)" -> "Open selected SKILL.md from available skills list" [label="yes"];
    "Might any listed skill apply? (>=1%)" -> "Need clarification from user?" [label="definitely not"];

    "Open selected SKILL.md from available skills list" -> "Announce: 'Using [skill] to [purpose]'";
    "Announce: 'Using [skill] to [purpose]'" -> "Skill includes checklist?";
    "Skill includes checklist?" -> "Track checklist with task list tool allowed in current mode" [label="yes"];
    "Skill includes checklist?" -> "Follow skill instructions exactly" [label="no"];
    "Track checklist with task list tool allowed in current mode" -> "Follow skill instructions exactly";
    "Follow skill instructions exactly" -> "Need clarification from user?";

    "Need clarification from user?" -> "Ask via request_user_input (Plan Mode)" [label="yes"];
    "Need clarification from user?" -> "Respond or continue work" [label="no"];
    "Ask via request_user_input (Plan Mode)" -> "Respond or continue work";
}
```

```dot
digraph gemini_cli_skill_flow {
    "User message received" [shape=doublecircle];
    "In Plan Mode or Task requires Planning?" [shape=diamond];
    "Task creative or behavior-changing?" [shape=diamond];
    "Brainstorming already activated?" [shape=diamond];
    "Invoke activate_skill(name='brainstorming')" [shape=box];
    "Might any listed skill apply? (>=1%)" [shape=diamond];
    "Invoke activate_skill(name='...')" [shape=box];
    "Explain intent/strategy (Explain Before Acting)" [shape=box];
    "Follow skill instructions exactly" [shape=box];
    "Plan complete & Ready to implement?" [shape=diamond];
    "Invoke exit_plan_mode(plan_path=...)" [shape=box];
    "Need clarification from user?" [shape=diamond];
    "Invoke ask_user" [shape=box];
    "Respond or proceed with task" [shape=doublecircle];

    "User message received" -> "In Plan Mode or Task requires Planning?";
    "In Plan Mode or Task requires Planning?" -> "Task creative or behavior-changing?" [label="yes"];
    "In Plan Mode or Task requires Planning?" -> "Might any listed skill apply? (>=1%)" [label="no"];

    "Task creative or behavior-changing?" -> "Brainstorming already activated?" [label="yes"];
    "Task creative or behavior-changing?" -> "Might any listed skill apply? (>=1%)" [label="no"];

    "Brainstorming already activated?" -> "Invoke activate_skill(name='brainstorming')" [label="no"];
    "Brainstorming already activated?" -> "Might any listed skill apply? (>=1%)" [label="yes"];
    "Invoke activate_skill(name='brainstorming')" -> "Might any listed skill apply? (>=1%)";

    "Might any listed skill apply? (>=1%)" -> "Invoke activate_skill(name='...')" [label="yes"];
    "Might any listed skill apply? (>=1%)" -> "Need clarification from user?" [label="definitely not"];

    "Invoke activate_skill(name='...')" -> "Explain intent/strategy (Explain Before Acting)";
    "Explain intent/strategy (Explain Before Acting)" -> "Follow skill instructions exactly";
    "Follow skill instructions exactly" -> "Plan complete & Ready to implement?";

    "Plan complete & Ready to implement?" -> "Invoke exit_plan_mode(plan_path=...)" [label="yes"];
    "Plan complete & Ready to implement?" -> "Need clarification from user?" [label="no"];

    "Invoke exit_plan_mode(plan_path=...)" -> "Respond or proceed with task";

    "Need clarification from user?" -> "Invoke ask_user" [label="yes"];
    "Need clarification from user?" -> "Respond or proceed with task" [label="no"];
    "Invoke ask_user" -> "Respond or proceed with task";
}
```

## Red Flags

These thoughts mean STOP—you're rationalizing:

| Thought | Reality |
|---------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "I can check git/files quickly" | Files lack conversation context. Check for skills. |
| "Let me gather information first" | Skills tell you HOW to gather information. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read current version. |
| "This doesn't count as a task" | Action = task. Check for skills. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I know what that means" | Knowing the concept ≠ using the skill. Invoke it. |

## Skill Priority

When multiple skills could apply, use this order:

1. **Process skills first** (brainstorming, debugging) - these determine HOW to approach the task
2. **Implementation skills second** (frontend-design, mcp-builder) - these guide execution

"Let's build X" → brainstorming first, then implementation skills.
"Fix this bug" → debugging first, then domain-specific skills.

## Skill Types

**Rigid** (TDD, debugging): Follow exactly. Don't adapt away discipline.

**Flexible** (patterns): Adapt principles to context.

The skill itself tells you which.

## User Instructions

Instructions say WHAT, not HOW. "Add X" or "Fix Y" doesn't mean skip workflows.
