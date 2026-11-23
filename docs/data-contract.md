# Hợp đồng dữ liệu Camera Access

Các hàm đọc và cập nhật của `service` trả Promise. Thao tác thành công trả dữ liệu trực tiếp. Thao tác thất bại ném `Error` có `code` và `message`. Bộ mã dùng chung gồm `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `STORAGE_ERROR` và `STALE_DATA`.

| Hàm | Đầu ra |
| --- | --- |
| `login({ username, password })` | User công khai và bắt đầu phiên |
| `getCurrentUser()`, `logout()` | User hoặc `null`; đăng xuất trả `null` |
| `getParentDashboard()` | `{ parent, children, cameras }` của phụ huynh đang đăng nhập |
| `getCameraView(cameraId)` | `{ camera, canPlay, demoSource, message }` |
| `watchParentDashboard(callback)`, `watchCameraView(cameraId, callback)` | Theo dõi cập nhật quyền với callback `(value, error)`. Trả hàm hủy theo dõi để gọi khi rời màn hình |
| `getMyProfile()`, `updateMyProfile({ displayName, email, phone })` | User công khai. API cập nhật chỉ nhận ba trường được nêu |
| `getAdminOverview()` | Lớp, học sinh, tài khoản phụ huynh, danh mục camera và tác động quyền trong bản luyện |
| `inspectCameraAccess(parentId, cameraId)` | Quản trị viên đọc `{ parent, camera, decision, studentEvidence, canPlay }` cho một cặp tài khoản và camera |
| `setStudentEnrollment(studentId, { classId, status })` | Student cập nhật |
| `setParentAccess(parentId, enabled)` | User công khai cập nhật |
| `previewSchoolSync()` | Bản xem trước `{ revision, changes, impact }` cho quản trị viên |
| `applySchoolSync(revision)` | Kiểm tra phiên bản đã đối soát rồi áp dụng lô mẫu. Trả `{ changes, impact }` |

User công khai gồm `id`, `username`, `displayName`, `role`, `email`, `phone`, `accessEnabled`. Học sinh trên Dashboard có `id`, `fullName`, `classId`, `className`, `status`. Dữ liệu camera có `id`, `name`, `classId`, `className`, `enabled`, `connectionStatus`. Bản luyện hỗ trợ camera dùng chung nhiều lớp qua `classIds`.

Viewer dùng `camera.studentsWithAccess` để hiện các học sinh tạo quyền xem. `demoSource` là đường dẫn video diễn tập của camera. Nguồn là `null` khi camera ngoại tuyến hoặc tắt phát. `canPlay` cho biết tài khoản có quyền và trạng thái thiết bị cho phép phát tại thời điểm kiểm tra. Sự kiện video cho biết đang tải, đang phát hoặc gặp lỗi. Mã camera ngoài quyền hiện tại trả `FORBIDDEN`. Khi dữ liệu thay đổi, Dashboard làm mới danh sách và Viewer dừng video, bỏ nguồn nếu mất quyền.

Ở màn hình đối soát, mỗi phần tử `changes` chứa `studentId`, `name`, `before` và `after`. Hai trạng thái chứa `classId` và `status`. Mỗi phần tử `impact` chứa phụ huynh cùng các mảng camera `granted` và `revoked`. Khi dữ liệu phiên thay đổi sau lượt xem trước, service trả `STALE_DATA` để quản trị viên xem lại. Áp dụng lô có thay đổi ghi một mục nhật ký và phát sự kiện cập nhật quyền. Đối soát lại cùng lô đã áp dụng trả danh sách thay đổi rỗng.

## Dữ liệu tra cứu quyền

Giao diện quản trị đọc dữ liệu từ `getAdminOverview()`. Ô chọn phụ huynh, camera và học sinh tìm trên tập dữ liệu đã nhận, hiển thị tối đa sáu kết quả và dùng ID làm giá trị được chọn. Danh sách tài khoản phân trang local. Khi nối API, phần tải kết quả có thể chuyển sang truy vấn và phân trang phía máy chủ trong khi giữ ID, nhãn và phần thông tin phân biệt.

| Trường | Cấu trúc hoặc ý nghĩa |
| --- | --- |
| `parent` | `{ id, displayName, accessEnabled }` |
| `camera` | `{ id, name, classes, connectionStatus, enabled }`. `classes` chứa các mục `{ id, name }`. `connectionStatus` là `online` hoặc `offline`. |
| `studentEvidence` | Mỗi mục chứa `{ id, name, classId, className, status, counts }`. `status` là `active` hoặc `inactive`. `counts` cho biết hồ sơ có được tính vào quyền xem hay không. |
| `decision` | Mã lý do xét quyền như bảng dưới |
| `canPlay` | Điều kiện phát của cặp tài khoản và camera tại thời điểm tra cứu. `GRANTED` và `canPlay: false` có thể cùng xuất hiện khi camera ngoại tuyến hoặc tắt phát. |

| Mã quyết định | Ý nghĩa |
| --- | --- |
| `GRANTED` | Có học sinh đang học ở lớp được gán camera |
| `ACCOUNT_LOCKED` | Tài khoản phụ huynh bị khóa quyền xem |
| `NO_LINKED_STUDENTS` | Tài khoản chưa có học sinh liên kết |
| `NO_ACTIVE_STUDENTS` | Các học sinh liên kết đều ở trạng thái nghỉ học |
| `CAMERA_UNASSIGNED` | Camera chưa được gán lớp |
| `NO_MATCHING_CLASS` | Lớp đang học của các học sinh liên kết không khớp lớp được gán camera |
