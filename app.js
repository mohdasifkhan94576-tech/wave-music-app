
'use strict';

const SONGS = [];

const ARTISTS = [
  {
    id: 'arijit-singh',
    name: 'Arijit Singh',
    img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=300&h=300&fit=crop',
    listeners: '38,451,920',
    sub: '38.4M listeners'
  },
  {
    id: 'shreya-ghoshal',
    name: 'Shreya Ghoshal',
    img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=300&h=300&fit=crop',
    listeners: '18,230,140',
    sub: '18.2M listeners'
  },
  {
    id: 'atif-aslam',
    name: 'Atif Aslam',
    img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=300&h=300&fit=crop',
    listeners: '15,842,910',
    sub: '15.8M listeners'
  },
  {
    id: 'neha-kakkar',
    name: 'Neha Kakkar',
    img: 'https://images.unsplash.com/photo-1487180142328-054b783fc471?q=80&w=300&h=300&fit=crop',
    listeners: '22,510,870',
    sub: '22.5M listeners'
  },
  {
    id: 'diljit-dosanjh',
    name: 'Diljit Dosanjh',
    img: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=300&h=300&fit=crop',
    listeners: '14,350,210',
    sub: '14.3M listeners'
  },
  {
    id: 'badshah',
    name: 'Badshah',
    img: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=300&h=300&fit=crop',
    listeners: '16,120,440',
    sub: '16.1M listeners'
  },
  {
    id: 'armaan-malik',
    name: 'Armaan Malik',
    img: 'https://images.unsplash.com/photo-1525417071002-5ee4e6bb44f7?q=80&w=300&h=300&fit=crop',
    listeners: '11,890,520',
    sub: '11.8M listeners'
  },
  {
    id: 'anirudh-ravichander',
    name: 'Anirudh Ravichander',
    img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=300&h=300&fit=crop',
    listeners: '12,980,110',
    sub: '12.9M listeners'
  }
];

const RESOLVED_ARTISTS_CACHE = new Map();

function findArtistById(artistId) {
  let artist = ARTISTS.find(a => a.id === artistId);
  if (artist) return artist;

  if (RESOLVED_ARTISTS_CACHE.has(artistId)) {
    return RESOLVED_ARTISTS_CACHE.get(artistId);
  }

  for (const song of state.recentSongs) {
    const primaryName = song.artist.split(',')[0].trim();
    const slug = primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (`artist-${slug}` === artistId) {
      return {
        id: artistId,
        name: primaryName,
        img: song.thumb,
        listeners: '1,250,000',
        sub: 'Recent Artist'
      };
    }
  }

  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  for (const song of likedSongs) {
    const primaryName = song.artist.split(',')[0].trim();
    const slug = primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (`artist-${slug}` === artistId) {
      return {
        id: artistId,
        name: primaryName,
        img: song.thumb,
        listeners: '1,100,000',
        sub: 'Recent Artist'
      };
    }
  }

  for (const song of SONGS) {
    const primaryName = song.artist.split(',')[0].trim();
    const slug = primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (`artist-${slug}` === artistId) {
      return {
        id: artistId,
        name: primaryName,
        img: song.thumb,
        listeners: '1,000,000',
        sub: 'Recent Artist'
      };
    }
  }

  if (artistId.startsWith('artist-')) {
    const nameSlug = artistId.replace('artist-', '');
    const name = nameSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      id: artistId,
      name: name,
      img: 'https://placehold.co/300x300/1a1a2e/a855f7?text=' + encodeURIComponent(name),
      listeners: '1,000,000',
      sub: 'Artist'
    };
  }

  return ARTISTS[0];
}

