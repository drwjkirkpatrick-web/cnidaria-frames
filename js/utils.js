/**
 * utils.js - Utility functions for Cnidaria Frames
 */

(function(global) {
    'use strict';
    
    // Utility functions
    const Utils = {
        // Clamp a value between min and max
        clamp: function(value, min, max) {
            return Math.min(Math.max(value, min), max);
        },
        
        // Linear interpolation
        lerp: function(a, b, t) {
            return a + (b - a) * t;
        },
        
        // Map a value from one range to another
        map: function(value, inMin, inMax, outMin, outMax) {
            return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
        },
        
        // Generate a random number between min and max
        random: function(min, max) {
            return Math.random() * (max - min) + min;
        },
        
        // Generate a random integer between min and max (inclusive)
        randomInt: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },
        
        // Convert degrees to radians
        degToRad: function(degrees) {
            return degrees * Math.PI / 180;
        },
        
        // Convert radians to degrees
        radToDeg: function(radians) {
            return radians * 180 / Math.PI;
        },
        
        // Get a random color
        randomColor: function() {
            const r = this.randomInt(50, 255);
            const g = this.randomInt(50, 255);
            const b = this.randomInt(50, 255);
            return { r, g, b };
        },
        
        // Get a color based on a value (0-1)
        getColorFromValue: function(value) {
            // Map value to hue (0-360)
            const hue = value * 360;
            // Convert HSV to RGB (simplified)
            const s = 0.8;
            const v = 0.9;
            
            const c = v * s;
            const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
            const m = v - c;
            
            let r, g, b;
            if (hue < 60) {
                r = c; g = x; b = 0;
            } else if (hue < 120) {
                r = x; g = c; b = 0;
            } else if (hue < 180) {
                r = 0; g = c; b = x;
            } else if (hue < 240) {
                r = 0; g = x; b = c;
            } else if (hue < 300) {
                r = x; g = 0; b = c;
            } else {
                r = c; g = 0; b = x;
            }
            
            return {
                r: Math.round((r + m) * 255),
                g: Math.round((g + m) * 255),
                b: Math.round((b + m) * 255)
            };
        }
    };
    
    // Export for use in other modules
    global.Utils = Utils;
    
})(window);