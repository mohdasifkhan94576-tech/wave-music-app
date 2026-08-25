

'use strict';

window.WaveViews2 = {
  version: '2.0.0',
  initialized: true
};

const _ambientColorCache = new Map();
const _ambientFallbackColors = [
  '#4a1d63', '#1e405e', '#59251e', '#1c5234', '#5e4318', 
  '#5e1e36', '#2b3a67', '#633918', '#1a505b', '#482054'
];

const DEFAULT_AMBIENT_GRADIENT = 'linear-gradient(180deg, #3d1c26 0%, rgba(18, 18, 18, 0.95) 280px, #121212 100%)';

function _getHashFallbackColor(str) {
  let hash = 0;
  if (!str) return _ambientFallbackColors[0];
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const idx = Math.abs(hash) % _ambientFallbackColors.length;
  return _ambientFallbackColors[idx];
}

window.setHomeAmbientGlow = function(imgSrc, id) {
  const heroEl = document.getElementById('home-ambient-hero');
  if (!heroEl) return;

  if (_ambientColorCache.has(imgSrc)) {
    const col = _ambientColorCache.get(imgSrc);
    heroEl.style.background = `linear-gradient(180deg, ${col} 0%, rgba(18, 18, 18, 0.95) 280px, #121212 100%)`;
    return;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 16, 16);
        const p = ctx.getImageData(8, 8, 1, 1).data;
        const r = Math.min(255, Math.floor(p[0] * 0.85));
        const g = Math.min(255, Math.floor(p[1] * 0.85));
        const b = Math.min(255, Math.floor(p[2] * 0.85));
        const col = `rgb(${r}, ${g}, ${b})`;
        _ambientColorCache.set(imgSrc, col);
        heroEl.style.background = `linear-gradient(180deg, ${col} 0%, rgba(18, 18, 18, 0.95) 280px, #121212 100%)`;
      } catch (err) {
        const fallback = _getHashFallbackColor(id || imgSrc);
        _ambientColorCache.set(imgSrc, fallback);
        heroEl.style.background = `linear-gradient(180deg, ${fallback} 0%, rgba(18, 18, 18, 1) 100%)`;
      }
    };
    img.onerror = function() {
      const fallback = _getHashFallbackColor(id || imgSrc);
      _ambientColorCache.set(imgSrc, fallback);
      heroEl.style.background = `linear-gradient(180deg, ${fallback} 0%, rgba(18, 18, 18, 1) 100%)`;
    };
    img.src = imgSrc;
  } catch (err) {
    const fallback = _getHashFallbackColor(id || imgSrc);
    heroEl.style.background = `linear-gradient(180deg, ${fallback} 0%, rgba(18, 18, 18, 1) 100%)`;
  }
};

window.resetHomeAmbientGlow = function() {
  const heroEl = document.getElementById('home-ambient-hero');
  if (heroEl) {
    heroEl.style.background = DEFAULT_AMBIENT_GRADIENT;
  }
};

function _initStickyPillsListener() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    mainContent.removeEventListener('scroll', _handleMainContentScroll);
    mainContent.addEventListener('scroll', _handleMainContentScroll, { passive: true });
  }
}

function _handleMainContentScroll() {
  const mainContent = document.querySelector('.main-content');
  const pills = document.querySelector('.sp-main-pills');
  if (mainContent && pills) {
    if (mainContent.scrollTop > 20) {
      pills.classList.add('is-scrolled');
    } else {
      pills.classList.remove('is-scrolled');
    }
  }
}

window.scrollGettingStarted = function(direction) {
  const container = document.getElementById('sp-gs-carousel');
  if (container) {
    container.scrollBy({ left: direction * 450, behavior: 'smooth' });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initStickyPillsListener);
} else {
  _initStickyPillsListener();
}

