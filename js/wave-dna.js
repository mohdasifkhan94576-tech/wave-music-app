'use strict';

 

window.WaveDNA = {
  getPersona(moods) {
    if (moods.LateNight >= 60 && moods.Chill >= 50) {
      return { 
        title: 'The Midnight Dreamer', 
        desc: 'You find solace when the world sleeps. Soft lo-fi, acoustic melodies, and late-night Hindi classics are your signature sanctuary.', 
        svg: '<svg viewBox="0 0 24 24" width="40" height="40" fill="#818cf8"><path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.6-4.9c-.6.1-1.3.1-2 .1A9 9 0 0 1 8 8.2c0-.7 0-1.4.1-2A10 10 0 0 0 12.3 2z"/></svg>' 
      };
    } else if (moods.Romantic >= 65) {
      return { 
        title: 'The Hopeless Romantic', 
        desc: 'Your heart beats to passionate melodies, soulful acoustic duets, and deep lyrics that resonate with love.', 
        svg: '<svg viewBox="0 0 24 24" width="40" height="40" fill="#fb7185"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>' 
      };
    } else if (moods.Energy >= 60) {
      return { 
        title: 'The Energy Dynamo', 
        desc: 'High-tempo beats, party anthems, and bass-heavy tracks power your day.', 
        svg: '<svg viewBox="0 0 24 24" width="40" height="40" fill="#fb923c"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>' 
      };
    } else if (moods.Emotional >= 55) {
      return { 
        title: 'The Soulful Seeker', 
        desc: 'Music is your therapy. You connect deeply with acoustic heartbreak songs and poetic lyrics.', 
        svg: '<svg viewBox="0 0 24 24" width="40" height="40" fill="#a855f7"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>' 
      };
    } else {
      return { 
        title: 'The Vibe Curator', 
        desc: 'Balanced, versatile, and smooth. You effortlessly switch between chill vibes, upbeat hits, and relaxing tunes.', 
        svg: '<svg viewBox="0 0 24 24" width="40" height="40" fill="#38bdf8"><path d="M12 3a9 9 0 0 0-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1a7 7 0 0 1 14 0v1h-4v8h4c1.1 0 2-.9 2-2v-7a9 9 0 0 0-9-9z"/></svg>' 
      };
    }
  },

  renderView() {
    const container = document.getElementById('main-view');
    if (!container) return;

    const moods = window.WaveHistory ? window.WaveHistory.getMoodBreakdown() : { Romantic: 80, Chill: 70, LateNight: 65, Emotional: 50, Energy: 30 };
    const persona = this.getPersona(moods);

    container.innerHTML = `
      <div class="wave-feature-container">
        <div class="wave-feature-header">
          <div class="wave-feature-title-wrap">
            <div class="wave-feature-icon-badge">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>
            </div>
            <div>
              <h1 class="wave-feature-title">WaveDNA</h1>
              <div class="wave-feature-subtitle">Your Unique Music Personality & Listening Traits</div>
            </div>
          </div>
        </div>

        <div class="wavedna-hero">
          <div class="wavedna-badge-card">
            <div class="wavedna-persona-icon" style="display:flex; align-items:center; justify-content:center;">${persona.svg}</div>
            <div style="font-size: 0.85rem; color: #a855f7; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">YOUR MUSIC PERSONALITY</div>
            <div class="wavedna-persona-title">${persona.title}</div>
            <p style="color: #cbd5e1; font-size: 0.9rem; margin-top: 12px; line-height: 1.5;">${persona.desc}</p>
          </div>

          <div style="display: flex; flex-direction: column; justify-content: center;">
            <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 20px; color: #ffffff;">Audio DNA Spectrum</h3>

            <div class="wavedna-trait-row">
              <div class="wavedna-trait-header">
                <span style="display:flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fb7185"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  Romantic
                </span>
                <span style="color: #fb7185;">${moods.Romantic}%</span>
              </div>
              <div class="wavedna-bar-bg">
                <div class="wavedna-bar-fill" style="width: ${moods.Romantic}%; background: linear-gradient(90deg, #be123c, #fb7185);"></div>
              </div>
            </div>

            <div class="wavedna-trait-row">
              <div class="wavedna-trait-header">
                <span style="display:flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#2dd4bf"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
                  Chill & Relax
                </span>
                <span style="color: #2dd4bf;">${moods.Chill}%</span>
              </div>
              <div class="wavedna-bar-bg">
                <div class="wavedna-bar-fill" style="width: ${moods.Chill}%; background: linear-gradient(90deg, #0f766e, #2dd4bf);"></div>
              </div>
            </div>

            <div class="wavedna-trait-row">
              <div class="wavedna-trait-header">
                <span style="display:flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#818cf8"><path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.6-4.9c-.6.1-1.3.1-2 .1A9 9 0 0 1 8 8.2c0-.7 0-1.4.1-2A10 10 0 0 0 12.3 2z"/></svg>
                  Late Night Vibe
                </span>
                <span style="color: #818cf8;">${moods.LateNight}%</span>
              </div>
              <div class="wavedna-bar-bg">
                <div class="wavedna-bar-fill" style="width: ${moods.LateNight}%; background: linear-gradient(90deg, #312e81, #818cf8);"></div>
              </div>
            </div>

            <div class="wavedna-trait-row">
              <div class="wavedna-trait-header">
                <span style="display:flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#a855f7"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  Emotional Connection
                </span>
                <span style="color: #a855f7;">${moods.Emotional}%</span>
              </div>
              <div class="wavedna-bar-bg">
                <div class="wavedna-bar-fill" style="width: ${moods.Emotional}%; background: linear-gradient(90deg, #6b21a8, #a855f7);"></div>
              </div>
            </div>

            <div class="wavedna-trait-row">
              <div class="wavedna-trait-header">
                <span style="display:flex; align-items:center; gap:6px;">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="#fb923c"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
                  Energy & Hype
                </span>
                <span style="color: #fb923c;">${moods.Energy}%</span>
              </div>
              <div class="wavedna-bar-bg">
                <div class="wavedna-bar-fill" style="width: ${moods.Energy}%; background: linear-gradient(90deg, #c2410c, #fb923c);"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.style.opacity = 1;
  }
};
