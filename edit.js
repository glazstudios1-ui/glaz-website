// Glaz website — editing on the page itself.
// Loaded only inside Dashboard → Website (the page is opened there with ?preview=1).
// Click a text to type on it, click a photo to replace it, drag a floating photo to move it,
// drag its corner to change its size. Every change is sent to the dashboard; visitors see
// nothing until Publish is pressed there.
export default function start(api) {
  const { EDIT, phoneMQ } = api;
  if (EDIT.on) return;
  EDIT.on = true;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const send = (m) => parent.postMessage(m, api.origin);
  const root = document.documentElement;
  root.classList.add('ge');

  const css = document.createElement('style');
  css.textContent = `
  html.ge [data-k], html.ge [data-img], html.ge [data-media], html.ge #hero { cursor: pointer; }
  html.ge [data-k][contenteditable] { cursor: text; outline: 2px solid #3D8BFD !important; outline-offset: 4px; caret-color: #3D8BFD; -webkit-user-select: text; user-select: text; }
  html.ge .ge-hov { outline: 1px dashed #3D8BFD !important; outline-offset: 3px; }
  html.ge .ge-sel { outline: 2px solid #3D8BFD !important; outline-offset: 3px; }
  html.ge #hero.ge-hov, html.ge #hero.ge-sel { outline-offset: -6px; }
  html.ge [data-box] { touch-action: none; }
  html.ge [data-box].ge-sel { cursor: move; }
  html.ge .ge-drag, html.ge .ge-drag * { cursor: grabbing !important; user-select: none; }
  #ge-tag, #ge-bar, #ge-h { position: fixed; z-index: 2147483000; font: 500 11px/1 -apple-system, system-ui, sans-serif; letter-spacing: .02em; }
  #ge-tag { background: #3D8BFD; color: #fff; padding: 4px 7px; border-radius: 3px; pointer-events: none; text-transform: none; }
  #ge-bar { display: flex; gap: 2px; background: #1C1C1E; padding: 4px; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.35); }
  #ge-bar button { all: unset; color: #F2F2F2; padding: 8px 11px; border-radius: 5px; cursor: pointer; font: 500 12px/1 -apple-system, system-ui, sans-serif; white-space: nowrap; }
  #ge-bar button:hover { background: #3A3A3C; }
  #ge-bar .sz { color: #9A9A9E; padding: 8px 9px; font: 500 12px/1 -apple-system, system-ui, sans-serif; }
  #ge-h { width: 14px; height: 14px; background: #fff; border: 2px solid #3D8BFD; border-radius: 3px; cursor: nwse-resize; touch-action: none; }
  [hidden]#ge-tag, [hidden]#ge-bar, [hidden]#ge-h { display: none !important; }`;
  document.head.appendChild(css);
  const tag = Object.assign(document.createElement('div'), { id: 'ge-tag', hidden: true });
  const bar = Object.assign(document.createElement('div'), { id: 'ge-bar', hidden: true });
  const handle = Object.assign(document.createElement('div'), { id: 'ge-h', hidden: true, title: 'Drag to change the size' });
  document.body.append(tag, bar, handle);

  // ---------- what was clicked ----------
  const kindOf = (el) => {
    if (el.matches('[data-k]')) return el.closest('a') ? 'button' : 'text';
    if (el.matches('[data-box]')) return 'box';
    if (el.matches('[data-img], [data-media]')) { const m = el.matches('img') ? el : el.querySelector('img,video'); return m?.tagName === 'VIDEO' ? 'film' : 'photo'; }
    if (el.id === 'hero') return 'hero';
    return null;
  };
  const LABEL = { text: 'Text', button: 'Button', box: 'Photo — drag to move', photo: 'Photo', film: 'Film', hero: 'Opening slides' };
  function targetOf(t) {
    if (!(t instanceof Element) || t.closest('#ge-bar, #ge-h')) return null;
    const txt = t.closest('[data-k]');
    if (txt && !txt.closest('#sheet')) return txt;
    const box = t.closest('[data-box]'); if (box) return box;
    const img = t.closest('[data-img], [data-media]'); if (img) return img;
    // a photo under its words (doors, last photo): the words' block selects the photo
    const holder = t.closest('.door, .d-end'); if (holder) return holder.querySelector('[data-img]');
    if (t.closest('#hero') && !t.closest('.segs, #pause')) return document.getElementById('hero');
    return null;
  }
  const pathOf = (el) => el.dataset.k || el.dataset.img || el.dataset.media || el.querySelector('[data-img]')?.dataset.img || '';
  const linkOf = (el) => el.closest('[data-link]')?.dataset.link || '';
  const srcOf = (el) => { const m = el.matches('img,video') ? el : el.querySelector('img,video'); return m ? (m.getAttribute('src') || m.dataset.src || '') : ''; };

  // ---------- hover ----------
  let hov = null;
  document.addEventListener('mouseover', (e) => {
    if (drag) return;
    const el = targetOf(e.target);
    if (el === hov) return;
    hov?.classList.remove('ge-hov'); hov = el;
    if (!el || el === sel?.el) { tag.hidden = true; return; }
    el.classList.add('ge-hov');
    tag.textContent = LABEL[kindOf(el)] || '';
    tag.hidden = false; place();
  });

  // ---------- select ----------
  let sel = null;
  function select(el, info = true) {
    sel?.el.classList.remove('ge-sel');
    if (!el) { sel = null; bar.hidden = handle.hidden = true; if (info) send({ type: 'glaz-select', kind: null }); return; }
    const kind = kindOf(el);
    sel = { el, kind, path: pathOf(el), box: el.dataset.box || '', link: linkOf(el) };
    el.classList.remove('ge-hov'); el.classList.add('ge-sel'); tag.hidden = true;
    const btn = (act, label) => `<button type="button" data-act="${act}">${label}</button>`;
    bar.innerHTML = kind === 'text' || kind === 'button' ? btn('type', 'Edit text') + (sel.link ? btn('link', 'Link') : '')
      : kind === 'hero' ? btn('slides', 'Change slides')
      : btn('replace', kind === 'film' ? 'Replace film' : 'Replace photo') + (kind === 'box' ? `<span class="sz"></span>` : btn('focus', 'Focus'));
    bar.hidden = false; handle.hidden = kind !== 'box';
    place();
    if (info) send({ type: 'glaz-select', kind, path: sel.path, box: sel.box, link: sel.link, src: srcOf(el), phone: phoneMQ.matches, text: el.dataset.k ? el.textContent.trim() : '' });
  }
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]'); if (!b || !sel) return;
    if (b.dataset.act === 'type') return edit(sel.el);
    send({ type: 'glaz-act', act: b.dataset.act, path: sel.path, box: sel.box, link: sel.link, kind: sel.kind });
  });

  // ---------- typing on the page ----------
  let editing = null;
  function edit(el, x, y) {
    if (editing === el) return;
    if (el.classList.contains('split')) el.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    el.contentEditable = 'plaintext-only';
    if (el.contentEditable !== 'plaintext-only') el.contentEditable = 'true';
    el.spellcheck = false;
    editing = el; el.focus();
    const r = x != null && document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
    const s = getSelection(); s.removeAllRanges();
    if (r && el.contains(r.startContainer)) s.addRange(r); else { const all = document.createRange(); all.selectNodeContents(el); all.collapse(false); s.addRange(all); }
    bar.hidden = true;
  }
  const textNow = (el) => el.textContent.replace(/\s+/g, ' ').trim();
  document.addEventListener('input', (e) => { if (editing && e.target === editing) send({ type: 'glaz-text', path: editing.dataset.k, value: textNow(editing) }); });
  document.addEventListener('keydown', (e) => {
    if (editing) {
      if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); editing.blur(); }
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); send({ type: 'glaz-key', key: e.shiftKey ? 'redo' : 'undo' }); }
    if (e.key === 'Escape') select(null);
  });
  document.addEventListener('paste', (e) => {
    if (!editing || editing.contentEditable === 'plaintext-only') return;
    e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData?.getData('text/plain') || '').replace(/\s+/g, ' '));
  });
  document.addEventListener('focusout', (e) => {
    if (e.target !== editing) return;
    const el = editing; editing = null;
    el.removeAttribute('contenteditable');
    if (!textNow(el)) { send({ type: 'glaz-text', path: el.dataset.k, value: '' }); }   // empty: the dashboard puts the starting words back
    if (el.classList.contains('split')) { api.drawTexts(); el.classList.add('in'); }
    if (sel?.el === el) { bar.hidden = false; place(); }
  });

  // ---------- clicks: nothing on the page leaves it ----------
  document.addEventListener('click', (e) => {
    if (e.target.closest('#ge-bar')) return;
    if (editing && editing.contains(e.target)) return;
    if (e.target.closest('.segs, #pause, #menu')) return;   // slideshow and phone menu still work
    e.preventDefault(); e.stopPropagation();
    if (moved) { moved = false; return; }
    const el = targetOf(e.target);
    if (!el) { if (editing) editing.blur(); return select(null); }
    if (el !== sel?.el) select(el);
    if (el.matches('[data-k]')) edit(el, e.clientX, e.clientY);
  }, true);

  // ---------- floating photos: move and size ----------
  let drag = null, moved = false;
  const keys = () => (phoneMQ.matches ? ['mx', 'my', 'mw'] : ['x', 'y', 'w']);
  const pct = (v) => `${Math.round(v * 10) / 10}%`;
  function startDrag(e, mode) {
    if (!sel || sel.kind !== 'box' || e.button) return;
    const el = sel.el, host = el.offsetParent;
    if (!host) return;
    e.preventDefault();
    drag = { mode, el, x0: e.clientX, y0: e.clientY, l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, W: host.clientWidth, H: host.clientHeight, went: false };
    root.classList.add('ge-drag');
  }
  function doDrag(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    if (!drag.went && Math.hypot(dx, dy) < 3) return;
    drag.went = true;
    const [kx, ky, kw] = keys(), el = drag.el;
    if (drag.mode === 'move') {
      const l = Math.min(Math.max(drag.l + dx, -drag.w * .5), drag.W - drag.w * .5), t = Math.max(drag.t + dy, -40);
      el.style.setProperty('--' + kx, pct(l / drag.W * 100)); el.style.setProperty('--' + ky, pct(t / drag.H * 100));
    } else {
      const w = Math.min(Math.max(drag.w + dx, 40), drag.W);
      el.style.setProperty('--' + kw, pct(w / drag.W * 100));
    }
    place();
  }
  function endDrag() {
    if (!drag) return;
    const d = drag; drag = null; root.classList.remove('ge-drag');
    if (!d.went) return;
    moved = true; setTimeout(() => { moved = false; }, 50);
    const [kx, ky, kw] = keys(), el = d.el, host = el.offsetParent;
    const vals = { [kx]: pct(el.offsetLeft / host.clientWidth * 100), [ky]: pct(el.offsetTop / host.clientHeight * 100), [kw]: pct(el.offsetWidth / host.clientWidth * 100) };
    send({ type: 'glaz-box', key: el.dataset.box, vals });
  }
  document.addEventListener('pointerdown', (e) => {
    const b = e.target instanceof Element && !e.target.closest('#ge-bar, #ge-h') ? e.target.closest('[data-box]') : null;
    if (!b || editing) return;
    if (sel?.el !== b) select(b);
    startDrag(e, 'move');
  }, true);
  handle.addEventListener('pointerdown', (e) => startDrag(e, 'size'));
  addEventListener('pointermove', doDrag);
  addEventListener('pointerup', endDrag);
  addEventListener('pointercancel', endDrag);

  // ---------- keep the toolbar next to the selection ----------
  function place() {
    if (hov && !tag.hidden) { const r = hov.getBoundingClientRect(); tag.style.left = Math.max(4, r.left) + 'px'; tag.style.top = Math.max(4, r.top - 24) + 'px'; }
    if (!sel) return;
    if (!sel.el.isConnected) { const again = find(sel); if (!again) return select(null, false); sel.el = again; again.classList.add('ge-sel'); }
    const r = sel.el.getBoundingClientRect();
    if (!bar.hidden) {
      const bw = bar.offsetWidth, bh = bar.offsetHeight;
      let top = r.top - bh - 10; if (top < 8) top = Math.min(r.bottom + 10, innerHeight - bh - 8);
      bar.style.left = Math.min(Math.max(8, r.left + r.width / 2 - bw / 2), innerWidth - bw - 8) + 'px'; bar.style.top = top + 'px';
      const sz = bar.querySelector('.sz'); if (sz && sel.el.offsetParent) sz.textContent = `${Math.round(sel.el.offsetWidth / sel.el.offsetParent.clientWidth * 100)}% wide`;
    }
    if (!handle.hidden) { handle.style.left = r.right - 8 + 'px'; handle.style.top = r.bottom - 8 + 'px'; }
  }
  addEventListener('scroll', () => requestAnimationFrame(place), { passive: true });
  addEventListener('resize', () => requestAnimationFrame(place));
  const find = (s) => s.kind === 'hero' ? document.getElementById('hero')
    : s.box ? document.querySelector(`[data-box="${CSS.escape(s.box)}"]`)
    : document.querySelector(`[data-k="${CSS.escape(s.path)}"], [data-img="${CSS.escape(s.path)}"], [data-media="${CSS.escape(s.path)}"]`);

  // after the page is drawn again (a change from the dashboard), keep the same thing selected
  EDIT.after = () => {
    if (!sel) return;
    const el = find(sel);
    if (!el) return select(null);
    if (el !== sel.el) { sel.el.classList.remove('ge-sel'); sel.el = el; }
    el.classList.add('ge-sel'); place();
  };
  EDIT.select = (s) => { const el = s ? find(s) : null; select(el, false); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); };
  send({ type: 'glaz-edit-on' });
}
