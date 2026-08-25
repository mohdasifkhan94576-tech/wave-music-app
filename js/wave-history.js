'use strict';

 

const WAVE_HISTORY_KEY = 'wave_play_history_v1';
const WAVE_PLAY_COUNTS_KEY = 'wave_song_play_counts_v1';

window.WaveHistory = {
  
  getHistory() {
    try {
      const raw = localStorage.getItem(WAVE_HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('WaveHistory: Failed to read history', e);
      return [];
    }
  },

  
  getPlayCounts() {
    try {
      const raw = localStorage.getItem(WAVE_PLAY_COUNTS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('WaveHistory: Failed to read play counts', e);
      return {};
    }
  },

  
  logPlay(song) {
    if (!song || (!song.id && !song.title)) return;

    const songId = String(song.id || song.title);
    const now = new Date();
    const timestamp = now.getTime();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; 

    
    const titleLower = String(song.title || '').toLowerCase();
    const artistLower = String(song.artist || song.singers || '').toLowerCase();
    
    let mood = 'Chill';
    if (titleLower.includes('love') || titleLower.includes('dil') || titleLower.includes('ishq') || titleLower.includes('tum')) {
      mood = 'Love';
    } else if (titleLower.includes('sad') || titleLower.includes('dard') || titleLower.includes('ro') || titleLower.includes('lonely')) {
      mood = 'Sad';
    } else if (titleLower.includes('party') || titleLower.includes('dance') || titleLower.includes('rock') || titleLower.includes('beat')) {
      mood = 'Energy';
    } else if (now.getHours() >= 23 || now.getHours() < 5) {
      mood = 'Late Night';
    }

    const logEntry = {
      id: song.id || songId,
      songId: song.id || songId,
      title: song.title || 'Unknown Track',
      artist: song.artist || song.singers || 'Unknown Artist',
      img: song.img || song.thumb || song.image || '',
      thumb: song.thumb || song.img || song.image || '',
      audioUrl: song.audioUrl || song.url || song.media_url || '',
      url: song.audioUrl || song.url || song.media_url || '',
      media_url: song.media_url || song.audioUrl || song.url || '',
      duration: song.duration || '3:30',
      timestamp: timestamp,
      monthKey: monthKey,
      mood: mood,
      hourOfDay: now.getHours()
    };

    
    const history = this.getHistory();
    history.unshift(logEntry);
    if (history.length > 500) history.pop();

    if (typeof WaveDB !== 'undefined' && WaveDB.setUserData) {
      WaveDB.setUserData('historyLogs', history).catch(() => {});
    }

    try {
      localStorage.setItem(WAVE_HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
    } catch (e) {}

    
    const counts = this.getPlayCounts();
    if (!counts[songId]) {
      counts[songId] = {
        count: 0,
        song: logEntry,
        firstPlayed: timestamp,
        lastPlayed: timestamp
      };
    }
    counts[songId].count += 1;
    counts[songId].lastPlayed = timestamp;
    counts[songId].song = logEntry; 

    if (typeof WaveDB !== 'undefined' && WaveDB.setUserData) {
      WaveDB.setUserData('playCounts', counts).catch(() => {});
    }

    try {
      localStorage.setItem(WAVE_PLAY_COUNTS_KEY, JSON.stringify(counts));
    } catch (e) {}

    console.log(`[WaveHistory] Tracked play: "${logEntry.title}" by ${logEntry.artist} (Mood: ${mood})`);
  },

  
  getTopSongs(monthKey = null, limit = 10) {
    const history = this.getHistory();
    const filtered = monthKey ? history.filter(item => item.monthKey === monthKey) : history;

    const freqMap = {};
    filtered.forEach(item => {
      if (!freqMap[item.songId]) {
        freqMap[item.songId] = { song: item, count: 0 };
      }
      freqMap[item.songId].count += 1;
    });

    return Object.values(freqMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(entry => ({ ...entry.song, playCount: entry.count }));
  },

  
  getTopArtists(monthKey = null, limit = 5) {
    const history = this.getHistory();
    const filtered = monthKey ? history.filter(item => item.monthKey === monthKey) : history;

    const freqMap = {};
    filtered.forEach(item => {
      const artist = item.artist || 'Unknown';
      freqMap[artist] = (freqMap[artist] || 0) + 1;
    });

    return Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  },

  
  getMoodBreakdown(monthKey = null) {
    const history = this.getHistory();
    const filtered = monthKey ? history.filter(item => item.monthKey === monthKey) : history;

    if (filtered.length === 0) {
      return { Romantic: 80, Chill: 70, LateNight: 65, Emotional: 50, Energy: 30 };
    }

    const counts = { Romantic: 0, Chill: 0, LateNight: 0, Emotional: 0, Energy: 0 };
    filtered.forEach(item => {
      if (item.mood === 'Love') counts.Romantic++;
      else if (item.mood === 'Chill') counts.Chill++;
      else if (item.mood === 'Late Night') counts.LateNight++;
      else if (item.mood === 'Sad') counts.Emotional++;
      else if (item.mood === 'Energy') counts.Energy++;
    });

    const total = filtered.length;
    return {
      Romantic: Math.min(95, Math.max(20, Math.round((counts.Romantic / total) * 100) || 40)),
      Chill: Math.min(95, Math.max(20, Math.round((counts.Chill / total) * 100) || 60)),
      LateNight: Math.min(95, Math.max(20, Math.round((counts.LateNight / total) * 100) || 50)),
      Emotional: Math.min(95, Math.max(20, Math.round((counts.Emotional / total) * 100) || 35)),
      Energy: Math.min(95, Math.max(20, Math.round((counts.Energy / total) * 100) || 25))
    };
  }
};
