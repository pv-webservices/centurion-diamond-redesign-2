# Diamond-first client revision — 15 September 2026

## Status

Implemented in the local checkout, based on clean `main` at `1500153`.
No commit, push, or deployment was performed. Final product-asset approval is still required.

## Narrative

01. Existing cinematic Hero, with the available Oval and Radiant photographs in the orbital composition.
02. Rough-to-polished journey: illustrative geometry, aligned cutting mask, construction lines, and the supplied polished Round photograph.
03. Existing Light Study, with longer copy holds and its video scrub preserved.
04. Anatomy, the configured cut sequence, and a curated family reveal.
05. Traditional 57 first, then Centurion 100; a sustained **See the Difference** close.
06. Centurion Experience: opening; Every Centre Stone; A Different Kind of Standard; Unshoppable by Design.
07. Existing retail lighting rig, with asset-driven display progression.
08. Locked Finale, unchanged.
09. Existing Contact ending, unchanged.

Removed from homepage markup, script loads, and initializers: bridal Collection, Worn, Metals. Their source modules and image files remain on disk. Removed the old marquee and obsolete navigation destinations. Mobile navigation and footer links now lead to retained content. There are nine unique section IDs, with no removed-section scroll tracks.

## Assets: do not mistake architecture for supplied product photography

Edit **`assets/js/diamond-assets.js`**. A `null` source is intentional and is never requested over the network.

| Slot | Current state | Required source |
| --- | --- | --- |
| `diamondShapes[3].src` | Missing; excluded from rendered sequence | True approved Elongated Cushion, preferably transparent WebP, up to 960 px |
| `diamondShapes[4].src` | Missing; excluded from rendered sequence | True approved Marquise, preferably transparent WebP, up to 960 px |
| `retailAssets.ten.src` | Missing | Approved 10-piece display |
| `retailAssets.twentyFive.src` | Missing | Approved 25-piece display |
| `journeyAssets.rough.src` | No rough photograph available | Optional approved rough-diamond photograph to replace the explicitly illustrative geometry |

Suggested filenames are stored alongside each null source as `slot`. Set `src` and, where available, `srcset`; no timeline rewrite is needed. The existing Round, Oval, and Radiant photographs are the only published cut images. Emerald and ordinary Cushion have not been relabeled or stretched.

The existing `display-case-a` photograph matches the supplied retail screenshot but visibly contains **nine** rings. It remains a presentation reference and is not described as the approved ten-ring set. No ring images were invented.

When only ten is supplied, the display shows that photograph with its ten-piece label. When both are supplied, the timeline holds ten at 40–49%, pulls back and reveals the second registered view during 55–80%, then holds the completed presentation through 94%. Both images share the same pose and mask system. The images must use a matching camera, canvas, and registration, with the initial ten positions retained in the expanded view; otherwise source preparation is needed to make the expansion physically continuous. The base presentation currently uses a 1200:1480 canvas.

**Pending visual acceptance:** all five genuine cuts together, the actual 10→25 merchandising expansion, and whether the illustrative cutting study should be replaced by client photography. Automated fixture tests validate wiring and masks, not missing imagery or final photographic continuity.

## Pacing

Scroll heights include the pinned viewport. `svh` keeps the tracks stable when mobile browser chrome changes. Lenis duration/easing were not changed.

| Chapter | Previous desktop / mobile | Revised desktop / mobile |
| --- | --- | --- |
| Hero | 320 / 300 vh | 560 / 500 svh |
| Journey | — | 380 / 380 svh |
| Light Study | 360 / 340 vh | 680 / 600 svh |
| Anatomy + family | 400 / 420 vh | 720 / 650 svh |
| Comparison | 330 / 360 vh | 560 / 560 svh |
| Experience (formerly Exclusivity) | 340 / 320 vh | 700 / 620 svh |
| Display | 360 / 360 vh | 440 / 440 svh |
| Finale | Existing responsive values | Unchanged |

Hero's first settled hold grew from progress .19–.25 to .11–.29. Anatomy benefit entrances occupy 20% of their windows, with settled holds from 20–82%. Experience frames have distinct entrance, stationary hold, and exit intervals. Comparison holds both diagrams from .51–.73, and See the Difference settles by .84 and remains through the close. Reading time is controlled by the visitor's scroll speed; this does not guarantee a fixed additional number of seconds for every input device.

