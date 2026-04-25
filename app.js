/* ==============================================================
   CYANIX AI — app.js  v20
   DeepSeek-style Thought Process · Termux File Reading
   Full Supabase File Storage · Claude-style Auth
   Removed: Name Functions · Personas · Referral Code
============================================================== */
'use strict';

/* ── Config ─────────────────────────────────────────────── */
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = SUPABASE_URL + '/functions/v1/cyanix-chat';
const AXION_URL     = SUPABASE_URL + '/functions/v1/axion-chat';
const GROQ_STT_URL  = SUPABASE_URL + '/functions/v1/groq-stt';
const RAG_URL       = SUPABASE_URL + '/functions/v1/rag-search';
const BROWSE_URL    = SUPABASE_URL + '/functions/v1/browse-page';
const KG_URL        = SUPABASE_URL + '/functions/v1/knowledge-graph';
const PIPELINE_URL  = SUPABASE_URL + '/functions/v1/feedback-pipeline';
const TRAINING_URL  = SUPABASE_URL + '/functions/v1/collect-training-data';
const MODERATE_URL  = SUPABASE_URL + '/functions/v1/moderate';
const PUSH_URL      = SUPABASE_URL + '/functions/v1/send-push';
const STORAGE_URL   = SUPABASE_URL + '/storage/v1';

/* Termux bridge — local python server */
const TERMUX_BRIDGE = 'http://127.0.0.1:8765';

const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];
const VAPID_PUBLIC_KEY = 'BD02ONvUlOa51U-FqFjPMRq3vsQ5hcA5QuLrqN7yMKKKQ-Tdi6CoXfgoS_cZeM-cM66-HWiBJ3dE0wMMOsatPS8';

/* ── Models ─────────────────────────────────────────────── */
const MODELS = [
  { id: 'axion', name: 'Axion', tag: 'ELITE', desc: '4-model ensemble · Maverick · Scout · Llama 3.3 · Nemotron' },
];

