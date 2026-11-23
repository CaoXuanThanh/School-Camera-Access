# Smoke test Camera Access

Mở ứng dụng theo [hướng dẫn chạy local](../README.md#chạy-local). Để kiểm tra đồng bộ, mở hai tab dùng cùng địa chỉ HTTP local trong một hồ sơ trình duyệt sạch. Dùng `admin` cho Quản trị và `trang@example.test` cho Phụ huynh. Mật khẩu mẫu là `CameraDemo26`.

Một hồ sơ trình duyệt sạch giúp tái hiện đúng dữ liệu mặc định. Nút **Khôi phục dữ liệu** giữ lại tài khoản và liên kết học sinh đã lưu trong hồ sơ đó.

| Ca kiểm thử | Thao tác và kết quả mong đợi |
| --- | --- |
| Đăng nhập và vai trò | Thử mật khẩu sai, sau đó dùng đúng mật khẩu. Tài khoản phụ huynh vào Dashboard. Tài khoản quản trị vào Tổng quan. |
| Danh sách theo quyền | Với Trang, kiểm tra hai học sinh và đúng ba camera gồm 3A1, 3A2, hành lang. Hành lang xuất hiện một lần. Tìm `hanh lang` rồi xóa từ khóa để kiểm tra cả hai trạng thái. |
| Viewer và truy cập ngoài quyền | Mở 3A1 và xác nhận clip mẫu phát. Dùng **Về camera trường học** để quay lại. Với tài khoản Trang, mở đường dẫn nội bộ `#/camera/cam-san-truong`. Viewer báo camera chưa được cấp quyền. |
| Có quyền nhưng ngoại tuyến | Đăng nhập `nam@example.test`. **Sân sinh hoạt khu B** vẫn có trong danh sách với trạng thái **Ngoại tuyến**. Viewer báo chưa thể phát. Trong **Tra cứu quyền** ở tab Quản trị, kiểm tra cùng cặp phụ huynh và camera. Kết quả báo có quyền qua lớp 4A1. |
| Thu hồi khi hồ sơ đổi | Với Trang, mở 3A1. Trong Quản trị, mở **Đối soát quyền**, xác nhận lô chuyển Minh Anh sang 3A2 và áp dụng. Viewer tab phụ huynh dừng phát, bỏ nguồn cũ và hiện thông báo thu hồi. Về Dashboard để xác nhận 3A2 và hành lang vẫn còn. |
| Dashboard tự cập nhật | Khôi phục dữ liệu, giữ tab Trang ở Dashboard và áp dụng lại lô tại tab Quản trị. 3A1 tự rời danh sách. Kiểm tra nhật ký ghi thay đổi. |
| Tìm và tra cứu | Tìm `tran hoang nam` ở Tài khoản demo. Trong Tra cứu quyền, tìm và chọn phụ huynh theo mã hoặc email, rồi chọn camera theo tên hoặc vị trí. Thử liên kết tra cứu với mã không tồn tại. |
| Sửa liên kết, lưu và hủy | Thêm HS001 vào tài khoản Nam, rồi hủy và mở lại để xác nhận dữ liệu cũ. Lặp lại và lưu, tra cứu quyền của Nam với 3A1. Bỏ HS001, lưu và tra cứu lại để thấy kết quả thu hồi. |
| Hồ sơ | Nhập email và số điện thoại sai. Form chỉ rõ từng lỗi và giữ phần đã nhập. Hủy thay đổi để về giá trị đã lưu. Sửa số hợp lệ, lưu và tải lại. |
| Bố cục và bàn phím | Kiểm tra Đăng nhập, Dashboard, Viewer, Hồ sơ và tất cả trang Quản trị ở 375×812, 390×844, 768×1024 và 1366×768. Thử Tab, Enter và Escape trong drawer, tìm kiếm và hộp thoại. |

Đối chiếu kết quả và mã lỗi với [hợp đồng dữ liệu](data-contract.md).
