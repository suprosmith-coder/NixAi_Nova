/* ═══════════════════════════════════════════════════════════
   CYSEARCH + CYANIX AI — app.js  (merged, single file)
   All AI via Supabase edge functions. No secrets in frontend.
═══════════════════════════════════════════════════════════ */

'use strict';

// ── CONFIG ────────────────────────────────────────────────
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';

const SEARCH_URL  = `${SUPABASE_URL}/functions/v1/search`;
const CHAT_URL    = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const REDIRECT_URL = window.location.href.split('?')[0];

const EDGE_HEADERS = {
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${SUPABASE_ANON}`,
  'apikey':        SUPABASE_ANON,
};

// ── SHARED CLUSTER DATA ───────────────────────────────────
const CLUSTERS = [
  { id:'social',   label:'Social Media', color:'#ff6b6b', x:-.28, y:.09, z:.12,
    sites:[{n:'Twitter/X',u:'https://x.com',l:1},{n:'Instagram',u:'https://instagram.com',l:1},{n:'TikTok',u:'https://tiktok.com',l:1},{n:'Reddit',u:'https://reddit.com',l:1},{n:'Facebook',u:'https://facebook.com',l:1},{n:'LinkedIn',u:'https://linkedin.com',l:1},{n:'Discord',u:'https://discord.com',l:2},{n:'Snapchat',u:'https://snapchat.com',l:2},{n:'Threads',u:'https://threads.net',l:2},{n:'Mastodon',u:'https://mastodon.social',l:3},{n:'Tumblr',u:'https://tumblr.com',l:3}]},
  { id:'ai',       label:'AI Tools',     color:'#00f5ff', x:.03, y:.22, z:-.15,
    sites:[{n:'ChatGPT',u:'https://chat.openai.com',l:1},{n:'Claude',u:'https://claude.ai',l:1},{n:'Gemini',u:'https://gemini.google.com',l:1},{n:'Cysearch',u:'#',l:1},{n:'Perplexity',u:'https://perplexity.ai',l:1},{n:'Midjourney',u:'https://midjourney.com',l:2},{n:'Runway',u:'https://runwayml.com',l:2},{n:'ElevenLabs',u:'https://elevenlabs.io',l:2},{n:'Cursor',u:'https://cursor.sh',l:2}]},
  { id:'gaming',   label:'Gaming',       color:'#a855f7', x:.30, y:-.05, z:.04,
    sites:[{n:'Steam',u:'https://store.steampowered.com',l:1},{n:'Twitch',u:'https://twitch.tv',l:1},{n:'Epic Games',u:'https://epicgames.com',l:1},{n:'Roblox',u:'https://roblox.com',l:1},{n:'Xbox',u:'https://xbox.com',l:2},{n:'PlayStation',u:'https://playstation.com',l:2},{n:'GOG',u:'https://gog.com',l:2},{n:'itch.io',u:'https://itch.io',l:3}]},
  { id:'news',     label:'News',         color:'#f59e0b', x:-.08, y:-.26, z:.10,
    sites:[{n:'BBC',u:'https://bbc.com',l:1},{n:'Reuters',u:'https://reuters.com',l:1},{n:'The Verge',u:'https://theverge.com',l:1},{n:'TechCrunch',u:'https://techcrunch.com',l:1},{n:'Wired',u:'https://wired.com',l:2},{n:'Hacker News',u:'https://news.ycombinator.com',l:2},{n:'Bloomberg',u:'https://bloomberg.com',l:2},{n:'Substack',u:'https://substack.com',l:3}]},
  { id:'startups', label:'Startups',     color:'#10b981', x:-.22, y:.18, z:-.09,
    sites:[{n:'Y Combinator',u:'https://ycombinator.com',l:1},{n:'Vercel',u:'https://vercel.com',l:1},{n:'Supabase',u:'https://supabase.com',l:1},{n:'Figma',u:'https://figma.com',l:1},{n:'Notion',u:'https://notion.so',l:2},{n:'Linear',u:'https://linear.app',l:2},{n:'Product Hunt',u:'https://producthunt.com',l:2},{n:'Indie Hackers',u:'https://indiehackers.com',l:3}]},
  { id:'education',label:'Education',    color:'#3b82f6', x:.14, y:-.32, z:-.07,
    sites:[{n:'Khan Academy',u:'https://khanacademy.org',l:1},{n:'Wikipedia',u:'https://wikipedia.org',l:1},{n:'YouTube',u:'https://youtube.com',l:1},{n:'Coursera',u:'https://coursera.org',l:2},{n:'Duolingo',u:'https://duolingo.com',l:2},{n:'Codecademy',u:'https://codecademy.com',l:2},{n:'Brilliant',u:'https://brilliant.org',l:3}]},
  { id:'ecommerce',label:'E-Commerce',   color:'#f97316', x:-.36, y:-.14, z:-.04,
    sites:[{n:'Amazon',u:'https://amazon.com',l:1},{n:'Shopify',u:'https://shopify.com',l:1},{n:'Etsy',u:'https://etsy.com',l:1},{n:'eBay',u:'https://ebay.com',l:2},{n:'Stripe',u:'https://stripe.com',l:2},{n:'Gumroad',u:'https://gumroad.com',l:3}]},
  { id:'darkweb',  label:'Dark Web',     color:'#475569', x:.20, y:.28, z:.18,
    sites:[{n:'[REDACTED]',u:'#',l:4},{n:'[UNKNOWN]',u:'#',l:4},{n:'[ENCRYPTED]',u:'#',l:4}]},
];

const CAT_COLORS = {
  social:'#ff6b6b', ai:'#00f5ff', gaming:'#a855f7', news:'#f59e0b',
  startups:'#10b981', education:'#3b82f6', ecommerce:'#f97316',
  darkweb:'#475569', other:'#94a3b8', center:'#ffffff',
};

const SITE_DESCS = {
  'Twitter/X':'Real-time social network for news and viral moments.',
  'Instagram':'Photo and video sharing — 2 billion monthly users.',
  'TikTok':'Short-form video, the most downloaded app on the planet.',
  'Reddit':'Massive forums for every topic imaginable.',
  'ChatGPT':"OpenAI's AI chatbot — the one that started the wave.",
  'Claude':"Anthropic's AI assistant, known for safety and long context.",
  'Cysearch':"You're here — the galaxy map of the internet.",
  'Steam':"Valve's PC gaming platform with 50,000+ games.",
  'YouTube':"Google's video platform. 500 hours uploaded every minute.",
  'Wikipedia':'Free encyclopedia written by millions of volunteers.',
  'Amazon':"The world's largest e-commerce platform.",
  'Supabase':'Open-source Firebase alternative built on Postgres.',
  'Vercel':'Frontend deployment — zero config, instant global.',
  'BBC':'UK public broadcaster delivering global news.',
  '[REDACTED]':'ACCESS DENIED.', '[UNKNOWN]':'ORIGIN UNVERIFIED.', '[ENCRYPTED]':'DECRYPTION KEY REQUIRED.',
};

// ── SHARED HELPERS ────────────────────────────────────────
const el    = id   => document.getElementById(id);
const show  = (id, d='block') => { const e=el(id); if(e) e.style.display=d; };
const hide  = id   => { const e=el(id); if(e) e.style.display='none'; };
const on    = (id, ev, fn) => { const e=el(id); if(e) e.addEventListener(ev, fn); };
const setText = (id, t) => { const e=el(id); if(e) e.textContent=t; };
const showErr = (id, m) => { const e=el(id); if(!e) return; e.textContent=m; e.style.display='block'; };
const esc   = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');


/* ════════════════════════════════════════════════════════
   GLOBAL BOOT
════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  bindAppNav();
  bindCysearchButtons();
  bindCyanixButtons();
  initSupabase();
  initGalaxy();
  animCounter('counter', 1847293, 2400);
  renderWelcome();
});


/* ════════════════════════════════════════════════════════
   APP NAV — switches between Cysearch and Cyanix
════════════════════════════════════════════════════════ */
function bindAppNav() {
  document.querySelectorAll('.app-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const app = tab.dataset.app;
      document.querySelectorAll('.app-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      if (app === 'cysearch') {
        show('app-cysearch');
        hide('app-cyanix');
      } else {
        hide('app-cysearch');
        show('app-cyanix');
      }
    });
  });

  // "Open Galaxy Map" button inside Cyanix sidebar switches to Cysearch
  on('goto-cysearch-btn', 'click', () => {
    el('tab-cysearch')?.click();
  });
}


/* ════════════════════════════════════════════════════════
   SUPABASE AUTH
════════════════════════════════════════════════════════ */
let _sb      = null;
let _session = null;

function initSupabase() {
  try {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    _sb.auth.onAuthStateChange((_ev, session) => {
      _session = session;
      if (session) onSignedIn(session.user);
      else         onSignedOut();
    });
    _sb.auth.getSession().then(({ data }) => {
      if (data?.session) { _session = data.session; onSignedIn(data.session.user); }
    });
  } catch (err) {
    console.error('Supabase init failed — auth unavailable:', err);
  }
}

function onSignedIn(user) {
  hideAuthModal();
  setText('user-label', user.email || user.user_metadata?.name || 'Explorer');
  showCobweb();
}
function onSignedOut() {
  hide('screen-cobweb');
  show('screen-galaxy');
}

function showAuthModal() { show('auth-overlay', 'flex'); }
function hideAuthModal() { hide('auth-overlay'); }

async function oauthLogin(provider) {
  if (!_sb) { alert('Auth unavailable. Try again later.'); return; }
  const btn = el('ob-' + provider);
  if (btn) { btn.disabled = true; btn.textContent = 'Connecting...'; }
  try {
    await _sb.auth.signInWithOAuth({ provider, options: { redirectTo: REDIRECT_URL } });
  } catch (err) {
    if (btn) btn.disabled = false;
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
  if (pass !== conf)   { showErr('su-err', 'Passwords do not match.'); return; }
  if (pass.length < 6) { showErr('su-err', 'Password must be at least 6 characters.'); return; }
  const btn = el('su-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
  const { error } = await _sb.auth.signUp({ email, password: pass });
  if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
  if (error) {
    showErr('su-err', error.message);
  } else {
    const ok = el('su-ok');
    if (ok) { ok.textContent = '✓ Check your email to confirm your account'; ok.style.display = 'block'; }
  }
}


/* ════════════════════════════════════════════════════════
   CYSEARCH — BUTTON BINDINGS
════════════════════════════════════════════════════════ */
let _activeLayer = 1;

function bindCysearchButtons() {
  // Enter / explore button
  on('enter-btn', 'click', () => {
    if (_session) showCobweb();
    else          showAuthModal();
  });

  // Depth / layer buttons
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeLayer = parseInt(btn.dataset.layer, 10);
      document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyLayerFilter();
    });
  });

  // Auth modal
  on('auth-close',   'click', hideAuthModal);
  on('auth-overlay', 'click', e => { if (e.target === el('auth-overlay')) hideAuthModal(); });

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

  // Email forms
  on('si-btn',  'click',   emailSignIn);
  on('si-pass', 'keydown', e => { if (e.key === 'Enter') emailSignIn(); });
  on('su-btn',  'click',   emailSignUp);
  on('su-conf', 'keydown', e => { if (e.key === 'Enter') emailSignUp(); });

  // Cobweb screen
  on('signout-btn',  'click',   async () => { if (_sb) await _sb.auth.signOut(); else location.reload(); });
  on('search-btn',   'click',   doSearch);
  on('reset-btn',    'click',   resetSearch);
  on('ni-close',     'click',   () => hide('node-info'));
  on('search-input', 'keydown', e => { if (e.key === 'Enter') doSearch(); });

  document.querySelectorAll('.qtag').forEach(tag => {
    tag.addEventListener('click', () => {
      const inp = el('search-input');
      if (inp) { inp.value = tag.dataset.q; doSearch(); }
    });
  });
}


/* ════════════════════════════════════════════════════════
   CYSEARCH — SCREEN SWITCHING
════════════════════════════════════════════════════════ */
function showCobweb() {
  hide('screen-galaxy');
  show('screen-cobweb');
  requestAnimationFrame(() => initCobweb());
}


/* ════════════════════════════════════════════════════════
   THREE.JS 3D GALAXY
════════════════════════════════════════════════════════ */
let _galaxy      = {};
let _interactable = [];
let _sph         = { theta: .4, phi: 1.2, r: 5.5 };
let _tSph        = { ..._sph };
let _autoRot     = true;
let _isDragging  = false;
let _dragMoved   = false;
let _prevMouse   = { x:0, y:0 };
let _mouse3      = new THREE.Vector2();
let _hovered     = null;
let _locked      = null;

function initGalaxy() {
  const canvas = el('galaxy-canvas');
  if (!canvas) { console.error('[Cysearch] galaxy-canvas not found'); return; }

  const W = window.innerWidth, H = window.innerHeight;
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W/H, 0.01, 200);
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  } catch(e) { console.error('[Cysearch] WebGL unavailable:', e); return; }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x04060f, 1);

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.07;
  _galaxy = { scene, camera, renderer, raycaster };

  buildBgStars(scene);
  buildClusters(scene);
  buildLegend();
  bindGalaxyEvents(canvas, renderer, camera, raycaster);
  galaxyLoop(renderer, scene, camera, raycaster);

  window.addEventListener('resize', () => {
    const nW = window.innerWidth, nH = window.innerHeight;
    camera.aspect = nW/nH;
    camera.updateProjectionMatrix();
    renderer.setSize(nW, nH);
  });
}

function glowTex(color, size=64) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  g.addColorStop(0,   color);
  g.addColorStop(.35, color+'88');
  g.addColorStop(.7,  color+'22');
  g.addColorStop(1,   'transparent');
  ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
  return new THREE.CanvasTexture(c);
}

function buildBgStars(scene) {
  const N=7000, pos=new Float32Array(N*3), col=new Float32Array(N*3);
  for (let i=0;i<N;i++) {
    const t=Math.random()*Math.PI*2, p=Math.acos(2*Math.random()-1), r=25+Math.random()*55;
    pos[i*3]=r*Math.sin(p)*Math.cos(t); pos[i*3+1]=r*Math.sin(p)*Math.sin(t); pos[i*3+2]=r*Math.cos(p);
    const b=.4+Math.random()*.6; col[i*3]=b; col[i*3+1]=b; col[i*3+2]=Math.min(1,b+.25);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  const stars=new THREE.Points(geo, new THREE.PointsMaterial({
    size:.06, vertexColors:true, transparent:true, opacity:.75,
    map:glowTex('#ffffff',32), blending:THREE.AdditiveBlending, depthWrite:false,
  }));
  stars.userData.isBg=true; scene.add(stars);
}

function buildClusters(scene) {
  _interactable=[];
  CLUSTERS.forEach(cl => {
    const group=new THREE.Group();
    group.position.set(cl.x*14, cl.y*14, cl.z*14);
    group.userData.clusterId=cl.id;

    const cGeo=new THREE.BufferGeometry();
    cGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([0,0,0]),3));
    group.add(new THREE.Points(cGeo, new THREE.PointsMaterial({
      size:.32, map:glowTex(cl.color,128), transparent:true, opacity:1,
      blending:THREE.AdditiveBlending, depthWrite:false,
    })));
    group.add(new THREE.Mesh(new THREE.SphereGeometry(.6,16,16),
      new THREE.MeshBasicMaterial({ color:new THREE.Color(cl.color), transparent:true, opacity:.05,
        blending:THREE.AdditiveBlending, depthWrite:false, side:THREE.BackSide })));

    cl.sites.forEach(site => {
      const ang=Math.random()*Math.PI*2, incl=(Math.random()-.5)*Math.PI*.55;
      const d=.2+Math.random()*.5;
      const sx=d*Math.cos(ang)*Math.cos(incl), sy=d*Math.sin(incl), sz=d*Math.sin(ang)*Math.cos(incl);
      const sGeo=new THREE.BufferGeometry();
      sGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([sx,sy,sz]),3));
      const sz2=site.l===1?.12:site.l===2?.08:.055;
      const op=site.l===1?.95:site.l===2?.65:.38;
      const pt=new THREE.Points(sGeo, new THREE.PointsMaterial({
        size:sz2, map:glowTex(cl.color,64), transparent:true, opacity:op,
        blending:THREE.AdditiveBlending, depthWrite:false,
      }));
      pt.userData={cluster:cl, site, layer:site.l};
      group.add(pt); _interactable.push({mesh:pt, cluster:cl, site});
    });
    scene.add(group);
  });
}

function buildLegend() {
  const wrap=el('legend-items'); if(!wrap) return;
  wrap.innerHTML='';
  CLUSTERS.forEach(cl => {
    const div=document.createElement('div'); div.className='leg-item';
    div.innerHTML=`<span class="leg-dot" style="background:${cl.color};box-shadow:0 0 5px ${cl.color}66"></span>${cl.label}`;
    div.addEventListener('click', () => {
      const g=_galaxy.scene?.children.find(c=>c.userData.clusterId===cl.id);
      if(g){ const p=g.position.clone().normalize();
        _tSph.theta=Math.atan2(p.x,p.z); _tSph.phi=Math.acos(Math.max(-1,Math.min(1,p.y))); _tSph.r=3; _autoRot=false;
        setTimeout(()=>{_autoRot=true;},4000); }
    });
    wrap.appendChild(div);
  });
}

function applyLayerFilter() {
  _interactable.forEach(({mesh}) => { mesh.visible = mesh.userData.layer <= _activeLayer; });
}

function camUpdate(camera) {
  const {theta,phi,r}=_sph;
  camera.position.set(r*Math.sin(phi)*Math.sin(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.cos(theta));
  camera.lookAt(0,0,0);
}

function bindGalaxyEvents(canvas, renderer, camera, raycaster) {
  canvas.addEventListener('mousedown', e => {
    _isDragging=true; _autoRot=false; _dragMoved=false;
    _prevMouse={x:e.clientX, y:e.clientY};
  });
  window.addEventListener('mouseup', () => { _isDragging=false; _autoRot=true; });

  canvas.addEventListener('mousemove', e => {
    const rect=canvas.getBoundingClientRect();
    _mouse3.x=((e.clientX-rect.left)/rect.width)*2-1;
    _mouse3.y=-((e.clientY-rect.top)/rect.height)*2+1;
    if (_isDragging) {
      const dx=e.clientX-_prevMouse.x, dy=e.clientY-_prevMouse.y;
      if(Math.hypot(dx,dy)>3) _dragMoved=true;
      _tSph.theta-=dx*.005;
      _tSph.phi=Math.max(.12,Math.min(Math.PI-.12,_tSph.phi+dy*.005));
      _prevMouse={x:e.clientX, y:e.clientY};
    }
  });

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    _tSph.r=Math.max(1.8,Math.min(14,_tSph.r+e.deltaY*.006));
  }, {passive:false});

  canvas.addEventListener('click', e => {
    if (_dragMoved) return;
    const rect=canvas.getBoundingClientRect();
    const v=new THREE.Vector2(
      ((e.clientX-rect.left)/rect.width)*2-1,
      -((e.clientY-rect.top)/rect.height)*2+1
    );
    raycaster.setFromCamera(v, camera);
    for (const p of _interactable) {
      if(!p.mesh.visible) continue;
      if(raycaster.intersectObject(p.mesh).length>0) {
        if(_locked&&_locked.site===p.site) {
          if(p.site.u&&p.site.u!=='#') window.open(p.site.u,'_blank','noopener');
        } else {
          _locked=p; showLockOn(p,camera,renderer.domElement); _autoRot=false;
          const wp=p.mesh.getWorldPosition(new THREE.Vector3()).normalize();
          _tSph.theta=Math.atan2(wp.x,wp.z); _tSph.phi=Math.acos(Math.max(-1,Math.min(1,wp.y)));
          _tSph.r=Math.max(2.8,_sph.r*.75); setTimeout(()=>{_autoRot=true;},5000);
        }
        return;
      }
    }
    _locked=null; hideLockOn();
  });

  let lastTouchDist=null;
  canvas.addEventListener('touchstart', e => {
    if(e.touches.length===1){ _isDragging=true;_autoRot=false;_dragMoved=false;_prevMouse={x:e.touches[0].clientX,y:e.touches[0].clientY}; }
  },{passive:true});
  canvas.addEventListener('touchmove', e => {
    if(e.touches.length===1&&_isDragging){
      const dx=e.touches[0].clientX-_prevMouse.x,dy=e.touches[0].clientY-_prevMouse.y;
      if(Math.hypot(dx,dy)>3) _dragMoved=true;
      _tSph.theta-=dx*.006; _tSph.phi=Math.max(.12,Math.min(Math.PI-.12,_tSph.phi+dy*.006));
      _prevMouse={x:e.touches[0].clientX,y:e.touches[0].clientY};
    }
    if(e.touches.length===2){
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      if(lastTouchDist) _tSph.r=Math.max(1.8,Math.min(14,_tSph.r-(d-lastTouchDist)*.01));
      lastTouchDist=d;
    }
  },{passive:true});
  canvas.addEventListener('touchend', () => { _isDragging=false;lastTouchDist=null;setTimeout(()=>{_autoRot=true;},2000); });
}

function galaxyLoop(renderer, scene, camera, raycaster) {
  (function loop(ts) {
    requestAnimationFrame(loop);
    const t=ts*.001;
    if(_autoRot) _tSph.theta+=.0008;
    _sph.theta+=(_tSph.theta-_sph.theta)*.06;
    _sph.phi+=(_tSph.phi-_sph.phi)*.06;
    _sph.r+=(_tSph.r-_sph.r)*.06;
    camUpdate(camera);
    scene.children.forEach((c,i) => {
      if(c.userData.clusterId){ const idx=CLUSTERS.findIndex(cl=>cl.id===c.userData.clusterId);
        c.rotation.y=t*.035*(idx%2===0?1:-1); c.rotation.x=Math.sin(t*.018+idx)*.04; }
      if(c.userData.isBg) c.rotation.y=t*.006;
    });
    if(!_locked){
      raycaster.setFromCamera(_mouse3,camera);
      let found=null;
      for(const p of _interactable){ if(!p.mesh.visible) continue; if(raycaster.intersectObject(p.mesh).length>0){found=p;break;} }
      if(found!==_hovered){ _hovered=found; updateTooltip(found,camera,renderer.domElement); }
    } else { updateLockOnPos(_locked,camera,renderer.domElement); _hovered=null; }
    renderer.domElement.style.cursor=(_locked||_hovered)?'pointer':(_isDragging?'grabbing':'grab');
    renderer.render(scene,camera);
  })(0);
}

function updateTooltip(found, camera, canvas) {
  const tt=el('tooltip'); if(!tt) return;
  if(!found){ tt.style.display='none'; return; }
  const {cluster:cl,site}=found;
  setText('tt-cluster',cl.label); const c=el('tt-cluster'); if(c) c.style.color=cl.color;
  setText('tt-name',site.n);
  setText('tt-url',site.u==='#'?'[classified]':site.u.replace('https://',''));
  const wpos=found.mesh.getWorldPosition(new THREE.Vector3()); wpos.project(camera);
  const rect=canvas.getBoundingClientRect();
  const px=(wpos.x+1)/2*rect.width+rect.left, py=(1-(wpos.y+1)/2)*rect.height+rect.top;
  tt.style.left=Math.min(px+16,window.innerWidth-180)+'px';
  tt.style.top=Math.max(py-60,8)+'px'; tt.style.display='block';
}

function showLockOn(p, camera, canvas) {
  const {cluster:cl,site}=p; const panel=el('lockon-panel'); if(!panel) return;
  setText('lo-cluster',cl.label.toUpperCase()); const c=el('lo-cluster'); if(c) c.style.color=cl.color;
  setText('lo-name',site.n);
  setText('lo-url',site.u==='#'?'[classified]':site.u.replace('https://',''));
  setText('lo-desc',SITE_DESCS[site.n]||`A site in the ${cl.label} category.`);
  document.querySelectorAll('.lc').forEach(corner=>corner.style.borderColor=cl.color);
  const ring=el('lo-ring'); if(ring) ring.style.borderColor=cl.color+'55';
  const dot=el('lo-dot'); if(dot){ dot.style.background=cl.color; dot.style.boxShadow=`0 0 8px ${cl.color}`; }
  const launch=el('lo-launch');
  if(launch){ if(site.u&&site.u!=='#'){ launch.style.display='block';launch.style.borderColor=cl.color;launch.style.color=cl.color;launch.onclick=()=>window.open(site.u,'_blank','noopener'); } else { launch.style.display='none'; } }
  panel.style.display='block'; panel.style.opacity='0'; panel.style.transform='translate(-50%,-50%) scale(.88)';
  requestAnimationFrame(()=>{ panel.style.transition='opacity .22s ease,transform .28s cubic-bezier(.34,1.56,.64,1)'; panel.style.opacity='1'; panel.style.transform='translate(-50%,-50%) scale(1)'; });
  updateLockOnPos(p,camera,canvas);
}
function hideLockOn() {
  const panel=el('lockon-panel'); if(!panel) return;
  panel.style.opacity='0'; panel.style.transform='translate(-50%,-50%) scale(.9)';
  setTimeout(()=>{ panel.style.display='none'; },220);
}
function updateLockOnPos(p, camera, canvas) {
  const panel=el('lockon-panel'); if(!panel||panel.style.display==='none') return;
  const wpos=p.mesh.getWorldPosition(new THREE.Vector3()); wpos.project(camera);
  const rect=canvas.getBoundingClientRect();
  const px=(wpos.x+1)/2*rect.width+rect.left, py=(1-(wpos.y+1)/2)*rect.height+rect.top;
  const pw=280,ph=200;
  panel.style.left=Math.max(pw/2+12,Math.min(window.innerWidth-pw/2-12,px))+'px';
  panel.style.top=Math.max(ph/2+12,Math.min(window.innerHeight-ph/2-80,py))+'px';
}


/* ════════════════════════════════════════════════════════
   CYSEARCH — D3 COBWEB SEARCH
════════════════════════════════════════════════════════ */
let _cwReady=false, _cwSim=null, _cwNodes=[], _cwLinks=[];
let _cwW=window.innerWidth, _cwH=window.innerHeight, _bgParts=[];

function initCobweb() {
  if(_cwReady) return;
  _cwReady=true; _cwW=window.innerWidth; _cwH=window.innerHeight;
  initBgParticles();
  window.addEventListener('resize', cwResize);
}

function initBgParticles() {
  const canvas=el('bg-canvas'); if(!canvas) return;
  canvas.width=_cwW; canvas.height=_cwH;
  const ctx=canvas.getContext('2d');
  _bgParts=Array.from({length:100},()=>({x:Math.random()*_cwW,y:Math.random()*_cwH,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.2+.4,a:Math.random()*.3+.08}));
  (function draw(){
    requestAnimationFrame(draw);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    _bgParts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0) p.x=canvas.width; if(p.x>canvas.width) p.x=0;
      if(p.y<0) p.y=canvas.height; if(p.y>canvas.height) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(0,240,255,${p.a})`; ctx.fill();
    });
    for(let i=0;i<_bgParts.length;i++) for(let j=i+1;j<_bgParts.length;j++){
      const d=Math.hypot(_bgParts[i].x-_bgParts[j].x,_bgParts[i].y-_bgParts[j].y);
      if(d<80){ ctx.beginPath(); ctx.moveTo(_bgParts[i].x,_bgParts[i].y); ctx.lineTo(_bgParts[j].x,_bgParts[j].y); ctx.strokeStyle=`rgba(0,240,255,${.05*(1-d/80)})`; ctx.lineWidth=.5; ctx.stroke(); }
    }
  })();
}