/* ── Welcome cards ──────────────────────────────────────── */
const WELCOME_CARDS = [
  { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>', title: 'Write code', sub: 'Explain, debug or generate', prompt: 'Write a function that ' },
  { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>', title: 'Search the web', sub: 'Real-time answers', prompt: 'Search for the latest news on ' },
  { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>', title: 'Write something', sub: 'Blog posts, emails, docs', prompt: 'Write a blog post about ' },
  { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>', title: 'Analyse deeply', sub: 'Data, concepts, reasoning', prompt: 'Analyse and explain ' },
  { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', title: 'Read a file', sub: 'Paste text or upload a file', prompt: 'Read and summarise this: ' },
  { icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>', title: 'Explain a concept', sub: 'Break down any topic', prompt: 'Explain how ' },
];

/* ── Personalities ──────────────────────────────────────── */
const PERSONALITIES = {
  friendly:     'Be warm and direct — like a knowledgeable peer who genuinely cares. No hollow affirmations. Never start with "Great question!" or "Absolutely!". Just answer naturally.',
  professional: 'Be precise and structured. Cut filler. Every sentence earns its place. Speak like a senior engineer in a design review — clear, confident, no padding.',
  creative:     'Think laterally. Challenge assumptions. Bring unexpected angles and analogies. Be imaginative but grounded — wild ideas with solid reasoning behind them.',
  concise:      'Minimum viable response. No preamble, no repetition, no summary. Answer and stop.',
  mentor:       'Teach by asking as much as telling. Check understanding, unpack reasoning, guide the user to the insight rather than just handing it to them.',
};

/* ── State ──────────────────────────────────────────────── */
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
let _signedInUser = null;
let _syncPending  = false;
let _notifications    = [];
let _notifUnreadCount = 0;
let _memories         = [];
let _memoriesLoaded   = false;
let _kgContext         = '';
let _attachment        = null;
let _supporter = { isActive:false, earlyAccess:false, premiumForever:false, memoryPriority:false, dailyLimit:40, unlockedThemes:[] };
let _usageToday = 0;
let _termuxAvailable = false;  // set after first ping

let _settings = {
  model:           'axion',
  streaming:       true,
  theme:           'dark',
  trainingConsent: false,
  personality:     'friendly',
  ragAuto:         false,
  contextDepth:    'light',
  fontStyle:       'geist',
  fontSize:        15,
  language:        'auto',
};

/* ── Frustration detection ──────────────────────────────── */
const FRUSTRATION_SIGNALS = [
  /\b(still|again|already|keeps?|keeps? (happening|doing|breaking|failing))\b/i,
  /\b(why (doesn'?t|won'?t|isn'?t|can'?t)|how (is|comes?))\b/i,
  /\b(ugh|argh|damn|wtf|frustrated|annoying|broken|nothing works?)\b/i,
  /\b(tried (everything|that|it)|doesn'?t work|not working|still broken)\b/i,
  /[!?]{2,}/,
  /\b(i give up|forget it|never ?mind|this is (impossible|ridiculous|stupid))\b/i,
];

function detectFrustration(text, history) {
  if (!text || !history) return false;
  var msgScore = FRUSTRATION_SIGNALS.filter(function(r) { return r.test(text); }).length;
  var recentUser = history.filter(function(m) { return m.role === 'user'; }).slice(-2);
  var histScore = recentUser.reduce(function(acc, m) {
    var t = typeof m.content === 'string' ? m.content : '';
    return acc + FRUSTRATION_SIGNALS.filter(function(r) { return r.test(t); }).length;
  }, 0);
  return (msgScore >= 1 && histScore >= 1) || msgScore >= 2;
}

/* ── DOM helpers ────────────────────────────────────────── */
const $    = id => document.getElementById(id);
const show = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.remove('hidden'); };
const hide = el => { if (typeof el === 'string') el = $(el); if (el) el.classList.add('hidden'); };
const on   = (id, ev, fn) => { const e = $(id); if (e) e.addEventListener(ev, fn); };

function toast(msg, ms) {
  var isError = msg && (msg.indexOf('failed') !== -1 || msg.indexOf('Failed') !== -1 || msg.indexOf('error') !== -1);
  ms = ms || (isError ? 7000 : 2800);
  const t = $('toast');
  if (!t) return;
  t.textContent = msg;
  show(t);
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { hide(t); }, ms);
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function timeStr() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function localUUID() {
  if (crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

/* ══════════════════════════════════════════════════════════
   TERMUX BRIDGE — file reading, no frontend indicators
══════════════════════════════════════════════════════════ */

// Check bridge availability silently
async function pingTermux() {
  try {
    var res = await fetch(TERMUX_BRIDGE + '/ping', { signal: AbortSignal.timeout(1500) });
    if (res.ok) { _termuxAvailable = true; return true; }
  } catch (e) {}
  _termuxAvailable = false;
  return false;
}

/**
 * Read a text/code file from Termux filesystem.
 * Returns { content, name, size } or null on failure.
 * No UI indicators shown — silently injects content.
 */
async function termuxReadFile(filePath) {
  if (!_termuxAvailable) return null;
  try {
    var url = TERMUX_BRIDGE + '/read?file=' + encodeURIComponent(filePath);
    var res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    var text = await res.text();
    var name = filePath.split('/').pop();
    return { content: text, name: name, size: text.length };
  } catch (e) {
    console.warn('[CyanixAI] Termux read failed:', e.message);
    return null;
  }
}

/**
 * List files in a Termux directory.
 * Returns array of { name, path, size, is_dir } or []
 */
async function termuxListDir(dirPath) {
  if (!_termuxAvailable) return [];
  try {
    var url = TERMUX_BRIDGE + '/ls?dir=' + encodeURIComponent(dirPath || '~');
    var res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    var data = await res.json();
    return data.entries || [];
  } catch (e) { return []; }
}

// Text/code file extensions that Termux can read fully
const TERMUX_READABLE = new Set([
  'txt','md','html','htm','css','js','ts','jsx','tsx','json','py','sh','bash',
  'yaml','yml','toml','ini','env','sql','csv','log','xml','rs','go','java',
  'c','cpp','h','php','rb','swift','kt','dart','r','tex','rst','conf',
  'gitignore','dockerfile','makefile','gradle','pom','lock',
]);

function isTermuxReadable(filename) {
  var ext = (filename.split('.').pop() || '').toLowerCase();
  return TERMUX_READABLE.has(ext) || !filename.includes('.');
}

/**
 * Detect if the user message mentions a file path that Termux can read.
 * Returns the first recognised path, or null.
 */
function extractTermuxPath(text) {
  // Match: ~/... or /data/... or /sdcard/... or ./... or relative paths
  var patterns = [
    /~\/[\w./-]+/g,
    /\/(?:data|sdcard|storage|home|root|tmp|var)[\w./-]+/g,
    /\.\/[\w./-]+/g,
  ];
  for (var i = 0; i < patterns.length; i++) {
    var match = text.match(patterns[i]);
    if (match && match[0]) return match[0];
  }
  return null;
}


/* ══════════════════════════════════════════════════════════
   SUPABASE FILE STORAGE
   Stores uploaded files in the 'uploads' bucket per user.
   Returns a public URL for inline use.
══════════════════════════════════════════════════════════ */

/**
 * Upload a file to Supabase Storage.
 * Returns { url, path, name, size } or null on failure.
 */
async function uploadFileToStorage(file) {
  if (!_sb || !_session) return null;
  var maxMB = 50;
  if (file.size > maxMB * 1024 * 1024) {
    toast('File too large. Max ' + maxMB + 'MB.');
    return null;
  }

  var safeName  = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  var filePath  = _session.user.id + '/' + Date.now() + '_' + safeName;

  try {
    var { data, error } = await _sb.storage
      .from('uploads')
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (error) {
      console.warn('[CyanixAI] Storage upload error:', error.message);
      return null;
    }

    var { data: urlData } = _sb.storage.from('uploads').getPublicUrl(filePath);
    return {
      url:  urlData.publicUrl,
      path: filePath,
      name: file.name,
      size: file.size,
    };
  } catch (e) {
    console.warn('[CyanixAI] uploadFileToStorage exception:', e.message);
    return null;
  }
}

/**
 * Load list of files the user has stored in Supabase Storage.
 */
async function loadStoredFiles() {
  if (!_sb || !_session) return [];
  try {
    var { data, error } = await _sb.storage
      .from('uploads')
      .list(_session.user.id + '/', { limit: 50, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) return [];
    return data || [];
  } catch (e) { return []; }
}

/**
 * Delete a stored file by path.
 */
async function deleteStoredFile(filePath) {
  if (!_sb || !_session) return;
  try {
    await _sb.storage.from('uploads').remove([filePath]);
    toast('File deleted.');
  } catch (e) { toast('Could not delete file.'); }
}


/* ══════════════════════════════════════════════════════════
   FILE ATTACHMENT — reads text/code files fully (Claude-style)
   Images, PDFs, docs handled as before; text/code fully inlined
══════════════════════════════════════════════════════════ */

/**
 * Handle a file dropped or picked by the user.
 * Text/code files are read fully. Images/docs as before.
 * Files are also uploaded to Supabase Storage in background.
 */
async function handleAttachment(file) {
  var ext = (file.name.split('.').pop() || '').toLowerCase();
  var isImage = file.type.startsWith('image/');
  var isText  = TERMUX_READABLE.has(ext) || file.type.startsWith('text/');
  var isPDF   = ext === 'pdf' || file.type === 'application/pdf';
  var isDoc   = ['docx','pptx','xlsx','csv','zip'].includes(ext);

  // Upload to Supabase Storage silently in background
  uploadFileToStorage(file).then(function(result) {
    if (result) console.log('[CyanixAI] File stored:', result.url);
  }).catch(function() {});

  if (isImage) {
    // Read as base64
    var reader = new FileReader();
    reader.onload = function() {
      var b64 = reader.result.split(',')[1];
      _attachment = { type: 'image', name: file.name, data: b64, mediaType: file.type };
      showAttachmentPreview(file.name, 'image');
    };
    reader.readAsDataURL(file);
    return;
  }

  if (isText || ext === 'json' || ext === 'md') {
    // Read text files fully — like Claude does with documents
    var reader = new FileReader();
    reader.onload = function() {
      var content = reader.result;
      _attachment = {
        type: 'text',
        name: file.name,
        data: content,
        label: 'File',
        size:  file.size,
      };
      showAttachmentPreview(file.name, 'text');
    };
    reader.readAsText(file);
    return;
  }

  if (isPDF) {
    // Extract PDF text via browser — best-effort text extraction
    var reader = new FileReader();
    reader.onload = async function() {
      try {
        var arr = new Uint8Array(reader.result);
        // Extract raw text from PDF bytes (basic — looks for stream text)
        var raw = new TextDecoder('latin1').decode(arr);
        var extracted = '';
        // Try to extract text streams (very basic fallback)
        var matches = raw.match(/BT[\s\S]*?ET/g) || [];
        matches.forEach(function(m) {
          var inner = m.match(/\(([^)]+)\)/g) || [];
          inner.forEach(function(s) { extracted += s.slice(1,-1) + ' '; });
        });
        if (!extracted || extracted.trim().length < 20) {
          extracted = '[PDF binary — text extraction limited. Please paste the text content directly for best results.]';
        }
        _attachment = {
          type: 'document', name: file.name,
          data: extracted.slice(0, 20000), label: 'PDF',
        };
        showAttachmentPreview(file.name, 'pdf');
      } catch (e) {
        toast('Could not read PDF text. Try pasting the content.');
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  if (isDoc) {
    // For doc types we can't parse fully in-browser — store and note
    _attachment = {
      type: 'document', name: file.name,
      data: '[' + ext.toUpperCase() + ' file attached. Content parsing limited in browser. Upload the file and describe what you need.]',
      label: ext.toUpperCase(),
    };
    showAttachmentPreview(file.name, ext);
    return;
  }

  toast('Unsupported file type: ' + ext);
}

function showAttachmentPreview(name, type) {
  var preview = $('attachment-preview');
  var nameEl  = $('attach-name');
  if (nameEl)  nameEl.textContent = name;
  if (preview) preview.classList.remove('hidden');
}

function clearAttachment() {
  _attachment = null;
  var preview = $('attachment-preview');
  if (preview) preview.classList.add('hidden');
}


/* ══════════════════════════════════════════════════════════
   DEEPSEEK-STYLE AI THOUGHT PROCESS
   Shows visible reasoning chain before the final answer.
   Parses <think>...</think> blocks + streams intermediate steps.
══════════════════════════════════════════════════════════ */

var _thoughtEl     = null;  // current thought stream DOM element
var _thoughtText   = '';
var _inThoughtBlock = false;

/**
 * Create a thought-stream panel above the response bubble.
 * Looks like DeepSeek's "thinking" panel — collapsible.
 */
function createThoughtPanel(bubbleEl) {
  var panel = document.createElement('details');
  panel.className = 'think-block';
  panel.open = true;
  panel.innerHTML =
    '<summary class="think-summary">Thinking…</summary>' +
    '<div class="think-body" id="cx-think-body-' + Date.now() + '"></div>';
  bubbleEl.parentNode.insertBefore(panel, bubbleEl);
  return panel.querySelector('.think-body');
}

/**
 * Stream a character into the current thought block.
 * Called per-token during streaming.
 */
function streamThought(char) {
  if (!_thoughtEl) return;
  _thoughtText += char;
  _thoughtEl.textContent = _thoughtText;
  // Auto-scroll thought panel
  _thoughtEl.scrollTop = _thoughtEl.scrollHeight;
}

/**
 * Close the thought block when reasoning ends.
 * Collapses the panel and updates the summary.
 */
function closeThoughtPanel(thinkEl) {
  if (!thinkEl) return;
  var details = thinkEl.closest('details');
  if (details) {
    var summary = details.querySelector('.think-summary');
    if (summary) summary.textContent = 'Reasoning (' + ((_thoughtText.split(' ').length) || '?') + ' tokens)';
    details.open = false;
  }
  _thoughtEl    = null;
  _thoughtText  = '';
  _inThoughtBlock = false;
}

/**
 * Process a streaming chunk — separate <think> content from answer content.
 * Returns { think: '...', answer: '...' }
 */
function parseThoughtChunk(raw) {
  var think  = '';
  var answer = '';

  // Handle <think>...</think> boundaries
  if (_inThoughtBlock) {
    var endIdx = raw.indexOf('</think>');
    if (endIdx !== -1) {
      think  = raw.slice(0, endIdx);
      answer = raw.slice(endIdx + 8);
      _inThoughtBlock = false;
    } else {
      think = raw;
    }
  } else {
    var startIdx = raw.indexOf('<think>');
    if (startIdx !== -1) {
      answer = raw.slice(0, startIdx);
      var rest   = raw.slice(startIdx + 7);
      var endIdx = rest.indexOf('</think>');
      if (endIdx !== -1) {
        think  = rest.slice(0, endIdx);
        answer += rest.slice(endIdx + 8);
      } else {
        think = rest;
        _inThoughtBlock = true;
      }
    } else {
      answer = raw;
    }
  }

  return { think, answer };
}

/**
 * Render a complete <think>...</think> block that arrived all at once
 * (non-streaming responses).
 */
function renderThoughtBlock(bubbleEl, thinkContent) {
  if (!thinkContent || !thinkContent.trim()) return;
  var words = thinkContent.trim().split(/\s+/).length;
  var details = document.createElement('details');
  details.className = 'think-block';
  details.innerHTML =
    '<summary class="think-summary">Reasoning (' + words + ' tokens)</summary>' +
    '<div class="think-body">' + esc(thinkContent.trim()) + '</div>';
  bubbleEl.parentNode.insertBefore(details, bubbleEl);
}


/* ══════════════════════════════════════════════════════════
   MEMORY / KNOWLEDGE GRAPH
══════════════════════════════════════════════════════════ */

function scoreMemoryRelevance(memory, query) {
  var mText = (memory.memory + ' ' + (memory.entity_name || '') + ' ' + (memory.category || '')).toLowerCase();
  var qWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function(w) { return w.length > 2; });
  if (!qWords.length) return 0;
  var score = 0;
  qWords.forEach(function(word) {
    if (mText.indexOf(word) !== -1) score += 1;
    if (memory.entity_name && memory.entity_name.toLowerCase().indexOf(word) !== -1) score += 2;
    if (memory.category && memory.category.toLowerCase() === word) score += 1;
  });
  if (memory.created_at) {
    var age = Date.now() - new Date(memory.created_at).getTime();
    var daysSince = age / (1000 * 60 * 60 * 24);
    score += Math.max(0, 1 - daysSince / 30);
  }
  return score;
}

function getContextLimit() {
  var depth = _settings.contextDepth || 'standard';
  if (!_supporter.isActive) return 8;
  if (depth === 'deep')     return 20;
  if (depth === 'standard') return 12;
  return 8;
}

function retrieveRelevantMemories(query) {
  if (!_memories || !_memories.length) return [];
  var limit = getContextLimit();
  var projectMems = _memories.filter(function(m) {
    return m.category === 'project' || m.category === 'technical';
  });
  var otherMems = _memories.filter(function(m) {
    return m.category !== 'project' && m.category !== 'technical';
  });
  var scored = otherMems.map(function(m) {
    return { mem: m, score: scoreMemoryRelevance(m, query) };
  }).sort(function(a, b) { return b.score - a.score; });
  var combined = projectMems.slice(0, Math.floor(limit * 0.6));
  var remaining = limit - combined.length;
  combined = combined.concat(scored.slice(0, remaining).map(function(s) { return s.mem; }));
  return combined.slice(0, limit);
}


/* ── Language support ───────────────────────────────────── */
var SUPPORTED_LANGUAGES = [
  { code:'auto',name:'Auto-detect' },{ code:'en',name:'English' },
  { code:'es',name:'Español' },{ code:'fr',name:'Français' },
  { code:'pt',name:'Português' },{ code:'ar',name:'العربية' },
  { code:'hi',name:'हिन्दी' },{ code:'de',name:'Deutsch' },
  { code:'zh',name:'中文' },{ code:'ja',name:'日本語' },
  { code:'ko',name:'한국어' },{ code:'ru',name:'Русский' },
  { code:'sw',name:'Kiswahili' },{ code:'it',name:'Italiano' },
  { code:'tr',name:'Türkçe' },
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
  return 'LANGUAGE: Always respond in ' + name + ' only.';
}


/* ══════════════════════════════════════════════════════════
   SYSTEM PROMPT BUILDER
   DeepSeek-style: encourages visible reasoning with <think> blocks
   for complex queries. Claude-like: honest, direct, no affirmations.
══════════════════════════════════════════════════════════ */

function buildSystemPrompt(queryContext) {
  var p = PERSONALITIES[_settings.personality] || PERSONALITIES.friendly;

  var memBlock = '';
  var activeMemories = queryContext ? retrieveRelevantMemories(queryContext) : (_memories || []);
  if (activeMemories.length > 0) {
    var entities = {};
    var orphans  = [];
    activeMemories.forEach(function(m) {
      if (m.entity_name) {
        if (!entities[m.entity_name]) entities[m.entity_name] = { type: m.entity_type || 'concept', facts: [], relatedNames: [] };
        entities[m.entity_name].facts.push(m.memory);
        if (Array.isArray(m.related_to) && m.related_to.length) {
          m.related_to.forEach(function(relId) {
            var rel = _memories.find(function(r) { return r.id === relId; });
            if (rel && rel.entity_name && entities[m.entity_name].relatedNames.indexOf(rel.entity_name) === -1) {
              entities[m.entity_name].relatedNames.push(rel.entity_name);
            }
          });
        }
      } else { orphans.push(m.memory); }
    });
    var parts = [];
    Object.keys(entities).forEach(function(name) {
      var e = entities[name];
      var line = name + ' (' + e.type + '): ' + e.facts.join('; ');
      if (e.relatedNames.length) line += '. Connects to: ' + e.relatedNames.join(', ');
      parts.push(line);
    });
    if (orphans.length) parts.push('Other context: ' + orphans.join('; '));
    memBlock = 'Context from past conversations: ' + parts.join('. ') + '.';
  }

  var baseToneRules = 'Never start responses with hollow affirmations like "Great!", "Absolutely!", "Certainly!" — just respond. ' +
    'Be warm and direct. Push back when you disagree. Admit when you do not know something. ' +
    'Reference earlier parts of the conversation when relevant.';

  var now = new Date();
  var dateStr = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  /* DeepSeek-style reasoning instruction:
     For complex/coding/analytical queries, show reasoning inside <think>...</think> before the answer.
     For simple queries, respond directly without a thought block. */
  var reasoningInstruction =
    'REASONING STYLE: For complex analytical, coding, mathematical, or multi-step problems, ' +
    'first show your reasoning process inside <think>...</think> tags before giving the final answer. ' +
    'Think out loud — show intermediate steps, consider edge cases, spot potential issues. ' +
    'For simple conversational questions, respond directly without a thought block. ' +
    'Example:\n' +
    '<think>\nLet me break this down...\n[reasoning]\n</think>\n[final answer]';

  var historyLen = (_history || []).length;
  var longConvReminder = historyLen > 20
    ? 'IMPORTANT: Long conversation (' + historyLen + ' messages). Do NOT invent or misremember things said earlier. If unsure, ask the user to clarify.'
    : '';

  var langInstruction = getLanguageInstruction();

  var parts = [
    'You are Cyanix AI — a capable, honest AI assistant built on the Axion ensemble.',
    p,
    baseToneRules,
    reasoningInstruction,
    'Today is ' + dateStr + '.',
    memBlock,
    _kgContext || '',
    longConvReminder,
    langInstruction,
  ].filter(Boolean);

  return parts.join(' ');
}


/* ══════════════════════════════════════════════════════════
   SYNTAX CHECKER / CODE PIPELINE
══════════════════════════════════════════════════════════ */

function checkJavaScript(code) {
  var errors = [];
  var stack = [], pairs = {')':'(', '}':'{', ']':'['}, opens = new Set(['(','{',' [']), closes = new Set([')','}',' ]']);
  var inStr = false, strChar = '';
  for (var i = 0; i < code.length; i++) {
    var c = code[i]; var prev = i > 0 ? code[i-1] : '';
    if (!inStr && (c==='"'||c==="'"||c==='`')) { inStr=true; strChar=c; }
    else if (inStr && c===strChar && prev!=='\\') { inStr=false; }
    if (!inStr) {
      if (opens.has(c)) stack.push(c);
      else if (closes.has(c)) {
        if (!stack.length || stack[stack.length-1] !== pairs[c]) errors.push('Unmatched "'+c+'"');
        else stack.pop();
      }
    }
  }
  if (stack.length) errors.push('Unclosed "' + stack.join('", "') + '"');
  try { new Function(code); } catch(e) { errors.push(e.message); }
  return errors;
}

function checkJSON(code) { try { JSON.parse(code); return []; } catch(e) { return [e.message]; } }
function checkHTML(code) {
  try { var doc = new DOMParser().parseFromString(code,'text/html'); return Array.from(doc.querySelectorAll('parsererror')).map(function(e){ return e.textContent.trim().slice(0,120); }); }
  catch(e) { return [e.message]; }
}
function checkCSS(code) { try { var s = new CSSStyleSheet(); s.replaceSync(code); return []; } catch(e) { return [e.message]; } }
function checkPython(code) {
  var errors = [], lines = code.split('\n');
  var hasSpaces = lines.some(function(l){ return /^  /.test(l); });
  var hasTabs   = lines.some(function(l){ return /^\t/.test(l); });
  if (hasSpaces && hasTabs) errors.push('Mixed tabs and spaces');
  return errors;
}

function syntaxCheck(lang, code) {
  if (!lang || !code || code.trim().length < 20) return [];
  var l = lang.toLowerCase().trim();
  try {
    if (['javascript','js','jsx'].includes(l)) return checkJavaScript(code);
    if (l === 'json')  return checkJSON(code);
    if (l === 'html')  return checkHTML(code);
    if (l === 'css')   return checkCSS(code);
    if (['python','py'].includes(l)) return checkPython(code);
  } catch(e) {}
  return [];
}

function extractCodeBlocks(text) {
  var blocks = [], regex = /```(\w*)\n?([\s\S]*?)```/g, match;
  while ((match = regex.exec(text)) !== null) {
    var lang = (match[1]||'').toLowerCase().trim(), code = (match[2]||'').trim();
    if (code.length > 30) blocks.push({ lang, code });
  }
  return blocks;
}

function setArtifactBadge(bubbleEl, blockIndex, state, detail) {
  var icons = {
    checking: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    verified: '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>',
    fixed:    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    warning:  '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>',
    failed:   '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  };
  var labels = { checking:'Checking…', verified:'Verified', fixed:'Auto-fixed', warning:'Warning', failed:'Check failed' };
  var badgeId = 'cx-code-badge-' + blockIndex;
  var existing = bubbleEl.querySelector('#' + badgeId);
  var badge = existing || document.createElement('div');
  badge.id = badgeId;
  badge.className = 'cx-code-badge cx-code-badge--' + state;
  badge.innerHTML = (icons[state]||'') + '<span>' + (labels[state]||state) + (detail ? ': ' + esc(String(detail)) : '') + '</span>';
  if (!existing) {
    var blocks = bubbleEl.querySelectorAll('.code-block');
    var target = blocks[blockIndex] || blocks[blocks.length-1];
    if (target) target.appendChild(badge);
    else bubbleEl.appendChild(badge);
  }
}

async function runFixPass(code, lang, errors, userQ) {
  var fixPrompt = 'Fix these ' + (lang||'code') + ' syntax errors:\n' + errors.slice(0,5).join('\n') +
    '\n\nCode:\n```' + lang + '\n' + code + '\n```\nReturn ONLY the corrected code block.';
  try {
    var res = await fetch(CHAT_URL, {
      method:'POST', headers:edgeHeaders(),
      body: JSON.stringify({ model:'groq/llama-3.1-8b-instant', stream:false, max_tokens:2048,
        messages:[{ role:'system', content:'You are a code repair tool. Fix syntax errors. Return only the corrected code block.' },{ role:'user', content:fixPrompt }] }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    var data = await res.json();
    var content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    if (!content) return null;
    var match = content.match(/```\w*\n?([\s\S]*?)```/);
    return match ? match[1].trim() : content.trim();
  } catch(e) { return null; }
}

async function runCodePipeline(bubbleEl, aiText, userQ) {
  if (!bubbleEl || !aiText) return;
  var blocks = extractCodeBlocks(aiText);
  if (!blocks.length) return;
  var checkable = ['javascript','js','jsx','json','html','css','python','py'];
  for (var i = 0; i < blocks.length; i++) {
    var block = blocks[i];
    if (!checkable.includes(block.lang)) continue;
    if (block.code.split('\n').length < 5) continue;
    setArtifactBadge(bubbleEl, i, 'checking');
    await new Promise(function(r) { setTimeout(r, 80); });
    var errors = syntaxCheck(block.lang, block.code);
    if (!errors.length) { setArtifactBadge(bubbleEl, i, 'verified'); continue; }
    var fixed = false;
    var current = block.code, currentErrors = errors;
    for (var attempt = 0; attempt < 2; attempt++) {
      setArtifactBadge(bubbleEl, i, 'checking', 'fixing ' + (attempt+1));
      var fixedCode = await runFixPass(current, block.lang, currentErrors, userQ);
      if (!fixedCode) break;
      var recheck = syntaxCheck(block.lang, fixedCode);
      // Update code in DOM
      var domBlocks = bubbleEl.querySelectorAll('.code-block');
      var target = domBlocks[i];
      if (target) { var pre = target.querySelector('pre'); if (pre) pre.innerHTML = '<code>' + fixedCode.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</code>'; }
      if (!recheck.length) { setArtifactBadge(bubbleEl, i, 'fixed', errors.length + ' issue' + (errors.length===1?'':'s')); fixed=true; break; }
      current = fixedCode; currentErrors = recheck;
    }
    if (!fixed) setArtifactBadge(bubbleEl, i, 'warning', errors[0].slice(0,60));
  }
}


/* ══════════════════════════════════════════════════════════
   MARKDOWN RENDERER
══════════════════════════════════════════════════════════ */

function mdToHTML(raw) {
  var text = String(raw || '');
  var thinkHTML = '';

  // Extract and render <think> blocks
  text = text.replace(/<think>([\s\S]*?)<\/think>/gi, function(_, content) {
    var trimmed = content.trim();
    if (!trimmed) return '';
    var words = trimmed.split(/\s+/).length;
    var safe = trimmed.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>');
    thinkHTML = '<details class="think-block" open>' +
      '<summary class="think-summary">Reasoning (' + words + ' tokens)</summary>' +
      '<div class="think-body">' + safe + '</div></details>';
    return '';
  });

  // Code blocks
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, function(_, lang, code) {
    var escaped = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    var l = esc(lang || 'code');
    var runnable = ['js','javascript','html','css','python','py'].includes((lang||'').toLowerCase());
    var runBtn = runnable
      ? '<button class="code-run-btn" onclick="window.runCode(this)" data-lang="' + esc((lang||'').toLowerCase()) + '"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> Run</button>'
      : '';
    return '<div class="code-block">' +
      '<div class="code-block-header"><span class="code-lang-label">' + l + '</span>' +
      '<div class="code-block-actions">' + runBtn +
      '<button class="code-copy-btn" onclick="copyCode(this)"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>' +
      '</div></div><pre><code>' + escaped + '</code></pre>' +
      '<div class="code-sandbox hidden"></div></div>';
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
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="cx-link" target="_blank" rel="noopener noreferrer">$1</a>');
  text = text.replace(/(?<!href="|href='|src="|src=')\b(https?:\/\/[^\s<>"'\)\]]+)/g, function(url) {
    var clean = url.replace(/[.,;:!?]+$/, '');
    var display = clean.length > 50 ? clean.slice(0,47) + '...' : clean;
    return '<a href="' + clean + '" class="cx-link" target="_blank" rel="noopener noreferrer">' + display + '</a>';
  });

  // Wrap plain text paragraphs
  var lines = text.split('\n');
  var result = [];
  var inBlock = false;
  lines.forEach(function(line) {
    if (line.match(/^<(h[1-6]|ul|ol|li|blockquote|hr|pre|div|details)/i)) {
      inBlock = false;
      result.push(line);
    } else if (line.trim() === '') {
      if (inBlock) { result.push('</p>'); inBlock = false; } else result.push('');
    } else {
      if (!inBlock) { result.push('<p>'); inBlock = true; }
      result.push(line);
    }
  });
  if (inBlock) result.push('</p>');

  return thinkHTML + result.join('\n');
}

window.copyCode = function(btn) {
  var pre = btn.closest('.code-block') && btn.closest('.code-block').querySelector('pre');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent || '').then(function() {
    var orig = btn.innerHTML;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.innerHTML = orig; }, 1400);
  });
};

window.runCode = function(btn) {
  var block = btn.closest('.code-block');
  if (!block) return;
  var code  = block.querySelector('pre code');
  var lang  = btn.dataset.lang || '';
  var sandbox = block.querySelector('.code-sandbox');
  if (!sandbox) return;
  sandbox.innerHTML = '';
  sandbox.classList.remove('hidden');
  if (['js','javascript'].includes(lang)) {
    try {
      var logs = [];
      var origLog = console.log;
      console.log = function() { logs.push(Array.from(arguments).join(' ')); origLog.apply(console, arguments); };
      var result = eval(code.textContent);
      console.log = origLog;
      logs.forEach(function(l) { var d=document.createElement('div'); d.className='sandbox-log'; d.textContent=l; sandbox.appendChild(d); });
      if (result !== undefined) { var d=document.createElement('div'); d.className='sandbox-result'; d.textContent='→ '+result; sandbox.appendChild(d); }
    } catch(e) {
      var d=document.createElement('div'); d.className='sandbox-err'; d.textContent=e.message; sandbox.appendChild(d);
    }
  } else if (lang === 'html') {
    var iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:200px;border:none;border-top:1px solid var(--border)';
    sandbox.appendChild(iframe);
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(code.textContent); doc.close();
    sandbox.classList.remove('hidden');
  } else {
    var d=document.createElement('div'); d.className='sandbox-log'; d.textContent='Run not supported for ' + lang; sandbox.appendChild(d);
  }
};


/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function() {
  loadSettings();
  applyTheme(_settings.theme);
  bindAuthUI();
  bindChatUI();
  populateModels();
  handleStartActions();
  initComposerLiveState();
  setTimeout(attachAllRipples, 200);

  // Ping Termux bridge silently
  pingTermux().then(function(ok) {
    if (ok) console.log('[CyanixAI] Termux bridge available');
  });

  if (!SUPABASE_URL.startsWith('https://') || SUPABASE_ANON.length < 40) {
    console.error('[CyanixAI] Supabase not configured.');
    return;
  }
  if (!window.supabase || !window.supabase.createClient) {
    console.error('[CyanixAI] Supabase SDK not loaded.');
    return;
  }

  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, storageKey:'cyanix-auth' },
  });

  _sb.auth.onAuthStateChange(function(event, session) {
    if (session) _session = session;
    if (event === 'SIGNED_IN') {
      if (_signedInUser && session && _signedInUser === session.user.id) return;
      onSignedIn(session);
    }
    if (event === 'TOKEN_REFRESHED') {
      console.log('[CyanixAI] Token refreshed');
      return;
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
  var params = new URLSearchParams(window.location.search);
  var panel  = params.get('panel');
  var auth   = params.get('auth');
  if (auth === 'google') window.addEventListener('cyanix:ready', function() { signInOAuth('google'); }, { once:true });
  if (auth === 'github') window.addEventListener('cyanix:ready', function() { signInOAuth('github'); }, { once:true });
  if (panel === 'signup') window.addEventListener('cyanix:ready', function() { showPanel('signup'); }, { once:true });
  if (panel && auth) try { window.history.replaceState({}, '', window.location.pathname); } catch(e) {}
  var action = window._startAction;
  var sharedText = window._sharedText;
  if (action === 'new-chat') window.addEventListener('cyanix:ready', function() { newChat(); }, { once:true });
  if (sharedText) {
    window.addEventListener('cyanix:ready', function() {
      var inp = $('composer-input');
      if (inp) { inp.value = sharedText; inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 150)+'px'; inp.focus(); }
    }, { once:true });
  }
}


/* ══════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════ */
function bindAuthUI() {
  document.querySelectorAll('.auth-switch-link').forEach(function(a) {
    a.addEventListener('click', function(e) { e.preventDefault(); showPanel(a.dataset.to); });
  });
  on('forgot-link', 'click', function(e) { e.preventDefault(); showPanel('forgot'); });

  on('si-btn',      'click',  signIn);
  on('si-email',    'keydown', function(e) { if (e.key==='Enter') { var p=$('si-password'); if(p) p.focus(); } });
  on('si-password', 'keydown', function(e) { if (e.key==='Enter') signIn(); });
  on('su-btn',      'click',  signUp);
  on('su-password', 'keydown', function(e) { if (e.key==='Enter') signUp(); });
  on('fp-btn',      'click',  sendReset);
  on('fp-email',    'keydown', function(e) { if (e.key==='Enter') sendReset(); });

  on('si-google', 'click', function() { signInOAuth('google'); });
  on('si-github', 'click', function() { signInOAuth('github'); });
  on('su-google', 'click', function() { signInOAuth('google'); });
  on('su-github', 'click', function() { signInOAuth('github'); });

  // Animate auth headline
  (function() {
    var phrases = [
      ['Think', false], ['beyond', false], ['limits.', true],
      ['Built', false], ['for', false], ['builders.', true],
      ['Search.', true], ['Reason.', true], ['Create.', true],
      ['Four', false], ['models.', false], ['One', false], ['answer.', true],
    ];
    var groups = [[0,1,2],[3,4,5],[6,7,8],[9,10,11,12]];
    var idx = 0;
    var hEl, tEl;
    var taglines = ['Your AI — built different.', 'Powered by the Axion ensemble.', 'Visible reasoning. Real answers.', 'Search the live web, instantly.'];
    function renderPhrase(gi) {
      if (!hEl) return;
      var group = groups[gi % groups.length];
      hEl.innerHTML = group.map(function(wi, i) {
        var w = phrases[wi];
        return '<span class="ah-word' + (w[1] ? ' acc' : '') + '" style="transition-delay:' + (i*70) + 'ms">' + w[0] + '&nbsp;</span>';
      }).join('');
      setTimeout(function() { hEl.querySelectorAll('.ah-word').forEach(function(s){ s.classList.add('in'); }); }, 30);
      if (tEl) tEl.textContent = taglines[gi % taglines.length];
    }
    function morphTo(next) {
      if (!hEl) return;
      hEl.querySelectorAll('.ah-word').forEach(function(s, i) {
        setTimeout(function() { s.classList.remove('in'); s.style.transform='translateY(-10px)'; s.style.opacity='0'; }, i * 60);
      });
      setTimeout(function() { idx = next; renderPhrase(idx); }, (groups[idx%groups.length].length - 1) * 60 + 300);
    }
    window.addEventListener('cyanix:ready', function() {
      hEl = $('auth-headline'); tEl = $('auth-tagline');
      if (!hEl) return;
      renderPhrase(0);
      setInterval(function() { morphTo((idx + 1) % groups.length); }, 3500);
    });
  })();
}

function showPanel(name) {
  ['signin', 'signup', 'forgot'].forEach(function(p) {
    var el = $('panel-' + p);
    if (el) el.classList.toggle('hidden', p !== name);
  });
  clearAuthMessages();
  if (name === 'signup') initDobField();
}

function clearAuthMessages() {
  ['si-err','si-ok','su-err','su-ok','fp-err','fp-ok'].forEach(function(id) {
    var el = $(id); if (el) { el.textContent = ''; hide(el); }
  });
}

function setMsg(id, msg, type) {
  var el = $(id); if (!el) return;
  el.textContent = msg; el.dataset.type = type; show(el);
}

async function signIn() {
  if (!_sb) { setMsg('si-err', 'App not ready — please refresh.', 'err'); return; }
  var email = $('si-email') ? $('si-email').value.trim() : '';
  var password = $('si-password') ? $('si-password').value : '';
  if (!email || !password) { setMsg('si-err', 'Please enter your email and password.', 'err'); return; }
  var btn = $('si-btn'); var span = btn && btn.querySelector('span');
  if (btn) btn.disabled = true;
  if (span) span.textContent = 'Signing in…';
  clearAuthMessages();
  try {
    var result = await _sb.auth.signInWithPassword({ email, password });
    if (result.error) setMsg('si-err', result.error.message, 'err');
  } catch(err) {
    setMsg('si-err', err.message || 'Sign in failed.', 'err');
  } finally {
    if (btn) btn.disabled = false;
    if (span) span.textContent = 'Continue';
  }
}

async function signUp() {
  if (!_sb) { setMsg('su-err', 'App not ready — please refresh.', 'err'); return; }
  var email    = $('su-email')    ? $('su-email').value.trim()    : '';
  var password = $('su-password') ? $('su-password').value        : '';
  var dobVal   = $('su-dob')      ? $('su-dob').value             : '';
  if (!email || !password) { setMsg('su-err', 'Please fill in all fields.', 'err'); return; }
  if (password.length < 8)  { setMsg('su-err', 'Password must be at least 8 characters.', 'err'); return; }
  if (!dobVal)              { setMsg('su-err', 'Please enter your date of birth.', 'err'); return; }
  var dob = new Date(dobVal); var today = new Date();
  var age = today.getFullYear() - dob.getFullYear();
  var md  = today.getMonth() - dob.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;
  if (isNaN(age) || dob > today) { setMsg('su-err', 'Please enter a valid date of birth.', 'err'); return; }
  if (age < 13) { setMsg('su-err', 'You must be 13 or older to use Cyanix AI.', 'err'); return; }
  var btn = $('su-btn'); var span = btn && btn.querySelector('span');
  if (btn) btn.disabled = true;
  if (span) span.textContent = 'Creating account…';
  clearAuthMessages();
  try {
    var result = await _sb.auth.signUp({
      email, password,
      options: { data: { dob: dobVal }, emailRedirectTo: REDIRECT_URL },
    });
    if (result.error) setMsg('su-err', result.error.message, 'err');
    else setMsg('su-ok', 'Check your email to confirm your account!', 'ok');
  } catch(err) {
    setMsg('su-err', err.message || 'Sign up failed.', 'err');
  } finally {
    if (btn) btn.disabled = false;
    if (span) span.textContent = 'Create Account';
  }
}

function initDobField() {
  var dob = $('su-dob'); if (!dob) return;
  var today = new Date();
  var max13 = new Date(today.getFullYear()-13, today.getMonth(), today.getDate());
  dob.max = max13.toISOString().split('T')[0];
  dob.min = new Date(today.getFullYear()-120, 0, 1).toISOString().split('T')[0];
}

async function sendReset() {
  if (!_sb) { setMsg('fp-err', 'App not ready — please refresh.', 'err'); return; }
  var email = $('fp-email') ? $('fp-email').value.trim() : '';
  if (!email) { setMsg('fp-err', 'Please enter your email.', 'err'); return; }
  var btn = $('fp-btn'); if (btn) btn.disabled = true;
  clearAuthMessages();
  try {
    var result = await _sb.auth.resetPasswordForEmail(email, { redirectTo: REDIRECT_URL });
    if (result.error) setMsg('fp-err', result.error.message, 'err');
    else setMsg('fp-ok', 'Reset link sent! Check your email.', 'ok');
  } finally { if (btn) btn.disabled = false; }
}

async function signInOAuth(provider) {
  if (!_sb) { toast('App not ready — please refresh.'); return; }
  try {
    var result = await _sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_URL } });
    if (result.error) toast('OAuth error: ' + result.error.message);
  } catch(err) { toast('OAuth error: ' + err.message); }
}

async function signOut() {
  window.closeSettings(); hide('help-modal'); hide('user-menu');
  try { await _sb.auth.signOut(); } catch(e) {}
  onSignedOut();
  toast('Signed out.');
}
window.signOut = signOut;


/* ══════════════════════════════════════════════════════════
   SIGNED IN / OUT
══════════════════════════════════════════════════════════ */
async function onSignedIn(session) {
  if (!session) return;
  if (_signedInUser === session.user.id && _chats.length > 0) return;
  _signedInUser = session.user.id;
  _session = session;
  _chats = []; _currentId = null; _history = [];

  hide('view-auth'); show('view-chat');

  const user = session.user;
  const rawName = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : user.email;
  const name = typeof rawName === 'string' ? rawName : String(rawName || user.email || '');
  const initials = name ? name.split(' ').map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase() : '?';

  // Update all avatar/name elements
  ['sb-avatar','um-avatar','stg-avatar-el'].forEach(function(id) {
    var el = $(id); if (el) el.textContent = initials;
  });
  ['sb-user-name','um-name','stg-avatar-name'].forEach(function(id) {
    var el = $(id); if (el) el.textContent = name || user.email;
  });
  ['sb-user-email','um-email','stg-avatar-email'].forEach(function(id) {
    var el = $(id); if (el) el.textContent = user.email || '';
  });

  await loadPreferences();
  await loadSupporter();
  await loadMemories();
  await loadChats();
  loadModerationState().catch(function() {});
  loadNotifications().catch(function() {});
  loadAvatarFromStorage().catch(function() {});
  startNotifPolling();
  startRealtime();

  newChat();
  setTimeout(attachAllRipples, 200);
  window.dispatchEvent(new Event('cyanix:ready'));
}

function onSignedOut() {
  stopRealtime();
  _session = null; _signedInUser = null;
  _chats = []; _currentId = null; _history = [];
  _supporter = { isActive:false, earlyAccess:false, premiumForever:false, memoryPriority:false, dailyLimit:40, unlockedThemes:[] };
  _usageToday = 0;
  ['sb-avatar','um-avatar','stg-avatar-el'].forEach(function(id){ var el=$(id); if(el) el.textContent='?'; });
  hide('view-chat'); show('view-auth'); showPanel('signin');
}

function edgeHeaders() {
  var h = { 'Content-Type': 'application/json' };
  if (_session && _session.access_token) h['Authorization'] = 'Bearer ' + _session.access_token;
  return h;
}


/* ══════════════════════════════════════════════════════════
   SETTINGS
══════════════════════════════════════════════════════════ */
function saveSettings() {
  try { localStorage.setItem('cx_settings', JSON.stringify(_settings)); } catch(e) {}
}

function loadSettings() {
  try {
    var raw = localStorage.getItem('cx_settings');
    if (raw) Object.assign(_settings, JSON.parse(raw));
  } catch(e) {}
  syncSettingsToUI();
}

function syncSettingsToUI() {
  if ($('streaming-toggle'))    $('streaming-toggle').checked    = !!_settings.streaming;
  if ($('theme-select'))        $('theme-select').value          = _settings.theme || 'dark';
  if ($('consent-toggle'))      $('consent-toggle').checked      = !!_settings.trainingConsent;
  if ($('rag-auto-toggle'))     $('rag-auto-toggle').checked     = !!_settings.ragAuto;
  _ragAuto = !!_settings.ragAuto;
  var langSel = $('language-select');
  if (langSel && langSel.options.length === 0) {
    SUPPORTED_LANGUAGES.forEach(function(l) {
      var opt = document.createElement('option');
      opt.value = l.code; opt.textContent = l.name;
      langSel.appendChild(opt);
    });
  }
  if (langSel) langSel.value = _settings.language || 'auto';
  var improveStatus = $('improve-nav-status');
  if (improveStatus) improveStatus.textContent = _settings.trainingConsent ? 'On' : 'Off';
}

function applyTheme(theme) { document.documentElement.dataset.theme = theme || 'dark'; }

function applyFontStyle(style) {
  var families = { 'geist':"'Geist', system-ui, sans-serif", 'mono':"'Geist Mono', monospace", 'serif':"'Instrument Serif', Georgia, serif" };
  document.documentElement.style.setProperty('--font', families[style] || families.geist);
}

function applyFontSize(size) { document.body.style.fontSize = size + 'px'; }

async function syncPreferences() {
  if (!_sb || !_session) return;
  try {
    await _sb.from('user_preferences').upsert({
      user_id:       _session.user.id,
      model:         _settings.model,
      theme:         _settings.theme,
      personality:   _settings.personality,
      rag_auto:      _settings.ragAuto,
      context_depth: _settings.contextDepth,
      language:      _settings.language,
      streaming:     _settings.streaming,
      training_consent: _settings.trainingConsent,
      updated_at:    new Date().toISOString(),
    }, { onConflict: 'user_id' });
  } catch(e) {}
}

async function loadPreferences() {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('user_preferences').select('*').eq('user_id', _session.user.id).single();
    if (res.data) {
      var d = res.data;
      if (d.model)     _settings.model       = d.model;
      if (d.theme)     { _settings.theme      = d.theme; applyTheme(d.theme); }
      if (d.personality) _settings.personality = d.personality;
      if (d.rag_auto !== undefined) { _settings.ragAuto = !!d.rag_auto; _ragAuto = _settings.ragAuto; }
      if (d.context_depth) _settings.contextDepth = d.context_depth;
      if (d.language)  _settings.language    = d.language;
      if (d.streaming !== undefined) _settings.streaming = !!d.streaming;
      if (d.training_consent !== undefined) _settings.trainingConsent = !!d.training_consent;
      syncSettingsToUI();
    }
  } catch(e) {}
}

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
    }
    await loadUsageToday();
  } catch(e) {}
}

async function loadUsageToday() {
  if (!_session) return;
  try {
    var windowKey = getUsageWindowKey();
    var res = await _sb.from('user_usage').select('prompt_count').eq('user_id', _session.user.id).eq('usage_date', windowKey).single();
    _usageToday = (res.data && res.data.prompt_count) ? res.data.prompt_count : 0;
  } catch(e) { _usageToday = 0; }
}

function getUsageWindowKey() {
  var now = new Date();
  return now.getUTCFullYear() + '-' +
    String(now.getUTCMonth()+1).padStart(2,'0') + '-' +
    String(now.getUTCDate()).padStart(2,'0');
}

async function incrementUsage() {
  if (!_session) return;
  _usageToday++;
  try {
    var key = getUsageWindowKey();
    await _sb.from('user_usage').upsert({ user_id:_session.user.id, usage_date:key, prompt_count:_usageToday }, { onConflict:'user_id,usage_date' });
  } catch(e) {}
}

window.openSettings = function() {
  show('settings-modal');
  syncSettingsToUI();
};
window.closeSettings = function() {
  hide('settings-modal');
  window.closeSettingsPage();
};

var _subpageTemplates = {
  appearance: function() {
    return '<div class="settings-card">' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Theme</div></div>' +
      '<select class="setting-select" id="theme-select" style="width:auto">' +
        '<option value="dark">Dark</option><option value="light">Light</option><option value="midnight">Midnight</option>' +
      '</select></div>' +
      '<div class="settings-card-divider"></div>' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Font Size</div></div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<button id="font-size-down" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1px solid var(--border);background:var(--surface-2)">−</button>' +
          '<span id="font-size-val">' + (_settings.fontSize||15) + '</span>px' +
          '<button id="font-size-up" style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:6px;border:1px solid var(--border);background:var(--surface-2)">+</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  },
  memory: function() {
    var memCount = _memories ? _memories.length : 0;
    return '<div class="settings-card">' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Stored memories</div><div class="scr-desc">' + memCount + ' memories across all chats</div></div>' +
        '<button id="clear-all-memories-btn" style="padding:5px 12px;border-radius:6px;border:1px solid var(--red);color:var(--red);font-size:.78rem;background:none">Clear all</button>' +
      '</div>' +
      '<div class="settings-card-divider"></div>' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Context depth</div></div>' +
        '<select class="setting-select" id="context-depth-select" style="width:auto">' +
          '<option value="light">Light (5)</option>' +
          '<option value="standard">Standard (15)</option>' +
          '<option value="deep">Deep (30)</option>' +
        '</select>' +
      '</div>' +
    '</div>';
  },
  'ai-intel': function() {
    return '<div class="settings-card">' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Streaming responses</div></div>' +
        '<label class="cx-toggle"><input type="checkbox" id="streaming-toggle"><div class="cx-toggle-track"></div><div class="cx-toggle-thumb"></div></label>' +
      '</div>' +
      '<div class="settings-card-divider"></div>' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Auto web search</div><div class="scr-desc" id="rag-auto-desc">Automatically search when questions need current info</div></div>' +
        '<label class="cx-toggle"><input type="checkbox" id="rag-auto-toggle"><div class="cx-toggle-track"></div><div class="cx-toggle-thumb"></div></label>' +
      '</div>' +
      '<div class="settings-card-divider"></div>' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Response language</div></div>' +
        '<select class="setting-select" id="language-select" style="width:auto"></select>' +
      '</div>' +
    '</div>';
  },
  files: function() {
    return '<div style="padding:4px 0 12px"><p style="font-size:.83rem;color:var(--text-3);line-height:1.6">' +
      'Files you upload are stored in Supabase Storage and used as context for this chat. ' +
      'Termux file reading allows Cyanix to read files from your local filesystem silently.' +
      '</p></div>' +
      '<div class="settings-card">' +
        '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Termux bridge</div>' +
          '<div class="scr-desc">' + (_termuxAvailable ? '● Connected at ' + TERMUX_BRIDGE : '○ Not available — run claude_server.py') + '</div></div>' +
          '<button onclick="pingTermux().then(function(ok){toast(ok?\'Termux connected\':\'Termux not reachable\');})" style="padding:5px 12px;border-radius:6px;border:1px solid var(--border);font-size:.78rem;background:var(--surface-2)">Ping</button>' +
        '</div>' +
        '<div class="settings-card-divider"></div>' +
        '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Stored files</div>' +
          '<div class="scr-desc" id="stored-files-count">Loading…</div></div>' +
          '<button id="load-stored-files-btn" style="padding:5px 12px;border-radius:6px;border:1px solid var(--border);font-size:.78rem;background:var(--surface-2)">View</button>' +
        '</div>' +
      '</div>' +
      '<div id="stored-files-list" style="margin-top:10px"></div>';
  },
  notifications: function() {
    return '<div class="settings-card">' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Push notifications</div><div class="scr-desc" id="notif-status-desc">Get notified when Cyanix responds</div></div>' +
        '<label class="cx-toggle"><input type="checkbox" id="notif-toggle"><div class="cx-toggle-track"></div><div class="cx-toggle-thumb"></div></label>' +
      '</div>' +
      '<div class="settings-card-divider" id="notif-test-divider" style="display:none"></div>' +
      '<div class="settings-card-row" id="notif-test-row" style="display:none"><div class="scr-body"><div class="scr-label">Test notification</div></div>' +
        '<button id="notif-test-btn" style="padding:5px 12px;border-radius:6px;border:1px solid var(--border);font-size:.78rem;background:var(--surface-2)">Test</button>' +
      '</div>' +
    '</div>';
  },
  improve: function() {
    return '<div class="settings-card">' +
      '<div class="settings-card-row"><div class="scr-body"><div class="scr-label">Contribute training data</div><div class="scr-desc">Help improve Cyanix AI by sharing anonymized conversations</div></div>' +
        '<label class="cx-toggle"><input type="checkbox" id="consent-toggle"><div class="cx-toggle-track"></div><div class="cx-toggle-thumb"></div></label>' +
      '</div>' +
      '<div class="settings-card-divider" id="training-data-row" style="display:none"></div>' +
      '<div class="settings-card-row" id="training-data-btn-row" style="display:none"><div class="scr-body"><div class="scr-label">Withdraw contributions</div></div>' +
        '<button id="delete-training-btn" style="padding:5px 12px;border-radius:6px;border:1px solid var(--red);color:var(--red);font-size:.78rem;background:none">Withdraw</button>' +
      '</div>' +
    '</div>';
  },
  tos: function() {
    return '<div style="font-size:.88rem;color:var(--text-2);line-height:1.7">' +
      '<p>By using Cyanix AI you agree to our Terms of Service and Privacy Policy.</p>' +
      '<p style="margin-top:10px">You must be 13+ to use this service.</p>' +
      '<p style="margin-top:10px">We store conversation data to provide the service. You can delete your data at any time via Settings → Clear chats.</p>' +
    '</div>' +
    '<div class="settings-card" style="margin-top:16px">' +
      '<div class="settings-card-row" style="cursor:pointer" onclick="window.closeSettings();"><div class="scr-body"><div class="scr-label" style="color:var(--red)">Clear all chats</div></div>' +
        '<button id="clear-chats-btn" style="padding:5px 12px;border-radius:6px;border:1px solid var(--red);color:var(--red);font-size:.78rem;background:none">Clear</button>' +
      '</div>' +
    '</div>';
  },
};

window.openSettingsPage = function(name) {
  var sub  = $('settings-subpage');
  var body = $('subpage-body');
  var title = $('subpage-title');
  if (!sub || !body) return;
  var titles = { appearance:'Appearance', memory:'Memory', 'ai-intel':'AI & Intelligence', files:'Files & Uploads', notifications:'Notifications', improve:'Improve Cyanix', tos:'Terms & Privacy' };
  if (title) title.textContent = titles[name] || name;
  var fn = _subpageTemplates[name];
  body.innerHTML = fn ? fn() : '<p style="color:var(--text-3);padding:20px">Coming soon.</p>';
  sub.classList.remove('hidden');
  syncSettingsToUI();

  // Wire up subpage-specific bindings
  on('theme-select','change', function() {
    _settings.theme = $('theme-select').value;
    applyTheme(_settings.theme); saveSettings(); syncPreferences();
  });
  on('streaming-toggle','change', function() { _settings.streaming = !!$('streaming-toggle').checked; saveSettings(); syncPreferences(); });
  on('consent-toggle','change', function() {
    _settings.trainingConsent = !!$('consent-toggle').checked;
    var el = $('improve-nav-status'); if(el) el.textContent = _settings.trainingConsent ? 'On' : 'Off';
    saveSettings(); syncPreferences();
    var row = $('training-data-btn-row'); if(row) row.style.display = _settings.trainingConsent ? 'flex' : 'none';
  });
  on('rag-auto-toggle','change', function() { _settings.ragAuto = !!$('rag-auto-toggle').checked; _ragAuto = _settings.ragAuto; saveSettings(); syncPreferences(); });
  on('notif-toggle','change', async function() {
    var tog = $('notif-toggle'); if(!tog) return;
    if(tog.checked) { var ok = await subscribeToPush(); if(!ok) { tog.checked=false; return; } updateNotifUI(true); }
    else { await unsubscribeFromPush(); updateNotifUI(false); }
  });
  on('notif-test-btn','click', async function() {
    var btn = $('notif-test-btn'); if(btn) { btn.textContent='Sending…'; btn.disabled=true; }
    try {
      if('serviceWorker' in navigator) {
        var reg = await navigator.serviceWorker.ready;
        await reg.showNotification('Cyanix AI', { body:'Notifications are working!', icon:'/icons/manifest/icon-192x192.png' });
        toast('Test notification sent!');
      }
    } catch(e) { toast('Could not send test: ' + e.message); }
    if(btn) { btn.textContent='Test'; btn.disabled=false; }
  });
  on('clear-all-memories-btn','click', async function() {
    if (!_sb || !_session) return;
    if (!confirm('Delete all ' + _memories.length + ' memories? This cannot be undone.')) return;
    try {
      await _sb.from('user_memories').delete().eq('user_id', _session.user.id);
      _memories = []; toast('All memories cleared.'); window.closeSettingsPage(); window.openSettingsPage('memory');
    } catch(e) { toast('Could not clear memories.'); }
  });
  on('delete-training-btn','click', async function() {
    if (!confirm('Withdraw your anonymized contributions?')) return;
    try { await fetch(TRAINING_URL, { method:'DELETE', headers:edgeHeaders() }); toast('Withdrawn.'); }
    catch(e) { toast('Could not complete. Try again.'); }
  });
  on('clear-chats-btn','click', async function() {
    if (!confirm('Clear all chats? This cannot be undone.')) return;
    try {
      await _sb.from('chats').delete().eq('user_id', _session.user.id);
      _chats=[]; _currentId=null; _history=[];
      renderChatList(); newChat(); window.closeSettings(); toast('All chats cleared.');
    } catch(e) { toast('Failed to clear chats.'); }
  });
  on('font-size-up','click', function() { _settings.fontSize = Math.min(20,(_settings.fontSize||15)+1); applyFontSize(_settings.fontSize); saveSettings(); var el=$('font-size-val'); if(el) el.textContent=_settings.fontSize; });
  on('font-size-down','click', function() { _settings.fontSize = Math.max(8,(_settings.fontSize||15)-1); applyFontSize(_settings.fontSize); saveSettings(); var el=$('font-size-val'); if(el) el.textContent=_settings.fontSize; });
  on('load-stored-files-btn','click', async function() {
    var list = $('stored-files-list'); var count = $('stored-files-count');
    if (!list) return;
    var files = await loadStoredFiles();
    if (count) count.textContent = files.length + ' file' + (files.length===1?'':'s');
    if (!files.length) { list.innerHTML = '<p style="font-size:.82rem;color:var(--text-3);padding:8px 0">No files stored yet.</p>'; return; }
    list.innerHTML = files.map(function(f) {
      var size = f.metadata && f.metadata.size ? Math.round(f.metadata.size/1024) + 'KB' : '';
      return '<div class="file-context-chip fc-stored" style="display:flex;justify-content:space-between;width:100%;border-radius:8px;margin-bottom:6px;padding:8px 12px">' +
        '<span class="fc-name">' + esc(f.name) + '</span>' +
        '<span class="fc-size">' + size + '</span>' +
        '<button onclick="deleteStoredFile(\'' + esc(_session.user.id + '/' + f.name) + '\')" style="color:var(--red);font-size:.72rem;background:none;border:none;cursor:pointer">Delete</button>' +
      '</div>';
    }).join('');
  });
};

window.closeSettingsPage = function() {
  var sub = $('settings-subpage'); if (sub) sub.classList.add('hidden');
};


/* ══════════════════════════════════════════════════════════
   MODELS
══════════════════════════════════════════════════════════ */
function populateModels() {
  var sel = $('model-select');
  if (sel) sel.innerHTML = MODELS.map(function(m) {
    return '<option value="' + m.id + '"' + (m.id===_settings.model?' selected':'') + '>' + m.name + '</option>';
  }).join('');
}

function updateModelLabel() {
  var m = MODELS.find(function(x) { return x.id === _settings.model; });
  var el = $('model-name-label');
  if (el) el.textContent = m ? m.name : 'Select model';
}


/* ══════════════════════════════════════════════════════════
   CONTENT MODERATION
══════════════════════════════════════════════════════════ */
var _modPatterns = [
  /\bn[i1!|]+g+[e3]+r/i, /\bn[i1!|]+g+[a@]+\b/i,
  /\bc[h]+[i1]+n[kc]/i, /\bs[p]+[i1]+c[k]?\b/i, /\bk[i1]+k[e3]\b/i,
  /\bf[a@4][g9]+[o0]?t/i, /\bd[y]+k[e3]\b/i, /\br[e3]t[a@4]rd/i,
  /\bheil\s+hitler/i, /\bwhite\s+power\b/i,
  /\bkill\s+(all\s+)?(blacks?|jews?|gays?|muslims?)/i,
];
var _userStrikes = 0;
var _userIsBanned = false;

async function loadModerationState() {
  if (!_sb || !_session) return;
  try {
    var banRes = await _sb.from('banned_users').select('user_id').eq('user_id', _session.user.id).maybeSingle();
    if (banRes.data) { _userIsBanned = true; showBanScreen(); return; }
    var strikeRes = await _sb.from('user_strikes').select('id', { count:'exact', head:true }).eq('user_id', _session.user.id);
    _userStrikes = strikeRes.count || 0;
  } catch(e) {}
}

async function checkModeration(text) {
  if (!text) return null;
  var normalised = text.toLowerCase().replace(/[0-9@!]/g, function(c) {
    return {'0':'o','1':'i','3':'e','4':'a','@':'a','!':'i'}[c] || c;
  }).replace(/\s+/g, ' ');
  for (var i = 0; i < _modPatterns.length; i++) {
    if (_modPatterns[i].test(normalised)) return 'hate_speech';
  }
  return null;
}

async function issueStrike(reason, content) {
  if (!_sb || !_session) return;
  _userStrikes++;
  try {
    await _sb.from('user_strikes').insert({ user_id:_session.user.id, reason, content: content ? content.slice(0,100) : null, strike_num:_userStrikes });
    if (_userStrikes >= 3) {
      await _sb.from('banned_users').upsert({ user_id:_session.user.id, reason:'Automatic ban: 3 strikes', banned_by:'auto-moderation' }, { onConflict:'user_id' });
      _userIsBanned = true;
    }
  } catch(e) {}
  showStrikeWarning(_userStrikes);
  if (_userStrikes >= 3) setTimeout(showBanScreen, 2000);
}

function showStrikeWarning(n) {
  var msgs = ['⚠️ Strike 1/3 — Hate speech is not allowed. 2 more strikes = permanent ban.', '⛔ Strike 2/3 — Final warning.', '🚫 Strike 3/3 — Your account has been banned.'];
  var container = $('messages'); if (!container) return;
  var el = document.createElement('div'); el.className = 'mod-warning-banner';
  el.innerHTML = '<div class="mod-warning-icon">⚠</div><div class="mod-warning-body"><div class="mod-warning-title">Content Policy Violation</div><div class="mod-warning-text">' + (msgs[n-1]||msgs[0]) + '</div></div>';
  container.appendChild(el); el.scrollIntoView({ behavior:'smooth', block:'center' });
}

function showBanScreen() {
  var composer = $('composer-input'); var sendBtn = $('send-btn');
  if (composer) { composer.disabled = true; composer.placeholder = 'Account suspended.'; }
  if (sendBtn) sendBtn.disabled = true;
  if ($('ban-overlay')) return;
  var overlay = document.createElement('div'); overlay.id = 'ban-overlay'; overlay.className = 'ban-overlay';
  overlay.innerHTML = '<div class="ban-card"><div class="ban-icon">⊘</div><h2 class="ban-title">Account Suspended</h2><p class="ban-body">Your account has been permanently suspended for repeated violations of the Cyanix AI Terms of Service.</p><p class="ban-sub">Contact support if you believe this is a mistake.</p></div>';
  document.body.appendChild(overlay);
}


/* ══════════════════════════════════════════════════════════
   CHAT UI BINDINGS
══════════════════════════════════════════════════════════ */
function bindChatUI() {
  (function() {
    var sb = $('sidebar');
    if (sb && window.innerWidth <= 700) sb.classList.remove('open');
  })();

  on('sb-collapse-btn', 'click', function() {
    var sb = $('sidebar'); if (sb) sb.classList.remove('open');
    var ov = $('sidebar-overlay'); if (ov) ov.classList.add('hidden');
  });
  on('topbar-menu-btn', 'click', function() {
    var sb = $('sidebar'); if (!sb) return;
    if (window.innerWidth <= 700) {
      sb.classList.toggle('open');
      var ov = $('sidebar-overlay');
      if (ov) ov.classList.toggle('hidden', !sb.classList.contains('open'));
    } else {
      sb.classList.toggle('collapsed');
    }
  });
  on('sidebar-overlay', 'click', function() {
    var sb = $('sidebar'); if (sb) sb.classList.remove('open');
    hide('sidebar-overlay');
  });

  on('new-chat-btn',       'click', newChat);
  on('new-chat-topbar-btn','click', newChat);
  on('share-chat-btn',     'click', shareCurrentChat);

  on('send-btn',  'click', function() { haptic(8); handleSend(); });
  on('mic-btn',   'click', function() { haptic([8,50,8]); toggleVoiceInput(); });
  on('attach-btn','click', triggerFileAttach);
  on('attach-remove','click', clearAttachment);

  on('composer-input', 'keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  on('composer-input', 'input', function() {
    var ta = $('composer-input'); if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 220) + 'px';
    updateSendBtn();
  });

  on('rag-toggle-btn', 'click', toggleRAG);
  on('settings-btn',   'click', function() { window.openSettings(); });
  on('help-btn',       'click', function() { show('help-modal'); });
  on('help-close',     'click', function() { hide('help-modal'); });
  on('help-modal',     'click', function(e) { if(e.target.id==='help-modal') hide('help-modal'); });
  on('user-btn',       'click', toggleUserMenu);
  on('signout-btn-menu','click', function() { closeUserMenu(); signOut(); });

  document.addEventListener('click', function(e) {
    var ubtn = $('user-btn'); var umenu = $('user-menu');
    if (ubtn && umenu && !ubtn.contains(e.target) && !umenu.contains(e.target)) closeUserMenu();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (_responding) stopResponse();
      window.closeSettings(); hide('help-modal'); closeUserMenu();
    }
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault(); var inp = $('composer-input'); if (inp) inp.focus();
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') { e.preventDefault(); newChat(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      var sb = $('sidebar');
      if (sb) { if(window.innerWidth<=700) sb.classList.toggle('open'); else sb.classList.toggle('collapsed'); }
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'W') { e.preventDefault(); toggleRAG(); }
  });
}

