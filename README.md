# Centurion Diamond — Homepage

Scroll-driven luxury homepage for the Centurion Diamond collection.
**"100 Facets of Brilliance / More facets, more brilliance."**

Static HTML/CSS/JS — no build step. Deploys to any static host (Hostinger, Netlify, S3),
and converts cleanly to WordPress/Elementor later.

---

## Run it

```bash
npx -y serve -l 4321 .
```

Then open <http://localhost:4321>. Nothing is compiled — open `index.html` through a
server (not `file://`, or the video sources and fonts will be blocked).

---

## Design system

| | |
|---|---|
| **Display type** | Bodoni Moda — high-contrast Didone, luxury-editorial voice |
| **UI / body type** | Jost — geometric sans that matches the CENTURION wordmark |
| **Ground** | `#0A0A0B` near-black, with one inverted "light zone" for the collection |
| **Brand accent** | `#CC9C9C` blush rose (sampled from the logo) |
| **Secondary** | `#A9AECF` periwinkle (the retail display colour named in the deck) |

Tokens live at the top of `assets/css/base.css`. Change the palette there and the whole
page follows — the light Collection section inverts automatically via `.zone-light`.

---

## Page storyline

The page is built as an argument, not a brochure — each section advances one claim.

| # | Section | Job |
|---|---|---|
| 00 | Preloader | Counts 0→100 — the brand's whole story in one number |
| 01 | **Hero — cinematic scroll stage** | Pinned 320vh. Video scrubs with scroll; four statements alternate L/R; stone-only finale |
| 02 | **The Sparkle** | Pinned 330vh. Dark→light passage, then the 100 vs 57 comparison |
| 03 | **Anatomy of Brilliance** | Pinned 400vh. The four benefits, one owning the viewport at a time, closing on an aperture into the Light Study |
| 04 | **A Study in Light** | Pinned 360vh. An aperture opens the light-study film out of the dark, makes room for the type, and closes it back into the beam that hands off to the marquee |
| 05 | Marquee | Oversized horizontal type |
| 06 | **The Collection** | Pinned 480vh light zone. The aperture reopens onto a horizontal gallery of all 9 SKUs |
| 07 | Worn | Alternating editorial spreads |
| 08 | Metals | Platinum / 14K Yellow / Two Tone |
| 09 | Display | The periwinkle retail case |
| 10 | Exclusivity | Patent-pending, unshoppable — the retailer argument |
| 11 | CTA | centuriondiamond.com |

---

## Header & hero

**Header** is transparent over the film — logo left, nav centre, `Inquire Now` right,
no opaque container. It dims and lifts with hero progress (`--hdr-dim` / `--hdr-y`)
rather than restyling into a solid navbar. Under 1000px the nav collapses to a burger
that opens the full-screen sheet.

**Hero** is a 320vh scroll track with a pinned stage inside it. One master progress
value from a single ScrollTrigger feeds four independent timelines — video, narrative,
header, progress — which is what keeps the scrub and the typography exactly in step.

Four editorial statements alternate left → right → left → right while the film scrubs
underneath, then all typography clears for the closing frame so the stone owns the
screen with one restrained CTA.

```
assets/js/hero/
  scenes.js      narrative content + progress windows (data-driven)
  video.js       scroll-scrubbed video timeline
  narrative.js   statement choreography
  header.js      header timeline
  progress.js    progress rule + scroll hint
  index.js       orchestrator — owns the single ScrollTrigger
```

Tune the choreography in `scenes.js` (`inA/inB/outA/outB` in 0..1 progress space).
Nothing else needs touching to re-time or re-word the hero.

### Scrubbing

Seek cost is dominated by distance from a keyframe, so the hero clip is re-encoded
with a **4-frame GOP** (`dev/encode-scrub.sh`). The supplied master had no keyframes
past the first, which makes scrubbing unusable. On top of that the engine:

- never queues a seek while the decoder is still `seeking`
- damps the target so a fast flick cannot pile up seeks
- runs on GSAP's ticker, not on raw scroll events
- primes the video (muted play→pause) on first interaction, so iOS paints

