/**
 * limbic-bridge.js — Minimal limbic integration for Cnidaria Frames.
 *
 * Reads limbic state from localStorage or polls localhost:8787/api/state,
 * then derives a small set of visual parameters: hue, glow, pulse, erratic.
 */
(function(global) {
    'use strict';

    const LIMBIC_KEY = 'hermes_limbic_state';
    const LIMBIC_API_URL = 'http://localhost:8787/api/state';

    const DEFAULT_LIMBIC = {
        vad: { valence: 0, arousal: 0.3, dominance: 0.5 },
        neurochemistry: {
            cortisol: 0.1, dopamine: 0.3, melatonin: 0.1,
            orexin: 0.5, serotonin: 0.5, norepinephrine: 0.2,
            allostatic_load: 0.1,
        },
        drive: { rest_need: 0.1, task_load: 0.2 },
        sleep_pressure: 0.1,
        circadian_hour: 12.0,
        dominant_affect: 'calm',
    };

    class LimbicBridge {
        constructor(options = {}) {
            this.limbic = null;
            this.params = {};
            this.useApi = options.useApi !== false;
            this.apiUrl = options.apiUrl || LIMBIC_API_URL;
            this.apiConnected = false;
            this.consecutiveErrors = 0;
        }

        async read() {
            let state = null;
            if (this.useApi && this.consecutiveErrors < 3) {
                try {
                    state = await this._fetchApi();
                    this.apiConnected = true;
                    this.consecutiveErrors = 0;
                } catch (e) {
                    this.consecutiveErrors++;
                    this.apiConnected = false;
                }
            }
            if (!state) state = this._readLocal();
            if (!state) state = DEFAULT_LIMBIC;
            this.limbic = state;
            return state;
        }

        async _fetchApi() {
            const res = await fetch(this.apiUrl, { cache: 'no-store', headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data.state || data;
        }

        _readLocal() {
            try {
                const raw = localStorage.getItem(LIMBIC_KEY);
                if (raw) return JSON.parse(raw);
            } catch (e) {}
            return null;
        }

        compute() {
            const L = this.limbic || DEFAULT_LIMBIC;
            const vad = L.vad || DEFAULT_LIMBIC.vad;
            const chem = L.neurochemistry || DEFAULT_LIMBIC.neurochemistry;
            const clamp01 = v => Math.max(0, Math.min(1, v || 0));

            const valence = clamp01((vad.valence + 1) / 2);
            const arousal = clamp01(vad.arousal);
            const cortisol = clamp01(chem.cortisol);
            const dopamine = clamp01(chem.dopamine);
            const melatonin = clamp01(chem.melatonin);
            const allostatic = clamp01(L.allostatic_load || 0);

            // Cool blue for negative/calm, warm amber-gold for positive/active
            const hue = Utils.lerp(210, 45, valence);
            const glow = Utils.lerp(0.2, 1.0, dopamine) * (1 - melatonin * 0.6);
            const pulseSpeed = Utils.lerp(0.8, 3.0, arousal) * (1 + cortisol * 0.5);
            const erratic = cortisol * (1 + (vad.norepinephrine || 0));
            const dimFactor = 1 - (melatonin * 0.5 + allostatic * 0.2);

            this.params = { valence, arousal, cortisol, dopamine, melatonin, hue, glow, pulseSpeed, erratic, dimFactor };
            return this.params;
        }

        async refresh() {
            await this.read();
            this.compute();
            return this.params;
        }
    }

    global.LimbicBridge = LimbicBridge;
})(window);
