/**
 * Achievement System — Runtime checking and popup notifications.
 * Checks player state after XP awards, quest completions, etc.
 * Persists earned achievements to localStorage and syncs to Supabase via DataBridge.
 */

import { xpManager } from './XPManager.js';
import { dataBridge } from './DataBridge.js';

// Try to import soundManager — it may not be loaded yet
let soundManager = null;
import('./SoundManager.js').then(m => { soundManager = m.soundManager; }).catch(() => {});

const STORAGE_KEY = 'nf_sq_achievements';
const LIBRARY_READ_KEY = 'nf_sq_library_read';

const ACHIEVEMENTS = [
    {
        key: 'first_quest',
        title: 'First Steps',
        description: 'Complete your first quest',
        icon: '\u{1F3C3}',
        category: 'quest',
        check: (p) => p.questsCompleted.length >= 1
    },
    {
        key: 'five_quests',
        title: 'Trailblazer',
        description: 'Complete 5 quests',
        icon: '\u{1F5FA}',
        category: 'quest',
        check: (p) => p.questsCompleted.length >= 5
    },
    {
        key: 'all_austin',
        title: 'Austin Legend',
        description: 'Complete all Austin quests',
        icon: '\u{1F31F}',
        category: 'quest',
        check: (p) => p.questsCompleted.length >= 10
    },
    {
        key: 'perfect_quiz',
        title: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '\u{1F3AF}',
        category: 'quiz',
        check: (p) => Object.values(p.quizResults).some(r => r.score === r.total)
    },
    {
        key: 'streak_7',
        title: 'Week Warrior',
        description: '7-day login streak',
        icon: '\u{1F525}',
        category: 'streak',
        check: (p) => p.currentStreak >= 7
    },
    {
        key: 'streak_30',
        title: 'Monthly Master',
        description: '30-day login streak',
        icon: '\u{1F48E}',
        category: 'streak',
        check: (p) => p.currentStreak >= 30
    },
    {
        key: 'pitch_ace',
        title: 'Pitch Perfect',
        description: 'Get an A grade on any pitch',
        icon: '\u{1F3A4}',
        category: 'pitch'
        // No automatic check — triggered via checkPitchGrade()
    },
    {
        key: 'level_5',
        title: 'Rising Star',
        description: 'Reach Level 5',
        icon: '\u{2B50}',
        category: 'level',
        check: (p) => p.level >= 5
    },
    {
        key: 'level_10',
        title: 'Sales Master',
        description: 'Reach Level 10',
        icon: '\u{1F451}',
        category: 'level',
        check: (p) => p.level >= 10
    },
    {
        key: 'library_reader',
        title: 'Scholar',
        description: 'Read 10 library articles',
        icon: '\u{1F4D6}',
        category: 'library'
        // No automatic check — triggered via checkLibraryReads()
    }
];

class AchievementManager {
    constructor() {
        this._earned = this._loadEarned();
        this._popupQueue = [];
        this._showing = false;
    }

