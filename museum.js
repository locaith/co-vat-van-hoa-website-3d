// MuseumApp — one WebGL scene: architecture, lighting, first-person controls, exhibits, labels,
// inspection (reuses artifacts3d modal), timeline, map, guided tour, AI kiosk, audio hooks.
// REAL SCAN TODO: when an artifact record gains model_url (.glb), load it in place of buildArtifact().
import * as THREE from 'three';
import { buildArtifact } from './artifacts3d.js';

const $ = id => document.getElementById(id);
const M = window.DS_MUSEUM, DATA = () => window.DS_ARTIFACTS || [];
const rec = id => DATA().find(a => a.id === id);
const RED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TOUCH = 'ontouchstart' in window;
const lang = () => (window.DS_I18N ? window.DS_I18N.lang : 'vi');

const T = {
  vi: { kicker: 'Bảo tàng số di sản Việt Nam · Bản demo', title: 'Bước vào ký ức\ncủa Việt Nam.', sub: 'Hiện vật. Tri thức. Bằng chứng. Ký ức.', demo: 'Toàn bộ hiện vật trong bảo tàng là bản thể số minh họa (demo) — kiến trúc sẵn sàng thay bằng hiện vật quét thật.', back: '← Trở về website', free: 'Tham quan tự do', tour: 'Tham quan có hướng dẫn', exit: 'Thoát', map: 'Bản đồ', soundOn: 'Bật âm thanh', soundOff: 'Tắt âm thanh', soundNA: 'Không phát được âm thanh', inspect: 'Xem hiện vật', pressE: ' — nhấn E', mapTitle: 'Bản đồ bảo tàng', mapHint: 'Chạm tên phòng để di chuyển nhanh tới đó', close: 'Đóng', resume: 'Tiếp tục tham quan', audio: 'Âm thanh', exitSite: 'Trở về website', kioskOpen: 'Mở bản thể số + hồ sơ', hints: TOUCH ? 'Joystick trái — di chuyển · Kéo phải — quan sát · Chạm hiện vật — xem' : 'WASD — Di chuyển · Chuột / kéo chuột — Quan sát · E hoặc click — Tương tác · ESC — Menu', stop: 'Điểm dừng', next: 'Tiếp tục →', quit: 'Kết thúc — tự do khám phá', hlight: 'Đã tô sáng các hiện vật thời ', kq: 'Tìm cho tôi một bình gốm men ngọc thời Trần.', ks: ['Đang hiểu câu hỏi', 'Đang tìm dữ liệu', 'Đang đối chiếu nguồn', 'Đang chuẩn bị bản thể số', 'Hoàn tất'] },
  en: { kicker: 'Vietnam Heritage Digital Museum · Demo build', title: "Step into Vietnam's\nliving memory.", sub: 'Objects. Knowledge. Evidence. Memory.', demo: 'Every object in this museum is an illustrative digital twin (demo) — the architecture is ready for real scanned artifacts.', back: '← Back to website', free: 'Free explore', tour: 'Guided tour', exit: 'Exit', map: 'Map', soundOn: 'Enable sound', soundOff: 'Mute sound', soundNA: 'Audio unavailable', inspect: 'Inspect artifact', pressE: ' — press E', mapTitle: 'Museum map', mapHint: 'Tap a room name to travel there', close: 'Close', resume: 'Resume visit', audio: 'Audio', exitSite: 'Exit to website', kioskOpen: 'Open digital twin + record', hints: TOUCH ? 'Left joystick — move · Drag right — look · Tap artifact — inspect' : 'WASD — Move · Mouse / drag — Look · E or click — Interact · ESC — Menu', stop: 'Stop', next: 'Continue →', quit: 'End tour — explore freely', hlight: 'Highlighted objects from the ', kq: 'Find me a celadon ceramic jar from the Trần period.', ks: ['Understanding the question', 'Searching the database', 'Cross-checking sources', 'Preparing the digital twin', 'Done'] }
};
const t = k => (T[lang()] || T.vi)[k];
function applyMT() {
  document.querySelectorAll('[data-mt]').forEach(el => { const v = t(el.getAttribute('data-mt')); if (v) el.innerHTML = v.replace(/\n/g, '<br>'); });
  $('hints').textContent = t('hints');
}

// ---------- RENDERER ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: $('stage'), antialias: true, preserveDrawingBuffer: true });
} catch (e) { $('loader').style.display = 'none'; $('nogl').style.display = 'flex'; throw e; }
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d0a08);
scene.fog = new THREE.Fog(0x120e0b, 30, 80);
const cam = new THREE.PerspectiveCamera(66, 1, 0.05, 120);
const EYE = 1.62;

// ---------- MATERIALS ----------
const mFloor = new THREE.MeshStandardMaterial({ color: 0x37302a, roughness: 0.85, metalness: 0.05 });
const mWall = new THREE.MeshStandardMaterial({ color: 0xd9cfba, roughness: 0.95 });
const mWood = new THREE.MeshStandardMaterial({ color: 0x2e2118, roughness: 0.7 });
const mBronze = new THREE.MeshStandardMaterial({ color: 0x8a6e3f, roughness: 0.4, metalness: 0.7 });
const mCeil = new THREE.MeshStandardMaterial({ color: 0x1d1813, roughness: 1 });
const mPlinth = new THREE.MeshStandardMaterial({ color: 0x3a332b, roughness: 0.8 });
const mGlass = new THREE.MeshPhysicalMaterial({ color: 0xdfe8e4, transparent: true, opacity: 0.09, roughness: 0.05, metalness: 0, side: THREE.DoubleSide, depthWrite: false });

