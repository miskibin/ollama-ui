import asyncio
from typing import AsyncIterable, Awaitable
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
from langchain_ollama.llms import OllamaLLM
from langchain.callbacks import AsyncIteratorCallbackHandler
import ollama

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    model: str
    prompt: str
    system: Optional[str] = None
    stream: Optional[bool] = True
    options: Optional[Dict[str, Any]] = None


@app.get("/models")
async def get_models():
    try:
        models = ollama.list()
        return {"models": models["models"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def send_message(request: GenerateRequest) -> AsyncIterable[str]:
    callback = AsyncIteratorCallbackHandler()
    llm = OllamaLLM(
        base_url="http://localhost:11434",
        model=request.model,
        streaming=True,
        callback_manager=callback,
    )

    if request.system:
        llm = llm.bind(system=request.system)

    if request.options:
        llm = llm.bind(**request.options)

    async def wrap_done(fn: Awaitable, event: asyncio.Event):
        try:
            await fn
        except Exception as e:
            print(f"Caught exception: {e}")
        finally:
            event.set()

    task = asyncio.create_task(
        wrap_done(
            llm.agenerate([request.prompt]),
            callback.done,
        )
    )

    async for token in callback.aiter():
        yield f"data: {token}\n\n"

    await task


@app.post("/generate")
async def generate(request: GenerateRequest):
    if request.stream:
        return StreamingResponse(send_message(request), media_type="text/event-stream")
    else:
        try:
            llm = OllamaLLM(
                base_url="http://localhost:11434",
                model=request.model,
            )

            if request.system:
                llm = llm.bind(system=request.system)

            if request.options:
                llm = llm.bind(**request.options)

            result = await llm.agenerate([request.prompt])
            return {"response": result.generations[0][0].text}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
