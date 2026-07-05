/**
 * jellyfish.js — The Cnidaria Agent v4.0
 *
 * Image-based single jellyfish with procedural animation from still frame.
 * Techniques: breath pulse, bell expansion, vertical slice tentacle warp,
 * color tint overlay, screen-bound constraints.
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

    function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs((h / 60) % 2 - 1));
        const m = l - c / 2;
        let r, g, b;
        if (h < 60)       { r = c; g = x; b = 0; }
        else if (h < 120) { r = x; g = c; b = 0; }
        else if (h < 180) { r = 0; g = c; b = x; }
        else if (h < 240) { r = 0; g = x; b = c; }
        else if (h < 300) { r = x; g = 0; b = c; }
        else              { r = c; g = 0; b = x; }
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255)
        };
    }

    class Jellyfish {
        constructor(x, y, scale = 1) {
            this.x = x;
            this.y = y;
            this.targetX = x;
            this.targetY = y;
            this.scale = scale;
            this.baseScale = scale;

            // Image
            this.image = null;
            this.imageWidth = 512;
            this.imageHeight = 512;
            this.imageLoaded = false;
            this.imageLoading = false;
            this.loadError = false;

            // Screen bounds
            this.bounds = { minX: 60, maxX: window.innerWidth - 60, minY: 60, maxY: window.innerHeight - 60 };

            // Animation
            this.pulsePhase = Math.random() * Math.PI * 2;
            this.floatPhase = Math.random() * Math.PI * 2;
            this.heartbeatPhase = 0;
            this.tiltPhase = 0;
            this.breathPhase = Math.random() * Math.PI * 2;

            // State
            this.state = 'idle';
            this.stateTime = 0;
            this.color = { r: 100, g: 150, b: 255 };
            this.targetColor = { ...this.color };

            // Deluxe color override (HSL)
            this.colorOverride = null; // { h, s, l }

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
                this.imageLoading = true;
                this.loadError = false;
                const img = new Image();
                img.onload = () => {
                    this.image = img;
                    this.imageWidth = img.naturalWidth || 512;
                    this.imageHeight = img.naturalHeight || 512;
                    this.imageLoaded = true;
                    this.imageLoading = false;
                };
                img.onerror = () => {
                    this.imageLoading = false;
                    this.loadError = true;
                };
                img.src = imgOrUrl;
            } else if (imgOrUrl && imgOrUrl.naturalWidth) {
                this.image = imgOrUrl;
                this.imageWidth = imgOrUrl.naturalWidth;
                this.imageHeight = imgOrUrl.naturalHeight;
                this.imageLoaded = true;
                this.imageLoading = false;
            }
        }

        setBounds(w, h) {
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

        // Deluxe color selector override
        setColorOverride(h, s, l) {
            this.colorOverride = { h, s, l };
            const rgb = hslToRgb(h, s, l);
            this.targetColor = rgb;
            this.color = { ...rgb };
        }

        clearColorOverride() {
            this.colorOverride = null;
            this.targetColor = { ...(STATE_COLORS[this.state] || STATE_COLORS.idle) };
        }

        update(dt, time, limbicParams, reducedMotion) {
            this.stateTime += dt;
            const colorSpeed = reducedMotion ? 0.03 : 0.08;
            if (!this.colorOverride) {
                this.color = lerpColor(this.color, this.targetColor, colorSpeed);
            }

            const speedMult = limbicParams ? (limbicParams.speedMult || 1.0) : 1.0;
            const motionFactor = reducedMotion ? 0.2 : 1.0;

            this.pulsePhase += dt * 2 * speedMult * motionFactor;
            this.floatPhase += dt * 0.5 * motionFactor;
            this.heartbeatPhase += dt * 3 * speedMult * motionFactor;
            this.tiltPhase += dt * 0.8 * motionFactor;
            this.breathPhase += dt * 1.2 * motionFactor;

            const rates = { idle: 1, active: 2.5, thinking: 0.7, success: 3.5, error: 5, sleeping: 0.3 };
            this.pulsePhase += dt * (rates[this.state] || 1) * motionFactor;

            if (!this.isBeingDragged) {
                this.x += (this.targetX - this.x) * 0.05;
                this.y += (this.targetY - this.y) * 0.05;

                const floatAmp = reducedMotion ? 2 : 6;
                this.y += Math.sin(this.floatPhase) * floatAmp * dt;
                this.x += Math.cos(this.floatPhase * 0.7) * floatAmp * 0.5 * dt;

                this.x += this.vx;
                this.y += this.vy;

                if (this.x < this.bounds.minX) { this.x = this.bounds.minX; this.vx *= -0.5; }
                if (this.x > this.bounds.maxX) { this.x = this.bounds.maxX; this.vx *= -0.5; }
                if (this.y < this.bounds.minY) { this.y = this.bounds.minY; this.vy *= -0.5; }
                if (this.y > this.bounds.maxY) { this.y = this.bounds.maxY; this.vy *= -0.5; }

                this.vx *= 0.96;
                this.vy *= 0.96;
            }
        }

        // ─── Procedural animation from still frame ───
        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);

            if (this.imageLoading) {
                this._drawSpinner(ctx);
                ctx.restore();
                return;
            }
            if (this.loadError || !this.imageLoaded) {
                this._drawError(ctx);
                ctx.restore();
                return;
            }

            const breath = Math.sin(this.breathPhase) * 0.06 + 1.0;       // subtle breath
            const pulse = Math.sin(this.pulsePhase) * 0.12 + 1.0;        // stronger pulse
            const tilt = Math.sin(this.tiltPhase) * 0.05;
            const combinedScale = this.scale * breath * pulse;

            const cr = Math.round(this.color.r);
            const cg = Math.round(this.color.g);
            const cb = Math.round(this.color.b);

            const drawW = this.imageWidth * combinedScale;
            const drawH = this.imageHeight * combinedScale;

            // ─── Bioluminescent glow (pulses with breath) ───
            const glowR = Math.max(drawW, drawH) * 0.7;
            const glow = ctx.createRadialGradient(
                0, 0, glowR * 0.12,
                0, 0, glowR
            );
            const ga = 0.25 + breath * 0.15; // glow alpha modulated by breath
            glow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${ga})`);
            glow.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${ga * 0.25})`);
            glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = glow;
            ctx.fillRect(-glowR, -glowR, glowR * 2, glowR * 2);

            // ─── Draw image with pulse + tilt ───
            ctx.rotate(tilt);
            ctx.shadowColor = `rgba(${cr}, ${cg}, ${cb}, 0.45)`;
            ctx.shadowBlur = this.glowSize * combinedScale * breath;
            ctx.globalAlpha = this.alpha;

            // ─── Tentacle warp: slice bottom half into strips ───
            // This creates a flowing motion effect for tentacles from a still image
            const img = this.image;
            const iw = this.imageWidth;
            const ih = this.imageHeight;
            const sliceCount = 8;
            const bellSplitY = ih * 0.35; // where bell ends, tentacles begin

            // Draw top portion (bell) normally
            const bellH = bellSplitY * combinedScale;
            ctx.drawImage(
                img,
                0, 0, iw, bellSplitY,
                -drawW / 2, -drawH / 2, drawW, bellH
            );

            // Draw tentacles as warped slices
            const tentacleH = (ih - bellSplitY) * combinedScale;
            const sliceH = tentacleH / sliceCount;
            const sourceSliceH = (ih - bellSplitY) / sliceCount;

            for (let i = 0; i < sliceCount; i++) {
                const sy = bellSplitY + i * sourceSliceH;
                const dy = -drawH / 2 + bellH + i * sliceH;
                // Wave offset increases toward bottom (more tentacle movement)
                const waveStrength = (i + 1) / sliceCount;
                const wave = Math.sin(this.breathPhase * 1.5 + i * 0.6) * 8 * waveStrength * combinedScale;
                const stretch = 1 + Math.sin(this.breathPhase + i * 0.3) * 0.03 * waveStrength;

                ctx.drawImage(
                    img,
                    0, sy, iw, sourceSliceH + 1, // +1 prevents gap lines
                    -drawW / 2 + wave,
                    dy,
                    drawW * stretch,
                    sliceH * stretch
                );
            }

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

        _drawSpinner(ctx) {
            ctx.strokeStyle = 'rgba(200,230,255,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const r = 16 * this.scale;
            const angle = performance.now() / 300;
            ctx.arc(0, 0, r, angle, angle + 1.5);
            ctx.stroke();
        }

        _drawError(ctx) {
            ctx.strokeStyle = 'rgba(255,100,100,0.3)';
            ctx.lineWidth = 2;
            const r = 12 * this.scale;
            ctx.beginPath();
            ctx.moveTo(-r, -r); ctx.lineTo(r, r);
            ctx.moveTo(r, -r); ctx.lineTo(-r, r);
            ctx.stroke();
        }

        emitSparkles(particleSystem, reducedMotion) {
            if (reducedMotion || !particleSystem) return;
            const hue = Utils.map(this.color.r + this.color.g + this.color.b, 150, 600, 180, 300);
            if (Math.random() > 0.92) {
                const s = this.scale;
                const bottomY = this.y + this.imageHeight * s * 0.45;
                particleSystem.emitSparkle(this.x + (Math.random() - 0.5) * 20, bottomY, hue + Math.random() * 40 - 20);
            }
        }

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
