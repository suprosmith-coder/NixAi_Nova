/* ═══════════════════════════════════════════════════════════
   CYANIX AI — app.js
   Single unified AI app. Supabase edge functions handle AI.
   No API keys in frontend.
═══════════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG ────────────────────────────────────────────────
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const SEARCH_URL    = `${SUPABASE_URL}/functions/v1/search`;
const REDIRECT_URL  = (() => { const u = window.location.href; return u.split('?')[0].split('#')[0]; })();

const EDGE_HEADERS = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'apikey':        SUPABASE_ANON,
};

// ── CLUSTER DATA ──────────────────────────────────────────
const CLUSTERS = [
  { id:'ai',       label:'AI Tools',     color:'#00f5ff', x:.03,  y:.22,  z:-.15,
    sites:[{n:'ChatGPT',u:'https://chat.openai.com',l:1},{n:'Claude',u:'https://claude.ai',l:1},{n:'Gemini',u:'https://gemini.google.com',l:1},{n:'Cyanix AI',u:'#',l:1},{n:'Perplexity',u:'https://perplexity.ai',l:1},{n:'Midjourney',u:'https://midjourney.com',l:2},{n:'Runway',u:'https://runwayml.com',l:2},{n:'ElevenLabs',u:'https://elevenlabs.io',l:2},{n:'Cursor',u:'https://cursor.sh',l:2}]},
  { id:'social',   label:'Social Media', color:'#ff6b6b', x:-.28, y:.09,  z:.12,
    sites:[{n:'Twitter/X',u:'https://x.com',l:1},{n:'Instagram',u:'https://instagram.com',l:1},{n:'TikTok',u:'https://tiktok.com',l:1},{n:'Reddit',u:'https://reddit.com',l:1},{n:'Facebook',u:'https://facebook.com',l:1},{n:'LinkedIn',u:'https://linkedin.com',l:1},{n:'Discord',u:'https://discord.com',l:2},{n:'Snapchat',u:'https://snapchat.com',l:2},{n:'Threads',u:'https://threads.net',l:2},{n:'Mastodon',u:'https://mastodon.social',l:3}]},
  { id:'gaming',   label:'Gaming',       color:'#a855f7', x:.30,  y:-.05, z:.04,
    sites:[{n:'Steam',u:'https://store.steampowered.com',l:1},{n:'Twitch',u:'https://twitch.tv',l:1},{n:'Epic Games',u:'https://epicgames.com',l:1},{n:'Roblox',u:'https://roblox.com',l:1},{n:'Xbox',u:'https://xbox.com',l:2},{n:'PlayStation',u:'https://playstation.com',l:2},{n:'GOG',u:'https://gog.com',l:2},{n:'itch.io',u:'https://itch.io',l:3}]},
  { id:'news',     label:'News',         color:'#f59e0b', x:-.08, y:-.26, z:.10,
    sites:[{n:'BBC',u:'https://bbc.com',l:1},{n:'Reuters',u:'https://reuters.com',l:1},{n:'The Verge',u:'https://theverge.com',l:1},{n:'TechCrunch',u:'https://techcrunch.com',l:1},{n:'Wired',u:'https://wired.com',l:2},{n:'Hacker News',u:'https://news.ycombinator.com',l:2},{n:'Bloomberg',u:'https://bloomberg.com',l:2}]},
  { id:'startups', label:'Startups',     color:'#10b981', x:-.22, y:.18,  z:-.09,
    sites:[{n:'Y Combinator',u:'https://ycombinator.com',l:1},{n:'Vercel',u:'https://vercel.com',l:1},{n:'Supabase',u:'https://supabase.com',l:1},{n:'Figma',u:'https://figma.com',l:1},{n:'Notion',u:'https://notion.so',l:2},{n:'Linear',u:'https://linear.app',l:2},{n:'Product Hunt',u:'https://producthunt.com',l:2}]},
  { id:'education',label:'Education',    color:'#3b82f6', x:.14,  y:-.32, z:-.07,
    sites:[{n:'Khan Academy',u:'https://khanacademy.org',l:1},{n:'Wikipedia',u:'https://wikipedia.org',l:1},{n:'YouTube',u:'https://youtube.com',l:1},{n:'Coursera',u:'https://coursera.org',l:2},{n:'Duolingo',u:'https://duolingo.com',l:2},{n:'Codecademy',u:'https://codecademy.com',l:2}]},
  { id:'ecommerce',label:'E-Commerce',   color:'#f97316', x:-.36, y:-.14, z:-.04,
    sites:[{n:'Amazon',u:'https://amazon.com',l:1},{n:'Shopify',u:'https://shopify.com',l:1},{n:'Etsy',u:'https://etsy.com',l:1},{n:'eBay',u:'https://ebay.com',l:2},{n:'Stripe',u:'https://stripe.com',l:2},{n:'Gumroad',u:'https://gumroad.com',l:3}]},
  { id:'darkweb',  label:'Dark Web',     color:'#475569', x:.20,  y:.28,  z:.18,
    sites:[{n:'[REDACTED]',u:'#',l:4},{n:'[UNKNOWN]',u:'#',l:4},{n:'[ENCRYPTED]',u:'#',l:4}]},
];

const CAT_COLORS = {
  ai:'#00f5ff', social:'#ff6b6b', gaming:'#a855f7', news:'#f59e0b',
  startups:'#10b981', education:'#3b82f6', ecommerce:'#f97316',
  darkweb:'#475569', other:'#94a3b8',
};

const SITE_DESCS = {
  'ChatGPT':"OpenAI's AI chatbot — the one that started the wave.",
  'Claude':"Anthropic's AI assistant, known for safety and long context.",
  'Cyanix AI':"You're here — AI-powered internet search.",
  'Twitter/X':'Real-time social network for news and viral moments.',
  'Instagram':'Photo and video sharing — 2 billion monthly users.',
  'TikTok':'Short-form video, the most downloaded app on the planet.',
  'Reddit':'Massive forums for every topic imaginable.',
  'Steam':"Valve's PC gaming platform with 50,000+ games.",
  'YouTube':"Google's video platform. 500 hours uploaded every minute.",
  'Wikipedia':'Free encyclopedia written by millions of volunteers.',
  'Amazon':"The world's largest e-commerce platform.",
  'Supabase':'Open-source Firebase alternative built on Postgres.',
  'Vercel':'Frontend deployment — zero config, instant global.',
  'BBC':'UK public broadcaster delivering global news.',
  '[REDACTED]':'ACCESS DENIED.', '[UNKNOWN]':'ORIGIN UNVERIFIED.', '[ENCRYPTED]':'DECRYPTION KEY REQUIRED.',
};

// ── HELPERS ───────────────────────────────────────────────
const el      = id  => document.getElementById(id);
const show    = (id, d='block') => { const e = el(id); if (e) e.style.display = d; };
const hide    = id  => { const e = el(id); if (e) e.style.display = 'none'; };
const on      = (id, ev, fn) => { const e = el(id); if (e) e.addEventListener(ev, fn); };
const setText = (id, t)  => { const e = el(id); if (e) e.textContent = t; };
const showErr = (id, m)  => { const e = el(id); if (!e) return; e.textContent = m; e.style.display = 'block'; };
const esc     = s    => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── STATE ─────────────────────────────────────────────────
let _sb          = null;
let _session     = null;
let _chatHistory = [];
let _responding  = false;
let _activeLayer = 1;

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  initGalaxy();
  animCounter('counter', 1847293, 2400);
  renderWelcome();
  bindAll();
});

/* ══════════════════════════════════════════════════════════
   VIEW SWITCHING
══════════════════════════════════════════════════════════ */
function showLanding() {
  show('view-landing');
  el('view-chat').style.display = 'none';
}

