/**
 * touch-ripple.js — Water Surface Ripple Effect for Cnidaria Frames
 *
 * On each touch/click, a concentric ripple expands outward before fading,
 * simulating disturbance on the water surface.
 */

(function(global) {
    'use strict';

    class RippleRing {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.r = 0;
            this.maxR = 60 + Math.random() * 40;
            this.alpha = 0.4;
            this.dead = false;
        }

        update(dt) {
            this.r += dt * 80;
            this.alpha -= dt * 1.2;
            if (this.alpha <= 0) this.dead = true;
        }

        draw(ctx) {
            if (this.dead) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.strokeStyle = '#aaddff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    class TouchRipple {
        constructor() {
            this.ripples = [];
        }

        add(x, y) {
            this.ripples.push(new RippleRing(x, y));
        }

        update(dt) {
            for (const r of this.ripples) r.update(dt);
            this.ripples = this.ripples.filter(r => !r.dead);
        }

        draw(ctx) {
            for (const r of this.ripples) r.draw(ctx);
        }
    }

    global.TouchRipple = TouchRipple;
})(window);