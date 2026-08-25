'use strict';

let isMobileNowPlayingOpen = false;

function toggleMobileNowPlaying(e) {
  if (e) {
    if (e.target.closest('button') && !e.target.closest('[title="Now Playing View"]')) return;
    if (e.target.closest('input') || e.target.closest('.progress-container') || e.target.closest('.vol-control') || e.target.closest('.mob-add-saved-btn') || e.target.closest('.mob-play-btn')) return;
    e.stopPropagation();
  }

  const card = document.getElementById('mobile-now-playing');
  if (!card) return;

  if (isMobileNowPlayingOpen) {
    closeMobileNowPlaying();
  } else {
    isMobileNowPlayingOpen = true;
    syncMobileNowPlaying();
    card.classList.add('open');
    document.body.classList.add('mnp-active');
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
  }
}

function closeMobileNowPlaying() {
  const card = document.getElementById('mobile-now-playing');
  if (!card) return;
  isMobileNowPlayingOpen = false;
  card.classList.remove('open');
  document.body.classList.remove('mnp-active');
  document.body.style.overflow = '';

  const mnpVideo = document.getElementById('mnp-bg-video');
  if (mnpVideo) mnpVideo.pause();
}

function syncMobileNowPlaying() {
  const song = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
    ? state.queue[state.currentIndex]
    : null;
  if (!song) return;

  const mnpArt = document.getElementById('mnp-art');
  const mnpTitle = document.getElementById('mnp-title');
  const mnpArtist = document.getElementById('mnp-artist');
  const headerSubtitle = document.getElementById('mnp-header-subtitle');
  const headerTitle = document.getElementById('mnp-header-title');

  const coverUrl = song.thumb || song.img || song.image || 'https://placehold.co/400x400/1a1a1a/a855f7?text=Music';

  if (mnpArt) mnpArt.src = coverUrl;
  if (mnpTitle) mnpTitle.textContent = song.title || 'Unknown Title';
  if (mnpArtist) mnpArtist.textContent = song.artist || 'Unknown Artist';

  if (headerSubtitle) {
    headerSubtitle.textContent = song.playlistName ? 'PLAYING FROM PLAYLIST' : (song.album ? 'PLAYING FROM ALBUM' : 'PLAYING FROM ARTIST');
  }
  if (headerTitle) {
    headerTitle.textContent = song.playlistName || song.album || song.artist || 'Wave Music';
  }

  
  updateDominantColor(coverUrl);

  syncMobileNowPlayingLike();
  syncMobileNowPlayingPlayState();
  syncMobileNowPlayingProgress();
  syncMnpRepeatState();
  syncMnpShuffleState();
  syncMnpMarquees();
  syncMobileNowPlayingLyrics(song);
  syncMobileNowPlayingCredits(song);
}

