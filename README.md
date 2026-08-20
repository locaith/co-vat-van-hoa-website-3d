# co-vat-van-hoa-website-3d

Bảo tàng số Di sản Việt Nam — prototype website 3D cho hiện vật văn hoá (gốm Việt).
Static site thuần HTML/JS, **không cần build**, deploy thẳng lên Vercel.

## Chạy local

```bash
npx serve .
# hoặc: python -m http.server
```

Mở `http://localhost:3000/index.dc.html`. Phải chạy qua HTTP server — mở bằng `file://`
sẽ không load được ES modules + three.js importmap nên 3D không chạy.

## Deploy Vercel

Import repo này vào Vercel, giữ nguyên mặc định:

- Framework Preset: **Other**
- Build Command: *(để trống)*
- Output Directory: *(để trống — serve từ root)*

`vercel.json` đã map sẵn URL sạch sang các file `.dc.html`:

| URL | File |
| --- | --- |
| `/` | `index.dc.html` |
| `/kham-pha` | `kham-pha.dc.html` |
| `/hien-vat` | `hien-vat.dc.html` |
| `/bo-suu-tap` | `bo-suu-tap.dc.html` |
| `/trien-lam` | `trien-lam.dc.html` |
| `/tri-thuc` | `tri-thuc.dc.html` |
| `/tra-cuu-ai` | `tra-cuu-ai.dc.html` |
| `/du-an` | `du-an.dc.html` |
| `/dong-hanh` | `dong-hanh.dc.html` |
| `/vision` | `vision.dc.html` |
| `/museum` | `museum.html` |

Các link nội bộ trong site vẫn trỏ thẳng tới `*.dc.html`, nên cả hai dạng URL đều chạy.

## Cấu trúc

- `*.dc.html` — các trang, mỗi trang tự chứa template + logic. Entry: `index.dc.html`
- `museum.html` + `museum.js` + `museum-manifest.js` — bảo tàng 3D first-person, 4 phòng, 12 hiện vật
- `support.js` — runtime khung trang (không sửa)
- `hero3d.js` — 3D hero + scroll story + digital twin trang chủ
- `artifacts3d.js` — engine 3D dùng chung: thumbnail, modal chi tiết hiện vật, AI stage
- `artifacts-data.js` — **MOCK DATA**, nguồn sự thật duy nhất cho 12 hiện vật (`window.DS_ARTIFACTS`)
- `locales.js` + `i18n.js` — song ngữ VI/EN

Dependency duy nhất: three.js 0.184.0 qua CDN import map (pinned + integrity hash) và Google Fonts.
Không npm, không bundler.

## Trạng thái dữ liệu

Toàn bộ hiện vật, giá trị và hội thoại AI trong bản này là **DEMO minh hoạ** (`is_demo: true`).
Xem `CONTENT_TRUTH_MATRIX.md` trước khi dùng bất kỳ con số nào —
CONFIRMED ≠ PROPOSED ≠ DEMO ≠ REQUIRES_VERIFICATION.

## Tài liệu

`README_HANDOFF.md` · `README_LOCAL_HANDOFF.md` · `DESIGN_BRIEF.md` · `DESIGN_SYSTEM.md` ·
`SITE_MAP.md` · `CONTENT_TRUTH_MATRIX.md` · `STAKEHOLDER_REVIEW.md`
