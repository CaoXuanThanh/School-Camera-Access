# Phân công công việc School Camera Access Platform

**Kế hoạch triển khai v1.1 — 03/11/2026.** Dùng để phân công, luyện tập ở nhà và diễn tập dựng lại từ đầu trong khoảng 3 giờ, có dự phòng trình bày. Source làm sẵn ở nhà không được mang vào theo thông tin Thành cung cấp. Chưa có task nào được đánh dấu hoàn thành.

Mã log/nhánh được giữ để ổn định đường dẫn: tv1 = Cao Xuân Thành; tv2 = Nguyễn Minh Thiên; tv3 = Lương Minh Đạt; tv4 = Tất Huy Tuấn; tv5 = Đào Nhựt Quang Minh. Họ tên dưới đây là phân công chính thức.

## 1. Nguyên tắc giao việc

Thành nắm phần lõi; Nguyễn Minh Thiên làm dashboard có dữ liệu; Lương Minh Đạt, Tất Huy Tuấn và Đào Nhựt Quang Minh làm các chức năng nhỏ với đầu vào/đầu ra cố định. Mỗi người vẫn có phần HTML/CSS/JS thật để tự làm, tự commit và giải thích. Đào Nhựt Quang Minh làm Profile nhỏ kèm QA để tránh chỉ nhận việc kiểm thử mà không có minh chứng lập trình.

Không giao nguyên câu “làm trang này đẹp và đủ chức năng”. Mỗi task dưới đây được tách thành ba bước: dựng HTML → CSS responsive → JS theo API có sẵn. Chỉ nhận bước sau khi bước trước chạy được và người làm hiểu nó.

Đây là phân công để phát triển năng lực; phần giảm phạm vi không được dùng để biến đóng góp của Thành thành đóng góp của người khác. Nếu Thành sửa code, commit và PR phải thể hiện người sửa thật.

## 2. Việc Thành chuẩn bị trước khi chia

Các file ở đây là nhiệm vụ sắp làm, chưa được tạo trong lần xuất tài liệu.

| ID | Thành chuẩn bị | Điều kiện để thành viên bắt đầu |
| --- | --- | --- |
| CORE-01 | Kiểm tra repo/main và nhánh bài tập cũ; mời collaborator; mở Projects | Mỗi bạn clone, chạy và tạo nhánh được |
| CORE-02 | Tạo folder, global.css, mẫu HTML/header, đường dẫn import chuẩn | Có một trang mẫu chạy được, token màu/khoảng cách được công bố |
| CORE-03 | Seed, store, access, service và data contract | Các hàm của từng trang có dữ liệu mẫu, Promise và mã lỗi đúng Phụ lục A |
| CORE-04 | Tài khoản/fixture demo, reset có kiểm soát, video mẫu, helper phiên | Thành viên không phải tự tạo auth, quyền hoặc nguồn video |
| CORE-05 | Ghi task vào Projects, file ownership và quy tắc AI | Mỗi bạn chỉ rõ được file mình được sửa và cách nghiệm thu |

Ưu tiên làm contract nhỏ, có đầu ra sớm. Không xây toàn bộ Admin trước rồi mới giao UI. Trong khi chờ CORE-03, thành viên làm HTML/CSS từ mẫu; không tự tạo dữ liệu khác để tích hợp về sau. Nếu cần fixture tạm, Thành cung cấp đúng shape và quản lý một bản duy nhất.

Thành giữ các file `js/data.js`, `js/store.js`, `js/access.js`, `js/service.js`, `js/shared/session.js`, `css/global.css`, `.skill/skill.md`, README, PLAN, data contract và cả bộ Admin Access. Chỉ Thành chỉnh những file này trong đợt thử.

## 3. Ma trận giao việc

| Người | Gói việc chính | File được sửa | Giới hạn |
| --- | --- | --- | --- |
| Cao Xuân Thành (Leader) | Core + Admin + tích hợp | Các file chung và `pages/admin-access.html`, `css/pages/admin-access.css`, `js/pages/admin-access.js` | Không làm thay toàn bộ UI của các bạn |
| Nguyễn Minh Thiên | Parent Dashboard | `pages/parent-dashboard.html`, `css/pages/parent-dashboard.css`, `js/pages/parent-dashboard.js`, `docs/prompt-logs/tv2.md` | Không tính quyền lại ở UI |
| Lương Minh Đạt | Login | `index.html`, `css/pages/login.css`, `js/pages/login.js`, `docs/prompt-logs/tv3.md` | Không tự viết kho tài khoản hay đổi role |
| Tất Huy Tuấn | Camera Viewer | `pages/camera-viewer.html`, `css/pages/camera-viewer.css`, `js/pages/camera-viewer.js`, `docs/prompt-logs/tv4.md` | Không làm SDK/stream thật/playback |
| Đào Nhựt Quang Minh | Profile + QA | `pages/profile.html`, `css/pages/profile.css`, `js/pages/profile.js`, `docs/qa-checklist.md`, `docs/prompt-logs/tv5.md` | Không sửa code người khác để “fix giúp”; tạo bug trước |

