'use strict';

function getGreeting() {
  const hour = new Date().getHours();
  const name = localStorage.getItem('wave_user_name') || 'Friend';

  const greetings = {
    morning: [
      { title: `Good Morning, ${name}`, text: "Coffee's brewing, beats are ready — let's go!" },
      { title: `Rise and Shine, ${name}!`, text: "Today deserves a banger playlist too." },
      { title: `Hey ${name}, fresh start!`, text: "New day, new beat. Ready to begin?" }
    ],
    afternoon: [
      { title: `Good Afternoon, ${name}`, text: "Energy dipping? A killer track will fix that." },
      { title: `Hey ${name}, keep grinding!`, text: "Take a break and feed your ears something good." },
      { title: `Midday Boost, ${name}`, text: "Time to keep that mid-day mood on point." }
    ],
    evening: [
      { title: `Good Evening, ${name}`, text: "After a long day, you deserve some peace, right?" },
      { title: `Chill Mode ON, ${name}`, text: "Let's unwind with some evening vibes." },
      { title: `Winding Down, ${name}`, text: "Sunset and soft beats — the perfect combo." }
    ],
    night: [
      { title: `Good Night, ${name}`, text: "Late night thoughts? Try some mellow tunes." },
      { title: `Hey ${name}, still awake?`, text: "We've got a special playlist for this hour." },
      { title: `Night Owl Mode, ${name}`, text: "Can't sleep? Some lo-fi might help." }
    ]
  };

  let category;
  if (hour >= 5 && hour < 12) category = 'morning';
  else if (hour >= 12 && hour < 17) category = 'afternoon';
  else if (hour >= 17 && hour < 21) category = 'evening';
  else category = 'night';

  const options = greetings[category];
  const picked = options[Math.floor(Math.random() * options.length)];

  return picked;
}

function getHomeHTML() {
  if (typeof window.getHomeHTML === 'function' && window.getHomeHTML !== getHomeHTML) {
    return window.getHomeHTML();
  }
  return `
    <div id="sections-container">
      ${(typeof WaveRecsEngine !== 'undefined' && WaveRecsEngine.getDynamicRowsHTML) ? WaveRecsEngine.getDynamicRowsHTML() : ''}
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
        <img src="${song.img || song.thumb}" alt="${song.title || 'Song Cover'}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Music';">
        <div class="card-overlay">
          <button class="card-play-btn" aria-label="Play ${song.title ? song.title.replace(/"/g, '&quot;') : 'Song'}" onclick="event.stopPropagation(); playJioSaavnSong(SONGS.find(s=>s.id==='${song.id}'))">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        ${badgeHtml}
      </div>
      <div class="card-info">
        <h3 class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${song.id}');" title="${song.title}">${song.title}</h3>
        <p class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || '').replace(/'/g, "\\'")}');" title="${song.artist}">${song.artist}</p>
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

function buildPlaylistAlbumRow(title, items, isAlbum) {
  if (!items || items.length === 0) return '';

  const cards = items.map(item => {
    const name = (item.name || item.title || (isAlbum ? 'Album' : 'Playlist')).replace(/"/g, '&quot;');
    const imgUrl = item.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
    const trackCount = Array.isArray(item.songs) ? item.songs.length : 0;
    const subText = item.description || (trackCount > 0 ? `${trackCount} track${trackCount > 1 ? 's' : ''}` : (isAlbum ? 'Full Album' : 'Curated Playlist'));
    const subTextEsc = subText.replace(/"/g, '&quot;');

    return `
      <div class="music-card rec-card sp-pl-collection-card" onclick="navigateTo('${isAlbum ? 'album' : 'playlist'}', event, '${item.id}')" style="cursor: pointer;">
        <div class="card-img-wrap" style="position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1/1; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
          <img src="${imgUrl}" alt="${name}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://placehold.co/300x300/1a1a1a/1ed760?text=Wave';" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
          <div class="card-overlay">
            <button class="card-play-btn" aria-label="Play ${name}" onclick="event.stopPropagation(); playAllPlaylistSongs('${item.id}')">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
        <div class="card-info" style="margin-top: 10px;">
          <h3 class="card-title-link" onclick="event.stopPropagation(); navigateTo('${isAlbum ? 'album' : 'playlist'}', event, '${item.id}');" title="${name}" style="font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;">${name}</h3>
          <p style="font-size: 12px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;" title="${subTextEsc}">${subText}</p>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="section-block rec-section-in">
      <div class="section-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
        <h2 style="font-size: 20px; font-weight: 700; letter-spacing: -0.4px;">${title}</h2>
      </div>
      <div class="cards-container">${cards}</div>
    </div>
  `;
}

function buildSection(title, items, isArtist) {
  if (!items || items.length === 0) return '';
  
  if (isArtist) {
    const cards = items.map(artist => `
      <div class="music-card rec-card" onclick="openArtistPage('${artist.id || artist.name}', event)" style="text-align: center; cursor: pointer;">
        <div class="card-img-wrap" style="border-radius: 50%; overflow: hidden; width: 140px; height: 140px; margin: 0 auto 12px;">
          <img src="${artist.img || 'https://placehold.co/200x200/1a1a1a/a855f7?text=Artist'}" alt="${artist.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
        </div>
        <div class="card-info">
          <h3 class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(artist.name || '').replace(/'/g, "\\'")}');" style="font-size: 14px; font-weight: 700; color: white;">${artist.name}</h3>
          <p style="font-size: 12px; color: var(--text-muted);">${artist.sub || artist.listeners || 'Artist'}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="section-block rec-section-in">
        <div class="section-header">
          <h2>${title}</h2>
        </div>
        <div class="cards-container">${cards}</div>
      </div>
    `;
  }

  return _buildDynamicSection(title, items);
}

function buildTop10Section(title, songs) {
  if (!songs || songs.length === 0) return '';
  
  const cards = songs.slice(0, 10).map((song, index) => `
    <div class="music-card rec-card" onclick="playSpecificSong('${song.id}')">
      <div class="card-img-wrap" style="position: relative;">
        <span style="position: absolute; top: 6px; left: 6px; background: linear-gradient(135deg, #1ed760, #1b7b3a); color: #000; font-weight: 800; font-size: 11px; padding: 2px 7px; border-radius: 12px; z-index: 3; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">#${index + 1}</span>
        <img src="${song.img || song.thumb}" alt="${song.title || 'Song'}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://placehold.co/200x200/1a1a1a/a855f7?text=Music';">
        <div class="card-overlay">
          <button class="card-play-btn" aria-label="Play ${song.title ? song.title.replace(/"/g, '&quot;') : 'Song'}" onclick="event.stopPropagation(); playSpecificSong('${song.id}')">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
      <div class="card-info">
        <h3 class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${song.id}');" title="${song.title}">${song.title}</h3>
        <p class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || '').replace(/'/g, "\\'")}');" title="${song.artist}">${song.artist}</p>
      </div>
    </div>
  `).join('');

  return `
    <div class="section-block rec-section-in">
      <div class="section-header">
        <h2>${title}</h2>
      </div>
      <div class="cards-container">${cards}</div>
    </div>
  `;
}

function buildNetflixPodcastCard(song) {
  if (!song) return '';
  const title = (song.title || 'Wave Podcast').replace(/"/g, '&quot;');
  const rawTitle = song.title || 'Wave Podcast';
  const artist = (song.artist || 'Podcast Host').replace(/"/g, '&quot;');
  const rawArtist = song.artist || 'Podcast Host';
  const imgUrl = song.img || song.thumb || song.image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80';
  const dur = song.duration ? `<span class="netflix-pill-dur">${song.duration}</span>` : '';
  const album = (song.album || 'Podcast').replace(/"/g, '&quot;');
  const tags = Array.isArray(song.tags) ? song.tags.filter(t => t !== 'podcast') : ['Talks', 'Exclusive'];
  const tagsHtml = tags.slice(0, 3).map(t => `<span class="netflix-tag-dot">• ${t}</span>`).join(' ');

  return `
    <div class="netflix-podcast-card" onclick="playSpecificSong('${song.id}')" data-podcast-id="${song.id}">
      <div class="netflix-card-thumb-wrap">
        <img src="${imgUrl}" alt="${title}" loading="lazy" decoding="async" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80';">
        <div class="netflix-thumb-overlay"></div>
        <div class="netflix-badge-top">
          <span class="netflix-pill-n">WAVE SHOW</span>
          ${dur}
        </div>
        <div class="netflix-hover-actions">
          <div class="netflix-btn-group-left">
            <button class="netflix-play-btn" aria-label="Play ${title}" title="Play Episode" onclick="event.stopPropagation(); playSpecificSong('${song.id}')">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
            <button class="netflix-icon-btn" aria-label="Add to Queue" title="Add to Queue" onclick="event.stopPropagation(); if(typeof addToQueue==='function') addToQueue('${song.id}')">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
            <button class="netflix-icon-btn" aria-label="Like / Favorite" title="Add to Favorites" onclick="event.stopPropagation(); if(typeof toggleLike==='function') toggleLike('${song.id}', event)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="netflix-card-content">
        <h3 class="netflix-card-title" title="${title}">${rawTitle}</h3>
        <p class="netflix-card-artist" title="${artist}">${rawArtist}</p>
        <div class="netflix-meta-row">
          <span class="netflix-match-score">98% Match</span>
          <span class="netflix-hd-badge">HD</span>
          <span style="font-size:11px; color:#a0a0a0;">${album}</span>
        </div>
        <div class="netflix-tag-chips">${tagsHtml}</div>
      </div>
    </div>
  `;
}

function buildNetflixPodcastsRow(title, podcasts) {
  if (!podcasts || podcasts.length === 0) return '';
  const rowId = 'netflix-row-' + Math.random().toString(36).substr(2, 6);
  const cardsHtml = podcasts.map(song => buildNetflixPodcastCard(song)).join('');

  return `
    <div class="netflix-section-wrap rec-section-in">
      <div class="netflix-section-header">
        <div class="netflix-title-group">
          <span class="netflix-n-badge">PODCASTS</span>
          <h2 class="netflix-section-title">${title || 'Podcasts & Exclusive Talks'}</h2>
        </div>
        <a class="netflix-explore-all" href="#" onclick="event.preventDefault(); navigateTo('podcasts', event)">
          Explore All
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
        </a>
      </div>
      <div class="netflix-row-outer">
        <button class="netflix-scroll-arrow left" aria-label="Scroll Left" onclick="scrollNetflixRow('${rowId}', -1)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </button>
        <div class="netflix-row-container" id="${rowId}">
          ${cardsHtml}
        </div>
        <button class="netflix-scroll-arrow right" aria-label="Scroll Right" onclick="scrollNetflixRow('${rowId}', 1)">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
    </div>
  `;
}

window.scrollNetflixRow = function(rowId, direction) {
  const container = document.getElementById(rowId);
  if (!container) return;
  const scrollAmount = 620 * direction;
  container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
};

async function _populateHomeSections() {
  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };

  let allPlaylistsSource = (typeof cloudData !== 'undefined' && cloudData.playlists && cloudData.playlists.length > 0) ? cloudData.playlists : (state.customPlaylists || []);
  let allAlbumsSource = (typeof cloudData !== 'undefined' && cloudData.albums && cloudData.albums.length > 0) ? cloudData.albums : (state.ostAlbums || []);

  
  if (allPlaylistsSource.length === 0) {
    try {
      const res = await fetch('data/custom-playlists.json');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.playlists)) {
          allPlaylistsSource = data.playlists;
          state.customPlaylists = data.playlists;
          if (typeof cloudData !== 'undefined') cloudData.playlists = data.playlists;
        }
      }
    } catch(e) {}
  }

  if (allAlbumsSource.length === 0) {
    try {
      const res = await fetch('data/ost-albums.json');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.albums)) {
          allAlbumsSource = data.albums;
          state.ostAlbums = data.albums;
          if (typeof cloudData !== 'undefined') cloudData.albums = data.albums;
        }
      }
    } catch(e) {}
  }

  const communityPlaylists = allPlaylistsSource.filter(p => p.category === 'community' || p.type === 'community' || (p.name && /community/i.test(p.name)));
  const playlistsForYou = allPlaylistsSource.filter(p => p.category === 'for_you' || p.type === 'for_you' || (p.name && /for you/i.test(p.name)) || (!communityPlaylists.includes(p)));
  const albumsForYou = allAlbumsSource.filter(a => a.category === 'albums_for_you' || a.type === 'albums_for_you' || (a.category === 'album' && !/ost/i.test(a.name || '')));
  const ostAlbumsForYou = allAlbumsSource.filter(a => a.category === 'ost_albums' || a.category === 'ost' || a.type === 'ost' || /ost|soundtrack/i.test(a.name || ''));

  
  if (communityPlaylists.length > 0) {
    setHTML('cloud-community-playlists-row', buildPlaylistAlbumRow('Community Playlists', communityPlaylists, false));
  }
  
  if (playlistsForYou.length > 0) {
    setHTML('cloud-playlists-for-you-row', buildPlaylistAlbumRow('Playlists for You', playlistsForYou, false));
  }
  
  if (albumsForYou.length > 0) {
    setHTML('cloud-albums-for-you-row', buildPlaylistAlbumRow('Albums for You', albumsForYou, true));
  }
  
  if (ostAlbumsForYou.length > 0) {
    setHTML('cloud-ost-albums-for-you-row', buildPlaylistAlbumRow('OST and Albums for you', ostAlbumsForYou, true));
  }

  
  if (cloudData && cloudData.songs && cloudData.songs.length > 0) {
    const getRandomSubset = (arr, n) => {
      let shuffled = [...arr];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, n);
    };

    let recAdded = cloudData.songs.filter(s => s.recentlyAdded);
    if (recAdded.length === 0) recAdded = cloudData.songs.slice(0, 15);
    else recAdded = getRandomSubset(recAdded, 15);

    let top10Eng = cloudData.songs.filter(s => s.tags && s.tags.includes('top-10-english')).sort((a,b) => a.rank - b.rank);
    if (top10Eng.length === 0) top10Eng = cloudData.songs.filter(s => s.tags && s.tags.includes('english')).slice(0, 10);

    let engSongs = cloudData.songs.filter(s => s.tags && s.tags.includes('english'));
    if (engSongs.length === 0) engSongs = cloudData.songs.slice(0, 15);
    else engSongs = getRandomSubset(engSongs, 15);

    let top10Hindi = cloudData.songs.filter(s => s.tags && s.tags.includes('top-10-hindi')).sort((a,b) => a.rank - b.rank);
    if (top10Hindi.length === 0) top10Hindi = cloudData.songs.slice(0, 10);

    let animeSongs = cloudData.songs.filter(s => s.tags && s.tags.includes('anime'));
    if (animeSongs.length === 0) animeSongs = cloudData.songs.slice(5, 15);
    else animeSongs = getRandomSubset(animeSongs, 15);

    let kpopSongs = cloudData.songs.filter(s => s.tags && s.tags.includes('kpop'));
    if (kpopSongs.length === 0) kpopSongs = cloudData.songs.slice(10, 20);
    else kpopSongs = getRandomSubset(kpopSongs, 15);

    let kdramaSongs = cloudData.songs.filter(s => s.tags && s.tags.includes('k-drama'));
    if (kdramaSongs.length === 0) kdramaSongs = cloudData.songs.slice(0, 15);
    else kdramaSongs = getRandomSubset(kdramaSongs, 15);

    let pakSongs = cloudData.songs.filter(s => s.tags && s.tags.includes('pakistani'));
    if (pakSongs.length === 0) pakSongs = cloudData.songs.slice(12, 25);
    else pakSongs = getRandomSubset(pakSongs, 15);

    let islamicSongs = cloudData.songs.filter(s => s.tags && s.tags.includes('islamic'));
    if (islamicSongs.length === 0) islamicSongs = cloudData.songs.slice(5, 20);
    else islamicSongs = getRandomSubset(islamicSongs, 15);

    let top10Islamic = cloudData.songs.filter(s => s.tags && s.tags.includes('top-10-islamic')).sort((a,b) => a.rank - b.rank);
    if (top10Islamic.length === 0) top10Islamic = islamicSongs.slice(0, 10);

    let podcasts = cloudData.songs.filter(s => (s.category && s.category === 'podcasts') || (s.tags && s.tags.includes('podcast')));
    if (podcasts.length === 0) {
      podcasts = SONGS.filter(s => (s.category && s.category === 'podcasts') || (s.tags && s.tags.includes('podcast')));
    }

    if (recAdded.length > 0) setHTML('cloud-recently-added-section', buildSection('Recently Added Exclusives ', recAdded, false));
    if (top10Eng.length > 0) setHTML('cloud-top-10-english-section', buildTop10Section('Top 10 English Songs ', top10Eng));
    if (engSongs.length > 0) setHTML('cloud-english-section', buildSection('Best of English Hits ', engSongs, false));
    if (top10Hindi.length > 0) setHTML('cloud-top-10-hindi-section', buildTop10Section('Top 10 Hindi Songs ', top10Hindi));
    if (animeSongs.length > 0) setHTML('cloud-anime-section', buildSection('Best of Anime OSTs ', animeSongs, false));
    if (kpopSongs.length > 0) setHTML('cloud-kpop-section', buildSection('K-Pop Specials ', kpopSongs, false));
    if (kdramaSongs.length > 0) setHTML('cloud-kdrama-section', buildSection('Top K-Drama Soundtracks ', kdramaSongs, false));
    if (pakSongs.length > 0) setHTML('cloud-pakistani-section', buildSection('Best of Pakistan', pakSongs, false));
    if (islamicSongs.length > 0) setHTML('cloud-islamic-section', buildSection('Beautiful Islamic Naats ', islamicSongs, false));
    if (top10Islamic.length > 0) setHTML('cloud-top-10-islamic-section', buildTop10Section('Top 10 Naats', top10Islamic));
    if (podcasts.length > 0) {
      setHTML('cloud-podcasts-section', buildNetflixPodcastsRow('Podcasts & Exclusive Talks', podcasts));
    } else {
      setHTML('cloud-podcasts-section', '');
    }
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

  
  _renderDailyMixesSection();

  
  const currentYear = new Date().getFullYear();
  const userArtists = [];
  state.recentSongs.forEach(s => {
    const a = (s.artist || '').split(',')[0].trim();
    if (a && !userArtists.includes(a)) userArtists.push(a);
  });
  SONGS.filter(s => state.likedSongs.includes(s.id)).forEach(s => {
    const a = (s.artist || '').split(',')[0].trim();
    if (a && !userArtists.includes(a)) userArtists.push(a);
  });

  const mfyQueries = userArtists.length >= 2
    ? userArtists.slice(0, 2).map(a => a + ' best songs')
    : ['Arijit Singh best songs', 'Atif Aslam hits'];

  async function _fetchSongs(query, limit) {
    try {
      const jioResults = await JIOSAAVN_API.searchSongs(query, limit);
      return { songs: (jioResults || []).filter(s => s.audioUrl), source: 'jiosaavn' };
    } catch (e) {
      return { songs: [], source: 'none' };
    }
  }

  const queries = {
    discover:    _fetchSongs(`new songs ${currentYear}`, 10),
    trending:    _fetchSongs('trending hits ' + currentYear, 10),
    mixes:       _fetchSongs('party hits', 10),
    newReleases: _fetchSongs('latest hindi songs', 10),
    mfy1:        _fetchSongs(mfyQueries[0], 6),
    mfy2:        _fetchSongs(mfyQueries[1], 6),
  };

  Promise.allSettled(Object.values(queries)).then(results => {
    const keys = Object.keys(queries);
    const data = {};
    const sources = {};
    keys.forEach((k, i) => {
      const r = results[i];
      const val = (r && r.status === 'fulfilled') ? r.value : { songs: [], source: 'none' };
      data[k] = val.songs || [];
      sources[k] = val.source || 'none';

      data[k].forEach(s => { if (!SONGS.find(x => x.id === s.id)) SONGS.push(s); });
    });

    const _sourceBadge = (source, badge) => badge;

    const discoverEl = document.getElementById('home-discover-section');
    if (discoverEl) {
      const discSongs = (data.discover && data.discover.length > 0) ? data.discover : (cloudData.songs || []).slice(0, 10);
      discoverEl.innerHTML = _buildDynamicSection('Discover Fresh', discSongs, 
        _sourceBadge(sources.discover, { bg: '#1db954,#1ed760', color: '#000', text: 'NEW' }));
    }

    const trendingEl = document.getElementById('home-trending-section');
    if (trendingEl) {
      const trendSongs = (data.trending && data.trending.length > 1) ? data.trending.slice(1) : (cloudData.songs || []).slice(10, 20);
      trendingEl.innerHTML = _buildDynamicSection('Trending Now', trendSongs, 
        _sourceBadge(sources.trending, { bg: '#ef4444,#f97316', color: '#fff', text: 'HOT' }));
    }

    const mixesEl = document.getElementById('home-mixes-section');
    if (mixesEl) {
      const mixSongs = (data.mixes && data.mixes.length > 0) ? data.mixes : (cloudData.songs || []).slice(20, 30);
      mixesEl.innerHTML = _buildDynamicSection('Your Top Mixes', mixSongs, 
        _sourceBadge(sources.mixes, { bg: '#a855f7,#6366f1', color: '#fff', text: 'MIX' }));
    }

    const mfySongs = [...(data.mfy1 || []), ...(data.mfy2 || [])];
    const uniqueMfy = [];
    const mfyIds = new Set();
    mfySongs.forEach(s => { if (!mfyIds.has(s.id)) { mfyIds.add(s.id); uniqueMfy.push(s); } });

    const mfySource = sources.mfy1 || sources.mfy2 || 'none';
    const mfyEl = document.getElementById('home-madeforyou-section');
    if (mfyEl) {
      const mfyLabel = userArtists.length >= 2 
        ? `Made For You — ${userArtists.slice(0, 2).join(', ')} & more`
        : "Made For You — India's Best";
      const forYouSongs = uniqueMfy.length > 0 ? uniqueMfy.slice(0, 12) : (cloudData.songs || []).slice(0, 12);
      mfyEl.innerHTML = _buildDynamicSection(mfyLabel, forYouSongs, 
        _sourceBadge(mfySource, { bg: '#a855f7,#ec4899', color: '#fff', text: 'FOR YOU' }));
    }

    const newReleasesEl = document.getElementById('home-newreleases-section');
    if (newReleasesEl) {
      const newSongs = (data.newReleases && data.newReleases.length > 0) ? data.newReleases : (cloudData.songs || []).slice(5, 15);
      newReleasesEl.innerHTML = _buildDynamicSection('New Releases', newSongs, 
        _sourceBadge(sources.newReleases, { bg: '#f59e0b,#ef4444', color: '#fff', text: 'LATEST' }));
    }
  }).catch(err => {
    console.warn('[Wave Music] Background home sections load error:', err);
  });
}
window._populateHomeSections = _populateHomeSections;

let _generatedDailyMixes = [];

async function _renderDailyMixesSection() {
  const container = document.getElementById('home-daily-mixes-section');
  if (!container) return;

  const hindiArtists = [];
  const englishArtists = [];

  state.recentSongs.forEach(s => {
    const a = (s.artist || '').split(',')[0].trim();
    if (!a || a === 'Unknown') return;
    const isEnglish = s.isCloud || (s.language && s.language.toLowerCase() === 'english') || (/[a-z]/i.test(a) && !/arijit|neha|atif|shreya|prit|badshah|diljit|yo yo|honey|jubin|jasleen|ar rahman|mohit|sonu|kumar|alters/i.test(a));
    if (isEnglish) {
      if (!englishArtists.includes(a)) englishArtists.push(a);
    } else {
      if (!hindiArtists.includes(a)) hindiArtists.push(a);
    }
  });

  const topHindi1 = hindiArtists[0] || 'Arijit Singh';
  const topHindi2 = hindiArtists[1] || 'Atif Aslam';
  const topEnglish1 = englishArtists[0] || 'Alan Walker';

  let mix1Songs = [];
  if (cloudData.songs && cloudData.songs.length > 0) {
    mix1Songs = cloudData.songs.filter(s => s.tags && (s.tags.includes('top-10-hindi') || (s.tags.includes('hindi') && !s.tags.includes('party'))));
    if (mix1Songs.length < 5) mix1Songs = cloudData.songs.slice(0, 15);
  }

  let mix2Songs = [];
  if (cloudData.songs && cloudData.songs.length > 0) {
    mix2Songs = cloudData.songs.filter(s => 
      s.tags && (s.tags.includes('english') || s.tags.includes('top-10-english') || s.tags.includes('anime') || s.tags.includes('kpop'))
    );
    if (mix2Songs.length < 5) mix2Songs = cloudData.songs;
  }

  let mix3Songs = [];
  if (cloudData.songs && cloudData.songs.length > 0) {
    mix3Songs = cloudData.songs.filter(s => s.tags && (s.tags.includes('pakistani') || s.tags.includes('hindi') || s.tags.includes('party')));
    if (mix3Songs.length < 5) mix3Songs = [...cloudData.songs].reverse().slice(0, 15);
  }

  let mix4Songs = [];
  if (cloudData.songs && cloudData.songs.length > 0) {
    mix4Songs = cloudData.songs.filter(s => s.tags && (s.tags.includes('top-10-english') || s.tags.includes('k-drama') || s.tags.includes('kdrama')));
    if (mix4Songs.length < 5) mix4Songs = [...cloudData.songs].reverse();
  }

  _generatedDailyMixes = [
    {
      id: 'mix-1',
      title: 'Daily Mix 1',
      subtitle: `${topHindi1}, Pritam & Hindi Romance`,
      type: 'Hindi • JioSaavn',
      bgGradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
      badge: 'JioSaavn Live',
      badgeColor: '#1db954',
      songs: mix1Songs.slice(0, 15)
    },
    {
      id: 'mix-2',
      title: 'Daily Mix 2',
      subtitle: `${topEnglish1}, EDM & English Pop`,
      type: 'English • Cloud Data',
      bgGradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
      badge: 'Cloud Library',
      badgeColor: '#3b82f6',
      songs: mix2Songs.slice(0, 15)
    },
    {
      id: 'mix-3',
      title: 'Daily Mix 3',
      subtitle: `${topHindi2}, Bollywood Party & Melodies`,
      type: 'Hindi • JioSaavn',
      bgGradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      badge: 'JioSaavn Live',
      badgeColor: '#1db954',
      songs: mix3Songs.slice(0, 15)
    },
    {
      id: 'mix-4',
      title: 'Daily Mix 4',
      subtitle: 'Global Electronic, K-Pop & Soundtracks',
      type: 'English • Cloud Data',
      bgGradient: 'linear-gradient(135deg, #10b981, #3b82f6)',
      badge: 'Cloud Library',
      badgeColor: '#3b82f6',
      songs: mix4Songs.slice(0, 15)
    }
  ];

  const cardsHTML = _generatedDailyMixes.map(mix => {
    const firstArt = mix.songs[0]?.img || mix.songs[0]?.thumb || 'https://placehold.co/200x200/1a1a2e/a855f7?text=MIX';
    return `
      <div class="music-card rec-card" onclick="playCustomDailyMix('${mix.id}')" style="width: 200px;">
        <div class="card-img-wrap" style="background: ${mix.bgGradient}; display:flex; align-items:center; justify-content:center; padding:12px;">
          <img src="${firstArt}" alt="${mix.title}" style="width:85%; height:85%; border-radius:10px; object-fit:cover; box-shadow: 0 8px 20px rgba(0,0,0,0.6);" onerror="this.style.opacity='0'">
          <div class="card-overlay">
            <button class="card-play-btn" aria-label="Play ${mix.title}" onclick="event.stopPropagation(); playCustomDailyMix('${mix.id}')">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
          <div style="position:absolute; top:8px; right:8px; background:rgba(0,0,0,0.7); backdrop-filter:blur(10px); padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; color:${mix.badgeColor}; letter-spacing:0.5px;">${mix.badge}</div>
        </div>
        <div class="card-info">
          <h3 style="font-size:15px; font-weight:800; color:#fff; margin-bottom:4px;">${mix.title}</h3>
          <p style="font-size:11px; color:var(--text-muted); line-height:1.3;">${mix.subtitle}</p>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div class="section-block rec-section rec-section-in">
      <div class="section-header">
        <div>
          <h2 style="font-size:22px; font-weight:800; background:linear-gradient(90deg, #f1f5f9, #a855f7); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Made For You — Your Daily Mixes</h2>
          <p style="font-size:12px; color:var(--text-muted); margin-top:2px;">Personalized playlists dynamically generated from your listening history</p>
        </div>
      </div>
      <div class="cards-container">${cardsHTML}</div>
    </div>
  `;
}

function playCustomDailyMix(mixId) {
  const mix = _generatedDailyMixes.find(m => m.id === mixId);
  if (!mix || !mix.songs || mix.songs.length === 0) {
    if (typeof showToast === 'function') showToast('No songs available in this mix right now.', 'error');
    return;
  }

  mix.songs.forEach(s => {
    if (!SONGS.find(x => x.id === s.id)) SONGS.push(s);
  });

  state.queue = [...mix.songs];
  state.currentIndex = 0;
  playSong(0);

  if (typeof showToast === 'function') {
    showToast(` Playing ${mix.title} (${mix.songs.length} songs)`, 'success');
  }
}

function getFooterHTML() {
  return `
    <footer class="app-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Wave Music</h4>
          <a href="about.html" target="_blank" rel="noopener noreferrer">About Wave</a>
          <a href="whats-new.html" target="_blank" rel="noopener noreferrer">What's New</a>
          <a href="how-it-works.html" target="_blank" rel="noopener noreferrer">How It Works</a>
          <a href="jiosaavn-audio.html" target="_blank" rel="noopener noreferrer">JioSaavn Audio</a>
        </div>
        <div class="footer-col">
          <h4>Features</h4>
          <a href="mobile-app.html" target="_blank" rel="noopener noreferrer">Free Mobile App</a>
          <a href="tips-and-tricks.html" target="_blank" rel="noopener noreferrer">Tips &amp; Tricks</a>
          <a href="#" onclick="event.preventDefault(); navigateTo('discover', event)">Browse Music</a>
          <a href="#" onclick="event.preventDefault(); navigateTo('podcasts', event)">Podcasts</a>
        </div>
        <div class="footer-col">
          <h4>Help &amp; Support</h4>
          <a href="faq.html" target="_blank" rel="noopener noreferrer">FAQ &amp; Support</a>
          <a href="contact.html" target="_blank" rel="noopener noreferrer">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Legal &amp; Privacy</h4>
          <a href="privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="legal.html" target="_blank" rel="noopener noreferrer">Legal Information</a>
        </div>
        <div class="footer-col footer-col-socials">
          <div class="footer-socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-icon" title="Instagram" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" class="social-icon" title="Twitter / X" aria-label="Twitter / X">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="social-icon" title="Facebook" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-bottom">
        <div class="footer-legal-links">
          <a href="privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          <a href="legal.html" target="_blank" rel="noopener noreferrer">Legal Information</a>
          <a href="contact.html" target="_blank" rel="noopener noreferrer">Contact Us</a>
          <a href="faq.html" target="_blank" rel="noopener noreferrer">Support</a>
        </div>
        <div class="footer-copy">&copy; 2026 Wave Music. All rights reserved.</div>
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

let playlistSearchTimeout = null;

window.handlePlaylistPageSearch = function(event, playlistId) {
  const query = event.target.value.trim();
  const resultsContainer = document.getElementById(`pl-search-results-${playlistId}`);
  if (!resultsContainer) return;

  if (playlistSearchTimeout) clearTimeout(playlistSearchTimeout);

  if (!query) {
    resultsContainer.innerHTML = '';
    return;
  }

  resultsContainer.innerHTML = `
    <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px;">
      <div style="margin: 0 auto 10px; border: 2px solid rgba(255,255,255,0.1); border-top-color: #1ed760; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
      Searching for songs...
    </div>
  `;

  playlistSearchTimeout = setTimeout(async () => {
    try {
      const qNorm = query.toLowerCase();
      
      const localHits = SONGS.filter(s => {
        const t = (s.title || '').toLowerCase();
        const a = (s.artist || '').toLowerCase();
        return t.includes(qNorm) || a.includes(qNorm);
      }).slice(0, 5);

      
      let jioHits = [];
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs) {
        jioHits = await JIOSAAVN_API.searchSongs(query, 8).catch(() => []);
      }

      
      const combined = [...localHits];
      jioHits.forEach(js => {
        if (!combined.some(s => String(s.id) === String(js.id))) {
          combined.push(js);
        }
      });

      if (combined.length === 0) {
        resultsContainer.innerHTML = `<div style="padding: 16px; color: var(--text-muted); font-size: 13px;">No matching songs found for "${query}".</div>`;
        return;
      }

      const allPlaylists = [...(state.userPlaylists || []), ...(state.playlists || [])];
      const pl = allPlaylists.find(p => p.id === playlistId) || { id: playlistId, songs: [] };
      const plSongIds = new Set((pl.songs || []).map(s => String(typeof s === 'object' ? s.id : s)));

      let html = '<div style="display: flex; flex-direction: column; gap: 4px; margin-top: 10px;">';
      combined.forEach(song => {
        normalizeSongFields(song);
        const isAdded = plSongIds.has(String(song.id));
        const songData = JSON.stringify(song).replace(/"/g, '&quot;');

        html += `
          <div class="sp-pl-search-row">
            <img class="sp-pl-search-thumb" src="${song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music'}" alt="${song.title}">
            <div class="sp-pl-search-info">
              <h4>${song.title}</h4>
              <p>${song.artist || 'Unknown Artist'}</p>
            </div>
            <div class="sp-pl-search-album">${song.album || 'Single'}</div>
            <div>
              <button class="sp-pl-add-btn ${isAdded ? 'added' : ''}" onclick="addSongToPlaylistFromPage(${songData}, '${playlistId}', this)">
                ${isAdded ? 'Added' : 'Add'}
              </button>
            </div>
          </div>
        `;
      });
      html += '</div>';

      resultsContainer.innerHTML = html;
    } catch (e) {
      console.error(e);
      resultsContainer.innerHTML = `<div style="padding: 16px; color: #ff5555; font-size: 13px;">Failed to search songs.</div>`;
    }
  }, 250);
};

window.addSongToPlaylistFromPage = function(song, playlistId, btnEl) {
  if (!song || !playlistId) return;

  
  if (!SONGS.find(s => String(s.id) === String(song.id))) {
    SONGS.push(song);
  }

  let pl = (state.userPlaylists || []).find(p => p.id === playlistId) || (state.playlists || []).find(p => p.id === playlistId);
  if (!pl) {
    pl = {
      id: playlistId,
      name: 'My Playlist',
      title: 'My Playlist',
      author: (state.userProfile && state.userProfile.name) ? state.userProfile.name : (localStorage.getItem('wave_user_name') || 'User'),
      songs: [],
      created: new Date().toISOString()
    };
    if (!state.userPlaylists) state.userPlaylists = [];
    state.userPlaylists.push(pl);
  }

  if (!pl.songs) pl.songs = [];
  const alreadyIn = pl.songs.some(s => String(typeof s === 'object' ? s.id : s) === String(song.id));
  if (!alreadyIn) {
    pl.songs.push(song);
    try {
      localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
    } catch (e) {}

    if (btnEl) {
      btnEl.textContent = 'Added';
      btnEl.classList.add('added');
    }

    if (typeof showSpotifyToast === 'function') {
      showSpotifyToast({
        type: 'playlist',
        title: `Added to ${pl.name || pl.title || 'Playlist'}.`,
        actionText: 'View',
        song: song,
        onAction: () => {
          if (typeof navigateTo === 'function') navigateTo('playlist', null, playlistId);
        }
      });
    } else if (typeof showDynamicIsland === 'function') {
      showDynamicIsland(`Added "${song.title}" to playlist!`, 'success', 2500);
    }

    if (typeof updatePlayerAddToPlaylistButtonUI === 'function') {
      updatePlayerAddToPlaylistButtonUI();
    }
    if (typeof updateMobileBottomSavedButtonUI === 'function') {
      updateMobileBottomSavedButtonUI();
    }

    
    const container = document.getElementById('main-view');
    if (container && state.currentView === 'playlist') {
      container.innerHTML = getPlaylistHTML(playlistId);
    }
  }
};

window.removeSongFromPlaylist = function(songId, playlistId, event) {
  if (event) event.stopPropagation();
  let pl = (state.userPlaylists || []).find(p => p.id === playlistId) || (state.playlists || []).find(p => p.id === playlistId);
  if (!pl || !pl.songs) return;

  const targetSong = pl.songs.find(s => String(typeof s === 'object' ? s.id : s) === String(songId));
  pl.songs = pl.songs.filter(s => String(typeof s === 'object' ? s.id : s) !== String(songId));
  try {
    localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
  } catch (e) {}

  if (typeof updatePlayerAddToPlaylistButtonUI === 'function') {
    updatePlayerAddToPlaylistButtonUI();
  }
  if (typeof updateMobileBottomSavedButtonUI === 'function') {
    updateMobileBottomSavedButtonUI();
  }

  if (typeof showSpotifyToast === 'function') {
    showSpotifyToast({
      type: 'playlist',
      title: `Removed from ${pl.name || pl.title || 'Playlist'}.`,
      actionText: 'Undo',
      song: (targetSong && typeof targetSong === 'object') ? targetSong : null,
      onAction: () => {
        if (targetSong) window.addSongToPlaylistFromPage(targetSong, playlistId);
      }
    });
  } else if (typeof showDynamicIsland === 'function') {
    showDynamicIsland('Removed song from playlist', 'info', 2000);
  }

  const container = document.getElementById('main-view');
  if (container && state.currentView === 'playlist') {
    container.innerHTML = getPlaylistHTML(playlistId);
  }
};

window.focusPlaylistSearch = function(playlistId) {
  const findSection = document.getElementById(`pl-find-${playlistId}`);
  if (findSection) {
    findSection.style.display = 'block';
    findSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const input = findSection.querySelector('input');
    if (input) setTimeout(() => input.focus(), 300);
  }
};

window._tempPlaylistCoverImg = null;

window.openEditPlaylistModal = function(playlistId) {
  const allPlaylists = [
    ...(state.userPlaylists || []),
    ...(state.customPlaylists || []),
    ...(state.playlists || [])
  ];
  const pl = allPlaylists.find(p => String(p.id) === String(playlistId)) || { id: playlistId, name: 'My Playlist', title: 'My Playlist', description: '' };
  const plName = pl.name || pl.title || 'My Playlist';
  const plDesc = pl.description || '';

  window._tempPlaylistCoverImg = null;

  const modal = document.getElementById('sp-pl-edit-modal');
  if (modal) {
    const input = document.getElementById('sp-pl-name-input');
    const descInput = document.getElementById('sp-pl-desc-input');
    const targetPl = document.getElementById('sp-pl-target-id');
    const artInner = document.getElementById('sp-pl-modal-art-inner');

    if (input) input.value = plName;
    if (descInput) descInput.value = plDesc;
    if (targetPl) targetPl.value = playlistId;

    if (artInner) {
      const coverEl = (typeof getPlaylistCoverHTML === 'function') ? getPlaylistCoverHTML(pl) : `<img src="${pl.img || ''}" alt="${plName}">`;
      artInner.innerHTML = coverEl;
    }

    modal.classList.remove('hidden');
    modal.classList.add('active');
    if (input) {
      setTimeout(() => input.focus(), 80);
    }
  } else {
    const newName = prompt('Enter new playlist name:', plName);
    if (newName && newName.trim()) {
      renamePlaylistDirect(playlistId, newName.trim());
    }
  }
};

window.closeEditPlaylistModal = function() {
  window._tempPlaylistCoverImg = null;
  const modal = document.getElementById('sp-pl-edit-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.add('hidden');
  }
};

window.handlePlaylistCustomCoverUpload = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    window._tempPlaylistCoverImg = e.target.result;
    const artInner = document.getElementById('sp-pl-modal-art-inner');
    if (artInner) {
      artInner.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
    }
  };
  reader.readAsDataURL(file);
};

