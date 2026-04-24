/**
 * HUD Controller
 * Updates the HTML overlay HUD bar with player state.
 */

import { xpManager } from './XPManager.js';
import { dailyQuests } from './DailyQuests.js';
import { achievementManager } from './Achievements.js';

export function initHUD() {
    const hud = document.getElementById('hud');
    if (!hud) return;

    hud.classList.remove('hidden');
    updateHUD();

    xpManager.onChange(() => updateHUD());

    // Daily quest dots → navigate to hub
    const dailyEl = document.getElementById('hud-daily');
    if (dailyEl) {
        dailyEl.addEventListener('click', () => {
            const navBtn = document.querySelector('.nav-btn[data-nav="hub"]');
            if (navBtn) navBtn.click();
        });
    }

    // Achievement counter → open settings (which has the gallery)
    const achEl = document.getElementById('hud-ach');
    if (achEl) {
        achEl.addEventListener('click', () => {
            const navBtn = document.querySelector('.nav-btn[data-nav="profile"]');
            if (navBtn) navBtn.click();
        });
    }
}

export function hideHUD() {
    const hud = document.getElementById('hud');
    if (hud) hud.classList.add('hidden');
}

function updateHUD() {
    const p = xpManager.player;

    const nameEl = document.getElementById('hud-name');
    const levelEl = document.getElementById('hud-level');
    const xpBar = document.getElementById('hud-xp-bar');
    const xpText = document.getElementById('hud-xp-text');
    const streakEl = document.getElementById('hud-streak');

    if (nameEl) nameEl.textContent = p.displayName;
    if (levelEl) levelEl.textContent = `Lv ${p.level}`;
    if (xpBar) xpBar.style.width = `${(xpManager.xpProgress * 100).toFixed(1)}%`;
    if (xpText) xpText.textContent = `${xpManager.xpInLevel} / ${xpManager.xpToNext} XP`;
    if (streakEl) streakEl.textContent = `${p.currentStreak} day streak`;

    // Daily quest dots
    const today = dailyQuests.getToday();
    const dots = document.querySelectorAll('.hud-daily-dot');
    dots.forEach((dot, i) => {
        if (today[i]) {
            dot.classList.toggle('done', today[i].completed);
            dot.title = today[i].quest.title;
        }
    });

    // Achievement counter
    const achCount = document.getElementById('hud-ach-count');
    if (achCount) {
        const earned = achievementManager.earned.length;
        const total = achievementManager.definitions.length;
        achCount.textContent = `${earned}/${total}`;
    }
}