Ảnh minh chứng mỗi người để trong `docs/evidence/tvN/`. Thành cấp video/ảnh dùng chung; thành viên không ghi đè asset dùng chung. Link và sidebar mẫu do Thành quyết định. Nếu thiếu component/token, báo yêu cầu bằng issue thay vì sửa global.css.

## 4. Bài thử năng lực trước khi giao cả gói

Đề xuất một phiên tại nhà 60–90 phút, không phải thời lượng thi. Ở vòng học từng phần, Thành cung cấp khung/API trước khi tính giờ tích hợp; vòng diễn tập thi phải dựng lại từ đầu. Nếu bị chặn vì thiếu core, ghi blocked thay vì coi thành viên không đạt.

| Người | Bài thử nhỏ | Người làm phải giải thích được |
| --- | --- | --- |
| Nguyễn Minh Thiên | Render danh sách camera service trả về, thêm tìm kiếm tên bằng input | Dữ liệu lấy ở đâu, filter hoạt động thế nào, vì sao không tự cấp quyền |
| Lương Minh Đạt | Form 2 input, nhấn submit báo lỗi khi trống, không reload trang | label/input, sự kiện submit, preventDefault và nơi hiện lỗi |
| Tất Huy Tuấn | Lấy `id` từ URL, hiển thị tên camera qua service hoặc lỗi khi thiếu ID | URLSearchParams, async/await, nhánh lỗi |
| Đào Nhựt Quang Minh | Form email/phone, báo lỗi khi sai, gọi lưu khi hợp lệ | Input, điều kiện hợp lệ, vì sao không lưu khi lỗi |

Mỗi người tự commit phần chạy được, push nhánh, mở PR và demo 3–5 phút. Thành yêu cầu một thay đổi nhỏ tại chỗ như đổi nhãn nút, thêm thông báo rỗng hoặc sửa một điều kiện; không dùng câu “AI làm hết rồi” thay cho giải thích.

- Đạt: chạy đúng, không sửa file ngoài phạm vi, giải thích được và tự gửi PR → nhận bước tiếp theo.
- Cần hỗ trợ: UI chạy nhưng chưa hiểu JS → chia task thành một event và một trạng thái mỗi lần, pair 15 phút rồi tự làm lại.
- Chưa đạt: chưa chạy được hoặc không biết phần mình sửa → hạ phạm vi về HTML/CSS + một tương tác, tập Git lại; không giao thêm logic.

Thời gian là để chẩn đoán, không dùng tốc độ sinh code của AI làm tiêu chí chính.

## 5. Phiếu giao việc Nguyễn Minh Thiên — Parent Dashboard

### Mục tiêu

PHHS đăng nhập nhìn thấy con/lớp và camera được phép xem; gõ tên để lọc, bấm camera để vào viewer. Phần việc tập trung vào xử lý danh sách và tương tác DOM.

### Đầu vào và đầu ra

Đầu vào: mẫu shell, global.css, `getParentDashboard()`, helper phiên, contract tại Phụ lục A, tài khoản demo do Thành cấp.

Đầu ra: đúng ba file của dashboard; danh sách động, tìm kiếm và link viewer; không truy cập LocalStorage và không sao chép mảng camera vào file trang.

### Các task giao lần lượt

| ID | Việc cần làm | Điều kiện nghiệm thu |
| --- | --- | --- |
| DASH-01 | HTML semantic: tiêu đề, vùng thông tin con, ô tìm kiếm, vùng camera và thông báo | Chỉ một main, heading có thứ tự, input có label, đúng link shell |
| DASH-02 | CSS mobile-first: card, grid, khoảng cách, nhãn trạng thái | 375 px không tràn ngang; 1280 px có grid hợp lý; dùng token chung |
| DASH-03 | Gọi service bằng async/await; render children/cameras; loading và error | Dữ liệu thay đổi ở core thì UI đổi; không hardcode tên con/camera |
| DASH-04 | Input tìm kiếm trên danh sách camera đã được service cấp | Có kết quả/không kết quả/xóa từ khóa đều đúng; không làm mất danh sách gốc |
| DASH-05 | Link viewer, nhãn offline/disabled, empty state | Không camera → hướng dẫn rõ; bị khóa → thông báo đúng; không hiện video giả trên dashboard |

Commit mẫu: `[Dashboard] Tao bo cuc semantic`, `[Dashboard] Render du lieu va tim kiem`. Chỉ commit khi có thay đổi có ý nghĩa, không tạo commit rỗng để tăng số lượng.

### Bài kiểm tra Nguyễn Minh Thiên tự chạy

1. Tài khoản một con lớp A → chỉ camera lớp A.
2. Hai con khác lớp → đủ camera hai lớp.
3. Hai con cùng lớp → không trùng camera.
4. Không có con active hoặc tài khoản khóa quyền → thông báo đúng.
5. Tìm thấy/không thấy/xóa từ khóa; bấm camera mở đúng ID.
6. Camera offline/disabled có nhãn rõ. Refresh không phá dữ liệu.

