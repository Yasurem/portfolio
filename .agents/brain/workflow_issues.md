# Workflow Issues & Recommendations

**Logged:** 2026-09-25  
**Source:** Multi-Agent Workflow Effectiveness Audit  
**Status:** Pending

---

## 🔴 Critical

### 1. Consolidate State Files — Kill `PROJECT_STATE.md`
- `PROJECT_STATE.md` and `current_focus.md` serve the same purpose but diverge.
- `PROJECT_STATE.md` is stale (last updated Sep 22). Nobody updates it.
- **Fix:** Delete `PROJECT_STATE.md`. Promote `current_focus.md` as THE single state file. Update `GEMINI.md` step 6 to say "update `.agents/brain/current_focus.md` AND `AUDIT_LOG.md`" — nothing else.

### 2. Add Complexity Gate to `GEMINI.md`
- Current rules apply full 6-step ceremony to ALL tasks (trivial and complex alike).
- Causes ~5.6x token overhead on medium tasks, ~10x on trivial tasks.
- **Fix:** Add explicit thresholds:
  - **Trivial** (do it yourself): Single-file fix, typo, CSS tweak, simple bug. Skip steps 1 & 5.
  - **Medium** (1 sub-agent): New component, new hook, new route. Skip step 1 (Devil's Advocate).
  - **Complex** (multi-agent): Full-stack feature, 5+ file refactor, cross-domain work. Full ceremony.

---

## 🟡 Important

### 3. Prune Dead Skills
- 5 of 15 skills (~33%) have never been materially used but consume system prompt space every turn.
- **Move to `skills/_archived/`:**
  - `portfolio-workspace-manager`
  - `portfolio-qa-vision-tester`
  - `portfolio-integration-auditor`
  - `portfolio-explainer`
  - `portfolio-supabase-db` (no migrations exist yet)

### 4. Fix or Kill `STRUCTURE.md`
- Lists phantom directories (`animations/`, `ui/`) that don't exist.
- Missing real directories (`hero/`, `home/`, `about/`, `layout/`).
- **Fix:** Either automate it (run `tree` and write output) or delete it. Stale structure is worse than none.

### 5. Sync `ROADMAP.md` with Reality
- Says "Iteration 1: Walking Skeleton" but project is deep into Iterations 2 and 4.
- Git log shows: working 3D Rubik's cube, Chat UI, cinematic GSAP transitions, Storybook.
- **Fix:** Update once to mark completed items and reflect current phase.

### 6. Update `AUDIT_LOG.md`
- Stopped logging at Sep 22. 14+ days of work unlogged.
- All Rubik's cube work, GSAP transitions, Storybook setup, chat MVP — none recorded.

---

## 🟢 Nice to Have

### 7. Add Staleness Detection
- If `current_focus.md` has a "Last Updated" timestamp older than 3 days, the orchestrator should flag it and ask the user before trusting its contents.

### 8. Consider Collapsing Brain Files into Single Manifest
- `LLM_CONTEXT.md` + `current_focus.md` + `architecture.md` + `art_direction.md` could be one `PROJECT_MANIFEST.md` (< 100 lines).
- The cost of 4 separate `view_file` calls often exceeds the cost of reading one slightly larger file.
