'use strict';

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

window.handleSearchDropdownSongClick = function(songId, event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');

  const songIdStr = String(songId);
  const sg = (typeof getSongById === 'function' ? getSongById(songIdStr) : null) || (typeof SONGS !== 'undefined' ? SONGS.find(x => String(x.id) === songIdStr) : null);
  if (sg) {
    saveRecentSearch({
      title: sg.title || 'Song',
      subtitle: `Song • ${sg.artist || 'Unknown'}`,
      img: sg.thumb || sg.img || 'https://placehold.co/100x100/181818/1ed760?text=Music',
      type: 'Song',
      songId: songIdStr
    });
    if (typeof playJioSaavnSong === 'function') {
      playJioSaavnSong(sg);
    }
  }
  if (typeof navigateTo === 'function') {
    navigateTo('song', event, songIdStr);
  }
};

window.handleSearchDropdownPlayClick = function(songId, event) {
  if (event) event.stopPropagation();
  const songIdStr = String(songId);
  const sg = (typeof getSongById === 'function' ? getSongById(songIdStr) : null) || (typeof SONGS !== 'undefined' ? SONGS.find(x => String(x.id) === songIdStr) : null);
  if (sg && typeof playJioSaavnSong === 'function') {
    playJioSaavnSong(sg);
  }
};

window.handleSearchDropdownPlaylistClick = function(playlistId, event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');

  const plIdStr = String(playlistId);
  const pl = (typeof getPlaylistById === 'function' ? getPlaylistById(plIdStr) : null) || (typeof PLAYLISTS !== 'undefined' ? PLAYLISTS.find(p => String(p.id) === plIdStr) : null);
  if (pl) {
    saveRecentSearch({
      title: pl.title || 'Playlist',
      subtitle: pl.subtitle || 'Playlist',
      img: pl.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100',
      type: pl.isAlbum ? 'Album' : 'Playlist',
      playlistId: plIdStr
    });
  }
  if (typeof setPlaylistViewMode === 'function') setPlaylistViewMode('full', plIdStr);
  if (typeof navigateTo === 'function') navigateTo('playlist', event, plIdStr);
};

window.handleSearchDropdownArtistClick = function(artistName, event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  if (typeof navigateToArtistByName === 'function') {
    navigateToArtistByName(artistName);
  }
};

window.handleMobSearchResultClick = function(songId, event) {
  if (event) event.stopPropagation();
  const songIdStr = String(songId);
  const sg = (typeof getSongById === 'function' ? getSongById(songIdStr) : null) || (typeof SONGS !== 'undefined' ? SONGS.find(x => String(x.id) === songIdStr) : null);
  if (sg) {
    saveRecentSearch({
      title: sg.title || 'Song',
      subtitle: `Song • ${sg.artist || 'Artist'}`,
      img: sg.img || sg.thumb || 'https://placehold.co/100x100/181818/1ed760?text=Music',
      type: 'Song',
      songId: songIdStr
    });
  }
  if (typeof playSpecificSong === 'function') {
    playSpecificSong(songIdStr);
  } else if (sg && typeof playJioSaavnSong === 'function') {
    playJioSaavnSong(sg);
  }
};

function saveRecentSearch(item) {
  if (!item || !item.title) return;
  let recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
  
  if (item.type === 'Artist') {
    if (!item.artistName && item.title && !/^\d+$/.test(item.title)) item.artistName = item.title;
    if (!item.artistId || /^\d+$/.test(String(item.artistId))) {
      item.artistId = item.artistName || item.title;
    }
  }

  const existingIdx = recents.findIndex(r => (
    (r.title && item.title && r.title.toLowerCase() === item.title.toLowerCase()) ||
    (r.artistId && item.artistId && String(r.artistId).toLowerCase() === String(item.artistId).toLowerCase())
  ));

  if (existingIdx > -1) {
    recents.splice(existingIdx, 1);
  }

  recents.unshift(item);
  if (recents.length > 8) recents.length = 8;

  try {
    localStorage.setItem('wave_recent_searches', JSON.stringify(recents));
  } catch (e) {}
}

function clearRecentSearches(e) {
  if (e) e.stopPropagation();
  localStorage.removeItem('wave_recent_searches');
  renderEmptySearchDropdown();
}

function clearSearchInput(e) {
  if (e) e.stopPropagation();
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear-btn');
  const shortcuts = document.getElementById('search-shortcuts');
  
  if (input) input.value = '';
  if (clearBtn) clearBtn.classList.add('hidden');
  if (shortcuts) shortcuts.classList.remove('hidden');

  renderEmptySearchDropdown();
}

