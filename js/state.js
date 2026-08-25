'use strict';

let _spToastTimer = null;
let _spToastRemaining = 3500;
let _spToastStartTime = 0;

const TOAST_BADGES = {
  liked: {
    bg: 'linear-gradient(135deg, #450af5 0%, #8e8ee5 100%)',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
  },
  unliked: {
    bg: '#535353',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
  },
  playlist: {
    bg: '#282828',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#1ed760"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
  },
  queue: {
    bg: 'linear-gradient(135deg, #1ed760 0%, #00b4d8 100%)',
    html: '<svg viewBox="0 0 16 16" width="14" height="14" fill="white"><path d="M15 15H1v-1.5h14zm0-4.5H1V9h14zm-14-7A2.5 2.5 0 0 1 3.5 1h9a2.5 2.5 0 0 1 0 5h-9A2.5 2.5 0 0 1 1 3.5m2.5-1a1 1 0 0 0 0 2h9a1 1 0 1 0 0-2z"/></svg>'
  },
  success: {
    bg: '#1ed760',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="black"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
  },
  info: {
    bg: '#3b82f6',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
  },
  error: {
    bg: '#ef4444',
    html: '<svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>'
  }
};

window.showSpotifyToast = function(options) {
  if (!options) return;
  if (typeof options === 'string') {
    options = { title: options, type: 'info' };
  }

  const toastEl = document.getElementById('sp-bottom-toast');
  const badgeEl = document.getElementById('sp-toast-badge');
  const textEl = document.getElementById('sp-toast-text');
  const actionBtn = document.getElementById('sp-toast-action-btn');

  if (!toastEl || !textEl) return;

  if (_spToastTimer) {
    clearTimeout(_spToastTimer);
    _spToastTimer = null;
  }

  const type = options.type || 'info';
  const title = options.title || 'Notification';
  const actionText = options.actionText || '';
  const onAction = options.onAction || null;
  const duration = options.duration || 3500;
  const imgUrl = options.img || (options.song ? (options.song.thumb || options.song.img) : '');

  
  if (badgeEl) {
    if (imgUrl && type === 'playlist') {
      badgeEl.style.background = '#282828';
      badgeEl.innerHTML = `<img src="${imgUrl}" alt="Cover" onerror="this.remove()">`;
    } else {
      const badgeConfig = TOAST_BADGES[type] || TOAST_BADGES.info;
      badgeEl.style.background = badgeConfig.bg;
      badgeEl.innerHTML = badgeConfig.html;
    }
  }

  
  textEl.textContent = title;

  
  if (actionBtn) {
    if (actionText) {
      actionBtn.textContent = actionText;
      actionBtn.classList.remove('hidden');
      actionBtn.onclick = (e) => {
        e.stopPropagation();
        hideSpotifyToast();
        if (typeof onAction === 'function') {
          onAction();
        }
      };
    } else {
      actionBtn.classList.add('hidden');
      actionBtn.onclick = null;
    }
  }

  
  toastEl.classList.remove('sp-toast-visible');
  void toastEl.offsetWidth; 
  toastEl.classList.add('sp-toast-visible');

  
  _spToastRemaining = duration;
  _spToastStartTime = Date.now();

  const startDismissTimer = (ms) => {
    _spToastTimer = setTimeout(() => {
      hideSpotifyToast();
    }, ms);
  };

  startDismissTimer(_spToastRemaining);

  toastEl.onmouseenter = () => {
    if (_spToastTimer) {
      clearTimeout(_spToastTimer);
      _spToastTimer = null;
      _spToastRemaining -= (Date.now() - _spToastStartTime);
    }
  };

  toastEl.onmouseleave = () => {
    if (!_spToastTimer && toastEl.classList.contains('sp-toast-visible')) {
      _spToastStartTime = Date.now();
      startDismissTimer(Math.max(1000, _spToastRemaining));
    }
  };
};

window.hideSpotifyToast = function() {
  const toastEl = document.getElementById('sp-bottom-toast');
  if (toastEl) {
    toastEl.classList.remove('sp-toast-visible');
  }
  if (_spToastTimer) {
    clearTimeout(_spToastTimer);
    _spToastTimer = null;
  }
};

window.showToast = function(msg, type = 'info', duration = 3500, actionText = '', onAction = null) {
  let toastType = type;
  if (type === 'warn' || type === 'warning') toastType = 'error';
  window.showSpotifyToast({
    title: msg,
    type: toastType,
    duration: duration,
    actionText: actionText,
    onAction: onAction
  });
};

let deferredPwaPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
});

window.installPwaApp = function() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the PWA install prompt');
      }
      deferredPwaPrompt = null;
    });
  } else {
    const link = document.createElement('a');
    link.href = 'manifest.json';
    link.download = 'wave-music.webmanifest';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (typeof showToast === 'function') {
      showToast('Installing Wave Web App...', 'info');
    }
  }
};

const SONGS = [];

const FALLBACK_ARTIST_AVATARS = [
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500',
  'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=500',
  'https://images.unsplash.com/photo-1520523839898-5071282543e1?w=500',
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500',
  'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500',
  'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?w=500',
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500',
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=500',
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500',
  'https://images.unsplash.com/photo-1445985543469-433ec45754ac?w=500',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500',
  'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500'
];

const FALLBACK_SONG_COVERS = [
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500',
  'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=500',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500',
  'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500'
];

