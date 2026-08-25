

(function () {
  let searchTimeout = null;
  let currentPreviewAudio = null;
  let currentPlayingId = null;
  let builderSongs = [];

  
  try {
    const saved = localStorage.getItem('wave_builder_playlist');
    if (saved) {
      builderSongs = JSON.parse(saved);
    }
  } catch (e) {
    builderSongs = [];
  }

  
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const resultsContainer = document.getElementById('results-container');
  const searchStats = document.getElementById('search-stats');
  const loadingSpinner = document.getElementById('loading-spinner');
  const toastEl = document.getElementById('toast');

  
  const builderCountEl = document.getElementById('builder-count');
  const builderListEl = document.getElementById('builder-list');
  const playlistNameInput = document.getElementById('playlist-name-input');
  const copyFullJsonBtn = document.getElementById('copy-full-json-btn');
  const clearBuilderBtn = document.getElementById('clear-builder-btn');
  const downloadJsonBtn = document.getElementById('download-json-btn');

  
  function init() {
    renderBuilderList();

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const val = searchInput.value.trim();
        if (clearSearchBtn) clearSearchBtn.style.display = val ? 'flex' : 'none';

        clearTimeout(searchTimeout);
        if (val.length >= 2) {
          searchTimeout = setTimeout(() => performSearch(val), 400);
        } else if (val.length === 0) {
          resultsContainer.innerHTML = `
            <div class="empty-state">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <h3>Search for any song</h3>
              <p>Type song title, artist, or movie to find JioSaavn Song IDs instantly</p>
            </div>
          `;
          searchStats.textContent = '';
        }
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          clearTimeout(searchTimeout);
          performSearch(searchInput.value.trim());
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
      });
    }

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        searchInput.focus();
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <h3>Search for any song</h3>
            <p>Type song title, artist, or movie to find JioSaavn Song IDs instantly</p>
          </div>
        `;
        searchStats.textContent = '';
      });
    }

    if (copyFullJsonBtn) {
      copyFullJsonBtn.addEventListener('click', copyFullPlaylistJSON);
    }

    if (clearBuilderBtn) {
      clearBuilderBtn.addEventListener('click', clearBuilder);
    }

    if (downloadJsonBtn) {
      downloadJsonBtn.addEventListener('click', downloadPlaylistJSON);
    }
  }

  
  function showToast(msg, type = 'success') {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.className = `toast show ${type}`;
    setTimeout(() => {
      toastEl.className = 'toast';
    }, 2800);
  }

  
  function copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(successMsg);
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  const searchResultsMap = new Map();

  
  async function performSearch(query) {
    if (!query || query.length < 2) return;

    if (loadingSpinner) loadingSpinner.style.display = 'flex';
    if (searchStats) searchStats.textContent = 'Searching JioSaavn catalog...';

    try {
      let results = [];
      if (typeof JIOSAAVN_API !== 'undefined' && JIOSAAVN_API.searchSongs) {
        results = await JIOSAAVN_API.searchSongs(query, 30);
      } else {
        
        const endpoints = [
          'https://saavn-api-one.vercel.app',
          'https://jiosaavn-api-beta.vercel.app',
          'https://jiosaavn-api-taupe.vercel.app'
        ];
        for (const base of endpoints) {
          try {
            const res = await fetch(`${base}/search/songs?query=${encodeURIComponent(query)}&limit=30`);
            if (res.ok) {
              const data = await res.json();
              const raw = data.data?.results || data.results || [];
              if (raw.length > 0) {
                results = raw.map(r => ({
                  id: r.id,
                  title: r.name || r.title || r.song,
                  artist: r.primaryArtists || r.artists?.primary?.map(a => a.name).join(', ') || r.artist || 'Unknown',
                  album: r.album?.name || r.album || '',
                  year: r.year || '',
                  duration: r.duration ? `${Math.floor(r.duration / 60)}:${(r.duration % 60).toString().padStart(2, '0')}` : '0:00',
                  img: r.image?.[2]?.url || r.image?.[1]?.url || r.image || 'https://placehold.co/150x150/181818/1ed760?text=Music',
                  audioUrl: r.downloadUrl?.[4]?.url || r.downloadUrl?.[0]?.url || r.url || ''
                }));
                break;
              }
            }
          } catch (e) {}
        }
      }

      if (loadingSpinner) loadingSpinner.style.display = 'none';

      if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
            <h3>No songs found for "${escapeHTML(query)}"</h3>
            <p>Try searching with another song title, artist, or movie name</p>
          </div>
        `;
        searchStats.textContent = '0 songs found';
        return;
      }

      searchResultsMap.clear();
      results.forEach(s => {
        if (s && s.id) searchResultsMap.set(String(s.id), s);
      });

      searchStats.textContent = `Found ${results.length} songs for "${query}"`;
      renderResults(results);

    } catch (err) {
      if (loadingSpinner) loadingSpinner.style.display = 'none';
      resultsContainer.innerHTML = `
        <div class="empty-state error">
          <h3>Search Failed</h3>
          <p>${err.message || 'Could not connect to JioSaavn API. Please check your internet.'}</p>
        </div>
      `;
      searchStats.textContent = 'Search failed';
    }
  }

  
  function renderResults(songs) {
    resultsContainer.innerHTML = songs.map((s) => {
      const isAlreadyInBuilder = builderSongs.some(b => String(b.id) === String(s.id));
      const isPlaying = currentPlayingId === String(s.id);

      return `
        <div class="song-card ${isPlaying ? 'playing' : ''}" id="song-card-${s.id}">
          <div class="song-cover-wrap">
            <img src="${s.thumb || s.img || 'https://placehold.co/80x80/181818/1ed760?text=Song'}" alt="${escapeHTML(s.title)}" class="song-cover" loading="lazy" />
            ${s.audioUrl ? `
              <button class="preview-play-btn ${isPlaying ? 'active' : ''}" onclick="window.toggleSongPreview('${s.id}', '${encodeURIComponent(s.audioUrl)}')" title="Preview audio">
                ${isPlaying 
                  ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
                  : '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
                }
              </button>
            ` : ''}
          </div>

          <div class="song-info">
            <div class="song-title-row">
              <h4 class="song-title" title="${escapeHTML(s.title)}">${escapeHTML(s.title)}</h4>
              ${s.year ? `<span class="song-year">${s.year}</span>` : ''}
            </div>
            <p class="song-artist" title="${escapeHTML(s.artist)}">${escapeHTML(s.artist)}</p>
            <p class="song-album" title="${escapeHTML(s.album || '')}">${escapeHTML(s.album || 'Single')} • ${s.duration || ''}</p>
            
            <div class="song-id-pill" onclick="window.copySongId('${s.id}')" title="Click to copy Song ID">
              <span class="id-label">ID:</span>
              <code class="id-val">${s.id}</code>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </div>
          </div>

          <div class="song-actions">
            <button class="btn btn-secondary btn-sm" onclick="window.copySongId('${s.id}')" title="Copy just the Song ID">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy ID
            </button>

            <button class="btn btn-secondary btn-sm" onclick="window.copySongJson('${s.id}')" title="Copy Full Ready-to-Paste JSON Object (with audioUrl & cover art)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              Copy JSON
            </button>

            <button class="btn ${isAlreadyInBuilder ? 'btn-added' : 'btn-primary'} btn-sm" id="btn-add-${s.id}" onclick="window.toggleBuilderSong('${s.id}')">
              ${isAlreadyInBuilder ? '✓ Added' : '+ Add to List'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  
  window.toggleSongPreview = function (id, encodedAudioUrl) {
    const audioUrl = decodeURIComponent(encodedAudioUrl);
    if (!audioUrl) {
      showToast('Preview audio not available', 'error');
      return;
    }

    if (currentPlayingId === String(id) && currentPreviewAudio) {
      if (currentPreviewAudio.paused) {
        currentPreviewAudio.play();
        updatePlayingUI(id, true);
      } else {
        currentPreviewAudio.pause();
        updatePlayingUI(id, false);
      }
      return;
    }

    if (currentPreviewAudio) {
      currentPreviewAudio.pause();
      currentPreviewAudio = null;
    }

    currentPreviewAudio = new Audio(audioUrl);
    currentPlayingId = String(id);
    updatePlayingUI(id, true);

    currentPreviewAudio.play().catch(() => {
      showToast('Could not play preview', 'error');
      updatePlayingUI(id, false);
    });

    currentPreviewAudio.onended = () => {
      updatePlayingUI(id, false);
      currentPlayingId = null;
    };
  };

  function updatePlayingUI(id, isPlaying) {
    document.querySelectorAll('.song-card').forEach(card => card.classList.remove('playing'));
    document.querySelectorAll('.preview-play-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    });

    if (isPlaying) {
      const activeCard = document.getElementById(`song-card-${id}`);
      if (activeCard) {
        activeCard.classList.add('playing');
        const playBtn = activeCard.querySelector('.preview-play-btn');
        if (playBtn) {
          playBtn.classList.add('active');
          playBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
        }
      }
    }
  }

  
  window.copySongId = function (id) {
    copyToClipboard(id, `Copied ID: "${id}"`);
  };

  
  window.copySongJson = function (id) {
    const s = searchResultsMap.get(String(id));
    if (!s) {
      showToast('Song data not found', 'error');
      return;
    }

    const fullObj = {
      id: s.id,
      title: s.title,
      artist: s.artist,
      album: s.album || s.title,
      audioUrl: s.audioUrl || '',
      img: s.img || s.thumb || '',
      duration: s.duration || '3:30'
    };

    const snippet = JSON.stringify(fullObj, null, 2);
    copyToClipboard(snippet, `Copied complete JSON with Audio URL for "${s.title}"!`);
  };

  
  window.toggleBuilderSong = function (id) {
    const s = searchResultsMap.get(String(id));
    if (!s) return;

    const existsIdx = builderSongs.findIndex(item => String(item.id) === String(id));
    const btn = document.getElementById(`btn-add-${id}`);

    if (existsIdx !== -1) {
      builderSongs.splice(existsIdx, 1);
      if (btn) {
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = '+ Add to List';
      }
      showToast(`Removed "${s.title}" from Playlist Builder`);
    } else {
      builderSongs.push({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || s.title,
        audioUrl: s.audioUrl || '',
        img: s.img || s.thumb || '',
        duration: s.duration || '3:30'
      });
      if (btn) {
        btn.className = 'btn btn-added btn-sm';
        btn.textContent = '✓ Added';
      }
      showToast(`Added "${s.title}" to Playlist Builder!`);
    }

    saveBuilderSongs();
    renderBuilderList();
  };

  window.removeBuilderSong = function (id) {
    const song = builderSongs.find(s => String(s.id) === String(id));
    builderSongs = builderSongs.filter(s => String(s.id) !== String(id));
    
    const btn = document.getElementById(`btn-add-${id}`);
    if (btn) {
      btn.className = 'btn btn-primary btn-sm';
      btn.textContent = '+ Add to List';
    }

    saveBuilderSongs();
    renderBuilderList();
    if (song) showToast(`Removed "${song.title}"`);
  };

  function saveBuilderSongs() {
    try {
      localStorage.setItem('wave_builder_playlist', JSON.stringify(builderSongs));
    } catch (e) {}
  }

  function renderBuilderList() {
    if (!builderCountEl || !builderListEl) return;

    builderCountEl.textContent = builderSongs.length;

    if (builderSongs.length === 0) {
      builderListEl.innerHTML = `
        <div class="builder-empty">
          <p>No songs added yet.</p>
          <small>Search songs on the left and click <strong>"+ Add to List"</strong> to build your custom playlist!</small>
        </div>
      `;
      if (copyFullJsonBtn) copyFullJsonBtn.disabled = true;
      if (downloadJsonBtn) downloadJsonBtn.disabled = true;
      return;
    }

    if (copyFullJsonBtn) copyFullJsonBtn.disabled = false;
    if (downloadJsonBtn) downloadJsonBtn.disabled = false;

    builderListEl.innerHTML = builderSongs.map((s, index) => `
      <div class="builder-item">
        <span class="builder-item-num">${index + 1}</span>
        <img src="${s.img || 'https://placehold.co/40x40/181818/1ed760?text=S'}" class="builder-item-thumb" />
        <div class="builder-item-info">
          <div class="builder-item-title">${escapeHTML(s.title)}</div>
          <div class="builder-item-artist">${escapeHTML(s.artist)} • <code>${s.id}</code></div>
        </div>
        <button class="builder-item-del" onclick="window.removeBuilderSong('${s.id}')" title="Remove song">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    `).join('');
  }

  
  function copyFullPlaylistJSON() {
    if (builderSongs.length === 0) {
      showToast('No songs to copy', 'error');
      return;
    }

    const playlistName = playlistNameInput ? playlistNameInput.value.trim() || 'My Custom Playlist' : 'My Custom Playlist';
    const playlistId = playlistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-custom-playlist';

    const fullPlaylist = {
      id: playlistId,
      name: playlistName,
      category: 'community',
      description: `${playlistName} handpicked on Wave Music`,
      img: builderSongs[0]?.img || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      songs: builderSongs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album || s.title,
        audioUrl: s.audioUrl,
        img: s.img,
        duration: s.duration
      }))
    };

    const formattedJson = JSON.stringify(fullPlaylist, null, 2);
    copyToClipboard(formattedJson, `Copied complete playlist JSON with ${builderSongs.length} songs & Audio URLs!`);
  }

  
  function downloadPlaylistJSON() {
    if (builderSongs.length === 0) {
      showToast('No songs to export', 'error');
      return;
    }

    const playlistName = playlistNameInput ? playlistNameInput.value.trim() || 'my-playlist' : 'my-playlist';
    const playlistId = playlistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'my-playlist';

    const fullPlaylist = {
      playlistId: playlistId,
      name: playlistName,
      songs: builderSongs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist
      }))
    };

    const blob = new Blob([JSON.stringify(fullPlaylist, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlistId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${playlistId}.json`);
  }

  
  function clearBuilder() {
    if (builderSongs.length === 0) return;
    if (confirm('Clear all songs from the playlist builder?')) {
      builderSongs = [];
      saveBuilderSongs();
      renderBuilderList();
      
      document.querySelectorAll('.btn-added').forEach(btn => {
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = '+ Add to List';
      });
      showToast('Playlist builder cleared');
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
