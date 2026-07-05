#!/usr/bin/env bash
# tailscale-funnel.sh — Share cnidaria-frames via Tailscale Funnel.
#
# Usage:
#   ./tailscale-funnel.sh [PORT]
# Default port: 8080

set -euo pipefail

PORT="${1:-8080}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate Tailscale is installed and logged in
if ! command -v tailscale &>/dev/null; then
    echo "Tailscale CLI not found. Run ./tailscale-setup.sh first."
    exit 1
fi

if ! tailscale status &>/dev/null; then
    echo "Tailscale is not connected. Run: sudo tailscale up"
    exit 1
fi

cd "$SCRIPT_DIR"

# Start a static server if one isn't already listening
if ! ss -ltn 2>/dev/null | grep -q ":${PORT} "; then
    echo "Starting static server on port ${PORT}..."
    python3 -m http.server "$PORT" &
    SERVER_PID=$!
    sleep 1
else
    echo "Server already running on port ${PORT}."
    SERVER_PID=""
fi

echo ""
echo "Sharing cnidaria-frames on Tailscale Funnel..."
echo "Local URL: http://localhost:${PORT}"
echo ""

# Run funnel in the foreground so Ctrl+C stops sharing
trap 'echo ""; echo "Stopping funnel..."; [ -n "${SERVER_PID}" ] && kill "${SERVER_PID}" 2>/dev/null || true; exit 0' INT TERM
tailscale funnel "http://localhost:${PORT}"