// ---------- ARCHITECTURE ----------
const colliders = []; // {minx,maxx,minz,maxz}
function solid(cx, cz, sx, sz, sy, mat, y) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  m.position.set(cx, (y || 0) + sy / 2, cz);
  scene.add(m);
  colliders.push({ minx: cx - sx / 2 - 0.3, maxx: cx + sx / 2 + 0.3, minz: cz - sz / 2 - 0.3, maxz: cz + sz / 2 + 0.3 });
  return m;
}
function wallX(x, z1, z2, h) { solid(x, (z1 + z2) / 2, 0.3, Math.abs(z2 - z1), h, mWall); const w = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.9, Math.abs(z2 - z1)), mWood); w.position.set(x, 0.45, (z1 + z2) / 2); scene.add(w); }
function wallZ(z, x1, x2, h) { solid((x1 + x2) / 2, z, Math.abs(x2 - x1), 0.3, h, mWall); const w = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(x2 - x1), 0.9, 0.34), mWood); w.position.set((x1 + x2) / 2, 0.45, z); scene.add(w); }
function room(x1, x2, z1, z2, h) {
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(x2 - x1, z2 - z1), mFloor);
  fl.rotation.x = -Math.PI / 2; fl.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2); fl.receiveShadow = true; scene.add(fl);
  const ce = new THREE.Mesh(new THREE.PlaneGeometry(x2 - x1, z2 - z1), mCeil);
  ce.rotation.x = Math.PI / 2; ce.position.set((x1 + x2) / 2, h, (z1 + z2) / 2); scene.add(ce);
}
// hall
room(-9, 9, -8, 8, 7);
wallZ(8, -9, 9, 7); wallZ(-8, -9, -2, 7); wallZ(-8, 2, 9, 7); wallX(-9, -8, 8, 7); wallX(9, -8, 8, 7);
// corridor
room(-2, 2, -16, -8, 3.6);
wallX(-2, -16, -8, 3.6); wallX(2, -16, -8, 3.6);
// ceramics gallery
room(-11, 11, -40, -16, 5.2);
wallZ(-16, -11, -2, 5.2); wallZ(-16, 2, 11, 5.2); wallZ(-40, -11, -2, 5.2); wallZ(-40, 2, 11, 5.2);
wallX(-11, -40, -16, 5.2); wallX(11, -40, -16, 5.2);
// digital gallery
room(-7, 7, -54, -40, 4.6);
wallZ(-54, -7, 7, 4.6); wallX(-7, -54, -40, 4.6); wallX(7, -54, -40, 4.6);
// door frames (bronze lintels)
[[0, -8, 4, 3.6], [0, -16, 4, 3.6], [0, -40, 4, 3.4]].forEach(([x, z, w, h]) => {
  const l = new THREE.Mesh(new THREE.BoxGeometry(w + 0.6, 0.22, 0.5), mBronze); l.position.set(x, h, z); scene.add(l);
});
// --- skylights: recessed ceiling windows casting daylight shafts ---
function skylight(x, z, w, d, ceilY, inten) {
  const fr = new THREE.Mesh(new THREE.BoxGeometry(w + 0.55, 0.16, d + 0.55), mBronze);
  fr.position.set(x, ceilY - 0.04, z); scene.add(fr);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ color: 0xfdf4e0 }));
  glow.rotation.x = Math.PI / 2; glow.position.set(x, ceilY - 0.1, z); scene.add(glow);
  const s = new THREE.SpotLight(0xfff1d6, inten, 0, Math.PI / 3.1, 0.75, 1.55);
  s.position.set(x, ceilY + 2.6, z); s.target.position.set(x, 0, z); scene.add(s, s.target);
  const shaft = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.8, ceilY - 0.1, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xffeccb, transparent: true, opacity: 0.045, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
  shaft.position.set(x, (ceilY - 0.1) / 2, z); scene.add(shaft);
}
skylight(0, 0, 5, 5, 7, 60);
skylight(0, -22.5, 5.5, 6.5, 5.2, 46);
skylight(0, -33.5, 5.5, 6.5, 5.2, 46);
skylight(0, -47, 4, 4, 4.6, 34);
// --- entrance portal: vermilion lacquer columns + warm daylight doorway ---
const mLacquer = new THREE.MeshStandardMaterial({ color: 0x6e2a1e, roughness: 0.32 });
[-2.35, 2.35].forEach(x => {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, 5.3, 22), mLacquer);
  c.position.set(x, 2.65, 7.55); scene.add(c);
  colliders.push({ minx: x - 0.45, maxx: x + 0.45, minz: 7.1, maxz: 8 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.24, 22), mPlinth);
  base.position.set(x, 0.12, 7.55); scene.add(base);
});
const lint = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.5, 0.75), mBronze);
lint.position.set(0, 5.45, 7.55); scene.add(lint);
const doorGlow = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.0), new THREE.MeshBasicMaterial({ color: 0xffe7bd }));
doorGlow.rotation.y = Math.PI; doorGlow.position.set(0, 2.6, 7.93); scene.add(doorGlow);
const doorSpot = new THREE.SpotLight(0xffe2b2, 30, 0, Math.PI / 3.4, 0.85, 1.65);
doorSpot.position.set(0, 4.6, 7.4); doorSpot.target.position.set(0, 0.4, 1.5); scene.add(doorSpot, doorSpot.target);
// hall corner lacquer columns for architectural rhythm
[[-7.6, -7.2], [7.6, -7.2], [-7.6, 7.2], [7.6, 7.2]].forEach(([x, z]) => {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.29, 7, 20), mLacquer);
  c.position.set(x, 3.5, z); scene.add(c);
  colliders.push({ minx: x - 0.5, maxx: x + 0.5, minz: z - 0.5, maxz: z + 0.5 });
});
// warm wood skirting tone in gallery: celadon accent band on end wall
const accent = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 2.6), new THREE.MeshStandardMaterial({ color: 0x5c7466, roughness: 0.9 }));
accent.position.set(0, 2.2, -39.82); scene.add(accent);

