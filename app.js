/* ═══════════════════════════════════════════════════════════
   CYANIX AI — app.js
   2D HUD galaxy (pure Canvas API) + AI chat + Supabase auth
═══════════════════════════════════════════════════════════ */
'use strict';

// ── CONFIG ────────────────────────────────────────────────
const SUPABASE_URL  = 'https://tdbgpvscwaysndrloltl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkYmdwdnNjd2F5c25kcmxvbHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NDExMTQsImV4cCI6MjA4NTMxNzExNH0.5-UfXEYo8qbjmHPhuZdj4Yf3wqjEOtre4zQgDhDJShw';
const CHAT_URL      = `${SUPABASE_URL}/functions/v1/cyanix-chat`;
const SEARCH_URL    = `${SUPABASE_URL}/functions/v1/search`;
const REDIRECT_URL  = window.location.href.split('?')[0].split('#')[0];
const EDGE_HEADERS  = { 'Content-Type':'application/json', 'Authorization':`Bearer ${SUPABASE_ANON}`, 'apikey':SUPABASE_ANON };

// ── CLUSTER DATA ──────────────────────────────────────────
const CLUSTERS = [
  { id:'ai',       label:'AI Tools',     color:'#00f2ff', angle: 90, dist:.20,
    sites:[{n:'ChatGPT',u:'https://chat.openai.com',l:1},{n:'Claude',u:'https://claude.ai',l:1},{n:'Gemini',u:'https://gemini.google.com',l:1},{n:'Cyanix AI',u:'#',l:1},{n:'Perplexity',u:'https://perplexity.ai',l:1},{n:'Midjourney',u:'https://midjourney.com',l:2},{n:'Runway',u:'https://runwayml.com',l:2},{n:'ElevenLabs',u:'https://elevenlabs.io',l:2},{n:'Cursor',u:'https://cursor.sh',l:2}]},
  { id:'social',   label:'Social Media', color:'#ff5c7a', angle:310, dist:.34,
    sites:[{n:'Twitter/X',u:'https://x.com',l:1},{n:'Instagram',u:'https://instagram.com',l:1},{n:'TikTok',u:'https://tiktok.com',l:1},{n:'Reddit',u:'https://reddit.com',l:1},{n:'Facebook',u:'https://facebook.com',l:1},{n:'LinkedIn',u:'https://linkedin.com',l:1},{n:'Discord',u:'https://discord.com',l:2},{n:'Snapchat',u:'https://snapchat.com',l:2},{n:'Threads',u:'https://threads.net',l:2}]},
  { id:'gaming',   label:'Gaming',       color:'#a855f7', angle: 20, dist:.36,
    sites:[{n:'Steam',u:'https://store.steampowered.com',l:1},{n:'Twitch',u:'https://twitch.tv',l:1},{n:'Epic Games',u:'https://epicgames.com',l:1},{n:'Roblox',u:'https://roblox.com',l:1},{n:'Xbox',u:'https://xbox.com',l:2},{n:'PlayStation',u:'https://playstation.com',l:2},{n:'GOG',u:'https://gog.com',l:2}]},
  { id:'news',     label:'News',         color:'#f59e0b', angle:200, dist:.32,
    sites:[{n:'BBC',u:'https://bbc.com',l:1},{n:'Reuters',u:'https://reuters.com',l:1},{n:'The Verge',u:'https://theverge.com',l:1},{n:'TechCrunch',u:'https://techcrunch.com',l:1},{n:'Wired',u:'https://wired.com',l:2},{n:'Hacker News',u:'https://news.ycombinator.com',l:2},{n:'Bloomberg',u:'https://bloomberg.com',l:2}]},
  { id:'startups', label:'Startups',     color:'#22d3a5', angle:155, dist:.29,
    sites:[{n:'Y Combinator',u:'https://ycombinator.com',l:1},{n:'Vercel',u:'https://vercel.com',l:1},{n:'Supabase',u:'https://supabase.com',l:1},{n:'Figma',u:'https://figma.com',l:1},{n:'Notion',u:'https://notion.so',l:2},{n:'Linear',u:'https://linear.app',l:2},{n:'Product Hunt',u:'https://producthunt.com',l:2}]},
  { id:'education',label:'Education',    color:'#3b82f6', angle:250, dist:.30,
    sites:[{n:'Khan Academy',u:'https://khanacademy.org',l:1},{n:'Wikipedia',u:'https://wikipedia.org',l:1},{n:'YouTube',u:'https://youtube.com',l:1},{n:'Coursera',u:'https://coursera.org',l:2},{n:'Duolingo',u:'https://duolingo.com',l:2},{n:'Codecademy',u:'https://codecademy.com',l:2}]},
  { id:'ecommerce',label:'E-Commerce',   color:'#f97316', angle: 60, dist:.33,
    sites:[{n:'Amazon',u:'https://amazon.com',l:1},{n:'Shopify',u:'https://shopify.com',l:1},{n:'Etsy',u:'https://etsy.com',l:1},{n:'eBay',u:'https://ebay.com',l:2},{n:'Stripe',u:'https://stripe.com',l:2},{n:'Gumroad',u:'https://gumroad.com',l:3}]},
  { id:'darkweb',  label:'Dark Web',     color:'#475569', angle:340, dist:.38,
    sites:[{n:'[REDACTED]',u:'#',l:4},{n:'[UNKNOWN]',u:'#',l:4},{n:'[ENCRYPTED]',u:'#',l:4}]},
];

