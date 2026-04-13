import os
import sys
from playwright.async_api import async_playwright
from browserbase import Browserbase

class BrowserManager:
    """
    Singleton Browser Manager.
    Supports Local Camoufox (Stealth) and Browserbase (Cloud/CDP).
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(BrowserManager, cls).__new__(cls)
            cls._instance.browser = None
            cls._instance.playwright = None
            cls._instance.mode = os.environ.get("BROWSER_MODE", "camoufox")
        return cls._instance

    async def start(self):
        if not self.playwright:
            self.playwright = await async_playwright().start()
            
            if self.mode == "browserbase":
                print("[Browserbase] Initiating cloud session...", file=sys.stderr)
                bb = Browserbase(api_key=os.environ["BROWSERBASE_API_KEY"])
                session = bb.sessions.create(
                    project_id=os.environ.get("BROWSERBASE_PROJECT_ID"),
                    proxies=True
                )
                self.browser = await self.playwright.chromium.connect_over_cdp(session.connect_url)
                print(f"[Browserbase] Session connected: {session.id}", file=sys.stderr)
            else:
                # Local Camoufox Mode (Desktop Stealth)
                from camoufox.async_api import AsyncCamoufox
                self.browser = await AsyncCamoufox(self.playwright).launch(
                    headless=os.environ.get("HEADLESS", "true").lower() == "true",
                    geoip=True
                )
                print("[Local] Camoufox launched.", file=sys.stderr)

    async def get_page(self):
        if not self.browser:
            await self.start()
        
        if self.mode == "browserbase":
            # Browserbase contexts are usually pre-created
            context = self.browser.contexts[0]
            return context.pages[0] if context.pages else await context.new_page()
        else:
            context = await self.browser.new_context()
            return await context.new_page()

    async def stop(self):
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
        self.browser = None
        self.playwright = None