function cwResize() {
  _cwW=window.innerWidth; _cwH=window.innerHeight;
  const c=el('bg-canvas'); if(c){ c.width=_cwW; c.height=_cwH; }
  d3.select('#cobweb-svg').attr('width',_cwW).attr('height',_cwH);
  if(_cwSim){ _cwSim.force('center',d3.forceCenter(_cwW/2,_cwH/2)); _cwSim.alpha(.3).restart(); }
}

async function doSearch() {
  const input=el('search-input'); const query=input?.value.trim(); if(!query) return;
  show('loading-wrap','flex'); hide('ai-bar'); hide('node-info'); cwClear();
  try {
    const res=await fetch(SEARCH_URL,{method:'POST',headers:EDGE_HEADERS,body:JSON.stringify({query})});
    if(!res.ok){ const txt=await res.text().catch(()=>''); throw new Error(`Search ${res.status}: ${txt.slice(0,120)}`); }
    const data=await res.json();
    cwRender(query,data);
    if(data.answer){ setText('ai-text',data.answer); show('ai-bar','flex'); }
  } catch(err) {
    console.error('[Cysearch] Search error:',err);
    setText('ai-text','⚠ '+( err.message||'Search failed. Make sure your edge function is deployed.'));
    show('ai-bar','flex');
  } finally { hide('loading-wrap'); }
}

