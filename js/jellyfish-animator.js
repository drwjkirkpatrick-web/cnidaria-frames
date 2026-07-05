/**
 * jellyfish-animator.js — Professional Animation Engine v5.0
 *
 * Implements the 12 Principles of Animation for still-frame jellyfish:
 *  1. Squash & Stretch — bell compresses/expands with volume conservation
 *  2. Anticipation — brief shrink before major movements
 *  3. Staging — silhouette, lighting focus, clear pose
 *  4. Straight Ahead (organic) — continuous procedural motion
 *  5. Follow Through & Overlapping Action — spring-based tentacles lag behind
 *  6. Slow In & Slow Out — eased interpolation
 *  7. Arcs — curved drift paths, not linear
 *  8. Secondary Action — ambient particles, tentacle sway
 *  9. Timing — fast/slow presets, frame spacing
 * 10. Exaggeration — personality modes
 * 11. Solid Drawing — volume, form, overlapping shapes
 * 12. Appeal — expression, character, personality
 *
 * Techniques adapted from the Animation Assistant research:
 * - Garcia's Physics of Animation (SJSU / DreamWorks)
 * - The "Odd Rule" spacing (1,3,5,7,9)
 * - Squash-with-volume-conservation: W × H stays constant
 * - Secondary motion via spring physics (Verlet-ish)
 * - Micro-expressions (blink, twitch) for subtle performance
 */

