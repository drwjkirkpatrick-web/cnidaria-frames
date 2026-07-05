/**
 * limbic-bridge.js - Bridge to Hermes limbic system
 *
 * Simulates connection to Hermes limbic system for emotional state.
 * In a full implementation, this would connect to the actual Hermes system.
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
        }
        
        // Connect to the limbic system (simulated)
        connect() {
            this.isConnected = true;
            console.log('Limbic bridge connected (simulated)');
            return Promise.resolve();
        }
        
        // Disconnect from the limbic system
        disconnect() {
            this.isConnected = false;
            console.log('Limbic bridge disconnected');
        }
        
        // Get current limbic parameters
        getParams() {
            // In simulation mode, generate dynamic parameters
            if (this.simulationMode) {
                this.updateSimulation();
            }
            
            return {...this.params};
        }
        
        // Update simulation parameters
        updateSimulation() {
            const now = Date.now();
            // Only update every 100ms
            if (now - this.lastUpdate < 100) return;
            this.lastUpdate = now;
            
            // Slowly vary parameters for a natural effect
            this.params.arousal = this.clamp(this.params.arousal + (Math.random() - 0.5) * 0.02, 0.1, 0.9);
            this.params.valence = this.clamp(this.params.valence + (Math.random() - 0.5) * 0.02, 0.1, 0.9);
            this.params.dominance = this.clamp(this.params.dominance + (Math.random() - 0.5) * 0.02, 0.1, 0.9);
            this.params.erratic = this.clamp(this.params.erratic + (Math.random() - 0.5) * 0.01, 0.0, 0.3);
            this.params.focus = this.clamp(this.params.focus + (Math.random() - 0.5) * 0.01, 0.5, 1.0);
        }
        
        // Clamp a value between min and max
        clamp(value, min, max) {
            return Math.min(Math.max(value, min), max);
        }
        
        // Set simulation mode
        setSimulationMode(mode) {
            this.simulationMode = mode;
        }
    }
    
    // Export for use in other modules
    global.LimbicBridge = LimbicBridge;
    
})(window);