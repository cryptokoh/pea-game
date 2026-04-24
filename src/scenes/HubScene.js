/**
 * HubScene — Central track selector with 3 portal cards.
 * Learning (public), Courses (free+paid), Sales (rep-only).
 * Botanical theme by default with warm particle drift.
 */

import { Scene, Math as PMath } from 'phaser';
import { xpManager } from '../systems/XPManager.js';
import { settings } from '../systems/Settings.js';
import { accessControl } from '../systems/AccessControl.js';
import { soundManager } from '../systems/SoundManager.js';
import { transitionTo, createAmbientParticles } from '../systems/Transitions.js';

export class HubScene extends Scene {
    constructor() {
        super({ key: 'HubScene' });
    }

    create() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.cameras.main.fadeIn(300, 18, 24, 26);
        this.add.rectangle(w / 2, h / 2, w, h, 0x1a1612);

        // Ambient floating particles
        createAmbientParticles(this, w, h);

        this._showHub();
        this._updateNavBar('hub');
    }

    _showHub() {
        this._clearUI();
        const player = xpManager.player;
        const showSales = accessControl.canAccess('sales');

        const html = `
            <div class="scene-panel" id="hub-panel" style="padding-bottom:80px;">
                <div style="text-align:center; margin-bottom:8px;">
                    <h2 class="scene-heading" style="font-size:1.375rem;">
                        Pure Extracts Adventures
                    </h2>
                    <p class="scene-subheading" style="font-size:0.8125rem;">
                        Choose your path to botanical wisdom
                    </p>
                </div>

                <div class="hub-portals">
                    <!-- Learning Portal -->
                    <div class="hub-portal learning" data-portal="learning">
                        <span class="hub-portal-icon">&#x1F33F;</span>
                        <div class="hub-portal-title">Learning Garden</div>
                        <div class="hub-portal-desc">
                            Explore botanical knowledge through immersive books, flash challenges, and interactive labs.
                        </div>
                        <span class="hub-portal-badge">Explore Free</span>
                    </div>

                    <!-- Courses Portal -->
                    <div class="hub-portal courses" data-portal="courses">
                        <span class="hub-portal-icon">&#x1F4D6;</span>
                        <div class="hub-portal-title">Courses</div>
                        <div class="hub-portal-desc">
                            Structured learning paths from beginner botanicals to advanced extraction science.
                        </div>
                        <span class="hub-portal-badge">Free &amp; Premium</span>
                    </div>

                    ${showSales ? `
                    <!-- Sales Portal (rep only) -->
                    <div class="hub-portal sales" data-portal="sales">
                        <span class="hub-portal-icon">&#x1F5FA;</span>
                        <div class="hub-portal-title">Sales Territory</div>
                        <div class="hub-portal-desc">
                            Austin location quests, pitch simulations, and real-world sales training.
                        </div>
                        <span class="hub-portal-badge">Rep Access</span>
                    </div>
                    ` : ''}
                </div>

                <!-- Rewards link -->
                <div style="text-align:center; margin-top:16px;">
                    <button class="btn btn-secondary" id="hub-rewards-btn" style="font-size:0.6875rem;">
                        &#x1F3C6; View Rewards &amp; Milestones
                    </button>
                </div>

                <!-- Aggregate stats -->
                <div class="stat-grid" style="grid-template-columns:repeat(3, 1fr); max-width:400px; margin:24px auto 0;">
                    <div class="stat-box">
                        <div class="stat-value">${player.totalXp}</div>
                        <div class="stat-label">Total XP</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${player.level}</div>
                        <div class="stat-label">Level</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${player.currentStreak}</div>
                        <div class="stat-label">Streak</div>
                    </div>
                </div>

                ${!accessControl.isLoggedIn ? `
                <div style="text-align:center; margin-top:20px; padding:12px; background:var(--teal-muted); border:1px solid var(--teal-border); border-radius:8px; max-width:400px; margin-left:auto; margin-right:auto;">
                    <div style="font-size:0.75rem; color:var(--text-body); margin-bottom:6px;">
                        Sign in to sync progress, earn rewards, and unlock discounts
                    </div>
                    <button class="btn btn-secondary" id="hub-login-btn" style="font-size:0.625rem;">
                        Log In / Sign Up
                    </button>
                </div>
                ` : ''}
            </div>
        `;

        this._injectHTML(html);

        // Portal click handlers
        document.querySelectorAll('.hub-portal').forEach(portal => {
            portal.addEventListener('click', (e) => {
                const target = e.currentTarget.dataset.portal;
                soundManager.play('click');
                this._navigateToPortal(target);
            });
        });

        // Rewards button
        document.getElementById('hub-rewards-btn')?.addEventListener('click', () => {
            soundManager.play('click');
            this._clearUI();
            transitionTo(this, 'RewardsScene');
        });

        // Login button
        document.getElementById('hub-login-btn')?.addEventListener('click', () => {
            this._clearUI();
            transitionTo(this, 'LoginScene');
        });
    }

    _navigateToPortal(portal) {
        this._clearUI();
        switch (portal) {
            case 'learning':
                transitionTo(this, 'GardenScene', {}, 'slide-left');
                break;
            case 'courses':
                transitionTo(this, 'CourseScene', {}, 'slide-left');
                break;
            case 'sales':
                transitionTo(this, 'AustinMapScene', {}, 'slide-left');
                break;
        }
    }

    _updateNavBar(active) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === active);
        });
    }

    _clearUI() {
        const existing = document.getElementById('hub-panel');
        if (existing) existing.remove();
    }

    _injectHTML(html) {
        const overlay = document.getElementById('ui-overlay');
        overlay.insertAdjacentHTML('beforeend', html);
    }

}
