/**
 * QuestScene — Interactive quest at a real Austin shop.
 * Phases: Intro -> Learn Products -> Quiz -> Pitch Simulation (Chat Bubbles) -> Reward
 */

import { Scene } from 'phaser';
import { getLocationById } from '../config/austin-locations.js';
import { PRODUCTS } from '../config/products.js';
import { getQuizForLocation } from '../config/quizzes.js';
import { xpManager } from '../systems/XPManager.js';
import { dataBridge } from '../systems/DataBridge.js';
import { settings } from '../systems/Settings.js';
import { achievementManager } from '../systems/Achievements.js';
import { soundManager } from '../systems/SoundManager.js';
import { dailyQuests } from '../systems/DailyQuests.js';

export class QuestScene extends Scene {
    constructor() {
        super({ key: 'QuestScene' });
    }

    init(data) {
        this.locationId = data.locationId;
        this.location = getLocationById(this.locationId);
        this.phase = 'intro';
        this.quizData = getQuizForLocation(this.locationId);
        this.quizIndex = 0;
        this.quizScore = 0;
        this.quizAnswered = false;
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x12181a);

        if (settings.preset.particles) {
            this._ambientParticles(w, h);
        }

        this._showIntro();
        this._updateNavBar(null); // hide active nav during quest
    }

    // ── PHASE: Intro ──
    _showIntro() {
        this._clearUI();
        const loc = this.location;

        const html = `
            <div class="scene-panel" id="quest-panel" style="bottom:56px;">
                <button class="scene-back" id="btn-back">&larr; BACK TO MAP</button>

                <div class="shop-header">
                    <div class="shop-icon" style="background:${loc.color}20; color:${loc.color}; font-size:1.5rem;">${loc.emoji}</div>
                    <div>
                        <div class="shop-name">${loc.name}</div>
                        <div class="shop-address">${loc.address}</div>
                        <div class="shop-tags">
                            ${loc.tags.map(t => `<span class="shop-tag">${t}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <p style="color:#8e9c98; font-size:0.8125rem; line-height:1.6; margin-bottom:16px;">
                    ${loc.description}
                </p>

                <div class="quest-card pixel-corners">
                    <div class="quest-title">${loc.questTitle}</div>
                    <div class="quest-desc">${loc.questDescription}</div>
                    <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">
                        <span style="color:#50e8c0; font-size:0.6875rem; font-weight:500; font-family:var(--font-mono);">+${loc.xpReward} XP</span>
                        <span style="color:#506460; font-size:0.6875rem; font-family:var(--font-mono);">DIFF: ${'&#9608;'.repeat(loc.difficulty)}${'&#9617;'.repeat(3 - loc.difficulty)}</span>
                    </div>
                </div>

                ${xpManager.isQuestCompleted(loc.id) ? `
                    <div style="text-align:center; padding:16px 0;">
                        <div style="color:#50e8c0; font-size:1rem; margin-bottom:4px; font-family:var(--font-mono);">// QUEST COMPLETED</div>
                        <p style="color:#506460; font-size:0.75rem;">You've already visited this location. Revisit to study the products again.</p>
                        <button class="btn btn-secondary" id="btn-revisit" style="margin-top:12px;">REVIEW PRODUCTS</button>
                    </div>
                ` : `
                    <div style="text-align:center; padding:12px 0;">
                        <div class="section-header" style="justify-content:center;">Mission Briefing</div>
                        <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-bottom:16px;">
                            <span class="shop-tag">01. LEARN PRODUCTS</span>
                            <span class="shop-tag">02. KNOWLEDGE QUIZ</span>
                            <span class="shop-tag">03. PITCH SIMULATION</span>
                            <span class="shop-tag">04. EARN XP</span>
                        </div>
                        <button class="btn btn-primary" id="btn-start">ENTER ${loc.name.toUpperCase()}</button>
                    </div>
                `}

                <div style="margin-top:16px;">
                    <div class="section-header">Intel</div>
                    ${(loc.pitchTips || []).map(tip => `
                        <div style="display:flex; gap:6px; margin-bottom:4px; font-size:0.75rem; color:#8e9c98;">
                            <span style="color:#50e8c0; flex-shrink:0; font-family:var(--font-mono);">&gt;</span>
                            <span>${tip}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this._injectHTML(html);

        document.getElementById('btn-back')?.addEventListener('click', () => this._goBack());
        document.getElementById('btn-start')?.addEventListener('click', () => this._showLearn());
        document.getElementById('btn-revisit')?.addEventListener('click', () => this._showLearn());
    }

    // ── PHASE: Learn Products ──
    _showLearn() {
        this._clearUI();
        const loc = this.location;
        const relevantProducts = PRODUCTS.filter(p => loc.bestProducts.includes(p.plant));

        const html = `
            <div class="scene-panel" id="quest-panel" style="bottom:56px;">
                <button class="scene-back" id="btn-back">&larr; BACK TO ${loc.name.toUpperCase()}</button>
                <h2 class="scene-heading">Product Knowledge</h2>
                <p class="scene-subheading" style="font-family:var(--font-mono); font-size:0.6875rem;">
                    // Study these products before the quiz. Learn the science and the pitch.
                </p>

                ${relevantProducts.map(p => `
                    <div class="product-learn pixel-corners">
                        <div class="product-learn-name">${p.name}</div>
                        <div class="product-learn-detail">
                            <strong style="color:#bccac4;">Science:</strong> ${p.science}
                        </div>
                        <div class="product-learn-detail" style="margin-top:6px;">
                            <strong style="color:#bccac4;">Pitch:</strong> ${p.pitch}
                        </div>
                        <div class="product-learn-price">RETAIL: $${p.price} | ${p.category.toUpperCase()}</div>
                    </div>
                `).join('')}

                <div style="text-align:center; padding:16px 0;">
                    <p style="color:#506460; font-size:0.6875rem; margin-bottom:12px; font-family:var(--font-mono);">// READY TO TEST YOUR KNOWLEDGE?</p>
                    <button class="btn btn-primary" id="btn-quiz">START QUIZ</button>
                </div>
            </div>
        `;

        this._injectHTML(html);
        document.getElementById('btn-back')?.addEventListener('click', () => this._showIntro());
        document.getElementById('btn-quiz')?.addEventListener('click', () => {
            this.quizIndex = 0;
            this.quizScore = 0;
            this._showQuiz();
        });
    }

    // ── PHASE: Quiz ──
    _showQuiz() {
        this._clearUI();
        if (!this.quizData) { this._showPitch(); return; }

        const quiz = this.quizData;
        const q = quiz.questions[this.quizIndex];
        const total = quiz.questions.length;

        const html = `
            <div class="scene-panel" id="quest-panel" style="bottom:56px;">
                <button class="scene-back" id="btn-back">&larr; BACK TO PRODUCTS</button>
                <h2 class="scene-heading">${quiz.title}</h2>
                <p class="scene-subheading" style="font-family:var(--font-mono); font-size:0.6875rem;">// QUESTION ${this.quizIndex + 1} OF ${total}</p>

                <div class="quiz-progress">
                    ${quiz.questions.map((_, i) => `
                        <div class="quiz-dot ${i < this.quizIndex ? 'done' : ''} ${i === this.quizIndex ? 'active' : ''}"></div>
                    `).join('')}
                </div>

                <div class="quiz-question">${q.q}</div>
                <div class="quiz-options">
                    ${q.options.map((opt, i) => `
                        <button class="quiz-option" data-idx="${i}">${opt}</button>
                    `).join('')}
                </div>

                <div id="quiz-feedback" style="display:none; padding:10px 14px; border-radius:3px; margin-bottom:12px; font-size:0.8125rem; line-height:1.5;"></div>
                <div id="quiz-next-wrap" style="display:none; text-align:center;">
                    <button class="btn btn-primary" id="btn-next-q">NEXT QUESTION</button>
                </div>
            </div>
        `;

        this._injectHTML(html);
        this.quizAnswered = false;

        document.getElementById('btn-back')?.addEventListener('click', () => this._showLearn());

        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.quizAnswered) return;
                this.quizAnswered = true;

                const idx = parseInt(e.target.dataset.idx);
                const correct = idx === q.correct;

                soundManager.play(correct ? 'correct' : 'wrong');
                if (correct) this.quizScore++;

                document.querySelectorAll('.quiz-option').forEach((b, i) => {
                    b.classList.add('disabled');
                    if (i === q.correct) b.classList.add('correct');
                    if (i === idx && !correct) b.classList.add('wrong');
                });

                const fb = document.getElementById('quiz-feedback');
                fb.style.display = 'block';
                fb.style.background = correct ? 'rgba(80,232,192,0.06)' : 'rgba(196,92,75,0.06)';
                fb.style.border = `1px solid ${correct ? 'rgba(80,232,192,0.12)' : 'rgba(196,92,75,0.12)'}`;
                fb.style.color = '#bccac4';
                fb.innerHTML = `<strong style="color:${correct ? '#50e8c0' : '#c45c4b'}; font-family:var(--font-mono);">${correct ? '// CORRECT' : '// INCORRECT'}</strong> ${q.explanation}`;

                const nextWrap = document.getElementById('quiz-next-wrap');
                nextWrap.style.display = 'block';

                const isLast = this.quizIndex >= total - 1;
                document.getElementById('btn-next-q').textContent = isLast ? 'SEE RESULTS' : 'NEXT QUESTION';
                document.getElementById('btn-next-q').addEventListener('click', () => {
                    if (isLast) {
                        this._showQuizResults();
                    } else {
                        this.quizIndex++;
                        this._showQuiz();
                    }
                });
            });
        });
    }

    _showQuizResults() {
        this._clearUI();
        const quiz = this.quizData;
        const passed = this.quizScore >= quiz.passingScore;
        const pct = Math.round((this.quizScore / quiz.questions.length) * 100);

        // Save quiz result via DataBridge (syncs to Supabase)
        dataBridge.saveQuizResult(this.locationId, quiz.title, this.quizScore, quiz.questions.length, passed);

        if (passed) {
            dataBridge.awardXP(50, 'quiz', this.locationId, `Quiz passed: ${quiz.title}`);
            soundManager.play('xp');
        }

        // Check for perfect quiz achievement
        if (this.quizScore === quiz.questions.length) {
            achievementManager.check();
        }

        const html = `
            <div class="scene-panel" id="quest-panel" style="bottom:56px;">
                <div class="quiz-result">
                    <div class="quiz-score" style="color:${passed ? '#50e8c0' : '#c45c4b'}">${this.quizScore} / ${quiz.questions.length}</div>
                    <div class="quiz-label">${pct}% &mdash; ${passed ? '// PASSED' : '// FAILED'}</div>
                    ${passed ? '<div style="color:#50e8c0; font-size:0.8125rem; margin-top:8px; font-family:var(--font-mono);">+50 XP</div>' : ''}
                </div>

                <div style="text-align:center; padding:12px 0;">
                    ${passed ? `
                        <p style="color:#8e9c98; font-size:0.8125rem; margin-bottom:12px;">Knowledge verified. Initiating pitch simulation...</p>
                        <button class="btn btn-primary" id="btn-pitch">START PITCH SIM</button>
                    ` : `
                        <p style="color:#8e9c98; font-size:0.8125rem; margin-bottom:12px;">You need ${quiz.passingScore} correct to continue. Review the products and try again.</p>
                        <button class="btn btn-secondary" id="btn-retry">STUDY PRODUCTS AGAIN</button>
                    `}
                </div>
            </div>
        `;

        this._injectHTML(html);
        document.getElementById('btn-pitch')?.addEventListener('click', () => this._showPitch());
        document.getElementById('btn-retry')?.addEventListener('click', () => this._showLearn());
    }

    // ── PHASE: Pitch Simulation (Chat Bubbles!) ──
    _showPitch() {
        this._clearUI();
        const loc = this.location;
        const pitchSteps = this._getPitchSteps(loc);

        this._pitchSteps = pitchSteps;
        this._pitchIndex = 0;
        this._pitchScore = 0;
        this._chatHistory = [];

        const html = `
            <div class="scene-panel" id="quest-panel" style="bottom:56px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div>
                        <h2 class="scene-heading" style="font-size:1rem;">Pitch Sim: ${loc.name}</h2>
                        <p style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted); text-transform:uppercase;">
                            ${loc.ownerPersonality}
                        </p>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted); text-transform:uppercase;">Round</div>
                        <div id="pitch-round" style="font-family:var(--font-mono); font-size:1rem; color:var(--teal);">1/${pitchSteps.length}</div>
                    </div>
                </div>

                <!-- Chat container -->
                <div class="chat-container" id="chat-container" style="min-height:200px;"></div>

                <!-- Choice area -->
                <div id="chat-choices-area" style="margin-top:8px;"></div>
            </div>
        `;

        this._injectHTML(html);

        // Start with system message
        this._addSystemMessage(`Entering ${loc.name}...`);

        // After a brief delay, show first NPC message
        setTimeout(() => {
            this._showTypingThenMessage(pitchSteps[0], () => {
                this._showPitchChoices(0);
            });
        }, 600);
    }

    _addChatBubble(type, speaker, text, delay = 0) {
        return new Promise(resolve => {
            setTimeout(() => {
                const container = document.getElementById('chat-container');
                if (!container) { resolve(); return; }

                const bubble = document.createElement('div');
                bubble.className = `chat-bubble ${type}`;

                if (type !== 'system') {
                    const speakerEl = document.createElement('div');
                    speakerEl.className = `chat-speaker ${type === 'npc' ? 'npc-name' : 'player-name'}`;
                    speakerEl.textContent = speaker;
                    bubble.appendChild(speakerEl);
                }

                const textEl = document.createElement('div');
                textEl.textContent = text;
                bubble.appendChild(textEl);

                container.appendChild(bubble);
                container.scrollTop = container.scrollHeight;

                this._chatHistory.push({ type, speaker, text });
                resolve();
            }, delay);
        });
    }

    _addSystemMessage(text) {
        const container = document.getElementById('chat-container');
        if (!container) return;

        const bubble = document.createElement('div');
        bubble.className = 'chat-bubble system';
        bubble.textContent = `[ ${text} ]`;
        container.appendChild(bubble);
    }

    _showTypingIndicator() {
        const container = document.getElementById('chat-container');
        if (!container) return;

        const typing = document.createElement('div');
        typing.className = 'chat-bubble npc';
        typing.id = 'typing-indicator';
        typing.innerHTML = `
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
    }

    _removeTypingIndicator() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    _showTypingThenMessage(step, callback) {
        this._showTypingIndicator();

        // Simulate typing delay (longer for longer messages)
        const delay = Math.min(800 + step.text.length * 8, 2000);

        setTimeout(() => {
            this._removeTypingIndicator();
            this._addChatBubble('npc', step.speaker, step.text.replace(/^"|"$/g, ''));
            if (callback) setTimeout(callback, 300);
        }, delay);
    }

    _showPitchChoices(stepIndex) {
        const step = this._pitchSteps[stepIndex];
        const choicesArea = document.getElementById('chat-choices-area');
        if (!choicesArea) return;

        const choiceLabels = ['A', 'B', 'C'];

        choicesArea.innerHTML = `
            <div class="section-header" style="margin-bottom:6px;">Your Response</div>
            <div class="chat-choices">
                ${step.choices.map((c, i) => `
                    <button class="chat-choice" data-choice="${i}">
                        <span class="choice-label">Option ${choiceLabels[i]}</span>
                        ${c.text}
                    </button>
                `).join('')}
            </div>
        `;

        document.querySelectorAll('.chat-choice').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choiceIdx = parseInt(e.currentTarget.dataset.choice);
                this._handlePitchChoice(stepIndex, choiceIdx);
            });
        });
    }

    _handlePitchChoice(stepIndex, choiceIdx) {
        const step = this._pitchSteps[stepIndex];
        const choice = step.choices[choiceIdx];
        this._pitchScore += choice.score;

        // Clear choices
        const choicesArea = document.getElementById('chat-choices-area');
        if (choicesArea) choicesArea.innerHTML = '';

        // Show player's chosen message as chat bubble
        this._addChatBubble('player', 'You', choice.text);

        // Show NPC response with typing indicator
        setTimeout(() => {
            this._showTypingIndicator();

            const responseDelay = Math.min(600 + choice.response.length * 6, 1800);

            setTimeout(() => {
                this._removeTypingIndicator();
                this._addChatBubble('npc', step.speaker, choice.response.replace(/^"|"$/g, ''));

                // Show score indicator
                const scoreColors = ['var(--error)', 'var(--text-muted)', 'var(--teal-dim)', 'var(--teal)'];
                const scoreLabels = ['Weak response', 'Okay response', 'Good response', 'Excellent response'];
                const container = document.getElementById('chat-container');
                if (container) {
                    const indicator = document.createElement('div');
                    indicator.className = 'chat-bubble system';
                    indicator.innerHTML = `<span style="color:${scoreColors[choice.score]}; font-family:var(--font-mono); font-size:0.5625rem;">[ ${scoreLabels[choice.score]} +${choice.score} pts ]</span>`;
                    container.appendChild(indicator);
                    container.scrollTop = container.scrollHeight;
                }

                this._pitchIndex++;
                const roundEl = document.getElementById('pitch-round');
                if (roundEl) roundEl.textContent = `${Math.min(this._pitchIndex + 1, this._pitchSteps.length)}/${this._pitchSteps.length}`;

                if (this._pitchIndex >= this._pitchSteps.length) {
                    // Pitch complete
                    setTimeout(() => {
                        this._addSystemMessage('Pitch simulation complete.');
                        setTimeout(() => {
                            if (choicesArea) {
                                choicesArea.innerHTML = `
                                    <div style="text-align:center; padding:12px 0;">
                                        <button class="btn btn-primary" id="btn-finish">VIEW RESULTS</button>
                                    </div>
                                `;
                                document.getElementById('btn-finish')?.addEventListener('click', () => this._showReward());
                            }
                        }, 400);
                    }, 600);
                } else {
                    // Next pitch step
                    setTimeout(() => {
                        const nextStep = this._pitchSteps[this._pitchIndex];
                        this._showTypingThenMessage(nextStep, () => {
                            this._showPitchChoices(this._pitchIndex);
                        });
                    }, 800);
                }
            }, responseDelay);
        }, 400);
    }

    _getPitchSteps(loc) {
        if (loc.id === 'herb-bar') {
            return [
                {
                    speaker: 'Shop Owner',
                    text: '"Welcome to The Herb Bar. We\'ve been making our own remedies since \'87. What brings you by?"',
                    choices: [
                        { text: 'I\'d love to show you our Blue Lotus tinctures and extracts \u2014 the alkaloid profiles are really impressive.', score: 3, response: '"Oh? Tell me more about the alkaloid content. We care about the science here."' },
                        { text: 'We have the cheapest botanicals in Texas. Want to see our price list?', score: 0, response: '"We don\'t really compete on price here. We care more about quality and sourcing."' },
                        { text: 'I have some herbal products your customers might love.', score: 1, response: '"Sure, what kind of herbs? We carry a lot already."' }
                    ]
                },
                {
                    speaker: 'Shop Owner',
                    text: '"We already carry bulk Blue Lotus petals. What makes your products different?"',
                    choices: [
                        { text: 'Our tincture is 5000mg potency with both apomorphine and nuciferine preserved through careful extraction. Plus we have resin extracts for experienced users.', score: 3, response: '"Now that\'s interesting. A concentrated format alongside the dried flower \u2014 that gives customers options."' },
                        { text: 'Our Kanna gummies are our best seller. Want to try one?', score: 1, response: '"Kanna is interesting, but you didn\'t answer my question about Blue Lotus specifically."' },
                        { text: 'It\'s Blue Lotus. Same thing basically.', score: 0, response: '"If it\'s the same thing, why would I switch suppliers? I need a reason."' }
                    ]
                },
                {
                    speaker: 'Shop Owner',
                    text: '"I\'m interested. What about Kanna? We\'ve had some customers ask about it."',
                    choices: [
                        { text: 'Kanna contains mesembrine \u2014 a natural serotonin reuptake inhibitor. We offer dried fermented herb, a high-potency CO2 extract, and gummies for the entry-level customer.', score: 3, response: '"A good-better-best lineup. Smart. The fermented preparation is the traditional way \u2014 I respect that."' },
                        { text: 'It makes people happy. Very popular right now.', score: 1, response: '"I need more specifics than that for our customers. They ask detailed questions."' },
                        { text: 'I\'m not sure about the details. Can I get back to you?', score: 0, response: '"Sure. Come back when you\'ve done your homework."' }
                    ]
                }
            ];
        }

        if (loc.id === 'ace-of-cups') {
            return [
                {
                    speaker: 'Herbalist',
                    text: '"Hey! Welcome to Ace of Cups. I\'m mixing a custom adaptogen blend right now. We make most of our tinctures in-house. What are you bringing to the table?"',
                    choices: [
                        { text: 'I see you craft your own line — impressive. We\'re not here to compete with that. Our Kanna and Blue Lotus extracts fill gaps you might not cover yet. Complementary, not competing.', score: 3, response: '"I appreciate that approach. Too many reps try to replace our house line. What\'s different about your Kanna?"' },
                        { text: 'Our products are way better than what you make in-house. You should switch to us.', score: 0, response: '"Excuse me? We\'ve been perfecting our formulations for years. Maybe you should try a different approach."' },
                        { text: 'I have some botanical products. Want to take a look?', score: 1, response: '"Sure, but I need to know how they fit with what we already do."' }
                    ]
                },
                {
                    speaker: 'Herbalist',
                    text: '"Our East Austin customers are pretty adventurous. They\'re always asking about mood support. What\'s the mechanism behind your Kanna?"',
                    choices: [
                        { text: 'Kanna\'s key alkaloid mesembrine is a natural serotonin reuptake inhibitor. Think of it like nature\'s version of an SSRI — but from a South African succulent the Khoisan people have used for centuries.', score: 3, response: '"A natural SRI? That\'s exactly the kind of thing my customers research before buying. The traditional use history adds credibility too."' },
                        { text: 'It makes you feel happy. Very popular on TikTok right now.', score: 1, response: '"My customers don\'t buy based on TikTok trends. They want to know the why."' },
                        { text: 'It\'s a mood booster. Works really well.', score: 1, response: '"But how? What\'s the science? Our customers always ask."' }
                    ]
                },
                {
                    speaker: 'Herbalist',
                    text: '"I\'d want my staff to actually understand these products before we sell them. How do you support retail partners?"',
                    choices: [
                        { text: 'We do in-store education sessions with samples. Your staff tries the products, learns the science, and becomes product champions. Educated staff = confident recommendations = repeat customers.', score: 3, response: '"Now you\'re speaking my language. An education session with samples would be huge for my team. Let\'s schedule something."' },
                        { text: 'We have brochures I can leave behind.', score: 1, response: '"Brochures end up in a drawer. I need something more hands-on."' },
                        { text: 'Your staff can just read the labels.', score: 0, response: '"That\'s not how we operate. Our staff needs real training on anything we carry."' }
                    ]
                }
            ];
        }

        if (loc.id === 'texas-medicinals') {
            return [
                {
                    speaker: 'Master Herbalist',
                    text: '"I\'ve been making remedies for 25 years. I\'ve seen hundreds of reps come through that door. Most can\'t answer my first question: What extraction method do you use for your Kanna, and why?"',
                    choices: [
                        { text: 'Supercritical CO2 extraction. It\'s selective — we can target specific alkaloid fractions at low temperatures, preserving heat-sensitive compounds like mesembrine without leaving solvent residues. Clean label, full spectrum.', score: 3, response: '"That\'s the right answer. CO2 selectivity is key. Most reps say \'alcohol extraction\' and I stop listening. Continue."' },
                        { text: 'We use the best extraction method available. State of the art.', score: 0, response: '"That tells me nothing. If you don\'t know your own extraction method, we\'re done here."' },
                        { text: 'I believe it\'s CO2 extraction? I\'d have to check with our lab team on the specifics.', score: 1, response: '"You \'believe?\' You should KNOW. But at least you\'re in the right ballpark. What about standardization?"' }
                    ]
                },
                {
                    speaker: 'Master Herbalist',
                    text: '"Show me your Certificate of Analysis. What\'s the mesembrine content per batch? And what about heavy metals testing?"',
                    choices: [
                        { text: 'Each batch is tested — COA shows mesembrine content standardized to minimum thresholds, plus full heavy metals panel, microbial testing, and pesticide screening. I can pull up the latest batch data right now.', score: 3, response: '"Now we\'re talking. Batch-specific testing is non-negotiable for us. The fact that you know this tells me your company takes quality seriously."' },
                        { text: 'We test everything. It\'s all high quality, I promise.', score: 1, response: '"Promises don\'t interest me. Data does. Can you get me actual numbers?"' },
                        { text: 'I\'m not sure about the testing specifics. Our company handles that.', score: 0, response: '"Then you\'re not ready to sell to us. Come back when you can talk specifics."' }
                    ]
                },
                {
                    speaker: 'Master Herbalist',
                    text: '"One more. A customer asks you about Kanna interactions with their SSRI medication. What do you tell them?"',
                    choices: [
                        { text: 'Kanna is a natural SRI — combining it with pharmaceutical SSRIs, MAOIs, or tramadol risks serotonin syndrome. We always recommend consulting their prescriber before combining serotonergic substances. Safety first.', score: 3, response: '"Exactly right. Most reps either don\'t know this or claim there are zero interactions. Your honesty about contraindications actually makes me trust your other claims. Let\'s talk wholesale terms."' },
                        { text: 'It\'s all natural, so it\'s completely safe with everything.', score: 0, response: '"That answer is dangerous and disqualifying. Natural does NOT mean no interactions. Please leave."' },
                        { text: 'They should probably check with their doctor.', score: 2, response: '"Correct instinct, but you should know WHY. The serotonin syndrome risk is the specific concern. Know your contraindications."' }
                    ]
                }
            ];
        }

        if (loc.id === 'peoples-pharmacy') {
            return [
                {
                    speaker: 'Supplement Buyer',
                    text: '"We carry over 3,000 SKUs. Space is competitive. Give me your 30-second elevator pitch — why should Nored Farms be on our shelves?"',
                    choices: [
                        { text: 'Three products, three gaps you probably have: Kanna for natural mood support with SRI mechanism, Kava CO2 extract for clean-label anxiety relief, and Blue Lotus gummies with a proven 2-week reorder rate. Each fills a category niche.', score: 3, response: '"Category gap analysis. Smart. We do have thin coverage in natural mood support. Tell me more about the reorder data."' },
                        { text: 'We have really great botanicals. Everyone loves them.', score: 0, response: '"I hear that from 10 reps a week. Give me data, not opinions."' },
                        { text: 'Our Blue Lotus products are unique. Not many stores carry Blue Lotus yet.', score: 2, response: '"Novelty alone doesn\'t justify shelf space. But you\'re right — our Blue Lotus section is weak. What\'s the clinical angle?"' }
                    ]
                },
                {
                    speaker: 'Supplement Buyer',
                    text: '"Our pharmacists need to know about contraindications. What\'s the safety profile for your Kava extract?"',
                    choices: [
                        { text: 'WHO reviewed Kava hepatotoxicity reports and found the risk was linked to acetone and ethanol extraction methods, not traditional water or CO2 extraction. Our CO2 extract avoids those solvents entirely. No known interactions with most common medications, but we recommend caution with hepatically-metabolized drugs.', score: 3, response: '"That\'s the distinction our pharmacists need. Most reps don\'t know the WHO findings. This tells me you\'ve done the work."' },
                        { text: 'Kava is totally safe. It\'s been used for thousands of years.', score: 0, response: '"Traditional use doesn\'t equal safety for everyone. Our pharmacists need specific data, not blanket statements."' },
                        { text: 'I know there have been some liver concerns. I can get you more specific data.', score: 1, response: '"Get me that data. We can\'t stock anything without a clear safety profile for our pharmacists."' }
                    ]
                },
                {
                    speaker: 'Supplement Buyer',
                    text: '"Assuming the products check out — what kind of sell-through velocity can we expect?"',
                    choices: [
                        { text: 'Blue Lotus Gummies are our velocity leader — average 2-week reorder cycle. Position them at checkout for impulse buys. Kanna Tincture has higher AOV at $80 but slower turns. I recommend a checkout + wellness aisle split placement.', score: 3, response: '"Checkout placement for impulse, wellness aisle for considered purchase. You understand retail mechanics. Let\'s set up a trial order."' },
                        { text: 'They sell really well everywhere.', score: 0, response: '"\'Really well\' isn\'t a velocity metric. Give me reorder rates, turns per month, something measurable."' },
                        { text: 'I think they\'d do well here based on your customer demographics.', score: 1, response: '"I need more than a guess. But you\'re right about the demographic fit — our wellness customers would be interested."' }
                    ]
                }
            ];
        }

        if (loc.id === 'in-gredients') {
            return [
                {
                    speaker: 'Store Manager',
                    text: '"Welcome to in.gredients! Everything here is about reducing waste. Before I even look at your products — tell me about your packaging."',
                    choices: [
                        { text: 'Great question — for your store specifically, I\'d suggest our dried botanicals in bulk format with refill options. Customers bring their own containers, weigh what they need. Zero packaging waste. Our glass vial seeds are also reusable containers.', score: 3, response: '"Bulk refill is exactly what we need! And glass vials we can display without guilt. You\'ve clearly thought about our model."' },
                        { text: 'We use standard retail packaging. Pretty standard stuff.', score: 0, response: '"Standard packaging doesn\'t work here. We\'re literally called \'in.gredients\' — zero waste is our identity."' },
                        { text: 'I\'m sure we could work on custom packaging options for your store.', score: 2, response: '"That\'s promising, but I\'d want to see a concrete plan. What can you actually offer today?"' }
                    ]
                },
                {
                    speaker: 'Store Manager',
                    text: '"We love supporting local. Tell me about your Texas connection."',
                    choices: [
                        { text: 'Nored Farms is Austin-based. Our live plants — Prickly Pear, Yucca, Dragon Fruit — are all grown right here in Central Texas. The Prickly Pear is literally a native Texas plant that needs zero irrigation. We\'re as local as it gets.', score: 3, response: '"Native Texas plants with zero irrigation? That\'s the ultimate sustainability story. Our customers will love that narrative."' },
                        { text: 'We\'re a Texas company. We ship from here.', score: 1, response: '"Where you ship from is less important than where you grow. Tell me more about the sourcing."' },
                        { text: 'Our botanicals come from various international sources.', score: 0, response: '"International sourcing is fine, but you led with the wrong foot. I asked about the local connection."' }
                    ]
                },
                {
                    speaker: 'Store Manager',
                    text: '"Could you do an event for our community? Our customers love learning about plants."',
                    choices: [
                        { text: 'Absolutely! I\'d love to host a \'Meet Your Medicine\' evening — hands-on exploration of Blue Lotus, Kanna, and Kava. History, science, and tasting. Your customers get education, you get foot traffic, we all win.', score: 3, response: '"\'Meet Your Medicine\' — I love that name! Community events are our biggest traffic drivers. Let\'s put a date on the calendar. And bring some live plants for display."' },
                        { text: 'We could put up a display with information cards.', score: 1, response: '"That\'s passive. Our community wants interactive, hands-on experiences."' },
                        { text: 'I\'m not really set up for events right now.', score: 0, response: '"Community engagement isn\'t optional for us. It\'s how we build relationships."' }
                    ]
                }
            ];
        }

        if (loc.id === 'rabbit-food') {
            return [
                {
                    speaker: 'Owner',
                    text: '"Everything in our store is 100% plant-based. No exceptions. Are all your products vegan?"',
                    choices: [
                        { text: 'Every single product — tinctures, gummies, extracts, dried botanicals, live plants, seeds. It\'s all plant-based by nature. We don\'t even have to try to be vegan — we just ARE.', score: 3, response: '"Ha! \'We don\'t have to try\' — I love that. Most brands have to reformulate. You\'re plant-based at the DNA level. What would you put on our wellness shelf?"' },
                        { text: 'Yes, I think so. Let me double check the gummy ingredients.', score: 1, response: '"You THINK so? In a vegan store, \'I think\' doesn\'t cut it. Know your ingredients cold."' },
                        { text: 'Most of them are. A couple might have gelatin.', score: 0, response: '"Then those can\'t be in our store. Period. Come back when you\'re 100% plant-based across the board."' }
                    ]
                },
                {
                    speaker: 'Owner',
                    text: '"We have a smoothie bar. Any of your products work as smoothie add-ins?"',
                    choices: [
                        { text: 'Blue Lotus dried petals make an amazing smoothie add-in — relaxation in every sip. Kanna extract powder can be a mood-boost shot. And Kava for your \'chill\' smoothie category. Each one adds a unique wellness angle to your menu.', score: 3, response: '"A \'chill\' smoothie with Kava? That practically names itself. We could do a whole \'Plant Medicine Smoothie\' line! Let me try some samples."' },
                        { text: 'Sure, you could blend some in.', score: 1, response: '"Which ones? How? I need specifics for my smoothie menu."' },
                        { text: 'Our products are really more for retail shelves.', score: 0, response: '"You\'re missing an opportunity. Our smoothie bar drives 40% of our traffic. Think bigger."' }
                    ]
                },
                {
                    speaker: 'Owner',
                    text: '"My customers are young, social media savvy. Which of your products would they actually post about?"',
                    choices: [
                        { text: 'Blue Lotus Gummies — the packaging pops on camera and the effects make people feel good enough to post about it. Plus Dragon Fruit plants are literally Instagram-worthy. And those glass vial sugarcane seeds? Aesthetic gift goals.', score: 3, response: '"You get our customers! Visual appeal + genuine quality = organic social content. I could see our regulars posting about these. Let\'s start with the gummies and plants."' },
                        { text: 'All of our products photograph well.', score: 1, response: '"Maybe, but which ones have the \'wow\' factor? My customers have 10,000 followers minimum — they\'re selective."' },
                        { text: 'I\'m not really sure about the social media angle.', score: 0, response: '"Social proof is everything in downtown Austin. If a product isn\'t shareable, it\'s invisible to our customers."' }
                    ]
                }
            ];
        }

        if (loc.id === 'antonelli-cheese') {
            return [
                {
                    speaker: 'Cheese Master',
                    text: '"This is a cheese shop, not an herb store. You\'ve got about 60 seconds to tell me why I should even listen to your pitch."',
                    choices: [
                        { text: 'Because food is an experience, and your customers already know that. Blue Lotus tea paired alongside a soft cheese board creates a contemplative tasting moment. You\'re not just selling cheese — you\'re selling an experience. We add a new dimension to that.', score: 3, response: '"...Okay, that\'s actually interesting. I\'ve never thought about botanical tea pairings. The contemplative angle works with how we approach cheese too. Go on."' },
                        { text: 'Botanicals are the next big thing in gourmet retail.', score: 1, response: '"Trends come and go. I\'ve been here 15 years. What makes this more than a trend?"' },
                        { text: 'You could add some herbal teas to your beverage selection.', score: 1, response: '"We already carry teas. What makes yours special enough for our curation?"' }
                    ]
                },
                {
                    speaker: 'Cheese Master',
                    text: '"I curate everything personally. Each product needs a story I can tell to customers. What\'s the story behind Blue Lotus?"',
                    choices: [
                        { text: '3,000 years of Egyptian history. Ancient priests steeped Blue Lotus petals in wine for ceremonial use — it appears in tomb paintings, hieroglyphics, and art spanning millennia. The alkaloids create a calm euphoria. It\'s possibly the most storied botanical on Earth.', score: 3, response: '"Egyptian wine infusions. That\'s the kind of story my customers get excited about. I can picture a \'Blue Lotus Tea & Aged Comté\' pairing event already."' },
                        { text: 'It\'s a pretty flower from Africa that makes you feel relaxed.', score: 0, response: '"That\'s a description, not a story. My customers expect depth. I need to be passionate about anything I carry."' },
                        { text: 'Blue Lotus has been used traditionally for centuries as a calming herb.', score: 1, response: '"Centuries isn\'t specific enough. Which centuries? Which cultures? The details make the story."' }
                    ]
                },
                {
                    speaker: 'Cheese Master',
                    text: '"What else could work as a gift item alongside our artisan cheeses?"',
                    choices: [
                        { text: 'Our Heirloom Sugarcane Seeds in glass vials — 10-20 year shelf life, gorgeous packaging, completely unique gift. And our Hibiscus Seeds with their connection to tea culture. Picture a gift basket: artisan cheese, Blue Lotus tea, and heirloom seeds. Tell me that\'s not a $75 gift set.', score: 3, response: '"A curated gift set with cheese, botanical tea, and heirloom seeds? That\'s holiday gold. Nobody else is offering that combination. Let\'s put together a pilot program."' },
                        { text: 'Any of our products would work as gifts.', score: 0, response: '"I don\'t need \'any\' — I need specific, curated recommendations. Tell me exactly which products and why."' },
                        { text: 'Our gummies are popular and make great gifts.', score: 1, response: '"Gummies feel a little too casual for our brand. Think more... artisan."' }
                    ]
                }
            ];
        }

        if (loc.id === 'south-congress-books') {
            return [
                {
                    speaker: 'Bookstore Owner',
                    text: '"We\'re a bookstore first. We carry select products that connect to our literary mission. How does a botanical company connect to books?"',
                    choices: [
                        { text: 'Ethnobotany. Every one of our plants has a story that connects to books you already carry. Blue Lotus connects to Egyptian art and history. Kanna to South African indigenous traditions. Nicotiana Rustica to Amazonian ceremony. We\'re selling the real things those books describe.', score: 3, response: '"Ethnobotany! That\'s our strongest non-fiction section. The idea of selling the actual plants alongside the books... that\'s compelling. What specifically would you put next to our ethnobotany shelf?"' },
                        { text: 'People who read also buy health products. It\'s cross-selling.', score: 0, response: '"That\'s a supermarket strategy, not a bookstore strategy. We curate by connection, not by cross-sell."' },
                        { text: 'You have a gift section. Our products make good gifts.', score: 1, response: '"Gifts, yes, but they need to feel connected to our brand. Random wellness products don\'t belong here."' }
                    ]
                },
                {
                    speaker: 'Bookstore Owner',
                    text: '"So what exactly would sit next to our ethnobotany section? Be specific."',
                    choices: [
                        { text: 'Dried Blue Lotus petals next to Egyptian archaeology books. Kanna with South African history and ethnobotany. Sugarcane seeds in glass vials as a conversation piece. Maybe small info cards linking each product to specific books you carry.', score: 3, response: '"Info cards linking products to our books? That\'s brilliant — it drives book sales AND product sales simultaneously. And the glass vial seeds are exactly the kind of curiosity object our SoCo tourists love."' },
                        { text: 'Some tinctures and gummies on a shelf.', score: 0, response: '"Tinctures on a bookshelf? That doesn\'t tell a story. Think about the visual connection."' },
                        { text: 'Seeds would be good. People who read about plants might want to grow them.', score: 2, response: '"That\'s the right thinking — readers want to experience what they read about. Seeds are the bridge. But I want more specificity."' }
                    ]
                },
                {
                    speaker: 'Bookstore Owner',
                    text: '"SoCo gets massive tourist foot traffic. What works as a \'must buy\' souvenir that connects to Austin?"',
                    choices: [
                        { text: 'Central Texas Prickly Pear — a native Texas plant that\'s edible, beautiful, and zero maintenance. Davis Mountain Yucca from the Texas desert. These are living Texas souvenirs that fly home better than a t-shirt. And our hibiscus seeds say \'grow your Austin memory.\'', score: 3, response: '"Living Texas souvenirs! That\'s perfect for SoCo tourism. A Prickly Pear from Austin is a way better souvenir than another \'Keep Austin Weird\' bumper sticker. Let\'s talk about a small display near the register."' },
                        { text: 'Our gummies are easy to pack in a suitcase.', score: 1, response: '"Packable is practical, but souvenirs need a story. What says \'Austin\' about your products?"' },
                        { text: 'Everything we sell could be a souvenir.', score: 0, response: '"Not everything is a souvenir. A souvenir tells a story about the place you visited. Which of your products does that?"' }
                    ]
                }
            ];
        }

        // La Lighthouse / Casa de Luz (default)
        return [
            {
                speaker: 'Co-op Member',
                text: '"Welcome to Casa de Luz. We\'re a holistic wellness community. Everything here serves our mission of healing and connection. What do you offer?"',
                choices: [
                    { text: 'We grow and extract plant medicines \u2014 Blue Lotus, Kanna, Kava. All plant-based, ethically sourced. They\'d complement your wellness community beautifully.', score: 3, response: '"Plant medicine is central to what we do here. Tell me about the sourcing."' },
                    { text: 'Here\'s our wholesale catalog. 30% off retail with net-30 terms.', score: 0, response: '"We\'re not just a retail shop. We need to understand the intention behind the products."' },
                    { text: 'I have some natural health products that are really popular on social media.', score: 1, response: '"We\'re less about trends and more about lasting healing traditions."' }
                ]
            },
            {
                speaker: 'Co-op Member',
                text: '"We host kava circles sometimes. Tell me about your Kava product."',
                choices: [
                    { text: 'Our Kava CO2 extract contains all six major kavalactones \u2014 kavain, dihydrokavain, yangonin, and more. CO2 extraction means no solvents, no heavy metals. Clean for ceremonies.', score: 3, response: '"Clean label is important to us. And the kavalactone profile matters for the experience."' },
                    { text: 'It\'s really strong kava. People love it.', score: 1, response: '"Strong isn\'t enough. Our community needs to know exactly what they\'re consuming."' },
                    { text: 'I think it\'s good kava. Let me check my notes...', score: 0, response: '"Come back when you know your products inside and out."' }
                ]
            },
            {
                speaker: 'Co-op Member',
                text: '"How would these products fit into our community space? We\'re not a typical retail store."',
                choices: [
                    { text: 'Blue Lotus tea could be part of your evening meditation sessions. Kanna for your wellness workshops. And you could sample Kava at your community gatherings \u2014 every product is fully plant-based and vegan.', score: 3, response: '"Yes! Integration into our programming, not just shelf space. I love that approach. Let\'s talk about a trial order."' },
                    { text: 'You could put them on a shelf near the checkout. They sell themselves.', score: 0, response: '"That\'s not really how we work here. Community integration is everything."' },
                    { text: 'Your practitioners could recommend them to clients during sessions.', score: 2, response: '"That\'s a good idea. Our reiki and energy workers might appreciate having plant allies to suggest."' }
                ]
            }
        ];
    }

    // ── PHASE: Reward ──
    _showReward() {
        this._clearUI();
        const loc = this.location;
        const maxPitchScore = this._pitchSteps.length * 3;
        const pitchPct = Math.round((this._pitchScore / maxPitchScore) * 100);
        const pitchGrade = pitchPct >= 80 ? 'A' : pitchPct >= 60 ? 'B' : pitchPct >= 40 ? 'C' : 'D';
        const gradeClass = `grade-${pitchGrade.toLowerCase()}`;

        const bonusXp = pitchPct >= 80 ? 50 : pitchPct >= 60 ? 25 : 0;
        const totalXp = loc.xpReward + bonusXp;

        // Award XP and mark complete via DataBridge
        if (!xpManager.isQuestCompleted(loc.id)) {
            dataBridge.awardXP(totalXp, 'quest', loc.id, `Quest complete: ${loc.questTitle}`);
            dataBridge.completeQuest(loc.id);
            soundManager.play('levelup');
        }

        // Check achievements after quest completion
        achievementManager.check();
        achievementManager.checkPitchGrade(pitchGrade);

        // Mark daily quest progress
        dailyQuests.markCompleted('complete_quiz');
        dailyQuests.markCompleted('visit_location');
        if (pitchGrade === 'A') dailyQuests.markCompleted('perfect_pitch');

        const html = `
            <div class="scene-panel" id="quest-panel" style="bottom:56px;">
                <div style="text-align:center; padding:24px 0;">
                    <div style="font-size:2rem; margin-bottom:8px;">${loc.emoji}</div>
                    <h2 class="scene-heading glitch-text" style="text-align:center; font-family:var(--font-mono);">// QUEST COMPLETE</h2>
                    <p class="scene-subheading" style="text-align:center;">${loc.questTitle}</p>

                    <div class="stat-grid" style="max-width:360px; margin:20px auto; grid-template-columns:repeat(3, 1fr);">
                        <div class="stat-box">
                            <div class="score-badge ${gradeClass}" style="margin:0 auto 4px;">${pitchGrade}</div>
                            <div class="stat-label">Pitch Grade</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">+${totalXp}</div>
                            <div class="stat-label">XP Earned</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${this.quizScore}/${this.quizData?.questions.length || 0}</div>
                            <div class="stat-label">Quiz Score</div>
                        </div>
                    </div>

                    ${bonusXp > 0 ? `
                        <div style="color:#50e8c0; font-size:0.75rem; margin-bottom:12px; font-family:var(--font-mono);">
                            PITCH BONUS: +${bonusXp} XP [GRADE ${pitchGrade}]
                        </div>
                    ` : ''}

                    <div style="background:var(--bg-alt); border:1px solid var(--teal-border); border-radius:3px; padding:14px; margin:16px auto; max-width:380px; text-align:left;">
                        <div class="section-header">Knowledge Acquired</div>
                        <ul style="list-style:none; padding:0; font-size:0.75rem; color:#8e9c98; line-height:1.6;">
                            ${loc.bestProducts.map(plant => {
                                const names = { 'blue-lotus': 'Blue Lotus alkaloids (apomorphine & nuciferine)', 'kanna': 'Kanna\'s mesembrine SRI mechanism', 'kava': 'Six major kavalactones & GABA activity' };
                                return `<li style="margin-bottom:2px;"><span style="color:#50e8c0; font-family:var(--font-mono);">&gt;</span> ${names[plant] || plant}</li>`;
                            }).join('')}
                            <li><span style="color:#50e8c0; font-family:var(--font-mono);">&gt;</span> Tailored pitch strategy for ${loc.type.toLowerCase()}</li>
                        </ul>
                    </div>

                    <button class="btn btn-primary" id="btn-map" style="margin-top:16px;">RETURN TO MAP</button>
                </div>
            </div>
        `;

        this._injectHTML(html);
        document.getElementById('btn-map')?.addEventListener('click', () => this._goBack());
    }

    // ── Nav bar state ──
    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    // ── Helpers ──
    _clearUI() {
        const existing = document.getElementById('quest-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

    _goBack() {
        this._clearUI();
        this.cameras.main.fadeOut(300, 18, 24, 26);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('AustinMapScene');
        });
    }

    _ambientParticles(w, h) {
        const count = settings.preset.maxParticles;
        if (count <= 0) return;

        this.add.particles(w / 2, h / 2, 'particle-star', {
            x: { min: 0, max: w },
            y: { min: 0, max: h },
            speed: { min: 2, max: 8 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.15, end: 0 },
            lifespan: 4000,
            frequency: 3000 / Math.max(count, 1),
            quantity: 1,
            blendMode: 'ADD'
        });
    }
}