function _hashStr(str) {
  let hash = 0;
  const s = String(str || 'wave');
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

window.getArtistFallbackImage = function(nameOrId, width = 500) {
  if (!nameOrId) return 'https://i.scdn.co/image/ab67616100005174adfb0b2df04b77e43b5f7375';
  const clean = String(nameOrId).replace(/^artist-/, '').replace(/-/g, ' ').trim().toLowerCase();

  
  if (typeof ARTISTS !== 'undefined' && Array.isArray(ARTISTS)) {
    const match = ARTISTS.find(a => 
      a.name.toLowerCase() === clean || 
      a.id.toLowerCase() === clean || 
      clean.includes(a.name.toLowerCase()) || 
      a.name.toLowerCase().includes(clean)
    );
    if (match && match.img && !match.img.includes('placeholder')) {
      return match.img;
    }
  }

  
  if (typeof SONGS !== 'undefined' && Array.isArray(SONGS)) {
    const sMatch = SONGS.find(s => {
      const art = (s.artist || '').toLowerCase();
      return art.includes(clean) || clean.includes(art);
    });
    if (sMatch && (sMatch.img || sMatch.thumb)) {
      return sMatch.img || sMatch.thumb;
    }
  }

  
  const SPOTIFY_FALLBACK_AVATARS = [
    'https://i.scdn.co/image/ab67616100005174adfb0b2df04b77e43b5f7375', 
    'https://i.scdn.co/image/ab6761610000e5ebe7ce89a9f5d11e0ba26677eb', 
    'https://i.scdn.co/image/ab6761610000e5ebd7435f3dfef06d7ff3e390c5', 
    'https://i.scdn.co/image/ab6761610000e5ebfc043bea91ac91c222d235c9', 
    'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcd2773c21a', 
    'https://i.scdn.co/image/ab6761610000e5ebad6b1b4bc3cc08e561a7a402', 
    'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb', 
    'https://i.scdn.co/image/ab6761610000e5ebc40600e02356cc86f0debe84', 
    'https://i.scdn.co/image/ab6761610000e5eb9818816f1947b0a79ec3fb12', 
    'https://i.scdn.co/image/ab6761610000e5eb5b0e6b541315579730e2f9d5'  
  ];
  const idx = _hashStr(clean) % SPOTIFY_FALLBACK_AVATARS.length;
  return SPOTIFY_FALLBACK_AVATARS[idx];
};

window.getSongFallbackImage = function(titleOrId, width = 500) {
  const idx = _hashStr(titleOrId) % FALLBACK_SONG_COVERS.length;
  const base = FALLBACK_SONG_COVERS[idx];
  return base.replace(/\?w=\d+/, `?w=${width}`);
};

const ARTISTS = [
  
  {
    id: 'arijit-singh',
    name: 'Arijit Singh',
    img: 'https://i.scdn.co/image/ab67616100005174adfb0b2df04b77e43b5f7375',
    listeners: '38,451,920',
    sub: '38.4M listeners'
  },
  {
    id: 'shreya-ghoshal',
    name: 'Shreya Ghoshal',
    img: 'https://i.scdn.co/image/ab6761610000e5ebe7ce89a9f5d11e0ba26677eb',
    listeners: '18,230,140',
    sub: '18.2M listeners'
  },
  {
    id: 'atif-aslam',
    name: 'Atif Aslam',
    img: 'https://i.scdn.co/image/ab6761610000e5ebc40600e02356cc86f0debe84',
    listeners: '15,842,910',
    sub: '15.8M listeners'
  },
  {
    id: 'neha-kakkar',
    name: 'Neha Kakkar',
    img: 'https://i.scdn.co/image/ab6761610000e5eb2c3c6dc56635014fa90b32a6',
    listeners: '22,510,870',
    sub: '22.5M listeners'
  },
  {
    id: 'diljit-dosanjh',
    name: 'Diljit Dosanjh',
    img: 'https://i.scdn.co/image/ab6761610000e5ebfc043bea91ac91c222d235c9',
    listeners: '14,350,210',
    sub: '14.3M listeners'
  },
  {
    id: 'armaan-malik',
    name: 'Armaan Malik',
    img: 'https://i.scdn.co/image/ab6775700000ee859f64fac1dc2ff52346bfe4af',
    listeners: '11,890,520',
    sub: '11.8M listeners'
  },
  {
    id: 'jubin-nautiyal',
    name: 'Jubin Nautiyal',
    img: 'https://i.scdn.co/image/ab6761610000e5eb9818816f1947b0a79ec3fb12',
    listeners: '19,540,110',
    sub: '19.5M listeners'
  },
  {
    id: 'badshah',
    name: 'Badshah',
    img: 'https://i.scdn.co/image/ab6761610000e5eb0db6384218eb808c10be1947',
    listeners: '17,210,400',
    sub: '17.2M listeners'
  },
  {
    id: 'sonu-nigam',
    name: 'Sonu Nigam',
    img: 'https://i.scdn.co/image/ab6761610000e5ebdf9f864cf4499d3d373f7893',
    listeners: '13,910,230',
    sub: '13.9M listeners'
  },
  {
    id: 'rahat-fateh-ali-khan',
    name: 'Rahat Fateh Ali Khan',
    img: 'https://i.scdn.co/image/ab6761610000e5eb1d67e651e247470fcf14ef97',
    listeners: '12,140,890',
    sub: '12.1M listeners'
  },
  {
    id: 'sidhu-moose-wala',
    name: 'Sidhu Moose Wala',
    img: 'https://i.scdn.co/image/ab6761610000e5eb2e3a1f9e2b10ab464731b74c',
    listeners: '16,420,100',
    sub: '16.4M listeners'
  },
  {
    id: 'karan-aujla',
    name: 'Karan Aujla',
    img: 'https://i.scdn.co/image/ab6761610000e5eb3b76cf66ee2b3e4307f59d57',
    listeners: '15,240,780',
    sub: '15.2M listeners'
  },
  {
    id: 'ap-dhillon',
    name: 'AP Dhillon',
    img: 'https://i.scdn.co/image/ab6761610000e5eb662c16f29df2182283e3cebb',
    listeners: '10,810,450',
    sub: '10.8M listeners'
  },
  {
    id: 'yo-yo-honey-singh',
    name: 'Yo Yo Honey Singh',
    img: 'https://i.scdn.co/image/ab6761610000e5ebb6b939fb15ebf26284f67c30',
    listeners: '14,720,150',
    sub: '14.7M listeners'
  },
  {
    id: 'pritam',
    name: 'Pritam',
    img: 'https://i.scdn.co/image/ab6761610000e5ebcb6926f44f620555ba444fca',
    listeners: '26,350,900',
    sub: '26.3M listeners'
  },
  {
    id: 'a-r-rahman',
    name: 'A.R. Rahman',
    img: 'https://i.scdn.co/image/ab6761610000e5ebb193e50330adff45a33118cf',
    listeners: '28,140,300',
    sub: '28.1M listeners'
  },
  
  {
    id: 'alan-walker',
    name: 'Alan Walker',
    img: 'https://i.scdn.co/image/ab6761610000e5ebd7435f3dfef06d7ff3e390c5',
    listeners: '34,210,000',
    sub: '34.2M listeners'
  },
  {
    id: 'avicii',
    name: 'Avicii',
    img: 'https://i.scdn.co/image/ab6761610000e5eb0ea93540eb61a525d80482ab',
    listeners: '29,850,000',
    sub: '29.8M listeners'
  },
  {
    id: 'taylor-swift',
    name: 'Taylor Swift',
    img: 'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcd2773c21a',
    listeners: '98,420,000',
    sub: '98.4M listeners'
  },
  {
    id: 'the-weeknd',
    name: 'The Weeknd',
    img: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb',
    listeners: '108,240,000',
    sub: '108.2M listeners'
  },
  {
    id: 'justin-bieber',
    name: 'Justin Bieber',
    img: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36',
    listeners: '75,630,000',
    sub: '75.6M listeners'
  },
  {
    id: 'ed-sheeran',
    name: 'Ed Sheeran',
    img: 'https://i.scdn.co/image/ab6761610000e5eb5a0c3fbb361421f1d1e46fb7',
    listeners: '81,320,000',
    sub: '81.3M listeners'
  },
  {
    id: 'billie-eilish',
    name: 'Billie Eilish',
    img: 'https://i.scdn.co/image/ab6761610000e5ebd8b9980db67272cb4d4c3ad0',
    listeners: '84,100,000',
    sub: '84.1M listeners'
  },
  {
    id: 'dua-lipa',
    name: 'Dua Lipa',
    img: 'https://i.scdn.co/image/ab6761610000e5ebec66be62f0269f88c83e1c66',
    listeners: '68,910,000',
    sub: '68.9M listeners'
  },
  {
    id: 'ariana-grande',
    name: 'Ariana Grande',
    img: 'https://i.scdn.co/image/ab6761610000e5ebcdce7620dc940db0718b81dd',
    listeners: '82,540,000',
    sub: '82.5M listeners'
  },
  {
    id: 'warriyo',
    name: 'Warriyo',
    img: 'https://i.scdn.co/image/ab67616d0000b27375d244478eb566d756fba584',
    listeners: '2,450,000',
    sub: '2.4M listeners'
  },
  {
    id: 'sofiloud',
    name: 'Sofiloud',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6qyWJ3uKJKsBiMEyN5SgbKuty-FvO4FmZ_g&s',
    listeners: '1,820,000',
    sub: '1.8M listeners'
  },
  
  {
    id: 'twice',
    name: 'TWICE',
    img: 'https://i.scdn.co/image/ab6761610000e5ebad6b1b4bc3cc08e561a7a402',
    listeners: '14,520,000',
    sub: '14.5M listeners'
  },
  {
    id: 'bts',
    name: 'BTS',
    img: 'https://i.scdn.co/image/ab6761610000e5eb5b0e6b541315579730e2f9d5',
    listeners: '32,140,000',
    sub: '32.1M listeners'
  },
  {
    id: 'blackpink',
    name: 'BLACKPINK',
    img: 'https://i.scdn.co/image/ab6761610000e5eb4770d10b7596a256ee656461',
    listeners: '21,430,000',
    sub: '21.4M listeners'
  },
  {
    id: 'melomance',
    name: 'MeloMance',
    img: 'https://i.scdn.co/image/ab6761610000e5ebb699f07dbb3400a40d5e1ba0',
    listeners: '3,210,000',
    sub: '3.2M listeners'
  },
  {
    id: 'marcelo-zarvos',
    name: 'Marcelo Zarvos',
    img: 'https://i.scdn.co/image/ab6761610000e5eb798dcbf751ecffab77a8df62',
    listeners: '1,420,000',
    sub: '1.4M listeners'
  },
  {
    id: 'saja-boys',
    name: 'Saja Boys',
    img: 'https://i.scdn.co/image/ab67616d0000b2735a90ee35c1a3537005905820',
    listeners: '4,150,000',
    sub: '4.1M listeners'
  },
  {
    id: 'huntr-x',
    name: 'HUNTR/X',
    img: 'https://i.scdn.co/image/ab67616d0000b2734dcb6c5df15cf74596ab25a4',
    listeners: '3,920,000',
    sub: '3.9M listeners'
  },
  {
    id: 'kpop-demon-hunters-cast',
    name: 'KPop Demon Hunters Cast',
    img: 'https://i.scdn.co/image/ab67616d0000e1a34dcb6c5df15cf74596ab25a4',
    listeners: '6,840,000',
    sub: '6.8M listeners'
  },
  {
    id: 'ejae',
    name: 'EJAE',
    img: 'https://i.scdn.co/image/ab67616d0000b2734dcb6c5df15cf74596ab25a4',
    listeners: '2,150,000',
    sub: '2.1M listeners'
  },
  {
    id: 'audrey-nuna',
    name: 'AUDREY NUNA',
    img: 'https://i.scdn.co/image/ab6761610000e5eb98bb126f58a3624e525a745a',
    listeners: '3,450,000',
    sub: '3.4M listeners'
  },
  {
    id: 'rei-ami',
    name: 'REI AMI',
    img: 'https://i.scdn.co/image/ab6761610000e5ebfe3e670498b3c37353f08cbe',
    listeners: '1,980,000',
    sub: '1.9M listeners'
  },
  {
    id: 'kevin-woo',
    name: 'KEVIN WOO',
    img: 'https://i.scdn.co/image/ab6761610000e5eb7f7b30960eaef9db5c8ec237',
    listeners: '1,250,000',
    sub: '1.2M listeners'
  }
];

const RESOLVED_ARTISTS_CACHE = new Map();
const FOLLOWED_ARTISTS_DATA = new Map();

function _loadPersistedFollowedArtists() {
  try {
    const savedFAD = JSON.parse(localStorage.getItem('wave_followed_artists_data') || '{}');
    Object.keys(savedFAD).forEach(id => {
      if (savedFAD[id] && savedFAD[id].name) {
        FOLLOWED_ARTISTS_DATA.set(id, savedFAD[id]);
        FOLLOWED_ARTISTS_DATA.set(id.toLowerCase(), savedFAD[id]);
        FOLLOWED_ARTISTS_DATA.set(savedFAD[id].name.toLowerCase(), savedFAD[id]);
      }
    });
  } catch (e) {}
}
_loadPersistedFollowedArtists();

window.saveFollowedArtistData = function(artistId, data) {
  if (!artistId || !data) return;
  const idStr = String(artistId).trim();
  const artName = String(data.name || idStr).trim();
  
  FOLLOWED_ARTISTS_DATA.set(idStr, data);
  FOLLOWED_ARTISTS_DATA.set(idStr.toLowerCase(), data);
  FOLLOWED_ARTISTS_DATA.set(artName, data);
  FOLLOWED_ARTISTS_DATA.set(artName.toLowerCase(), data);

  
  try {
    const obj = {};
    FOLLOWED_ARTISTS_DATA.forEach((v, k) => { 
      if (k && !k.startsWith('artist-') && k === v.name) {
        obj[k] = v; 
      }
    });
    localStorage.setItem('wave_followed_artists_data', JSON.stringify(obj));
  } catch (e) {}
};

window.getFollowedArtistData = function(artistId) {
  if (!artistId) return null;
  const idStr = String(artistId).trim();
  const cleanName = idStr.replace(/^artist-/, '').replace(/-/g, ' ').trim();
  
  
  const fromArr = ARTISTS.find(a => 
    a.id === idStr || 
    a.id.toLowerCase() === idStr.toLowerCase() || 
    a.name.toLowerCase() === idStr.toLowerCase() || 
    a.name.toLowerCase() === cleanName.toLowerCase()
  );
  if (fromArr && fromArr.img && !fromArr.img.includes('placeholder')) return fromArr;

  
  const fromCache = RESOLVED_ARTISTS_CACHE.get(idStr.toLowerCase()) || RESOLVED_ARTISTS_CACHE.get(cleanName.toLowerCase());
  if (fromCache && fromCache.img && !fromCache.img.includes('unsplash') && !fromCache.img.includes('placeholder')) {
    return fromCache;
  }

  
  let fromFollowed = FOLLOWED_ARTISTS_DATA.get(idStr) || 
                     FOLLOWED_ARTISTS_DATA.get(cleanName) || 
                     FOLLOWED_ARTISTS_DATA.get(idStr.toLowerCase()) || 
                     FOLLOWED_ARTISTS_DATA.get(cleanName.toLowerCase());
  if (fromFollowed && fromFollowed.img && !fromFollowed.img.includes('unsplash')) {
    return fromFollowed;
  }

  
  if (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getArtistData) {
    SPOTIFY_API.getArtistData(cleanName).then(spData => {
      if (spData && spData.img) {
        const updated = {
          id: cleanName,
          name: cleanName,
          img: spData.img,
          listeners: spData.followers || '1,500,000',
          sub: 'Artist'
        };
        saveFollowedArtistData(cleanName, updated);
        RESOLVED_ARTISTS_CACHE.set(cleanName.toLowerCase(), updated);
        if (typeof renderSidebarLibrary === 'function') renderSidebarLibrary();
      }
    }).catch(() => {});
  }

  
  return { 
    id: cleanName, 
    name: cleanName, 
    img: (fromFollowed && fromFollowed.img) || window.getArtistFallbackImage(cleanName, 300), 
    listeners: '1,500,000',
    sub: 'Artist'
  };
};

window.isArtistFollowed = function(artistId) {
  if (!artistId || !state.followedArtists) return false;
  const idStr = String(artistId).trim().toLowerCase();
  const cleanName = idStr.replace(/^artist-/, '').replace(/-/g, ' ').trim();
  return state.followedArtists.some(a => {
    const aLower = String(a).toLowerCase();
    return aLower === idStr || aLower === cleanName || `artist-${aLower.replace(/[^a-z0-9]+/g, '-')}` === idStr;
  });
};

window.toggleFollow = function(artistId, artistData) {
  if (!artistId) return;
  const rawId = String(artistId).trim();
  const cleanName = (artistData?.name || rawId).replace(/^artist-/, '').replace(/-/g, ' ').trim();
  
  const idx = state.followedArtists.findIndex(a => {
    const aLower = String(a).toLowerCase();
    return aLower === rawId.toLowerCase() || 
           aLower === cleanName.toLowerCase() ||
           `artist-${aLower.replace(/[^a-z0-9]+/g, '-')}` === rawId.toLowerCase();
  });

  let isNowFollowed = false;

  if (idx > -1) {
    
    const existing = state.followedArtists[idx];
    state.followedArtists.splice(idx, 1);
    FOLLOWED_ARTISTS_DATA.delete(existing);
    FOLLOWED_ARTISTS_DATA.delete(existing.toLowerCase());
    FOLLOWED_ARTISTS_DATA.delete(cleanName);
    FOLLOWED_ARTISTS_DATA.delete(cleanName.toLowerCase());
    FOLLOWED_ARTISTS_DATA.delete(rawId);
    FOLLOWED_ARTISTS_DATA.delete(rawId.toLowerCase());
    isNowFollowed = false;
    if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(`Unfollowed ${cleanName}`, 'info', 2000);
    }
  } else {
    
    state.followedArtists.push(cleanName);
    isNowFollowed = true;

    
    const fromArr = ARTISTS.find(a => 
      a.id.toLowerCase() === cleanName.toLowerCase() || 
      a.name.toLowerCase() === cleanName.toLowerCase()
    );
    const fromCache = RESOLVED_ARTISTS_CACHE.get(cleanName.toLowerCase()) || RESOLVED_ARTISTS_CACHE.get(rawId.toLowerCase());

    let artImg = '';
    if (fromArr && fromArr.img && !fromArr.img.includes('placeholder')) {
      artImg = fromArr.img;
    } else if (fromCache && fromCache.img && !fromCache.img.includes('unsplash') && !fromCache.img.includes('placeholder')) {
      artImg = fromCache.img;
    } else if (artistData && artistData.img && !artistData.isSongCover && !artistData.img.includes('placeholder') && !artistData.img.includes('unsplash')) {
      artImg = artistData.img;
    }

    const artObj = {
      id: cleanName,
      name: cleanName,
      img: artImg || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300',
      listeners: (fromArr && fromArr.listeners) || (fromCache && fromCache.listeners) || artistData?.listeners || '1,500,000',
      sub: 'Artist'
    };

    saveFollowedArtistData(cleanName, artObj);
    saveFollowedArtistData(rawId, artObj);

    
    if (!artImg || artImg.includes('unsplash') || artImg.includes('placehold')) {
      if (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getArtistData) {
        SPOTIFY_API.getArtistData(cleanName).then(spData => {
          if (spData && spData.img) {
            artObj.img = spData.img;
            if (spData.followers) artObj.listeners = spData.followers;
            saveFollowedArtistData(cleanName, artObj);
            saveFollowedArtistData(rawId, artObj);
            RESOLVED_ARTISTS_CACHE.set(cleanName.toLowerCase(), artObj);
            if (typeof renderSidebarLibrary === 'function') renderSidebarLibrary();
          }
        }).catch(() => {});
      }
    }

    if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(`Following ${cleanName} — Added to Library`, 'success', 2500);
    }
  }

  
  saveUserState();
  if (typeof renderSidebarLibrary === 'function') renderSidebarLibrary();
  try {
    const obj = {};
    FOLLOWED_ARTISTS_DATA.forEach((v, k) => {
      if (k && !k.startsWith('artist-') && k === v.name) {
        obj[k] = v;
      }
    });
    localStorage.setItem('wave_followed_artists_data', JSON.stringify(obj));
  } catch (e) {}

  
  const btns = document.querySelectorAll(`[data-follow-id]`);
  btns.forEach(btn => {
    const btnId = (btn.getAttribute('data-follow-id') || '').trim();
    if (btnId && (btnId.toLowerCase() === rawId.toLowerCase() || btnId.toLowerCase() === cleanName.toLowerCase())) {
      btn.textContent = isNowFollowed ? 'Following' : 'Follow';
      btn.classList.toggle('following', isNowFollowed);
    }
  });

  const mainFollowBtn = document.querySelector('.sp-artist-follow-btn-main');
  if (mainFollowBtn) {
    mainFollowBtn.textContent = isNowFollowed ? 'Following' : 'Follow';
    mainFollowBtn.classList.toggle('following', isNowFollowed);
  }

  
  if (typeof renderSidebarLibrary === 'function') {
    renderSidebarLibrary();
  }

  
  if (state.currentView === 'library') {
    const container = document.getElementById('view-container') || document.querySelector('.main-content');
    if (container && typeof getLibraryHTML === 'function') {
      container.innerHTML = getLibraryHTML();
    }
  } else if (state.currentView === 'profile') {
    const container = document.getElementById('view-container') || document.querySelector('.main-content');
    if (container && typeof getProfilePageHTML === 'function') {
      container.innerHTML = getProfilePageHTML();
    }
  }
};