function showChat() {
  el('view-landing').style.display = 'none';
  show('view-chat');
  setTimeout(() => el('chat-input')?.focus(), 100);
}

/* ══════════════════════════════════════════════════════════
   BIND ALL EVENTS
══════════════════════════════════════════════════════════ */
function bindAll() {
  // Landing buttons
  on('enter-chat-btn',  'click', showChat);
  on('explore-map-btn', 'click', () => { /* already on galaxy */ });
  on('lnd-signin-btn',  'click', showAuthModal);

  // Chat header buttons
  on('back-btn',          'click', showLanding);
  on('chat-signin-btn',   'click', showAuthModal);
  on('clear-btn',         'click', clearChat);
  on('galaxy-btn',        'click', showLanding);
  on('sidebar-galaxy-btn','click', showLanding);

  // Auth modal
  on('auth-close',    'click', hideAuthModal);
  on('auth-overlay',  'click', e => { if (e.target === el('auth-overlay')) hideAuthModal(); });

  // Auth tabs
  document.querySelectorAll('.atab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.aform').forEach(f => f.style.display = 'none');
      const form = el('tab-' + tab.dataset.tab);
      if (form) form.style.display = 'flex';
    });
  });

  // OAuth
  on('ob-google',  'click', () => oauthLogin('google'));
  on('ob-github',  'click', () => oauthLogin('github'));
  on('ob-discord', 'click', () => oauthLogin('discord'));

  // Email auth
  on('si-btn',  'click',   emailSignIn);
  on('su-btn',  'click',   emailSignUp);
  on('si-pass', 'keydown', e => { if (e.key === 'Enter') emailSignIn(); });
  on('su-conf', 'keydown', e => { if (e.key === 'Enter') emailSignUp(); });

  // Layer / depth buttons (galaxy)
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeLayer = parseInt(btn.dataset.layer, 10);
      document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyLayerFilter();
    });
  });

  // Chat input
  const input   = el('chat-input');
  const sendBtn = el('send-btn');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input.value); }
    });
    input.addEventListener('input', () => resizeTA(input));
  }
  on('send-btn', 'click', () => { if (input) sendMessage(input.value); });
}

