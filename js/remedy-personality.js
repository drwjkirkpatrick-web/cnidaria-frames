/**
 * remedy-personality.js — Homeopathic Remedy Personality System v6.0
 *
 * Maps 12 classical homeopathic remedies to jellyfish animation profiles,
 * limbic state targets, and guided visualization session pacing.
 * Each remedy has a unique "gestalt" — a constellation of movement,
 * color, timing, and emotional signature.
 *
 * Remedies selected from the polychrests most relevant to
 * visualization, anxiety, restlessness, and emotional states.
 */

(function(global) {
    'use strict';

    // ─── 12 Homeopathic Remedy Profiles ───
    const REMEDY_PROFILES = {
        'pulsatilla': {
            name: 'Pulsatilla',
            label: 'Gentle · Changeable · Seeking Comfort',
            desc: 'Soft, yielding movement. Changes direction often. Seeks warmth and reassurance.',
            // Animation
            squashAmp: 0.10,
            floatAmp: 5,
            tiltRange: 6,
            springTension: 0.07,
            springDamping: 0.88,
            blinkRate: 0.0015,
            pulseRatio: 0.8,
            glowIntensity: 0.9,
            timing: 'slow',
            // Visual
            hue: 280,   // soft violet
            saturation: 45,
            lightness: 65,
            opacity: 0.95,
            shadow: false,
            // Limbic targets
            limbic: { arousal: 0.3, valence: 0.7, dominance: 0.3, erratic: 0.15 },
            // Session
            sessionMinutes: 12,
            breathPattern: '4-7-8',  // inhale-hold-exhale
        },
        'bryonia': {
            name: 'Bryonia',
            label: 'Still · Anchored · Preserving Energy',
            desc: 'Minimal movement. Prefers to stay in one place. Heavy, deliberate pulses.',
            squashAmp: 0.05,
            floatAmp: 2,
            tiltRange: 2,
            springTension: 0.04,
            springDamping: 0.95,
            blinkRate: 0.0003,
            pulseRatio: 0.4,
            glowIntensity: 0.5,
            timing: 'slow',
            hue: 200,   // deep blue-grey
            saturation: 25,
            lightness: 40,
            opacity: 1.0,
            shadow: true,
            limbic: { arousal: 0.2, valence: 0.5, dominance: 0.6, erratic: 0.05 },
            sessionMinutes: 8,
            breathPattern: '6-0-6',
        },
        'arsenicum': {
            name: 'Arsenicum Album',
            label: 'Restless · Precise · Seeking Order',
            desc: 'Rapid, precise movements. Constant micro-adjustments. High energy glow.',
            squashAmp: 0.20,
            floatAmp: 9,
            tiltRange: 14,
            springTension: 0.16,
            springDamping: 0.78,
            blinkRate: 0.004,
            pulseRatio: 1.6,
            glowIntensity: 1.3,
            timing: 'energetic',
            hue: 30,    // anxious amber
            saturation: 70,
            lightness: 55,
            opacity: 0.92,
            shadow: false,
            limbic: { arousal: 0.8, valence: 0.3, dominance: 0.5, erratic: 0.25 },
            sessionMinutes: 5,
            breathPattern: '3-3-3',
        },
        'natrum-muriaticum': {
            name: 'Natrum Muriaticum',
            label: 'Contained · Deep · Private',
            desc: 'Smooth, contained movement. Deep, slow pulses. Guards personal space.',
            squashAmp: 0.06,
            floatAmp: 3,
            tiltRange: 3,
            springTension: 0.05,
            springDamping: 0.92,
            blinkRate: 0.0005,
            pulseRatio: 0.5,
            glowIntensity: 0.6,
            timing: 'slow',
            hue: 220,   // ocean blue
            saturation: 35,
            lightness: 45,
            opacity: 0.88,
            shadow: true,
            limbic: { arousal: 0.3, valence: 0.4, dominance: 0.4, erratic: 0.05 },
            sessionMinutes: 15,
            breathPattern: '5-2-7',
        },
        'sulphur': {
            name: 'Sulphur',
            label: 'Warm · Philosophical · Independent',
            desc: 'Warm, expansive glow. Philosophical drifting. Independent, unconstrained.',
            squashAmp: 0.18,
            floatAmp: 8,
            tiltRange: 11,
            springTension: 0.09,
            springDamping: 0.82,
            blinkRate: 0.002,
            pulseRatio: 1.2,
            glowIntensity: 1.4,
            timing: 'normal',
            hue: 45,    // warm gold
            saturation: 80,
            lightness: 60,
            opacity: 0.95,
            shadow: false,
            limbic: { arousal: 0.6, valence: 0.7, dominance: 0.7, erratic: 0.2 },
            sessionMinutes: 10,
            breathPattern: '4-4-4',
        },
        'sepia': {
            name: 'Sepia',
            label: 'Detached · Fluid · Watching',
            desc: 'Detached, floating presence. Observes without engaging. Muted colors.',
            squashAmp: 0.08,
            floatAmp: 4,
            tiltRange: 5,
            springTension: 0.06,
            springDamping: 0.90,
            blinkRate: 0.0008,
            pulseRatio: 0.6,
            glowIntensity: 0.5,
            timing: 'slow',
            hue: 30,    // sepia brown
            saturation: 20,
            lightness: 35,
            opacity: 0.75,
            shadow: true,
            limbic: { arousal: 0.3, valence: 0.4, dominance: 0.5, erratic: 0.08 },
            sessionMinutes: 12,
            breathPattern: '5-3-5',
        },
        'nux-vomica': {
            name: 'Nux Vomica',
            label: 'Driven · Tense · Impatient',
            desc: 'Tense, driven movement. Sharp direction changes. Impatient energy.',
            squashAmp: 0.14,
            floatAmp: 7,
            tiltRange: 13,
            springTension: 0.13,
            springDamping: 0.80,
            blinkRate: 0.0035,
            pulseRatio: 1.5,
            glowIntensity: 1.1,
            timing: 'energetic',
            hue: 15,    // angry red-orange
            saturation: 75,
            lightness: 50,
            opacity: 0.95,
            shadow: false,
            limbic: { arousal: 0.75, valence: 0.3, dominance: 0.7, erratic: 0.22 },
            sessionMinutes: 4,
            breathPattern: '3-1-4',
        },
        'lachesis': {
            name: 'Lachesis',
            label: 'Intense · Overflowing · Transformative',
            desc: 'Intense, expansive movement. Overflows boundaries. Transformative energy.',
            squashAmp: 0.22,
            floatAmp: 11,
            tiltRange: 15,
            springTension: 0.11,
            springDamping: 0.75,
            blinkRate: 0.003,
            pulseRatio: 1.7,
            glowIntensity: 1.5,
            timing: 'energetic',
            hue: 340,   // intense magenta
            saturation: 75,
            lightness: 55,
            opacity: 0.90,
            shadow: false,
            limbic: { arousal: 0.7, valence: 0.5, dominance: 0.6, erratic: 0.3 },
            sessionMinutes: 7,
            breathPattern: '3-2-5',
        },
        'phosphorus': {
            name: 'Phosphorus',
            label: 'Luminous · Curious · Connecting',
            desc: 'Bright, luminous glow. Curious, reaches out. Connects with surroundings.',
            squashAmp: 0.16,
            floatAmp: 9,
            tiltRange: 10,
            springTension: 0.10,
            springDamping: 0.84,
            blinkRate: 0.0025,
            pulseRatio: 1.3,
            glowIntensity: 1.5,
            timing: 'normal',
            hue: 60,    // bright yellow-white
            saturation: 70,
            lightness: 75,
            opacity: 0.92,
            shadow: false,
            limbic: { arousal: 0.6, valence: 0.8, dominance: 0.5, erratic: 0.18 },
            sessionMinutes: 10,
            breathPattern: '4-3-5',
        },
        'silica': {
            name: 'Silica',
            label: 'Delicate · Structured · Persevering',
            desc: 'Delicate, crystalline appearance. Structured, persevering movement. Fragile glow.',
            squashAmp: 0.04,
            floatAmp: 3,
            tiltRange: 3,
            springTension: 0.05,
            springDamping: 0.94,
            blinkRate: 0.0004,
            pulseRatio: 0.5,
            glowIntensity: 0.7,
            timing: 'slow',
            hue: 180,   // pale aqua
            saturation: 30,
            lightness: 80,
            opacity: 0.80,
            shadow: true,
            limbic: { arousal: 0.25, valence: 0.5, dominance: 0.3, erratic: 0.05 },
            sessionMinutes: 14,
            breathPattern: '5-2-6',
        },
        'calcarea-carbonica': {
            name: 'Calcarea Carbonica',
            label: 'Grounded · Protective · Nurturing',
            desc: 'Grounded, protective presence. Nurturing energy. Stable, rhythmic movement.',
            squashAmp: 0.07,
            floatAmp: 4,
            tiltRange: 4,
            springTension: 0.06,
            springDamping: 0.91,
            blinkRate: 0.0006,
            pulseRatio: 0.7,
            glowIntensity: 0.8,
            timing: 'slow',
            hue: 120,   // earthy green
            saturation: 35,
            lightness: 50,
            opacity: 0.95,
            shadow: true,
            limbic: { arousal: 0.2, valence: 0.6, dominance: 0.5, erratic: 0.04 },
            sessionMinutes: 12,
            breathPattern: '5-0-5',
        },
        'causticum': {
            name: 'Causticum',
            label: 'Sensitive · Empathic · Resonant',
            desc: 'Sensitive, empathic presence. Resonates with emotional surroundings. Deep blue.',
            squashAmp: 0.09,
            floatAmp: 5,
            tiltRange: 6,
            springTension: 0.07,
            springDamping: 0.87,
            blinkRate: 0.001,
            pulseRatio: 0.9,
            glowIntensity: 0.85,
            timing: 'slow',
            hue: 240,   // deep resonant blue
            saturation: 50,
            lightness: 55,
            opacity: 0.88,
            shadow: true,
            limbic: { arousal: 0.4, valence: 0.5, dominance: 0.3, erratic: 0.12 },
            sessionMinutes: 11,
            breathPattern: '4-3-6',
        },
    };

    class RemedyPersonality {
        constructor(remedyKey = 'pulsatilla') {
            this.key = REMEDY_PROFILES[remedyKey] ? remedyKey : 'pulsatilla';
            this.profile = REMEDY_PROFILES[this.key];
            this._observers = [];
        }

        setRemedy(key) {
            if (REMEDY_PROFILES[key]) {
                this.key = key;
                this.profile = REMEDY_PROFILES[key];
                this._notify();
            }
        }

        getProfile() { return this.profile; }
        getKey() { return this.key; }

        static getAllRemedies() {
            return Object.entries(REMEDY_PROFILES).map(([key, p]) => ({
                key, name: p.name, label: p.label, desc: p.desc
            }));
        }

        static getProfile(key) {
            return REMEDY_PROFILES[key] || null;
        }

        // Apply remedy profile to an animator instance
        applyToAnimator(animator) {
            const p = this.profile;
            if (!animator) return;
            animator.setTiming(p.timing);
            // Directly set animation params (requires animator to expose these)
            if (animator.squash) animator.squash.amplitude = p.squashAmp;
            // Update springs
            if (animator.springs) {
                animator.springs.forEach(s => {
                    s.tension = p.springTension;
                    s.damping = p.springDamping;
                });
            }
        }

        // Apply remedy profile to a jellyfish instance
        applyToJellyfish(jellyfish) {
            const p = this.profile;
            if (!jellyfish) return;
            jellyfish.setColorOverride(p.hue, p.saturation, p.lightness);
            if (typeof jellyfish.setOpacity === 'function') jellyfish.setOpacity(p.opacity);
            if (typeof jellyfish.setShadow === 'function') jellyfish.setShadow(p.shadow);
            if (typeof jellyfish.setScaleMult === 'function') {
                const scaleMap = { slow: 0.9, normal: 1.0, energetic: 1.1 };
                jellyfish.setScaleMult(scaleMap[p.timing] || 1.0);
            }
        }

        // Get session configuration for guided visualization
        getSessionConfig() {
            return {
                minutes: this.profile.sessionMinutes,
                breathPattern: this.profile.breathPattern,
                hue: this.profile.hue,
                name: this.profile.name,
            };
        }

        // Get limbic target for this remedy
        getLimbicTarget() {
            return { ...this.profile.limbic };
        }

        onChange(fn) { this._observers.push(fn); }
        _notify() { this._observers.forEach(fn => fn(this.key, this.profile)); }
    }

    global.RemedyPersonality = RemedyPersonality;
    global.REMEDY_PROFILES = REMEDY_PROFILES;
})(window);
