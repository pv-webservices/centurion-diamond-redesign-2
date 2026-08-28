#!/bin/bash
# 04 · LIGHT STUDY — scrub-optimised encodes.
#
# The shipped light-*.mp4 files are long-GOP (one keyframe every ~94 frames),
# which is fine for playback and unusable for seeking: every scrub frame has
# to decode up to three seconds of video. Same fix as the hero — -g 4, at the
# cost of file size. This clip is seeked, not streamed.
ROOT="F:/Project/--US CLIENT--/Custom Websites/centurion-diamond-redesign-2"
SRC="F:/Z-Clients/US Clients/Centurion/generated videos/Video no-3.mp4"
OUT="$ROOT/assets/video"
enc () { # w crf
  ffmpeg -y -v error -i "$SRC" -an -vf "scale=$1:-2" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p \
    -crf $2 -preset slow -g 4 -keyint_min 4 -sc_threshold 0 \
    -movflags +faststart "$OUT/light-scrub-$1.mp4"
}
enc 1280 24
enc  960 25
enc  720 26
ffmpeg -y -v error -ss 4.2 -i "$SRC" -frames:v 1 -vf scale=1280:-2 -q:v 82 "$OUT/light-scrub-poster.webp"
echo STUDY_SCRUB_DONE
