# X/Twitter Media Download (Without API Auth)

When X/Twitter blocks direct access (login wall, "Nothing to see here"), use fxtwitter.com API to extract media URLs.

## Extract Video URL

```bash
curl -s "https://api.fxtwitter.com/i/status/<TWEET_ID>" | python3 -c "
import sys,json
d=json.loads(sys.stdin.read())
t=d.get('tweet',{})
print(f'Author: {t.get(\"author\",{}).get(\"screen_name\",\"?\")}')
print(f'Text: {t.get(\"text\",\"?\")[:100]}')
m=t.get('media',{})
for v in m.get('videos',m.get('all',[])):
    print(f'Video: {v.get(\"url\",v)}')
for p in m.get('photos',[]):
    print(f'Photo: {p.get(\"url\",p)}')
"
```

## Alternatives (if fxtwitter is down)

```bash
# vxtwitter
curl -s "https://api.vxtwitter.com/i/status/<TWEET_ID>"

# Direct Twitter CDN (if URL is known)
curl -L -o video.mp4 "https://video.twimg.com/amplify_video/..."
```

## Download the Media

```bash
curl -L -o output.mp4 "<VIDEO_URL_FROM_FXTWITTER>"
ls -lh output.mp4
```

## Notes

- fxtwitter returns clean JSON — no auth required, no rate limits
- Video URLs point to `video.twimg.com` CDN, valid for ~30 minutes
- Works for public tweets; private/deleted tweets return nothing
- Fallback: try `vxtwitter.com` or `twitframe.com` if fxtwitter is down
