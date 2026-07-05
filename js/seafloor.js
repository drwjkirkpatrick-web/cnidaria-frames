/**
 * seafloor.js — Procedural Seafloor Terrain with Parallax
 *
 * Draws a scrolling terrain silhouette at the bottom of the viewport.
 * Multiple layers scroll at different speeds for depth illusion.
 */

(function(global) {
    'use strict';

    class Seafloor {
        constructor(layerCount = 3) {
            this.layers = [];
            this.scrollX = 0;
            for (let i = 0; i < layerCount; i++) {
                this.layers.push(this._generateLayer(i, layerCount));
            }
        }

        _generateLayer(idx, total) {
            const points = [];
            const segW = 40;
            const segs = Math.ceil(window.innerWidth / segW) + 4;
            const baseH = 60 + idx * 30;
            const amp = 15 + idx * 8;
            for (let j = 0; j <= segs; j++) {
                const phase = j * 0.5 + idx * 2;
                points.push({
                    x: j * segW,
                    y: baseH + Math.sin(phase) * amp + Math.cos(phase * 0.7) * (amp * 0.5)
                });
            }
            return {
                points,
                speed: 2 + idx * 1.5,
                alpha: 0.08 + idx * 0.06,
                color: [0, 8 + idx * 4, 16 + idx * 6]
            };
        }

        resize() {
            for (let i = 0; i < this.layers.length; i++) {
                this.layers[i] = this._generateLayer(i, this.layers.length);
            }
        }

        update(dt) {
            this.scrollX += dt * 8;
        }

        draw(ctx) {
            const h = window.innerHeight;
            for (const layer of this.layers) {
                ctx.save();
                ctx.globalAlpha = layer.alpha;
                ctx.fillStyle = `rgb(${layer.color[0]}, ${layer.color[1]}, ${layer.color[2]})`;
                ctx.beginPath();
                const offset = -(this.scrollX * layer.speed) % (layer.points[layer.points.length - 1].x);
                ctx.moveTo(layer.points[0].x + offset, h);
                for (let i = 0; i < layer.points.length; i++) {
                    const pt = layer.points[i];
                    ctx.lineTo(pt.x + offset, h - pt.y);
                }
                ctx.lineTo(layer.points[layer.points.length - 1].x + offset, h);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }
    }

    global.Seafloor = Seafloor;
})(window);