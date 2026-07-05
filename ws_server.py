#!/usr/bin/env python3
"""
ws_server.py — WebSocket sync server for Cnidaria Frames

Runs on port 9192 by default. Broadcasts state/theme messages
from any connected client to all others. Supports ping/pong.

Usage:
    python3 ws_server.py              # serve on 9192
    PORT=9292 python3 ws_server.py  # serve on 9292
"""

import asyncio
import websockets
import os
import json

PORT = int(os.environ.get("WS_PORT", 9192))
clients = set()


async def handler(websocket):
    clients.add(websocket)
    print(f"[WS] Client connected ({len(clients)} total)")
    try:
        async for message in websocket:
            try:
                data = json.loads(message)
                if data.get("type") == "ping":
                    await websocket.send(json.dumps({"type": "pong"}))
                    continue
                # Broadcast to all other clients
                broadcast_msg = json.dumps(data)
                disconnected = []
                for client in clients:
                    if client is websocket:
                        continue
                    try:
                        await client.send(broadcast_msg)
                    except Exception:
                        disconnected.append(client)
                for d in disconnected:
                    clients.discard(d)
            except json.JSONDecodeError:
                pass
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)
        print(f"[WS] Client disconnected ({len(clients)} total)")


async def main():
    print(f"Cnidaria WS Bridge — ws://localhost:{PORT}/")
    print("Ctrl+C to stop.")
    async with websockets.serve(handler, "", PORT):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nStopped.")