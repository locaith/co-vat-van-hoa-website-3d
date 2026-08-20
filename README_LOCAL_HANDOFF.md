# DI SẢN VIỆT — Local Handoff

## Chạy
Static site — không cần build. Serve thư mục bằng bất kỳ HTTP server nào:
`npx serve .` hoặc `python3 -m http.server` rồi mở `index.dc.html`.
(Cần HTTP vì ES modules + three.js importmap; mở file:// sẽ không chạy 3D.)

## Entry points
- `index.dc.html` — trang chủ
- `museum.html` — **Bảo tàng 3D** (route /museum): first-person WebGL, 4 phòng, 12 hiện vật
- `kham-pha.dc.html` — catalog + modal 3D; `tra-cuu-ai.dc.html` — AI search mock
- `vision.dc.html` — trình bày nội bộ

## Kiến trúc dữ liệu (một ID — nhiều bề mặt)
- `artifacts-data.js` → `window.DS_ARTIFACTS`: **nguồn sự thật duy nhất** cho 12 hiện vật (id DS-001…012, is_demo, giá demo, nguồn, trạng thái kiểm chứng). Catalog, museum, AI search, modal đều đọc từ đây.
- `museum-manifest.js` → `window.DS_MUSEUM`: placements (room, artifactId, pos, displayType, lightingProfile, zone), tour stops, timeline. KHÔNG chứa nội dung hiện vật.
- `artifacts3d.js`: engine 3D dùng chung — `buildArtifact(record)` (procedural), thumbnails, modal inspection (+ nút Hỏi AI / TTS), AI stage.
- `museum.js`: MuseumApp (kiến trúc, ánh sáng, điều khiển, va chạm, label, kiosk, tour, map).
- `locales.js` + `i18n.js`: VI/EN (`data-i18n`, localStorage `ds_lang`).

## REAL SCAN TODO
Khi có scan photogrammetry: thêm `model_url: 'public/museum/models/DS-001.glb'` vào record trong `artifacts-data.js`, load bằng GLTFLoader tại các điểm đánh dấu `REAL SCAN TODO` (museum.js, artifacts3d.js). Nén Draco/Meshopt + KTX2 khuyến nghị. Không cần đổi UI.

## Audio — DEMO
Thả file vào `public/museum/audio/ambient.mp3` (nhạc nền bảo tàng) và `assets/audio/heritage-theme.mp3` (trang triển lãm). UI bật/tắt đã sẵn; narration per-artifact hiện dùng browser TTS (`AI SERVICE TODO`).

## REAL BACKEND TODO — contract đề xuất
- GET /api/artifacts/:id · GET /api/artifacts/search?q=
- POST /api/ai/heritage-search {query} → {answer, artifactId, confidence, sources[]}
- GET /api/artifacts/:id/model → GLB url · GET /api/artifacts/:id/sources
- POST /api/artifacts/:id/ask {question} → format như DS_AI_MOCK
- POST /api/reconstruction/jobs {description} → {jobId}; GET /api/reconstruction/jobs/:jobId → {status, model_url}
Mock cần thay: `DS_AI_MOCK` (artifacts-data.js), pipeline setTimeout trong `tra-cuu-ai.dc.html`, kiosk steps trong `museum.js`. UI đã tách trạng thái nên chỉ cần đổi nguồn dữ liệu, không reload trang.

## Ma trận sự thật
CONFIRMED ≠ PROPOSED ≠ DEMO ≠ REQUIRES_VERIFICATION — xem `CONTENT_TRUTH_MATRIX.md`. Mọi giá tiền là **ước tính minh họa demo**, mọi hiện vật `is_demo: true`.
