/**
 * CourseScene — Structured course catalog + inline lesson viewer.
 * Free courses open inline referencing BookScene content.
 * Paid courses show "Coming Soon" badge.
 */

import { Scene } from 'phaser';
import { settings } from '../systems/Settings.js';
import { soundManager } from '../systems/SoundManager.js';
import { xpManager, showToast } from '../systems/XPManager.js';
import { dataBridge } from '../systems/DataBridge.js';
import { accessControl } from '../systems/AccessControl.js';
import { learningProgress } from '../systems/LearningProgress.js';
import { loadTopicSections } from '../config/topics/index.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

const COURSES = [
    {
        id: 'beginner-botanicals',
        title: 'Beginner Botanicals',
        description: 'Start your journey into plant science with foundational growing and effects knowledge.',
        icon: '\u{1F331}',
        access: 'free',
        sections: [
            'growing-trees-living', 'growing-bushes-living', 'growing-herbs-living',
            'effects-blue-lotus', 'effects-kanna', 'effects-kava'
        ],
        xpReward: 200,
        badge: 'course_beginner'
    },
    {
        id: 'extraction-fundamentals',
        title: 'Extraction Fundamentals',
        description: 'Learn solventless, water, and ethanol extraction methods from the ground up.',
        icon: '\u{1F9EA}',
        access: 'free',
        sections: [
            'extraction-solventless', 'extraction-water', 'extraction-ethanol',
            'extraction-carrier-delivery'
        ],
        xpReward: 150,
        badge: 'course_extraction'
    },
    {
        id: 'advanced-extraction',
        title: 'Advanced Extraction Science',
        description: 'CO2, chromatography, distillation, and crystallization techniques for serious practitioners.',
        icon: '\u{2697}',
        access: 'coming_soon',
        sections: [
            'extraction-co2', 'extraction-chromatography', 'extraction-distillation',
            'extraction-crystallization'
        ],
        xpReward: 300,
        badge: 'course_advanced_extraction'
    },
    {
        id: 'business-operations',
        title: 'Botanical Business Operations',
        description: 'Infrastructure, compliance, and supply chain management for botanical entrepreneurs.',
        icon: '\u{1F3D7}',
        access: 'coming_soon',
        sections: [],
        xpReward: 250,
        badge: 'course_business'
    }
];

export class CourseScene extends Scene {
    constructor() {
        super({ key: 'CourseScene' });
        this._view = 'catalog'; // 'catalog' or 'course'
        this._activeCourse = null;
        this._courseSections = [];
        this._courseProgress = {};
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        createAmbientParticles(this, w, h);

        this._updateNavBar('hub');
        this._view = 'catalog';
        this._loadCourseProgress();
        this._showCatalog();
    }

    _loadCourseProgress() {
        // Build local progress map from learningProgress
        this._courseProgress = {};
        for (const course of COURSES) {
            const completed = course.sections.filter(sid => learningProgress.isCompleted(sid));
            this._courseProgress[course.id] = {
                completed: completed.length,
                total: course.sections.length,
                done: course.sections.length > 0 && completed.length >= course.sections.length
            };
        }
    }

