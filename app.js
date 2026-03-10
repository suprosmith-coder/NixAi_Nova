/* ==============================================================
   CYANIX AI -- JavaScript.js  v12
   Supabase Auth * Chat History * Groq Streaming * RAG * TTS * STT
============================================================== */
'use strict';

/* -- Config ------------------------------------------------ */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = SUPABASE_URL + '/functions/v1/cyanix-chat';
const TTS_URL       = SUPABASE_URL + '/functions/v1/tts';
const TRAINING_URL  = SUPABASE_URL + '/functions/v1/collect-training-data';
const RAG_URL       = SUPABASE_URL + '/functions/v1/rag-search';
const WHISPER_URL   = SUPABASE_URL + '/functions/v1/whisper';
const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];

/* -- Models ------------------------------------------------ */
const MODELS = [
  { id: 'openai/gpt-oss-20b',           name: 'GPT OSS 20B',       tag: 'FAST',   desc: '128k context * Fast everyday tasks'      },
  { id: 'openai/gpt-oss-120b',          name: 'GPT OSS 120B',      tag: 'POWER',  desc: '128k context * Deep reasoning + code'    },
  { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT OSS Safeguard', tag: 'SAFE',   desc: 'Moderation * Safety-filtered responses'  },
  { id: 'groq/compound',                name: 'Compound',           tag: 'SEARCH', desc: 'Built-in web search * Always up to date' },
  { id: 'groq/compound-mini',           name: 'Compound Mini',      tag: 'FAST+',  desc: 'Web search * 3x faster * Single query'   },
];

/* -- Welcome data ------------------------------------------ */
const WELCOME_GREETINGS = [
  { h: "Good morning",          s: "What shall we accomplish together?" },
  { h: "Hey, ready to create?", s: "Drop a question or idea to get started." },
  { h: "Welcome back!",         s: "Pick up where you left off, or start fresh." },
  { h: "Let's get to work",     s: "I'm here and ready -- what's on your mind?" },
  { h: "What's on your mind?",  s: "Ask me anything, from code to creativity." },
  { h: "Hello! I'm Cyanix AI",  s: "Intelligent answers, web search, voice -- all here." },
  { h: "Rise and grind",        s: "Let's make something great. What are we building?" },
  { h: "Hi there!",             s: "Type a question or pick a suggestion below." },
];

const WELCOME_CARDS = [
  { icon: '', title: 'Write code',         sub: 'Explain, debug or generate code',        prompt: 'Write a Python function that' },
  { icon: '', title: 'Search the web',      sub: 'Get real-time answers from the web',     prompt: 'Search for the latest news on' },
  { icon: '', title: 'Write something',    sub: 'Blog posts, emails, captions',            prompt: 'Write a blog post about' },
  { icon: '', title: 'Explain a concept',  sub: 'Break down any complex topic',            prompt: 'Explain how' },
  { icon: '', title: 'Analyse data',        sub: 'Charts, summaries, insights',             prompt: 'Help me analyse this data:' },
  { icon: '', title: 'Creative ideas',      sub: 'Brainstorm, scripts, stories',            prompt: 'Give me 5 creative ideas for' },
  { icon: '', title: 'Research a topic',    sub: 'Summarise and cite sources',              prompt: 'Research and summarise' },
  { icon: '', title: 'Productivity boost',  sub: 'Checklists, plans, time management',      prompt: 'Help me plan my week for' },
  { icon: '', title: 'Summarise content',   sub: 'Paste an article or document',            prompt: 'Summarise this:' },
  { icon: '', title: 'Problem solving',     sub: 'Walk through any challenge step by step', prompt: 'Help me solve this problem:' },
];

/* -- State ------------------------------------------------- */
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
let _syncPending  = false; // race condition guard
let _memories  = [];        // cross-chat memories loaded on sign-in
let _memoriesLoaded = false;
let _attachment = null;     // { type, name, data, mediaType } -- current pending attachment
let _supporter = {
  isActive:false, earlyAccess:false, premiumForever:false,
  memoryPriority:false, dailyLimit:20, unlockedThemes:[],
};
let _usageToday = 0;
// _syncPending declared above

let _settings = {
  model:           MODELS[0].id,
  streaming:       true,
  theme:           'light',
  trainingConsent: false,
  displayName:     '',
  personality:     'friendly',
  ragAuto:         false,
  contextDepth:    'light',  // light=5 | standard=15 | deep=30
  fontStyle:       'inter',  // inter | space-grotesk | syne | orbitron
  fontSize:        15,       // 12-20px
};

const PERSONALITIES = {
  friendly:     'You are warm, encouraging, and conversational. Use a natural tone like talking to a friend.',
  professional: 'You are formal, precise, and business-like. Responses are structured and thorough.',
  creative:     'You are imaginative, expressive, and think outside the box. Use vivid language and novel ideas.',
  concise:      'You are extremely brief. Answer in as few words as possible. No filler, no repetition.',
  mentor:       'You are a patient teacher. Explain step-by-step, check understanding, and guide the user to learn.',
  witty:        'You are clever and humorous. Use light wit and playful wordplay while still being helpful.',
};

/* -- DOM helpers -------------------------------------------- */
const $    = id => document.getElementById(id);
const show = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.remove('hidden'); };
const hide = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.add('hidden'); };
const on   = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

function toast(msg, ms) {
  // Error messages stay longer so they're readable on mobile
  var isError = msg && (msg.indexOf('failed') !== -1 || msg.indexOf('Failed') !== -1 ||
    msg.indexOf('error') !== -1 || msg.indexOf('exception') !== -1);
  ms = ms || (isError ? 7000 : 2800);
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  show(t);
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { hide(t); }, ms);
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

// -- Semantic Memory Retrieval ----------------------------------
// Lightweight TF-IDF style keyword scoring -- no API needed
function scoreMemoryRelevance(memory, query) {
  var mText = (memory.memory + ' ' + (memory.entity_name || '') + ' ' + (memory.category || '')).toLowerCase();
  var qWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function(w) { return w.length > 2; });
  if (!qWords.length) return 0;
  var score = 0;
  qWords.forEach(function(word) {
    if (mText.indexOf(word) !== -1) score += 1;
    // Boost exact entity name matches
    if (memory.entity_name && memory.entity_name.toLowerCase().indexOf(word) !== -1) score += 2;
    // Boost category matches
    if (memory.category && memory.category.toLowerCase() === word) score += 1;
  });
  // Recency boost -- newer memories score higher
  if (memory.created_at) {
    var age = Date.now() - new Date(memory.created_at).getTime();
    var daysSince = age / (1000 * 60 * 60 * 24);
    score += Math.max(0, 1 - daysSince / 30); // fades over 30 days
  }
  return score;
}

function getContextLimit() {
  var depth = _settings.contextDepth || 'light';
  if (!_supporter.isActive) return 5; // free = light only
  if (depth === 'deep')     return 30;
  if (depth === 'standard') return 15;
  return 5;
}

