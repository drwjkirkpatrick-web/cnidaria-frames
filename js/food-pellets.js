/**
 * food-pellets.js — Feeding Interaction for Cnidaria Frames
 *
 * Pellets drift down from tap location. Jellyfish are attracted and
 * will pursue them. On contact, a ripple effect and sparkle burst
 * occur; the pellet is consumed.
 */

(function(global) {
    'use strict';

    class FoodPellet {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.r = 3 + Math.random() * 2;
            this.vy = 0.5 + Math.random() * 0.5;
            this.swayPhase = Math.random() * Math.PI * 2;
            this.life = 0;
            this.consumed = false;
            this.hue = Math.random() * 40 + 20; // warm orange-ish
        }

        update(dt) {
            this.life += dt;
            this.y += this.vy;
            this.swayPhase += dt * 2;
            this.x += Math.sin(this.swayPhase) * 0.2;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = `hsl(${this.hue}, 80%, 65%)`;
            ctx.shadowColor = `hsl(${this.hue}, 80%, 50%)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Ripple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.r = 0;
            this.maxR = 40;
            this.alpha = 0.6;
            this.dead = false;
        }

        update(dt) {
            this.r += dt * 30;
            this.alpha -= dt * 1.5;
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

    class FoodSystem {
        constructor() {
            this.pellets = [];
            this.ripples = [];
        }

        drop(x, y) {
            this.pellets.push(new FoodPellet(x, y));
        }

        addRipple(x, y) {
            this.ripples.push(new Ripple(x, y));
        }

        update(dt, canvasH) {
            for (const p of this.pellets) p.update(dt);
            for (const r of this.ripples) r.update(dt);

            // Remove consumed pellets
            this.pellets = this.pellets.filter(p => {
                if (p.consumed || p.y > canvasH + 20) return false;
                return true;
            });
            this.ripples = this.ripples.filter(r => !r.dead);
        }

        draw(ctx) {
            for (const p of this.pellets) p.draw(ctx);
            for (const r of this.ripples) r.draw(ctx);
        }

        /**
         * Check collisions with jellyfish swarm. Returns consumed pellets
         * so callers can emit effects.
         */
        checkCollisions(jellyfishSwarm, onConsume) {
            for (const p of this.pellets) {
                if (p.consumed) continue;
                for (const jf of jellyfishSwarm) {
                    const dx = jf.x - p.x;
                    const dy = jf.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    // Eat if within body radius + small buffer
                    if (dist < jf.bodyRadius * jf.scale + 8) {
                        p.consumed = true;
                        this.addRipple(p.x, p.y);
                        if (onConsume) onConsume(p.x, p.y, jf);
                        break;
                    }
                }
            }
        }

        /**
         * Attract jellyfish toward nearest uneaten pellet.
         */
        attract(jellyfishSwarm) {
            for (const jf of jellyfishSwarm) {
                let nearest = null;
                let nearestDist = Infinity;
                for (const p of this.pellets) {
                    if (p.consumed) continue;
                    const dx = p.x - jf.x;
                    const dy = p.y - jf.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < nearestDist) { nearestDist = d; nearest = p; }
                }
                if (nearest && nearestDist < 300) {
                    const strength = 0.003;
                    jf.vx += (nearest.x - jf.x) * strength;
                    jf.vy += (nearest.y - jf.y) * strength;
                }
            }
        }
    }

    global.FoodSystem = FoodSystem;
})(window);