Preloader: one SVG, one shared image, 100 assembly paths, approximately 1.43 seconds of assembly and a 2.42-second total sequence. The counter reaches exactly 100. Its geometry is an artistic assembly mask, not a technical representation of Centurion's proprietary facet topology. Reduced motion briefly shows 100 and reveals the page without assembly.

## QA and evidence

- `node dev/narrative-qa.js`: seven requested sizes — 375×812, 390×844, 430×932, 768×1024, 1366×768, 1440×900, 1920×1080. Samples cover every retained/new chapter.
- Reduced-motion variant: `REDUCED=1`, `SIZES=390x844,1440x900`; no pins or ScrollTriggers, logical static document order.
- `node dev/narrative-lifecycle.js`: exact 100 state; desktop→phone→tablet→desktop resize; adjacent section geometry; registered ten/twenty-five masks using explicitly labeled internal SVG fixtures; no-JavaScript fallback.
- `node dev/asset-slots-check.js`: five-cut configuration and timeline coverage; reference/expansion paths for desktop and mobile; final display color equals the locked finale's ink.
- `node dev/finalecheck.js` with desktop/mobile sizes: forward/reverse scrub, frame-set selection, deferred frame loading, centered copy, CTA and no overflow. Only the test's expected preceding section order/number lookup changed.
- `node dev/narrative-performance.js`: comparison with HEAD using the same local initial-load window and fresh browser contexts.
- `node --check` on application and new QA scripts; `git diff --check`.

Screenshots and machine-readable results are under ignored `dev/shots/revision/`. The normal and reduced-motion reports cover console errors/warnings, broken images, duplicate IDs, dead anchors, removed sections, overflow, and repeated refresh stability. Screenshots were visually inspected on desktop and phone. These are local Chromium checks, not deployed verification or a Safari/real-device certification.

The existing finale section markup is byte-identical to HEAD; all finale module files are untouched. Original CSS remains intact, with scoped additions that do not select the finale. The finale regression test passes on 390×844 and 1440×900.

## Performance

Local initial-load comparison (sum of response Content-Length values; not a Core Web Vitals field report):

| Viewport | HEAD response bytes | Revised response bytes |
| --- | ---: | ---: |
| 390×844 | 2,742,453 | 2,336,760 |
| 1440×900 | 5,862,966 | 5,577,243 |

DOM nodes: 970 → 834; images: 31 → 14; ScrollTriggers: 11 → 8. Finale frame requests before approaching the ending: zero in both versions. The large existing hero video remains the dominant loading cost. These checks demonstrate no initial payload regression; they do not establish a cross-device frame-rate guarantee.

## Changed files

- `index.html`, `assets/css/sections.css`, `assets/js/main.js`.
- New `assets/js/diamond-assets.js`, `assets/js/preloader.js`, `assets/js/journey/index.js`.
- Hero `index.js`, `scenes.js`.
- Pillars `index.js`, `scenes.js`, `timeline.js`, `visual.js`.
- Sparkle `index.js`, `scenes.js`; Study `scenes.js`.
- Display and Exclusive `index.js`, `scenes.js`, `timeline.js`, `visual.js`.
- Updated `dev/finalecheck.js`, `dev/mobaudit.js`; new narrative QA, lifecycle, performance, and asset-slot checks.
- This report.

## Remaining client input

Supply the four approved missing product/display assets. Confirm use of the illustrative rough stage or supply a matching rough photograph. Review final photographic registration after asset insertion. No additional marketing claims, contact destinations, sustainability content, or stock product images were invented.

---

# Follow-up pass — 19 September 2026

Compared the deployed (old) and localhost (latest) recordings against the client notes and git HEAD `1500153`.

