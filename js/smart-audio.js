'use strict';

window.SmartAudio = {
  crossfadeDuration: 0,
  isCrossfadeEnabled: false,
  crossfadeInterval: null,
  fadeInInterval: null,

  initCrossfade(audioEl) {
    if (!audioEl) return;

 
    try {
      const stored = localStorage.getItem('wave_settings');
      if (stored) {
        const s = JSON.parse(stored);
        if (s && s.crossfade !== undefined) {
          const cf = parseInt(s.crossfade, 10) || 0;
          this.crossfadeDuration = cf;
          this.isCrossfadeEnabled = (cf > 0);
        }
      }
    } catch (e) {}

    audioEl.addEventListener('timeupdate', () => {
      if (!this.isCrossfadeEnabled || !this.crossfadeDuration || this.crossfadeDuration <= 0) {
        delete audioEl.dataset.crossfading;
        return;
      }
      if (!audioEl.duration || audioEl.duration <= (this.crossfadeDuration * 2)) return;

      const timeRemaining = audioEl.duration - audioEl.currentTime;

      
      if (timeRemaining <= this.crossfadeDuration && timeRemaining > 0.3) {
        if (!audioEl.dataset.crossfading) {
          audioEl.dataset.crossfading = 'true';
          this.fadeVolume(audioEl, audioEl.volume, 0, timeRemaining * 1000);
        }
      } else if (timeRemaining > this.crossfadeDuration + 1) {
  
        if (audioEl.dataset.crossfading) {
          delete audioEl.dataset.crossfading;
          this.restoreUserVolume(audioEl);
        }
      }
    });

    audioEl.addEventListener('play', () => {
      
      this.onTrackStart(audioEl);
    });

    audioEl.addEventListener('ended', () => {
      this.clearFadeIntervals();
      delete audioEl.dataset.crossfading;
      this.restoreUserVolume(audioEl);
    });
  },

  clearFadeIntervals() {
    if (this.crossfadeInterval) {
      clearInterval(this.crossfadeInterval);
      this.crossfadeInterval = null;
    }
    if (this.fadeInInterval) {
      clearInterval(this.fadeInInterval);
      this.fadeInInterval = null;
    }
  },

  restoreUserVolume(audioEl) {
    if (!audioEl) return;
    this.clearFadeIntervals();
    if (typeof state !== 'undefined' && state.isMuted) {
      audioEl.volume = 0;
      return;
    }
    const targetVol = (typeof state !== 'undefined' && state.lastVolume !== undefined)
      ? Math.max(0, Math.min(1, state.lastVolume / 100))
      : 0.7;
    audioEl.volume = targetVol;
  },

  onTrackStart(audioEl) {
    if (!audioEl) return;
    this.clearFadeIntervals();
    delete audioEl.dataset.crossfading;

    if (typeof state !== 'undefined' && state.isMuted) {
      audioEl.volume = 0;
      return;
    }

    const targetVol = (typeof state !== 'undefined' && state.lastVolume !== undefined)
      ? Math.max(0, Math.min(1, state.lastVolume / 100))
      : 0.7;

    if (this.isCrossfadeEnabled && this.crossfadeDuration > 0) {
     
      audioEl.volume = 0;
      const durationMs = Math.min(1500, this.crossfadeDuration * 400);
      const steps = 15;
      const stepTime = Math.max(20, Math.floor(durationMs / steps));
      let currentStep = 0;
      this.fadeInInterval = setInterval(() => {
        currentStep++;
        const newVol = Math.max(0, Math.min(targetVol, targetVol * (currentStep / steps)));
        audioEl.volume = newVol;
        if (currentStep >= steps) {
          audioEl.volume = targetVol;
          clearInterval(this.fadeInInterval);
          this.fadeInInterval = null;
        }
      }, stepTime);
    } else {
      audioEl.volume = targetVol;
    }
  },

  fadeVolume(audioEl, startVol, targetVol, durationMs) {
    if (!audioEl) return;
    const steps = 20;
    const stepTime = Math.max(20, Math.floor(durationMs / steps));
    const volDiff = targetVol - startVol;
    let currentStep = 0;

    this.clearFadeIntervals();

    this.crossfadeInterval = setInterval(() => {
      currentStep++;
      const newVol = Math.max(0, Math.min(1, startVol + (volDiff * (currentStep / steps))));
      audioEl.volume = newVol;

      if (currentStep >= steps) {
        this.clearFadeIntervals();
      }
    }, stepTime);
  },

  smartShuffle(queue, currentIndex = 0) {
    if (!queue || queue.length <= 2) return queue;

    const remaining = queue.slice(currentIndex + 1);
    const currentTrack = queue[currentIndex];
    const shuffled = [];
    let lastArtist = currentTrack ? (currentTrack.artist || currentTrack.singers || '').toLowerCase() : '';

    const candidates = [...remaining];

    while (candidates.length > 0) {
      let pickIdx = -1;

      for (let i = 0; i < candidates.length; i++) {
        const candArtist = (candidates[i].artist || candidates[i].singers || '').toLowerCase();
        if (candArtist && candArtist !== lastArtist) {
          pickIdx = i;
          break;
        }
      }

      if (pickIdx === -1) {
        pickIdx = Math.floor(Math.random() * candidates.length);
      }

      const picked = candidates.splice(pickIdx, 1)[0];
      shuffled.push(picked);
      lastArtist = (picked.artist || picked.singers || '').toLowerCase();
    }

    return [...queue.slice(0, currentIndex + 1), ...shuffled];
  }
};
