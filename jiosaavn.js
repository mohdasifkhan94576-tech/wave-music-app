

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
        console.log('[JioSaavn] Trying:', url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.success === false) throw new Error('API returned failure');

        this.currentEndpoint = (this.currentEndpoint + i) % this.endpoints.length;
        console.log('[JioSaavn] Success from:', base);
        return data;
      } catch (err) {
        lastError = err;
        console.warn(`[JioSaavn] Endpoint ${base} failed:`, err.message);
      }
    }
    throw lastError || new Error('All API endpoints failed');
  },

  async searchSongs(query, limit = 20) {
    const data = await this.fetchWithFallback(
      `/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`
    );

    const results = data.data?.results || data.results || [];
    console.log('[JioSaavn] Raw results count:', results.length);
    if (results.length > 0) {
      console.log('[JioSaavn] First raw song downloadUrl:', JSON.stringify(results[0].downloadUrl));
      console.log('[JioSaavn] First raw song image:', JSON.stringify(results[0].image));
    }
    return results.map(r => this.normalizeSong(r));
  },

  async getSongById(id) {
    const data = await this.fetchWithFallback(`/songs/${id}`);
    const songs = data.data || data || [];
    const arr = Array.isArray(songs) ? songs : [songs];
    return arr.length ? this.normalizeSong(arr[0]) : null;
  },

  _extractBest(arr, preferredQualities) {
    // Handle direct string URL
    if (typeof arr === 'string' && arr.length > 0) return arr;
    
    // Handle null/undefined/empty
    if (!arr) return '';
    
    // Handle single object with url/link
    if (!Array.isArray(arr) && typeof arr === 'object') {
      return arr.url || arr.link || '';
    }
    
    if (!Array.isArray(arr) || arr.length === 0) return '';
    
    // Handle array of strings (pick last = highest quality)
    if (typeof arr[0] === 'string') {
      return arr[arr.length - 1] || '';
    }
    
    // Handle array of objects with quality property
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
    
    // Fallback: try other image fields
    if (!imgUrl) {
      imgUrl = raw.image_url || raw.img || raw.thumbnail || raw.artwork || '';
    }
    // Final fallback placeholder
    if (!imgUrl) {
      imgUrl = `https://placehold.co/300x300/1a1a2e/a855f7?text=${encodeURIComponent((raw.name || raw.title || 'Music').substring(0, 10))}`;
    }

    const audioUrl = JIOSAAVN_API._extractBest(
      raw.downloadUrl, 
      ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps']
    );
    
    console.log('[JioSaavn] Normalized song:', raw.name, '| img:', imgUrl ? imgUrl.substring(0, 60) : 'NONE', '| audioUrl:', audioUrl ? audioUrl.substring(0, 80) + '...' : 'NONE');
    
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
    console.log('[JioSaavn] Search complete, valid results:', results.filter(r => r.audioUrl).length, '/', results.length);
    return results;
  } catch (err) {
    console.error('[JioSaavn] Search failed:', err);
    isSearchingAPI = false;
    return [];
  }
}

async function playJioSaavnSong(song) {
  if (!song) {
    console.error('[JioSaavn] No song provided');
    return;
  }
  
  if (!song.audioUrl) {
    console.error('[JioSaavn] No audio URL for:', song.title);
    alert('Sorry, this song is not available for streaming.');
    return;
  }

  console.log('[JioSaavn] Playing:', song.title, '| URL:', song.audioUrl.substring(0, 80));

  if (!SONGS.find(s => s.id === song.id)) {
    SONGS.push(song);
  }

  state.queue = [song];
  state.currentIndex = 0;
  playSong(0);

  state.isFetchingRelated = true;
  if (typeof renderQueuePanel === 'function') renderQueuePanel();

    const addedIds = new Set([song.id]);
    let addedCount = 0;
    const TARGET = 20;

    if (song.id.startsWith('yt_')) {
      try {
        const related = await YOUTUBE_API.getRelated(song.videoId || song.id.replace('yt_', ''), TARGET);
        for (const rs of related) {
          if (addedCount >= TARGET) break;
          if (rs.audioUrl && !addedIds.has(rs.id)) {
            addedIds.add(rs.id);
            if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
            state.queue.push(rs);
            addedCount++;
          }
        }
        if (addedCount > 0) {
          console.log(`[YouTube] Auto-queued ${addedCount} related songs`);
        }
      } catch (err) {
        console.warn('[YouTube] Auto-queue related fetch failed:', err);
      } finally {
        state.isFetchingRelated = false;
        if (typeof renderQueuePanel === 'function') renderQueuePanel();
      }
    } else {
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
            if (rs.audioUrl && !addedIds.has(rs.id)) {
              addedIds.add(rs.id);
              if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
              state.queue.push(rs);
              addedCount++;
              n++;
            }
          }
          for (; gi < genreSongs.length && addedCount < TARGET; gi++) {
            const rs = genreSongs[gi];
            if (rs.audioUrl && !addedIds.has(rs.id)) {
              addedIds.add(rs.id);
              if (!SONGS.find(s => s.id === rs.id)) SONGS.push(rs);
              state.queue.push(rs);
              addedCount++;
              break;
            }
          }
        }

        if (addedCount > 0) {
          console.log(`[JioSaavn] Auto-queued ${addedCount} related songs (${artistName} + ${genre})`);
        }
      } catch (err) {
        console.warn('[JioSaavn] Auto-queue fetch failed:', err);
      } finally {
        state.isFetchingRelated = false;
        if (typeof renderQueuePanel === 'function') renderQueuePanel();
      }
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
