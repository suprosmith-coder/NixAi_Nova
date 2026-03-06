/* ═══════════════════════════════════════════════════
   CYANIX AI — JavaScript.js
   All AI via Supabase edge functions. Zero API keys here.
═══════════════════════════════════════════════════ */

'use strict';

// ── Config — only public anon key ─────────────────
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';

// Supabase edge functions — secrets like GROQ_API_KEY live in Supabase env, not here
const CHAT_URL      = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const CYSEARCH_URL  = `${SUPABASE_URL}/functions/v1/search`;

const HEADERS = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'apikey':        SUPABASE_ANON,
};

// ── State ─────────────────────────────────────────
let history     = [];   // { role, content }[]
let responding  = false;

// ── Keywords that should auto-trigger Cysearch ────
const SEARCH_KW = [
  'website','websites','tool','tools','resource','resources',
  'find','show me','recommend','tutorial','tutorials','learn',
  'guide','platform','app','apps','software','service','link',
  'links','example','examples','best','top','popular','list of',
  'ai tool','design','dev tool','startup','library','framework',
  'where can i','how do i find','search for','look up',
];

function wantsSearch(msg) {
  const lo = msg.toLowerCase();
  return SEARCH_KW.some(kw => lo.includes(kw));
}

// ── Helpers ───────────────────────────────────────
function el(id)  { return document.getElementById(id); }
function $q(sel) { return document.querySelector(sel); }

function scrollDown() {
  const m = el('messages');
  if (m) setTimeout(() => { m.scrollTop = m.scrollHeight; }, 40);
}

function setTyping(on, label) {
  const row = el('typing');
  const lbl = el('typing-label');
  if (!row) return;
  row.classList.toggle('hidden', !on);
  if (lbl && label) lbl.textContent = label;
  if (on) scrollDown();
}

function resize(ta) {
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
}

function setCysearchStatus(scanning) {
  const s = el('cysearch-indicator');
  if (!s) return;
  s.innerHTML = '<span class="cs-dot"></span> ' + (scanning ? 'Searching...' : 'Cysearch connected');
  s.classList.toggle('scanning', scanning);
}

// ── Cat colors (mirrors Cysearch) ─────────────────
const CAT_COLORS = {
  social:'#ff6b6b',ai:'#00f5ff',gaming:'#a855f7',news:'#f59e0b',
  startups:'#10b981',education:'#3b82f6',ecommerce:'#f97316',
  darkweb:'#475569',other:'#94a3b8',
};

// ════════════════════════════════════════════════
// BOOT
// ════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  bindButtons();
  renderWelcome();
});

// ════════════════════════════════════════════════
// BUTTON BINDINGS — null-safe, all in one place
// ════════════════════════════════════════════════
function bindButtons() {
  const input   = el('chat-input');
  const sendBtn = el('send-btn');
  const clearBtn= el('clear-btn');

  // Send button
  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      const txt = input?.value.trim();
      if (txt) sendMessage(txt);
    });
  }

  // Enter key sends, Shift+Enter = new line
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const txt = input.value.trim();
        if (txt) sendMessage(txt);
      }
    });
    input.addEventListener('input', () => resize(input));
  }

  // Clear chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      history = [];
      const m = el('messages');
      if (m) m.innerHTML = '';
      renderWelcome();
      resetSidebar();
    });
  }
}

// Bind suggest chips (called after rendering welcome or any message)
function bindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    // Remove old listeners by replacing node
    const fresh = chip.cloneNode(true);
    chip.parentNode.replaceChild(fresh, chip);
    fresh.addEventListener('click', () => sendMessage(fresh.dataset.q));
  });
}