const CAT_COLORS = { ai:'#00f2ff',social:'#ff5c7a',gaming:'#a855f7',news:'#f59e0b',startups:'#22d3a5',education:'#3b82f6',ecommerce:'#f97316',darkweb:'#475569',other:'#64748b' };
const SITE_DESCS = {
  'ChatGPT':"OpenAI's AI chatbot — sparked the wave.", 'Claude':"Anthropic's AI, known for safety and long context.",
  'Cyanix AI':"You're here — AI-powered internet search.", 'Twitter/X':'Real-time social and news.', 'Instagram':'Photo and video, 2B monthly users.',
  'TikTok':'Short-form video, most downloaded app.', 'Reddit':'Forums for every topic imaginable.', 'Steam':"50,000+ games on PC.",
  'YouTube':"500 hours of video uploaded every minute.", 'Wikipedia':'Free encyclopedia, millions of contributors.',
  'Amazon':"World's largest e-commerce platform.", 'Supabase':'Open-source Firebase alternative on Postgres.',
  'Vercel':'Zero-config frontend deployment, instant global.', 'BBC':'UK public broadcaster, global news.',
  '[REDACTED]':'ACCESS DENIED.', '[UNKNOWN]':'ORIGIN UNVERIFIED.', '[ENCRYPTED]':'DECRYPTION KEY REQUIRED.',
};

// ── HELPERS ───────────────────────────────────────────────
const el  = id => document.getElementById(id);
const show = (id, d='block') => { const e=el(id); if(e) e.style.display=d; };
const hide = id => { const e=el(id); if(e) e.style.display='none'; };
const on   = (id, ev, fn) => { const e=el(id); if(e) e.addEventListener(ev,fn); };
const setText = (id, t) => { const e=el(id); if(e) e.textContent=t; };
const showErr = (id, m) => { const e=el(id); if(!e) return; e.textContent=m; e.style.display='block'; };
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

// ── STATE ─────────────────────────────────────────────────
let _sb=null, _session=null, _chatHistory=[], _responding=false, _activeLayer=1;

/* ══════════════════════════════════════════════════════════
   BOOT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  initHUD();
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
  // Resume HUD animation
  if (_hud.paused) { _hud.paused = false; hudLoop(); }
}
function showChat() {
  el('view-landing').style.display = 'none';
  show('view-chat');
  _hud.paused = true;
  setTimeout(() => el('chat-input')?.focus(), 80);
}

/* ══════════════════════════════════════════════════════════
   BIND ALL
══════════════════════════════════════════════════════════ */
function bindAll() {
  on('enter-chat-btn', 'click', showChat);
  on('explore-map-btn', 'click', () => {});
  on('lnd-signin-btn', 'click', showAuthModal);
  on('back-btn', 'click', showLanding);
  on('chat-signin-btn', 'click', showAuthModal);
  on('clear-btn', 'click', clearChat);
  on('galaxy-btn', 'click', showLanding);
  on('sidebar-galaxy-btn', 'click', showLanding);
  on('auth-close', 'click', hideAuthModal);
  on('auth-overlay', 'click', e => { if(e.target===el('auth-overlay')) hideAuthModal(); });

  document.querySelectorAll('.atab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.atab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.aform').forEach(f => f.style.display='none');
      const form = el('tab-'+tab.dataset.tab);
      if(form) form.style.display='flex';
    });
  });

  on('ob-google','click', ()=>oauthLogin('google'));
  on('ob-github','click', ()=>oauthLogin('github'));
  on('ob-discord','click',()=>oauthLogin('discord'));
  on('ob-google-su','click',()=>oauthLogin('google'));
  on('si-btn','click', emailSignIn);
  on('su-btn','click', emailSignUp);
  on('si-pass','keydown', e=>{ if(e.key==='Enter') emailSignIn(); });
  on('su-conf','keydown', e=>{ if(e.key==='Enter') emailSignUp(); });

  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      _activeLayer = parseInt(btn.dataset.layer,10);
      document.querySelectorAll('.layer-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const input = el('chat-input'), sendBtn = el('send-btn');
  if(input) {
    input.addEventListener('keydown', e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(input.value); } });
    input.addEventListener('input', ()=>resizeTA(input));
  }
  on('send-btn','click', ()=>{ if(input) sendMessage(input.value); });
}