window.savePlaylistEditDetails = function() {
  const input = document.getElementById('sp-pl-name-input');
  const descInput = document.getElementById('sp-pl-desc-input');
  const targetPl = document.getElementById('sp-pl-target-id');
  if (!input || !targetPl) return;

  const newName = input.value.trim() || 'My Playlist';
  const newDesc = descInput ? descInput.value.trim() : '';
  const playlistId = targetPl.value;

  const allPlaylists = [
    ...(state.userPlaylists || []),
    ...(state.customPlaylists || []),
    ...(state.playlists || [])
  ];

  allPlaylists.forEach(p => {
    if (String(p.id) === String(playlistId)) {
      p.name = newName;
      p.title = newName;
      p.description = newDesc;
      if (window._tempPlaylistCoverImg) {
        p.customImg = window._tempPlaylistCoverImg;
        p.img = window._tempPlaylistCoverImg;
      }
    }
  });

  try {
    localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
  } catch(e) {}
  try {
    localStorage.setItem('wave_custom_playlists', JSON.stringify(state.customPlaylists));
  } catch(e) {}

  if (typeof renderSidebarLibrary === 'function') renderSidebarLibrary();

  const container = document.getElementById('main-view');
  if (container && state.currentView === 'playlist') {
    container.innerHTML = getPlaylistHTML(playlistId);
  }

  if (typeof showDynamicIsland === 'function') {
    showDynamicIsland(`Playlist updated`, 'success', 2200);
  }

  closeEditPlaylistModal();
};

window.confirmDeletePlaylistFromModal = function() {
  const targetPl = document.getElementById('sp-pl-target-id');
  const playlistId = targetPl ? targetPl.value : null;
  if (!playlistId) return;

  const confirmed = confirm('Are you sure you want to delete this playlist? This action cannot be undone.');
  if (confirmed) {
    closeEditPlaylistModal();
    deletePlaylist(playlistId);
  }
};

window.deletePlaylist = function(playlistId) {
  if (!playlistId) return;

  
  if (state.userPlaylists) {
    state.userPlaylists = state.userPlaylists.filter(p => String(p.id) !== String(playlistId));
    try {
      localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
    } catch (e) {}
  }

  
  if (state.customPlaylists) {
    state.customPlaylists = state.customPlaylists.filter(p => String(p.id) !== String(playlistId));
    try {
      localStorage.setItem('wave_custom_playlists', JSON.stringify(state.customPlaylists));
    } catch (e) {}
  }

  
  if (state.playlists) {
    state.playlists = state.playlists.filter(p => String(p.id) !== String(playlistId));
  }

  
  if (typeof closeAllPlaylistDropdowns === 'function') closeAllPlaylistDropdowns();
  closeEditPlaylistModal();

  
  if (typeof renderSidebarLibrary === 'function') {
    renderSidebarLibrary();
  }

  
  if (typeof showDynamicIsland === 'function') {
    showDynamicIsland('Playlist deleted', 'info', 2500);
  }

  
  if (typeof navigateTo === 'function') {
    navigateTo('library');
  }
};

window.togglePlaylistDropdown = function(playlistId, event) {
  if (event) event.stopPropagation();
  const dd = document.getElementById(`pl-dd-${playlistId}`);
  if (dd) {
    const isHidden = dd.classList.contains('hidden');
    window.closeAllPlaylistDropdowns();
    if (isHidden) {
      dd.classList.remove('hidden');
    }
  }
};

window.closeAllPlaylistDropdowns = function() {
  document.querySelectorAll('[id^="pl-dd-"]').forEach(dd => dd.classList.add('hidden'));
  document.querySelectorAll('[id^="pl-view-dd-"]').forEach(dd => dd.classList.add('hidden'));
};

document.addEventListener('click', function(e) {
  if (!e.target.closest('[id^="pl-dot-"]') && !e.target.closest('[id^="pl-dd-"]') && !e.target.closest('[id^="pl-view-dd-"]') && !e.target.closest('.sp-pl-view-toggle-btn')) {
    if (typeof window.closeAllPlaylistDropdowns === 'function') {
      window.closeAllPlaylistDropdowns();
    }
  }
});

window.playPlaylistSongItem = function(songOrId, playlistId, songIndex) {
  const allPlaylists = [
    ...(state.customPlaylists || []),
    ...(state.ostAlbums || []),
    ...((typeof cloudData !== 'undefined' && cloudData.playlists) || []),
    ...((typeof cloudData !== 'undefined' && cloudData.albums) || []),
    ...(state.userPlaylists || []),
    ...(state.playlists || [])
  ];

  let pl = allPlaylists.find(p => String(p.id) === String(playlistId));
  if (!pl && state.activePlaylistId) {
    pl = allPlaylists.find(p => String(p.id) === String(state.activePlaylistId));
  }

  if (pl && pl.songs && pl.songs.length > 0) {
    const songsToPlay = pl.songs.map(s => {
      if (typeof s === 'object' && s && s.id) return s;
      return (typeof getSongById === 'function') ? getSongById(s) : null;
    }).filter(Boolean);

    if (songsToPlay.length > 0) {
      songsToPlay.forEach(s => {
        if (typeof normalizeSongFields === 'function') normalizeSongFields(s);
        if (!SONGS.find(ex => String(ex.id) === String(s.id))) {
          SONGS.push(s);
        }
      });

      state.playbackContext = {
        type: 'playlist',
        id: String(pl.id || playlistId),
        name: pl.name || pl.title || 'Playlist',
        isAlbum: pl.isAlbum || pl.category === 'ost' || pl.category === 'album'
      };

      state.queue = [...songsToPlay];

      let targetIdx = 0;
      if (typeof songIndex === 'number' && songIndex >= 0 && songIndex < songsToPlay.length) {
        targetIdx = songIndex;
      } else if (songOrId) {
        const sId = (typeof songOrId === 'object' && songOrId.id) ? String(songOrId.id) : String(songOrId);
        const fIdx = songsToPlay.findIndex(s => String(s.id) === sId);
        if (fIdx !== -1) targetIdx = fIdx;
      }

      state.currentIndex = targetIdx;
      playSong(targetIdx);

      if (typeof renderQueuePanel === 'function') renderQueuePanel();
      if (typeof renderSidebarQueue === 'function') renderSidebarQueue();
      return;
    }
  }

  if (typeof playArtistSongItem === 'function') {
    playArtistSongItem(songOrId);
  }
};

