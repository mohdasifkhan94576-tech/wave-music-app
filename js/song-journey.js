'use strict';

 

window.SongJourney = {
  renderView(currentSong) {
    const container = document.getElementById('main-view');
    if (!container) return;

    const songs = window.SONGS || [];
    const activeSong = currentSong || (typeof state !== 'undefined' && state.queue[state.currentIndex]) || songs[0] || { title: 'Husn', artist: 'Anuv Jain' };

    
    const node1 = activeSong;
    const node2 = songs[1] || { title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', thumb: 'https://placehold.co/100' };
    const node3 = songs[2] || { title: 'Afsanay', artist: 'Young Stunners', thumb: 'https://placehold.co/100' };
    const node4 = songs[3] || { title: 'Chaleya', artist: 'Arijit Singh', thumb: 'https://placehold.co/100' };

    const steps = [
      { song: node1, reason: null },
      { song: node2, reason: 'Similar Emotion & Vibe' },
      { song: node3, reason: 'Similar Acoustic Style' },
      { song: node4, reason: 'Energy & Beat Match' }
    ];

    let journeyHtml = steps.map((step, idx) => {
      const connectorHtml = step.reason ? `
        <div class="journey-connector">
          <div class="journey-line"></div>
          <div class="journey-reason-pill">${step.reason}</div>
          <div class="journey-line"></div>
        </div>
      ` : '';

      return `
        ${connectorHtml}
        <div class="journey-song-node">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${step.song.img || step.song.thumb || 'https://placehold.co/100'}" style="width: 52px; height: 52px; border-radius: 12px; object-fit: cover;" alt="${step.song.title}">
            <div>
              <div style="font-weight: 700; color: #ffffff; font-size: 1.05rem;">${step.song.title}</div>
              <div style="font-size: 0.85rem; color: #94a3b8;">${step.song.artist || step.song.singers || ''}</div>
            </div>
          </div>
          <button class="sp-card-play-btn" style="opacity: 1; position: relative; transform: none; right: 0; bottom: 0;" onclick="playDirectSong('${step.song.id || step.song.title}')" title="Play">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="wave-feature-container">
        <div class="wave-feature-header">
          <div class="wave-feature-title-wrap">
            <div class="wave-feature-icon-badge">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><path d="M9 18V9l9-3v9"/><path d="M6 15l12-9"/></svg>
            </div>
            <div>
              <h1 class="wave-feature-title">Song Journey</h1>
              <div class="wave-feature-subtitle">Explore where your music flow leads</div>
            </div>
          </div>
        </div>

        <div style="max-width: 700px; margin: 0 auto; background: rgba(18, 18, 18, 0.6); border-radius: 24px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
          <div class="song-journey-wrapper">
            ${journeyHtml}
          </div>
        </div>
      </div>
    `;

    container.style.opacity = 1;
  }
};

window.playDirectSong = function(idOrTitle) {
  const songs = window.SONGS || [];
  const found = songs.find(s => String(s.id) === String(idOrTitle) || s.title === idOrTitle);
  if (found && typeof playSong === 'function') {
    playSong(found);
  }
};
