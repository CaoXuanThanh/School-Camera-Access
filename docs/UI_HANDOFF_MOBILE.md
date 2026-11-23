# TÀI LIỆU HƯỚNG DẪN THIẾT KẾ UI/UX MOBILE-FIRST & COMPONENT MAP (VÒNG CHATGPT)
> **Dự án**: School Camera Access Platform
>
> **Tài liệu**: `docs/UI_HANDOFF_MOBILE.md`  
> **Mục tiêu**: Định hướng kiến trúc giao diện, luồng trải nghiệm người dùng ưu tiên di động (Mobile-First), bản đồ component và giải pháp kỹ thuật đáp ứng quy mô mở rộng (hàng nghìn bản ghi) để AI tiếp theo (ChatGPT) triển khai thiết kế UI/UX mà không làm hỏng logic nền tảng.

Tài liệu ghi lại phân tích và đề xuất từ baseline trước các concept giao diện. Bản đang mở có thể dùng bố cục khác. Các ghi chú mở rộng ở phần 3 áp dụng cho màn hình quản trị.

---

## 1. NGUYÊN TẮC THIẾT KẾ BẤT DI BẤT DỊCH CHO CHATGPT

1. **Giữ nguyên nền tảng công nghệ**:
   - HTML5, CSS3 hiện đại (Flexbox, CSS Grid, CSS Variables), Vanilla JavaScript ES6+.
   - Single Page Application (SPA) qua hash router (`index.html#/<route>`).
   - Mock data và Service layer (`mock-data.js`, `camera-access.js`, `service.js`).
   - **Tuyệt đối không đưa vào**: React, Vue, Vite, Tailwind CLI, npm build step, thư viện bên ngoài, backend thật, API ngoài, hay SDK camera Hikvision/Dahua.
2. **Tuân thủ Content Security Policy (CSP)**:
   - `default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; media-src 'self' blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`.
   - Toàn bộ CSS, font, hình ảnh, video phải nằm trong thư mục `assets/` local. Không dùng CDN (Google Fonts, Font Awesome CDN, v.v.).
   - Không dùng inline event handler (`onclick="..."`) hay inline script (`<script>...</script>` trong template).
3. **Bảo toàn ID và Contract dữ liệu**:
   - Không đổi tên ID cốt lõi: `#app`, `#app-notice`, `#app-dialog`, `#camera-search`, `#camera-player`, `#sync-review`, `#sync-apply`, `#lookup-form`, v.v. (xem chi tiết mục 6 trong `docs/ANTI_HANDOFF.md`).

---

## 2. KIẾN TRÚC MÀN HÌNH MOBILE-FIRST CHO PHỤ HUYNH (PARENT PORTAL)

### 2.1. Vấn đề hiện tại trên Mobile (375px - 390px)
- Sidebar cổng quản trị/phụ huynh nằm dọc ở cạnh trái (`aside.portal-side`), trên mobile chuyển thành thanh nằm trên cùng nhưng hiển thị toàn bộ liên kết điều hướng gây chiếm diện tích.
- Phụ huynh khi đăng nhập chỉ có 2 mục cần quan tâm: **Camera của con** (`#/phu-huynh`) và **Hồ sơ cá nhân** (`#/ho-so`). Không nên bắt phụ huynh cuộn qua các menu không liên quan.
- Thẻ camera (`.feed-card`) hiện tại là dạng danh sách phẳng, thiếu ảnh xem trước (thumbnail), chưa có phân nhóm theo con/lớp.