Case 1–4 kiểm chứng đầu ra service và render; nếu service trả sai thì báo Thành, không vá bằng thuật toán quyền riêng trong dashboard.

### Prompt khởi đầu đề xuất

> Tôi phụ trách Parent Dashboard bằng HTML/CSS/Vanilla JS. Đọc README, .skill/skill.md, docs/data-contract.md, global.css và task DASH-01. Chỉ sửa pages/parent-dashboard.html. Hãy nêu các vùng semantic cần có và tạo khung, chưa thêm CSS/JS. Giữ nguyên link/header theo mẫu. Không tạo file ngoài phạm vi. Sau đó giải thích vai trò từng vùng và cách tôi tự kiểm tra.

Khi chuyển sang DASH-03, đổi phạm vi sang JS của dashboard, đưa chữ ký API và shape dữ liệu thật; yêu cầu giải thích `await`, `map`, `filter`, sự kiện input. Không dùng một prompt “hoàn thành tất cả” ngay từ đầu.

## 6. Phiếu giao việc Lương Minh Đạt — Login

**Mục tiêu:** form dễ dùng, gọi `login({ username, password })`, điều hướng admin/parent theo User service trả về.

- LOGIN-01: HTML có label, username/password, button submit, vùng thông báo; không có đăng ký/quên mật khẩu giả.
- LOGIN-02: CSS responsive, căn form, trạng thái focus và lỗi; chỉ CSS trang.
- LOGIN-03: Bắt submit, kiểm tra rỗng, gọi service; khóa nút trong lúc chờ, bật lại khi lỗi; không reload khi submit.
- LOGIN-04: Role admin → Admin Access; parent → Parent Dashboard. Không cho người dùng chọn role để tự cấp quyền. Role không biết thì báo lỗi, không mặc định cho Admin.

**DoD:** rỗng báo lỗi; sai thông tin ở lại form; đúng thông tin đi đúng trang; không có lỗi console; mật khẩu không in vào console/prompt log; không lưu credentials ở JS trang.

**Mức giảm nếu chưa đạt:** Lương Minh Đạt hoàn thành HTML/CSS và validation rỗng trước; Thành hướng dẫn nối một hàm login có sẵn. Không yêu cầu Lương Minh Đạt hiểu toàn bộ auth production.

**Câu hỏi kiểm tra:** nút submit khác button thường thế nào? Điều hướng dựa trên dữ liệu nào? Vì sao không so sánh password với chuỗi hardcode ngay trong trang?

## 7. Phiếu giao việc Tất Huy Tuấn — Camera Viewer

**Mục tiêu:** đọc `id` từ URL, gọi `getCameraView(id)`, hiện camera và video mẫu khi được phép.

- VIEW-01: HTML gồm tên camera, tên lớp, video controls, thông báo và link quay về dashboard; nhãn video mẫu luôn nhìn thấy.
- VIEW-02: CSS video co theo khung, không tràn mobile; không tự làm player tùy chỉnh.
- VIEW-03: Thiếu ID → thông báo, không gọi API bằng giá trị rỗng. Có ID → gọi service và render kết quả/lỗi.
- VIEW-04: `canPlay=false` hoặc lỗi quyền → không gán src. Khi có nguồn hợp lệ → dùng video HTML5, không tự chạy có tiếng.
- VIEW-05: Dùng callback/helper Thành cung cấp để cập nhật khi mất quyền; dừng và bỏ nguồn video. Phần đăng ký kiểm tra quyền do Thành chịu trách nhiệm, Tất Huy Tuấn không tự viết thuật toán quyền.

**DoD:** đúng camera, missing ID, ID không tồn tại, không có quyền, offline và video tải lỗi đều có thông báo; không còn nguồn phát sau xử lý mất quyền.

**Mức giảm nếu chưa đạt:** hoàn thiện HTML/CSS + missing-ID state trước; nối API theo mẫu. Không giao carousel, timeline playback, snapshot định kỳ hoặc WebRTC.

**Phần demo:** Tất Huy Tuấn ghi lời dẫn ngắn “video mẫu, quyền suy theo lớp”; Đào Nhựt Quang Minh phối hợp quay/test sau tích hợp. PPT là việc phụ nếu thầy yêu cầu, không thay phần code.

## 8. Phiếu giao việc Đào Nhựt Quang Minh — Profile và QA

**Mục tiêu:** có đóng góp FE nhỏ, đúng trang Profile & Settings trong giáo trình, đồng thời giúp nhóm phát hiện lỗi.

- PROFILE-01: Form tên hiển thị, email liên hệ, số điện thoại; username/role chỉ đọc nếu hiển thị. Không có field chỉnh con/lớp/quyền.
- PROFILE-02: CSS theo mẫu; label, focus, lỗi nằm cạnh field; mobile không tràn.
- PROFILE-03: Load `getMyProfile()`, validate, gọi `updateMyProfile(...)`, hiển thị giá trị mới và thông báo lưu thành công.
- PROFILE-04: Reload vẫn có dữ liệu; sai dữ liệu không ghi đè bản hợp lệ. Chỉ gửi ba field cho phép.

