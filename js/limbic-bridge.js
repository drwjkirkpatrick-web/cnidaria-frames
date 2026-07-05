/**
 * limbic-bridge.js — v6.0 Enhanced Hermes Limbic Bridge
 *
 * Connects to the simulated Hermes limbic system and now supports
 * remedy-driven limbic targets with smooth interpolation.
 * Displays arousal, valence, dominance, and erratic as visual bars.
 */

(function(global) {
    'use strict';
    
    class LimbicBridge {
        constructor() {
            this.isConnected = false;
            this.simulationMode = true;
            this.lastUpdate = 0;
            this.params = {
                arousal: 0.5,
                valence: 0.5,
                dominance: 0.5,
                erratic: 0.1,
                focus: 0.7,
                speedMult: 1.0,
                dimFactor: 1.0,
                grace: 0.8
            };
            // v6.0: target values for smooth interpolation
            this.targets = { ...this.params };
            this.interpSpeed = 0.02;
            this._observers = [];
        }
        
        connect() {
            this.isConnected = true;
            console.log('Limbic bridge connected (simulated)');
            return Promise.resolve();
        }
        
        disconnect() {
            this.isConnected = false;
            console.log('Limbic bridge disconnected');
        }
        
        // v6.0: Set target params from remedy profile
        setTargetParams(targets) {
            if (targets.arousal !== undefined) this.targets.arousal = targets.arousal;
            if (targets.valence !== undefined) this.targets.valence = targets.valence;
            if (targets.dominance !== undefined) this.targets.dominance = targets.dominance;
            if (targets.erratic !== undefined) this.targets.erratic = targets.erratic;
            if (targets.focus !== undefined) this.targets.focus = targets.focus;
        }
        
        getParams() {
            if (this.simulationMode) this.updateSimulation();
            // Smooth interpolation toward targets
            this._interpolate();
            return {...this.params};
        }
        
        _interpolate() {
            for (const key of Object.keys(this.params)) {
                if (this.targets[key] !== undefined) {
                    this.params[key] += (this.targets[key] - this.params[key]) * this.interpSpeed;
                }
            }
        }
        
        updateSimulation() {
            const now = Date.now();
            if (now - this.lastUpdate < 100) return;
            this.lastUpdate = now;
            
            // Only drift if no active targets
            if (this.targets.arousal === undefined) {
                this.params.arousal = this.clamp(this.params.arousal + (Math.random() - 0.5) * 0.02, 0.1, 0.9);
                this.params.valence = this.clamp(this.params.valence + (Math.random() - 0.5) * 0.02, 0.1, 0.9);
                this.params.dominance = this.clamp(this.params.dominance + (Math.random() - 0.5) * 0.02, 0.1, 0.9);
                this.params.erratic = this.clamp(this.params.erratic + (Math.random() - 0.5) * 0.01, 0.0, 0.3);
                this.params.focus = this.clamp(this.params.focus + (Math.random() - 0.5) * 0.01, 0.5, 1.0);
            }
        }
        
        // v6.0: Get emotional state label
        getEmotionalState() {
            const { arousal, valence, dominance } = this.params;
            if (arousal > 0.7 && valence > 0.6) return 'Excited';
            if (arousal > 0.7 && valence < 0.4) return 'Anxious';
            if (arousal < 0.3 && valence > 0.6) return 'Calm';
            if (arousal < 0.3 && valence < 0.4) return 'Depressed';
            if (dominance > 0.7) return 'Confident';
            if (dominance < 0.3) return 'Submissive';
            return 'Neutral';
        }
        
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }
        
        setSimulationMode(mode) {
            this.simulationMode = mode;
        }
        
        // v6.0: Observer pattern for UI updates
        onUpdate(fn) { this._observers.push(fn); }
        _notify() { this._observers.forEach(fn => fn(this.params)); }
    }
    
    global.LimbicBridge = LimbicBridge;
})(window);