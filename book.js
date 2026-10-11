import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import * as CFG from './config.js';

// Read settings this way so an older config.js (missing a line) never breaks the page.
const { SUPABASE_URL, SUPABASE_KEY } = CFG;
const NOTIFY_EMAIL = CFG.NOTIFY_EMAIL || 'info@glazstudios.com';
const WHATSAPP_NUMBER = CFG.WHATSAPP_NUMBER || '';
// FormSubmit's private code for info@ (hides the real address from spammers).
const FORM_ID = CFG.FORM_ID || '614ae13f91cbeabd6e04a3e3819c5ae7';
// Everyone else who should get a copy of each request.
const NOTIFY_CC = CFG.NOTIFY_CC || 'peter@glazstudios.com';
const DASHBOARD_URL = 'https://glaz-dashboard.vercel.app/#/leads';

const DEMO = !SUPABASE_KEY || SUPABASE_KEY.startsWith('PASTE_');
const sb = DEMO ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const form = $('#booking');
const msg = $('#msg');
const loadedAt = Date.now();

// ---------- Language ----------
const EN = {
  eyebrow: 'Book your date',
  title: 'Let us keep your day<br>exactly as you lived it',
  lead: 'Send us the details of your event and our team will reach you on WhatsApp to confirm the date and help you choose the right package.',
  s1t: 'Send your request', s1d: 'Fill in the form in a minute.',
  s2t: 'We confirm with you', s2d: 'We talk on WhatsApp and agree on the date and package.',
  s3t: 'We lock the day', s3d: 'A 30% deposit secures your date; the balance is due on the event day.',
  sv1: 'Photography', sv2: 'Cinematography', sv3: 'Full Rec', sv4: 'Crane', sv5: 'Media coverage', sv6: 'Photo booth',
  formTitle: 'Booking request',
  fName: 'Groom & Bride', phName: 'e.g. Ahmed & Sara', fPhone: 'Mobile (WhatsApp)', fPhone2: 'Second mobile', fEmail: 'Email', fInsta: 'Instagram account', optional: '(optional)',
  fType: 'Event type', tWedding: 'Wedding', tEngagement: 'Engagement', tReligious: 'Religious Event', tDestination: 'Destination Event', tOther: 'Other',
  fDate: 'Event date', fVenue: 'Venue', phVenue: 'Hall, church or place – and the area',
  fPackage: 'Package you are interested in', pkgUnsure: 'Not sure yet',
  fSource: 'How did you hear about us?', choose: 'Choose', srcFriend: 'Someone I know',
  fMsg: 'Anything else', phMsg: 'Hours, specific services, anything you would like us to know',
  send: 'Send booking request', sending: 'Sending…',
  notesTitle: 'Important notes',
  n1: 'A <b>30%</b> deposit is required to secure your date.',
  n2: 'The date is only confirmed once the deposit is received.',
  n3: 'All photos will be delivered via a private <b>Online Gallery</b>.',
  n4: 'The photographer reserves the right to feature selected images on social media and portfolio.',
  n5: 'Events outside Cairo include a <b>transportation fee</b>, calculated based on the location.',
  eDepAmount: 'Please write the deposit amount you transferred.',
  eDepFile: 'Please upload the transfer screenshot.',
  eDepType: 'Please upload an image or a PDF.',
  eDepSize: 'The file is too large (max 5 MB).',
  agree: 'I have read and agree to the notes above',
  eAgree: 'Please confirm you agree to the notes.', eType: 'Please choose the event type.', eVenue: 'Please write the venue.',
  doneTitle: 'We got your request', doneText: 'Thank you! We will reach you on WhatsApp soon to confirm the date and details.',
  waBtn: 'Message us on WhatsApp', again: 'Send another request',
  eName: 'Please write the groom & bride names.', ePhone: 'Please write a valid mobile number, e.g. 01012345678.',
  eEmail: 'Please write a valid email.', eDate: 'Please choose a date from today onward.',
  eSend: 'Something went wrong and the request was not sent. Please try again, or email us at ',
};

// The website is English only.
const lang = 'en';
const t = (k) => EN[k] ?? k;
document.documentElement.lang = 'en';
document.documentElement.dir = 'ltr';
document.title = 'Book your date — Glaz Studios';

// ---------- Transportation hint ----------
const travelHint = $('#travel-hint');
const syncTravel = () => { travelHint.hidden = form.event_type.value !== 'Destination Event'; };
form.event_type.addEventListener('change', syncTravel);

// ---------- Setup ----------
const pad = (n) => String(n).padStart(2, '0');
const now = new Date();
const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
form.event_date.min = todayStr;
$('#yr').textContent = now.getFullYear();

