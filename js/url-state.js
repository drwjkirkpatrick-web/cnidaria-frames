/**
 * url-state.js — Shareable State via URL Hash for Cnidaria Frames
 *
 * Encodes current state, theme, and settings into the URL hash
 * so the exact scene can be shared/bookmarked. Decodes on load.
 */

(function(global) {
    'use strict';

    const URLState = {
        /**
         * Encode current state to hash string.
         */
        encode(state, theme, settings) {
            const payload = {
                s: state,
                t: theme,
                v: '1.2'
            };
            if (settings) {
                if (settings.particles) payload.p = settings.particles[0]; // l/m/h
                if (settings.reducedMotion) payload.r = 1;
            }
            return '#' + btoa(JSON.stringify(payload));
        },

        /**
         * Decode hash string. Returns null if invalid.
         */
        decode() {
            try {
                const hash = window.location.hash.slice(1);
                if (!hash) return null;
                const payload = JSON.parse(atob(hash));
                if (!payload.v) return null;
                return payload;
            } catch (e) {
                return null;
            }
        },

        /**
         * Apply decoded state to app components.
         */
        apply(stateManager, themeManager) {
            const data = this.decode();
            if (!data) return false;
            if (data.s && stateManager) stateManager.setState(data.s);
            if (data.t && themeManager) themeManager.setTheme(data.t);
            return true;
        },

        /**
         * Update browser hash with current state.
         */
        push(state, theme, settings) {
            const hash = this.encode(state, theme, settings);
            if (window.location.hash !== hash) {
                history.replaceState(null, '', hash);
            }
        }
    };

    global.URLState = URLState;
})(window);