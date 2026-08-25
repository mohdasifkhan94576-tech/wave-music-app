'use strict';

 

window.GhostPlaylist = {
  getGhostTracks() {
    const playCounts = window.WaveHistory ? window.WaveHistory.getPlayCounts() : {};
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const ghosts = [];

    Object.values(playCounts).forEach(item => {
      
      if (item.count >= 1 && item.lastPlayed < thirtyDaysAgo) {
        const daysAgo = Math.round((Date.now() - item.lastPlayed) / (1000 * 60 * 60 * 24));
        ghosts.push({ ...item.song, daysAgo: daysAgo });
      }
    });

    if (ghosts.length === 0) {
      
      const songs = (window.SONGS || []).slice(0, 5);
      return songs.map(s => ({ ...s, daysAgo: 60 }));
    }

    return ghosts;
  },

  renderView() {
    const container = document.getElementById('main-view');
    if (!container) return;

    const ghostTracks = this.getGhostTracks();

    let listHtml = ghostTracks.map((song, idx) => `
      <div class="sp-track-row" onclick="playSongFromCard(${idx}, 'ghost-playlist')">
        <div class="sp-track-num">${idx + 1}</div>
        <img src="${song.img || song.thumb || 'https://placehold.co/100'}" class="sp-track-img" alt="${song.title}">
        <div class="sp-track-info">
          <div class="sp-track-title">${song.title}</div>
          <div class="sp-track-artist">${song.artist || song.singers || 'Artist'}</div>
        </div>
        <div style="margin-left: auto; font-size: 0.85rem; color: #a855f7; font-weight: 600; display:flex; align-items:center; gap:6px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
          Rediscovered • Last played ${song.daysAgo || 30} days ago
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="wave-feature-container">
        <div class="wave-feature-header">
          <div class="wave-feature-title-wrap">
            <div class="wave-feature-icon-badge">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
            </div>
            <div>
              <h1 class="wave-feature-title">Ghost Playlist</h1>
              <div class="wave-feature-subtitle">Rediscover songs you forgot you loved</div>
            </div>
          </div>
        </div>

        <div style="background: rgba(18, 18, 18, 0.7); border-radius: 20px; padding: 24px; border: 1px solid rgba(168, 85, 247, 0.2);">
          ${listHtml}
        </div>
      </div>
    `;

    container.style.opacity = 1;
  }
};