function triggerFileAttach() {
  var inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = [
    'image/*',
    'application/pdf,.pdf',
    '.docx,.pptx,.xlsx,.xls,.csv',
    'text/plain,.txt,.md,.markdown',
    '.js,.ts,.jsx,.tsx,.json,.py,.sh,.yaml,.yml,.toml,.ini,.env,.sql,.log,.xml,.rs,.go,.java,.c,.cpp,.h,.php,.rb,.swift,.kt',
  ].join(',');
  inp.onchange = function() {
    var file = inp.files && inp.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast('File too large. Max 50MB.'); return; }
    handleAttachment(file);
  };
  inp.click();
}

function toggleUserMenu() {
  var m = $('user-menu'); if (m) m.classList.toggle('hidden');
}
function closeUserMenu() { hide('user-menu'); }

function updateSendBtn() {
  var inp = $('composer-input');
  var btn = $('send-btn');
  if (!btn) return;
  var hasText = inp && inp.value.trim().length > 0;
  btn.disabled = !hasText && !_responding;
}

function setSendBtn(mode) {
  var btn = $('send-btn'); if (!btn) return;
  if (mode === 'stop') {
    btn.classList.add('stop-mode');
    btn.title = 'Stop (Esc)';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
    btn.disabled = false;
  } else {
    btn.classList.remove('stop-mode');
    btn.title = 'Send (Enter)';
    btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    updateSendBtn();
  }
}

