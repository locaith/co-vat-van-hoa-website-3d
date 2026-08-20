# HANDOFF — Bảo tàng số Di sản Việt Nam (prototype)

## Chạy local
Toàn bộ là HTML/JS tĩnh — không cần build. Serve thư mục bằng bất kỳ static server nào:
`npx serve .` hoặc `python3 -m http.server` → mở `index.dc.html`.
(Cần server vì ES module + fetch; mở file:// sẽ không chạy 3D.)

## Cấu trúc
- `*.dc.html` — các trang (mỗi trang tự chứa template + logic; entry: **index.dc.html**)
  - index / kham-pha / hien-vat / bo-suu-tap / trien-lam / tri-thuc / **tra-cuu-ai** / du-an / dong-hanh / vision
- `support.js` — runtime khung trang (không sửa)
- `hero3d.js` — 3D hero + scroll story + digital twin trang chủ (three.js, module)
- `artifacts3d.js` — engine 3D dùng chung: thumbnail tự render, modal chi tiết hiện vật, AI stage
- `artifacts-data.js` — **MOCK DATA** (window.DS_ARTIFACTS, DS_PRICE_NOTES, DS_AI_MOCK)
- `locales.js` + `i18n.js` — song ngữ VI/EN (data-i18n attributes; EN fallback về VI với key chưa dịch)
- `public/audio/stone-lantern-archive.mp3` — nhạc nền trang Triển lãm (đã có, phát khi người dùng bấm)
- `DESIGN_BRIEF.md`, `CONTENT_TRUTH_MATRIX.md` (bắt buộc đọc), `DESIGN_SYSTEM.md`, `SITE_MAP.md`, `STAKEHOLDER_REVIEW.md`

## Dependency
Chỉ three.js 0.184.0 qua CDN import map (pinned + integrity hash) và Google Fonts. Không npm, không bundler.

## Phần đang MOCK — nơi nối backend
1. **Dữ liệu hiện vật**: thay `artifacts-data.js` bằng API (giữ nguyên shape của record). Giá trị hiện vật là ước tính minh họa — backend cần giữ 3 dòng miễn trừ trong DS_PRICE_NOTES.
2. **AI search** (`tra-cuu-ai.dc.html`): pipeline giả lập bằng setTimeout trong logic class (method `ask()`). Thay bằng call API: giữ 4 bước stepper (suy luận → tư liệu → dựng 3D → hoàn tất), gọi `window.__artifacts.stageSet(id)` khi có kết quả 3D.
3. **3D model**: hiện là procedural (buildArtifact trong artifacts3d.js). Khi có scan GLB thật: thay buildArtifact bằng GLTFLoader, giữ nguyên API `window.__artifacts.open/stageSet`.
4. **Form liên hệ** (dong-hanh): chưa gửi dữ liệu.
5. **Nhạc nền**: đã có — xem mục Nhạc nền trong README.md.

## Ma trận sự thật (bắt buộc giữ)
CONFIRMED ≠ PROPOSED ≠ DEMO ≠ REQUIRES_VERIFICATION — xem CONTENT_TRUTH_MATRIX.md. Mọi hiện vật, giá, hội thoại AI là DEMO và phải giữ nhãn minh họa cho tới khi có dữ liệu thật.