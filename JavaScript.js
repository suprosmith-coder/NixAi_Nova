/* ═══════════════════════════════════════════════════════════════
   CYANIX AI — JavaScript.js
   Full-featured: Groq streaming · Supabase · HUD galaxy · All features
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ─── CONFIG ──────────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const SEARCH_URL    = `${SUPABASE_URL}/functions/v1/search`;
const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];
const EDGE_HEADERS  = { 'Content-Type':'application/json', 'Authorization':`Bearer ${SUPABASE_ANON}`, 'apikey':SUPABASE_ANON };

/* ─── MODELS ──────────────────────────────────────────────────── */
const MODELS = [
  { id:'meta-llama/llama-4-scout-17b-16e-instruct', name:'Llama 4 Scout', tag:'FAST',    desc:'Best speed · Great for everyday tasks',      color:'#00e8ff' },
  { id:'meta-llama/llama-4-maverick-17b-128e-instruct', name:'Llama 4 Maverick', tag:'BALANCED', desc:'Speed + reasoning · General purpose',  color:'#00e5a0' },
  { id:'deepseek-r1-distill-llama-70b',            name:'DeepSeek R1',  tag:'THINK',   desc:'Shows reasoning process · Complex problems',  color:'#b388ff' },
  { id:'mixtral-8x7b-32768',                        name:'Mixtral 8x7B', tag:'REASON',  desc:'Strong reasoning · Long context (32k)',        color:'#ffb703' },
  { id:'llama-3.3-70b-versatile',                   name:'Llama 3.3 70B',tag:'POWER',   desc:'Most capable · Detailed responses',            color:'#ff7c38' },
];

/* ─── CLUSTER DATA ────────────────────────────────────────────── */
const CLUSTERS = [
  { id:'ai',       label:'AI Tools',    color:'#00e8ff', angle:90,  dist:1,
    sites:[{n:'ChatGPT',u:'https://chat.openai.com',l:1},{n:'Claude',u:'https://claude.ai',l:1},{n:'Gemini',u:'https://gemini.google.com',l:1},{n:'Cyanix AI',u:'#',l:1},{n:'Perplexity',u:'https://perplexity.ai',l:1},{n:'Midjourney',u:'https://midjourney.com',l:2},{n:'Runway',u:'https://runwayml.com',l:2},{n:'ElevenLabs',u:'https://elevenlabs.io',l:2},{n:'Cursor',u:'https://cursor.sh',l:2}]},
  { id:'social',   label:'Social',      color:'#ff4d6d', angle:310, dist:1,
    sites:[{n:'Twitter/X',u:'https://x.com',l:1},{n:'Instagram',u:'https://instagram.com',l:1},{n:'TikTok',u:'https://tiktok.com',l:1},{n:'Reddit',u:'https://reddit.com',l:1},{n:'Facebook',u:'https://facebook.com',l:1},{n:'LinkedIn',u:'https://linkedin.com',l:1},{n:'Discord',u:'https://discord.com',l:2},{n:'Snapchat',u:'https://snapchat.com',l:2}]},
  { id:'gaming',   label:'Gaming',      color:'#a855f7', angle:25,  dist:1,
    sites:[{n:'Steam',u:'https://store.steampowered.com',l:1},{n:'Twitch',u:'https://twitch.tv',l:1},{n:'Epic Games',u:'https://epicgames.com',l:1},{n:'Roblox',u:'https://roblox.com',l:1},{n:'Xbox',u:'https://xbox.com',l:2},{n:'PlayStation',u:'https://playstation.com',l:2},{n:'GOG',u:'https://gog.com',l:2}]},
  { id:'news',     label:'News',        color:'#ffb703', angle:210, dist:1,
    sites:[{n:'BBC',u:'https://bbc.com',l:1},{n:'Reuters',u:'https://reuters.com',l:1},{n:'The Verge',u:'https://theverge.com',l:1},{n:'TechCrunch',u:'https://techcrunch.com',l:1},{n:'Wired',u:'https://wired.com',l:2},{n:'Hacker News',u:'https://news.ycombinator.com',l:2}]},
  { id:'startups', label:'Startups',    color:'#00e5a0', angle:155, dist:1,
    sites:[{n:'Y Combinator',u:'https://ycombinator.com',l:1},{n:'Vercel',u:'https://vercel.com',l:1},{n:'Supabase',u:'https://supabase.com',l:1},{n:'Figma',u:'https://figma.com',l:1},{n:'Notion',u:'https://notion.so',l:2},{n:'Linear',u:'https://linear.app',l:2}]},
  { id:'education',label:'Education',   color:'#3b82f6', angle:248, dist:1,
    sites:[{n:'Khan Academy',u:'https://khanacademy.org',l:1},{n:'Wikipedia',u:'https://wikipedia.org',l:1},{n:'YouTube',u:'https://youtube.com',l:1},{n:'Coursera',u:'https://coursera.org',l:2},{n:'Duolingo',u:'https://duolingo.com',l:2}]},
  { id:'ecommerce',label:'E-Commerce',  color:'#ff7c38', angle:58,  dist:1,
    sites:[{n:'Amazon',u:'https://amazon.com',l:1},{n:'Shopify',u:'https://shopify.com',l:1},{n:'Etsy',u:'https://etsy.com',l:1},{n:'eBay',u:'https://ebay.com',l:2},{n:'Stripe',u:'https://stripe.com',l:2}]},
  { id:'darkweb',  label:'Dark Web',    color:'#475569', angle:345, dist:1,
    sites:[{n:'[REDACTED]',u:'#',l:4},{n:'[UNKNOWN]',u:'#',l:4},{n:'[ENCRYPTED]',u:'#',l:4}]},
];

const CAT_COLORS = { ai:'#00e8ff',social:'#ff4d6d',gaming:'#a855f7',news:'#ffb703',startups:'#00e5a0',education:'#3b82f6',ecommerce:'#ff7c38',darkweb:'#475569',other:'#64748b' };
const SITE_DESCS = { 'ChatGPT':"OpenAI's chatbot — sparked the AI wave.",'Claude':"Anthropic's AI, known for safety & long context.",'Cyanix AI':"You're here — AI-powered internet search.",'Twitter/X':'Real-time social and breaking news.','Reddit':'Forums for every topic imaginable.','Steam':"Valve's PC gaming hub — 50k+ titles.",'YouTube':"500 hours of video uploaded every minute.",'Wikipedia':'Free encyclopedia, millions of contributors.','Amazon':"World's largest e-commerce platform.",'Supabase':'Open-source Firebase alternative on Postgres.','[REDACTED]':'ACCESS DENIED.','[UNKNOWN]':'ORIGIN UNVERIFIED.','[ENCRYPTED]':'DECRYPTION KEY REQUIRED.' };
const TEMPLATES = [
  { icon:'🧠', title:'Brainstorm Ideas',   desc:'Generate creative ideas on any topic', prompt:'Help me brainstorm ideas for: ' },
  { icon:'✍️', title:'Draft an Email',      desc:'Write a professional or casual email', prompt:'Write a professional email about: ' },
  { icon:'📄', title:'Summarize Text',     desc:'Condense long content into key points', prompt:'Summarize the following text:\n\n' },
  { icon:'💻', title:'Write Code',         desc:'Generate, explain, or debug code', prompt:'Write code to: ' },
  { icon:'📊', title:'Analyze & Compare',  desc:'Break down topics, compare options', prompt:'Analyze and compare: ' },
  { icon:'🌐', title:'Search the Web',     desc:'Find current info and resources', prompt:'Search for and summarize: ' },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */
const $         = id => document.getElementById(id);
const show      = (id, d='block') => { const e=$(id); if(e) e.style.display=d; };
const hide      = id => { const e=$(id); if(e) e.style.display='none'; };
const on        = (id, ev, fn) => { const e=$(id); if(e) e.addEventListener(ev,fn); };
const setText   = (id, t) => { const e=$(id); if(e) e.textContent=t; };
const esc       = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const mkEl      = (tag, cls) => { const e=document.createElement(tag); if(cls) e.className=cls; return e; };
const showErr   = (id, m) => { const e=$(id); if(!e) return; e.textContent=m; e.style.display='block'; };
const isMac     = () => navigator.platform.toUpperCase().includes('MAC');
const ctrlKey   = e => isMac() ? e.metaKey : e.ctrlKey;

/* ─── STATE ───────────────────────────────────────────────────── */
let _sb = null, _session = null;
let _chatHistory = [];
let _responding  = false;
let _streaming   = false;
let _abortCtrl   = null;
let _activeLayer = 1;
let _ragContext  = '';
let _currentChatId = null;
let _chats       = [];    // { id, title, messages, pinned, ts, shareToken }
let _voiceRec    = null;
let _isVoiceRecording = false;
let _lastResponseText = '';
let _totalTokens = 0;
let _pendingThinkingText = '';
let _sidebarOpen = true;

/* ─── SETTINGS STATE ─────────────────────────────────────────── */
let _settings = {
  model:     MODELS[0].id,
  tone:      'balanced',
  length:    'balanced',
  format:    'markdown',
  ctxSize:   20,
  streaming: true,
  theme:     'dark',
  systemPrompt: '',
};

/* ═══════════════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  try { loadSettings(); } catch(e) { console.warn('[CX] loadSettings:', e); }
  try { applyTheme(); } catch(e) { console.warn('[CX] applyTheme:', e); }
  try { initSupabase(); } catch(e) { console.warn('[CX] initSupabase:', e); loadChats(); buildSidebar(); }
  try { initHUD(); } catch(e) { console.warn('[CX] initHUD:', e); }
  try { bindMapDoubleTap(); } catch(e) {}
  try { animCounter('counter', 1_847_293, 2200); } catch(e) {}
  try { buildModelDropdown(); } catch(e) { console.warn('[CX] buildModelDropdown:', e); }
  try { buildSidebar(); } catch(e) { console.warn('[CX] buildSidebar:', e); }
  try { renderWelcome(); } catch(e) { console.warn('[CX] renderWelcome:', e); }
  try { bindUI(); } catch(e) { console.warn('[CX] bindUI FAILED:', e); }
  try { bindKeyboard(); } catch(e) {}
  try { setSidebarState(window.innerWidth > 900); } catch(e) {}
});

/* ═══════════════════════════════════════════════════════════════
   SETTINGS PERSISTENCE
═══════════════════════════════════════════════════════════════ */
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('cx_settings') || '{}');
    Object.assign(_settings, s);
  } catch(e) {}
}
function saveSettings() {
  try { localStorage.setItem('cx_settings', JSON.stringify(_settings)); } catch(e) {}
}
function loadChats() {
  try { _chats = JSON.parse(localStorage.getItem('cx_chats') || '[]'); } catch(e) { _chats = []; }
}
function saveChats() {
  try { localStorage.setItem('cx_chats', JSON.stringify(_chats.slice(0, 200))); } catch(e) {}
}

