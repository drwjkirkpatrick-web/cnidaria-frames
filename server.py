#!/usr/bin/env python3
"""
Simple HTTP server for Cnidaria Frames.

Runs on port 9191 by default. Use --port N or set PORT env var to override.

Usage:
    python3 server.py              # serve on 9191
    PORT=8888 python3 server.py    # serve on 8888
"""

import http.server
import socketserver
import os
import sys

PORT = int(os.environ.get("PORT", 9191))
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class ReusableTCPServer(socketserver.TCPServer):
    """TCPServer with SO_REUSEADDR so restarts don't hit 'Address already in use'."""
    allow_reuse_address = True


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def main():
    with ReusableTCPServer(("", PORT), Handler) as httpd:
        print(f"Cnidaria Frames — http://localhost:{PORT}/")
        print("Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()