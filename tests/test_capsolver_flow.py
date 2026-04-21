import asyncio
from dotenv import load_dotenv
load_dotenv()

from browser_manager import BrowserManager, human_delay
from skills.checkout_skill import CheckoutSkill

async def main():
    print("Initializing test flow...")
    manager = BrowserManager()
    await manager.initialize()

    try:
        page = manager.page
        url = "https://accounts.hcaptcha.com/demo"
        print(f"Navigating to {url}")
        await manager.navigate(url)
        
        print("Navigated. Brief sleep for visual output (2s)...")
        await asyncio.sleep(2)

        # Initialize skill
        checkout = CheckoutSkill(page=page)
        
        # Check if the capsolver API key is loaded properly
        if checkout.api_key == "your_capsolver_key_here":
            print("WARNING: API Key is default. The test will fail if it tries to hit CapSolver.")
        else:
            print("API Key OK.")
            
        # Attempt solving
        try:
            token = await checkout.solve_hcaptcha()
        except Exception as e:
            print(f"SHUTDOWN_BY_TARGET: {e}")
            token = None
        
        if token:
            print("The puzzle was solved and token extracted")
            print("Token injection successful! Waiting 2s before submitting form...")
            await human_delay(page=page, min_s=1.5, max_s=2.5)
            
            try:
                # Click submit. The demo uses a standard input[type="submit"] named "submit" inside the form
                print("Clicking submit button...")
                submit_button = await page.wait_for_selector('input[type="submit"]')
                await submit_button.click()
                
                # Wait for navigation or results
                await asyncio.sleep(4)
                content = await page.content()
                if "success" in content.lower() or "passed" in content.lower() or "verification" in content.lower():
                     print("SUCCESS - CapSolver has bypassed demo validation!")
                else:
                     print("SUBMITTED - Please manually review the screen or artifacts for success.")
            except Exception as e:
                print(f"SHUTDOWN_BY_TARGET (During form submission): {e}")
        else:
            print("FAILED - Token not retrieved from capsolver.")
            
    finally:
        await manager.close()
        print("Test complete.")

if __name__ == "__main__":
    asyncio.run(main())
