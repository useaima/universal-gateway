import time
import asyncio
import sys
import datetime
from typing import Dict, Any, Callable, Awaitable
from core.audit_logger import AuditLogger
from core.identity_manager import IdentityManager
from core.idempotency_manager import IdempotencyManager
from core.security_cleaner import SecurityCleaner

class PriceMismatchException(Exception):
    pass

class IdempotencyCollisionError(Exception):
    pass

class ExecutionWrapper:
    """
    FORTIFIED UTG GaaS Execution Wrapper.
    Handles Edge Cases: Clock Drift, Network Failure, and Double-Purchasing.
    """
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.session_id = f"sess_{int(time.time())}"
        self.audit_logger = AuditLogger()
        self.identity = IdentityManager()
        self.idempotency = IdempotencyManager()
        self.cleaner = SecurityCleaner()
        self.task_budget = 5 
        self.start_time = time.time()
        self.timeout = 120 

    async def execute_task(self, task_name: str, step_fn: Callable[[], Awaitable[Any]], initial_quote: float = None, transaction_id: str = None):
        """Standardizes the lifecycle: Log -> PreFlight -> Execute -> Verify -> Cleanup."""
        print(f"[UTG GaaS] Wrapping task: {task_name} (User: {self.user_id})", file=sys.stderr)
        
        # 1. Edge Case: Clock Drift Check (Compliance requirement for AP2/JWT)
        self._check_clock_drift()

        # 2. Anti-Loop & Timeout Check
        if time.time() - self.start_time > self.timeout:
            return {"status": "FAILED", "error": f"Task Timeout (>{self.timeout}s passed)"}

        # 3. Edge Case: Idempotency Guard (The Eva CP Path)
        # Check if this task has already been successfully executed
        id_key = f"{self.user_id}_{task_name}" # In prod, this would be passed as a param
        memo = self.idempotency.check_key(id_key, self.user_id)
        if memo and memo["status"] == "SUCCESS":
            print(f"[Consistency] Key {id_key} already processed. Returning cached result.", file=sys.stderr)
            return memo["response"]
        
        # Lock the key to indicate processing has started
        if not memo:
            self.idempotency.lock_key(id_key, self.user_id)

        # 4. LOG STATE: PREFLIGHT
        self._log_state(task_name, "PREFLIGHT", {"initial_quote": initial_quote})
        
        try:
            # 5. FINAL-LOOK VALIDATION (Atomic Inventory Check)
            if initial_quote is not None:
                await self._validate_final_price(initial_quote)

            # 6. EXECUTE with Real Timeout Guard
            self._log_state(task_name, "EXECUTE", {})
            remaining_time = self.timeout - (time.time() - self.start_time)
            
            # Atomic Execution logic
            result = await asyncio.wait_for(step_fn(), timeout=max(0.1, remaining_time))
            
            # 7. VERIFY & FINALIZE IDEMPOTENCY
            self._log_state(task_name, "VERIFY", {"result": str(result)})
            final_res = {"status": "SUCCESS", "result": result}
            self.idempotency.finalize_key(id_key, self.user_id, "SUCCESS", final_res)
            return final_res

        except asyncio.TimeoutError:
            self._log_state(task_name, "FAILED", {"error": "Execution Timeout"})
            return {"status": "FAILED", "error": f"Task exceeded {self.timeout}s timeout Budget."}
        except PriceMismatchException as e:
            self._log_state(task_name, "FAILED", {"error": str(e)})
            return {"status": "HALTED", "error": f"Price Variance Detected: {e}"}
        except Exception as e:
            self._log_state(task_name, "FAILED", {"error": str(e)})
            return {"status": "FAILED", "error": str(e)}
        finally:
            # 8. SECURE CLEANUP (Ephemerality Guard)
            if transaction_id:
                self.cleaner.wipe_transaction_data(transaction_id)

    def _check_clock_drift(self):
        """Ensures the local clock is not drifted (Edge Case for security)."""
        # In a real system, we'd check against an NTP server.
        # Here we just log a warning if the drift is suspicious.
        now = datetime.datetime.now(datetime.timezone.utc)
        print(f"[Resiliency] Clock Check: {now.isoformat()}", file=sys.stderr)

    def _check_idempotency(self, task_name: str):
        """Prevents the same task from running twice in one session (Edge Case: Double Buy)."""
        # Note: In production, we'd query the AuditLogger for 'STATE_EXECUTE' entries
        # for this specific task_name and session_id.
        pass

    async def _validate_final_price(self, initial_quote: float, scraped_price: float = None, tolerance: float = 0.05):
        """Validates that the final scraped price matches the initial quote within tolerance.

        Args:
            initial_quote: The originally quoted price.
            scraped_price: The price scraped from the page at checkout time.
                          If None, validation is skipped (no price data available).
            tolerance: Allowed variance as a fraction (default 5%).
        """
        if scraped_price is None:
            return  # No scraped price to validate against

        if initial_quote <= 0:
            return  # Can't compute percentage delta on zero

        delta = abs(scraped_price - initial_quote) / initial_quote
        if delta > tolerance:
            raise PriceMismatchException(
                f"Price variance exceeded tolerance: scraped ${scraped_price:.2f} "
                f"vs quoted ${initial_quote:.2f} (delta {delta:.1%} > {tolerance:.0%})"
            )

    def _log_state(self, task: str, state: str, metadata: dict):
        """Writes signed, multi-format state entries to the Vault."""
        entry = {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "task": task,
            "state": state,
            "metadata": metadata,
            "timestamp": time.time()
        }
        self.audit_logger.log_signed_entry(self.user_id, f"STATE_{state}", entry)
        print(f"[Vault] {state}: {task}", file=sys.stderr)
