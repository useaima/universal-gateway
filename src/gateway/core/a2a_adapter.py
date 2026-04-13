import json
import mcp.types as types

class A2AAdapter:
    """
    Standard Google A2A (Agent-to-Agent) Adapter.
    Handles 'Agent Card' discovery and protocol compliance.
    """
    def __init__(self, agent_id: str, capabilities: list):
        self.agent_id = agent_id
        self.capabilities = capabilities

    def get_agent_card(self) -> dict:
        """
        Returns the official A2A Agent Card.
        Typically served at /.well-known/agent.json
        """
        return {
            "a2a_version": "1.0",
            "agent_id": self.agent_id,
            "name": "Universal Transaction Gateway",
            "description": "High-security payment and transaction node for AI agents.",
            "skills": self.capabilities,
            "endpoints": {
                "mcp": "/mcp",
                "a2a_rpc": "/a2a-rpc"
            },
            "security": {
                "type": "Ed25519",
                "verification_key": "TODO_FETCH_FROM_IDENTITY_MANAGER"
            }
        }

    async def handle_a2a_request(self, method: str, params: dict) -> dict:
        """
        Standard A2A JSON-RPC 2.0 Handler.
        Allows other Google A2A agents to query this gateway.
        """
        if method == "get_capabilities":
            return {"capabilities": self.capabilities}
        elif method == "ping":
            return {"status": "pong"}
        
        return {"error": "Method not implemented"}
