import pytest
import os
import tempfile
import asyncio
from src.gateway.core.idempotency_manager import IdempotencyManager

@pytest.fixture
def mock_db_path():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    yield path
    os.unlink(path)

@pytest.mark.asyncio
async def test_idempotency_blocks_duplicates(mock_db_path):
    manager = IdempotencyManager(db_path=mock_db_path)
    user_id = "test_user"
    id_key = "hash_txn_12345"
    
    # 1. Check before lock (should be None)
    assert manager.check_key(id_key, user_id) is None
    
    # 2. Add the lock
    manager.lock_key(id_key, user_id)
    
    # 3. Simulate an Agent "Hallucination Flood" calling the API simultaneously
    # All of these should see "PENDING"
    for _ in range(50):
        memo = manager.check_key(id_key, user_id)
        assert memo is not None, "Idempotency Manager did not return a lock memo."
        assert memo["status"] == "PENDING"
        
    # 4. Finalize the task successfully
    manager.finalize_key(id_key, user_id, "SUCCESS", {"tx_hash": "0xABC"})
    
    # 5. Subsequent calls 4 hours later should return the exact same success payload instantly
    final_memo = manager.check_key(id_key, user_id)
    assert final_memo["status"] == "SUCCESS"
    assert final_memo["response"]["tx_hash"] == "0xABC"
