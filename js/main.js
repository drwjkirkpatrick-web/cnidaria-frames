/**
 * main.js — Cnidaria Frames Main Controller
 *
 * Initializes the jellyfish agent, handles animation loop,
 * and manages user interactions.
 */

(function() {
    'use strict';
    
    // Canvas setup
    const canvas = document.getElementById('jellyfishCanvas');
    const ctx = canvas.getContext('2d');
    
    // UI elements
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const modeToggle = document.getElementById('modeToggle');
    
    // Components
    let jellyfish;
    let stateManager;
    let limbicBridge;
    
    // Animation state
    let lastTime = 0;
    let animationId = null;
    
    // Initialize the application
    function init() {
        // Set up canvas
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Initialize components
        stateManager = new StateManager();
        limbicBridge = new LimbicBridge();
        limbicBridge.connect();
        
        // Create jellyfish in the center of the canvas
        jellyfish = new Jellyfish(canvas.width / 2, canvas.height / 2, 1);
        
        // Set up UI event listeners
        modeToggle.addEventListener('click', toggleMode);
        
        // Start animation loop
        requestAnimationFrame(animate);
        
        // Set initial status
        updateStatus('ready');
    }
    
    // Initialize canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Reposition jellyfish if it exists
        if (jellyfish) {
            jellyfish.x = canvas.width / 2;
            jellyfish.y = canvas.height / 2;
        }
    }
    
    // Animation loop
    function animate(time) {
        // Calculate delta time in seconds
        const dt = Math.min((time - lastTime) / 1000, 0.1); // Cap at 100ms
        lastTime = time;
        
        // Clear canvas with a dark blue background
        ctx.fillStyle = '#000a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Get current state
        const currentState = stateManager.getState();
        
        // Get limbic parameters
        const limbicParams = limbicBridge.getParams();
        
        // Update and draw jellyfish
        if (jellyfish) {
            jellyfish.setState(currentState);
            jellyfish.update(dt, time / 1000, limbicParams);
            jellyfish.draw(ctx);
        }
        
        // Continue animation loop
        animationId = requestAnimationFrame(animate);
    }
    
    // Update status indicator
    function updateStatus(text) {
        statusText.textContent = text;
        statusIndicator.classList.remove('hidden');
        
        // Hide status after 3 seconds
        setTimeout(() => {
            statusIndicator.classList.add('hidden');
        }, 3000);
    }
    
    // Toggle jellyfish mode
    function toggleMode() {
        if (!stateManager) return;
        
        // Cycle to next state
        stateManager.nextState();
        const newState = stateManager.getState();
        updateStatus(newState);
    }
    
    // Handle page visibility changes
    function handleVisibilityChange() {
        if (document.hidden) {
            // Pause animation when tab is hidden
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            // Resume animation when tab is visible
            lastTime = performance.now();
            animationId = requestAnimationFrame(animate);
        }
    }
    
    // Set up visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Initialize when page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Expose functions for debugging (optional)
    window.Cnidaria = {
        jellyfish: jellyfish,
        stateManager: stateManager,
        limbicBridge: limbicBridge,
        updateStatus: updateStatus
    };
    
})();