/**
 * RewardsScene — Milestone tracker, coupon display, lottery UI.
 * Shows XP milestones with discount rewards and lottery entries.
 * Accessible from HubScene or Settings.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { xpManager, showToast } from '../systems/XPManager.js';
import { dataBridge } from '../systems/DataBridge.js';
import { accessControl } from '../systems/AccessControl.js';
import { learningProgress } from '../systems/LearningProgress.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

const MILESTONES = [
    { level: 5, xp: 2000, discount: 5, label: '5% off first order' },
    { level: 10, xp: 4500, discount: 10, label: '10% off any order' },
    { level: 15, xp: 7000, discount: 15, label: '15% off + free shipping' },
    { level: 20, xp: 9500, discount: 20, label: '20% off any order' },
    { level: 25, xp: 12000, discount: 25, label: '25% off or free sample' }
];

const LOTTERY_XP_PER_ENTRY = 500;

export class RewardsScene extends Scene {
    constructor() {
        super({ key: 'RewardsScene' });
        this._coupons = [];
        this._lotteryEntries = 0;
        this._pastWinners = [];
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        createAmbientParticles(this, w, h);

        this._updateNavBar('hub');
        this._showLoading();
        this._loadRewardsData();
    }

    async _loadRewardsData() {
        try {
            // Load coupons and lottery data if logged in
            if (dataBridge.playerId) {
                const [coupons, lottery, winners] = await Promise.all([
                    this._fetchCoupons(),
                    this._fetchLotteryEntries(),
                    this._fetchPastWinners()
                ]);
                this._coupons = coupons;
                this._lotteryEntries = lottery;
                this._pastWinners = winners;

                // Check for new milestone coupons
                await this._checkMilestones();
            }
            this._showRewards();
        } catch (err) {
            console.error('Failed to load rewards:', err);
            this._showRewards(); // Show with local data only
        }
    }

    async _fetchCoupons() {
        if (!dataBridge.playerId) return [];
        try {
            const { gameClient } = await import('../config/supabase.js');
            const { data } = await gameClient
                .from('player_coupons')
                .select('*')
                .eq('player_id', dataBridge.playerId)
                .order('milestone_level', { ascending: true });
            return data || [];
        } catch { return []; }
    }

    async _fetchLotteryEntries() {
        if (!dataBridge.playerId) return 0;
        try {
            const period = this._getCurrentPeriod();
            const { gameClient } = await import('../config/supabase.js');
            const { count } = await gameClient
                .from('lottery_entries')
                .select('*', { count: 'exact', head: true })
                .eq('player_id', dataBridge.playerId)
                .eq('drawing_period', period);
            return count || 0;
        } catch { return 0; }
    }

    async _fetchPastWinners() {
        try {
            const { gameClient } = await import('../config/supabase.js');
            const { data } = await gameClient
                .from('lottery_drawings')
                .select('period, prize_description, drawn_at, winner:player_profiles(display_name)')
                .not('winner_id', 'is', null)
                .order('drawn_at', { ascending: false })
                .limit(5);
            return data || [];
        } catch { return []; }
    }

    async _checkMilestones() {
        if (!dataBridge.playerId) return;
        try {
            const { gameClient } = await import('../config/supabase.js');
            const { data } = await gameClient.rpc('check_milestone_coupon', {
                p_player_id: dataBridge.playerId
            });
            if (data && Array.isArray(data)) {
                data.forEach(coupon => {
                    if (coupon.new) {
                        showToast('REWARD UNLOCKED!', `${coupon.discount_percent}% off - Code: ${coupon.coupon_code}`, 'success');
                        soundManager.play('levelup');
                    }
                });
                // Refresh coupons
                if (data.length > 0) {
                    this._coupons = await this._fetchCoupons();
                }
            }
        } catch (err) {
            console.warn('Milestone check failed:', err.message);
        }
    }

    _getCurrentPeriod() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }

    _showLoading() {
        this._clearUI();
        const html = `
            <div class="scene-panel" id="rewards-panel" style="padding-bottom:80px;">
                <div style="text-align:center; padding:60px 0;">
                    <div style="font-size:1.5rem; margin-bottom:8px;">&#x1F3C6;</div>
                    <div style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--text-muted);">
                        Loading rewards...
                    </div>
                </div>
            </div>
        `;
        this._injectHTML(html);
    }

    _showRewards() {
        this._clearUI();

        const player = xpManager.player;
        const totalXp = player.totalXp;
        const level = player.level;
        const isLoggedIn = accessControl.isLoggedIn;
        const lotteryEarned = Math.floor(totalXp / LOTTERY_XP_PER_ENTRY);
        const xpToNextEntry = LOTTERY_XP_PER_ENTRY - (totalXp % LOTTERY_XP_PER_ENTRY);
        const sectionsRead = learningProgress.totalCompleted;

        const html = `
            <div class="scene-panel" id="rewards-panel" style="padding-bottom:80px;">
                <!-- Header -->
                <div class="book-header">
                    <button class="book-back" id="btn-rewards-back">&larr; Hub</button>
                    <div class="book-topic-title">&#x1F3C6; Rewards</div>
                </div>

                <!-- Stats summary -->
                <div class="stat-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:16px;">
                    <div class="stat-box">
                        <div class="stat-value">${totalXp.toLocaleString()}</div>
                        <div class="stat-label">Total XP</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${level}</div>
                        <div class="stat-label">Level</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${sectionsRead}</div>
                        <div class="stat-label">Sections Read</div>
                    </div>
                </div>

                <!-- Milestones -->
                <div style="margin-bottom:20px;">
                    <div style="font-family:var(--font-mono); font-size:0.75rem; font-weight:500; color:var(--text-heading); margin-bottom:10px;">
                        Discount Milestones
                    </div>
                    ${MILESTONES.map(m => {
                        const earned = level >= m.level;
                        const coupon = this._coupons.find(c => c.milestone_level === m.level);
                        const progress = Math.min(1, totalXp / m.xp);
                        return `
                            <div class="reward-milestone ${earned ? 'earned' : ''}">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <span style="font-size:0.75rem; color:${earned ? 'var(--teal)' : 'var(--text-body)'};">
                                        ${earned ? '&#x2713; ' : ''}Level ${m.level} &mdash; ${m.label}
                                    </span>
                                    <span style="font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted);">
                                        ${earned ? `${m.discount}% OFF` : `${Math.round(progress * 100)}%`}
                                    </span>
                                </div>
                                <div class="xp-bar-wrap" style="height:3px;">
                                    <div class="xp-bar-fill" style="width:${Math.round(progress * 100)}%"></div>
                                </div>
                                ${earned && coupon ? `
                                    <div class="reward-coupon-code">
                                        <span style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--teal); letter-spacing:1px;">
                                            ${coupon.coupon_code}
                                        </span>
                                        ${coupon.redeemed
                                            ? '<span style="font-size:0.5625rem; color:var(--text-muted); margin-left:8px;">Redeemed</span>'
                                            : `<button class="btn-copy-coupon" data-code="${coupon.coupon_code}" style="font-size:0.5625rem; color:var(--accent); background:none; border:1px solid var(--teal-border); border-radius:4px; padding:2px 8px; cursor:pointer;">Copy</button>`
                                        }
                                    </div>
                                ` : ''}
                                ${earned && !coupon && !isLoggedIn ? `
                                    <div style="font-size:0.5625rem; color:var(--text-muted); margin-top:4px;">
                                        Sign in to claim your coupon code
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Lottery Section -->
                <div style="margin-bottom:20px;">
                    <div style="font-family:var(--font-mono); font-size:0.75rem; font-weight:500; color:var(--text-heading); margin-bottom:10px;">
                        Weekly Product Lottery
                    </div>
                    <div class="reward-lottery-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <div>
                                <div style="font-size:0.8125rem; color:var(--text-heading);">
                                    Your Entries: <span style="color:var(--teal); font-family:var(--font-mono);">${isLoggedIn ? this._lotteryEntries : lotteryEarned}</span>
                                </div>
                                <div style="font-size:0.5625rem; color:var(--text-muted);">
                                    1 entry per ${LOTTERY_XP_PER_ENTRY} XP earned &bull; ${xpToNextEntry} XP to next entry
                                </div>
                            </div>
                            <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted); text-align:right;">
                                ${this._getCurrentPeriod()}
                            </div>
                        </div>
                        <div class="xp-bar-wrap" style="height:3px;">
                            <div class="xp-bar-fill" style="width:${Math.round(((totalXp % LOTTERY_XP_PER_ENTRY) / LOTTERY_XP_PER_ENTRY) * 100)}%"></div>
                        </div>
                        <div style="font-size:0.625rem; color:var(--text-body); margin-top:8px;">
                            Prize: Free product from our botanical collection. Winners drawn weekly.
                        </div>
                        ${!isLoggedIn ? `
                            <div style="font-size:0.5625rem; color:var(--text-muted); margin-top:6px; border-top:1px solid var(--border-light); padding-top:6px;">
                                Sign in to enter the lottery and sync your entries
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${this._coupons.length === 0 && level < 5 ? `
                <div style="text-align:center; padding:16px; background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:8px; margin-bottom:20px;">
                    <div style="font-size:0.8125rem; color:var(--text-heading); margin-bottom:4px;">Keep learning to unlock rewards</div>
                    <div style="font-size:0.6875rem; color:var(--text-muted);">Reach Level 5 to earn your first discount coupon</div>
                </div>
                ` : ''}

                ${this._pastWinners.length > 0 ? `
                <!-- Past Winners -->
                <div>
                    <div style="font-family:var(--font-mono); font-size:0.75rem; font-weight:500; color:var(--text-heading); margin-bottom:8px;">
                        Past Winners
                    </div>
                    ${this._pastWinners.map(w => `
                        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-light); font-size:0.625rem;">
                            <span style="color:var(--text-body);">${w.winner?.display_name || 'Anonymous'}</span>
                            <span style="color:var(--text-muted);">${w.prize_description} &bull; ${w.period}</span>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
            </div>
        `;

        this._injectHTML(html);
        this._bindEvents();
    }

    _bindEvents() {
        document.getElementById('btn-rewards-back')?.addEventListener('click', () => {
            soundManager.play('click');
            this._goBack();
        });

        // Copy coupon code buttons
        document.querySelectorAll('.btn-copy-coupon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const code = e.currentTarget.dataset.code;
                navigator.clipboard?.writeText(code).then(() => {
                    showToast('COPIED', code, 'success');
                    soundManager.play('xp');
                }).catch(() => {
                    showToast('COUPON', code, 'success');
                });
            });
        });
    }

    _goBack() {
        this._clearUI();
        transitionTo(this, 'HubScene');
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('rewards-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

}
