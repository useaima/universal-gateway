import asyncio
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
import sys

async def main():
    print("Starting up the MCP Client...")
    
    # Configure the client to start the python server via stdio
    # Assuming we run this from the project root where server.py is located.
    server_params = StdioServerParameters(
        command=sys.executable,
        args=["server.py", ]
    )
    
    print("Connecting to server.py...")
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize connection to server
            await session.initialize()
            print("Successfully initialized MCP session.\n")
            
            # 1. Check tools
            print("Querying available tools...")
            tools_result = await session.list_tools()
            tools = [tool.name for tool in tools_result.tools]
            print(f"Tools provided by Universal Transaction Gateway: {tools}\n")
            
            # 2. Simulate AI calling `request_checkout`
            print("Simulating AI requesting a checkout (Under $50 limit, allowed domain)...")
            tool_args = {
                "url": "https://wikipedia.org", 
                "price_text": "$45.00", 
                "items": "Wikipedia Foundation Donation"
            }
            
            response = await session.call_tool("request_checkout", arguments=tool_args)
            if response.content and hasattr(response.content[0], 'text'):
                output_text = response.content[0].text
                print(f"Server Response:\n---> {output_text}\n")
            else:
                 print(f"Server Response:\n---> {response}\n")
                 
            # Extract txn_id from response if possible
            txn_id = None
            if "Transaction ID:" in output_text:
                 parts = output_text.split("Transaction ID:")[1].strip().split(".")
                 txn_id = parts[0].strip()
                 
            if not txn_id:
                 print("Could not parse transaction ID. Exiting.")
                 return
                 
            print(f"Hitl Flow Triggered! Transaction ID is: {txn_id}")
            print("The agent is now frozen, waiting for your approval.")
            print(f"\n[ACTION REQUIRED] Open a new terminal and run:\n  python cli_approver.py {txn_id} APPROVE\n")
            
            # 3. Simulate AI polling for checking approval
            print("The AI client will now poll the server every 5 seconds checking approval status...")
            for i in range(12): # Poll for 1 minute
                await asyncio.sleep(5)
                poll_resp = await session.call_tool("check_approval_status", arguments={"transaction_id": txn_id})
                if poll_resp.content and hasattr(poll_resp.content[0], 'text'):
                     poll_text = poll_resp.content[0].text
                     print(f"Poll {i+1}: {poll_text}")
                     if "APPROVED" in poll_text or "REJECTED" in poll_text:
                          print("\nHITL interaction completed! The LLM would now proceed with executing checkout or aborting.")
                          break
            
            print("\nShutting down AI Client.")

if __name__ == "__main__":
    asyncio.run(main())
