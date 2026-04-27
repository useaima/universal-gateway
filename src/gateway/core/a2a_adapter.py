from core.runtime_contract import agent_card_payload, support_matrix_payload

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
        card = agent_card_payload()
        card["agent_id"] = self.agent_id
        card["skills"] = self.capabilities
        return card

    async def handle_a2a_request(self, method: str, params: dict) -> dict:
        """
        Standard A2A JSON-RPC 2.0 Handler.
        Allows other Google A2A agents to query this gateway.
        """
        if method == "get_capabilities":
            return {
                "capabilities": self.capabilities,
                "support_tiers": support_matrix_payload(),
            }
        elif method == "ping":
            return {"status": "pong"}
        
        return {"error": "Method not implemented"}