window.openArtistPage = function(artist, event) {
  if (event && event.stopPropagation) event.stopPropagation();
  if (!artist) return;

  let targetName = '';
  let targetId = '';
  let targetImg = '';

  if (typeof artist === 'string') {
    targetName = artist.replace(/^artist-/, '').replace(/-/g, ' ').trim();
    targetId = artist;
  } else if (typeof artist === 'object' && artist) {
    targetName = artist.name || artist.title || String(artist.id || '');
    targetId = artist.id || targetName;
    targetImg = artist.img || artist.image || '';
  }

  if (!targetName) targetName = 'Artist';

  const cleanName = targetName.replace(/^artist-/, '').replace(/-/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());

  
  let resolvedImg = targetImg;
  if (!resolvedImg) {
    const fromArr = (typeof ARTISTS !== 'undefined' && Array.isArray(ARTISTS)) 
      ? ARTISTS.find(a => a.name.toLowerCase() === cleanName.toLowerCase() || a.id.toLowerCase() === cleanName.toLowerCase() || a.name.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(a.name.toLowerCase()))
      : null;
    if (fromArr && fromArr.img) {
      resolvedImg = fromArr.img;
    }
  }
  if (!resolvedImg && typeof SONGS !== 'undefined' && Array.isArray(SONGS)) {
    const fromSong = SONGS.find(s => {
      const art = (s.artist || '').toLowerCase();
      return art.includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(art);
    });
    if (fromSong && (fromSong.img || fromSong.thumb)) {
      resolvedImg = fromSong.img || fromSong.thumb;
    }
  }

  const artObj = {
    id: targetId || cleanName,
    name: cleanName,
    img: resolvedImg || (typeof window.getArtistFallbackImage === 'function' ? window.getArtistFallbackImage(cleanName, 300) : '')
  };

  RESOLVED_ARTISTS_CACHE.set(cleanName.toLowerCase(), artObj);
  if (targetId) RESOLVED_ARTISTS_CACHE.set(String(targetId).toLowerCase(), artObj);

  if (typeof saveRecentSearch === 'function') {
    saveRecentSearch({
      title: cleanName,
      subtitle: 'Artist',
      img: resolvedImg || '',
      type: 'Artist',
      artistId: cleanName,
      artistName: cleanName
    });
  }

  navigateTo('artist', event, cleanName);
};

