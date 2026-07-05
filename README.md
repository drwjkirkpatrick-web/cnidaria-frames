# Cnidaria Frames

A procedural jellyfish agent for Hermes — designed for mobile and desktop alike. Watch translucent cnidaria pulse, drift, and flock through a bioluminescent deep-sea world. Feed them, dodge predators, switch ocean themes, trigger storms, or just breathe in rhythm.

## Quick Start

```bash
cd ~/projects/cnidaria-frames
python3 server.py
# Open http://localhost:9191/
```

To start the WebSocket sync server:
```bash
python3 ws_server.py
# Connects on ws://localhost:9192
```

## Controls

| Gesture / Key | Action |
|---------------|--------|
| Tap canvas | Drop food pellet + ripple |
| Double-tap | Particle burst + bubble pop |
| Swipe up | Next state |
| Swipe down | Previous state |
| Swipe right | Cycle theme |
| Swipe left | Screenshot (PNG) |
| Long-press | Open settings |
| Drag | Steer primary jellyfish |
| `1`–`6` | Jump to state |
| `↑` `←` | Previous state |
| `↓` `→` / `Space` | Next state |
| `a` | Toggle ambient audio |
| `f` | Toggle FPS overlay |
| `e` | Export screenshot |
| `t` | Cycle theme |
| `v` | Toggle voice commands |
| `s` | Open settings |
| `?` | Keyboard help |
| `b` | Toggle breathing guide |
| `m` | Toggle mic reactivity |
| `w` | Toggle storm mode |
| `p` | Trigger plankton bloom |

## Features (v4.0)

- **Procedurally animated jellyfish** from a single still frame — uses vertical slice-warping
  to create flowing tentacle motion, breath pulse, and bell expansion without needing
  a sprite sheet
- **Full-viewport background** — depth-of-field gradient extends beyond corners, no
  boundary edges visible during movement
- **17 AI image models** via Nous Research / FAL.ai, organized by category in optgroups:
  FLUX (7 models), Text & Brand (4), Specialty (6)
- **Deluxe color selector** in settings — Hue/Saturation/Lightness sliders with live
  preview circle, applies directly to jellyfish glow and tint
- **Saved jellyfish gallery** — 3×3 grid of saved images with date, one-click load,
  delete, and preview panel
- **Labeled toolbar** buttons with keyboard shortcuts shown in tooltips (G, V, S, t, a, s)
- **Tab visibility pause** — animation and audio stop when tab is hidden to save battery
- **Smooth re-centering** on resize with lerp interpolation
- **Toast notifications** for save/load feedback
- **Loading spinner** and **error fallback** on image load
- **Single AI-generated jellyfish** — one image-based medusa per session, properly bounded to screen
- **Image generation toolbar** with Generate, Variation, Save buttons (bottom of screen)
- **Settings panel** with custom prompt text input, style selector, lighting selector, model dropdown
- **Prompt builder** with vector-animation nudges: "clean geometric lines, flat colors, no photorealism"
- **8 pre-generated variants** in `assets/jellyfish-variants/`
- **localStorage save** for generated jellyfish with metadata
- **Seafloor terrain** with parallax scrolling
- **Touch-drag steering** of the jellyfish
- **Plankton bloom** events (dense drifting clouds)
- **Storm mode** with lightning flashes and procedural thunder
- **Color-blind accessible** theme variants
- **Achievement/badge system** with localStorage persistence
- **Export analytics** as JSON download
- **Keyboard help overlay** (`?`)
- **Auto-dark mode** by time of day
- **Touch ripple** effect on water surface

### v1.2 Features

- Caustics / underwater god-rays
- Food pellets / feeding interaction
- Ocean themes: deep, arctic, reef, abyss
- Jellyfish personalities: nervous, lazy, curious, leader
- Predator silhouette pass-by with panic scatter
- Ink cloud burst on error state
- Voice commands via Web Speech API
- Fullscreen API + Wake Lock
- Battery-aware performance throttling
- Haptic feedback on transitions
- Screenshot export
- ARIA screen reader support
- Session analytics heatmap
- Lunar phase color modulation
- WebSocket sync bridge (multi-device)
- Settings panel expanded

