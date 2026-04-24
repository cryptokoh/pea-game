/**
 * GardenScene — Learning hub with 4 topic cards + flash challenge button.
 * Shows progress rings per topic. Links to BookScene, LabScene, FlashScene.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { learningProgress } from '../systems/LearningProgress.js';
import { TOPICS } from '../config/topics/index.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

export class GardenScene extends Scene {
    constructor() {
        super({ key: 'GardenScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        // Ambient particles
        createAmbientParticles(this, w, h);

        this._showGarden();
        this._updateNavBar('garden');
    }

    _showGarden() {
        this._clearUI();

        const totalSections = TOPICS.reduce((sum, t) => sum + t.sectionCount, 0);
        const totalCompleted = learningProgress.totalCompleted;
        const totalXp = learningProgress.totalXpEarned;

        const html = `
            <div class="scene-panel" id="garden-panel" style="padding-bottom:80px;">
                <div style="text-align:center; margin-bottom:4px;">
                    <h2 class="scene-heading" style="font-size:1.25rem;">
                        Learning Garden
                    </h2>
                    <p class="scene-subheading" style="font-size:0.75rem;">
                        Explore botanical knowledge across four domains
                    </p>
                </div>

                <!-- Overall progress -->
                <div class="stat-grid" style="grid-template-columns:repeat(3, 1fr); max-width:400px; margin:0 auto 20px;">
                    <div class="stat-box">
                        <div class="stat-value">${totalCompleted}</div>
                        <div class="stat-label">Sections Read</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${totalSections}</div>
                        <div class="stat-label">Total</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">+${totalXp}</div>
                        <div class="stat-label">XP Earned</div>
                    </div>
                </div>

                ${totalCompleted === 0 ? `
                <div style="text-align:center; padding:12px 16px; background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:8px; margin-bottom:16px;">
                    <div style="font-size:0.8125rem; color:var(--text-heading); margin-bottom:4px;">Start your botanical journey</div>
                    <div style="font-size:0.6875rem; color:var(--text-muted);">Tap a topic below to begin learning and earning XP</div>
                </div>
                ` : ''}

                <!-- Topic cards -->
                <div class="garden-grid">
                    ${TOPICS.map(topic => {
                        const completed = learningProgress.getTopicProgress(topic.key);
                        const total = topic.sectionCount;
                        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                        return `
                            <div class="garden-card" data-topic="${topic.key}">
                                <span class="garden-card-icon">${topic.icon}</span>
                                <div class="garden-card-title">${topic.title}</div>
                                <div class="garden-card-desc">${topic.description}</div>
                                <div class="garden-card-count">${total} sections</div>
                                <div class="garden-progress-ring" style="--progress:${pct}%;">
                                    <span class="garden-progress-text">${pct}%</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Quick Facts Challenge button -->
                <button class="garden-flash-btn" id="btn-flash-challenge">
                    &#x26A1; Quick Facts Challenge — Test your knowledge
                </button>
            </div>
        `;

        this._injectHTML(html);

        // Topic card clicks → BookScene
        document.querySelectorAll('.garden-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const topicKey = e.currentTarget.dataset.topic;
                soundManager.play('click');
                this._clearUI();

                // Extraction topic → LabScene, others → BookScene
                if (topicKey === 'extraction') {
                    transitionTo(this, 'LabScene', { topicKey }, 'slide-left');
                } else {
                    transitionTo(this, 'BookScene', { topicKey }, 'slide-left');
                }
            });
        });

        // Flash challenge button
        document.getElementById('btn-flash-challenge')?.addEventListener('click', () => {
            soundManager.play('click');
            this._clearUI();
            transitionTo(this, 'FlashScene');
        });
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('garden-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

}
