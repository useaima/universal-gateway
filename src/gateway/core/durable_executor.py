import json
import asyncio
from typing import List, Callable, Any, Awaitable
from core.audit_logger import AuditLogger

class DurableWorkflowStep:
    def __init__(self, name: str, action: Callable[[], Awaitable[Any]], rollback: Callable[[], Awaitable[Any]] = None):
        self.name = name
        self.action = action
        self.rollback = rollback

class DurableExecutor:
    """
    Inspired by Temporal.io. Implements a durable 'Saga Pattern' for UTG GaaS.
    Ensures multi-step financial flows either satisfy fully or roll back cleanly.
    """
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.logger = AuditLogger()
        self.history = []
        self.compensations = []

    async def run_workflow(self, workflow_name: str, steps: List[DurableWorkflowStep]):
        """Runs a sequence of steps with automated compensating actions on failure."""
        print(f"[DurableExecution] Starting Workflow: {workflow_name}", flush=True)
        self.logger.log_signed_entry(self.user_id, "WORKFLOW_START", {"name": workflow_name})

        try:
            for step in steps:
                print(f"[Workflow] Executing step: {step.name}", flush=True)
                
                # Execute the forward action
                result = await step.action()
                
                # Record success and the compensation
                self.history.append({"step": step.name, "result": "SUCCESS"})
                if step.rollback:
                    self.compensations.append(step.rollback)
                
                self.logger.log_signed_entry(self.user_id, f"STEP_SUCCESS_{step.name}", {"result": str(result)})

            self.logger.log_signed_entry(self.user_id, "WORKFLOW_SUCCESS", {"name": workflow_name})
            return {"status": "SUCCESS", "history": self.history}

        except Exception as e:
            print(f"[DurableExecution] FAILURE in {workflow_name}: {str(e)}. Initiating Rollback...", flush=True)
            self.logger.log_signed_entry(self.user_id, "WORKFLOW_FAILURE", {"error": str(e)})
            
            # Execute compensations in reverse order
            for rollback_fn in reversed(self.compensations):
                try:
                    await rollback_fn()
                except Exception as rollback_err:
                    print(f"CRITICAL: Rollback failed during compensation: {rollback_err}")
                    self.logger.log_signed_entry(self.user_id, "ROLLBACK_ERROR", {"error": str(rollback_err)})

            return {"status": "FAILED", "error": str(e), "rollback": "COMPLETED"}
