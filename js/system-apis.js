/**
 * system-apis.js — Browser System API Wrappers for Cnidaria Frames
 *
 * Provides:
 *   - Fullscreen API toggle
 *   - Wake Lock API (keep screen awake)
 *   - Battery-aware performance throttling
 *   - Haptic feedback on state transitions
 *   - Screenshot export (canvas to PNG)
 */

(function(global) {
    'use strict';

    const SystemAPIs = {
        // ─── Fullscreen ───
        toggleFullscreen() {
            const d = document;
            if (!d.fullscreenElement && !d.webkitFullscreenElement) {
                const el = d.documentElement;
                if (el.requestFullscreen) el.requestFullscreen();
                else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
            } else {
                if (d.exitFullscreen) d.exitFullscreen();
                else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
            }
        },

        // ─── Wake Lock ───
        wakeLock: null,
        async requestWakeLock() {
            if (!('wakeLock' in navigator)) return false;
            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                this.wakeLock.addEventListener('release', () => {
                    console.log('[WakeLock] released');
                });
                return true;
            } catch (e) {
                return false;
            }
        },
        releaseWakeLock() {
            if (this.wakeLock) {
                this.wakeLock.release();
                this.wakeLock = null;
            }
        },

        // ─── Battery-aware throttling ───
        batteryInfo: { level: 1.0, charging: true, throttled: false },
        async initBattery() {
            if (!('getBattery' in navigator)) return;
            try {
                const battery = await navigator.getBattery();
                const update = () => {
                    this.batteryInfo.level = battery.level;
                    this.batteryInfo.charging = battery.charging;
                    this.batteryInfo.throttled = !battery.charging && battery.level <= 0.2;
                    document.dispatchEvent(new CustomEvent('cnidaria:battery', {
                        detail: { ...this.batteryInfo }
                    }));
                };
                battery.addEventListener('levelchange', update);
                battery.addEventListener('chargingchange', update);
                update();
            } catch (e) {}
        },

        // ─── Haptic feedback ───
        haptic(pattern = 'light') {
            if (!navigator.vibrate) return;
            const patterns = {
                light: [10],
                medium: [20],
                heavy: [30, 30, 30],
                panic: [50, 50, 50, 50, 50],
                eat: [15, 10, 15]
            };
            navigator.vibrate(patterns[pattern] || patterns.light);
        },

        // ─── Screenshot export ───
        exportScreenshot(canvas) {
            if (!canvas) return;
            try {
                const link = document.createElement('a');
                link.download = 'cnidaria-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-') + '.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (e) {
                console.error('Screenshot failed:', e);
            }
        }
    };

    global.SystemAPIs = SystemAPIs;
})(window);