/* ══════════════════════════════════════════════════════════
   SUPABASE AUTH
══════════════════════════════════════════════════════════ */
function initSupabase() {
  try {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    _sb.auth.onAuthStateChange((_ev,session) => {
      _session = session;
      if(session) onSignedIn(session.user); else onSignedOut();
    });
    _sb.auth.getSession().then(({data})=>{ if(data?.session){ _session=data.session; onSignedIn(data.session.user); } });
  } catch(e){ console.warn('Supabase unavailable:',e); }
}
function onSignedIn(user) {
  hideAuthModal();
  const label = user.email || user.user_metadata?.name || user.user_metadata?.full_name || 'Explorer';
  const pill = el('user-pill');
  if(pill){ pill.textContent=label; pill.style.display='block'; }
  hide('lnd-signin-btn'); hide('chat-signin-btn');
}
function onSignedOut() {
  hide('user-pill'); show('lnd-signin-btn'); show('chat-signin-btn');
}
function showAuthModal() { show('auth-overlay','flex'); }
function hideAuthModal() { hide('auth-overlay'); }
async function oauthLogin(provider) {
  if(!_sb){ alert('Auth unavailable.'); return; }
  const btn = el('ob-'+provider) || el('ob-'+provider+'-su');
  if(btn){ btn.disabled=true; btn.textContent='Connecting...'; }
  try { await _sb.auth.signInWithOAuth({provider, options:{redirectTo:REDIRECT_URL}}); }
  catch(e){ if(btn) btn.disabled=false; alert('Login failed: '+e.message); }
}
async function emailSignIn() {
  if(!_sb){ showErr('si-err','Auth unavailable.'); return; }
  const email=el('si-email')?.value.trim(), pass=el('si-pass')?.value;
  hide('si-err');
  if(!email||!pass){ showErr('si-err','Fill in all fields.'); return; }
  const btn=el('si-btn'); if(btn){ btn.disabled=true; btn.textContent='Signing in...'; }
  const {error}=await _sb.auth.signInWithPassword({email,password:pass});
  if(btn){ btn.disabled=false; btn.textContent='Sign In'; }
  if(error) showErr('si-err',error.message);
}
async function emailSignUp() {
  if(!_sb){ showErr('su-err','Auth unavailable.'); return; }
  const email=el('su-email')?.value.trim(), pass=el('su-pass')?.value, conf=el('su-conf')?.value;
  hide('su-err'); hide('su-ok');
  if(!email||!pass||!conf){ showErr('su-err','Fill in all fields.'); return; }
  if(pass!==conf){ showErr('su-err','Passwords do not match.'); return; }
  if(pass.length<6){ showErr('su-err','Password must be 6+ characters.'); return; }
  const btn=el('su-btn'); if(btn){ btn.disabled=true; btn.textContent='Creating...'; }
  const {error}=await _sb.auth.signUp({email,password:pass});
  if(btn){ btn.disabled=false; btn.textContent='Create Account'; }
  if(error){ showErr('su-err',error.message); }
  else { const ok=el('su-ok'); if(ok){ ok.textContent='✓ Check your email to confirm.'; ok.style.display='block'; } }
}

/* ══════════════════════════════════════════════════════════
   2D HUD GALAXY ENGINE
══════════════════════════════════════════════════════════ */
const _hud = {
  canvas:null, ctx:null, W:0, H:0, cx:0, cy:0,
  t:0, paused:false, raf:null,
  nodes:[], packets:[], rings:[],
  hovered:null, selected:null,
  mouse:{x:-999,y:-999},
};

/* Node object */
function makeNode(x, y, r, color, label, url, layer, clusterId, isCenter=false) {
  return { x, y, r, color, label, url, layer, clusterId, isCenter,
    pulse:Math.random()*Math.PI*2, alpha:0 };
}

function initHUD() {
  const canvas = el('hud-canvas');
  if(!canvas) return;
  _hud.canvas = canvas;
  _hud.ctx    = canvas.getContext('2d');

  resizeHUD();
  buildHUDNodes();
  buildLegend();
  bindHUDEvents();
  hudLoop();

  window.addEventListener('resize', ()=>{ resizeHUD(); buildHUDNodes(); });
}

