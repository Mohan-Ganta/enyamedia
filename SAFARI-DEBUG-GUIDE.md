# Safari/iOS Video Loading Debug Guide

## Latest Fixes Applied

### 1. Aggressive Safari Loading Strategy
- **Load Timeout**: 8-second timeout with automatic retry (up to 3 attempts)
- **Force Reload**: Cache-busting with timestamp and reload counter
- **Preload Strategy**: Changed from "metadata" to "auto" for Safari
- **Manual Retry**: User can manually retry if stuck

### 2. Enhanced Event Handling
- Added `onProgress`, `onSuspend`, `onStalled` event handlers
- Improved `onCanPlay`, `onCanPlayThrough`, `onLoadedData` handling
- Automatic timeout clearing on successful load events

### 3. Streaming Endpoint Improvements
- Added HEAD request handler for Safari preflight checks
- Safari-specific headers: `Accept-Ranges: bytes`, `Connection: keep-alive`
- Forced `Content-Type: video/mp4` for MP4 files
- Cache-busting query parameters for Safari

### 4. Video Element Enhancements
```html
<video
  preload="auto"           // Changed from "metadata" for Safari
  playsInline
  webkit-playsinline="true"
  autoPlay={false}         // Explicit false
  muted={false}           // Explicit false
  controls={false}        // Explicit false
  key={`${src}-${reload}`} // Cache busting
>
```

## Debugging Steps for Safari Issues

### Step 1: Check Browser Console
Open Safari Developer Tools (Develop > Show Web Inspector) and look for:
```
Safari load timeout, attempt X
Safari video loading suspended
Safari video loading stalled
Safari codec issue detected, attempting reload...
Safari network error, retrying...
```

### Step 2: Network Tab Analysis
1. Check if `/api/videos/[id]/stream` request is made
2. Verify response status (should be 200 or 206 for range requests)
3. Check response headers:
   - `Content-Type: video/mp4`
   - `Accept-Ranges: bytes`
   - `Access-Control-Allow-Origin: *`

### Step 3: Video Element State
Check video element properties in console:
```javascript
const video = document.querySelector('video')
console.log({
  networkState: video.networkState,
  readyState: video.readyState,
  currentSrc: video.currentSrc,
  error: video.error,
  paused: video.paused,
  ended: video.ended
})
```

### Step 4: Manual Testing
1. Try the manual "Retry Loading" button if it appears
2. Test with different video files (H.264 MP4 works best)
3. Try on different iOS devices/Safari versions
4. Test on cellular vs WiFi

## Common Safari Issues & Solutions

### Issue 1: Infinite Loading
**Symptoms**: "Loading video..." never disappears
**Causes**: 
- Codec incompatibility (H.265/HEVC)
- Network timeout
- CORS issues
- Safari-specific streaming problems

**Solutions Applied**:
- 8-second timeout with auto-retry
- Cache-busting URLs
- Enhanced error handling
- Manual retry button

### Issue 2: Video Loads But Won't Play
**Symptoms**: Video appears loaded but play button doesn't work
**Causes**:
- Autoplay restrictions
- User interaction required
- Audio context issues

**Solutions Applied**:
- Explicit `autoPlay={false}`
- Enhanced touch event handling
- Proper play promise handling

### Issue 3: Range Request Issues
**Symptoms**: Video starts loading but stops partway
**Causes**:
- Server doesn't support range requests properly
- Safari expects specific headers

**Solutions Applied**:
- HEAD request handler
- Proper `Accept-Ranges: bytes` header
- Enhanced range request handling in streaming endpoint

## Testing Checklist

### Safari Desktop (macOS)
- [ ] Video loads within 8 seconds
- [ ] Manual retry button works if timeout occurs
- [ ] Quality selector functions properly
- [ ] Seek/scrub works smoothly
- [ ] Fullscreen mode works
- [ ] Volume controls work

### Safari Mobile (iOS)
- [ ] Video loads on cellular network
- [ ] Video loads on WiFi
- [ ] Touch controls work (play/pause, seek, volume)
- [ ] `playsInline` prevents fullscreen takeover
- [ ] Orientation changes don't break video
- [ ] Background/foreground switching works

### Network Conditions
- [ ] Fast WiFi (>10 Mbps)
- [ ] Slow WiFi (1-5 Mbps)
- [ ] Cellular 4G/5G
- [ ] Cellular 3G (slow)

## Video Format Recommendations

### Best Compatibility
```
Container: MP4
Video Codec: H.264 (AVC)
Audio Codec: AAC
Resolution: 1080p or lower
Bitrate: 2-5 Mbps
```

### Avoid These Formats
```
Video Codec: H.265/HEVC (limited Safari support)
Container: WebM (not supported in Safari)
Audio Codec: Opus (limited support)
```

## Advanced Debugging

### Enable Safari Debug Menu
1. Safari > Preferences > Advanced
2. Check "Show Develop menu in menu bar"
3. Develop > Show Web Inspector

### iOS Safari Remote Debugging
1. iOS Settings > Safari > Advanced > Web Inspector (ON)
2. Connect iOS device to Mac
3. Safari > Develop > [Device Name] > [Page]

### Video Element Events to Monitor
```javascript
const video = document.querySelector('video')
const events = [
  'loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 
  'canplaythrough', 'play', 'playing', 'pause', 'ended',
  'waiting', 'seeking', 'seeked', 'stalled', 'suspend',
  'abort', 'error', 'emptied', 'progress'
]

events.forEach(event => {
  video.addEventListener(event, () => {
    console.log(`Video event: ${event}`, {
      currentTime: video.currentTime,
      duration: video.duration,
      networkState: video.networkState,
      readyState: video.readyState
    })
  })
})
```

## Next Steps if Issues Persist

1. **Server-Side Transcoding**: Convert all videos to H.264 MP4
2. **HLS Streaming**: Implement HTTP Live Streaming for better iOS support
3. **CDN Integration**: Use CloudFront or similar for better global delivery
4. **Progressive Download**: Implement progressive MP4 download
5. **Fallback Player**: Consider using a third-party player like Video.js with Safari-specific plugins