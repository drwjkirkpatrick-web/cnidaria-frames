/**
 * screensaver.js — Auto-cycle states after idle timeout
 *
 * After a configurable idle period (default 20s), the jellyfish will
 * automatically cycle through states. Disabled if user is interacting
 * or if screensaver is off in settings.
 */

(function(global) {
    'use strict';

    const DEFAULT_IDLE_MS = 20000; // 20 seconds
    const CYCLE_INTERVAL_MS = 5000; // 5 seconds between auto-states

    class Screensaver {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.enabled = true;
            this.idleMs = DEFAULT_IDLE_MS;
            this.lastInteraction = Date.now();
            this.timer = null;
            this.cycleTimer = null;
            this.isAutoCycling = false;

            this._onInteraction = this._onInteraction.bind(this);
            this._bindEvents();
        }

        _bindEvents() {
            const events = ['pointerdown', 'pointermove', 'keydown', 'touchstart', 'wheel'];
            for (const ev of events) {
                document.addEventListener(ev, this._onInteraction, { passive: true });
            }

            document.addEventListener('cnidaria:setting:screensaverchange', e => {
                this.enabled = e.detail;
                if (this.enabled) {
                    this._start();
                } else {
                    this._stop();
                }
            });
        }

        _onInteraction() {
            this.lastInteraction = Date.now();
            if (this.isAutoCycling) {
                this.isAutoCycling = false;
                this._stopCycle();
            }
            if (this.enabled) this._start();
        }

        _start() {
            this._stop();
            this.timer = setTimeout(() => this._enter(), this.idleMs);
        }

        _stop() {
            if (this.timer) { clearTimeout(this.timer); this.timer = null; }
            this._stopCycle();
        }

        _enter() {
            if (!this.enabled || !this.stateManager) return;
            this.isAutoCycling = true;
            this._doCycle();
            this.cycleTimer = setInterval(() => this._doCycle(), CYCLE_INTERVAL_MS);
        }

        _stopCycle() {
            if (this.cycleTimer) { clearInterval(this.cycleTimer); this.cycleTimer = null; }
        }

        _doCycle() {
            if (!this.stateManager || !this.isAutoCycling) return;
            this.stateManager.nextState();
            document.dispatchEvent(new CustomEvent('cnidaria:statechange', {
                detail: { state: this.stateManager.getState(), source: 'screensaver' }
            }));
        }

        destroy() {
            this._stop();
        }
    }

    global.Screensaver = Screensaver;
})(window);