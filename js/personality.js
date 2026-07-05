/**
 * personality.js — Jellyfish Personality System for Cnidaria Frames
 *
 * Each jellyfish can have a personality that modulates its behavior:
 *   nervous  — faster pulses, wider evasion, erratic tentacles
 *   lazy     — slower drift, long rests, minimal sparkles
 *   curious  — seeks food aggressively, approaches cursor/tap
 *   leader   — others flock toward this one; calmer, larger glow
 *   default  — neutral behavior
 */

(function(global) {
    'use strict';

    const PERSONALITY_MODS = {
        nervous: {
            pulseMult: 1.5,
            floatMult: 1.3,
            evadeMult: 2.0,
            sparkleRate: 1.3,
            glowMult: 0.8,
            colorShift: { r: 10, g: -5, b: -5 }
        },
        lazy: {
            pulseMult: 0.5,
            floatMult: 0.4,
            evadeMult: 0.3,
            sparkleRate: 0.2,
            glowMult: 1.2,
            colorShift: { r: -5, g: 5, b: 10 }
        },
        curious: {
            pulseMult: 1.1,
            floatMult: 0.9,
            evadeMult: 0.5,
            sparkleRate: 1.5,
            glowMult: 1.1,
            colorShift: { r: 15, g: 10, b: -10 }
        },
        leader: {
            pulseMult: 0.8,
            floatMult: 0.7,
            evadeMult: 0.4,
            sparkleRate: 0.8,
            glowMult: 1.5,
            colorShift: { r: 5, g: 5, b: 15 }
        },
        default: {
            pulseMult: 1.0,
            floatMult: 1.0,
            evadeMult: 1.0,
            sparkleRate: 1.0,
            glowMult: 1.0,
            colorShift: { r: 0, g: 0, b: 0 }
        }
    };

    class Personality {
        constructor(type = 'default') {
            this.type = PERSONALITY_MODS[type] ? type : 'default';
            this.mods = PERSONALITY_MODS[this.type];
        }

        setType(type) {
            this.type = PERSONALITY_MODS[type] ? type : 'default';
            this.mods = PERSONALITY_MODS[this.type];
        }

        apply(jellyfish) {
            // Modulate glow size
            jellyfish.glowSize = 15 * this.mods.glowMult;
            // Color shift is applied during draw via theme + shift
            jellyfish.personalityColorShift = this.mods.colorShift;
        }

        static random() {
            const types = ['nervous', 'lazy', 'curious', 'leader', 'default'];
            return types[Math.floor(Math.random() * types.length)];
        }
    }

    global.Personality = Personality;
})(window);