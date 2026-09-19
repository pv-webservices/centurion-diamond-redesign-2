#!/bin/bash
# Hero v2 ("rough to finished" film). Scrub-optimised encodes.
# Seek cost is dominated by distance-from-keyframe, so -g 4 (a keyframe every
# 4 frames) plus -bf 0 (no B-frames, so no frame depends on a later one) keeps
# every scroll position a short decode away.
# Source: the cleaned master (the corner watermark ghost from 2.5 s onward is
# already removed in it). The raw delivery is
# "assets/video/hero section 2nd final video.mp4".
ROOT="F:/Project/--US CLIENT--/Custom Websites/centurion-diamond-redesign-2"
SRC="$ROOT/dev/hero-video-refs/hero-v2-clean-master.mp4"
OUT="$ROOT/assets/video"
X264="-an -c:v libx264 -profile:v high -pix_fmt yuv420p -preset slow -g 4 -keyint_min 4 -sc_threshold 0 -bf 0 -movflags +faststart"

enc () { # width crf
  ffmpeg -y -v error -i "$SRC" -vf "scale=$1:-2:flags=lanczos" $X264 -crf $2 "$OUT/hero-scrub-$1.mp4"
}
enc 1280 25
enc  960 26
enc  720 27

# Phones: the 16:9 film framed as a band across a 9:16 canvas (cropped to the
# middle 72 % so the diamond cluster reads larger), over a blurred, darkened
# extension of itself with feathered edges. The page drops the media 8 % down
# the stage, which puts the stones between the top and bottom statements.
PORTRAIT="[0:v]split=2[a][b];[b]scale=-2:1280,crop=720:1280,gblur=sigma=34,colorchannelmixer=rr=.30:gg=.30:bb=.30[bg];[a]scale=1000:562:flags=lanczos,crop=720:562,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*min(1,min(Y,H-1-Y)/70)'[fg];[bg][fg]overlay=0:244,format=yuv420p"
ffmpeg -y -v error -i "$SRC" -filter_complex "$PORTRAIT" $X264 -crf 26 "$OUT/hero-scrub-portrait.mp4"

# Posters: the first frame of each master, so the page shows the film's own
# opening before a single byte of video has arrived.
ffmpeg -y -v error -i "$OUT/hero-scrub-1280.mp4" -frames:v 1 -q:v 82 "$OUT/hero-scrub-poster.webp"
ffmpeg -y -v error -i "$OUT/hero-scrub-portrait.mp4" -frames:v 1 -q:v 82 "$OUT/hero-scrub-portrait.webp"
echo HERO_V2_DONE
