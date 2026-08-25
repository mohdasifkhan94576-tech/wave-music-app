'use strict';

 

window.NextWave = {
  
  getReason(currentSong, nextSong) {
    if (!currentSong || !nextSong) return 'Smart Next Wave pick';

    const curArtist = String(currentSong.artist || currentSong.singers || '').toLowerCase();
    const nextArtist = String(nextSong.artist || nextSong.singers || '').toLowerCase();

    
    if (curArtist && nextArtist && (curArtist.includes(nextArtist) || nextArtist.includes(curArtist))) {
      const name = nextSong.artist ? nextSong.artist.split(',')[0].trim() : 'Same artist';
      return `Same artist (${name})`;
    }

    
    const hour = new Date().getHours();
    if (hour >= 22 || hour < 5) {
      return `Perfect for late night`;
    }

    
    const curTitle = String(currentSong.title || '').toLowerCase();
    const nextTitle = String(nextSong.title || '').toLowerCase();

    if (curTitle.includes('love') || curTitle.includes('dil') || nextTitle.includes('love')) {
      return `Similar romantic vibe`;
    }
    if (curTitle.includes('sad') || curTitle.includes('dard') || nextTitle.includes('sad')) {
      return `Emotional match`;
    }
    if (curTitle.includes('chill') || curTitle.includes('relax')) {
      return `Smooth chill transition`;
    }

    const titleShort = currentSong.title ? currentSong.title.split('(')[0].trim() : 'current track';
    return `Similar vibe to "${titleShort}"`;
  },

  
  updateNextUpBadge(currentSong, nextSong) {
    const badgeEl = document.getElementById('nextwave-reason-badge');
    if (!badgeEl) return;

    if (!nextSong) {
      badgeEl.classList.add('hidden');
      return;
    }

    const reason = this.getReason(currentSong, nextSong);
    badgeEl.textContent = reason;
    badgeEl.classList.remove('hidden');
  }
};