function resizeHUD() {
  const c = _hud.canvas;
  _hud.W  = c.width  = window.innerWidth;
  _hud.H  = c.height = window.innerHeight;
  _hud.cx = _hud.W / 2;
  _hud.cy = _hud.H / 2;
}

function buildHUDNodes() {
  _hud.nodes   = [];
  _hud.packets = [];
  _hud.rings   = [];

  const {W, H, cx, cy} = _hud;
  const radius = Math.min(W, H) * 0.38;

  // Center node (Cyanix AI hub)
  const center = makeNode(cx, cy, 18, '#00f2ff', 'CYANIX AI', '#', 1, 'center', true);
  center.alpha = 1;
  _hud.nodes.push(center);

  CLUSTERS.forEach((cl, ci) => {
    const rad = (cl.angle * Math.PI) / 180;
    const d   = radius * cl.dist * (1 / 0.20); // normalize
    const clX = cx + Math.cos(rad) * d;
    const clY = cy + Math.sin(rad) * d;

    // Cluster hub node
    const clNode = makeNode(clX, clY, 11, cl.color, cl.label, null, 1, cl.id, false);
    clNode.isCluster = true;
    clNode.alpha = 1;
    _hud.nodes.push(clNode);

    // Site nodes orbiting cluster
    cl.sites.forEach((site, si) => {
      const sAngle = rad + (si / cl.sites.length) * Math.PI * 2;
      const sDist  = site.l === 1 ? 55 : site.l === 2 ? 85 : 115;
      const sX     = clX + Math.cos(sAngle) * sDist;
      const sY     = clY + Math.sin(sAngle) * sDist;
      const sR     = site.l === 1 ? 5.5 : site.l === 2 ? 3.5 : 2.2;

      const sNode = makeNode(sX, sY, sR, cl.color, site.n, site.u, site.l, cl.id, false);
      sNode.isSite = true;
      sNode.clusterNode = clNode;
      sNode.alpha = 1;
      _hud.nodes.push(sNode);
    });

    // Data packet on this link (occasional)
    if(Math.random()>.3) {
      _hud.packets.push({ from:center, to:clNode, t:Math.random(), speed:.004+Math.random()*.006, color:cl.color });
    }
  });

  // Concentric guide rings
  [0.12, 0.22, 0.35, 0.46].forEach((f,i) => {
    _hud.rings.push({ r: Math.min(W,H)*f, alpha:.08-.015*i, dash:[6,14] });
  });
}

/* ── HUD RENDER LOOP ─────────────────────────────────────── */
function hudLoop() {
  if(_hud.paused) return;
  _hud.raf = requestAnimationFrame(hudLoop);
  drawHUD();
  _hud.t += 0.012;
}

