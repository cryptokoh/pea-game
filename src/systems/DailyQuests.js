/**
 * DailyQuests — Time-limited daily objectives that reset every 24 hours.
 * Each day at local midnight, 3 random quests are selected from the pool.
 * State persists in localStorage under `nf_sq_daily`.
 */

import { xpManager } from './XPManager.js';

const STORAGE_KEY = 'nf_sq_daily';
const QUESTS_PER_DAY = 3;

const DAILY_QUESTS = [
    {
        id: 'read_article',
        title: 'Knowledge Seeker',
        description: 'Read 1 library article today',
        icon: '\u{1F4D6}',
        xpReward: 25,
    },
    {
        id: 'complete_quiz',
        title: 'Quiz Master',
        description: 'Pass any quiz today',
        icon: '\u{1F3AF}',
        xpReward: 30,
    },
    {
        id: 'visit_location',
        title: 'Explorer',
        description: 'Visit any map location today',
        icon: '\u{1F5FA}',
        xpReward: 20,
    },
    {
        id: 'perfect_pitch',
        title: 'Silver Tongue',
        description: 'Get a B or higher on a pitch',
        icon: '\u{1F3A4}',
        xpReward: 40,
    },
    {
        id: 'streak_keeper',
        title: 'Consistency',
        description: 'Log in today (streak +1)',
        icon: '\u{1F525}',
        xpReward: 15,
    },
];

/**
 * Returns today's date as YYYY-MM-DD in local time.
 */
function getTodayKey() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Deterministic-ish shuffle seeded by date string so the same day
 * always yields the same quest selection (per device).
 * Falls back to random selection if needed.
 */
function selectQuestsForDay(dateKey) {
    // Simple hash from date string for seed
    let seed = 0;
    for (let i = 0; i < dateKey.length; i++) {
        seed = ((seed << 5) - seed + dateKey.charCodeAt(i)) | 0;
    }

    // Fisher-Yates shuffle with seeded pseudo-random
    const pool = [...DAILY_QUESTS];
    for (let i = pool.length - 1; i > 0; i--) {
        seed = (seed * 16807 + 0) % 2147483647;
        const j = Math.abs(seed) % (i + 1);
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, QUESTS_PER_DAY).map(q => q.id);
}

class DailyQuests {
    constructor() {
        this._state = this._load();
        this._ensureToday();
    }

    // ── Persistence ──

    _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch { /* ignore corrupt data */ }
        return null;
    }

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
        } catch { /* storage full or unavailable */ }
    }

    // ── Day management ──

    /**
     * Check if the stored state is for today.
     * If not (or if no state exists), generate a fresh day.
     */
    _ensureToday() {
        const today = getTodayKey();

        if (this._state && this._state.date === today) {
            return; // Already current
        }

        // New day — pick 3 random quests
        const selectedIds = selectQuestsForDay(today);

        this._state = {
            date: today,
            quests: selectedIds.map(id => ({
                questId: id,
                completed: false,
                claimed: false,
            })),
        };

        this._save();
    }

    // ── Public API ──

    /**
     * Returns today's quests with full metadata.
     * @returns {Array<{quest: object, completed: boolean, claimed: boolean}>}
     */
    getToday() {
        this._ensureToday();

        return this._state.quests.map(entry => {
            const questDef = DAILY_QUESTS.find(q => q.id === entry.questId);
            return {
                quest: questDef ? { ...questDef } : null,
                completed: entry.completed,
                claimed: entry.claimed,
            };
        }).filter(item => item.quest !== null);
    }

    /**
     * Mark a daily quest as completed (but not yet claimed).
     * @param {string} questId
     * @returns {boolean} true if state changed
     */
    markCompleted(questId) {
        this._ensureToday();

        const entry = this._state.quests.find(q => q.questId === questId);
        if (!entry || entry.completed) return false;

        entry.completed = true;
        this._save();
        return true;
    }

    /**
     * Claim XP reward for a completed daily quest.
     * Awards XP through xpManager and marks as claimed.
     * @param {string} questId
     * @returns {{xpAwarded: number, newLevel: number, leveledUp: boolean}|null}
     */
    claimReward(questId) {
        this._ensureToday();

        const entry = this._state.quests.find(q => q.questId === questId);
        if (!entry || !entry.completed || entry.claimed) return null;

        const questDef = DAILY_QUESTS.find(q => q.id === questId);
        if (!questDef) return null;

        entry.claimed = true;
        this._save();

        return xpManager.award(questDef.xpReward, `Daily: ${questDef.title}`);
    }

    /**
     * Get time remaining until daily reset (next local midnight).
     * @returns {{hours: number, minutes: number, totalMinutes: number}}
     */
    getTimeRemaining() {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);

        const diffMs = midnight - now;
        const totalMinutes = Math.max(0, Math.floor(diffMs / 60000));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return { hours, minutes, totalMinutes };
    }

    /**
     * Check if a specific quest is active today.
     * @param {string} questId
     * @returns {boolean}
     */
    isActiveToday(questId) {
        this._ensureToday();
        return this._state.quests.some(q => q.questId === questId);
    }

    /**
     * Get the full quest pool (for UI display / reference).
     * @returns {Array<object>}
     */
    getQuestPool() {
        return DAILY_QUESTS.map(q => ({ ...q }));
    }
}

export const dailyQuests = new DailyQuests();