// ---------- TEXT PANELS (canvas) ----------
function textPanel(lines, w, h, opts) {
  const o = opts || {}, cv = document.createElement('canvas');
  cv.width = 1024; cv.height = Math.round(1024 * h / w);
  const g = cv.getContext('2d');
  g.fillStyle = o.bg || 'rgba(0,0,0,0)'; g.fillRect(0, 0, cv.width, cv.height);
  let y = o.pad || 90;
  lines.forEach(L => {
    g.font = L.font; g.fillStyle = L.color; g.textAlign = o.align || 'center';
    const x = o.align === 'left' ? 70 : cv.width / 2;
    g.fillText(L.text, x, y); y += L.gap || 90;
  });
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  mesh.userData.redraw = (newLines) => {
    g.clearRect(0, 0, cv.width, cv.height);
    if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, cv.width, cv.height); }
    let yy = o.pad || 90;
    newLines.forEach(L => { g.font = L.font; g.fillStyle = L.color; g.textAlign = o.align || 'center'; g.fillText(L.text, o.align === 'left' ? 70 : cv.width / 2, yy); yy += L.gap || 90; });
    tex.needsUpdate = true;
  };
  return mesh;
}
// hall title wall
const serif = 'Cormorant Garamond,serif', sans = 'Be Vietnam Pro,sans-serif';
function hallLines() {
  return [
    { text: 'DI SẢN VIỆT', font: `500 150px ${serif}`, color: '#efe7d5', gap: 130 },
    { text: lang() === 'vi' ? 'BẢO TÀNG SỐ' : 'DIGITAL MUSEUM', font: `44px ${sans}`, color: '#a98e4b', gap: 120 },
    { text: lang() === 'vi' ? 'Hiện vật. Tri thức. Bằng chứng. Ký ức.' : 'Objects. Knowledge. Evidence. Memory.', font: `34px ${sans}`, color: '#8f8574', gap: 0 }
  ];
}
const hallTitle = textPanel(hallLines(), 9, 3.6, { pad: 170 });
hallTitle.position.set(0, 4.1, -7.8); scene.add(hallTitle);
// directional signs
function signLines(viTxt, enTxt, arrow) {
  return [{ text: arrow + '  ' + viTxt, font: `600 52px ${sans}`, color: '#e8dfce', gap: 78 }, { text: enTxt, font: `38px ${sans}`, color: '#8f8574', gap: 0 }];
}
const sign1 = textPanel(signLines('Phòng Gốm Việt', 'Ceramics Gallery', '↓'), 3.4, 0.85, { pad: 60 });
sign1.position.set(3.2, 2.6, -7.8); scene.add(sign1);
// zone labels
M.zones.forEach(z => {
  const p = textPanel([{ text: z.vi, font: `500 120px ${serif}`, color: '#d9cfb9', gap: 105 }, { text: z.en, font: `44px ${sans}`, color: '#7d7361', gap: 0 }], 3, 1.15, { pad: 130 });
  if (z.wall === 'west') { p.position.set(-10.8, 3.6, z.z); p.rotation.y = Math.PI / 2; }
  else if (z.wall === 'east') { p.position.set(10.8, 3.6, z.z); p.rotation.y = -Math.PI / 2; }
  else { p.position.set(0, 4.4, -39.8); }
  p.userData.zone = z; scene.add(p);
});
// digital gallery headline
const digiTitle = textPanel([
  { text: lang() === 'vi' ? 'Không chỉ số hóa hình dạng.' : 'We do not digitize form alone.', font: `500 92px ${serif}`, color: '#efe7d5', gap: 105 },
  { text: lang() === 'vi' ? 'Chúng tôi số hóa tri thức bao quanh hiện vật.' : 'We preserve the knowledge surrounding the object.', font: `500 92px ${serif}`, color: '#a98e4b', gap: 0 }
], 10, 2, { pad: 105 });
digiTitle.position.set(0, 3.2, -53.8); scene.add(digiTitle);

// ---------- LIGHTING ----------
scene.add(new THREE.HemisphereLight(0x9f978a, 0x1a1512, 1.1));
const fill = new THREE.DirectionalLight(0xfff0dd, 0.5); fill.position.set(3, 8, 2); scene.add(fill);
function spot(x, y, z, tx, ty, tz, intensity, shadow) {
  const s = new THREE.SpotLight(0xffe2bd, intensity, 0, Math.PI / 5.5, 0.6, 1.9);
  s.position.set(x, y, z);
  s.target.position.set(tx, ty, tz);
  if (shadow && !TOUCH) { s.castShadow = true; s.shadow.mapSize.set(512, 512); s.shadow.bias = -0.0004; }
  scene.add(s, s.target);
  return s;
}
spot(0, 6.6, 1.5, 0, 1, -2.5, 60, true); // hall hero (one of only two shadow lights)
spot(0, 6.4, -7, 0, 3.8, -7.9, 34); // title wall wash
spot(0, 3.4, -12, 0, 1.4, -12, 20); // corridor
spot(0, 4.9, -46, 0, 3, -53.8, 38); // digital headline
spot(-6, 5.0, -26, -9.5, 1.2, -27, 30); // west wall wash
spot(6, 5.0, -29, 9.5, 1.2, -29, 30); // east wall wash
spot(-2.2, 4.2, -45.4, -2.2, 1.2, -47, 20); // twin station

