/* ══════════════════════════════════════════════════════════════
   CYANIX AI — JavaScript.js  v4.0
   Supabase Auth · Supabase Chat History · Groq Streaming
   Training Consent · Feedback · Sidebar Collapse
══════════════════════════════════════════════════════════════ */
'use strict';

/* ── Config ─────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const TTS_URL       = `${SUPABASE_URL}/functions/v1/tts`;
const TRAINING_URL  = `${SUPABASE_URL}/functions/v1/collect-training-data`;
const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];

/* ── Models ─────────────────────────────────────────────── */
const MODELS = [
  { id: 'openai/gpt-oss-20b',           name: 'GPT OSS 20B',       tag: 'FAST',  desc: '128k context · Fast everyday tasks'   },
  { id: 'openai/gpt-oss-120b',          name: 'GPT OSS 120B',      tag: 'POWER', desc: '128k context · Deep reasoning'         },
  { id: 'openai/gpt-oss-safeguard-20b', name: 'GPT OSS Safeguard', tag: 'SAFE',  desc: 'Moderation · Safety-filtered'          },
];
// TTS voice is set server-side (Orion-PlayAI — British male)
// Change voice in tts-edge-function.ts

const SUGGESTIONS = [
  'Learn about Cyanix AI',
  'Generate a blog post about AI trends',
  'Explain a machine learning concept',
  'Summarize this text: [paste here]',
];

/* ── State ──────────────────────────────────────────────── */
let _sb          = null;
let _session     = null;
let _chats       = [];        // [{id, title, updated_at}]
let _currentId   = null;      // current chat UUID (Supabase)
let _history     = [];        // [{role, content, id?}] for current chat
let _responding  = false;
let _abortCtrl   = null;
let _ttsAudio    = null;
let _ttsSpeaking = false;

let _settings = {
  model:            MODELS[0].id,
  streaming:        true,
  theme:            'light',
  trainingConsent:  false,
  displayName:      '',       // How Cyanix addresses the user
  personality:      'friendly', // AI personality preset
};

// Personality system prompt snippets
const PERSONALITIES = {
  friendly:     'You are warm, encouraging, and conversational. Use a natural tone like talking to a friend.',
  professional: 'You are formal, precise, and business-like. Responses are structured and thorough.',
  creative:     'You are imaginative, expressive, and think outside the box. Use vivid language and novel ideas.',
  concise:      'You are extremely brief. Answer in as few words as possible. No filler, no repetition.',
  mentor:       'You are a patient teacher. Explain step-by-step, check understanding, and guide the user to learn.',
  witty:        'You are clever and humorous. Use light wit and playful wordplay while still being helpful.',
};

function buildSystemPrompt() {
  const personalityLine = PERSONALITIES[_settings.personality] || PERSONALITIES.friendly;
  const nameLine = _settings.displayName
    ? `The user's name is ${_settings.displayName}. Always address them as ${_settings.displayName}.`
    : '';
  return [
    'You are Cyanix AI, a powerful and intelligent assistant.',
    personalityLine,
    nameLine,
  ].filter(Boolean).join(' ');
}

/* ── DOM helpers ─────────────────────────────────────────── */
const $    = id  => document.getElementById(id);
const show = el  => { if (typeof el === 'string') el = $(el); if (el) el.classList.remove('hidden'); };
const hide = el  => { if (typeof el === 'string') el = $(el); if (el) el.classList.add('hidden'); };
const on   = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

function toast(msg, ms = 2800) {
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
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ── Auth headers ────────────────────────────────────────── */
// Edge functions are called with the anon key as the Bearer token.
// The GROQ_API_KEY secret lives only on the server — never exposed to clients.
function edgeHeaders() {
  // Prefer the user's live access_token — falls back to anon key.
  // NEVER send empty Bearer string — Supabase gateway rejects it with 401.
  const token = _session?.access_token || SUPABASE_ANON;
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
    'apikey':        SUPABASE_ANON,
  };
}

/* ── Markdown renderer ──────────────────────────────────── */
// Streaming-safe renderer — handles partial <think> blocks during live stream
function renderStreamingContent(text) {
  const hasOpenThink  = text.includes('<think>');
  const hasCloseThink = text.includes('</think>');

  // Fully closed <think> block — render normally
  if (hasOpenThink && hasCloseThink) {
    return mdToHTML(text);
  }

  // Partial: <think> opened but not closed yet — show live thinking panel
  if (hasOpenThink && !hasCloseThink) {
    const thinkStart  = text.indexOf('<think>') + 7;
    const thinkRaw    = text.slice(thinkStart);
    const afterThink  = ''; // nothing after the open think yet
    const safe = thinkRaw
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/
/g,'<br>');
    return `<details class="think-block" open>
      <summary class="think-summary">
        <svg class="think-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        Cyanix is thinking…
      </summary>
      <div class="think-body">${safe}</div>
    </details>`;
  }

  // No think block at all — normal render
  return mdToHTML(text);
}