function getArtistObj(name, fallbackImg) {
  const cleanName = name.trim();
  const matched = ARTISTS.find(a => a.name.toLowerCase() === cleanName.toLowerCase());
  if (matched) return matched;
  
  const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: `artist-${slug}`,
    name: cleanName,
    img: fallbackImg || `https://placehold.co/300x300/1a1a2e/a855f7?text=${encodeURIComponent(cleanName.substring(0, 10))}`,
    listeners: '1,200,000',
    sub: 'Recent Artist'
  };
}
const MIXES = [
  { id: 'm1', title: 'Chill Vibes Mix', sub: 'Relax and unwind', img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%231e1b4b'/><text x='50%' y='50%' font-family='sans-serif' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'>Chill Vibes</text></svg>" },
  { id: 'm2', title: 'Workout Hits', sub: 'Get pumped', img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%237f1d1d'/><text x='50%' y='50%' font-family='sans-serif' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'>Workout Hits</text></svg>" },
  { id: 'm3', title: 'Bollywood Mix', sub: 'Best of Bollywood', img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%2314532d'/><text x='50%' y='50%' font-family='sans-serif' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'>Bollywood</text></svg>" },
  { id: 'm4', title: 'Acoustic Romance', sub: 'Unplugged love songs', img: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><rect width='300' height='300' fill='%23701a75'/><text x='50%' y='50%' font-family='sans-serif' font-size='24' fill='white' text-anchor='middle' dominant-baseline='middle'>Acoustic</text></svg>" }
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
  followedArtists: [],
  heroIndex: 0,
  heroInterval: null
};

let audio;
let searchTimeout;

let savedJioSaavnSongs = [];
let searchSource = 'jiosaavn';

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

function normalizeSongFields(song) {
  if (song) {
    if (song.isCloud || (typeof song.id === 'string' && song.id.startsWith('c-'))) {
      song.isCloud = true;
    }
    const url = song.thumb || song.img || song.image || 'https://placehold.co/200x200/1a1a1a/a855f7?text=Music';
    song.thumb = url;
    song.img = url;
    song.image = url;
  }
  return song;
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
      state.recentSongs.forEach(normalizeSongFields);
    } else {
      state.recentSongs = [];
    }

    const savedQueue = localStorage.getItem('wave_session_queue');
    if (savedQueue) {
      const parsedQueue = JSON.parse(savedQueue);
      if (parsedQueue.length > 0) {
        state.queue = parsedQueue;
        state.queue.forEach(normalizeSongFields);
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
  if (!savedJioSaavnSongs.find(s => s.id === song.id)) {
    savedJioSaavnSongs.push(song);
    saveUserState();
  }
}

let cloudData = { songs: [], artists: [], notifications: [] };


function getSeenNotifIds() {
  try { return JSON.parse(localStorage.getItem('wave_seen_notifs') || '[]'); } catch { return []; }
}
function saveSeenNotifIds(ids) {
  localStorage.setItem('wave_seen_notifs', JSON.stringify(ids));
}

window.toggleNotifications = function() {
  const dd = document.getElementById('notif-dropdown');
  if (!dd) return;
  dd.classList.toggle('hidden');
  
  if (!dd.classList.contains('hidden')) {
    setTimeout(() => {
      document.addEventListener('click', function _closeNotif(e) {
        if (!dd.contains(e.target) && !document.getElementById('bell-btn').contains(e.target)) {
          dd.classList.add('hidden');
          document.removeEventListener('click', _closeNotif);
        }
      });
    }, 10);
  }
};

window.clearNotifications = function() {
  const notifs = cloudData.notifications || [];
  const allIds = notifs.map(n => n.id);
  saveSeenNotifIds(allIds);
  renderCloudNotifications();
};

function renderCloudNotifications() {
  const listEl = document.getElementById('notif-list');
  const badgeEl = document.getElementById('notif-badge');
  if (!listEl) return;

  const notifs = cloudData.notifications || [];
  const seenIds = getSeenNotifIds();
  const activeNotifs = notifs.filter(n => !seenIds.includes(n.id));

  if (activeNotifs.length === 0) {
    listEl.innerHTML = '<div class="notif-empty">No new notifications</div>';
    if (badgeEl) badgeEl.classList.add('hidden');
    return;
  }

  listEl.innerHTML = activeNotifs.map((n, i) => `
    <div class="notif-item" style="animation-delay: ${i * 0.05}s">
      <span class="notif-dot type-${n.type || 'info'}"></span>
      <div class="notif-item-content">
        <div class="notif-msg">${n.msg}</div>
        <div class="notif-time">${n.time || ''}</div>
      </div>
    </div>
  `).join('');

  if (badgeEl) {
    badgeEl.textContent = activeNotifs.length;
    badgeEl.classList.remove('hidden');
  }
}

async function loadCloudData() {
  try {
    const res = await fetch('cloud_data.json');
    if (res.ok) {
      cloudData = await res.json();
      
      if (cloudData.notifications) {
        renderCloudNotifications();
      }
      if (cloudData.artists) {
        cloudData.artists.forEach(art => {
          RESOLVED_ARTISTS_CACHE.set(art.id, art);
        });
      }
      if (cloudData.songs) {
        cloudData.songs.forEach(song => {
          song.isCloud = true;
          normalizeSongFields(song);
          const existing = SONGS.find(s => s.id === song.id);
          if (!existing) {
            SONGS.push({
              ...song,
              album: song.album || 'Cloud Exclusive',
              plays: 'Local Play',
              duration: song.duration || '0:00'
            });
          } else {
            existing.isCloud = true;
            existing.img = song.img;
            existing.thumb = song.thumb;
            existing.image = song.image;
            existing.audioUrl = song.audioUrl;
            if (song.tags) existing.tags = song.tags;
            if (song.rank !== undefined) existing.rank = song.rank;
            if (song.recentlyAdded !== undefined) existing.recentlyAdded = song.recentlyAdded;
            if (song.duration) existing.duration = song.duration;
            if (song.album) existing.album = song.album;
          }
        });
      }
    }
  } catch (e) {
    console.error('Error loading cloud_data.json:', e);
  }
}

window.addEventListener('beforeunload', () => {
  saveUserState();
});

window.addEventListener('DOMContentLoaded', async () => {
  loadUserState();
  renderSidebarPlaylists();
  loadUserProfile();
  await loadCloudData();
  renderView('home');
  initAudio();

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
      <div id="home-artists-section">${_homeSkeleton('Popular Artists')}</div>
      
      <div id="cloud-recently-added-section"></div>
      <div id="cloud-top-10-english-section"></div>
      <div id="cloud-english-section"></div>
      <div id="cloud-top-10-hindi-section"></div>
      <div id="cloud-anime-section"></div>
      <div id="cloud-kpop-section"></div>
      <div id="cloud-kdrama-section"></div>
      <div id="cloud-pakistani-section"></div>
      <div id="cloud-islamic-section"></div>
      <div id="cloud-top-10-islamic-section"></div>
      <div id="cloud-podcasts-section"></div>

      <div id="rec-artist-section"></div>
      <div id="rec-genre-section"></div>
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
        <span style="font-size:11px; color:#1db954; font-weight:600; display:flex; align-items:center; gap:5px;">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
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

function _buildDynamicSection(title, songs, badge) {
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

  const sourceIcon = `<svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
  const sourceLabel = 'JioSaavn';
  const sourceColor = '#1db954';

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
  
  async function _fetchSongs(query, limit) {
    try {
      const jioResults = await JIOSAAVN_API.searchSongs(query, limit);
      return { songs: jioResults.filter(s => s.audioUrl), source: 'jiosaavn' };
    } catch (e) {
      return { songs: [], source: 'none' };
    }
  }

  async function _fetchTrending(limit) {
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
    newReleases: _fetchSongs('latest hindi songs', 10),
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
    return badge;
  }

  const bannerEl = document.getElementById('hero-banner');
  if (bannerEl) {
    const ids = ['c-song-2', 'c-song-1', 'c-song-5', 'c-song-79', 'c-song-60'];
    const spotlights = SONGS.filter(s => s.isCloud && ids.includes(s.id));
    
    spotlights.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    
    if (spotlights.length === 0 && SONGS.length > 0) {
      spotlights.push(...SONGS.filter(s => s.isCloud).slice(0, 5));
    }
    
    if (spotlights.length > 0) {
      bannerEl.className = 'hero-banner';
      bannerEl.style.display = 'block';
      bannerEl.style.opacity = '1';
      
      const colors = {
        'c-song-1': '244, 63, 94',   
        'c-song-2': '6, 182, 212',    
        'c-song-5': '217, 70, 239',   
        'c-song-79': '245, 158, 11',  
        'c-song-60': '16, 185, 129'   
      };
      
      let slidesHTML = '<div class="hero-slides-wrapper">';
      let dotsHTML = '<div class="hero-carousel-dots">';
      
      spotlights.forEach((song, idx) => {
        const rgb = colors[song.id] || '168, 85, 247';
        slidesHTML += `
          <div class="hero-slide" style="--slide-color-rgb: ${rgb};">
            <div class="hero-bg-overlay"></div>
            <div class="hero-slide-content">
              <div class="hero-text">
                <span class="hero-tag">ALL-TIME FAVOURITE</span>
                <h2 class="hero-title">${song.title}</h2>
                <p class="hero-artist">${song.artist}</p>
                <div class="hero-actions">
                  <button class="play-btn-main" onclick="playHeroSong('${song.id}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play Now
                  </button>
                </div>
              </div>
              <div class="hero-artwork-wrap">
                <img src="${song.thumb || song.img}" alt="${song.title}" class="hero-cover-3d">
              </div>
            </div>
          </div>
        `;
        dotsHTML += `<span class="hero-dot" style="--slide-color-rgb: ${rgb};"></span>`;
      });
      
      slidesHTML += '</div>';
      dotsHTML += '</div>';
      
      bannerEl.innerHTML = slidesHTML + dotsHTML;
      
      
      if (typeof initHeroCarousel === 'function') {
        initHeroCarousel();
      }
    } else {
      bannerEl.style.display = 'none';
    }
  }

  const discoverEl = document.getElementById('home-discover-section');
  if (discoverEl) {
    discoverEl.innerHTML = _buildDynamicSection('Discover Fresh', data.discover, 
      _sourceBadge(sources.discover, { bg: '#1db954,#1ed760', color: '#000', text: 'NEW' }));
  }

  const trendingEl = document.getElementById('home-trending-section');
  if (trendingEl) {
    trendingEl.innerHTML = _buildDynamicSection('Trending Now', data.trending.slice(1), 
      _sourceBadge(sources.trending, { bg: '#ef4444,#f97316', color: '#fff', text: 'HOT' }));
  }

  const mixesEl = document.getElementById('home-mixes-section');
  if (mixesEl) {
    mixesEl.innerHTML = _buildDynamicSection('Your Top Mixes', data.mixes, 
      _sourceBadge(sources.mixes, { bg: '#a855f7,#6366f1', color: '#fff', text: 'MIX' }));
  }

  const podcastsEl = document.getElementById('home-podcasts-section');
  if (podcastsEl) {
    podcastsEl.innerHTML = _buildDynamicSection('Podcasts & Talks', data.podcasts, 
      _sourceBadge(sources.podcasts, { bg: '#0ea5e9,#06b6d4', color: '#fff', text: 'TALK' }));
  }

  const mfySongs = [...(data.mfy1 || []), ...(data.mfy2 || []), ...(data.mfy3 || [])];

  const uniqueMfy = [];
  const mfyIds = new Set();
  mfySongs.forEach(s => { if (!mfyIds.has(s.id)) { mfyIds.add(s.id); uniqueMfy.push(s); } });

  const mfySource = sources.mfy1 || sources.mfy2 || 'none';
  const mfyEl = document.getElementById('home-madeforyou-section');
  if (mfyEl) {
    const mfyLabel = userArtists.length >= 2 
      ? `Made For You — ${userArtists.slice(0, 2).join(', ')} & more`
      : "Made For You — India's Best";
    mfyEl.innerHTML = _buildDynamicSection(mfyLabel, uniqueMfy.slice(0, 12), 
      _sourceBadge(mfySource, { bg: '#a855f7,#ec4899', color: '#fff', text: 'FOR YOU' }));
  }

  const newReleasesEl = document.getElementById('home-newreleases-section');
  if (newReleasesEl) {
    newReleasesEl.innerHTML = _buildDynamicSection('New Releases', data.newReleases, 
      _sourceBadge(sources.newReleases, { bg: '#f59e0b,#ef4444', color: '#fff', text: 'LATEST' }));
  }

  
  const artistsEl = document.getElementById('home-artists-section');
  if (artistsEl) {
    let homeArtists = [];
    if (cloudData.artists && cloudData.artists.length > 0) {
      homeArtists = [...cloudData.artists];
    } else {
      homeArtists = [...ARTISTS];
    }
    homeArtists = homeArtists.slice(0, 10);
    artistsEl.innerHTML = buildSection('Top Artists This Week', homeArtists, false);
  }
  
  if (cloudData.songs && cloudData.songs.length > 0) {
    const getRandomSubset = (arr, n) => {
      let shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, n);
    };

    const recAdded = getRandomSubset(cloudData.songs.filter(s => s.recentlyAdded), 15);
    const top10Eng = cloudData.songs.filter(s => s.tags && s.tags.includes('top-10-english')).sort((a,b) => a.rank - b.rank);
    const engSongs = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('english')), 15);
    const top10Hindi = cloudData.songs.filter(s => s.tags && s.tags.includes('top-10-hindi')).sort((a,b) => a.rank - b.rank);
    const animeSongs = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('anime')), 15);
    const kpopSongs = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('kpop')), 15);
    const kdramaSongs = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('k-drama')), 15);
    const pakSongs = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('pakistani')), 15);
    const islamicSongs = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('islamic')), 15);
    const top10Islamic = cloudData.songs.filter(s => s.tags && s.tags.includes('top-10-islamic')).sort((a,b) => a.rank - b.rank);
    const podcasts = getRandomSubset(cloudData.songs.filter(s => s.tags && s.tags.includes('podcast')), 15);

    const setHTML = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    if (recAdded.length > 0) setHTML('cloud-recently-added-section', buildSection('Recently Added Exclusives ', recAdded, false));
    if (top10Eng.length > 0) setHTML('cloud-top-10-english-section', buildTop10Section('Top 10 English Songs ', top10Eng));
    if (engSongs.length > 0) setHTML('cloud-english-section', buildSection('Best of English Hits ', engSongs, false));
    if (top10Hindi.length > 0) setHTML('cloud-top-10-hindi-section', buildTop10Section('Top 10 Hindi Songs ', top10Hindi));
    if (animeSongs.length > 0) setHTML('cloud-anime-section', buildSection('Best of Anime OSTs ', animeSongs, false));
    if (kpopSongs.length > 0) setHTML('cloud-kpop-section', buildSection('K-Pop Specials ', kpopSongs, false));
    if (kdramaSongs.length > 0) setHTML('cloud-kdrama-section', buildSection('Top K-Drama Soundtracks ', kdramaSongs, false));
    if (pakSongs.length > 0) setHTML('cloud-pakistani-section', buildSection('Best of Pakistan 🇵🇰', pakSongs, false));
    if (islamicSongs.length > 0) setHTML('cloud-islamic-section', buildSection('Beautiful Islamic Naats ', islamicSongs, false));
    if (top10Islamic.length > 0) setHTML('cloud-top-10-islamic-section', buildTop10Section('Top 10 Naats', top10Islamic));
    if (podcasts.length > 0) setHTML('cloud-podcasts-section', buildSection('Curated Podcasts & Talks ', podcasts, false));
  }
}

function getFooterHTML() {
  return `
    <footer class="app-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Wave Music</h4>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('about')">About</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('updates')">What's New</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('contact')">Contact</a>
        </div>
        <div class="footer-col">
          <h4>Data Sources</h4>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('jiosaavn')">JioSaavn</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('howItWorks')">How It Works</a>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('faq')">FAQ</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('tips')">Tips & Tricks</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('privacy')">Privacy Policy</a>
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <div class="footer-socials">
            <a href="#" class="social-icon" title="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
            <a href="#" class="social-icon" title="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="#" class="social-icon" title="GitHub"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
          </div>
        </div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-bottom">
        <p>&copy; 2026 Wave Music. All rights reserved.</p>
        <div class="footer-links">
          <a href="#" onclick="event.preventDefault(); openFooterPopup('legal')">Legal</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('privacy')">Privacy</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('about')">About</a>
          <a href="#" onclick="event.preventDefault(); openFooterPopup('updates')">Updates</a>
        </div>
      </div>
    </footer>
  `;
}

function openFooterPopup(type) {
  const popupData = {
    about: {
      icon: '', title: 'About Wave Music',
      content: '<div class="fp-section"><p>Wave Music is a <strong>modern, fast, and beautiful</strong> music streaming application designed to provide you with the best listening experience.</p></div><div class="fp-section"><h4>Features</h4><ul><li>JioSaavn high-quality audio streaming</li><li>Smart search with instant results</li><li>Dynamic Island with live now-playing info</li><li>Like songs, create playlists, and track history</li><li>Mini player, queue management, shuffle, and repeat</li><li>Beautiful dark theme with glassmorphism design</li><li>PWA support — install as an app on any device</li></ul></div><div class="fp-section"><h4>Developer</h4><p>Built with love using vanilla HTML, CSS, and JavaScript with a Python FastAPI backend. No frameworks, pure performance.</p></div><div class="fp-badge">Version 2.0 — May 2026</div>'
    },
    updates: {
      icon: '', title: "What's New — Updates",
      content: '<div class="fp-update-item"><span class="fp-update-date">May 2026 — v2.0</span><h4>Major Update</h4><ul><li><strong>Pure JioSaavn Streaming:</strong> Moved fully to JioSaavn for 100% reliable, fast, and high-quality audio streaming.</li><li><strong>Zero Extraction Delay:</strong> Instant playback without waiting for YouTube extraction.</li><li><strong>Dynamic Island Sync:</strong> Real-time synchronization of Now Playing info.</li><li><strong>Resume Playback:</strong> Continue playback exactly where you left off after pausing.</li></ul></div><div class="fp-update-item"><span class="fp-update-date">Apr 2026 — v1.5</span><h4>UI Improvements</h4><ul><li>JioSaavn integration</li><li>Profile system with avatar upload</li><li>Custom playlist creation & management</li><li>Mobile responsive design</li><li>Service Worker for offline caching</li></ul></div><div class="fp-update-item"><span class="fp-update-date">Mar 2026 — v1.0</span><h4>Initial Release</h4><ul><li>Music search & streaming</li><li>Liked songs & recent history</li><li>Queue management & dark theme</li></ul></div>'
    },
    jiosaavn: {
      icon: '', title: 'JioSaavn',
      content: '<div class="fp-section"><p><strong>JioSaavn</strong> is a leading music streaming platform. Wave Music uses it as the primary source for high-quality audio streaming.</p></div><div class="fp-section"><h4>JioSaavn Features</h4><ul><li>Bollywood, Indie, Devotional, Regional, and more</li><li>High-quality audio streaming</li><li>Fast loading with no extraction delay</li></ul></div><div class="fp-tip"><strong>Pro Tip:</strong> JioSaavn provides the best streaming quality for Bollywood and regional music.</div>'
    },
    howItWorks: {
      icon: '', title: 'How Wave Music Works',
      content: '<div class="fp-section"><h4>Search & Streaming</h4><p>When you search for a song, Wave fetches high-quality results from the JioSaavn API and plays the direct stream URLs for instant playback.</p></div>'
    },
    faq: {
      icon: '', title: 'FAQ',
      content: '<div class="fp-faq"><div class="fp-faq-item"><h4>Q: The song is loading but not playing?</h4><p>A: Perform a hard refresh of the page (Ctrl+Shift+R or Cmd+Shift+R) and check your internet connection.</p></div><div class="fp-faq-item"><h4>Q: Can I install this on my phone?</h4><p>A: Yes! You can install it by selecting "Add to Home Screen" in your browser menu. It is fully PWA-compatible.</p></div><div class="fp-faq-item"><h4>Q: Are liked songs saved?</h4><p>A: Yes, all data is saved locally in your browser storage.</p></div><div class="fp-faq-item"><h4>Q: What is the Dynamic Island?</h4><p>A: It is a floating widget at the top center that displays the current song information and playback controls.</p></div></div>'
    },
    tips: {
      icon: '', title: 'Tips & Tricks',
      content: '<div class="fp-section"><ul class="fp-tips-list"><li><strong>Search:</strong> Start typing directly in the top search bar.</li><li><strong>Install:</strong> Open your browser menu and click "Add to Home Screen" to install.</li><li><strong>Shuffle:</strong> Randomize your queue layout.</li><li><strong>Repeat:</strong> Loop the currently playing song.</li><li><strong>Like:</strong> Click the heart icon to save songs to your Liked list.</li><li><strong>Playlists:</strong> Click the "+" icon in the sidebar to create custom playlists.</li><li><strong>Dynamic Island:</strong> Click the top center widget to expand media controls.</li><li><strong>Volume:</strong> Adjust the volume slider in the bottom right corner.</li></ul></div>'
    },
    privacy: {
      icon: '', title: 'Privacy Policy',
      content: '<div class="fp-section"><p>Wave Music takes your privacy seriously.</p><ul><li>No personal data is ever stored on a server.</li><li>All your data remains in your browser local storage.</li><li>There is no third-party tracking or analytics.</li><li>Music is only streamed, not stored or downloaded.</li></ul></div><div class="fp-badge">Your data stays on your device</div>'
    },
    legal: {
      icon: '', title: 'Legal Information',
      content: '<div class="fp-section"><p>Wave Music is a <strong>personal and educational project</strong>.</p><ul><li>This app does not host any music files — it only streams from publicly available JioSaavn APIs.</li><li>JioSaavn trademarks and brands belong to their respective owners.</li><li>Music copyright belongs to the original artists and music labels.</li><li>This application is not intended for commercial use.</li></ul></div>'
    },
    contact: {
      icon: '', title: 'Contact Us',
      content: '<div class="fp-section"><p>Do you have questions or suggestions about Wave Music?</p><div class="fp-contact-items"><div class="fp-contact-item"><div><strong>Email</strong><p>wave.music.app@gmail.com</p></div></div><div class="fp-contact-item"><div><strong>Feedback</strong><p>If you find any bugs or have feature requests, please let us know.</p></div></div><div class="fp-contact-item"><div><strong>Share</strong><p>If you enjoy using the app, feel free to share it with your friends.</p></div></div></div></div>'
    }
  };
  const data = popupData[type];
  if (!data) return;
  const existing = document.getElementById('footer-popup-overlay');
  if (existing) existing.remove();
  const overlay = document.createElement('div');
  overlay.id = 'footer-popup-overlay';
  overlay.className = 'footer-popup-overlay';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div class="footer-popup-card">
      <button class="footer-popup-close" onclick="document.getElementById('footer-popup-overlay').remove()">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
      </button>
      <div class="footer-popup-header">
        ${data.icon ? `<span class="footer-popup-icon">${data.icon}</span>` : ''}
        <h2>${data.title}</h2>
      </div>
      <div class="footer-popup-body">${data.content}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('fp-visible'));
}

function getPlaylistHTML(playlistId) {
  const allPlaylists = [...MIXES, ...PODCASTS, ...TRENDING, ...MADE_FOR_YOU, ...DISCOVER, ...state.userPlaylists];
  const playlist = allPlaylists.find(p => p.id === playlistId) || allPlaylists[0];

  const isCustom = playlistId.startsWith('up_');
  const deleteBtn = isCustom ? `<br><button class="clear-queue-btn" style="margin-top: 15px; padding: 6px 12px; background: rgba(255,50,50,0.1); color: #ff5555; border: 1px solid rgba(255,50,50,0.3);" onclick="deletePlaylist('${playlistId}')">Delete Playlist</button>` : '';

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
        const results = await JIOSAAVN_API.searchSongs(query, 20);

        let loadedHtml = '';
        results.filter(s => s.audioUrl).forEach((song, i) => {
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
    listHTML = playlistSongs.length > 0 ? playlistSongs.map((song, i) => {
      normalizeSongFields(song);
      return `
        <div class="list-row" onclick="playSong(${SONGS.indexOf(song)})">
          <div class="col-num">${i + 1}</div>
          <div class="col-title">
            <img src="${song.thumb || song.img || 'https://placehold.co/200x200/1a1a1a/a855f7?text=Music'}" alt="">
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
    `; }).join('') : '<div style="padding: 20px; color: var(--text-muted); text-align: center;">No songs in this playlist yet. Add some!</div>';
  }

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    <div class="pl-header">
      <img src="${playlist.img}" class="pl-cover" alt="">
      <div class="pl-info">
        <span style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Playlist</span>
        <h1>${playlist.title}</h1>
        <p style="color: var(--text-muted);">${playlist.sub} - ${isDynamicMix ? '50' : playlistSongs.length} songs</p>
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

  const listHTML = likedSongs.length > 0 ? likedSongs.map((song, i) => {
    normalizeSongFields(song);
    return `
      <div class="list-row" onclick="playSpecificSong('${song.id}')">
        <div class="col-num">${i + 1}</div>
        <div class="col-title">
          <img src="${song.thumb || song.img || 'https://placehold.co/200x200/1a1a1a/a855f7?text=Music'}" alt="">
          <div><h4>${song.title}</h4><p>${song.artist}</p></div>
        </div>
        <div class="col-album">${song.album}</div>
        <div class="col-time">${song.duration}</div>
      </div>
    `;
  }).join('') : '<div style="padding: 20px; color: var(--text-muted);">No liked songs yet.</div>';

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
          <div class="lib-card-sub">Playlist - ${songCount} songs</div>
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
      ${recentSongs.map(song => {
        normalizeSongFields(song);
        return `
          <div class="list-row" onclick="playRecentSong('${song.id}')">
            <div class="col-title" style="flex:1;">
              <img src="${song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music'}" alt="" style="width:44px;height:44px;border-radius:8px;object-fit:cover;">
              <div><h4 style="font-size:14px;">${song.title}</h4><p style="font-size:12px;color:var(--text-muted);">${song.artist}</p></div>
            </div>
            <div style="color:var(--text-dark);font-size:12px;">${song.duration || ''}</div>
          </div>
        `;
      }).join('')}
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
  const artist = findArtistById(artistId);
  const isFollowed = state.followedArtists.includes(artist.id);
  const followBtnClass = isFollowed ? 'follow-btn following' : 'follow-btn';
  const followBtnText = isFollowed ? 'Following' : 'Follow';

  setTimeout(async () => {
    try {
      const container = document.getElementById('artist-songs-container');
      if (!container) return;

      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
          <div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>
          Loading songs by ${artist.name}...
        </div>
      `;

      const results = await JIOSAAVN_API.searchSongs(artist.name + ' songs', 25);
      
      if (results.length === 0) {
        container.innerHTML = `<div style="padding: 20px; color: var(--text-muted); text-align: center;">No songs found for this artist.</div>`;
        return;
      }

      results.forEach(song => {
        if (!SONGS.find(s => s.id === song.id)) {
          SONGS.push(song);
        }
      });

      const listHTML = results.map((song, i) => `
        <div class="list-row" onclick="playJioSaavnSong(SONGS.find(s => s.id === '${song.id}'))">
          <div class="col-num">${i + 1}</div>
          <div class="col-title">
            <img src="${song.thumb}" alt="" onerror="this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music'">
            <div>
              <h4>${song.title}</h4>
              <p>${song.artist}</p>
            </div>
          </div>
          <div class="col-album">${song.album || 'Single'}</div>
          <div class="col-time">${song.duration}</div>
        </div>
      `).join('');

      container.innerHTML = listHTML;
    } catch (err) {
      console.error(err);
      const container = document.getElementById('artist-songs-container');
      if (container) {
        container.innerHTML = `<div style="padding: 20px; color: #ff5555; text-align: center;">Failed to load songs. Please try again.</div>`;
      }
    }
  }, 100);

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    <div class="pl-header" style="align-items: center; margin-top: 20px;">
      <img src="${artist.img}" class="pl-cover" style="border-radius: 50%; object-fit: cover;" alt="" onerror="this.src='https://placehold.co/300x300/1a1a2e/a855f7?text=Artist'">
      <div class="pl-info">
        <span style="font-size: 12px; font-weight: 700; color: #3b82f6; display: flex; align-items: center; gap: 4px;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          Verified Artist
        </span>
        <h1 style="font-size: 72px; line-height: 1.1;">${artist.name}</h1>
        <p style="color: var(--text-muted); margin-bottom: 16px;">${artist.listeners || '1,234,567'} monthly listeners</p>
        <button class="${followBtnClass}" onclick="toggleFollow('${artist.id}')">${followBtnText}</button>
      </div>
    </div>
    <h3 style="margin: 30px 0 16px; font-size: 24px;">Popular</h3>
    
    <div class="list-head">
      <div class="col-num">#</div>
      <div class="col-title">TITLE</div>
      <div class="col-album">ALBUM</div>
      <div class="col-time">TIME</div>
    </div>
    
    <div id="artist-songs-container">
      <div style="padding: 40px; text-align: center; color: var(--text-muted);">
        <div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>
        Loading popular songs...
      </div>
    </div>
  `;
}

function getDiscoverPageHTML() {
  setTimeout(async () => {
    try {
      const container = document.getElementById('dynamic-discover-container');
      if (!container) return;
      container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-muted);"><div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>Discovering fresh music from JioSaavn...</div>';

      const results = await JIOSAAVN_API.searchSongs('New Hits 2026', 16);

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

      const results = await JIOSAAVN_API.searchSongs('trending hits ' + new Date().getFullYear(), 16);

      let html = `
        <div class="section-block" style="margin-top:8px;">
          <div class="section-header">
            <h2>Live Top Charts</h2>
            <span style="font-size:12px; color:#1db954; font-weight:600; display:flex; align-items:center; gap:5px;">
              🟢 JioSaavn Live
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

      const results = await JIOSAAVN_API.searchSongs('Popular Podcasts', 12);

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
          <a href="#" onclick="navigateTo('artist', event, '${ARTISTS.find(a=>a.name===artist)?.id||('artist-' + artist.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}')" style="color: white; font-weight: 600; text-decoration: none;">${artist}</a> - 2024 - ${albumSongs.length} songs
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
  const isTopArtists = title === 'Top Artists This Week';
  const cards = items.map((item, i) => {
    const isArtist = !!item.name;
    const playAction = isArtist 
      ? `event.stopPropagation(); navigateTo('artist', null, '${item.id}')` 
      : (isRecent ? `event.stopPropagation(); playRecentSong('${item.id}')` : (isWide ? `event.stopPropagation(); navigateTo('playlist', null, '${item.id}')` : `event.stopPropagation(); playSpecificSong('${item.id}')`));
    const clickAction = isArtist
      ? `navigateTo('artist', event, '${item.id}')`
      : (isRecent ? `playRecentSong('${item.id}')` : (isWide ? `navigateTo('playlist', event, '${item.id}')` : `playSpecificSong('${item.id}')`));

    const badgeHtml = isRecent 
      ? `<div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#a855f7,#6366f1); padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; color:#fff; letter-spacing:0.5px;">RECENT</div>` 
      : (item.recentlyAdded ? `<div style="position:absolute; bottom:8px; left:8px; background:#e50914; padding:3px 8px; border-radius:4px; font-size:9px; font-weight:800; color:#fff; letter-spacing:0.5px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 3;">Recently added</div>` : '');

    const cardOverlayHtml = isTopArtists 
      ? '' 
      : `<div class="card-overlay" style="${isArtist ? 'border-radius: 50%;' : ''}">
          <button class="card-play-btn" onclick="${playAction}">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>`;

    return `
      <div class="music-card ${isWide ? 'wide' : ''} ${isArtist ? 'artist-card' : ''}" ${isTopArtists ? '' : `onclick="${clickAction}"`} style="${isTopArtists ? 'cursor: default;' : ''}">
        <div class="card-img-wrap" style="${isArtist ? 'border-radius: 50%;' : ''}">
          <img src="${item.thumb || item.img}" alt="${item.title || item.name}" loading="lazy" onerror="this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=${isArtist ? 'Artist' : 'Music'}'">
          ${cardOverlayHtml}
          ${badgeHtml}
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
        ${isTopArtists ? '' : '<a href="#">See all</a>'}
      </div>
      <div class="cards-container">
        ${cards}
      </div>
    </div>
  `;
}

function buildTop10Section(title, items) {
  const cards = items.map((item, i) => {
    const playAction = `event.stopPropagation(); playSpecificSong('${item.id}')`;
    const clickAction = `playSpecificSong('${item.id}')`;

    const badgeHtml = item.recentlyAdded 
      ? `<div style="position:absolute; bottom:8px; left:8px; background:#e50914; padding:3px 8px; border-radius:4px; font-size:9px; font-weight:800; color:#fff; letter-spacing:0.5px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); z-index: 3;">Recently added</div>` 
      : '';

    return `
      <div class="top10-item">
        <div class="top10-rank">${i + 1}</div>
        <div class="music-card" onclick="${clickAction}">
          <div class="card-img-wrap">
            <img src="${item.thumb || item.img}" alt="${item.title}" loading="lazy" onerror="this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Music'">
            <div class="card-overlay">
              <button class="card-play-btn" onclick="${playAction}">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
            ${badgeHtml}
          </div>
          <div class="card-info">
            <h3>${item.title}</h3>
            <p>${item.artist}</p>
          </div>
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
      <div class="top10-container">
        ${cards}
      </div>
    </div>
  `;
}

function setSearchSource(source) {
  searchSource = 'jiosaavn';
}

function _getToggleHTML() {
  return '';
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

  dropdown.innerHTML = _getToggleHTML() + `
    <div class="search-loading">
      <div class="search-spinner"></div>
      <span>Searching JioSaavn...</span>
    </div>
  `;
  dropdown.classList.remove('hidden');

  searchTimeout = setTimeout(async () => {
    try {
      const songResults = SONGS.filter(s => s && typeof s.title === 'string' && typeof s.artist === 'string' && (s.title.toLowerCase().includes(term) || s.artist.toLowerCase().includes(term))).slice(0, 3);
      const artistResults = ARTISTS.filter(a => a && typeof a.name === 'string' && a.name.toLowerCase().includes(term)).slice(0, 2);

      let html = _getToggleHTML();

      artistResults.forEach(a => {
        html += `
          <div class="search-item" onclick="this.closest('.search-dropdown').classList.add('hidden'); navigateTo('artist', null, '${a.id}')">
            <img src="${a.img || ''}" style="border-radius:50%;" onerror="this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Artist'">
            <div class="search-item-info"><h4>${a.name}</h4><p>Artist</p></div>
          </div>
        `;
      });

      songResults.forEach(s => {
        normalizeSongFields(s);
        const clickAction = s.isCloud
          ? `playSpecificSong('${s.id}')`
          : `playJioSaavnSong(SONGS.find(x=>x && (x.id==='${s.id}' || String(x.id)==='${s.id}')))`;
        html += `
          <div class="search-item" onclick="this.closest('.search-dropdown').classList.add('hidden'); ${clickAction}">
            <img src="${s.thumb}" onerror="this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music'">
            <div class="search-item-info"><h4>${s.title}</h4><p>${s.artist}</p></div>
          </div>
        `;
      });

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
        console.error('Error in JioSaavn search:', err);
      }

      if (html === _getToggleHTML()) {
        html += `<div style="padding:14px; color:var(--text-muted); text-align:center; font-size:13px;">No results found</div>`;
      }

      dropdown.innerHTML = html;
      dropdown.classList.remove('hidden');
    } catch (e) {
      console.error('Error inside searchTimeout:', e);
      dropdown.innerHTML = `<div style="padding:14px; color:#ff5555; text-align:center; font-size:13px;">Search error. Please try again.</div>`;
    }
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

  target.innerHTML = `
    <div style="padding-top: ${isMobile ? '10' : '20'}px; margin-bottom: 30px;">
      ${isMobile ? '' : '<h1 style="font-size: 42px; font-weight: 800;">Search Results</h1>'}
      <p style="color: var(--text-muted); margin-top: 8px;">Results for "${query}" on JioSaavn</p>
    </div>
    <div class="search-results-loading">
      <div class="search-spinner large"></div>
      <p>Searching JioSaavn...</p>
    </div>
  `;

  let jioSongs = [];
  const jioResult = await JIOSAAVN_API.searchSongs(query, 30).catch(() => []);
  jioSongs = jioResult || [];
  apiSearchResults = jioSongs;

  if (jioSongs.length === 0) {
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
          JioSaavn — ${jioSongs.length} results
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

  const queryLower = query.toLowerCase().trim();
  const cloudMatches = cloudData.songs ? cloudData.songs.filter(s => 
    s && 
    (typeof s.title === 'string' && s.title.toLowerCase().includes(queryLower) || 
     typeof s.artist === 'string' && s.artist.toLowerCase().includes(queryLower) ||
     (s.album && typeof s.album === 'string' && s.album.toLowerCase().includes(queryLower)))
  ) : [];

  let cloudSection = '';
  if (cloudMatches.length > 0) {
    const cloudListHTML = cloudMatches.map((song, i) => {
      song.isCloud = true;
      normalizeSongFields(song);
      const globalIdx = SONGS.findIndex(s => s && s.id === song.id);
      return `
        <div class="list-row cloud-row" onclick="playSpecificSong('${song.id}')">
          <div class="col-num">${i + 1}</div>
          <div class="col-title">
            <img src="${song.thumb}" alt="" onerror="this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music'">
            <div>
              <h4>${song.title} <span class="cloud-badge">CLOUD</span></h4>
              <p>${song.artist}</p>
            </div>
          </div>
          <div class="col-album">${song.album || 'Cloud Exclusive'}</div>
          <div class="col-time">
            <span class="quality-tag" style="background: rgba(168,85,247,0.2); color: #c084fc; border: 1px solid rgba(168,85,247,0.3); padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-right: 10px;">HQ</span>
            ${song.duration}
          </div>
        </div>
      `;
    }).join('');

    cloudSection = `
      <div style="margin-bottom: 45px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          Cloud Exclusives 
          <span style="font-size: 11px; padding: 2px 8px; background: rgba(168,85,247,0.15); color: #c084fc; border-radius: 20px; font-weight: 600; border: 1px solid rgba(168,85,247,0.2);">EXCLUSIVE</span>
        </h2>
        <div class="list-head">
          <div class="col-num">#</div>
          <div class="col-title">TITLE</div>
          <div class="col-album">ALBUM</div>
          <div class="col-time">TIME</div>
        </div>
        ${cloudListHTML}
      </div>
    `;
  }

  let artistsSection = '';
  const allSearchArtists = [
    ...ARTISTS,
    ...(cloudData.artists || [])
  ];
  const localArtists = allSearchArtists.filter(a => a && typeof a.name === 'string' && a.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6);
  if (localArtists.length > 0) {
    artistsSection = `
      <div style="margin-bottom: 40px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Artists</h2>
        <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 20px; margin-bottom: -20px;">
          ${localArtists.map(a => `
            <div class="music-card artist-card" style="width: 150px; text-align: center; flex-shrink: 0;" onclick="navigateTo('artist', event, '${a.id}')">
              <div class="card-img-wrap" style="border-radius: 50%; width: 120px; height: 120px; margin: 0 auto 12px;">
                <img src="${a.img}" alt="${a.name}" onerror="this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Artist'">
                <div class="card-overlay" style="border-radius: 50%;">
                  <button class="card-play-btn" onclick="event.stopPropagation(); navigateTo('artist', null, '${a.id}')">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
              </div>
              <div class="card-info" style="text-align: center;">
                <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${a.name}</h3>
                <p style="font-size: 12px; color: var(--text-muted);">Artist</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const totalResults = jioSongs.length;
  target.innerHTML = `
    <div style="padding-top: 20px; margin-bottom: 30px;">
      ${isMobile ? '' : '<h1 style="font-size: 42px; font-weight: 800;">Search Results</h1>'}
      <p style="color: var(--text-muted); margin-top: 8px;">${totalResults} songs found for "${query}"</p>
    </div>
    ${cloudSection}
    ${artistsSection}
    ${jioSection ? `<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Songs</h2>${jioSection}` : ''}
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

  const lang = song.language && song.language !== 'unknown' ? song.language : 'Hindi';
  const cleanSongTitle = songTitle.replace(/[^\w\s]/gi, '').split(' ')[0] || '';
  const relatedPromise = JIOSAAVN_API.searchSongs(`${lang} ${cleanSongTitle} hits`.trim(), 12);

  const [artistSongs, genreSongs] = await Promise.allSettled([
    JIOSAAVN_API.searchSongs(`${artistName} top songs`, 12),
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

  
  audio.addEventListener('playing', () => {
    state.isPlaying = true;
    updatePlayButtonUI();
    syncEqualizer();
    const currentSong = state.queue[state.currentIndex];
    if (currentSong) {
      const playerTitle = document.getElementById('pl-title');
      if (playerTitle) playerTitle.textContent = currentSong.title;
      showNowPlayingIsland(currentSong);
    }
  });

  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayButtonUI();
    syncEqualizer();
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
      audio.currentTime = 0; audio.play().catch(() => {});
    } else {
      nextSong();
    }
  });

  if (state.queue.length > 0 && state.queue[state.currentIndex]) {
    const resumeSong = state.queue[state.currentIndex];
    loadSongUI(state.currentIndex);

    if (resumeSong.audioUrl) {
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

  if (song.isCloud) {
    const primaryTag = (song.tags && song.tags.length > 0) ? song.tags[0] : null;
    let matchingSongs = [];
    if (primaryTag) {
      matchingSongs = (cloudData.songs || []).filter(s => s.tags && s.tags.includes(primaryTag));
    } else {
      matchingSongs = cloudData.songs || [];
    }

    matchingSongs.forEach(ms => {
      ms.isCloud = true;
      normalizeSongFields(ms);
      if (!SONGS.find(s => s.id === ms.id)) {
        SONGS.push({
          ...ms,
          album: ms.album || 'Cloud Exclusive',
          plays: 'Local Play',
          duration: ms.duration || '0:00'
        });
      }
    });

    const queueList = matchingSongs.map(ms => SONGS.find(s => s.id === ms.id)).filter(Boolean);
    if (queueList.length > 0) {
      state.queue = queueList;
      let playIdx = state.queue.findIndex(s => s.id === song.id);
      if (playIdx === -1) playIdx = 0;
      playSong(playIdx);
      return;
    }
  }

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

  state.currentIndex = idx;
  const song = state.queue[idx];
  if (!song) return;

  normalizeSongFields(song);
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

  if (song.audioUrl) {
    audio.src = song.audioUrl;
    audio.play().catch(() => {});
  } else {
    audio.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    audio.play().catch(() => {});
  }

 
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
  if (!audio.paused) {
    audio.pause();
  } else {
    const needsFullLoad = !audio.src || audio.src === window.location.href;
    
    if (needsFullLoad) {
      playSong(state.currentIndex);
    } else {
      audio.play().catch(() => {});
    }
  }
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
  const desktopBtn = document.getElementById('btn-repeat');
  if (desktopBtn) {
    desktopBtn.style.color = state.isRepeat ? 'var(--neon-purple)' : 'var(--text-muted)';
  }
  syncMnpRepeatState();
  triggerMnpPillFeedback(state.isRepeat ? "Repeat On" : "Repeat Off");
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
    triggerMnpPillFeedback("Removed Like");
  } else {
    state.likedSongs.push(song.id);
    btn.classList.add('liked');
    showDynamicIsland(`Liked "${song.title}"`, 'success', 2000);
    triggerMnpPillFeedback("Liked Song");
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
  syncMnpVolumeUI(val, state.isMuted);
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
  syncMnpVolumeUI(state.isMuted ? 0 : state.lastVolume, state.isMuted);
}

function updateMuteIcon() {
  const btn = document.getElementById('mute-btn');
  if (state.isMuted) {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  }
}

function syncMnpVolumeUI(volumeVal, isMuted) {
  const leftIcon = document.getElementById('mnp-vol-icon-left');
  const rightIcon = document.getElementById('mnp-vol-icon-right');
  if (!leftIcon || !rightIcon) return;

  const vol = Number(volumeVal);
  if (isMuted || vol === 0) {
    leftIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
    leftIcon.style.color = 'rgba(255, 255, 255, 0.2)';
    rightIcon.style.opacity = '0.2';
  } else if (vol <= 30) {
    leftIcon.innerHTML = `<path d="M7 9v6h4l5 5V4L11 9H7z"/>`;
    leftIcon.style.color = 'rgba(255, 255, 255, 0.4)';
    rightIcon.style.opacity = '0.2';
  } else if (vol <= 70) {
    leftIcon.innerHTML = `<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>`;
    leftIcon.style.color = 'rgba(255, 255, 255, 0.6)';
    rightIcon.style.opacity = '0.4';
  } else {
    leftIcon.innerHTML = `<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>`;
    leftIcon.style.color = 'rgba(255, 255, 255, 0.8)';
    rightIcon.style.opacity = '0.8';
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

  renderSidebarPlaylists();
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

    renderSidebarPlaylists();

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

function renderSidebarPlaylists() {
  const playlistSection = document.querySelectorAll('.nav-section')[2];
  if (!playlistSection) return;

  
  const customLinks = playlistSection.querySelectorAll('.nav-item[id^="sidebar-up_"]');
  customLinks.forEach(link => link.remove());

  
  state.userPlaylists.forEach(pl => {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'nav-item';
    link.id = 'sidebar-' + pl.id;
    link.textContent = pl.title;
    link.setAttribute('onclick', `navigateTo('playlist', event, '${pl.id}')`);
    link.onclick = (e) => navigateTo('playlist', e, pl.id);
    playlistSection.appendChild(link);
  });
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
  applyProfile(name || '', image);
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
    const initial = name && name.trim() ? name.trim().charAt(0).toUpperCase() : 'F';
    profileInitial.textContent = initial;
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
    pmInitial.textContent = name ? name.charAt(0).toUpperCase() : 'F';
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
  if (name) {
    localStorage.setItem('wave_user_name', name);
  } else {
    localStorage.removeItem('wave_user_name');
  }
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

  
  const brandPill = document.getElementById('mnp-brand-pill');
  if (brandPill) {
    brandPill.classList.remove('visible');
    setTimeout(() => {
      if (isMobileNowPlayingOpen) {
        brandPill.classList.add('visible');
      }
    }, 1000);
  }

  
  const mnpSlider = document.getElementById('mnp-vol-slider');
  if (mnpSlider) {
    const currentVol = audio ? Math.round(audio.volume * 100) : (state.lastVolume || 70);
    mnpSlider.value = currentVol;
    mnpSlider.style.setProperty('--mnp-vol-fill', currentVol + '%');
    syncMnpVolumeUI(currentVol, state.isMuted);
  }
}

function closeMobileNowPlaying() {
  const card = document.getElementById('mobile-now-playing');
  if (!card) return;
  isMobileNowPlayingOpen = false;
  card.classList.remove('open');
  document.body.style.overflow = '';

  const brandPill = document.getElementById('mnp-brand-pill');
  if (brandPill) {
    brandPill.classList.remove('visible');
  }
}

function syncMobileNowPlaying() {
  const song = state.queue[state.currentIndex];
  if (!song) return;

  const mnpArt = document.getElementById('mnp-art');
  const mnpInfoThumb = document.getElementById('mnp-info-thumb');
  const mnpTitle = document.getElementById('mnp-title');
  const mnpArtist = document.getElementById('mnp-artist');

  if (mnpArt) mnpArt.src = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
  if (mnpInfoThumb) mnpInfoThumb.src = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
  if (mnpTitle) mnpTitle.textContent = song.title || 'Unknown';
  if (mnpArtist) mnpArtist.textContent = song.artist || '';

  
  const coverUrl = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
  updateDominantColor(coverUrl);

  syncMobileNowPlayingLike();
  syncMobileNowPlayingPlayState();
  syncMobileNowPlayingProgress();
  syncMnpRepeatState();
  syncMnpMarquees();

  
  triggerMnpPillFeedback(`${song.title} — ${song.artist}`, true);
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
  
  const playBtn = document.getElementById('mnp-play-btn');
  if (playBtn) {
    if (state.isPlaying) {
      playBtn.classList.add('playing');
    } else {
      playBtn.classList.remove('playing');
    }
  }

  const artGlow = document.getElementById('mnp-art-glow');
  if (artGlow) {
    if (state.isPlaying) {
      artGlow.classList.add('playing');
    } else {
      artGlow.classList.remove('playing');
    }
  }

  syncMnpWaveform();
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
  openAddToPlaylistModal();
}

function handleMnpAddToLiked(e) {
  if (e) e.stopPropagation();
  toggleMnpMenu();
  toggleLike();
  syncMobileNowPlayingLike();
}


function syncMnpWaveform() {
  const wave = document.getElementById('mnp-waveform');
  if (wave) {
    if (state.isPlaying) {
      wave.classList.add('playing');
    } else {
      wave.classList.remove('playing');
    }
  }
}


function syncMnpRepeatState() {
  const btn = document.getElementById('mnp-repeat');
  if (btn) {
    if (state.isRepeat) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }
}


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
  const img = new Image();
  img.crossOrigin = "Anonymous";
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
        const brightness = (data[i] * 299 + data[i+1] * 587 + data[i+2] * 114) / 1000;
        if (brightness > 30 && brightness < 220) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
          count++;
        }
      }
      
      if (count > 0) {
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
      } else {
        r = 168; g = 85; b = 247; 
      }

      
      const max = Math.max(r, g, b);
      if (max < 80) {
        const factor = 80 / max;
        r = Math.min(255, Math.round(r * factor));
        g = Math.min(255, Math.round(g * factor));
        b = Math.min(255, Math.round(b * factor));
      }
      
      const card = document.getElementById('mobile-now-playing');
      if (card) {
        card.style.setProperty('--dom-color-rgb', `${r}, ${g}, ${b}`);
        card.style.setProperty('--dom-color-hex', `rgb(${r}, ${g}, ${b})`);
      }
    } catch (err) {
      console.warn("Color extraction failed, using fallback:", err);
      fallbackDominantColor();
    }
  };
  img.onerror = function() {
    fallbackDominantColor();
  };
  img.src = imgUrl;
}

function fallbackDominantColor() {
  const card = document.getElementById('mobile-now-playing');
  if (card) {
    card.style.setProperty('--dom-color-rgb', '168, 85, 247');
    card.style.setProperty('--dom-color-hex', '#a855f7');
  }
}


let mnpPillTimeout = null;
function triggerMnpPillFeedback(text, isSongNotice = false) {
  const brandPill = document.getElementById('mnp-brand-pill');
  const brandText = brandPill ? brandPill.querySelector('.mnp-brand-text') : null;
  if (!brandPill || !brandText) return;

  if (mnpPillTimeout) clearTimeout(mnpPillTimeout);

  brandPill.classList.remove('feedback-active');
  brandPill.classList.remove('expanded');

  
  void brandPill.offsetWidth;

  if (isSongNotice) {
    brandPill.classList.add('expanded');
  } else {
    brandPill.classList.add('feedback-active');
  }

  brandText.textContent = text;
  brandText.style.color = '#fff';

  const duration = isSongNotice ? 2600 : 2200;

  mnpPillTimeout = setTimeout(() => {
    brandPill.classList.remove('feedback-active');
    brandPill.classList.remove('expanded');
    setTimeout(() => {
      if (!brandPill.classList.contains('feedback-active') && !brandPill.classList.contains('expanded')) {
        brandText.textContent = 'Now Playing on Wave';
        brandText.style.color = '';
      }
    }, 300);
  }, duration);
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
      if (e.target.closest('.mnp-progress-wrap') || e.target.closest('.mnp-volume') || e.target.closest('.mnp-menu-container') || e.target.closest('.mnp-info-card')) return;
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

  const mnpVolSlider = document.getElementById('mnp-vol-slider');
  if (mnpVolSlider) {
    mnpVolSlider.addEventListener('input', (e) => setVolume(e.target.value));
    mnpVolSlider.addEventListener('change', (e) => setVolume(e.target.value));
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
            mnpArt.style.transform = 'translateX(-100px) scale(0.96)';
            mnpArt.style.opacity = '0';
          }
          setTimeout(() => {
            nextSong();
            if (mnpArt) {
              mnpArt.style.transform = 'translateX(100px) scale(0.96)';
              setTimeout(() => {
                mnpArt.style.transform = 'translateX(0) scale(1.06)';
                mnpArt.style.opacity = '1';
              }, 50);
            }
          }, 200);
        } else {
          
          if (mnpArt) {
            mnpArt.style.transform = 'translateX(100px) scale(0.96)';
            mnpArt.style.opacity = '0';
          }
          setTimeout(() => {
            prevSong();
            if (mnpArt) {
              mnpArt.style.transform = 'translateX(-100px) scale(0.96)';
              setTimeout(() => {
                mnpArt.style.transform = 'translateX(0) scale(1.06)';
                mnpArt.style.opacity = '1';
              }, 50);
            }
          }, 200);
        }
      }
      startSwipeX = 0;
      startSwipeY = 0;
    }, { passive: true });
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
    const mnpInfoThumb = document.getElementById('mnp-info-thumb');
    const mnpTitle = document.getElementById('mnp-title');
    const mnpArtist = document.getElementById('mnp-artist');
    if (mnpArt) mnpArt.src = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
    if (mnpInfoThumb) mnpInfoThumb.src = song.thumb || song.img || 'https://placehold.co/300x300/1a1a1a/a855f7?text=Music';
    if (mnpTitle) mnpTitle.textContent = song.title || 'Unknown';
    if (mnpArtist) mnpArtist.textContent = song.artist || 'Unknown';
    syncMnpMarquees();
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

window.initHeroCarousel = function() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (slides.length === 0) return;

  if (state.heroInterval) clearInterval(state.heroInterval);

  if (state.heroIndex === undefined || state.heroIndex >= slides.length) {
    state.heroIndex = 0;
  }

  function showSlide(idx) {
    state.heroIndex = idx;
    slides.forEach((slide, i) => {
      if (i === idx) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
    dots.forEach((dot, i) => {
      if (i === idx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  dots.forEach((dot, idx) => {
    dot.onclick = (e) => {
      e.stopPropagation();
      showSlide(idx);
      startInterval();
    };
  });

  function startInterval() {
    if (state.heroInterval) clearInterval(state.heroInterval);
    state.heroInterval = setInterval(() => {
      let nextIdx = (state.heroIndex + 1) % slides.length;
      showSlide(nextIdx);
    }, 20000);
  }

  showSlide(state.heroIndex);
  startInterval();
};

window.playHeroSong = function(songId) {
  const song = SONGS.find(s => s.id === songId);
  if (!song) return;

  state.queue = [song];
  state.currentIndex = 0;
  playSong(0);

  state.isFetchingRelated = true;
  if (typeof renderQueuePanel === 'function') renderQueuePanel();

  const addedIds = new Set([song.id]);
  const addedTitles = new Set();
  const norm = (t) => t ? t.toLowerCase().replace(/[^a-z0-9]/g, '').trim() : '';
  addedTitles.add(norm(song.title));

  let addedCount = 0;
  const TARGET = 20;

  try {
    const artistName = song.artist.split(',')[0].trim();
    const genre = song.language || song.genre || 'Hindi';
    const songTitle = song.title || '';

    Promise.allSettled([
      JIOSAAVN_API.searchSongs(artistName + ' songs', 15),
      JIOSAAVN_API.searchSongs(genre + ' ' + songTitle.split(' ')[0] + ' hits', 15),
    ]).then(results => {
      const artistSongs = (results[0].status === 'fulfilled' ? results[0].value : []);
      const genreSongs  = (results[1].status === 'fulfilled' ? results[1].value : []);

      let ai = 0, gi = 0;
      while (addedCount < TARGET && (ai < artistSongs.length || gi < genreSongs.length)) {
        for (let n = 0; n < 2 && ai < artistSongs.length && addedCount < TARGET; ai++) {
          const rs = artistSongs[ai];
          const rsNorm = norm(rs.title);
          if (rs.audioUrl && !addedIds.has(rs.id) && !addedTitles.has(rsNorm)) {
            addedIds.add(rs.id);
            addedTitles.add(rsNorm);
            if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
            state.queue.push(rs);
            addedCount++;
            n++;
          }
        }
        for (; gi < genreSongs.length && addedCount < TARGET; gi++) {
          const rs = genreSongs[gi];
          const rsNorm = norm(rs.title);
          if (rs.audioUrl && !addedIds.has(rs.id) && !addedTitles.has(rsNorm)) {
            addedIds.add(rs.id);
            addedTitles.add(rsNorm);
            if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
            state.queue.push(rs);
            addedCount++;
            break;
          }
        }
      }
      state.isFetchingRelated = false;
      if (typeof renderQueuePanel === 'function') renderQueuePanel();
    }).catch(() => {
      state.isFetchingRelated = false;
      if (typeof renderQueuePanel === 'function') renderQueuePanel();
    });
  } catch (err) {
    state.isFetchingRelated = false;
    if (typeof renderQueuePanel === 'function') renderQueuePanel();
  }
};
