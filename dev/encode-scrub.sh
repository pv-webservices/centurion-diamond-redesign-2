#!/bin/bash
# Scrub-optimised encodes. Seek cost is dominated by distance-from-keyframe,
# so -g 4 (keyframe every 4 frames) is what makes scroll-scrubbing smooth.
# Costs file size; worth it — this video is seeked, not streamed.
ROOT="F:/Project/--US CLIENT--/Custom Websites/centurion-diamond-redesign-2"
SRC="$ROOT/assets/video/hero_video_for_scrolling.mp4"
OUT="$ROOT/assets/video"
enc () { # w crf name
  ffmpeg -y -v error -i "$SRC" -an -vf "scale=$1:-2" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf $2 -preset slow -g 4 -keyint_min 4 -sc_threshold 0 \
    -movflags +faststart "$OUT/$3-$1.mp4"
}
enc 1280 23 hero-scrub
enc  960 24 hero-scrub
enc  720 25 hero-scrub
ffmpeg -y -v error -ss 0 -i "$SRC" -frames:v 1 -vf scale=1280:-2 -q:v 82 "$OUT/hero-scrub-poster.webp"
echo SCRUB_DONE
