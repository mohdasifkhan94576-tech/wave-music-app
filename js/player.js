'use strict';

let _lastRecSongId = null;

function normalizeTitleForDedupe(title) {
  if (!title) return '';
  return title.toLowerCase()
    .replace(/\(from\s+[^)]+\)/gi, '')
    .replace(/\(original[^)]*\)/gi, '')
    .replace(/\(soundtrack[^)]*\)/gi, '')
    .replace(/\(feat\.?[^)]+\)/gi, '')
    .replace(/\(ft\.?[^)]+\)/gi, '')
    .replace(/\(reprise[^)]*\)/gi, '')
    .replace(/\(lo-?fi[^)]*\)/gi, '')
    .replace(/\(remix[^)]*\)/gi, '')
    .replace(/\(unplugged[^)]*\)/gi, '')
    .replace(/\(acoustic[^)]*\)/gi, '')
    .replace(/\(slowed[^)]*\)/gi, '')
    .replace(/\(reverb[^)]*\)/gi, '')
    .replace(/\(cover[^)]*\)/gi, '')
    .replace(/\(live[^)]*\)/gi, '')
    .replace(/\(film version[^)]*\)/gi, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/-\s*(from|lofi|remix|slowed|reverb|unplugged|acoustic|cover|live|film|version).*$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

const MOOD_PROFILES = {
  romantic: {
    keywords: ['love', 'pyaar', 'pyar', 'ishq', 'ishk', 'dil', 'dilbar', 'mohabbat', 'sanam', 'jaan', 'jaana', 'jaaniya',
               'tum', 'tera', 'teri', 'tere', 'meri', 'mere', 'mera', 'sajan', 'saathi', 'piya', 'raabta', 'raanjha',
               'habibi', 'humsafar', 'naina', 'nazm', 'kaise', 'romantic', 'romance', 'chahun', 'chand', 'raat',
               'gehra', 'deep', 'dreamy', 'saiyaara', 'saiyaan', 'sun', 'sunn', 'soneya', 'mahiya', 'lamha', 'pal'],
    searchQueries: (lang, artist) => [
      `${lang} romantic songs`,
      `${lang} love songs hits`,
      `${artist} romantic songs`,
    ]
  },
  sad: {
    keywords: ['sad', 'dard', 'bewafa', 'judai', 'alvida', 'tanha', 'tanhai', 'akela', 'rona', 'aansoo', 'aansu',
               'toot', 'toota', 'tooti', 'broken', 'hurt', 'pain', 'dukh', 'gham', 'zakhm', 'roya', 'roye',
               'kho', 'khoya', 'bichhad', 'judaai', 'rulaaye', 'tadap', 'intezaar', 'yaad', 'yaadein'],
    searchQueries: (lang, artist) => [
      `${lang} sad songs`,
      `${lang} heartbreak songs`,
      `${artist} sad songs`,
    ]
  },
  party: {
    keywords: ['party', 'dance', 'club', 'dj', 'beats', 'bass', 'drop', 'naacho', 'nachle', 'nach', 'paagal',
               'pagal', 'crazy', 'swag', 'patake', 'balle', 'bhangra', 'garba', 'dhol', 'dhamaal', 'masti',
               'daaru', 'drink', 'sharabi', 'peene', 'hookah', 'jaam', 'celebration', 'vibe'],
    searchQueries: (lang, artist) => [
      `${lang} party songs`,
      `${lang} dance songs hits`,
      `${lang} upbeat hits`,
    ]
  },
  devotional: {
    keywords: ['bhajan', 'aarti', 'mantra', 'shiv', 'krishna', 'ram', 'ganesh', 'hanuman', 'devi', 'mata',
               'bhakti', 'pooja', 'prayer', 'god', 'spiritual', 'om', 'sai', 'durga', 'temple'],
    searchQueries: (lang, artist) => [
      `${lang} bhajan`,
      `${lang} devotional songs`,
      `${lang} spiritual songs`,
    ]
  },
  chill: {
    keywords: ['chill', 'relax', 'soothing', 'calm', 'peaceful', 'soft', 'acoustic', 'unplugged', 'sukoon',
               'chain', 'neend', 'sapna', 'sapne', 'khwaab', 'khamoshi', 'silence', 'whisper'],
    searchQueries: (lang, artist) => [
      `${lang} chill songs`,
      `${lang} soft romantic songs`,
      `${lang} acoustic songs`,
    ]
  },
  motivational: {
    keywords: ['motivation', 'power', 'winner', 'champion', 'fight', 'rise', 'strong', 'ziddi', 'hosla',
               'himmat', 'josh', 'junoon', 'azaadi', 'freedom', 'kar', 'desh', 'vatan', 'india', 'army'],
    searchQueries: (lang, artist) => [
      `${lang} motivational songs`,
      `${lang} inspirational songs`,
      `${lang} power songs`,
    ]
  }
};

function detectSongMood(song) {
  const text = `${song.title || ''} ${song.album || ''} ${song.artist || ''}`.toLowerCase();

  let bestMood = 'romantic';
  let bestScore = 0;

  for (const [mood, profile] of Object.entries(MOOD_PROFILES)) {
    let score = 0;
    for (const kw of profile.keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMood = mood;
    }
  }

  return bestMood;
}

async function triggerSmartRecommendations(song) {
  if (!song) return;
  if (_lastRecSongId === song.id) return; 
  _lastRecSongId = song.id;

  const artistName = (song.artist || '').split(',')[0].trim();
  const allArtists = (song.artist || '').split(',').map(a => a.trim()).filter(a => a && a !== 'Unknown');
  const songTitle  = song.title || '';
  const playingNormTitle = normalizeTitleForDedupe(songTitle);
  const lang = song.language && song.language !== 'unknown' ? song.language : 'Hindi';
  const albumName = (song.album && typeof song.album === 'string' && song.album.length > 2) ? song.album : '';

  _injectRecSkeleton('rec-artist-section', `More from ${artistName}`);
  _injectRecSkeleton('rec-genre-section',  `Because you played "${songTitle}"`);

  const seenNormTitles = new Set();
  const seenIds = new Set([song.id]);
  if (playingNormTitle) seenNormTitles.add(playingNormTitle);

  const isDuplicate = (cand) => {
    if (!cand || !cand.audioUrl || seenIds.has(cand.id)) return true;
    const norm = normalizeTitleForDedupe(cand.title);
    if (norm && seenNormTitles.has(norm)) return true;
    return false;
  };

  const markSeen = (cand) => {
    seenIds.add(cand.id);
    const norm = normalizeTitleForDedupe(cand.title);
    if (norm) seenNormTitles.add(norm);
  };

  const passesQuality = (cand) => {
    if (!cand || !cand.audioUrl) return false;
    if (cand.secs && cand.secs < 60 && (!song.secs || song.secs >= 60)) return false;
    const tl = (cand.title || '').toLowerCase();
    if (tl.includes('ringtone') || tl.includes('promo') || tl.includes('teaser') || tl.includes('dialogues')) return false;
    if (cand.language && lang && cand.language.toLowerCase() !== lang.toLowerCase()) return false;
    return true;
  };

  const artistResults = [];
  try {
    const artistSongs = await JIOSAAVN_API.searchSongs(`${artistName}`, 20);
    for (const s of artistSongs) {
      if (artistResults.length >= 10) break;
      if (isDuplicate(s) || !passesQuality(s)) continue;
      markSeen(s);
      artistResults.push(s);
    }
  } catch (e) {
    console.warn('Artist search failed:', e);
  }

  const genreResults = [];
  const TARGET = 10;

  const addCandidate = (cand) => {
    if (genreResults.length >= TARGET) return false;
    if (isDuplicate(cand) || !passesQuality(cand)) return false;
    markSeen(cand);
    genreResults.push(cand);
    return true;
  };

  const buildSongSpecificQueries = () => {
    const queries = [];

    const cleanTitle = songTitle
      .replace(/\(from\s+[^)]+\)/gi, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/-\s*(from|lofi|remix|slowed).*$/gi, '')
      .trim();

    if (cleanTitle.length > 2) {
      queries.push(`${cleanTitle} ${artistName}`);
    }

    if (albumName) {
      queries.push(`${albumName} songs`);
    }

    if (allArtists.length > 1) {
      queries.push(`${allArtists[1]} songs`);
    } else {
      queries.push(`${artistName} ${lang} hits`);
    }

    const detectedMood = detectSongMood(song);
    const moodTerms = {
      romantic: 'romantic love',
      sad: 'sad heartbreak',
      party: 'party dance',
      devotional: 'devotional bhajan',
      chill: 'chill acoustic',
      motivational: 'motivational power',
    };
    const moodTerm = moodTerms[detectedMood] || 'romantic';
    queries.push(`${lang} ${moodTerm} ${artistName}`);

    return queries;
  };

  try {
    const directSuggestions = await JIOSAAVN_API.getSongSuggestions(song.id, 25);
    for (const cand of directSuggestions) {
      if (genreResults.length >= TARGET) break;
      addCandidate(cand);
    }
  } catch (e) {}

  if (genreResults.length < TARGET) {
    const songQueries = buildSongSpecificQueries();

    const queryResults = await Promise.allSettled(
      songQueries.map(q => JIOSAAVN_API.searchSongs(q, 15))
    );

    const allBuckets = queryResults
      .filter(r => r.status === 'fulfilled' && Array.isArray(r.value))
      .map(r => r.value);

    let idx = 0;
    let anyAdded = true;
    while (genreResults.length < TARGET && anyAdded) {
      anyAdded = false;
      for (const bucket of allBuckets) {
        if (genreResults.length >= TARGET) break;
        if (idx < bucket.length) {
          anyAdded = true;
          addCandidate(bucket[idx]);
        }
      }
      idx++;
    }
  }

  [...artistResults, ...genreResults].forEach(s => {
    if (!SONGS.find(x => x.id === s.id)) SONGS.push(s);
  });

  _renderRecSection('rec-artist-section', `More from ${artistName}`, artistResults, '');
  _renderRecSection('rec-genre-section',  `Because you played "${songTitle}"`, genreResults, '');
}

