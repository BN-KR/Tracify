import os
import time
import json
import uuid
import functools
import asyncio
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeout
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Union

try:
    import httpx
    _HAS_HTTPX = True
except ImportError:
    _HAS_HTTPX = False

import requests as _requests_fallback


class LatencyBudgetExceeded(Exception):
    """Raised when a call exceeds the latency budget and is aborted."""
    pass


class CancellationToken:
    """
    Cooperative cancellation token passed to the user's call function.

    When the latency budget expires, the SDK sets this token as cancelled.
    The user's call function should check ``token.is_cancelled`` periodically
    and raise or return early if true.

    Example::

        def my_llm_call(model: str, token: CancellationToken) -> dict:
            # Check before making the HTTP call
            if token.is_cancelled:
                raise LatencyBudgetExceeded("Cancelled")
            response = httpx.post(..., timeout=30)
            return response.json()

    For true cancellation of in-flight HTTP requests, the user should use
    ``token`` with an httpx client::

        def my_llm_call(model: str, token: CancellationToken) -> dict:
            with httpx.Client(timeout=30) as client:
                # httpx will close the connection if the client is garbage collected
                # after the timeout fires and this function returns
                return client.post(...).json()
    """

    def __init__(self):
        self._cancelled = threading.Event()

    @property
    def is_cancelled(self) -> bool:
        return self._cancelled.is_set()

    def cancel(self):
        self._cancelled.set()

    def check(self):
        """Raise LatencyBudgetExceeded if cancelled. Call this in long-running loops."""
        if self._cancelled.is_set():
            raise LatencyBudgetExceeded("Call cancelled by latency budget")


@dataclass
class RuntimePolicy:
    enforcement_mode: str = "observe"  # "observe" | "enforce"
    max_cost_per_run: Optional[float] = None
    max_cost_per_day: Optional[float] = None
    fallback_chain: List[str] = field(default_factory=list)
    max_attempts: int = 3
    backoff_ms: float = 1000
    backoff_multiplier: float = 2
    retryable_errors: List[str] = field(default_factory=lambda: ["timeout", "5xx"])
    latency_budget_ms: Optional[int] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "enforcementMode": self.enforcement_mode,
            "maxCostPerRun": self.max_cost_per_run,
            "maxCostPerDay": self.max_cost_per_day,
            "fallbackChain": self.fallback_chain,
            "retryPolicy": {
                "maxAttempts": self.max_attempts,
                "backoffMs": self.backoff_ms,
                "backoffMultiplier": self.backoff_multiplier,
                "retryableErrors": self.retryable_errors,
            },
            "latencyBudgetMs": self.latency_budget_ms,
        }


def _is_retryable_error(error: Exception, retryable_errors: List[str]) -> bool:
    if isinstance(error, LatencyBudgetExceeded):
        return False
    msg = str(error).lower()
    status = getattr(error, "status_code", None) or getattr(error, "status", None) or 0

    for code in retryable_errors:
        if code == "timeout" and ("timeout" in msg or "timed out" in msg):
            return True
        if code == "5xx" and isinstance(status, int) and 500 <= status < 600:
            return True
        if code == "429" and (status == 429 or "rate limit" in msg or "too many requests" in msg):
            return True
        if code == "rate_limit" and (status == 429 or "rate limit" in msg or "throttl" in msg):
            return True
        if code == "overloaded" and ("overloaded" in msg or "capacity" in msg or "busy" in msg):
            return True
    return False


def _is_latency_abort(error: Exception) -> bool:
    return isinstance(error, LatencyBudgetExceeded)


_EXECUTOR = ThreadPoolExecutor(max_workers=4, thread_name_prefix="tracify-latency")


