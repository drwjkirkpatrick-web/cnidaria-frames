# Cnidaria Frames

A minimalist jellyfish agent for Hermes, designed to run on small screens like iPads and iPhones.

## Features

- Procedurally animated jellyfish with pulsing body and flowing tentacles
- Multiple states (idle, active, thinking, success, error, sleeping)
- Responsive design for mobile devices
- Lightweight implementation for low-power devices
- PWA support for installation on mobile devices

## Usage

1. Clone the repository
2. Serve the files with any web server
3. Open in a mobile browser
4. Tap the toggle button to cycle through jellyfish states

## Technical Details

- Pure HTML/CSS/JavaScript implementation
- Canvas-based rendering for smooth animations
- No external dependencies
- Works offline when installed as a PWA

## Tailscale Integration

To access this agent through Tailscale:

1. Set up a Tailscale network
2. Install Tailscale on your device
3. Serve this project using a simple HTTP server
4. Access via your Tailscale IP address

Example using Python's built-in server:
```bash
cd ~/projects/cnidaria-frames
python3 -m http.server 8000
```

Then access via: `http://[tailscale-ip]:8000`