/* ══════════════════════════════════════════════════════════
   SUPABASE AUTH
══════════════════════════════════════════════════════════ */
function initSupabase() {
  try {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    _sb.auth.onAuthStateChange((_ev, session) => {
      _session = session;
      if (session) onSignedIn(session.user);
      else          onSignedOut();
    });
    _sb.auth.getSession().then(({ data }) => {
      if (data?.session) { _session = data.session; onSignedIn(data.session.user); }
    });
  } catch (err) {
    console.warn('Supabase init failed — auth unavailable:', err);
  }
}

function onSignedIn(user) {
  hideAuthModal();
  const label = user.email || user.user_metadata?.name || user.user_metadata?.full_name || 'Explorer';
  const pill = el('user-pill');
  if (pill) { pill.textContent = label; pill.style.display = 'block'; }
  hide('lnd-signin-btn'); hide('chat-signin-btn');
}
function onSignedOut() {
  hide('user-pill');
  show('lnd-signin-btn', 'block'); show('chat-signin-btn', 'block');
}

function showAuthModal() { show('auth-overlay', 'flex'); }
function hideAuthModal() { hide('auth-overlay'); }

async function oauthLogin(provider) {
  if (!_sb) { alert('Auth unavailable — check your internet connection.'); return; }
  const btn = el('ob-' + provider);
  if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }
  try {
    await _sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_URL } });
  } catch (err) {
    if (btn) { btn.disabled = false; }
    alert('Login failed: ' + err.message);
  }
}