function mdToHTML(text) {
  // ── Strip and render <think>...</think> as a collapsible reasoning panel ──
  let thinkHTML = '';
  text = text.replace(/<think>([\s\S]*?)<\/think>/i, (_, content) => {
    const trimmed = content.trim();
    if (!trimmed) return '';
    // Escape HTML inside think block, then convert newlines
    const safe = trimmed
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\n/g,'<br>');
    thinkHTML = `<details class="think-block" open>
      <summary class="think-summary">
        <svg class="think-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        Cyanix is thinking…
      </summary>
      <div class="think-body">${safe}</div>
    </details>`;
    return '';
  });

  // ── Render follow-up suggestions section ─────────────────
  // Matches the "---\n💡 **Want to go further?**\n..." footer
  let suggestHTML = '';
  const suggestMatch = text.match(/---\s*\n?💡\s*\*\*[^\n]+\*\*([\s\S]*?)$/);
  if (suggestMatch) {
    text = text.replace(/---\s*\n?💡\s*\*\*[^\n]+\*\*[\s\S]*?$/, '').trimEnd();
    const lines = suggestMatch[1].trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length) {
      const chips = lines.map(l =>
        `<button class="suggest-chip" onclick="injectSuggestion(this)">${
          l.replace(/^[-–•]\s*/, '').replace(/[?]$/, '').trim() + '?'
        }</button>`
      ).join('');
      suggestHTML = `<div class="suggest-row">
        <span class="suggest-label">💡 Want to go further?</span>
        <div class="suggest-chips">${chips}</div>
      </div>`;
    }
  }

  const codeBlocks = [];
  let t = text.replace(/\`\`\`(\w*)\n?([\s\S]*?)\`\`\`/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || 'code', code });
    return `\x00CODE${idx}\x00`;
  });

  t = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  t = t.replace(/\*\*(.+?)\*\*/g,  '<strong>$1</strong>');
  t = t.replace(/\*(.+?)\*/g,      '<em>$1</em>');
  t = t.replace(/`([^`]+)`/g,      '<code>$1</code>');
  t = t.replace(/~~(.+?)~~/g,      '<del>$1</del>');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  t = t.replace(/^### (.+)$/gm,    '<h3>$1</h3>');
  t = t.replace(/^## (.+)$/gm,     '<h2>$1</h2>');
  t = t.replace(/^# (.+)$/gm,      '<h1>$1</h1>');
  t = t.replace(/^> (.+)$/gm,      '<blockquote>$1</blockquote>');
  t = t.replace(/^\d+\. (.+)$/gm,  '<liO>$1</liO>');
  t = t.replace(/^[-*] (.+)$/gm,   '<liU>$1</liU>');
  t = t.replace(/(<liU>[\s\S]*?<\/liU>)+/g, m => '<ul>' + m.replace(/<liU>([\s\S]*?)<\/liU>/g,'<li>$1</li>') + '</ul>');
  t = t.replace(/(<liO>[\s\S]*?<\/liO>)+/g, m => '<ol>' + m.replace(/<liO>([\s\S]*?)<\/liO>/g,'<li>$1</li>') + '</ol>');
  t = t.split(/\n{2,}/).map(p => {
    p = p.trim();
    if (!p) return '';
    if (/^<(h[1-3]|ul|ol|blockquote|pre)/.test(p)) return p;
    return `<p>${p.replace(/\n/g,'<br>')}</p>`;
  }).join('');

  t = t.replace(/\x00CODE(\d+)\x00/g, (_, i) => {
    const { lang, code } = codeBlocks[+i];
    const ec   = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const lines = code.split('\n').length;
    // Show Bundle button for code blocks >= 20 lines
    const bundleBtn = lines >= 20
      ? `<button class="bundle-code-btn" onclick="bundleCode(this)" title="Download as file">&#128230; Bundle</button>`
      : '';
    return `<div class="code-block" data-lang="${esc(lang)}">
      <div class="code-header">
        <span class="code-lang">${esc(lang)}</span>
        <div class="code-actions">
          ${bundleBtn}
          <button class="copy-code-btn" onclick="copyCode(this)">Copy</button>
        </div>
      </div>
      <pre><code>${ec}</code></pre>
    </div>`;
  });
  return (thinkHTML ? thinkHTML + '\n' : '') + t + (suggestHTML ? '\n' + suggestHTML : '');
}

window.copyCode = function(btn) {
  const code = btn.closest('.code-block').querySelector('code').textContent;
  navigator.clipboard?.writeText(code).then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
};

// When user taps a suggestion chip, inject the text into the composer and send
window.injectSuggestion = function(btn) {
  const text = btn.textContent.trim();
  const input = $('composer-input');
  if (!input) return;
  input.value = text;
  input.focus();
  // Auto-resize textarea
  input.style.height = 'auto';
  input.style.height = input.scrollHeight + 'px';
  // Trigger send after a brief visual flash so the user sees what was injected
  btn.classList.add('chip-used');
  setTimeout(() => {
    const sendBtn = $('send-btn');
    if (sendBtn) sendBtn.click();
  }, 180);
};

window.bundleCode = function(btn) {
  const block = btn.closest('.code-block');
  const code  = block.querySelector('code').textContent;
  const lang  = (block.dataset.lang || 'txt').toLowerCase().trim();

  // Map language name → file extension
  const EXT_MAP = {
    javascript: 'js', typescript: 'ts', python: 'py', py: 'py',
    html: 'html', css: 'css', json: 'json', bash: 'sh', shell: 'sh',
    sh: 'sh', sql: 'sql', java: 'java', kotlin: 'kt', swift: 'swift',
    rust: 'rs', go: 'go', cpp: 'cpp', c: 'c', ruby: 'rb', php: 'php',
    dart: 'dart', yaml: 'yaml', yml: 'yml', xml: 'xml', markdown: 'md',
    md: 'md', r: 'r', scala: 'scala', lua: 'lua', perl: 'pl',
  };
  const ext  = EXT_MAP[lang] || (lang.length <= 6 && lang !== 'code' ? lang : 'txt');
  const name = `cyanix-code.${ext}`;

  const blob = new Blob([code], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);

  const a    = document.createElement('a');
  a.href     = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Visual feedback on button
  const orig = btn.innerHTML;
  btn.innerHTML = '&#10003; Saved!';
  btn.style.color = 'var(--green, #22c55e)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
};

/* ══════════════════════════════════════════════════════════
   BOOT — loading splash shown by default in HTML
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  loadSettings();
  applyTheme(_settings.theme);

  // Bind all UI immediately — no race condition
  bindAuthUI();
  bindChatUI();
  populateModels();

  // Safety check
  if (!window.supabase?.createClient) {
    hideSplash();
    show('view-auth');
    toast('Service unavailable — check connection and refresh.');
    console.error('[CyanixAI] Supabase SDK not loaded.');
    return;
  }

  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  // Auth state listener — handles ALL sign in/out events including
  // page reload, OAuth redirect, sign out, and token refresh.
  // No boot flag needed — onSignedIn is idempotent.
  _sb.auth.onAuthStateChange(async (event, session) => {
    console.log('[CyanixAI] auth event:', event, session?.user?.email);
    _session = session;

    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      if (session) {
        await onSignedIn(session);
      } else {
        // INITIAL_SESSION with no session = not logged in
        hideSplash();
        show('view-auth');
      }
    } else if (event === 'SIGNED_OUT') {
      onSignedOut();
    } else if (event === 'TOKEN_REFRESHED') {
      // Token silently refreshed — just update session, no UI change needed
      console.log('[CyanixAI] Token refreshed');
    }
  });

  // Kick things off — getSession() triggers INITIAL_SESSION event above
  // so we don't need to handle the result separately
  try {
    await _sb.auth.getSession();
  } catch (err) {
    console.error('[CyanixAI] getSession error:', err);
    hideSplash();
    show('view-auth');
  }
});

function hideSplash() {
  const el = $('view-loading');
  if (el) {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    setTimeout(() => hide(el), 320);
  }
}

/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
function bindAuthUI() {
  document.querySelectorAll('.switch-link').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); showPanel(a.dataset.to); });
  });
  on('forgot-link', 'click', e => { e.preventDefault(); showPanel('forgot'); });

  on('si-btn',      'click',  signIn);
  on('si-email',    'keydown', e => { if (e.key === 'Enter') $('si-password').focus(); });
  on('si-password', 'keydown', e => { if (e.key === 'Enter') signIn(); });

  on('su-btn',      'click',  signUp);
  on('su-password', 'keydown', e => { if (e.key === 'Enter') signUp(); });

  on('fp-btn',   'click',  sendReset);
  on('fp-email', 'keydown', e => { if (e.key === 'Enter') sendReset(); });

  on('si-google', 'click', () => signInOAuth('google'));
  on('si-github', 'click', () => signInOAuth('github'));
  on('su-google', 'click', () => signInOAuth('google'));
  on('su-github', 'click', () => signInOAuth('github'));
}

function showPanel(name) {
  ['signin','signup','forgot'].forEach(p => {
    const el = $(`panel-${p}`);
    if (el) el.classList.toggle('hidden', p !== name);
  });
  clearAuthMessages();
  if (name === 'signup') initDobField();
}

function clearAuthMessages() {
  ['si-err','si-ok','su-err','su-ok','fp-err','fp-ok'].forEach(id => {
    const el = $(id);
    if (el) { el.textContent = ''; hide(el); }
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
  if (!email || !password) { setMsg('si-err','Please enter your email and password.','err'); return; }

  const btn = $('si-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }
  clearAuthMessages();

  const { error } = await _sb.auth.signInWithPassword({ email, password });
  if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  if (error) setMsg('si-err', error.message, 'err');
}

async function signUp() {
  const name     = $('su-name')?.value.trim();
  const email    = $('su-email')?.value.trim();
  const password = $('su-password')?.value;
  const dobVal   = $('su-dob')?.value;   // "YYYY-MM-DD"

  if (!email || !password) { setMsg('su-err', 'Please fill in all fields.', 'err'); return; }
  if (password.length < 8)  { setMsg('su-err', 'Password must be at least 8 characters.', 'err'); return; }

  // ── Age gate (13+) ───────────────────────────────────────────
  if (!dobVal) {
    setMsg('su-err', 'Please enter your date of birth.', 'err');
    $('su-dob')?.focus();
    return;
  }

  const dob      = new Date(dobVal);
  const today    = new Date();
  // Calculate exact age in years
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (isNaN(age) || dob > today) {
    setMsg('su-err', 'Please enter a valid date of birth.', 'err');
    return;
  }
  if (age < 13) {
    setMsg('su-err', 'You must be 13 or older to use Cyanix AI.', 'err');
    return;
  }

  const btn = $('su-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }
  clearAuthMessages();

  const { error } = await _sb.auth.signUp({
    email, password,
    options: {
      data: { full_name: name || email.split('@')[0], dob: dobVal },
      emailRedirectTo: REDIRECT_URL,
    },
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  if (error) setMsg('su-err', error.message, 'err');
  else setMsg('su-ok', 'Check your email to confirm your account!', 'ok');
}

// Set DOB max date to today when auth panel opens so future dates are blocked
function initDobField() {
  const dob = $('su-dob');
  if (!dob) return;
  const today = new Date();
  // Max = today (can't be born in the future)
  // Practical max for 13+ = today minus 13 years
  const maxAge13 = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
  dob.max = maxAge13.toISOString().split('T')[0];
  // Min = 120 years ago (reasonable human lifespan)
  const minDate = new Date(today.getFullYear() - 120, 0, 1);
  dob.min = minDate.toISOString().split('T')[0];
}

async function sendReset() {
  const email = $('fp-email')?.value.trim();
  if (!email) { setMsg('fp-err','Please enter your email.','err'); return; }

  const btn = $('fp-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  clearAuthMessages();

  const { error } = await _sb.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
  if (btn) { btn.disabled = false; btn.textContent = 'Send Reset Link'; }
  if (error) setMsg('fp-err', error.message, 'err');
  else setMsg('fp-ok', 'Reset link sent! Check your email.', 'ok');
}

async function signInOAuth(provider) {
  const { error } = await _sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_URL } });
  if (error) toast('OAuth error: ' + error.message);
}

async function signOut() {
  // Close all overlays immediately
  hide('settings-modal');
  hide('help-modal');
  hide('user-menu');
  hide('model-dropdown');

  // Sign out from Supabase FIRST — this triggers onAuthStateChange(SIGNED_OUT)
  // which calls onSignedOut() to reset UI and state.
  // Do NOT null _session before this call — Supabase needs the token
  // to hit the revocation endpoint, and nulling it early can prevent
  // the SIGNED_OUT event from firing, breaking sign-back-in.
  try {
    await _sb.auth.signOut();
  } catch (err) {
    console.error('[CyanixAI] signOut error:', err);
    // Force UI reset even if Supabase call failed
    onSignedOut();
  }

  toast('Signed out.');
}

/* ── After sign in ──────────────────────────────────────── */
async function onSignedIn(session) {
  // Idempotent: skip if already showing chat for this same user
  const chatView     = $('view-chat');
  const alreadyShown = chatView && !chatView.classList.contains('hidden');
  const sameUser     = _session?.user?.id === session?.user?.id;
  if (alreadyShown && sameUser && _chats.length > 0) {
    console.log('[CyanixAI] onSignedIn: same user already loaded, skipping');
    return;
  }

  // Reset chat state for fresh load (important after sign-out + sign-in)
  _chats     = [];
  _currentId = null;
  _history   = [];

  hide('view-auth');
  hideSplash();
  show('view-chat');

  const meta     = session.user?.user_metadata;
  const email    = session.user?.email || '';
  const name     = meta?.full_name || meta?.name || email.split('@')[0] || 'User';
  const initials = name.slice(0,2).toUpperCase();

  if ($('user-name'))   $('user-name').textContent  = name;
  if ($('user-avatar')) $('user-avatar').textContent = initials;

  // ── Diagnose DB connectivity right on sign-in ──────────────
  // This tells you the REAL error (missing table, RLS, bad key)
  // instead of finding out mid-conversation
  const dbOk = await testDatabaseAccess();
  if (!dbOk) return; // error toast already shown inside testDatabaseAccess

  // Load preferences from Supabase
  await loadPreferences();

  // Load chat list from Supabase
  await loadChats();

  if (_chats.length === 0) showWelcome();
  else await loadChat(_chats[0].id);
}

// Runs a lightweight SELECT on chats table to verify RLS + connection
async function testDatabaseAccess() {
  try {
    const { error } = await _sb
      .from('chats')
      .select('id')
      .limit(1);

    if (!error) {
      console.log('[CyanixAI] DB access ✓');
      return true;
    }

    // Table doesn't exist — schema.sql was never run
    if (error.code === '42P01') {
      toast('⚠️ Database tables not found. Please run schema.sql in Supabase SQL Editor.', 8000);
      console.error('[CyanixAI] Tables missing:', error.message);
      return false;
    }

    // RLS blocked the read — policies wrong or JWT not attached
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      toast('⚠️ Database permission error (RLS). Re-run schema.sql in Supabase.', 8000);
      console.error('[CyanixAI] RLS error:', error.message);
      return false;
    }

    // JWT / auth error
    if (error.message?.includes('JWT') || error.message?.includes('invalid') || error.code === 'PGRST301') {
      toast('⚠️ Auth token error. Try signing out and back in.', 6000);
      console.error('[CyanixAI] JWT error:', error.message);
      return false;
    }

    // Unknown DB error — show it verbatim
    toast(`⚠️ DB error ${error.code}: ${error.message}`, 8000);
    console.error('[CyanixAI] Unknown DB error:', error);
    return false;

  } catch (err) {
    toast('⚠️ Cannot reach database. Check your Supabase URL and anon key.', 8000);
    console.error('[CyanixAI] DB connectivity error:', err);
    return false;
  }
}

function onSignedOut() {
  hide('view-chat');
  show('view-auth');
  showPanel('signin');
  _session   = null;
  _chats     = [];
  _currentId = null;
  _history   = [];
}

/* ══════════════════════════════════════════════════════════
   CHAT UI BINDING
══════════════════════════════════════════════════════════ */
function bindChatUI() {
  // Sidebar: hamburger in topbar toggles sidebar on/off
  on('sidebar-toggle', 'click', () => $('sidebar')?.classList.toggle('collapsed'));

  // Sidebar: collapse button inside sidebar collapses it
  on('sb-collapse-btn', 'click', () => $('sidebar')?.classList.add('collapsed'));

  on('new-chat-btn', 'click', newChat);
  on('new-chat-top', 'click', newChat);

  on('send-btn', 'click', handleSend);
  on('composer-input', 'keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  on('composer-input', 'input', () => {
    const ta = $('composer-input');
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
  });

  on('settings-btn',   'click', () => { show('settings-modal'); closeUserMenu(); });
  on('settings-close', 'click', () => hide('settings-modal'));
  on('settings-modal', 'click', e => { if (e.target.id === 'settings-modal') hide('settings-modal'); });

  on('streaming-toggle', 'change', () => {
    _settings.streaming = $('streaming-toggle').checked;
    saveSettings();
    syncPreferences();
  });
  on('theme-select', 'change', () => {
    _settings.theme = $('theme-select').value;
    applyTheme(_settings.theme);
    saveSettings();
    syncPreferences();
  });
  on('model-select', 'change', () => {
    _settings.model = $('model-select').value;
    saveSettings();
    syncPreferences();
    updateModelLabel();
  });
  on('consent-toggle', 'change', () => {
    _settings.trainingConsent = $('consent-toggle').checked;
    saveSettings();
    syncPreferences();
    updateTrainingDataRow();
    toast(_settings.trainingConsent
      ? 'Training data collection enabled. Thank you!'
      : 'Training data collection disabled.');
  });

  // Display name
  on('display-name-input', 'input', () => {
    _settings.displayName = ($('display-name-input')?.value || '').trim();
    saveSettings();
    syncPreferences();
  });

  // Personality chips — delegated since chips are in static HTML
  document.querySelectorAll('.personality-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      _settings.personality = chip.dataset.value;
      updatePersonalityChips();
      saveSettings();
      syncPreferences();
      toast('Personality: ' + chip.querySelector('.chip-label')?.textContent?.trim());
    });
  });
  on('delete-training-btn', 'click', async () => {
    if (!confirm('This will withdraw your anonymized contributions from future training batches. Continue?')) return;
    try {
      await fetch(TRAINING_URL, { method: 'DELETE', headers: edgeHeaders() });
      toast('Contributions withdrawn from future training.');
    } catch {
      toast('Could not complete request. Try again.');
    }
  });
  on('clear-chats-btn', 'click', async () => {
    if (!confirm('Clear all chats? This cannot be undone.')) return;
    try {
      await _sb.from('chats').delete().eq('user_id', _session.user.id);
      _chats = []; _currentId = null; _history = [];
      renderChatList(); newChat();
      hide('settings-modal');
      toast('All chats cleared.');
    } catch { toast('Failed to clear chats.'); }
  });
  on('signout-btn', 'click', () => { hide('settings-modal'); signOut(); });

  on('help-btn',   'click', () => { show('help-modal'); closeUserMenu(); });
  on('help-close', 'click', () => hide('help-modal'));
  on('help-modal', 'click', e => { if (e.target.id === 'help-modal') hide('help-modal'); });

  on('user-btn',    'click', toggleUserMenu);
  on('um-settings', 'click', () => { closeUserMenu(); show('settings-modal'); });
  on('um-signout',  'click', () => { closeUserMenu(); signOut(); });

  document.addEventListener('click', e => {
    if (!$('user-btn')?.contains(e.target) && !$('user-menu')?.contains(e.target)) closeUserMenu();
    if (!$('model-btn')?.contains(e.target) && !$('model-dropdown')?.contains(e.target)) hide('model-dropdown');
  });

  on('model-btn', 'click', () => $('model-dropdown')?.classList.toggle('hidden'));

  document.querySelectorAll('.sugg-chip').forEach((chip, i) => {
    chip.textContent = SUGGESTIONS[i] || chip.textContent;
    chip.addEventListener('click', () => {
      const input = $('composer-input');
      if (input) { input.value = chip.textContent; input.focus(); }
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (_responding) stopResponse();
      hide('settings-modal'); hide('help-modal'); closeUserMenu(); hide('model-dropdown');
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); $('composer-input')?.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') { e.preventDefault(); newChat(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); $('sidebar')?.classList.toggle('collapsed'); }
  });

  on('emoji-btn',  'click', () => { const i = $('composer-input'); if (i) { i.value += '😊'; i.focus(); } });
  on('attach-btn', 'click', () => toast('File attachments coming soon.'));
}

