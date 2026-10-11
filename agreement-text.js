// Glaz Studios — the client agreement shown on /agreement.
// To change the wording later, edit this file only. Change VERSION whenever the terms change
// (each signed agreement keeps the exact text and version the client agreed to).
import { esc, egp, fmtDate, fmtTime, splitCouple } from './portal-common.js';

export const VERSION = '2026-10-v1';

// Numbers used in the terms — edit freely
const EXTRA_HOUR = 2000;      // EGP per extra hour on the day
const MEAL_AFTER_HOURS = 6;   // crew meal for coverage longer than this
const GALLERY_MONTHS = 3;     // how long the online gallery stays open

export function agreementHTML(b) {
  const d = b.details || {};
  const [g, br] = splitCouple(b.client_name);
  const groom = d.groom || g, bride = d.bride || br;
  const start = d.start || (b.start_time || '').slice(0, 5);
  const coverage = start && d.end ? `${fmtTime(start)} – ${fmtTime(d.end)}` : start ? `From ${fmtTime(start)}` : 'As agreed in the Event Day details';
  const total = Number(b.total || 0), paid = Number(b.paid || 0);
  const extras = (b.extras || []).map((x) => `${esc(x.description)} (${egp(x.amount)})`).join(', ') || 'None';
  const row = (k, v) => `<tr><td>${k}</td><td>${v}</td></tr>`;

  return `
  <p>This agreement is between <b>Glaz Studios</b> ("the Studio") and the couple named below ("the Client"). It confirms the coverage the Studio provides, its price, and how payment and delivery work.</p>

  <h3>1. The parties and the event</h3>
  <table>
    ${row('Groom', esc(groom) || '—')}
    ${row('Bride', esc(bride) || '—')}
    ${row('Mobile (WhatsApp)', esc(b.client_phone) || '—')}
    ${row('Event type', esc(b.event_type))}
    ${row('Event date', fmtDate(b.event_date))}
    ${row('Venue', esc(d.venue || b.venue) || '—')}
    ${row('Coverage', esc(coverage))}
  </table>
  <p>The exact timings of the day are taken from the Event Day details the Client fills in.</p>

  <h3>2. Package, price and payment</h3>
  <table>
    ${row('Package', esc(b.package) || 'Custom')}
    ${row('Agreed extras', extras)}
    ${row('Total price', egp(total))}
    ${row('Paid so far', egp(paid))}
    ${row('Balance due on the event day', egp(Math.max(total - paid, 0)))}
  </table>
  <ol>
    <li>A <b>30% deposit</b> reserves the date. The date is confirmed only once the deposit reaches the Studio.</li>
    <li>The deposit is <b>non-refundable</b>, because the Studio turns down other bookings for that date.</li>
    <li>The <b>balance is paid in full on the event day</b>, before coverage ends.</li>
    <li>Payment is by InstaPay, bank transfer or cash.</li>
    <li>Prices are fixed once the deposit is paid. Anything added later is priced separately (section 3).</li>
  </ol>

  <h3>3. On the day</h3>
  <ol>
    <li><b>Extra hours</b> asked for on the day cost ${egp(EXTRA_HOUR)} per hour and are added to the balance.</li>
    <li><b>Extra crew or equipment</b> (a second photographer or cinematographer, an extra Full Rec camera) is priced from the Studio's price list and added to the balance.</li>
    <li><b>Events outside Cairo</b> include a transportation fee based on the location, agreed before the event. Overnight stays, if needed, are covered by the Client.</li>
    <li>The Client completes the <b>Event Day details</b> at least 7 days before the event.</li>
    <li>The Client names one <b>contact person on the day</b> (not the couple) who can guide the team.</li>
    <li>For coverage longer than ${MEAL_AFTER_HOURS} hours, the Client provides a <b>meal and water</b> for the crew.</li>
    <li>The Studio is not responsible for moments missed because of late timings, venue rules, or guests blocking the camera. The team will always do its best to cover them.</li>
  </ol>

  <h3>4. Delivery</h3>
  <table>
    ${row('Edited photos', 'Within 20–25 days after the event')}
    ${row('Promo / highlight videos', 'Within 20–25 days after the event')}
    ${row('Full recording (Full Rec)', 'As soon as it is ready')}
  </table>
  <ol>
    <li>Photos are delivered through a <b>private Online Gallery</b>. It stays open for ${GALLERY_MONTHS} months; the Client should download and keep a backup.</li>
    <li>The Studio delivers edited work only, in its own editing style. Unedited (raw) files are not delivered.</li>
    <li>The Client may ask for <b>one round of reasonable changes</b> to each video within 7 days of receiving it.</li>
  </ol>

  <h3>5. Use of photos and videos</h3>
  <ol>
    <li>The Studio owns the copyright of all photos and videos it creates.</li>
    <li>The Client may use them freely for personal use: printing, albums, and sharing on social media with a tag to @glazstudios.</li>
    <li>The Studio may show selected photos and videos in its portfolio, website and social media.</li>
    <li>If the Client does not want the event shown publicly, they tell the Studio in writing before the event, and the Studio will respect it.</li>
  </ol>

  <h3>6. Cancellation, rescheduling and limits</h3>
  <ol>
    <li><b>If the Client cancels</b>, the deposit is not refunded. Any amount paid above the deposit is refunded.</li>
    <li><b>Rescheduling</b> is possible once, if the new date is free and the request comes at least 30 days before the event. The deposit moves to the new date.</li>
    <li><b>If the Studio cannot attend</b> because of an emergency, it sends a photographer of the same level. If that is not possible, everything the Client paid is refunded in full.</li>
    <li>In the rare case of equipment failure or file loss beyond the Studio's control, the Studio's responsibility is limited to refunding the amount paid for the affected part of the coverage.</li>
    <li>Neither side is responsible for delays or cancellation caused by events outside its control (for example official closures, extreme weather or a public emergency).</li>
  </ol>

  <h3>7. Acceptance</h3>
  <p>By writing their full name and national ID number below and pressing <b>Sign</b>, the Client confirms they have read and accept this agreement. The Studio keeps a copy with the date and time of signing.</p>`;
}
