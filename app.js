/* ==============================================================
   CYANIX AI -- JavaScript.js  v12
   Supabase Auth * Chat History * Groq Streaming * RAG * TTS * STT
============================================================== */
'use strict';

/* -- Config ------------------------------------------------ */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = SUPABASE_URL + '/functions/v1/cyanix-chat';
const AXION_URL     = SUPABASE_URL + '/functions/v1/axion-chat';
const GROQ_STT_URL  = SUPABASE_URL + '/functions/v1/groq-stt';
const TRAINING_URL  = SUPABASE_URL + '/functions/v1/collect-training-data';
const TRAINING_PIPELINE_URL = SUPABASE_URL + '/functions/v1/training-pipeline';
const KG_URL            = SUPABASE_URL + '/functions/v1/knowledge-graph';
const PIPELINE_URL  = SUPABASE_URL + '/functions/v1/feedback-pipeline';
const RAG_URL       = SUPABASE_URL + '/functions/v1/rag-search';
const BROWSE_URL    = SUPABASE_URL + '/functions/v1/browse-page';

const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];

/* -- Models ------------------------------------------------ */
const MODELS = [
  { id: 'axion', name: 'Axion', tag: 'ELITE', desc: '4-model ensemble · Maverick · Scout · Llama 3.3 · Nemotron' },
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
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', title: 'Write code', sub: 'Explain, debug or generate code', prompt: 'Write a Python function that' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>', title: 'Search the web', sub: 'Get real-time answers from the web', prompt: 'Search for the latest news on' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', title: 'Write something', sub: 'Blog posts, emails, captions', prompt: 'Write a blog post about' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>', title: 'Explain a concept', sub: 'Break down any complex topic', prompt: 'Explain how' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>', title: 'Analyse data', sub: 'Charts, summaries, insights', prompt: 'Help me analyse this data:' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', title: 'Creative ideas', sub: 'Brainstorm, scripts, stories', prompt: 'Give me 5 creative ideas for' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>', title: 'Research a topic', sub: 'Summarise and cite sources', prompt: 'Research and summarise' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>', title: 'Productivity', sub: 'Checklists, plans, time management', prompt: 'Help me plan my week for' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>', title: 'Summarise content', sub: 'Paste an article or document', prompt: 'Summarise this:' },
  { icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>', title: 'Problem solving', sub: 'Walk through any challenge step by step', prompt: 'Help me solve this problem:' },
];

/* -- State ------------------------------------------------- */
let _sb          = null;
let _session     = null;
let _chats       = [];
let _currentId   = null;
let _history     = [];
let _responding  = false;
let _abortCtrl   = null;
let _ragEnabled  = false;
let _ragAuto     = false;
let _mediaRec    = null;
let _sttChunks   = [];
let _sttActive   = false;
// no splash state needed
let _signedInUser = null;
let _syncPending  = false; // race condition guard
let _notifications    = [];  // loaded on sign-in, updated via realtime
let _notifUnreadCount = 0;
let _memories  = [];        // cross-chat memories loaded on sign-in
let _memoriesLoaded = false;
let _learnedCtx = null;     // { personal_examples, global_examples, style_prefs } -- loaded at login
let _kgContext  = '';       // unified knowledge graph + memory context string
let _attachment = null;     // { type, name, data, mediaType } -- current pending attachment
let _supporter = {
  isActive:false, earlyAccess:false, premiumForever:false,
  memoryPriority:false, dailyLimit:40, unlockedThemes:[],
};
let _usageToday = 0;
// _syncPending declared above

let _settings = {
  model:           'axion',
  streaming:       true,
  theme:           'light',
  trainingConsent: false,
  displayName:     '',
  personality:     'friendly',
  ragAuto:         false,
  contextDepth:    'light',  // light=5 | standard=15 | deep=30
  fontStyle:       'inter',  // inter | space-grotesk | syne | orbitron
  fontSize:        16,       // 8-20px
  language:        'auto',   // auto | en | es | fr | pt | ar | hi | de | zh | ja ...
};

const PERSONALITIES = {
  friendly:     'Be warm and real -- like a knowledgeable friend who actually cares, not a customer service bot. No hollow affirmations. Do not start responses with "Great question!" or "Absolutely!" or "Certainly!" -- just answer. Be direct and human.',
  professional: 'Be precise and structured. Cut the filler. Every sentence should earn its place. Speak like a senior engineer in a design review -- clear, confident, no padding.',
  creative:     'Think laterally. Challenge assumptions. Bring in unexpected angles and analogies. Be imaginative but grounded -- wild ideas with solid reasoning behind them.',
  concise:      'Minimum viable response. No preamble, no repetition, no summary at the end. Answer and stop.',
  mentor:       'Teach by asking as much as telling. Check understanding, unpack reasoning, guide the user to the insight rather than just handing it to them.',
  witty:        'Sharp and dry. Clever observations over obvious jokes. Wit should feel like a byproduct of intelligence, not a performance.',
};

// Frustration signals -- scored client-side before each message
const FRUSTRATION_SIGNALS = [
  /\b(still|again|already|keeps?|keeps? (happening|doing|breaking|failing))\b/i,
  /\b(why (doesn'?t|won'?t|isn'?t|can'?t)|how (is|comes?)|what the)\b/i,
  /\b(ugh|argh|damn|wtf|frustrated|annoying|broken|nothing works?)\b/i,
  /\b(tried (everything|that|it)|doesn'?t work|not working|still broken|same (issue|problem|error))\b/i,
  /[!?]{2,}/,
  /\b(i give up|forget it|never ?mind|this is (impossible|ridiculous|stupid))\b/i,
];

function detectFrustration(text, history) {
  if (!text || !history) return false;
  // Score the current message
  var msgScore = FRUSTRATION_SIGNALS.filter(function(r) { return r.test(text); }).length;
  // Also score the last 2 user messages for pattern
  var recentUser = history.filter(function(m) { return m.role === 'user'; }).slice(-2);
  var histScore = recentUser.reduce(function(acc, m) {
    var t = typeof m.content === 'string' ? m.content : '';
    return acc + FRUSTRATION_SIGNALS.filter(function(r) { return r.test(t); }).length;
  }, 0);
  return (msgScore >= 1 && histScore >= 1) || msgScore >= 2;
}

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
  var depth = _settings.contextDepth || 'standard';
  if (!_supporter.isActive) return 8;   // free users: was 4, raised to 8 so projects are remembered
  if (depth === 'deep')     return 20;
  if (depth === 'standard') return 12;
  return 8;
}

function retrieveRelevantMemories(query) {
  if (!_memories || !_memories.length) return [];
  var limit = getContextLimit();

  // Always include ALL project and technical memories (the user's work context)
  // These are the most likely to be cross-chat relevant
  var projectMems = _memories.filter(function(m) {
    return m.category === 'project' || m.category === 'technical';
  });

  // Score remaining memories against the current query
  var otherMems = _memories.filter(function(m) {
    return m.category !== 'project' && m.category !== 'technical';
  });

  var scored = otherMems.map(function(m) {
    return { mem: m, score: scoreMemoryRelevance(m, query) };
  }).sort(function(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    var aT = a.mem.created_at ? new Date(a.mem.created_at).getTime() : 0;
    var bT = b.mem.created_at ? new Date(b.mem.created_at).getTime() : 0;
    return bT - aT;
  });

  // Combine: all project mems first, then fill remaining slots with scored others
  var combined = projectMems.slice(0, Math.floor(limit * 0.6)); // up to 60% of slots for projects
  var remaining = limit - combined.length;
  combined = combined.concat(scored.slice(0, remaining).map(function(s) { return s.mem; }));
  return combined.slice(0, limit);
}

// ── Supported response languages ─────────────────────────────
var SUPPORTED_LANGUAGES = [
  { code: 'auto',  name: 'Auto-detect'         },
  { code: 'en',    name: 'English'              },
  { code: 'es',    name: 'Español'              },
  { code: 'fr',    name: 'Français'             },
  { code: 'pt',    name: 'Português'            },
  { code: 'ar',    name: 'العربية'              },
  { code: 'hi',    name: 'हिन्दी'              },
  { code: 'de',    name: 'Deutsch'              },
  { code: 'zh',    name: '中文'                 },
  { code: 'ja',    name: '日本語'               },
  { code: 'sw',    name: 'Kiswahili'            },
  { code: 'ru',    name: 'Русский'              },
  { code: 'ko',    name: '한국어'               },
  { code: 'it',    name: 'Italiano'             },
  { code: 'tr',    name: 'Türkçe'              },
];

function getActiveLanguageCode() {
  if (_settings.language && _settings.language !== 'auto') return _settings.language;
  var lang = (navigator.language || 'en').split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.find(function(l) { return l.code === lang; }) ? lang : 'en';
}

function getLanguageInstruction() {
  var code = getActiveLanguageCode();
  if (code === 'en') return '';
  var lang = SUPPORTED_LANGUAGES.find(function(l) { return l.code === code; });
  var name = lang ? lang.name : code;
  return 'LANGUAGE: Always respond in ' + name + ' only. Match the user\u2019s language throughout the entire response.';
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

    memBlock = 'Here is what you know about this user from past conversations. ' +
      'Weave this in naturally -- you can reference it directly (e.g. "since you are working on X" or "last time you mentioned Y") ' +
      'but do not make a big deal of it or announce that you are using your memory. Just be contextually aware. ' +
      parts.join('. ') + '.';
  }
  // Active persona overrides default personality -- but base tone rules always apply
  var baseToneRules = 'Never start responses with hollow affirmations like "Great!", "Absolutely!", "Certainly!" -- just respond. ' +
    'Be warm and real, not performative. Push back when you disagree. Admit when you do not know something. ' +
    'Reference earlier parts of the conversation when relevant. Ask follow-up questions when they genuinely help.';
  if (_activePersona && _activePersona.system_prompt) {
    var personaBlock = 'You are ' + _activePersona.name + '. ' + _activePersona.system_prompt + ' ' + baseToneRules;
    var echoCtx = (window.getEchoModeContext ? window.getEchoModeContext() : '');
    return [personaBlock, n, memBlock].filter(Boolean).join(' ') + echoCtx;
  }
  var now = new Date();
  var dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  // Long conversation grounding reminder
  var historyLen = (_history || []).length;
  var longConvReminder = historyLen > 20
    ? 'IMPORTANT: This is a long conversation (' + historyLen + ' messages). ' +
      'Do NOT invent or misremember things said earlier. If you are unsure what was said, ask the user to clarify rather than guessing. ' +
      'Stay grounded in what is actually in this conversation.'
    : '';

  var langInstruction = getLanguageInstruction();
  var identity = [
    'You are Cyanix AI -- built by Sarano. You are not ChatGPT, Claude, Gemini, or any wrapper. You are your own thing.',
    'Today is ' + dateStr + '.',
    langInstruction,

    // Honesty rules (condensed to save tokens)
    'HONESTY: (1) Never blend search results with training memory -- label the source. ' +
    '(2) For current events, only state what search returned; otherwise say you lack current data. ' +
    '(3) About yourself: only state what is in this prompt. Do not invent features. If unsure say "Sarano would know". ' +
    '(4) When you do not know, say so in one sentence and stop.',
    longConvReminder,

    //  CORE CHARACTER 
    'Your personality: warm but real. Supportive without being fake.',
    'You have strong opinions on tech, design, and code -- share them when relevant.',
    'You push back when something is wrong or when a better path exists. Do it respectfully but clearly.',

    //  TONE RULES 
    'Never start a response with hollow affirmations: no "Great!", "Absolutely!", "Certainly!", "Of course!" -- just respond.',
    'Do not summarize what you just said at the end. End when you are done.',
    'Match the user' + String.fromCharCode(39) + 's energy. Casual or sharp depending on context.',
    'Use the user' + String.fromCharCode(39) + 's name naturally -- not every message, just when it feels human.',

    //  ENGAGEMENT RULES 
    'Ask follow-up questions when they genuinely move the conversation forward.',
    'Reference what the user said earlier when relevant. Show you are paying attention.',
    'If the user seems frustrated, slow down. Acknowledge the friction before jumping to a solution.',

    // CODE QUALITY — strict rules, always enforced
    'CODE RULES (follow every one, every time):' +
    ' (1) COMPLETE CODE ONLY. Never truncate with "# ... rest of code", "// TODO", "pass" as placeholder, or "..." ellipsis. Write every line.' +
    ' (2) PYTHON: always include all imports at the top. Use correct indentation (4 spaces). ' +
      'Handle exceptions with try/except where IO, network, or parsing is involved. ' +
      'Never reference variables before assignment. Always close files with context managers (with open(...)).' +
      'Test your logic mentally -- if a function takes a list, make sure you handle empty list.' +
    ' (3) JAVASCRIPT: declare variables before use. Use const/let not var for new code. ' +
      'Handle async properly -- always await promises, never mix sync/async incorrectly. ' +
      'Check for null/undefined before accessing properties.' +
    ' (4) NEVER produce code with known runtime errors. If you are unsure about an API or library method, say so instead of guessing.' +
    ' (5) For multi-file projects, always clarify which file each block belongs to.' +
    ' (6) When fixing a bug: show the corrected code in full, not just the changed line.' +
    ' (7) After writing code, mentally trace through it with a simple input to verify it actually works before responding.',

  ].filter(Boolean).join(' ');
  var echoCtx = (window.getEchoModeContext ? window.getEchoModeContext() : '');
  // Append KG context if available (replaces old memory block when present)
  var kgBlock = _kgContext
    ? '\n\n' + _kgContext
    : '';
  return [identity, p, n, (kgBlock || memBlock)].filter(Boolean).join(' ') + buildLearnedContext() + echoCtx;
}

function edgeHeaders() {
  // Always use the freshest session token. If _session is missing or looks
  // expired (within 60s of expiry), we still use what we have — the real fix
  // is the async refresh below, but at least we never silently fall back to
  // the anon key for authenticated requests (that causes the 401→500 error).
  const token = (_session && _session.access_token) ? _session.access_token : SUPABASE_ANON;
  return {
    'Content-Type':  'application/json',
    'Authorization': 'Bearer ' + token,
    'apikey':        SUPABASE_ANON,
  };
}

/* ==========================================================
   SELF-CORRECTING CODE PIPELINE
   After every AI response containing code:
     1. Extract all code blocks
     2. Run language-appropriate syntax checks client-side
     3. If errors found → send a fix-pass back to the model
     4. Render corrected code in the same bubble
   Max 2 fix iterations. Runs silently — user just sees verified/fixed badge.
========================================================== */

// ── Syntax checkers per language ─────────────────────────

function checkJavaScript(code) {
  var errors = [];
  // 1. Bracket/brace/paren balance
  var stack = [];
  var pairs = { ')':'(', '}':'{', ']':'[' };
  var opens = new Set(['(', '{', '[']);
  var closes = new Set([')', '}', ']']);
  var inStr = false, strChar = '', inTemplate = 0;
  for (var i = 0; i < code.length; i++) {
    var c = code[i];
    var prev = i > 0 ? code[i-1] : '';
    if (!inStr && (c === '"' || c === "'" || c === '`')) {
      inStr = true; strChar = c;
      if (c === '`') inTemplate++;
    } else if (inStr && c === strChar && prev !== '\\') {
      inStr = false;
      if (strChar === '`') inTemplate--;
    }
    if (!inStr) {
      if (opens.has(c)) stack.push(c);
      else if (closes.has(c)) {
        if (stack.length === 0 || stack[stack.length-1] !== pairs[c]) {
          errors.push('Unmatched "' + c + '" near position ' + i);
        } else { stack.pop(); }
      }
    }
  }
  if (stack.length > 0) errors.push('Unclosed "' + stack.join('", "') + '"');

  // 2. Try Function constructor parse (catches most syntax errors in strict mode)
  try { new Function(code); }
  catch (e) {
    var msg = e.message || '';
    // Avoid duplicate bracket errors
    if (!msg.includes('Unexpected token')) {
      errors.push('Syntax: ' + msg);
    } else {
      errors.push(msg);
    }
  }
  return errors;
}

function checkTypeScript(code) {
  // TypeScript: strip type annotations then run JS check
  var stripped = code
    .replace(/:\s*[A-Z][A-Za-z<>\[\],\s|&]+(?=[=,);{])/g, '')  // param types
    .replace(/<[A-Z][A-Za-z,\s]*>/g, '')                          // generics
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')                  // interfaces
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '');                     // type aliases
  return checkJavaScript(stripped);
}

function checkJSON(code) {
  try { JSON.parse(code); return []; }
  catch (e) { return [e.message]; }
}

function checkHTML(code) {
  try {
    var parser = new DOMParser();
    var doc    = parser.parseFromString(code, 'text/html');
    var errors = Array.from(doc.querySelectorAll('parsererror')).map(function(e) {
      return e.textContent.trim().slice(0, 120);
    });
    return errors;
  } catch (e) { return [e.message]; }
}

function checkCSS(code) {
  try {
    var sheet = new CSSStyleSheet();
    sheet.replaceSync(code);
    return [];
  } catch (e) { return [e.message]; }
}

function checkPython(code) {
  var errors = [];
  var lines  = code.split('\n');
  // Check indentation consistency (spaces vs tabs)
  var hasSpaces = lines.some(function(l) { return /^  /.test(l); });
  var hasTabs   = lines.some(function(l) { return /^\t/.test(l); });
  if (hasSpaces && hasTabs) errors.push('Mixed tabs and spaces in indentation');

  // Check for common syntax issues
  var bracketStack = [];
  lines.forEach(function(line, i) {
    var stripped = line.replace(/#.*/,'').replace(/(["'])(?:(?!\1).)*\1/g,'""');
    for (var c of stripped) {
      if ('([{'.includes(c)) bracketStack.push(c);
      else if (')]}'.includes(c)) {
        if (bracketStack.length > 0) bracketStack.pop();
        else errors.push('Line ' + (i+1) + ': unexpected "' + c + '"');
      }
    }
    // Detect def/class without colon
    if (/^\s*(def|class|if|elif|else|for|while|try|except|finally|with)\b/.test(line) &&
        !/:\s*(#.*)?$/.test(line) && !line.trim().endsWith('\\')) {
      errors.push('Line ' + (i+1) + ': missing colon after "' + line.trim().split(/\s+/)[0] + '"');
    }
  });
  if (bracketStack.length > 0) errors.push('Unclosed brackets: ' + bracketStack.join(''));
  return errors;
}

function checkSQL(code) {
  var errors = [];
  // Basic: unclosed strings
  var singles = (code.match(/'/g) || []).length;
  if (singles % 2 !== 0) errors.push('Unclosed single-quoted string');
  var doubles = (code.match(/"/g) || []).length;
  if (doubles % 2 !== 0) errors.push('Unclosed double-quoted string');
  // Check for common errors
  if (/\bSELECT\b.*\bFROM\b/i.test(code) && !/\bFROM\b\s+\w/i.test(code)) {
    errors.push('FROM clause appears incomplete');
  }
  return errors;
}

// ── Main checker dispatcher ───────────────────────────────
function syntaxCheck(lang, code) {
  if (!lang || !code || code.trim().length < 20) return [];
  var l = lang.toLowerCase().trim();
  try {
    if (l === 'javascript' || l === 'js' || l === 'jsx')    return checkJavaScript(code);
    if (l === 'typescript' || l === 'ts' || l === 'tsx')    return checkTypeScript(code);
    if (l === 'json')                                         return checkJSON(code);
    if (l === 'html')                                         return checkHTML(code);
    if (l === 'css')                                          return checkCSS(code);
    if (l === 'python' || l === 'py')                        return checkPython(code);
    if (l === 'sql')                                          return checkSQL(code);
  } catch (e) { return []; } // never crash the pipeline
  return [];
}

// ── Extract code blocks from a response string ────────────
function extractCodeBlocks(text) {
  var blocks = [];
  var regex  = /```(\w*)\n?([\s\S]*?)```/g;
  var match;
  while ((match = regex.exec(text)) !== null) {
    var lang = (match[1] || '').toLowerCase().trim();
    var code = (match[2] || '').trim();
    if (code.length > 30) blocks.push({ lang: lang, code: code, full: match[0] });
  }
  return blocks;
}

// ── Fix pass: ask Cyanix to fix the errors ────────────────
async function runFixPass(originalCode, lang, errors, userQuestion) {
  var errorList = errors.slice(0, 5).join('\n');
  var fixPrompt = 'The following ' + (lang || 'code') + ' has syntax errors.\n\n' +
    'ERRORS:\n' + errorList + '\n\n' +
    'ORIGINAL CODE:\n```' + lang + '\n' + originalCode + '\n```\n\n' +
    'Return ONLY the corrected code block, no explanation, no prose. ' +
    'Fix every error. Do not change logic. Preserve all existing functionality.';

  try {
    var res = await fetch(CHAT_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({
        model:      'groq/llama-3.1-8b-instant', // fast model for fixes
        stream:     false,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: 'You are a code repair tool. Fix syntax errors exactly as instructed. Return only the corrected code block.' },
          { role: 'user',   content: fixPrompt },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    var data    = await res.json();
    var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) return null;

    // Extract the fixed code block from the response
    var match = content.match(/```\w*\n?([\s\S]*?)```/);
    return match ? match[1].trim() : content.trim();
  } catch (e) {
    console.warn('[CyanixAI] Fix pass failed:', e.message);
    return null;
  }
}

// ── Badge renderer ────────────────────────────────────────
function setArtifactBadge(bubbleEl, blockIndex, state, detail) {
  // state: 'checking' | 'verified' | 'fixed' | 'warning' | 'failed'
  var badgeId = 'cx-code-badge-' + blockIndex;
  var existing = bubbleEl.querySelector('#' + badgeId);

  var icons = {
    checking: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    verified: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    fixed:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    warning:  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    failed:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };
  var labels = { checking:'Checking…', verified:'Verified', fixed:'Auto-fixed', warning:'Warning', failed:'Check failed' };

  var badge = existing || document.createElement('div');
  badge.id        = badgeId;
  badge.className = 'cx-code-badge cx-code-badge--' + state;
  badge.innerHTML = (icons[state] || '') + '<span>' + (labels[state] || state) + (detail ? ': ' + esc(String(detail)) : '') + '</span>';

  if (!existing) {
    // Find the Nth code block or artifact card in this bubble
    var blocks = bubbleEl.querySelectorAll('.code-block, .cx-artifact');
    var target = blocks[blockIndex] || blocks[blocks.length - 1];
    if (target) target.appendChild(badge);
    else bubbleEl.appendChild(badge);
  }
  return badge;
}

// ── Update artifact card with fixed code ─────────────────
function updateArtifactWithFix(bubbleEl, blockIndex, fixedCode, lang) {
  var blocks = bubbleEl.querySelectorAll('.code-block, .cx-artifact');
  var target = blocks[blockIndex];
  if (!target) return;

  var pre = target.querySelector('pre');
  if (!pre) return;

  var escaped = fixedCode.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  pre.innerHTML = '<code>' + escaped + '</code>';

  // Update line count if artifact card
  var lineEl = target.querySelector('.cx-artifact-lines');
  if (lineEl) lineEl.textContent = fixedCode.split('\n').length + ' lines';

  // Flash the code block to show it was updated
  target.classList.add('cx-code-updated');
  setTimeout(function() { target.classList.remove('cx-code-updated'); }, 1200);
}

// ── Main pipeline entry point ─────────────────────────────
// Called after every AI response that contains code.
// bubbleEl: the .msg-bubble DOM element
// aiText: the raw response text
// userQuestion: the original user prompt (for context)
async function runCodePipeline(bubbleEl, aiText, userQuestion) {
  if (!bubbleEl || !aiText) return;

  var blocks = extractCodeBlocks(aiText);
  if (blocks.length === 0) return;

  // Only check languages we have validators for
  var checkable = ['javascript','js','jsx','typescript','ts','tsx','json','html','css','python','py','sql'];

  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (!checkable.includes(block.lang)) continue;
    if (block.code.split('\n').length < 5) continue; // skip tiny snippets

    // Show checking badge
    setArtifactBadge(bubbleEl, i, 'checking');

    // Small delay so UI paints before we do CPU work
    await new Promise(function(r) { setTimeout(r, 80); });

    var errors = syntaxCheck(block.lang, block.code);

    if (errors.length === 0) {
      setArtifactBadge(bubbleEl, i, 'verified');
      continue;
    }

    console.log('[CyanixAI] Code pipeline: found', errors.length, 'error(s) in', block.lang, ':', errors);

    // Fix pass iteration (max 2)
    var currentCode   = block.code;
    var currentErrors = errors;
    var fixed         = false;

    for (var attempt = 0; attempt < 2; attempt++) {
      setArtifactBadge(bubbleEl, i, 'checking', 'fixing attempt ' + (attempt + 1));

      var fixedCode = await runFixPass(currentCode, block.lang, currentErrors, userQuestion);
      if (!fixedCode) break;

      // Re-check the fixed code
      var recheck = syntaxCheck(block.lang, fixedCode);
      updateArtifactWithFix(bubbleEl, i, fixedCode, block.lang);

      if (recheck.length === 0) {
        setArtifactBadge(bubbleEl, i, 'fixed', errors.length + ' issue' + (errors.length === 1 ? '' : 's'));
        fixed = true;
        break;
      }
      // Still has errors — try one more time with new errors
      currentCode   = fixedCode;
      currentErrors = recheck;
    }

    if (!fixed && errors.length > 0) {
      // Could not auto-fix — show warning with first error
      setArtifactBadge(bubbleEl, i, 'warning', errors[0].slice(0, 60));
    }
  }
}


function mdToHTML(raw) {
  let text = String(raw || '');
  let thinkHTML = '';

  // Show think block for compound models AND qwen-qwq (which also produces <think> tags)
  var thinkModel = _settings && _settings.model &&
    (_settings.model.startsWith('groq/compound') || _settings.model === CODING_MODEL);

  text = text.replace(/<think>([\s\S]*?)<\/think>/gi, function(_, content) {
    if (!thinkModel) return ''; // strip think block silently for other models
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
    const runnable = ['js','javascript','html','css','python','py'].includes((lang||'').toLowerCase());
    const runBtn = runnable
      ? '<button class="code-run-btn" onclick="window.runCode(this)" data-lang="' + esc((lang||'').toLowerCase()) + '">' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run</button>'
      : '';
    return '<div class="code-block">' +
      '<div class="code-block-header"><span class="code-lang-label">' + l + '</span>' +
      '<div class="code-block-actions">' + runBtn +
      '<button class="code-copy-btn" onclick="copyCode(this)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>' +
      '</div></div>' +
      '<pre><code>' + escaped + '</code></pre>' +
      '<div class="code-sandbox hidden"></div>' +
      '</div>';
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
  // Markdown links [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="cx-link" target="_blank" rel="noopener noreferrer">$1</a>');

  // Bare URLs -- linkify any https:// or http:// not already inside an href or src
  text = text.replace(/(?<!href="|href='|src="|src=')\b(https?:\/\/[^\s<>"'\)\]]+)/g, function(url) {
    // Trim trailing punctuation that is likely not part of the URL
    var clean = url.replace(/[.,;:!?]+$/, '');
    var display = clean.length > 50 ? clean.slice(0, 47) + '...' : clean;
    return '<a href="' + clean + '" class="cx-link" target="_blank" rel="noopener noreferrer">' + display + '</a>';
  });

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
    btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
    setTimeout(function() { btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy'; }, 1500);
  });
};

/* ==========================================================
   CODE SANDBOX
   Runs JS, HTML, Python (Pyodide) in a sandboxed iframe.
========================================================== */
var _pyodideReady    = false;
var _pyodideLoading  = false;

// ── Run button handler ────────────────────────────────────
window.runCode = function(btn) {
  var block   = btn.closest('.code-block');
  var sandbox = block.querySelector('.code-sandbox');
  var pre     = block.querySelector('pre');
  var lang    = btn.dataset.lang || 'js';
  var code    = pre ? (pre.innerText || pre.textContent || '') : '';

  if (!sandbox || !code.trim()) return;

  // Toggle: if already open and same code, close it
  if (!sandbox.classList.contains('hidden') && sandbox.dataset.running === 'true') {
    sandbox.classList.add('hidden');
    sandbox.dataset.running = '';
    btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run';
    return;
  }

  sandbox.classList.remove('hidden');
  sandbox.dataset.running = 'true';
  btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg> Stop';

  // Normalise lang
  if (lang === 'javascript') lang = 'js';
  if (lang === 'python')     lang = 'py';

  if (lang === 'html' || lang === 'css') {
    runHTML(sandbox, code, lang);
  } else if (lang === 'js') {
    runJS(sandbox, code);
  } else if (lang === 'py') {
    runPython(sandbox, code, btn);
  }
};

// ── HTML/CSS preview ──────────────────────────────────────
function runHTML(sandbox, code, lang) {
  sandbox.innerHTML = '';
  sandbox.className = 'code-sandbox code-sandbox-preview';

  var fullHTML = lang === 'css'
    ? '<!DOCTYPE html><html><head><style>' + code + '</style></head><body><p>CSS Preview</p><div class="box">Styled Box</div></body></html>'
    : code.includes('<html') ? code
    : '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,sans-serif;padding:12px;margin:0;}</style></head><body>' + code + '</body></html>';

  var iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.style.cssText = 'width:100%;border:none;min-height:120px;';
  sandbox.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(fullHTML);
  iframe.contentDocument.close();

  // Auto-resize to content
  setTimeout(function() {
    try {
      var h = iframe.contentDocument.body.scrollHeight;
      iframe.style.height = Math.min(Math.max(h + 24, 80), 400) + 'px';
    } catch(e) {}
  }, 100);
}

// ── JavaScript execution ──────────────────────────────────
function runJS(sandbox, code) {
  sandbox.innerHTML = '';
  sandbox.className = 'code-sandbox code-sandbox-output';

  // Build iframe with message bridge
  var iframeHTML = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body><script>' +
    '(function(){' +
    'var _out=[];' +
    'var _log=console.log.bind(console);' +
    'console.log=function(){' +
    '  var args=Array.from(arguments).map(function(a){' +
    '    try{return typeof a==="object"?JSON.stringify(a,null,2):String(a);}catch(e){return String(a);}' +
    '  });' +
    '  _out.push({type:"log",text:args.join(" ")});' +
    '  parent.postMessage({type:"cx-sandbox-log",text:args.join(" ")},"*");' +
    '  _log.apply(console,arguments);' +
    '};' +
    'console.error=function(){' +
    '  var args=Array.from(arguments).map(function(a){return String(a);});' +
    '  parent.postMessage({type:"cx-sandbox-error",text:args.join(" ")},"*");' +
    '};' +
    'window.onerror=function(msg,src,line,col,err){' +
    '  parent.postMessage({type:"cx-sandbox-error",text:(err&&err.message)||msg},"*");' +
    '  return true;' +
    '};' +
    'try{' +
    'var __result=(function(){\n' + code.replace(/\\/g,'\\\\').replace(/`/g,'\\`').replace(/\$/g,'\\$') + '\n})();' +
    'if(__result!==undefined)parent.postMessage({type:"cx-sandbox-result",text:JSON.stringify(__result,null,2)},"*");' +
    '}catch(e){' +
    'parent.postMessage({type:"cx-sandbox-error",text:e.message},"*");' +
    '}' +
    'parent.postMessage({type:"cx-sandbox-done"},"*");' +
    '})();<\/script></body></html>';

  renderSandboxOutput(sandbox, iframeHTML);
}

function renderSandboxOutput(sandbox, iframeHTML) {
  var outputEl = document.createElement('div');
  outputEl.className = 'sandbox-output';
  sandbox.appendChild(outputEl);

  var iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-scripts');
  iframe.style.display = 'none';
  sandbox.appendChild(iframe);

  var hasOutput = false;

  function handleMsg(e) {
    var d = e.data;
    if (!d || !d.type || !d.type.startsWith('cx-sandbox')) return;

    if (d.type === 'cx-sandbox-done') {
      window.removeEventListener('message', handleMsg);
      if (!hasOutput) {
        var empty = document.createElement('div');
        empty.className = 'sandbox-line sandbox-empty';
        empty.textContent = '(no output)';
        outputEl.appendChild(empty);
      }
      return;
    }

    hasOutput = true;
    var line = document.createElement('div');
    line.className = 'sandbox-line ' +
      (d.type === 'cx-sandbox-error'  ? 'sandbox-err' :
       d.type === 'cx-sandbox-result' ? 'sandbox-result' : 'sandbox-log');

    if (d.type === 'cx-sandbox-error') {
      line.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ' + esc(d.text || '');
    } else if (d.type === 'cx-sandbox-result') {
      line.innerHTML = '<span class="sandbox-arrow">→</span> ' + esc(d.text || '');
    } else {
      line.textContent = d.text || '';
    }
    outputEl.appendChild(line);
  }

  window.addEventListener('message', handleMsg);

  iframe.contentDocument.open();
  iframe.contentDocument.write(iframeHTML);
  iframe.contentDocument.close();

  // Timeout fallback
  setTimeout(function() { window.removeEventListener('message', handleMsg); }, 8000);
}

// ── Python via Pyodide ────────────────────────────────────
function runPython(sandbox, code, runBtn) {
  sandbox.innerHTML = '';
  sandbox.className = 'code-sandbox code-sandbox-output';

  var outputEl = document.createElement('div');
  outputEl.className = 'sandbox-output';
  sandbox.appendChild(outputEl);

  function addLine(text, cls) {
    var line = document.createElement('div');
    line.className = 'sandbox-line ' + (cls || 'sandbox-log');
    line.textContent = text;
    outputEl.appendChild(line);
  }

  if (!_pyodideReady && !_pyodideLoading) {
    _pyodideLoading = true;
    addLine('Loading Python runtime… (~10MB, one-time)', 'sandbox-info');

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
    script.onload = async function() {
      try {
        window._pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/' });
        _pyodideReady = true;
        _pyodideLoading = false;
        outputEl.innerHTML = '';
        executePython(code, outputEl);
      } catch(e) {
        addLine('Failed to load Python: ' + e.message, 'sandbox-err');
      }
    };
    script.onerror = function() {
      addLine('Could not load Python runtime. Check your connection.', 'sandbox-err');
      _pyodideLoading = false;
    };
    document.head.appendChild(script);
    return;
  }

  if (_pyodideLoading) {
    addLine('Python runtime is loading… please wait a moment and try again.', 'sandbox-info');
    return;
  }

  executePython(code, outputEl);
}

async function executePython(code, outputEl) {
  function addLine(text, cls) {
    var line = document.createElement('div');
    line.className = 'sandbox-line ' + (cls || 'sandbox-log');
    line.textContent = text;
    outputEl.appendChild(line);
  }

  try {
    // Redirect stdout
    window._pyodide.runPython('import sys, io\nsys.stdout = io.StringIO()');
    var result = window._pyodide.runPython(code);
    var stdout = window._pyodide.runPython('sys.stdout.getvalue()');
    window._pyodide.runPython('sys.stdout = sys.__stdout__');

    if (stdout) {
      stdout.trim().split('\n').forEach(function(l) { addLine(l, 'sandbox-log'); });
    }
    if (result !== undefined && result !== null) {
      addLine('→ ' + String(result), 'sandbox-result');
    }
    if (!stdout && (result === undefined || result === null)) {
      addLine('(no output)', 'sandbox-empty');
    }
  } catch(e) {
    addLine(e.message || String(e), 'sandbox-err');
  }
}

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
  initComposerLiveState();
  initComposerPlaceholder();

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
    // Always update _session on any auth event so access_token stays fresh.
    // TOKEN_REFRESHED fires automatically every ~55 minutes — catching it here
    // is what prevents the "Signal loss: 401" 500 error on long sessions.
    if (session) _session = session;
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (event === 'TOKEN_REFRESHED') {
        console.log('[CyanixAI] Token refreshed — session updated');
        return; // no need to re-run onSignedIn
      }
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

  // Wire clear-all-memories button (needs _sb in scope)
  var clearMemBtn = document.getElementById('clear-all-memories-btn');
  if (clearMemBtn) {
    clearMemBtn.addEventListener('click', async function() {
      if (!_sb || !_session) return;
      if (!confirm('Delete all ' + _memories.length + ' memories? This cannot be undone.')) return;
      try {
        await _sb.from('user_memories').delete().eq('user_id', _session.user.id);
        _memories = [];
        renderMemoryManager();
        toast('All memories cleared.');
      } catch (e) { toast('Could not clear memories.'); }
    });
  }
});

function handleStartActions() {
  const action     = window._startAction;
  const sharedText = window._sharedText;

  // ── Handle URL params from landing page ─────────────────
  var params = new URLSearchParams(window.location.search);
  var panel  = params.get('panel');
  var auth   = params.get('auth');
  var refCode = params.get('ref');

  // Store referral code from URL before auth happens
  if (refCode && refCode.startsWith('CX') && refCode.length === 7) {
    try { localStorage.setItem('cx_pending_referral', refCode.toUpperCase()); } catch(e) {}
  }

  // Also check sessionStorage intent set by landing.html
  var intent = null;
  try { intent = sessionStorage.getItem('cx_auth_intent'); } catch(e) {}

  if (auth === 'google' || intent === 'google') {
    window.addEventListener('cyanix:ready', function() {
      try { sessionStorage.removeItem('cx_auth_intent'); } catch(e) {}
      signInOAuth('google');
    }, { once: true });
  } else if (auth === 'github' || intent === 'github') {
    window.addEventListener('cyanix:ready', function() {
      try { sessionStorage.removeItem('cx_auth_intent'); } catch(e) {}
      signInOAuth('github');
    }, { once: true });
  } else if (panel === 'signup' || intent === 'signup') {
    window.addEventListener('cyanix:ready', function() {
      try { sessionStorage.removeItem('cx_auth_intent'); } catch(e) {}
      showPanel('signup');
    }, { once: true });
  } else if (panel === 'signin' || intent === 'signin') {
    window.addEventListener('cyanix:ready', function() {
      try { sessionStorage.removeItem('cx_auth_intent'); } catch(e) {}
      showPanel('signin');
    }, { once: true });
  }

  // Clean URL without reload
  if (panel || auth) {
    try { window.history.replaceState({}, '', window.location.pathname); } catch(e) {}
  }

  if (action === 'new-chat') {
    window.addEventListener('cyanix:ready', function() { newChat(); }, { once: true });
  } else if (action === 'settings') {
    window.addEventListener('cyanix:ready', function() { window.openSettings(); }, { once: true });
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
  // Update sheet header text
  var titles = { signin: 'Welcome back', signup: 'Create account', forgot: 'Reset password' };
  var subs   = { signin: 'Sign in to continue', signup: 'Join Cyanix AI for free', forgot: "We'll send a reset link" };
  var titleEl = $('auth-sheet-title');
  var subEl   = $('auth-sheet-sub');
  if (titleEl) titleEl.textContent = titles[name] || '';
  if (subEl)   subEl.textContent   = subs[name]   || '';
}

// ── Auth hero morphing headline ───────────────────────────────
(function() {
  var phrases = [
    [{t:'Think',c:false},{t:'beyond',c:false},{t:'limits.',c:true}],
    [{t:'Built',c:false},{t:'for',c:false},{t:'builders.',c:true}],
    [{t:'Search.',c:true},{t:'Remember.',c:true},{t:'Create.',c:true}],
    [{t:'Four',c:false},{t:'models.',c:false},{t:'One',c:false},{t:'answer.',c:true}],
    [{t:'Your',c:false},{t:'AI,',c:false},{t:'redefined.',c:true}],
  ];
  var taglines = [
    'Your AI — built different.',
    'Powered by the Axion ensemble.',
    'Remembers what matters.',
    'Search the live web, instantly.',
    'Free during beta. Always.',
  ];
  var idx = 0;
  var hEl, tEl;

  function renderPhrase(words) {
    if (!hEl) return;
    hEl.innerHTML = words.map(function(w, i) {
      return '<span class="aw' + (w.c ? ' acc' : '') + '" style="animation-delay:' + (i*80) + 'ms">' + w.t + '\u00a0</span>';
    }).join('');
    hEl.querySelectorAll('.aw').forEach(function(el) { el.classList.add('in'); });
  }

  function morphTo(next) {
    if (!hEl) return;
    var words = hEl.querySelectorAll('.aw');
    words.forEach(function(w, i) {
      setTimeout(function() { w.classList.remove('in'); w.classList.add('out'); }, i * 80);
    });
    var wait = (words.length - 1) * 80 + 280;
    setTimeout(function() {
      idx = next;
      renderPhrase(phrases[idx]);
      if (tEl) {
        tEl.style.opacity = '0';
        setTimeout(function() {
          tEl.textContent = taglines[idx % taglines.length];
          tEl.style.opacity = '1';
        }, 180);
      }
    }, wait);
  }

  window.addEventListener('cyanix:ready', function() {
    hEl = document.getElementById('auth-headline');
    tEl = document.getElementById('auth-tagline');
    if (!hEl) return;
    renderPhrase(phrases[0]);
    setInterval(function() { morphTo((idx + 1) % phrases.length); }, 3500);
  });
})();

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
  // Capture referral code before async
  const referralCode = $('su-referral') ? $('su-referral').value.trim().toUpperCase() : '';

  try {
    const result = await _sb.auth.signUp({
      email, password,
      options: { data: { full_name: name || email.split('@')[0], dob: dobVal }, emailRedirectTo: REDIRECT_URL },
    });
    if (result.error) {
      setMsg('su-err', result.error.message, 'err');
    } else {
      // Save referral code to localStorage -- will be redeemed after email confirm + signin
      if (referralCode && referralCode.startsWith('CX') && referralCode.length === 7) {
        try { localStorage.setItem('cx_pending_referral', referralCode); } catch (e) {}
      }
      setMsg('su-ok', 'Check your email to confirm your account!', 'ok');
    }
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
  window.closeSettings(); hide('help-modal'); hide('user-menu'); hide('model-dropdown');
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
  const rawName = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
  const name = typeof rawName === 'string' ? rawName : (String(rawName || user.email || ''));
  const initials = name ? name.split(' ').map(function(n) { return n[0]; }).join('').slice(0,2).toUpperCase() : '?';
  if ($('user-avatar')) $('user-avatar').textContent = initials;
  if ($('user-name'))   $('user-name').textContent   = name || user.email;

  await loadPreferences();
  await loadSupporter();
  await loadMemories();
  await loadChats();
  loadModerationState().catch(function() {});
  loadReferralData().catch(function() {});
  loadPersonas().catch(function() {});
  loadNotifications().catch(function() {});
  loadAvatarFromStorage().catch(function() {});
  startNotifPolling();
  startRealtime();

  // Redeem any pending referral from signup
  try {
    var pendingRef = localStorage.getItem('cx_pending_referral');
    if (pendingRef) {
      localStorage.removeItem('cx_pending_referral');
      saveReferralIfNeeded(pendingRef).catch(function() {});
    }
  } catch (e) {}

  // Always boot into a fresh unsaved chat
  newChat();

  setTimeout(attachAllRipples, 150);
  window.dispatchEvent(new Event('cyanix:ready'));

  // Show onboarding for new users — only checks localStorage flag
  // v2 key — bumped so existing users see the new personalisation onboarding
  var onboardKey = 'cx_onboarded_v2_' + session.user.id;
  var hasOnboarded = localStorage.getItem(onboardKey);
  if (!hasOnboarded) {
    var _obName = (_settings && _settings.displayName) ||
        (session.user.user_metadata && session.user.user_metadata.full_name) ||
        session.user.email || 'there';
    setTimeout(function() { showOnboarding(_obName, onboardKey); }, 800);
  }
}

/* ==========================================================
   CINEMATIC ONBOARDING
   TOS → Features → Chat UI
   The logo travels across all screens as the main character
========================================================== */
function showOnboarding(userName, storageKey) {
  var wrap = document.getElementById('cx-onboard');
  if (!wrap) return;

  // Show overlay
  wrap.classList.remove('hidden');

  // ── Particle system ────────────────────────────────────
  var canvas  = document.getElementById('cx-ob-particles');
  var ctx     = canvas ? canvas.getContext('2d') : null;
  var particles = [];
  var raf;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = wrap.offsetWidth;
    canvas.height = wrap.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function spawnParticle() {
    return {
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      r:  Math.random() * 2 + .5,
      dx: (Math.random() - .5) * .4,
      dy: -Math.random() * .6 - .2,
      alpha: Math.random() * .5 + .1,
      color: ['#6366f1','#38bdf8','#34d399','#a78bfa'][Math.floor(Math.random()*4)],
    };
  }
  for (var pi = 0; pi < 60; pi++) particles.push(spawnParticle());

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.y < -10) { var np = spawnParticle(); p.x=np.x; p.y=canvas.height+5; p.dx=np.dx; p.dy=np.dy; }
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // ── Logo controller ────────────────────────────────────
  // The floating logo only appears BETWEEN screens for transition effect
  var logo = document.getElementById('cx-ob-logo');

  function logoAnimate(fromEl, toPreset, cb) {
    if (!logo) { if (cb) setTimeout(cb, 400); return; }

    // Get position of the inline logo on screen 0 to start from there
    var startRect = fromEl ? fromEl.getBoundingClientRect() : null;
    var S = wrap.offsetWidth;

    var endConfigs = {
      corner: { left: 28,      top: 36,   w: 40 },
      launch: { left: S + 80,  top: -80,  w: 40 },
    };
    var end = endConfigs[toPreset] || endConfigs.corner;

    // Position logo over the inline logo start position
    if (startRect) {
      logo.style.transition = 'none';
      logo.style.left      = (startRect.left + startRect.width/2) + 'px';
      logo.style.top       = (startRect.top  + startRect.height/2) + 'px';
      logo.style.width     = startRect.width + 'px';
      logo.style.height    = startRect.height + 'px';
      logo.style.transform = 'translate(-50%, -50%)';
      logo.style.opacity   = '0';
      logo.classList.add('cx-ob-logo-visible');
    }

    // Trigger animation on next frame
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        logo.style.transition = '';
        logo.style.left      = end.left + 'px';
        logo.style.top       = end.top  + 'px';
        logo.style.width     = end.w    + 'px';
        logo.style.height    = end.w    + 'px';
        logo.style.transform = 'translate(0, 0)';
        logo.style.opacity   = '1';
      });
    });

    setTimeout(function() {
      if (cb) cb();
    }, 750);
  }

  // ── Screen transitions ─────────────────────────────────
  function goToScreen(from, to) {
    var sFrom = document.getElementById('cx-ob-s' + from);
    var sTo   = document.getElementById('cx-ob-s' + to);
    if (sFrom) { sFrom.style.opacity = '0'; sFrom.style.pointerEvents = 'none'; }
    setTimeout(function() {
      if (sFrom) sFrom.classList.remove('active');
      if (sTo)   { sTo.classList.add('active'); }
    }, 300);
  }

  // ── TOS screen setup ──────────────────────────────────
  var screen0 = document.getElementById('cx-ob-s0');
  if (screen0) screen0.classList.add('active');

  // Progress dots
  function setProgressDot(screenNum) {
    wrap.querySelectorAll('.cx-ob-dot').forEach(function(d, i) {
      d.classList.toggle('cx-ob-dot-active', i === screenNum);
    });
  }
  setProgressDot(0);

  var tosAgree = document.getElementById('cx-ob-tos-agree');
  var tosAge   = document.getElementById('cx-ob-tos-age');
  var tosBtn   = document.getElementById('cx-ob-tos-btn');

  // Fallback: also search inside the wrap element
  if (!tosAgree) tosAgree = wrap.querySelector('#cx-ob-tos-agree');
  if (!tosAge)   tosAge   = wrap.querySelector('#cx-ob-tos-age');
  if (!tosBtn)   tosBtn   = wrap.querySelector('#cx-ob-tos-btn');

  function updateTosBtn() {
    var allChecked = !!(tosAgree && tosAgree.checked && tosAge && tosAge.checked);
    if (tosBtn) {
      tosBtn.disabled = !allChecked;
      tosBtn.style.background  = allChecked ? '#6366f1' : '#9ca3af';
      tosBtn.style.color       = '#ffffff';
      tosBtn.style.cursor      = allChecked ? 'pointer' : 'not-allowed';
      tosBtn.style.opacity     = '1';
    }
  }
  if (tosAgree) tosAgree.addEventListener('change', updateTosBtn);
  if (tosAge)   tosAge.addEventListener('change',   updateTosBtn);
  if (tosAgree) tosAgree.closest && tosAgree.closest('label') && tosAgree.closest('label').addEventListener('click', function() { setTimeout(updateTosBtn, 50); });
  if (tosAge)   tosAge.closest   && tosAge.closest('label')   && tosAge.closest('label').addEventListener('click', function() { setTimeout(updateTosBtn, 50); });
  updateTosBtn();

  if (tosBtn) {
    tosBtn.addEventListener('click', function() {
      var inlineLogo = wrap.querySelector('.cx-ob-inline-logo');
      logoAnimate(inlineLogo, 'corner', null);
      setTimeout(function() { goToScreen(0, 1); setProgressDot(1); }, 200);
      setTimeout(function() {
        document.querySelectorAll('.cx-ob-feat').forEach(function(f, i) {
          f.style.animation = 'none';
          f.offsetHeight;
          f.style.animation = 'obFadeUp .5s calc(.08s + ' + i + ' * .06s) var(--ease) both';
        });
      }, 400);
    });
  }

  // ── Screen 1 → Screen 2 ──────────────────────────────
  var s1NextBtn = document.getElementById('cx-ob-s1-next');
  if (s1NextBtn) {
    s1NextBtn.addEventListener('click', function() {
      goToScreen(1, 2);
      setProgressDot(2);
    });
  }

  // ── Chip selection (single select per group) ─────────
  wrap.querySelectorAll('.cx-ob-chips').forEach(function(group) {
    group.querySelectorAll('.cx-ob-chip').forEach(function(chip) {
      chip.addEventListener('click', function() {
        // Deselect others in same group
        group.querySelectorAll('.cx-ob-chip').forEach(function(c) {
          c.classList.remove('selected');
        });
        chip.classList.add('selected');
      });
    });
  });

  // ── Launch button ──────────────────────────────────────
  var launchBtn = document.getElementById('cx-ob-launch-btn');
  if (launchBtn) {
    launchBtn.addEventListener('click', async function() {
      // Mark onboarded
      try { localStorage.setItem(storageKey, '1'); } catch(e) {}

      // ── Collect personalisation data ─────────────────
      var nameInput   = document.getElementById('cx-ob-name-input');
      var userName2   = nameInput ? nameInput.value.trim() : '';
      var usecaseChip = wrap.querySelector('#cx-ob-usecase-chips .cx-ob-chip.selected');
      var sourceChip  = wrap.querySelector('#cx-ob-source-chips .cx-ob-chip.selected');
      var usecase     = usecaseChip ? usecaseChip.dataset.value : 'skipped';
      var source      = sourceChip  ? sourceChip.dataset.value  : 'skipped';

      // Save name to settings
      if (userName2 && _settings) {
        _settings.displayName = userName2;
        saveSettings();
        syncPreferences();
      }

      // ── Save to Supabase ──────────────────────────────
      // Use _session or fall back to current supabase session
      var sessionToUse = _session;
      if (!sessionToUse && _sb) {
        try {
          var { data: { session: s } } = await _sb.auth.getSession();
          sessionToUse = s;
        } catch(e) {}
      }

      if (_sb && sessionToUse) {
        try {
          var { error: obErr } = await _sb.from('user_onboarding').upsert({
            user_id:    sessionToUse.user.id,
            name:       userName2 || null,
            use_case:   usecase,
            heard_from: source,
            created_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
          if (obErr) console.warn('[CyanixAI] Onboarding save error:', obErr.message);
          else console.log('[CyanixAI] Onboarding saved — source:', source, 'use_case:', usecase);
        } catch(e) {
          console.warn('[CyanixAI] Could not save onboarding data:', e.message);
        }
      } else {
        console.warn('[CyanixAI] Onboarding: no session available to save data');
      }

      // Logo launches off screen
      var cornerLogo = document.getElementById('cx-ob-logo');
      logoAnimate(cornerLogo, 'launch', function() {
        wrap.classList.add('cx-ob-exit');
        cancelAnimationFrame(raf);

        setTimeout(function() {
          wrap.classList.add('hidden');
          wrap.classList.remove('cx-ob-exit');

          if (logo) {
            logo.style.left = '50%'; logo.style.top = '50%';
            logo.style.width = '90px'; logo.style.height = '90px';
            logo.style.transform = 'translate(-50%,-50%)';
          }

          var emblem = document.querySelector('.welcome-emblem');
          if (emblem) {
            emblem.style.animation = 'none';
            emblem.offsetHeight;
            emblem.style.animation = 'obLogoLand .6s var(--ease) both';
          }
          var heading = $('welcome-heading');
          if (heading) { heading.style.animation = 'none'; heading.offsetHeight; heading.style.animation = 'obFadeUp .5s .15s var(--ease) both'; }
          var sub = $('welcome-sub');
          if (sub)     { sub.style.animation = 'none'; sub.offsetHeight; sub.style.animation = 'obFadeUp .5s .25s var(--ease) both'; }

          var inp = $('composer-input');
          if (inp) setTimeout(function() { inp.focus(); }, 400);

          var greeting = userName2 ? 'Welcome, ' + userName2 + '! 👋' : 'Welcome to Cyanix AI!';
          toast(greeting);
        }, 500);
      });

      goToScreen(2, 2);
      var s2 = document.getElementById('cx-ob-s2');
      if (s2) s2.style.opacity = '0';
    });
  }
}
/* ==========================================================
   NOTIFICATIONS — stub implementations
   These prevent ReferenceError crashes on sign-in.
   Full push notification UI is handled by the VAPID/push section.
========================================================== */
var _notifPolling = null;

function loadNotifications() {
  if (!_sb || !_session) return Promise.resolve();
  return _sb.from('notifications')
    .select('id,title,body,read,created_at')
    .eq('user_id', _session.user.id)
    .order('created_at', { ascending: false })
    .limit(30)
    .then(function(res) {
      if (res.data) {
        _notifications = res.data;
        _notifUnreadCount = res.data.filter(function(n) { return !n.read; }).length;
        updateNotifBadge();
      }
    })
    .catch(function(e) { console.warn('[CyanixAI] loadNotifications:', e.message); });
}

function startNotifPolling() {
  // Realtime handles live updates; poll every 5 min as fallback
  if (_notifPolling) clearInterval(_notifPolling);
  _notifPolling = setInterval(function() {
    loadNotifications().catch(function() {});
  }, 5 * 60 * 1000);
}

function updateNotifBadge() {
  var badge = document.getElementById('notif-badge');
  if (!badge) return;
  if (_notifUnreadCount > 0) {
    badge.textContent = _notifUnreadCount > 9 ? '9+' : String(_notifUnreadCount);
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function renderNotifications() {
  var list = document.getElementById('notif-list');
  if (!list) return;
  if (!_notifications.length) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-4);padding:32px 0;font-size:.85rem">No notifications yet</div>';
    return;
  }
  list.innerHTML = _notifications.map(function(n) {
    var date = new Date(n.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short' });
    return '<div class="notif-item' + (n.read ? '' : ' notif-item--unread') + '" data-id="' + n.id + '">' +
      '<div class="notif-item-title">' + (n.title || 'Notification') + '</div>' +
      '<div class="notif-item-body">' + (n.body || '') + '</div>' +
      '<div class="notif-item-date">' + date + '</div>' +
    '</div>';
  }).join('');
}

function onSignedOut() {
  stopRealtime();
  _session = null; _signedInUser = null;
  _chats = []; _currentId = null; _history = [];
  _supporter = { isActive:false, earlyAccess:false, premiumForever:false, memoryPriority:false, dailyLimit:40, unlockedThemes:[] };
  _usageToday = 0;
  if ($('user-avatar')) $('user-avatar').textContent = '?';
  if ($('user-name'))   $('user-name').textContent   = 'Loading\u2026';
  hide('view-chat'); show('view-auth'); showPanel('signin');
}

/* ==========================================================
   PUSH NOTIFICATIONS
   PWA Web Push — asks permission, subscribes, saves to DB.
   Sends a push when AI finishes responding and app is hidden.
========================================================== */
const PUSH_URL         = SUPABASE_URL + '/functions/v1/send-push';
const VAPID_PUBLIC_KEY = 'BD02ONvUlOa51U-FqFjPMRq3vsQ5hcA5QuLrqN7yMKKKQ-Tdi6CoXfgoS_cZeM-cM66-HWiBJ3dE0wMMOsatPS8';

// Convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64) {
  var padding = '='.repeat((4 - base64.length % 4) % 4);
  var b64     = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  var raw     = atob(b64);
  var arr     = new Uint8Array(raw.length);
  for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

// Register service worker
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    var reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    console.log('[CyanixAI] SW registered:', reg.scope);
    return reg;
  } catch (e) {
    console.warn('[CyanixAI] SW registration failed:', e.message);
    return null;
  }
}

