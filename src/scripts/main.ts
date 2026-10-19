import Lenis from 'lenis';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;
const root = document.documentElement;

/* ---------- Smooth scroll ---------- */
const lenis = reduce ? null : new Lenis({ lerp: 0.09, smoothWheel: true });
const getScroll = () => (lenis ? lenis.scroll : window.scrollY);

/* ---------- Parallax ---------- */
type P = { el: HTMLElement; speed: number; top: number; h: number };
type M = { inner: HTMLElement; top: number; h: number };
let layers: P[] = [];
let masks: M[] = [];
const factor = coarse || window.innerWidth < 768 ? 0.5 : 1;

function absTop(el: HTMLElement) {
  let t = 0, n: HTMLElement | null = el;
  while (n) { t += n.offsetTop; n = n.offsetParent as HTMLElement | null; }
  return t;
}
function measure() {
  layers = [...document.querySelectorAll<HTMLElement>('[data-speed]')].map((el) => ({
    el, speed: parseFloat(el.dataset.speed || '0') * factor, top: absTop(el), h: el.offsetHeight,
  }));
  masks = [...document.querySelectorAll<HTMLElement>('.mask')].map((el) => ({
    inner: el.querySelector<HTMLElement>('.mask-in')!, top: absTop(el), h: el.offsetHeight,
  })).filter((m) => m.inner);
}
function renderParallax() {
  if (reduce) return;
  const vh = window.innerHeight, s = getScroll(), vc = s + vh / 2;
  for (const l of layers) {
    if (l.top + l.h < s - vh || l.top > s + vh * 2) continue;
    l.el.style.transform = `translate3d(0, ${((l.top + l.h / 2 - vc) * l.speed).toFixed(2)}px, 0)`;
  }
  for (const m of masks) {
    if (m.top + m.h < s || m.top > s + vh) continue;
    const p = Math.max(-1, Math.min(1, (vc - (m.top + m.h / 2)) / vh));
    m.inner.style.transform = `translate3d(0, ${(p * m.h * 0.1 * factor).toFixed(2)}px, 0)`;
  }
}

/* ---------- Cursor ---------- */
const cursor = document.querySelector<HTMLElement>('.cursor');
let mx = -100, my = -100, cx = -100, cy = -100;
window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
document.querySelectorAll<HTMLElement>('[data-cursor]').forEach((el) => {
  el.addEventListener('pointerenter', () => cursor?.classList.add('is-view'));
  el.addEventListener('pointerleave', () => cursor?.classList.remove('is-view'));
});

/* ---------- Index hover preview ---------- */
const preview = document.querySelector<HTMLElement>('.index-preview');
const previewImgs = preview ? [...preview.querySelectorAll<HTMLElement>('[data-preview]')] : [];
const indexList = document.querySelector<HTMLElement>('.index-list');
let px = 0, py = 0;
document.querySelectorAll<HTMLElement>('.index-row').forEach((row) => {
  row.addEventListener('pointerenter', () => {
    indexList?.classList.add('is-dim');
    preview?.classList.add('is-on');
    previewImgs.forEach((img) => img.classList.toggle('is-active', img.dataset.preview === row.dataset.slug));
  });
  row.addEventListener('pointerleave', () => {
    indexList?.classList.remove('is-dim');
    preview?.classList.remove('is-on');
  });
});

/* ---------- Main loop ---------- */
function raf(t: number) {
  lenis?.raf(t);
  renderParallax();
  cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
  if (cursor) cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  px += (mx - px) * 0.12; py += (my - py) * 0.12;
  if (preview) preview.style.transform = `translate3d(${px + 24}px, ${py - 110}px, 0) rotate(${Math.max(-8, Math.min(8, (mx - px) * 0.08))}deg)`;
  requestAnimationFrame(raf);
}

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('[data-reveal], .clip').forEach((el) => io.observe(el));

/* ---------- Jakarta clock ---------- */
const clock = document.querySelector<HTMLElement>('[data-clock]');
function tick() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }).format(new Date());
}
tick(); setInterval(tick, 20000);

/* ---------- Intro + page transitions ---------- */
const intro = document.querySelector<HTMLElement>('.intro');
const curtain = document.querySelector<HTMLElement>('.curtain');
const ready = () => requestAnimationFrame(() => root.classList.add('is-ready'));

function runIntro() {
  if (!intro) return ready();
  const seen = sessionStorage.getItem('intro-seen');
  if (seen || reduce) { intro.remove(); return ready(); }
  sessionStorage.setItem('intro-seen', '1');
  lenis?.stop();
  const count = intro.querySelector<HTMLElement>('.intro-count')!;
  const bar = intro.querySelector<HTMLElement>('.intro-bar span')!;
  const t0 = performance.now(), dur = 1600;
  const step = (t: number) => {
    const p = Math.min((t - t0) / dur, 1);
    const v = Math.round((1 - Math.pow(1 - p, 3)) * 100);
    count.textContent = String(v).padStart(3, '0');
    bar.style.width = v + '%';
    if (p < 1) return requestAnimationFrame(step);
    setTimeout(() => {
      intro.classList.add('is-done');
      setTimeout(ready, 400);
      setTimeout(() => { intro.remove(); lenis?.start(); }, 1200);
    }, 250);
  };
  requestAnimationFrame(step);
}

function enter() {
  root.classList.remove('from-nav');
  if (curtain && sessionStorage.getItem('nav') === '1') {
    sessionStorage.removeItem('nav');
    curtain.classList.add('is-covering');
    intro?.remove();
    requestAnimationFrame(() => {
      curtain.classList.remove('is-covering');
      curtain.classList.add('is-entering');
      setTimeout(ready, 300);
    });
  } else {
    runIntro();
  }
}

document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest('a');
  if (!a || reduce || !curtain) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || a.target || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey) return;
  if (url.pathname === location.pathname && url.hash) return;
  e.preventDefault();
  sessionStorage.setItem('nav', '1');
  curtain.classList.remove('is-entering');
  void curtain.offsetWidth;
  curtain.classList.add('is-leaving');
  setTimeout(() => { location.href = url.href; }, 720);
});
window.addEventListener('pageshow', (e) => {
  if (e.persisted && curtain) { curtain.className = 'curtain'; root.classList.add('is-ready'); }
});

/* ---------- Boot ---------- */
measure();
window.addEventListener('load', measure);
window.addEventListener('resize', () => { measure(); });
document.fonts?.ready.then(measure);
enter();
requestAnimationFrame(raf);