function findArtistById(artistId) {
  if (!artistId) return { id: 'artist-unknown', name: 'Artist', img: (typeof window.getArtistFallbackImage === 'function') ? window.getArtistFallbackImage('unknown', 300) : '', listeners: '1,450,000' };

  const idStr = String(artistId).toLowerCase().trim();

  if (RESOLVED_ARTISTS_CACHE.has(idStr)) {
    return RESOLVED_ARTISTS_CACHE.get(idStr);
  }

  let artist = ARTISTS.find(a => 
    String(a.id).toLowerCase() === idStr || 
    String(a.name).toLowerCase() === idStr ||
    a.name.toLowerCase().includes(idStr) ||
    idStr.includes(a.name.toLowerCase())
  );
  if (artist) return { ...artist };

  
  try {
    const recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
    const found = recents.find(r => r.type === 'Artist' && (
      String(r.artistId).toLowerCase() === idStr ||
      String(r.title).toLowerCase() === idStr ||
      String(r.artistName).toLowerCase() === idStr
    ));
    if (found && (found.title || found.artistName)) {
      const artName = found.artistName || found.title;
      const artObj = {
        id: found.artistId || artName,
        name: artName,
        img: found.img || window.getArtistFallbackImage(artName, 300),
        listeners: '1,450,000'
      };
      RESOLVED_ARTISTS_CACHE.set(idStr, artObj);
      RESOLVED_ARTISTS_CACHE.set(artName.toLowerCase(), artObj);
      return artObj;
    }
  } catch (e) {}

  for (const song of state.recentSongs) {
    const primaryName = song.artist.split(',')[0].trim();
    const slug = primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (`artist-${slug}` === artistId || primaryName.toLowerCase() === String(artistId).toLowerCase()) {
      return {
        id: artistId,
        name: primaryName,
        img: song.thumb || window.getArtistFallbackImage(primaryName, 300),
        listeners: '1,250,000',
        sub: 'Recent Artist'
      };
    }
  }

  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  for (const song of likedSongs) {
    const primaryName = song.artist.split(',')[0].trim();
    const slug = primaryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (`artist-${slug}` === artistId || primaryName.toLowerCase() === String(artistId).toLowerCase()) {
      return {
        id: artistId,
        name: primaryName,
        img: song.thumb || window.getArtistFallbackImage(primaryName, 300),
        listeners: '1,100,000',
        sub: 'Recent Artist'
      };
    }
  }

  for (const song of SONGS) {
    if (!song || !song.artist) continue;
    const parts = song.artist.split(/,|&|\bfeat\.?|\bft\.?/i).map(p => p.trim()).filter(Boolean);
    const matchedPart = parts.find(p => p.toLowerCase() === idStr || `artist-${p.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` === idStr);
    if (matchedPart) {
      return {
        id: artistId,
        name: matchedPart,
        img: song.thumb || song.img || window.getArtistFallbackImage(matchedPart, 300),
        listeners: '1,200,000',
        sub: 'Artist'
      };
    }
  }

  if (artistId && typeof artistId === 'string' && artistId.startsWith('artist-')) {
    const nameSlug = artistId.replace('artist-', '');
    const name = nameSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      id: artistId,
      name: name,
      img: window.getArtistFallbackImage(name, 300),
      listeners: '1,000,000',
      sub: 'Artist'
    };
  }

  const isNumeric = /^\d+$/.test(String(artistId));
  const formattedName = isNumeric
    ? 'Artist'
    : String(artistId).replace(/[^a-zA-Z0-9\s]/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase());

  return {
    id: artistId,
    name: formattedName || 'Artist',
    img: window.getArtistFallbackImage(formattedName || artistId, 300),
    listeners: '1,450,000',
    sub: 'Artist'
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
  heroInterval: null,
  mnpMode: 'song'
};

