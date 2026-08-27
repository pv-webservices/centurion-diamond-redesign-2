#!/bin/bash
SRC="F:/Z-Clients/US Clients/Centurion/generated videos"
OUT="F:/Project/--US CLIENT--/Custom Websites/centurion-diamond-redesign-2/assets/video"
enc () { # $1=src $2=name $3=width $4=crf
  ffmpeg -y -v error -i "$1" -an -vf "scale=$3:-2" -c:v libx264 -profile:v main -pix_fmt yuv420p \
    -crf $4 -preset slow -movflags +faststart "$OUT/$2-$3.mp4"
}
encwebm () {
  ffmpeg -y -v error -i "$1" -an -vf "scale=$3:-2" -c:v libvpx-vp9 -crf $4 -b:v 0 -row-mt 1 -speed 2 "$OUT/$2-$3.webm"
}
# hero = rainbow dispersion diamond (video 2)
enc "$SRC/Video no-2.mp4" hero 1920 28
enc "$SRC/Video no-2.mp4" hero 1280 30
enc "$SRC/Video no-2.mp4" hero 720  32
encwebm "$SRC/Video no-2.mp4" hero 1920 36
encwebm "$SRC/Video no-2.mp4" hero 720 40
# light study = beam diamond (video 3)
enc "$SRC/Video no-3.mp4" light 1920 28
enc "$SRC/Video no-3.mp4" light 1280 30
enc "$SRC/Video no-3.mp4" light 720  32
encwebm "$SRC/Video no-3.mp4" light 1920 36
# ring detail (video 1, source is 720p)
enc "$SRC/Video no-1.mp4" ring 1280 28
enc "$SRC/Video no-1.mp4" ring 720 31
# posters
ffmpeg -y -v error -ss 2.5 -i "$SRC/Video no-2.mp4" -frames:v 1 -vf "scale=1920:-2" -q:v 80 "$OUT/hero-poster.webp"
ffmpeg -y -v error -ss 2.0 -i "$SRC/Video no-3.mp4" -frames:v 1 -vf "scale=1920:-2" -q:v 80 "$OUT/light-poster.webp"
ffmpeg -y -v error -ss 3.0 -i "$SRC/Video no-1.mp4" -frames:v 1 -vf "scale=1280:-2" -q:v 80 "$OUT/ring-poster.webp"
echo "ENCODE_DONE"
