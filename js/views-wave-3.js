

'use strict';

window.WaveViews3 = {
  version: '3.1.0',
  initialized: true
};

window.getWaveV3PageHTML = function() {
  return `
    <div class="wave-v3-showcase">
      
      
      <section class="v3-hero-billboard">
        <div class="v3-hero-badge">
          <span class="pulse-dot" style="width:8px; height:8px; border-radius:50%; background:#1ed760; box-shadow:0 0 8px #1ed760; display:inline-block;"></span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/></svg>
          Wave Music v3.0 Beta Release
        </div>

        <h1 class="v3-hero-title">
          The Next Generation of <br>
          <span style="background: linear-gradient(135deg, #1ed760 0%, #3b82f6 50%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            High-Fidelity Web Audio
          </span>
        </h1>

        <p class="v3-hero-sub">
          Welcome to Wave Music v3.0! Experience our biggest evolution yet — featuring Netflix-style horizontal podcast rows, real-time synchronized karaoke lyrics, Dynamic Island HUD, 320kbps lossless streaming, Wave DNA sonic intelligence, and our upcoming native Android app.
        </p>

        <div class="v3-hero-actions">
          <button class="v3-primary-btn" onclick="navigateTo('podcasts', event)">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
            Explore Podcasts
          </button>
          <button class="v3-secondary-btn" onclick="navigateTo('vibe-flow', event)">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            Try Vibe Flow
          </button>
          <button class="v3-secondary-btn" onclick="navigateTo('wave-dna', event)">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>
            Wave DNA
          </button>
          <a href="#v3-android-spotlight" class="v3-secondary-btn">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
            Android App Info &darr;
          </a>
        </div>
      </section>

      
      <div style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: -0.5px;">
          What's New in Version 3.0
        </h2>
        <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">9 Major Upgrades</span>
      </div>

      <div class="v3-features-grid">
        
        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(229, 9, 20, 0.15); color: #e50914;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          </div>
          <h3>Netflix-Style Podcasts</h3>
          <p>Browse exclusive talk shows, interviews, and episodes in silky horizontal scrollable rows grouped by tags with featured billboard trailers.</p>
          <button class="v3-card-action-btn" onclick="navigateTo('podcasts', event)">
            Open Podcasts &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <h3>Synchronized Karaoke Lyrics</h3>
          <p>Real-time timestamped LRC lyrics that scroll and glow line-by-line with studio animations. Click any line to seek playback instantly.</p>
          <button class="v3-card-action-btn" onclick="navigateTo('lyrics', event)">
            View Lyrics &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="7" width="18" height="10" rx="5"/><circle cx="8" cy="12" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/></svg>
          </div>
          <h3>Dynamic Island 2.0 HUD</h3>
          <p>Interactive floating top-center media pill with real-time waveform visualizers, hover expansion, and quick track scrub controls.</p>
          <button class="v3-card-action-btn" onclick="alert('Hover or click the floating pill at the top center of your screen while playing any song!')">
            How to Use &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(30, 215, 96, 0.15); color: #1ed760;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
          </div>
          <h3>320kbps Lossless CDN</h3>
          <p>Direct JioSaavn audio pipeline delivering uncompressed 320kbps/160kbps audio with 0ms extraction delay and zero video bandwidth waste.</p>
          <button class="v3-card-action-btn" onclick="navigateTo('discover', event)">
            Browse Tracks &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>
          </div>
          <h3>Wave DNA &amp; Vibe Flow</h3>
          <p>AI-driven musical personality fingerprinting that generates customized moods, harmonic transitions, and curated vibe journeys.</p>
          <button class="v3-card-action-btn" onclick="navigateTo('wave-dna', event)">
            Explore Wave DNA &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(99, 102, 241, 0.15); color: #818cf8;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.3 2a10 10 0 0 0-1.9 20 10 10 0 0 0 8.6-4.9c-.6.1-1.3.1-2 .1A9 9 0 0 1 8 8.2c0-.7 0-1.4.1-2A10 10 0 0 0 12.3 2z"/></svg>
          </div>
          <h3>Night Wave OLED Mode</h3>
          <p>Ultra-deep pitch black theme with soft ambient starry particles and relaxing visualizers tailored for late-night listening comfort.</p>
          <button class="v3-card-action-btn" onclick="if(window.NightWave) NightWave.toggleNightWave()">
            Toggle Night Wave &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(234, 179, 8, 0.15); color: #eab308;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>
          </div>
          <h3>Time Capsule &amp; Ghost Tracks</h3>
          <p>Relive your listening history through sonic memory eras and discover unreleased demo tracks curated specifically for your profile.</p>
          <button class="v3-card-action-btn" onclick="navigateTo('time-capsule', event)">
            Open Capsule &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          </div>
          <h3>Progressive Web App (PWA)</h3>
          <p>Install Wave Music as a native standalone app across Android, iPhone, Windows, and Mac in less than 5MB of storage space.</p>
          <button class="v3-card-action-btn" onclick="window.open('mobile-app.html', '_blank')">
            PWA Install Guide &rarr;
          </button>
        </div>

        
        <div class="v3-feature-card">
          <div class="v3-card-icon-wrap" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <h3>Friends Activity &amp; Community</h3>
          <p>Real-time friend radar, live synchronized listening lounges, music blend taste compatibility, and dynamic reactions — launching first on Android!</p>
          <button class="v3-card-action-btn" onclick="navigateTo('community', event)">
            Preview Community &rarr;
          </button>
        </div>

      </div>

      
      <article class="v3-android-section" id="v3-android-spotlight">
        <div class="v3-android-header">
          <div class="v3-android-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
          </div>
          <div>
            <span style="font-size: 0.8rem; font-weight: 800; color: #1ed760; text-transform: uppercase; letter-spacing: 0.8px;">Play Store Roadmap</span>
            <h2>Official Android Native App — Coming Soon!</h2>
          </div>
        </div>

        <p>
          We are thrilled to announce that our mobile engineering team is actively developing the official native <strong>Wave Music Android Application</strong>, and it will be launching very soon on the Google Play Store! The upcoming Android app is crafted from the ground up to deliver ultra-smooth 120Hz scrolling, full offline song downloads, dedicated lockscreen media widgets with live audio visualizers, background playback optimization for maximum battery efficiency, Android Auto in-car dashboard support, and Bluetooth high-res LDAC streaming.
        </p>

        <div class="v3-android-features-row">
          <div class="v3-android-feature-pill">
            <span class="dot"></span> Offline Song Downloads
          </div>
          <div class="v3-android-feature-pill">
            <span class="dot"></span> Lockscreen Visualizer Widget
          </div>
          <div class="v3-android-feature-pill">
            <span class="dot"></span> Android Auto In-Car Dashboard
          </div>
          <div class="v3-android-feature-pill">
            <span class="dot"></span> High-Res LDAC / Spatial Audio
          </div>
          <div class="v3-android-feature-pill">
            <span class="dot"></span> Ultra Battery Saver Mode
          </div>
          <div class="v3-android-feature-pill">
            <span class="dot"></span> 100% Free &amp; Ad-Free
          </div>
        </div>

        <div style="display: flex; gap: 14px; flex-wrap: wrap;">
          <button class="v3-primary-btn" onclick="if(typeof installPwaApp === 'function') installPwaApp(); else window.open('mobile-app.html', '_blank');">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><circle cx="12" cy="12" r="9"/><path d="M12 8v7M9 12l3 3 3-3"/></svg>
            Install PWA App Now
          </button>
          <a href="mobile-app.html" target="_blank" rel="noopener noreferrer" class="v3-secondary-btn">
            View Full Mobile App Page &rarr;
          </a>
        </div>
      </article>

      
      ${typeof getFooterHTML === 'function' ? getFooterHTML() : ''}

    </div>
  `;
};