function initComposerLiveState() {
  var inp = $('composer-input');
  if (inp) inp.addEventListener('input', function() {
    var count = $('composer-counter');
    if (count) { var n = inp.value.length; count.textContent = n > 100 ? n : ''; }
    updateSendBtn();
  });
}

function toggleRAG() {
  _ragEnabled = !_ragEnabled;
  var btn = $('rag-toggle-btn');
  if (btn) btn.classList.toggle('active', _ragEnabled);
  toast(_ragEnabled ? '🔍 Web search on' : 'Web search off');
}


/* ══════════════════════════════════════════════════════════
   MODELS
══════════════════════════════════════════════════════════ */
function populateModels() {
  var sel = $('model-select');
  if (sel) sel.innerHTML = MODELS.map(function(m) {
    return '<option value="' + m.id + '"' + (m.id===_settings.model?' selected':'') + '>' + m.name + '</option>';
  }).join('');
  updateModelLabel();
}


/* ══════════════════════════════════════════════════════════
   CHATS
══════════════════════════════════════════════════════════ */
async function loadChats() {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('chats').select('id,title,updated_at').eq('user_id', _session.user.id).order('updated_at', { ascending:false }).limit(50);
    if (res.error) { console.error('[CyanixAI] loadChats:', res.error.message); return; }
    _chats = res.data || [];
    renderChatList();
  } catch(e) {}
}