function retrieveRelevantMemories(query) {
  if (!_memories || !_memories.length) return [];
  var limit = getContextLimit();
  // Score all memories against current query
  var scored = _memories.map(function(m) {
    return { mem: m, score: scoreMemoryRelevance(m, query) };
  });
  // Sort by score desc, then recency for ties
  scored.sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    var aTime = a.mem.created_at ? new Date(a.mem.created_at).getTime() : 0;
    var bTime = b.mem.created_at ? new Date(b.mem.created_at).getTime() : 0;
    return bTime - aTime;
  });
  // Always include high-scoring memories; fill remaining slots with recent ones
  var topN = scored.slice(0, limit).map(function(s) { return s.mem; });
  return topN;
}

function buildSystemPrompt(queryContext) {
  var p = PERSONALITIES[_settings.personality] || PERSONALITIES.friendly;
  var n = _settings.displayName
    ? 'The user' + String.fromCharCode(39) + 's name is ' + _settings.displayName + '. Always address them as ' + _settings.displayName + '.'
    : '';
  var memBlock = '';
  // Use semantic retrieval -- only inject relevant memories
  var activeMemories = queryContext ? retrieveRelevantMemories(queryContext) : (_memories || []);
  if (activeMemories.length > 0) {
    // -- Memory Graph: group by entity, then show relationships --
    var entities = {};   // entity_name -> { type, facts: [], related: [] }
    var orphans  = [];   // memories with no entity_name

    activeMemories.forEach(function(m) {
      if (m.entity_name) {
        if (!entities[m.entity_name]) {
          entities[m.entity_name] = { type: m.entity_type || 'concept', facts: [], relatedNames: [] };
        }
        entities[m.entity_name].facts.push(m.memory);
        // Resolve related_to IDs to entity names for richer context
        if (Array.isArray(m.related_to) && m.related_to.length) {
          m.related_to.forEach(function(relId) {
            var rel = _memories.find(function(r) { return r.id === relId; });
            if (rel && rel.entity_name && entities[m.entity_name].relatedNames.indexOf(rel.entity_name) === -1) {
              entities[m.entity_name].relatedNames.push(rel.entity_name);
            }
          });
        }
      } else {
        orphans.push(m.memory);
      }
    });

    var parts = [];

    // Emit entity nodes with their relationships
    Object.keys(entities).forEach(function(name) {
      var e = entities[name];
      var line = name + ' (' + e.type + '): ' + e.facts.join('; ');
      if (e.relatedNames.length) {
        line += '. Connects to: ' + e.relatedNames.join(', ');
      }
      parts.push(line);
    });

    // Emit orphan facts grouped by category
    if (orphans.length) {
      parts.push('Other context: ' + orphans.join('; '));
    }

    memBlock = 'Here is a structured knowledge graph of what you already know about this user from past conversations. ' +
      'Use it naturally to give contextually aware answers without explicitly mentioning that you remember it. ' +
      parts.join('. ') + '.';
  }
  return ['You are Cyanix AI, a powerful and intelligent assistant.', p, n, memBlock].filter(Boolean).join(' ');
}

function edgeHeaders() {
  const token = (_session && _session.access_token) ? _session.access_token : SUPABASE_ANON;
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + token,
    'apikey':        SUPABASE_ANON,
  };
}

/* ==========================================================
   MARKDOWN RENDERER
========================================================== */
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

/* ==========================================================
   BOOT -- no splash, instant render
========================================================== */
document.addEventListener('DOMContentLoaded', async function() {
  // Clear safety net timer if set
  if (window._safetyTimer) clearTimeout(window._safetyTimer);

  loadSettings();
  applyTheme(_settings.theme);
  bindAuthUI();
  bindChatUI();
  populateModels();
  handleStartActions();
  setTimeout(attachAllRipples, 150);

  if (!SUPABASE_URL.startsWith('https://') || SUPABASE_ANON.length < 40) {
    console.error('[CyanixAI] Supabase not configured.');
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('[CyanixAI] Supabase SDK not loaded.');
    return;
  }

  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: {
      persistSession: true, autoRefreshToken: true,
      detectSessionInUrl: true, storageKey: 'cyanix-auth',
    },
  });

  _sb.auth.onAuthStateChange(function(event, session) {
    _session = session;
    if (event === 'SIGNED_IN') {
      if (_signedInUser && session && _signedInUser === session.user.id) return;
      onSignedIn(session);
    }
    if (event === 'SIGNED_OUT') onSignedOut();
  });

  try {
    var result = await _sb.auth.getSession();
    if (result.error || !result.data || !result.data.session) return;
    _session = result.data.session;
    await onSignedIn(_session);
  } catch (err) {
    console.error('[CyanixAI] boot:', err);
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

/* ==========================================================
   AUTH
========================================================== */
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
  if (!_sb) { setMsg('si-err', 'App not ready -- please refresh the page.', 'err'); return; }
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
  if (!_sb) { setMsg('su-err', 'App not ready -- please refresh the page.', 'err'); return; }
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
  if (!_sb) { setMsg('fp-err', 'App not ready -- please refresh the page.', 'err'); return; }
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
  if (!_sb) { toast('App not ready -- please refresh the page.'); return; }
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
  await loadSupporter();
  await loadMemories();
  await loadChats();

  if (_chats.length > 0) await loadChat(_chats[0].id);
  else showWelcome();

  setTimeout(attachAllRipples, 150);
  window.dispatchEvent(new Event('cyanix:ready'));
}

function onSignedOut() {
  _session = null; _signedInUser = null;
  _chats = []; _currentId = null; _history = [];
  _supporter = { isActive:false, earlyAccess:false, premiumForever:false, memoryPriority:false, dailyLimit:20, unlockedThemes:[] };
  _usageToday = 0;
  if ($('user-avatar')) $('user-avatar').textContent = '?';
  if ($('user-name'))   $('user-name').textContent   = 'Loading\u2026';
  hide('view-chat'); show('view-auth'); showPanel('signin');
}

/* ==========================================================
   RIPPLE / HAPTIC
========================================================== */
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
  // Mouse-tracking glow on welcome cards
  document.querySelectorAll('.welcome-card').forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var r = card.getBoundingClientRect();
      var x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
      var y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
      card.style.setProperty('--mx', x);
      card.style.setProperty('--my', y);
    });
  });
}