function resetSearch() {
  const inp=el('search-input'); if(inp) inp.value='';
  hide('ai-bar'); hide('node-info'); cwClear();
}

function cwClear() {
  if(_cwSim){ _cwSim.stop(); _cwSim=null; }
  _cwNodes=[]; _cwLinks=[];
  d3.select('#links-g').selectAll('*').remove();
  d3.select('#nodes-g').selectAll('*').remove();
}

function cwRender(query,data) {
  const nodes=data.nodes||[], conns=data.connections||[];
  const center={id:'__q__',label:query.length>22?query.slice(0,22)+'…':query,category:'center',isCenter:true,fx:_cwW/2,fy:_cwH/2};
  const sNodes=nodes.map(n=>({...n,isCenter:false}));
  _cwNodes=[center,...sNodes];
  const seen=new Set(); _cwLinks=[];
  conns.forEach(([a,b])=>{ const k=[a,b].sort().join('||'); if(!seen.has(k)){seen.add(k);_cwLinks.push({source:a,target:b});} });
  sNodes.forEach(n=>{ const k=['__q__',n.id].sort().join('||'); if(!seen.has(k)){seen.add(k);_cwLinks.push({source:'__q__',target:n.id});} });
  cwSimulate();
}

function cwSimulate() {
  if(_cwSim) _cwSim.stop();
  const svg=d3.select('#cobweb-svg').attr('width',_cwW).attr('height',_cwH);
  const linG=svg.select('#links-g'), nodG=svg.select('#nodes-g');
  _cwSim=d3.forceSimulation(_cwNodes)
    .force('link',d3.forceLink(_cwLinks).id(d=>d.id).distance(d=>(d.source.isCenter||d.target.isCenter)?160:110).strength(.4))
    .force('charge',d3.forceManyBody().strength(-220))
    .force('center',d3.forceCenter(_cwW/2,_cwH/2))
    .force('collision',d3.forceCollide().radius(d=>d.isCenter?44:30))
    .alphaDecay(.025);
  const link=linG.selectAll('.cw-link').data(_cwLinks).join('line').attr('class','cw-link')
    .attr('stroke',d=>{ const s=typeof d.source==='object'?d.source:_cwNodes.find(n=>n.id===d.source); return CAT_COLORS[s?.category]||CAT_COLORS.other; })
    .attr('stroke-width',1).attr('opacity',0);
  const node=nodG.selectAll('.cw-node').data(_cwNodes).join('g').attr('class','cw-node')
    .call(d3.drag()
      .on('start',(ev,d)=>{ if(!ev.active) _cwSim.alphaTarget(.3).restart(); d.fx=d.x;d.fy=d.y; })
      .on('drag', (ev,d)=>{ d.fx=ev.x;d.fy=ev.y; })
      .on('end',  (ev,d)=>{ if(!ev.active) _cwSim.alphaTarget(0); if(!d.isCenter){d.fx=null;d.fy=null;} })
    )
    .on('click',(ev,d)=>{ ev.stopPropagation(); if(!d.isCenter) showNodeInfo(d); });
  node.append('circle').attr('r',d=>d.isCenter?22:cwNodeR(d)).attr('fill',d=>(CAT_COLORS[d.category]||CAT_COLORS.other)+'22').attr('stroke',d=>CAT_COLORS[d.category]||CAT_COLORS.other).attr('stroke-width',d=>d.isCenter?2:1.5).attr('filter','url(#glow)');
  node.append('circle').attr('r',d=>d.isCenter?7:3.5).attr('fill',d=>CAT_COLORS[d.category]||CAT_COLORS.other);
  node.append('text').attr('class',d=>d.isCenter?'cw-label-center':'cw-label').attr('dy',d=>d.isCenter?38:cwNodeR(d)+14).text(d=>d.label);
  for(let i=0;i<120;i++) _cwSim.tick();
  _cwSim.on('tick',()=>{ link.attr('x1',d=>d.source.x).attr('y1',d=>d.source.y).attr('x2',d=>d.target.x).attr('y2',d=>d.target.y); node.attr('transform',d=>`translate(${d.x},${d.y})`); });
  node.transition().duration(500).delay((_,i)=>i*22).attr('opacity',1);
  link.transition().duration(700).delay(160).attr('opacity',d=>{ const s=typeof d.source==='object'?d.source:null; return s?.isCenter?.5:.2; });
}