let audio;
let searchTimeout;
let savedJioSaavnSongs = [];
let _saveUserStateTimer = null;

function saveUserState() {
  if (_saveUserStateTimer) clearTimeout(_saveUserStateTimer);
  _saveUserStateTimer = setTimeout(() => {
    _performSaveUserState();
  }, 200);
}

async function _performSaveUserState() {
  try {
    const today = new Date().toISOString().split('T')[0];

    
    if (typeof WaveDB !== 'undefined' && WaveDB.setUserData) {
      WaveDB.setUserData('likedSongs', state.likedSongs || []).catch(() => {});
      WaveDB.setUserData('userPlaylists', state.userPlaylists || []).catch(() => {});
      WaveDB.setUserData('followedArtists', state.followedArtists || []).catch(() => {});
      WaveDB.setUserData('recentSongs', (state.recentSongs || []).slice(0, 100)).catch(() => {});
      WaveDB.setUserData('recentDate', today).catch(() => {});

      if (state.queue && state.queue.length > 0) {
        const curTime = (audio && audio.currentTime > 0) ? audio.currentTime : 0;
        WaveDB.setUserData('sessionState', {
          queue: state.queue.slice(0, 50),
          index: state.currentIndex || 0,
          progress: curTime
        }).catch(() => {});
      }
    }

    
    localStorage.setItem('wave_liked_songs', JSON.stringify(state.likedSongs || []));
    localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists || []));
    localStorage.setItem('wave_followed_artists', JSON.stringify(state.followedArtists || []));
  } catch (err) {
    console.warn('[Wave Music] State save warning:', err);
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

    if (!song.duration || song.duration === 'undefined' || song.duration === 'null') {
      const hash = String(song.id || song.title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const mins = 3 + (hash % 2);
      const secs = String((hash * 7) % 60).padStart(2, '0');
      song.duration = `${mins}:${secs}`;
    }
  }
  return song;
}

async function loadUserState() {
  const today = new Date().toISOString().split('T')[0];
  try {
    
    if (typeof WaveDB !== 'undefined' && WaveDB.getUserData) {
      const dbLiked = await WaveDB.getUserData('likedSongs', null);
      if (Array.isArray(dbLiked)) state.likedSongs = dbLiked;

      const dbPlaylists = await WaveDB.getUserData('userPlaylists', null);
      if (Array.isArray(dbPlaylists)) state.userPlaylists = dbPlaylists;

      const dbArtists = await WaveDB.getUserData('followedArtists', null);
      if (Array.isArray(dbArtists)) state.followedArtists = dbArtists;

      const dbDate = await WaveDB.getUserData('recentDate', null);
      if (dbDate === today) {
        const dbRecents = await WaveDB.getUserData('recentSongs', []);
        if (Array.isArray(dbRecents)) {
          state.recentSongs = dbRecents;
          state.recentSongs.forEach(normalizeSongFields);
        }
      }

      const dbSession = await WaveDB.getUserData('sessionState', null);
      if (dbSession && Array.isArray(dbSession.queue) && dbSession.queue.length > 0) {
        state.queue = dbSession.queue;
        state.queue.forEach(normalizeSongFields);
        state.currentIndex = dbSession.index || 0;
        state._resumeProgress = dbSession.progress || 0;
        dbSession.queue.forEach(s => {
          if (s && s.id && !SONGS.find(x => x.id === s.id)) SONGS.push(s);
        });
      }

      
      if (WaveDB.getAllSongs) {
        const cachedSongs = await WaveDB.getAllSongs();
        if (Array.isArray(cachedSongs) && cachedSongs.length > 0) {
          cachedSongs.forEach(s => {
            if (s && s.id && !SONGS.find(x => x.id === s.id)) {
              normalizeSongFields(s);
              SONGS.push(s);
            }
          });
        }
      }
    }

    
    if (!state.likedSongs || state.likedSongs.length === 0) {
      state.likedSongs = JSON.parse(localStorage.getItem('wave_liked_songs') || '[]');
    }
    if (!state.userPlaylists || state.userPlaylists.length === 0) {
      state.userPlaylists = JSON.parse(localStorage.getItem('wave_user_playlists') || '[]');
    }
    if (!state.followedArtists || state.followedArtists.length === 0) {
      state.followedArtists = JSON.parse(localStorage.getItem('wave_followed_artists') || '[]');
    }
  } catch (err) {
    console.warn('[Wave Music] Failed to load previous state:', err);
  }
}

function cacheJioSaavnSong(song) {
  if (!song || !song.id) return;
  
  if (typeof WaveDB !== 'undefined' && WaveDB.saveSong) {
    WaveDB.saveSong(song).catch(() => {});
  }
}

let cloudData = { songs: [], artists: [], notifications: [] };

function getSeenNotifIds() {
  try { return JSON.parse(localStorage.getItem('wave_seen_notifs') || '[]'); } catch { return []; }
}

function saveSeenNotifIds(ids) {
  localStorage.setItem('wave_seen_notifs', JSON.stringify(ids));
}

window.toggleProfileDropdown = function(e) {
  if (e) e.stopPropagation();
  const dd = document.getElementById('profile-dropdown');
  if (!dd) return;
  const isHidden = dd.classList.contains('hidden');
  
  const notifDd = document.getElementById('notif-dropdown');
  if (notifDd) notifDd.classList.add('hidden');

  dd.classList.toggle('hidden');

    if (isHidden) {
      setTimeout(() => {
        document.addEventListener('click', function _closeProfileDd(evt) {
          const pic = document.getElementById('profile-pic');
          if (!dd.contains(evt.target) && (!pic || !pic.contains(evt.target))) {
            dd.classList.add('hidden');
            document.removeEventListener('click', _closeProfileDd);
          }
        });
      }, 10);
    }
  };

  window.markAllNotificationsAsRead = function() {
  const notifs = (cloudData && cloudData.notifications) ? cloudData.notifications : [];
  if (notifs.length > 0) {
    const allIds = notifs.map(n => n.id);
    saveSeenNotifIds(allIds);
  } else {
    saveSeenNotifIds(['all_seen']);
  }
  const badgeEl = document.getElementById('notif-badge');
  if (badgeEl) {
    badgeEl.textContent = '';
    badgeEl.classList.add('hidden');
  }
};

window.toggleNotifications = function(event) {
  if (event) event.stopPropagation();
  const notifDropdown = document.getElementById('notif-dropdown');
  if (notifDropdown) notifDropdown.classList.add('hidden');
  const profileDropdown = document.getElementById('profile-dropdown');
  if (profileDropdown) profileDropdown.classList.add('hidden');

  if (typeof markAllNotificationsAsRead === 'function') {
    markAllNotificationsAsRead();
  }
  navigateTo('notifications');
};

window.clearNotifications = function() {
  const notifs = (cloudData && cloudData.notifications) ? cloudData.notifications : [];
  const allIds = notifs.map(n => n.id);
  saveSeenNotifIds(allIds);
  renderCloudNotifications();
};

function renderCloudNotifications() {
  const listEl = document.getElementById('notif-list');
  const badgeEl = document.getElementById('notif-badge');

  const notifs = (cloudData && cloudData.notifications) ? cloudData.notifications : [];
  const seenIds = getSeenNotifIds();
  const activeNotifs = notifs.filter(n => !seenIds.includes(n.id));

  if (badgeEl) {
    badgeEl.textContent = ''; 
    if (activeNotifs.length > 0) {
      badgeEl.classList.remove('hidden');
    } else {
      badgeEl.classList.add('hidden');
    }
  }

  if (!listEl) return;

  if (!notifs || notifs.length === 0) {
    listEl.innerHTML = '<div class="notif-empty" style="padding:16px; text-align:center; color:var(--text-muted); font-size:13px;">No notifications found</div>';
    return;
  }

  listEl.innerHTML = notifs.map((n, i) => {
    const isUnread = !seenIds.includes(n.id);
    const thumbImg = n.thumb || 'https://placehold.co/100x100/1f1f1f/1ed760?text=♪';
    const subText = n.message || n.artist || n.album || '';
    const clickHandler = n.songId ? `playSpecificSong('${n.songId}'); event.stopPropagation();` : (n.message ? `alert('${(n.title||'').replace(/'/g, "\\'")}: ${(n.message||'').replace(/'/g, "\\'")}'); event.stopPropagation();` : '');

    return `
      <div class="sp-notif-card ${isUnread ? 'unread' : ''}" onclick="${clickHandler}" style="display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:8px; cursor:pointer; background: ${isUnread ? 'rgba(30, 215, 96, 0.08)' : 'transparent'}; margin-bottom:6px; transition:background 0.2s;">
        <img src="${thumbImg}" alt="${n.title}" style="width:40px; height:40px; border-radius:6px; object-fit:cover; flex-shrink:0;">
        <div style="flex:1; overflow:hidden;">
          <div style="font-size:13px; font-weight:700; color:white; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.title}</div>
          <div style="font-size:11px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${subText}</div>
        </div>
        ${isUnread ? '<span style="width:8px; height:8px; border-radius:50%; background:#1ed760; flex-shrink:0;"></span>' : ''}
      </div>
    `;
  }).join('');
}

