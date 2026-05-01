import os
import tempfile
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_UTG_HOME = Path.home() / ".utg"
FALLBACK_UTG_HOME = Path(tempfile.gettempdir()) / "utg"
DEFAULT_STORAGE_DIR = DEFAULT_UTG_HOME / "storage"
DEFAULT_IDENTITY_KEY_PATH = DEFAULT_UTG_HOME / "identity" / "gateway_ed25519.pem"


def _resolve_path(raw_path: str | Path) -> Path:
    return Path(raw_path).expanduser().resolve()


def _ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def is_within_repo(path: str | Path) -> bool:
    resolved = _resolve_path(path)
    try:
        resolved.relative_to(REPO_ROOT)
        return True
    except ValueError:
        return False


def ensure_parent_dir(path: str | Path) -> Path:
    resolved = _resolve_path(path)
    _ensure_dir(resolved.parent)
    return resolved


def resolve_storage_dir() -> Path:
    explicit = os.environ.get("UTG_STORAGE_DIR")
    raw_path = explicit or str(DEFAULT_STORAGE_DIR)
    resolved = _resolve_path(raw_path)
    try:
        return _ensure_dir(resolved)
    except OSError:
        if explicit:
            raise
        return _ensure_dir(FALLBACK_UTG_HOME / "storage")


def resolve_transactions_db_path() -> Path:
    if os.environ.get("UTG_TRANSACTION_DB"):
        return ensure_parent_dir(os.environ["UTG_TRANSACTION_DB"])
    return resolve_storage_dir() / "transactions.db"


def resolve_audit_db_path() -> Path:
    return resolve_storage_dir() / "audit_v2.db"


def resolve_idempotency_db_path() -> Path:
    return resolve_storage_dir() / "idempotency.db"


def resolve_identity_key_path() -> Path:
    explicit = os.environ.get("UTG_IDENTITY_KEY_PATH")
    raw_path = explicit or str(DEFAULT_IDENTITY_KEY_PATH)
    try:
        return ensure_parent_dir(raw_path)
    except OSError:
        if explicit:
            raise
        return ensure_parent_dir(FALLBACK_UTG_HOME / "identity" / "gateway_ed25519.pem")


def has_identity_secret() -> bool:
    return bool(
        os.environ.get("UTG_IDENTITY_PRIVATE_KEY_PEM")
        or os.environ.get("UTG_IDENTITY_KEY_PATH")
    )


def secure_runtime_warnings() -> list[str]:
    warnings: list[str] = []
    storage_dir = resolve_storage_dir()

    if is_within_repo(storage_dir):
        warnings.append(
            "UTG_STORAGE_DIR points inside the git repository. Move runtime data outside the repo for production."
        )

    if not has_identity_secret() and not resolve_identity_key_path().exists():
        warnings.append(
            "No explicit gateway identity secret is configured. Set UTG_IDENTITY_PRIVATE_KEY_PEM or UTG_IDENTITY_KEY_PATH."
        )

    return warnings
