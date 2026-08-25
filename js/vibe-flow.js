'use strict';

 

window.VibeFlow = {
  currentMood: 'all',

  moods: [
    { 
      id: 'sad', 
      name: 'Sad', 
      svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 7c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm-4 0c0-.55.45-1 1-1s1 .45 1 1-.45 1-1 1-1-.45-1-1zm8.5 8.5c-.83-.83-2.17-1.5-3.5-1.5s-2.67.67-3.5 1.5l-1.42-1.42C8.25 15.42 10.08 14.5 12 14.5s3.75.92 4.92 2.08l-1.42 1.42z"/></svg>', 
      class: 'vibe-sad', 
      sub: 'For quiet moments & heartbreaks', 
      keywords: ['sad', 'dard', 'alone', 'ro', 'lonely', 'tum', 'yaad'] 
    },
    { 
      id: 'love', 
      name: 'Love', 
      svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#fb7185"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>', 
      class: 'vibe-love', 
      sub: 'Romantic Hindi & English beats', 
      keywords: ['love', 'dil', 'ishq', 'pyaar', 'teriyaan', 'husn', 'tumhi'] 
    },
    { 
      id: 'chill', 
      name: 'Chill', 
      svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#2dd4bf"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>', 
      class: 'vibe-chill', 
      sub: 'Relax, unwind & breathe', 
      keywords: ['chill', 'lofi', 'slowed', 'reverb', 'acoustic', 'peace', 'sky'] 
    },
    { 
      id: 'energy', 
      name: 'Energy', 
      svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#fb923c"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>', 
      class: 'vibe-energy', 
      sub: 'Workout hits & party hype', 
      keywords: ['energy', 'workout', 'party', 'rock', 'hype', 'beat', 'punjabi', 'dhol'] 
    },
    { 
      id: 'night', 
      name: 'Late Night', 
      svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#818cf8"><path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.6-4.9c-.6.1-1.3.1-2 .1A9 9 0 0 1 8 8.2c0-.7 0-1.4.1-2A10 10 0 0 0 12.3 2z"/></svg>', 
      class: 'vibe-night', 
      sub: 'Midnight thoughts & soft acoustic', 
      keywords: ['night', 'midnight', 'moon', 'chand', 'lofi', 'sleep', 'soja'] 
    },
    { 
      id: 'focus', 
      name: 'Focus', 
      svg: '<svg viewBox="0 0 24 24" width="32" height="32" fill="#a855f7"><path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1a7 7 0 0 1 14 0v1h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z"/></svg>', 
      class: 'vibe-focus', 
      sub: 'Instrumental & deep study flow', 
      keywords: ['focus', 'study', 'instrumental', 'piano', 'guitar', 'ambient'] 
    }
  ],

  
  filterByMood(songs, moodId) {
    if (!moodId || moodId === 'all') return songs;

    const moodObj = this.moods.find(m => m.id === moodId);
    if (!moodObj) return songs;

    return songs.filter(song => {
      const title = String(song.title || '').toLowerCase();
      const artist = String(song.artist || song.singers || '').toLowerCase();

      return moodObj.keywords.some(kw => title.includes(kw) || artist.includes(kw));
    });
  },

  
  renderView() {
    const container = document.getElementById('main-view');
    if (!container) return;

    let gridHtml = this.moods.map(m => `
      <div class="vibeflow-card ${m.class} ${this.currentMood === m.id ? 'active' : ''}" onclick="VibeFlow.selectMood('${m.id}')">
        <div>
          <div class="vibeflow-emoji" style="display:flex; align-items:center; margin-bottom: 8px;">${m.svg}</div>
          <div class="vibeflow-name">${m.name}</div>
        </div>
        <div class="vibeflow-sub">${m.sub}</div>
      </div>
    `).join('');

    
    const allAvailable = window.SONGS || [];
    const filteredSongs = this.filterByMood(allAvailable, this.currentMood);

    let songListHtml = '';
    if (filteredSongs.length > 0) {
      songListHtml = `
        <div class="sp-section" style="margin-top: 32px;">
          <h2 class="sp-section-title">Tracks for ${this.currentMood.toUpperCase()} Vibe</h2>
          <div class="sp-grid">
            ${filteredSongs.map((s, idx) => `
              <div class="sp-card" onclick="playSongFromCard(${idx}, 'vibe-${this.currentMood}')">
                <div class="sp-card-img-wrap">
                  <img src="${s.img || s.thumb || 'https://placehold.co/200'}" class="sp-card-img" alt="${s.title}" loading="lazy">
                  <button class="sp-card-play-btn" title="Play" aria-label="Play">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="sp-card-title">${s.title}</div>
                <div class="sp-card-sub">${s.artist || s.singers || 'Artist'}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      songListHtml = `
        <div style="text-align: center; padding: 40px; color: #94a3b8;">
          <p style="font-size: 1.2rem;">Select a vibe above to discover songs matched to your mood!</p>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="wave-feature-container">
        <div class="wave-feature-header">
          <div class="wave-feature-title-wrap">
            <div class="wave-feature-icon-badge">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div>
              <h1 class="wave-feature-title">VibeFlow</h1>
              <div class="wave-feature-subtitle">Music based on your current mood & emotion</div>
            </div>
          </div>
        </div>

        <div class="vibeflow-grid">
          ${gridHtml}
        </div>

        ${songListHtml}
      </div>
    `;

    container.style.opacity = 1;
  },

  selectMood(moodId) {
    this.currentMood = moodId;
    this.renderView();
  }
};
