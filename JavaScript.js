/* ══════════════════════════════════════════════════════════════
   CYANIX AI — JavaScript.js  v12
   Supabase Auth · Chat History · Groq Streaming · RAG · TTS · STT
══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Config ──────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = SUPABASE_URL + '/functions/v1/cyanix-chat';
const TTS_URL       = SUPABASE_URL + '/functions/v1/tts';
const TRAINING_URL  = SUPABASE_URL + '/functions/v1/collect-training-data';
const RAG_URL       = SUPABASE_URL + '/functions/v1/rag-search';
const WHISPER_URL   = SUPABASE_URL + '/functions/v1/whisper';
const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];

/* ── Models ──────────────────────────────────────────────── */
const MODELS = [
  { id: 'openai/gpt-oss-20b',           name: 'GPT OSS 20B',       tag: 'FAST',  desc: '128k context · Fast everyday tasks'  },
  { id: 'openai/gpt-oss-120b',          name: 'GPT OSS 120B',      tag: 'POWER', desc: '128k context · Deep reasoning'        },
  { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT OSS Safeguard', tag: 'SAFE',  desc: 'Moderation · Safety-filtered'         },
];

/* ── Welcome data ────────────────────────────────────────── */
const WELCOME_GREETINGS = [
  { h: "Good morning",          s: "What shall we accomplish together?" },
  { h: "Hey, ready to create?", s: "Drop a question or idea to get started." },
  { h: "Welcome back!",         s: "Pick up where you left off, or start fresh." },
  { h: "Let's get to work",     s: "I'm here and ready — what's on your mind?" },
  { h: "What's on your mind?",  s: "Ask me anything, from code to creativity." },
  { h: "Hello! I'm Cyanix AI",  s: "Intelligent answers, web search, voice — all here." },
  { h: "Rise and grind",        s: "Let's make something great. What are we building?" },
  { h: "Hi there!",             s: "Type a question or pick a suggestion below." },
];

const WELCOME_CARDS = [
  { icon: '💻', title: 'Write code',         sub: 'Explain, debug or generate code',        prompt: 'Write a Python function that' },
  { icon: '🌐', title: 'Search the web',      sub: 'Get real-time answers from the web',     prompt: 'Search for the latest news on' },
  { icon: '✍️', title: 'Write something',    sub: 'Blog posts, emails, captions',            prompt: 'Write a blog post about' },
  { icon: '🧠', title: 'Explain a concept',  sub: 'Break down any complex topic',            prompt: 'Explain how' },
  { icon: '📊', title: 'Analyse data',        sub: 'Charts, summaries, insights',             prompt: 'Help me analyse this data:' },
  { icon: '🎨', title: 'Creative ideas',      sub: 'Brainstorm, scripts, stories',            prompt: 'Give me 5 creative ideas for' },
  { icon: '🔍', title: 'Research a topic',    sub: 'Summarise and cite sources',              prompt: 'Research and summarise' },
  { icon: '⚡', title: 'Productivity boost',  sub: 'Checklists, plans, time management',      prompt: 'Help me plan my week for' },
  { icon: '📚', title: 'Summarise content',   sub: 'Paste an article or document',            prompt: 'Summarise this:' },
  { icon: '💡', title: 'Problem solving',     sub: 'Walk through any challenge step by step', prompt: 'Help me solve this problem:' },
];

/* ── State ───────────────────────────────────────────────── */
let _sb          = null;
let _session     = null;
let _chats       = [];
let _currentId   = null;
let _history     = [];
let _responding  = false;
let _abortCtrl   = null;
let _ttsAudio    = null;
let _ttsSpeaking = false;
let _ragEnabled  = false;
let _ragAuto     = false;
let _mediaRec    = null;
let _sttChunks   = [];
let _sttActive   = false;
// no splash state needed
let _signedInUser = null;
let _syncPending  = false;  // FIX: prevents race condition on rapid sends

let _settings = {
  model:           MODELS[0].id,
  streaming:       true,
  theme:           'light',
  trainingConsent: false,
  displayName:     '',
  personality:     'friendly',
  ragAuto:         false,
};

const PERSONALITIES = {
  friendly:     'You are warm, encouraging, and conversational. Use a natural tone like talking to a friend.',
  professional: 'You are formal, precise, and business-like. Responses are structured and thorough.',
  creative:     'You are imaginative, expressive, and think outside the box. Use vivid language and novel ideas.',
  concise:      'You are extremely brief. Answer in as few words as possible. No filler, no repetition.',
  mentor:       'You are a patient teacher. Explain step-by-step, check understanding, and guide the user to learn.',
  witty:        'You are clever and humorous. Use light wit and playful wordplay while still being helpful.',
};

/* ── DOM helpers ──────────────────────────────────────────── */
const $    = id => document.getElementById(id);
const show = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.remove('hidden'); };
const hide = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.add('hidden'); };
const on   = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

function toast(msg, ms) {
  ms = ms || 2800;
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  show(t);
  clearTimeout(t._timer);
  t._timer = setTimeout(() => hide(t), ms);
}

function esc(s) {
  return String(s)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function localUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function buildSystemPrompt() {
  const p = PERSONALITIES[_settings.personality] || PERSONALITIES.friendly;
  const n = _settings.displayName
    ? 'The user' + String.fromCharCode(39) + 's name is ' + _settings.displayName + '. Always address them as ' + _settings.displayName + '.'
    : '';
  return ['You are Cyanix AI, a powerful and intelligent assistant.', p, n].filter(Boolean).join(' ');
}

function edgeHeaders() {
  const token = (_session && _session.access_token) ? _session.access_token : SUPABASE_ANON;
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + token,
    'apikey':        SUPABASE_ANON,
  };
}

/* ══════════════════════════════════════════════════════════
   MARKDOWN RENDERER
══════════════════════════════════════════════════════════ */
function mdToHTML(raw) {
  let text = String(raw || '');
  let thinkHTML = '';

  text = text.replace(/<think>([\s\S]*?)<\/think>/gi, function(_, content) {
    const trimmed = content.trim();
    if (!trimmed) return '';
    const safe = trimmed
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
    thinkHTML = '<details class="think-block" open>' +
      '<summary class="think-summary">Cyanix is thinking\u2026</summary>' +
      '<div class="think-body">' + safe + '</div></details>';
    return '';
  });

  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, function(_, lang, code) {
    const escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const l = esc(lang || 'code');
    return '<div class="code-block">' +
      '<div class="code-block-header"><span>' + l + '</span>' +
      '<button class="code-copy-btn" onclick="copyCode(this)">Copy</button></div>' +
      '<pre><code>' + escaped + '</code></pre></div>';
  });

  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/_(.+?)_/g, '<em>$1</em>');
  text = text.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.+)$/gm,  '<h2>$1</h2>');
  text = text.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
  text = text.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  text = text.replace(/^---+$/gm, '<hr>');
  text = text.replace(/^[-*+] (.+)$/gm, '<li>$1</li>');
  text = text.replace(/((<li>[\s\S]*?<\/li>\n?)+)/g, '<ul>$1</ul>');
  text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const paragraphs = text.split(/\n{2,}/);
  text = paragraphs.map(function(p) {
    p = p.trim();
    if (!p) return '';
    if (/^<(h[1-6]|ul|ol|li|blockquote|hr|details|div|pre)/.test(p)) return p;
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  return (thinkHTML ? thinkHTML + '\n' : '') + text;
}

window.copyCode = function(btn) {
  const pre = btn.closest('.code-block').querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.innerText || pre.textContent || '').then(function() {
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  });
};