function toggleUserMenu() { $('user-menu')?.classList.toggle('hidden'); }
function closeUserMenu()  { hide('user-menu'); }

/* ══════════════════════════════════════════════════════════
   MODELS
══════════════════════════════════════════════════════════ */
function populateModels() {
  const sel = $('model-select');
  if (sel) {
    sel.innerHTML = MODELS.map(m =>
      `<option value="${m.id}" ${m.id === _settings.model ? 'selected' : ''}>${m.name}</option>`
    ).join('');
  }

  const dd = $('model-dropdown');
  if (dd) {
    dd.innerHTML = MODELS.map(m => `
      <div class="md-option ${m.id === _settings.model ? 'active' : ''}" data-id="${m.id}">
        <div class="md-name">${esc(m.name)} <span class="md-tag">${esc(m.tag)}</span></div>
        <div class="md-desc">${esc(m.desc)}</div>
      </div>`).join('');

    dd.querySelectorAll('.md-option').forEach(opt => {
      opt.addEventListener('click', () => {
        _settings.model = opt.dataset.id;
        saveSettings(); syncPreferences(); updateModelLabel();
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

function updateTrainingDataRow() {
  const row = $('training-data-row');
  if (row) row.style.display = _settings.trainingConsent ? '' : 'none';
}

/* ══════════════════════════════════════════════════════════
   SETTINGS & PREFERENCES
   Local: localStorage (instant)
   Remote: user_preferences table (sync across devices)
══════════════════════════════════════════════════════════ */
function saveSettings() {
  try { localStorage.setItem('cx_settings', JSON.stringify(_settings)); } catch {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('cx_settings');
    if (raw) Object.assign(_settings, JSON.parse(raw));
  } catch {}
  syncSettingsToUI();
}

function syncSettingsToUI() {
  if ($('streaming-toggle'))   $('streaming-toggle').checked = _settings.streaming;
  if ($('theme-select'))       $('theme-select').value       = _settings.theme;
  if ($('consent-toggle'))     $('consent-toggle').checked   = _settings.trainingConsent;
  if ($('display-name-input')) $('display-name-input').value = _settings.displayName || '';
  if ($('personality-input'))  $('personality-input').value  = _settings.personality  || 'friendly';
  updateTrainingDataRow();
  updatePersonalityChips();
}

function updatePersonalityChips() {
  document.querySelectorAll('.personality-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.value === _settings.personality);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

// Load preferences from Supabase, override local
async function loadPreferences() {
  if (!_session) return;
  try {
    const { data } = await _sb
      .from('user_preferences')
      .select('*')
      .eq('user_id', _session.user.id)
      .single();

    if (data) {
      _settings.model           = data.model           || _settings.model;
      _settings.streaming       = data.streaming       ?? _settings.streaming;
      _settings.theme           = data.theme           || _settings.theme;
      _settings.trainingConsent = data.training_consent ?? _settings.trainingConsent;
      _settings.displayName     = data.display_name    || '';
      _settings.personality     = data.personality     || 'friendly';
      saveSettings();
      applyTheme(_settings.theme);
      populateModels();
      syncSettingsToUI();
    }
  } catch { /* first login — row doesn't exist yet */ }
}

// Upsert preferences to Supabase
async function syncPreferences() {
  if (!_session) return;
  try {
    await _sb.from('user_preferences').upsert({
      user_id:          _session.user.id,
      model:            _settings.model,
      streaming:        _settings.streaming,
      theme:            _settings.theme,
      training_consent: _settings.trainingConsent,
      display_name:     _settings.displayName  || null,
      personality:      _settings.personality  || 'friendly',
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch (err) {
    console.warn('[CyanixAI] Prefs sync failed:', err);
  }
}

/* ══════════════════════════════════════════════════════════
   CHAT HISTORY — SUPABASE (not localStorage)
══════════════════════════════════════════════════════════ */
async function loadChats() {
  if (!_session) return;
  try {
    const { data, error } = await _sb
      .from('chats')
      .select('id, title, model, updated_at')
      .eq('user_id', _session.user.id)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    _chats = data || [];
    renderChatList();
  } catch (err) {
    console.error('[CyanixAI] loadChats error:', err);
    _chats = [];
    renderChatList();
  }
}

async function loadChat(id) {
  if (!_session || !id) return;
  try {
    const { data: msgs, error } = await _sb
      .from('messages')
      .select('id, role, content, created_at')
      .eq('chat_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    _currentId = id;
    _history   = (msgs || []).map(m => ({ id: m.id, role: m.role, content: m.content }));

    const chat = _chats.find(c => c.id === id);
    if ($('chat-title')) $('chat-title').textContent = chat?.title || 'Chat';

    clearMessages();
    hide('welcome-state');

    _history.forEach(msg => renderMessage(msg.role, msg.content, false, msg.id));
    renderChatList();
    scrollToBottom();
  } catch (err) {
    console.error('[CyanixAI] loadChat error:', err);
    toast('Failed to load chat.');
  }
}

// Generate a local UUID — works in all modern browsers
function localUUID() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Try to persist chat to Supabase in the background.
// If it fails we silently continue — app already works locally.
async function syncChatToDB(localId, title) {
  if (!_sb || !_session) return;
  try {
    const { data, error } = await _sb.from('chats').insert({
      user_id: _session.user.id,
      title,
      model: _settings.model,
    }).select('id').single();

    if (error) {
      console.warn('[CyanixAI] DB sync failed (non-fatal):', error.code, error.message);
      return null;
    }

    // Swap local UUID for real DB id everywhere
    if (data.id && data.id !== localId) {
      _currentId = data.id;
      _chats = _chats.map(c => c.id === localId ? { ...c, id: data.id } : c);
      renderChatList();
    }
    return data.id;
  } catch (err) {
    console.warn('[CyanixAI] DB sync exception (non-fatal):', err.message);
    return null;
  }
}

async function syncMessagesToDB(chatId, userText, aiText) {
  if (!_sb || !_session || !chatId) return null;
  try {
    const { data, error } = await _sb.from('messages').insert([
      { chat_id: chatId, user_id: _session.user.id, role: 'user',      content: userText },
      { chat_id: chatId, user_id: _session.user.id, role: 'assistant', content: aiText   },
    ]).select('id');

    if (error) {
      console.warn('[CyanixAI] Message sync failed (non-fatal):', error.code, error.message);
      return null;
    }
    return data?.[1]?.id ?? null; // return AI message id for feedback
  } catch (err) {
    console.warn('[CyanixAI] Message sync exception (non-fatal):', err.message);
    return null;
  }
}

// Runs entirely in background — never awaited by the UI
async function bgSyncMessages(isNewChat, userText, aiText, msgEl) {
  let chatId = _currentId;

  try {
    // Step 1: if this was a new chat, create it in DB
    if (isNewChat) {
      const title = userText.slice(0, 60).trim();
      const realId = await syncChatToDB(chatId, title);
      if (realId) chatId = realId; // _currentId already updated inside syncChatToDB
    }

    // Step 2: save both messages
    const aiMsgId = await syncMessagesToDB(chatId, userText, aiText);

    // Step 3: add feedback buttons now that we have a real message ID
    if (aiMsgId && msgEl) addFeedbackButtons(msgEl, aiMsgId);

    // Step 4: training data (optional, consent-gated)
    await maybeCollectTraining(userText, aiText);

    // Step 5: refresh sidebar chat list
    await loadChats();

  } catch (err) {
    // Background sync errors are non-fatal — just log
    console.warn('[CyanixAI] bgSyncMessages error (non-fatal):', err.message);
  }
}

async function saveChatTitle(chatId, title) {
  await _sb.from('chats')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', chatId);
}

// saveMessages replaced by syncMessagesToDB (background sync)

// Collect training data (only if consent given)
async function maybeCollectTraining(userText, aiText) {
  if (!_settings.trainingConsent || !_session) return;
  try {
    await fetch(TRAINING_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({ message: userText, response: aiText, model: _settings.model }),
    });
  } catch {}
}

/* ══════════════════════════════════════════════════════════
   CHAT LIST RENDER
══════════════════════════════════════════════════════════ */
function renderChatList() {
  const list = $('chat-list');
  if (!list) return;

  if (_chats.length === 0) {
    list.innerHTML = `<div class="sb-list-empty">No chats yet.<br>Start a conversation!</div>`;
    return;
  }

  list.innerHTML = _chats.map(c => `
    <div class="chat-item ${c.id === _currentId ? 'active' : ''}" data-id="${esc(c.id)}">
      <span class="ci-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </span>
      <span class="ci-label">${esc(c.title || 'New chat')}</span>
      <button class="ci-del" data-id="${esc(c.id)}" title="Delete chat">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`).join('');

  list.querySelectorAll('.chat-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('.ci-del')) return;
      loadChat(item.dataset.id);
    });
  });
  list.querySelectorAll('.ci-del').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); deleteChat(btn.dataset.id); });
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

async function deleteChat(id) {
  try {
    await _sb.from('chats').delete().eq('id', id);
    _chats = _chats.filter(c => c.id !== id);
    if (_currentId === id) newChat();
    else renderChatList();
    toast('Chat deleted.');
  } catch { toast('Failed to delete chat.'); }
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

  // ── LOCAL-FIRST: assign a local UUID immediately — never blocks ──
  // The app works whether or not Supabase is reachable.
  // DB sync happens in the background after the AI responds.
  const isNewChat = !_currentId;
  if (isNewChat) {
    _currentId = localUUID();
    const title = text.slice(0, 60).trim();
    _chats.unshift({ id: _currentId, title, updated_at: new Date().toISOString(), _local: true });
    renderChatList();
    if ($('chat-title')) $('chat-title').textContent = title;
  }

  hide('welcome-state');
  _history.push({ role: 'user', content: text });
  renderMessage('user', text, true);

  show('typing-row');
  scrollToBottom();

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ..._history.slice(-20).map(m => ({ role: m.role, content: m.content })),
  ];

  _abortCtrl = new AbortController();

  let aiText = '';

  try {
    const res = await fetch(CHAT_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({
        model:        _settings.model,
        messages,
        stream:       _settings.streaming,
        max_tokens:   2048,
        chat_id:      _currentId,
        user_message: text,
      }),
      signal: _abortCtrl.signal,
    });

    hide('typing-row');

    if (!res.ok) {
      const errText = await res.text().catch(() => 'Unknown error');
      throw new Error(`API error ${res.status}: ${errText}`);
    }

    if (_settings.streaming && res.body) {
      const { bubbleEl, msgEl } = renderMessage('ai', '', true);
      bubbleEl.innerHTML = '<span class="stream-cursor"></span>';

      const reader     = res.body.getReader();
      const decoder    = new TextDecoder();
      let done         = false;
      let lineBuffer   = '';

      // 45-second hard timeout kills any hung stream
      let streamTimedOut = false;
      const streamTimeout = setTimeout(() => {
        streamTimedOut = true;
        reader.cancel('timeout');
      }, 45000);

      try {
        while (!done) {
          const { value, done: d } = await reader.read();
          done = d;
          if (!value) continue;

          // Buffer to handle chunks split across mid-line
          lineBuffer += decoder.decode(value, { stream: true });
          const lines = lineBuffer.split('\n');
          lineBuffer  = lines.pop() ?? '';   // last partial line stays in buffer

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6).trim();
            if (data === '[DONE]') { done = true; break; }
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                throw new Error(parsed.error.message || 'API stream error');
              }
              const delta = parsed.choices?.[0]?.delta?.content || '';
              if (delta) {
                aiText += delta;
                bubbleEl.innerHTML = renderStreamingContent(aiText) + '<span class="stream-cursor"></span>';
                scrollToBottom();
              }
            } catch (pe) {
              if (pe.message === 'API stream error' || pe.message.includes('API')) throw pe;
              // ignore JSON parse errors on partial/empty chunks
            }
          }
        }
      } catch (streamErr) {
        if (streamErr.message && !streamErr.message.includes('cancel')) {
          throw streamErr; // re-throw real errors, not cancel
        }
      } finally {
        clearTimeout(streamTimeout);
      }

      // Render final content or error
      if (!aiText.trim()) {
        const reason = streamTimedOut
          ? 'Response timed out. The model may be busy — try again.'
          : 'No response received. The model may be unavailable — try switching models in Settings.';
        bubbleEl.innerHTML = `<span style="color:var(--red)">&#10060; ${reason}</span>`;
        aiText = ''; // don't save empty response
      } else {
        bubbleEl.innerHTML = mdToHTML(aiText);
      }

      // Only save and add feedback if we have content
      if (aiText.trim()) {
        _history.push({ role: 'assistant', content: aiText });
        // Background sync — doesn't block the UI
        bgSyncMessages(isNewChat, text, aiText, msgEl);
      }

    } else {
      const data = await res.json();
      aiText = data.choices?.[0]?.message?.content || 'No response received.';
      const { msgEl } = renderMessage('ai', aiText, true);
      _history.push({ role: 'assistant', content: aiText });
      bgSyncMessages(isNewChat, text, aiText, msgEl);
    }

    scrollToBottom();
    // Training data collected inside bgSyncMessages after DB sync

  } catch (err) {
    hide('typing-row');
    if (err.name !== 'AbortError') {
      renderMessage('ai', `❌ Error: ${esc(err.message)}`, true);
    }
  }

  _responding = false;
  setSendBtn('send');
  $('composer-input')?.focus();
}