### v1.1 Features

- Particle/bubble background system
- Touch/swipe/long-press gestures
- Smooth state transition color interpolation
- Bioluminescent glow/bloom
- Multi-jellyfish swarm with flocking
- Procedural ambient underwater audio
- Settings panel (volume, particles, motion, screensaver)
- Device orientation response
- Loading splash screen
- PWA icons (192/512 + touch)
- Keyboard shortcuts
- FPS/performance overlay
- Sparkle trail particles from tentacles
- Depth-of-field vignette
- Inner heartbeat orb
- Responsive jellyfish scaling
- State history with back navigation
- Spring-physics tentacles
- Screensaver auto-cycle
- Network status + offline service worker

## Architecture

```
cnidaria-frames/
├── index.html              # Entry point (script modules + toolbar + preview overlay)
├── css/jellyfish.css       # All styles + toolbar + overlays
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker (stale-while-revalidate)
├── server.py               # HTTP dev server (port 9191)
├── ws_server.py            # WebSocket sync server (port 9192)
├── assets/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── jellyfish-variants/ # 8 AI-generated vector jellyfish images
│       ├── jellyfish-01.png
│       ├── jellyfish-02.png
│       ├── jellyfish-03.png
│       ├── jellyfish-04.png
│       ├── jellyfish-05.png
│       ├── jellyfish-06.png
│       ├── jellyfish-07.png
│       └── jellyfish-08.png
└── js/
    ├── main.js             # v3.0 orchestrator (single image-based jellyfish + generator)
    ├── jellyfish.js        # v3.0: single image-based jellyfish with screen bounds
    ├── jellyfish-image-generator.js  # Prompt builder + variation logic + localStorage save
    ├── particles.js        # Bubbles + sparkles
    ├── gesture-handler.js  # Touch + keyboard
    ├── audio-engine.js     # Procedural ambient sound
    ├── audio-reactive.js   # Mic input reactivity
    ├── settings-panel.js   # Settings UI
    ├── performance-monitor.js # FPS overlay
    ├── state-manager.js    # State machine
    ├── limbic-bridge.js    # Subsystem bridge
    ├── screensaver.js      # Auto-cycle on idle
    ├── themes.js           # Deep/Arctic/Reef/Abyss + CB variants
    ├── food-pellets.js     # Pellet physics + collision
    ├── predator.js         # Silhouette + scatter
    ├── ink-cloud.js        # Error-state burst
    ├── caustics.js         # God-rays
    ├── voice-command.js    # Web Speech API
    ├── system-apis.js      # Fullscreen, Wake Lock, Haptics, Battery
    ├── analytics.js        # Session tracking + JSON export
    ├── lunar-phase.js      # Moon phase calculator
    ├── ws-bridge.js        # WebSocket client sync
    ├── seafloor.js         # Parallax terrain layers
    ├── manta-ray.js        # Manta ray companion
    ├── plankton.js         # Bloom events
    ├── breathing-guide.js  # Meditation overlay
    ├── storm.js            # Lightning + thunder
    ├── achievements.js     # Badge system
    ├── lifecycle.js        # Grow then split
    ├── url-state.js        # Hash-based shareable URLs
    ├── water-current.js    # Flow meter
    ├── coral.js            # Reef formations
    ├── help-overlay.js     # Keyboard reference
    ├── changelog.js        # Version history
    ├── auto-dark.js        # Time-of-day theme switch
    ├── touch-ripple.js     # Water surface ripples
    ├── idle-behavior.js    # Spin/dive/surface/drift
    └── utils.js            # Math helpers
```

## Development Notes

- All modules are vanilla JS (no build step)
- Uses Canvas 2D API for rendering
- Web Audio API for procedural sound
- WebSocket for optional multi-device sync
- Service Worker for offline PWA support
- ~6,200 lines total across all files

## License

MIT — For use with Hermes Agent.