/**
 * help-overlay.js — Keyboard Help Overlay for Cnidaria Frames
 *
 * Press '?' to show a quick-reference overlay of all keyboard shortcuts.
 * Dismiss with Escape, '?' again, or tap backdrop.
 */

(function(global) {
    'use strict';

    class HelpOverlay {
        constructor() {
            this.visible = false;
            this.dom = null;
            this._buildDOM();
            this._bind();
        }

        _buildDOM() {
            const el = document.createElement('div');
            el.id = 'helpOverlay';
            el.className = 'help-overlay';
            el.innerHTML = `
                <div class="help-backdrop"></div>
                <div class="help-content">
                    <div class="help-header">
                        <h2>Keyboard Shortcuts</h2>
                        <button class="help-close" aria-label="Close help">×</button>
                    </div>
                    <div class="help-body">
                        <div class="help-row"><span>1–6</span><span>Jump to state</span></div>
                        <div class="help-row"><span>↑ / ←</span><span>Previous state</span></div>
                        <div class="help-row"><span>↓ / →</span><span>Next state</span></div>
                        <div class="help-row"><span>Space</span><span>Cycle forward</span></div>
                        <div class="help-row"><span>a</span><span>Toggle ambient audio</span></div>
                        <div class="help-row"><span>f</span><span>Toggle FPS overlay</span></div>
                        <div class="help-row"><span>e</span><span>Export screenshot</span></div>
                        <div class="help-row"><span>t</span><span>Cycle theme</span></div>
                        <div class="help-row"><span>v</span><span>Toggle voice commands</span></div>
                        <div class="help-row"><span>s</span><span>Open settings</span></div>
                        <div class="help-row"><span>?</span><span>Toggle this help</span></div>
                        <div class="help-row"><span>Escape</span><span>Close overlays</span></div>
                    </div>
                </div>
            `;
            document.body.appendChild(el);
            this.dom = {
                root: el,
                backdrop: el.querySelector('.help-backdrop'),
                closeBtn: el.querySelector('.help-close')
            };
        }

        _bind() {
            document.addEventListener('keydown', e => {
                if (e.key === '?') { e.preventDefault(); this.toggle(); }
                if (e.key === 'Escape' && this.visible) this.hide();
            });
            this.dom.backdrop.addEventListener('click', () => this.hide());
            this.dom.closeBtn.addEventListener('click', () => this.hide());
        }

        show() {
            if (this.visible) return;
            this.visible = true;
            this.dom.root.classList.add('visible');
        }

        hide() {
            if (!this.visible) return;
            this.visible = false;
            this.dom.root.classList.remove('visible');
        }

        toggle() {
            this.visible ? this.hide() : this.show();
        }
    }

    global.HelpOverlay = HelpOverlay;
})(window);