function renderChatList() {
  var list = $('chat-list'); if (!list) return;
  if (!_chats.length) { list.innerHTML = '<div class="sb-empty">No conversations yet</div>'; return; }
  list.innerHTML = _chats.map(function(c) {
    return '<div class="chat-item' + (c.id===_currentId?' active':'') + '" data-id="' + esc(c.id) + '">' +
      '<span class="ci-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>' +
      '<span class="ci-label">' + esc(c.title || 'New chat') + '</span>' +
      '<button class="ci-del" data-id="' + esc(c.id) + '"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div>';
  }).join('');
  list.querySelectorAll('.chat-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      if (e.target.closest('.ci-del')) return;
      loadChat(item.dataset.id);
      if (window.innerWidth <= 700) { var sb=$('sidebar'); if(sb) sb.classList.remove('open'); hide('sidebar-overlay'); }
    });
  });
  list.querySelectorAll('.ci-del').forEach(function(btn) {
    btn.addEventListener('click', function(e) { e.stopPropagation(); deleteChat(btn.dataset.id); });
  });
}

async function loadChat(id) {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('messages').select('role,content,created_at').eq('chat_id', id).eq('user_id', _session.user.id).order('created_at', { ascending:true }).limit(100);
    if (res.error) { toast('Could not load chat.'); return; }
    _currentId = id;
    _history   = [];
    clearMessages();
    hide('welcome-state');
    (res.data || []).forEach(function(m) {
      _history.push({ role:m.role, content:m.content });
      renderMessage(m.role === 'user' ? 'user' : 'ai', m.content, false);
    });
    var chat = _chats.find(function(c) { return c.id === id; });
    if ($('chat-title')) $('chat-title').textContent = (chat && chat.title) || 'Chat';
    renderChatList();
    scrollToBottom();
  } catch(e) { toast('Could not load chat.'); }
}

