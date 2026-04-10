import asyncio
import sys
import os

# Adjust path to find core modules
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "src", "gateway"))
from core.execution_wrapper import ExecutionWrapper, PriceMismatchException

async def test_price_validator():
    print("\n--- Test 1: Price Mismatch Guard ---")
    wrapper = ExecutionWrapper(user_id="Alvins")
    
    # Simulation logic for 'Final Look'
    async def mock_tx_logic():
        return "Transaction Complete"

    # Variant A: No Mismatch
    print("Executing with price match...")
    res = await wrapper.execute_task("BUY_ITEM", mock_tx_logic, initial_quote=10.0)
    print(f"Result: {res['status']}")

    # Variant B: Mismatch Simulation (Overriding the internal check for this test)
    print("\nExecuting with Price Mismatch (Simulating price jump)...")
    
    # We'll temporarily monkeypatch the private validator for this specific test case
    async def failing_validator(price):
        print(f"[RELIABILITY ALERT] Scraped DOM Price: 15.0 vs Quoted: {price}")
        raise PriceMismatchException(f"Price increased from {price} to 15.0")
    
    wrapper._validate_final_price = failing_validator
    
    res = await wrapper.execute_task("BUY_ITEM", mock_tx_logic, initial_quote=10.0)
    print(f"Result: {res['status']} - Error: {res.get('error')}")

async def test_anti_loop():
    print("\n--- Test 2: Anti-Loop & Timeout Guard ---")
    wrapper = ExecutionWrapper(user_id="Alvins")
    wrapper.timeout = 1 # Set very low for test
    
    async def slow_logic():
        await asyncio.sleep(2)
        return "Slow Success"
        
    print("Executing slow task (should timeout)...")
    res = await wrapper.execute_task("NEGOTIATE", slow_logic)
    print(f"Result: {res['status']} - Error: {res.get('error')}")

if __name__ == "__main__":
    asyncio.run(test_price_validator())
    asyncio.run(test_anti_loop())