function cwNodeR(d) { return 6+(d.weight||5)*1.1; }

function showNodeInfo(d) {
  const color=CAT_COLORS[d.category]||CAT_COLORS.other;
  const cat=el('ni-cat'); if(cat){ cat.textContent=(d.category||'other').toUpperCase(); cat.style.color=color; }
  const nm=el('ni-name'); if(nm){ nm.textContent=d.label; nm.style.color=color; }
  setText('ni-desc',d.description||'No description available.');
  const lnk=el('ni-link');
  if(lnk){ if(d.url&&d.url!=='#'){ lnk.href=d.url.startsWith('http')?d.url:'https://'+d.url; lnk.style.display='inline-block'; } else { lnk.style.display='none'; } }
  show('node-info');
}

function animCounter(id,target,ms) {
  const e=el(id); if(!e) return;
  const start=performance.now();
  (function step(now){ const p=Math.min((now-start)/ms,1); e.textContent=Math.floor(target*(1-Math.pow(1-p,3))).toLocaleString(); if(p<1) requestAnimationFrame(step); })(performance.now());
}


/* ════════════════════════════════════════════════════════
   CYANIX AI — BUTTON BINDINGS
════════════════════════════════════════════════════════ */
let _chatHistory = [], _responding = false;

const SEARCH_KW = ['website','websites','tool','tools','resource','resources','find','show me','recommend','tutorial','tutorials','learn','guide','platform','app','apps','software','service','link','links','example','examples','best','top','popular','list of','ai tool','design','dev tool','startup','library','framework','where can i','how do i find','search for','look up'];

