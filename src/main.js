/**
 * Pure Extracts Adventures (PEA)
 * Phaser 4.0.0 "Caladan" — Botanical learning & sales simulator
 */

import { Game, AUTO, Scale } from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { HubScene } from './scenes/HubScene.js';
import { GardenScene } from './scenes/GardenScene.js';
import { BookScene } from './scenes/BookScene.js';
import { FlashScene } from './scenes/FlashScene.js';
import { LabScene } from './scenes/LabScene.js';
import { AustinMapScene } from './scenes/AustinMapScene.js';
import { QuestScene } from './scenes/QuestScene.js';
import { LibraryScene } from './scenes/LibraryScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { LoginScene } from './scenes/LoginScene.js';
import { LeaderboardScene } from './scenes/LeaderboardScene.js';
import { RewardsScene } from './scenes/RewardsScene.js';
import { CourseScene } from './scenes/CourseScene.js';
import { OnboardingScene } from './scenes/OnboardingScene.js';
import { ProfileScene } from './scenes/ProfileScene.js';
import { settings } from './systems/Settings.js';
import { achievementManager } from './systems/Achievements.js';
import { soundManager } from './systems/SoundManager.js';
import { offlineQueue } from './systems/OfflineQueue.js';

const config = {
    type: AUTO,
    parent: 'game-container',
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#12181a',
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [BootScene, HubScene, GardenScene, BookScene, FlashScene, LabScene, AustinMapScene, QuestScene, LibraryScene, SettingsScene, LoginScene, LeaderboardScene, RewardsScene, CourseScene, OnboardingScene, ProfileScene],
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    render: {
        pixelArt: false,
        antialias: true,
        antialiasGL: settings.quality !== 'low'
    }
};

const game = new Game(config);

// Expose systems globally for cross-scene access
window.__nfSystems = { achievementManager, soundManager, offlineQueue };

// Handle resize
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

// Flush offline queue on startup if online
if (offlineQueue.isOnline && offlineQueue.pending > 0) {
    offlineQueue.flush();
}

// ── Bottom nav bar routing (5 tabs) ──
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.nav;
        const activeScenes = game.scene.getScenes(true);

        // Play click sound
        soundManager.play('click');

        // Determine current scene key (ignore overlays)
        const overlayKeys = ['SettingsScene', 'LeaderboardScene', 'LoginScene'];
        const currentKey = activeScenes.find(s =>
            !overlayKeys.includes(s.scene.key)
        )?.scene.key;

        // Stop any open overlays first
        overlayKeys.forEach(k => {
            if (game.scene.isActive(k)) game.scene.stop(k);
        });

        switch (target) {
            case 'hub':
                if (currentKey !== 'HubScene') {
                    game.scene.stop(currentKey);
                    game.scene.start('HubScene');
                }
                break;
            case 'garden':
                if (currentKey !== 'GardenScene') {
                    game.scene.stop(currentKey);
                    game.scene.start('GardenScene');
                }
                break;
            case 'library':
                if (currentKey !== 'LibraryScene') {
                    game.scene.stop(currentKey);
                    game.scene.start('LibraryScene');
                }
                break;
            case 'leaderboard':
                game.scene.launch('LeaderboardScene');
                break;
            case 'profile':
                if (currentKey !== 'ProfileScene') {
                    game.scene.stop(currentKey);
                    game.scene.start('ProfileScene');
                }
                break;
        }

        // Update active state
        document.querySelectorAll('.nav-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.nav === target)
        );
    });
});
