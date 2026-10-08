import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY, NOTIFY_EMAIL, WHATSAPP_NUMBER } from './config.js';

const DEMO = !SUPABASE_KEY || SUPABASE_KEY.startsWith('PASTE_');
const sb = DEMO ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const form = $('#booking');
const msg = $('#msg');

// ---------- Language ----------
const EN = {
  eyebrow: 'Book your date',
  title: 'Let us keep your day<br>exactly as you lived it',
  lead: 'Send us the details of your event and our team will reach you on WhatsApp to confirm the date and help you choose the right package.',
  s1t: 'Send your request', s1d: 'Fill in the form in a minute.',
  s2t: 'We confirm with you', s2d: 'We talk on WhatsApp and agree on the date and package.',
  s3t: 'We lock the day', s3d: 'A deposit via InstaPay secures your date; the balance is due on the event day.',
  sv1: 'Photography', sv2: 'Cinematography', sv3: 'Full Rec', sv4: 'Crane', sv5: 'Media coverage', sv6: 'Photo booth',
  formTitle: 'Booking request',
  fName: 'Full name', fPhone: 'Mobile (WhatsApp)', fEmail: 'Email', optional: '(optional)',
  fType: 'Event type', tWedding: 'Wedding', tEngagement: 'Engagement', tKatb: 'Katb Ketab', tSession: 'Session', tOther: 'Other',
  fDate: 'Event date', fVenue: 'Venue / area', phVenue: 'e.g. … Hall – New Cairo',
  fPackage: 'Package you are interested in', pkgUnsure: 'Not sure yet',
  fSource: 'How did you hear about us?', choose: 'Choose', srcFriend: 'Someone I know',
  fMsg: 'Anything else', phMsg: 'Hours, specific services, anything you would like us to know',
  send: 'Send booking request', sending: 'Sending…',
  note: 'Sending a request does not book the date. The date is secured once we confirm with you and receive the deposit.',
  doneTitle: 'We got your request', doneText: 'Thank you! We will reach you on WhatsApp soon to confirm the date and details.',
  waBtn: 'Message us on WhatsApp', again: 'Send another request',
  eName: 'Please write your name.', ePhone: 'Please write a valid mobile number, e.g. 01012345678.',
  eEmail: 'This email does not look right.', eDate: 'Please choose a date from today onward.',
  eSend: 'Something went wrong and the request was not sent. Please try again, or email us at ',
  langBtn: 'العربية',
};
const AR = {};
$$('[data-i18n]').forEach((el) => { AR[el.dataset.i18n] = el.innerHTML.trim(); });
$$('[data-i18n-ph]').forEach((el) => { AR[el.dataset.i18nPh] = el.placeholder; });
Object.assign(AR, {
  sending: 'جاري الإرسال…',
  eName: 'اكتب اسمك من فضلك.', ePhone: 'اكتب رقم موبايل صحيح، مثلاً 01012345678.',
  eEmail: 'الإيميل ده شكله مش مظبوط.', eDate: 'اختار تاريخ من النهارده وانت طالع.',
  eSend: 'حصلت مشكلة والطلب متبعتش. جرّب تاني، أو ابعتلنا على ',
  langBtn: 'English',
});

let lang = 'ar';
try { lang = localStorage.getItem('glaz-lang') || 'ar'; } catch { /* storage blocked: keep Arabic */ }
const t = (k) => (lang === 'en' ? EN : AR)[k] ?? k;

function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
  $('#lang').textContent = t('langBtn');
  document.title = lang === 'ar' ? 'احجز معادك — Glaz Studios' : 'Book your date — Glaz Studios';
  $$('.err').forEach((e) => { if (e.dataset.key) e.textContent = t(e.dataset.key); });
}
$('#lang').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  try { localStorage.setItem('glaz-lang', lang); } catch { /* ignore */ }
  applyLang();
});

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
  input?.classList.toggle('invalid', !!key);
}

function validate() {
  const v = Object.fromEntries(new FormData(form));
  let ok = true;
  const name = v.full_name.trim();
  if (name.length < 2) { setErr('full_name', 'eName'); ok = false; } else setErr('full_name');
  const phone = normPhone(v.phone);
  if (!phone) { setErr('phone', 'ePhone'); ok = false; } else setErr('phone');
  const email = v.email.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr('email', 'eEmail'); ok = false; } else setErr('email');
  if (!v.event_date || v.event_date < todayStr) { setErr('event_date', 'eDate'); ok = false; } else setErr('event_date');
  return ok ? { ...v, full_name: name, phone, email } : null;
}
form.addEventListener('input', (e) => { if (e.target.classList.contains('invalid')) setErr(e.target.name); });

// ---------- Submit ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = ''; msg.className = 'msg';
  const v = validate();
  if (!v) { form.querySelector('.invalid')?.focus(); return; }
  if (v.company) return showDone(v); // spam bot filled the hidden field: pretend success, send nothing

  const btn = $('#submit');
  btn.disabled = true; btn.firstElementChild.textContent = t('sending');

  const extra = [v.message.trim(), v.source && `— Heard via: ${v.source}`, lang === 'en' && '— Prefers English']
    .filter(Boolean).join('\n');
  const lead = {
    full_name: v.full_name,
    phone: v.phone,
    email: v.email || null,
    event_date: v.event_date,
    event_type: v.event_type,
    venue: v.venue.trim() || null,
    package_interest: v.package_interest || null,
    message: extra || null,
  };

  let saved = false, mailed = false;
  if (DEMO) {
    await new Promise((r) => setTimeout(r, 700));
    console.info('[demo mode] would send:', lead);
    saved = true;
  } else {
    const [db, mail] = await Promise.allSettled([
      sb.from('leads').insert(lead),
      fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `New booking request — ${lead.full_name} — ${lead.event_date}`,
          _template: 'table', _captcha: 'false',
          Name: lead.full_name, Mobile: lead.phone, Email: lead.email || '—',
          'Event type': lead.event_type, 'Event date': lead.event_date, Venue: lead.venue || '—',
          Package: lead.package_interest || 'Not sure', Message: lead.message || '—',
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
    const text = lang === 'ar'
      ? `أهلاً Glaz Studios، أنا ${lead.full_name} وبعت طلب حجز ليوم ${lead.event_date}.`
      : `Hi Glaz Studios, I'm ${lead.full_name} and I just sent a booking request for ${lead.event_date}.`;
    $('#wa').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  }
  form.hidden = true;
  $('#done').hidden = false;
  $('#done').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

$('#again').addEventListener('click', () => {
  form.reset();
  $('#done').hidden = true;
  form.hidden = false;
});

applyLang();
loadPackages();
