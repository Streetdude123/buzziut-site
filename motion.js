const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

function split(el) {
  const text = el.textContent.trim();
  el.setAttribute("aria-label", text);
  el.textContent = "";
  return text.split(/\s+/).map((word, i) => {
    const w = document.createElement("span");
    const inner = document.createElement("span");
    w.className = "w";
    w.setAttribute("aria-hidden", "true");
    inner.textContent = word;
    w.append(inner);
    if (i) el.append(" ");
    el.append(w);
    return w;
  });
}

function count(el) {
  if (calm) return;
  const end = parseFloat(el.dataset.count);
  const dec = (el.dataset.count.split(".")[1] || "").length;
  const start = performance.now();
  el.style.minWidth = el.offsetWidth + "px";
  const step = now => {
    const t = Math.min((now - start) / 900, 1);
    const k = t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
    el.textContent = (end * k).toFixed(dec);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

document.querySelectorAll('[data-reveal="words"] h2').forEach(h => {
  split(h).forEach((w, i) => w.style.setProperty("--i", Math.min(i, 5)));
});

const title = document.querySelector(".hero h1");
Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1000))]).then(() => {
  let top = null;
  let line = -1;
  split(title).forEach(w => {
    if (w.offsetTop !== top) {
      top = w.offsetTop;
      line++;
    }
    w.style.setProperty("--d", 180 + line * 100 + "ms");
  });
  title.classList.add("is-split");
  document.documentElement.classList.add("go");
});

const marks = new Map();
const shown = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    marks.get(e.target).forEach(el => {
      el.classList.add("is-visible");
      el.querySelectorAll("[data-count]").forEach(count);
    });
    shown.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: "-50px 0px" });

document.querySelectorAll("[data-reveal]").forEach(el => {
  const box = el.dataset.reveal === "wipe" ? el.parentElement : el;
  if (!marks.has(box)) {
    marks.set(box, []);
    shown.observe(box);
  }
  marks.get(box).push(el);
});

const strip = document.querySelector(".break");
new IntersectionObserver(([e]) => strip.classList.toggle("is-paused", !e.isIntersecting)).observe(strip);