**Mobile gets a dedicated portrait master.** Cropping the 16:9 master to 9:16 shows
only ~26% of its width — a slice of the stone. Instead the full composition is
composited into a 720×1280 canvas over a blurred, darkened self-extension with a
feathered edge, so it reads full-bleed while the framing survives.

## The Sparkle section

The deliberate reset after the dark hero. A 330vh track with a pinned stage; one
master progress value drives five timelines — transition, intro, facet reveal,
comparison, outro.

The stage's background ramps `#0A0A0B → #151515 → charcoal → silver → #F3F1EE`
while a blurred light bar sweeps across, so it reads as passing *through* the light
the diamond refracts. It starts on the hero's exact ink value, so there is no seam.

The comparison uses the deck's own cut diagrams (each is half photograph, half
technical wireframe), keyed off their white paper to alpha. **`mix-blend-mode:
multiply` cannot be used here** — the animated `transform`/`filter` on each figure
creates a stacking context that isolates it from the page backdrop. Around each
diagram an SVG rail draws one tick per facet: 100 against 57, which is the claim
made visible. The numbers count up as their ticks draw.

Copy is the deck's own; no invented performance statistics.

Content and timing live in `assets/js/sparkle/scenes.js` — beat windows in 0..1
progress space, plus the background stops. Retiming needs nothing else.

**This section supersedes the old Manifesto and Proof sections**, which told the
same 57-vs-100 story and carried this same headline. Both were removed rather than
left to duplicate it; the `#cut` anchor moved here so the header nav still resolves.

On mobile the pair stacks vertically and the gather/split runs on Y instead of X,
so each cut still reads large rather than shrinking to a pair of thumbnails.

### 03 · Anatomy of Brilliance

A pinned 400vh editorial chapter answering the question the Sparkle section leaves
open: beyond 100 facets, why does it matter? One benefit owns the viewport at a
time — never a card grid, never four things on screen at once.

It opens on **exactly the tone the Sparkle section closes on** (`rgb(236,233,228)`),
so the two share one continuous light rather than dropping back to the hero's ink.
That is the only edit the Sparkle section needed: its `.spk__handoff` gradient now
resolves to that ivory instead of `--ink`.

Each benefit gets its own reveal and its own composition — `rise` / `clip` /
`slide` / `scale`, and left / right / left / centred — so the chapter never settles
into a rhythm. A single Centurion stone (the alpha-keyed ring shot) recomposes
between them, driven by a keyframe list rather than per-scene code. Its internal
light sweep is a bar masked to the stone's own silhouette, so the highlight travels
across the facets rather than across a rectangle.

The handoff into the Light Study is an **aperture**, not a page fade: a circle
scaled inside an SVG mask cuts a shrinking hole out of a covering ink rect, with a
light beam crossing the stone as it closes. (A very large `box-shadow` spread does
the same thing more cheaply in principle, but tiles into rectangles once scaled up.)
The last frame is pure `--ink`, which is the Light Study's own ground — no seam.

Content lives in `index.html` so the chapter still reads with scripting off;
choreography lives in `assets/js/pillars/scenes.js` (beat windows and stone
keyframes in 0..1 progress space). `timeline.js` is pure maths — progress in, a
frame description out — and `visual.js` is the only thing that touches the DOM.

Mobile drops the left/right composition for a centred column: type above, stone
below, one benefit at a time. Reduced motion drops the pin entirely and renders the
chapter as an ordinary bright editorial run, stone included, in document order.

### 06 · The Collection

A pinned 480vh light zone between two dark sections. It opens through the same
SVG-mask aperture that closes Anatomy of Brilliance, run in reverse: the Marquee
above ends on the page's ink, a circle of light widens out of it, and the first
stone is already standing in the middle of it as the room fills.

Vertical scroll drives travel along a horizontal rail of eleven plates — the nine
SKUs and two lifestyle interludes. The active piece takes the centre at full
scale; its neighbours sit smaller, lower, tilted and clipped by the viewport
edges. A lifestyle plate is wider than the rail's pitch, so it overlaps the
stones either side while it holds the centre, and it recedes on a steeper curve
than a ring does — a full-colour photograph holds the eye far harder than a ring
on ivory.

