/**
 * performance-monitor.js — FPS & Frame-Time Overlay
 *
 * Lightweight overlay showing FPS, frame time (ms), and particle count.
 * Toggled via 'f' key or settings panel.
 */

(function(global) {
    'use strict';

    class PerformanceMonitor {
        constructor() {
            this.visible = false;
            this.frames = 0;
            this.lastReportTime = 0;
            this.fps = 0;
            this.frameTime = 0;
            this.particleCount = 0;
            this.dom = null;
            this._buildDOM();
        }

        _buildDOM() {
            const el = document.createElement('div');
            el.id = 'cnidariaPerf';
            el.className = 'cnidaria-perf';
            el.innerHTML = `
                <span id="cnidariaPerfFps">-- FPS</span>
                <span id="cnidariaPerfMs">-- ms</span>
                <span id="cnidariaPerfParticles">-- particles</span>
            `;
            document.body.appendChild(el);
            this.dom = {
                root: el,
                fps: el.querySelector('#cnidariaPerfFps'),
                ms: el.querySelector('#cnidariaPerfMs'),
                particles: el.querySelector('#cnidariaPerfParticles')
            };

            document.addEventListener('cnidaria:togglefps', () => this.toggle());
            document.addEventListener('cnidaria:setting:fpschange', e => {
                e.detail ? this.show() : this.hide();
            });
        }

        show() {
            this.visible = true;
            if (this.dom) this.dom.root.classList.add('visible');
        }

        hide() {
            this.visible = false;
            if (this.dom) this.dom.root.classList.remove('visible');
        }

        toggle() {
            this.visible ? this.hide() : this.show();
        }

        /**
         * Call once per frame with the current timestamp and optional particle count.
         */
        tick(now, particleCount = 0) {
            if (!this.visible) return;

            this.frames++;
            this.particleCount = particleCount;

            if (now - this.lastReportTime >= 1000) {
                this.fps = this.frames;
                this.frames = 0;
                this.lastReportTime = now;
            }

            // Update DOM every frame for ms, every second for FPS
            this.dom.fps.textContent = this.fps + ' FPS';
            this.dom.ms.textContent = this.frameTime.toFixed(1) + ' ms';
            this.dom.particles.textContent = this.particleCount + ' particles';
        }

        setFrameTime(ms) {
            this.frameTime = ms;
        }
    }

    global.PerformanceMonitor = PerformanceMonitor;
})(window);