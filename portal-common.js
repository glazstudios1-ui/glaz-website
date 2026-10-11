// Shared bits for the client pages (Event Day details, Agreement) and the crew day sheet.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import * as CFG from './config.js';

export const sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY);
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const token = new URLSearchParams(location.search).get('t') || '';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const egp = (n) => Number(n || 0).toLocaleString('en-US') + ' EGP';
export const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—';
export const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
};
export const fmtStamp = (iso) => iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';

// Split "Ahmed & Sara" into groom / bride as a starting point
export function splitCouple(name) {
  const parts = String(name || '').split(/\s*[&+]\s*|\s+and\s+|\s+و\s+/i).map((s) => s.trim()).filter(Boolean);
  return parts.length === 2 ? parts : [name || '', ''];
}

export function showError(msg) {
  document.body.classList.add('ready');
  $('#app').innerHTML = `<div class="card center"><h2>Link not found</h2><p class="muted">${esc(msg || 'This link is not valid any more. Please message Glaz Studios on WhatsApp and we will send you a new one.')}</p></div>`;
}

export async function rpc(name, args) {
  const { data, error } = await sb.rpc(name, args);
  if (error) throw new Error(error.message);
  return data;
}

export const MOMENTS = ['Bride ready / first look', 'Couple photo session', 'Zaffa', 'Grand entrance', 'Katb Ketab / ceremony',
  'First dance', 'Singer / band arrives', 'Fireworks show', 'Cake cutting', 'Family & friends photos', 'Dinner', 'Bouquet toss', 'Last dance / ending'];
export const IG_ROLES = ['Groom', 'Bride', 'Makeup artist', 'Hair stylist', 'Dress designer', 'Suit', 'Venue',
  'Wedding planner', 'Decor & flowers', 'Singer / DJ'];