window.getInstallPageHTML = function() {
  return `
    <div class="wave-install-page">
      
      
      <div class="install-nav-back-row">
        <button class="install-back-btn" onclick="navigateTo('home', event)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Player
        </button>
      </div>

      
      <section class="install-hero-section">
        <div class="install-card-badge green" style="margin: 0 auto 16px;">
          <span class="pulse-dot" style="width:8px; height:8px; border-radius:50%; background:#1ed760; box-shadow:0 0 8px #1ed760; display:inline-block;"></span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
          Mobile &amp; Desktop App Center
        </div>
        <h1>Install Wave Music on Your Device</h1>
        <p>Choose your preferred installation method below. Enjoy full-screen playback, lockscreen controls, and ad-free 320kbps audio.</p>
      </section>

      
      <div class="install-dual-grid">
        
        
        <article class="install-action-card pwa-card">
          <div class="install-card-badge green">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z"/></svg>
            Instant Install — Ready Now
          </div>

          <div class="install-card-icon-title">
            <div class="install-card-icon green">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            </div>
            <div>
              <h2>Progressive Web App (PWA)</h2>
              <span style="font-size: 0.82rem; color: #1ed760; font-weight: 700;">Android • iOS • Windows • macOS</span>
            </div>
          </div>

          <p class="card-desc">
            Install Wave Music in under 3 seconds straight from your browser. Ultra-lightweight (&lt; 5MB), supports lockscreen controls, and updates in real-time.
          </p>

          <ul class="install-features-list">
            <li>Instant 1-click install (No Play Store / App Store download needed)</li>
            <li>Microscopic storage footprint (&lt; 5MB vs 200MB+ traditional apps)</li>
            <li>Standalone fullscreen window with hardware media keys support</li>
            <li>Full lockscreen media widget &amp; Dynamic Island HUD integration</li>
            <li>100% Free with zero ads, tracking, or subscription paywalls</li>
          </ul>

          <button class="btn-install-pwa-now" id="inapp-pwa-install-btn" onclick="if(typeof installPwaApp === 'function') installPwaApp();">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 8v7M9 12l3 3 3-3"/></svg>
            Install PWA App Now
          </button>
        </article>

        
        <article class="install-action-card android-card">
          <div class="install-card-badge purple">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
            Official Android App — In Development
          </div>

          <div class="install-card-icon-title">
            <div class="install-card-icon purple">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
            </div>
            <div>
              <h2>Native Android App</h2>
              <span style="font-size: 0.82rem; color: #c084fc; font-weight: 700;">Google Play Store &amp; Direct APK</span>
            </div>
          </div>

          <p class="card-desc">
            Our dedicated native Android application is currently in active development and will be launching soon on the Google Play Store!
          </p>

          <ul class="install-features-list">
            <li>High-speed offline track downloads to internal device storage</li>
            <li>Native lockscreen media player with live equalizer visualizers</li>
            <li>Android Auto integration for smart in-car dashboards</li>
            <li>120Hz smooth animations &amp; battery saver optimization</li>
            <li>Dolby Atmos / High-Res LDAC spatial audio decoding</li>
          </ul>

          <button class="btn-android-coming-soon" onclick="showAndroidComingSoonModal()">
            <span class="coming-soon-pill-inline">Coming Soon</span>
            Native Android App
          </button>
        </article>

      </div>

      
      <section class="install-guide-box">
        <h3>Quick Installation Instructions</h3>
        <p class="guide-sub">If the 1-click install button above does not trigger, follow these simple browser steps:</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px;">
          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 18px; border-radius: 12px;">
            <div style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 8px; display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
              Android (Chrome)
            </div>
            <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.6;">Tap the <strong>3 dots (⋮)</strong> menu in Chrome &gt; Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
          </div>

          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 18px; border-radius: 12px;">
            <div style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 8px; display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 0.6-2.65 1.35-.58.66-.99 1.72-.88 2.74 1.01.08 2.01-.52 2.61-1.24z"/></svg>
              iPhone (Safari)
            </div>
            <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.6;">Tap the <strong>Share button (⎋)</strong> at the bottom &gt; Scroll down &gt; Tap <strong>"Add to Home Screen"</strong>.</p>
          </div>

          
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); padding: 18px; border-radius: 12px;">
            <div style="font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 8px; display:flex; align-items:center; gap:8px;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>
              Windows / macOS
            </div>
            <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.6;">Click the <strong>Install icon</strong> in your browser address bar &gt; Click <strong>Install</strong> to open in standalone window.</p>
          </div>
        </div>
      </section>

      
      ${typeof getFooterHTML === 'function' ? getFooterHTML() : ''}

    </div>
  `;
};

