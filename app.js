'use strict';

const scriptFiles = [
  './js/wave-db.js?v=114',
  './jiosaavn.js?v=114',
  './spotify.js?v=114',
  './js/state.js?v=114',
  './js/lyrics.js?v=114',
  './js/wave-history.js?v=114',
  './js/wave-recs-engine.js?v=114',
  './js/smart-audio.js?v=114',
  './js/next-wave.js?v=114',
  './js/vibe-flow.js?v=114',
  './js/wave-story.js?v=114',
  './js/wave-dna.js?v=114',
  './js/time-capsule.js?v=114',
  './js/night-wave.js?v=114',
  './js/song-journey.js?v=114',
  './js/ghost-playlist.js?v=114',
  './js/views.js?v=114',
  './js/views-2-wave.js?v=114',
  './js/views-wave-3.js?v=114',
  './js/settings.js?v=114',
  './js/router.js?v=114',
  './js/smart-queue.js?v=114',
  './js/player.js?v=114',
  './js/mini-player.js?v=114',
  './js/mobile-player.js?v=114',
  './js/search.js?v=114'
];

let loadedCount = 0;

function startScriptLoading() {
  scriptFiles.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false; 
    script.onload = () => {
      loadedCount++;
      if (loadedCount === scriptFiles.length) {
        initApp();
      }
    };
    script.onerror = (e) => {
      console.warn(`[Wave Music] Warning: Failed to load ${src}:`, e);
      loadedCount++;
      if (loadedCount === scriptFiles.length) {
        initApp();
      }
    };
    document.head.appendChild(script);
  });
}

async function initApp() {
  
  if (typeof WaveDB !== 'undefined' && WaveDB.init) {
    try {
      await WaveDB.init();
      await WaveDB.migrateFromLocalStorage();
    } catch (e) {
      console.warn('[Wave Music] WaveDB init warning:', e);
    }
  }

  
  if (typeof loadUserState === 'function') {
    await loadUserState();
  }

  
  if (typeof loadCloudData === 'function') {
    await loadCloudData();
  }

  
  if (typeof loadUserProfile === 'function') {
    loadUserProfile();
  }

  
  if (typeof initAudio === 'function') {
    initAudio();
  }

  
  if (typeof renderSidebarLibrary === 'function') {
    renderSidebarLibrary();
  }

  
  const desktopSearchInput = document.getElementById('search-input');
  if (desktopSearchInput && typeof handleSearchFocus === 'function' && typeof handleSearch === 'function') {
    desktopSearchInput.addEventListener('focus', handleSearchFocus);
    desktopSearchInput.addEventListener('input', handleSearch);
  }

  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchInput && typeof handleSearchFocus === 'function' && typeof handleSearch === 'function') {
    mobileSearchInput.addEventListener('focus', handleSearchFocus);
    mobileSearchInput.addEventListener('input', handleSearch);
  }

  
  if (typeof parseUrlHash === 'function' && typeof renderView === 'function') {
    const parsed = parseUrlHash();
    if (parsed && parsed.view) {
      renderView(parsed.view, parsed.param);
    } else {
      renderView('home');
    }
  }

  
  window.addEventListener('popstate', (e) => {
    if (typeof renderView !== 'function') return;
    if (e.state && e.state.view) {
      renderView(e.state.view, e.state.param);
    } else if (typeof parseUrlHash === 'function') {
      const p = parseUrlHash();
      if (p && p.view) renderView(p.view, p.param);
      else renderView('home');
    }
  });

  
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (typeof togglePlay === 'function') togglePlay();
        break;
      case 'ArrowRight':
        if (typeof audio !== 'undefined' && audio && audio.duration) {
          audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
        }
        break;
      case 'ArrowLeft':
        if (typeof audio !== 'undefined' && audio && audio.duration) {
          audio.currentTime = Math.max(0, audio.currentTime - 10);
        }
        break;
      case 'm':
      case 'M':
        if (typeof toggleMute === 'function') toggleMute();
        break;
      case 'Escape': {
        const container = document.querySelector('.app-container');
        const isBrowserFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
        if (container && container.classList.contains('rs-fullscreen-active') && !isBrowserFs) {
          if (typeof toggleRightSidebarFullscreen === 'function') {
            toggleRightSidebarFullscreen();
          }
        }
        break;
      }
    }
  });

  
  if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('ServiceWorker registration skipped:', err);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startScriptLoading);
} else {
  startScriptLoading();
}
