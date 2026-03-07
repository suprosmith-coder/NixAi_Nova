/* ══════════════════════════════════════════════════════════════
   CYANIX AI — JavaScript.js
   Supabase Auth · Groq Streaming · GPT OSS Models
══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Config ─────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const TTS_URL       = `${SUPABASE_URL}/functions/v1/tts`;
const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];
const EDGE_HEADERS  = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'apikey': SUPABASE_ANON
};

/* ── Models ─────────────────────────────────────────────── */
const MODELS = [
  { id: 'gpt-oss-20b-128k',      name: 'GPT OSS 20B',       tag: 'FAST',   desc: '128k context · Fast everyday tasks' },
  { id: 'gpt-oss-120b-128k',     name: 'GPT OSS 120B',      tag: 'POWER',  desc: '128k context · Deep reasoning' },
  { id: 'gpt-oss-safeguard-20b', name: 'GPT OSS Safeguard', tag: 'SAFE',   desc: 'Moderation · Safety-filtered' },
];

const TTS_MODEL = 'canopy-labs/orpheus-english';

/* ── Suggestion prompts ─────────────────────────────────── */
const SUGGESTIONS = [
  'Learn about Cyanix AI',
  'Generate a blog post about AI trends',
  'Explain a machine learning concept',
  'Summarize this text: [paste here]',
];

/* ── State ──────────────────────────────────────────────── */
let _sb          = null;
let _session     = null;
let _chats       = [];           // [{ id, title, messages:[], ts }]
let _currentId   = null;
let _history     = [];           // messages for current chat [{role,content}]
let _responding  = false;
let _abortCtrl   = null;
let _ttsAudio    = null;
let _ttsSpeaking = false;

let _settings = {
  model:     MODELS[0].id,
  streaming: true,
  theme:     'light',
};

/* ── Helpers ────────────────────────────────────────────── */
const $    = id => document.getElementById(id);
const show = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.remove('hidden'); };
const hide = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.add('hidden'); };
const on   = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

function toast(msg, ms = 2600) {
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  show(t);
  clearTimeout(t._timer);
  t._timer = setTimeout(() => hide(t), ms);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ── Markdown renderer ──────────────────────────────────── */
function mdToHTML(text) {
  // Extract code blocks first
  const codeBlocks = [];
  let t = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || 'code', code });
    return `\x00CODE${idx}\x00`;
  });

  // Escape remaining HTML
  t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline formatting
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g,     '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g,     '<code>$1</code>');
  t = t.replace(/~~(.+?)~~/g,     '<del>$1</del>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Headings
  t = t.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  t = t.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  t = t.replace(/^# (.+)$/gm,   '<h1>$1</h1>');

  // Blockquotes
  t = t.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Lists (ordered)
  t = t.replace(/^\d+\. (.+)$/gm, '<liO>$1</liO>');
  // Lists (unordered)
  t = t.replace(/^[-*] (.+)$/gm,  '<liU>$1</liU>');

  // Wrap list items
  t = t.replace(/(<liU>[\s\S]*?<\/liU>)+/g, m => '<ul>' + m.replace(/<liU>([\s\S]*?)<\/liU>/g, '<li>$1</li>') + '</ul>');
  t = t.replace(/(<liO>[\s\S]*?<\/liO>)+/g, m => '<ol>' + m.replace(/<liO>([\s\S]*?)<\/liO>/g, '<li>$1</li>') + '</ol>');

  // Paragraphs
  t = t.split(/\n{2,}/).map(p => {
    p = p.trim();
    if (!p) return '';
    if (/^<(h[1-3]|ul|ol|blockquote|pre)/.test(p)) return p;
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');

  // Restore code blocks
  t = t.replace(/\x00CODE(\d+)\x00/g, (_, i) => {
    const { lang, code } = codeBlocks[+i];
    const escapedCode = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return `<div class="code-block">
      <div class="code-header">
        <span>${lang}</span>
        <button class="copy-code-btn" onclick="copyCode(this)">Copy</button>
      </div>
      <pre><code>${escapedCode}</code></pre>
    </div>`;
  });

  return t;
}

function copyCode(btn) {
  const code = btn.closest('.code-block').querySelector('code').textContent;
  navigator.clipboard?.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
}
window.copyCode = copyCode; // expose for inline onclick

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  applyTheme(_settings.theme);

  // Init Supabase
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  // Auth state listener
  _sb.auth.onAuthStateChange(async (event, session) => {
    _session = session;
    if (session) {
      await onSignedIn(session);
    } else {
      onSignedOut();
    }
  });

  // Check current session
  const { data: { session } } = await _sb.auth.getSession();
  if (!session) {
    show('view-auth');
  }

  bindAuthUI();
  bindChatUI();
  populateModels();
  loadChats();
});

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
function bindAuthUI() {
  // Panel switching
  document.querySelectorAll('.switch-link').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showPanel(a.dataset.to);
    });
  });

  on('forgot-link', 'click', e => { e.preventDefault(); showPanel('forgot'); });

  // Sign In
  on('si-btn', 'click', signIn);
  on('si-email', 'keydown', e => { if (e.key === 'Enter') $('si-password').focus(); });
  on('si-password', 'keydown', e => { if (e.key === 'Enter') signIn(); });

  // Sign Up
  on('su-btn', 'click', signUp);
  on('su-password', 'keydown', e => { if (e.key === 'Enter') signUp(); });

  // Forgot password
  on('fp-btn', 'click', sendReset);
  on('fp-email', 'keydown', e => { if (e.key === 'Enter') sendReset(); });

  // OAuth
  on('si-google', 'click', () => signInOAuth('google'));
  on('si-github', 'click', () => signInOAuth('github'));
  on('su-google', 'click', () => signInOAuth('google'));
  on('su-github', 'click', () => signInOAuth('github'));
}

