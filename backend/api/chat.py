from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import asyncio
import json
from models.chat import ChatRequest

router = APIRouter()

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    async def event_generator():
        dummy_sentence = "Hello! I am a mocked streaming response from FastAPI."
        words = dummy_sentence.split(" ")
        for i, word in enumerate(words):
            # add space after word except for the last one if we want, but simple is fine
            chunk = word + (" " if i < len(words) - 1 else "")
            data = {"chunk": chunk, "status": "streaming"}
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(0.1)
        
        done_data = {"chunk": "", "status": "done"}
        yield f"data: {json.dumps(done_data)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