/* ═══════════════════════════════════════════════════════════════
   THEME
═══════════════════════════════════════════════════════════════ */
function applyTheme(t) {
  if (t) _settings.theme = t;
  document.documentElement.setAttribute('data-theme', _settings.theme);
  document.querySelectorAll('.sd-pill[data-val]').forEach(p => {
    if (p.closest('#theme-pills')) p.classList.toggle('active', p.dataset.val === _settings.theme);
  });
}
function toggleTheme() {
  applyTheme(_settings.theme === 'dark' ? 'light' : 'dark');
  saveSettings();
}

/* ═══════════════════════════════════════════════════════════════
   VIEW TRANSITIONS
═══════════════════════════════════════════════════════════════ */
let _hudUIHidden = false;

function setHudUI(visible) {
  _hudUIHidden = !visible;
  const elems = document.querySelectorAll('.hud-panel, .hero, .topbar, .node-tip, .scanline-wrap, .frame');
  elems.forEach(el => {
    el.style.transition = 'opacity 0.4s ease';
    el.style.opacity    = visible ? '' : '0';
    el.style.pointerEvents = visible ? '' : 'none';
  });
}

function toggleHudUI() { setHudUI(_hudUIHidden); }

// Double-tap anywhere on the map canvas restores the UI
function bindMapDoubleTap() {
  const canvas = $('hud-canvas');
  if (!canvas) return;
  canvas.addEventListener('dblclick', () => { if (_hudUIHidden) setHudUI(true); });
  canvas.addEventListener('touchend', (() => {
    let last = 0;
    return () => {
      const now = Date.now();
      if (now - last < 350 && _hudUIHidden) setHudUI(true);
      last = now;
    };
  })());
}
function goToChat() {
  $('view-map').style.display = 'none';
  show('view-chat','flex');
  _hud.paused = true;
  updateUsageBar();
  setTimeout(() => $('chat-input')?.focus(), 80);
}
function goToMap() {
  show('view-map');
  $('view-chat').style.display = 'none';
  if (_hud.paused) { _hud.paused = false; hudLoop(); }
}
function setSidebarState(open) {
  _sidebarOpen = open;
  const sb = document.querySelector('.sidebar');
  const overlay = $('sb-overlay');
  if (!sb) return;
  if (open) {
    sb.classList.remove('collapsed');
    if (window.innerWidth <= 900 && overlay) show('sb-overlay');
    else if (overlay) hide('sb-overlay');
  } else {
    sb.classList.add('collapsed');
    if (overlay) hide('sb-overlay');
  }
}
function toggleSidebar() { setSidebarState(!_sidebarOpen); }

/* ═══════════════════════════════════════════════════════════════
   UI BINDINGS
═══════════════════════════════════════════════════════════════ */
function bindUI() {
  /* Navigation */
  on('enter-chat-btn', 'click', () => { if (!_session) { openAuth(); toast('Sign in to start chatting.'); } else { goToChat(); } });
  on('explore-btn',    'click', () => setHudUI(false));
  on('map-signin-btn', 'click', openAuth);
  on('map-theme-btn',  'click', toggleTheme);
  on('back-btn',       'click', goToMap);
  on('galaxy-btn',     'click', goToMap);
  on('ct-signin-btn',  'click', openAuth);
  on('sb-toggle-btn',  'click', toggleSidebar);
  on('sb-overlay',     'click', () => setSidebarState(false));

  /* New chat */
  on('new-chat-btn', 'click', startNewChat);

  /* History search */
  on('history-search', 'input', e => filterChatList(e.target.value));

  /* Sidebar bottom */
  on('sb-signin-btn', 'click', openAuth);
  on('sb-theme-btn',     'click', toggleTheme);
  on('sb-shortcuts-btn', 'click', () => show('shortcuts-modal','flex'));
  on('shortcuts-close',  'click', () => hide('shortcuts-modal'));

  /* Auth */
  on('auth-close',   'click', closeAuth);
  on('auth-overlay', 'click', e => { if(e.target===$('auth-overlay')) closeAuth(); });
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.auth-panel-form').forEach(f=>f.style.display='none');
      const form = $('tab-'+tab.dataset.tab);
      if(form) form.style.display='flex';
    });
  });
  document.querySelectorAll('.oauth-btn').forEach(btn => {
    btn.addEventListener('click', () => oauthLogin(btn.dataset.provider));
  });
  on('si-btn',  'click', emailSignIn);
  on('su-btn',  'click', emailSignUp);
  on('si-pass', 'keydown', e => { if(e.key==='Enter') emailSignIn(); });
  on('su-conf', 'keydown', e => { if(e.key==='Enter') emailSignUp(); });

  /* Model picker */
  on('model-picker-btn', 'click', e => { e.stopPropagation(); toggleModelDropdown(); });
  document.addEventListener('click', () => hide('model-dropdown'));

  /* Tier buttons */
  document.querySelectorAll('.tier-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeLayer = parseInt(btn.dataset.layer, 10);
      document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Chat composer */
  const input = $('chat-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener('input', () => resizeTA(input));
  }
  on('send-btn',     'click', handleSend);
  on('continue-btn', 'click', continueGenerating);

  /* Toolbar */
  on('voice-btn',        'click', toggleVoice);
  on('voice-inline-btn', 'click', toggleVoice);
  on('export-btn',       'click', () => show('export-modal','flex'));
  on('share-btn',        'click', openShareModal);
  on('settings-btn',     'click', openSettings);
  on('settings-close',   'click', closeSettings);
  on('settings-overlay', 'click', closeSettings);
  on('clear-all-btn',    'click', clearAllChats);

  /* Export */
  on('export-modal-close', 'click', () => hide('export-modal'));
  on('export-modal',       'click', e => { if(e.target===$('export-modal')) hide('export-modal'); });
  on('export-md',  'click', () => exportChat('md'));
  on('export-txt', 'click', () => exportChat('txt'));
  on('export-json','click', () => exportChat('json'));

  /* Share */
  on('share-modal-close', 'click', () => hide('share-modal'));
  on('share-modal',       'click', e => { if(e.target===$('share-modal')) hide('share-modal'); });
  on('share-copy-btn',    'click', copyShareLink);

  /* RAG */
  on('rag-btn',         'click', () => show('rag-modal','flex'));
  on('rag-modal-close', 'click', () => hide('rag-modal'));
  on('rag-cancel',      'click', () => hide('rag-modal'));
  on('rag-save',        'click', saveRagContext);
  on('context-clear',   'click', clearRagContext);
  on('rag-modal',       'click', e => { if(e.target===$('rag-modal')) hide('rag-modal'); });

  /* Settings controls */
  buildSettingsListeners();

  /* Legend */
  buildLegend();

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) { setSidebarState(true); hide('sb-overlay'); }
  });
}