**Quy tắc validation demo đề xuất:** tên sau trim dài 2–60 ký tự; email bắt buộc theo kiểm tra định dạng đơn giản; phone bắt buộc theo định dạng nội địa 10 chữ số bắt đầu 0. Thành dùng cùng quy tắc ở service. Đây là giới hạn demo, không tuyên bố xác minh email/số điện thoại thật hoặc hỗ trợ mọi định dạng quốc tế.

**QA-01:** lập checklist luồng chính và các case ở mục 10; chạy sau mỗi đợt merge.

**QA-02:** ghi bug theo mẫu: tài khoản/fixture → trang → bước làm → kết quả mong đợi → kết quả thực tế → ảnh/lỗi console → người phụ trách → kết quả retest.

**DoD:** tự làm form và sự kiện save; ghi được bug tái hiện; không chỉ nói “trang lỗi”. Đào Nhựt Quang Minh không được tự đánh dấu mọi case pass nếu chưa chạy.

**Mức giảm nếu chưa đạt:** chỉ email và phone có validation trong bài thử; gói cuối vẫn hoàn thành form theo contract nhờ hướng dẫn từng bước. Không thêm avatar upload hoặc đổi mật khẩu.

## 9. Gói việc Thành — lõi và Admin

| ID | Việc | Nghiệm thu |
| --- | --- | --- |
| ACCESS-01 | Quan hệ nhiều PHHS/nhiều con; suy quyền theo con active và lớp; loại trùng camera | Các case quyền ở mục 10 đúng |
| STORE-01 | Seed một lần, namespace/version, lưu dữ liệu và phiên demo, reset riêng ứng dụng | Refresh không mất sửa đổi; không xóa storage của ứng dụng khác |
| API-01 | Promise, mã lỗi thống nhất, kiểm tra role trước thao tác admin, validate profile | UI không phải tự hiểu cấu trúc storage |
| ADMIN-01 | Tìm HS theo tên, hiện PHHS/lớp/trạng thái; form đổi lớp/trạng thái | Dữ liệu được cập nhật; có nhãn mô phỏng API trường |
| ADMIN-02 | Khóa/mở quyền PHHS bằng trạng thái boolean, thông báo phạm vi ảnh hưởng | Khóa một PHHS không khóa PHHS khác của cùng HS |
| CORE-06 | Helper phiên, điều hướng và cập nhật viewer khi quyền thay đổi | Truy cập trang sai role bị chặn trong luồng mô phỏng |
| INTEGRATE-01 | Review PR, merge từng gói, chạy smoke test và ghi kết quả | Main luôn có bản demo chạy được |

Không mở thêm CRUD thiết bị, lịch sử học tập, audit UI, đa trường, import Excel hoặc realtime nhiều máy trong đợt này. Những việc đó ghi backlog tương lai.

## 10. Bộ dữ liệu và ca kiểm thử chung

Thành chuẩn bị fixture có ít nhất: hai lớp A/B, camera A/B, PHHS P1/P2, học sinh S1/S2. S1 gắn P1 và P2; S2 gắn P1. Mỗi test ghi trạng thái đầu và reset/thiết lập lại để case trước không làm sai case sau.

| Case | Thiết lập/thao tác | Kết quả mong đợi |
| --- | --- | --- |
| T01 | P1 có S1 active lớp A; không có con khác active | Chỉ camera A |
| T02 | S1 active A, S2 active B cùng P1 | Camera A và B |
| T03 | S1/S2 cùng active A | Camera A chỉ một lần |
| T04 | S1 từ A sang B; S2 inactive | Mất A, có B |
| T05 | S1 từ A sang B; S2 vẫn active A | Vẫn A và có B |
| T06 | Mọi con P1 inactive | Không camera |
| T07 | S1 active A; khóa quyền P1 | P1 không xem; P2 vẫn xem A nếu được phép |
| T08 | Mở quyền P1 sau khi mọi con inactive | Vẫn không camera, không khôi phục quyền cũ sai |
| T09 | Camera hợp lệ offline hoặc disabled | Hiện trạng thái, không phát |
| T10 | P1 tự đổi URL sang camera lớp không có con | Service từ chối, UI không có nguồn phát |
| T11 | Parent mở Admin hoặc gọi thao tác Admin qua service | Mock service từ chối role |
| T12 | Lưu hồ sơ hợp lệ/sai → refresh | Hợp lệ được giữ; sai không lưu |
| T13 | Seed lại bằng reload thông thường | Không ghi đè sửa đổi |
| T14 | Viewer đang mở nhận cập nhật mất quyền qua helper | Dừng player, bỏ nguồn, có thông báo |

T11 kiểm tra thiết kế mô phỏng, không chứng minh bảo mật trước người sửa LocalStorage. Demo hai role chính dùng đăng xuất/đăng nhập tuần tự; không yêu cầu chạy hai phiên khác nhau cùng origin ở hai tab.

## 11. Git đủ dùng cho thành viên mới

### Thiết lập GitHub một lần — Thành phụ trách

