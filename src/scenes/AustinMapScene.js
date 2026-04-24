/**
 * AustinMapScene — Interactive city map with quest location pins.
 * Retro terminal aesthetic with hex grid overlay and hacker-style labels.
 */

import { Scene, Math as PMath } from 'phaser';
import { AUSTIN_LOCATIONS, getUnlockedLocations } from '../config/austin-locations.js';
import { xpManager } from '../systems/XPManager.js';
import { settings } from '../systems/Settings.js';
import { dailyQuests } from '../systems/DailyQuests.js';
import { soundManager } from '../systems/SoundManager.js';

// Map bounds (approximate Austin lat/lng mapped to pixel space)
const MAP_BOUNDS = {
    latMin: 30.24,
    latMax: 30.32,
    lngMin: -97.78,
    lngMax: -97.70
};

export class AustinMapScene extends Scene {
    constructor() {
        super({ key: 'AustinMapScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(400, 18, 24, 26);

        // ── Background ──
        this.add.rectangle(w / 2, h / 2, w, h, 0x12181a);

        // ── Hex grid background (retro style) ──
        if (settings.preset.animatedBg) {
            this._createHexGrid(w, h);
        }

        // ── Ambient starfield ──
        if (settings.preset.animatedBg) {
            this._createStarfield(w, h);
        }

        // ── Map area ──
        const mapPadding = 60;
        const mapTop = 52; // below HUD
        const mapW = w - mapPadding * 2;
        const mapH = h - mapTop - mapPadding - 56; // account for bottom nav
        const mapX = mapPadding;
        const mapY = mapTop + 20;

        // Map background with subtle border
        const mapBg = this.add.rectangle(mapX + mapW / 2, mapY + mapH / 2, mapW, mapH, 0x181e20);
        mapBg.setStrokeStyle(1, 0x50e8c0, 0.06);

        // Corner brackets (retro terminal frame)
        const g = this.add.graphics();
        g.lineStyle(1, 0x50e8c0, 0.15);
        const cornerLen = 20;
        // Top-left
        g.lineBetween(mapX, mapY, mapX + cornerLen, mapY);
        g.lineBetween(mapX, mapY, mapX, mapY + cornerLen);
        // Top-right
        g.lineBetween(mapX + mapW, mapY, mapX + mapW - cornerLen, mapY);
        g.lineBetween(mapX + mapW, mapY, mapX + mapW, mapY + cornerLen);
        // Bottom-left
        g.lineBetween(mapX, mapY + mapH, mapX + cornerLen, mapY + mapH);
        g.lineBetween(mapX, mapY + mapH, mapX, mapY + mapH - cornerLen);
        // Bottom-right
        g.lineBetween(mapX + mapW, mapY + mapH, mapX + mapW - cornerLen, mapY + mapH);
        g.lineBetween(mapX + mapW, mapY + mapH, mapX + mapW, mapY + mapH - cornerLen);

        // ── Draw road grid ──
        this._drawRoads(mapX, mapY, mapW, mapH);

        // ── Scatter buildings and trees ──
        this._drawCityElements(mapX, mapY, mapW, mapH);

        // ── Draw Lady Bird Lake (water strip) ──
        const lakeY = mapY + mapH * 0.55;
        const lakeG = this.add.graphics();
        lakeG.fillStyle(0x163430, 0.5);
        lakeG.fillRect(mapX + 20, lakeY - 8, mapW - 40, 16);
        lakeG.lineStyle(1, 0x50e8c0, 0.06);
        lakeG.strokeRect(mapX + 20, lakeY - 8, mapW - 40, 16);

        if (settings.preset.ambientAnimations) {
            this.tweens.add({
                targets: lakeG, alpha: { from: 0.6, to: 0.9 },
                duration: 3000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
            });
        }

        // Lake label
        this.add.text(mapX + mapW / 2, lakeY, 'LADY BIRD LAKE', {
            fontFamily: 'JetBrains Mono, monospace', fontSize: '7px', color: '#506460',
            letterSpacing: 2
        }).setOrigin(0.5);

        // ── Title ──
        this.add.text(mapX, mapY - 14, '// AUSTIN, TX', {
            fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#506460',
            letterSpacing: 2
        });

        // Coordinate readout (retro touch)
        this.add.text(mapX + mapW, mapY - 14, '30.27\u00b0N 97.74\u00b0W', {
            fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: '#506460'
        }).setOrigin(1, 0);

        // ── Place location pins ──
        const level = xpManager.level;
        const allLocations = AUSTIN_LOCATIONS;

        allLocations.forEach(loc => {
            const unlocked = !loc.locked || level >= (loc.unlockLevel || 1);
            const completed = xpManager.isQuestCompleted(loc.id);

            const px = this._lngToX(loc.lng, mapX, mapW);
            const py = this._latToY(loc.lat, mapY, mapH);

            // Glow ring (high quality only)
            if (settings.preset.glow && unlocked && !completed) {
                const glowKey = loc.id === 'la-lighthouse' ? 'glow-gold' : 'glow-teal';
                const glow = this.add.image(px, py, glowKey).setScale(1.5).setAlpha(0.5);
                this.tweens.add({
                    targets: glow, scale: { from: 1.2, to: 2 }, alpha: { from: 0.5, to: 0.15 },
                    duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
                });
            }

            // Scan ring (animated circle around active pins)
            if (settings.preset.ambientAnimations && unlocked && !completed) {
                const ring = this.add.circle(px, py, 18).setStrokeStyle(1, 0x50e8c0, 0.1).setFillStyle();
                this.tweens.add({
                    targets: ring,
                    scaleX: { from: 0.8, to: 1.8 },
                    scaleY: { from: 0.8, to: 1.8 },
                    alpha: { from: 0.3, to: 0 },
                    duration: 2000, repeat: -1, ease: 'Sine.easeOut'
                });
            }

            // Pin
            const pinKey = !unlocked ? 'pin-locked' : loc.id === 'la-lighthouse' ? 'pin-gold' : 'pin-teal';
            const pin = this.add.image(px, py, pinKey).setScale(1);

            if (completed) {
                pin.setAlpha(0.4);
            }

            // Label — monospace terminal style
            const label = this.add.text(px, py + 20, loc.name.toUpperCase(), {
                fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontStyle: '400',
                color: unlocked ? '#bccac4' : '#506460',
                align: 'center', wordWrap: { width: 120 }
            }).setOrigin(0.5, 0);

            if (!unlocked) {
                this.add.text(px, py + 32, `[LV ${loc.unlockLevel} REQ]`, {
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '7px', color: '#506460'
                }).setOrigin(0.5, 0);
            }

            // Interaction
            if (unlocked) {
                pin.setInteractive({ useHandCursor: true });
                label.setInteractive({ useHandCursor: true });

                const onHover = () => {
                    pin.setScale(1.3);
                    label.setColor('#50e8c0');
                };
                const onOut = () => {
                    pin.setScale(1);
                    label.setColor('#bccac4');
                };
                const onClick = () => {
                    this.cameras.main.fadeOut(300, 18, 24, 26);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('QuestScene', { locationId: loc.id });
                    });
                };

                pin.on('pointerover', onHover);
                pin.on('pointerout', onOut);
                pin.on('pointerdown', onClick);
                label.on('pointerover', onHover);
                label.on('pointerout', onOut);
                label.on('pointerdown', onClick);
            }

            // Completed marker
            if (completed) {
                this.add.text(px + 12, py - 12, 'OK', {
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '8px', fontStyle: '500', color: '#50e8c0'
                });
            }
        });

        // ── Quest progress summary at bottom ──
        const completedCount = allLocations.filter(l => xpManager.isQuestCompleted(l.id)).length;
        const totalCount = allLocations.length;
        this.add.text(mapX + mapW / 2, mapY + mapH + 10, `[ ${completedCount} / ${totalCount} LOCATIONS VISITED ]`, {
            fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: '#506460'
        }).setOrigin(0.5);

        // ── Particle emitter on completed pins (high quality) ──
        if (settings.preset.particles) {
            allLocations.forEach(loc => {
                if (xpManager.isQuestCompleted(loc.id)) {
                    const px = this._lngToX(loc.lng, mapX, mapW);
                    const py = this._latToY(loc.lat, mapY, mapH);
                    this.add.particles(px, py, 'particle-star', {
                        speed: { min: 5, max: 15 },
                        scale: { start: 0.6, end: 0 },
                        alpha: { start: 0.4, end: 0 },
                        lifespan: 2000,
                        frequency: 800,
                        quantity: 1,
                        blendMode: 'ADD'
                    });
                }
            });
        }

        // Show daily quests panel
        this._showDailyQuests();

        // Update nav bar
        this._updateNavBar('map');
    }

