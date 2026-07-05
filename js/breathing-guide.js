/**
 * breathing-guide.js — Meditation Breathing Guide for Cnidaria Frames
 *
 * Overlays a breathing circle synced to the primary jellyfish pulse.
 * Follows 4-7-8 or box-breathing rhythm, with visual inhale/exhale cues.
 */

(function(global) {
    'use strict';

    class BreathingGuide {
        constructor() {
            this.active = false;
            this.phase = 'inhale'; // inhale, hold, exhale, hold-empty
            this.phaseTime = 0;
            this.cycleDuration = { inhale: 4, hold: 0, exhale: 4, 'hold-empty': 0 };
            this.dom = null;
            this._buildDOM();
        }

        _buildDOM() {
            const el = document.createElement('div');
            el.id = 'breathingGuide';
            el.className = 'breathing-guide';
            el.innerHTML = `
                <div class="breathing-ring"></div>
                <div class="breathing-text">inhale</div>
            `;
            document.body.appendChild(el);
            this.dom = {
                root: el,
                ring: el.querySelector('.breathing-ring'),
                text: el.querySelector('.breathing-text')
            };
        }

        toggle() {
            this.active = !this.active;
            if (this.dom) {
                this.dom.root.classList.toggle('active', this.active);
            }
            if (this.active) {
                this.phase = 'inhale';
                this.phaseTime = 0;
            }
        }

        update(dt, pulsePhase) {
            if (!this.active || !this.dom) return;

            this.phaseTime += dt;
            const dur = this.cycleDuration[this.phase] || 4;

            // Progress 0–1 through current phase
            const progress = Math.min(this.phaseTime / dur, 1);

            // Map to ring scale
            let scale;
            if (this.phase === 'inhale') scale = 0.6 + progress * 0.5;
            else if (this.phase === 'hold') scale = 1.1;
            else if (this.phase === 'exhale') scale = 1.1 - progress * 0.5;
            else scale = 0.6;

            this.dom.ring.style.transform = `scale(${scale})`;
            this.dom.text.textContent = this.phase;

            if (progress >= 1) {
                this._nextPhase();
            }
        }

        _nextPhase() {
            const order = ['inhale', 'exhale'];
            const idx = order.indexOf(this.phase);
            this.phase = order[(idx + 1) % order.length];
            this.phaseTime = 0;
        }

        destroy() {
            if (this.dom && this.dom.root) {
                this.dom.root.remove();
            }
        }
    }

    global.BreathingGuide = BreathingGuide;
})(window);