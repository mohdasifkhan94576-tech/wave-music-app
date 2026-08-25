

'use strict';

const JIOSAAVN_API = {

  endpoints: [
    'https://saavn-api-one.vercel.app',
    'https://jiosaavn-api-beta.vercel.app',
    'https://jiosaavn-api-taupe.vercel.app',
    'https://jiosaavn-api-rho.vercel.app'
  ],
  currentEndpoint: 0,
  _searchCache: new Map(),

  async fetchWithFallback(path) {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    let lastError = null;

    for (let i = 0; i < this.endpoints.length; i++) {
      const idx = (this.currentEndpoint + i) % this.endpoints.length;
      const base = this.endpoints[idx];
      const url = `${base}${cleanPath}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await fetch(url, { 
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.status === 'FAILED' || data.success === false) {
          throw new Error(data.message || 'API returned failure');
        }
        this.currentEndpoint = idx; 
        return data;
      } catch (err) {
        clearTimeout(timeoutId);
        lastError = err;
      }
    }
    throw lastError || new Error('All JioSaavn API endpoints failed');
  },

  async searchSongs(query, limit = 20) {
    if (!query) return [];
    const cacheKey = `${String(query).toLowerCase().trim()}::${limit}`;
    if (this._searchCache.has(cacheKey)) {
      return this._searchCache.get(cacheKey);
    }

    try {
      const data = await this.fetchWithFallback(
        `/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
      );
      const results = data.data?.results || data.results || data.data || [];
      const arr = Array.isArray(results) ? results : [];
      const normalized = arr.map(r => this.normalizeSong(r)).filter(s => s && s.audioUrl);
      if (normalized.length > 0) {
        this._searchCache.set(cacheKey, normalized);
      }
      return normalized;
    } catch (e) {
      console.warn('JioSaavn searchSongs error for query:', query, e);
      return [];
    }
  },

  async searchArtists(query) {
    if (!query) return [];
    try {
      let data = null;
      try {
        data = await this.fetchWithFallback(`/search/artists?query=${encodeURIComponent(query)}`);
      } catch (err1) {
        try {
          data = await this.fetchWithFallback(`/api/search/artists?query=${encodeURIComponent(query)}`);
        } catch (err2) {
          data = null;
        }
      }
      const results = data?.data?.results || data?.results || data?.data || [];
      if (Array.isArray(results) && results.length > 0) {
        return results.map(r => {
          let imgUrl = this._extractBest(r.image, ['500x500', '150x150', '50x50']);
          if (!imgUrl) {
            imgUrl = r.image_url || r.img || r.thumbnail || r.artwork || '';
          }
          if (!imgUrl || imgUrl.includes('artist-default') || imgUrl.includes('artist-placeholder')) {
            imgUrl = '';
          }
          return {
            id: r.id || r.name,
            name: r.name || r.title,
            img: imgUrl,
            listeners: '15,000,000 monthly listeners',
            sub: 'Artist'
          };
        });
      }
      return [];
    } catch (e) {
      console.warn('Error searching artists:', e);
      return [];
    }
  },

  async getArtistDetails(query) {
    if (!query) return null;
    const cleanQuery = String(query).replace(/^artist-/, '').replace(/-/g, ' ').trim();
    if (!cleanQuery || /^\d+$/.test(cleanQuery) || cleanQuery.toLowerCase() === 'artist') return null;

    const cacheKey = `artist_details::${cleanQuery.toLowerCase()}`;
    if (this._searchCache.has(cacheKey)) {
      return this._searchCache.get(cacheKey);
    }

    try {
      let artistId = null;
      let initialArt = null;

      if (/^\d+$/.test(cleanQuery)) {
        artistId = cleanQuery;
      } else {
        const searchRes = await this.searchArtists(cleanQuery);
        if (searchRes && searchRes.length > 0) {
          initialArt = searchRes[0];
          artistId = initialArt.id;
        }
      }

      let artistData = null;

      if (artistId) {
        try {
          const detailRes = await this.fetchWithFallback(`/artists?id=${encodeURIComponent(artistId)}`);
          const d = detailRes.data || detailRes;
          if (d && (d.name || d.image)) {
            let photo = this._extractBest(d.image, ['500x500', '150x150', '50x50']);
            if (!photo && initialArt) photo = initialArt.img;
            
            let followers = d.fanCount || (d.followerCount ? Number(d.followerCount).toLocaleString() : '18,400,000');
            if (followers && !String(followers).toLowerCase().includes('listener') && !String(followers).toLowerCase().includes('follower')) {
              followers = `${followers} monthly listeners`;
            }

            artistData = {
              id: d.id || artistId,
              name: d.name || cleanQuery,
              img: photo || '',
              followers: followers || '18,400,000 monthly listeners',
              bio: d.bio || (d.wiki ? d.wiki : ''),
              isVerified: d.isVerified !== false,
              dominantLanguage: d.dominantLanguage || 'Hindi',
              source: 'JioSaavn Official'
            };
          }
        } catch (e) {}
      }

      if (!artistData && initialArt && initialArt.img) {
        artistData = {
          id: initialArt.id || cleanQuery,
          name: initialArt.name || cleanQuery,
          img: initialArt.img,
          followers: '15,000,000 monthly listeners',
          bio: '',
          isVerified: true,
          source: 'JioSaavn Search'
        };
      }

      if (artistData && artistData.img) {
        this._searchCache.set(cacheKey, artistData);
        return artistData;
      }
    } catch (e) {
      console.warn('JioSaavn getArtistDetails error for:', query, e);
    }

    return null;
  },

  async getArtistSongs(artistId, limit = 20) {
    if (!artistId) return [];
    try {
      const res = await this.fetchWithFallback(`/artists/${encodeURIComponent(artistId)}/songs?page=1`);
      const results = res.data?.results || res.data?.songs || res.results || [];
      const arr = Array.isArray(results) ? results : [];
      if (arr.length > 0) {
        return arr.map(r => this.normalizeSong(r)).filter(s => s && s.audioUrl);
      }
    } catch (e) {}
    return [];
  },

  async getSongSuggestions(id, limit = 20) {
    try {
      const data = await this.fetchWithFallback(`/songs/${id}/suggestions?limit=${limit}`);
      const results = data.data?.results || data.data || data.results || [];
      const arr = Array.isArray(results) ? results : [];
      if (arr.length > 0) return arr.map(r => this.normalizeSong(r)).filter(s => s && s.audioUrl);
    } catch (err) {
      
    }

    try {
      const cached = window.jioSongCache?.[String(id)] || (typeof SONGS !== 'undefined' && SONGS.find(s => String(s.id) === String(id)));
      if (cached && (cached.artist || cached.title)) {
        const query = cached.artist ? `${cached.artist.split(',')[0].trim()} hits` : cached.title;
        return await this.searchSongs(query, limit);
      }
    } catch (e) {}

    return [];
  },

  async getLyrics(id) {
    if (!id) return null;
    try {
      const data = await this.fetchWithFallback(`/lyrics?id=${encodeURIComponent(id)}`);
      const lyrics = data.data?.lyrics || data.lyrics || (typeof data.data === 'string' ? data.data : null);
      if (lyrics) return lyrics;
    } catch (err1) {
      try {
        const data2 = await this.fetchWithFallback(`/songs?id=${encodeURIComponent(id)}`);
        const songObj = Array.isArray(data2.data) ? data2.data[0] : (data2.data || data2.results?.[0]);
        if (songObj && songObj.hasLyrics && songObj.lyrics) {
          return songObj.lyrics;
        }
      } catch (err2) {
        console.warn('JioSaavn lyrics fetch failed for song ID:', id);
      }
    }
    return null;
  },

  _extractBest(arr, preferredQualities) {
    if (!arr) return '';

    if (typeof arr === 'string') {
      let str = arr.trim();
      if (!str) return '';
      if (str.startsWith('http://')) str = str.replace('http://', 'https://');
      if (str.includes('-150x150.')) str = str.replace('-150x150.', '-500x500.');
      if (str.includes('-50x50.')) str = str.replace('-50x50.', '-500x500.');
      return str;
    }
    
    if (!Array.isArray(arr) && typeof arr === 'object') {
      const url = arr.url || arr.link || arr.href || arr.image || '';
      return this._extractBest(url, preferredQualities);
    }
    
    if (!Array.isArray(arr) || arr.length === 0) return '';
    
    if (typeof arr[0] === 'string') {
      return this._extractBest(arr[arr.length - 1], preferredQualities);
    }
    
    for (const q of preferredQualities) {
      const match = arr.find(item => item && (item.quality === q || item.quality === String(q)));
      if (match) {
        const url = match.url || match.link || match.href || '';
        if (url) return this._extractBest(url, preferredQualities);
      }
    }

    const last = arr[arr.length - 1];
    const lastUrl = last?.url || last?.link || last?.href || '';
    return this._extractBest(lastUrl, preferredQualities);
  },

  normalizeSong(raw) {

    let imgUrl = JIOSAAVN_API._extractBest(
      raw.image, 
      ['500x500', '150x150', '50x50']
    );
    
    if (!imgUrl && raw.album) {
      imgUrl = JIOSAAVN_API._extractBest(
        raw.album.image || raw.album.img || raw.album.url,
        ['500x500', '150x150', '50x50']
      );
    }
    if (!imgUrl) {
      imgUrl = raw.image_url || raw.img || raw.thumbnail || raw.artwork || '';
      if (imgUrl) imgUrl = JIOSAAVN_API._extractBest(imgUrl, ['500x500', '150x150', '50x50']);
    }
    if (!imgUrl) {
      imgUrl = `https://placehold.co/300x300/1a1a2e/a855f7?text=${encodeURIComponent((raw.name || raw.title || 'Music').substring(0, 10))}`;
    }

    const audioUrl = JIOSAAVN_API._extractBest(
      raw.downloadUrl || raw.download_url || raw.media_url || raw.url, 
      ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']
    );
    
    const durationSecs = parseInt(raw.duration) || 0;
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;

    let artist = 'Unknown';
    if (raw.artists?.primary && Array.isArray(raw.artists.primary)) {
      artist = raw.artists.primary.map(a => a.name).join(', ');
    } else if (raw.primaryArtists) {
      artist = typeof raw.primaryArtists === 'string' ? raw.primaryArtists : (Array.isArray(raw.primaryArtists) ? raw.primaryArtists.map(a => a.name || a).join(', ') : 'Unknown');
    } else if (raw.primary_artists) {
      artist = raw.primary_artists;
    } else if (raw.singers) {
      artist = raw.singers;
    } else if (raw.artist) {
      artist = raw.artist;
    } else if (typeof raw.artists === 'string') {
      artist = raw.artists;
    }

    const rawTitle = raw.name || raw.title || raw.song || '';
    const rawAlbum = (raw.album && typeof raw.album === 'object') ? (raw.album.name || raw.album.title || '') : (raw.album || '');

    return {
      id: raw.id,
      title: decodeHTMLEntities(rawTitle),
      artist: decodeHTMLEntities(artist),
      album: decodeHTMLEntities(rawAlbum),
      year: raw.year || new Date().getFullYear(),
      genre: raw.language || 'Hindi',
      plays: formatPlays(raw.playCount || raw.play_count),
      duration: `${mins}:${secs.toString().padStart(2, '0')}`,
      secs: durationSecs,
      thumb: imgUrl,
      img: imgUrl,
      artistImg: imgUrl,
      verified: false,
      lyrics: [],
      audioUrl: audioUrl,
      jiosaavnId: raw.id,
      isFromAPI: true,
      isJioSaavn: true,
      source: 'jiosaavn',
      language: raw.language || '',
      hasLyrics: raw.hasLyrics || raw.has_lyrics === 'true' || false,
      label: raw.label || '',
    };
  }
};