// ---------- DISPLAYS + ARTIFACTS ----------
const exhibits = []; // {group, id, pos:Vector3, labelMesh, baseY}
function display(type, x, z, rotY) {
  const g = new THREE.Group();
  let topY = 1.0;
  if (type === 'plinth') {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.0, 0.85), mPlinth); p.position.y = 0.5; p.castShadow = true; g.add(p);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.92), mBronze); cap.position.y = 1.02; g.add(cap);
    topY = 1.05;
  } else if (type === 'vitrine') {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.9, 0.95), mWood); p.position.y = 0.45; p.castShadow = true; g.add(p);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.05, 0.9), mGlass); glass.position.y = 1.45; g.add(glass);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 0.95), mBronze); top.position.y = 2.0; g.add(top);
    topY = 0.92;
  } else if (type === 'niche') {
    const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 0.25), mWood); back.position.y = 1.55; back.position.z = -0.35; g.add(back);
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.7), mBronze); shelf.position.y = 1.05; g.add(shelf);
    topY = 1.09;
  } else { // table
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.07, 1.0), mWood); top.position.y = 0.85; g.add(top);
    [-0.8, 0.8].forEach(dx => { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.8), mPlinth); leg.position.set(dx, 0.42, 0); g.add(leg); });
    topY = 0.89;
  }
  g.position.set(x, 0, z); g.rotation.y = rotY || 0;
  scene.add(g);
  colliders.push({ minx: x - 0.75, maxx: x + 0.75, minz: z - 0.75, maxz: z + 0.75 });
  return topY;
}
function labelLines(a) {
  const en = lang() === 'en';
  return [
    { text: (en ? a.title_en : a.title).toUpperCase().slice(0, 34), font: `600 46px ${sans}`, color: '#2b241c', gap: 62 },
    { text: en ? a.title : a.title_en, font: `italic 40px ${serif}`, color: '#5a5142', gap: 66 },
    { text: a.dating + (en ? ' · Demo record' : ' · Hồ sơ minh họa'), font: `36px ${sans}`, color: '#5a5142', gap: 58 },
    { text: 'ID: ' + a.id + ' · is_demo', font: `32px ${sans}`, color: '#8a6e3f', gap: 0 }
  ];
}
function placeArtifact(pl) {
  const a = rec(pl.artifactId); if (!a) return;
  const topY = display(pl.displayType, pl.pos[0], pl.pos[2], pl.rotY);
  // REAL SCAN TODO: if (a.model_url) { GLTFLoader... } else:
  const obj = buildArtifact(a);
  obj.scale.setScalar(pl.scale || 0.7);
  obj.position.set(pl.pos[0], topY, pl.pos[2]);
  obj.traverse(o => { if (o.isMesh && o.name !== 'shadow') o.castShadow = !TOUCH; });
  scene.add(obj);
  // exhibit spotlight — hero profile only (shader cost: keep total light count low)
  if (pl.lightingProfile === 'hero') {
    const lx = pl.pos[0] * 0.75, lz = pl.pos[2] + (pl.pos[0] === 0 ? 1.6 : 0);
    spot(lx, 4.6, lz, pl.pos[0], topY + 0.5, pl.pos[2], 46, pl.pos[2] === -28);
  }
  // label stand
  const lab = textPanel(labelLines(a), 0.52, 0.34, { bg: '#e9e2d2', pad: 74, align: 'left' });
  const off = pl.rotY ? [Math.sin(pl.rotY) * 0.1 + (pl.rotY > 0 ? 0.75 : -0.75) * 0, 0, 0.78] : [0.72, 0, 0.55];
  lab.position.set(pl.pos[0] + (pl.rotY ? (pl.rotY > 0 ? 0.75 : -0.75) : 0.72), 1.02, pl.pos[2] + (pl.rotY ? 0.75 : 0.55));
  lab.rotation.x = -0.5; lab.rotation.y = pl.rotY || 0;
  scene.add(lab);
  exhibits.push({ obj, a, pos: new THREE.Vector3(pl.pos[0], topY + 0.5, pl.pos[2]), lab, period: a.period });
}
M.placements.forEach(placeArtifact);

// digital gallery twin station: object + wireframe + node panel
(function () {
  const a = rec('DS-007'); if (!a) return;
  const topY = display('table', -2.2, -47, 0);
  const o1 = buildArtifact(a); o1.scale.setScalar(0.55); o1.position.set(-2.9, topY, -47); scene.add(o1);
  const o2 = buildArtifact(a); o2.scale.setScalar(0.55); o2.position.set(-1.5, topY, -47);
  o2.traverse(m => { if (m.isMesh && m.name !== 'shadow') { m.material = m.material.clone(); m.material.wireframe = true; m.material.color.set(0x8fae9c); } });
  scene.add(o2);
  const nodes = textPanel([
    { text: lang() === 'vi' ? 'HIỆN VẬT → DỮ LIỆU → TRI THỨC' : 'OBJECT → DATA → KNOWLEDGE', font: `600 54px ${sans}`, color: '#a98e4b', gap: 80 },
    { text: lang() === 'vi' ? 'Ảnh · Quét 3D · Định danh số · Bằng chứng · Chuyên gia · AI' : 'Photo · 3D scan · Digital ID · Evidence · Experts · AI', font: `40px ${sans}`, color: '#c9bfa9', gap: 0 }
  ], 5, 1, { pad: 95 });
  nodes.position.set(-2.2, 2.4, -48.9); scene.add(nodes);
})();