/* ══════════════════════════════════════════════════════════
   BOOT — no splash, instant render
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  // Clear the blank-screen safety net — page loaded successfully
  if (window._safetyTimer) clearTimeout(window._safetyTimer);

  loadSettings();
  applyTheme(_settings.theme);
  bindAuthUI();
  bindChatUI();
  populateModels();
  handleStartActions();
  setTimeout(attachAllRipples, 150);

  // Auth view is already visible in HTML — no splash to remove.
  // If Supabase is misconfigured, auth view is already showing so user sees the form.
  if (!SUPABASE_URL.startsWith('https://') || SUPABASE_ANON.length < 40) {
    console.error('[CyanixAI] Supabase not configured.');
    return; // auth view already visible
  }

  if (!window.supabase || !window.supabase.createClient) {
    console.error('[CyanixAI] Supabase SDK failed to load.');
    return; // auth view already visible
  }

  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession:     true,
      autoRefreshToken:   true,
      detectSessionInUrl: true,
      storageKey:         'cyanix-auth',
    },
  });

  _sb.auth.onAuthStateChange(function(event, session) {
    _session = session;
    // SIGNED_IN fires on: new login, OAuth redirect, AND token refresh.
    // Guard: only run onSignedIn for a genuinely new user session,
    // not for silent token refreshes while already in chat.
    if (event === 'SIGNED_IN') {
      if (_signedInUser && session && _signedInUser === session.user.id) return; // already loaded
      onSignedIn(session);
    }
    if (event === 'SIGNED_OUT') onSignedOut();
  });

  // Check for existing session — if found, jump straight to chat
  try {
    const result = await _sb.auth.getSession();
    if (result.error || !result.data || !result.data.session) return; // stay on auth
    _session = result.data.session;
    await onSignedIn(_session);
  } catch (err) {
    console.error('[CyanixAI] boot:', err);
    // auth view already visible, nothing to do
  }
});

function handleStartActions() {
  const action     = window._startAction;
  const sharedText = window._sharedText;
  if (action === 'new-chat') {
    window.addEventListener('cyanix:ready', function() { newChat(); }, { once: true });
  } else if (action === 'settings') {
    window.addEventListener('cyanix:ready', function() { show('settings-modal'); }, { once: true });
  }
  if (sharedText) {
    window.addEventListener('cyanix:ready', function() {
      const inp = $('composer-input');
      if (inp) {
        inp.value = sharedText;
        inp.style.height = 'auto';
        inp.style.height = Math.min(inp.scrollHeight, 150) + 'px';
        inp.focus();
      }
    }, { once: true });
  }
}

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
function bindAuthUI() {
  document.querySelectorAll('.switch-link').forEach(function(a) {
    a.addEventListener('click', function(e) { e.preventDefault(); showPanel(a.dataset.to); });
  });
  on('forgot-link', 'click', function(e) { e.preventDefault(); showPanel('forgot'); });

  on('si-btn',      'click',  signIn);
  on('si-email',    'keydown', function(e) { if (e.key === 'Enter') { const p = $('si-password'); if (p) p.focus(); } });
  on('si-password', 'keydown', function(e) { if (e.key === 'Enter') signIn(); });
  on('su-btn',      'click',  signUp);
  on('su-password', 'keydown', function(e) { if (e.key === 'Enter') signUp(); });
  on('fp-btn',      'click',  sendReset);
  on('fp-email',    'keydown', function(e) { if (e.key === 'Enter') sendReset(); });

  on('si-google', 'click', function() { signInOAuth('google'); });
  on('si-github', 'click', function() { signInOAuth('github'); });
  on('su-google', 'click', function() { signInOAuth('google'); });
  on('su-github', 'click', function() { signInOAuth('github'); });
}

function showPanel(name) {
  ['signin', 'signup', 'forgot'].forEach(function(p) {
    const el = $('panel-' + p);
    if (el) el.classList.toggle('hidden', p !== name);
  });
  clearAuthMessages();
  if (name === 'signup') initDobField();
}

function clearAuthMessages() {
  ['si-err','si-ok','su-err','su-ok','fp-err','fp-ok'].forEach(function(id) {
    const el = $(id); if (el) { el.textContent = ''; hide(el); }
  });
}

function setMsg(id, msg, type) {
  const el = $(id); if (!el) return;
  el.textContent = msg; el.dataset.type = type; show(el);
}

async function signIn() {
  if (!_sb) { setMsg('si-err', 'App not ready — please refresh the page.', 'err'); return; }
  const emailEl = $('si-email'); const passEl = $('si-password');
  const email = emailEl ? emailEl.value.trim() : '';
  const password = passEl ? passEl.value : '';
  if (!email || !password) { setMsg('si-err', 'Please enter your email and password.', 'err'); return; }
  const btn = $('si-btn');
  const span = btn && btn.querySelector('span');
  if (btn) btn.disabled = true;
  if (span) span.textContent = 'Signing in\u2026';
  clearAuthMessages();
  try {
    const result = await _sb.auth.signInWithPassword({ email, password });
    if (result.error) setMsg('si-err', result.error.message, 'err');
  } catch (err) {
    setMsg('si-err', err.message || 'Sign in failed.', 'err');
  } finally {
    if (btn) btn.disabled = false;
    if (span) span.textContent = 'Sign In';
  }
}

async function signUp() {
  if (!_sb) { setMsg('su-err', 'App not ready — please refresh the page.', 'err'); return; }
  const name     = $('su-name')
  const email    = $('su-email')    ? $('su-email').value.trim()    : '';
  const password = $('su-password') ? $('su-password').value        : '';
  const dobVal   = $('su-dob')      ? $('su-dob').value             : '';
  if (!email || !password) { setMsg('su-err', 'Please fill in all fields.', 'err'); return; }
  if (password.length < 8)  { setMsg('su-err', 'Password must be at least 8 characters.', 'err'); return; }
  if (!dobVal)              { setMsg('su-err', 'Please enter your date of birth.', 'err'); return; }
  const dob = new Date(dobVal); const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const md = today.getMonth() - dob.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;
  if (isNaN(age) || dob > today) { setMsg('su-err', 'Please enter a valid date of birth.', 'err'); return; }
  if (age < 13) { setMsg('su-err', 'You must be 13 or older to use Cyanix AI.', 'err'); return; }
  const btn = $('su-btn'); const span = btn && btn.querySelector('span');
  if (btn) btn.disabled = true;
  if (span) span.textContent = 'Creating account\u2026';
  clearAuthMessages();
  try {
    const result = await _sb.auth.signUp({
      email, password,
      options: { data: { full_name: name || email.split('@')[0], dob: dobVal }, emailRedirectTo: REDIRECT_URL },
    });
    if (result.error) setMsg('su-err', result.error.message, 'err');
    else setMsg('su-ok', 'Check your email to confirm your account!', 'ok');
  } catch (err) {
    setMsg('su-err', err.message || 'Sign up failed.', 'err');
  } finally {
    if (btn) btn.disabled = false;
    if (span) span.textContent = 'Create Account';
  }
}

function initDobField() {
  const dob = $('su-dob'); if (!dob) return;
  const today = new Date();
  const max13 = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  dob.max = max13.toISOString().split('T')[0];
  dob.min = new Date(today.getFullYear() - 120, 0, 1).toISOString().split('T')[0];
}

async function sendReset() {
  if (!_sb) { setMsg('fp-err', 'App not ready — please refresh the page.', 'err'); return; }
  const email = $('fp-email') ? $('fp-email').value.trim() : '';
  if (!email) { setMsg('fp-err', 'Please enter your email.', 'err'); return; }
  const btn = $('fp-btn'); if (btn) btn.disabled = true;
  clearAuthMessages();
  try {
    const result = await _sb.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
    if (result.error) setMsg('fp-err', result.error.message, 'err');
    else setMsg('fp-ok', 'Reset link sent! Check your email.', 'ok');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function signInOAuth(provider) {
  if (!_sb) { toast('App not ready — please refresh the page.'); return; }
  try {
    const result = await _sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_URL } });
    if (result.error) toast('OAuth error: ' + result.error.message);
  } catch (err) { toast('OAuth error: ' + err.message); }
}

async function signOut() {
  hide('settings-modal'); hide('help-modal'); hide('user-menu'); hide('model-dropdown');
  try { await _sb.auth.signOut(); } catch (e) {}
  onSignedOut();
  toast('Signed out.');
}

async function onSignedIn(session) {
  if (!session) return;
  if (_signedInUser === session.user.id && _chats.length > 0) return;
  _signedInUser = session.user.id;
  _session = session;
  _chats = []; _currentId = null; _history = [];

  hide('view-auth'); show('view-chat');

  const user = session.user;
  const name = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
  const initials = name ? name.split(' ').map(function(n) { return n[0]; }).join('').slice(0,2).toUpperCase() : '?';
  if ($('user-avatar')) $('user-avatar').textContent = initials;
  if ($('user-name'))   $('user-name').textContent   = name || user.email;

  await loadPreferences();
  await loadChats();

  if (_chats.length > 0) await loadChat(_chats[0].id);
  else showWelcome();

  setTimeout(attachAllRipples, 150);
  window.dispatchEvent(new Event('cyanix:ready'));
}

function onSignedOut() {
  _session = null; _signedInUser = null;
  _chats = []; _currentId = null; _history = [];
  if ($('user-avatar')) $('user-avatar').textContent = '?';
  if ($('user-name'))   $('user-name').textContent   = 'Loading\u2026';
  hide('view-chat'); show('view-auth'); showPanel('signin');
}

/* ══════════════════════════════════════════════════════════
   RIPPLE / HAPTIC
══════════════════════════════════════════════════════════ */
function haptic(pattern) { if (navigator.vibrate) navigator.vibrate(pattern || 10); }