// Pre-select a package from the link, e.g. /book?package=Gold
const wantedPkg = new URLSearchParams(location.search).get('package');

async function loadPackages() {
  if (DEMO) return addPackages(['Silver', 'Gold', 'Platinum']);
  const { data, error } = await sb.from('packages').select('name').eq('active', true).order('sort_order');
  if (!error && data?.length) addPackages(data.map((p) => p.name));
}
function addPackages(names) {
  const sel = $('#packages');
  names.forEach((n) => sel.add(new Option(n, n)));
  if (wantedPkg) {
    const hit = names.find((n) => n.toLowerCase() === wantedPkg.toLowerCase());
    if (hit) sel.value = hit;
  }
}

if (WHATSAPP_NUMBER) $('#wa').hidden = false;

// ---------- Validation ----------
function normPhone(raw) {
  let p = raw.replace(/[\s\-().]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (/^(\+20|0020)1[0125]\d{8}$/.test(p)) p = '0' + p.replace(/^(\+20|0020)/, '');
  if (/^01[0125]\d{8}$/.test(p)) return p;            // Egyptian mobile
  if (/^\+\d{8,15}$/.test(p)) return p;                // international
  return null;
}

function setErr(name, key) {
  const box = $(`[data-err="${name}"]`);
  const input = form.elements[name];
  if (box) { box.dataset.key = key || ''; box.textContent = key ? t(key) : ''; }
  (input?.closest?.('.agree') || input)?.classList.toggle('invalid', !!key);
}

function normInsta(raw) {
  const u = String(raw || '').trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@+/, '');
  return u ? '@' + u : '';
}

function validate() {
  const v = Object.fromEntries(new FormData(form));
  let ok = true;
  const name = v.full_name.trim();
  if (name.length < 2) { setErr('full_name', 'eName'); ok = false; } else setErr('full_name');
  if (!v.event_type) { setErr('event_type', 'eType'); ok = false; } else setErr('event_type');
  if (!v.event_date || v.event_date < todayStr) { setErr('event_date', 'eDate'); ok = false; } else setErr('event_date');
  const venue = v.venue.trim();
  if (venue.length < 2) { setErr('venue', 'eVenue'); ok = false; } else setErr('venue');
  const phone = normPhone(v.phone);
  if (!phone) { setErr('phone', 'ePhone'); ok = false; } else setErr('phone');
  const phone2 = v.phone2.trim() ? normPhone(v.phone2) : '';
  if (phone2 === null) { setErr('phone2', 'ePhone'); ok = false; } else setErr('phone2');
  const email = v.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr('email', 'eEmail'); ok = false; } else setErr('email');
  if (!form.agree.checked) { setErr('agree', 'eAgree'); ok = false; } else setErr('agree');
  const depAmount = v.deposit_amount ? Math.round(Number(v.deposit_amount)) : 0;
  const depFile = form.deposit_file.files[0] || null;
  setErr('deposit_amount'); setErr('deposit_file');
  if (depFile) {
    if (!/^image\/|^application\/pdf$/.test(depFile.type || '') && !/\.(heic|heif|jpe?g|png|webp|pdf)$/i.test(depFile.name)) { setErr('deposit_file', 'eDepType'); ok = false; }
    else if (depFile.size > 5 * 1024 * 1024) { setErr('deposit_file', 'eDepSize'); ok = false; }
    if (!(depAmount > 0)) { setErr('deposit_amount', 'eDepAmount'); ok = false; }
  } else if (depAmount > 0) { setErr('deposit_file', 'eDepFile'); ok = false; }
  return ok ? { ...v, full_name: name, venue, phone, phone2, email, instagram: normInsta(v.instagram), depAmount, depFile } : null;
}
form.addEventListener('input', (e) => {
  const box = e.target.closest('.agree') || e.target;
  if (box.classList.contains('invalid')) setErr(e.target.name);
});
form.addEventListener('change', (e) => { if (e.target.name === 'agree' && e.target.checked) setErr('agree'); });

