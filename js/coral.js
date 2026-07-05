/**
 * coral.js — Coral Reef Formations on Seafloor for Cnidaria Frames
 *
 * Procedurally draws simple coral formations (brain coral, fan coral,
 * tube sponges) along the seafloor. Sways gently with current.
 */

(function(global) {
    'use strict';

    class CoralReef {
        constructor() {
            this.formations = [];
            this._generate();
        }

        _generate() {
            const w = window.innerWidth;
            const count = Math.floor(w / 120);
            for (let i = 0; i < count; i++) {
                const type = ['brain', 'fan', 'tube'][Math.floor(Math.random() * 3)];
                this.formations.push({
                    x: (i + 0.5) * (w / count) + (Math.random() - 0.5) * 30,
                    y: window.innerHeight - 10 - Math.random() * 30,
                    type,
                    scale: 0.6 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2,
                    color: this._colorFor(type)
                });
            }
        }

        _colorFor(type) {
            if (type === 'brain') return '#2a3a4a';
            if (type === 'fan') return '#3a2a4a';
            return '#2a3a3a';
        }

        resize() { this._generate(); }

        update(dt) {
            for (const f of this.formations) f.phase += dt * 0.5;
        }

        draw(ctx) {
            for (const f of this.formations) {
                ctx.save();
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = f.color;
                const sway = Math.sin(f.phase) * 3;

                if (f.type === 'brain') {
                    ctx.beginPath();
                    ctx.ellipse(f.x + sway, f.y, 15 * f.scale, 10 * f.scale, 0, Math.PI, 0);
                    ctx.fill();
                    // Brain ridges
                    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
                    ctx.lineWidth = 1;
                    for (let r = 0; r < 3; r++) {
                        ctx.beginPath();
                        ctx.ellipse(f.x + sway, f.y - r * 4 * f.scale, (12 - r * 3) * f.scale, (8 - r * 2) * f.scale, 0, 0, Math.PI);
                        ctx.stroke();
                    }
                } else if (f.type === 'fan') {
                    ctx.beginPath();
                    ctx.moveTo(f.x + sway, f.y);
                    ctx.quadraticCurveTo(f.x + sway - 20 * f.scale, f.y - 30 * f.scale, f.x + sway - 8 * f.scale, f.y - 50 * f.scale);
                    ctx.quadraticCurveTo(f.x + sway + 8 * f.scale, f.y - 50 * f.scale, f.x + sway + 20 * f.scale, f.y - 30 * f.scale);
                    ctx.closePath();
                    ctx.fill();
                    // Fan lines
                    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                    ctx.lineWidth = 0.5;
                    for (let a = -0.6; a <= 0.6; a += 0.2) {
                        ctx.beginPath();
                        ctx.moveTo(f.x + sway, f.y);
                        ctx.lineTo(f.x + sway + Math.sin(a) * 25 * f.scale, f.y - Math.cos(a) * 45 * f.scale);
                        ctx.stroke();
                    }
                } else { // tube
                    for (let t = 0; t < 3; t++) {
                        const tx = f.x + sway + (t - 1) * 8 * f.scale;
                        const h = 20 + Math.random() * 15;
                        ctx.fillRect(tx - 3 * f.scale, f.y - h * f.scale, 6 * f.scale, h * f.scale);
                    }
                }
                ctx.restore();
            }
        }
    }

    global.CoralReef = CoralReef;
})(window);