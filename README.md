# Cnidaria Frames

A minimalist jellyfish agent for Hermes, designed to run on small screens like iPads and iPhones.

## Features

- Procedurally animated jellyfish with pulsing body and flowing tentacles
- Multiple states (idle, active, thinking, success, error, sleeping)
- Responsive design for mobile devices
- Lightweight implementation for low-power devices
- PWA support for installation on mobile devices

## Usage

### Quick Start

1. Clone the repository
2. Run `./start.sh` to start the server
3. Open `http://localhost:8282` in a browser
4. Tap the toggle button to cycle through jellyfish states

### Manual Start

1. Clone the repository
2. Run `python3 server.py` to start the server
3. Open `http://localhost:8282` in a browser
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
3. Run `./tailscale-setup.sh` to configure Tailscale
4. Run `./tailscale-funnel.sh` to enable Funnel access
5. Access via your Tailscale URL

Example using Python's built-in server:
```bash
cd ~/projects/cnidaria-frames
python3 -m http.server 8282
```

Then access via: `http://[tailscale-ip]:8282`

## States

The jellyfish can be in one of several states that affect its appearance and behavior:

- **idle**: Default state with slow pulsing
- **active**: Increased pulsing speed with brighter colors
- **thinking**: Slower pulsing with purple hues
- **success**: Fast pulsing with green colors
- **error**: Very fast pulsing with red colors
- **sleeping**: Very slow pulsing with dimmer colors

## Customization

You can customize the jellyfish by modifying:

- `js/jellyfish.js`: Jellyfish appearance and behavior
- `css/jellyfish.css`: Visual styling
- `js/state-manager.js`: State management logic
- `js/limbic-bridge.js`: Connection to Hermes limbic system