/**
 * utils.js — Shared utilities for Cnidaria Frames.
 * Adapted from hermes-aquarium-dashboard/js/utils.js, stripped to essentials.
 */
(function(global) {
    'use strict';

    const Utils = {
        rand(min, max) { return Math.random() * (max - min) + min; },
        randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
        randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
        lerp(a, b, t) { return a + (b - a) * t; },
        lerpAngle(a, b, t) {
            let diff = b - a;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            return a + diff * t;
        },
        easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
        clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
        dist(x1, y1, x2, y2) {
            const dx = x2 - x1, dy = y2 - y1;
            return Math.sqrt(dx * dx + dy * dy);
        },
        hexToRgb(hex) {
            return {
                r: parseInt(hex.slice(1, 3), 16),
                g: parseInt(hex.slice(3, 5), 16),
                b: parseInt(hex.slice(5, 7), 16)
            };
        },
        rgbToString(r, g, b, a = 1) {
            return a < 1
                ? `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`
                : `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
        },
        lerpColor(hexA, hexB, t) {
            const a = Utils.hexToRgb(hexA), b = Utils.hexToRgb(hexB);
            return Utils.rgbToString(
                Utils.lerp(a.r, b.r, t),
                Utils.lerp(a.g, b.g, t),
                Utils.lerp(a.b, b.b, t)
            );
        },
        createLoop(updateFn, renderFn) {
            let lastTime = performance.now();
            let frameCount = 0, fps = 0, lastFpsTime = lastTime;
            function tick(now) {
                const dt = Math.min((now - lastTime) / 1000, 0.1);
                lastTime = now;
                frameCount++;
                if (now - lastFpsTime >= 1000) {
                    fps = frameCount;
                    frameCount = 0;
                    lastFpsTime = now;
                }
                updateFn(dt, now / 1000);
                renderFn(dt, now / 1000);
                requestAnimationFrame(tick);
            }
            return {
                start() { requestAnimationFrame(tick); },
                getFps() { return fps; }
            };
        },
        debounce(fn, ms = 200) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => fn(...args), ms);
            };
        },
        detectScreenProfile() {
            const w = window.innerWidth, h = window.innerHeight;
            if (w <= 360) return { name: 'phone-tiny', scale: 0.6 };
            if (w <= 414) return { name: 'phone', scale: 0.75 };
            if (w <= 820 && h <= 600) return { name: 'ipad-half', scale: 1.0 };
            if (w <= 1024) return { name: 'tablet', scale: 1.2 };
            return { name: 'desktop', scale: 1.5 };
        }
    };

    global.Utils = Utils;
})(window);