async function emailSignIn() {
  if (!_sb) { showErr('si-err', 'Auth service unavailable.'); return; }
  const email = el('si-email')?.value.trim();
  const pass  = el('si-pass')?.value;
  hide('si-err');
  if (!email || !pass) { showErr('si-err', 'Please fill in all fields.'); return; }
  const btn = el('si-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
  const { error } = await _sb.auth.signInWithPassword({ email, password: pass });
  if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
  if (error) showErr('si-err', error.message);
}

async function emailSignUp() {
  if (!_sb) { showErr('su-err', 'Auth service unavailable.'); return; }
  const email = el('su-email')?.value.trim();
  const pass  = el('su-pass')?.value;
  const conf  = el('su-conf')?.value;
  hide('su-err'); hide('su-ok');
  if (!email || !pass || !conf) { showErr('su-err', 'Please fill in all fields.'); return; }
  if (pass !== conf)    { showErr('su-err', 'Passwords do not match.'); return; }
  if (pass.length < 6) { showErr('su-err', 'Password must be at least 6 characters.'); return; }
  const btn = el('su-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
  const { error } = await _sb.auth.signUp({ email, password: pass });
  if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  if (error) {
    showErr('su-err', error.message);
  } else {
    const ok = el('su-ok');
    if (ok) { ok.textContent = '✓ Check your email to confirm your account.'; ok.style.display = 'block'; }
  }
}

/* ══════════════════════════════════════════════════════════
   3D GALAXY (Three.js)
══════════════════════════════════════════════════════════ */
let _gx          = {};
let _interactable = [];
let _sph         = { theta: .4, phi: 1.2, r: 5.5 };
let _tSph        = { ..._sph };
let _autoRot     = true;
let _isDragging  = false;
let _dragMoved   = false;
let _prevMouse   = { x:0, y:0 };
let _mouse3      = null;
let _hovered     = null;
let _locked      = null;
let _rafGalaxy   = null;

function initGalaxy() {
  const canvas = el('galaxy-canvas');
  if (!canvas || typeof THREE === 'undefined') { console.warn('Galaxy: THREE not available'); return; }

  _mouse3 = new THREE.Vector2();

  const rect = canvas.getBoundingClientRect();
  const W = rect.width  || window.innerWidth;
  const H = rect.height || window.innerHeight;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.01, 200);
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch (e) { console.warn('WebGL unavailable:', e); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x04060f, 1);

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.08;

  _gx = { scene, camera, renderer, raycaster };

  buildBgStars(scene);
  buildClusters(scene);
  buildLegend();
  bindGalaxyEvents(canvas, renderer, camera, raycaster);
  galaxyLoop(renderer, scene, camera, raycaster);

  window.addEventListener('resize', () => {
    // Only resize when landing is visible
    if (el('view-landing').style.display === 'none') return;
    const nW = window.innerWidth, nH = window.innerHeight;
    camera.aspect = nW / nH;
    camera.updateProjectionMatrix();
    renderer.setSize(nW, nH);
  });
}

function glowTex(color, size = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0,    color);
  g.addColorStop(.35,  color + '88');
  g.addColorStop(.7,   color + '22');
  g.addColorStop(1,    'transparent');
  ctx.fillStyle = g; ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function buildBgStars(scene) {
  const N = 6000;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    const r = 25 + Math.random() * 55;
    pos[i*3]   = r * Math.sin(p) * Math.cos(t);
    pos[i*3+1] = r * Math.sin(p) * Math.sin(t);
    pos[i*3+2] = r * Math.cos(p);
    const b = .4 + Math.random() * .6;
    col[i*3] = b; col[i*3+1] = b; col[i*3+2] = Math.min(1, b + .25);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    size: .055, vertexColors: true, transparent: true, opacity: .7,
    map: glowTex('#ffffff', 32), blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  stars.userData.isBg = true;
  scene.add(stars);
}

function buildClusters(scene) {
  _interactable = [];
  CLUSTERS.forEach(cl => {
    const group = new THREE.Group();
    group.position.set(cl.x * 14, cl.y * 14, cl.z * 14);
    group.userData.clusterId = cl.id;

    // Cluster center glow
    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0]), 3));
    group.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
      size: .3, map: glowTex(cl.color, 128), transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })));

    // Cluster halo
    group.add(new THREE.Mesh(
      new THREE.SphereGeometry(.6, 16, 16),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(cl.color), transparent: true, opacity: .04,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.BackSide,
      })
    ));

    // Site nodes
    cl.sites.forEach(site => {
      const ang  = Math.random() * Math.PI * 2;
      const incl = (Math.random() - .5) * Math.PI * .55;
      const d    = .2 + Math.random() * .5;
      const sx   = d * Math.cos(ang) * Math.cos(incl);
      const sy   = d * Math.sin(incl);
      const sz   = d * Math.sin(ang) * Math.cos(incl);

      const sGeo = new THREE.BufferGeometry();
      sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([sx, sy, sz]), 3));

      const sz2 = site.l === 1 ? .11 : site.l === 2 ? .07 : .05;
      const op  = site.l === 1 ? .92 : site.l === 2 ? .62 : .35;

      const pt = new THREE.Points(sGeo, new THREE.PointsMaterial({
        size: sz2, map: glowTex(cl.color, 64), transparent: true, opacity: op,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      pt.userData = { cluster: cl, site, layer: site.l };
      group.add(pt);
      _interactable.push({ mesh: pt, cluster: cl, site });
    });

    scene.add(group);
  });
}