window.playAllPlaylistSongs = function(playlistId) {
  const allPlaylists = [
    ...(state.customPlaylists || []),
    ...(state.ostAlbums || []),
    ...((typeof cloudData !== 'undefined' && cloudData.playlists) || []),
    ...((typeof cloudData !== 'undefined' && cloudData.albums) || []),
    ...(state.userPlaylists || []),
    ...(state.playlists || [])
  ];
  const pl = allPlaylists.find(p => String(p.id) === String(playlistId));
  if (!pl || !pl.songs || pl.songs.length === 0) return;

  const songsToPlay = pl.songs.map(s => {
    if (typeof s === 'object' && s.id) return s;
    return getSongById(s);
  }).filter(Boolean);

  if (songsToPlay.length > 0) {
    songsToPlay.forEach(song => {
      if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
      if (!SONGS.find(s => String(s.id) === String(song.id))) {
        SONGS.push(song);
      }
    });

    state.playbackContext = {
      type: 'playlist',
      id: String(pl.id || playlistId),
      name: pl.name || pl.title || 'Playlist',
      isAlbum: pl.isAlbum || pl.category === 'ost' || pl.category === 'album'
    };

    state.queue = [...songsToPlay];
    state.currentIndex = 0;
    playSong(0);

    if (typeof renderQueuePanel === 'function') renderQueuePanel();
    if (typeof renderSidebarQueue === 'function') renderSidebarQueue();
  }
};

