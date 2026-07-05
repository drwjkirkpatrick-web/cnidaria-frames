/**
 * audio-engine.js — Procedural Ambient Underwater Sound
 *
 * Uses Web Audio API to generate a layered ambient drone:
 *  - Low-frequency rumble (sub-bass)
 *  - Mid water resonance (filtered noise)
 *  - Occasional bubble pops (short sine bursts)
 *
 * All synthesis is procedural — no external audio files.
 */

(function(global) {
    'use strict';

    class AudioEngine {
        constructor() {
            this.ctx = null;
            this.masterGain = null;
            this.isPlaying = false;
            this.nodes = []; // track active nodes for cleanup
        }

        /**
         * Initialize the audio context on first user gesture.
         */
        init() {
            if (this.ctx) return;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) {
                console.warn('Web Audio API not supported');
                return;
            }
            this.ctx = new AudioCtx();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.15; // gentle default
            this.masterGain.connect(this.ctx.destination);
        }

        /**
         * Start ambient layers. Must be called after user interaction.
         */
        start() {
            if (!this.ctx) this.init();
            if (!this.ctx || this.isPlaying) return;
            this.isPlaying = true;

            this._startDrone();
            this._startResonance();
            this._startBubbleSchedule();
        }

        /**
         * Stop all sounds and clean up nodes.
         */
        stop() {
            this.isPlaying = false;
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            for (const node of this.nodes) {
                try {
                    if (node.stop) node.stop(now);
                    if (node.disconnect) node.disconnect();
                } catch (e) { /* ignore */ }
            }
            this.nodes = [];
        }

        /**
         * Set master volume (0–1).
         */
        setVolume(v) {
            if (!this.masterGain) return;
            this.masterGain.gain.value = Math.max(0, Math.min(1, v));
        }

        /**
         * Internal: low-frequency drone via two detuned oscillators.
         */
        _startDrone() {
            const baseFreq = 55; // A1-ish
            for (let i = 0; i < 2; i++) {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = baseFreq + i * 0.5 + (Math.random() * 0.3);
                gain.gain.value = 0.08;
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start();
                this.nodes.push(osc, gain);

                // Subtle LFO on amplitude for breathing effect
                const lfo = this.ctx.createOscillator();
                const lfoGain = this.ctx.createGain();
                lfo.frequency.value = 0.05 + Math.random() * 0.03;
                lfoGain.gain.value = 0.02;
                lfo.connect(lfoGain);
                lfoGain.connect(gain.gain);
                lfo.start();
                this.nodes.push(lfo, lfoGain);
            }
        }

        /**
         * Internal: filtered noise for water resonance texture.
         */
        _startResonance() {
            const bufferSize = 2 * this.ctx.sampleRate;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.5;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 400;
            filter.Q.value = 0.5;

            const gain = this.ctx.createGain();
            gain.gain.value = 0.03;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            noise.start();
            this.nodes.push(noise, filter, gain);
        }

        /**
         * Internal: schedule random bubble pops.
         */
        _startBubbleSchedule() {
            const schedule = () => {
                if (!this.isPlaying) return;
                const delay = Math.random() * 3000 + 1000; // 1–4s
                setTimeout(() => {
                    if (this.isPlaying) {
                        this._playBubblePop();
                        schedule();
                    }
                }, delay);
            };
            schedule();
        }

        /**
         * Internal: a single bubble pop (short FM-like sine burst).
         */
        _playBubblePop() {
            if (!this.ctx) return;
            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600 + Math.random() * 400, t);
            osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);

            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.06, t + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(t);
            osc.stop(t + 0.25);
        }
    }

    global.AudioEngine = AudioEngine;
})(window);