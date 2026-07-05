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
                predators: true,
                jellyfishPrompt: '',
                jellyfishStyle: 'vector',
                jellyfishLighting: 'biolum',
                imageModel: 'flux-2-klein',
                hue: 220,
                saturation: 60,
                lightness: 55,
                fullscreen: false,
                personality: 'majestic',
                timing: 'normal',
                pacingEnabled: true,
                imageScale: 1.0,
                imageOpacity: 1.0,
                imageShadow: false,
                remedy: 'pulsatilla',
                thoughtText: '',
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
                        <!-- Image Generation Settings (v4.0) -->
                        <div style="padding:12px 0;border-top:1px solid rgba(255,255,255,0.08);margin-top:4px;">
                            <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">JELLYFISH GENERATOR</div>
                            <label class="cnidaria-setting-row" style="flex-direction:column;align-items:flex-start;gap:6px;">
                                <span>Prompt</span>
                                <input type="text" id="setting-prompt" placeholder="e.g. crystal moon" value="${this.settings.jellyfishPrompt}" style="width:100%;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.1);background:rgba(0,0,0,0.3);color:#c8e6ff;font-size:13px;">
                            </label>
                            <label class="cnidaria-setting-row">
                                <span>Style</span>
                                <select id="setting-style">
                                    <option value="vector" ${this.settings.jellyfishStyle==='vector'?'selected':''}>Vector Illustration</option>
                                    <option value="animated" ${this.settings.jellyfishStyle==='animated'?'selected':''}>Animation Cel</option>
                                    <option value="neon" ${this.settings.jellyfishStyle==='neon'?'selected':''}>Neon Glow</option>
                                    <option value="botanical" ${this.settings.jellyfishStyle==='botanical'?'selected':''}>Botanical</option>
                                    <option value="crystal" ${this.settings.jellyfishStyle==='crystal'?'selected':''}>Crystal Geo</option>
                                    <option value="organic" ${this.settings.jellyfishStyle==='organic'?'selected':''}>Organic Ink</option>
                                </select>
                            </label>
                            <label class="cnidaria-setting-row">
                                <span>Lighting</span>
                                <select id="setting-lighting">
                                    <option value="biolum" ${this.settings.jellyfishLighting==='biolum'?'selected':''}>Bioluminescent</option>
                                    <option value="ambient" ${this.settings.jellyfishLighting==='ambient'?'selected':''}>Ambient Caustic</option>
                                    <option value="neon_rim" ${this.settings.jellyfishLighting==='neon_rim'?'selected':''}>Neon Rim</option>
                                    <option value="soft" ${this.settings.jellyfishLighting==='soft'?'selected':''}>Soft Diffused</option>
                                    <option value="dark" ${this.settings.jellyfishLighting==='dark'?'selected':''}>Dark Silhouette</option>
                                </select>
                            </label>
                            <label class="cnidaria-setting-row">
                                <span>Model</span>
                                <select id="setting-model">
                                    <optgroup label="FLUX">
                                        <option value="flux-2-klein" ${this.settings.imageModel==='flux-2-klein'?'selected':''}>FLUX 2 Klein — Fast, balanced</option>
                                        <option value="flux-2-dev" ${this.settings.imageModel==='flux-2-dev'?'selected':''}>FLUX 2 Dev — High quality</option>
                                        <option value="flux-2-pro" ${this.settings.imageModel==='flux-2-pro'?'selected':''}>FLUX 2 Pro — Best quality</option>
                                        <option value="flux-2-schnell" ${this.settings.imageModel==='flux-2-schnell'?'selected':''}>FLUX 2 Schnell — Ultra-fast</option>
                                        <option value="flux-2-fill" ${this.settings.imageModel==='flux-2-fill'?'selected':''}>FLUX 2 Fill — Inpainting</option>
                                        <option value="flux-2-canny" ${this.settings.imageModel==='flux-2-canny'?'selected':''}>FLUX 2 Canny — Edge-guided</option>
                                        <option value="flux-2-depth" ${this.settings.imageModel==='flux-2-depth'?'selected':''}>FLUX 2 Depth — Depth-guided</option>
                                    </optgroup>
                                    <optgroup label="Text & Brand">
                                        <option value="ideogram-2" ${this.settings.imageModel==='ideogram-2'?'selected':''}>Ideogram 2 — Typography + vectors</option>
                                        <option value="ideogram-2-turbo" ${this.settings.imageModel==='ideogram-2-turbo'?'selected':''}>Ideogram 2 Turbo — Fast 4K</option>
                                        <option value="recraft-3" ${this.settings.imageModel==='recraft-3'?'selected':''}>Recraft 3 — Brand-focused</option>
                                        <option value="recraft-3-svg" ${this.settings.imageModel==='recraft-3-svg'?'selected':''}>Recraft 3 SVG — Native vector</option>
                                    </optgroup>
                                    <optgroup label="Specialty">
                                        <option value="pony-realism" ${this.settings.imageModel==='pony-realism'?'selected':''}>Pony Realism — Anime mixing</option>
                                        <option value="stable-cascade" ${this.settings.imageModel==='stable-cascade'?'selected':''}>Stable Cascade — 3-stage HQ</option>
                                        <option value="sdxl" ${this.settings.imageModel==='sdxl'?'selected':''}>SDXL 1.0 — Reliable</option>
                                        <option value="sdxl-turbo" ${this.settings.imageModel==='sdxl-turbo'?'selected':''}>SDXL Turbo — One-step fast</option>
                                        <option value="playground-2-5" ${this.settings.imageModel==='playground-2-5'?'selected':''}>Playground v2.5 — Photoreal</option>
                                        <option value="hyper-sd" ${this.settings.imageModel==='hyper-sd'?'selected':''}>Hyper-SD — Extreme speed</option>
                                    </optgroup>
                                </select>
                            </label>
                            <!-- Deluxe Color Selector -->
                            <div style="padding-top:8px;">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">COLOR OVERRIDE</div>
                                <label class="cnidaria-setting-row">
                                    <span>Hue</span>
                                    <input type="range" id="setting-hue" min="0" max="360" value="${this.settings.hue || 220}" style="width:120px;">
                                </label>
                                <label class="cnidaria-setting-row">
                                    <span>Sat</span>
                                    <input type="range" id="setting-saturation" min="0" max="100" value="${this.settings.saturation || 60}" style="width:120px;">
                                </label>
                                <label class="cnidaria-setting-row">
                                    <span>Light</span>
                                    <input type="range" id="setting-lightness" min="20" max="90" value="${this.settings.lightness || 55}" style="width:120px;">
                                </label>
                                <div id="colorPreview" style="
                                    width:32px;height:32px;border-radius:50%;
                                    border:2px solid rgba(255,255,255,0.15);
                                    margin-left:auto;
                                    background:hsl(${this.settings.hue || 220}, ${this.settings.saturation || 60}%, ${this.settings.lightness || 55}%);
                                "></div>
                                <button id="setting-clear-color" style="
                                    padding:4px 10px;border-radius:6px;
                                    border:1px solid rgba(255,255,255,0.1);
                                    background:rgba(0,0,0,0.3);
                                    color:rgba(200,230,255,0.6);
                                    font-size:11px;cursor:pointer;margin-top:6px;
                                ">Reset Color</button>
                            </div>
                            <!-- Animation Engine Controls -->
                            <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">ANIMATION ENGINE</div>
                                <label class="cnidaria-setting-row">
                                    <span>Personality</span>
                                    <select id="setting-personality">
                                        <option value="shy" ${this.settings.personality==='shy'?'selected':''}>Shy — subtle, gentle</option>
                                        <option value="curious" ${this.settings.personality==='curious'?'selected':''}>Curious — energetic, playful</option>
                                        <option value="majestic" ${this.settings.personality==='majestic'?'selected':''}>Majestic — balanced, grand</option>
                                    </select>
                                </label>
                                <label class="cnidaria-setting-row">
                                    <span>Timing</span>
                                    <select id="setting-timing">
                                        <option value="slow" ${this.settings.timing==='slow'?'selected':''}>Drifting — slow, meditative</option>
                                        <option value="normal" ${this.settings.timing==='normal'?'selected':''}>Flowing — balanced</option>
                                        <option value="energetic" ${this.settings.timing==='energetic'?'selected':''}>Pulsing — fast, lively</option>
                                    </select>
                                </label>
                                <label class="cnidaria-setting-row cnidaria-toggle">
                                    <span>Auto Mood Cycle</span>
                                    <input type="checkbox" id="setting-pacing" ${this.settings.pacingEnabled ? 'checked' : ''}>
                                    <span class="cnidaria-toggle-knob"></span>
                                </label>
                                <button id="setting-anticipation" style="
                                    padding:6px 14px;border-radius:6px;
                                    border:1px solid rgba(106,184,255,0.3);
                                    background:rgba(106,184,255,0.1);
                                    color:#6ab8ff;font-size:11px;cursor:pointer;margin-top:6px;
                                ">Trigger Anticipation</button>
                            </div>
                            <!-- Image Settings -->
                            <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">IMAGE SETTINGS</div>
                                <label class="cnidaria-setting-row">
                                    <span>Scale</span>
                                    <input type="range" id="setting-scale" min="0.3" max="2.0" step="0.05" value="${this.settings.imageScale || 1.0}" style="width:90px;">
                                    <span id="setting-scale-val" style="font-size:11px;color:rgba(200,230,255,0.5);width:28px;text-align:right;">${this.settings.imageScale || 1.0}</span>
                                </label>
                                <label class="cnidaria-setting-row">
                                    <span>Opacity</span>
                                    <input type="range" id="setting-opacity" min="0.1" max="1.0" step="0.05" value="${this.settings.imageOpacity || 1.0}" style="width:90px;">
                                    <span id="setting-opacity-val" style="font-size:11px;color:rgba(200,230,255,0.5);width:28px;text-align:right;">${this.settings.imageOpacity || 1.0}</span>
                                </label>
                                <label class="cnidaria-setting-row cnidaria-toggle">
                                    <span>Cast Shadow</span>
                                    <input type="checkbox" id="setting-shadow" ${this.settings.imageShadow ? 'checked' : ''}>
                                    <span class="cnidaria-toggle-knob"></span>
                                </label>
                            </div>
                            <!-- Remedy Personality Picker -->
                            <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">REMEDY PERSONALITY</div>
                                <label class="cnidaria-setting-row">
                                    <span>Remedy</span>
                                    <select id="setting-remedy">
                                        <option value="pulsatilla" ${this.settings.remedy==='pulsatilla'?'selected':''}>Pulsatilla — Gentle · Comfort-seeking</option>
                                        <option value="bryonia" ${this.settings.remedy==='bryonia'?'selected':''}>Bryonia — Still · Anchored</option>
                                        <option value="arsenicum" ${this.settings.remedy==='arsenicum'?'selected':''}>Arsenicum — Restless · Precise</option>
                                        <option value="natrum-muriaticum" ${this.settings.remedy==='natrum-muriaticum'?'selected':''}>Natrum Muriaticum — Contained · Deep</option>
                                        <option value="sulphur" ${this.settings.remedy==='sulphur'?'selected':''}>Sulphur — Warm · Philosophical</option>
                                        <option value="sepia" ${this.settings.remedy==='sepia'?'selected':''}>Sepia — Detached · Fluid</option>
                                        <option value="nux-vomica" ${this.settings.remedy==='nux-vomica'?'selected':''}>Nux Vomica — Driven · Tense</option>
                                        <option value="lachesis" ${this.settings.remedy==='lachesis'?'selected':''}>Lachesis — Intense · Overflowing</option>
                                        <option value="phosphorus" ${this.settings.remedy==='phosphorus'?'selected':''}>Phosphorus — Luminous · Curious</option>
                                        <option value="silica" ${this.settings.remedy==='silica'?'selected':''}>Silica — Delicate · Structured</option>
                                        <option value="calcarea-carbonica" ${this.settings.remedy==='calcarea-carbonica'?'selected':''}>Calcarea Carbonica — Grounded · Nurturing</option>
                                        <option value="causticum" ${this.settings.remedy==='causticum'?'selected':''}>Causticum — Sensitive · Empathic</option>
                                    </select>
                                </label>
                                <div id="remedy-desc" style="font-size:11px;color:rgba(200,230,255,0.4);margin-top:4px;line-height:1.4;">${this._getRemedyDesc(this.settings.remedy)}</div>
                                <div style="display:flex;gap:8px;margin-top:8px;">
                                    <button id="setting-session-start" style="
                                        flex:1;padding:6px 12px;border-radius:6px;
                                        border:1px solid rgba(106,184,255,0.3);
                                        background:rgba(106,184,255,0.1);
                                        color:#6ab8ff;font-size:11px;cursor:pointer;
                                    ">▶ Start Session</button>
                                    <button id="setting-session-stop" style="
                                        flex:1;padding:6px 12px;border-radius:6px;
                                        border:1px solid rgba(255,100,100,0.3);
                                        background:rgba(255,100,100,0.1);
                                        color:#ff8888;font-size:11px;cursor:pointer;display:none;
                                    ">⏹ Stop</button>
                                </div>
                                <div id="session-timer" style="font-size:13px;color:#6ab8ff;text-align:center;margin-top:6px;display:none;">00:00</div>
                            </div>
                            <!-- Hermes Limbic Bridge -->
                            <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">HERMES LIMBIC BRIDGE</div>
                                <div id="limbic-state" style="font-size:11px;color:#6ab8ff;margin-bottom:6px;">State: —</div>
                                <div style="margin-bottom:6px;">
                                    <div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(200,230,255,0.4);">
                                        <span>Arousal</span><span id="limbic-arousal-val">0.50</span>
                                    </div>
                                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:2px;">
                                        <div id="limbic-arousal-bar" style="height:100%;width:50%;background:linear-gradient(90deg,#6ab8ff,#aaddff);border-radius:2px;transition:width 0.3s;"></div>
                                    </div>
                                </div>
                                <div style="margin-bottom:6px;">
                                    <div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(200,230,255,0.4);">
                                        <span>Valence</span><span id="limbic-valence-val">0.50</span>
                                    </div>
                                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:2px;">
                                        <div id="limbic-valence-bar" style="height:100%;width:50%;background:linear-gradient(90deg,#88ff88,#aaddaa);border-radius:2px;transition:width 0.3s;"></div>
                                    </div>
                                </div>
                                <div style="margin-bottom:6px;">
                                    <div style="display:flex;justify-content:space-between;font-size:10px;color:rgba(200,230,255,0.4);">
                                        <span>Dominance</span><span id="limbic-dominance-val">0.50</span>
                                    </div>
                                    <div style="height:4px;background:rgba(255,255,255,0.08);border-radius:2px;margin-top:2px;">
                                        <div id="limbic-dominance-bar" style="height:100%;width:50%;background:linear-gradient(90deg,#ffaa66,#ffcc88);border-radius:2px;transition:width 0.3s;"></div>
                                    </div>
                                </div>
                            </div>
                            <!-- Thought Bubble -->
                            <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">THOUGHT BUBBLE</div>
                                <textarea id="setting-thought" placeholder="What is the jellyfish thinking?" style="
                                    width:100%;min-height:48px;background:rgba(0,0,0,0.3);
                                    border:1px solid rgba(255,255,255,0.1);border-radius:8px;
                                    color:#c8e6ff;font-size:12px;padding:8px;resize:vertical;
                                ">${this.settings.thoughtText || ''}</textarea>
                                <button id="setting-thought-send" style="
                                    margin-top:6px;padding:4px 12px;border-radius:6px;
                                    border:1px solid rgba(106,184,255,0.3);
                                    background:rgba(106,184,255,0.1);
                                    color:#6ab8ff;font-size:11px;cursor:pointer;
                                ">💭 Send Thought</button>
                            </div>
                            <!-- Saved Gallery -->
                            <div style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                                <div style="font-size:12px;color:rgba(200,230,255,0.5);letter-spacing:0.05em;margin-bottom:8px;">SAVED JELLYFISH</div>
                                <div id="setting-gallery"></div>
                                <div id="gallery-preview" style="
                                    display:none;align-items:center;gap:8px;
                                    padding:8px;background:rgba(0,0,0,0.2);
                                    border-radius:8px;margin-top:8px;
                                ">
                                    <img id="gallery-preview-img" src="" style="width:48px;height:48px;border-radius:6px;object-fit:cover;">
                                    <div style="font-size:11px;color:rgba(200,230,255,0.6);">
                                        <div id="gallery-preview-prompt"></div>
                                        <button id="gallery-preview-load" style="
                                            margin-top:4px;padding:3px 10px;border-radius:4px;
                                            border:1px solid rgba(106,184,255,0.3);
                                            background:rgba(106,184,255,0.1);
                                            color:#6ab8ff;font-size:11px;cursor:pointer;
                                        ">Load into Scene</button>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                        <span class="cnidaria-version">Cnidaria v4.0</span>
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

            // v3.0 image generation settings
            const promptInput = this.dom.panel.querySelector('#setting-prompt');
            if (promptInput) {
                promptInput.addEventListener('input', e => {
                    this.settings.jellyfishPrompt = e.target.value;
                    this._save();
                });
            }
            const styleSelect = this.dom.panel.querySelector('#setting-style');
            if (styleSelect) {
                styleSelect.addEventListener('change', e => {
                    this.settings.jellyfishStyle = e.target.value;
                    this._save();
                });
            }
            const lightingSelect = this.dom.panel.querySelector('#setting-lighting');
            if (lightingSelect) {
                lightingSelect.addEventListener('change', e => {
                    this.settings.jellyfishLighting = e.target.value;
                    this._save();
                });
            }
            const modelSelect = this.dom.panel.querySelector('#setting-model');
            if (modelSelect) {
                modelSelect.addEventListener('change', e => {
                    this.settings.imageModel = e.target.value;
                    this._save();
                });
            }

            // ─── Deluxe Color Selector wiring ───
            const hueInput = this.dom.panel.querySelector('#setting-hue');
            const satInput = this.dom.panel.querySelector('#setting-saturation');
            const litInput = this.dom.panel.querySelector('#setting-lightness');
            const colorPreview = this.dom.panel.querySelector('#colorPreview');
            const clearColorBtn = this.dom.panel.querySelector('#setting-clear-color');

            function updateColorPreview() {
                if (!colorPreview) return;
                const h = parseInt(hueInput ? hueInput.value : 220, 10);
                const s = parseInt(satInput ? satInput.value : 60, 10);
                const l = parseInt(litInput ? litInput.value : 55, 10);
                colorPreview.style.background = `hsl(${h}, ${s}%, ${l}%)`;
            }

            if (hueInput) {
                hueInput.addEventListener('input', e => {
                    this.settings.hue = parseInt(e.target.value, 10);
                    updateColorPreview();
                    this._emit('colorchange', { h: this.settings.hue, s: this.settings.saturation || 60, l: this.settings.lightness || 55 });
                    this._save();
                });
            }
            if (satInput) {
                satInput.addEventListener('input', e => {
                    this.settings.saturation = parseInt(e.target.value, 10);
                    updateColorPreview();
                    this._emit('colorchange', { h: this.settings.hue || 220, s: this.settings.saturation, l: this.settings.lightness || 55 });
                    this._save();
                });
            }
            if (litInput) {
                litInput.addEventListener('input', e => {
                    this.settings.lightness = parseInt(e.target.value, 10);
                    updateColorPreview();
                    this._emit('colorchange', { h: this.settings.hue || 220, s: this.settings.saturation || 60, l: this.settings.lightness });
                    this._save();
                });
            }
            if (clearColorBtn) {
                clearColorBtn.addEventListener('click', () => {
                    this.settings.hue = 220;
                    this.settings.saturation = 60;
                    this.settings.lightness = 55;
                    if (hueInput) hueInput.value = 220;
                    if (satInput) satInput.value = 60;
                    if (litInput) litInput.value = 55;
                    updateColorPreview();
                    this._emit('colorclear', {});
                    this._save();
                });
            }

            // ─── Saved Gallery wiring ───
            const galleryContainer = this.dom.panel.querySelector('#setting-gallery');
            const previewWrap = this.dom.panel.querySelector('#gallery-preview');
            const previewImg = this.dom.panel.querySelector('#gallery-preview-img');
            const previewPrompt = this.dom.panel.querySelector('#gallery-preview-prompt');
            const previewLoadBtn = this.dom.panel.querySelector('#gallery-preview-load');

            if (galleryContainer && typeof JellyfishImageGenerator !== 'undefined') {
                JellyfishImageGenerator.renderGallery(
                    galleryContainer,
                    (dataUrl, metadata) => {
                        // onLoad: show preview
                        if (previewImg) previewImg.src = dataUrl;
                        if (previewPrompt) previewPrompt.textContent = (metadata && metadata.prompt) ? metadata.prompt.substring(0, 40) + '...' : 'Saved jellyfish';
                        if (previewWrap) previewWrap.style.display = 'flex';
                        this._pendingGalleryUrl = dataUrl;
                    },
                    (id) => {
                        // onDelete: hide preview if open
                        if (previewWrap) previewWrap.style.display = 'none';
                    }
                );
            }

            if (previewLoadBtn) {
                previewLoadBtn.addEventListener('click', () => {
                    if (this._pendingGalleryUrl) {
                        this._emit('galleryload', this._pendingGalleryUrl);
                    }
                });
            }

            // ─── v5.0 Animation Engine wiring ───
            const personalitySelect = this.dom.panel.querySelector('#setting-personality');
            if (personalitySelect) {
                personalitySelect.addEventListener('change', e => {
                    this.settings.personality = e.target.value;
                    this._emit('personalitychange', e.target.value);
                    this._save();
                });
            }
            const timingSelect = this.dom.panel.querySelector('#setting-timing');
            if (timingSelect) {
                timingSelect.addEventListener('change', e => {
                    this.settings.timing = e.target.value;
                    this._emit('timingchange', e.target.value);
                    this._save();
                });
            }
            const pacingCb = this.dom.panel.querySelector('#setting-pacing');
            if (pacingCb) {
                pacingCb.addEventListener('change', e => {
                    this.settings.pacingEnabled = e.target.checked;
                    this._emit('pacingchange', e.target.checked);
                    this._save();
                });
            }
            const anticipationBtn = this.dom.panel.querySelector('#setting-anticipation');
            if (anticipationBtn) {
                anticipationBtn.addEventListener('click', () => {
                    this._emit('anticipation', {});
                });
            }

            // ─── v6.0 Image Settings wiring ───
            const scaleInput = this.dom.panel.querySelector('#setting-scale');
            const scaleVal = this.dom.panel.querySelector('#setting-scale-val');
            if (scaleInput) {
                scaleInput.addEventListener('input', e => {
                    this.settings.imageScale = parseFloat(e.target.value);
                    if (scaleVal) scaleVal.textContent = this.settings.imageScale.toFixed(2);
                    this._emit('imagescale', this.settings.imageScale);
                    this._save();
                });
            }
            const opacityInput = this.dom.panel.querySelector('#setting-opacity');
            const opacityVal = this.dom.panel.querySelector('#setting-opacity-val');
            if (opacityInput) {
                opacityInput.addEventListener('input', e => {
                    this.settings.imageOpacity = parseFloat(e.target.value);
                    if (opacityVal) opacityVal.textContent = this.settings.imageOpacity.toFixed(2);
                    this._emit('imageopacity', this.settings.imageOpacity);
                    this._save();
                });
            }
            const shadowCb = this.dom.panel.querySelector('#setting-shadow');
            if (shadowCb) {
                shadowCb.addEventListener('change', e => {
                    this.settings.imageShadow = e.target.checked;
                    this._emit('imageshadow', e.target.checked);
                    this._save();
                });
            }

            // ─── v6.0 Remedy Personality wiring ───
            const remedySelect = this.dom.panel.querySelector('#setting-remedy');
            const remedyDesc = this.dom.panel.querySelector('#remedy-desc');
            if (remedySelect) {
                remedySelect.addEventListener('change', e => {
                    this.settings.remedy = e.target.value;
                    if (remedyDesc && typeof RemedyPersonality !== 'undefined') {
                        const p = RemedyPersonality.getProfile(e.target.value);
                        remedyDesc.textContent = p ? p.desc : '';
                    }
                    this._emit('remedychange', e.target.value);
                    this._save();
                });
            }

            // Session timer
            const sessionStartBtn = this.dom.panel.querySelector('#setting-session-start');
            const sessionStopBtn = this.dom.panel.querySelector('#setting-session-stop');
            const sessionTimerEl = this.dom.panel.querySelector('#session-timer');
            let sessionInterval = null;
            let sessionSeconds = 0;

            function updateTimerDisplay() {
                const m = Math.floor(sessionSeconds / 60).toString().padStart(2, '0');
                const s = (sessionSeconds % 60).toString().padStart(2, '0');
                if (sessionTimerEl) sessionTimerEl.textContent = `${m}:${s}`;
            }

            if (sessionStartBtn) {
                sessionStartBtn.addEventListener('click', () => {
                    const config = (typeof RemedyPersonality !== 'undefined') ?
                        new RemedyPersonality(this.settings.remedy).getSessionConfig() :
                        { minutes: 10 };
                    sessionSeconds = config.minutes * 60;
                    updateTimerDisplay();
                    if (sessionTimerEl) sessionTimerEl.style.display = 'block';
                    if (sessionStartBtn) sessionStartBtn.style.display = 'none';
                    if (sessionStopBtn) sessionStopBtn.style.display = 'block';
                    this._emit('sessionstart', config);
                    sessionInterval = setInterval(() => {
                        sessionSeconds--;
                        updateTimerDisplay();
                        if (sessionSeconds <= 0) {
                            clearInterval(sessionInterval);
                            if (sessionStartBtn) sessionStartBtn.style.display = 'block';
                            if (sessionStopBtn) sessionStopBtn.style.display = 'none';
                            if (sessionTimerEl) sessionTimerEl.style.display = 'none';
                            this._emit('sessionend', {});
                        }
                    }, 1000);
                });
            }
            if (sessionStopBtn) {
                sessionStopBtn.addEventListener('click', () => {
                    clearInterval(sessionInterval);
                    if (sessionStartBtn) sessionStartBtn.style.display = 'block';
                    if (sessionStopBtn) sessionStopBtn.style.display = 'none';
                    if (sessionTimerEl) sessionTimerEl.style.display = 'none';
                    this._emit('sessionstop', {});
                });
            }

            // ─── v6.0 Thought Bubble wiring ───
            const thoughtSendBtn = this.dom.panel.querySelector('#setting-thought-send');
            const thoughtInput = this.dom.panel.querySelector('#setting-thought');
            if (thoughtSendBtn) {
                thoughtSendBtn.addEventListener('click', () => {
                    const text = thoughtInput ? thoughtInput.value.trim() : '';
                    if (text) {
                        this._emit('thoughtbubble', text);
                        if (thoughtInput) thoughtInput.value = '';
                    }
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

        _getRemedyDesc(key) {
            if (typeof RemedyPersonality === 'undefined') return '';
            const p = RemedyPersonality.getProfile(key || 'pulsatilla');
            return p ? p.desc : '';
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