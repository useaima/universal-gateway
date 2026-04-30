import asyncio
import websockets
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RelayServer")

connected_clients = {
    "bot": set(),
    "user": set()
}

async def relay_handler(websocket, path):
    """
    Handles WebSocket connections for the PSD2 / 3D-Secure Relay.
    Expected paths: /bot or /user
    """
    client_type = path.strip("/")
    if client_type not in ["bot", "user"]:
        await websocket.close(1008, "Invalid client type path. Must be /bot or /user")
        return

    connected_clients[client_type].add(websocket)
    logger.info(f"New connection on /{client_type}. Total {client_type}s: {len(connected_clients[client_type])}")

    try:
        async for message in websocket:
            logger.info(f"Received message from {client_type}")
            # Route to the opposite client type
            target_type = "user" if client_type == "bot" else "bot"
            
            for target_ws in list(connected_clients[target_type]):
                try:
                    await target_ws.send(message)
                except websockets.ConnectionClosed:
                    connected_clients[target_type].remove(target_ws)
    except websockets.ConnectionClosed:
        pass
    finally:
        connected_clients[client_type].remove(websocket)
        logger.info(f"Connection closed on /{client_type}. Total {client_type}s: {len(connected_clients[client_type])}")

async def start_relay_server(host="127.0.0.1", port=8080):
    logger.info(f"Starting 3D-Secure WebSocket Relay on ws://{host}:{port}")
    # Run the server until the process stops
    async with websockets.serve(relay_handler, host, port):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(start_relay_server())
