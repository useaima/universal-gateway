from abc import ABC, abstractmethod
from typing import List
import mcp.types as types

class SkillBase(ABC):
    """
    Base class for all Gateway Skills.
    Each skill defines its own tools and handles its own logic,
    but leverages the Core (Browser, HITL, Audit) for security.
    """
    
    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    async def get_tools(self) -> List[types.Tool]:
        """Return the tools provided by this skill."""
        pass

    @abstractmethod
    async def handle_tool_call(self, name: str, arguments: dict) -> List[types.TextContent | types.ImageContent | types.EmbeddedResource]:
        """Handle execution of tools assigned to this skill."""
        pass
