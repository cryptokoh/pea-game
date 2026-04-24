/**
 * OnboardingScene — 3-step welcome flow for first-time users.
 * Welcome → How It Works → Choose Your Path.
 */

import { Scene } from 'phaser';
import { soundManager } from '../systems/SoundManager.js';
import { onboarding } from '../systems/Onboarding.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

export class OnboardingScene extends Scene {
    constructor() {
        super({ key: 'OnboardingScene' });
        this._step = 0;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(400, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        createAmbientParticles(this, w, h);

        this._step = 0;
        this._showStep();
    }

    _showStep() {
        this._clearUI();

        const steps = [
            this._stepWelcome(),
            this._stepHowItWorks(),
            this._stepChoosePath()
        ];

        const html = `
            <div class="scene-panel" id="onboarding-panel">
                <div class="onboarding-panel">
                    <!-- Progress dots -->
                    <div class="onboarding-dots">
                        ${[0, 1, 2].map(i => `
                            <div class="onboarding-dot ${i === this._step ? 'active' : ''}" data-dot="${i}"></div>
                        `).join('')}
                    </div>

                    <!-- Step content -->
                    <div class="onboarding-step active">
                        ${steps[this._step]}
                    </div>

                    <!-- Navigation -->
                    <div class="onboarding-nav">
                        ${this._step > 0 ? `
                            <button class="btn btn-secondary" id="btn-onboard-prev" style="min-width:80px;">
                                Back
                            </button>
                        ` : ''}
                        ${this._step < 2 ? `
                            <button class="btn btn-primary" id="btn-onboard-next" style="min-width:80px;">
                                Next
                            </button>
                        ` : ''}
                        <button class="btn btn-secondary" id="btn-onboard-skip" style="font-size:0.625rem; opacity:0.6;">
                            ${this._step === 2 ? '' : 'Skip'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);
        this._bindEvents();
    }

    _stepWelcome() {
        return `
            <div class="onboarding-icon">&#x1F33F;</div>
            <div class="onboarding-title">Welcome to Pure Extracts Adventures</div>
            <div class="onboarding-body">
                Your interactive guide to botanical science, extraction methods,
                and natural wellness. Learn at your own pace, earn XP, and unlock
                real rewards along the way.
            </div>
        `;
    }

    _stepHowItWorks() {
        return `
            <div class="onboarding-icon">&#x2728;</div>
            <div class="onboarding-title">How It Works</div>
            <div class="onboarding-body" style="text-align:left; max-width:340px; margin:0 auto 24px;">
                <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:12px;">
                    <span style="font-size:1.125rem;">&#x1F4DA;</span>
                    <div>
                        <div style="font-weight:500; color:var(--text-heading); font-size:0.8125rem;">Read & Learn</div>
                        <div style="font-size:0.6875rem;">Browse 70+ sections across four botanical topics</div>
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:10px; margin-bottom:12px;">
                    <span style="font-size:1.125rem;">&#x26A1;</span>
                    <div>
                        <div style="font-weight:500; color:var(--text-heading); font-size:0.8125rem;">Test Knowledge</div>
                        <div style="font-size:0.6875rem;">Flash quizzes and inline questions keep you sharp</div>
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <span style="font-size:1.125rem;">&#x1F3C6;</span>
                    <div>
                        <div style="font-weight:500; color:var(--text-heading); font-size:0.8125rem;">Earn Rewards</div>
                        <div style="font-size:0.6875rem;">XP milestones unlock real discount codes and lottery entries</div>
                    </div>
                </div>
            </div>
        `;
    }

    _stepChoosePath() {
        return `
            <div class="onboarding-icon">&#x1F6E4;</div>
            <div class="onboarding-title">Choose Your Path</div>
            <div class="onboarding-body" style="margin-bottom:16px;">
                Tap any card to get started. You can always explore all areas later.
            </div>
            <div class="onboarding-paths">
                <div class="onboarding-path-card" data-path="learning">
                    <span class="onboarding-path-icon">&#x1F33F;</span>
                    <div>
                        <div class="onboarding-path-title">Learning Garden</div>
                        <div class="onboarding-path-desc">Browse botanical topics, read sections, earn XP</div>
                    </div>
                </div>
                <div class="onboarding-path-card" data-path="courses">
                    <span class="onboarding-path-icon">&#x1F4D6;</span>
                    <div>
                        <div class="onboarding-path-title">Structured Courses</div>
                        <div class="onboarding-path-desc">Guided learning paths from beginner to advanced</div>
                    </div>
                </div>
                <div class="onboarding-path-card" data-path="explore">
                    <span class="onboarding-path-icon">&#x1F3E0;</span>
                    <div>
                        <div class="onboarding-path-title">Explore the Hub</div>
                        <div class="onboarding-path-desc">See everything PEA has to offer</div>
                    </div>
                </div>
            </div>
        `;
    }

    _bindEvents() {
        document.getElementById('btn-onboard-next')?.addEventListener('click', () => {
            soundManager.play('click');
            this._step++;
            this._showStep();
        });

        document.getElementById('btn-onboard-prev')?.addEventListener('click', () => {
            soundManager.play('click');
            this._step--;
            this._showStep();
        });

        document.getElementById('btn-onboard-skip')?.addEventListener('click', () => {
            soundManager.play('click');
            this._complete('HubScene');
        });

        // Path cards on step 3
        document.querySelectorAll('.onboarding-path-card').forEach(card => {
            card.addEventListener('click', (e) => {
                soundManager.play('click');
                const path = e.currentTarget.dataset.path;
                switch (path) {
                    case 'learning':
                        this._complete('GardenScene');
                        break;
                    case 'courses':
                        this._complete('CourseScene');
                        break;
                    default:
                        this._complete('HubScene');
                        break;
                }
            });
        });
    }

    _complete(targetScene) {
        onboarding.complete();
        this._clearUI();
        transitionTo(this, targetScene, {}, 'dissolve');
    }

    _clearUI() {
        const existing = document.getElementById('onboarding-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }
}