window.getPlaylistCoverHTML = function(pl) {
  if (!pl) return `<svg viewBox="0 0 24 24" width="45%" height="45%" fill="#7f7f7f"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;

  
  if (pl.customImg) {
    return `<img src="${pl.customImg}" alt="${pl.name || pl.title || 'Playlist'}" style="width:100%;height:100%;object-fit:cover;display:block;">`;
  }

  
  const rawSongs = pl.songs || [];
  const songs = rawSongs.map(s => {
    if (typeof s === 'object' && s) return s;
    return (typeof getSongById === 'function') ? getSongById(s) : null;
  }).filter(Boolean);

  
  if (songs.length >= 4) {
    const thumbs = songs.slice(0, 4).map(s => s.thumb || s.img || s.image || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music');
    return `
      <div class="sp-pl-cover-grid" style="width: 100%; height: 100%; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; overflow: hidden; gap: 0;">
        <img src="${thumbs[0]}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
        <img src="${thumbs[1]}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
        <img src="${thumbs[2]}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
        <img src="${thumbs[3]}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
      </div>
    `;
  }

  
  if (songs.length > 0) {
    const singleThumb = songs[0].thumb || songs[0].img || songs[0].image || (pl.img && !pl.img.includes('placehold.co') ? pl.img : '');
    if (singleThumb) {
      return `<img src="${singleThumb}" alt="${pl.name || pl.title || 'Playlist'}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">`;
    }
  }

  
  if (pl.img && !pl.img.includes('placehold.co')) {
    return `<img src="${pl.img}" alt="${pl.name || pl.title || 'Playlist'}" style="width: 100%; height: 100%; object-fit: cover; display: block;">`;
  }

  
  return `
    <svg viewBox="0 0 24 24" width="45%" height="45%" fill="#7f7f7f">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
    </svg>
  `;
};

window.handlePlaylistCoverUpload = function(event, playlistId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    let pl = (state.userPlaylists || []).find(p => p.id === playlistId) || (state.playlists || []).find(p => p.id === playlistId);
    if (pl) {
      pl.customImg = dataUrl;
      pl.img = dataUrl;
      try {
        localStorage.setItem('wave_user_playlists', JSON.stringify(state.userPlaylists));
      } catch (err) {}
      if (typeof renderSidebarLibrary === 'function') renderSidebarLibrary();
      const container = document.getElementById('main-view');
      if (container && state.currentView === 'playlist') {
        container.innerHTML = getPlaylistHTML(playlistId);
      }
      if (typeof showDynamicIsland === 'function') {
        showDynamicIsland('Playlist cover updated', 'success', 2500);
      }
    }
  };
  reader.readAsDataURL(file);
};

window.togglePlaylistViewMenu = function(playlistId, event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById(`pl-view-dd-${playlistId}`);
  if (menu) menu.classList.toggle('hidden');
};

window.setPlaylistViewMode = function(mode, playlistId) {
  state.playlistViewMode = mode;
  try { localStorage.setItem('wave_pl_view_mode', mode); } catch(e) {}

  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    if (window.innerWidth > 768) {
      if (mode === 'full') {
        appContainer.classList.add('full-page-mode');
      } else {
        appContainer.classList.remove('full-page-mode');
        const sidebar = document.querySelector('.sidebar-library');
        const isCollapsed = sidebar && sidebar.classList.contains('lib-collapsed');
        appContainer.style.gridTemplateColumns = isCollapsed 
          ? '72px 1fr var(--right-sidebar-w)' 
          : 'var(--sidebar-w) 1fr var(--right-sidebar-w)';
      }
    } else {
      appContainer.classList.remove('full-page-mode');
      appContainer.style.gridTemplateColumns = '';
    }
  }

  const container = document.getElementById('main-view');
  if (container && state.currentView === 'playlist') {
    container.innerHTML = getPlaylistHTML(playlistId);
  }
};

window.switchPlaylistSugTab = function(tabName, playlistId, btnEl) {
  const tabs = document.querySelectorAll('.sp-pl-sug-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const container = document.getElementById(`sp-pl-sug-grid-${playlistId}`);
  if (!container) return;

  let songsList = [];
  if (tabName === 'suggestions') {
    songsList = SONGS.slice(0, 9);
  } else if (tabName === 'recent') {
    songsList = (state.recentSongs && state.recentSongs.length > 0) ? state.recentSongs.slice(0, 9) : SONGS.slice(9, 18);
  } else if (tabName === 'liked') {
    const liked = SONGS.filter(s => state.likedSongs.includes(s.id));
    songsList = liked.length > 0 ? liked.slice(0, 9) : SONGS.slice(4, 13);
  }

  container.innerHTML = songsList.map(song => {
    normalizeSongFields(song);
    const thumb = song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music';
    const sData = JSON.stringify(song).replace(/"/g, '&quot;');
    return `
      <div class="sp-pl-sug-item">
        <div class="sp-pl-sug-left" onclick="playArtistSongItem(${sData})">
          <img src="${thumb}" alt="${song.title}" class="sp-pl-sug-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-size: 13px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</div>
            <div style="font-size: 12px; color: #888888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.artist || 'Unknown Artist'}</div>
          </div>
        </div>
        <button class="sp-pl-sug-plus" onclick="addSongToPlaylistFromPage(${sData}, '${playlistId}')" title="Add to playlist">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </button>
      </div>
    `;
  }).join('');
};

window.attachPlaylistScrollListener = function(playlistId) {
  const mainContent = document.querySelector('.main-content') || document.getElementById('main-view');
  if (!mainContent) return;

  const checkScroll = () => {
    if (typeof state !== 'undefined' && state.currentView !== 'playlist' && state.currentView !== 'album') return;
    const stickyBar = document.getElementById('sp-playlist-sticky-bar');
    if (!stickyBar) return;

    const scrollTop = mainContent.scrollTop || window.scrollY || 0;
    if (scrollTop > 180) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  };

  mainContent.addEventListener('scroll', checkScroll, { passive: true });
  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();

  
  setTimeout(() => {
    const coverImg = document.querySelector('.sp-pl-cover-box img, .sp-pl-full-cover img');
    const stickyBar = document.getElementById('sp-playlist-sticky-bar');
    if (coverImg && stickyBar && typeof extractImageColor === 'function') {
      extractImageColor(coverImg.src, function(color) {
        if (stickyBar) {
          stickyBar.style.background = `linear-gradient(90deg, ${color} 0%, rgba(20, 20, 20, 0.98) 100%)`;
        }
      });
    }
  }, 60);
};

window.attachMobilePlaylistScrollListener = function(playlistId) {
  const mainContent = document.querySelector('.main-content') || window;
  const stickyBar = document.getElementById('sp-mob-pl-sticky-bar');
  const stickyTitle = document.getElementById('sp-mob-pl-sticky-title');
  const stickyPlay = document.getElementById('sp-mob-pl-sticky-play');
  if (!stickyBar) return;

  const onScroll = () => {
    const scrollTop = (mainContent === window) ? (window.pageYOffset || document.documentElement.scrollTop || 0) : mainContent.scrollTop;
    if (scrollTop > 200) {
      stickyBar.classList.add('scrolled');
      if (stickyTitle) stickyTitle.classList.add('visible');
      if (stickyPlay) stickyPlay.classList.add('visible');
    } else {
      stickyBar.classList.remove('scrolled');
      if (stickyTitle) stickyTitle.classList.remove('visible');
      if (stickyPlay) stickyPlay.classList.remove('visible');
    }
  };

  if (mainContent === window) {
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    mainContent.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
  }
};

window.openAddSongToPlaylistModal = function(playlistId) {
  if (typeof navigateTo === 'function') {
    navigateTo('search');
    setTimeout(() => {
      if (typeof openActiveMobileSearch === 'function') {
        openActiveMobileSearch();
      }
    }, 80);
  }
};

window.sortPlaylistTracksMobile = function(playlistId) {
  const allPlaylists = [
    ...(state.customPlaylists || []),
    ...(state.userPlaylists || []),
    ...(state.playlists || [])
  ];
  const pl = allPlaylists.find(p => String(p.id) === String(playlistId));
  if (!pl || !pl.songs || pl.songs.length <= 1) return;

  pl.songs.reverse();
  const container = document.getElementById('main-view');
  if (container && state.currentView === 'playlist') {
    container.innerHTML = getPlaylistHTML(playlistId);
  }
};

window.previewPlaylistCovers = function(playlistId) {
  const coverBox = document.getElementById('sp-mob-pl-cover-box');
  if (coverBox) {
    coverBox.style.transform = 'scale(1.04)';
    setTimeout(() => {
      coverBox.style.transform = 'scale(1)';
    }, 250);
  }
};

window.downloadPlaylistSongs = function(playlistId) {
  alert('Playlist songs downloaded for offline playback!');
};

window.sharePlaylistLink = function(playlistId) {
  const shareData = {
    title: 'Wave Music Playlist',
    text: 'Listen to this playlist on Wave Music!',
    url: window.location.href
  };
  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    alert('Playlist link copied to clipboard!');
  }
};

window.openPlaylistOptionsMenu = function(playlistId, event) {
  if (event) event.stopPropagation();
  if (typeof openEditPlaylistModal === 'function') {
    openEditPlaylistModal(playlistId);
  }
};

window.getMobilePlaylistHTML = function(playlistId, pl, plSongs, plTitle, uName, durationStr, firstCover) {
  const coverEl = (typeof getPlaylistCoverHTML === 'function') ? getPlaylistCoverHTML(pl) : `<img src="${firstCover}" alt="${plTitle}">`;

  const statsText = plSongs.length > 0
    ? `${plSongs.length} song${plSongs.length === 1 ? '' : 's'}${durationStr ? ' • ' + durationStr : ''}`
    : '0 songs';

  const currentLoggedName = (state.userProfile && state.userProfile.name && state.userProfile.name.trim()) 
    ? state.userProfile.name.trim() 
    : (localStorage.getItem('wave_user_name') || 'User');
  const finalCreatorName = uName || currentLoggedName;
  const userAvatarImg = (state.userProfile && state.userProfile.avatar) || localStorage.getItem('wave_user_img') || pl.authorAvatar || pl.userAvatar;
  const initialLetter = finalCreatorName ? finalCreatorName.trim().charAt(0).toUpperCase() : 'U';

  const avatarHTML = userAvatarImg ? `
    <img src="${userAvatarImg}" alt="${finalCreatorName}" class="sp-mob-pl-avatar" onerror="this.onerror=null; this.parentNode.innerHTML='<span style=\\'display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:#535353;color:#fff;font-weight:800;font-size:12px;border-radius:50%;\\'>${initialLetter}</span>';">
  ` : `
    <span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: #535353; color: #ffffff; font-weight: 800; font-size: 12px; border-radius: 50%;">${initialLetter}</span>
  `;

  setTimeout(() => {
    if (typeof attachMobilePlaylistScrollListener === 'function') {
      attachMobilePlaylistScrollListener(playlistId);
    }
  }, 40);

  return `
    <div class="sp-mob-pl-page" id="sp-mob-pl-page-${playlistId}">
      
      <div class="sp-mob-pl-sticky-bar" id="sp-mob-pl-sticky-bar">
        <button class="sp-mob-pl-back-btn" onclick="goBack()" aria-label="Go Back">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="sp-mob-pl-sticky-title" id="sp-mob-pl-sticky-title">${plTitle}</div>
        <button class="sp-mob-pl-sticky-play-btn" id="sp-mob-pl-sticky-play" onclick="playAllPlaylistSongs('${playlistId}')" aria-label="Play Playlist">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>

      
      <div class="sp-mob-pl-hero-wrap">
        <div class="sp-mob-pl-gradient-bg"></div>

        
        <div class="sp-mob-pl-cover-box" id="sp-mob-pl-cover-box">
          ${coverEl}
        </div>

        
        <h1 class="sp-mob-pl-title">${plTitle}</h1>

        
        <div class="sp-mob-pl-creator-row">
          <div class="sp-mob-pl-avatar-wrap">
            ${avatarHTML}
            <span class="sp-mob-pl-avatar-badge">+</span>
          </div>
          <span class="sp-mob-pl-creator-name">${finalCreatorName}</span>
        </div>

        
        <div class="sp-mob-pl-meta-row">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="sp-mob-pl-lock-ico"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
          <span>${statsText}</span>
        </div>

        
        <div class="sp-mob-pl-actions-bar">
          <div class="sp-mob-pl-actions-left">
            <button class="sp-mob-pl-act-btn preview" onclick="previewPlaylistCovers('${playlistId}')" title="Preview Covers">
              <span class="sp-mob-pl-preview-card"></span>
            </button>
            <button class="sp-mob-pl-act-btn" onclick="downloadPlaylistSongs('${playlistId}')" title="Download">
              <span class="sp-mob-pl-circle-btn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
            </button>
            <button class="sp-mob-pl-act-btn" onclick="sharePlaylistLink('${playlistId}')" title="Share">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="sp-mob-pl-act-btn" onclick="openPlaylistOptionsMenu('${playlistId}', event)" title="More options">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
            </button>
          </div>

          <div class="sp-mob-pl-actions-right">
            <button class="sp-mob-pl-shuffle-btn ${state.isShuffle ? 'active' : ''}" onclick="toggleShuffleMode(event)" title="Shuffle">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
              <span class="sp-mob-pl-shuffle-dot"></span>
            </button>
            <button class="sp-mob-pl-main-play" onclick="playAllPlaylistSongs('${playlistId}')" aria-label="Play Playlist">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>

        
        <div class="sp-mob-pl-pills-row">
          <button class="sp-mob-pl-pill" onclick="openAddSongToPlaylistModal('${playlistId}')">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            <span>Add</span>
          </button>
          <button class="sp-mob-pl-pill" onclick="openEditPlaylistModal('${playlistId}')">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
            <span>Edit</span>
          </button>
          <button class="sp-mob-pl-pill" onclick="sortPlaylistTracksMobile('${playlistId}')">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 3v18m0 0l-4-4m4 4l4-4M17 21V3m0 0l-4 4m4-4l4 4"/></svg>
            <span>Sort</span>
          </button>
          <button class="sp-mob-pl-pill" onclick="openEditPlaylistModal('${playlistId}')">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            <span>Name & details</span>
          </button>
          <button class="sp-mob-pl-pill danger" onclick="if(confirm('Are you sure you want to delete this playlist?')) deletePlaylist('${playlistId}')" style="color: #ff5555;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            <span>Delete</span>
          </button>
        </div>
      </div>

      
      <div class="sp-mob-pl-tracklist">
        ${plSongs.length === 0 ? `
          <div class="sp-mob-pl-empty">
            <p>This playlist is empty.</p>
            <button class="sp-mob-pl-add-btn" onclick="openAddSongToPlaylistModal('${playlistId}')">Add songs to this playlist</button>
          </div>
        ` : plSongs.map((song, i) => {
          const isCurrentActive = state.currentTrack && String(state.currentTrack.id) === String(song.id);
          const thumb = song.thumb || song.img || song.image || 'https://placehold.co/100x100/181818/1ed760?text=Music';
          const songEsc = JSON.stringify(song).replace(/"/g, '&quot;');

          return `
            <div class="sp-mob-pl-track-row ${isCurrentActive ? 'active' : ''}" onclick="playPlaylistSongItem(${songEsc}, '${playlistId}', ${i})">
              <img src="${thumb}" alt="${song.title}" class="sp-mob-pl-track-thumb" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Music';">
              <div class="sp-mob-pl-track-info">
                <div class="sp-mob-pl-track-title ${isCurrentActive ? 'active' : ''}">${song.title}</div>
                <div class="sp-mob-pl-track-artist">${song.artist || 'Artist'}</div>
              </div>
              <button class="sp-mob-pl-track-more" onclick="event.stopPropagation(); showSongContextMenu('${song.id}', event)" aria-label="More options">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

function getPlaylistHTML(playlistId) {
  const allPlaylists = [
    ...(state.customPlaylists || []),
    ...(state.ostAlbums || []),
    ...(typeof cloudData !== 'undefined' && cloudData.playlists ? cloudData.playlists : []),
    ...(typeof cloudData !== 'undefined' && cloudData.albums ? cloudData.albums : []),
    ...(state.userPlaylists || []),
    ...(state.playlists || []),
    ...MIXES, ...PODCASTS, ...TRENDING, ...MADE_FOR_YOU, ...DISCOVER
  ];
  const pl = allPlaylists.find(p => p.id === playlistId) || (state.userPlaylists || []).find(p => p.id === playlistId) || { id: playlistId, title: 'My Playlist', name: 'My Playlist', songs: [] };
  const plTitle = pl.name || pl.title || 'My Playlist';
  const isAlbumType = pl.category === 'ost_albums' || pl.category === 'albums_for_you' || pl.albumType || /ost|album/i.test(pl.category || '') || /ost/i.test(plTitle);

  const currentAppUser = (state.userProfile && state.userProfile.name && state.userProfile.name.trim()) 
    ? state.userProfile.name.trim() 
    : (localStorage.getItem('wave_user_name') || 'User');
  const uName = isAlbumType 
    ? (pl.artist || 'Official Soundtrack') 
    : (pl.userName || pl.author || pl.curator || currentAppUser);

  const viewMode = state.playlistViewMode || localStorage.getItem('wave_pl_view_mode') || 'mini';

  
  let plSongs = [];
  if (pl.songs && pl.songs.length > 0) {
    plSongs = pl.songs.map(s => {
      if (typeof s === 'object' && s.id) {
        if (!s.img && pl.img) s.img = pl.img;
        if (!s.album && pl.name) s.album = pl.name;
        return s;
      }
      return getSongById(s);
    }).filter(Boolean);
  }

  const hasSongs = plSongs.length > 0;
  const coverEl = getPlaylistCoverHTML(pl);
  const firstCover = plSongs.length > 0 ? (plSongs[0].thumb || plSongs[0].img) : (pl.img || '');

  
  let totalSecs = 0;
  plSongs.forEach(s => {
    if (s.duration) {
      const parts = String(s.duration).split(':').map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        totalSecs += parts[0] * 60 + parts[1];
      } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
        totalSecs += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    } else {
      totalSecs += 210;
    }
  });
  let durationStr = '';
  if (totalSecs >= 3600) {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    durationStr = `${hrs} hr ${mins} min`;
  } else if (totalSecs > 0) {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    durationStr = `${mins} min ${secs > 0 ? secs + ' sec' : ''}`.trim();
  }

  
  
  
  const isMobileScreen = (typeof isMobile !== 'undefined' && isMobile) || (window.innerWidth <= 768);
  if (isMobileScreen) {
    return getMobilePlaylistHTML(playlistId, pl, plSongs, plTitle, uName, durationStr, firstCover);
  }

  const typeLabel = isAlbumType ? 'Album' : (pl.category === 'community' ? 'Community Playlist' : 'Public Playlist');
  const titleClass = plTitle.length > 35 ? 'sp-pl-title title-long' : (plTitle.length > 20 ? 'sp-pl-title title-medium' : 'sp-pl-title');
  const fullTitleClass = plTitle.length > 35 ? 'sp-pl-full-title title-long' : (plTitle.length > 20 ? 'sp-pl-full-title title-medium' : 'sp-pl-full-title');

  let authorLineHTML = '';
  if (isAlbumType) {
    const artistStr = pl.artist || (plSongs[0] && plSongs[0].artist ? plSongs[0].artist : 'Soundtrack Ensemble');
    const artistList = artistStr.split(/,|&|\bfeat\.?|\bft\.?/i).map(a => a.trim()).filter(Boolean);
    const artistLinks = artistList.map(art => `
      <span class="sp-pl-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${art.replace(/'/g, "\\'")}');" style="font-weight: 700; color: #ffffff; cursor: pointer;">${art}</span>
    `).join(' <span style="color: rgba(255,255,255,0.7);">•</span> ');

    const yearStr = pl.releaseYear || pl.year || (plSongs[0] && plSongs[0].year ? plSongs[0].year : '2025');
    const statsStr = hasSongs ? `${plSongs.length} song${plSongs.length === 1 ? '' : 's'}${durationStr ? ', ' + durationStr : ''}` : '';

    authorLineHTML = `
      <div class="sp-pl-author-line" style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 14px; color: rgba(255, 255, 255, 0.7); margin-top: 6px;">
        ${artistLinks}
        ${yearStr ? `<span style="color: rgba(255,255,255,0.7);">•</span> <span>${yearStr}</span>` : ''}
        ${statsStr ? `<span style="color: rgba(255,255,255,0.7);">•</span> <span>${statsStr}</span>` : ''}
      </div>
    `;
  } else {
    authorLineHTML = `
      <div class="sp-pl-author-line" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 14px; margin-top: 6px;">
        <span class="sp-pl-author-badge">+</span>
        <span class="sp-pl-author-name" style="font-weight: 700; color: #ffffff;">${uName}</span>
        ${hasSongs ? `<span class="sp-pl-stats" style="color: rgba(255, 255, 255, 0.7);">• ${plSongs.length} song${plSongs.length === 1 ? '' : 's'}${durationStr ? ', ' + durationStr : ''}</span>` : ''}
      </div>
    `;
  }

  
  const viewDropdownHTML = `
    <div class="sp-pl-view-selector-wrap" style="position: relative; z-index: 1000;">
      <button class="sp-pl-view-toggle-btn" onclick="togglePlaylistViewMenu('${playlistId}', event)" style="background: rgba(255,255,255,0.12); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.22); color: #ffffff; padding: 7px 16px; border-radius: 500px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.4); transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255,255,255,0.22)'; this.style.transform='scale(1.03)'" onmouseout="this.style.background='rgba(255,255,255,0.12)'; this.style.transform='scale(1)'">
        <span>${viewMode === 'full' ? 'Full Screen' : 'Mini Screen'}</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
      </button>
      <div id="pl-view-dd-${playlistId}" class="hidden" style="position: absolute; right: 0; bottom: calc(100% + 8px); width: 170px; background: #222222; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; padding: 6px; box-shadow: 0 16px 36px rgba(0,0,0,0.95); z-index: 999999;" onclick="event.stopPropagation();">
        <div onclick="setPlaylistViewMode('mini', '${playlistId}')" style="padding: 9px 12px; font-size: 13px; font-weight: 600; color: ${viewMode === 'mini' ? '#00d8d6' : '#fff'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
          <span>Mini Screen</span>
          ${viewMode === 'mini' ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="#00d8d6"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
        </div>
        <div onclick="setPlaylistViewMode('full', '${playlistId}')" style="padding: 9px 12px; font-size: 13px; font-weight: 600; color: ${viewMode === 'full' ? '#00d8d6' : '#fff'}; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: space-between; transition: background 0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
          <span>Full Screen</span>
          ${viewMode === 'full' ? '<svg viewBox="0 0 24 24" width="16" height="16" fill="#00d8d6"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>' : ''}
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    if (typeof attachPlaylistScrollListener === 'function') {
      attachPlaylistScrollListener('${playlistId}');
    }
  }, 40);

  
  
  
  if (viewMode === 'full') {
    const sugSongs = SONGS.slice(0, 9);
    const has4Covers = plSongs.length >= 4;
    const isPlayingCurrentPl = state.isPlaying && state.currentTrack && plSongs.some(s => String(s.id) === String(state.currentTrack.id));

    const backdropHTML = has4Covers ? `
      <div class="sp-pl-full-hero-bg sp-pl-bg-collage">
        <div style="background-image: url('${plSongs[0].thumb || plSongs[0].img}');"></div>
        <div style="background-image: url('${plSongs[1].thumb || plSongs[1].img}');"></div>
        <div style="background-image: url('${plSongs[2].thumb || plSongs[2].img}');"></div>
        <div style="background-image: url('${plSongs[3].thumb || plSongs[3].img}');"></div>
      </div>
    ` : `
      <div class="sp-pl-full-hero-bg" style="background: ${firstCover ? `url('${firstCover}') center/cover no-repeat` : 'linear-gradient(135deg, #1e1e1e, #0a0a0a)'};"></div>
    `;

    return `
      <style>
        .sp-pl-full-container {
          width: 100%;
          min-height: 100%;
          background: #121212;
          color: #ffffff;
          padding-bottom: 60px;
        }
        .sp-pl-full-hero {
          position: relative;
          padding: 48px 44px 36px;
          min-height: 320px;
          background: #121212;
          display: flex;
          align-items: flex-end;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          z-index: 1;
        }
        .sp-pl-full-hero-bg {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          filter: blur(6px) brightness(0.35) saturate(1.25);
          transform: scale(1.15);
          overflow: hidden;
          z-index: 0;
        }
        .sp-pl-bg-collage {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .sp-pl-bg-collage > div {
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
        }
        .sp-pl-full-hero-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          z-index: 1;
        }
        .sp-pl-full-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          gap: 28px;
          width: 100%;
          min-width: 0;
        }
        .sp-pl-full-cover {
          width: 220px;
          height: 220px;
          min-width: 220px;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.85);
          background: #282828;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .sp-pl-full-cover:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 50px rgba(0,0,0,0.95);
        }
        .sp-pl-full-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          z-index: 5;
        }
        .sp-pl-full-tag {
          font-size: 12px;
          font-weight: 800;
          color: #00d8d6;
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }
        .sp-pl-full-title {
          font-size: clamp(28px, 4.5vw, 52px);
          font-weight: 900;
          color: #ffffff;
          margin: 2px 0 6px;
          line-height: 1.15;
          letter-spacing: -0.03em;
          word-break: break-word;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .sp-pl-full-title.title-medium {
          font-size: clamp(24px, 3.8vw, 42px);
          line-height: 1.18;
          letter-spacing: -0.02em;
        }
        .sp-pl-full-title.title-long {
          font-size: clamp(20px, 3vw, 34px);
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .sp-pl-full-sub {
          font-size: 13px;
          font-weight: 700;
          color: #a7a7a7;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .sp-pl-full-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 18px;
          position: relative;
          z-index: 20;
          gap: 16px;
        }
        .sp-pl-full-actions-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .sp-pl-full-play {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #00d8d6;
          color: #000000;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(0,216,214,0.45);
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .sp-pl-full-play:hover {
          transform: scale(1.08);
          background: #00f0ee;
          box-shadow: 0 8px 24px rgba(0,216,214,0.6);
        }
        .sp-pl-full-btn {
          background: transparent;
          border: none;
          color: #b3b3b3;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: color 0.2s, transform 0.15s, background 0.2s;
        }
        .sp-pl-full-btn:hover {
          color: #ffffff;
          transform: scale(1.1);
          background: rgba(255,255,255,0.08);
        }
        .sp-pl-tracklist-wrap {
          padding: 12px 36px 36px;
        }
        .sp-pl-full-track-row {
          display: grid;
          grid-template-columns: 40px minmax(260px, 3fr) minmax(200px, 2fr) 80px 48px 48px;
          align-items: center;
          padding: 12px 20px;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease;
          gap: 12px;
        }
        .sp-pl-full-track-row:hover {
          background: rgba(255,255,255,0.08);
        }
        .sp-pl-full-track-row.active {
          background: #242424;
        }
        .sp-pl-sug-wrap {
          padding: 0 36px 48px;
        }
        .sp-pl-sug-tabs {
          display: flex;
          gap: 28px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin: 32px 0 20px;
          padding-bottom: 8px;
        }
        .sp-pl-sug-tab {
          font-size: 13px;
          font-weight: 800;
          color: #7f7f7f;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 0;
          position: relative;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .sp-pl-sug-tab.active {
          color: #ffffff;
        }
        .sp-pl-sug-tab.active::after {
          content: '';
          position: absolute;
          bottom: -9px;
          left: 0;
          right: 0;
          height: 3px;
          background: #00d8d6;
          border-radius: 2px;
        }
        .sp-pl-sug-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px 20px;
        }
        @media (max-width: 1000px) {
          .sp-pl-sug-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .sp-pl-sug-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: transparent;
          border-radius: 4px;
          transition: background 0.2s;
        }
        .sp-pl-sug-item:hover {
          background: rgba(255,255,255,0.06);
        }
        .sp-pl-sug-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          overflow: hidden;
          cursor: pointer;
        }
        .sp-pl-sug-thumb {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 4px;
          object-fit: cover;
        }
        .sp-pl-sug-plus {
          background: transparent;
          border: none;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s, color 0.2s;
          padding: 4px;
        }
        .sp-pl-sug-plus:hover {
          color: #00d8d6;
          transform: scale(1.15);
        }
      </style>

      <input type="file" id="pl-cf-${playlistId}" accept="image/*" style="display:none!important;" onchange="handlePlaylistCoverUpload(event,'${playlistId}')">

      
      <div id="sp-pl-edit-modal" class="sp-pl-modal-overlay" onclick="closeEditPlaylistModal()">
        <div class="sp-pl-modal-box" onclick="event.stopPropagation()">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h2 style="font-size: 20px; font-weight: 800; color: #fff; margin: 0;">Edit details</h2>
            <button onclick="closeEditPlaylistModal()" style="background: none; border: none; color: #b3b3b3; font-size: 20px; cursor: pointer;">&times;</button>
          </div>
          <input type="hidden" id="sp-pl-target-id" value="${playlistId}">
          <div>
            <label style="font-size: 12px; font-weight: 700; color: #b3b3b3; display: block; margin-bottom: 6px;">Name</label>
            <input type="text" id="sp-pl-name-input" value="${plTitle}" style="width: 100%; padding: 10px 14px; background: #3e3e3e; border: 1px solid transparent; border-radius: 4px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box;">
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
            <button onclick="closeEditPlaylistModal()" style="background: transparent; border: none; color: #fff; font-weight: 700; padding: 8px 16px; cursor: pointer;">Cancel</button>
            <button onclick="savePlaylistEditDetails()" style="background: #fff; color: #000; border: none; border-radius: 500px; font-weight: 700; padding: 8px 24px; cursor: pointer;">Save</button>
          </div>
        </div>
      </div>

      <div class="sp-pl-full-container">
        
        <div id="sp-playlist-sticky-bar" class="sp-playlist-sticky-bar">
          <button class="sp-pl-sticky-play-btn" onclick="playAllPlaylistSongs('${playlistId}')" title="Play ${plTitle}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <span class="sp-pl-sticky-title">${plTitle}</span>
        </div>

        
        <div class="sp-pl-full-hero">
          ${backdropHTML}
          <div class="sp-pl-full-hero-overlay"></div>
          <div class="sp-pl-full-hero-content">
            <div class="sp-pl-full-cover" onclick="document.getElementById('pl-cf-${playlistId}').click()" title="Choose photo">
              ${coverEl}
            </div>
            <div class="sp-pl-full-info">
              <span class="sp-pl-full-tag">${typeLabel}</span>
              <h1 class="${fullTitleClass}">${plTitle}</h1>
              ${authorLineHTML}
              
              <div class="sp-pl-full-actions">
                <div class="sp-pl-full-actions-left">
                  <button class="sp-pl-full-play" onclick="playAllPlaylistSongs('${playlistId}')" title="${isPlayingCurrentPl ? 'Pause playlist' : 'Play playlist'}">
                    ${isPlayingCurrentPl ? `
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#000000"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ` : `
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
                    `}
                  </button>
                  <button class="sp-pl-full-btn" onclick="toggleShuffle()" title="Shuffle">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
                  </button>
                  <button class="sp-pl-full-btn" onclick="deletePlaylist('${playlistId}')" title="Delete playlist">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                  </button>
                  <button class="sp-pl-full-btn" onclick="showDynamicIsland('Playlist Radio started','info',2500)" title="Playlist Radio">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 2.76 2.24 5 5 5h8c2.76 0 5-2.24 5-5v-7c0-4.97-4.03-9-9-9zm0 2c3.87 0 7 3.13 7 7v1H5v-1c0-3.87 3.13-7 7-7zm7 15c0 1.66-1.34 3-3 3H8c-1.66 0-3-1.34-3-3v-5h14v5z"/><circle cx="9" cy="16" r="1.5"/><circle cx="15" cy="16" r="1.5"/></svg>
                  </button>
                  <button class="sp-pl-full-btn" onclick="showDynamicIsland('Share link copied!','success',2000)" title="Share">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z"/></svg>
                  </button>
                  <button class="sp-pl-full-btn" onclick="openEditPlaylistModal('${playlistId}')" title="Edit details">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                </div>
                <div>
                  ${viewDropdownHTML}
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="sp-pl-tracklist-wrap">
          ${hasSongs ? `
            <div>
              ${plSongs.map((song, i) => {
                normalizeSongFields(song);
                const songData = JSON.stringify(song).replace(/"/g, '&quot;');
                const isLiked = state.likedSongs && state.likedSongs.includes(song.id);
                const isCurrentActive = state.currentTrack && String(state.currentTrack.id) === String(song.id);
                return `
                  <div class="sp-pl-full-track-row ${isCurrentActive ? 'active' : ''}" onclick="playPlaylistSongItem(${songData}, '${playlistId}', ${i})">
                    <div style="font-size: 14px; font-weight: 700; color: #888888; text-align: center;">${i + 1}</div>
                    <div style="display: flex; align-items: center; gap: 14px; overflow: hidden;">
                      <div style="position: relative; width: 46px; height: 46px; min-width: 46px;">
                        <img src="${song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music'}" alt="${song.title}" style="width: 100%; height: 100%; border-radius: 4px; object-fit: cover;">
                        ${isCurrentActive ? `
                          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.55); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        ` : ''}
                      </div>
                      <div style="overflow: hidden;">
                        <div style="font-size: 15px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</div>
                        <div style="font-size: 13px; color: #888888; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.artist || 'Unknown Artist'}</div>
                      </div>
                    </div>
                    <div style="font-size: 14px; color: #888888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.album || song.title}</div>
                    <div style="font-size: 14px; color: #888888; text-align: right;">${song.duration || '06:58'}</div>
                    <div style="text-align: center;">
                      <button onclick="event.stopPropagation(); toggleLikeSong('${song.id}')" style="background: none; border: none; color: ${isLiked ? '#00d8d6' : '#888888'}; cursor: pointer; padding: 4px;" title="Like track">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>
                    <div style="text-align: center;">
                      <button onclick="event.stopPropagation(); removeSongFromPlaylist('${song.id}', '${playlistId}', event)" style="background: none; border: none; color: #888888; cursor: pointer; padding: 4px;" title="More options / remove">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          ` : `
            <div style="padding: 48px 0; text-align: center; color: #888888;">
              <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px;">Your playlist is empty</h3>
              <p style="font-size: 14px;">Add songs below from suggestions.</p>
            </div>
          `}
        </div>

        
        <div class="sp-pl-sug-wrap">
          <div class="sp-pl-sug-tabs">
            <button class="sp-pl-sug-tab active" onclick="switchPlaylistSugTab('suggestions', '${playlistId}', this)">SUGGESTIONS</button>
            <button class="sp-pl-sug-tab" onclick="switchPlaylistSugTab('recent', '${playlistId}', this)">RECENTLY PLAYED</button>
            <button class="sp-pl-sug-tab" onclick="switchPlaylistSugTab('liked', '${playlistId}', this)">RECENTLY LIKED</button>
          </div>

          <div class="sp-pl-sug-grid" id="sp-pl-sug-grid-${playlistId}">
            ${sugSongs.map(song => {
              normalizeSongFields(song);
              const thumb = song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music';
              const sData = JSON.stringify(song).replace(/"/g, '&quot;');
              return `
                <div class="sp-pl-sug-item">
                  <div class="sp-pl-sug-left" onclick="playArtistSongItem(${sData})">
                    <img src="${thumb}" alt="${song.title}" class="sp-pl-sug-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
                    <div style="flex: 1; overflow: hidden;">
                      <div style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.title}</div>
                      <div style="font-size: 12px; color: #888888; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${song.artist || 'Unknown Artist'}</div>
                    </div>
                  </div>
                  <button class="sp-pl-sug-plus" onclick="addSongToPlaylistFromPage(${sData}, '${playlistId}')" title="Add to playlist">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                  </button>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        ${getFooterHTML()}
      </div>
    `;
  }

  
  
  
  let tracklistHTML = '';
  if (hasSongs) {
    tracklistHTML = `
      <div style="margin-top: 10px; margin-bottom: 24px;">
        <div class="list-head">
          <div class="col-num">#</div>
          <div class="col-title">TITLE</div>
          <div class="col-album">ALBUM</div>
          <div class="col-time">TIME</div>
        </div>
        <div id="playlist-songs-container">
          ${plSongs.map((song, i) => {
            normalizeSongFields(song);
            const songData = JSON.stringify(song).replace(/"/g, '&quot;');
            return `
              <div class="list-row" onclick="playPlaylistSongItem(${songData}, '${playlistId}', ${i})">
                <div class="col-num">${i + 1}</div>
                <div class="col-title">
                  <img src="${song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music'}" alt="${song.title}">
                  <div>
                    <h4>${song.title}</h4>
                    <p>${song.artist || 'Unknown Artist'}</p>
                  </div>
                </div>
                <div class="col-album">${song.album || 'Single'}</div>
                <div class="col-time" style="display: flex; align-items: center; justify-content: flex-end; gap: 12px;">
                  <span>${song.duration || '3:45'}</span>
                  <button class="sp-search-plus-btn" title="Remove from playlist" onclick="removeSongFromPlaylist('${song.id}', '${playlistId}', event)" style="color: #b3b3b3; background: none; border: none; cursor: pointer;">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  return `
    <input type="file" id="pl-cf-${playlistId}" accept="image/*" style="display:none!important;" onchange="handlePlaylistCoverUpload(event,'${playlistId}')">

    
    <div id="sp-pl-edit-modal" class="sp-pl-modal-overlay" onclick="closeEditPlaylistModal()">
      <div class="sp-pl-modal-box" onclick="event.stopPropagation()">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="font-size: 20px; font-weight: 800; color: #fff; margin: 0;">Edit details</h2>
          <button onclick="closeEditPlaylistModal()" style="background: none; border: none; color: #b3b3b3; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <input type="hidden" id="sp-pl-target-id" value="${playlistId}">
        <div>
          <label style="font-size: 12px; font-weight: 700; color: #b3b3b3; display: block; margin-bottom: 6px;">Name</label>
          <input type="text" id="sp-pl-name-input" value="${plTitle}" style="width: 100%; padding: 10px 14px; background: #3e3e3e; border: 1px solid transparent; border-radius: 4px; color: #fff; font-size: 14px; outline: none; box-sizing: border-box;">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px;">
          <button onclick="closeEditPlaylistModal()" style="background: transparent; border: none; color: #fff; font-weight: 700; padding: 8px 16px; cursor: pointer;">Cancel</button>
          <button onclick="savePlaylistEditDetails()" style="background: #fff; color: #000; border: none; border-radius: 500px; font-weight: 700; padding: 8px 24px; cursor: pointer;">Save</button>
        </div>
      </div>
    </div>

    
    <div id="sp-playlist-sticky-bar" class="sp-playlist-sticky-bar">
      <button class="sp-pl-sticky-play-btn" onclick="playAllPlaylistSongs('${playlistId}')" title="Play ${plTitle}">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <span class="sp-pl-sticky-title">${plTitle}</span>
    </div>

    
    <div class="sp-pl-hero">
      <div class="sp-pl-cover-box" onclick="document.getElementById('pl-cf-${playlistId}').click()" title="Choose photo">
        ${coverEl}
        <div class="sp-pl-cover-overlay">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          <span>Choose photo</span>
        </div>
      </div>
      <div class="sp-pl-meta">
        <span class="sp-pl-type">${typeLabel}</span>
        <h1 class="${titleClass}" onclick="openEditPlaylistModal('${playlistId}')" title="${plTitle}">${plTitle}</h1>
        ${authorLineHTML}
      </div>
    </div>

    
    <div class="sp-pl-toolbar">
      <div class="sp-pl-toolbar-left">
        ${hasSongs ? `
          <button class="sp-pl-play-btn" onclick="playAllPlaylistSongs('${playlistId}')" title="Play playlist">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
          </button>
        ` : ''}
        <button class="sp-pl-action-btn" onclick="showDynamicIsland('Collaborator invite link copied!','success',2500)" title="Invite collaborators">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9 0c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm9 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2c0-2.66-5.33-4-7-4z"/></svg>
        </button>
        <button id="pl-dot-${playlistId}" class="sp-pl-action-btn" onclick="togglePlaylistDropdown('${playlistId}', event)" title="More options">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
        <div id="pl-dd-${playlistId}" class="hidden" style="position:absolute;top:44px;left:40px;width:200px;background:#282828;border-radius:8px;padding:4px;box-shadow:0 16px 32px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.1);z-index:200;" onclick="event.stopPropagation();">
          <div onclick="closeAllPlaylistDropdowns(); openEditPlaylistModal('${playlistId}')" style="padding:10px 14px;font-size:13px;font-weight:600;color:#fff;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/></svg>
            Edit details
          </div>
          <div onclick="deletePlaylist('${playlistId}')" style="padding:10px 14px;font-size:13px;font-weight:600;color:#ff5555;border-radius:4px;cursor:pointer;display:flex;align-items:center;gap:10px;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            Delete Playlist
          </div>
        </div>
      </div>
      <div>
        ${viewDropdownHTML}
      </div>
    </div>

    
    <div class="sp-pl-sub-actions">
      <button class="sp-pl-pill-btn" onclick="focusPlaylistSearch('${playlistId}')">
        <span>+</span> Add
      </button>
      <button class="sp-pl-pill-btn" onclick="openEditPlaylistModal('${playlistId}')">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        Name and details
      </button>
    </div>

    
    ${tracklistHTML}

    
    <div id="pl-find-${playlistId}" class="sp-pl-find-section">
      <div class="sp-pl-find-header">
        <h2 class="sp-pl-find-title">Let's find something for your playlist</h2>
        <button class="sp-pl-find-close" onclick="document.getElementById('pl-find-${playlistId}').style.display='none'" title="Close search">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>
      <div class="sp-pl-search-box">
        <svg class="sp-pl-search-icon" viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <input type="text" class="sp-pl-search-input" placeholder="Search for songs or episodes" oninput="handlePlaylistPageSearch(event,'${playlistId}')">
      </div>
      <div id="pl-search-results-${playlistId}"></div>
    </div>
  `;
}
window.getPlaylistHTML = getPlaylistHTML;
window.getAlbumHTML = getPlaylistHTML;

function getLikedHTML() {
  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  const count = likedSongs.length;
  const userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : (localStorage.getItem('wave_user_name') || 'User');

  let listHTML = '';
  if (count === 0) {
    listHTML = `
      <div style="padding: 60px 0; text-align: center; color: var(--text-muted);">
        <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64" style="margin-bottom: 16px; opacity: 0.4;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px;">Songs you like will appear here</h3>
        <p style="font-size: 14px;">Save songs by clicking the heart icon.</p>
      </div>
    `;
  } else {
    const rows = likedSongs.map((song, i) => {
      normalizeSongFields(song);
      return `
        <div class="list-row" onclick="playSpecificSong('${song.id}')">
          <div class="col-num">${i + 1}</div>
          <div class="col-title">
            <img src="${song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music'}" alt="${song.title}">
            <div>
              <h4>${song.title}</h4>
              <p>${song.artist}</p>
            </div>
          </div>
          <div class="col-album">${song.album || 'Single'}</div>
          <div class="col-time">${song.duration}</div>
        </div>
      `;
    }).join('');

    listHTML = `
      <div class="list-head">
        <div class="col-num">#</div>
        <div class="col-title">TITLE</div>
        <div class="col-album">ALBUM</div>
        <div class="col-time">TIME</div>
      </div>
      ${rows}
    `;
  }

  return `
    <div style="background: linear-gradient(180deg, #5038a0 0%, #121212 100%); padding: 40px 32px 24px; margin: -24px -32px 24px -32px;">
      <div style="display: flex; align-items: flex-end; gap: 24px;">
        <div style="width: 192px; height: 192px; min-width: 192px; border-radius: 4px; background: linear-gradient(135deg, #450af5, #c4efd9); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
          <svg viewBox="0 0 24 24" fill="currentColor" width="80" height="80" style="color: #fff;"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; padding-bottom: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: #fff; text-transform: uppercase;">Playlist</span>
          <h1 style="font-size: clamp(36px, 6vw, 72px); font-weight: 900; color: #fff; margin: 0; letter-spacing: -2px; line-height: 1;">Liked Songs</h1>
          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 14px; font-weight: 600; color: #fff;">
            <span>${userName}</span> • <span>${count} songs</span>
          </div>
        </div>
      </div>
    </div>

    ${listHTML}
    ${getFooterHTML()}
  `;
}

function getLibraryHTML() {
  const userPlaylists = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : (state.playlists || []);
  const likedCount = (state.likedSongs || []).length;
  const recentSongsList = (state.recentSongs && state.recentSongs.length > 0) 
    ? state.recentSongs 
    : SONGS.slice(0, 12);

  
  const myLikesCard = `
    <div class="sp-lib-card" onclick="navigateTo('liked', event)">
      <div class="sp-lib-card-art" style="background: linear-gradient(135deg, #7028e4 0%, #a855f7 50%, #ec4899 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
        <svg viewBox="0 0 24 24" fill="white" width="48" height="48" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.4)); margin-bottom: 8px;">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
        <div style="font-size: 18px; font-weight: 800; color: white; letter-spacing: -0.5px;">My Likes</div>
        <button class="sp-lib-card-play" onclick="event.stopPropagation(); playAllLikedSongs();" title="Play My Likes">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      <div class="sp-lib-card-title">My Likes</div>
    </div>
  `;

  
  const playlistCardsHTML = userPlaylists.map(pl => {
    const plName = pl.name || pl.title || 'My Playlist';
    return `
      <div class="sp-lib-card" onclick="setPlaylistViewMode('full', '${pl.id}'); navigateTo('playlist', event, '${pl.id}')">
        <div class="sp-lib-card-art">
          ${getPlaylistCoverHTML(pl)}
          <button class="sp-lib-card-play" onclick="event.stopPropagation(); playAllPlaylistSongs('${pl.id}');" title="Play ${plName}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <div class="sp-lib-card-title">${plName}</div>
      </div>
    `;
  }).join('');

  
  const recentlyPlayedCards = userPlaylists.slice(0, 6).map(pl => {
    const plName = pl.name || pl.title || 'My Playlist';
    return `
      <div class="sp-lib-card" onclick="setPlaylistViewMode('full', '${pl.id}'); navigateTo('playlist', event, '${pl.id}')">
        <div class="sp-lib-card-art">
          ${getPlaylistCoverHTML(pl)}
          <button class="sp-lib-card-play" onclick="event.stopPropagation(); playAllPlaylistSongs('${pl.id}');" title="Play ${plName}">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
        <span class="sp-lib-tag">PLAYLIST</span>
        <div class="sp-lib-card-title" style="margin-top: 2px;">${plName}</div>
      </div>
    `;
  }).join('');

  
  const historySongsSlice = recentSongsList.slice(0, 12);
  const songHistoryHTML = historySongsSlice.map(song => {
    normalizeSongFields(song);
    const thumb = song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music';
    return `
      <div class="sp-history-song-item" onclick="playRecentOrSong('${song.id}')">
        <img src="${thumb}" alt="${song.title}" class="sp-history-song-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
        <div class="sp-history-song-info">
          <div class="sp-history-song-title">${song.title}</div>
          <div class="sp-history-song-artist">${song.artist || 'Unknown Artist'}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <style>
      .sp-lib-full-page {
        padding: 24px 32px 60px;
        background: #121212;
        min-height: 100%;
      }
      .sp-lib-grid-row {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
        gap: 20px;
        margin-bottom: 36px;
      }
      .sp-lib-card {
        padding: 14px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.3s ease, transform 0.2s ease;
        position: relative;
        display: flex;
        flex-direction: column;
      }
      .sp-lib-card:hover {
        background: #242424;
        transform: translateY(-3px);
      }
      .sp-lib-card-art {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        box-shadow: 0 8px 16px rgba(0,0,0,0.4);
        background: #282828;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .sp-lib-card-play {
        position: absolute;
        right: 8px;
        bottom: 8px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: #1ed760;
        color: #000000;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.25s cubic-bezier(0.3, 0, 0, 1);
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        border: none;
        cursor: pointer;
      }
      .sp-lib-card:hover .sp-lib-card-play {
        opacity: 1;
        transform: translateY(0);
      }
      .sp-lib-card-play:hover {
        transform: scale(1.08) !important;
        background: #1fdf64;
      }
      .sp-lib-card-title {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
        margin-top: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sp-lib-tag {
        font-size: 11px;
        font-weight: 700;
        color: #1ed760;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 10px;
        margin-bottom: 2px;
      }
      .sp-lib-sec-title {
        font-size: 24px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: -0.5px;
        margin-bottom: 18px;
      }
      .sp-song-history-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px 20px;
      }
      @media (max-width: 1200px) {
        .sp-song-history-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 900px) {
        .sp-song-history-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .sp-history-song-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      .sp-history-song-item:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      .sp-history-song-thumb {
        width: 48px;
        height: 48px;
        min-width: 48px;
        border-radius: 4px;
        object-fit: cover;
      }
      .sp-history-song-info {
        flex: 1;
        overflow: hidden;
      }
      .sp-history-song-title {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .sp-history-song-artist {
        font-size: 12px;
        color: #b3b3b3;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    </style>

    <div class="sp-lib-full-page">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; padding-bottom: 18px; border-bottom: 1px solid rgba(255,255,255,0.08);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button onclick="toggleExpandLibrary()" style="width: 42px; height: 42px; border-radius: 50%; background: #1f1f1f; border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s, transform 0.2s;" onmouseover="this.style.background='#2a2a2a'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='#1f1f1f'; this.style.transform='scale(1)';" title="Back to previous view">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          </button>
          <div>
            <h1 style="font-size: 28px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">Library</h1>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <button onclick="createNewUserPlaylist()" style="background: #ffffff; color: #000000; border: none; border-radius: 500px; padding: 10px 20px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.04)';" onmouseout="this.style.transform='scale(1)';">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            <span>New Playlist</span>
          </button>
        </div>
      </div>

      
      <div class="sp-lib-grid-row">
        ${myLikesCard}
        ${playlistCardsHTML}
      </div>

      
      ${recentlyPlayedCards ? `
        <h2 class="sp-lib-sec-title">Recently Played</h2>
        <div class="sp-lib-grid-row">
          ${recentlyPlayedCards}
        </div>
      ` : ''}

      
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 36px 0 16px;">
        <h2 class="sp-lib-sec-title" style="margin: 0;">Song History</h2>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="sp-hist-arrow-btn" onclick="scrollSongHistory(-1)" title="Previous" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.08); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button class="sp-hist-arrow-btn" onclick="scrollSongHistory(1)" title="Next" style="width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.08); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
          <button class="sp-hist-see-all-btn" onclick="navigateTo('history')" style="background: rgba(255,255,255,0.1); border: none; border-radius: 500px; padding: 6px 14px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer; letter-spacing: 0.5px;">SEE ALL</button>
        </div>
      </div>

      <div class="sp-song-history-grid" id="sp-song-history-container">
        ${songHistoryHTML}
      </div>

      ${getFooterHTML()}
    </div>
  `;
}

window.playAllLikedSongs = function() {
  const likedSongs = SONGS.filter(s => state.likedSongs.includes(s.id));
  if (likedSongs.length > 0) {
    state.queue = [...likedSongs];
    state.currentIndex = 0;
    const first = likedSongs[0];
    if (first.isCloud || first.isLocal || (first.audioUrl && !first.media_url)) {
      const idx = SONGS.findIndex(s => String(s.id) === String(first.id));
      playSong(idx !== -1 ? idx : 0);
    } else {
      playJioSaavnSong(first);
    }
  }
};

window.playRecentOrSong = function(songId) {
  if (typeof playSpecificSong === 'function') {
    playSpecificSong(songId);
  } else {
    const s = SONGS.find(x => String(x.id) === String(songId));
    if (s) {
      if (!state.queue.find(x => String(x.id) === String(songId))) {
        state.queue.push(s);
      }
      const idx = state.queue.findIndex(x => String(x.id) === String(songId));
      playSong(idx !== -1 ? idx : 0);
    }
  }
};

window.scrollSongHistory = function(dir) {
  const container = document.getElementById('sp-song-history-container');
  if (container) {
    container.scrollBy({ left: dir * 300, behavior: 'smooth' });
  }
};

window.setLibMainFilter = function(filter, btnEl) {
  const pills = document.querySelectorAll('.sp-lib-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  const plGroup = document.getElementById('sp-lib-playlists-group');
  const artGroup = document.getElementById('sp-lib-artists-group');
  const artEmpty = document.getElementById('sp-lib-artists-empty');
  const recentGroup = document.querySelector('.sp-lib-type-recent');

  if (filter === 'all') {
    if (plGroup) plGroup.style.display = 'block';
    if (artGroup) artGroup.style.display = 'block';
    if (artEmpty) artEmpty.style.display = 'none';
    if (recentGroup) recentGroup.style.display = 'block';
  } else if (filter === 'playlists') {
    if (plGroup) plGroup.style.display = 'block';
    if (artGroup) artGroup.style.display = 'none';
    if (recentGroup) recentGroup.style.display = 'none';
  } else if (filter === 'artists') {
    if (plGroup) plGroup.style.display = 'none';
    if (artGroup) artGroup.style.display = 'block';
    if (artEmpty) artEmpty.style.display = 'block';
    if (recentGroup) recentGroup.style.display = 'none';
  }
};

function getArtistAccentColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const sat = 45 + Math.abs((hash >> 3) % 25);
  const lightness = 18 + Math.abs((hash >> 5) % 12);
  return `hsl(${hue}, ${sat}%, ${lightness}%)`;
}

function extractImageColor(imgSrc, callback) {
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;
      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 16) {
        const pr = data[i], pg = data[i + 1], pb = data[i + 2];
        if ((pr + pg + pb) > 60 && (pr + pg + pb) < 680) {
          r += pr; g += pg; b += pb; count++;
        }
      }
      if (count > 0) {
        r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
        r = Math.round(r * 0.35);
        g = Math.round(g * 0.35);
        b = Math.round(b * 0.35);
        callback(`rgb(${r}, ${g}, ${b})`);
      }
    } catch (e) {}
  };
  img.onerror = function () {};
  img.src = imgSrc;
}

function applyArtistDynamicColor(color) {
  const hero = document.getElementById('sr-top-result-hero') || document.querySelector('.sr-top-result-hero');
  const stickyBar = document.getElementById('sp-artist-sticky-bar');
  if (hero) hero.style.background = `linear-gradient(180deg, ${color} 0%, #121212 100%)`;
  if (stickyBar) stickyBar.style.background = color;
}

window.openArtistPhotoModal = function() {
  const modal = document.getElementById('sp-artist-photo-modal');
  const coverImg = document.getElementById('artist-cover-img');
  const nameEl = document.getElementById('artist-title-text');
  const listenersEl = document.getElementById('artist-listeners-text');
  const bioEl = document.getElementById('artist-about-bio-text');

  const modalImg = document.getElementById('sp-modal-img');
  const modalName = document.getElementById('sp-modal-name');
  const modalListeners = document.getElementById('sp-modal-listeners');
  const modalBio = document.getElementById('sp-modal-bio');

  if (modalImg && coverImg) modalImg.src = coverImg.src;
  if (modalName && nameEl) modalName.textContent = nameEl.textContent;
  if (modalListeners && listenersEl) modalListeners.textContent = listenersEl.textContent;
  if (modalBio && bioEl) {
    const bioText = bioEl.textContent || '';
    modalBio.textContent = bioText.includes('Loading') ? '' : bioText;
  }

  if (modal) {
    modal.classList.add('active');
  }
};

window.closeArtistPhotoModal = function(e) {
  if (e) e.stopPropagation();
  const modal = document.getElementById('sp-artist-photo-modal');
  if (modal) modal.classList.remove('active');
};

let artistSongsExpanded = false;

window.toggleArtistSongsExpansion = function() {
  artistSongsExpanded = !artistSongsExpanded;
  renderArtistPopularSongsList();
};

window.playArtistSongItem = function(song) {
  if (!song) return;
  let existingIndex = SONGS.findIndex(s => String(s.id) === String(song.id));
  if (existingIndex === -1) {
    SONGS.push(song);
    existingIndex = SONGS.length - 1;
  }

  if (song.isCloud || song.isLocal || (song.audioUrl && !song.media_url)) {
    state.queue = [song, ...SONGS.filter(s => String(s.id) !== String(song.id)).slice(0, 29)];
    state.currentIndex = 0;
    playSong(existingIndex);
  } else {
    playJioSaavnSong(song);
  }
};

function renderArtistPopularSongsList() {
  const container = document.getElementById('artist-songs-container');
  if (!container || !window.currentArtistResults) return;

  const results = window.currentArtistResults;
  const showCount = artistSongsExpanded ? Math.min(10, results.length) : Math.min(5, results.length);
  const displayList = results.slice(0, showCount);

  let html = `
    <div class="sp-new-popular-list">
      ${displayList.map((song, i) => {
        const streamCount = song.streamCount || (Math.floor(Math.random() * 200000000) + 50000000).toLocaleString();
        song.streamCount = streamCount;
        const songDataEscaped = JSON.stringify(song).replace(/"/g, '&quot;');

        return `
          <div class="sp-new-pop-row" onclick="playArtistSongItem(${songDataEscaped})">
            <div class="sp-new-pop-num">
              <span class="sp-new-pop-num-text">${i + 1}</span>
              <div class="sp-new-pop-play-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
            <img class="sp-new-pop-thumb" src="${song.thumb || song.img || 'https://placehold.co/100x100/1a1a1a/a855f7?text=Music'}" alt="${song.title}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/1a1a1a/a855f7?text=Music';">
            <div class="sp-new-pop-title">${song.title}</div>
            <div class="sp-new-pop-streams">${streamCount}</div>
            <div class="sp-new-pop-duration">${song.duration || '3:45'}</div>
          </div>
        `;
      }).join('')}
    </div>
    ${results.length > 5 ? `
      <button class="sp-new-see-more-btn" id="sp-artist-see-more" onclick="toggleArtistSongsExpansion()">
        ${artistSongsExpanded ? 'See less' : 'See more'}
      </button>
    ` : ''}
  `;

  container.innerHTML = html;
}

function getArtistHTML(artistId) {
  artistSongsExpanded = false;

  const rawTargetName = (typeof artistId === 'object' && artistId) 
    ? (artistId.name || artistId.title || String(artistId.id || ''))
    : String(artistId || 'Artist');
  const targetArtistName = rawTargetName.startsWith('artist-')
    ? rawTargetName.replace('artist-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : rawTargetName;

  let found = (typeof findArtistById === 'function') ? findArtistById(targetArtistName) : null;
  let resolvedInitialImg = (found && found.img && !found.img.includes('placeholder')) 
    ? found.img 
    : (typeof window.getArtistFallbackImage === 'function' ? window.getArtistFallbackImage(targetArtistName, 500) : 'https://i.scdn.co/image/ab67616100005174adfb0b2df04b77e43b5f7375');

  let artist = {
    id: artistId,
    name: (found && found.name && found.name !== 'Artist') ? found.name : targetArtistName,
    img: resolvedInitialImg,
    listeners: (found && found.listeners) ? found.listeners : '15,450,000'
  };

  const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(artist.name || artist.id) : (state.followedArtists && state.followedArtists.includes(artist.id));
  const followBtnClass = isFollowed ? 'sp-new-follow-pill following' : 'sp-new-follow-pill';
  const followBtnText = isFollowed ? 'Following' : 'Follow';

  setTimeout(() => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.onscroll = () => {
        const scrollTop = mainContent.scrollTop;

        
        const fadeEl = document.getElementById('sp-artist-color-fade');
        const heroContent = document.getElementById('sp-artist-hero-content');
        if (fadeEl) {
          const fadeProgress = Math.min(1, Math.max(0, scrollTop / 250));
          fadeEl.style.opacity = fadeProgress;
        }
        if (heroContent) {
          const textProgress = Math.max(0, 1 - (scrollTop / 170));
          heroContent.style.opacity = textProgress;
          heroContent.style.transform = `translateY(${scrollTop * 0.35}px)`;
        }

        
        const stickyBar = document.getElementById('sp-artist-sticky-bar');
        if (stickyBar) {
          if (scrollTop > 250) {
            stickyBar.classList.add('visible');
          } else {
            stickyBar.classList.remove('visible');
          }
        }
      };
    }
  }, 50);

  setTimeout(async () => {
    try {
      const container = document.getElementById('artist-songs-container');
      const heroEl = document.getElementById('sp-artist-hero-bg');
      const badgeImgEl = document.getElementById('artist-badge-img');
      const listenersEl = document.getElementById('artist-listeners-text');
      const titleEl = document.getElementById('artist-title-text');
      const stickyTitleEl = document.getElementById('artist-sticky-title');
      const aboutCard = document.getElementById('sp-new-about-card');
      const aboutListeners = document.getElementById('sp-about-listeners-count');
      const aboutBio = document.getElementById('sp-about-bio-text');
      if (!container) return;

      const searchName = (artist && artist.name && !/^\d+$/.test(artist.name)) ? artist.name : String(artistId);
      const searchNorm = searchName.toLowerCase().trim();

      const spArtist = (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getArtistData)
        ? await SPOTIFY_API.getArtistData(searchName, artistId).catch(() => null)
        : null;

      if (spArtist && spArtist.img) {
        if (heroEl) heroEl.style.backgroundImage = `url('${spArtist.img}')`;
        if (badgeImgEl) badgeImgEl.src = spArtist.img;
        if (aboutCard) aboutCard.style.backgroundImage = `url('${spArtist.img}')`;

        if (spArtist.followers && listenersEl) {
          const cleanCount = spArtist.followers.replace(/\s*monthly\s*listeners/gi, '').replace(/\s*spotify\s*followers/gi, '').replace(/\s*followers/gi, '').trim();
          listenersEl.textContent = cleanCount + ' monthly listeners';
          if (aboutListeners) aboutListeners.textContent = cleanCount + ' monthly listeners';
        }
        if (spArtist.name) {
          const finalName = (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getMatchingArtistName)
            ? SPOTIFY_API.getMatchingArtistName(spArtist.name, searchName)
            : spArtist.name;
          if (titleEl) titleEl.textContent = finalName;
          if (stickyTitleEl) stickyTitleEl.textContent = finalName;
        }
      }

      if (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getArtistBio) {
        SPOTIFY_API.getArtistBio(searchName).then(bioText => {
          if (aboutBio && bioText) {
            aboutBio.textContent = bioText;
          }
        }).catch(() => {});
      }

      
      const localCloudSongs = [];

      
      if (typeof SONGS !== 'undefined' && Array.isArray(SONGS)) {
        SONGS.forEach(s => {
          if (!s || !s.title) return;
          const art = (s.artist || '').toLowerCase();
          if (art.includes(searchNorm) || searchNorm.includes(art)) {
            if (!localCloudSongs.some(ex => String(ex.id) === String(s.id))) {
              localCloudSongs.push(s);
            }
          }
        });
      }

      
      const inMemoryLists = (state.customPlaylists || []).concat(state.ostAlbums || []).concat(state.userPlaylists || []);
      inMemoryLists.forEach(pl => {
        (pl.songs || []).forEach(s => {
          if (!s || !s.title) return;
          const art = (s.artist || pl.artist || '').toLowerCase();
          if (art.includes(searchNorm) || searchNorm.includes(art)) {
            if (!localCloudSongs.some(ex => String(ex.id) === String(s.id) || (ex.title && ex.title.toLowerCase() === s.title.toLowerCase()))) {
              s.isCloud = true;
              localCloudSongs.push(s);
            }
          }
        });
      });

      
      const catFiles = [
        'data/english-songs.json',
        'data/hindi-songs.json',
        'data/korean-songs.json',
        'data/anime-songs.json',
        'data/naat-songs.json',
        'data/pakistani-songs.json',
        'data/top-10-english.json',
        'data/top-10-hindi.json',
        'data/top-10-naat.json',
        'data/custom-playlists.json',
        'data/ost-albums.json'
      ];

      for (const cf of catFiles) {
        try {
          const res = await fetch(cf);
          if (res.ok) {
            const data = await res.json();
            let arr = [];
            if (Array.isArray(data.songs)) {
              arr = data.songs;
            } else if (Array.isArray(data.albums)) {
              data.albums.forEach(a => { if (Array.isArray(a.songs)) arr.push(...a.songs); });
            } else if (Array.isArray(data.playlists)) {
              data.playlists.forEach(p => { if (Array.isArray(p.songs)) arr.push(...p.songs); });
            } else if (Array.isArray(data)) {
              arr = data;
            }

            arr.forEach(s => {
              if (s && s.title && (s.audioUrl || s.url)) {
                const art = (s.artist || '').toLowerCase();
                if (art.includes(searchNorm) || searchNorm.includes(art)) {
                  if (!localCloudSongs.some(ex => String(ex.id) === String(s.id) || (ex.title && ex.title.toLowerCase() === s.title.toLowerCase()))) {
                    s.isCloud = true;
                    localCloudSongs.push(s);
                  }
                }
              }
            });
          }
        } catch (e) {}
      }

      
      let jioSongs = [];
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs) {
        const jioRes = await JIOSAAVN_API.searchSongs(searchName, 20).catch(() => []);
        if (jioRes && jioRes.length > 0) {
          jioSongs = jioRes;
        }
      }

      
      let itunesSongs = [];
      if (localCloudSongs.length < 5 && jioSongs.length < 5) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const iRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchName)}&entity=song&limit=15`, {
            signal: controller.signal
          }).catch(() => null);
          clearTimeout(timeoutId);

          if (iRes && iRes.ok) {
            const iData = await iRes.json().catch(() => ({}));
            const results = iData.results || [];
            itunesSongs = results.map(r => {
              const durSecs = Math.floor((r.trackTimeMillis || 200000) / 1000);
              const m = Math.floor(durSecs / 60);
              const s = durSecs % 60;
              const durStr = `${m}:${s < 10 ? '0' : ''}${s}`;
              const artPhoto = r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb', '600x600bb').replace('100x100', '600x600') : '';
              return {
                id: `itunes-${r.trackId}`,
                title: r.trackName,
                artist: r.artistName || searchName,
                album: r.collectionName || 'Single',
                audioUrl: r.previewUrl,
                img: artPhoto,
                thumb: artPhoto,
                duration: durStr,
                badgeHTML: (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getBadgeHTML) ? SPOTIFY_API.getBadgeHTML('HD Preview') : ''
              };
            }).filter(s => s.audioUrl);
          }
        } catch (e) {}
      }

      
      const combined = [...localCloudSongs];
      [...jioSongs, ...itunesSongs].forEach(ext => {
        const cleanTitle = (ext.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const exists = combined.some(s => {
          const sTitle = (s.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          return String(s.id) === String(ext.id) || (cleanTitle && sTitle === cleanTitle);
        });
        if (!exists) {
          combined.push(ext);
        }
      });

      
      if ((!spArtist || !spArtist.img) && combined.length > 0) {
        const bestImg = combined[0].img || combined[0].thumb;
        if (bestImg) {
          if (heroEl) heroEl.style.backgroundImage = `url('${bestImg}')`;
          if (badgeImgEl) badgeImgEl.src = bestImg;
          if (aboutCard) aboutCard.style.backgroundImage = `url('${bestImg}')`;
        }
      }

      if (!combined || combined.length === 0) {
        container.innerHTML = `
          <div style="padding: 30px; text-align: center; color: var(--text-muted); font-size: 15px; font-weight: 600; background: rgba(255,255,255,0.03); border-radius: 8px; margin: 10px 0;">
            No tracks found for this artist.
          </div>
        `;
        return;
      }

      combined.forEach(song => {
        if (!SONGS.find(s => String(s.id) === String(song.id))) {
          SONGS.push(song);
        }
      });

      window.currentArtistResults = combined;
      renderArtistPopularSongsList();

      
      const relContainer = document.getElementById('artist-related-container');
      if (relContainer) {
        const related = ARTISTS.filter(a => a && a.name && a.name.toLowerCase() !== searchName.toLowerCase()).slice(0, 6);
        if (related.length > 0) {
          relContainer.innerHTML = `
            <div class="sp-new-fans-header">
              <h2 class="sp-new-fans-title">Fans also like</h2>
              <span class="sp-new-fans-show-all">Show all</span>
            </div>
            <div class="sp-new-fans-grid">
              ${related.map(a => `
                <div class="sp-new-fan-card" onclick="openArtistPage(${JSON.stringify(a).replace(/"/g, '&quot;')}, event)">
                  <div class="sp-new-fan-avatar-wrap">
                    <img class="sp-new-fan-avatar" src="${a.img || window.getArtistFallbackImage(a.name, 300)}" alt="${a.name}" onerror="this.onerror=null; this.src=window.getArtistFallbackImage('${a.name.replace(/'/g, "\\'")}', 300);">
                    <button class="sp-new-fan-play-btn" aria-label="Play ${a.name}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                  <div class="sp-new-fan-name">${a.name}</div>
                  <div class="sp-new-fan-sub">Artist</div>
                </div>
              `).join('')}
            </div>
          `;
        }
      }

    } catch (err) {
      console.error(err);
      const container = document.getElementById('artist-songs-container');
      if (container) {
        container.innerHTML = `<div style="padding: 20px; color: #ff5555; text-align: center;">Failed to load artist details.</div>`;
      }
    }
  }, 100);

  const initialImg = artist.img || window.getArtistFallbackImage(artist.name || artist.id, 500);

  return `
    <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
    
    
    <div id="sp-artist-sticky-bar" class="sp-new-sticky-bar">
      <button class="sp-new-sticky-play-btn" onclick="playAllArtistSongs()" title="Play ${artist.name}">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
      </button>
      <span id="artist-sticky-title" class="sp-new-sticky-name">${artist.name}</span>
    </div>

    
    <div class="sp-new-artist-hero-wrap">
      <div class="sp-new-artist-hero-bg" id="sp-artist-hero-bg" style="background-image: url('${initialImg}');"></div>
      <div class="sp-new-artist-hero-overlay"></div>
      <div class="sp-new-artist-color-fade" id="sp-artist-color-fade"></div>
      <div class="sp-new-artist-hero-content" id="sp-artist-hero-content">
        <div class="sp-new-hero-verified">
          <svg viewBox="0 0 24 24" fill="#3d91f4">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>Verified Artist</span>
        </div>
        <h1 id="artist-title-text" class="sp-new-hero-title">${artist.name}</h1>
        <div id="artist-listeners-text" class="sp-new-hero-listeners">
          ${artist.listeners || '22,172,507'} monthly listeners
        </div>
      </div>
    </div>

    
    <div class="sp-new-artist-body">
      
      <div class="sp-new-artist-actions">
        <button class="sp-new-artist-play-btn" onclick="playAllArtistSongs()" title="Play ${artist.name}">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#000000"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <div class="sp-new-badge-thumb" onclick="playAllArtistSongs()" title="Play">
          <img id="artist-badge-img" src="${initialImg}" alt="${artist.name}">
        </div>
        <button class="sp-new-action-icon-btn" onclick="toggleShuffle()" title="Shuffle">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
        </button>
        <button class="${followBtnClass}" id="sp-artist-follow-pill" onclick="toggleFollow('${(artist.name || artist.id).replace(/'/g, "\\'")}', { name: '${(artist.name || '').replace(/'/g, "\\'")}', img: '${initialImg}', listeners: '${(artist.listeners || '').replace(/'/g, "\\'")}' })">
          ${followBtnText}
        </button>
        <button class="sp-new-action-icon-btn" title="More options" onclick="openArtistPhotoModal()">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
      </div>

      
      <div style="margin-top: 10px;">
        <h2 class="sp-new-artist-section-title">Popular</h2>
        <div id="artist-songs-container">
          <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            <div style="margin: 0 auto 15px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--neon-purple); border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite;"></div>
            Loading popular tracks for ${artist.name}...
          </div>
        </div>
      </div>

      
      <div id="artist-related-container"></div>

      
      <div style="margin-top: 40px;">
        <h2 class="sp-new-about-header">About</h2>
        <div class="sp-new-about-card" id="sp-new-about-card" style="background-image: url('${initialImg}');" onclick="openArtistPhotoModal()" title="Click to view full photo and biography">
          <div class="sp-new-about-overlay"></div>
          <div class="sp-new-about-badge-wrap">
            <div class="sp-new-world-rank-badge">
              <span class="sp-new-world-rank-num">#292</span>
              <span class="sp-new-world-rank-text">in the world</span>
            </div>
          </div>
          <div class="sp-new-about-bottom-info">
            <div class="sp-new-about-listeners-count" id="sp-about-listeners-count">
              ${artist.listeners || '22,172,507'} monthly listeners
            </div>
            <p class="sp-new-about-bio-text" id="sp-about-bio-text">
              ${artist.name} is one of the world's most renowned musical icons with millions of passionate listeners across the globe.
            </p>
          </div>
        </div>
      </div>

      ${getFooterHTML()}
    </div>
  `;
}

window.playAllArtistSongs = function() {
  if (window.currentArtistResults && window.currentArtistResults.length > 0) {
    state.queue = [...window.currentArtistResults];
    state.currentIndex = 0;
    playSong(0);
  }
};

function getDiscoverPageHTML() {
  const BROWSE_CATEGORIES = [
    { id: 'music', title: 'Top Global Hits', color: '#DC148C', query: 'Global Pop Hits', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
    { id: 'podcasts', title: 'Podcasts', color: '#006450', query: 'Podcast', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300' },
    { id: 'bollywood', title: 'Hindi & Bollywood', color: '#E13300', query: 'Bollywood Hits', img: 'https://c.saavncdn.com/574/Jhol-English-2024-20250715210327-500x500.jpg' },
    { id: 'punjabi', title: 'Punjabi Hits', color: '#E8115B', query: 'Punjabi Hits', img: 'https://i.scdn.co/image/ab6761610000e5ebfc043bea91ac91c222d235c9' },
    { id: 'pop', title: 'Pop & English', color: '#1E3264', query: 'English Pop Hits', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS7d9cGQQNtSbmnkDodXDWlu0tcuCUPdhGsg&s' },
    { id: 'kpop', title: 'K-Pop & Drama', color: '#B02897', query: 'K-Pop', img: 'https://i.scdn.co/image/ab67616d0000b2737533b658892e7b8dcfdaecb7' },
    { id: 'islamic', title: 'Soulful Naats', color: '#148A08', query: 'Naat', img: 'https://i1.sndcdn.com/artworks-Q8DCM8wFQaYw4ina-m4KfIA-t500x500.jpg' },
    { id: 'anime', title: 'Anime & OSTs', color: '#503750', query: 'Anime OST', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300' },
    { id: 'lofi', title: 'Lo-Fi & Chill', color: '#7D4B32', query: 'Lo-Fi Hindi', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
    { id: 'edm', title: 'EDM & Dance', color: '#477D95', query: 'EDM Hits', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
    { id: 'romantic', title: 'Romance & Love', color: '#8C1932', query: 'Romantic Hindi', img: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300' },
    { id: 'pakistani', title: 'Coke Studio & Sufi', color: '#BC5900', query: 'Coke Studio', img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300' },
    { id: 'workout', title: 'Workout & Gym', color: '#BA5D07', query: 'Workout Hits', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300' },
    { id: 'party', title: 'Party & Club', color: '#509BF5', query: 'Party Hits', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300' },
    { id: 'retro', title: '90s & Retro', color: '#8D67AB', query: '90s Bollywood', img: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300' },
    { id: 'acoustic', title: 'Sleep & Rain', color: '#27856A', query: 'Relaxing Chill', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300' },
    { id: 'rock', title: 'Rock Classics', color: '#E91429', query: 'Rock Hits', img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300' },
    { id: 'trending', title: 'Trending 2026', color: '#0D73EC', query: 'Trending Hits 2026', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' }
  ];

  const categoriesGridHTML = BROWSE_CATEGORIES.map(cat => `
    <div class="sp-category-card" style="background: ${cat.color};" onclick="if(typeof selectSuggestedQuery === 'function') { selectSuggestedQuery('${cat.query}'); } else { navigateTo('search', event, '${cat.query}'); if(typeof showSearchResults==='function') showSearchResults('${cat.query}'); }">
      <div class="sp-category-card-title">${cat.title}</div>
      <img src="${cat.img}" alt="${cat.title}" class="sp-category-card-img" loading="lazy" onerror="this.remove()">
    </div>
  `).join('');

  return `
    <div class="sp-browse-container">
      <div class="sp-browse-header">
        <h1 class="sp-browse-title">Browse all</h1>
        <p class="sp-browse-subtitle">Explore genres, moods, charts, and exclusive sounds</p>
      </div>

      <h2 class="sp-browse-section-title">Explore Categories & Genres</h2>
      <div class="sp-browse-grid">
        ${categoriesGridHTML}
      </div>
    </div>
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
            <span style="font-size:12px; color:#1db954; font-weight:600; display:flex; align-items:center; gap:6px;">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#1db954; box-shadow:0 0 8px #1db954;"></span> JioSaavn Live
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
                <button class="card-play-btn" aria-label="Play ${song.title ? song.title.replace(/"/g, '&quot;') : 'Song'}" onclick="event.stopPropagation(); const sg = SONGS.find(s=>s.id==='${song.id}'); if(sg) playJioSaavnSong(sg);">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <div style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.75); padding:2px 7px; border-radius:4px; font-size:11px; font-weight:800; color:white;">#${i+1}</div>
              <div style="position:absolute; top:8px; right:8px; background:linear-gradient(135deg,#ef4444,#f97316); padding:2px 6px; border-radius:4px; font-size:9px; font-weight:700; color:white; letter-spacing:0.5px;">LIVE</div>
            </div>
            <div class="card-info">
              <h3 class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${song.id}');" title="${song.title}">${song.title}</h3>
              <p class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || '').replace(/'/g, "\\'")}');" title="${song.artist}">${song.artist}</p>
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
      <span class="trending-label"> Quick Play from JioSaavn:</span>
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

      let podcasts = [];
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        podcasts = cloudData.songs.filter(s => (s.category && s.category === 'podcasts') || (s.tags && s.tags.includes('podcast')));
      }
      if (podcasts.length === 0 && Array.isArray(SONGS)) {
        podcasts = SONGS.filter(s => (s.category && s.category === 'podcasts') || (s.tags && s.tags.includes('podcast')));
      }
      
      if (podcasts.length === 0) {
        try {
          const res = await fetch('data/podcasts.json');
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.songs)) {
              podcasts = data.songs;
              podcasts.forEach(p => {
                p.isCloud = true;
                if (!SONGS.find(s => s.id === p.id)) SONGS.push(p);
              });
            }
          }
        } catch (err) {
          console.warn('Could not fetch data/podcasts.json:', err);
        }
      }

      if (podcasts.length === 0) {
        container.innerHTML = `
          <div style="padding: 60px 20px; text-align: center; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px dashed rgba(255,255,255,0.1); margin-top: 20px;">
            <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(229,9,20,0.15); color: #e50914; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
              <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
            </div>
            <h3 style="font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px;">No Podcasts Added Yet</h3>
            <p style="font-size: 14px; max-width: 440px; margin: 0 auto 20px;">Add your podcasts to <code>data/podcasts.json</code> and they will instantly appear here with high-fidelity Netflix cards!</p>
          </div>
        `;
        return;
      }

      
      window._cachedPodcastsList = podcasts;

      
      const heroPodcast = podcasts[0];
      const heroBg = heroPodcast.img || heroPodcast.thumb || heroPodcast.image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1200';
      const heroTitle = heroPodcast.title || 'Wave Exclusive Podcast';
      const heroArtist = heroPodcast.artist || 'Special Episode';

      
      let html = `
        <div class="netflix-hero-billboard">
          <img src="${heroBg}" alt="${heroTitle}" class="netflix-hero-bg">
          <div class="netflix-hero-gradient"></div>
          <div class="netflix-hero-info">
            <div class="netflix-hero-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
              WAVE ORIGINAL SPOTLIGHT
            </div>
            <h1 class="netflix-hero-title">${heroTitle}</h1>
            <p class="netflix-hero-sub">${heroArtist} • ${heroPodcast.album || 'Featured Show'} • ${heroPodcast.duration || 'Special Episode'}</p>
            <div class="netflix-hero-btn-row">
              <button class="netflix-hero-play-btn" onclick="playSpecificSong('${heroPodcast.id}')">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Play Episode
              </button>
              <button class="netflix-hero-more-btn" onclick="if(typeof addToQueue==='function') addToQueue('${heroPodcast.id}')">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                Add to Queue
              </button>
              <button class="netflix-hero-more-btn" onclick="if(typeof toggleLike==='function') toggleLike('${heroPodcast.id}', event)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Favorite
              </button>
            </div>
          </div>
        </div>
      `;

      
      const tagGroups = new Map();
      tagGroups.set('all', { label: 'All Podcasts & Shows', items: [...podcasts] });

      podcasts.forEach(p => {
        if (Array.isArray(p.tags)) {
          p.tags.forEach(t => {
            if (t.toLowerCase() !== 'podcast') {
              const key = t.toLowerCase();
              if (!tagGroups.has(key)) {
                tagGroups.set(key, { label: t.charAt(0).toUpperCase() + t.slice(1), items: [] });
              }
              tagGroups.get(key).items.push(p);
            }
          });
        }
      });

      
      for (const [key, group] of tagGroups) {
        if (group.items.length === 0) continue;
        const rowId = 'podcast-row-' + key.replace(/\s+/g, '-') + '-' + Math.random().toString(36).substr(2, 4);
        const cardsHtml = group.items.map(song => buildNetflixPodcastCard(song)).join('');
        
        html += `
          <div class="netflix-section-wrap rec-section-in">
            <div class="netflix-section-header">
              <div class="netflix-title-group">
                <span class="netflix-n-badge">PODCASTS</span>
                <h2 class="netflix-section-title">${group.label}</h2>
              </div>
            </div>
            <div class="netflix-row-outer">
              <button class="netflix-scroll-arrow left" aria-label="Scroll Left" onclick="scrollNetflixRow('${rowId}', -1)">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <div class="netflix-row-container" id="${rowId}">
                ${cardsHtml}
              </div>
              <button class="netflix-scroll-arrow right" aria-label="Scroll Right" onclick="scrollNetflixRow('${rowId}', 1)">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
          </div>
        `;
      }

      container.innerHTML = html;
    } catch(e) {
      console.error('Error rendering podcasts page:', e);
    }
  }, 50);

  return `
    <div class="netflix-podcasts-page-wrap">
      <div id="dynamic-podcasts-container">
        <div style="padding: 60px 0; text-align: center; color: var(--text-muted);">
          <div style="margin: 0 auto 16px; border: 3px solid rgba(255,255,255,0.1); border-top-color: #e50914; border-radius: 50%; width: 32px; height: 32px; animation: spin 1s linear infinite;"></div>
          Loading Wave Podcasts...
        </div>
      </div>
    </div>
  `;
}

