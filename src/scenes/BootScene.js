/**
 * BootScene — Dramatic terminal boot sequence with typing effect.
 * Generates procedural textures, inits systems, waits for keypress.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { xpManager } from '../systems/XPManager.js';
import { dataBridge } from '../systems/DataBridge.js';
import { dailyQuests } from '../systems/DailyQuests.js';
import { initHUD } from '../systems/HUD.js';
import { onboarding } from '../systems/Onboarding.js';
import '../systems/AccessControl.js';
import '../systems/LearningProgress.js';

const FONT = 'JetBrains Mono, monospace';
const LINE_DELAY = 180;      // ms between lines
const CHAR_DELAY = 12;       // ms per character for typing effect
const DOT_DELAY = 40;        // ms per trailing dot in status strings

export class BootScene extends Scene {
    constructor() {
        super({ key: 'BootScene' });
        this._bootLines = [];
        this._currentLine = 0;
        this._textObjects = [];
        this._bootComplete = false;
        this._waitingForInput = false;
        this._dataBridgeResult = null;
    }

    preload() {
        // Generate all procedural textures (non-blocking, no assets to load)
        this._generateTextures();
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        // Apply saved theme
        settings.applyTheme();

        // Full dark background
        this.add.rectangle(w / 2, h / 2, w, h, 0x12181a);

        // Scanline overlay (subtle CRT effect) — only in lab mode
        if (settings.theme === 'lab') {
            for (let y = 0; y < h; y += 4) {
                this.add.rectangle(w / 2, y, w, 1, 0x000000, 0.06);
            }
        }

        // Initialize systems in the background
        xpManager.updateStreak();
        dailyQuests.getToday(); // Force daily quest refresh

        // Start DataBridge init (async, we show status later)
        this._dataBridgePromise = dataBridge.init().then(result => {
            this._dataBridgeResult = result;
            return result;
        }).catch(err => {
            console.warn('DataBridge init failed (offline mode):', err.message);
            this._dataBridgeResult = { authenticated: false, player: null, error: err.message };
            return this._dataBridgeResult;
        });

        // Build boot sequence
        this._buildBootSequence();

        // Start printing lines
        this._printNextLine();
    }

    _buildBootSequence() {
        const w = this.cameras.main.width;

        // Determine left margin for terminal text
        this._termX = Math.max(24, w * 0.08);
        this._termY = Math.max(40, this.cameras.main.height * 0.15);

        this._bootLines = [
            { text: '> SYSTEM BOOT v0.1.0', color: '#50e8c0', size: 14, delay: LINE_DELAY },
            { text: '> LOADING PHASER 4.0.0 "CALADAN"', dots: 7, status: 'OK', color: '#8e9c98', size: 11, delay: LINE_DELAY },
            { text: '> INITIALIZING RENDER PIPELINE', dots: 9, status: 'OK', color: '#8e9c98', size: 11, delay: LINE_DELAY },
            { text: '> LOADING TEXTURE ATLAS', dots: 12, status: 'OK', color: '#8e9c98', size: 11, delay: LINE_DELAY },
            { text: '> CONNECTING TO SUPABASE', dots: 11, status: 'CHECKING', color: '#8e9c98', size: 11, delay: LINE_DELAY, async: true },
            { text: '> AUTH STATUS:', status: 'PENDING', color: '#8e9c98', size: 11, delay: LINE_DELAY, authLine: true },
            { text: '> LOADING PLAYER PROFILE', dots: 11, status: 'OK', color: '#8e9c98', size: 11, delay: LINE_DELAY },
            { text: '> DAILY QUESTS LOADED', dots: 13, status: 'OK', color: '#8e9c98', size: 11, delay: LINE_DELAY },
            { text: '', color: '#12181a', size: 6, delay: 100, spacer: true },
            { text: '  PEA // PURE EXTRACTS ADVENTURES', color: '#50e8c0', size: 18, delay: 300, title: true },
            { text: '', color: '#12181a', size: 6, delay: 100, spacer: true },
            { text: '  // PRESS ANY KEY TO CONTINUE', color: '#506460', size: 10, delay: 0, prompt: true, blink: true },
        ];
    }

    _printNextLine() {
        if (this._currentLine >= this._bootLines.length) {
            this._onBootComplete();
            return;
        }

        const lineConfig = this._bootLines[this._currentLine];
        const yPos = this._termY + (this._currentLine * 22);

        if (lineConfig.spacer) {
            this._currentLine++;
            this.time.delayedCall(lineConfig.delay || 50, () => this._printNextLine());
            return;
        }

        if (lineConfig.authLine) {
            this._printAuthLine(lineConfig, yPos);
            return;
        }

        if (lineConfig.async) {
            this._printAsyncLine(lineConfig, yPos);
            return;
        }

        if (lineConfig.dots) {
            this._printDottedLine(lineConfig, yPos);
            return;
        }

        if (lineConfig.title) {
            this._printTitleLine(lineConfig, yPos);
            return;
        }

        if (lineConfig.prompt) {
            this._printPromptLine(lineConfig, yPos);
            return;
        }

        // Simple typed line
        this._typeLine(lineConfig.text, this._termX, yPos, lineConfig.color, lineConfig.size, () => {
            this._currentLine++;
            this.time.delayedCall(lineConfig.delay, () => this._printNextLine());
        });
    }

    /**
     * Type out a line character by character.
     */
    _typeLine(text, x, y, color, size, onComplete) {
        const textObj = this.add.text(x, y, '', {
            fontFamily: FONT,
            fontSize: `${size}px`,
            color: color,
        });
        this._textObjects.push(textObj);

        let charIdx = 0;
        const timer = this.time.addEvent({
            delay: CHAR_DELAY,
            repeat: text.length - 1,
            callback: () => {
                charIdx++;
                textObj.setText(text.substring(0, charIdx));
                if (charIdx >= text.length && onComplete) {
                    onComplete();
                }
            },
        });

        // If empty string, complete immediately
        if (text.length === 0 && onComplete) onComplete();
    }

    /**
     * Print a line with trailing dots and a status badge.
     * e.g. "> LOADING PHASER 4.0.0 ......... OK"
     */
    _printDottedLine(config, yPos) {
        const baseText = config.text;
        const dotCount = config.dots || 7;
        const statusText = config.status;

        // First type the base text
        this._typeLine(baseText, this._termX, yPos, config.color, config.size, () => {
            // Then animate dots
            const textObj = this._textObjects[this._textObjects.length - 1];
            let dots = 0;
            this.time.addEvent({
                delay: DOT_DELAY,
                repeat: dotCount - 1,
                callback: () => {
                    dots++;
                    textObj.setText(baseText + '.'.repeat(dots));
                    if (dots >= dotCount) {
                        // Append status
                        const statusColor = statusText === 'OK' ? '#50e8c0' : '#e8c050';
                        textObj.setText(baseText + '.'.repeat(dotCount) + ' ');

                        // Status as separate colored text
                        const statusObj = this.add.text(
                            textObj.x + textObj.width + 4,
                            yPos,
                            statusText,
                            { fontFamily: FONT, fontSize: `${config.size}px`, color: statusColor }
                        );
                        this._textObjects.push(statusObj);

                        this._currentLine++;
                        this.time.delayedCall(config.delay, () => this._printNextLine());
                    }
                },
            });
        });
    }

    /**
     * Print the Supabase connection line — shows CHECKING in yellow,
     * then resolves to CONNECTED (green) or OFFLINE (red).
     */
    _printAsyncLine(config, yPos) {
        const baseText = config.text;
        const dotCount = config.dots || 7;

        this._typeLine(baseText, this._termX, yPos, config.color, config.size, () => {
            const textObj = this._textObjects[this._textObjects.length - 1];
            let dots = 0;
            this.time.addEvent({
                delay: DOT_DELAY,
                repeat: dotCount - 1,
                callback: () => {
                    dots++;
                    textObj.setText(baseText + '.'.repeat(dots));
                    if (dots >= dotCount) {
                        // Show yellow "checking" first
                        textObj.setText(baseText + '.'.repeat(dotCount) + ' ');
                        const statusObj = this.add.text(
                            textObj.x + textObj.width + 4,
                            yPos,
                            'CHECKING',
                            { fontFamily: FONT, fontSize: `${config.size}px`, color: '#e8c050' }
                        );
                        this._textObjects.push(statusObj);

                        // Wait for DataBridge result, then update
                        this._dataBridgePromise.then(result => {
                            const connected = result && result.authenticated;
                            statusObj.setText(connected ? 'CONNECTED' : 'OFFLINE');
                            statusObj.setColor(connected ? '#50e8c0' : '#c45c4b');

                            this._currentLine++;
                            this.time.delayedCall(config.delay, () => this._printNextLine());
                        });
                    }
                },
            });
        });
    }

    /**
     * Print the auth status line, resolves based on DataBridge result.
     */
    _printAuthLine(config, yPos) {
        const baseText = config.text;

        this._typeLine(baseText, this._termX, yPos, config.color, config.size, () => {
            const textObj = this._textObjects[this._textObjects.length - 1];

            // Determine auth status from already-resolved or pending result
            const resolve = (result) => {
                const authenticated = result && result.authenticated;
                const playerName = result && result.player ? result.player.display_name : null;

                let statusStr, statusColor;
                if (authenticated && playerName) {
                    statusStr = `LOGGED IN (${playerName})`;
                    statusColor = '#50e8c0';
                } else if (authenticated) {
                    statusStr = 'AUTHENTICATED';
                    statusColor = '#50e8c0';
                } else {
                    statusStr = 'GUEST MODE';
                    statusColor = '#e8c050';
                }

                textObj.setText(baseText + ' ');
                const statusObj = this.add.text(
                    textObj.x + textObj.width + 4,
                    yPos,
                    statusStr,
                    { fontFamily: FONT, fontSize: `${config.size}px`, color: statusColor }
                );
                this._textObjects.push(statusObj);

                this._currentLine++;
                this.time.delayedCall(config.delay, () => this._printNextLine());
            };

            if (this._dataBridgeResult !== null) {
                resolve(this._dataBridgeResult);
            } else {
                this._dataBridgePromise.then(resolve);
            }
        });
    }

    /**
     * Print the title line with larger font and a brief glow effect.
     */
    _printTitleLine(config, yPos) {
        const textObj = this.add.text(this._termX, yPos, '', {
            fontFamily: FONT,
            fontSize: `${config.size}px`,
            fontStyle: '500',
            color: config.color,
        });
        this._textObjects.push(textObj);

        // Type it out slightly slower for impact
        let charIdx = 0;
        const text = config.text;
        this.time.addEvent({
            delay: CHAR_DELAY * 2,
            repeat: text.length - 1,
            callback: () => {
                charIdx++;
                textObj.setText(text.substring(0, charIdx));
                if (charIdx >= text.length) {
                    // Brief glow pulse
                    this.tweens.add({
                        targets: textObj,
                        alpha: { from: 1, to: 0.6 },
                        yoyo: true,
                        duration: 200,
                        repeat: 1,
                        onComplete: () => {
                            this._currentLine++;
                            this.time.delayedCall(config.delay, () => this._printNextLine());
                        },
                    });
                }
            },
        });
    }

    /**
     * Print the prompt line with blinking cursor.
     */
    _printPromptLine(config, yPos) {
        const textObj = this.add.text(this._termX, yPos, config.text, {
            fontFamily: FONT,
            fontSize: `${config.size}px`,
            color: config.color,
        });
        this._textObjects.push(textObj);

        // Blinking cursor block
        const cursorX = textObj.x + textObj.width + 6;
        const cursor = this.add.rectangle(cursorX, yPos + 5, 8, 12, 0x50e8c0, 0.8);
        this._textObjects.push(cursor);

        this.tweens.add({
            targets: cursor,
            alpha: { from: 0.8, to: 0 },
            yoyo: true,
            duration: 530,
            repeat: -1,
        });

        this._currentLine++;
        this._onBootComplete();
    }

    _onBootComplete() {
        if (this._bootComplete) return;
        this._bootComplete = true;
        this._waitingForInput = true;

        // Initialize HUD
        initHUD();

        // Show nav bar
        const navBar = document.getElementById('nav-bar');
        if (navBar) navBar.classList.remove('hidden');

        // Listen for any key or click to proceed
        this.input.keyboard.on('keydown', this._proceed, this);
        this.input.on('pointerdown', this._proceed, this);
    }

    _proceed() {
        if (!this._waitingForInput) return;
        this._waitingForInput = false;

        // Remove listeners
        this.input.keyboard.off('keydown', this._proceed, this);
        this.input.off('pointerdown', this._proceed, this);

        // Route: first-run → Onboarding, returning → Hub
        const target = onboarding.shouldShow() ? 'OnboardingScene' : 'HubScene';

        this.cameras.main.fadeOut(400, 18, 24, 26);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(target);
        });
    }

    // ── Procedural Texture Generation (unchanged) ──

    _generateTextures() {
        // Map pin -- teal
        const pinG = this.make.graphics({ add: false });
        pinG.fillStyle(0x50e8c0, 1);
        pinG.fillCircle(16, 16, 12);
        pinG.fillStyle(0x12181a, 1);
        pinG.fillCircle(16, 16, 5);
        pinG.generateTexture('pin-teal', 32, 32);

        // Map pin -- gold
        const pinGold = this.make.graphics({ add: false });
        pinGold.fillStyle(0xe8c050, 1);
        pinGold.fillCircle(16, 16, 12);
        pinGold.fillStyle(0x12181a, 1);
        pinGold.fillCircle(16, 16, 5);
        pinGold.generateTexture('pin-gold', 32, 32);

        // Map pin -- locked
        const pinLocked = this.make.graphics({ add: false });
        pinLocked.fillStyle(0x506460, 1);
        pinLocked.fillCircle(16, 16, 12);
        pinLocked.fillStyle(0x12181a, 1);
        pinLocked.fillCircle(16, 16, 5);
        pinLocked.generateTexture('pin-locked', 32, 32);

        // Star particle
        const starG = this.make.graphics({ add: false });
        starG.fillStyle(0x50e8c0, 1);
        starG.fillCircle(4, 4, 3);
        starG.generateTexture('particle-star', 8, 8);

        // Glow circle for pins
        const glowG = this.make.graphics({ add: false });
        glowG.fillStyle(0x50e8c0, 0.15);
        glowG.fillCircle(24, 24, 24);
        glowG.generateTexture('glow-teal', 48, 48);

        const glowGold = this.make.graphics({ add: false });
        glowGold.fillStyle(0xe8c050, 0.15);
        glowGold.fillCircle(24, 24, 24);
        glowGold.generateTexture('glow-gold', 48, 48);

        // Building block -- retro pixel style
        const bldgG = this.make.graphics({ add: false });
        bldgG.fillStyle(0x1e2628, 1);
        bldgG.fillRoundedRect(0, 0, 40, 30, 2);
        bldgG.lineStyle(1, 0x50e8c0, 0.06);
        bldgG.strokeRoundedRect(0, 0, 40, 30, 2);
        // Window lights
        bldgG.fillStyle(0x50e8c0, 0.08);
        bldgG.fillRect(6, 6, 6, 6);
        bldgG.fillRect(16, 6, 6, 6);
        bldgG.fillRect(28, 6, 6, 6);
        bldgG.fillRect(6, 16, 6, 6);
        bldgG.fillRect(16, 16, 6, 6);
        bldgG.fillRect(28, 16, 6, 6);
        bldgG.generateTexture('building', 40, 30);

        // Tree
        const treeG = this.make.graphics({ add: false });
        treeG.fillStyle(0x28584e, 1);
        treeG.fillCircle(10, 8, 8);
        treeG.fillStyle(0x1e4640, 1);
        treeG.fillRect(8, 14, 4, 6);
        treeG.generateTexture('tree', 20, 20);

        // Hex grid cell (decorative)
        const hexG = this.make.graphics({ add: false });
        hexG.lineStyle(1, 0x50e8c0, 0.04);
        hexG.beginPath();
        hexG.moveTo(15, 0);
        hexG.lineTo(30, 8);
        hexG.lineTo(30, 22);
        hexG.lineTo(15, 30);
        hexG.lineTo(0, 22);
        hexG.lineTo(0, 8);
        hexG.closePath();
        hexG.strokePath();
        hexG.generateTexture('hex', 30, 30);

        // ── Botanical-theme particles ──

        // Leaf particle (12x12 leaf shape)
        const leafG = this.make.graphics({ add: false });
        leafG.fillStyle(0x6b8f71, 0.8);
        leafG.beginPath();
        leafG.moveTo(6, 0);
        leafG.lineTo(12, 4);
        leafG.lineTo(10, 10);
        leafG.lineTo(6, 12);
        leafG.lineTo(2, 10);
        leafG.lineTo(0, 4);
        leafG.closePath();
        leafG.fillPath();
        leafG.generateTexture('particle-leaf', 12, 12);

        // Pollen particle (6x6 soft circle)
        const pollenG = this.make.graphics({ add: false });
        pollenG.fillStyle(0xc4a265, 0.4);
        pollenG.fillCircle(3, 3, 3);
        pollenG.generateTexture('particle-pollen', 6, 6);

        // Golden glow (48x48 radial)
        const glowGoldLg = this.make.graphics({ add: false });
        glowGoldLg.fillStyle(0xc4a265, 0.15);
        glowGoldLg.fillCircle(24, 24, 24);
        glowGoldLg.fillStyle(0xc4a265, 0.08);
        glowGoldLg.fillCircle(24, 24, 16);
        glowGoldLg.generateTexture('particle-glow-gold', 48, 48);

        // Water droplet (8x12 teardrop)
        const dropG = this.make.graphics({ add: false });
        dropG.fillStyle(0x50a89a, 0.7);
        dropG.beginPath();
        dropG.moveTo(4, 0);
        dropG.lineTo(8, 6);
        dropG.lineTo(7, 10);
        dropG.lineTo(4, 12);
        dropG.lineTo(1, 10);
        dropG.lineTo(0, 6);
        dropG.closePath();
        dropG.fillPath();
        dropG.generateTexture('particle-droplet', 8, 12);
    }
}