/* ─── Settings ───────────────────────────────────────────────── */
function buildSettingsListeners() {
  /* Sync settings to UI */
  const sp = $('system-prompt');
  if (sp) { sp.value = _settings.systemPrompt; sp.addEventListener('input', () => { _settings.systemPrompt = sp.value; saveSettings(); }); }

  [['tone-pills','tone'],['length-pills','length'],['format-pills','format']].forEach(([id, key]) => {
    document.querySelectorAll(`#${id} .sd-pill`).forEach(pill => {
      pill.classList.toggle('active', pill.dataset.val === _settings[key]);
      pill.addEventListener('click', () => {
        document.querySelectorAll(`#${id} .sd-pill`).forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        _settings[key] = pill.dataset.val;
        saveSettings();
      });
    });
  });

  const ctxSlider = $('ctx-slider');
  if (ctxSlider) {
    ctxSlider.value = _settings.ctxSize;
    setText('ctx-val', `${_settings.ctxSize} messages`);
    ctxSlider.addEventListener('input', () => {
      _settings.ctxSize = parseInt(ctxSlider.value, 10);
      setText('ctx-val', `${_settings.ctxSize} messages`);
      saveSettings();
    });
  }

  const streamToggle = $('stream-toggle');
  if (streamToggle) {
    streamToggle.checked = _settings.streaming;
    streamToggle.addEventListener('change', () => { _settings.streaming = streamToggle.checked; saveSettings(); });
  }

  document.querySelectorAll('#theme-pills .sd-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.val === _settings.theme);
    pill.addEventListener('click', () => applyTheme(pill.dataset.val));
  });
}

function openSettings() {
  show('settings-overlay');
  document.querySelector('.settings-drawer')?.classList.add('open');
}
function closeSettings() {
  hide('settings-overlay');
  document.querySelector('.settings-drawer')?.classList.remove('open');
}

