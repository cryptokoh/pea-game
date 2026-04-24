/**
 * DataBridge — Supabase sync layer for game state.
 * localStorage is the source of truth for responsiveness;
 * Supabase is the durable backend that syncs in the background.
 */

import { gameClient, repsClient, auth } from '../config/supabase.js';
import { xpManager } from './XPManager.js';

class DataBridge {
    constructor() {
        this._session = null;
        this._player = null;
        this._syncing = false;
    }

    /** Check auth and load/create player profile */
    async init() {
        const { data: { session } } = await auth.getSession();
        this._session = session;

        if (!session) return { authenticated: false, player: null };

        // Get or create player via RPC
        const { data: player, error } = await gameClient.rpc('get_or_create_player', {
            p_display_name: 'New Player',
            p_role: 'rep'
        });

        if (error) {
            console.warn('DataBridge: get_or_create_player failed, using localStorage', error.message);
            return { authenticated: true, player: null };
        }

        this._player = player;

        // Sync server state -> localStorage
        xpManager.setPlayer({
            displayName: player.display_name,
            level: player.level,
            totalXp: player.total_xp,
            currentStreak: player.current_streak,
            longestStreak: player.longest_streak,
            lastActive: player.last_active,
            questsCompleted: player.quests_completed || [],
            quizResults: player.quiz_results || {}
        });

        // Update streak
        const { data: streakResult } = await gameClient.rpc('update_streak', {
            p_player_id: player.id
        });
        if (streakResult?.updated) {
            xpManager.setPlayer({
                currentStreak: streakResult.streak,
                longestStreak: streakResult.longest
            });
        }

        return { authenticated: true, player };
    }

    get isAuthenticated() { return !!this._session; }
    get playerId() { return this._player?.id; }
    get userId() { return this._session?.user?.id; }

    /** Award XP via Supabase RPC (atomic), fall back to localStorage */
    async awardXP(amount, source, sourceId = null, note = null) {
        // Always award locally first for instant feedback
        const localResult = xpManager.award(amount, source);

        if (!this._player) return localResult;

        // Sync to Supabase in background
        const { data, error } = await gameClient.rpc('award_xp', {
            p_player_id: this._player.id,
            p_amount: amount,
            p_source: source,
            p_source_id: sourceId,
            p_note: note
        });

        if (error) {
            console.warn('DataBridge: award_xp failed, localStorage has the data', error.message);
        } else if (data) {
            // Sync server-computed values back
            xpManager.setPlayer({
                totalXp: data.total_xp,
                level: data.level
            });
        }

        return localResult;
    }

    /** Save quest completion to Supabase */
    async completeQuest(locationId) {
        xpManager.completeQuest(locationId);

        if (!this._player) return;

        // Update quests_completed array on player profile
        const { error } = await gameClient
            .from('player_profiles')
            .update({
                quests_completed: xpManager.player.questsCompleted,
                updated_at: new Date().toISOString()
            })
            .eq('id', this._player.id);

        if (error) {
            console.warn('DataBridge: completeQuest update failed', error.message);
        }

        // Also update quest_progress table
        const { data: quests } = await gameClient
            .from('quests')
            .select('id')
            .eq('location_id', locationId)
            .eq('active', true)
            .limit(1)
            .maybeSingle();

        if (quests) {
            await gameClient
                .from('quest_progress')
                .upsert({
                    player_id: this._player.id,
                    quest_id: quests.id,
                    current_value: 1,
                    completed: true,
                    completed_at: new Date().toISOString(),
                    claimed: true
                }, { onConflict: 'player_id,quest_id' });
        }
    }

    /** Save quiz result to Supabase */
    async saveQuizResult(locationId, quizTitle, score, totalQuestions, passed) {
        xpManager.saveQuizResult(locationId, score, totalQuestions, passed);

        if (!this._player) return;

        // Insert into quiz_results table
        await gameClient.from('quiz_results').insert({
            player_id: this._player.id,
            location_id: locationId,
            quiz_title: quizTitle,
            score,
            total_questions: totalQuestions,
            passed
        });

        // Update quiz_results JSONB on player profile
        await gameClient
            .from('player_profiles')
            .update({
                quiz_results: xpManager.player.quizResults,
                updated_at: new Date().toISOString()
            })
            .eq('id', this._player.id);
    }

    /** Update display name on server */
    async updateDisplayName(name) {
        xpManager.setPlayer({ displayName: name });

        if (!this._player) return;

        await gameClient
            .from('player_profiles')
            .update({ display_name: name, updated_at: new Date().toISOString() })
            .eq('id', this._player.id);
    }

    /** Save settings to server */
    async saveSettings(settingsObj) {
        if (!this._player) return;

        await gameClient
            .from('player_profiles')
            .update({ settings: settingsObj, updated_at: new Date().toISOString() })
            .eq('id', this._player.id);
    }

    /** Get leaderboard — all players sorted by XP */
    async getLeaderboard(limit = 20) {
        const { data } = await gameClient
            .from('player_profiles')
            .select('display_name, level, total_xp, current_streak, quests_completed, avatar_key')
            .order('total_xp', { ascending: false })
            .limit(limit);

        return data || [];
    }

    /** Get achievements for current player */
    async getMyAchievements() {
        if (!this._player) return [];

        const { data } = await gameClient
            .from('player_achievements')
            .select('achievement_id, earned_at, achievements(key, title, description, icon_key, category)')
            .eq('player_id', this._player.id);

        return data || [];
    }

    /** Login with email/password */
    async login(email, password) {
        const { data, error } = await auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };

        this._session = data.session;
        return this.init();
    }

    /** Logout */
    async logout() {
        await auth.signOut();
        this._session = null;
        this._player = null;
    }
}

export const dataBridge = new DataBridge();
