/**
 * LabScene — Interactive extraction simulator.
 * 8 extraction methods with step-by-step walkthrough,
 * interactive controls (sliders, timers, gauges), and
 * animated apparatus visuals.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { xpManager, showToast } from '../systems/XPManager.js';
import { learningProgress } from '../systems/LearningProgress.js';
import { getTopicByKey, loadTopicSections } from '../config/topics/index.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

const METHODS = [
    { id: 'solventless', title: 'Solventless', icon: '\u{1F9F1}', desc: 'Mechanical separation — heat & pressure', sectionIds: ['extraction-solventless'] },
    { id: 'water', title: 'Water Extraction', icon: '\u{1F4A7}', desc: 'Cold/hot water steeping & filtration', sectionIds: ['extraction-water'] },
    { id: 'ethanol', title: 'Ethanol', icon: '\u{1F9EA}', desc: 'Ethanol solvent extraction & evaporation', sectionIds: ['extraction-ethanol'] },
    { id: 'co2', title: 'CO2 Extraction', icon: '\u{2699}', desc: 'Supercritical CO2 under pressure', sectionIds: ['extraction-co2'] },
    { id: 'distillation', title: 'Steam Distillation', icon: '\u{2668}', desc: 'Steam carries volatile compounds', sectionIds: ['extraction-distillation'] },
    { id: 'chromatography', title: 'Chromatography', icon: '\u{1F52C}', desc: 'Separation by molecular affinity', sectionIds: ['extraction-chromatography'] },
    { id: 'crystallization', title: 'Crystallization', icon: '\u{2744}', desc: 'Purification through crystal formation', sectionIds: ['extraction-crystallization'] },
    { id: 'carrier', title: 'Carrier Infusion', icon: '\u{1FAD9}', desc: 'Oil & alcohol carrier delivery', sectionIds: ['extraction-carrier-delivery'] },
];

const INTERACTIVE_STEPS = {
    solventless: [
        { title: 'Prepare Material', desc: 'Grind and sieve botanical material to optimal mesh size.', interactive: 'none' },
        { title: 'Set Temperature', desc: 'Apply heat between 70-90\u00B0C for rosin press extraction. Higher temps yield more but risk terpene loss.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: 50, max: 120, optimal: [70, 90] },
        { title: 'Apply Pressure', desc: 'Press material at 1000-2500 PSI. Slow steady pressure produces better yield.', interactive: 'slider', label: 'Pressure', unit: 'PSI', min: 500, max: 4000, optimal: [1000, 2500] },
        { title: 'Collect Extract', desc: 'Scrape rosin from parchment paper. Quality depends on temperature and pressure settings.', interactive: 'timer', duration: 5, label: 'Pressing...' },
    ],
    water: [
        { title: 'Measure Material', desc: 'Weigh botanical material. Standard ratio is 1:10 plant to water.', interactive: 'none' },
        { title: 'Set Water Temperature', desc: 'Cold water (5-15\u00B0C) preserves delicate compounds. Hot water (80-95\u00B0C) extracts more but changes profile.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: 0, max: 100, optimal: [80, 95] },
        { title: 'Steep & Extract', desc: 'Allow material to steep. Longer times increase extraction but may pull unwanted compounds.', interactive: 'timer', duration: 6, label: 'Steeping...' },
        { title: 'Filter', desc: 'Strain through progressively finer filters. Multiple passes increase purity.', interactive: 'timer', duration: 4, label: 'Filtering...' },
    ],
    ethanol: [
        { title: 'Chill Ethanol', desc: 'Food-grade ethanol chilled to -20\u00B0C to -40\u00B0C. Colder prevents chlorophyll extraction.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: -60, max: 0, optimal: [-40, -20] },
        { title: 'Soak Material', desc: 'Submerge botanical material in cold ethanol. Quick wash (3-5 min) for purity.', interactive: 'timer', duration: 5, label: 'Soaking...' },
        { title: 'Filter & Evaporate', desc: 'Filter extract and evaporate ethanol using rotary evaporator at 40-50\u00B0C.', interactive: 'slider', label: 'Evap Temp', unit: '\u00B0C', min: 30, max: 70, optimal: [40, 50] },
        { title: 'Purge Residual', desc: 'Vacuum purge remaining solvent to ensure food-safe extract.', interactive: 'timer', duration: 4, label: 'Purging...' },
    ],
    co2: [
        { title: 'Load Chamber', desc: 'Pack extraction vessel with ground botanical material.', interactive: 'none' },
        { title: 'Set Pressure', desc: 'Supercritical CO2 requires >1070 PSI. Higher pressure extracts more compounds.', interactive: 'slider', label: 'Pressure', unit: 'PSI', min: 800, max: 5000, optimal: [1070, 3000] },
        { title: 'Set Temperature', desc: 'Temperature 31-60\u00B0C affects selectivity. Lower temps are more selective.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: 20, max: 80, optimal: [31, 60] },
        { title: 'Run Extraction', desc: 'CO2 flows through material, dissolving target compounds.', interactive: 'timer', duration: 8, label: 'Extracting...' },
    ],
    distillation: [
        { title: 'Load Still', desc: 'Place botanical material in distillation flask with water.', interactive: 'none' },
        { title: 'Heat to Boiling', desc: 'Bring to 100\u00B0C. Steam carries volatile essential oils upward.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: 60, max: 120, optimal: [95, 105] },
        { title: 'Condense Vapor', desc: 'Steam passes through condenser, cooling back to liquid with oils.', interactive: 'timer', duration: 6, label: 'Distilling...' },
        { title: 'Separate Layers', desc: 'Essential oil floats on hydrosol. Carefully separate using separating funnel.', interactive: 'timer', duration: 3, label: 'Separating...' },
    ],
    chromatography: [
        { title: 'Prepare Column', desc: 'Pack column with silica gel or alumina stationary phase.', interactive: 'none' },
        { title: 'Load Sample', desc: 'Dissolve extract in minimal solvent and apply to column top.', interactive: 'none' },
        { title: 'Elute', desc: 'Run mobile phase through column. Different compounds travel at different rates.', interactive: 'timer', duration: 7, label: 'Separating fractions...' },
        { title: 'Collect Fractions', desc: 'Collect separate bands as they elute. Each fraction contains different compounds.', interactive: 'timer', duration: 4, label: 'Collecting...' },
    ],
    crystallization: [
        { title: 'Dissolve Extract', desc: 'Dissolve crude extract in warm solvent to saturation point.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: 30, max: 80, optimal: [50, 70] },
        { title: 'Cool Slowly', desc: 'Slow cooling promotes large, pure crystal formation. Rapid cooling creates small impure crystals.', interactive: 'timer', duration: 8, label: 'Cooling...' },
        { title: 'Seed Crystals', desc: 'Add seed crystal to initiate controlled crystallization.', interactive: 'none' },
        { title: 'Filter & Dry', desc: 'Vacuum filter crystals and dry to obtain purified compound.', interactive: 'timer', duration: 4, label: 'Drying...' },
    ],
    carrier: [
        { title: 'Select Carrier', desc: 'Choose carrier oil (MCT, olive, coconut) or alcohol (ethanol, glycerin).', interactive: 'none' },
        { title: 'Set Infusion Temp', desc: 'Low heat (40-60\u00B0C) preserves compounds. Higher heat speeds infusion but risks degradation.', interactive: 'slider', label: 'Temperature', unit: '\u00B0C', min: 30, max: 90, optimal: [40, 60] },
        { title: 'Infuse', desc: 'Steep extract in carrier at temperature. Stir periodically for even distribution.', interactive: 'timer', duration: 6, label: 'Infusing...' },
        { title: 'Strain & Bottle', desc: 'Fine-strain to remove particulate. Store in amber glass bottles.', interactive: 'timer', duration: 3, label: 'Bottling...' },
    ],
};

export class LabScene extends Scene {
    constructor() {
        super({ key: 'LabScene' });
        this._sections = [];
        this._currentMethod = null;
        this._currentStep = 0;
        this._topic = null;
    }

    init(data) {
        this._topic = getTopicByKey(data?.topicKey || 'extraction');
        this._sections = [];
        this._currentMethod = null;
        this._currentStep = 0;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        createAmbientParticles(this, w, h);

        this._updateNavBar('garden');
        this._showLoading();
        this._loadSections();
    }

    async _loadSections() {
        try {
            this._sections = await loadTopicSections('extraction');
            this._showMethodMenu();
        } catch (err) {
            console.error('Failed to load extraction sections:', err);
            this._showError();
        }
    }

    _showLoading() {
        this._clearUI();
        this._injectHTML(`
            <div class="scene-panel" id="lab-panel" style="padding-bottom:80px;">
                <div style="text-align:center; padding:60px 0;">
                    <div style="font-size:1.5rem; margin-bottom:8px;">&#x1F9EA;</div>
                    <div class="skeleton skeleton-line" style="width:120px; margin:0 auto;"></div>
                </div>
            </div>
        `);
    }

    _showError() {
        this._clearUI();
        this._injectHTML(`
            <div class="scene-panel" id="lab-panel" style="padding-bottom:80px;">
                <div style="text-align:center; padding:40px 0;">
                    <div style="font-size:0.8125rem; color:var(--error);">Failed to load lab content.</div>
                    <button class="btn btn-secondary" id="btn-lab-back" style="margin-top:16px;">Back to Garden</button>
                </div>
            </div>
        `);
        document.getElementById('btn-lab-back')?.addEventListener('click', () => this._goBack());
    }

    _showMethodMenu() {
        this._clearUI();
        this._currentMethod = null;

        const completedMethods = METHODS.filter(m =>
            m.sectionIds.every(sid => learningProgress.isCompleted(sid))
        ).length;

        const html = `
            <div class="scene-panel" id="lab-panel" style="padding-bottom:80px;">
                <div class="book-header">
                    <button class="book-back" id="btn-lab-back">&larr; Garden</button>
                    <div class="book-topic-title">&#x1F9EA; Extraction Lab</div>
                </div>

                <p style="font-size:0.75rem; color:var(--text-body); margin-bottom:4px;">
                    Choose an extraction method to explore interactively.
                </p>
                <div style="font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted); margin-bottom:16px;">
                    ${completedMethods}/${METHODS.length} methods completed
                </div>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                    ${METHODS.map(m => {
                        const done = m.sectionIds.every(sid => learningProgress.isCompleted(sid));
                        return `
                            <div class="lab-method-card" data-method="${m.id}" style="
                                padding:14px 12px; background:var(--bg-card);
                                border:1px solid ${done ? 'var(--teal-border-strong)' : 'var(--border-light)'};
                                border-radius:10px; cursor:pointer;
                                transition:all 0.2s ease;
                            ">
                                <div style="font-size:1.25rem; margin-bottom:4px;">${m.icon}</div>
                                <div style="font-size:0.75rem; font-weight:500; color:var(--text-heading); margin-bottom:2px;">
                                    ${done ? '&#x2713; ' : ''}${m.title}
                                </div>
                                <div style="font-size:0.5625rem; color:var(--text-body); line-height:1.3;">
                                    ${m.desc}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this._injectHTML(html);

        document.getElementById('btn-lab-back')?.addEventListener('click', () => {
            soundManager.play('click');
            this._goBack();
        });

        document.querySelectorAll('.lab-method-card').forEach(card => {
            card.addEventListener('click', (e) => {
                soundManager.play('click');
                const methodId = e.currentTarget.dataset.method;
                this._startMethod(methodId);
            });
            card.addEventListener('mouseenter', () => { card.style.background = 'var(--card-hover)'; });
            card.addEventListener('mouseleave', () => { card.style.background = 'var(--bg-card)'; });
        });
    }

    _startMethod(methodId) {
        this._currentMethod = METHODS.find(m => m.id === methodId);
        this._currentStep = 0;
        this._showMethodStep();
    }

    _showMethodStep() {
        this._clearUI();

        const method = this._currentMethod;
        const steps = INTERACTIVE_STEPS[method.id] || [];
        if (this._currentStep >= steps.length) {
            this._completeMethod();
            return;
        }

        const step = steps[this._currentStep];
        const totalSteps = steps.length;

        let interactiveHtml = '';
        if (step.interactive === 'slider') {
            const mid = Math.round((step.optimal[0] + step.optimal[1]) / 2);
            interactiveHtml = `
                <div class="lab-interactive" style="margin-top:16px; padding:14px; background:var(--bg-alt); border-radius:8px;">
                    <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted); margin-bottom:6px;">
                        <span>${step.label}</span>
                        <span id="lab-slider-value">${mid}${step.unit}</span>
                    </div>
                    <input type="range" id="lab-slider" min="${step.min}" max="${step.max}" value="${mid}"
                        style="width:100%; accent-color:var(--teal); cursor:pointer;">
                    <div style="display:flex; justify-content:space-between; font-size:0.5rem; color:var(--text-muted); margin-top:4px;">
                        <span>${step.min}${step.unit}</span>
                        <span style="color:var(--teal); font-weight:500;">Optimal: ${step.optimal[0]}-${step.optimal[1]}${step.unit}</span>
                        <span>${step.max}${step.unit}</span>
                    </div>
                    <div id="lab-slider-feedback" style="text-align:center; margin-top:8px; font-size:0.6875rem; min-height:20px;"></div>
                    <button class="btn btn-primary" id="btn-lab-apply" style="width:100%; margin-top:8px; font-size:0.75rem;">
                        Apply Setting
                    </button>
                </div>
            `;
        } else if (step.interactive === 'timer') {
            interactiveHtml = `
                <div class="lab-interactive" style="margin-top:16px; padding:14px; background:var(--bg-alt); border-radius:8px; text-align:center;">
                    <div style="font-size:0.75rem; color:var(--text-heading); margin-bottom:8px;">${step.label}</div>
                    <div id="lab-timer-display" style="font-family:var(--font-mono); font-size:1.5rem; color:var(--teal); margin-bottom:8px;">
                        0:00
                    </div>
                    <div class="xp-bar-wrap" style="height:4px; margin-bottom:12px;">
                        <div id="lab-timer-bar" class="xp-bar-fill" style="width:0%; transition:width 0.1s linear;"></div>
                    </div>
                    <button class="btn btn-primary" id="btn-lab-start-timer" style="font-size:0.75rem;">
                        Start Process
                    </button>
                </div>
            `;
        }

        const html = `
            <div class="scene-panel" id="lab-panel" style="padding-bottom:80px;">
                <div class="book-header">
                    <button class="book-back" id="btn-lab-menu">&larr; Methods</button>
                    <div class="book-topic-title">${method.icon} ${method.title}</div>
                </div>

                <!-- Step progress -->
                <div style="display:flex; gap:4px; margin-bottom:12px;">
                    ${steps.map((_, i) => `
                        <div style="flex:1; height:3px; border-radius:2px;
                            background:${i < this._currentStep ? 'var(--teal)' : i === this._currentStep ? 'var(--teal-dim)' : 'var(--bg-alt)'};
                            transition:background 0.3s ease;"></div>
                    `).join('')}
                </div>

                <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); margin-bottom:12px;">
                    Step ${this._currentStep + 1} of ${totalSteps}
                </div>

                <div style="padding:16px; background:var(--bg-card); border:1px solid var(--border-light); border-radius:10px;">
                    <div style="font-size:0.9375rem; font-weight:500; color:var(--text-heading); margin-bottom:6px;">
                        ${step.title}
                    </div>
                    <div style="font-size:0.8125rem; color:var(--text-body); line-height:1.5;">
                        ${step.desc}
                    </div>
                    ${interactiveHtml}
                    ${step.interactive === 'none' ? `
                        <button class="btn btn-primary" id="btn-lab-next-step" style="width:100%; margin-top:16px; font-size:0.75rem;">
                            Continue
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        this._injectHTML(html);
        this._bindStepEvents(step);
    }

    _bindStepEvents(step) {
        document.getElementById('btn-lab-menu')?.addEventListener('click', () => {
            soundManager.play('click');
            this._showMethodMenu();
        });

        if (step.interactive === 'none') {
            document.getElementById('btn-lab-next-step')?.addEventListener('click', () => {
                soundManager.play('click');
                this._currentStep++;
                this._showMethodStep();
            });
        } else if (step.interactive === 'slider') {
            const slider = document.getElementById('lab-slider');
            const valueEl = document.getElementById('lab-slider-value');
            const feedbackEl = document.getElementById('lab-slider-feedback');

            slider?.addEventListener('input', () => {
                const val = parseInt(slider.value);
                if (valueEl) valueEl.textContent = `${val}${step.unit}`;
                if (feedbackEl) {
                    if (val >= step.optimal[0] && val <= step.optimal[1]) {
                        feedbackEl.textContent = 'Optimal range!';
                        feedbackEl.style.color = 'var(--teal)';
                    } else if (val < step.optimal[0]) {
                        feedbackEl.textContent = 'Too low — suboptimal yield';
                        feedbackEl.style.color = '#c4a265';
                    } else {
                        feedbackEl.textContent = 'Too high — risk of degradation';
                        feedbackEl.style.color = 'var(--error)';
                    }
                }
            });

            document.getElementById('btn-lab-apply')?.addEventListener('click', () => {
                soundManager.play('xp');
                this._currentStep++;
                this._showMethodStep();
            });
        } else if (step.interactive === 'timer') {
            document.getElementById('btn-lab-start-timer')?.addEventListener('click', () => {
                soundManager.play('click');
                this._runTimer(step.duration);
            });
        }
    }

    _runTimer(duration) {
        const btn = document.getElementById('btn-lab-start-timer');
        if (btn) btn.disabled = true;

        const display = document.getElementById('lab-timer-display');
        const bar = document.getElementById('lab-timer-bar');
        const startTime = Date.now();
        const totalMs = duration * 1000;

        const timer = this.time.addEvent({
            delay: 100,
            loop: true,
            callback: () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(1, elapsed / totalMs);
                const remaining = Math.max(0, (totalMs - elapsed) / 1000);

                if (display) {
                    const secs = Math.ceil(remaining);
                    display.textContent = `0:${String(secs).padStart(2, '0')}`;
                }
                if (bar) bar.style.width = `${progress * 100}%`;

                if (progress >= 1) {
                    timer.remove();
                    soundManager.play('xp');
                    if (display) {
                        display.textContent = 'Complete!';
                        display.style.color = 'var(--teal)';
                    }
                    this.time.delayedCall(800, () => {
                        this._currentStep++;
                        this._showMethodStep();
                    });
                }
            }
        });
    }

    _completeMethod() {
        const method = this._currentMethod;

        // Mark related sections as completed
        let xpTotal = 0;
        for (const sid of method.sectionIds) {
            const section = this._sections.find(s => s.id === sid);
            if (section && !learningProgress.isCompleted(sid)) {
                const xp = section.xpReward || 10;
                learningProgress.complete('extraction', sid, xp);
                xpTotal += xp;
            }
        }

        // Method completion bonus
        const methodBonus = 20;
        xpTotal += methodBonus;
        if (xpTotal > 0) {
            xpManager.award(xpTotal, `Lab: ${method.title}`);
        }

        // Check all_extraction achievement
        const extractionTopic = getTopicByKey('extraction');
        if (extractionTopic && learningProgress.getTopicProgress('extraction') >= extractionTopic.sectionCount) {
            const achMgr = window.__nfSystems?.achievementManager;
            if (achMgr) achMgr.check('all_extraction');
        }

        // Show completion screen
        this._clearUI();
        this._injectHTML(`
            <div class="scene-panel" id="lab-panel" style="padding-bottom:80px;">
                <div style="text-align:center; padding:40px 0;">
                    <div style="font-size:2.5rem; margin-bottom:12px;">${method.icon}</div>
                    <div style="font-size:1.125rem; font-weight:500; color:var(--teal); margin-bottom:4px;">
                        Method Complete!
                    </div>
                    <div style="font-size:0.875rem; color:var(--text-heading); margin-bottom:12px;">
                        ${method.title}
                    </div>
                    <div style="font-family:var(--font-mono); font-size:0.875rem; color:var(--teal); margin-bottom:20px;">
                        +${xpTotal} XP earned
                    </div>
                    <div style="display:flex; gap:8px; justify-content:center;">
                        <button class="btn btn-secondary" id="btn-lab-more" style="font-size:0.75rem;">
                            More Methods
                        </button>
                        <button class="btn btn-primary" id="btn-lab-done" style="font-size:0.75rem;">
                            Back to Garden
                        </button>
                    </div>
                </div>
            </div>
        `);

        soundManager.play('levelup');

        document.getElementById('btn-lab-more')?.addEventListener('click', () => {
            soundManager.play('click');
            this._showMethodMenu();
        });
        document.getElementById('btn-lab-done')?.addEventListener('click', () => {
            soundManager.play('click');
            this._goBack();
        });
    }

    _goBack() {
        this._clearUI();
        transitionTo(this, 'GardenScene');
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('lab-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }
}
