/**
 * main.js — Cnidaria Frames Main Controller v1.1
 *
 * Initializes the jellyfish agent swarm, particle system, ambient audio,
 * gesture handling, settings panel, performance monitor, screensaver,
 * device orientation, splash screen, and depth-of-field overlay.
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

    // ─── Components ───
    let jellyfish, jellyfishSwarm = [];
    let stateManager;
    let limbicBridge;
    let particleSystem;
    let gestureHandler;
    let audioEngine;
    let settingsPanel;
    let perfMonitor;
    let screensaver;

    // ─── Animation state ───
    let lastTime = 0;
    let animationId = null;
    let reducedMotion = false;

    // ─── State history for back navigation ───
    const stateHistory = [];
    const MAX_HISTORY = 10;

    // ─── Initialize ───
    function init() {
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Core systems
        stateManager = new StateManager();
        limbicBridge = new LimbicBridge();
        limbicBridge.connect();

        // Particle system
        particleSystem = new ParticleSystem();
        particleSystem.init(canvas.width, canvas.height);

        // Gesture & keyboard handler
        gestureHandler = new GestureHandler();

        // Audio engine (starts on first user interaction)
        audioEngine = new AudioEngine();

        // Settings panel
        settingsPanel = new SettingsPanel();
        reducedMotion = settingsPanel.getSettings().reducedMotion;

        // Performance monitor
        perfMonitor = new PerformanceMonitor();
        if (settingsPanel.getSettings().showFPS) perfMonitor.show();

        // Screensaver
        screensaver = new Screensaver(stateManager);

        // Create jellyfish (1 primary + small swarm on larger screens)
        createJellyfishSwarm();

        // Event wiring
        setupGestures();
        setupSettingsListeners();
        setupNetworkStatus();
        setupOrientation();

        // UI events
        modeToggle.addEventListener('click', () => cycleState());

        // Start animation
        requestAnimationFrame(animate);

        // Dismiss splash after brief delay
        setTimeout(() => {
            splashScreen.classList.add('hidden');
        }, 900);

        updateStatus('ready');
    }

    // ─── Responsive swarm sizing ───
    function createJellyfishSwarm() {
        jellyfishSwarm = [];
        const w = canvas.width;
        const h = canvas.height;
        const area = w * h;

        // Base scale: responsive to viewport diagonal
        const diag = Math.sqrt(w * w + h * h);
        const baseScale = Utils.clamp(diag / 1200, 0.55, 1.4);

        // Primary jellyfish
        jellyfish = new Jellyfish(w / 2, h / 2, baseScale);
        jellyfishSwarm.push(jellyfish);

        // Add companions on larger screens
        const companionCount = area > 400000 ? 3 : area > 250000 ? 2 : 0;
        for (let i = 0; i < companionCount; i++) {
            const jf = new Jellyfish(
                w * 0.2 + Math.random() * w * 0.6,
                h * 0.2 + Math.random() * h * 0.6,
                baseScale * (0.5 + Math.random() * 0.4)
            );
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
        if (jellyfish) {
            // Reposition primary toward center, companions spread
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

        // Clear with deep ocean background
        ctx.fillStyle = '#000a1a';
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

        // Depth-of-field radial gradient overlay (darker edges)
        drawDepthOfField();

        // Limbic params
        const limbicParams = limbicBridge ? limbicBridge.getParams() : {};

        // Particles (background layer)
        if (particleSystem) {
            particleSystem.update(dt, window.innerWidth, window.innerHeight);
            particleSystem.draw(ctx);
        }

        // Current state
        const currentState = stateManager ? stateManager.getState() : 'idle';

        // Update & draw jellyfish swarm
        for (const jf of jellyfishSwarm) {
            jf.setState(currentState);
            jf.update(dt, now / 1000, limbicParams, settings.reducedMotion);

            // Flocking for companions
            if (jf !== jellyfish && jellyfishSwarm.length > 1) {
                jf.updateNeighbors(jellyfishSwarm, window.innerWidth, window.innerHeight);
            }

            jf.draw(ctx);

            // Emit sparkle trails from tentacles
            if (particleSystem && !settings.reducedMotion) {
                jf.emitSparkles(particleSystem, settings.reducedMotion);
            }
        }

        // Performance monitor
        if (perfMonitor) {
            const totalParticles = (particleSystem ? particleSystem.bubbles.length + particleSystem.sparkles.length : 0);
            perfMonitor.tick(now, totalParticles);
            perfMonitor.setFrameTime(dt * 1000);
        }

        animationId = requestAnimationFrame(animate);
    }

    // ─── Depth-of-field overlay ───
    function drawDepthOfField() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2;
        const cy = h / 2;
        const maxR = Math.max(w, h) * 0.75;
        const grad = ctx.createRadialGradient(cx, cy, maxR * 0.15, cx, cy, maxR);
        grad.addColorStop(0, 'rgba(0, 5, 20, 0)');
        grad.addColorStop(0.6, 'rgba(0, 5, 20, 0.15)');
        grad.addColorStop(1, 'rgba(0, 5, 20, 0.55)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    // ─── Gesture wiring ───
    function setupGestures() {
        // Tap on canvas = audio start (first interaction)
        document.addEventListener('cnidaria:tap', () => {
            if (audioEngine && !audioEngine.isPlaying) {
                audioEngine.start();
            }
        });

        // Swipe up/down: change particle count
        document.addEventListener('cnidaria:swipe', e => {
            const { direction } = e.detail;
            if (direction === 'up') {
                stateManager.nextState();
                pushHistory(stateManager.getState());
                updateStatus(stateManager.getState());
            } else if (direction === 'down') {
                goBackState();
            }
        });

        // Double-tap: burst sparkles at center
        document.addEventListener('cnidaria:doubletap', e => {
            const { x, y } = e.detail;
            if (particleSystem) {
                const hue = Utils.map(stateManager.getState().charCodeAt(0), 97, 122, 180, 300);
                particleSystem.emitBurst(x, y, 20, hue);
            }
            if (audioEngine) audioEngine._playBubblePop(); // satisfying pop
        });

        // Keyboard state shortcuts
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

        // Audio toggle
        document.addEventListener('cnidaria:toggleaudio', () => {
            if (!audioEngine) return;
            audioEngine.isPlaying ? audioEngine.stop() : audioEngine.start();
        });
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
    }

    // ─── State history (back navigation) ───
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

    // ─── Device orientation / gyroscope ───
    function setupOrientation() {
        if (!window.DeviceOrientationEvent) return;
        const sensitivity = settingsPanel ? settingsPanel.getSettings().motionSensitivity : 0.5;

        window.addEventListener('deviceorientation', e => {
            if (!jellyfish || !e.gamma || !e.beta) return;
            // Gentle tilt influence on primary jellyfish position
            const tiltX = (e.gamma / 45) * sensitivity * 20;  // -45 to +45 degrees
            const tiltY = (e.beta / 45) * sensitivity * 10;
            jellyfish.x = Utils.lerp(jellyfish.x, window.innerWidth / 2 + tiltX, 0.03);
            jellyfish.y = Utils.lerp(jellyfish.y, window.innerHeight / 2 + tiltY, 0.03);
        }, { passive: true });
    }

    // ─── Status indicator ───
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

    // ─── Visibility handling ───
    function handleVisibilityChange() {
        if (document.hidden) {
            if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
            if (audioEngine) audioEngine.stop();
        } else {
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
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
        updateStatus,
        cycleState,
        goBackState
    };
})();