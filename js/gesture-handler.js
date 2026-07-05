/**
 * gesture-handler.js — Touch & Swipe Gestures for Cnidaria Frames
 *
 * Recognizes: tap, double-tap, swipe-up/down/left/right, long-press, pinch.
 * Dispatches events on document for other modules to listen to.
 */

(function(global) {
    'use strict';

    const SWIPE_THRESHOLD = 40;      // px
    const SWIPE_TIME_MAX = 700;      // ms
    const TAP_MAX_TIME = 300;        // ms
    const TAP_MAX_MOVE = 10;         // px
    const LONG_PRESS_TIME = 600;     // ms
    const DOUBLE_TAP_DELAY = 300;  // ms

    class GestureHandler {
        constructor() {
            this.startX = 0;
            this.startY = 0;
            this.startTime = 0;
            this.isDown = false;
            this.hasMoved = false;
            this.longPressTimer = null;
            this.lastTapTime = 0;
            this.activePointerCount = 0;

            this._onPointerDown = this._onPointerDown.bind(this);
            this._onPointerMove = this._onPointerMove.bind(this);
            this._onPointerUp = this._onPointerUp.bind(this);
            this._onPointerCancel = this._onPointerCancel.bind(this);
            this._onKeyDown = this._onKeyDown.bind(this);

            this._bindEvents();
        }

        _bindEvents() {
            document.addEventListener('pointerdown', this._onPointerDown, { passive: true });
            document.addEventListener('pointermove', this._onPointerMove, { passive: true });
            document.addEventListener('pointerup', this._onPointerUp, { passive: true });
            document.addEventListener('pointercancel', this._onPointerCancel, { passive: true });
            document.addEventListener('keydown', this._onKeyDown);
        }

        destroy() {
            document.removeEventListener('pointerdown', this._onPointerDown);
            document.removeEventListener('pointermove', this._onPointerMove);
            document.removeEventListener('pointerup', this._onPointerUp);
            document.removeEventListener('pointercancel', this._onPointerCancel);
            document.removeEventListener('keydown', this._onKeyDown);
        }

        // ─── Pointer Events ───

        _onPointerDown(e) {
            this.isDown = true;
            this.hasMoved = false;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.startTime = Date.now();
            this.activePointerCount++;

            this.longPressTimer = setTimeout(() => {
                if (this.isDown && !this.hasMoved) {
                    this._dispatch('longpress', { x: this.startX, y: this.startY });
                }
                this.longPressTimer = null;
            }, LONG_PRESS_TIME);
        }

        _onPointerMove(e) {
            if (!this.isDown) return;
            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;
            if (Math.abs(dx) > TAP_MAX_MOVE || Math.abs(dy) > TAP_MAX_MOVE) {
                this.hasMoved = true;
            }
        }

        _onPointerUp(e) {
            if (!this.isDown) return;
            this.isDown = false;
            this.activePointerCount = Math.max(0, this.activePointerCount - 1);

            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }

            const duration = Date.now() - this.startTime;
            const dx = e.clientX - this.startX;
            const dy = e.clientY - this.startY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Swipe detection
            if (dist >= SWIPE_THRESHOLD && duration <= SWIPE_TIME_MAX) {
                const absX = Math.abs(dx);
                const absY = Math.abs(dy);
                let direction;
                if (absX > absY) {
                    direction = dx > 0 ? 'right' : 'left';
                } else {
                    direction = dy > 0 ? 'down' : 'up';
                }
                this._dispatch('swipe', { direction, dx, dy, dist, duration });
                return;
            }

            // Tap detection
            if (dist < TAP_MAX_MOVE && duration < TAP_MAX_TIME) {
                const now = Date.now();
                if (now - this.lastTapTime < DOUBLE_TAP_DELAY) {
                    this._dispatch('doubletap', { x: e.clientX, y: e.clientY });
                    this.lastTapTime = 0; // reset
                } else {
                    this.lastTapTime = now;
                    setTimeout(() => {
                        if (this.lastTapTime) {
                            this._dispatch('tap', { x: e.clientX, y: e.clientY });
                            this.lastTapTime = 0;
                        }
                    }, DOUBLE_TAP_DELAY);
                }
            }
        }

        _onPointerCancel() {
            this.isDown = false;
            if (this.longPressTimer) {
                clearTimeout(this.longPressTimer);
                this.longPressTimer = null;
            }
        }

        // ─── Keyboard Shortcuts ───

        _onKeyDown(e) {
            // Number keys 1–6 map to states
            if (e.key >= '1' && e.key <= '6') {
                const stateMap = { '1':'idle','2':'active','3':'thinking','4':'success','5':'error','6':'sleeping' };
                this._dispatch('keystate', { state: stateMap[e.key] });
                return;
            }
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    e.preventDefault();
                    this._dispatch('keynext', {});
                    break;
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this._dispatch('keyprev', {});
                    break;
                case 'f':
                    this._dispatch('togglefps', {});
                    break;
                case 'a':
                    this._dispatch('toggleaudio', {});
                    break;
                case 's':
                    this._dispatch('opensettings', {});
                    break;
                case 'e':
                    this._dispatch('exportscreenshot', {});
                    break;
                case 't':
                    this._dispatch('toggletheme', {});
                    break;
                case 'v':
                    this._dispatch('togglevoice', {});
                    break;
            }
        }

        /**
         * Dispatch a custom gesture event.
         */
        _dispatch(type, detail) {
            document.dispatchEvent(new CustomEvent('cnidaria:' + type, { detail }));
        }
    }

    global.GestureHandler = GestureHandler;
})(window);