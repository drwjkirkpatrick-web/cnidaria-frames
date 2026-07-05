/**
 * ws-bridge.js — Hermes WebSocket Bridge for Cnidaria Frames
 *
 * Client-side WebSocket connection that syncs jellyfish state,
 * theme, and events across multiple devices. Connects to
 * ws://localhost:9192 by default (configurable via WS_PORT env).
 *
 * Protocol (JSON):
 *   { type: "state", state: "idle" }
 *   { type: "theme", theme: "deep" }
 *   { type: "ping" }
 *   { type: "pong" }
 */

(function(global) {
    'use strict';

    const WS_URL = (() => {
        // Try to infer from current host; fallback to localhost
        const host = window.location.hostname;
        // Use same host, port 9192 (ws server runs alongside HTTP server)
        return `ws://${host}:9192`;
    })();

    class WSBridge {
        constructor() {
            this.ws = null;
            this.connected = false;
            this.autoReconnect = true;
            this.reconnectDelay = 3000;
            this.reconnectTimer = null;
            this.messageQueue = [];
        }

        connect() {
            if (this.ws || this.connected) return;
            try {
                this.ws = new WebSocket(WS_URL);
                this.ws.onopen = () => {
                    this.connected = true;
                    console.log('[WS] Connected');
                    document.dispatchEvent(new CustomEvent('cnidaria:ws:open'));
                    // Flush queued messages
                    while (this.messageQueue.length > 0 && this.connected) {
                        const msg = this.messageQueue.shift();
                        this.send(msg);
                    }
                };
                this.ws.onmessage = e => this._onMessage(e.data);
                this.ws.onclose = () => {
                    this.connected = false;
                    this.ws = null;
                    document.dispatchEvent(new CustomEvent('cnidaria:ws:close'));
                    if (this.autoReconnect) this._scheduleReconnect();
                };
                this.ws.onerror = err => {
                    console.warn('[WS] Error:', err);
                    document.dispatchEvent(new CustomEvent('cnidaria:ws:error'));
                };
            } catch (e) {
                console.warn('[WS] Connection failed:', e);
            }
        }

        disconnect() {
            this.autoReconnect = false;
            if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }
            this.connected = false;
        }

        _scheduleReconnect() {
            if (this.reconnectTimer) return;
            this.reconnectTimer = setTimeout(() => {
                this.reconnectTimer = null;
                this.connect();
            }, this.reconnectDelay);
        }

        send(data) {
            const payload = typeof data === 'string' ? data : JSON.stringify(data);
            if (this.connected && this.ws) {
                this.ws.send(payload);
            } else {
                this.messageQueue.push(payload);
                if (this.messageQueue.length > 50) this.messageQueue.shift();
            }
        }

        _onMessage(data) {
            try {
                const msg = JSON.parse(data);
                document.dispatchEvent(new CustomEvent('cnidaria:ws:message', { detail: msg }));
            } catch (e) {
                console.warn('[WS] Invalid message:', data);
            }
        }

        broadcastState(state) {
            this.send({ type: 'state', state });
        }

        broadcastTheme(theme) {
            this.send({ type: 'theme', theme });
        }
    }

    global.WSBridge = WSBridge;
})(window);