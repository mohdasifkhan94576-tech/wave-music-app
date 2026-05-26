

'use strict';

const JIOSAAVN_API = {

  endpoints: [
    'https://jiosaavn-api-sigma-sandy.vercel.app',
    'https://saavn.dev/api',
    'https://jiosaavn-api-v3.vercel.app',
    'https://jiosaavn-api-privatecvc2.vercel.app',
  ],
  currentEndpoint: 0,

  getBase() {
    return this.endpoints[this.currentEndpoint];
  },

  async fetchWithFallback(path) {
    let lastError;
    for (let i = 0; i < this.endpoints.length; i++) {
      const base = this.endpoints[(this.currentEndpoint + i) % this.endpoints.length];
      try {
        const url = `${base}${path}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success === false) throw new Error('API returned failure');

        this.currentEndpoint = (this.currentEndpoint + i) % this.endpoints.length;
        return data;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error('All API endpoints failed');
  },

  async searchSongs(query, limit = 20) {
    const data = await this.fetchWithFallback(
      `/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
    );

    const results = data.data?.results || data.results || [];
    if (results.length > 0) {
    }
    return results.map(r => this.normalizeSong(r));
  },

  async searchArtists(query) {
    try {
      const data = await this.fetchWithFallback(
        `/search/artists?query=${encodeURIComponent(query)}`
      );
      const results = data.data?.results || data.results || [];
      return results.map(r => {
        let imgUrl = this._extractBest(r.image, ['500x500', '150x150', '50x50']);
        if (!imgUrl) {
          imgUrl = r.image_url || r.img || r.thumbnail || r.artwork || '';
        }
        if (!imgUrl || imgUrl.includes('artist-default') || imgUrl.includes('artist-placeholder')) {
          imgUrl = '';
        }
        return {
          id: r.id,
          name: r.name,
          img: imgUrl,
          listeners: '1,200,000',
          sub: 'Artist'
        };
      });
    } catch (e) {
      console.error('Error searching artists:', e);
      return [];
    }
  },

  async getSongById(id) {
    const data = await this.fetchWithFallback(`/songs/${id}`);
    const songs = data.data || data || [];
    const arr = Array.isArray(songs) ? songs : [songs];
    return arr.length ? this.normalizeSong(arr[0]) : null;
  },

  _extractBest(arr, preferredQualities) {
    if (typeof arr === 'string' && arr.length > 0) return arr;
    
    if (!arr) return '';
    
    if (!Array.isArray(arr) && typeof arr === 'object') {
      return arr.url || arr.link || '';
    }
    
    if (!Array.isArray(arr) || arr.length === 0) return '';
    
    if (typeof arr[0] === 'string') {
      return arr[arr.length - 1] || '';
    }
    
    for (const q of preferredQualities) {
      const match = arr.find(item => item.quality === q);
      if (match) {
        return match.url || match.link || '';
      }
    }

    const last = arr[arr.length - 1];
    return last?.url || last?.link || '';
  },

  normalizeSong(raw) {

    let imgUrl = JIOSAAVN_API._extractBest(
      raw.image, 
      ['500x500', '150x150', '50x50']
    );
    
    if (!imgUrl) {
      imgUrl = raw.image_url || raw.img || raw.thumbnail || raw.artwork || '';
    }
    if (!imgUrl) {
      imgUrl = `https://placehold.co/300x300/1a1a2e/a855f7?text=${encodeURIComponent((raw.name || raw.title || 'Music').substring(0, 10))}`;
    }

    const audioUrl = JIOSAAVN_API._extractBest(
      raw.downloadUrl, 
      ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']
    );
    
    
    const durationSecs = parseInt(raw.duration) || 0;
    const mins = Math.floor(durationSecs / 60);
    const secs = durationSecs % 60;

    let artist = 'Unknown';
    if (raw.artists?.primary && Array.isArray(raw.artists.primary)) {
      artist = raw.artists.primary.map(a => a.name).join(', ');
    } else if (raw.primaryArtists) {
      artist = raw.primaryArtists;
    } else if (typeof raw.artists === 'string') {
      artist = raw.artists;
    }

    return {
      id: raw.id,
      title: decodeHTMLEntities(raw.name || raw.title || ''),
      artist: decodeHTMLEntities(artist),
      album: decodeHTMLEntities(raw.album?.name || raw.album || ''),
      year: raw.year || new Date().getFullYear(),
      genre: raw.language || 'Hindi',
      plays: formatPlays(raw.playCount),
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
      language: raw.language || '',
      hasLyrics: raw.hasLyrics || false,
      label: raw.label || '',
    };
  }
};

function decodeHTMLEntities(text) {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function formatPlays(count) {
  if (!count) return '0';
  const n = parseInt(count);
  if (isNaN(n)) return count;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

let apiSearchTimeout;
let isSearchingAPI = false;
let apiSearchResults = [];

async function handleJioSaavnSearch(query) {
  if (!query || query.length < 2) {
    apiSearchResults = [];
    return [];
  }

  try {
    isSearchingAPI = true;
    const results = await JIOSAAVN_API.searchSongs(query, 15);
    apiSearchResults = results;
    isSearchingAPI = false;
    return results;
  } catch (err) {
    isSearchingAPI = false;
    return [];
  }
}

async function playJioSaavnSong(song) {
  if (!song) {
    return;
  }
  
  if (!song.audioUrl) {
    alert('Sorry, this song is not available for streaming.');
    return;
  }


  if (!SONGS.find(s => s.id === song.id)) {
    SONGS.push(song);
  }

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

      const [artistRes, genreRes] = await Promise.allSettled([
        JIOSAAVN_API.searchSongs(artistName + ' songs', 15),
        JIOSAAVN_API.searchSongs(genre + ' ' + songTitle.split(' ')[0] + ' hits', 15),
      ]);

      const artistSongs = (artistRes.status === 'fulfilled' ? artistRes.value : []);
      const genreSongs  = (genreRes.status === 'fulfilled'  ? genreRes.value  : []);

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
    } catch (err) {
    } finally {
      state.isFetchingRelated = false;
      if (typeof renderQueuePanel === 'function') renderQueuePanel();
    }
}

function addJioSaavnToQueue(song) {
  if (!song || !song.audioUrl) return;
  const existingIdx = state.queue.findIndex(s => s.jiosaavnId === song.jiosaavnId);
  if (existingIdx === -1) {
    state.queue.push(song);
    renderQueuePanel();
  }
}
