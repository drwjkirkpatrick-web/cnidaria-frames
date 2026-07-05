/**
 * voice-command.js — Voice Command Interface for Cnidaria Frames
 *
 * Uses Web Speech API (SpeechRecognition) to allow hands-free state
 * changes and theme switching via spoken commands.
 *
 * Supported commands:
 *   "idle", "active", "thinking", "success", "error", "sleeping"
 *   "deep", "arctic", "reef", "abyss"
 *   "next", "previous", "screenshot", "fullscreen"
 */

(function(global) {
    'use strict';

    class VoiceCommand {
        constructor() {
            this.recognition = null;
            this.listening = false;
            this.enabled = false;
            this._init();
        }

        _init() {
            const SpeechRecognition = global.SpeechRecognition || global.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn('SpeechRecognition not supported');
                return;
            }
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = e => this._onResult(e);
            this.recognition.onerror = e => {
                if (e.error === 'not-allowed') this.enabled = false;
            };
            this.recognition.onend = () => {
                if (this.enabled && this.listening) {
                    try { this.recognition.start(); } catch (err) {}
                }
            };
        }

        _onResult(event) {
            const transcript = event.results[event.results.length - 1][0].transcript
                .toLowerCase().trim().replace(/[.!?]$/, '');
            this._process(transcript);
        }

        _process(text) {
            const stateMap = {
                idle: 'idle', active: 'active', thinking: 'thinking',
                success: 'success', error: 'error', sleep: 'sleeping',
                sleeping: 'sleeping', calm: 'idle', alert: 'active',
                process: 'thinking', done: 'success', fail: 'error'
            };
            const themeMap = { deep: 'deep', arctic: 'arctic', reef: 'reef', abyss: 'abyss' };

            // Check state commands
            for (const [word, state] of Object.entries(stateMap)) {
                if (text.includes(word)) {
                    document.dispatchEvent(new CustomEvent('cnidaria:voice:state', { detail: state }));
                    return;
                }
            }
            // Check theme commands
            for (const [word, theme] of Object.entries(themeMap)) {
                if (text.includes(word)) {
                    document.dispatchEvent(new CustomEvent('cnidaria:voice:theme', { detail: theme }));
                    return;
                }
            }
            if (text.includes('next')) {
                document.dispatchEvent(new CustomEvent('cnidaria:voice:next'));
            } else if (text.includes('previous') || text.includes('back')) {
                document.dispatchEvent(new CustomEvent('cnidaria:voice:previous'));
            } else if (text.includes('screenshot') || text.includes('save')) {
                document.dispatchEvent(new CustomEvent('cnidaria:voice:screenshot'));
            } else if (text.includes('fullscreen')) {
                document.dispatchEvent(new CustomEvent('cnidaria:voice:fullscreen'));
            }
        }

        start() {
            if (!this.recognition) return;
            this.enabled = true;
            this.listening = true;
            try { this.recognition.start(); } catch (e) {}
            document.dispatchEvent(new CustomEvent('cnidaria:voice:start'));
        }

        stop() {
            this.enabled = false;
            this.listening = false;
            if (this.recognition) {
                try { this.recognition.stop(); } catch (e) {}
            }
            document.dispatchEvent(new CustomEvent('cnidaria:voice:stop'));
        }

        toggle() {
            this.enabled ? this.stop() : this.start();
        }
    }

    global.VoiceCommand = VoiceCommand;
})(window);