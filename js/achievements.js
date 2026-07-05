/**
 * achievements.js — Achievement / Badge System for Cnidaria Frames
 *
 * Tracks accomplishments in localStorage. Awards badges for:
 *   first_food, first_predator, state_master (all states), theme_traveler,
 *   screenshot_artist, voice_commander, session_veteran (5min+), storm_survivor
 */

(function(global) {
    'use strict';

    const BADGES = {
        first_food: { label: 'First Bite', desc: 'Fed a jellyfish', icon: '🦐' },
        first_predator: { label: 'Close Call', desc: 'Survived a predator', icon: '🦈' },
        state_master: { label: 'State Master', desc: 'Visited all 6 states', icon: '🎛️' },
        theme_traveler: { label: 'Ocean Explorer', desc: 'Tried all 4 themes', icon: '🌊' },
        screenshot_artist: { label: 'Shutterbug', desc: 'Took a screenshot', icon: '📸' },
        voice_commander: { label: 'Voice Pilot', desc: 'Used a voice command', icon: '🎙️' },
        session_veteran: { label: 'Deep Diver', desc: 'Session over 5 minutes', icon: '🤿' },
        storm_survivor: { label: 'Storm Survivor', desc: 'Weathered a storm', icon: '⛈️' }
    };

    class Achievements {
        constructor() {
            this.unlocked = new Set();
            this.stateSet = new Set();
            this.themeSet = new Set();
            this._load();
        }

        unlock(id) {
            if (this.unlocked.has(id)) return false;
            this.unlocked.add(id);
            this._save();
            document.dispatchEvent(new CustomEvent('cnidaria:achievement', {
                detail: { id, ...BADGES[id] }
            }));
            return true;
        }

        checkState(state) {
            this.stateSet.add(state);
            if (this.stateSet.size >= 6) this.unlock('state_master');
        }

        checkTheme(theme) {
            this.themeSet.add(theme);
            if (this.themeSet.size >= 4) this.unlock('theme_traveler');
        }

        checkFood() { this.unlock('first_food'); }
        checkPredator() { this.unlock('first_predator'); }
        checkScreenshot() { this.unlock('screenshot_artist'); }
        checkVoice() { this.unlock('voice_commander'); }
        checkStorm() { this.unlock('storm_survivor'); }

        checkSessionDuration(seconds) {
            if (seconds >= 300) this.unlock('session_veteran');
        }

        getList() {
            return Object.entries(BADGES).map(([id, b]) => ({
                id, ...b, unlocked: this.unlocked.has(id)
            }));
        }

        _save() {
            try {
                localStorage.setItem('cnidaria_badges', JSON.stringify([...this.unlocked]));
            } catch (e) {}
        }

        _load() {
            try {
                const raw = localStorage.getItem('cnidaria_badges');
                if (raw) this.unlocked = new Set(JSON.parse(raw));
            } catch (e) {}
        }

        renderBadges() {
            const list = this.getList();
            const rows = list.map(b => `
                <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05);opacity:${b.unlocked?1:0.3};">
                    <span style="font-size:18px;">${b.icon}</span>
                    <div style="flex:1;">
                        <div style="font-size:13px;color:#c8e6ff;">${b.label}</div>
                        <div style="font-size:11px;color:rgba(200,230,255,0.5);">${b.desc}</div>
                    </div>
                    <span style="font-size:11px;color:${b.unlocked?'#4aff88':'rgba(200,230,255,0.3)'};">${b.unlocked?'Unlocked':'Locked'}</span>
                </div>
            `).join('');
            return `
                <div style="margin-top:16px;font-size:12px;">
                    <h3 style="margin:0 0 8px;font-size:14px;color:#c8e6ff;">Badges</h3>
                    ${rows}
                </div>
            `;
        }
    }

    global.Achievements = Achievements;
})(window);