### 2.2. Trật tự trực quan ưu tiên trên Mobile (Visual Hierarchy)
Thứ tự bố cục từ trên xuống dưới dành cho màn hình điện thoại:
```
┌────────────────────────────────────────────────────────┐
│ [Brand Mini] Camera Access        [Avatar PH] [Đăng xuất]│
├────────────────────────────────────────────────────────┤
│ Lời chào ngắn gọn:                                     │
│ "Xin chào, Nguyễn Thu Trang"                           │
│ Trạng thái: "2 học sinh đang theo dõi"                 │
├────────────────────────────────────────────────────────┤
│ [Pill Lớp / Con]:                                      │
│  ( Tất cả )  [ 3A1 · Minh Anh ]  [ 3A2 · Gia Bảo ]     │
├────────────────────────────────────────────────────────┤
│ [Thanh tìm kiếm nhanh]:                                │
│  🔍 Nhập tên phòng, lớp, vị trí...                     │
├────────────────────────────────────────────────────────┤
│ Danh sách Camera (Card Grid 1 cột trên Mobile, 2-3 cột) │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Ảnh preview 16:9]        [Badge: Đang hoạt động]  │ │
│ │ Camera lớp 3A1                                     │ │
│ │ 📍 Khu A · Phòng 201                               │ │
│ │ 👤 Căn cứ: Nguyễn Minh Anh (Lớp 3A1)              │ │
│ │ [Nút: Xem camera]                                  │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ [Ảnh preview mờ 16:9]     [Badge: Tạm ngoại tuyến] │ │
│ │ Sân sinh hoạt khu B                                │ │
│ │ 📍 Khu B · Tầng trệt                              │ │
│ │ ⚠️ Thiết bị đang bảo trì / ngoại tuyến              │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### 2.3. Quy tắc hiển thị Camera Offline (Product Decision)
- **Camera có quyền nhưng ngoại tuyến**:
  - Không tự ý ẩn camera chỉ vì nó offline. Phụ huynh có quyền biết lớp học/khu vực con mình có camera và tình trạng thực tế của thiết bị.
  - Tuy nhiên, về mặt visual: camera offline nên được xếp sau các camera đang phát tốt, hoặc hiển thị với độ bão hòa thấp hơn (muted style), kèm nhãn "Ngoại tuyến / Chưa thể phát" nhã nhặn để phụ huynh không bấm nhầm nhiều lần.
  - Khi bấm vào camera offline: mở màn hình Viewer với khung chờ lịch sự: *"Camera đang ngoại tuyến. Thiết bị tại trường đang được kiểm tra kết nối."*, có nút thử tải lại hoặc quay về Dashboard.

---

## 3. AUDIT KHẢ NĂNG MỞ RỘNG VỚI HÀNG NGHÌN BẢN GHI (LARGE SCALE UX)

### 3.1. Điểm nghẽn hiện tại trong mã nguồn
Qua kiểm toán mã nguồn `assets/js/pages/admin-access.js`, phát hiện 2 điểm nghẽn DOM nghiêm trọng nếu áp dụng cho trường học quy mô lớn (hàng nghìn học sinh, hàng trăm camera, hàng nghìn phụ huynh):

| Điểm nghẽn | Vị trí code chính xác | Cơ chế hiện tại | Rủi ro khi có hàng nghìn bản ghi |
| --- | --- | --- | --- |
| **Tra cứu quyền: Native Select** | `assets/js/pages/admin-access.js`<br>Hàm `renderAccessLookup()`<br>Dòng 184, 194-201 | Render toàn bộ `data.parents` và `data.cameras` vào thẻ HTML `<select id="lookup-parent">` và `<select id="lookup-camera">` bằng template string `options(items)`. | Trên thiết bị di động, thẻ `<select>` chứa 1.000 - 5.000 `<option>` gây đơ giao diện khi mở picker hệ điều hành; người dùng không thể tìm kiếm nhanh theo tên hoặc mã. |
| **Sửa tài khoản: Render tất cả Checkbox** | `assets/js/pages/admin-access.js`<br>Hàm `editParentAccount()`<br>Dòng 527-531 | Render toàn bộ học sinh trong trường (`data.students.map(...)`) thành hàng loạt `<label><input type="checkbox">...</label>` bên trong modal dialog. | Hàng nghìn thẻ checkbox xuất hiện trong modal nhỏ; modal bị kéo dài vô tận, không thể tìm học sinh cần gán, hiệu năng render DOM sụt giảm nghiêm trọng. |

### 3.2. Đề xuất Component Searchable Combobox cho Admin Tra cứu quyền
Thay thế native `<select>` bằng một **Searchable Autocomplete/Combobox** viết bằng Vanilla JS sạch (không dùng thư viện ngoài):
- **Cấu trúc HTML đề xuất**:
  ```html
  <div class="combobox" data-combobox="parent">
    <label for="lookup-parent-input"><span>Phụ huynh</span></label>
    <div class="combobox-control">
      <input type="text" id="lookup-parent-input" class="field" autocomplete="off" placeholder="Tìm theo tên hoặc mã PH..." role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="lookup-parent-listbox">
      <button type="button" class="combobox-clear" aria-label="Xóa chọn" hidden>&times;</button>
    </div>
    <ul id="lookup-parent-listbox" class="combobox-menu" role="listbox" hidden>
      <!-- Render động kết quả lọc (tối đa 10-20 kết quả hiển thị cùng lúc) -->
      <!-- Hỗ trợ phím mũi tên Up/Down, Enter để chọn, Escape để đóng -->
    </ul>
    <input type="hidden" id="lookup-parent" name="parentId" required>
  </div>
  ```
- **Hành vi (Behavior)**:
  - Khi gõ phím: lọc trên danh sách bộ nhớ (Client-side debounced 150ms). Khi tích hợp backend thật sau này, chỉ cần thay hàm lọc bằng lời gọi API tìm kiếm `GET /api/parents?q=...`.
  - Giới hạn hiển thị: chỉ render tối đa 15-20 mục phù hợp nhất, kèm thông báo: *"Hiển thị 15 kết quả phù hợp nhất. Nhập thêm để thu hẹp tìm kiếm."* nếu danh sách dài.
  - Hỗ trợ keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`).

