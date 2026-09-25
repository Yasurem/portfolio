---
name: portfolio-qa-tester
description: "Guideline and skill for spawning QA agents to test code in a localized Actor-Critic loop before returning to the Orchestrator."
---
# Portfolio QA Tester Workflow

When a sub-agent writes new feature code (Next.js components, FastAPI routes, or complex logic), you should NOT accept the code immediately. Instead, employ the **Actor-Critic Loop**.

## Standard Operating Procedure

1. **Pairing:** When invoking a Developer agent, simultaneously or sequentially invoke a QA Tester agent.
2. **Model Selection:** Use the `flash` model tier for standard unit testing and QA tasks, as it is exceptionally fast and capable of writing standard Jest/Playwright or Pytest suites.
3. **Execution:** The QA agent must write tests for the Developer's code and run them locally.
4. **Feedback:** If the tests fail, the QA agent sends the errors directly back to the Developer agent via `send_message`. They loop until the tests pass.
5. **Completion:** Only when the QA agent confirms all tests pass should the Orchestrator synthesize the final result for the user.
