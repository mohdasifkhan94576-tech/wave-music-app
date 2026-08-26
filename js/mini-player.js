

(function(window, document) {
  'use strict';

  let _pipWindow = null;
  let _isAutoPipEnabled = true;
  let _lastExtractedColor = 'rgb(74, 40, 16)';
  let _userInteracted = false;

  
  const _markInteraction = () => { _userInteracted = true; };
  window.addEventListener('click', _markInteraction, { once: false, passive: true });
  window.addEventListener('keydown', _markInteraction, { once: false, passive: true });
  window.addEventListener('touchstart', _markInteraction, { once: false, passive: true });

  const MiniPlayer = {
    get pipWindow() {
      return _pipWindow;
    },

    isOpen() {
      return !!_pipWindow;
    },

    async open(isAuto = false) {
      if (window.innerWidth <= 768) return false;

      const currentSong = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
        ? state.queue[state.currentIndex]
        : null;

      if (!currentSong) return false;

      if ('documentPictureInPicture' in window) {
        try {
          if (_pipWindow) {
            _pipWindow.focus();
            return true;
          }

          _pipWindow = await window.documentPictureInPicture.requestWindow({
            width: 340,
            height: 420,
            disallowReturnToOpener: false,
          });

          this._setupPipDocument(_pipWindow, currentSong);

          _pipWindow.addEventListener('pagehide', () => {
            _pipWindow = null;
            this._updateToggleBtnState(false);
          });

          this._updateToggleBtnState(true);
          return true;
        } catch (err) {
          if (isAuto) {
            
          } else {
            console.warn('[MiniPlayer] Document PiP request failed:', err);
          }
        }
      }

      return false;
    },

    close() {
      if (_pipWindow) {
        try { _pipWindow.close(); } catch (e) {}
        _pipWindow = null;
      }
      const inPage = document.getElementById('mini-player');
      if (inPage) {
        inPage.classList.add('hidden');
        inPage.style.display = 'none';
      }
      this._updateToggleBtnState(false);
    },

    toggle(e) {
      if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
      if (window.innerWidth <= 768) {
        this.close();
        return;
      }
      if (_pipWindow) {
        this.close();
      } else {
        this.open(false);
      }
    },

    update() {
      const currentSong = (typeof state !== 'undefined' && state.queue && state.queue[state.currentIndex])
        ? state.queue[state.currentIndex]
        : null;

      if (!currentSong) return;

      if (_pipWindow && _pipWindow.document) {
        this._updatePipContent(_pipWindow.document, currentSong);
      }
    },

    _setupPipDocument(pipWin, song) {
      const doc = pipWin.document;
      doc.title = `${song.title || 'Wave Music'} • Mini Player`;

      
      const style = doc.createElement('style');
      style.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          user-select: none;
          -webkit-user-select: none;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #121212;
          color: #ffffff;
          overflow: hidden;
          height: 100vh;
          width: 100vw;
          margin: 0;
          display: flex;
          flex-direction: column;
        }
        .sp-pip-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          background: #121212;
          position: relative;
          overflow: hidden;
        }
        .sp-pip-art-wrap {
          flex: 1;
          min-height: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 20px;
          background: linear-gradient(180deg, var(--pip-bg-color, ${_lastExtractedColor}) 0%, rgba(18, 18, 18, 0.96) 100%);
          transition: background 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .sp-pip-cover-img {
          width: 100%;
          max-width: 250px;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          border-radius: 8px;
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.7);
          transition: transform 0.25s cubic-bezier(0.2, 0, 0, 1);
        }
        .sp-pip-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.48);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 24px 16px 14px 16px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s cubic-bezier(0.2, 0, 0, 1);
          z-index: 10;
        }
        .sp-pip-container:hover .sp-pip-overlay,
        .sp-pip-container.is-hovered .sp-pip-overlay {
          opacity: 1;
          pointer-events: auto;
        }
        .sp-pip-controls-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .sp-pip-ctrl-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .sp-pip-ctrl-btn:hover {
          color: #ffffff;
          transform: scale(1.15);
        }
        .sp-pip-ctrl-btn:active {
          transform: scale(0.92);
        }
        .sp-pip-ctrl-btn.active {
          color: #1ed760;
        }
        .sp-pip-play-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #ffffff;
          color: #000000;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
          transition: transform 0.15s ease, background 0.15s ease;
          margin: 0 4px;
        }
        .sp-pip-play-btn:hover {
          transform: scale(1.08);
          background: #ffffff;
        }
        .sp-pip-play-btn:active {
          transform: scale(0.95);
        }
        .sp-pip-progress-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0 4px;
        }
        .sp-pip-time {
          font-size: 11px;
          font-weight: 500;
          color: #ffffff;
          font-variant-numeric: tabular-nums;
          min-width: 28px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }
        .sp-pip-prog-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.35);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          transition: height 0.15s ease;
        }
        .sp-pip-prog-bar:hover {
          height: 6px;
        }
        .sp-pip-prog-fill {
          height: 100%;
          background: #ffffff;
          border-radius: 2px;
          width: 0%;
          position: relative;
          transition: background 0.15s ease;
        }
        .sp-pip-prog-bar:hover .sp-pip-prog-fill {
          background: #1ed760;
        }
        .sp-pip-prog-thumb {
          display: none;
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%);
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .sp-pip-prog-bar:hover .sp-pip-prog-thumb {
          display: block;
        }
        .sp-pip-bottom {
          background: #121212;
          padding: 14px 18px 16px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
        }
        .sp-pip-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .sp-pip-title {
          font-size: 14px;
          font-weight: 700;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.2px;
        }
        .sp-pip-artist {
          font-size: 12px;
          color: #b3b3b3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-weight: 500;
        }
        .sp-pip-like-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: transform 0.15s ease;
          color: #b3b3b3;
          flex-shrink: 0;
        }
        .sp-pip-like-btn:hover {
          transform: scale(1.15);
        }
        .sp-pip-like-btn.liked {
          color: #1ed760;
        }
      `;
      doc.head.appendChild(style);

      
      const container = doc.createElement('div');
      container.className = 'sp-pip-container';
      container.id = 'sp-pip-container';

      const isLiked = typeof userLikes !== 'undefined' && userLikes.has(song.id);
      const isPlaying = typeof state !== 'undefined' && state.isPlaying;
      const isShuffle = typeof state !== 'undefined' && state.isShuffle;
      const isRepeat = typeof state !== 'undefined' && state.isRepeat;

      container.innerHTML = `
        
        <div class="sp-pip-art-wrap" id="sp-pip-art-wrap">
          <img id="sp-pip-cover" class="sp-pip-cover-img" src="${song.img || song.thumb || ''}" alt="Cover" decoding="async">
          
          
          <div class="sp-pip-overlay" id="sp-pip-overlay">
            <div class="sp-pip-controls-center">
              
              <button class="sp-pip-ctrl-btn ${isShuffle ? 'active' : ''}" id="sp-pip-shuffle-btn" title="Shuffle">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
                  <path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"/>
                  <path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.937z"/>
                </svg>
              </button>
              
              
              <button class="sp-pip-ctrl-btn" id="sp-pip-prev-btn" title="Previous">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M3.3 1a.7.7 0 0 1 .7.7v5.15l9.95-5.744a.7.7 0 0 1 1.05.606v12.575a.7.7 0 0 1-1.05.607L4 9.149V14.3a.7.7 0 0 1-.7.7H1.7a.7.7 0 0 1-.7-.7V1.7a.7.7 0 0 1 .7-.7h1.6z"/>
                </svg>
              </button>

              
              <button class="sp-pip-play-btn" id="sp-pip-play-btn" title="${isPlaying ? 'Pause' : 'Play'}">
                <svg id="sp-pip-play-ico" viewBox="0 0 16 16" width="20" height="20" fill="currentColor" style="margin-left: 2px; ${isPlaying ? 'display:none;' : ''}">
                  <path d="M3 1.713a.7.7 0 0 1 1.05-.607l10.89 6.288a.7.7 0 0 1 0 1.212L4.05 14.894A.7.7 0 0 1 3 14.287V1.713z"/>
                </svg>
                <svg id="sp-pip-pause-ico" viewBox="0 0 16 16" width="18" height="18" fill="currentColor" style="${isPlaying ? '' : 'display:none;'}">
                  <path d="M2.7 1a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7H2.7zm8 0a.7.7 0 0 0-.7.7v12.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-2.6z"/>
                </svg>
              </button>

              
              <button class="sp-pip-ctrl-btn" id="sp-pip-next-btn" title="Next">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M12.7 1a.7.7 0 0 0-.7.7v5.15L2.05 1.107A.7.7 0 0 0 1 1.712v12.575a.7.7 0 0 0 1.05.607L12 9.149V14.3a.7.7 0 0 0 .7.7h1.6a.7.7 0 0 0 .7-.7V1.7a.7.7 0 0 0-.7-.7h-1.6z"/>
                </svg>
              </button>

              
              <button class="sp-pip-ctrl-btn ${isRepeat ? 'active' : ''}" id="sp-pip-repeat-btn" title="Repeat">
                <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
                  <path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"/>
                </svg>
              </button>
            </div>

            
            <div class="sp-pip-progress-row">
              <span class="sp-pip-time" id="sp-pip-cur-time">0:00</span>
              <div class="sp-pip-prog-bar" id="sp-pip-prog-bar">
                <div class="sp-pip-prog-fill" id="sp-pip-prog-fill">
                  <div class="sp-pip-prog-thumb"></div>
                </div>
              </div>
              <span class="sp-pip-time" id="sp-pip-tot-time">0:00</span>
            </div>
          </div>
        </div>

        
        <div class="sp-pip-bottom">
          <div class="sp-pip-info">
            <div class="sp-pip-title" id="sp-pip-title">${song.title || 'Select a Song'}</div>
            <div class="sp-pip-artist" id="sp-pip-artist">${song.artist || 'Unknown Artist'}</div>
          </div>
          <button class="sp-pip-like-btn ${isLiked ? 'liked' : ''}" id="sp-pip-like-btn" title="${isLiked ? 'Remove from Liked' : 'Save to Liked'}">
            ${this._getLikeIconSvg(isLiked)}
          </button>
        </div>
      `;

      doc.body.appendChild(container);

      
      const playBtn = doc.getElementById('sp-pip-play-btn');
      if (playBtn) playBtn.onclick = () => { if (typeof togglePlay === 'function') togglePlay(); };

      const nextBtn = doc.getElementById('sp-pip-next-btn');
      if (nextBtn) nextBtn.onclick = () => { if (typeof nextSong === 'function') nextSong(); };

      const prevBtn = doc.getElementById('sp-pip-prev-btn');
      if (prevBtn) prevBtn.onclick = () => { if (typeof prevSong === 'function') prevSong(); };

      const shuffleBtn = doc.getElementById('sp-pip-shuffle-btn');
      if (shuffleBtn) shuffleBtn.onclick = () => { if (typeof toggleShuffle === 'function') toggleShuffle(); };

      const repeatBtn = doc.getElementById('sp-pip-repeat-btn');
      if (repeatBtn) repeatBtn.onclick = () => { if (typeof toggleRepeat === 'function') toggleRepeat(); };

      const likeBtn = doc.getElementById('sp-pip-like-btn');
      if (likeBtn) {
        likeBtn.onclick = () => {
          if (typeof toggleLikeSong === 'function' && song && song.id) {
            toggleLikeSong(song.id);
            this.update();
          } else if (typeof toggleLike === 'function') {
            toggleLike();
            this.update();
          }
        };
      }

      const progBar = doc.getElementById('sp-pip-prog-bar');
      if (progBar) {
        progBar.onclick = (e) => {
          if (typeof audio !== 'undefined' && audio && audio.duration) {
            const rect = progBar.getBoundingClientRect();
            const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const pct = clickX / rect.width;
            audio.currentTime = pct * audio.duration;
            this.update();
          }
        };
      }

      
      this._extractAndApplyColor(song, doc);
      this._updatePipContent(doc, song);
    },

    

    _updatePipContent(doc, song) {
      if (!doc || !song) return;

      const titleEl = doc.getElementById('sp-pip-title');
      const artistEl = doc.getElementById('sp-pip-artist');
      const coverEl = doc.getElementById('sp-pip-cover');
      const likeBtn = doc.getElementById('sp-pip-like-btn');
      const playIco = doc.getElementById('sp-pip-play-ico');
      const pauseIco = doc.getElementById('sp-pip-pause-ico');
      const playBtn = doc.getElementById('sp-pip-play-btn');
      const curTime = doc.getElementById('sp-pip-cur-time');
      const totTime = doc.getElementById('sp-pip-tot-time');
      const fillEl = doc.getElementById('sp-pip-prog-fill');
      const shuffleBtn = doc.getElementById('sp-pip-shuffle-btn');
      const repeatBtn = doc.getElementById('sp-pip-repeat-btn');

      if (titleEl && titleEl.textContent !== song.title) titleEl.textContent = song.title || 'Select a Song';
      if (artistEl && artistEl.textContent !== song.artist) artistEl.textContent = song.artist || 'Unknown Artist';

      const imgSrc = song.img || song.thumb || '';
      if (coverEl && coverEl.src !== imgSrc && imgSrc) {
        coverEl.src = imgSrc;
        this._extractAndApplyColor(song, doc);
      }

      const isLiked = typeof userLikes !== 'undefined' && userLikes.has(song.id);
      if (likeBtn) {
        likeBtn.className = `sp-pip-like-btn ${isLiked ? 'liked' : ''}`;
        likeBtn.innerHTML = this._getLikeIconSvg(isLiked);
        likeBtn.title = isLiked ? 'Remove from Liked' : 'Save to Liked';
      }

      const isPlaying = typeof state !== 'undefined' && state.isPlaying;
      if (playIco && pauseIco) {
        playIco.style.display = isPlaying ? 'none' : 'block';
        pauseIco.style.display = isPlaying ? 'block' : 'none';
      }
      if (playBtn) {
        playBtn.title = isPlaying ? 'Pause' : 'Play';
      }

      if (shuffleBtn && typeof state !== 'undefined') {
        shuffleBtn.classList.toggle('active', !!state.isShuffle);
      }
      if (repeatBtn && typeof state !== 'undefined') {
        repeatBtn.classList.toggle('active', !!state.isRepeat);
      }

      if (typeof audio !== 'undefined' && audio && audio.duration) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (fillEl) fillEl.style.width = pct + '%';
        if (curTime) curTime.textContent = this._formatTime(audio.currentTime);
        if (totTime) totTime.textContent = this._formatTime(audio.duration);
      }
    },

    

    _openInPageMiniPlayer(song) {
     
    },

    _updateInPageContent(song) {
    
    },

    _updateToggleBtnState(isOpen) {
      const btn = document.getElementById('mini-toggle');
      if (btn) {
        btn.classList.toggle('active', isOpen);
        btn.title = isOpen ? 'Close Mini Player' : 'Mini Player';
      }
    },

    _getLikeIconSvg(isLiked) {
      if (isLiked) {
        return `<svg viewBox="0 0 16 16" width="20" height="20" fill="#1ed760"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm11.748-1.796a.75.75 0 0 0-1.06-1.06l-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5z"/></svg>`;
      }
      return `<svg viewBox="0 0 16 16" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="8" r="6.8"/><path d="M5.2 8l2 2 3.8-3.8"/></svg>`;
    },

    _formatTime(secs) {
      if (!secs || isNaN(secs)) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    _extractAndApplyColor(song, pipDoc, inPageEl) {
      if (!song) return;
      const imgUrl = song.img || song.thumb;
      if (!imgUrl) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imgUrl;

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 30;
          canvas.height = 30;
          ctx.drawImage(img, 0, 0, 30, 30);
          const data = ctx.getImageData(0, 0, 30, 30).data;

          let rTot = 0, gTot = 0, bTot = 0, count = 0;
          for (let i = 0; i < data.length; i += 16) {
            const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
            if (a < 128) continue;
            const brightness = (r + g + b) / 3;
            if (brightness > 25 && brightness < 225) {
              rTot += r;
              gTot += g;
              bTot += b;
              count++;
            }
          }

          if (count > 0) {
            const avgR = Math.round(rTot / count);
            const avgG = Math.round(gTot / count);
            const avgB = Math.round(bTot / count);
            _lastExtractedColor = `rgb(${avgR}, ${avgG}, ${avgB})`;
          }
        } catch (e) {
          let hash = 0;
          for (let i = 0; i < imgUrl.length; i++) hash = imgUrl.charCodeAt(i) + ((hash << 5) - hash);
          const hue = Math.abs(hash) % 360;
          _lastExtractedColor = `hsl(${hue}, 65%, 28%)`;
        }

        if (pipDoc) {
          const wrap = pipDoc.getElementById('sp-pip-art-wrap');
          if (wrap) wrap.style.setProperty('--pip-bg-color', _lastExtractedColor);
        }
        if (inPageEl) {
          inPageEl.style.setProperty('--mini-bg-color', _lastExtractedColor);
        }
      };
    },

    

    initAutoMiniPlayer() {
      document.addEventListener('visibilitychange', () => {
        if (!_isAutoPipEnabled) return;
        if (window.innerWidth <= 768) return;

        const isHidden = document.visibilityState === 'hidden';
        const isPlaying = (typeof audio !== 'undefined' && audio && !audio.paused);

        if (isHidden && isPlaying) {
          
          if (!_pipWindow) {
            this.open(true);
          }
        }
      });
    }
  };

  
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
      MiniPlayer.close();
    }
  });

  
  window.MiniPlayer = MiniPlayer;
  window.toggleMiniPlayer = function(e) {
    MiniPlayer.toggle(e);
  };

  
  if (window.innerWidth <= 768) {
    MiniPlayer.close();
  }

  
  MiniPlayer.initAutoMiniPlayer();

})(window, document);
