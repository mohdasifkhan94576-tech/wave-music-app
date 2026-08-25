'use strict';

 

const WAVE_CAPSULES_KEY = 'wave_time_capsules_v1';

window.TimeCapsule = {
  getCapsules() {
    try {
      const raw = localStorage.getItem(WAVE_CAPSULES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveCapsules(capsules) {
    try {
      localStorage.setItem(WAVE_CAPSULES_KEY, JSON.stringify(capsules));
    } catch (e) {}
  },

  createCapsule(title, unlockDateStr, songList) {
    if (!title || !unlockDateStr) return false;

    const unlockTime = new Date(unlockDateStr).getTime();
    const newCapsule = {
      id: `capsule-${Date.now()}`,
      title: title,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      unlockTimestamp: unlockTime,
      unlockDateStr: new Date(unlockDateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      songs: songList || [],
      isLocked: Date.now() < unlockTime
    };

    const current = this.getCapsules();
    current.unshift(newCapsule);
    this.saveCapsules(current);

    if (typeof showToast === 'function') {
      showToast(`Created "${title}" locked until ${newCapsule.unlockDateStr}!`, 'success');
    }
    return true;
  },

  openCreateModal() {
    const existingModal = document.getElementById('capsule-create-modal');
    if (existingModal) existingModal.remove();

    const availableSongs = (window.SONGS || []).slice(0, 10);
    let songsOptionsHtml = availableSongs.map((s, i) => `
      <label style="display: flex; align-items: center; gap: 10px; padding: 6px 0; cursor: pointer;">
        <input type="checkbox" value="${i}" class="capsule-song-select" checked>
        <span>${s.title} - <small style="color:#94a3b8">${s.artist || s.singers || ''}</small></span>
      </label>
    `).join('');

    const modalHtml = `
      <div class="capsule-modal-overlay" id="capsule-create-modal" onclick="if(event.target===this) TimeCapsule.closeModal()">
        <div class="capsule-modal-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 0; display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>
              Lock a Time Capsule
            </h2>
            <button onclick="TimeCapsule.closeModal()" style="background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer;">✕</button>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 6px;">Capsule Name</label>
            <input type="text" id="capsule-title-input" class="sp-pm-input" placeholder="e.g. My 2026 Music Capsule" value="My ${new Date().getFullYear()} Music Capsule">
          </div>

          <div style="margin-bottom: 16px;">
            <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 6px;">Unlock Date</label>
            <input type="date" id="capsule-date-input" class="sp-pm-input" value="2027-08-09">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 6px;">Select Memory Tracks</label>
            <div style="max-height: 160px; overflow-y: auto; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 12px;">
              ${songsOptionsHtml}
            </div>
          </div>

          <button class="sp-pm-save-btn" onclick="TimeCapsule.submitModal()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            Lock Capsule
          </button>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  closeModal() {
    const el = document.getElementById('capsule-create-modal');
    if (el) el.remove();
  },

  submitModal() {
    const title = document.getElementById('capsule-title-input')?.value.trim();
    const dateStr = document.getElementById('capsule-date-input')?.value;

    const selectedCheckboxes = document.querySelectorAll('.capsule-song-select:checked');
    const availableSongs = window.SONGS || [];
    const selectedSongs = Array.from(selectedCheckboxes).map(cb => availableSongs[parseInt(cb.value)]).filter(Boolean);

    if (title && dateStr) {
      this.createCapsule(title, dateStr, selectedSongs);
      this.closeModal();
      if (typeof state !== 'undefined' && state.currentView === 'time-capsule') {
        this.renderView();
      }
    }
  },

  renderView() {
    const container = document.getElementById('main-view');
    if (!container) return;

    let capsules = this.getCapsules();
    if (capsules.length === 0) {
      
      capsules = [{
        id: 'capsule-demo',
        title: `My ${new Date().getFullYear()} Music Capsule`,
        createdDate: 'Aug 2026',
        unlockTimestamp: Date.now() + 31536000000,
        unlockDateStr: 'August 2027',
        songs: (window.SONGS || []).slice(0, 3),
        isLocked: true
      }];
    }

    let cardsHtml = capsules.map(c => {
      const isLocked = Date.now() < c.unlockTimestamp;
      const statusBadge = isLocked 
        ? `<span class="capsule-status-badge capsule-status-locked" style="display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg> Opens ${c.unlockDateStr}</span>`
        : `<span class="capsule-status-badge capsule-status-unlocked" style="display:flex; align-items:center; gap:4px;"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/></svg> Memory Unlocked!</span>`;

      let songsHtml = '';
      if (isLocked) {
        songsHtml = `<div style="padding: 16px 0; color: #94a3b8; font-size: 0.85rem; text-align: center; font-style: italic; display:flex; align-items:center; justify-content:center; gap:6px;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          ${c.songs.length} track memories locked inside until ${c.unlockDateStr}
        </div>`;
      } else {
        songsHtml = c.songs.map(s => `
          <div class="capsule-song-item">
            <span style="color: #a855f7;"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></span>
            <span style="font-weight: 600;">${s.title}</span>
            <span style="margin-left: auto; color: #64748b; font-size: 0.8rem;">${s.artist || s.singers || ''}</span>
          </div>
        `).join('');
      }

      return `
        <div class="capsule-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div>
              <h3 style="font-size: 1.2rem; font-weight: 700; margin: 0 0 4px; color: #ffffff;">${c.title}</h3>
              <div style="font-size: 0.8rem; color: #64748b;">Created ${c.createdDate}</div>
            </div>
            ${statusBadge}
          </div>
          ${songsHtml}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="wave-feature-container">
        <div class="wave-feature-header">
          <div class="wave-feature-title-wrap">
            <div class="wave-feature-icon-badge">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>
            </div>
            <div>
              <h1 class="wave-feature-title">TimeCapsule</h1>
              <div class="wave-feature-subtitle">Save your favourite songs now and unlock memories in the future</div>
            </div>
          </div>
          <button class="sp-pm-save-btn" style="width: auto; padding: 10px 20px;" onclick="TimeCapsule.openCreateModal()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            Lock New Capsule
          </button>
        </div>

        <div class="capsule-grid">
          ${cardsHtml}
        </div>
      </div>
    `;

    container.style.opacity = 1;
  }
};