window.filterNetflixPodcasts = function(tag, btn) {
  if (btn) {
    const pills = document.querySelectorAll('.netflix-filter-pill');
    pills.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
  }

  const gridEl = document.getElementById('netflix-podcasts-grid-el');
  if (!gridEl) return;

  const list = window._cachedPodcastsList || [];
  let filtered = list;
  if (tag && tag !== 'all') {
    filtered = list.filter(p => {
      const tags = (p.tags || []).map(t => t.toLowerCase());
      return tags.includes(tag.toLowerCase());
    });
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--text-muted);">
        No podcasts found in category "${tag}".
      </div>
    `;
    return;
  }

  gridEl.innerHTML = filtered.map(song => buildNetflixPodcastCard(song)).join('');
};

function attachProfileScrollListener() {
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) return;

  const checkScroll = () => {
    if (typeof state !== 'undefined' && state.currentView !== 'profile') return;
    const stickyBar = document.getElementById('sp-profile-sticky-bar');
    if (!stickyBar) return;

    if (mainContent.scrollTop > 100) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  };

  mainContent.addEventListener('scroll', checkScroll);
  checkScroll();
}

window.attachProfileScrollListener = attachProfileScrollListener;

window.getSongById = function(songId) {
  if (!songId) return null;
  const sIdStr = String(songId);
  if (typeof window.jioSongCache !== 'undefined' && window.jioSongCache[sIdStr]) {
    return window.jioSongCache[sIdStr];
  }
  if (typeof SONGS !== 'undefined') {
    const s = SONGS.find(x => String(x.id) === sIdStr);
    if (s) return s;
  }
  if (typeof window.apiSearchResults !== 'undefined' && Array.isArray(window.apiSearchResults)) {
    const s = window.apiSearchResults.find(x => String(x.id) === sIdStr);
    if (s) return s;
  }
  if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
    const s = cloudData.songs.find(x => String(x.id) === sIdStr);
    if (s) return s;
  }
  if (typeof state !== 'undefined' && state.listeningHistory) {
    const item = state.listeningHistory.find(x => String(x.songId) === sIdStr || (x.song && String(x.song.id) === sIdStr));
    if (item && item.song) return item.song;
  }
  if (typeof state !== 'undefined' && state.recentSongs) {
    const s = state.recentSongs.find(x => String(x.id) === sIdStr);
    if (s) return s;
  }
  return null;
};

window.attachSongScrollListener = function() {
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    const checkScroll = () => {
      if (typeof state !== 'undefined' && state.currentView !== 'song') return;
      const stickyBar = document.getElementById('sp-song-sticky-bar');
      if (!stickyBar) return;

      if (mainContent.scrollTop > 160) {
        stickyBar.classList.add('visible');
      } else {
        stickyBar.classList.remove('visible');
      }
    };

    mainContent.addEventListener('scroll', checkScroll);
    checkScroll();
  }

  
  setTimeout(() => {
    const heroImg = document.getElementById('sp-song-hero-cover');
    const heroBg = document.getElementById('sp-song-hero-bg');
    if (!heroImg || !heroBg) return;

    function applyColor(r, g, b) {
      
      const darken = 0.7;
      const fr = Math.round(r * darken);
      const fg = Math.round(g * darken);
      const fb = Math.round(b * darken);

      heroBg.style.background = `linear-gradient(180deg, rgb(${fr}, ${fg}, ${fb}) 0%, #121212 100%)`;
      const actionWrap = document.querySelector('.sp-song-action-bar-wrap');
      if (actionWrap) {
        actionWrap.style.background = 'transparent';
      }
      const stickyBar = document.getElementById('sp-song-sticky-bar');
      if (stickyBar) {
        stickyBar.style.background = `rgba(${Math.round(fr * 0.75)}, ${Math.round(fg * 0.75)}, ${Math.round(fb * 0.75)}, 0.95)`;
      }
    }

    function hashColor(src) {
      
      let hash = 0;
      const str = src || 'wave-music';
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const hue = Math.abs(hash) % 360;
      
      const s = 0.5, l = 0.35;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
      const m = l - c / 2;
      let r1 = 0, g1 = 0, b1 = 0;
      if (hue < 60) { r1 = c; g1 = x; }
      else if (hue < 120) { r1 = x; g1 = c; }
      else if (hue < 180) { g1 = c; b1 = x; }
      else if (hue < 240) { g1 = x; b1 = c; }
      else if (hue < 300) { r1 = x; b1 = c; }
      else { r1 = c; b1 = x; }
      applyColor(Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255));
    }

    function extractColor() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(heroImg, 0, 0, 50, 50);
        const data = ctx.getImageData(0, 0, 50, 50).data;

        const colorBuckets = {};
        for (let i = 0; i < data.length; i += 16) {
          const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
          if (a < 128) continue;
          const brightness = (r + g + b) / 3;
          if (brightness < 20 || brightness > 240) continue;
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;
          colorBuckets[key] = (colorBuckets[key] || 0) + 1;
        }

        let dominant = null;
        let maxCount = 0;
        for (const key in colorBuckets) {
          if (colorBuckets[key] > maxCount) {
            maxCount = colorBuckets[key];
            dominant = key;
          }
        }

        if (dominant) {
          const [dr, dg, db] = dominant.split(',').map(Number);
          applyColor(dr, dg, db);
        } else {
          hashColor(heroImg.src);
        }
      } catch (e) {
        
        hashColor(heroImg.src);
      }
    }

    if (heroImg.complete && heroImg.naturalWidth > 0) {
      extractColor();
    } else {
      heroImg.addEventListener('load', extractColor);
      heroImg.addEventListener('error', () => {
        hashColor(heroImg.src);
      });
    }
  }, 150);
};