function renderEmptySearchDropdown() {
  const dropdown = document.getElementById('search-dropdown');
  if (!dropdown) return;

  let recents = [];
  try {
    recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
    let modified = false;
    recents.forEach(r => {
      if (r.type === 'Artist') {
        if (!r.artistName && r.title && !/^\d+$/.test(r.title)) r.artistName = r.title;
        if (!r.artistId || /^\d+$/.test(String(r.artistId))) {
          if (r.artistName || (r.title && !/^\d+$/.test(r.title))) {
            r.artistId = r.artistName || r.title;
            modified = true;
          }
        }
      }
    });
    if (modified) {
      localStorage.setItem('wave_recent_searches', JSON.stringify(recents));
    }
  } catch (e) {
    recents = [];
  }

  if (recents.length > 0) {
    let html = `
      <div style="font-size:16px; font-weight:800; color:#ffffff; padding: 5px 0px 10px 10px;">Recent searches</div>
      <div style="display:flex; flex-direction:column; gap:4px;">
    `;

    recents.forEach((item, idx) => {
      const isArtist = item.type === 'Artist';
      const borderRadius = isArtist ? '50%' : '4px';
      const safeImg = escapeAttr(item.img || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100');
      const safeTitle = escapeHtml(item.title || 'Music');
      const safeSubtitle = escapeHtml(item.subtitle || 'Song');
      html += `
        <div class="search-item" onclick="onRecentSearchClick('${idx}', event)">
          <div class="search-item-left">
            <img src="${safeImg}" alt="${escapeAttr(item.title || '')}" loading="lazy" decoding="async" style="width: 44px; height: 44px; object-fit: cover; flex-shrink: 0; border-radius: ${borderRadius};">
            <div class="search-item-info">
              <h4>${safeTitle}</h4>
              <p>${safeSubtitle}</p>
            </div>
          </div>
          <button class="sp-search-plus-btn" title="Add to Library" onclick="event.stopPropagation();">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 14h-2v-3H8v-2h3V8h2v3h3v2h-3v3z"/></svg>
          </button>
        </div>
      `;
    });

    html += `
      </div>
      <button class="sp-clear-recents-btn" onclick="clearRecentSearches(event)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        Clear recent searches
      </button>
    `;
    dropdown.innerHTML = html;
  } else {
    dropdown.innerHTML = '';
    dropdown.classList.add('hidden');
    return;
  }

  dropdown.classList.remove('hidden');
}

window.onRecentSearchClick = function(idxStr, event) {
  if (event) event.stopPropagation();
  const recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
  const item = recents[parseInt(idxStr, 10)];
  if (!item) return;

  const dropdown = document.getElementById('search-dropdown');
  if (item.playlistId || item.type === 'Playlist' || item.type === 'Album') {
    const plId = item.playlistId || item.id;
    if (plId) {
      if (typeof setPlaylistViewMode === 'function') setPlaylistViewMode('full', plId);
      navigateTo('playlist', event, plId);
      return;
    }
  }

  if (item.songId) {
    const sg = typeof getSongById === 'function' ? getSongById(item.songId) : null;
    if (sg) playJioSaavnSong(sg);
    navigateTo('song', event, item.songId);
  } else if (item.type === 'Artist' || item.artistId || item.artistName) {
    const targetName = item.artistName || item.title || item.artistId;
    if (targetName && targetName !== 'Artist' && !/^\d+$/.test(targetName)) {
      const artObj = {
        id: targetName,
        name: targetName,
        img: item.img || ''
      };
      RESOLVED_ARTISTS_CACHE.set(targetName.toLowerCase(), artObj);
      navigateTo('artist', null, targetName);
    } else if (item.title) {
      selectSuggestedQuery(item.title);
    }
  } else {
    selectSuggestedQuery(item.title);
  }
};

window.selectSuggestedQuery = function(query) {
  const input = document.getElementById('search-input');
  if (input) input.value = query;
  const mobileInput = document.getElementById('mobile-search-input');
  if (mobileInput) mobileInput.value = query;

  const dropdown = document.getElementById('search-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  const mobileDropdown = document.getElementById('mobile-search-dropdown');
  if (mobileDropdown) mobileDropdown.classList.add('hidden');

  navigateTo('search', null, query);
  showSearchResults(query);
};

function handleSearchFocus(e) {
  const term = e.target.value.toLowerCase().trim();
  if (!term) {
    renderEmptySearchDropdown();
  } else {
    handleSearch(e);
  }
}

function resolveSearchPlaylists(term) {
  if (!term || term.trim().length < 1) return [];
  const termLower = term.toLowerCase().trim();

  const allPlaylists = [
    ...(state.customPlaylists || []),
    ...(state.ostAlbums || []),
    ...((typeof cloudData !== 'undefined' && cloudData.playlists) || []),
    ...((typeof cloudData !== 'undefined' && cloudData.albums) || []),
    ...(state.userPlaylists || []),
    ...(state.playlists || [])
  ];

  const matched = [];
  const seenIds = new Set();

  for (const pl of allPlaylists) {
    if (!pl) continue;
    const plId = String(pl.id || '');
    if (!plId || seenIds.has(plId)) continue;

    const name = String(pl.name || pl.title || '').toLowerCase();
    const desc = String(pl.description || '').toLowerCase();
    const artist = String(pl.artist || '').toLowerCase();
    const category = String(pl.category || '').toLowerCase();

    const matches = name.includes(termLower) || 
                    desc.includes(termLower) || 
                    artist.includes(termLower) || 
                    category.includes(termLower) ||
                    (Array.isArray(pl.tags) && pl.tags.some(t => String(t).toLowerCase().includes(termLower))) ||
                    (Array.isArray(pl.songs) && pl.songs.some(s => {
                      const st = (typeof s === 'object' ? s.title : '') || '';
                      const sa = (typeof s === 'object' ? s.artist : '') || '';
                      return st.toLowerCase().includes(termLower) || sa.toLowerCase().includes(termLower);
                    }));

    if (matches) {
      seenIds.add(plId);
      const isAlbum = pl.isAlbum || pl.category === 'ost' || pl.category === 'album' || String(pl.id).startsWith('alb-');
      const songCount = Array.isArray(pl.songs) ? pl.songs.length : 0;
      
      let coverImg = pl.img || pl.customImg || '';
      if (!coverImg && Array.isArray(pl.songs) && pl.songs.length > 0) {
        const firstS = pl.songs[0];
        coverImg = (typeof firstS === 'object' ? (firstS.thumb || firstS.img) : '') || '';
      }
      if (!coverImg) {
        coverImg = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300';
      }

      matched.push({
        id: plId,
        title: pl.name || pl.title || (isAlbum ? 'Album' : 'Playlist'),
        subtitle: isAlbum ? (pl.artist ? `Album • ${pl.artist}` : `Album • ${songCount} songs`) : `Playlist • ${songCount} songs`,
        img: coverImg,
        isAlbum: isAlbum,
        songs: pl.songs || [],
        type: isAlbum ? 'Album' : 'Playlist'
      });
    }
  }

  return matched;
}

async function resolveSearchArtists(term, apiSongs = []) {
  const termLower = (term || '').toLowerCase().trim();
  if (!termLower || termLower.length < 2) return [];

  
  const isGenreOrKeyword = /\b(songs?|music|hits?|beats?|classics?|romantic|love|lofi|lo-fi|workout|gym|sleep|rain|party|club|trending|trends?|dance|mashup|soundtracks?|hindi|english|punjabi|kpop|k-pop|drama|anime|osts?|naats?|islamic|sufi|coke\s*studio|edm|rock|retro|90s|acoustic|relaxing|chill|devotional|podcast|podcasts|top|charts?|fresh|releases?|best|popular)\b/i.test(termLower);
  if (isGenreOrKeyword) return [];

  
  const words = termLower.split(/\s+/).filter(Boolean);
  if (words.length > 3) return [];

  const foundArtists = [];
  const addedNames = new Set();

  function addArtist(name, img = '', id = '') {
    if (!name) return;
    const clean = name.trim();
    if (!clean || clean.toLowerCase() === 'artist' || /^\d+$/.test(clean)) return;
    const key = clean.toLowerCase();
    if (addedNames.has(key)) return;
    addedNames.add(key);

    const safeImg = img || (typeof window.getArtistFallbackImage === 'function' ? window.getArtistFallbackImage(clean, 500) : '');
    foundArtists.push({
      id: id || clean,
      name: clean,
      img: safeImg,
      sub: 'Artist',
      listeners: '1,500,000 Monthly Listeners'
    });
  }

  
  if (typeof ARTISTS !== 'undefined' && Array.isArray(ARTISTS)) {
    ARTISTS.forEach(a => {
      if (a.name && (a.name.toLowerCase().includes(termLower) || termLower.includes(a.name.toLowerCase()))) {
        addArtist(a.name, a.img || a.image, a.id);
      }
    });
  }

  
  if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.artists)) {
    cloudData.artists.forEach(a => {
      if (a.name && (a.name.toLowerCase().includes(termLower) || termLower.includes(a.name.toLowerCase()))) {
        addArtist(a.name, a.img || a.image, a.id);
      }
    });
  }

  
  try {
    if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchArtists) {
      const jioResults = await JIOSAAVN_API.searchArtists(term).catch(() => []);
      if (Array.isArray(jioResults)) {
        jioResults.slice(0, 4).forEach(r => {
          if (r && r.name) addArtist(r.name, r.img, r.id);
        });
      }
    }
  } catch (e) {}

  
  if (Array.isArray(apiSongs) && foundArtists.length < 3) {
    apiSongs.forEach(song => {
      if (song && song.artist) {
        const parts = song.artist.split(/,|&|\bfeat\.?|\bft\.?/i).map(p => p.trim()).filter(Boolean);
        parts.forEach(p => {
          if (p.toLowerCase().includes(termLower) || termLower.includes(p.toLowerCase())) {
            addArtist(p, song.thumb || song.img);
          }
        });
      }
    });
  }

  
  foundArtists.forEach(a => {
    if (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') {
      RESOLVED_ARTISTS_CACHE.set(String(a.id).toLowerCase(), a);
      RESOLVED_ARTISTS_CACHE.set(a.name.toLowerCase(), a);
    }
  });

  return foundArtists;
}

