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
| 01 | **Hero — "Field of Light"** | Faceted ground, the stone contained as a jewel, per-character headline |
| 02 | Manifesto | Word-by-word reveal on scroll |
| 03 | **The Proof** | Pinned. 57 → 100 counter with the facet diagram drawing in |
| 04 | Pillars | The four benefits from the deck |
| 05 | Light Study | Pinned video — "light enters, light returns" |
| 06 | Marquee | Oversized horizontal type |
| 07 | **Collection** | Light zone. All 9 SKUs with real specs |
| 08 | Worn | Alternating editorial spreads |
| 09 | Metals | Platinum / 14K Yellow / Two Tone |
| 10 | Display | The periwinkle retail case |
| 11 | Exclusivity | Patent-pending, unshoppable — the retailer argument |
| 12 | CTA | centuriondiamond.com |

---

## Header & hero

**Header** is two floating capsules, not a bar. The wordmark sits left; nav links and a
rose *Enquire* pill sit right. Both shrink on scroll and auto-hide when scrolling down.
Under 1000px the links collapse into a diamond toggle that rotates 135° and opens a
full-screen sheet with numbered links revealed on a stagger. Esc and any link close it.

**Hero — "Field of Light".** The faceted ground carries the atmosphere; the stone is
a **contained jewel** in a rotated-square vitrine, never full-bleed wallpaper. An earlier
build used `object-fit: cover` on the video, which blew the stone up until it swallowed
the layout — the vitrine fixes that by giving the stone a fixed, art-directed size.
A ring of exactly 100 tick marks turns around it, and the vitrine's corners fade via a
radial mask so the stone floats rather than sitting in a black box.

The headline is split into individual characters and masked upward on a stagger, followed
by a specular sweep across the words.

**Intro timing matters here.** The first build ran a 3.3s preloader *then* a 1.7s iris
wipe — five seconds of black before anything appeared, which reads as a broken page. The
preloader is now ~1.3s and the hero begins revealing while the curtain is still lifting,
so there is no dead frame.

## Interaction

- **Jewel** — tilts in 3D toward the pointer (`rotationX/rotationY`, note: GSAP's
  canonical names; `quickTo` does not alias `rotateX/rotateY`). On touch devices it
  breathes on a slow yoyo and answers a tap with a spring.
- **Buttons** — the primary CTA is magnetic on pointer, and takes an `.is-tap` state on
  touch so mobile gets the same feedback.
- **Ground** — drifts slightly counter to the pointer for parallax depth.
- **Header** — capsules shrink past 80px of scroll and hide on scroll-down.

## Motion

GSAP 3.15 + ScrollTrigger + Lenis smooth scroll, all vendored into
`assets/js/vendor/` — no CDN, no network dependency.

Everything is wired in `assets/js/main.js`, one small function per behaviour:
preloader, cursor, the hero entrance, character splitting, the 100-tick ring,
pointer tilt, magnetic buttons, scroll reveals, the pinned 57→100 proof,
ghost-text drift, marquee, image parallax, stat counters, video play-in-view,
and the header capsules.

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

The hero stone is a bespoke clip generated with Magnific (Seedance 2.0 Pro): a
brilliant-cut diamond centred on pure black, raked by a moving beam. Black corners
were a hard requirement — the hero type sits in them. Because the frame is almost
entirely black it compresses extremely well, which is why the page got lighter after
the redesign. Master kept at `dev/stone-master.mp4`.

The rainbow-dispersion clip from the client folder now drives the Light Study section.
The hero's faceted ground is a supplied still, re-cropped and emitted at four widths
(48KB at 1920).

**Fonts are self-hosted** (`assets/fonts/`, latin + latin-ext only). The page makes
**zero third-party requests** — no Google Fonts, no CDN.

**Page weight:** ~0.75 MB mobile, ~1.2 MB desktop (first viewport, video included).

On a warm cache the page paints in ~500 ms. A cold load against the `serve` dev server
measures far slower (~2.7 s), but that is the dev server itself — it costs ~80 ms per
request across 19 files. Any real host with HTTP/2 and compression will not show this;
worth re-measuring on staging rather than trusting the local number.

To re-encode: `dev/encode.sh` (client masters), `dev/encode2.sh` (hero stone).

---

## Project layout

```
index.html              the whole page
assets/css/base.css     tokens, reset, type scale
assets/css/sections.css components & sections
assets/js/main.js       motion system
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