function showPanel(name) {
  ['signin', 'signup', 'forgot'].forEach(p => {
    const el = $(`panel-${p}`);
    if (el) el.classList.toggle('hidden', p !== name);
  });
  clearAuthMessages();
}

function clearAuthMessages() {
  ['si-err','si-ok','su-err','su-ok','fp-err','fp-ok'].forEach(id => {
    const el = $(id); if (el) { el.textContent = ''; hide(el); }
  });
}

function setMsg(id, msg, type) {
  const el = $(id);
  if (!el) return;
  el.textContent = msg;
  el.dataset.type = type;
  show(el);
}

async function signIn() {
  const email    = $('si-email')?.value.trim();
  const password = $('si-password')?.value;
  if (!email || !password) { setMsg('si-err', 'Please enter your email and password.', 'err'); return; }

  const btn = $('si-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
  clearAuthMessages();

  const { error } = await _sb.auth.signInWithPassword({ email, password });
  if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }

  if (error) {
    setMsg('si-err', error.message, 'err');
  }
}

async function signUp() {
  const name     = $('su-name')?.value.trim();
  const email    = $('su-email')?.value.trim();
  const password = $('su-password')?.value;

  if (!email || !password) { setMsg('su-err', 'Please fill in all fields.', 'err'); return; }
  if (password.length < 8)  { setMsg('su-err', 'Password must be at least 8 characters.', 'err'); return; }

  const btn = $('su-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }
  clearAuthMessages();

  const { error } = await _sb.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name || email.split('@')[0] },
      emailRedirectTo: REDIRECT_URL,
    }
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }

  if (error) {
    setMsg('su-err', error.message, 'err');
  } else {
    setMsg('su-ok', 'Account created! Check your email to confirm your address.', 'ok');
  }
}

async function sendReset() {
  const email = $('fp-email')?.value.trim();
  if (!email) { setMsg('fp-err', 'Please enter your email.', 'err'); return; }

  const btn = $('fp-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  clearAuthMessages();

  const { error } = await _sb.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
  if (btn) { btn.disabled = false; btn.textContent = 'Send Reset Link'; }

  if (error) {
    setMsg('fp-err', error.message, 'err');
  } else {
    setMsg('fp-ok', 'Reset link sent! Check your email.', 'ok');
  }
}

async function signInOAuth(provider) {
  const { error } = await _sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: REDIRECT_URL }
  });
  if (error) toast('OAuth error: ' + error.message);
}