/* ─── Keyboard shortcuts ─────────────────────────────────────── */
function bindKeyboard() {
  document.addEventListener('keydown', e => {
    const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
    if (e.key === 'Escape') { closeSettings(); hide('rag-modal'); hide('export-modal'); hide('share-modal'); hide('shortcuts-modal'); closeAuth(); if (_responding) stopGeneration(); return; }
    if (ctrlKey(e) && e.key==='k') { e.preventDefault(); show('rag-modal','flex'); return; }
    if (ctrlKey(e) && e.key==='n') { e.preventDefault(); startNewChat(); return; }
    if (ctrlKey(e) && e.key==='e') { e.preventDefault(); show('export-modal','flex'); return; }
    if (ctrlKey(e) && (e.key==='/' || e.key==='\\')) { e.preventDefault(); toggleSidebar(); return; }
    if (!inInput) {
      if (e.key==='s') { openSettings(); return; }
      if (e.key==='v') { toggleVoice(); return; }
      if (e.key==='t') { toggleTheme(); return; }
      if (e.key==='?') { show('shortcuts-modal','flex'); return; }
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   MODEL DROPDOWN
═══════════════════════════════════════════════════════════════ */
function buildModelDropdown() {
  const dd = $('model-dropdown');
  if (!dd) return;
  dd.innerHTML = '';
  MODELS.forEach(m => {
    const item = mkEl('div', `md-item${m.id === _settings.model ? ' active' : ''}`);
    item.innerHTML = `
      <div class="mdi-left">
        <span class="mdi-name">${esc(m.name)}</span>
        <span class="mdi-desc">${esc(m.desc)}</span>
      </div>
      <span class="mdi-tag" style="background:${m.color}22;color:${m.color};border:1px solid ${m.color}44">${esc(m.tag)}</span>`;
    item.addEventListener('click', () => { selectModel(m.id); hide('model-dropdown'); });
    dd.appendChild(item);
  });
  updateModelLabel();
}

function selectModel(id) {
  _settings.model = id;
  saveSettings();
  buildModelDropdown();
  updateModelLabel();
  updateUsageBar();
}

function updateModelLabel() {
  const m = MODELS.find(x => x.id === _settings.model) || MODELS[0];
  setText('model-name-label', m.name);
  const tag = $('model-tag');
  if (tag) { tag.textContent = m.tag; tag.style.color = m.color; tag.style.background = m.color + '22'; }
  setText('ub-model', m.name);
}

function toggleModelDropdown() {
  const dd = $('model-dropdown');
  if (!dd) return;
  if (dd.style.display === 'none' || !dd.style.display) show('model-dropdown','block');
  else hide('model-dropdown');
}

/* ═══════════════════════════════════════════════════════════════
   SUPABASE AUTH
═══════════════════════════════════════════════════════════════ */
function initSupabase() {
  try {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    _sb.auth.onAuthStateChange((_ev, session) => {
      _session = session;
      session ? onSignedIn(session.user) : onSignedOut();
    });
    _sb.auth.getSession().then(({ data }) => {
      if (data?.session) { _session = data.session; onSignedIn(data.session.user); }
      else { loadChats(); buildSidebar(); }
    });
  } catch(e) { console.warn('[Cyanix] Supabase unavailable:', e); loadChats(); buildSidebar(); }
}

function onSignedIn(user) {
  closeAuth();
  const label = user.email || user.user_metadata?.full_name || 'Explorer';
  const chip = $('ct-user-chip');
  if (chip) { chip.textContent = label; chip.style.display = 'block'; }
  const sbLabel = $('sb-user-label');
  if (sbLabel) { sbLabel.textContent = label; sbLabel.style.display = 'block'; }
  hide('map-signin-btn'); hide('ct-signin-btn'); hide('sb-signin-btn');
  const input = $('chat-input');
  if (input) input.placeholder = 'Ask Cyanix AI anything…';
  loadChats(); buildSidebar();
}
function onSignedOut() {
  hide('ct-user-chip'); show('map-signin-btn'); show('ct-signin-btn'); show('sb-signin-btn');
  const input = $('chat-input');
  if (input) input.placeholder = 'Sign in to start chatting…';
  loadChats(); buildSidebar();
}
function openAuth()  { show('auth-overlay','flex'); }
function closeAuth() { hide('auth-overlay'); }

async function oauthLogin(provider) {
  if (!_sb) { toast('Auth unavailable'); return; }
  document.querySelectorAll(`.oauth-btn[data-provider="${provider}"]`).forEach(b => { b.disabled = true; });
  try { await _sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_URL } }); }
  catch(e) { toast('Login failed: ' + e.message); document.querySelectorAll(`.oauth-btn[data-provider="${provider}"]`).forEach(b => { b.disabled = false; }); }
}

async function emailSignIn() {
  if (!_sb) { showErr('si-err','Auth unavailable.'); return; }
  const email = $('si-email')?.value.trim(), pass = $('si-pass')?.value;
  hide('si-err');
  if (!email||!pass) { showErr('si-err','Fill in all fields.'); return; }
  const btn = $('si-btn');
  if (btn) { btn.disabled=true; btn.textContent='Signing in…'; }
  const { error } = await _sb.auth.signInWithPassword({ email, password:pass });
  if (btn) { btn.disabled=false; btn.textContent='Sign In'; }
  if (error) showErr('si-err', error.message);
}

async function emailSignUp() {
  if (!_sb) { showErr('su-err','Auth unavailable.'); return; }
  const email=$('su-email')?.value.trim(), pass=$('su-pass')?.value, conf=$('su-conf')?.value;
  hide('su-err'); hide('su-ok');
  if(!email||!pass||!conf) { showErr('su-err','Fill in all fields.'); return; }
  if(pass!==conf) { showErr('su-err','Passwords do not match.'); return; }
  if(pass.length<6) { showErr('su-err','Password must be 6+ characters.'); return; }
  const btn=$('su-btn');
  if(btn) { btn.disabled=true; btn.textContent='Creating…'; }
  const { error } = await _sb.auth.signUp({ email, password:pass });
  if(btn) { btn.disabled=false; btn.textContent='Create Account'; }
  if(error) { showErr('su-err',error.message); }
  else { const ok=$('su-ok'); if(ok) { ok.textContent='✓ Check your email to confirm.'; ok.style.display='block'; } }
}

/* ═══════════════════════════════════════════════════════════════
   CHAT MANAGEMENT
═══════════════════════════════════════════════════════════════ */
function startNewChat() {
  // Save current chat if it has messages
  if (_chatHistory.length > 0 && _currentChatId) saveChatToStore();
  _currentChatId = 'cx_' + Date.now();
  _chatHistory   = [];
  _totalTokens   = 0;
  _lastResponseText = '';
  const wrap = $('messages');
  if (wrap) wrap.innerHTML = '';
  hide('continue-row'); hideContextBar();
  updateUsageBar();
  renderWelcome();
  if (window.innerWidth <= 900) setSidebarState(false);
  setTimeout(() => $('chat-input')?.focus(), 80);
}

function saveChatToStore() {
  if (!_currentChatId || _chatHistory.length === 0) return;
  const existing = _chats.find(c => c.id === _currentChatId);
  const title = existing?.title || autoTitle();
  if (existing) {
    existing.messages = [..._chatHistory];
    existing.ts = Date.now();
    existing.title = title;
  } else {
    _chats.unshift({ id:_currentChatId, title, messages:[..._chatHistory], pinned:false, ts:Date.now(), shareToken:null });
  }
  saveChats();
  buildSidebar();
}

function autoTitle() {
  const first = _chatHistory.find(m => m.role === 'user');
  if (!first) return 'New Chat';
  return first.content.trim().split(/\s+/).slice(0,5).join(' ').slice(0,42) + (first.content.length > 42 ? '…' : '');
}

function loadChat(id) {
  if (_chatHistory.length > 0 && _currentChatId) saveChatToStore();
  const chat = _chats.find(c => c.id === id);
  if (!chat) return;
  _currentChatId = id;
  _chatHistory   = [...chat.messages];
  _totalTokens   = 0;
  _lastResponseText = '';
  const wrap = $('messages');
  if (wrap) wrap.innerHTML = '';
  hide('continue-row');
  _chatHistory.forEach((m, i) => {
    if (m.role === 'user') appendMsg('user', m.content);
    else if (m.role === 'assistant') appendMsg('ai', m.content);
  });
  updateUsageBar();
  buildSidebar();
  if (window.innerWidth <= 900) setSidebarState(false);
  setTimeout(scrollBottom, 50);
}

function deleteChat(id) {
  _chats = _chats.filter(c => c.id !== id);
  saveChats();
  if (_currentChatId === id) startNewChat();
  else buildSidebar();
}

function pinChat(id) {
  const c = _chats.find(x => x.id === id);
  if (c) { c.pinned = !c.pinned; saveChats(); buildSidebar(); }
}

function renameChat(id) {
  const c = _chats.find(x => x.id === id);
  if (!c) return;
  const t = prompt('Rename chat:', c.title);
  if (t !== null && t.trim()) { c.title = t.trim(); saveChats(); buildSidebar(); }
}

/* ─── Sidebar rendering ──────────────────────────────────────── */
function buildSidebar() {
  loadChats();
  const list = $('chat-list');
  if (!list) return;
  list.innerHTML = '';
  const query   = $('history-search')?.value?.toLowerCase() || '';
  const pinned  = _chats.filter(c => c.pinned && (!query || c.title.toLowerCase().includes(query)));
  const unpinned= _chats.filter(c => !c.pinned && (!query || c.title.toLowerCase().includes(query)));

  if (pinned.length) {
    const lbl = mkEl('div','sb-group-label'); lbl.textContent = 'Pinned'; list.appendChild(lbl);
    pinned.forEach(c => list.appendChild(buildChatItem(c)));
  }
  if (unpinned.length) {
    if (pinned.length) { const lbl=mkEl('div','sb-group-label'); lbl.textContent='Recent'; list.appendChild(lbl); }
    unpinned.forEach(c => list.appendChild(buildChatItem(c)));
  }
  if (_chats.length === 0) {
    const empty = mkEl('div','sb-empty');
    empty.style.cssText = 'padding:24px 16px;text-align:center;font-size:.74rem;color:var(--t3);opacity:.5;';
    empty.textContent = 'No chats yet. Start a new one!';
    list.appendChild(empty);
  }
}

function buildChatItem(chat) {
  const item = mkEl('div', `chat-item${chat.id === _currentChatId ? ' active' : ''}`);
  item.dataset.id = chat.id;

  if (chat.pinned) {
    const pin = mkEl('span','ci-pin'); pin.textContent = '◈'; item.appendChild(pin);
  }
  const title = mkEl('span','ci-title'); title.textContent = chat.title; item.appendChild(title);
  const menu  = mkEl('button','ci-menu'); menu.textContent = '⋯'; item.appendChild(menu);

  item.addEventListener('click', e => { if(e.target !== menu) { loadChat(chat.id); } });
  menu.addEventListener('click', e => { e.stopPropagation(); showCtxMenu(e, chat.id); });
  return item;
}

function filterChatList(query) { buildSidebar(); }

let _ctxMenu = null;
function showCtxMenu(e, chatId) {
  if (_ctxMenu) _ctxMenu.remove();
  const menu = mkEl('div','ctx-menu');
  const opts = [
    { label:'📌 Pin / Unpin', fn: () => pinChat(chatId) },
    { label:'✏️ Rename',       fn: () => renameChat(chatId) },
    { label:'🔗 Share',        fn: () => { _currentChatId = chatId; openShareModal(); } },
    { label:'🗑 Delete',       fn: () => { if(confirm('Delete this chat?')) deleteChat(chatId); }, danger:true },
  ];
  opts.forEach(opt => {
    const item = mkEl('button', `ctx-item${opt.danger ? ' danger' : ''}`);
    item.textContent = opt.label;
    item.addEventListener('click', () => { menu.remove(); _ctxMenu=null; opt.fn(); });
    menu.appendChild(item);
  });

  const rect = e.target.getBoundingClientRect();
  const x = Math.min(rect.right + 4, window.innerWidth - 180);
  const y = Math.min(rect.bottom + 4, window.innerHeight - 200);
  menu.style.cssText = `left:${x}px;top:${y}px;`;
  document.body.appendChild(menu);
  _ctxMenu = menu;
  setTimeout(() => document.addEventListener('click', () => { menu.remove(); _ctxMenu=null; }, { once:true }), 0);
}

/* ═══════════════════════════════════════════════════════════════
   CHAT — SEND & STREAMING
═══════════════════════════════════════════════════════════════ */
function handleSend() {
  if (_responding) { stopGeneration(); return; }
  const input = $('chat-input');
  if (!input || !input.value.trim()) return;
  sendMessage(input.value.trim());
}

async function sendMessage(text, isRetry = false) {
  if (_responding) return;

  // ── Auth gate: require sign-in to chat ──────────────────────
  if (!_session) {
    openAuth();
    toast('Please sign in to chat with Cyanix AI.');
    return;
  }

  _responding = true;
  hide('continue-row');

  const input   = $('chat-input');
  const sendBtn = $('send-btn');
  if (!isRetry && input) { input.value = ''; resizeTA(input); }
  if (sendBtn) { sendBtn.classList.add('stop'); sendBtn.title = 'Stop (Esc)'; }

  if (!isRetry) appendMsg('user', text);
  clearWelcome();
  scrollBottom();

  try {
    // Build context window
    if (!isRetry) _chatHistory.push({ role:'user', content:text });
    const ctxHistory = buildContextHistory();

    // Web search check
    let ragNote = '';
    if (wantsSearch(text)) {
      setAiStatus(true, 'Searching the web…');
      setSearchStatus(true);
      const csData = await callSearch(text);
      setSearchStatus(false);
      if (csData?.nodes?.length) ragNote = `\n\n[Web search results for "${text}"]:\n` + csData.nodes.map(n=>`• ${n.label}: ${n.description||n.url}`).join('\n');
    }

    setAiStatus(true, getThinkingLabel());

    const systemPrompt = buildSystemPrompt(ragNote);
    const messages = [{ role:'system', content:systemPrompt }, ...ctxHistory];
    if (ragNote) messages[messages.length-1].content += ragNote;

    let fullText = '', thinkText = '';
    const messageEl = appendMsg('ai', '', null, true);

    if (_settings.streaming) {
      ({ fullText, thinkText } = await streamResponse(messages, messageEl));
    } else {
      const res = await callChatStatic(messages);
      fullText = res.content || res.text || '';
      thinkText = res.thinking || '';
    }

    _lastResponseText = fullText;
    setAiStatus(false);
    finalizeMessage(messageEl, fullText, thinkText);

    _chatHistory.push({ role:'assistant', content:fullText });
    if (_chatHistory.length > _settings.ctxSize * 2) _chatHistory = _chatHistory.slice(-(_settings.ctxSize * 2));

    estimateTokens(text, fullText);
    updateUsageBar();

    // Auto-generate title after first exchange
    if (_chatHistory.length === 2 && _currentChatId) {
      const chat = _chats.find(c => c.id === _currentChatId);
      if (!chat || chat.title === 'New Chat') setTimeout(() => generateAutoTitle(), 0);
    }
    saveChatToStore();

    // Show continue button if response looks truncated
    if (fullText.length > 800 && !fullText.match(/[.!?。]\s*$/)) show('continue-row');

  } catch(err) {
    setAiStatus(false); setSearchStatus(false);
    if (err.name !== 'AbortError') {
      const errMsg = handleApiError(err);
      appendMsg('ai', errMsg);
    }
    scrollBottom();
  } finally {
    _responding = false; _streaming = false; _abortCtrl = null;
    if (sendBtn) { sendBtn.classList.remove('stop'); sendBtn.title='Send (Enter)'; }
  }
}

function stopGeneration() {
  if (_abortCtrl) { _abortCtrl.abort(); }
  _responding = false; _streaming = false;
  setAiStatus(false);
  const sendBtn = $('send-btn');
  if (sendBtn) { sendBtn.classList.remove('stop'); sendBtn.title='Send (Enter)'; }
}

async function streamResponse(messages, msgEl) {
  _abortCtrl = new AbortController();
  _streaming  = true;
  let fullText = '', thinkText = '', inThink = false;
  const bubble = msgEl.querySelector('.msg-bubble');

  try {
    const res = await fetch(CHAT_URL, {
      method: 'POST',
      headers: EDGE_HEADERS,
      signal: _abortCtrl.signal,
      body: JSON.stringify({ messages, model: _settings.model, stream: true }),
    });

    if (!res.ok) { const t = await res.text(); throw new Error(`API ${res.status}: ${t.slice(0,120)}`); }
    if (!res.body) { const j = await res.json(); return { fullText: j.content||j.text||'', thinkText:'' }; }

    const reader = res.body.getReader();
    const dec    = new TextDecoder();
    setAiStatus(false);
    if (bubble) bubble.innerHTML = '<span class="stream-cursor">▋</span>';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = dec.decode(value, { stream:true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') break;
        try {
          const parsed = JSON.parse(data);
          const delta  = parsed.choices?.[0]?.delta?.content || '';
          if (!delta) continue;
          // Handle <think> blocks (DeepSeek R1 style)
          if (delta.includes('<think>')) { inThink = true; continue; }
          if (delta.includes('</think>')) { inThink = false; continue; }
          if (inThink) { thinkText += delta; continue; }
          fullText += delta;
          if (bubble) {
            bubble.innerHTML = mdToHTML(fullText) + '<span class="stream-cursor">▋</span>';
            scrollBottom();
          }
        } catch {}
      }
    }
  } catch(e) {
    if (e.name !== 'AbortError') throw e;
  }

  return { fullText, thinkText };
}

async function callChatStatic(messages) {
  const res = await fetch(CHAT_URL, {
    method:'POST', headers:EDGE_HEADERS,
    body:JSON.stringify({ messages, model:_settings.model, stream:false }),
  });
  if (!res.ok) { const t=await res.text(); throw new Error(`API ${res.status}: ${t.slice(0,120)}`); }
  const j = await res.json();
  return { content: j.content||j.text||j.reply||'', thinking:j.thinking||'' };
}

async function callSearch(query) {
  try {
    const res = await fetch(SEARCH_URL, { method:'POST', headers:EDGE_HEADERS, body:JSON.stringify({ query }) });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function continueGenerating() {
  hide('continue-row');
  const contPrompt = 'Please continue exactly where you left off.';
  await sendMessage(contPrompt);
}

async function generateAutoTitle() {
  if (!_currentChatId || _chatHistory.length < 2) return;
  const first = _chatHistory.find(m => m.role==='user');
  if (!first) return;
  try {
    const res = await callChatStatic([
      { role:'system', content:'Generate a short 3-5 word title for a conversation. Reply ONLY with the title, no punctuation, no quotes.' },
      { role:'user',   content:`First message: "${first.content.slice(0,120)}"` },
    ]);
    const title = (res.content || '').trim().slice(0, 48) || autoTitle();
    const chat = _chats.find(c => c.id === _currentChatId);
    if (chat) { chat.title = title; saveChats(); buildSidebar(); }
  } catch {}
}

/* ─── Context & System Prompt ────────────────────────────────── */
function buildContextHistory() {
  const max = _settings.ctxSize;
  return _chatHistory.slice(-max);
}

function buildSystemPrompt(ragNote='') {
  let parts = ['You are Cyanix AI, a smart and helpful AI assistant.'];

  const toneMap = { casual:'Reply in a friendly, casual tone.', professional:'Use a professional, formal tone.', balanced:'' };
  const lenMap  = { concise:'Be concise and to the point.', detailed:'Give thorough, detailed responses.', balanced:'' };
  const fmtMap  = { plain:'Use plain text only, no markdown.', markdown:'Use markdown formatting.' };

  if (toneMap[_settings.tone]) parts.push(toneMap[_settings.tone]);
  if (lenMap[_settings.length]) parts.push(lenMap[_settings.length]);
  if (fmtMap[_settings.format]) parts.push(fmtMap[_settings.format]);
  if (_settings.systemPrompt.trim()) parts.push(_settings.systemPrompt.trim());
  if (_ragContext) parts.push(`\n[User context document]:\n${_ragContext.slice(0, 4000)}`);

  return parts.join(' ');
}

function getThinkingLabel() {
  const m = MODELS.find(x => x.id === _settings.model);
  if (m?.tag === 'THINK') return 'Reasoning…';
  if (m?.tag === 'REASON') return 'Analyzing…';
  return 'Thinking…';
}

function wantsSearch(text) {
  const kw = ['find','search','show me','what are','list','best','top','where','latest','who is','how to','compare',' vs ','tool','resource','website','link'];
  const t  = text.toLowerCase();
  return kw.some(k => t.includes(k));
}

function handleApiError(err) {
  const msg = err.message || '';
  if (msg.includes('429') || msg.includes('rate limit')) return '⚠ Rate limit reached. Please wait a moment and try again — Groq limits reset quickly.';
  if (msg.includes('401') || msg.includes('403')) return '⚠ Authentication error. Please check your API configuration.';
  if (msg.includes('503') || msg.includes('504')) return '⚠ The AI service is temporarily unavailable. Please try again in a few seconds.';
  return `⚠ ${msg || 'Something went wrong. Please try again.'}`;
}

/* ─── Token estimation ───────────────────────────────────────── */
function estimateTokens(input, output) {
  const tokens = Math.round((input.length + output.length) / 4);
  _totalTokens += tokens;
}
function updateUsageBar() {
  setText('ub-tokens', `~${_totalTokens.toLocaleString()} tokens`);
  setText('ub-msgs', `${_chatHistory.length} messages`);
  const m = MODELS.find(x => x.id === _settings.model) || MODELS[0];
  setText('ub-model', m.name);
}

/* ═══════════════════════════════════════════════════════════════
   MESSAGE RENDERING
═══════════════════════════════════════════════════════════════ */
function appendMsg(role, text, extra, streaming=false) {
  const wrap = $('messages');
  if (!wrap) return null;

  const row    = mkEl('div', `msg msg-${role}`);
  const avatar = mkEl('div', `msg-avatar ${role}`);
  avatar.innerHTML = role==='user' ? 'U' : '<span class="av-cx">CX</span>';

  const body   = mkEl('div', 'msg-body');
  const from   = mkEl('div', 'msg-from');
  from.textContent = role==='user' ? 'You' : 'Cyanix AI';

  const bubble = mkEl('div', 'msg-bubble');
  bubble.innerHTML = streaming ? '<span class="stream-cursor">▋</span>' : (text ? mdToHTML(text) : '');

  body.appendChild(from);
  if (role==='ai' && !streaming) {
    // Check for thinking content (DeepSeek)
    const { thinking, reply } = extractThinking(text);
    if (thinking) {
      bubble.innerHTML = '';
      bubble.appendChild(buildThinkingBlock(thinking, false));
      const replyDiv = mkEl('div'); replyDiv.innerHTML = mdToHTML(reply);
      bubble.appendChild(replyDiv);
    } else {
      bubble.innerHTML = mdToHTML(text);
    }
  }

  body.appendChild(bubble);

  // Message actions
  const actions = buildMsgActions(row, role, text);
  body.appendChild(actions);

  if (role==='user') { row.appendChild(body); row.appendChild(avatar); }
  else               { row.appendChild(avatar); row.appendChild(body); }

  wrap.appendChild(row);
  scrollBottom();
  return row;
}

function finalizeMessage(msgEl, text, thinking) {
  if (!msgEl) return;
  const bubble = msgEl.querySelector('.msg-bubble');
  if (!bubble) return;

  bubble.innerHTML = '';
  if (thinking) bubble.appendChild(buildThinkingBlock(thinking, false));

  const { thinking: embeddedThink, reply } = extractThinking(text);
  if (embeddedThink) bubble.appendChild(buildThinkingBlock(embeddedThink, false));

  const replyDiv = mkEl('div');
  replyDiv.innerHTML = mdToHTML(embeddedThink ? reply : text);
  enhanceCodeBlocks(replyDiv);
  bubble.appendChild(replyDiv);

  // Rebuild actions with final text
  const oldActions = msgEl.querySelector('.msg-actions');
  if (oldActions) oldActions.remove();
  const actions = buildMsgActions(msgEl, 'ai', text);
  msgEl.querySelector('.msg-body')?.appendChild(actions);

  scrollBottom();
}

function extractThinking(text='') {
  const m = text.match(/^<think>([\s\S]*?)<\/think>([\s\S]*)$/);
  if (!m) return { thinking:'', reply:text };
  return { thinking:m[1].trim(), reply:m[2].trim() };
}

function buildThinkingBlock(text, spinning=true) {
  const block = mkEl('div','thinking-block');
  const toggle = mkEl('button','thinking-toggle');

  const chevron  = mkEl('span','thinking-chevron'); chevron.textContent = '▶';
  const spinner  = mkEl('span','thinking-spinner'); spinner.style.display = spinning ? 'inline-block' : 'none';
  const label    = mkEl('span'); label.textContent = spinning ? 'Reasoning…' : 'View reasoning';

  toggle.appendChild(chevron); toggle.appendChild(spinner); toggle.appendChild(label);

  const content = mkEl('div','thinking-content');
  content.textContent = text;

  toggle.addEventListener('click', () => {
    const expanded = content.classList.toggle('expanded');
    chevron.classList.toggle('open', expanded);
    label.textContent = expanded ? 'Hide reasoning' : 'View reasoning';
  });

  block.appendChild(toggle); block.appendChild(content);
  return block;
}

function buildMsgActions(msgEl, role, text) {
  const actions = mkEl('div','msg-actions');

  if (role === 'ai') {
    const copy = mkEl('button','ma-btn'); copy.innerHTML = '⎘ Copy';
    copy.addEventListener('click', () => { navigator.clipboard?.writeText(text||''); copy.textContent = '✓ Copied'; setTimeout(()=>{ copy.innerHTML='⎘ Copy'; },1500); });

    const up = mkEl('button','ma-btn thumbs-up'); up.innerHTML = '↑';
    up.addEventListener('click', () => { up.classList.toggle('voted'); down.classList.remove('voted'); });

    const down = mkEl('button','ma-btn thumbs-down'); down.innerHTML = '↓';
    down.addEventListener('click', () => { down.classList.toggle('voted'); up.classList.remove('voted'); });

    const regen = mkEl('button','ma-btn'); regen.innerHTML = '↺ Retry';
    regen.addEventListener('click', () => regenFromMsg(msgEl));

    actions.appendChild(copy); actions.appendChild(up); actions.appendChild(down); actions.appendChild(regen);
  } else {
    const edit = mkEl('button','ma-btn'); edit.innerHTML = '✎ Edit';
    edit.addEventListener('click', () => enterEditMode(msgEl, text));
    actions.appendChild(edit);
  }
  return actions;
}

/* ─── Edit & Regen ───────────────────────────────────────────── */
function enterEditMode(msgEl, originalText) {
  const bubble = msgEl.querySelector('.msg-bubble');
  if (!bubble) return;
  const ta = mkEl('textarea','msg-edit-area');
  ta.value = originalText;
  ta.rows  = Math.max(3, originalText.split('\n').length + 1);

  const btns   = mkEl('div','msg-edit-btns');
  const cancel = mkEl('button','ghost-btn'); cancel.textContent = 'Cancel';
  const save   = mkEl('button','cta-primary sm'); save.textContent = 'Save & Regenerate';

  cancel.addEventListener('click', () => { bubble.innerHTML = mdToHTML(originalText); btns.remove(); });
  save.addEventListener('click', async () => {
    const newText = ta.value.trim();
    if (!newText) return;
    bubble.innerHTML = mdToHTML(newText);
    btns.remove();
    // Remove all messages after this one
    const allMsgs = Array.from($('messages')?.children || []);
    const idx     = allMsgs.indexOf(msgEl.closest?.('.msg') || msgEl);
    if (idx >= 0) allMsgs.slice(idx + 1).forEach(el => el.remove());
    // Truncate history
    const userIdx = _chatHistory.findLastIndex(m => m.role==='user' && m.content === originalText);
    if (userIdx >= 0) _chatHistory = _chatHistory.slice(0, userIdx);
    await sendMessage(newText);
  });

  btns.appendChild(cancel); btns.appendChild(save);
  bubble.innerHTML = ''; bubble.appendChild(ta); bubble.appendChild(btns);
  ta.focus(); ta.select();
}

async function regenFromMsg(aiMsgEl) {
  // Find last user message
  const lastUser = _chatHistory.findLast(m => m.role==='user');
  if (!lastUser) return;
  // Remove this AI message from DOM and history
  aiMsgEl.remove();
  const lastAiIdx = _chatHistory.findLastIndex(m => m.role==='assistant');
  if (lastAiIdx >= 0) _chatHistory = _chatHistory.slice(0, lastAiIdx);
  await sendMessage(lastUser.content, true);
}

/* ─── Code blocks with copy ──────────────────────────────────── */
function enhanceCodeBlocks(container) {
  container.querySelectorAll('pre').forEach(pre => {
    if (pre.parentElement?.classList.contains('code-block')) return;
    const lang = pre.querySelector('code')?.className?.replace('language-','') || 'code';
    const wrapper = mkEl('div','code-block');
    const header  = mkEl('div','code-block-header');
    const langLabel = mkEl('span'); langLabel.textContent = lang;
    const copyBtn   = mkEl('button','code-copy-btn'); copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(pre.textContent || '');
      copyBtn.textContent = '✓ Copied'; setTimeout(()=>{ copyBtn.textContent='Copy'; },1500);
    });
    header.appendChild(langLabel); header.appendChild(copyBtn);
    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(header); wrapper.appendChild(pre);
  });
}

/* ─── Welcome & Templates ────────────────────────────────────── */
function clearWelcome() {
  const wrap = $('messages');
  if (!wrap) return;
  wrap.querySelectorAll('.welcome-hero, .templates-grid').forEach(el => el.remove());
}

function renderWelcome() {
  const wrap = $('messages');
  if (!wrap) return;

  // Hero greeting
  const hero = mkEl('div','welcome-hero');
  hero.innerHTML = `
    <div class="welcome-badge"><span class="av-cx">CX</span></div>
    <h2 class="welcome-title">How can I help you today?</h2>
    <p class="welcome-sub">Ask me anything — I can reason, write code, search the web, and more.<br/>Powered by Groq for lightning-fast responses.</p>
    <div class="chips">
      <button class="chip" data-q="What are the best AI tools right now?">🤖 AI tools</button>
      <button class="chip" data-q="Show me top web development frameworks">🌐 Web dev</button>
      <button class="chip" data-q="Find the latest startup tools for 2025">🚀 Startups</button>
      <button class="chip" data-q="What are the best UI design resources?">🎨 Design</button>
    </div>`;
  wrap.appendChild(hero);

  // Templates grid
  const grid = mkEl('div','templates-grid');
  TEMPLATES.forEach(t => {
    const card = mkEl('div','template-card');
    card.innerHTML = `<div class="tc-icon">${t.icon}</div><div class="tc-title">${t.title}</div><div class="tc-desc">${t.desc}</div>`;
    card.addEventListener('click', () => {
      goToChat();
      const input = $('chat-input');
      if (input) { input.value = t.prompt; resizeTA(input); input.focus(); }
    });
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  bindChips();
}

function bindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!_session) { openAuth(); toast('Please sign in to chat with Cyanix AI.'); return; }
      goToChat();
      setTimeout(() => sendMessage(chip.dataset.q), 80);
    });
  });
}

