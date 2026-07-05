/**
 * storm.js — Weather/Storm Mode for Cnidaria Frames
 *
 * Lightning flashes, screen shake, increased turbulence, and
 * procedural thunder rumble via Web Audio API.
 */

(function(global) {
    'use strict';

    class Storm {
        constructor() {
            this.active = false;
            this.intensity = 0; // ramps up/down
            this.targetIntensity = 0;
            this.lightningTimer = 0;
            this.shakeX = 0;
            this.shakeY = 0;
            this.flashAlpha = 0;
        }

        toggle() {
            this.active = !this.active;
            this.targetIntensity = this.active ? 1 : 0;
        }

        start() {
            this.active = true;
            this.targetIntensity = 1;
        }

        stop() {
            this.active = false;
            this.targetIntensity = 0;
        }

        update(dt) {
            this.intensity += (this.targetIntensity - this.intensity) * dt * 1.5;
            if (this.intensity < 0.01 && !this.active) {
                this.intensity = 0;
                return;
            }

            // Lightning
            this.lightningTimer -= dt;
            if (this.lightningTimer <= 0 && this.active) {
                this.lightningTimer = 3 + Math.random() * 5; // 3–8s between flashes
                this.flashAlpha = 0.3 + Math.random() * 0.2;
                this._playThunder();
            }
            this.flashAlpha -= dt * 2;
            if (this.flashAlpha < 0) this.flashAlpha = 0;

            // Screen shake
            const shakeAmt = this.intensity * 3;
            this.shakeX = (Math.random() - 0.5) * shakeAmt;
            this.shakeY = (Math.random() - 0.5) * shakeAmt;
        }

        draw(ctx) {
            if (this.intensity <= 0) return;

            // Lightning flash overlay
            if (this.flashAlpha > 0) {
                ctx.save();
                ctx.globalAlpha = this.flashAlpha;
                ctx.fillStyle = '#e0f0ff';
                ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                ctx.restore();
            }

            // Turbulence overlay (dark vignette pulse)
            ctx.save();
            ctx.globalAlpha = this.intensity * 0.15;
            const grad = ctx.createRadialGradient(
                window.innerWidth / 2, window.innerHeight / 2, 0,
                window.innerWidth / 2, window.innerHeight / 2, Math.max(window.innerWidth, window.innerHeight)
            );
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(1, 'rgba(10,20,40,1)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            ctx.restore();
        }

        getShake() {
            return { x: this.shakeX, y: this.shakeY };
        }

        _playThunder() {
            // Simple procedural thunder via AudioContext if available
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
            }
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 80;
            const gain = ctx.createGain();
            gain.gain.value = 0.08;
            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        }
    }

    global.Storm = Storm;
})(window);