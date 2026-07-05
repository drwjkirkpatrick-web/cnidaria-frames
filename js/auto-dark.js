/**
 * auto-dark.js — Time-of-Day Auto Dark Mode for Cnidaria Frames
 *
 * Automatically switches to the 'abyss' theme during local night hours
 * (20:00–06:00) and back to 'deep' during day. Respects manual overrides.
 */

(function(global) {
    'use strict';

    class AutoDark {
        constructor(themeManager) {
            this.themeManager = themeManager;
            this.manualOverride = false;
            this.enabled = true;
        }

        check() {
            if (!this.enabled || this.manualOverride) return;
            const hour = new Date().getHours();
            const isNight = hour >= 20 || hour < 6;
            const target = isNight ? 'abyss' : 'deep';
            const current = this.themeManager.current;
            if (current !== target && (current === 'abyss' || current === 'deep')) {
                this.themeManager.setTheme(target);
            }
        }

        setManualOverride(override) {
            this.manualOverride = override;
        }

        enable() { this.enabled = true; }
        disable() { this.enabled = false; }
    }

    global.AutoDark = AutoDark;
})(window);