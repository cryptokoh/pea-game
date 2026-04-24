/**
 * AccessControl — Track and feature access management.
 * Determines what content a user can access based on role and login status.
 */

import { dataBridge } from './DataBridge.js';

class AccessControlManager {
    /**
     * Check if current user can access a track.
     * @param {'learning'|'courses'|'sales'} track
     * @returns {boolean}
     */
    canAccess(track) {
        switch (track) {
            case 'learning':
                return true; // Always public
            case 'courses':
                return true; // Catalog is public, enrollment may need login
            case 'sales':
                return this._isRep();
            default:
                return false;
        }
    }

    /**
     * Check if a feature requires login to use.
     * @param {string} feature
     * @returns {boolean}
     */
    requiresLogin(feature) {
        const loginRequired = [
            'earn_coupon', 'enter_lottery', 'save_progress',
            'enroll_course', 'leaderboard_submit', 'sync_data'
        ];
        return loginRequired.includes(feature);
    }

    /**
     * Check if a feature requires login and user is NOT logged in.
     * Returns true when access should be blocked with a login prompt.
     */
    shouldPromptLogin(feature) {
        return this.requiresLogin(feature) && !dataBridge.isAuthenticated;
    }

    /** Current player role or 'guest' */
    get role() {
        if (!dataBridge.isAuthenticated) return 'guest';
        return dataBridge._player?.role || 'learner';
    }

    get isLoggedIn() {
        return dataBridge.isAuthenticated;
    }

    _isRep() {
        return this.role === 'rep' || this.role === 'admin';
    }

    _isAdmin() {
        return this.role === 'admin';
    }
}

export const accessControl = new AccessControlManager();