/* ─── Markdown renderer ──────────────────────────────────────── */
function mdToHTML(text='') {
  if (!text) return '';

  // Extract code blocks BEFORE any escaping to avoid double-encoding
  const codeBlocks = [];
  let html = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.trim().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const placeholder = `\x00CODE${codeBlocks.length}\x00`;
    codeBlocks.push(`<div class="code-block"><div class="code-block-header"><span>${esc(lang||'code')}</span><button class="code-copy-btn" onclick="navigator.clipboard?.writeText(this.closest('.code-block').querySelector('pre').textContent);this.textContent='✓ Copied';setTimeout(()=>this.textContent='Copy',1500)">Copy</button></div><pre><code>${escaped}</code></pre></div>`);
    return placeholder;
  });

  // Now escape remaining HTML in normal text
  html = html
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/`([^`]+)`/g, (_, code) => `<code>${code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code>`)
    .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/__(.+?)__/g,    '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,    '<em>$1</em>')
    .replace(/_(.+?)_/g,      '<em>$1</em>')
    .replace(/~~(.+?)~~/g,    '<del>$1</del>')
    .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
    .replace(/^\s*[-*] (.+)$/gm, '<liU>$1</liU>')
    .replace(/^\s*\d+\. (.+)$/gm,'<liO>$1</liO>')
    .replace(/(<liU>[\s\S]*?<\/liU>\n?)+/g, m => `<ul>${m.replace(/liU/g,'li')}</ul>`)
    .replace(/(<liO>[\s\S]*?<\/liO>\n?)+/g, m => `<ol>${m.replace(/liO/g,'li')}</ol>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br/>');

  if (!html.startsWith('<')) html = `<p>${html}</p>`;

  // Restore code blocks
  codeBlocks.forEach((block, i) => { html = html.replace(`\x00CODE${i}\x00`, block); });

  return html;
}