function attachRipple(el) {
  if (!el || el._hasRipple) return;
  el._hasRipple = true;
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';
  el.addEventListener('pointerdown', function(e) {
    const r = document.createElement('span');
    r.className = 'cx-ripple';
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + (e.clientX - rect.left - size/2) + 'px;top:' + (e.clientY - rect.top - size/2) + 'px;';
    el.appendChild(r);
    setTimeout(function() { if (r.parentNode) r.parentNode.removeChild(r); }, 550);
  });
}

function attachAllRipples() {
  document.querySelectorAll('.auth-btn,.oauth-btn,.send-btn,.tool-btn,.msg-action-btn,.sb-new-btn,.p-chip,.topbar-icon,.sb-nav-btn,.welcome-card').forEach(attachRipple);
}

/* ══════════════════════════════════════════════════════════
   CHAT UI BINDINGS
══════════════════════════════════════════════════════════ */
function bindChatUI() {
  // On mobile, sidebar starts hidden (collapsed); on desktop it starts open
  (function() {
    const sb = $('sidebar');
    if (sb && window.innerWidth <= 700) sb.classList.add('collapsed');
  })();

  on('sidebar-toggle', 'click', function() { const sb=$('sidebar'); if(sb) sb.classList.toggle('collapsed'); });
  on('new-chat-btn', 'click', newChat);
  on('new-chat-top', 'click', newChat);

  on('send-btn', 'click', function() { haptic(8); handleSend(); });
  on('mic-btn',  'click', function() { haptic([8,50,8]); toggleVoiceInput(); });

  on('composer-input', 'keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  on('composer-input', 'input', function() {
    const ta = $('composer-input'); if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
  });

  on('rag-toggle-btn', 'click', toggleRAG);
  on('attach-btn',     'click', function() { toast('File attachments coming soon.'); });

  on('settings-btn',   'click', function() { show('settings-modal'); closeUserMenu(); });
  on('settings-close', 'click', function() { hide('settings-modal'); });
  on('settings-modal', 'click', function(e) { if (e.target.id==='settings-modal') hide('settings-modal'); });

  on('help-btn',   'click', function() { show('help-modal'); closeUserMenu(); });
  on('help-close', 'click', function() { hide('help-modal'); });
  on('help-modal', 'click', function(e) { if (e.target.id==='help-modal') hide('help-modal'); });

  on('user-btn',    'click', toggleUserMenu);
  on('um-settings', 'click', function() { closeUserMenu(); show('settings-modal'); });
  on('um-signout',  'click', function() { closeUserMenu(); signOut(); });
  on('model-btn',   'click', function() { const d=$('model-dropdown'); if(d) d.classList.toggle('hidden'); });

  on('streaming-toggle',   'change', function() { _settings.streaming = !!$('streaming-toggle').checked; saveSettings(); syncPreferences(); });
  on('theme-select',       'change', function() { _settings.theme = $('theme-select').value; applyTheme(_settings.theme); saveSettings(); syncPreferences(); });
  on('model-select',       'change', function() { _settings.model = $('model-select').value; saveSettings(); syncPreferences(); updateModelLabel(); });
  on('consent-toggle',     'change', function() {
    _settings.trainingConsent = !!$('consent-toggle').checked;
    saveSettings(); syncPreferences(); updateTrainingDataRow();
    toast(_settings.trainingConsent ? 'Training data enabled.' : 'Training data disabled.');
  });
  on('rag-auto-toggle', 'change', function() {
    _settings.ragAuto = !!$('rag-auto-toggle').checked;
    _ragAuto = _settings.ragAuto;
    saveSettings(); syncPreferences();
    toast(_ragAuto ? '🌐 Auto web search enabled' : 'Auto web search off');
  });
  on('display-name-input', 'input', function() {
    const el = $('display-name-input');
    _settings.displayName = el ? el.value.trim() : '';
    saveSettings(); syncPreferences();
  });
  on('delete-training-btn', 'click', async function() {
    if (!confirm('Withdraw your anonymized contributions?')) return;
    try { await fetch(TRAINING_URL, { method: 'DELETE', headers: edgeHeaders() }); toast('Withdrawn.'); }
    catch (e) { toast('Could not complete. Try again.'); }
  });
  on('clear-chats-btn', 'click', async function() {
    if (!confirm('Clear all chats? This cannot be undone.')) return;
    try {
      await _sb.from('chats').delete().eq('user_id', _session.user.id);
      _chats=[]; _currentId=null; _history=[];
      renderChatList(); newChat(); hide('settings-modal'); toast('All chats cleared.');
    } catch (e) { toast('Failed to clear chats.'); }
  });
  on('signout-btn', 'click', function() { hide('settings-modal'); signOut(); });

  document.querySelectorAll('.p-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      _settings.personality = chip.dataset.value;
      updatePersonalityChips(); saveSettings(); syncPreferences();
      toast('Personality: ' + chip.textContent.trim());
    });
  });

  document.addEventListener('click', function(e) {
    const ubtn = $('user-btn'); const umenu = $('user-menu');
    if (ubtn && umenu && !ubtn.contains(e.target) && !umenu.contains(e.target)) closeUserMenu();
    const mbtn = $('model-btn'); const mdd = $('model-dropdown');
    if (mbtn && mdd && !mbtn.contains(e.target) && !mdd.contains(e.target)) hide('model-dropdown');
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (_responding) stopResponse();
      hide('settings-modal'); hide('help-modal'); closeUserMenu(); hide('model-dropdown');
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); const inp = $('composer-input'); if (inp) inp.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') { e.preventDefault(); newChat(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault(); const sb=$('sidebar'); if(sb) sb.classList.toggle('collapsed');
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') { e.preventDefault(); toggleRAG(); }
  });
}