function _injectRecSkeleton(containerId, title) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="section-block rec-section">
      <div class="section-header">
        <h2 class="rec-title-animated">${title}</h2>
        <span style="font-size:11px; color:#1db954; font-weight:600; display:flex; align-items:center; gap:5px;">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          JioSaavn Live
        </span>
      </div>
      <div class="cards-container">
        ${Array(6).fill(0).map(() => `
          <div class="music-card rec-skeleton">
            <div class="rec-skel-img"></div>
            <div class="rec-skel-line" style="width:80%; margin-top:12px;"></div>
            <div class="rec-skel-line" style="width:55%; margin-top:6px;"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function _renderRecSection(containerId, title, songs, icon) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!songs || songs.length === 0) {
    el.innerHTML = '';
    return;
  }

  const cards = songs.map(song => `
    <div class="music-card rec-card" onclick="playJioSaavnSong(SONGS.find(s=>s.id==='${song.id}'))">
      <div class="card-img-wrap">
        <img src="${song.img || song.thumb}" alt="${song.title || 'Song Cover'}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Music';">
        <div class="card-overlay">
          <button class="card-play-btn" aria-label="Play ${song.title ? song.title.replace(/"/g, '&quot;') : 'Song'}" onclick="event.stopPropagation(); playJioSaavnSong(SONGS.find(s=>s.id==='${song.id}'))">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#1db954,#1ed760); padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; color:#000; letter-spacing:0.5px;">HD</div>
      </div>
      <div class="card-info">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>
    </div>
  `).join('');

  el.innerHTML = `
    <div class="section-block rec-section rec-section-in">
      <div class="section-header">
        <h2>${icon} ${title}</h2>
        <span style="font-size:11px; color:#1db954; font-weight:600; display:flex; align-items:center; gap:5px;">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          JioSaavn Live
        </span>
      </div>
      <div class="cards-container">${cards}</div>
    </div>
  `;
}

function initAudio() {
  audio = document.getElementById('audio-el');
  if (!audio) {
    audio = new Audio();
    audio.id = 'audio-el';
  }
  window.audio = audio;
  audio.volume = 0.7;
  if (window.SmartAudio) window.SmartAudio.initCrossfade(audio);
  audio.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayButtonUI();
    syncEqualizer();
  });

  audio.addEventListener('playing', () => {
    state.isPlaying = true;
    updatePlayButtonUI();
    syncEqualizer();
    const currentSong = state.queue[state.currentIndex];
    if (currentSong) {
      const playerTitle = document.getElementById('pl-title');
      if (playerTitle) playerTitle.textContent = currentSong.title;
      showNowPlayingIsland(currentSong);
      syncBottomPlayerMarquee();
    }
    if (window.MiniPlayer) window.MiniPlayer.update();
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayButtonUI();
    syncEqualizer();
    if (window.MiniPlayer) window.MiniPlayer.update();
  });

  audio.addEventListener('waiting', () => {
    const currentSong = state.queue[state.currentIndex];
    if (currentSong) {
      const playerTitle = document.getElementById('pl-title');
      if (playerTitle) playerTitle.textContent = currentSong.title + ' — Buffering...';
    }
  });

  audio.addEventListener('error', () => {
    const currentSong = state.queue[state.currentIndex];
    if (currentSong) {
      const playerTitle = document.getElementById('pl-title');
      if (playerTitle) playerTitle.textContent = currentSong.title;
      showDynamicIsland('Audio stream failed to load', 'warning', 4000);
    }
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    const fill = document.getElementById('prog-fill');
    const thumb = document.getElementById('prog-thumb');
    const curTime = document.getElementById('cur-time');
    if (fill) fill.style.width = pct + '%';
    if (thumb) thumb.style.right = (100 - pct) + '%';
    if (curTime) curTime.textContent = formatTime(audio.currentTime);
    const bp = document.getElementById('bottom-player-bar');
    if (bp) bp.style.setProperty('--player-progress-pct', pct + '%');
    if (typeof syncDiProgress === 'function') syncDiProgress();

    
    const fsFill = document.getElementById('sp-fs-prog-fill');
    const fsCurTime = document.getElementById('sp-fs-cur-time');
    const fsTotTime = document.getElementById('sp-fs-tot-time');
    if (fsFill) fsFill.style.width = pct + '%';
    if (fsCurTime) fsCurTime.textContent = formatTime(audio.currentTime);
    if (fsTotTime) {
      const remainingSecs = Math.max(0, audio.duration - audio.currentTime);
      fsTotTime.textContent = '-' + formatTime(remainingSecs);
    }

    
    if (window.MiniPlayer) window.MiniPlayer.update();

    
    if (typeof syncMobileNowPlayingProgress === 'function') syncMobileNowPlayingProgress();
    if (typeof syncMobileLyricsProgress === 'function') syncMobileLyricsProgress();
  });

  audio.addEventListener('loadedmetadata', () => {
    const totTime = document.getElementById('tot-time');
    if (totTime) totTime.textContent = formatTime(audio.duration || 0);
    const fsTotTime = document.getElementById('sp-fs-tot-time');
    if (fsTotTime) fsTotTime.textContent = '-' + formatTime(audio.duration || 0);
    if (window.MiniPlayer) window.MiniPlayer.update();
    if (typeof syncMobileNowPlayingProgress === 'function') syncMobileNowPlayingProgress();
    if (typeof syncMobileLyricsProgress === 'function') syncMobileLyricsProgress();
  });

  audio.addEventListener('ended', () => {
    if (state.isRepeat) {
      audio.currentTime = 0; audio.play().catch(() => {});
    } else {
      nextSong();
    }
  });

  if (state.queue.length > 0 && state.queue[state.currentIndex]) {
    const resumeSong = state.queue[state.currentIndex];
    loadSongUI(state.currentIndex);

    if (resumeSong.audioUrl) {
      setAudioSourceWithBlobMasking(resumeSong.audioUrl, false);
    }

    if (state._resumeProgress && state._resumeProgress > 0) {
      audio.addEventListener('loadedmetadata', function resumeSeek() {
        if (state._resumeProgress < audio.duration) {
          audio.currentTime = state._resumeProgress;
        }
        delete state._resumeProgress;
        audio.removeEventListener('loadedmetadata', resumeSeek);
      }, { once: true });
    }

    state.currentPlayingSongId = resumeSong.id;
    renderQueuePanel();
  } else {
    loadSongUI(0);
  }
}

function loadSongUI(idx) {
  const song = state.queue[idx];
  if (!song) return;
  const plTitle = document.getElementById('pl-title');
  const plArtist = document.getElementById('pl-artist');
  const plThumb = document.getElementById('pl-thumb');
  if (plTitle) plTitle.textContent = song.title;
  if (plArtist) plArtist.textContent = song.artist;
  if (plThumb) plThumb.src = song.thumb;

  
  syncBottomPlayerMarquee();

  
  updatePlayerAddToPlaylistButtonUI(song);
  updateMobileBottomSavedButtonUI(song);
  updateBottomPlayerDynamicColor(song);

  
  
  const rsTitleWrap = document.getElementById('rs-title-marquee-wrap');
  const rsTitle = document.getElementById('rs-song-title');
  if (rsTitleWrap && rsTitle) {
    rsTitle.textContent = song.title;
    rsTitle.title = `Play ${song.title}`;
    rsTitle.classList.remove('is-animating');
    void rsTitle.offsetWidth; 
    
    setTimeout(() => {
      const diff = rsTitle.scrollWidth - rsTitleWrap.clientWidth;
      if (diff > 4) {
        rsTitle.style.setProperty('--marquee-scroll-dist', `-${diff + 20}px`);
        rsTitle.classList.add('is-animating');
      }
    }, 100);
  }

 
  const rsArtistWrap = document.getElementById('rs-artist-marquee-wrap');
  const rsArtistScroll = document.getElementById('rs-artist-names-scroll');
  const artistRaw = song.artist || 'Wave Artist';
  const artistList = artistRaw.split(/,\s*|\s+&\s+|\s+feat\.?\s+|\s+ft\.?\s+|\s+featuring\s+/i)
    .map(a => a.trim())
    .filter(Boolean);
  const displayArtists = artistList.length > 0 ? artistList : [artistRaw.trim()];

  if (rsArtistWrap && rsArtistScroll) {
    rsArtistScroll.innerHTML = displayArtists.map((artName, i) => {
      const isLast = i === displayArtists.length - 1;
      const escaped = artName.replace(/'/g, "\\'");
      return `<span class="rs-artist-link" onclick="navigateToArtistDirect('${escaped}', event)" title="Go to ${artName}">${artName}</span>${isLast ? '' : '<span class="rs-artist-sep">, </span>'}`;
    }).join('');

    rsArtistScroll.classList.remove('is-animating');
    void rsArtistScroll.offsetWidth; 

    setTimeout(() => {
      const diff = rsArtistScroll.scrollWidth - rsArtistWrap.clientWidth;
      if (diff > 4) {
        rsArtistScroll.style.setProperty('--marquee-scroll-dist', `-${diff + 20}px`);
        rsArtistScroll.classList.add('is-animating');
      }
    }, 100);
  }

  const rsCover = document.getElementById('rs-cover-img');
  if (rsCover) rsCover.src = song.img || song.thumb;

  const leadArtist = displayArtists[0] || (song.artist || 'Artist').split(',')[0].trim();
  
  
  triggerRightSidebarHeaderMarquee(song.title);

  
  const rsLikeBtn = document.getElementById('rs-like-btn');
  if (rsLikeBtn) {
    const isLiked = state.likedSongs && state.likedSongs.includes(song.id);
    rsLikeBtn.classList.toggle('liked', isLiked);
    rsLikeBtn.title = isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs';
  }

  
  const rsCreditsList = document.getElementById('rs-credits-list');
  if (rsCreditsList) {
    if (displayArtists && displayArtists.length > 0) {
      rsCreditsList.innerHTML = displayArtists.map((artName, i) => {
        const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(artName) : false;
        const escaped = artName.replace(/'/g, "\\'");
        const roleText = 'Main Artist';
        return `
          <div class="rs-credit-artist-row">
            <div class="rs-credit-artist-info">
              <span class="rs-credit-artist-name" onclick="navigateToArtistDirect('${escaped}', event)" title="Go to ${artName}">${artName}</span>
              <span class="rs-credit-artist-role">${roleText}</span>
            </div>
            <button class="rs-follow-pill-btn ${isFollowed ? 'following' : ''}" onclick="toggleFollowFromSidebar(event, '${escaped}')">${isFollowed ? 'Following' : 'Follow'}</button>
          </div>
        `;
      }).join('');
    } else {
      const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(leadArtist) : false;
      const escaped = leadArtist.replace(/'/g, "\\'");
      rsCreditsList.innerHTML = `
        <div class="rs-credit-artist-row">
          <div class="rs-credit-artist-info">
            <span class="rs-credit-artist-name" onclick="navigateToArtistDirect('${escaped}', event)" title="Go to ${leadArtist}">${leadArtist}</span>
            <span class="rs-credit-artist-role">Main Artist</span>
          </div>
          <button class="rs-follow-pill-btn ${isFollowed ? 'following' : ''}" onclick="toggleFollowFromSidebar(event, '${escaped}')">${isFollowed ? 'Following' : 'Follow'}</button>
        </div>
      `;
    }
  }

    
    const aboutName = document.getElementById('rs-about-name');
    const aboutHeroImg = document.getElementById('rs-about-hero-img') || document.getElementById('rs-about-avatar');
    const aboutListeners = document.getElementById('rs-about-listeners');
    const aboutBio = document.getElementById('rs-about-bio');
    const aboutFollowBtn = document.getElementById('rs-about-follow-btn');
    const aboutSocials = document.getElementById('rs-about-socials');

    if (aboutName) aboutName.textContent = leadArtist;

    
    const lowerLead = leadArtist.toLowerCase();
    const matchedArt = (typeof ARTISTS !== 'undefined') ? ARTISTS.find(a => 
      a.name.toLowerCase() === lowerLead || 
      a.id.toLowerCase() === lowerLead || 
      lowerLead.includes(a.name.toLowerCase()) || 
      a.name.toLowerCase().includes(lowerLead)
    ) : null;
    const cachedArt = (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') ? RESOLVED_ARTISTS_CACHE.get(lowerLead) : null;
    let realArtImg = (matchedArt && matchedArt.img && !matchedArt.img.includes('placeholder')) 
      ? matchedArt.img 
      : (cachedArt && cachedArt.img && !cachedArt.img.includes('placeholder') && !cachedArt.img.includes('unsplash') ? cachedArt.img : '');

    if (realArtImg) {
      if (aboutHeroImg) aboutHeroImg.src = realArtImg;
    } else {
      if (aboutHeroImg) {
        aboutHeroImg.src = (typeof window.getArtistFallbackImage === 'function') 
          ? window.getArtistFallbackImage(leadArtist, 800) 
          : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800';
      }
      if (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getArtistData) {
        SPOTIFY_API.getArtistData(leadArtist).then(res => {
          if (res && res.img && !res.img.includes('placeholder')) {
            if (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') {
              RESOLVED_ARTISTS_CACHE.set(lowerLead, { img: res.img, name: leadArtist });
            }
            if (aboutHeroImg) aboutHeroImg.src = res.img;
          }
        }).catch(() => {});
      }
    }

    if (aboutListeners) {
      const artData = (typeof getFollowedArtistData === 'function') ? getFollowedArtistData(leadArtist) : null;
      let rawL = (matchedArt && matchedArt.listeners) || (artData?.listeners ? String(artData.listeners).replace(/monthly\s*listeners/i, '').trim() : '8,125,444');
      if (!rawL.includes(',') && !isNaN(parseInt(rawL.replace(/\D/g, '')))) {
        const num = parseInt(rawL.replace(/\D/g, ''));
        if (num > 0) rawL = num.toLocaleString();
      }
      aboutListeners.textContent = `${rawL} monthly listeners`;
    }

    if (aboutFollowBtn) {
      const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(leadArtist) : false;
      aboutFollowBtn.textContent = isFollowed ? 'Following' : 'Follow';
      aboutFollowBtn.classList.toggle('following', isFollowed);
    }

    if (aboutBio) {
      const artDesc = matchedArt?.description || `${leadArtist} is an acclaimed pop and playback artist with a dedicated global audience, delivering chart-topping anthems and heartfelt melodies.`;
      aboutBio.textContent = artDesc;
    }

    if (aboutSocials) {
      const cleanSlug = leadArtist.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const fbName = leadArtist.replace(/[^a-zA-Z0-9]/g, '');
      aboutSocials.innerHTML = `
        <a href="https://www.instagram.com/${cleanSlug}" target="_blank" rel="noopener" class="rs-social-link">https://www.instagram.com/${cleanSlug}</a>
        <a href="https://www.facebook.com/${fbName}" target="_blank" rel="noopener" class="rs-social-link">https://www.facebook.com/${fbName}</a>
      `;
    }

    
    if (typeof updateRightSidebarDynamicColor === 'function') {
      updateRightSidebarDynamicColor(song);
    }

    
    const rsQueueCard = document.getElementById('rs-queue-card');
    if (rsQueueCard && state.queue && state.queue.length > 1) {
      const nextIdx = (idx + 1) % state.queue.length;
      const nextSong = state.queue[nextIdx];
      if (nextSong) {
        rsQueueCard.style.display = 'block';
        const rsNextThumb = document.getElementById('rs-next-thumb');
        if (rsNextThumb) rsNextThumb.src = nextSong.img || nextSong.thumb || 'https://placehold.co/100x100/121212/1ed760?text=Music';
        const rsNextTitle = document.getElementById('rs-next-title');
        if (rsNextTitle) rsNextTitle.textContent = nextSong.title || 'Next Song';
        const rsNextArtist = document.getElementById('rs-next-artist');
        if (rsNextArtist) rsNextArtist.textContent = nextSong.artist || 'Artist';
      }
    }

  const miniTitle = document.getElementById('mini-title');
  if (miniTitle) {
    document.getElementById('mini-title').textContent = song.title;
    document.getElementById('mini-artist').textContent = song.artist;
    document.getElementById('mini-thumb').src = song.thumb;
  }

  const likeBtn = document.getElementById('like-btn');
  if (likeBtn) {
    if (state.likedSongs.includes(song.id)) {
      likeBtn.classList.add('liked');
    } else {
      likeBtn.classList.remove('liked');
    }
  }

  
  const lyricsModal = document.getElementById('sp-lyrics-modal');
  if (lyricsModal && lyricsModal.classList.contains('active') && typeof WAVE_LYRICS !== 'undefined') {
    WAVE_LYRICS.loadLyricsIntoModal(song);
  }

  
  if (typeof state !== 'undefined' && state.currentView === 'lyrics' && typeof initLyricsPageView === 'function') {
    initLyricsPageView();
  }

  
  const mobLyricsPage = document.getElementById('mobile-lyrics-page');
  if (mobLyricsPage && mobLyricsPage.classList.contains('open') && typeof openMobileLyricsPage === 'function') {
    openMobileLyricsPage(song);
  }

  
  const queuePanel = document.getElementById('queue-panel');
  if (queuePanel && queuePanel.classList.contains('open') && typeof renderQueuePanel === 'function') {
    renderQueuePanel();
  }

  
  const mobQueuePage = document.getElementById('mobile-queue-page');
  if (mobQueuePage && mobQueuePage.classList.contains('open') && typeof renderMobileQueueList === 'function') {
    renderMobileQueueList();
  }

  
  renderSidebarQueue();
}

function syncBottomPlayerMarquee() {
  const plTitleWrap = document.getElementById('pl-title-wrap');
  const plTitle = document.getElementById('pl-title');
  if (plTitleWrap && plTitle) {
    plTitle.classList.remove('is-animating');
    void plTitle.offsetWidth; 
    setTimeout(() => {
      const diff = plTitle.scrollWidth - plTitleWrap.clientWidth;
      if (diff > 4) {
        plTitle.style.setProperty('--pl-marquee-scroll-dist', `-${diff + 16}px`);
        plTitle.classList.add('is-animating');
      }
    }, 100);
  }

  const plArtistWrap = document.getElementById('pl-artist-wrap');
  const plArtist = document.getElementById('pl-artist');
  if (plArtistWrap && plArtist) {
    plArtist.classList.remove('is-animating');
    void plArtist.offsetWidth; 
    setTimeout(() => {
      const diff = plArtist.scrollWidth - plArtistWrap.clientWidth;
      if (diff > 4) {
        plArtist.style.setProperty('--pl-marquee-scroll-dist', `-${diff + 16}px`);
        plArtist.classList.add('is-animating');
      }
    }, 100);
  }
}
window.syncBottomPlayerMarquee = syncBottomPlayerMarquee;

function isSongInAnyUserPlaylist(songId) {
  if (!songId) {
    const cur = state.queue && state.queue[state.currentIndex];
    if (!cur) return false;
    songId = cur.id;
  }
  const userPlaylists = [
    ...(state.userPlaylists || []),
    ...(state.customPlaylists || []),
    ...(state.playlists || [])
  ];
  const sIdStr = String(songId);
  return userPlaylists.some(pl => {
    if (!pl.songs || !Array.isArray(pl.songs)) return false;
    return pl.songs.some(s => {
      const id = (typeof s === 'object' && s !== null) ? s.id : s;
      return String(id) === sIdStr;
    });
  });
}
window.isSongInAnyUserPlaylist = isSongInAnyUserPlaylist;

function isSongSavedAnywhere(songId) {
  if (!songId) {
    const cur = state.queue && state.queue[state.currentIndex];
    if (!cur) return false;
    songId = cur.id;
  }
  const sIdStr = String(songId);
  const isLiked = state.likedSongs && state.likedSongs.some(id => String(id) === sIdStr);
  if (isLiked) return true;

  return isSongInAnyUserPlaylist(sIdStr);
}
window.isSongSavedAnywhere = isSongSavedAnywhere;

function updatePlayerAddToPlaylistButtonUI(song) {
  const btn = document.getElementById('player-add-to-pl-btn');
  if (!btn) return;
  const currentSong = song || (state.queue && state.queue[state.currentIndex]);
  if (!currentSong) return;

  const inPlaylist = isSongInAnyUserPlaylist(currentSong.id);
  if (inPlaylist) {
    btn.innerHTML = `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-10810-icon" viewBox="0 0 16 16" width="16" height="16" fill="#1ed760"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m11.748-1.97a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.405-1.406a.75.75 0 1 0-1.061 1.06l2.466 2.467 5.53-5.53z"></path></svg>`;
    btn.title = 'Added to playlist';
    btn.classList.add('in-playlist');
  } else {
    btn.innerHTML = `<svg data-encore-id="icon" role="img" aria-hidden="true" class="e-10810-icon" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"></path><path d="M11.75 8a.75.75 0 0 1-.75.75H8.75V11a.75.75 0 0 1-1.5 0V8.75H5a.75.75 0 0 1 0-1.5h2.25V5a.75.75 0 0 1 1.5 0v2.25H11a.75.75 0 0 1 .75.75"></path></svg>`;
    btn.title = 'Add to playlist';
    btn.classList.remove('in-playlist');
  }
}
window.updatePlayerAddToPlaylistButtonUI = updatePlayerAddToPlaylistButtonUI;

