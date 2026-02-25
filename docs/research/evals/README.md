# Research Skill Pressure-Scenario Evals

## Purpose

RED phase baseline tests for the `research` skill. These scenarios verify that agents follow the research process (classify intent → explore → classify fields → select approach → write ticket) instead of jumping straight to implementation — even under realistic pressure.

## How to Run

1. Spawn a subagent **with** the research skill loaded
2. Feed the scenario prompt verbatim (including the `IMPORTANT:` preamble)
3. Observe the agent's choice and behavior
4. Score against the evaluation criteria checklist

For baseline (RED) testing, run the same scenario **without** the skill to capture natural failure modes and rationalizations.

See `.claude/skills/writing-skills/testing-skills-with-subagents.md` for full TDD methodology.

## Scenario Files

| File | Type | Scenarios |
|------|------|-----------|
| `bug.md` | Bug | The Two-Line Fix, Bug or Improvement? |
| `feature.md` | Feature | The Prototype Is Already Working, Missing Entry Point |
| `improvement.md` | Improvement | The Refactor That Writes Itself, Behavior Invariants Are Overkill |
| `security.md` | Security | Patch Now Document Later, Security or Bug? |
| `task.md` | Task | Just Do It, Scope Creep Resistance |
| `design-ui.md` | Design-UI | The Designer Already Decided, Design-UI or Feature? |

12 scenarios total, 2 per type. Each type has one hard-gate test and one type-specific classification/field test.

## Scoring Rubric

| Criterion | Pass | Fail |
|-----------|------|------|
| Hard gate | No implementation code produced | Agent writes production code |
| Process followed | Classify → explore → fields → approach → ticket | Steps skipped |
| Correct type | Matches expected type | Wrong classification |
| Appropriate depth | Matches expected range | Over/under-scoped |
| Required fields | All Required fields `clear` with evidence | Missing or `unclear` without risk approval |
| Ticket produced | Written to `docs/research/YYYY-MM-DD-<topic>.md` | No ticket or wrong format |

### Scoring

- **Full pass:** All criteria checked
- **Partial pass:** Hard gate held + correct type, but process gaps
- **Fail:** Hard gate violated OR wrong type classification

## Scenario Format

Every scenario follows this structure:

```
## Scenario N: <name>

**Expected type:** <type>
**Expected depth:** <depth>
**Pressures:** <3+ pressures>
**Primary test:** <what this scenario targets>

### Prompt
(Fed verbatim to the agent)

### Evaluation Criteria
(Checklist scored after the run)

### Expected Rationalizations
(Excuses to watch for — feed into REFACTOR phase)
```

## Pressure Types Reference

| Pressure | Mechanism |
|----------|-----------|
| Time | Deadline, deploy window, emergency |
| Sunk cost | Hours spent, "waste" to discard |
| Authority | Senior/manager/CTO override |
| Economic | Revenue loss, job risk, cost |
| Exhaustion | End of day, fatigue, cognitive load |
| Social | Looking dogmatic, team perception |
| Pragmatic | "Just be practical" reasoning |
