/**
 * main.js — Cnidaria Frames Main Controller v1.2
 *
 * Integrates all subsystems: themes, personalities, food, predators,
 * ink clouds, caustics, voice, system APIs, analytics, lunar phase,
 * WebSocket bridge, and everything from v1.1.
 */

(function() {
    'use strict';

    // ─── Canvas setup ───
    const canvas = document.getElementById('jellyfishCanvas');
    const ctx = canvas.getContext('2d');

    // ─── UI elements ───
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const modeToggle = document.getElementById('modeToggle');
    const splashScreen = document.getElementById('splashScreen');
    const netStatus = document.getElementById('netStatus');
    const netText = document.getElementById('netText');
    const ariaAnnouncer = document.getElementById('ariaAnnouncer');

    // ─── Components ───
    let jellyfish, jellyfishSwarm = [];
    let stateManager;
    let limbicBridge;
    let particleSystem;
    let foodSystem;
    let predatorManager;
    let inkCloud;
    let caustics;
    let gestureHandler;
    let voiceCommand;
    let audioEngine;
    let settingsPanel;
    let perfMonitor;
    let screensaver;
    let themeManager;
    let analytics;
    let wsBridge;
    let lunarPhase;

    // ─── Animation state ───
    let lastTime = 0;
    let animationId = null;
    let reducedMotion = false;
    let currentTheme = null;
    let previousState = null;

    // ─── State history ───
    const stateHistory = [];
    const MAX_HISTORY = 10;

    // ─── Initialize ───
    function init() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Lunar phase (computed once on load)
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

        // Food & predators
        foodSystem = new FoodSystem();
        predatorManager = new PredatorManager(canvas.width, canvas.height);

        // Interaction
        gestureHandler = new GestureHandler();
        voiceCommand = new VoiceCommand();

        // Audio
        audioEngine = new AudioEngine();

        // Settings
        settingsPanel = new SettingsPanel();
        reducedMotion = settingsPanel.getSettings().reducedMotion;

        // Performance
        perfMonitor = new PerformanceMonitor();
        if (settingsPanel.getSettings().showFPS) perfMonitor.show();

        // Analytics
        analytics = new SessionAnalytics();

        // Screensaver
        screensaver = new Screensaver(stateManager);

        // WebSocket bridge
        wsBridge = new WSBridge();
        // Auto-connect if not local file (can't WS from file://)
        if (window.location.protocol !== 'file:') {
            wsBridge.connect();
        }

        // System APIs
        SystemAPIs.initBattery();
        SystemAPIs.requestWakeLock();

        // Jellyfish swarm
        createJellyfishSwarm();

        // Event wiring
        setupGestures();
        setupSettingsListeners();
        setupNetworkStatus();
        setupOrientation();
        setupVoiceCommands();
        setupWSBridge();
        setupPredatorEvents();
        setupStateChangeEffects();

        // UI events
        modeToggle.addEventListener('click', () => cycleState());

        // Start animation
        requestAnimationFrame(animate);

        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 900);

        updateStatus('ready');
        announceToScreenReader('Cnidaria Frames ready');
    }

    // ─── Responsive swarm with personalities ───
    function createJellyfishSwarm() {
        jellyfishSwarm = [];
        const w = canvas.width;
        const h = canvas.height;
        const diag = Math.sqrt(w * w + h * h);
        const baseScale = Utils.clamp(diag / 1200, 0.55, 1.4);

        // Primary
        const leader = new Jellyfish(w / 2, h / 2, baseScale);
        leader.personality = new Personality('leader');
        leader.personality.apply(leader);
        jellyfish = leader;
        jellyfishSwarm.push(leader);

        // Companions
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
        if (jellyfish) {
            jellyfish.x = window.innerWidth / 2;
            jellyfish.y = window.innerHeight / 2;
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

        // Background: theme + lunar
        const theme = currentTheme || themeManager.getTheme();
        const lunarTint = lunarPhase.getBrightnessMod();
        ctx.fillStyle = theme.bg || '#000a1a';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Caustics (behind everything)
        if (caustics && !settings.reducedMotion) {
            caustics.update(dt * throttleMult);
            caustics.draw(ctx, theme);
        }

        // Depth-of-field with theme tint
        drawDepthOfField(theme, lunarTint);

        const limbicParams = limbicBridge ? limbicBridge.getParams() : {};
        const currentState = stateManager ? stateManager.getState() : 'idle';

        // Particles (background layer)
        if (particleSystem) {
            particleSystem.update(dt * throttleMult, window.innerWidth, window.innerHeight);
            particleSystem.draw(ctx);
        }

        // Food
        if (foodSystem) {
            foodSystem.update(dt, window.innerHeight);
            foodSystem.attract(jellyfishSwarm);
            foodSystem.checkCollisions(jellyfishSwarm, (x, y, jf) => {
                if (particleSystem) {
                    const hue = Utils.map(currentState.charCodeAt(0), 97, 122, 180, 300);
                    particleSystem.emitBurst(x, y, 12, hue);
                }
                analytics.logFood();
                SystemAPIs.haptic('eat');
            });
            foodSystem.draw(ctx);
        }

        // Predator
        if (predatorManager) {
            predatorManager.update(dt);
            predatorManager.draw(ctx);
        }

        // Ink cloud
        if (inkCloud) {
            inkCloud.update(dt);
            inkCloud.draw(ctx);
        }

        // Jellyfish swarm
        for (const jf of jellyfishSwarm) {
            jf.setState(currentState);
            jf.update(dt * throttleMult, now / 1000, limbicParams, settings.reducedMotion);

            if (jf !== jellyfish && jellyfishSwarm.length > 1) {
                jf.updateNeighbors(jellyfishSwarm, window.innerWidth, window.innerHeight);
            }

            // Apply theme color shift + lunar tint
            if (theme.jellyfishTint) {
                jf.color.r = Utils.clamp(jf.color.r + theme.jellyfishTint.r, 0, 255);
                jf.color.g = Utils.clamp(jf.color.g + theme.jellyfishTint.g, 0, 255);
                jf.color.b = Utils.clamp(jf.color.b + theme.jellyfishTint.b, 0, 255);
            }

            jf.draw(ctx);

            if (particleSystem && !settings.reducedMotion) {
                jf.emitSparkles(particleSystem, settings.reducedMotion);
            }
        }

        // Performance monitor
        if (perfMonitor) {
            const tp = particleSystem ? particleSystem.bubbles.length + particleSystem.sparkles.length : 0;
            perfMonitor.tick(now, tp);
            perfMonitor.setFrameTime(dt * 1000);
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
            // Drop food on canvas tap (not on controls)
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
                // Cycle theme
                const newTheme = themeManager.cycle();
                currentTheme = themeManager.getTheme();
                analytics.logTheme(newTheme);
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

        // v1.2 keyboard shortcuts
        document.addEventListener('cnidaria:exportscreenshot', () => SystemAPIs.exportScreenshot(canvas));
        document.addEventListener('cnidaria:toggletheme', () => {
            const newTheme = themeManager.cycle();
            currentTheme = themeManager.getTheme();
            analytics.logTheme(newTheme);
            announceToScreenReader('Theme: ' + newTheme);
        });
        document.addEventListener('cnidaria:togglevoice', () => {
            if (voiceCommand) voiceCommand.toggle();
        });
        document.addEventListener('cnidaria:fullscreen:request', () => SystemAPIs.toggleFullscreen());
        document.addEventListener('cnidaria:fullscreen:exit', () => SystemAPIs.toggleFullscreen());
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
                announceToScreenReader('Voice: ' + s);
            }
        });
        document.addEventListener('cnidaria:voice:theme', e => {
            const t = e.detail;
            if (themeManager.setTheme(t)) {
                currentTheme = themeManager.getTheme();
                analytics.logTheme(t);
                announceToScreenReader('Theme: ' + t);
            }
        });
        document.addEventListener('cnidaria:voice:next', () => cycleState());
        document.addEventListener('cnidaria:voice:previous', () => goBackState());
        document.addEventListener('cnidaria:voice:screenshot', () => SystemAPIs.exportScreenshot(canvas));
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

        // Theme change
        document.addEventListener('cnidaria:setting:themechange', e => {
            if (themeManager.setTheme(e.detail)) {
                currentTheme = themeManager.getTheme();
                analytics.logTheme(e.detail);
            }
        });

        // Voice toggle
        document.addEventListener('cnidaria:setting:voicechange', e => {
            if (voiceCommand) {
                e.detail ? voiceCommand.start() : voiceCommand.stop();
            }
        });

        // Predator toggle
        document.addEventListener('cnidaria:setting:predatorchange', e => {
            if (predatorManager) predatorManager.enabled = e.detail;
        });
    }

    // ─── State change effects ───
    function setupStateChangeEffects() {
        document.addEventListener('cnidaria:statechange', e => {
            const { state, source } = e.detail || {};
            if (!state) return;
            analytics.logState(state);
            SystemAPIs.haptic(state === 'error' ? 'heavy' : 'light');
            announceToScreenReader('State: ' + state);

            // Ink cloud on error
            if (state === 'error' && inkCloud && jellyfish) {
                inkCloud.burst(jellyfish.x, jellyfish.y);
            }

            // WS broadcast
            if (wsBridge && source !== 'ws') {
                wsBridge.broadcastState(state);
            }
        });
    }

    // ─── Predator events ───
    function setupPredatorEvents() {
        document.addEventListener('cnidaria:predator:spawn', () => {
            analytics.logPredator();
            SystemAPIs.haptic('panic');
            announceToScreenReader('Warning: predator detected');
        });
        document.addEventListener('cnidaria:predator:midpoint', () => {
            // Scatter swarm away from center
            for (const jf of jellyfishSwarm) {
                const dx = jf.x - window.innerWidth / 2;
                const dy = jf.y - window.innerHeight / 2;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                jf.vx += (dx / dist) * 3;
                jf.vy += (dy / dist) * 3;
            }
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

    // ─── State history ───
    function pushHistory(state) {
        stateHistory.push(state);
        if (stateHistory.length > MAX_HISTORY) stateHistory.shift();
    }

    function goBackState() {
        if (stateHistory.length > 0 && stateManager) {
            const prev = stateHistory.pop();
            stateManager.setState(prev);
            updateStatus(prev);
        }
    }

    function cycleState() {
        if (!stateManager) return;
        pushHistory(stateManager.getState());
        stateManager.nextState();
        updateStatus(stateManager.getState());
    }

    // ─── Network status ───
    function setupNetworkStatus() {
        function update() {
            if (!netStatus || !netText) return;
            const online = navigator.onLine;
            netStatus.classList.toggle('hidden', false);
            netStatus.classList.toggle('offline', !online);
            netText.textContent = online ? 'online' : 'offline';
        }
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
        update();
    }

    // ─── Device orientation ───
    function setupOrientation() {
        if (!window.DeviceOrientationEvent) return;
        const sensitivity = settingsPanel ? settingsPanel.getSettings().motionSensitivity : 0.5;
        window.addEventListener('deviceorientation', e => {
            if (!jellyfish || !e.gamma || !e.beta) return;
            const tiltX = (e.gamma / 45) * sensitivity * 20;
            const tiltY = (e.beta / 45) * sensitivity * 10;
            jellyfish.x = Utils.lerp(jellyfish.x, window.innerWidth / 2 + tiltX, 0.03);
            jellyfish.y = Utils.lerp(jellyfish.y, window.innerHeight / 2 + tiltY, 0.03);
        }, { passive: true });
    }

    // ─── Status ───
    let statusTimeout;
    function updateStatus(text) {
        if (!statusText) return;
        statusText.textContent = text;
        statusIndicator.classList.remove('hidden');
        clearTimeout(statusTimeout);
        statusTimeout = setTimeout(() => {
            statusIndicator.classList.add('hidden');
        }, 3000);
    }

    // ─── Screen reader announcements ───
    function announceToScreenReader(text) {
        if (!ariaAnnouncer) return;
        ariaAnnouncer.textContent = text;
        setTimeout(() => { ariaAnnouncer.textContent = ''; }, 1000);
    }

    // ─── Visibility ───
    function handleVisibilityChange() {
        if (document.hidden) {
            if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
            if (audioEngine) audioEngine.stop();
            SystemAPIs.releaseWakeLock();
        } else {
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
            SystemAPIs.requestWakeLock();
        }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ─── Boot ───
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ─── Debug namespace ───
    window.Cnidaria = {
        get jellyfish() { return jellyfish; },
        get swarm() { return jellyfishSwarm; },
        get stateManager() { return stateManager; },
        get limbicBridge() { return limbicBridge; },
        get particleSystem() { return particleSystem; },
        get audioEngine() { return audioEngine; },
        get settings() { return settingsPanel ? settingsPanel.getSettings() : {}; },
        get themeManager() { return themeManager; },
        get analytics() { return analytics; },
        get wsBridge() { return wsBridge; },
        get voiceCommand() { return voiceCommand; },
        updateStatus,
        cycleState,
        goBackState,
        exportScreenshot: () => SystemAPIs.exportScreenshot(canvas),
        toggleFullscreen: () => SystemAPIs.toggleFullscreen(),
        startVoice: () => voiceCommand.start(),
        stopVoice: () => voiceCommand.stop()
    };
})();