/* ═══════════════════════════════════════════════════════════════
   RAG CONTEXT
═══════════════════════════════════════════════════════════════ */
function saveRagContext() {
  const ta = $('rag-textarea');
  if (!ta || !ta.value.trim()) return;
  _ragContext = ta.value.trim();
  hide('rag-modal');
  showContextBar(`Context loaded (${_ragContext.length} chars)`);
  toast('Context loaded — Cyanix AI will reference this in replies.');
}

function clearRagContext() { _ragContext = ''; hideContextBar(); toast('Context cleared.'); }

function showContextBar(label) {
  setText('context-label', label);
  const bar = $('context-bar');
  if (bar) { bar.classList.remove('hidden'); bar.style.display='flex'; }
}
function hideContextBar() {
  const bar = $('context-bar');
  if (bar) { bar.classList.add('hidden'); bar.style.display='none'; }
}

/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
function exportChat(fmt) {
  hide('export-modal');
  if (_chatHistory.length === 0) { toast('No messages to export.'); return; }
  const chat = _chats.find(c=>c.id===_currentChatId);
  const title = chat?.title || 'cyanix-chat';
  const ts    = new Date().toISOString().split('T')[0];

  let content='', filename='', mime='';
  if (fmt==='md') {
    content  = `# ${title}\n_Exported ${ts} from Cyanix AI_\n\n`;
    content += _chatHistory.map(m=>`**${m.role==='user'?'You':'Cyanix AI'}**\n\n${m.content}`).join('\n\n---\n\n');
    filename = `${title.replace(/\s+/g,'-')}-${ts}.md`; mime='text/markdown';
  } else if (fmt==='txt') {
    content  = `${title}\nExported ${ts} from Cyanix AI\n${'─'.repeat(40)}\n\n`;
    content += _chatHistory.map(m=>`[${m.role==='user'?'You':'Cyanix AI'}]\n${m.content}`).join('\n\n');
    filename = `${title.replace(/\s+/g,'-')}-${ts}.txt`; mime='text/plain';
  } else {
    content  = JSON.stringify({ title, exportedAt:ts, model:_settings.model, messages:_chatHistory }, null, 2);
    filename = `${title.replace(/\s+/g,'-')}-${ts}.json`; mime='application/json';
  }

  const a = document.createElement('a');
  a.href     = URL.createObjectURL(new Blob([content],{type:mime}));
  a.download = filename; a.click();
  URL.revokeObjectURL(a.href);
  toast(`Chat exported as ${filename}`);
}

