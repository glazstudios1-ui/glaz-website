// Glaz Studios — the website chat.
// POST /api/chat  { session, message, page }  →  { session, reply, saved }
//
// Needs three Vercel environment variables (Project → Settings → Environment Variables):
//   ANTHROPIC_API_KEY     your Claude API key (console.anthropic.com)
//   SUPABASE_SECRET_KEY   Supabase → Project Settings → API Keys → secret key (sb_secret_…). Never put it in the website files.
//   SUPABASE_URL          optional, defaults to the Glaz project
// Optional: CHAT_MODEL (default below), CHAT_SALT (any random text).

const crypto = require('crypto');
const { RULES, SEED } = require('./_chat-rules.js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cxklgxwuncazqweqthih.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || '';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_URL = process.env.ANTHROPIC_URL || 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.CHAT_MODEL || 'claude-haiku-5-5';
const SALT = process.env.CHAT_SALT || 'glaz';

const MAX_MESSAGE = 1500;          // characters in one visitor message
const MAX_TURNS = 40;              // visitor messages in one conversation
const MAX_SESSIONS_PER_HOUR = 8;   // new conversations from one connection per hour
const HISTORY = 24;                // earlier messages Claude sees

// ---------- Supabase (REST, with the secret key: only this server uses it) ----------
async function db(path, { method = 'GET', body, prefer } = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`db ${method} ${path.split('?')[0]}: ${r.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}
const q = encodeURIComponent;

// ---------- Tools the assistant can use ----------
const TOOLS = [
  { name: 'save_request',
    description: 'Save the visitor as a booking request so the Glaz team contacts them on WhatsApp within 24 hours and sends their private packages page. Call once, when you have at least their name and WhatsApp number.',
    input_schema: { type: 'object', properties: {
      full_name: { type: 'string', description: 'Names of the couple or the person, as they wrote them' },
      phone: { type: 'string', description: 'WhatsApp number, as they wrote it' },
      event_date: { type: 'string', description: 'Event date as YYYY-MM-DD, only if they gave one' },
      event_type: { type: 'string', enum: ['Wedding', 'Engagement', 'Religious Event', 'Destination Event', 'Katb Ketab', 'Other'] },
      venue: { type: 'string', description: 'Venue or area, if given' },
      notes: { type: 'string', description: 'What they want and anything useful they said, in English' },
    }, required: ['full_name', 'phone'] } },
  { name: 'flag_question',
    description: 'Send a question you could not answer from GLAZ KNOWLEDGE to the Glaz team, so they can teach you the answer.',
    input_schema: { type: 'object', properties: { question: { type: 'string', description: 'The visitor’s question, in their words' } }, required: ['question'] } },
];

function normPhone(raw) {
  let p = String(raw || '').replace(/[\s\-().]/g, '').replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if (/^(\+20|0020|20)1[0125]\d{8}$/.test(p)) p = '0' + p.replace(/^(\+20|0020|20)/, '');
  if (/^01[0125]\d{8}$/.test(p)) return p;
  if (/^\+\d{8,15}$/.test(p)) return p;
  return null;
}
const cairoToday = () => new Date(Date.now() + 2 * 3600e3).toISOString().slice(0, 10);

async function runTool(name, input, ctx) {
  if (name === 'save_request') {
    if (ctx.savedLead) return 'Already saved earlier in this conversation. Do not save again.';
    const phone = normPhone(input.phone);
    if (!phone) return 'Error: that is not a valid WhatsApp number. Ask them for it again (for example 01012345678).';
    const name = String(input.full_name || '').trim().slice(0, 100);
    if (name.length < 2) return 'Error: ask for their name first.';
    const date = /^\d{4}-\d{2}-\d{2}$/.test(input.event_date || '') && input.event_date >= cairoToday() ? input.event_date : null;
    const lines = ['💬 From the website chat', input.notes && String(input.notes).slice(0, 800), input.event_date && !date && `Date they mentioned: ${input.event_date}`].filter(Boolean);
    const [lead] = await db('leads', { method: 'POST', prefer: 'return=representation', body: {
      full_name: name, phone, event_date: date, event_type: input.event_type || 'Wedding',
      venue: input.venue ? String(input.venue).slice(0, 150) : null, message: lines.join('\n'),
    } });
    ctx.savedLead = lead.id;
    await db(`chat_sessions?id=eq.${q(ctx.session)}`, { method: 'PATCH', body: { lead_id: lead.id } });
    await db('chat_messages', { method: 'POST', body: { session_id: ctx.session, role: 'event', content: `Saved as a request: ${name}, ${phone}${date ? ', ' + date : ''}` } });
    return 'Saved. The team will message them on WhatsApp within 24 hours with their private packages page.';
  }
  if (name === 'flag_question') {
    const question = String(input.question || '').trim().slice(0, 500);
    if (question) await db('chat_questions', { method: 'POST', body: { session_id: ctx.session, question } });
    return 'Sent to the team. Tell the visitor you will check, and offer to take their name and WhatsApp number.';
  }
  return 'Error: unknown tool.';
}

// ---------- Claude ----------
async function ask(system, messages) {
  const r = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages, tools: TOOLS }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`claude ${r.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

async function knowledge() {
  try {
    const rows = await db('chat_knowledge?select=title,content&active=eq.true&order=sort.asc,created_at.asc');
    if (rows?.length) return rows.map((r) => `## ${r.title}\n${r.content}`).join('\n\n');
  } catch (e) { console.error(e.message); }
  return SEED.map(([t, c]) => `## ${t}\n${c}`).join('\n\n');
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = []; for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
}
const send = (res, code, obj) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); };

async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Use POST' });
  if (!ANTHROPIC_KEY || !SUPABASE_KEY) return send(res, 503, { error: 'The chat is not set up yet.' });
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: 'Bad request' }); }
  const message = String(body.message || '').trim();
  if (!message) return send(res, 400, { error: 'Empty message' });
  if (message.length > MAX_MESSAGE) return send(res, 400, { error: 'That message is too long.' });

  try {
    // The conversation: continue it, or start a new one
    let session = /^[0-9a-f-]{36}$/.test(body.session || '') ? body.session : null;
    let row = session ? (await db(`chat_sessions?id=eq.${q(session)}&select=id,turns,lead_id`))[0] : null;
    if (!row) {
      const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
      const ipHash = crypto.createHash('sha256').update(SALT + ip).digest('hex').slice(0, 32);
      const since = new Date(Date.now() - 3600e3).toISOString();
      const recent = await db(`chat_sessions?ip_hash=eq.${ipHash}&created_at=gte.${q(since)}&select=id`);
      if (recent.length >= MAX_SESSIONS_PER_HOUR) return send(res, 429, { error: 'Too many conversations. Please try again later, or email info@glazstudios.com.' });
      [row] = await db('chat_sessions', { method: 'POST', prefer: 'return=representation', body: { ip_hash: ipHash, page: String(body.page || '').slice(0, 200) } });
      session = row.id;
    }
    if (row.turns >= MAX_TURNS) return send(res, 429, { error: 'This conversation is long. Please send your details through the booking form at /book.' });

    const past = await db(`chat_messages?session_id=eq.${q(session)}&role=in.(user,assistant)&select=role,content&order=id.desc&limit=${HISTORY}`);
    await db('chat_messages', { method: 'POST', body: { session_id: session, role: 'user', content: message } });
    await db(`chat_sessions?id=eq.${q(session)}`, { method: 'PATCH', body: { turns: row.turns + 1, last_at: new Date().toISOString() } });

    const messages = [];
    for (const m of [...past.reverse(), { role: 'user', content: message }]) {   // join turns in a row from the same side
      const last = messages[messages.length - 1];
      if (last && last.role === m.role) last.content += '\n\n' + m.content; else messages.push({ role: m.role, content: m.content });
    }
    while (messages.length && messages[0].role !== 'user') messages.shift();
    const system = `${RULES}\n\nToday in Cairo is ${cairoToday()}.\n\nGLAZ KNOWLEDGE\n\n${await knowledge()}`;

    const ctx = { session, savedLead: row.lead_id || null };
    let reply = '';
    for (let round = 0; round < 4; round++) {
      const out = await ask(system, messages);
      const text = out.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
      const uses = out.content.filter((c) => c.type === 'tool_use');
      if (out.stop_reason !== 'tool_use' || !uses.length) { reply = text; break; }
      messages.push({ role: 'assistant', content: out.content });
      const results = [];
      for (const u of uses) {
        let result;
        try { result = await runTool(u.name, u.input || {}, ctx); } catch (e) { console.error(e.message); result = 'Error: could not save right now. Ask them to use the booking form at /book.'; }
        results.push({ type: 'tool_result', tool_use_id: u.id, content: result });
      }
      messages.push({ role: 'user', content: results });
      reply = text;
    }
    if (!reply) reply = 'Sorry, something went wrong on our side. You can reach us at info@glazstudios.com.';
    await db('chat_messages', { method: 'POST', body: { session_id: session, role: 'assistant', content: reply } });
    return send(res, 200, { session, reply, saved: !!ctx.savedLead });
  } catch (e) {
    console.error(e.message);
    return send(res, 500, { error: 'The chat is having a problem. Please try again, or email info@glazstudios.com.' });
  }
}

module.exports = handler;
module.exports.normPhone = normPhone;