function updateMobileBottomSavedButtonUI(song) {
  const btn = document.getElementById('mob-add-saved-btn');
  const notSavedSvg = document.getElementById('mob-svg-not-saved');
  const isSavedSvg = document.getElementById('mob-svg-is-saved');
  if (!btn) return;

  const curSong = song || (state.queue && state.queue[state.currentIndex]);
  if (!curSong) {
    if (notSavedSvg) notSavedSvg.style.display = 'block';
    if (isSavedSvg) isSavedSvg.style.display = 'none';
    btn.classList.remove('saved');
    return;
  }

  const isSaved = isSongSavedAnywhere(curSong.id);
  if (isSaved) {
    if (notSavedSvg) notSavedSvg.style.display = 'none';
    if (isSavedSvg) isSavedSvg.style.display = 'block';
    btn.classList.add('saved');
    btn.title = 'Saved to Your Library';
  } else {
    if (notSavedSvg) notSavedSvg.style.display = 'block';
    if (isSavedSvg) isSavedSvg.style.display = 'none';
    btn.classList.remove('saved');
    btn.title = 'Save to Your Library';
  }
}
window.updateMobileBottomSavedButtonUI = updateMobileBottomSavedButtonUI;

window.handleMobileSongSaveClick = function(event) {
  if (event) event.stopPropagation();
  const curSong = state.queue && state.queue[state.currentIndex];
  if (!curSong) return;

  const isSaved = isSongSavedAnywhere(curSong.id);
  if (isSaved) {
    
    if (typeof openAddToPlaylistModal === 'function') {
      openAddToPlaylistModal(event, curSong);
    } else {
      toggleLike();
    }
  } else {
    
    toggleLike();
  }
  updateMobileBottomSavedButtonUI(curSong);
};

