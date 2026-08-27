#!/bin/bash
ROOT="F:/Project/--US CLIENT--/Custom Websites/centurion-diamond-redesign-2"
OUT="$ROOT/assets/video"
STONE="$ROOT/dev/stone-master.mp4"                       # Magnific-generated hero
FIRE="F:/Z-Clients/US Clients/Centurion/generated videos/Video no-2.mp4"  # rainbow dispersion
mp4 () { ffmpeg -y -v error -i "$1" -an -vf "scale=$3:-2" -c:v libx264 -profile:v main -pix_fmt yuv420p -crf $4 -preset slow -movflags +faststart "$OUT/$2-$3.mp4"; }
wbm () { ffmpeg -y -v error -i "$1" -an -vf "scale=$3:-2" -c:v libvpx-vp9 -crf $4 -b:v 0 -row-mt 1 -speed 2 "$OUT/$2-$3.webm"; }
for s in "1920 30 40" "1280 32 42" "720 34 46"; do set -- $s; mp4 "$STONE" stone $1 $2; wbm "$STONE" stone $1 $3; done
ffmpeg -y -v error -ss 3.4 -i "$STONE" -frames:v 1 -vf scale=1920:-2 -q:v 82 "$OUT/stone-poster.webp"
echo STONE_DONE
