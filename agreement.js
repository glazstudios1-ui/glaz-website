import { $, esc, fmtStamp, token, rpc, showError } from './portal-common.js';
import { VERSION, agreementHTML } from './agreement-text.js';

const app = $('#app');

function render(b) {
  const signed = b.agreement;
  // Once signed, always show the exact text the client agreed to
  const termsHTML = signed ? signed.terms : agreementHTML(b);

  app.innerHTML = `
    <p class="eyebrow">Agreement</p>
    <h1>Photography &amp; video agreement</h1>
    ${signed ? `<div class="signed"><b>✓ Signed</b> by ${esc(signed.full_name)} on ${fmtStamp(signed.accepted_at)}.
      <button class="link no-print" id="print" type="button" style="display:inline;margin:0 0 0 8px">Print / save as PDF</button></div>`
      : '<p class="muted">Please read the agreement, then sign at the bottom. It takes a minute.</p>'}

    <section class="card terms" id="terms">${termsHTML}</section>

    ${signed ? '' : `<section class="card no-print" id="sign-card"><h2>Sign</h2>
      <form id="sign" novalidate>
        <div class="sign-grid">
          <label class="field"><span>Full name</span> <em>*</em>
            <input name="full_name" autocomplete="name" required maxlength="100" placeholder="As written on your ID">
            <small class="err" data-err="full_name"></small></label>
          <label class="field"><span>National ID number</span> <em>*</em>
            <input name="national_id" inputmode="numeric" required maxlength="14" placeholder="14 digits" dir="ltr">
            <small class="err" data-err="national_id"></small></label>
        </div>
        <label class="check"><input type="checkbox" name="agree" required><span>I have read this agreement and I accept its terms.</span></label>
        <small class="err" data-err="agree"></small>
        <button class="btn" type="submit" id="go">Sign the agreement</button>
        <p class="msg" id="msg" role="alert"></p>
      </form></section>`}`;

  $('#print')?.addEventListener('click', () => window.print());
  const form = $('#sign');
  if (!form) return;

  const setErr = (name, text) => {
    const box = $(`[data-err="${name}"]`); box.textContent = text || '';
    (form.elements[name].closest('.check') || form.elements[name]).classList.toggle('invalid', !!text);
  };
  form.national_id.addEventListener('input', () => {
    // accept Arabic digits too
    form.national_id.value = form.national_id.value.replace(/[٠-٩]/g, (c) => '٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/\D/g, '').slice(0, 14);
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.full_name.value.trim(), nid = form.national_id.value.trim();
    let ok = true;
    if (name.split(/\s+/).length < 2) { setErr('full_name', 'Please write your full name.'); ok = false; } else setErr('full_name');
    if (!/^\d{14}$/.test(nid)) { setErr('national_id', 'The national ID has 14 digits.'); ok = false; } else setErr('national_id');
    if (!form.agree.checked) { setErr('agree', 'Please tick the box to accept the agreement.'); ok = false; } else setErr('agree');
    if (!ok) return;
    const btn = $('#go'); btn.disabled = true; btn.textContent = 'Signing…';
    try {
      const terms = $('#terms').innerHTML;
      const at = await rpc('portal_sign', { p_token: token, p_name: name, p_national_id: nid, p_version: VERSION, p_terms: terms, p_ua: navigator.userAgent });
      render({ ...current, agreement: { full_name: name, accepted_at: at, version: VERSION, terms } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      btn.disabled = false; btn.textContent = 'Sign the agreement';
      $('#msg').className = 'msg err';
      $('#msg').textContent = err.message.includes('digits') || err.message.includes('name') ? err.message : 'Could not sign — check your internet and try again.';
    }
  });
}

let current = null;
(async () => {
  if (!token) return showError();
  try {
    current = await rpc('portal_get', { p_token: token });
    if (!current) return showError();
    render(current);
    document.body.classList.add('ready');
  } catch (err) { showError('We could not load the agreement. Please try again in a minute.'); }
})();
