/**
 * idle-behavior.js — Idle Jellyfish Behaviors for Cnidaria Frames
 *
 * When idle (no interaction for 5s), jellyfish perform random behaviors:
 *   spin — rotate in a small circle
 *   dive — swim downward then return
 *   surface — swim upward then return
 *   drift — slow meandering
 */

(function(global) {
    'use strict';

    const IDLE_TIMEOUT_MS = 5000;

    class IdleBehavior {
        constructor(jellyfishSwarm) {
            this.swarm = jellyfishSwarm;
            this.lastInteraction = Date.now();
            this.behaviors = new Map(); // jellyfish id -> { type, time, originX, originY }
            this._bind();
        }

        _bind() {
            const events = ['pointerdown', 'keydown', 'touchstart'];
            for (const ev of events) {
                document.addEventListener(ev, () => {
                    this.lastInteraction = Date.now();
                    this.behaviors.clear(); // cancel all idle behaviors
                }, { passive: true });
            }
        }

        update(dt) {
            const idle = Date.now() - this.lastInteraction > IDLE_TIMEOUT_MS;
            if (!idle) {
                this.behaviors.clear();
                return;
            }

            for (const jf of this.swarm) {
                let b = this.behaviors.get(jf.id);
                if (!b) {
                    const types = ['spin', 'dive', 'surface', 'drift'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    b = { type, time: 0, originX: jf.x, originY: jf.y };
                    this.behaviors.set(jf.id, b);
                }
                b.time += dt;

                if (b.type === 'spin') {
                    const r = 20 * jf.scale;
                    jf.x = b.originX + Math.cos(b.time * 1.5) * r;
                    jf.y = b.originY + Math.sin(b.time * 1.5) * r;
                } else if (b.type === 'dive') {
                    jf.vy += 0.01;
                    if (jf.y > window.innerHeight * 0.7) b.type = 'surface';
                } else if (b.type === 'surface') {
                    jf.vy -= 0.01;
                    if (jf.y < window.innerHeight * 0.3) b.type = 'dive';
                } else if (b.type === 'drift') {
                    jf.vx += (Math.random() - 0.5) * 0.005;
                    jf.vy += (Math.random() - 0.5) * 0.002;
                }

                // Reset behavior periodically
                if (b.time > 6 + Math.random() * 4) {
                    this.behaviors.delete(jf.id);
                }
            }
        }
    }

    global.IdleBehavior = IdleBehavior;
})(window);