// saveMessagesAndUpdateHistory replaced by bgSyncMessages

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
function renderMessage(role, content, animate = true, msgId = null) {
  hide('welcome-state');
  const container = $('messages');
  if (!container) return {};

  const row = document.createElement('div');
  row.className = `msg-row ${role === 'user' ? 'user' : ''}`;
  if (msgId) row.dataset.msgId = msgId;
  if (!animate) row.style.animation = 'none';

  if (role === 'user') {
    row.innerHTML = `
      <div class="msg-content">
        <div class="msg-bubble">${esc(content)}</div>
        <div class="msg-ts">${timeStr()}</div>
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this)">Copy</button>
        </div>
      </div>`;
  } else {
    row.innerHTML = `
      <div class="ai-avatar"><img src="cyanix_emblem.png" alt="Cyanix AI" /></div>
      <div class="msg-content">
        <div class="msg-name"><strong>Cyanix AI</strong></div>
        <div class="msg-bubble">${content ? mdToHTML(content) : ''}</div>
        <div class="msg-ts">${timeStr()}</div>
        <div class="msg-actions">
          <button class="msg-action-btn" onclick="copyMsg(this)">Copy</button>
          <button class="msg-action-btn" onclick="speakMsg(this)">&#9654; Listen</button>
        </div>
      </div>`;
  }

  container.appendChild(row);
  scrollToBottom();

  const bubbleEl = row.querySelector('.msg-bubble');
  return { msgEl: row, bubbleEl };
}