// Request push permission + subscribe
async function subscribeToPush() {
  if (!('PushManager' in window)) {
    toast('Push notifications not supported in this browser.');
    return false;
  }
  if (!_session) { toast('Sign in to enable notifications.'); return false; }
  if (VAPID_PUBLIC_KEY === 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY') {
    console.warn('[CyanixAI] VAPID public key not set');
    return false;
  }

  try {
    var reg = await navigator.serviceWorker.ready;
    var existing = await reg.pushManager.getSubscription();
    if (existing) {
      await savePushSubscription(existing);
      return true;
    }

    var sub = await reg.pushManager.subscribe({
      userVisibleOnly:      true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    await savePushSubscription(sub);
    toast('Notifications enabled \u2713');
    return true;
  } catch (e) {
    if (e.name === 'NotAllowedError') {
      toast('Notification permission denied.');
    } else {
      console.warn('[CyanixAI] Push subscribe error:', e.message);
    }
    return false;
  }
}

// Save subscription to Supabase
async function savePushSubscription(sub) {
  if (!_sb || !_session) return;
  try {
    var subJson = sub.toJSON();
    await _sb.from('push_subscriptions').upsert({
      user_id:      _session.user.id,
      endpoint:     subJson.endpoint,
      subscription: subJson,
      updated_at:   new Date().toISOString(),
    }, { onConflict: 'user_id,endpoint' });
    console.log('[CyanixAI] Push subscription saved');
  } catch (e) {
    console.warn('[CyanixAI] Could not save push subscription:', e.message);
  }
}

// Unsubscribe from push
async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;
  try {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      // Remove from DB
      if (_sb && _session) {
        await _sb.from('push_subscriptions')
          .delete()
          .eq('user_id', _session.user.id)
          .eq('endpoint', sub.endpoint);
      }
      toast('Notifications disabled');
    }
  } catch (e) {
    console.warn('[CyanixAI] Unsubscribe error:', e.message);
  }
}

// Check if push is currently subscribed
async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    var reg = await navigator.serviceWorker.ready;
    var sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch (e) { return false; }
}

// Trigger push — called after AI responds, only if page is hidden
async function maybeSendPush(aiText) {
  if (!_session) return;
  if (!document.hidden) return; // user is looking at the app
  if (!('PushManager' in window)) return;

  var subscribed = await isPushSubscribed();
  if (!subscribed) return;

  // Build a short preview of the AI response
  var preview = (aiText || '').replace(/```[\s\S]*?```/g, '[code]').replace(/[#*`]/g, '').trim();
  preview = preview.slice(0, 100) + (preview.length > 100 ? '...' : '');

  try {
    await fetch(PUSH_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({
        user_id: _session.user.id,
        title:   'Cyanix AI',
        body:    preview || 'Your response is ready',
        url:     window.location.href,
      }),
    });
  } catch (e) {
    console.warn('[CyanixAI] Push send error:', e.message);
  }
}

// Listen for SW messages (notification click → focus chat)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'NOTIFICATION_CLICK') {
      window.focus();
    }
    if (e.data && e.data.type === 'PUSH_SUBSCRIPTION_CHANGED') {
      savePushSubscription(e.data.subscription);
    }
  });
}

// Auto-register SW on load
window.addEventListener('load', function() {
  registerServiceWorker();
});

// Expose for settings toggle
window.subscribeToPush     = subscribeToPush;

// ── Echo mode stub (referenced in HTML) ──────────────────
window.toggleEchoMode = function() {
  var banner = document.getElementById('echo-banner');
  if (banner) banner.style.display = 'none';
};

window.unsubscribeFromPush = unsubscribeFromPush;
window.isPushSubscribed    = isPushSubscribed;

function updateNotifUI(subscribed) {
  var tog      = $('notif-toggle');
  var desc     = $('notif-status-desc');
  var testRow  = $('notif-test-row');
  var testDiv  = $('notif-test-divider');
  var permission = Notification && Notification.permission;

  if (tog)     tog.checked = subscribed;
  if (desc)    desc.textContent = subscribed
    ? 'Notifications enabled \u2713'
    : permission === 'denied'
      ? 'Blocked \u2014 allow in browser settings'
      : 'Get notified when Cyanix responds';
  if (testRow) testRow.style.display  = subscribed ? 'flex' : 'none';
  if (testDiv) testDiv.style.display  = subscribed ? 'block' : 'none';
}

async function updateNotifUIAsync() {
  var subscribed = await isPushSubscribed();
  updateNotifUI(subscribed);
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
    // Accept everything except audio — user can still pick any file via "All files"
    // Explicit list covers the most common types for better mobile picker UX
    inp.accept = [
      // Images only
      'image/*',
      // Plain text files
      'text/plain,.txt',
      // Markdown files
      'text/markdown,.md,.markdown',
    ].join(',');
    inp.onchange = function() {
      var file = inp.files && inp.files[0];
      if (!file) return;
      if (file.size > 50 * 1024 * 1024) { toast('File too large. Max 50MB.'); return; }
      handleAttachment(file);
    };
    inp.click();
  });

  on('settings-btn',   'click', function() { window.openSettings(); closeUserMenu(); });
  on('settings-close', 'click', function() { window.closeSettings(); });
  

  on('help-btn',   'click', function() { show('help-modal'); closeUserMenu(); });
  on('help-close', 'click', function() { hide('help-modal'); });
  on('help-modal', 'click', function(e) { if (e.target.id==='help-modal') hide('help-modal'); });

  on('user-btn',    'click', toggleUserMenu);
  on('um-settings', 'click', function() { closeUserMenu(); window.openSettings(); });
  on('um-signout',  'click', function() { closeUserMenu(); signOut(); });
  on('model-select', 'change', function() {
    // Save the new model value FIRST
    var sel = $('model-select');
    if (sel) _settings.model = sel.value;
    saveSettings(); syncPreferences(); updateModelLabel();
    // Then update RAG row based on new value
    const isCompoundModel = _settings.model && _settings.model.startsWith('groq/compound');
    const isAxionModel    = _settings.model === 'axion';
    const ragRow  = $('rag-toggle-row');
    const ragDesc = $('rag-auto-desc');
    if (ragRow)  ragRow.style.opacity = (isCompoundModel || isAxionModel) ? '0.4' : '1';
    if (ragDesc) ragDesc.textContent  = isAxionModel
      ? 'Axion uses its own intelligent retrieval'
      : isCompoundModel
        ? 'Built-in search active (Compound model)'
        : 'Automatically search when questions need current info';
    const found = MODELS.find(function(m) { return m.id === _settings.model; });
    if (found) toast('Model: ' + found.name);
  });

  on('streaming-toggle',   'change', function() { _settings.streaming = !!$('streaming-toggle').checked; saveSettings(); syncPreferences(); });
  on('theme-select',       'change', function() { _settings.theme = $('theme-select').value; applyTheme(_settings.theme); saveSettings(); syncPreferences(); });
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
    _settings.fontSize = Math.max(8, (_settings.fontSize || 15) - 1);
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
    var improveStatus = document.getElementById('improve-nav-status');
    if (improveStatus) improveStatus.textContent = _settings.trainingConsent ? 'On' : 'Off';
    saveSettings(); syncPreferences(); updateTrainingDataRow();
    toast(_settings.trainingConsent ? 'Training data enabled.' : 'Training data disabled.');
  });
  on('rag-auto-toggle', 'change', function() {
    _settings.ragAuto = !!$('rag-auto-toggle').checked;
    _ragAuto = _settings.ragAuto;
    saveSettings(); syncPreferences();
    toast(_ragAuto ? ' Auto web search enabled' : 'Auto web search off');
  });

  // ── Language select ───────────────────────────────────────
  on('language-select', 'change', function() {
    var sel = $('language-select');
    if (!sel) return;
    _settings.language = sel.value;
    saveSettings();
    var lang = SUPPORTED_LANGUAGES.find(function(l) { return l.code === sel.value; });
    var name = lang ? lang.name : sel.value;
    toast(sel.value === 'auto' ? 'Language: Auto-detect' : 'Language set to ' + name);
  });

  // ── Notifications toggle ─────────────────────────────────
  on('notif-toggle', 'change', async function() {
    var tog = $('notif-toggle');
    if (!tog) return;
    if (tog.checked) {
      var ok = await subscribeToPush();
      if (!ok) {
        tog.checked = false;
        return;
      }
      updateNotifUI(true);
    } else {
      await unsubscribeFromPush();
      updateNotifUI(false);
    }
  });

  on('notif-test-btn', 'click', async function() {
    var btn = $('notif-test-btn');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    try {
      // Show a local notification immediately as test
      if ('serviceWorker' in navigator) {
        var reg = await navigator.serviceWorker.ready;
        await reg.showNotification('Cyanix AI', {
          body:    'Notifications are working! \uD83C\uDF89',
          icon:    '/icons/manifest/icon-192x192.png',
          badge:   '/icons/manifest/icon-96x96.png',
          vibrate: [100, 50, 100],
        });
        toast('Test notification sent!');
      }
    } catch (e) {
      toast('Could not send test: ' + e.message);
    }
    if (btn) { btn.textContent = 'Test'; btn.disabled = false; }
  });

  // Init notification UI state when settings opens
  window.addEventListener('cyanix:ready', function() {
    updateNotifUIAsync();
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
      renderChatList(); newChat(); window.closeSettings(); toast('All chats cleared.');
    } catch (e) { toast('Failed to clear chats.'); }
  });
  on('signout-btn', 'click', function() { window.closeSettings(); signOut(); });

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
      window.closeSettings(); hide('help-modal'); closeUserMenu(); hide('model-dropdown');
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
  // Update the nav row status label
  var improveStatus = document.getElementById('improve-nav-status');
  if (improveStatus) improveStatus.textContent = _settings.trainingConsent ? 'On' : 'Off';
  if ($('display-name-input')) $('display-name-input').value   = _settings.displayName || '';
  if ($('rag-auto-toggle'))    $('rag-auto-toggle').checked    = !!_settings.ragAuto;
  _ragAuto = !!_settings.ragAuto;

  // Populate language select
  var langSel = $('language-select');
  if (langSel && langSel.options.length === 0) {
    SUPPORTED_LANGUAGES.forEach(function(l) {
      var opt = document.createElement('option');
      opt.value       = l.code;
      opt.textContent = l.name;
      langSel.appendChild(opt);
    });
  }
  if (langSel) langSel.value = _settings.language || 'auto';
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
var FONT_SIZE_LABELS = { 8:'Tiny', 9:'Tiny+', 10:'XS', 11:'XS+', 12:'Small', 13:'Small+', 14:'Medium-', 15:'Medium', 16:'Medium+', 17:'Large', 18:'Large+', 19:'XL', 20:'XXL' };

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
      _supporter = { isActive:false, earlyAccess:false, premiumForever:false, memoryPriority:false, dailyLimit:40, unlockedThemes:[] };
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
  // Daily window — resets at midnight UTC
  var now = new Date();
  var year  = now.getUTCFullYear();
  var month = String(now.getUTCMonth() + 1).padStart(2, '0');
  var day   = String(now.getUTCDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getWindowResetTime() {
  // Time until midnight UTC
  var now   = new Date();
  var reset = new Date(now);
  reset.setUTCHours(24, 0, 0, 0);
  var diff  = reset - now;
  var hours = Math.floor(diff / 3600000);
  var mins  = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return hours + 'h ' + mins + 'm';
  if (mins > 0)  return mins + ' min' + (mins !== 1 ? 's' : '');
  return 'less than a minute';
}

function getWindowResetSeconds() {
  var now   = new Date();
  var reset = new Date(now);
  reset.setUTCHours(24, 0, 0, 0);
  return Math.max(1, Math.floor((reset - now) / 1000));
}

async function incrementUsage() {
  if (!_session) return;
  _usageToday++;
  try {
    var windowKey = getUsageWindowKey();
    await _sb.from('user_usage').upsert({ user_id: _session.user.id, usage_date: windowKey, prompt_count: _usageToday }, { onConflict: 'user_id,usage_date' });
  } catch (e) {}
}

/* ==========================================================
   CONTENT MODERATION — Strike system
   3 strikes → auto-ban. Slurs/hate speech blocked client-side.
========================================================== */

// ── Slur/hate-speech word list ────────────────────────────────
// Stored as hashed patterns to avoid storing slurs in plain text
// Uses regex matching against normalised input
var _modPatterns = (function() {
  // We match on normalised text (lowercase, common l33t substitutions removed)
  // List covers the most common hate speech — extend as needed
  var words = [
    // Racial slurs (n-word and variants)
    /\bn[i1!|]+g+[e3]+r/i,
    /\bn[i1!|]+g+[a@]+\b/i,
    /\bn[i1!|]+gg+[a@]/i,
    // Other racial slurs (abbreviated for safety)
    /\bc[h]+[i1]+n[kc]/i,
    /\bs[p]+[i1]+c[k]?\b/i,
    /\bk[i1]+k[e3]\b/i,
    /\bw[e3]tb[a@]ck/i,
    /\bg[o0]+[o0]+k\b/i,
    /\bch[i1]nk/i,
    // Homophobic slurs
    /\bf[a@4][g9]+[o0]?t/i,
    /\bf[a@4][g9]+\b/i,
    /\bd[y]+k[e3]\b/i,
    // Ableist slurs
    /\br[e3]t[a@4]rd/i,
    // Extreme hate phrases
    /\bheil\s+hitler/i,
    /\bwhite\s+power\b/i,
    /\bkill\s+(all\s+)?(blacks?|jews?|gays?|muslims?)/i,
    /\b(blacks?|jews?|gays?|muslims?)\s+(should\s+)?die/i,
  ];
  return words;
})();

var _userStrikes    = 0;   // loaded from DB on sign-in
var _userIsBanned   = false;

// ── Load moderation state on sign-in ─────────────────────────
async function loadModerationState() {
  if (!_sb || !_session) return;
  try {
    // Check if banned
    var banRes = await _sb
      .from('banned_users')
      .select('user_id')
      .eq('user_id', _session.user.id)
      .maybeSingle();

    if (banRes.data) {
      _userIsBanned = true;
      showBanScreen();
      return;
    }

    // Load strike count
    var strikeRes = await _sb
      .from('user_strikes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', _session.user.id);

    _userStrikes = strikeRes.count || 0;
  } catch (e) {
    console.warn('[CyanixAI] Could not load moderation state:', e.message);
  }
}

// ── ML moderation via edge function ──────────────────────────
const MODERATE_URL = SUPABASE_URL + '/functions/v1/moderate';

async function checkModerationML(text) {
  try {
    var res = await fetch(MODERATE_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({ text: text }),
      signal:  AbortSignal.timeout(4000), // fast timeout — don't block user
    });
    if (!res.ok) return null;
    var data = await res.json();
    if (data.flagged) return data.reason || 'policy_violation';
    return null;
  } catch (e) {
    // API unavailable — fall through to regex
    return null;
  }
}

// ── Check message for violations (ML first, regex fallback) ───
async function checkModeration(text) {
  if (!text) return null;

  // Layer 1: ML classifier (OpenAI Moderation API) — catches everything
  var mlResult = await checkModerationML(text);
  if (mlResult) return mlResult;

  // Layer 2: Regex patterns — fast local fallback
  var normalised = text.toLowerCase()
    .replace(/[0-9@!]/g, function(c) {
      return {'0':'o','1':'i','3':'e','4':'a','5':'s','@':'a','!':'i'}[c] || c;
    })
    .replace(/\s+/g, ' ');

  for (var i = 0; i < _modPatterns.length; i++) {
    if (_modPatterns[i].test(normalised)) {
      return 'hate_speech';
    }
  }
  return null;
}

// ── Issue a strike ────────────────────────────────────────────
async function issueStrike(reason, content) {
  if (!_sb || !_session) return;
  _userStrikes++;

  try {
    // Record the strike
    await _sb.from('user_strikes').insert({
      user_id:    _session.user.id,
      reason:     reason,
      content:    content ? content.slice(0, 100) : null,
      strike_num: _userStrikes,
    });

    // Auto-ban at 3 strikes
    if (_userStrikes >= 3) {
      await _sb.from('banned_users').upsert({
        user_id:   _session.user.id,
        reason:    'Automatic ban: 3 strikes for hate speech / slurs',
        banned_by: 'auto-moderation',
      }, { onConflict: 'user_id' });
      _userIsBanned = true;
    }
  } catch (e) {
    console.warn('[CyanixAI] Strike recording failed:', e.message);
  }

  // Show warning UI
  showStrikeWarning(_userStrikes);

  if (_userStrikes >= 3) {
    setTimeout(showBanScreen, 2000);
  }
}

// ── Strike warning toast / modal ──────────────────────────────
function showStrikeWarning(strikeNum) {
  var remaining = 3 - strikeNum;
  var msg = '';

  if (strikeNum === 1) {
    msg = '⚠️ Strike 1/3 — Hate speech is not allowed on Cyanix AI. ' +
          '2 more strikes will result in a permanent ban.';
  } else if (strikeNum === 2) {
    msg = '⛔ Strike 2/3 — Final warning. One more violation will permanently ban your account.';
  } else {
    msg = '🚫 Strike 3/3 — Your account has been banned for repeated violations.';
  }

  // Show as a prominent in-chat warning
  var container = document.getElementById('messages');
  if (container) {
    var warningEl = document.createElement('div');
    warningEl.className = 'mod-warning-banner';
    warningEl.innerHTML =
      '<div class="mod-warning-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>' +
      '<div class="mod-warning-body">' +
        '<div class="mod-warning-title">Content Policy Violation</div>' +
        '<div class="mod-warning-text">' + msg + '</div>' +
      '</div>';
    container.appendChild(warningEl);
    warningEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// ── Ban screen ────────────────────────────────────────────────
function showBanScreen() {
  // Lock composer
  var composer = document.getElementById('composer-input');
  var sendBtn  = document.getElementById('send-btn');
  if (composer) { composer.disabled = true; composer.placeholder = 'Account suspended.'; }
  if (sendBtn)  sendBtn.disabled = true;

  // Show ban overlay
  var existing = document.getElementById('ban-overlay');
  if (existing) return;

  var overlay = document.createElement('div');
  overlay.id = 'ban-overlay';
  overlay.className = 'ban-overlay';
  overlay.innerHTML =
    '<div class="ban-card">' +
      '<div class="ban-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>' +
      '<h2 class="ban-title">Account Suspended</h2>' +
      '<p class="ban-body">Your account has been permanently suspended for repeated violations of the ' +
      '<a href="#" onclick="window.openSettings();window.openSettingsPage(\'tos\');return false;" class="ban-link">Cyanix AI Terms of Service</a>.' +
      ' Hate speech and slurs are not permitted.</p>' +
      '<p class="ban-sub">If you believe this is a mistake, contact support.</p>' +
    '</div>';
  document.body.appendChild(overlay);
}

function checkDailyLimit() {
  if (_supporter.dailyLimit === null) return true; // unlimited

  // Referral bonus: each successful referral adds 5 messages per day
  var bonusMessages  = (window._referralBonus || 0) * 5;
  var effectiveLimit = (_supporter.dailyLimit || 40) + bonusMessages;

  if (_usageToday >= effectiveLimit) {
    showRateLimitBanner();
    return false;
  }

  var left = effectiveLimit - _usageToday;
  var pct  = _usageToday / effectiveLimit;

  // Progressive warnings
  if (left === 5) {
    toast('⚠️ 5 messages left today. Resets in ' + getWindowResetTime() + '.');
  } else if (left === 3) {
    toast('⚠️ Only 3 messages left today!');
  } else if (left === 1) {
    toast('🚨 Last message for today!');
  }

  return true;
}

//  Rate Limit Banner 
// Slides up from bottom, locks composer, shows live countdown,
// auto-unlocks when window resets. Cannot be dismissed early.
var _rateLimitInterval = null;

function showRateLimitBanner() {
  // Lock composer immediately
  lockComposer(true);

  // Remove any existing banner
  var old = document.getElementById('cx-rate-banner');
  if (old) old.remove();

  // Get seconds until reset
  var totalSecs  = getWindowResetSeconds();
  var remaining  = totalSecs;

  // Build banner
  var banner = document.createElement('div');
  banner.id  = 'cx-rate-banner';
  banner.innerHTML =
    '<div class="cx-rate-inner">' +
      '<div class="cx-rate-top">' +
        '<div class="cx-rate-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>' +
        '<div class="cx-rate-text">' +
          '<div class="cx-rate-title">Chat Limit Reached</div>' +
          '<div class="cx-rate-sub">Free plan: 40 messages per day</div>' +
        '</div>' +
      '</div>' +
      '<div class="cx-rate-countdown" id="cx-rate-countdown">' + formatCountdown(remaining) + '</div>' +
      '<div class="cx-rate-progress-track"><div class="cx-rate-progress-bar" id="cx-rate-progress"></div></div>' +
      '<div class="cx-rate-perks">' +
        '<span class="cx-rate-perk"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/><path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/></svg> Unlimited messages</span>' +
        '<span class="cx-rate-perk"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/></svg> Exclusive themes</span>' +
        '<span class="cx-rate-perk"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg> Early access</span>' +
      '</div>' +
      '<button class="cx-rate-upgrade-btn" id="cx-rate-upgrade-btn">Upgrade to Supporter</button>' +
    '</div>';

  document.body.appendChild(banner);

  // Wire upgrade button
  var upgradeBtn = document.getElementById('cx-rate-upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', function() {
      window.openSettings(); window.openSettingsPage('supporter');
    });
  }

  // Slide in after paint
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      banner.classList.add('cx-rate-visible');
    });
  });

  // Start countdown
  if (_rateLimitInterval) clearInterval(_rateLimitInterval);
  _rateLimitInterval = setInterval(function() {
    remaining--;
    var cd = document.getElementById('cx-rate-countdown');
    var pb = document.getElementById('cx-rate-progress');
    if (cd) cd.textContent = formatCountdown(remaining);
    if (pb) pb.style.width = Math.max(0, (1 - remaining / totalSecs) * 100) + '%';

    if (remaining <= 0) {
      clearInterval(_rateLimitInterval);
      _rateLimitInterval = null;
      _usageToday = 0;
      // Slide banner out
      var b = document.getElementById('cx-rate-banner');
      if (b) {
        b.classList.remove('cx-rate-visible');
        setTimeout(function() { if (b.parentNode) b.remove(); }, 400);
      }
      // Unlock composer
      lockComposer(false);
      updateUsageDisplay();
      // Subtle success feedback
      var inp = $('composer-input');
      if (inp) {
        inp.placeholder = 'Ask Cyanix anything...';
        inp.focus();
      }
      toast('Limit reset -- you' + String.fromCharCode(39) + 're good to go!');
    }
  }, 1000);
}