function toggleUserMenu() { const m=$('user-menu'); if(m) m.classList.toggle('hidden'); }
function closeUserMenu()  { hide('user-menu'); }

/* ══════════════════════════════════════════════════════════
   MODELS
══════════════════════════════════════════════════════════ */
function populateModels() {
  const sel = $('model-select');
  if (sel) {
    sel.innerHTML = MODELS.map(function(m) {
      return '<option value="' + m.id + '"' + (m.id === _settings.model ? ' selected' : '') + '>' + m.name + '</option>';
    }).join('');
  }
  const dd = $('model-dropdown');
  if (dd) {
    dd.innerHTML = MODELS.map(function(m) {
      return '<div class="md-option' + (m.id === _settings.model ? ' active' : '') + '" data-id="' + m.id + '">' +
        '<div class="md-name">' + esc(m.name) + '<span class="md-tag ' + m.tag + '">' + m.tag + '</span></div>' +
        '<div class="md-desc">' + esc(m.desc) + '</div></div>';
    }).join('');
    dd.querySelectorAll('.md-option').forEach(function(opt) {
      opt.addEventListener('click', function() {
        _settings.model = opt.dataset.id;
        dd.querySelectorAll('.md-option').forEach(function(o) { o.classList.remove('active'); });
        opt.classList.add('active');
        hide('model-dropdown');
        if ($('model-select')) $('model-select').value = _settings.model;
        updateModelLabel(); saveSettings(); syncPreferences();
        const found = MODELS.find(function(m) { return m.id === _settings.model; });
        if (found) toast('Model: ' + found.name);
      });
    });
  }
  updateModelLabel();
}

function updateModelLabel() {
  const m = MODELS.find(function(x) { return x.id === _settings.model; });
  const el = $('model-name-label');
  if (el) el.textContent = m ? m.name : 'Select model';
}

function updateTrainingDataRow() {
  const row = $('training-data-row');
  if (row) row.style.display = _settings.trainingConsent ? '' : 'none';
}

function updatePersonalityChips() {
  document.querySelectorAll('.p-chip').forEach(function(chip) {
    chip.classList.toggle('active', chip.dataset.value === _settings.personality);
  });
}

/* ══════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════ */
function saveSettings() {
  try { localStorage.setItem('cx_settings', JSON.stringify(_settings)); } catch (e) {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('cx_settings');
    if (raw) Object.assign(_settings, JSON.parse(raw));
  } catch (e) {}
  syncSettingsToUI();
}

function syncSettingsToUI() {
  if ($('streaming-toggle'))   $('streaming-toggle').checked   = !!_settings.streaming;
  if ($('theme-select'))       $('theme-select').value         = _settings.theme || 'light';
  if ($('consent-toggle'))     $('consent-toggle').checked     = !!_settings.trainingConsent;
  if ($('display-name-input')) $('display-name-input').value   = _settings.displayName || '';
  if ($('rag-auto-toggle'))    $('rag-auto-toggle').checked    = !!_settings.ragAuto;
  _ragAuto = !!_settings.ragAuto;
  updateTrainingDataRow();
  updatePersonalityChips();
}

function applyTheme(theme) { document.documentElement.dataset.theme = theme || 'light'; }

async function loadPreferences() {
  if (!_session) return;
  try {
    const result = await _sb.from('user_preferences').select('*').eq('user_id', _session.user.id).single();
    if (result.data) {
      const d = result.data;
      if (d.model)                 _settings.model           = d.model;
      if (d.streaming       != null) _settings.streaming      = d.streaming;
      if (d.theme)                 _settings.theme           = d.theme;
      if (d.training_consent != null) _settings.trainingConsent = d.training_consent;
      if (d.display_name)          _settings.displayName     = d.display_name;
      if (d.personality)           _settings.personality     = d.personality;
      if (d.rag_auto        != null) _settings.ragAuto        = d.rag_auto;
      _ragAuto = !!_settings.ragAuto;
      saveSettings(); applyTheme(_settings.theme); populateModels(); syncSettingsToUI();
    }
  } catch (e) {}
}

