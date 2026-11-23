# Kiểm thử tự động và phát hành

## Chạy từ clone sạch

Tại gốc checkout, dùng Node.js theo `.node-version` với Chrome cài sẵn.

```sh
node tools/preview.cjs
node --test tests/unit.test.cjs tests/browser.test.cjs
```

Chạy hai lệnh ở hai terminal nếu muốn vừa mở app vừa chạy test. Preview mặc định trả URL `http://127.0.0.1:5500/`. Suite E2E tự khởi động server khác trên một cổng trống. Trên Windows và macOS, bộ test tìm Chrome tại thư mục cài đặt phổ biến. Nếu trình duyệt nằm nơi khác, đặt `CHROME_PATH` tới executable. Trên Linux, mặc định dùng `google-chrome` từ PATH. Môi trường kiểm thử hạn chế sandbox có thể đặt `CHROME_NO_SANDBOX=1` cho tiến trình test chạy server loopback và hồ sơ Chrome tạm.

## Phạm vi

| Nhóm | Kiểm tra |
| --- | --- |
| Unit, `tests/unit.test.cjs` | Dữ liệu riêng trong VM và storage bộ nhớ. Quan hệ lớp, một lần mỗi camera, ngoại tuyến, lớp đổi và nghỉ học, khóa tài khoản, reset, lô đồng bộ cũ. |
| E2E, `tests/browser.test.cjs` | Chrome headless tại 375×812, 390×844, 768×1024 và 1366×768. Đăng nhập hai vai trò và báo sai, route, tìm kiếm, Viewer, danh sách theo quyền, menu bàn phím và bố cục. |
| E2E theo tình huống | Hủy, lưu và bỏ liên kết, validation và lưu hồ sơ, thu hồi khi đang phát giữa hai tab, fallback nguồn video, zoom 200%, tương phản nút chính, kích thước vùng bấm, alt, đường dẫn cũ và gói Pages. |
| Tải lớn | Fixture riêng thêm 1.200 học sinh, 1.200 phụ huynh, 1.200 camera. Đo mở trang, số dòng trong DOM và thời gian xử lý input. Kiểm tra kết quả giới hạn và phân trang. |

Mỗi ca trình duyệt mở một Chrome context mới. Ca đồng bộ dùng hai tab cùng context và origin. Cảnh báo lỗi Chrome và ngoại lệ ứng dụng làm ca thất bại. Fixture lớn chỉ nạp vào storage tạm của test. Có thể đặt `QA_REVIEW_DIR` để lưu ảnh kiểm tra vào một thư mục local.

Lượt kiểm thử local đạt 5 unit test và 11 E2E. Kiểm tra thủ công bằng Chrome gồm mở và phát Viewer ở 375×812, kiểm tra drawer và trả focus bằng Escape ở 390×844, mở hộp thoại sửa tài khoản và trả focus ở 768×1024, xem form Hồ sơ ở 1366×768.

## Kết quả kỹ thuật

Đo tại viewport 390×844 trên Chrome 157.0.8103.79 và Node 22.23.5. Fixture thêm 1.200 bản ghi mỗi loại.

| Phép đo | Trước sửa | Sau sửa |
| --- | --- | --- |
| Học sinh | 1.204 dòng, khoảng 292 ms | 24 dòng, khoảng 83 ms |
| Camera | 1.204 dòng, khoảng 286 ms | 24 dòng, khoảng 83 ms |
| Tìm tài khoản theo mã | Khoảng 4 ms | Khoảng 4 ms |

Thời gian mở trang là wall time có cả polling của harness. Thời gian input đo trong trình duyệt tới khi handler kết thúc. Đây là một lượt đo local để so sánh, không phải ngưỡng hiệu năng trong CI. Tài khoản vẫn tối đa 16 dòng mỗi trang. Gợi ý vẫn tối đa sáu kết quả. Thumbnail trong bảng Camera tải lười. Ảnh Dashboard và các clip MP4 tiếp tục dùng tệp local, đã kiểm tra phát thật và HTTP byte range.

Chrome xác định favicon `data:,` vi phạm `img-src 'self'`. Đã chuyển sang SVG cùng origin và giữ nguyên CSP. Hai danh mục Admin dùng chung bộ phân trang và khôi phục trang sau khi lưu. Quy tắc phân quyền, service và mock data giữ nguyên.

## CI và GitHub Pages

[Frontend QA](../.github/workflows/frontend-qa.yml) chạy khi push và pull request. Workflow lấy Node theo `.node-version` và tải Chrome for Testing 158.0.8127.36 trên Ubuntu 24.04. Node test trả mã lỗi cho job khi một assertion thất bại. [Chrome for Testing](https://googlechromelabs.github.io/chrome-for-testing/)

Để dựng và kiểm tra gói tĩnh tại base path của repo, dùng thư mục đầu ra mới.

```sh
node tools/build-pages.cjs dist
node tools/preview.cjs 5500 /Camera/ dist
```

Mở `http://127.0.0.1:5500/Camera/`, rồi thử route như `#/phu-huynh`. Gói chỉ gồm `index.html`, `assets/`, `pages/` và `.nojekyll`.

Sau khi chủ repository duyệt công khai demo và QA trên GitHub đạt, chọn **Settings → Pages → Source → GitHub Actions**, rồi chạy [Publish static demo](../.github/workflows/demo-pages.yml) thủ công trên `main`. Workflow đóng gói các tệp tĩnh và triển khai qua environment `github-pages`. `push` và `pull_request` chỉ chạy QA. [Cấu hình nguồn GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

Frontend này chỉ phục vụ demo. Xác thực trong JavaScript và LocalStorage không bảo vệ camera thật. Hệ thống thật cần máy chủ xác thực và kiểm tra quyền ở API lẫn nguồn phát. QA hiện dùng Chrome với viewport giả lập. Thiết bị thật, Safari, trợ năng với screen reader và việc triển khai Pages thật còn nằm ngoài kết quả local.