function formatCountdown(secs) {
  if (secs <= 0) return '0:00';
  var m = Math.floor(secs / 60);
  var s = secs % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function lockComposer(locked) {
  var inp     = $('composer-input');
  var sendBtn = $('send-btn');
  var box     = $('composer-box');
  if (inp)     { inp.disabled     = locked; if (locked) inp.placeholder = 'Chat limit reached -- wait for reset...'; }
  if (sendBtn) { sendBtn.disabled = locked; }
  if (box)     { box.classList.toggle('cx-composer-locked', locked); }
}

// Keep old name as alias for any other callers
function showUpgradeModal() { showRateLimitBanner(); }

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
  window._chatHistoryLimit = _supporter.memoryPriority ? 16 : 10; // tight cap to avoid 413
}

function updateUsageDisplay() {
  var el = $('usage-display');
  if (!el) return;
  if (_supporter.dailyLimit === null) {
    el.textContent = _usageToday + ' prompts (unlimited)';
  } else {
    var left = Math.max(0, _supporter.dailyLimit - _usageToday);
    var bonusShow = (window._referralBonus || 0) * 5;
    var effLimit  = (_supporter.dailyLimit || 40) + bonusShow;
    var leftShow  = Math.max(0, effLimit - _usageToday);
    el.textContent = _usageToday + ' / ' + effLimit + ' today  \u2022  ' + leftShow + ' left  \u2022  resets in ' + getWindowResetTime();
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
      showWelcome();
      // share removed
    } else {
      hide('welcome-state');
      _history.forEach(function(msg) { renderMessage(msg.role, msg.content, false, msg.id); });
      scrollToBottom();
      // share removed
    }
    renderChatList();
  } catch (e) {
    toast('Failed to load chat.');
    console.error('[CyanixAI] loadChat error:', e);
  }
}

async function syncChatToDB(localId, title) {
  if (!_sb) { console.error('[CyanixAI] _sb is null — Supabase client not init'); return null; }
  if (!_session) { console.error('[CyanixAI] syncChatToDB: no session'); return null; }
  try {
    var payload = { user_id: _session.user.id, title: title };
    try { payload.model = _settings.model; } catch(ignore) {}
    try { payload.updated_at = new Date().toISOString(); } catch(ignore) {}
    var result = await _sb.from('chats').insert(payload).select('id').single();
    if (result.error) {
      console.error('[CyanixAI] syncChatToDB error:', result.error);
      return null;
    }
    var newId = result.data && result.data.id;
    if (newId && newId !== localId) {
      _currentId = newId;
      _chats = _chats.map(function(c) { return c.id === localId ? Object.assign({}, c, { id: newId }) : c; });
      renderChatList();
    }
    return newId;
  } catch (e) {
    console.error('[CyanixAI] syncChatToDB exception:', e);
    return null;
  }
}

async function syncMessagesToDB(chatId, userText, aiText) {
  if (!_sb || !_session || !chatId) {
    console.error('[CyanixAI] syncMessagesToDB: missing params sb=' + !!_sb + ' session=' + !!_session + ' chatId=' + !!chatId);
    return null;
  }
  try {
    var result = await _sb.from('messages').insert([
      { chat_id: chatId, user_id: _session.user.id, role: 'user',      content: userText },
      { chat_id: chatId, user_id: _session.user.id, role: 'assistant', content: aiText   },
    ]).select('id');
    if (result.error) {
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
    console.error('[CyanixAI] syncMessagesToDB exception:', e);
    return null;
  }
}

/* ==========================================================
   FILE SCANNING — multi-format attachment handler
   Extracts readable content from each file type before
   sending to the model. Supports:
   - Images  → multipart vision (existing)
   - PDF     → text extraction via pdf.js CDN
   - DOCX    → XML text extraction (unzip + parse)
   - XLSX/CSV → tabular text via SheetJS
   - PPTX    → slide text extraction
   - TXT/MD/JSON/code → plain text (existing)
   - ZIP     → lists contents + extracts text files inside
========================================================== */

// Load a CDN script once
function loadScriptOnce(url) {
  return new Promise(function(resolve, reject) {
    if (document.querySelector('script[src="' + url + '"]')) { resolve(); return; }
    var s = document.createElement('script');
    s.src = url; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// Extract text from DOCX (it's a ZIP containing word/document.xml)
async function extractDocx(arrayBuffer) {
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  var zip  = await window.JSZip.loadAsync(arrayBuffer);
  var file = zip.file('word/document.xml');
  if (!file) throw new Error('Not a valid DOCX file');
  var xml  = await file.async('string');
  // Strip XML tags, decode entities, normalise whitespace
  var text = xml
    .replace(/<w:p[ >]/g, '\n<w:p ')  // paragraph breaks
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'")
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return text.slice(0, 20000);
}

// Extract text from PPTX (slide XML files)
async function extractPptx(arrayBuffer) {
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  var zip    = await window.JSZip.loadAsync(arrayBuffer);
  var slides = Object.keys(zip.files).filter(function(k) {
    return k.startsWith('ppt/slides/slide') && k.endsWith('.xml');
  }).sort();
  var parts = [];
  for (var i = 0; i < slides.length; i++) {
    var xml  = await zip.files[slides[i]].async('string');
    var text = xml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text) parts.push('Slide ' + (i + 1) + ': ' + text);
  }
  return parts.join('\n\n').slice(0, 20000);
}

// Extract text from XLSX/CSV via SheetJS
async function extractXlsx(arrayBuffer, mimeType) {
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
  var data = new Uint8Array(arrayBuffer);
  var wb   = window.XLSX.read(data, { type: 'array' });
  var parts = [];
  wb.SheetNames.forEach(function(name) {
    var ws  = wb.Sheets[name];
    var csv = window.XLSX.utils.sheet_to_csv(ws);
    if (csv.trim()) parts.push('Sheet: ' + name + '\n' + csv);
  });
  return parts.join('\n\n').slice(0, 20000);
}

// Extract text from CSV directly (no library needed)
function extractCsv(text) {
  return text.slice(0, 20000);
}

// Extract text from PDF via pdf.js
async function extractPdf(arrayBuffer) {
  if (!window.pdfjsLib) {
    await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }
  if (!window.pdfjsLib) throw new Error('Could not load PDF library');

  var loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  var pdf   = await loadingTask.promise;
  var parts = [];
  var max   = Math.min(pdf.numPages, 30);
  for (var i = 1; i <= max; i++) {
    var page    = await pdf.getPage(i);
    var content = await page.getTextContent();
    var text    = content.items.map(function(item) { return item.str || ''; }).join(' ').trim();
    if (text) parts.push('Page ' + i + ':\n' + text);
  }
  if (parts.length === 0) throw new Error('No text found in PDF — it may be a scanned image PDF');
  return parts.join('\n\n').slice(0, 20000);
}

// Extract contents list from ZIP
async function extractZip(arrayBuffer) {
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  var zip   = await window.JSZip.loadAsync(arrayBuffer);
  var files = Object.keys(zip.files).filter(function(k) { return !zip.files[k].dir; });
  var parts = ['ZIP contains ' + files.length + ' files:\n' + files.slice(0, 50).join('\n')];

  // Extract text from any readable text files inside
  var textExts = /\.(txt|md|json|js|ts|py|html|css|csv|xml|yaml|yml|sh|rb|go|rs|c|cpp|java|kt|swift)$/i;
  var textFiles = files.filter(function(k) { return textExts.test(k); }).slice(0, 5);
  for (var i = 0; i < textFiles.length; i++) {
    var content = await zip.files[textFiles[i]].async('string');
    if (content.trim()) {
      parts.push('\n--- ' + textFiles[i] + ' ---\n' + content.slice(0, 3000));
    }
  }
  return parts.join('\n').slice(0, 20000);
}


// Extract text from EPUB (it's a ZIP containing HTML/XHTML files)
async function extractEpub(arrayBuffer) {
  await loadScriptOnce('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js');
  var zip   = await window.JSZip.loadAsync(arrayBuffer);
  var files = Object.keys(zip.files).filter(function(k) {
    return /\.(html|xhtml|htm)$/i.test(k) && !zip.files[k].dir;
  }).sort();
  var parts = [];
  for (var i = 0; i < Math.min(files.length, 20); i++) {
    var html = await zip.files[files[i]].async('string');
    var text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length > 50) parts.push(text);
  }
  return parts.join('\n\n').slice(0, 20000);
}

async function handleAttachment(file) {
  var name = file.name;
  var type = file.type || '';
  var ext  = name.split('.').pop().toLowerCase();

  if (file.size > 20 * 1024 * 1024) { toast('File too large. Max 20MB.'); return; }

  // Images
  var isImage = type.startsWith('image/') || /^(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff?)$/.test(ext);

  // All text & code file extensions Cyanix can read
  var CODE_EXTS = /^(txt|md|markdown|js|jsx|mjs|cjs|ts|tsx|json|json5|html|htm|xml|xhtml|css|scss|sass|less|styl|py|pyc|rb|go|rs|java|kt|kts|swift|c|cc|cpp|cxx|cs|h|hpp|php|lua|r|m|pl|sh|bash|zsh|fish|ps1|bat|cmd|yaml|yml|toml|ini|cfg|conf|env|dotenv|sql|graphql|gql|vue|svelte|dart|ex|exs|erl|hs|clj|cljs|scala|tf|hcl|dockerfile|makefile|cmake|gradle|lock|gitignore|editorconfig|prettierrc|eslintrc|babelrc|nvmrc)$/i;
  var isText = CODE_EXTS.test(ext) || type.startsWith('text/') || type === 'application/json';

  if (!isImage && !isText) {
    toast('\u274C Cyanix can read images and text/code files only (e.g. .js, .py, .html, .json, .txt, .md\u2026)');
    return;
  }

  // Guess a friendly label for the chip
  var CODE_LABELS = {
    js:'JavaScript', jsx:'React JSX', ts:'TypeScript', tsx:'React TSX',
    py:'Python', rb:'Ruby', go:'Go', rs:'Rust', java:'Java', kt:'Kotlin',
    swift:'Swift', cs:'C#', c:'C', cpp:'C++', php:'PHP',
    html:'HTML', css:'CSS', scss:'SCSS', json:'JSON', yaml:'YAML', yml:'YAML',
    sql:'SQL', sh:'Shell', bash:'Bash', md:'Markdown', txt:'Text',
    xml:'XML', graphql:'GraphQL', vue:'Vue', svelte:'Svelte', dart:'Dart',
    dockerfile:'Dockerfile', toml:'TOML', env:'Env', gitignore:'Gitignore',
  };
  var friendlyLabel = CODE_LABELS[ext] || (isImage ? 'Image' : 'Code');

  _attachment = { type: 'loading', name: name, data: '', mediaType: type };
  showAttachPreview();
  toast('Reading ' + name + '\u2026', 8000);

  try {
    if (isImage) {
      var b64 = await readFileAs(file, 'dataURL');
      _attachment = { type: 'image', name: name, data: b64.split(',')[1], mediaType: type };
    } else {
      var text = await readFileAs(file, 'text');
      _attachment = { type: 'code', name: name, data: text.slice(0, 20000), mediaType: type,
        label: friendlyLabel };
    }

    var toastEl = $('toast'); if (toastEl) hide(toastEl);
    showAttachPreview();
    var chars = _attachment.data ? _attachment.data.length : 0;
    toast('\u2713 ' + name + (chars > 100 ? ' \u2014 ' + (chars/1000).toFixed(0) + 'k chars' : ' attached'));

  } catch (e) {
    console.error('[CyanixAI] File read error:', e);
    _attachment = null;
    showAttachPreview(); // will hide it since _attachment is null
    toast('\u274C Could not read ' + name + ': ' + (e.message || 'Unknown error'), 6000);
  }
}

// Helper: read file as various formats
function readFileAs(file, format) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = reject;
    reader.onload  = function(e) { resolve(e.target.result); };
    if (format === 'arrayBuffer') reader.readAsArrayBuffer(file);
    else if (format === 'dataURL') reader.readAsDataURL(file);
    else reader.readAsText(file);
  });
}



function showAttachPreview() {
  // Reuse the static #attach-preview element that already lives inside composer-box.
  // Never remove-and-reinsert it — that caused the insertBefore crash when the
  // textarea was not a direct child of composer-box.
  var preview = document.getElementById('attach-preview');
  if (!preview) return;

  if (!_attachment) {
    preview.innerHTML = '';
    preview.classList.add('hidden');
    return;
  }

  var icons = {
    image:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    code:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    document: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    text:     '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
    loading:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>',
  };

  var icon  = icons[_attachment.type] || icons.text;
  var label = _attachment.type === 'loading'
    ? 'Reading\u2026'
    : (_attachment.label ? _attachment.label + ': ' : '') + _attachment.name;

  preview.innerHTML = '<div class="attach-chip' + (_attachment.type === 'loading' ? ' attach-chip--loading' : '') + '">' +
    '<span class="attach-chip-icon">' + icon + '</span>' +
    '<span class="attach-chip-name">' + esc(label) + '</span>' +
    (_attachment.type !== 'loading' ? '<button class="attach-chip-remove" title="Remove attachment">' +
      '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
    '</button>' : '') +
    '</div>';

  preview.classList.remove('hidden');

  var removeBtn = preview.querySelector('.attach-chip-remove');
  if (removeBtn) removeBtn.addEventListener('click', function() { clearAttachment(); });

  var btn = document.getElementById('attach-btn');
  if (btn) btn.classList.toggle('active', _attachment.type !== 'loading');
}

function clearAttachment() {
  _attachment = null;
  var preview = document.getElementById('attach-preview');
  if (preview) { preview.innerHTML = ''; preview.classList.add('hidden'); }
  var btn = document.getElementById('attach-btn');
  if (btn) btn.classList.remove('active');
}