function wantsSearch(msg) { return SEARCH_KW.some(kw => msg.toLowerCase().includes(kw)); }

function bindCyanixButtons() {
  const input   = el('chat-input');
  const sendBtn = el('send-btn');
  const clearBtn= el('clear-btn');

  if (sendBtn) sendBtn.addEventListener('click', () => { const t=input?.value.trim(); if(t) sendMessage(t); });

  if (input) {
    input.addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); const t=input.value.trim(); if(t) sendMessage(t); } });
    input.addEventListener('input', () => resizeTA(input));
  }

  if (clearBtn) clearBtn.addEventListener('click', () => {
    _chatHistory=[];
    const m=el('messages'); if(m) m.innerHTML='';
    renderWelcome(); resetSidebar();
  });
}

function bindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    const fresh=chip.cloneNode(true);
    chip.parentNode.replaceChild(fresh,chip);
    fresh.addEventListener('click',()=>sendMessage(fresh.dataset.q));
  });
}

function resizeTA(ta) {
  if(!ta) return;
  ta.style.height='auto';
  ta.style.height=Math.min(ta.scrollHeight,140)+'px';
}

function scrollDown() {
  const m=el('messages'); if(m) setTimeout(()=>{ m.scrollTop=m.scrollHeight; },40);
}

function setTyping(on,label) {
  const row=el('typing'); const lbl=el('typing-label'); if(!row) return;
  row.classList.toggle('hidden',!on);
  if(lbl&&label) lbl.textContent=label;
  if(on) scrollDown();
}

