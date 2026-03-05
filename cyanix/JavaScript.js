/* ═══════════════════════════════════════════════════
   CYANIX AI — JavaScript.js
   All AI handled by Supabase edge functions.
   No API keys in the frontend. Ever.
═══════════════════════════════════════════════════ */

// ── CONFIG — only the public anon key goes here ────
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';

// Supabase edge function endpoints
// Groq / any other secret key lives in Supabase environment secrets — NOT here
const CHAT_URL     = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const CYSEARCH_URL = `${SUPABASE_URL}/functions/v1/search`;

const EDGE_HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'apikey': SUPABASE_ANON,
};

// ── STATE ─────────────────────────────────────────
let chatHistory  = [];   // { role, content }[]
let isResponding = false;

// ── SEARCH KEYWORD DETECTION ──────────────────────
const SEARCH_KEYWORDS = [
  'website','websites','tool','tools','resource','resources',
  'find','show me','recommend','recommendation','tutorial','tutorials',
  'learn','guide','guides','platform','platforms','app','apps',
  'software','service','services','link','links','example','examples',
  'best','top','popular','list of','ai tool','design tool','dev tool',
  'startup','library','framework','where can i','how do i find',
  'search for','look up',
];

function shouldTriggerSearch(msg) {
  const lower = msg.toLowerCase();
  return SEARCH_KEYWORDS.some(kw => lower.includes(kw));
}

// ── CYSEARCH EDGE FUNCTION ────────────────────────
async function callCysearch(query) {
  flashCysearchIndicator(true);
  try {
    const res = await fetch(CYSEARCH_URL, {
      method: 'POST',
      headers: EDGE_HEADERS,
      body: JSON.stringify({ query }),
    });
    if (!res.ok) { console.warn(`Cysearch ${res.status}`); return null; }
    return await res.json();
  } catch (err) {
    console.error('Cysearch error:', err);
    return null;
  } finally {
    flashCysearchIndicator(false);
  }
}