/* ── Feedback buttons ───────────────────────────────────── */
function addFeedbackButtons(msgEl, messageId) {
  if (!msgEl || !messageId) return;
  const actions = msgEl.querySelector('.msg-actions');
  if (!actions) return;

  const up   = document.createElement('button');
  const down = document.createElement('button');
  up.className   = 'msg-action-btn thumb-up';
  down.className = 'msg-action-btn thumb-down';
  up.textContent   = '👍';
  down.textContent = '👎';

  up.addEventListener('click',   () => submitFeedback(messageId, 1,  up,   down));
  down.addEventListener('click', () => submitFeedback(messageId, -1, down, up));

  actions.appendChild(up);
  actions.appendChild(down);
}

async function submitFeedback(messageId, value, clickedBtn, otherBtn) {
  // Mark voted
  clickedBtn.classList.add('voted');
  otherBtn.classList.remove('voted');

  try {
    // Save to message_feedback table
    await _sb.from('message_feedback').upsert({
      message_id: messageId,
      chat_id:    _currentId,
      user_id:    _session.user.id,
      feedback:   value,
    }, { onConflict: 'message_id,user_id' });

    toast(value === 1 ? 'Thanks for the feedback!' : 'Got it, we\'ll improve.');
  } catch (err) {
    console.error('[CyanixAI] feedback error:', err);
    toast('Could not save feedback.');
  }
}