function _formatPlayCount(num) {
  if (!num || isNaN(num)) return '';
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return num.toLocaleString();
  return String(num);
}

function getSongPageHTML(songId) {
  let song = getSongById(songId);
  if (!song) {
    song = (typeof SONGS !== 'undefined' && SONGS.length > 0) ? SONGS[0] : {
      id: songId,
      title: 'Song',
      artist: 'Unknown Artist',
      album: 'Single',
      img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
      duration: '3:30'
    };
  }

  normalizeSongFields(song);
  const isLiked = state.likedSongs && state.likedSongs.includes(song.id);
  const rawArtistStr = song.artist || 'Unknown Artist';
  const artistList = rawArtistStr
    .split(/,|&|\bfeat\.?|\bft\.?/i)
    .map(a => a.trim())
    .filter(Boolean);
  if (artistList.length === 0) artistList.push('Unknown Artist');

  const albumName = song.album || 'Single';
  const songYear = song.year || new Date().getFullYear();
  const songDuration = song.duration || '3:30';
  const playCount = song.playCount || song.plays || '';
  const formattedPlays = _formatPlayCount(playCount);

  
  function _getInitialArtistImg(artName) {
    if (typeof ARTISTS !== 'undefined' && Array.isArray(ARTISTS)) {
      const foundArtist = ARTISTS.find(a => 
        a.name.toLowerCase() === artName.toLowerCase() ||
        a.id.toLowerCase() === artName.toLowerCase() ||
        artName.toLowerCase().includes(a.name.toLowerCase()) ||
        a.name.toLowerCase().includes(artName.toLowerCase())
      );
      if (foundArtist && (foundArtist.img || foundArtist.image)) {
        return foundArtist.img || foundArtist.image;
      }
    }
    if (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') {
      const cached = RESOLVED_ARTISTS_CACHE.get(artName.toLowerCase());
      if (cached && cached.img) {
        return cached.img;
      }
    }
    if (typeof FOLLOWED_ARTISTS_DATA !== 'undefined') {
      const followed = FOLLOWED_ARTISTS_DATA.get(artName) || FOLLOWED_ARTISTS_DATA.get(artName.toLowerCase());
      if (followed && followed.img) {
        return followed.img;
      }
    }
    if (song && (song.img || song.thumb)) {
      return song.img || song.thumb;
    }
    return (typeof window.getArtistFallbackImage === 'function') 
      ? window.getArtistFallbackImage(artName, 300) 
      : 'https://i.scdn.co/image/ab67616100005174adfb0b2df04b77e43b5f7375';
  }

  const primaryArtistImg = _getInitialArtistImg(artistList[0]);

  
  const allSongs = typeof SONGS !== 'undefined' ? SONGS : [];
  const primaryArtist = artistList[0];
  const artistSongs = allSongs.filter(s => s.artist.toLowerCase().includes(primaryArtist.toLowerCase()) && String(s.id) !== String(song.id)).slice(0, 5);
  const recommendedSongs = artistSongs.length >= 2 ? artistSongs : allSongs.filter(s => String(s.id) !== String(song.id)).slice(0, 5);

  
  function _fakePlayCount(s) {
    const hash = String(s.id || s.title || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const base = (hash % 900 + 100) * 1000;
    return base.toLocaleString();
  }

  
  setTimeout(async () => {
    artistList.forEach(async (art, aIdx) => {
      const _artistCardAvatar = document.getElementById(`sp-song-artist-card-avatar-${aIdx}`);
      const _artistCardName = document.getElementById(`sp-song-artist-card-name-${aIdx}`);
      const _artistCardListeners = document.getElementById(`sp-song-artist-card-listeners-${aIdx}`);
      if (!_artistCardAvatar) return;

      try {
        if (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getArtistData) {
          const spData = await SPOTIFY_API.getArtistData(art).catch(() => null);
          if (spData && spData.img) {
            if (_artistCardAvatar) _artistCardAvatar.src = spData.img;
            
            if (aIdx === 0) {
              const heroSubAvatar = document.querySelector('.sp-song-artist-avatar');
              if (heroSubAvatar) {
                heroSubAvatar.src = spData.img;
                heroSubAvatar.style.display = 'inline-block';
              }
            }
            if (spData.name) {
              const matchedName = (typeof SPOTIFY_API !== 'undefined' && SPOTIFY_API.getMatchingArtistName)
                ? SPOTIFY_API.getMatchingArtistName(spData.name, art)
                : spData.name;
              if (_artistCardName) _artistCardName.textContent = matchedName;
            }
            if (spData.followers && _artistCardListeners) {
              const cleanCount = spData.followers
                .replace(/\s*monthly\s*listeners/gi, '')
                .replace(/\s*spotify\s*followers/gi, '')
                .replace(/\s*followers/gi, '')
                .trim();
              _artistCardListeners.textContent = cleanCount + ' monthly listeners';
            }
            
            if (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') {
              RESOLVED_ARTISTS_CACHE.set(art.toLowerCase(), {
                id: art,
                name: spData.name || art,
                img: spData.img
              });
            }
            
            if (typeof saveFollowedArtistData === 'function' && state.followedArtists.includes(art)) {
              saveFollowedArtistData(art, {
                id: art,
                name: spData.name || art,
                img: spData.img,
                listeners: spData.followers || '',
                sub: 'Artist'
              });
            }
          } else {
            
            if (_artistCardListeners) {
              _artistCardListeners.textContent = 'Independent Artist';
            }
          }
        }
      } catch (e) {
        console.warn(`Song page artist [${art}] card Spotify fetch error:`, e);
      }
    });

    if (typeof renderSongDetailLyricsCard === 'function') {
      renderSongDetailLyricsCard(song);
    }
  }, 100);

  setTimeout(attachSongScrollListener, 60);

  return `
    <div class="sp-song-page-container">
      
      <div id="sp-song-sticky-bar" class="sp-song-sticky-bar">
        <button class="sp-song-sticky-play-btn" onclick="playSpecificSong('${song.id}')" title="Play ${song.title}">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>
        </button>
        <span class="sp-song-sticky-title">${song.title}</span>
      </div>

      
      <div class="sp-song-hero-bg" id="sp-song-hero-bg">
        <div class="sp-song-hero">
          <div class="sp-song-cover-wrap">
            <img src="${song.img || song.thumb}" alt="${song.title}" class="sp-song-hero-img" id="sp-song-hero-cover" crossorigin="anonymous" onerror="this.removeAttribute('crossorigin'); this.onerror=null; this.src='https://placehold.co/300x300/121212/1ed760?text=Music';">
          </div>
          <div class="sp-song-hero-meta">
            <span class="sp-song-hero-tag">Song</span>
            <h1 class="${(song.title && song.title.length > 35) ? 'sp-song-hero-title title-long' : ((song.title && song.title.length > 20) ? 'sp-song-hero-title title-medium' : 'sp-song-hero-title')}">${song.title}</h1>
            <div class="sp-song-hero-sub">
              <img src="${primaryArtistImg}" alt="${artistList[0]}" class="sp-song-artist-avatar" onerror="this.style.display='none'">
              ${artistList.map((art, idx) => `
                <span class="sp-song-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${art.replace(/'/g, "\\'")}')">${art}</span>${idx < artistList.length - 1 ? '<span class="sp-song-artist-comma">, </span>' : ''}
              `).join('')}
              <span class="sp-song-dot">•</span>
              <span>${albumName}</span>
              <span class="sp-song-dot">•</span>
              <span>${songYear}</span>
              <span class="sp-song-dot">•</span>
              <span>${songDuration}</span>
              ${formattedPlays ? `<span class="sp-song-dot">•</span><span>${formattedPlays}</span>` : ''}
            </div>
          </div>
        </div>
      </div>

      
      <div class="sp-song-action-bar-wrap">
        <div class="sp-song-action-bar">
          <button class="sp-song-play-big-btn" onclick="playSpecificSong('${song.id}')" title="Play ${song.title}">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="sp-song-shuffle-btn" onclick="if(typeof toggleShuffle==='function') toggleShuffle();" title="Shuffle">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
          </button>
          <button class="sp-song-like-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${song.id}', event)" title="${isLiked ? 'Remove from Liked' : 'Save to Liked'}">
            <svg viewBox="0 0 24 24" fill="${isLiked ? '#1ed760' : 'none'}" stroke="${isLiked ? '#1ed760' : 'currentColor'}" stroke-width="2" width="24" height="24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </button>
          <button class="sp-song-download-btn" onclick="event.stopPropagation();" title="Download">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          </button>
          <button class="sp-song-more-btn" onclick="event.stopPropagation();" title="More options">
            <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          </button>
        </div>
      </div>

      
      <div class="sp-song-body">

        
        <div class="sp-song-lyrics-card-wrap" id="sp-song-page-lyrics-wrapper" style="display:none;"></div>

        
        <div class="sp-song-artists-wrapper">
          ${artistList.map((art, aIdx) => {
            const isFollowed = (typeof isArtistFollowed === 'function') ? isArtistFollowed(art) : (state.followedArtists && state.followedArtists.includes(art));
            const initialImg = _getInitialArtistImg(art);
            return `
              <div class="sp-song-artist-card-enhanced" id="sp-song-artist-card-${aIdx}">
                <div class="sp-song-artist-card-left" onclick="navigateToArtistByName('${art.replace(/'/g, "\\\'")}')">
                  <img id="sp-song-artist-card-avatar-${aIdx}" src="${initialImg}" alt="${art}" class="sp-song-artist-card-img" onerror="this.onerror=null; this.src=window.getArtistFallbackImage('${art.replace(/'/g, "\\'")}', 300);">
                  <div class="sp-song-artist-card-info">
                    <span class="sp-song-artist-card-label">Artist</span>
                    <span class="sp-song-artist-card-name" id="sp-song-artist-card-name-${aIdx}">${art}</span>
                    <span class="sp-song-artist-card-listeners" id="sp-song-artist-card-listeners-${aIdx}"></span>
                  </div>
                </div>
                <button class="sp-song-artist-follow-btn ${isFollowed ? 'following' : ''}" 
                        data-follow-id="${art}" 
                        onclick="event.stopPropagation(); toggleFollow('${art.replace(/'/g, "\\\\'")}', { name: document.getElementById('sp-song-artist-card-name-${aIdx}')?.textContent || '${art.replace(/'/g, "\\\\'")}', img: document.getElementById('sp-song-artist-card-avatar-${aIdx}')?.src || '', listeners: document.getElementById('sp-song-artist-card-listeners-${aIdx}')?.textContent || '' })">
                  ${isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>
            `;
          }).join('')}
        </div>

        
        ${recommendedSongs.length > 0 ? `
          <div class="sp-song-section">
            <div class="sp-song-section-header">
              <h2 class="sp-song-section-title">Recommended</h2>
              <p class="sp-song-section-subtitle">Based on this song</p>
            </div>
            <div class="sp-song-rec-list">
              ${recommendedSongs.map((rSong, idx) => {
                normalizeSongFields(rSong);
                const rArtistList = (rSong.artist || 'Unknown Artist').split(/,|&|\bfeat\.?|\bft\.?/i).map(a => a.trim()).filter(Boolean);
                return `
                <div class="sp-song-rec-row" onclick="playSpecificSong('${rSong.id}')">
                  <div class="sp-song-rec-thumb-wrap">
                    <img src="${rSong.thumb || rSong.img}" alt="${rSong.title}" class="sp-song-rec-thumb" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/100x100/121212/1ed760?text=Music';">
                    <div class="sp-song-rec-thumb-overlay">
                      <svg viewBox="0 0 24 24" fill="#ffffff" width="16" height="16"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                  <div class="sp-song-rec-meta">
                    <span class="sp-song-rec-title">${rSong.title}</span>
                    <span class="sp-song-rec-artist">
                      ${rArtistList.map(a => `<a onclick="event.stopPropagation(); navigateToArtistByName('${a.replace(/'/g, "\\\\'")}')">${a}</a>`).join(', ')}
                    </span>
                  </div>
                  <span class="sp-song-rec-plays">${_fakePlayCount(rSong)}</span>
                  <span class="sp-song-rec-duration">${rSong.duration || '3:30'}</span>
                </div>
              `}).join('')}
            </div>
          </div>
        ` : ''}

        ${getFooterHTML()}
      </div>
    </div>
  `;
}

function getMonthlyTopTracks(limit = 50) {
  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const history = (state.listeningHistory || []).filter(item => (now - item.timestamp) <= ONE_MONTH_MS);

  const songMap = new Map();
  history.forEach(item => {
    if (!item.song) return;
    const sId = item.songId || item.song.id;
    if (!songMap.has(sId)) {
      songMap.set(sId, { song: item.song, count: 0 });
    }
    songMap.get(sId).count++;
  });

  let sorted = Array.from(songMap.values()).sort((a, b) => b.count - a.count).map(entry => entry.song);

  if (sorted.length < limit) {
    const fallbackSongs = (state.recentSongs && state.recentSongs.length > 0) ? state.recentSongs : (typeof SONGS !== 'undefined' ? SONGS : []);
    fallbackSongs.forEach(song => {
      if (sorted.length >= limit) return;
      if (!sorted.some(s => s.id === song.id)) {
        sorted.push(song);
      }
    });
  }

  return sorted.slice(0, limit);
}

function getMonthlyTopArtists(limit = 3) {
  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  const history = (state.listeningHistory || []).filter(item => (now - item.timestamp) <= ONE_MONTH_MS);

  const artistMap = new Map();
  history.forEach(item => {
    const name = item.artist || (item.song && item.song.artist);
    if (!name) return;
    if (!artistMap.has(name)) {
      let img = (item.song && (item.song.img || item.song.thumb)) || window.getArtistFallbackImage(name, 300);
      if (typeof ARTISTS !== 'undefined') {
        const found = ARTISTS.find(a => a.name.toLowerCase() === name.toLowerCase());
        if (found && (found.img || found.image)) img = found.img || found.image;
      }
      artistMap.set(name, { name: name, img: img, count: 0 });
    }
    artistMap.get(name).count++;
  });

  let sorted = Array.from(artistMap.values()).sort((a, b) => b.count - a.count);

  if (sorted.length < limit && typeof ARTISTS !== 'undefined') {
    ARTISTS.forEach(art => {
      if (sorted.length >= limit) return;
      if (!sorted.some(a => a.name.toLowerCase() === art.name.toLowerCase())) {
        sorted.push({ name: art.name, img: art.img || art.image, count: 1 });
      }
    });
  }

  return sorted.slice(0, limit);
}

window.navigateToArtistByName = function(artistName) {
  if (!artistName) return;
  const cleanName = artistName.trim();
  if (typeof openArtistPage === 'function') {
    openArtistPage(cleanName);
    return;
  }
  navigateTo('artist', null, cleanName);
};

window.playArtistTopSongs = function(artistName) {
  if (typeof SONGS === 'undefined') return;
  const artistSongs = SONGS.filter(s => s.artist.toLowerCase().includes(artistName.toLowerCase()));
  if (artistSongs.length > 0) {
    state.queue = [...artistSongs];
    playSong(0);
  }
};

function getTopTracksPageHTML() {
  const topTracks = getMonthlyTopTracks(50);
  
  const rowsHtml = topTracks.map((song, index) => {
    normalizeSongFields(song);
    const isLiked = state.likedSongs && state.likedSongs.includes(song.id);
    return `
      <div class="sp-top-track-full-row" onclick="playSpecificSong('${song.id}')">
        <div class="sp-top-track-num">${index + 1}</div>
        <div class="sp-top-track-main">
          <img src="${song.thumb || song.img}" alt="${song.title}" class="sp-top-track-thumb" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/100x100/121212/1ed760?text=Music';">
          <div class="sp-top-track-meta">
            <span class="sp-top-track-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${song.id}');" title="${song.title}">${song.title}</span>
            <span class="sp-top-track-artist card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || '').replace(/'/g, "\\'")}');" title="${song.artist}">${song.artist}</span>
          </div>
        </div>
        <div class="sp-top-track-album">${song.album || 'Single'}</div>
        <div class="sp-top-track-right">
          ${isLiked ? `
            <div class="sp-top-track-liked-icon" title="Liked">
              <svg viewBox="0 0 24 24" fill="#1ed760" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            </div>
          ` : ''}
          <span class="sp-top-track-time">${song.duration || '3:30'}</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="sp-top-tracks-container" style="padding: 16px 0 40px;">
      <div class="sp-top-tracks-header" style="margin-bottom: 24px;">
        <h1 style="font-size: 36px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.5px;">Top tracks this month</h1>
        <p style="font-size: 14px; color: var(--text-muted); margin: 0; font-weight: 500;">Only visible to you</p>
      </div>

      <div class="sp-top-tracks-table-head">
        <div class="sp-top-track-num">#</div>
        <div class="sp-top-track-main">Title</div>
        <div class="sp-top-track-album">Album</div>
        <div class="sp-top-track-right">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style="color: #b3b3b3;"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        </div>
      </div>

      <div class="sp-top-tracks-full-list">
        ${rowsHtml}
      </div>

      ${getFooterHTML()}
    </div>
  `;
}

function attachProfileScrollListener() {
  const mainView = document.getElementById('main-view') || window;
  const stickyBar = document.getElementById('sp-profile-sticky-bar');
  if (!stickyBar) return;

  const onScroll = () => {
    const scrollY = (mainView === window) ? window.scrollY : mainView.scrollTop;
    if (scrollY > 160) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  };

  if (mainView === window) {
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    mainView.addEventListener('scroll', onScroll, { passive: true });
  }
}
window.attachProfileScrollListener = attachProfileScrollListener;

function getPlaylistCoverMarkup(pl) {
  if (!pl) {
    return `<div class="sp-profile-pl-empty-art"><div class="sp-profile-pl-empty-icon"><svg viewBox="0 0 24 24" width="26" height="26" fill="#a855f7"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg></div><span class="sp-profile-pl-empty-tag">Playlist</span></div>`;
  }

  // 1. Custom Image
  if (pl.customImg) {
    return `<img src="${pl.customImg}" alt="${pl.name || pl.title || 'Playlist'}" loading="lazy">`;
  }

  // 2. Check if pl.cover or pl.img is valid and not a placeholder
  if (pl.img && !pl.img.includes('placehold.co') && !pl.img.includes('photo-1511671782779-c97d3d27a1d4')) {
    return `<img src="${pl.img}" alt="${pl.name || pl.title || 'Playlist'}" loading="lazy" onerror="this.outerHTML='<div class=\\'sp-profile-pl-empty-art\\'><div class=\\'sp-profile-pl-empty-icon\\'><svg viewBox=\\'0 0 24 24\\' width=\\'26\\' height=\\'26\\' fill=\\'#a855f7\\'><path d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/></svg></div><span class=\\'sp-profile-pl-empty-tag\\'>Playlist</span></div>'">`;
  }
  if (pl.cover && !pl.cover.includes('placehold.co') && !pl.cover.includes('photo-1511671782779-c97d3d27a1d4')) {
    return `<img src="${pl.cover}" alt="${pl.name || pl.title || 'Playlist'}" loading="lazy" onerror="this.outerHTML='<div class=\\'sp-profile-pl-empty-art\\'><div class=\\'sp-profile-pl-empty-icon\\'><svg viewBox=\\'0 0 24 24\\' width=\\'26\\' height=\\'26\\' fill=\\'#a855f7\\'><path d=\\'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z\\'/></svg></div><span class=\\'sp-profile-pl-empty-tag\\'>Playlist</span></div>'">`;
  }

  // 3. Check if playlist has songs
  const rawSongs = pl.songs || [];
  if (rawSongs.length > 0) {
    let firstSong = null;
    if (typeof rawSongs[0] === 'object' && rawSongs[0]) {
      firstSong = rawSongs[0];
    } else if (typeof getSongById === 'function') {
      firstSong = getSongById(rawSongs[0]);
    } else if (typeof SONGS !== 'undefined') {
      firstSong = SONGS.find(s => s.id === rawSongs[0]);
    }
    if (firstSong && (firstSong.img || firstSong.thumb)) {
      return `<img src="${firstSong.img || firstSong.thumb}" alt="${pl.name || pl.title || 'Playlist'}" loading="lazy">`;
    }
  }

  // 4. Default Stylish Wave Gradient Artwork
  return `
    <div class="sp-profile-pl-empty-art">
      <div class="sp-profile-pl-empty-icon">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="#a855f7">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      <span class="sp-profile-pl-empty-tag">Playlist</span>
    </div>
  `;
}

function resolveFollowedArtist(id) {
  if (!id) return null;
  if (typeof id === 'object' && id.name) return id;
  
  let found = null;
  if (typeof getFollowedArtistData === 'function') found = getFollowedArtistData(id);
  if (!found && typeof RESOLVED_ARTISTS_CACHE !== 'undefined' && RESOLVED_ARTISTS_CACHE.has(id)) {
    found = RESOLVED_ARTISTS_CACHE.get(id);
  }
  if (!found && typeof ARTISTS !== 'undefined') {
    found = ARTISTS.find(a => a.id === id || a.name.toLowerCase() === String(id).toLowerCase());
  }
  if (!found) {
    const cleanName = String(id).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    let artistSongImg = null;
    if (typeof SONGS !== 'undefined') {
      const s = SONGS.find(song => song.artist && song.artist.toLowerCase().includes(cleanName.toLowerCase()));
      if (s) artistSongImg = s.img || s.thumb;
    }
    found = {
      id: id,
      name: cleanName,
      img: artistSongImg || window.getArtistFallbackImage(cleanName, 300)
    };
  }
  return found;
}

function getProfilePageHTML() {
  const userName = (state.userProfile && state.userProfile.name) ? state.userProfile.name : (localStorage.getItem('wave_user_name') || 'User');
  const userImg = (state.userProfile && state.userProfile.avatar) || localStorage.getItem('wave_user_img');

  const userPlaylists = (state.userPlaylists && state.userPlaylists.length > 0) ? state.userPlaylists : ((state.playlists && Array.isArray(state.playlists)) ? state.playlists : []);
  const playlistsCount = userPlaylists.length;

  const likedSongs = (state.likedSongs && Array.isArray(state.likedSongs)) ? state.likedSongs : [];
  const likedSongsCount = likedSongs.length;

  const followedArtists = (state.followedArtists && Array.isArray(state.followedArtists)) ? state.followedArtists : [];
  const followedCount = followedArtists.length;

  let followedArtistsList = [];
  if (followedCount > 0) {
    followedArtistsList = followedArtists.map(id => resolveFollowedArtist(id)).filter(Boolean);
  }

  const topArtists = getMonthlyTopArtists(6);
  const top4Tracks = getMonthlyTopTracks(5);

  const userInitial = (userName.charAt(0) || 'U').toUpperCase();

  const avatarHtml = userImg
    ? `<img src="${userImg}" alt="${userName}" class="sp-profile-header-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <div class="sp-profile-header-svg" style="display:none; font-size:3.5rem; font-weight:800; color:#cbd5e1;">${userInitial}</div>`
    : `<div class="sp-profile-header-svg"><span style="font-size:3.5rem; font-weight:800; color:#cbd5e1; font-family:sans-serif;">${userInitial}</span></div>`;

  setTimeout(attachProfileScrollListener, 60);

  return `
    <div class="sp-profile-container">
      
      <div class="sp-profile-sticky-bar" id="sp-profile-sticky-bar">
        <div class="sp-profile-sticky-left">
          ${userImg ? `<img src="${userImg}" class="sp-profile-sticky-avatar" alt="${userName}">` : `<div style="width:34px; height:34px; border-radius:50%; background:#2e2e38; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px;">${userInitial}</div>`}
          <span class="sp-profile-sticky-name">${userName}</span>
        </div>
        <button class="sp-profile-btn sp-profile-btn-primary" style="padding: 6px 16px; font-size: 0.8rem;" onclick="openProfileModal()">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Edit
        </button>
      </div>

      
      <div class="sp-profile-hero">
        <div class="sp-profile-avatar-wrap" onclick="openProfileModal()" title="Click to choose or change profile photo">
          ${avatarHtml}
          <div class="sp-profile-avatar-hover">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            <span>Change photo</span>
          </div>
        </div>

        <div class="sp-profile-header-info">
          <div class="sp-profile-badge-pill">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
            Verified Free Account
          </div>
          <h1 class="sp-profile-name" onclick="openProfileModal()" title="Click to edit profile details">${userName}</h1>
          <div class="sp-profile-sub-meta">
            <span>${playlistsCount} Public Playlist${playlistsCount === 1 ? '' : 's'}</span>
            <span class="dot">•</span>
            <span>${likedSongsCount} Liked Tracks</span>
            <span class="dot">•</span>
            <span>${followedCount} Following</span>
            <span class="dot">•</span>
            <span style="color: #1ed760; font-weight: 700;">100% Free &amp; Ad-Free</span>
          </div>
        </div>
      </div>

      
      <div class="sp-profile-action-bar">
        <button class="sp-profile-btn sp-profile-btn-primary" onclick="openProfileModal()">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Edit Profile
        </button>
        <button class="sp-profile-btn sp-profile-btn-secondary" onclick="navigateTo('settings', event)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
        <button class="sp-profile-btn sp-profile-btn-secondary" onclick="navigateTo('wavedna', event)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>
          Wave DNA
        </button>
        <button class="sp-profile-btn sp-profile-btn-secondary" onclick="if(navigator.clipboard){navigator.clipboard.writeText(window.location.href); if(typeof showToast==='function') showToast('Profile link copied to clipboard!','success');}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Share
        </button>
        <button class="sp-profile-btn sp-profile-btn-danger" onclick="if(confirm('Are you sure you want to reset and log out?')){localStorage.removeItem('wave_user_name'); localStorage.removeItem('wave_user_img'); location.reload();}">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Log Out
        </button>
      </div>

      
      <div class="sp-profile-stats-grid">
        <div class="sp-profile-stat-card" onclick="navigateTo('liked', event)">
          <div class="sp-profile-stat-icon-wrap" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <div>
            <div class="sp-profile-stat-val">${likedSongsCount}</div>
            <div class="sp-profile-stat-lbl">Liked Songs</div>
          </div>
        </div>

        <div class="sp-profile-stat-card" onclick="navigateTo('library', event)">
          <div class="sp-profile-stat-icon-wrap" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div>
            <div class="sp-profile-stat-val">${playlistsCount}</div>
            <div class="sp-profile-stat-lbl">Created Playlists</div>
          </div>
        </div>

        <div class="sp-profile-stat-card" onclick="navigateTo('library', event)">
          <div class="sp-profile-stat-icon-wrap" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div class="sp-profile-stat-val">${followedCount}</div>
            <div class="sp-profile-stat-lbl">Artists Following</div>
          </div>
        </div>

        <div class="sp-profile-stat-card" onclick="navigateTo('wavedna', event)">
          <div class="sp-profile-stat-icon-wrap" style="background: rgba(30, 215, 96, 0.15); color: #1ed760;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <div class="sp-profile-stat-val">Wave DNA</div>
            <div class="sp-profile-stat-lbl">Music Personality</div>
          </div>
        </div>
      </div>

      
      <div class="sp-account-overview-card">
        <div class="sp-account-overview-title">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1ed760" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Account Status &amp; Streaming Engine
        </div>
        <div class="sp-account-grid">
          <div class="sp-account-item">
            <div class="sp-account-item-icon" style="background:rgba(30,215,96,0.15); color:#1ed760;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <div>
              <h4>320 kbps Studio Master</h4>
              <p>Direct JioSaavn audio streaming with instant playback and zero delay.</p>
            </div>
          </div>

          <div class="sp-account-item">
            <div class="sp-account-item-icon" style="background:rgba(59,130,246,0.15); color:#3b82f6;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <h4>Always Free &amp; Open</h4>
              <p>No subscriptions, no forced ads, and unrestricted skip permissions.</p>
            </div>
          </div>

          <div class="sp-account-item">
            <div class="sp-account-item-icon" style="background:rgba(168,85,247,0.15); color:#a855f7;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
            </div>
            <div>
              <h4>Local-First Privacy</h4>
              <p>History, likes, and playlists remain saved on your device in secure IndexedDB.</p>
            </div>
          </div>
        </div>
      </div>

      
      <div class="sp-profile-section">
        <div class="sp-profile-sec-header">
          <div>
            <h2 class="sp-profile-sec-title">Top artists this month</h2>
            <p class="sp-profile-sec-sub">Based on your recent listening sessions</p>
          </div>
        </div>
        <div class="sp-profile-cards-grid">
          ${topArtists.map(artist => `
            <div class="sp-profile-follow-card" onclick="navigateToArtistByName('${artist.name.replace(/'/g, "\\'")}')">
              <div class="sp-profile-follow-art">
                <img src="${artist.img}" alt="${artist.name}" loading="lazy" onerror="this.onerror=null; this.src=window.getArtistFallbackImage('${artist.name.replace(/'/g, "\\'")}', 300);">
                <button class="sp-profile-follow-play-btn" onclick="event.stopPropagation(); playArtistTopSongs('${artist.name.replace(/'/g, "\\'")}')" title="Play ${artist.name}">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
              <h3 class="sp-profile-follow-name" title="${artist.name}">${artist.name}</h3>
              <p class="sp-profile-follow-role">Artist</p>
            </div>
          `).join('')}
        </div>
      </div>

      
      <div class="sp-profile-section">
        <div class="sp-profile-sec-header">
          <div>
            <h2 class="sp-profile-sec-title">Top tracks this month</h2>
            <p class="sp-profile-sec-sub">Only visible to you</p>
          </div>
          <a href="#" onclick="navigateTo('top-tracks', event)" class="sp-profile-show-all-link">Show all</a>
        </div>
        <div class="sp-top-tracks-list">
          ${top4Tracks.map((song, index) => {
            normalizeSongFields(song);
            const isLiked = state.likedSongs && state.likedSongs.includes(song.id);
            return `
              <div class="sp-top-track-row" onclick="playSpecificSong('${song.id}')">
                <div class="sp-top-track-num">${index + 1}</div>
                <div class="sp-top-track-main">
                  <img src="${song.thumb || song.img}" alt="${song.title}" class="sp-top-track-thumb" loading="lazy" onerror="this.onerror=null; this.src=window.getSongFallbackImage('${song.title ? song.title.replace(/'/g, "\\'") : 'Song'}', 300);">
                  <div class="sp-top-track-meta">
                    <span class="sp-top-track-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${song.id}');" title="${song.title}">${song.title}</span>
                    <span class="sp-top-track-artist card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || '').replace(/'/g, "\\'")}');" title="${song.artist}">${song.artist}</span>
                  </div>
                </div>
                <div class="sp-top-track-album">${song.album || 'Single'}</div>
                <div class="sp-top-track-right">
                  ${isLiked ? `
                    <div class="sp-top-track-liked-icon" title="Liked">
                      <svg viewBox="0 0 24 24" fill="#1ed760" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    </div>
                  ` : ''}
                  <span class="sp-top-track-time">${song.duration || '3:30'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      
      <div class="sp-profile-section">
        <div class="sp-profile-sec-header">
          <div>
            <h2 class="sp-profile-sec-title">Public Playlists</h2>
            <p class="sp-profile-sec-sub">Your customized collections</p>
          </div>
          ${playlistsCount > 0 ? `<span style="font-size: 0.85rem; font-weight: 700; color: #94a3b8;">${playlistsCount} Playlist${playlistsCount === 1 ? '' : 's'}</span>` : ''}
        </div>
        ${playlistsCount === 0 
          ? `<div class="sp-profile-empty-box">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              <p>No public playlists created yet.</p>
              <button class="sp-profile-btn sp-profile-btn-primary" style="margin-top: 8px;" onclick="if(typeof openCreatePlaylistModal==='function') openCreatePlaylistModal(); else if(typeof createNewPlaylist==='function') createNewPlaylist(); else alert('Click + in the sidebar to create a playlist');">Create Playlist</button>
            </div>`
          : `<div class="sp-profile-cards-grid">
              ${userPlaylists.map(pl => {
                const plId = pl.id;
                const plTitle = pl.title || pl.name || 'My Playlist';
                const plSongCount = (pl.songs && pl.songs.length) ? `${pl.songs.length} track${pl.songs.length === 1 ? '' : 's'}` : 'Playlist';
                return `
                  <div class="sp-profile-playlist-card" onclick="navigateTo('playlist', event, '${plId}')">
                    <div class="sp-profile-pl-art">
                      ${getPlaylistCoverMarkup(pl)}
                      <button class="sp-profile-pl-play-btn" onclick="event.stopPropagation(); playAllPlaylistSongs('${plId}');" title="Play ${plTitle}">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                    <div class="sp-profile-pl-info">
                      <h3 class="sp-profile-pl-title" title="${plTitle}">${plTitle}</h3>
                      <p class="sp-profile-pl-sub">${plSongCount} • By ${pl.creator || userName}</p>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>`
        }
      </div>

      
      <div class="sp-profile-section">
        <div class="sp-profile-sec-header">
          <div>
            <h2 class="sp-profile-sec-title">Following</h2>
            <p class="sp-profile-sec-sub">Artists you are tracking</p>
          </div>
          ${followedCount > 0 ? `<a href="#" onclick="navigateTo('library', event)" class="sp-profile-show-all-link">Show all (${followedCount})</a>` : ''}
        </div>
        ${followedCount === 0
          ? `<div class="sp-profile-empty-box">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#94a3b8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <p>You aren't following any artists yet.</p>
              <button class="sp-profile-btn sp-profile-btn-secondary" style="margin-top: 8px;" onclick="navigateTo('search', event)">Discover Artists</button>
            </div>`
          : `<div class="sp-profile-cards-grid">
              ${followedArtistsList.map(art => {
                const artId = art.id || art.name;
                const artName = art.name || artId;
                const artImg = art.img || art.image || window.getArtistFallbackImage(artName, 300);
                return `
                  <div class="sp-profile-follow-card" onclick="navigateToArtistByName('${artName.replace(/'/g, "\\'")}')">
                    <div class="sp-profile-follow-art">
                      <img src="${artImg}" alt="${artName}" loading="lazy" onerror="this.onerror=null; this.src=window.getArtistFallbackImage('${artName.replace(/'/g, "\\'")}', 300);">
                      <button class="sp-profile-follow-play-btn" onclick="event.stopPropagation(); playArtistTopSongs('${artName.replace(/'/g, "\\'")}')" title="Play ${artName}">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                    </div>
                    <h3 class="sp-profile-follow-name" title="${artName}">${artName}</h3>
                    <p class="sp-profile-follow-role">Artist</p>
                  </div>
                `;
              }).join('')}
            </div>`
        }
      </div>

      ${getFooterHTML()}
    </div>
  `;
}

function getCurSessionId() {
  let sid = sessionStorage.getItem('wave_session_id');
  if (!sid) {
    sid = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    sessionStorage.setItem('wave_session_id', sid);
  }
  return sid;
}

function recordListeningHistory(song, context = {}) {
  if (!song) return;

  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days Auto-Delete Limit

  if (!state.listeningHistory) state.listeningHistory = [];

  // 1. Purge items older than 30 days (1 month) automatically from history
  state.listeningHistory = state.listeningHistory.filter(item => (now - item.timestamp) <= ONE_MONTH_MS);

  // Avoid inserting exact duplicate within 3 seconds
  if (state.listeningHistory.length > 0 && state.listeningHistory[0].songId === song.id && (now - state.listeningHistory[0].timestamp) < 3000) {
    return;
  }

  const historyItem = {
    id: 'rec_' + now + '_' + Math.random().toString(36).substr(2, 4),
    sessionId: getCurSessionId(),
    songId: song.id,
    song: song,
    timestamp: now,
    contextType: context.type || (song.album ? 'album' : 'session'),
    contextTitle: context.title || song.album || song.title,
    contextImg: context.img || song.img || song.thumb,
    artist: song.artist || 'Artist',
    playlistOwner: context.owner || (localStorage.getItem('wave_user_name') || 'Mohd Asif')
  };

  state.listeningHistory.unshift(historyItem);
  saveUserState();
}

function getRecentsPageHTML() {
  const now = Date.now();
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; 
  
  
  if (state.listeningHistory) {
    state.listeningHistory = state.listeningHistory.filter(item => (now - item.timestamp) <= ONE_MONTH_MS);
  }

  let history = state.listeningHistory || [];

  if (history.length === 0) {
    const sampleSongs = (state.recentSongs && state.recentSongs.length > 0) ? state.recentSongs : (cloudData.songs && cloudData.songs.length > 0 ? cloudData.songs.slice(0, 6) : SONGS.slice(0, 6));
    const currSess = getCurSessionId();
    history = [
      { id: 's1_1', sessionId: currSess, songId: sampleSongs[0].id, song: sampleSongs[0], timestamp: now, contextType: 'album', contextTitle: sampleSongs[0].album || sampleSongs[0].title, contextImg: sampleSongs[0].img || sampleSongs[0].thumb, artist: sampleSongs[0].artist },
      { id: 's1_2', sessionId: currSess, songId: sampleSongs[1]?.id || sampleSongs[0].id, song: sampleSongs[1] || sampleSongs[0], timestamp: now - 300000, contextType: 'album', contextTitle: sampleSongs[0].album || sampleSongs[0].title, contextImg: sampleSongs[1]?.img || sampleSongs[0].img, artist: sampleSongs[1]?.artist || sampleSongs[0].artist },
      { id: 's2_1', sessionId: 'sess_prev_sample', songId: sampleSongs[2]?.id || sampleSongs[0].id, song: sampleSongs[2] || sampleSongs[0], timestamp: now - 86400000, contextType: 'playlist', contextTitle: 'English song', contextImg: sampleSongs[2]?.img || sampleSongs[0].img, artist: sampleSongs[2]?.artist || sampleSongs[0].artist, playlistOwner: localStorage.getItem('wave_user_name') || 'Mohd Asif' },
      { id: 's2_2', sessionId: 'sess_prev_sample', songId: sampleSongs[3]?.id || sampleSongs[0].id, song: sampleSongs[3] || sampleSongs[0], timestamp: now - 86400000 - 300000, contextType: 'playlist', contextTitle: 'English song', contextImg: sampleSongs[3]?.img || sampleSongs[0].img, artist: sampleSongs[3]?.artist || sampleSongs[0].artist, playlistOwner: localStorage.getItem('wave_user_name') || 'Mohd Asif' }
    ];
  }

  const groupedByDate = {};
  history.forEach(item => {
    const label = formatHistoryDate(item.timestamp);
    if (!groupedByDate[label]) groupedByDate[label] = [];
    groupedByDate[label].push(item);
  });

  let dateSectionsHtml = '';

  Object.keys(groupedByDate).forEach(dateLabel => {
    const dateItems = groupedByDate[dateLabel];
    const entryGroups = groupConsecutiveContexts(dateItems);

    dateSectionsHtml += `
      <div class="sp-recents-date-group">
        <h2 class="sp-recents-date-title">${dateLabel}</h2>
        <div class="sp-recents-items-list">
          ${entryGroups.map(entry => renderRecentsEntryRow(entry)).join('')}
        </div>
      </div>
    `;
  });

  return `
    <div class="sp-recents-container">
      <h1 class="sp-recents-main-title">Recents</h1>
      ${dateSectionsHtml}
      ${getFooterHTML()}
    </div>
  `;
}

function formatHistoryDate(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  }
}

