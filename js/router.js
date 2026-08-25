'use strict';

let navHistory = [{ view: 'home', param: undefined }];
let navIndex = 0;

function updateNavArrows() {
  const btnBack    = document.getElementById('btn-back');
  const btnForward = document.getElementById('btn-forward');
  if (btnBack)    btnBack.disabled    = (navIndex <= 0);
  if (btnForward) btnForward.disabled = (navIndex >= navHistory.length - 1);
}

function toggleLibrarySidebar() {
  const sidebar = document.querySelector('.sidebar-library');
  if (!sidebar) return;

  const isCollapsed = sidebar.classList.toggle('lib-collapsed');
  
  if (isCollapsed) {
    sidebar.classList.remove('lib-expanded');
  }

  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    if (window.innerWidth > 768) {
      if (isCollapsed) {
        appContainer.style.gridTemplateColumns = '72px 1fr var(--right-sidebar-w)';
      } else {
        appContainer.style.gridTemplateColumns = 'var(--sidebar-w) 1fr var(--right-sidebar-w)';
      }
    } else {
      appContainer.style.gridTemplateColumns = '';
    }
  }

  try { localStorage.setItem('wave_lib_collapsed', isCollapsed ? '1' : '0'); } catch(e) {}
}

window.toggleCreateMenu = function(e) {
  if (e) e.stopPropagation();
  const menu = document.getElementById('lib-create-menu');
  const addBtn = document.getElementById('lib-add-btn');
  const addIcon = document.getElementById('lib-add-icon');

  if (!menu) return;

  const isHidden = menu.classList.toggle('hidden');
  if (addBtn) addBtn.classList.toggle('active', !isHidden);

  if (addIcon) {
    if (!isHidden) {
      addIcon.innerHTML = `<path d="M13.41 2.59L8 8l5.41 5.41L12 14.83 6.59 9.41 1.17 14.83-.24 13.41 5.17 8-.24 2.59 1.17 1.17 6.59 6.59 12 1.17z"/>`;
    } else {
      addIcon.innerHTML = `<path d="M14 7H9V2H7v5H2v2h5v5h2V9h5z"/>`;
    }
  }
};

document.addEventListener('click', function(e) {
  const menu = document.getElementById('lib-create-menu');
  const addBtn = document.getElementById('lib-add-btn');
  if (menu && !menu.classList.contains('hidden')) {
    if (!menu.contains(e.target) && (!addBtn || !addBtn.contains(e.target))) {
      menu.classList.add('hidden');
      if (addBtn) addBtn.classList.remove('active');
      const addIcon = document.getElementById('lib-add-icon');
      if (addIcon) addIcon.innerHTML = `<path d="M14 7H9V2H7v5H2v2h5v5h2V9h5z"/>`;
    }
  }
});

window.toggleExpandLibrary = function() {
  const sidebar = document.querySelector('.sidebar-library');
  if (sidebar && sidebar.classList.contains('lib-collapsed')) {
    sidebar.classList.remove('lib-collapsed');
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
      appContainer.style.gridTemplateColumns = 'var(--sidebar-w) 1fr var(--right-sidebar-w)';
    }
  }

  if (state.currentView === 'library') {
    if (navHistory && navHistory.length > 1) {
      window.history.back();
    } else {
      navigateTo('home');
    }
  } else {
    navigateTo('library');
  }
};

function restoreSidebarState() {
  try {
    const collapsed = localStorage.getItem('wave_lib_collapsed');
    if (collapsed === '1') {
      const sidebar = document.querySelector('.sidebar-library');
      const appContainer = document.querySelector('.app-container');
      if (sidebar) sidebar.classList.add('lib-collapsed');
      if (appContainer) {
        appContainer.style.gridTemplateColumns = '72px 1fr var(--right-sidebar-w)';
      }
    }
  } catch(e) {}
}

function getHashUrl(view, param) {
  let hash = '#/' + (view || 'home');
  if (param) hash += '/' + encodeURIComponent(param);
  return hash;
}

function parseUrlHash() {
  let hash = window.location.hash || '';
  if (hash.startsWith('#/')) hash = hash.substring(2);
  else if (hash.startsWith('#')) hash = hash.substring(1);

  const parts = hash.split('/').map(p => decodeURIComponent(p));
  const view = parts[0] || 'home';
  const param = parts[1] || null;
  return { view, param };
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else if (navIndex > 0) {
    navIndex--;
    const { view, param } = navHistory[navIndex];
    _renderViewAndNav(view, param);
    updateNavArrows();
  }
}

function goForward() {
  window.history.forward();
}