// ---------- Submit ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = ''; msg.className = 'msg';
  const v = validate();
  if (!v) { form.querySelector('.invalid')?.focus(); return; }
  // spam trap: only bots fill this hidden field, or submit in under 2 seconds
  if (v.gz_hp_x9 || Date.now() - loadedAt < 2000) { console.warn('[spam trap] request not sent'); return showDone(v); }

  const btn = $('#submit');
  btn.disabled = true; btn.firstElementChild.textContent = t('sending');

  // Upload the deposit screenshot first (private folder — only admins can open it)
  let depPath = null, depUploadFailed = false;
  if (v.depFile && !DEMO) {
    const ext = ((v.depFile.name.match(/\.([a-z0-9]+)$/i) || [])[1] || 'jpg').toLowerCase();
    const path = `${v.event_date}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const up = await sb.storage.from('deposits').upload(path, v.depFile, { contentType: v.depFile.type || undefined, upsert: false });
    if (up.error) { depUploadFailed = true; console.error('Deposit upload failed', up.error); } else depPath = path;
  }
  const depLine = v.depAmount > 0
    ? `Deposit: ${v.depAmount.toLocaleString('en-US')} EGP — ${depPath ? 'screenshot uploaded' : depUploadFailed ? 'screenshot upload FAILED, ask client to resend' : 'screenshot attached'}`
    : '';
  const travel = v.event_type === 'Destination Event';

  const extra = [
    depLine,
    travel && '🚗 Outside Cairo — add transportation',
    v.phone2 && `Phone 2: ${v.phone2}`,
    v.instagram && `Instagram: ${v.instagram}`,
    v.message.trim(),
    v.source && `— Heard via: ${v.source}`,
  ].filter(Boolean).join('\n');
  const lead = {
    full_name: v.full_name,
    phone: v.phone,
    phone2: v.phone2 || null,
    instagram: v.instagram || null,
    email: v.email,
    event_date: v.event_date,
    event_type: v.event_type,
    venue: v.venue,
    package_interest: v.package_interest || null,
    deposit_amount: v.depAmount > 0 ? v.depAmount : null,
    deposit_screenshot: depPath,
    message: extra || null,
  };

  let saved = false, mailed = false;
  if (DEMO) {
    await new Promise((r) => setTimeout(r, 700));
    console.info('[demo mode] would send:', lead);
    saved = true;
  } else {
    const [db, mail] = await Promise.allSettled([
      sb.from('leads').insert(lead).then((r) => {
        // If 06_leads_extra.sql hasn't been run yet, save without the new columns (they're still in the message)
        if (r.error && /phone2|instagram|deposit|column/i.test(r.error.message || '')) {
          const { phone2, instagram, deposit_amount, deposit_screenshot, ...rest } = lead;
          return sb.from('leads').insert(rest);
        }
        return r;
      }),
      fetch(`https://formsubmit.co/ajax/${FORM_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `New booking request — ${lead.full_name} — ${lead.event_date}`,
          _template: 'table', _captcha: 'false',
          _cc: NOTIFY_CC,
          ...(lead.email ? { _replyto: lead.email } : {}),
          'Groom & Bride': lead.full_name,
          'Mobile': lead.phone,
          'Mobile 2': lead.phone2 || '—',
          'Instagram': lead.instagram ? `https://instagram.com/${lead.instagram.slice(1)}` : '—',
          'WhatsApp client': `https://wa.me/${lead.phone.replace(/^0/, '20').replace(/^\+/, '')}`,
          'Event type': lead.event_type,
          'Event date': lead.event_date,
          'Venue': lead.venue || '—',
          'Package': lead.package_interest || 'Not sure yet',
          'Deposit': depLine ? depLine.replace(/^Deposit: /, '') : 'Not paid yet',
          'Transportation': travel ? 'YES — event outside Cairo' : '—',
          'Agreed to notes': 'Yes ✓ (30% deposit – Online Gallery – social media use)',
          'Email': lead.email || '—',
          'Details': v.message.trim() || '—',
          'Heard about us via': v.source || '—',
          'Open in dashboard': DASHBOARD_URL,
        }),
      }).then((r) => r.ok),
    ]);
    saved = db.status === 'fulfilled' && !db.value.error;
    mailed = mail.status === 'fulfilled' && mail.value === true;
    if (!saved) console.error('Supabase insert failed', db.reason || db.value?.error);
  }

  btn.disabled = false; btn.firstElementChild.textContent = t('send');
  if (saved || mailed) return showDone(lead);
  msg.className = 'msg err';
  msg.innerHTML = `${t('eSend')}<a href="mailto:${NOTIFY_EMAIL}" dir="ltr">${NOTIFY_EMAIL}</a>`;
});

function showDone(lead) {
  if (WHATSAPP_NUMBER) {
    const text = `Hi Glaz Studios, this is ${lead.full_name}. I just sent a booking request for ${lead.event_date}.`;
    $('#wa').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }
  form.hidden = true;
  $('#done').hidden = false;
  $('#done').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

$('#again').addEventListener('click', () => {
  form.reset();
  syncTravel();
  $('#done').hidden = true;
  form.hidden = false;
});

loadPackages();
