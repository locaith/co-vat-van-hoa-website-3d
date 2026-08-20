# BRUTAL STAKEHOLDER REVIEW — vòng 1 (08/2026)
Sáu góc nhìn, chỉ ghi vấn đề. Mọi mục "Đã sửa" đã được triển khai trực tiếp vào website.

## 1. Chị Ngọc — khởi xướng & gây quỹ
- Không có gì cụ thể để đưa nhà tài trợ: "minh bạch theo cấu phần" nhưng không thấy cấu phần → ĐÃ SỬA: bảng cấu phần tài trợ + đầu ra + trạng thái (dong-hanh).
- Form liên hệ không nói thư/tiền đi đâu, dễ mất uy tín → ĐÃ SỬA: ghi rõ chưa nhận đóng góp trước khi có pháp nhân.
- Thiếu câu pitch kể lại được → ĐÃ SỬA: "Câu để kể lại trong một hơi thở" trên /vision.

## 2. Nhà nghiên cứu di sản cao cấp
- Minh họa bát như ly rượu có mặt cười, đĩa như lưỡi liềm — mất uy tín ngay lập tức → ĐÃ SỬA: vẽ lại silhouette bát/đĩa.
- "0,05 mm/px" là con số bịa tạo ấn tượng khoa học giả → ĐÃ SỬA: bỏ, thay bằng "tiêu chuẩn sẽ công bố".
- Thanh % "mức chắc chắn" trông như xác suất thống kê không nguồn → ĐÃ SỬA: nhãn định tính + chú thích "không phải xác suất thống kê".
- Khung timeline gốm thiếu người chịu trách nhiệm → ĐÃ SỬA: ghi chú "kèm thư mục tài liệu và tên người thẩm định".

## 3. Curator bảo tàng
- "Knowledge graph" tiếng Anh giữa giao diện tiếng Việt → ĐÃ SỬA: "Mạng tri thức".
- Không định vị quan hệ với bảo tàng vật lý — dễ đọc thành "thay thế" → ĐÃ SỬA: dòng "bổ trợ, không thay thế" (du-an).
- Ảnh vector thay hiện vật thật: chấp nhận ở prototype, đã gắn nhãn minh họa khắp nơi. GIỮ NGUYÊN, cần ảnh thật ở giai đoạn 1.

## 4. Nhà sưu tập tư nhân
- Nỗi sợ pháp lý/danh tính/định giá không được trả lời → ĐÃ SỬA: FAQ "trả lời thẳng" 4 câu (dong-hanh).
- Sợ "chưa kiểm chứng" = hạ thấp hiện vật → ĐÃ SỬA: chú thích trong Trust Panel (hien-vat) + FAQ.

## 5. Kiều bào (nhà hảo tâm)
- Không một chữ tiếng Anh, nút EN chết → ĐÃ SỬA: đoạn EN ở footer trang chủ + English summary đầy đủ trên /vision. Bản EN hoàn chỉnh vẫn thuộc giai đoạn sau (trung thực với lộ trình).
- Chưa rõ đóng góp đi đâu → ĐÃ SỬA: tuyên bố không nhận tài chính trước khi có pháp nhân.

## 6. Impact investor quốc tế
- Chỉ thấy tầm nhìn, không thấy vì sao là hạ tầng → ĐÃ SỬA: mục "05 · Góc nhìn đầu tư" trên /vision (data model là tài sản, hiệu ứng mạng, nguồn thu dịch vụ tương lai, điều cần ở giai đoạn 0).
- Pháp nhân mơ hồ → ĐÃ SỬA: nêu rõ "đang xác lập" (du-an + /vision EN summary).

## Bug giao diện đã sửa cùng vòng
- Label node mạng tri thức không hiển thị (SVG text trong vòng lặp) → chuyển node sang nút HTML overlay.
- Nav wrap 2 dòng → white-space:nowrap.
- Badge "Đang xây dựng dữ liệu" chồng tiêu đề thẻ → xếp dọc.

## Ma trận sự thật — được bảo toàn
CONFIRMED ≠ PROPOSED ≠ DEMO ≠ REQUIRES_VERIFICATION. Không mục sửa nào biến định hướng thành sự thật; mọi bổ sung mới (bảng cấu phần, FAQ, góc nhìn đầu tư) đều dùng thì tương lai hoặc ghi rõ trạng thái.