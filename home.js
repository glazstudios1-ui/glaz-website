import { REEL, SERVICES, GALLERY, FILMS, CLOSING_PHOTO, LINKS } from './home-media.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(https?:|mailto:|\/|media\/)/i.test(String(u || '')) ? String(u) : '');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Navigation ----------
const nav = $('#nav'), hero = $('.hero');
new IntersectionObserver(([e]) => nav.classList.toggle('on-hero', e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' }).observe(hero);
const menuBtn = $('#menu-btn'), menu = $('#menu');
const setMenu = (open) => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; };
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

// ---------- Opening reel: short clips (or photos) fading one into the next ----------
const PHOTO_SECONDS = 5;
const reel = $('#reel'), ticks = $('#ticks'), toggle = $('#reel-toggle');
const items = REEL.filter((r) => safeUrl(r.photo) || safeUrl(r.video));
reel.innerHTML = items.map((r, i) => `<div class="clip ${r.video && !reduced ? 'is-video' : 'zoom'}">
  ${r.video && !reduced
    ? `<video muted playsinline preload="${i === 0 ? 'auto' : 'none'}" poster="${esc(safeUrl(r.photo))}" src="${esc(safeUrl(r.video))}"></video>`
    : `<img src="${i === 0 ? esc(safeUrl(r.photo)) : ''}" data-src="${esc(safeUrl(r.photo))}" alt="" ${i === 0 ? 'fetchpriority="high"' : ''}>`}
  </div>`).join('');
ticks.innerHTML = items.map(() => '<i></i>').join('');
const clips = [...reel.children], bars = [...ticks.children];
let at = -1, timer = null, paused = reduced;

function prepare(i) { // load the next photo ahead of time
  const img = clips[i]?.querySelector('img');
  if (img && !img.getAttribute('src')) img.src = img.dataset.src;
  const v = clips[i]?.querySelector('video');
  if (v && v.preload === 'none') v.preload = 'auto';
}
function play(i) {
  clearTimeout(timer);
  const prev = clips[at];
  at = (i + clips.length) % clips.length;
  const el = clips[at], v = el.querySelector('video');
  prepare(at); prepare((at + 1) % clips.length);
  const secs = v && Number.isFinite(v.duration) && v.duration > 0 ? v.duration : PHOTO_SECONDS;
  hero.style.setProperty('--dur', `${secs}s`);
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on'); // restart the zoom
  if (prev && prev !== el) { prev.classList.remove('on'); prev.querySelector('video')?.pause(); }
  bars.forEach((b, k) => { b.className = k < at ? 'done' : ''; });
  void bars[at].offsetWidth; bars[at].className = 'now';
  if (paused) return;
  if (v) { v.currentTime = 0; v.play().catch(() => {}); v.onended = () => play(at + 1); timer = setTimeout(() => play(at + 1), (secs + 1) * 1000); }
  else timer = setTimeout(() => play(at + 1), secs * 1000);
}
function setPaused(p) {
  paused = p;
  hero.classList.toggle('paused', p);
  toggle.setAttribute('aria-label', p ? 'Play' : 'Pause');
  const v = clips[at]?.querySelector('video');
  if (p) { clearTimeout(timer); v?.pause(); clips[at]?.querySelector('img')?.style.setProperty('animation-play-state', 'paused'); }
  else { clips[at]?.querySelector('img')?.style.removeProperty('animation-play-state'); play(at + 1); }
}
if (clips.length) {
  play(0);
  if (reduced) setPaused(true);
  toggle.addEventListener('click', () => setPaused(!paused));
  // Stop when nobody is looking at it, and carry on when they come back
  new IntersectionObserver(([e]) => { if (!paused) { if (e.isIntersecting) play(at); else { clearTimeout(timer); clips[at]?.querySelector('video')?.pause(); } } }).observe(hero);
} else { $('.reel-ui').hidden = true; }

// ---------- Services ----------
$('#services').innerHTML = SERVICES.map((s) => `<li><a href="/book">
  <img src="${esc(safeUrl(s.photo))}" alt="" loading="lazy" decoding="async"><span>${esc(s.name)}</span></a></li>`).join('');

// ---------- Photo wall + full-screen viewer ----------
const photos = GALLERY.map(safeUrl).filter(Boolean);
$('#wall').innerHTML = photos.map((src, i) => `<button data-ph="${i}" aria-label="Open photo ${i + 1} of ${photos.length}">
  <img src="${esc(src)}" alt="" loading="lazy" decoding="async"></button>`).join('');
const viewer = $('#viewer'), track = $('#viewer-track'), count = $('#viewer-count');
track.innerHTML = photos.map((src, i) => `<figure><img data-src="${esc(src)}" alt="Photo ${i + 1} of ${photos.length}"></figure>`).join('');
const figs = [...track.children];
let opener = null;
const current = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
function show(i) {
  [i - 1, i, i + 1].forEach((k) => { const img = figs[k]?.querySelector('img'); if (img && !img.src) img.src = img.dataset.src; });
  count.textContent = `${i + 1} / ${photos.length}`;
}
$('#wall').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ph]'); if (!b) return;
  opener = b; viewer.showModal();
  const i = Number(b.dataset.ph);
  track.scrollLeft = i * track.clientWidth; show(i); track.focus({ preventScroll: true });
});
const go = (d) => track.scrollTo({ left: Math.max(0, Math.min(photos.length - 1, current() + d)) * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
track.addEventListener('scroll', () => requestAnimationFrame(() => show(current())), { passive: true });
$('#viewer-prev').addEventListener('click', () => go(-1));
$('#viewer-next').addEventListener('click', () => go(1));
viewer.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => opener?.focus());

// ---------- Films (YouTube loads only on play) ----------
const filmGrid = $('#film-grid');
const ytId = (v) => (String(v || '').match(/^[\w-]{6,20}$/) || [])[0] || '';
filmGrid.innerHTML = FILMS.slice(0, 3).map((f, i) => {
  const id = ytId(f.youtube);
  const poster = safeUrl(f.poster) || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '');
  return `<div class="film">${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : ''}
    <button data-film="${i}" ${id ? '' : 'disabled'} aria-label="Play ${esc(f.title)}">
      <span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg></span></button>
    ${id ? '' : '<span class="soon">Film coming soon</span>'}</div>`;
}).join('');
filmGrid.addEventListener('click', (e) => {
  const b = e.target.closest('[data-film]');
  if (!b || b.disabled) return;
  const f = FILMS[b.dataset.film];
  if (!paused) setPaused(true);
  b.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytId(f.youtube)}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(f.title)}"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
});

// ---------- Closing photo + footer ----------
if (safeUrl(CLOSING_PHOTO)) {
  const closing = $('#closing');
  new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { closing.style.backgroundImage = `url("${CLOSING_PHOTO}")`; obs.disconnect(); } }, { rootMargin: '400px' }).observe(closing);
}
$('#foot-links').innerHTML = [
  '<a href="/about">About</a>', '<a href="/faq">FAQ</a>', '<a href="/book">Book your date</a>',
  LINKS.instagram && safeUrl(LINKS.instagram) ? `<a href="${esc(LINKS.instagram)}" target="_blank" rel="noopener">Instagram</a>` : '',
  LINKS.email ? `<a href="mailto:${esc(LINKS.email)}">${esc(LINKS.email)}</a>` : '',
].join('');