async function syncPreferences() {
  if (!_session) return;
  try {
    await _sb.from('user_preferences').upsert({
      user_id: _session.user.id, model: _settings.model, streaming: _settings.streaming,
      theme: _settings.theme, training_consent: _settings.trainingConsent,
      display_name: _settings.displayName || null, personality: _settings.personality || 'friendly',
      rag_auto: !!_settings.ragAuto, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (e) {}
}

/* ══════════════════════════════════════════════════════════
   CHAT HISTORY
══════════════════════════════════════════════════════════ */
async function loadChats() {
  if (!_session) return;
  try {
    const result = await _sb.from('chats').select('id,title,model,updated_at')
      .eq('user_id', _session.user.id).order('updated_at', { ascending: false }).limit(100);
    if (result.error) throw result.error;
    _chats = result.data || [];
    renderChatList();
  } catch (e) { _chats = []; renderChatList(); }
}

async function loadChat(id) {
  if (!_session || !id) return;
  try {
    const result = await _sb.from('messages').select('id,role,content,created_at')
      .eq('chat_id', id).order('created_at', { ascending: true });
    if (result.error) throw result.error;
    _currentId = id;
    _history   = (result.data || []).map(function(m) { return { id: m.id, role: m.role, content: m.content }; });
    const chat = _chats.find(function(c) { return c.id === id; });
    if ($('chat-title')) $('chat-title').textContent = chat ? chat.title : 'Chat';
    clearMessages(); hide('welcome-state');
    _history.forEach(function(msg) { renderMessage(msg.role, msg.content, false, msg.id); });
    renderChatList(); scrollToBottom();
  } catch (e) { toast('Failed to load chat.'); }
}

async function syncChatToDB(localId, title) {
  if (!_sb || !_session) { console.error('[CyanixAI] syncChatToDB: no session'); return null; }
  try {
    const result = await _sb.from('chats').insert({
      user_id: _session.user.id,
      title:   title,
      model:   _settings.model
    }).select('id').single();
    if (result.error) {
      console.error('[CyanixAI] syncChatToDB error:', result.error.message, result.error.details, result.error.hint);
      return null;
    }
    const newId = result.data && result.data.id;
    if (newId && newId !== localId) {
      _currentId = newId;
      _chats = _chats.map(function(c) { return c.id === localId ? Object.assign({}, c, { id: newId }) : c; });
      renderChatList();
    }
    console.log('[CyanixAI] chat saved:', newId);
    return newId;
  } catch (e) { console.error('[CyanixAI] syncChatToDB exception:', e); return null; }
}

async function syncMessagesToDB(chatId, userText, aiText) {
  if (!_sb || !_session || !chatId) { console.error('[CyanixAI] syncMessagesToDB: missing params', { sb: !!_sb, session: !!_session, chatId }); return null; }
  try {
    const result = await _sb.from('messages').insert([
      { chat_id: chatId, user_id: _session.user.id, role: 'user',      content: userText },
      { chat_id: chatId, user_id: _session.user.id, role: 'assistant', content: aiText   },
    ]).select('id');
    if (result.error) {
      console.error('[CyanixAI] syncMessagesToDB error:', result.error.message, result.error.details, result.error.hint);
      return null;
    }
    console.log('[CyanixAI] messages saved for chat:', chatId);
    return result.data && result.data[1] ? result.data[1].id : null;
  } catch (e) { console.error('[CyanixAI] syncMessagesToDB exception:', e); return null; }
}

async function bgSyncMessages(isNewChat, localChatId, userText, aiText, msgEl) {
  // FIX: use localChatId param (captured at send time) — not _currentId which
  // may have been updated by a parallel sync completing first.
  let chatId = localChatId;
  try {
    if (isNewChat) {
      // Prevent concurrent new-chat syncs from creating duplicate rows
      if (_syncPending) {
        // Wait for the in-flight sync to finish and reuse its chat ID
        await new Promise(function(res) { setTimeout(res, 600); });
        chatId = _currentId; // pick up the real ID after the wait
      } else {
        _syncPending = true;
        const realId = await syncChatToDB(chatId, userText.slice(0, 60).trim());
        _syncPending = false;
        if (realId) chatId = realId;
      }
    }
    const aiMsgId = await syncMessagesToDB(chatId, userText, aiText);
    if (aiMsgId && msgEl) addFeedbackButtons(msgEl, aiMsgId);
    await maybeCollectTraining(userText, aiText);
    await loadChats();
  } catch (e) {
    _syncPending = false;
  }
}

async function maybeCollectTraining(userText, aiText) {
  if (!_settings.trainingConsent || !_session) return;
  try {
    await fetch(TRAINING_URL, { method: 'POST', headers: edgeHeaders(),
      body: JSON.stringify({ message: userText, response: aiText, model: _settings.model }) });
  } catch (e) {}
}

async function deleteChat(id) {
  try {
    await _sb.from('chats').delete().eq('id', id);
    _chats = _chats.filter(function(c) { return c.id !== id; });
    if (_currentId === id) newChat(); else renderChatList();
    toast('Chat deleted.');
  } catch (e) { toast('Failed to delete chat.'); }
}

/* ══════════════════════════════════════════════════════════
   CHAT LIST RENDER
══════════════════════════════════════════════════════════ */
function renderChatList() {
  const list = $('chat-list'); if (!list) return;
  if (_chats.length === 0) {
    list.innerHTML = '<div class="sb-empty">No conversations yet</div>';
    return;
  }
  list.innerHTML = _chats.map(function(c) {
    const active = c.id === _currentId ? ' active' : '';
    return '<div class="chat-item' + active + '" data-id="' + esc(c.id) + '">' +
      '<span class="ci-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>' +
      '<span class="ci-label">' + esc(c.title || 'New chat') + '</span>' +
      '<button class="ci-del" data-id="' + esc(c.id) + '">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button></div>';
  }).join('');
  list.querySelectorAll('.chat-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (e.target.closest('.ci-del')) return;
      loadChat(item.dataset.id);
    });
  });
  list.querySelectorAll('.ci-del').forEach(function(btn) {
    btn.addEventListener('click', function(e) { e.stopPropagation(); deleteChat(btn.dataset.id); });
  });
}

