// Punchline: the tab title and favicon are the only browser chrome a page is
// actually allowed to touch. The URL bar is not reachable from JS, by design.
const EATEN = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><text y='14' font-size='14'>🦴</text></svg>";

new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  document.title = "nothing left";
  document.querySelector("link[rel=icon]").href = EATEN;
  obs.disconnect();
}, { threshold: 0.9 }).observe(document.querySelector("#s7"));
