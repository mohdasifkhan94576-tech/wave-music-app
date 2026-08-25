

(function() {
  const LYRICS_CACHE = new Map();
  let currentLyricsData = null;
  let activeLineIndex = -1;
  let isUserScrolling = false;
  let scrollTimeout = null;

  
  function initLyricsEngine() {
    const audio = window.audio || document.getElementById('audio-el');
    if (audio) {
      audio.addEventListener('timeupdate', onTimeUpdate);
    }
  }

  
  function _parseLRC(lrcText) {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const result = [];
    const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    for (const line of lines) {
      const text = line.replace(timeRegex, '').trim();
      if (!text) continue;

      let match;
      timeRegex.lastIndex = 0;
      while ((match = timeRegex.exec(line)) !== null) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const startTimeMs = (minutes * 60 + seconds) * 1000 + ms;
        result.push({ startTimeMs, words: text });
      }
    }

    return result.sort((a, b) => a.startTimeMs - b.startTimeMs);
  }

  
  function _formatLyricsLines(rawLines) {
    return rawLines
      .filter(l => l && (l.words !== undefined || l.text !== undefined))
      .map(l => ({
        startTimeMs: parseInt(l.startTimeMs || l.time || 0, 10),
        words: (l.words || l.text || '').trim()
      }))
      .filter(l => l.words.length > 0)
      .sort((a, b) => a.startTimeMs - b.startTimeMs);
  }

  
  async function _fetchFromLrclib(song) {
    try {
      const cleanTitle = (song.title || '')
        .replace(/\(.*?\)|\{.*?\}/g, '')
        .replace(/feat\..*|ft\..*/i, '')
        .trim();
      const cleanArtist = (song.artist || '').split(',')[0].split('&')[0].trim();
      if (!cleanTitle) return null;

      let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
      if (song.secs && song.secs > 0) {
        url += `&duration=${song.secs}`;
      }

      const res = await fetch(url, {
        headers: {
          'Lrclib-Client': 'WaveMusic (https://wave-music.app)'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) {
          const parsed = _parseLRC(data.syncedLyrics);
          if (parsed.length > 0) return parsed;
        } else if (data.plainLyrics) {
          const plainLines = data.plainLyrics.split('\n')
            .map(line => line.trim())
            .filter(Boolean)
            .map((words, idx) => ({ startTimeMs: idx * 4000, words, isPlain: true }));
          if (plainLines.length > 0) return plainLines;
        }
      }
    } catch (err) {}
    return null;
  }

  
  async function _fetchFromJioSaavn(song) {
    try {
      const songId = song.jiosaavnId || song.id;
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.getLyrics) {
        const rawLyrics = await JIOSAAVN_API.getLyrics(songId);
        if (rawLyrics && typeof rawLyrics === 'string') {
          const clean = rawLyrics
            .replace(/<br\s*[\/]?>/gi, '\n')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#039;/g, "'")
            .replace(/<[^>]+>/g, '');

          const lines = clean.split('\n')
            .map(l => l.trim())
            .filter(Boolean)
            .map((words, idx) => ({
              startTimeMs: idx * 4000,
              words,
              isPlain: true
            }));

          if (lines.length > 0) return lines;
        }
      }
    } catch (e) {
      console.warn('JioSaavn lyrics fetch error:', e);
    }
    return null;
  }

  
  async function getLyrics(song) {
    if (!song) return null;
    const songId = String(song.id || song.title);

    
    if (LYRICS_CACHE.has(songId)) {
      return LYRICS_CACHE.get(songId);
    }

    
    if (song.lyrics && Array.isArray(song.lyrics.lines || song.lyrics)) {
      const lines = Array.isArray(song.lyrics.lines) ? song.lyrics.lines : song.lyrics;
      const parsed = _formatLyricsLines(lines);
      if (parsed.length > 0) {
        LYRICS_CACHE.set(songId, parsed);
        return parsed;
      }
    }

    
    if (song.lyricsUrl) {
      try {
        const res = await fetch(song.lyricsUrl);
        if (res.ok) {
          const data = await res.json();
          const rawLines = data.lyrics?.lines || data.lines || data;
          if (Array.isArray(rawLines)) {
            const parsed = _formatLyricsLines(rawLines);
            if (parsed.length > 0) {
              LYRICS_CACHE.set(songId, parsed);
              return parsed;
            }
          }
        }
      } catch (err) {
        console.warn('Failed to fetch lyrics from lyricsUrl:', song.lyricsUrl, err);
      }
    }

    
    const lrclibResult = await _fetchFromLrclib(song);
    if (lrclibResult && lrclibResult.length > 0) {
      LYRICS_CACHE.set(songId, lrclibResult);
      return lrclibResult;
    }

    
    const jioResult = await _fetchFromJioSaavn(song);
    if (jioResult && jioResult.length > 0) {
      LYRICS_CACHE.set(songId, jioResult);
      return jioResult;
    }

    
    const slug = (song.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (slug) {
      try {
        const localRes = await fetch(`lyrics/${slug}.json`);
        if (localRes.ok) {
          const data = await localRes.json();
          const rawLines = data.lyrics?.lines || data.lines || data;
          if (Array.isArray(rawLines)) {
            const parsed = _formatLyricsLines(rawLines);
            if (parsed.length > 0) {
              LYRICS_CACHE.set(songId, parsed);
              return parsed;
            }
          }
        }
      } catch (e) {}
    }

    return null;
  }

  
  function checkSyncButtonVisibility() {
    
    const pageSyncBtn = document.getElementById('sp-lyrics-page-sync-btn');
    const mainContent = document.querySelector('.main-content');
    const activePageLine = document.querySelector('.sp-page-view-lyric-line.active');

    if (pageSyncBtn && mainContent && activePageLine && typeof state !== 'undefined' && state.currentView === 'lyrics') {
      const mainRect = mainContent.getBoundingClientRect();
      const lineRect = activePageLine.getBoundingClientRect();
      
      const isOutOfView = (lineRect.bottom < mainRect.top + 70) || (lineRect.top > mainRect.bottom - 110);
      if (isOutOfView) {
        pageSyncBtn.classList.add('visible');
      } else {
        pageSyncBtn.classList.remove('visible');
      }
    } else if (pageSyncBtn) {
      pageSyncBtn.classList.remove('visible');
    }

    
    const modalSyncBtn = document.getElementById('sp-lyrics-modal-sync-btn');
    const scrollBox = document.getElementById('sp-lyrics-scroll-box');
    const activeModalLine = document.querySelector('.sp-lyric-line.active');
    const modal = document.getElementById('sp-lyrics-modal');

    if (modalSyncBtn && scrollBox && activeModalLine && modal && modal.classList.contains('active')) {
      const boxRect = scrollBox.getBoundingClientRect();
      const lineRect = activeModalLine.getBoundingClientRect();
      const isOutOfView = (lineRect.bottom < boxRect.top + 70) || (lineRect.top > boxRect.bottom - 110);
      if (isOutOfView) {
        modalSyncBtn.classList.add('visible');
      } else {
        modalSyncBtn.classList.remove('visible');
      }
    } else if (modalSyncBtn) {
      modalSyncBtn.classList.remove('visible');
    }
  }

  
  window.syncLyricsToActiveLine = function(e) {
    if (e) e.stopPropagation();
    isUserScrolling = false;

    const activePageLine = document.querySelector('.sp-page-view-lyric-line.active');
    if (activePageLine) {
      activePageLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    const activeModalLine = document.querySelector('.sp-lyric-line.active');
    if (activeModalLine) {
      activeModalLine.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }

    const pageSyncBtn = document.getElementById('sp-lyrics-page-sync-btn');
    if (pageSyncBtn) pageSyncBtn.classList.remove('visible');

    const modalSyncBtn = document.getElementById('sp-lyrics-modal-sync-btn');
    if (modalSyncBtn) modalSyncBtn.classList.remove('visible');
  };

  
  function onTimeUpdate() {
    const audio = window.audio || document.getElementById('audio-el');
    if (!audio || !currentLyricsData || currentLyricsData.length === 0) return;

    
    if (currentLyricsData[0] && currentLyricsData[0].isPlain) {
      return;
    }

    const currentMs = audio.currentTime * 1000;
    
    
    let newIndex = -1;
    for (let i = 0; i < currentLyricsData.length; i++) {
      if (currentMs >= currentLyricsData[i].startTimeMs) {
        newIndex = i;
      } else {
        break;
      }
    }

    if (newIndex !== activeLineIndex) {
      activeLineIndex = newIndex;
      updateLyricsUI(activeLineIndex);
    }

    if (!isUserScrolling) {
      const pageSyncBtn = document.getElementById('sp-lyrics-page-sync-btn');
      if (pageSyncBtn) pageSyncBtn.classList.remove('visible');
      const modalSyncBtn = document.getElementById('sp-lyrics-modal-sync-btn');
      if (modalSyncBtn) modalSyncBtn.classList.remove('visible');
    } else {
      checkSyncButtonVisibility();
    }
  }

  
  function updateLyricsUI(idx) {
    
    const modalContainer = document.getElementById('sp-lyrics-scroll-box');
    if (modalContainer) {
      const lineElements = modalContainer.querySelectorAll('.sp-lyric-line');
      lineElements.forEach((el, i) => {
        el.classList.remove('active', 'passed', 'upcoming');
        if (i < idx) {
          el.classList.add('passed');
        } else if (i === idx) {
          el.classList.add('active');
        } else {
          el.classList.add('upcoming');
        }
      });

      
      if (idx >= 0 && lineElements[idx] && !isUserScrolling) {
        lineElements[idx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }

    
    const pageViewContainer = document.getElementById('sp-lyrics-page-lines-container');
    if (pageViewContainer) {
      const pageViewLines = pageViewContainer.querySelectorAll('.sp-page-view-lyric-line');
      pageViewLines.forEach((el, i) => {
        el.classList.remove('active', 'passed', 'upcoming');
        if (i < idx) {
          el.classList.add('passed');
        } else if (i === idx) {
          el.classList.add('active');
        } else {
          el.classList.add('upcoming');
        }
      });

      
      if (idx >= 0 && pageViewLines[idx] && !isUserScrolling) {
        pageViewLines[idx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }

    
    const pageCardContainer = document.getElementById('sp-song-page-lyrics-lines');
    if (pageCardContainer) {
      const pageLines = pageCardContainer.querySelectorAll('.sp-page-lyric-line');
      pageLines.forEach((el, i) => {
        el.classList.remove('active', 'passed', 'upcoming');
        if (i < idx) {
          el.classList.add('passed');
        } else if (i === idx) {
          el.classList.add('active');
        } else {
          el.classList.add('upcoming');
        }
      });

      if (idx >= 0 && pageLines[idx]) {
        pageLines[idx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }

    
    const mobLyricsBox = document.getElementById('mob-lyrics-scroll-box');
    if (mobLyricsBox) {
      const mobLines = mobLyricsBox.querySelectorAll('.mob-lyrics-line');
      mobLines.forEach((el, i) => {
        el.classList.remove('active', 'passed', 'upcoming');
        if (i < idx) {
          el.classList.add('passed');
        } else if (i === idx) {
          el.classList.add('active');
        } else {
          el.classList.add('upcoming');
        }
      });

      if (idx >= 0 && mobLines[idx] && !isUserScrolling) {
        mobLines[idx].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }

  
  window.seekToLyric = function(startTimeMs, isPlain) {
    if (isPlain) return;
    isUserScrolling = false;

    const pageSyncBtn = document.getElementById('sp-lyrics-page-sync-btn');
    if (pageSyncBtn) pageSyncBtn.classList.remove('visible');
    const modalSyncBtn = document.getElementById('sp-lyrics-modal-sync-btn');
    if (modalSyncBtn) modalSyncBtn.classList.remove('visible');

    const audio = window.audio || document.getElementById('audio-el');
    if (audio) {
      audio.currentTime = Math.max(0, parseInt(startTimeMs, 10) / 1000);
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    }
  };

  
  let isMobileLyricsPageOpen = false;

  window.openMobileLyricsPage = async function(song) {
    const pageEl = document.getElementById('mobile-lyrics-page');
    if (!pageEl) return;

    const currentSong = song || (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex]) || null;
    if (!currentSong) return;

    isMobileLyricsPageOpen = true;
    pageEl.classList.add('open');
    document.body.classList.add('mob-lyrics-active');

    const titleEl = document.getElementById('mob-lyrics-song-title');
    const artistEl = document.getElementById('mob-lyrics-song-artist');
    const scrollBox = document.getElementById('mob-lyrics-scroll-box');

    if (titleEl) titleEl.textContent = currentSong.title || 'Unknown Title';
    if (artistEl) artistEl.textContent = currentSong.artist || 'Unknown Artist';

    const coverUrl = currentSong.img || currentSong.thumb || currentSong.image || '';
    if (coverUrl) {
      _extractLyricsColor(coverUrl, (color) => {
        if (pageEl) {
          pageEl.style.setProperty('--mob-lyrics-bg', color);
          const match = color.match(/\d+/g);
          if (match && match.length >= 3) {
            const r = parseInt(match[0], 10);
            const g = parseInt(match[1], 10);
            const b = parseInt(match[2], 10);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness < 80) {
              pageEl.classList.add('dark-theme');
            } else {
              pageEl.classList.remove('dark-theme');
            }
          }
        }
      });
    }

    if (scrollBox) {
      scrollBox.innerHTML = '<div class="mob-lyrics-loading">Loading lyrics...</div>';
      const lyricsData = await getLyrics(currentSong);
      currentLyricsData = lyricsData;
      activeLineIndex = -1;

      if (!lyricsData || lyricsData.length === 0) {
        scrollBox.innerHTML = '<div class="mob-lyrics-empty">Looks like we don\'t have lyrics for this song yet.</div>';
        return;
      }

      const isPlain = lyricsData[0] && lyricsData[0].isPlain;
      scrollBox.innerHTML = lyricsData.map((line, idx) => `
        <p class="mob-lyrics-line ${isPlain ? 'passed' : 'upcoming'}" data-index="${idx}" data-time="${line.startTimeMs}" onclick="seekToLyric(${line.startTimeMs}, ${isPlain})">
          ${line.words}
        </p>
      `).join('');

      if (!isPlain) {
        onTimeUpdate();
      }
      syncMobileLyricsProgress();
    }
  };

  window.closeMobileLyricsPage = function() {
    const pageEl = document.getElementById('mobile-lyrics-page');
    if (!pageEl) return;
    isMobileLyricsPageOpen = false;
    pageEl.classList.remove('open');
    document.body.classList.remove('mob-lyrics-active');
  };

  window.toggleMobileLyricsPage = function(song) {
    const pageEl = document.getElementById('mobile-lyrics-page');
    if (pageEl && pageEl.classList.contains('open')) {
      closeMobileLyricsPage();
    } else {
      openMobileLyricsPage(song);
    }
  };

  window.toggleLyricsTranslation = function(e) {
    if (e) e.stopPropagation();
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({ type: 'info', title: 'Showing original synced lyrics.' });
    } else if (typeof showToast === 'function') {
      showToast('Showing original lyrics');
    }
  };

  function syncMobileLyricsProgress() {
    const audio = window.audio || document.getElementById('audio-el');
    if (!audio || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    const fill = document.getElementById('mob-lyrics-prog-fill');
    const thumb = document.getElementById('mob-lyrics-prog-thumb');
    const curTime = document.getElementById('mob-lyrics-cur-time');
    const totTime = document.getElementById('mob-lyrics-tot-time');
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.right = (100 - pct) + '%';
    if (curTime) curTime.textContent = (typeof formatTime === 'function') ? formatTime(audio.currentTime) : '0:00';
    if (totTime) {
      const remaining = Math.max(0, audio.duration - audio.currentTime);
      totTime.textContent = '-' + ((typeof formatTime === 'function') ? formatTime(remaining) : '0:00');
    }

    const isPlaying = typeof state !== 'undefined' && state.isPlaying;
    const playIco = document.getElementById('mob-lyrics-ico-play');
    const pauseIco = document.getElementById('mob-lyrics-ico-pause');
    if (playIco) playIco.style.display = isPlaying ? 'none' : 'block';
    if (pauseIco) pauseIco.style.display = isPlaying ? 'block' : 'none';
  }
  window.syncMobileLyricsProgress = syncMobileLyricsProgress;

  
  window.toggleLyricsView = function(e) {
    if (e) e.stopPropagation();
    if (window.innerWidth <= 768) {
      toggleMobileLyricsPage();
      return;
    }
    if (typeof state !== 'undefined' && state.currentView === 'lyrics') {
      if (typeof goBack === 'function' && window.history.length > 1) {
        goBack();
      } else {
        navigateTo('home');
      }
    } else {
      navigateTo('lyrics');
    }
  };

  
  window.initLyricsPageView = async function() {
    if (window.innerWidth <= 768) {
      openMobileLyricsPage();
      return;
    }
    isUserScrolling = false;
    const currentSong = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
      ? state.queue[state.currentIndex]
      : null;

    const container = document.getElementById('sp-lyrics-page-lines-container');
    const viewEl = document.getElementById('sp-lyrics-page-view');
    if (!container) return;

    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.onscroll = () => {
        isUserScrolling = true;
        checkSyncButtonVisibility();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isUserScrolling = false;
          checkSyncButtonVisibility();
        }, 3500);
      };
    }

    if (!currentSong) {
      container.innerHTML = `
        <div class="sp-lyrics-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <h3>No song is currently playing</h3>
          <p>Play a song to view real-time synchronized lyrics</p>
        </div>
      `;
      return;
    }

    
    if (viewEl && (currentSong.img || currentSong.thumb)) {
      _extractLyricsColor(currentSong.img || currentSong.thumb, (rgbStr) => {
        if (viewEl) {
          viewEl.style.backgroundColor = rgbStr;
        }
      });
    }

    container.innerHTML = `
      <div class="sp-lyrics-loading-state">
        <div class="sp-lyrics-spinner"></div>
        <p>Loading lyrics...</p>
      </div>
    `;

    const lyricsData = await getLyrics(currentSong);
    currentLyricsData = lyricsData;
    activeLineIndex = -1;

    if (!lyricsData || lyricsData.length === 0) {
      container.innerHTML = `
        <div class="sp-lyrics-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <h3>Looks like we don't have lyrics for this song yet</h3>
          <p>Sing along to your favorite tunes with Wave Music</p>
        </div>
      `;
      return;
    }

    const isPlain = lyricsData[0] && lyricsData[0].isPlain;

    container.innerHTML = lyricsData.map((line, idx) => `
      <div class="sp-page-view-lyric-line ${isPlain ? 'passed' : 'upcoming'}" onclick="seekToLyric(${line.startTimeMs}, ${isPlain})" data-time="${line.startTimeMs}" id="sp-page-lyric-line-${idx}">
        ${line.words}
      </div>
    `).join('');

    if (!isPlain) {
      onTimeUpdate();
    }
  };

  
  window.openLyricsModal = async function() {
    if (window.innerWidth <= 768) {
      openMobileLyricsPage();
      return;
    }
    isUserScrolling = false;
    const modal = document.getElementById('sp-lyrics-modal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    
    const scrollBox = document.getElementById('sp-lyrics-scroll-box');
    if (scrollBox) {
      scrollBox.onscroll = () => {
        isUserScrolling = true;
        checkSyncButtonVisibility();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isUserScrolling = false;
          checkSyncButtonVisibility();
        }, 3500);
      };
    }

    const currentSong = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex]) 
      ? state.queue[state.currentIndex] 
      : null;

    await loadLyricsIntoModal(currentSong);
  };

  
  window.closeLyricsModal = function() {
    const modal = document.getElementById('sp-lyrics-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  
  window.toggleLyricsModal = function() {
    if (window.innerWidth <= 768) {
      toggleMobileLyricsPage();
      return;
    }
    const modal = document.getElementById('sp-lyrics-modal');
    if (modal && modal.classList.contains('active')) {
      closeLyricsModal();
    } else {
      openLyricsModal();
    }
  };

  
  async function loadLyricsIntoModal(song) {
    const titleEl = document.getElementById('sp-lyrics-song-title');
    const artistEl = document.getElementById('sp-lyrics-song-artist');
    const coverEl = document.getElementById('sp-lyrics-cover-img');
    const bgArtEl = document.getElementById('sp-lyrics-bg-art');
    const scrollBox = document.getElementById('sp-lyrics-scroll-box');
    const likeBtn = document.getElementById('sp-fs-like-btn');

    if (!scrollBox) return;

    if (!song) {
      scrollBox.innerHTML = `
        <div class="sp-lyrics-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <h3>No song is currently playing</h3>
          <p>Play a song to view real-time synchronized lyrics</p>
        </div>
      `;
      return;
    }

    const coverUrl = song.img || song.thumb || 'https://placehold.co/300x300/121212/1ed760?text=Music';
    if (titleEl) titleEl.textContent = song.title || 'Unknown Title';
    if (artistEl) artistEl.textContent = (song.artist || 'Unknown Artist') + (song.album ? ` • ${song.album}` : '');
    if (coverEl) coverEl.src = coverUrl;
    if (bgArtEl) bgArtEl.src = coverUrl;

    if (likeBtn && typeof state !== 'undefined') {
      if (state.likedSongs && state.likedSongs.includes(song.id)) {
        likeBtn.style.color = '#1ed760';
        likeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#1ed760"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      } else {
        likeBtn.style.color = 'rgba(255, 255, 255, 0.7)';
        likeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
      }
    }

    scrollBox.innerHTML = `
      <div class="sp-lyrics-loading-state">
        <div class="sp-lyrics-spinner"></div>
        <p>Searching synchronized lyrics...</p>
      </div>
    `;

    const lyricsData = await getLyrics(song);
    currentLyricsData = lyricsData;
    activeLineIndex = -1;

    if (!lyricsData || lyricsData.length === 0) {
      scrollBox.innerHTML = `
        <div class="sp-lyrics-empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          <h3>Looks like we don't have lyrics for this song yet</h3>
          <p>Sing along to your favorite tunes with Wave Music</p>
        </div>
      `;
      return;
    }

    const isPlain = lyricsData[0] && lyricsData[0].isPlain;

    scrollBox.innerHTML = lyricsData.map((line, idx) => `
      <div class="sp-lyric-line ${isPlain ? 'passed' : 'upcoming'}" onclick="seekToLyric(${line.startTimeMs}, ${isPlain})" data-time="${line.startTimeMs}" id="sp-lyric-line-${idx}">
        ${line.words}
      </div>
    `).join('');

    if (!isPlain) {
      onTimeUpdate();
    }
  }

  
  function _extractLyricsColor(imgUrl, callback) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 10;
        canvas.height = 10;
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i+3] < 128) continue;
          r += data[i]; g += data[i+1]; b += data[i+2]; count++;
        }
        if (count === 0) count = 1;
        
        r = Math.min(255, Math.round((r / count) * 0.75));
        g = Math.min(255, Math.round((g / count) * 0.75));
        b = Math.min(255, Math.round((b / count) * 0.75));
        callback(`rgb(${r}, ${g}, ${b})`);
      } catch (e) {
        callback('#5a2310');
      }
    };
    img.onerror = function() {
      callback('#5a2310');
    };
    img.src = imgUrl;
  }
  window._extractLyricsColor = _extractLyricsColor;
  window.extractLyricsColor = _extractLyricsColor;

  
  window.renderSongDetailLyricsCard = async function(song) {
    const container = document.getElementById('sp-song-page-lyrics-wrapper');
    if (!container || !song) return;

    const lyricsData = await getLyrics(song);
    if (!lyricsData || lyricsData.length === 0) {
      container.style.display = 'none';
      return;
    }

    const isPlain = lyricsData[0] && lyricsData[0].isPlain;
    container.style.display = 'block';
    container.innerHTML = `
      <div class="sp-song-lyrics-card" onclick="toggleLyricsView()">
        <div class="sp-song-lyrics-card-header">
          <div class="sp-song-lyrics-card-title">
            <svg data-encore-id="icon" role="img" aria-hidden="true" class="e-10750-icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M13.426 2.574a2.831 2.831 0 0 0-4.797 1.55l3.247 3.247a2.831 2.831 0 0 0 1.55-4.797M10.5 8.118l-2.619-2.62L4.74 9.075 2.065 12.12a1.287 1.287 0 0 0 1.816 1.816l3.06-2.688 3.56-3.129zM7.12 4.094a4.331 4.331 0 1 1 4.786 4.786l-3.974 3.493-3.06 2.689a2.787 2.787 0 0 1-3.933-3.933l2.676-3.045z"></path>
            </svg>
            Lyrics
          </div>
          <button class="sp-song-lyrics-fullscreen-btn" onclick="event.stopPropagation(); openLyricsModal()" title="Fullscreen Lyrics">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
          </button>
        </div>
        <div class="sp-song-lyrics-preview-lines" id="sp-song-page-lyrics-lines">
          ${lyricsData.slice(0, 15).map((line, idx) => `
            <p class="sp-page-lyric-line ${isPlain ? 'passed' : 'upcoming'}" onclick="event.stopPropagation(); seekToLyric(${line.startTimeMs}, ${isPlain})">
              ${line.words}
            </p>
          `).join('')}
        </div>
        <div class="sp-song-lyrics-card-footer">
          <span>${isPlain ? 'Tap to view full lyrics' : 'Click line to jump • Tap anywhere to view full page'}</span>
        </div>
      </div>
    `;

    currentLyricsData = lyricsData;
    if (!isPlain) {
      onTimeUpdate();
    }
  };

  
  window.WAVE_LYRICS = {
    init: initLyricsEngine,
    getLyrics,
    loadLyricsIntoModal,
    initLyricsPageView
  };

  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLyricsEngine);
  } else {
    initLyricsEngine();
  }
})();