async function signOut() {
  await _sb.auth.signOut();
  toast('Signed out.');
}

async function onSignedIn(session) {
  hide('view-auth');
  show('view-chat');

  // User name / avatar
  const meta  = session.user?.user_metadata;
  const email = session.user?.email || '';
  const name  = meta?.full_name || meta?.name || email.split('@')[0] || 'User';
  const initials = name.slice(0,2).toUpperCase();

  if ($('user-name'))   $('user-name').textContent   = name;
  if ($('user-avatar')) $('user-avatar').textContent  = initials;

  loadChats();

  // If no chats yet, show welcome
  if (_chats.length === 0) {
    showWelcome();
  } else {
    loadChat(_chats[0].id);
  }
}

function onSignedOut() {
  hide('view-chat');
  show('view-auth');
  showPanel('signin');
  _session = null;
  _chats = [];
  _currentId = null;
  _history = [];
}

/* ══════════════════════════════════════════════════════════
   CHAT UI BINDING
══════════════════════════════════════════════════════════ */
function bindChatUI() {
  // Sidebar toggle
  on('sidebar-toggle', 'click', toggleSidebar);

  // New chat
  on('new-chat-btn', 'click', newChat);
  on('new-chat-top', 'click', newChat);

  // Send
  on('send-btn', 'click', handleSend);
  on('composer-input', 'keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  on('composer-input', 'input', () => {
    const ta = $('composer-input');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
  });

  // Settings
  on('settings-btn', 'click', () => { show('settings-modal'); closeUserMenu(); });
  on('settings-close', 'click', () => hide('settings-modal'));
  on('settings-modal', 'click', e => { if (e.target.id === 'settings-modal') hide('settings-modal'); });

  // Settings controls
  on('streaming-toggle', 'change', () => {
    _settings.streaming = $('streaming-toggle').checked;
    saveSettings();
  });
  on('theme-select', 'change', () => {
    _settings.theme = $('theme-select').value;
    applyTheme(_settings.theme);
    saveSettings();
  });
  on('model-select', 'change', () => {
    _settings.model = $('model-select').value;
    saveSettings();
    updateModelLabel();
  });
  on('clear-chats-btn', 'click', () => {
    if (confirm('Clear all chats? This cannot be undone.')) {
      _chats = [];
      saveChats();
      renderChatList();
      newChat();
      hide('settings-modal');
      toast('All chats cleared.');
    }
  });
  on('signout-btn', 'click', () => { hide('settings-modal'); signOut(); });

  // Help
  on('help-btn', 'click', () => { show('help-modal'); closeUserMenu(); });
  on('help-close', 'click', () => hide('help-modal'));
  on('help-modal', 'click', e => { if (e.target.id === 'help-modal') hide('help-modal'); });

  // User menu
  on('user-btn', 'click', toggleUserMenu);
  on('um-settings', 'click', () => { closeUserMenu(); show('settings-modal'); });
  on('um-signout',  'click', () => { closeUserMenu(); signOut(); });
  document.addEventListener('click', e => {
    if (!$('user-btn')?.contains(e.target) && !$('user-menu')?.contains(e.target)) closeUserMenu();
    if (!$('model-btn')?.contains(e.target) && !$('model-dropdown')?.contains(e.target)) hide('model-dropdown');
  });

  // Model picker
  on('model-btn', 'click', () => $('model-dropdown').classList.toggle('hidden'));

  // Suggestion chips
  document.querySelectorAll('.sugg-chip').forEach((chip, i) => {
    chip.textContent = SUGGESTIONS[i] || chip.textContent;
    chip.addEventListener('click', () => {
      const input = $('composer-input');
      if (input) { input.value = chip.textContent; input.focus(); }
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (_responding) stopResponse();
      hide('settings-modal'); hide('help-modal'); closeUserMenu(); hide('model-dropdown');
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      $('composer-input')?.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      newChat();
    }
  });

  // Emoji button (opens native picker or inserts smiley)
  on('emoji-btn', 'click', () => {
    const input = $('composer-input');
    if (!input) return;
    input.value += '😊';
    input.focus();
  });

  // Attach button (stub)
  on('attach-btn', 'click', () => toast('File attachments coming soon.'));
}

