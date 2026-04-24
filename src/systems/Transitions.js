/**
 * Transitions — Scene transition utility + shared ambient particle factory.
 * Lightweight wrappers for smooth scene changes and theme-aware particles.
 */

import { settings } from './Settings.js';
import { soundManager } from './SoundManager.js';

/**
 * Transition to a new scene with a visual effect.
 * @param {Phaser.Scene} currentScene
 * @param {string} targetSceneKey
 * @param {object} [data] — data to pass to the new scene
 * @param {'fade'|'slide-left'|'dissolve'} [style='fade']
 */
export function transitionTo(currentScene, targetSceneKey, data = {}, style = 'fade') {
    // Prevent double-transitions
    if (currentScene._transitioning) return;
    currentScene._transitioning = true;

    soundManager.play('transition');

    switch (style) {
        case 'slide-left': {
            const overlay = document.getElementById('ui-overlay');
            if (overlay) {
                overlay.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                overlay.style.transform = 'translateX(-30px)';
                overlay.style.opacity = '0';
            }
            currentScene.cameras.main.fadeOut(300, 18, 24, 26);
            currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                if (overlay) {
                    overlay.style.transition = 'none';
                    overlay.style.transform = '';
                    overlay.style.opacity = '';
                }
                currentScene.scene.start(targetSceneKey, data);
            });
            break;
        }

        case 'dissolve': {
            currentScene.cameras.main.fadeOut(400, 18, 24, 26);
            currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                currentScene.scene.start(targetSceneKey, data);
            });
            break;
        }

        case 'fade':
        default: {
            currentScene.cameras.main.fadeOut(300, 18, 24, 26);
            currentScene.cameras.main.once('camerafadeoutcomplete', () => {
                currentScene.scene.start(targetSceneKey, data);
            });
            break;
        }
    }
}

/**
 * Create theme-aware ambient particles for a scene.
 * @param {Phaser.Scene} scene
 * @param {number} w — viewport width
 * @param {number} h — viewport height
 * @param {'botanical'|'lab'|'auto'} [style='auto'] — particle style
 */
export function createAmbientParticles(scene, w, h, style = 'auto') {
    if (!settings.preset.particles) return;

    const resolvedStyle = style === 'auto' ? settings.theme : style;
    const count = Math.min(settings.preset.maxParticles, 25);
    if (count <= 0) return;

    if (resolvedStyle === 'botanical') {
        // Warm leaf + pollen drift
        scene.add.particles(w / 2, h / 2, 'particle-leaf', {
            x: { min: 0, max: w },
            y: { min: 0, max: h },
            speed: { min: 1, max: 4 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.12, end: 0 },
            lifespan: 6000,
            frequency: 5000 / Math.max(count, 1),
            quantity: 1,
            blendMode: 'ADD',
            tint: 0xc4a265,
            rotate: { min: -30, max: 30 }
        });

        // Subtle pollen
        scene.add.particles(w / 2, h / 2, 'particle-pollen', {
            x: { min: 0, max: w },
            y: { min: h, max: h + 20 },
            speed: { min: 3, max: 8 },
            angle: { min: -100, max: -80 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.08, end: 0 },
            lifespan: 7000,
            frequency: 8000 / Math.max(count, 1),
            quantity: 1,
            blendMode: 'ADD',
            tint: 0xc4a265
        });
    } else {
        // Lab mode — teal star particles
        scene.add.particles(w / 2, h / 2, 'particle-star', {
            x: { min: 0, max: w },
            y: { min: 0, max: h },
            speed: { min: 1, max: 5 },
            scale: { start: 0.3, end: 0 },
            alpha: { start: 0.08, end: 0 },
            lifespan: 5000,
            frequency: 4000 / Math.max(count, 1),
            quantity: 1,
            blendMode: 'ADD',
            tint: 0x50e8c0
        });
    }
}