function newChat() {
  _currentId = null;
  _history   = [];
  clearMessages();
  show('welcome-state');
  renderWelcome();
  renderChatList();
  if ($('chat-title')) $('chat-title').textContent = 'New chat';
  var inp = $('composer-input');
  if (inp) { inp.value = ''; inp.style.height = 'auto'; inp.focus(); }
  clearAttachment();
  updateSendBtn();
}

async function deleteChat(id) {
  try {
    await _sb.from('chats').delete().eq('id', id);
    _chats = _chats.filter(function(c) { return c.id !== id; });
    if (_currentId === id) newChat(); else renderChatList();
    toast('Chat deleted.');
  } catch(e) { toast('Failed to delete chat.'); }
}

async function syncChatToDB(id, title) {
  if (!_sb || !_session) return null;
  try {
    var res = await _sb.from('chats').insert({ id, title, user_id:_session.user.id, created_at:new Date().toISOString(), updated_at:new Date().toISOString() }).select('id').single();
    if (res.error) { console.error('[CyanixAI] syncChatToDB:', res.error.message); return null; }
    return res.data && res.data.id;
  } catch(e) { return null; }
}

async function syncMessagesToDB(chatId, userText, aiText) {
  if (!_sb || !_session) return null;
  try {
    var msgs = [
      { chat_id:chatId, user_id:_session.user.id, role:'user',      content:userText, created_at:new Date().toISOString() },
      { chat_id:chatId, user_id:_session.user.id, role:'assistant', content:aiText,   created_at:new Date().toISOString() },
    ];
    var res = await _sb.from('messages').insert(msgs).select('id');
    var ids = res.data || [];
    return ids.length >= 2 ? ids[1].id : null;
  } catch(e) { return null; }
}

