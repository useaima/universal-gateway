from typing import Dict, List, Optional

import mcp.types as types

from core.skill_base import SkillBase


class ToolRegistry:
    def __init__(self) -> None:
        self.skills: Dict[str, SkillBase] = {}

    def register(self, skill: SkillBase) -> None:
        self.skills[skill.name] = skill

    async def list_tools(self) -> List[types.Tool]:
        tools: List[types.Tool] = []
        for skill in self.skills.values():
            tools.extend(await skill.get_tools())
        return tools

    async def find_skill_for_tool(self, tool_name: str) -> Optional[SkillBase]:
        for skill in self.skills.values():
            tools = await skill.get_tools()
            if any(tool.name == tool_name for tool in tools):
                return skill
        return None
