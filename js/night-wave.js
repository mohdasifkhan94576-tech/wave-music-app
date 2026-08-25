'use strict';

 

window.NightWave = {
  isNightWaveActive: false,
  startHour: 23, 
  endHour: 6,   

  init() {
    this.checkSchedule();
    
    setInterval(() => this.checkSchedule(), 300000);
  },

  checkSchedule() {
    const hour = new Date().getHours();
    const isNightTime = (hour >= this.startHour || hour < this.endHour);

    if (isNightTime && !this.isNightWaveActive) {
      this.activateNightWave(true);
    }
  },

  toggleNightWave() {
    this.activateNightWave(!this.isNightWaveActive);
  },

  activateNightWave(enable) {
    this.isNightWaveActive = enable;
    const body = document.body;

    if (enable) {
      body.classList.add('night-wave-mode');
      if (typeof showToast === 'function') {
        showToast('Night Wave Activated — Soft beats & midnight vibe on', 'info');
      }
    } else {
      body.classList.remove('night-wave-mode');
      if (typeof showToast === 'function') {
        showToast('Night Wave Deactivated', 'info');
      }
    }
    this.updatePillUI();
  },

  updatePillUI() {
    const pill = document.getElementById('night-wave-toggle-btn');
    if (pill) {
      const moonSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.6-4.9c-.6.1-1.3.1-2 .1A9 9 0 0 1 8 8.2c0-.7 0-1.4.1-2A10 10 0 0 0 12.3 2z"/></svg>';
      if (this.isNightWaveActive) {
        pill.innerHTML = `${moonSvg}<span style="color: #a855f7; font-weight: 700;">Night Wave ON</span>`;
      } else {
        pill.innerHTML = `${moonSvg}<span>Night Wave</span>`;
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  window.NightWave.init();
});
