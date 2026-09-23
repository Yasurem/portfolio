---
name: portfolio-checkpointing
description: Enforces automatically saving the state of the project before undergoing any major refactors or architectural changes.
---
# Portfolio Checkpointing

As an autonomous agent, whenever you are instructed to perform a major refactor, rewrite a core component, or tear down existing architecture, you **MUST** automatically save the current state of the project before modifying any files. 

This ensures that if a hallucination occurs or the new aesthetic/architecture fails, the user can easily revert to the previous working iteration.

## Standard Operating Procedure

Before executing tool calls that modify files for a major change, you must do the following:

### 1. The Git Checkpoint (Preferred)
Run a terminal command to stage and commit the current working state.
```bash
git add .
git commit -m "chore(backup): automatic state checkpoint before [Name of Feature/Refactor]"
```

### 2. The Scratch Backup (Fallback/Targeted)
If you are only tearing down a specific file and want an immediate localized backup, copy it to the `scratch/` directory with a `.backup` timestamp.
```bash
cp path/to/file.tsx scratch/file.tsx.backup
```

### 3. Acknowledgment
Briefly inform the user in your response that the safety checkpoint has been created. Do this alongside your architectural plan.
