

(function() {
  'use strict';

  const CACHE = {
    korean: null,
    anime: null,
    naat: null,
    english: null,
    pakistani: null,
    hindi: null
  };

  let isGenerating = false;
  let lastGeneratedSongId = null;

  
  async function fetchCategorySongs(type) {
    if (CACHE[type] && CACHE[type].length > 0) return CACHE[type];

    const fileMap = {
      korean: 'data/korean-songs.json',
      anime: 'data/anime-songs.json',
      naat: 'data/naat-songs.json',
      english: 'data/english-songs.json',
      pakistani: 'data/pakistani-songs.json',
      hindi: 'data/hindi-songs.json',
      customPlaylist: 'data/custom-playlists.json',
      ostAlbums: 'data/ost-albums.json'
    };

    const filePath = fileMap[type];
    if (!filePath) return [];

    try {
      const res = await fetch(filePath);
      if (res.ok) {
        const data = await res.json();
        const songs = Array.isArray(data.songs) ? data.songs : (Array.isArray(data) ? data : []);
        CACHE[type] = songs.filter(s => s && s.title && (s.audioUrl || s.url));
        return CACHE[type];
      }
    } catch (e) {
      console.warn(`Failed to load ${filePath}:`, e);
    }
    return [];
  }

  
  function detectSongCategory(song) {
    if (!song) return 'jiosaavn';

    const tags = Array.isArray(song.tags) ? song.tags.map(t => String(t).toLowerCase()) : [];
    const title = (song.title || '').toLowerCase();
    const artist = (song.artist || '').toLowerCase();
    const album = (song.album || '').toLowerCase();
    const lang = (song.language || '').toLowerCase();

    
    if (
      tags.some(t => t.includes('islamic') || t.includes('naat') || t.includes('nasheed')) ||
      album.includes('islamic') || album.includes('naat') ||
      artist.includes('maher zain') || artist.includes('sami yusuf') || artist.includes('qadri') ||
      artist.includes('fasih') || artist.includes('musthaqeem') || artist.includes('hafiz tahir') ||
      title.includes('ya nabi') || title.includes('salam alayka') || title.includes('hasbi rabbi') ||
      title.includes('naat') || title.includes('madina') || title.includes('allah')
    ) {
      return 'naat';
    }

    
    if (
      tags.some(t => t.includes('k-drama') || t.includes('kpop') || t.includes('korean')) ||
      album.includes('k-drama') || album.includes('queen of tears') || album.includes('ost') ||
      artist.includes('bts') || artist.includes('blackpink') || artist.includes('crush') ||
      artist.includes('iu') || artist.includes('newjeans') || artist.includes('stray kids') ||
      artist.includes('txt') || artist.includes('twice') || artist.includes('exo') ||
      artist.includes('lim yeon') || artist.includes('taeyeon') ||
      title.includes('golden') || title.includes('dreamers') || title.includes('love you with all my heart')
    ) {
      return 'korean';
    }

    
    if (
      tags.some(t => t.includes('anime')) ||
      album.includes('anime') || title.includes('anime') ||
      title.includes('naruto') || title.includes('attack on titan') || title.includes('jujutsu') ||
      title.includes('demon slayer') || title.includes('tokyo ghoul') || title.includes('one piece')
    ) {
      return 'anime';
    }

    
    if (
      tags.some(t => t.includes('english') || t.includes('pop') || t.includes('edm') || t.includes('western')) ||
      lang === 'english' ||
      artist.includes('alan walker') || artist.includes('taylor swift') || artist.includes('weeknd') ||
      artist.includes('ed sheeran') || artist.includes('justin bieber') || artist.includes('billie eilish') ||
      artist.includes('post malone') || artist.includes('charlie puth') || artist.includes('dua lipa') ||
      artist.includes('coldplay') || artist.includes('marshmello') || artist.includes('chainsmokers') ||
      title.includes('faded') || title.includes('shape of you') || title.includes('blinding lights')
    ) {
      return 'english';
    }

    
    if (
      tags.some(t => t.includes('pakistani') || t.includes('coke-studio')) ||
      artist.includes('annural khalid') || artist.includes('kaifi khalil') || artist.includes('ali sethi') ||
      artist.includes('abdul hannan') || artist.includes('hasan raheem') || artist.includes('asim azhar') ||
      artist.includes('young stunners') || artist.includes('coke studio')
    ) {
      return 'pakistani';
    }

    
    if (String(song.id).startsWith('c-song-') && (tags.includes('hindi') || tags.includes('top-10-hindi'))) {
      return 'hindi';
    }

    
    return 'jiosaavn';
  }

  
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  
  function normalizeTitle(t) {
    return (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  
  async function generateIntelligentQueue(currentSong, targetCount = 30) {
    if (!currentSong || isGenerating) return;
    
    if (typeof state !== 'undefined' && state.playbackContext && (state.playbackContext.type === 'playlist' || state.playbackContext.type === 'album')) {
      return;
    }
    if (lastGeneratedSongId === currentSong.id) return;

    isGenerating = true;
    lastGeneratedSongId = currentSong.id;

    const category = detectSongCategory(currentSong);
    console.log(`[SmartQueue] Generating 30 intelligent queue songs for: "${currentSong.title}" [Category: ${category}]`);

    const resultPool = [];
    const seenIds = new Set([String(currentSong.id)]);
    const seenTitles = new Set([normalizeTitle(currentSong.title)]);

    const isDup = (s) => {
      if (!s || (!s.audioUrl && !s.url)) return true;
      const sId = String(s.id);
      if (seenIds.has(sId)) return true;
      const nTitle = normalizeTitle(s.title);
      if (nTitle && seenTitles.has(nTitle)) return true;
      return false;
    };

    const addSong = (s) => {
      if (isDup(s)) return false;
      seenIds.add(String(s.id));
      const nTitle = normalizeTitle(s.title);
      if (nTitle) seenTitles.add(nTitle);
      
      
      if (typeof normalizeSongFields === 'function') {
        normalizeSongFields(s);
      }
      resultPool.push(s);
      return true;
    };

    
    
    
    if (category === 'naat') {
      const naatSongs = await fetchCategorySongs('naat');
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        const cloudNaats = cloudData.songs.filter(s => {
          const t = Array.isArray(s.tags) ? s.tags.map(x => String(x).toLowerCase()) : [];
          return t.some(x => x.includes('islamic') || x.includes('naat'));
        });
        cloudNaats.forEach(s => addSong(s));
      }

      const shuffled = shuffleArray(naatSongs);
      for (const s of shuffled) {
        if (resultPool.length >= targetCount) break;
        addSong(s);
      }
    }

    
    
    
    else if (category === 'korean') {
      const koreanSongs = await fetchCategorySongs('korean');
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        const cloudKorean = cloudData.songs.filter(s => {
          const t = Array.isArray(s.tags) ? s.tags.map(x => String(x).toLowerCase()) : [];
          return t.some(x => x.includes('k-drama') || x.includes('kpop') || x.includes('korean'));
        });
        cloudKorean.forEach(s => addSong(s));
      }

      const shuffled = shuffleArray(koreanSongs);
      for (const s of shuffled) {
        if (resultPool.length >= targetCount) break;
        addSong(s);
      }
    }

    
    
    
    else if (category === 'anime') {
      const animeSongs = await fetchCategorySongs('anime');
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        const cloudAnime = cloudData.songs.filter(s => {
          const t = Array.isArray(s.tags) ? s.tags.map(x => String(x).toLowerCase()) : [];
          return t.some(x => x.includes('anime'));
        });
        cloudAnime.forEach(s => addSong(s));
      }

      const shuffled = shuffleArray(animeSongs);
      for (const s of shuffled) {
        if (resultPool.length >= targetCount) break;
        addSong(s);
      }
    }

    
    
    
    else if (category === 'english') {
      const engSongs = await fetchCategorySongs('english');
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        const cloudEng = cloudData.songs.filter(s => {
          const t = Array.isArray(s.tags) ? s.tags.map(x => String(x).toLowerCase()) : [];
          return t.some(x => x.includes('english') || x.includes('pop') || x.includes('edm'));
        });
        cloudEng.forEach(s => addSong(s));
      }

      const shuffled = shuffleArray(engSongs);
      for (const s of shuffled) {
        if (resultPool.length >= targetCount) break;
        addSong(s);
      }
    }

    
    
    
    else if (category === 'pakistani') {
      const pakSongs = await fetchCategorySongs('pakistani');
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        const cloudPak = cloudData.songs.filter(s => {
          const t = Array.isArray(s.tags) ? s.tags.map(x => String(x).toLowerCase()) : [];
          return t.some(x => x.includes('pakistani') || x.includes('coke-studio'));
        });
        cloudPak.forEach(s => addSong(s));
      }

      const shuffled = shuffleArray(pakSongs);
      for (const s of shuffled) {
        if (resultPool.length >= targetCount) break;
        addSong(s);
      }
    }

    
    
    
    else if (category === 'hindi') {
      const hindiSongs = await fetchCategorySongs('hindi');
      if (typeof cloudData !== 'undefined' && Array.isArray(cloudData.songs)) {
        const cloudHindi = cloudData.songs.filter(s => {
          const t = Array.isArray(s.tags) ? s.tags.map(x => String(x).toLowerCase()) : [];
          return t.some(x => x.includes('hindi') || x.includes('top-10-hindi'));
        });
        cloudHindi.forEach(s => addSong(s));
      }

      const shuffled = shuffleArray(hindiSongs);
      for (const s of shuffled) {
        if (resultPool.length >= targetCount) break;
        addSong(s);
      }
    }

    
    
    
    if (category === 'jiosaavn' || resultPool.length < 15) {
      if (typeof JIOSAAVN_API !== 'undefined') {
        const songId = currentSong.jiosaavnId || currentSong.id;
        const artistPrimary = (currentSong.artist || '').split(',')[0].split('&')[0].trim();
        const albumName = (currentSong.album || '').trim();

        
        if (songId && !String(songId).startsWith('c-song-')) {
          try {
            const suggestions = await JIOSAAVN_API.getSongSuggestions(songId, 30);
            if (Array.isArray(suggestions)) {
              suggestions.forEach(s => {
                if (resultPool.length < targetCount) addSong(s);
              });
            }
          } catch (e) {}
        }

        
        if (resultPool.length < targetCount && artistPrimary) {
          try {
            const artistHits = await JIOSAAVN_API.searchSongs(`${artistPrimary} top hits`, 25);
            if (Array.isArray(artistHits)) {
              artistHits.forEach(s => {
                if (resultPool.length < targetCount) addSong(s);
              });
            }
          } catch (e) {}
        }

        
        if (resultPool.length < targetCount && albumName && albumName.length > 2) {
          try {
            const albumHits = await JIOSAAVN_API.searchSongs(`${albumName}`, 20);
            if (Array.isArray(albumHits)) {
              albumHits.forEach(s => {
                if (resultPool.length < targetCount) addSong(s);
              });
            }
          } catch (e) {}
        }
      }
    }

    
    if (typeof state !== 'undefined' && Array.isArray(resultPool) && resultPool.length > 0) {
      if (!Array.isArray(state.queue) || state.queue.length === 0) {
        state.queue = [currentSong];
        state.currentIndex = 0;
      }

      const curSongInQueue = state.queue[state.currentIndex] || currentSong;
      const seenIds = new Set(state.queue.map(s => String(s.id)));
      const seenTitles = new Set(state.queue.map(s => normalizeTitle(s.title)));

      for (const s of resultPool) {
        const sId = String(s.id);
        const nT = normalizeTitle(s.title);
        if (!seenIds.has(sId) && (!nT || !seenTitles.has(nT))) {
          seenIds.add(sId);
          if (nT) seenTitles.add(nT);
          state.queue.push(s);
        }
      }

      
      if (typeof renderQueuePanel === 'function') renderQueuePanel();
      if (typeof renderSidebarQueue === 'function') renderSidebarQueue();
      if (window.NextWave && state.queue[state.currentIndex + 1]) {
        window.NextWave.updateNextUpBadge(curSongInQueue, state.queue[state.currentIndex + 1]);
      }
    }

    isGenerating = false;
  }

  
  window.SmartQueue = {
    detectCategory: detectSongCategory,
    generateQueue: generateIntelligentQueue
  };
})();
