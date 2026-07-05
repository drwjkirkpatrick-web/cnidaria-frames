/**
 * jellyfish.js — The Cnidaria Agent v2.0
 *
 * Advanced vector-based medusa with superellipsoid bell, B-spline tentacles,
 * and procedural radial grooves. Uses parametric geometry for a realistic
 * jellyfish silhouette.
 *
 * States: idle, active, thinking, success, error, sleeping
 */

(function(global) {
    'use strict';

    const STATE_COLORS = {
        idle:     { r: 100, g: 150, b: 255 },
        active:   { r: 100, g: 200, b: 255 },
        thinking: { r: 150, g: 150, b: 255 },
        success:  { r: 100, g: 255, b: 150 },
        error:    { r: 255, g: 100, b: 100 },
        sleeping: { r: 150, g: 150, b: 200 }
    };

    function lerpColor(c, t, f) {
        return {
            r: Utils.lerp(c.r, t.r, f),
            g: Utils.lerp(c.g, t.g, f),
            b: Utils.lerp(c.b, t.b, f)
        };
    }

    /**
     * Cubic B-spline interpolation for smooth tentacle curves.
     * Returns point on curve for parameter t in [0, 1] given control points.
     */
    function bSplinePoint(t, p0, p1, p2, p3) {
        const t2 = t * t, t3 = t2 * t;
        const b0 = (1 - 3*t + 3*t2 - t3) / 6;
        const b1 = (4 - 6*t2 + 3*t3) / 6;
        const b2 = (1 + 3*t + 3*t2 - 3*t3) / 6;
        const b3 = t3 / 6;
        return {
            x: b0*p0.x + b1*p1.x + b2*p2.x + b3*p3.x,
            y: b0*p0.y + b1*p1.y + b2*p2.y + b3*p3.y
        };
    }

    /**
     * Superellipse radius at angle theta: (|cos|)^n + (|sin|)^n = r^n
     * n=2 gives ellipse, n>2 gives more rectangular, n<2 gives pointier.
     * We use n=2.3 for a slightly pointy medusa bell.
     */
    function superEllipseRadius(a, b, theta, n) {
        const ct = Math.cos(theta), st = Math.sin(theta);
        const term1 = Math.pow(Math.abs(ct / a), n);
        const term2 = Math.pow(Math.abs(st / b), n);
        return 1.0 / Math.pow(term1 + term2, 1.0 / n);
    }

    /**
     * A tentacle using B-spline interpolation with spring-physics anchors.
     */
    class Tentacle {
        constructor(length, segments = 12) {
            this.segments = segments;
            this.points = [];
            for (let i = 0; i <= segments; i++) {
                this.points.push({ x: 0, y: i * (length / segments), vx: 0, vy: 0 });
            }
            this.length = length;
            this.phase = Math.random() * Math.PI * 2;
            this.oscillationPhase = Math.random() * Math.PI * 2;
        }

        update(dt, anchorX, anchorY, swayPhase, currentX, currentY, reducedMotion) {
            this.phase += dt * (reducedMotion ? 0.3 : 1.8);
            this.oscillationPhase += dt * (reducedMotion ? 0.5 : 2.5);

            // Anchor follows the body rim position
            this.points[0].x = anchorX;
            this.points[0].y = anchorY;

            const swayBase = Math.sin(this.phase + swayPhase) * (reducedMotion ? 4 : 18);
            const currentForceX = currentX * 0.3;
            const currentForceY = currentY * 0.1;

            for (let i = 1; i <= this.segments; i++) {
                const t = i / this.segments;
                const prev = this.points[i - 1];
                const pt = this.points[i];

                // Target: natural gravity + sway increasing toward tip + current drift
                const targetX = this.points[0].x + swayBase * t * t + currentForceX * t;
                const targetY = this.points[0].y + (this.length / this.segments) * i + currentForceY * t;

                // Spring physics with damping (stiffer near base)
                const stiffness = 0.06 + (1 - t) * 0.1;
                const damping = 0.92;

                pt.vx += (targetX - pt.x) * stiffness;
                pt.vy += (targetY - pt.y) * stiffness;
                pt.vx *= damping;
                pt.vy *= damping;
                pt.x += pt.vx;
                pt.y += pt.vy;

                // Secondary undulation
                pt.x += Math.sin(this.oscillationPhase + i * 0.4) * (reducedMotion ? 1 : 3) * t * t;
            }
        }

        draw(ctx, color, alpha, scale) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 0.6)`;
            ctx.lineWidth = Math.max(1, 2 * scale);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            const ps = this.points;
            ctx.moveTo(ps[0].x, ps[0].y);

            // Draw with B-spline interpolation between control points
            for (let i = 0; i < ps.length - 1; i++) {
                const p0 = ps[Math.max(0, i - 1)];
                const p1 = ps[i];
                const p2 = ps[Math.min(ps.length - 1, i + 1)];
                const p3 = ps[Math.min(ps.length - 1, i + 2)];

                for (let t = 0; t < 1; t += 0.2) {
                    const pt = bSplinePoint(t, p0, p1, p2, p3);
                    ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.lineTo(ps[ps.length - 1].x, ps[ps.length - 1].y);
            ctx.stroke();
            ctx.restore();
        }

        getTip() { return this.points[this.points.length - 1]; }
    }

    class Jellyfish {
        constructor(x, y, scale = 1) {
            this.x = x;
            this.y = y;
            this.scale = scale;
            this.baseScale = scale;

            // Animation
            this.pulsePhase = 0;
            this.floatPhase = Math.random() * Math.PI * 2;
            this.heartbeatPhase = 0;
            this.bellDeformPhase = 0;

            // State
            this.state = 'idle';
            this.stateTime = 0;
            this.color = { r: 100, g: 150, b: 255 };
            this.targetColor = { ...this.color };

            // Geometry parameters
            this.bellWidth = 35;
            this.bellHeight = 28;
            this.tentacleCount = 10;
            this.tentacleLength = 90;
            this.grooveCount = 12;

            this.alpha = 0.88;
            this.glowSize = 18;

            // Tentacles
            this.tentacles = [];
            this._buildTentacles();

            // Flocking
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.1;
            this.neighbors = [];
            this.id = Math.random().toString(36).slice(2, 9);

            // Drag steering
            this.isBeingDragged = false;
        }

        _buildTentacles() {
            this.tentacles = [];
            for (let i = 0; i < this.tentacleCount; i++) {
                this.tentacles.push(new Tentacle(this.tentacleLength * this.scale, 14));
            }
        }

        setState(s) {
            if (s !== this.state) {
                this.state = s;
                this.stateTime = 0;
                this.targetColor = { ...(STATE_COLORS[s] || STATE_COLORS.idle) };
            }
        }

        /**
         * Generate bell outline points using superellipse formula.
         * Returns array of {x, y} points around the bell rim.
         */
        _generateBellOutline(cx, cy, w, h, n, pulse) {
            const points = [];
            const steps = 48;
            for (let i = 0; i <= steps; i++) {
                const theta = (i / steps) * Math.PI * 2;
                const r = superEllipseRadius(w, h, theta, n) * pulse;
                points.push({
                    x: cx + Math.cos(theta) * r,
                    y: cy + Math.sin(theta) * r
                });
            }
            return points;
        }

        /**
         * Generate radial groove lines on the bell surface.
         */
        _generateGrooves(cx, cy, w, h, n, pulse) {
            const grooves = [];
            for (let i = 0; i < this.grooveCount; i++) {
                const theta = (i / this.grooveCount) * Math.PI * 2;
                const r = superEllipseRadius(w, h, theta, n) * pulse;
                // Inner point (toward center)
                const innerR = r * 0.25;
                grooves.push({
                    outer: { x: cx + Math.cos(theta) * r, y: cy + Math.sin(theta) * r },
                    inner: { x: cx + Math.cos(theta) * innerR, y: cy + Math.sin(theta) * innerR },
                    angle: theta
                });
            }
            return grooves;
        }

        update(dt, time, limbicParams, reducedMotion) {
            this.stateTime += dt;
            const colorSpeed = reducedMotion ? 0.03 : 0.08;
            this.color = lerpColor(this.color, this.targetColor, colorSpeed);

            const speedMult = limbicParams ? (limbicParams.speedMult || 1.0) : 1.0;
            const motionFactor = reducedMotion ? 0.2 : 1.0;

            this.pulsePhase += dt * 2 * speedMult * motionFactor;
            this.floatPhase += dt * 0.5 * motionFactor;
            this.heartbeatPhase += dt * 3 * speedMult * motionFactor;
            this.bellDeformPhase += dt * 1.5 * motionFactor;

            const rates = { idle: 1, active: 2.5, thinking: 0.7, success: 3.5, error: 5, sleeping: 0.3 };
            this.pulsePhase += dt * (rates[this.state] || 1) * motionFactor;

            // Gentle floating
            const floatAmp = reducedMotion ? 2 : 6;
            this.y += Math.sin(this.floatPhase) * floatAmp * dt;

            // Apply velocity (flocking + drag)
            if (!this.isBeingDragged) {
                this.x += this.vx;
                this.y += this.vy;
            }

            // Bell dimensions with pulse
            const s = this.scale;
            const r = this.bellWidth * s;
            const pulse = Math.sin(this.pulsePhase) * 0.15 + 1.0;
            const bodyW = r * 1.6 * pulse;
            const bodyH = (this.bellHeight * s) * pulse;

            // Update tentacles anchored to rim
            const currentX = (limbicParams && limbicParams.currentX) || 0;
            const currentY = (limbicParams && limbicParams.currentY) || 0;
            for (let i = 0; i < this.tentacles.length; i++) {
                const t = this.tentacles[i];
                const angle = (i / this.tentacles.length) * Math.PI * 2;
                const rimX = this.x + Math.cos(angle) * bodyW * 0.85;
                const rimY = this.y + Math.sin(angle) * bodyH * 0.6;
                t.update(dt, rimX, rimY, angle, currentX, currentY, reducedMotion);
            }
        }

        draw(ctx) {
            ctx.save();

            const s = this.scale;
            const r = this.bellWidth * s;
            const pulse = Math.sin(this.pulsePhase) * 0.15 + 1.0;
            const bodyW = r * 1.6 * pulse;
            const bodyH = (this.bellHeight * s) * pulse;
            const cr = Math.round(this.color.r);
            const cg = Math.round(this.color.g);
            const cb = Math.round(this.color.b);

            // ─── Bioluminescent glow ───
            const glow = ctx.createRadialGradient(
                this.x, this.y - bodyH * 0.1, r * 0.2,
                this.x, this.y, r * 4
            );
            glow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.22)`);
            glow.addColorStop(0.4, `rgba(${cr}, ${cg}, ${cb}, 0.08)`);
            glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = glow;
            ctx.fillRect(this.x - r * 5, this.y - r * 5, r * 10, r * 10);

            // ─── Tentacles (behind bell) ───
            for (const t of this.tentacles) {
                t.draw(ctx, this.color, this.alpha, this.scale);
            }

            // ─── Bell body with superellipse outline ───
            const bellPoints = this._generateBellOutline(this.x, this.y, bodyW, bodyH, 2.3, 1.0);
            const grooves = this._generateGrooves(this.x, this.y, bodyW, bodyH, 2.3, 1.0);

            // Bell fill gradient
            const bodyGrad = ctx.createRadialGradient(
                this.x, this.y - bodyH * 0.35, 0,
                this.x, this.y, bodyW
            );
            bodyGrad.addColorStop(0, `rgba(${cr + 30}, ${cg + 30}, ${cb + 30}, 0.95)`);
            bodyGrad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.65)`);
            bodyGrad.addColorStop(0.85, `rgba(${Math.round(cr*0.5)}, ${Math.round(cg*0.5)}, ${Math.round(cb*0.7)}, 0.35)`);
            bodyGrad.addColorStop(1, `rgba(${Math.round(cr*0.25)}, ${Math.round(cg*0.25)}, ${Math.round(cb*0.4)}, 0.1)`);

            ctx.fillStyle = bodyGrad;
            ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.45)`;
            ctx.shadowBlur = this.glowSize * s;

            ctx.beginPath();
            ctx.moveTo(bellPoints[0].x, bellPoints[0].y);
            for (let i = 1; i < bellPoints.length; i++) {
                ctx.lineTo(bellPoints[i].x, bellPoints[i].y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // ─── Radial grooves ───
            ctx.strokeStyle = `rgba(${Math.round(cr*0.7)}, ${Math.round(cg*0.7)}, ${Math.round(cb*0.9)}, 0.18)`;
            ctx.lineWidth = Math.max(0.5, s);
            for (const g of grooves) {
                ctx.beginPath();
                ctx.moveTo(g.inner.x, g.inner.y);
                ctx.lineTo(g.outer.x, g.outer.y);
                ctx.stroke();
            }

            // ─── Inner heartbeat orb ───
            const beat = Math.sin(this.heartbeatPhase) * 0.25 + 0.75;
            const orbR = r * 0.3 * beat;
            const orbGrad = ctx.createRadialGradient(
                this.x, this.y - bodyH * 0.15, 0,
                this.x, this.y - bodyH * 0.15, orbR
            );
            orbGrad.addColorStop(0, `rgba(230, 250, 255, 0.9)`);
            orbGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y - bodyH * 0.15, orbR, 0, Math.PI * 2);
            ctx.fill();

            // ─── Bell rim highlight ───
            ctx.strokeStyle = `rgba(${Math.min(255, cr + 50)}, ${Math.min(255, cg + 50)}, ${Math.min(255, cb + 50)}, 0.4)`;
            ctx.lineWidth = Math.max(0.5, 1.2 * s);
            ctx.beginPath();
            // Draw top half of bell rim
            const topPoints = bellPoints.filter((_, i) => {
                const theta = (i / bellPoints.length) * Math.PI * 2;
                return theta <= Math.PI;
            });
            if (topPoints.length > 0) {
                ctx.moveTo(topPoints[0].x, topPoints[0].y);
                for (let i = 1; i < topPoints.length; i++) {
                    ctx.lineTo(topPoints[i].x, topPoints[i].y);
                }
            }
            ctx.stroke();

            // ─── Oral arms (short fronds between tentacles) ───
            ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.35)`;
            ctx.lineWidth = Math.max(0.5, 1.5 * s);
            for (let i = 0; i < this.tentacles.length; i++) {
                const t1 = this.tentacles[i];
                const t2 = this.tentacles[(i + 1) % this.tentacles.length];
                if (t1.points.length > 3 && t2.points.length > 3) {
                    const midIdx = Math.floor(t1.points.length / 3);
                    const p1 = t1.points[midIdx];
                    const p2 = t2.points[midIdx];
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.quadraticCurveTo(
                        (p1.x + p2.x) / 2 + Math.sin(this.bellDeformPhase + i) * 5,
                        (p1.y + p2.y) / 2 + 10,
                        p2.x, p2.y
                    );
                    ctx.stroke();
                }
            }

            ctx.restore();
        }

        emitSparkles(particleSystem, reducedMotion) {
            if (reducedMotion) return;
            const hue = Utils.map(this.color.r + this.color.g + this.color.b, 150, 600, 180, 300);
            for (const t of this.tentacles) {
                if (Math.random() > 0.88) {
                    const tip = t.getTip();
                    particleSystem.emitSparkle(tip.x, tip.y, hue + Math.random() * 40 - 20);
                }
            }
        }

        updateNeighbors(allJellyfish, boundsW, boundsH) {
            const perception = 150 * this.scale;
            let sepX = 0, sepY = 0, alignX = 0, alignY = 0, cohX = 0, cohY = 0;
            let count = 0;

            for (const other of allJellyfish) {
                if (other.id === this.id) continue;
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0 && dist < perception) {
                    sepX -= dx / dist;
                    sepY -= dy / dist;
                    alignX += other.vx;
                    alignY += other.vy;
                    cohX += other.x;
                    cohY += other.y;
                    count++;
                }
            }

            const factor = 0.008;
            if (count > 0) {
                this.vx += (sepX * 1.5 + alignX / count + (cohX / count - this.x) * 0.5) * factor;
                this.vy += (sepY * 1.5 + alignY / count + (cohY / count - this.y) * 0.5) * factor;
            }

            const margin = 60;
            if (this.x < margin) this.vx += 0.003;
            if (this.x > boundsW - margin) this.vx -= 0.003;
            if (this.y < margin) this.vy += 0.003;
            if (this.y > boundsH - margin) this.vy -= 0.003;

            this.vx *= 0.98;
            this.vy *= 0.98;
        }
    }

    global.Jellyfish = Jellyfish;
})(window);