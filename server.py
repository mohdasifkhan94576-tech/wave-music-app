from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse, RedirectResponse
from pydantic import BaseModel
from ytmusicapi import YTMusic
import yt_dlp
import uvicorn
import requests as req_lib
import time
import os
import json
import re
import tempfile
from dotenv import load_dotenv
load_dotenv()

# Cookie verification on import (runs under uvicorn too)
if os.path.exists("cookies.txt"):
    print("✅ [COOKIES] Found 'cookies.txt' in workspace! yt-dlp will use browser cookies.")
elif os.getenv("YT_COOKIES"):
    print("✅ [COOKIES] Found YT_COOKIES environment variable! yt-dlp will use environment cookies.")
else:
    print("⚠️  [WARNING] No 'cookies.txt' found in workspace, and YT_COOKIES is not set.")
    print("    YouTube streams may fail with 'Sign in to confirm you're not a bot'.")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Length", "Content-Range", "Accept-Ranges"],
)

yt = YTMusic()

stream_url_cache = {}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Wave YouTube Backend"}

def _format_yt_results(results):
    formatted = []
    for r in results:
        if 'videoId' not in r:
            continue
        
        video_id = r['videoId']
        
        img_url = ""
        thumbs = r.get('thumbnails') or r.get('thumbnail')
        if thumbs:
            if isinstance(thumbs, list) and len(thumbs) > 0:
                best = thumbs[-1]
                if isinstance(best, dict):
                    img_url = best.get('url', '')
                elif isinstance(best, str):
                    img_url = best
            elif isinstance(thumbs, str):
                img_url = thumbs
        
        if img_url:
            img_url_hq = re.sub(r'w\d+-h\d+', 'w500-h500', img_url)
        else:
            img_url_hq = img_url
        
        if not img_url:
            img_url = f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"
            img_url_hq = f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"

        artists = []
        for a in r.get('artists', []):
            if isinstance(a, dict):
                artists.append(a.get('name', ''))
            elif isinstance(a, str):
                artists.append(a)
        artist_str = ", ".join(artists) if artists else "Unknown"

        duration_secs = 0
        d = r.get('duration_seconds') or r.get('duration') or r.get('length')
        if isinstance(d, int):
            duration_secs = d
        elif isinstance(d, str) and ':' in d:
            parts = d.split(':')
            if len(parts) == 2:
                duration_secs = int(parts[0]) * 60 + int(parts[1])

        mins = duration_secs // 60
        secs = duration_secs % 60

        album_name = ''
        album = r.get('album')
        if isinstance(album, dict):
            album_name = album.get('name', '')
        elif isinstance(album, str):
            album_name = album

        formatted.append({
            "id": "yt_" + video_id,
            "videoId": video_id,
            "title": r.get('title', ''),
            "artist": artist_str,
            "album": album_name,
            "duration": f"{mins}:{secs:02d}",
            "secs": duration_secs,
            "img": img_url_hq,
            "thumb": img_url if img_url else img_url_hq,
            "audioUrl": "yt_stream_pending_" + video_id,
        })
    return formatted