/* ═══════════════════════════════════════════════════════════════
   SHARE
═══════════════════════════════════════════════════════════════ */
function openShareModal() {
  const chat = _chats.find(c=>c.id===_currentChatId);
  if (!chat || chat.messages.length===0) { toast('No messages to share.'); return; }
  if (!chat.shareToken) chat.shareToken = 'cx_share_'+Math.random().toString(36).slice(2,12);
  saveChats();
  const link = `${REDIRECT_URL}?share=${chat.shareToken}`;
  const input = $('share-link-input'); if(input) input.value = link;
  setText('share-hint','Anyone with this link can view (read-only). Requires Supabase RLS setup.');
  show('share-modal','flex');
}
function copyShareLink() {
  const input = $('share-link-input'); if(!input) return;
  navigator.clipboard?.writeText(input.value);
  const btn = $('share-copy-btn'); if(btn) { btn.textContent='✓ Copied!'; setTimeout(()=>{btn.textContent='Copy';},1800); }
}

/* ═══════════════════════════════════════════════════════════════
   VOICE INPUT
═══════════════════════════════════════════════════════════════ */
function toggleVoice() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    toast('Voice input not supported in this browser.'); return;
  }
  if (_isVoiceRecording) { stopVoice(); return; }
  startVoice();
}
function startVoice() {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  _voiceRec = new Rec();
  _voiceRec.continuous = false;
  _voiceRec.interimResults = true;
  _voiceRec.lang = 'en-US';
  const voiceBtn = $('voice-btn'), inlineBtn = $('voice-inline-btn');
  _isVoiceRecording = true;
  [voiceBtn, inlineBtn].forEach(b => b?.classList.add('recording'));
  toast('🎤 Listening…');
  _voiceRec.onresult = e => {
    const transcript = Array.from(e.results).map(r=>r[0].transcript).join('');
    const input = $('chat-input');
    if (input) { input.value = transcript; resizeTA(input); }
  };
  _voiceRec.onend = () => {
    _isVoiceRecording = false;
    [voiceBtn, inlineBtn].forEach(b => b?.classList.remove('recording'));
    const input = $('chat-input');
    if (input?.value?.trim()) handleSend();
  };
  _voiceRec.onerror = e => { toast('Voice error: '+e.error); stopVoice(); };
  _voiceRec.start();
}
function stopVoice() {
  _voiceRec?.stop(); _isVoiceRecording = false;
  [$('voice-btn'),$('voice-inline-btn')].forEach(b=>b?.classList.remove('recording'));
}

/* ═══════════════════════════════════════════════════════════════
   CLEAR ALL
═══════════════════════════════════════════════════════════════ */
function clearAllChats() {
  if (!confirm('Delete all conversations? This cannot be undone.')) return;
  _chats = []; saveChats(); startNewChat(); closeSettings(); toast('All conversations cleared.');
}

/* ═══════════════════════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════════════════════ */
function resizeTA(ta) { ta.style.height='auto'; ta.style.height=Math.min(ta.scrollHeight,140)+'px'; }
function scrollBottom() { const s=$('chat-scroll'); if(s) s.scrollTop=s.scrollHeight; }
function setAiStatus(visible, label) {
  const el=$('ai-status'), lbl=$('ai-status-label'); if(!el) return;
  el.classList.toggle('hidden',!visible);
  if(lbl&&label) lbl.textContent=label;
  if(visible) scrollBottom();
}
function setSearchStatus(searching) {
  const s=$('search-status'); if(!s) return;
  s.innerHTML=`<span class="ss-dot"></span>${searching?'Searching…':'Web Search Ready'}`;
  s.classList.toggle('scanning',searching);
}
function toast(msg, dur=2800) {
  const t=$('toast'); if(!t) return;
  t.textContent=msg; show('toast');
  clearTimeout(t._to);
  t._to=setTimeout(()=>hide('toast'),dur);
}

/* ═══════════════════════════════════════════════════════════════
   COUNTER
═══════════════════════════════════════════════════════════════ */
function animCounter(id, target, ms) {
  const el=$(id); if(!el) return;
  const step=target/(ms/16); let v=0;
  const iv=setInterval(()=>{ v=Math.min(v+step,target); el.textContent=Math.floor(v).toLocaleString(); if(v>=target) clearInterval(iv); },16);
}

/* ═══════════════════════════════════════════════════════════════
   2D HUD GALAXY ENGINE
═══════════════════════════════════════════════════════════════ */
const _hud = { canvas:null, ctx:null, W:0, H:0, cx:0, cy:0, t:0, paused:false, raf:null, nodes:[], packets:[], rings:[], hovered:null, selected:null };

function initHUD() {
  const canvas=$('hud-canvas'); if(!canvas) return;
  _hud.canvas=canvas; _hud.ctx=canvas.getContext('2d');
  resizeHUD(); buildHUDScene(); buildLegend(); bindHUDEvents(); hudLoop();
  window.addEventListener('resize', ()=>{ resizeHUD(); buildHUDScene(); });
}

function resizeHUD() {
  _hud.W=_hud.canvas.width=window.innerWidth;
  _hud.H=_hud.canvas.height=window.innerHeight;
  _hud.cx=_hud.W/2; _hud.cy=_hud.H/2;
}

function buildHUDScene() {
  _hud.nodes=[]; _hud.packets=[]; _hud.rings=[];
  const {W,H,cx,cy}=_hud, baseR=Math.min(W,H)*0.28;
  _hud.nodes.push({x:cx,y:cy,r:16,color:'#00e8ff',label:'CYANIX AI',url:'#',layer:1,clusterId:'center',isCenter:true,pulse:0,alpha:1});
  CLUSTERS.forEach(cl=>{
    const rad=(cl.angle*Math.PI)/180;
    const clX=cx+Math.cos(rad)*baseR, clY=cy+Math.sin(rad)*baseR;
    const clNode={x:clX,y:clY,r:9,color:cl.color,label:cl.label,url:null,layer:1,clusterId:cl.id,isCluster:true,pulse:Math.random()*Math.PI*2,alpha:1};
    _hud.nodes.push(clNode);
    cl.sites.forEach((site,si)=>{
      const spread=cl.sites.length, sAng=rad+((si/spread)-0.5)*Math.PI*0.85;
      const sDist=site.l===1?60:site.l===2?94:124;
      _hud.nodes.push({x:clX+Math.cos(sAng)*sDist,y:clY+Math.sin(sAng)*sDist,r:site.l===1?5:site.l===2?3:2,color:cl.color,label:site.n,url:site.u,layer:site.l,clusterId:cl.id,isSite:true,clusterNode:clNode,pulse:Math.random()*Math.PI*2,alpha:1});
    });
    if(Math.random()>.3) _hud.packets.push({from:_hud.nodes[0],to:clNode,t:Math.random(),speed:.004+Math.random()*.005,color:cl.color});
  });
  [.11,.21,.32,.44].forEach((f,i)=>_hud.rings.push({r:Math.min(W,H)*f,alpha:.07-.012*i}));
}

function hudLoop() {
  if(_hud.paused) return;
  requestAnimationFrame(hudLoop);
  renderHUD(); _hud.t+=.01;
}

function renderHUD() {
  const {ctx,W,H,cx,cy,t,nodes,packets,rings}=_hud;
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createRadialGradient(cx,cy*.8,0,cx,cy,Math.max(W,H)*.75);
  bg.addColorStop(0,'#021428'); bg.addColorStop(1,'#010812');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  drawGrid(ctx,W,H,t);
  rings.forEach(ring=>{ ctx.beginPath(); ctx.setLineDash([5,13]); ctx.arc(cx,cy,ring.r,0,Math.PI*2); ctx.strokeStyle=`rgba(0,232,255,${ring.alpha})`; ctx.lineWidth=.7; ctx.stroke(); ctx.setLineDash([]); });
  drawConstellations(ctx,nodes);
  nodes.filter(n=>n.isCluster).forEach(cl=>drawLink(ctx,nodes[0],cl,cl.color,t,1));
  nodes.filter(n=>n.isSite&&(n.layer||1)<=_activeLayer).forEach(sn=>drawLink(ctx,sn.clusterNode,sn,sn.color,t,sn.layer));
  packets.forEach(p=>{ p.t=(p.t+p.speed)%1; drawPacket(ctx,p.from.x+(p.to.x-p.from.x)*p.t,p.from.y+(p.to.y-p.from.y)*p.t,p.color); });
  nodes.filter(n=>n.isCenter||n.isCluster||(n.layer||1)<=_activeLayer).forEach(n=>drawNode(ctx,n,t));
  if(_hud.selected) drawSelectionRing(ctx,_hud.selected,t);
  if(_hud.hovered&&_hud.hovered!==_hud.selected) drawHoverRing(ctx,_hud.hovered,t);
  drawCenterPulse(ctx,nodes[0],t);
}

