/**
 * jellyfish.js — The Cnidaria Agent v3.0
 *
 * Image-based single jellyfish with screen-bound constraints.
 * Renders a loaded PNG/WebP image with gentle floating animation,
 * pulsing glow, and bioluminescent particles.
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

    class Jellyfish {
        constructor(x, y, scale = 1) {
            this.x = x;
            this.y = y;
            this.scale = scale;
            this.baseScale = scale;

            // Image
            this.image = null;
            this.imageWidth = 512;  // assumed square source
            this.imageHeight = 512;
            this.imageLoaded = false;

            // Screen bounds (set externally via setBounds)
            this.bounds = { minX: 60, maxX: window.innerWidth - 60, minY: 60, maxY: window.innerHeight - 60 };

            // Animation
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.floatPhase = Math.random() * Math.PI * 2;
            this.heartbeatPhase = 0;
            this.tiltPhase = 0;

            // State
            this.state = 'idle';
            this.stateTime = 0;
            this.color = { r: 100, g: 150, b: 255 };
            this.targetColor = { ...this.color };

            // Physics
            this.vx = 0;
            this.vy = 0;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.isBeingDragged = false;

            this.alpha = 0.92;
            this.glowSize = 20;
            this.id = Math.random().toString(36).slice(2, 9);
        }

        setImage(imgOrUrl) {
            if (typeof imgOrUrl === 'string') {
                const img = new Image();
                img.onload = () => {
                    this.image = img;
                    this.imageWidth = img.naturalWidth || 512;
                    this.imageHeight = img.naturalHeight || 512;
                    this.imageLoaded = true;
                };
                img.src = imgOrUrl;
            } else if (imgOrUrl && imgOrUrl.naturalWidth) {
                this.image = imgOrUrl;
                this.imageWidth = imgOrUrl.naturalWidth;
                this.imageHeight = imgOrUrl.naturalHeight;
                this.imageLoaded = true;
            }
        }

        setBounds(w, h) {
            // Leave margin for image half-size + glow
            const margin = Math.max(80, this.renderSize() * 0.6);
            this.bounds = {
                minX: margin,
                maxX: w - margin,
                minY: margin,
                maxY: h - margin
            };
        }

        renderSize() {
            return Math.max(this.imageWidth, this.imageHeight) * this.scale;
        }

        setState(s) {
            if (s !== this.state) {
                this.state = s;
                this.stateTime = 0;
                this.targetColor = { ...(STATE_COLORS[s] || STATE_COLORS.idle) };
            }
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
            this.tiltPhase += dt * 0.8 * motionFactor;

            // State pulse rates
            const rates = { idle: 1, active: 2.5, thinking: 0.7, success: 3.5, error: 5, sleeping: 0.3 };
            this.pulsePhase += dt * (rates[this.state] || 1) * motionFactor;

            if (!this.isBeingDragged) {
                // Gentle floating
                const floatAmp = reducedMotion ? 2 : 6;
                this.y += Math.sin(this.floatPhase) * floatAmp * dt;
                this.x += Math.cos(this.floatPhase * 0.7) * floatAmp * 0.5 * dt;

                // Apply velocity
                this.x += this.vx;
                this.y += this.vy;

                // Soft bounds enforcement
                if (this.x < this.bounds.minX) { this.x = this.bounds.minX; this.vx *= -0.5; }
                if (this.x > this.bounds.maxX) { this.x = this.bounds.maxX; this.vx *= -0.5; }
                if (this.y < this.bounds.minY) { this.y = this.bounds.minY; this.vy *= -0.5; }
                if (this.y > this.bounds.maxY) { this.y = this.bounds.maxY; this.vy *= -0.5; }

                // Damping
                this.vx *= 0.96;
                this.vy *= 0.96;
            }
        }

        draw(ctx) {
            if (!this.imageLoaded || !this.image) return;

            ctx.save();

            const pulse = Math.sin(this.pulsePhase) * 0.12 + 1.0;
            const tilt = Math.sin(this.tiltPhase) * 0.05;
            const s = this.scale * pulse;
            const cr = Math.round(this.color.r);
            const cg = Math.round(this.color.g);
            const cb = Math.round(this.color.b);

            const drawW = this.imageWidth * s;
            const drawH = this.imageHeight * s;

            // ─── Bioluminescent glow behind image ───
            const glowR = Math.max(drawW, drawH) * 0.6;
            const glow = ctx.createRadialGradient(
                this.x, this.y, glowR * 0.15,
                this.x, this.y, glowR
            );
            glow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.3)`);
            glow.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, 0.08)`);
            glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = glow;
            ctx.fillRect(this.x - glowR, this.y - glowR, glowR * 2, glowR * 2);

            // ─── Draw image with pulse + tilt ───
            ctx.translate(this.x, this.y);
            ctx.rotate(tilt);
            ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.45)`;
            ctx.shadowBlur = this.glowSize * s;
            ctx.globalAlpha = this.alpha;
            ctx.drawImage(
                this.image,
                -drawW / 2,
                -drawH / 2,
                drawW,
                drawH
            );
            ctx.shadowBlur = 0;

            // ─── Inner heartbeat overlay ───
            const beat = Math.sin(this.heartbeatPhase) * 0.25 + 0.75;
            const orbR = Math.min(drawW, drawH) * 0.18 * beat;
            const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, orbR);
            orbGrad.addColorStop(0, `rgba(230, 250, 255, 0.55)`);
            orbGrad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.fillStyle = orbGrad;
            ctx.beginPath();
            ctx.arc(0, 0, orbR, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        emitSparkles(particleSystem, reducedMotion) {
            if (reducedMotion || !particleSystem) return;
            const hue = Utils.map(this.color.r + this.color.g + this.color.b, 150, 600, 180, 300);
            if (Math.random() > 0.92) {
                // Emit from bottom of jellyfish
                const s = this.scale;
                const bottomY = this.y + this.imageHeight * s * 0.45;
                particleSystem.emitSparkle(this.x + (Math.random() - 0.5) * 20, bottomY, hue + Math.random() * 40 - 20);
            }
        }

        // Drag interaction
        startDrag(px, py) {
            this.isBeingDragged = true;
            this.dragOffsetX = this.x - px;
            this.dragOffsetY = this.y - py;
        }

        dragTo(px, py) {
            if (!this.isBeingDragged) return;
            this.x = Utils.clamp(px + this.dragOffsetX, this.bounds.minX, this.bounds.maxX);
            this.y = Utils.clamp(py + this.dragOffsetY, this.bounds.minY, this.bounds.maxY);
        }

        endDrag() {
            this.isBeingDragged = false;
        }
    }

    global.Jellyfish = Jellyfish;
})(window);