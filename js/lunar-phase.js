/**
 * lunar-phase.js — Lunar Phase Calculator for Cnidaria Frames
 *
 * Computes the current moon phase (0–1) and waxing/waning state.
 * Modulates the ambient color palette subtly based on the lunar cycle.
 * New moon = darker, deeper tones. Full moon = brighter, silver-blue.
 *
 * Algorithm: approximate synodic month from known new moon epoch.
 */

(function(global) {
    'use strict';

    // Known new moon: 2024-01-11 11:57 UTC
    const KNOWN_NEW_MOON = new Date('2024-01-11T11:57:00Z').getTime();
    const SYNODIC_MS = 29.53058867 * 24 * 60 * 60 * 1000;

    class LunarPhase {
        constructor() {
            this.phase = this.calculate();
        }

        calculate() {
            const now = Date.now();
            const diff = now - KNOWN_NEW_MOON;
            return (diff % SYNODIC_MS) / SYNODIC_MS;
        }

        getPhaseName() {
            const p = this.phase;
            if (p < 0.03 || p > 0.97) return 'new';
            if (p < 0.22) return 'waxing crescent';
            if (p < 0.28) return 'first quarter';
            if (p < 0.47) return 'waxing gibbous';
            if (p < 0.53) return 'full';
            if (p < 0.72) return 'waning gibbous';
            if (p < 0.78) return 'last quarter';
            return 'waning crescent';
        }

        /**
         * Get a color tint modifier based on lunar phase.
         * New moon: darker (-20 on channels). Full moon: brighter (+20).
         */
        getTint() {
            const illumination = 1 - Math.abs(this.phase - 0.5) * 2; // 0 at new, 1 at full
            const shift = Math.round((illumination - 0.5) * 40);
            return { r: shift, g: shift, b: shift + 5 };
        }

        /**
         * Get a gentle background brightness modifier (0.0 to 0.15).
         */
        getBrightnessMod() {
            const illumination = 1 - Math.abs(this.phase - 0.5) * 2;
            return illumination * 0.15;
        }
    }

    global.LunarPhase = LunarPhase;
})(window);