async function generateChatTitle(userText, aiText) {
  try {
    var prompt = 'Generate a short chat title (max 5 words) for this conversation.\nUser: ' + userText.slice(0,200) + '\nAI: ' + aiText.slice(0,200) + '\nReturn ONLY the title, no quotes or punctuation.';
    var res = await fetch(CHAT_URL, {
      method:'POST', headers:edgeHeaders(),
      body: JSON.stringify({ model:'groq/llama-3.1-8b-instant', stream:false, max_tokens:20,
        messages:[{ role:'system', content:'Generate chat titles. Return only the title, no quotes.' },{ role:'user', content:prompt }] }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    var data = await res.json();
    var title = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content || '').trim();
    title = title.replace(/^["']|["']$/g,'').trim();
    return (title && title.length > 2 && title.length < 60) ? title : null;
  } catch(e) { return null; }
}


/* ══════════════════════════════════════════════════════════
   CHAT SEARCH (sidebar)
══════════════════════════════════════════════════════════ */
(function() {
  var _searchTimer = null;
  function highlight(text, query) {
    if (!query) return esc(text);
    var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&') + ')', 'gi');
    return esc(text).replace(re, '<mark class="sb-highlight">$1</mark>');
  }
  window.addEventListener('cyanix:ready', function() {
    var inp   = $('sb-search-input');
    var clear = $('sb-search-clear');
    var panel = $('sb-search-results');
    var list  = $('chat-list');
    var label = $('sb-section-label');
    if (!inp) return;
    inp.addEventListener('input', function() {
      var q = inp.value.trim();
      if (clear) clear.classList.toggle('hidden', !q);
      if (!q) {
        if (panel) { panel.innerHTML=''; panel.classList.add('hidden'); }
        if (list) list.classList.remove('sb-hidden');
        if (label) label.classList.remove('sb-hidden');
        return;
      }
      if (list) list.classList.add('sb-hidden');
      if (label) label.classList.add('sb-hidden');
      if (panel) panel.classList.remove('hidden');
      clearTimeout(_searchTimer);
      _searchTimer = setTimeout(async function() {
        var ql = q.toLowerCase();
        var results = _chats.filter(function(c){ return (c.title||'').toLowerCase().includes(ql); }).map(function(c){ return { id:c.id, title:c.title, snippet:'' }; });
        if (!results.length && _sb && _session) {
          try {
            var res = await _sb.from('messages').select('chat_id,content').eq('user_id',_session.user.id).ilike('content','%'+q+'%').limit(20);
            if (res.data) res.data.forEach(function(m) {
              if (results.find(function(r){ return r.id===m.chat_id; })) return;
              var chat = _chats.find(function(c){ return c.id===m.chat_id; });
              var idx = (m.content||'').toLowerCase().indexOf(ql);
              var start = Math.max(0,idx-40);
              var snippet = (start>0?'…':'') + m.content.slice(start, idx+q.length+60).trim() + '…';
              results.push({ id:m.chat_id, title:(chat&&chat.title)||'Chat', snippet });
            });
          } catch(e) {}
        }
        if (!panel) return;
        if (!results.length) { panel.innerHTML = '<div class="sb-search-empty">No results for "' + esc(q) + '"</div>'; return; }
        panel.innerHTML = results.map(function(r) {
          return '<div class="sb-result-item' + (r.id===_currentId?' active':'') + '" data-id="' + esc(r.id) + '">' +
            '<div class="sb-result-title">' + highlight(r.title||'Chat', q) + '</div>' +
            (r.snippet?'<div class="sb-result-snippet">' + highlight(r.snippet,q) + '</div>':'') + '</div>';
        }).join('');
        panel.querySelectorAll('.sb-result-item').forEach(function(item) {
          item.addEventListener('click', function() {
            loadChat(item.dataset.id);
            if (window.innerWidth<=700) { var sb=$('sidebar'); if(sb) sb.classList.remove('open'); hide('sidebar-overlay'); }
          });
        });
      }, 250);
    });
    if (clear) clear.addEventListener('click', function() {
      inp.value = ''; clear.classList.add('hidden');
      if (panel) { panel.innerHTML=''; panel.classList.add('hidden'); }
      if (list) list.classList.remove('sb-hidden');
      if (label) label.classList.remove('sb-hidden');
    });
  });
})();


/* ══════════════════════════════════════════════════════════
   SEND / STREAM
══════════════════════════════════════════════════════════ */
function handleSend() {
  if (_responding) { stopResponse(); return; }
  var inp = $('composer-input'); if (!inp) return;
  var text = inp.value.trim(); if (!text) return;
  inp.value = ''; inp.style.height = 'auto';
  updateSendBtn();
  sendMessage(text);
}

function stopResponse() {
  if (_abortCtrl) { _abortCtrl.abort(); _abortCtrl = null; }
  _responding = false;
  hide('typing-row');
  setSendBtn('send');
}

async function sendMessage(text) {
  if (_userIsBanned) { toast('Your account is suspended.'); return; }

  // Check usage limit
  if (!_supporter.isActive && _supporter.dailyLimit !== null && _usageToday >= _supporter.dailyLimit) {
    toast('Daily limit reached. Try again tomorrow.'); return;
  }

  // Moderation check
  var violation = await checkModeration(text);
  if (violation) { issueStrike(violation, text); return; }

  // Auto-detect Termux file paths in message — read silently
  if (_termuxAvailable && !_attachment) {
    var tpath = extractTermuxPath(text);
    if (tpath && isTermuxReadable(tpath.split('/').pop())) {
      var fileData = await termuxReadFile(tpath);
      if (fileData) {
        _attachment = { type:'text', name:fileData.name, data:fileData.content, label:'File' };
        // Don't show preview chip — silent injection
      }
    }
  }

  var isNewChat = !_currentId;
  if (isNewChat) {
    _currentId = localUUID();
    _chats.unshift({ id:_currentId, title:'New chat', updated_at:new Date().toISOString() });
    renderChatList();
    if ($('chat-title')) $('chat-title').textContent = 'New chat';
  }

  hide('welcome-state');

  // Render user message
  _history.push({ role:'user', content:text });
  var userDisplayText = text;
  if (_attachment && _attachment.type === 'image') {
    renderMessage('user', text, true, null, _attachment.data);
  } else {
    renderMessage('user', text, true);
  }

  var pendingAttachment = _attachment;
  clearAttachment();
  show('typing-row');
  scrollToBottom();

  _responding = true;
  setSendBtn('stop');
  _abortCtrl = new AbortController();

  // Thought stream state reset
  _thoughtEl = null; _thoughtText = ''; _inThoughtBlock = false;

  // Build context
  var browseData = null, ragData = null;
  var urls = text.match(/https?:\/\/[^\s]+/g);
  if (urls && urls.length) {
    var thinking = $('thinking-text'); if(thinking) thinking.textContent = 'Reading the page…';
    try {
      var ctrl = new AbortController(); var t = setTimeout(function(){ ctrl.abort(); }, 18000);
      var res = await fetch(BROWSE_URL, { method:'POST', headers:edgeHeaders(), signal:ctrl.signal, body:JSON.stringify({ url:urls[0], context:text }) });
      clearTimeout(t);
      if (res.ok) { var d = await res.json(); if (!d.error) browseData = { url:urls[0], ...d }; }
    } catch(e) {}
    if(thinking) thinking.textContent = 'Cyanix is thinking';
  }

  if (!browseData && (_ragEnabled || _ragAuto)) {
    var thinking2 = $('thinking-text'); if(thinking2) thinking2.textContent = 'Searching the web…';
    try { ragData = await fetchRAGContext(text); } catch(e) {}
    if(thinking2) thinking2.textContent = 'Cyanix is thinking';
  }

  fetchKGContext(text).catch(function(){});

  // Build user content (with attachment)
  var userContent;
  if (pendingAttachment) {
    if (pendingAttachment.type === 'image') {
      userContent = [
        { type:'image_url', image_url:{ url:'data:' + pendingAttachment.mediaType + ';base64,' + pendingAttachment.data } },
        { type:'text', text },
      ];
    } else {
      var label = pendingAttachment.label || 'File';
      var ext = pendingAttachment.name.split('.').pop() || 'text';
      userContent = text + '\n\n---\n**Attached ' + label + ': ' + pendingAttachment.name + '**\n```' + ext + '\n' +
        pendingAttachment.data.slice(0, 15000) +
        (pendingAttachment.data.length > 15000 ? '\n[truncated]' : '') + '\n```';
    }
  } else {
    userContent = text;
  }

  // Frustration injection
  var frustrationCtx = '';
  if (detectFrustration(text, _history)) {
    frustrationCtx = ' The user appears frustrated — acknowledge the friction genuinely before offering a solution.';
  }

  // Build system prompt
  var browseCtx = browseData ? ('\n\n[PAGE CONTENT]\nURL: ' + browseData.url + '\n' + (browseData.summary||'') + '\n[END PAGE CONTENT]') : '';
  var ragCtx = ragData ? buildRAGContext(ragData) : '';
  var rawSystem = buildSystemPrompt(text) + browseCtx + ragCtx + frustrationCtx;
  var systemContent = rawSystem.length > 6000 ? rawSystem.slice(0,6000) + '\n[context truncated]' : rawSystem;

  var histLimit = 12;
  var messages = [{ role:'system', content:systemContent }].concat(
    _history.slice(-histLimit).map(function(m, idx, arr) {
      if (idx === arr.length-1 && m.role === 'user' && typeof userContent !== 'string') {
        return { role:'user', content:userContent };
      }
      var content = typeof m.content === 'string' && m.content.length > 600 ? m.content.slice(0,600) + '...' : m.content;
      return { role:m.role, content };
    })
  );

  var msgResult  = renderMessage('ai', '', true);
  var bubbleEl   = msgResult.bubbleEl;
  var msgRow     = msgResult.msgEl;
  var aiText     = '';
  var thinkBodyEl = null;  // for streaming thought injection

  hide('typing-row');

  try {
    var fetchRes = await fetch(AXION_URL, {
      method: 'POST',
      headers: edgeHeaders(),
      signal: _abortCtrl.signal,
      body: JSON.stringify({
        model:       _settings.model,
        stream:      _settings.streaming,
        max_tokens:  2048,
        messages,
        chat_id:     _currentId,
        user_message: text,
      }),
    });

    if (!fetchRes.ok) {
      var errBody = await fetchRes.text().catch(function(){ return ''; });
      throw new Error('API error ' + fetchRes.status + ': ' + errBody.slice(0,100));
    }

    if (_settings.streaming && fetchRes.body) {
      var reader = fetchRes.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';
      var cursor = document.createElement('span');
      cursor.className = 'cx-cursor';

      while (true) {
        var _ref = await reader.read();
        if (_ref.done) break;
        buffer += decoder.decode(_ref.value, { stream:true });
        var lines = buffer.split('\n');
        buffer = lines.pop();

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              var parsed = JSON.parse(line.slice(6));
              var delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta;
              var chunk = (delta && (delta.content || delta.text)) || '';
              if (!chunk) continue;

              // Route chunk to think or answer
              var parts = parseThoughtChunk(chunk);

              if (parts.think) {
                // Create thought panel on first think chunk
                if (!thinkBodyEl) {
                  thinkBodyEl = createThoughtPanel(bubbleEl);
                  _thoughtEl = thinkBodyEl;
                }
                for (var ci = 0; ci < parts.think.length; ci++) {
                  streamThought(parts.think[ci]);
                }
              }

              if (!_inThoughtBlock && thinkBodyEl) {
                // Thought ended — seal the panel
                closeThoughtPanel(thinkBodyEl);
                thinkBodyEl = null;
              }

              if (parts.answer) {
                aiText += parts.answer;
                bubbleEl.innerHTML = mdToHTML(aiText);
                bubbleEl.appendChild(cursor);
                scrollToBottom();
              }
            } catch(e) { /* skip malformed */ }
          }
        }
      }

      if (cursor.parentNode) cursor.parentNode.removeChild(cursor);

    } else {
      var data = await fetchRes.json();
      var content = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
      // Extract and render thought blocks from non-streaming response
      var thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/i);
      if (thinkMatch) renderThoughtBlock(bubbleEl, thinkMatch[1]);
      aiText = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      bubbleEl.innerHTML = mdToHTML(aiText);
    }

  } catch(err) {
    if (err.name === 'AbortError') {
      if (!aiText) bubbleEl.innerHTML = '<em style="color:var(--text-3)">Response stopped.</em>';
    } else {
      console.error('[CyanixAI] sendMessage error:', err);
      bubbleEl.innerHTML = '<em style="color:var(--red)">Error: ' + esc(err.message || 'Something went wrong.') + '</em>';
    }
  } finally {
    _responding = false;
    setSendBtn('send');
    hide('typing-row');
    scrollToBottom();

    if (aiText) {
      _history.push({ role:'assistant', content:aiText });
      bgSyncMessages(isNewChat, _currentId, text, aiText, msgRow);
      if (/```\w/.test(aiText)) runCodePipeline(bubbleEl, aiText, text).catch(function(){});
    }

    // Append RAG sources if any
    if (ragData && ragData.results && ragData.results.length) {
      appendRAGSources(bubbleEl, ragData);
    }

    await incrementUsage();
  }
}

function buildRAGContext(ragData) {
  if (!ragData) return '';
  var parts = [];
  if (ragData.abstract) parts.push('Summary: ' + ragData.abstract);
  if (ragData.results && ragData.results.length) {
    parts.push('Web results:');
    ragData.results.slice(0,3).forEach(function(r,i) {
      parts.push('[' + (i+1) + '] ' + r.title + ' — ' + r.snippet + ' (' + r.url + ')');
    });
  }
  return parts.length ? '\n\n[WEB SEARCH RESULTS — use for current events only]\n' + parts.join('\n') + '\n[END WEB SEARCH]' : '';
}

async function fetchRAGContext(text) {
  if (!_sb || !_session) return null;
  try {
    var ctrl = new AbortController(); var t = setTimeout(function(){ ctrl.abort(); }, 15000);
    var res = await fetch(RAG_URL, { method:'POST', headers:edgeHeaders(), signal:ctrl.signal, body:JSON.stringify({ query:text }) });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.json();
  } catch(e) { return null; }
}

async function fetchKGContext(text) {
  if (!_sb || !_session) return;
  try {
    var ctrl = new AbortController(); var t = setTimeout(function(){ ctrl.abort(); }, 8000);
    var res = await fetch(KG_URL + '?action=context', { method:'POST', headers:edgeHeaders(), signal:ctrl.signal, body:JSON.stringify({ query:text, user_id:_session.user.id, node_limit:2, memory_limit:4, depth:2 }) });
    clearTimeout(t);
    if (!res.ok) return;
    var data = await res.json();
    if (data.context) _kgContext = data.context;
  } catch(e) {}
}

function appendRAGSources(bubbleEl, ragData) {
  if (!bubbleEl || !ragData || !ragData.results || !ragData.results.length) return;
  var src = document.createElement('div');
  src.className = 'rag-sources';
  ragData.results.slice(0,3).forEach(function(r) {
    var a = document.createElement('a');
    a.className = 'rag-src-chip';
    a.href = r.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.textContent = r.title || r.url;
    src.appendChild(a);
  });
  bubbleEl.appendChild(src);
}

async function bgSyncMessages(isNewChat, localChatId, userText, aiText, msgEl) {
  if (!_sb || !_session) return;
  var chatId = _currentId || localChatId;
  try {
    if (isNewChat) {
      if (_syncPending) { var waited=0; while(_syncPending&&waited<5000){await new Promise(function(r){setTimeout(r,80);}); waited+=80;} chatId=_currentId; }
      else {
        _syncPending = true;
        try {
          var realId = await syncChatToDB(chatId, 'New chat');
          if (realId) { chatId = realId; } else { toast('Could not save chat. Check your connection.'); return; }
        } finally { _syncPending = false; }
      }
    }
    var aiMsgId = await syncMessagesToDB(chatId, userText, aiText);
    if (aiMsgId && msgEl) addFeedbackButtons(msgEl, aiMsgId);
    if (isNewChat && chatId) {
      generateChatTitle(userText, aiText).then(function(title) {
        if (!title) return;
        _chats = _chats.map(function(c){ return c.id===chatId ? Object.assign({},c,{title}) : c; });
        renderChatList();
        if ($('chat-title')) $('chat-title').textContent = title;
        _sb.from('chats').update({ title }).eq('id', chatId).eq('user_id', _session.user.id);
      }).catch(function(){});
    }
    await maybeCollectTraining(userText, aiText);
    extractAndSaveMemories(_history, _currentId).catch(function(){});
    maybeSendPush(aiText).catch(function(){});
    await loadChats();
  } catch(e) {
    _syncPending = false;
    console.error('[CyanixAI] bgSyncMessages failed:', e);
  }
}

async function maybeCollectTraining(userText, aiText) {
  if (!_settings.trainingConsent || !_session) return;
  try {
    await fetch(TRAINING_URL, { method:'POST', headers:edgeHeaders(),
      body:JSON.stringify({ prompt:userText.slice(0,1000), response:aiText.slice(0,3000), model:_settings.model })
    });
  } catch(e) {}
}


/* ══════════════════════════════════════════════════════════
   MEMORY EXTRACTION
══════════════════════════════════════════════════════════ */
async function loadMemories() {
  if (!_sb || !_session) return;
  try {
    var limit = _supporter.memoryPriority ? 500 : 50;
    var res = await _sb.from('user_memories').select('id,memory,category,entity_name,entity_type,related_to,created_at').eq('user_id', _session.user.id).order('updated_at', { ascending:false }).limit(limit);
    if (res.error) { console.error('[CyanixAI] loadMemories:', res.error.message); return; }
    _memories = res.data || [];
    _memoriesLoaded = true;
  } catch(e) {}
}

async function extractAndSaveMemories(messages, sourceId) {
  if (!_sb || !_session || !messages || messages.length < 2) return;
  try {
    var ctx = messages.slice(-10).map(function(m){ return (m.role==='user'?'User: ':'AI: ') + (m.content||'').slice(0,600); }).join('\n');
    var extractPrompt = 'Extract factual memories about the USER from this conversation.\nReturn ONLY a JSON array.\nSchema: [{"memory":"concise fact","category":"personal|preference|project|technical","entity_name":"named subject or null","entity_type":"project|tool|concept|person|null","relates_to":[]}]\nMax 8 items. Return [] if nothing worth saving.\n\nConversation:\n' + ctx;
    var res = await fetch(CHAT_URL, { method:'POST', headers:edgeHeaders(),
      body:JSON.stringify({ model:'meta-llama/llama-4-scout-17b-16e-instruct', stream:false, max_tokens:1000,
        messages:[{ role:'system', content:'Extract structured memories. Return ONLY valid JSON array.' },{ role:'user', content:extractPrompt }] }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return;
    var data = await res.json();
    var raw = (data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content||'').trim();
    if (!raw || raw==='[]') return;
    raw = raw.replace(/```json|```/g,'').trim();
    var aStart=raw.indexOf('['); var aEnd=raw.lastIndexOf(']');
    if (aStart===-1||aEnd===-1) return;
    var items = JSON.parse(raw.slice(aStart,aEnd+1));
    if (!Array.isArray(items)||!items.length) return;
    for (var i=0; i<items.length; i++) {
      var item = items[i];
      if (!item.memory||!item.category) continue;
      var memLower = item.memory.toLowerCase().trim();
      var existing = _memories.find(function(m){ return (m.memory||'').toLowerCase().trim()===memLower; });
      if (existing) {
        await _sb.from('user_memories').update({ memory:item.memory, category:item.category, entity_name:item.entity_name||null, entity_type:item.entity_type||null, updated_at:new Date().toISOString() }).eq('id',existing.id).eq('user_id',_session.user.id);
      } else {
        if (_memories.length >= (_supporter.memoryPriority?500:50)) {
          var oldest = _memories[_memories.length-1];
          if (oldest) await _sb.from('user_memories').delete().eq('id',oldest.id).eq('user_id',_session.user.id);
        }
        await _sb.from('user_memories').insert({ user_id:_session.user.id, memory:item.memory, category:item.category, entity_name:item.entity_name||null, entity_type:item.entity_type||null, related_to:null, source_chat_id:sourceId||_currentId, updated_at:new Date().toISOString() });
      }
    }
    await loadMemories();
  } catch(e) { console.error('[CyanixAI] extractAndSaveMemories:', e); }
}


/* ══════════════════════════════════════════════════════════
   MESSAGE RENDERING
══════════════════════════════════════════════════════════ */
function renderMessage(role, text, isNew, msgId, imageData) {
  var container = $('messages'); if (!container) return { msgEl:null, bubbleEl:null };
  var row = document.createElement('div');
  row.className = 'msg-row' + (role==='user'?' user':'');
  if (msgId) row.dataset.msgId = msgId;

  var avatarHTML = role === 'user' ? '' :
    '<div class="msg-avatar"><svg width="16" height="16" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="12" fill="currentColor" opacity="0.9"/><circle cx="16" cy="16" r="5" fill="var(--bg)"/></svg></div>';

  var contentHTML = '';
  if (imageData) {
    contentHTML = '<img src="data:image/jpeg;base64,' + imageData + '" style="max-width:260px;max-height:200px;border-radius:8px;display:block;margin-bottom:6px" alt=""/>' +
      (text ? '<p style="margin:0">' + esc(text) + '</p>' : '');
  } else if (text) {
    contentHTML = role === 'user' ? esc(text).replace(/\n/g,'<br>') : mdToHTML(text);
  }

  var actionsHTML = role === 'user' ? '' :
    '<div class="msg-meta">' +
      '<span class="msg-ts">' + timeStr() + '</span>' +
      '<div class="msg-actions">' +
        '<button class="msg-action-btn" onclick="window.copyMsg(this)" title="Copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>' +
        '<button class="msg-action-btn msg-tts-btn" onclick="window.toggleMsgTTS(this)" title="Read aloud"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>' +
        '<button class="msg-action-btn fb-up" onclick="window.inlineFeedback(this,1)" title="Good response"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></button>' +
        '<button class="msg-action-btn fb-down" onclick="window.inlineFeedback(this,-1)" title="Bad response"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg></button>' +
      '</div>' +
    '</div>';

  row.innerHTML =
    avatarHTML +
    '<div class="msg-content-wrap" style="flex:1;min-width:0">' +
      '<div class="msg-bubble" data-raw="">' + contentHTML + '</div>' +
      actionsHTML +
    '</div>';

  var bubbleEl = row.querySelector('.msg-bubble');
  if (bubbleEl && text) bubbleEl.dataset.raw = text;
  container.appendChild(row);
  if (isNew) scrollToBottom();
  return { msgEl:row, bubbleEl };
}

function addFeedbackButtons(msgEl, msgId) {
  if (!msgEl || !msgId) return;
  msgEl.dataset.msgId = msgId;
}

window.copyMsg = function(btn) {
  var bubble = btn.closest('.msg-row') && btn.closest('.msg-row').querySelector('.msg-bubble');
  if (!bubble) return;
  navigator.clipboard.writeText(bubble.innerText || '').then(function() { toast('Copied!'); });
};

window.inlineFeedback = function(btn, value) {
  var msgEl = btn.closest('[data-msg-id]');
  var msgId = msgEl && msgEl.dataset.msgId;
  if (!msgId || !_sb || !_session) return;
  var row = btn.closest('.msg-actions');
  if (row) row.querySelectorAll('.fb-up,.fb-down').forEach(function(b){ b.classList.remove('voted'); });
  btn.classList.add('voted');
  _sb.from('message_feedback').upsert({ message_id:msgId, chat_id:_currentId, user_id:_session.user.id, feedback:value }, { onConflict:'message_id,user_id' })
    .then(function(){ toast(value===1 ? 'Thanks!' : 'Got it, we\'ll improve.'); }).catch(function(){});
};


/* ══════════════════════════════════════════════════════════
   TTS
══════════════════════════════════════════════════════════ */
const TTS_URL      = SUPABASE_URL + '/functions/v1/tts';
const CALL_VOICE_ID = 'CwhRBWXzGAHq8TQ4Fs17';
var _audioCtx = null; var _audioCtxUnlocked = false;
var _msgTTSAudio = null; var _msgTTSBtn = null; var _msgTTSLoading = false;

function unlockAudio() {
  if (_audioCtxUnlocked) return;
  try {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var buf = _audioCtx.createBuffer(1,1,22050); var src = _audioCtx.createBufferSource();
    src.buffer = buf; src.connect(_audioCtx.destination); src.start(0);
    if (_audioCtx.state==='suspended') _audioCtx.resume();
    _audioCtxUnlocked = true;
  } catch(e) {}
}

window.toggleMsgTTS = async function(btn) {
  if (_msgTTSAudio) {
    _msgTTSAudio.pause(); _msgTTSAudio = null;
    if (_msgTTSBtn) { _msgTTSBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; _msgTTSBtn.classList.remove('tts-playing','tts-loading'); }
    if (_msgTTSBtn === btn) { _msgTTSBtn = null; return; }
    _msgTTSBtn = null;
  }
  if (_msgTTSLoading) return;
  var bubble = btn.closest('.msg-row') && btn.closest('.msg-row').querySelector('.msg-bubble');
  if (!bubble) return;
  var text = (bubble.innerText||bubble.textContent||'').trim().replace(/```[\s\S]*?```/g,'').replace(/`[^`]+`/g,'').trim();
  if (!text) return;
  _msgTTSBtn = btn; _msgTTSLoading = true;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="cx-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>';
  btn.classList.add('tts-loading');
  try {
    unlockAudio();
    var res = await fetch(TTS_URL, { method:'POST', headers:edgeHeaders(), body:JSON.stringify({ text:text.slice(0,500), voice_id:CALL_VOICE_ID }), signal:AbortSignal.timeout(30000) });
    _msgTTSLoading = false;
    if (!res.ok) { btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; btn.classList.remove('tts-loading'); _msgTTSBtn=null; return; }
    var arrayBuf = await res.arrayBuffer();
    if (!arrayBuf||!arrayBuf.byteLength) { btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; btn.classList.remove('tts-loading'); _msgTTSBtn=null; return; }
    btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
    btn.classList.remove('tts-loading'); btn.classList.add('tts-playing');
    var onDone = function(){ _msgTTSAudio=null; btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>'; btn.classList.remove('tts-playing'); _msgTTSBtn=null; };
    if (_audioCtx&&_audioCtx.state!=='closed') {
      try {
        if (_audioCtx.state==='suspended') await _audioCtx.resume();
        var decoded = await _audioCtx.decodeAudioData(arrayBuf.slice(0));
        var src2 = _audioCtx.createBufferSource(); src2.buffer=decoded; src2.connect(_audioCtx.destination);
        _msgTTSAudio = { _src:src2, pause:function(){ try{src2.stop();}catch(e){} } };
        src2.onended=onDone; src2.start(0); return;
      } catch(e) {}
    }
    var blob = new Blob([arrayBuf],{type:'audio/mpeg'}); var url = URL.createObjectURL(blob);
    _msgTTSAudio = new Audio(url);
    _msgTTSAudio.onended = function(){ URL.revokeObjectURL(url); onDone(); };
    _msgTTSAudio.play().catch(function(){ URL.revokeObjectURL(url); onDone(); });
  } catch(e) {
    _msgTTSLoading=false; _msgTTSBtn=null;
    btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
    btn.classList.remove('tts-playing','tts-loading');
  }
};


/* ══════════════════════════════════════════════════════════
   VOICE INPUT (STT)
══════════════════════════════════════════════════════════ */
async function toggleVoiceInput() {
  if (_sttActive) { stopVoiceInput(); return; }
  try {
    var stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    var mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
    _mediaRec = new MediaRecorder(stream, { mimeType:mime });
    _sttChunks = [];
    _mediaRec.ondataavailable = function(e) { if (e.data.size) _sttChunks.push(e.data); };
    _mediaRec.onstop = async function() {
      stream.getTracks().forEach(function(t){ t.stop(); });
      if (!_sttChunks.length) return;
      var blob = new Blob(_sttChunks, { type:mime });
      var fd = new FormData(); fd.append('audio', blob, 'voice.webm');
      try {
        var res = await fetch(GROQ_STT_URL, { method:'POST', headers:{ Authorization:'Bearer ' + (_session&&_session.access_token||'') }, body:fd, signal:AbortSignal.timeout(30000) });
        if (!res.ok) throw new Error('STT failed');
        var data = await res.json();
        var text = (data.text || '').trim();
        if (text) {
          var inp = $('composer-input');
          if (inp) { inp.value = (inp.value ? inp.value + ' ' : '') + text; inp.style.height='auto'; inp.style.height=Math.min(inp.scrollHeight,220)+'px'; updateSendBtn(); inp.focus(); }
        }
      } catch(e) { toast('Voice input failed.'); }
    };
    _mediaRec.start();
    _sttActive = true;
    var micBtn = $('mic-btn');
    if (micBtn) { micBtn.classList.add('cx-mic-active'); micBtn.innerHTML = '<div class="cx-mic-spectrum"><span></span><span></span><span></span><span></span><span></span></div>'; }
    toast('Listening…');
  } catch(e) {
    toast('Microphone not available: ' + e.message);
  }
}

function stopVoiceInput() {
  _sttActive = false;
  if (_mediaRec && _mediaRec.state !== 'inactive') _mediaRec.stop();
  var micBtn = $('mic-btn');
  if (micBtn) {
    micBtn.classList.remove('cx-mic-active');
    micBtn.innerHTML = '<svg id="mic-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
  }
}


/* ══════════════════════════════════════════════════════════
   NOTIFICATIONS
══════════════════════════════════════════════════════════ */
var _notifPolling = null;

async function loadNotifications() {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('notifications').select('id,title,body,read,created_at').eq('user_id',_session.user.id).order('created_at',{ascending:false}).limit(30);
    if (res.data) {
      _notifications = res.data;
      _notifUnreadCount = res.data.filter(function(n){ return !n.read; }).length;
    }
  } catch(e) {}
}

function startNotifPolling() {
  if (_notifPolling) clearInterval(_notifPolling);
  _notifPolling = setInterval(function(){ loadNotifications().catch(function(){}); }, 5*60*1000);
}

function urlBase64ToUint8Array(base64) {
  var padding = '='.repeat((4 - base64.length % 4) % 4);
  var b64 = (base64+padding).replace(/-/g,'+').replace(/_/g,'/');
  var raw = atob(b64); var arr = new Uint8Array(raw.length);
  for (var i=0;i<raw.length;i++) arr[i]=raw.charCodeAt(i);
  return arr;
}

async function subscribeToPush() {
  if (!('PushManager' in window)) { toast('Push not supported in this browser.'); return false; }
  if (!_session) { toast('Sign in to enable notifications.'); return false; }
  try {
    var reg = await navigator.serviceWorker.ready;
    var existing = await reg.pushManager.getSubscription();
    if (existing) { await savePushSubscription(existing); return true; }
    var sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey:urlBase64ToUint8Array(VAPID_PUBLIC_KEY) });
    await savePushSubscription(sub); toast('Notifications enabled ✓'); return true;
  } catch(e) {
    if (e.name==='NotAllowedError') toast('Notification permission denied.');
    return false;
  }
}

