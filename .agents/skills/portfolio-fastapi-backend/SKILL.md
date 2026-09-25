---
name: portfolio-fastapi-backend
description: >-
  Assign this skill to a sub-agent when scaffolding, writing, or debugging the FastAPI backend.
---

# FastAPI Backend Guidelines

## Project Structure
- `api/`: API router definitions and endpoints.
- `core/`: Config settings, security, and dependencies.
- `models/`: Pydantic models for validation (Schemas).
- `services/`: Business logic and external service integrations (e.g., Supabase SDK).
- `main.py`: Application entry point.

## Best Practices
1. **Pydantic V2**: Use Pydantic v2 for all data validation and request/response models.
2. **Async Everything**: Define endpoints with `async def` and use asynchronous libraries whenever possible.
3. **Dependency Injection**: Use FastAPI's `Depends` for reusable logic like database connections or user authentication verification.
4. **Supabase Integration**: Use the official `supabase-py` client (or HTTPX with Supabase REST) within the `services` layer to interact with the database.

## Command Reference
- Run Dev: `uvicorn main:app --reload`
- Test: `pytest`
- Format: `black . && isort .`
