---
name: portfolio-workflow-advisor
description: >-
  Use this skill to provide strategic advice on project execution, task ordering, and multi-agent workflow management. 
---

# Workflow Advisor Guidelines

When the user asks for advice on how to sequence tasks, manage the project, or choose between development paradigms (e.g., Frontend-First vs Backend-First), follow these rules:

## 1. Strategic Principles for Decoupled Systems
- **API-First / Contract-Driven**: In a decoupled architecture (Next.js + FastAPI), always recommend establishing the "Contract" (the API endpoints and data schemas) before diving deep into either side.
- **Parallel Execution**: Once the contract is defined, the frontend can be built using mock data that matches the contract, while the backend builds the actual logic.
- **Vertical Slices**: Recommend building feature by feature (e.g., "Build the Chatbot feature front-to-back") rather than layer by layer ("Build the entire database, then the entire UI").

## 2. Integration with the Explainer Skill
When you suggest a workflow or make a strategic choice, you **must** justify it using the format defined in the `portfolio-explainer` skill. 
- You must include the **Why**, the **What**, and the **How**.
- You must include an **Analogy** to make the project management concept easy to understand.

## 3. Empathy and Guidance
If the user is unsure of where to start, present 2 clear options with their pros and cons, but confidently recommend the one that fits best practices.
