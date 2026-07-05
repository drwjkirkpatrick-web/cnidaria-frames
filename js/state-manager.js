/**
 * state-manager.js - State management for Cnidaria Frames
 *
 * Handles state transitions and provides a simple API for
 * changing the jellyfish's behavior.
 */

(function(global) {
    'use strict';
    
    class StateManager {
        constructor() {
            this.currentState = 'idle';
            this.previousState = null;
            this.stateStartTime = Date.now();
            this.stateDurations = {
                'idle': 5000,
                'active': 3000,
                'thinking': 4000,
                'success': 2000,
                'error': 2500,
                'sleeping': 8000
            };
        }
        
        getState() {
            return this.currentState;
        }
        
        setState(newState) {
            if (newState !== this.currentState) {
                this.previousState = this.currentState;
                this.currentState = newState;
                this.stateStartTime = Date.now();
                return true;
            }
            return false;
        }
        
        // Cycle to the next state
        nextState() {
            const states = ['idle', 'active', 'thinking', 'success', 'error', 'sleeping'];
            const currentIndex = states.indexOf(this.currentState);
            const nextIndex = (currentIndex + 1) % states.length;
            return this.setState(states[nextIndex]);
        }
        
        // Get time spent in current state (in seconds)
        getTimeInState() {
            return (Date.now() - this.stateStartTime) / 1000;
        }
        
        // Check if state has timed out
        isStateTimedOut() {
            const duration = this.stateDurations[this.currentState] || 5000;
            return this.getTimeInState() > duration / 1000;
        }
        
        // Reset to idle state
        reset() {
            this.setState('idle');
        }
    }
    
    // Export for use in other modules
    global.StateManager = StateManager;
    
})(window);