function buildLegend() {
  const wrap = el('legend-items');
  if (!wrap) return;
  wrap.innerHTML = '';
  CLUSTERS.forEach(cl => {
    const div = document.createElement('div');
    div.className = 'leg-item';
    div.innerHTML = `<span class="leg-dot" style="background:${cl.color};box-shadow:0 0 5px ${cl.color}66"></span>${cl.label}`;
    div.addEventListener('click', () => {
      const g = _gx.scene?.children.find(c => c.userData.clusterId === cl.id);
      if (g) {
        const p = g.position.clone().normalize();
        _tSph.theta = Math.atan2(p.x, p.z);
        _tSph.phi   = Math.acos(Math.max(-1, Math.min(1, p.y)));
        _tSph.r     = 3;
        _autoRot    = false;
        setTimeout(() => { _autoRot = true; }, 4000);
      }
    });
    wrap.appendChild(div);
  });
}

function applyLayerFilter() {
  _interactable.forEach(({ mesh }) => {
    mesh.visible = mesh.userData.layer <= _activeLayer;
  });
}

function camUpdate(camera) {
  const { theta, phi, r } = _sph;
  camera.position.set(
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.cos(theta)
  );
  camera.lookAt(0, 0, 0);
}

function galaxyLoop(renderer, scene, camera, raycaster) {
  let t = 0;
  function frame() {
    _rafGalaxy = requestAnimationFrame(frame);
    t += 0.003;

    if (_autoRot) { _tSph.theta += 0.0015; }

    _sph.theta += (_tSph.theta - _sph.theta) * 0.07;
    _sph.phi   += (_tSph.phi   - _sph.phi)   * 0.07;
    _sph.r     += (_tSph.r     - _sph.r)      * 0.07;

    camUpdate(camera);

    // Hover detection (desktop)
    if (_mouse3 && !_isDragging) {
      raycaster.setFromCamera(_mouse3, camera);
      let hit = null;
      for (const p of _interactable) {
        if (!p.mesh.visible) continue;
        if (raycaster.intersectObject(p.mesh).length > 0) { hit = p; break; }
      }
      if (hit !== _hovered) {
        _hovered = hit;
        const canvas = renderer.domElement;
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        const tt = el('tooltip');
        if (hit && tt) {
          tt.style.display = 'block';
          setText('tt-cluster', hit.cluster.label.toUpperCase());
          setText('tt-name',    hit.site.n);
          setText('tt-url',     hit.site.u === '#' ? '—' : hit.site.u.replace('https://',''));
        } else if (tt) { tt.style.display = 'none'; }
      }
    }

    // Rotate bg stars
    const bg = scene.children.find(c => c.userData.isBg);
    if (bg) bg.rotation.y = t * 0.04;

    renderer.render(scene, camera);
  }
  frame();
}

