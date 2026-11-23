# Quy tắc làm việc với AI — School Camera Access Platform

File này quy định phạm vi chỉnh sửa, kiến trúc và tiêu chuẩn kiểm tra cho mọi thành viên khi dùng AI hỗ trợ lập trình trong repository `School-Camera-Access`.

## 1. Công nghệ & ràng buộc bắt buộc

- Chỉ dùng **HTML5 / CSS3 / Vanilla JavaScript**. Không thêm framework, bundler, thư viện CSS/JS ngoài hoặc backend thật.
- Mọi thao tác dữ liệu từ màn hình (page) đều phải đi qua `service` trong `assets/js/service.js` theo hợp đồng tại `docs/data-contract.md`.
- Nếu thiếu dữ liệu hoặc API trong hợp đồng, báo rõ phần thiếu cho Team Lead (Cao Xuân Thành) — **không tự đổi schema hoặc tự bịa field**.

## 2. Phân quyền sở hữu file (File Ownership)

| Thành viên | Phạm vi được phép chỉnh sửa |
| --- | --- |
| **Cao Xuân Thành (tv1 — Leader)** | `index.html` (shell), `assets/css/global.css`, `assets/css/portal.css`, `assets/js/mock-data.js`, `assets/js/camera-access.js`, `assets/js/service.js`, `assets/js/app.js`, `assets/js/legacy-link.js`, `pages/admin-access.html`, `assets/js/pages/admin-access.js`, `assets/images/*`, `assets/media/*`, `docs/data-contract.md`, `docs/PHAN_CONG_CONG_VIEC.md`, `.skill/skill.md`, `README.md`, `tests/*`, `tools/*` |
| **Nguyễn Minh Thiên (tv2 — Parent Dashboard)** | `pages/parent-dashboard.html`, `assets/css/pages/parent-dashboard.css`, `assets/js/pages/parent-dashboard.js`, `docs/prompt-logs/tv2.md`, `docs/evidence/tv2/` |
| **Lương Minh Đạt (tv3 — Login)** | `assets/css/pages/login.css`, `assets/js/pages/login.js`, phần `#login-template` (khi tích hợp PR), `docs/prompt-logs/tv3.md`, `docs/evidence/tv3/` |
| **Tất Huy Tuấn (tv4 — Camera Viewer)** | `pages/camera-viewer.html`, `assets/css/pages/camera-viewer.css`, `assets/js/pages/camera-viewer.js`, `docs/prompt-logs/tv4.md`, `docs/evidence/tv4/` |
| **Đào Nhựt Quang Minh (tv5 — Profile + QA)** | `pages/profile.html`, `assets/css/pages/profile.css`, `assets/js/pages/profile.js`, `docs/qa-checklist.md`, `docs/prompt-logs/tv5.md`, `docs/evidence/tv5/` |

## 3. Ranh giới kiến trúc

- Page module **không đọc/ghi `localStorage` hoặc `sessionStorage`**, không đọc trực tiếp `mockData` và **không tự tính quyền**.
- Service và core **không thao tác DOM**.
- Dùng CSS design tokens từ `assets/css/global.css`, đặt class theo tiền tố riêng của trang, viết HTML semantic và escape/render DOM an toàn (dùng `app.html(...)` hoặc `textContent`, không ghép chuỗi chưa escape vào HTML).
- Không ghi đè ảnh/video mẫu dùng chung trong `assets/images/` và `assets/media/`.

## 4. Quy tắc thao tác cho AI

- Chỉ thực hiện **thay đổi nhỏ theo đúng task hiện tại**, không viết lại toàn bộ trang khi sửa lỗi nhỏ.
- Luôn giải thích ngắn gọn luồng **sự kiện → service → dữ liệu → DOM** và đưa danh sách bước để người làm tự kiểm thử.
- Không tự `commit`, `push`, `merge` hoặc sửa file ngoài danh sách được giao khi chưa được yêu cầu rõ ràng.
- Ghi rõ phần nào chưa kiểm thử; không tuyên bố hoàn thành khi chưa chạy thử thực tế.