window.updateBottomPlayerDynamicColor = function(song) {
  const bottomBar = document.getElementById('bottom-player-bar');
  if (!bottomBar) return;

  const currentSong = song || (state.queue && state.queue[state.currentIndex]);
  if (!currentSong) {
    bottomBar.style.setProperty('--mob-bottom-player-bg', '#282828');
    return;
  }

  const imgSrc = currentSong.thumb || currentSong.img || currentSong.image;
  if (!imgSrc) {
    bottomBar.style.setProperty('--mob-bottom-player-bg', '#282828');
    return;
  }

  const extractColorFn = (typeof window.extractLyricsColor === 'function')
    ? window.extractLyricsColor
    : (typeof window._extractLyricsColor === 'function' ? window._extractLyricsColor : null);

  if (extractColorFn) {
    extractColorFn(imgSrc, function(color) {
      if (bottomBar) {
        bottomBar.style.setProperty('--mob-bottom-player-bg', color);
      }
    });
  } else {
    
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
          if (data[i + 3] < 128) continue;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
        if (count === 0) count = 1;
        r = Math.min(255, Math.round((r / count) * 0.75));
        g = Math.min(255, Math.round((g / count) * 0.75));
        b = Math.min(255, Math.round((b / count) * 0.75));
        const solidColor = `rgb(${r}, ${g}, ${b})`;
        if (bottomBar) {
          bottomBar.style.setProperty('--mob-bottom-player-bg', solidColor);
        }
      } catch (e) {
        if (bottomBar) bottomBar.style.setProperty('--mob-bottom-player-bg', '#282828');
      }
    };
    img.onerror = function() {
      if (bottomBar) bottomBar.style.setProperty('--mob-bottom-player-bg', '#282828');
    };
    img.src = imgSrc;
  }
};

const _audioBlobCache = new Map();
let _currentBlobUrl = null;
let _blobFetchController = null;

async function setAudioSourceWithBlobMasking(rawUrl, autoPlay = true) {
  if (!rawUrl) return;
  if (!audio && window.audio) audio = window.audio;
  if (!audio) return;

  
  if (_blobFetchController) {
    try { _blobFetchController.abort(); } catch (e) {}
    _blobFetchController = null;
  }

  
  if (_currentBlobUrl) {
    try { URL.revokeObjectURL(_currentBlobUrl); } catch (e) {}
    _currentBlobUrl = null;
  }

  
  if (_audioBlobCache.has(rawUrl)) {
    const cachedBlob = _audioBlobCache.get(rawUrl);
    _currentBlobUrl = URL.createObjectURL(cachedBlob);
    audio.src = _currentBlobUrl;
    if (autoPlay) audio.play().catch(e => console.warn('Audio play failed:', e));
    return;
  }

  
  _blobFetchController = new AbortController();
  try {
    const response = await fetch(rawUrl, { mode: 'cors', signal: _blobFetchController.signal });
    if (!response.ok) throw new Error('Fetch status ' + response.status);
    const blob = await response.blob();

    
    if (_audioBlobCache.size >= 12) {
      const firstKey = _audioBlobCache.keys().next().value;
      _audioBlobCache.delete(firstKey);
    }
    _audioBlobCache.set(rawUrl, blob);

    _currentBlobUrl = URL.createObjectURL(blob);
    audio.src = _currentBlobUrl;
    if (autoPlay) audio.play().catch(e => console.warn('Audio play failed:', e));
  } catch (err) {
    if (err.name === 'AbortError') return;
    
    audio.src = rawUrl;
    if (autoPlay) audio.play().catch(e => console.warn('Audio play fallback failed:', e));
  } finally {
    _blobFetchController = null;
  }
}
window.setAudioSourceWithBlobMasking = setAudioSourceWithBlobMasking;

function triggerRightSidebarHeaderMarquee(songTitle) {
  const wrap = document.getElementById('rs-header-title-wrap');
  const titleEl = document.getElementById('rs-header-title');
  if (!wrap || !titleEl) return;

  titleEl.textContent = songTitle || 'Now Playing';
  titleEl.title = songTitle || 'Now Playing';
  titleEl.classList.remove('is-animating');
  
  
  void titleEl.offsetWidth;
  
  setTimeout(() => {
    const scrollDist = titleEl.scrollWidth - wrap.clientWidth;
    if (scrollDist > 6) {
      titleEl.style.setProperty('--marquee-dist', `-${scrollDist + 20}px`);
      titleEl.classList.add('is-animating');
    }
  }, 100);
}

window.toggleRightSidebar = function(e) {
  if (e) {
    if (typeof e.preventDefault === 'function') e.preventDefault();
    if (typeof e.stopPropagation === 'function') e.stopPropagation();
  }
  const container = document.querySelector('.app-container');
  if (container) {
    if (container.classList.contains('rs-fullscreen-active')) {
      toggleRightSidebarFullscreen(e);
    } else {
      const isCollapsed = container.classList.toggle('rs-collapsed');
      if (!isCollapsed) {
        const curSong = state.queue && state.queue[state.currentIndex];
        if (curSong) {
          setTimeout(() => triggerRightSidebarHeaderMarquee(curSong.title), 200);
        }
      }
    }
  }
};

window.navigateToArtistDirect = function(artistName, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!artistName) return;
  const cleanName = String(artistName).trim();
  if (typeof navigateTo === 'function') {
    navigateTo('artist', event, cleanName);
  }
};

window.openSongCreditsModal = function(event) {
  if (event) event.stopPropagation();
  const curSong = state.queue && state.queue[state.currentIndex];
  if (!curSong) return;
  const artistRaw = curSong.artist || 'Wave Artist';
  const leadArtist = artistRaw.split(/,\s*|\s+&\s+|\s+feat\.?\s+|\s+ft\.?\s+|\s+featuring\s+/i)[0].trim();
  navigateToArtistDirect(leadArtist, event);
};

window.handleRightSidebarSongClick = function() {
  const curSong = state.queue && state.queue[state.currentIndex];
  if (curSong && typeof navigateTo === 'function') {
    navigateTo('song', null, curSong.id);
  }
};

window.handleRightSidebarArtistClick = function() {
  const curSong = state.queue && state.queue[state.currentIndex];
  if (curSong && curSong.artist && typeof navigateTo === 'function') {
    const leadArtist = curSong.artist.split(',')[0].split('&')[0].trim();
    navigateTo('artist', null, leadArtist);
  }
};

window.handleRightSidebarHeaderClick = function() {
  if (state.activePlaylistId && typeof navigateTo === 'function') {
    navigateTo('playlist', null, state.activePlaylistId);
  } else if (state.queue && state.queue[state.currentIndex] && state.queue[state.currentIndex].album && typeof navigateTo === 'function') {
    navigateTo('album', null, state.queue[state.currentIndex].album);
  }
};

window.toggleFollowFromSidebar = function(e, specificArtist) {
  if (e) e.stopPropagation();
  const curSong = state.queue && state.queue[state.currentIndex];
  if (!curSong && !specificArtist) return;
  const targetArtist = specificArtist || (curSong.artist ? curSong.artist.split(',')[0].trim() : 'Artist');
  
  
  const matchedArt = ARTISTS.find(a => a.name.toLowerCase() === targetArtist.toLowerCase() || a.id.toLowerCase() === targetArtist.toLowerCase());
  const cachedArt = (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') ? RESOLVED_ARTISTS_CACHE.get(targetArtist.toLowerCase()) : null;
  const realImg = (matchedArt && matchedArt.img && !matchedArt.img.includes('placeholder')) 
    ? matchedArt.img 
    : (cachedArt && cachedArt.img && !cachedArt.img.includes('placeholder') && !cachedArt.img.includes('unsplash') ? cachedArt.img : '');

  if (typeof toggleFollow === 'function') {
    toggleFollow(targetArtist, { 
      name: targetArtist, 
      img: realImg,
      isSongCover: false 
    });
  }
  
  const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(targetArtist) : false;

  const btn = e ? e.currentTarget : null;
  if (btn && btn.classList.contains('rs-follow-pill-btn')) {
    btn.textContent = isFollowed ? 'Following' : 'Follow';
    btn.classList.toggle('following', isFollowed);
  } else {
    const curSong = state.queue && state.queue[state.currentIndex];
    if (curSong) loadSongUI(state.currentIndex);
  }

  if (typeof showSpotifyToast === 'function') {
    showSpotifyToast({
      type: 'info',
      title: isFollowed ? `Added to your artists.` : `Removed from your artists.`
    });
  } else if (typeof showDynamicIsland === 'function') {
    showDynamicIsland(isFollowed ? `Following ${targetArtist}` : `Unfollowed ${targetArtist}`, 'info', 2500);
  }
};

window.toggleLikeFromSidebar = function(e) {
  if (e) e.stopPropagation();
  const curSong = state.queue && state.queue[state.currentIndex];
  if (!curSong) return;
  
  if (typeof toggleLikeSong === 'function') {
    toggleLikeSong(curSong.id);
  }
  
  const btn = document.getElementById('rs-like-btn');
  if (btn) {
    const isLiked = state.likedSongs && state.likedSongs.includes(curSong.id);
    btn.classList.toggle('liked', isLiked);
  }
};

window.playNextSongFromSidebar = function(e) {
  if (e) e.stopPropagation();
  if (typeof nextSong === 'function') {
    nextSong();
  }
};

window.shareCurrentPlayingSong = function(e) {
  if (e) e.stopPropagation();
  const curSong = state.queue && state.queue[state.currentIndex];
  if (!curSong) return;
  
  const shareUrl = `${window.location.origin}${window.location.pathname}#song=${curSong.id}`;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      if (typeof showSpotifyToast === 'function') {
        showSpotifyToast({
          type: 'info',
          title: 'Link copied to clipboard.'
        });
      } else if (typeof showDynamicIsland === 'function') {
        showDynamicIsland('Song link copied to clipboard!', 'success', 2500);
      }
    }).catch(() => {});
  } else {
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({ type: 'info', title: 'Link ready to share.' });
    }
  }
};

window.toggleRightSidebarMenu = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const menu = document.getElementById('rs-context-menu');
  if (!menu) return;

  const curSong = state.queue && state.queue[state.currentIndex];
  const isLiked = curSong && state.likedSongs && state.likedSongs.includes(curSong.id);

  const likeText = document.getElementById('rs-menu-like-text');
  if (likeText) {
    likeText.textContent = isLiked ? 'Remove from Liked Songs' : 'Save to Your Liked Songs';
  }

  menu.classList.toggle('hidden');
};

window.openAddToPlaylistFromSidebar = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('rs-context-menu');
  if (menu) menu.classList.add('hidden');

  const curSong = state.queue && state.queue[state.currentIndex];
  if (typeof openAddToPlaylistModal === 'function') {
    openAddToPlaylistModal(e, curSong);
  }
};

window.toggleLikeFromSidebarMenu = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('rs-context-menu');
  if (menu) menu.classList.add('hidden');

  toggleLikeFromSidebar(e);
};

window.toggleWindowFullScreen = function(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

  if (!isFs) {
    
    const elem = document.documentElement;
    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
    if (req) {
      req.call(elem).catch(err => { console.warn('Fullscreen request failed:', err); });
    }
  } else {
    
    const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
    if (exit) {
      exit.call(document).catch(err => { console.warn('Exit fullscreen failed:', err); });
    }
  }
};