// ════════════════════════════════════════════════
// SEND MESSAGE
// ════════════════════════════════════════════════
async function sendMessage(text) {
  if (!text.trim() || responding) return;
  responding = true;

  const input   = el('chat-input');
  const sendBtn = el('send-btn');
  if (input)   { input.value = ''; resize(input); }
  if (sendBtn) sendBtn.disabled = true;

  appendMsg('user', text);
  scrollDown();

  try {
    // 1. Pre-fetch Cysearch if relevant
    let csData = null;
    if (wantsSearch(text)) {
      setTyping(true, 'Searching the web...');
      setCysearchStatus(true);
      csData = await callCysearch(text);
      setCysearchStatus(false);
    }

    // 2. Call cyanix-chat edge function (Groq runs there, not here)
    setTyping(true, 'Thinking...');
    const result = await callChat(text, csData);

    const reply = result.reply || result.answer || result.text || '(no response)';
    const nodes = result.nodes || csData?.nodes || [];

    // Save to history
    history.push({ role:'user',      content:text  });
    history.push({ role:'assistant', content:reply });
    if (history.length > 40) history = history.slice(-40);

    if (nodes.length) updateSidebar(nodes);

    setTyping(false);
    appendMsg('ai', reply, nodes.length ? nodes : null);
    scrollDown();

  } catch (err) {
    setTyping(false);
    setCysearchStatus(false);
    appendMsg('ai', `⚠ Something went wrong: ${err.message}`);
    scrollDown();
    console.error('Cyanix error:', err);
  } finally {
    responding = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

// ── Edge function calls ───────────────────────────
async function callCysearch(query) {
  try {
    const res = await fetch(CYSEARCH_URL, {
      method:'POST', headers:HEADERS,
      body:JSON.stringify({ query }),
    });
    if (!res.ok) { console.warn(`Cysearch ${res.status}`); return null; }
    return await res.json();
  } catch(e) { console.error('Cysearch error:', e); return null; }
}

async function callChat(message, csData) {
  // Sends message + history + optional cysearch results to your edge function.
  // Your edge function calls Groq using the GROQ_API_KEY env secret.
  const res = await fetch(CHAT_URL, {
    method:'POST', headers:HEADERS,
    body:JSON.stringify({
      message,
      history,
      ...(csData ? { cysearch: csData } : {}),
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(()=>'');
    throw new Error(`cyanix-chat returned ${res.status}: ${txt.slice(0,160)}`);
  }
  return await res.json();
  // Expected: { reply: string, nodes?: [...] }
}

// ════════════════════════════════════════════════
// RENDER MESSAGES
// ════════════════════════════════════════════════
function appendMsg(role, text, nodes) {
  const wrap = el('messages');
  if (!wrap) return;

  const row = document.createElement('div');
  row.className = `msg msg-${role}`;

  const avatar = document.createElement('div');
  avatar.className = role === 'user' ? 'avatar user-avatar' : 'avatar ai-avatar';
  avatar.textContent = role === 'user' ? 'You' : '✦';

  const body = document.createElement('div');
  body.className = 'msg-body';

  const author = document.createElement('div');
  author.className = 'msg-author';
  author.textContent = role === 'user' ? 'You' : 'Cyanix AI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-text';
  bubble.innerHTML = mdToHTML(text);

  // Attach Cysearch node pills
  if (nodes && nodes.length) {
    const block = document.createElement('div');
    block.className = 'result-block';
    const label = document.createElement('div');
    label.className = 'result-label';
    label.textContent = `✦ Found ${nodes.length} results via Cysearch`;
    block.appendChild(label);
    const row2 = document.createElement('div');
    row2.className = 'result-nodes';
    nodes.forEach(n => {
      const color = CAT_COLORS[n.category] || CAT_COLORS.other;
      const a = document.createElement('a');
      a.className = 'result-node';
      a.style.borderColor = color + '55';
      a.style.color = color;
      if (n.url && n.url !== '#') {
        a.href = n.url.startsWith('http') ? n.url : 'https://' + n.url;
        a.target = '_blank'; a.rel = 'noopener';
      }
      const dot = document.createElement('span');
      dot.className = 'rn-dot';
      dot.style.background = color;
      a.appendChild(dot);
      a.appendChild(document.createTextNode(n.label));
      row2.appendChild(a);
    });
    block.appendChild(row2);
    bubble.appendChild(block);
  }

  body.appendChild(author);
  body.appendChild(bubble);

  if (role === 'user') { row.appendChild(body); row.appendChild(avatar); }
  else                 { row.appendChild(avatar); row.appendChild(body); }

  wrap.appendChild(row);
}

// ── Basic markdown → HTML ─────────────────────────
function mdToHTML(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```[\w]*\n?([\s\S]*?)```/g,'<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm,'<strong style="color:var(--cyan);display:block;margin-top:6px;">$1</strong>')
    .replace(/^\s*[-*] (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g,'<ul>$1</ul>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>')
    .replace(/^(.)/,'<p>$1').replace(/$/, '</p>');
}

// ════════════════════════════════════════════════
// WELCOME MESSAGE
// ════════════════════════════════════════════════
function renderWelcome() {
  const wrap = el('messages');
  if (!wrap) return;

  const row = document.createElement('div');
  row.className = 'msg msg-ai welcome-card';

  const avatar = document.createElement('div');
  avatar.className = 'avatar ai-avatar';
  avatar.textContent = '✦';

  const body = document.createElement('div');
  body.className = 'msg-body';

  const author = document.createElement('div');
  author.className = 'msg-author';
  author.textContent = 'Cyanix AI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-text';
  bubble.innerHTML = `
    <p>Hey! 👋 I'm <strong>Cyanix AI</strong>, your personal assistant built on top of Cysearch.</p>
    <p style="margin-top:8px;">I can answer questions, help you find websites and tools, explain things, write code, and more. When you ask for recommendations or resources, I'll automatically search the web for you.</p>
    <p style="margin-top:8px;">What can I help you with?</p>
    <div class="suggest-chips">
      <button class="chip" data-q="What are the best AI tools right now?">🤖 Best AI tools</button>
      <button class="chip" data-q="Show me some web development resources">🌐 Web dev resources</button>
      <button class="chip" data-q="What are good startup tools to use?">🚀 Startup tools</button>
      <button class="chip" data-q="Find me some design resources">🎨 Design resources</button>
    </div>
  `;

  body.appendChild(author);
  body.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(body);
  wrap.appendChild(row);

  // Bind after insert
  bindChips();
}

// ════════════════════════════════════════════════
// SIDEBAR
// ════════════════════════════════════════════════
function updateSidebar(nodes) {
  const list = el('nodes-list');
  if (!list) return;
  list.innerHTML = '';
  nodes.forEach(node => {
    const color = CAT_COLORS[node.category] || CAT_COLORS.other;
    const a = document.createElement('a');
    a.className = 'node-card';
    a.style.borderColor = color + '33';
    if (node.url && node.url !== '#') {
      a.href = node.url.startsWith('http') ? node.url : 'https://' + node.url;
      a.target = '_blank'; a.rel = 'noopener';
    }
    a.innerHTML = `
      <span class="nc-cat" style="color:${color}">${(node.category||'other').toUpperCase()}</span>
      <span class="nc-name">${esc(node.label)}</span>
      <span class="nc-desc">${esc(node.description || node.url || '')}</span>`;
    list.appendChild(a);
  });
}

function resetSidebar() {
  const list = el('nodes-list');
  if (!list) return;
  list.innerHTML = `
    <div class="nodes-empty">
      <div class="empty-icon">◉</div>
      <p class="empty-text">When I search the web for you, results will show up here as clickable cards.</p>
    </div>`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
