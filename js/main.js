/**
 * main.js — Cnidaria Frames Main Controller v1.3
 *
 * Integrates all subsystems from v1.1 + v1.2 + v1.3:
 *   v1.1: particles, audio, flocking, gestures, settings, PWA, perf overlay
 *   v1.2: themes, food, predators, voice, sync, lunar, caustics
 *   v1.3: seafloor, manta ray, plankton, breathing, storm, achievements,
 *         audio-reactive, lifecycle, URL state, water current, coral,
 *         help overlay, changelog, auto-dark, touch ripple, idle behavior
 */

(function() {
    'use strict';

    // ─── Canvas setup ───
    const canvas = document.getElementById('jellyfishCanvas');
    const ctx = canvas.getContext('2d');

    // ─── UI elements ───
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const splashScreen = document.getElementById('splashScreen');
    const netStatus = document.getElementById('netStatus');
    const netText = document.getElementById('netText');
    const ariaAnnouncer = document.getElementById('ariaAnnouncer');
    // Toolbar buttons (v2.0)
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnTheme = document.getElementById('btnTheme');
    const btnAudio = document.getElementById('btnAudio');
    const btnCapture = document.getElementById('btnCapture');
    const btnSettings = document.getElementById('btnSettings');

    // ─── Components ───
    let jellyfish, jellyfishSwarm = [];
    let stateManager, limbicBridge, particleSystem;
    let foodSystem, predatorManager, inkCloud, caustics;
    let gestureHandler, voiceCommand, audioEngine;
    let settingsPanel, perfMonitor, screensaver;
    let themeManager, analytics, wsBridge, lunarPhase;
    // v1.3
    let seafloor, mantaRayManager, planktonBloom, breathingGuide;
    let storm, achievements, audioReactive, lifecycle;
    let waterCurrent, coralReef, helpOverlay, changelog;
    let autoDark, touchRipple, idleBehavior;

    // ─── Animation state ───
    let lastTime = 0;
    let animationId = null;
    let reducedMotion = false;
    let currentTheme = null;
    let previousState = null;
    let sessionStart = Date.now();

    // ─── State history ───
    const stateHistory = [];
    const MAX_HISTORY = 10;

    // ─── Initialize ───
    function init() {
        // Mark JS as loaded for CSS fallback
        if (splashScreen) {
            splashScreen.classList.add('js-loaded');
            // Tap-to-dismiss splash screen
            splashScreen.addEventListener('click', () => {
                splashScreen.classList.add('hidden');
            }, { once: true });
        }

        try {
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Lunar phase
            lunarPhase = new LunarPhase();

        // Theme system
        themeManager = new ThemeManager();
        currentTheme = themeManager.getTheme();

        // Core systems
        stateManager = new StateManager();
        limbicBridge = new LimbicBridge();
        limbicBridge.connect();

        // Visual effects
        caustics = new Caustics();
        inkCloud = new InkCloud();
        particleSystem = new ParticleSystem();
        particleSystem.init(canvas.width, canvas.height);

        // v1.3 effects
        seafloor = new Seafloor();
        coralReef = new CoralReef();
        touchRipple = new TouchRipple();
        storm = new Storm();
        planktonBloom = new PlanktonBloom();

        // Food & predators
        foodSystem = new FoodSystem();
        predatorManager = new PredatorManager(canvas.width, canvas.height);

        // Manta ray
        mantaRayManager = new MantaRayManager(canvas.width, canvas.height);

        // Water current
        waterCurrent = new WaterCurrent();

        // Interaction
        gestureHandler = new GestureHandler();
        voiceCommand = new VoiceCommand();

        // Breathing guide
        breathingGuide = new BreathingGuide();

        // Audio
        audioEngine = new AudioEngine();
        audioReactive = new AudioReactive();

        // Settings
        settingsPanel = new SettingsPanel();
        reducedMotion = settingsPanel.getSettings().reducedMotion;

        // Performance
        perfMonitor = new PerformanceMonitor();
        if (settingsPanel.getSettings().showFPS) perfMonitor.show();

        // Analytics + achievements
        analytics = new SessionAnalytics();
        achievements = new Achievements();
        setupAchievementToasts();

        // Idle behavior
        idleBehavior = new IdleBehavior(jellyfishSwarm);

        // Screensaver
        screensaver = new Screensaver(stateManager);

        // WebSocket bridge
        wsBridge = new WSBridge();
        if (window.location.protocol !== 'file:') wsBridge.connect();

        // System APIs
        SystemAPIs.initBattery();
        SystemAPIs.requestWakeLock();

        // Help overlay + changelog
        helpOverlay = new HelpOverlay();
        changelog = new Changelog();

        // Auto dark mode
        autoDark = new AutoDark(themeManager);
        autoDark.check();

        // URL state
        const restored = URLState.apply(stateManager, themeManager);
        if (restored) {
            currentTheme = themeManager.getTheme();
            updateStatus(stateManager.getState());
        }

        // Jellyfish swarm
        createJellyfishSwarm();
        lifecycle = new Lifecycle(jellyfishSwarm);

        // Event wiring
        setupGestures();
        setupSettingsListeners();
        setupNetworkStatus();
        setupOrientation();
        setupVoiceCommands();
        setupWSBridge();
        setupPredatorEvents();
        setupStateChangeEffects();
        setupTouchDrag();
        setupStormEvents();

        // UI events
        if (btnPrev) btnPrev.addEventListener('click', () => goBackState());
        if (btnNext) btnNext.addEventListener('click', () => cycleState());
        if (btnTheme) btnTheme.addEventListener('click', () => {
            const newTheme = themeManager.cycle();
            currentTheme = themeManager.getTheme();
            achievements.checkTheme(newTheme);
            analytics.logTheme(newTheme);
            autoDark.setManualOverride(true);
            announceToScreenReader('Theme: ' + newTheme);
        });
        if (btnAudio) btnAudio.addEventListener('click', () => {
            if (!audioEngine) return;
            audioEngine.isPlaying ? audioEngine.stop() : audioEngine.start();
            btnAudio.classList.toggle('active', audioEngine.isPlaying);
        });
        if (btnCapture) btnCapture.addEventListener('click', () => {
            SystemAPIs.exportScreenshot(canvas);
            achievements.checkScreenshot();
        });
        if (btnSettings) btnSettings.addEventListener('click', () => settingsPanel.open());

        // Start animation
        requestAnimationFrame(animate);

        setTimeout(() => splashScreen.classList.add('hidden'), 900);

        updateStatus('ready');
        announceToScreenReader('Cnidaria Frames ready. Press question mark for help.');
        } catch (err) {
            console.error('[Cnidaria] init error:', err);
            // Still dismiss splash so user isn't stuck
            if (splashScreen) splashScreen.classList.add('hidden');
        }
    }

    // ─── Responsive swarm with personalities ───
    function createJellyfishSwarm() {
        jellyfishSwarm = [];
        // Use CSS pixel dimensions (not canvas buffer size) for centering
        const w = window.innerWidth;
        const h = window.innerHeight;
        const diag = Math.sqrt(w * w + h * h);
        const baseScale = Utils.clamp(diag / 1200, 0.55, 1.4);

        const leader = new Jellyfish(w / 2, h / 2, baseScale);
        leader.personality = new Personality('leader');
        leader.personality.apply(leader);
        jellyfish = leader;
        jellyfishSwarm.push(leader);

        const count = (w * h) > 400000 ? 3 : (w * h) > 250000 ? 2 : 0;
        for (let i = 0; i < count; i++) {
            const jf = new Jellyfish(
                w * 0.2 + Math.random() * w * 0.6,
                h * 0.2 + Math.random() * h * 0.6,
                baseScale * (0.5 + Math.random() * 0.4)
            );
            jf.personality = new Personality(Personality.random());
            jf.personality.apply(jf);
            jellyfishSwarm.push(jf);
        }
    }

    // ─── Canvas sizing ───
    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (particleSystem) particleSystem.init(window.innerWidth, window.innerHeight);
        if (caustics) caustics.resize();
        if (predatorManager) predatorManager.resize(window.innerWidth, window.innerHeight);
        if (seafloor) seafloor.resize();
        if (coralReef) coralReef.resize();
        if (mantaRayManager) mantaRayManager.resize(window.innerWidth, window.innerHeight);
        if (jellyfish) {
            jellyfish.x = window.innerWidth / 2;
            jellyfish.y = window.innerHeight / 2;
        }
        // Recenter swarm members too
        for (const jf of jellyfishSwarm) {
            if (jf !== jellyfish) {
                jf.x = Utils.clamp(jf.x, 60, window.innerWidth - 60);
                jf.y = Utils.clamp(jf.y, 60, window.innerHeight - 60);
            }
        }
    }

    // ─── Animation loop ───
    function animate(time) {
        const now = performance.now();
        const rawDt = (now - lastTime) / 1000;
        const dt = Math.min(rawDt, 0.1);
        lastTime = now;

        const settings = settingsPanel ? settingsPanel.getSettings() : {};
        const motionFactor = (settings.reducedMotion || reducedMotion) ? 0.2 : 1.0;
        const battery = SystemAPIs.batteryInfo || { throttled: false };
        const throttleMult = battery.throttled ? 0.5 : 1.0;
        const effectiveDt = dt * motionFactor * throttleMult;

        // Audio reactivity
        const micLevel = audioReactive ? audioReactive.getLevel() : 0;

        // Storm shake
        const shake = storm ? storm.getShake() : { x: 0, y: 0 };
        if (storm.active) {
            ctx.save();
            ctx.translate(shake.x, shake.y);
        }

        // Background: theme + lunar
        const theme = currentTheme || themeManager.getTheme();
        const lunarTint = lunarPhase ? lunarPhase.getBrightnessMod() : 0;
        ctx.fillStyle = theme.bg || '#000a1a';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Caustics
        if (caustics && !settings.reducedMotion) {
            caustics.update(effectiveDt);
            caustics.draw(ctx, theme);
        }

        // Depth-of-field with theme tint
        drawDepthOfField(theme, lunarTint);

        // Plankton bloom (behind entities)
        if (planktonBloom) {
            planktonBloom.update(effectiveDt, window.innerWidth, window.innerHeight);
            planktonBloom.draw(ctx);
        }

        // Particles (background layer)
        if (particleSystem) {
            particleSystem.update(effectiveDt, window.innerWidth, window.innerHeight);
            particleSystem.draw(ctx);
        }

        // Food
        if (foodSystem) {
            foodSystem.update(dt, window.innerHeight);
            foodSystem.attract(jellyfishSwarm);
            foodSystem.checkCollisions(jellyfishSwarm, (x, y, jf) => {
                if (particleSystem) {
                    const hue = Utils.map(stateManager.getState().charCodeAt(0), 97, 122, 180, 300);
                    particleSystem.emitBurst(x, y, 12, hue);
                }
                analytics.logFood();
                achievements.checkFood();
                SystemAPIs.haptic('eat');
            });
            foodSystem.draw(ctx);
        }

        // Predator
        if (predatorManager) {
            predatorManager.update(dt);
            predatorManager.draw(ctx);
        }

        // Manta ray
        if (mantaRayManager) {
            mantaRayManager.update(dt, window.innerWidth, window.innerHeight);
            mantaRayManager.draw(ctx);
        }

        // Ink cloud
        if (inkCloud) {
            inkCloud.update(dt);
            inkCloud.draw(ctx);
        }

        // Storm
        if (storm) {
            storm.update(dt);
            storm.draw(ctx);
        }

        // Touch ripples
        if (touchRipple) {
            touchRipple.update(dt);
            touchRipple.draw(ctx);
        }

        // Jellyfish swarm
        const limbicParams = limbicBridge ? limbicBridge.getParams() : {};
        const currentState = stateManager ? stateManager.getState() : 'idle';

        for (const jf of jellyfishSwarm) {
            jf.setState(currentState);

            // Audio reactivity modulates pulse
            if (micLevel > 0) {
                jf.pulsePhase += micLevel * dt * 2;
            }

            jf.update(effectiveDt, now / 1000, limbicParams, settings.reducedMotion);

            if (jf !== jellyfish && jellyfishSwarm.length > 1) {
                jf.updateNeighbors(jellyfishSwarm, window.innerWidth, window.innerHeight);
            }

            // Apply theme color shift + lunar tint
            if (theme.jellyfishTint) {
                jf.color.r = Utils.clamp(jf.color.r + theme.jellyfishTint.r, 0, 255);
                jf.color.g = Utils.clamp(jf.color.g + theme.jellyfishTint.g, 0, 255);
                jf.color.b = Utils.clamp(jf.color.b + theme.jellyfishTint.b, 0, 255);
            }

            // Water current drift
            if (waterCurrent && jf !== jellyfish) {
                waterCurrent.apply(jf, effectiveDt);
            }

            jf.draw(ctx);

            if (particleSystem && !settings.reducedMotion) {
                jf.emitSparkles(particleSystem, settings.reducedMotion);
            }
        }

        // Idle behaviors
        if (idleBehavior) idleBehavior.update(dt);

        // Lifecycle (grow then split)
        if (lifecycle) lifecycle.update(dt);

        // Breathing guide
        if (breathingGuide) breathingGuide.update(dt, jellyfish ? jellyfish.pulsePhase : 0);

        // Seafloor + coral (foreground layer)
        if (seafloor) {
            seafloor.update(dt);
            seafloor.draw(ctx);
        }
        if (coralReef) {
            coralReef.update(dt);
            coralReef.draw(ctx);
        }

        // Water current UI
        if (waterCurrent) waterCurrent.update(dt);

        // Session duration check
        const elapsed = (Date.now() - sessionStart) / 1000;
        achievements.checkSessionDuration(elapsed);

        // Performance monitor
        if (perfMonitor) {
            const tp = particleSystem ? particleSystem.bubbles.length + particleSystem.sparkles.length : 0;
            perfMonitor.tick(now, tp);
            perfMonitor.setFrameTime(dt * 1000);
        }

        // Restore from storm shake
        if (storm && storm.active) ctx.restore();

        // Update URL hash for sharing
        if (stateManager && themeManager && (now % 2000 < 20)) {
            URLState.push(stateManager.getState(), themeManager.current, settings);
        }

        animationId = requestAnimationFrame(animate);
    }

    // ─── Depth-of-field with theme ───
    function drawDepthOfField(theme, lunarMod) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2, cy = h / 2;
        const maxR = Math.max(w, h) * 0.75;
        const tint = theme && theme.dofTint ? theme.dofTint : [0, 5, 20];
        const lm = Math.round((lunarMod || 0) * 255);
        const grad = ctx.createRadialGradient(cx, cy, maxR * 0.15, cx, cy, maxR);
        grad.addColorStop(0, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0)`);
        grad.addColorStop(0.6, `rgba(${tint[0]}, ${tint[1]}, ${tint[2]}, 0.15)`);
        grad.addColorStop(1, `rgba(${Math.min(255, tint[0]+lm)}, ${Math.min(255, tint[1]+lm)}, ${Math.min(255, tint[2]+lm)}, 0.55)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    // ─── Gesture wiring ───
    function setupGestures() {
        document.addEventListener('cnidaria:tap', e => {
            analytics.activity();
            if (audioEngine && !audioEngine.isPlaying) audioEngine.start();
            if (touchRipple && e.detail) {
                touchRipple.add(e.detail.x, e.detail.y);
            }
            if (foodSystem && e.detail && e.detail.y < window.innerHeight - 80) {
                foodSystem.drop(e.detail.x, e.detail.y);
            }
        });

        document.addEventListener('cnidaria:swipe', e => {
            analytics.activity();
            const { direction } = e.detail;
            if (direction === 'up') {
                stateManager.nextState();
                pushHistory(stateManager.getState());
                updateStatus(stateManager.getState());
            } else if (direction === 'down') {
                goBackState();
            } else if (direction === 'right') {
                const newTheme = themeManager.cycle();
                currentTheme = themeManager.getTheme();
                achievements.checkTheme(newTheme);
                analytics.logTheme(newTheme);
                autoDark.setManualOverride(true);
                announceToScreenReader('Theme: ' + newTheme);
            } else if (direction === 'left') {
                SystemAPIs.exportScreenshot(canvas);
            }
        });

        document.addEventListener('cnidaria:doubletap', e => {
            analytics.activity();
            const { x, y } = e.detail;
            if (particleSystem) {
                const hue = Utils.map(stateManager.getState().charCodeAt(0), 97, 122, 180, 300);
                particleSystem.emitBurst(x, y, 20, hue);
            }
            if (audioEngine) audioEngine._playBubblePop();
            if (touchRipple) touchRipple.add(x, y);
        });

        document.addEventListener('cnidaria:longpress', () => {
            analytics.activity();
        });

        // Keyboard
        document.addEventListener('cnidaria:keystate', e => {
            const s = e.detail.state;
            if (s && stateManager) {
                pushHistory(stateManager.getState());
                stateManager.setState(s);
                updateStatus(s);
            }
        });
        document.addEventListener('cnidaria:keynext', () => cycleState());
        document.addEventListener('cnidaria:keyprev', () => goBackState());

        document.addEventListener('cnidaria:toggleaudio', () => {
            if (!audioEngine) return;
            audioEngine.isPlaying ? audioEngine.stop() : audioEngine.start();
        });
        document.addEventListener('cnidaria:togglefps', () => perfMonitor.toggle());
        document.addEventListener('cnidaria:opensettings', () => settingsPanel.open());

        // v1.2+ shortcuts
        document.addEventListener('cnidaria:exportscreenshot', () => {
            SystemAPIs.exportScreenshot(canvas);
            achievements.checkScreenshot();
        });
        document.addEventListener('cnidaria:toggletheme', () => {
            const newTheme = themeManager.cycle();
            currentTheme = themeManager.getTheme();
            achievements.checkTheme(newTheme);
            analytics.logTheme(newTheme);
            autoDark.setManualOverride(true);
            announceToScreenReader('Theme: ' + newTheme);
        });
        document.addEventListener('cnidaria:togglevoice', () => {
            if (voiceCommand) voiceCommand.toggle();
        });
        document.addEventListener('cnidaria:fullscreen:request', () => SystemAPIs.toggleFullscreen());
        document.addEventListener('cnidaria:fullscreen:exit', () => SystemAPIs.toggleFullscreen());

        // v1.3 shortcuts
        document.addEventListener('keydown', e => {
            if (e.key === '?') { e.preventDefault(); helpOverlay.toggle(); }
            if (e.key === 'b') { e.preventDefault(); breathingGuide.toggle(); }
            if (e.key === 'm') { e.preventDefault(); if (audioReactive) audioReactive.toggle(); }
            if (e.key === 'w') { e.preventDefault(); storm.toggle(); achievements.checkStorm(); }
            if (e.key === 'p') { e.preventDefault(); if (planktonBloom) planktonBloom.trigger(); }
        });
    }

    // ─── Touch-drag steering ───
    function setupTouchDrag() {
        let dragging = false;
        canvas.addEventListener('pointerdown', e => {
            dragging = true;
            canvas.setPointerCapture(e.pointerId);
        });
        canvas.addEventListener('pointermove', e => {
            if (!dragging || !jellyfish) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            // Soft follow with spring
            const dx = x - jellyfish.x;
            const dy = y - jellyfish.y;
            jellyfish.vx += dx * 0.003;
            jellyfish.vy += dy * 0.003;
            if (touchRipple) touchRipple.add(x, y);
        });
        canvas.addEventListener('pointerup', () => { dragging = false; });
        canvas.addEventListener('pointercancel', () => { dragging = false; });
    }

    // ─── Voice commands ───
    function setupVoiceCommands() {
        const voiceStatus = document.getElementById('voiceStatus');
        document.addEventListener('cnidaria:voice:start', () => {
            if (voiceStatus) voiceStatus.classList.add('visible');
        });
        document.addEventListener('cnidaria:voice:stop', () => {
            if (voiceStatus) voiceStatus.classList.remove('visible');
        });

        document.addEventListener('cnidaria:voice:state', e => {
            const s = e.detail;
            if (stateManager) {
                pushHistory(stateManager.getState());
                stateManager.setState(s);
                updateStatus(s);
                achievements.checkVoice();
                announceToScreenReader('Voice: ' + s);
            }
        });
        document.addEventListener('cnidaria:voice:theme', e => {
            const t = e.detail;
            if (themeManager.setTheme(t)) {
                currentTheme = themeManager.getTheme();
                achievements.checkTheme(t);
                analytics.logTheme(t);
                autoDark.setManualOverride(true);
                announceToScreenReader('Theme: ' + t);
            }
        });
        document.addEventListener('cnidaria:voice:next', () => cycleState());
        document.addEventListener('cnidaria:voice:previous', () => goBackState());
        document.addEventListener('cnidaria:voice:screenshot', () => {
            SystemAPIs.exportScreenshot(canvas);
            achievements.checkScreenshot();
        });
        document.addEventListener('cnidaria:voice:fullscreen', () => SystemAPIs.toggleFullscreen());
    }

    // ─── Settings listeners ───
    function setupSettingsListeners() {
        document.addEventListener('cnidaria:setting:volumechange', e => {
            if (audioEngine) audioEngine.setVolume(e.detail);
        });
        document.addEventListener('cnidaria:setting:particlechange', e => {
            const map = { low: 30, medium: 60, high: 120 };
            if (particleSystem) {
                particleSystem.bubbleCount = map[e.detail] || 60;
                particleSystem.init(window.innerWidth, window.innerHeight);
            }
        });
        document.addEventListener('cnidaria:setting:reducedmotionchange', e => {
            reducedMotion = e.detail;
        });
        document.addEventListener('cnidaria:setting:themechange', e => {
            if (themeManager.setTheme(e.detail)) {
                currentTheme = themeManager.getTheme();
                analytics.logTheme(e.detail);
                autoDark.setManualOverride(true);
            }
        });
        document.addEventListener('cnidaria:setting:voicechange', e => {
            if (voiceCommand) {
                e.detail ? voiceCommand.start() : voiceCommand.stop();
            }
        });
        document.addEventListener('cnidaria:setting:predatorchange', e => {
            if (predatorManager) predatorManager.enabled = e.detail;
        });

        // v1.3 settings events
        document.addEventListener('cnidaria:setting:stormchange', e => {
            if (e.detail) storm.start(); else storm.stop();
        });
        document.addEventListener('cnidaria:setting:breathingchange', e => {
            if (breathingGuide) breathingGuide.toggle();
        });
        document.addEventListener('cnidaria:setting:micchange', e => {
            if (audioReactive) e.detail ? audioReactive.start() : audioReactive.stop();
        });
        document.addEventListener('cnidaria:setting:exportanalytics', () => {
            analytics.exportJSON();
        });
        document.addEventListener('cnidaria:setting:showchangelog', () => {
            if (changelog) changelog.show();
        });
    }

    // ─── State change effects ───
    function setupStateChangeEffects() {
        document.addEventListener('cnidaria:statechange', e => {
            const { state, source } = e.detail || {};
            if (!state) return;
            analytics.logState(state);
            achievements.checkState(state);
            SystemAPIs.haptic(state === 'error' ? 'heavy' : 'light');
            announceToScreenReader('State: ' + state);

            if (state === 'error' && inkCloud && jellyfish) {
                inkCloud.burst(jellyfish.x, jellyfish.y);
            }

            if (wsBridge && source !== 'ws') {
                wsBridge.broadcastState(state);
            }
        });
    }

    // ─── Predator events ───
    function setupPredatorEvents() {
        document.addEventListener('cnidaria:predator:spawn', () => {
            analytics.logPredator();
            achievements.checkPredator();
            SystemAPIs.haptic('panic');
            announceToScreenReader('Warning: predator detected');
        });
        document.addEventListener('cnidaria:predator:midpoint', () => {
            for (const jf of jellyfishSwarm) {
                const dx = jf.x - window.innerWidth / 2;
                const dy = jf.y - window.innerHeight / 2;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                jf.vx += (dx / dist) * 3;
                jf.vy += (dy / dist) * 3;
            }
        });
    }

    // ─── Storm events ───
    function setupStormEvents() {
        document.addEventListener('cnidaria:storm:start', () => {
            if (storm) storm.start();
        });
        document.addEventListener('cnidaria:storm:stop', () => {
            if (storm) storm.stop();
        });
    }

    // ─── WebSocket bridge ───
    function setupWSBridge() {
        document.addEventListener('cnidaria:ws:message', e => {
            const msg = e.detail;
            if (msg.type === 'state' && stateManager) {
                stateManager.setState(msg.state);
                updateStatus(msg.state);
            } else if (msg.type === 'theme' && themeManager) {
                themeManager.setTheme(msg.theme);
                currentTheme = themeManager.getTheme();
            }
        });
    }

    // ─── Network status ───
    function setupNetworkStatus() {
        function updateOnlineStatus() {
            if (navigator.onLine) {
                netStatus.classList.remove('offline');
                netText.textContent = 'online';
                netStatus.classList.remove('hidden');
            } else {
                netStatus.classList.add('offline');
                netText.textContent = 'offline';
                netStatus.classList.remove('hidden');
            }
        }
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    }

    // ─── Orientation (gyroscope) ───
    function setupOrientation() {
        if (!window.DeviceOrientationEvent) return;
        window.addEventListener('deviceorientation', e => {
            if (!jellyfish) return;
            const tiltX = (e.gamma || 0) / 45;
            const tiltY = (e.beta || 0) / 45;
            jellyfish.vx += tiltX * 0.3;
            jellyfish.vy += tiltY * 0.3;
        });
    }

    // ─── Achievement toasts ───
    function setupAchievementToasts() {
        document.addEventListener('cnidaria:achievement', e => {
            const d = e.detail;
            const toast = document.getElementById('achievementToast');
            if (!toast) return;
            toast.innerHTML = `
                <div class="achievement-toast-inner">
                    <span class="achievement-icon">${d.icon}</span>
                    <div class="achievement-text">
                        <div class="achievement-title">${d.label}</div>
                        <div class="achievement-desc">${d.desc}</div>
                    </div>
                </div>
            `;
            toast.classList.add('visible');
            setTimeout(() => toast.classList.remove('visible'), 3000);
        });
    }

    // ─── State helpers ───
    function cycleState() {
        if (!stateManager) return;
        pushHistory(stateManager.getState());
        stateManager.nextState();
        updateStatus(stateManager.getState());
    }

    function goBackState() {
        if (stateHistory.length === 0) return;
        const prev = stateHistory.pop();
        if (stateManager) stateManager.setState(prev);
        updateStatus(prev);
    }

    function pushHistory(state) {
        if (previousState === state) return;
        stateHistory.push(state);
        if (stateHistory.length > MAX_HISTORY) stateHistory.shift();
        previousState = state;
    }

    function updateStatus(state) {
        if (!statusText) return;
        statusText.textContent = state;
        statusIndicator.classList.remove('hidden');
    }

    function announceToScreenReader(msg) {
        if (ariaAnnouncer) {
            ariaAnnouncer.textContent = msg;
            setTimeout(() => { ariaAnnouncer.textContent = ''; }, 1000);
        }
    }

    // ─── Start ───
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();