    _showCatalog() {
        this._clearUI();
        this._view = 'catalog';

        const html = `
            <div class="scene-panel" id="course-panel" style="padding-bottom:80px;">
                <!-- Header -->
                <div class="book-header">
                    <button class="book-back" id="btn-course-back">&larr; Hub</button>
                    <div class="book-topic-title">&#x1F4DA; Courses</div>
                </div>

                <p style="font-size:0.75rem; color:var(--text-body); margin-bottom:16px;">
                    Structured learning paths that guide you through botanical knowledge step by step.
                </p>

                <div class="course-grid">
                    ${COURSES.map(course => {
                        const progress = this._courseProgress[course.id] || { completed: 0, total: 0, done: false };
                        const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
                        const isAvailable = course.access === 'free';
                        const isComingSoon = course.access === 'coming_soon';

                        return `
                            <div class="course-card ${isComingSoon ? 'coming-soon' : ''}" data-course="${course.id}">
                                <div class="course-card-header">
                                    <span style="font-size:1.25rem;">${course.icon}</span>
                                    ${isComingSoon
                                        ? '<span class="course-badge coming-soon">Coming Soon</span>'
                                        : progress.done
                                            ? '<span class="course-badge completed">&#x2713; Complete</span>'
                                            : isAvailable
                                                ? '<span class="course-badge free">Free</span>'
                                                : ''
                                    }
                                </div>
                                <div class="course-card-title">${course.title}</div>
                                <div class="course-card-desc">${course.description}</div>
                                ${isAvailable && !progress.done ? `
                                    <div style="margin-top:8px;">
                                        <div class="xp-bar-wrap" style="height:3px;">
                                            <div class="xp-bar-fill" style="width:${pct}%"></div>
                                        </div>
                                        <div style="display:flex; justify-content:space-between; margin-top:3px;">
                                            <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">
                                                ${progress.completed}/${progress.total} sections
                                            </span>
                                            <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">
                                                +${course.xpReward} XP on completion
                                            </span>
                                        </div>
                                    </div>
                                ` : ''}
                                ${progress.done ? `
                                    <div style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--teal); margin-top:8px;">
                                        +${course.xpReward} XP earned
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        this._injectHTML(html);

        // Bind
        document.getElementById('btn-course-back')?.addEventListener('click', () => {
            soundManager.play('click');
            this._goBack();
        });

        document.querySelectorAll('.course-card:not(.coming-soon)').forEach(card => {
            card.addEventListener('click', (e) => {
                const courseId = e.currentTarget.dataset.course;
                const course = COURSES.find(c => c.id === courseId);
                if (course && course.access === 'free') {
                    soundManager.play('click');
                    this._openCourse(course);
                }
            });
        });
    }

    async _openCourse(course) {
        this._clearUI();
        this._view = 'course';
        this._activeCourse = course;

        // Show loading
        this._injectHTML(`
            <div class="scene-panel" id="course-panel" style="padding-bottom:80px;">
                <div style="text-align:center; padding:60px 0;">
                    <div style="font-size:1.5rem; margin-bottom:8px;">${course.icon}</div>
                    <div style="font-family:var(--font-mono); font-size:0.6875rem; color:var(--text-muted);">
                        Loading course...
                    </div>
                </div>
            </div>
        `);

        // Load all referenced sections
        try {
            const allSections = [];
            const topicKeys = [...new Set(course.sections.map(sid => sid.split('-')[0]))];

            for (const topicKey of topicKeys) {
                const sections = await loadTopicSections(topicKey);
                sections.forEach(s => allSections.push(s));
            }

            // Filter to only course sections, in course order
            this._courseSections = course.sections
                .map(sid => allSections.find(s => s.id === sid))
                .filter(Boolean);

            this._showCourseDetail();
        } catch (err) {
            console.error('Failed to load course sections:', err);
            this._clearUI();
            this._showCatalog();
        }
    }

    _showCourseDetail() {
        this._clearUI();
        const course = this._activeCourse;
        const progress = this._courseProgress[course.id] || { completed: 0, total: 0, done: false };

        const html = `
            <div class="scene-panel" id="course-panel" style="padding-bottom:80px;">
                <!-- Header -->
                <div class="book-header">
                    <button class="book-back" id="btn-course-catalog">&larr; Courses</button>
                    <div class="book-topic-title">${course.icon} ${course.title}</div>
                </div>

                <p style="font-size:0.75rem; color:var(--text-body); margin-bottom:12px;">
                    ${course.description}
                </p>

                <!-- Progress -->
                <div style="margin-bottom:16px;">
                    <div class="xp-bar-wrap" style="height:4px;">
                        <div class="xp-bar-fill" style="width:${progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:4px;">
                        <span style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--text-muted);">
                            ${progress.completed} of ${progress.total} completed
                        </span>
                        <span style="font-family:var(--font-mono); font-size:0.5625rem; color:var(--teal);">
                            +${course.xpReward} XP on completion
                        </span>
                    </div>
                </div>

                <!-- Section list -->
                <div class="course-section-list">
                    ${this._courseSections.map((section, i) => {
                        const completed = learningProgress.isCompleted(section.id);
                        return `
                            <div class="course-section-item ${completed ? 'completed' : ''}" data-section-idx="${i}">
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <span style="font-family:var(--font-mono); font-size:0.625rem; color:${completed ? 'var(--teal)' : 'var(--text-muted)'}; min-width:20px;">
                                        ${completed ? '&#x2713;' : `${i + 1}.`}
                                    </span>
                                    <span style="font-size:0.75rem; color:${completed ? 'var(--text-heading)' : 'var(--text-body)'};">
                                        ${section.title}
                                    </span>
                                </div>
                                <span style="font-family:var(--font-mono); font-size:0.5rem; color:var(--text-muted);">
                                    ${section.readTime || '3 min'} &bull; +${section.xpReward || 10} XP
                                </span>
                            </div>
                        `;
                    }).join('')}
                </div>

                ${progress.done ? `
                    <div style="text-align:center; padding:16px; margin-top:12px; background:var(--teal-muted); border:1px solid var(--teal-border); border-radius:8px;">
                        <div style="font-family:var(--font-mono); font-size:0.875rem; color:var(--teal); margin-bottom:4px;">
                            &#x1F3C6; Course Complete!
                        </div>
                        <div style="font-size:0.625rem; color:var(--text-body);">
                            You earned +${course.xpReward} bonus XP for completing this course.
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        this._injectHTML(html);

        // Bind
        document.getElementById('btn-course-catalog')?.addEventListener('click', () => {
            soundManager.play('click');
            this._loadCourseProgress();
            this._showCatalog();
        });

        // Section click opens BookScene for the topic
        document.querySelectorAll('.course-section-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.sectionIdx);
                const section = this._courseSections[idx];
                if (section) {
                    soundManager.play('click');
                    const topicKey = section.id.split('-')[0];
                    this._clearUI();
                    transitionTo(this, 'BookScene', { topicKey }, 'slide-left');
                }
            });
        });
    }

    _goBack() {
        this._clearUI();
        transitionTo(this, 'HubScene');
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('course-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

}
