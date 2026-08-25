'use strict';

 

window.WaveStory = {
  renderView() {
    const container = document.getElementById('main-view');
    if (!container) return;

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const topSongs = window.WaveHistory ? window.WaveHistory.getTopSongs(currentMonthKey, 5) : [];
    const topArtists = window.WaveHistory ? window.WaveHistory.getTopArtists(currentMonthKey, 3) : [];
    const historyList = window.WaveHistory ? window.WaveHistory.getHistory().slice(0, 15) : [];
    const moodBreakdown = window.WaveHistory ? window.WaveHistory.getMoodBreakdown(currentMonthKey) : { Romantic: 80, Chill: 70 };

    const topArtistName = topArtists.length > 0 ? topArtists[0].name : 'Arijit Singh';
    const totalPlays = historyList.length;
    const estMinutes = Math.round(totalPlays * 3.4);

    let timelineHtml = historyList.map(item => `
      <div class="wavestory-timeline-item">
        <img src="${item.img || 'https://placehold.co/100'}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;" alt="${item.title}">
        <div style="flex: 1;">
          <div style="font-weight: 700; color: #ffffff;">${item.title}</div>
          <div style="font-size: 0.85rem; color: #94a3b8;">${item.artist} • <span style="color: #a855f7;">${item.mood}</span></div>
        </div>
        <div style="font-size: 0.8rem; color: #64748b;">
          ${new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    `).join('');

    if (historyList.length === 0) {
      timelineHtml = `
        <div style="padding: 24px; text-align: center; color: #94a3b8; background: rgba(255,255,255,0.03); border-radius: 16px;">
          Start playing songs to build your WaveStory timeline for ${currentMonthName}!
        </div>
      `;
    }

    container.innerHTML = `
      <div class="wave-feature-container">
        <div class="wave-feature-header">
          <div class="wave-feature-title-wrap">
            <div class="wave-feature-icon-badge">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c.6 0 1.2-.4 1.6-.9 1.6-2.2 4-3.1 6.4-2.1 1.6.6 2.8 2 4.4 2.6 2.4 1 5-.1 6.6-2.1.4-.5 1-.9 1.6-.9"/><path d="M2 18c.6 0 1.2-.4 1.6-.9 1.6-2.2 4-3.1 6.4-2.1 1.6.6 2.8 2 4.4 2.6 2.4 1 5-.1 6.6-2.1.4-.5 1-.9 1.6-.9"/></svg>
            </div>
            <div>
              <h1 class="wave-feature-title">WaveStory</h1>
              <div class="wave-feature-subtitle">Your Music Memories & Timeline • ${currentMonthName}</div>
            </div>
          </div>
          <button class="sp-pm-save-btn" style="width: auto; padding: 10px 20px;" onclick="WaveStory.createRelivePlaylist()">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align: middle; margin-right: 4px;"><path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/></svg>
            Relive This Month Playlist
          </button>
        </div>

        <div class="wavestory-hero-card">
          <div>
            <div style="font-size: 0.85rem; color: #c084fc; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">MONTHLY RECAP</div>
            <h2 style="font-size: 1.8rem; font-weight: 800; margin: 6px 0 12px;">Top Artist: ${topArtistName}</h2>
            <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0;">You spent <strong>${estMinutes} minutes</strong> flowing through beats this month.</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 2.5rem; font-weight: 800; color: #a855f7;">${totalPlays}</div>
            <div style="font-size: 0.85rem; color: #94a3b8;">Songs Played</div>
          </div>
        </div>

        <div class="wavestory-stats-grid">
          <div class="wavestory-stat-card">
            <div class="wavestory-stat-value" style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#ec4899"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              ${moodBreakdown.Romantic}%
            </div>
            <div class="wavestory-stat-label">Romantic Vibe Share</div>
          </div>
          <div class="wavestory-stat-card">
            <div class="wavestory-stat-value" style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#38bdf8"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              ${moodBreakdown.Chill || 70}%
            </div>
            <div class="wavestory-stat-label">Chill & Relax Share</div>
          </div>
          <div class="wavestory-stat-card">
            <div class="wavestory-stat-value" style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#818cf8"><path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.6-4.9c-.6.1-1.3.1-2 .1A9 9 0 0 1 8 8.2c0-.7 0-1.4.1-2A10 10 0 0 0 12.3 2z"/></svg>
              ${moodBreakdown.LateNight || 55}%
            </div>
            <div class="wavestory-stat-label">Late Night Sessions</div>
          </div>
          <div class="wavestory-stat-card">
            <div class="wavestory-stat-value" style="display:flex; align-items:center; justify-content:center; gap:6px;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="#eab308"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
              ${moodBreakdown.Energy || 65}%
            </div>
            <div class="wavestory-stat-label">Energy Boost Tracks</div>
          </div>
        </div>

        <h2 style="font-size: 1.4rem; font-weight: 700; margin-bottom: 20px; color: #ffffff;">Recent Music Memories</h2>
        <div class="wavestory-timeline-list">
          ${timelineHtml}
        </div>
      </div>
    `;

    container.style.opacity = 1;
  },

  createRelivePlaylist() {
    const topSongs = window.WaveHistory ? window.WaveHistory.getTopSongs(null, 15) : [];
    if (topSongs.length === 0) {
      if (typeof showToast === 'function') showToast('Play more songs to generate Relive Playlist!', 'info');
      return;
    }

    if (typeof state !== 'undefined') {
      const now = new Date();
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const plName = `Relive ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      const newPl = {
        id: `relive-${Date.now()}`,
        name: plName,
        desc: `Top 15 memory tracks from ${monthNames[now.getMonth()]}`,
        songs: topSongs,
        img: topSongs[0]?.img || 'https://placehold.co/200'
      };

      state.userPlaylists.push(newPl);
      if (typeof saveUserState === 'function') saveUserState();
      if (typeof updateLibraryUI === 'function') updateLibraryUI();
      if (typeof showToast === 'function') showToast(`Created "${plName}" in your library!`, 'success');
    }
  }
};