// AI kiosk (physical)
const kioskPos = new THREE.Vector3(2.6, 1.0, -47);
(function () {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.95, 0.7), mWood); base.position.y = 0.48; g.add(base);
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.75, 0.05), new THREE.MeshStandardMaterial({ color: 0x151b18, roughness: 0.3, emissive: 0x22302a, emissiveIntensity: 0.8 }));
  screen.position.set(0, 1.35, -0.1); screen.rotation.x = -0.28; g.add(screen);
  const st = textPanel([{ text: lang() === 'vi' ? 'TRỢ LÝ TRI THỨC DI SẢN' : 'HERITAGE KNOWLEDGE ASSISTANT', font: `600 58px ${sans}`, color: '#8fae9c', gap: 80 }, { text: lang() === 'vi' ? 'Chạm để hỏi thử' : 'Tap to try a question', font: `44px ${sans}`, color: '#6f7d75', gap: 0 }], 1.16, 0.6, { pad: 120 });
  st.position.set(0, 1.37, -0.06); st.rotation.x = -0.28; g.add(st);
  g.position.set(2.6, 0, -47);
  scene.add(g);
  colliders.push({ minx: 1.8, maxx: 3.4, minz: -47.7, maxz: -46.3 });
})();

// timeline plaques
const plaques = [];
M.timeline.forEach((p, i) => {
  const pk = textPanel([{ text: p, font: `500 110px ${serif}`, color: '#e2d8c2', gap: 95 }, { text: lang() === 'vi' ? 'chạm để tô sáng hiện vật' : 'tap to highlight objects', font: `30px ${sans}`, color: '#6f6350', gap: 0 }], 1.5, 0.75, { pad: 115 });
  pk.position.set(-1.8, 1.75, -9.5 - i * 1.15); pk.rotation.y = Math.PI / 2;
  pk.userData.period = p; scene.add(pk); plaques.push(pk);
});

