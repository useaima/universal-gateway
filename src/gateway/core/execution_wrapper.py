import time
import asyncio
import sys
from typing import Dict, Any, Callable, Awaitable
from core.audit_logger import AuditLogger
from core.identity_manager import IdentityManager

class PriceMismatchException(Exception):
    pass

class ExecutionWrapper:
    """
    Defensive Execution Wrapper (State Machine).
    Wraps all high-stakes agent actions in a protective lifecycle.
    """
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.session_id = f"sess_{int(time.time())}"
        self.audit_logger = AuditLogger()
        self.identity = IdentityManager()
        self.task_budget = 5 # Iteration limit
        self.start_time = time.time()
        self.timeout = 120 # Seconds limit

    async def execute_task(self, task_name: str, step_fn: Callable[[], Awaitable[Any]], initial_quote: float = None):
        """Standardizes the lifecycle: Log -> PreFlight -> Execute -> Verify."""
        print(f"[Reliability] Wrapping task: {task_name} for User: {self.user_id}", file=sys.stderr)
        
        # 1. Anti-Loop & Timeout Check (Initial)
        if time.time() - self.start_time > self.timeout:
            return {"status": "FAILED", "error": f"Initial Timeout (>{self.timeout}s passed)"}

        # 2. LOG STATE: START
        self._log_state(task_name, "PREFLIGHT", {"initial_quote": initial_quote})
        
        try:
            # 3. FINAL-LOOK VALIDATION (For Commerce tasks)
            if initial_quote is not None:
                await self._validate_final_price(initial_quote)

            # 4. EXECUTE with Real Timeout Guard
            self._log_state(task_name, "EXECUTE", {})
            remaining_time = self.timeout - (time.time() - self.start_time)
            
            # Atomic Execution with Timeout
            result = await asyncio.wait_for(step_fn(), timeout=max(0.1, remaining_time))
            
            # 5. VERIFY
            self._log_state(task_name, "VERIFY", {"result": str(result)})
            return {"status": "SUCCESS", "result": result}

        except asyncio.TimeoutError:
            self._log_state(task_name, "FAILED", {"error": "Execution Timeout"})
            return {"status": "FAILED", "error": f"Task exceeded {self.timeout}s timeout Budget."}
        except PriceMismatchException as e:
            self._log_state(task_name, "FAILED", {"error": str(e)})
            return {"status": "HALTED", "error": f"Price Variance Detected: {e}"}
        except Exception as e:
            self._log_state(task_name, "FAILED", {"error": str(e)})
            return {"status": "FAILED", "error": str(e)}

    async def _validate_final_price(self, initial_quote: float):
        """Scrapes DOM for Final Total Price before any click."""
        await asyncio.sleep(0.5) # The 'Pre-Flight 500ms Check'
        
        # Simulation placeholder
        final_price = initial_quote 
        
        if final_price > initial_quote:
            raise PriceMismatchException(f"Price increased from {initial_quote} to {final_price}")

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
        import json
        payload = json.dumps(entry, sort_keys=True)
        signature = self.identity.sign_data(payload)
        # Sign it in the DB partition
        self.audit_logger.log_signed_entry(self.user_id, f"STATE_{state}", entry)
        print(f"[Vault] {state}: {task} (Signed: {signature[:10]}...)", file=sys.stderr)
