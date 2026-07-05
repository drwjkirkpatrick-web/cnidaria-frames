/**
 * audio-reactive.js — Microphone Audio Reactivity for Cnidaria Frames
 *
 * Uses Web Audio API getUserMedia + AnalyserNode to drive
 * jellyfish pulse amplitude and particle density from
 * ambient microphone input.
 */

(function(global) {
    'use strict';

    class AudioReactive {
        constructor() {
            this.ctx = null;
            this.analyser = null;
            this.source = null;
            this.dataArray = null;
            this.active = false;
            this.level = 0; // 0–1 smoothed
        }

        async start() {
            if (this.active) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new AudioCtx();
                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 256;
                this.source = this.ctx.createMediaStreamSource(stream);
                this.source.connect(this.analyser);
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.active = true;
            } catch (e) {
                console.warn('Mic access denied:', e);
            }
        }

        stop() {
            this.active = false;
            if (this.source) { try { this.source.disconnect(); } catch (e) {} }
            if (this.ctx) { try { this.ctx.close(); } catch (e) {} }
            this.ctx = null;
            this.analyser = null;
            this.source = null;
        }

        toggle() {
            this.active ? this.stop() : this.start();
        }

        getLevel() {
            if (!this.active || !this.analyser) return 0;
            this.analyser.getByteFrequencyData(this.dataArray);
            let sum = 0;
            for (const v of this.dataArray) sum += v;
            const avg = sum / this.dataArray.length / 255;
            this.level += (avg - this.level) * 0.1; // smoothing
            return this.level;
        }

        getBassLevel() {
            if (!this.active || !this.analyser || !this.dataArray) return 0;
            this.analyser.getByteFrequencyData(this.dataArray);
            // Lower third of bins = bass
            const bassBins = Math.floor(this.dataArray.length / 3);
            let sum = 0;
            for (let i = 0; i < bassBins; i++) sum += this.dataArray[i];
            return (sum / bassBins) / 255;
        }
    }

    global.AudioReactive = AudioReactive;
})(window);