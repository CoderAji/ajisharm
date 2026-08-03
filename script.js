const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = [...document.querySelectorAll("section")];
const nav = document.querySelector(".nav");
const navLinks = [...document.querySelectorAll(".nav-list a")];
const navBtn = document.querySelector(".nav-current");
const navK = document.querySelector(".nav-k");
const navLabel = document.querySelector(".nav-label");
let navPinned = false;   // set when the user opens it by hand

// Stagger index for each section's entrance animation.
sections.forEach(sec => [...sec.children].forEach((el, i) => el.style.setProperty("--i", i)));

// ---- intro: page flips like a pancake, letters drop, spatula rights it ----
// Once per session, skippable, and skipped outright for reduced motion.
const BACKDROPS = ["#2f6bd8", "#7a3fd0", "#e0552b", "#d92e78", "#128a8a", "#1f3fa8"];

(function intro() {
  if (reduced || sessionStorage.getItem("introSeen")) return;
  sessionStorage.setItem("introSeen", "1");

  document.documentElement.style.setProperty(
    "--introbg", BACKDROPS[Math.floor(Math.random() * BACKDROPS.length)]);

  const hero = document.querySelector("#s0");
  hero.classList.add("in");                       // no fade-in fighting the fall

  // Split the headline into characters so they fall individually.
  const h1 = hero.querySelector("h1");
  let n = 0;
  for (const node of [...h1.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) continue;   // leave <br> alone
    const frag = document.createDocumentFragment();
    for (const char of node.textContent) {
      if (char === " ") { frag.append(" "); continue; }
      const span = document.createElement("span");
      span.className = "ch";
      span.textContent = char;
      span.style.setProperty("--c", n);
      span.style.setProperty("--cr", (n % 2 ? 1 : -1) * (8 + (n % 5) * 6) + "deg");
      frag.append(span);
      n++;
    }
    node.replaceWith(frag);
  }

  [...hero.children].forEach((el, i) =>
    el.style.setProperty("--r", (i % 2 ? 1 : -1) * (5 + i * 3) + "deg"));

  document.body.classList.add("intro");

  const end = () => {
    document.body.classList.remove("intro");
    for (const ev of ["pointerdown", "keydown", "wheel", "touchstart"]) removeEventListener(ev, end);
  };
  const timer = setTimeout(end, 2900);
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

    const link = navLinks.find(a => a.hash === "#" + e.target.id);
    navLinks.forEach(a => a.classList.toggle("here", a === link));
    if (link) rollTo(link.dataset.k, link.textContent);

    // The full list takes over once the sandwich is finished.
    setNav(e.target.id === "s5" || navPinned);
  }
}, { threshold: 0.35 });

// Roll the old label out and the new one in instead of swapping instantly.
function rollTo(k, text) {
  if (navLabel.textContent === text) return;
  navBtn.classList.remove("swap");
  void navBtn.offsetWidth;                 // restart the animation
  navBtn.classList.add("swap");
  setTimeout(() => { navK.textContent = k; navLabel.textContent = text; }, 150);
}

function setNav(open) {
  nav.classList.toggle("open", open);
  navBtn.setAttribute("aria-expanded", String(open));
}

navBtn.addEventListener("click", () => { navPinned = !nav.classList.contains("open"); setNav(navPinned); });
navLinks.forEach(a => a.addEventListener("click", () => { navPinned = false; }));

// Stagger index so the horizontal list unfurls right to left.
navLinks.forEach((a, j) => a.parentElement.style.setProperty("--j", j));

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

  for (let i = 0; i < 5; i++) {
    const e = document.createElement("span");
    e.className = "emoji";
    e.textContent = FACES[i % FACES.length];
    e.style.cssText = `--size:${1.1 + Math.random() * 1.1}rem;` +
      `--delay:${(Math.random() * 1.4).toFixed(2)}s;--dur:${(2.2 + Math.random() * 1.6).toFixed(2)}s;` +
      `--dy:${(Math.random() * 90 - 45).toFixed(0)}px;--rot:${(Math.random() * 50 - 25).toFixed(0)}deg`;
    burst.appendChild(e);
  }

  document.body.appendChild(burst);
  setTimeout(() => burst.remove(), 5200);   // ponytail: no cleanup bookkeeping needed
}

// Finished sandwich moves off the corner and fills the empty half of the finale.
new IntersectionObserver(([e]) => document.body.classList.toggle("plated", e.isIntersecting),
  { threshold: 0.6 }).observe(document.querySelector("#s5"));

new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  document.title = "sandwich complete";
  if (!reduced) celebrate();
  obs.disconnect();
}, { threshold: 0.9 }).observe(document.querySelector("#s5"));

// The "right now" photo is optional too.
const nowImg = document.querySelector(".now-photo img");
if (nowImg) {
  const collapse = () => nowImg.closest(".now")?.classList.add("noimg");
  if (nowImg.complete && nowImg.naturalWidth === 0) collapse();
  else nowImg.addEventListener("error", collapse);
}

// The hero photo is optional — drop me.png in the project root to switch it on.
const photo = document.querySelector(".me img");
if (photo) {
  const dropPhoto = () => photo.closest(".me")?.remove();
  if (photo.complete && photo.naturalWidth === 0) dropPhoto();
  else photo.addEventListener("error", dropPhoto);
}

// Project images are optional too: an empty slot keeps its caption card.
// A 404 can fire before this script runs, so check the already-settled state
// as well as listening for future failures.
document.querySelectorAll(".thing img").forEach(img => {
  if (img.complete && img.naturalWidth === 0) img.remove();
  else img.addEventListener("error", () => img.remove());
});
