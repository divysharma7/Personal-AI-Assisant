# Simulated Interviews: Grill-Me Run (SYNTHETIC)

> **Status: synthetic. Not evidence.** Written by Claude on 11 Oct 2026 by role-playing three personas against the 12-question guide from the Phase 1 brief. No real person said any of this. Use it to sharpen hypotheses and fix the interview guide. Never quote it in the case study as participant evidence, and never put these lines in quotation marks next to a name in the published version.

## Who was simulated

| Persona | Source | Role in the test |
|---|---|---|
| Ananya, Deliberate Planner | Phase 2 provisional persona A | Control-seeking, plans by hand, distrusts auto-schedulers |
| Rohan, Adaptive Executor | Phase 2 provisional persona B | Speed-seeking, AI-comfortable, abandons anything needing daily grooming |
| Meera, Satisfied Minimalist | New. Added as the Phase 1 counterweight | Calendar plus one to-do list, no complaints. Tests whether the problem exists for everyone |

## How the grilling worked

Each persona got the main questions, then one follow-up aimed at the answer that sounded most like a polished story. The rule was to push on anything that sounded rehearsed until it turned into a specific recent day.

---

## Ananya (Deliberate Planner)

**Q: Walk me through yesterday, from first checking work to stopping.**
Opened the calendar first, then the task tool, then chat. Picked two priorities, blocked 10 to 12 for the first. A design review moved from 3 to 11:30, so the block collapsed.

**Follow-up: What did you do when the block collapsed?**
Dragged the task to the afternoon, then found the afternoon was full, then moved a different task to today's "maybe" list. About 15 minutes of shuffling, and she wasn't sure the new plan was better.

**Q: Which parts do you maintain only because another tool requires it?**
Copies tasks from the project tool into the personal list so they show up in one place. Two lists, one reality.

**Q: Would you let AI rearrange your day?**
Only if she can see what moved and why, and undo it. "Silent" moves are a no. She'd accept a proposed plan she can approve.

**Follow-up: Have you actually tried an auto-scheduler, or is that a guess?**
Tried one for two weeks. Stopped after it moved a deep-work block over a call prep she had pinned in her head, not on the calendar. The tool couldn't know.

**Q: Where do exercise and learning live?**
In a habit app, never on the work calendar. They get dropped first on heavy days.

**Q: One question at 10 AM, 2 PM, 7 PM?**
10 AM: what is the one thing I do first? 2 PM: what still fits? 7 PM: what carries over, and to when?

## Rohan (Adaptive Executor)

**Q: Walk me through yesterday.**
Didn't plan in the morning. Worked from whatever was open in the repo and chat. Ended the day unsure what he'd finished.

**Follow-up: You said you don't plan. What did you do at 2 PM when something urgent came in?**
Switched, forgot the original task for most of a day, found it Thursday in a stale tab. He called this normal.

**Q: What makes your plan wrong by afternoon?**
There is no plan to be wrong. The failure is losing the thread, not a broken schedule.

**Q: Tell me about a time automation felt useful.**
Auto-summarised standup notes. Zero setup, and it helped without being asked.

**Q: Tell me about a time it felt wrong.**
A task app that asked him to set priority, estimate, project and label on every item. He quit it in a week.

**Follow-up: Would you open a "Today" screen each morning?**
Probably not on day 10. He'd open it if it told him something he didn't already know, like "you left this half-done on Tuesday".

**Q: Where do personal routines live?**
Nowhere. Evening work expands.

## Meera (Satisfied Minimalist)

**Q: Walk me through yesterday.**
Calendar for meetings, one plain to-do list, ten items max. Crossed off seven. Moved three to today without thinking about it.

**Follow-up: What would make you try something new?**
Nothing right now. If her team's meeting load doubled, maybe. She does not feel the problem.

**Q: What would make an all-in-one app feel overwhelming?**
Anything that shows every commitment at once. Her list is short on purpose.

**Q: Would you let AI rearrange your day?**
No need. Her day doesn't need rearranging. A suggestion would feel like noise.

---

## What the run changed

| Hypothesis | Before | After the simulation | Needs a real interview to confirm |
|---|---|---|---|
| Re-planning is the critical failure moment | Plausible | Strengthened for Ananya. For Rohan the failure is earlier: no plan, so no re-plan | Yes. Do Rohan-types plan at all? |
| Advisory AI beats silent AI | Low-Medium | Held, with a sharper cause: the tool can't see commitments that live in the user's head | Yes |
| Consolidation reduces overwhelm | Challenged | Meera shows the problem may not exist for light-load users | Yes. Size the segment |
| Users want a calm Today screen | Assumed | Weakened for Rohan. Value comes from the system noticing dropped threads, not from a daily ritual | Yes |
| Personal routines lose to work | Plausible | Held for both Ananya and Rohan | Yes |

## Two findings worth a real test

1. **Two different problems may be hiding under one HMW.** Ananya's pain is reconciling a plan that broke. Rohan's pain is never having a plan, then losing a task. One daily-orchestration product may serve Ananya well and leave Rohan cold. This is a Phase 3 scoring risk.
2. **The invisible-commitment problem.** Ananya's auto-scheduler failed because a pinned-in-her-head priority wasn't on any calendar. This points to a design direction ("let me tell the system what's firm") that none of the four competitors' pricing pages mention.

## Fixes to the real interview guide

- Add a screening question that separates "plans every morning" from "never plans". Without it, Rohan-types get lumped in with Ananya-types.
- Ask "when did you last lose a task for more than a day?" It surfaced the Rohan failure faster than the planning questions did.
- Drop question 10 (one screen, three times of day) as an opener. It produced rehearsed answers. Use it last.
- Add one question about commitments that exist only in the user's head.

## Limits of this run

- Three invented people answering in the voices their descriptions imply. They will agree with the hypotheses that wrote them. Treat any "confirmation" here with suspicion, and treat the surprises (Rohan's "no plan", Meera's "no problem") as the useful output.
- Meera was not in the original file. She exists only to stress-test the claim, not to represent a measured segment.
