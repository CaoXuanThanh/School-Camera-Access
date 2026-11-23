# School Camera Access Platform

Camera Access là frontend dành cho phụ huynh xem camera được cấp theo lớp và quản trị viên theo dõi quyền khi hồ sơ học sinh thay đổi. Ứng dụng chạy bằng HTML, CSS và JavaScript thuần, với dữ liệu và video mẫu đi kèm.

## Chạy local

Mở [index.html](index.html) bằng Chrome hoặc Edge. Ứng dụng nạp CSS, JavaScript, ảnh và video trực tiếp từ thư mục mã nguồn.

Để kiểm tra cập nhật giữa nhiều tab, mở cùng địa chỉ HTTP local. Với Node.js, chạy lệnh sau tại thư mục chứa `index.html`, rồi mở `http://127.0.0.1:5500/`.

```sh
node tools/preview.cjs
```

| Tài khoản | Luồng kiểm tra |
| --- | --- |
| `trang@example.test` | Phụ huynh có hai học sinh ở hai lớp và ba camera, gồm hành lang dùng chung |
| `nam@example.test` | Phụ huynh có quyền xem camera sân sinh hoạt đang ngoại tuyến |
| `admin` | Quản trị lớp, camera, tài khoản demo, tra cứu và đối soát quyền |

Mật khẩu chung của các tài khoản mẫu là `CameraDemo26`. Ảnh minh họa và clip mẫu được nạp local. Viewer cũng có thể dùng webcam của máy đang mở app sau khi người dùng cấp quyền.

## Luồng chính

- **Cổng phụ huynh.** Danh sách gồm các camera được cấp qua con đang học. Camera dùng chung xuất hiện một lần. Tìm theo tên, lớp hoặc vị trí. Viewer phân biệt quyền xem, tình trạng thiết bị và trạng thái phát.
- **Quản trị.** Tra cứu bằng cặp phụ huynh và camera để xem học sinh tạo quyền. Đối soát hiển thị tác động cấp và thu hồi trước khi áp dụng lô thay đổi hồ sơ. Dashboard đang mở cập nhật danh sách. Nếu mất quyền khi đang xem, Viewer dừng phát và bỏ nguồn video.
- **Lưu dữ liệu local.** Hồ sơ, cấu hình và nhật ký được lưu trong trình duyệt. Phiên đăng nhập theo tab. Khôi phục dữ liệu đưa lớp, camera và nhật ký về mẫu, đồng thời giữ các tài khoản và hồ sơ đã lưu.

## Mã nguồn và ranh giới tích hợp

| Thành phần | Vai trò |
| --- | --- |
| [index.html](index.html) và [app.js](assets/js/app.js) | Điểm mở ứng dụng, template và định tuyến hash theo vai trò |
| [assets/js/pages/](assets/js/pages/) và [assets/css/](assets/css/) | Màn hình và giao diện |
| [mock-data.js](assets/js/mock-data.js) | Hồ sơ, camera và lô cập nhật mẫu |
| [camera-access.js](assets/js/camera-access.js) | Mô hình dữ liệu local, tính quyền và xem trước tác động |
| [service.js](assets/js/service.js) | Giao diện Promise cho các màn hình, kiểm tra vai trò và thông báo cập nhật |

Khi tích hợp dữ liệu thật, dùng hợp đồng service làm điểm thay adapter local bằng API. Đối chiếu mã học sinh, lớp, camera và liên kết phụ huynh giữa hai phía. Máy chủ cần xác thực phiên và kiểm tra quyền trên từng yêu cầu dữ liệu và đường phát video. Kiểm tra trong trình duyệt phục vụ bản demo. [Hợp đồng dữ liệu](docs/data-contract.md) · [Kiểm tra quyền trên OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

Trang chính khai báo CSP cho tài nguyên local và giữ script khỏi chạy inline. [Tài liệu CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)

## Kiểm thử và bảo trì

```sh
node --test tests/unit.test.cjs tests/browser.test.cjs
```

Bộ kiểm thử chạy với Node.js 22 và Chrome. [Cách chạy từ clone sạch, cấu hình CI và gói Pages](docs/release-readiness.md)

- [Smoke test đăng nhập, phân quyền và Viewer](docs/smoke-tests.md)
- [Bàn giao kỹ thuật và kết quả QA theo từng vòng](docs/ANTI_HANDOFF.md)
- [Bản đồ UI và ghi chú mở rộng trang quản trị](docs/UI_HANDOFF_MOBILE.md)

## Video mẫu

- Lớp 3A1. [Pavel Danilyuk](https://www.pexels.com/video/an-empty-classroom-8342689/)
- Lớp 3A2. [Erkan Avanoğlu](https://www.pexels.com/video/empty-classroom-with-desks-and-tables-20421536/)
- Hành lang. [Joseph Park](https://www.pexels.com/video/empty-hallway-in-school-13008039/)
- Sân sinh hoạt. [James Cover](https://www.pexels.com/video/an-empty-playground-7009336/)

Các clip đi kèm theo [giấy phép Pexels](https://www.pexels.com/license/).