const _handleFsChange = () => {
  const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  const rsBtn = document.getElementById('rs-window-fs-btn');
  const bottomBtn = document.getElementById('bottom-window-fs-btn');

  const rsExp = document.getElementById('rs-window-fs-icon-expand');
  const rsCol = document.getElementById('rs-window-fs-icon-collapse');
  const btmExp = document.getElementById('bottom-fs-icon-expand');
  const btmCol = document.getElementById('bottom-fs-icon-collapse');

  if (isFs) {
    document.body.classList.add('rs-window-fs-active');
    if (rsBtn) {
      rsBtn.title = 'Exit full screen window';
      rsBtn.classList.add('active');
    }
    if (bottomBtn) {
      bottomBtn.title = 'Exit full screen window';
      bottomBtn.classList.add('active');
    }
    if (rsExp && rsCol) {
      rsExp.style.display = 'none';
      rsCol.style.display = 'block';
    }
    if (btmExp && btmCol) {
      btmExp.style.display = 'none';
      btmCol.style.display = 'block';
    }
  } else {
    document.body.classList.remove('rs-window-fs-active');
    if (rsBtn) {
      rsBtn.title = 'Full screen window (Hide browser bar)';
      rsBtn.classList.remove('active');
    }
    if (bottomBtn) {
      bottomBtn.title = 'Full screen window';
      bottomBtn.classList.remove('active');
    }
    if (rsExp && rsCol) {
      rsExp.style.display = 'block';
      rsCol.style.display = 'none';
    }
    if (btmExp && btmCol) {
      btmExp.style.display = 'block';
      btmCol.style.display = 'none';
    }
    document.body.classList.remove('rs-idle-active');
    const container = document.querySelector('.app-container');
    if (container) {
      container.classList.remove('rs-idle-active');
    }
  }
};

document.addEventListener('fullscreenchange', _handleFsChange);
document.addEventListener('webkitfullscreenchange', _handleFsChange);
document.addEventListener('mozfullscreenchange', _handleFsChange);
document.addEventListener('MSFullscreenChange', _handleFsChange);

window.updateRightSidebarDynamicColor = function(song) {
  if (!song) return;
  const imgUrl = song.img || song.thumb;
  if (!imgUrl) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = imgUrl;

  img.onload = function() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 30;
      canvas.height = 30;
      ctx.drawImage(img, 0, 0, 30, 30);
      const data = ctx.getImageData(0, 0, 30, 30).data;

      let rTot = 0, gTot = 0, bTot = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a < 128) continue;
        const brightness = (r + g + b) / 3;
        if (brightness > 20 && brightness < 225) {
          rTot += r;
          gTot += g;
          bTot += b;
          count++;
        }
      }

      if (count > 0) {
        const avgR = Math.round(rTot / count);
        const avgG = Math.round(gTot / count);
        const avgB = Math.round(bTot / count);
        const rsEl = document.getElementById('right-sidebar');
        if (rsEl) {
          rsEl.style.setProperty('--rs-bg-color', `rgb(${avgR}, ${avgG}, ${avgB})`);
          rsEl.style.setProperty('--rs-header-bg', `rgba(${avgR}, ${avgG}, ${avgB}, 0.85)`);
        }
      }
    } catch (e) {
      
      let hash = 0;
      for (let i = 0; i < imgUrl.length; i++) hash = imgUrl.charCodeAt(i) + ((hash << 5) - hash);
      const hue = Math.abs(hash) % 360;
      const rsEl = document.getElementById('right-sidebar');
      if (rsEl) {
        rsEl.style.setProperty('--rs-bg-color', `hsl(${hue}, 65%, 28%)`);
        rsEl.style.setProperty('--rs-header-bg', `hsla(${hue}, 65%, 28%, 0.85)`);
      }
    }
  };
};

window.toggleRightSidebarFullscreen = function(e) {
  if (e && typeof e.stopPropagation === 'function') {
    e.stopPropagation();
  }
  const container = document.querySelector('.app-container');
  const expIcon = document.getElementById('rs-fs-icon-expand');
  const colIcon = document.getElementById('rs-fs-icon-collapse');

  if (!container) return;

  const isFs = container.classList.toggle('rs-fullscreen-active');

  if (expIcon && colIcon) {
    expIcon.style.display = isFs ? 'none' : 'block';
    colIcon.style.display = isFs ? 'block' : 'none';
  }

  const btn = document.getElementById('rs-fullscreen-btn');
  if (btn) {
    btn.title = isFs ? 'Exit full screen' : 'Full screen view';
    btn.classList.toggle('active', isFs);
  }

  
  const curSong = state.queue && state.queue[state.currentIndex];
  if (curSong) {
    updateRightSidebarDynamicColor(curSong);
    setTimeout(() => triggerRightSidebarHeaderMarquee(curSong.title), 300);
  }

  
  if (isFs) {
    _startFsIdleWatcher();
  } else {
    _stopFsIdleWatcher();
    container.classList.remove('rs-idle-active');
    document.body.classList.remove('rs-idle-active');
  }
};

let _fsIdleTimer = null;
let _fsIdleBound = null;
const FS_IDLE_DELAY = 3500; 

function _startFsIdleWatcher() {
  _stopFsIdleWatcher(); 
  const sidebar = document.getElementById('right-sidebar');
  if (!sidebar) return;

  _fsIdleBound = function(ev) {
    const container = document.querySelector('.app-container');
    if (!container || !container.classList.contains('rs-fullscreen-active')) return;

    
    if (container.classList.contains('rs-idle-active')) {
      container.classList.remove('rs-idle-active');
      document.body.classList.remove('rs-idle-active');
      sidebar.style.overflow = '';
    }

    
    clearTimeout(_fsIdleTimer);
    _fsIdleTimer = setTimeout(() => {
      if (container.classList.contains('rs-fullscreen-active')) {
        _syncIdleOverlay();
        sidebar.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => {
          if (container.classList.contains('rs-fullscreen-active')) {
            container.classList.add('rs-idle-active');
            document.body.classList.add('rs-idle-active');
          }
        }, 400);
      }
    }, FS_IDLE_DELAY);
  };

  
  document.addEventListener('mousemove', _fsIdleBound);
  document.addEventListener('mousedown', _fsIdleBound);
  document.addEventListener('keydown', _fsIdleBound);
  document.addEventListener('touchstart', _fsIdleBound);
  sidebar.addEventListener('scroll', _fsIdleBound);

  
  _fsIdleTimer = setTimeout(() => {
    const container = document.querySelector('.app-container');
    if (container && container.classList.contains('rs-fullscreen-active')) {
      _syncIdleOverlay();
      sidebar.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (container && container.classList.contains('rs-fullscreen-active')) {
          container.classList.add('rs-idle-active');
          document.body.classList.add('rs-idle-active');
        }
      }, 400);
    }
  }, FS_IDLE_DELAY);
}

function _stopFsIdleWatcher() {
  clearTimeout(_fsIdleTimer);
  _fsIdleTimer = null;
  if (_fsIdleBound) {
    document.removeEventListener('mousemove', _fsIdleBound);
    document.removeEventListener('mousedown', _fsIdleBound);
    document.removeEventListener('keydown', _fsIdleBound);
    document.removeEventListener('touchstart', _fsIdleBound);
    const sidebar = document.getElementById('right-sidebar');
    if (sidebar) {
      sidebar.removeEventListener('scroll', _fsIdleBound);
    }
    _fsIdleBound = null;
  }
}

function _syncIdleOverlay() {
  const curSong = state.queue && state.queue[state.currentIndex];
  const idleTitle = document.getElementById('rs-idle-title');
  const idleArtist = document.getElementById('rs-idle-artist');
  if (curSong) {
    if (idleTitle) idleTitle.textContent = curSong.title || 'Unknown';
    if (idleArtist) idleArtist.textContent = curSong.artist || 'Unknown Artist';
  }
}

window.openSidebarQueue = function(e) {
  if (e) e.stopPropagation();
  const npHeader = document.querySelector('.rs-header');
  const npContent = document.getElementById('right-sidebar-content');
  const qView = document.getElementById('rs-queue-view');
  
  if (npHeader) npHeader.style.display = 'none';
  if (npContent) npContent.style.display = 'none';
  if (qView) qView.classList.remove('hidden');

  renderSidebarQueue();
};

window.closeSidebarQueue = function(e) {
  if (e) e.stopPropagation();
  const npHeader = document.querySelector('.rs-header');
  const npContent = document.getElementById('right-sidebar-content');
  const qView = document.getElementById('rs-queue-view');
  
  if (qView) qView.classList.add('hidden');
  if (npHeader) npHeader.style.display = 'flex';
  if (npContent) npContent.style.display = 'flex';
};

window.openFullQueueFromSidebar = function(e) {
  if (e) e.stopPropagation();
  closeSidebarQueue(e);
  toggleQueue();
};