Chưa thực hiện cấu hình trên repository. Trước khi bật, kiểm tra repo public/private, gói tài khoản và rule có sẵn. Classic branch protection dùng được với repo public trên Free; repo private cần gói hỗ trợ. Không tự đổi repo thành public chỉ để bật tính năng.

Trong Settings → Branches → Add classic branch protection rule, nhắm đúng `main`:

- Require a pull request before merging; Require approvals: **1**.
- Dismiss stale approvals; Require conversation resolution.
- Do not allow bypassing the above settings, nếu sẵn sàng áp dụng cả admin.
- Không cho force push hoặc xóa nhánh được bảo vệ.

**Quy ước nhóm:** Thành review/merge PR của các bạn; Thiên review PR của Thành. Một approval bất kỳ không đồng nghĩa GitHub đã bắt buộc đúng Thành duyệt. Không cần CODEOWNERS ở đợt đầu; muốn cưỡng chế người duyệt cụ thể thì thiết kế riêng sau khi có username/quyền phù hợp.

Đề xuất của nhóm: chưa bật status checks khi chưa có CI; không dùng develop/release/hotfix. Chọn merge commit để giữ các commit có ý nghĩa và chỉ xóa nhánh tính năng đã merge khi không còn ai dùng; không xóa nhánh bài tập cũ.

Nguồn cấu hình: [GitHub — Managing a branch protection rule](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule).

### Checklist review của Thành và Thiên

1. Files changed chỉ gồm phạm vi task, không lẫn file bài tập/credential.
2. Tên hàm/field đúng contract, page không đọc storage hay tự tính quyền.
3. Chạy trang trên nhánh PR, thử thành công và một ca lỗi chính; kiểm tra console/mobile.
4. Người làm giải thích thay đổi, có prompt log và kết quả test.
5. Nếu có vấn đề: yêu cầu sửa trong PR hiện tại. Nếu đạt: Approve; Thành gộp vào main, Thiên có thể gộp PR của Thành theo phân công.
6. Cập nhật main, chạy lại luồng liên quan; nếu fail thì sửa bằng PR nhỏ tiếp theo, không force push để xóa lịch sử.

Bật bảo vệ xong, tập một PR chỉ sửa tài liệu để cả nhóm hiểu thao tác trước khi nhận code thật. Nếu gói tài khoản không hỗ trợ cưỡng chế, vẫn làm PR/review theo quy ước và ghi rõ chưa có chặn kỹ thuật.

### Hiểu sáu từ trước khi gõ

- Repository: thư mục dự án và lịch sử thay đổi.
- Branch: nhánh làm việc của mình.
- Commit: mốc lưu các thay đổi đã chọn trên máy.
- Push: đưa commit lên GitHub.
- Pull: lấy thay đổi từ remote về nhánh hiện tại; cần biết mình đang ở nhánh nào.
- Pull Request: đề nghị gộp nhánh của mình; Thành review rồi mới merge vào main.

Không học bằng cách nhớ ba lệnh cuối. Mỗi lần chạy phải biết nhánh hiện tại và file nào đang thay đổi. Có thể dùng giao diện VS Code cho stage/commit, nhưng vẫn phải hiểu các bước này.

### Lần đầu và bắt đầu task

Repo dưới đây lấy từ core notes, chưa kiểm tra quyền truy cập hoặc trạng thái main. Thành kiểm tra trước khi cả nhóm dùng. Clone chỉ làm một lần; nếu đã có repo thì mở đúng thư mục đó, không clone lồng vào trong.

```bash
git clone https://github.com/CaoXuanThanh/FE-developer.git
cd FE-developer
git status
git switch main
git pull --ff-only origin main
git switch -c feature/tv2-dashboard-layout
```

Đổi tên nhánh theo người/task. Chỉ switch/pull khi không còn thay đổi chưa xử lý. Nếu status báo file đang sửa, hoặc pull báo lỗi, dừng và gửi nguyên thông báo cho Thành; không tự dùng force/reset. Kiểm tra `git config user.name` và `git config user.email` là của mình trước khi commit; Thành hướng dẫn cấu hình nếu chưa có.

### Sau một phần việc chạy được

Ví dụ Nguyễn Minh Thiên, stage đúng file đã thực sự tạo/sửa; bỏ đường dẫn chưa tồn tại khỏi lệnh:

```bash
git status
git diff
git add pages/parent-dashboard.html css/pages/parent-dashboard.css js/pages/parent-dashboard.js docs/prompt-logs/tv2.md
git diff --staged
git commit -m "[Dashboard] Hoan thien bo cuc va render camera"
git push -u origin feature/tv2-dashboard-layout
```

Mở GitHub → tạo PR từ nhánh vừa push vào main → kiểm tra Files changed → ghi task, thay đổi, cách test và ảnh → gửi Thành review. Push không đồng nghĩa đã merge. Sau review, sửa tiếp trên cùng nhánh rồi commit/push lại.

### Khi main thay đổi trong lúc đang làm

Sau khi đã commit sạch phần mình, phối hợp với Thành:

```bash
git fetch origin
git merge origin/main
```

