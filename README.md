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

## Features (v6.2)

- **Fixed critical button-wiring bug** — `JellyfishAnimator._initSprings()` was
  called before `this.personality.modes` was defined, throwing a `TypeError`
  that crashed `init()` before button `addEventListener` lines ran. Every
  toolbar button was dead. Now fixed: springs init after personality modes,
  and all button wiring runs first via `setupToolbarButtons()`.
- **New Help button** on the toolbar — opens the keyboard shortcuts overlay
  without needing to press `?`
- **Visual feedback toasts** on all toolbar button clicks (theme change,
  audio toggle, variation generated, etc.)
- **Robust init order** — button wiring is now independent of jellyfish
  creation, so even if a subsystem fails to initialize, buttons still work
- **Thought Bubble** — type what the jellyfish is thinking; floating text appears above
  with fade-in, gentle rise, and auto-dismiss after 3 seconds
- **Remedy Personality Picker** — 12 homeopathic remedies (Pulsatilla, Bryonia, Arsenicum,
  Natrum Muriaticum, Sulphur, Sepia, Nux Vomica, Lachesis, Phosphorus, Silica,
  Calcarea Carbonica, Causticum) each with unique animation profiles, colors, timing,
  and limbic targets
- **Guided Session Timer** — remedy-specific meditation timers (4–15 min) with
  breath-pattern labels (e.g. 4-7-8, 3-3-3, 5-0-5), start/stop/complete UI
- **Enhanced Hermes Limbic Bridge** — real-time arousal/valence/dominance bars with
  emotional state labels (Calm, Excited, Anxious, Confident, etc.);
  remedy selection smoothly interpolates limbic targets
- **Image Scale slider** — 0.3× to 2.0× fine-grained size control
- **Image Opacity slider** — ghostly translucent to fully opaque
- **Cast Shadow toggle** — soft ellipse shadow beneath jellyfish for grounded depth
- **12 Principles of Animation** implemented for still-frame jellyfish:
  - **Squash & Stretch** — bell compresses/expands with volume conservation (W×H constant)
  - **Anticipation** — brief shrink before major movements (triggerable in settings)
  - **Staging** — silhouette, lighting focus, glow follows personality
  - **Follow Through & Overlapping Action** — spring-based tentacle physics (8 slices with lag)
  - **Slow In & Slow Out** — eased sine interpolation, lerp-based repositioning
  - **Arcs** — curved drift paths (not linear), wave-pattern vertical floating
  - **Secondary Action** — ambient plankton particles drifting from bell
  - **Timing** — three presets: Drifting (0.4×), Flowing (1×), Pulsing (2×)
  - **Exaggeration** — personality modes: Shy (subtle), Curious (energetic), Majestic (balanced)
  - **Solid Drawing** — volume conservation during squash, sliced tentacle rendering
  - **Appeal** — micro-expressions (blink, tentacle twitch) for subtle performance
- **Scene pacing / mood cycles** — auto-cycles through calm→curious→majestic→drifting
- **Procedurally animated jellyfish** from a single still frame — vertical slice-warping
- **Full-viewport background** — DOF gradient extends beyond corners
- **17 AI image models** via Nous Research / FAL.ai (FLUX, Ideogram, Recraft, SDXL, etc.)
- **Deluxe color selector** — HSL sliders with live preview
- **Saved jellyfish gallery** — 3×3 grid with load/delete/preview
- **Labeled toolbar** with keyboard shortcuts (G, V, S, t, a, s, ?)
- **Tab visibility pause** for battery saving
- **Toast notifications** for save/load feedback
- **Export analytics** as JSON download
- **Keyboard help overlay** (`?`)
- **Auto-dark mode** by time of day
- **WebSocket sync** for multi-device sessions
- **Seafloor terrain** with parallax scrolling
- **Manta ray companion** with schooling behavior
- **Touch-drag steering** of the jellyfish
- **Plankton bloom** events (dense drifting clouds)
- **Storm mode** with lightning flashes and procedural thunder
- **Color-blind accessible** theme variants
- **Achievement/badge system** with localStorage persistence
- **Voice commands** ("generate", "theme", "screenshot")
- **Breathing guide** overlay for meditation
- **Audio-reactive** mic input drives particle intensity
- **Lifecycle simulation** (egg → polyp → ephyra → medusa)
- **URL state** sharing (theme, personality, etc. encoded in hash)
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
    ├── main.js             # v5.0 orchestrator (professional animation + generator)
    ├── jellyfish.js        # v5.0: single image-based jellyfish with animator integration
    ├── jellyfish-animator.js  # v5.0: 12 Principles of Animation engine
    ├── remedy-personality.js  # v6.0: 12 homeopathic remedy profiles with animation + limbic targets
    ├── jellyfish-image-generator.js  # Prompt builder + variation logic + localStorage save + gallery
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