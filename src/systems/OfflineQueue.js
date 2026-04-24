/**
 * OfflineQueue — Queues failed Supabase operations for retry when back online.
 * Stores pending operations in localStorage and retries on reconnection.
 */

const QUEUE_KEY = 'nf_sq_offline_queue';

class OfflineQueue {
    constructor() {
        this._queue = this._load();
        this._processing = false;
        this._online = navigator.onLine;

        // Listen for connectivity changes
        window.addEventListener('online', () => {
            this._online = true;
            this.flush();
        });
        window.addEventListener('offline', () => {
            this._online = false;
        });
    }

    get isOnline() { return this._online; }
    get pending() { return this._queue.length; }

    /**
     * Enqueue a failed operation for retry.
     * @param {string} type - Operation type (e.g. 'award_xp', 'complete_quest')
     * @param {object} payload - The operation data
     */
    enqueue(type, payload) {
        this._queue.push({
            id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            type,
            payload,
            attempts: 0,
            createdAt: new Date().toISOString()
        });
        this._save();
        console.log(`OfflineQueue: Enqueued ${type} (${this._queue.length} pending)`);
    }

    /**
     * Flush the queue — retry all pending operations.
     * Called automatically when coming back online.
     */
    async flush() {
        if (this._processing || this._queue.length === 0 || !this._online) return;

        this._processing = true;
        console.log(`OfflineQueue: Flushing ${this._queue.length} operations...`);

        const remaining = [];
        for (const op of this._queue) {
            op.attempts++;
            try {
                await this._execute(op);
                console.log(`OfflineQueue: ${op.type} succeeded`);
            } catch (err) {
                console.warn(`OfflineQueue: ${op.type} failed (attempt ${op.attempts})`, err.message);
                if (op.attempts < 5) {
                    remaining.push(op);
                } else {
                    console.error(`OfflineQueue: Dropping ${op.type} after 5 attempts`);
                }
            }
        }

        this._queue = remaining;
        this._save();
        this._processing = false;

        if (remaining.length > 0) {
            // Retry remaining after delay
            setTimeout(() => this.flush(), 5000);
        }
    }

    async _execute(op) {
        // Dynamically import to avoid circular dependencies
        const { gameClient } = await import('../config/supabase.js');

        switch (op.type) {
            case 'award_xp': {
                const { error } = await gameClient.rpc('award_xp', op.payload);
                if (error) throw error;
                break;
            }
            case 'complete_quest': {
                const { playerId, questsCompleted } = op.payload;
                const { error } = await gameClient
                    .from('player_profiles')
                    .update({ quests_completed: questsCompleted, updated_at: new Date().toISOString() })
                    .eq('id', playerId);
                if (error) throw error;
                break;
            }
            case 'save_quiz': {
                const { error } = await gameClient.from('quiz_results').insert(op.payload);
                if (error) throw error;
                break;
            }
            case 'update_profile': {
                const { playerId, ...updates } = op.payload;
                const { error } = await gameClient
                    .from('player_profiles')
                    .update({ ...updates, updated_at: new Date().toISOString() })
                    .eq('id', playerId);
                if (error) throw error;
                break;
            }
            default:
                console.warn(`OfflineQueue: Unknown operation type: ${op.type}`);
        }
    }

    _load() {
        try {
            return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        } catch { return []; }
    }

    _save() {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(this._queue));
        } catch { /* storage full */ }
    }
}

export const offlineQueue = new OfflineQueue();
