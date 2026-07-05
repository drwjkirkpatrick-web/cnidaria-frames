/**
 * manta-ray.js — Manta Ray Companion for Cnidaria Frames
 *
 * A graceful manta ray glides across the viewport periodically,
 * with undulating wing motion and a gentle bioluminescent trail.
 */

(function(global) {
    'use strict';

    class MantaRay {
        constructor(canvasW, canvasH) {
            this.x = -300;
            this.y = canvasH * 0.1 + Math.random() * canvasH * 0.3;
            this.speed = 50 + Math.random() * 30;
            this.phase = 0;
            this.wingSpan = 80 + Math.random() * 40;
            this.active = false;
            this.done = false;
            this.trail = [];
        }

        start(canvasW) {
            this.active = true;
            if (Math.random() > 0.5) {
                this.x = canvasW + 300;
                this.speed = -this.speed;
            }
        }

        update(dt, canvasW, canvasH) {
            if (!this.active || this.done) return;
            this.phase += dt * 3;
            this.x += this.speed * dt;
            this.y += Math.sin(this.phase) * 0.3;

            // Trail
            this.trail.push({ x: this.x, y: this.y, alpha: 0.4 });
            for (const t of this.trail) t.alpha -= dt * 0.5;
            this.trail = this.trail.filter(t => t.alpha > 0);

            if (this.speed > 0 && this.x > canvasW + 400) this.done = true;
            if (this.speed < 0 && this.x < -400) this.done = true;
        }

        draw(ctx) {
            if (!this.active || this.done) return;
            ctx.save();

            // Trail sparkles
            for (const t of this.trail) {
                ctx.globalAlpha = t.alpha * 0.3;
                ctx.fillStyle = '#88ccff';
                ctx.beginPath();
                ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 0.12;
            ctx.fillStyle = '#1a3048';

            const wingY = Math.sin(this.phase) * 15;
            const bodyLen = this.wingSpan * 0.6;

            // Left wing
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(
                this.x - this.wingSpan * 0.5, this.y + wingY - 20,
                this.x - this.wingSpan, this.y + wingY
            );
            ctx.quadraticCurveTo(
                this.x - this.wingSpan * 0.5, this.y + wingY + 10,
                this.x - bodyLen * 0.3, this.y + 8
            );
            ctx.lineTo(this.x, this.y + 5);
            ctx.closePath();
            ctx.fill();

            // Right wing
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.quadraticCurveTo(
                this.x + this.wingSpan * 0.5, this.y - wingY - 20,
                this.x + this.wingSpan, this.y - wingY
            );
            ctx.quadraticCurveTo(
                this.x + this.wingSpan * 0.5, this.y - wingY + 10,
                this.x + bodyLen * 0.3, this.y + 8
            );
            ctx.lineTo(this.x, this.y + 5);
            ctx.closePath();
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + 5);
            ctx.quadraticCurveTo(this.x, this.y + bodyLen * 0.6, this.x + Math.sin(this.phase * 2) * 10, this.y + bodyLen);
            ctx.strokeStyle = '#1a3048';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    }

    class MantaRayManager {
        constructor(canvasW, canvasH) {
            this.w = canvasW; this.h = canvasH;
            this.ray = null;
            this.schedule();
        }

        schedule() {
            const delay = 20000 + Math.random() * 30000; // 20–50s
            setTimeout(() => this.spawn(), delay);
        }

        spawn() {
            this.ray = new MantaRay(this.w, this.h);
            this.ray.start(this.w);
        }

        update(dt) {
            if (this.ray) {
                this.ray.update(dt, this.w, this.h);
                if (this.ray.done) { this.ray = null; this.schedule(); }
            }
        }

        draw(ctx) {
            if (this.ray) this.ray.draw(ctx);
        }

        resize(w, h) { this.w = w; this.h = h; }
    }

    global.MantaRayManager = MantaRayManager;
})(window);