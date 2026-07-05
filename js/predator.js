/**
 * predator.js — Predator Silhouette Pass-by for Cnidaria Frames
 *
 * A large shadowy silhouette occasionally passes across the viewport
 * from one side to the other, triggering a panic scatter response
 * in the jellyfish swarm.
 */

(function(global) {
    'use strict';

    class Predator {
        constructor(canvasW, canvasH) {
            this.x = -300;
            this.y = canvasH * 0.2 + Math.random() * canvasH * 0.4;
            this.speed = 80 + Math.random() * 60; // px per second
            this.scale = 1.2 + Math.random() * 0.8;
            this.active = false;
            this.done = false;
            this.passedMidpoint = false;
        }

        start(canvasW) {
            this.active = true;
            // Sometimes start from right side instead
            if (Math.random() > 0.5) {
                this.x = canvasW + 300;
                this.speed = -this.speed;
            }
        }

        update(dt, canvasW, canvasH) {
            if (!this.active || this.done) return;
            this.x += this.speed * dt;

            // Mark midpoint passage for panic trigger
            const mid = canvasW / 2;
            if ((this.speed > 0 && this.x > mid && !this.passedMidpoint) ||
                (this.speed < 0 && this.x < mid && !this.passedMidpoint)) {
                this.passedMidpoint = true;
                document.dispatchEvent(new CustomEvent('cnidaria:predator:midpoint'));
            }

            // Done when fully off-screen
            if (this.speed > 0 && this.x > canvasW + 400) this.done = true;
            if (this.speed < 0 && this.x < -400) this.done = true;
        }

        draw(ctx) {
            if (!this.active || this.done) return;
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#000';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 20;

            // Simple shark-like silhouette path
            ctx.beginPath();
            ctx.moveTo(this.x + 180 * this.scale, this.y);
            ctx.quadraticCurveTo(
                this.x + 90 * this.scale, this.y - 40 * this.scale,
                this.x, this.y - 10 * this.scale
            );
            ctx.lineTo(this.x - 60 * this.scale, this.y + 5 * this.scale);
            ctx.quadraticCurveTo(
                this.x + 30 * this.scale, this.y + 35 * this.scale,
                this.x + 180 * this.scale, this.y
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    class PredatorManager {
        constructor(canvasW, canvasH) {
            this.canvasW = canvasW;
            this.canvasH = canvasH;
            this.predator = null;
            this.scheduleTimer = null;
            this.enabled = true;
            this._schedule();
        }

        _schedule() {
            if (!this.enabled) return;
            const delay = 15000 + Math.random() * 25000; // 15–40s
            this.scheduleTimer = setTimeout(() => this._spawn(), delay);
        }

        _spawn() {
            if (!this.enabled) return;
            this.predator = new Predator(this.canvasW, this.canvasH);
            this.predator.start(this.canvasW);
            document.dispatchEvent(new CustomEvent('cnidaria:predator:spawn'));
        }

        update(dt) {
            if (this.predator) {
                this.predator.update(dt, this.canvasW, this.canvasH);
                if (this.predator.done) {
                    this.predator = null;
                    this._schedule();
                }
            }
        }

        draw(ctx) {
            if (this.predator) this.predator.draw(ctx);
        }

        resize(w, h) {
            this.canvasW = w;
            this.canvasH = h;
        }

        destroy() {
            if (this.scheduleTimer) clearTimeout(this.scheduleTimer);
        }
    }

    global.PredatorManager = PredatorManager;
})(window);