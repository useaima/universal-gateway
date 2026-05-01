import os
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

from core.secure_paths import resolve_identity_key_path

class IdentityManager:
    """
    Handles Gateway Identity using Ed25519 signatures.
    """
    def __init__(self, key_path=None):
        self.key_path = str(resolve_identity_key_path() if key_path is None else key_path)
        self._private_key = None
        self._public_key = None
        self._load_or_generate_keys()

    def _load_or_generate_keys(self):
        pem = os.environ.get("UTG_IDENTITY_PRIVATE_KEY_PEM")
        if pem:
            self._private_key = serialization.load_pem_private_key(
                pem.encode(),
                password=None,
            )
            self._public_key = self._private_key.public_key()
            return

        if os.path.exists(self.key_path):
            with open(self.key_path, "rb") as key_file:
                self._private_key = serialization.load_pem_private_key(
                    key_file.read(),
                    password=None
                )
            self._public_key = self._private_key.public_key()
        else:
            os.makedirs(os.path.dirname(self.key_path), exist_ok=True)
            self._private_key = ed25519.Ed25519PrivateKey.generate()
            self._public_key = self._private_key.public_key()
            
            # Save Private Key (Standard PKCS8 PEM)
            with open(self.key_path, "wb") as f:
                f.write(self._private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            try:
                os.chmod(self.key_path, 0o600)
            except OSError:
                pass

    def sign_data(self, data: str) -> str:
        signature = self._private_key.sign(data.encode())
        return signature.hex()

    def verify_signature(self, data: str, signature_hex: str) -> bool:
        try:
            signature = bytes.fromhex(signature_hex)
            self._public_key.verify(signature, data.encode())
            return True
        except Exception:
            return False

    def get_public_key_hex(self) -> str:
        return self._public_key.public_bytes(
            encoding=serialization.Encoding.Raw,
            format=serialization.PublicFormat.Raw
        ).hex()
