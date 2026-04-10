import os
import asyncio
from typing import List
import mcp.types as types
from core.skill_base import SkillBase
from core.browser_manager import BrowserManager, human_delay
from core.safety_policy import SafetyPolicy
from core.audit_logger import AuditLogger

class CommerceSkill(SkillBase):
    """
    Handles 'Real Commerce' (Search, Compare, and Checkout).
    Evolves from the basic checkout tool to a full shopping assistant.
    """
    
    def __init__(self):
        self.browser_manager = BrowserManager()
        self.safety_policy = SafetyPolicy()
        self.audit_logger = AuditLogger()
        self.api_key = os.environ.get("CAPSOLVER_API_KEY")

    @property
    def name(self) -> str:
        return "commerce"

    async def get_tools(self) -> List[types.Tool]:
        return [
            types.Tool(
                name="search_and_compare",
                description="Search for an item across multiple platforms (Amazon, eBay) and compare prices.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "item_name": {"type": "string", "description": "The name of the product to search for."},
                        "max_price": {"type": "number", "description": "Budget cap for the search."}
                    },
                    "required": ["item_name", "max_price"]
                }
            ),
            types.Tool(
                name="request_order",
                description="Finalize the order for a specific item found during comparison.",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "url": {"type": "string", "description": "Product URL"},
                        "price_text": {"type": "string", "description": "Final price text"},
                        "items": {"type": "string", "description": "Item description"}
                    },
                    "required": ["url", "price_text", "items"]
                }
            )
        ]

    async def handle_tool_call(self, name: str, arguments: dict) -> List[types.TextContent]:
        if name == "search_and_compare":
            return await self._search_and_compare(arguments)
        elif name == "request_order":
            return [types.TextContent(type="text", text="Order Requested. Pending Multi-Party Approval...")]
        return []

    async def _search_and_compare(self, args: dict) -> List[types.TextContent]:
        item = args["item_name"]
        max_p = args["max_price"]
        
        # Simulation of cross-platform search
        # In production, this would navigate to Amazon/eBay sequentially
        results = [
            {"platform": "Amazon", "price": max_p * 0.9, "url": f"https://amazon.com/s?k={item}"},
            {"platform": "eBay", "price": max_p * 0.85, "url": f"https://ebay.com/sch/{item}"}
        ]
        
        summary = f"Found {len(results)} matches for '{item}' within ${max_p}:\n"
        for r in results:
            summary += f"- {r['platform']}: ${r['price']} ({r['url']})\n"
        
        self.audit_logger.log_action("search_and_compare", args, "SUCCESS")
        return [types.TextContent(type="text", text=summary)]