function bindGalaxyEvents(canvas, renderer, camera, raycaster) {
  // Mouse drag
  canvas.addEventListener('mousedown', e => {
    _isDragging = true; _autoRot = false; _dragMoved = false;
    _prevMouse = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('mouseup', () => {
    _isDragging = false; _autoRot = true;
  });
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    if (_mouse3) {
      _mouse3.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      _mouse3.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    }
    // Tooltip position
    const tt = el('tooltip');
    if (tt && tt.style.display !== 'none') {
      tt.style.left = (e.clientX + 14) + 'px';
      tt.style.top  = (e.clientY - 10) + 'px';
    }
    if (_isDragging) {
      const dx = e.clientX - _prevMouse.x;
      const dy = e.clientY - _prevMouse.y;
      if (Math.hypot(dx, dy) > 3) _dragMoved = true;
      _tSph.theta -= dx * 0.005;
      _tSph.phi = Math.max(.12, Math.min(Math.PI - .12, _tSph.phi + dy * 0.005));
      _prevMouse = { x: e.clientX, y: e.clientY };
    }
  });

  // Scroll zoom
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    _tSph.r = Math.max(1.8, Math.min(14, _tSph.r + e.deltaY * 0.006));
  }, { passive: false });

  // Click: lock-on panel
  canvas.addEventListener('click', e => {
    if (_dragMoved) return;
    const rect = canvas.getBoundingClientRect();
    const v = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(v, camera);
    let hit = null;
    for (const p of _interactable) {
      if (!p.mesh.visible) continue;
      if (raycaster.intersectObject(p.mesh).length > 0) { hit = p; break; }
    }
    if (hit) showLockon(hit, e.clientX, e.clientY);
    else     hideLockon();
  });

  // Touch support
  let _lastTouch = null;
  let _touchDist  = null;
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    _autoRot = false; _dragMoved = false;
    if (e.touches.length === 1) {
      _isDragging = true;
      _lastTouch  = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      _prevMouse  = { ..._lastTouch };
    } else if (e.touches.length === 2) {
      _isDragging = false;
      _touchDist  = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (e.touches.length === 1 && _isDragging) {
      const dx = e.touches[0].clientX - _prevMouse.x;
      const dy = e.touches[0].clientY - _prevMouse.y;
      if (Math.hypot(dx, dy) > 3) _dragMoved = true;
      _tSph.theta -= dx * 0.006;
      _tSph.phi = Math.max(.12, Math.min(Math.PI - .12, _tSph.phi + dy * 0.006));
      _prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && _touchDist !== null) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      _tSph.r = Math.max(1.8, Math.min(14, _tSph.r - (newDist - _touchDist) * 0.015));
      _touchDist = newDist;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    _isDragging = false;
    _touchDist  = null;
    if (!_dragMoved && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const rect  = canvas.getBoundingClientRect();
      const v = new THREE.Vector2(
        ((touch.clientX - rect.left) / rect.width)  * 2 - 1,
        -((touch.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(v, camera);
      for (const p of _interactable) {
        if (!p.mesh.visible) continue;
        if (raycaster.intersectObject(p.mesh).length > 0) {
          showLockon(p, touch.clientX, touch.clientY);
          break;
        }
      }
    }
    setTimeout(() => { _autoRot = true; }, 2000);
  }, { passive: false });
}

function showLockon(hit, cx, cy) {
  _locked = hit;
  const panel  = el('lockon-panel');
  if (!panel) return;

  const safe = { x: Math.min(Math.max(cx, 160), window.innerWidth  - 160) };
  const safeY =  Math.min(Math.max(cy, 120),     window.innerHeight - 120);

  panel.style.left    = safe.x + 'px';
  panel.style.top     = safeY  + 'px';
  panel.style.display = 'block';

  const cl = hit.cluster;
  setText('lo-cluster', cl.label.toUpperCase());
  setText('lo-name',    hit.site.n);
  setText('lo-url',     hit.site.u === '#' ? '—' : hit.site.u.replace('https://',''));
  setText('lo-desc',    SITE_DESCS[hit.site.n] || '');

  const ring = el('lo-ring');
  const dot  = el('lo-dot');
  if (ring) ring.style.borderColor = cl.color + '88';
  if (dot)  dot.style.background   = cl.color;

  const launch = el('lo-launch');
  if (launch) {
    if (hit.site.u && hit.site.u !== '#') {
      launch.style.display = 'inline-block';
      launch.onclick = () => window.open(hit.site.u, '_blank', 'noopener');
    } else {
      launch.style.display = 'none';
    }
  }
}
function hideLockon() {
  _locked = null;
  hide('lockon-panel');
  const tt = el('tooltip');
  if (tt) tt.style.display = 'none';
}

/* ══════════════════════════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════════════════════════ */
function animCounter(id, target, ms) {
  const e = el(id);
  if (!e) return;
  const step = target / (ms / 16);
  let v = 0;
  const t = setInterval(() => {
    v = Math.min(v + step, target);
    e.textContent = Math.floor(v).toLocaleString();
    if (v >= target) clearInterval(t);
  }, 16);
}

/* ══════════════════════════════════════════════════════════
   CYANIX CHAT — CORE
══════════════════════════════════════════════════════════ */
function resizeTA(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
}

function scrollDown() {
  const m = el('messages');
  if (m) m.scrollTop = m.scrollHeight;
}

function setTyping(on, label) {
  const row = el('typing');
  const lbl = el('typing-label');
  if (!row) return;
  row.classList.toggle('hidden', !on);
  if (lbl && label) lbl.textContent = label;
  if (on) scrollDown();
}

function setCsStatus(scanning) {
  const s = el('cs-status');
  if (!s) return;
  s.innerHTML = '<span class="cs-dot"></span> ' + (scanning ? 'Searching...' : 'Web Search Ready');
  s.classList.toggle('scanning', scanning);
}

function wantsSearch(text) {
  const t = text.toLowerCase();
  const triggers = ['find','search','show me','what are','list','best','top','where','latest','who is','how to','compare','vs','tool','resource','website','link'];
  return triggers.some(kw => t.includes(kw));
}

async function sendMessage(text) {
  if (!text.trim() || _responding) return;
  _responding = true;
  const input   = el('chat-input');
  const sendBtn = el('send-btn');
  if (input)   { input.value = ''; resizeTA(input); }
  if (sendBtn) sendBtn.disabled = true;
  appendMsg('user', text);
  scrollDown();

  try {
    let csData = null;
    if (wantsSearch(text)) {
      setTyping(true, 'Searching the web...');
      setCsStatus(true);
      csData = await fetchSearch(text);
      setCsStatus(false);
    }
    setTyping(true, 'Thinking...');
    const result = await fetchChat(text, csData);
    const reply  = result.reply || result.answer || result.text || '(no response)';
    const nodes  = result.nodes || csData?.nodes || [];

    _chatHistory.push({ role: 'user',      content: text });
    _chatHistory.push({ role: 'assistant', content: reply });
    if (_chatHistory.length > 40) _chatHistory = _chatHistory.slice(-40);

    if (nodes.length) updateSidebar(nodes);
    setTyping(false);
    appendMsg('ai', reply, nodes.length ? nodes : null);
    scrollDown();
  } catch (err) {
    setTyping(false);
    setCsStatus(false);
    appendMsg('ai', '⚠ ' + err.message);
    scrollDown();
    console.error('[Cyanix] Error:', err);
  } finally {
    _responding = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}

async function fetchSearch(query) {
  try {
    const res = await fetch(SEARCH_URL, {
      method: 'POST', headers: EDGE_HEADERS,
      body: JSON.stringify({ query }),
    });
    if (!res.ok) { console.warn('[Cyanix] Search', res.status); return null; }
    return await res.json();
  } catch (e) { console.error('[Cyanix] Search error:', e); return null; }
}

async function fetchChat(message, csData) {
  const body = { message, history: _chatHistory, ...(csData ? { cysearch: csData } : {}) };
  const res  = await fetch(CHAT_URL, {
    method: 'POST', headers: EDGE_HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`cyanix-chat ${res.status}: ${txt.slice(0, 160)}`);
  }
  return await res.json();
}

/* ══════════════════════════════════════════════════════════
   CYANIX CHAT — RENDER
══════════════════════════════════════════════════════════ */
function appendMsg(role, text, nodes) {
  const wrap = el('messages');
  if (!wrap) return;

  const row    = document.createElement('div');
  row.className = `msg msg-${role}`;

  const avatar = document.createElement('div');
  avatar.className = role === 'user' ? 'avatar user-avatar' : 'avatar ai-avatar';
  avatar.textContent = role === 'user' ? 'U' : '✦';

  const body   = document.createElement('div'); body.className = 'msg-body';
  const author = document.createElement('div'); author.className = 'msg-author';
  author.textContent = role === 'user' ? 'You' : 'Cyanix AI';

  const bubble = document.createElement('div'); bubble.className = 'msg-text';
  bubble.innerHTML = mdToHTML(text);

  if (nodes && nodes.length) {
    const block = document.createElement('div'); block.className = 'result-block';
    const lbl   = document.createElement('div'); lbl.className = 'result-label';
    lbl.textContent = `✦ Found ${nodes.length} result${nodes.length > 1 ? 's' : ''} via Cyanix Search`;
    block.appendChild(lbl);
    const row2 = document.createElement('div'); row2.className = 'result-nodes';
    nodes.forEach(n => {
      const color = CAT_COLORS[n.category] || CAT_COLORS.other;
      const a     = document.createElement('a'); a.className = 'result-node';
      a.style.borderColor = color + '55'; a.style.color = color;
      if (n.url && n.url !== '#') {
        a.href = n.url.startsWith('http') ? n.url : 'https://' + n.url;
        a.target = '_blank'; a.rel = 'noopener';
      }
      const dot = document.createElement('span'); dot.className = 'rn-dot'; dot.style.background = color;
      a.appendChild(dot); a.appendChild(document.createTextNode(n.label));
      row2.appendChild(a);
    });
    block.appendChild(row2); bubble.appendChild(block);
  }

  body.appendChild(author); body.appendChild(bubble);
  if (role === 'user') { row.appendChild(body); row.appendChild(avatar); }
  else                 { row.appendChild(avatar); row.appendChild(body); }
  wrap.appendChild(row);
}

function mdToHTML(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^#{1,3} (.+)$/gm, '<strong style="color:var(--cyan);display:block;margin-top:6px;">$1</strong>')
    .replace(/^\s*[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/<li>[\s\S]*?<\/li>/g, m => `<ul>${m}</ul>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')
    .replace(/^(.)/,'<p>$1').replace(/$/, '</p>');
}

function renderWelcome() {
  const wrap = el('messages');
  if (!wrap) return;

  const row    = document.createElement('div');
  row.className = 'msg msg-ai welcome-card';

  const avatar = document.createElement('div');
  avatar.className = 'avatar ai-avatar'; avatar.textContent = '✦';

  const body   = document.createElement('div'); body.className = 'msg-body';
  const author = document.createElement('div'); author.className = 'msg-author'; author.textContent = 'Cyanix AI';

  const bubble = document.createElement('div'); bubble.className = 'msg-text';
  bubble.innerHTML = `
    <p>Hey! 👋 I'm <strong>Cyanix AI</strong>, your intelligent assistant for the internet.</p>
    <p style="margin-top:8px;">I can answer questions, find websites &amp; resources, write code, summarize topics, and more. When you ask me to find something, I'll search the web automatically.</p>
    <p style="margin-top:8px;">What can I help you with today?</p>
    <div class="suggest-chips">
      <button class="chip" data-q="What are the best AI tools right now?">🤖 Best AI tools</button>
      <button class="chip" data-q="Show me top web development resources">🌐 Web dev resources</button>
      <button class="chip" data-q="Find me the latest startup tools">🚀 Startup tools</button>
      <button class="chip" data-q="What are the best design resources?">🎨 Design resources</button>
    </div>`;

  body.appendChild(author); body.appendChild(bubble);
  row.appendChild(avatar); row.appendChild(body);
  wrap.appendChild(row);
  bindChips();
}

function bindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      showChat();
      setTimeout(() => sendMessage(chip.dataset.q), 100);
    });
  });
}

function clearChat() {
  const wrap = el('messages');
  if (wrap) { wrap.innerHTML = ''; }
  _chatHistory = [];
  resetSidebar();
  renderWelcome();
}

function updateSidebar(nodes) {
  const list = el('nodes-list');
  if (!list) return;
  list.innerHTML = '';
  nodes.forEach(node => {
    const color = CAT_COLORS[node.category] || CAT_COLORS.other;
    const a     = document.createElement('a');
    a.className = 'node-card'; a.style.borderColor = color + '33';
    if (node.url && node.url !== '#') {
      a.href = node.url.startsWith('http') ? node.url : 'https://' + node.url;
      a.target = '_blank'; a.rel = 'noopener';
    }
    a.innerHTML = `
      <span class="nc-cat" style="color:${color}">${esc((node.category || 'other').toUpperCase())}</span>
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
      <div class="empty-icon">◈</div>
      <p class="empty-text">Results appear here when Cyanix searches the web for you.</p>
    </div>`;
}
