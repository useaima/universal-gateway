import asyncio
from browser_manager import BrowserManager, human_delay

async def main():
    try:
        manager = BrowserManager()
        print("Initializing manager...")
        await manager.initialize()
        
        print("Starting navigate...")
        await manager.navigate("https://wikipedia.org")
        print("Navigate finished!")
        
        print("Starting human_delay...")
        await human_delay(page=manager.page, min_s=1.0, max_s=2.0)
        print("Human delay finished!")
        
    finally:
        print("Closing manager...")
        await manager.close()

if __name__ == "__main__":
    asyncio.run(main())