const HOME_FILLED_PATH = 'M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732z';
const HOME_OUTLINE_PATH = 'M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h5v-6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6h5V7.577l-7.5-4.33zM2 7.577a3 3 0 0 1 1.5-2.598l7.5-4.33a3 3 0 0 1 3 0l7.5 4.33a3 3 0 0 1 1.5 2.598V21a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-5h-2v5a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577z';

function updateHomeIconState(view) {
  const isHome = (view === 'home');
  const homeBtns = document.querySelectorAll('.sp-home-circle, .mob-nav-item[onclick*="home"]');
  
  homeBtns.forEach(btn => {
    const svgPath = btn.querySelector('svg path');
    if (svgPath) {
      svgPath.setAttribute('d', isHome ? HOME_FILLED_PATH : HOME_OUTLINE_PATH);
    }
    if (btn.classList.contains('sp-home-circle')) {
      btn.style.color = isHome ? '#ffffff' : '#b3b3b3';
    }
  });
}

function navigateTo(view, event, param, skipPushState = false) {
  if (event) event.preventDefault();

  if (view === 'lyrics' && window.innerWidth <= 768) {
    if (typeof openMobileLyricsPage === 'function') {
      openMobileLyricsPage();
    }
    return;
  }

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (event && event.currentTarget && event.currentTarget.classList.contains('nav-item')) {
    event.currentTarget.classList.add('active');
  }

  document.querySelectorAll('.mob-nav-item').forEach(el => {
    el.classList.remove('active');
    const onclickAttr = el.getAttribute('onclick') || '';
    if (onclickAttr.includes(`'${view}'`) || onclickAttr.includes(`"${view}"`)) {
      el.classList.add('active');
    }
  });

  if (navHistory[navIndex]?.view !== view || navHistory[navIndex]?.param !== param) {
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push({ view, param });
    navIndex = navHistory.length - 1;
  }

  if (view === 'playlist') {
    if (state.currentView === 'library') {
      state.playlistViewMode = 'full';
      try { localStorage.setItem('wave_pl_view_mode', 'full'); } catch(e) {}
    }
  }

  state.currentView = view;
  updateHomeIconState(view);
  const lyricsBtn = document.getElementById('lyrics-toggle-btn');
  if (lyricsBtn) lyricsBtn.classList.toggle('active', view === 'lyrics');

  renderView(view, param);
  updateNavArrows();
  if (typeof updateDynamicDocumentTitle === 'function') updateDynamicDocumentTitle();

  if (!skipPushState) {
    const hashUrl = getHashUrl(view, param);
    if (window.location.hash !== hashUrl) {
      window.history.pushState({ view, param }, '', hashUrl);
    }
  }
}

