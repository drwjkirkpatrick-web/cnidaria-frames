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
                .map(([s, c]) => `&lt;tr&gt;&lt;td style=\"text-transform:capitalize;\"&gt;${s}&lt;/td&gt;&lt;td&gt;${c}&lt;/td&gt;&lt;/tr&gt;`)
                .join('');

            return `
                &lt;div style=\"margin-top:16px;font-size:12px;color:#aaddff;\"&gt;
                    &lt;h3 style=\"margin:0 0 8px;font-size:14px;color:#c8e6ff;\"&gt;Session Stats&lt;/h3&gt;
                    &lt;table style=\"width:100%;border-collapse:collapse;margin-bottom:12px;\"&gt;
                        &lt;tr&gt;&lt;td style=\"padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);\"&gt;Duration&lt;/td&gt;&lt;td style=\"text-align:right;\"&gt;${Math.floor(data.duration / 60)}m ${data.duration % 60}s&lt;/td&gt;&lt;/tr&gt;
                        &lt;tr&gt;&lt;td style=\"padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);\"&gt;Active Time&lt;/td&gt;&lt;td style=\"text-align:right;\"&gt;${Math.floor(data.activeTime / 60)}m ${data.activeTime % 60}s&lt;/td&gt;&lt;/tr&gt;
                        &lt;tr&gt;&lt;td style=\"padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);\"&gt;Interactions&lt;/td&gt;&lt;td style=\"text-align:right;\"&gt;${data.interactions}&lt;/td&gt;&lt;/tr&gt;
                        &lt;tr&gt;&lt;td style=\"padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);\"&gt;Food Eaten&lt;/td&gt;&lt;td style=\"text-align:right;\"&gt;${data.foodEaten}&lt;/td&gt;&lt;/tr&gt;
                        &lt;tr&gt;&lt;td style=\"padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.05);\"&gt;Predators&lt;/td&gt;&lt;td style=\"text-align:right;\"&gt;${data.predatorEncounters}&lt;/td&gt;&lt;/tr&gt;
                    &lt;/table&gt;
                    &lt;h4 style=\"margin:0 0 6px;font-size:12px;color:#c8e6ff;\"&gt;State Frequency&lt;/h4&gt;
                    &lt;table style=\"width:100%;border-collapse:collapse;font-size:11px;\"&gt;
                        &lt;thead&gt;&lt;tr style=\"color:rgba(200,230,255,0.5);\"&gt;&lt;td style=\"padding:3px 0;\"&gt;State&lt;/td&gt;&lt;td style=\"text-align:right;\"&gt;Count&lt;/td&gt;&lt;/tr&gt;&lt;/thead&gt;
                        &lt;tbody&gt;${stateRows || '&lt;tr&gt;&lt;td colspan=\"2\" style=\"color:rgba(200,230,255,0.35);\"&gt;No state changes yet&lt;/td&gt;&lt;/tr&gt;'}
                        &lt;/tbody&gt;
                    &lt;/table&gt;
                &lt;/div&gt;
            `;
        }
    }

    global.SessionAnalytics = SessionAnalytics;
})(window);