# CONTENT TRUTH MATRIX (bắt buộc đọc trước khi sửa nội dung)

## CONFIRMED — sự thật, được phép nói như sự thật
- Dự án do nhóm sáng lập tư nhân người Việt khởi xướng; điều phối hiện tại: Tuấn Anh, Ngọc
- Giai đoạn hiện tại: xây dựng ý tưởng & chuẩn bị thí điểm (Phase 0)
- Nguyên tắc: di sản trước công nghệ, bằng chứng trước tuyên bố, chuyên gia giữ thẩm quyền cuối
- Website này là prototype trình bày tầm nhìn

## PROPOSED — định hướng/kế hoạch, luôn dùng thì tương lai + "dự kiến/hướng tới/mục tiêu"
- Thí điểm 100 hiện vật; lộ trình Phase 0→5
- Hợp tác với chuyên gia, nhà sưu tập, bảo tàng, trường học (chưa có đối tác nào xác nhận)
- Mô hình 3 hội đồng quản trị (chuyên môn / công nghệ / đạo đức & dữ liệu)
- Cơ chế tài chính đa nguồn theo giai đoạn (không nêu con số USD 20M nổi bật)
- VI/EN song ngữ

## DEMO — dữ liệu minh họa, is_demo: true, UI phải gắn "Hồ sơ minh họa"
- Toàn bộ 12 hồ sơ hiện vật (DS-001…DS-012), ảnh/minh họa hiện vật, mô hình 3D mô phỏng
- Hội thoại trợ lý AI, knowledge graph, timeline gốm, triển lãm "Đất, Nước, Lửa"
- Niên đại luôn ghi dạng "Khoảng thế kỷ XIII–XIV — dữ liệu minh họa"
- Giá trị hiện vật (12–380 tỷ VND) là ƯỚC TÍNH MINH HỌA cho demo — luôn kèm 3 dòng miễn trừ, không phải chứng thư thẩm định
- Trang "Tra cứu AI" là mock pipeline — chưa kết nối AI thật

## REQUIRES_VERIFICATION — cần xác nhận từ chị Ngọc / nhóm sáng lập trước khi công bố
- Sự tham gia của TS. Phạm Ngọc Dũng (hiện CHỈ được nhắc dạng "hướng tới hợp tác chuyên gia uy tín", không tên, không ảnh)
- Tên gọi chính thức & pháp nhân
- Mọi con số mục tiêu (100 hiện vật, mốc thời gian)
- Danh sách hội đồng, đối tác, nhà tài trợ trước khi hiển thị bất kỳ tên nào

## Trạng thái xác minh trong data model
UNVERIFIED · REPORTED · EXPERT_REVIEWED · DOCUMENT_SUPPORTED · SCIENTIFICALLY_SUPPORTED · VERIFIED · DISPUTED
Quy tắc cứng: AI không bao giờ tự gán VERIFIED.

## Bổ sung 08/2026 — Bảo tàng 3D (museum.html)
- DEMO: toàn bộ không gian, kiến trúc, hiện vật 3D trong bảo tàng là mô hình minh họa procedural (is_demo: true, cùng ID với catalog — một nguồn sự thật tại artifacts-data.js).
- DEMO: giá trị tham khảo hiển thị trong hồ sơ là ước tính minh họa, kèm miễn trừ 3 dòng — không phải thẩm định.
- DEMO: kiosk AI, thuyết minh TTS, các bước pipeline là mock chờ backend (đánh dấu AI SERVICE TODO / REAL BACKEND TODO).
- PROPOSED: quy trình photogrammetry thay mô hình demo bằng scan thật (REAL SCAN TODO trong code).
- Không có nhãn nào trong bảo tàng gán quyền sở hữu, xuất xứ khảo cổ hay xác thực chuyên gia cho hiện vật.
