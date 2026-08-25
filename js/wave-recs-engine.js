

'use strict';

window.WaveRecsEngine = {
  version: '3.0.0',

  
  _jioSaavnCache: new Map(),
  _bollywoodJioSongs: [],
  _isFetchingBollywood: false,

  
  
  
  getAllSongsPool() {
    const cloud = (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) ? cloudData.songs : [];
    const local = (typeof SONGS !== 'undefined' && Array.isArray(SONGS)) ? SONGS : [];
    
    
    const jioSongs = [];
    this._jioSaavnCache.forEach(list => {
      if (Array.isArray(list)) jioSongs.push(...list);
    });
    if (this._bollywoodJioSongs.length > 0) {
      jioSongs.push(...this._bollywoodJioSongs);
    }

    const pool = [...cloud, ...local, ...jioSongs];
    
    
    const seen = new Set();
    return pool.filter(s => {
      if (!s || (!s.id && !s.title)) return false;
      const key = String(s.id || s.title).toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  },

  
  async enrichFromJioSaavn(query, limit = 15) {
    if (!query || typeof JIOSAAVN_API === 'undefined' || !JIOSAAVN_API.searchSongs) return [];
    
    const cacheKey = query.toLowerCase().trim();
    if (this._jioSaavnCache.has(cacheKey)) {
      return this._jioSaavnCache.get(cacheKey);
    }

    try {
      const results = await JIOSAAVN_API.searchSongs(query, limit);
      if (Array.isArray(results) && results.length > 0) {
        this._jioSaavnCache.set(cacheKey, results);
        return results;
      }
    } catch (e) {
      console.warn(`[WaveRecsEngine] JioSaavn enrichment failed for "${query}":`, e);
    }
    return [];
  },

  
  
  
  getUserProfile() {
    const history = (typeof WaveHistory !== 'undefined' && WaveHistory.getHistory) ? WaveHistory.getHistory() : [];
    const playCounts = (typeof WaveHistory !== 'undefined' && WaveHistory.getPlayCounts) ? WaveHistory.getPlayCounts() : {};

    const artistScores = {};
    const genreScores = {
      'hindi': 0,
      'english': 0,
      'islamic': 0,
      'kpop': 0,
      'anime': 0,
      'pakistani': 0,
      'romantic': 0,
      'chill': 0,
      'energy': 0
    };
    const moodScores = {
      'Love': 0,
      'Chill': 0,
      'Late Night': 0,
      'Sad': 0,
      'Energy': 0
    };

    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    history.forEach((item, index) => {
      
      const ageDays = (now - (item.timestamp || now)) / DAY_MS;
      const decayWeight = Math.max(0.2, 1 / (1 + ageDays * 0.2));
      const posWeight = Math.max(0.3, 1 - (index / Math.max(1, history.length)));
      const weight = decayWeight * posWeight;

      
      const artist = (item.artist || '').trim();
      if (artist && artist !== 'Unknown Artist') {
        artistScores[artist] = (artistScores[artist] || 0) + (1.5 * weight);
      }

      
      if (item.mood && moodScores[item.mood] !== undefined) {
        moodScores[item.mood] += (1.0 * weight);
      }

      
      const text = `${item.title || ''} ${item.artist || ''} ${item.album || ''}`.toLowerCase();
      if (/hindi|bollywood|arijit|atif|jubin|shreya|darshan|armaan|sonu/i.test(text)) genreScores.hindi += weight;
      if (/english|alan walker|ed sheeran|taylor|eminem|pop|billie|dua|charlie/i.test(text)) genreScores.english += weight;
      if (/islamic|nasheed|naat|quran|qadri|hussani|zain|bayan|tariq/i.test(text)) genreScores.islamic += (weight * 1.5);
      if (/kpop|bts|blackpink|stray kids|twice|newjeans|exo/i.test(text)) genreScores.kpop += (weight * 1.5);
      if (/anime|naruto|jujutsu|shingeki|demon slayer|ost|yoasobi/i.test(text)) genreScores.anime += (weight * 1.5);
      if (/pakistani|coke studio|ali zafar|rahat|qawwali|nusrat/i.test(text)) genreScores.pakistani += (weight * 1.5);
      if (/love|dil|tum|ishq|mohabbat|romantic|heart|sanam/i.test(text)) genreScores.romantic += weight;
      if (/chill|night|calm|sleep|rain|relax|lofi|peace/i.test(text)) genreScores.chill += weight;
      if (/party|dance|rock|gym|workout|fast|bass|edm/i.test(text)) genreScores.energy += weight;
    });

    
    const topArtists = Object.entries(artistScores)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    
    const topGenres = Object.entries(genreScores)
      .filter(entry => entry[1] > 0.5)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    
    const topMoods = Object.entries(moodScores)
      .filter(entry => entry[1] > 0.3)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);

    return {
      historyCount: history.length,
      topArtists,
      topGenres,
      topMoods,
      playCounts,
      recentHistory: history.slice(0, 15)
    };
  },

  
  
  

  
  getSongsForYou(limit = 15) {
    const profile = this.getUserProfile();
    const pool = this.getAllSongsPool();
    const sfy = [];
    const seenIds = new Set();

    
    if (profile.topArtists && profile.topArtists.length > 0) {
      for (const artist of profile.topArtists) {
        const matching = this.getMoreLikeArtist(artist, 5);
        for (const s of matching) {
          const key = String(s.id || s.title).toLowerCase().trim();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            sfy.push(s);
            if (sfy.length >= limit) break;
          }
        }
        if (sfy.length >= limit) break;
      }
    }

    
    if (sfy.length < limit && profile.topGenres && profile.topGenres.length > 0) {
      for (const genre of profile.topGenres) {
        const matching = this.getGenreDeepDive(genre, 5);
        for (const s of matching) {
          const key = String(s.id || s.title).toLowerCase().trim();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            sfy.push(s);
            if (sfy.length >= limit) break;
          }
        }
        if (sfy.length >= limit) break;
      }
    }

    
    for (const s of pool) {
      if (sfy.length >= limit) break;
      const key = String(s.id || s.title).toLowerCase().trim();
      if (!seenIds.has(key)) {
        seenIds.add(key);
        sfy.push(s);
      }
    }

    return sfy.slice(0, limit);
  },

  getSongsForYouHTML() {
    const songs = this.getSongsForYou(15);
    if (!songs || songs.length === 0) return '';

    return `
      <div class="sp-songs-for-you-section">
        <div class="sp-sfy-header">
          <h2 class="sp-sfy-title">Songs for You</h2>
          <div class="sp-sfy-controls">
            <button class="sp-sfy-arrow-btn" onclick="document.getElementById('sp-sfy-carousel').scrollBy({left: -420, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-sfy-arrow-btn" onclick="document.getElementById('sp-sfy-carousel').scrollBy({left: 420, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button class="sp-sfy-see-all" onclick="navigateTo('library')" title="See All Recommendations">SEE ALL</button>
          </div>
        </div>

        <div id="sp-sfy-carousel" class="sp-sfy-carousel">
          ${songs.map(song => {
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
            const isPlaying = (typeof state !== 'undefined' && state.currentPlayingSongId === song.id);

            return `
              <div class="sp-sfy-track-item ${isPlaying ? 'is-playing' : ''}" 
                   onclick="playRecsSong('${songIdEscaped}')" 
                   title="${song.title}">
                <div class="sp-sfy-thumb-wrap">
                  <img src="${thumb}" alt="${song.title}" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                  <div class="sp-sfy-play-overlay">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>

                <div class="sp-sfy-meta">
                  <span class="sp-sfy-track-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" title="${song.title}">${song.title}</span>
                  <span class="sp-sfy-artist card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Unknown Artist').replace(/'/g, "\\'")}');" title="${song.artist || 'Unknown Artist'}">${song.artist || 'Unknown Artist'}</span>
                </div>

                <div class="sp-sfy-actions" onclick="event.stopPropagation();">
                  <button class="sp-sfy-action-btn" onclick="toggleLikeSong('${songIdEscaped}');" title="Save to Your Liked Songs">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                  <button class="sp-sfy-action-btn" onclick="openTrackContextMenu(event, '${songIdEscaped}');" title="More options">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  
  
  getTop10EnglishSongs() {
    const pool = this.getAllSongsPool();
    let eng = pool.filter(s => s.tags && Array.isArray(s.tags) && (s.tags.includes('top-10-english') || s.tags.includes('english'))).sort((a,b) => (a.rank || 99) - (b.rank || 99));
    if (eng.length === 0) eng = pool.filter(s => /alan walker|faded|english|dharia|gracie|taylor|ed sheeran|sugar/i.test(`${s.title} ${s.artist}`));
    return eng.slice(0, 10);
  },

  getTop10HindiSongs() {
    const pool = this.getAllSongsPool();
    let hindi = pool.filter(s => s.tags && Array.isArray(s.tags) && (s.tags.includes('top-10-hindi') || s.tags.includes('hindi'))).sort((a,b) => (a.rank || 99) - (b.rank || 99));
    if (hindi.length === 0) hindi = pool.filter(s => /jhol|hindi|bollywood|arijit|jubin|sachet|shreya/i.test(`${s.title} ${s.artist}`));
    return hindi.slice(0, 10);
  },

  getTop10Naats() {
    const pool = this.getAllSongsPool();
    let naats = pool.filter(s => s.tags && Array.isArray(s.tags) && (s.tags.includes('top-10-islamic') || s.tags.includes('islamic'))).sort((a,b) => (a.rank || 99) - (b.rank || 99));
    if (naats.length === 0) naats = pool.filter(s => /maher zain|naat|islamic|sidra|qadri|musthaqeem|zain/i.test(`${s.title} ${s.artist}`));
    return naats.slice(0, 10);
  },

  
  getPopularEnglishSongs(limit = 15) {
    const pool = this.getAllSongsPool();
    const engSongs = pool.filter(s => {
      const isTagged = s.tags && Array.isArray(s.tags) && (s.tags.includes('english') || s.tags.includes('top-10-english') || s.tags.includes('pop'));
      const text = `${s.title || ''} ${s.artist || ''} ${s.album || ''}`.toLowerCase();
      const isEnglishArtist = /alan walker|faded|dharia|gracie|abrams|taylor|ed sheeran|eminem|pop|billie|dua lipa|charlie puth|sugar|brownies|believer|imagine|coldplay|marshmello|chainsmokers|shawn mendes|camila|adele|selena|ariana/i.test(text);
      return isTagged || isEnglishArtist;
    });

    if (engSongs.length < limit) {
      for (const s of pool) {
        if (engSongs.length >= limit) break;
        if (!engSongs.some(x => String(x.id) === String(s.id))) {
          engSongs.push(s);
        }
      }
    }

    return engSongs.slice(0, limit);
  },

  getPopularEnglishSongsHTML() {
    const songs = this.getPopularEnglishSongs(15);
    if (!songs || songs.length === 0) return '';

    const carouselId = 'sp-popular-english-carousel';
    return `
      <div class="sp-ml-section" style="margin-bottom: 38px;">
        <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">Popular English Hits</h2>
            <p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">Global chartbusters, iconic pop anthems & trending English hits</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -400, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 400, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
          ${songs.map(song => {
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=English';
            return `
              <div class="sp-ml-card" onclick="playRecsSong('${songIdEscaped}')">
                <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                  <img src="${thumb}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=English';">
                  <button class="sp-ml-play-btn" 
                          onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" 
                          style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                          aria-label="Play ${song.title}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.title}">${song.title}</div>
                <div class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'English Artist').replace(/'/g, "\\'")}');" style="font-size: 12px; color: #888888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.artist || 'English Artist'}">${song.artist || 'English Artist'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  getSoulfulNaats(limit = 15) {
    const pool = this.getAllSongsPool();
    const naats = pool.filter(s => {
      const isTagged = s.tags && Array.isArray(s.tags) && (s.tags.includes('islamic') || s.tags.includes('top-10-islamic'));
      const text = `${s.title || ''} ${s.artist || ''} ${s.album || ''}`.toLowerCase();
      const isKeyword = /naat|nasheed|islamic|qadri|zain|maher|musthaqeem|nabi|quran|hasbi|allah|madina|makkah|panjatan|faslon|hussain|bayan/i.test(text);
      return isTagged || isKeyword;
    });

    return naats.slice(0, limit);
  },

  getSoulfulNaatsHTML() {
    const naats = this.getSoulfulNaats(15);
    if (!naats || naats.length === 0) return '';

    const carouselId = 'sp-soulful-naats-carousel';
    return `
      <div class="sp-ml-section" style="margin-bottom: 38px;">
        <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">Soulful Naats</h2>
            <p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">Peaceful spiritual Naats, Nasheeds & soulful recitations</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -400, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 400, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
          ${naats.map(song => {
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
            return `
              <div class="sp-ml-card" onclick="playRecsSong('${songIdEscaped}')">
                <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                  <img src="${thumb}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                  <button class="sp-ml-play-btn" 
                          onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" 
                          style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                          aria-label="Play ${song.title}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.title}">${song.title}</div>
                <div class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Islamic Artist').replace(/'/g, "\\'")}');" style="font-size: 12px; color: #888888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.artist || 'Islamic Artist'}">${song.artist || 'Islamic Artist'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  
  
  async fetchBestOfBollywoodFromJio(limit = 15) {
    if (this._bollywoodJioSongs.length >= 10 || this._isFetchingBollywood) {
      return this._bollywoodJioSongs;
    }
    this._isFetchingBollywood = true;
    try {
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs) {
        const results = await JIOSAAVN_API.searchSongs('Bollywood Hits', limit);
        if (Array.isArray(results) && results.length > 0) {
          this._bollywoodJioSongs = results;
          const wrap = document.getElementById('sp-best-of-bollywood-carousel-wrap');
          if (wrap) {
            wrap.innerHTML = this.renderBestOfBollywoodCards(results);
          }
        }
      }
    } catch (e) {
      console.warn('[WaveRecsEngine] Failed to fetch Best of Bollywood from JioSaavn:', e);
    } finally {
      this._isFetchingBollywood = false;
    }
    return this._bollywoodJioSongs;
  },

  renderBestOfBollywoodCards(songs) {
    if (!songs || songs.length === 0) return '';
    return songs.map(song => {
      if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
      const songId = String(song.id || song.songId || song.title);
      const songIdEscaped = encodeURIComponent(songId);
      const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Bollywood';

      return `
        <div class="sp-ml-card" onclick="playRecsSong('${songIdEscaped}')">
          <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
            <img src="${thumb}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Bollywood';">
            <button class="sp-ml-play-btn" 
                    onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" 
                    style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                    aria-label="Play ${song.title}">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
          <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.title}">${song.title}</div>
          <div class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Bollywood Artist').replace(/'/g, "\\'")}');" style="font-size: 12px; color: #888888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.artist || 'Bollywood Artist'}">${song.artist || 'Bollywood Artist'}</div>
        </div>
      `;
    }).join('');
  },

  getBestOfBollywoodHTML() {
    
    if (this._bollywoodJioSongs.length === 0) {
      setTimeout(() => this.fetchBestOfBollywoodFromJio(15), 50);
    }

    const songs = this._bollywoodJioSongs;
    const carouselId = 'sp-best-of-bollywood-carousel';

    return `
      <div id="sp-best-of-bollywood-section" class="sp-ml-section" style="margin-bottom: 38px;">
        <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">Best of Bollywood</h2>
              <span style="background: linear-gradient(135deg, #00d2ff, #0078ff); color: #fff; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px;">JIOSAAVN</span>
            </div>
            <p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">Latest and evergreen Bollywood chartbusters via JioSaavn</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -400, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 400, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
          <div id="sp-best-of-bollywood-carousel-wrap" style="display: flex; gap: 16px;">
            ${songs.length > 0 ? this.renderBestOfBollywoodCards(songs) : `
              <div style="padding: 20px; color: #888888; font-size: 13px; display: flex; align-items: center; gap: 10px;">
                <div class="sp-mini-spinner" style="width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #1ed760; border-radius: 50%; animation: spSpin 0.8s linear infinite;"></div>
                <span>Fetching Best of Bollywood from JioSaavn...</span>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  
  
  
  getPopularHindiSongs(limit = 15) {
    const pool = this.getAllSongsPool();
    const hindiSongs = pool.filter(s => {
      const isTagged = s.tags && Array.isArray(s.tags) && (s.tags.includes('hindi') || s.tags.includes('top-10-hindi') || s.tags.includes('bollywood'));
      const text = `${s.title || ''} ${s.artist || ''} ${s.album || ''}`.toLowerCase();
      const isHindiArtist = /arijit|jubin|atif|shreya|darshan|armaan|sonu|sachet|parampara|vishal mishra|sachin-jigar|badshah|mohit|dil|tum|ishq|mohabbat|hum|zara|humsafar|saiyaara|gehera|barbaad|sitaare|ehsaas|majboor|jhol/i.test(text);
      return isTagged || isHindiArtist;
    });

    if (hindiSongs.length < limit) {
      for (const s of pool) {
        if (hindiSongs.length >= limit) break;
        if (!hindiSongs.some(x => String(x.id) === String(s.id))) {
          hindiSongs.push(s);
        }
      }
    }

    return hindiSongs.slice(0, limit);
  },

  getPopularHindiSongsHTML() {
    const songs = this.getPopularHindiSongs(15);
    if (!songs || songs.length === 0) return '';

    const carouselId = 'sp-popular-hindi-carousel';
    return `
      <div class="sp-songs-for-you-section" style="margin-bottom: 38px;">
        <div class="sp-sfy-header">
          <div>
            <h2 class="sp-sfy-title">Popular Hindi Songs</h2>
            <p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">India's biggest Hindi chartbusters & timeless melodies</p>
          </div>
          <div class="sp-sfy-controls">
            <button class="sp-sfy-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -420, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-sfy-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 420, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button class="sp-sfy-see-all" onclick="navigateTo('library')" title="See All Hindi Songs">SEE ALL</button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-sfy-carousel">
          ${songs.map(song => {
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
            const isPlaying = (typeof state !== 'undefined' && state.currentPlayingSongId === song.id);

            return `
              <div class="sp-sfy-track-item ${isPlaying ? 'is-playing' : ''}" 
                   onclick="playRecsSong('${songIdEscaped}')" 
                   title="${song.title}">
                <div class="sp-sfy-thumb-wrap">
                  <img src="${thumb}" alt="${song.title}" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                  <div class="sp-sfy-play-overlay">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>

                <div class="sp-sfy-meta">
                  <span class="sp-sfy-track-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" title="${song.title}">${song.title}</span>
                  <span class="sp-sfy-artist card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Hindi Artist').replace(/'/g, "\\'")}');" title="${song.artist || 'Hindi Artist'}">${song.artist || 'Hindi Artist'}</span>
                </div>

                <div class="sp-sfy-actions" onclick="event.stopPropagation();">
                  <button class="sp-sfy-action-btn" onclick="toggleLikeSong('${songIdEscaped}');" title="Save to Your Liked Songs">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                  <button class="sp-sfy-action-btn" onclick="openTrackContextMenu(event, '${songIdEscaped}');" title="More options">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  
  
  getKDramaAndKPopSongs(limit = 15) {
    const pool = this.getAllSongsPool();
    const kdramaSongs = pool.filter(s => {
      const isTagged = s.tags && Array.isArray(s.tags) && (s.tags.includes('k-drama') || s.tags.includes('kpop') || s.tags.includes('korean'));
      const text = `${s.title || ''} ${s.artist || ''} ${s.album || ''}`.toLowerCase();
      const isKDrama = /k-drama|kpop|korean|queen of tears|crush|bts|blackpink|stray kids|twice|newjeans|ost|goblin|kdrama|demon hunters/i.test(text);
      return isTagged || isKDrama;
    });

    if (kdramaSongs.length < limit) {
      for (const s of pool) {
        if (kdramaSongs.length >= limit) break;
        if (!kdramaSongs.some(x => String(x.id) === String(s.id))) {
          kdramaSongs.push(s);
        }
      }
    }

    return kdramaSongs.slice(0, limit);
  },

  getKDramaAndKPopHTML() {
    const songs = this.getKDramaAndKPopSongs(15);
    if (!songs || songs.length === 0) return '';

    const carouselId = 'sp-kdrama-kpop-carousel';
    return `
      <div class="sp-songs-for-you-section" style="margin-bottom: 38px;">
        <div class="sp-sfy-header">
          <div>
            <h2 class="sp-sfy-title">K-Drama and K-Pop Soundtracks</h2>
            <p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">Emotional OSTs, chart-topping K-Pop anthems & Korean drama melodies</p>
          </div>
          <div class="sp-sfy-controls">
            <button class="sp-sfy-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -420, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-sfy-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 420, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
            <button class="sp-sfy-see-all" onclick="navigateTo('library')" title="See All K-Drama & K-Pop">SEE ALL</button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-sfy-carousel">
          ${songs.map(song => {
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=K-Drama';
            const isPlaying = (typeof state !== 'undefined' && state.currentPlayingSongId === song.id);

            return `
              <div class="sp-sfy-track-item ${isPlaying ? 'is-playing' : ''}" 
                   onclick="playRecsSong('${songIdEscaped}')" 
                   title="${song.title}">
                <div class="sp-sfy-thumb-wrap">
                  <img src="${thumb}" alt="${song.title}" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=K-Drama';">
                  <div class="sp-sfy-play-overlay">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="#ffffff"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>

                <div class="sp-sfy-meta">
                  <span class="sp-sfy-track-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" title="${song.title}">${song.title}</span>
                  <span class="sp-sfy-artist card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Korean Artist').replace(/'/g, "\\'")}');" title="${song.artist || 'Korean Artist'}">${song.artist || 'Korean Artist'}</span>
                </div>

                <div class="sp-sfy-actions" onclick="event.stopPropagation();">
                  <button class="sp-sfy-action-btn" onclick="toggleLikeSong('${songIdEscaped}');" title="Save to Your Liked Songs">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                  <button class="sp-sfy-action-btn" onclick="openTrackContextMenu(event, '${songIdEscaped}');" title="More options">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderV2Top10Row(title, songs) {
    if (!songs || songs.length === 0) return '';
    const cleanSongs = songs.slice(0, 10);

    return `
      <div class="sp-v2-top10-section">
        <div class="sp-v2-top10-header">
          <h2 class="sp-v2-top10-title">${title}</h2>
          <button class="sp-v2-top10-see-all" onclick="navigateTo('library');" title="See all ${title}">See all</button>
        </div>

        <div class="sp-v2-top10-carousel">
          ${cleanSongs.map((song, index) => {
            const rank = index + 1;
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
            const hasBadge = song.recentlyAdded || index === 0 || index === 1 || index === 3;

            return `
              <div class="sp-v2-top10-item-wrap">
                <div class="sp-v2-rank-number">${rank}</div>
                <div class="sp-v2-top10-card" onclick="playRecsSong('${songIdEscaped}')" title="${song.title}">
                  <div class="sp-v2-artwork-box">
                    <img src="${thumb}" alt="${song.title}" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                    ${hasBadge ? `<span class="sp-v2-recently-badge">Recently added</span>` : ''}
                    <button class="sp-v2-top10-play-btn" onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" aria-label="Play ${song.title}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                  <div class="sp-v2-top10-card-title card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" title="${song.title}">${song.title}</div>
                  <div class="sp-v2-top10-card-artist card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Unknown Artist').replace(/'/g, "\\'")}');" title="${song.artist || 'Unknown Artist'}">${song.artist || 'Unknown Artist'}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  getMoreLikeArtist(artistName, limit = 10) {
    if (!artistName) return [];
    const pool = this.getAllSongsPool();
    const cleanTarget = artistName.toLowerCase().trim();

    return pool.filter(s => {
      const a = (s.artist || s.singers || '').toLowerCase();
      return a.includes(cleanTarget);
    }).slice(0, limit);
  },

  
  getHeavyRotation(limit = 10) {
    const playCounts = (typeof WaveHistory !== 'undefined' && WaveHistory.getPlayCounts) ? WaveHistory.getPlayCounts() : {};
    const entries = Object.values(playCounts);
    const pool = this.getAllSongsPool();
    
    return entries
      .filter(e => e && (e.count >= 2 || entries.length <= 4))
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit)
      .map(e => {
        const sid = String(e.song?.songId || e.song?.id || e.songId || '');
        const titleStr = String(e.song?.title || '').toLowerCase().trim();
        
        
        const matched = pool.find(s => 
          (sid && String(s.id) === sid) || 
          (titleStr && String(s.title).toLowerCase().trim() === titleStr)
        );

        if (matched) return matched;

        
        const base = e.song || e;
        const audioUrl = base.audioUrl || base.url || base.media_url || '';
        return {
          id: sid || base.id || `hr-${Date.now()}`,
          title: base.title || 'Unknown Track',
          artist: base.artist || 'Unknown Artist',
          img: base.img || base.thumb || 'https://placehold.co/200x200/121212/1ed760?text=Music',
          thumb: base.thumb || base.img || 'https://placehold.co/200x200/121212/1ed760?text=Music',
          audioUrl: audioUrl,
          url: audioUrl,
          media_url: audioUrl,
          duration: base.duration || '3:30',
          isCloud: true
        };
      })
      .filter(s => s && (s.id || s.title));
  },

  getHeavyRotationHTML() {
    const heavyRotation = this.getHeavyRotation(10);
    if (heavyRotation.length < 2) return '';
    const carouselId = 'sp-heavy-rotation-carousel';

    return `
      <div class="sp-ml-section" style="margin-bottom: 36px;">
        <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">Your Heavy Rotation</h2>
            <p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">The tracks you have on repeat right now</p>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -400, behavior: 'smooth'})" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 400, behavior: 'smooth'})" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
          ${heavyRotation.map(song => {
            if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
            const songId = String(song.id || song.songId || song.title);
            const songIdEscaped = encodeURIComponent(songId);
            const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
            return `
              <div class="sp-ml-card" onclick="playRecsSong('${songIdEscaped}')">
                <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                  <img src="${thumb}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                  <button class="sp-ml-play-btn" 
                          onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" 
                          style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                          aria-label="Play ${song.title}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.title}">${song.title}</div>
                <div class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Unknown Artist').replace(/'/g, "\\'")}');" style="font-size: 12px; color: #888888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.artist || 'Unknown Artist'}">${song.artist || 'Unknown Artist'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  getBasedOnRecent(limit = 10) {
    const profile = this.getUserProfile();
    if (!profile.recentHistory || profile.recentHistory.length === 0) return [];

    const recentIds = new Set(profile.recentHistory.map(s => String(s.songId || s.id)));
    const targetArtists = profile.topArtists.slice(0, 4).map(a => a.toLowerCase());
    const pool = this.getAllSongsPool();

    return pool.filter(s => {
      const id = String(s.id);
      if (recentIds.has(id)) return false;
      const sArtist = (s.artist || '').toLowerCase();
      return targetArtists.some(a => sArtist.includes(a));
    }).slice(0, limit);
  },

  
  getGenreDeepDive(genreKey, limit = 10) {
    const pool = this.getAllSongsPool();
    const regexMap = {
      'hindi': /hindi|bollywood|arijit|jubin|shreya|armaan|sonu/i,
      'english': /english|alan walker|ed sheeran|taylor|billie|pop|dua/i,
      'islamic': /islamic|nasheed|naat|qadri|hussani|zain|tariq/i,
      'kpop': /kpop|bts|blackpink|twice|stray kids|k-pop/i,
      'anime': /anime|naruto|jujutsu|demon slayer|yoasobi|ost/i,
      'pakistani': /pakistani|coke studio|ali zafar|rahat|qawwali/i,
      'romantic': /love|dil|tum|ishq|romantic|mohabbat/i,
      'chill': /chill|night|calm|rain|relax|lofi|peace/i,
      'energy': /party|dance|rock|gym|workout|beat|edm/i
    };

    const rx = regexMap[genreKey];
    if (!rx) return [];

    return pool.filter(s => {
      const str = `${s.title || ''} ${s.artist || ''} ${s.album || ''}`.toLowerCase();
      return rx.test(str);
    }).slice(0, limit);
  },

  
  getTimeOfDayMix(limit = 10) {
    const hour = new Date().getHours();
    const pool = this.getAllSongsPool();

    if (hour >= 22 || hour < 5) {
      
      return {
        title: 'Your Late Night Session',
        subtitle: 'Mellow tones, soulful melodies, and late night tracks',
        songs: pool.filter(s => /night|calm|slow|love|dil|nasheed|acoustic|lofi|sad/i.test(`${s.title} ${s.artist}`)).slice(0, limit)
      };
    } else if (hour >= 5 && hour < 12) {
      
      return {
        title: 'Morning Motivation',
        subtitle: 'Positive energy, fresh starts, and uplifting rhythms',
        songs: pool.filter(s => /fresh|peace|shine|morning|smile|dua|hope|happy/i.test(`${s.title} ${s.artist}`)).slice(0, limit)
      };
    } else {
      
      return {
        title: 'Daily Flow & High Energy',
        subtitle: 'Keep your momentum going with your personalized mix',
        songs: pool.filter(s => /party|flow|energy|beat|top|hit|pop|rock/i.test(`${s.title} ${s.artist}`)).slice(0, limit)
      };
    }
  },

  
  renderPlaylistAlbumRow(title, items, isAlbum = false) {
    if (!items || items.length === 0) return '';
    const carouselId = 'ml-row-pl-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return `
      <div class="sp-ml-section" style="margin-bottom: 36px;">
        <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">${title}</h2>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="sp-gs-arrow-btn" onclick="const el = document.getElementById('${carouselId}'); if (el) el.scrollBy({left: -400, behavior: 'smooth'});" title="Previous">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>
            <button class="sp-gs-arrow-btn" onclick="const el = document.getElementById('${carouselId}'); if (el) el.scrollBy({left: 400, behavior: 'smooth'});" title="Next">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>

        <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
          ${items.map(item => {
            const name = (item.name || item.title || (isAlbum ? 'Album' : 'Playlist')).replace(/"/g, '&quot;');
            const imgUrl = item.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80';
            const trackCount = Array.isArray(item.songs) ? item.songs.length : 0;
            const subText = item.description || (trackCount > 0 ? `${trackCount} track${trackCount > 1 ? 's' : ''}` : (isAlbum ? 'Full Album' : 'Curated Playlist'));
            const subTextEsc = subText.replace(/"/g, '&quot;');

            return `
              <div class="sp-ml-card" onclick="navigateTo('${isAlbum ? 'album' : 'playlist'}', event, '${item.id}')" style="cursor: pointer; min-width: 170px; max-width: 190px; flex-shrink: 0;">
                <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 8px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                  <img src="${imgUrl}" alt="${name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/300x300/121212/1ed760?text=Wave';">
                  <button class="sp-ml-play-btn" 
                          onclick="event.stopPropagation(); playAllPlaylistSongs('${item.id}')" 
                          style="position: absolute; right: 8px; bottom: 8px; width: 42px; height: 42px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                          aria-label="Play ${name}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                  </button>
                </div>
                <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('${isAlbum ? 'album' : 'playlist'}', event, '${item.id}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px;" title="${name}">${name}</div>
                <div style="font-size: 12px; color: #888888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;" title="${subTextEsc}">${subText}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  
  
  
  getDynamicRowsHTML() {
    const profile = this.getUserProfile();
    const generatedRows = [];

    
    if ((!state.customPlaylists || state.customPlaylists.length === 0) && !this._fetchingPlaylists) {
      this._fetchingPlaylists = true;
      Promise.all([
        fetch('data/custom-playlists.json').then(r => r.json()).catch(() => null),
        fetch('data/ost-albums.json').then(r => r.json()).catch(() => null)
      ]).then(([cPl, cOst]) => {
        let changed = false;
        if (cPl && Array.isArray(cPl.playlists) && cPl.playlists.length > 0) {
          state.customPlaylists = cPl.playlists;
          changed = true;
        }
        if (cOst && Array.isArray(cOst.albums) && cOst.albums.length > 0) {
          state.ostAlbums = cOst.albums;
          changed = true;
        }
        if (changed) {
          const secContainer = document.getElementById('sections-container');
          if (secContainer && state.currentView === 'home') {
            secContainer.innerHTML = WaveRecsEngine.getDynamicRowsHTML();
          }
        }
      });
    }

    
    const allPlaylistsSource = (state.customPlaylists && state.customPlaylists.length > 0) ? state.customPlaylists : ((typeof cloudData !== 'undefined' && cloudData.playlists) || []);
    const allAlbumsSource = (state.ostAlbums && state.ostAlbums.length > 0) ? state.ostAlbums : ((typeof cloudData !== 'undefined' && cloudData.albums) || []);

    const communityPlaylists = allPlaylistsSource.filter(p => p.category === 'community' || p.type === 'community' || (p.name && /community/i.test(p.name)));
    const playlistsForYou = allPlaylistsSource.filter(p => p.category === 'for_you' || p.type === 'for_you' || (p.name && /for you/i.test(p.name)) || (!communityPlaylists.some(c => c.id === p.id)));
    const albumsForYou = allAlbumsSource.filter(a => a.category === 'albums_for_you' || a.type === 'albums_for_you' || (a.category === 'album' && !/ost/i.test(a.name || '')));
    const ostAlbumsForYou = allAlbumsSource.filter(a => a.category === 'ost_albums' || a.category === 'ost' || a.type === 'ost' || /ost|soundtrack/i.test(a.name || '') || (!albumsForYou.some(af => af.id === a.id)));

    
    const communityPlaylistsHTML = this.renderPlaylistAlbumRow('Community Playlists', communityPlaylists.length > 0 ? communityPlaylists : allPlaylistsSource.slice(0, 2), false);

    
    const playlistsForYouHTML = this.renderPlaylistAlbumRow('Playlists for You', playlistsForYou.length > 0 ? playlistsForYou : allPlaylistsSource.slice(2, 4), false);

    
    const albumsForYouHTML = this.renderPlaylistAlbumRow('Albums for You', albumsForYou.length > 0 ? albumsForYou : allAlbumsSource.slice(0, 2), true);

    
    const ostAlbumsHTML = this.renderPlaylistAlbumRow('OST and Albums for you', ostAlbumsForYou.length > 0 ? ostAlbumsForYou : allAlbumsSource.slice(2, 4), true);

    
    const songsForYouHTML = this.getSongsForYouHTML();

    
    const top10EnglishHTML = this.renderV2Top10Row('Top 10 English Songs', this.getTop10EnglishSongs());

    
    const popularEnglishHTML = this.getPopularEnglishSongsHTML();

    
    const bestOfBollywoodHTML = this.getBestOfBollywoodHTML();

    
    const top10HindiHTML = this.renderV2Top10Row('Top 10 Hindi Songs', this.getTop10HindiSongs());

    
    const soulfulNaatsHTML = this.getSoulfulNaatsHTML();

    
    const top10NaatsHTML = this.renderV2Top10Row('Top 10 Naats', this.getTop10Naats());

    
    const timeMix = this.getTimeOfDayMix(10);
    let timeOfDayRowHTML = '';
    if (timeMix.songs.length >= 3) {
      const carouselId = 'ml-row-carousel-time-of-day';
      timeOfDayRowHTML = `
        <div class="sp-ml-section" style="margin-bottom: 36px;">
          <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div>
              <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">${timeMix.title}</h2>
              ${timeMix.subtitle ? `<p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">${timeMix.subtitle}</p>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -400, behavior: 'smooth'})" title="Previous">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 400, behavior: 'smooth'})" title="Next">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
          </div>

          <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
            ${timeMix.songs.map(song => {
              if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
              const songId = String(song.id || song.songId || song.title);
              const songIdEscaped = encodeURIComponent(songId);
              const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
              return `
                <div class="sp-ml-card" onclick="playRecsSong('${songIdEscaped}')">
                  <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                    <img src="${thumb}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                    <button class="sp-ml-play-btn" 
                            onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" 
                            style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                            aria-label="Play ${song.title}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                  <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.title}">${song.title}</div>
                  <div class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Unknown Artist').replace(/'/g, "\\'")}');" style="font-size: 12px; color: #888888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.artist || 'Unknown Artist'}">${song.artist || 'Unknown Artist'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    
    const popularHindiHTML = this.getPopularHindiSongsHTML();

    
    const heavyRotationHTML = this.getHeavyRotationHTML();

    
    const kdramaHTML = this.getKDramaAndKPopHTML();

    
    if (profile.topArtists.length > 0) {
      const topArtist = profile.topArtists[0];
      const moreLikeArtist = this.getMoreLikeArtist(topArtist, 10);
      if (moreLikeArtist.length >= 3) {
        generatedRows.push({
          id: `row-more-like-${topArtist.replace(/\s+/g, '-').toLowerCase()}`,
          title: `More Like ${topArtist}`,
          subtitle: `Fans of ${topArtist} love these tracks`,
          songs: moreLikeArtist
        });
      }
    }

    
    const basedOnRecent = this.getBasedOnRecent(10);
    if (basedOnRecent.length >= 3) {
      generatedRows.push({
        id: 'row-based-on-recent',
        title: 'Based on Your Recent Listening',
        subtitle: 'Inspired by your recent listening habits',
        songs: basedOnRecent
      });
    }

    
    if (profile.topGenres.length > 0) {
      const topGenre = profile.topGenres[0];
      const genreTitles = {
        'hindi': 'Deep Dive into Bollywood & Hindi Hits',
        'english': 'Deep Dive into English & Global Pop',
        'islamic': 'Deep Dive into Soulful Nasheeds & Spiritual',
        'kpop': 'Deep Dive into K-Pop Energy & Vibes',
        'anime': 'Deep Dive into Anime Soundtracks & OSTs',
        'pakistani': 'Deep Dive into Pakistani & Coke Studio Melodies',
        'romantic': 'Deep Dive into Romantic Melodies & Love Songs',
        'chill': 'Deep Dive into Lo-Fi & Chill Vibes',
        'energy': 'Deep Dive into Workout & High Energy'
      };

      const genreSongs = this.getGenreDeepDive(topGenre, 10);
      if (genreSongs.length >= 3) {
        generatedRows.push({
          id: `row-genre-${topGenre}`,
          title: genreTitles[topGenre] || `Best of ${topGenre.toUpperCase()}`,
          subtitle: `Curated exclusively based on your interest in ${topGenre}`,
          songs: genreSongs
        });
      }
    }

    
    const otherRowsHTML = generatedRows.map((row, rowIdx) => {
      const carouselId = `ml-row-carousel-${rowIdx}`;
      return `
        <div class="sp-ml-section" style="margin-bottom: 36px;">
          <div class="sp-ml-header" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div>
              <h2 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px;">${row.title}</h2>
              ${row.subtitle ? `<p style="font-size: 13px; color: #888888; margin: 4px 0 0 0; font-weight: 500;">${row.subtitle}</p>` : ''}
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: -400, behavior: 'smooth'})" title="Previous">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              </button>
              <button class="sp-gs-arrow-btn" onclick="document.getElementById('${carouselId}').scrollBy({left: 400, behavior: 'smooth'})" title="Next">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
              </button>
            </div>
          </div>

          <div id="${carouselId}" class="sp-ml-carousel" style="display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; scroll-behavior: smooth; padding: 4px 0 8px 0;">
            ${row.songs.map(song => {
              if (typeof normalizeSongFields === 'function') normalizeSongFields(song);
              const songId = String(song.id || song.songId || song.title);
              const songIdEscaped = encodeURIComponent(songId);
              const thumb = song.thumb || song.img || 'https://placehold.co/200x200/121212/1ed760?text=Music';
              return `
                <div class="sp-ml-card" onclick="playRecsSong('${songIdEscaped}')">
                  <div style="position: relative; width: 100%; aspect-ratio: 1/1; border-radius: 6px; overflow: hidden; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
                    <img src="${thumb}" alt="${song.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.onerror=null; this.src='https://placehold.co/200x200/121212/1ed760?text=Music';">
                    <button class="sp-ml-play-btn" 
                            onclick="event.stopPropagation(); playRecsSong('${songIdEscaped}')" 
                            style="position: absolute; right: 8px; bottom: 8px; width: 40px; height: 40px; border-radius: 50%; background: #1ed760; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 6px 16px rgba(0,0,0,0.5); opacity: 0; transform: translateY(8px); transition: opacity 0.2s, transform 0.2s;"
                            aria-label="Play ${song.title}">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="#000"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  </div>
                  <div class="card-title-link" onclick="event.stopPropagation(); navigateTo('song', event, '${songIdEscaped}');" style="font-size: 14px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.title}">${song.title}</div>
                  <div class="card-artist-link" onclick="event.stopPropagation(); navigateToArtistByName('${(song.artist || 'Unknown Artist').replace(/'/g, "\\'")}');" style="font-size: 12px; color: #888888; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${song.artist || 'Unknown Artist'}">${song.artist || 'Unknown Artist'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }).join('');

    return songsForYouHTML + top10EnglishHTML + popularEnglishHTML + bestOfBollywoodHTML + top10HindiHTML + communityPlaylistsHTML + playlistsForYouHTML + soulfulNaatsHTML + top10NaatsHTML + timeOfDayRowHTML + albumsForYouHTML + ostAlbumsHTML + popularHindiHTML + heavyRotationHTML + kdramaHTML + otherRowsHTML;
  }
};

try {
  setTimeout(() => {
    if (window.WaveRecsEngine && window.WaveRecsEngine.fetchBestOfBollywoodFromJio) {
      window.WaveRecsEngine.fetchBestOfBollywoodFromJio(15);
    }
  }, 1000);
} catch (e) {}

window.playRecsSong = function(encodedId) {
  if (!encodedId) return;
  const rawId = decodeURIComponent(encodedId);
  const pool = WaveRecsEngine.getAllSongsPool();

  let song = pool.find(s => 
    String(s.id) === rawId || 
    String(s.songId) === rawId || 
    String(s.title).toLowerCase() === rawId.toLowerCase()
  );

  
  if (!song && Array.isArray(WaveRecsEngine._bollywoodJioSongs)) {
    song = WaveRecsEngine._bollywoodJioSongs.find(s => 
      String(s.id) === rawId || 
      String(s.songId) === rawId || 
      String(s.title).toLowerCase() === rawId.toLowerCase()
    );
  }

  
  if (!song && typeof WaveHistory !== 'undefined') {
    const history = WaveHistory.getHistory();
    const histEntry = history.find(h => String(h.songId || h.id) === rawId || String(h.title).toLowerCase() === rawId.toLowerCase());
    if (histEntry) {
      song = { ...histEntry, id: histEntry.id || histEntry.songId };
    }
  }

  if (!song) {
    console.warn('[WaveRecsEngine] Song not found in pool:', rawId);
    return;
  }

  
  song.audioUrl = song.audioUrl || song.url || song.media_url;
  song.url = song.audioUrl;
  song.media_url = song.audioUrl;

  if (typeof normalizeSongFields === 'function') normalizeSongFields(song);

  
  if (typeof playJioSaavnSong === 'function' && song.audioUrl) {
    playJioSaavnSong(song);
  } else if (typeof playSpecificSong === 'function') {
    playSpecificSong(song.id);
  }
};