**Every ring photograph ships on white.** They are dropped onto the page with
`mix-blend-mode: multiply`, but each slot carries its own animated transform,
which isolates it from the page backdrop. So every plate paints the stage's own
colour behind its ring, published by the renderer as `--ground`. That is also
what makes the handoff work: as the ground darkens into the Worn section, the
rings dissolve into it rather than sitting on it.

Halfway along, the rail holds still and the frame is taken by *Every centre stone
is a 100-facet Centurion Diamond.* The hold and the statement are derived from
the same numbers, so they can never drift apart. The material families arrive in
the second half as editorial selectors, not filters: choosing one dims what does
not belong to it, travels to the nearest piece in that family, and shows how many
pieces it actually holds — counts read from the markup, so they can never
disagree with the catalogue. Nothing implies anything about availability.

Product data lives in `index.html` — references, shapes, carats, metals and
setting weights, straight from the deck. Choreography is in
`assets/js/collection/scenes.js`. Narrow viewports drop the rail for a vertical
column, one piece at a time, each plate on its own scrubbed trigger; reduced
motion and no-JS render the whole catalogue in document flow.

### 04 · A Study in Light

A pinned 360vh optical study between two dark sections. Anatomy of Brilliance
seals its aperture to `--ink`; this stage opens on `--ink` with an aperture of
its own already shut, so the two share a frame rather than a fade.

The section is built around one idea: **the aperture is the whole mechanism.**
Four ink shutters over a full-bleed clip do all of the work —

- they open the film out of the dark, starting as the thin light line the
  chapter's title reads against;
- they make room for the type. The copy always sits in the band a shutter has
  closed, and the film re-centres itself on whatever is left open, so the stone
  stays whole and is never behind a word;
- they close the film back into a single line, which drops to the foot of the
  stage and streaks left — the direction the marquee below is already
  travelling. The marquee's own top rule picks it up. The marquee is untouched.

The shutters `scale`, which is cheap; their inner hairline is a separate
un-scaled element positioned in pixels, so 1px stays 1px at any opening. The
two hairlines meet in the middle when the aperture shuts, and that meeting *is*
the handoff.

Because the film follows the aperture, its scale is derived rather than
authored: each frame is fitted to **cover the open window**, and the `s` value
in the keyframes is headroom on top of that fit (1.00 exact, above it crops in
for presence). Narrowing the aperture for a headline therefore brings the stone
with it instead of cropping to whatever happens to fall inside.

Copy alternates left → right → left → centred → right. For the centred beat the
letterbox deepens so **100** and **Facets** bracket the stone from the ink above
and below it rather than sitting on top of it. Optical traces — a measurement
rule, facet ticks, an observation reticle, a few light points — share the clip's
own 16:9 box, so a trace sits *on* the stone; each holds for one short beat, and
none of them states a measurement.

```
assets/js/study/
  scenes.js    copy timing, aperture keyframes, scroll→playhead map
  timeline.js  pure maths — progress in, a frame description out
  visual.js    the only thing that touches the DOM
  video.js     the scrub engine (its own instance, not the hero's)
  index.js     orchestrator — owns the single ScrollTrigger
```

**Scrubbing.** The clip is seeked, never played, so that scrolling *is* the
observation. That needs keyframes: the shipped `light-*.mp4` files carry one
every ~94 frames, which costs up to three seconds of decode per seek.
`dev/encode-study.sh` re-encodes the master at `-g 4` into `light-scrub-*`, the
same fix the hero needed. At 1280 the scrub master is *smaller* than the
long-GOP 1920 it replaces, so the section costs the page nothing — and nothing
is fetched until the section is a viewport and a half away, so it never
competes with the hero's master for the first paint.

`main.js` no longer autoplays a video marked `data-manual`; an `IntersectionObserver`
calling `play()` would otherwise fight the scrub engine for the playhead.

Narrow, tall viewports letterbox the clip instead of cropping it — the stone
spans nearly the whole width of a 16:9 frame, so a portrait cover-crop shows
its middle third and nothing else. Mobile drops the side shutters for a centred
column: type above the band of light, supporting line below. Reduced motion and
no-JS drop the pin and render the chapter as an ordinary dark editorial run,
the clip parked on one representative frame, every line in document order.

