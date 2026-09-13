import logging

import httpx
from tenacity import (
    Retrying,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

logger = logging.getLogger(__name__)

# HTTP errors that are known to be non-transient --> fail fast
NON_RETRYABLE_STATUS_CODES = {
    400,  # Bad request
    401,  # Authentication
    403,  # Permission / model access / usage policy
}


def is_retryable_exception(exc: BaseException) -> bool:
    # Transport-level failures and timeouts are transient.
    if isinstance(exc, (httpx.TimeoutException, httpx.TransportError)):
        return True

    # HTTP errors need status-code inspection.
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code not in NON_RETRYABLE_STATUS_CODES

    # LLM output that failed our validation/schema is worth retrying.
    if isinstance(exc, ValueError):
        return True

    return False


def build_retrying(max_retries: int) -> Retrying:
    return Retrying(
        stop=stop_after_attempt(max_retries + 1),
        wait=wait_exponential(
            multiplier=1,
            min=1,
            max=20,
        ),
        retry=retry_if_exception(is_retryable_exception),
        reraise=True,
        before_sleep=lambda state: logger.warning(
            "LLM call failed (attempt %s), retrying: %s",
            state.attempt_number,
            state.outcome.exception() if state.outcome else "unknown error",
        ),
    )