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

## Logo & nhận diện

Nguồn: `public/co-vat-logo.png` (1536×1024, nền trong suốt). Các bản dẫn xuất cắt sẵn từ file này:

| File | Dùng ở đâu |
| --- | --- |
| `public/logo-mark.png` (256px) | Dấu hiệu trên header mọi trang + footer trang chủ + overlay vào bảo tàng 3D |
| `public/logo-full.png` (720px) | Logo đầy đủ kèm chữ — dành cho tài liệu, báo chí |
| `public/favicon.png` (64px) · `public/apple-touch-icon.png` (180px) | Icon tab & màn hình chính |
| `public/og-image.png` (1200×630) | Ảnh xem trước khi chia sẻ link |

Bản chữ đầy đủ có wordmark màu nâu đậm nên chỉ đọc rõ trên nền sáng; ở các mặt nền tối
(bảo tàng 3D, trang Triển lãm) dùng `logo-mark.png`.

**Lưu ý:** thẻ `og:image` đang để đường dẫn tương đối. Khi gắn domain thật, đổi thành URL tuyệt đối
(vd. `https://disanviet.vn/public/og-image.png`) thì Facebook/Zalo mới lấy đúng ảnh preview.

## Nhạc nền

| Trang | File | Điều khiển |
| --- | --- | --- |
| Bảo tàng 3D (`/museum`) | `public/audio/hon-tranh-co.mp3` — 4:36 | **Bật sẵn** khi vào tham quan; tắt bằng nút ♪ trên thanh trên cùng hoặc ESC → Âm thanh |
| Triển lãm (`/trien-lam`) | `public/audio/stone-lantern-archive.mp3` — 7:12 | Nút "Bật nhạc nền trải nghiệm" trên nav |

Cả hai đặt `preload="none"` nên chỉ tải khi thực sự cần. Trang Triển lãm chờ người dùng bấm.
Bảo tàng 3D bật nhạc ngay khi vào tham quan: `begin()` chạy bên trong cú click "Tham quan
tự do" nên trình duyệt chấp nhận `play()`; nếu vẫn bị từ chối thì thử lại ở thao tác
chuột/phím tiếp theo thay vì bỏ im lặng luôn. File đã hạ về 128 kbps 44.1 kHz và gỡ ảnh bìa nhúng
(6.4 MB → 4.4 MB và 10.2 MB → 6.9 MB); bản gốc 187 kbps vẫn nằm trong thư mục Downloads.

Thuộc tính `loop` được set bằng JS chứ không chỉ trong thẻ `<audio>`, vì DC runtime dựng lại
thẻ này qua React và làm rơi mất thuộc tính boolean.


### Điều khiển trên mobile

Bảo tàng 3D có cần điều khiển tròn ở góc dưới trái (chỉ hiện trên thiết bị cảm ứng):
kéo nút vàng để đi, kéo bất kỳ chỗ nào khác trên màn hình để quan sát, chạm hiện vật để xem.
Trước đây vùng di chuyển là nửa trái màn hình nhưng không vẽ gì ra nên không ai biết.

## Trạng thái dữ liệu

Toàn bộ hiện vật, giá trị và hội thoại AI trong bản này là **DEMO minh hoạ** (`is_demo: true`).
Xem `CONTENT_TRUTH_MATRIX.md` trước khi dùng bất kỳ con số nào —
CONFIRMED ≠ PROPOSED ≠ DEMO ≠ REQUIRES_VERIFICATION.

## Tài liệu

`README_HANDOFF.md` · `README_LOCAL_HANDOFF.md` · `DESIGN_BRIEF.md` · `DESIGN_SYSTEM.md` ·
`SITE_MAP.md` · `CONTENT_TRUTH_MATRIX.md` · `STAKEHOLDER_REVIEW.md`