function groupConsecutiveContexts(items) {
  const entries = [];
  const sessionMap = new Map();

  items.forEach(item => {
    const sId = item.sessionId || ('sess_' + item.timestamp);
    if (!sessionMap.has(sId)) {
      sessionMap.set(sId, []);
    }
    sessionMap.get(sId).push(item);
  });

  sessionMap.forEach((sessionItems, sId) => {
    if (sessionItems.length === 0) return;

    const mainItem = sessionItems[sessionItems.length - 1];
    const mainSong = mainItem.song;

    const allSongs = sessionItems.map(si => si.song);
    const count = allSongs.length;
    const hasDropdown = count > 1;

    entries.push({
      groupId: 'grp_' + sId,
      contextType: mainItem.contextType || 'session',
      contextTitle: mainItem.contextTitle || mainSong.title,
      contextImg: mainItem.contextImg || mainSong.img || mainSong.thumb,
      artist: mainItem.artist || mainSong.artist,
      playlistOwner: mainItem.playlistOwner || (localStorage.getItem('wave_user_name') || 'Mohd Asif'),
      count: count,
      mainSong: mainSong,
      songs: allSongs,
      hasDropdown: hasDropdown
    });
  });

  return entries;
}

function renderRecentsEntryRow(entry) {
  let subText = '';
  if (entry.count > 1) {
    if (entry.contextType === 'playlist') {
      subText = `${entry.count} songs played • Playlist • ${entry.playlistOwner}`;
    } else if (entry.contextType === 'album') {
      subText = `Album • ${entry.artist} • ${entry.count} songs played`;
    } else {
      subText = `${entry.count} songs played • Session • ${entry.artist}`;
    }
  } else {
    if (entry.contextType === 'album') {
      subText = `Album • ${entry.artist} • 1 song played`;
    } else if (entry.contextType === 'podcast') {
      subText = `Episode • ${entry.artist}`;
    } else {
      subText = `Track • ${entry.artist}`;
    }
  }

  const chevronHtml = entry.hasDropdown
    ? `<button class="sp-recents-chevron-btn" onclick="toggleRecentsAccordion('${entry.groupId}', event)" aria-label="Toggle tracks list">
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
       </button>`
    : `<button class="sp-recents-dots-btn" onclick="event.stopPropagation(); alert('Options for ${entry.contextTitle.replace(/'/g, "\\'")}')" aria-label="More options">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
       </button>`;

  return `
    <div class="sp-recents-item-wrap">
      <div class="sp-recents-row" onclick="playSpecificSong('${entry.mainSong.id}')">
        <div class="sp-recents-left">
          <img src="${entry.contextImg}" alt="${entry.contextTitle}" class="sp-recents-thumb" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
          <div class="sp-recents-meta">
            <span class="sp-recents-item-title">${entry.contextTitle}</span>
            <span class="sp-recents-item-sub">${subText}</span>
          </div>
        </div>
        <div class="sp-recents-right" onclick="event.stopPropagation()">
          ${chevronHtml}
        </div>
      </div>

      ${entry.hasDropdown ? `
        <div class="sp-recents-accordion" id="acc_${entry.groupId}">
          ${entry.songs.map(song => `
            <div class="sp-recents-subtrack" onclick="playSpecificSong('${song.id}')">
              <div class="sp-recents-subtrack-left">
                <img src="${song.img || song.thumb || entry.contextImg}" alt="${song.title}" class="sp-recents-subtrack-thumb" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                <div class="sp-recents-subtrack-info">
                  <span class="sp-recents-subtrack-title">${song.title}</span>
                  <span class="sp-recents-subtrack-artist">${song.artist}</span>
                </div>
              </div>
              <button class="sp-recents-dots-btn" onclick="event.stopPropagation(); alert('Options for ${song.title.replace(/'/g, "\\'")}')" aria-label="More options">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
              </button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

window.toggleRecentsAccordion = function(groupId, event) {
  if (event) event.stopPropagation();
  const acc = document.getElementById('acc_' + groupId);
  const btn = event.currentTarget;

  if (acc) {
    acc.classList.toggle('open');
    if (btn) btn.classList.toggle('open');
  }
};

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

      artistSongs.forEach(rs => {
        if (addedCount < TARGET) {
          const rsNorm = norm(rs.title);
          if (rs.audioUrl && !addedIds.has(rs.id) && !addedTitles.has(rsNorm)) {
            addedIds.add(rs.id);
            addedTitles.add(rsNorm);
            if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
            state.queue.push(rs);
            addedCount++;
          }
        }
      });

      genreSongs.forEach(rs => {
        if (addedCount < TARGET) {
          const rsNorm = norm(rs.title);
          if (rs.audioUrl && !addedIds.has(rs.id) && !addedTitles.has(rsNorm)) {
            addedIds.add(rs.id);
            addedTitles.add(rsNorm);
            if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
            state.queue.push(rs);
            addedCount++;
          }
        }
      });
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

function getNotificationsPageHTML(param) {
  if (typeof markAllNotificationsAsRead === 'function') {
    markAllNotificationsAsRead();
  }
  const notifs = (typeof cloudData !== 'undefined' && cloudData && cloudData.notifications) ? cloudData.notifications : [];

  const filterPage = (cat) => {
    if (!cat || cat === 'all') return notifs;
    if (cat === 'music') return notifs.filter(n => (n.category === 'music' || n.type === 'song') && n.category !== 'podcasts');
    if (cat === 'podcasts') return notifs.filter(n => n.category === 'podcasts' || (n.album && n.album.toLowerCase().includes('podcast')));
    return notifs;
  };

  const currentNotifs = filterPage(param);

  const notifRowsHtml = currentNotifs.map(n => {
    const thumb = n.thumb || 'https://placehold.co/200x200/1f1f1f/1ed760?text=♪';
    const typeLabel = n.album || (n.category === 'podcasts' ? 'Episode' : 'Single');
    const timeLabel = '1 day ago';
    const playOnClick = n.songId ? `playSpecificSong('${n.songId}')` : (n.message ? `alert('${(n.title||'').replace(/'/g, "\\'")}: ${(n.message||'').replace(/'/g, "\\'")}');` : '');

    return `
      <div class="sp-notif-item-row" onclick="${playOnClick}">
        <div class="sp-notif-item-left">
          <img src="${thumb}" alt="${n.title}" class="sp-notif-item-img" onerror="this.onerror=null; this.src='https://placehold.co/200x200/1f1f1f/1ed760?text=♪';">
          <div class="sp-notif-item-body">
            <h3 class="sp-notif-item-title">${n.title}</h3>
            <div class="sp-notif-item-artist">${n.artist || 'Wave Music'}</div>
            <div class="sp-notif-item-meta">${typeLabel} • ${timeLabel}</div>
            ${n.message ? `<div class="sp-notif-item-desc">${n.message}</div>` : ''}
          </div>
        </div>

        <div class="sp-notif-item-actions">
          <button class="sp-notif-action-add" title="Save to Library" onclick="event.stopPropagation(); if('${n.songId}') toggleLikeSong('${n.songId}');">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button class="sp-notif-action-play" title="Play ${n.title}" onclick="event.stopPropagation(); ${playOnClick}">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="sp-notif-page-container">
      <div class="sp-notif-page-header">
        <h1>What's New</h1>
        <p class="sp-notif-page-sub">The latest releases from artists, podcasts and shows you follow.</p>
      </div>

      <div class="sp-notif-pills">
        <button class="notif-filter-pill ${!param || param === 'all' ? 'active' : ''}" onclick="navigateTo('notifications', event, 'all')">Music</button>
        <button class="notif-filter-pill ${param === 'podcasts' ? 'active' : ''}" onclick="navigateTo('notifications', event, 'podcasts')">Podcast & Shows</button>
      </div>

      <h2 class="sp-notif-section-title">Earlier</h2>

      <div class="sp-notif-list-full">
        ${notifRowsHtml || '<div style="padding:40px 0; color:var(--text-muted); font-size:14px;">No releases found in this category.</div>'}
      </div>
    </div>
  `;
}

function getLyricsPageHTML() {
  const currentSong = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
    ? state.queue[state.currentIndex]
    : null;

  return `
    <div class="sp-lyrics-page-view" id="sp-lyrics-page-view">
      <div class="sp-lyrics-page-header">
        <div class="sp-lyrics-page-header-info">
          <span class="sp-lyrics-page-badge">LYRICS</span>
        </div>
        <div class="sp-lyrics-page-header-right">
          <button class="sp-lyrics-page-fullscreen-btn" onclick="openLyricsModal()" title="Full screen" aria-label="Full screen">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M6.53 9.47a.75.75 0 0 1 0 1.06l-2.72 2.72h1.018a.75.75 0 0 1 0 1.5H1.25v-3.579a.75.75 0 0 1 1.5 0v1.018l2.72-2.72a.75.75 0 0 1 1.06 0zm2.94-2.94a.75.75 0 0 1 0-1.06l2.72-2.72h-1.018a.75.75 0 1 1 0-1.5h3.578v3.579a.75.75 0 0 1-1.5 0V3.81l-2.72 2.72a.75.75 0 0 1-1.06 0z"/>
            </svg>
          </button>
        </div>
      </div>

      <div class="sp-lyrics-page-lines-container" id="sp-lyrics-page-lines-container">
        <div class="sp-lyrics-loading-state">
          <div class="sp-lyrics-spinner"></div>
          <p>Loading lyrics...</p>
        </div>
      </div>

      
      <button class="sp-lyrics-sync-btn" id="sp-lyrics-page-sync-btn" onclick="syncLyricsToActiveLine(event)" title="Sync to currently playing line" aria-label="Sync">
        <svg class="sp-sync-icon" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M4 10h2v4H4zm4-4h2v12H8zm4-2h2v16h-2zm4 4h2v12h-2zm4 4h2v4h-2z"/>
        </svg>
        <span>Sync</span>
      </button>
    </div>
  `;
}
window.getLyricsPageHTML = getLyricsPageHTML;
