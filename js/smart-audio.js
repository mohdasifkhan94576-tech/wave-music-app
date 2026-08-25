'use strict';

 

window.SmartAudio = {
  crossfadeDuration: 4, 
  isCrossfadeEnabled: true,
  crossfadeInterval: null,

  
  initCrossfade(audioEl) {
    if (!audioEl) return;

    audioEl.addEventListener('timeupdate', () => {
      if (!this.isCrossfadeEnabled || !audioEl.duration || audioEl.duration <= 10) return;

      const timeRemaining = audioEl.duration - audioEl.currentTime;

      
      if (timeRemaining <= this.crossfadeDuration && timeRemaining > 0.3) {
        if (!audioEl.dataset.crossfading) {
          audioEl.dataset.crossfading = 'true';
          this.fadeVolume(audioEl, audioEl.volume || 1, 0, timeRemaining * 1000);
        }
      } else {
        delete audioEl.dataset.crossfading;
      }
    });
  },

  
  fadeVolume(audioEl, startVol, targetVol, durationMs) {
    if (!audioEl) return;
    const steps = 20;
    const stepTime = Math.max(20, Math.floor(durationMs / steps));
    const volDiff = targetVol - startVol;
    let currentStep = 0;

    if (this.crossfadeInterval) clearInterval(this.crossfadeInterval);

    this.crossfadeInterval = setInterval(() => {
      currentStep++;
      const newVol = Math.max(0, Math.min(1, startVol + (volDiff * (currentStep / steps))));
      audioEl.volume = newVol;

      if (currentStep >= steps) {
        clearInterval(this.crossfadeInterval);
        this.crossfadeInterval = null;
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
