/**
 * ProfileScene — Dedicated player profile with stats, topic strengths,
 * achievements, and recent activity.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { xpManager } from '../systems/XPManager.js';
import { learningProgress } from '../systems/LearningProgress.js';
import { TOPICS } from '../config/topics/index.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

export class ProfileScene extends Scene {
    constructor() {
        super({ key: 'ProfileScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        createAmbientParticles(this, w, h);

        this._updateNavBar('profile');
        this._showProfile();
    }

    _showProfile() {
        this._clearUI();

        const player = xpManager.player;
        const achMgr = window.__nfSystems?.achievementManager;
        const achievements = achMgr ? achMgr.getAll() : [];
        const unlockedCount = achievements.filter(a => a.unlocked).length;

        // Topic strength bars
        const topicBars = TOPICS.map(topic => {
            const completed = learningProgress.getTopicProgress(topic.key);
            const total = topic.sectionCount;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return { ...topic, completed, total, pct };
        });

        // Recent activity from XP log
        const recentActivity = this._getRecentActivity();

        const html = `
            <div class="scene-panel" id="profile-panel" style="padding-bottom:80px;">
                <div class="profile-panel">
                    <!-- Avatar area -->
                    <div class="profile-avatar-area">
                        <div class="profile-level-badge">${player.level}</div>
                        <div class="profile-name" id="profile-name-display">${player.displayName || 'Explorer'}</div>
                        <div class="profile-xp">${player.totalXp.toLocaleString()} XP</div>
                        <div class="profile-joined">
                            ${player.currentStreak > 0 ? `${player.currentStreak} day streak` : 'Start a streak today'}
                        </div>
                    </div>

                    <!-- Topic strengths -->
                    <div class="profile-section-title">Topic Strengths</div>
                    <div class="profile-topic-bars">
                        ${topicBars.map(t => `
                            <div class="profile-topic-row">
                                <span class="profile-topic-label">${t.icon} ${t.title.split(' ')[0]}</span>
                                <div class="profile-topic-bar">
                                    <div class="profile-topic-fill" style="width:${t.pct}%; background:${t.color};"></div>
                                </div>
                                <span class="profile-topic-pct">${t.pct}%</span>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Stats grid -->
                    <div class="profile-section-title" style="margin-top:16px;">Stats</div>
                    <div class="stat-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:16px;">
                        <div class="stat-box">
                            <div class="stat-value">${learningProgress.totalCompleted}</div>
                            <div class="stat-label">Sections</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${player.currentStreak}</div>
                            <div class="stat-label">Streak</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${unlockedCount}/${achievements.length}</div>
                            <div class="stat-label">Achievements</div>
                        </div>
                    </div>

                    <!-- Achievements gallery -->
                    ${achievements.length > 0 ? `
                        <div class="profile-section-title" style="margin-top:16px;">Achievements</div>
                        <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;">
                            ${achievements.map(a => `
                                <div style="
                                    padding:6px 10px;
                                    background:${a.unlocked ? 'var(--teal-muted)' : 'var(--bg-alt)'};
                                    border:1px solid ${a.unlocked ? 'var(--teal-border-strong)' : 'var(--border-light)'};
                                    border-radius:6px;
                                    opacity:${a.unlocked ? '1' : '0.5'};
                                    font-size:0.625rem;
                                    color:${a.unlocked ? 'var(--teal)' : 'var(--text-muted)'};
                                " title="${a.description}">
                                    ${a.icon} ${a.title}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Recent activity -->
                    ${recentActivity.length > 0 ? `
                        <div class="profile-section-title" style="margin-top:16px;">Recent Activity</div>
                        <div style="margin-bottom:16px;">
                            ${recentActivity.map(a => `
                                <div class="profile-activity-item">
                                    <span class="profile-activity-desc">${a.desc}</span>
                                    <span class="profile-activity-xp">+${a.xp} XP</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Actions -->
                    <div style="display:flex; gap:8px; margin-top:16px;">
                        <button class="btn btn-secondary" id="btn-profile-settings" style="flex:1; font-size:0.6875rem;">
                            &#x2699; Settings
                        </button>
                        <button class="btn btn-secondary" id="btn-profile-rewards" style="flex:1; font-size:0.6875rem;">
                            &#x1F3C6; Rewards
                        </button>
                    </div>

                    <!-- Edit name -->
                    <div style="margin-top:16px; text-align:center;">
                        <button class="btn btn-secondary" id="btn-edit-name" style="font-size:0.625rem; opacity:0.7;">
                            Edit Display Name
                        </button>
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);
        this._bindEvents();
    }

    _getRecentActivity() {
        try {
            const log = JSON.parse(localStorage.getItem('pea_xp_log') || '[]');
            return log.slice(-5).reverse().map(entry => ({
                desc: entry.reason || 'XP earned',
                xp: entry.amount || 0
            }));
        } catch { return []; }
    }

    _bindEvents() {
        document.getElementById('btn-profile-settings')?.addEventListener('click', () => {
            soundManager.play('click');
            // Launch settings as overlay
            this.scene.launch('SettingsScene');
        });

        document.getElementById('btn-profile-rewards')?.addEventListener('click', () => {
            soundManager.play('click');
            this._clearUI();
            transitionTo(this, 'RewardsScene');
        });

        document.getElementById('btn-edit-name')?.addEventListener('click', () => {
            soundManager.play('click');
            this._showNameEditor();
        });
    }

    _showNameEditor() {
        const display = document.getElementById('profile-name-display');
        if (!display) return;

        const current = display.textContent.trim();
        display.innerHTML = `
            <input type="text" id="profile-name-input" value="${current}"
                style="background:var(--bg-alt); border:1px solid var(--teal-border-strong);
                color:var(--text-heading); font-family:var(--font-main); font-size:1.125rem;
                font-weight:500; text-align:center; padding:4px 8px; border-radius:6px;
                outline:none; width:160px;"
                maxlength="20" autofocus>
        `;

        const input = document.getElementById('profile-name-input');
        input?.focus();
        input?.select();

        const save = () => {
            const name = input?.value?.trim();
            if (name && name.length > 0) {
                xpManager.player.displayName = name;
                try {
                    const data = JSON.parse(localStorage.getItem('pea_player') || '{}');
                    data.displayName = name;
                    localStorage.setItem('pea_player', JSON.stringify(data));
                } catch { /* ignore */ }
            }
            this._showProfile();
        };

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') this._showProfile();
        });
        input?.addEventListener('blur', save);
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('profile-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }
}
