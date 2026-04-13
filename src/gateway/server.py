import os
import asyncio
from typing import List, Dict
import mcp.server.stdio
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.types as types

from core.a2a_adapter import A2AAdapter
from core.browser_manager import BrowserManager

class UniversalGatewayServer:
    def __init__(self):
        self.server = Server("universal-gateway")
        self.browser_manager = BrowserManager()
        self.skills = {}
        self.a2a = A2AAdapter(
            agent_id="utg-gateway-001",
            capabilities=["ecommerce", "defi", "legal_vault"]
        )
        self._setup_handlers()

    def _setup_handlers(self):
        @self.server.list_tools()
        async def handle_list_tools() -> List[types.Tool]:
            all_tools = []
            for skill in self.skills.values():
                all_tools.extend(await skill.get_tools())
            
            # Add A2A Global Tools
            all_tools.append(types.Tool(
                name="get_a2a_agent_card",
                description="Returns the official Google A2A Agent Card for this gateway.",
                inputSchema={"type": "object"}
            ))
            return all_tools

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: Dict | None) -> List[types.Content]:
            if name == "get_a2a_agent_card":
                card = self.a2a.get_agent_card()
                return [types.TextContent(type="text", text=json.dumps(card, indent=2))]
            
            for skill in self.skills.values():
                tools = await skill.get_tools()
                if any(t.name == name for t in tools):
                    return await skill.handle_tool_call(name, arguments or {})
            
            return [types.TextContent(type="text", text=f"Tool {name} not found.")]

    def load_skills(self):
        # In production, this would dynamically import from skills/
        from skills.commerce_skill import CommerceSkill
        from skills.defi_eth_skill import DeFiEthSkill
        from skills.handover_skill import HandoverSkill
        
        self.skills["commerce"] = CommerceSkill()
        self.skills["defi"] = DeFiEthSkill()
        self.skills["handover"] = HandoverSkill()

    async def run(self):
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

def main():
    import json
    server = UniversalGatewayServer()
    server.load_skills()
    asyncio.run(server.run())

if __name__ == "__main__":
    main()
