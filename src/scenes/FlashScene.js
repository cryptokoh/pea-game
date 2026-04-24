/**
 * FlashScene — Multi-type timed quiz challenge.
 * Question types: MC from quickFacts (40%), T/F (25%),
 * fill-in-blank (10%), topic identification (25%).
 * Speed bonus: <3s = 2x, <5s = 1.5x.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { xpManager, showToast } from '../systems/XPManager.js';
import { TOPICS, loadTopicSections } from '../config/topics/index.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

const QUESTIONS_PER_ROUND = 10;
const TIME_PER_QUESTION = 15;
const XP_PER_CORRECT = 15;
const XP_BONUS_PERFECT = 50;

export class FlashScene extends Scene {
    constructor() {
        super({ key: 'FlashScene' });
        this._questions = [];
        this._currentQ = 0;
        this._score = 0;
        this._speedBonusTotal = 0;
        this._timerEvent = null;
        this._answered = false;
        this._questionStartTime = 0;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        createAmbientParticles(this, w, h);

        this._updateNavBar('garden');
        this._questions = [];
        this._currentQ = 0;
        this._score = 0;
        this._speedBonusTotal = 0;
        this._showLoading();
        this._loadQuestions();
    }

    async _loadQuestions() {
        try {
            const allSections = [];
            for (const topic of TOPICS) {
                const sections = await loadTopicSections(topic.key);
                sections.forEach(s => allSections.push({ ...s, topicKey: topic.key }));
            }
            this._questions = this._generateQuestions(allSections);
            this._showQuestion();
        } catch (err) {
            console.error('Failed to load flash questions:', err);
            this._showError();
        }
    }

    _generateQuestions(sections) {
        const questions = [];
        const shuffled = [...sections].sort(() => Math.random() - 0.5);

        // Collect all quickFacts
        const allFacts = [];
        for (const s of sections) {
            if (s.quickFacts) {
                s.quickFacts.forEach(f => allFacts.push({ ...f, section: s }));
            }
        }
        const shuffledFacts = allFacts.sort(() => Math.random() - 0.5);

        // Target distribution: 4 MC, 3 T/F, 1 fill, 2 topic-id
        let mcCount = 0, tfCount = 0, fillCount = 0, topicCount = 0;

        // MC from quickFacts (target 4)
        for (const fact of shuffledFacts) {
            if (mcCount >= 4) break;
            if (fact.type === 'tf' || fact.type === 'fill') continue;

            const wrongFacts = shuffledFacts
                .filter(f => f.section.id !== fact.section.id && f.a !== fact.a)
                .slice(0, 3);
            if (wrongFacts.length < 3) continue;

            questions.push({
                type: 'mc',
                question: fact.q,
                options: [
                    { text: fact.a, correct: true },
                    ...wrongFacts.map(f => ({ text: f.a, correct: false }))
                ].sort(() => Math.random() - 0.5),
                sectionId: fact.section.id
            });
            mcCount++;
        }

        // T/F from quickFacts (target 3)
        const tfFacts = shuffledFacts.filter(f => f.type === 'tf');
        for (const fact of tfFacts) {
            if (tfCount >= 3) break;
            questions.push({
                type: 'tf',
                question: fact.q,
                answer: fact.a.toLowerCase() === 'true',
                sectionId: fact.section.id
            });
            tfCount++;
        }
        // Generate additional T/F from non-tf facts if needed
        if (tfCount < 3) {
            for (const fact of shuffledFacts) {
                if (tfCount >= 3) break;
                if (fact.type === 'tf') continue;
                questions.push({
                    type: 'tf',
                    question: fact.q + ' (True or False)',
                    answer: true, // The fact answer is correct
                    sectionId: fact.section.id
                });
                tfCount++;
            }
        }

        // Fill-in-blank (target 1)
        const fillFacts = shuffledFacts.filter(f => f.type === 'fill');
        for (const fact of fillFacts) {
            if (fillCount >= 1) break;
            questions.push({
                type: 'fill',
                question: fact.q,
                answer: fact.a.toLowerCase(),
                sectionId: fact.section.id
            });
            fillCount++;
        }

        // Topic identification (target 2)
        for (const section of shuffled) {
            if (topicCount >= 2) break;
            const topic = TOPICS.find(t => t.key === section.topicKey);
            if (!topic) continue;

            const wrongTopics = TOPICS.filter(t => t.key !== section.topicKey)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            questions.push({
                type: 'topic',
                question: `"${section.title}" belongs to which learning track?`,
                options: [
                    { text: topic.title, correct: true },
                    ...wrongTopics.map(t => ({ text: t.title, correct: false }))
                ].sort(() => Math.random() - 0.5),
                sectionId: section.id
            });
            topicCount++;
        }

        // Pad remaining with MC from quickFacts
        while (questions.length < QUESTIONS_PER_ROUND && shuffledFacts.length > 0) {
            const fact = shuffledFacts.pop();
            if (!fact || fact.type === 'tf' || fact.type === 'fill') continue;
            if (questions.some(q => q.sectionId === fact.section.id && q.type === 'mc')) continue;

            const wrongFacts = allFacts
                .filter(f => f.section.id !== fact.section.id && f.a !== fact.a)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            if (wrongFacts.length < 2) continue;

            questions.push({
                type: 'mc',
                question: fact.q,
                options: [
                    { text: fact.a, correct: true },
                    ...wrongFacts.map(f => ({ text: f.a, correct: false }))
                ].sort(() => Math.random() - 0.5),
                sectionId: fact.section.id
            });
        }

        return questions.sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
    }

    _showLoading() {
        this._clearUI();
        const html = `
            <div class="scene-panel" id="flash-panel" style="padding-bottom:80px;">
                <div class="flash-container">
                    <div style="text-align:center; padding:60px 0;">
                        <div style="font-size:1.5rem; margin-bottom:8px;">&#x26A1;</div>
                        <div class="skeleton skeleton-line" style="width:120px; margin:0 auto;"></div>
                    </div>
                </div>
            </div>
        `;
        this._injectHTML(html);
    }

    _showError() {
        this._clearUI();
        const html = `
            <div class="scene-panel" id="flash-panel" style="padding-bottom:80px;">
                <div class="flash-container">
                    <div style="text-align:center; padding:40px 0;">
                        <div style="font-size:0.8125rem; color:var(--error);">
                            Failed to load questions.
                        </div>
                        <button class="btn btn-secondary" id="btn-flash-back" style="margin-top:16px;">Back to Garden</button>
                    </div>
                </div>
            </div>
        `;
        this._injectHTML(html);
        document.getElementById('btn-flash-back')?.addEventListener('click', () => this._goBack());
    }

    _showQuestion() {
        this._clearUI();

        if (this._currentQ >= this._questions.length) {
            this._showResults();
            return;
        }

        const q = this._questions[this._currentQ];
        this._answered = false;
        this._questionStartTime = Date.now();

        const typeBadge = { mc: 'MC', tf: 'T/F', fill: 'FILL', topic: 'TOPIC' }[q.type] || 'MC';
        const typeBadgeColor = { mc: 'var(--teal)', tf: '#c4a265', fill: '#9b7ed8', topic: '#6b8f71' }[q.type] || 'var(--teal)';

        let answerArea = '';
        if (q.type === 'tf') {
            answerArea = `
                <div class="flash-options" style="display:flex; gap:8px;">
                    <button class="flash-option flash-tf-btn" data-tf="true" style="flex:1;">True</button>
                    <button class="flash-option flash-tf-btn" data-tf="false" style="flex:1;">False</button>
                </div>
            `;
        } else if (q.type === 'fill') {
            answerArea = `
                <div style="margin-top:12px;">
                    <input type="text" id="flash-fill-input" class="flash-fill-input" placeholder="Type your answer..."
                        style="width:100%; padding:10px 14px; font-size:1rem; font-family:var(--font-main);
                        background:var(--bg-alt); border:1px solid var(--teal-border-strong); color:var(--text-heading);
                        border-radius:8px; outline:none; text-align:center;" autocomplete="off">
                    <button class="btn btn-primary" id="btn-fill-submit" style="width:100%; margin-top:8px;">Submit</button>
                </div>
            `;
        } else {
            answerArea = `
                <div class="flash-options">
                    ${q.options.map((opt, i) => `
                        <button class="flash-option" data-idx="${i}" data-correct="${opt.correct}">
                            ${opt.text}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        const html = `
            <div class="scene-panel" id="flash-panel" style="padding-bottom:80px;">
                <div class="flash-container">
                    <div class="flash-timer-bar">
                        <div class="flash-timer-fill" id="flash-timer" style="width:100%"></div>
                    </div>

                    <div class="flash-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-family:var(--font-mono); font-size:0.5625rem; padding:2px 8px; border-radius:99em; background:${typeBadgeColor}20; color:${typeBadgeColor}; border:1px solid ${typeBadgeColor}30;">
                                ${typeBadge}
                            </span>
                            <span id="flash-speed-indicator" style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted); opacity:0;"></span>
                        </div>
                        <div class="flash-question">${q.question}</div>
                        ${answerArea}
                    </div>

                    <div class="flash-score">
                        Question ${this._currentQ + 1} / ${this._questions.length} &nbsp;|&nbsp; Score: ${this._score}
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);

        // Bind based on type
        if (q.type === 'tf') {
            document.querySelectorAll('.flash-tf-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this._answerTF(e.currentTarget, q));
            });
        } else if (q.type === 'fill') {
            const input = document.getElementById('flash-fill-input');
            input?.focus();
            document.getElementById('btn-fill-submit')?.addEventListener('click', () => this._answerFill(q));
            input?.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') this._answerFill(q);
            });
        } else {
            document.querySelectorAll('.flash-option:not(.flash-tf-btn)').forEach(opt => {
                opt.addEventListener('click', (e) => this._answerMC(e.currentTarget));
            });
        }

        this._startTimer();
    }

    _getSpeedMultiplier() {
        const elapsed = (Date.now() - this._questionStartTime) / 1000;
        if (elapsed < 3) return 2;
        if (elapsed < 5) return 1.5;
        return 1;
    }

    _showSpeedBonus(multiplier) {
        if (multiplier <= 1) return;
        const el = document.getElementById('flash-speed-indicator');
        if (el) {
            el.textContent = `${multiplier}x SPEED`;
            el.style.opacity = '1';
            el.style.color = multiplier === 2 ? 'var(--teal)' : '#c4a265';
        }
    }

    _answerMC(el) {
        if (this._answered) return;
        this._answered = true;
        if (this._timerEvent) this._timerEvent.remove();

        const correct = el.dataset.correct === 'true';
        const multiplier = this._getSpeedMultiplier();

        if (correct) {
            el.classList.add('correct');
            this._score++;
            this._speedBonusTotal += (multiplier - 1) * XP_PER_CORRECT;
            this._showSpeedBonus(multiplier);
            soundManager.play('xp');
        } else {
            el.classList.add('wrong');
            soundManager.play('click');
            document.querySelector('.flash-option[data-correct="true"]')?.classList.add('correct');
        }

        this.time.delayedCall(1200, () => {
            this._currentQ++;
            this._showQuestion();
        });
    }

    _answerTF(el, q) {
        if (this._answered) return;
        this._answered = true;
        if (this._timerEvent) this._timerEvent.remove();

        const userAnswer = el.dataset.tf === 'true';
        const correct = userAnswer === q.answer;
        const multiplier = this._getSpeedMultiplier();

        if (correct) {
            el.classList.add('correct');
            this._score++;
            this._speedBonusTotal += (multiplier - 1) * XP_PER_CORRECT;
            this._showSpeedBonus(multiplier);
            soundManager.play('xp');
        } else {
            el.classList.add('wrong');
            soundManager.play('click');
            // Show correct
            const correctVal = q.answer ? 'true' : 'false';
            document.querySelector(`.flash-tf-btn[data-tf="${correctVal}"]`)?.classList.add('correct');
        }

        this.time.delayedCall(1200, () => {
            this._currentQ++;
            this._showQuestion();
        });
    }

    _answerFill(q) {
        if (this._answered) return;
        this._answered = true;
        if (this._timerEvent) this._timerEvent.remove();

        const input = document.getElementById('flash-fill-input');
        const userAnswer = (input?.value || '').trim().toLowerCase();
        const correctAnswer = q.answer.toLowerCase();
        const multiplier = this._getSpeedMultiplier();

        // Fuzzy match: check if answer contains the key word or is close
        const correct = userAnswer === correctAnswer ||
            correctAnswer.includes(userAnswer) && userAnswer.length >= 3 ||
            userAnswer.includes(correctAnswer);

        const card = document.querySelector('.flash-card');
        if (correct) {
            if (input) input.style.borderColor = 'var(--teal)';
            this._score++;
            this._speedBonusTotal += (multiplier - 1) * XP_PER_CORRECT;
            this._showSpeedBonus(multiplier);
            soundManager.play('xp');
            if (card) card.insertAdjacentHTML('beforeend',
                `<div style="text-align:center; margin-top:8px; color:var(--teal); font-family:var(--font-mono); font-size:0.75rem;">Correct!</div>`
            );
        } else {
            if (input) input.style.borderColor = 'var(--error)';
            soundManager.play('click');
            if (card) card.insertAdjacentHTML('beforeend',
                `<div style="text-align:center; margin-top:8px; font-size:0.75rem;">
                    <span style="color:var(--error);">Incorrect.</span>
                    <span style="color:var(--text-body);"> Answer: <strong style="color:var(--text-heading);">${q.answer}</strong></span>
                </div>`
            );
        }

        this.time.delayedCall(1500, () => {
            this._currentQ++;
            this._showQuestion();
        });
    }

    _startTimer() {
        const timerEl = document.getElementById('flash-timer');
        const startTime = Date.now();
        const totalMs = TIME_PER_QUESTION * 1000;

        this._timerEvent = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                if (this._answered) return;

                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, 1 - elapsed / totalMs);
                if (timerEl) timerEl.style.width = `${remaining * 100}%`;

                if (remaining < 0.25 && timerEl) {
                    timerEl.style.background = 'var(--error)';
                    // Tick sound every ~1s in danger zone
                    const secondsLeft = Math.ceil(remaining * TIME_PER_QUESTION);
                    if (secondsLeft > 0 && Math.abs(elapsed % 1000) < 60) {
                        soundManager.play('timer-tick');
                    }
                }

                if (remaining <= 0) {
                    this._timeUp();
                }
            }
        });
    }

    _timeUp() {
        if (this._answered) return;
        this._answered = true;
        if (this._timerEvent) this._timerEvent.remove();

        const q = this._questions[this._currentQ];
        if (q.type === 'mc' || q.type === 'topic') {
            document.querySelector('.flash-option[data-correct="true"]')?.classList.add('correct');
        } else if (q.type === 'tf') {
            const correctVal = q.answer ? 'true' : 'false';
            document.querySelector(`.flash-tf-btn[data-tf="${correctVal}"]`)?.classList.add('correct');
        } else if (q.type === 'fill') {
            const card = document.querySelector('.flash-card');
            if (card) card.insertAdjacentHTML('beforeend',
                `<div style="text-align:center; margin-top:8px; font-size:0.75rem; color:var(--text-body);">
                    Answer: <strong style="color:var(--text-heading);">${q.answer}</strong>
                </div>`
            );
        }

        soundManager.play('click');
        this.time.delayedCall(1500, () => {
            this._currentQ++;
            this._showQuestion();
        });
    }

    _showResults() {
        this._clearUI();

        const total = this._questions.length;
        const pct = Math.round((this._score / total) * 100);
        const xpEarned = this._score * XP_PER_CORRECT;
        const perfectBonus = this._score === total ? XP_BONUS_PERFECT : 0;
        const speedBonus = Math.round(this._speedBonusTotal);
        const totalXp = xpEarned + perfectBonus + speedBonus;

        if (totalXp > 0) {
            xpManager.award(totalXp, 'Flash Challenge');
        }

        let grade, gradeColor;
        if (pct >= 90) { grade = 'EXCELLENT'; gradeColor = 'var(--teal)'; }
        else if (pct >= 70) { grade = 'GREAT'; gradeColor = 'var(--teal-dim)'; }
        else if (pct >= 50) { grade = 'GOOD'; gradeColor = 'var(--text-heading)'; }
        else { grade = 'KEEP STUDYING'; gradeColor = 'var(--text-muted)'; }

        const html = `
            <div class="scene-panel" id="flash-panel" style="padding-bottom:80px;">
                <div class="flash-container">
                    <div class="flash-card">
                        <div style="font-size:2rem; margin-bottom:12px;">&#x26A1;</div>
                        <div style="font-family:var(--font-mono); font-size:1.25rem; font-weight:500; color:${gradeColor}; margin-bottom:4px;">
                            ${grade}
                        </div>
                        <div style="font-size:0.875rem; color:var(--text-heading); margin-bottom:16px;">
                            ${this._score} / ${total} correct (${pct}%)
                        </div>

                        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-bottom:20px;">
                            <div style="text-align:center;">
                                <div style="font-family:var(--font-mono); font-size:0.875rem; color:var(--teal);">+${xpEarned}</div>
                                <div style="font-size:0.5625rem; color:var(--text-muted);">Base XP</div>
                            </div>
                            ${speedBonus > 0 ? `
                                <div style="text-align:center;">
                                    <div style="font-family:var(--font-mono); font-size:0.875rem; color:#c4a265;">+${speedBonus}</div>
                                    <div style="font-size:0.5625rem; color:var(--text-muted);">Speed Bonus</div>
                                </div>
                            ` : ''}
                            ${perfectBonus ? `
                                <div style="text-align:center;">
                                    <div style="font-family:var(--font-mono); font-size:0.875rem; color:var(--teal);">+${perfectBonus}</div>
                                    <div style="font-size:0.5625rem; color:var(--text-muted);">Perfect Bonus</div>
                                </div>
                            ` : ''}
                        </div>

                        <div style="display:flex; gap:8px; width:100%;">
                            <button class="btn btn-secondary" id="btn-flash-again" style="flex:1;">
                                Play Again
                            </button>
                            <button class="btn btn-primary" id="btn-flash-done" style="flex:1;">
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);

        document.getElementById('btn-flash-again')?.addEventListener('click', () => {
            soundManager.play('click');
            this._currentQ = 0;
            this._score = 0;
            this._speedBonusTotal = 0;
            this._showLoading();
            this._loadQuestions();
        });

        document.getElementById('btn-flash-done')?.addEventListener('click', () => {
            soundManager.play('click');
            this._goBack();
        });
    }

    _goBack() {
        this._clearUI();
        if (this._timerEvent) this._timerEvent.remove();
        transitionTo(this, 'GardenScene');
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('flash-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }
}
