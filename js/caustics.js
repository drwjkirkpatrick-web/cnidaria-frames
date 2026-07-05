/**
 * caustics.js — Procedural Underwater Caustics / God-Rays
 *
 * Animated light shafts that slowly sweep across the viewport,
 * simulating sunlight refracting through the water surface.
 */

(function(global) {
    'use strict';

    class Caustics {
        constructor() {
            this.time = 0;
            this.rays = [];
            this._buildRays();
        }

        _buildRays() {
            this.rays = [];
            for (let i = 0; i < 6; i++) {
                this.rays.push({
                    x: Math.random() * window.innerWidth,
                    width: 40 + Math.random() * 80,
                    speed: 0.2 + Math.random() * 0.3,
                    phase: Math.random() * Math.PI * 2,
                    opacity: 0.02 + Math.random() * 0.03
                });
            }
        }

        update(dt) {
            this.time += dt;
            for (const ray of this.rays) {
                ray.x += Math.sin(this.time * ray.speed + ray.phase) * 0.5;
            }
        }

        draw(ctx, theme) {
            const h = window.innerHeight;
            const color = theme && theme.causticColor ? theme.causticColor : 'rgba(170, 221, 255, 0.04)';

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            for (const ray of this.rays) {
                const grad = ctx.createLinearGradient(ray.x, 0, ray.x + ray.width, h);
                grad.addColorStop(0, 'rgba(0,0,0,0)');
                grad.addColorStop(0.5, color);
                grad.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = grad;
                ctx.globalAlpha = ray.opacity * (0.8 + Math.sin(this.time + ray.phase) * 0.2);
                ctx.fillRect(ray.x - ray.width, 0, ray.width * 3, h);
            }
            ctx.restore();
        }

        resize() {
            this._buildRays();
        }
    }

    global.Caustics = Caustics;
})(window);