function newChat() {
  _currentId = null; _history = [];
  if ($('chat-title')) $('chat-title').textContent = 'New chat';
  clearMessages(); showWelcome(); renderChatList();
  const inp = $('composer-input'); if (inp) inp.focus();
  if (_ragEnabled && !_ragAuto) {
    _ragEnabled = false;
    const btn = $('rag-toggle-btn'); if (btn) btn.classList.remove('active');
    hide('rag-pill');
  }
}

/* ══════════════════════════════════════════════════════════
   RAG
══════════════════════════════════════════════════════════ */
function toggleRAG() {
  _ragEnabled = !_ragEnabled;
  const btn = $('rag-toggle-btn'); const pill = $('rag-pill');
  if (btn)  btn.classList.toggle('active', _ragEnabled);
  if (pill) pill.classList.toggle('hidden', !_ragEnabled);
  toast(_ragEnabled ? '🌐 Web search ON' : 'Web search off');
}

function needsWebSearch(text) {
  const q = text.toLowerCase();
  return /^(search|find|look up|google|fetch)/i.test(q) ||
    /(today|right now|currently|recent|latest|news|breaking|2024|2025|2026)/i.test(q) ||
    /(weather|forecast|stock price|exchange rate|crypto|score|result|standings)/i.test(q) ||
    /(who is|who are|who was|president|prime minister|ceo) of/i.test(q) ||
    /(price of|cost of|how much (does|is))/i.test(q) ||
    (q.split(' ').length <= 5 && /^(what|who|where|when|how|is|are|was)/.test(q));
}

async function fetchRAGContext(query) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(function() { ctrl.abort(); }, 8000);
    const res = await fetch(RAG_URL, { method: 'POST', headers: edgeHeaders(), body: JSON.stringify({ query: query }), signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

function buildRAGContext(ragData) {
  if (!ragData) return '';
  const parts = [];
  if (ragData.abstract) parts.push('Summary: ' + ragData.abstract);
  if (ragData.results && ragData.results.length) {
    parts.push('Search results:');
    ragData.results.slice(0, 5).forEach(function(r, i) {
      parts.push('[' + (i+1) + '] ' + r.title + ' — ' + r.snippet + ' (' + r.url + ')');
    });
  }
  return parts.length ? '\n\n[WEB SEARCH CONTEXT]\n' + parts.join('\n') + '\n[END WEB SEARCH]' : '';
}

function appendRAGSources(bubbleEl, ragData) {
  if (!bubbleEl || !ragData || !ragData.results || !ragData.results.length) return;
  const src = document.createElement('div');
  src.className = 'rag-sources';
  let html = '<div class="rag-sources-label">Sources</div>';
  ragData.results.slice(0, 4).forEach(function(r) {
    html += '<a class="rag-source-item" href="' + esc(r.url) + '" target="_blank" rel="noopener">' +
      '<div class="rag-source-dot"></div><span>' + esc(r.title) + '</span></a>';
  });
  src.innerHTML = html;
  bubbleEl.appendChild(src);
}

/* ══════════════════════════════════════════════════════════
   MESSAGING
══════════════════════════════════════════════════════════ */
function handleSend() {
  if (_responding) { stopResponse(); return; }
  const input = $('composer-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  input.value = ''; input.style.height = 'auto';
  sendMessage(text);
}

async function sendMessage(text) {
  if (!_session) { toast('Please sign in to chat.'); return; }
  if (_responding) return;
  _responding = true;
  setSendBtn('stop');

  const isNewChat = !_currentId;
  if (isNewChat) {
    _currentId = localUUID();
    const title = text.slice(0, 60).trim();
    _chats.unshift({ id: _currentId, title: title, updated_at: new Date().toISOString() });
    renderChatList();
    if ($('chat-title')) $('chat-title').textContent = title;
  }

  hide('welcome-state');
  _history.push({ role: 'user', content: text });
  renderMessage('user', text, true);
  show('typing-row');
  scrollToBottom();

  let ragData = null;
  if (_ragEnabled || (_ragAuto && needsWebSearch(text))) {
    const tl = $('thinking-text');
    if (tl) tl.textContent = 'Searching the web\u2026';
    ragData = await fetchRAGContext(text);
    if (tl) tl.textContent = 'Cyanix is thinking';
  }

  const messages = [{ role: 'system', content: buildSystemPrompt() + buildRAGContext(ragData) }]
    .concat(_history.slice(-20).map(function(m) { return { role: m.role, content: m.content }; }));

  _abortCtrl = new AbortController();
  let aiText = '';

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST', headers: edgeHeaders(), signal: _abortCtrl.signal,
      body: JSON.stringify({ model: _settings.model, messages: messages,
        stream: _settings.streaming, max_tokens: 2048,
        chat_id: _currentId, user_message: text }),
    });

    hide('typing-row');

    if (!res.ok) {
      const errText = await res.text().catch(function() { return 'Unknown error'; });
      throw new Error('API ' + res.status + ': ' + errText);
    }

    if (_settings.streaming && res.body) {
      const rendered = renderMessage('ai', '', true);
      const bubbleEl = rendered.bubbleEl;
      const msgEl    = rendered.msgEl;
      bubbleEl.innerHTML = '<span class="stream-cursor"></span>';

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let done = false; let buf = ''; let timedOut = false;
      const tmo = setTimeout(function() { timedOut = true; reader.cancel(); }, 45000);

      try {
        while (!done) {
          const chunk = await reader.read();
          done = chunk.done;
          if (!chunk.value) continue;
          buf += dec.decode(chunk.value, { stream: true });
          const lines = buf.split('\n'); buf = lines.pop() || '';
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') { done = true; break; }
            try {
              const p = JSON.parse(data);
              const delta = p.choices && p.choices[0] && p.choices[0].delta && p.choices[0].delta.content;
              if (delta) {
                aiText += delta;
                bubbleEl.innerHTML = renderStreamingContent(aiText) + '<span class="stream-cursor"></span>';
                scrollToBottom();
              }
            } catch (e) {}
          }
        }
      } catch (e) {
        if (e && e.name !== 'AbortError') throw e;
      } finally {
        clearTimeout(tmo);
      }

      if (!aiText.trim()) {
        bubbleEl.innerHTML = '<span style="color:var(--red)">' + (timedOut ? 'Response timed out. Try again.' : 'No response received.') + '</span>';
        aiText = '';
      } else {
        bubbleEl.innerHTML = mdToHTML(aiText);
        if (ragData) appendRAGSources(bubbleEl, ragData);
      }
      if (aiText.trim()) {
        _history.push({ role: 'assistant', content: aiText });
        bgSyncMessages(isNewChat, _currentId, text, aiText, msgEl);
      }

    } else {
      const data = await res.json();
      aiText = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || 'No response received.';
      const rendered = renderMessage('ai', aiText, true);
      if (ragData && rendered.bubbleEl) appendRAGSources(rendered.bubbleEl, ragData);
      _history.push({ role: 'assistant', content: aiText });
      bgSyncMessages(isNewChat, _currentId, text, aiText, rendered.msgEl);
    }

    scrollToBottom();

  } catch (err) {
    hide('typing-row');
    if (err && err.name !== 'AbortError') {
      renderMessage('ai', '❌ Error: ' + esc(err.message), true);
    }
  } finally {
    _responding = false;
    setSendBtn('send');
    _abortCtrl = null;
  }
}

