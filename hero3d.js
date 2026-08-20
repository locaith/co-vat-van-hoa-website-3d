// Bảo tàng số Di sản Việt Nam — 3D hero story + digital twin viewer (demo vessel, is_demo: true)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const fade = (p, a, b, c, d) => p < a || p > d ? 0 : p < b ? (p - a) / (b - a) : p > c ? 1 - (p - c) / (d - c) : 1;

let MAPS = null;
function makeMaps() {
  if (MAPS) return MAPS;
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#aec7b2'); grad.addColorStop(0.5, '#95b49e'); grad.addColorStop(0.84, '#6f9480'); grad.addColorStop(1, '#4e6f5f');
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(${30 + Math.random() * 50 | 0},${55 + Math.random() * 35 | 0},${45 + Math.random() * 30 | 0},${Math.random() * 0.05})`;
    g.beginPath(); g.arc(Math.random() * 1024, Math.random() * 1024, 0.6 + Math.random() * 2.6, 0, 7); g.fill();
  }
  g.strokeStyle = 'rgba(45,65,55,0.06)'; g.lineWidth = 1;
  for (let i = 0; i < 55; i++) {
    g.beginPath(); let x = Math.random() * 1024, y = Math.random() * 1024; g.moveTo(x, y);
    for (let j = 0; j < 5; j++) { x += (Math.random() - 0.5) * 100; y += (Math.random() - 0.5) * 100; g.lineTo(x, y); }
    g.stroke();
  }
  const bandY = 252, petalW = 73;
  const drawPetals = (ctx, alpha, width) => {
    ctx.strokeStyle = `rgba(35,55,45,${alpha})`; ctx.lineWidth = width; ctx.lineCap = 'round';
    for (let x = -8; x < 1032; x += petalW) {
      ctx.beginPath(); ctx.moveTo(x + 7, bandY + 52); ctx.quadraticCurveTo(x + petalW / 2, bandY - 44, x + petalW - 7, bandY + 52); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + 22, bandY + 50); ctx.quadraticCurveTo(x + petalW / 2, bandY - 16, x + petalW - 22, bandY + 50); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, bandY + 66); ctx.lineTo(1024, bandY + 66); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, bandY - 58); ctx.lineTo(1024, bandY - 58); ctx.stroke();
  };
  drawPetals(g, 0.33, 4.5);
  const map = new THREE.CanvasTexture(c);
  map.wrapS = THREE.RepeatWrapping; map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const b = document.createElement('canvas'); b.width = b.height = 1024; const gb = b.getContext('2d');
  gb.fillStyle = '#808080'; gb.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 5200; i++) {
    gb.fillStyle = `rgba(${Math.random() > 0.5 ? 190 : 60},${Math.random() > 0.5 ? 190 : 60},128,0.05)`;
    gb.fillRect(Math.random() * 1024, Math.random() * 1024, 1.6, 1.6);
  }
  drawPetals(gb, 0.85, 6);
  const bump = new THREE.CanvasTexture(b); bump.wrapS = THREE.RepeatWrapping;
  const r = document.createElement('canvas'); r.width = r.height = 512; const gr = r.getContext('2d');
  gr.fillStyle = '#6f6f6f'; gr.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 2600; i++) {
    const v = 90 + Math.random() * 110 | 0;
    gr.fillStyle = `rgba(${v},${v},${v},0.25)`;
    gr.beginPath(); gr.arc(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 5, 0, 7); gr.fill();
  }
  gr.fillStyle = 'rgba(160,160,160,0.5)'; gr.fillRect(0, 448, 512, 64);
  const rough = new THREE.CanvasTexture(r); rough.wrapS = THREE.RepeatWrapping;
  MAPS = { map, bump, rough };
  return MAPS;
}

function buildVessel() {
  const maps = makeMaps();
  const pts = [[0.001, 0], [0.17, 0], [0.21, 0.02], [0.19, 0.05], [0.225, 0.09], [0.35, 0.24], [0.47, 0.46], [0.505, 0.66], [0.48, 0.84], [0.40, 0.98], [0.27, 1.09], [0.185, 1.15], [0.165, 1.20], [0.19, 1.255], [0.20, 1.28]]
    .map(p => new THREE.Vector2(p[0], p[1]));
  const prof = new THREE.SplineCurve(pts).getPoints(90);
  const geo = new THREE.LatheGeometry(prof, 140);
  const mat = new THREE.MeshPhysicalMaterial({
    map: maps.map, bumpMap: maps.bump, bumpScale: 0.9, roughnessMap: maps.rough,
    roughness: 0.55, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35
  });
  const mesh = new THREE.Mesh(geo, mat); mesh.name = 'vessel';
  const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x9fc2ae, wireframe: true, transparent: true, opacity: 0 }));
  wire.name = 'wire'; wire.visible = false; wire.scale.setScalar(1.001);
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcfe0d2, size: 0.013, transparent: true, opacity: 0 }));
  points.name = 'points'; points.visible = false;
  const sc = document.createElement('canvas'); sc.width = sc.height = 256; const gs = sc.getContext('2d');
  const rg = gs.createRadialGradient(128, 128, 8, 128, 128, 122);
  rg.addColorStop(0, 'rgba(0,0,0,0.6)'); rg.addColorStop(0.5, 'rgba(0,0,0,0.28)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  gs.fillStyle = rg; gs.fillRect(0, 0, 256, 256);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.name = 'shadow'; shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.001;
  const group = new THREE.Group(); group.add(mesh, wire, points, shadow);
  return group;
}

function addStudioLights(scene) {
  const g = new THREE.Group(); g.name = 'studio';
  const key = new THREE.SpotLight(0xffe0b8, 72, 0, Math.PI / 4.6, 0.55, 2); key.position.set(2.6, 3.6, 2.3); key.target.position.set(0, 0.6, 0);
  const rim = new THREE.DirectionalLight(0xc4d8e8, 2.6); rim.position.set(-2.6, 2.4, -2.6);
  const fill = new THREE.DirectionalLight(0xfff2e0, 0.55); fill.position.set(-1.8, 0.8, 2.6);
  const hemi = new THREE.HemisphereLight(0x9a9e93, 0x1c1712, 0.6);
  g.add(key, key.target, rim, fill, hemi); scene.add(g);
  return g;
}
function addRakingLight(scene) {
  const g = new THREE.Group(); g.name = 'raking'; g.visible = false;
  const rak = new THREE.SpotLight(0xffe6c4, 130, 0, Math.PI / 5, 0.4, 2); rak.position.set(3.4, 0.9, 0.4); rak.target.position.set(0, 0.7, 0);
  const amb = new THREE.HemisphereLight(0x6a6e64, 0x14100d, 0.22);
  g.add(rak, rak.target, amb); scene.add(g);
  return g;
}

function makeRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.96;
  return renderer;
}
function fitRenderer(renderer, camera, canvas) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  if (canvas.width !== (w * renderer.getPixelRatio() | 0)) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
}

const HOTSPOT_ANCHORS = [
  { pos: new THREE.Vector3(0.42, 0.86, 0.28), el: 'hs0', label: 'Băng cánh sen khắc chìm' },
  { pos: new THREE.Vector3(-0.05, 1.27, 0.18), el: 'hs1', label: 'Miệng — vết men co' },
  { pos: new THREE.Vector3(0.19, 0.06, 0.12), el: 'hs2', label: 'Chân — men đọng, dấu lò' }
];
function projectToEl(world, camera, hostEl, el, visAlpha) {
  const v = world.clone().project(camera);
  const x = (v.x * 0.5 + 0.5) * hostEl.clientWidth, y = (-v.y * 0.5 + 0.5) * hostEl.clientHeight;
  el.style.transform = `translate(${x}px, ${y}px)`;
  el.style.opacity = v.z < 1 ? visAlpha : 0;
}

let mx = 0, my = 0;
if (!REDUCED) addEventListener('pointermove', e => { mx = (e.clientX / innerWidth - 0.5); my = (e.clientY / innerHeight - 0.5); }, { passive: true });

// ---------------- HERO STORY ----------------
let story = null; // { canvas, dispose }
function initStory() {
  const wrap = document.getElementById('story');
  const canvas = document.getElementById('stage3d');
  if (!wrap || !canvas) return;
  if (story) { if (story.canvas === canvas && canvas.isConnected) return; story.dispose(); story = null; }
  let renderer;
  try { renderer = makeRenderer(canvas); } catch (e) { return storyFallback(wrap); }
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x181310, 0.055);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.04, 30);
  const vessel = buildVessel();
  scene.add(vessel);
  addStudioLights(scene);
  const mesh = vessel.getObjectByName('vessel'), wire = vessel.getObjectByName('wire'), pointsObj = vessel.getObjectByName('points'), shadow = vessel.getObjectByName('shadow');

  const K = [
    { p: 0.00, cam: [0.55, 0.98, 3.15], tgt: [-0.42, 0.64, 0], rot: 0.0 },
    { p: 0.24, cam: [0.35, 0.92, 2.30], tgt: [-0.12, 0.70, 0], rot: 0.35 },
    { p: 0.47, cam: [0.58, 0.98, 1.80], tgt: [0.02, 0.80, 0], rot: 1.05 },
    { p: 0.70, cam: [0.30, 0.88, 0.74], tgt: [0.0, 0.88, 0], rot: 1.05 },
    { p: 0.90, cam: [0.0, 0.95, 2.75], tgt: [0, 0.60, 0], rot: 1.55 },
    { p: 1.001, cam: [0.0, 0.98, 2.95], tgt: [0, 0.60, 0], rot: 1.75 }
  ];
  const ids = ['ov-hero', 'ov-meta', 'ov-macro', 'ov-scan', 'ov-hint', 'hs0', 'hs1', 'hs2'];
  const el = {}; ids.forEach(i => el[i] = document.getElementById(i));
  const stageEl = wrap.querySelector('[data-stage]') || wrap;

  let tx = 0, ty = 0, idle = 0, raf = 0, disposed = false;
  const getP = () => {
    const r = wrap.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  };
  const lerp3 = (a, b, t, out) => { out.set(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); };
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3();

  function frame() {
    if (!running || disposed) return;
    raf = requestAnimationFrame(frame);
    if (!canvas.isConnected) { dispose(); story = null; setTimeout(initAll, 120); return; }
    if (!inView()) return;
    fitRenderer(renderer, camera, canvas);
    const p = window.__forceP != null ? window.__forceP : getP();
    let i = 0; while (i < K.length - 2 && p > K[i + 1].p) i++;
    const a = K[i], b = K[i + 1];
    const t = sstep(a.p, b.p, p);
    lerp3(a.cam, b.cam, t, camPos);
    lerp3(a.tgt, b.tgt, t, camTgt);
    tx += (mx - tx) * 0.04; ty += (my - ty) * 0.04;
    camPos.x += tx * 0.09; camPos.y -= ty * 0.06;
    camera.position.copy(camPos); camera.lookAt(camTgt);
    if (!REDUCED) idle += 0.0016;
    vessel.rotation.y = a.rot + (b.rot - a.rot) * t + idle * 0.25;
    const meshOp = 1 - sstep(0.80, 0.92, p);
    mesh.material.opacity = meshOp; mesh.material.transparent = meshOp < 1; mesh.visible = meshOp > 0.02;
    shadow.material.opacity = meshOp;
    const wo = fade(p, 0.79, 0.87, 0.97, 1.01) * 0.55;
    wire.material.opacity = wo; wire.visible = wo > 0.01;
    const po = sstep(0.86, 0.97, p);
    pointsObj.material.opacity = po; pointsObj.visible = po > 0.01;
    const set = (n, o, dy) => { const e = el[n]; if (!e) return; e.style.opacity = o.toFixed(3); e.style.transform = `translateY(${(dy * (1 - o)).toFixed(1)}px)`; e.style.pointerEvents = o > 0.5 ? 'auto' : 'none'; };
    set('ov-hero', fade(p, -1, 0, 0.06, 0.16), -26);
    set('ov-meta', fade(p, 0.20, 0.28, 0.40, 0.48), 26);
    set('ov-macro', fade(p, 0.56, 0.64, 0.76, 0.83), 26);
    set('ov-scan', fade(p, 0.85, 0.93, 1.1, 1.2), 26);
    if (el['ov-hint']) el['ov-hint'].style.opacity = fade(p, -1, 0, 0.02, 0.06);
    const hsA = fade(p, 0.42, 0.48, 0.56, 0.62);
    HOTSPOT_ANCHORS.forEach((h, n) => {
      const hse = el[h.el]; if (!hse) return;
      projectToEl(h.pos.clone().applyMatrix4(vessel.matrixWorld), camera, stageEl, hse, hsA);
    });
    window.__dbg = { p, running, t: Date.now() };
    renderer.render(scene, camera);
  }
  let running = true;
  function inView() { const r = wrap.getBoundingClientRect(); return r.bottom > -300 && r.top < innerHeight + 300; }
  function dispose() { disposed = true; running = false; cancelAnimationFrame(raf); renderer.dispose(); }
  frame();
  story = { canvas, dispose };
}
function storyFallback(wrap) {
  wrap.style.height = '100vh';
  const hero = document.getElementById('ov-hero');
  if (hero) { hero.style.opacity = '1'; hero.style.pointerEvents = 'auto'; }
  ['ov-meta', 'ov-macro', 'ov-scan', 'hs0', 'hs1', 'hs2'].forEach(id => { const e = document.getElementById(id); if (e) e.style.display = 'none'; });
  const c = document.getElementById('stage3d'); if (c) c.style.display = 'none';
}

// ---------------- DIGITAL TWIN ----------------
let twin = null; // { canvas, api, dispose }
// #twin-overlay is rendered by the DC runtime through React. Writing our own nodes into
// it makes React and this module fight over the same children — React then throws
// NotFoundError on removeChild and the whole page stops rendering. So the labels live in
// a layer we own, appended to <body>, kept over the canvas box on every frame.
function twinLayer() {
  let l = document.getElementById('tw-layer');
  if (!l) {
    l = document.createElement('div');
    l.id = 'tw-layer';
    l.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;pointer-events:none;z-index:1';
    document.body.appendChild(l);
  }
  return l;
}
function initTwin() {
  const canvas = document.getElementById('twin3d');
  const host = document.getElementById('twin-overlay');
  if (!canvas || !host) return;
  if (twin) { if (twin.canvas === canvas && canvas.isConnected) return; twin.dispose(); twin = null; }
  let renderer;
  try { renderer = makeRenderer(canvas); } catch (e) {
    canvas.parentElement.insertAdjacentHTML('beforeend', '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#B8AB97;font-size:13px;text-align:center;padding:30px">Trình duyệt không hỗ trợ WebGL — trình xem 3D không khả dụng.</div>');
    return;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.04, 30);
  camera.position.set(1.4, 1.15, 2.6);
  const vessel = buildVessel();
  scene.add(vessel);
  const studio = addStudioLights(scene);
  const raking = addRakingLight(scene);
  const grid = new THREE.GridHelper(3, 30, 0x55705F, 0x3a332b);
  grid.material.transparent = true; grid.material.opacity = 0.35; grid.visible = false; scene.add(grid);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.06;
  controls.minDistance = 0.5; controls.maxDistance = 4.6;
  controls.target.set(0, 0.62, 0); controls.saveState();
  const mesh = vessel.getObjectByName('vessel'), wire = vessel.getObjectByName('wire'), pointsObj = vessel.getObjectByName('points');
  const st = { measure: false, hotspots: false };
  const overlay = twinLayer();
  overlay.innerHTML =
    '<div id="tw-meas" style="position:absolute;left:0;top:0;display:none;pointer-events:none">' +
    '<div id="tw-meas-line" style="position:absolute;width:1px;background:rgba(201,214,198,.75)"></div>' +
    '<div id="tw-meas-lbl" style="position:absolute;font:11px \'Be Vietnam Pro\',sans-serif;color:#C9D6C6;letter-spacing:.06em;white-space:nowrap;background:rgba(24,19,16,.75);padding:3px 8px;border-radius:2px">≈ 28,4 cm · demo</div></div>';
  const twHs = HOTSPOT_ANCHORS.map(h => {
    const d = document.createElement('div');
    d.style.cssText = 'position:absolute;left:0;top:0;opacity:0;pointer-events:none;display:flex;align-items:center;gap:7px;margin:-7px 0 0 -7px';
    d.innerHTML = '<span style="width:13px;height:13px;border:1.5px solid #A98E4B;border-radius:50%;background:rgba(169,142,75,.3);flex-shrink:0"></span><span style="font:11px \'Be Vietnam Pro\',sans-serif;color:#E8DFCE;background:rgba(24,19,16,.8);border:1px solid rgba(169,142,75,.4);padding:4px 9px;border-radius:2px;white-space:nowrap">' + h.label + '</span>';
    overlay.appendChild(d); return d;
  });
  const topV = new THREE.Vector3(0, 1.28, 0), botV = new THREE.Vector3(0, 0, 0);
  let disposed = false, raf = 0;
  function frame() {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (!canvas.isConnected) { dispose(); twin = null; setTimeout(initAll, 120); return; }
    const tr = canvas.getBoundingClientRect();
    if (tr.bottom < -300 || tr.top > innerHeight + 300) { overlay.style.display = 'none'; return; }
    overlay.style.display = 'block';
    overlay.style.left = tr.left + 'px'; overlay.style.top = tr.top + 'px';
    overlay.style.width = tr.width + 'px'; overlay.style.height = tr.height + 'px';
    fitRenderer(renderer, camera, canvas);
    controls.update();
    if (!REDUCED) vessel.rotation.y += 0.0009;
    if (st.hotspots) HOTSPOT_ANCHORS.forEach((h, n) => projectToEl(h.pos.clone().applyMatrix4(vessel.matrixWorld), camera, canvas, twHs[n], 1));
    else twHs.forEach(d => d.style.opacity = 0);
    const meas = overlay.querySelector('#tw-meas');
    if (st.measure && meas) {
      meas.style.display = 'block';
      const pt = topV.clone().project(camera), pb = botV.clone().project(camera);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const x = (Math.max(pt.x, pb.x) * 0.5 + 0.5) * w + 34;
      const y1 = (-pt.y * 0.5 + 0.5) * h, y2 = (-pb.y * 0.5 + 0.5) * h;
      const line = overlay.querySelector('#tw-meas-line'), lbl = overlay.querySelector('#tw-meas-lbl');
      line.style.left = x + 'px'; line.style.top = Math.min(y1, y2) + 'px'; line.style.height = Math.abs(y2 - y1) + 'px';
      lbl.style.left = (x + 10) + 'px'; lbl.style.top = ((y1 + y2) / 2 - 10) + 'px';
    } else if (meas) meas.style.display = 'none';
    renderer.render(scene, camera);
  }
  function dispose() { disposed = true; cancelAnimationFrame(raf); controls.dispose(); renderer.dispose(); overlay.remove(); }
  frame();
  twin = {
    canvas, dispose,
    api: {
      setLight(mode) { studio.visible = mode === 'studio'; raking.visible = mode === 'raking'; },
      setView(mode) {
        mesh.visible = mode !== 'wire';
        mesh.material.transparent = mode === 'research'; mesh.material.opacity = mode === 'research' ? 0.42 : 1;
        wire.visible = mode !== 'original'; wire.material.opacity = mode === 'original' ? 0 : 0.55;
        pointsObj.visible = mode === 'research'; pointsObj.material.opacity = mode === 'research' ? 0.9 : 0;
        grid.visible = mode === 'research';
      },
      measure(on) { st.measure = on; },
      hotspots(on) { st.hotspots = on; },
      reset() { controls.reset(); }
    }
  };
}

window.__heritage3d = {
  twin: {
    setLight: m => twin && twin.api.setLight(m),
    setView: m => twin && twin.api.setView(m),
    measure: v => twin && twin.api.measure(v),
    hotspots: v => twin && twin.api.hotspots(v),
    reset: () => twin && twin.api.reset()
  }
};

function initAll() { initStory(); initTwin(); }
addEventListener('heritage3d:mount', initAll);
initAll();
// Health check: DC hydration can replace nodes after init; re-bind whenever canvases go stale.
setInterval(() => {
  if (!story || !story.canvas.isConnected || !twin || !twin.canvas.isConnected) initAll();
}, 700);