function _renderViewAndNav(view, param) {
  state.currentView = view;
  updateHomeIconState(view);
  const lyricsBtn = document.getElementById('lyrics-toggle-btn');
  if (lyricsBtn) lyricsBtn.classList.toggle('active', view === 'lyrics');

  document.querySelectorAll('.nav-item').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    if (onclick.includes(`'${view}'`)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  document.querySelectorAll('.mob-nav-item').forEach(el => {
    el.classList.remove('active');
    const onclickAttr = el.getAttribute('onclick') || '';
    if (onclickAttr.includes(`'${view}'`) || onclickAttr.includes(`"${view}"`)) {
      el.classList.add('active');
    }
  });

  renderView(view, param);
  if (typeof updateDynamicDocumentTitle === 'function') updateDynamicDocumentTitle();
}

function handlePopState(e) {
  let view = 'home';
  let param = null;

  if (e && e.state && e.state.view) {
    view = e.state.view;
    param = e.state.param || null;
  } else {
    const parsed = parseUrlHash();
    view = parsed.view;
    param = parsed.param;
  }

  _renderViewAndNav(view, param);
  updateNavArrows();
}

window.addEventListener('popstate', handlePopState);

window.switchHomeTab = function(tab) {
  const pills = document.querySelectorAll('.sp-main-pill, .sp-mob-pill');
  pills.forEach(p => p.classList.remove('active'));
  pills.forEach(p => {
    if (p.textContent.trim().toLowerCase() === tab) {
      p.classList.add('active');
    }
  });
  closeCategoriesDropdown();
  if (tab === 'podcasts') {
    navigateTo('podcasts');
  } else {
    navigateTo('home');
  }
};

window.toggleCategoriesDropdown = function(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  const menu = document.getElementById('categories-dropdown-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
};

window.closeCategoriesDropdown = function() {
  const menu = document.getElementById('categories-dropdown-menu');
  if (menu) menu.classList.add('hidden');
};

window.selectCategory = function(view) {
  closeCategoriesDropdown();
  const catBtn = document.getElementById('categories-dropdown-btn');
  const pills = document.querySelectorAll('.sp-main-pill');
  pills.forEach(p => p.classList.remove('active'));
  if (catBtn) catBtn.classList.add('active');
  navigateTo(view);
};

document.addEventListener('click', function(e) {
  const menu = document.getElementById('categories-dropdown-menu');
  if (menu && !menu.classList.contains('hidden')) {
    if (!menu.contains(e.target) && !e.target.closest('#categories-dropdown-btn')) {
      menu.classList.add('hidden');
    }
  }
});

let _renderViewTimer = null;

function renderView(view, param) {
  const container = document.getElementById('main-view');
  if (!container) return;

  const appContainer = document.querySelector('.app-container');
  if (appContainer) {
    if (window.innerWidth > 768) {
      const isPlFull = (view === 'playlist' && (state.playlistViewMode === 'full' || localStorage.getItem('wave_pl_view_mode') === 'full'));
      if (view === 'library' || isPlFull) {
        appContainer.classList.add('full-page-mode');
      } else {
        appContainer.classList.remove('full-page-mode');
        const sidebar = document.querySelector('.sidebar-library');
        const isCollapsed = sidebar && sidebar.classList.contains('lib-collapsed');
        appContainer.style.gridTemplateColumns = isCollapsed 
          ? '72px 1fr var(--right-sidebar-w)' 
          : 'var(--sidebar-w) 1fr var(--right-sidebar-w)';
      }
    } else {
      appContainer.classList.remove('full-page-mode');
      appContainer.style.gridTemplateColumns = '';
    }
  }

  const mainPills = document.querySelector('.sp-main-pills');
  if (mainPills) {
    const isFeatureView = ['home', 'podcasts', 'wave-v3', 'v3', 'community', 'friends', 'friends-activity', 'wave-story', 'vibe-flow', 'wave-dna', 'time-capsule', 'song-journey', 'ghost-playlist'].includes(view);
    mainPills.style.display = isFeatureView ? 'flex' : 'none';
    
    
    const isCategoryView = ['community', 'friends', 'friends-activity', 'wave-story', 'vibe-flow', 'wave-dna', 'time-capsule', 'song-journey', 'ghost-playlist'].includes(view);
    const catBtn = document.getElementById('categories-dropdown-btn');
    if (catBtn) catBtn.classList.toggle('active', isCategoryView);

    mainPills.querySelectorAll('.sp-main-pill:not(#categories-dropdown-btn)').forEach(btn => {
      const onclick = btn.getAttribute('onclick') || '';
      if (view === 'home') {
        btn.classList.toggle('active', onclick.includes("'all'"));
      } else {
        btn.classList.toggle('active', onclick.includes(`'${view}'`));
      }
    });
  }

  const isMobile = window.innerWidth <= 768;
  const island = document.getElementById('dynamic-island');
  if (island) island.style.display = (view === 'search' && isMobile) ? 'none' : '';

  if (_renderViewTimer) clearTimeout(_renderViewTimer);
  _renderViewTimer = setTimeout(() => {
    if (view === 'home') {
      container.innerHTML = getHomeHTML();
    } else if (view === 'install' || view === 'download' || view === 'app') {
      container.innerHTML = (typeof getInstallPageHTML === 'function') ? getInstallPageHTML() : '<div>Loading Install App...</div>';
    } else if (view === 'wave-v3' || view === 'v3') {
      container.innerHTML = (typeof getWaveV3PageHTML === 'function') ? getWaveV3PageHTML() : '<div>Loading Wave v3...</div>';
    } else if (view === 'community' || view === 'friends' || view === 'friends-activity') {
      container.innerHTML = (typeof getCommunityPageHTML === 'function') ? getCommunityPageHTML() : '<div>Loading Friends Community...</div>';
      setTimeout(() => {
        if (typeof initCommunityView === 'function') initCommunityView();
      }, 50);
    } else if (view === 'profile' || view === 'account') {
      container.innerHTML = getProfilePageHTML();
      setTimeout(() => {
        if (typeof attachProfileScrollListener === 'function') attachProfileScrollListener();
      }, 50);
    } else if (view === 'settings' || view === 'preferences') {
      container.innerHTML = (typeof getSettingsPageHTML === 'function') ? getSettingsPageHTML() : '<div>Loading Settings...</div>';
      setTimeout(() => {
        if (typeof initSettingsView === 'function') initSettingsView();
      }, 50);
    } else if (view === 'recents') {
      container.innerHTML = getRecentsPageHTML();
    } else if (view === 'top-tracks') {
      container.innerHTML = getTopTracksPageHTML();
    } else if (view === 'song') {
      container.innerHTML = getSongPageHTML(param);
      setTimeout(attachSongScrollListener, 50);
    } else if (view === 'radio') {
      container.innerHTML = getRadioPageHTML(param);
      setTimeout(attachRadioScrollListener, 50);
    } else if (view === 'playlist') {
      container.innerHTML = getPlaylistHTML(param);
      setTimeout(() => { if (typeof attachPlaylistScrollListener === 'function') attachPlaylistScrollListener(param); }, 50);
    } else if (view === 'liked') {
      container.innerHTML = getLikedHTML();
    } else if (view === 'library') {
      container.innerHTML = getLibraryHTML();
    } else if (view === 'artist') {
      container.innerHTML = getArtistHTML(param);
    } else if (view === 'album') {
      container.innerHTML = getAlbumHTML(param);
      setTimeout(() => { if (typeof attachPlaylistScrollListener === 'function') attachPlaylistScrollListener(param); }, 50);
    } else if (view === 'discover') {
      container.innerHTML = getDiscoverPageHTML();
    } else if (view === 'trending') {
      container.innerHTML = getTrendingPageHTML();
    } else if (view === 'podcasts') {
      container.innerHTML = getPodcastsPageHTML();
    } else if (view === 'wave-story') {
      if (window.WaveStory) window.WaveStory.renderView();
    } else if (view === 'vibe-flow') {
      if (window.VibeFlow) window.VibeFlow.renderView();
    } else if (view === 'wave-dna') {
      if (window.WaveDNA) window.WaveDNA.renderView();
    } else if (view === 'time-capsule') {
      if (window.TimeCapsule) window.TimeCapsule.renderView();
    } else if (view === 'song-journey') {
      if (window.SongJourney) window.SongJourney.renderView();
    } else if (view === 'ghost-playlist') {
      if (window.GhostPlaylist) window.GhostPlaylist.renderView();
    } else if (view === 'lyrics') {
      container.innerHTML = getLyricsPageHTML();
      setTimeout(() => {
        if (typeof initLyricsPageView === 'function') initLyricsPageView();
      }, 50);
    } else if (view === 'notifications' || view === 'whats-new') {
      container.innerHTML = getNotificationsPageHTML(param);
    } else if (view === 'search' || view === 'discover') {
      const isMobileScreen = (typeof isMobile !== 'undefined' && isMobile) || (window.innerWidth <= 768);
      if (isMobileScreen) {
        container.innerHTML = (typeof getMobileSearchPageHTML === 'function') 
          ? getMobileSearchPageHTML(param) 
          : getDiscoverPageHTML();
      } else {
        const qToSearch = param || (document.getElementById('search-input') ? document.getElementById('search-input').value.trim() : '');
        if (qToSearch) {
          showSearchResults(qToSearch);
        } else {
          container.innerHTML = getDiscoverPageHTML();
        }
      }
      container.style.opacity = 1;
      return;
    } else if (view === 'jiosaavn-browse') {
      renderJioSaavnBrowse(container);
    } else {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h2 style="font-size: 28px; margin-bottom: 10px;">${view.charAt(0).toUpperCase() + view.slice(1)}</h2>
          <p style="color: var(--text-muted);">This page is coming soon!</p>
        </div>
      `;
    }
    
    
    const expandBtn = document.getElementById('lib-expand-btn');
    const expandIcon = document.getElementById('lib-expand-icon');
    if (expandIcon) {
      if (view === 'library') {
        expandIcon.innerHTML = `<path d="M14.78 2.28a.75.75 0 0 0-1.06 0L11 4.94V2.5a.75.75 0 0 0-1.5 0V7c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-2.44l2.66-2.66a.75.75 0 0 0 0-1.06zM2.28 14.78a.75.75 0 0 0 1.06 0L6 12.06v2.44a.75.75 0 0 0 1.5 0V10a.75.75 0 0 0-.75-.75H2.25a.75.75 0 0 0 0 1.5h2.44l-2.66 2.66a.75.75 0 0 0 0 1.06z"/>`;
        if (expandBtn) expandBtn.title = "Reduce Your Library";
      } else {
        expandIcon.innerHTML = `<path d="M6.53 9.47a.75.75 0 0 1 0 1.06l-2.72 2.72h1.018a.75.75 0 0 1 0 1.5H1.25v-3.579a.75.75 0 0 1 1.5 0v1.018l2.72-2.72a.75.75 0 0 1 1.06 0zm2.94-2.94a.75.75 0 0 1 0-1.06l2.72-2.72h-1.018a.75.75 0 1 1 0-1.5h3.578v3.579a.75.75 0 0 1-1.5 0V3.81l-2.72 2.72a.75.75 0 0 1-1.06 0"></path>`;
        if (expandBtn) expandBtn.title = "Expand Your Library";
      }
    }

    container.style.opacity = 1;
  }, 150);
}

window.navigateTo = navigateTo;
window.renderView = renderView;
window.updateNavArrows = updateNavArrows;
window.updateHomeIconState = updateHomeIconState;

