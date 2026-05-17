import os
import time
import json
import uuid
import requests
import functools
import asyncio
from datetime import datetime
from typing import Any, Callable, Dict, Optional, Union
from contextlib import contextmanager, asynccontextmanager

class FiveToOneClient:
    def __init__(self, api_key: Optional[str] = None, host: str = "https://5to1r.com"):
        self.api_key = api_key or os.environ.get("FIVETOONE_API_KEY")
        if not self.api_key:
            raise ValueError("FIVETOONE_API_KEY must be provided or set as an environment variable")
        self.host = host.rstrip("/")
        self.ingest_url = f"{self.host}/api/ingest"

    def _send_span(self, span: Dict[str, Any]):
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            # Fire and forget / non-blocking ideally, but for MVP we use requests with short timeout
            requests.post(self.ingest_url, headers=headers, json=span, timeout=2)
        except Exception as e:
            # Never crash the agent due to telemetry failure
            print(f"5to1r Warning: Failed to ingest span: {e}")

    def ingest(self, **kwargs):
        span = {
            "spanId": str(uuid.uuid4()),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "metadata": {},
            **kwargs
        }
        self._send_span(span)

def trace_agent(client: Optional[FiveToOneClient] = None):
    """
    Decorator to wrap an agent's main entry point.
    Automatically handles runId generation and run_end span.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            nonlocal client
            if client is None:
                client = FiveToOneClient()
            
            run_id = str(uuid.uuid4())
            start_time = time.time()
            
            # Contextual runId for child spans (simplified for MVP)
            os.environ["FIVETOONE_CURRENT_RUN_ID"] = run_id
            
            try:
                result = await func(*args, **kwargs)
                latency_ms = int((time.time() - start_time) * 1000)
                client.ingest(
                    runId=run_id,
                    spanType="run_end",
                    output=json.dumps(result) if result else "",
                    latencyMs=latency_ms,
                    costUsd=0, # Aggregated on server
                )
                return result
            except Exception as e:
                latency_ms = int((time.time() - start_time) * 1000)
                client.ingest(
                    runId=run_id,
                    spanType="error",
                    output=str(e),
                    latencyMs=latency_ms,
                    costUsd=0,
                )
                raise e

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            # Sync version of the decorator
            nonlocal client
            if client is None:
                client = FiveToOneClient()
            
            run_id = str(uuid.uuid4())
            start_time = time.time()
            os.environ["FIVETOONE_CURRENT_RUN_ID"] = run_id
            
            try:
                result = func(*args, **kwargs)
                latency_ms = int((time.time() - start_time) * 1000)
                client.ingest(
                    runId=run_id,
                    spanType="run_end",
                    output=json.dumps(result) if result else "",
                    latencyMs=latency_ms,
                    costUsd=0,
                )
                return result
            except Exception as e:
                latency_ms = int((time.time() - start_time) * 1000)
                client.ingest(
                    runId=run_id,
                    spanType="error",
                    output=str(e),
                    latencyMs=latency_ms,
                    costUsd=0,
                )
                raise e

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    return decorator

# Helper functions for capturing specific span types
def llm_call(input_data: Any, output_data: Any, model_id: str, cost_usd: float, latency_ms: int, client: Optional[FiveToOneClient] = None):
    if client is None: client = FiveToOneClient()
    client.ingest(
        runId=os.environ.get("FIVETOONE_CURRENT_RUN_ID", "unknown"),
        spanType="llm_call",
        input=json.dumps(input_data) if not isinstance(input_data, str) else input_data,
        output=json.dumps(output_data) if not isinstance(output_data, str) else output_data,
        modelId=model_id,
        costUsd=cost_usd,
        latencyMs=latency_ms
    )

def tool_call(tool_name: str, input_data: Any, output_data: Any, latency_ms: int, client: Optional[FiveToOneClient] = None):
    if client is None: client = FiveToOneClient()
    client.ingest(
        runId=os.environ.get("FIVETOONE_CURRENT_RUN_ID", "unknown"),
        spanType="tool_call",
        toolName=tool_name,
        input=json.dumps(input_data) if not isinstance(input_data, str) else input_data,
        output=json.dumps(output_data) if not isinstance(output_data, str) else output_data,
        latencyMs=latency_ms,
        costUsd=0
    )
