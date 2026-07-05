/**
 * changelog.js — Version History / Changelog Modal for Cnidaria Frames
 *
 * Displays release notes for each version. Accessible via settings panel.
 */

(function(global) {
    'use strict';

    const CHANGELOG = [
        { version: '1.3', date: '2026-07-05', items: [
            'Seafloor terrain with parallax scrolling',
            'Touch-drag to manually steer jellyfish',
            'Manta ray companion with bioluminescent trail',
            'Plankton bloom events',
            'Meditation breathing guide synced to pulse',
            'Storm mode with lightning and thunder',
            'Color-blind accessible theme variants',
            'Achievement/badge system',
            'Export analytics as JSON',
            'Keyboard help overlay (press ?)',
            'Microphone audio reactivity',
            'Jellyfish lifecycle (grow then split)',
            'Shareable state URLs via hash',
            'Water current/flow meter',
            'Coral reef formations on seafloor',
            'Changelog/version history modal',
            'Auto-dark mode by time of day',
            'Touch ripple effect on water surface',
            'Particle motion-blur trails',
            'Idle behaviors: spin, dive, surface'
        ]},
        { version: '1.2', date: '2026-07-05', items: [
            'Caustics / underwater light rays',
            'Food pellets / feeding interaction',
            'Ocean themes: deep, arctic, reef, abyss',
            'Jellyfish personalities',
            'Predator silhouette pass-by',
            'Ink cloud on error state',
            'Voice commands via Web Speech API',
            'Fullscreen API + Wake Lock',
            'Battery-aware throttling',
            'Screenshot export',
            'Haptic feedback',
            'ARIA screen reader support',
            'Session analytics heatmap',
            'Lunar phase color modulation',
            'WebSocket sync bridge',
            'Settings panel expanded'
        ]},
        { version: '1.1', date: '2026-07-05', items: [
            'Particle/bubble background',
            'Touch gestures',
            'Smooth color interpolation',
            'Bioluminescent glow/bloom',
            'Multi-jellyfish swarm + flocking',
            'Procedural ambient audio',
            'Settings panel',
            'Device orientation',
            'Loading splash screen',
            'PWA icons',
            'Keyboard shortcuts',
            'FPS performance overlay',
            'Sparkle trails',
            'Depth-of-field vignette',
            'Inner heartbeat orb',
            'Responsive scaling',
            'State history + back nav',
            'Spring-physics tentacles',
            'Screensaver auto-cycle',
            'Network status + offline SW'
        ]}
    ];

    class Changelog {
        constructor() {
            this.dom = null;
            this._buildDOM();
        }

        _buildDOM() {
            const el = document.createElement('div');
            el.id = 'changelogModal';
            el.className = 'changelog-modal';
            const rows = CHANGELOG.map(r => {
                const items = r.items.map(i => `<li>${i}</li>`).join('');
                return `
                    <div class="changelog-version">
                        <div class="changelog-header">
                            <span class="changelog-v">v${r.version}</span>
                            <span class="changelog-date">${r.date}</span>
                        </div>
                        <ul class="changelog-list">${items}</ul>
                    </div>
                `;
            }).join('');
            el.innerHTML = `
                <div class="changelog-backdrop"></div>
                <div class="changelog-content">
                    <div class="changelog-header-row">
                        <h2>Changelog</h2>
                        <button class="changelog-close" aria-label="Close changelog">×</button>
                    </div>
                    <div class="changelog-body">${rows}</div>
                </div>
            `;
            document.body.appendChild(el);
            this.dom = {
                root: el,
                backdrop: el.querySelector('.changelog-backdrop'),
                closeBtn: el.querySelector('.changelog-close')
            };
            this.dom.backdrop.addEventListener('click', () => this.hide());
            this.dom.closeBtn.addEventListener('click', () => this.hide());
        }

        show() {
            this.dom.root.classList.add('visible');
        }

        hide() {
            this.dom.root.classList.remove('visible');
        }

        toggle() {
            this.dom.root.classList.toggle('visible');
        }
    }

    global.Changelog = Changelog;
})(window);