## Motion

GSAP 3.15 + ScrollTrigger + Lenis smooth scroll, all vendored into
`assets/js/vendor/` — no CDN, no network dependency.

`assets/js/main.js` covers the remaining sections: preloader, cursor, scroll reveals,
marquee, image parallax, stat counters, video play-in-view and the header menu. The
hero, the Sparkle section, Anatomy of Brilliance, A Study in Light and the Collection
each own their own modules.

Reveals are declarative — add `data-anim="up|fade|left|right|scale|clip"` to any
element and it animates in on scroll, with siblings staggering automatically.

**`prefers-reduced-motion` is fully honoured**: smooth scroll, the preloader,
parallax and all scrubbed animation switch off, and content renders in its final state.

---

## Assets

All imagery was extracted from `CENTURION.pdf` (a flattened image-only deck) and
re-processed: cropped, background-levelled to true white, and exported as responsive
WebP at 3 widths each. Ring shots sit on light plinths and use `mix-blend-mode: multiply`,
which drops their white studio ground onto the plinth without any cut-out artefacts.

Videos are encoded to MP4 (H.264) + WebM (VP9) at 720 / 1280 / 1920, served by
`media` queries, with WebP posters. They only play while in view.

The hero film is the supplied `hero_video_for_scrolling.mp4` (1280×720, 10s), re-encoded
for scrubbing at 1280 / 960 / 720 plus a portrait master. The beam clip drives
A Study in Light and is re-encoded the same way, to `light-scrub-*` (the
long-GOP `light-*.mp4` / `.webm` files it supersedes are still in the tree but
no longer referenced by the page); an earlier Magnific-generated stone clip is kept at
`dev/stone-master.mp4` and the faceted still at `assets/img/brand/facet-bg-*` — both
unused by the current hero but retained for reuse.

**Fonts are self-hosted** (`assets/fonts/`, latin + latin-ext only). The page makes
**zero third-party requests** — no Google Fonts, no CDN.

**Page weight:** the hero film dominates and must fully buffer to be seekable —
~1.9 MB portrait / ~4.8 MB at 1280. That is the deliberate cost of a tight GOP; a
long-GOP file is a third the size and scrubs badly. Everything else on the page is
~0.7 MB.

On a warm cache the page paints in ~500 ms. A cold load against the `serve` dev server
measures far slower (~2.7 s), but that is the dev server itself — it costs ~80 ms per
request across 19 files. Any real host with HTTP/2 and compression will not show this;
worth re-measuring on staging rather than trusting the local number.

To re-encode: `dev/encode-scrub.sh` (hero scrub masters), `dev/encode-study.sh`
(the light-study scrub masters), `dev/encode.sh` and `dev/encode2.sh` (the
section videos).

---

## Project layout

```
index.html              the whole page
assets/css/base.css     tokens, reset, type scale
assets/css/sections.css components & sections
assets/js/main.js       motion system (everything below the hero)
assets/js/hero/         the cinematic hero, one module per timeline
assets/js/sparkle/      the dark-to-light comparison section
assets/js/pillars/      Anatomy of Brilliance
assets/js/study/        A Study in Light
assets/js/collection/   the gallery
assets/js/vendor/       gsap, ScrollTrigger, SplitText, lenis
assets/fonts/           self-hosted Bodoni Moda + Jost (woff2)
assets/img/{model,ring,brand}/   responsive WebP
assets/video/           mp4 + webm + posters
dev/                    screenshot / perf / encode tooling (not shipped)
```

`node_modules` is **not** required to run the site — GSAP and Lenis are vendored.
It only exists for the tooling in `dev/`.

---

## Content source

Copy and specs come from the client deck (`CENTURION.pdf`). All 9 SKUs carry their
real reference, centre stone, carat weight, metal and setting CTW.

Two notes for review:

- The deck is written for **retailers** ("increase your ticket size", "exclusive to
  you"). That argument is kept, but moved late — into section 11 — so the page opens
  as a consumer brand story and closes with the trade case. Worth confirming which
  audience the live site is really for.
- Section 11's stat reads "9 — settings in the debut collection", counted from the
  deck. Update if the range is larger.
