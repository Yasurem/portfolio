# API Contract Template

**Purpose:** Use this template when defining a new full-stack feature that requires Contract-Driven Parallel Execution (Workflow C). Fill in the sections below, then hand the contract to both the Frontend and Backend agents simultaneously.

---

## Feature Name
<!-- e.g., "AI Chatbot Streaming" -->

## Endpoint Definition

| Field | Value |
|---|---|
| **Method** | `POST` / `GET` / `PUT` / `DELETE` |
| **Path** | `/api/v1/...` |
| **Auth Required** | Yes / No |
| **Response Type** | JSON / SSE Stream / Binary |

## Request Schema (TypeScript)
```typescript
interface RequestBody {
  // Define the exact shape of the request payload
  // Example:
  // message: string;
  // session_id?: string;
}
```

## Response Schema (TypeScript)
```typescript
interface ResponseBody {
  // Define the exact shape of the response payload
  // Example:
  // id: string;
  // content: string;
  // created_at: string;
}
```

## SSE Event Schema (if streaming)
```typescript
// Only fill this out if Response Type is SSE Stream
interface SSEEvent {
  // event: "message" | "done" | "error";
  // data: string;
}
```

## Mock Data (for Frontend agent)
```json
// Provide 2-3 realistic mock responses the Frontend agent can use
// while the Backend agent builds the real endpoint.
// Example:
// { "id": "msg_001", "content": "Hello! How can I help?", "created_at": "2025-01-01T00:00:00Z" }
```

## Error Responses
| Status Code | Meaning | Response Body |
|---|---|---|
| `400` | Bad Request | `{ "detail": "..." }` |
| `401` | Unauthorized | `{ "detail": "Not authenticated" }` |
| `500` | Server Error | `{ "detail": "Internal server error" }` |

## Notes / Constraints
<!-- Any additional context, rate limits, or business rules -->
