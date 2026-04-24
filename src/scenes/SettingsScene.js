/**
 * SettingsScene — Quality toggle, sound, achievements, and display options.
 * Retro terminal aesthetic. Launches as overlay on top of current scene.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { xpManager, showToast } from '../systems/XPManager.js';
import { dataBridge } from '../systems/DataBridge.js';
import { achievementManager } from '../systems/Achievements.js';
import { soundManager } from '../systems/SoundManager.js';
import { learningProgress } from '../systems/LearningProgress.js';

export class SettingsScene extends Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Semi-transparent backdrop
        const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x12181a, 0.85)
            .setInteractive();

        const current = settings.all;
        const player = xpManager.player;
        const earnedKeys = new Set(achievementManager.earned);
        const allAch = achievementManager.definitions;
        const earnedCount = earnedKeys.size;

        const html = `
            <div class="scene-panel" id="settings-panel" style="max-width:480px; margin:0 auto; top:52px; padding-bottom:80px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 class="scene-heading" style="margin:0; font-family:var(--font-mono);">// SETTINGS</h2>
                    <button class="btn btn-ghost" id="btn-close-settings" style="font-size:1.25rem; padding:4px 8px;">\u2715</button>
                </div>

                <!-- Player Info -->
                <div style="background:var(--bg-alt); border:1px solid var(--teal-border-strong); border-radius:3px; padding:14px; margin-bottom:16px;" class="pixel-corners">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-size:0.8125rem; font-weight:400; color:#50e8c0; font-family:var(--font-mono);">> ${player.displayName}</div>
                            <div style="font-size:0.625rem; color:#506460; font-family:var(--font-mono);">LVL ${player.level} | ${player.totalXp} TOTAL XP</div>
                        </div>
                        <span class="hud-badge">Lv ${player.level}</span>
                    </div>
                    <div style="margin-top:8px;">
                        <div class="xp-bar-wrap" style="height:4px;">
                            <div class="xp-bar-fill" style="width:${(xpManager.xpProgress * 100).toFixed(1)}%"></div>
                        </div>
                        <div style="font-size:0.5625rem; color:#506460; margin-top:2px; font-family:var(--font-mono);">${xpManager.xpInLevel} / ${xpManager.xpToNext} XP TO NEXT LEVEL</div>
                    </div>
                </div>

                <!-- Theme Toggle -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Theme</div>
                    <div class="theme-toggle-wrap">
                        <button class="theme-toggle-btn ${current.theme !== 'lab' ? 'active' : ''}" data-theme-val="botanical">
                            <span style="font-size:1rem;">&#x1F33F;</span>
                            Botanical
                        </button>
                        <button class="theme-toggle-btn ${current.theme === 'lab' ? 'active' : ''}" data-theme-val="lab">
                            <span style="font-size:1rem;">&#x1F4BB;</span>
                            Lab Mode
                        </button>
                    </div>
                </div>

                <!-- Graphics Quality -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Graphics Quality</div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn ${current.quality === 'low' ? 'btn-primary' : 'btn-secondary'}" data-quality="low" style="flex:1;">
                            LOW<br><span style="font-size:0.5625rem; opacity:0.7;">Min bandwidth</span>
                        </button>
                        <button class="btn ${current.quality === 'medium' ? 'btn-primary' : 'btn-secondary'}" data-quality="medium" style="flex:1;">
                            MED<br><span style="font-size:0.5625rem; opacity:0.7;">Balanced</span>
                        </button>
                        <button class="btn ${current.quality === 'high' ? 'btn-primary' : 'btn-secondary'}" data-quality="high" style="flex:1;">
                            HIGH<br><span style="font-size:0.5625rem; opacity:0.7;">All effects</span>
                        </button>
                    </div>
                    <div style="font-size:0.5625rem; color:#506460; margin-top:6px; font-family:var(--font-mono);">
                        ${current.quality === 'low' ? '> NO PARTICLES, NO GLOW, NO ANIMATIONS. MINIMAL DATA.' :
                          current.quality === 'medium' ? '> PARTICLES + GLOW + AMBIENT ANIMATIONS. BALANCED.' :
                          '> FULL EFFECTS: 200 PARTICLES, GLOW FILTERS, ANIMATED TILES.'}
                    </div>
                </div>

                <!-- Feature toggles -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Effects</div>
                    ${this._toggle('particles', 'Particle effects', current.particles)}
                    ${this._toggle('glow', 'Glow on map pins', current.glow)}
                    ${this._toggle('animatedBg', 'Animated background', current.animatedBg)}
                    ${this._toggle('screenShake', 'Screen shake on level-up', current.screenShake)}
                </div>

                <!-- Sound Controls -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Sound</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                        <span style="font-size:0.75rem; color:#8e9c98;">Sound effects</span>
                        <div id="toggle-mute" style="width:36px; height:20px; border-radius:3px; background:${soundManager.isMuted ? '#263032' : '#50e8c0'}; cursor:pointer; position:relative; transition:background 0.2s; border:1px solid rgba(80,232,192,0.1);">
                            <div class="toggle-knob" style="width:16px; height:16px; border-radius:2px; background:#12181a; position:absolute; top:1px; left:1px; transition:transform 0.2s; transform:${soundManager.isMuted ? 'translateX(0)' : 'translateX(16px)'}"></div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px; padding:6px 0;">
                        <span style="font-size:0.75rem; color:#8e9c98; flex-shrink:0;">Volume</span>
                        <input type="range" id="volume-slider" class="sound-slider" min="0" max="100" value="${Math.round(soundManager._volume * 100)}">
                        <span id="volume-val" style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); min-width:28px; text-align:right;">${Math.round(soundManager._volume * 100)}%</span>
                    </div>
                </div>

                <!-- Display Name -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Display Name</div>
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="input-name" value="${player.displayName}"
                            class="search-input" style="flex:1;">
                        <button class="btn btn-secondary" id="btn-save-name">SAVE</button>
                    </div>
                </div>

                <!-- My Rewards -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">My Rewards</div>
                    <button class="btn btn-secondary" id="btn-open-rewards" style="width:100%; font-size:0.6875rem;">
                        &#x1F3C6; View Milestones, Coupons &amp; Lottery
                    </button>
                </div>

                <!-- Stats -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Stats</div>
                    <div class="stat-grid" style="grid-template-columns:1fr 1fr;">
                        <div class="stat-box">
                            <div class="stat-value">${player.questsCompleted.length}</div>
                            <div class="stat-label">Quests Done</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${player.currentStreak}</div>
                            <div class="stat-label">Current Streak</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${player.longestStreak}</div>
                            <div class="stat-label">Best Streak</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${Object.keys(player.quizResults).length}</div>
                            <div class="stat-label">Quizzes Taken</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${learningProgress.totalCompleted}</div>
                            <div class="stat-label">Sections Read</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">+${learningProgress.totalXpEarned}</div>
                            <div class="stat-label">Learning XP</div>
                        </div>
                    </div>
                </div>

                <!-- Achievements Gallery -->
                <div style="margin-bottom:16px;">
                    <div class="section-header">Achievements (${earnedCount}/${allAch.length})</div>
                    <div class="ach-gallery">
                        ${allAch.map(a => {
                            const isEarned = earnedKeys.has(a.key);
                            return `
                                <div class="ach-card ${isEarned ? 'earned' : 'locked'}">
                                    <div class="ach-card-icon">${isEarned ? a.icon : '?'}</div>
                                    <div class="ach-card-title">${isEarned ? a.title : a.category.toUpperCase()}</div>
                                    <div class="ach-card-desc">${isEarned ? a.description : 'Keep playing to unlock'}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Connection status + Login/Logout -->
                <div style="background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:3px; padding:10px; margin-bottom:16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted);">SUPABASE STATUS</span>
                        <span style="font-family:var(--font-mono); font-size:0.5625rem; color:${dataBridge.isAuthenticated ? 'var(--teal)' : 'var(--text-muted)'};">
                            ${dataBridge.isAuthenticated ? '[ CONNECTED ]' : '[ OFFLINE ]'}
                        </span>
                    </div>
                    <div style="margin-top:8px; text-align:center;">
                        ${dataBridge.isAuthenticated
                            ? '<button class="btn btn-secondary" id="btn-logout" style="width:100%; font-size:0.625rem;">LOG OUT</button>'
                            : '<button class="btn btn-primary" id="btn-login" style="width:100%; font-size:0.625rem;">LOG IN / SIGN UP</button>'
                        }
                    </div>
                </div>

                <div style="text-align:center; margin-top:20px;">
                    <span style="color:#506460; font-size:0.5rem; font-family:var(--font-mono);">PEA v0.1.0 // PURE EXTRACTS ADVENTURES</span>
                </div>
            </div>
        `;

        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);

        // Theme toggle buttons
        document.querySelectorAll('[data-theme-val]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.themeVal;
                settings.setTheme(theme);
                soundManager.play('click');
                showToast('THEME', `Switched to ${theme === 'lab' ? 'Lab Mode' : 'Botanical'}`, 'success');
                // Refresh settings panel
                this._close();
                this.scene.launch('SettingsScene');
            });
        });

        // Quality buttons
        document.querySelectorAll('[data-quality]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const level = e.currentTarget.dataset.quality;
                settings.setQuality(level);

                // Save settings to Supabase
                dataBridge.saveSettings(settings.all);

                showToast('SAVED', `Quality set to ${level.toUpperCase()}`, 'success');

                this._close();
                const scenes = this.scene.manager.getScenes(true);
                const activeScene = scenes.find(s => s.scene.key !== 'SettingsScene');
                if (activeScene) {
                    this.scene.stop(activeScene.scene.key);
                    this.scene.start(activeScene.scene.key);
                }
            });
        });

        // Toggle switches
        document.querySelectorAll('[data-toggle]').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.toggle;
                const newVal = !settings.get(key);
                settings.set(key, newVal);
                e.currentTarget.style.background = newVal ? '#50e8c0' : '#263032';
                e.currentTarget.querySelector('.toggle-knob').style.transform = newVal ? 'translateX(16px)' : 'translateX(0)';
            });
        });

        // Sound mute toggle
        document.getElementById('toggle-mute')?.addEventListener('click', (e) => {
            const el = e.currentTarget;
            soundManager.isMuted = !soundManager.isMuted;
            el.style.background = soundManager.isMuted ? '#263032' : '#50e8c0';
            el.querySelector('.toggle-knob').style.transform = soundManager.isMuted ? 'translateX(0)' : 'translateX(16px)';
            if (!soundManager.isMuted) soundManager.play('click');
        });

        // Volume slider
        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            const val = parseInt(e.target.value) / 100;
            soundManager.setVolume(val);
            const label = document.getElementById('volume-val');
            if (label) label.textContent = `${Math.round(val * 100)}%`;
        });

        // Save name
        document.getElementById('btn-save-name')?.addEventListener('click', () => {
            const name = document.getElementById('input-name')?.value?.trim();
            if (name) {
                dataBridge.updateDisplayName(name);
                showToast('SAVED', `Display name: ${name}`, 'success');
            }
        });

        // Rewards button
        document.getElementById('btn-open-rewards')?.addEventListener('click', () => {
            this._close();
            // Stop the underlying scene and navigate to RewardsScene
            const scenes = this.scene.manager.getScenes(true);
            const activeScene = scenes.find(s => s.scene.key !== 'SettingsScene');
            if (activeScene) this.scene.stop(activeScene.scene.key);
            this.scene.start('RewardsScene');
        });

        // Login button
        document.getElementById('btn-login')?.addEventListener('click', () => {
            this._close();
            this.scene.start('LoginScene');
        });

        // Logout button
        document.getElementById('btn-logout')?.addEventListener('click', () => {
            dataBridge.logout();
            showToast('LOGGED OUT', 'Session ended', 'success');
            this._close();
        });

        // Close
        document.getElementById('btn-close-settings')?.addEventListener('click', () => this._close());
        backdrop.on('pointerdown', () => this._close());
    }

    _toggle(key, label, value) {
        return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0;">
                <span style="font-size:0.75rem; color:#8e9c98;">${label}</span>
                <div data-toggle="${key}" style="width:36px; height:20px; border-radius:3px; background:${value ? '#50e8c0' : '#263032'}; cursor:pointer; position:relative; transition:background 0.2s; border:1px solid rgba(80,232,192,0.1);">
                    <div class="toggle-knob" style="width:16px; height:16px; border-radius:2px; background:#12181a; position:absolute; top:1px; left:1px; transition:transform 0.2s; transform:${value ? 'translateX(16px)' : 'translateX(0)'}"></div>
                </div>
            </div>
        `;
    }

    _close() {
        const panel = document.getElementById('settings-panel');
        if (panel) panel.remove();
        this.scene.stop('SettingsScene');
    }
}
