/**
 * cnidaria.js — Main orchestrator for Cnidaria Frames.
 *
 * Initializes the canvas, state manager, limbic bridge, and jellyfish,
 * then runs the animation loop.
 */
(function(global) {
    'use strict';

    const canvas = document.getElementById('cnidariaCanvas');
    const ctx = canvas.getContext('2d');
    const statusText = document.getElementById('statusText');
    const profileName = document.getElementById('profileName');
    const fpsCounter = document.getElementById('fpsCounter');
    const pokeBtn = document.getElementById('pokeBtn');
    const srAnnouncer = document.getElementById('sr-announcer');

    const stateManager = new StateManager();
    const limbicBridge = new LimbicBridge({ useApi: true });
    let limbicParams = {};

    let profile = Utils.detectScreenProfile();
    let jellyfish;

    function announce(msg) {
        if (srAnnouncer) srAnnouncer.textContent = msg;
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        profile = Utils.detectScreenProfile();
        if (profileName) {
            profileName.textContent = `${profile.name} (${Math.round(window.innerWidth)}×${Math.round(window.innerHeight)})`;
        }
        if (!jellyfish) {
            jellyfish = new Jellyfish(window.innerWidth / 2, window.innerHeight * 0.4, profile.scale);
        }
    }

    const debouncedResize = Utils.debounce(resize, 250);
    window.addEventListener('resize', debouncedResize);

    function drawBackground(ctx, w, h) {
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#081a33');
        grad.addColorStop(0.5, '#051224');
        grad.addColorStop(1, '#020810');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Subtle drifting particles / marine snow
        ctx.fillStyle = 'rgba(160, 220, 255, 0.04)';
        for (let i = 0; i < 20; i++) {
            const x = ((i * 137.5 + performance.now() * 0.01) % w);
            const y = ((i * 53.7 + performance.now() * 0.005) % h);
            ctx.beginPath();
            ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    async function refreshLimbic() {
        try {
            limbicParams = await limbicBridge.refresh();
        } catch (e) {
            limbicParams = {};
        }
    }

    function update(dt, time) {
        stateManager.update(dt, time);
        const state = stateManager.getState();

        if (Math.floor(time * 10) % 20 === 0) {
            refreshLimbic();
        }

        if (jellyfish) {
            jellyfish.setState(state);
            jellyfish.update(dt, time, { w: window.innerWidth, h: window.innerHeight }, limbicParams);
        }

        if (statusText) {
            const affect = limbicParams.dopamine !== undefined
                ? ` · ${Math.round(limbicParams.hue || 0)}°`
                : '';
            statusText.textContent = `${state}${affect}`;
        }
    }

    function render(dt, time) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.clearRect(0, 0, w, h);
        drawBackground(ctx, w, h);
        if (jellyfish) jellyfish.draw(ctx, time);
    }

    async function init() {
        resize();
        await refreshLimbic();
        const loop = Utils.createLoop(update, render);
        loop.start();
        setInterval(() => {
            if (fpsCounter) fpsCounter.textContent = loop.getFps();
        }, 1000);
    }

    // Poke button cycles demo states
    if (pokeBtn) {
        pokeBtn.addEventListener('click', () => {
            if (!stateManager.isDemo()) stateManager.toggleDemo();
            const states = StateManager.STATES;
            const idx = states.indexOf(stateManager.getState());
            const next = states[(idx + 1) % states.length];
            stateManager.setState(next);
            stateManager.demoMode = false; // pause auto-cycle after manual pick
            StateManager.writeState(next, { demo: false });
            announce(`State set to ${next}`);
        });
    }

    // Keyboard shortcut: space cycles demo state
    document.addEventListener('keydown', e => {
        if (e.code === 'Space') {
            if (pokeBtn) pokeBtn.click();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(window);