window.loadCloudData = async function loadCloudData() {
  try {
    const jsonFiles = [
      'data/top-10-english.json',
      'data/top-10-naat.json',
      'data/top-10-hindi.json',
      'data/english-songs.json',
      'data/naat-songs.json',
      'data/korean-songs.json',
      'data/anime-songs.json',
      'data/pakistani-songs.json',
      'data/podcasts.json',
      'data/hindi-songs.json',
      'data/custom-playlists.json',
      'data/ost-albums.json'
    ];

    let combinedSongs = [];
    const songMap = new Map();
    const loadedPlaylists = [];
    const loadedAlbums = [];

    const results = await Promise.allSettled(jsonFiles.map(file => fetch(file).then(r => r.ok ? r.json() : null)));
    
    let loadedCount = 0;
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const val = result.value;
        
        if (Array.isArray(val.songs)) {
          loadedCount++;
          val.songs.forEach(song => {
            if (!song || !song.id) return;
            if (!songMap.has(song.id)) {
              songMap.set(song.id, { ...song });
            } else {
              const existing = songMap.get(song.id);
              const mergedTags = Array.from(new Set([...(existing.tags || []), ...(song.tags || [])]));
              songMap.set(song.id, {
                ...existing,
                ...song,
                tags: mergedTags,
                rank: song.rank !== undefined && song.rank > 0 ? song.rank : existing.rank
              });
            }
          });
        }
        
        if (Array.isArray(val.playlists)) {
          loadedCount++;
          val.playlists.forEach(pl => {
            if (!pl || !pl.id) return;
            loadedPlaylists.push(pl);
            if (Array.isArray(pl.songs)) {
              pl.songs.forEach(s => {
                if (!s || !s.id) return;
                const songObj = {
                  ...s,
                  isCloud: true,
                  playlistId: pl.id,
                  playlistName: pl.name,
                  img: s.img || pl.img,
                  album: s.album || pl.name,
                  tags: Array.from(new Set([...(s.tags || []), 'custom-playlist', pl.category || 'playlist']))
                };
                if (!songMap.has(s.id)) {
                  songMap.set(s.id, songObj);
                }
              });
            }
          });
        }
        
        if (Array.isArray(val.albums)) {
          loadedCount++;
          val.albums.forEach(alb => {
            if (!alb || !alb.id) return;
            loadedAlbums.push(alb);
            if (Array.isArray(alb.songs)) {
              alb.songs.forEach(s => {
                if (!s || !s.id) return;
                const songObj = {
                  ...s,
                  isCloud: true,
                  albumId: alb.id,
                  album: alb.name,
                  img: s.img || alb.img,
                  tags: Array.from(new Set([...(s.tags || []), 'album', alb.category || 'ost_albums']))
                };
                if (!songMap.has(s.id)) {
                  songMap.set(s.id, songObj);
                }
              });
            }
          });
        }
      }
    });

    state.customPlaylists = loadedPlaylists;
    state.ostAlbums = loadedAlbums;
    state.playlists = [...(state.playlists || []).filter(p => !loadedPlaylists.some(lp => lp.id === p.id) && !loadedAlbums.some(la => la.id === p.id)), ...loadedPlaylists, ...loadedAlbums];

    if (loadedCount > 0) {
      combinedSongs = Array.from(songMap.values());
      cloudData = {
        songs: combinedSongs,
        playlists: loadedPlaylists,
        albums: loadedAlbums,
        notifications: [],
        artists: []
      };
    } else {
      cloudData = {
        songs: [],
        playlists: [],
        albums: [],
        notifications: [],
        artists: []
      };
    }

    try {
      const notifRes = await fetch('notifi.json');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        if (notifData && Array.isArray(notifData.notifications)) {
          cloudData.notifications = notifData.notifications;
        }
      }
    } catch (e) {
      console.log('notifi.json fetch error:', e);
    }

    if (cloudData) {
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
            if (song.title) existing.title = song.title;
            if (song.artist) existing.artist = song.artist;
            existing.img = song.img;
            existing.thumb = song.thumb;
            existing.image = song.image;
            existing.audioUrl = song.audioUrl;
            if (song.lyricsUrl) existing.lyricsUrl = song.lyricsUrl;
            if (song.lyrics) existing.lyrics = song.lyrics;
            if (song.canvasUrl) existing.canvasUrl = song.canvasUrl;
            if (song.tags) existing.tags = song.tags;
            if (song.rank !== undefined) existing.rank = song.rank;
            if (song.recentlyAdded !== undefined) existing.recentlyAdded = song.recentlyAdded;
            if (song.duration) existing.duration = song.duration;
            if (song.album) existing.album = song.album;
          }
        });

        if (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.enrichEnglishSong) {
          const songsNeedingEnrichment = cloudData.songs.filter(s => s && (!s.thumb || s.thumb.includes('placehold.co'))).slice(0, 5);
          songsNeedingEnrichment.forEach(async (song) => {
            const enriched = await SPOTIFY_API.enrichEnglishSong(song).catch(() => null);
            if (enriched && enriched.thumb) {
              const targetInSongs = SONGS.find(s => s.id === song.id);
              if (targetInSongs) {
                targetInSongs.thumb = enriched.thumb;
                targetInSongs.img = enriched.thumb;
              }
            }
          });
        }
      }
    }

    if (typeof _populateHomeSections === 'function') {
      _populateHomeSections();
    } else if (typeof window._populateHomeSections === 'function') {
      window._populateHomeSections();
    }
  } catch (e) {
    console.error('Error loading cloud modular JSON files:', e);
  }
}

let tempProfileImage = null;

function loadUserProfile() {
  const name = localStorage.getItem('wave_user_name');
  const image = localStorage.getItem('wave_user_img');
  applyProfile(name || 'User', image);
}

function applyProfile(name, imageDataUrl) {
  const savedName = name || localStorage.getItem('wave_user_name') || 'User';
  const savedImg = imageDataUrl !== undefined ? imageDataUrl : localStorage.getItem('wave_user_img');

  
  const avatarCircles = document.querySelectorAll('#profile-pic, .profile-avatar-circle');
  avatarCircles.forEach(avatarCircle => {
    if (savedImg) {
      avatarCircle.innerHTML = `<img src="${savedImg}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;" alt="${savedName}">`;
    } else {
      const initial = savedName && savedName.trim() ? savedName.trim().charAt(0).toUpperCase() : 'U';
      avatarCircle.textContent = initial;
    }
  });

  
  const profileWraps = document.querySelectorAll('.sp-profile-avatar-wrap');
  profileWraps.forEach(wrap => {
    let img = wrap.querySelector('.sp-profile-header-img');
    let svgWrap = wrap.querySelector('.sp-profile-header-svg');

    if (savedImg) {
      if (img) {
        img.src = savedImg;
        img.style.display = 'block';
      } else if (svgWrap) {
        svgWrap.insertAdjacentHTML('beforebegin', `<img src="${savedImg}" alt="${savedName}" class="sp-profile-header-img">`);
        svgWrap.remove();
      } else {
        wrap.insertAdjacentHTML('afterbegin', `<img src="${savedImg}" alt="${savedName}" class="sp-profile-header-img">`);
      }
    } else {
      if (img) img.remove();
      if (!wrap.querySelector('.sp-profile-header-svg')) {
        wrap.insertAdjacentHTML('afterbegin', `<div class="sp-profile-header-svg"><svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`);
      }
    }
  });

  
  const profileNames = document.querySelectorAll('.sp-profile-name, .sp-profile-sticky-name');
  profileNames.forEach(el => {
    el.textContent = savedName;
  });
}

