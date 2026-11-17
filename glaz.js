// Glaz Studios — shared behaviour for the About, FAQ and Booking pages:
// top bar, phone menu, reveal on scroll, and the black curtain between pages.
(() => {
  const root = document.documentElement, nav = document.getElementById('nav'), menu = document.getElementById('menu');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-yr]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // arriving from another page: lift the curtain
  if (root.classList.contains('arrive')) { requestAnimationFrame(() => root.classList.add('arrived', 'ready')); setTimeout(() => root.classList.remove('arrive', 'arrived'), 1400); }
  else requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));

  // top bar: solid after a little scroll, hides going down, comes back going up
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    nav.classList.toggle('solid', y > 40);
    if (!nav.classList.contains('open')) { if (y > lastY + 6 && y > 300) nav.classList.add('hide'); else if (y < lastY - 6 || y < 40) nav.classList.remove('hide'); }
    lastY = y;
  }, { passive: true });

  // phone menu
  const setMenu = (on) => { nav.classList.toggle('open', on); menu.setAttribute('aria-expanded', String(on)); document.getElementById('menu-t').textContent = on ? 'CLOSE' : 'MENU'; document.body.style.overflow = on ? 'hidden' : ''; if (on) nav.classList.remove('hide'); };
  menu.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // reveal on scroll
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal]').forEach((el) => (still ? el.classList.add('in') : io.observe(el)));

  // a soft black curtain between pages
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); if (!a || still) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || /^(mailto|tel):/.test(a.getAttribute('href'))) return;
    if (u.pathname === location.pathname && u.hash) return;
    e.preventDefault(); setMenu(false);
    try { sessionStorage.setItem('glaz-go', '1'); } catch {}
    root.classList.add('leaving');
    setTimeout(() => { location.href = u.href; }, 720);
  });
  addEventListener('pageshow', (e) => { if (e.persisted) root.classList.remove('leaving'); });
})();
