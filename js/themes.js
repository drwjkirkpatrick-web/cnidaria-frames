/**
 * themes.js — Ocean Theme System for Cnidaria Frames
 *
 * Four ambient themes:
 *   deep    — classic midnight blue (default)
 *   arctic  — icy cyan-white with slow drift
 *   reef    — warm coral-gold with bright particles
 *   abyss   — near-black with rare, intense bioluminescent flashes
 *
 * Each theme provides: background gradient, bubble color, sparkle hue range,
 * caustic color, and depth-of-field tint.
 */

(function(global) {
    'use strict';

    const THEMES = {
        deep: {
            bg: '#000a1a',
            bubbleColor: '#aaddff',
            sparkleHue: [170, 220],
            causticColor: 'rgba(170, 221, 255, 0.04)',
            dofTint: [0, 5, 20],
            jellyfishTint: { r: 0, g: 0, b: 0 }
        },
        arctic: {
            bg: '#00101a',
            bubbleColor: '#d0f0ff',
            sparkleHue: [180, 210],
            causticColor: 'rgba(200, 245, 255, 0.05)',
            dofTint: [0, 15, 25],
            jellyfishTint: { r: 20, g: 30, b: 30 }
        },
        reef: {
            bg: '#0a0d1a',
            bubbleColor: '#ffe0a0',
            sparkleHue: [30, 60],
            causticColor: 'rgba(255, 200, 100, 0.03)',
            dofTint: [10, 10, 5],
            jellyfishTint: { r: 30, g: 20, b: -10 }
        },
        abyss: {
            bg: '#020205',
            bubbleColor: '#88ccff',
            sparkleHue: [200, 260],
            causticColor: 'rgba(100, 80, 255, 0.03)',
            dofTint: [5, 0, 15],
            jellyfishTint: { r: -10, g: -10, b: 20 }
        }
    };

    class ThemeManager {
        constructor() {
            this.current = 'deep';
            this._load();
        }

        getTheme() {
            return THEMES[this.current] || THEMES.deep;
        }

        setTheme(name) {
            if (THEMES[name] && name !== this.current) {
                this.current = name;
                this._save();
                document.dispatchEvent(new CustomEvent('cnidaria:themechange', { detail: name }));
                return true;
            }
            return false;
        }

        cycle() {
            const names = Object.keys(THEMES);
            const idx = names.indexOf(this.current);
            const next = names[(idx + 1) % names.length];
            this.setTheme(next);
            return next;
        }

        _save() {
            try { localStorage.setItem('cnidaria_theme', this.current); }
            catch (e) {}
        }

        _load() {
            try {
                const t = localStorage.getItem('cnidaria_theme');
                if (t && THEMES[t]) this.current = t;
            } catch (e) {}
        }
    }

    global.ThemeManager = ThemeManager;
})(window);