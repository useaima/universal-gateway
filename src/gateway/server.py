import os
import json
import asyncio
from typing import List, Dict
import mcp.server.stdio
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.types as types

from core.a2a_adapter import A2AAdapter
from core.browser_manager import BrowserManager
from core.relay_server import start_relay_server
from core.secure_paths import secure_runtime_warnings
from core.tool_registry import ToolRegistry

class UniversalGatewayServer:
    def __init__(self):
        self.server = Server("universal-gateway")
        self.browser_manager = BrowserManager()
        self.registry = ToolRegistry()
        self.a2a = A2AAdapter(
            agent_id="utg-gateway-001",
            capabilities=[
                "mcp_finance_gateway",
                "hitl_approval_enforcement",
                "base_ethereum_execution",
                "dashboard_telemetry",
                "x402_payments",
                "commerce_beta",
                "mpesa_experimental",
            ],
        )
        self._setup_handlers()

    def _setup_handlers(self):
        @self.server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            all_tools = await self.registry.list_tools()
            all_tools.append(types.Tool(
                name="get_a2a_agent_card",
                description="Returns the official A2A/MCP discovery card for this self-hosted gateway.",
                inputSchema={"type": "object"}
            ))
            return all_tools

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict | None) -> List[types.Content]:
            if name == "get_a2a_agent_card":
                card = self.a2a.get_agent_card()
                return [types.TextContent(type="text", text=json.dumps(card, indent=2))]

            skill = await self.registry.find_skill_for_tool(name)
            if skill is not None:
                return await skill.handle_tool_call(name, arguments or {})
            
            return [types.TextContent(type="text", text=f"Tool {name} not found.")]

    def load_skills(self):
        from skills.commerce_skill import CommerceSkill
        from skills.defi_eth_skill import DeFiEthSkill
        from skills.handover_skill import HandoverSkill
        
        self.registry.register(CommerceSkill())
        self.registry.register(DeFiEthSkill())
        self.registry.register(HandoverSkill())

    async def run(self):
        relay_task = None
        if os.environ.get("UTG_ENABLE_RELAY_SERVER", "").strip().lower() in {"1", "true", "yes"}:
            relay_host = os.environ.get("UTG_RELAY_HOST", "127.0.0.1")
            relay_port = int(os.environ.get("UTG_RELAY_PORT", "8080"))
            relay_task = asyncio.create_task(start_relay_server(host=relay_host, port=relay_port))

        try:
            async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                await self.server.run(
                    read_stream,
                    write_stream,
                    InitializationOptions(
                        server_name="universal-gateway",
                        server_version="1.0.0",
                        capabilities=self.server.get_capabilities(
                            notification_options=NotificationOptions(),
                            experimental_capabilities={},
                        ),
                    ),
                )
        finally:
            if relay_task:
                relay_task.cancel()
                await asyncio.gather(relay_task, return_exceptions=True)

def main():
    for warning in secure_runtime_warnings():
        print(f"[Security] {warning}", file=sys.stderr)

    server = UniversalGatewayServer()
    server.load_skills()
    asyncio.run(server.run())

if __name__ == "__main__":
    main()
