/**
 * state-manager.js — Agent state management for Cnidaria Frames.
 * Same contract as hermes-aquarium-dashboard: reads hermes_agent_state from localStorage.
 */
(function(global) {
    'use strict';

    const AGENT_STATES = [
        'idle', 'active', 'thinking', 'success', 'error',
        'sleeping', 'alert', 'learning', 'connecting', 'busy'
    ];
    const DEFAULT_STATE = 'idle';
    const STORAGE_KEY = 'hermes_agent_state';

    class StateManager {
        constructor() {
            this.currentState = DEFAULT_STATE;
            this.previousState = DEFAULT_STATE;
            this.stateTime = 0;
            this.demoMode = true;
            this.demoInterval = 6;
            this.lastDemoSwitch = 0;
            this.readFromStorage();
        }

        readFromStorage() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const data = JSON.parse(raw);
                    if (AGENT_STATES.includes(data.state)) {
                        this.setState(data.state);
                        this.demoMode = data.demo !== undefined ? data.demo : false;
                    }
                }
            } catch (e) {
                this.demoMode = true;
            }
        }

        setState(newState) {
            if (!AGENT_STATES.includes(newState)) return false;
            if (newState === this.currentState) return false;
            this.previousState = this.currentState;
            this.currentState = newState;
            this.stateTime = 0;
            return true;
        }

        static writeState(state, details = {}) {
            if (!AGENT_STATES.includes(state)) return false;
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    state, timestamp: Date.now(), demo: false, ...details
                }));
                return true;
            } catch (e) { return false; }
        }

        update(dt, now) {
            this.stateTime += dt;
            if (this.stateTime > 2 && Math.floor(this.stateTime * 10) % 20 === 0) {
                this.readFromStorage();
            }
            if (this.demoMode && now - this.lastDemoSwitch > this.demoInterval) {
                this.lastDemoSwitch = now;
                const idx = AGENT_STATES.indexOf(this.currentState);
                this.setState(AGENT_STATES[(idx + 1) % AGENT_STATES.length]);
            }
        }

        getState() { return this.currentState; }
        getPreviousState() { return this.previousState; }
        getStateTime() { return this.stateTime; }
        isDemo() { return this.demoMode; }
        toggleDemo() {
            this.demoMode = !this.demoMode;
            this.lastDemoSwitch = performance.now() / 1000;
        }
    }

    StateManager.STATES = AGENT_STATES;
    StateManager.STORAGE_KEY = STORAGE_KEY;
    global.StateManager = StateManager;
})(window);
