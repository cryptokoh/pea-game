/**
 * LearningProgress — Per-section reading/completion tracking.
 * localStorage is the source of truth; Supabase syncs in background.
 */

import { dataBridge } from './DataBridge.js';

const STORAGE_KEY = 'nf_pea_learning_progress';

class LearningProgressManager {
    constructor() {
        this._progress = this._load();
    }

    _load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    }

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._progress));
        } catch { /* ignore */ }
    }

    /**
     * Mark a section as completed.
     * @param {string} topicKey - e.g. 'growing'
     * @param {string} sectionId - e.g. 'growing-trees-living'
     * @param {number} xpAwarded
     */
    complete(topicKey, sectionId, xpAwarded = 0) {
        if (this._progress[sectionId]) return false; // Already completed

        this._progress[sectionId] = {
            topicKey,
            xpAwarded,
            completedAt: new Date().toISOString()
        };
        this._save();

        // Background sync to Supabase
        this._syncToServer(topicKey, sectionId, xpAwarded);

        return true; // Was new completion
    }

    /** Check if a section has been completed */
    isCompleted(sectionId) {
        return !!this._progress[sectionId];
    }

    /** Get count of completed sections for a topic */
    getTopicProgress(topicKey) {
        return Object.values(this._progress).filter(p => p.topicKey === topicKey).length;
    }

    /** Get total completed sections across all topics */
    get totalCompleted() {
        return Object.keys(this._progress).length;
    }

    /** Get all completed section IDs */
    get completedSections() {
        return Object.keys(this._progress);
    }

    /** Get total XP earned from learning */
    get totalXpEarned() {
        return Object.values(this._progress).reduce((sum, p) => sum + (p.xpAwarded || 0), 0);
    }

    /** Merge local progress to server on login */
    async mergeToServer() {
        if (!dataBridge.playerId) return;

        const entries = Object.entries(this._progress);
        for (const [sectionId, data] of entries) {
            await this._syncToServer(data.topicKey, sectionId, data.xpAwarded);
        }
    }

    async _syncToServer(topicKey, sectionId, xpAwarded) {
        if (!dataBridge.playerId) return;

        try {
            const { gameClient } = await import('../config/supabase.js');
            await gameClient.from('learning_progress').upsert({
                player_id: dataBridge.playerId,
                topic_key: topicKey,
                section_id: sectionId,
                completed: true,
                xp_awarded: xpAwarded
            }, { onConflict: 'player_id,section_id' });
        } catch (err) {
            console.warn('LearningProgress sync failed:', err.message);
        }
    }
}

export const learningProgress = new LearningProgressManager();
