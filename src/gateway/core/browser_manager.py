import os
import asyncio
import random
from typing import Optional
from camoufox.async_api import AsyncCamoufox
from playwright.async_api import Page, BrowserContext

async def human_delay(page: Optional[Page] = None, min_s: float = 1.5, max_s: float = 4.0):
    """Introduces a random delay to simulate human pacing."""
    delay = random.uniform(min_s, max_s)
    await asyncio.sleep(delay)

class BrowserManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BrowserManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, '_initialized', False):
            return
        self.browser: Optional[AsyncCamoufox] = None
        self.context: Optional[BrowserContext] = None
        self.page: Optional[Page] = None
        self.proxy_url = os.environ.get("PROXY_URL")
        self._initialized = True

    async def initialize(self):
        """Starts Camoufox with stealth config."""
        os.makedirs("artifacts/logs", exist_ok=True)
        
        launch_args = {
            "headless": False, 
            "enable_cache": False,
            "humanize": True, 
            "os": "windows",
        }
        
        if self.proxy_url and self.proxy_url != "your_residential_proxy_url_here" and self.proxy_url != "PROXY_URL":
            launch_args["proxy"] = {"server": self.proxy_url}

        import sys
        print("Launching Ultra-Stealth Browser (Camoufox Windows Target)...", file=sys.stderr)
        self.camoufox_app = AsyncCamoufox(**launch_args)
        self.browser = await self.camoufox_app.__aenter__()
        
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()

    async def navigate(self, url: str):
        if not self.page:
            await self.initialize()
        try:
            await self.page.goto(url, wait_until="domcontentloaded", timeout=15000)
        except Exception as e:
            import sys
            print(f"Navigation timeout (expected on active CAPTCHA pages): {e}", file=sys.stderr)

    async def get_page_content(self) -> str:
        if not self.page:
            return ""
        return await self.page.content()

    async def close(self):
        if hasattr(self, 'context') and self.context:
            await self.context.close()
        if hasattr(self, 'camoufox_app') and self.camoufox_app:
            await self.camoufox_app.__aexit__(None, None, None)
        elif self.browser:
            await self.browser.close()
