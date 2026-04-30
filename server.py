import asyncio
from dotenv import load_dotenv
import mcp.types as types
from mcp.server.models import InitializationOptions
from mcp.server import Server, NotificationOptions
from mcp.server.stdio import stdio_server

from browser_manager import BrowserManager
from safety_policy import SafetyPolicy
from hitl_manager import HITLManager
from audit_logger import AuditLogger
from relay_server import start_relay_server

import os
script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(script_dir, '.env'))
server = Server("universal-transaction-gateway")
browser_manager = BrowserManager()
safety_policy = SafetyPolicy()
hitl_manager = HITLManager()
audit_logger = AuditLogger()

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="navigate",
            description="Navigate safely to a specific e-commerce product or home URL.",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "The target URL."}
                },
                "required": ["url"]
            }
        ),
        types.Tool(
            name="request_checkout",
            description="Initiate checkout. Will pause for human approval before actually proceeding.",
            inputSchema={
                "type": "object",
                "properties": {
                    "url": {"type": "string", "description": "Current URL domain of checkout"},
                    "price_text": {"type": "string", "description": "The text representing the total price, e.g. '$49.99'"},
                    "items": {"type": "string", "description": "Description of items in cart"}
                },
                "required": ["url", "price_text", "items"]
            }
        ),
        types.Tool(
            name="check_approval_status",
            description="Check if the human has approved the transaction yet.",
            inputSchema={
                "type": "object",
                "properties": {
                    "transaction_id": {"type": "string", "description": "The ID returned from request_checkout"}
                },
                "required": ["transaction_id"]
            }
        )
    ]

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    if arguments is None:
        arguments = {}
        
    if name == "navigate":
        url = arguments.get("url")
        if not url:
            return [types.TextContent(type="text", text="Error: URL is required.")]
            
        if not safety_policy.is_domain_allowed(url):
             audit_logger.log_action(name, arguments, "REJECTED_DOMAIN")
             return [types.TextContent(type="text", text=f"Safety Sandwich Violation: Domain {url} is not allowed.")]
             
        await browser_manager.navigate(url)
        audit_logger.log_action(name, arguments, "SUCCESS")
        return [types.TextContent(type="text", text=f"Navigated to {url} successfully. Playwright video recording started in artifacts/logs/.")]
        
    elif name == "request_checkout":
        url = arguments.get("url", "")
        price_text = arguments.get("price_text", "")
        items = arguments.get("items", "")
        
        if not safety_policy.is_domain_allowed(url):
            audit_logger.log_action(name, arguments, "REJECTED_DOMAIN")
            return [types.TextContent(type="text", text=f"Safety Violation: Domain not allowed.")]
            
        try:
            amount = safety_policy.validate_price(price_text)
        except ValueError as e:
            audit_logger.log_action(name, arguments, "REJECTED_PRICE")
            return [types.TextContent(type="text", text=str(e))]
            
        txn_id = hitl_manager.request_approval(url, amount, items)
        audit_logger.log_action(name, arguments, f"PENDING_APPROVAL_{txn_id}")
        
        return [types.TextContent(type="text", text=f"Approval Required! Transaction ID: {txn_id}. Ask the user to run `python cli_approver.py {txn_id} APPROVE` to continue, then call `check_approval_status`.")]
        
    elif name == "check_approval_status":
        txn_id = arguments.get("transaction_id")
        status = hitl_manager.get_status(txn_id)
        audit_logger.log_action(name, arguments, status)
        
        if status == "APPROVED":
            # In a real scenario, we'd now execute the checkout skill.
            return [types.TextContent(type="text", text=f"Transaction {txn_id} is APPROVED. You may finalize the purchase using CheckoutSkill.")]
        elif status == "REJECTED":
            return [types.TextContent(type="text", text=f"Transaction {txn_id} was REJECTED by the user.")]
        else:
            return [types.TextContent(type="text", text=f"Transaction {txn_id} is still {status}. Please wait and check again.")]
            
    else:
        raise ValueError(f"Unknown tool: {name}")

async def main():
    import sys
    print("Starting Universal Transaction Gateway MCP Server...", file=sys.stderr, flush=True)
    await browser_manager.initialize()
    
    # Start the 3D-Secure WebSocket Relay in the background
    asyncio.create_task(start_relay_server())
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="universal-transaction-gateway",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
