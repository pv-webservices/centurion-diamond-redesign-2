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
| **Brand light** | controlled blush-rose reflection derived from `--brand-blush` |

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
| 07 | **Worn** | Pinned 340vh. The photographs arrive in monochrome and find their colour, then gather into a spread |
| 08 | **Metals** | Pinned 400vh. The ground becomes the metal; the gold panel retreats so Two Tone stands on the seam |
| 09 | **Display** | Pinned 360vh. The retail preview — blush rose arriving as reflected light |
| 10 | **Exclusivity** | Pinned 340vh. The retailer argument as a ledger. No photography at all |
| 11 | **Retail finale** | All 9 Collection rings converge into the case before the Contact invitation |

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

That master carries its picture in roughly the top 21–53% of its canvas. Dropped
8% down the stage on mobile (`.chero__media{ top:8% }`), the band lands at
29–61% — which opens a type zone above it as well as below, so the four
statements can alternate **top-left / bottom-right / top-left / bottom-right**
without ever crossing the facets. The entrance travels on that axis too, not the
desktop's lateral one. Each master also preloads only where it is used, so a
phone never pays for the landscape poster.

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

Mobile keeps the pin, the recomposing stone and the one-benefit-at-a-time frame —
it turns the composition through 90 degrees rather than flattening it. The copy
takes one corner and the stone the opposite one, swapping between benefits
(upper-left/lower-right → upper-right/lower-left → lower-left/upper-right →
centred, with the stone ghosted behind). The stone runs its own pose track
(`CD.pillars.mobileStone`) on the same `p` markers as the desktop one, so the
sheen still fires on the same legs. 420vh at a phone's viewport is the same
scroll distance as 400vh at a desktop's. Reduced motion drops the pin entirely
and renders the chapter as an ordinary bright editorial run, stone included, in
document order.

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
`assets/js/collection/scenes.js`. Narrow viewports keep the rail — the same
pinned stage, the same vertical-scroll-to-horizontal-travel, the same beats — on
their own falloff (`mobileRail`): one piece at ~76vw with a slice of its
neighbour at each edge, and the plate exclusive to whichever piece actually holds
the frame. The lifestyle interludes become 70vh portrait plates with their
caption on the frame rather than under it, because that is where the controls
live. Only a phone held sideways falls back to the column (`stackAt`), which has
no vertical room for a piece, its plate and the controls at once; reduced motion
and no-JS render the whole catalogue in document flow.

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

### 07 · Worn

A pinned 340vh chapter between two ink sections — the Collection above ramps its
ground to `--ink`, the Metals chapter below opens on it, so this one just holds it.

Its idea: **the photographs arrive in the page's own monochrome and find their
colour as the chapter goes**, then gather into a spread of every moment it has
shown. One `filter` on `.wrn__film` takes all six plates from grey to full
colour together, so it reads as one idea rather than six.

The colour arrives in the pictures, not in the room. The supplied photography is
bright studio work; there is no candlelight or window light in any of it, so
tinting the ground to match the section's copy would have been inventing
something the imagery does not contain.

A plate is present for its own moment and for the gather, and for nothing in
between. Leaving them resting behind the copy was the obvious idea and the wrong
one — a red plate at 30% still fights a paragraph. They keep travelling toward
their `home` pose as they fade, so a slow scroll still shows them settling into
the place the gather finds them.

Mobile runs the chapter as a **sequence rather than a contact sheet**: the same
six photographs get six moments instead of one crowded one, each owning the frame
in turn, cropped to portrait by the `--mar` / `--mpos` pair stated on its own
`<figure>`. The copy rides in the space two of them are composed to leave — low
under the second, high over the fourth — and the closing statement plays over the
last, which is full-bleed and never leaves. Each plate has one entrance of its
own (clip up, slide, scale, slide back, clip down, slow push) so six in a row
read as a film and not as six fades. 440vh; choreography in `CD.worn.mobile`.
The desktop spread is kept for the desktop: six 12vw plates on a 390px screen are
47px wide.

### 08 · Metals

A pinned 400vh chapter where **the ground becomes the metal**. Two full-bleed
panels wipe across on a shared diagonal — platinum, then yellow gold over it.
They are laid out 200vw wide and translated rather than clipped: a `clip-path`
is not compositor work, and these are full-bleed layers moving every frame.

For the third beat the gold panel simply **retreats** instead of a third panel
arriving, so the two metals end up side by side with the two-tone ring standing
on the seam. That is the deck's claim made visible: three settings, only ever
two metals — which is also why *"Two metals. One standard."* is left alone. It
reads like a contradiction next to three cards, and stops reading like one the
moment Two Tone is shown to *be* the two.

The metal is lit, not flooded: a static veil holds it where bone type stays
legible on every part of both gradients, so nothing in the chapter has to change
colour. Rings are the alpha-keyed `-cut` variants, which is what lets them stand
on the metal instead of on white.

### 09 · Display

The page's controlled chromatic room. Metals above drains to ink and Exclusivity
below opens on it, so the chapter can introduce the brand blush as reflected light
without either seam having to negotiate a colour.

Its idea is that **the colour arrives as light**: a blush-rose source rises
behind the case, spreads to fill the room, and falls away. What the walls hold is
only ever what the light leaves there — deliberately not another ground ramp,
since the Sparkle section already ramps one and Metals already wipes one.

The light colour is read from `--brand-blush-rgb` at mount, so official Pantone-
derived values remain a single-token change. The copy is intentionally colour-
neutral until final client wording is approved.

