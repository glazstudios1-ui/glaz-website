// Glaz Studios — the chat on the website. Add to any page: <script src="chat.js" defer></script>
// It talks to /api/chat (see api/chat.js). The conversation is kept while the visitor browses the site.
(() => {
  if (window.__glazChat) return; window.__glazChat = true;
  const KEY = 'glaz_chat_v1';
  const GREETING = 'Hi! I’m the Glaz Studios assistant. Ask me anything about our photography, films or how booking works. Arabic is welcome too.';
  const STARTERS = ['What do you offer?', 'How does booking work?', 'Prices for my wedding', 'Do you travel outside Cairo?'];

  const css = `
  .gc-btn { position: fixed; z-index: 80; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 10px; padding: 13px 18px; border-radius: 999px; border: 1px solid rgba(232,220,194,.55); background: rgba(0,0,0,.82); color: #E8DCC2; font: 500 13px/1 'Barlow Condensed', 'Arial Narrow', sans-serif; letter-spacing: .25em; cursor: pointer; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); box-shadow: 0 10px 30px rgba(0,0,0,.5); }
  .gc-btn:hover { background: #000; border-color: #E8DCC2; }
  .gc-btn i { width: 7px; height: 7px; border-radius: 50%; background: #E8DCC2; }
  .gc-open .gc-btn { display: none; }
  .gc { position: fixed; z-index: 81; right: max(16px, env(safe-area-inset-right)); bottom: max(16px, env(safe-area-inset-bottom)); width: min(400px, calc(100vw - 32px)); height: min(620px, calc(100dvh - 32px)); display: none; flex-direction: column; background: #0C0C0B; color: #D8D2C7; border: 1px solid rgba(216,210,199,.18); box-shadow: 0 30px 80px rgba(0,0,0,.7); font: 300 15px/1.55 'Barlow', system-ui, sans-serif; }
  .gc-open .gc { display: flex; }
  .gc-h { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; border-bottom: 1px solid rgba(216,210,199,.14); }
  .gc-h b { display: block; font: 400 13px/1 'Bodoni Moda', Didot, serif; letter-spacing: .45em; color: #E8DCC2; font-weight: 400; }
  .gc-h small { display: block; margin-top: 6px; font-size: 12px; color: #8A847B; }
  .gc-x { background: none; border: 0; color: #D8D2C7; font: 400 13px 'Barlow Condensed', sans-serif; letter-spacing: .2em; cursor: pointer; padding: 8px 0; }
  .gc-log { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 12px; overscroll-behavior: contain; }
  .gc-m { max-width: 86%; padding: 11px 14px; white-space: pre-wrap; overflow-wrap: anywhere; }
  .gc-m.a { align-self: flex-start; background: #161615; border: 1px solid rgba(216,210,199,.1); }
  .gc-m.u { align-self: flex-end; background: #E8DCC2; color: #111; }
  .gc-m a { color: inherit; text-decoration: underline; text-underline-offset: 3px; }
  .gc-m[dir="rtl"] { text-align: right; }
  .gc-note { align-self: center; font: 400 12px/1.4 'Barlow Condensed', sans-serif; letter-spacing: .12em; color: #8A847B; text-align: center; padding: 2px 10px; }
  .gc-note.ok { color: #A9C9A4; }
  .gc-typing { align-self: flex-start; color: #8A847B; font-size: 13px; padding: 4px 2px; }
  .gc-typing span { animation: gcb 1.2s infinite; } .gc-typing span:nth-child(2) { animation-delay: .2s; } .gc-typing span:nth-child(3) { animation-delay: .4s; }
  @keyframes gcb { 0%, 80%, 100% { opacity: .2; } 40% { opacity: 1; } }
  .gc-chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 18px 12px; }
  .gc-chips button { background: none; border: 1px solid rgba(216,210,199,.25); color: #D8D2C7; padding: 8px 12px; border-radius: 999px; font: 400 13px 'Barlow', sans-serif; cursor: pointer; }
  .gc-chips button:hover { border-color: #E8DCC2; color: #E8DCC2; }
  .gc-f { display: flex; gap: 8px; padding: 12px; border-top: 1px solid rgba(216,210,199,.14); }
  .gc-f textarea { flex: 1; resize: none; min-height: 44px; max-height: 120px; padding: 11px 12px; background: #000; color: #D8D2C7; border: 1px solid rgba(216,210,199,.2); font: 300 16px/1.4 'Barlow', system-ui, sans-serif; }
  .gc-f textarea:focus { outline: 1px solid #E8DCC2; }
  .gc-f button { padding: 0 16px; background: #E8DCC2; color: #000; border: 0; font: 500 13px 'Barlow Condensed', sans-serif; letter-spacing: .2em; cursor: pointer; }
  .gc-f button:disabled { opacity: .45; cursor: default; }
  @media (max-width: 560px) { .gc { inset: 0; width: 100%; height: 100dvh; border: 0; } .gc-btn { bottom: max(14px, env(safe-area-inset-bottom)); } }
  @media (prefers-reduced-motion: reduce) { .gc-typing span { animation: none; } }`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  const wrap = document.createElement('div');
  wrap.innerHTML = `<button class="gc-btn" type="button" aria-haspopup="dialog"><i aria-hidden="true"></i>ASK US</button>
    <section class="gc" role="dialog" aria-label="Chat with Glaz Studios" aria-modal="false">
      <div class="gc-h"><div><b>GLAZ STUDIOS</b><small>Replies in a few seconds</small></div><button class="gc-x" type="button">CLOSE</button></div>
      <div class="gc-log" aria-live="polite"></div>
      <div class="gc-chips"></div>
      <form class="gc-f"><label class="gc-sr" style="position:absolute;left:-9999px" for="gc-in">Your message</label>
        <textarea id="gc-in" rows="1" maxlength="1500" placeholder="Write your message…"></textarea><button type="submit">SEND</button></form>
    </section>`;
  document.body.append(wrap);
  const $ = (s) => wrap.querySelector(s);
  const log = $('.gc-log'), input = $('textarea'), sendBtn = $('.gc-f button'), chips = $('.gc-chips');

  // Saved while the visitor moves between pages
  let state = { session: null, items: [], open: false };
  try { state = { ...state, ...JSON.parse(sessionStorage.getItem(KEY) || '{}') }; } catch (e) { /* private mode */ }
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const linkify = (s) => esc(s).replace(/\b[\w.+-]+@[\w-]+\.[\w.]+\b/g, (m) => `<a href="mailto:${m}">${m}</a>`).replace(/(^|\s)(\/book)\b/g, '$1<a href="/book">$2</a>');
  const rtl = (s) => /[؀-ۿ]/.test(s);
  function draw() {
    log.innerHTML = `<div class="gc-m a">${esc(GREETING)}</div>` + state.items.map((m) =>
      m.role === 'note' ? `<p class="gc-note ${m.ok ? 'ok' : ''}">${esc(m.text)}</p>`
        : `<div class="gc-m ${m.role === 'user' ? 'u' : 'a'}" dir="${rtl(m.text) ? 'rtl' : 'ltr'}">${linkify(m.text)}</div>`).join('');
    chips.innerHTML = state.items.length ? '' : STARTERS.map((s) => `<button type="button">${esc(s)}</button>`).join('');
    log.scrollTop = log.scrollHeight;
  }
  const setOpen = (on) => { state.open = on; save(); document.documentElement.classList.toggle('gc-open', on); if (on) { draw(); setTimeout(() => input.focus(), 50); } };
  $('.gc-btn').onclick = () => setOpen(true);
  $('.gc-x').onclick = () => setOpen(false);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && state.open) setOpen(false); });
  chips.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) ask(b.textContent); });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 120) + 'px'; });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('.gc-f').requestSubmit(); } });
  $('.gc-f').addEventListener('submit', (e) => { e.preventDefault(); ask(input.value); });

  // The brain: the real site calls /api/chat. A preview page can set window.GLAZ_CHAT_BRAIN instead.
  async function brain(message) {
    if (window.GLAZ_CHAT_BRAIN) return window.GLAZ_CHAT_BRAIN(message, state);
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: state.session, message, page: location.pathname }) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'The chat is having a problem.');
    return data;
  }
  let busy = false;
  async function ask(text) {
    text = String(text || '').trim(); if (!text || busy) return;
    busy = true; sendBtn.disabled = true; input.value = ''; input.style.height = '';
    state.items.push({ role: 'user', text }); draw();
    log.insertAdjacentHTML('beforeend', '<div class="gc-typing" aria-label="Writing"><span>●</span> <span>●</span> <span>●</span></div>'); log.scrollTop = log.scrollHeight;
    try {
      const out = await brain(text);
      if (out.session) state.session = out.session;
      state.items.push({ role: 'assistant', text: out.reply });
      if (out.saved && !state.items.some((m) => m.ok)) state.items.push({ role: 'note', ok: true, text: out.savedNote || 'Your details were sent to our team.' });
      (out.notes || []).forEach((t) => state.items.push({ role: 'note', text: t }));
    } catch (e) {
      state.items.push({ role: 'note', text: `${e.message || 'Something went wrong.'} You can also email info@glazstudios.com.` });
    }
    save(); busy = false; sendBtn.disabled = false; draw(); input.focus();
  }
  if (state.open) setOpen(true);
})();
