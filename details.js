import { $, $$, esc, fmtDate, fmtStamp, token, rpc, showError, splitCouple, MOMENTS, IG_ROLES } from './portal-common.js';

const app = $('#app');
let b = null;        // booking summary from the server
let dirty = false;

const field = (name, label, value, { type = 'text', hint = '', full = false, ph = '', dir = '' } = {}) => `
  <label class="field ${full ? 'full' : ''}"><span>${esc(label)}</span>${hint ? ` <i>${esc(hint)}</i>` : ''}
    <input name="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(ph)}" ${dir ? `dir="${dir}"` : ''}></label>`;

const timelineRow = (r = {}) => `<div class="row4" data-row="timeline">
  <input type="time" data-k="time" value="${esc(r.time)}" aria-label="Time">
  <input data-k="moment" value="${esc(r.moment)}" placeholder="Moment" aria-label="Moment">
  <input class="where" data-k="where" value="${esc(r.where)}" placeholder="Where" aria-label="Where">
  <input class="tl-notes" data-k="notes" value="${esc(r.notes)}" placeholder="Notes for us" aria-label="Notes">
  <button type="button" class="x" data-del aria-label="Remove">✕</button></div>`;

const igRow = (r = {}) => `<div class="row3" data-row="instagram">
  <input data-k="who" value="${esc(r.who)}" placeholder="Who (e.g. Makeup)" aria-label="Who">
  <input class="handle" data-k="handle" value="${esc(r.handle)}" placeholder="@instagram" dir="ltr" autocapitalize="off" spellcheck="false" aria-label="Instagram">
  <button type="button" class="x" data-del aria-label="Remove">✕</button></div>`;

