# ajisharm

Personal site for Ajitesh Sharma. Live at **https://ajisharm.vercel.app**.

Three files, no build step, no dependencies, no framework:

- `index.html` — all ten sections, in DOM order bottom-to-top
- `style.css` — everything visual, including the scroll-driven animation
- `script.js` — intro sequence, section reveals, nav, emoji burst

Open `index.html` in a browser, or `python3 -m http.server` from this directory.
Pushes to `main` deploy automatically via Vercel.

## The one thing to read before editing animations

The page **starts at the bottom and is scrolled upward**. `main` is a
`flex-direction: column-reverse` scroll container, so the browser parks the
scroll position at the visual bottom on load with no JavaScript.

The consequence that breaks people:

> The scroll timeline runs **100% at the visual bottom** (where the visitor
> lands) down to **0% at the top**. Progress **decreases** as the user scrolls up.

So every `@keyframes` tied to `--page` is authored **`from` = low progress (top,
finished state)** and **`to` = high progress (bottom, initial state)**. It reads
backwards, but it is the only orientation where `animation-fill-mode` holds the
correct state outside each `animation-range`.

Get this wrong and the sandwich disassembles as you climb, or the progress ring
drains instead of filling. Both look plausible in a diff. This was inverted
twice during development and only caught by measuring in a real browser.

**Verify visually, not by reasoning.** Headless screenshots are unreliable here —
these layers are composited, and a headless raster can show a stale frame that
disagrees with `getComputedStyle`. Check in a real browser, or read computed
styles directly:

```js
getComputedStyle(document.querySelector('.lettuce')).opacity
getComputedStyle(document.querySelector('.ring-fill')).strokeDashoffset
```

Also note: named scroll timelines only resolve on **ancestors**. `.badge`, `.bg`
and `.cue` are siblings of `main`, which is why `timeline-scope: --page` sits on
`html, body`. Remove it and every scroll animation silently stops.

## Conventions

- Sentences are **all-caps or all-lowercase**, never sentence case. Body copy is
  lowercased in CSS (`text-transform`), so new copy inherits it.
- One sandwich ingredient per section. Adding a section means adding a layer in
  `index.html` and a matching `animation-range` in `style.css`.
- Colours, fonts and the badge size are CSS custom properties in `:root`.
