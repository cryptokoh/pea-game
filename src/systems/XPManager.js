/**
 * XP & Leveling System
 * Awards XP, tracks levels, manages streaks.
 * Persists to localStorage immediately, syncs to Supabase when available.
 */

const XP_PER_LEVEL = 500;
const STORAGE_KEY = 'nf_sq_player';

class XPManager {
    constructor() {
        this._player = this._load();
        this._listeners = [];
    }

    _load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return JSON.parse(saved);
        } catch { /* ignore */ }
        return {
            displayName: 'Rep',
            level: 1,
            totalXp: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActive: null,
            questsCompleted: [],
            quizResults: {}
        };
    }

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._player));
        } catch { /* ignore */ }
        this._notify();
    }

    _notify() {
        this._listeners.forEach(fn => fn(this._player));
    }

    onChange(fn) {
        this._listeners.push(fn);
        return () => { this._listeners = this._listeners.filter(f => f !== fn); };
    }

    get player() { return { ...this._player }; }
    get level() { return this._player.level; }
    get totalXp() { return this._player.totalXp; }
    get xpInLevel() { return this._player.totalXp % XP_PER_LEVEL; }
    get xpToNext() { return XP_PER_LEVEL; }
    get xpProgress() { return this.xpInLevel / XP_PER_LEVEL; }

    setPlayer(data) {
        Object.assign(this._player, data);
        this._save();
    }

    /**
     * Award XP and check for level-up.
     * Returns { xpAwarded, newLevel, leveledUp }
     */
    award(amount, source) {
        const oldLevel = this._player.level;
        this._player.totalXp += amount;
        this._player.level = Math.floor(this._player.totalXp / XP_PER_LEVEL) + 1;
        this._save();

        const leveledUp = this._player.level > oldLevel;

        // Show toast
        showToast(`+${amount} XP`, source);

        if (leveledUp) {
            setTimeout(() => {
                showToast(`LEVEL UP!`, `You are now Level ${this._player.level}`, 'levelup');

                // HUD glow animation
                const hud = document.getElementById('hud');
                if (hud) {
                    hud.classList.add('hud-level-up');
                    setTimeout(() => hud.classList.remove('hud-level-up'), 1500);
                }

                // Play level-up sound
                try {
                    import('./SoundManager.js').then(m => m.soundManager.play('levelup'));
                } catch { /* ignore */ }

                // Check milestone coupons on level-up (background)
                this._checkMilestoneCoupon();
            }, 600);
        }

        return { xpAwarded: amount, newLevel: this._player.level, leveledUp };
    }

    async _checkMilestoneCoupon() {
        try {
            const { dataBridge } = await import('./DataBridge.js');
            if (!dataBridge.playerId) return;
            const { gameClient } = await import('../config/supabase.js');
            const { data } = await gameClient.rpc('check_milestone_coupon', {
                p_player_id: dataBridge.playerId
            });
            if (data && Array.isArray(data)) {
                data.forEach(coupon => {
                    if (coupon.new) {
                        showToast('REWARD UNLOCKED!', `${coupon.discount_percent}% off — Code: ${coupon.coupon_code}`, 'success');
                    }
                });
            }
        } catch { /* ignore — rewards check is best-effort */ }
    }

    completeQuest(questId) {
        if (!this._player.questsCompleted.includes(questId)) {
            this._player.questsCompleted.push(questId);
            this._save();
        }
    }

    isQuestCompleted(questId) {
        return this._player.questsCompleted.includes(questId);
    }

    saveQuizResult(locationId, score, total, passed) {
        this._player.quizResults[locationId] = { score, total, passed, date: new Date().toISOString() };
        this._save();
    }

    getQuizResult(locationId) {
        return this._player.quizResults[locationId] || null;
    }

    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        if (this._player.lastActive === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (this._player.lastActive === yesterdayStr) {
            this._player.currentStreak++;
        } else if (this._player.lastActive !== today) {
            this._player.currentStreak = 1;
        }

        if (this._player.currentStreak > this._player.longestStreak) {
            this._player.longestStreak = this._player.currentStreak;
        }

        this._player.lastActive = today;
        this._save();
    }
}

// ── Toast helper ──
// variant: 'xp' (default), 'success', 'error', 'levelup'
export function showToast(xpText, message, variant = 'xp') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (variant && variant !== 'xp') toast.classList.add(`toast-${variant}`);
    toast.innerHTML = `
        <span class="toast-xp">${xpText}</span>
        <span class="toast-msg">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
}

export const xpManager = new XPManager();