function toggleSidebar() {
  $('sidebar')?.classList.toggle('collapsed');
}

function toggleUserMenu() {
  $('user-menu')?.classList.toggle('hidden');
}

function closeUserMenu() {
  hide('user-menu');
}

/* ══════════════════════════════════════════════════════════
   MODELS
══════════════════════════════════════════════════════════ */
function populateModels() {
  // Settings select
  const sel = $('model-select');
  if (sel) {
    sel.innerHTML = MODELS.map(m =>
      `<option value="${m.id}" ${m.id === _settings.model ? 'selected' : ''}>${m.name}</option>`
    ).join('');
  }

  // Dropdown
  const dd = $('model-dropdown');
  if (dd) {
    dd.innerHTML = MODELS.map(m => `
      <div class="md-option ${m.id === _settings.model ? 'active' : ''}" data-id="${m.id}">
        <div class="md-name">${m.name} <span class="md-tag">${m.tag}</span></div>
        <div class="md-desc">${m.desc}</div>
      </div>
    `).join('');

    dd.querySelectorAll('.md-option').forEach(opt => {
      opt.addEventListener('click', () => {
        _settings.model = opt.dataset.id;
        saveSettings();
        updateModelLabel();
        dd.querySelectorAll('.md-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        hide('model-dropdown');
        if ($('model-select')) $('model-select').value = _settings.model;
        toast(`Model: ${MODELS.find(m => m.id === _settings.model)?.name}`);
      });
    });
  }

  updateModelLabel();
}

function updateModelLabel() {
  const m = MODELS.find(x => x.id === _settings.model);
  if ($('model-name-label')) $('model-name-label').textContent = m?.name || 'Select model';
}

/* ══════════════════════════════════════════════════════════
   CHATS (local storage)
══════════════════════════════════════════════════════════ */
function loadChats() {
  try {
    const raw = localStorage.getItem('cx_chats');
    _chats = raw ? JSON.parse(raw) : [];
  } catch { _chats = []; }
  renderChatList();
}

function saveChats() {
  try { localStorage.setItem('cx_chats', JSON.stringify(_chats.slice(0, 200))); } catch {}
}

function renderChatList() {
  const list = $('chat-list');
  if (!list) return;

  if (_chats.length === 0) {
    list.innerHTML = `<div class="sb-list-empty">No chats yet.<br>Start a new conversation!</div>`;
    return;
  }

  list.innerHTML = _chats.map(c => `
    <div class="chat-item ${c.id === _currentId ? 'active' : ''}" data-id="${c.id}">
      <span class="ci-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </span>
      <span class="ci-label">${esc(c.title || 'New chat')}</span>
      <button class="ci-del" data-id="${c.id}" title="Delete chat">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('');

  // Chat item click
  list.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('.ci-del')) return;
      loadChat(item.dataset.id);
    });
  });

  // Delete button
  list.querySelectorAll('.ci-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      deleteChat(btn.dataset.id);
    });
  });
}

function newChat() {
  _currentId = null;
  _history   = [];
  if ($('chat-title')) $('chat-title').textContent = 'New chat';
  clearMessages();
  showWelcome();
  renderChatList();
  $('composer-input')?.focus();
}

function loadChat(id) {
  const chat = _chats.find(c => c.id === id);
  if (!chat) return;

  _currentId = id;
  _history   = chat.messages || [];
  if ($('chat-title')) $('chat-title').textContent = chat.title || 'Chat';

  clearMessages();
  hide('welcome-state');

  _history.forEach(msg => {
    renderMessage(msg.role, msg.content, false);
  });

  renderChatList();
  scrollToBottom();
}

function deleteChat(id) {
  _chats = _chats.filter(c => c.id !== id);
  saveChats();
  if (_currentId === id) newChat();
  else renderChatList();
  toast('Chat deleted.');
}

function saveCurrentChat() {
  if (!_currentId) return;
  const existing = _chats.find(c => c.id === _currentId);
  if (existing) {
    existing.messages = _history;
    existing.ts = Date.now();
  } else {
    _chats.unshift({ id: _currentId, title: genTitle(), messages: _history, ts: Date.now() });
  }
  saveChats();
  renderChatList();
}

function genTitle() {
  const first = _history.find(m => m.role === 'user');
  if (!first) return 'New chat';
  return first.content.slice(0, 42).trim() + (first.content.length > 42 ? '…' : '');
}

/* ══════════════════════════════════════════════════════════
   MESSAGING
══════════════════════════════════════════════════════════ */
function handleSend() {
  if (_responding) { stopResponse(); return; }

  const input = $('composer-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto';
  sendMessage(text);
}

async function sendMessage(text) {
  if (!_session) { toast('Please sign in to chat.'); return; }
  if (_responding) return;

  _responding = true;
  setSendBtn('stop');

  // Start chat if new
  if (!_currentId) {
    _currentId = uid();
    hide('welcome-state');
  }

  // Add user message
  _history.push({ role: 'user', content: text });
  renderMessage('user', text, true);
  saveCurrentChat();

  // Show typing
  show('typing-row');
  scrollToBottom();

  // Build messages for API
  const messages = [
    { role: 'system', content: 'You are Cyanix AI, a helpful and intelligent assistant. Be concise, clear, and friendly.' },
    ..._history.slice(-20).map(m => ({ role: m.role, content: m.content }))
  ];

  _abortCtrl = new AbortController();

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: EDGE_HEADERS,
      body: JSON.stringify({
        model:    _settings.model,
        messages,
        stream:   _settings.streaming,
        max_tokens: 2048,
      }),
      signal: _abortCtrl.signal,
    });

    hide('typing-row');

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`API error ${res.status}: ${errText}`);
    }

    let aiText = '';

    if (_settings.streaming && res.body) {
      // Create AI bubble immediately
      const { msgEl, bubbleEl } = renderMessage('ai', '', true);
      bubbleEl.innerHTML = '<span class="stream-cursor"></span>';

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      while (!done) {
        const { value, done: d } = await reader.read();
        done = d;
        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(data);
            const delta  = parsed.choices?.[0]?.delta?.content || '';
            aiText += delta;
            bubbleEl.innerHTML = mdToHTML(aiText) + '<span class="stream-cursor"></span>';
            scrollToBottom();
          } catch {}
        }
      }

      // Final render without cursor
      bubbleEl.innerHTML = mdToHTML(aiText);

    } else {
      // Non-streaming
      const data   = await res.json();
      aiText       = data.choices?.[0]?.message?.content || 'No response received.';
      renderMessage('ai', aiText, true);
    }

    // Save AI response
    _history.push({ role: 'assistant', content: aiText });
    saveCurrentChat();
    scrollToBottom();

  } catch (err) {
    hide('typing-row');
    if (err.name !== 'AbortError') {
      renderMessage('ai', `❌ Error: ${err.message}`, true);
    }
  }

  _responding = false;
  setSendBtn('send');
  $('composer-input')?.focus();
}

function stopResponse() {
  _abortCtrl?.abort();
  _responding = false;
  setSendBtn('send');
  hide('typing-row');
  toast('Response stopped.');
}

function setSendBtn(state) {
  const btn = $('send-btn');
  if (!btn) return;
  if (state === 'stop') {
    btn.classList.add('stop');
    btn.title = 'Stop response';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`;
  } else {
    btn.classList.remove('stop');
    btn.title = 'Send';
    btn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  }
}

/* ══════════════════════════════════════════════════════════
   RENDER MESSAGES
══════════════════════════════════════════════════════════ */
function renderMessage(role, content, animate = true) {
  hide('welcome-state');
  const container = $('messages');
  if (!container) return {};

  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'user' : ''}`;
  if (!animate) row.style.animation = 'none';

  if (role === 'user') {
    row.innerHTML = `
      <div class="msg-content">
        <div class="msg-bubble">${esc(content)}</div>
        <div class="msg-ts">${timeStr()}</div>
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this)">Copy</button>
        </div>
      </div>
    `;
  } else {
    row.innerHTML = `
      <div class="ai-avatar"><img src="cyanix_emblem.png" alt="Cyanix AI" /></div>
      <div class="msg-content">
        <div class="msg-name"><strong>Cyanix AI</strong></div>
        <div class="msg-bubble">${content ? mdToHTML(content) : ''}</div>
        <div class="msg-ts">${timeStr()}</div>
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this)">Copy</button>
          <button class="msg-action-btn" onclick="speakMsg(this)">▶ Listen</button>
        </div>
      </div>
    `;
  }

  container.appendChild(row);
  scrollToBottom();

  const bubbleEl = row.querySelector('.msg-bubble');
  return { msgEl: row, bubbleEl };
}

window.copyMsg = function(btn) {
  const bubble = btn.closest('.msg-content').querySelector('.msg-bubble');
  navigator.clipboard?.writeText(bubble.innerText || bubble.textContent || '').then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
};

window.speakMsg = async function(btn) {
  const bubble = btn.closest('.msg-content').querySelector('.msg-bubble');
  const text   = (bubble.innerText || bubble.textContent || '').trim().slice(0, 2000);
  if (!text) return;

  if (_ttsSpeaking) {
    if (_ttsAudio) { _ttsAudio.pause(); _ttsAudio = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    _ttsSpeaking = false;
    btn.textContent = '▶ Listen';
    return;
  }

  btn.textContent = '◉ Stop';
  _ttsSpeaking = true;

  try {
    const res = await fetch(TTS_URL, {
      method: 'POST',
      headers: EDGE_HEADERS,
      body: JSON.stringify({ text, model: TTS_MODEL }),
    });

    if (!res.ok) throw new Error('TTS unavailable');

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    _ttsAudio  = new Audio(url);
    _ttsAudio.onended = () => { _ttsSpeaking = false; btn.textContent = '▶ Listen'; URL.revokeObjectURL(url); };
    _ttsAudio.onerror = () => { _ttsSpeaking = false; btn.textContent = '▶ Listen'; };
    await _ttsAudio.play();
  } catch {
    // Fallback to Web Speech API
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang  = 'en-US'; utt.rate = 1.0;
      utt.onend = () => { _ttsSpeaking = false; btn.textContent = '▶ Listen'; };
      window.speechSynthesis.speak(utt);
    } else {
      _ttsSpeaking = false; btn.textContent = '▶ Listen';
      toast('TTS not available.');
    }
  }
};

function clearMessages() {
  const m = $('messages');
  if (!m) return;
  // Remove all message rows but keep welcome state
  m.querySelectorAll('.msg-row').forEach(el => el.remove());
}

function showWelcome() {
  show('welcome-state');
}

function scrollToBottom() {
  const s = $('chat-scroll');
  if (s) s.scrollTop = s.scrollHeight;
}

/* ══════════════════════════════════════════════════════════
   SETTINGS PERSISTENCE
══════════════════════════════════════════════════════════ */
function saveSettings() {
  try { localStorage.setItem('cx_settings', JSON.stringify(_settings)); } catch {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('cx_settings');
    if (raw) Object.assign(_settings, JSON.parse(raw));
  } catch {}

  // Sync toggles
  if ($('streaming-toggle')) $('streaming-toggle').checked = _settings.streaming;
  if ($('theme-select'))     $('theme-select').value       = _settings.theme;
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}
