# Cnidaria Frames

A procedural jellyfish agent for Hermes — designed for mobile and desktop alike. Watch translucent cnidaria pulse, drift, and flock through a bioluminescent deep-sea world.

## Quick Start

```bash
cd cnidaria-frames
python3 server.py
```

Open `http://localhost:9191` in a browser.

## Project Structure

```
cnidaria-frames/
├── index.html              # Entry point (splash, canvas, UI shell)
├── manifest.json           # PWA manifest with icons
├── sw.js                    # Service worker (offline cache, stale-while-revalidate)
├── server.py               # HTTP server (port 9191, SO_REUSEADDR)
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
    ├── state-manager.js    # State machine with history
    ├── limbic-bridge.js    # Simulated Hermes limbic connection
    ├── particles.js        # Bubble ambient + sparkle trail system
    ├── gesture-handler.js  # Touch, swipe, long-press, keyboard shortcuts
    ├── audio-engine.js     # Procedural ambient underwater audio
    ├── settings-panel.js   # Persistent settings overlay (localStorage)
    ├── performance-monitor.js # FPS / frame-time / particle count overlay
    ├── screensaver.js      # Auto-cycle states after idle timeout
    ├── jellyfish.js        # Procedural renderer with flocking physics
    └── main.js             # Animation loop, composition, event wiring
```

## Controls

| Action | How |
|--------|-----|
| Cycle state forward | Tap 🔄 button, swipe up, `→`, `↓`, or `Space` |
| Go back one state | Swipe down, `←`, or `↑` |
| Jump to state 1–6 | Press `1` (idle) through `6` (sleeping) |
| Open settings | Long-press anywhere, or press `s` |
| Toggle FPS overlay | Press `f` |
| Toggle ambient audio | Press `a` (starts on first tap) |
| Emit sparkle burst | Double-tap anywhere on canvas |
| Dismiss splash | Auto-dismisses after first draw |

## States

| State | Pulse | Color | Description |
|-------|-------|-------|-------------|
| idle | slow | blue | Calm, baseline presence |
| active | fast | bright cyan | Engaged and alert |
| thinking | slow | purple | Processing, reflective |
| success | rapid | green | Positive completion |
| error | very fast | red | Alert / problem state |
| sleeping | very slow | dim blue | Rest, low activity |

Colors transition smoothly between states via interpolated RGB lerp.

## Features

### Visual
- **Procedural jellyfish** — elliptical bell body, spring-physics tentacles with segmented sway, inner heartbeat orb, rim highlights
- **Bioluminescent glow** — radial bloom gradient around each jellyfish
- **Ambient bubbles** — rising particles with lateral drift and top-fade
- **Sparkle trails** — bioluminescent particles emitted from tentacle tips
- **Depth-of-field overlay** — radial vignette darkens edges for immersion
- **Splash screen** — branded loading animation on first boot

### Animation
- **Flocking swarm** — companions join on larger screens; separation, alignment, and cohesion via soft-body physics
- **Spring-physics tentacles** — each segment is spring-simulated toward a sway target instead of pure sine waves
- **State-driven pulse rates** — each state modulates pulse speed independently
- **Smooth color transitions** — RGB interpolation between state palettes
- **Screensaver mode** — auto-cycles states after 20s of idle; pauses on interaction

### Interaction
- **Touch gestures** — tap, double-tap, long-press, swipe-up/down/left/right via unified Pointer Events
- **Device orientation** — gentle gyroscope tilt response (iOS/Android) with adjustable sensitivity
- **Keyboard shortcuts** — all primary actions mapped to keys for desktop/debug use
- **Settings panel** — volume, particle count, motion sensitivity, screensaver, reduced motion, FPS toggle (persisted in `localStorage`)

### Audio
- **Procedural underwater soundscape** — layered sub-bass drone, bandpassed water resonance noise, random bubble pops
- **Web Audio API** — zero external files, synthesized entirely in-browser
- **Volume control** — exposed in settings panel

### Performance
- **FPS / frame-time monitor** — toggle with `f` key or settings
- **Particle budget caps** — sparkle emission throttled; bubble count scales with setting
- **Visibility pause** — animation and audio pause when tab is hidden
- **Reduced motion** — respects `prefers-reduced-motion` and manual toggle
- **Device-pixel-ratio aware** — crisp rendering on Retina/HiDPI displays

### PWA & Offline
- **Installable** — `manifest.json` with 192×192 and 512×512 icons
- **Offline capable** — Service Worker caches all assets with stale-while-revalidate strategy
- **Network status indicator** — top-left dot shows online/offline state
- **iOS optimized** — `apple-mobile-web-app-capable`, `apple-touch-icon`, safe-area insets

## Tailscale

```bash
./tailscale-setup.sh     # Connect to your tailnet
./tailscale-funnel.sh    # Expose port 9191 publicly
python3 server.py         # Start server
```

Access from any device: `http://[tailscale-ip]:9191`

## Tech

- Pure HTML/CSS/JS — zero dependencies, zero build step
- Canvas 2D rendering with `devicePixelRatio` scaling
- PWA installable on iOS (Add to Home Screen) and Android
- Modular IIFE architecture; no bundler required
- ~25 KB JS + ~4 KB CSS (excluding icons)