window.renderSidebarQueue = function() {
  const qView = document.getElementById('rs-queue-view');
  if (!qView || qView.classList.contains('hidden')) return;

  const curSong = state.queue && state.queue[state.currentIndex];
  
  
  const curThumb = document.getElementById('rs-q-cur-thumb');
  const curTitle = document.getElementById('rs-q-cur-title');
  const curArtist = document.getElementById('rs-q-cur-artist');
  
  if (curSong) {
    if (curThumb) curThumb.src = curSong.thumb || curSong.img || 'https://placehold.co/48x48/121212/1ed760?text=Music';
    if (curTitle) curTitle.textContent = curSong.title || 'Unknown Title';
    if (curArtist) curArtist.textContent = curSong.artist || 'Unknown Artist';
  }

  
  const nextList = document.getElementById('rs-q-next-list');
  if (!nextList) return;

  const upcomingSongs = state.queue ? state.queue.slice(state.currentIndex + 1) : [];

  if (upcomingSongs.length === 0) {
    nextList.innerHTML = `<p class="rs-q-empty-text">No more upcoming tracks in queue</p>`;
    return;
  }

  let html = '';
  for (let i = 0; i < upcomingSongs.length; i++) {
    const s = upcomingSongs[i];
    const actualQueueIndex = state.currentIndex + 1 + i;
    const thumb = s.thumb || s.img || 'https://placehold.co/48x48/121212/1ed760?text=Music';
    const titleEsc = (s.title || 'Track').replace(/'/g, "\\'");
    const artistEsc = (s.artist || 'Artist').replace(/'/g, "\\'");

    html += `
      <div class="rs-q-song-row" onclick="playSong(${actualQueueIndex})">
        <img class="rs-q-thumb" src="${thumb}" alt="${titleEsc}" loading="lazy">
        <div class="rs-q-meta">
          <h4 class="rs-q-song-name">${s.title || 'Track'}</h4>
          <p class="rs-q-artist-name">${s.artist || 'Artist'}</p>
        </div>
      </div>
    `;
  }

  nextList.innerHTML = html;
};

document.addEventListener('click', function(e) {
  const menu = document.getElementById('rs-context-menu');
  if (menu && !menu.classList.contains('hidden')) {
    if (!menu.contains(e.target) && !e.target.closest('#rs-menu-btn')) {
      menu.classList.add('hidden');
    }
  }
});

window.seedQueueWithRelated = function(currentSong, targetCount = 25) {
  if (!currentSong) return;
  const pool = (typeof SONGS !== 'undefined' && Array.isArray(SONGS)) ? SONGS : [];
  const cloudPool = (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) ? cloudData.songs : [];
  const searchPool = (typeof window.apiSearchResults !== 'undefined' && Array.isArray(window.apiSearchResults)) ? window.apiSearchResults : [];
  const allAvailable = [...searchPool, ...pool, ...cloudPool];
  
  if (!state.queue || !Array.isArray(state.queue) || state.queue.length === 0) {
    state.queue = [currentSong];
    state.currentIndex = 0;
  }

  const seenIds = new Set(state.queue.map(s => String(s.id)));
  const norm = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const seenTitles = new Set(state.queue.map(s => norm(s.title)));

  const sArtist = (currentSong.artist || '').toLowerCase();
  const sTags = Array.isArray(currentSong.tags) ? currentSong.tags.map(t => String(t).toLowerCase()) : [];
  const sLang = (currentSong.language || '').toLowerCase();

  
  const matchingSongs = allAvailable.filter(s => {
    if (!s || (!s.audioUrl && !s.url && !s.media_url)) return false;
    if (seenIds.has(String(s.id))) return false;
    const nT = norm(s.title);
    if (nT && seenTitles.has(nT)) return false;

    const cArtist = (s.artist || '').toLowerCase();
    if (sArtist && cArtist && (sArtist.includes(cArtist) || cArtist.includes(sArtist))) return true;

    const cTags = Array.isArray(s.tags) ? s.tags.map(t => String(t).toLowerCase()) : [];
    if (sTags.some(t => cTags.includes(t))) return true;

    if (sLang && s.language && s.language.toLowerCase() === sLang) return true;

    return false;
  });

  
  for (const s of matchingSongs) {
    if (state.queue.length >= targetCount) break;
    if (typeof normalizeSongFields === 'function') normalizeSongFields(s);
    seenIds.add(String(s.id));
    const nT = norm(s.title);
    if (nT) seenTitles.add(nT);
    state.queue.push(s);
  }

  
  if (state.queue.length < targetCount) {
    for (const s of allAvailable) {
      if (state.queue.length >= targetCount) break;
      if (!s || (!s.audioUrl && !s.url && !s.media_url)) continue;
      if (seenIds.has(String(s.id))) continue;
      const nT = norm(s.title);
      if (nT && seenTitles.has(nT)) continue;

      if (typeof normalizeSongFields === 'function') normalizeSongFields(s);
      seenIds.add(String(s.id));
      if (nT) seenTitles.add(nT);
      state.queue.push(s);
    }
  }

  if (typeof renderQueuePanel === 'function') renderQueuePanel();
  if (typeof renderSidebarQueue === 'function') renderSidebarQueue();
  if (window.NextWave && state.queue[state.currentIndex + 1]) {
    window.NextWave.updateNextUpBadge(currentSong, state.queue[state.currentIndex + 1]);
  }
};

window.playSpecificSong = function(id) {
  if (!id) return;
  const targetStr = String(id);
  let song = SONGS.find(s => String(s.id) === targetStr) ||
             (typeof cloudData !== 'undefined' && cloudData.songs ? cloudData.songs.find(s => String(s.id) === targetStr) : null) ||
             (typeof state !== 'undefined' && state.recentSongs ? state.recentSongs.find(s => String(s.id) === targetStr) : null);

  if (!song) return;

  if (typeof playJioSaavnSong === 'function') {
    playJioSaavnSong(song);
    return;
  }

  let idx = state.queue.findIndex(s => String(s.id) === targetStr);
  if (idx === -1) {
    state.queue.push(song);
    idx = state.queue.length - 1;
    if (typeof seedQueueWithRelated === 'function') {
      seedQueueWithRelated(song, 25);
    }
  }
  playSong(idx);
};

window.playRecentSong = function(id) {
  const targetStr = String(id);
  const idx = state.recentSongs.findIndex(s => String(s.id) === targetStr);
  if (idx === -1) return;
  state.queue = [...state.recentSongs];
  if (state.queue.length <= 1 && typeof seedQueueWithRelated === 'function') {
    seedQueueWithRelated(state.recentSongs[idx], 25);
  }
  playSong(idx);
};

function playSong(idx) {
  if (!state.queue || state.queue.length === 0) {
    if (typeof SONGS !== 'undefined' && SONGS.length > 0) {
      state.queue = [...SONGS];
      idx = 0;
    } else {
      return;
    }
  }

  if (idx < 0 || idx >= state.queue.length) idx = 0;

  state.currentIndex = idx;
  const song = state.queue[idx];
  if (!song) return;

  normalizeSongFields(song);
  state.currentPlayingSongId = song.id;

  
  if (state.queue.length <= 1 && (!state.playbackContext || (state.playbackContext.type !== 'playlist' && state.playbackContext.type !== 'album')) && typeof seedQueueWithRelated === 'function') {
    seedQueueWithRelated(song, 25);
  }

  const recentIdx = state.recentSongs.findIndex(s => s.id === song.id);
  if (recentIdx > -1) state.recentSongs.splice(recentIdx, 1);
  state.recentSongs.unshift(song);
  if (state.recentSongs.length > 50) state.recentSongs.length = 50;

  recordListeningHistory(song);
  if (window.WaveHistory) window.WaveHistory.logPlay(song);
  if (window.NextWave) window.NextWave.updateNextUpBadge(song, state.queue[idx + 1]);

  if (typeof triggerSmartRecommendations === 'function') {
    triggerSmartRecommendations(song);
  }

  
  if (typeof SmartQueue !== 'undefined' && SmartQueue.generateQueue) {
    if (!state.playbackContext || (state.playbackContext.type !== 'playlist' && state.playbackContext.type !== 'album')) {
      SmartQueue.generateQueue(song, 30);
    }
  }

  loadSongUI(idx);

  if (song.audioUrl) {
    setAudioSourceWithBlobMasking(song.audioUrl, true);
  } else {
    
    if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs && song.title) {
      JIOSAAVN_API.searchSongs(`${song.title} ${song.artist || ''}`, 1).then(res => {
        if (res && res[0] && res[0].audioUrl) {
          song.audioUrl = res[0].audioUrl;
          setAudioSourceWithBlobMasking(song.audioUrl, true);
        } else {
          if (typeof showToast === 'function') showToast('Stream unavailable for this track.', 'error');
        }
      }).catch(() => {
        if (typeof showToast === 'function') showToast('Stream unavailable for this track.', 'error');
      });
    } else {
      if (typeof showToast === 'function') showToast('Stream unavailable for this track.', 'error');
    }
  }

  state.isPlaying = true;
  updatePlayButtonUI();
  syncEqualizer();
  renderQueuePanel();
  if (typeof renderSidebarQueue === 'function') {
    renderSidebarQueue();
  }

  showNowPlayingIsland(song);
  if (window.MiniPlayer) window.MiniPlayer.update();

  cacheJioSaavnSong(song);
  saveUserState();

  try {
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title || 'Unknown Title',
        artist: song.artist || 'Unknown Artist',
        album: song.album || 'Single',
        artwork: [
          { src: song.thumb || 'https://placehold.co/96x96/1a1a1a/a855f7?text=Music', sizes: '96x96', type: 'image/jpeg' },
          { src: song.img || song.thumb || 'https://placehold.co/512x512/1a1a1a/a855f7?text=Music', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (!state.isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (state.isPlaying) togglePlay();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => prevSong());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextSong());
    }
  } catch (err) {
  }
}

function togglePlay() {
  if (!audio) return;
  if (!audio.paused) {
    audio.pause();
    state.isPlaying = false;
    updatePlayButtonUI();
    syncEqualizer();
  } else {
    const needsFullLoad = !audio.src || audio.src === window.location.href;
    
    if (needsFullLoad) {
      playSong(state.currentIndex);
    } else {
      state.isPlaying = true;
      updatePlayButtonUI();
      syncEqualizer();
      audio.play().catch(e => {
        console.warn('Audio play failed:', e);
        state.isPlaying = false;
        updatePlayButtonUI();
        syncEqualizer();
      });
    }
  }
}

function updatePlayButtonUI() {
  const icoPlay = document.getElementById('ico-play');
  const icoPause = document.getElementById('ico-pause');
  if (icoPlay) icoPlay.style.display = state.isPlaying ? 'none' : 'block';
  if (icoPause) icoPause.style.display = state.isPlaying ? 'block' : 'none';

  const mnpPlay = document.getElementById('mnp-ico-play');
  const mnpPause = document.getElementById('mnp-ico-pause');
  if (mnpPlay && mnpPause) {
    mnpPlay.style.display = state.isPlaying ? 'none' : 'block';
    mnpPause.style.display = state.isPlaying ? 'block' : 'none';
  }

  const mobPlay = document.getElementById('mob-ico-play');
  const mobPause = document.getElementById('mob-ico-pause');
  if (mobPlay && mobPause) {
    mobPlay.style.display = state.isPlaying ? 'none' : 'block';
    mobPause.style.display = state.isPlaying ? 'block' : 'none';
  }

  const miniPlay = document.getElementById('mini-ico-play');
  const miniPause = document.getElementById('mini-ico-pause');
  if (miniPlay && miniPause) {
    miniPlay.style.display = state.isPlaying ? 'none' : 'block';
    miniPause.style.display = state.isPlaying ? 'block' : 'none';
  }

  const fsPlay = document.getElementById('sp-fs-ico-play');
  const fsPause = document.getElementById('sp-fs-ico-pause');
  if (fsPlay) fsPlay.style.display = state.isPlaying ? 'none' : 'block';
  if (fsPause) fsPause.style.display = state.isPlaying ? 'block' : 'none';

  const qPlay = document.getElementById('sp-q-ico-play');
  const qPause = document.getElementById('sp-q-ico-pause');
  if (qPlay) qPlay.style.display = state.isPlaying ? 'none' : 'block';
  if (qPause) qPause.style.display = state.isPlaying ? 'block' : 'none';

  const mobLyrPlay = document.getElementById('mob-lyrics-ico-play');
  const mobLyrPause = document.getElementById('mob-lyrics-ico-pause');
  if (mobLyrPlay) mobLyrPlay.style.display = state.isPlaying ? 'none' : 'block';
  if (mobLyrPause) mobLyrPause.style.display = state.isPlaying ? 'block' : 'none';

  const mobQPlay = document.getElementById('mob-q-ico-play');
  const mobQPause = document.getElementById('mob-q-ico-pause');
  if (mobQPlay) mobQPlay.style.display = state.isPlaying ? 'none' : 'block';
  if (mobQPause) mobQPause.style.display = state.isPlaying ? 'block' : 'none';

  if (typeof updateDiPlayState === 'function') updateDiPlayState(state.isPlaying);

  document.querySelectorAll('.music-card').forEach(card => {
    const btn = card.querySelector('.card-play-btn');
    if (!btn) return;
    
    const onclickStr = card.getAttribute('onclick') || '';
    const match = onclickStr.match(/id==='([^']+)'/) || onclickStr.match(/playSpecificSong\('([^']+)'\)/);
    let isThisSongPlaying = false;
    
    if (match && match[1]) {
      isThisSongPlaying = state.isPlaying && String(match[1]) === String(state.currentPlayingSongId);
    }
    
    if (isThisSongPlaying) {
      card.classList.add('playing');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    } else {
      card.classList.remove('playing');
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  });

  updateDynamicDocumentTitle();
}

function updateDynamicDocumentTitle() {
  const currentSong = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
    ? state.queue[state.currentIndex]
    : null;

  const isAudioPlaying = (typeof state !== 'undefined' && state.isPlaying) && (window.audio && !window.audio.paused);

  if (currentSong && (currentSong.title || currentSong.name)) {
    const cleanTitle = (currentSong.title || currentSong.name || '').trim();
    const cleanArtist = (currentSong.artist || currentSong.primaryArtists || '').trim();
    const artistPart = (cleanArtist && cleanArtist !== 'Unknown') ? ` • ${cleanArtist}` : '';

    if (isAudioPlaying) {
      document.title = `▶ ${cleanTitle}${artistPart} — Wave Music`;
    } else {
      document.title = `${cleanTitle}${artistPart} — Wave Music`;
    }
  } else {
    const currentView = (typeof state !== 'undefined' && state.currentView) ? state.currentView : 'home';
    const viewTitles = {
      home: 'Wave Music — Free Music Player',
      search: 'Search — Wave Music',
      library: 'Your Library — Wave Music',
      liked: 'Liked Songs — Wave Music',
      lyrics: 'Synchronized Lyrics — Wave Music',
      history: 'Listening History — Wave Music',
      podcasts: 'Podcasts & Shows — Wave Music',
      settings: 'Settings — Wave Music',
      top100: 'Top Charts & Trending — Wave Music',
      vibe: 'Vibe Flow — Wave Music',
      timecapsule: 'Time Capsule — Wave Music'
    };

    if (currentView === 'playlist' && state.activePlaylist && state.activePlaylist.name) {
      document.title = `${state.activePlaylist.name} — Playlist by Wave Music`;
    } else if (currentView === 'album' && state.activeAlbum && state.activeAlbum.name) {
      document.title = `${state.activeAlbum.name} — Album by Wave Music`;
    } else if (currentView === 'artist' && state.activeArtist && state.activeArtist.name) {
      document.title = `${state.activeArtist.name} — Wave Music`;
    } else {
      document.title = viewTitles[currentView] || 'Wave Music — Free Music Player';
    }
  }
}
window.updateDynamicDocumentTitle = updateDynamicDocumentTitle;
window.updateDocumentTitle = updateDynamicDocumentTitle;

function nextSong() {
  if (!state.queue || state.queue.length === 0) {
    if (typeof SONGS !== 'undefined' && SONGS.length > 0) {
      state.queue = [...SONGS];
      state.currentIndex = 0;
      playSong(0);
    }
    return;
  }

  
  if (state.queue.length <= 1 && typeof seedQueueWithRelated === 'function') {
    seedQueueWithRelated(state.queue[0], 25);
  }

  let nextIdx = 0;
  if (state.isShuffle) {
    if (state.queue.length > 1) {
      let randIdx = Math.floor(Math.random() * state.queue.length);
      if (randIdx === state.currentIndex) {
        randIdx = (randIdx + 1) % state.queue.length;
      }
      nextIdx = randIdx;
    } else {
      nextIdx = 0;
    }
  } else {
    nextIdx = state.currentIndex + 1;
    if (nextIdx >= state.queue.length) {
      if (state.playbackContext && (state.playbackContext.type === 'playlist' || state.playbackContext.type === 'album')) {
        
        nextIdx = 0;
      } else {
        
        const pool = (typeof SONGS !== 'undefined' && Array.isArray(SONGS)) ? SONGS : [];
        const unplayed = pool.filter(s => !state.queue.some(q => String(q.id) === String(s.id)));
        if (unplayed.length > 0) {
          state.queue.push(...unplayed.slice(0, 10));
          renderQueuePanel();
          if (typeof renderSidebarQueue === 'function') renderSidebarQueue();
        } else {
          
          nextIdx = 0;
        }
      }
    }
  }

  playSong(nextIdx);
}

function prevSong() {
  if (!state.queue || state.queue.length === 0) {
    if (typeof SONGS !== 'undefined' && SONGS.length > 0) {
      state.queue = [...SONGS];
      state.currentIndex = 0;
      playSong(0);
    }
    return;
  }

  
  if (audio && audio.currentTime > 3) {
    audio.currentTime = 0;
    if (audio.paused) {
      audio.play().catch(() => {});
    }
    return;
  }

  let prevIdx = state.currentIndex - 1;
  if (prevIdx < 0) {
    
    if (state.queue.length > 1) {
      prevIdx = state.queue.length - 1;
    } else if (state.recentSongs && state.recentSongs.length > 1) {
      const prevRecent = state.recentSongs[1];
      if (prevRecent && typeof playJioSaavnSong === 'function') {
        playJioSaavnSong(prevRecent);
        return;
      }
      prevIdx = 0;
    } else {
      prevIdx = 0;
    }
  }

  playSong(prevIdx);
}function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  const btn = document.getElementById('btn-shuffle');
  if (btn) btn.style.color = state.isShuffle ? 'var(--neon-purple)' : 'var(--text-muted)';
  const fsBtn = document.getElementById('sp-fs-btn-shuffle');
  if (fsBtn) fsBtn.style.color = state.isShuffle ? '#1ed760' : 'rgba(255, 255, 255, 0.7)';
  const qShuffle = document.getElementById('sp-q-btn-shuffle');
  if (qShuffle) qShuffle.style.color = state.isShuffle ? '#1ed760' : 'rgba(255, 255, 255, 0.7)';

  if (state.isShuffle) {
    if (window.SmartAudio) {
      state.queue = window.SmartAudio.smartShuffle(state.queue, state.currentIndex);
    }
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({ type: 'info', title: 'Smart Shuffle turned on.' });
    } else if (typeof showToast === 'function') {
      showToast('Smart Shuffle Active — Intelligent queue balancing', 'info');
    }
    document.querySelectorAll('.music-card').forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('shuffle-anim');
        card.addEventListener('animationend', () => card.classList.remove('shuffle-anim'), { once: true });
      }, i * 30);
    });
  } else {
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({ type: 'info', title: 'Shuffle turned off.' });
    }
  }
  if (typeof syncMnpShuffleState === 'function') syncMnpShuffleState();
  const mobQShuffle = document.getElementById('mob-q-shuffle-btn');
  if (mobQShuffle) mobQShuffle.classList.toggle('active', !!state.isShuffle);
  const mobQSec = document.getElementById('mob-queue-sec-title');
  if (mobQSec) mobQSec.textContent = state.isShuffle ? 'Shuffling from:' : 'Next in queue:';
  if (typeof renderMobileQueueList === 'function') renderMobileQueueList();
}

