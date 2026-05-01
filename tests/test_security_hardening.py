from pathlib import Path

from src.gateway.core.runtime_contract import FEATURE_REQUIREMENTS
from src.gateway.core.secure_paths import (
    DEFAULT_STORAGE_DIR,
    is_within_repo,
    secure_runtime_warnings,
)


def test_stable_gateway_requires_security_envs():
    required = set(FEATURE_REQUIREMENTS["stable_gateway"])

    assert "GATEWAY_PASSCODE" in required
    assert "TREASURY_ADDRESS" in required
    assert "SIWE_NONCE_SECRET" in required
    assert "UTG_STORAGE_DIR" in required


def test_default_storage_dir_is_outside_repo():
    assert not is_within_repo(DEFAULT_STORAGE_DIR)


def test_secure_runtime_warnings_flag_repo_storage(monkeypatch, tmp_path: Path):
    repo_local_storage = Path(__file__).resolve().parents[1] / "test_artifacts" / "repo-storage"
    monkeypatch.setenv("UTG_STORAGE_DIR", str(repo_local_storage))

    warnings = secure_runtime_warnings()

    assert any("UTG_STORAGE_DIR" in warning for warning in warnings)
