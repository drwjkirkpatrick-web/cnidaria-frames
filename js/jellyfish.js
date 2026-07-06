/**
 * jellyfish.js — The Cnidaria Agent v6.1
 *
 * Image-based single jellyfish with professional animation engine.
 * Integrates with JellyfishAnimator for the 12 Principles of Animation.
 * Techniques: breath pulse, bell expansion, vertical slice tentacle warp,
 * squash & stretch, spring follow-through, arc drift, micro-expressions.
 *
 * v6.1: Restored backward-compatible API (setState, color, pulsePhase,
 * emitSparkles) so main.js animate loop doesn't crash.
 */

(function(global) {
    'use strict';

    const VARIANTS = [
        'assets/jellyfish-variants/jellyfish-01.png',
        'assets/jellyfish-variants/jellyfish-02.png',
        'assets/jellyfish-variants/jellyfish-03.png',
        'assets/jellyfish-variants/jellyfish-04.png',
        'assets/jellyfish-variants/jellyfish-05.png',
        'assets/jellyfish-variants/jellyfish-06.png',
        'assets/jellyfish-variants/jellyfish-07.png',
        'assets/jellyfish-variants/jellyfish-08.png',
    ];

    class Jellyfish {
        constructor(x, y, scale = 1) {
            this.x = x;
            this.y = y;
            this.targetX = x;
            this.targetY = y;
            this.scale = scale;
            this.baseScale = scale;

            // ─── Backward-compatible properties for main.js ───
            // main.js animate loop reads/writes these directly
            this.pulsePhase = 0;          // incremented by mic input + animate loop
            this.color = { r: 100, g: 200, b: 255 };  // base color, theme tint applied per-frame
            this.state = 'idle';           // set by setState()

            // Animation engine integration
            this.animator = null;
            this.squashX = 1;
            this.squashY = 1;
            this.arcOffsetX = 0;
            this.arcOffsetY = 0;
            this.springOffsets = [];
            this.particles = [];
            this.isBlinking = false;
            this.isTwitching = false;
            this.glowIntensity = 1.0;

            // Image
            this.image = null;
            this.imageLoaded = false;
            this.imageLoading = false;
            this.loadError = false;
            this.drawW = 0;
            this.drawH = 0;

            // Interaction
            this.isBeingDragged = false;
            this.vx = 0;
            this.vy = 0;

            // Color override (from deluxe color selector)
            this.colorOverride = null; // { h, s, l }

            // v6.0 image settings
            this.opacity = 1.0;
            this.shadowEnabled = false;
            this.scaleMult = 1.0;

            // Bounds (set externally)
            this.minX = 0;
            this.minY = 0;
            this.maxX = window.innerWidth;
            this.maxY = window.innerHeight;

            // Preload a random variant
            this.setImage(VARIANTS[Math.floor(Math.random() * VARIANTS.length)]);
        }

        // ─── Backward-compatible methods for main.js ───

        /** Called by main.js animate loop with state string */
        setState(state) {
            this.state = state || 'idle';
        }

        /** Called by main.js to emit sparkle particles */
        emitSparkles(particleSystem, reducedMotion) {
            if (!particleSystem || !particleSystem.emitSparkle) return;
            // Emit a few sparkles near the jellyfish center
            const count = reducedMotion ? 1 : 2;
            for (let i = 0; i < count; i++) {
                const offsetX = (Math.random() - 0.5) * (this.drawW || 100) * 0.6;
                const offsetY = (Math.random() - 0.5) * (this.drawH || 100) * 0.4;
                particleSystem.emitSparkle(this.x + offsetX, this.y + offsetY);
            }
        }

        // ─── End backward-compat ───

        setAnimator(animator) {
            this.animator = animator;
        }

        setImage(imgOrUrl) {
            if (typeof imgOrUrl === 'string') {
                this.imageLoading = true;
                this.loadError = false;
                this.imageLoaded = false;
                const img = new Image();
                img.onload = () => {
                    this.image = img;
                    this.imageLoaded = true;
                    this.imageLoading = false;
                    this.drawW = img.naturalWidth;
                    this.drawH = img.naturalHeight;
                };
                img.onerror = () => {
                    this.imageLoading = false;
                    this.loadError = true;
                };
                img.src = imgOrUrl;
            } else if (imgOrUrl && imgOrUrl instanceof HTMLImageElement) {
                this.image = imgOrUrl;
                this.imageLoaded = true;
                this.imageLoading = false;
                this.drawW = imgOrUrl.naturalWidth;
                this.drawH = imgOrUrl.naturalHeight;
            }
        }

        setBounds(w, h) {
            this.maxX = w;
            this.maxY = h;
            this._clamp();
        }

        _clamp() {
            const pad = (this.drawW || 200) * this.baseScale * 0.5 + 20;
            this.x = Math.max(pad, Math.min(this.maxX - pad, this.x));
            this.y = Math.max(pad, Math.min(this.maxY - pad, this.y));
        }

        setColorOverride(h, s, l) {
            this.colorOverride = { h, s, l };
        }

        setOpacity(val) { this.opacity = Math.max(0.1, Math.min(1, val)); }
        setShadow(enabled) { this.shadowEnabled = enabled; }
        setScaleMult(val) { this.scaleMult = Math.max(0.3, Math.min(2, val)); }

        clearColorOverride() {
            this.colorOverride = null;
        }

        // Accepts extra args for backward compat with main.js call:
        // jellyfish.update(effectiveDt, now / 1000, limbicParams, reducedMotion)
        update(dt) {
            // Extra args ignored — animator handles everything
            if (this.animator) {
                this.animator.update(dt);
            }
            if (!this.isBeingDragged) {
                this._clamp();
            }
        }

        draw(ctx) {
            ctx.save();

            // Position with arc offset
            const drawX = this.x + (this.arcOffsetX || 0);
            const drawY = this.y + (this.arcOffsetY || 0);
            ctx.translate(drawX, drawY);

            // ─── Loading spinner ───
            if (this.imageLoading) {
                const t = performance.now() / 1000;
                ctx.strokeStyle = 'rgba(106,184,255,0.6)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, 20, t * 3, t * 3 + 4);
                ctx.stroke();
                ctx.restore();
                return;
            }

            // ─── Error fallback ───
            if (this.loadError || !this.imageLoaded || !this.image) {
                ctx.strokeStyle = 'rgba(255,100,100,0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-15, -15); ctx.lineTo(15, 15);
                ctx.moveTo(15, -15); ctx.lineTo(-15, 15);
                ctx.stroke();
                ctx.restore();
                return;
            }

            // ─── Squash & Stretch ───
            const sx = this.squashX || 1;
            const sy = this.squashY || 1;
            ctx.scale(sx, sy);

            // ─── Apply global opacity to the image ───
            ctx.globalAlpha = this.opacity;

            // ─── Bioluminescent glow ───
            const glow = this.glowIntensity || 1.0;
            if (glow > 0.3) {
                ctx.shadowBlur = 30 * glow;
                ctx.shadowColor = this._getGlowColor();
            }

            // ─── Draw the jellyfish image ───
            const aspect = this.image.naturalWidth / this.image.naturalHeight || 1;
            const targetW = Math.min(220, this.maxX * 0.25);
            const drawW = targetW * this.baseScale * (this.scaleMult || 1);
            const drawH = drawW / aspect;
            this.drawW = drawW;
            this.drawH = drawH;

            // If we have spring offsets, draw sliced tentacles
            if (this.springOffsets && this.springOffsets.length > 0 &&
                this.imageLoaded && this.image) {
                this._drawSliced(ctx, drawW, drawH);
            } else {
                ctx.drawImage(this.image, -drawW / 2, -drawH / 2, drawW, drawH);
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;  // reset for overlays

            // ─── Micro-expressions: blink indicators ───
            if (this.isBlinking) {
                ctx.fillStyle = 'rgba(0,0,0,0.25)';
                ctx.beginPath();
                ctx.ellipse(-drawW * 0.12, -drawH * 0.18, drawW * 0.06, drawW * 0.015, 0, 0, Math.PI * 2);
                ctx.ellipse(drawW * 0.12, -drawH * 0.18, drawW * 0.06, drawW * 0.015, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // ─── Twitch indicator ───
            if (this.isTwitching) {
                ctx.strokeStyle = 'rgba(170,221,255,0.3)';
                ctx.lineWidth = 1;
                const t = performance.now() / 100;
                ctx.beginPath();
                ctx.moveTo(drawW * 0.3, drawH * 0.2 + Math.sin(t) * 3);
                ctx.lineTo(drawW * 0.45, drawH * 0.35 + Math.cos(t) * 3);
                ctx.stroke();
            }

            // ─── Shadow beneath jellyfish ───
            if (this.shadowEnabled) {
                ctx.save();
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.ellipse(0, drawH * 0.45, drawW * 0.4, drawW * 0.08, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            ctx.restore();

            // ─── Secondary particles (drawn in world space) ───
            if (this.particles && this.particles.length > 0) {
                for (const p of this.particles) {
                    const alpha = Math.max(0, p.life / p.maxLife) * 0.3 * (this.opacity || 1.0);
                    ctx.globalAlpha = alpha;
                    ctx.fillStyle = '#aaddff';
                    ctx.beginPath();
                    ctx.arc(drawX + p.x, drawY + p.y + drawH * 0.3, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        }

        _getGlowColor() {
            if (this.colorOverride) {
                const { h, s, l } = this.colorOverride;
                return `hsl(${h}, ${s}%, ${Math.min(l + 15, 90)}%)`;
            }
            return 'rgba(100,200,255,0.6)';
        }

        _drawSliced(ctx, drawW, drawH) {
            // Split image at 35% (bell / tentacles)
            const splitY = Math.floor(this.image.naturalHeight * 0.35);
            const bellH = splitY;
            const tentacleH = this.image.naturalHeight - splitY;

            // Draw bell normally
            ctx.drawImage(
                this.image,
                0, 0, this.image.naturalWidth, bellH,
                -drawW / 2, -drawH / 2, drawW, drawH * (bellH / this.image.naturalHeight)
            );

            // Draw tentacles as individually warped vertical slices
            const sliceCount = this.springOffsets.length;
            const sliceW = drawW / sliceCount;
            const sourceSliceW = this.image.naturalWidth / sliceCount;

            for (let i = 0; i < sliceCount; i++) {
                const s = this.springOffsets[i];
                if (!s) continue;
                const srcX = i * sourceSliceW;
                // Use spring offset DELTA from center (not absolute position)
                const dx = s.x - this.x;
                const dy = s.y - this.y;
                const destX = (i - sliceCount / 2) * sliceW + dx;
                const destY = drawH * (bellH / this.image.naturalHeight) / 2 + dy;

                // Wave amplitude increases toward bottom
                const wave = Math.sin(performance.now() / 800 + i) * (i * 1.5 + 2);

                ctx.drawImage(
                    this.image,
                    srcX, splitY, sourceSliceW, tentacleH,
                    destX - sliceW / 2 + wave * 0.3, destY,
                    sliceW + wave * 0.1,
                    drawH * (tentacleH / this.image.naturalHeight) + wave * 0.2
                );
            }
        }
    }

    global.Jellyfish = Jellyfish;
    global.JELLYFISH_VARIANTS = VARIANTS;
})(window);