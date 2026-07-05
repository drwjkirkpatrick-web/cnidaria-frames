/**
 * jellyfish.js — The Cnidaria Agent v1.1
 *
 * Renders a procedural jellyfish with pulsing animation, spring-physics
 * tentacles, bioluminescent glow, inner heartbeat orb, and sparkle emissions.
 * Supports swarm/flocking mode via updateNeighbors().
 *
 * States: idle, active, thinking, success, error, sleeping
 */

(function(global) {
    'use strict';

    // ─── Color targets per state ───
    const STATE_COLORS = {
        idle:     { r: 100, g: 150, b: 255 },
        active:   { r: 100, g: 200, b: 255 },
        thinking: { r: 150, g: 150, b: 255 },
        success:  { r: 100, g: 255, b: 150 },
        error:    { r: 255, g: 100, b: 100 },
        sleeping: { r: 150, g: 150, b: 200 }
    };

    /**
     * Smooth linear interpolation between objects with numeric keys.
     */
    function lerpColor(current, target, t) {
        return {
            r: Utils.lerp(current.r, target.r, t),
            g: Utils.lerp(current.g, target.g, t),
            b: Utils.lerp(current.b, target.b, t)
        };
    }

    /**
     * A single tentacle segment with simple spring-physics.
     */
    class Tentacle {
        constructor(baseX, baseY, length, segments = 10) {
            this.segments = segments;
            this.points = [];
            for (let i = 0; i <= segments; i++) {
                this.points.push({ x: baseX, y: baseY + (length / segments) * i });
            }
            this.length = length;
            this.targetAngle = 0;
            this.phase = Math.random() * Math.PI * 2;
        }

        update(dt, baseX, baseY, bodyWidth, bodyHeight, angle, pulse, reducedMotion) {
            this.phase += dt * (reducedMotion ? 0.5 : 2.0);

            // Anchor first point to body rim
            this.points[0].x = baseX;
            this.points[0].y = baseY + bodyHeight;

            const sway = Math.sin(this.phase + angle * 3) * (reducedMotion ? 5 : 18) * pulse;
            const gravity = 3; // slight downward pull

            for (let i = 1; i <= this.segments; i++) {
                const t = i / this.segments;
                const prev = this.points[i - 1];
                const pt = this.points[i];

                // Target position with sway increasing along length
                const targetX = this.points[0].x + Math.sin(this.phase + i * 0.3) * sway * t + Math.cos(angle) * bodyWidth * 0.2 * t;
                const targetY = this.points[0].y + (this.length / this.segments) * i + gravity * t;

                // Spring toward target (stiffer near base, looser near tip)
                const spring = 0.08 + (1 - t) * 0.12;
                pt.x += (targetX - pt.x) * spring;
                pt.y += (targetY - pt.y) * spring;
            }
        }

        draw(ctx, color, alpha, scale) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, 0.65)`;
            ctx.lineWidth = 2 * scale;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i <= this.segments; i++) {
                ctx.lineTo(this.points[i].x, this.points[i].y);
            }
            ctx.stroke();
            ctx.restore();
        }

        getTip() {
            return this.points[this.segments];
        }
    }

    class Jellyfish {
        constructor(x, y, scale = 1) {
            this.x = x;
            this.y = y;
            this.scale = scale;
            this.baseScale = scale;

            // Animation properties
            this.pulsePhase = 0;
            this.floatPhase = Math.random() * Math.PI * 2;
            this.heartbeatPhase = 0;

            // State tracking
            this.state = 'idle';
            this.stateTime = 0;

            // Smooth color transition
            this.color = { r: 100, g: 150, b: 255 };
            this.targetColor = { ...this.color };

            // Size parameters (responsive base)
            this.bodyRadius = 30;
            this.tentacleCount = 8;
            this.tentacleLength = 80;

            this.alpha = 0.85;
            this.glowSize = 15;

            // Spring-physics tentacles
            this.tentacles = [];
            this._buildTentacles();

            // Flocking / swarm
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.1;
            this.neighbors = [];
            this.id = Math.random().toString(36).slice(2, 9);
        }

        _buildTentacles() {
            this.tentacles = [];
            for (let i = 0; i < this.tentacleCount; i++) {
                const angle = (i / this.tentacleCount) * Math.PI * 2;
                this.tentacles.push(new Tentacle(this.x, this.y, this.tentacleLength * this.scale, 10));
                this.tentacles[i].angle = angle; // stash for updates
            }
        }

        setState(newState) {
            if (newState !== this.state) {
                this.state = newState;
                this.stateTime = 0;
                this.targetColor = { ...(STATE_COLORS[newState] || STATE_COLORS.idle) };
            }
        }

        update(dt, time, limbicParams, reducedMotion) {
            this.stateTime += dt;

            // Smooth color transition (lerp factor tuned for ~0.4s feel)
            const colorSpeed = reducedMotion ? 0.03 : 0.08;
            this.color = lerpColor(this.color, this.targetColor, colorSpeed);

            // Update animation phases
            const speedMult = limbicParams ? (limbicParams.speedMult || 1.0) : 1.0;
            const motionFactor = reducedMotion ? 0.2 : 1.0;

            this.pulsePhase += dt * 2 * speedMult * motionFactor;
            this.floatPhase += dt * 0.5 * motionFactor;
            this.heartbeatPhase += dt * 3 * speedMult * motionFactor;

            // State-specific pulse rates
            const statePulseRates = {
                idle: 1, active: 2.5, thinking: 0.7,
                success: 3.5, error: 5, sleeping: 0.3
            };
            this.pulsePhase += dt * (statePulseRates[this.state] || 1) * motionFactor;

            // Floating motion
            const floatAmp = reducedMotion ? 2 : 6;
            this.y += Math.sin(this.floatPhase) * floatAmp * dt;

            // Responsive scale based on screen size (handled externally via resize)
            const r = this.bodyRadius * this.scale;
            const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
            const bodyW = r * 1.5 * pulse;
            const bodyH = r * pulse;

            // Update tentacles
            for (let i = 0; i < this.tentacles.length; i++) {
                const t = this.tentacles[i];
                t.update(dt, this.x, this.y, bodyW, bodyH, t.angle, pulse, reducedMotion);
            }
        }

        draw(ctx) {
            ctx.save();

            const r = this.bodyRadius * this.scale;
            const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
            const bodyW = r * 1.5 * pulse;
            const bodyH = r * pulse;
            const cr = Math.round(this.color.r);
            const cg = Math.round(this.color.g);
            const cb = Math.round(this.color.b);

            // ─── Bioluminescent glow / bloom ───
            const glow = ctx.createRadialGradient(
                this.x, this.y - bodyH * 0.2, r * 0.3,
                this.x, this.y, r * 3.5
            );
            glow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.25)`);
            glow.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.06)`);
            glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = glow;
            ctx.fillRect(this.x - r * 4, this.y - r * 4, r * 8, r * 8);

            // ─── Tentacles ───
            for (const t of this.tentacles) {
                t.draw(ctx, this.color, this.alpha, this.scale);
            }

            // ─── Jellyfish body ───
            const bodyGrad = ctx.createRadialGradient(
                this.x, this.y - bodyH * 0.3, 0,
                this.x, this.y, bodyW * 0.9
            );
            bodyGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.92)`);
            bodyGrad.addColorStop(0.7, `rgba(${Math.round(cr*0.7)}, ${Math.round(cg*0.7)}, ${Math.round(cb*0.85)}, 0.5)`);
            bodyGrad.addColorStop(1, `rgba(${Math.round(cr*0.35)}, ${Math.round(cg*0.35)}, ${Math.round(cb*0.55)}, 0.15)`);

            ctx.fillStyle = bodyGrad;
            ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.5)`;
            ctx.shadowBlur = this.glowSize * this.scale;

            ctx.beginPath();
            ctx.ellipse(this.x, this.y, bodyW, bodyH, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // ─── Inner heartbeat orb ───
            const beat = Math.sin(this.heartbeatPhase) * 0.3 + 0.7;
            const orbR = r * 0.35 * beat;
            const orbGrad = ctx.createRadialGradient(
                this.x, this.y - bodyH * 0.1, 0,
                this.x, this.y - bodyH * 0.1, orbR
            );
            orbGrad.addColorStop(0, `rgba(220, 245, 255, 0.85)`);
            orbGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(this.x, this.y - bodyH * 0.1, orbR, 0, Math.PI * 2);
            ctx.fill();

            // ─── Body rim highlight ───
            ctx.strokeStyle = `rgba(${cr + 40}, ${cg + 40}, ${cb + 40}, 0.35)`;
            ctx.lineWidth = 1 * this.scale;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, bodyW, bodyH, 0, 0, Math.PI);
            ctx.stroke();

            ctx.restore();
        }

        /**
         * Emit sparkle particles from each tentacle tip into the particle system.
         */
        emitSparkles(particleSystem, reducedMotion) {
            if (reducedMotion) return;
            const hue = Utils.getColorFromValue(
                (this.color.r + this.color.g + this.color.b) / (255 * 3) * 0.4 + 0.5
            ); // rough hue estimate
            const hueVal = Utils.map(this.color.r + this.color.g + this.color.b, 150, 600, 180, 300);
            for (const t of this.tentacles) {
                if (Math.random() > 0.85) {
                    const tip = t.getTip();
                    particleSystem.emitSparkle(tip.x, tip.y, hueVal + Math.random() * 40 - 20);
                }
            }
        }

        /**
         * Flocking: update velocity based on neighbors.
         */
        updateNeighbors(allJellyfish, boundsW, boundsH) {
            const perception = 150 * this.scale;
            let sepX = 0, sepY = 0;
            let alignX = 0, alignY = 0;
            let cohX = 0, cohY = 0;
            let count = 0;

            for (const other of allJellyfish) {
                if (other.id === this.id) continue;
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0 && dist < perception) {
                    // Separation
                    sepX -= dx / dist;
                    sepY -= dy / dist;
                    // Alignment
                    alignX += other.vx;
                    alignY += other.vy;
                    // Cohesion
                    cohX += other.x;
                    cohY += other.y;
                    count++;
                }
            }

            const factor = 0.008; // gentle flocking
            if (count > 0) {
                this.vx += (sepX * 1.5 + alignX / count + (cohX / count - this.x) * 0.5) * factor;
                this.vy += (sepY * 1.5 + alignY / count + (cohY / count - this.y) * 0.5) * factor;
            }

            // Soft bounds: steer back toward center if near edge
            const margin = 60;
            if (this.x < margin) this.vx += 0.003;
            if (this.x > boundsW - margin) this.vx -= 0.003;
            if (this.y < margin) this.vy += 0.003;
            if (this.y > boundsH - margin) this.vy -= 0.003;

            // Damping
            this.vx *= 0.98;
            this.vy *= 0.98;

            this.x += this.vx;
            this.y += this.vy;
        }
    }

    global.Jellyfish = Jellyfish;
})(window);