### 3.3. Đề xuất Component Gán học sinh cho Admin Sửa tài khoản
Thay thế danh sách checkbox vô hạn bằng mô hình **Search-and-Add Tag List**:
```
┌────────────────────────────────────────────────────────┐
│ Học sinh đã liên kết (2)                               │
│ ┌────────────────────────────────────────────────────┐ │
│ │ • Nguyễn Minh Anh (HS001 - Lớp 3A1)            [×] │ │
│ │ • Nguyễn Gia Bảo (HS002 - Lớp 3A2)            [×] │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ Thêm học sinh vào tài khoản:                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🔍 Nhập tên hoặc mã học sinh để tìm...             │ │
│ └────────────────────────────────────────────────────┘ │
│ [Gợi ý kết quả]:                                      │
│  - Trần Khánh Linh (HS003 - Lớp 4A1)       [+ Thêm]   │
│  - Lê Đức Phúc (HS004 - Lớp 3A1)           [+ Thêm]   │
│                                                        │
│ ⚠️ Cảnh báo: Thêm học sinh sẽ tự động cấp quyền xem   │
│    các camera thuộc lớp của học sinh đó.               │
└────────────────────────────────────────────────────────┘
```
- **Ưu điểm**:
  - Không bao giờ phải render hàng nghìn checkbox.
  - Phụ huynh chỉ có 1 đến vài học sinh liên kết nên danh sách đã chọn luôn gọn gàng.
  - Tìm kiếm học sinh tức thì theo mã số học sinh (`HS001`) hoặc họ tên.

---

## 4. CHI TIẾT CÁC HẠNG MỤC DÀNH CHO CHATGPT (VÒNG THIẾT KẾ UI/UX)

| STT | Hạng mục | Màn hình | Gợi ý triển khai |
| --- | --- | --- | --- |
| 1 | **Thanh điều hướng Mobile (Bottom Bar hoặc Hamburger)** | Toàn hệ thống | Trên mobile `<= 620px`, thay thế menu danh sách dọc bằng thanh tab đáy (Bottom Navigation) gọn gàng (Home, Camera, Hồ sơ) đối với phụ huynh; đối với Admin có thể dùng Header có nút Menu trượt (Off-canvas Drawer). |
| 2 | **Card Grid có ảnh Thumbnail Camera** | Parent Dashboard | Sử dụng thuộc tính `camera.image` có sẵn trong mock-data (`assets/images/classroom.jpg`, `hallway.jpg`, `courtyard.jpg`) để làm banner thẻ camera tỉ lệ 16:9, góc bo tròn, elevation bóng đổ nhẹ nhàng. |
| 3 | **Khung phát Video tỉ lệ chuẩn 16:9 (Theater Mode)** | Camera Viewer | Tinh chỉnh `#camera-player` với nền tối `#0f1715`, đường viền kính tinh tế, nút điều khiển nổi bật, thông báo ngoại tuyến có icon thiết bị trực quan. |
| 4 | **Bảng dữ liệu & Thanh công cụ Admin** | Học sinh & lớp, Danh mục camera | Thẻ lọc lớp (`.class-tile`) dạng pills cuộn ngang (horizontal scroll pills) trên mobile; bảng dữ liệu chuyển sang dạng card list khi ở màn hình hẹp thay vì ép bảng dài. |
| 5 | **Typography & System Color Palette** | Toàn bộ CSS | Chuẩn hóa biến CSS màu sắc (chủ đạo xanh học đường thanh lịch, màu trạng thái online/offline rõ ràng, độ tương phản WCAG 2.1 AA). |

---

## 5. TỔNG KẾT
Tài liệu này xác lập bản đồ trải nghiệm và ranh giới kỹ thuật rõ ràng. ChatGPT chỉ cần tập trung vào việc **nâng cấp CSS, layout, visual styling và cấu trúc component hiển thị**, hoàn toàn không phải bận tâm về logic nghiệp vụ hay lo lắng làm hỏng luồng hoạt động sẵn có!
