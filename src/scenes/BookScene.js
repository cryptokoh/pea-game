/**
 * BookScene — Page-flip reader for topic sections.
 * Receives { topicKey } from GardenScene, lazy-loads sections,
 * tracks reading progress, and awards XP on section completion.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { xpManager, showToast } from '../systems/XPManager.js';
import { learningProgress } from '../systems/LearningProgress.js';
import { getTopicByKey, loadTopicSections } from '../config/topics/index.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

export class BookScene extends Scene {
    constructor() {
        super({ key: 'BookScene' });
        this._topicKey = null;
        this._topic = null;
        this._sections = [];
        this._currentPage = 0;
    }

    init(data) {
        this._topicKey = data?.topicKey || 'growing';
        this._topic = getTopicByKey(this._topicKey);
        this._sections = [];
        this._currentPage = 0;
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
            this._sections = await loadTopicSections(this._topicKey);

            // Find first unread section to start at
            const firstUnread = this._sections.findIndex(
                s => !learningProgress.isCompleted(s.id)
            );
            this._currentPage = firstUnread >= 0 ? firstUnread : 0;

            this._showPage();
        } catch (err) {
            console.error('Failed to load topic sections:', err);
            this._showError();
        }
    }

    _showLoading() {
        this._clearUI();
        const html = `
            <div class="scene-panel" id="book-panel" style="padding-bottom:80px;">
                <div class="book-container">
                    <div style="text-align:center; padding:60px 0;">
                        <div style="font-size:1.5rem; margin-bottom:8px;">${this._topic?.icon || ''}</div>
                        <div style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--text-muted);">
                            Loading sections...
                        </div>
                    </div>
                </div>
            </div>
        `;
        this._injectHTML(html);
    }

    _showError() {
        this._clearUI();
        const html = `
            <div class="scene-panel" id="book-panel" style="padding-bottom:80px;">
                <div class="book-container">
                    <div class="book-header">
                        <button class="book-back" id="btn-book-back">&larr; Back</button>
                    </div>
                    <div style="text-align:center; padding:40px 0;">
                        <div style="font-size:0.8125rem; color:var(--error);">
                            Failed to load sections. Please try again.
                        </div>
                    </div>
                </div>
            </div>
        `;
        this._injectHTML(html);
        this._bindBack();
    }

    _showPage() {
        this._clearUI();

        if (!this._sections.length) {
            this._showError();
            return;
        }

        const section = this._sections[this._currentPage];
        const total = this._sections.length;
        const pageNum = this._currentPage + 1;
        const isCompleted = learningProgress.isCompleted(section.id);
        const topicCompleted = learningProgress.getTopicProgress(this._topicKey);

        const html = `
            <div class="scene-panel" id="book-panel" style="padding-bottom:80px;">
                <div class="book-container">
                    <!-- Header -->
                    <div class="book-header">
                        <button class="book-back" id="btn-book-back">&larr; Back</button>
                        <div class="book-topic-title">${this._topic?.icon || ''} ${this._topic?.title || ''}</div>
                    </div>

                    <!-- Progress bar -->
                    <div style="margin-bottom:12px;">
                        <div class="xp-bar-wrap" style="height:3px;">
                            <div class="xp-bar-fill" style="width:${Math.round((topicCompleted / total) * 100)}%"></div>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:4px;">
                            <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">
                                ${topicCompleted}/${total} sections completed
                            </span>
                            <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">
                                +${section.xpReward || 10} XP
                            </span>
                        </div>
                    </div>

                    <!-- Page content -->
                    <div class="book-page" id="book-page-content">
                        <div class="book-page-title">
                            ${isCompleted ? '<span class="book-complete-badge">&#x2713; Read</span> ' : ''}
                            ${section.title}
                        </div>
                        <div class="book-page-body">
                            ${section.body}
                        </div>
                    </div>

                    <!-- Navigation -->
                    <div class="book-nav">
                        <button class="book-nav-btn" id="btn-book-prev" ${this._currentPage === 0 ? 'disabled' : ''}>
                            &larr; Prev
                        </button>
                        <span class="book-nav-counter">${pageNum} / ${total}</span>
                        ${this._currentPage < total - 1
                            ? `<button class="book-nav-btn" id="btn-book-next">&rarr; Next</button>`
                            : `<button class="book-nav-btn" id="btn-book-finish" style="border-color:var(--teal); color:var(--teal);">
                                &#x2713; Finish
                              </button>`
                        }
                    </div>

                    <!-- Section dots -->
                    <div style="display:flex; gap:3px; justify-content:center; margin-top:12px; flex-wrap:wrap;">
                        ${this._sections.map((s, i) => {
                            const done = learningProgress.isCompleted(s.id);
                            const current = i === this._currentPage;
                            const bg = current ? 'var(--teal)' : done ? 'var(--teal-dim)' : 'var(--card-hover)';
                            return `<div class="book-dot" data-page="${i}" style="width:6px; height:6px; border-radius:50%; background:${bg}; cursor:pointer; transition:background 0.2s;"></div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);
        this._bindNavigation();

        // Mark section as read after a brief delay, then show inline quiz
        if (!isCompleted) {
            this._markTimer = this.time.delayedCall(2000, () => {
                this._showInlineQuiz(section);
            });
        }
    }

    _showInlineQuiz(section) {
        const facts = section.quickFacts;
        if (!facts || facts.length === 0) {
            this._completeSection(section, 0);
            return;
        }

        // Pick 1-2 random facts for inline quiz
        const shuffled = [...facts].sort(() => Math.random() - 0.5);
        const quizFacts = shuffled.slice(0, Math.min(2, shuffled.length));

        this._inlineQuizFacts = quizFacts;
        this._inlineQuizIdx = 0;
        this._inlineBonus = 0;
        this._inlineSection = section;
        this._showInlineQuestion();
    }

    _showInlineQuestion() {
        if (this._inlineQuizIdx >= this._inlineQuizFacts.length) {
            this._completeSection(this._inlineSection, this._inlineBonus);
            return;
        }

        const fact = this._inlineQuizFacts[this._inlineQuizIdx];
        const pageEl = document.getElementById('book-page-content');
        if (!pageEl) return;

        // Remove any previous inline quiz
        const prev = document.getElementById('book-inline-quiz');
        if (prev) prev.remove();

        let quizHtml = '';
        if (fact.type === 'tf') {
            quizHtml = `
                <div style="display:flex; gap:8px; margin-top:8px;">
                    <button class="btn btn-secondary book-inline-answer" data-answer="true" style="flex:1; font-size:0.75rem;">True</button>
                    <button class="btn btn-secondary book-inline-answer" data-answer="false" style="flex:1; font-size:0.75rem;">False</button>
                </div>
            `;
        } else {
            quizHtml = `
                <div style="margin-top:8px;">
                    <input type="text" id="book-inline-input" placeholder="Type your answer..."
                        style="width:100%; padding:8px 12px; font-size:0.8125rem; font-family:var(--font-main);
                        background:var(--bg-alt); border:1px solid var(--teal-border-strong); color:var(--text-heading);
                        border-radius:6px; outline:none;" autocomplete="off">
                    <button class="btn btn-primary" id="btn-inline-submit" style="width:100%; margin-top:6px; font-size:0.75rem;">Check</button>
                </div>
            `;
        }

        const inlineHtml = `
            <div id="book-inline-quiz" style="margin-top:16px; padding:14px; background:var(--teal-muted); border:1px solid var(--teal-border); border-radius:8px; animation:onboarding-fade 0.3s ease forwards;">
                <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--teal); margin-bottom:6px;">
                    Quick Check ${this._inlineQuizIdx + 1}/${this._inlineQuizFacts.length}
                </div>
                <div style="font-size:0.8125rem; color:var(--text-heading); margin-bottom:4px;">
                    ${fact.q}
                </div>
                ${quizHtml}
            </div>
        `;

        pageEl.insertAdjacentHTML('beforeend', inlineHtml);

        // Bind
        if (fact.type === 'tf') {
            document.querySelectorAll('.book-inline-answer').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const userAnswer = e.currentTarget.dataset.answer === 'true';
                    const correct = userAnswer === (fact.a.toLowerCase() === 'true');
                    this._handleInlineAnswer(correct, fact.a);
                });
            });
        } else {
            const input = document.getElementById('book-inline-input');
            const submit = () => {
                const userAnswer = (input?.value || '').trim().toLowerCase();
                const correctAnswer = fact.a.toLowerCase();
                const correct = userAnswer === correctAnswer ||
                    (correctAnswer.includes(userAnswer) && userAnswer.length >= 3) ||
                    (userAnswer.includes(correctAnswer));
                this._handleInlineAnswer(correct, fact.a);
            };
            document.getElementById('btn-inline-submit')?.addEventListener('click', submit);
            input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
            input?.focus();
        }
    }

    _handleInlineAnswer(correct, correctAnswer) {
        const quizEl = document.getElementById('book-inline-quiz');
        if (!quizEl) return;

        if (correct) {
            this._inlineBonus += 5;
            soundManager.play('xp');
            quizEl.innerHTML = `
                <div style="text-align:center; color:var(--teal); font-family:var(--font-mono); font-size:0.75rem; padding:8px 0;">
                    Correct! +5 bonus XP
                </div>
            `;
        } else {
            soundManager.play('click');
            quizEl.innerHTML = `
                <div style="text-align:center; padding:8px 0;">
                    <div style="color:var(--error); font-size:0.75rem; margin-bottom:4px;">Not quite</div>
                    <div style="color:var(--text-body); font-size:0.6875rem;">Answer: <strong style="color:var(--text-heading);">${correctAnswer}</strong></div>
                </div>
            `;
        }

        this.time.delayedCall(1200, () => {
            this._inlineQuizIdx++;
            this._showInlineQuestion();
        });
    }

    _completeSection(section, bonusXp = 0) {
        if (learningProgress.isCompleted(section.id)) return;

        const xp = (section.xpReward || 10) + bonusXp;
        const isNew = learningProgress.complete(this._topicKey, section.id, xp);

        if (isNew) {
            xpManager.award(xp, `Read: ${section.title}`);
            soundManager.play('xp');

            if (bonusXp > 0) {
                showToast('SECTION COMPLETE', `+${xp} XP (includes ${bonusXp} quiz bonus)`, 'success');
            }

            // Update the badge in current view
            const titleEl = document.querySelector('.book-page-title');
            if (titleEl && !titleEl.innerHTML.includes('book-complete-badge')) {
                titleEl.innerHTML = `<span class="book-complete-badge">&#x2713; Read</span> ${titleEl.innerHTML}`;
            }

            // Update the dot for current page
            const dot = document.querySelector(`.book-dot[data-page="${this._currentPage}"]`);
            if (dot) dot.style.background = 'var(--teal)';

            // Remove inline quiz if still showing
            const quiz = document.getElementById('book-inline-quiz');
            if (quiz) quiz.remove();

            // Check for first_read achievement
            if (learningProgress.totalCompleted === 1) {
                const achMgr = window.__nfSystems?.achievementManager;
                if (achMgr) achMgr.check('first_read');
            }

            // Check for all_extraction achievement
            if (this._topicKey === 'extraction') {
                const extractionTopic = getTopicByKey('extraction');
                if (extractionTopic && learningProgress.getTopicProgress('extraction') >= extractionTopic.sectionCount) {
                    const achMgr = window.__nfSystems?.achievementManager;
                    if (achMgr) achMgr.check('all_extraction');
                }
            }
        }
    }

    _bindNavigation() {
        this._bindBack();

        // Prev/Next buttons
        document.getElementById('btn-book-prev')?.addEventListener('click', () => {
            if (this._currentPage > 0) {
                soundManager.play('page-turn');
                this._currentPage--;
                if (this._markTimer) this._markTimer.remove();
                this._showPage();
            }
        });

        document.getElementById('btn-book-next')?.addEventListener('click', () => {
            if (this._currentPage < this._sections.length - 1) {
                soundManager.play('page-turn');
                this._currentPage++;
                if (this._markTimer) this._markTimer.remove();
                this._showPage();
            }
        });

        // Finish button (last page)
        document.getElementById('btn-book-finish')?.addEventListener('click', () => {
            soundManager.play('click');
            if (this._markTimer) this._markTimer.remove();
            this._goBack();
        });

        // Dot navigation
        document.querySelectorAll('.book-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                if (!isNaN(page) && page !== this._currentPage) {
                    soundManager.play('click');
                    this._currentPage = page;
                    if (this._markTimer) this._markTimer.remove();
                    this._showPage();
                }
            });
        });

        // Keyboard nav
        this._keyHandler = (e) => {
            if (e.key === 'ArrowLeft' && this._currentPage > 0) {
                soundManager.play('click');
                this._currentPage--;
                if (this._markTimer) this._markTimer.remove();
                this._showPage();
            } else if (e.key === 'ArrowRight' && this._currentPage < this._sections.length - 1) {
                soundManager.play('click');
                this._currentPage++;
                if (this._markTimer) this._markTimer.remove();
                this._showPage();
            }
        };
        this.input.keyboard.on('keydown', this._keyHandler);

        // Swipe support
        let startX = 0;
        const pageEl = document.getElementById('book-page-content');
        if (pageEl) {
            pageEl.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
            }, { passive: true });
            pageEl.addEventListener('touchend', (e) => {
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) > 50) {
                    if (dx < 0 && this._currentPage < this._sections.length - 1) {
                        soundManager.play('click');
                        this._currentPage++;
                        if (this._markTimer) this._markTimer.remove();
                        this._showPage();
                    } else if (dx > 0 && this._currentPage > 0) {
                        soundManager.play('click');
                        this._currentPage--;
                        if (this._markTimer) this._markTimer.remove();
                        this._showPage();
                    }
                }
            }, { passive: true });
        }
    }

    _bindBack() {
        document.getElementById('btn-book-back')?.addEventListener('click', () => {
            soundManager.play('click');
            if (this._markTimer) this._markTimer.remove();
            this._goBack();
        });
    }

    _goBack() {
        this._clearUI();
        if (this._keyHandler) {
            this.input.keyboard.off('keydown', this._keyHandler);
        }
        transitionTo(this, 'GardenScene');
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('book-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

}
