#!/bin/bash
# tailscale-funnel.sh - Expose Cnidaria Frames via Tailscale Funnel

echo "Setting up Tailscale Funnel for Cnidaria Frames..."

# Check if Tailscale is installed and connected
if ! command -v tailscale &> /dev/null; then
    echo "Tailscale is not installed. Please run ./tailscale-setup.sh first."
    exit 1
fi

# Check if we're connected to Tailscale
if ! tailscale status &>/dev/null; then
    echo "Not connected to Tailscale. Please run ./tailscale-setup.sh first."
    exit 1
fi

# Check if Funnel is enabled
if ! tailscale funnel status &>/dev/null; then
    echo "Enabling Tailscale Funnel..."
    sudo tailscale funnel 9191 on
fi

echo "Tailscale Funnel is now enabled for port 9191"
echo "Start the server with: ./server.py"
echo "Access via: https://[your-tailscale-name].tailnet-funnel.ts.net"

# Show the current Tailscale status
echo ""
echo "Your Tailscale status:"
tailscale status