@app.get("/search")
def search_songs(q: str, limit: int = 10):
    try:
        results = yt.search(q, filter="songs", limit=limit)
        return {"success": True, "data": _format_yt_results(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/trending")
def get_trending(limit: int = 10):
    try:
        results = yt.search("trending hits", filter="songs", limit=limit)
        return {"success": True, "data": _format_yt_results(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/home")
def get_home(limit: int = 10):
    try:
        results = yt.search("latest top songs", filter="songs", limit=limit)
        return {"success": True, "data": _format_yt_results(results)}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/related/{video_id}")
def get_related(video_id: str, limit: int = 10):
    try:
        playlist = yt.get_watch_playlist(videoId=video_id, limit=limit)
        tracks = playlist.get('tracks', [])
        return {"success": True, "data": _format_yt_results(tracks)}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ─── स्मार्ट एक्सट्रैक्शन एजेंट ───
_instance_health = {}
_HEALTH_COOLDOWN = 300  # फ़ेल होने वाले इंस्टेंस को 5 मिनट स्किप करें

# Correct Piped API instances (pipedapi. prefix important!)
PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.syncpundit.io",
    "https://pipedapi.adminforge.de",
    "https://pipedapi.r4fo.com",
    "https://pipedapi.us.projectsegfau.lt"
]

# Stable Invidious instances
INVIDIOUS_INSTANCES = [
    "https://tux.pizza",
    "https://fdn.fr",
    "https://nerdvpn.de",
    "https://yewtu.be",
    "https://melmac.space"
]


def _is_instance_healthy(url):
    if url not in _instance_health:
        return True
    last_fail = _instance_health[url]
    if time.time() - last_fail > _HEALTH_COOLDOWN:
        del _instance_health[url]
        return True
    return False


def _mark_instance_dead(url):
    _instance_health[url] = time.time()


def _mark_instance_alive(url):
    if url in _instance_health:
        del _instance_health[url]


def _extract_url_from_info(info):
    if not info:
        return None

    url = info.get('url')
    if url:
        return url

    formats = info.get('formats', [])
    audio_formats = [
        f for f in formats
        if f.get('url') and f.get('acodec') and f.get('acodec') != 'none'
    ]
    if audio_formats:
        def sort_key(f):
            abr = f.get('abr', 0) or 0
            tbr = f.get('tbr', 0) or 0
            return abr or tbr
        audio_formats.sort(key=sort_key, reverse=True)
        return audio_formats[0]['url']

    return None


def _try_ytdlp(video_id):
    """Layer 1: yt-dlp with socket_timeout for faster fallback"""
    base_ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'socket_timeout': 4,          # ← 4 sec timeout: jaldi fail ho, Piped par jaye
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                          'AppleWebKit/537.36 (KHTML, like Gecko) '
                          'Chrome/120.0.0.0 Safari/537.36'
        }
    }

    cookie_path = None
    cookie_content = os.getenv("YT_COOKIES")
    if cookie_content:
        cookie_path = os.path.join(tempfile.gettempdir(), "cookies.txt")
        with open(cookie_path, "w", encoding="utf-8") as f:
            f.write(cookie_content)
    elif os.path.exists("cookies.txt"):
        cookie_path = "cookies.txt"

    strategies = []

    if cookie_path:
        strategies.append({
            'cookiefile': cookie_path,
            'format': 'ba/bestaudio/best',
            'extractor_args': {'youtube': {'player_client': ['web', 'default']}}
        })
        strategies.append({
            'cookiefile': cookie_path,
            'format': 'ba/bestaudio/best',
            'extractor_args': {'youtube': {'player_client': ['ios', 'android']}}
        })
        strategies.append({
            'cookiefile': cookie_path,
            'format': 'best',
            'extractor_args': {'youtube': {'player_client': ['web']}}
        })
    else:
        strategies.extend([
            {'format': 'ba/bestaudio/best', 'extractor_args': {'youtube': {'player_client': ['web', 'default']}}},
            {'format': 'ba/bestaudio/best', 'extractor_args': {'youtube': {'player_client': ['ios', 'android']}}},
            {'format': 'ba/bestaudio/best', 'extractor_args': {'youtube': {'player_client': ['tv']}}},
            {'format': 'best', 'extractor_args': {'youtube': {'player_client': ['web']}}},
        ])

    for strategy in strategies:
        ydl_opts = base_ydl_opts.copy()
        ydl_opts.update(strategy)
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(
                    f"https://www.youtube.com/watch?v={video_id}", download=False
                )
                url = _extract_url_from_info(info)
                if url:
                    return url
        except Exception as e:
            print(f"[DEBUG] yt-dlp strategy failed: {e}")
            continue
    return None


def _try_piped(video_id):
    """Layer 2: Piped API — try all healthy instances"""
    headers = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

    for instance in PIPED_INSTANCES:
        if not _is_instance_healthy(instance):
            continue
        try:
            resp = req_lib.get(
                f"{instance}/streams/{video_id}",
                headers=headers, timeout=8
            )
            if resp.status_code != 200:
                _mark_instance_dead(instance)
                continue

            data = resp.json()
            audio_streams = data.get("audioStreams", [])
            if not audio_streams:
                _mark_instance_dead(instance)
                continue

            def sort_key(s):
                bitrate = s.get("bitrate", 0) or 0
                fmt = (s.get("format") or "").upper()
                fmt_score = 1 if fmt in ("M4A", "MP4A", "AAC") else 0
                return (fmt_score, bitrate)

            audio_streams.sort(key=sort_key, reverse=True)
            url = audio_streams[0].get("url", "")
            if url:
                _mark_instance_alive(instance)
                return url

        except Exception:
            _mark_instance_dead(instance)
            continue
    return None


def _try_invidious(video_id):
    """Layer 3: Invidious API — try all healthy instances"""
    headers = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}

    for instance in INVIDIOUS_INSTANCES:
        if not _is_instance_healthy(instance):
            continue
        try:
            resp = req_lib.get(
                f"{instance}/api/v1/videos/{video_id}",
                headers=headers, timeout=8
            )
            if resp.status_code != 200:
                _mark_instance_dead(instance)
                continue

            data = resp.json()
            adaptive = data.get("adaptiveFormats", [])
            audio_formats = [
                f for f in adaptive
                if "audio" in (f.get("type", "") or "").lower()
            ]

            if not audio_formats:
                _mark_instance_dead(instance)
                continue

            audio_formats.sort(
                key=lambda f: f.get("bitrate", 0) or 0, reverse=True
            )
            url = audio_formats[0].get("url", "")
            if url:
                _mark_instance_alive(instance)
                return url

        except Exception:
            _mark_instance_dead(instance)
            continue
    return None