window.copyMsg = function(btn) {
  const bubble = btn.closest('.msg-content').querySelector('.msg-bubble');
  navigator.clipboard?.writeText(bubble.innerText || bubble.textContent || '').then(() => {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });
};

window.speakMsg = async function(btn) {
  // BUG FIX #4: Clone the bubble and remove all child buttons/action elements
  // before reading text — otherwise innerText includes "Copy", "Listen" etc.
  const bubbleEl = btn.closest('.msg-content').querySelector('.msg-bubble');
  if (!bubbleEl) return;
  const clone = bubbleEl.cloneNode(true);
  clone.querySelectorAll('button, .msg-actions, .feedback-row, .code-block-header').forEach(el => el.remove());
  const text = (clone.innerText || clone.textContent || '').trim().slice(0, 2000);
  if (!text) return;

  // If already speaking — stop it
  if (_ttsSpeaking) {
    if (_ttsAudio) { _ttsAudio.pause(); _ttsAudio.src = ''; _ttsAudio = null; }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    _ttsSpeaking = false;
    btn.innerHTML = '&#9654; Listen';
    return;
  }

  btn.innerHTML = '&#9632; Stop';
  _ttsSpeaking  = true;

  try {
    const res = await fetch(TTS_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({ text, voice: 'Fritz-PlayAI' }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `TTS error ${res.status}`);
    }

    // BUG FIX #5: Edge function now returns mp3 — use audio/mpeg MIME type
    const arrayBuf = await res.arrayBuffer();
    const blob     = new Blob([arrayBuf], { type: 'audio/mpeg' });
    const url      = URL.createObjectURL(blob);
    _ttsAudio      = new Audio(url);

    _ttsAudio.onended = () => {
      _ttsSpeaking = false;
      btn.innerHTML = '&#9654; Listen';
      URL.revokeObjectURL(url);
    };
    _ttsAudio.onerror = (e) => {
      console.error('[CyanixAI] Audio playback error:', e);
      _ttsSpeaking = false;
      btn.innerHTML = '&#9654; Listen';
      URL.revokeObjectURL(url);
      toast('Audio playback failed.');
    };

    await _ttsAudio.play();

  } catch (err) {
    console.error('[CyanixAI] TTS fetch error:', err);
    _ttsSpeaking = false;
    btn.innerHTML = '&#9654; Listen';
    // Fallback to browser Web Speech API
    if (window.speechSynthesis) {
      toast('Using browser voice as fallback.');
      const utt   = new SpeechSynthesisUtterance(text.slice(0, 2000));
      utt.lang    = 'en-GB';  // British English to match Orion accent
      utt.rate    = 0.95;
      utt.pitch   = 0.9;
      // Try to find a male British voice
      const voices = window.speechSynthesis.getVoices();
      const male   = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.toLowerCase().includes('male') ||
         v.name.toLowerCase().includes('daniel') ||
         v.name.toLowerCase().includes('oliver') ||
         v.name.toLowerCase().includes('george'))
      );
      if (male) utt.voice = male;
      btn.innerHTML = '&#9632; Stop';
      _ttsSpeaking  = true;
      utt.onend = () => { _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen'; };
      utt.onerror = () => { _ttsSpeaking = false; btn.innerHTML = '&#9654; Listen'; };
      window.speechSynthesis.speak(utt);
    } else {
      toast('Voice unavailable. Deploy the TTS edge function.');
    }
  }
};

/* ── Utility ────────────────────────────────────────────── */
function clearMessages() {
  const m = $('messages');
  if (m) m.querySelectorAll('.msg-row').forEach(el => el.remove());
}

function showWelcome() { show('welcome-state'); }

function scrollToBottom() {
  const s = $('chat-scroll');
  if (s) s.scrollTop = s.scrollHeight;
}
