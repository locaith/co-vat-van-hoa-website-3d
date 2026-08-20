// Shared 3D artifact engine: thumbnails + detail viewer modal + AI stage. Mock geometry (demo).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const RED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const D = () => window.DS_ARTIFACTS || [];
const rec = id => D().find(a => a.id === id);

const MATCFG = {
  celadon: { c: 0x8fae9c, r: 0.48, cc: 0.55 }, white: { c: 0xd9d2be, r: 0.42, cc: 0.5 },
  hoalam: { c: 0xc6cfd8, r: 0.38, cc: 0.55 }, brown: { c: 0x74522f, r: 0.55, cc: 0.35 },
  terra: { c: 0xa9764c, r: 0.9, cc: 0 }, sanh: { c: 0x63523d, r: 0.78, cc: 0.12 }
};
function makeMat(key) {
  const c = MATCFG[key] || MATCFG.celadon;
  return new THREE.MeshPhysicalMaterial({ color: c.c, roughness: c.r, clearcoat: c.cc, clearcoatRoughness: 0.4, side: THREE.DoubleSide });
}
const PROFILES = {
  jar: [[0.001, 0], [0.17, 0], [0.21, 0.02], [0.19, 0.05], [0.225, 0.09], [0.35, 0.24], [0.47, 0.46], [0.505, 0.66], [0.48, 0.84], [0.40, 0.98], [0.27, 1.09], [0.185, 1.15], [0.165, 1.20], [0.19, 1.255], [0.20, 1.28]],
  bowl: [[0.001, 0], [0.13, 0], [0.16, 0.02], [0.145, 0.06], [0.16, 0.09], [0.30, 0.17], [0.45, 0.32], [0.52, 0.46], [0.55, 0.56], [0.555, 0.58]],
  plate: [[0.001, 0], [0.15, 0], [0.18, 0.015], [0.165, 0.045], [0.20, 0.06], [0.38, 0.095], [0.52, 0.14], [0.575, 0.185], [0.585, 0.20]],
  am: [[0.001, 0], [0.15, 0], [0.18, 0.02], [0.17, 0.05], [0.20, 0.08], [0.34, 0.20], [0.42, 0.38], [0.40, 0.56], [0.30, 0.70], [0.17, 0.78], [0.15, 0.83], [0.175, 0.87], [0.185, 0.89]],
  tuong: [[0.001, 0], [0.22, 0], [0.26, 0.03], [0.24, 0.08], [0.28, 0.13], [0.30, 0.32], [0.21, 0.62], [0.16, 0.82], [0.14, 0.92]],
  lu: [[0.001, 0], [0.14, 0], [0.17, 0.02], [0.16, 0.05], [0.26, 0.10], [0.43, 0.22], [0.48, 0.38], [0.42, 0.54], [0.30, 0.63], [0.24, 0.67], [0.26, 0.71], [0.27, 0.73]]
};
function lathe(pts, m) {
  const prof = new THREE.SplineCurve(pts.map(p => new THREE.Vector2(p[0], p[1]))).getPoints(72);
  const g = new THREE.LatheGeometry(prof, 100);
  // subtle handmade asymmetry
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = Math.sin(y * 9 + x * 5) * Math.cos(z * 7) * 0.0035;
    pos.setXYZ(i, x + x * n, y, z + z * n);
  }
  g.computeVertexNormals();
  return new THREE.Mesh(g, m);
}
export function buildArtifact(a) {
  const m = makeMat(a.matKey);
  const g = new THREE.Group();
  const body = lathe(PROFILES[a.shape] || PROFILES.jar, m); body.name = 'body'; g.add(body);
  if (a.shape === 'am') {
    const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.06, 0.42, 24), m);
    spout.position.set(0.38, 0.52, 0); spout.rotation.z = -0.9; g.add(spout);
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.032, 16, 40, Math.PI * 1.1), m);
    handle.position.set(-0.38, 0.48, 0); handle.rotation.z = Math.PI / 2 + 0.5; g.add(handle);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 16), m);
    lid.position.set(0, 0.93, 0); g.add(lid);
  }
  if (a.shape === 'tuong') {
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 28, 22), m);
    head.position.set(0, 1.02, 0.02); head.scale.set(1, 0.92, 1.08); g.add(head);
    const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 16), m);
    muzzle.position.set(0, 0.96, 0.17); g.add(muzzle);
    const ear1 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), m); ear1.position.set(-0.1, 1.16, 0); g.add(ear1);
    const ear2 = ear1.clone(); ear2.position.x = 0.1; g.add(ear2);
  }
  if (a.shape === 'lu') {
    for (let i = 0; i < 3; i++) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.16, 14), m);
      const ang = i * Math.PI * 2 / 3 + 0.5;
      leg.position.set(Math.cos(ang) * 0.26, -0.07, Math.sin(ang) * 0.26); g.add(leg);
    }
    const t1 = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.026, 12, 30), m);
    t1.position.set(-0.48, 0.5, 0); t1.rotation.y = Math.PI / 2; g.add(t1);
    const t2 = t1.clone(); t2.position.x = 0.48; g.add(t2);
    g.position.y = 0.16;
  }
  // contact shadow
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const gs = sc.getContext('2d');
  const rg = gs.createRadialGradient(64, 64, 5, 64, 64, 62);
  rg.addColorStop(0, 'rgba(0,0,0,0.55)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
  gs.fillStyle = rg; gs.fillRect(0, 0, 128, 128);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.001 - (g.position.y || 0); sh.name = 'shadow'; g.add(sh);
  const wrap = new THREE.Group(); wrap.add(g);
  return wrap;
}
function lights(scene) {
  const key = new THREE.SpotLight(0xffe0b8, 55, 0, Math.PI / 4.4, 0.55, 2); key.position.set(2.2, 3.2, 2.0);
  const rim = new THREE.DirectionalLight(0xc4d8e8, 2.2); rim.position.set(-2.4, 2.2, -2.4);
  const fill = new THREE.DirectionalLight(0xfff2e0, 0.5); fill.position.set(-1.6, 0.7, 2.4);
  const hemi = new THREE.HemisphereLight(0x9a9e93, 0x1c1712, 0.55);
  scene.add(key, rim, fill, hemi);
}
function frameCam(cam, obj, pad) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const d = Math.max(size.y, size.x * 1.2) * (pad || 1.55);
  cam.position.set(d * 0.55, ctr.y + d * 0.28, d);
  cam.lookAt(ctr);
  return ctr;
}