function stopResponse() {
  if (_abortCtrl) _abortCtrl.abort();
  _responding = false; setSendBtn('send'); hide('typing-row');
}

function renderStreamingContent(text) {
  if (text.includes('<think>') && text.includes('</think>')) return mdToHTML(text);
  if (text.includes('<think>') && !text.includes('</think>')) {
    const safe = text.slice(text.indexOf('<think>') + 7)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
    return '<details class="think-block" open><summary class="think-summary">Cyanix is thinking\u2026</summary><div class="think-body">' + safe + '</div></details>';
  }
  return mdToHTML(text);
}

function setSendBtn(state) {
  const btn = $('send-btn'); if (!btn) return;
  if (state === 'stop') {
    btn.classList.add('stop'); btn.title = 'Stop response';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
  } else {
    btn.classList.remove('stop'); btn.title = 'Send';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  }
}

/* ══════════════════════════════════════════════════════════
   RENDER MESSAGES
══════════════════════════════════════════════════════════ */
function renderMessage(role, content, animate, msgId) {
  hide('welcome-state');
  const container = $('messages');
  if (!container) return { msgEl: null, bubbleEl: null };

  const row = document.createElement('div');
  row.className = 'msg-row' + (role === 'user' ? ' user' : '');
  if (msgId) row.dataset.msgId = msgId;
  if (!animate) row.style.animation = 'none';

  if (role === 'user') {
    row.innerHTML =
      '<div class="msg-content">' +
        '<div class="msg-bubble" data-raw="' + esc(content) + '">' + esc(content) + '</div>' +
        '<div class="msg-ts">' + timeStr() + '</div>' +
        '<div class="msg-actions">' +
          '<button type="button" class="msg-action-btn" onclick="copyMsg(this)">Copy</button>' +
          '<button type="button" class="msg-action-btn" onclick="editMessage(this)">✏️ Edit</button>' +
        '</div>' +
      '</div>';
  } else {
    row.innerHTML =
      '<div class="ai-avatar"><img src="cyanix_emblem.png" alt="Cyanix AI"/></div>' +
      '<div class="msg-content">' +
        '<div class="msg-name"><strong>Cyanix AI</strong></div>' +
        '<div class="msg-bubble">' + (content ? mdToHTML(content) : '') + '</div>' +
        '<div class="msg-ts">' + timeStr() + '</div>' +
        '<div class="msg-actions">' +
          '<button type="button" class="msg-action-btn" onclick="copyMsg(this)">Copy</button>' +
          '<button type="button" class="msg-action-btn" onclick="speakMsg(this)">&#9654; Listen</button>' +
        '</div>' +
      '</div>';
  }

  container.appendChild(row);
  scrollToBottom();
  return { msgEl: row, bubbleEl: row.querySelector('.msg-bubble') };
}

function addFeedbackButtons(msgEl, messageId) {
  if (!msgEl || !messageId) return;
  const actions = msgEl.querySelector('.msg-actions'); if (!actions) return;
  const up = document.createElement('button'); const down = document.createElement('button');
  up.className = 'msg-action-btn'; down.className = 'msg-action-btn';
  up.textContent = '👍'; down.textContent = '👎';
  up.addEventListener('click',   function() { submitFeedback(messageId,  1, up,   down); });
  down.addEventListener('click', function() { submitFeedback(messageId, -1, down, up);   });
  actions.appendChild(up); actions.appendChild(down);
}

async function submitFeedback(messageId, value, clickedBtn, otherBtn) {
  clickedBtn.classList.add('voted'); otherBtn.classList.remove('voted');
  try {
    await _sb.from('message_feedback').upsert({ message_id: messageId, chat_id: _currentId, user_id: _session.user.id, feedback: value }, { onConflict: 'message_id,user_id' });
    toast(value === 1 ? 'Thanks!' : 'Got it, we' + String.fromCharCode(39) + 'll improve.');
  } catch (e) { toast('Could not save feedback.'); }
}

window.editMessage = function(btn) {
  const msgRow  = btn.closest('.msg-row');
  const bubble  = msgRow.querySelector('.msg-bubble');
  const rawText = bubble.dataset.raw || bubble.textContent.trim();
  const content = msgRow.querySelector('.msg-content');
  if (content.querySelector('.edit-area')) return;
  const ea = document.createElement('div');
  ea.className = 'edit-area';
  ea.innerHTML = '<textarea class="edit-textarea">' + rawText.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</textarea>' +
    '<div class="edit-actions"><button class="edit-cancel-btn">Cancel</button><button class="edit-send-btn">Send &amp; Regenerate</button></div>';
  bubble.style.display = 'none';
  content.insertBefore(ea, content.querySelector('.msg-ts'));
  const ta = ea.querySelector('.edit-textarea');
  ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; ta.focus();
  ta.addEventListener('input', function() { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; });
  ta.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doEdit(); }
    if (e.key === 'Escape') cancelEdit();
  });
  ea.querySelector('.edit-cancel-btn').onclick = cancelEdit;
  ea.querySelector('.edit-send-btn').onclick   = doEdit;
  function cancelEdit() { ea.remove(); bubble.style.display = ''; }
  function doEdit() {
    const newText = ta.value.trim(); if (!newText) return;
    const allRows = Array.from($('messages').querySelectorAll('.msg-row'));
    const ri = allRows.indexOf(msgRow);
    const uc = allRows.slice(0, ri+1).filter(function(r) { return r.classList.contains('user'); }).length;
    allRows.slice(ri).forEach(function(r) { r.remove(); });
    _history.splice((uc-1)*2);
    if (_responding && _abortCtrl) _abortCtrl.abort();
    _responding = false; hide('typing-row');
    sendMessage(newText);
  }
};

window.copyMsg = function(btn) {
  const b = btn.closest('.msg-content').querySelector('.msg-bubble'); if (!b) return;
  navigator.clipboard.writeText(b.innerText || b.textContent || '').then(function() {
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = 'Copy'; }, 1500);
  });
};

