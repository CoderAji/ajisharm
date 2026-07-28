const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = [...document.querySelectorAll("section")];
const navLinks = [...document.querySelectorAll(".nav a")];

// Stagger index for each section's entrance animation.
sections.forEach(sec => [...sec.children].forEach((el, i) => el.style.setProperty("--i", i)));

// ---- intro: tip back, drop the hero, spatula flings it home ----
// Once per session, skippable, and skipped outright for reduced motion.
(function intro() {
  if (reduced || sessionStorage.getItem("introSeen")) return;
  sessionStorage.setItem("introSeen", "1");

  const hero = document.querySelector("#s0");
  hero.classList.add("in");                       // no fade-in fighting the fall
  // Alternate the tumble direction so the heap doesn't look mechanical.
  [...hero.children].forEach((el, i) => el.style.setProperty("--r", (i % 2 ? 1 : -1) * (5 + i * 3) + "deg"));

  document.body.classList.add("intro");

  const end = () => {
    document.body.classList.remove("intro");
    for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"]) {
      removeEventListener(ev, end);
    }
  };
  const timer = setTimeout(end, 2600);
  for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"]) {
    addEventListener(ev, () => { clearTimeout(timer); end(); }, { once: true, passive: true });
  }
})();

// Reveal sections and mark the active nav entry. An IntersectionObserver is far
// more predictable here than a view-timeline inside a reversed scroller.
const reveal = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add("in");
    navLinks.forEach(a => a.classList.toggle("here", a.hash === "#" + e.target.id));
  }
}, { threshold: 0.35 });

sections.forEach(s => reveal.observe(s));

// Anchor jumps: the default hash jump is abrupt inside a reversed scroller.
document.querySelectorAll('a[href^="#s"]').forEach(a => {
  a.addEventListener("click", ev => {
    const target = document.querySelector(a.hash);
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  });
});

// ---- finale: the sandwich is complete ----
const FACES = ["🤤", "😂", "😍", "🥹", "😋", "🤩", "🥳", "😆", "👏", "🔥", "✨", "🥪"];

function celebrate() {
  const burst = document.createElement("div");
  burst.className = "burst";
  burst.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 10; i++) {
    const e = document.createElement("span");
    e.className = "emoji";
    e.textContent = FACES[i % FACES.length];
    e.style.cssText = `--size:${1.1 + Math.random() * 1.1}rem;` +
      `--delay:${(Math.random() * 1.4).toFixed(2)}s;--dur:${(2.2 + Math.random() * 1.6).toFixed(2)}s;` +
      `--dx:${(Math.random() * 90 - 45).toFixed(0)}px;--rot:${(Math.random() * 50 - 25).toFixed(0)}deg`;
    burst.appendChild(e);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 5200);   // ponytail: no cleanup bookkeeping needed
}

new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  document.title = "sandwich complete";
  if (!reduced) celebrate();
  obs.disconnect();
}, { threshold: 0.9 }).observe(document.querySelector("#s9"));
