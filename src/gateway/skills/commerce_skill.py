import os
from typing import List
import mcp.types as types
from core.skill_base import SkillBase
from core.audit_logger import AuditLogger
from skills.checkout_skill import CheckoutSkill

class CommerceSkill(SkillBase):
    """
    Browser-assisted commerce helpers.
    This capability remains beta until a search provider and browser handover
    adapter are configured by the operator.
    """
    
    def __init__(self):
        self.audit_logger = AuditLogger()
        self.search_provider = os.environ.get("COMMERCE_SEARCH_PROVIDER", "").strip()
        self.catalog_endpoint = os.environ.get("COMMERCE_CATALOG_ENDPOINT", "").strip()
        self.checkout = CheckoutSkill()

    @property
    def name(self) -> str:
        return "commerce"

    async def get_tools(self) -> List[types.Tool]:
        return [
            types.Tool(
                name="search_and_compare",
                description="Search for an item using the configured commerce provider and return an operator-safe summary.",
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
                description="Prepare a browser-assisted order handover for a specific item selected by the operator.",
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
            return await self._request_order(arguments)
        return []

    async def _search_and_compare(self, args: dict) -> List[types.TextContent]:
        item = args["item_name"]
        max_p = args["max_price"]

        if not self.search_provider:
            return [
                types.TextContent(
                    type="text",
                    text=(
                        "Commerce search is a beta capability and is disabled until "
                        "COMMERCE_SEARCH_PROVIDER is configured. Supported operator patterns are "
                        "an external catalog/search provider or browser-assisted review."
                    ),
                )
            ]

        if self.search_provider == "catalog" and not self.catalog_endpoint:
            return [
                types.TextContent(
                    type="text",
                    text=(
                        "COMMERCE_SEARCH_PROVIDER is set to 'catalog', but COMMERCE_CATALOG_ENDPOINT is missing. "
                        "Configure the provider endpoint, then retry the same request."
                    ),
                )
            ]

        if self.search_provider == "catalog":
            summary = (
                "Commerce search is configured for an external catalog provider.\n"
                f"Provider endpoint: {self.catalog_endpoint}\n"
                f"Requested item: {item}\n"
                f"Budget cap: ${max_p}\n"
                "The agent should forward this request to the configured catalog service and bring the ranked results "
                "back through the operator channel for review."
            )
        elif self.search_provider == "browser":
            summary = (
                "Commerce search is configured for browser-assisted review.\n"
                f"Requested item: {item}\n"
                f"Budget cap: ${max_p}\n"
                "Use the browser runtime or handover adapter to inspect whitelisted merchants, then present "
                "operator-approved candidates before attempting checkout."
            )
        else:
            summary = (
                f"Unknown COMMERCE_SEARCH_PROVIDER '{self.search_provider}'. "
                "Expected 'catalog' or 'browser'."
            )

        self.audit_logger.log_action("search_and_compare", args, "CONFIGURED")
        return [types.TextContent(type="text", text=summary)]

    async def _request_order(self, args: dict) -> List[types.TextContent]:
        url = args["url"]
        price_text = args["price_text"]
        items = args["items"]
        summary = self.checkout.build_handover_summary(url=url, price_text=price_text, items=items)
        self.audit_logger.log_action("request_order", args, "PENDING_HANDOVER")
        return [types.TextContent(type="text", text=summary)]
