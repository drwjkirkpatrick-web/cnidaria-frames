/**
 * plankton.js — Plankton Bloom Events for Cnidaria Frames
 *
 * Dense drifting clouds of tiny particles that flow through the water
 * in currents. Triggered by "bloom" or random ambient events.
 */

(function(global) {
    'use strict';

    class PlanktonParticle {
        constructor(w, h) {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.1;
            this.r = 0.5 + Math.random() * 1;
            this.alpha = 0.2 + Math.random() * 0.3;
            this.hue = 160 + Math.random() * 60;
        }

        update(dt, w, h) {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0) this.x = w;
            if (this.x > w) this.x = 0;
            if (this.y < 0) this.y = h;
            if (this.y > h) this.y = 0;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `hsl(${this.hue}, 60%, 70%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class PlanktonBloom {
        constructor() {
            this.particles = [];
            this.active = false;
            this.intensity = 0;
            this.targetIntensity = 0;
        }

        trigger(count = 150) {
            this.active = true;
            this.targetIntensity = 1;
            for (let i = 0; i < count; i++) {
                this.particles.push(new PlanktonParticle(window.innerWidth, window.innerHeight));
            }
        }

        fade() {
            this.targetIntensity = 0;
        }

        update(dt, w, h) {
            if (!this.active) return;
            this.intensity += (this.targetIntensity - this.intensity) * dt * 2;
            if (this.intensity < 0.01 && this.targetIntensity === 0) {
                this.active = false;
                this.particles = [];
                return;
            }
            for (const p of this.particles) p.update(dt, w, h);
        }

        draw(ctx) {
            if (!this.active || this.intensity <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.intensity;
            for (const p of this.particles) p.draw(ctx);
            ctx.restore();
        }
    }

    global.PlanktonBloom = PlanktonBloom;
})(window);