def _run_with_timeout(
    func: Callable[[CancellationToken], Any],
    timeout_ms: Optional[int],
) -> Any:
    """
    Run func(token) in a thread with a cooperative timeout.

    The function receives a CancellationToken. When the timeout fires,
    the token is set to cancelled. The function is responsible for checking
    token.is_cancelled (or calling token.check()) and exiting cleanly.

    If the function does not check the token, it will continue running in
    the background after LatencyBudgetExceeded is raised. This is the same
    behavior as TS's AbortController when the user's call ignores the signal,
    but in Python the "background" thread is more visible.

    Returns the function's result, or raises LatencyBudgetExceeded on timeout.
    """
    if timeout_ms is None:
        token = CancellationToken()
        return func(token)

    token = CancellationToken()
    result = [None]
    exception = [None]

    def target():
        try:
            result[0] = func(token)
        except Exception as e:
            exception[0] = e

    future = _EXECUTOR.submit(target)
    try:
        future.result(timeout=timeout_ms / 1000)
    except FuturesTimeout:
        token.cancel()
        # Give the function a brief window to notice the cancellation
        # and clean up (e.g., close HTTP connections).
        try:
            future.result(timeout=0.5)
        except (FuturesTimeout, Exception):
            pass
        raise LatencyBudgetExceeded(
            f"Call exceeded latency budget of {timeout_ms}ms. "
            "The underlying call may still be running in the background."
        )
    except Exception as e:
        if exception[0] is not None:
            raise exception[0]
        raise

    if exception[0] is not None:
        raise exception[0]

    return result[0]


