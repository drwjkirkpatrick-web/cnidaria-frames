/**
 * lifecycle.js — Jellyfish Lifecycle (grow then split) for Cnidaria Frames
 *
 * Over the session, jellyfish slowly grow. Once a threshold is reached,
 * they split into two smaller jellyfish (mitosis-style) and reset size.
 * Tracked via SessionAnalytics.
 */

(function(global) {
    'use strict';

    class Lifecycle {
        constructor(jellyfishSwarm) {
            this.swarm = jellyfishSwarm;
            this.splitThreshold = 2.5; // scale multiplier
            this.growthRate = 0.0003;  // per frame
            this.splits = 0;
        }

        update(dt) {
            for (const jf of this.swarm) {
                // Only grow primary
                if (jf !== this.swarm[0]) continue;

                jf.scale += this.growthRate * dt;
                if (jf.scale >= this.splitThreshold) {
                    this._split(jf);
                }
            }
        }

        _split(parent) {
            parent.scale = parent.baseScale;
            const child = new Jellyfish(
                parent.x + (Math.random() - 0.5) * 40,
                parent.y + (Math.random() - 0.5) * 40,
                parent.baseScale * 0.6
            );
            if (parent.personality) {
                child.personality = new Personality(parent.personality.type || 'default');
                child.personality.apply(child);
            }
            this.swarm.push(child);
            this.splits++;
            document.dispatchEvent(new CustomEvent('cnidaria:split', {
                detail: { parent: parent.id, child: child.id }
            }));
        }
    }

    global.Lifecycle = Lifecycle;
})(window);