## Decisions
- **Section order** restored to the designed flow, which matches the client's numbered sequence (feature stone → comparison → shapes → remove bridal → Experience): Hero → Journey → The Cut (100 vs 57) → Anatomy / Shapes → Light Study → Centurion Experience → At Retail → Finale → Contact. This also restores the built-in seams (Cut hands its light ground to Anatomy; Anatomy's aperture closes into the Study).
- **Exclusivity recovered** inside the Experience as its own frame: 100 facets per centre stone, 43+ more facets than a traditional cut, the patent-pending / cannot-price-shop claim, the protected-margin claim, and the **Enquire about stocking** CTA under *Unshoppable by design*. The bridal "9 settings" figure stays retired with the bridal collection.
- **Navigation** now uses honest labels in page order: Craftsmanship, The Cut, Shapes, Experience, At Retail, Contact. The footer's "Collection" link became Shapes / Experience.
- **Brand line** "More facets, more brilliance." restored in meta and the mobile menu (it had been changed without a request). Only the comparison's "More facets. / More sparkle." was removed, as asked.
- At Retail's intro no longer repeats the Experience headline; it now reads "Made for the showcase."

## Client points closed in this pass
- **Mixed shapes (points 2, 4, 6):** Elongated Cushion, Marquise, Pear, Heart and Princess cut from the client deck `100 facets Diamonds Comparison.pptx` (transparent WebP, 480/960). The feature rotation is now all five requested cuts; the hero is back to the filmed video only (the overlaid cut-outs did not look natural and were removed; mixed cuts will come from a regenerated film); the Anatomy "Every shape" close is a Vera-style ring of all nine cuts around the Round, with names.
- **Readability:** hero headlines no longer clip ("EXCELLENC" / "BRILLIANC" bug: overflow-hidden lines in a 520–620 px column). Light Study copy has a feathered scrim over the lit stone.
- **Soften the black:** `--ink` is now warm charcoal `#151213`; Journey, Comparison ramp, Anatomy aperture, Light Study (film blacks blend into it) and Experience use it. `--brand-black` is unchanged, so the approved Finale and Contact are byte-for-byte the same.
- Experience track is 860 / 760 svh so each frame and each ledger item has its own hold.

## Still blocked on client assets
- 10-piece and 25-piece display photographs (slots in `diamond-assets.js`; the 10→25 timeline is wired and fixture-tested). The 9-ring reference photo still shows until then.
- Optional rough-diamond photograph for the Journey (currently illustrative geometry).
- The hero film itself has round stones baked in; only a re-render changes them. Mixed shapes are layered around it.

## Local server note
Port 4321 was served by Python `http.server`, which ignores HTTP Range requests, so scroll-scrubbed videos cannot seek (they stick on frame 0). Use `npm start` (`serve`), or any host that returns `206 Partial Content`; Vercel does.

## QA (range-capable local server)
- `narrative-qa.js`: seven sizes, now also flagging headline text wider than its column; normal and reduced motion — 0 errors, 0 overflow, 0 issues, 0 dead links / broken images.
- `finalecheck.js`: all sizes PASS (finale untouched). `asset-slots-check.js`: PASS (five cuts). `narrative-lifecycle.js`: PASS after it waits for the preloader and for ScrollTrigger's resize refresh instead of fixed sleeps.

## Update — 19 September 2026 (assets)
- **10-piece display found:** `assets/img/model/display-case-b-*.webp` (in the repo since the first commit, unused) shows 10 stands with 10 rings, the same tray as the finale film. It is now the `ten` slot in `diamond-assets.js`; At Retail reads "10 pieces. One experience." `display-case-a` (9 stands) stays as a reference only. Pending client confirmation.
- **25-piece display:** still needs the client photograph. The nine ring graphics in the PPT cannot stand in: each is one gold bridal solitaire on a different coloured backdrop, and the client asked for bridal rings and metals to be removed.
- **Briefs for regeneration** (git-ignored): `dev/hero-video-refs/` holds nine 1600 px transparent cut PNGs, the same on black, keyframes of the current hero film, `HERO-VIDEO-BRIEF.md` (specs, composition rules, keyframe and motion prompts) and `ROUGH-DIAMOND-BRIEF.md` (rough-stone type, framing, prompt, four-stage set).