class TracifyClient:
    REGION_HOSTS = {
        "eu": "https://eu.cloud.tracify.tech",
        "us": "https://us.cloud.tracify.tech",
    }

    def __init__(self, api_key: Optional[str] = None, host: Optional[str] = None, project_id: Optional[str] = None, region: Optional[str] = None):
        self.api_key = api_key or os.environ.get("TRACIFY_API_KEY")
        if not self.api_key:
            raise ValueError("TRACIFY_API_KEY or TRACIFY_API_KEY must be provided or set as an environment variable")
        selected_region = (region or os.environ.get("TRACIFY_REGION") or "eu").strip().lower()
        if selected_region not in self.REGION_HOSTS:
            raise ValueError("TRACIFY_REGION must be 'eu' or 'us'")
        self.host = (host or os.environ.get("TRACIFY_HOST") or self.REGION_HOSTS[selected_region]).rstrip("/")
        host_region = next((key for key, value in self.REGION_HOSTS.items() if value == self.host), None)
        key_region = self._api_key_region(self.api_key)
        if key_region and host_region and key_region != host_region:
            raise ValueError(f"Tracify API key region mismatch: this key belongs to {key_region.upper()}, but the client is configured for {host_region.upper()}.")
        self.project_id = project_id
        self.ingest_url = f"{self.host}/api/ingest"
        self.check_cost_url = f"{self.host}/api/orchestration/check-cost"
        self._http = httpx.Client(timeout=10) if _HAS_HTTPX else None
        self._last_fail_open = False
        self._prompt_cache: Dict[str, Any] = {}

    @staticmethod
    def _api_key_region(api_key: str) -> Optional[str]:
        if api_key.startswith("tracify_sk_live_eu_"):
            return "eu"
        if api_key.startswith("tracify_sk_live_us_"):
            return "us"
        if api_key.startswith("tracify_sk_live_"):
            return "eu"
        return None

    def _send_span(self, span: Dict[str, Any]):
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            if self._http:
                self._http.post(self.ingest_url, headers=headers, json=span)
            else:
                _requests_fallback.post(self.ingest_url, headers=headers, json=span, timeout=2)
        except Exception as e:
            print(f"Tracify Warning: Failed to ingest span: {e}")

    def ingest(self, **kwargs):
        span = {
            "spanId": str(uuid.uuid4()),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "metadata": {},
            **kwargs
        }
        self._send_span(span)

    def get_prompt(self, name: str, environment: str = "production", cache_ttl_seconds: float = 60, fallback: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Resolve a deployed prompt, using a short-lived cache and stale/fallback recovery."""
        key = f"{name}:{environment}"
        now = time.time()
        cached = self._prompt_cache.get(key)
        if cached and cached["expires_at"] > now:
            return cached["value"]
        try:
            response = (self._http.get if self._http else _requests_fallback.get)(f"{self.host}/api/prompts/{name}", headers={"Authorization": f"Bearer {self.api_key}"}, params={"environment": environment}, timeout=10)
            if response.status_code >= 400:
                raise RuntimeError(f"Prompt resolution failed ({response.status_code}): {response.text[:300]}")
            value = response.json()
            self._prompt_cache[key] = {"value": value, "expires_at": now + cache_ttl_seconds}
            return value
        except Exception:
            if cached:
                return cached["value"]
            if fallback is not None:
                return fallback
            raise

    def _send_feedback(self, payload: Dict[str, Any]):
        if not self.project_id:
            print("Tracify Warning: project_id is required for feedback and score helpers")
            return
        try:
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            if self._http:
                self._http.post(f"{self.host}/api/feedback", headers=headers, json={"projectId": self.project_id, **payload}, timeout=5)
            else:
                _requests_fallback.post(f"{self.host}/api/feedback", headers=headers, json={"projectId": self.project_id, **payload}, timeout=5)
        except Exception as e:
            print(f"Tracify Warning: Failed to record evaluation signal: {e}")

    def feedback(self, trace_id: str, value: Union[bool, float, int, str], kind: Optional[str] = None, span_id: Optional[str] = None, reason: Optional[str] = None, comment: Optional[str] = None, end_user_id: Optional[str] = None, dedupe_key: Optional[str] = None):
        inferred_kind = kind or ("star" if isinstance(value, (int, float)) and not isinstance(value, bool) else "thumb" if isinstance(value, bool) else "text")
        self._send_feedback({"traceId": trace_id, "spanId": span_id, "kind": inferred_kind, "value": value, "reason": reason, "comment": comment, "endUserId": end_user_id, "dedupeKey": dedupe_key})

    def score(self, trace_id: str, name: str, value: Union[bool, float, int, str], data_type: Optional[str] = None, span_id: Optional[str] = None, comment: Optional[str] = None):
        self._send_feedback({"traceId": trace_id, "spanId": span_id, "kind": "text", "name": name, "value": value, "dataType": data_type, "comment": comment})

    def _check_cost(self, run_id: str, increment_usd: float) -> Dict[str, Any]:
        """Server-side cost check. Returns the server's decision."""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            if self._http:
                resp = self._http.post(
                    self.check_cost_url,
                    headers=headers,
                    json={"runId": run_id, "incrementUsd": increment_usd},
                )
            else:
                resp = _requests_fallback.post(
                    self.check_cost_url,
                    headers=headers,
                    json={"runId": run_id, "incrementUsd": increment_usd},
                    timeout=5,
                )
            if resp.status_code != 200:
                self._last_fail_open = True
                return {"allowed": True, "reason": "check_failed"}
            self._last_fail_open = False
            return resp.json()
        except Exception:
            self._last_fail_open = True
            return {"allowed": True, "reason": "network_error"}

    def orchestrate(
        self,
        policy: RuntimePolicy,
        call: Callable[[str, CancellationToken], Any],
        model: str,
        input_data: Any = None,
        calculate_cost: Optional[Callable[[Any, str], float]] = None,
        run_id: Optional[str] = None,
    ) -> Any:
        run_id = run_id or os.environ.get("TRACIFY_CURRENT_RUN_ID") or os.environ.get("TRACIFY_CURRENT_RUN_ID") or str(uuid.uuid4())
        all_models = [model] + [m for m in policy.fallback_chain if m != model]
        last_error: Optional[Exception] = None

        for model_index, current_model in enumerate(all_models):
            is_fallback = model_index > 0
            fallback_reason = None
            if is_fallback:
                if last_error and _is_latency_abort(last_error):
                    fallback_reason = "latency_budget"
                elif last_error:
                    fallback_reason = "provider_error"
                else:
                    fallback_reason = "cost_ceiling"

            max_attempts = 1 if is_fallback else (policy.max_attempts + 1)

            for attempt in range(1, max_attempts + 1):
                span_id = str(uuid.uuid4())
                start_time = time.time()

                # Server-side cost ceiling enforcement
                if policy.enforcement_mode == "enforce":
                    estimated_cost = 0.01 if calculate_cost else 0

                    if policy.max_cost_per_run is not None:
                        check = self._check_cost(run_id, estimated_cost)
                        if not check.get("allowed") and check.get("reason") == "maxCostPerRun":
                            self.ingest(
                                spanId=span_id,
                                runId=run_id,
                                spanType="llm_call",
                                input=json.dumps(input_data) if input_data is not None else "",
                                output=json.dumps({"blocked": True, "reason": "cost_ceiling"}),
                                modelId=current_model,
                                costUsd=0,
                                latencyMs=0,
                                metadata={
                                    "orchestrationBlocked": True,
                                    "orchestrationReason": "cost_ceiling",
                                    "orchestrationAttempt": attempt,
                                    "orchestrationModel": current_model,
                                    "orchestrationOriginalModel": model,
                                    "orchestrationServerCost": check.get("currentCost"),
                                    "orchestrationCeiling": check.get("ceiling"),
                                    "orchestrationFailOpen": self._last_fail_open,
                                    "orchestrationPolicy": json.dumps(policy.to_dict()),
                                },
                            )
                            if model_index < len(all_models) - 1:
                                last_error = Exception(f"Cost ceiling reached: ${check.get('currentCost', 0):.4f} >= ${check.get('ceiling')}")
                                break
                            raise Exception(f"Cost ceiling reached: ${check.get('currentCost', 0):.4f} >= ${check.get('ceiling')}")

                    if policy.max_cost_per_day is not None:
                        check = self._check_cost(run_id, estimated_cost)
                        if not check.get("allowed") and check.get("reason") == "maxCostPerDay":
                            self.ingest(
                                spanId=span_id,
                                runId=run_id,
                                spanType="llm_call",
                                input=json.dumps(input_data) if input_data is not None else "",
                                output=json.dumps({"blocked": True, "reason": "daily_cost_ceiling"}),
                                modelId=current_model,
                                costUsd=0,
                                latencyMs=0,
                                metadata={
                                    "orchestrationBlocked": True,
                                    "orchestrationReason": "daily_cost_ceiling",
                                    "orchestrationAttempt": attempt,
                                    "orchestrationModel": current_model,
                                    "orchestrationOriginalModel": model,
                                    "orchestrationServerCost": check.get("currentCost"),
                                    "orchestrationCeiling": check.get("ceiling"),
                                    "orchestrationFailOpen": self._last_fail_open,
                                    "orchestrationPolicy": json.dumps(policy.to_dict()),
                                },
                            )
                            if model_index < len(all_models) - 1:
                                last_error = Exception(f"Daily cost ceiling reached: ${check.get('currentCost', 0):.4f} >= ${check.get('ceiling')}")
                                break
                            raise Exception(f"Daily cost ceiling reached: ${check.get('currentCost', 0):.4f} >= ${check.get('ceiling')}")

                # Latency budget enforcement via cooperative cancellation
                try:
                    timeout = policy.latency_budget_ms if policy.enforcement_mode == "enforce" else None
                    result = _run_with_timeout(
                        lambda token, m=current_model: call(m, token),
                        timeout,
                    )
                    latency_ms = int((time.time() - start_time) * 1000)
                    cost_usd = calculate_cost(result, current_model) if calculate_cost else 0

                    # Report actual cost to server
                    if policy.enforcement_mode == "enforce" and cost_usd > 0:
                        self._check_cost(run_id, cost_usd)

                    self.ingest(
                        spanId=span_id,
                        runId=run_id,
                        spanType="llm_call",
                        input=json.dumps(input_data) if input_data is not None else "",
                        output=json.dumps(result) if not isinstance(result, str) else result,
                        modelId=current_model,
                        costUsd=cost_usd,
                        latencyMs=latency_ms,
                        metadata={
                            "orchestrationAttempt": attempt,
                            "orchestrationModel": current_model,
                            "orchestrationOriginalModel": model,
                            "orchestrationIsFallback": is_fallback,
                            "orchestrationFallbackReason": fallback_reason,
                            "orchestrationFinal": True,
                            "orchestrationFailOpen": self._last_fail_open,
                            "orchestrationPolicy": json.dumps(policy.to_dict()),
                        },
                    )
                    return result

                except Exception as error:
                    latency_ms = int((time.time() - start_time) * 1000)
                    last_error = error

                    retryable = _is_retryable_error(error, policy.retryable_errors)
                    is_last_attempt = attempt == max_attempts
                    was_latency_abort = _is_latency_abort(error)

                    self.ingest(
                        spanId=span_id,
                        runId=run_id,
                        spanType="llm_call" if (retryable and not is_last_attempt) else "error",
                        input=json.dumps(input_data) if input_data is not None else "",
                        output=str(error),
                        modelId=current_model,
                        costUsd=0,
                        latencyMs=latency_ms,
                        metadata={
                            "orchestrationAttempt": attempt,
                            "orchestrationModel": current_model,
                            "orchestrationOriginalModel": model,
                            "orchestrationIsFallback": is_fallback,
                            "orchestrationFallbackReason": fallback_reason,
                            "orchestrationError": True,
                            "orchestrationLatencyAbort": was_latency_abort,
                            "orchestrationRetryable": retryable,
                            "orchestrationWillRetry": retryable and not is_last_attempt,
                            "orchestrationFailOpen": self._last_fail_open,
                            "orchestrationPolicy": json.dumps(policy.to_dict()),
                        },
                    )

                    if retryable and not is_last_attempt:
                        delay = policy.backoff_ms * (policy.backoff_multiplier ** (attempt - 1))
                        time.sleep(delay / 1000)
                        continue

                    break

        raise last_error or Exception("All fallback models exhausted")


def trace_agent(client: Optional[TracifyClient] = None):
    """
    Decorator to wrap an agent's main entry point.
    Automatically handles runId generation and run_end span.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        async def async_wrapper(*args, **kwargs):
            nonlocal client
            if client is None:
                client = TracifyClient()
            
            run_id = str(uuid.uuid4())
            start_time = time.time()
            
            os.environ["TRACIFY_CURRENT_RUN_ID"] = run_id
            os.environ["TRACIFY_CURRENT_RUN_ID"] = run_id
            
            try:
                result = await func(*args, **kwargs)
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

        @functools.wraps(func)
        def sync_wrapper(*args, **kwargs):
            nonlocal client
            if client is None:
                client = TracifyClient()
            
            run_id = str(uuid.uuid4())
            start_time = time.time()
            os.environ["TRACIFY_CURRENT_RUN_ID"] = run_id
            os.environ["TRACIFY_CURRENT_RUN_ID"] = run_id
            
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


def llm_call(input_data: Any, output_data: Any, model_id: str, cost_usd: float, latency_ms: int, client: Optional[TracifyClient] = None, session_id: Optional[str] = None, end_user_id: Optional[str] = None, environment: Optional[str] = None, release: Optional[str] = None, tags: Optional[List[str]] = None, trace_name: Optional[str] = None):
    if client is None: client = TracifyClient()
    client.ingest(
        runId=os.environ.get("TRACIFY_CURRENT_RUN_ID") or os.environ.get("TRACIFY_CURRENT_RUN_ID", "unknown"),
        spanType="llm_call",
        input=json.dumps(input_data) if not isinstance(input_data, str) else input_data,
        output=json.dumps(output_data) if not isinstance(output_data, str) else output_data,
        modelId=model_id,
        costUsd=cost_usd,
        latencyMs=latency_ms,
        sessionId=session_id or "",
        endUserId=end_user_id or "",
        environment=environment or "",
        release=release or "",
        tags=tags or [],
        traceName=trace_name or "",
    )


def tool_call(tool_name: str, input_data: Any, output_data: Any, latency_ms: int, client: Optional[TracifyClient] = None, session_id: Optional[str] = None, end_user_id: Optional[str] = None, environment: Optional[str] = None, release: Optional[str] = None, tags: Optional[List[str]] = None, trace_name: Optional[str] = None):
    if client is None: client = TracifyClient()
    client.ingest(
        runId=os.environ.get("TRACIFY_CURRENT_RUN_ID") or os.environ.get("TRACIFY_CURRENT_RUN_ID", "unknown"),
        spanType="tool_call",
        toolName=tool_name,
        input=json.dumps(input_data) if not isinstance(input_data, str) else input_data,
        output=json.dumps(output_data) if not isinstance(output_data, str) else output_data,
        latencyMs=latency_ms,
        costUsd=0,
        sessionId=session_id or "",
        endUserId=end_user_id or "",
        environment=environment or "",
        release=release or "",
        tags=tags or [],
        traceName=trace_name or "",
    )


