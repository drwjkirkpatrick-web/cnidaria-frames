/**
 * settings-panel.js — Overlay Settings Panel for Cnidaria Frames
 *
 * Opens on long-press or 's' key. Provides:
 *  - Volume slider (ambient audio)
 *  - Particle count toggle (low/medium/high)
 *  - Motion sensitivity
 *  - Screensaver toggle
 *  - Reduced motion toggle
 */

(function(global) {
    'use strict';

    class SettingsPanel {
        constructor() {
            this.isOpen = false;
            this.settings = {
                volume: 0.15,
                particles: 'medium',
                motionSensitivity: 0.5,
                screensaver: true,
                reducedMotion: false,
                showFPS: false,
                theme: 'deep',
                voice: false,
                predators: true
            };
            this._load();
            this._buildDOM();
            this._bindEvents();
        }

        _buildDOM() {
            if (document.getElementById('cnidariaSettings')) return;

            const panel = document.createElement('div');
            panel.id = 'cnidariaSettings';
            panel.className = 'cnidaria-settings';
            panel.setAttribute('role', 'dialog');
            panel.setAttribute('aria-label', 'Settings');
            panel.innerHTML = `
                <div class="cnidaria-settings-backdrop"></div>
                <div class="cnidaria-settings-content">
                    <div class="cnidaria-settings-header">
                        <h2>Settings</h2>
                        <button class="cnidaria-settings-close" aria-label="Close settings">×</button>
                    </div>
                    <div class="cnidaria-settings-body">
                        <label class="cnidaria-setting-row">
                            <span>Ambient Volume</span>
                            <input type="range" id="setting-volume" min="0" max="1" step="0.05" value="${this.settings.volume}">
                        </label>
                        <label class="cnidaria-setting-row">
                            <span>Particles</span>
                            <select id="setting-particles">
                                <option value="low" ${this.settings.particles==='low'?'selected':''}>Low</option>
                                <option value="medium" ${this.settings.particles==='medium'?'selected':''}>Medium</option>
                                <option value="high" ${this.settings.particles==='high'?'selected':''}>High</option>
                            </select>
                        </label>
                        <label class="cnidaria-setting-row">
                            <span>Theme</span>
                            <select id="setting-theme">
                                <option value="deep" ${this.settings.theme==='deep'?'selected':''}>Deep Ocean</option>
                                <option value="arctic" ${this.settings.theme==='arctic'?'selected':''}>Arctic</option>
                                <option value="reef" ${this.settings.theme==='reef'?'selected':''}>Coral Reef</option>
                                <option value="abyss" ${this.settings.theme==='abyss'?'selected':''}>Abyss</option>
                            </select>
                        </label>
                        <label class="cnidaria-setting-row">
                            <span>Motion Sensitivity</span>
                            <input type="range" id="setting-motion" min="0" max="1" step="0.1" value="${this.settings.motionSensitivity}">
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Screensaver</span>
                            <input type="checkbox" id="setting-screensaver" ${this.settings.screensaver?'checked':''}>
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Show FPS</span>
                            <input type="checkbox" id="setting-fps" ${this.settings.showFPS?'checked':''}>
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Reduced Motion</span>
                            <input type="checkbox" id="setting-reduced" ${this.settings.reducedMotion?'checked':''}>
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Voice Commands</span>
                            <input type="checkbox" id="setting-voice" ${this.settings.voice?'checked':''}>
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Predators</span>
                            <input type="checkbox" id="setting-predators" ${this.settings.predators!==false?'checked':''}>
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Storm Mode</span>
                            <input type="checkbox" id="setting-storm">
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Breathing Guide</span>
                            <input type="checkbox" id="setting-breathing">
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <label class="cnidaria-setting-row cnidaria-toggle">
                            <span>Mic Reactivity</span>
                            <input type="checkbox" id="setting-mic">
                            <span class="cnidaria-toggle-knob"></span>
                        </label>
                        <div class="cnidaria-setting-row">
                            <span>Export Analytics</span>
                            <button id="setting-export" style="padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);color:#c8e6ff;font-size:12px;cursor:pointer;">Download JSON</button>
                        </div>
                        <div class="cnidaria-setting-row">
                            <span>Changelog</span>
                            <button id="setting-changelog" style="padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);color:#c8e6ff;font-size:12px;cursor:pointer;">View</button>
                        </div>
                        <div id="badges-container"></div>
                        <div id="analytics-container"></div>
                    </div>
                    <div class="cnidaria-settings-footer">
                        <span class="cnidaria-version">Cnidaria v1.2</span>
                    </div>
                </div>
            `;
            document.body.appendChild(panel);

            this.dom = {
                panel,
                backdrop: panel.querySelector('.cnidaria-settings-backdrop'),
                closeBtn: panel.querySelector('.cnidaria-settings-close'),
                volume: panel.querySelector('#setting-volume'),
                particles: panel.querySelector('#setting-particles'),
                motion: panel.querySelector('#setting-motion'),
                screensaver: panel.querySelector('#setting-screensaver'),
                fps: panel.querySelector('#setting-fps'),
                reduced: panel.querySelector('#setting-reduced')
            };
        }

        _bindEvents() {
            document.addEventListener('cnidaria:longpress', () => this.open());
            document.addEventListener('cnidaria:opensettings', () => this.open());

            this.dom.backdrop.addEventListener('click', () => this.close());
            this.dom.closeBtn.addEventListener('click', () => this.close());

            this.dom.volume.addEventListener('input', e => {
                this.settings.volume = parseFloat(e.target.value);
                this._emit('volumechange', this.settings.volume);
                this._save();
            });
            this.dom.particles.addEventListener('change', e => {
                this.settings.particles = e.target.value;
                this._emit('particlechange', this.settings.particles);
                this._save();
            });
            this.dom.motion.addEventListener('input', e => {
                this.settings.motionSensitivity = parseFloat(e.target.value);
                this._emit('motionchange', this.settings.motionSensitivity);
                this._save();
            });
            this.dom.screensaver.addEventListener('change', e => {
                this.settings.screensaver = e.target.checked;
                this._emit('screensaverchange', this.settings.screensaver);
                this._save();
            });
            this.dom.fps.addEventListener('change', e => {
                this.settings.showFPS = e.target.checked;
                this._emit('fpschange', this.settings.showFPS);
                this._save();
            });
            this.dom.reduced.addEventListener('change', e => {
                this.settings.reducedMotion = e.target.checked;
                this._emit('reducedmotionchange', this.settings.reducedMotion);
                this._save();
            });

            // Theme selector
            const themeSelect = this.dom.panel.querySelector('#setting-theme');
            if (themeSelect) {
                themeSelect.addEventListener('change', e => {
                    this.settings.theme = e.target.value;
                    this._emit('themechange', this.settings.theme);
                    this._save();
                });
            }

            // Voice toggle
            const voiceCb = this.dom.panel.querySelector('#setting-voice');
            if (voiceCb) {
                voiceCb.addEventListener('change', e => {
                    this.settings.voice = e.target.checked;
                    this._emit('voicechange', this.settings.voice);
                    this._save();
                });
            }

            // Predator toggle
            const predatorCb = this.dom.panel.querySelector('#setting-predators');
            if (predatorCb) {
                predatorCb.addEventListener('change', e => {
                    this.settings.predators = e.target.checked;
                    this._emit('predatorchange', this.settings.predators);
                    this._save();
                });
            }

            // Fullscreen toggle
            const fsCb = this.dom.panel.querySelector('#setting-fullscreen');
            if (fsCb) {
                fsCb.addEventListener('change', e => {
                    if (e.target.checked) {
                        document.dispatchEvent(new CustomEvent('cnidaria:fullscreen:request'));
                    } else {
                        document.dispatchEvent(new CustomEvent('cnidaria:fullscreen:exit'));
                    }
                });
            }

            // v1.3 settings
            const stormCb = this.dom.panel.querySelector('#setting-storm');
            if (stormCb) {
                stormCb.addEventListener('change', e => {
                    this._emit('stormchange', e.target.checked);
                });
            }
            const breathingCb = this.dom.panel.querySelector('#setting-breathing');
            if (breathingCb) {
                breathingCb.addEventListener('change', e => {
                    this._emit('breathingchange', e.target.checked);
                });
            }
            const micCb = this.dom.panel.querySelector('#setting-mic');
            if (micCb) {
                micCb.addEventListener('change', e => {
                    this._emit('micchange', e.target.checked);
                });
            }
            const exportBtn = this.dom.panel.querySelector('#setting-export');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this._emit('exportanalytics', {});
                });
            }
            const changelogBtn = this.dom.panel.querySelector('#setting-changelog');
            if (changelogBtn) {
                changelogBtn.addEventListener('click', () => {
                    this._emit('showchangelog', {});
                });
            }

            // Analytics rendering hook
            this._renderAnalytics = () => {
                const container = this.dom.panel.querySelector('#analytics-container');
                const badgesContainer = this.dom.panel.querySelector('#badges-container');
                if (badgesContainer && typeof Achievements !== 'undefined') {
                    const ach = new Achievements();
                    badgesContainer.innerHTML = ach.renderBadges();
                }
                if (!container) return;
                if (typeof SessionAnalytics === 'undefined') return;
                const analytics = new SessionAnalytics();
                container.innerHTML = analytics.renderTable();
            };
        }

        open() {
            if (this.isOpen) return;
            this.isOpen = true;
            this.dom.panel.classList.add('open');
            document.body.style.overflow = 'hidden';
            if (this._renderAnalytics) this._renderAnalytics();
        }

        close() {
            if (!this.isOpen) return;
            this.isOpen = false;
            this.dom.panel.classList.remove('open');
            document.body.style.overflow = '';
        }

        toggle() {
            this.isOpen ? this.close() : this.open();
        }

        getSettings() {
            return { ...this.settings };
        }

        _emit(type, value) {
            document.dispatchEvent(new CustomEvent('cnidaria:setting:' + type, { detail: value }));
        }

        _save() {
            try { localStorage.setItem('cnidaria_settings', JSON.stringify(this.settings)); }
            catch (e) { /* storage may be blocked */ }
        }

        _load() {
            try {
                const raw = localStorage.getItem('cnidaria_settings');
                if (raw) Object.assign(this.settings, JSON.parse(raw));
            } catch (e) { /* ignore */ }
        }
    }

    global.SettingsPanel = SettingsPanel;
})(window);