function setCsStatus(scanning) {
  const s=el('cysearch-indicator'); if(!s) return;
  s.innerHTML='<span class="cs-dot"></span> '+(scanning?'Searching...':'Cysearch connected');
  s.classList.toggle('scanning',scanning);
}


/* ════════════════════════════════════════════════════════
   CYANIX AI — SEND MESSAGE
════════════════════════════════════════════════════════ */
async function sendMessage(text) {
  if(!text.trim()||_responding) return;
  _responding=true;
  const input=el('chat-input'), sendBtn=el('send-btn');
  if(input){ input.value=''; resizeTA(input); }
  if(sendBtn) sendBtn.disabled=true;
  appendMsg('user',text); scrollDown();

  try {
    let csData=null;
    if(wantsSearch(text)){
      setTyping(true,'Searching the web...'); setCsStatus(true);
      csData=await csSearch(text); setCsStatus(false);
    }
    setTyping(true,'Thinking...');
    const result=await csChat(text,csData);
    const reply=result.reply||result.answer||result.text||'(no response)';
    const nodes=result.nodes||csData?.nodes||[];
    _chatHistory.push({role:'user',content:text});
    _chatHistory.push({role:'assistant',content:reply});
    if(_chatHistory.length>40) _chatHistory=_chatHistory.slice(-40);
    if(nodes.length) updateSidebar(nodes);
    setTyping(false);
    appendMsg('ai',reply,nodes.length?nodes:null); scrollDown();
  } catch(err) {
    setTyping(false); setCsStatus(false);
    appendMsg('ai','⚠ '+err.message); scrollDown();
    console.error('[Cyanix] Error:',err);
  } finally {
    _responding=false; if(sendBtn) sendBtn.disabled=false;
  }
}