// ── CYANIX CHAT EDGE FUNCTION ─────────────────────
// Your edge function receives message + history + optional cysearch context,
// calls Groq using GROQ_API_KEY from Supabase secrets, and returns { reply, nodes? }
async function callCyanixChat(userMessage, cysearchData) {
  const res = await fetch(CHAT_URL, {
    method: 'POST',
    headers: EDGE_HEADERS,
    body: JSON.stringify({
      message: userMessage,
      history: chatHistory,
      ...(cysearchData ? { cysearch: cysearchData } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`cyanix-chat returned ${res.status}: ${text.slice(0, 200)}`);
  }

  return await res.json();
  // Expected response shape from your edge function:
  // { reply: string, nodes?: Array<{ label, category, url, description }> }
}

// ── SEND MESSAGE ──────────────────────────────────
async function sendMessage(userText) {
  if (!userText.trim() || isResponding) return;
  isResponding = true;

  const sendBtn = document.getElementById('send-btn');
  const inputEl = document.getElementById('chat-input');
  if (sendBtn) sendBtn.disabled = true;
  if (inputEl) { inputEl.value = ''; autoResizeInput(inputEl); }

  appendMessage('user', userText);
  scrollToBottom();

  try {
    // Step 1 — pre-fetch Cysearch nodes if the query asks for resources/tools
    let cysearchData = null;
    if (shouldTriggerSearch(userText)) {
      setTyping(true, 'SCANNING GALAXY VIA CYSEARCH...');
      cysearchData = await callCysearch(userText);
    }

    // Step 2 — call cyanix-chat edge function (Groq runs server-side)
    setTyping(true, 'CYANIX IS THINKING...');
    const result = await callCyanixChat(userText, cysearchData);

    const aiReply = result.reply || result.answer || result.text || '(no response)';

    // Merge nodes from edge function response + pre-fetched cysearch
    const nodes = result.nodes || cysearchData?.nodes || [];
    if (nodes.length) updateSidePanel(nodes);

    // Save to history for multi-turn context
    chatHistory.push({ role: 'user',      content: userText });
    chatHistory.push({ role: 'assistant', content: aiReply  });
    if (chatHistory.length > 40) chatHistory = chatHistory.slice(-40);

    setTyping(false);
    appendMessage('ai', aiReply, nodes.length ? { nodes } : null);
    scrollToBottom();

  } catch (err) {
    setTyping(false);
    appendMessage('ai', `⚠ ${err.message}`);
    scrollToBottom();
    console.error(err);
  } finally {
    isResponding = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

// ── RENDER MESSAGE ────────────────────────────────
const CAT_COLORS = {
  social:'#ff6b6b', ai:'#00f5ff', gaming:'#a855f7', news:'#f59e0b',
  darkweb:'#475569', startups:'#10b981', education:'#3b82f6', ecommerce:'#f97316',
  other:'#94a3b8', center:'#ffffff',
};

function appendMessage(role, text, cysearchData = null) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `msg msg-${role}`;

  const icon = document.createElement('div');
  icon.className = 'msg-icon';
  icon.textContent = role === 'user' ? 'YOU' : '◈';

  const body = document.createElement('div');
  body.className = 'msg-body';

  const author = document.createElement('div');
  author.className = 'msg-author';
  author.textContent = role === 'user' ? 'YOU' : 'CYANIX AI';

  const textDiv = document.createElement('div');
  textDiv.className = 'msg-text';
  textDiv.innerHTML = markdownToHTML(text);

  if (cysearchData?.nodes?.length) {
    const block = document.createElement('div');
    block.className = 'search-results-block';
    const header = document.createElement('div');
    header.className = 'sr-header';
    header.textContent = `◉ CYSEARCH — ${cysearchData.nodes.length} NODES FOUND`;
    block.appendChild(header);

    const row = document.createElement('div');
    row.className = 'sr-nodes';
    cysearchData.nodes.forEach(node => {
      const color = CAT_COLORS[node.category] || CAT_COLORS.other;
      const a = document.createElement('a');
      a.className = 'sr-node';
      a.style.borderColor = color + '55';
      a.style.color = color;
      if (node.url && node.url !== '#') {
        a.href = node.url.startsWith('http') ? node.url : 'https://' + node.url;
        a.target = '_blank'; a.rel = 'noopener';
      }
      const dot = document.createElement('span');
      dot.className = 'sr-node-dot';
      dot.style.background = color;
      dot.style.boxShadow = `0 0 6px ${color}`;
      a.appendChild(dot);
      a.appendChild(document.createTextNode(node.label));
      row.appendChild(a);
    });
    block.appendChild(row);
    textDiv.appendChild(block);
  }

  body.appendChild(author);
  body.appendChild(textDiv);

  if (role === 'user') { div.appendChild(body); div.appendChild(icon); }
  else                 { div.appendChild(icon); div.appendChild(body); }

  messages.appendChild(div);
}

// ── MARKDOWN → HTML ───────────────────────────────
function markdownToHTML(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<strong style="font-size:1.05em;color:var(--cyan);">$1</strong>')
    .replace(/^## (.+)$/gm,  '<strong style="font-size:1.1em;color:var(--cyan);display:block;margin-top:8px;">$1</strong>')
    .replace(/^# (.+)$/gm,   '<strong style="font-size:1.2em;color:var(--cyan);display:block;margin-top:10px;">$1</strong>')
    .replace(/^\s*[-*+] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>')
    .replace(/^(.+)/,'<p>$1</p>');
}

// ── SIDE PANEL ────────────────────────────────────
function updateSidePanel(nodes) {
  const list = document.getElementById('nodes-list');
  if (!list) return;
  list.innerHTML = '';
  nodes.forEach(node => {
    const color = CAT_COLORS[node.category] || CAT_COLORS.other;
    const a = document.createElement('a');
    a.className = 'node-card';
    a.style.borderColor = color + '44';
    if (node.url && node.url !== '#') {
      a.href = node.url.startsWith('http') ? node.url : 'https://' + node.url;
      a.target = '_blank'; a.rel = 'noopener';
    }
    a.innerHTML = `
      <div class="nc-cat" style="color:${color}">${(node.category||'other').toUpperCase()}</div>
      <div class="nc-name">${esc(node.label)}</div>
      <div class="nc-desc">${esc(node.description || node.url || '')}</div>`;
    list.appendChild(a);
  });
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── UI HELPERS ────────────────────────────────────
function setTyping(visible, label = 'CYANIX IS THINKING...') {
  const el  = document.getElementById('typing');
  const lbl = document.getElementById('typing-label');
  if (!el) return;
  el.classList.toggle('hidden', !visible);
  if (lbl && visible) lbl.textContent = label;
  if (visible) scrollToBottom();
}

function scrollToBottom() {
  const el = document.getElementById('messages');
  if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
}

function autoResizeInput(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 150) + 'px';
}

function flashCysearchIndicator(scanning) {
  const el = document.getElementById('cysearch-indicator');
  if (!el) return;
  el.innerHTML = '';
  const dot = document.createElement('span');
  dot.className = 'cs-dot';
  el.appendChild(dot);
  el.appendChild(document.createTextNode(scanning ? ' SCANNING GALAXY...' : ' CYSEARCH READY'));
  el.style.opacity = scanning ? '1'   : '0.5';
  el.style.color   = scanning ? 'var(--amber)' : 'var(--cyan)';
}

function appendWelcomeMessage() {
  const messages = document.getElementById('messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = 'msg msg-ai welcome-msg';
  div.innerHTML = `
    <div class="msg-icon">◈</div>
    <div class="msg-body">
      <div class="msg-author">CYANIX AI</div>
      <div class="msg-text">
        <p>Welcome to <strong>Cyanix AI</strong> — your intelligent navigator of the digital universe.</p>
        <p style="margin-top:8px;">I'm connected to <span class="inline-tag">Cysearch</span>, your galaxy-mapped internet search engine. When you ask for websites, tools, tutorials, or resources, I'll automatically scan the galaxy and bring back real results.</p>
        <p style="margin-top:8px;">Ask me anything. 🌌</p>
        <div class="suggested-row">
          <button class="suggest-btn" data-q="What are the best AI tools right now?">Best AI tools</button>
          <button class="suggest-btn" data-q="Show me web development resources">Web dev resources</button>
          <button class="suggest-btn" data-q="Find me startup tools">Startup tools</button>
          <button class="suggest-btn" data-q="What design resources do you recommend?">Design resources</button>
        </div>
      </div>
    </div>`;
  div.querySelectorAll('.suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
  messages.appendChild(div);
}

// ── BOOT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const inputEl  = document.getElementById('chat-input');
  const sendBtn  = document.getElementById('send-btn');
  const clearBtn = document.getElementById('clear-btn');

  appendWelcomeMessage();

  sendBtn?.addEventListener('click', () => {
    const text = inputEl?.value.trim();
    if (text) sendMessage(text);
  });

  inputEl?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (text) sendMessage(text);
    }
  });

  inputEl?.addEventListener('input', () => autoResizeInput(inputEl));

  document.querySelectorAll('.suggest-btn').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });

  clearBtn?.addEventListener('click', () => {
    chatHistory = [];
    const messages = document.getElementById('messages');
    if (messages) messages.innerHTML = '';
    appendWelcomeMessage();
    const list = document.getElementById('nodes-list');
    if (list) list.innerHTML = `
      <div class="nodes-empty">
        <div class="nodes-empty-icon">◉</div>
        <div class="nodes-empty-text">Search results will appear here as galaxy nodes</div>
      </div>`;
  });
});
