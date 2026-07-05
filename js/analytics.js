/**
 * analytics.js — Lightweight Session Analytics for Cnidaria Frames
 *
 * Tracks: state transitions, theme changes, interactions, food eaten,
 * predator encounters, and idle/active time. Provides a heatmap-style
 * summary view accessible via the settings panel.
 *
 * Data is kept in-memory only (no external tracking). Exported as a
 * simple HTML table on demand.
 */

(function(global) {
    'use strict';

    class SessionAnalytics {
        constructor() {
            this.startTime = Date.now();
            this.events = [];
            this.stateCounts = {};
            this.themeCounts = {};
            this.interactions = 0;
            this.foodEaten = 0;
            this.predatorEncounters = 0;
            this.idleMs = 0;
            this.lastActivity = Date.now();
            this.isIdle = false;
            this.idleTimer = null;
            this._trackIdle();
        }

        _trackIdle() {
            this.idleTimer = setInterval(() => {
                const now = Date.now();
                if (now - this.lastActivity > 2000) {
                    if (!this.isIdle) this.isIdle = true;
                    this.idleMs += 1000;
                } else {
                    this.isIdle = false;
                }
            }, 1000);
        }

        activity() {
            this.lastActivity = Date.now();
            this.interactions++;
        }

        logState(state) {
            this.stateCounts[state] = (this.stateCounts[state] || 0) + 1;
            this.events.push({ t: Date.now(), type: 'state', value: state });
            this.activity();
        }

        logTheme(theme) {
            this.themeCounts[theme] = (this.themeCounts[theme] || 0) + 1;
            this.events.push({ t: Date.now(), type: 'theme', value: theme });
            this.activity();
        }

        logFood() {
            this.foodEaten++;
            this.activity();
        }

        logPredator() {
            this.predatorEncounters++;
            this.activity();
        }

        getHeatmap() {
            const duration = Math.max(1, (Date.now() - this.startTime) / 1000);
            const active = Math.max(0, duration - this.idleMs / 1000);
            return {
                duration: Math.round(duration),
                activeTime: Math.round(active),
                idleTime: Math.round(this.idleMs / 1000),
                interactions: this.interactions,
                foodEaten: this.foodEaten,
                predatorEncounters: this.predatorEncounters,
                stateCounts: { ...this.stateCounts },
                themeCounts: { ...this.themeCounts }
            };
        }

        renderTable() {
            const data = this.getHeatmap();
            const stateRows = Object.entries(data.stateCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([s, c]) => `<tr><td style="text-transform:capitalize;">${s}</td><td>${c}</td></tr>`)
                .join('');

            return `
                <div style="margin-top:16px;font-size:12px;color:#aaddff;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#c8e6ff;">Session Stats</h3>
                    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
                        <tr><td style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Duration</td><td style="text-align:right;">${Math.floor(data.duration / 60)}m ${data.duration % 60}s</td></tr>
                        <tr><td style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Active Time</td><td style="text-align:right;">${Math.floor(data.activeTime / 60)}m ${data.activeTime % 60}s</td></tr>
                        <tr><td style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Interactions</td><td style="text-align:right;">${data.interactions}</td></tr>
                        <tr><td style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Food Eaten</td><td style="text-align:right;">${data.foodEaten}</td></tr>
                        <tr><td style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);">Predators</td><td style="text-align:right;">${data.predatorEncounters}</td></tr>
                    </table>
                    <h4 style="margin:0 0 6px;font-size:12px;color:#c8e6ff;">State Frequency</h4>
                    <table style="width:100%;border-collapse:collapse;font-size:11px;">
                        <thead><tr style="color:rgba(200,230,255,0.5);"><td style="padding:3px 0;">State</td><td style="text-align:right;">Count</td></tr></thead>
                        <tbody>${stateRows || '<tr><td colspan="2" style="color:rgba(200,230,255,0.35);">No state changes yet</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
        }

        exportJSON() {
            const data = this.getHeatmap();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cnidaria-analytics-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        }
    }

    global.SessionAnalytics = SessionAnalytics;
})(window);