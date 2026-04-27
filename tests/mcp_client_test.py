import asyncio
import sys

from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client


async def main():
    print("Starting MCP client smoke test...")

    server_params = StdioServerParameters(
        command=sys.executable,
        args=["src/gateway/server.py"],
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools_result = await session.list_tools()
            tools = [tool.name for tool in tools_result.tools]
            print(f"Available tools: {tools}")

            response = await session.call_tool(
                "request_eth_transfer_reliable",
                arguments={
                    "to_address": "0xAliciaWalletAddress000000000000000000000000",
                    "amount_eth": 0.01,
                    "user_id": "demo-operator",
                    "network": "base",
                },
            )
            print(response.content[0].text)


if __name__ == "__main__":
    asyncio.run(main())