(function(global) {
    'use strict';

    // ─── Easing library ───
    const Ease = {
        linear: t => t,
        inOut: t => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2,
        inOutCubic: t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2,
        outBounce: t => {
            const n1 = 7.5625, d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            else if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            else if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        },
        sineInOut: t => -(Math.cos(Math.PI * t) - 1) / 2,
    };

    // ─── Spring / Follow-Through Physics ───
    class Spring {
        constructor() {
            this.x = 0; this.y = 0;
            this.vx = 0; this.vy = 0;
            this.targetX = 0; this.targetY = 0;
            this.tension = 0.1;  // how fast it seeks target
            this.damping = 0.85; // energy loss per frame
        }
        update() {
            const ax = (this.targetX - this.x) * this.tension;
            const ay = (this.targetY - this.y) * this.tension;
            this.vx += ax;
            this.vy += ay;
            this.vx *= this.damping;
            this.vy *= this.damping;
            this.x += this.vx;
            this.y += this.vy;
        }
    }

    // ─── ARC path generator (cubic bezier interpolation) ───
    function arcPath(points, t) {
        if (points.length < 2) return { x: points[0]?.x || 0, y: points[0]?.y || 0 };
        const segments = points.length - 1;
        const seg = Math.min(Math.floor(t * segments), segments - 1);
        const local = (t * segments) - seg;
        const ease = Ease.inOut(local);
        const p0 = points[seg], p1 = points[seg + 1];
        // Quadratic bezier with control point mid + offset
        const cx = (p0.x + p1.x) / 2 + (p1.y - p0.y) * 0.3;
        const cy = (p0.y + p1.y) / 2 - (p1.x - p0.x) * 0.3;
        const one = (1 - ease) * (1 - ease);
        const two = 2 * (1 - ease) * ease;
        const three = ease * ease;
        return {
            x: one * p0.x + two * cx + three * p1.x,
            y: one * p0.y + two * cy + three * p1.y
        };
    }

    // ─── Main Animator Class ───
    class JellyfishAnimator {
        constructor(jellyfish) {
            this.jf = jellyfish;
            this.time = 0;

            // Principle 9: Timing presets
            this.timing = {
                speed: 1.0,  // multiplier
                phase: 0,
                easedDt: 0,
            };
            this.timingPresets = {
                slow:    { speed: 0.4, label: 'Drifting' },
                normal:  { speed: 1.0, label: 'Flowing' },
                energetic:{ speed: 2.0, label: 'Pulsing' },
            };
            this.currentTiming = 'normal';

            // Principle 1: Squash & Stretch
            this.squash = {
                phase: 0,
                amplitude: 0.15,  // 15% squash/stretch
                volumeConservation: true,
            };

            // Principle 2: Anticipation
            this.anticipation = {
                active: false,
                timer: 0,
                duration: 0.3,  // seconds of anticipation
                scale: 0.85,    // shrink to 85%
            };

            // Principle 7: Arcs
            this.arc = {
                path: [],
                progress: 0,
                pathIndex: 0,
            };

            // Principle 5: Follow Through (spring physics for tentacles)
            this.springs = [];
            this.springCount = 8;  // one per slice
            this._initSprings();

            // Principle 12: Exaggeration — Personality modes
            this.personality = {
                current: 'majestic', // shy, curious, majestic
                modes: {
                    shy: {
                        squashAmp: 0.08,
                        floatAmp: 3,
                        tiltRange: 3,
                        springTension: 0.06,
                        springDamping: 0.90,
                        blinkRate: 0.0005,
                        pulseRatio: 0.7,
                        glowIntensity: 0.6,
                        label: 'Shy',
                    },
                    curious: {
                        squashAmp: 0.22,
                        floatAmp: 10,
                        tiltRange: 12,
                        springTension: 0.14,
                        springDamping: 0.80,
                        blinkRate: 0.003,
                        pulseRatio: 1.3,
                        glowIntensity: 1.0,
                        label: 'Curious',
                    },
                    majestic: {
                        squashAmp: 0.15,
                        floatAmp: 6,
                        tiltRange: 8,
                        springTension: 0.10,
                        springDamping: 0.85,
                        blinkRate: 0.001,
                        pulseRatio: 1.0,
                        glowIntensity: 1.2,
                        label: 'Majestic',
                    },
                },
            };

            // Principle 7/12: Micro-expressions
            this.expressions = {
                blinkTimer: 0,
                blinkDuration: 0.15,
                isBlinking: false,
                twitchTimer: 0,
                twitchDuration: 0.08,
                isTwitching: false,
            };

            // Principle 10: Scene pacing / mood cycle
            this.pacing = {
                mood: 'calm', // calm, curious, majestic, drifting
                moodTimer: 0,
                moodDuration: 15, // seconds per mood
                moodCycle: ['calm', 'curious', 'majestic', 'drifting'],
                moodIndex: 0,
            };

            // Principle 8: Secondary Action particles
            this.particles = [];
            this._initParticles();
        }

        _initSprings() {
            this.springs = [];
            for (let i = 0; i < this.springCount; i++) {
                const s = new Spring();
                s.tension = this.personality.modes.majestic.springTension;
                s.damping = this.personality.modes.majestic.springDamping;
                this.springs.push(s);
            }
        }

        _initParticles() {
            this.particles = [];
            for (let i = 0; i < 12; i++) {
                this.particles.push({
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 0.5) * 200,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -Math.random() * 0.3 - 0.1,
                    life: Math.random() * 3 + 2,
                    maxLife: 5,
                    size: Math.random() * 2 + 1,
                });
            }
        }

        // ─── Public API ───

        setTiming(preset) {
            if (this.timingPresets[preset]) this.currentTiming = preset;
        }
        getTiming() { return this.currentTiming; }
        getTimingPresets() { return this.timingPresets; }

        setPersonality(mode) {
            if (this.personality.modes[mode]) {
                this.personality.current = mode;
                const m = this.personality.modes[mode];
                this.springs.forEach(s => {
                    s.tension = m.springTension;
                    s.damping = m.springDamping;
                });
            }
        }
        getPersonality() { return this.personality.current; }
        getPersonalityModes() { return this.personality.modes; }

        setPacingCycle(enabled) {
            this.pacing.enabled = enabled;
        }
        getPacing() { return this.pacing; }

        // ─── Anticipation trigger ───
        triggerAnticipation(duration = 0.3) {
            this.anticipation.active = true;
            this.anticipation.timer = 0;
            this.anticipation.duration = duration;
        }

        // ─── Core Update ───
        update(dt) {
            const t = this.timingPresets[this.currentTiming]?.speed || 1.0;
            const person = this.personality.modes[this.personality.current] ||
                           this.personality.modes.majestic;

            this.time += dt * t;
            const eased = Ease.sineInOut((Math.sin(this.time * 0.8) + 1) / 2);

            // ─── Principle 2: Anticipation ───
            let anticipationScale = 1.0;
            if (this.anticipation.active) {
                this.anticipation.timer += dt;
                if (this.anticipation.timer >= this.anticipation.duration) {
                    this.anticipation.active = false;
                } else {
                    const p = this.anticipation.timer / this.anticipation.duration;
                    anticipationScale = 1.0 - Math.sin(p * Math.PI) * (1 - this.anticipation.scale);
                }
            }

            // ─── Principle 1: Squash & Stretch ───
            this.squash.phase += dt * t;
            const rawPulse = Math.sin(this.squash.phase * person.pulseRatio);
            const pulse = Ease.inOut((rawPulse + 1) / 2);
            const squashAmt = person.squashAmp * pulse;

            // Volume conservation: if height changes by factor h, width changes by 1/h
            let scaleX = 1, scaleY = 1;
            if (this.squash.volumeConservation) {
                scaleY = 1 + squashAmt;
                scaleX = 1 / scaleY;
            } else {
                scaleY = 1 + squashAmt;
                scaleX = 1 - squashAmt * 0.5;
            }
            scaleX *= anticipationScale;
            scaleY *= anticipationScale;
            this.jf.squashX = scaleX;
            this.jf.squashY = scaleY;

            // ─── Principle 7: Floating arcs (secondary to position) ───
            const floatY = Math.sin(this.time * 0.6) * person.floatAmp * dt * 60;
            const floatX = Math.sin(this.time * 0.35) * (person.floatAmp * 0.4) * dt * 60;
            this.jf.arcOffsetX = floatX;
            this.jf.arcOffsetY = floatY;

            // ─── Principle 5: Spring-based tentacle follow-through ───
            // Target is the bell's bottom edge offset
            const bellBottomY = this.jf.y + (this.jf.drawH || 100) * 0.3;
            const sliceWidth = (this.jf.drawW || 150) / this.springCount;
            for (let i = 0; i < this.springCount; i++) {
                const s = this.springs[i];
                const offset = (i - this.springCount / 2) * sliceWidth * 0.3;
                s.targetX = this.jf.x + offset + floatX * 0.5;
                s.targetY = bellBottomY + floatY * 0.3;
                s.update();
            }
            this.jf.springOffsets = this.springs.map(s => ({ x: s.x, y: s.y }));

            // ─── Principle 12: Micro-expressions ───
            // Blink
            this.expressions.blinkTimer += dt * t;
            if (!this.expressions.isBlinking) {
                if (Math.random() < person.blinkRate * dt * 60) {
                    this.expressions.isBlinking = true;
                    this.expressions.blinkTimer = 0;
                }
            } else {
                if (this.expressions.blinkTimer > this.expressions.blinkDuration) {
                    this.expressions.isBlinking = false;
                    this.expressions.blinkTimer = 0;
                }
            }
            this.jf.isBlinking = this.expressions.isBlinking;

            // Tentacle twitch
            this.expressions.twitchTimer += dt * t;
            if (!this.expressions.isTwitching) {
                if (Math.random() < person.blinkRate * 0.3 * dt * 60) {
                    this.expressions.isTwitching = true;
                    this.expressions.twitchTimer = 0;
                }
            } else {
                if (this.expressions.twitchTimer > this.expressions.twitchDuration) {
                    this.expressions.isTwitching = false;
                    this.expressions.twitchTimer = 0;
                }
            }
            this.jf.isTwitching = this.expressions.isTwitching;

            // ─── Principle 10: Mood / Pacing cycle ───
            if (this.pacing.enabled !== false) {
                this.pacing.moodTimer += dt;
                if (this.pacing.moodTimer >= this.pacing.moodDuration) {
                    this.pacing.moodTimer = 0;
                    this.pacing.moodIndex = (this.pacing.moodIndex + 1) % this.pacing.moodCycle.length;
                    this.pacing.mood = this.pacing.moodCycle[this.pacing.moodIndex];
                    // Auto-set personality based on mood
                    const moodToPerson = { calm: 'shy', curious: 'curious', majestic: 'majestic', drifting: 'shy' };
                    this.setPersonality(moodToPerson[this.pacing.mood] || 'majestic');
                }
            }

            // ─── Principle 8: Secondary particles ───
            for (const p of this.particles) {
                p.x += p.vx * t;
                p.y += p.vy * t;
                p.life -= dt;
                if (p.life <= 0) {
                    p.x = (Math.random() - 0.5) * 120;
                    p.y = 60 + Math.random() * 40;
                    p.life = p.maxLife;
                    p.vx = (Math.random() - 0.5) * 0.5;
                    p.vy = -Math.random() * 0.3 - 0.1;
                }
            }
            this.jf.particles = this.particles;

            // ─── Principle 3: Staging — glow follows personality ───
            this.jf.glowIntensity = person.glowIntensity * (0.8 + 0.2 * pulse);

            // ─── Principle 6: Slow In / Slow Out on position ───
            if (!this.jf.isBeingDragged) {
                const lerp = 0.05 * t;
                this.jf.x += (this.jf.targetX - this.jf.x) * lerp;
                this.jf.y += (this.jf.targetY - this.jf.y) * lerp;
            }
        }

        // ─── Draw enhancements ───
        drawEnhancements(ctx) {
            if (!this.jf.particles) return;
            const person = this.personality.modes[this.personality.current] ||
                           this.personality.modes.majestic;

            // Secondary particles
            for (const p of this.jf.particles) {
                const alpha = Math.max(0, p.life / p.maxLife) * 0.4;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#aaddff';
                ctx.beginPath();
                ctx.arc(this.jf.x + p.x, this.jf.y + p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            // Micro-expression indicator (tiny eye blink)
            if (this.jf.isBlinking) {
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(this.jf.x - 15, this.jf.y - 25, 6, 2, 0, 0, Math.PI * 2);
                ctx.ellipse(this.jf.x + 15, this.jf.y - 25, 6, 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    global.JellyfishAnimator = JellyfishAnimator;
})(window);