async function csSearch(query) {
  try {
    const res=await fetch(SEARCH_URL,{method:'POST',headers:EDGE_HEADERS,body:JSON.stringify({query})});
    if(!res.ok){ console.warn('[Cyanix] Cysearch',res.status); return null; }
    return await res.json();
  } catch(e){ console.error('[Cyanix] Cysearch error:',e); return null; }
}

async function csChat(message,csData) {
  const res=await fetch(CHAT_URL,{method:'POST',headers:EDGE_HEADERS,body:JSON.stringify({message,history:_chatHistory,...(csData?{cysearch:csData}:{})})});
  if(!res.ok){ const txt=await res.text().catch(()=>''); throw new Error(`cyanix-chat ${res.status}: ${txt.slice(0,160)}`); }
  return await res.json();
}


/* ════════════════════════════════════════════════════════
   CYANIX AI — RENDER MESSAGES
════════════════════════════════════════════════════════ */
function appendMsg(role,text,nodes) {
  const wrap=el('messages'); if(!wrap) return;
  const row=document.createElement('div'); row.className=`msg msg-${role}`;
  const avatar=document.createElement('div');
  avatar.className=role==='user'?'avatar user-avatar':'avatar ai-avatar';
  avatar.textContent=role==='user'?'You':'✦';
  const body=document.createElement('div'); body.className='msg-body';
  const author=document.createElement('div'); author.className='msg-author';
  author.textContent=role==='user'?'You':'Cyanix AI';
  const bubble=document.createElement('div'); bubble.className='msg-text';
  bubble.innerHTML=mdToHTML(text);

  if(nodes&&nodes.length){
    const block=document.createElement('div'); block.className='result-block';
    const lbl=document.createElement('div'); lbl.className='result-label';
    lbl.textContent=`✦ Found ${nodes.length} results via Cysearch`; block.appendChild(lbl);
    const row2=document.createElement('div'); row2.className='result-nodes';
    nodes.forEach(n=>{
      const color=CAT_COLORS[n.category]||CAT_COLORS.other;
      const a=document.createElement('a'); a.className='result-node';
      a.style.borderColor=color+'55'; a.style.color=color;
      if(n.url&&n.url!=='#'){ a.href=n.url.startsWith('http')?n.url:'https://'+n.url; a.target='_blank'; a.rel='noopener'; }
      const dot=document.createElement('span'); dot.className='rn-dot'; dot.style.background=color;
      a.appendChild(dot); a.appendChild(document.createTextNode(n.label)); row2.appendChild(a);
    });
    block.appendChild(row2); bubble.appendChild(block);
  }

  body.appendChild(author); body.appendChild(bubble);
  if(role==='user'){ row.appendChild(body); row.appendChild(avatar); }
  else             { row.appendChild(avatar); row.appendChild(body); }
  wrap.appendChild(row);
}

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

