/**
 * LeaderboardScene -- Retro hacker-styled leaderboard overlay.
 * Shows ranked player stats from Supabase with terminal aesthetic.
 * Falls back to local player data when offline.
 */

import { Scene, Math as PMath } from 'phaser';
import { dataBridge } from '../systems/DataBridge.js';
import { xpManager } from '../systems/XPManager.js';

export class LeaderboardScene extends Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Semi-transparent backdrop
        this._backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x12181a, 0.85)
            .setInteractive();
        this._backdrop.on('pointerdown', () => this._close());

        // Matrix rain background
        this._matrixRain(w, h);

        // Show loading state, then fetch
        this._showLoading();
        this._fetchLeaderboard();
    }

    // ── Loading state ──

    _showLoading() {
        this._clearUI();

        const html = `
            <div class="scene-panel" id="leaderboard-panel" style="max-width:560px; margin:0 auto; padding-bottom:80px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h2 class="scene-heading glitch-text" style="margin:0; font-family:var(--font-mono);">// LEADERBOARD</h2>
                    <button class="btn btn-ghost" id="btn-close-lb" style="font-size:1.25rem; padding:4px 8px;">\u2715</button>
                </div>

                <div style="text-align:center; padding:60px 0;">
                    <div style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); margin-bottom:12px;">
                        FETCHING RANKINGS
                    </div>
                    <div class="typing-indicator" style="justify-content:center;">
                        <span></span><span></span><span></span>
                    </div>
                    <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); margin-top:12px;">
                        > querying player_profiles...
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);
        document.getElementById('btn-close-lb')?.addEventListener('click', () => this._close());
    }

    // ── Fetch and render ──

    async _fetchLeaderboard() {
        let entries = [];
        let isOffline = false;

        try {
            if (dataBridge.isAuthenticated) {
                entries = await dataBridge.getLeaderboard(20);
            }
        } catch (err) {
            console.warn('LeaderboardScene: fetch failed', err);
        }

        if (!entries || entries.length === 0) {
            isOffline = true;
        }

        if (isOffline) {
            this._renderOffline();
        } else {
            this._renderLeaderboard(entries);
        }
    }

    // ── Online leaderboard ──

    _renderLeaderboard(entries) {
        this._clearUI();
        const player = xpManager.player;

        const rowsHTML = entries.map((entry, i) => {
            const rank = i + 1;
            const name = this._truncate(entry.display_name || 'Unknown', 12);
            const level = entry.level || 1;
            const xp = entry.total_xp || 0;
            const quests = Array.isArray(entry.quests_completed) ? entry.quests_completed.length : 0;
            const streak = entry.current_streak || 0;
            const isCurrentPlayer = name === this._truncate(player.displayName, 12)
                && level === player.level
                && xp === player.totalXp;

            const rowBg = isCurrentPlayer
                ? 'background:rgba(80,232,192,0.06); border-left:2px solid var(--teal);'
                : 'border-left:2px solid transparent;';
            const nameColor = isCurrentPlayer ? 'color:var(--teal);' : 'color:var(--text-heading);';
            const rankDisplay = rank <= 3
                ? `<span style="color:var(--teal); text-shadow:0 0 8px rgba(80,232,192,0.4);">${this._rankIcon(rank)}</span>`
                : `<span style="color:var(--text-muted);">${String(rank).padStart(2, '0')}</span>`;

            return `
                <div style="display:grid; grid-template-columns:32px 1fr 48px 64px 40px 40px; align-items:center; padding:8px 10px; ${rowBg} border-bottom:1px solid var(--teal-border); font-family:var(--font-mono); font-size:0.6875rem; transition:background 0.2s ease;"
                    ${isCurrentPlayer ? 'id="lb-current-player"' : ''}>
                    <div style="text-align:center;">${rankDisplay}</div>
                    <div style="${nameColor} font-weight:400; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                        ${isCurrentPlayer ? '> ' : ''}${name}
                    </div>
                    <div style="text-align:center;">
                        <span class="hud-badge" style="font-size:0.5rem; padding:1px 6px;">Lv${level}</span>
                    </div>
                    <div style="text-align:right; color:var(--teal); font-size:0.625rem;">
                        ${xp.toLocaleString()} XP
                    </div>
                    <div style="text-align:center; color:var(--text-muted); font-size:0.5625rem;" title="Quests completed">
                        ${quests}Q
                    </div>
                    <div style="text-align:center; color:${streak > 0 ? 'var(--teal)' : 'var(--text-muted)'}; font-size:0.5625rem;" title="Current streak">
                        ${streak > 0 ? streak + 'd' : '--'}
                    </div>
                </div>
            `;
        }).join('');

        const html = `
            <div class="scene-panel" id="leaderboard-panel" style="max-width:560px; margin:0 auto; padding-bottom:80px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2 class="scene-heading glitch-text" style="margin:0; font-family:var(--font-mono);">// LEADERBOARD</h2>
                    <button class="btn btn-ghost" id="btn-close-lb" style="font-size:1.25rem; padding:4px 8px;">\u2715</button>
                </div>

                <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); margin-bottom:12px;">
                    > TOP ${entries.length} PLAYERS BY TOTAL XP
                </div>

                <!-- Table header -->
                <div style="display:grid; grid-template-columns:32px 1fr 48px 64px 40px 40px; align-items:center; padding:6px 10px; border-bottom:1px solid var(--teal-border-strong); font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.08em;">
                    <div style="text-align:center;">#</div>
                    <div>PLAYER</div>
                    <div style="text-align:center;">LVL</div>
                    <div style="text-align:right;">XP</div>
                    <div style="text-align:center;">QST</div>
                    <div style="text-align:center;">STK</div>
                </div>

                <!-- Rows -->
                <div id="lb-rows" style="border:1px solid var(--teal-border); border-radius:3px; overflow:hidden; background:var(--bg-alt);">
                    ${rowsHTML}
                </div>

                <!-- Connection status -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding:8px 10px; background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:3px;">
                    <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">SUPABASE STATUS</span>
                    <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--teal);">[ CONNECTED ]</span>
                </div>

                <div style="text-align:center; margin-top:16px;">
                    <span style="color:var(--text-muted); font-size:0.5rem; font-family:var(--font-mono);">UPDATED ${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                </div>
            </div>
        `;

        this._injectHTML(html);
        document.getElementById('btn-close-lb')?.addEventListener('click', () => this._close());

        // Scroll current player into view
        const currentRow = document.getElementById('lb-current-player');
        if (currentRow) {
            currentRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // ── Offline fallback ──

    _renderOffline() {
        this._clearUI();
        const player = xpManager.player;
        const questCount = player.questsCompleted ? player.questsCompleted.length : 0;
        const quizCount = player.quizResults ? Object.keys(player.quizResults).length : 0;

        const html = `
            <div class="scene-panel" id="leaderboard-panel" style="max-width:560px; margin:0 auto; padding-bottom:80px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h2 class="scene-heading glitch-text" style="margin:0; font-family:var(--font-mono);">// LEADERBOARD</h2>
                    <button class="btn btn-ghost" id="btn-close-lb" style="font-size:1.25rem; padding:4px 8px;">\u2715</button>
                </div>

                <!-- Offline / empty notice -->
                <div style="background:rgba(196,92,75,0.06); border:1px solid rgba(196,92,75,0.15); border-radius:3px; padding:12px 14px; margin-bottom:20px;">
                    <div style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--error); margin-bottom:4px;">
                        > ${dataBridge.isAuthenticated ? 'NO ENTRIES YET' : 'CONNECTION OFFLINE'}
                    </div>
                    <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); line-height:1.6;">
                        ${dataBridge.isAuthenticated
                            ? 'Be the first on the board &mdash; earn XP to claim your rank.'
                            : 'Sign in to see full leaderboard rankings.<br>Showing local player data below.'}
                    </div>
                </div>

                <!-- Local player card -->
                <div class="section-header">Your Stats</div>
                <div style="background:var(--bg-alt); border:1px solid var(--teal-border-strong); border-radius:3px; padding:16px; margin-bottom:16px;" class="pixel-corners">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div>
                            <div style="font-size:0.8125rem; font-weight:400; color:var(--teal); font-family:var(--font-mono);">> ${player.displayName}</div>
                            <div style="font-size:0.5625rem; color:var(--text-muted); font-family:var(--font-mono); margin-top:2px;">LOCAL DATA ONLY</div>
                        </div>
                        <span class="hud-badge">Lv ${player.level}</span>
                    </div>

                    <div style="margin-bottom:12px;">
                        <div class="xp-bar-wrap" style="height:4px;">
                            <div class="xp-bar-fill" style="width:${(xpManager.xpProgress * 100).toFixed(1)}%"></div>
                        </div>
                        <div style="font-size:0.5rem; color:var(--text-muted); margin-top:2px; font-family:var(--font-mono);">
                            ${xpManager.xpInLevel} / ${xpManager.xpToNext} XP TO NEXT LEVEL
                        </div>
                    </div>

                    <div class="stat-grid" style="grid-template-columns:repeat(2, 1fr); margin:0;">
                        <div class="stat-box">
                            <div class="stat-value">${player.totalXp.toLocaleString()}</div>
                            <div class="stat-label">Total XP</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${questCount}</div>
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
                    </div>
                </div>

                <!-- Terminal readout -->
                <div style="background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:3px; padding:10px 14px; font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); line-height:1.8;">
                    <div>> player.quizzes_taken = ${quizCount}</div>
                    <div>> player.longest_streak = ${player.longestStreak}d</div>
                    <div>> player.rank = <span style="color:var(--error);">UNAVAILABLE</span> (offline)</div>
                    <div style="color:var(--teal); margin-top:4px;">> connect to see full leaderboard_</div>
                </div>

                <!-- Connection status -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding:8px 10px; background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:3px;">
                    <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">SUPABASE STATUS</span>
                    <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">[ OFFLINE ]</span>
                </div>
            </div>
        `;

        this._injectHTML(html);
        document.getElementById('btn-close-lb')?.addEventListener('click', () => this._close());
    }

    // ── Helpers ──

    _rankIcon(rank) {
        if (rank === 1) return '01';
        if (rank === 2) return '02';
        if (rank === 3) return '03';
        return String(rank).padStart(2, '0');
    }

    _truncate(str, maxLen) {
        if (!str) return 'Unknown';
        return str.length > maxLen ? str.slice(0, maxLen - 1) + '\u2026' : str;
    }

    _clearUI() {
        const existing = document.getElementById('leaderboard-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

    _close() {
        this._clearUI();
        this.scene.stop('LeaderboardScene');
    }

    _matrixRain(w, h) {
        const chars = '01NOREDFARMS>_[]{}|/\\#$%&';
        const columns = Math.floor(w / 28);

        for (let i = 0; i < Math.min(columns, 18); i++) {
            const x = PMath.Between(0, w);
            const char = chars[PMath.Between(0, chars.length - 1)];
            const text = this.add.text(x, -20, char, {
                fontFamily: 'JetBrains Mono',
                fontSize: '10px',
                color: '#50e8c0',
                alpha: 0.04
            });

            this.tweens.add({
                targets: text,
                y: h + 20,
                duration: PMath.Between(8000, 16000),
                repeat: -1,
                delay: PMath.Between(0, 6000),
                onRepeat: () => {
                    text.x = PMath.Between(0, w);
                    text.setText(chars[PMath.Between(0, chars.length - 1)]);
                }
            });
        }
    }
}