    /** Load earned achievement keys from localStorage */
    _loadEarned() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return new Set(JSON.parse(saved));
        } catch { /* ignore */ }
        return new Set();
    }

    /** Persist earned keys to localStorage */
    _saveEarned() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._earned]));
        } catch { /* ignore */ }
    }

    /** Get all achievement definitions */
    get definitions() { return ACHIEVEMENTS; }

    /** Get keys of all earned achievements */
    get earned() { return [...this._earned]; }

    /** Check if a specific achievement has been earned */
    hasEarned(key) { return this._earned.has(key); }

    /**
     * Run all automatic checks against current player state.
     * Call this after XP awards, quest completions, streak updates.
     */
    check() {
        const player = xpManager.player;

        for (const achievement of ACHIEVEMENTS) {
            if (this._earned.has(achievement.key)) continue;
            if (!achievement.check) continue;

            if (achievement.check(player)) {
                this._earn(achievement);
            }
        }
    }

    /**
     * Check pitch-specific achievement.
     * @param {string} grade — Letter grade (A, B, C, D, F)
     */
    checkPitchGrade(grade) {
        if (this._earned.has('pitch_ace')) return;
        if (grade === 'A') {
            const achievement = ACHIEVEMENTS.find(a => a.key === 'pitch_ace');
            if (achievement) this._earn(achievement);
        }
    }

    /**
     * Check library reading achievement.
     * Reads from localStorage key nf_sq_library_read (array of article IDs).
     */
    checkLibraryReads() {
        if (this._earned.has('library_reader')) return;
        try {
            const reads = JSON.parse(localStorage.getItem(LIBRARY_READ_KEY) || '[]');
            if (reads.length >= 10) {
                const achievement = ACHIEVEMENTS.find(a => a.key === 'library_reader');
                if (achievement) this._earn(achievement);
            }
        } catch { /* ignore */ }
    }

    /** Mark achievement as earned and show popup */
    _earn(achievement) {
        this._earned.add(achievement.key);
        this._saveEarned();

        // Queue the popup
        this._popupQueue.push(achievement);
        if (!this._showing) this._showNext();

        // Sync to Supabase if connected
        if (dataBridge.isAuthenticated && dataBridge.playerId) {
            this._syncToServer(achievement.key).catch(() => {});
        }
    }

    /** Sync earned achievement to Supabase */
    async _syncToServer(key) {
        try {
            const { gameClient } = await import('../config/supabase.js');
            // Find achievement ID by key
            const { data: achRow } = await gameClient
                .from('achievements')
                .select('id')
                .eq('key', key)
                .maybeSingle();

            if (achRow) {
                await gameClient.from('player_achievements').upsert({
                    player_id: dataBridge.playerId,
                    achievement_id: achRow.id
                }, { onConflict: 'player_id,achievement_id' });
            }
        } catch {
            // Silent fail — localStorage has the data
        }
    }

    /** Show next popup in queue */
    _showNext() {
        if (this._popupQueue.length === 0) {
            this._showing = false;
            return;
        }

        this._showing = true;
        const achievement = this._popupQueue.shift();
        this._showPopup(achievement);
    }

    /** Create and display the achievement popup with confetti celebration */
    _showPopup(achievement) {
        // Play achievement sound
        if (soundManager) {
            try { soundManager.play('achievement'); } catch { /* ignore */ }
        }

        const overlay = document.getElementById('ui-overlay');
        if (!overlay) {
            this._showNext();
            return;
        }

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.setAttribute('style', [
            'position:fixed',
            'inset:0',
            'z-index:500',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'pointer-events:auto',
            'background:rgba(18,24,26,0.6)',
            'animation:ach-backdrop-in 0.3s ease'
        ].join(';'));

        // Confetti container
        const confettiWrap = document.createElement('div');
        confettiWrap.setAttribute('style', 'position:absolute;inset:0;overflow:hidden;pointer-events:none;');
        const confettiColors = ['#50e8c0', '#c4a265', '#6b8f71', '#9b7ed8', '#bccac4'];
        for (let i = 0; i < 30; i++) {
            const piece = document.createElement('div');
            const color = confettiColors[i % confettiColors.length];
            const left = Math.random() * 100;
            const delay = Math.random() * 1.5;
            const size = 4 + Math.random() * 6;
            const rotation = Math.random() * 360;
            piece.setAttribute('style', [
                `position:absolute`,
                `top:-10px`,
                `left:${left}%`,
                `width:${size}px`,
                `height:${size * 0.6}px`,
                `background:${color}`,
                `border-radius:1px`,
                `opacity:0.8`,
                `transform:rotate(${rotation}deg)`,
                `animation:ach-confetti-fall ${2 + Math.random()}s ease-out ${delay}s forwards`
            ].join(';'));
            confettiWrap.appendChild(piece);
        }
        backdrop.appendChild(confettiWrap);

        // Create card
        const card = document.createElement('div');
        card.setAttribute('style', [
            'background:rgba(18,24,26,0.95)',
            'border:1px solid rgba(80,232,192,0.15)',
            'border-radius:4px',
            'padding:28px 32px',
            'text-align:center',
            'max-width:340px',
            'width:90%',
            'box-shadow:0 8px 40px rgba(0,0,0,0.5), 0 0 60px rgba(80,232,192,0.08)',
            'animation:ach-slide-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            'position:relative',
            'overflow:hidden',
            'z-index:1'
        ].join(';'));

        // Decorative top accent line
        const accent = document.createElement('div');
        accent.setAttribute('style', [
            'position:absolute',
            'top:0',
            'left:0',
            'right:0',
            'height:2px',
            'background:linear-gradient(90deg, transparent, #50e8c0, transparent)'
        ].join(';'));

        // Label
        const label = document.createElement('div');
        label.textContent = 'ACHIEVEMENT UNLOCKED';
        label.setAttribute('style', [
            'font-family:\'JetBrains Mono\', monospace',
            'font-size:0.5625rem',
            'font-weight:400',
            'color:#506460',
            'text-transform:uppercase',
            'letter-spacing:0.12em',
            'margin-bottom:14px'
        ].join(';'));

        // Icon with pulse
        const icon = document.createElement('div');
        icon.textContent = achievement.icon;
        icon.setAttribute('style', [
            'font-size:3rem',
            'line-height:1',
            'margin-bottom:12px',
            'filter:drop-shadow(0 0 16px rgba(80,232,192,0.4))',
            'animation:ach-icon-pulse 1.5s ease-in-out infinite'
        ].join(';'));

        // Title with glitch
        const title = document.createElement('div');
        title.textContent = achievement.title;
        title.setAttribute('style', [
            'font-family:\'Inter\', system-ui, sans-serif',
            'font-size:1.25rem',
            'font-weight:500',
            'color:#bccac4',
            'margin-bottom:6px',
            'animation:ach-glitch 3s ease-in-out infinite'
        ].join(';'));

        // Description
        const desc = document.createElement('div');
        desc.textContent = achievement.description;
        desc.setAttribute('style', [
            'font-family:\'JetBrains Mono\', monospace',
            'font-size:0.6875rem',
            'font-weight:300',
            'color:#8e9c98',
            'line-height:1.4'
        ].join(';'));

        // Category tag
        const tag = document.createElement('div');
        tag.textContent = achievement.category.toUpperCase();
        tag.setAttribute('style', [
            'display:inline-block',
            'margin-top:14px',
            'padding:3px 12px',
            'border-radius:2px',
            'font-family:\'JetBrains Mono\', monospace',
            'font-size:0.5rem',
            'font-weight:400',
            'color:#50e8c0',
            'background:rgba(80,232,192,0.07)',
            'border:1px solid rgba(80,232,192,0.05)',
            'text-transform:uppercase',
            'letter-spacing:0.08em'
        ].join(';'));

        // Assemble card
        card.appendChild(accent);
        card.appendChild(label);
        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(tag);
        backdrop.appendChild(card);

        // Inject keyframe animations (only once)
        this._injectStyles();

        overlay.appendChild(backdrop);

        // Click to dismiss early
        backdrop.addEventListener('click', () => {
            this._dismissPopup(backdrop);
        });

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            this._dismissPopup(backdrop);
        }, 3000);
    }

    /** Dismiss popup with fade-out and show next in queue */
    _dismissPopup(backdrop) {
        if (!backdrop || !backdrop.parentNode) {
            this._showNext();
            return;
        }

        backdrop.style.animation = 'ach-backdrop-out 0.3s ease forwards';
        const card = backdrop.firstElementChild;
        if (card) {
            card.style.animation = 'ach-slide-out 0.3s ease forwards';
        }

        setTimeout(() => {
            if (backdrop.parentNode) backdrop.remove();
            this._showNext();
        }, 300);
    }

    /** Inject CSS keyframes for achievement animations (idempotent) */
    _injectStyles() {
        if (document.getElementById('ach-styles')) return;

        const style = document.createElement('style');
        style.id = 'ach-styles';
        style.textContent = `
            @keyframes ach-backdrop-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes ach-backdrop-out {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes ach-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(60px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            @keyframes ach-slide-out {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
            }
            @keyframes ach-glitch {
                0%, 100% { text-shadow: 0 0 8px rgba(80,232,192,0.3); }
                20% { text-shadow: -2px 0 rgba(80,232,192,0.5), 2px 0 rgba(196,92,75,0.3); }
                40% { text-shadow: 2px 0 rgba(80,232,192,0.5), -2px 0 rgba(196,92,75,0.3); }
                60% { text-shadow: 0 0 8px rgba(80,232,192,0.3); }
            }
            @keyframes ach-confetti-fall {
                0% { transform: translateY(0) rotate(0deg); opacity: 0.9; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            @keyframes ach-icon-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Load earned achievements from server (call after DataBridge init).
     * Merges server state into local state so nothing is lost.
     */
    async syncFromServer() {
        try {
            const serverAchievements = await dataBridge.getMyAchievements();
            if (serverAchievements && serverAchievements.length > 0) {
                let changed = false;
                for (const row of serverAchievements) {
                    const key = row.achievements?.key;
                    if (key && !this._earned.has(key)) {
                        this._earned.add(key);
                        changed = true;
                    }
                }
                if (changed) this._saveEarned();
            }
        } catch {
            // Silent fail — localStorage has the data
        }
    }
}

export const achievementManager = new AchievementManager();
