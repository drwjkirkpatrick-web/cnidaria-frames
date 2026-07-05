# Cnidaria Frames

A minimalist jellyfish agent for Hermes, designed for small screens (half-iPad, iPhone).

## Quick Start

```bash
cd cnidaria-frames
python3 server.py
```

Open `http://localhost:9191` in a browser. Tap 🔄 to cycle states.

## Project Structure

```
cnidaria-frames/
├── index.html           # Entry point
├── manifest.json        # PWA manifest
├── sw.js                 # Service worker (offline cache)
├── server.py             # HTTP server (port 9191, SO_REUSEADDR safe)
├── start.sh              # Convenience wrapper
├── tailscale-setup.sh    # Tailscale connection helper
├── tailscale-funnel.sh   # Tailscale Funnel (public HTTPS access)
├── css/
│   └── jellyfish.css     # Responsive styles (iPhone/iPad)
└── js/
    ├── utils.js          # Math helpers, color utilities
    ├── state-manager.js  # State machine (idle/active/thinking/etc.)
    ├── limbic-bridge.js  # Simulated Hermes limbic connection
    ├── jellyfish.js      # Procedural jellyfish renderer
    └── main.js           # Animation loop controller
```

## States

| State | Pulse | Color |
|-------|-------|-------|
| idle | slow | blue |
| active | fast | bright blue |
| thinking | slow | purple |
| success | rapid | green |
| error | very fast | red |
| sleeping | very slow | dim blue |

## Tailscale

```bash
./tailscale-setup.sh     # Connect to your tailnet
./tailscale-funnel.sh    # Expose port 9191 publicly via Funnel
python3 server.py         # Start server
```

Access from any device: `http://[tailscale-ip]:9191`

## Tech

- Pure HTML/CSS/JS — zero dependencies, zero build step
- Canvas-based rendering
- PWA installable on iOS (Add to Home Screen)
- ~15 KB total