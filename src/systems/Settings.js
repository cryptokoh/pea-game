/**
 * Quality Settings Manager
 * Low / Medium / High graphics with persistent localStorage.
 */

const DEFAULTS = {
    quality: 'medium', // low | medium | high
    theme: 'botanical', // botanical | lab
    particles: true,
    glow: true,
    animatedBg: true,
    screenShake: true,
    soundEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 0.7
};

const QUALITY_PRESETS = {
    low: {
        particles: false,
        glow: false,
        animatedBg: false,
        screenShake: false,
        maxParticles: 0,
        filterQuality: 0,
        bgStars: 0,
        ambientAnimations: false,
        tileAnimations: false
    },
    medium: {
        particles: true,
        glow: true,
        animatedBg: true,
        screenShake: true,
        maxParticles: 50,
        filterQuality: 1,
        bgStars: 30,
        ambientAnimations: true,
        tileAnimations: false
    },
    high: {
        particles: true,
        glow: true,
        animatedBg: true,
        screenShake: true,
        maxParticles: 200,
        filterQuality: 2,
        bgStars: 80,
        ambientAnimations: true,
        tileAnimations: true
    }
};

class SettingsManager {
    constructor() {
        this._settings = { ...DEFAULTS };
        this._load();
    }

    _load() {
        try {
            const saved = localStorage.getItem('nf_sq_settings');
            if (saved) {
                Object.assign(this._settings, JSON.parse(saved));
            }
        } catch { /* ignore */ }
    }

    _save() {
        try {
            localStorage.setItem('nf_sq_settings', JSON.stringify(this._settings));
        } catch { /* ignore */ }
    }

    get(key) {
        return this._settings[key];
    }

    set(key, value) {
        this._settings[key] = value;
        this._save();
    }

    get quality() {
        return this._settings.quality;
    }

    /** Returns merged quality preset + user overrides */
    get preset() {
        return QUALITY_PRESETS[this._settings.quality] || QUALITY_PRESETS.medium;
    }

    setQuality(level) {
        this._settings.quality = level;
        const preset = QUALITY_PRESETS[level];
        if (preset) {
            Object.assign(this._settings, preset);
        }
        this._save();
        window.dispatchEvent(new CustomEvent('settings-changed', { detail: this._settings }));
    }

    get all() {
        return { ...this._settings };
    }

    get theme() {
        return this._settings.theme || 'botanical';
    }

    setTheme(theme) {
        this._settings.theme = theme;
        this._save();
        this.applyTheme();
        window.dispatchEvent(new CustomEvent('settings-changed', { detail: this._settings }));
    }

    /** Apply the current theme to the document body */
    applyTheme() {
        document.body.setAttribute('data-theme', this.theme);
    }
}

export const settings = new SettingsManager();
