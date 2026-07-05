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
                particles: 'medium', // low, medium, high
                motionSensitivity: 0.5,
                screensaver: true,
                reducedMotion: false,
                showFPS: false
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
                    </div>
                    <div class="cnidaria-settings-footer">
                        <span class="cnidaria-version">Cnidaria v1.1</span>
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
        }

        open() {
            if (this.isOpen) return;
            this.isOpen = true;
            this.dom.panel.classList.add('open');
            document.body.style.overflow = 'hidden';
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