Nếu conflict: dừng, báo tên file cho Thành, cùng đọc hai phần thay đổi; không chọn accept all. Không push force, không chạy `reset --hard`, không sửa lịch sử để “làm đẹp”. Sau merge xong, chạy lại trang rồi mới push. Nếu có thay đổi chung quan trọng, Thành kiểm tra lại trước khi merge PR.

### Sau PR đã merge

Commit sạch mọi thay đổi, `git switch main`, `git pull --ff-only origin main`, rồi tạo nhánh task mới. Không tiếp tục task mới trên nhánh cũ đã merge. Không sửa hoặc xóa các nhánh bài tập cũ của repo.

### Mẫu PR ngắn

```text
Task: DASH-03
Đã làm: render dữ liệu camera từ service.
File thay đổi: ...
Đã kiểm tra: tài khoản ..., 375px/1280px, empty state, console.
Chưa làm hoặc đang lỗi: ...
Prompt log: docs/prompt-logs/tv2.md
Ảnh minh chứng: ...
```

Thành review thay đổi code, hợp đồng và kết quả chạy; AI có thể hỗ trợ nhưng không thay kiểm thử. Tránh PR sửa hàng loạt định dạng ngoài phạm vi.

## 12. Cách dùng AI để học và hoàn thành phần việc

### File quy tắc AI phải nằm trong repository

`docs/PHAN_CONG_CONG_VIEC.md` nói ai làm gì; `.skill/skill.md` là file riêng quy định AI được sửa gì và phải tuân thủ điều gì. File quy tắc cần được commit để cả nhóm và giảng viên đọc được, không chỉ nằm trong cuộc trò chuyện của Thành. Bộ bàn giao hiện tại chưa tạo file này; CORE-05 phải hoàn thành trước khi tích hợp code nhóm.

Nội dung cần chốt khi viết file:

- Chỉ HTML/CSS/Vanilla JS; không tự thêm framework, backend hoặc dependency.
- Đọc task và data contract; thiếu dữ liệu thì nêu phần thiếu, không tự đổi schema.
- Chỉ sửa file được giao; core/global CSS do Thành quản lý.
- Page gọi service, không đọc LocalStorage và không tự cấp quyền.
- Dùng CSS tokens, tiền tố trang, semantic HTML và DOM an toàn.
- Thực hiện thay đổi nhỏ; giải thích dữ liệu/sự kiện/DOM và nêu cách kiểm thử.
- Không tự commit/push/merge hoặc sửa file ngoài task khi chưa được người làm yêu cầu.
- Ghi rõ phần chưa kiểm thử; không tự tuyên bố hoàn thành.

Đường dẫn `.skill/skill.md` là quy ước repo, không phải định dạng tự nạp chung cho mọi AI. Mỗi người phải đính kèm hoặc yêu cầu công cụ đọc file; nếu công cụ không truy cập được thì đưa nội dung cần thiết vào prompt. Thành kiểm tra bằng yêu cầu AI nhắc lại phạm vi sửa trước khi viết code. Cấu hình tự nạp theo công cụ sẽ chọn khi biết nhóm dùng công cụ nào; tránh duy trì nhiều bản quy tắc lệch nhau.

Mỗi vòng chỉ một task nhỏ. Quy trình: mô tả → đọc đề xuất → chạy → đọc lỗi → yêu cầu sửa đúng lỗi → tự thay đổi một chi tiết → ghi log → commit.

Prompt chung để tùy chỉnh:

> Tôi là [họ tên], đang làm [task]. Công nghệ chỉ HTML/CSS/Vanilla JS. Đọc README, quy tắc nhóm và data contract được cung cấp. Chỉ sửa [danh sách file]. Dùng API [tên hàm và dữ liệu trả về], không tạo backend/framework, không tự ghi LocalStorage, không sửa core/global CSS. Hãy làm bước nhỏ nhất của task, giải thích event, dữ liệu và DOM thay đổi. Nếu thiếu contract hãy chỉ rõ phần thiếu, không tự đoán. Đưa cách kiểm thử để tôi tự chạy.

Prompt sửa lỗi:

> Khi tôi [bước cụ thể], mong đợi [A] nhưng nhận [B]. Console báo [nguyên lỗi]. Đây là đoạn code liên quan. Hãy tìm nguyên nhân và đề xuất thay đổi nhỏ trong file được giao; giải thích tại sao. Không viết lại toàn bộ trang.

Prompt log mỗi người gồm: ngày/task → prompt thật → công cụ → AI trả gì → tự sửa gì → cách test/kết quả → commit/PR. Lưu cả lỗi hữu ích, không chỉ prompt “đẹp”. Không điền trước kết quả chưa xảy ra. Cuối dự án chọn 5–10 prompt quan trọng theo giáo trình và 3–5 prompt nổi bật cho README.

## 13. Tích hợp ở nhà trước buổi có giám sát