// ---------- PLAYER ----------
const player = { x: 0, z: 5.5, yaw: Math.PI, pitch: 0, vx: 0, vz: 0 };
// yaw PI => facing -z? forward = (sin(yaw), cos(yaw))*-1... define forward = (-sin(yaw), -cos(yaw)) with yaw 0 facing -z. Start yaw 0.
player.yaw = 0;
function forward() { return [-Math.sin(player.yaw), -Math.cos(player.yaw)]; }
const keys = {};
// Entry dolly and guided-tour moves drive the camera themselves. Only one may run, and the
// player taking control must end it — otherwise it keeps writing yaw/x/z underneath them.
let camAnim = null;
function stopCamAnim() { if (camAnim) { cancelAnimationFrame(camAnim); camAnim = null; } }
const MOVE_KEYS = /^(KeyW|KeyA|KeyS|KeyD|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/;
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (mode === 'free' && MOVE_KEYS.test(e.code)) stopCamAnim();
  if (e.code === 'KeyE') tryInteract();
});
addEventListener('keyup', e => { keys[e.code] = false; });
const canvas = $('stage');
let locked = false, started = false, mode = 'free', dragLook = false, plAvailable = true;
// Pointer lock may be blocked (sandboxed iframe / user settings) → fall back to drag-look.
function lock() {
  if (TOUCH || !plAvailable) return;
  try {
    const p = canvas.requestPointerLock();
    if (p && p.catch) p.catch(() => { plAvailable = false; dragLook = true; });
  } catch (e) { plAvailable = false; dragLook = true; }
}
let md = null;
canvas.addEventListener('mousedown', e => { if (started && !TOUCH) md = { x: e.clientX, y: e.clientY, moved: 0 }; });
addEventListener('mouseup', e => {
  if (!md) return;
  if (md.moved < 6 && started) { if (locked) tryInteract(); else if (dragLook || !plAvailable) tryInteract(); else lock(); }
  md = null;
});
document.addEventListener('pointerlockchange', () => {
  locked = document.pointerLockElement === canvas;
  if (!locked && started && !uiOpen() && !dragLook) showMenu(true);
});
// Chrome reports one huge movementX/Y right after pointer lock is (re)acquired — the jump from
// the old cursor position to the screen centre. Unclamped it whips the view a full turn.
const LOOK_CLAMP = 200;
const lookStep = v => Math.max(-LOOK_CLAMP, Math.min(LOOK_CLAMP, v || 0));
addEventListener('mousemove', e => {
  const dx = lookStep(e.movementX), dy = lookStep(e.movementY);
  if (locked) {
    player.yaw -= dx * 0.0021;
    player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - dy * 0.0019));
  } else if (md && started) {
    md.moved += Math.abs(dx) + Math.abs(dy);
    player.yaw -= dx * 0.0035;
    player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - dy * 0.003));
  }
});
// touch: left joystick + right look
let joy = null, lookT = null;
if (TOUCH) {
  canvas.addEventListener('touchstart', e => {
    for (const to of e.changedTouches) {
      if (to.clientX < innerWidth / 2 && !joy) { joy = { id: to.identifier, x0: to.clientX, y0: to.clientY, dx: 0, dy: 0 }; if (mode === 'free') stopCamAnim(); }
      else if (!lookT) lookT = { id: to.identifier, x: to.clientX, y: to.clientY, moved: 0 };
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    for (const to of e.changedTouches) {
      if (joy && to.identifier === joy.id) { joy.dx = (to.clientX - joy.x0) / 60; joy.dy = (to.clientY - joy.y0) / 60; }
      if (lookT && to.identifier === lookT.id) {
        player.yaw -= (to.clientX - lookT.x) * 0.005;
        player.pitch = Math.max(-1.2, Math.min(1.2, player.pitch - (to.clientY - lookT.y) * 0.004));
        lookT.moved += Math.abs(to.clientX - lookT.x) + Math.abs(to.clientY - lookT.y);
        lookT.x = to.clientX; lookT.y = to.clientY;
      }
    }
  }, { passive: true });
  canvas.addEventListener('touchend', e => {
    for (const to of e.changedTouches) {
      if (joy && to.identifier === joy.id) joy = null;
      if (lookT && to.identifier === lookT.id) { if (lookT.moved < 12) tryInteract(); lookT = null; }
    }
  });
}
function collide(nx, nz) {
  for (const c of colliders) {
    if (nx > c.minx && nx < c.maxx && nz > c.minz && nz < c.maxz) return true;
  }
  return false;
}
function move(dt) {
  let ix = 0, iz = 0;
  if (keys.KeyW || keys.ArrowUp) iz += 1;
  if (keys.KeyS || keys.ArrowDown) iz -= 1;
  if (keys.KeyA || keys.ArrowLeft) ix -= 1;
  if (keys.KeyD || keys.ArrowRight) ix += 1;
  if (joy) { ix += Math.max(-1, Math.min(1, joy.dx)); iz -= Math.max(-1, Math.min(1, joy.dy)); }
  const [fx, fz] = forward();
  const rx = -fz, rz = fx;
  const sp = 2.1;
  const tx = (fx * iz + rx * ix), tz = (fz * iz + rz * ix);
  const acc = RED ? 1 : Math.min(1, dt * 7);
  player.vx += (tx * sp - player.vx) * acc;
  player.vz += (tz * sp - player.vz) * acc;
  let nx = player.x + player.vx * dt, nz = player.z + player.vz * dt;
  if (!collide(nx, player.z)) player.x = nx; else player.vx = 0;
  if (!collide(player.x, nz)) player.z = nz; else player.vz = 0;
}

// ---------- INTERACTION ----------
let nearest = null;
const KIOSK_R = 2.4;
function updateNearest() {
  const cp = new THREE.Vector3(player.x, EYE, player.z);
  let best = null, bd = 2.6;
  const [fx, fz] = forward();
  for (const ex of exhibits) {
    const d = ex.pos.distanceTo(cp);
    if (d < bd) {
      const dir = ex.pos.clone().sub(cp).normalize();
      if (dir.x * fx + dir.z * fz > 0.35) { best = ex; bd = d; }
    }
  }
  let kioskNear = kioskPos.distanceTo(cp) < KIOSK_R;
  const pr = $('prompt');
  if (kioskNear) {
    nearest = { kiosk: true };
    pr.textContent = (lang() === 'vi' ? 'Hỏi trợ lý tri thức' : 'Ask the knowledge assistant') + (TOUCH ? '' : t('pressE'));
    pr.style.display = 'block';
  } else if (best) {
    nearest = best;
    pr.textContent = t('inspect') + ': ' + (lang() === 'en' ? best.a.title_en : best.a.title) + (TOUCH ? '' : t('pressE'));
    pr.style.display = 'block';
  } else { nearest = null; pr.style.display = 'none'; }
  // timeline plaques via center ray when close
  const px = player.x, pz = player.z;
  plaqueNear = (px > -2.2 && px < 2.2 && pz < -8 && pz > -16) ? plaques.find(p => Math.abs(p.position.z - pz) < 0.9) : null;
  if (plaqueNear && !nearest) {
    pr.textContent = (lang() === 'vi' ? 'Thời ' + plaqueNear.userData.period + ' — tô sáng hiện vật' : 'Highlight ' + plaqueNear.userData.period + ' objects') + (TOUCH ? '' : t('pressE'));
    pr.style.display = 'block';
  }
}
let plaqueNear = null;
let inspectOpen = false;
function tryInteract() {
  if (!started || uiOpen()) return;
  if (nearest && nearest.kiosk) { openKiosk(); return; }
  if (nearest) { openInspect(nearest.a.id); return; }
  if (plaqueNear) highlightPeriod(plaqueNear.userData.period);
}
function openInspect(id) {
  inspectOpen = true;
  if (locked) document.exitPointerLock();
  window.__artifacts.open(id);
}
function highlightPeriod(period) {
  exhibits.forEach(ex => {
    if (ex.period !== period) return;
    ex.obj.traverse(o => {
      if (o.isMesh && o.name !== 'shadow' && o.material.emissive) {
        o.material.emissive.set(0xa98e4b); o.material.emissiveIntensity = 0.5;
        setTimeout(() => { o.material.emissiveIntensity = 0; }, 2600);
      }
    });
  });
  const pr = $('prompt');
  pr.textContent = t('hlight') + period;
  pr.style.display = 'block';
  setTimeout(() => { pr.style.display = 'none'; }, 1800);
}

// ---------- UI STATES ----------
function uiOpen() {
  return ['menu', 'map', 'kiosk'].some(id => $(id).style.display !== 'none' && $(id).style.display !== '') || inspectOpen;
}
function showMenu(v) { $('menu').style.display = v ? 'flex' : 'none'; }
$('m-resume').onclick = () => { showMenu(false); lock(); };
$('m-map').onclick = () => { showMenu(false); openMap(); };
$('m-audio').onclick = () => { showMenu(false); toggleAudio(); };
$('m-lang').onclick = () => { window.DS_I18N.set(lang() === 'vi' ? 'en' : 'vi'); };
$('btn-exit').onclick = () => showMenu(true);
$('btn-map').onclick = openMap;
$('btn-audio').onclick = toggleAudio;
$('btn-vi').onclick = () => window.DS_I18N.set('vi');
$('btn-en').onclick = () => window.DS_I18N.set('en');
$('map-close').onclick = () => { $('map').style.display = 'none'; lock(); };
addEventListener('ds:lang', () => { applyMT(); redrawTexts(); });
function redrawTexts() {
  hallTitle.userData.redraw(hallLines());
  exhibits.forEach(ex => ex.lab.userData.redraw(labelLines(ex.a)));
}

// ---------- MAP ----------
function openMap() {
  if (locked) document.exitPointerLock();
  const svg = $('map-svg');
  const sx = x => 150 + x * 10, sz = z => 90 - z * 6.2;
  svg.innerHTML = M.rooms.map(r => {
    const x = sx(r.x[0]), w = (r.x[1] - r.x[0]) * 10, y = sz(r.z[1]), h = (r.z[1] - r.z[0]) * 6.2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(169,142,75,.08)" stroke="rgba(184,171,151,.4)"></rect>
      <text x="${x + w / 2}" y="${y + h / 2}" fill="#d8cdba" font-size="13" text-anchor="middle" style="cursor:pointer" data-room="${r.id}">${lang() === 'en' ? r.en : r.vi}</text>`;
  }).join('') + `<circle id="map-me" cx="${sx(player.x)}" cy="${sz(player.z)}" r="5" fill="#a03d2d"></circle>`;
  svg.querySelectorAll('text').forEach(tx => {
    tx.addEventListener('click', () => {
      const r = M.rooms.find(rr => rr.id === tx.dataset.room);
      player.x = (r.x[0] + r.x[1]) / 2; player.z = (r.z[0] + r.z[1]) / 2 + 2;
      stopCamAnim();
      player.yaw = 0; player.vx = player.vz = 0;
      $('map').style.display = 'none';
      lock();
    });
  });
  $('map').style.display = 'flex';
}

// ---------- AUDIO ----------
// Ambient bed: public/audio/hon-tranh-co.mp3 (per-artifact narration still browser TTS).
let audioOn = false;
// The label carries its own i18n key so applyMT() keeps saying the right thing after a
// VI/EN switch — a fixed data-mt would relabel a playing track as "turn sound on".
function setAudioLabel(key) {
  const el = $('audio-lb'); if (!el) return;
  el.setAttribute('data-mt', key);
  el.textContent = t(key);
}
function toggleAudio() {
  const el = $('amb');
  if (audioOn) { el.pause(); audioOn = false; setAudioLabel('soundOn'); return; }
  el.loop = true; el.volume = 0.5;
  el.play().then(() => { audioOn = true; setAudioLabel('soundOff'); })
    .catch(() => setAudioLabel('soundNA'));
}
// Sound is on from the start of the visit. begin() runs inside the click on "Tham quan tự do",
// so the autoplay policy accepts play(); if a browser still refuses, arm the next real
// interaction rather than leaving the room silent with no way back.
let autoArmed = false;
function autoStartAudio() {
  if (audioOn) return;
  const el = $('amb');
  el.loop = true; el.volume = 0.5;
  el.play().then(() => { audioOn = true; setAudioLabel('soundOff'); }).catch(() => {
    if (autoArmed) { setAudioLabel('soundNA'); return; }
    autoArmed = true;
    const retry = () => {
      removeEventListener('pointerdown', retry); removeEventListener('keydown', retry);
      autoStartAudio();
    };
    addEventListener('pointerdown', retry); addEventListener('keydown', retry);
  });
}

// ---------- KIOSK ----------
function openKiosk() {
  if (locked) document.exitPointerLock();
  $('kiosk').style.display = 'flex';
  $('kiosk-q').textContent = '“' + t('kq') + '”';
  const steps = t('ks'), box = $('kiosk-steps');
  box.innerHTML = ''; $('kiosk-done').style.display = 'none';
  steps.forEach((s, i) => {
    const d = document.createElement('div');
    d.style.cssText = 'display:flex;align-items:center;gap:10px;color:#6E6355';
    d.innerHTML = `<span style="width:20px;height:20px;border-radius:50%;border:1.5px solid rgba(184,171,151,.3);display:inline-flex;align-items:center;justify-content:center;font-size:10px">${i + 1}</span>${s}`;
    box.appendChild(d);
    setTimeout(() => {
      d.style.color = '#E8DFCE';
      d.firstChild.style.borderColor = '#8fae9c'; d.firstChild.style.color = '#8fae9c';
      if (i === steps.length - 1) $('kiosk-done').style.display = 'block';
    }, 650 * (i + 1));
  });
}
$('kiosk-close').onclick = () => { $('kiosk').style.display = 'none'; lock(); };
$('kiosk-open').onclick = () => { $('kiosk').style.display = 'none'; openInspect('DS-001'); };

// ---------- GUIDED TOUR ----------
let tourI = -1;
function startTour() {
  mode = 'tour'; tourI = -1;
  $('tour').style.display = 'block';
  nextStop();
}
function nextStop() {
  tourI++;
  if (tourI >= M.tour.length) return endTour();
  const s = M.tour[tourI];
  $('tour-step').textContent = t('stop') + ' ' + (tourI + 1) + ' / ' + M.tour.length;
  $('tour-txt').textContent = lang() === 'en' ? s.en : s.vi;
  $('tour-next').textContent = t('next');
  $('tour-quit').textContent = t('quit');
  const from = { x: player.x, z: player.z, yaw: player.yaw, pitch: player.pitch };
  const dx = s.look[0] - s.pos[0], dz = s.look[2] - s.pos[2];
  const tyaw = Math.atan2(-dx, -dz);
  const tpitch = Math.atan2(s.look[1] - EYE, Math.hypot(dx, dz)) * -1;
  const t0 = performance.now(), dur = RED ? 1 : 2600;
  stopCamAnim();
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    player.x = from.x + (s.pos[0] - from.x) * e;
    player.z = from.z + (s.pos[2] - from.z) * e;
    let dy = tyaw - from.yaw; while (dy > Math.PI) dy -= Math.PI * 2; while (dy < -Math.PI) dy += Math.PI * 2;
    player.yaw = from.yaw + dy * e;
    player.pitch = from.pitch + (-tpitch - from.pitch) * e;
    camAnim = k < 1 ? requestAnimationFrame(step) : null;
  };
  camAnim = requestAnimationFrame(step);
}
function endTour() {
  stopCamAnim();
  mode = 'free';
  $('tour').style.display = 'none';
  lock();
}
$('tour-next').onclick = nextStop;
$('tour-quit').onclick = endTour;

// ---------- ENTER SEQUENCE ----------
let entered = false;
function begin(tourMode) {
  $('enter').style.display = 'none';
  $('topbar').style.display = 'flex';
  $('dot').style.display = TOUCH ? 'none' : 'block';
  started = true; entered = true;
  applyMT();
  autoStartAudio();
  const h = $('hints'); h.style.display = 'block';
  setTimeout(() => { h.style.transition = 'opacity 1.5s'; h.style.opacity = '0'; setTimeout(() => h.style.display = 'none', 1600); }, 7000);
  if (tourMode) startTour();
  else lock();
  // entry dolly
  if (!RED && !tourMode) {
    player.z = 7.2;
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 2200);
      player.z = 7.2 - k * 1.7;
      camAnim = (k < 1 && mode === 'free') ? requestAnimationFrame(step) : null;
    };
    camAnim = requestAnimationFrame(step);
  }
}
$('btn-free').onclick = () => begin(false);
$('btn-tour').onclick = () => begin(true);

// ---------- LOADER ----------
const loadT0 = performance.now();
let prog = 0;
const li = setInterval(() => {
  prog = Math.min(100, (performance.now() - loadT0) / 14); // time-based: ~1.4s even when timers are throttled
  $('load-txt').textContent = (lang() === 'vi' ? 'Đang mở không gian bảo tàng… ' : 'Opening the museum… ') + Math.round(prog) + '%';
  if (prog >= 100) {
    clearInterval(li);
    try { renderer.compile(scene, cam); renderer.render(scene, cam); } catch (e) { }
    $('loader').style.transition = 'opacity 1.1s'; $('loader').style.opacity = '0';
    setTimeout(() => { $('loader').style.display = 'none'; }, 1150);
    $('enter').style.display = 'flex';
    applyMT();
  }
}, 160);

// ---------- MAIN LOOP ----------
renderer.setSize(canvas.clientWidth || innerWidth, canvas.clientHeight || innerHeight, false);
cam.aspect = (canvas.clientWidth || innerWidth) / (canvas.clientHeight || innerHeight); cam.updateProjectionMatrix();
addEventListener('resize', () => { renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); cam.aspect = canvas.clientWidth / canvas.clientHeight; cam.updateProjectionMatrix(); });
let last = performance.now(), lastFrame = 0;
// frame() always reads the clock itself. Mixing the rAF timestamp (taken when the frame
// started) with performance.now() from input handlers made dt go negative on slow frames,
// which pushed velocity away from its target and walked the player backwards.
function requestRender() { if (performance.now() - lastFrame > 25) frame(); }
window.__museum = { renderer, cam, scene, player, go(x, z, yaw) { player.x = x; player.z = z; player.yaw = yaw || 0; player.pitch = 0; requestRender(); } };
// Event-driven safety net: throttled iframes may freeze rAF AND timers — draw directly on input.
['mousemove', 'keydown', 'keyup', 'touchmove', 'touchstart', 'wheel'].forEach(ev =>
  addEventListener(ev, () => { if (started) requestRender(); }, { passive: true }));
// Resilient loop: rAF for smoothness + watchdog interval (some embedded iframes throttle/stop rAF).
function loop() {
  requestAnimationFrame(loop);
  frame();
}
setInterval(() => {
  const now = performance.now();
  if (now - lastFrame > 200) frame();
}, 50);
function frame() {
  const now = performance.now();
  lastFrame = now;
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (canvas.width !== Math.floor(w * renderer.getPixelRatio())) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  const modalEl = document.getElementById('art-modal');
  const modalOpen = modalEl && modalEl.style.display === 'flex';
  if (inspectOpen && !modalOpen) { inspectOpen = false; if (!TOUCH && started && mode === 'free') canvas.requestPointerLock(); }
  if (modalOpen) return; // pause museum rendering while inspecting (modal owns its own context)
  if (started && mode === 'free' && !uiOpen()) move(dt);
  if (started && !uiOpen()) updateNearest();
  cam.position.set(player.x, EYE, player.z);
  cam.rotation.set(0, 0, 0);
  cam.rotateY(player.yaw);
  cam.rotateX(player.pitch);
  renderer.render(scene, cam);
}
requestAnimationFrame(loop);
