

(function() {
  const DEFAULT_SETTINGS = {
    accentColor: 'green', 
    audioQuality: '320',
    crossfade: 0,
    normalizeVolume: true,
    eqPreset: 'flat',
    autoplaySimilar: true,
    prefetchCache: true,
    lyricsSize: 'normal',
    highContrastMode: false,
    hardwareAcceleration: true
  };

  const ACCENT_PALETTES = {
    green: { name: 'Wave Emerald', hex: '#1ed760', hover: '#22e366', rgb: '30, 215, 96' },
    purple: { name: 'Cyberpunk Purple', hex: '#a855f7', hover: '#c084fc', rgb: '168, 85, 247' },
    blue: { name: 'Ocean Sapphire', hex: '#3b82f6', hover: '#60a5fa', rgb: '59, 130, 246' },
    amber: { name: 'Sunset Amber', hex: '#f59e0b', hover: '#fbbf24', rgb: '245, 158, 11' },
    rose: { name: 'Neon Rose', hex: '#ec4899', hover: '#f472b6', rgb: '236, 72, 153' },
    cyan: { name: 'Electric Cyan', hex: '#06b6d4', hover: '#22d3ee', rgb: '6, 182, 212' }
  };

  function getWaveSettings() {
    try {
      const stored = localStorage.getItem('wave_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse wave_settings', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  function saveWaveSettings(newSettings) {
    try {
      localStorage.setItem('wave_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error('Failed to save wave_settings', e);
    }
  }

  function getWaveSetting(key, fallback) {
    const s = getWaveSettings();
    return (s[key] !== undefined) ? s[key] : fallback;
  }

  function setWaveSetting(key, value) {
    const s = getWaveSettings();
    s[key] = value;
    saveWaveSettings(s);

    
    if (key === 'accentColor') {
      applyAccentColor(value);
      updateAccentUI(value);
      if (typeof showToast === 'function') {
        const pal = ACCENT_PALETTES[value] || ACCENT_PALETTES.green;
        showToast(`Accent color updated to ${pal.name}`, 'info');
      }
    } else if (key === 'normalizeVolume') {
      if (typeof showToast === 'function') {
        showToast(value ? 'Volume normalization enabled' : 'Volume normalization disabled', 'info');
      }
    } else if (key === 'crossfade') {
      if (window.SmartAudio) {
        const cf = parseInt(value, 10) || 0;
        window.SmartAudio.crossfadeDuration = cf;
        window.SmartAudio.isCrossfadeEnabled = (cf > 0);
        if (cf === 0 && window.audio) {
          window.SmartAudio.restoreUserVolume(window.audio);
        }
      }
    }
  }

  function applyAccentColor(accentKey) {
    const pal = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.green;
    const root = document.documentElement;
    root.style.setProperty('--spotify-green', pal.hex);
    root.style.setProperty('--spotify-green-hover', pal.hover);
    root.style.setProperty('--sp-green', pal.hex);
    root.style.setProperty('--sp-green-rgb', pal.rgb);
    root.style.setProperty('--accent-color', pal.hex);
    root.style.setProperty('--accent-hover', pal.hover);
    root.style.setProperty('--accent-rgb', pal.rgb);
    root.style.setProperty('--neon-purple', pal.hex);
  }

  function updateAccentUI(accentKey) {
    const dots = document.querySelectorAll('.sp-accent-dot');
    dots.forEach(dot => {
      const col = dot.getAttribute('data-color');
      if (col === accentKey) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function calculateStorageUsage() {
    let totalBytes = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalBytes += (localStorage[key].length + key.length) * 2;
      }
    }
    if (totalBytes < 1024) return totalBytes + ' B';
    if (totalBytes < 1024 * 1024) return (totalBytes / 1024).toFixed(1) + ' KB';
    return (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function exportWaveBackup() {
    try {
      const backupData = {
        app: 'Wave Music',
        version: '3.5 Pro',
        exportedAt: new Date().toISOString(),
        userName: localStorage.getItem('wave_user_name') || 'Mohd Asif',
        userImg: localStorage.getItem('wave_user_img') || null,
        likedSongs: JSON.parse(localStorage.getItem('wave_liked_songs') || '[]'),
        playlists: JSON.parse(localStorage.getItem('wave_user_playlists') || localStorage.getItem('wave_playlists') || '[]'),
        history: JSON.parse(localStorage.getItem('wave_user_history') || localStorage.getItem('wave_recent_songs') || '[]'),
        followedArtists: JSON.parse(localStorage.getItem('wave_followed_artists') || '[]'),
        settings: getWaveSettings()
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `wave-music-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof showToast === 'function') {
        showToast('Backup file downloaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Backup export failed', err);
      alert('Failed to generate backup file: ' + err.message);
    }
  }

  function importWaveBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') throw new Error('Invalid JSON structure');

        if (data.userName) localStorage.setItem('wave_user_name', data.userName);
        if (data.userImg) localStorage.setItem('wave_user_img', data.userImg);
        if (Array.isArray(data.likedSongs)) localStorage.setItem('wave_liked_songs', JSON.stringify(data.likedSongs));
        if (Array.isArray(data.playlists)) {
          localStorage.setItem('wave_user_playlists', JSON.stringify(data.playlists));
          localStorage.setItem('wave_playlists', JSON.stringify(data.playlists));
        }
        if (Array.isArray(data.history)) {
          localStorage.setItem('wave_user_history', JSON.stringify(data.history));
          localStorage.setItem('wave_recent_songs', JSON.stringify(data.history));
        }
        if (Array.isArray(data.followedArtists)) localStorage.setItem('wave_followed_artists', JSON.stringify(data.followedArtists));
        if (data.settings) localStorage.setItem('wave_settings', JSON.stringify(data.settings));

        if (typeof showToast === 'function') {
          showToast('Music data restored successfully! Reloading...', 'success');
        }
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        console.error('Import failed', err);
        alert('Invalid or corrupted backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function clearWaveCache() {
    if (confirm('Clear temporary search query cache and stream buffer metadata? (Your Liked songs and Playlists will NOT be deleted)')) {
      try {
        localStorage.removeItem('wave_search_recents');
        localStorage.removeItem('wave_temp_cache');
        sessionStorage.clear();
        const meterEl = document.getElementById('st-storage-size');
        if (meterEl) meterEl.textContent = calculateStorageUsage();
        if (typeof showToast === 'function') {
          showToast('Cache cleared successfully!', 'success');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  function resetWaveAppSettings() {
    if (confirm('Reset all Audio, Display, and Playback settings to default values?')) {
      localStorage.removeItem('wave_settings');
      if (typeof showToast === 'function') {
        showToast('Settings restored to defaults! Reloading...', 'info');
      }
      setTimeout(() => location.reload(), 800);
    }
  }

  function getSettingsPageHTML() {
    const s = getWaveSettings();
    const storageSize = calculateStorageUsage();
    const currentAccent = s.accentColor || 'green';

    return `
      <div class="sp-settings-container">
        
        <div class="sp-settings-header">
          <div class="sp-settings-header-left">
            <h1 class="sp-settings-title">Settings</h1>
            <p class="sp-settings-subtitle">Manage audio streaming quality, accent colors, playback controls, and offline data</p>
          </div>
          <button class="sp-settings-reset-btn" onclick="resetWaveAppSettings()" title="Restore default settings">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Reset Defaults
          </button>
        </div>

        
        <div class="sp-settings-section">
          <div class="sp-settings-sec-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Display &amp; Appearance
          </div>

          <div class="sp-settings-card">
            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Accent Highlight Color</div>
                <div class="sp-settings-desc">Choose vibrant highlight color for play buttons, volume sliders, active tracks, and badges.</div>
              </div>
              <div class="sp-settings-ctrl">
                <div class="sp-accent-picker">
                  <button class="sp-accent-dot ${currentAccent === 'green' ? 'active' : ''}" data-color="green" style="background: #1ed760;" onclick="setWaveSetting('accentColor', 'green')" title="Wave Emerald (#1ed760)"></button>
                  <button class="sp-accent-dot ${currentAccent === 'purple' ? 'active' : ''}" data-color="purple" style="background: #a855f7;" onclick="setWaveSetting('accentColor', 'purple')" title="Cyberpunk Purple (#a855f7)"></button>
                  <button class="sp-accent-dot ${currentAccent === 'blue' ? 'active' : ''}" data-color="blue" style="background: #3b82f6;" onclick="setWaveSetting('accentColor', 'blue')" title="Ocean Sapphire (#3b82f6)"></button>
                  <button class="sp-accent-dot ${currentAccent === 'amber' ? 'active' : ''}" data-color="amber" style="background: #f59e0b;" onclick="setWaveSetting('accentColor', 'amber')" title="Sunset Amber (#f59e0b)"></button>
                  <button class="sp-accent-dot ${currentAccent === 'rose' ? 'active' : ''}" data-color="rose" style="background: #ec4899;" onclick="setWaveSetting('accentColor', 'rose')" title="Neon Rose (#ec4899)"></button>
                  <button class="sp-accent-dot ${currentAccent === 'cyan' ? 'active' : ''}" data-color="cyan" style="background: #06b6d4;" onclick="setWaveSetting('accentColor', 'cyan')" title="Electric Cyan (#06b6d4)"></button>
                </div>
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Synchronized Lyrics Font Size</div>
                <div class="sp-settings-desc">Adjust the scale of karaoke lyrics text in the lyrics view.</div>
              </div>
              <div class="sp-settings-ctrl">
                <select id="st-lyrics-size" class="sp-settings-select" onchange="setWaveSetting('lyricsSize', this.value)">
                  <option value="small" ${s.lyricsSize === 'small' ? 'selected' : ''}>Compact (Small)</option>
                  <option value="normal" ${s.lyricsSize === 'normal' ? 'selected' : ''}>Standard (Normal)</option>
                  <option value="large" ${s.lyricsSize === 'large' ? 'selected' : ''}>Cinematic (Large)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        
        <div class="sp-settings-section">
          <div class="sp-settings-sec-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            Audio Streaming &amp; Playback Engine
          </div>

          <div class="sp-settings-card">
            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Streaming Audio Quality</div>
                <div class="sp-settings-desc">Choose audio bitrate. 320 kbps delivers maximum studio fidelity.</div>
              </div>
              <div class="sp-settings-ctrl">
                <select id="st-audio-quality" class="sp-settings-select" onchange="setWaveSetting('audioQuality', this.value)">
                  <option value="320" ${s.audioQuality === '320' ? 'selected' : ''}>Studio Master (320 kbps HD)</option>
                  <option value="160" ${s.audioQuality === '160' ? 'selected' : ''}>Standard High (160 kbps)</option>
                  <option value="96" ${s.audioQuality === '96' ? 'selected' : ''}>Data Saver (96 kbps Low)</option>
                  <option value="auto" ${s.audioQuality === 'auto' ? 'selected' : ''}>Auto (Adaptive Bandwidth)</option>
                </select>
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Crossfade Songs</div>
                <div class="sp-settings-desc">Smoothly blend the end of one track into the beginning of the next.</div>
              </div>
              <div class="sp-settings-ctrl sp-settings-slider-wrap">
                <input type="range" id="st-crossfade" min="0" max="12" step="1" value="${s.crossfade}" class="sp-settings-slider" oninput="document.getElementById('st-crossfade-val').textContent = this.value + 's'; setWaveSetting('crossfade', parseInt(this.value));">
                <span id="st-crossfade-val" class="sp-settings-badge">${s.crossfade}s</span>
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Normalize Volume Level</div>
                <div class="sp-settings-desc">Automatically balance sound volume across all songs to prevent sudden jumps.</div>
              </div>
              <div class="sp-settings-ctrl">
                <label class="sp-switch">
                  <input type="checkbox" id="st-norm-vol" ${s.normalizeVolume ? 'checked' : ''} onchange="setWaveSetting('normalizeVolume', this.checked)">
                  <span class="sp-slider-round"></span>
                </label>
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Equalizer (EQ) Preset</div>
                <div class="sp-settings-desc">Tailor frequencies for enhanced bass, clarity, or acoustics.</div>
              </div>
              <div class="sp-settings-ctrl">
                <select id="st-eq-preset" class="sp-settings-select" onchange="setWaveSetting('eqPreset', this.value)">
                  <option value="flat" ${s.eqPreset === 'flat' ? 'selected' : ''}>Flat (Default)</option>
                  <option value="bass_boost" ${s.eqPreset === 'bass_boost' ? 'selected' : ''}>Deep Bass Boost</option>
                  <option value="vocal_boost" ${s.eqPreset === 'vocal_boost' ? 'selected' : ''}>Crisp Vocal Boost</option>
                  <option value="rock" ${s.eqPreset === 'rock' ? 'selected' : ''}>Rock &amp; Metal</option>
                  <option value="pop" ${s.eqPreset === 'pop' ? 'selected' : ''}>Modern Pop</option>
                  <option value="electronic" ${s.eqPreset === 'electronic' ? 'selected' : ''}>Electronic / EDM</option>
                  <option value="acoustic" ${s.eqPreset === 'acoustic' ? 'selected' : ''}>Acoustic / Classical</option>
                </select>
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Autoplay Similar Music</div>
                <div class="sp-settings-desc">When your playlist or queue ends, Wave AI continues playing similar tracks seamlessly.</div>
              </div>
              <div class="sp-settings-ctrl">
                <label class="sp-switch">
                  <input type="checkbox" id="st-autoplay" ${s.autoplaySimilar ? 'checked' : ''} onchange="setWaveSetting('autoplaySimilar', this.checked)">
                  <span class="sp-slider-round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        
        <div class="sp-settings-section">
          <div class="sp-settings-sec-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Data Backup &amp; Storage Management
          </div>

          <div class="sp-settings-card">
            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Export Full Data Backup</div>
                <div class="sp-settings-desc">Download a JSON file containing all your Liked Songs, Created Playlists, History, and preferences.</div>
              </div>
              <div class="sp-settings-ctrl">
                <button class="sp-settings-btn sp-settings-btn-primary" onclick="exportWaveBackup()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Backup
                </button>
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Import &amp; Restore Backup</div>
                <div class="sp-settings-desc">Restore your music library on a new device or browser from a previously exported JSON file.</div>
              </div>
              <div class="sp-settings-ctrl">
                <button class="sp-settings-btn sp-settings-btn-secondary" onclick="document.getElementById('st-import-input').click()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Import JSON
                </button>
                <input type="file" id="st-import-input" accept=".json,application/json" style="display:none;" onchange="importWaveBackup(event)">
              </div>
            </div>

            
            <div class="sp-settings-row">
              <div class="sp-settings-info">
                <div class="sp-settings-name">Browser Storage &amp; Cache</div>
                <div class="sp-settings-desc">Estimated local storage utilized: <strong id="st-storage-size" style="color: inherit;">${storageSize}</strong></div>
              </div>
              <div class="sp-settings-ctrl">
                <button class="sp-settings-btn sp-settings-btn-danger" onclick="clearWaveCache()">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>

        
        <div class="sp-settings-section">
          <div class="sp-settings-sec-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M8 16h8"/></svg>
            Keyboard Shortcuts
          </div>

          <div class="sp-settings-card">
            <div class="sp-shortcuts-grid">
              <div class="sp-shortcut-item">
                <kbd class="sp-kbd">Space</kbd>
                <span>Play / Pause</span>
              </div>
              <div class="sp-shortcut-item">
                <kbd class="sp-kbd">L</kbd>
                <span>Next Track</span>
              </div>
              <div class="sp-shortcut-item">
                <kbd class="sp-kbd">J</kbd>
                <span>Previous Track</span>
              </div>
              <div class="sp-shortcut-item">
                <kbd class="sp-kbd">M</kbd>
                <span>Mute / Unmute</span>
              </div>
              <div class="sp-shortcut-item">
                <kbd class="sp-kbd">S</kbd>
                <span>Toggle Shuffle</span>
              </div>
              <div class="sp-shortcut-item">
                <kbd class="sp-kbd">R</kbd>
                <span>Toggle Repeat</span>
              </div>
            </div>
          </div>
        </div>

        
        <div class="sp-settings-section">
          <div class="sp-settings-sec-title">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            About Wave Music
          </div>

          <div class="sp-settings-card">
            <div class="sp-about-app-row">
              <div class="sp-about-app-brand">
                <div class="sp-about-logo-badge">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="var(--accent-color, #1ed760)"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                </div>
                <div>
                  <h3 class="sp-about-app-name">Wave Music Player</h3>
                  <p class="sp-about-app-version">Version 3.5 Pro • 100% Free &amp; Open Web Edition</p>
                </div>
              </div>
              <div class="sp-about-links">
                <a href="about.html" class="sp-about-link">About Project</a>
                <a href="how-it-works.html" class="sp-about-link">How It Works</a>
                <a href="faq.html" class="sp-about-link">Help &amp; FAQ</a>
                <a href="privacy.html" class="sp-about-link">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>

        ${typeof getFooterHTML === 'function' ? getFooterHTML() : ''}
      </div>
    `;
  }

  function initSettingsView() {
    
    const meterEl = document.getElementById('st-storage-size');
    if (meterEl) meterEl.textContent = calculateStorageUsage();
  }

  
  const initSettings = getWaveSettings();
  applyAccentColor(initSettings.accentColor || 'green');
  document.documentElement.removeAttribute('data-theme');
  if (document.body) document.body.removeAttribute('data-theme');

  
  window.getWaveSettings = getWaveSettings;
  window.saveWaveSettings = saveWaveSettings;
  window.getWaveSetting = getWaveSetting;
  window.setWaveSetting = setWaveSetting;
  window.applyAccentColor = applyAccentColor;
  window.exportWaveBackup = exportWaveBackup;
  window.importWaveBackup = importWaveBackup;
  window.clearWaveCache = clearWaveCache;
  window.resetWaveAppSettings = resetWaveAppSettings;
  window.getSettingsPageHTML = getSettingsPageHTML;
  window.initSettingsView = initSettingsView;
})();
