/**
 * LoginScene -- Hacker-style authentication terminal.
 * Provides login / sign-up UI injected into #ui-overlay.
 * On success (or offline skip), transitions to BootScene.
 */

import { Scene } from 'phaser';
import { dataBridge } from '../systems/DataBridge.js';
import { xpManager } from '../systems/XPManager.js';
import { auth } from '../config/supabase.js';

export class LoginScene extends Scene {
    constructor() {
        super({ key: 'LoginScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Full-screen dark backdrop
        this.add.rectangle(w / 2, h / 2, w, h, 0x12181a);

        this._mode = 'login'; // 'login' | 'signup'
        this._loading = false;
        this._renderPanel();
    }

    // ── Render ──────────────────────────────────────────────

    _renderPanel() {
        this._clearUI();

        const isLogin = this._mode === 'login';

        const html = `
            <div class="scene-panel" id="login-panel" style="max-width:420px; margin:0 auto; top:40px; padding-bottom:60px;">

                <!-- Scan-line overlay -->
                <div style="
                    pointer-events:none; position:fixed; inset:0; z-index:9999;
                    background:repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(80,232,192,0.015) 2px,
                        rgba(80,232,192,0.015) 4px
                    );
                " id="login-scanlines"></div>

                <!-- Terminal header -->
                <div style="margin-bottom:24px; text-align:center;">
                    <h2 class="glitch-text" style="
                        font-family:var(--font-mono); font-size:1.125rem; font-weight:500;
                        color:var(--teal); letter-spacing:0.05em; margin:0 0 4px 0;
                    ">> NORED FARMS // AUTHENTICATE</h2>
                    <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted);">
                        SECURE TERMINAL v0.1.0 &mdash; ${new Date().toISOString().slice(0, 10)}
                    </div>
                    <div style="
                        width:100%; height:1px; margin-top:12px;
                        background:linear-gradient(90deg, transparent, var(--teal-border-strong), transparent);
                    "></div>
                </div>

                <!-- Mode toggle -->
                <div style="display:flex; gap:0; margin-bottom:20px; border:1px solid var(--teal-border); border-radius:3px; overflow:hidden;">
                    <button class="btn ${isLogin ? 'btn-primary' : 'btn-ghost'}" id="btn-mode-login"
                        style="flex:1; border-radius:0; border:none; font-family:var(--font-mono); font-size:0.6875rem;">
                        > LOGIN
                    </button>
                    <button class="btn ${!isLogin ? 'btn-primary' : 'btn-ghost'}" id="btn-mode-signup"
                        style="flex:1; border-radius:0; border:none; font-family:var(--font-mono); font-size:0.6875rem;">
                        > SIGN UP
                    </button>
                </div>

                <!-- Form -->
                <form id="login-form" autocomplete="off" style="display:flex; flex-direction:column; gap:12px;">

                    ${!isLogin ? `
                    <!-- Display name (sign-up only) -->
                    <div>
                        <label style="font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted); display:block; margin-bottom:4px;">
                            DISPLAY_NAME:
                        </label>
                        <input type="text" id="input-display-name" class="search-input" placeholder="agent_codename"
                            style="width:100%; font-family:var(--font-mono);" autocomplete="off" required>
                    </div>
                    ` : ''}

                    <!-- Email -->
                    <div>
                        <label style="font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted); display:block; margin-bottom:4px;">
                            EMAIL:
                        </label>
                        <input type="email" id="input-email" class="search-input" placeholder="agent@noredfarms.com"
                            style="width:100%; font-family:var(--font-mono);" autocomplete="off" required>
                    </div>

                    <!-- Password -->
                    <div>
                        <label style="font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted); display:block; margin-bottom:4px;">
                            PASSWORD:
                        </label>
                        <input type="password" id="input-password" class="search-input" placeholder="••••••••"
                            style="width:100%; font-family:var(--font-mono);" autocomplete="off" required>
                    </div>

                    <!-- Error display -->
                    <div id="login-error" style="
                        display:none; font-family:var(--font-mono); font-size:0.6875rem;
                        color:var(--error); background:rgba(196,92,75,0.08);
                        border:1px solid rgba(196,92,75,0.2); border-radius:3px;
                        padding:8px 10px; word-break:break-word;
                    "></div>

                    <!-- Success display -->
                    <div id="login-success" style="
                        display:none; font-family:var(--font-mono); font-size:0.6875rem;
                        color:var(--teal); background:rgba(80,232,192,0.06);
                        border:1px solid var(--teal-border); border-radius:3px;
                        padding:8px 10px;
                    "></div>

                    <!-- Submit -->
                    <button type="submit" class="btn btn-primary" id="btn-submit" style="
                        width:100%; margin-top:4px; font-family:var(--font-mono);
                        font-size:0.8125rem; letter-spacing:0.04em;
                    ">
                        ${isLogin ? '> AUTHENTICATE' : '> CREATE ACCOUNT'}
                    </button>
                </form>

                <!-- Blinking cursor decoration -->
                <div style="margin-top:20px; font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted);">
                    <span style="color:var(--teal);">$</span> awaiting credentials<span class="login-cursor" style="
                        display:inline-block; width:6px; height:12px; background:var(--teal);
                        margin-left:2px; vertical-align:middle;
                        animation:login-blink 1s step-end infinite;
                    "></span>
                </div>

                <!-- Divider -->
                <div style="
                    display:flex; align-items:center; gap:12px; margin:24px 0 16px 0;
                ">
                    <div style="flex:1; height:1px; background:var(--teal-border);"></div>
                    <span style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted);">OR</span>
                    <div style="flex:1; height:1px; background:var(--teal-border);"></div>
                </div>

                <!-- Continue Offline -->
                <button class="btn btn-ghost" id="btn-offline" style="
                    width:100%; font-family:var(--font-mono); font-size:0.75rem;
                    color:var(--text-muted); border:1px solid var(--teal-border);
                ">
                    > CONTINUE OFFLINE
                </button>

                <div style="text-align:center; margin-top:16px;">
                    <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">
                        LOCAL STORAGE MODE &mdash; PROGRESS SAVED ON DEVICE ONLY
                    </span>
                </div>

                <!-- Terminal decoration footer -->
                <div style="margin-top:24px; padding-top:12px; border-top:1px solid var(--teal-border);">
                    <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted); line-height:1.6;">
                        <div>> sys.auth.module loaded</div>
                        <div>> encryption: AES-256-GCM</div>
                        <div>> session: supabase/jwt</div>
                        <div>> status: <span style="color:var(--teal);">READY</span></div>
                    </div>
                </div>
            </div>

            <style id="login-scene-styles">
                @keyframes login-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            </style>
        `;

        this._injectHTML(html);
        this._bindEvents();
    }

    // ── Events ──────────────────────────────────────────────

    _bindEvents() {
        // Mode toggles
        document.getElementById('btn-mode-login')?.addEventListener('click', () => {
            if (this._loading) return;
            this._mode = 'login';
            this._renderPanel();
        });

        document.getElementById('btn-mode-signup')?.addEventListener('click', () => {
            if (this._loading) return;
            this._mode = 'signup';
            this._renderPanel();
        });

        // Form submit
        document.getElementById('login-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this._loading) return;
            this._handleSubmit();
        });

        // Continue offline
        document.getElementById('btn-offline')?.addEventListener('click', () => {
            if (this._loading) return;
            this._goToBoot();
        });
    }

    // ── Submit ──────────────────────────────────────────────

    async _handleSubmit() {
        const email = document.getElementById('input-email')?.value?.trim();
        const password = document.getElementById('input-password')?.value;
        const displayName = document.getElementById('input-display-name')?.value?.trim();

        // Validation
        if (!email || !password) {
            this._showError('> ERROR: email and password required');
            return;
        }

        if (this._mode === 'signup' && !displayName) {
            this._showError('> ERROR: display name required');
            return;
        }

        if (password.length < 6) {
            this._showError('> ERROR: password must be at least 6 characters');
            return;
        }

        this._setLoading(true);
        this._hideMessages();

        if (this._mode === 'login') {
            await this._doLogin(email, password);
        } else {
            await this._doSignUp(email, password, displayName);
        }
    }

    async _doLogin(email, password) {
        try {
            const result = await dataBridge.login(email, password);

            if (result.error) {
                this._showError(`> AUTH_FAIL: ${result.error}`);
                this._setLoading(false);
                return;
            }

            // Success
            this._goToBoot();
        } catch (err) {
            this._showError(`> SYSTEM_ERROR: ${err.message}`);
            this._setLoading(false);
        }
    }

    async _doSignUp(email, password, displayName) {
        try {
            const { data, error } = await auth.signUp({
                email,
                password,
                options: {
                    data: { display_name: displayName }
                }
            });

            if (error) {
                this._showError(`> SIGNUP_FAIL: ${error.message}`);
                this._setLoading(false);
                return;
            }

            // If email confirmation is required, the user won't have a session yet
            if (data?.user && !data?.session) {
                this._showSuccess('> ACCOUNT CREATED. Check your email to confirm, then log in.');
                this._setLoading(false);
                // Switch to login mode after short delay
                setTimeout(() => {
                    this._mode = 'login';
                    this._renderPanel();
                }, 3000);
                return;
            }

            // Auto-login after sign-up (no email confirmation required)
            const loginResult = await dataBridge.login(email, password);

            if (loginResult.error) {
                this._showSuccess('> ACCOUNT CREATED. Please log in.');
                this._setLoading(false);
                setTimeout(() => {
                    this._mode = 'login';
                    this._renderPanel();
                }, 2000);
                return;
            }

            // Set display name
            if (displayName) {
                await dataBridge.updateDisplayName(displayName);
            }

            this._goToBoot();
        } catch (err) {
            this._showError(`> SYSTEM_ERROR: ${err.message}`);
            this._setLoading(false);
        }
    }

    // ── UI Helpers ──────────────────────────────────────────

    _showError(msg) {
        const el = document.getElementById('login-error');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    }

    _showSuccess(msg) {
        const el = document.getElementById('login-success');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    }

    _hideMessages() {
        const err = document.getElementById('login-error');
        const suc = document.getElementById('login-success');
        if (err) err.style.display = 'none';
        if (suc) suc.style.display = 'none';
    }

    _setLoading(loading) {
        this._loading = loading;
        const btn = document.getElementById('btn-submit');
        if (!btn) return;

        if (loading) {
            btn.disabled = true;
            btn.textContent = '> AUTHENTICATING...';
            btn.style.opacity = '0.6';
            btn.style.pointerEvents = 'none';
        } else {
            btn.disabled = false;
            btn.textContent = this._mode === 'login' ? '> AUTHENTICATE' : '> CREATE ACCOUNT';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    }

    _goToBoot() {
        this._clearUI();
        this.scene.stop('LoginScene');
        this.scene.start('BootScene');
    }

    // ── DOM helpers ─────────────────────────────────────────

    _clearUI() {
        const panel = document.getElementById('login-panel');
        if (panel) panel.remove();
        const styles = document.getElementById('login-scene-styles');
        if (styles) styles.remove();
        const scanlines = document.getElementById('login-scanlines');
        if (scanlines) scanlines.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }
}
