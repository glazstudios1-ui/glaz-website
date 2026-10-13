import { HERO, WEDDINGS, FILMS, PLANNERS_PHOTO, KIND_WORDS, LINKS } from './home-media.js';
import * as CFG from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (u) => (/^(https?:|mailto:|\/|media\/)/i.test(String(u || '')) ? String(u) : '');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

// ---------- The eye opening (first visit of the session only) ----------
if (root.classList.contains('opening')) {
  setTimeout(() => {
    root.classList.remove('opening');
    try { sessionStorage.setItem('glaz-eye', '1'); } catch (e) { /* private mode */ }
  }, 3200);
}

// ---------- Hero film ----------
const hero = $('.hero');
const film = $('#hero-film');
const toggle = $('#film-toggle');
hero.style.backgroundImage = `url("${HERO.poster}")`;
film.poster = HERO.poster;
if (HERO.video && !reduced) {
  film.src = HERO.video;
  film.addEventListener('playing', () => { toggle.hidden = false; }, { once: true });
  film.addEventListener('error', () => film.remove());
} else {
  film.removeAttribute('autoplay');
}
toggle.addEventListener('click', () => {
  if (film.paused) { film.play(); toggle.classList.remove('paused'); toggle.setAttribute('aria-label', 'Pause the film'); }
  else { film.pause(); toggle.classList.add('paused'); toggle.setAttribute('aria-label', 'Play the film'); }
});
// Don't spend battery on a film nobody is looking at
new IntersectionObserver(([e]) => {
  if (!film.isConnected || toggle.classList.contains('paused')) return;
  e.isIntersecting ? film.play().catch(() => {}) : film.pause();
}).observe(hero);

// ---------- Navigation ----------
const nav = $('#nav');
new IntersectionObserver(([e]) => nav.classList.toggle('solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
const menuBtn = $('#menu-btn'), menu = $('#menu');
const setMenu = (open) => { menu.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; };
menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });

// A photo that is not uploaded yet shows a quiet striped frame instead of a broken image
const markMissing = (img, label) => {
  const box = img.parentElement;
  img.addEventListener('error', () => { box.classList.add('missing'); box.dataset.missing = label; }, { once: true });
};

// ---------- Recent weddings ----------
const mosaic = $('#mosaic');
mosaic.innerHTML = WEDDINGS.slice(0, 6).map((w, i) => `
  <button class="tile t${i + 1}" data-w="${i}" aria-label="Open the wedding of ${esc(w.names)}">
    <img src="${esc(safeUrl(w.cover))}" alt="${esc(w.names)}, ${esc(w.place)}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async">
    <span class="cap"><strong>${esc(w.names)}</strong><span>${esc(w.place)}, ${esc(w.year)}</span></span>
  </button>`).join('');
mosaic.querySelectorAll('img').forEach((img) => markMissing(img, 'Photo coming soon'));
mosaic.addEventListener('click', (e) => { const t = e.target.closest('[data-w]'); if (t) openStory(WEDDINGS[t.dataset.w], t); });

// ---------- One wedding, full screen ----------
const story = $('#story'), track = $('#story-track'), count = $('#story-count');
let opener = null;
function openStory(w, from) {
  opener = from;
  const photos = [w.cover, ...(w.photos || [])].map(safeUrl).filter(Boolean);
  $('#story-title').textContent = w.names;
  $('#story-place').textContent = `${w.place}, ${w.year}`;
  track.innerHTML = photos.map((p, i) => `<figure><img src="${esc(p)}" alt="${esc(w.names)}, photo ${i + 1} of ${photos.length}" loading="${i < 2 ? 'eager' : 'lazy'}"></figure>`).join('');
  track.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => { img.closest('figure')?.remove(); updateCount(); }, { once: true }));
  story.showModal();
  track.scrollLeft = 0;
  track.focus({ preventScroll: true });
  updateCount();
}
const current = () => Math.round(track.scrollLeft / track.clientWidth);
function updateCount() { const n = track.children.length; count.textContent = n ? `${Math.min(current() + 1, n)} / ${n}` : ''; }
const go = (d) => track.scrollTo({ left: (current() + d) * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
track.addEventListener('scroll', () => requestAnimationFrame(updateCount), { passive: true });
$('#story-prev').addEventListener('click', () => go(-1));
$('#story-next').addEventListener('click', () => go(1));
story.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
story.querySelector('[data-close]').addEventListener('click', () => story.close());
story.addEventListener('close', () => { track.innerHTML = ''; opener?.focus(); });

// ---------- Films (YouTube loads only when someone presses play) ----------
const filmGrid = $('#film-grid');
const playIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>';
const ytId = (v) => (String(v || '').match(/^[\w-]{6,20}$/) || [])[0] || '';
filmGrid.innerHTML = FILMS.slice(0, 3).map((f, i) => {
  const id = ytId(f.youtube);
  const poster = safeUrl(f.poster) || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '');
  return `<div class="film">
    ${poster ? `<img src="${esc(poster)}" alt="" loading="lazy">` : ''}
    ${id ? '' : '<span class="soon">Film coming soon</span>'}
    <button data-film="${i}" ${id ? '' : 'disabled'} aria-label="Play ${esc(f.title)}, ${esc(f.couple)}">
      <span class="play">${playIcon}</span>
      <span class="label"><strong>${esc(f.couple)}</strong><span>${esc(f.title)}</span></span>
    </button></div>`;
}).join('');
filmGrid.querySelectorAll('.film img').forEach((img) => markMissing(img, ''));
filmGrid.addEventListener('click', (e) => {
  const b = e.target.closest('[data-film]');
  if (!b || b.disabled) return;
  const id = ytId(FILMS[b.dataset.film].youtube);
  const box = b.parentElement;
  box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1" title="${esc(FILMS[b.dataset.film].title)}"
    allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  if (!film.paused) { film.pause(); }
});

// ---------- Kind words (only real ones) ----------
if (KIND_WORDS.length) {
  const words = $('#words');
  words.innerHTML = KIND_WORDS.slice(0, 3).map((k) => `<blockquote><p>“${esc(k.text)}”</p><footer>${esc(k.who)}${k.when ? `, ${esc(k.when)}` : ''}</footer></blockquote>`).join('');
  words.hidden = false;
}

// ---------- Planners & venues ----------
const pImg = $('#planners-img');
pImg.src = safeUrl(PLANNERS_PHOTO);
markMissing(pImg, '');
const wa = String(CFG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
const waText = encodeURIComponent('Hello Glaz Studios, I would like to talk about working together.');
$('#planners-cta').innerHTML = [
  wa ? `<a class="btn gold" href="https://wa.me/${wa}?text=${waText}" target="_blank" rel="noopener">Message us on WhatsApp</a>` : '',
  LINKS.email ? `<a class="btn ${wa ? 'ghost' : 'gold'}" href="mailto:${esc(LINKS.email)}?subject=${encodeURIComponent('Working together')}">Email ${esc(LINKS.email)}</a>` : '',
].join('');

// ---------- Footer ----------
$('#foot-links').innerHTML = [
  LINKS.instagram && safeUrl(LINKS.instagram) ? `<a href="${esc(LINKS.instagram)}" target="_blank" rel="noopener">Instagram</a>` : '',
  wa ? `<a href="https://wa.me/${wa}" target="_blank" rel="noopener">WhatsApp</a>` : '',
  LINKS.email ? `<a href="mailto:${esc(LINKS.email)}">${esc(LINKS.email)}</a>` : '',
  '<a href="/book">Check your date</a>',
].join('');