function handleSearch(e) {
  clearTimeout(searchTimeout);
  const val = e.target.value;
  const term = val.toLowerCase().trim();
  const parentContainer = e.target.closest('.sp-search-bar') || e.target.closest('.search-container');
  const dropdown = parentContainer ? parentContainer.querySelector('.search-dropdown') : document.getElementById('search-dropdown');
  const clearBtn = document.getElementById('search-clear-btn');
  const shortcuts = document.getElementById('search-shortcuts');

  if (!term) {
    if (clearBtn) clearBtn.classList.add('hidden');
    if (shortcuts) shortcuts.classList.remove('hidden');
    renderEmptySearchDropdown();
    return;
  }

  if (clearBtn) clearBtn.classList.remove('hidden');
  if (shortcuts) shortcuts.classList.add('hidden');

  
  if (dropdown) {
    dropdown.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; padding:6px 0;">
        <div style="display:flex; align-items:center; gap:12px; padding:6px 12px;">
          <div class="sp-skel-shimmer" style="width:44px; height:44px; border-radius:50%; flex-shrink:0;"></div>
          <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
            <div class="sp-skel-shimmer" style="width:50%; height:14px;"></div>
            <div class="sp-skel-shimmer" style="width:30%; height:11px;"></div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px; padding:6px 12px;">
          <div class="sp-skel-shimmer" style="width:44px; height:44px; border-radius:4px; flex-shrink:0;"></div>
          <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
            <div class="sp-skel-shimmer" style="width:65%; height:14px;"></div>
            <div class="sp-skel-shimmer" style="width:40%; height:11px;"></div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:12px; padding:6px 12px;">
          <div class="sp-skel-shimmer" style="width:44px; height:44px; border-radius:4px; flex-shrink:0;"></div>
          <div style="display:flex; flex-direction:column; gap:6px; flex:1;">
            <div class="sp-skel-shimmer" style="width:55%; height:14px;"></div>
            <div class="sp-skel-shimmer" style="width:35%; height:11px;"></div>
          </div>
        </div>
      </div>
    `;
    dropdown.classList.remove('hidden');
  }

  searchTimeout = setTimeout(async () => {
    try {
      let html = '';
      const termLower = term.toLowerCase();

      
      const matchedPlaylists = resolveSearchPlaylists(term);
      if (matchedPlaylists.length > 0) {
        matchedPlaylists.slice(0, 2).forEach(pl => {
          const safePlTitle = escapeHtml(pl.title || 'Playlist');
          const safePlSub = escapeHtml(pl.subtitle || 'Playlist');
          const safePlImg = escapeAttr(pl.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100');
          const safePlId = escapeAttr(String(pl.id));
          const plType = pl.isAlbum ? 'Album' : 'Playlist';

          html += `
            <div class="search-item playlist-search-item" onclick="handleSearchDropdownPlaylistClick('${safePlId}', event)">
              <div class="search-item-left">
                <div class="search-item-thumb-wrap" onclick="event.stopPropagation(); playAllPlaylistSongs('${safePlId}');" title="Play ${escapeAttr(pl.title || '')}">
                  <img src="${safePlImg}" alt="${escapeAttr(pl.title || '')}" style="border-radius: 4px;" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Playlist';">
                  <div class="search-item-play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="search-item-info">
                  <h4 class="search-item-title">${safePlTitle}</h4>
                  <p class="search-item-sub">${safePlSub}</p>
                </div>
              </div>
              <button class="sp-search-plus-btn" title="Play ${plType}" onclick="event.stopPropagation(); playAllPlaylistSongs('${safePlId}');">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
              </button>
            </div>
          `;
        });
      }

      
      const cloudMatches = SONGS.filter(s => {
        const t = (s.title || '').toLowerCase();
        const a = (s.artist || '').toLowerCase();
        const alb = (s.album || '').toLowerCase();
        return t.includes(termLower) || a.includes(termLower) || alb.includes(termLower);
      });

      
      const apiResults = await handleJioSaavnSearch(term).catch(() => []);

      
      const allArtists = await resolveSearchArtists(term, [...cloudMatches, ...apiResults]);

      if (allArtists.length > 0) {
        const topArtists = allArtists.slice(0, 2);
        topArtists.forEach(a => {
          const safeArtistName = escapeHtml(a.name || 'Artist');
          const safeArtistImg = escapeAttr(a.img || 'https://placehold.co/100x100/181818/1ed760?text=Artist');
          const safeArtistId = escapeAttr(String(a.id || a.name || ''));
          const artistNameRawEsc = escapeAttr(a.name || '');
          html += `
            <div class="search-item artist-search-item" onclick="handleSearchDropdownArtistClick('${artistNameRawEsc}', event)">
              <div class="search-item-left">
                <div class="search-item-thumb-wrap artist-thumb-wrap" onclick="event.stopPropagation(); playArtistTopSongs('${artistNameRawEsc}')" title="Play ${escapeAttr(a.name || '')}">
                  <img src="${safeArtistImg}" alt="${escapeAttr(a.name || '')}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Artist';">
                  <div class="search-item-play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="search-item-info">
                  <h4 class="search-item-title card-artist-link" onclick="handleSearchDropdownArtistClick('${artistNameRawEsc}', event)">${safeArtistName} <svg class="verified-badge" viewBox="0 0 24 24" fill="#1ed760" width="16" height="16" style="display:inline-block; vertical-align:middle; margin-left:4px;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></h4>
                  <p class="search-item-sub">Artist</p>
                </div>
              </div>
              <button class="sp-artist-follow-btn" onclick="event.stopPropagation(); toggleFollow('${safeArtistId}'); this.textContent = this.textContent==='Follow'?'Following':'Follow';">Follow</button>
            </div>
          `;
        });
      }

      
      const combinedSongs = [];
      const addedKeys = new Set();

      cloudMatches.forEach(s => {
        const key = (s.title + '::' + s.artist).toLowerCase();
        addedKeys.add(key);
        addedKeys.add(String(s.id));
        combinedSongs.push(s);
      });

      (apiResults || []).forEach(s => {
        const key = (s.title + '::' + s.artist).toLowerCase();
        if (!addedKeys.has(key) && !addedKeys.has(String(s.id))) {
          addedKeys.add(key);
          addedKeys.add(String(s.id));
          combinedSongs.push(s);
        }
      });

      if (combinedSongs.length > 0) {
        combinedSongs.slice(0, 8).forEach((s) => {
          if (!SONGS.find(x => String(x.id) === String(s.id))) {
            SONGS.push(s);
          }
          const songId = String(s.id);
          const safeTitle = escapeHtml(s.title || 'Song');
          const safeArtist = escapeHtml(s.artist || 'Unknown');
          const safeImg = escapeAttr(s.thumb || s.img || 'https://placehold.co/100x100/181818/1ed760?text=Music');
          const safeSongId = escapeAttr(songId);
          const artistNameRawEsc = escapeAttr(s.artist || '');

          html += `
            <div class="search-item" onclick="handleSearchDropdownSongClick('${safeSongId}', event)">
              <div class="search-item-left">
                <div class="search-item-thumb-wrap" onclick="handleSearchDropdownPlayClick('${safeSongId}', event)" title="Play ${escapeAttr(s.title || '')}">
                  <img src="${safeImg}" alt="${escapeAttr(s.title || '')}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Music';">
                  <div class="search-item-play-overlay">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                <div class="search-item-info">
                  <h4 class="search-item-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${safeSongId}');">${safeTitle}</h4>
                  <p class="search-item-sub card-artist-link" onclick="handleSearchDropdownArtistClick('${artistNameRawEsc}', event)">Song • ${safeArtist}</p>
                </div>
              </div>
              <div class="search-item-actions">
                <button class="search-item-dots-btn" title="More options" onclick="event.stopPropagation(); showPlaylistSubmenu('${safeSongId}', event);">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
                <button class="sp-search-plus-btn" title="Add to Library" onclick="event.stopPropagation(); showPlaylistSubmenu('${safeSongId}', event);">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                </button>
              </div>
            </div>
          `;
        });

        
        const safeTermAttr = escapeAttr(term);
        const safeTermHtml = escapeHtml(term);
        html += `
          <div class="search-item see-all-search-item" style="padding:10px 14px; margin-top:6px; background:rgba(30,215,96,0.1); border:1px solid rgba(30,215,96,0.25); border-radius:8px; display:flex; align-items:center; justify-content:space-between; cursor:pointer; color:#1ed760; font-weight:700; font-size:13px;" onclick="event.stopPropagation(); const dd = this.closest('.search-dropdown'); if(dd) dd.classList.add('hidden'); navigateTo('search', event, '${safeTermAttr}'); showSearchResults('${safeTermAttr}');">
            <span style="display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              See all results for "<b>${safeTermHtml}</b>"
            </span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M5 13h11.86l-5.43 5.43 1.42 1.42L21.14 12l-8.29-7.85-1.42 1.42L16.86 11H5v2z"/></svg>
          </div>
        `;
      }

      if (dropdown) {
        if (!html || (combinedSongs.length === 0 && allArtists.length === 0)) {
          dropdown.innerHTML = `
            <div style="padding:24px 16px; text-align:center; color:#a7a7a7; font-size:13px;">
              No results found for "<b>${term}</b>"
            </div>
          `;
        } else {
          dropdown.innerHTML = html;
        }
        dropdown.classList.remove('hidden');
      }
    } catch (e) {
      console.error('Error inside searchTimeout:', e);
      if (dropdown) {
        dropdown.innerHTML = `<div style="padding:14px; color:#ff5555; text-align:center; font-size:13px;">Search error. Please try again.</div>`;
      }
    }
  }, 200);
}

document.addEventListener('click', function(e) {
  const searchWrap = document.getElementById('sp-search-bar-wrap');
  const dropdown = document.getElementById('search-dropdown');
  if (searchWrap && dropdown && !searchWrap.contains(e.target)) {
    dropdown.classList.add('hidden');
  }
});

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
    e.preventDefault();
    const input = document.getElementById('search-input');
    if (input) {
      input.focus();
      handleSearchFocus({ target: input });
    }
  }
});

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
    <div class="sp-search-skel-container">
      <div style="padding-top: ${isMobile ? '10' : '20'}px; margin-bottom: 24px;">
        ${isMobile ? '' : '<h1 style="font-size: 38px; font-weight: 800; letter-spacing: -1px; margin: 0 0 6px 0;">Search Results</h1>'}
        <div class="sp-skel-shimmer" style="width: 240px; height: 16px; border-radius: 4px;"></div>
      </div>

      
      <div class="sp-search-skel-hero">
        <div class="sp-skel-shimmer sp-search-skel-hero-img"></div>
        <div class="sp-search-skel-hero-info">
          <div class="sp-skel-shimmer sp-search-skel-line tag"></div>
          <div class="sp-skel-shimmer sp-search-skel-line title"></div>
          <div class="sp-skel-shimmer sp-search-skel-line sub"></div>
        </div>
      </div>

      
      <div style="margin-bottom: 32px;">
        <div class="sp-skel-shimmer" style="width: 120px; height: 22px; margin-bottom: 16px; border-radius: 4px;"></div>
        <div class="sp-search-skel-artist-grid">
          <div class="sp-search-skel-artist-card">
            <div class="sp-skel-shimmer sp-search-skel-avatar"></div>
            <div class="sp-skel-shimmer" style="width: 80px; height: 14px; border-radius: 4px;"></div>
          </div>
          <div class="sp-search-skel-artist-card">
            <div class="sp-skel-shimmer sp-search-skel-avatar"></div>
            <div class="sp-skel-shimmer" style="width: 90px; height: 14px; border-radius: 4px;"></div>
          </div>
          <div class="sp-search-skel-artist-card">
            <div class="sp-skel-shimmer sp-search-skel-avatar"></div>
            <div class="sp-skel-shimmer" style="width: 75px; height: 14px; border-radius: 4px;"></div>
          </div>
          <div class="sp-search-skel-artist-card">
            <div class="sp-skel-shimmer sp-search-skel-avatar"></div>
            <div class="sp-skel-shimmer" style="width: 85px; height: 14px; border-radius: 4px;"></div>
          </div>
        </div>
      </div>

      
      <div>
        <div class="sp-skel-shimmer" style="width: 100px; height: 22px; margin-bottom: 16px; border-radius: 4px;"></div>
        ${Array.from({ length: 6 }).map((_, i) => `
          <div class="sp-search-skel-row">
            <div class="sp-skel-shimmer sp-search-skel-num"></div>
            <div class="sp-skel-shimmer" style="width: 44px; height: 44px; border-radius: 4px; flex-shrink: 0;"></div>
            <div class="sp-search-skel-meta">
              <div class="sp-skel-shimmer" style="width: ${40 + (i % 3) * 15}%; height: 14px; border-radius: 4px;"></div>
              <div class="sp-skel-shimmer" style="width: ${25 + (i % 2) * 10}%; height: 11px; border-radius: 4px;"></div>
            </div>
            <div class="sp-skel-shimmer" style="width: 80px; height: 12px; border-radius: 4px;"></div>
            <div class="sp-skel-shimmer" style="width: 40px; height: 12px; border-radius: 4px;"></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const termLower = (query || '').toLowerCase().trim();
  const searchWords = termLower.split(/\s+/).filter(w => w.length >= 2);

  
  const localCloudMatches = SONGS.filter(s => {
    if (!s) return false;
    const t = (s.title || '').toLowerCase();
    const a = (s.artist || '').toLowerCase();
    const alb = (s.album || '').toLowerCase();
    const cat = (s.category || '').toLowerCase();
    const tags = Array.isArray(s.tags) ? s.tags.join(' ').toLowerCase() : '';
    
    if (t.includes(termLower) || a.includes(termLower) || alb.includes(termLower) || cat.includes(termLower) || tags.includes(termLower)) {
      return true;
    }
    return searchWords.some(w => (w.length >= 3 && !['song', 'songs', 'music', 'hits'].includes(w)) && (t.includes(w) || a.includes(w) || alb.includes(w) || tags.includes(w) || cat.includes(w)));
  });

  
  let jioSongs = [];
  try {
    if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs) {
      jioSongs = await JIOSAAVN_API.searchSongs(query, 30).catch(() => []);
      
      
      if ((!jioSongs || jioSongs.length === 0) && query.includes(' ')) {
        const simplified = query
          .replace(/\b(songs?|music|hits?|classics?|soundtracks?|exclusive)\b/gi, '')
          .trim();
        if (simplified && simplified.toLowerCase() !== query.toLowerCase()) {
          const res2 = await JIOSAAVN_API.searchSongs(simplified, 30).catch(() => []);
          if (res2 && res2.length > 0) jioSongs = res2;
        }
      }
      
      
      if (!jioSongs || jioSongs.length === 0) {
        const words = query.split(/\s+/).filter(w => w.length >= 3 && !['song', 'songs', 'music', 'hits', 'the', 'and', 'with'].includes(w.toLowerCase()));
        for (const w of words) {
          if (jioSongs && jioSongs.length > 0) break;
          const res3 = await JIOSAAVN_API.searchSongs(w, 25).catch(() => []);
          if (res3 && res3.length > 0) jioSongs = res3;
        }
      }
    }
  } catch (err) {
    console.warn('JioSaavn search query fallback error:', err);
  }

  const combinedSongs = [];
  const addedKeys = new Set();
  localCloudMatches.forEach(s => {
    const key = (s.title + '::' + s.artist).toLowerCase();
    addedKeys.add(key);
    addedKeys.add(String(s.id));
    combinedSongs.push(s);
  });
  (jioSongs || []).forEach(s => {
    const key = (s.title + '::' + s.artist).toLowerCase();
    if (!addedKeys.has(key) && !addedKeys.has(String(s.id))) {
      addedKeys.add(key);
      addedKeys.add(String(s.id));
      combinedSongs.push(s);
    }
  });

  window.apiSearchResults = combinedSongs;

  
  const dynamicArtists = await resolveSearchArtists(query, combinedSongs);

  
  const searchPlaylists = resolveSearchPlaylists(query);

  
  if (combinedSongs.length === 0 && dynamicArtists.length === 0 && searchPlaylists.length === 0) {
    target.innerHTML = `
      <div style="padding-top: ${isMobile ? '10' : '20'}px;">
        ${isMobile ? '' : '<h1 style="font-size: 38px; font-weight: 800; letter-spacing: -1px; margin: 0 0 8px 0;">Search Results</h1>'}
        
        <div class="sp-search-empty-state">
          <div class="sp-search-empty-icon">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h2 class="sp-search-empty-title">No results found for "${query}"</h2>
          <p class="sp-search-empty-sub">Please make sure your words are spelled correctly, or try exploring top artists and popular trending queries below.</p>
          <div class="sp-search-chips-wrap">
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Arijit Singh')">Arijit Singh</button>
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Diljit Dosanjh')">Diljit Dosanjh</button>
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Taylor Swift')">Taylor Swift</button>
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Bollywood Hits')">Bollywood Hits</button>
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Soulful Naats')">Soulful Naats</button>
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Lo-Fi Beats')">Lo-Fi Beats</button>
            <button class="sp-search-chip" onclick="selectSuggestedQuery('Alan Walker')">Alan Walker</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  
  let topResultHero = '';
  if (combinedSongs.length > 0) {
    const topSong = combinedSongs[0];
    if (typeof normalizeSongFields === 'function') normalizeSongFields(topSong);
    const topImg = topSong.img || topSong.thumb || 'https://placehold.co/300x300/181818/1ed760?text=Music';
    const topArtistFull = topSong.artist || 'Unknown Artist';
    const topArtist = topArtistFull.split(',')[0].trim();
    const topAlbum = topSong.album || 'Single';
    const topYear = topSong.year || new Date().getFullYear();
    const topDuration = topSong.duration || '3:30';
    const topPlays = topSong.playCount || topSong.plays || '';
    const formattedPlays = typeof _formatPlayCount === 'function' ? _formatPlayCount(topPlays) : '';

    
    let topArtistImg = topImg;
    if (dynamicArtists.length > 0 && dynamicArtists[0].img) {
      topArtistImg = dynamicArtists[0].img;
    } else if (typeof RESOLVED_ARTISTS_CACHE !== 'undefined') {
      const cached = RESOLVED_ARTISTS_CACHE.get(topArtist.toLowerCase());
      if (cached && cached.img) topArtistImg = cached.img;
    }

    const isLiked = state.likedSongs && state.likedSongs.includes(topSong.id);

    topResultHero = `
      <div class="sr-top-result-hero" id="sr-top-result-hero">
        <div class="sr-top-result-hero-inner">
          <div class="sr-top-cover-wrap">
            <img src="${topImg}" alt="${topSong.title}" class="sr-top-cover-img" id="sr-top-cover-img" crossorigin="anonymous" onerror="this.removeAttribute('crossorigin'); this.onerror=null; this.src='https://placehold.co/300x300/121212/1ed760?text=Music';">
          </div>
          <div class="sr-top-meta">
            <span class="sr-top-tag">Song</span>
            <span class="sr-top-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${topSong.id}');">${topSong.title}</span>
            <div class="sr-top-sub">
              <img src="${topArtistImg}" alt="${topArtist}" class="sr-top-artist-avatar" onerror="this.style.display='none'">
              <span class="sr-top-artist-link card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${topArtist.replace(/'/g, "\\'")}')">${topArtist}</span>
              <span class="sr-top-dot">•</span>
              <span>${topAlbum}</span>
              <span class="sr-top-dot">•</span>
              <span>${topYear}</span>
              <span class="sr-top-dot">•</span>
              <span>${topDuration}</span>
              ${formattedPlays ? `<span class="sr-top-dot">•</span><span>${formattedPlays}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="sr-top-actions">
          <button class="sr-top-play-btn" onclick="playJioSaavnSong(window.apiSearchResults[0]);" title="Play ${topSong.title}">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <button class="sr-top-action-btn" onclick="event.stopPropagation(); showPlaylistSubmenu('${topSong.id}', event);" title="Add to playlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </button>
          <button class="sr-top-action-btn" onclick="event.stopPropagation(); toggleLikeSong('${topSong.id}');" title="Like">
            <svg viewBox="0 0 24 24" fill="${isLiked ? '#1ed760' : 'none'}" stroke="${isLiked ? '#1ed760' : 'currentColor'}" stroke-width="2" width="22" height="22"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </button>
        </div>
      </div>
    `;
  }

  
  let jioSection = '';
  if (combinedSongs.length > 1) {
    const songsForList = combinedSongs.slice(1);
    const jioListHTML = songsForList.map((song, i) => {
      const songTitleSafe = escapeHtml(song.title || 'Song');
      const songArtistSafe = escapeHtml(song.artist || 'Unknown');
      const songThumb = escapeAttr(song.thumb || song.img || 'https://placehold.co/100x100/181818/1ed760?text=Music');
      const songIdSafe = escapeAttr(String(song.id));
      const songArtistRawEsc = escapeAttr(song.artist || '');

      return `
        <div class="list-row jiosaavn-row" onclick="playJioSaavnSong(window.apiSearchResults[${i + 1}]);">
          <div class="col-num">${i + 1}</div>
          <div class="col-title">
            <img src="${songThumb}" alt="${escapeAttr(song.title || '')}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Music';">
            <div>
              <h4 class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdSafe}');">${songTitleSafe}</h4>
              <p class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${songArtistRawEsc}');">${songArtistSafe}</p>
            </div>
          </div>
          <div class="col-album">${escapeHtml(song.album || 'Single')}</div>
          <div class="col-time">
            <span class="quality-tag">HD</span>
            ${escapeHtml(song.duration || '3:30')}
          </div>
        </div>
      `;
    }).join('');

    jioSection = `
      <div class="jiosaavn-badge-bar" style="margin-top: 10px;">
        <div class="jiosaavn-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          JioSaavn & Cloud • ${combinedSongs.length} tracks
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

  
  let playlistsSection = '';
  if (searchPlaylists.length > 0) {
    const plSlice = searchPlaylists.slice(0, 8);
    playlistsSection = `
      <div style="margin-bottom: 36px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Playlists & Albums</h2>
        <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
          ${plSlice.map(pl => {
            const plTitleEsc = (pl.title || 'Playlist').replace(/"/g, '&quot;');
            const plSubEsc = (pl.subtitle || 'Playlist').replace(/"/g, '&quot;');
            const plImg = pl.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300';
            return `
              <div class="sp-ml-card" onclick="if(typeof setPlaylistViewMode==='function') setPlaylistViewMode('full', '${pl.id}'); navigateTo('playlist', event, '${pl.id}')" style="cursor: pointer; min-width: 160px; max-width: 180px; flex-shrink: 0;">
                <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden; margin-bottom: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                  <img src="${plImg}" alt="${plTitleEsc}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/300x300/121212/1ed760?text=Playlist';">
                  <button class="sp-ml-play-btn" 
                          onclick="event.stopPropagation(); playAllPlaylistSongs('${pl.id}')" 
                          style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                          aria-label="Play ${plTitleEsc}">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="card-title-link" onclick="event.stopPropagation(); if(typeof setPlaylistViewMode==='function') setPlaylistViewMode('full', '${pl.id}'); navigateTo('playlist', event, '${pl.id}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px;" title="${plTitleEsc}">${pl.title}</div>
                <div style="font-size: 12px; color: #888888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${plSubEsc}">${pl.subtitle}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  
  let artistsSection = '';
  if (dynamicArtists.length > 0) {
    const artistSlice = dynamicArtists.slice(0, 6);
    artistsSection = `
      <div style="margin-bottom: 36px;">
        <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Artists</h2>
        <div style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px;">
          ${artistSlice.map(a => {
            const aAvatar = a.img || 'https://placehold.co/150x150/181818/1ed760?text=Artist';
            const aObjEsc = JSON.stringify(a).replace(/"/g, '&quot;');
            return `
              <div class="music-card artist-card" style="width: 150px; text-align: center; flex-shrink: 0; cursor: pointer;" onclick="openArtistPage(${aObjEsc}, event)">
                <div class="card-img-wrap" style="border-radius: 50%; width: 120px; height: 120px; margin: 0 auto 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.5);">
                  <img src="${aAvatar}" alt="${a.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.onerror=null; this.src='https://placehold.co/150x150/181818/1ed760?text=Artist';">
                </div>
                <div class="card-info" style="text-align: center;">
                  <h3 class="card-artist-link" style="font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px;">${a.name}</h3>
                  <p style="font-size: 12px; color: #888888;">Artist • Verified</p>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  target.innerHTML = `
    <div style="padding-top: ${isMobile ? '10' : '20'}px; margin-bottom: 24px;">
      ${isMobile ? '' : '<h1 style="font-size: 38px; font-weight: 800; letter-spacing: -1px; margin: 0 0 6px 0;">Search Results</h1>'}
      <p style="color: #888888; font-size: 14px; margin: 0;">Showing results for <span style="color:#ffffff; font-weight:600;">"${query}"</span></p>
    </div>

    ${topResultHero}
    <div class="sr-content-body">
      ${playlistsSection}
      ${artistsSection}
      ${jioSection ? `<h2 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Songs</h2>${jioSection}` : ''}
    </div>
  `;

  
  _applySearchHeroDynamicColor();
}

function _applySearchHeroDynamicColor() {
  setTimeout(() => {
    const heroImg = document.getElementById('sr-top-cover-img');
    const heroBg = document.getElementById('sr-top-result-hero');
    if (!heroImg || !heroBg) return;

    function applyColor(r, g, b) {
      const darken = 0.65;
      const fr = Math.round(r * darken);
      const fg = Math.round(g * darken);
      const fb = Math.round(b * darken);
      heroBg.style.background = `linear-gradient(180deg, rgb(${fr}, ${fg}, ${fb}) 0%, #121212 100%)`;
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
      heroImg.addEventListener('error', () => hashColor(heroImg.src));
    }
  }, 100);
}

function playAllSearchResults() {
  if (!window.apiSearchResults || window.apiSearchResults.length === 0) return;

  state.queue = [...window.apiSearchResults];
  state.currentIndex = 0;
  playSong(0);
}

const SPOTIFY_BROWSE_TILES = [
  { id: 'made_for_you', title: 'Made For You', color: '#845EC2', query: 'Top Hits For You', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { id: 'upcoming', title: 'Upcoming releases', color: '#00796B', query: 'New Trending Songs', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
  { id: 'new_releases', title: 'New Releases', color: '#689F38', query: 'New Releases 2026', img: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { id: 'rain_monsoon', title: 'Rain & Monsoon', color: '#1976D2', query: 'Monsoon Rain Songs', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300' },
  { id: 'hindi', title: 'Hindi', color: '#D81B60', query: 'Bollywood Hindi Hits', img: 'https://c.saavncdn.com/574/Jhol-English-2024-20250715210327-500x500.jpg' },
  { id: 'tamil', title: 'Tamil', color: '#E65100', query: 'Tamil Hits', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300' },
  { id: 'pop', title: 'Pop', color: '#455A64', query: 'Global Pop Hits', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS7d9cGQQNtSbmnkDodXDWlu0tcuCUPdhGsg&s' },
  { id: 'charts', title: 'Charts', color: '#512DA8', query: 'Top Songs Global', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
  { id: 'podcast_charts', title: 'Podcast Charts', color: '#1A237E', query: 'Top Podcast Talks', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300' },
  { id: 'podcast_new', title: 'Podcast New Releases', color: '#4A148C', query: 'Podcast Episodes', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300' },
  { id: 'punjabi', title: 'Punjabi Hits', color: '#F57C00', query: 'Punjabi Hits', img: 'https://i.scdn.co/image/ab6761610000e5ebfc043bea91ac91c222d235c9' },
  { id: 'kpop', title: 'K-Pop & Drama', color: '#AD1457', query: 'K-Pop Hits', img: 'https://i.scdn.co/image/ab67616d0000b2737533b658892e7b8dcfdaecb7' },
  { id: 'islamic', title: 'Soulful Naats', color: '#2E7D32', query: 'Soulful Naats', img: 'https://i1.sndcdn.com/artworks-Q8DCM8wFQaYw4ina-m4KfIA-t500x500.jpg' },
  { id: 'anime', title: 'Anime & OSTs', color: '#6A1B9A', query: 'Anime OST', img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300' },
  { id: 'lofi', title: 'Lo-Fi & Chill', color: '#5D4037', query: 'Lo-Fi Hindi', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
  { id: 'pakistani', title: 'Coke Studio & Sufi', color: '#BF360C', query: 'Coke Studio Hits', img: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300' },
  { id: 'workout', title: 'Workout & Gym', color: '#D84315', query: 'Workout High Energy', img: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300' },
  { id: 'party', title: 'Party & Club', color: '#00838F', query: 'Party Hits', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300' },
  { id: 'retro', title: '90s & Retro', color: '#4527A0', query: '90s Bollywood Retro', img: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=300' },
  { id: 'acoustic', title: 'Sleep & Acoustic', color: '#27856A', query: 'Relaxing Sleep Rain', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300' }
];

window.getMobileSearchPageHTML = function(initialQuery) {
  const categoriesGridHTML = SPOTIFY_BROWSE_TILES.map(cat => `
    <div class="sp-mob-category-card" style="background: ${cat.color};" onclick="selectMobileBrowseCategory('${cat.query}')">
      <div class="sp-mob-category-card-title">${cat.title}</div>
      <img src="${cat.img}" alt="${cat.title}" class="sp-mob-category-card-img" loading="lazy" onerror="this.remove()">
    </div>
  `).join('');

  setTimeout(() => {
    if (initialQuery) {
      openActiveMobileSearch(initialQuery);
    }
  }, 50);

  return `
    <div class="sp-mob-search-container" id="sp-mob-search-container">
      
      <div id="mob-search-browse-state" class="mob-search-state-active">
        <div class="sp-mob-search-capsule-bar">
          <div class="sp-mob-search-capsule" onclick="openActiveMobileSearch()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#000000" stroke-width="2.6">
              <circle cx="10.5" cy="10.5" r="6.5"/>
              <path d="M15.5 15.5L21 21" stroke-linecap="round"/>
            </svg>
            <span class="sp-mob-search-capsule-text">What do you want to listen to?</span>
          </div>
        </div>

        <div class="sp-mob-browse-content">
          <h2 class="sp-mob-browse-heading">Browse all</h2>
          <div class="sp-mob-browse-grid">
            ${categoriesGridHTML}
          </div>
        </div>
      </div>

      
      <div id="mob-search-active-state" class="mob-search-state-hidden">
        <div class="sp-mob-active-header">
          <div class="sp-mob-active-input-box">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#a7a7a7" stroke-width="2.2" class="sp-mob-active-search-ico">
              <circle cx="10.5" cy="10.5" r="6.5"/>
              <path d="M15.5 15.5L21 21" stroke-linecap="round"/>
            </svg>
            <input type="text" id="mob-active-search-input" class="mob-active-search-input" placeholder="What do you want to listen to?" oninput="handleMobileActiveSearch(event)" onkeydown="if(event.key==='Enter'){ const q = this.value.trim(); if(q){ executeMobileSearch(q); } }" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <button class="mob-search-input-clear hidden" id="mob-input-clear-btn" onclick="clearMobileActiveSearchInput(event)" aria-label="Clear">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
          <button class="mob-search-cancel-btn" onclick="closeActiveMobileSearch()">Cancel</button>
        </div>

        <div id="mob-active-search-body" class="mob-active-search-body">
          
        </div>
      </div>
    </div>
  `;
};

window.openActiveMobileSearch = function(query = '') {
  const browseState = document.getElementById('mob-search-browse-state');
  const activeState = document.getElementById('mob-search-active-state');
  const input = document.getElementById('mob-active-search-input');

  if (browseState) {
    browseState.classList.remove('mob-search-state-active');
    browseState.classList.add('mob-search-state-hidden');
  }
  if (activeState) {
    activeState.classList.remove('mob-search-state-hidden');
    activeState.classList.add('mob-search-state-active');
  }

  if (input) {
    input.value = query;
    if (query) {
      executeMobileSearch(query);
    } else {
      renderMobileRecentSearches();
    }
    setTimeout(() => {
      input.focus();
    }, 80);
  } else {
    renderMobileRecentSearches();
  }
};

window.closeActiveMobileSearch = function() {
  const browseState = document.getElementById('mob-search-browse-state');
  const activeState = document.getElementById('mob-search-active-state');
  const input = document.getElementById('mob-active-search-input');

  if (input) {
    input.value = '';
    input.blur();
  }

  if (activeState) {
    activeState.classList.remove('mob-search-state-active');
    activeState.classList.add('mob-search-state-hidden');
  }
  if (browseState) {
    browseState.classList.remove('mob-search-state-hidden');
    browseState.classList.add('mob-search-state-active');
  }
};

window.selectMobileBrowseCategory = function(query) {
  openActiveMobileSearch(query);
};

window.clearMobileActiveSearchInput = function(e) {
  if (e) e.stopPropagation();
  const input = document.getElementById('mob-active-search-input');
  const clearBtn = document.getElementById('mob-input-clear-btn');
  if (input) {
    input.value = '';
    input.focus();
  }
  if (clearBtn) clearBtn.classList.add('hidden');
  renderMobileRecentSearches();
};

window.renderMobileRecentSearches = function() {
  const body = document.getElementById('mob-active-search-body');
  if (!body) return;

  const clearBtn = document.getElementById('mob-input-clear-btn');
  if (clearBtn) clearBtn.classList.add('hidden');

  let recents = [];
  try {
    recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
  } catch(e) {
    recents = [];
  }

  if (recents.length === 0) {
    body.innerHTML = `
      <div class="sp-mob-recents-wrap">
        <h3 class="sp-mob-recents-heading">Recent searches</h3>
        <div class="sp-mob-recents-empty">
          <p>Search for artists, songs, podcasts and more.</p>
        </div>
      </div>
    `;
    return;
  }

  body.innerHTML = `
    <div class="sp-mob-recents-wrap">
      <h3 class="sp-mob-recents-heading">Recent searches</h3>
      <div class="sp-mob-recents-list">
        ${recents.map((item, idx) => {
          const isArtist = item.type === 'Artist';
          const isPlaylist = item.type === 'Playlist' || item.isPlaylist || item.playlistId;
          const thumb = item.img || item.thumb || 'https://placehold.co/100x100/181818/1ed760?text=Music';
          const subtitle = item.subtitle || (isArtist ? 'Artist' : (isPlaylist ? 'Playlist' : `Song • ${item.artist || 'Artist'}`));
          const isLiked = item.songId && state.likedSongs && state.likedSongs.includes(item.songId);

          return `
            <div class="sp-mob-recent-row" id="mob-recent-row-${idx}" onclick="onMobileRecentSearchItemClick('${idx}', event)">
              <img src="${thumb}" alt="${item.title}" class="sp-mob-recent-thumb ${isArtist ? 'is-artist' : ''}" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Music';">
              <div class="sp-mob-recent-info">
                <div class="sp-mob-recent-title">${item.title}</div>
                <div class="sp-mob-recent-sub">${subtitle}</div>
              </div>
              <div class="sp-mob-recent-actions">
                <button class="sp-mob-recent-btn check-btn ${isLiked ? 'liked' : ''}" onclick="event.stopPropagation(); toggleLikeFromMobileRecent('${item.id || item.songId || ''}', event)" title="Add / Liked">
                  <span class="sp-mob-rec-check-circle">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
                  </span>
                </button>
                <button class="sp-mob-recent-btn close-btn" onclick="event.stopPropagation(); removeMobileRecentSearchItem(${idx})" title="Remove from recent searches">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <button class="sp-mob-clear-recents-btn" onclick="clearAllMobileRecentSearches(event)">Clear recent searches</button>
    </div>
  `;
};

window.removeMobileRecentSearchItem = function(idx) {
  let recents = [];
  try {
    recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
  } catch(e) {}

  if (idx >= 0 && idx < recents.length) {
    recents.splice(idx, 1);
    try {
      localStorage.setItem('wave_recent_searches', JSON.stringify(recents));
    } catch(e) {}
  }

  const row = document.getElementById(`mob-recent-row-${idx}`);
  if (row) {
    row.style.opacity = '0';
    row.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      renderMobileRecentSearches();
    }, 180);
  } else {
    renderMobileRecentSearches();
  }
};

window.clearAllMobileRecentSearches = function(e) {
  if (e) e.stopPropagation();
  try {
    localStorage.removeItem('wave_recent_searches');
  } catch(e) {}
  renderMobileRecentSearches();
};

window.toggleLikeFromMobileRecent = function(songId, e) {
  if (e) e.stopPropagation();
  if (!songId) return;
  if (typeof toggleLike === 'function') {
    toggleLike(songId, e);
  }
  renderMobileRecentSearches();
};

window.onMobileRecentSearchItemClick = function(idxStr, event) {
  if (event) event.stopPropagation();
  const recents = JSON.parse(localStorage.getItem('wave_recent_searches') || '[]');
  const item = recents[parseInt(idxStr, 10)];
  if (!item) return;

  if (item.playlistId || item.type === 'Playlist' || item.type === 'Album') {
    const plId = item.playlistId || item.id;
    if (plId) {
      navigateTo('playlist', event, plId);
      return;
    }
  }

  if (item.songId) {
    const sg = (typeof getSongById === 'function') ? getSongById(item.songId) : null;
    if (sg) {
      playJioSaavnSong(sg);
    } else {
      executeMobileSearch(item.title);
    }
  } else if (item.type === 'Artist' || item.artistId || item.artistName) {
    const targetName = item.artistName || item.title || item.artistId;
    if (targetName && targetName !== 'Artist' && !/^\d+$/.test(targetName)) {
      navigateTo('artist', null, targetName);
    } else {
      executeMobileSearch(item.title);
    }
  } else {
    executeMobileSearch(item.title);
  }
};

let _mobSearchDebounceTimer = null;
window.handleMobileActiveSearch = function(e) {
  const query = e.target.value.trim();
  const clearBtn = document.getElementById('mob-input-clear-btn');
  if (clearBtn) clearBtn.classList.toggle('hidden', !query);

  if (!query) {
    renderMobileRecentSearches();
    return;
  }

  if (_mobSearchDebounceTimer) clearTimeout(_mobSearchDebounceTimer);
  _mobSearchDebounceTimer = setTimeout(() => {
    executeMobileSearch(query);
  }, 220);
};

window.executeMobileSearch = function(query) {
  const body = document.getElementById('mob-active-search-body');
  if (!body || !query) return;

  const clearBtn = document.getElementById('mob-input-clear-btn');
  if (clearBtn) clearBtn.classList.remove('hidden');

  body.innerHTML = `
    <div class="sp-mob-search-loading">
      <div class="sp-mob-search-spinner"></div>
      <span>Searching for "${query}"...</span>
    </div>
  `;

  
  const localMatches = (Array.isArray(SONGS) ? SONGS : []).filter(s => {
    const t = (s.title || '').toLowerCase();
    const a = (s.artist || '').toLowerCase();
    const q = query.toLowerCase();
    return t.includes(q) || a.includes(q);
  }).slice(0, 8);

  const performFetch = async () => {
    let apiResults = [];
    try {
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs) {
        apiResults = await JIOSAAVN_API.searchSongs(query, 14);
      }
    } catch(err) {
      console.warn('JioSaavn search failed:', err);
    }

    const combined = [...localMatches];
    apiResults.forEach(r => {
      if (!combined.some(s => String(s.id) === String(r.id) || (s.title && r.title && s.title.toLowerCase() === r.title.toLowerCase()))) {
        combined.push(r);
        if (!SONGS.some(s => String(s.id) === String(r.id))) SONGS.push(r);
      }
    });

    if (combined.length === 0) {
      body.innerHTML = `
        <div class="sp-mob-search-empty-results">
          <h3>No results found for "${query}"</h3>
          <p>Please check the spelling, or try searching for another artist or song.</p>
        </div>
      `;
      return;
    }

    const topItem = combined[0];
    const topThumb = escapeAttr(topItem.img || topItem.thumb || 'https://placehold.co/120x120/181818/1ed760?text=Music');
    const topIdSafe = escapeAttr(String(topItem.id));

    body.innerHTML = `
      <div class="sp-mob-search-results-wrap">
        
        <div class="sp-mob-top-result-card" onclick="handleMobSearchResultClick('${topIdSafe}', event)">
          <img src="${topThumb}" alt="${escapeAttr(topItem.title || '')}" class="sp-mob-top-result-thumb" onerror="this.onerror=null; this.src='https://placehold.co/120x120/181818/1ed760?text=Music';">
          <div class="sp-mob-top-result-title">${escapeHtml(topItem.title || '')}</div>
          <div class="sp-mob-top-result-sub">Song • ${escapeHtml(topItem.artist || 'Artist')}</div>
          <button class="sp-mob-top-result-play" onclick="handleMobSearchResultClick('${topIdSafe}', event)">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#000"><path d="M8 5v14l11-7z"/></svg>
          </button>
        </div>

        
        <h3 class="sp-mob-search-sec-title">Songs</h3>
        <div class="sp-mob-results-list">
          ${combined.slice(0, 15).map(s => {
            const thumb = escapeAttr(s.img || s.thumb || 'https://placehold.co/100x100/181818/1ed760?text=Music');
            const songIdSafe = escapeAttr(String(s.id));
            return `
              <div class="sp-mob-result-row" onclick="handleMobSearchResultClick('${songIdSafe}', event)">
                <img src="${thumb}" alt="${escapeAttr(s.title || '')}" class="sp-mob-result-thumb" onerror="this.onerror=null; this.src='https://placehold.co/100x100/181818/1ed760?text=Music';">
                <div class="sp-mob-result-info">
                  <div class="sp-mob-result-title">${escapeHtml(s.title || '')}</div>
                  <div class="sp-mob-result-sub">Song • ${escapeHtml(s.artist || 'Artist')}</div>
                </div>
                <button class="sp-mob-result-play-btn" onclick="handleMobSearchResultClick('${songIdSafe}', event)">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  performFetch();
};