    shutdown() {
        // Clean up DOM panel on scene shutdown
        const panel = document.getElementById('daily-quest-panel');
        if (panel) panel.remove();
    }

    _lngToX(lng, mapX, mapW) {
        const t = (lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin);
        return mapX + t * mapW;
    }

    _latToY(lat, mapY, mapH) {
        const t = 1 - (lat - MAP_BOUNDS.latMin) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin);
        return mapY + t * mapH;
    }

    _createStarfield(w, h) {
        const count = settings.preset.bgStars;
        for (let i = 0; i < count; i++) {
            const x = PMath.Between(0, w);
            const y = PMath.Between(0, h);
            const star = this.add.circle(x, y, PMath.Between(1, 2), 0x50e8c0, 0.06);
            if (settings.preset.ambientAnimations) {
                this.tweens.add({
                    targets: star, alpha: { from: 0.03, to: 0.15 },
                    duration: PMath.Between(2000, 5000),
                    yoyo: true, repeat: -1,
                    delay: PMath.Between(0, 3000)
                });
            }
        }
    }

    _createHexGrid(w, h) {
        // Subtle hex grid overlay for that hacker/tactical feel
        const hexSize = 40;
        const cols = Math.ceil(w / (hexSize * 0.87)) + 1;
        const rows = Math.ceil(h / (hexSize * 0.75)) + 1;

        for (let row = 0; row < Math.min(rows, 20); row++) {
            for (let col = 0; col < Math.min(cols, 25); col++) {
                const x = col * hexSize * 0.87 + (row % 2 ? hexSize * 0.43 : 0);
                const y = row * hexSize * 0.75;
                const hex = this.add.image(x, y, 'hex').setAlpha(0.3);
            }
        }
    }

    _drawRoads(mx, my, mw, mh) {
        const g = this.add.graphics();

        // Minor roads — dotted style
        g.lineStyle(1, 0x263032, 0.25);
        for (let i = 1; i < 6; i++) {
            const y = my + (mh / 6) * i;
            g.lineBetween(mx + 10, y, mx + mw - 10, y);
        }
        for (let i = 1; i < 8; i++) {
            const x = mx + (mw / 8) * i;
            g.lineBetween(x, my + 10, x, my + mh - 10);
        }

        // Major road (I-35 ish) — thicker, brighter
        g.lineStyle(2, 0x263032, 0.4);
        g.lineBetween(mx + mw * 0.45, my, mx + mw * 0.55, my + mh);

        // Road label
        this.add.text(mx + mw * 0.47, my + 8, 'I-35', {
            fontFamily: 'JetBrains Mono, monospace', fontSize: '6px', color: '#506460'
        }).setAngle(8);
    }

    _drawCityElements(mx, my, mw, mh) {
        const rng = new PMath.RandomDataGenerator(['austin']);

        // Buildings
        for (let i = 0; i < 25; i++) {
            const bx = rng.between(mx + 20, mx + mw - 60);
            const by = rng.between(my + 20, my + mh - 50);
            this.add.image(bx, by, 'building').setAlpha(0.25);
        }

        // Trees
        for (let i = 0; i < 15; i++) {
            const tx = rng.between(mx + 10, mx + mw - 30);
            const ty = rng.between(mx + 10, my + mh - 30);
            this.add.image(tx, ty, 'tree').setAlpha(0.3).setScale(rng.realInRange(0.6, 1.2));
        }
    }

    _showDailyQuests() {
        // Remove existing panel if present
        const existing = document.getElementById('daily-quest-panel');
        if (existing) existing.remove();

        const today = dailyQuests.getToday();
        const time = dailyQuests.getTimeRemaining();
        const timeStr = `${time.hours}h ${String(time.minutes).padStart(2, '0')}m`;

        const items = today.map(({ quest, completed, claimed }) => {
            let action = '';
            if (claimed) {
                action = '<span class="daily-panel-done">CLAIMED</span>';
            } else if (completed) {
                action = `<button class="daily-panel-claim" data-claim="${quest.id}">CLAIM</button>`;
            } else {
                action = `<span class="daily-panel-xp">+${quest.xpReward}</span>`;
            }

            return `
                <div class="daily-panel-item">
                    <span class="daily-panel-icon">${quest.icon}</span>
                    <div class="daily-panel-info">
                        <div class="daily-panel-quest-title">${quest.title}</div>
                        <div style="font-size:0.5625rem; color:var(--text-muted);">${quest.description}</div>
                    </div>
                    ${action}
                </div>
            `;
        }).join('');

        const panelHTML = `
            <div class="daily-panel" id="daily-quest-panel">
                <div class="daily-panel-header">
                    <span class="daily-panel-title">// Daily Quests</span>
                    <span class="daily-panel-timer">${timeStr}</span>
                </div>
                ${items}
            </div>
        `;

        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', panelHTML);

        // Claim buttons
        document.querySelectorAll('[data-claim]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const questId = e.currentTarget.dataset.claim;
                const result = dailyQuests.claimReward(questId);
                if (result) {
                    soundManager.play('xp');
                    // Re-render panel
                    this._showDailyQuests();
                }
            });
        });
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }
}