function toggleRepeat() {
  state.isRepeat = !state.isRepeat;
  const desktopBtn = document.getElementById('btn-repeat');
  if (desktopBtn) {
    desktopBtn.style.color = state.isRepeat ? 'var(--neon-purple)' : 'var(--text-muted)';
  }
  const fsRepeat = document.getElementById('sp-fs-btn-repeat');
  if (fsRepeat) fsRepeat.style.color = state.isRepeat ? '#1ed760' : 'rgba(255, 255, 255, 0.7)';
  if (typeof syncMnpRepeatState === 'function') syncMnpRepeatState();
  if (typeof showSpotifyToast === 'function') {
    showSpotifyToast({ type: 'info', title: state.isRepeat ? 'Repeat turned on.' : 'Repeat turned off.' });
  }
  if (typeof triggerMnpPillFeedback === 'function') triggerMnpPillFeedback(state.isRepeat ? "Repeat On" : "Repeat Off");
}

function toggleLike() {
  const song = state.queue[state.currentIndex];
  if (!song) return;
  toggleLikeSong(song.id);
}

window.toggleLikeSong = function(songId) {
  if (!songId) return;
  const song = getSongById(songId);
  const targetId = song ? song.id : songId;

  if (!state.likedSongs) state.likedSongs = [];

  const idx = state.likedSongs.indexOf(targetId);
  const btn = document.getElementById('like-btn');
  const fsLike = document.getElementById('sp-fs-like-btn');

  if (idx !== -1) {
    state.likedSongs.splice(idx, 1);
    if (btn) btn.classList.remove('liked');
    if (fsLike) {
      fsLike.style.color = 'rgba(255, 255, 255, 0.7)';
      fsLike.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    }
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({
        type: 'unliked',
        title: 'Removed from Liked Songs.',
        actionText: 'Undo',
        song: song,
        onAction: () => toggleLikeSong(targetId)
      });
    } else if (typeof showDynamicIsland === 'function') {
      showDynamicIsland('Removed from Liked Songs', 'info', 2000);
    }
    if (typeof triggerMnpPillFeedback === 'function') triggerMnpPillFeedback("Removed Like");
  } else {
    state.likedSongs.push(targetId);
    if (btn) btn.classList.add('liked');
    if (fsLike) {
      fsLike.style.color = '#1ed760';
      fsLike.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="#1ed760"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    }
    if (song) cacheJioSaavnSong(song);
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({
        type: 'liked',
        title: 'Added to Liked Songs.',
        actionText: 'Change',
        song: song,
        onAction: () => {
          if (typeof openAddToPlaylistModal === 'function') {
            openAddToPlaylistModal(null, song);
          }
        }
      });
    } else if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(`Added "${song ? song.title : 'Song'}" to Liked Songs`, 'success', 2000);
    }
    if (typeof triggerMnpPillFeedback === 'function') triggerMnpPillFeedback("Liked Song");
  }

  saveUserState();
  if (typeof updateMobileBottomSavedButtonUI === 'function') updateMobileBottomSavedButtonUI();
  if (window.MiniPlayer) window.MiniPlayer.update();

  if (state.currentView === 'liked') {
    renderView('liked');
  }
};

window.addToQueue = function(songId) {
  if (!songId) return;
  const song = getSongById(songId);
  if (!song) return;

  if (!state.queue) state.queue = [];

  normalizeSongFields(song);

  const exists = state.queue.some(s => s && String(s.id) === String(song.id));
  if (!exists) {
    state.queue.push(song);
  }

  if (typeof showSpotifyToast === 'function') {
    showSpotifyToast({
      type: 'queue',
      title: 'Added to queue.',
      actionText: 'View',
      song: song,
      onAction: () => {
        if (typeof toggleQueue === 'function') toggleQueue();
      }
    });
  } else if (typeof showDynamicIsland === 'function') {
    showDynamicIsland(`Added "${song.title}" to Queue`, 'success', 2000);
  }
  if (typeof triggerMnpPillFeedback === 'function') triggerMnpPillFeedback("Added to Queue");

  if (typeof renderQueueList === 'function') {
    renderQueueList();
  }
};

function seekTo(e) {
  if (!audio || !audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.max(0, Math.min(1, pct));
  audio.currentTime = pct * audio.duration;
  if (typeof syncMobileNowPlayingProgress === 'function') syncMobileNowPlayingProgress();
  if (typeof syncMobileLyricsProgress === 'function') syncMobileLyricsProgress();
}

function setVolume(val) {
  const slider = document.getElementById('vol-slider');
  if (slider) {
    slider.style.setProperty('--vol-fill', val + '%');
    slider.value = val;
  }
  const mnpSlider = document.getElementById('mnp-vol-slider');
  if (mnpSlider) {
    mnpSlider.style.setProperty('--mnp-vol-fill', val + '%');
    mnpSlider.value = val;
  }
  state.lastVolume = val;
  if (audio) {
    audio.volume = val / 100;
  }
  if (val > 0 && state.isMuted) {
    state.isMuted = false;
    updateMuteIcon();
  }
  if (typeof syncMnpVolumeUI === 'function') syncMnpVolumeUI(val, state.isMuted);
}

function toggleMute() {
  const slider = document.getElementById('vol-slider');
  const mnpSlider = document.getElementById('mnp-vol-slider');
  if (state.isMuted) {
    state.isMuted = false;
    const vol = state.lastVolume > 0 ? state.lastVolume : 70;
    setVolume(vol);
    if (slider) slider.value = vol;
    if (mnpSlider) mnpSlider.value = vol;
  } else {
    state.isMuted = true;
    if (audio) audio.volume = 0;
    if (slider) {
      slider.style.setProperty('--vol-fill', '0%');
      slider.value = 0;
    }
    if (mnpSlider) {
      mnpSlider.style.setProperty('--mnp-vol-fill', '0%');
      mnpSlider.value = 0;
    }
  }
  updateMuteIcon();
  if (typeof syncMnpVolumeUI === 'function') syncMnpVolumeUI(state.isMuted ? 0 : state.lastVolume, state.isMuted);
}

function updateMuteIcon() {
  const btn = document.getElementById('mute-btn');
  if (!btn) return;
  if (state.isMuted) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }
}

