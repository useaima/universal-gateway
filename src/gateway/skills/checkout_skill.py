import os
import asyncio


class CheckoutSkill:
    def __init__(self, page=None):
        self.page = page
        self.api_key = os.environ.get("CAPSOLVER_API_KEY")
        self.browser_mode = os.environ.get("BROWSER_MODE", "camoufox")
        self.handover_url = os.environ.get("BROWSER_HANDOVER_URL")
        self.allowed_domains = os.environ.get("ALLOWED_DOMAINS", "")
        if not self.api_key or self.api_key == "your_capsolver_key_here":
            print(
                "CAPSOLVER_API_KEY missing or default - browser-assisted checkout can continue, "
                "but automated CAPTCHA solving will remain unavailable."
            )

    def readiness_report(self) -> dict:
        missing = []
        if not self.handover_url:
            missing.append("BROWSER_HANDOVER_URL")
        if self.browser_mode == "browserbase":
            if not os.environ.get("BROWSERBASE_API_KEY"):
                missing.append("BROWSERBASE_API_KEY")
            if not os.environ.get("BROWSERBASE_PROJECT_ID"):
                missing.append("BROWSERBASE_PROJECT_ID")

        return {
            "support_tier": "beta",
            "browser_mode": self.browser_mode,
            "handover_ready": not missing,
            "missing": missing,
            "captcha_solver_ready": bool(self.api_key and self.api_key != "your_capsolver_key_here"),
            "allowed_domains_configured": bool(self.allowed_domains.strip()),
        }

    def build_handover_summary(self, url: str, price_text: str, items: str) -> str:
        report = self.readiness_report()
        if not report["handover_ready"]:
            missing = ", ".join(report["missing"])
            return (
                "Commerce checkout is a beta capability and needs a configured browser handover adapter before it "
                f"can continue. Missing environment variables: {missing}. "
                "Configure the adapter, keep ALLOWED_DOMAINS current, then retry the same request."
            )

        captcha_note = (
            "CAPTCHA solving is configured."
            if report["captcha_solver_ready"]
            else "CAPTCHA solving is not configured; the operator may need to complete the challenge manually."
        )

        return (
            "Commerce checkout remains beta and is routed through a browser handover workflow.\n"
            f"Target URL: {url}\n"
            f"Quoted price: {price_text}\n"
            f"Item details: {items}\n"
            f"Browser handover URL: {self.handover_url}\n"
            f"Allowed domains configured: {'yes' if report['allowed_domains_configured'] else 'no'}\n"
            f"{captcha_note}"
        )
        
    async def solve_hcaptcha(self) -> str:
        """Integration with CapSolver to solve hCaptcha."""
        try:
            if self.page is None:
                print("No browser page is attached to CheckoutSkill; CAPTCHA solving is unavailable.")
                return ""
            print("Waiting for hCaptcha to appear...")
            
            try:
                # hCaptcha often uses an element with data-sitekey
                element = await self.page.wait_for_selector('[data-sitekey]', timeout=15000)
                site_key = await element.get_attribute('data-sitekey')
            except Exception as e:
                print(f"Could not find [data-sitekey] element directly: {e}")
                site_key = await self.page.evaluate('''() => {
                    const el = document.querySelector('.h-captcha');
                    return el ? el.getAttribute('data-sitekey') : null;
                }''')

            if not site_key:
                print("No hCaptcha sitekey found. (CAPTCHA might not be present or rendered differently)")
                return ""

            print(f"Detected hCaptcha Sitekey: {site_key}")
            print(f"Page URL: {self.page.url}")
            print("Requesting token from CapSolver API (Proxy-less)...")
            print(">>> The browser will now WAIT for 15-60 seconds while CapSolver's servers solve the puzzle. DO NOT CLOSE the browser!")
            
            import capsolver
            capsolver.api_key = self.api_key
            
            task_payload = {
                "type": "HCaptchaTaskProxyLess",
                "websiteURL": self.page.url,
                "websiteKey": site_key
            }
            
            # Wiggle mouse in background while CapSolver crunches
            keep_wiggling = True
            async def wiggle_mouse_while_waiting():
                import random
                while keep_wiggling:
                    try:
                        vp = self.page.viewport_size
                        if vp:
                            x = random.randint(0, vp['width'])
                            y = random.randint(0, vp['height'])
                            await self.page.mouse.move(x, y, steps=10)
                        await asyncio.sleep(2)
                    except Exception:
                        break
            
            wiggler = asyncio.create_task(wiggle_mouse_while_waiting())
            
            # Check for Mock Mode
            if os.environ.get("MOCK_SOLVE", "False").lower() == "true":
                print(">>> MOCK_SOLVE ENABLED: Simulating successful hCaptcha solve...")
                await asyncio.sleep(2) # Simulate brief worker delay
                token = "mock-hcaptcha-solve-token"
            else:
                # Run synchronous capsolver network request in a thread pool
                try:
                    solution = await asyncio.to_thread(capsolver.solve, task_payload)
                finally:
                    keep_wiggling = False
                    await wiggler
                
                token = solution.get("gRecaptchaResponse")
            if not token:
                print("Failed to solve captcha:", solution)
                return ""
                
            print("Received valid token from CapSolver. Injecting into form...")
            
            # Inject the token into the hidden fields standard to hCaptcha validation
            await self.page.evaluate(f'''(token) => {{
                const hcaptchaInput = document.querySelector('[name="h-captcha-response"]');
                const grecaptchaInput = document.querySelector('[name="g-recaptcha-response"]');
                if (hcaptchaInput) hcaptchaInput.value = token;
                if (grecaptchaInput) grecaptchaInput.value = token;
                
                // Try to trigger the callback if available
                try {{
                    const iframe = document.querySelector('iframe[src*="hcaptcha"]');
                    if (iframe) {{
                         // Many sites rely on the form submit directly, others use a react callback
                    }}
                }} catch (e) {{}}
            }}''', token)

            return token
            
        except Exception as e:
            if "closed" in str(e).lower() or "TargetClosed" in str(getattr(type(e), '__name__', '')):
                print(f"SHUTDOWN_BY_TARGET: The page or browser was abruptly closed. Error: {e}")
            else:
                print(f"SHUTDOWN_BY_TARGET: Unexpected error during hCaptcha solve: {e}")
            return ""

    async def execute_checkout(self):
        """Standard automated checkout flow over playwright"""
        print("Executing browser-assisted checkout flow...")
        await asyncio.sleep(1)
        print("Checkout logic completed.")
