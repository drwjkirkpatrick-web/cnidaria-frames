# Cnidaria Frames

A procedural jellyfish agent for Hermes — designed for mobile and desktop alike. Watch translucent cnidaria pulse, drift, and flock through a bioluminescent deep-sea world. Feed them, dodge predators, switch ocean themes, and sync across devices.

## Quick Start

```bash
cd cnidaria-frames
python3 server.py          # HTTP server on :9191
python3 ws_server.py       # WebSocket bridge on :9192 (optional)
```

Open `http://localhost:9191` in a browser.

## Project Structure

```
cnidaria-frames/
├── index.html              # Entry point (splash, canvas, UI shell)
├── manifest.json           # PWA manifest with icons
├── sw.js                    # Service worker (offline cache, stale-while-revalidate)
├── server.py               # HTTP server (port 9191, SO_REUSEADDR)
├── ws_server.py            # WebSocket sync server (port 9192, optional)
├── start.sh                # Convenience wrapper
├── tailscale-setup.sh      # Tailscale connection helper
├── tailscale-funnel.sh     # Tailscale Funnel (public HTTPS)
├── assets/
│   ├── icon-192.png        # PWA icon (192×192)
│   ├── icon-512.png        # PWA icon (512×512)
│   └── apple-touch-icon.png # iOS home-screen icon
├── css/
│   └── jellyfish.css       # Responsive styles, settings panel, overlays
└── js/
    ├── utils.js            # Math helpers, color utilities
    ├── lunar-phase.js      # Real-time lunar phase calculator
    ├── themes.js           # Ocean theme system (deep/arctic/reef/abyss)
    ├── personality.js      # Jellyfish personality traits
    ├── state-manager.js    # State machine with history
    ├── limbic-bridge.js    # Simulated Hermes limbic connection
    ├── caustics.js         # Procedural underwater light shafts
    ├── ink-cloud.js        # Ink burst effect on error state
    ├── particles.js        # Bubble ambient + sparkle trail system
    ├── food-pellets.js     # Feeding interaction with ripple effects
    ├── predator.js         # Predator silhouette pass-by + panic scatter
    ├── gesture-handler.js  # Touch, swipe, long-press, keyboard shortcuts
    ├── voice-command.js    # Web Speech API hands-free control
    ├── audio-engine.js     # Procedural ambient underwater audio
    ├── system-apis.js      # Fullscreen, Wake Lock, battery, haptic, screenshot
    ├── analytics.js        # Lightweight session stats + heatmap
    ├── settings-panel.js   # Persistent settings overlay (localStorage)
    ├── performance-monitor.js # FPS / frame-time / particle count overlay
    ├── screensaver.js      # Auto-cycle states after idle timeout
    ├── ws-bridge.js        # Cross-device WebSocket sync client
    ├── jellyfish.js        # Procedural renderer with flocking physics
    └── main.js             # Animation loop, composition, event wiring
```

## Controls

| Action | How |
|--------|-----|
| Cycle state forward | Tap 🔄, swipe up, `→`, `↓`, or `Space` |
| Go back one state | Swipe down, `←`, or `↑` |
| Jump to state 1–6 | Press `1` (idle) through `6` (sleeping) |
| Open settings | Long-press anywhere, or press `s` |
| Toggle FPS overlay | Press `f` |
| Toggle ambient audio | Press `a` |
| Export screenshot | Press `e` |
| Cycle theme | Swipe right, or press `t` |
| Toggle voice commands | Press `v` |
| Toggle fullscreen | In settings panel |
| Drop food | Tap anywhere on canvas |
| Emit sparkle burst | Double-tap anywhere |
| Dismiss splash | Auto-dismisses after first draw |

## States

| State | Pulse | Color | Description |
|-------|-------|-------|-------------|
| idle | slow | blue | Calm, baseline presence |
| active | fast | bright cyan | Engaged and alert |
| thinking | slow | purple | Processing, reflective |
| success | rapid | green | Positive completion |
| error | very fast | red | Alert / ink cloud burst |
| sleeping | very slow | dim blue | Rest, low activity |

Colors transition smoothly between states via interpolated RGB lerp.

## Themes

| Theme | Palette | Character |
|-------|---------|-----------|
| **Deep** (default) | Midnight blue, silver bubbles | Classic deep-sea |
| **Arctic** | Icy cyan, white sparkles | Cold, crystalline |
| **Reef** | Warm coral, gold particles | Tropical, vibrant |
| **Abyss** | Near-black, violet flashes | Deep, mysterious |

