const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Stagger index for each section's entrance animation.
document.querySelectorAll("section").forEach(sec => {
  [...sec.children].forEach((el, i) => el.style.setProperty("--i", i));
});

// Reveal sections as they come into view. Cheaper and far more predictable than
// a view-timeline inside a column-reverse scroller.
const reveal = new IntersectionObserver(entries => {
  for (const e of entries) if (e.isIntersecting) e.target.classList.add("in");
}, { threshold: 0.25 });

document.querySelectorAll("section").forEach(sec => reveal.observe(sec));

// ---- finale: the sandwich is built ----
const FACES = ["🤤", "😂", "😍", "🥹", "😋", "🤩", "🥳", "😆", "👏", "🔥", "✨", "🥪"];

function celebrate() {
  const burst = document.createElement("div");
  burst.className = "burst";
  burst.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 28; i++) {
    const e = document.createElement("span");
    e.className = "emoji";
    e.textContent = FACES[i % FACES.length];
    e.style.cssText = `left:${8 + Math.random() * 84}%;--size:${1.6 + Math.random() * 2.2}rem;` +
      `--delay:${(Math.random() * 1.4).toFixed(2)}s;--dur:${(2.2 + Math.random() * 1.6).toFixed(2)}s;` +
      `--dx:${(Math.random() * 30 - 15).toFixed(1)}vw;--rot:${(Math.random() * 50 - 25).toFixed(0)}deg`;
    burst.appendChild(e);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 5200);   // ponytail: no cleanup bookkeeping needed
}

new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  document.title = "made it.";
  if (!reduced) celebrate();
  obs.disconnect();
}, { threshold: 0.9 }).observe(document.querySelector("#s7"));