window.showAndroidComingSoonModal = function() {
  const existing = document.getElementById('android-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'android-modal-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(16px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: fadeIn 0.2s ease;
  `;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="
      background: #111624; border: 1px solid rgba(168, 85, 247, 0.4);
      border-radius: 20px; padding: 32px; max-width: 480px; width: 100%;
      text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(168, 85, 247, 0.25);
      position: relative;
    ">
      <button onclick="document.getElementById('android-modal-overlay').remove()" style="
        position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1);
        border: none; border-radius: 50%; width: 32px; height: 32px; color: #fff;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
      ">✕</button>

      <div style="
        width: 60px; height: 60px; border-radius: 16px; background: rgba(168, 85, 247, 0.2);
        color: #c084fc; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px; box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
      ">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
      </div>

      <span style="
        background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);
        padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: 0.8px; display: inline-block; margin-bottom: 12px;
      ">In Active Development</span>

      <h3 style="font-size: 1.4rem; font-weight: 800; color: #fff; margin-bottom: 12px;">Android App Coming Soon!</h3>

      <p style="color: #94a3b8; font-size: 0.94rem; line-height: 1.6; margin-bottom: 24px;">
        We are actively building the official native Wave Music Android App for Google Play Store with offline song downloads, lockscreen widgets, and Android Auto!
        <br><br>
        <strong style="color: #1ed760;">In the meantime, click below to install the instant PWA app on your device right now!</strong>
      </p>

      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button onclick="document.getElementById('android-modal-overlay').remove(); if(typeof installPwaApp==='function') installPwaApp();" style="
          background: #1ed760; color: #000; font-weight: 800; font-size: 0.92rem;
          padding: 12px 24px; border-radius: 500px; border: none; cursor: pointer;
          box-shadow: 0 4px 16px rgba(30, 215, 96, 0.4);
        ">Install PWA Now</button>
        <button onclick="document.getElementById('android-modal-overlay').remove()" style="
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-weight: 600; font-size: 0.92rem; padding: 12px 20px;
          border-radius: 500px; cursor: pointer;
        ">Got It</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
};

window.getCommunityPageHTML = function() {
  return `
    <div class="wave-community-page">
      
      
      <div class="community-nav-back-row">
        <button class="community-back-btn" onclick="navigateTo('home', event)">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to Player
        </button>
        <div class="community-status-pill">
          <span class="community-pulse-dot"></span>
          <span>Wave v3 Social Hub • In Active Development</span>
        </div>
      </div>

      
      <section class="community-hero-billboard">
        <div class="community-badge-row">
          <div class="community-hero-badge">
            <span class="pulse-dot" style="width:8px; height:8px; border-radius:50%; background:#1ed760; box-shadow:0 0 8px #1ed760; display:inline-block;"></span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            Friends Activity &amp; Community
          </div>
          <div class="community-android-tag">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
            Launching First on Android App
          </div>
        </div>

        <h1 class="community-hero-title">
          Music is Better Together.<br>
          <span class="community-title-gradient">
            Connect, Share &amp; Stream in Real Time.
          </span>
        </h1>

        <p class="community-hero-sub">
          Welcome to the future of social listening on Wave Music! See what your friends are jamming to live, blend your musical tastes into shared daily playlists, host synchronized listening lounges, and send instant real-time reactions.
          <br><br>
          <strong style="color: #6ee7b7;">Status Notice:</strong> This feature is currently in active development and will be <strong>launching first on our upcoming official native Wave Android App (Google Play Store &amp; APK)</strong>, followed by the Web release. Experience the preview below and pre-register for early beta access!
        </p>

        <div class="community-hero-actions">
          <button class="community-primary-btn" onclick="showCommunityNotifyModal()">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
            Pre-Register for Android Beta
          </button>
          <button class="community-secondary-btn" onclick="document.getElementById('community-features-section').scrollIntoView({behavior: 'smooth'})">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/></svg>
            Explore Upcoming Features &darr;
          </button>
          <button class="community-glass-btn" onclick="if(typeof installPwaApp === 'function') installPwaApp(); else navigateTo('install');">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
            Install PWA App Now
          </button>
        </div>
      </section>

      
      <article class="community-android-spotlight">
        <div class="spotlight-left">
          <div class="spotlight-icon-wrap">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor"><path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-4.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.68 2.24 12.87 2 12 2c-.87 0-1.68.24-2.64.63L7.88.65c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.3 1.3C6.73 3.69 5.5 5.67 5.5 8h13c0-2.33-1.23-4.31-2.97-5.34zM9 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
          </div>
          <div>
            <span class="spotlight-mini-tag">Play Store &amp; Direct APK Roadmap</span>
            <h2>Why Android App First for Community?</h2>
            <p>
              The native Wave Android App is engineered with low-latency WebSockets, background foreground synchronization, dedicated lockscreen social radar widgets, and Bluetooth LE proximity party mode for instant, battery-efficient social listening anywhere you go.
            </p>
          </div>
        </div>

        <div class="spotlight-actions">
          <div class="spotlight-meter-wrap">
            <div class="meter-info">
              <span>Android Beta Progress</span>
              <span style="color:#1ed760; font-weight:800;">85% Completed</span>
            </div>
            <div class="meter-bar">
              <div class="meter-fill" style="width:85%;"></div>
            </div>
          </div>
          <button class="spotlight-btn" onclick="showCommunityNotifyModal()">
            Reserve Early VIP Beta
          </button>
        </div>
      </article>

      
      <section class="community-blend-card">
        <div class="blend-info-col">
          <span style="font-size: 0.8rem; font-weight: 800; color: #ec4899; text-transform: uppercase; letter-spacing: 0.8px;">Algorithm Preview</span>
          <h3>Music Blend 2.0 &amp; Taste Compatibility</h3>
          <p>
            Combine your music DNA with any friend into an automatically updating daily playlist. Our AI analyzes mutual genre overlaps, BPM preferences, and mood tags to curate a playlist you will both love with a live match meter!
          </p>
          <button class="community-primary-btn" style="background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color:#fff;" onclick="showCommunityNotifyModal()">
            Blend With Friends (Coming Soon)
          </button>
        </div>

        <div class="blend-visual-col">
          <div class="blend-avatar-pair">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Friend avatar" class="blend-avatar">
            <span class="blend-plus-icon">+</span>
            <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg, #1ed760, #3b82f6); display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:800; border:3px solid #38bdf8; box-shadow:0 0 16px rgba(56,189,248,0.4);">YOU</div>
          </div>
          <div class="blend-score-badge">94% Sonic Taste Match</div>
          <p style="font-size:0.85rem; color:#94a3b8; margin:0;">Top Shared Genres: Synthwave • Bollywood Melodies • Lo-Fi Chill</p>
        </div>
      </section>

      
      <div id="community-features-section" style="margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; letter-spacing: -0.5px;">
          What's Coming in Wave Community
        </h2>
        <span style="font-size: 0.85rem; color: #94a3b8; font-weight: 600;">6 Groundbreaking Features</span>
      </div>

      <div class="comm-features-grid">
        
        
        <div class="comm-feature-card">
          <div class="comm-card-icon-wrap" style="background: rgba(30, 215, 96, 0.15); color: #1ed760;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
          </div>
          <h3>Real-Time Friend Radar</h3>
          <p>Instant live visibility into what your friends and followed artists are streaming right now with live waveform visualizers and 1-tap playback sync.</p>
          <span class="comm-tag-pill">Android First</span>
        </div>

        
        <div class="comm-feature-card">
          <div class="comm-card-icon-wrap" style="background: rgba(236, 72, 153, 0.15); color: #ec4899;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/></svg>
          </div>
          <h3>Music Blend &amp; Match Score</h3>
          <p>AI-driven taste blending that merges your listening history with your best friends, providing daily updated shared playlists and compatibility scores.</p>
          <span class="comm-tag-pill">AI Powered</span>
        </div>

        
        <div class="comm-feature-card">
          <div class="comm-card-icon-wrap" style="background: rgba(168, 85, 247, 0.15); color: #a855f7;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <h3>Group Listening Lounges</h3>
          <p>Host virtual listening rooms with up to 50 friends in perfect lockstep audio synchronization. Chat, react in real-time, and pass the DJ queue.</p>
          <span class="comm-tag-pill">320kbps Sync</span>
        </div>

        
        <div class="comm-feature-card">
          <div class="comm-card-icon-wrap" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <h3>Dynamic Audio Reactions</h3>
          <p>Send animated visual reactions and stickers that trigger across your friends' screens in real-time as beat drops and guitar solos hit.</p>
          <span class="comm-tag-pill">Interactive</span>
        </div>

        
        <div class="comm-feature-card">
          <div class="comm-card-icon-wrap" style="background: rgba(234, 179, 8, 0.15); color: #eab308;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <h3>Community Vibe Charts</h3>
          <p>Vote on weekly community top 50 playlists, discover indie gems trending organically, and follow community-curated playlists.</p>
          <span class="comm-tag-pill">Weekly Updates</span>
        </div>

        
        <div class="comm-feature-card">
          <div class="comm-card-icon-wrap" style="background: rgba(14, 165, 233, 0.15); color: #0ea5e9;">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>
          </div>
          <h3>VIP Badges &amp; Top Fan Ranks</h3>
          <p>Earn verified community badges such as "Top 1% Artist Streamer", "Early Pioneer", and "Vibe Flow Guru" based on your true listening habits.</p>
          <span class="comm-tag-pill">Profile Showcase</span>
        </div>

      </div>

      
      <section class="community-signup-box">
        <div class="signup-box-content">
          <div class="signup-icon" style="color:#1ed760; display:flex; justify-content:center;">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <h3>Be the First to Experience Friends Activity on Android!</h3>
          <p>
            Enter your email or handle below to reserve your early access VIP slot for the official native Wave Music Android beta release.
          </p>
          <form class="community-signup-form" onsubmit="handleCommunityPreRegister(event)">
            <input type="text" id="community-email-input" placeholder="Enter your email or @handle..." required>
            <button type="submit" class="community-submit-btn">
              <span>Reserve Beta Slot</span> &rarr;
            </button>
          </form>
          <div class="signup-note" id="community-signup-status">
            100% Free &amp; Ad-Free. We will notify you the moment the Android APK / Play Store build is ready.
          </div>
        </div>
      </section>

      
      ${typeof getFooterHTML === 'function' ? getFooterHTML() : ''}

    </div>
  `;
};

window.showCommunityNotifyModal = function() {
  const existing = document.getElementById('community-modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'community-modal-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0, 0, 0, 0.78);
    backdrop-filter: blur(16px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px; animation: fadeIn 0.2s ease;
  `;
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="
      background: #111624; border: 1px solid rgba(168, 85, 247, 0.45);
      border-radius: 24px; padding: 36px 30px; max-width: 500px; width: 100%;
      text-align: center; box-shadow: 0 24px 70px rgba(0,0,0,0.85), 0 0 35px rgba(168, 85, 247, 0.3);
      position: relative;
    ">
      <button onclick="document.getElementById('community-modal-overlay').remove()" style="
        position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.1);
        border: none; border-radius: 50%; width: 34px; height: 34px; color: #fff;
        cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
      ">✕</button>

      <div style="
        width: 64px; height: 64px; border-radius: 18px; background: rgba(168, 85, 247, 0.2);
        color: #c084fc; display: flex; align-items: center; justify-content: center;
        margin: 0 auto 16px; box-shadow: 0 0 24px rgba(168, 85, 247, 0.4);
      ">
        <svg viewBox="0 0 24 24" width="34" height="34" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
      </div>

      <span style="
        background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.4);
        padding: 4px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase;
        letter-spacing: 0.8px; display: inline-block; margin-bottom: 12px;
      ">Android Beta First Release</span>

      <h3 style="font-size: 1.5rem; font-weight: 900; color: #fff; margin-bottom: 12px;">Friends Community is Coming Soon!</h3>

      <p style="color: #cbd5e1; font-size: 0.95rem; line-height: 1.65; margin-bottom: 20px;">
        The Friends Activity &amp; Community social engine is being built natively for our upcoming <strong>Wave Music Android App</strong> on Google Play Store!
        <br><br>
        Enter your details to reserve your early access VIP beta slot:
      </p>

      <form onsubmit="handleModalPreRegister(event)" style="margin-bottom: 18px;">
        <input type="text" id="modal-community-email" placeholder="Your email or @handle..." required style="
          width: 100%; box-sizing: border-box; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.18);
          border-radius: 500px; padding: 12px 20px; color: #fff; font-size: 0.95rem; margin-bottom: 12px; outline: none;
        ">
        <button type="submit" style="
          width: 100%; background: linear-gradient(135deg, #1ed760 0%, #00f076 100%); color: #000; font-weight: 800;
          font-size: 0.95rem; padding: 13px 24px; border-radius: 500px; border: none; cursor: pointer;
          box-shadow: 0 4px 18px rgba(30, 215, 96, 0.4);
        ">Reserve Early Beta Access</button>
      </form>

      <div id="modal-status-text" style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;"></div>

      <div style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <button onclick="document.getElementById('community-modal-overlay').remove(); if(typeof installPwaApp==='function') installPwaApp(); else navigateTo('install');" style="
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-weight: 600; font-size: 0.88rem; padding: 10px 18px;
          border-radius: 500px; cursor: pointer;
        ">Install Web PWA Now</button>
        <button onclick="document.getElementById('community-modal-overlay').remove()" style="
          background: transparent; border: 1px solid transparent;
          color: #94a3b8; font-weight: 600; font-size: 0.88rem; padding: 10px 16px;
          border-radius: 500px; cursor: pointer;
        ">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
};

