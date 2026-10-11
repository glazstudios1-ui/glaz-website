import { $, esc, fmtDate, fmtTime, token, rpc, showError, splitCouple } from './portal-common.js';

const app = $('#app');
const wa = (phone) => {
  let p = String(phone || '').replace(/\D/g, '');
  if (p.startsWith('0')) p = '20' + p.slice(1);
  return p ? `https://wa.me/${p}` : '';
};

function render(b) {
  const d = b.details || {};
  const [g, br] = splitCouple(b.client_name);
  const start = d.start || (b.start_time || '').slice(0, 5);
  const kv = (k, v) => v ? `<dt>${k}</dt><dd>${v}</dd>` : '';
  const timeline = (d.timeline || []).filter((r) => r.time || r.notes || r.where);

  app.innerHTML = `
    <p class="eyebrow">Crew day sheet</p>
    <h1>${esc(b.client_name)}</h1>
    <div class="summary">
      <div><small>Date</small><b>${fmtDate(b.event_date)}</b></div>
      <div><small>Event</small><b>${esc(b.event_type)}</b></div>
      <div><small>Package</small><b>${esc(b.package || '—')}</b></div>
      <div><small>Coverage</small><b>${start ? fmtTime(start) : '—'}${d.end ? ' – ' + fmtTime(d.end) : ''}</b></div>
    </div>

    ${b.details ? '' : '<p class="msg err" style="text-align:start">The client has not filled the event details yet. Check again before the event.</p>'}

    <section class="card"><h2>Where &amp; who</h2>
      <dl class="kv">
        ${kv('Groom', esc(d.groom || g))}
        ${kv('Bride', esc(d.bride || br))}
        ${kv('Venue', esc(d.venue || b.venue))}
        ${kv('Location', /^https?:\/\//i.test(d.maps || '') ? `<a href="${esc(d.maps)}" target="_blank" rel="noopener">Open in Google Maps ↗</a>` : esc(d.maps))}
        ${kv('Contact on the day', d.contact_name ? `${esc(d.contact_name)}${d.contact_phone ? ` · <a href="tel:${esc(d.contact_phone)}">${esc(d.contact_phone)}</a> · <a href="${wa(d.contact_phone)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}` : '')}
        ${kv('Bride getting ready', [esc(d.bride_place), d.bride_time ? fmtTime(d.bride_time) : ''].filter(Boolean).join(' · '))}
        ${kv('Groom getting ready', [esc(d.groom_place), d.groom_time ? fmtTime(d.groom_time) : ''].filter(Boolean).join(' · '))}
      </dl>
    </section>

    <section class="card"><h2>The day, hour by hour</h2>
      ${timeline.length ? `<table class="list"><thead><tr><th>Time</th><th>Moment</th><th>Where</th><th>Notes</th></tr></thead><tbody>
        ${timeline.map((r) => `<tr><td>${r.time ? fmtTime(r.time) : ''}</td><td>${esc(r.moment)}</td><td>${esc(r.where)}</td><td>${esc(r.notes)}</td></tr>`).join('')}
      </tbody></table>` : '<p class="muted">No timings yet.</p>'}
    </section>

    ${d.notes ? `<section class="card"><h2>Notes from the client</h2><p style="white-space:pre-wrap;margin:0">${esc(d.notes)}</p></section>` : ''}

    <section class="card"><h2>Crew</h2>
      ${(b.crew || []).length ? `<table class="list"><tbody>
        ${b.crew.map((m) => `<tr><td>${esc(m.role)}</td><td>${esc(m.name)}</td><td>${m.mobile ? `<a href="${wa(m.mobile)}" target="_blank" rel="noopener">${esc(m.mobile)}</a>` : ''}</td></tr>`).join('')}
      </tbody></table>` : '<p class="muted">Crew not assigned yet.</p>'}
    </section>
    <p class="muted center" style="font-size:12px">This page always shows the latest details. Open it again on the day.</p>`;
}

(async () => {
  if (!token) return showError();
  try {
    const b = await rpc('crew_get', { p_token: token });
    if (!b) return showError('This day sheet link is not valid. Ask John or Peter for the right link.');
    render(b);
    document.body.classList.add('ready');
  } catch (err) { showError('Could not load the day sheet. Try again in a minute.'); }
})();
