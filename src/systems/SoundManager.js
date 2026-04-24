/**
 * SoundManager — Procedural Web Audio API sound effects.
 * No audio files needed. Generates all sounds with oscillators and gain nodes.
 * Respects browser autoplay policy by creating AudioContext on first interaction.
 */

const MUTED_KEY = 'nf_sq_muted';
const VOLUME_KEY = 'nf_sq_volume';

class SoundManager {
    constructor() {
        this._ctx = null;
        this._masterGain = null;
        this._muted = false;
        this._volume = 0.7;
        this._load();
    }

    _load() {
        try {
            const muted = localStorage.getItem(MUTED_KEY);
            if (muted !== null) this._muted = muted === 'true';
            const vol = localStorage.getItem(VOLUME_KEY);
            if (vol !== null) this._volume = parseFloat(vol);
        } catch { /* ignore */ }
    }

    _save() {
        try {
            localStorage.setItem(MUTED_KEY, String(this._muted));
            localStorage.setItem(VOLUME_KEY, String(this._volume));
        } catch { /* ignore */ }
    }

    /** Lazily create AudioContext on first user-triggered play */
    _ensureContext() {
        if (this._ctx) return true;
        try {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
            this._masterGain = this._ctx.createGain();
            this._masterGain.gain.value = this._muted ? 0 : this._volume;
            this._masterGain.connect(this._ctx.destination);
            return true;
        } catch {
            return false;
        }
    }

    /** Resume suspended context (required after tab switch, etc.) */
    _resume() {
        if (this._ctx && this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
    }

    get isMuted() { return this._muted; }

    set isMuted(val) {
        this._muted = !!val;
        if (this._masterGain) {
            this._masterGain.gain.setTargetAtTime(
                this._muted ? 0 : this._volume,
                this._ctx.currentTime,
                0.02
            );
        }
        this._save();
    }

    setVolume(v) {
        this._volume = Math.max(0, Math.min(1, v));
        if (this._masterGain && !this._muted) {
            this._masterGain.gain.setTargetAtTime(
                this._volume,
                this._ctx.currentTime,
                0.02
            );
        }
        this._save();
    }

    /**
     * Play a named procedural sound.
     * Valid names: xp, levelup, correct, wrong, achievement, click, transition, typing, page-turn, timer-tick
     */
    play(name) {
        if (this._muted) return;
        if (!this._ensureContext()) return;
        this._resume();

        const fn = this._sounds[name];
        if (fn) fn.call(this);
    }

    // ── Sound generators ──

    get _sounds() {
        return {
            xp: this._xp,
            levelup: this._levelup,
            correct: this._correct,
            wrong: this._wrong,
            achievement: this._achievement,
            click: this._click,
            transition: this._transition,
            typing: this._typing,
            'page-turn': this._pageTurn,
            'timer-tick': this._timerTick
        };
    }

    /** Quick ascending blip — short positive feedback */
    _xp() {
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.linearRampToValueAtTime(900, t + 0.08);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.12);
    }

    /** Triumphant ascending arpeggio — 4 notes */
    _levelup() {
        const t = this._ctx.currentTime;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        const noteLen = 0.1;

        notes.forEach((freq, i) => {
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + i * noteLen);

            const start = t + i * noteLen;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.25, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, start + noteLen + 0.1);

            osc.connect(gain);
            gain.connect(this._masterGain);
            osc.start(start);
            osc.stop(start + noteLen + 0.12);
        });
    }

    /** Happy ping — high note, positive */
    _correct() {
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.2);
    }

    /** Descending buzz — low, negative */
    _wrong() {
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(150, t + 0.25);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.3);
    }

    /** Fanfare flourish — ascending scale, celebratory */
    _achievement() {
        const t = this._ctx.currentTime;
        const notes = [523, 659, 784, 988, 1047, 1319]; // C5 E5 G5 B5 C6 E6
        const spacing = 0.07;

        notes.forEach((freq, i) => {
            const osc = this._ctx.createOscillator();
            const gain = this._ctx.createGain();

            osc.type = i < 4 ? 'sine' : 'square';
            osc.frequency.setValueAtTime(freq, t + i * spacing);

            const start = t + i * spacing;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(i === notes.length - 1 ? 0.2 : 0.15, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2 + (i === notes.length - 1 ? 0.3 : 0));

            osc.connect(gain);
            gain.connect(this._masterGain);
            osc.start(start);
            osc.stop(start + 0.5);
        });
    }

    /** Subtle tick — very short click */
    _click() {
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    /** Swoosh — noise with filter sweep for scene transitions */
    _transition() {
        const t = this._ctx.currentTime;
        const bufferSize = this._ctx.sampleRate * 0.3;
        const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const noise = this._ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this._ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(3000, t + 0.15);
        filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);
        filter.Q.value = 2;

        const gain = this._ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this._masterGain);
        noise.start(t);
        noise.stop(t + 0.3);
    }

    /** Soft keyboard click — very subtle typing feedback */
    _typing() {
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        // Slight randomness to feel natural
        osc.frequency.setValueAtTime(800 + Math.random() * 400, t);

        gain.gain.setValueAtTime(0.04, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.04);
    }

    /** Soft whoosh — filtered noise burst for page turns */
    _pageTurn() {
        const t = this._ctx.currentTime;
        const bufferSize = this._ctx.sampleRate * 0.15;
        const buffer = this._ctx.createBuffer(1, bufferSize, this._ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.3;
        }

        const noise = this._ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this._ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(4000, t + 0.08);
        filter.frequency.exponentialRampToValueAtTime(1000, t + 0.15);
        filter.Q.value = 1;

        const gain = this._ctx.createGain();
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this._masterGain);
        noise.start(t);
        noise.stop(t + 0.15);
    }

    /** Quick tick — short high-freq blip for timer warnings */
    _timerTick() {
        const t = this._ctx.currentTime;
        const osc = this._ctx.createOscillator();
        const gain = this._ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, t);

        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this._masterGain);
        osc.start(t);
        osc.stop(t + 0.05);
    }
}

export const soundManager = new SoundManager();