// ---------- THUMBNAILS ----------
let thumbCache = {};
function renderThumbs() {
  const imgs = [...document.querySelectorAll('img[data-art-thumb]')];
  if (!imgs.length || !D().length) return;
  const pending = imgs.filter(im => !im.dataset.done);
  if (!pending.length) return;
  const cv = document.createElement('canvas'); cv.width = 340; cv.height = 420;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return; }
  renderer.setPixelRatio(1.5); renderer.setSize(340, 420, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.98;
  const scene = new THREE.Scene(); lights(scene);
  const cam = new THREE.PerspectiveCamera(34, 340 / 420, 0.05, 20);
  const done = new Set();
  pending.forEach(im => {
    const id = im.dataset.artThumb, a = rec(id);
    if (!a) return;
    if (!thumbCache[id]) {
      const obj = buildArtifact(a);
      obj.rotation.y = 0.5;
      scene.add(obj);
      frameCam(cam, obj, 1.32);
      renderer.render(scene, cam);
      thumbCache[id] = cv.toDataURL('image/png');
      scene.remove(obj);
    }
    im.src = thumbCache[id]; im.style.opacity = '1'; im.dataset.done = '1';
    done.add(id);
  });
  renderer.dispose();
}

// ---------- DETAIL VIEWER (modal, single context) ----------
let modal = null;
function ensureModal() {
  if (modal && document.body.contains(modal.root)) return modal;
  const root = document.createElement('div');
  root.id = 'art-modal';
  root.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;padding:24px;background:rgba(15,12,10,.78);backdrop-filter:blur(6px)';
  root.innerHTML = `
  <div style="background:#201914;border:1px solid rgba(184,171,151,.2);border-radius:4px;max-width:1180px;width:100%;max-height:92vh;overflow:auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));font-family:'Be Vietnam Pro',sans-serif">
    <div style="position:relative;min-height:440px;background:radial-gradient(ellipse 70% 60% at 50% 42%, rgba(169,142,75,.14), transparent 75%), #241D17">
      <canvas id="am-canvas" style="position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none"></canvas>
      <div style="position:absolute;top:14px;left:16px;font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#E8DFCE;background:rgba(160,61,45,.9);padding:4px 9px;border-radius:2px">Hồ sơ minh họa — mô hình demo</div>
      <div id="am-controls" style="position:absolute;left:14px;right:14px;bottom:12px;display:flex;flex-wrap:wrap;gap:8px"></div>
    </div>
    <div id="am-meta" style="padding:34px 36px;color:#E8DFCE"></div>
  </div>`;
  document.body.appendChild(root);
  root.addEventListener('click', e => { if (e.target === root) api.close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') api.close(); });
  const canvas = root.querySelector('#am-canvas');
  let renderer = null, scene, cam, controls, cur = null, mode = 'original', auto = true, raf = 0;
  function init() {
    if (renderer) return true;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.98;
    scene = new THREE.Scene(); lights(scene);
    cam = new THREE.PerspectiveCamera(34, 1, 0.05, 20);
    controls = new OrbitControls(cam, canvas);
    controls.enableDamping = true; controls.dampingFactor = 0.07;
    controls.minDistance = 0.4; controls.maxDistance = 5;
    return true;
  }
  function loop() {
    if (root.style.display === 'none') return;
    raf = requestAnimationFrame(loop);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w && h && canvas.width !== (w * renderer.getPixelRatio() | 0)) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    controls.update();
    if (auto && !RED && cur) cur.rotation.y += 0.0022;
    renderer.render(scene, cam);
  }
  function setMode(m2) {
    mode = m2;
    if (!cur) return;
    cur.traverse(o => {
      if (o.isMesh && o.name !== 'shadow') {
        o.material.wireframe = (m2 === 'wire');
        o.material.transparent = (m2 === 'research');
        o.material.opacity = m2 === 'research' ? 0.45 : 1;
      }
    });
    renderControls();
  }
  const BTN = 'font-family:inherit;font-size:11.5px;padding:6px 12px;border-radius:2px;cursor:pointer;border:1px solid rgba(184,171,151,.3);color:#E8DFCE;background:';
  function renderControls() {
    const c = root.querySelector('#am-controls');
    c.innerHTML = '';
    [['original', 'Nguyên bản'], ['wire', 'Lưới quét'], ['research', 'Nghiên cứu']].forEach(([id, lb]) => {
      const b = document.createElement('button');
      b.style.cssText = BTN + (mode === id ? 'rgba(169,142,75,.35)' : 'rgba(32,25,20,.6)');
      b.textContent = lb; b.onclick = () => setMode(id); c.appendChild(b);
    });
    const rot = document.createElement('button');
    rot.style.cssText = BTN + (auto ? 'rgba(169,142,75,.35)' : 'rgba(32,25,20,.6)');
    rot.textContent = 'Tự xoay'; rot.onclick = () => { auto = !auto; renderControls(); }; c.appendChild(rot);
    const rs = document.createElement('button');
    rs.style.cssText = BTN + 'rgba(32,25,20,.6)';
    rs.textContent = 'Đặt lại'; rs.onclick = () => { if (cur) frameCam(cam, cur, 1.5); controls.target.copy(new THREE.Box3().setFromObject(cur).getCenter(new THREE.Vector3())); }; c.appendChild(rs);
  }
  function show(id) {
    const a = rec(id); if (!a || !init()) return;
    if (cur) { scene.remove(cur); cur = null; }
    cur = buildArtifact(a);
    scene.add(cur);
    const ctr = frameCam(cam, cur, 1.5);
    controls.target.copy(ctr);
    mode = 'original'; auto = true; setMode('original');
    const st = { 'Đã số hóa': ['●', '#7fae8d'], 'Đang thẩm định': ['◐', '#c8a35a'], 'Chưa kiểm chứng': ['○', '#8A7B67'] }[a.status] || ['○', '#8A7B67'];
    const meta = root.querySelector('#am-meta');
    const row = (k, v) => `<div style="display:flex;gap:14px;padding:8px 0;border-bottom:1px solid rgba(184,171,151,.12);font-size:13px"><span style="width:132px;flex-shrink:0;letter-spacing:.1em;text-transform:uppercase;font-size:10px;color:#8A7B67;padding-top:2px">${k}</span><span style="color:#E8DFCE">${v}</span></div>`;
    meta.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start">
        <div>
          <div style="font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#A98E4B;margin-bottom:8px">${a.id} · ${a.type} · Hồ sơ minh họa</div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:30px;line-height:1.2;color:#F0EADC">${a.title}</div>
        </div>
        <button id="am-close" style="background:none;border:1px solid rgba(184,171,151,.3);color:#B8AB97;font-size:15px;width:34px;height:34px;border-radius:2px;cursor:pointer;flex-shrink:0">✕</button>
      </div>
      <p style="font-size:13.5px;line-height:1.75;color:#B8AB97;margin:14px 0 6px">${a.desc}</p>
      <p style="font-size:13px;line-height:1.7;color:#8A7B67;font-style:italic;margin:0 0 16px">${a.story}</p>
      ${row('Niên đại ước tính', a.dating + ' — dữ liệu minh họa')}
      ${row('Chất liệu', a.material)}
      ${row('Kỹ thuật', a.technique)}
      ${row('Bề mặt', a.surface)}
      ${row('Kích thước', a.dims + ' (demo)')}
      ${row('Xuất xứ / vùng văn hóa', a.origin)}
      ${row('Mức xác nhận', `<span style="color:${st[1]}">${st[0]} ${a.status}</span>`)}
      ${row('Nguồn tư liệu', a.sources.join(' · '))}
      <div style="margin-top:18px;border:1px solid rgba(169,142,75,.4);background:rgba(169,142,75,.08);border-radius:3px;padding:16px 18px">
        <div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#A98E4B;margin-bottom:6px">Giá trị tham khảo (demo) · Ước tính minh họa</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:32px;color:#F0EADC">${a.price}</div>
        <div style="font-size:11px;line-height:1.7;color:#8A7B67;margin-top:8px">${(window.DS_PRICE_NOTES || []).join('<br>')}</div>
      </div>
      <div style="margin-top:18px">
        <div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8A7B67;margin-bottom:8px">Hiện vật liên quan</div>
        <div id="am-rel" style="display:flex;flex-wrap:wrap;gap:8px"></div>
      </div>
      <div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:8px">
        <button id="am-ask" style="font-family:inherit;font-size:12px;padding:9px 15px;border-radius:2px;cursor:pointer;border:1px solid rgba(143,174,156,.5);background:rgba(143,174,156,.12);color:#DCE5DD">Hỏi AI về hiện vật này</button>
        <button id="am-tts" style="font-family:inherit;font-size:12px;padding:9px 15px;border-radius:2px;cursor:pointer;border:1px solid rgba(184,171,151,.3);background:rgba(32,25,20,.6);color:#B8AB97">Nghe thuyết minh (TTS demo)</button>
      </div>
      <div id="am-ans" style="display:none;margin-top:12px;border:1px solid rgba(143,174,156,.35);background:rgba(143,174,156,.06);border-radius:3px;padding:16px 18px;font-size:12.5px;line-height:1.7;color:#D8CDBA"></div>
      <div style="margin-top:16px;font-size:12px"><a href="hien-vat.dc.html" style="color:#A98E4B;text-decoration:none;border-bottom:1px solid rgba(169,142,75,.4)">Xem cấu trúc hồ sơ bằng chứng đầy đủ →</a></div>`;
    meta.querySelector('#am-close').onclick = api.close;
    meta.querySelector('#am-ask').onclick = () => {
      const box = meta.querySelector('#am-ans');
      const mk = (window.DS_AI_MOCK || []).find(m => m.id === a.id);
      const unv = a.status === 'Chưa kiểm chứng';
      const ans = mk ? mk.answer : (unv
        ? 'Chưa đủ bằng chứng để kết luận về niên đại và nguồn gốc của hiện vật này. Hồ sơ đang ở trạng thái "' + a.status + '" — hệ thống chỉ trình bày các quan sát đã ghi nhận: ' + a.surface.toLowerCase() + '.'
        : 'Theo hồ sơ minh họa: ' + a.desc + ' Nhận định dựa trên hình thái, chất liệu (' + a.material + ') và kỹ thuật (' + a.technique.toLowerCase() + ') — chưa phải kết luận cuối cùng.');
      box.style.display = 'block';
      box.innerHTML = '<div style="font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#8fae9c;margin-bottom:6px">Câu trả lời · AI mock — chờ backend</div>' + ans
        + '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;font-size:10px">'
        + '<span style="border:1px solid rgba(184,171,151,.3);padding:3px 8px;border-radius:2px;color:#B8AB97">Nguồn: ' + a.sources.join(', ') + '</span>'
        + '<span style="border:1px solid rgba(184,171,151,.3);padding:3px 8px;border-radius:2px;color:#B8AB97">Mức chắc chắn: ' + (unv ? 'Thấp' : 'Trung bình') + '</span>'
        + '<span style="border:1px solid rgba(184,171,151,.3);padding:3px 8px;border-radius:2px;color:#B8AB97">Ý kiến chuyên gia: chờ hội đồng thẩm định</span>'
        + '<span style="border:1px solid rgba(160,61,45,.45);padding:3px 8px;border-radius:2px;color:#c8917f">Điểm còn tranh luận: niên đại chính xác</span></div>';
    };
    meta.querySelector('#am-tts').onclick = () => {
      // AI SERVICE TODO: replace browser TTS with recorded narration / server TTS.
      try {
        const u = new SpeechSynthesisUtterance(a.title + '. ' + a.dating + '. ' + a.desc + ' ' + a.story);
        u.lang = 'vi-VN'; u.rate = 0.95;
        speechSynthesis.cancel(); speechSynthesis.speak(u);
      } catch (e) { }
    };
    const relBox = meta.querySelector('#am-rel');
    (a.related || []).forEach(rid => {
      const r = rec(rid); if (!r) return;
      const b = document.createElement('button');
      b.style.cssText = 'font-family:inherit;font-size:11.5px;padding:6px 11px;border-radius:2px;cursor:pointer;border:1px solid rgba(184,171,151,.3);background:rgba(32,25,20,.6);color:#B8AB97';
      b.textContent = r.id + ' · ' + r.title;
      b.onclick = () => show(rid);
      relBox.appendChild(b);
    });
    renderControls();
    root.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    cancelAnimationFrame(raf); loop();
  }
  const api = {
    root, show,
    close() { root.style.display = 'none'; document.body.style.overflow = ''; cancelAnimationFrame(raf); }
  };
  modal = api;
  return api;
}

// ---------- AI STAGE (for tra-cuu-ai page) ----------
let stage = null;
function ensureStage() {
  const canvas = document.getElementById('ai-stage');
  if (!canvas) return null;
  if (stage && stage.canvas === canvas && canvas.isConnected) return stage;
  if (stage) stage.dispose();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }); } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.98;
  const scene = new THREE.Scene(); lights(scene);
  const cam = new THREE.PerspectiveCamera(34, 1, 0.05, 20);
  const controls = new OrbitControls(cam, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.07;
  let cur = null, disposed = false, building = 0;
  function loop() {
    if (disposed) return;
    requestAnimationFrame(loop);
    if (!canvas.isConnected) { stage.dispose(); stage = null; return; }
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w && h && canvas.width !== (w * renderer.getPixelRatio() | 0)) { renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    controls.update();
    if (cur) {
      if (!RED) cur.rotation.y += 0.003;
      if (building > 0) {
        building -= 0.012;
        const t = 1 - Math.max(0, building);
        cur.traverse(o => { if (o.isMesh && o.name !== 'shadow') { o.material.transparent = t < 1; o.material.opacity = t; o.material.wireframe = t < 0.55; } });
      }
    }
    renderer.render(scene, cam);
  }
  loop();
  stage = {
    canvas,
    set(id) {
      if (cur) { scene.remove(cur); cur = null; }
      const a = rec(id); if (!a) return;
      cur = buildArtifact(a);
      building = 1;
      scene.add(cur);
      const ctr = frameCam(cam, cur, 1.6);
      controls.target.copy(ctr);
    },
    clear() { if (cur) { scene.remove(cur); cur = null; } },
    dispose() { disposed = true; renderer.dispose(); controls.dispose(); }
  };
  return stage;
}

window.__artifacts = {
  open: id => ensureModal().show(id),
  stageSet: id => { const s = ensureStage(); s && s.set(id); },
  stageClear: () => { const s = ensureStage(); s && s.clear(); }
};
setInterval(renderThumbs, 700);
renderThumbs();