## Hero film v2 — 19 September 2026
- **Source:** `assets/video/hero section 2nd final video.mp4` (1280x720, 30 fps, 8 s): rough rock bursts, the nine cuts emerge and settle. No hard cuts, duplicate frames or brightness flashes (frame-by-frame scan).
- **Glitch removed:** a watermark ghost (vertical/horizontal streaks, bottom-right, about x 1112-1216, y 550-640) from 2.5 s to the end. Removed per frame: sideways-only blur while the background is out of focus (2.5-4.1 s), texture copied from the same frame once the rocks sharpen (4.7 s on), cross-faded between the two; untouched before 2.2 s. Clean master: `dev/hero-video-refs/hero-v2-clean-master.mp4` (git-ignored).
- **Encodes** (`bash dev/encode-hero-v2.sh`): 1280/960/720 and a 720x1280 phone master, keyframe every 4 frames and no B-frames for fast seeking; 7.5 / 4.6 / 2.8 / 3.9 MB. Previous encodes are in `dev/hero-video-refs/previous-encodes/`.
- **Layout:** the stones sit in the middle third of the film, so the headlines no longer alternate over it. Wide screens (aspect >= 1.45): statements in the outer thirds, column and type size computed from the viewport (`--hero-col: 43.5vw - 38.2vh`), symmetric side shading. Squarer screens (4:3, 5:4): the film is a feathered band and the statements sit above and below the stones. Phones and portrait tablets (<= 860 px wide, taller than 1.2x wide) get the phone master.
- **Smoothness:** continuous 6 s scroll through the whole hero: median scroll-to-video lag 0.13 s (the intentional easing), 251 distinct frames shown for a 240-frame film on desktop.
- **Also fixed:** centred statements in Anatomy ("There is no gimmick.") and Light Study ("100 Facets") were offset about 58 px to the right on 1024-1280 px screens (a 94vw block inside a padded scene).
- **QA:** narrative QA at 9 sizes plus reduced motion, finale, asset-slot and lifecycle checks all pass.

## Diamond Journey redesign — 19 September 2026
- **Images:** three new stages generated with GPT 2 (Magnific), 1k, high quality, transparent background: rough octahedral crystal, sawn with a polished window, rounded preform. The fourth stage is the existing polished Round. All four trimmed to their outline on one square box and saved as WebP at 480/960 in `assets/img/journey/` (about 50-60 KB each at 480). They are AI-generated, so the "illustrative study" caption stays.
- **Design:** the stone is worked in place as you scroll (rough, sawn, shaped, finished), each change a dissolve with a light sweep and a small settle. A ring of 100 ticks lights up with progress and completes on the finished stone; the glow behind cools from ember to diamond-white; glints appear on the finished stone. Four captions and a 01-04 stage rail. Track 480svh desktop / 440svh phone. Reduced motion: captions in order, then the four stages side by side.
- **Seam fixed:** the hero film now fades into the page ink at its foot, and the Journey opens and closes on the same ink, so there is no line between the hero and Journey (or Journey and The Cut).
- **Also fixed:** "Scroll to discover" reappeared at the end of the hero after an instant jump or a reload that restored the scroll position (the opening animation overrode the scroll state).
- **QA:** narrative QA at 8 sizes plus reduced motion, finale, asset-slot and lifecycle checks all pass; no console errors.

## The Cut / See the difference redesign — 19 September 2026
- **Client note 5** ("the scroll after this is too fast ... remove more facets, more sparkle, keep SEE THE DIFFERENCE") and the earlier ask ("scroll over showing 100 facet over 57 facet").
- **Assets:** the two approved deck diagrams (Centurion 100, traditional 57; about 300 px) upscaled 4x with Magnific Precision, masked to their circle, saved as WebP 560/960 in `assets/img/cut/` (55-130 KB).
- **Sequence** (660svh desktop / 600svh phone, every beat with a long hold): the Journey ink ramps to mineral light with the passing light and "It is all about the sparkle."; the traditional 57 arrives large; the Centurion 100 wipes over it along a blush edge while the count runs 57 to 100 and the facet ring fills; the two separate side by side (100 bold, 57 muted) with the deck line; "See the difference." holds to the end.
- **Seamless flow:** the section starts on the Journey ink and ends on the exact tone Anatomy opens on; Anatomy title is now set as its stage arrives, so there is no empty light stretch between the two (the old version had one).
- **Removed:** the old `.spk`/`.cut` styles and markup (the "More facets / More sparkle" words were already gone).
- **QA:** narrative QA at 8 sizes (now also checking this section text boxes) plus reduced motion; finale, asset-slot and lifecycle checks pass.