window.handleModalPreRegister = function(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('modal-community-email');
  const status = document.getElementById('modal-status-text');
  if (!input || !input.value.trim()) return;

  const val = input.value.trim();
  try {
    localStorage.setItem('wave_community_beta_user', val);
  } catch(err) {}

  if (status) {
    status.innerHTML = `<span style="color:#1ed760; font-weight:700;">You're on the VIP list (${val})! We will notify you upon Android beta launch.</span>`;
  }
  if (typeof showDynamicIsland === 'function') {
    showDynamicIsland('VIP Beta Slot Reserved!', 'success', 3000);
  }
  setTimeout(() => {
    const modal = document.getElementById('community-modal-overlay');
    if (modal) modal.remove();
  }, 2200);
};

window.handleCommunityPreRegister = function(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('community-email-input');
  const status = document.getElementById('community-signup-status');
  if (!input || !input.value.trim()) return;

  const val = input.value.trim();
  try {
    localStorage.setItem('wave_community_beta_user', val);
  } catch(err) {}

  if (status) {
    status.innerHTML = `<span style="color:#1ed760; font-weight:800; font-size:0.95rem;">Success! You're reserved on the VIP Android Beta list (${val}).</span>`;
  }
  input.value = '';
  if (typeof showDynamicIsland === 'function') {
    showDynamicIsland('VIP Beta Slot Reserved!', 'success', 3000);
  }
};

window.initCommunityView = function() {
  const savedUser = localStorage.getItem('wave_community_beta_user');
  if (savedUser) {
    const status = document.getElementById('community-signup-status');
    if (status) {
      status.innerHTML = `<span style="color:#1ed760; font-weight:700;">You are already registered on the VIP Android Beta list (${savedUser}).</span>`;
    }
  }
};
