#!/bin/bash
echo "--- Verifying 1-3 ---"
if [ ! -f "PROJECT_STATE.md" ]; then echo "✅ Number 1: PROJECT_STATE.md is dead."; else echo "❌ PROJECT_STATE.md still exists!"; fi
grep -q "AUDIT_LOG.md" GEMINI.md && echo "✅ Number 1: GEMINI.md Step 6 updated." || echo "❌ GEMINI.md Step 6 missing AUDIT_LOG.md."
grep -q "For Trivial tasks, SKIP Step 1" GEMINI.md && echo "✅ Number 2: Complexity Gate is correct." || echo "❌ Complexity Gate incorrect."
if [ -d ".agents/skills/_archived" ] && [ $(ls -1 .agents/skills/_archived | wc -l) -ge 5 ]; then echo "✅ Number 3: Skills archived."; else echo "❌ Skills not properly archived."; fi
grep -q "portfolio-qa-vision-tester" LLM_CONTEXT.md && echo "❌ LLM_CONTEXT.md still has dead refs!" || echo "✅ Number 3: LLM_CONTEXT.md clean."

echo "--- Checking 4-6 ---"
if [ -f "STRUCTURE.md" ]; then echo "⚠️ Number 4: STRUCTURE.md exists. Need to check if it's stale."; else echo "✅ Number 4: STRUCTURE.md is dead."; fi
echo "ROADMAP status:"
head -n 10 ROADMAP.md | grep "Iteration"
echo "AUDIT_LOG status:"
tail -n 3 AUDIT_LOG.md