function drawGrid(ctx,W,H,t){const step=46,off=(t*.65)%step;ctx.strokeStyle='rgba(0,232,255,0.022)';ctx.lineWidth=.5;for(let x=-off;x<W;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}for(let y=-off;y<H;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}}
function drawConstellations(ctx,nodes){const cls=nodes.filter(n=>n.isCluster);ctx.strokeStyle='rgba(255,255,255,0.022)';ctx.lineWidth=.5;ctx.setLineDash([2,14]);for(let i=0;i<cls.length;i++)for(let j=i+1;j<cls.length;j++)if(Math.hypot(cls[i].x-cls[j].x,cls[i].y-cls[j].y)<280){ctx.beginPath();ctx.moveTo(cls[i].x,cls[i].y);ctx.lineTo(cls[j].x,cls[j].y);ctx.stroke();}ctx.setLineDash([]);}
function drawLink(ctx,from,to,color,t,layer=1){const alpha=layer===1?.38:layer===2?.20:.10;ctx.save();ctx.setLineDash([4,9]);ctx.lineDashOffset=-(t*14);ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.strokeStyle=color+Math.round(alpha*255).toString(16).padStart(2,'0');ctx.lineWidth=layer===1?.9:.55;ctx.stroke();ctx.restore();}
function drawPacket(ctx,x,y,color){const g=ctx.createRadialGradient(x,y,0,x,y,6);g.addColorStop(0,color+'cc');g.addColorStop(1,'transparent');ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();}
function drawNode(ctx,n,t){const pulse=Math.sin(t*1.2+n.pulse)*.12+.88,r=n.r*pulse*(n===_hud.hovered?1.3:1);const gr=r+(n.isCenter?22:n.isCluster?16:10);const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,gr);g.addColorStop(0,n.color+(n.isCenter?'55':n.isCluster?'44':'33'));g.addColorStop(1,'transparent');ctx.beginPath();ctx.arc(n.x,n.y,gr,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);ctx.fillStyle=n.color+(n.isCenter?'dd':n.isCluster?'bb':'88');ctx.strokeStyle=n.color;ctx.lineWidth=n.isCenter?1.5:n.isCluster?1.2:.7;ctx.fill();ctx.stroke();if(n.isCenter||n.isCluster){ctx.font=n.isCenter?'bold 10px Orbitron,monospace':'700 7.5px Space Mono,monospace';ctx.textAlign='center';const ly=n.y+r+14,tw=ctx.measureText(n.label).width;ctx.fillStyle='rgba(1,8,18,.82)';ctx.fillRect(n.x-tw/2-5,ly-10,tw+10,13);ctx.fillStyle=n.isCenter?'#00e8ff':n.color;ctx.fillText(n.label,n.x,ly);}if(n.isSite&&n===_hud.hovered){ctx.font='600 6.5px Space Mono,monospace';ctx.textAlign='center';const ly=n.y+n.r+12,tw=ctx.measureText(n.label).width;ctx.fillStyle='rgba(1,8,18,.85)';ctx.fillRect(n.x-tw/2-4,ly-9,tw+8,12);ctx.fillStyle=n.color;ctx.fillText(n.label,n.x,ly);}if(n.isCenter){ctx.strokeStyle='rgba(0,232,255,.22)';ctx.lineWidth=.8;const cl=26;ctx.beginPath();ctx.moveTo(n.x-cl,n.y);ctx.lineTo(n.x+cl,n.y);ctx.stroke();ctx.beginPath();ctx.moveTo(n.x,n.y-cl);ctx.lineTo(n.x,n.y+cl);ctx.stroke();}}
function drawCenterPulse(ctx,c,t){for(let i=0;i<3;i++){const rp=((t*.75+i/3)%1)*90+16,op=Math.max(0,1-rp/106)*.35;ctx.beginPath();ctx.arc(c.x,c.y,rp,0,Math.PI*2);ctx.strokeStyle=`rgba(0,232,255,${op})`;ctx.lineWidth=.9;ctx.stroke();}}
function drawHoverRing(ctx,n,t){ctx.save();ctx.translate(n.x,n.y);ctx.rotate(t*1.2);ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(0,0,n.r+8,0,Math.PI*2);ctx.strokeStyle=n.color+'99';ctx.lineWidth=1;ctx.stroke();ctx.restore();}
function drawSelectionRing(ctx,n,t){ctx.save();ctx.translate(n.x,n.y);ctx.rotate(-t*1.8);ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(0,0,n.r+16,0,Math.PI*2);ctx.strokeStyle=n.color;ctx.lineWidth=1.4;ctx.stroke();ctx.restore();const br=n.r+22,bs=8;ctx.setLineDash([]);ctx.strokeStyle=n.color;ctx.lineWidth=1.5;[[1,1],[-1,1],[-1,-1],[1,-1]].forEach(([sx,sy])=>{ctx.beginPath();ctx.moveTo(n.x+sx*br,n.y+sy*(br-bs));ctx.lineTo(n.x+sx*br,n.y+sy*br);ctx.lineTo(n.x+sx*(br-bs),n.y+sy*br);ctx.stroke();});}

function bindHUDEvents() {
  const canvas=_hud.canvas;
  canvas.addEventListener('mousemove',e=>{ const{x,y}=toCanvas(e.clientX,e.clientY); setText('hud-coords',`X:${pad(x)} Y:${pad(y)}`); const hit=hitTest(x,y); _hud.hovered=hit; canvas.classList.toggle('clickable',!!hit); if(hit) setText('hud-sector',hit.clusterId.toUpperCase()); });
  canvas.addEventListener('click',e=>{ const{x,y}=toCanvas(e.clientX,e.clientY); const hit=hitTest(x,y); if(hit){_hud.selected=hit;showNodeTip(hit,e.clientX,e.clientY);}else{_hud.selected=null;hideNodeTip();} });
  canvas.addEventListener('touchstart',e=>{const touch=e.touches[0];const{x,y}=toCanvas(touch.clientX,touch.clientY);const hit=hitTest(x,y);_hud.hovered=hit;_hud.selected=hit||null;hit?showNodeTip(hit,touch.clientX,touch.clientY):hideNodeTip();},{passive:true});
  canvas.addEventListener('mouseleave',()=>{ _hud.hovered=null; canvas.classList.remove('clickable'); });
}

function toCanvas(cx,cy){const r=_hud.canvas.getBoundingClientRect();return{x:cx-r.left,y:cy-r.top};}
function pad(v){return Math.round(v).toString().padStart(3,'0');}
function hitTest(x,y){const candidates=_hud.nodes.filter(n=>n.isCenter||n.isCluster||(n.layer||1)<=_activeLayer);return[...candidates].sort((a,b)=>b.r-a.r).find(n=>Math.hypot(n.x-x,n.y-y)<n.r+8)||null;}

function showNodeTip(node,cx,cy){
  const tt=$('node-tip'); if(!tt) return;
  $('ntip-cat').textContent=(node.clusterId||'HUB').toUpperCase(); $('ntip-cat').style.color=node.color;
  $('ntip-tier').textContent=node.layer?`TIER ${node.layer}`:''; $('ntip-name').textContent=node.label;
  $('ntip-url').textContent=(node.url&&node.url!=='#')?node.url.replace('https://',''):'';
  $('ntip-desc').textContent=SITE_DESCS[node.label]||(node.isCluster?`${node.label} cluster.`:'');
  const ob=$('ntip-open');
  if(ob){if(node.url&&node.url!=='#'){ob.style.display='inline-block';ob.style.color=node.color;ob.style.borderColor=node.color+'55';ob.onclick=()=>window.open(node.url,'_blank','noopener');}else ob.style.display='none';}
  tt.style.borderColor=node.color+'55';
  const pad=14,ttW=240,ttH=150;
  let tx=cx+20,ty=cy-16;
  if(tx+ttW>window.innerWidth-pad) tx=cx-ttW-20;
  if(ty+ttH>window.innerHeight-pad) ty=window.innerHeight-ttH-pad;
  if(ty<pad) ty=pad;
  tt.style.left=tx+'px'; tt.style.top=ty+'px'; tt.style.display='block';
  tt.style.pointerEvents=(node.url&&node.url!=='#')?'all':'none';
}
function hideNodeTip(){const tt=$('node-tip');if(tt&&!_hud.selected)tt.style.display='none';}

function buildLegend(){
  const wrap=$('legend-items'); if(!wrap) return; wrap.innerHTML='';
  CLUSTERS.forEach(cl=>{
    const div=mkEl('div','leg-item');
    div.innerHTML=`${cl.label}<span class="leg-dot" style="background:${cl.color};box-shadow:0 0 4px ${cl.color}88"></span>`;
    div.addEventListener('click',()=>{ const node=_hud.nodes.find(n=>n.clusterId===cl.id&&n.isCluster); if(node){_hud.selected=node;showNodeTip(node,node.x+20,node.y-20);}});
    wrap.appendChild(div);
  });
}
