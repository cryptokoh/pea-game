/**
 * LibraryScene — The Ancient Wisdom Library
 * A knowledge hub where reps learn about plants, science, healing, and sales.
 * Reading articles awards XP. Features search, category filters, and retro terminal aesthetic.
 */

import { Scene, Math as PMath } from 'phaser';
import { LIBRARY_CATEGORIES, getArticlesByCategory, getArticleById, searchArticles } from '../config/library-articles.js';
import { xpManager } from '../systems/XPManager.js';
import { settings } from '../systems/Settings.js';
import { achievementManager } from '../systems/Achievements.js';
import { soundManager } from '../systems/SoundManager.js';
import { dailyQuests } from '../systems/DailyQuests.js';

const READ_STORAGE_KEY = 'nf_sq_library_read';

export class LibraryScene extends Scene {
    constructor() {
        super({ key: 'LibraryScene' });
    }

    init() {
        this._currentCategory = 'all';
        this._searchQuery = '';
        this._readArticles = this._loadRead();
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x12181a);

        // Ambient particles
        if (settings.preset.particles) {
            this._ambientParticles(w, h);
        }

        // Background matrix-style falling characters
        if (settings.preset.animatedBg) {
            this._matrixRain(w, h);
        }

        this._showLibrary();
        this._updateNavBar('library');
    }

    _showLibrary() {
        this._clearUI();
        const articles = this._searchQuery
            ? searchArticles(this._searchQuery)
            : getArticlesByCategory(this._currentCategory);

        const readCount = this._readArticles.length;
        const totalArticles = getArticlesByCategory('all').length;
        const totalXpEarned = this._readArticles.reduce((sum, id) => {
            const art = getArticleById(id);
            return sum + (art?.xpReward || 0);
        }, 0);

        const html = `
            <div class="scene-panel" id="library-panel" style="padding-bottom:80px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
                    <div>
                        <h2 class="scene-heading glitch-text" style="font-family:var(--font-mono); letter-spacing:0.02em;">
                            // ANCIENT WISDOM LIBRARY
                        </h2>
                        <p class="scene-subheading" style="font-family:var(--font-mono); font-size:0.6875rem;">
                            Knowledge is power. Read articles to earn XP and level up your pitch game.
                        </p>
                    </div>
                </div>

                <!-- Stats row -->
                <div class="stat-grid" style="grid-template-columns:repeat(3, 1fr); margin-bottom:16px;">
                    <div class="stat-box">
                        <div class="stat-value">${readCount}</div>
                        <div class="stat-label">Articles Read</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${totalArticles}</div>
                        <div class="stat-label">Total Available</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">+${totalXpEarned}</div>
                        <div class="stat-label">XP Earned</div>
                    </div>
                </div>

                <!-- Search -->
                <div class="search-bar">
                    <input type="text" class="search-input" id="library-search"
                        placeholder="search articles..." value="${this._searchQuery}">
                </div>

                <!-- Category filters -->
                <div class="library-filters" id="library-filters">
                    ${LIBRARY_CATEGORIES.map(cat => `
                        <button class="library-filter ${cat.id === this._currentCategory ? 'active' : ''}"
                            data-category="${cat.id}">${cat.label}</button>
                    `).join('')}
                </div>

                <!-- Article grid -->
                <div class="library-grid" id="library-grid">
                    ${articles.map(article => {
                        const isRead = this._readArticles.includes(article.id);
                        return `
                            <div class="library-card pixel-corners ${isRead ? 'read' : ''}" data-article="${article.id}">
                                <div class="library-card-category">${article.category}</div>
                                <div class="library-card-title">${article.title}</div>
                                <div class="library-card-excerpt">${article.excerpt}</div>
                                <div class="library-card-meta">
                                    <span>${article.readTime}</span>
                                    <span class="library-card-xp">${isRead ? 'COMPLETED' : `+${article.xpReward} XP`}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                ${articles.length === 0 ? `
                    <div style="text-align:center; padding:40px 0; color:var(--text-muted); font-family:var(--font-mono); font-size:0.75rem;">
                        No articles found. Try a different search or category.
                    </div>
                ` : ''}
            </div>
        `;

        this._injectHTML(html);

        // Search handler
        const searchInput = document.getElementById('library-search');
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this._searchQuery = e.target.value.trim();
                if (this._searchQuery) this._currentCategory = 'all';
                this._showLibrary();
            }, 300);
        });

        // Category filter handlers
        document.querySelectorAll('.library-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this._currentCategory = e.target.dataset.category;
                this._searchQuery = '';
                this._showLibrary();
            });
        });

        // Article card handlers
        document.querySelectorAll('.library-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.article;
                this._showArticle(id);
            });
        });
    }

    _showArticle(articleId) {
        this._clearUI();
        const article = getArticleById(articleId);
        if (!article) return this._showLibrary();

        const isRead = this._readArticles.includes(articleId);

        const html = `
            <div class="scene-panel" id="library-panel" style="padding-bottom:80px;">
                <button class="scene-back" id="btn-back-library">&larr; BACK TO LIBRARY</button>

                <div class="library-detail">
                    <div class="section-header">${article.category}</div>
                    <h2 class="scene-heading" style="margin-bottom:2px;">${article.title}</h2>
                    <div style="display:flex; gap:12px; align-items:center; margin-bottom:16px;">
                        <span style="font-family:var(--font-mono); font-size:0.625rem; color:var(--text-muted);">${article.readTime}</span>
                        ${isRead
                            ? '<span style="font-family:var(--font-mono); font-size:0.625rem; color:var(--teal);">COMPLETED</span>'
                            : `<span style="font-family:var(--font-mono); font-size:0.625rem; color:var(--teal);">+${article.xpReward} XP on completion</span>`
                        }
                    </div>

                    <div class="library-detail-body">
                        ${article.body}
                    </div>

                    <div style="text-align:center; padding:20px 0; border-top:1px solid var(--teal-border); margin-top:16px;">
                        ${isRead ? `
                            <div style="color:var(--teal); font-family:var(--font-mono); font-size:0.75rem; margin-bottom:8px;">
                                ARTICLE COMPLETED
                            </div>
                            <button class="btn btn-secondary" id="btn-back-lib2">Back to Library</button>
                        ` : `
                            <button class="btn btn-primary" id="btn-complete-article" style="min-width:200px;">
                                MARK AS READ &mdash; EARN +${article.xpReward} XP
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;

        this._injectHTML(html);

        document.getElementById('btn-back-library')?.addEventListener('click', () => this._showLibrary());
        document.getElementById('btn-back-lib2')?.addEventListener('click', () => this._showLibrary());
        document.getElementById('btn-complete-article')?.addEventListener('click', () => {
            this._markRead(articleId);
            xpManager.award(article.xpReward, `Read: ${article.title}`);
            soundManager.play('xp');
            // Check library reading achievement + daily quest
            achievementManager.checkLibraryReads();
            dailyQuests.markCompleted('read_article');
            this._showArticle(articleId); // Refresh to show completed state
        });
    }

    // ── Read tracking ──
    _loadRead() {
        try {
            const saved = localStorage.getItem(READ_STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    }

    _markRead(articleId) {
        if (!this._readArticles.includes(articleId)) {
            this._readArticles.push(articleId);
            try {
                localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(this._readArticles));
            } catch { /* ignore */ }
        }
    }

    // ── Nav bar active state ──
    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    // ── Helpers ──
    _clearUI() {
        const existing = document.getElementById('library-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

    _ambientParticles(w, h) {
        const count = settings.preset.maxParticles;
        if (count <= 0) return;

        this.add.particles(w / 2, h / 2, 'particle-star', {
            x: { min: 0, max: w },
            y: { min: 0, max: h },
            speed: { min: 2, max: 8 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.1, end: 0 },
            lifespan: 4000,
            frequency: 3000 / Math.max(count, 1),
            quantity: 1,
            blendMode: 'ADD'
        });
    }

    _matrixRain(w, h) {
        // Create slowly falling code-like characters using Phaser text
        const chars = '01アイウエオカキクケコサシスセソ';
        const columns = Math.floor(w / 30);

        for (let i = 0; i < Math.min(columns, 15); i++) {
            const x = PMath.Between(0, w);
            const char = chars[PMath.Between(0, chars.length - 1)];
            const text = this.add.text(x, -20, char, {
                fontFamily: 'JetBrains Mono', fontSize: '10px',
                color: '#50e8c0', alpha: 0.06
            });

            this.tweens.add({
                targets: text,
                y: h + 20,
                duration: PMath.Between(8000, 15000),
                repeat: -1,
                delay: PMath.Between(0, 5000),
                onRepeat: () => {
                    text.x = PMath.Between(0, w);
                    text.setText(chars[PMath.Between(0, chars.length - 1)]);
                }
            });
        }
    }
}