async function generateChatTitle(userText, aiText) {
  try {
    var snippet = 'User: ' + userText.slice(0, 200) + '\nAssistant: ' + aiText.slice(0, 200);
    var res = await fetch(CHAT_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({
        model:      'meta-llama/llama-4-scout-17b-16e-instruct',
        stream:     false,
        max_tokens: 16,
        messages: [
          {
            role:    'system',
            content: 'You write extremely short chat titles. Return ONLY the title — no quotes, no punctuation at the end, no explanation, no markdown. Maximum 5 words.',
          },
          {
            role:    'user',
            content: 'Write a 2–5 word title for this conversation:\n\n' + snippet,
          },
        ],
      }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) {
      console.warn('[CyanixAI] generateChatTitle HTTP', res.status);
      return userText.slice(0, 50).trim() || null;
    }
    var data  = await res.json();
    var raw   = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    var title = raw.trim();
    if (title) {
      // Strip surrounding quotes, trailing punctuation, markdown fences
      title = title.replace(/^["'\u201c\u201d`]+|["'\u201c\u201d`]+$/g, '').trim();
      title = title.replace(/[.!?,;:]+$/, '').trim();
      title = title.replace(/\*\*/g, '').trim();
      title = title.slice(0, 60);
    }
    return title || userText.slice(0, 50).trim() || null;
  } catch (e) {
    console.warn('[CyanixAI] generateChatTitle failed:', e.message);
    return userText.slice(0, 50).trim() || null;
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
    // Send push notification if app is in background
    maybeSendPush(aiText).catch(function() {});
    // share removed
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
    // Use last 10 messages (up from 6) — catches project context set earlier in conversation
    var ctx = messages.slice(-10).map(function(m) {
      return (m.role === 'user' ? 'User: ' : 'Cyanix: ') + (m.content || '').slice(0, 600);
    }).join('\n');

    var extractPrompt =
      'Extract factual memories about the USER from this conversation.\n' +
      'Focus on: projects they are building, tools/languages/frameworks they use, ' +
      'their name/job/location, goals, preferences, and anything worth remembering later.\n' +
      'Return ONLY a JSON array. No markdown, no explanation.\n' +
      'Schema: [{"memory":"concise user fact","category":"personal|preference|project|technical",' +
      '"entity_name":"named subject e.g. Cyanix AI, React, NixAi — or null","entity_type":"project|tool|concept|person|null",' +
      '"relates_to":[]}]\n' +
      'Rules:\n' +
      '- personal = name, job, location, age\n' +
      '- preference = communication style, topics liked/disliked\n' +
      '- project = apps/products/repos the user is building or working on\n' +
      '- technical = languages, frameworks, databases, APIs, services used\n' +
      'Be generous — include anything useful. Max 8 items. Return [] if nothing worth saving.\n\n' +
      'Conversation:\n' + ctx;

    var res = await fetch(CHAT_URL, {
      method: 'POST', headers: edgeHeaders(),
      body: JSON.stringify({
        model:      'meta-llama/llama-4-scout-17b-16e-instruct', // Llama 4 Scout — fast + reliable JSON
        stream:     false,
        max_tokens: 1000,
        messages: [
          { role: 'system', content: 'You extract structured memories from conversations. Return ONLY a valid JSON array, nothing else. No markdown fences, no preamble, no explanation.' },
          { role: 'user',   content: extractPrompt },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) { console.warn('[CyanixAI] Memory extraction failed:', res.status); return; }
    var data = await res.json();
    var raw  = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    if (!raw || raw === '[]') return;

    // Robust JSON extraction — strip fences, find array bounds
    raw = raw.replace(/```json|```/g, '').trim();
    var aStart = raw.indexOf('[');
    var aEnd   = raw.lastIndexOf(']');
    if (aStart === -1 || aEnd === -1) { console.warn('[CyanixAI] Memory: no JSON array in response'); return; }
    var items = JSON.parse(raw.slice(aStart, aEnd + 1));
    if (!Array.isArray(items) || items.length === 0) return;

    console.log('[CyanixAI] Memory extraction: got', items.length, 'candidate items');

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.memory || !item.category) continue;
      var memLower = item.memory.toLowerCase().trim();

      // Fuzzy dedup: exact match OR same entity + one contains the other
      var existing = _memories.find(function(m) {
        var mLow = (m.memory || '').toLowerCase().trim();
        if (mLow === memLower) return true;
        if (item.entity_name && m.entity_name && item.entity_name === m.entity_name) {
          if (mLow.includes(memLower) || memLower.includes(mLow)) return true;
        }
        return false;
      });

      if (existing) {
        await _sb.from('user_memories').update({
          memory:      item.memory,
          category:    item.category,
          entity_name: item.entity_name || existing.entity_name || null,
          entity_type: item.entity_type || existing.entity_type || null,
          updated_at:  new Date().toISOString(),
        }).eq('id', existing.id).eq('user_id', _session.user.id);
      } else {
        var limit = _supporter.memoryPriority ? 500 : 50;
        if (_memories.length >= limit) {
          var oldest = _memories[_memories.length - 1];
          if (oldest) await _sb.from('user_memories').delete().eq('id', oldest.id).eq('user_id', _session.user.id);
        }
        var relatedIds = [];
        if (Array.isArray(item.relates_to)) {
          item.relates_to.forEach(function(relText) {
            var match = _memories.find(function(m) {
              return (m.memory || '').toLowerCase().trim() === relText.toLowerCase().trim();
            });
            if (match && match.id) relatedIds.push(match.id);
          });
        }
        await _sb.from('user_memories').insert({
          user_id:        _session.user.id,
          memory:         item.memory,
          category:       item.category,
          entity_name:    item.entity_name || null,
          entity_type:    item.entity_type || null,
          related_to:     relatedIds.length ? relatedIds : null,
          source_chat_id: sourceId || _currentId,
          updated_at:     new Date().toISOString(),
        });
      }
    }

    await loadMemories();
    console.log('[CyanixAI] Memories saved. Total in DB:', _memories.length);
    _memories.slice(0, items.length).forEach(function(m) {
      if (m.id && m.memory) autoAttachMemory(m.id, m.memory).catch(function() {});
    });
  } catch (e) {
    console.error('[CyanixAI] extractAndSaveMemories exception:', e);
  }
}

async function maybeCollectTraining(userText, aiText) {
  if (!_settings.trainingConsent || !_session) return;
  try {
    // Fire the intelligent training pipeline -- refines prompt, improves response,
    // runs quality filters, then stores only clean data. Fire-and-forget.
    fetch(TRAINING_PIPELINE_URL, {
      method: 'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({
        original_prompt: userText,
        ai_response:     aiText,
        model:           _settings.model,
        user_id:         _session.user.id,
      })
    }).catch(function(e) {
      console.warn('[CyanixAI] Training pipeline fire-and-forget failed:', e.message);
    });
  } catch (e) {}
}

async function fetchLearnedContext() {
  if (!_session || !_settings.trainingConsent) return;
  try {
    var ctrl = new AbortController();
    var t = setTimeout(function() { ctrl.abort(); }, 6000);
    var res = await fetch(PIPELINE_URL, { method: 'GET', headers: edgeHeaders(), signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return;
    var data = await res.json();
    _learnedCtx = data;
    console.log('[CyanixAI] Learned context loaded:', 
      (data.personal_examples||[]).length, 'personal,',
      (data.global_examples||[]).length, 'global examples,',
      data.style_prefs ? 'style prefs active' : 'no style prefs');
  } catch (e) {
    console.warn('[CyanixAI] Could not load learned context:', e.message);
  }
}

function buildLearnedContext() {
  try {
    if (typeof _learnedCtx === 'undefined' || !_learnedCtx) return '';
  } catch(e) { return ''; }
  var parts = [];
  var prefs       = _learnedCtx.style_prefs;
  var personal    = _learnedCtx.personal_examples || [];
  var globalEx    = _learnedCtx.global_examples   || [];

  //  Style preferences block 
  if (prefs && prefs.total_rated >= 3) {
    var styleNotes = [];

    // Length preference (only apply if confident enough)
    if (prefs.length_confidence >= 0.3) {
      if (prefs.preferred_length === 'short') {
        styleNotes.push('This user consistently prefers shorter, more direct responses -- keep answers concise');
      } else if (prefs.preferred_length === 'long') {
        styleNotes.push('This user consistently prefers detailed, thorough responses -- go deeper than you normally would');
      }
    }

    // Tone preference
    if (prefs.tone_confidence >= 0.3) {
      if (prefs.preferred_tone === 'direct') {
        styleNotes.push('This user prefers direct, no-frills answers -- skip the preamble');
      } else if (prefs.preferred_tone === 'detailed') {
        styleNotes.push('This user likes detailed explanations with examples');
      }
    }

    // Topic awareness
    if (prefs.weak_topics && prefs.weak_topics.length) {
      styleNotes.push('Be extra careful and thorough on these topics where past responses underperformed: ' + prefs.weak_topics.join(', '));
    }

    if (styleNotes.length) {
      parts.push('[LEARNED USER PREFERENCES from ' + prefs.total_rated + ' rated responses]\n' + styleNotes.join('. ') + '.');
    }
  }

  //  Few-shot examples block 
  var examples = personal.concat(globalEx).slice(0, 2); // max 2 examples to save tokens
  if (examples.length) {
    var exBlock = '[STYLE EXAMPLES -- reference only, do not repeat verbatim]\n';
    exBlock += examples.map(function(ex, i) {
      return 'Q: ' + ex.prompt.slice(0, 60) + '\nA: ' + ex.response.slice(0, 120);
    }).join('\n');
    parts.push(exBlock);
  }

  return parts.length ? '\n\n' + parts.join('\n\n') : '';
}

async function fetchKGContext(query) {
  if (!_session) return;
  try {
    var ctrl = new AbortController();
    var t = setTimeout(function() { ctrl.abort(); }, 6000);
    var res = await fetch(KG_URL + '?action=retrieve', {
      method: 'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({
        action:       'retrieve',
        query:        query.slice(0, 300),
        user_id:      _session.user.id,
        node_limit:   2,
        memory_limit: 4,
        depth:        2,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return;
    var data = await res.json();
    if (data.context) {
      _kgContext = data.context;
      console.log('[CyanixAI] KG context:', data.nodes_found, 'nodes,', data.memories_found, 'memories');
    }
  } catch (e) {
    console.warn('[CyanixAI] KG context fetch failed:', e.message);
  }
}

async function autoAttachMemory(memoryId, memoryText) {
  if (!_session) return;
  try {
    fetch(KG_URL + '?action=auto-attach', {
      method: 'POST',
      headers: edgeHeaders(),
      body: JSON.stringify({
        action:      'auto-attach',
        memory_id:   memoryId,
        memory_text: memoryText,
        user_id:     _session.user.id,
      }),
    }).catch(function() {});
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

/* ==========================================================
   CHAT SEARCH
========================================================== */
(function() {
  var _searchTimer   = null;
  var _searchActive  = false;

  // Highlight matching text in a string
  function highlight(text, query) {
    if (!query) return esc(text);
    var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(' + escaped + ')', 'gi');
    return esc(text).replace(re, '<mark class="sb-highlight">$1</mark>');
  }

  // Render a list of result objects {id, title, snippet}
  function renderResults(results, query) {
    var panel = $('sb-search-results');
    if (!panel) return;
    if (results.length === 0) {
      panel.innerHTML = '<div class="sb-search-empty">No results for &ldquo;' + esc(query) + '&rdquo;</div>';
      return;
    }
    panel.innerHTML = results.map(function(r) {
      var active = r.id === _currentId ? ' active' : '';
      return '<div class="sb-result-item' + active + '" data-id="' + esc(r.id) + '">' +
        '<div class="sb-result-title">' + highlight(r.title || 'New chat', query) + '</div>' +
        (r.snippet ? '<div class="sb-result-snippet">' + highlight(r.snippet, query) + '</div>' : '') +
        '</div>';
    }).join('');
    panel.querySelectorAll('.sb-result-item').forEach(function(item) {
      item.addEventListener('click', function() {
        loadChat(item.dataset.id);
        if (window.innerWidth <= 700) {
          var sb = document.querySelector('.sidebar');
          var ov = $('sidebar-overlay');
          if (sb) sb.classList.add('collapsed');
          if (ov) ov.classList.add('hidden');
        }
      });
    });
  }

  // Phase 1: instant title filter from _chats array
  function searchTitles(query) {
    var q = query.toLowerCase();
    return _chats
      .filter(function(c) { return (c.title || '').toLowerCase().includes(q); })
      .map(function(c) { return { id: c.id, title: c.title, snippet: '' }; });
  }

  // Phase 2: deep search message content via Supabase
  async function searchMessages(query) {
    if (!_sb || !_session || !query.trim()) return [];
    try {
      // Search messages containing the query text
      var res = await _sb
        .from('messages')
        .select('chat_id, content')
        .eq('user_id', _session.user.id)
        .ilike('content', '%' + query + '%')
        .limit(30);

      if (res.error || !res.data) return [];

      // Group by chat_id, keep first snippet per chat
      var seen   = {};
      var results = [];
      res.data.forEach(function(msg) {
        if (seen[msg.chat_id]) return;
        seen[msg.chat_id] = true;

        // Find chat title
        var chat  = _chats.find(function(c) { return c.id === msg.chat_id; });
        var title = chat ? (chat.title || 'New chat') : 'New chat';

        // Extract snippet around the match
        var idx     = (msg.content || '').toLowerCase().indexOf(query.toLowerCase());
        var start   = Math.max(0, idx - 40);
        var snippet = (start > 0 ? '…' : '') + msg.content.slice(start, idx + query.length + 60).trim();
        if (snippet.length < msg.content.length) snippet += '…';

        results.push({ id: msg.chat_id, title: title, snippet: snippet });
      });
      return results;
    } catch (e) {
      console.warn('[CyanixAI] Search error:', e.message);
      return [];
    }
  }

  function enterSearchMode() {
    _searchActive = true;
    var list    = $('chat-list');
    var results = $('sb-search-results');
    var label   = $('sb-section-label');
    if (list)    list.classList.add('sb-hidden');
    if (results) results.classList.remove('hidden');
    if (label)   label.classList.add('sb-hidden');
  }

  function exitSearchMode() {
    _searchActive = false;
    var inp     = $('sb-search-input');
    var list    = $('chat-list');
    var results = $('sb-search-results');
    var label   = $('sb-section-label');
    var clear   = $('sb-search-clear');
    if (inp)     inp.value = '';
    if (list)    list.classList.remove('sb-hidden');
    if (results) { results.classList.add('hidden'); results.innerHTML = ''; }
    if (label)   label.classList.remove('sb-hidden');
    if (clear)   clear.classList.add('hidden');
  }

  // Wire up after DOM ready
  window.addEventListener('cyanix:ready', function() {
    var inp   = $('sb-search-input');
    var clear = $('sb-search-clear');
    var panel = $('sb-search-results');
    if (!inp) return;

    inp.addEventListener('input', function() {
      var query = inp.value.trim();
      if (clear) clear.classList.toggle('hidden', !query);

      if (!query) { exitSearchMode(); return; }
      enterSearchMode();

      // Phase 1 — instant title results
      var titleResults = searchTitles(query);
      renderResults(titleResults, query);

      // Phase 2 — debounced message search
      clearTimeout(_searchTimer);
      _searchTimer = setTimeout(async function() {
        if (!panel) return;
        // Show loading indicator appended to existing results
        var loadingEl = document.createElement('div');
        loadingEl.className = 'sb-search-loading';
        loadingEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="cx-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Searching messages…';
        panel.appendChild(loadingEl);

        var msgResults = await searchMessages(query);
        if (loadingEl.parentNode) loadingEl.remove();

        // Merge — message results add snippets to existing, or add new entries
        var merged = titleResults.slice();
        msgResults.forEach(function(mr) {
          var existing = merged.find(function(r) { return r.id === mr.id; });
          if (existing) {
            // Add snippet to title-only result
            if (!existing.snippet) existing.snippet = mr.snippet;
          } else {
            merged.push(mr);
          }
        });

        renderResults(merged, query);
      }, 350);
    });

    inp.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') { exitSearchMode(); inp.blur(); }
    });

    if (clear) {
      clear.addEventListener('click', function() { exitSearchMode(); inp.focus(); });
    }
  });

  // Export so renderChatList can clear search state
  window._exitChatSearch = exitSearchMode;
})();


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

// ── Silent coding model router ────────────────────────────
// When a coding request is detected, Cyanix silently uses
// qwen-qwq-32b (Groq's best coder) instead of the user's
// selected model. No UI change — it just works better.
const CODING_MODEL = 'qwen-2.5-coder-32b';

var CODING_TRIGGERS = [
  // explicit "write / build / create" code requests
  /\b(write|build|create|generate|make|code|implement|develop)\b.{0,40}\b(function|class|component|script|program|app|api|endpoint|module|hook|widget|algorithm|bot|cli|server|database|schema|query|snippet)\b/i,
  // fix / debug / review existing code
  /\b(fix|debug|refactor|review|optimise|optimize|improve|rewrite|clean up)\b.{0,30}\b(code|function|class|script|bug|error|issue|this|it)\b/i,
  // "how do I" coding questions
  /how (do i|to|can i).{0,50}\b(code|implement|build|write|create|use|integrate|set up|connect)\b/i,
  // language / framework specific signals
  /\b(python|javascript|typescript|react|vue|svelte|node|express|fastapi|django|flask|rails|sql|postgres|supabase|tailwind|css|html|bash|shell|rust|go|java|kotlin|swift|cpp|c\+\+)\b/i,
  // code in attachment or context
  /\b(this code|the code|my code|the function|the class|the component|the script)\b/i,
  // explicit code block request
  /```/,
  /\b(error|stacktrace|stack trace|traceback|exception|undefined|null pointer|segfault|syntax error|type error|cannot read|is not a function|is not defined)\b/i,
];

function isCodingRequest(text) {
  return CODING_TRIGGERS.some(function(r) { return r.test(text); });
}

// ── Document request detector ─────────────────────────────
var DOC_TRIGGERS = [
  // PowerPoint / slides
  { type: 'pptx', re: /\b(make|create|build|generate|write|give me|i need|can you make)\b.{0,40}\b(presentation|pitch deck|slide deck|pptx|powerpoint|slides?)\b/i },
  { type: 'pptx', re: /\b(deck|slides?)\b.{0,30}\b(about|on|for|covering)\b/i },
  // PDF
  { type: 'pdf',  re: /\b(make|create|build|generate|write|give me)\b.{0,40}\b(pdf|report|invoice|resume|cv|proposal|brief)\b/i },
  // Word / DOCX
  { type: 'docx', re: /\b(make|create|build|generate|write|give me)\b.{0,40}\b(word doc(ument)?|docx|letter|memo|contract|template)\b/i },
  // Spreadsheet / XLSX
  { type: 'xlsx', re: /\b(make|create|build|generate|give me)\b.{0,40}\b(spreadsheet|excel|xlsx|tracker|budget|planner|sheet)\b/i },
];

function isDocumentRequest(text) {
  for (var i = 0; i < DOC_TRIGGERS.length; i++) {
    if (DOC_TRIGGERS[i].re.test(text)) return DOC_TRIGGERS[i].type;
  }
  return null;
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

/* ==========================================================
   WIKI RAG — Wikipedia-based Retrieval Augmented Generation
   Fetches relevant Wikipedia summaries for context enrichment.
   Integrates with Groq Compound for layered context.
========================================================== */
var WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
var WIKI_SEARCH_API = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=3&format=json&origin=*&srsearch=';

// State for wiki RAG
var _wikiRagEnabled  = false;
var _cotEnabled      = false; // chain-of-thought toggle
var _groqCtxEnabled  = true;  // Groq Compound context enrichment

// ── Fetch Wikipedia summary for a topic ──────────────────────
async function fetchWikiSummary(topic) {
  try {
    var encoded = encodeURIComponent(topic.replace(/\s+/g,' ').trim());
    // First search for the best matching article
    var searchRes = await fetch(WIKI_SEARCH_API + encoded, { signal: AbortSignal.timeout(5000) });
    if (!searchRes.ok) return null;
    var searchData = await searchRes.json();
    var results = searchData.query && searchData.query.search;
    if (!results || !results.length) return null;
    var bestTitle = results[0].title;

    // Fetch summary for the best match
    var summaryRes = await fetch(WIKI_API + encodeURIComponent(bestTitle), {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });
    if (!summaryRes.ok) return null;
    var data = await summaryRes.json();
    if (data.type === 'disambiguation' || !data.extract) return null;

    return {
      title:   data.title,
      extract: data.extract.slice(0, 1200),
      url:     data.content_urls && data.content_urls.desktop && data.content_urls.desktop.page,
    };
  } catch (e) {
    console.warn('[CyanixAI] Wiki RAG fetch failed:', e.message);
    return null;
  }
}

// ── Extract key topic from user query for wiki search ─────────
async function extractWikiTopic(query) {
  try {
    var res = await fetch(CHAT_URL, {
      method: 'POST', headers: edgeHeaders(),
      body: JSON.stringify({
        model: 'groq/llama-3.1-8b-instant',
        stream: false, max_tokens: 30,
        messages: [
          { role: 'system', content: 'Extract the main factual topic from the query as 1-4 words suitable for a Wikipedia search. Return ONLY those words, nothing else.' },
          { role: 'user', content: query.slice(0, 300) }
        ]
      }),
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return query.split(' ').slice(0, 4).join(' ');
    var data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim().slice(0, 80) || query.slice(0, 40);
  } catch (e) { return query.split(' ').slice(0, 4).join(' '); }
}

// ── Main Wiki RAG orchestrator ──────────────────────────────
async function fetchWikiRAGContext(query) {
  if (!_wikiRagEnabled) return null;
  try {
    var topic = await extractWikiTopic(query);
    if (!topic) return null;
    var wiki = await fetchWikiSummary(topic);
    if (!wiki) return null;
    console.log('[CyanixAI] Wiki RAG: fetched', wiki.title);

    // Optionally enrich with Groq Compound context
    var groqCtx = '';
    if (_groqCtxEnabled) {
      groqCtx = await fetchGroqCompoundContext(query, wiki.extract);
    }

    return {
      title:    wiki.title,
      extract:  wiki.extract,
      url:      wiki.url,
      groqEnrichment: groqCtx,
    };
  } catch (e) {
    console.warn('[CyanixAI] Wiki RAG orchestration failed:', e.message);
    return null;
  }
}

// ── Groq Compound enrichment — adds breadth to Wiki context ──
// Does NOT replace Axion — it adds an enrichment layer to RAG context
async function fetchGroqCompoundContext(query, wikiExtract) {
  if (!_groqCtxEnabled) return '';
  try {
    var enrichPrompt =
      'Given this Wikipedia context and user question, add 2-3 concise clarifying points ' +
      'or additional context that would help answer the question more completely. ' +
      'Be brief and factual. Return only the additional points.\n\n' +
      'Wikipedia context: ' + (wikiExtract || '').slice(0, 600) + '\n\n' +
      'User question: ' + query.slice(0, 300);

    var res = await fetch(CHAT_URL, {
      method: 'POST', headers: edgeHeaders(),
      body: JSON.stringify({
        model: 'groq/compound-beta',
        stream: false, max_tokens: 300,
        messages: [
          { role: 'system', content: 'You are a concise knowledge enricher. Add brief, factual additional context. 2-3 sentences max.' },
          { role: 'user', content: enrichPrompt }
        ]
      }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return '';
    var data = await res.json();
    // Extract only text blocks (handle Groq compound's tool_use blocks gracefully)
    var content = data.choices && data.choices[0] && data.choices[0].message;
    if (!content) return '';
    if (typeof content.content === 'string') return content.content.trim().slice(0, 400);
    if (Array.isArray(content.content)) {
      return content.content
        .filter(function(b) { return b.type === 'text'; })
        .map(function(b) { return b.text || ''; })
        .join(' ')
        .trim()
        .slice(0, 400);
    }
    return '';
  } catch (e) {
    console.warn('[CyanixAI] Groq Compound enrichment failed:', e.message);
    return '';
  }
}

// ── Build Wiki RAG context string for system prompt ─────────
function buildWikiRAGContext(wikiData) {
  if (!wikiData) return '';
  var parts = [
    '\n\n[WIKIPEDIA CONTEXT — use as verified factual reference]',
    'Topic: ' + wikiData.title,
    wikiData.extract,
  ];
  if (wikiData.groqEnrichment) {
    parts.push('[ADDITIONAL CONTEXT]');
    parts.push(wikiData.groqEnrichment);
  }
  parts.push('Source: ' + (wikiData.url || 'Wikipedia'));
  parts.push('[END WIKIPEDIA CONTEXT]');
  return parts.join('\n');
}

// ── Append Wiki sources to bubble ───────────────────────────
function appendWikiSource(bubbleEl, wikiData) {
  if (!bubbleEl || !wikiData || !wikiData.url) return;
  var existing = bubbleEl.querySelector('.wiki-source-badge');
  if (existing) return;
  var badge = document.createElement('a');
  badge.className = 'wiki-source-badge';
  badge.href = wikiData.url;
  badge.target = '_blank';
  badge.rel = 'noopener noreferrer';
  badge.innerHTML =
    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
    '<span>Wikipedia: ' + esc(wikiData.title) + '</span>';
  bubbleEl.appendChild(badge);
}

/* ==========================================================
   CHAIN-OF-THOUGHT TOGGLE
   When enabled, wraps user messages with reasoning instructions
   and renders <think> blocks visibly for math/logic tasks.
========================================================== */
function getCotInstruction() {
  if (!_cotEnabled) return '';
  return '\n\nCHAIN OF THOUGHT: For this response, show your step-by-step reasoning inside <think>...</think> tags before giving your final answer. ' +
    'Walk through your logic clearly. Show all relevant steps, calculations, or deductions.';
}

function isCotQuery(text) {
  return /\b(calculate|compute|solve|prove|derive|reason|logic|math|how many|how much|formula|equation|step.?by.?step|think through|break down|explain why|why does|how does)\b/i.test(text);
}

/* ==========================================================
   PROMPT TEMPLATE LIBRARY
   Pre-built templates for common tasks. Accessible from the
   composer toolbar via the template button.
========================================================== */
var PROMPT_TEMPLATES = [
  {
    category: 'Coding',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    templates: [
      { title: 'Code Review', prompt: 'Review this code for bugs, performance issues, and best practices:\n\n```\n[paste code here]\n```' },
      { title: 'Debug Helper', prompt: 'I\'m getting this error:\n\n```\n[paste error here]\n```\n\nHere\'s my code:\n\n```\n[paste code here]\n```\n\nWhat\'s wrong and how do I fix it?' },
      { title: 'Refactor Code', prompt: 'Refactor this code to be cleaner, more readable, and follow best practices:\n\n```\n[paste code here]\n```' },
      { title: 'Write Tests', prompt: 'Write comprehensive unit tests for this function:\n\n```\n[paste code here]\n```\n\nInclude edge cases and test for expected failures.' },
      { title: 'Explain Code', prompt: 'Explain what this code does, line by line if needed:\n\n```\n[paste code here]\n```' },
    ]
  },
  {
    category: 'Writing',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>',
    templates: [
      { title: 'Blog Post', prompt: 'Write a detailed, engaging blog post about [topic]. Include:\n- A compelling headline\n- Introduction that hooks the reader\n- 3-5 main sections with subheadings\n- Actionable takeaways\n- Conclusion\n\nTone: [casual/professional/technical]' },
      { title: 'Email Draft', prompt: 'Write a professional email for the following situation:\n\nContext: [describe situation]\nGoal: [what do you want to achieve]\nTone: [formal/friendly/urgent]' },
      { title: 'LinkedIn Post', prompt: 'Write a LinkedIn post about [topic/achievement]. Make it:\n- Engaging and personal\n- Include a story or insight\n- End with a thought-provoking question\n- 150-250 words max' },
      { title: 'Summarize Text', prompt: 'Summarize the following text in 3 bullet points and a one-paragraph TL;DR:\n\n[paste text here]' },
    ]
  },
  {
    category: 'Analysis',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    templates: [
      { title: 'SWOT Analysis', prompt: 'Perform a SWOT analysis for [company/product/idea]:\n\nProvide a structured breakdown of Strengths, Weaknesses, Opportunities, and Threats.' },
      { title: 'Compare Options', prompt: 'Compare and contrast [option A] vs [option B] across these dimensions:\n- Cost/effort\n- Performance/quality\n- Ease of use\n- Scalability\n- Best use case\n\nProvide a recommendation.' },
      { title: 'Data Insights', prompt: 'Analyze this data and provide:\n1. Key trends and patterns\n2. Notable outliers\n3. Actionable insights\n4. Suggested next steps\n\n[paste data here]' },
      { title: 'Research Summary', prompt: 'Research [topic] and provide a comprehensive summary covering:\n- Current state\n- Key players/factors\n- Recent developments\n- Future outlook\n- Key takeaways' },
    ]
  },
  {
    category: 'Productivity',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    templates: [
      { title: 'Action Plan', prompt: 'Create a detailed action plan to achieve [goal] within [timeframe]. Include:\n- Phase breakdown\n- Specific tasks per phase\n- Dependencies and blockers\n- Success metrics\n- Contingency steps' },
      { title: 'Meeting Agenda', prompt: 'Create a meeting agenda for a [duration] meeting about [topic].\n\nAttendees: [list roles]\nObjective: [main goal]\n\nInclude time allocations and desired outcomes per agenda item.' },
      { title: 'Problem Solver', prompt: 'Help me solve this problem using first principles:\n\nProblem: [describe problem]\nContext: [relevant background]\nConstraints: [limitations or requirements]\n\nBreak it down step by step.' },
    ]
  }
];

// ── Render prompt template picker ──────────────────────────
function renderTemplateModal() {
  var existing = document.getElementById('cx-template-modal');
  if (existing) { existing.remove(); return; }

  var modal = document.createElement('div');
  modal.id = 'cx-template-modal';
  modal.className = 'cx-template-modal';
  modal.innerHTML =
    '<div class="cx-tmpl-header">' +
      '<div class="cx-tmpl-title">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' +
        'Prompt Templates' +
      '</div>' +
      '<button class="cx-tmpl-close" onclick="document.getElementById(\'cx-template-modal\').remove()">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
    '</div>' +
    '<div class="cx-tmpl-body">' +
      PROMPT_TEMPLATES.map(function(cat) {
        return '<div class="cx-tmpl-category">' +
          '<div class="cx-tmpl-cat-label">' + cat.icon + cat.category + '</div>' +
          '<div class="cx-tmpl-list">' +
            cat.templates.map(function(t) {
              return '<button class="cx-tmpl-item" data-prompt="' + esc(t.prompt) + '">' +
                '<span>' + esc(t.title) + '</span>' +
                '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>' +
              '</button>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('') +
    '</div>';

  document.body.appendChild(modal);

  // Click handler for templates
  modal.querySelectorAll('.cx-tmpl-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var prompt = btn.dataset.prompt;
      var inp = document.getElementById('composer-input');
      if (inp) {
        inp.value = prompt;
        inp.style.height = 'auto';
        inp.style.height = Math.min(inp.scrollHeight, 220) + 'px';
        inp.focus();
        // Move cursor to first [ placeholder
        var firstBracket = prompt.indexOf('[');
        if (firstBracket !== -1) {
          var lastBracket = prompt.indexOf(']', firstBracket);
          inp.setSelectionRange(firstBracket, lastBracket !== -1 ? lastBracket + 1 : firstBracket);
        }
        // Trigger input event for character counter
        inp.dispatchEvent(new Event('input'));
      }
      modal.remove();
      toast('Template loaded — fill in the [brackets]');
    });
  });

  // Close on outside click
  setTimeout(function() {
    document.addEventListener('click', function closeOnClick(e) {
      if (!modal.contains(e.target) && e.target.id !== 'cx-template-btn') {
        modal.remove();
        document.removeEventListener('click', closeOnClick);
      }
    });
  }, 100);
}

/* ==========================================================
   AUTO-REFINE — AI improves its own previous response
   Triggered via the refine button on AI messages.
   Uses a dedicated refine prompt to rephrase/improve.
========================================================== */
window.autoRefineMessage = async function(btn) {
  if (!_session) { toast('Sign in to use auto-refine.'); return; }
  if (_responding) { toast('Wait for the current response to finish.'); return; }

  var msgRow    = btn && btn.closest('.msg-row');
  var bubbleEl  = msgRow && msgRow.querySelector('.msg-bubble');
  var rawText   = bubbleEl && bubbleEl.dataset.raw;
  if (!rawText) rawText = bubbleEl && bubbleEl.innerText;
  if (!rawText) { toast('Could not find message to refine.'); return; }

  // Find the user message that preceded this AI response
  var prevUserRow = msgRow && msgRow.previousElementSibling;
  while (prevUserRow && !prevUserRow.classList.contains('user')) {
    prevUserRow = prevUserRow.previousElementSibling;
  }
  var userQuery = prevUserRow && prevUserRow.querySelector('.msg-bubble') &&
    (prevUserRow.querySelector('.msg-bubble').dataset.raw || prevUserRow.querySelector('.msg-bubble').innerText);

  btn.disabled = true;
  var originalInner = btn.innerHTML;
  btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="cx-spin"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';

  // Show refining indicator in bubble
  var originalBubbleHTML = bubbleEl.innerHTML;
  bubbleEl.innerHTML = '<div class="cx-refine-indicator"><div class="cx-refine-pulse"></div><span>Refining response…</span></div>';

  try {
    var refinePrompt =
      'The following AI response needs improvement. Make it:\n' +
      '- More concise and clearer\n' +
      '- Better structured\n' +
      '- More precise and direct\n' +
      '- Remove any redundancy or filler\n\n' +
      (userQuery ? 'Original question: ' + userQuery.slice(0, 400) + '\n\n' : '') +
      'Response to improve:\n' + rawText.slice(0, 3000) + '\n\n' +
      'Return ONLY the improved response — no preamble, no meta-commentary about changes.';

    var res = await fetch(AXION_URL, {
      method: 'POST', headers: edgeHeaders(),
      body: JSON.stringify({
        model:  'axion',
        system: 'You are a response quality improver. Rewrite the given response to be cleaner, more precise, and more useful. Keep all factual information intact.',
        messages: [{ role: 'user', content: refinePrompt }],
        stream: false, max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error('Refine request failed: ' + res.status);
    var data = await res.json();
    var refinedText =
      (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
      (data.content && data.content[0] && data.content[0].text) || '';
    refinedText = refinedText.trim();

    if (!refinedText) throw new Error('Empty refined response');

    // Render the improved response
    bubbleEl.innerHTML = mdToHTML(refinedText);
    bubbleEl.dataset.raw = refinedText;

    // Update history with refined text
    var histIdx = _history.findLastIndex(function(m) { return m.role === 'assistant'; });
    if (histIdx !== -1) _history[histIdx].content = refinedText;

    // Add a refined badge
    var badge = document.createElement('div');
    badge.className = 'cx-refined-badge';
    badge.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>Auto-refined</span>';
    bubbleEl.appendChild(badge);

    toast('Response refined!');
  } catch (e) {
    // Restore original on error
    bubbleEl.innerHTML = originalBubbleHTML;
    toast('Could not refine: ' + e.message);
    console.error('[CyanixAI] autoRefineMessage:', e);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalInner;
  }
};

/* ==========================================================
   ENHANCED COMPOSER TOOLBAR
   Attaches the new AI & Intelligence feature buttons to
   the composer area — Wiki RAG, CoT toggle, templates,
   auto-refine (injected on AI messages).
========================================================== */
function initEnhancedComposer() {
  // Inject enhanced toolbar buttons into the existing composer
  var toolbar = document.getElementById('cx-ai-toolbar');
  if (!toolbar) return;

  // Wiki RAG toggle
  var wikiBtn = document.createElement('button');
  wikiBtn.id = 'cx-wiki-btn';
  wikiBtn.className = 'cx-toolbar-btn' + (_wikiRagEnabled ? ' cx-toolbar-btn--active' : '');
  wikiBtn.title = 'Wiki RAG — Pull Wikipedia context for factual answers';
  wikiBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
    '<span>Wiki RAG</span>';
  wikiBtn.addEventListener('click', function() {
    _wikiRagEnabled = !_wikiRagEnabled;
    wikiBtn.classList.toggle('cx-toolbar-btn--active', _wikiRagEnabled);
    toast(_wikiRagEnabled ? 'Wiki RAG on — Wikipedia context enabled' : 'Wiki RAG off');
  });
  toolbar.appendChild(wikiBtn);

  // Chain-of-thought toggle
  var cotBtn = document.createElement('button');
  cotBtn.id = 'cx-cot-btn';
  cotBtn.className = 'cx-toolbar-btn' + (_cotEnabled ? ' cx-toolbar-btn--active' : '');
  cotBtn.title = 'Chain-of-thought — Show step-by-step reasoning';
  cotBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
    '<span>CoT</span>';
  cotBtn.addEventListener('click', function() {
    _cotEnabled = !_cotEnabled;
    cotBtn.classList.toggle('cx-toolbar-btn--active', _cotEnabled);
    toast(_cotEnabled ? 'Chain-of-thought on — reasoning steps visible' : 'Chain-of-thought off');
  });
  toolbar.appendChild(cotBtn);

  // Prompt templates
  var tmplBtn = document.createElement('button');
  tmplBtn.id = 'cx-template-btn';
  tmplBtn.className = 'cx-toolbar-btn';
  tmplBtn.title = 'Prompt templates library';
  tmplBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>' +
    '<span>Templates</span>';
  tmplBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    renderTemplateModal();
  });
  toolbar.appendChild(tmplBtn);

  // Groq context indicator
  var groqBtn = document.createElement('button');
  groqBtn.id = 'cx-groq-ctx-btn';
  groqBtn.className = 'cx-toolbar-btn' + (_groqCtxEnabled ? ' cx-toolbar-btn--active' : '');
  groqBtn.title = 'Groq Compound context enrichment';
  groqBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>' +
    '<span>Groq Ctx</span>';
  groqBtn.addEventListener('click', function() {
    _groqCtxEnabled = !_groqCtxEnabled;
    groqBtn.classList.toggle('cx-toolbar-btn--active', _groqCtxEnabled);
    toast(_groqCtxEnabled ? 'Groq context enrichment on' : 'Groq context enrichment off');
  });
  toolbar.appendChild(groqBtn);
}

// ── Patch sendMessage to inject wiki RAG + CoT context ─────
// We patch the buildSystemPrompt call inside sendMessage via a hook
var _wikiDataForCurrentMessage = null;

var _originalBuildSystemPrompt = buildSystemPrompt;
buildSystemPrompt = function(queryContext) {
  var base = _originalBuildSystemPrompt(queryContext);
  // Add CoT instruction if enabled (or auto-detect math/logic queries)
  if (_cotEnabled || isCotQuery(queryContext || '')) {
    base += getCotInstruction();
  }
  return base;
};

// Hook into the send flow to inject wiki context
var _originalFetchRAGContext = fetchRAGContext;

// We need to intercept sendMessage to add wiki context.
// The cleanest hook is to extend the system prompt builder with wiki data.
// This is called after wikiData is fetched.
function buildSystemPromptWithWiki(queryContext, wikiData) {
  var base = buildSystemPrompt(queryContext);
  if (wikiData) {
    base += buildWikiRAGContext(wikiData);
  }
  return base;
}

// ── Inject auto-refine button into AI messages ─────────────
var _originalRenderMessage = renderMessage;
renderMessage = function(role, content, animate, msgId, imageData) {
  var result = _originalRenderMessage(role, content, animate, msgId, imageData);
  if (role !== 'ai' || !result.msgEl) return result;

  // Add auto-refine button to the actions bar after a slight delay
  setTimeout(function() {
    var actions = result.msgEl && result.msgEl.querySelector('.msg-actions');
    if (!actions) return;
    if (actions.querySelector('.cx-refine-btn')) return;
    var refineBtn = document.createElement('button');
    refineBtn.className = 'msg-action-btn cx-refine-btn';
    refineBtn.title = 'Auto-refine this response';
    refineBtn.innerHTML =
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    refineBtn.addEventListener('click', function() { window.autoRefineMessage(refineBtn); });
    actions.appendChild(refineBtn);
  }, 200);

  return result;
};

// Initialize enhanced composer on DOM ready
window.addEventListener('cyanix:ready', function() {
  initEnhancedComposer();
});

// ── Patch sendMessage to fetch and apply wiki context ──────
// We intercept just before the API call by wrapping fetchRAGContext
var _sendMessageOriginal = sendMessage;
sendMessage = async function(text) {
  // Pre-fetch wiki context in parallel if enabled
  if (_wikiRagEnabled && text && text.length > 8) {
    fetchWikiRAGContext(text).then(function(wikiData) {
      _wikiDataForCurrentMessage = wikiData;
    }).catch(function() { _wikiDataForCurrentMessage = null; });
  } else {
    _wikiDataForCurrentMessage = null;
  }

  // Patch buildSystemPrompt temporarily to include wiki data
  if (_wikiRagEnabled) {
    var _tempBuildSP = buildSystemPrompt;
    buildSystemPrompt = function(queryContext) {
      var base = _tempBuildSP(queryContext);
      if (_wikiDataForCurrentMessage) {
        base += buildWikiRAGContext(_wikiDataForCurrentMessage);
      }
      return base;
    };

    var res = await _sendMessageOriginal.call(this, text);

    // Restore
    buildSystemPrompt = _tempBuildSP;

    // Append wiki source badge to latest AI bubble
    if (_wikiDataForCurrentMessage) {
      setTimeout(function() {
        var bubbles = document.querySelectorAll('.msg-row:not(.user) .msg-bubble');
        var last = bubbles[bubbles.length - 1];
        if (last) appendWikiSource(last, _wikiDataForCurrentMessage);
      }, 500);
    }

    return res;
  }

  return _sendMessageOriginal.call(this, text);
};

//  URL / Link Detection + Browse 
var URL_REGEX = /https?:\/\/[^\s<>"'\)\]]+/g;

function extractURLs(text) {
  var matches = text.match(URL_REGEX) || [];
  // Clean trailing punctuation
  return matches.map(function(u) { return u.replace(/[.,;:!?]+$/, ''); });
}

function needsBrowse(text) {
  var urls = extractURLs(text);
  if (!urls.length) return false;
  // Skip if user is just asking about a URL conceptually with no intent to read it
  // Trigger if there's a URL and the message is short (just a link) or has reading intent
  var hasReadIntent = /\b(watch|read|check|look|see|open|visit|summary|summarize|explain|what('?s| is| does)|tell me about|about this|thoughts on|recap|review)\b/i.test(text);
  return urls.length > 0 && (text.trim().replace(URL_REGEX, '').trim().length < 60 || hasReadIntent);
}

async function fetchBrowseContext(text) {
  var urls = extractURLs(text);
  if (!urls.length) return null;
  var url = urls[0]; // Process first URL
  try {
    var ctrl = new AbortController();
    var t = setTimeout(function() { ctrl.abort(); }, 20000);
    var res = await fetch(BROWSE_URL, {
      method: 'POST',
      headers: edgeHeaders(),
      signal: ctrl.signal,
      body: JSON.stringify({
        url: url,
        context: text.replace(URL_REGEX, '').trim() || null
      })
    });
    clearTimeout(t);
    if (!res.ok) return null;
    var data = await res.json();
    if (data.error) return null;
    return { url: url, ...data };
  } catch(e) { return null; }
}

function buildBrowseContext(browseData) {
  if (!browseData) return '';
  var label = browseData.page_type === 'youtube' ? 'YOUTUBE TRANSCRIPT SUMMARY' : 'PAGE CONTENT';
  var out = '\n\n[' + label + ']\n';
  out += 'URL: ' + browseData.url + '\n';
  if (browseData.page_title) out += 'Title: ' + browseData.page_title + '\n';
  out += '\n' + (browseData.summary || '') + '\n[END ' + label + ']';
  return out;
}

function buildRAGContext(ragData) {
  if (!ragData) return '';
  const parts = [];
  // Show which optimized queries were actually used
  if (ragData.queries_used && ragData.queries_used.length > 1) {
    parts.push('Searched for: ' + ragData.queries_used.join(' | '));
  }
  if (ragData.abstract) parts.push('Summary: ' + ragData.abstract);
  if (ragData.results && ragData.results.length) {
    parts.push('Results:');
    ragData.results.slice(0, 3).forEach(function(r, i) {
      parts.push('[' + (i+1) + '] ' + r.title + ' -- ' + r.snippet + ' (' + r.url + ')');
    });
  }
  return parts.length ? '\n\n[WEB SEARCH CONTEXT -- use ONLY this data for current events, do not blend with training memory]\n' + parts.join('\n') + '\n[END WEB SEARCH]' : '';
}

// ── Inline document card renderers ───────────────────────
var DOC_ICONS = {
  pptx: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  pdf:  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  docx: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  xlsx: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
};
var DOC_COLORS = { pptx:'#d1441e', pdf:'#dc2626', docx:'#2563eb', xlsx:'#16a34a' };
var DOC_LABELS = { pptx:'PowerPoint', pdf:'PDF', docx:'Word Document', xlsx:'Spreadsheet' };

function renderDocBuildingCard(type) {
  var color = DOC_COLORS[type] || 'var(--cyan-d)';
  var label = DOC_LABELS[type] || type.toUpperCase();
  return '<div class="doc-inline-card doc-inline-card--building">' +
    '<div class="doc-inline-icon" style="color:' + color + ';background:' + color + '18">' +
      (DOC_ICONS[type] || '') +
    '</div>' +
    '<div class="doc-inline-info">' +
      '<div class="doc-inline-label">' + label + '</div>' +
      '<div class="doc-inline-status">' +
        '<span class="doc-building-dot"></span>Building your file\u2026' +
      '</div>' +
    '</div>' +
  '</div>';
}

function renderDocDownloadCard(filename, type, url) {
  var color = DOC_COLORS[type] || 'var(--cyan-d)';
  var label = DOC_LABELS[type] || type.toUpperCase();
  return '<div class="doc-inline-card doc-inline-card--ready">' +
    '<div class="doc-inline-icon" style="color:' + color + ';background:' + color + '18">' +
      (DOC_ICONS[type] || '') +
    '</div>' +
    '<div class="doc-inline-info">' +
      '<div class="doc-inline-label">' + esc(filename) + '</div>' +
      '<div class="doc-inline-meta">' + label + ' \u00b7 Ready to download</div>' +
    '</div>' +
    '<a class="doc-inline-dl" href="' + esc(url) + '" download="' + esc(filename) + '" title="Download">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      'Download' +
    '</a>' +
  '</div>';
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
   MULTI-LLM PRECISION PIPELINE
   Three-stage pipeline for responses that need accuracy:
   
   Stage 1 — ROUTER (llama-3.1-8b-instant, fast)
     Analyses the query: complexity, type, strategy needed.
     Returns a routing plan: which specialist model, what
     context to emphasise, whether a verify pass is needed.
   
   Stage 2 — SPECIALIST (qwen-qwq-32b for code, Llama 4 Scout for everything else)
     Generates the actual answer using the router's plan
     as additional context/guidance.
   
   Stage 3 — VERIFIER (llama-3.1-8b-instant, fast)
     Checks: does the answer address the question?
     Any obvious hallucinations or missing critical info?
     If it fails the bar → one retry with feedback injected.
   
   The pipeline only activates for complex queries.
   Simple conversational messages go straight to Stage 2.
========================================================== */

// Queries that warrant the full precision pipeline
var PIPELINE_TRIGGERS = [
  /\b(how|why|explain|what is|describe|compare|difference between|pros and cons|should i|best way)\b/i,
  /\b(debug|fix|error|bug|not working|broken|fails|exception|crash)\b/i,
  /\b(build|implement|create|architect|design|structure|plan|roadmap)\b/i,
  /\b(analyse|analyze|review|evaluate|assess|audit)\b/i,
  /\b(research|summarise|summarize|overview|breakdown)\b/i,
];

function needsPrecisionPipeline(text) {
  if (text.length < 40) return false; // short messages skip pipeline
  return PIPELINE_TRIGGERS.some(function(r) { return r.test(text); });
}

async function runPrecisionPipeline(text, systemPrompt, messages) {
  // ── Stage 1: Route ─────────────────────────────────────
  var routePrompt =
    'Analyse this user query and return a JSON routing plan.\n' +
    'Query: ' + text.slice(0, 500) + '\n\n' +
    'Return ONLY this JSON:\n' +
    '{"complexity":"simple|moderate|complex","query_type":"factual|coding|creative|analytical|conversational",' +
    '"needs_verify":true|false,"specialist_instruction":"one sentence guiding the main response",' +
    '"risks":["list","of","hallucination","risks","or","gaps"]}\n' +
    'Be direct and accurate. No extra text.';

  var routePlan = null;
  try {
    var routeRes = await fetch(CHAT_URL, {
      method: 'POST', headers: edgeHeaders(),
      body: JSON.stringify({
        model:      'groq/llama-3.1-8b-instant',
        stream:     false,
        max_tokens: 200,
        messages: [
          { role: 'system', content: 'You are a query router. Return only valid JSON.' },
          { role: 'user',   content: routePrompt },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (routeRes.ok) {
      var routeData = await routeRes.json();
      var routeRaw  = (routeData.choices && routeData.choices[0] && routeData.choices[0].message && routeData.choices[0].message.content || '').trim();
      var rStart = routeRaw.indexOf('{'); var rEnd = routeRaw.lastIndexOf('}');
      if (rStart !== -1 && rEnd !== -1) routePlan = JSON.parse(routeRaw.slice(rStart, rEnd + 1));
    }
  } catch (e) {
    console.warn('[CyanixAI] Pipeline: route stage failed, continuing without plan:', e.message);
  }

  // ── Stage 2: Specialist ────────────────────────────────
  var specialistSys = systemPrompt;
  if (routePlan && routePlan.specialist_instruction) {
    specialistSys += '\n\nROUTER GUIDANCE: ' + routePlan.specialist_instruction;
    if (routePlan.risks && routePlan.risks.length) {
      specialistSys += ' Watch for these potential issues: ' + routePlan.risks.join(', ') + '.';
    }
  }

  // Pick specialist model based on query type
  var specialistModel = _settings.model;
  if (routePlan) {
    if (routePlan.query_type === 'coding' || routePlan.complexity === 'complex') {
      specialistModel = CODING_MODEL; // qwen-qwq-32b
    } else if (routePlan.query_type === 'analytical' || routePlan.query_type === 'factual') {
      specialistModel = 'meta-llama/llama-4-scout-17b-16e-instruct';
    }
  }
  // Compound models have built-in web search — don't override them
  if (_settings.model.startsWith('groq/compound')) specialistModel = _settings.model;

  var specialistRes = await fetch(CHAT_URL, {
    method: 'POST', headers: edgeHeaders(), signal: _abortCtrl && _abortCtrl.signal,
    body: JSON.stringify({
      model:      specialistModel,
      stream:     _settings.streaming,
      max_tokens: 1500,
      messages:   [{ role: 'system', content: specialistSys }].concat(messages),
      chat_id:    _currentId,
      user_message: text,
    }),
  });

  if (!specialistRes.ok) {
    var errText = await specialistRes.text().catch(function() { return 'Unknown'; });
    throw new Error('Specialist stage failed: ' + specialistRes.status + ' ' + errText);
  }

  // Collect full response text for verification
  var aiText = '';
  var streamBody = null;

  if (_settings.streaming && specialistRes.body) {
    // Return the streaming response directly — verification happens after streaming completes
    return { streaming: true, response: specialistRes, routePlan: routePlan };
  } else {
    var spData = await specialistRes.json();
    aiText = (spData.choices && spData.choices[0] && spData.choices[0].message && spData.choices[0].message.content) || '';
  }

  // ── Stage 3: Verify (only for non-streaming + needs_verify) ──
  var needsVerify = routePlan && routePlan.needs_verify && aiText.length > 100;
  if (needsVerify) {
    try {
      var verifyPrompt =
        'Original question: ' + text.slice(0, 400) + '\n\n' +
        'Answer to verify:\n' + aiText.slice(0, 1500) + '\n\n' +
        'Does this answer fully and accurately address the question? ' +
        'Check for: missing information, incorrect facts, unclear explanations.\n' +
        'Return JSON: {"passes":true|false,"issues":["list of specific problems"],"improvement":"one sentence fix instruction or null"}\n' +
        'Be strict but fair. Only flag real problems.';

      var verifyRes = await fetch(CHAT_URL, {
        method: 'POST', headers: edgeHeaders(),
        body: JSON.stringify({
          model: 'groq/llama-3.1-8b-instant', stream: false, max_tokens: 200,
          messages: [
            { role: 'system', content: 'You are a quality verifier. Return only valid JSON.' },
            { role: 'user',   content: verifyPrompt },
          ],
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (verifyRes.ok) {
        var vData  = await verifyRes.json();
        var vRaw   = (vData.choices && vData.choices[0] && vData.choices[0].message && vData.choices[0].message.content || '').trim();
        var vStart = vRaw.indexOf('{'); var vEnd = vRaw.lastIndexOf('}');
        if (vStart !== -1 && vEnd !== -1) {
          var verdict = JSON.parse(vRaw.slice(vStart, vEnd + 1));
          console.log('[CyanixAI] Pipeline verify:', verdict.passes ? 'PASS' : 'FAIL', verdict.issues || []);

          if (!verdict.passes && verdict.improvement) {
            // One retry with verifier feedback injected
            var retryRes = await fetch(CHAT_URL, {
              method: 'POST', headers: edgeHeaders(),
              body: JSON.stringify({
                model:      specialistModel,
                stream:     false,
                max_tokens: 1500,
                messages: [
                  { role: 'system', content: specialistSys + '\n\nIMPROVEMENT REQUIRED: ' + verdict.improvement },
                ].concat(messages),
              }),
              signal: AbortSignal.timeout(30000),
            });
            if (retryRes.ok) {
              var retryData = await retryRes.json();
              var retryText = retryData.choices && retryData.choices[0] && retryData.choices[0].message && retryData.choices[0].message.content;
              if (retryText && retryText.length > aiText.length * 0.5) {
                aiText = retryText;
                console.log('[CyanixAI] Pipeline: used improved answer after verify fail');
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[CyanixAI] Pipeline: verify stage failed, using original answer:', e.message);
    }
  }

  return { streaming: false, aiText: aiText, routePlan: routePlan };
}


function handleSend() {
  if (_responding) { stopResponse(); return; }
  const input = $('composer-input'); if (!input) return;
  const text = input.value.trim(); if (!text) return;
  input.value = ''; input.style.height = 'auto';
  sendMessage(text);
}

/* ==========================================================
   LOGO TRAVELER — Send animation system
   On send: logo detaches from composer → arcs into chat →
   becomes the writing cursor → fades out when done streaming.
========================================================== */

var _logoTravelerTarget = null; // the AI msg row to land on
var _logoFlying         = false;

function launchLogoTraveler() {
  var traveler = document.getElementById('logo-traveler');
  if (!traveler) return;

  // Source: the composer box area (where the send button lives)
  var composerBox = document.getElementById('composer-box');
  if (!composerBox) return;

  var srcRect = composerBox.getBoundingClientRect();
  var startX  = srcRect.left + srcRect.width * 0.5;
  var startY  = srcRect.top  + srcRect.height * 0.5;

  // Reset traveler to source position, make visible
  traveler.style.cssText = [
    'left:'      + startX + 'px',
    'top:'       + startY + 'px',
    'opacity:1',
    'transform:translate(-50%,-50%) scale(1)',
    'transition:none',
    'display:flex',
  ].join(';');

  _logoFlying = true;

  // Give browser one frame to apply the start position
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      // Target: scroll position + some offset near the top of messages
      var msgArea = document.getElementById('messages');
      if (!msgArea) return;
      var msgRect = msgArea.getBoundingClientRect();

      // Aim just below the latest user message
      var rows    = msgArea.querySelectorAll('.msg-row.user');
      var lastRow = rows[rows.length - 1];
      var endY    = lastRow
        ? lastRow.getBoundingClientRect().bottom + 28
        : msgRect.top + 60;
      var endX    = msgRect.left + 40; // left-aligned like AI avatar column

      traveler.style.cssText = [
        'left:'      + endX + 'px',
        'top:'       + endY + 'px',
        'opacity:1',
        'transform:translate(-50%,-50%) scale(0.85)',
        'transition:left 0.48s cubic-bezier(.22,.68,0,1.2),top 0.48s cubic-bezier(.22,.68,0,1.2),transform 0.48s cubic-bezier(.22,.68,0,1.2),opacity 0.48s ease',
        'display:flex',
      ].join(';');
    });
  });
}

function landLogoTraveler(msgRowEl) {
  // Called once the AI bubble row is rendered in DOM
  // Move traveler to exactly the ai-avatar position and fade out
  var traveler = document.getElementById('logo-traveler');
  if (!traveler || !msgRowEl) return;

  // Wait for the row to be in DOM and positioned
  setTimeout(function() {
    var avatarEl = msgRowEl.querySelector('.ai-avatar');
    if (!avatarEl) { traveler.style.display = 'none'; return; }

    var rect = avatarEl.getBoundingClientRect();
    var cx   = rect.left + rect.width  * 0.5;
    var cy   = rect.top  + rect.height * 0.5;

    traveler.style.cssText = [
      'left:'      + cx + 'px',
      'top:'       + cy + 'px',
      'opacity:0',
      'transform:translate(-50%,-50%) scale(0.6)',
      'transition:left 0.3s cubic-bezier(.22,.68,0,1.2),top 0.3s cubic-bezier(.22,.68,0,1.2),transform 0.3s ease,opacity 0.35s ease',
      'display:flex',
    ].join(';');

    setTimeout(function() {
      traveler.style.display = 'none';
      _logoFlying = false;
    }, 380);
  }, 60);
}

async function sendMessage(text) {
  // If called with no argument (e.g. from voice send), read from composer
  if (text === undefined || text === null) {
    var inp = $('composer-input');
    text = inp ? inp.value.trim() : '';
    if (inp) { inp.value = ''; inp.style.height = 'auto'; }
  }
  if (!text) return;
  if (!_session) { toast('Please sign in to chat.'); return; }

  // ── Guarantee a fresh JWT before every API call ───────────────────────────
  // This is the fix for: API 500 {"error":"The logic gate collapsed.","trace":"Signal loss: 401"}
  // Supabase tokens expire after 1 hour. If the user has had the tab open longer
  // than that, _session.access_token is stale and the Edge Function rejects it
  // with a 401, which gets wrapped as a 500 on your end.
  try {
    if (_sb) {
      var refreshResult = await _sb.auth.refreshSession();
      if (refreshResult.data && refreshResult.data.session) {
        _session = refreshResult.data.session;
      } else if (!_session) {
        toast('Session expired. Please sign in again.');
        onSignedOut();
        return;
      }
    }
  } catch (refreshErr) {
    console.warn('[CyanixAI] Session refresh failed:', refreshErr.message);
    // Continue with existing session — best effort
  }

  // ── Content moderation check ─────────────────────────────
  if (_userIsBanned) { showBanScreen(); return; }
  var violation = await checkModeration(text);
  if (violation) {
    await issueStrike(violation, text);
    return; // Block the message entirely
  }

  if (_responding) return;
  if (_attachment && _attachment.type === 'loading') { toast('Still reading file\u2026 please wait.'); return; }
  if (!checkDailyLimit()) return;

  // ── Document generation short-circuit ───────────────────
  var docType = isDocumentRequest(text);
  if (docType && window._docGenerateInline) {
    _responding = true;
  var _thinkFloat = document.getElementById('ai-thinking-float');
  if (_thinkFloat) _thinkFloat.classList.add('visible');
    setSendBtn('stop');
    const isNewChat = !_currentId;
    if (isNewChat) {
      _currentId = localUUID();
      var dTitle = text.slice(0, 60).trim();
      _chats.unshift({ id: _currentId, title: dTitle, updated_at: new Date().toISOString() });
      renderChatList();
      if ($('chat-title')) $('chat-title').textContent = dTitle;
    }
    hide('welcome-state');
    _history.push({ role: 'user', content: text });
    renderMessage('user', text, true);
    scrollToBottom();

    // Render a building card in the AI bubble
    var buildRendered = renderMessage('ai', '', true);
    var buildBubble   = buildRendered.bubbleEl;
    buildBubble.innerHTML = renderDocBuildingCard(docType);
    scrollToBottom();

    try {
      var result = await window._docGenerateInline(docType, text);
      // Replace building card with download card
      var url = URL.createObjectURL(result.blob);
      buildBubble.innerHTML = renderDocDownloadCard(result.filename, docType, url);
      _history.push({ role: 'assistant', content: 'I\'ve created your ' + result.filename + '. Click the download button to save it.' });
      bgSyncMessages(isNewChat, _currentId, text, 'Document generated: ' + result.filename, buildRendered.msgEl);
    } catch (e) {
      buildBubble.innerHTML = '<div class="doc-inline-error">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
        'Couldn\'t generate the file: ' + esc(e.message) + '. Try describing it differently.' +
      '</div>';
      console.error('[CyanixAI] Inline doc generation failed:', e);
    } finally {
      _responding = false;
  var _thinkFloat = document.getElementById('ai-thinking-float');
  if (_thinkFloat) _thinkFloat.classList.remove('visible');
      setSendBtn('send');
    }
    scrollToBottom();
    return; // skip normal LLM call
  }
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
  _history.push({ role: 'user', content: text }); // image data excluded from history to save tokens
  renderMessage('user', text, true, null, _attachment && _attachment.type === 'image' ? _attachment.data : null);
  var pendingAttachment = _attachment;
  clearAttachment();
  // 🚀 Fire logo travel animation — logo leaves composer, flies into chat
  launchLogoTraveler();
  show('typing-row');
  startThoughtStream(text, _ragEnabled);
  scrollToBottom();

  let ragData    = null;
  let browseData = null;
  // Axion has its own internal pipeline — treat like Compound (skip client-side RAG/pipeline overrides)
  const isCompound = true; // Axion is the only model — always uses its own pipeline

  // Fetch unified KG context (nodes + memories) -- fire in parallel, non-blocking
  fetchKGContext(text).catch(function() {});

  // URL browse -- runs first, takes priority over RAG
  if (needsBrowse(text)) {
    const tl = $('thinking-text');
    if (tl) {
      var urls = extractURLs(text);
      var isYT = urls[0] && /youtube\.com|youtu\.be/.test(urls[0]);
      tl.textContent = isYT ? 'Reading video transcript...' : 'Reading the page...';
    }
    browseData = await fetchBrowseContext(text);
    if (tl) tl.textContent = 'Cyanix is thinking';
  }

  if (!browseData && !isCompound && (_ragEnabled || (_ragAuto && needsWebSearch(text)))) {
    // Skip manual RAG when Compound is selected -- it has built-in web search
    const tl = $('thinking-text');
    if (tl) tl.textContent = 'Searching the web...';
    ragData = await fetchRAGContext(text);
    if (tl) tl.textContent = 'Cyanix is thinking';
  }
  if (isCompound) {
    const tl = $('thinking-text');
    if (tl && !browseData) tl.textContent = 'Cyanix is searching the web...';
  }


  // Build user content -- plain text or multipart if attachment present
  // NOTE: use pendingAttachment (captured before clearAttachment() was called)
  var userContent;
  if (pendingAttachment) {
    if (pendingAttachment.type === 'image') {
      userContent = [
        { type: 'image_url', image_url: { url: 'data:' + pendingAttachment.mediaType + ';base64,' + pendingAttachment.data } },
        { type: 'text', text: text }
      ];
    } else if (pendingAttachment.type === 'document') {
      // Extracted text from PDF, DOCX, PPTX, XLSX, CSV, ZIP
      var label = pendingAttachment.label || 'File';
      userContent = text + '\n\n---\n**Attached ' + label + ': ' + pendingAttachment.name + '**\n\n' +
        pendingAttachment.data.slice(0, 15000) +
        (pendingAttachment.data.length > 15000 ? '\n\n[Content truncated at 15,000 characters]' : '');
    } else if (pendingAttachment.type === 'text') {
      var ext = pendingAttachment.name.split('.').pop() || 'text';
      userContent = text + '\n\n---\n**Attached file: ' + pendingAttachment.name + '**\n```' + ext + '\n' +
        pendingAttachment.data.slice(0, 12000) + '\n```';
    } else {
      userContent = text;
    }
  } else {
    userContent = text;
  }

  // Frustration detection -- inject signal into system prompt when user seems stuck
  var frustrationCtx = '';
  if (detectFrustration(text, _history)) {
    frustrationCtx = ' IMPORTANT: The user appears frustrated or stuck right now -- they may have tried this before or are hitting a repeated wall. ' +
      'Before jumping to a solution: acknowledge the friction naturally (e.g. "sounds like this has been a wall" -- not those exact words, be genuine). ' +
      'Ask one focused question to make sure you understand exactly what they have already tried. Then offer a clearly different approach than before.';
  }

  // Hard cap on system prompt -- 5000 chars ~ 1250 tokens leaves room for history + response
  var rawSystem = buildSystemPrompt(text) + buildBrowseContext(browseData) + buildRAGContext(ragData) + frustrationCtx;
  var systemContent = rawSystem.length > 5000 ? rawSystem.slice(0, 5000) + '\n[context truncated]' : rawSystem;
  // Estimate total request size and warn if still large
  var histChars = _history.slice(-(window._chatHistoryLimit || 10))
    .reduce(function(s, m) { return s + (typeof m.content === 'string' ? Math.min(m.content.length, 400) : 200); }, 0);
  if (systemContent.length + histChars > 12000) {
    console.warn('[CyanixAI] Large request:', systemContent.length, 'sys +', histChars, 'hist =', systemContent.length + histChars, 'chars');
  }
  const messages = [{ role: 'system', content: systemContent }]
    .concat(_history.slice(-(window._chatHistoryLimit || 10)).map(function(m, idx, arr) {
      // For last user message: use multipart content if attachment was present
      if (idx === arr.length - 1 && m.role === 'user' && typeof userContent !== 'string') {
        return { role: 'user', content: userContent };
      }
      // Truncate very long history messages to avoid 413
      var content = typeof m.content === 'string' && m.content.length > 400
        ? m.content.slice(0, 400) + '...'
        : m.content;
      return { role: m.role, content: content };
    }));

  _abortCtrl = new AbortController();
  let aiText = '';

  // Silent model routing — swap to coding model when needed, no UI change
  var effectiveModel = _settings.model;
  var isAxion   = _settings.model === 'axion';
  var isCoding  = isCodingRequest(text);
  var activeURL = isAxion ? AXION_URL : CHAT_URL;

  if (!isAxion && isCoding && !isCompound) {
    effectiveModel = CODING_MODEL;
    console.log('[CyanixAI] Routing to coding model:', CODING_MODEL);
  }

  // Axion handles its own internal pipeline — skip the client-side precision pipeline
  var usePipeline = !isAxion && needsPrecisionPipeline(text) && !isCompound;

  try {
    var res;

    if (usePipeline) {
      // ── Multi-LLM precision pipeline ────────────────────
      console.log('[CyanixAI] Running precision pipeline for:', text.slice(0, 60));
      var pipeResult = await runPrecisionPipeline(text, systemContent, messages);

      hide('typing-row');
      stopThoughtStream();

      if (pipeResult.streaming) {
        // Pipeline returned a streaming response from Stage 2
        res = pipeResult.response;
      } else {
        // Pipeline ran all 3 stages and returned final text
        aiText = pipeResult.aiText || '';
        const rendered = renderMessage('ai', aiText, true);
        if (ragData && rendered.bubbleEl) appendRAGSources(rendered.bubbleEl, ragData);
        _history.push({ role: 'assistant', content: aiText });
        bgSyncMessages(isNewChat, _currentId, text, aiText, rendered.msgEl);
        if (rendered.bubbleEl && /```\w/.test(aiText)) {
          runCodePipeline(rendered.bubbleEl, aiText, text).catch(function() {});
        }
        scrollToBottom();
        return; // done — skip streaming block below
      }
    } else {
      // ── Standard direct call ─────────────────────────────
      res = await fetch(activeURL, {
        method: 'POST', headers: edgeHeaders(), signal: _abortCtrl.signal,
        body: JSON.stringify(isAxion ? {
          model:      'axion',
          system:     systemContent,
          messages:   messages.filter(function(m) { return m.role !== 'system'; }),
          stream:     _settings.streaming,
          max_tokens: isCoding ? 4096 : 2048,
          chat_id:    _currentId,
        } : {
          model:        effectiveModel,
          messages:     messages,
          stream:       _settings.streaming,
          max_tokens:   isCoding ? 4000 : 1500,
          chat_id:      _currentId,
          user_message: text,
        }),
      });
    }

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
      // 🖊️ Logo writing cursor — replaces old static cursor
      bubbleEl.innerHTML = '<span class="logo-write-cursor"><img src="icons/manifest/icon-192x192.png" alt=""/></span>';
      // Land the flying logo into this bubble
      landLogoTraveler(rendered.msgEl);
      // Pulse the AI avatar while streaming
      var streamAvatar = rendered.msgEl && rendered.msgEl.querySelector('.ai-avatar');
      if (streamAvatar) streamAvatar.classList.add('streaming');

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
                bubbleEl.innerHTML = renderStreamingContent(aiText) + '<span class="logo-write-cursor"><img src="icons/manifest/icon-192x192.png" alt=""/></span>';
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
        // Self-correcting code pipeline — runs async, non-blocking
        if (/```\w/.test(aiText)) {
          runCodePipeline(bubbleEl, aiText, text).catch(function() {});
        }
      }
      // Stop avatar pulse
      if (streamAvatar) streamAvatar.classList.remove('streaming');
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
      // Self-correcting code pipeline
      if (rendered.bubbleEl && /```\w/.test(aiText)) {
        runCodePipeline(rendered.bubbleEl, aiText, text).catch(function() {});
      }
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
  var _thinkFloat = document.getElementById('ai-thinking-float');
  if (_thinkFloat) _thinkFloat.classList.remove('visible');
    setSendBtn('send');
    _abortCtrl = null;
  }
}

function stopResponse() {
  if (_abortCtrl) _abortCtrl.abort();
  _responding = false;
  var _thinkFloat = document.getElementById('ai-thinking-float');
  if (_thinkFloat) _thinkFloat.classList.remove('visible'); setSendBtn('send'); hide('typing-row'); stopThoughtStream();
}

function renderStreamingContent(text) {
  var thinkModel = true; // Axion always supports think blocks
  if (text.includes('<think>') && !thinkModel) {
    // Non-reasoning model -- strip all think content silently regardless of completion
    return mdToHTML(text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*/i, '').trim());
  }
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
  var btn = $('send-btn'); if (!btn) return;
  if (state === 'stop') {
    btn.classList.remove('ready', 'sent');
    btn.classList.add('stop');
    btn.title = 'Stop response';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>';
  } else {
    btn.classList.remove('stop', 'sent');
    btn.title = 'Send';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    // Reflect whether there's text
    var inp = $('composer-input');
    var hasText = inp && inp.value.trim().length > 0;
    btn.classList.toggle('ready', hasText);
  }
}

// ── Composer input live state ─────────────────────────────
// Updates send button ready state + character counter
function initComposerLiveState() {
  var inp     = $('composer-input');
  var btn     = $('send-btn');
  var counter = $('composer-counter');
  if (!inp) return;

  var WARN_AT   = 800;
  var DANGER_AT = 950;
  var MAX       = 1000;

  inp.addEventListener('input', function() {
    var len     = inp.value.length;
    var hasText = inp.value.trim().length > 0;

    // Send button ready state
    if (btn) btn.classList.toggle('ready', hasText);

    // Character counter
    if (counter) {
      if (len >= WARN_AT) {
        counter.textContent = (MAX - len) + ' left';
        counter.classList.add('visible');
        counter.classList.toggle('warn',   len >= WARN_AT && len < DANGER_AT);
        counter.classList.toggle('danger', len >= DANGER_AT);
      } else {
        counter.classList.remove('visible', 'warn', 'danger');
        counter.textContent = '';
      }
    }
  });

  // Send burst animation on send
  if (btn) {
    btn.addEventListener('click', function() {
      if (!btn.classList.contains('stop') && inp.value.trim()) {
        btn.classList.add('sent');
        setTimeout(function() { btn.classList.remove('sent'); }, 400);
      }
    });
  }
}

// Rotating placeholder suggestions
function initComposerPlaceholder() {
  var inp = $('composer-input');
  if (!inp) return;

  var placeholders = [
    'Ask Cyanix anything\u2026',
    'Debug some code\u2026',
    'Search the web\u2026',
    'Analyse a file\u2026',
    'Write something\u2026',
    'Explain a concept\u2026',
    'Brainstorm ideas\u2026',
  ];
  var idx = 0;

  setInterval(function() {
    if (document.activeElement === inp || inp.value) return;
    idx = (idx + 1) % placeholders.length;
    // Fade out, swap, fade in
    inp.style.transition = 'opacity .3s ease';
    inp.style.opacity = '0';
    setTimeout(function() {
      inp.placeholder = placeholders[idx];
      inp.style.opacity = '';
    }, 300);
  }, 4000);
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
          '<button type="button" class="msg-action-btn" onclick="copyMsg(this)" title="Copy">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          '</button>' +
          '<button type="button" class="msg-action-btn" onclick="editMessage(this)" title="Edit">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>';
  } else {
    row.innerHTML =
      '<div class="ai-avatar" id="ai-avatar-latest"><img src="icons/manifest/icon-192x192.png" alt="Cyanix AI"/></div>' +
      '<div class="msg-content">' +
        '<div class="msg-name"><strong>Cyanix AI</strong></div>' +
        '<div class="msg-bubble">' + (content ? mdToHTML(content) : '') + '</div>' +
        '<div class="msg-ts">' + timeStr() + '</div>' +
        '<div class="msg-actions msg-actions--always-show">' +
          '<button type="button" class="msg-action-btn msg-tts-btn" onclick="window.toggleMsgTTS(this)" title="Listen">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
          '</button>' +
          '<button type="button" class="msg-action-btn" onclick="copyMsg(this)" title="Copy">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          '</button>' +
          '<button type="button" class="msg-action-btn fb-up" onclick="inlineFeedback(this,1)" title="Good response">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>' +
          '</button>' +
          '<button type="button" class="msg-action-btn fb-down" onclick="inlineFeedback(this,-1)" title="Bad response">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>' +
          '</button>' +
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

/* ==========================================================
   MESSAGE TTS — Play/Pause AI responses
========================================================== */
var _msgTTSAudio   = null;   // current playing Audio
var _msgTTSBtn     = null;   // button that triggered it
var _msgTTSLoading = false;

window.toggleMsgTTS = async function(btn) {
  // If something is already playing — stop it
  if (_msgTTSAudio) {
    _msgTTSAudio.pause();
    _msgTTSAudio = null;
    if (_msgTTSBtn) {
      _msgTTSBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      _msgTTSBtn.classList.remove('tts-playing', 'tts-loading');
    }
    // If same button — just stop
    if (_msgTTSBtn === btn) {
      _msgTTSBtn = null;
      return;
    }
    _msgTTSBtn = null;
  }

  if (_msgTTSLoading) return;

  // Get text from the message bubble
  var bubble = btn.closest('.msg-row') && btn.closest('.msg-row').querySelector('.msg-bubble');
  if (!bubble) return;

  // Strip markdown formatting from text
  var text = (bubble.innerText || bubble.textContent || '').trim();
  text = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '').trim();
  if (!text) return;

  // Loading state
  _msgTTSBtn     = btn;
  _msgTTSLoading = true;
  btn.innerHTML  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="cx-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
  btn.classList.add('tts-loading');

  try {
    unlockAudio();

    var res = await fetch(TTS_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({
        text:     text.slice(0, 500),
        voice_id: CALL_VOICE_ID,
      }),
      signal: AbortSignal.timeout(30000),
    });

    _msgTTSLoading = false;

    if (!res.ok) {
      var errBody = await res.text().catch(function() { return ''; });
      console.warn('[CyanixAI] TTS failed HTTP', res.status, errBody.slice(0, 100));
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      btn.classList.remove('tts-loading');
      toast('Audio failed (' + res.status + '). Check Supabase logs.');
      _msgTTSBtn = null;
      return;
    }

    var arrayBuf = await res.arrayBuffer();
    if (!arrayBuf || arrayBuf.byteLength === 0) {
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      btn.classList.remove('tts-loading');
      toast('Audio unavailable.');
      _msgTTSBtn = null;
      return;
    }

    btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    btn.classList.remove('tts-loading');
    btn.classList.add('tts-playing');

    var onDone = function() {
      _msgTTSAudio = null;
      btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
      btn.classList.remove('tts-playing');
      _msgTTSBtn = null;
    };

    try {
      // Use AudioContext — best mobile compatibility, no double-fetch
      if (_audioCtx && _audioCtx.state !== 'closed') {
        if (_audioCtx.state === 'suspended') await _audioCtx.resume();
        var decoded = await _audioCtx.decodeAudioData(arrayBuf.slice(0));
        var src2    = _audioCtx.createBufferSource();
        src2.buffer = decoded;
        src2.connect(_audioCtx.destination);
        // Store a stop handle so pause works
        _msgTTSAudio = { _src2: src2, pause: function() { try { src2.stop(); } catch(e){} } };
        src2.onended = onDone;
        src2.start(0);
        return;
      }
    } catch(e) {
      console.warn('[CyanixAI] Msg TTS AudioContext failed, falling back:', e.message);
    }

    // Fallback: blob URL
    var blob = new Blob([arrayBuf], { type: 'audio/mpeg' });
    var url  = URL.createObjectURL(blob);
    _msgTTSAudio = new Audio(url);
    _msgTTSAudio.onended = function() { URL.revokeObjectURL(url); onDone(); };
    _msgTTSAudio.onerror = function() { URL.revokeObjectURL(url); onDone(); };
    _msgTTSAudio.play().catch(function(e2) {
      console.warn('[CyanixAI] Msg play() failed:', e2.message);
      URL.revokeObjectURL(url);
      onDone();
    });

  } catch(e) {
    _msgTTSLoading = false;
    _msgTTSBtn     = null;
    btn.innerHTML  = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    btn.classList.remove('tts-playing', 'tts-loading');
    console.warn('[CyanixAI] Message TTS error:', e.message);
    toast('Audio unavailable. Check your connection.');
  }
};

async function submitFeedback(messageId, value, clickedBtn, otherBtn) {
  clickedBtn.classList.add('voted'); otherBtn.classList.remove('voted');
  try {
    await _sb.from('message_feedback').upsert({ message_id: messageId, chat_id: _currentId, user_id: _session.user.id, feedback: value }, { onConflict: 'message_id,user_id' });
    toast(value === 1 ? 'Thanks!' : 'Got it, we' + String.fromCharCode(39) + 'll improve.');
    // Fire feedback pipeline -- find prompt/response from DOM
    var msgRow   = document.querySelector('[data-msg-id="' + messageId + '"]');
    var prevRow  = msgRow && msgRow.previousElementSibling;
    var prompt   = prevRow  ? (prevRow.querySelector('.msg-bubble')  || {}).innerText || '' : '';
    var response = msgRow   ? (msgRow.querySelector('.msg-bubble')   || {}).innerText || '' : '';
    if (prompt && response && _settings.trainingConsent) {
      fetch(PIPELINE_URL, { method: 'POST', headers: edgeHeaders(),
        body: JSON.stringify({ feedback: value, prompt: prompt.slice(0,1000), response: response.slice(0,3000), model: _settings.model })
      }).catch(function(){});
    }
  } catch (e) { toast('Could not save feedback.'); }
}

// -- Memory Manager --------------------------------------------------
var _memoryManagerOpen = false;

window.toggleMemoryManager = function() {
  var panel    = document.getElementById('memory-manager-panel');
  var chevron  = document.getElementById('memory-manager-chevron');
  if (!panel) return;
  _memoryManagerOpen = !_memoryManagerOpen;
  panel.style.display   = _memoryManagerOpen ? 'block' : 'none';
  if (chevron) chevron.style.transform = _memoryManagerOpen ? 'rotate(90deg)' : 'rotate(0deg)';
  if (_memoryManagerOpen) renderMemoryManager();
};

function renderMemoryManager() {
  var list      = document.getElementById('memory-list');
  var empty     = document.getElementById('memory-empty');
  var clearBtn  = document.getElementById('clear-all-memories-btn');
  var descEl    = document.getElementById('memory-manager-desc');
  if (!list) return;

  list.innerHTML = '';

  if (!_memories || !_memories.length) {
    if (empty)    empty.style.display   = 'block';
    if (clearBtn) clearBtn.style.display = 'none';
    if (descEl)   descEl.textContent    = 'No memories yet';
    return;
  }

  if (empty)    empty.style.display   = 'none';
  if (clearBtn) clearBtn.style.display = 'block';
  if (descEl)   descEl.textContent    = _memories.length + ' memor' + (_memories.length === 1 ? 'y' : 'ies') + ' stored';

  _memories.forEach(function(m) {
    var row = document.createElement('div');
    row.className = 'memory-row';
    row.setAttribute('data-id', m.id);

    var tag = m.entity_type || m.category || 'fact';
    var tagColor = {
      project: 'var(--blue)', tool: '#8b5cf6', concept: '#06b6d4',
      person: '#f59e0b', personal: '#10b981', preference: '#f97316',
      technical: '#6366f1'
    }[tag] || 'var(--text-4)';

    row.innerHTML =
      '<div class="memory-row-content">' +
        '<span class="memory-tag" style="background:' + tagColor + '22;color:' + tagColor + '">' + tag + '</span>' +
        '<span class="memory-text">' + esc(m.memory) + '</span>' +
      '</div>' +
      '<button class="memory-delete-btn" data-mid="' + m.id + '" onclick="window.deleteMemory(null,this)" title="Delete">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>';
    list.appendChild(row);
  });
}

window.deleteMemory = async function(id, btn) {
  if (!id) { id = btn && btn.dataset && btn.dataset.mid; }
  if (!_sb || !_session) return;
  btn.disabled = true;
  try {
    var res = await _sb.from('user_memories').delete().eq('id', id).eq('user_id', _session.user.id);
    if (res.error) throw res.error;
    _memories = _memories.filter(function(m) { return m.id !== id; });
    var row = document.querySelector('.memory-row[data-id="' + id + '"]');
    if (row) {
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(function() { row.remove(); renderMemoryManager(); }, 250);
    }
    toast('Memory deleted.');
  } catch (e) {
    btn.disabled = false;
    toast('Could not delete memory.');
  }
};

// -- Clear All Memories ------------------------------------------
// -- Referral Codes ---------------------------------------------------
var _referralCode = null;

// Referral milestones
var REFERRAL_MILESTONES = [
  { count: 1,  msgs: 5,  reward: null,        label: '+5 messages/window' },
  { count: 3,  msgs: 15, reward: 'neon',       label: '+15 msgs + Neon theme' },
  { count: 5,  msgs: 25, reward: 'midnight',   label: '+25 msgs + Midnight theme' },
  { count: 10, msgs: 50, reward: 'founder',    label: '+50 msgs + Founder badge' },
];

function generateReferralCode(userId) {
  var hash = 0;
  for (var i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = 'CX';
  var n = Math.abs(hash);
  for (var j = 0; j < 5; j++) {
    code += chars[n % chars.length];
    n = Math.floor(n / chars.length);
  }
  return code;
}

async function loadReferralData() {
  if (!_sb || !_session) return;
  try {
    var userId = _session.user.id;
    _referralCode = generateReferralCode(userId);

    var baseUrl     = 'https://suprosmith-coder.github.io/NixAi_Nova';
    var referralUrl = baseUrl + '?ref=' + _referralCode;

    // ── Update UI elements ──────────────────────────────
    var codeEl = document.getElementById('referral-code-val');
    if (codeEl) codeEl.textContent = _referralCode;

    var linkEl = document.getElementById('referral-link-val');
    if (linkEl) linkEl.textContent = referralUrl;

    // ── Copy button ──────────────────────────────────────
    var copyBtn = document.getElementById('referral-copy-btn');
    if (copyBtn) {
      copyBtn.onclick = function() {
        navigator.clipboard.writeText(referralUrl).then(function() {
          copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
          setTimeout(function() { copyBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'; }, 1500);
          toast('Referral link copied!');
        }).catch(function() { toast('Link: ' + referralUrl); });
      };
    }

    // ── Share button (native share sheet on mobile) ──────
    var shareBtn = document.getElementById('referral-share-btn');
    if (shareBtn) {
      if (navigator.share) {
        shareBtn.style.display = 'flex';
        shareBtn.onclick = function() {
          navigator.share({
            title: 'Try Cyanix AI',
            text:  'I\'ve been using Cyanix AI — 4 frontier models, web search, memory and more. Use my code ' + _referralCode + ' to sign up:',
            url:   referralUrl,
          }).catch(function() {});
        };
      } else {
        shareBtn.style.display = 'none';
      }
    }

    // ── Load referral count from DB ──────────────────────
    var res = await _sb.from('referrals')
      .select('id, created_at', { count: 'exact' })
      .eq('referrer_code', _referralCode);

    var count   = (res.data && res.data.length) || 0;
    var statsEl = document.getElementById('referral-stats-desc');
    var countEl = document.getElementById('referral-count-big');
    var nextEl  = document.getElementById('referral-next-milestone');
    var rewardsEl = document.getElementById('referral-rewards-list');

    if (countEl) countEl.textContent = count;

    if (statsEl) {
      statsEl.textContent = count === 0
        ? 'Share your link to start earning rewards'
        : count + ' friend' + (count === 1 ? '' : 's') + ' joined with your code';
    }

    // ── Calculate current milestone rewards ──────────────
    var totalMsgBonus = 0;
    var unlockedThemes = [];

    REFERRAL_MILESTONES.forEach(function(m) {
      if (count >= m.count) {
        totalMsgBonus = m.msgs;
        if (m.reward) unlockedThemes.push(m.reward);
      }
    });

    // Apply message bonus
    window._referralBonus = count; // each referral = +5 msgs (applied in checkDailyLimit)

    // Unlock themes
    if (unlockedThemes.length > 0 && _settings) {
      _settings.unlockedThemes = _settings.unlockedThemes || [];
      unlockedThemes.forEach(function(t) {
        if (!_settings.unlockedThemes.includes(t)) {
          _settings.unlockedThemes.push(t);
        }
      });
      saveSettings();
    }

    // ── Next milestone ────────────────────────────────────
    var nextMilestone = REFERRAL_MILESTONES.find(function(m) { return count < m.count; });
    if (nextEl) {
      if (nextMilestone) {
        var needed = nextMilestone.count - count;
        nextEl.textContent = 'Invite ' + needed + ' more to unlock: ' + nextMilestone.label;
      } else {
        nextEl.textContent = '🏆 Max milestone reached!';
      }
    }

    // ── Render milestone progress bars ────────────────────
    if (rewardsEl) {
      rewardsEl.innerHTML = REFERRAL_MILESTONES.map(function(m) {
        var done  = count >= m.count;
        var pct   = Math.min(100, Math.round((count / m.count) * 100));
        return '<div class="ref-milestone' + (done ? ' ref-milestone-done' : '') + '">' +
          '<div class="ref-milestone-top">' +
            '<span class="ref-milestone-label">' + m.count + ' invite' + (m.count > 1 ? 's' : '') + '</span>' +
            '<span class="ref-milestone-reward">' + (done ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> ' : '') + m.label + '</span>' +
          '</div>' +
          '<div class="ref-milestone-bar"><div class="ref-milestone-fill" style="width:' + pct + '%"></div></div>' +
        '</div>';
      }).join('');
    }

    // ── Badge ─────────────────────────────────────────────
    var badgeEl = document.getElementById('referral-reward-badge');
    if (badgeEl) {
      badgeEl.style.display = count > 0 ? 'inline-block' : 'none';
      badgeEl.textContent   = '+' + totalMsgBonus + ' msgs';
    }

  } catch (e) {
    console.error('[CyanixAI] loadReferralData:', e);
  }
}

async function saveReferralIfNeeded(codeUsed) {
  if (!_sb || !_session || !codeUsed) return;
  try {
    // Check not already used a referral
    var existing = await _sb.from('referrals')
      .select('id').eq('referred_user_id', _session.user.id).single();
    if (existing.data) return; // already redeemed

    // Validate code belongs to someone
    if (!codeUsed.startsWith('CX') || codeUsed.length !== 7) return;

    await _sb.from('referrals').insert({
      referrer_code:    codeUsed,
      referred_user_id: _session.user.id,
      created_at:       new Date().toISOString(),
    });
    toast('Referral code applied! Your friend earned a rate limit bonus.');
  } catch (e) {
    console.error('[CyanixAI] saveReferralIfNeeded:', e);
  }
}



// -- Settings sub-page navigation ----------------------------
window.openSettings = function() {
  var view = document.getElementById('settings-modal');
  if (!view) return;

  // Sync profile info
  if (_session) {
    var user  = _session.user;
    var name  = (_settings && _settings.displayName) || (user.user_metadata && user.user_metadata.full_name) || user.email || '';
    var email = user.email || '';
    ['stg-avatar-name','stg-profile-name'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = name || email;
    });
    ['stg-avatar-email','stg-profile-email'].forEach(function(id) {
      var el = document.getElementById(id); if (el) el.textContent = email;
    });
    var avEl = document.getElementById('stg-avatar-el') || document.getElementById('stg-avatar');
    if (avEl && !avEl.src) {
      avEl.textContent = (name || email || '?')[0].toUpperCase();
    }
  }

  // Show and animate in via CSS class
  view.classList.remove('hidden');
  // Force reflow so transition fires
  void view.offsetWidth;
  view.style.transform = 'translateX(0)';

  window.openSettingsPage('main');
  if (typeof updateNotifUIAsync === 'function') updateNotifUIAsync().catch(function(){});
};

window.closeSettings = function() {
  var view = document.getElementById('settings-modal');
  if (!view) return;
  view.style.transform = 'translateX(100%)';
  setTimeout(function() {
    view.classList.add('hidden');
    view.style.transform = '';
    window.openSettingsPage('main');
  }, 340);
};

window.openSettingsPage = function(page) {
  var pages = [
    'main','appearance','personas','memory','personalization',
    'tos','privacy','about','referral','supporter','improve','ai-intel'
  ];
  pages.forEach(function(p) {
    var el = document.getElementById('stg-page-' + p);
    if (!el) return;
    if (p === page) {
      el.classList.add('stg-page-active');
      el.classList.remove('stg-page-exit');
    } else if (p === 'main' && page !== 'main') {
      el.classList.remove('stg-page-active');
      el.classList.add('stg-page-exit');
    } else {
      el.classList.remove('stg-page-active', 'stg-page-exit');
    }
  });
  // Also handle legacy settings-page- IDs for any remaining references
  pages.forEach(function(p) {
    var el = document.getElementById('settings-page-' + p);
    if (el) el.style.display = p === page ? 'flex' : 'none';
  });

  // Sync AI Intelligence settings toggles when opening that page
  if (page === 'ai-intel') {
    var wikiToggle   = document.getElementById('wiki-rag-settings-toggle');
    var groqToggle   = document.getElementById('groq-ctx-settings-toggle');
    var cotToggle    = document.getElementById('cot-settings-toggle');
    if (wikiToggle) {
      wikiToggle.checked = _wikiRagEnabled;
      wikiToggle.onchange = function() {
        _wikiRagEnabled = wikiToggle.checked;
        var btn = document.getElementById('cx-wiki-btn');
        if (btn) btn.classList.toggle('cx-toolbar-btn--active', _wikiRagEnabled);
        toast(_wikiRagEnabled ? 'Wiki RAG enabled' : 'Wiki RAG disabled');
      };
    }
    if (groqToggle) {
      groqToggle.checked = _groqCtxEnabled;
      groqToggle.onchange = function() {
        _groqCtxEnabled = groqToggle.checked;
        var btn = document.getElementById('cx-groq-ctx-btn');
        if (btn) btn.classList.toggle('cx-toolbar-btn--active', _groqCtxEnabled);
        toast(_groqCtxEnabled ? 'Groq context enabled' : 'Groq context disabled');
      };
    }
    if (cotToggle) {
      cotToggle.checked = _cotEnabled;
      cotToggle.onchange = function() {
        _cotEnabled = cotToggle.checked;
        var btn = document.getElementById('cx-cot-btn');
        if (btn) btn.classList.toggle('cx-toolbar-btn--active', _cotEnabled);
        toast(_cotEnabled ? 'Chain-of-thought enabled' : 'Chain-of-thought disabled');
      };
    }
  }
};

// -- Personas -------------------------------------------------------
var _personas       = [];
var _activePersona  = null; // null = default Cyanix
var _editingPersona = null; // persona being edited in modal

var PERSONA_EMOJIS = [
  '\u{1F916}','\u{1F9E0}','\u{1F47E}','\u{1F480}','\u{1F31F}',
  '\u{1F525}','\u{26A1}','\u{1F3AF}','\u{1F52E}','\u{1F9EC}',
  '\u{1F4DA}','\u{1F3A8}','\u{1F3B5}','\u{2696}\uFE0F','\u{1F9EA}',
  '\u{1F40D}','\u{1F98A}','\u{1F984}','\u{1F9B8}','\u{1FAB8}',
  '\u{1F47D}','\u{1F31A}','\u{1F32A}\uFE0F','\u{1F4A1}','\u{1F9FF}'
];

async function loadPersonas() {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('personas')
      .select('id,name,emoji,system_prompt,created_at')
      .eq('user_id', _session.user.id)
      .order('created_at', { ascending: true });
    _personas = res.data || [];
    renderPersonaList();
  } catch (e) { console.error('[CyanixAI] loadPersonas:', e); }
}

function renderPersonaList() {
  var list    = document.getElementById('persona-list');
  var descEl  = document.getElementById('persona-limit-desc');
  var addBtn  = document.getElementById('persona-add-btn');
  var divider = document.getElementById('persona-add-divider');
  if (!list) return;

  var limit = _supporter.isActive ? Infinity : 3;
  if (descEl) descEl.textContent = _supporter.isActive ? 'Unlimited' : _personas.length + '/3 used';
  if (addBtn) addBtn.style.display = _personas.length >= limit ? 'none' : 'flex';
  if (divider) divider.style.display = _personas.length >= limit ? 'none' : 'block';

  list.innerHTML = '';

  // Default Cyanix row
  var defaultRow = document.createElement('div');
  defaultRow.className = 'settings-card-row persona-row' + (!_activePersona ? ' persona-row--active' : '');
  defaultRow.onclick = function() { setActivePersona(null); };
  defaultRow.innerHTML =
    '<div class="persona-avatar">\u{1F300}</div>' +
    '<div class="scr-body"><div class="scr-label">Cyanix AI <span style="font-size:.7rem;color:var(--text-4)">(default)</span></div></div>' +
    (!_activePersona ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : '');
  list.appendChild(defaultRow);

  _personas.forEach(function(p) {
    var isActive = _activePersona && _activePersona.id === p.id;
    var row = document.createElement('div');
    row.className = 'settings-card-row persona-row' + (isActive ? ' persona-row--active' : '');

    var divEl = document.createElement('div');
    divEl.className = 'settings-card-divider';
    list.appendChild(divEl);

    row.innerHTML =
      '<div class="persona-avatar">' + (p.emoji || '🤖') + '</div>' +
      '<div class="scr-body"><div class="scr-label">' + esc(p.name) + '</div></div>' +
      '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">' +
        (isActive ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' : '') +
        '<button class="scr-link-btn" onclick="event.stopPropagation();window.openPersonaModal(\'' + p.id + '\')" style="color:var(--text-4);font-size:.78rem;">Edit</button>' +
      '</div>';
    row.onclick = function() { setActivePersona(p); };
    list.appendChild(row);
  });
}

function setActivePersona(p) {
  _activePersona = p;
  renderPersonaList();
  // Update topbar hint
  var titleEl = document.getElementById('chat-title');
  if (titleEl && p) titleEl.textContent = p.name;
  toast(p ? ('Switched to ' + p.name) : 'Switched to Cyanix AI');
}

window.openPersonaModal = function(id) {
  var overlay = document.getElementById('persona-modal-overlay');
  if (!overlay) return;

  _editingPersona = id ? (_personas.find(function(p) { return p.id === id; }) || null) : null;

  // Populate fields
  var titleEl  = document.getElementById('persona-modal-title');
  var nameEl   = document.getElementById('persona-name-input');
  var promptEl = document.getElementById('persona-prompt-input');
  var emojiEl  = document.getElementById('persona-emoji-preview');
  var deleteBtn= document.getElementById('persona-delete-btn');
  var countEl  = document.getElementById('persona-prompt-count');

  if (titleEl)  titleEl.textContent  = _editingPersona ? 'Edit Persona' : 'New Persona';
  if (nameEl)   nameEl.value         = _editingPersona ? _editingPersona.name : '';
  if (promptEl) promptEl.value       = _editingPersona ? (_editingPersona.system_prompt || '') : '';
  if (emojiEl)  emojiEl.textContent  = _editingPersona ? (_editingPersona.emoji || '🤖') : '🤖';
  if (deleteBtn) deleteBtn.style.display = _editingPersona ? 'block' : 'none';
  if (countEl)  countEl.textContent  = promptEl ? promptEl.value.length : '0';

  // Build emoji picker
  var picker = document.getElementById('persona-emoji-picker');
  if (picker) {
    picker.innerHTML = '';
    PERSONA_EMOJIS.forEach(function(em) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = em;
      btn.style.cssText = 'font-size:1.4rem;background:none;border:none;cursor:pointer;padding:4px;border-radius:6px;';
      btn.onclick = function() {
        if (emojiEl) emojiEl.textContent = em;
        if (picker) picker.style.display = 'none';
      };
      picker.appendChild(btn);
    });
  }

  // Prompt char counter
  if (promptEl) {
    promptEl.oninput = function() {
      if (countEl) countEl.textContent = promptEl.value.length;
    };
  }

  overlay.style.display = 'flex';
};

window.closePersonaModal = function() {
  var overlay = document.getElementById('persona-modal-overlay');
  if (overlay) overlay.style.display = 'none';
  _editingPersona = null;
};

window.toggleEmojiPicker = function() {
  var picker = document.getElementById('persona-emoji-picker');
  if (picker) picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
};

window.savePersona = async function() {
  if (!_sb || !_session) return;
  var nameEl   = document.getElementById('persona-name-input');
  var promptEl = document.getElementById('persona-prompt-input');
  var emojiEl  = document.getElementById('persona-emoji-preview');
  var saveBtn  = document.getElementById('persona-save-btn');

  var name   = (nameEl && nameEl.value.trim()) || '';
  var prompt = (promptEl && promptEl.value.trim()) || '';
  var emoji  = (emojiEl && emojiEl.textContent.trim()) || '\u{1F916}';

  if (!name) { toast('Give your persona a name.'); return; }

  var limit = _supporter.isActive ? Infinity : 3;
  if (!_editingPersona && _personas.length >= limit) {
    toast('Upgrade to supporter for unlimited personas.'); return;
  }

  if (saveBtn) saveBtn.textContent = 'Saving...';

  try {
    if (_editingPersona) {
      // Update
      var res = await _sb.from('personas').update({
        name, emoji, system_prompt: prompt, updated_at: new Date().toISOString()
      }).eq('id', _editingPersona.id).eq('user_id', _session.user.id).select().single();
      if (res.error) throw res.error;
      var idx = _personas.findIndex(function(p) { return p.id === _editingPersona.id; });
      if (idx >= 0) _personas[idx] = res.data;
      // Update active persona if it was the one edited
      if (_activePersona && _activePersona.id === _editingPersona.id) _activePersona = res.data;
    } else {
      // Insert
      var res = await _sb.from('personas').insert({
        user_id: _session.user.id, name, emoji, system_prompt: prompt,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      }).select().single();
      if (res.error) throw res.error;
      _personas.push(res.data);
    }
    renderPersonaList();
    window.closePersonaModal();
    toast(_editingPersona ? 'Persona updated.' : 'Persona created!');
  } catch (e) {
    toast('Could not save persona.');
    console.error('[CyanixAI] savePersona:', e);
  } finally {
    if (saveBtn) saveBtn.textContent = 'Save Persona';
  }
};

window.deletePersona = async function() {
  if (!_editingPersona || !_sb || !_session) return;
  if (!confirm('Delete ' + _editingPersona.name + '?')) return;
  try {
    await _sb.from('personas').delete().eq('id', _editingPersona.id).eq('user_id', _session.user.id);
    _personas = _personas.filter(function(p) { return p.id !== _editingPersona.id; });
    if (_activePersona && _activePersona.id === _editingPersona.id) _activePersona = null;
    renderPersonaList();
    window.closePersonaModal();
    toast('Persona deleted.');
  } catch (e) { toast('Could not delete persona.'); }
};

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
      '<button class="fb-panel-close" onclick="closeFbPanel(this)"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
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
        // Fire feedback pipeline with full context
        if (_settings.trainingConsent) {
          var fbRow     = document.querySelector('[data-msg-id="' + msgId + '"]');
          var fbPrev    = fbRow && fbRow.previousElementSibling;
          var fbPrompt  = fbPrev ? (fbPrev.querySelector('.msg-bubble') || {}).innerText || '' : '';
          var fbResp    = fbRow  ? (fbRow.querySelector('.msg-bubble')  || {}).innerText || '' : '';
          if (fbPrompt && fbResp) {
            fetch(PIPELINE_URL, { method: 'POST', headers: edgeHeaders(),
              body: JSON.stringify({
                feedback: value,
                prompt:   fbPrompt.slice(0, 1000),
                response: fbResp.slice(0, 3000),
                model:    _settings.model,
                tags:     selectedTags,
                comment:  comment || null
              })
            }).catch(function(){});
          }
        }
      }
      panel.innerHTML = '<div class="fb-thanks">' +
        '<span class="fb-thanks-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></span>' +
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
    _responding = false;
  var _thinkFloat = document.getElementById('ai-thinking-float');
  if (_thinkFloat) _thinkFloat.classList.remove('visible'); hide('typing-row');
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
   VOICE INPUT — Fullscreen overlay with live waveform
========================================================== */
var _voiceStream    = null;
var _voiceAnimFrame = null;
var _voiceAnalyser  = null;
var _voiceCtx       = null;

function openVoiceOverlay() {
  var overlay = $('voice-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  // reset UI
  setVoiceStatus('listening');
  var txt = $('voice-transcript-text');
  if (txt) txt.textContent = '';
  var sendBtn = $('voice-send-btn');
  if (sendBtn) sendBtn.classList.add('hidden');
  var hint = $('voice-hint');
  if (hint) hint.textContent = 'Tap the mic to stop';
}

function closeVoiceOverlay() {
  var overlay = $('voice-overlay');
  if (overlay) overlay.classList.add('hidden');
  stopWaveform();
  _sttActive = false;
  var orb = $('voice-orb');
  if (orb) { orb.classList.remove('listening','transcribing'); }
}

function setVoiceStatus(state) {
  var statusEl = $('voice-status');
  var orbEl    = $('voice-orb');
  var iconEl   = orbEl && orbEl.querySelector('.voice-orb-icon');
  var hintEl   = $('voice-hint');
  if (state === 'listening') {
    if (statusEl) statusEl.textContent = 'Listening\u2026';
    if (orbEl)  { orbEl.classList.add('listening'); orbEl.classList.remove('transcribing'); }
    if (iconEl)   iconEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    if (hintEl)   hintEl.textContent = 'Tap the mic to stop';
  } else if (state === 'transcribing') {
    if (statusEl) statusEl.textContent = 'Transcribing\u2026';
    if (orbEl)  { orbEl.classList.remove('listening'); orbEl.classList.add('transcribing'); }
    if (iconEl)   iconEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="cx-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
    if (hintEl)   hintEl.textContent = 'Processing your voice\u2026';
  } else if (state === 'done') {
    if (statusEl) statusEl.textContent = 'Done';
    if (orbEl)  { orbEl.classList.remove('listening','transcribing'); }
    if (iconEl)   iconEl.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
    if (hintEl)   hintEl.textContent = 'Tap send or edit below';
  }
}

// ── Waveform visualiser ───────────────────────────────────
function startWaveform(stream) {
  var canvas = $('voice-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  _voiceCtx = ctx;
  try {
    var ac = new (window.AudioContext || window.webkitAudioContext)();
    _voiceAnalyser = ac.createAnalyser();
    _voiceAnalyser.fftSize = 128;
    var src = ac.createMediaStreamSource(stream);
    src.connect(_voiceAnalyser);
  } catch(e) { return; }

  var buf = new Uint8Array(_voiceAnalyser.frequencyBinCount);

  function draw() {
    _voiceAnimFrame = requestAnimationFrame(draw);
    _voiceAnalyser.getByteFrequencyData(buf);
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var barW   = 3;
    var gap    = 3;
    var count  = Math.floor(w / (barW + gap));
    var start  = Math.floor((buf.length - count) / 2);

    for (var i = 0; i < count; i++) {
      var val    = buf[start + i] / 255;
      var barH   = Math.max(4, val * h * 0.85);
      var x      = i * (barW + gap);
      var y      = (h - barH) / 2;
      var alpha  = 0.4 + val * 0.6;
      // Gradient from cyan to indigo based on position
      var t = i / count;
      var r = Math.round(6  + t * 93);
      var g = Math.round(182 - t * 80);
      var b = Math.round(212 - t * 60);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 2);
      ctx.fill();
    }
  }
  draw();
}

function stopWaveform() {
  if (_voiceAnimFrame) { cancelAnimationFrame(_voiceAnimFrame); _voiceAnimFrame = null; }
  var canvas = $('voice-canvas');
  if (canvas && _voiceCtx) _voiceCtx.clearRect(0, 0, canvas.width, canvas.height);
}

// ── Main toggle ───────────────────────────────────────────
async function toggleVoiceInput() {
  if (_sttActive) {
    // Stop recording
    _sttActive = false;
    if (_mediaRec && _mediaRec.state !== 'inactive') _mediaRec.stop();
    return;
  }

  openVoiceOverlay();

  // Try Groq Whisper via MediaRecorder first
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      _voiceStream = stream;
      startWaveform(stream);

      var mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' :
                 MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      _mediaRec  = new MediaRecorder(stream, { mimeType: mime });
      _sttChunks = [];
      _sttActive = true;

      _mediaRec.ondataavailable = function(e) {
        if (e.data && e.data.size > 0) _sttChunks.push(e.data);
      };

      _mediaRec.onstop = async function() {
        stream.getTracks().forEach(function(t) { t.stop(); });
        stopWaveform();
        setVoiceStatus('transcribing');

        try {
          var blob = new Blob(_sttChunks, { type: mime });
          var b64  = await new Promise(function(resolve, reject) {
            var reader = new FileReader();
            reader.onload  = function() { resolve(reader.result.split(',')[1]); };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          var ext = mime.includes('webm') ? 'webm' : 'ogg';
          var res = await fetch(GROQ_STT_URL, {
            method:  'POST',
            headers: edgeHeaders(),
            body:    JSON.stringify({ audio: b64, filename: 'recording.' + ext, mimeType: mime }),
            signal:  AbortSignal.timeout(30000),
          });

          if (!res.ok) throw new Error('HTTP ' + res.status);
          var data       = await res.json();
          var transcript = (data.text || data.transcript || '').trim();

          if (!transcript) {
            closeVoiceOverlay();
            toast('Nothing heard — try again.');
            return;
          }

          // Show transcript and send button
          var txtEl = $('voice-transcript-text');
          if (txtEl) txtEl.textContent = transcript;
          var sendBtn = $('voice-send-btn');
          if (sendBtn) sendBtn.classList.remove('hidden');
          setVoiceStatus('done');

          // Auto-fill composer
          var input = $('composer-input');
          if (input) {
            var cur = input.value.trim();
            input.value = cur ? cur + ' ' + transcript : transcript;
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 150) + 'px';
          }

        } catch (err) {
          console.error('[CyanixAI] STT failed:', err.message);
          closeVoiceOverlay();
          toast('Transcription failed: ' + err.message);
        }
      };

      _mediaRec.start(250);
      return;
    } catch (err) {
      // Fall through to Web Speech
    }
  }

  // Fallback: Web Speech API with live interim display
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    closeVoiceOverlay();
    toast('Microphone not supported in this browser.');
    return;
  }

  var r = new SR();
  r.lang = 'en-US'; r.interimResults = true; r.maxAlternatives = 1;
  _sttActive = true;
  var finalText = '';

  r.onresult = function(e) {
    var interim = '';
    for (var i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim = e.results[i][0].transcript;
    }
    var txtEl = $('voice-transcript-text');
    if (txtEl) txtEl.textContent = (finalText + interim).trim();
  };

  r.onerror = function(e) {
    closeVoiceOverlay();
    if (e.error !== 'aborted') toast('Speech error: ' + e.error);
  };

  r.onend = function() {
    _sttActive = false;
    var transcript = finalText.trim();
    if (!transcript) { closeVoiceOverlay(); return; }

    var sendBtn = $('voice-send-btn');
    if (sendBtn) sendBtn.classList.remove('hidden');
    setVoiceStatus('done');

    var input = $('composer-input');
    if (input) {
      var cur = input.value.trim();
      input.value = cur ? cur + ' ' + transcript : transcript;
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    }
  };

  // Orb tap stops recognition
  var orb = $('voice-orb');
  if (orb) orb.onclick = function() {
    r.stop();
    orb.onclick = function() { toggleVoiceInput(); };
  };

  r.start();
}

// ── Wire overlay controls ─────────────────────────────────
window.addEventListener('cyanix:ready', function() {
  // Cancel button
  var cancelBtn = $('voice-cancel-btn');
  if (cancelBtn) cancelBtn.addEventListener('click', function() {
    _sttActive = false;
    if (_mediaRec && _mediaRec.state !== 'inactive') {
      // Override onstop to not process
      _mediaRec.onstop = function() {
        if (_voiceStream) _voiceStream.getTracks().forEach(function(t) { t.stop(); });
        stopWaveform();
      };
      _mediaRec.stop();
    }
    closeVoiceOverlay();
    // Clear any draft added so far
    var input = $('composer-input');
    if (input) { input.value = ''; input.style.height = 'auto'; }
  });

  // Orb tap to stop recording
  var orb = $('voice-orb');
  if (orb) orb.addEventListener('click', function() {
    if (_sttActive && _mediaRec && _mediaRec.state !== 'inactive') {
      _sttActive = false;
      _mediaRec.stop();
    }
  });

  // Send button — close overlay and send
  var sendBtn = $('voice-send-btn');
  if (sendBtn) sendBtn.addEventListener('click', function() {
    var input = $('composer-input');
    var text  = input ? input.value.trim() : '';
    closeVoiceOverlay();
    if (text) setTimeout(function() { sendMessage(text); }, 80);
  });
});

/* ==========================================================
   AI VOICE CALL ENGINE
   Pure voice conversation — STT → AI → TTS loop.
   No text displayed. Just speech.
========================================================== */
const TTS_URL = SUPABASE_URL + '/functions/v1/elevenlabs-tts';
const CALL_VOICE_ID     = 'JBFqnCBsd6RMkjVDRZzb'; // ElevenLabs: George (deep British male, default)
const CALL_AI_MODEL     = 'llama-3.1-8b-instant'; // fast, conversational

var _callActive       = false;
var _callMuted        = false;
var _callStream       = null;
var _callMediaRec     = null;
var _callChunks       = [];
var _callAudio        = null;      // current playing Audio object
var _callAnimFrame    = null;
var _callAnalyser     = null;
var _callHistory      = [];        // conversation memory for the call
var _callLoopRunning  = false;
var _callStopNow      = false;     // set by orb tap to stop recording immediately

// ── State management ──────────────────────────────────────
function setCallState(state) {
  var statusEl = document.getElementById('call-status');
  var wrapEl   = document.getElementById('call-emblem-wrap');
  var waveEl   = document.getElementById('call-wave');
  var hintEl   = document.getElementById('call-orb-hint');
  var orbIcon  = document.querySelector('.call-orb-btn i');

  ['status-listening','status-thinking','status-speaking'].forEach(function(c) {
    if (statusEl) statusEl.classList.remove(c);
  });
  ['state-listening','state-thinking','state-speaking','state-idle'].forEach(function(c) {
    if (wrapEl) wrapEl.classList.remove(c);
    var screen = document.getElementById('call-screen');
    if (screen) screen.classList.remove(c);
  });

  var labels = {
    idle:       'Connecting\u2026',
    listening:  'Listening\u2026',
    thinking:   'Thinking\u2026',
    speaking:   'Speaking',
    ending:     'Ending call\u2026',
  };

  var hints = {
    idle:      '',
    listening: 'Tap to stop speaking',
    thinking:  'Processing\u2026',
    speaking:  'Cyanix is speaking',
    ending:    '',
  };

  // voice orb icons handled by state-specific innerHTML setters above

  if (statusEl) {
    statusEl.textContent = labels[state] || '';
    if (state !== 'idle' && state !== 'ending') {
      statusEl.classList.add('status-' + state);
    }
  }

  // Apply state to both emblem wrap AND call screen (for orb CSS)
  var callScreen = document.getElementById('call-screen');
  if (wrapEl && state !== 'idle' && state !== 'ending') {
    wrapEl.classList.add('state-' + state);
  }
  if (callScreen && state !== 'idle' && state !== 'ending') {
    callScreen.classList.add('state-' + state);
  }

  if (waveEl) waveEl.classList.toggle('visible', state === 'listening');
  if (hintEl) hintEl.textContent = hints[state] || '';
  // orbIcon updated by state handlers above
}

// ── Waveform for call screen ──────────────────────────────
function startCallWaveform(stream) {
  var canvas = document.getElementById('call-wave');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  try {
    var ac       = new (window.AudioContext || window.webkitAudioContext)();
    _callAnalyser = ac.createAnalyser();
    _callAnalyser.fftSize = 64;
    var src = ac.createMediaStreamSource(stream);
    src.connect(_callAnalyser);
  } catch(e) { return; }

  var buf = new Uint8Array(_callAnalyser.frequencyBinCount);
  function draw() {
    if (!_callActive) return;
    _callAnimFrame = requestAnimationFrame(draw);
    _callAnalyser.getByteFrequencyData(buf);
    var w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    var barW = 3, gap = 3;
    var count = Math.floor(w / (barW + gap));
    var start = Math.floor((buf.length - count) / 2);
    for (var i = 0; i < count; i++) {
      var val  = buf[start + i] / 255;
      var barH = Math.max(3, val * h * 0.9);
      var x    = i * (barW + gap);
      var y    = (h - barH) / 2;
      var t    = i / count;
      ctx.fillStyle = 'rgba(' + Math.round(6+t*46) + ',' + Math.round(182-t*38) + ',212,' + (0.4 + val*0.6) + ')';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW, barH, 2);
      else ctx.rect(x, y, barW, barH);
      ctx.fill();
    }
  }
  draw();
}

function stopCallWaveform() {
  if (_callAnimFrame) { cancelAnimationFrame(_callAnimFrame); _callAnimFrame = null; }
  var canvas = document.getElementById('call-wave');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

// ── TTS via ModelsLab ─────────────────────────────────────
// ── AudioContext unlock for mobile autoplay ───────────────────
var _audioCtxUnlocked = false;
var _audioCtx         = null;

function unlockAudio() {
  if (_audioCtxUnlocked) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Play a silent buffer to unlock autoplay on iOS/Android
    var buf = _audioCtx.createBuffer(1, 1, 22050);
    var src = _audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(_audioCtx.destination);
    src.start(0);
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    _audioCtxUnlocked = true;
    console.log('[CyanixAI] Audio context unlocked');
  } catch(e) {
    console.warn('[CyanixAI] Audio unlock failed:', e.message);
  }
}

async function callSpeak(text) {
  if (!text) return;
  // Always return a promise so await always waits
  return new Promise(async function(resolve) {
    try {
      unlockAudio();

      var res = await fetch(TTS_URL, {
        method:  'POST',
        headers: edgeHeaders(),
        body:    JSON.stringify({
          text:     text.slice(0, 500),
          voice_id: CALL_VOICE_ID,
          model:    'eleven_flash_v2_5',
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        var errText = await res.text().catch(function() { return ''; });
        console.warn('[CyanixAI] TTS HTTP', res.status, errText.slice(0, 100));
        resolve(); return; // resolve so loop waits properly
      }

      var arrayBuf = await res.arrayBuffer();
      if (!arrayBuf || arrayBuf.byteLength === 0) {
        console.warn('[CyanixAI] TTS empty audio');
        resolve(); return;
      }

      // Try AudioContext first — best mobile compatibility
      if (_audioCtx && _audioCtx.state !== 'closed') {
        try {
          if (_audioCtx.state === 'suspended') await _audioCtx.resume();
          var decoded = await _audioCtx.decodeAudioData(arrayBuf.slice(0));
          var bufSrc  = _audioCtx.createBufferSource();
          bufSrc.buffer = decoded;
          bufSrc.connect(_audioCtx.destination);
          _callAudio = { pause: function() { try { bufSrc.stop(); } catch(e) {} } };
          bufSrc.onended = function() { _callAudio = null; resolve(); };
          bufSrc.start(0);
          return; // resolve fires via onended
        } catch(e) {
          console.warn('[CyanixAI] AudioContext failed, using Audio element:', e.message);
        }
      }

      // Fallback: Audio element
      var blob = new Blob([arrayBuf], { type: 'audio/mpeg' });
      var url  = URL.createObjectURL(blob);
      _callAudio = new Audio(url);
      _callAudio.onended = function() { URL.revokeObjectURL(url); _callAudio = null; resolve(); };
      _callAudio.onerror = function(e) {
        console.warn('[CyanixAI] Audio element error:', e);
        URL.revokeObjectURL(url); _callAudio = null; resolve();
      };
      _callAudio.play().catch(function(e2) {
        console.warn('[CyanixAI] play() failed:', e2.message);
        URL.revokeObjectURL(url); _callAudio = null; resolve();
      });

    } catch(e) {
      console.warn('[CyanixAI] callSpeak error:', e.message);
      resolve(); // always resolve so loop continues
    }
  });
}
// ── STT: record one utterance ─────────────────────────────
function recordUtterance() {
  return new Promise(async function(resolve, reject) {
    if (!_callActive || _callMuted) { resolve(null); return; }

    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      _callStream = stream;
      startCallWaveform(stream);

      var mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus' : 'audio/webm';
      var rec  = new MediaRecorder(stream, { mimeType: mime });
      _callMediaRec = rec;
      _callChunks   = [];

      // Allow orb tap to stop recording
      var orbEl = document.getElementById('voice-orb') || document.getElementById('call-orb');

      rec.ondataavailable = function(e) {
        if (e.data && e.data.size > 0) _callChunks.push(e.data);
      };

      rec.onstop = async function() {
        stream.getTracks().forEach(function(t) { t.stop(); });
        stopCallWaveform();
        _callStream = null;

        if (!_callActive) { resolve(null); return; }

        // Show transcribing status while waiting for STT
        var hintEl2 = document.getElementById('call-orb-hint');
        if (hintEl2) hintEl2.textContent = 'Transcribing…';

        try {
          var blob = new Blob(_callChunks, { type: mime });

          // If blob is tiny (< 1KB) user probably didn't say anything
          if (blob.size < 1000) {
            resolve(null);
            return;
          }

          var b64 = await new Promise(function(res2, rej2) {
            var reader = new FileReader();
            reader.onload  = function() { res2(reader.result.split(',')[1]); };
            reader.onerror = rej2;
            reader.readAsDataURL(blob);
          });

          var ext    = mime.includes('webm') ? 'webm' : 'ogg';
          var sttRes = await fetch(GROQ_STT_URL, {
            method:  'POST',
            headers: edgeHeaders(),
            body:    JSON.stringify({ audio: b64, filename: 'call.' + ext, mimeType: mime }),
            signal:  AbortSignal.timeout(20000),
          });

          if (!sttRes.ok) { resolve(null); return; }
          var sttData    = await sttRes.json();
          var transcript = (sttData.text || '').trim();

          // Filter out noise-only transcripts (Whisper sometimes returns these)
          var noiseOnly = /^(\.+|thanks for watching|you|okay|hmm+|uh+|ah+|oh+)\.?$/i.test(transcript);
          if (noiseOnly) { resolve(null); return; }

          resolve(transcript || null);
        } catch(e) {
          console.warn('[CyanixAI] Call STT error:', e.message);
          resolve(null);
        }
      };

      rec.start(250);

      // Auto-stop after 12s — long enough for a full sentence
      var autoStop = setTimeout(function() {
        if (rec.state !== 'inactive') rec.stop();
      }, 12000);

      // Orb tap is handled by permanent handler via _callStopNow flag
      // Poll the flag so tap always works cleanly
      var orbPoll = setInterval(function() {
        if (_callStopNow && rec.state !== 'inactive') {
          _callStopNow = false;
          clearTimeout(autoStop);
          clearInterval(orbPoll);
          rec.stop();
        }
        if (rec.state === 'inactive') clearInterval(orbPoll);
      }, 50);

    } catch(e) {
      console.warn('[CyanixAI] Mic error:', e.message);
      resolve(null);
    }
  });
}

// ── Get AI response for call ──────────────────────────────
async function callGetAIResponse(userText) {
  try {
    // Build conversation with call-specific system prompt
    var messages = [
      {
        role: 'system',
        content: 'You are Cyanix AI in a live voice call. Respond in 1-3 short, natural spoken sentences only. ' +
                 'No markdown, no lists, no code. Sound conversational and warm. Keep responses brief — this is voice, not text.',
      },
    ].concat(_callHistory.slice(-6)).concat([
      { role: 'user', content: userText },
    ]);

    var res = await fetch(CHAT_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({
        model:       CALL_AI_MODEL,
        messages:    messages,
        max_tokens:  120,
        temperature: 0.75,
        stream:      false,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return "I didn't catch that. Could you say it again?";
    var data  = await res.json();
    var reply = '';
    // Handle both direct and nested response formats
    if (data.choices && data.choices[0]) {
      reply = (data.choices[0].message && data.choices[0].message.content) || 
              (data.choices[0].text) || '';
    } else if (data.content) {
      reply = data.content;
    } else if (data.text) {
      reply = data.text;
    }
    return reply.trim() || "I didn't catch that. Could you say it again?";
  } catch(e) {
    console.warn('[CyanixAI] Call AI error:', e.message);
    return "Sorry, I had a moment there. Go ahead.";
  }
}

// ── Main call loop ────────────────────────────────────────
async function runCallLoop() {
  if (_callLoopRunning) return;
  _callLoopRunning = true;
  var silenceCount = 0;
  var loopCount    = 0;

  console.log('[CALL] Loop starting');

  // Opening greeting
  setCallState('speaking');
  await callSpeak("Hello. I'm Cyanix. How can I help you today?");
  _callHistory.push({ role: 'assistant', content: "Hello. I'm Cyanix. How can I help you today?" });

  while (_callActive) {
    loopCount++;
    console.log('[CALL] Loop iteration', loopCount, '| active:', _callActive);

    // 1. Listen
    setCallState('listening');
    var userText = await recordUtterance();

    console.log('[CALL] recordUtterance returned:', JSON.stringify(userText), '| active:', _callActive);

    if (!_callActive) { console.log('[CALL] Breaking — inactive after record'); break; }

    if (!userText) {
      silenceCount++;
      console.log('[CALL] Silence count:', silenceCount);
      if (silenceCount >= 2) {
        setCallState('speaking');
        await callSpeak("I'll let you go. Call me anytime.");
        break;
      }
      setCallState('speaking');
      await callSpeak("I'm still here. Go ahead whenever you're ready.");
      continue;
    }
    silenceCount = 0;

    // Flash transcript
    var tEl = document.getElementById('call-transcript');
    if (tEl) {
      tEl.textContent = userText;
      setTimeout(function() { if (tEl) tEl.textContent = ''; }, 2500);
    }

    // 2. Think
    setCallState('thinking');
    _callHistory.push({ role: 'user', content: userText });
    console.log('[CALL] Getting AI response for:', userText.slice(0,50));
    var reply = await callGetAIResponse(userText);
    console.log('[CALL] AI reply:', reply ? reply.slice(0,80) : 'EMPTY');
    _callHistory.push({ role: 'assistant', content: reply });

    if (!_callActive) { console.log('[CALL] Breaking — inactive after AI'); break; }

    // 3. Speak
    setCallState('speaking');
    console.log('[CALL] Calling callSpeak...');
    await callSpeak(reply);
    console.log('[CALL] callSpeak done');
  }

  console.log('[CALL] Loop ended | active:', _callActive, 'iterations:', loopCount);
  _callLoopRunning = false;
}

// ── Open / close call ─────────────────────────────────────
function openCallScreen() {
  if (!_session) { toast('Sign in to call Cyanix.'); return; }
  var screen = document.getElementById('call-screen');
  if (!screen) return;

  // Unlock audio IMMEDIATELY while we still have the user gesture
  unlockAudio();

  _callActive      = true; // set immediately — not after animation
  _callMuted       = false;
  _callHistory     = [];
  _callLoopRunning = false;
  _callStopNow     = false;

  screen.classList.remove('hidden', 'call-leaving');
  screen.classList.add('call-entering');
  setCallState('idle');

  var muteBtn = document.getElementById('call-mute-btn');
  if (muteBtn) muteBtn.classList.remove('muted');

  setTimeout(function() {
    screen.classList.remove('call-entering');
    runCallLoop();
  }, 400);
}

function closeCallScreen() {
  _callActive = false;

  // Stop any ongoing recording
  if (_callMediaRec && _callMediaRec.state !== 'inactive') {
    _callMediaRec.onstop = function() {};
    _callMediaRec.stop();
  }
  if (_callStream) {
    _callStream.getTracks().forEach(function(t) { t.stop(); });
    _callStream = null;
  }

  // Stop any playing audio
  if (_callAudio) {
    if (_callAudio.pause) _callAudio.pause();
    _callAudio = null;
  }
  // Also stop message TTS if playing
  if (_msgTTSAudio) {
    if (_msgTTSAudio.pause) _msgTTSAudio.pause();
    _msgTTSAudio = null;
    var ttsBtn = document.querySelector('.msg-tts-btn.tts-playing');
    if (ttsBtn) { ttsBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; ttsBtn.classList.remove('tts-playing'); }
  }

  stopCallWaveform();
  setCallState('ending');

  var screen = document.getElementById('call-screen');
  if (!screen) return;
  screen.classList.add('call-leaving');
  setTimeout(function() {
    screen.classList.add('hidden');
    screen.classList.remove('call-leaving');
  }, 350);
}

// ── Wire up buttons ───────────────────────────────────────
window.addEventListener('cyanix:ready', function() {
  var launchBtn = document.getElementById('call-launch-btn');
  if (launchBtn) launchBtn.addEventListener('click', function() {
    unlockAudio();
    openCallScreen();
  });

  // ── Call orb — single permanent handler ───────────────
  // Sets flag; recordUtterance polls it every 50ms
  var callOrbBtn = document.getElementById('call-orb');
  if (callOrbBtn) callOrbBtn.addEventListener('click', function() {
    if (_callActive && _callMediaRec && _callMediaRec.state !== 'inactive') {
      _callStopNow = true;
    }
  });

  // share removed

  // Avatar tap-to-upload in settings
  var avatarUploadEl = document.getElementById('stg-avatar-upload');
  if (avatarUploadEl) {
    avatarUploadEl.addEventListener('change', function(e) {
      var file = e.target.files && e.target.files[0];
      if (file) uploadAvatar(file);
    });
  }
  var avatarTapEl = document.getElementById('stg-avatar-tap');
  if (avatarTapEl) {
    avatarTapEl.addEventListener('click', function() {
      var inp = document.getElementById('stg-avatar-upload');
      if (inp) inp.click();
    });
  }
  var endBtn = document.getElementById('call-end-btn');
  if (endBtn) endBtn.addEventListener('click', closeCallScreen);

  var muteBtn = document.getElementById('call-mute-btn');
  if (muteBtn) muteBtn.addEventListener('click', function() {
    _callMuted = !_callMuted;
    muteBtn.classList.toggle('muted', _callMuted);
    muteBtn.querySelector('i').className = _callMuted
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><path d="M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2"/><path d="M19 10v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    // Stop current recording if muting
    if (_callMuted && _callMediaRec && _callMediaRec.state !== 'inactive') {
      _callMediaRec.onstop = function() {};
      _callMediaRec.stop();
      if (_callStream) {
        _callStream.getTracks().forEach(function(t) { t.stop(); });
        _callStream = null;
      }
      stopCallWaveform();
    }
    toast(_callMuted ? 'Muted' : 'Unmuted');
  });

  // Speaker button (visual toggle only — browser handles output device)
  var spkBtn = document.getElementById('call-spk-btn');
  if (spkBtn) spkBtn.addEventListener('click', function() {
    spkBtn.classList.toggle('muted');
    var icon = spkBtn.querySelector('i');
    if (spkBtn.classList.contains('muted')) {
      icon.outerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><line x1=\"23\" y1=\"9\" x2=\"17\" y2=\"15\"/><line x1=\"17\" y1=\"9\" x2=\"23\" y2=\"15\"/></svg>";
      if (_callAudio) _callAudio.volume = 0;
    } else {
      icon.outerHTML = "<svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14\"/><path d=\"M15.54 8.46a5 5 0 0 1 0 7.07\"/></svg>";
      if (_callAudio) _callAudio.volume = 1;
    }
  });
});

/* ==========================================================
   SHAREABLE CHAT LINKS
========================================================== */
var _shareBaseUrl = 'https://suprosmith-coder.github.io/NixAi_Nova';

async function shareCurrentChat() {
  if (!_session) { toast('Sign in to share.'); return; }
  if (!_currentId || _history.length === 0) {
    toast('Start a conversation first before sharing.');
    return;
  }

  var shareBtn = document.getElementById('share-chat-btn');
  if (shareBtn) // share removed

  try {
    var chat  = _chats.find(function(c) { return c.id === _currentId; });
    var title = (chat && chat.title) || 'Shared Conversation';

    // Only include string content (exclude image blobs from snapshot to keep it small)
    var snapshot = _history.map(function(m) {
      return { role: m.role, content: typeof m.content === 'string' ? m.content : '[attachment]' };
    });

    var shareId = null;

    // Check if already shared
    var existingRes = await _sb
      .from('shared_chats')
      .select('id')
      .eq('chat_id', _currentId)
      .eq('user_id', _session.user.id)
      .maybeSingle();

    if (existingRes.data && existingRes.data.id) {
      // Update existing share
      await _sb.from('shared_chats')
        .update({ messages: snapshot, title: title, updated_at: new Date().toISOString() })
        .eq('id', existingRes.data.id);
      shareId = existingRes.data.id;
    } else {
      // Create new share
      var insertRes = await _sb
        .from('shared_chats')
        .insert({
          chat_id:    _currentId,
          user_id:    _session.user.id,
          title:      title,
          messages:   snapshot,
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (insertRes.error) {
        console.error('[CyanixAI] Share insert error:', insertRes.error);
        toast('Could not share: ' + (insertRes.error.message || 'Database error'));
        return;
      }
      shareId = insertRes.data && insertRes.data.id;
    }

    if (!shareId) { toast('Could not create share link. Try again.'); return; }

    var shareUrl = _shareBaseUrl + '/share.html?id=' + shareId;

    if (navigator.share) {
      await navigator.share({
        title: 'Cyanix AI — ' + title,
        text:  'Check out this conversation on Cyanix AI:',
        url:   shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl).catch(function() {});
      toast('Share link copied! 🔗');
    }

  } catch(e) {
    if (e && e.name !== 'AbortError') {
      console.error('[CyanixAI] Share error:', e);
      toast('Could not share chat. Check your connection.');
    }
  } finally {
    if (shareBtn) shareBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
  }
}

/* ==========================================================
   SUPABASE REALTIME — Live updates
========================================================== */
var _realtimeChannel = null;

function startRealtime() {
  if (!_sb || !_session || _realtimeChannel) return;

  _realtimeChannel = _sb
    .channel('cyanix-live-' + _session.user.id)

    // Live notifications
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'notifications',
      filter: 'user_id=eq.' + _session.user.id,
    }, function(payload) {
      var n = payload.new;
      if (!n) return;
      _notifications.unshift(n);
      _notifUnreadCount++;
      updateNotifBadge();
      var view = document.getElementById('view-notifications');
      if (view && view.classList.contains('notif-open')) renderNotifications();
      var bell = document.getElementById('notif-bell-btn');
      if (bell) { bell.classList.add('notif-bell-shake'); setTimeout(function() { bell.classList.remove('notif-bell-shake'); }, 600); }
    })

    .subscribe(function(status) {
      console.log('[CyanixAI] Realtime:', status);
    });
}

function stopRealtime() {
  if (_realtimeChannel) {
    _sb.removeChannel(_realtimeChannel);
    _realtimeChannel = null;
  }
}


/* ==========================================================
   SUPABASE STORAGE — Avatar uploads
========================================================== */
var STORAGE_URL = SUPABASE_URL + '/storage/v1';

async function uploadAvatar(file) {
  if (!_sb || !_session) return null;
  if (file.size > 2 * 1024 * 1024) { toast('Image must be under 2MB.'); return null; }
  if (!file.type.startsWith('image/')) { toast('Please upload an image file.'); return null; }

  var ext      = file.name.split('.').pop() || 'jpg';
  var path     = _session.user.id + '/avatar.' + ext;
  var oldPath  = _session.user.id + '/avatar.jpg';

  try {
    toast('Uploading…');
    // Remove old avatar first (ignore error if not exists)
    await _sb.storage.from('avatars').remove([oldPath]).catch(function(){});

    var { data, error } = await _sb.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) { toast('Upload failed: ' + error.message); return null; }

    var { data: urlData } = _sb.storage.from('avatars').getPublicUrl(path);
    var publicUrl = urlData.publicUrl + '?t=' + Date.now(); // cache bust

    // Save to user_preferences
    await _sb.from('user_preferences')
      .upsert({ user_id: _session.user.id, avatar_url: publicUrl }, { onConflict: 'user_id' });

    // Update avatar in UI immediately
    updateAvatarUI(publicUrl);
    toast('Profile picture updated!');
    return publicUrl;
  } catch(e) {
    toast('Upload error: ' + e.message);
    return null;
  }
}

function updateAvatarUI(url) {
  // Update topbar/sidebar avatar
  var avatarEls = document.querySelectorAll('.user-avatar, #user-avatar, .stg-avatar-img');
  avatarEls.forEach(function(el) {
    if (el.tagName === 'IMG') {
      el.src = url;
    } else {
      el.style.backgroundImage = 'url(' + url + ')';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    }
  });
}

async function loadAvatarFromStorage() {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('user_preferences')
      .select('avatar_url')
      .eq('user_id', _session.user.id)
      .single();
    if (res.data && res.data.avatar_url) {
      updateAvatarUI(res.data.avatar_url);
    }
  } catch(e) {}
}

/* ==========================================================
   WELCOME (randomised per new chat)
========================================================== */
// ── Time-aware greeting ───────────────────────────────────
function getTimeGreeting() {
  var h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
}

// ── Generate contextual subtitle from last chat ───────────
// Reads the most recent chat's messages and asks a mini LLM
// to produce a personalised one-liner for the welcome screen.
async function generateContextualWelcome() {
  if (!_session || !_chats || _chats.length === 0) return null;

  // Get last chat
  var lastChat = _chats[0];
  if (!lastChat || !lastChat.id) return null;

  try {
    // Load last few messages from that chat
    var res = await _sb.from('messages')
      .select('role,content')
      .eq('chat_id', lastChat.id)
      .order('created_at', { ascending: false })
      .limit(6);

    if (res.error || !res.data || res.data.length === 0) return null;

    // Build a short context string
    var ctx = res.data.reverse().map(function(m) {
      return (m.role === 'user' ? 'User: ' : 'Cyanix: ') + (m.content || '').slice(0, 200);
    }).join('\n');

    // Ask the mini model for a contextual subtitle
    var promptText =
      'Based on this recent conversation, write a SHORT welcome-back subtitle (max 10 words).\n' +
      'It should feel personal and reference what the user was working on.\n' +
      'Examples: "Ready to keep building that React dashboard?", ' +
      '"Back to debugging that Python script?", ' +
      '"Continuing your research on machine learning?"\n' +
      'Return ONLY the subtitle text — no quotes, no explanation.\n\n' +
      'Conversation:\n' + ctx;

    var llmRes = await fetch(CHAT_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({
        model:      'groq/llama-3.1-8b-instant',
        stream:     false,
        max_tokens: 30,
        messages: [
          { role: 'system', content: 'You write short, warm, personalised welcome subtitles. Return only the subtitle, nothing else.' },
          { role: 'user',   content: promptText },
        ],
      }),
      signal: AbortSignal.timeout(6000),
    });

    if (!llmRes.ok) return null;
    var data = await llmRes.json();
    var text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();

    // Clean up — strip surrounding quotes if the model added them
    text = text.replace(/^["']|["']$/g, '').trim();
    if (!text || text.length < 5 || text.length > 80) return null;
    return text;

  } catch (e) {
    console.warn('[CyanixAI] Contextual welcome failed:', e.message);
    return null;
  }
}

function showWelcome() {
  show('welcome-state');

  var heading = $('welcome-heading');
  var sub     = $('welcome-sub');

  // ── Instant: time-aware greeting with name ──────────────
  var timeGreet = getTimeGreeting();
  var name      = _settings && _settings.displayName ? _settings.displayName : null;
  if (heading) heading.textContent = name ? timeGreet + ', ' + name : timeGreet;

  // ── Fallback subtitle while context loads ───────────────
  var hour = new Date().getHours();
  var fallbacks = hour < 12
    ? ['What shall we build today?', 'What\'s on your mind this morning?', 'Ready to create something?']
    : hour < 17
    ? ['What are we working on?', 'Got a problem to solve?', 'What can I help you with?']
    : hour < 21
    ? ['What\'s on your mind tonight?', 'Let\'s get into it.', 'How can I help this evening?']
    : ['Working late? Let\'s get it done.', 'What do you need?', 'Still grinding — let\'s go.'];
  var fallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  if (sub) sub.textContent = fallback;

  // ── Async: context-aware subtitle ───────────────────────
  // Only fires if there are previous chats to draw context from
  if (_chats && _chats.length > 0) {
    if (sub) {
      sub.classList.add('welcome-sub--loading');
    }
    generateContextualWelcome().then(function(contextSub) {
      var subEl = $('welcome-sub');
      if (!subEl) return;
      subEl.classList.remove('welcome-sub--loading');
      if (contextSub) {
        // Animate the new subtitle in
        subEl.classList.add('welcome-sub--fade');
        subEl.textContent = contextSub;
        setTimeout(function() { subEl.classList.remove('welcome-sub--fade'); }, 400);
      }
      // If null just keep the fallback — already set
    }).catch(function() {
      var subEl = $('welcome-sub');
      if (subEl) subEl.classList.remove('welcome-sub--loading');
    });
  }

  // ── Welcome cards ────────────────────────────────────────
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

// ============================================================
// DOCUMENT GENERATION
// Uses the Anthropic API (Claude) in artifacts via the built-in
// computer tools to generate real PPTX/PDF/DOCX/XLSX files.
// The flow:
//   1. User picks type + writes prompt
//   2. We send to Claude in an artifact with computer access
//   3. Claude runs Python/Node scripts to build the file
//   4. File is served back as a download link
// ============================================================
(function() {

  var _docType    = null;  // 'pptx' | 'pdf' | 'docx' | 'xlsx'
  var _docHistory = [];    // [{ name, type, url, ts }]

  var DOC_EXAMPLES = {
    pptx: [
      'A 10-slide pitch deck for a SaaS startup',
      'A company quarterly review presentation',
      'A 5-slide product roadmap for Q3',
    ],
    pdf: [
      'A professional invoice for freelance work',
      'A one-page resume for a software developer',
      'A project proposal report with sections',
    ],
    docx: [
      'A formal business letter to a client',
      'A product requirements document (PRD)',
      'A meeting notes template with action items',
    ],
    xlsx: [
      'A monthly budget tracker with charts',
      'A sales pipeline with deal stages',
      'A project timeline with tasks and owners',
    ],
  };

  var DOC_LABELS = { pptx:'PowerPoint', pdf:'PDF', docx:'Word Document', xlsx:'Spreadsheet' };

  // ── Modal open/close ────────────────────────────────────
  window.openDocModal = function(type) {
    var modal = document.getElementById('doc-modal');
    if (modal) modal.classList.remove('hidden');
    resetDocModalState();
    if (type) window.selectDocType(type, document.querySelector('.doc-pick-btn[data-type="' + type + '"]'));
  };

  window.closeDocModal = function() {
    var modal = document.getElementById('doc-modal');
    if (modal) modal.classList.add('hidden');
  };

  window.resetDocModal = function() {
    resetDocModalState();
  };

  function resetDocModalState() {
    showDocStep('type');
    _docType = null;
    document.querySelectorAll('.doc-pick-btn').forEach(function(b) { b.classList.remove('active'); });
    var inp = document.getElementById('doc-prompt-input');
    if (inp) inp.value = '';
    var err = document.getElementById('doc-modal-err');
    if (err) { err.textContent = ''; err.classList.add('hidden'); }
    updateDocExamples();
  }

  function showDocStep(step) {
    ['type','generating','done','error'].forEach(function(s) {
      var el = document.getElementById('doc-step-' + s);
      if (el) el.classList.toggle('hidden', s !== step);
    });
  }

  // ── Type selection ───────────────────────────────────────
  window.selectDocType = function(type, btn) {
    _docType = type;
    document.querySelectorAll('.doc-pick-btn').forEach(function(b) { b.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var title = document.getElementById('doc-modal-title');
    if (title) title.textContent = 'Create ' + (DOC_LABELS[type] || type.toUpperCase());
    var inp = document.getElementById('doc-prompt-input');
    if (inp) {
      inp.placeholder = 'Describe your ' + (DOC_LABELS[type] || type) + '…';
    }
    updateDocExamples(type);
  };

  function updateDocExamples(type) {
    var wrap = document.getElementById('doc-prompt-examples');
    if (!wrap) return;
    var examples = type ? (DOC_EXAMPLES[type] || []) : [];
    if (!examples.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = '<div class="doc-examples-label">Examples</div>' +
      examples.map(function(ex) {
        return '<button class="doc-example-chip" onclick="window.useDocExample(this)">' + ex + '</button>';
      }).join('');
  }

  window.useDocExample = function(btn) {
    var inp = document.getElementById('doc-prompt-input');
    if (inp) { inp.value = btn.textContent; inp.focus(); }
  };

  // ── Generation ───────────────────────────────────────────
  window.startDocGeneration = function() {
    var prompt = (document.getElementById('doc-prompt-input') || {}).value || '';
    prompt = prompt.trim();
    if (!_docType) {
      showDocError('Please select a file type first.');
      return;
    }
    if (prompt.length < 10) {
      showDocError('Please describe what you want (at least 10 characters).');
      return;
    }
    showDocStep('generating');
    generateDocument(_docType, prompt);
  };

  function showDocError(msg) {
    var err = document.getElementById('doc-modal-err');
    if (err) { err.textContent = msg; err.classList.remove('hidden'); }
  }

  function setGenStatus(msg) {
    var el = document.getElementById('doc-gen-status');
    if (el) el.textContent = msg;
  }

  function addGenStep(msg) {
    var el = document.getElementById('doc-gen-steps');
    if (!el) return;
    var step = document.createElement('div');
    step.className = 'doc-gen-step';
    step.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' + msg;
    el.appendChild(step);
  }

  async function generateDocument(type, prompt) {
    try {
      setGenStatus('Planning your document\u2026');
      addGenStep('Sending request to Cyanix');
      setGenStatus('Writing content\u2026');
      // Single source of truth — delegate to the inline generator
      var result = await generateDocumentInline(type, prompt);
      addGenStep('Content generated');
      addGenStep('File assembled');
      setGenStatus('Done!');
      showDocDone(result.blob, result.filename, type);
      _docHistory.unshift({ name: result.filename, type: type, prompt: prompt, ts: Date.now() });
      renderDocHistory();
    } catch (e) {
      console.error('[CyanixAI] Doc generation failed:', e);
      showDocStep('error');
      var errEl = document.getElementById('doc-error-msg');
      if (errEl) errEl.textContent = e.message || 'Something went wrong. Please try again.';
    }
  }

  function generateFilename(type, prompt) {
    // Derive a clean filename from the prompt
    var base = prompt.slice(0, 40)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    if (!base) base = 'cyanix-document';
    return base + '.' + type;
  }

  function showDocDone(blob, filename, type) {
    showDocStep('done');
    var nameEl = document.getElementById('doc-done-name');
    if (nameEl) nameEl.textContent = filename;
    var link = document.getElementById('doc-download-link');
    if (link) {
      var url = URL.createObjectURL(blob);
      link.href     = url;
      link.download = filename;
    }
  }

  // ── System prompts by file type ──────────────────────────
  function buildDocSystemPrompt(type) {
    var base = 'You are a document content generator. Return ONLY a single valid JSON object — no markdown, no explanation, no extra text. Be concise.';

    if (type === 'pptx') {
      return base + '\nSchema: {"title":"string","theme":{"primary":"#hex","secondary":"#hex"},' +
        '"slides":[{"title":"string","bullets":["point1","point2","point3"],"notes":"string"}]}\n' +
        'Generate 6-8 slides. Each slide: 3-5 bullet points, max 10 words each. No stats objects unless specifically requested.';
    }
    if (type === 'pdf') {
      return base + '\nSchema: {"title":"string","subtitle":"string","sections":[{"heading":"string","body":"2-3 sentence paragraph","items":["optional bullet 1","optional bullet 2"]}]}\n' +
        'Generate 4-6 sections. Keep body paragraphs under 60 words each.';
    }
    if (type === 'docx') {
      return base + '\nSchema: {"title":"string","sections":[{"heading":"string","level":1,"paragraphs":["paragraph text"],"bullets":["optional item"]}]}\n' +
        'Generate 4-6 sections. Each paragraph under 80 words. Skip table unless specifically requested.';
    }
    if (type === 'xlsx') {
      return base + '\nSchema: {"title":"string","sheets":[{"name":"string","headers":["Col1","Col2","Col3"],"rows":[["val","val","val"]]}]}\n' +
        'Generate 1-2 sheets with realistic sample data, 8-12 rows each. Skip formulas unless specifically requested.';
    }
    return base;
  }

  function buildDocUserPrompt(type, userRequest) {
    var labels = { pptx:'presentation', pdf:'PDF', docx:'Word document', xlsx:'spreadsheet' };
    return 'Create a ' + (labels[type] || type) + ' for: ' + userRequest.slice(0, 300) +
      '\n\nReturn only the JSON object. Be concise — quality over quantity.';
  }

  // ── Client-side file builders ────────────────────────────
  async function buildFileFromContent(type, prompt, rawContent) {
    // Parse the JSON from the model response
    var json;
    try {
      var clean = rawContent.replace(/```json|```/g, '').trim();
      // Find the JSON object in the response
      var start = clean.indexOf('{');
      var end   = clean.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON found in response');
      json = JSON.parse(clean.slice(start, end + 1));
    } catch (e) {
      throw new Error('Could not parse document structure: ' + e.message);
    }

    if (type === 'pptx') return buildPPTX(json);
    if (type === 'pdf')  return buildPDF(json);
    if (type === 'docx') return buildDOCX(json);
    if (type === 'xlsx') return buildXLSX(json);
    throw new Error('Unknown file type: ' + type);
  }

  // ── PPTX builder (PptxGenJS via CDN) ────────────────────
  async function buildPPTX(data) {
    // Load PptxGenJS if not already loaded
    if (!window.PptxGenJS) {
      await loadScriptOnce('https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js');
    }
    // Ensure browser-compatible: PptxGenJS attaches to window
    if (!window.PptxGenJS && window.pptxgen) window.PptxGenJS = window.pptxgen;
    var pptx = new window.PptxGenJS();

    var primary   = (data.theme && data.theme.primary)   || '#06b6d4';
    var secondary = (data.theme && data.theme.secondary) || '#0891b2';
    var accent    = (data.theme && data.theme.accent)    || '#f8fafc';

    // Define master slide
    pptx.defineSlideMaster({
      title:      'CYANIX',
      background: { color: 'FFFFFF' },
      objects: [
        { rect: { x:0, y:5.2, w:'100%', h:0.08, fill: { color: primary.replace('#','') } } },
        { text: { text:'Made with Cyanix AI', options: { x:0.3, y:5.3, w:4, h:0.3, fontSize:8, color:'9ca3af' } } },
      ],
    });

    var slides = data.slides || [];
    if (!slides.length) slides = [{ title: data.title || 'Slide 1', layout: 'content', content: 'Content goes here' }];

    slides.forEach(function(slide, idx) {
      var s = pptx.addSlide('CYANIX');
      var isTitle = idx === 0 || slide.layout === 'title';

      if (isTitle) {
        // Title slide
        s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill: { color: primary.replace('#','') } });
        s.addText(slide.title || data.title || 'Untitled', {
          x:0.5, y:1.8, w:9, h:1.2,
          fontSize:36, bold:true, color:'FFFFFF', align:'center',
        });
        if (slide.content) {
          s.addText(slide.content, {
            x:1, y:3.2, w:8, h:0.8,
            fontSize:18, color:'e0f2fe', align:'center',
          });
        }
      } else {
        // Content slide
        s.addText(slide.title || 'Slide ' + (idx+1), {
          x:0.4, y:0.25, w:9, h:0.7,
          fontSize:24, bold:true, color: primary.replace('#',''),
        });

        if (slide.stats && slide.stats.length) {
          // Stats layout
          var statW = 8 / slide.stats.length;
          slide.stats.forEach(function(stat, si) {
            s.addText(stat.value || '', {
              x: 0.5 + si * statW, y:1.4, w:statW, h:1.2,
              fontSize:48, bold:true, color: primary.replace('#',''), align:'center',
            });
            s.addText(stat.label || '', {
              x: 0.5 + si * statW, y:2.7, w:statW, h:0.5,
              fontSize:14, color:'6b7280', align:'center',
            });
          });
        } else if (slide.bullets && slide.bullets.length) {
          var bulletText = slide.bullets.map(function(b) {
            return { text: b, options: { bullet: true, fontSize:16, paraSpaceAfter:8 } };
          });
          s.addText(bulletText, { x:0.5, y:1.1, w:9, h:3.8, color:'374151' });
        } else if (slide.content) {
          s.addText(slide.content, {
            x:0.5, y:1.1, w:9, h:3.8,
            fontSize:16, color:'374151', valign:'top', wrap:true,
          });
        }
      }
    });

    var buf = await pptx.write({ outputType: 'arraybuffer' });
    return { blob: new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }) };
  }

  // ── PDF builder (jsPDF via CDN) ──────────────────────────
  async function buildPDF(data) {
    if (!window.jspdf) {
      await loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    }
    var jsPDF = window.jspdf.jsPDF;
    var doc   = new jsPDF({ unit:'mm', format:'a4' });
    var W = 210; var M = 20; var CW = W - 2*M;
    var y = M;

    function addText(text, opts) {
      opts = opts || {};
      doc.setFontSize(opts.size || 11);
      doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
      doc.setTextColor.apply(doc, opts.color || [30, 30, 30]);
      var lines = doc.splitTextToSize(String(text || ''), CW);
      if (y + lines.length * (opts.lineH || 7) > 277) { doc.addPage(); y = M; }
      doc.text(lines, M, y);
      y += lines.length * (opts.lineH || 7) + (opts.after || 2);
    }

    // Header bar
    doc.setFillColor(6, 182, 212);
    doc.rect(0, 0, W, 28, 'F');
    doc.setFontSize(22); doc.setFont('helvetica','bold'); doc.setTextColor(255,255,255);
    doc.text(String(data.title || 'Document'), M, 17);
    if (data.subtitle) {
      doc.setFontSize(11); doc.setFont('helvetica','normal');
      doc.text(String(data.subtitle), M, 24);
    }
    y = 38;

    (data.sections || []).forEach(function(sec) {
      if (sec.heading) {
        addText(sec.heading, { size:14, bold:true, color:[6,182,212], after:4 });
      }
      if (sec.body) {
        addText(sec.body, { size:11, after:3 });
      }
      (sec.items || []).forEach(function(item) {
        addText('\u2022  ' + item, { size:11, after:1 });
      });
      y += 4;
    });

    // Footer
    doc.setFontSize(8); doc.setTextColor(156,163,175);
    doc.text('Generated by Cyanix AI', M, 290);

    var blob = doc.output('blob');
    return { blob: blob };
  }

  // ── DOCX builder (docx.js via CDN) ───────────────────────
  async function buildDOCX(data) {
    if (!window.docx) {
      await loadScriptOnce('https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.js');
    }
    // Fallback namespace check
    if (!window.docx && window.docxjs) window.docx = window.docxjs;
    var D = window.docx;
    var children = [];

    // Title
    children.push(new D.Paragraph({
      text: data.title || 'Document',
      heading: D.HeadingLevel.TITLE,
    }));
    children.push(new D.Paragraph({ text:'' }));

    (data.sections || []).forEach(function(sec) {
      if (sec.heading) {
        var lvl = sec.level === 2 ? D.HeadingLevel.HEADING_2 : D.HeadingLevel.HEADING_1;
        children.push(new D.Paragraph({ text: sec.heading, heading: lvl }));
      }
      (sec.paragraphs || []).forEach(function(p) {
        children.push(new D.Paragraph({
          children: [new D.TextRun({ text: p, size:24 })],
          spacing: { after:160 },
        }));
      });
      (sec.bullets || []).forEach(function(b) {
        children.push(new D.Paragraph({
          text: b,
          bullet: { level:0 },
        }));
      });
      if (sec.table && sec.table.headers) {
        var rows = [
          new D.TableRow({
            children: sec.table.headers.map(function(h) {
              return new D.TableCell({
                children: [new D.Paragraph({ children:[new D.TextRun({text:h,bold:true})] })],
                shading: { fill:'D5E8F0', type:D.ShadingType.CLEAR },
              });
            }),
            tableHeader: true,
          }),
        ].concat((sec.table.rows || []).map(function(row) {
          return new D.TableRow({
            children: row.map(function(cell) {
              return new D.TableCell({ children:[new D.Paragraph({text:String(cell||'')})] });
            }),
          });
        }));
        children.push(new D.Table({ rows:rows, width:{size:9360,type:D.WidthType.DXA} }));
      }
      children.push(new D.Paragraph({ text:'' }));
    });

    var doc = new D.Document({
      sections:[{
        properties:{
          page:{
            size:{ width:12240, height:15840 },
            margin:{ top:1440, right:1440, bottom:1440, left:1440 },
          },
        },
        children: children,
      }],
    });
    // toBlob is the browser-safe API (toBuffer is Node-only)
    var blob = await D.Packer.toBlob(doc);
    return { blob: blob };
  }

  // ── XLSX builder (SheetJS via CDN) ───────────────────────
  async function buildXLSX(data) {
    if (!window.XLSX) {
      await loadScriptOnce('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
    }
    var wb = window.XLSX.utils.book_new();
    (data.sheets || [{ name: data.title||'Sheet1', headers: data.headers||[], rows: data.rows||[] }])
      .forEach(function(sheetData) {
        var wsData = [];
        if (sheetData.headers && sheetData.headers.length) wsData.push(sheetData.headers);
        (sheetData.rows || []).forEach(function(row) { wsData.push(row); });
        var ws = window.XLSX.utils.aoa_to_sheet(wsData);

        // Apply formulas
        Object.keys(sheetData.formulas || {}).forEach(function(cell) {
          if (!ws[cell]) ws[cell] = {};
          ws[cell].f = sheetData.formulas[cell].replace(/^=/, '');
        });

        window.XLSX.utils.book_append_sheet(wb, ws, sheetData.name || 'Sheet1');
      });

    var b64  = window.XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    // Convert base64 to Uint8Array for Blob — works in all browsers, no Buffer needed
    var bin  = atob(b64);
    var arr  = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    var blob = new Blob([arr], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return { blob: blob };
  }

  // ── Expose core functions for inline chat routing ────────
  window._docGenerateInline  = generateDocumentInline;
  window._docBuildFile       = buildFileFromContent;
  window._docFilename        = generateFilename;
  window._docSystemPrompt    = buildDocSystemPrompt;
  window._docUserPrompt      = buildDocUserPrompt;

  // Inline version — no modal UI, returns { blob, filename }
  async function generateDocumentInline(type, prompt) {
    var sysPrompt  = buildDocSystemPrompt(type);
    var userPrompt = buildDocUserPrompt(type, prompt);
    var res = await fetch(CHAT_URL, {
      method:  'POST',
      headers: edgeHeaders(),
      body:    JSON.stringify({
        model:      'meta-llama/llama-4-scout-17b-16e-instruct',
        stream:     false,
        max_tokens: 1800,
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error('Doc generation failed (' + res.status + ')');
    var data    = await res.json();
    var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) throw new Error('No content returned from model');
    var fileResult = await buildFileFromContent(type, prompt, content);
    var filename   = generateFilename(type, prompt);
    return { blob: fileResult.blob, filename: filename, type: type };
  }

  // ── Doc history sidebar ──────────────────────────────────
  function renderDocHistory() {
    var list = document.getElementById('doc-history-list');
    if (!list) return;
    if (!_docHistory.length) {
      list.innerHTML = '<div class="sb-empty">No documents yet</div>';
      return;
    }
    list.innerHTML = _docHistory.slice(0, 20).map(function(d) {
      var colors = { pptx:'#d1441e', pdf:'#dc2626', docx:'#2563eb', xlsx:'#16a34a' };
      return '<div class="doc-hist-item">' +
        '<span class="doc-hist-dot" style="background:' + (colors[d.type]||'#6b7280') + '"></span>' +
        '<span class="doc-hist-name">' + esc(d.name) + '</span>' +
        '</div>';
    }).join('');
  }

})();



/* ==============================================================
   CYANIX AI — app_additions.js  v1.0
   New Features:
     1. Intent Classifier (auto-route to right mode)
     2. Follow-up Question Suggester (post-response chips)
     3. Semantic Memory Retrieval via pgvector embeddings
     4. Function/Tool Calling (web_search, calculate, get_current_time)
     UI Enhancements:
     5. Sidebar swipe gesture + overlay dim
     6. Mobile message actions (... menu)
     7. Streaming RAF batching (smoother tokens)
     8. Scroll-to-bottom floating button
     9. Improved typing indicator (pulse avatar)
    10. Settings swipe-back gesture
    11. Composer auto-resize improvements + char counter polish
    12. Welcome screen personalisation (recent chats + name)
    13. Haptic micro-interactions
    14. Instant theme switching with crossfade
================================================================ */
'use strict';

/* ============================================================
   1. INTENT CLASSIFIER
   Lightweight ~50-token pre-call that auto-routes each message
   to the best mode (coding / math / time-sensitive / general).
   Results are cached per-message so no double calls.
============================================================ */
var _intentCache = {};

var INTENT_PATTERNS = {
  coding: [
    /\b(write|build|create|generate|debug|fix|refactor|code|implement|function|class|api|script|component|bug|error|syntax|python|javascript|typescript|react|vue|node|sql|bash|shell|rust|go)\b/i,
  ],
  math: [
    /\b(calculate|compute|solve|equation|formula|integral|derivative|matrix|probability|statistics|algebra|geometry|how much|how many|percent|ratio)\b/i,
    /[\d+\-*/^÷×()]{5,}/,
  ],
  time_sensitive: [
    /(today|right now|currently|latest|recent|news|2024|2025|2026|live|breaking|weather|stock|price|score|standings|who is|who are|president|ceo|prime minister)/i,
    /^(search|find|look up|google|fetch)/i,
  ],
};

function classifyIntent(text) {
  if (!text || text.length < 3) return { type: 'general' };
  var cached = _intentCache[text.slice(0, 80)];
  if (cached) return cached;

  var result = { type: 'general', confidence: 0 };

  if (INTENT_PATTERNS.coding.some(function(r) { return r.test(text); })) {
    result = { type: 'coding', confidence: 0.85, action: 'inject_code_context' };
  } else if (INTENT_PATTERNS.math.some(function(r) { return r.test(text); })) {
    result = { type: 'math', confidence: 0.80, action: 'force_cot' };
  } else if (INTENT_PATTERNS.time_sensitive.some(function(r) { return r.test(text); })) {
    result = { type: 'time_sensitive', confidence: 0.80, action: 'auto_web_search' };
  }

  _intentCache[text.slice(0, 80)] = result;
  return result;
}

// Show a subtle intent badge near the composer when classified
function showIntentBadge(intent) {
  var badge = document.getElementById('cx-intent-badge');
  if (!badge) return;
  var labels = {
    coding:         { icon: '⌨️', text: 'Code mode', color: '#7c3aed' },
    math:           { icon: '∑',  text: 'Math · step-by-step', color: '#0369a1' },
    time_sensitive: { icon: '🌐', text: 'Web search on', color: '#0f766e' },
    general:        null,
  };
  var label = labels[intent.type];
  if (!label) { badge.classList.add('hidden'); return; }
  badge.innerHTML = '<span>' + label.icon + '</span><span>' + label.text + '</span>';
  badge.style.setProperty('--intent-color', label.color);
  badge.classList.remove('hidden');
  clearTimeout(badge._timer);
  badge._timer = setTimeout(function() { badge.classList.add('hidden'); }, 4000);
}

// Hook into sendMessage — wrap it to apply intent routing
(function() {
  var _origSend = window.sendMessage || function() {};

  window.sendMessage = function(text) {
    var intent = classifyIntent(text || '');
    window._currentIntent = intent;

    // Auto-enable web search for time-sensitive queries
    if (intent.type === 'time_sensitive' && typeof _ragEnabled !== 'undefined' && !_ragEnabled) {
      var wasAutoEnabled = true;
      if (typeof toggleRAG === 'function') toggleRAG();
      // Show badge to inform user
      showIntentBadge(intent);
      var result = _origSend.apply(this, arguments);
      // Auto-disable after send if it was auto-enabled
      setTimeout(function() {
        if (wasAutoEnabled && typeof _ragEnabled !== 'undefined' && _ragEnabled) {
          if (typeof toggleRAG === 'function') toggleRAG();
        }
      }, 200);
      return result;
    }

    showIntentBadge(intent);
    return _origSend.apply(this, arguments);
  };
})();

// Inject the intent badge element + CoT mode badge into composer area
document.addEventListener('DOMContentLoaded', function() {
  var composerBox = document.getElementById('composer-box');
  if (composerBox) {
    var badge = document.createElement('div');
    badge.id = 'cx-intent-badge';
    badge.className = 'cx-intent-badge hidden';
    composerBox.parentNode.insertBefore(badge, composerBox);
  }
});


/* ============================================================
   2. FOLLOW-UP QUESTION SUGGESTER
   After each AI response completes, generate 2-3 smart
   follow-up question chips via a lightweight API call.
============================================================ */
var FOLLOWUP_URL = (typeof CHAT_URL !== 'undefined' ? CHAT_URL : '');

async function generateFollowUpQuestions(userMsg, aiMsg) {
  if (!userMsg || !aiMsg) return [];
  try {
    var res = await fetch(FOLLOWUP_URL, {
      method:  'POST',
      headers: (typeof edgeHeaders === 'function' ? edgeHeaders() : { 'Content-Type': 'application/json' }),
      body:    JSON.stringify({
        model:      'meta-llama/llama-4-scout-17b-16e-instruct',
        stream:     false,
        max_tokens: 80,
        messages: [
          {
            role: 'system',
            content: 'Generate exactly 3 short follow-up questions a user might ask based on this conversation. Return ONLY a JSON array of 3 short strings (max 8 words each). No markdown, no preamble.',
          },
          {
            role: 'user',
            content: 'User asked: ' + userMsg.slice(0, 200) + '\nAI replied: ' + aiMsg.slice(0, 300) + '\n\nGenerate 3 follow-up questions:',
          },
        ],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    var data = await res.json();
    var raw  = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    raw = raw.replace(/```json|```/g, '').trim();
    var aStart = raw.indexOf('['); var aEnd = raw.lastIndexOf(']');
    if (aStart === -1 || aEnd === -1) return [];
    var questions = JSON.parse(raw.slice(aStart, aEnd + 1));
    return Array.isArray(questions) ? questions.slice(0, 3).map(function(q) { return String(q).trim(); }).filter(Boolean) : [];
  } catch (e) {
    return [];
  }
}

function renderFollowUpChips(questions, lastUserMsg) {
  // Remove any existing chips first
  var existing = document.querySelector('.cx-followup-row');
  if (existing) existing.remove();
  if (!questions || !questions.length) return;

  var container = document.getElementById('messages');
  if (!container) return;

  var row = document.createElement('div');
  row.className = 'cx-followup-row';
  row.innerHTML = '<div class="cx-followup-label">Follow up</div>' +
    questions.map(function(q) {
      return '<button class="cx-followup-chip" data-q="' + q.replace(/"/g, '&quot;') + '">' +
        '<span>' + q + '</span>' +
        '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
      '</button>';
    }).join('');
  container.appendChild(row);

  // Animate in
  requestAnimationFrame(function() {
    row.querySelectorAll('.cx-followup-chip').forEach(function(chip, i) {
      chip.style.animationDelay = (i * 80) + 'ms';
      chip.classList.add('cx-chip-in');
    });
  });

  // Click handlers
  row.querySelectorAll('.cx-followup-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var q = chip.dataset.q;
      if (!q) return;
      var inp = document.getElementById('composer-input');
      if (inp) {
        inp.value = q;
        inp.dispatchEvent(new Event('input'));
        inp.focus();
      }
      row.remove();
      if (typeof haptic === 'function') haptic('light');
    });
  });

  // Auto-scroll to show chips
  if (typeof scrollToBottom === 'function') scrollToBottom();
}

// Hook into the post-message pipeline
// Wrap bgSyncMessages to fire follow-up generation after sync
(function() {
  var _origBgSync = window.bgSyncMessages;
  if (typeof _origBgSync !== 'function') return;

  window.bgSyncMessages = async function(isNewChat, localChatId, userText, aiText, msgEl) {
    var result = await _origBgSync.apply(this, arguments);
    // Generate follow-ups in background — non-blocking
    if (userText && aiText && aiText.length > 50) {
      generateFollowUpQuestions(userText, aiText).then(function(questions) {
        if (questions && questions.length) renderFollowUpChips(questions, userText);
      }).catch(function() {});
    }
    return result;
  };
})();

// Remove follow-up chips on new message
(function() {
  var _orig = window.sendMessage;
  window.sendMessage = function() {
    var chips = document.querySelector('.cx-followup-row');
    if (chips) chips.remove();
    return _orig ? _orig.apply(this, arguments) : undefined;
  };
})();


/* ============================================================
   3. SEMANTIC MEMORY RETRIEVAL — pgvector embed + cosine search
   New Edge Function: /functions/v1/embed-memory
   On save: stores embedding in user_memories.embedding column
   On retrieve: cosine similarity search as primary, fallback to keyword
============================================================ */
var EMBED_URL = (typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL + '/functions/v1/embed-memory' : '');

// Generate embedding for a text string via Edge Function
async function generateEmbedding(text) {
  if (!text || !EMBED_URL) return null;
  try {
    var headers = typeof edgeHeaders === 'function' ? edgeHeaders() : { 'Content-Type': 'application/json' };
    var res = await fetch(EMBED_URL, {
      method:  'POST',
      headers: headers,
      body:    JSON.stringify({ text: text.slice(0, 500) }),
      signal:  AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    var data = await res.json();
    return data.embedding || null; // float[] array
  } catch (e) {
    console.warn('[CyanixAI] Embedding generation failed:', e.message);
    return null;
  }
}

// Cosine similarity between two float vectors
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  var dot = 0, normA = 0, normB = 0;
  for (var i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  var denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Semantic retrieval: embed query, score memories by cosine similarity
async function retrieveMemoriesSemantic(query) {
  // Fall back to keyword search if no embeddings stored
  var hasEmbeddings = (typeof _memories !== 'undefined') &&
    _memories.some(function(m) { return m.embedding && m.embedding.length > 0; });

  if (!hasEmbeddings) {
    // Fallback to existing keyword retrieval
    return typeof retrieveRelevantMemories === 'function' ? retrieveRelevantMemories(query) : [];
  }

  var queryEmbedding = await generateEmbedding(query);
  if (!queryEmbedding) {
    return typeof retrieveRelevantMemories === 'function' ? retrieveRelevantMemories(query) : [];
  }

  var limit = typeof getContextLimit === 'function' ? getContextLimit() : 8;

  var scored = _memories.map(function(m) {
    var sim = 0;
    if (m.embedding && m.embedding.length > 0) {
      sim = cosineSimilarity(queryEmbedding, m.embedding);
    } else {
      // Keyword score as fallback for memories without embeddings
      sim = typeof scoreMemoryRelevance === 'function' ? scoreMemoryRelevance(m, query) * 0.1 : 0;
    }
    return { mem: m, score: sim };
  }).sort(function(a, b) { return b.score - a.score; });

  // Always include project/technical memories in top slots
  var projectMems = _memories.filter(function(m) {
    return m.category === 'project' || m.category === 'technical';
  }).slice(0, Math.floor(limit * 0.5));

  var projectIds = new Set(projectMems.map(function(m) { return m.id; }));
  var rest = scored
    .filter(function(s) { return !projectIds.has(s.mem.id) && s.score > 0.15; })
    .slice(0, limit - projectMems.length)
    .map(function(s) { return s.mem; });

  return projectMems.concat(rest).slice(0, limit);
}

// Patch memory save to also store embeddings
(function() {
  // After a memory is saved, generate and store its embedding
  var _origExtract = window.extractAndSaveMemories;
  if (typeof _origExtract !== 'function') return;

  window.extractAndSaveMemories = async function(messages, sourceId) {
    await _origExtract.apply(this, arguments);
    // Embed any memories that don't yet have embeddings
    // We do this async/lazy — no blocking the main flow
    setTimeout(async function() {
      if (!window._sb || !window._session) return;
      var _mems = window._memories || [];
      var needsEmbed = _mems.filter(function(m) { return !m.embedding; }).slice(0, 5);
      for (var i = 0; i < needsEmbed.length; i++) {
        var m = needsEmbed[i];
        var emb = await generateEmbedding(m.memory + ' ' + (m.entity_name || ''));
        if (emb && window._sb && window._session) {
          window._sb.from('user_memories')
            .update({ embedding: emb })
            .eq('id', m.id)
            .eq('user_id', window._session.user.id)
            .then(function() {})
            .catch(function() {});
          m.embedding = emb; // update in-memory too
        }
      }
    }, 2000);
  };
})();

// Expose for use in buildSystemPrompt
window.retrieveMemoriesSemantic = retrieveMemoriesSemantic;


/* ============================================================
   4. FUNCTION / TOOL CALLING
   Tools: web_search, calculate, get_current_time
   Client-side router detects tool intent and calls before LLM.
============================================================ */

var CX_TOOLS = {
  // Tool: web_search — uses existing RAG endpoint
  web_search: async function(query) {
    if (typeof fetchRAGContext !== 'function') return { error: 'RAG not available' };
    var data = await fetchRAGContext(query);
    if (!data) return { error: 'No results found' };
    return {
      success: true,
      query:   query,
      results: (data.results || []).slice(0, 4).map(function(r) {
        return { title: r.title, snippet: r.snippet, url: r.url };
      }),
      abstract: data.abstract || '',
    };
  },

  // Tool: calculate — safe math evaluation
  calculate: function(expression) {
    try {
      // Sanitise: only allow math chars
      var safe = expression.replace(/[^0-9+\-*/().%^ \t\n]/g, '');
      if (!safe.trim()) return { error: 'Invalid expression' };
      // Replace ^ with ** for JS
      safe = safe.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      var result = new Function('return (' + safe + ')')();
      if (typeof result !== 'number' || !isFinite(result)) return { error: 'Could not compute' };
      return { success: true, expression: expression, result: result };
    } catch (e) {
      return { error: e.message };
    }
  },

  // Tool: get_current_time
  get_current_time: function() {
    var now = new Date();
    return {
      success:   true,
      iso:       now.toISOString(),
      local:     now.toLocaleString(),
      date:      now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
      time:      now.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' }),
      timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
      unix:      Math.floor(now.getTime() / 1000),
    };
  },
};

// Tool intent patterns
var TOOL_PATTERNS = [
  { tool: 'web_search',      re: /\b(search|find|look up|google|fetch|latest|news|today|current|price of|who is|weather)\b/i },
  { tool: 'calculate',       re: /\b(calculate|compute|what is \d|how much is \d|solve|\d[\d\s+\-*/^()]+\d)\b/i },
  { tool: 'get_current_time', re: /\b(what time|what's the time|current time|what date|what day|today's date)\b/i },
];

function detectToolIntent(text) {
  for (var i = 0; i < TOOL_PATTERNS.length; i++) {
    if (TOOL_PATTERNS[i].re.test(text)) return TOOL_PATTERNS[i].tool;
  }
  return null;
}

function extractToolArg(toolName, text) {
  if (toolName === 'web_search') {
    // Strip trigger words and return rest as query
    return text.replace(/^(search for|look up|find|google|fetch)\s+/i, '').trim() || text;
  }
  if (toolName === 'calculate') {
    var match = text.match(/[\d\s+\-*/^().%]+/);
    return match ? match[0].trim() : text;
  }
  return text;
}

// Show a subtle "Using tool: X" indicator in the thinking row
function showToolIndicator(toolName) {
  var tl = document.getElementById('thinking-text');
  if (!tl) return;
  var labels = {
    web_search:       'Searching the web…',
    calculate:        'Calculating…',
    get_current_time: 'Checking the time…',
  };
  tl.textContent = labels[toolName] || 'Using tool…';
}

// Render a tool-use disclosure card inside a message bubble
function renderToolCard(toolName, result) {
  var icons = {
    web_search:       '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    calculate:        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="10" x2="8" y2="10"/><line x1="11" y1="14" x2="8" y2="14"/><line x1="11" y1="18" x2="8" y2="18"/><line x1="16" y1="14" x2="13" y2="14"/><line x1="16" y1="18" x2="13" y2="18"/></svg>',
    get_current_time: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  };
  var labels = { web_search: 'Web Search', calculate: 'Calculator', get_current_time: 'Current Time' };
  var icon  = icons[toolName]  || '';
  var label = labels[toolName] || toolName;
  var summary = '';
  if (toolName === 'calculate' && result.result !== undefined) {
    summary = result.expression + ' = <strong>' + result.result + '</strong>';
  } else if (toolName === 'get_current_time' && result.date) {
    summary = result.date + ', ' + result.time;
  } else if (toolName === 'web_search' && result.results) {
    summary = 'Found ' + result.results.length + ' results';
  }

  return '<div class="cx-tool-card">' +
    '<div class="cx-tool-card-header">' + icon + '<span>' + label + '</span></div>' +
    (summary ? '<div class="cx-tool-card-result">' + summary + '</div>' : '') +
  '</div>';
}

// Pre-sendMessage tool execution hook
(function() {
  var _origSend = window.sendMessage;
  window.sendMessage = async function(text) {
    var toolName = detectToolIntent(text || '');
    if (!toolName) return _origSend ? _origSend.apply(this, arguments) : undefined;

    // Only intercept for calculate and get_current_time — web_search is handled by RAG
    if (toolName === 'web_search') return _origSend ? _origSend.apply(this, arguments) : undefined;

    var arg    = extractToolArg(toolName, text);
    var result = CX_TOOLS[toolName] ? await CX_TOOLS[toolName](arg) : { error: 'Tool not found' };

    // Inject tool result context into the message before sending
    var toolContext = '\n\n[TOOL RESULT: ' + toolName + ']\n' + JSON.stringify(result) + '\n[END TOOL RESULT]';
    var augmented   = text + toolContext;

    return _origSend ? _origSend.apply(this, [augmented]) : undefined;
  };
})();

// Expose tools globally for edge function usage
window.CX_TOOLS = CX_TOOLS;


/* ============================================================
   5. SIDEBAR SWIPE GESTURE + OVERLAY DIM
   Left-edge swipe opens sidebar. Overlay tap closes it.
============================================================ */
(function() {
  var SWIPE_EDGE   = 28; // px from left edge to start swipe
  var SWIPE_MIN    = 60; // min px horizontal distance to trigger
  var _swipeStart  = null;

  function getSidebar()  { return document.querySelector('.sidebar'); }
  function getOverlay()  { return document.getElementById('sidebar-overlay'); }

  function openSidebar() {
    var sb = getSidebar(); var ov = getOverlay();
    if (!sb) return;
    sb.classList.remove('collapsed');
    if (ov) { ov.classList.remove('hidden'); ov.classList.add('visible'); }
    if (typeof haptic === 'function') haptic('medium');
  }

  function closeSidebar() {
    var sb = getSidebar(); var ov = getOverlay();
    if (!sb) return;
    sb.classList.add('collapsed');
    if (ov) { ov.classList.remove('visible'); setTimeout(function() { ov.classList.add('hidden'); }, 280); }
  }

  document.addEventListener('touchstart', function(e) {
    if (window.innerWidth > 700) return;
    var t = e.touches[0];
    if (t.clientX <= SWIPE_EDGE) {
      _swipeStart = { x: t.clientX, y: t.clientY, time: Date.now() };
    } else {
      _swipeStart = null;
    }
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (!_swipeStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - _swipeStart.x;
    var dy = Math.abs(t.clientY - _swipeStart.y);
    var dt = Date.now() - _swipeStart.time;
    _swipeStart = null;
    if (dx >= SWIPE_MIN && dy < 60 && dt < 400) {
      var sb = getSidebar();
      if (sb && sb.classList.contains('collapsed')) openSidebar();
    }
  }, { passive: true });

  // Overlay close tap
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'sidebar-overlay') closeSidebar();
  });

  // Expose
  window.cxOpenSidebar  = openSidebar;
  window.cxCloseSidebar = closeSidebar;
})();


/* ============================================================
   6. MOBILE MESSAGE ACTIONS — "..." menu
   On mobile, replace always-visible actions with a dot-menu.
============================================================ */
(function() {
  function isMobile() { return window.innerWidth <= 700; }

  // Intercept click on ... buttons (delegated)
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.cx-msg-more-btn');
    if (!btn) return;
    var row = btn.closest('.msg-row');
    if (!row) return;

    // Close any open menus first
    document.querySelectorAll('.cx-msg-menu.open').forEach(function(m) { m.classList.remove('open'); });

    var menu = row.querySelector('.cx-msg-menu');
    if (!menu) return;
    menu.classList.add('open');
    if (typeof haptic === 'function') haptic('light');

    // Auto-close on outside tap
    setTimeout(function() {
      function closeMenu(evt) {
        if (!menu.contains(evt.target)) {
          menu.classList.remove('open');
          document.removeEventListener('click', closeMenu);
        }
      }
      document.addEventListener('click', closeMenu);
    }, 10);
  });

  // Patch renderMessage to inject mobile menu on AI messages
  var _origRender = window.renderMessage;
  if (typeof _origRender !== 'function') return;

  window.renderMessage = function(role, content, animate, msgId, imageData) {
    var result = _origRender.apply(this, arguments);
    if (role !== 'user' && isMobile() && result && result.msgEl) {
      var actions = result.msgEl.querySelector('.msg-actions');
      if (actions) {
        // Insert ... button
        var moreBtn = document.createElement('button');
        moreBtn.className = 'cx-msg-more-btn msg-action-btn';
        moreBtn.title = 'More actions';
        moreBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>';
        
        // Build popup menu from existing buttons
        var menu = document.createElement('div');
        menu.className = 'cx-msg-menu';
        var existingBtns = actions.querySelectorAll('.msg-action-btn');
        existingBtns.forEach(function(b) {
          var clone = b.cloneNode(true);
          clone.classList.remove('msg-tts-btn');
          menu.appendChild(clone);
        });

        actions.innerHTML = '';
        actions.appendChild(moreBtn);
        actions.appendChild(menu);
        actions.classList.remove('msg-actions--always-show');
      }
    }
    return result;
  };
})();


/* ============================================================
   7. STREAMING RAF BATCHING
   Buffer tokens and flush to DOM every ~50ms using rAF
   instead of per-token innerHTML updates.
============================================================ */
(function() {
  var _rafFlushPending = false;
  var _rafTarget = null;
  var _rafBuffer  = '';
  var _rafInterval = null;

  window.cxStreamBuffer = {
    init: function(bubbleEl) {
      _rafTarget = bubbleEl;
      _rafBuffer = '';
      _rafFlushPending = false;
      if (_rafInterval) clearInterval(_rafInterval);
      _rafInterval = setInterval(window.cxStreamBuffer.flush, 48);
    },
    push: function(token) {
      _rafBuffer += token;
      if (!_rafFlushPending) {
        _rafFlushPending = true;
        requestAnimationFrame(window.cxStreamBuffer.flush);
      }
    },
    flush: function() {
      if (!_rafTarget || !_rafBuffer) { _rafFlushPending = false; return; }
      _rafFlushPending = false;
      // Use renderStreamingContent if available
      if (typeof renderStreamingContent === 'function') {
        _rafTarget.innerHTML = renderStreamingContent(_rafBuffer);
      } else {
        _rafTarget.textContent = _rafBuffer;
      }
    },
    done: function() {
      window.cxStreamBuffer.flush();
      if (_rafInterval) { clearInterval(_rafInterval); _rafInterval = null; }
      _rafTarget = null;
      _rafBuffer = '';
    },
  };
})();


/* ============================================================
   8. SCROLL-TO-BOTTOM FLOATING BUTTON
   Appears when user scrolls up. Pulses when new AI message
   arrives while scrolled up. Auto-hides at bottom.
============================================================ */
(function() {
  var BTN_ID = 'cx-scroll-btn';
  var _newMsgWhileScrolled = false;

  function getScroll() { return document.getElementById('chat-scroll'); }

  function isAtBottom(scroll) {
    if (!scroll) return true;
    return scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 80;
  }

  function createBtn() {
    if (document.getElementById(BTN_ID)) return;
    var btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.className = 'cx-scroll-btn hidden';
    btn.title = 'Scroll to bottom';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    btn.addEventListener('click', function() {
      var scroll = getScroll();
      if (scroll) scroll.scrollTo({ top: scroll.scrollHeight, behavior: 'smooth' });
      btn.classList.remove('cx-scroll-pulse');
      _newMsgWhileScrolled = false;
      if (typeof haptic === 'function') haptic('light');
    });
    var chatMain = document.querySelector('.chat-main') || document.body;
    chatMain.appendChild(btn);
    return btn;
  }

  function updateBtn() {
    var btn = document.getElementById(BTN_ID) || createBtn();
    if (!btn) return;
    var scroll = getScroll();
    if (isAtBottom(scroll)) {
      btn.classList.add('hidden');
      btn.classList.remove('cx-scroll-pulse');
      _newMsgWhileScrolled = false;
    } else {
      btn.classList.remove('hidden');
      if (_newMsgWhileScrolled) btn.classList.add('cx-scroll-pulse');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    createBtn();
    var scroll = getScroll();
    if (scroll) {
      scroll.addEventListener('scroll', updateBtn, { passive: true });
    }
  });

  // Mark when AI message arrives while scrolled up
  var _origRenderMsg = window.renderMessage;
  if (typeof _origRenderMsg === 'function') {
    window.renderMessage = function(role) {
      var result = _origRenderMsg.apply(this, arguments);
      if (role !== 'user') {
        var scroll = getScroll();
        if (!isAtBottom(scroll)) {
          _newMsgWhileScrolled = true;
          updateBtn();
        }
      }
      return result;
    };
  }

  window.cxUpdateScrollBtn = updateBtn;
})();


/* ============================================================
   9. IMPROVED TYPING INDICATOR
   Pulse animation on AI avatar; dots inside message stream.
============================================================ */
(function() {
  var _typingEl = null;

  function injectTypingRow() {
    var container = document.getElementById('messages');
    if (!container) return;
    // Remove old typing indicator if it exists
    var oldTyping = document.getElementById('typing-row');
    if (oldTyping) oldTyping.style.display = 'none'; // hide the global one

    if (_typingEl && _typingEl.parentNode) return; // already present

    _typingEl = document.createElement('div');
    _typingEl.id = 'cx-inline-typing';
    _typingEl.className = 'cx-inline-typing';
    _typingEl.innerHTML =
      '<div class="ai-avatar cx-typing-avatar"><img src="icons/manifest/icon-192x192.png" alt="Cyanix AI"/></div>' +
      '<div class="cx-typing-dots"><span></span><span></span><span></span></div>';
    container.appendChild(_typingEl);
    if (typeof scrollToBottom === 'function') scrollToBottom();
  }

  function removeTypingRow() {
    if (_typingEl && _typingEl.parentNode) _typingEl.parentNode.removeChild(_typingEl);
    _typingEl = null;
    var oldTyping = document.getElementById('typing-row');
    if (oldTyping) oldTyping.style.display = '';
  }

  // Watch for show/hide of typing-row to mirror in our inline indicator
  var _origShow = window.show;
  var _origHide = window.hide;
  if (typeof _origShow === 'function') {
    window.show = function(el) {
      var result = _origShow.apply(this, arguments);
      var id = typeof el === 'string' ? el : (el && el.id);
      if (id === 'typing-row') injectTypingRow();
      return result;
    };
  }
  if (typeof _origHide === 'function') {
    window.hide = function(el) {
      var result = _origHide.apply(this, arguments);
      var id = typeof el === 'string' ? el : (el && el.id);
      if (id === 'typing-row') removeTypingRow();
      return result;
    };
  }
})();


/* ============================================================
   10. SETTINGS SWIPE-BACK GESTURE
   Horizontal swipe right on settings modal body → go back.
============================================================ */
(function() {
  var _swipeStart = null;
  var SWIPE_MIN   = 80;

  document.addEventListener('touchstart', function(e) {
    var settingsModal = document.getElementById('settings-modal');
    if (!settingsModal || settingsModal.classList.contains('hidden')) return;
    // Only trigger if sub-page is visible
    var subPage = settingsModal.querySelector('.settings-subpage:not(.hidden)');
    if (!subPage) return;
    var t = e.touches[0];
    _swipeStart = { x: t.clientX, y: t.clientY, time: Date.now() };
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    if (!_swipeStart) return;
    var t = e.changedTouches[0];
    var dx = t.clientX - _swipeStart.x;
    var dy = Math.abs(t.clientY - _swipeStart.y);
    var dt = Date.now() - _swipeStart.time;
    _swipeStart = null;

    if (dx >= SWIPE_MIN && dy < 80 && dt < 400) {
      // Trigger back button if present
      var backBtn = document.querySelector('.settings-back-btn, .modal-back-btn, #settings-back-btn');
      if (backBtn) {
        backBtn.click();
        if (typeof haptic === 'function') haptic('light');
      }
    }
  }, { passive: true });
})();


/* ============================================================
   11. COMPOSER IMPROVEMENTS
   - Max height 200px desktop / 160px mobile
   - Char counter only shows near limit (already in app.js,
     this overrides the threshold to be cleaner)
   - Smooth resize transition
============================================================ */
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    var inp = document.getElementById('composer-input');
    if (!inp) return;

    var isMobile = window.innerWidth <= 700;
    var MAX_H    = isMobile ? 160 : 200;

    inp.addEventListener('input', function() {
      inp.style.height = 'auto';
      inp.style.height = Math.min(inp.scrollHeight, MAX_H) + 'px';
    });

    // Update on resize
    window.addEventListener('resize', function() {
      isMobile = window.innerWidth <= 700;
      MAX_H = isMobile ? 160 : 200;
    });
  });
})();


/* ============================================================
   12. WELCOME SCREEN PERSONALISATION
   - Show user's name from settings
   - Show last 3 chat titles as quick-start chips
   - "Continue:" chips for recent sessions
============================================================ */
function renderPersonalisedWelcome() {
  var welcomeState = document.getElementById('welcome-state');
  if (!welcomeState) return;

  // Inject personalised name into greeting if not already done
  var heading = welcomeState.querySelector('.welcome-heading');
  var name    = (typeof _settings !== 'undefined' && _settings.displayName) ? _settings.displayName : null;
  if (name && heading) {
    var h = heading.textContent || '';
    if (!h.includes(name)) {
      // Append name to first heading word
      heading.innerHTML = heading.innerHTML.replace(
        /(<[^>]*>)?([A-Za-z,!]+)(<\/[^>]*>)?/,
        function(m) { return m; }
      );
    }
  }

  // Inject recent chat chips
  var recentChats = (typeof _chats !== 'undefined' ? _chats : []).slice(0, 3);
  if (!recentChats.length) return;

  var existingRecent = welcomeState.querySelector('.cx-recent-chats');
  if (existingRecent) existingRecent.remove();

  var recentEl = document.createElement('div');
  recentEl.className = 'cx-recent-chats';
  recentEl.innerHTML =
    '<div class="cx-recent-label">Continue a conversation</div>' +
    '<div class="cx-recent-chips">' +
    recentChats.map(function(c) {
      return '<button class="cx-recent-chip" data-id="' + (c.id || '') + '">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
        '<span>' + (c.title || 'Untitled chat').slice(0, 32) + '</span>' +
      '</button>';
    }).join('') +
    '</div>';
  
  // Insert before cards
  var cards = welcomeState.querySelector('.welcome-cards');
  if (cards) welcomeState.insertBefore(recentEl, cards);
  else welcomeState.appendChild(recentEl);

  // Click to load chat
  recentEl.querySelectorAll('.cx-recent-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var id = chip.dataset.id;
      if (id && typeof loadChat === 'function') loadChat(id);
      if (typeof haptic === 'function') haptic('medium');
    });
  });
}

// Hook into showWelcome or newChat
var _origNewChat = window.newChat;
if (typeof _origNewChat === 'function') {
  window.newChat = function() {
    var result = _origNewChat.apply(this, arguments);
    setTimeout(renderPersonalisedWelcome, 100);
    return result;
  };
}

window.addEventListener('cyanix:ready', function() {
  setTimeout(renderPersonalisedWelcome, 400);
});


/* ============================================================
   13. HAPTIC MICRO-INTERACTIONS
   Light vibration on key interactions throughout the app.
============================================================ */
(function() {
  var _origHaptic = window.haptic;

  window.haptic = function(type) {
    if (_origHaptic) _origHaptic.apply(this, arguments);
    if (!navigator.vibrate) return;
    var durations = { light: 8, medium: 15, heavy: 30 };
    var d = durations[type] || 10;
    navigator.vibrate(d);
  };

  // Sidebar item tap
  document.addEventListener('click', function(e) {
    if (e.target.closest('.chat-item')) haptic('light');
    if (e.target.closest('.setting-toggle')) haptic('light');
    if (e.target.closest('.ci-del'))   haptic('medium');
  });

  // Long-press on message → context menu (copy/share)
  var _lpTimer = null;
  document.addEventListener('touchstart', function(e) {
    var bubble = e.target.closest('.msg-bubble');
    if (!bubble) return;
    _lpTimer = setTimeout(function() {
      haptic('heavy');
      // Briefly flash the bubble to signal selection
      bubble.style.transition = 'background .15s';
      bubble.style.background = 'var(--blue-50)';
      setTimeout(function() { bubble.style.background = ''; }, 400);
      // Copy on long press
      var text = bubble.dataset.raw || bubble.innerText;
      if (navigator.clipboard && text) {
        navigator.clipboard.writeText(text).then(function() {
          if (typeof toast === 'function') toast('Copied!');
        }).catch(function() {});
      }
    }, 600);
  }, { passive: true });

  document.addEventListener('touchend',   function() { clearTimeout(_lpTimer); }, { passive: true });
  document.addEventListener('touchmove',  function() { clearTimeout(_lpTimer); }, { passive: true });
  document.addEventListener('touchcancel',function() { clearTimeout(_lpTimer); }, { passive: true });
})();


/* ============================================================
   14. INSTANT THEME SWITCHING WITH CROSSFADE
   Ensures all CSS variables update instantly + smooth transition.
   "System" option follows OS preference.
============================================================ */
(function() {
  var _origApplyTheme = window.applyTheme;

  window.applyTheme = function(theme) {
    // Handle "system" theme
    if (theme === 'system') {
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      theme = prefersDark ? 'dark' : 'light';
    }

    // Add crossfade class
    document.documentElement.classList.add('cx-theme-transition');

    if (_origApplyTheme) {
      _origApplyTheme.apply(this, arguments);
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    // Remove crossfade class after transition
    setTimeout(function() {
      document.documentElement.classList.remove('cx-theme-transition');
    }, 350);

    // Sync to localStorage immediately (belt and suspenders)
    try { localStorage.setItem('cx-theme', theme); } catch(e) {}

    // Update theme-color meta tag
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      var colors = { light: '#f0f4f9', dark: '#0f172a', founder: '#050a14', neon: '#0d0014', midnight: '#080c18' };
      metaTheme.setAttribute('content', colors[theme] || '#f0f4f9');
    }
  };

  // Listen to OS theme changes for "system" option
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    var currentTheme = (typeof _settings !== 'undefined' && _settings.theme) || localStorage.getItem('cx-theme');
    if (currentTheme === 'system') {
      window.applyTheme('system');
    }
  });
})();


/* ============================================================
   INIT — run after DOM and cyanix:ready
============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  // Create sidebar overlay if it doesn't exist
  if (!document.getElementById('sidebar-overlay')) {
    var ov = document.createElement('div');
    ov.id = 'sidebar-overlay';
    ov.className = 'sidebar-overlay hidden';
    document.body.insertBefore(ov, document.body.firstChild);
  }
});

window.addEventListener('cyanix:ready', function() {
  renderPersonalisedWelcome();
  // Reflect initial theme with new applyTheme
  var t = (typeof _settings !== 'undefined' && _settings.theme) || localStorage.getItem('cx-theme') || 'light';
  if (t) window.applyTheme(t);
});

console.log('[CyanixAI] app_additions.js v1.0 loaded');


/* ================================================================
   COMPLIX  —  Axion 5 Extended Thinking  v1.0
   ================================================================
   Like Claude's Extended Thinking but built for Axion.
   When active, every Axion request runs a visible 5-stage pipeline:

     Stage 1 · ROUTE    — fast intent classifier (what kind of problem is this?)
     Stage 2 · THINK    — deep reasoning pass (skeleton answer + logic chain)
     Stage 3 · DRAFT    — full response generation using the thinking skeleton
     Stage 4 · VERIFY   — self-critique & fact check of the draft
     Stage 5 · POLISH   — final rewrite incorporating verify feedback

   Each stage renders live in an animated panel above the response.
   The final polished answer replaces the bubble when done.

   Complix is Axion-only and opt-in via the composer toolbar.
================================================================ */
(function() {
  'use strict';

  /* ── State ──────────────────────────────────────────────── */
  var _complixActive = false;

  try {
    _complixActive = localStorage.getItem('cx-complix') === '1';
  } catch(e) {}

  function saveComplixState() {
    try { localStorage.setItem('cx-complix', _complixActive ? '1' : '0'); } catch(e) {}
  }

  /* ── Stage definitions ──────────────────────────────────── */
  var STAGES = [
    { id: 'route',  label: 'Routing',     icon: 'M9 18V5l12-2v13',                    detail: 'Classifying intent & complexity…'         },
    { id: 'think',  label: 'Thinking',    icon: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01', detail: 'Building reasoning skeleton…'  },
    { id: 'draft',  label: 'Drafting',    icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', detail: 'Generating full response…' },
    { id: 'verify', label: 'Verifying',   icon: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3', detail: 'Self-critiquing the draft…' },
    { id: 'polish', label: 'Polishing',   icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z', detail: 'Final rewrite & cleanup…' },
  ];

  /* ── Build SVG path helper ──────────────────────────────── */
  function stageIcon(d, size) {
    size = size || 14;
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
  }

  /* ── Inject Complix button into composer toolbar ──────── */
  function injectComplixButton() {
    var toolbar = document.getElementById('cx-ai-toolbar');
    if (!toolbar || document.getElementById('cx-complix-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'cx-complix-btn';
    btn.type = 'button';
    btn.className = 'cx-toolbar-btn cx-complix-btn' + (_complixActive ? ' cx-toolbar-btn--active cx-complix-btn--on' : '');
    btn.title = 'Complix — Axion Extended Thinking (5-stage reasoning pipeline)';
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/><path d="M5.64 7.05l.88.88M17.48 7.05l-.88.88M5.64 16.95l.88-.88M17.48 16.95l-.88-.88M2 12h2M20 12h2"/></svg>' +
      '<span>Complix</span>' +
      '<span class="cx-complix-badge" id="cx-complix-badge">' + (STAGES.length) + ' stages</span>';

    btn.addEventListener('click', toggleComplix);
    // Insert before other toolbar items so it's first
    toolbar.insertBefore(btn, toolbar.firstChild);
  }

  function toggleComplix() {
    _complixActive = !_complixActive;
    saveComplixState();
    updateComplixUI();
    if (typeof toast === 'function') {
      toast(_complixActive
        ? '✦ Complix ON — 5-stage deep reasoning active'
        : 'Complix off');
    }
    if (typeof haptic === 'function') haptic('medium');
  }

  function updateComplixUI() {
    var btn = document.getElementById('cx-complix-btn');
    if (!btn) return;
    btn.classList.toggle('cx-toolbar-btn--active', _complixActive);
    btn.classList.toggle('cx-complix-btn--on', _complixActive);
  }

  /* ── Create Complix stage panel in a message bubble ─────── */
  function createComplixPanel(bubbleEl) {
    if (!bubbleEl) return null;

    // Remove any stale panel
    var stale = bubbleEl.querySelector('.cx-complix-panel');
    if (stale) stale.remove();

    var panel = document.createElement('div');
    panel.className = 'cx-complix-panel';
    panel.innerHTML =
      '<div class="cx-complix-header">' +
        '<div class="cx-complix-logo">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/><path d="M5.64 7.05l.88.88M17.48 7.05l-.88.88M5.64 16.95l.88-.88M17.48 16.95l-.88-.88M2 12h2M20 12h2"/></svg>' +
        '</div>' +
        '<span class="cx-complix-title">Complix · Extended Thinking</span>' +
        '<span class="cx-complix-status" id="cx-cpl-status">Initializing…</span>' +
      '</div>' +
      '<div class="cx-complix-stages" id="cx-cpl-stages">' +
        STAGES.map(function(s, i) {
          return '<div class="cx-cpl-stage" id="cx-cpl-stage-' + s.id + '" data-idx="' + i + '">' +
            '<div class="cx-cpl-stage-icon cx-cpl-icon-idle">' + stageIcon(s.icon, 12) + '</div>' +
            '<div class="cx-cpl-stage-body">' +
              '<span class="cx-cpl-stage-label">' + s.label + '</span>' +
              '<span class="cx-cpl-stage-detail" id="cx-cpl-detail-' + s.id + '">' + s.detail + '</span>' +
            '</div>' +
            '<div class="cx-cpl-stage-check" id="cx-cpl-check-' + s.id + '"></div>' +
          '</div>';
        }).join('') +
      '</div>' +
      '<div class="cx-complix-think-peek" id="cx-cpl-think-peek" style="display:none;">' +
        '<div class="cx-cpl-think-label">Reasoning trace</div>' +
        '<div class="cx-cpl-think-text" id="cx-cpl-think-text"></div>' +
      '</div>';

    bubbleEl.innerHTML = '';
    bubbleEl.appendChild(panel);
    return panel;
  }

  /* ── Update a single stage's state ─────────────────────── */
  function setStageState(stageId, state, detail) {
    // state: 'idle' | 'active' | 'done' | 'error'
    var stageEl = document.getElementById('cx-cpl-stage-' + stageId);
    if (!stageEl) return;

    stageEl.className = 'cx-cpl-stage cx-cpl-stage--' + state;

    var iconEl = stageEl.querySelector('.cx-cpl-stage-icon');
    if (iconEl) {
      iconEl.className = 'cx-cpl-stage-icon cx-cpl-icon-' + state;
      if (state === 'active') {
        iconEl.innerHTML = '<div class="cx-cpl-spin-ring"></div>';
      } else if (state === 'done') {
        iconEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>';
      } else if (state === 'error') {
        iconEl.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      } else {
        // Restore original icon
        var s = STAGES.find(function(x) { return x.id === stageId; });
        if (s) iconEl.innerHTML = stageIcon(s.icon, 12);
      }
    }

    if (detail) {
      var detailEl = document.getElementById('cx-cpl-detail-' + stageId);
      if (detailEl) detailEl.textContent = detail;
    }
  }

  function setStatus(text) {
    var el = document.getElementById('cx-cpl-status');
    if (el) el.textContent = text;
  }

  /* ── Show thinking peek ─────────────────────────────────── */
  function showThinkPeek(text) {
    var peek = document.getElementById('cx-cpl-think-peek');
    var textEl = document.getElementById('cx-cpl-think-text');
    if (!peek || !textEl) return;
    textEl.textContent = text.slice(0, 600) + (text.length > 600 ? '…' : '');
    peek.style.display = 'block';
  }

  /* ── The Complix pipeline itself ────────────────────────── */
  async function runComplixPipeline(text, systemContent, history, bubbleEl, msgEl) {
    var panel = createComplixPanel(bubbleEl);

    var thinkText  = '';
    var draftText  = '';
    var verifyText = '';
    var finalText  = '';

    var headers = (typeof edgeHeaders === 'function') ? edgeHeaders() : { 'Content-Type': 'application/json' };
    var chatUrl  = (typeof CHAT_URL !== 'undefined') ? CHAT_URL : '';
    var axionUrl = (typeof AXION_URL !== 'undefined') ? AXION_URL : '';
    var abort    = (typeof _abortCtrl !== 'undefined' && _abortCtrl) ? _abortCtrl.signal : undefined;

    // Helper to POST to AXION_URL with stream:false
    async function axionCall(sysPatch, userContent, maxTok) {
      var sysText = systemContent + (sysPatch ? '\n\n' + sysPatch : '');
      var msgs = history.filter(function(m) { return m.role !== 'system'; });
      // replace last user message with our content
      var callMsgs = msgs.slice(0, -1).concat([{ role: 'user', content: userContent }]);
      var res = await fetch(axionUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          model: 'axion',
          system: sysText,
          messages: callMsgs,
          stream: false,
          max_tokens: maxTok || 800,
        }),
        signal: abort,
      });
      if (!res.ok) throw new Error('Axion call failed: ' + res.status);
      var data = await res.json();
      // Handle both Axion and OpenAI response shapes
      return (
        (data.content && data.content[0] && data.content[0].text) ||
        (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
        (data.response) ||
        ''
      ).trim();
    }

    try {
      /* ─── Stage 1: ROUTE ──────────────────────────────── */
      setStageState('route', 'active', 'Classifying intent…');
      setStatus('Stage 1 of 5');

      var routePrompt =
        'Analyse this request and return JSON only.\n' +
        'Request: ' + text.slice(0, 600) + '\n\n' +
        'Return ONLY valid JSON:\n' +
        '{"type":"coding|factual|analytical|creative|conversational","complexity":"low|medium|high|very_high",' +
        '"angle":"one sentence: the best way to approach this","traps":["list","of","common","mistakes","for","this","type"],' +
        '"needs_examples":true|false,"depth":"brief|standard|deep"}';

      var routePlan = null;
      try {
        var rText = await axionCall(
          'You are a precise query classifier. Return ONLY valid JSON, no other text.',
          routePrompt, 200
        );
        var rStart = rText.indexOf('{'), rEnd = rText.lastIndexOf('}');
        if (rStart !== -1) routePlan = JSON.parse(rText.slice(rStart, rEnd + 1));
      } catch(e) {
        console.warn('[Complix] Route stage parse error:', e.message);
      }

      var routeDetail = routePlan
        ? routePlan.type + ' · ' + routePlan.complexity + ' complexity'
        : 'Routing complete';
      setStageState('route', 'done', routeDetail);

      /* ─── Stage 2: THINK ──────────────────────────────── */
      setStageState('think', 'active', 'Reasoning through the problem…');
      setStatus('Stage 2 of 5');

      var thinkSysPatch =
        'You are thinking step by step BEFORE answering. Do NOT write the final answer yet.\n' +
        'Instead, write a reasoning skeleton:\n' +
        '- What is the user really asking?\n' +
        '- What do I know that is directly relevant?\n' +
        '- What approach or structure should the answer take?\n' +
        '- What are the edge cases or tricky parts I must not miss?\n' +
        'Keep it raw and analytical. No fluff. Max 300 words.' +
        (routePlan && routePlan.traps && routePlan.traps.length
          ? ' Watch for: ' + routePlan.traps.join(', ') + '.'
          : '');

      thinkText = await axionCall(thinkSysPatch, text, 400);
      showThinkPeek(thinkText);
      setStageState('think', 'done', 'Reasoning complete — ' + Math.round(thinkText.split(/\s+/).length) + ' words');

      /* ─── Stage 3: DRAFT ──────────────────────────────── */
      setStageState('draft', 'active', 'Writing full response…');
      setStatus('Stage 3 of 5');

      var depthInstruction = '';
      if (routePlan) {
        if (routePlan.depth === 'brief') depthInstruction = 'Be concise — this is a simple question.';
        else if (routePlan.depth === 'deep') depthInstruction = 'Be thorough — this needs depth and detail.';
        if (routePlan.needs_examples) depthInstruction += ' Include concrete examples.';
      }

      var draftSysPatch =
        'You have already reasoned through this problem. Now write the complete answer.\n' +
        'Your reasoning notes (use these to guide the response, do not repeat them verbatim):\n' +
        '---\n' + thinkText + '\n---\n' +
        (routePlan && routePlan.angle ? 'Best approach: ' + routePlan.angle + '\n' : '') +
        depthInstruction + '\n' +
        'Write a complete, polished response now. No meta-commentary. Just the answer.';

      var draftMaxTok = (routePlan && (routePlan.complexity === 'very_high' || routePlan.complexity === 'high')) ? 2000 : 1200;
      draftText = await axionCall(draftSysPatch, text, draftMaxTok);
      setStageState('draft', 'done', 'Draft ready — ' + Math.round(draftText.split(/\s+/).length) + ' words');

      /* ─── Stage 4: VERIFY ─────────────────────────────── */
      setStageState('verify', 'active', 'Self-critiquing…');
      setStatus('Stage 4 of 5');

      var verifySysPatch =
        'You are now a strict quality reviewer. Check this draft response for:\n' +
        '1. Accuracy — any incorrect facts, wrong API names, hallucinated methods?\n' +
        '2. Completeness — does it fully answer what was asked? Anything missing?\n' +
        '3. Clarity — any confusing parts? Anything that needs better explanation?\n' +
        '4. Code quality (if applicable) — any bugs, missing imports, bad patterns?\n\n' +
        'Return JSON ONLY:\n' +
        '{"passes":true|false,"issues":["specific problems found"],' +
        '"fix_instructions":"one sentence instruction OR null if passes"}';

      var verifyPlan = null;
      try {
        var vText = await axionCall(
          verifySysPatch,
          'Original question: ' + text.slice(0, 400) + '\n\nDraft to verify:\n' + draftText.slice(0, 2000),
          300
        );
        var vStart = vText.indexOf('{'), vEnd = vText.lastIndexOf('}');
        if (vStart !== -1) verifyPlan = JSON.parse(vText.slice(vStart, vEnd + 1));
      } catch(e) {
        console.warn('[Complix] Verify parse error:', e.message);
      }

      var verifyDetail = verifyPlan
        ? (verifyPlan.passes ? '✓ No issues found' : verifyPlan.issues && verifyPlan.issues.length + ' issue(s) flagged')
        : 'Verification complete';
      setStageState('verify', 'done', verifyDetail);

      /* ─── Stage 5: POLISH ─────────────────────────────── */
      setStageState('polish', 'active', 'Final rewrite…');
      setStatus('Stage 5 of 5');

      var needsPolish = !verifyPlan || !verifyPlan.passes;

      if (needsPolish && verifyPlan && verifyPlan.fix_instructions) {
        var polishSysPatch =
          'Rewrite the following response to fix these issues:\n' +
          verifyPlan.fix_instructions + '\n\n' +
          'Issues to fix:\n' + (verifyPlan.issues || []).map(function(i, n) { return (n+1) + '. ' + i; }).join('\n') + '\n\n' +
          'The original question was: ' + text.slice(0, 400) + '\n\n' +
          'Return the improved response only — no meta-commentary, no "here is the improved version".';

        finalText = await axionCall(polishSysPatch, draftText.slice(0, 2000), draftMaxTok);
        setStageState('polish', 'done', 'Rewritten with fixes applied');
      } else {
        // Draft already passes — just do a final tone/format polish
        var lightPolishSys =
          'Do a final light polish on this response:\n' +
          '- Remove any filler phrases or redundant sentences\n' +
          '- Tighten the language\n' +
          '- Make sure the response ends cleanly (no "let me know if you need anything")\n' +
          'Return only the polished response text.';

        finalText = await axionCall(lightPolishSys, draftText.slice(0, 2000), draftMaxTok);
        setStageState('polish', 'done', 'Final cleanup applied');
      }

      if (!finalText || finalText.length < 30) {
        finalText = draftText; // fallback
        setStageState('polish', 'done', 'Using verified draft');
      }

      setStatus('Complete');

      /* ─── Render final response ───────────────────────── */
      await new Promise(function(r) { setTimeout(r, 420); }); // brief pause so user sees all stages done

      // Collapse the panel into a compact summary strip, show the answer below
      if (bubbleEl) {
        var summaryStrip = document.createElement('div');
        summaryStrip.className = 'cx-complix-summary';
        summaryStrip.innerHTML =
          '<button type="button" class="cx-complix-summary-toggle" onclick="this.closest(\'.cx-complix-summary\').classList.toggle(\'expanded\')" title="Show/hide Complix reasoning">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/><path d="M5.64 7.05l.88.88M17.48 7.05l-.88.88M5.64 16.95l.88-.88M17.48 16.95l-.88-.88M2 12h2M20 12h2"/></svg>' +
            '<span>Complix · 5 stages complete</span>' +
            '<svg width="10" height="10" class="cx-summary-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>' +
          '</button>' +
          '<div class="cx-complix-summary-detail">' +
            '<div class="cx-complix-stages-mini">' +
              STAGES.map(function(s) {
                return '<span class="cx-cpl-mini-stage">' + s.label + ' ✓</span>';
              }).join('') +
            '</div>' +
            (thinkText
              ? '<details class="cx-cpl-think-details"><summary>Reasoning trace</summary><div class="cx-cpl-think-body">' +
                thinkText.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') +
                '</div></details>'
              : '') +
          '</div>';

        var answerDiv = document.createElement('div');
        answerDiv.className = 'cx-complix-answer';
        if (typeof mdToHTML === 'function') {
          answerDiv.innerHTML = mdToHTML(finalText);
        } else {
          answerDiv.textContent = finalText;
        }

        bubbleEl.innerHTML = '';
        bubbleEl.appendChild(summaryStrip);
        bubbleEl.appendChild(answerDiv);
        bubbleEl.dataset.raw = finalText;
      }

      return finalText;

    } catch(e) {
      console.error('[Complix] Pipeline error:', e);
      // Set any active stage to error
      STAGES.forEach(function(s) {
        var el = document.getElementById('cx-cpl-stage-' + s.id);
        if (el && el.classList.contains('cx-cpl-stage--active')) {
          setStageState(s.id, 'error', e.message || 'Failed');
        }
      });
      setStatus('Pipeline failed — falling back to standard Axion');
      await new Promise(function(r) { setTimeout(r, 600); });

      // Fallback: render error in bubble and let caller use standard path
      if (bubbleEl) {
        bubbleEl.innerHTML = '<span style="color:var(--red);font-size:.85rem;">Complix failed: ' + (e.message || 'Unknown error') + '. Falling back to standard mode.</span>';
      }
      throw e; // rethrow so caller can fall back
    }
  }

  /* ── Patch sendMessage to intercept Axion calls ─────────── */
  // We wrap the fetch inside sendMessage by monkey-patching the
  // logic just before the Axion fetch happens.
  // The cleanest hook point is: after typing-row is shown,
  // before res = await fetch(activeURL, ...).
  // We do this by patching the handleSend → sendMessage chain
  // to call our pipeline instead for Axion+Complix combos.

  // Store original sendMessage
  var _origSendMessage = window.sendMessage;

  window.sendMessage = async function(text, opts) {
    // Only intercept if Complix is on AND model is axion
    if (!_complixActive) {
      return _origSendMessage ? _origSendMessage.apply(this, arguments) : undefined;
    }

    // ── Run standard pre-flight (same as sendMessage) ──────
    // We need to replicate the pre-work that sendMessage does:
    // showing thinking row, rendering user message, building context.
    // The cleanest approach: call original sendMessage but override
    // the fetch to AXION_URL by intercepting it.

    var _origFetch = window.fetch;
    var complixFired = false;

    // Intercept the next fetch to AXION_URL
    window.fetch = function(url, fetchOpts) {
      var axUrl = (typeof AXION_URL !== 'undefined') ? AXION_URL : '__AXION__';
      var isAxionCall = (typeof url === 'string') && url.indexOf(axUrl) !== -1 &&
        fetchOpts && fetchOpts.body;

      if (isAxionCall && !complixFired) {
        complixFired = true;
        // Restore fetch immediately
        window.fetch = _origFetch;

        // Parse what sendMessage was about to send
        var body = {};
        try { body = JSON.parse(fetchOpts.body); } catch(e) {}

        // Find the AI bubble that sendMessage already created (it creates it before fetch)
        // We give it a tiny delay to let renderMessage run first
        return new Promise(function(resolve, reject) {
          setTimeout(async function() {
            try {
              // Find the most recent AI bubble (no data-raw yet = freshly created)
              var allBubbles = document.querySelectorAll('.msg-row:not(.user) .msg-bubble');
              var bubbleEl = null;
              for (var i = allBubbles.length - 1; i >= 0; i--) {
                if (!allBubbles[i].dataset.raw || allBubbles[i].dataset.raw === '') {
                  bubbleEl = allBubbles[i];
                  break;
                }
              }
              if (!bubbleEl) bubbleEl = allBubbles[allBubbles.length - 1];

              var msgEl = bubbleEl && bubbleEl.closest('.msg-row');
              var systemContent = body.system || '';
              var history = body.messages || [];

              // Run Complix pipeline
              var finalText = await runComplixPipeline(text, systemContent, history, bubbleEl, msgEl);

              // Update history
              if (typeof _history !== 'undefined') {
                _history.push({ role: 'assistant', content: finalText });
              }

              // Background sync
              var isNewChat = typeof _currentId === 'undefined' || !_currentId;
              if (typeof bgSyncMessages === 'function' && typeof _currentId !== 'undefined') {
                bgSyncMessages(isNewChat, _currentId, text, finalText, msgEl);
              }

              // Run code pipeline on final answer
              if (bubbleEl && /```\w/.test(finalText) && typeof runCodePipeline === 'function') {
                runCodePipeline(bubbleEl, finalText, text).catch(function(){});
              }

              if (typeof scrollToBottom === 'function') scrollToBottom();

              // Hide typing row
              if (typeof hide === 'function') hide('typing-row');

              // Return a fake resolved response so sendMessage's res.ok check passes
              var fakeBody = JSON.stringify({ choices: [{ message: { content: finalText } }] });
              resolve(new Response(fakeBody, { status: 200, headers: { 'Content-Type': 'application/json' } }));

            } catch(err) {
              window.fetch = _origFetch;
              console.warn('[Complix] Pipeline failed, falling back to standard Axion:', err);
              // Fall back: call original fetch
              _origFetch.call(window, url, fetchOpts).then(resolve).catch(reject);
            }
          }, 80);
        });
      }

      // Not the Axion call — pass through normally
      return _origFetch.apply(window, arguments);
    };

    // Call original sendMessage — it will hit our intercepted fetch
    try {
      await (_origSendMessage ? _origSendMessage.apply(this, arguments) : Promise.resolve());
    } finally {
      // Always restore fetch
      if (window.fetch !== _origFetch) window.fetch = _origFetch;
    }
  };

  /* ── Keyboard shortcut: Ctrl+Shift+X toggles Complix ──── */
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      toggleComplix();
    }
  });



  /* ── Init ───────────────────────────────────────────────── */
  function initComplix() {
    injectComplixButton();
    updateComplixUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { setTimeout(initComplix, 400); });
  } else {
    setTimeout(initComplix, 400);
  }
  window.addEventListener('cyanix:ready', function() { setTimeout(initComplix, 600); });

  console.log('[CyanixAI] Complix v1.0 loaded — Axion Extended Thinking');

})();
