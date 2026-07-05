#!/usr/bin/env bash
# tailscale-setup.sh — Install Tailscale on this Linux host if needed.
# Run once with sudo.

set -euo pipefail

if command -v tailscale &>/dev/null; then
    echo "Tailscale already installed: $(tailscale version 2>/dev/null | head -1 || true)"
    exit 0
fi

echo "Installing Tailscale..."

# Generic Linux installer from tailscale.com
# Works on Debian/Ubuntu, Fedora, Arch, etc.
curl -fsSL https://tailscale.com/install.sh | sh

echo "Tailscale installed."
echo "Next steps:"
echo "  sudo tailscale up"
echo "  ./tailscale-funnel.sh"