window.getHomeHTML = function() {
  setTimeout(() => { 
    _initStickyPillsListener();
  }, 100);

  
  const userPlaylists = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : [];
  const recentTracks = (state.recentSongs && state.recentSongs.length > 0) ? state.recentSongs : (cloudData.songs || SONGS);

  const qpItems = [];
  
  userPlaylists.slice(0, 4).forEach(pl => {
    qpItems.push({
      id: pl.id,
      title: pl.name || pl.title || 'My Playlist',
      isPlaylist: true,
      playlistObj: pl,
      img: pl.img || (pl.songs && pl.songs[0] ? (pl.songs[0].thumb || pl.songs[0].img) : '')
    });
  });

  
  for (let i = 0; i < recentTracks.length && qpItems.length < 8; i++) {
    const s = recentTracks[i];
    if (s && !qpItems.some(x => String(x.id) === String(s.id))) {
      qpItems.push({
        id: s.id,
        title: s.title,
        isPlaylist: false,
        img: s.img || s.thumb,
        songObj: s
      });
    }
  }

  
  if (qpItems.length < 8) {
    for (let s of SONGS) {
      if (qpItems.length >= 8) break;
      if (!qpItems.some(x => String(x.id) === String(s.id))) {
        qpItems.push({
          id: s.id,
          title: s.title,
          isPlaylist: false,
          img: s.img || s.thumb,
          songObj: s
        });
      }
    }
  }

  const qpGridHtml = `
    <div class="sp-qp-grid">
      ${qpItems.map(item => {
        const thumb = item.img || 'https://placehold.co/100x100/121212/1ed760?text=Music';
        return `
          <div class="sp-qp-card" 
               onclick="${item.isPlaylist ? `navigateTo('playlist', event, '${item.id}')` : `playSpecificSong('${item.id}')`}"
               onmouseenter="setHomeAmbientGlow('${thumb}', '${item.id}')"
               onmouseleave="resetHomeAmbientGlow()">
            <div class="sp-qp-thumb-wrap">
              ${item.isPlaylist 
                ? getPlaylistCoverHTML(item.playlistObj) 
                : `<img src="${thumb}" alt="${item.title}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/121212/1ed760?text=Music';">`
              }
            </div>
            <span class="sp-qp-title" title="${item.title}">${item.title}</span>
            <button class="sp-qp-play-btn" 
                    onclick="event.stopPropagation(); ${item.isPlaylist ? `playAllPlaylistSongs('${item.id}')` : `playSpecificSong('${item.id}')`}" 
                    aria-label="Play ${item.title}">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;

  return `
    
    <div id="home-ambient-hero" class="home-ambient-hero">
      ${qpGridHtml}
    </div>

    
    <div class="sp-getting-started-section">
      <div class="sp-gs-header">
        <h2 class="sp-gs-title">Getting started</h2>
        <div class="sp-gs-arrows">
          <button class="sp-gs-arrow-btn" onclick="scrollGettingStarted(-1)" title="Previous">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button class="sp-gs-arrow-btn" onclick="scrollGettingStarted(1)" title="Next">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      </div>

      <div class="sp-gs-carousel" id="sp-gs-carousel">
        
        <div class="sp-gs-card sp-gs-card-green">
          <div>
            <h3 class="sp-gs-heading">1. Wave Music — Version 3</h3>
            <p class="sp-gs-desc">
              Enjoy the ultimate music experience with <strong>Wave Music V3</strong> — built and optimized for desktop users who want a smooth, immersive listening experience. No ads, no interruptions, just your favorite music playing freely. <strong>Why wait? Turn up the volume, sit back, and enjoy ad-free music with Wave Music V3 — completely free.</strong>
            </p>
          </div>
          <div class="sp-gs-actions">
            <button class="sp-gs-btn-pill" onclick="showDynamicIsland('Welcome to Wave Music V3!', 'success', 3000)">Try it</button>
            <button class="sp-gs-btn-link" onclick="showDynamicIsland('Wave V3 features Full-Screen Playlists, 2x2 Montage Covers & Spotify Smart Themes!', 'info', 4000)">Show more tips</button>
          </div>
        </div>

        
        <div class="sp-gs-card sp-gs-card-blue">
          <div>
            <h3 class="sp-gs-heading">2. Meet the New Wave</h3>
            <p class="sp-gs-desc">
              Wave Music V3 is more than just an update — it’s a completely refreshed way to enjoy your music. Experience immersive full-screen playback, dynamic playlist artwork, smooth ambient hover effects, and a smarter queue that keeps your music flowing. <strong>No ads. No interruptions. Just music.</strong>
            </p>
          </div>
          <div class="sp-gs-actions">
            <button class="sp-gs-btn-pill" onclick="navigateTo('wave-v3');">Explore V3</button>
            <button class="sp-gs-btn-link" onclick="showDynamicIsland('Wave V3: Full-Screen Playlists, Ambient Theme Glow & Smart Queue active!', 'info', 4000)">Show more tips</button>
          </div>
        </div>
      </div>
    </div>

    
    <div id="sections-container">
      ${(typeof WaveRecsEngine !== 'undefined' && WaveRecsEngine.getDynamicRowsHTML) ? WaveRecsEngine.getDynamicRowsHTML() : ''}
    </div>

    ${getFooterHTML()}
  `;
};
