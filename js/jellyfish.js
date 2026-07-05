/**
 * jellyfish.js — The Cnidaria Agent
 *
 * Renders a procedural jellyfish with pulsing animation,
 * tentacle movement, and color variations based on state.
 *
 * States: idle, active, thinking, success, error, sleeping
 */

(function(global) {
    'use strict';

    class Jellyfish {
        constructor(x, y, scale = 1) {
            this.x = x;
            this.y = y;
            this.scale = scale;
            
            // Animation properties
            this.pulsePhase = 0;
            this.tentaclePhase = 0;
            this.floatPhase = 0;
            
            // State tracking
            this.state = 'idle';
            this.stateTime = 0;
            
            // Size parameters
            this.bodyRadius = 30 * scale;
            this.tentacleCount = 8;
            this.tentacleLength = 80 * scale;
            
            // Color properties
            this.color = {
                r: 100,
                g: 150,
                b: 255
            };
            
            // Transparency for pulsing effect
            this.alpha = 0.8;
        }
        
        setState(newState) {
            if (newState !== this.state) {
                this.state = newState;
                this.stateTime = 0;
            }
        }
        
        update(dt, time) {
            this.stateTime += dt;
            
            // Update animation phases
            this.pulsePhase += dt * 2;
            this.tentaclePhase += dt * 1.5;
            this.floatPhase += dt * 0.5;
            
            // Apply state-specific behaviors
            switch(this.state) {
                case 'active':
                    this.pulsePhase += dt * 3;
                    this.color = { r: 100, g: 200, b: 255 };
                    break;
                case 'thinking':
                    this.pulsePhase += dt * 1;
                    this.color = { r: 150, g: 150, b: 255 };
                    break;
                case 'success':
                    this.pulsePhase += dt * 4;
                    this.color = { r: 100, g: 255, b: 150 };
                    break;
                case 'error':
                    this.pulsePhase += dt * 6;
                    this.color = { r: 255, g: 100, b: 100 };
                    break;
                case 'sleeping':
                    this.pulsePhase += dt * 0.5;
                    this.color = { r: 150, g: 150, b: 200 };
                    break;
                default: // idle
                    this.color = { r: 100, g: 150, b: 255 };
            }
            
            // Apply floating motion
            this.y = this.y + Math.sin(this.floatPhase) * 0.5;
        }
        
        draw(ctx) {
            // Save context
            ctx.save();
            
            // Apply transparency
            ctx.globalAlpha = this.alpha;
            
            // Draw jellyfish body (pulsing ellipse)
            const pulse = Math.sin(this.pulsePhase) * 0.2 + 1;
            const bodyWidth = this.bodyRadius * 1.5 * pulse;
            const bodyHeight = this.bodyRadius * pulse;
            
            // Create gradient for body
            const gradient = ctx.createRadialGradient(
                this.x, this.y - bodyHeight * 0.3, 0,
                this.x, this.y, bodyWidth * 0.8
            );
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.9)`);
            gradient.addColorStop(1, `rgba(${this.color.r * 0.5}, ${this.color.g * 0.5}, ${this.color.b * 0.8}, 0.3)`);
            
            ctx.fillStyle = gradient;
            
            // Draw body
            ctx.beginPath();
            ctx.ellipse(
                this.x, this.y,
                bodyWidth, bodyHeight,
                0, 0, Math.PI * 2
            );
            ctx.fill();
            
            // Draw tentacles
            ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.7)`;
            ctx.lineWidth = 2 * this.scale;
            ctx.lineCap = 'round';
            
            for (let i = 0; i < this.tentacleCount; i++) {
                const angle = (i / this.tentacleCount) * Math.PI * 2;
                const tentaclePhase = this.tentaclePhase + angle;
                
                // Tentacle sway
                const sway = Math.sin(tentaclePhase) * 20 * this.scale;
                
                ctx.beginPath();
                ctx.moveTo(this.x + Math.cos(angle) * bodyWidth * 0.8, this.y + bodyHeight);
                
                // Draw curved tentacle with sway
                for (let j = 1; j <= 10; j++) {
                    const segmentLength = this.tentacleLength / 10;
                    const segmentY = this.y + bodyHeight + segmentLength * j;
                    const segmentX = this.x + Math.cos(angle) * bodyWidth * 0.8 + 
                                   Math.sin(tentaclePhase + j * 0.5) * sway * (j / 10);
                    
                    ctx.lineTo(segmentX, segmentY);
                }
                
                ctx.stroke();
            }
            
            // Restore context
            ctx.restore();
        }
    }
    
    // Export for use in other modules
    global.Jellyfish = Jellyfish;
    
})(window);