function syncMobileNowPlayingLike() {
  const song = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
    ? state.queue[state.currentIndex]
    : null;
  if (!song) return;

  const btn = document.getElementById('mnp-like-btn');
  if (!btn) return;

  const isSaved = (typeof isSongSavedAnywhere === 'function' ? isSongSavedAnywhere(song.id) : false) ||
    (state.likedSongs && state.likedSongs.includes(song.id));

  if (isSaved) {
    btn.classList.add('liked');
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="#1ed760"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`;
    btn.title = 'Saved to Your Library';
  } else {
    btn.classList.remove('liked');
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    btn.title = 'Save to Liked Songs';
  }
}

function syncMobileNowPlayingPlayState() {
  const isPlaying = typeof state !== 'undefined' && state.isPlaying;
  const playIco = document.getElementById('mnp-ico-play');
  const pauseIco = document.getElementById('mnp-ico-pause');

  if (playIco) playIco.style.display = isPlaying ? 'none' : 'block';
  if (pauseIco) pauseIco.style.display = isPlaying ? 'block' : 'none';

  const playBtn = document.getElementById('mnp-play-btn');
  if (playBtn) {
    playBtn.classList.toggle('playing', isPlaying);
  }
}

function syncMobileNowPlayingProgress() {
  if (typeof audio === 'undefined' || !audio || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const fill = document.getElementById('mnp-prog-fill');
  const thumb = document.getElementById('mnp-prog-thumb');
  const curTime = document.getElementById('mnp-cur-time');
  const totTime = document.getElementById('mnp-tot-time');

  if (fill) fill.style.width = pct + '%';
  if (thumb) thumb.style.right = (100 - pct) + '%';
  if (curTime) curTime.textContent = (typeof formatTime === 'function') ? formatTime(audio.currentTime) : '0:00';
  if (totTime) {
    const remaining = Math.max(0, audio.duration - audio.currentTime);
    totTime.textContent = '-' + ((typeof formatTime === 'function') ? formatTime(remaining) : '0:00');
  }

  
  syncMnpActiveLyric();
}

let currentMnpLyrics = null;
let currentMnpLyricSongId = null;

async function syncMobileNowPlayingLyrics(song) {
  const lyricsContainer = document.getElementById('mnp-lyrics-lines');
  const lyricsCard = document.getElementById('mnp-lyrics-card');
  if (!lyricsContainer || !song) return;

  const songId = song.id || song.title;
  if (currentMnpLyricSongId === songId && currentMnpLyrics) {
    syncMnpActiveLyric();
    return;
  }

  currentMnpLyricSongId = songId;
  lyricsContainer.innerHTML = '<p class="mnp-lyric-line active" style="opacity:0.7;">Loading lyrics...</p>';

  try {
    let lyricsData = null;
    if (window.WAVE_LYRICS && typeof window.WAVE_LYRICS.getLyrics === 'function') {
      lyricsData = await window.WAVE_LYRICS.getLyrics(song);
    }

    if (!lyricsData || lyricsData.length === 0) {
      currentMnpLyrics = null;
      lyricsContainer.innerHTML = '<p class="mnp-lyric-line" style="font-size:16px; opacity:0.85; font-weight:600;">Lyrics preview unavailable</p>';
      const showBtn = document.querySelector('.mnp-show-lyrics-btn');
      if (showBtn) showBtn.textContent = 'Check lyrics';
      return;
    }

    currentMnpLyrics = lyricsData;
    const showBtn = document.querySelector('.mnp-show-lyrics-btn');
    if (showBtn) showBtn.textContent = 'Show lyrics';

    const isPlain = lyricsData[0] && lyricsData[0].isPlain;
    lyricsContainer.innerHTML = lyricsData.slice(0, 20).map((line, idx) => `
      <p class="mnp-lyric-line ${idx === 0 ? 'active' : 'upcoming'}" data-index="${idx}" data-time="${line.startTimeMs}" onclick="event.stopPropagation(); seekToLyric(${line.startTimeMs}, ${isPlain})">
        ${line.words}
      </p>
    `).join('');

    syncMnpActiveLyric();
  } catch (err) {
    lyricsContainer.innerHTML = '<p class="mnp-lyric-line" style="font-size:16px; opacity:0.85;">Lyrics preview unavailable</p>';
  }
}

function syncMnpActiveLyric() {
  if (!currentMnpLyrics || typeof audio === 'undefined' || !audio) return;
  const curMs = audio.currentTime * 1000;
  const isPlain = currentMnpLyrics[0] && currentMnpLyrics[0].isPlain;
  if (isPlain) return;

  let activeIdx = -1;
  for (let i = 0; i < currentMnpLyrics.length; i++) {
    if (curMs >= currentMnpLyrics[i].startTimeMs) {
      activeIdx = i;
    } else {
      break;
    }
  }

  const lines = document.querySelectorAll('.mnp-lyric-line[data-index]');
  lines.forEach((el) => {
    const idx = parseInt(el.getAttribute('data-index'), 10);
    el.classList.remove('active', 'passed', 'upcoming');
    if (idx === activeIdx) {
      el.classList.add('active');
      const container = document.getElementById('mnp-lyrics-lines');
      if (container) {
        const topPos = el.offsetTop - container.offsetTop - 20;
        container.scrollTo({ top: Math.max(0, topPos), behavior: 'smooth' });
      }
    } else if (idx < activeIdx) {
      el.classList.add('passed');
    } else {
      el.classList.add('upcoming');
    }
  });
}

function syncMobileNowPlayingCredits(song) {
  const creditsList = document.getElementById('mnp-credits-list');
  if (!creditsList || !song) return;

  const artistRaw = song.artist || 'Wave Artist';
  const artists = artistRaw.split(/,\s*|\s+&\s+|\s+feat\.?\s+|\s+ft\.?\s+|\s+featuring\s+/i).map(a => a.trim()).filter(Boolean);
  const leadArtist = artists[0] || artistRaw;

  const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(leadArtist) : false;
  const leadEscaped = leadArtist.replace(/'/g, "\\'");

  let rowsHtml = `
    <div class="mnp-credit-row">
      <div class="mnp-credit-info">
        <span class="mnp-credit-name" onclick="navigateToArtistDirect('${leadEscaped}', event)" title="View ${leadArtist}">${leadArtist}</span>
        <span class="mnp-credit-role">Main Artist</span>
      </div>
      <button class="mnp-credit-follow-btn ${isFollowed ? 'following' : ''}" onclick="toggleFollowFromSidebar(event, '${leadEscaped}')">${isFollowed ? 'Following' : 'Follow'}</button>
    </div>
  `;

  
  if (artists.length > 1) {
    for (let i = 1; i < artists.length; i++) {
      const artName = artists[i];
      const artFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(artName) : false;
      const artEscaped = artName.replace(/'/g, "\\'");
      rowsHtml += `
        <div class="mnp-credit-row">
          <div class="mnp-credit-info">
            <span class="mnp-credit-name" onclick="navigateToArtistDirect('${artEscaped}', event)" title="View ${artName}">${artName}</span>
            <span class="mnp-credit-role">Featured Artist</span>
          </div>
          <button class="mnp-credit-follow-btn ${artFollowed ? 'following' : ''}" onclick="toggleFollowFromSidebar(event, '${artEscaped}')">${artFollowed ? 'Following' : 'Follow'}</button>
        </div>
      `;
    }
  }

  
  const writers = song.writers || song.lyricist || song.composer || (song.album && song.album !== song.title ? song.album : null);
  if (writers) {
    rowsHtml += `
      <div class="mnp-credit-row">
        <div class="mnp-credit-info">
          <span class="mnp-credit-name">${writers}</span>
          <span class="mnp-credit-role">Composer • Lyricist</span>
        </div>
      </div>
    `;
  } else {
    rowsHtml += `
      <div class="mnp-credit-row">
        <div class="mnp-credit-info">
          <span class="mnp-credit-name">${leadArtist}</span>
          <span class="mnp-credit-role">Composer • Producer</span>
        </div>
      </div>
    `;
  }

  creditsList.innerHTML = rowsHtml;
}

function syncMnpRepeatState() {
  const btn = document.getElementById('mnp-repeat');
  if (btn) {
    btn.classList.toggle('active', !!(typeof state !== 'undefined' && state.isRepeat));
  }
}

function syncMnpShuffleState() {
  const btn = document.getElementById('mnp-shuffle');
  if (btn) {
    btn.classList.toggle('active', !!(typeof state !== 'undefined' && state.isShuffle));
  }
}

function openMobileQueue() {
  const pageEl = document.getElementById('mobile-queue-page');
  if (!pageEl) return;
  pageEl.classList.add('open');
  renderMobileQueueList();
}
window.openMobileQueue = openMobileQueue;

function closeMobileQueue() {
  const pageEl = document.getElementById('mobile-queue-page');
  if (!pageEl) return;
  pageEl.classList.remove('open');
}
window.closeMobileQueue = closeMobileQueue;

function toggleMobileQueue() {
  const pageEl = document.getElementById('mobile-queue-page');
  if (pageEl && pageEl.classList.contains('open')) {
    closeMobileQueue();
  } else {
    openMobileQueue();
  }
}
window.toggleMobileQueue = toggleMobileQueue;

function renderMobileQueueList() {
  const queuePage = document.getElementById('mobile-queue-page');
  if (!queuePage) return;

  const curSong = state.queue && state.queue[state.currentIndex];
  const npThumb = document.getElementById('mob-queue-np-thumb');
  const npTitle = document.getElementById('mob-queue-np-title');
  const npArtist = document.getElementById('mob-queue-np-artist');
  const subtitleEl = document.getElementById('mob-queue-subtitle');
  const secTitle = document.getElementById('mob-queue-sec-title');
  const listEl = document.getElementById('mob-queue-list');
  const shuffleBtn = document.getElementById('mob-q-shuffle-btn');

  if (curSong) {
    if (npThumb) npThumb.src = curSong.thumb || curSong.img || 'https://placehold.co/100x100/121212/1ed760?text=Music';
    if (npTitle) npTitle.textContent = curSong.title || 'Unknown Title';
    if (npArtist) npArtist.textContent = curSong.artist || 'Unknown Artist';
    if (subtitleEl) {
      const sourceName = curSong.playlistName || curSong.album || curSong.artist || 'Wave Music';
      subtitleEl.textContent = `Playing ${sourceName}`;
    }
  }

  if (secTitle) {
    secTitle.textContent = state.isShuffle ? 'Shuffling from:' : 'Next in queue:';
  }

  if (shuffleBtn) {
    shuffleBtn.classList.toggle('active', !!state.isShuffle);
  }

  const qPlay = document.getElementById('mob-q-ico-play');
  const qPause = document.getElementById('mob-q-ico-pause');
  if (qPlay && qPause) {
    qPlay.style.display = state.isPlaying ? 'none' : 'block';
    qPause.style.display = state.isPlaying ? 'block' : 'none';
  }

  if (!listEl) return;

  if (!state.queue || state.queue.length <= 1) {
    listEl.innerHTML = `
      <div style="padding: 36px 0; text-align: center; color: rgba(255,255,255,0.45); font-size: 14px; font-weight: 500;">
        No upcoming songs in queue.
      </div>
    `;
    return;
  }

  
  const upcoming = [];
  for (let i = state.currentIndex + 1; i < state.queue.length; i++) {
    upcoming.push({ song: state.queue[i], originalIndex: i });
  }
  
  if (upcoming.length === 0) {
    for (let i = 0; i < state.currentIndex; i++) {
      upcoming.push({ song: state.queue[i], originalIndex: i });
    }
  }

  listEl.innerHTML = upcoming.map(({ song, originalIndex }) => {
    const thumb = song.thumb || song.img || 'https://placehold.co/100x100/121212/1ed760?text=Music';
    const title = song.title || 'Unknown Title';
    const artist = song.artist || 'Unknown Artist';
    return `
      <div class="mob-queue-item" onclick="playSong(${originalIndex}); renderMobileQueueList();">
        <div class="mob-queue-item-left">
          <img src="${thumb}" alt="${title}" class="mob-queue-item-thumb" loading="lazy">
          <div class="mob-queue-item-info">
            <h4 class="mob-queue-item-title">${title}</h4>
            <div class="mob-queue-item-artist-wrap">
              <span class="mob-queue-item-badge">E</span>
              <span class="mob-queue-item-artist">${artist}</span>
            </div>
          </div>
        </div>
        <div class="mob-queue-item-drag">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="4" y1="12" x2="20" y2="12"></line>
            <line x1="4" y1="17" x2="20" y2="17"></line>
          </svg>
        </div>
      </div>
    `;
  }).join('');
}
window.renderMobileQueueList = renderMobileQueueList;

function toggleMnpMenu(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('mnp-menu-dropdown');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function handleMnpAddToPlaylist(e) {
  if (e) e.stopPropagation();
  toggleMnpMenu();
  const curSong = state.queue && state.queue[state.currentIndex];
  if (typeof openAddToPlaylistModal === 'function') {
    openAddToPlaylistModal(e, curSong);
  }
}

function handleMnpAddToLiked(e) {
  if (e) e.stopPropagation();
  toggleMnpMenu();
  if (typeof toggleLike === 'function') toggleLike();
  syncMobileNowPlayingLike();
}

window.handleMnpShare = function(e) {
  if (e) e.stopPropagation();
  const song = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
    ? state.queue[state.currentIndex]
    : null;
  if (!song) return;

  if (navigator.share) {
    navigator.share({
      title: `${song.title} - ${song.artist}`,
      text: `Listen to "${song.title}" by ${song.artist} on Wave Music`,
      url: window.location.href
    }).catch(() => {});
  } else {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
      if (typeof showToast === 'function') {
        showToast('Link copied to clipboard!');
      }
    } catch (err) {}
  }
};

function syncMnpMarquees() {
  const titleContainer = document.querySelector('.mnp-title-scroll');
  const titleText = document.getElementById('mnp-title');
  const artistContainer = document.querySelector('.mnp-artist-scroll');
  const artistText = document.getElementById('mnp-artist');

  if (titleContainer && titleText) {
    titleText.classList.remove('scroll-active');
    titleText.style.removeProperty('--scroll-amount');

    setTimeout(() => {
      const diff = titleText.scrollWidth - titleContainer.clientWidth;
      if (diff > 0) {
        titleText.style.setProperty('--scroll-amount', `-${diff}px`);
        titleText.classList.add('scroll-active');
      }
    }, 100);
  }

  if (artistContainer && artistText) {
    artistText.classList.remove('scroll-active');
    artistText.style.removeProperty('--scroll-amount');

    setTimeout(() => {
      const diff = artistText.scrollWidth - artistContainer.clientWidth;
      if (diff > 0) {
        artistText.style.setProperty('--scroll-amount', `-${diff}px`);
        artistText.classList.add('scroll-active');
      }
    }, 100);
  }
}

function updateDominantColor(imgUrl) {
  const card = document.getElementById('mobile-now-playing');
  const lyricsCard = document.getElementById('mnp-lyrics-card');
  if (!card) return;

  const extractColorFn = (typeof window.extractLyricsColor === 'function')
    ? window.extractLyricsColor
    : (typeof window._extractLyricsColor === 'function' ? window._extractLyricsColor : null);

  const applyColor = function(color) {
    if (card) {
      card.style.setProperty('--mnp-bg-color', color);
      card.style.background = `linear-gradient(180deg, ${color} 0%, rgba(12, 12, 12, 0.98) 100%)`;
    }
    if (lyricsCard) {
      lyricsCard.style.setProperty('--mnp-lyrics-bg', color);
      const match = color.match(/\d+/g);
      if (match && match.length >= 3) {
        const r = parseInt(match[0], 10);
        const g = parseInt(match[1], 10);
        const b = parseInt(match[2], 10);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 80) {
          lyricsCard.classList.add('dark-theme');
        } else {
          lyricsCard.classList.remove('dark-theme');
        }
      }
    }
  };

  if (extractColorFn) {
    extractColorFn(imgUrl, applyColor);
  } else {
    applyColor('#3b4cca');
  }
}

document.addEventListener('click', (e) => {
  const container = document.querySelector('.mnp-menu-container');
  if (container && !container.contains(e.target)) {
    const dropdown = document.getElementById('mnp-menu-dropdown');
    if (dropdown) {
      dropdown.classList.remove('show');
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const handle = document.getElementById('mnp-drag-handle');
  if (handle) {
    handle.addEventListener('click', closeMobileNowPlaying);
  }

  let startY = 0;
  const card = document.getElementById('mobile-now-playing');
  if (card) {
    card.addEventListener('touchstart', (e) => {
      if (e.target.closest('.mnp-progress-wrap') || e.target.closest('.mnp-menu-container') || e.target.closest('.mnp-controls') || e.target.closest('.mnp-bottom-bar')) return;
      startY = e.touches[0].clientY;
    }, { passive: true });
    card.addEventListener('touchend', (e) => {
      if (!startY) return;
      const deltaY = e.changedTouches[0].clientY - startY;
      if (deltaY > 80) {
        closeMobileNowPlaying();
      }
      startY = 0;
    }, { passive: true });
  }

  const progTrack = document.getElementById('mnp-prog-track');
  if (progTrack) {
    progTrack.addEventListener('touchstart', seekTo, { passive: true });
    progTrack.addEventListener('touchmove', seekTo, { passive: true });
  }

  const artWrap = document.querySelector('.mnp-art-wrap');
  if (artWrap) {
    let startSwipeX = 0;
    let startSwipeY = 0;
    artWrap.addEventListener('touchstart', (e) => {
      startSwipeX = e.touches[0].clientX;
      startSwipeY = e.touches[0].clientY;
    }, { passive: true });

    artWrap.addEventListener('touchend', (e) => {
      if (!startSwipeX || !startSwipeY) return;
      const deltaX = e.changedTouches[0].clientX - startSwipeX;
      const deltaY = e.changedTouches[0].clientY - startSwipeY;

      if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY)) {
        const mnpArt = document.getElementById('mnp-art');
        if (deltaX < 0) {
          if (mnpArt) {
            mnpArt.style.transform = 'translateX(-80px) scale(0.95)';
            mnpArt.style.opacity = '0';
          }
          setTimeout(() => {
            if (typeof nextSong === 'function') nextSong();
            if (mnpArt) {
              mnpArt.style.transform = 'translateX(80px) scale(0.95)';
              setTimeout(() => {
                mnpArt.style.transform = 'translateX(0) scale(1)';
                mnpArt.style.opacity = '1';
              }, 50);
            }
          }, 180);
        } else {
          if (mnpArt) {
            mnpArt.style.transform = 'translateX(80px) scale(0.95)';
            mnpArt.style.opacity = '0';
          }
          setTimeout(() => {
            if (typeof prevSong === 'function') prevSong();
            if (mnpArt) {
              mnpArt.style.transform = 'translateX(-80px) scale(0.95)';
              setTimeout(() => {
                mnpArt.style.transform = 'translateX(0) scale(1)';
                mnpArt.style.opacity = '1';
              }, 50);
            }
          }, 180);
        }
      }
      startSwipeX = 0;
      startSwipeY = 0;
    }, { passive: true });
  }
});

const _origLoadSongUI = (typeof loadSongUI !== 'undefined') ? loadSongUI : (typeof window !== 'undefined' && window.loadSongUI ? window.loadSongUI : function(){});
window.loadSongUI = function(idx) {
  _origLoadSongUI(idx);
  if (isMobileNowPlayingOpen) {
    syncMobileNowPlaying();
  } else {
    const song = state.queue[idx];
    if (!song) return;
    const mnpArt = document.getElementById('mnp-art');
    const mnpTitle = document.getElementById('mnp-title');
    const mnpArtist = document.getElementById('mnp-artist');
    if (mnpArt) mnpArt.src = song.thumb || song.img || 'https://placehold.co/400x400/1a1a1a/a855f7?text=Music';
    if (mnpTitle) mnpTitle.textContent = song.title || 'Unknown';
    if (mnpArtist) mnpArtist.textContent = song.artist || 'Unknown';
    syncMnpMarquees();
  }
};

const _origUpdatePlayButtonUI = (typeof updatePlayButtonUI !== 'undefined') ? updatePlayButtonUI : (typeof window !== 'undefined' && window.updatePlayButtonUI ? window.updatePlayButtonUI : function(){});
window.updatePlayButtonUI = function() {
  _origUpdatePlayButtonUI();
  syncMobileNowPlayingPlayState();
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof audio !== 'undefined' && audio) {
      audio.addEventListener('timeupdate', syncMobileNowPlayingProgress);
      audio.addEventListener('loadedmetadata', () => {
        const totTime = document.getElementById('mnp-tot-time');
        if (totTime && audio.duration) totTime.textContent = '-' + formatTime(audio.duration || 0);
      });
    }
  }, 500);
});