function render() {
  const d = b.details || {};
  const [g, br] = splitCouple(b.client_name);
  const timeline = d.timeline?.length ? d.timeline : MOMENTS.map((m) => ({ moment: m }));
  const ig = d.instagram?.length ? d.instagram : IG_ROLES.map((w) => ({ who: w }));

  app.innerHTML = `
    <p class="eyebrow">Event day details</p>
    <h1>${esc(b.client_name)}</h1>
    <p class="muted">Fill in what you know now and press <b>Save</b>. You can come back to this same link and change anything until the event day — we always see the latest version.</p>

    <div class="summary">
      <div><small>Date</small><b>${fmtDate(b.event_date)}</b></div>
      <div><small>Event</small><b>${esc(b.event_type)}</b></div>
      <div><small>Package</small><b>${esc(b.package || '—')}</b></div>
      <div><small>Venue</small><b>${esc(b.venue || '—')}</b></div>
    </div>

    <form id="f" novalidate>
      <section class="card"><h2>1. The basics</h2><p class="lead-in">Who, where and when our team should arrive.</p>
        <div class="grid">
          ${field('groom', 'Groom name', d.groom ?? g)}
          ${field('bride', 'Bride name', d.bride ?? br)}
          ${field('venue', 'Venue name', d.venue ?? b.venue, { full: true })}
          ${field('maps', 'Venue location', d.maps, { hint: '(Google Maps link)', full: true, ph: 'Paste the pin link', dir: 'ltr' })}
          ${field('start', 'Coverage starts at', d.start, { type: 'time', hint: '(team arrives)' })}
          ${field('end', 'Coverage ends at', d.end, { type: 'time' })}
        </div>
        <p class="hours" id="hours"></p>
      </section>

      <section class="card"><h2>2. Contact on the day</h2><p class="lead-in">Someone (not the couple) our team can call on the day.</p>
        <div class="grid">
          ${field('contact_name', 'Name', d.contact_name)}
          ${field('contact_phone', 'Mobile', d.contact_phone, { type: 'tel', ph: '01X XXXX XXXX', dir: 'ltr' })}
        </div>
      </section>

      <section class="card"><h2>3. Getting ready</h2>
        <div class="grid">
          ${field('bride_place', 'Bride — place', d.bride_place, { ph: 'Home / hotel / salon + area' })}
          ${field('bride_time', 'Bride — time', d.bride_time, { type: 'time' })}
          ${field('groom_place', 'Groom — place', d.groom_place, { ph: 'Home / hotel + area' })}
          ${field('groom_time', 'Groom — time', d.groom_time, { type: 'time' })}
        </div>
      </section>

      <section class="card"><h2>4. The day, hour by hour</h2><p class="lead-in">Add the time next to each moment you have (fireworks, singer arriving, zaffa…). Remove what you don't need.</p>
        <div class="row4 rows-head"><span>Time</span><span>Moment</span><span>Where</span><span>Notes</span><span></span></div>
        <div class="rows" id="timeline">${timeline.map(timelineRow).join('')}</div>
        <button type="button" class="add" data-add="timeline">+ Add a moment</button>
      </section>

      <section class="card"><h2>5. Instagram accounts</h2><p class="lead-in">So we can tag everyone. Groom and bride first.</p>
        <div class="row3 rows-head"><span>Who</span><span>Instagram</span><span></span></div>
        <div class="rows" id="instagram">${ig.map(igRow).join('')}</div>
        <button type="button" class="add" data-add="instagram">+ Add someone</button>
      </section>

      <section class="card"><h2>6. Anything else</h2>
        <label class="field full"><span>Notes for our team</span><textarea name="notes" rows="4" placeholder="Special requests, family members to focus on, surprises…">${esc(d.notes)}</textarea></label>
      </section>
    </form>

    <div class="savebar"><div class="in">
      <span class="state" id="state">${b.details_updated ? `Last saved ${fmtStamp(b.details_updated)}` : 'Not saved yet'}</span>
      <button class="btn" id="save" type="button">Save</button></div></div>`;

  const f = $('#f');
  const hours = () => {
    const s = f.start.value, e = f.end.value;
    if (!s || !e) { $('#hours').innerHTML = ''; return; }
    const [sh, sm] = s.split(':').map(Number), [eh, em] = e.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm); if (mins <= 0) mins += 24 * 60;
    $('#hours').innerHTML = `Coverage: <b>${(mins / 60).toFixed(1).replace(/\.0$/, '')} hours</b>`;
  };
  hours();
  f.addEventListener('input', (e) => { dirty = true; setState(''); if (e.target.name === 'start' || e.target.name === 'end') hours(); });
  app.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      const list = $('#' + add.dataset.add);
      list.insertAdjacentHTML('beforeend', add.dataset.add === 'timeline' ? timelineRow() : igRow());
      list.lastElementChild.querySelector('input')?.focus();
      dirty = true; setState('');
    }
    const del = e.target.closest('[data-del]');
    if (del) { del.parentElement.remove(); dirty = true; setState(''); }
  });
  $('#save').addEventListener('click', save);
}

const collectRows = (id) => $$(`#${id} [data-row]`).map((row) => Object.fromEntries($$('input', row).map((i) => [i.dataset.k, i.value.trim()])))
  .filter((r) => Object.values(r).some(Boolean));

function setState(text, cls = '') {
  const el = $('#state');
  el.className = 'state ' + cls;
  el.textContent = text || 'Unsaved changes';
}

async function save() {
  const f = $('#f');
  const fd = Object.fromEntries(new FormData(f));
  for (const k in fd) fd[k] = String(fd[k]).trim();
  const data = { ...fd, timeline: collectRows('timeline'), instagram: collectRows('instagram') };
  data.timeline.sort((a, c) => (a.time || '99').localeCompare(c.time || '99'));
  const btn = $('#save');
  btn.disabled = true; setState('Saving…');
  try {
    const at = await rpc('portal_save_details', { p_token: token, p_data: data });
    dirty = false;
    setState(`Saved ✓ ${fmtStamp(at)}`, 'ok');
  } catch (err) {
    setState('Could not save — check your internet and try again', 'err');
  } finally { btn.disabled = false; }
}

window.addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

(async () => {
  if (!token) return showError();
  try {
    b = await rpc('portal_get', { p_token: token });
    if (!b) return showError();
    render();
    document.body.classList.add('ready');
  } catch (err) { showError('We could not load your details. Please try again in a minute.'); }
})();
