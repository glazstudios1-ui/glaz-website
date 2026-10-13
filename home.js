import { HERO_PRINTS, DAY, FILMS, PLANNERS_PHOTO, CLOSING_PHOTO, KIND_WORDS, LINKS } from './home-media.js';
import * as CFG from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(https?:|mailto:|\/|media\/)/i.test(String(u || '')) ? String(u) : '');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Navigation ----------
const nav = $('#nav');
addEventListener('scroll', () => nav.classList.toggle('lifted', scrollY > 10), { passive: true });
const menuBtn = $('#menu-btn'), menu = $('#menu');
const setMenu = (open) => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; };
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

// ---------- The prints on the table ----------
$('#prints').innerHTML = HERO_PRINTS.slice(0, 5).map((p, i) => {
  const media = i === 0 && p.video && !reduced
    ? `<video src="${esc(safeUrl(p.video))}" poster="${esc(safeUrl(p.src))}" autoplay muted loop playsinline aria-label="${esc(p.alt)}"></video>`
    : `<img src="${esc(safeUrl(p.src))}" alt="${esc(p.alt)}" ${i < 3 ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
  return `<figure class="print p${i}">${media}</figure>`;
}).join('');

// ---------- A wedding day, in chapters ----------
const all = []; // every photo of the day, in order, for the viewer
$('#chapters').innerHTML = DAY.map((ch) => `
  <article class="chapter">
    <div class="ch-text"><h3>${esc(ch.title)}</h3><p>${esc(ch.line)}</p></div>
    <div class="ch-photos">${ch.photos.map((p, i) => {
      const n = all.push({ ...p, chapter: ch.title }) - 1;
      return `<button class="ph ${p.shape === 'tall' ? 'tall' : 'wide'} ${i === 0 ? 'lead' : ''}" data-ph="${n}" aria-label="Open photo: ${esc(p.alt)}">
        <img src="${esc(safeUrl(p.src))}" alt="${esc(p.alt)}" loading="lazy" decoding="async"></button>`;
    }).join('')}</div>
  </article>`).join('');
$('#chapters').addEventListener('click', (e) => { const b = e.target.closest('[data-ph]'); if (b) openViewer(Number(b.dataset.ph), b); });

// ---------- Photo viewer ----------
const viewer = $('#viewer'), track = $('#viewer-track'), count = $('#viewer-count'), vTitle = $('#viewer-title');
let opener = null;
track.innerHTML = all.map((p, i) => `<figure><img data-src="${esc(safeUrl(p.src))}" alt="${esc(p.alt)}"></figure>`).join('');
const figs = [...track.children];
const current = () => Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
function show(i) {
  // load this photo and its neighbours only
  [i - 1, i, i + 1].forEach((k) => { const img = figs[k]?.querySelector('img'); if (img && !img.src) img.src = img.dataset.src; });
  count.textContent = `${i + 1} / ${all.length}`;
  vTitle.textContent = all[i]?.chapter || '';
}
function openViewer(i, from) {
  opener = from;
  viewer.showModal();
  track.scrollLeft = i * track.clientWidth;
  show(i);
  track.focus({ preventScroll: true });
}
const go = (d) => track.scrollTo({ left: Math.max(0, Math.min(all.length - 1, current() + d)) * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
track.addEventListener('scroll', () => requestAnimationFrame(() => show(current())), { passive: true });
$('#viewer-prev').addEventListener('click', () => go(-1));
$('#viewer-next').addEventListener('click', () => go(1));
viewer.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
viewer.addEventListener('close', () => opener?.focus());

// ---------- Films (YouTube loads only when someone presses play) ----------
const filmGrid = $('#film-grid');
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
const ytId = (v) => (String(v || '').match(/^[\w-]{6,20}$/) || [])[0] || '';
filmGrid.innerHTML = FILMS.slice(0, 3).map((f, i) => {
  const id = ytId(f.youtube);
  const poster = safeUrl(f.poster) || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '');
  return `<div class="film">
    ${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : ''}
    <button data-film="${i}" ${id ? '' : 'disabled'} aria-label="Play ${esc(f.title)}, ${esc(f.couple)}">
      <span class="play">${playIcon}</span>
      <span class="label"><strong>${esc(f.couple)}</strong><span>${esc(f.title)}</span></span>
    </button></div>`;
}).join('');
filmGrid.addEventListener('click', (e) => {
  const b = e.target.closest('[data-film]');
  if (!b || b.disabled) return;
  const f = FILMS[b.dataset.film];
  b.parentElement.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${ytId(f.youtube)}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(f.title)}"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
});

// ---------- Kind words (only real ones) ----------
if (KIND_WORDS.length) {
  const words = $('#words');
  words.innerHTML = KIND_WORDS.slice(0, 3).map((k) => `<blockquote><p>“${esc(k.text)}”</p><footer>${esc(k.who)}${k.when ? `, ${esc(k.when)}` : ''}</footer></blockquote>`).join('');
  words.hidden = false;
}

// ---------- Planners & closing photos ----------
$('#planners-img').src = safeUrl(PLANNERS_PHOTO);
if (safeUrl(CLOSING_PHOTO)) {
  const closing = $('#closing');
  new IntersectionObserver(([e], obs) => { if (e.isIntersecting) { closing.style.backgroundImage = `url("${CLOSING_PHOTO}")`; obs.disconnect(); } }, { rootMargin: '400px' }).observe(closing);
}
const wa = String(CFG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
const waText = encodeURIComponent('Hello Glaz Studios, I would like to talk about working together.');
$('#planners-cta').innerHTML = [
  wa ? `<a class="btn solid" href="https://wa.me/${wa}?text=${waText}" target="_blank" rel="noopener">Message us on WhatsApp</a>` : '',
  LINKS.email ? `<a class="btn ${wa ? 'line' : 'solid'}" href="mailto:${esc(LINKS.email)}?subject=${encodeURIComponent('Working together')}">Email ${esc(LINKS.email)}</a>` : '',
].join('');

// ---------- Footer ----------
$('#foot-links').innerHTML = [
  LINKS.instagram && safeUrl(LINKS.instagram) ? `<a href="${esc(LINKS.instagram)}" target="_blank" rel="noopener">Instagram</a>` : '',
  wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : '',
  LINKS.email ? `<a href="mailto:${esc(LINKS.email)}">${esc(LINKS.email)}</a>` : '',
  '<a href="/book">Check your date</a>',
].join('');