/* ══════════════════════════════════════════════════════════
   VOICE INPUT
══════════════════════════════════════════════════════════ */
async function toggleVoiceInput() {
  const btn = $('mic-btn'); const input = $('composer-input');
  if (!btn || !input) return;

  if (_sttActive) {
    _sttActive = false;
    btn.classList.remove('mic-recording');
    btn.title = 'Voice input';
    if (_mediaRec && _mediaRec.state !== 'inactive') _mediaRec.stop();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) startWebSpeech(btn, input);
    else toast('Voice input not supported in this browser.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                 MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
    _mediaRec = new MediaRecorder(stream, { mimeType: mime });
    _sttChunks = []; _sttActive = true;
    btn.classList.add('mic-recording');
    btn.title = 'Tap to stop';
    toast('Listening\u2026', 60000);

    _mediaRec.ondataavailable = function(e) { if (e.data && e.data.size > 0) _sttChunks.push(e.data); };
    _mediaRec.onstop = async function() {
      stream.getTracks().forEach(function(t) { t.stop(); });
      btn.classList.remove('mic-recording');
      btn.classList.add('mic-transcribing');
      btn.title = 'Transcribing\u2026';
      const toastEl = $('toast'); if (toastEl) hide(toastEl);
      try {
        const blob = new Blob(_sttChunks, { type: mime });
        const fd = new FormData();
        fd.append('file', blob, 'audio.' + (mime.includes('webm') ? 'webm' : 'ogg'));
        const res = await fetch(WHISPER_URL, {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + ((_session && _session.access_token) ? _session.access_token : SUPABASE_ANON), 'apikey': SUPABASE_ANON },
          body: fd,
        });
        btn.classList.remove('mic-transcribing'); btn.title = 'Voice input';
        if (!res.ok) throw new Error('STT error ' + res.status);
        const data = await res.json();
        const transcript = data.text ? data.text.trim() : '';
        if (!transcript) { toast('Could not understand audio — try again.'); return; }
        const cur = input.value.trim();
        input.value = cur ? cur + ' ' + transcript : transcript;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
        input.focus();
        toast('\u2713 Voice transcribed!');
      } catch (err) {
        btn.classList.remove('mic-transcribing'); btn.title = 'Voice input';
        toast('Transcription failed: ' + err.message);
      }
    };
    _mediaRec.start(250);
  } catch (err) {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) startWebSpeech(btn, input);
    else toast('Microphone access denied.');
  }
}

function startWebSpeech(btn, input) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const r = new SR(); r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1;
  _sttActive = true; btn.classList.add('mic-recording'); btn.title = 'Listening\u2026';
  toast('Listening\u2026', 60000);
  let final = '';
  r.onresult = function(e) {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) final += e.results[i][0].transcript + ' ';
      else interim = e.results[i][0].transcript;
    }
    input.value = final + interim;
    input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 150) + 'px';
  };
  r.onerror = function(e) {
    btn.classList.remove('mic-recording'); btn.title = 'Voice input'; _sttActive = false;
    const toastEl = $('toast'); if (toastEl) hide(toastEl);
    if (e.error !== 'aborted') toast('Speech error: ' + e.error);
  };
  r.onend = function() {
    btn.classList.remove('mic-recording'); btn.title = 'Voice input'; _sttActive = false;
    const toastEl = $('toast'); if (toastEl) hide(toastEl);
    input.value = input.value.trim(); input.focus();
  };
  btn.onclick = function() { r.stop(); btn.onclick = function() { toggleVoiceInput(); }; };
  r.start();
}

window.speakMsg = async function(btn) {
  const bel = btn.closest('.msg-content').querySelector('.msg-bubble'); if (!bel) return;
  const clone = bel.cloneNode(true);
  clone.querySelectorAll('button,.msg-actions,.code-block-header').forEach(function(el) { el.remove(); });
  const text = (clone.innerText || clone.textContent || '').trim().slice(0, 2000);
  if (!text) return;
  if (_ttsSpeaking) {
    if (_ttsAudio) { _ttsAudio.pause(); _ttsAudio.src = ''; _ttsAudio = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen'; return;
  }
  btn.innerHTML = '&#9632; Stop'; _ttsSpeaking = true;
  try {
    const res = await fetch(TTS_URL, { method: 'POST', headers: edgeHeaders(), body: JSON.stringify({ text: text, voice: 'Fritz-PlayAI' }) });
    if (!res.ok) { const e = await res.json().catch(function(){return {};}); throw new Error(e.error || 'TTS error ' + res.status); }
    const buf = await res.arrayBuffer();
    const url = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }));
    _ttsAudio = new Audio(url);
    _ttsAudio.onended = function() { _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen'; URL.revokeObjectURL(url); };
    _ttsAudio.onerror = function() { _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen'; URL.revokeObjectURL(url); };
    await _ttsAudio.play();
  } catch (err) {
    _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen';
    if (window.speechSynthesis) {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-GB'; utt.rate = 0.95; utt.pitch = 0.9;
      btn.innerHTML = '&#9632; Stop'; _ttsSpeaking = true;
      utt.onend = utt.onerror = function() { _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen'; };
      window.speechSynthesis.speak(utt);
    } else { toast('Voice unavailable.'); }
  }
};

/* ══════════════════════════════════════════════════════════
   WELCOME (randomised per new chat)
══════════════════════════════════════════════════════════ */
function showWelcome() {
  show('welcome-state');
  const g = WELCOME_GREETINGS[Math.floor(Math.random() * WELCOME_GREETINGS.length)];
  const heading = $('welcome-heading');
  const sub     = $('welcome-sub');
  if (heading) heading.textContent = _settings.displayName ? 'Hi ' + _settings.displayName + '!' : g.h;
  if (sub)     sub.textContent     = g.s;

  const cards = $('welcome-cards'); if (!cards) return;
  const shuffled = WELCOME_CARDS.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 4);
  cards.innerHTML = shuffled.map(function(c) {
    return '<button class="welcome-card" data-prompt="' + esc(c.prompt) + '">' +
      '<div class="wc-icon">'  + c.icon        + '</div>' +
      '<div class="wc-title">' + esc(c.title)  + '</div>' +
      '<div class="wc-sub">'   + esc(c.sub)    + '</div>' +
    '</button>';
  }).join('');
  cards.querySelectorAll('.welcome-card').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const inp = $('composer-input');
      if (inp) { inp.value = btn.dataset.prompt + ' '; inp.focus(); inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 150) + 'px'; }
    });
    attachRipple(btn);
  });
}

/* ══════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════ */
function clearMessages() {
  const m = $('messages');
  if (m) m.querySelectorAll('.msg-row').forEach(function(el) { el.remove(); });
}

function scrollToBottom() {
  const s = $('chat-scroll'); if (s) s.scrollTop = s.scrollHeight;
}
