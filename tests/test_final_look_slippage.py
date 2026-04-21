import pytest
import asyncio
from src.gateway.core.execution_wrapper import ExecutionWrapper, PriceMismatchException

@pytest.mark.asyncio
async def test_execution_wrapper_slippage_tolerance():
    wrapper = ExecutionWrapper(user_id="test_user")
    
    # 1. 5% slippage tolerance test (Valid)
    # The agent quoted 1.0 ETH, but execution scraped 1.04 ETH (4% slippage)
    # This should NOT raise an exception.
    try:
        await wrapper._validate_final_price(initial_quote=1.0, scraped_price=1.04, tolerance=0.05)
    except PriceMismatchException:
        pytest.fail("Valid slippage within tolerance raised an exception!")

    # 2. 20% slippage tolerance test (Approval Blindness / MEV attack)
    # The agent quoted 1.0 ETH, but final price was 1.20 ETH (20% hike)
    with pytest.raises(PriceMismatchException) as excinfo:
        await wrapper._validate_final_price(initial_quote=1.0, scraped_price=1.20, tolerance=0.05)
    
    # 3. Ensure the error string is readable by the agent
    assert "Price variance exceeded tolerance" in str(excinfo.value)
    assert "delta 20.0% > 5%" in str(excinfo.value)

@pytest.mark.asyncio
async def test_execution_wrapper_temporal_budget():
    wrapper = ExecutionWrapper(user_id="test_user")
    wrapper.timeout = 0.5 # Strict 500ms timeout for the test
    
    # Create a mock agent task that hangs for 2 seconds
    async def hanging_task():
        await asyncio.sleep(2.0)
        return "SUCCESS"
        
    result = await wrapper.execute_task("ETH_TRANSFER", hanging_task)
    
    # The wrapper should have canceled it and returned a descriptive FAILED dict to the agent
    assert result["status"] == "FAILED"
    assert "Task exceeded 0.5s timeout Budget" in result["error"]