1. Ở vòng học tại nhà, Thành phát baseline nhỏ và hợp đồng đã kiểm tra. Vòng diễn tập cuối phải dựng lại từ trống.
2. Mọi người làm bài thử, PR sớm. Thành review bài thử trước khi giao toàn gói.
3. Merge HTML/CSS chạy được; sau đó merge JS từng trang. Không chờ cả nhóm làm xong hết.
4. Đào Nhựt Quang Minh kiểm thử sau từng đợt; lỗi tạo issue, có người nhận và retest.
5. Diễn tập một lượt: mỗi người tự tạo nhánh, dùng AI, sửa một lỗi, commit, PR và giải thích phần mình.
6. Review chung: phần nào thành viên còn chưa hiểu thì giảm độ phức tạp hoặc luyện thêm trước thi.

Không chọn “đến cuối giờ cùng commit một lần” làm phương án chính. Rubric trang 101 xếp lịch sử chỉ một người commit hoặc chỉ commit một lần cuối vào mức yếu của Agile/Git. Commit đúng các mốc có giá trị; không chia commit giả để đối phó.

## 14. Kịch bản diễn tập 180 phút

Kế hoạch diễn tập từ thư mục trống trong khoảng 180 phút, gồm dự phòng trình bày. Không sử dụng source làm sẵn. Việc được mang prompt/tài liệu vào cần hỏi thầy riêng; luyện đến mức có thể mô tả lại yêu cầu bằng lời của mình.

| Khoảng thời gian | Công việc | Mốc kiểm tra |
| --- | --- | --- |
| 0–15 phút | Thành dựng khung/core tối thiểu và contract; các bạn mô tả task, tạo HTML độc lập | Có dữ liệu/shape chung, nhánh và file ownership |
| 15–45 phút | Thành hoàn thiện API tối thiểu; các bạn dựng HTML/CSS, commit phần chạy được | Chốt core đủ để nối UI, phát hiện người bị chặn |
| 45–90 phút | Nối service, form, danh sách và tìm kiếm; gửi PR nhỏ | Thành review và merge dần |
| 90–120 phút | Hoàn thiện luồng chính, Profile và Admin; cắt trang trí nếu chậm | Bản chạy được trên main |
| 120–150 phút | QA, sửa lỗi ưu tiên, prompt log, README và nộp/triển khai theo yêu cầu | Chốt bản nộp, không thêm chức năng |
| 150–180 phút | Trình bày, phản biện hoặc dự phòng theo lịch thầy | Mỗi người giải thích phần mình |

Mốc core 45 phút là mục tiêu cần đo bằng diễn tập, không phải cam kết chắc chắn. Nếu quá mốc, giảm số liệu mẫu và UI phụ, giữ đúng hợp đồng; không để thành viên tự phát minh API để chữa cháy.

Thành vừa code vừa review nên phải nhận PR sớm, nhỏ. Nếu thiếu thời gian: bỏ animation, filter phụ, trang trí, số liệu thống kê phụ. Giữ ba nhóm trang bắt buộc, nghiệp vụ quyền cơ bản, form, dữ liệu động và minh chứng. Không bỏ Profile chỉ vì Login cũng là một form.

## 15. Điều kiện bàn giao của từng người

- Đúng file, đúng API; không đổi tên field hoặc tự thêm thư viện.
- Chạy ở 375 px/1280 px; không có lỗi console của phần mình.
- Có trạng thái lỗi/rỗng liên quan, form không lưu dữ liệu sai.
- Có commit/PR của người làm, prompt log và ảnh kiểm thử thật.
- Giải thích được một luồng sự kiện → service → dữ liệu → DOM.
- Tự sửa được một chi tiết nhỏ khi Thành hỏi.
- Đã được review, tích hợp và retest; lúc đó mới Done.

## 16. Thông tin tổ chức còn cần xác nhận

- Phần trình bày được phân bao nhiêu phút trong buổi khoảng 3 giờ?
- Có được mang tài liệu/prompt vào không? Source chuẩn bị ở nhà đã được xác định là không được dùng.
- Định dạng nộp nhật ký, video và yêu cầu Live Demo cụ thể. Dùng giáo trình làm chuẩn thực hành; không chặn luyện tập vì khác biệt trọng số.

Nguồn: CAMERA_PROJECT_CORE_V2.docx; Giáo trình - Thiết kế Web.pdf trang 75–77, 85–88, 97–102; thông tin Thành cập nhật. Profile + QA giúp mỗi thành viên có phần FE và đáp ứng trang hồ sơ.

## Phụ lục A — Hợp đồng dữ liệu và service


Thành chép/chốt chi tiết vào `docs/data-contract.md` trước khi các bạn tích hợp. Không để từng AI tự đặt tên field. Các kiểu dưới đây là ký hiệu tài liệu, không yêu cầu dùng TypeScript.

| Dữ liệu gốc | Trường tối thiểu |
| --- | --- |
| User công khai | `id`, `username`, `displayName`, `role`, `email`, `phone`, `accessEnabled` |
| Student | `id`, `fullName`, `classId`, `status` (`active`/`inactive`) |
| ParentStudent | `parentId`, `studentId` |
| Class | `id`, `name` |
| Camera | `id`, `classId`, `name`, `enabled`, `connectionStatus` (`online`/`offline`) |