async function savePushSubscription(sub) {
  if (!_sb||!_session) return;
  try {
    var subJson = sub.toJSON();
    await _sb.from('push_subscriptions').upsert({ user_id:_session.user.id, endpoint:subJson.endpoint, subscription:subJson, updated_at:new Date().toISOString() }, { onConflict:'user_id,endpoint' });
  } catch(e) {}
}

async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;
  try {
    var reg = await navigator.serviceWorker.ready; var sub = await reg.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      if (_sb&&_session) await _sb.from('push_subscriptions').delete().eq('user_id',_session.user.id).eq('endpoint',sub.endpoint);
      toast('Notifications disabled');
    }
  } catch(e) {}
}

async function isPushSubscribed() {
  if (!('serviceWorker' in navigator)||!('PushManager' in window)) return false;
  try { var reg = await navigator.serviceWorker.ready; var sub = await reg.pushManager.getSubscription(); return !!sub; } catch(e) { return false; }
}

async function maybeSendPush(aiText) {
  if (!_session||!document.hidden||!('PushManager' in window)) return;
  if (!await isPushSubscribed()) return;
  var preview = (aiText||'').replace(/```[\s\S]*?```/g,'[code]').replace(/[#*`]/g,'').trim().slice(0,100);
  try { await fetch(PUSH_URL, { method:'POST', headers:edgeHeaders(), body:JSON.stringify({ user_id:_session.user.id, title:'Cyanix AI', body:preview||'Your response is ready', url:window.location.href }) }); } catch(e) {}
}

function updateNotifUI(subscribed) {
  var tog = $('notif-toggle'); var desc = $('notif-status-desc');
  var testRow = $('notif-test-row'); var testDiv = $('notif-test-divider');
  if (tog) tog.checked = subscribed;
  if (desc) desc.textContent = subscribed ? 'Notifications enabled ✓' : 'Get notified when Cyanix responds';
  if (testRow) testRow.style.display = subscribed ? 'flex' : 'none';
  if (testDiv) testDiv.style.display = subscribed ? 'block' : 'none';
}

window.subscribeToPush   = subscribeToPush;
window.unsubscribeFromPush = unsubscribeFromPush;
window.isPushSubscribed  = isPushSubscribed;


/* ══════════════════════════════════════════════════════════
   REALTIME
══════════════════════════════════════════════════════════ */
var _realtimeChannel = null;

function startRealtime() {
  if (!_sb || !_session || _realtimeChannel) return;
  _realtimeChannel = _sb.channel('cyanix-live-' + _session.user.id)
    .on('postgres_changes', { event:'INSERT', schema:'public', table:'notifications', filter:'user_id=eq.' + _session.user.id }, function(payload) {
      var n = payload.new; if (!n) return;
      _notifications.unshift(n); _notifUnreadCount++;
    })
    .subscribe(function(status) { console.log('[CyanixAI] Realtime:', status); });
}

function stopRealtime() {
  if (_realtimeChannel) { _sb.removeChannel(_realtimeChannel); _realtimeChannel = null; }
}


/* ══════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════ */
async function uploadAvatar(file) {
  if (!_sb || !_session) return null;
  if (file.size > 2*1024*1024) { toast('Image must be under 2MB.'); return null; }
  if (!file.type.startsWith('image/')) { toast('Please upload an image file.'); return null; }
  var ext = file.name.split('.').pop() || 'jpg';
  var path = _session.user.id + '/avatar.' + ext;
  try {
    toast('Uploading…');
    await _sb.storage.from('avatars').remove([_session.user.id + '/avatar.jpg']).catch(function(){});
    var { data, error } = await _sb.storage.from('avatars').upload(path, file, { upsert:true, contentType:file.type });
    if (error) { toast('Upload failed: ' + error.message); return null; }
    var { data:urlData } = _sb.storage.from('avatars').getPublicUrl(path);
    var publicUrl = urlData.publicUrl + '?t=' + Date.now();
    await _sb.from('user_preferences').upsert({ user_id:_session.user.id, avatar_url:publicUrl }, { onConflict:'user_id' });
    updateAvatarUI(publicUrl); toast('Profile picture updated!'); return publicUrl;
  } catch(e) { toast('Upload error: ' + e.message); return null; }
}

function updateAvatarUI(url) {
  document.querySelectorAll('.user-avatar, #user-avatar, .stg-avatar-img, .sb-avatar, .um-avatar, #stg-avatar-el').forEach(function(el) {
    if (el.tagName === 'IMG') { el.src = url; }
    else {
      el.style.backgroundImage = 'url(' + url + ')';
      el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center';
      el.textContent = '';
    }
  });
}

async function loadAvatarFromStorage() {
  if (!_sb || !_session) return;
  try {
    var res = await _sb.from('user_preferences').select('avatar_url').eq('user_id', _session.user.id).single();
    if (res.data && res.data.avatar_url) updateAvatarUI(res.data.avatar_url);
  } catch(e) {}
}

window.addEventListener('cyanix:ready', function() {
  var avatarUploadEl = $('stg-avatar-upload');
  if (avatarUploadEl) avatarUploadEl.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    if (file) uploadAvatar(file);
  });
  var avatarTapEl = $('stg-avatar-tap');
  if (avatarTapEl) avatarTapEl.addEventListener('click', function() {
    var inp = $('stg-avatar-upload'); if (inp) inp.click();
  });
  var signoutMenuBtn = $('signout-btn-menu');
  if (signoutMenuBtn) signoutMenuBtn.addEventListener('click', function(){ closeUserMenu(); signOut(); });
});


/* ══════════════════════════════════════════════════════════
   WELCOME SCREEN
══════════════════════════════════════════════════════════ */
function renderWelcome() {
  var h = new Date().getHours();
  var greeting = h >= 5 && h < 12 ? 'Good morning.' : h >= 12 && h < 17 ? 'Good afternoon.' : h >= 17 && h < 21 ? 'Good evening.' : 'Good night.';
  var hEl = $('welcome-heading'); var sEl = $('welcome-sub');
  if (hEl) hEl.textContent = greeting;
  if (sEl) sEl.textContent = 'What shall we work on?';
  var cards = $('welcome-cards'); if (!cards) return;
  cards.innerHTML = WELCOME_CARDS.map(function(c) {
    return '<button class="welcome-card" data-prompt="' + esc(c.prompt) + '">' +
      '<span class="wc-icon">' + c.icon + '</span>' +
      '<div class="wc-title">' + esc(c.title) + '</div>' +
      '<div class="wc-sub">' + esc(c.sub) + '</div>' +
    '</button>';
  }).join('');
  cards.querySelectorAll('.welcome-card').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var inp = $('composer-input');
      if (inp) { inp.value = btn.dataset.prompt; inp.focus(); inp.style.height='auto'; inp.style.height=Math.min(inp.scrollHeight,220)+'px'; updateSendBtn(); }
    });
  });
}


/* ══════════════════════════════════════════════════════════
   SHARE
══════════════════════════════════════════════════════════ */
async function shareCurrentChat() {
  if (!_session) { toast('Sign in to share.'); return; }
  if (!_currentId || !_history.length) { toast('Start a conversation first.'); return; }
  try {
    var chat = _chats.find(function(c){ return c.id===_currentId; });
    var title = (chat&&chat.title) || 'Shared Conversation';
    var snapshot = _history.map(function(m){ return { role:m.role, content:typeof m.content==='string'?m.content:'[attachment]' }; });
    var existing = await _sb.from('shared_chats').select('id').eq('chat_id',_currentId).eq('user_id',_session.user.id).maybeSingle();
    var shareId;
    if (existing.data && existing.data.id) {
      await _sb.from('shared_chats').update({ messages:snapshot, title, updated_at:new Date().toISOString() }).eq('id',existing.data.id);
      shareId = existing.data.id;
    } else {
      var insertRes = await _sb.from('shared_chats').insert({ chat_id:_currentId, user_id:_session.user.id, title, messages:snapshot, created_at:new Date().toISOString() }).select('id').single();
      shareId = insertRes.data && insertRes.data.id;
    }
    if (!shareId) { toast('Could not create share link.'); return; }
    var shareUrl = window.location.origin + window.location.pathname + 'share.html?id=' + shareId;
    if (navigator.share) {
      await navigator.share({ title:'Cyanix AI — ' + title, url:shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl).catch(function(){});
      toast('Share link copied! 🔗');
    }
  } catch(e) { if (e && e.name !== 'AbortError') toast('Could not share chat.'); }
}


/* ══════════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════════ */
function clearMessages() {
  var m = $('messages');
  if (m) m.querySelectorAll('.msg-row').forEach(function(el){ el.remove(); });
}

function scrollToBottom() {
  var s = $('chat-scroll'); if (s) s.scrollTop = s.scrollHeight;
}

function haptic(pattern) { if (navigator.vibrate) navigator.vibrate(pattern || 10); }

function attachRipple(el) {
  if (!el || el._hasRipple) return;
  el._hasRipple = true;
  el.style.position = el.style.position || 'relative';
  el.style.overflow = 'hidden';
  el.addEventListener('pointerdown', function(e) {
    var r = document.createElement('span');
    r.className = 'cx-ripple';
    var rect = el.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = 'position:absolute;border-radius:50%;pointer-events:none;width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;background:rgba(255,255,255,.12);transform:scale(0);animation:cx-ripple-anim .5s ease both;';
    el.appendChild(r);
    setTimeout(function(){ if(r.parentNode) r.parentNode.removeChild(r); }, 550);
  });
}

function attachAllRipples() {
  document.querySelectorAll('.auth-submit-btn,.auth-oauth-btn,.send-btn,.foot-btn,.sb-new-btn,.topbar-btn,.sb-nav-btn,.welcome-card').forEach(attachRipple);
}

// Ripple animation styles (injected once)
(function() {
  if (document.getElementById('cx-ripple-style')) return;
  var s = document.createElement('style');
  s.id = 'cx-ripple-style';
  s.textContent = '@keyframes cx-ripple-anim { to { transform:scale(1); opacity:0; } }';
  document.head.appendChild(s);
})();