Themes affect background color, bubble/sparkle hues, caustic tint, and jellyfish color shift. Swipe right or press `t` to cycle.

## Features

### Visual
- **Procedural jellyfish** — elliptical bell, spring-physics tentacles, inner heartbeat orb, rim highlights
- **Bioluminescent glow** — radial bloom around each jellyfish
- **Ambient bubbles** — rising particles with lateral drift and top-fade
- **Sparkle trails** — particles emitted from tentacle tips
- **Caustics / god-rays** — procedural light shafts sweeping the viewport
- **Depth-of-field** — radial vignette with theme + lunar tinting
- **Ink clouds** — dark diffusion burst on error state transitions
- **Splash screen** — branded loading animation

### Animation
- **Flocking swarm** — companions join on larger screens; separation/alignment/cohesion physics
- **Spring-physics tentacles** — per-segment spring simulation
- **State-driven pulse rates** — each state modulates pulse independently
- **Smooth color transitions** — RGB interpolation between palettes
- **Screensaver mode** — auto-cycles states after idle; pauses on interaction
- **Personality system** — each jellyfish has a trait: nervous, lazy, curious, leader, or default
- **Predator pass-by** — shadowy silhouette triggers panic scatter + haptic feedback

### Interaction
- **Touch gestures** — tap (food drop), double-tap (sparkles), long-press (settings), swipe (states/themes)
- **Device orientation** — gyroscope tilt response with adjustable sensitivity
- **Keyboard shortcuts** — all actions mapped; `1-6`, arrows, space, `a/f/e/s/t/v`
- **Voice commands** — hands-free state/theme changes via Web Speech API (`v` to toggle)
- **Feeding** — tap to drop food pellets; jellyfish pursue and consume with ripple effects
- **Settings panel** — volume, particles, theme, motion, screensaver, reduced motion, FPS, voice, predators, fullscreen

### Audio
- **Procedural underwater soundscape** — layered sub-bass drone, bandpassed resonance, bubble pops
- **Web Audio API** — zero external files
- **Volume control** — exposed in settings

### System APIs
- **Fullscreen API** — toggle via settings panel
- **Wake Lock API** — keeps screen awake while active
- **Battery-aware throttling** — reduces particle/effect intensity below 20% battery
- **Haptic feedback** — light pulse on state change; panic pattern on predator
- **Screenshot export** — `e` key downloads PNG with timestamp
- **Screen reader support** — ARIA live region announcements for all state/theme changes

### Analytics
- **Session heatmap** — tracks state frequencies, theme usage, interactions, food eaten, predator encounters
- **Accessible via settings panel** — rendered as inline HTML table
- **In-memory only** — no external tracking

### Lunar Phase
- **Live moon phase** — computed from synodic month algorithm
- **Ambient modulation** — new moon = darker, deeper; full moon = brighter, silver-blue tint
- **Affects background brightness and jellyfish color subtly**

### Multi-Device Sync
- **WebSocket bridge** — state and theme changes broadcast to all connected clients
- **Client: `ws-bridge.js`** — auto-reconnects, queues messages while offline
- **Server: `ws_server.py`** — lightweight Python `websockets` broadcast relay
- **Runs on port 9192** — start alongside HTTP server for sync

### PWA & Offline
- **Installable** — `manifest.json` with 192×192 and 512×512 icons
- **Offline capable** — Service Worker caches all assets with stale-while-revalidate
- **Network status** — top-left dot shows online/offline state
- **iOS optimized** — `apple-mobile-web-app-capable`, `apple-touch-icon`, safe-area insets

## Tailscale

```bash
./tailscale-setup.sh     # Connect to your tailnet
./tailscale-funnel.sh    # Expose port 9191 publicly
python3 server.py         # Start HTTP server
python3 ws_server.py      # Start WebSocket bridge (optional)
```

Access from any device: `http://[tailscale-ip]:9191`

## Tech

- Pure HTML/CSS/JS — zero dependencies, zero build step
- Canvas 2D with `devicePixelRatio` scaling
- Modular IIFE architecture; no bundler required
- Web Audio API for procedural sound
- Web Speech API for voice control
- WebSocket for multi-device sync
- PWA installable on iOS and Android
- ~45 KB JS + ~10 KB CSS (excluding icons)