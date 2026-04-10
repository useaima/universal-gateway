import asyncio
import os
import sys
import importlib.util
from typing import List, Dict
from dotenv import load_dotenv

import mcp.types as types
from mcp.server.models import InitializationOptions
from mcp.server import Server, NotificationOptions
from mcp.server.stdio import stdio_server

# Adjust path to find core modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core.browser_manager import BrowserManager
from core.audit_logger import AuditLogger
from core.skill_base import SkillBase

# Load .env relative to script
script_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(script_dir, '.env'))

server = Server("universal-transaction-gateway")
browser_manager = BrowserManager()
audit_logger = AuditLogger()

# Skill Registry
skills: Dict[str, SkillBase] = {}

def load_skills():
    """Dynamically load all skill plugins from the skills/ directory."""
    skills_dir = os.path.join(script_dir, "skills")
    for filename in os.listdir(skills_dir):
        if filename.endswith("_skill.py") and not filename.startswith("__"):
            skill_name = filename[:-3]
            module_path = os.path.join(skills_dir, filename)
            
            spec = importlib.util.spec_from_file_location(skill_name, module_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            
            # Find the class that inherits from SkillBase
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (isinstance(attr, type) and 
                    issubclass(attr, SkillBase) and 
                    attr is not SkillBase):
                    skill_instance = attr()
                    skills[skill_instance.name] = skill_instance
                    print(f"Loaded Skill: {skill_instance.name}", file=sys.stderr)

@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    all_tools = []
    # Core Tools
    all_tools.append(types.Tool(
        name="navigate",
        description="Navigate safely to a specific URL.",
        inputSchema={
            "type": "object",
            "properties": {"url": {"type": "string"}},
            "required": ["url"]
        }
    ))
    
    # Load tools from each skill
    for skill in skills.values():
        skill_tools = await skill.get_tools()
        all_tools.extend(skill_tools)
        
    return all_tools

@server.call_tool()
async def handle_call_tool(name: str, arguments: dict | None) -> list[types.TextContent]:
    if arguments is None: arguments = {}
    
    # Core Tool Routing
    if name == "navigate":
        url = arguments.get("url")
        await browser_manager.navigate(url)
        audit_logger.log_action(name, arguments, "SUCCESS")
        return [types.TextContent(type="text", text=f"Navigated to {url}")]

    # Skill Routing
    for skill in skills.values():
        tools = await skill.get_tools()
        if any(t.name == name for t in tools):
            return await skill.handle_tool_call(name, arguments)
            
    raise ValueError(f"Unknown tool: {name}")

async def main():
    print("Starting Universal Transaction Gateway Service (GaaS Mode)...", file=sys.stderr, flush=True)
    
    # Initialize Core
    load_skills()
    await browser_manager.initialize()
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="universal-transaction-gateway",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                )
            )
        )

if __name__ == "__main__":
    asyncio.run(main())