function drawHUD() {
  const {ctx, W, H, cx, cy, t, nodes, packets, rings} = _hud;
  ctx.clearRect(0, 0, W, H);

  // Background: deep dark with subtle vignette
  const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W,H)*.7);
  bg.addColorStop(0, '#030c18');
  bg.addColorStop(1, '#010408');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Fine grid
  drawGrid(ctx, W, H, t);

  // Guide rings
  rings.forEach(ring => {
    ctx.beginPath();
    ctx.setLineDash(ring.dash);
    ctx.arc(cx, cy, ring.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(0,242,255,${ring.alpha})`;
    ctx.lineWidth = .8;
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // Cross-cluster constellation links (faint)
  drawConstellationLinks(ctx, nodes, t);

  // Links: center → clusters
  nodes.filter(n=>n.isCluster).forEach(cl => {
    const center = nodes[0];
    drawLink(ctx, center, cl, cl.color, t);
  });

  // Links: cluster → sites
  nodes.filter(n=>n.isSite).forEach(sn => {
    drawLink(ctx, sn.clusterNode, sn, sn.color, t, sn.layer);
  });

  // Data packets traveling along links
  packets.forEach(p => {
    p.t = (p.t + p.speed) % 1;
    const x = p.from.x + (p.to.x - p.from.x) * p.t;
    const y = p.from.y + (p.to.y - p.from.y) * p.t;
    drawPacket(ctx, x, y, p.color);
  });

  // Nodes
  const visibleNodes = nodes.filter(n => {
    if(n.isCenter || n.isCluster) return true;
    return (n.layer || 1) <= _activeLayer;
  });
  visibleNodes.forEach(n => drawNode(ctx, n, t));

  // Hover glow
  if(_hud.hovered) drawHoverRing(ctx, _hud.hovered, t);
  if(_hud.selected) drawSelectRing(ctx, _hud.selected, t);

  // Center pulsing ring
  drawCenterPulse(ctx, nodes[0], t);
}

function drawGrid(ctx, W, H, t) {
  const step = 44;
  const off  = (t * 0.8) % step;
  ctx.strokeStyle = 'rgba(0,242,255,0.025)';
  ctx.lineWidth = .5;
  for(let x = -off; x < W; x+=step) {
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
  }
  for(let y = -off; y < H; y+=step) {
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
  }
}

function drawConstellationLinks(ctx, nodes, t) {
  const clusters = nodes.filter(n=>n.isCluster);
  for(let i=0; i<clusters.length; i++) {
    for(let j=i+1; j<clusters.length; j++) {
      const a=clusters[i], b=clusters[j];
      const dist = Math.hypot(a.x-b.x, a.y-b.y);
      if(dist < 260) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(255,255,255,0.025)`;
        ctx.lineWidth = .5;
        ctx.setLineDash([3,12]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  }
}

function drawLink(ctx, from, to, color, t, layer=1) {
  const alpha = layer===1 ? .4 : layer===2 ? .22 : .12;
  const hex   = color + Math.round(alpha*255).toString(16).padStart(2,'0');

  // Animated dash offset
  ctx.save();
  ctx.setLineDash([4, 8]);
  ctx.lineDashOffset = -(t * 12);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = hex;
  ctx.lineWidth = layer===1 ? 1 : .5;
  ctx.stroke();
  ctx.restore();
}

function drawPacket(ctx, x, y, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 5);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI*2);
  ctx.fillStyle = g;
  ctx.fill();
  // Trail
  ctx.beginPath();
  ctx.arc(x, y, 1.5, 0, Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function drawNode(ctx, n, t) {
  if(!n.isCenter && !n.isCluster && !n.isSite) return;

  const pulse = Math.sin(t*1.4 + n.pulse) * .15 + .85;
  const r     = n.r * (n===_hud.hovered ? 1.35 : 1);

  // Outer glow
  const glowR = r + (n.isCluster ? 14 : 8);
  const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
  g.addColorStop(0, n.color + (n.isCluster ? '66' : '44'));
  g.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(n.x, n.y, glowR, 0, Math.PI*2);
  ctx.fillStyle = g;
  ctx.fill();

  // Core circle
  ctx.beginPath();
  ctx.arc(n.x, n.y, r * pulse, 0, Math.PI*2);
  ctx.fillStyle = n.isCluster ? n.color + 'cc' : n.color + '99';
  ctx.fill();
  ctx.strokeStyle = n.color;
  ctx.lineWidth = n.isCluster ? 1.5 : .8;
  ctx.stroke();

  // Label
  if(n.isCenter || n.isCluster) {
    ctx.font = n.isCenter
      ? 'bold 11px Orbitron, monospace'
      : '700 8px Space Mono, monospace';
    ctx.fillStyle = n.isCenter ? '#00f2ff' : n.color;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';
    const labelY = n.isCenter ? n.y + n.r + 16 : n.y + n.r + 13;
    // Background pill
    const tw = ctx.measureText(n.label).width;
    ctx.fillStyle = 'rgba(2,8,16,.75)';
    ctx.fillRect(n.x - tw/2 - 4, labelY - 9, tw + 8, 13);
    ctx.fillStyle = n.isCenter ? '#00f2ff' : n.color;
    ctx.fillText(n.label, n.x, labelY);
  } else if(n===_hud.hovered && n.isSite) {
    ctx.font = '600 7px Space Mono, monospace';
    ctx.fillStyle = n.color;
    ctx.textAlign = 'center';
    const tw = ctx.measureText(n.label).width;
    ctx.fillStyle = 'rgba(2,8,16,.8)';
    ctx.fillRect(n.x - tw/2 - 3, n.y + n.r + 3, tw + 6, 12);
    ctx.fillStyle = n.color;
    ctx.fillText(n.label, n.x, n.y + n.r + 13);
  }

  // Center crosshair decoration
  if(n.isCenter) {
    ctx.strokeStyle = 'rgba(0,242,255,.3)';
    ctx.lineWidth = .8;
    const cl = 22;
    ctx.beginPath(); ctx.moveTo(n.x-cl, n.y); ctx.lineTo(n.x+cl, n.y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(n.x, n.y-cl); ctx.lineTo(n.x, n.y+cl); ctx.stroke();
  }
}

function drawCenterPulse(ctx, center, t) {
  [1,2,3].forEach((i) => {
    const rp = (((t*.8 + i/3) % 1)) * 80 + 20;
    const op = Math.max(0, 1 - rp/100) * .4;
    ctx.beginPath();
    ctx.arc(center.x, center.y, rp, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(0,242,255,${op})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

function drawHoverRing(ctx, n, t) {
  const spin = t * 1.5;
  ctx.save();
  ctx.translate(n.x, n.y); ctx.rotate(spin);
  ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.arc(0, 0, n.r + 8, 0, Math.PI*2);
  ctx.strokeStyle = n.color + 'aa'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();
}

function drawSelectRing(ctx, n, t) {
  const spin = -t * 2;
  ctx.save();
  ctx.translate(n.x, n.y); ctx.rotate(spin);
  ctx.setLineDash([6,3]);
  ctx.beginPath(); ctx.arc(0, 0, n.r + 14, 0, Math.PI*2);
  ctx.strokeStyle = n.color; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  // Corner brackets
  const br = n.r + 20;
  ctx.strokeStyle = n.color; ctx.lineWidth = 1.5; ctx.setLineDash([]);
  [[1,1],[-1,1],[-1,-1],[1,-1]].forEach(([sx,sy]) => {
    ctx.beginPath();
    ctx.moveTo(n.x + sx*br, n.y + sy*(br-7));
    ctx.lineTo(n.x + sx*br, n.y + sy*br);
    ctx.lineTo(n.x + sx*(br-7), n.y + sy*br);
    ctx.stroke();
  });
}

/* ── HUD EVENTS ───────────────────────────────────────────── */
function bindHUDEvents() {
  const canvas = _hud.canvas;

  canvas.addEventListener('mousemove', e => {
    const {x, y} = canvasPos(e.clientX, e.clientY);
    _hud.mouse = {x, y};
    setText('hud-coords', `X:${Math.round(x).toString().padStart(4,'0')} Y:${Math.round(y).toString().padStart(4,'0')}`);
    hitTest(x, y);
  });

  canvas.addEventListener('click', e => {
    const {x, y} = canvasPos(e.clientX, e.clientY);
    const hit = getHit(x, y);
    if(hit) {
      _hud.selected = hit;
      showNodeTooltip(hit, e.clientX, e.clientY);
    } else {
      _hud.selected = null;
      hideNodeTooltip();
    }
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.touches[0];
    const {x, y} = canvasPos(t.clientX, t.clientY);
    const hit = getHit(x, y);
    if(hit) { _hud.selected=hit; _hud.hovered=hit; showNodeTooltip(hit, t.clientX, t.clientY); }
    else    { _hud.selected=null; _hud.hovered=null; hideNodeTooltip(); }
  }, {passive:false});

  canvas.addEventListener('mouseleave', () => {
    _hud.hovered = null;
    canvas.classList.remove('can-click');
    hideNodeTooltip();
  });
}

function canvasPos(cx, cy) {
  const rect = _hud.canvas.getBoundingClientRect();
  return { x: cx - rect.left, y: cy - rect.top };
}

function getHit(x, y) {
  const nodes = _hud.nodes.filter(n => {
    if(n.isCenter || n.isCluster) return true;
    return (n.layer||1) <= _activeLayer;
  });
  // largest nodes first
  const sorted = [...nodes].sort((a,b) => b.r - a.r);
  return sorted.find(n => Math.hypot(n.x-x, n.y-y) < n.r + 7) || null;
}

function hitTest(x, y) {
  const hit = getHit(x, y);
  _hud.hovered = hit;
  _hud.canvas.classList.toggle('can-click', !!hit);
  if(hit) {
    setText('hud-sector', hit.clusterId ? hit.clusterId.toUpperCase() : '—');
  }
}

function showNodeTooltip(node, cx, cy) {
  const tt = el('node-tooltip');
  if(!tt) return;

  el('nt-cat').textContent  = node.clusterId ? node.clusterId.toUpperCase() : 'HUB';
  el('nt-tier').textContent = node.layer ? `TIER ${node.layer}` : '';
  el('nt-name').textContent = node.label;
  el('nt-url').textContent  = node.url && node.url!=='#' ? node.url.replace('https://','') : '';
  el('nt-desc').textContent = SITE_DESCS[node.label] || (node.isCluster ? `${node.label} cluster — click sites to explore.` : '');
  el('nt-cat').style.color  = node.color;

  const open = el('nt-open');
  if(open) {
    if(node.url && node.url !== '#') {
      open.style.display = 'block';
      open.style.color = node.color;
      open.style.borderColor = node.color + '88';
      open.onclick = () => window.open(node.url, '_blank', 'noopener');
    } else {
      open.style.display = 'none';
    }
  }

  // Position tooltip (keep in viewport)
  const pad = 12;
  const ttW = 230, ttH = 130;
  let tx = cx + 18, ty = cy - 20;
  if(tx + ttW > window.innerWidth - pad)  tx = cx - ttW - 18;
  if(ty + ttH > window.innerHeight - pad) ty = window.innerHeight - ttH - pad;
  if(ty < pad) ty = pad;

  tt.style.left = tx + 'px';
  tt.style.top  = ty + 'px';
  tt.style.display = 'block';
  tt.style.pointerEvents = node.url && node.url!=='#' ? 'all' : 'none';
  tt.style.borderColor = node.color + '66';
}
function hideNodeTooltip() {
  const tt = el('node-tooltip');
  if(tt && !_hud.selected) tt.style.display = 'none';
}

/* ── LEGEND ───────────────────────────────────────────────── */
function buildLegend() {
  const wrap = el('legend-items');
  if(!wrap) return;
  wrap.innerHTML = '';
  CLUSTERS.forEach(cl => {
    const div = document.createElement('div');
    div.className = 'leg-item';
    div.innerHTML = `${cl.label}<span class="leg-dot" style="background:${cl.color};box-shadow:0 0 4px ${cl.color}88;"></span>`;
    div.addEventListener('click', () => {
      const node = _hud.nodes.find(n=>n.clusterId===cl.id&&n.isCluster);
      if(node) { _hud.selected=node; showNodeTooltip(node, node.x, node.y - 40); }
    });
    wrap.appendChild(div);
  });
}

/* ══════════════════════════════════════════════════════════
   COUNTER
══════════════════════════════════════════════════════════ */
function animCounter(id, target, ms) {
  const e = el(id); if(!e) return;
  const step = target / (ms/16); let v = 0;
  const iv = setInterval(()=>{
    v = Math.min(v+step, target);
    e.textContent = Math.floor(v).toLocaleString();
    if(v>=target) clearInterval(iv);
  }, 16);
}

/* ══════════════════════════════════════════════════════════
   CHAT
══════════════════════════════════════════════════════════ */
function resizeTA(ta) {
  ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
}
function scrollDown() { const m=el('messages'); if(m) m.scrollTop=m.scrollHeight; }
function setTyping(on, label) {
  const row=el('typing'), lbl=el('typing-label'); if(!row) return;
  row.classList.toggle('hidden', !on);
  if(lbl&&label) lbl.textContent=label;
  if(on) scrollDown();
}
function setCsStatus(scanning) {
  const s=el('cs-status'); if(!s) return;
  s.innerHTML='<span class="cs-dot"></span>'+(scanning?'Searching...':'Ready');
  s.classList.toggle('scanning', scanning);
}
function wantsSearch(text) {
  const t=text.toLowerCase();
  return ['find','search','show me','what are','list','best','top','where','latest','who is','how to','compare','vs','tool','resource','website','link'].some(k=>t.includes(k));
}

async function sendMessage(text) {
  if(!text.trim()||_responding) return;
  _responding = true;
  const input=el('chat-input'), sendBtn=el('send-btn');
  if(input){ input.value=''; resizeTA(input); }
  if(sendBtn) sendBtn.disabled=true;
  appendMsg('user', text); scrollDown();
  try {
    let csData=null;
    if(wantsSearch(text)){ setTyping(true,'Searching the web...'); setCsStatus(true); csData=await fetchSearch(text); setCsStatus(false); }
    setTyping(true,'Thinking...');
    const result=await fetchChat(text,csData);
    const reply=result.reply||result.answer||result.text||'(no response)';
    const nodes=result.nodes||csData?.nodes||[];
    _chatHistory.push({role:'user',content:text});
    _chatHistory.push({role:'assistant',content:reply});
    if(_chatHistory.length>40) _chatHistory=_chatHistory.slice(-40);
    if(nodes.length) updateSidebar(nodes);
    setTyping(false); appendMsg('ai',reply,nodes.length?nodes:null); scrollDown();
  } catch(err) {
    setTyping(false); setCsStatus(false);
    appendMsg('ai','⚠ '+err.message); scrollDown();
    console.error('[Cyanix]',err);
  } finally {
    _responding=false; if(sendBtn) sendBtn.disabled=false;
  }
}

async function fetchSearch(query) {
  try {
    const res=await fetch(SEARCH_URL,{method:'POST',headers:EDGE_HEADERS,body:JSON.stringify({query})});
    if(!res.ok) return null;
    return await res.json();
  } catch(e){ return null; }
}

async function fetchChat(message, csData) {
  const res=await fetch(CHAT_URL,{method:'POST',headers:EDGE_HEADERS,body:JSON.stringify({message,history:_chatHistory,...(csData?{cysearch:csData}:{})})});
  if(!res.ok){ const t=await res.text().catch(()=>''); throw new Error(`Chat error ${res.status}: ${t.slice(0,120)}`); }
  return await res.json();
}

function appendMsg(role, text, nodes) {
  const wrap=el('messages'); if(!wrap) return;
  const row=document.createElement('div'); row.className=`msg msg-${role}`;
  const avatar=document.createElement('div'); avatar.className=role==='user'?'avatar user-avatar':'avatar ai-avatar';
  avatar.textContent=role==='user'?'U':'✦';
  const body=document.createElement('div'); body.className='msg-body';
  const author=document.createElement('div'); author.className='msg-author';
  author.textContent=role==='user'?'You':'Cyanix AI';
  const bubble=document.createElement('div'); bubble.className='msg-text';
  bubble.innerHTML=mdToHTML(text);

  if(nodes?.length) {
    const block=document.createElement('div'); block.className='result-block';
    const lbl=document.createElement('div'); lbl.className='result-label';
    lbl.textContent=`✦ ${nodes.length} result${nodes.length>1?'s':''} via Cyanix Search`; block.appendChild(lbl);
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
    .replace(/^#{1,3} (.+)$/gm,'<strong style="color:var(--c);display:block;margin-top:6px">$1</strong>')
    .replace(/^\s*[-*] (.+)$/gm,'<li>$1</li>')
    .replace(/<li>[\s\S]*?<\/li>/g,m=>`<ul>${m}</ul>`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\n\n/g,'</p><p>').replace(/\n/g,'<br/>')
    .replace(/^(.)/,'<p>$1').replace(/$/, '</p>');
}

function renderWelcome() {
  const wrap=el('messages'); if(!wrap) return;
  const row=document.createElement('div'); row.className='msg msg-ai';
  const avatar=document.createElement('div'); avatar.className='avatar ai-avatar'; avatar.textContent='✦';
  const body=document.createElement('div'); body.className='msg-body';
  const author=document.createElement('div'); author.className='msg-author'; author.textContent='Cyanix AI';
  const bubble=document.createElement('div'); bubble.className='msg-text';
  bubble.innerHTML=`
    <p>Hey! 👋 I'm <strong>Cyanix AI</strong> — your intelligent internet assistant.</p>
    <p style="margin-top:8px">I can answer questions, find websites, write code, summarize topics, and more. When you ask me to find something, I search the web automatically.</p>
    <div class="suggest-chips">
      <button class="chip" data-q="What are the best AI tools right now?">🤖 Best AI tools</button>
      <button class="chip" data-q="Show me top web development resources">🌐 Web dev</button>
      <button class="chip" data-q="Find me the latest startup tools">🚀 Startup tools</button>
      <button class="chip" data-q="What are the best design resources?">🎨 Design</button>
    </div>`;
  body.appendChild(author); body.appendChild(bubble);
  row.appendChild(avatar); row.appendChild(body);
  wrap.appendChild(row); bindChips();
}

function bindChips() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', ()=>{ showChat(); setTimeout(()=>sendMessage(chip.dataset.q),120); });
  });
}

function clearChat() {
  const wrap=el('messages'); if(wrap) wrap.innerHTML='';
  _chatHistory=[]; resetSidebar(); renderWelcome();
}

function updateSidebar(nodes) {
  const list=el('nodes-list'); if(!list) return; list.innerHTML='';
  nodes.forEach(node=>{
    const color=CAT_COLORS[node.category]||CAT_COLORS.other;
    const a=document.createElement('a'); a.className='node-card'; a.style.borderColor=color+'33';
    if(node.url&&node.url!=='#'){ a.href=node.url.startsWith('http')?node.url:'https://'+node.url; a.target='_blank'; a.rel='noopener'; }
    a.innerHTML=`<span class="nc-cat" style="color:${color}">${esc((node.category||'other').toUpperCase())}</span><span class="nc-name">${esc(node.label)}</span><span class="nc-desc">${esc(node.description||node.url||'')}</span>`;
    list.appendChild(a);
  });
}

function resetSidebar() {
  const list=el('nodes-list'); if(!list) return;
  list.innerHTML=`<div class="nodes-empty"><div class="empty-icon">◈</div><p class="empty-text">Results appear here when Cyanix searches the web for you.</p></div>`;
}
