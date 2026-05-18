
'use strict';

const SONGS = [];
const ARTISTS = [];
const MIXES = [
  { id: 'm1', title: 'Chill Vibes Mix', sub: 'Relax and unwind', img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%231e1b4b"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Chill Vibes</text></svg>' },
  { id: 'm2', title: 'Workout Hits', sub: 'Get pumped', img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%237f1d1d"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Workout Hits</text></svg>' },
  { id: 'm3', title: 'Bollywood Mix', sub: 'Best of Bollywood', img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%2314532d"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Bollywood</text></svg>' },
  { id: 'm4', title: 'Acoustic Romance', sub: 'Unplugged love songs', img: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="%23701a75"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Acoustic</text></svg>' }
];
const PODCASTS = [];
const TRENDING = [];
const MADE_FOR_YOU = [];
const DISCOVER = [];

let state = {
  queue: [],
  currentIndex: 0,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  likedSongs: [],
  recentSongs: [],
  currentView: 'home',
  isMuted: false,
  lastVolume: 70,
  isMiniPlayer: false,
  songProgress: {},
  userPlaylists: [],
  followedArtists: []
};

let audio;
let searchTimeout;

let savedJioSaavnSongs = [];
let searchSource = 'youtube';
let ytBackendOnline = false;

function saveUserState() {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem('wave_liked_songs', JSON.stringify(state.likedSongs));
  localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
  localStorage.setItem('wave_followed_artists', JSON.stringify(state.followedArtists));
  localStorage.setItem('wave_recent_songs', JSON.stringify(state.recentSongs));
  localStorage.setItem('wave_recent_date', today);
  localStorage.setItem('wave_saved_jiosaavn', JSON.stringify(savedJioSaavnSongs));

  if (state.queue.length > 0) {
    localStorage.setItem('wave_session_queue', JSON.stringify(state.queue));
    localStorage.setItem('wave_session_index', String(state.currentIndex));
    const curTime = (audio && audio.currentTime > 0) ? audio.currentTime : 0;
    localStorage.setItem('wave_session_progress', String(curTime));
  }
}

function loadUserState() {
  const today = new Date().toISOString().split('T')[0];
  try {
    const savedJio = JSON.parse(localStorage.getItem('wave_saved_jiosaavn') || '[]');
    savedJioSaavnSongs = savedJio;
    savedJio.forEach(song => {
      if (!SONGS.find(s => s.id === song.id)) {
        SONGS.push(song);
      }
    });

    state.likedSongs = JSON.parse(localStorage.getItem('wave_liked_songs') || '[]');
    state.userPlaylists = JSON.parse(localStorage.getItem('wave_user_playlists') || '[]');
    state.followedArtists = JSON.parse(localStorage.getItem('wave_followed_artists') || '[]');

    const recentDate = localStorage.getItem('wave_recent_date');
    if (recentDate === today) {
      state.recentSongs = JSON.parse(localStorage.getItem('wave_recent_songs') || '[]');
    } else {
      state.recentSongs = [];
    }

    const savedQueue = localStorage.getItem('wave_session_queue');
    if (savedQueue) {
      const parsedQueue = JSON.parse(savedQueue);
      if (parsedQueue.length > 0) {
        state.queue = parsedQueue;
        state.currentIndex = parseInt(localStorage.getItem('wave_session_index') || '0', 10);
        state._resumeProgress = parseFloat(localStorage.getItem('wave_session_progress') || '0');
        parsedQueue.forEach(s => {
          if (!SONGS.find(x => x.id === s.id)) SONGS.push(s);
        });
      }
    }
  } catch (err) {
  }
}

function cacheJioSaavnSong(song) {
  if (!song || typeof song.id === 'number') return;
  if (song.audioUrl && song.audioUrl.startsWith('yt_stream_pending_')) return;
  if (!savedJioSaavnSongs.find(s => s.id === song.id)) {
    savedJioSaavnSongs.push(song);
    saveUserState();
  }
}

window.addEventListener('beforeunload', () => {
  saveUserState();
});

window.addEventListener('DOMContentLoaded', () => {
  loadUserState();
  loadUserProfile();
  renderView('home');
  initAudio();

  YOUTUBE_API.isAvailable().then(ok => {
    ytBackendOnline = ok;
    if (!ok) searchSource = 'jiosaavn';
  });

  if (!localStorage.getItem('wave_user_name')) {
    setTimeout(() => {
      document.getElementById('pm-heading').textContent = 'Welcome to Wave!';
      document.getElementById('pm-subtext').textContent = 'Tell us your name to get started';
      document.getElementById('profile-modal').classList.remove('hidden');
      setTimeout(() => document.getElementById('profile-name-input').focus(), 300);
    }, 2000);
  }
});

let navHistory = [{ view: 'home', param: undefined }];
let navIndex = 0;

function updateNavArrows() {
  const btnBack    = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');
  if (btnBack)    btnBack.disabled    = (navIndex <= 0);
  if (btnForward) btnForward.disabled = (navIndex >= navHistory.length - 1);
}

function goBack() {
  if (navIndex <= 0) return;
  navIndex--;
  const { view, param } = navHistory[navIndex];
  _renderViewAndNav(view, param);
  updateNavArrows();
}

function goForward() {
  if (navIndex >= navHistory.length - 1) return;
  navIndex++;
  const { view, param } = navHistory[navIndex];
  _renderViewAndNav(view, param);
  updateNavArrows();
}

function navigateTo(view, event, param) {
  if (event) event.preventDefault();

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (event && event.currentTarget && event.currentTarget.classList.contains('nav-item')) {
    event.currentTarget.classList.add('active');
  }

  document.querySelectorAll('.mob-nav-item').forEach(el => el.classList.remove('active'));
  if (event && event.currentTarget && event.currentTarget.classList.contains('mob-nav-item')) {
    event.currentTarget.classList.add('active');
  }

  if (navHistory[navIndex]?.view !== view || navHistory[navIndex]?.param !== param) {
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push({ view, param });
    navIndex = navHistory.length - 1;
  }

  state.currentView = view;
  renderView(view, param);
  updateNavArrows();
}

function _renderViewAndNav(view, param) {
  state.currentView = view;

  document.querySelectorAll('.nav-item').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    if (onclick.includes(`'${view}'`)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  renderView(view, param);
}

function renderView(view, param) {
  const container = document.getElementById('main-view');
  container.style.opacity = 0; 

  const isMobile = window.innerWidth <= 768;
  const island = document.getElementById('dynamic-island');
  if (island) island.style.display = (view === 'search' && isMobile) ? 'none' : '';

  setTimeout(() => {
    if (view === 'home') {
      container.innerHTML = getHomeHTML();
    } else if (view === 'playlist') {
      container.innerHTML = getPlaylistHTML(param);
    } else if (view === 'liked') {
      container.innerHTML = getLikedHTML();
    } else if (view === 'library') {
      container.innerHTML = getLibraryHTML();
    } else if (view === 'artist') {
      container.innerHTML = getArtistHTML(param);
    } else if (view === 'album') {
      container.innerHTML = getAlbumHTML(param);
    } else if (view === 'discover') {
      container.innerHTML = getDiscoverPageHTML();
    } else if (view === 'trending') {
      container.innerHTML = getTrendingPageHTML();
    } else if (view === 'podcasts') {
      container.innerHTML = getPodcastsPageHTML();
    } else if (view === 'search') {
      if (!isMobile) {
        return;
      }
      container.innerHTML = `
        <div style="padding-top: 20px; margin-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: 800; margin-bottom: 24px;">Search</h1>
          <div class="search-container" style="position: relative; width: 100%;">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input type="text" id="mobile-search-input" placeholder="Search for songs, artists, albums..." class="search-input" oninput="handleSearch(event)" style="width: 100%; padding: 16px 20px 16px 48px; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; font-size: 16px;" autofocus>
            <div id="mobile-search-dropdown" class="search-dropdown hidden" style="top: 100%; margin-top: 8px; border-radius: 12px; max-height: 400px; overflow-y: auto;"></div>
          </div>
          <div class="discover-quick-tags" style="margin-top: 20px;">
            <button onclick="document.getElementById('mobile-search-input').value='Arijit Singh'; handleSearch({target: document.getElementById('mobile-search-input')})">Arijit Singh</button>
            <button onclick="document.getElementById('mobile-search-input').value='Diljit Dosanjh'; handleSearch({target: document.getElementById('mobile-search-input')})">Diljit Dosanjh</button>
            <button onclick="document.getElementById('mobile-search-input').value='Bollywood Hits'; handleSearch({target: document.getElementById('mobile-search-input')})">Bollywood Hits</button>
            <button onclick="document.getElementById('mobile-search-input').value='Punjabi Songs'; handleSearch({target: document.getElementById('mobile-search-input')})">Punjabi Songs</button>
            <button onclick="document.getElementById('mobile-search-input').value='Lo-Fi Hindi'; handleSearch({target: document.getElementById('mobile-search-input')})">Lo-Fi</button>
            <button onclick="document.getElementById('mobile-search-input').value='English Hits'; handleSearch({target: document.getElementById('mobile-search-input')})">English Hits</button>
          </div>
        </div>
        <div id="search-results-area"></div>
      `;
      if (param) {
         const inp = document.getElementById('mobile-search-input');
         if (inp) inp.value = param;
         showSearchResults(param);
      }
      container.style.opacity = 1;
      return;
    } else if (view === 'jiosaavn-browse') {
      renderJioSaavnBrowse(container);

    } else {

      container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h2 style="font-size: 28px; margin-bottom: 10px;">${view.charAt(0).toUpperCase() + view.slice(1)}</h2>
          <p style="color: var(--text-muted);">This page is coming soon!</p>
        </div>
      `;
    }
    container.style.opacity = 1;
  }, 150);
}

function getGreeting() {
  const hour = new Date().getHours();
  const name = localStorage.getItem('wave_user_name') || 'Friend';
  if (hour >= 5 && hour < 12) {
    return { title: `Good Morning, ${name}`, text: "Kickstart your day with some music!" };
  } else if (hour >= 12 && hour < 17) {
    return { title: `Good Afternoon, ${name}`, text: "Keep your energy up with these hits!" };
  } else if (hour >= 17 && hour < 21) {
    return { title: `Good Evening, ${name}`, text: "Wind down with some relaxing tunes." };
  } else {
    return { title: `Good Night, ${name}`, text: "Late night vibes just for you." };
  }
}

function getHomeHTML() {

  let recentRow = '';
  if (state.recentSongs.length > 0) {
    recentRow = buildSection('Recently Played', state.recentSongs.slice(0, 20), false);
  }

  const greeting = getGreeting();

  setTimeout(() => { _populateHomeSections(); }, 200);

  return `
    <div class="greeting-row">
      <h1>${greeting.title}</h1>
      <p>${greeting.text}</p>
    </div>

    <div id="hero-banner" style="display: none; transition: opacity 0.3s ease;">
    </div>

    <div id="sections-container">
      ${recentRow}
      <!-- Smart Recommendations (injected live when song plays) -->
      <div id="rec-artist-section"></div>
      <div id="rec-genre-section"></div>
      <!-- Dynamic YouTube Music Sections (populated after render) -->
      <div id="home-discover-section">${_homeSkeleton('Discover Fresh')}</div>
      <div id="home-trending-section">${_homeSkeleton('Trending Now')}</div>
      <div id="home-mixes-section">${_homeSkeleton('Your Top Mixes')}</div>
      <div id="home-podcasts-section">${_homeSkeleton('Podcasts & Talks')}</div>
      <div id="home-madeforyou-section">${_homeSkeleton('Made For You')}</div>
      <div id="home-newreleases-section">${_homeSkeleton('New Releases')}</div>
    </div>

    ${getFooterHTML()}
  `;
}

function _homeSkeleton(title) {
  return `
    <div class="section-block">
      <div class="section-header">
        <h2 class="rec-title-animated">${title}</h2>
        <span style="font-size:11px; color:#ef4444; font-weight:600; display:flex; align-items:center; gap:5px;">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>
          Loading...
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

function _buildDynamicSection(title, songs, badge, source) {
  if (!songs || songs.length === 0) {
    return `
      <div class="section-block rec-section-in">
        <div class="section-header">
          <h2>${title}</h2>
        </div>
        <div style="padding: 20px 0; color: var(--text-muted); font-size: 14px; text-align: center;">
          <p>No content available right now. Try refreshing!</p>
        </div>
      </div>
    `;
  }
  const badgeHtml = badge ? `<div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,${badge.bg}); padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; color:${badge.color}; letter-spacing:0.5px;">${badge.text}</div>` : '';

  const isJioSaavn = source === 'jiosaavn';
  const sourceIcon = isJioSaavn 
    ? `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>`;
  const sourceLabel = isJioSaavn ? 'JioSaavn' : 'YouTube Music';
  const sourceColor = isJioSaavn ? '#1db954' : '#ef4444';

  const cards = songs.map(song => `
    <div class="music-card rec-card" onclick="playJioSaavnSong(SONGS.find(s=>s.id==='${song.id}'))">
      <div class="card-img-wrap">
        <img src="${song.img || song.thumb}" alt="${song.title}" loading="lazy" onerror="this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Music'">
        <div class="card-overlay">
          <button class="card-play-btn" onclick="event.stopPropagation(); playJioSaavnSong(SONGS.find(s=>s.id==='${song.id}'))">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        ${badgeHtml}
      </div>
      <div class="card-info">
        <h3>${song.title}</h3>
        <p>${song.artist}</p>
      </div>
    </div>
  `).join('');

  return `
    <div class="section-block rec-section-in">
      <div class="section-header">
        <h2>${title}</h2>
        <span style="font-size:11px; color:${sourceColor}; font-weight:600; display:flex; align-items:center; gap:5px;">
          ${sourceIcon}
          ${sourceLabel}
        </span>
      </div>
      <div class="cards-container">${cards}</div>
    </div>
  `;
}

async function _populateHomeSections() {

  let mfyQueries = [];

  const userArtists = [];
  state.recentSongs.forEach(s => {
    const a = (s.artist || '').split(',')[0].trim();
    if (a && !userArtists.includes(a)) userArtists.push(a);
  });
  SONGS.filter(s => state.likedSongs.includes(s.id)).forEach(s => {
    const a = (s.artist || '').split(',')[0].trim();
    if (a && !userArtists.includes(a)) userArtists.push(a);
  });

  if (userArtists.length >= 2) {
    mfyQueries = userArtists.slice(0, 3).map(a => a + ' best songs');
  } else {
    mfyQueries = [
      'Arijit Singh best songs',
      'Atif Aslam romantic hits',
      'Shreya Ghoshal top songs'
    ];
  }

  const currentYear = new Date().getFullYear();
  const useYT = ytBackendOnline;
  
  async function _fetchSongs(query, limit) {
    if (useYT) {
      const ytResults = await YOUTUBE_API.searchSongs(query, limit);
      if (ytResults && ytResults.length > 0) return { songs: ytResults, source: 'youtube' };
    }
    try {
      const jioResults = await JIOSAAVN_API.searchSongs(query, limit);
      return { songs: jioResults.filter(s => s.audioUrl), source: 'jiosaavn' };
    } catch (e) {
      return { songs: [], source: 'none' };
    }
  }

  async function _fetchTrending(limit) {
    if (useYT) {
      const ytResults = await YOUTUBE_API.getTrending(limit);
      if (ytResults && ytResults.length > 0) return { songs: ytResults, source: 'youtube' };
    }
    try {
      const jioResults = await JIOSAAVN_API.searchSongs('trending hits ' + currentYear, limit);
      return { songs: jioResults.filter(s => s.audioUrl), source: 'jiosaavn' };
    } catch (e) {
      return { songs: [], source: 'none' };
    }
  }

  const queries = {
    discover:    _fetchSongs(`new songs ${currentYear}`, 10),
    trending:    _fetchTrending(10),
    mixes:       _fetchSongs('party hits', 10),
    podcasts:    _fetchSongs('motivational podcast', 8),
    newReleases: _fetchSongs(`new releases ${currentYear}`, 10),
    mfy1:        _fetchSongs(mfyQueries[0], 6),
    mfy2:        _fetchSongs(mfyQueries[1], 6),
    mfy3:        _fetchSongs(mfyQueries[2] || 'Neha Kakkar hits', 6),
  };

  const results = await Promise.allSettled(Object.values(queries));
  const keys = Object.keys(queries);
  const data = {};
  const sources = {};
  keys.forEach((k, i) => {
    const r = results[i];
    const val = r.status === 'fulfilled' ? r.value : { songs: [], source: 'none' };
    data[k] = val.songs || [];
    sources[k] = val.source || 'none';

    data[k].forEach(s => { if (!SONGS.find(x => x.id === s.id)) SONGS.push(s); });
  });

  function _sourceBadge(source, badge) {
    if (source === 'jiosaavn') {
      return { ...badge, text: badge.text };
    }
    return badge;
  }

  const bannerEl = document.getElementById('hero-banner');
  if (bannerEl && data.trending && data.trending.length > 0) {
    const heroSong = data.trending[0];
    bannerEl.className = 'hero-banner';
    bannerEl.style.display = 'flex';
    bannerEl.style.opacity = '1';
    bannerEl.innerHTML = `
      <div class="hero-bg">
        <img src="${heroSong.thumb || heroSong.img}" alt="${heroSong.title}">
      </div>
      <div class="hero-content" style="display: flex; align-items: center; gap: 24px;">
        <img src="${heroSong.thumb || heroSong.img}" style="width: 140px; height: 140px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); object-fit: cover;" class="hero-cover-sharp">
        <div class="hero-text">
          <span class="hero-tag">TRENDING NOW</span>
          <h2 class="hero-title">${heroSong.title}</h2>
          <p class="hero-artist">${heroSong.artist}</p>
          <div class="hero-actions">
            <button class="play-btn-main" onclick="playJioSaavnSong(SONGS.find(s=>s.id==='${heroSong.id}'))">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play Now
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const discoverEl = document.getElementById('home-discover-section');
  if (discoverEl) {
    discoverEl.innerHTML = _buildDynamicSection('Discover Fresh', data.discover, 
      _sourceBadge(sources.discover, { bg: '#1db954,#1ed760', color: '#000', text: 'NEW' }), sources.discover);
  }

  const trendingEl = document.getElementById('home-trending-section');
  if (trendingEl) {
    trendingEl.innerHTML = _buildDynamicSection('Trending Now', data.trending.slice(1), 
      _sourceBadge(sources.trending, { bg: '#ef4444,#f97316', color: '#fff', text: 'HOT' }), sources.trending);
  }

  const mixesEl = document.getElementById('home-mixes-section');
  if (mixesEl) {
    mixesEl.innerHTML = _buildDynamicSection('Your Top Mixes', data.mixes, 
      _sourceBadge(sources.mixes, { bg: '#a855f7,#6366f1', color: '#fff', text: 'MIX' }), sources.mixes);
  }

  const podcastsEl = document.getElementById('home-podcasts-section');
  if (podcastsEl) {
    podcastsEl.innerHTML = _buildDynamicSection('Podcasts & Talks', data.podcasts, 
      _sourceBadge(sources.podcasts, { bg: '#0ea5e9,#06b6d4', color: '#fff', text: 'TALK' }), sources.podcasts);
  }

  const mfySongs = [...(data.mfy1 || []), ...(data.mfy2 || []), ...(data.mfy3 || [])];

  const uniqueMfy = [];
  const mfyIds = new Set();
  mfySongs.forEach(s => { if (!mfyIds.has(s.id)) { mfyIds.add(s.id); uniqueMfy.push(s); } });

  const mfySource = sources.mfy1 || sources.mfy2 || 'none';
  const mfyEl = document.getElementById('home-madeforyou-section');
  if (mfyEl) {
    const mfyLabel = userArtists.length >= 2 
      ? `Made For You â€” ${userArtists.slice(0, 2).join(', ')} & more`
      : "Made For You â€” India's Best";
    mfyEl.innerHTML = _buildDynamicSection(mfyLabel, uniqueMfy.slice(0, 12), 
      _sourceBadge(mfySource, { bg: '#a855f7,#ec4899', color: '#fff', text: 'FOR YOU' }), mfySource);
  }

  const newReleasesEl = document.getElementById('home-newreleases-section');
  if (newReleasesEl) {
    newReleasesEl.innerHTML = _buildDynamicSection('New Releases', data.newReleases, 
      _sourceBadge(sources.newReleases, { bg: '#f59e0b,#ef4444', color: '#fff', text: 'LATEST' }), sources.newReleases);
  }
}

function getFooterHTML() {
  return `
    <footer class="app-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Jobs</a>
          <a href="#">For the Record</a>
        </div>
        <div class="footer-col">
          <h4>Communities</h4>
          <a href="#">For Artists</a>
          <a href="#">Developers</a>
          <a href="#">Advertising</a>
          <a href="#">Investors</a>
        </div>
        <div class="footer-col">
          <h4>Useful Links</h4>
          <a href="#">Support</a>
          <a href="#">Web Player</a>
          <a href="#">Mobile App</a>
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <div class="footer-socials">
            <a href="#" class="social-icon" title="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
            <a href="#" class="social-icon" title="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" class="social-icon" title="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <p>&copy; 2026 Wave Music. All rights reserved.</p>
        <div class="footer-links">
          <a href="#">Legal</a>
          <a href="#">Privacy</a>
          <a href="#">Cookies</a>
          <a href="#">Accessibility</a>
        </div>
      </div>
    </footer>
  `;
}

function getPlaylistHTML(playlistId) {
  const allPlaylists = [...MIXES, ...PODCASTS, ...TRENDING, ...MADE_FOR_YOU, ...DISCOVER, ...state.userPlaylists];
  const playlist = allPlaylists.find(p => p.id === playlistId) || allPlaylists[0];

  const isCustom = playlistId.startsWith('up_');
  const deleteBtn = isCustom ? `<br><button class="clear-queue-btn" style="margin-top: 15px; padding: 6px 12px; background: rgba(255,50,50,0.1); color: #ff5555; border: 1px solid rgba(255,50,50,0.3);" onclick="deletePlaylist('${playlistId}')">ðŸ—‘ï¸ Delete Playlist</button>` : '';

  let playlistSongs = [];
  let isDynamicMix = false;

  if (playlist.songs) {

    playlistSongs = playlist.songs.map(id => SONGS.find(s => s.id === id)).filter(Boolean);
  } else if (playlistId.startsWith('m')) {

    isDynamicMix = true;
  } else {

    playlistSongs = SONGS.slice().sort(() => 0.5 - Math.random()).slice(0, 8);
  }

  let listHTML = '';

  if (isDynamicMix) {
    listHTML = `<div id="mix-loading-container" style="padding: 40px; text-align: center; color: var(--text-muted);">
      <div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>
      Loading 50 songs from JioSaavn...
    </div>`;

    setTimeout(async () => {
      try {
        const query = playlist.title.replace('Mix', '').trim() + " hits";
        const results = await YOUTUBE_API.searchSongs(query, 20);

        let loadedHtml = '';
        results.forEach((song, i) => {
          if (!SONGS.find(s => s.id === song.id)) SONGS.push(song);

          loadedHtml += `
            <div class="list-row" onclick="const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
              <div class="col-num">${i + 1}</div>
              <div class="col-title">
                <img src="${song.thumb}" alt="">
                <div>
                  <h4>${song.title}</h4>
                  <p>${song.artist}</p>
                </div>
              </div>
              <div class="col-album">${song.album || 'Single'}</div>
              <div class="col-time">${song.duration}</div>
            </div>
          `;
        });

        const container = document.getElementById('mix-loading-container');
        if (container) container.outerHTML = loadedHtml;
      } catch (err) {
        const container = document.getElementById('mix-loading-container');
        if (container) container.innerHTML = '<div style="padding:20px; color:#ff5555; text-align:center;">Failed to load mix from JioSaavn.</div>';
      }
    }, 100);
  } else {
    listHTML = playlistSongs.length > 0 ? playlistSongs.map((song, i) => `
      <div class="list-row" onclick="playSong(${SONGS.indexOf(song)})">
        <div class="col-num">${i + 1}</div>
        <div class="col-title">
          <img src="${song.thumb}" alt="">
          <div>
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
          </div>
        </div>
        <div class="col-album">${song.album || 'Single'}</div>
        <div class="col-time" style="display: flex; align-items: center; justify-content: space-between;">
          <span>${song.duration}</span>
          ${isCustom ? `
          <div class="song-options-menu" style="position: relative;" onclick="event.stopPropagation()">
            <button class="icon-btn" onclick="toggleSongOptions(event, '${playlistId}', '${song.id}')" style="padding: 4px; margin-left: 10px;">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
            <div id="song-options-${playlistId}-${song.id}" class="search-dropdown hidden song-options-dropdown" style="position: absolute; right: 0; top: 100%; width: 150px; z-index: 100;">
              <div class="dropdown-item" style="color: #ff5555;" onclick="removeSongFromPlaylist('${playlistId}', '${song.id}')">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:8px;"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg> Remove
              </div>
            </div>
          </div>` : ''}
        </div>
      </div>
    `).join('') : '<div style="padding: 20px; color: var(--text-muted); text-align: center;">No songs in this playlist yet. Add some!</div>';
  }

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    <div class="pl-header">
      <img src="${playlist.img}" class="pl-cover" alt="">
      <div class="pl-info">
        <span style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Playlist</span>
        <h1>${playlist.title}</h1>
        <p style="color: var(--text-muted);">${playlist.sub} â€¢ ${isDynamicMix ? '50' : playlistSongs.length} songs</p>
        ${deleteBtn}
      </div>
    </div>

    <div class="list-head">
      <div class="col-num">#</div>
      <div class="col-title">TITLE</div>
      <div class="col-album">ALBUM</div>
      <div class="col-time">TIME</div>
    </div>
    <div id="playlist-songs-container">
      ${listHTML}
    </div>
  `;
}

function getLikedHTML() {
  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  if (likedSongs.length === 0) {
    return `<div style="padding: 40px;"><h2>Liked Songs</h2><p style="color: var(--text-muted); margin-top:10px;">You haven't liked any songs yet.</p></div>`;
  }

  const listHTML = likedSongs.length > 0 ? likedSongs.map((song, i) => `
    <div class="list-row" onclick="playSpecificSong('${song.id}')">
      <div class="col-num">${i + 1}</div>
      <div class="col-title">
        <img src="${song.thumb}" alt="">
        <div><h4>${song.title}</h4><p>${song.artist}</p></div>
      </div>
      <div class="col-album">${song.album}</div>
      <div class="col-time">${song.duration}</div>
    </div>
  `).join('') : '<div style="padding: 20px; color: var(--text-muted);">No liked songs yet.</div>';

  return `
    <div style="padding-top: 20px; margin-bottom: 30px;">
      <h1 style="font-size: 42px; font-weight: 800;">Liked Songs</h1>
      <p style="color: var(--text-muted); margin-top: 8px;">${likedSongs.length} songs</p>
    </div>
    <div class="list-head">
      <div class="col-num">#</div>
      <div class="col-title">TITLE</div>
      <div class="col-album">ALBUM</div>
      <div class="col-time">TIME</div>
    </div>
    ${listHTML}
  `;
}

function getLibraryHTML() {
  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  const recentSongs = state.recentSongs.slice(0, 10);

  const likedCard = `
    <div class="lib-card" onclick="navigateTo('liked', null)">
      <div class="lib-card-art lib-card-liked">
        <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36" style="color:white;">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div class="lib-card-info">
        <div class="lib-card-title">Liked Songs</div>
        <div class="lib-card-sub">${likedSongs.length} songs</div>
      </div>
      <button class="lib-card-play" onclick="event.stopPropagation(); playLikedSongs()">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  `;

  const createBtn = `
    <div class="lib-card lib-card-create" onclick="openCreatePlaylist()">
      <div class="lib-card-art lib-card-new">
        <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32" style="color:white;">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </div>
      <div class="lib-card-info">
        <div class="lib-card-title">New Playlist</div>
        <div class="lib-card-sub">Create a playlist</div>
      </div>
    </div>
  `;

  const playlistCards = state.userPlaylists.map(pl => {
    const songCount = pl.songs ? pl.songs.length : 0;
    return `
      <div class="lib-card" onclick="navigateTo('playlist', null, '${pl.id}')">
        <div class="lib-card-art" style="background: linear-gradient(135deg, rgba(168,85,247,0.3), rgba(59,130,246,0.2));">
          <img src="${pl.img}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px;" onerror="this.style.display='none'">
        </div>
        <div class="lib-card-info">
          <div class="lib-card-title">${pl.title}</div>
          <div class="lib-card-sub">Playlist â€¢ ${songCount} songs</div>
        </div>
        <button class="lib-card-play" onclick="event.stopPropagation(); navigateTo('playlist', null, '${pl.id}')">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
    `;
  }).join('');

  const recentSection = recentSongs.length > 0 ? `
    <div style="margin-top: 32px;">
      <h2 style="font-size:18px; font-weight:700; margin-bottom:14px;">Recently Played</h2>
      ${recentSongs.map(song => `
        <div class="list-row" onclick="playRecentSong('${song.id}')">
          <div class="col-title" style="flex:1;">
            <img src="${song.thumb}" alt="" style="width:44px;height:44px;border-radius:8px;object-fit:cover;">
            <div><h4 style="font-size:14px;">${song.title}</h4><p style="font-size:12px;color:var(--text-muted);">${song.artist}</p></div>
          </div>
          <div style="color:var(--text-dark);font-size:12px;">${song.duration || ''}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  return `
    <style>
      .lib-header { display:flex; justify-content:space-between; align-items:center; padding-top:20px; margin-bottom:20px; }
      .lib-header h1 { font-size:28px; font-weight:800; }
      .lib-card {
        display:flex; align-items:center; gap:14px;
        padding:12px 14px; border-radius:12px;
        cursor:pointer; transition:0.2s;
        background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01));
        border: 1px solid rgba(255,255,255,0.07);
        margin-bottom:10px;
      }
      .lib-card:hover { background: rgba(255,255,255,0.08); border-color: rgba(168,85,247,0.2); }
      .lib-card:active { transform: scale(0.98); }
      .lib-card-art {
        width:54px; height:54px; border-radius:10px; flex-shrink:0;
        display:flex; align-items:center; justify-content:center;
        overflow:hidden; position:relative;
      }
      .lib-card-liked { background: linear-gradient(135deg, #a855f7, #6366f1); }
      .lib-card-new   { background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04)); border: 2px dashed rgba(255,255,255,0.2); }
      .lib-card-info  { flex:1; overflow:hidden; }
      .lib-card-title { font-size:15px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .lib-card-sub   { font-size:12px; color:var(--text-muted); margin-top:3px; }
      .lib-card-play  {
        width:36px; height:36px; border-radius:50%; flex-shrink:0;
        background:var(--neon-purple); border:none; color:white;
        display:flex; align-items:center; justify-content:center;
        opacity:0; transition:0.2s; cursor:pointer;
      }
      .lib-card:hover .lib-card-play { opacity:1; }
      .lib-card-create .lib-card-play { display:none; }
      @media (max-width:768px) {
        .lib-card-play { opacity:1 !important; }
        .lib-header h1 { font-size:24px; }
      }
    </style>

    <div class="lib-header">
      <h1>My Library</h1>
      <button onclick="openCreatePlaylist()" style="background:none;border:none;color:var(--neon-purple);font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        New Playlist
      </button>
    </div>

    <div id="lib-list">
      ${likedCard}
      ${createBtn}
      ${playlistCards}
    </div>

    ${recentSection}
  `;
}

function playLikedSongs() {
  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  if (!likedSongs.length) return;
  state.queue = [...likedSongs];
  state.currentIndex = 0;
  playSong(0);
}

function getArtistHTML(artistId) {
  const artist = ARTISTS.find(a => a.id === artistId) || ARTISTS[0];
  const artistSongs = SONGS.filter(s => s.artist.toLowerCase() === artist.name.toLowerCase());

  const listHTML = artistSongs.map((song, i) => `
    <div class="list-row" onclick="playSpecificSong('${song.id}')">
      <div class="col-num">${i + 1}</div>
      <div class="col-title">
        <img src="${song.thumb}" alt="">
        <div><h4>${song.title}</h4><p>${song.artist}</p></div>
      </div>
      <div class="col-time">${song.duration}</div>
    </div>
  `).join('');

  const isFollowed = state.followedArtists.includes(artist.id);
  const followBtnClass = isFollowed ? 'follow-btn following' : 'follow-btn';
  const followBtnText = isFollowed ? 'Following' : 'Follow';

  return `
    <div class="pl-header" style="align-items: center; margin-top: 20px;">
      <img src="${artist.img}" class="pl-cover" style="border-radius: 50%;" alt="">
      <div class="pl-info">
        <span style="font-size: 12px; font-weight: 700; color: #3b82f6; display: flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          Verified Artist
        </span>
        <h1 style="font-size: 72px;">${artist.name}</h1>
        <p style="color: var(--text-muted); margin-bottom: 16px;">${artist.listeners || '1,234,567'} monthly listeners</p>
        <button class="${followBtnClass}" onclick="toggleFollow('${artist.id}')">${followBtnText}</button>
      </div>
    </div>
    <h3 style="margin: 30px 0 16px; font-size: 24px;">Popular</h3>
    ${listHTML}
  `;
}

function getDiscoverPageHTML() {
  setTimeout(async () => {
    try {
      const container = document.getElementById('dynamic-discover-container');
      if (!container) return;
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>Discovering fresh music from JioSaavn...</div>';

      const results = await YOUTUBE_API.searchSongs('New Hits 2024', 16);

      let html = `
        <div class="section-block" style="margin-top:8px;">
          <div class="section-header">
            <h2>Fresh Releases</h2>
            <span style="font-size:12px; color:#1db954; font-weight:600; display:flex; align-items:center; gap:5px;">
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
              Powered by JioSaavn
            </span>
          </div>
          <div class="cards-container">
      `;
      results.forEach((song, i) => {
        if (!SONGS.find(s => s.id === song.id)) SONGS.push(song);
        html += `
          <div class="music-card" onclick="const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
            <div class="card-img-wrap">
              <img src="${song.img || song.thumb}" alt="${song.title}" loading="lazy">
              <div class="card-overlay">
                <button class="card-play-btn" onclick="event.stopPropagation(); const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#1db954,#1ed760); padding:2px 7px; border-radius:4px; font-size:9px; font-weight:700; color:#000; letter-spacing:0.5px;">NEW</div>
            </div>
            <div class="card-info">
              <h3>${song.title}</h3>
              <p>${song.artist}</p>
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
      container.innerHTML = html;

    } catch(e) {}
  }, 100);

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    <div style="padding-top: 20px; margin-bottom: 30px;">
      <h1 style="font-size: 42px; font-weight: 800;">Discover</h1>
      <p style="color: var(--text-muted); margin-top: 8px;">Explore new music just for you</p>
    </div>

    <div class="jiosaavn-discover-search" style="margin-bottom:40px;">
      <div class="discover-search-bar">
        <input type="text" id="discover-search-input" placeholder="Search for any Hindi, English, Punjabi song..." 
               onkeydown="if(event.key==='Enter') showSearchResults(this.value)">
        <button onclick="showSearchResults(document.getElementById('discover-search-input').value)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          Search
        </button>
      </div>
    </div>

    <div id="dynamic-discover-container"></div>
  `;
}

function getTrendingPageHTML() {
  setTimeout(async () => {
    try {
      const container = document.getElementById('dynamic-trending-container');
      if (!container) return;
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>Loading Live Trending Charts from JioSaavn...</div>';

      const results = await YOUTUBE_API.getTrending(16);

      let html = `
        <div class="section-block" style="margin-top:8px;">
          <div class="section-header">
            <h2>Live Top Charts</h2>
            <span style="font-size:12px; color:#ef4444; font-weight:600; display:flex; align-items:center; gap:5px;">
              ðŸ”´ Live
            </span>
          </div>
          <div class="cards-container">
      `;
      results.forEach((song, i) => {
        if (!SONGS.find(s => s.id === song.id)) SONGS.push(song);
        html += `
          <div class="music-card" onclick="const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
            <div class="card-img-wrap">
              <img src="${song.img || song.thumb}" alt="${song.title}" loading="lazy">
              <div class="card-overlay">
                <button class="card-play-btn" onclick="event.stopPropagation(); const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.75); padding:2px 7px; border-radius:4px; font-size:11px; font-weight:800; color:white;">#${i+1}</div>
              <div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ef4444,#f97316); padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; color:white; letter-spacing:0.5px;">LIVE</div>
            </div>
            <div class="card-info">
              <h3>${song.title}</h3>
              <p>${song.artist}</p>
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
      container.innerHTML = html;
    } catch(e) {}
  }, 100);

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    <div style="padding-top: 20px; margin-bottom: 30px;">
      <h1 style="font-size: 42px; font-weight: 800;">Trending</h1>
      <p style="color: var(--text-muted); margin-top: 8px;">What's hot right now globally and in India</p>
    </div>

    <div class="jiosaavn-trending-bar">
      <span class="trending-label">ðŸ”¥ Quick Play from JioSaavn:</span>
      <div class="trending-quick-btns">
        <button onclick="showSearchResults('trending Hindi songs 2024')">Hindi Trending</button>
        <button onclick="showSearchResults('Diljit Dosanjh')">Diljit Dosanjh</button>
        <button onclick="showSearchResults('Honey Singh party')">Yo Yo Honey Singh</button>
        <button onclick="showSearchResults('Badshah latest')">Badshah</button>
        <button onclick="showSearchResults('BTS')">BTS</button>
      </div>
    </div>

    <div id="dynamic-trending-container"></div>
  `;
}

function getPodcastsPageHTML() {
  setTimeout(async () => {
    try {
      const container = document.getElementById('dynamic-podcasts-container');
      if (!container) return;
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>Loading popular podcasts...</div>';

      const results = await YOUTUBE_API.searchSongs('Popular Podcasts', 12);

      let html = `
        <div class="section-block" style="margin-top:8px;">
          <div class="section-header">
            <h2>Top Podcasts</h2>
            <span style="font-size:12px; color:#1db954; font-weight:600;">on JioSaavn</span>
          </div>
          <div class="cards-container">
      `;
      results.forEach((song, i) => {
        if (!SONGS.find(s => s.id === song.id)) SONGS.push(song);
        html += `
          <div class="music-card wide" onclick="const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
            <div class="card-img-wrap">
              <img src="${song.img || song.thumb}" alt="${song.title}" loading="lazy">
              <div class="card-overlay">
                <button class="card-play-btn" onclick="event.stopPropagation(); const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#1db954,#1ed760); padding:2px 7px; border-radius:4px; font-size:9px; font-weight:700; color:#000; letter-spacing:0.5px;">PODCAST</div>
            </div>
            <div class="card-info">
              <h3>${song.title}</h3>
              <p>${song.artist}</p>
            </div>
          </div>
        `;
      });
      html += `</div></div>`;
      container.innerHTML = html;
    } catch(e) {}
  }, 100);

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    <div style="padding-top: 20px; margin-bottom: 30px;">
      <h1 style="font-size: 42px; font-weight: 800; display: flex; align-items: center; gap: 12px;">
        <svg viewBox="0 0 24 24" fill="currentColor" style="width: 42px; height: 42px; color: var(--neon-purple);"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
        Podcasts
      </h1>
      <p style="color: var(--text-muted); margin-top: 8px;">Listen to the best podcasts directly fetched from JioSaavn</p>
    </div>
    <div id="dynamic-podcasts-container"></div>
  `;
}

async function renderJioSaavnBrowse(container) {
  container.innerHTML = `
    <div style="padding-top: 20px; margin-bottom: 30px;">
      <h1 style="font-size: 42px; font-weight: 800;">ðŸŽµ Browse JioSaavn</h1>
      <p style="color: var(--text-muted); margin-top: 8px;">Search and play millions of songs</p>
    </div>
    <div class="jiosaavn-discover-search" style="margin-bottom:40px;">
      <div class="discover-search-bar">
        <input type="text" id="browse-search-input" placeholder="Search any song, artist, album..." 
               onkeydown="if(event.key==='Enter') showSearchResults(this.value)" autofocus>
        <button onclick="showSearchResults(document.getElementById('browse-search-input').value)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
          Search
        </button>
      </div>
      <div class="discover-quick-tags">
        <button onclick="showSearchResults('Arijit Singh')">Arijit Singh</button>
        <button onclick="showSearchResults('Lata Mangeshkar classics')">Lata Mangeshkar</button>
        <button onclick="showSearchResults('Kishore Kumar')">Kishore Kumar</button>
        <button onclick="showSearchResults('Neha Kakkar')">Neha Kakkar</button>
        <button onclick="showSearchResults('Jubin Nautiyal')">Jubin Nautiyal</button>
        <button onclick="showSearchResults('Shreya Ghoshal')">Shreya Ghoshal</button>
        <button onclick="showSearchResults('Sidhu Moose Wala')">Sidhu Moose Wala</button>
        <button onclick="showSearchResults('latest English songs')">English Hits</button>
        <button onclick="showSearchResults('Bollywood 90s hits')">90s Bollywood</button>
        <button onclick="showSearchResults('Sufi songs')">Sufi</button>
        <button onclick="showSearchResults('Punjabi songs 2024')">Punjabi</button>
        <button onclick="showSearchResults('lofi Hindi')">Lo-Fi Hindi</button>
      </div>
    </div>
  `;
  container.style.opacity = 1;
}

function getAlbumHTML(albumName) {
  const albumSongs = SONGS.filter(s => s.album === albumName);
  const cover = albumSongs.length ? albumSongs[0].thumb : '';
  const artist = albumSongs.length ? albumSongs[0].artist : 'Unknown';

  const listHTML = albumSongs.map((song, i) => `
    <div class="list-row" onclick="playSpecificSong('${song.id}')">
      <div class="col-num">${i + 1}</div>
      <div class="col-title">
        <div><h4>${song.title}</h4><p>${song.artist}</p></div>
      </div>
      <div class="col-time">${song.duration}</div>
    </div>
  `).join('');

  return `
    <div class="pl-header">
      <img src="${cover}" class="pl-cover" alt="">
      <div class="pl-info">
        <span style="font-size: 12px; font-weight: 700;">ALBUM</span>
        <h1>${albumName}</h1>
        <p style="color: var(--text-muted);">
          <a href="#" onclick="navigateTo('artist', event, '${ARTISTS.find(a=>a.name===artist)?.id||'a1'}')" style="color: white; font-weight: 600; text-decoration: none;">${artist}</a> â€¢ 2024 â€¢ ${albumSongs.length} songs
        </p>
      </div>
    </div>
    <div class="list-head">
      <div class="col-num">#</div>
      <div class="col-title">TITLE</div>
      <div class="col-time">TIME</div>
    </div>
    ${listHTML}
  `;
}

function buildSection(title, items, isWide) {
  const isRecent = title === 'Recently Played';
  const cards = items.map((item, i) => {
    const isArtist = !!item.name;
    const playAction = isArtist 
      ? `event.stopPropagation(); navigateTo('artist', null, '${item.id}')` 
      : (isRecent ? `event.stopPropagation(); playRecentSong('${item.id}')` : (isWide ? `event.stopPropagation(); navigateTo('playlist', null, '${item.id}')` : `event.stopPropagation(); playSpecificSong('${item.id}')`));
    const clickAction = isArtist
      ? `navigateTo('artist', event, '${item.id}')`
      : (isRecent ? `playRecentSong('${item.id}')` : (isWide ? `navigateTo('playlist', event, '${item.id}')` : `playSpecificSong('${item.id}')`));

    return `
      <div class="music-card ${isWide ? 'wide' : ''}" onclick="${clickAction}">
        <div class="card-img-wrap" style="${isArtist ? 'border-radius: 50%;' : ''}">
          <img src="${item.thumb || item.img}" alt="${item.title || item.name}" loading="lazy">
          <div class="card-overlay" style="${isArtist ? 'border-radius: 50%;' : ''}">
            <button class="card-play-btn" onclick="${playAction}">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
        <div class="card-info" style="${isArtist ? 'text-align: center;' : ''}">
          <h3>${item.title || item.name}</h3>
          <p>${item.artist || item.sub || 'Artist'}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="section-block">
      <div class="section-header">
        <h2>${title}</h2>
        <a href="#">See all</a>
      </div>
      <div class="cards-container">
        ${cards}
      </div>
    </div>
  `;
}

let ytApiSearchResults = [];

function setSearchSource(source) {
  searchSource = source;
  document.querySelectorAll('.sst-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = document.querySelector(`.sst-${source === 'youtube' ? 'yt' : 'jio'}`);
  if (activeBtn) activeBtn.classList.add('active');
  const inputs = document.querySelectorAll('#search-input, #mobile-search-input');
  let input = null;
  inputs.forEach(inp => { if (inp.offsetParent !== null) input = inp; });
  if (!input && inputs.length > 0) input = inputs[inputs.length - 1];
  if (input && input.value.trim()) {
    handleSearch({ target: input });
  }
}

function _getToggleHTML() {
  const ytActive = searchSource === 'youtube' ? ' active' : '';
  const jioActive = searchSource === 'jiosaavn' ? ' active' : '';
  const ytOffline = !ytBackendOnline ? ' offline' : '';
  return `<div class="search-source-toggle">
    <button class="sst-btn sst-yt${ytActive}${ytOffline}" onclick="event.stopPropagation(); setSearchSource('youtube')" ${!ytBackendOnline ? 'title="Start backend to enable"' : ''}>
      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>
      YT Music
    </button>
    <button class="sst-btn sst-jio${jioActive}" onclick="event.stopPropagation(); setSearchSource('jiosaavn')">
      <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      JioSaavn
    </button>
  </div>`;
}

function handleSearch(e) {
  clearTimeout(searchTimeout);
  const term = e.target.value.toLowerCase().trim();
  const parentContainer = e.target.closest('.search-container');
  const dropdown = parentContainer ? parentContainer.querySelector('.search-dropdown') : document.getElementById('search-dropdown');

  if (!term) {
    dropdown.classList.add('hidden');
    return;
  }

  const srcLabel = searchSource === 'youtube' ? 'YouTube Music' : 'JioSaavn';
  dropdown.innerHTML = _getToggleHTML() + `
    <div class="search-loading">
      <div class="search-spinner"></div>
      <span>Searching ${srcLabel}...</span>
    </div>
  `;
  dropdown.classList.remove('hidden');

  searchTimeout = setTimeout(async () => {
    const songResults = SONGS.filter(s => s.title.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term)).slice(0, 3);
    const artistResults = ARTISTS.filter(a => a.name.toLowerCase().includes(term)).slice(0, 2);

    let html = _getToggleHTML();

    artistResults.forEach(a => {
      html += `
        <div class="search-item" onclick="this.closest('.search-dropdown').classList.add('hidden'); navigateTo('artist', null, '${a.id}')">
          <img src="${a.img}" style="border-radius:50%;">
          <div class="search-item-info"><h4>${a.name}</h4><p>Artist</p></div>
        </div>
      `;
    });

    songResults.forEach(s => {
      html += `
        <div class="search-item" onclick="this.closest('.search-dropdown').classList.add('hidden'); playJioSaavnSong(SONGS.find(x=>x.id==='${s.id}'))">
          <img src="${s.thumb}">
          <div class="search-item-info"><h4>${s.title}</h4><p>${s.artist}</p></div>
        </div>
      `;
    });

    if (searchSource === 'jiosaavn') {
      try {
        const apiResults = await handleJioSaavnSearch(term);
        if (apiResults.length > 0) {
          if (songResults.length || artistResults.length) html += '<div class="search-divider"></div>';
          html += '<div class="search-section-label"><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg> JioSaavn</div>';
          apiResults.slice(0, 6).forEach((s, i) => {
            html += `
              <div class="search-item" onclick="this.closest('.search-dropdown').classList.add('hidden'); playJioSaavnSong(apiSearchResults[${i}])">
                <img src="${s.thumb}">
                <div class="search-item-info"><h4>${s.title}</h4><p>${s.artist}</p></div>
                <div class="search-quality-badge">HD</div>
              </div>
            `;
          });
          html += `
            <div class="search-view-all" onclick="this.closest('.search-dropdown').classList.add('hidden'); showSearchResults('${term.replace(/'/g, "\\'")}')">
              View all results for "${term}"
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          `;
        }
      } catch (err) {
      }
    } else {
      try {
        const ytResults = await YOUTUBE_API.searchSongs(term, 6);
        ytApiSearchResults = ytResults;
        if (ytResults.length > 0) {
          if (songResults.length || artistResults.length) html += '<div class="search-divider"></div>';
          html += '<div class="search-section-label" style="color: #ef4444;"><svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg> YouTube Music</div>';
          ytResults.forEach((s, i) => {
            html += `
              <div class="search-item" onclick="this.closest('.search-dropdown').classList.add('hidden'); playJioSaavnSong(ytApiSearchResults[${i}])">
                <img src="${s.thumb}" style="border-radius: 4px;">
                <div class="search-item-info"><h4>${s.title}</h4><p>${s.artist}</p></div>
                <div class="search-quality-badge" style="background: linear-gradient(135deg, #ef4444, #f97316);">YT</div>
              </div>
            `;
          });
          html += `
            <div class="search-view-all" onclick="this.closest('.search-dropdown').classList.add('hidden'); showSearchResults('${term.replace(/'/g, "\\'")}')">
              View all results for "${term}"
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </div>
          `;
        }
      } catch (err) {
      }
    }

    if (html === _getToggleHTML()) {
      html += `<div style="padding:14px; color:var(--text-muted); text-align:center; font-size:13px;">No results found</div>`;
    }

    dropdown.innerHTML = html;
    dropdown.classList.remove('hidden');
  }, 300);
}

async function showSearchResults(query) {
  state.currentView = 'search';
  const isMobile = window.innerWidth <= 768;
  let targetArea = document.getElementById('search-results-area');
  
  if (isMobile && !targetArea) {
    navigateTo('search', null, query);
    return;
  }

  const container = document.getElementById('main-view');
  const target = isMobile ? targetArea : container;

  const srcLabel = searchSource === 'youtube' ? 'YouTube Music' : 'JioSaavn';
  target.innerHTML = `
    <div style="padding-top: ${isMobile ? '10' : '20'}px; margin-bottom: 30px;">
      ${isMobile ? '' : '<h1 style="font-size: 42px; font-weight: 800;">Search Results</h1>'}
      <p style="color: var(--text-muted); margin-top: 8px;">Results for "${query}" on ${srcLabel}</p>
    </div>
    <div class="search-results-loading">
      <div class="search-spinner large"></div>
      <p>Searching ${srcLabel}...</p>
    </div>
  `;

  let jioSongs = [], ytSongs = [];
  if (searchSource === 'jiosaavn') {
    const jioResult = await JIOSAAVN_API.searchSongs(query, 30).catch(() => []);
    jioSongs = jioResult || [];
  } else {
    const ytResult = await YOUTUBE_API.searchSongs(query, 20).catch(() => []);
    ytSongs = ytResult || [];
  }
  apiSearchResults = jioSongs;
  ytApiSearchResults = ytSongs;

  if (jioSongs.length === 0 && ytSongs.length === 0) {
    target.innerHTML = `
      <div style="padding-top: 20px; margin-bottom: 30px;">
        ${isMobile ? '' : '<h1 style="font-size: 42px; font-weight: 800;">Search Results</h1>'}
        <p style="color: var(--text-muted); margin-top: 8px;">No results found for "${query}"</p>
        <button onclick="showSearchResults('${query.replace(/'/g, "\\'")}')" style="margin-top:16px; padding:10px 24px; background:var(--neon-purple); color:white; border:none; border-radius:20px; cursor:pointer; font-weight:600;">Retry</button>
      </div>
    `;
    return;
  }

  let jioSection = '';
  if (jioSongs.length > 0) {
    const jioListHTML = jioSongs.map((song, i) => `
      <div class="list-row jiosaavn-row" onclick="playJioSaavnSong(apiSearchResults[${i}])">
        <div class="col-num">${i + 1}</div>
        <div class="col-title">
          <img src="${song.thumb}" alt="">
          <div>
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
          </div>
        </div>
        <div class="col-album">${song.album}</div>
        <div class="col-time">
          <span class="quality-tag">HD</span>
          ${song.duration}
        </div>
      </div>
    `).join('');

    jioSection = `
      <div class="jiosaavn-badge-bar">
        <div class="jiosaavn-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          JioSaavn â€” ${jioSongs.length} results
        </div>
        <button class="play-all-btn" onclick="playAllSearchResults()">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
          Play All
        </button>
      </div>
      <div class="list-head">
        <div class="col-num">#</div>
        <div class="col-title">TITLE</div>
        <div class="col-album">ALBUM</div>
        <div class="col-time">TIME</div>
      </div>
      ${jioListHTML}
    `;
  }

  let ytSection = '';
  if (ytSongs.length > 0) {
    const ytListHTML = ytSongs.map((song, i) => `
      <div class="list-row" style="cursor:pointer;" onclick="playJioSaavnSong(ytApiSearchResults[${i}])">
        <div class="col-num">${i + 1}</div>
        <div class="col-title">
          <img src="${song.thumb}" alt="" style="border-radius: 4px;">
          <div>
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
          </div>
        </div>
        <div class="col-album">${song.album || ''}</div>
        <div class="col-time">
          <span class="quality-tag" style="background: linear-gradient(135deg, #ef4444, #f97316);">YT</span>
        </div>
      </div>
    `).join('');

    ytSection = `
      <div style="margin-top: 32px;"></div>
      <div class="jiosaavn-badge-bar" style="border-color: rgba(239,68,68,0.15); background: linear-gradient(135deg, rgba(239,68,68,0.05), rgba(249,115,22,0.03));">
        <div class="jiosaavn-badge" style="color: #ef4444;">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/></svg>
          YouTube Music â€” ${ytSongs.length} results
        </div>
        <button class="play-all-btn" onclick="state.queue = [...ytApiSearchResults]; state.currentIndex = 0; playSong(0);">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
          Play All
        </button>
      </div>
      <div class="list-head">
        <div class="col-num">#</div>
        <div class="col-title">TITLE</div>
        <div class="col-album">ALBUM</div>
        <div class="col-time">TIME</div>
      </div>
      ${ytListHTML}
    `;
  }

  let artistsSection = '';
  const localArtists = ARTISTS.filter(a => a.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  if (localArtists.length > 0) {
    artistsSection = `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Artists</h2>
        <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 20px; margin-bottom: -20px;">
          ${localArtists.map(a => `
            <div class="music-card" style="width: 150px; text-align: center; flex-shrink: 0;" onclick="navigateTo('artist', null, '${a.id}')">
              <img src="${a.img}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; display: block; box-shadow: 0 8px 16px rgba(0,0,0,0.5);">
              <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${a.name}</h3>
              <p style="font-size: 12px; color: var(--text-muted);">Artist</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const totalResults = jioSongs.length + ytSongs.length;
  target.innerHTML = `
    <div style="padding-top: 20px; margin-bottom: 30px;">
      ${isMobile ? '' : '<h1 style="font-size: 42px; font-weight: 800;">Search Results</h1>'}
      <p style="color: var(--text-muted); margin-top: 8px;">${totalResults} songs found for "${query}"</p>
    </div>
    ${artistsSection}
    ${jioSection ? `<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Songs</h2>${jioSection}` : ''}
    ${ytSection}
  `;
}

function playAllSearchResults() {
  if (apiSearchResults.length === 0) return;

  state.queue = [...apiSearchResults];
  state.currentIndex = 0;
  playSong(0);
}

let _lastRecSongId = null;

async function triggerSmartRecommendations(song) {
  if (!song) return;
  if (_lastRecSongId === song.id) return; 
  _lastRecSongId = song.id;

  const artistName = (song.artist || '').split(',')[0].trim();
  const songTitle  = song.title || '';

  _injectRecSkeleton('rec-artist-section', `More from ${artistName}`);
  _injectRecSkeleton('rec-genre-section',  `Because you played "${songTitle}"`);

  let relatedPromise;
  if (song.id.startsWith('yt_')) {
    relatedPromise = YOUTUBE_API.getRelated(song.videoId || song.id.replace('yt_', ''), 12);
  } else {
    const lang = song.language && song.language !== 'unknown' ? song.language : '';
    relatedPromise = YOUTUBE_API.searchSongs(`${lang} ${artistName} similar songs`.trim(), 12);
  }

  const [artistSongs, genreSongs] = await Promise.allSettled([
    YOUTUBE_API.searchSongs(`${artistName} top songs`, 12),
    relatedPromise,
  ]);

  const artistResults = (artistSongs.status === 'fulfilled' ? artistSongs.value : [])
    .filter(s => s.audioUrl && s.id !== song.id)
    .slice(0, 10);

  const genreResults = (genreSongs.status === 'fulfilled' ? genreSongs.value : [])
    .filter(s => s.audioUrl && s.id !== song.id && !artistResults.find(a => a.id === s.id))
    .slice(0, 10);

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
        <img src="${song.img || song.thumb}" alt="${song.title}" loading="lazy" onerror="this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Music'">
        <div class="card-overlay">
          <button class="card-play-btn" onclick="event.stopPropagation(); playJioSaavnSong(SONGS.find(s=>s.id==='${song.id}'))">
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
  audio.volume = 0.7;

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    document.getElementById('prog-fill').style.width = pct + '%';
    document.getElementById('prog-thumb').style.right = (100 - pct) + '%';
    document.getElementById('cur-time').textContent = formatTime(audio.currentTime);
    if (typeof syncDiProgress === 'function') syncDiProgress();
  });

  audio.addEventListener('loadedmetadata', () => {
    document.getElementById('tot-time').textContent = formatTime(audio.duration || 0);
  });

  audio.addEventListener('ended', () => {
    if (state.isRepeat) {
      audio.currentTime = 0; audio.play();
    } else {
      nextSong();
    }
  });

  if (state.queue.length > 0 && state.queue[state.currentIndex]) {
    const resumeSong = state.queue[state.currentIndex];
    loadSongUI(state.currentIndex);

    if (resumeSong.audioUrl && resumeSong.audioUrl.startsWith('yt_stream_pending_')) {
      const videoId = resumeSong.audioUrl.replace('yt_stream_pending_', '');
      audio.src = YOUTUBE_API.getProxyUrl(videoId);
    } else if (resumeSong.audioUrl) {
      audio.src = resumeSong.audioUrl;
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
  document.getElementById('pl-title').textContent = song.title;
  document.getElementById('pl-artist').textContent = song.artist;
  document.getElementById('pl-thumb').src = song.thumb;

  const miniTitle = document.getElementById('mini-title');
  if (miniTitle) {
    document.getElementById('mini-title').textContent = song.title;
    document.getElementById('mini-artist').textContent = song.artist;
    document.getElementById('mini-thumb').src = song.thumb;
  }

  const likeBtn = document.getElementById('like-btn');
  if (state.likedSongs.includes(song.id)) {
    likeBtn.classList.add('liked');
  } else {
    likeBtn.classList.remove('liked');
  }
}

window.playSpecificSong = function(id) {
  const song = SONGS.find(s => s.id === id) || SONGS.find(s => s.id === Number(id));
  if (!song) return;
  let idx = state.queue.findIndex(s => s.id === song.id);
  if (idx === -1) {
    state.queue.push(song);
    idx = state.queue.length - 1;
  }
  playSong(idx);
};

window.playRecentSong = function(id) {
  const idx = state.recentSongs.findIndex(s => s.id === id || s.id === Number(id));
  if (idx === -1) return;
  state.queue = [...state.recentSongs];
  playSong(idx);
};

function playSong(idx) {
  if (!state.queue || state.queue.length === 0) return;
  if (idx < 0 || idx >= state.queue.length) idx = 0;

  const oldSongId = state.currentPlayingSongId || (state.queue[state.currentIndex] ? state.queue[state.currentIndex].id : null);
  if (audio && audio.currentTime > 0 && oldSongId) {

    if (audio.duration && audio.currentTime >= audio.duration - 1) {
      delete state.songProgress[oldSongId];
    } else {
      state.songProgress[oldSongId] = audio.currentTime;
    }
  }

  state.currentIndex = idx;
  const song = state.queue[idx];
  if (!song) return;

  state.currentPlayingSongId = song.id;

  const recentIdx = state.recentSongs.findIndex(s => s.id === song.id);
  if (recentIdx > -1) state.recentSongs.splice(recentIdx, 1);
  state.recentSongs.unshift(song);
  if (state.recentSongs.length > 50) state.recentSongs.length = 50;

  if (state.currentView === 'home') {
    setTimeout(() => { renderView('home'); }, 10);
  }

  triggerSmartRecommendations(song);

  loadSongUI(idx);

  if (song.audioUrl && song.audioUrl.startsWith('yt_stream_pending_')) {
    const videoId = song.audioUrl.replace('yt_stream_pending_', '');
    const proxyUrl = YOUTUBE_API.getProxyUrl(videoId);
    const playerTitle = document.getElementById('pl-title');
    if (playerTitle) playerTitle.textContent = song.title + ' â€” Loading...';
    showDynamicIsland('Loading YouTube stream...', 'warning', 3000);
    audio.src = proxyUrl;
    song.audioUrl = proxyUrl;
    audio.play().then(() => {
      if (playerTitle) playerTitle.textContent = song.title;
    }).catch(e => {
      audio.addEventListener('canplay', function onCanPlay() {
        audio.play().catch(() => {});
        if (playerTitle) playerTitle.textContent = song.title;
        audio.removeEventListener('canplay', onCanPlay);
      }, { once: true });
    });
    audio.addEventListener('error', function onErr() {
      if (playerTitle) playerTitle.textContent = song.title;
      showDynamicIsland('Stream failed â€” is backend running?', 'warning', 4000);
      audio.removeEventListener('error', onErr);
    }, { once: true });
  } else if (song.audioUrl) {
    audio.src = song.audioUrl;
    audio.play().catch(() => {});
  } else {
    audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    audio.play().catch(() => {});
  }

  audio.addEventListener('loadedmetadata', function resumeOnce() {
    if (state.songProgress[song.id] && state.songProgress[song.id] > 0) {
      audio.currentTime = state.songProgress[song.id];
      delete state.songProgress[song.id];
    }
    audio.removeEventListener('loadedmetadata', resumeOnce);
  });
  state.isPlaying = true;
  updatePlayButtonUI();
  syncEqualizer();
  renderQueuePanel();

  showNowPlayingIsland(song);

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
  if (state.isPlaying) {
    audio.pause();
    state.isPlaying = false;
  } else {
    if (!audio.src || audio.src === window.location.href) {
      playSong(state.currentIndex);
    } else {
      audio.play().catch(() => {});
      state.isPlaying = true;
    }
  }
  updatePlayButtonUI();
  syncEqualizer();
}

function updatePlayButtonUI() {
  document.getElementById('ico-play').style.display = state.isPlaying ? 'none' : 'block';
  document.getElementById('ico-pause').style.display = state.isPlaying ? 'block' : 'none';

  const miniPlay = document.getElementById('mini-ico-play');
  const miniPause = document.getElementById('mini-ico-pause');
  if (miniPlay && miniPause) {
    miniPlay.style.display = state.isPlaying ? 'none' : 'block';
    miniPause.style.display = state.isPlaying ? 'block' : 'none';
  }

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
}

function nextSong() {
  let idx = state.isShuffle 
    ? Math.floor(Math.random() * state.queue.length)
    : (state.currentIndex + 1) % state.queue.length;
  playSong(idx);
}

function prevSong() {
  if (audio && audio.currentTime > 3) { 
    audio.currentTime = 0; 
    return; 
  }
  let idx = (state.currentIndex - 1 + state.queue.length) % state.queue.length;
  playSong(idx);
}

function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  document.getElementById('btn-shuffle').style.color = state.isShuffle ? 'var(--neon-purple)' : 'var(--text-muted)';

  if (state.isShuffle) {
    document.querySelectorAll('.music-card').forEach((card, i) => {
      setTimeout(() => {
        card.classList.add('shuffle-anim');
        card.addEventListener('animationend', () => card.classList.remove('shuffle-anim'), { once: true });
      }, i * 30);
    });
  }
}

function toggleRepeat() {
  state.isRepeat = !state.isRepeat;
  document.getElementById('btn-repeat').style.color = state.isRepeat ? 'var(--neon-purple)' : 'var(--text-muted)';
}

function toggleLike() {
  const song = state.queue[state.currentIndex];
  if (!song) return;
  const idx = state.likedSongs.indexOf(song.id);
  const btn = document.getElementById('like-btn');

  if (idx > -1) {
    state.likedSongs.splice(idx, 1);
    btn.classList.remove('liked');
    showDynamicIsland(`Removed from Liked Songs`, 'info', 2000);
  } else {
    state.likedSongs.push(song.id);
    btn.classList.add('liked');
    showDynamicIsland(`Liked "${song.title}"`, 'success', 2000);
  }

  cacheJioSaavnSong(song);
  saveUserState();

  if (state.currentView === 'liked') {
    renderView('liked');
  }
}

function seekTo(e) {
  if (!audio || !audio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  let pct = (clientX - rect.left) / rect.width;
  pct = Math.max(0, Math.min(1, pct));
  audio.currentTime = pct * audio.duration;
}

function setVolume(val) {
  const slider = document.getElementById('vol-slider');
  slider.style.setProperty('--vol-fill', val + '%');
  state.lastVolume = val;
  if (audio) {
    audio.volume = val / 100;
  }
  if (val > 0 && state.isMuted) {
    state.isMuted = false;
    updateMuteIcon();
  }
}

function toggleMute() {
  const slider = document.getElementById('vol-slider');
  if (state.isMuted) {
    state.isMuted = false;
    setVolume(state.lastVolume > 0 ? state.lastVolume : 70);
    slider.value = state.lastVolume > 0 ? state.lastVolume : 70;
  } else {
    state.isMuted = true;
    if (audio) audio.volume = 0;
    slider.style.setProperty('--vol-fill', '0%');
    slider.value = 0;
  }
  updateMuteIcon();
}

function updateMuteIcon() {
  const btn = document.getElementById('mute-btn');
  if (state.isMuted) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }
}

function toggleQueue() {
  const panel = document.getElementById('queue-panel');
  panel.classList.toggle('open');
  if (panel.classList.contains('open')) {
    renderQueuePanel();
  }
}

function renderQueuePanel() {
  const nowContainer = document.getElementById('queue-now');
  const listContainer = document.getElementById('queue-list');

  const curSong = state.queue[state.currentIndex];
  if (curSong) {
    nowContainer.innerHTML = `
      <div class="q-item now-playing" onclick="togglePlay()">
        <img src="${curSong.thumb}">
        <div class="q-info">
          <div class="q-title">${curSong.title}</div>
          <div class="q-artist">${curSong.artist}</div>
        </div>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="var(--neon-purple)"><path d="M8 5v14l11-7z"/></svg>
      </div>
    `;
  }

  let html = '';
  for (let i = state.currentIndex + 1; i < state.queue.length; i++) {
    const s = state.queue[i];
    html += `
      <div class="q-item" onclick="playSong(${i})">
        <img src="${s.thumb}">
        <div class="q-info">
          <div class="q-title">${s.title}</div>
          <div class="q-artist">${s.artist}</div>
        </div>
      </div>
    `;
  }
  
  if (state.isFetchingRelated) {
    html += `
      <div class="q-item" style="justify-content: center; opacity: 0.7; padding: 15px;">
        <div class="search-spinner" style="width:16px; height:16px; border-width:2px; margin-right:8px; display:inline-block;"></div>
        <div style="font-size:12px; color:var(--text-muted); display:inline-block;">Fetching related songs...</div>
      </div>
    `;
  }

  listContainer.innerHTML = html || '<div style="color:var(--text-muted); font-size:12px; padding:10px;">End of queue</div>';
}

function clearQueue() {
  state.queue = [state.queue[state.currentIndex]];
  renderQueuePanel();
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function syncEqualizer() {
  const eq = document.getElementById('equalizer');
  if (state.isPlaying) {
    eq.classList.add('playing');
  } else {
    eq.classList.remove('playing');
  }
}

function toggleMiniPlayer() {
  state.isMiniPlayer = !state.isMiniPlayer;
  const fullPlayer = document.querySelector('.bottom-player');
  const miniPlayer = document.getElementById('mini-player');

  if (state.isMiniPlayer) {
    fullPlayer.style.display = 'none';
    miniPlayer.classList.remove('hidden');

    const song = state.queue[state.currentIndex];
    if (song) {
      document.getElementById('mini-thumb').src = song.thumb;
      document.getElementById('mini-title').textContent = song.title;
      document.getElementById('mini-artist').textContent = song.artist;
    }
  } else {
    fullPlayer.style.display = 'flex';
    miniPlayer.classList.add('hidden');
  }
  updatePlayButtonUI();
}

function toggleNotifications() {
  const dropdown = document.getElementById('notif-dropdown');
  dropdown.classList.toggle('hidden');
}

function clearNotifications() {
  const badge = document.getElementById('notif-badge');
  badge.classList.add('hidden');
  document.getElementById('notif-dropdown').innerHTML = '<div style="padding:10px; color:var(--text-muted); text-align:center; font-size:12px;">No new notifications</div>';
}

document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notif-dropdown');
  const bellBtn = document.getElementById('bell-btn');
  if (dropdown && bellBtn && !bellBtn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.add('hidden');
  }

  const searchDropdown = document.getElementById('search-dropdown');
  const searchInput = document.getElementById('search-input');
  if (searchDropdown && searchInput && !searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
    searchDropdown.classList.add('hidden');
  }

  const mobileSearchDropdown = document.getElementById('mobile-search-dropdown');
  const mobileSearchInput = document.getElementById('mobile-search-input');
  if (mobileSearchDropdown && mobileSearchInput && !mobileSearchInput.contains(e.target) && !mobileSearchDropdown.contains(e.target)) {
    mobileSearchDropdown.classList.add('hidden');
  }

  if (!e.target.closest('.song-options-menu')) {
    document.querySelectorAll('.song-options-dropdown').forEach(menu => {
      menu.classList.add('hidden');
    });
  }
});

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

  notifContent.style.display = 'flex';
  mediaContent.style.display = 'none';
  
  diIcon.innerHTML = DI_ICONS[variant] || DI_ICONS.success;
  diText.textContent = text;
  
  island.className = 'dynamic-island di-' + variant;
  void island.offsetWidth;
  island.classList.add('di-show');

  _diTimer = setTimeout(() => {
    island.classList.remove('di-show');
    
    if (_diMediaActive && state.queue.length > 0) {
      setTimeout(() => {
        notifContent.style.display = 'none';
        mediaContent.style.display = 'flex';
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
  document.getElementById('di-art-small').src = artUrl;
  document.getElementById('di-art-large').src = artUrl;
  document.getElementById('di-media-title').textContent = song.title || 'Unknown';
  document.getElementById('di-media-artist').textContent = song.artist || 'Unknown Artist';

  notifContent.style.display = 'none';
  mediaContent.style.display = 'flex';
  
  if (!island.classList.contains('di-expanded')) {
    island.className = 'dynamic-island di-media-playing';
  }
}

function toggleDiExpanded() {
  if (!_diMediaActive) return;
  const island = document.getElementById('dynamic-island');
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

function openCreatePlaylist() {
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('playlist-name-input').focus(), 100);
}

function closeCreatePlaylist() {
  document.getElementById('modal-overlay').classList.add('hidden');
  document.getElementById('playlist-name-input').value = '';
}

function createPlaylist() {
  const name = document.getElementById('playlist-name-input').value.trim();
  if (!name) return;

  const newId = 'up_' + Date.now();
  state.userPlaylists.push({ id: newId, title: name, sub: 'Custom playlist', img: 'https://placehold.co/300x300/1a1a1a/a855f7?text=' + encodeURIComponent(name), songs: [] });
  saveUserState();

  const playlistSection = document.querySelectorAll('.nav-section')[2];
  const upgradeCard = document.querySelector('.upgrade-card');
  const newLink = document.createElement('a');
  newLink.href = '#';
  newLink.className = 'nav-item';
  newLink.id = 'sidebar-' + newId;
  newLink.textContent = name;
  newLink.onclick = (e) => navigateTo('playlist', e, newId);
  playlistSection.insertBefore(newLink, upgradeCard ? null : null);
  playlistSection.appendChild(newLink);

  closeCreatePlaylist();

  showDynamicIsland(`Playlist "${name}" created`, 'success');

  if (state.currentView === 'library') {
    renderView('library');
  }
}

function openAddToPlaylistModal() {
  const song = state.queue[state.currentIndex];
  if (!song) {
    showDynamicIsland('Play a song first', 'info');
    return;
  }

  const listContainer = document.getElementById('playlist-select-list');
  let html = '';
  if (state.userPlaylists.length === 0) {
    html = '<div style="color:var(--text-muted); font-size:14px; text-align:center;">No custom playlists found. Create one first!</div>';
  } else {
    state.userPlaylists.forEach(pl => {
      if (!pl.songs) pl.songs = [];
      html += `
        <div class="q-item" style="cursor:pointer; background:rgba(255,255,255,0.05); padding:10px; border-radius:8px;" onclick="addToPlaylist('${pl.id}')">
          <img src="${pl.img}" style="border-radius:4px;">
          <div class="q-info">
            <div class="q-title" style="font-size:14px;">${pl.title}</div>
            <div class="q-artist" style="font-size:12px;">${pl.songs.length} songs</div>
          </div>
        </div>
      `;
    });
  }
  listContainer.innerHTML = html;
  document.getElementById('add-to-playlist-modal').classList.remove('hidden');
}

function closeAddToPlaylistModal() {
  document.getElementById('add-to-playlist-modal').classList.add('hidden');
}

function addToPlaylist(playlistId) {
  const song = state.queue[state.currentIndex];
  if (!song) return;

  if (!SONGS.find(s => s.id === song.id)) {
    SONGS.push(song);
  }

  const playlist = state.userPlaylists.find(p => p.id === playlistId);
  if (playlist) {
    if (!playlist.songs) playlist.songs = [];
    if (!playlist.songs.includes(song.id)) {
      playlist.songs.push(song.id);
      cacheJioSaavnSong(song);
      saveUserState();
      closeAddToPlaylistModal();
      showDynamicIsland(`Added to "${playlist.title}"`, 'success');
    } else {
      closeAddToPlaylistModal();
      showDynamicIsland('Already in this playlist', 'info');
    }
  }
}

let playlistToDelete = null;

function deletePlaylist(playlistId) {
  playlistToDelete = playlistId;
  document.getElementById('delete-playlist-modal').classList.remove('hidden');
  document.getElementById('confirm-delete-playlist-btn').onclick = executeDeletePlaylist;
}

function closeDeletePlaylistModal() {
  document.getElementById('delete-playlist-modal').classList.add('hidden');
  playlistToDelete = null;
}

function executeDeletePlaylist() {
  if (!playlistToDelete) return;
  const playlistId = playlistToDelete;

  const idx = state.userPlaylists.findIndex(p => p.id === playlistId);
  if (idx > -1) {
    const name = state.userPlaylists[idx].title;
    state.userPlaylists.splice(idx, 1);
    saveUserState();

    const navItem = document.getElementById('sidebar-' + playlistId);
    if (navItem) navItem.remove();

    showDynamicIsland(`Playlist "${name}" deleted`, 'warning');
    navigateTo('home');
  }
  closeDeletePlaylistModal();
}

function toggleFollow(artistId) {
  const idx = state.followedArtists.indexOf(artistId);
  if (idx > -1) {
    state.followedArtists.splice(idx, 1);
  } else {
    state.followedArtists.push(artistId);
  }

  saveUserState();

  if (state.currentView === 'artist') {
    renderView('artist', artistId);
  }

  renderFollowedSidebar();
}

function toggleSongOptions(event, playlistId, songId) {
  event.stopPropagation();
  document.querySelectorAll('.song-options-dropdown').forEach(menu => {
    if (menu.id !== `song-options-${playlistId}-${songId}`) {
      menu.classList.add('hidden');
    }
  });
  
  const menu = document.getElementById(`song-options-${playlistId}-${songId}`);
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

function removeSongFromPlaylist(playlistId, songId) {
  const pIdx = state.userPlaylists.findIndex(p => p.id === playlistId);
  if (pIdx > -1) {
    const playlist = state.userPlaylists[pIdx];
    const sIdx = playlist.songs.indexOf(songId);
    if (sIdx > -1) {
      playlist.songs.splice(sIdx, 1);
      saveUserState();
      renderView('playlist', playlistId);
      showDynamicIsland("Song removed from playlist", "success");
    }
  }
}

function renderFollowedSidebar() {

  const existing = document.getElementById('followed-section');
  if (existing) existing.remove();

  if (state.followedArtists.length === 0) return;

  const sidebar = document.querySelector('.sidebar');
  const upgradeCard = document.querySelector('.upgrade-card');

  const section = document.createElement('div');
  section.className = 'nav-section';
  section.id = 'followed-section';

  let html = '<h3 class="section-title">FOLLOWING</h3>';
  state.followedArtists.forEach(id => {
    const artist = ARTISTS.find(a => a.id === id);
    if (artist) {
      html += `<a href="#" class="nav-item nav-artist-item" onclick="navigateTo('artist', event, '${artist.id}')">
        <img src="${artist.img}" class="nav-artist-img">
        ${artist.name}
      </a>`;
    }
  });

  section.innerHTML = html;
  sidebar.insertBefore(section, upgradeCard);
}

let tempProfileImage = null;

function loadUserProfile() {
  const name = localStorage.getItem('wave_user_name');
  const image = localStorage.getItem('wave_user_img');

  if (name) {
    applyProfile(name, image);
  }
}

function applyProfile(name, imageDataUrl) {
  const profileImg = document.getElementById('profile-img');
  const profileInitial = document.getElementById('profile-initial');

  if (imageDataUrl) {
    profileImg.src = imageDataUrl;
    profileImg.classList.remove('hidden');
    profileInitial.classList.add('hidden');
  } else {
    profileImg.classList.add('hidden');
    profileInitial.classList.remove('hidden');
    profileInitial.textContent = name.charAt(0).toUpperCase();
  }
}

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const nameInput = document.getElementById('profile-name-input');
  const savedName = localStorage.getItem('wave_user_name');
  const savedImg = localStorage.getItem('wave_user_img');

  if (savedName) {
    document.getElementById('pm-heading').textContent = 'Edit Profile';
    document.getElementById('pm-subtext').textContent = 'Update your name or photo';
    nameInput.value = savedName;
  }

  tempProfileImage = savedImg || null;
  updateModalAvatar(savedName || '', savedImg);

  modal.classList.remove('hidden');
  setTimeout(() => nameInput.focus(), 100);
}

function closeProfileModal() {
  document.getElementById('profile-modal').classList.add('hidden');
  document.getElementById('profile-name-input').value = '';
  tempProfileImage = null;
}

function updateModalAvatar(name, imgUrl) {
  const pmImg = document.getElementById('pm-avatar-img');
  const pmInitial = document.getElementById('pm-initial');

  if (imgUrl) {
    pmImg.src = imgUrl;
    pmImg.classList.remove('hidden');
    pmInitial.style.display = 'none';
  } else {
    pmImg.classList.add('hidden');
    pmInitial.style.display = 'flex';
    pmInitial.textContent = name ? name.charAt(0).toUpperCase() : '?';
  }
}

function handleProfileImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    tempProfileImage = e.target.result;
    const name = document.getElementById('profile-name-input').value.trim();
    updateModalAvatar(name, tempProfileImage);
  };
  reader.readAsDataURL(file);
}

function saveProfile() {
  const name = document.getElementById('profile-name-input').value.trim();
  if (!name) {
    document.getElementById('profile-name-input').style.borderColor = '#ef4444';
    setTimeout(() => document.getElementById('profile-name-input').style.borderColor = '', 1500);
    return;
  }

  localStorage.setItem('wave_user_name', name);
  if (tempProfileImage) {
    localStorage.setItem('wave_user_img', tempProfileImage);
  } else {
    localStorage.removeItem('wave_user_img');
  }

  applyProfile(name, tempProfileImage);

  if (state.currentView === 'home') {
    renderView('home');
  }

  closeProfileModal();
}

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  switch(e.key) {
    case ' ':
      e.preventDefault();
      togglePlay();
      break;
    case 'ArrowRight':
      if (audio && audio.duration) audio.currentTime += 10;
      break;
    case 'ArrowLeft':
      if (audio && audio.duration) audio.currentTime -= 10;
      break;
    case 'm':
    case 'M':
      toggleMute();
      break;
  }
});

let isMobileNowPlayingOpen = false;

function openMobileNowPlaying(e) {

  if (window.innerWidth > 768) return;

  if (e && e.target.closest('button')) return;

  const card = document.getElementById('mobile-now-playing');
  if (!card) return;

  isMobileNowPlayingOpen = true;
  syncMobileNowPlaying();
  card.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNowPlaying() {
  const card = document.getElementById('mobile-now-playing');
  if (!card) return;
  isMobileNowPlayingOpen = false;
  card.classList.remove('open');
  document.body.style.overflow = '';
}

function syncMobileNowPlaying() {
  const song = state.queue[state.currentIndex];
  if (!song) return;

  const mnpArt = document.getElementById('mnp-art');
  const mnpTitle = document.getElementById('mnp-title');
  const mnpArtist = document.getElementById('mnp-artist');

  if (mnpArt) mnpArt.src = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
  if (mnpTitle) mnpTitle.textContent = song.title || 'Unknown';
  if (mnpArtist) mnpArtist.textContent = song.artist || 'â€”';

  if (mnpArt) {
    const card = document.getElementById('mobile-now-playing');
    if (card) {

      card.style.backgroundImage = `
        radial-gradient(ellipse at 50% -20%, rgba(168,85,247,0.35) 0%, transparent 60%),
        linear-gradient(180deg, rgba(15,10,30,0.97) 0%, rgba(8,6,20,0.99) 100%)
      `;
    }
  }

  syncMobileNowPlayingLike();
  syncMobileNowPlayingPlayState();
  syncMobileNowPlayingProgress();
}

function syncMobileNowPlayingLike() {
  const song = state.queue[state.currentIndex];
  if (!song) return;
  const btn = document.getElementById('mnp-like-btn');
  if (!btn) return;
  if (state.likedSongs.includes(song.id)) {
    btn.classList.add('liked');
  } else {
    btn.classList.remove('liked');
  }
}

function syncMobileNowPlayingPlayState() {
  const playIco = document.getElementById('mnp-ico-play');
  const pauseIco = document.getElementById('mnp-ico-pause');
  if (!playIco || !pauseIco) return;
  playIco.style.display = state.isPlaying ? 'none' : 'block';
  pauseIco.style.display = state.isPlaying ? 'block' : 'none';
}

function syncMobileNowPlayingProgress() {
  if (!audio || !audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  const fill = document.getElementById('mnp-prog-fill');
  const thumb = document.getElementById('mnp-prog-thumb');
  const curTime = document.getElementById('mnp-cur-time');
  const totTime = document.getElementById('mnp-tot-time');
  if (fill) fill.style.width = pct + '%';
  if (thumb) thumb.style.right = (100 - pct) + '%';
  if (curTime) curTime.textContent = formatTime(audio.currentTime);
  if (totTime) totTime.textContent = formatTime(audio.duration);
}

function openMobileQueue() {

  closeMobileNowPlaying();
  setTimeout(() => toggleQueue(), 100);
}

document.addEventListener('DOMContentLoaded', () => {
  const handle = document.getElementById('mnp-drag-handle');
  if (handle) {
    handle.addEventListener('click', closeMobileNowPlaying);
  }

  let startY = 0;
  const card = document.getElementById('mobile-now-playing');
  if (card) {
    card.addEventListener('touchstart', (e) => {
      if (e.target.closest('.mnp-progress-wrap') || e.target.closest('.mnp-volume')) return;
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
});

const _origLoadSongUI = loadSongUI;
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
    if (mnpArt) mnpArt.src = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
    if (mnpTitle) mnpTitle.textContent = song.title || 'Unknown';
    if (mnpArtist) mnpArtist.textContent = song.artist || 'â€”';
  }
};

const _origUpdatePlayButtonUI = updatePlayButtonUI;
window.updatePlayButtonUI = function() {
  _origUpdatePlayButtonUI();
  syncMobileNowPlayingPlayState();
};

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (audio) {
      audio.addEventListener('timeupdate', syncMobileNowPlayingProgress);
      audio.addEventListener('loadedmetadata', () => {
        const totTime = document.getElementById('mnp-tot-time');
        if (totTime) totTime.textContent = formatTime(audio.duration || 0);
      });
    }
  }, 500);
});

