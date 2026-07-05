#!/bin/bash
# tailscale-setup.sh - Setup script for Tailscale access

echo "Setting up Tailscale for Cnidaria Frames..."

# Check if Tailscale is installed
if ! command -v tailscale &> /dev/null; then
    echo "Tailscale is not installed. Please install it first:"
    echo "  Ubuntu/Debian: curl -fsSL https://tailscale.com/install.sh | sh"
    echo "  Other systems: https://tailscale.com/download"
    exit 1
fi

# Check if we're already connected to Tailscale
if tailscale status &>/dev/null; then
    echo "Already connected to Tailscale"
else
    echo "Please authenticate with Tailscale by visiting the URL below:"
    tailscale up
fi

echo "Tailscale setup complete!"
echo "Run './server.py' to start the Cnidaria Frames server"
echo "Then access it via your Tailscale IP address"