/* ==========================================================
   CHAT UI BINDINGS
========================================================== */
function bindChatUI() {
  // On mobile, sidebar starts hidden (collapsed); on desktop it starts open
  (function() {
    const sb = $('sidebar');
    if (sb && window.innerWidth <= 700) sb.classList.add('collapsed');
  })();

  // Collapse button INSIDE sidebar (visible on mobile only)
  on('sb-collapse-btn', 'click', function() {
    var sb = $('sidebar');
    if (sb) sb.classList.add('collapsed');
    var overlay = $('sidebar-overlay');
    if (overlay) overlay.classList.add('hidden');
  });

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
  on('attach-btn', 'click', function() {
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,text/plain,text/markdown,.md,.js,.ts,.py,.html,.css,.json,.txt,.csv,.xml,.yaml,.yml,.sh,.rb,.go,.rs,.cpp,.c,.java,.kt,.swift';
    inp.onchange = function() {
      var file = inp.files && inp.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { toast('File too large. Max 10MB.'); return; }
      handleAttachment(file);
    };
    inp.click();
  });

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
  on('model-select', 'change', function() {
    const isCompound = _settings.model && _settings.model.startsWith('groq/compound');
    const ragRow = $('rag-toggle-row');
    if (ragRow) ragRow.style.opacity = isCompound ? '0.4' : '1';
    const ragDesc = $('rag-auto-desc');
    if (ragDesc) ragDesc.textContent = isCompound
      ? 'Built-in search active (Compound model)'
      : 'Automatically search when questions need current info';
  });

  on('streaming-toggle',   'change', function() { _settings.streaming = !!$('streaming-toggle').checked; saveSettings(); syncPreferences(); });
  on('theme-select',       'change', function() { _settings.theme = $('theme-select').value; applyTheme(_settings.theme); saveSettings(); syncPreferences(); });
  on('model-select',       'change', function() { _settings.model = $('model-select').value; saveSettings(); syncPreferences(); updateModelLabel(); });
  on('font-style-select', 'change', function() {
    var sel = $('font-style-select');
    if (!sel) return;
    _settings.fontStyle = sel.value;
    applyFontStyle(_settings.fontStyle);
    saveSettings();
  });
  on('font-size-up', 'click', function() {
    _settings.fontSize = Math.min(20, (_settings.fontSize || 15) + 1);
    applyFontSize(_settings.fontSize);
    updateFontSizeUI();
    saveSettings();
  });
  on('font-size-down', 'click', function() {
    _settings.fontSize = Math.max(12, (_settings.fontSize || 15) - 1);
    applyFontSize(_settings.fontSize);
    updateFontSizeUI();
    saveSettings();
  });
  on('context-depth-select','change', function() {
    var sel = $('context-depth-select');
    if (!sel) return;
    if (!_supporter.isActive && sel.value !== 'light') {
      sel.value = 'light';
      toast('Upgrade to supporter to unlock Standard and Deep recall.');
      return;
    }
    _settings.contextDepth = sel.value;
    saveSettings(); syncPreferences();
    updateContextDepthUI();
  });
  on('consent-toggle',     'change', function() {
    _settings.trainingConsent = !!$('consent-toggle').checked;
    saveSettings(); syncPreferences(); updateTrainingDataRow();
    toast(_settings.trainingConsent ? 'Training data enabled.' : 'Training data disabled.');
  });
  on('rag-auto-toggle', 'change', function() {
    _settings.ragAuto = !!$('rag-auto-toggle').checked;
    _ragAuto = _settings.ragAuto;
    saveSettings(); syncPreferences();
    toast(_ragAuto ? ' Auto web search enabled' : 'Auto web search off');
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

/* ==========================================================
   MODELS
========================================================== */
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

/* ==========================================================
   SETTINGS
========================================================== */
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
  updateContextDepthUI();
  // Apply font settings
  var fontSel = $('font-style-select');
  if (fontSel) fontSel.value = _settings.fontStyle || 'inter';
  applyFontStyle(_settings.fontStyle || 'inter');
  applyFontSize(_settings.fontSize || 15);
  updateFontSizeUI();
}

function applyTheme(theme) { document.documentElement.dataset.theme = theme || 'light'; }

var FONT_FAMILIES = {
  'inter':        "'Inter', system-ui, sans-serif",
  'space-grotesk':"'Space Grotesk', system-ui, sans-serif",
  'syne':         "'Syne', system-ui, sans-serif",
  'orbitron':     "'Orbitron', system-ui, sans-serif",
};
var FONT_NAMES = { 'inter':'Inter', 'space-grotesk':'Space Grotesk', 'syne':'Syne', 'orbitron':'Orbitron' };
var FONT_SIZE_LABELS = { 12:'XS', 13:'Small', 14:'Small+', 15:'Medium', 16:'Medium+', 17:'Large', 18:'Large+', 19:'XL', 20:'XXL' };

function applyFontStyle(style) {
  var fam = FONT_FAMILIES[style] || FONT_FAMILIES.inter;
  document.documentElement.style.setProperty('--font', fam);
}

function applyFontSize(size) {
  document.body.style.fontSize = size + 'px';
}

function updateFontSizeUI() {
  var size = _settings.fontSize || 15;
  var val = document.getElementById('font-size-val');
  var desc = document.getElementById('font-size-desc');
  if (val) val.textContent = size;
  if (desc) desc.textContent = FONT_SIZE_LABELS[size] || size + 'px';
}

function updateContextDepthUI() {
  var sel  = $('context-depth-select');
  var desc = $('context-depth-desc');
  var row  = $('context-depth-row');
  if (!sel) return;
  // Set current value
  var depth = _settings.contextDepth || 'light';
  sel.value = depth;
  // Lock standard/deep for free users
  if (!_supporter.isActive) {
    sel.value = 'light';
    // Disable non-light options
    Array.from(sel.options).forEach(function(opt) {
      opt.disabled = (opt.value !== 'light');
    });
    if (desc) desc.textContent = 'Light mode (5 memories). Upgrade for Standard & Deep recall.';
  } else {
    Array.from(sel.options).forEach(function(opt) { opt.disabled = false; });
    var limits = { light: '5 memories per message', standard: '15 memories per message', deep: '30 memories per message' };
    if (desc) desc.textContent = limits[depth] || '5 memories per message';
  }
}


/* == SUPPORTER PERKS == */
async function loadSupporter() {
  if (!_session) return;
  try {
    var res = await _sb.from('user_supporter').select('*').eq('user_id', _session.user.id).single();
    if (res.data && res.data.is_active) {
      var d = res.data;
      _supporter.isActive       = true;
      _supporter.earlyAccess    = !!d.early_access;
      _supporter.premiumForever = !!d.premium_forever;
      _supporter.memoryPriority = !!d.memory_priority;
      _supporter.dailyLimit     = (d.daily_limit === null || d.daily_limit === undefined) ? null : d.daily_limit;
      _supporter.unlockedThemes = d.unlocked_themes || [];
    } else {
      _supporter = { isActive:false, earlyAccess:false, premiumForever:false, memoryPriority:false, dailyLimit:20, unlockedThemes:[] };
    }
    await loadUsageToday();
    applySupporter();
  } catch (e) { /* no row yet or table missing */ }
}

async function loadUsageToday() {
  if (!_session) return;
  try {
    // Usage window: every 2 hours (key = YYYY-MM-DD-HH where HH is floored to even hour)
    var windowKey = getUsageWindowKey();
    var res = await _sb.from('user_usage').select('prompt_count').eq('user_id', _session.user.id).eq('usage_date', windowKey).single();
    _usageToday = (res.data && res.data.prompt_count) ? res.data.prompt_count : 0;
  } catch (e) { _usageToday = 0; }
}

function getUsageWindowKey() {
  var now = new Date();
  var year  = now.getUTCFullYear();
  var month = String(now.getUTCMonth() + 1).padStart(2, '0');
  var day   = String(now.getUTCDate()).padStart(2, '0');
  var hour  = String(Math.floor(now.getUTCHours() / 2) * 2).padStart(2, '0');
  return year + '-' + month + '-' + day + '-' + hour;
}

function getWindowResetTime() {
  var now = new Date();
  var nextWindowHour = (Math.floor(now.getUTCHours() / 2) + 1) * 2;
  var reset = new Date(now);
  reset.setUTCHours(nextWindowHour, 0, 0, 0);
  var diff = reset - now;
  var mins = Math.floor(diff / 60000);
  var secs = Math.floor((diff % 60000) / 1000);
  if (mins > 0) return mins + ' min' + (mins !== 1 ? 's' : '');
  return secs + ' sec' + (secs !== 1 ? 's' : '');
}

async function incrementUsage() {
  if (!_session) return;
  _usageToday++;
  try {
    var windowKey = getUsageWindowKey();
    await _sb.from('user_usage').upsert({ user_id: _session.user.id, usage_date: windowKey, prompt_count: _usageToday }, { onConflict: 'user_id,usage_date' });
  } catch (e) {}
}

function checkDailyLimit() {
  if (_supporter.dailyLimit === null) return true; // unlimited
  if (_usageToday >= _supporter.dailyLimit) {
    showUpgradeModal();
    return false;
  }
  // Soft warning at 80%
  var pct = _usageToday / _supporter.dailyLimit;
  if (pct >= 0.8) {
    var left = _supporter.dailyLimit - _usageToday;
    toast(left + ' message' + (left === 1 ? '' : 's') + ' left this window. Resets in ' + getWindowResetTime() + '.');
  }
  return true;
}

function showUpgradeModal() {
  var existing = $('upgrade-modal');
  if (existing) { show('upgrade-modal'); return; }
  var overlay = document.createElement('div');
  overlay.id = 'upgrade-modal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML =
    '<div class="modal-sheet upgrade-sheet">' +
      '<div class="upgrade-icon">&#9889;</div>' +
      '<h2 class="upgrade-title">You' + String.fromCharCode(39) + 've hit your limit</h2>' +
      '<p class="upgrade-desc">Free users get <strong>20 messages</strong> every 2 hours.<br>Your limit resets in <strong id="upgrade-reset-timer">' + getWindowResetTime() + '</strong>.</p>' +
      '<div class="upgrade-perks">' +
        '<div class="upgrade-perk"><span>&#9733;</span> Unlimited messages</div>' +
        '<div class="upgrade-perk"><span>&#127756;</span> Exclusive themes</div>' +
        '<div class="upgrade-perk"><span>&#129504;</span> Extended memory</div>' +
        '<div class="upgrade-perk"><span>&#128640;</span> Early access to new features</div>' +
      '</div>' +
      '<div class="upgrade-actions">' +
        '<button class="upgrade-wait-btn" id="upgrade-wait-btn">Wait for reset (' + getWindowResetTime() + ')</button>' +
        '<button class="upgrade-close-btn" onclick="hide(&quot;upgrade-modal&quot;)">Maybe later</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) hide('upgrade-modal'); });

  // Live countdown timer
  var timerEl = overlay.querySelector('#upgrade-reset-timer');
  var waitBtn = overlay.querySelector('#upgrade-wait-btn');
  var interval = setInterval(function() {
    var t = getWindowResetTime();
    if (timerEl) timerEl.textContent = t;
    if (waitBtn) waitBtn.textContent = 'Wait for reset (' + t + ')';
    // Auto-close when window resets
    if (t === '0 secs') {
      clearInterval(interval);
      _usageToday = 0;
      hide('upgrade-modal');
      toast('Limit reset! You have 20 messages again.');
      updateUsageDisplay();
    }
  }, 1000);
}

function applySupporter() {
  // -- Badge: show tier name --
  var badge = $('supporter-badge');
  if (badge) {
    if (_supporter.isActive) {
      var isFounder = _supporter.unlockedThemes.indexOf('founder') !== -1;
      badge.textContent = isFounder ? 'Founder' : 'Supporter';
      badge.setAttribute('data-tier', isFounder ? 'founder' : 'supporter');
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  // -- Supporter-only section (early access, themes, usage) --
  var section = $('supporter-section');
  if (section) section.style.display = _supporter.isActive ? 'block' : 'none';
  var eaRow = $('early-access-row');
  if (eaRow) eaRow.style.display = _supporter.earlyAccess ? '' : 'none';

  // -- Memory row: always visible, locked state for free users --
  var memVal = $('memory-perk-value');
  var memLock = $('memory-perk-lock');
  if (memVal) memVal.textContent = _supporter.memoryPriority ? '500 slots' : '50 slots';
  if (memLock) memLock.style.display = _supporter.memoryPriority ? 'none' : 'inline-flex';

  updateUsageDisplay();
  populateThemeSelect();
  updateContextDepthUI();
  window._chatHistoryLimit = _supporter.memoryPriority ? 500 : 100;
}

function updateUsageDisplay() {
  var el = $('usage-display');
  if (!el) return;
  if (_supporter.dailyLimit === null) {
    el.textContent = _usageToday + ' prompts (unlimited)';
  } else {
    var left = Math.max(0, _supporter.dailyLimit - _usageToday);
    el.textContent = _usageToday + ' / ' + _supporter.dailyLimit + ' this window  \u2022  ' + left + ' left  \u2022  resets in ' + getWindowResetTime();
  }
}

function populateThemeSelect() {
  var sel = $('theme-select');
  if (!sel) return;
  var base = [{value:'light',label:'Light'},{value:'dark',label:'Dark'}];
  var exclusive = [
    {value:'founder',  label:'Founder',  key:'founder'},
    {value:'neon',     label:'Dark Neon', key:'neon'},
    {value:'midnight', label:'Midnight',  key:'midnight'},
  ];
  var available = base.concat(exclusive.filter(function(t) {
    return _supporter.unlockedThemes.indexOf(t.key) !== -1;
  }));
  var current = _settings.theme || 'light';
  sel.innerHTML = available.map(function(t) {
    return '<option value="' + t.value + '"' + (t.value === current ? ' selected' : '') + '>' + t.label + '</option>';
  }).join('');
}

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
    // Only persist themes the DB constraint allows
    // If constraint hasn't been updated yet, fall back to 'dark' for exclusive themes
    var ALLOWED_THEMES = ['light','dark','founder','neon','midnight'];
    var safeTheme = ALLOWED_THEMES.indexOf(_settings.theme) !== -1 ? _settings.theme : 'dark';
    var result = await _sb.from('user_preferences').upsert({
      user_id: _session.user.id, model: _settings.model, streaming: _settings.streaming,
      theme: safeTheme, training_consent: _settings.trainingConsent,
      display_name: _settings.displayName || null, personality: _settings.personality || 'friendly',
      rag_auto: !!_settings.ragAuto, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (result.error) {
      console.error('[CyanixAI] syncPreferences error:', result.error.message);
    }
  } catch (e) { console.error('[CyanixAI] syncPreferences exception:', e); }
}

/* ==========================================================
   CHAT HISTORY
========================================================== */
async function loadChats() {
  if (!_session) return;
  try {
    const result = await _sb.from('chats').select('id,title,model,updated_at')
      .eq('user_id', _session.user.id).order('updated_at', { ascending: false }).limit(window._chatHistoryLimit || 100);
    if (result.error) {
      console.error('[CyanixAI] loadChats error:', result.error.message, result.error.details);
      _chats = []; renderChatList(); return;
    }
    _chats = result.data || [];
    renderChatList();
  } catch (e) {
    console.error('[CyanixAI] loadChats exception:', e);
    _chats = []; renderChatList();
  }
}

async function loadChat(id) {
  if (!_session || !id) return;
  // Stop any ongoing response before switching chats
  if (_responding) stopResponse();
  try {
    const result = await _sb.from('messages').select('id,role,content,created_at')
      .eq('chat_id', id).order('created_at', { ascending: true });
    if (result.error) throw result.error;
    _currentId = id;
    _history   = (result.data || []).map(function(m) { return { id: m.id, role: m.role, content: m.content }; });
    const chat = _chats.find(function(c) { return c.id === id; });
    if ($('chat-title')) $('chat-title').textContent = chat ? chat.title : 'Chat';
    clearMessages();
    if (_history.length === 0) {
      // Chat exists but has no saved messages -- show welcome instead of blank
      showWelcome();
    } else {
      hide('welcome-state');
      _history.forEach(function(msg) { renderMessage(msg.role, msg.content, false, msg.id); });
      scrollToBottom();
    }
    renderChatList();
  } catch (e) {
    toast('Failed to load chat.');
    console.error('[CyanixAI] loadChat error:', e);
  }
}

async function syncChatToDB(localId, title) {
  if (!_sb) { console.error('[CyanixAI] _sb is null -- Supabase client not init'); return null; }
  if (!_session) { console.error('CYANIX DEBUG: no session -- user not signed in'); return null; }
  try {
    var payload = { user_id: _session.user.id, title: title };
    try { payload.model = _settings.model; } catch(ignore) {}
    try { payload.updated_at = new Date().toISOString(); } catch(ignore) {}
    var result = await _sb.from('chats').insert(payload).select('id').single();
    if (result.error) {
      var msg = result.error.message || 'unknown error';
      var hint = result.error.hint ? ' HINT: ' + result.error.hint : '';
      var code = result.error.code ? ' CODE: ' + result.error.code : '';
      var details = result.error.details ? ' DETAILS: ' + result.error.details : '';
      console.error('CYANIX DEBUG -- Chat insert failed:\n' + msg + code + hint + details);
      console.error('[CyanixAI] syncChatToDB error:', result.error);
      return null;
    }
    var newId = result.data && result.data.id;
    if (newId && newId !== localId) {
      _currentId = newId;
      _chats = _chats.map(function(c) { return c.id === localId ? Object.assign({}, c, { id: newId }) : c; });
      renderChatList();
    }
    toast('Chat saved OK');
    return newId;
  } catch (e) {
    console.error('CYANIX DEBUG -- Chat sync exception:\n' + (e && e.message ? e.message : String(e)));
    console.error('[CyanixAI] syncChatToDB exception:', e);
    return null;
  }
}

async function syncMessagesToDB(chatId, userText, aiText) {
  if (!_sb || !_session || !chatId) {
    toast('Msg sync: missing params sb=' + !!_sb + ' session=' + !!_session + ' chatId=' + !!chatId);
    return null;
  }
  try {
    var result = await _sb.from('messages').insert([
      { chat_id: chatId, user_id: _session.user.id, role: 'user',      content: userText },
      { chat_id: chatId, user_id: _session.user.id, role: 'assistant', content: aiText   },
    ]).select('id');
    if (result.error) {
      toast('Msg save failed: ' + result.error.message);
      console.error('[CyanixAI] syncMessagesToDB error:', result.error);
      return null;
    }
    // Bump chat updated_at (fallback if trigger not deployed)
    await _sb.from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId)
      .eq('user_id', _session.user.id);
    return result.data && result.data[1] ? result.data[1].id : null;
  } catch (e) {
    toast('Msg sync exception: ' + (e && e.message ? e.message : String(e)));
    console.error('[CyanixAI] syncMessagesToDB exception:', e);
    return null;
  }
}

function handleAttachment(file) {
  var reader = new FileReader();
  var isImage = file.type.startsWith('image/');
  var isPDF   = file.type === 'application/pdf';
  var isText  = !isImage && !isPDF; // treat everything else as text

  reader.onload = function(e) {
    var result = e.target.result;
    if (isImage || isPDF) {
      // result is data URL like "data:image/png;base64,xxxx"
      var parts = result.split(',');
      var b64   = parts[1];
      _attachment = { type: isImage ? 'image' : 'pdf', name: file.name, data: b64, mediaType: file.type };
    } else {
      // Text/code -- store as plain text
      _attachment = { type: 'text', name: file.name, data: result, mediaType: file.type };
    }
    showAttachPreview();
    toast('Attached: ' + file.name);
  };

  if (isImage || isPDF) {
    reader.readAsDataURL(file);
  } else {
    reader.readAsText(file);
  }
}

function showAttachPreview() {
  var existing = document.getElementById('attach-preview');
  if (existing) existing.remove();
  if (!_attachment) return;

  var box = document.getElementById('composer-box');
  if (!box) return;

  var preview = document.createElement('div');
  preview.id = 'attach-preview';
  preview.className = 'attach-preview';

  var icon = _attachment.type === 'image'
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
    : _attachment.type === 'pdf'
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';

  preview.innerHTML = '<div class="attach-chip">' +
    '<span class="attach-chip-icon">' + icon + '</span>' +
    '<span class="attach-chip-name">' + esc(_attachment.name) + '</span>' +
    '<button class="attach-chip-remove" title="Remove attachment">' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button></div>';

  preview.querySelector('.attach-chip-remove').addEventListener('click', function() {
    clearAttachment();
  });

  // Insert before textarea
  var textarea = document.getElementById('composer-input');
  if (textarea) box.insertBefore(preview, textarea);

  // Highlight attach button
  var btn = document.getElementById('attach-btn');
  if (btn) btn.classList.add('active');
}

function clearAttachment() {
  _attachment = null;
  var existing = document.getElementById('attach-preview');
  if (existing) existing.remove();
  var btn = document.getElementById('attach-btn');
  if (btn) btn.classList.remove('active');
}

async function generateChatTitle(userText, aiText) {
  try {
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 30,
        messages: [{
          role: 'user',
          content: 'Generate a short chat title (max 5 words, no quotes, no punctuation) for this conversation.\nUser: ' + userText.slice(0, 200) + '\nAssistant: ' + aiText.slice(0, 200)
        }]
      })
    });
    if (!res.ok) return null;
    var data = await res.json();
    var title = data.content && data.content[0] && data.content[0].text ? data.content[0].text.trim() : null;
    // Clean up -- remove quotes, trim to 50 chars
    if (title) title = title.replace(/['"]/g, '').slice(0, 50).trim();
    return title || null;
  } catch (e) {
    return null;
  }
}

async function bgSyncMessages(isNewChat, localChatId, userText, aiText, msgEl) {
  let chatId = localChatId;
  try {
    if (isNewChat) {
      // If another new-chat sync is already in flight, wait for it and reuse its ID
      if (_syncPending) {
        let waited = 0;
        while (_syncPending && waited < 5000) {
          await new Promise(function(res) { setTimeout(res, 80); });
          waited += 80;
        }
        chatId = _currentId; // real DB UUID from the completed sync
      } else {
        _syncPending = true;
        try {
          const realId = await syncChatToDB(chatId, userText.slice(0, 60).trim());
          if (realId) {
            chatId = realId;
          } else {
            // Chat insert failed -- show error and bail, don't try to insert messages
            toast('Could not save chat. Check your connection.');
            return;
          }
        } finally {
          _syncPending = false;
        }
      }
    } else {
      // Not a new chat -- but wait if a new-chat sync is still in flight
      // (user sent 2nd message very fast before 1st sync completed)
      if (_syncPending) {
        let waited = 0;
        while (_syncPending && waited < 5000) {
          await new Promise(function(res) { setTimeout(res, 80); });
          waited += 80;
        }
        chatId = _currentId; // use the real ID that just got written
      }
    }

    // Safety: if chatId looks like a local UUID that never got swapped out, bail
    if (!chatId || chatId === localChatId && isNewChat) {
      console.error('[CyanixAI] bgSyncMessages: no valid chatId to insert messages into');
      return;
    }

    const aiMsgId = await syncMessagesToDB(chatId, userText, aiText);
    if (aiMsgId && msgEl) addFeedbackButtons(msgEl, aiMsgId);

    // Generate a proper AI title for new chats silently in background
    if (isNewChat && chatId) {
      generateChatTitle(userText, aiText).then(function(title) {
        if (!title) return;
        // Update sidebar and topbar immediately
        _chats = _chats.map(function(c) {
          return c.id === chatId ? Object.assign({}, c, { title: title }) : c;
        });
        renderChatList();
        if ($('chat-title')) $('chat-title').textContent = title;
        // Persist to DB
        _sb.from('chats').update({ title: title }).eq('id', chatId).eq('user_id', _session.user.id);
      }).catch(function() {});
    }

    await maybeCollectTraining(userText, aiText);
    // Extract memories silently in background (don't await -- truly background)
    extractAndSaveMemories(_history, _currentId).catch(function() {});
    await loadChats();
  } catch (e) {
    _syncPending = false;
    console.error('[CyanixAI] bgSyncMessages failed:', e);
    toast('Message not saved -- check connection.');
  }
}

async function loadMemories() {
  if (!_sb || !_session) return;
  try {
    var limit = _supporter.memoryPriority ? 500 : 50;
    var res = await _sb.from('user_memories')
      .select('id,memory,category,entity_name,entity_type,related_to,created_at')
      .eq('user_id', _session.user.id)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (res.error) { console.error('[CyanixAI] loadMemories:', res.error.message); return; }
    _memories = res.data || [];
    _memoriesLoaded = true;
    console.log('[CyanixAI] Loaded', _memories.length, 'memories');
  } catch (e) { console.error('[CyanixAI] loadMemories exception:', e); }
}

async function extractAndSaveMemories(messages, sourceId) {
  if (!_sb || !_session) return;
  if (!messages || messages.length < 2) return;
  try {
    // Build a short context for extraction (last 6 messages max)
    var ctx = messages.slice(-6).map(function(m) {
      return (m.role === 'user' ? 'User: ' : 'Assistant: ') + m.content.slice(0, 400);
    }).join('\n');

    var extractPrompt = 'Extract factual memories about the user from this conversation. ' +
      'Return ONLY a JSON array, no other text, no markdown. Each item must have: ' +
      '{"memory":"concise fact","category":"personal|preference|project|technical",' +
      '"entity_name":"the named thing this fact is about e.g. Cyanix AI or Supabase or null",' +
      '"entity_type":"project|tool|concept|person|null",' +
      '"relates_to":["exact memory text of related facts from the same conversation, or empty array"]} ' +
      'entity_name: the specific named subject of the fact. entity_type: what kind of thing it is. ' +
      'relates_to: list other memories in this batch that this fact directly connects to. ' +
      'Categories: personal=name/job/location, preference=tone/topics/likes, ' +
      'project=things user is building, technical=languages/frameworks/tools. ' +
      'If nothing worth remembering, return []. Max 5 items. Conversation:\n' + ctx;

    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{ role: 'user', content: extractPrompt }]
      })
    });

    if (!res.ok) return;
    var data = await res.json();
    var raw = data.content && data.content[0] && data.content[0].text ? data.content[0].text.trim() : '';
    if (!raw || raw === '[]') return;

    // Strip any markdown fences just in case
    raw = raw.replace(/```json|```/g, '').trim();
    var items = JSON.parse(raw);
    if (!Array.isArray(items) || items.length === 0) return;

    // Upsert each memory (match on user_id + memory text to avoid duplicates)
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.memory || !item.category) continue;
      // Check if similar memory already exists
      var existing = _memories.find(function(m) {
        return m.memory.toLowerCase().trim() === item.memory.toLowerCase().trim();
      });
      if (existing) {
        // Update existing -- also refresh entity data
        await _sb.from('user_memories')
          .update({
            memory:      item.memory,
            category:    item.category,
            entity_name: item.entity_name || existing.entity_name || null,
            entity_type: item.entity_type || existing.entity_type || null,
            updated_at:  new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Check limit before inserting
        var limit = _supporter.memoryPriority ? 500 : 50;
        if (_memories.length >= limit) {
          var oldest = _memories[_memories.length - 1];
          if (oldest) await _sb.from('user_memories').delete().eq('id', oldest.id);
        }
        // Resolve related_to: find IDs of memories whose text matches relates_to strings
        var relatedIds = [];
        if (Array.isArray(item.relates_to) && item.relates_to.length > 0) {
          item.relates_to.forEach(function(relText) {
            // Check both existing memories and newly inserted ones in this batch
            var match = _memories.find(function(m) {
              return m.memory.toLowerCase().trim() === relText.toLowerCase().trim();
            });
            if (match && match.id) relatedIds.push(match.id);
          });
        }
        var insertPayload = {
          user_id:        _session.user.id,
          memory:         item.memory,
          category:       item.category,
          entity_name:    item.entity_name || null,
          entity_type:    item.entity_type || null,
          related_to:     relatedIds.length ? relatedIds : null,
          source_chat_id: sourceId || _currentId,
          updated_at:     new Date().toISOString()
        };
        await _sb.from('user_memories').insert(insertPayload);
      }
    }
    // Reload memories into state
    await loadMemories();
    console.log('[CyanixAI] Memories updated:', items.length, 'items');
  } catch (e) {
    console.error('[CyanixAI] extractAndSaveMemories exception:', e);
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

/* ==========================================================
   CHAT LIST RENDER
========================================================== */
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
      // Close sidebar on mobile after selecting a chat
      if (window.innerWidth <= 700) {
        var sb = document.querySelector('.sidebar');
        var ov = $('sidebar-overlay');
        if (sb) sb.classList.add('collapsed');
        if (ov) ov.classList.add('hidden');
      }
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

/* ==========================================================
   RAG
========================================================== */
function toggleRAG() {
  _ragEnabled = !_ragEnabled;
  const btn = $('rag-toggle-btn'); const pill = $('rag-pill');
  if (btn)  btn.classList.toggle('active', _ragEnabled);
  if (pill) pill.classList.toggle('hidden', !_ragEnabled);
  toast(_ragEnabled ? ' Web search ON' : 'Web search off');
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
      parts.push('[' + (i+1) + '] ' + r.title + ' -- ' + r.snippet + ' (' + r.url + ')');
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

/* ==========================================================
   MESSAGING
========================================================== */
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
  if (!checkDailyLimit()) return;
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
  _history.push({ role: 'user', content: typeof userContent === 'string' ? userContent : text });
  renderMessage('user', text, true, null, _attachment && _attachment.type === 'image' ? _attachment.data : null);
  var pendingAttachment = _attachment;
  clearAttachment();
  show('typing-row');
  startThoughtStream(text, _ragEnabled);
  scrollToBottom();

  let ragData = null;
  const isCompound = _settings.model.startsWith('groq/compound');
  if (!isCompound && (_ragEnabled || (_ragAuto && needsWebSearch(text)))) {
    // Skip manual RAG when Compound is selected -- it has built-in web search
    const tl = $('thinking-text');
    if (tl) tl.textContent = 'Searching the web...';
    ragData = await fetchRAGContext(text);
    if (tl) tl.textContent = 'Cyanix is thinking';
  }
  if (isCompound) {
    const tl = $('thinking-text');
    if (tl) tl.textContent = 'Cyanix is searching the web...';
  }

  // Build user content -- plain text or multipart if attachment present
  var userContent;
  if (_attachment) {
    if (_attachment.type === 'image') {
      userContent = [
        { type: 'image_url', image_url: { url: 'data:' + _attachment.mediaType + ';base64,' + _attachment.data } },
        { type: 'text', text: text }
      ];
    } else if (_attachment.type === 'pdf') {
      // Send PDF as text note -- Groq doesn't support PDF natively, extract as base64 note
      userContent = text + '\n\n[Attached PDF: ' + _attachment.name + ']\nNote: PDF content attached as base64. Please analyze it.' + _attachment.data.slice(0, 4000);
    } else {
      // Text/code file -- inject as code block
      var ext = _attachment.name.split('.').pop() || 'text';
      userContent = text + '\n\n**Attached file: ' + _attachment.name + '**\n```' + ext + '\n' + _attachment.data.slice(0, 12000) + '\n```';
    }
  } else {
    userContent = text;
  }

  const messages = [{ role: 'system', content: buildSystemPrompt(text) + buildRAGContext(ragData) }]
    .concat(_history.slice(-(window._chatHistoryLimit || 100)).map(function(m, idx, arr) {
      // For last user message: use multipart content if attachment was present
      if (idx === arr.length - 1 && m.role === 'user' && typeof userContent !== 'string') {
        return { role: 'user', content: userContent };
      }
      return { role: m.role, content: m.content };
    }));

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
    stopThoughtStream();

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
    stopThoughtStream();
    if (err && err.name !== 'AbortError') {
      renderMessage('ai', ' Error: ' + esc(err.message), true);
    }
  } finally {
    _responding = false;
    setSendBtn('send');
    _abortCtrl = null;
  }
}