function decodeHTMLEntities(text) {
  if (!text) return '';
  if (typeof document !== 'undefined' && document.createElement) {
    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      return textarea.value || text;
    } catch (e) {}
  }
  return String(text)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'");
}

function formatPlays(count) {
  if (!count) return '0';
  const n = parseInt(count);
  if (isNaN(n)) return count;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

window.apiSearchResults = [];
window.jioSongCache = window.jioSongCache || {};

async function handleJioSaavnSearch(query) {
  if (!query || query.length < 2) {
    window.apiSearchResults = [];
    return [];
  }

  try {
    const results = await JIOSAAVN_API.searchSongs(query, 15);
    window.apiSearchResults = results || [];
    (results || []).forEach(s => {
      if (s && s.id) window.jioSongCache[String(s.id)] = s;
    });
    return results;
  } catch (err) {
    return [];
  }
}

async function playJioSaavnSong(target) {
  if (!target) return;
  
  let song = null;
  if (typeof target === 'object') {
    song = target;
  } else if (typeof target === 'string' || typeof target === 'number') {
    const targetStr = String(target);
    song = (typeof window.jioSongCache !== 'undefined' && window.jioSongCache[targetStr]) ||
           (typeof window.apiSearchResults !== 'undefined' && Array.isArray(window.apiSearchResults) ? window.apiSearchResults.find(s => String(s.id) === targetStr) : null) ||
           SONGS.find(s => String(s.id) === targetStr) || 
           (typeof cloudData !== 'undefined' && cloudData.songs ? cloudData.songs.find(s => String(s.id) === targetStr) : null) ||
           (typeof state !== 'undefined' && state.recentSongs ? state.recentSongs.find(s => String(s.id) === targetStr) : null);
  }

  if (!song) return;

  window.jioSongCache = window.jioSongCache || {};
  if (song.id) window.jioSongCache[String(song.id)] = song;

  if (!song.audioUrl) {
    if (typeof showToast === 'function') {
      showToast('Sorry, this song audio stream is unavailable.', 'error');
    }
    return;
  }

  if (typeof normalizeSongFields === 'function') normalizeSongFields(song);

  if (!SONGS.find(s => String(s.id) === String(song.id))) {
    SONGS.push(song);
  }

  
  let existingIndex = -1;
  if (state.queue && Array.isArray(state.queue) && state.queue.length > 1) {
    existingIndex = state.queue.findIndex(s => s && String(s.id) === String(song.id));
  }

  if (existingIndex !== -1) {
    
    playSong(existingIndex);
  } else {
    
    state.playbackContext = null;
    state.queue = [song];
    state.currentIndex = 0;
    if (typeof seedQueueWithRelated === 'function') {
      seedQueueWithRelated(song, 25);
    }
    playSong(0);
  }

  
  if (!state.playbackContext || (state.playbackContext.type !== 'playlist' && state.playbackContext.type !== 'album')) {
    if (typeof SmartQueue !== 'undefined' && SmartQueue.generateQueue) {
      SmartQueue.generateQueue(song, 30);
      return;
    }
  }

  const seenIds = new Set([song.id]);
  const seenTitles = new Set();
  const _normTitle = (t) => {
    if (typeof normalizeTitleForDedupe === 'function') return normalizeTitleForDedupe(t);
    return t ? t.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '').trim() : '';
  };
  if (song.title) seenTitles.add(_normTitle(song.title));

  let addedCount = 0;
  const TARGET = 20;
  const songLang = song.language || song.genre || 'Hindi';

  const tryAddSong = (candidate) => {
    if (!candidate || !candidate.audioUrl) return false;
    if (seenIds.has(candidate.id)) return false;

    const candNorm = _normTitle(candidate.title);
    if (candNorm && seenTitles.has(candNorm)) return false;

    
    if (candidate.secs && candidate.secs < 60 && (song.secs || 0) >= 60) return false;

    
    const titleLower = (candidate.title || '').toLowerCase();
    if (titleLower.includes('ringtone') || titleLower.includes('promo') || 
        titleLower.includes('teaser') || titleLower.includes('dialogues')) {
      return false;
    }

    
    if (candidate.language && songLang && candidate.language.toLowerCase() !== songLang.toLowerCase()) {
      return false;
    }

    seenIds.add(candidate.id);
    if (candNorm) seenTitles.add(candNorm);

    if (!SONGS.find(s => s.id === candidate.id)) {
      SONGS.push(candidate);
    }
    state.queue.push(candidate);
    addedCount++;
    return true;
  };

  try {
    
    try {
      const directSuggestions = await JIOSAAVN_API.getSongSuggestions(song.id, 25);
      for (const item of directSuggestions) {
        if (addedCount >= TARGET) break;
        tryAddSong(item);
      }
    } catch (e) {   }

    
    if (addedCount < TARGET) {
      const primaryArtist = song.artist ? song.artist.split(',')[0].trim() : '';
      let moodQuery = `${songLang} romantic songs`;

      if (typeof detectSongMood === 'function') {
        const mood = detectSongMood(song);
        const moodMap = {
          romantic: 'romantic love songs',
          sad: 'sad heartbreak songs',
          party: 'party dance songs',
          devotional: 'devotional bhajan',
          chill: 'chill soft songs',
          motivational: 'motivational songs',
        };
        moodQuery = `${songLang} ${moodMap[mood] || 'romantic songs'}`;
      }

      const promises = [];
      if (primaryArtist && primaryArtist !== 'Unknown') {
        promises.push(JIOSAAVN_API.searchSongs(primaryArtist, 20));
      }
      promises.push(JIOSAAVN_API.searchSongs(moodQuery, 20));
      if (song.album && typeof song.album === 'string' && song.album.length > 2) {
        promises.push(JIOSAAVN_API.searchSongs(song.album, 10));
      }

      const results = await Promise.allSettled(promises);
      for (const res of results) {
        if (addedCount >= TARGET) break;
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          for (const cand of res.value) {
            if (addedCount >= TARGET) break;
            tryAddSong(cand);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching JioSaavn recommendations:', err);
  } finally {
    state.isFetchingRelated = false;
    if (typeof renderQueuePanel === 'function') renderQueuePanel();
  }
}

if (typeof window !== 'undefined') {
  window.JIOSAAVN_API = JIOSAAVN_API;
  window.handleJioSaavnSearch = handleJioSaavnSearch;
  window.playJioSaavnSong = playJioSaavnSong;
}

