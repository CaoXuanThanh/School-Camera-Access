# 🎥 School Camera Access Platform (Frontend MVP)

> Nền tảng quản lý và truy cập hệ thống Camera trường học theo phân quyền (Role-Based Access Control) — Đồ án cuối kỳ học phần Thiết kế Web (111101) - Đại học Lạc Hồng (LHU).

## 🎯 1. Bài toán & Mục tiêu Dự án
Xây dựng giao diện hệ thống giám sát và phân quyền truy cập camera trường học trực quan, bảo mật và sẵn sàng mở rộng lên môi trường thực tế (Production-ready):
- **Đối với Quản trị viên (Admin):** Nắm quyền quản trị toàn diện — theo dõi trạng thái hoạt động của toàn bộ mắt thần trong trường và cấp/thu hồi quyền xem camera cho từng tài khoản theo thời gian thực.
- **Đối với Phụ huynh / Người xem (Viewer):** Chỉ truy cập và theo dõi trực tiếp các khu vực/lớp học đã được Admin cấp quyền, đảm bảo tính riêng tư và an toàn trường học.

## 🛠️ 2. Công nghệ Sử dụng (Tech Stack)
- **Cấu trúc:** Semantic HTML5 chuẩn SEO & Accessibility.
- **Giao diện:** CSS3 thuần (CSS Variables Design System, Flexbox, CSS Grid, Responsive Mobile-First).
- **Logic & Dữ liệu:** Vanilla JavaScript (ES6+), quản lý trạng thái bền vững qua `LocalStorage` với kiến trúc tách lớp (Data - Service - UI) sẵn sàng tích hợp Backend API.
- **Quy trình & AI Workflow:** Quản lý mã nguồn qua Git/GitHub (Feature Branch + Pull Request), đồng bộ quy chuẩn sinh mã AI qua `.skill/skill.md`.

## 📂 3. Kiến trúc Thư mục & Phân quyền File (Sandboxing)
Dự án áp dụng quy tắc "Hộp cát" (Sandboxing) — mỗi thành viên làm việc trên file HTML/CSS/JS độc lập để tránh xung đột mã nguồn (Merge Conflict):
- `index.html`: Cổng xác thực (Login) và điều hướng theo Role (`Admin` / `Viewer`).
- `pages/parent-dashboard.html`: Giao diện tổng quan hiển thị danh sách camera được cấp quyền.
- `pages/camera-viewer.html`: Giao diện xem trực tiếp (Live View), thông số kỹ thuật và báo lỗi thiết bị.
- `pages/admin-access.html`: Bảng điều khiển quản trị thiết bị và Ma trận phân quyền (Access Matrix).
- `assets/js/mock-data.js` & `service.js`: Trái tim dữ liệu dùng chung cho toàn hệ thống (Tuyệt đối không tự ý đổi tên thuộc tính).

## 👥 4. Phân công Nhiệm vụ Nhóm (Scrum Team)
| Vai trò | Thành viên | Nhiệm vụ chính (Module) | Phạm vi File phụ trách |
| :--- | :--- | :--- | :--- |
| **Product Owner / Tech Lead** | Cao Xuân Thành | Kiến trúc hệ thống, Data Contract, Login & Luồng phân quyền | `mock-data.js`, `service.js`, `index.html`, `.skill/skill.md` |
| **Frontend Dev 1** | Thành viên 2 | Design System dùng chung & Trang Admin Phân quyền | `global.css`, `layout.css`, `admin-access.*` |
| **Frontend Dev 2** | Thành viên 3 | Trang Dashboard Người xem (Tìm kiếm & Lọc Camera) | `parent-dashboard.*` |
| **Frontend Dev 3** | Thành viên 4 | Trang Trình phát Camera chi tiết (Live View & Modal) | `camera-viewer.*` |
| **QA & Documentation** | Thành viên 5 | Kiểm thử Responsive đa thiết bị, W3C Validation & Nhật ký AI | `docs/`, `prompt_log.md`, `qa-fixes.css` |

## 🚀 5. Hướng dẫn Chạy Dự án (Live Demo)
1. Clone kho lưu trữ về máy:
   ```bash
   git clone [https://github.com/CaoXuanThanh/FE-developer.git](https://github.com/CaoXuanThanh/FE-developer.git)
