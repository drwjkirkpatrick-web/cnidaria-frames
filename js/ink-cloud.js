/**
 * ink-cloud.js — Ink Cloud Effect for Cnidaria Frames
 *
 * On error state transitions, a dark ink cloud bursts from the
 * primary jellyfish and slowly diffuses outward before fading.
 */

(function(global) {
    'use strict';

    class InkParticle {
        constructor(x, y, angle) {
            this.x = x;
            this.y = y;
            const speed = Math.random() * 40 + 10;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.r = Math.random() * 8 + 4;
            this.life = 0;
            this.maxLife = Math.random() * 2.0 + 1.5;
            this.dead = false;
        }

        update(dt) {
            this.life += dt;
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vx *= 0.96;
            this.vy *= 0.96;
            this.r += dt * 8; // diffusion
            if (this.life >= this.maxLife) this.dead = true;
        }

        draw(ctx) {
            if (this.dead) return;
            const alpha = (1 - this.life / this.maxLife) * 0.4;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#1a0a25';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class InkCloud {
        constructor() {
            this.particles = [];
        }

        burst(x, y, count = 24) {
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
                this.particles.push(new InkParticle(x, y, angle));
            }
        }

        update(dt) {
            for (const p of this.particles) p.update(dt);
            this.particles = this.particles.filter(p => !p.dead);
        }

        draw(ctx) {
            ctx.save();
            // Use composite for soft diffusion look
            ctx.globalCompositeOperation = 'source-over';
            for (const p of this.particles) p.draw(ctx);
            ctx.restore();
        }
    }

    global.InkCloud = InkCloud;
})(window);