def _extract_stream_url(video_id):
    """Smart Extraction Agent — 3-layer fallback system"""
    now = time.time()

    if video_id in stream_url_cache:
        cached = stream_url_cache[video_id]
        if now - cached['time'] < 1800:
            return cached['url']

    # Layer 1: yt-dlp
    print(f"[LOG] Trying Layer 1: yt-dlp for {video_id}...")
    url = _try_ytdlp(video_id)
    if url:
        stream_url_cache[video_id] = {'url': url, 'time': now}
        print(f"[LOG] Layer 1 success: yt-dlp ✅")
        return url

    # Layer 2: Piped API
    print(f"[LOG] Layer 1 failed. Moving to Layer 2: Piped API...")
    url = _try_piped(video_id)
    if url:
        stream_url_cache[video_id] = {'url': url, 'time': now}
        print(f"[LOG] Layer 2 success: Piped ✅")
        return url

    # Layer 3: Invidious API
    print(f"[LOG] Layer 2 failed. Moving to Layer 3: Invidious API...")
    url = _try_invidious(video_id)
    if url:
        stream_url_cache[video_id] = {'url': url, 'time': now}
        print(f"[LOG] Layer 3 success: Invidious ✅")
        return url

    raise Exception(
        "All extraction layers failed: yt-dlp, Piped, and Invidious. "
        "Please check your internet connection or try again later."
    )


@app.get("/stream/{video_id}")
def get_stream(video_id: str):
    try:
        url = _extract_stream_url(video_id)
        return {"success": True, "url": url}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/audio/{video_id}")
def audio_proxy(video_id: str, request: Request):
    from fastapi import HTTPException  # इसे टॉप पर भी रख सकते हैं
    try:
        audio_url = _extract_stream_url(video_id)
        if not audio_url:
            raise HTTPException(status_code=404, detail="Audio URL could not be extracted")
    except Exception as e:
        
        print(f"[ERROR] Extraction failed for {video_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    proxy_headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    range_header = request.headers.get('range')
    if range_header:
        proxy_headers['Range'] = range_header

    try:
        r = req_lib.get(audio_url, headers=proxy_headers, stream=True, timeout=15)
    except Exception as e:
        print(f"[ERROR] Proxy fetch failed: {str(e)}")
        raise HTTPException(status_code=502, detail="Failed to fetch audio stream from source")

    resp_headers = {
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
    }
    if 'Content-Length' in r.headers:
        resp_headers['Content-Length'] = r.headers['Content-Length']
    if 'Content-Range' in r.headers:
        resp_headers['Content-Range'] = r.headers['Content-Range']

    content_type = r.headers.get('Content-Type', 'audio/mp4')

    return StreamingResponse(
        r.iter_content(chunk_size=65536),
        status_code=r.status_code,
        headers=resp_headers,
        media_type=content_type,
    )


@app.get("/")
def serve_index():
    return FileResponse("index.html")

@app.get("/{filename}")
def serve_file(filename: str):
    allowed_files = {"app.js", "style.css", "youtube.js", "jiosaavn.js", "sw.js", "manifest.json"}
    if filename in allowed_files:
        return FileResponse(filename)
    return FileResponse("index.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"Starting Wave Music Backend Server on port {port}...")
    print("Endpoints: /, /health, /search, /stream/{id}, /audio/{id}")
    uvicorn.run(app, host="0.0.0.0", port=port)