function toggleQueue() {
  if (window.innerWidth <= 768) {
    if (typeof toggleMobileQueue === 'function') {
      toggleMobileQueue();
    }
    return;
  }
  const panel = document.getElementById('queue-panel');
  if (!panel) return;
  panel.classList.toggle('open');
  const isOpen = panel.classList.contains('open');

  const queueBtn = document.getElementById('queue-toggle-btn');
  const fsQueueBtn = document.getElementById('sp-fs-btn-queue');
  if (queueBtn) {
    if (isOpen) queueBtn.classList.add('active');
    else queueBtn.classList.remove('active');
  }
  if (fsQueueBtn) {
    if (isOpen) fsQueueBtn.classList.add('active');
    else fsQueueBtn.classList.remove('active');
  }

  if (isOpen) {
    renderQueuePanel();
  }
}

function renderQueuePanel() {
  const panel = document.getElementById('queue-panel');
  const listContainer = document.getElementById('sp-queue-list-container');
  const metaText = document.getElementById('sp-queue-meta-text');
  const topThumb = document.getElementById('sp-q-top-thumb');
  const topTitle = document.getElementById('sp-q-top-title');
  const topArtist = document.getElementById('sp-q-top-artist');
  const topLyricsTag = document.getElementById('sp-q-top-lyrics-tag');
  const qPlay = document.getElementById('sp-q-ico-play');
  const qPause = document.getElementById('sp-q-ico-pause');
  const qShuffle = document.getElementById('sp-q-btn-shuffle');

  if (!panel) return;

  const curSong = state.queue && state.queue[state.currentIndex];
  if (curSong) {
    if (topThumb) topThumb.src = curSong.thumb || curSong.img || 'https://placehold.co/48x48/121212/1ed760?text=Music';
    if (topTitle) topTitle.textContent = curSong.title || 'Unknown Title';
    if (topArtist) topArtist.textContent = curSong.artist || 'Unknown Artist';
    if (topLyricsTag) {
      const hasLyrics = !!(curSong.lyrics || curSong.lyricsUrl || (curSong.id && String(curSong.id).includes('c-song-141')));
      topLyricsTag.style.display = hasLyrics ? 'inline-block' : 'none';
    }
  }

  if (qPlay && qPause) {
    qPlay.style.display = state.isPlaying ? 'none' : 'block';
    qPause.style.display = state.isPlaying ? 'block' : 'none';
  }

  if (qShuffle) {
    qShuffle.style.color = state.isShuffle ? '#1ed760' : 'rgba(255, 255, 255, 0.75)';
  }

  
  if (metaText && Array.isArray(state.queue)) {
    const totalCount = state.queue.length;
    let totalSecs = 0;
    state.queue.forEach(s => {
      totalSecs += (s.secs || s.duration || 210);
    });
    const totalHrs = Math.floor(totalSecs / 3600);
    const totalMins = Math.floor((totalSecs % 3600) / 60);
    const durStr = `${totalHrs > 0 ? totalHrs + ' hr ' : ''}${totalMins} min`;
    if (state.playbackContext && state.playbackContext.name) {
      metaText.textContent = `From ${state.playbackContext.isAlbum ? 'Album' : 'Playlist'}: ${state.playbackContext.name} • ${totalCount} songs • ${durStr}`;
    } else {
      metaText.textContent = `${totalCount} songs • ${durStr}`;
    }
  }

  if (!listContainer) return;

  const upcomingSongs = state.queue ? state.queue.slice(state.currentIndex + 1) : [];

  if (upcomingSongs.length === 0) {
    listContainer.innerHTML = `
      <div class="sp-q-empty-state">
        <p>No more upcoming songs in queue</p>
      </div>
    `;
    return;
  }

  let html = '';
  for (let i = 0; i < upcomingSongs.length; i++) {
    const s = upcomingSongs[i];
    const actualQueueIndex = state.currentIndex + 1 + i;
    const isLiked = state.likedSongs && state.likedSongs.includes(s.id);
    const hasLyrics = !!(s.lyrics || s.lyricsUrl || (s.id && String(s.id).includes('c-song-141')));
    const displayNum = i + 1;
    const albumName = s.album || s.movie || '';
    const durationStr = formatTime(s.secs || s.duration || 210);

    html += `
      <div class="sp-q-row" onclick="playSong(${actualQueueIndex})">
        <div class="sp-q-col-num">
          <span class="sp-q-num-text">${displayNum}</span>
          <button class="sp-q-row-play-btn" title="Play">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="sp-q-col-cover">
          <img src="${s.thumb || s.img || 'https://placehold.co/48x48/121212/1ed760?text=Music'}" alt="${s.title}">
        </div>
        <div class="sp-q-col-title-wrap">
          <span class="sp-q-row-title">${s.title}</span>
          <span class="sp-q-row-artist">${s.artist}</span>
          ${hasLyrics ? '<span class="sp-q-lyrics-badge">LYRICS</span>' : ''}
        </div>
        <div class="sp-q-col-album">
          ${albumName}
        </div>
        <div class="sp-q-col-time">
          ${durationStr}
        </div>
        <div class="sp-q-col-like" onclick="event.stopPropagation(); toggleLikeSong('${s.id}'); renderQueuePanel();">
          <button class="sp-q-row-like-btn ${isLiked ? 'liked' : ''}" title="Like">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? '#1ed760' : 'none'}" stroke="${isLiked ? '#1ed760' : 'currentColor'}" stroke-width="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  if (state.isFetchingRelated) {
    html += `
      <div class="sp-q-fetching-state">
        <div class="sp-lyrics-spinner" style="width:20px; height:20px; border-width:2px;"></div>
        <span>Fetching more related songs...</span>
      </div>
    `;
  }

  listContainer.innerHTML = html;
}

function clearQueue() {
  state.queue = [state.queue[state.currentIndex]];
  state.currentIndex = 0;
  renderQueuePanel();
}

function formatTime(secs) {
  if (isNaN(secs) || secs === Infinity) return '0:00';
  const hrs = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  if (hrs > 0) {
    return `${hrs}:${m.toString().padStart(2, '0')}:${s}`;
  }
  return `${m}:${s}`;
}

function syncEqualizer() {
  const eq = document.getElementById('equalizer');
  if (!eq) return;
  if (state.isPlaying) {
    eq.classList.add('playing');
  } else {
    eq.classList.remove('playing');
  }
}

function toggleMiniPlayer(e) {
  if (window.innerWidth <= 768) return;
  if (typeof MiniPlayer !== 'undefined' && MiniPlayer) {
    MiniPlayer.toggle(e);
  } else if (window.MiniPlayer) {
    window.MiniPlayer.toggle(e);
  }
}

let _diTimer = null;
const DI_ICONS = {
  success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  info:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

let _diMediaActive = false;

function showDynamicIsland(text, variant = 'success', durationMs = 3000) {
  const island = document.getElementById('dynamic-island');
  const notifContent = document.getElementById('di-notif-content');
  const mediaContent = document.getElementById('di-media-content');
  const diText = document.getElementById('di-text');
  const diIcon = document.getElementById('di-icon-wrap');
  
  if (!island || !diText) return;

  if (_diTimer) { clearTimeout(_diTimer); _diTimer = null; }

  if (notifContent) notifContent.style.display = 'flex';
  if (mediaContent) mediaContent.style.display = 'none';
  
  if (diIcon) diIcon.innerHTML = DI_ICONS[variant] || DI_ICONS.success;
  diText.textContent = text;
  
  island.className = 'dynamic-island di-' + variant;
  void island.offsetWidth;
  island.classList.add('di-show');

  _diTimer = setTimeout(() => {
    island.classList.remove('di-show');
    
    if (_diMediaActive && state.queue.length > 0) {
      setTimeout(() => {
        if (notifContent) notifContent.style.display = 'none';
        if (mediaContent) mediaContent.style.display = 'flex';
        island.className = 'dynamic-island di-media-playing';
      }, 400);
    } else {
      island.classList.add('di-hide');
      setTimeout(() => { island.className = 'dynamic-island'; }, 500);
    }
  }, durationMs);
}

function showNowPlayingIsland(song) {
  if (!song) return;
  const island = document.getElementById('dynamic-island');
  const notifContent = document.getElementById('di-notif-content');
  const mediaContent = document.getElementById('di-media-content');
  
  if (!island || !mediaContent) return;

  _diMediaActive = true;
  if (_diTimer) { clearTimeout(_diTimer); _diTimer = null; }

  const artUrl = song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music';
  const diArtSmall = document.getElementById('di-art-small');
  const diArtLarge = document.getElementById('di-art-large');
  const diTitle = document.getElementById('di-media-title');
  const diArtist = document.getElementById('di-media-artist');
  if (diArtSmall) diArtSmall.src = artUrl;
  if (diArtLarge) diArtLarge.src = artUrl;
  if (diTitle) diTitle.textContent = song.title || 'Unknown';
  if (diArtist) diArtist.textContent = song.artist || 'Unknown Artist';

  if (notifContent) notifContent.style.display = 'none';
  mediaContent.style.display = 'flex';
  
  if (!island.classList.contains('di-expanded')) {
    island.className = 'dynamic-island di-media-playing';
  }
}

function toggleDiExpanded() {
  if (!_diMediaActive) return;
  const island = document.getElementById('dynamic-island');
  if (!island) return;
  if (island.classList.contains('di-expanded')) {
    island.classList.remove('di-expanded');
    island.classList.add('di-media-playing');
  } else {
    island.classList.remove('di-media-playing');
    island.classList.remove('di-show');
    island.classList.add('di-expanded');
  }
}

function updateDiPlayState(isPlaying) {
  const smallWave = document.getElementById('di-waveform-small');
  const largeWave = document.getElementById('di-waveform-large');
  const playBtn = document.getElementById('di-play-btn');
  
  if (smallWave) isPlaying ? smallWave.classList.remove('paused') : smallWave.classList.add('paused');
  if (largeWave) isPlaying ? largeWave.classList.remove('paused') : largeWave.classList.add('paused');
  
  if (playBtn) {
    if (isPlaying) {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    } else {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
  }
}

function syncDiProgress() {
  if (!audio || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const fill = document.getElementById('di-prog-fill');
  const curTime = document.getElementById('di-curr-time');
  const totTime = document.getElementById('di-tot-time');
  
  if (fill) fill.style.width = pct + '%';
  if (curTime) curTime.textContent = formatTime(audio.currentTime);
  if (totTime) totTime.textContent = '-' + formatTime(audio.duration - audio.currentTime);
}

function seekDi(e) {
  if (!audio || !audio.duration) return;
  const bg = e.currentTarget;
  const rect = bg.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
}