window.triggerProfileImageUpload = function() {
  const fileInput = document.getElementById('profile-img-input');
  if (fileInput) fileInput.click();
};

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const nameInput = document.getElementById('profile-name-input');
  if (!modal) return;

  const savedName = localStorage.getItem('wave_user_name') || 'User';
  const savedImg = localStorage.getItem('wave_user_img');

  const heading = document.getElementById('pm-heading');
  if (heading) heading.textContent = 'Profile details';

  if (nameInput) nameInput.value = savedName;

  tempProfileImage = savedImg || null;
  updateModalAvatar(savedName, savedImg);

  modal.classList.remove('hidden');
  if (nameInput) setTimeout(() => nameInput.focus(), 100);
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('hidden');
  const nameInput = document.getElementById('profile-name-input');
  if (nameInput) nameInput.value = '';
  tempProfileImage = null;
}

function updateModalAvatar(name, imgUrl) {
  const pmImg = document.getElementById('pm-avatar-img');
  const pmInitial = document.getElementById('pm-initial');

  if (pmImg) {
    if (imgUrl) {
      pmImg.src = imgUrl;
      pmImg.classList.remove('hidden');
      if (pmInitial) pmInitial.style.display = 'none';
    } else {
      pmImg.classList.add('hidden');
      if (pmInitial) pmInitial.style.display = 'flex';
    }
  }
}

function compressImage(file, maxWidth, maxHeight, quality, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      callback(dataUrl);
    };
    img.onerror = () => callback(e.target.result);
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleProfileImage(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  compressImage(file, 300, 300, 0.85, (compressedDataUrl) => {
    tempProfileImage = compressedDataUrl;
    const nameInput = document.getElementById('profile-name-input');
    const name = nameInput ? nameInput.value.trim() : (localStorage.getItem('wave_user_name') || 'User');
    updateModalAvatar(name, tempProfileImage);
  });
}

function saveProfile() {
  const nameInput = document.getElementById('profile-name-input');
  const inputVal = nameInput ? nameInput.value.trim() : '';
  const finalName = inputVal || (localStorage.getItem('wave_user_name') || 'User');

  try {
    localStorage.setItem('wave_user_name', finalName);
  } catch (e) {
    console.warn('Could not save name to localStorage:', e);
  }

  if (tempProfileImage) {
    try {
      localStorage.setItem('wave_user_img', tempProfileImage);
    } catch (e) {
      console.warn('Could not save profile image to localStorage:', e);
    }
  }

  applyProfile(finalName, tempProfileImage);

  if (typeof state !== 'undefined' && state.currentView === 'profile' && typeof renderView === 'function') {
    renderView('profile');
  } else if (typeof state !== 'undefined' && state.currentView === 'home' && typeof renderView === 'function') {
    renderView('home');
  }

  if (typeof showToast === 'function') {
    showToast('Profile updated successfully!', 'success');
  }

  closeProfileModal();
}

window.loadUserProfile = loadUserProfile;
window.applyProfile = applyProfile;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.updateModalAvatar = updateModalAvatar;
window.handleProfileImage = handleProfileImage;
window.saveProfile = saveProfile;