function stopResponse() {
  if (_abortCtrl) _abortCtrl.abort();
  _responding = false; setSendBtn('send'); hide('typing-row'); stopThoughtStream();
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

/* ==========================================================
   RENDER MESSAGES
========================================================== */
function renderMessage(role, content, animate, msgId, imageData) {
  hide('welcome-state');
  const container = $('messages');
  if (!container) return { msgEl: null, bubbleEl: null };

  const row = document.createElement('div');
  row.className = 'msg-row' + (role === 'user' ? ' user' : '');
  if (msgId) row.dataset.msgId = msgId;
  if (!animate) row.style.animation = 'none';

  if (role === 'user') {
    var imgHTML = imageData
      ? '<img src="data:image/jpeg;base64,' + imageData + '" class="attach-img-preview" alt="attached image">'
      : '';
    row.innerHTML =
      '<div class="msg-content">' +
        '<div class="msg-bubble" data-raw="' + esc(content) + '">' + imgHTML + (content ? esc(content) : '') + '</div>' +
        '<div class="msg-ts">' + timeStr() + '</div>' +
        '<div class="msg-actions">' +
          '<button type="button" class="msg-action-btn" onclick="copyMsg(this)">Copy</button>' +
          '<button type="button" class="msg-action-btn" onclick="editMessage(this)"> Edit</button>' +
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
          '<button type="button" class="msg-action-btn fb-up" onclick="inlineFeedback(this,1)" title="Good response">&#128077;</button>' +
          '<button type="button" class="msg-action-btn fb-down" onclick="inlineFeedback(this,-1)" title="Bad response">&#128078;</button>' +
        '</div>' +
      '</div>';
  }

  container.appendChild(row);
  scrollToBottom();
  return { msgEl: row, bubbleEl: row.querySelector('.msg-bubble') };
}

function addFeedbackButtons(msgEl, messageId) {
  // Buttons already rendered in HTML. Just stamp the DB ID on the row.
  if (!msgEl || !messageId) return;
  msgEl.dataset.msgId = messageId;
}

async function submitFeedback(messageId, value, clickedBtn, otherBtn) {
  clickedBtn.classList.add('voted'); otherBtn.classList.remove('voted');
  try {
    await _sb.from('message_feedback').upsert({ message_id: messageId, chat_id: _currentId, user_id: _session.user.id, feedback: value }, { onConflict: 'message_id,user_id' });
    toast(value === 1 ? 'Thanks!' : 'Got it, we' + String.fromCharCode(39) + 'll improve.');
  } catch (e) { toast('Could not save feedback.'); }
}

// -- Thought Stream ------------------------------------------
var _thoughtInterval = null;

function getThoughtSteps(text, ragEnabled) {
  var t = text.toLowerCase();
  var steps = [];

  // Always start with searching knowledge
  steps.push('Searching knowledge base');

  // RAG / web search
  if (ragEnabled) steps.push('Searching the web');

  // Domain-specific steps
  if (/(code|function|bug|error|debug|class|api|script|fix)/.test(t)) {
    steps.push('Analyzing code context');
    steps.push('Building solution');
  } else if (/(math|calculate|equation|formula|solve|integral|derivative)/.test(t)) {
    steps.push('Running calculations');
    steps.push('Verifying result');
  } else if (/(write|essay|story|poem|creative|draft|blog|article)/.test(t)) {
    steps.push('Exploring ideas');
    steps.push('Crafting response');
  } else if (/(explain|what is|how does|why|meaning|define|describe)/.test(t)) {
    steps.push('Connecting concepts');
    steps.push('Building explanation');
  } else if (/(compare|difference|versus|vs|better|best|which)/.test(t)) {
    steps.push('Weighing options');
    steps.push('Forming recommendation');
  } else if (/(summarize|summary|tldr|brief|overview|recap)/.test(t)) {
    steps.push('Extracting key points');
  } else {
    steps.push('Processing your request');
    steps.push('Forming response');
  }

  // Always finish with composing
  steps.push('Composing answer');
  return steps;
}

function startThoughtStream(text, ragEnabled) {
  var el = document.getElementById('thinking-text');
  if (!el) return;
  var steps = getThoughtSteps(text || '', ragEnabled);
  var idx = 0;

  // Show first step immediately
  el.textContent = steps[0];

  if (_thoughtInterval) clearInterval(_thoughtInterval);
  _thoughtInterval = setInterval(function() {
    idx++;
    if (idx < steps.length) {
      // Fade out then in
      el.style.opacity = '0';
      el.style.transform = 'translateY(4px)';
      setTimeout(function() {
        el.textContent = steps[idx];
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 180);
    } else {
      clearInterval(_thoughtInterval);
      _thoughtInterval = null;
    }
  }, 900);
}

function stopThoughtStream() {
  if (_thoughtInterval) {
    clearInterval(_thoughtInterval);
    _thoughtInterval = null;
  }
  var el = document.getElementById('thinking-text');
  if (el) {
    el.textContent = 'Cyanix is thinking';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }
}

window.closeFbPanel = function(btn) {
  var p = btn && btn.closest('.fb-panel');
  if (p) p.remove();
};
window.toggleFbTag = function(btn) {
  btn.classList.toggle('selected');
};

window.inlineFeedback = function(btn, value) {
  if (!_session) { toast('Sign in to give feedback.'); return; }
  var actions = btn.closest('.msg-actions');
  if (!actions) return;
  var msgRow  = btn.closest('.msg-row');
  var msgId   = msgRow && msgRow.dataset.msgId;
  var content = msgRow && msgRow.querySelector('.msg-content');

  // Toggle voted state on buttons
  var upBtn   = actions.querySelector('.fb-up');
  var downBtn = actions.querySelector('.fb-down');
  var wasVoted = btn.classList.contains('voted');

  if (upBtn)   upBtn.classList.remove('voted');
  if (downBtn) downBtn.classList.remove('voted');

  // If tapping the same button again -- close panel and clear
  var existingPanel = content && content.querySelector('.fb-panel');
  if (wasVoted && existingPanel) {
    existingPanel.remove();
    return;
  }
  btn.classList.add('voted');

  // Remove any existing panel on this message
  if (existingPanel) existingPanel.remove();

  // Build feedback panel
  var isPositive = value === 1;
  var tags = isPositive
    ? ['Accurate', 'Clear', 'Helpful', 'Well written', 'Creative']
    : ['Inaccurate', 'Not helpful', 'Too long', 'Too short', 'Off topic', 'Harmful'];

  var panel = document.createElement('div');
  panel.className = 'fb-panel';
  panel.innerHTML =
    '<div class="fb-panel-head">' +
      '<span class="fb-panel-title">' + (isPositive ? 'What did you like?' : 'What went wrong?') + '</span>' +
      '<button class="fb-panel-close" onclick="closeFbPanel(this)">&#10005;</button>' +
    '</div>' +
    '<div class="fb-tags">' +
      tags.map(function(t) {
        return '<button class="fb-tag" onclick="toggleFbTag(this)">' + t + '</button>';
      }).join('') +
    '</div>' +
    '<textarea class="fb-textarea" placeholder="' + (isPositive ? 'Tell us more (optional)' : 'Help us understand what went wrong (optional)') + '" rows="3"></textarea>' +
    '<div class="fb-panel-actions">' +
      '<button class="fb-submit-btn" id="fb-submit-' + (msgId || 'noid') + '">Submit feedback</button>' +
    '</div>';

  // Insert after msg-actions
  if (content) content.appendChild(panel);

  // Focus textarea
  setTimeout(function() {
    var ta = panel.querySelector('.fb-textarea');
    if (ta) ta.focus();
  }, 120);

  // Submit handler
  panel.querySelector('.fb-submit-btn').addEventListener('click', async function() {
    var selectedTags = Array.from(panel.querySelectorAll('.fb-tag.selected')).map(function(t) { return t.textContent; });
    var comment = panel.querySelector('.fb-textarea').value.trim();
    var submitBtn = this;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    try {
      if (msgId && _currentId) {
        await _sb.from('message_feedback').upsert({
          message_id: msgId,
          chat_id:    _currentId,
          user_id:    _session.user.id,
          feedback:   value,
          tags:       selectedTags.length ? selectedTags : null,
          comment:    comment || null
        }, { onConflict: 'message_id,user_id' });
      }
      panel.innerHTML = '<div class="fb-thanks">' +
        '<span class="fb-thanks-icon">' + (isPositive ? '&#128077;' : '&#128078;') + '</span>' +
        '<span>Thanks for your feedback!</span>' +
      '</div>';
      setTimeout(function() {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-4px)';
        setTimeout(function() { panel.remove(); }, 300);
      }, 1800);
    } catch (e) {
      submitBtn.textContent = 'Submit feedback';
      submitBtn.disabled = false;
      toast('Could not save feedback.');
    }
  });
};

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
    stopThoughtStream();
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

/* ==========================================================
   VOICE INPUT
========================================================== */
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
        if (!transcript) { toast('Could not understand audio -- try again.'); return; }
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

/* ==========================================================
   WELCOME (randomised per new chat)
========================================================== */
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

/* ==========================================================
   UTILITY
========================================================== */
function clearMessages() {
  const m = $('messages');
  if (m) m.querySelectorAll('.msg-row').forEach(function(el) { el.remove(); });
}

function scrollToBottom() {
  const s = $('chat-scroll'); if (s) s.scrollTop = s.scrollHeight;
}
