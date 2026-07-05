/**
 * particles.js — Bubble & Sparkle Particle System for Cnidaria Frames
 *
 * 1. Ambient bubble particles rising through the water column
 * 2. Bioluminescent sparkle trails emitted from jellyfish tentacles
 */

(function(global) {
    'use strict';

    /**
     * Bubble particle — rises from bottom, drifts sideways, fades as it ascends.
     */
    class BubbleParticle {
        constructor(canvasWidth, canvasHeight) {
            this.reset(canvasWidth, canvasHeight, true);
        }

        reset(canvasWidth, canvasHeight, randomY = false) {
            this.x = Math.random() * canvasWidth;
            this.y = randomY ? Math.random() * canvasHeight : canvasHeight + 10;
            this.r = Math.random() * 2 + 0.5; // radius 0.5–2.5 px
            this.speed = Math.random() * 0.8 + 0.2;
            this.sway = Math.random() * 0.02 + 0.005;
            this.swayPhase = Math.random() * Math.PI * 2;
            this.alpha = Math.random() * 0.25 + 0.05;
            this.maxAlpha = this.alpha;
            this.life = 0;
        }

        update(dt, canvasWidth, canvasHeight) {
            this.life += dt;
            this.y -= this.speed;
            this.swayPhase += dt;
            this.x += Math.sin(this.swayPhase) * 0.3;

            // Fade near top third
            const fadeZone = canvasHeight * 0.3;
            if (this.y < fadeZone) {
                this.alpha = this.maxAlpha * (this.y / fadeZone);
            } else {
                this.alpha = this.maxAlpha;
            }

            // Reset if off top or way off sides
            if (this.y < -this.r || this.x < -20 || this.x > canvasWidth + 20) {
                this.reset(canvasWidth, canvasHeight, false);
            }
        }

        draw(ctx) {
            if (this.alpha <= 0.01) return;
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = '#aaddff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /**
     * Sparkle particle — emitted from a point, drifts outward, fades.
     */
    class SparkleParticle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5 - 0.3; // slight upward drift
            this.life = 0;
            this.maxLife = Math.random() * 1.2 + 0.6;
            this.size = Math.random() * 1.5 + 0.5;
            this.hue = hue !== undefined ? hue : Math.random() * 60 + 180; // cyan-blue default
        }

        update(dt) {
            this.life += dt;
            this.x += this.vx;
            this.y += this.vy;
            this.vx *= 0.98;
            this.vy *= 0.98;
        }

        draw(ctx) {
            const progress = this.life / this.maxLife;
            if (progress >= 1) return;
            const alpha = 1 - progress;
            const currentSize = this.size * (1 - progress * 0.5);

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = `hsl(${this.hue}, 80%, 75%)`;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 60%)`;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        isDead() {
            return this.life >= this.maxLife;
        }
    }

    /**
     * ParticleSystem — manages both bubble ambient and sparkle trail pools.
     */
    class ParticleSystem {
        constructor(count = 60) {
            this.bubbles = [];
            this.sparkles = [];
            this.bubbleCount = count;
            // Created lazily on first resize
            this.initialized = false;
        }

        init(canvasWidth, canvasHeight) {
            if (this.initialized) return;
            this.initialized = true;
            this.bubbles = [];
            for (let i = 0; i < this.bubbleCount; i++) {
                this.bubbles.push(new BubbleParticle(canvasWidth, canvasHeight));
            }
        }

        emitSparkle(x, y, hue) {
            // Limit active sparkles to avoid GPU thrashing on mobile
            if (this.sparkles.length > 200) return;
            this.sparkles.push(new SparkleParticle(x, y, hue));
        }

        emitBurst(x, y, count, hue) {
            const c = Math.min(count, 30);
            for (let i = 0; i < c; i++) {
                this.emitSparkle(x, y, hue);
            }
        }

        update(dt, canvasWidth, canvasHeight) {
            if (!this.initialized) return;

            for (const b of this.bubbles) {
                b.update(dt, canvasWidth, canvasHeight);
            }

            for (let i = this.sparkles.length - 1; i >= 0; i--) {
                const s = this.sparkles[i];
                s.update(dt);
                if (s.isDead()) {
                    this.sparkles.splice(i, 1);
                }
            }
        }

        draw(ctx) {
            if (!this.initialized) return;

            for (const b of this.bubbles) {
                b.draw(ctx);
            }
            for (const s of this.sparkles) {
                s.draw(ctx);
            }
        }
    }

    global.ParticleSystem = ParticleSystem;
})(window);