Mobile composes the same room for a portrait frame: the case large enough to be
looked at (95vw) and alternating with the copy — high with the copy under it,
then low with the copy over it — before the two cases come together, stepped,
for the closing frame. Each case opens under a mask and carries a slow push
inside its own frame (1.06 → 1.00, closing in for the pair). `CD.display.mobile`.

### 10 · Exclusivity

The trade argument, and the only chapter on the page with **no photography in it
at all** — stark type after three image-led chapters, which is the tonal shift
the page needs before the CTA.

Three figures arrive one row at a time and *stay*, each with its own rule drawing
under it, while the case for stocking builds beside them. Rows accumulate rather
than replacing one another, which is the whole point of a ledger: by the end the
argument is on the page in one piece. Nothing counts up — the Sparkle section
already owns that gesture.

The block is shifted by half a row for every row still to come, so the revealed
rows stay optically centred instead of the stack growing downward from a fixed
top. On a phone the ledger clears as the first claim arrives: there is no room
for three ruled rows and a claim at once, and the ledger has made its point by
then.

The closing button is the one control on any of these pinned stages that has to
stay pressable, so its layer takes pointer events back as it arrives — and the
last frame does not fade, because the button has to still be there to be pressed.

## Motion

GSAP 3.15 + ScrollTrigger + Lenis smooth scroll, all vendored into
`assets/js/vendor/` — no CDN, no network dependency.

`assets/js/main.js` covers the remaining sections: preloader, cursor, scroll reveals,
marquee, image parallax, stat counters, video play-in-view and the header menu. The
the hero, the Sparkle section, Anatomy of Brilliance, A Study in Light, the
Collection, Worn, Metals, Display and Exclusivity each own their own module —
nine chapters, all the same shape: `scenes.js` (timing), `timeline.js` (pure
maths), `visual.js` (the only thing that touches the DOM), `index.js` (one
ScrollTrigger). `main.js` keeps the preloader, cursor, marquee, reveals and
header menu.

Reveals are declarative — add `data-anim="up|fade|left|right|scale|clip"` to any
element and it animates in on scroll, with siblings staggering automatically.

**`prefers-reduced-motion` is fully honoured**: smooth scroll, the preloader,
parallax and all scrubbed animation switch off, and content renders in its final state.

---

## Mobile

Mobile is a **composition of the same chapters, not a smaller copy of them**. The
desktop build is the approved master and nothing here may move it: every mobile
rule lives inside a `@media (max-width:900px)` block (`860px` for the hero, which
is the breakpoint that module already used) or inside a `narrow` branch in a
module's `timeline.js`. Where a chapter needed different geometry it got its own
data — `CD.pillars.mobileStone`, `CD.collection.mobileRail`, `CD.worn.mobile`,
`CD.display.mobile` — sitting beside the desktop data in the same `scenes.js`,
on the same progress markers. No second scrolling system, no second animation
library, one Lenis and one ScrollTrigger as before.

Two chapters changed shape rather than scale:

- **The Collection keeps its horizontal rail.** It used to become a vertical
  column on every phone, which told a different story from the desktop. Now
  vertical scroll still travels the gallery sideways; only the falloff differs.
- **Worn becomes a sequence.** Six photographs, six moments, one owning the frame
  at a time — instead of the desktop contact sheet shrunk to thumbnails.

Portrait crops are stated next to the photograph they belong to, as `--mar`
(mobile aspect ratio) and `--mpos` (object-position) on the `<figure>`. Desktop
CSS never reads either, so the framing decision lives with the image without
touching the approved layout. `sizes` on those images describes the mobile
render too, so a phone does not fetch a 34vw source for a 100vw plate.

Each chapter also has a **landscape-phone** branch. Corner-to-corner and
top/bottom compositions need vertical room a rotated phone does not have, so
under `(orientation:landscape) and (max-height:520px)` the hero and Anatomy go
back to sharing the frame and the Collection falls back to its column. That
composition is chosen once at load; a phone rotated afterwards keeps the one it
started in, and the CSS is scoped to follow the class JS actually set
(`.coll:not(.is-stacked)`) so the two can never disagree.

Safe-area insets (`env(safe-area-inset-*)`) are respected on the header, the menu
sheet, and every element that sits against the top or bottom of a pinned stage.

A phone downloads **2.2MB** on first load against the desktop's 5.1MB — the
portrait hero master is 2.0MB where the 1280 master is 5.0MB, and each poster now
preloads only where it is used. 26 of 27 images are `loading="lazy"` +
`decoding="async"` with `srcset`/`sizes`.

### Checking it

```
node dev/mobaudit.js       # 6 device sizes: overflow, off-frame copy, header
                           # collisions, wrapped CTAs, empty frames, JS errors
node dev/rotate.js         # portrait <-> landscape without a reload
node dev/rmcheck2.js       # reduced motion; NOJS=1 for scripting off
node dev/perfmob.js        # what a phone downloads vs a desktop
node dev/fingerprint.js    # the desktop regression guard — see the file header
```

`fingerprint.js` + `fpdiff.js` are the reason the desktop can be trusted: they
dump the geometry and key computed styles of every node in the five scroll
chapters at 42 scroll positions and diff two runs. Pixel diffs are useless here
because the hero's scrub position is not reproducible run to run. The mobile work
lands at **0 differing rows** at 1440×900 and 1280×720, and 1–3 rows at 1920×1080
and 1366×768 — all inside `HEADER.hdr`, whose dim is a CSS transition a capture
can catch mid-flight, and which is the same noise two runs of an unmodified tree
produce.

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
assets/js/worn/         the diamond, in life
assets/js/metals/       the ground becomes the metal
assets/js/display/      the blush-lit retail preview
assets/js/finale/       nine-ring jewelry-case conversion finale
assets/js/exclusive/    the trade argument, as a ledger
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
