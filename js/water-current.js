/**
 * water-current.js — Water Current / Flow Meter for Cnidaria Frames
 *
 * Simulates a global water current that pushes all entities
 * sideways. Visualized by a small compass-like indicator.
 * Direction and strength vary slowly over time.
 */

(function(global) {
    'use strict';

    class WaterCurrent {
        constructor() {
            this.angle = 0; // radians
            this.strength = 0.2; // px/frame base
            this.phase = 0;
            this.dom = null;
            this._buildDOM();
        }

        _buildDOM() {
            const el = document.createElement('div');
            el.id = 'waterCurrent';
            el.className = 'water-current-indicator';
            el.innerHTML = `
                <div class="wc-arrow"></div>
                <div class="wc-label">Current</div>
            `;
            document.body.appendChild(el);
            this.dom = {
                root: el,
                arrow: el.querySelector('.wc-arrow')
            };
        }

        update(dt) {
            this.phase += dt * 0.15;
            // Slowly varying sine-based current
            this.angle = Math.sin(this.phase) * Math.PI * 0.4;
            this.strength = 0.15 + Math.sin(this.phase * 0.7 + 1) * 0.1 + 0.1;

            if (this.dom && this.dom.arrow) {
                const deg = this.angle * (180 / Math.PI);
                this.dom.arrow.style.transform = `rotate(${deg}deg)`;
            }
        }

        /**
         * Apply current force to an entity.
         */
        apply(entity, dt) {
            if (!entity.vx || !entity.vy) return;
            entity.vx += Math.cos(this.angle) * this.strength * dt * 10;
            entity.vy += Math.sin(this.angle) * this.strength * dt * 10;
        }

        getVector() {
            return {
                x: Math.cos(this.angle) * this.strength,
                y: Math.sin(this.angle) * this.strength
            };
        }
    }

    global.WaterCurrent = WaterCurrent;
})(window);