Credential demo và đường dẫn video mẫu do Thành quản lý riêng trong implementation mock, không trả mật khẩu trong User. `classId` có thể là `null` với học sinh inactive. ID là chuỗi; không lấy index mảng làm ID. Quan hệ không hợp lệ phải bị từ chối hoặc không tạo quyền, không mặc định cho xem.

| API dự kiến | Đầu ra/nhiệm vụ |
| --- | --- |
| `login({ username, password })` | User công khai; sai thông tin ném lỗi `INVALID_CREDENTIALS` |
| `getCurrentUser()` | User hoặc `null` |
| `logout()` | Kết thúc phiên, trả `null` |
| `getParentDashboard()` | `{ parent, children, cameras }` cho parent hiện tại |
| `getCameraView(cameraId)` | Kiểm tra quyền; trả `{ camera, canPlay, demoSource, message }` |
| `getMyProfile()` | User công khai hiện tại |
| `updateMyProfile({ displayName, email, phone })` | Validate, lưu và trả User mới; từ chối field ngoài danh sách |
| `getAdminOverview()` | Dữ liệu HS–PHHS–lớp và danh mục camera cho Admin |
| `setStudentEnrollment(studentId, { classId, status })` | Mô phỏng cập nhật trường; trả Student mới |
| `setParentAccess(parentId, accessEnabled)` | Đặt trạng thái rõ ràng; trả User công khai mới |

`children` của dashboard: `{ id, fullName, classId, className, status }[]`.
`cameras` của dashboard: `{ id, name, classId, className, enabled, connectionStatus }[]`, chỉ gồm camera thuộc các lớp PHHS được quyền xem; khi bị khóa quyền thì là mảng rỗng. `parent` có `accessEnabled` để UI giải thích đúng lý do. CameraView không phát được thì `demoSource = null`; camera không có quyền thì ném `FORBIDDEN` trước khi trả thông tin chi tiết.

Mã lỗi chung: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `STORAGE_ERROR`. Dùng Error có `code` và `message`; thành công trả dữ liệu trực tiếp. Không để mỗi trang tự chọn một dạng `{ success, data }` khác nhau.


## Phụ lục B — Đối chiếu giáo trình


Nguồn: “Giáo trình - Thiết kế Web.pdf”, số trang in trong tài liệu. Giáo trình có nhiều phần hướng dẫn và mẫu; các trọng số không hoàn toàn thống nhất. Tạm dùng rubric chi tiết ở Phụ lục 4 để lập kế hoạch, dùng các tiêu chí chung làm mục tiêu chất lượng, không chặn triển khai vì trọng số.

| Nội dung trong tài liệu | Trang | Cách đáp ứng dự kiến |
| --- | --- | --- |
| Dashboard, trang chức năng, Profile & Settings | 87–88 | Dashboard PHHS, Camera Viewer/Admin Access, Profile riêng; không tính Login để thay Profile |
| Danh sách động, tương tác real-time, module rõ | 75 | Render dữ liệu; tìm kiếm theo input; tách data/store/service/UI |
| Git branch, commit, PR và review | 99 | Mỗi task một nhánh; thành viên tự commit; Thành review và merge |
| GitHub Projects; README có thành viên, mô tả, demo, prompt | 100 | Theo dõi To-do/In Progress/Done; chỉ Done sau merge; bổ sung link thật khi có |
| Nhật ký AI, minh chứng sửa lỗi, video 3–5 phút | 88, 97–98 | Mỗi người lưu prompt thật; tổng hợp trước nộp; quay video sau khi luồng ổn |
| PLAN.md, wireframe ở milestone PBL | 75 | Bổ sung ở bước khởi tạo source; chưa tạo trong lần bàn giao này |

| Rubric chi tiết trang 101 | Trọng số | Minh chứng cần đạt |
| --- | --- | --- |
| UI/UX | 20% | Giao diện thống nhất, responsive, trạng thái rõ, thao tác thuận tiện |
| JS/DOM | 30% | `map`/`filter` đúng mục đích, sự kiện ổn định, module rõ, không lỗi console |
| Logic dữ liệu | 15% | Quan hệ PHHS–HS–lớp–camera đúng; xử lý chuyển lớp/nghỉ học/nhiều con |
| Agile/Git | 15% | Projects có task; commit có ý nghĩa của cả nhóm; PR và review |
| Vibe Coding/AI | 10% | Prompt, kết quả, chỉnh sửa và kiểm thử thực tế |
| Pitching | 10% | Demo mượt, giải thích được logic và phần mình làm |

Lưu ý: trang 3 nêu cách đánh giá 70/20/10, khác bảng trên; trang 3 nói nhật ký Word trong khi trang 88 yêu cầu PDF. Lưu nội dung gốc để xuất định dạng thầy xác nhận. Giáo trình có dạy thư viện CSS/hiệu ứng nhưng nhóm chủ động giữ ràng buộc HTML/CSS/JS thuần theo yêu cầu hiện tại. Theo thông tin Thành cập nhật, buổi làm khoảng 3 giờ và có thể gồm trình bày; kế hoạch hiện dự phòng 30 phút cho phần này.