window.switchLibFilter = function(filter) {
  const pills = document.querySelectorAll('.lib-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (window.event && window.event.target) window.event.target.classList.add('active');
  if (typeof renderSidebarLibrary === 'function') {
    renderSidebarLibrary(filter);
  }
};

window.toggleLibrarySearch = function(event) {
  if (event) event.stopPropagation();
  const input = document.getElementById('lib-search-input');
  const closeBtn = document.getElementById('lib-search-close-btn');
  if (input) {
    input.classList.toggle('hidden');
    if (!input.classList.contains('hidden')) input.focus();
  }
  if (closeBtn) closeBtn.classList.toggle('hidden');
};

window.closeLibrarySearch = function(event) {
  if (event) event.stopPropagation();
  const input = document.getElementById('lib-search-input');
  const closeBtn = document.getElementById('lib-search-close-btn');
  if (input) {
    input.value = '';
    input.classList.add('hidden');
  }
  if (closeBtn) closeBtn.classList.add('hidden');
  if (typeof renderSidebarLibrary === 'function') renderSidebarLibrary();
};

window.handleLibrarySearch = function(event) {
  const q = (event && event.target ? event.target.value : '').toLowerCase().trim();
  const items = document.querySelectorAll('#sidebar-lib-list .lib-item, #sidebar-lib-list .nav-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (!q || text.includes(q)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
};

window.createNewUserPlaylist = function() {
  const currentList = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : (state.playlists || []);
  const nextNum = currentList.length + 1;
  const newPl = {
    id: `user-pl-${Date.now()}`,
    name: `My Playlist #${nextNum}`,
    title: `My Playlist #${nextNum}`,
    author: 'Wave User',
    songs: [],
    created: new Date().toISOString(),
    img: 'https://placehold.co/300x300/282828/1ed760?text=Playlist'
  };

  if (!state.userPlaylists) state.userPlaylists = [];
  if (!state.playlists) state.playlists = [];
  state.userPlaylists.push(newPl);
  state.playlists.push(newPl);

  try {
    localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
  } catch (e) {}

  if (typeof renderSidebarLibrary === 'function') {
    renderSidebarLibrary();
  }

  if (typeof showSpotifyToast === 'function') {
    showSpotifyToast({
      type: 'playlist',
      title: `Created "${newPl.name}".`,
      actionText: 'View',
      onAction: () => {
        if (typeof navigateTo === 'function') navigateTo('playlist', null, newPl.id);
      }
    });
  } else if (typeof showDynamicIsland === 'function') {
    showDynamicIsland(`Created ${newPl.name}`, 'success', 2500);
  }

  if (typeof navigateTo === 'function') {
    navigateTo('playlist', null, newPl.id);
  }
};

window.renderSidebarLibrary = function(filter) {
  const container = document.getElementById('sidebar-lib-list');
  if (!container) return;

  filter = filter || 'all';

  let html = '';
  const userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : (localStorage.getItem('wave_user_name') || 'User');
  const likedCount = (state.likedSongs || []).length;

  if (filter === 'all' || filter === 'playlists') {
    html += `
      <div class="lib-item nav-item" onclick="navigateTo('liked', event)" style="display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 6px; cursor: pointer;">
        <div style="width: 48px; height: 48px; border-radius: 4px; background: linear-gradient(135deg, #450af5, #8e8ee5); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" style="color: white;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div style="flex: 1; overflow: hidden;">
          <div style="font-size: 14px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Liked Songs</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px;">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="#1ed760"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
            <span>Playlist • ${likedCount} song${likedCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>
    `;

    const allUserPls = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : (state.playlists || []);
    allUserPls.forEach(pl => {
      const plName = pl.name || pl.title || 'My Playlist';
      const plAuthor = pl.author || pl.userName || userName;
      const plCover = (typeof getPlaylistCoverHTML === 'function') ? getPlaylistCoverHTML(pl) : `
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" style="color: #b3b3b3;"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      `;
      html += `
        <div class="lib-item nav-item" onclick="navigateTo('playlist', event, '${pl.id}')" style="display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 6px; cursor: pointer;">
          <div style="width: 48px; height: 48px; border-radius: 4px; background: #282828; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${plCover}
          </div>
          <div style="flex: 1; overflow: hidden;">
            <div style="font-size: 14px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${plName}</div>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Playlist • ${plAuthor}</div>
          </div>
        </div>
      `;
    });
  }

  if (filter === 'all' || filter === 'artists') {
    
    if (state.followedArtists && state.followedArtists.length > 0) {
      state.followedArtists.forEach(id => {
        const art = (typeof getFollowedArtistData === 'function') ? getFollowedArtistData(id) : null;
        if (art && art.name) {
          const artImg = art.img || window.getArtistFallbackImage(art.name, 300);
          const fallbackSrc = window.getArtistFallbackImage(art.name, 300);
          html += `
            <div class="lib-item nav-item" onclick="navigateToArtistByName('${art.name.replace(/'/g, "\\'")}')" style="display: flex; align-items: center; gap: 12px; padding: 8px 10px; border-radius: 6px; cursor: pointer;">
              <img src="${artImg}" alt="${art.name}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" onerror="this.onerror=null; this.src='${fallbackSrc}';">
              <div style="flex: 1; overflow: hidden;">
                <div style="font-size: 14px; font-weight: 700; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${art.name}</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Artist • Following</div>
              </div>
            </div>
          `;
        }
      });
    }
  }

  container.innerHTML = html;
};

window.activeSongForPlaylist = null;

window.openAddToPlaylistModal = function(event, song) {
  if (event) event.stopPropagation();

  
  if (song) {
    window.activeSongForPlaylist = song;
  } else if (state.queue && state.queue[state.currentIndex]) {
    window.activeSongForPlaylist = state.queue[state.currentIndex];
  } else if (SONGS && SONGS.length > 0) {
    window.activeSongForPlaylist = SONGS[0];
  } else {
    window.activeSongForPlaylist = { id: 'sample', title: 'Song', artist: 'Artist' };
  }

  const popover = document.getElementById('sp-add-to-playlist-popover');
  if (!popover) return;

  const isHidden = popover.classList.contains('hidden');
  if (!isHidden) {
    popover.classList.add('hidden');
    return;
  }

  
  const searchInput = document.getElementById('sp-add-pl-search');
  if (searchInput) searchInput.value = '';

  
  renderAddPlaylistItems('');

  
  if (event && event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    popover.style.left = `${Math.max(16, rect.left - 40)}px`;
    popover.style.bottom = `${window.innerHeight - rect.top + 12}px`;
    popover.style.transform = 'none';
  } else {
    
    popover.style.left = '50%';
    popover.style.bottom = '148px';
    popover.style.transform = 'translateX(-50%)';
  }

  popover.classList.remove('hidden');
  if (searchInput) setTimeout(() => searchInput.focus(), 150);
};

window.closeAddToPlaylistModal = function() {
  const popover = document.getElementById('sp-add-to-playlist-popover');
  if (popover) popover.classList.add('hidden');
};

window.filterAddPlaylistModal = function(query) {
  renderAddPlaylistItems(query);
};

window.renderAddPlaylistItems = function(query) {
  const container = document.getElementById('sp-add-pl-items-container');
  if (!container) return;

  const targetSong = window.activeSongForPlaylist;
  if (!targetSong) return;

  const q = (query || '').toLowerCase().trim();
  const isLiked = state.likedSongs && state.likedSongs.includes(targetSong.id);
  const userPlaylists = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : (state.playlists || []);

  let html = '';

  
  if (!q || 'liked songs'.includes(q)) {
    html += `
      <div class="sp-add-pl-item" onclick="toggleLikeFromAddModal(event)">
        <div class="sp-add-pl-thumb" style="background: linear-gradient(135deg, #450af5, #8e8ee5); border-radius: 4px;">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div class="sp-add-pl-name">Liked Songs</div>
        <div class="sp-add-pl-pin">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z"/></svg>
        </div>
        <div class="sp-add-pl-check">
          ${isLiked ? `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1ed760"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          ` : `
            <div class="sp-add-pl-circle"></div>
          `}
        </div>
      </div>
    `;
  }

  
  userPlaylists.forEach(pl => {
    const plName = pl.name || pl.title || 'My Playlist';
    if (q && !plName.toLowerCase().includes(q)) return;

    const songsList = pl.songs || [];
    const isInPl = songsList.some(s => String(typeof s === 'object' ? s.id : s) === String(targetSong.id));
    const plCover = (typeof getPlaylistCoverHTML === 'function') ? getPlaylistCoverHTML(pl) : `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="#b3b3b3"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
    `;

    html += `
      <div class="sp-add-pl-item" onclick="toggleSongInPlaylistFromModal('${pl.id}', event)">
        <div class="sp-add-pl-thumb" style="background: #333333; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          ${plCover}
        </div>
        <div class="sp-add-pl-name">${plName}</div>
        <div class="sp-add-pl-check">
          ${isInPl ? `
            <svg viewBox="0 0 24 24" width="20" height="20" fill="#1ed760"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          ` : `
            <div class="sp-add-pl-circle"></div>
          `}
        </div>
      </div>
    `;
  });

  if (!html) {
    html = `<div style="padding: 12px; font-size: 13px; color: #b3b3b3; text-align: center;">No playlists found</div>`;
  }

  container.innerHTML = html;
};

window.toggleLikeFromAddModal = function(event) {
  if (event) event.stopPropagation();
  const targetSong = window.activeSongForPlaylist;
  if (!targetSong) return;

  if (typeof toggleLikeSong === 'function') {
    toggleLikeSong(targetSong.id);
  } else if (typeof toggleLike === 'function') {
    toggleLike();
  }

  renderAddPlaylistItems(document.getElementById('sp-add-pl-search')?.value || '');
};

window.toggleSongInPlaylistFromModal = function(playlistId, event) {
  if (event) event.stopPropagation();
  const targetSong = window.activeSongForPlaylist;
  if (!targetSong || !playlistId) return;

  
  if (!SONGS.find(s => String(s.id) === String(targetSong.id))) {
    SONGS.push(targetSong);
  }

  let pl = (state.userPlaylists || []).find(p => p.id === playlistId) || (state.playlists || []).find(p => p.id === playlistId);
  if (!pl) return;

  if (!pl.songs) pl.songs = [];
  const songIdx = pl.songs.findIndex(s => String(typeof s === 'object' ? s.id : s) === String(targetSong.id));
  const plName = pl.name || pl.title || 'Playlist';

  if (songIdx === -1) {
    pl.songs.push(targetSong);
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({
        type: 'playlist',
        title: `Added to ${plName}.`,
        actionText: 'Change',
        song: targetSong,
        onAction: () => {
          openAddToPlaylistModal(null, targetSong);
        }
      });
    } else if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(`Added to ${plName}`, 'success', 2500);
    }
  } else {
    pl.songs.splice(songIdx, 1);
    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({
        type: 'playlist',
        title: `Removed from ${plName}.`,
        actionText: 'Undo',
        song: targetSong,
        onAction: () => {
          toggleSongInPlaylistFromModal(playlistId);
        }
      });
    } else if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(`Removed from ${plName}`, 'info', 2000);
    }
  }

  try {
    localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
  } catch (e) {}

  
  const container = document.getElementById('main-view');
  if (container && state.currentView === 'playlist') {
    container.innerHTML = getPlaylistHTML(playlistId);
  }

  if (typeof updatePlayerAddToPlaylistButtonUI === 'function') {
    updatePlayerAddToPlaylistButtonUI();
  }

  renderAddPlaylistItems(document.getElementById('sp-add-pl-search')?.value || '');
};

window.createNewPlaylistWithActiveSong = function() {
  const targetSong = window.activeSongForPlaylist;
  const currentList = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : (state.playlists || []);
  const nextNum = currentList.length + 1;
  const newPl = {
    id: `user-pl-${Date.now()}`,
    name: `My Playlist #${nextNum}`,
    title: `My Playlist #${nextNum}`,
    author: (state.userProfile && state.userProfile.name) ? state.userProfile.name : (localStorage.getItem('wave_user_name') || 'User'),
    songs: targetSong ? [targetSong] : [],
    created: new Date().toISOString(),
    img: targetSong ? (targetSong.thumb || targetSong.img || '') : ''
  };

  if (!state.userPlaylists) state.userPlaylists = [];
  if (!state.playlists) state.playlists = [];
  state.userPlaylists.push(newPl);
  state.playlists.push(newPl);

  try {
    localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
  } catch (e) {}

  if (typeof renderSidebarLibrary === 'function') {
    renderSidebarLibrary();
  }

  if (typeof updatePlayerAddToPlaylistButtonUI === 'function') {
    updatePlayerAddToPlaylistButtonUI();
  }

  if (typeof showSpotifyToast === 'function') {
    showSpotifyToast({
      type: 'playlist',
      title: `Created & added to ${newPl.name}.`,
      actionText: 'View',
      song: targetSong,
      onAction: () => {
        if (typeof navigateTo === 'function') navigateTo('playlist', null, newPl.id);
      }
    });
  } else if (typeof showDynamicIsland === 'function') {
    showDynamicIsland(`Created & added to ${newPl.name}`, 'success', 2500);
  }

  renderAddPlaylistItems(document.getElementById('sp-add-pl-search')?.value || '');
};

document.addEventListener('click', function(e) {
  const popover = document.getElementById('sp-add-to-playlist-popover');
  const addBtn = document.getElementById('player-add-to-pl-btn');
  if (popover && !popover.classList.contains('hidden')) {
    if (!popover.contains(e.target) && (!addBtn || !addBtn.contains(e.target))) {
      popover.classList.add('hidden');
    }
  }
});