function renderWelcome() {
  const wrap=el('messages'); if(!wrap) return;
  const row=document.createElement('div'); row.className='msg msg-ai welcome-card';
  const avatar=document.createElement('div'); avatar.className='avatar ai-avatar'; avatar.textContent='✦';
  const body=document.createElement('div'); body.className='msg-body';
  const author=document.createElement('div'); author.className='msg-author'; author.textContent='Cyanix AI';
  const bubble=document.createElement('div'); bubble.className='msg-text';
  bubble.innerHTML=`
    <p>Hey! 👋 I'm <strong>Cyanix AI</strong>, your personal assistant.</p>
    <p style="margin-top:8px;">I can answer questions, help find websites and tools, write code, and more. When you ask for resources, I'll automatically search via Cysearch.</p>
    <p style="margin-top:8px;">What can I help you with?</p>
    <div class="suggest-chips">
      <button class="chip" data-q="What are the best AI tools right now?">🤖 Best AI tools</button>
      <button class="chip" data-q="Show me web development resources">🌐 Web dev resources</button>
      <button class="chip" data-q="What are good startup tools?">🚀 Startup tools</button>
      <button class="chip" data-q="Find me some design resources">🎨 Design resources</button>
    </div>`;
  body.appendChild(author); body.appendChild(bubble);
  row.appendChild(avatar); row.appendChild(body);
  wrap.appendChild(row); bindChips();
}

function updateSidebar(nodes) {
  const list=el('nodes-list'); if(!list) return; list.innerHTML='';
  nodes.forEach(node=>{
    const color=CAT_COLORS[node.category]||CAT_COLORS.other;
    const a=document.createElement('a'); a.className='node-card'; a.style.borderColor=color+'33';
    if(node.url&&node.url!=='#'){ a.href=node.url.startsWith('http')?node.url:'https://'+node.url; a.target='_blank'; a.rel='noopener'; }
    a.innerHTML=`<span class="nc-cat" style="color:${color}">${(node.category||'other').toUpperCase()}</span><span class="nc-name">${esc(node.label)}</span><span class="nc-desc">${esc(node.description||node.url||'')}</span>`;
    list.appendChild(a);
  });
}

function resetSidebar() {
  const list=el('nodes-list'); if(!list) return;
  list.innerHTML=`<div class="nodes-empty"><div class="empty-icon">◉</div><p class="empty-text">Search results appear here as clickable cards.</p></div>`;
}
