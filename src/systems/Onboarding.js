/**
 * Onboarding — Tracks whether the user has completed first-run onboarding.
 */

const STORAGE_KEY = 'pea_onboarding_done';

export const onboarding = {
    get hasCompleted() {
        try {
            return localStorage.getItem(STORAGE_KEY) === '1';
        } catch { return false; }
    },

    complete() {
        try {
            localStorage.setItem(STORAGE_KEY, '1');
        } catch { /* ignore */ }
    },

    shouldShow() {
        return !this.hasCompleted;
    },

    /** Reset for testing */
    reset() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch { /* ignore */ }
    }
};
