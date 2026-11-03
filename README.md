# School Camera Access Platform

Nền tảng mô phỏng quản lý quyền xem camera cho phụ huynh của một trường học, dựa trên quan hệ phụ huynh → học sinh → lớp → camera.

**Trạng thái:** Bản thiết kế FE v1.0, cập nhật 03/11/2026. Chưa khẳng định các chức năng bên dưới đã được triển khai. Lần bàn giao này chỉ có README và tài liệu phân công; không có source ứng dụng mới, không thay đổi repository.

## 1. Bài toán và giá trị sản phẩm

Theo tài liệu CAMERA_PROJECT_CORE_V2, trường hiện có nhiều đầu ghi Hikvision; phụ huynh trong một lớp dùng chung tài khoản camera. Khi học sinh nghỉ/chuyển lớp, việc thu hồi quyền của riêng một phụ huynh khó thực hiện mà không ảnh hưởng các phụ huynh khác.

Giải pháp hướng tới là mỗi phụ huynh có danh tính riêng; quyền xem được suy ra từ con đang học ở lớp nào và lớp đó có camera nào. Nhà trường có thể khóa quyền xem của từng phụ huynh hoặc cập nhật tình trạng học sinh. Sản phẩm không thay thế đầu ghi/NVR.

Giá trị kinh tế cần kiểm chứng tại trường: giảm thao tác tạo/chia sẻ/đổi tài khoản chung và giảm sai sót khi thu hồi quyền. Chưa có số liệu chi phí tiết kiệm, giá bán hoặc bằng chứng phù hợp thị trường rộng.

## 2. Phạm vi FE đã thống nhất

- Một trường; hai role `admin` và `parent`.
- HTML5 semantic, CSS3, Grid/Flexbox, CSS Variables, mobile-first, JavaScript thuần và LocalStorage.
- Mô phỏng đăng nhập, quan hệ gia đình–lớp, quyền truy cập và phát video mẫu.
- Các danh sách được render từ mảng object; có tìm kiếm khi gõ, form validation, trạng thái rỗng/lỗi và cập nhật DOM.
- Leader nắm toàn bộ lõi dữ liệu, quy tắc quyền, Admin và tích hợp. Thành viên khác làm những phần UI có hợp đồng rõ.
- Chưa làm backend, database, API trường, Hikvision SDK, stream thật, playback lịch sử, thanh toán, đa trường hoặc CRUD thiết bị đầy đủ.

LocalStorage chỉ mô phỏng lưu trữ và phân quyền, không bảo vệ camera thật. Không sử dụng tài khoản, mật khẩu camera hay thông tin trẻ em thật trong dữ liệu demo.

## 3. Đối chiếu giáo trình

Nguồn: “Giáo trình - Thiết kế Web.pdf”, số trang in trong tài liệu. Giáo trình có nhiều phần hướng dẫn và mẫu; các trọng số không hoàn toàn thống nhất. Tạm dùng rubric chi tiết ở Phụ lục 4 để lập kế hoạch, chờ thầy xác nhận cách chấm cuối kỳ.

| Nội dung trong tài liệu | Trang | Cách đáp ứng dự kiến |
| --- | --- | --- |
| Dashboard, trang chức năng, Profile & Settings | 87–88 | Dashboard PHHS, Camera Viewer/Admin Access, Profile riêng; không tính Login để thay Profile |
| Danh sách động, tương tác real-time, module rõ | 75 | Render dữ liệu; tìm kiếm theo input; tách data/store/service/UI |
| Git branch, commit, PR và review | 99 | Mỗi task một nhánh; thành viên tự commit; Leader review và merge |
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

Lưu ý: trang 3 nêu cách đánh giá 70/20/10, khác bảng trên; trang 3 nói nhật ký Word trong khi trang 88 yêu cầu PDF. Lưu nội dung gốc để xuất định dạng thầy xác nhận. Giáo trình có dạy thư viện CSS/hiệu ứng nhưng nhóm chủ động giữ ràng buộc HTML/CSS/JS thuần theo yêu cầu hiện tại. Chưa tìm thấy quy định đúng 3 giờ trong tài liệu; lịch 180 phút ở tài liệu phân công là phương án diễn tập.

## 4. Các trang chức năng

| Trang | Phạm vi tối thiểu | Chủ sở hữu |
| --- | --- | --- |
| `index.html` | Login demo, validate rỗng, thông báo sai thông tin, điều hướng theo role | TV3 |
| `pages/parent-dashboard.html` | Hiển thị con/lớp, camera hợp lệ, tìm kiếm khi gõ, rỗng/offline | TV2 |
| `pages/camera-viewer.html` | Đọc ID từ URL, gọi service, phát video mẫu, lỗi và quay lại | TV4 |
| `pages/profile.html` | Hiển thị hồ sơ, sửa tên/email/số điện thoại liên hệ, validation và lưu demo | TV5 |
| `pages/admin-access.html` | Tìm học sinh, xem quan hệ PHHS–HS–lớp, đổi lớp/trạng thái học và khóa/mở quyền xem PHHS | Leader |

Không thêm trang quản lý camera riêng ở MVP. Nếu cần minh họa bật/tắt camera, Leader thêm một khối nhỏ trong Admin sau khi luồng cốt lõi đã đạt. Profile không cho sửa role, quan hệ con/lớp, tình trạng học hoặc quyền xem. Email liên hệ không phải tên đăng nhập trong bản demo.

## 5. Quy tắc nghiệp vụ đề xuất cho bản demo

Đây là quy tắc thiết kế để nhóm triển khai; trường cần duyệt lại trước pilot thật.

1. Một PHHS có thể gắn với nhiều học sinh; một học sinh có thể gắn với nhiều PHHS.
2. Học sinh đang học (`active`) có một lớp hiện tại. `inactive` không tạo quyền xem.
3. Camera thuộc một lớp trong MVP. Chưa đưa camera khu vực chung hoặc quan hệ camera–nhiều lớp vào phạm vi.
4. PHHS được xem camera nếu tài khoản được phép xem (`accessEnabled = true`) và có ít nhất một con đang học trong lớp của camera. Không có quan hệ hợp lệ thì từ chối.
5. Tập camera là hợp của các lớp hợp lệ, loại trùng theo camera ID. Hai con cùng lớp không tạo hai thẻ camera giống nhau.
6. Khi một con nghỉ/chuyển lớp, tính lại quyền từ dữ liệu hiện tại. Nếu vẫn có con khác đang học ở lớp cũ, PHHS vẫn có quyền lớp đó.
7. Admin khóa quyền xem PHHS thì chặn tất cả camera của PHHS đó, nhưng vẫn cho đăng nhập để thấy thông báo/hồ sơ. Mở lại chỉ khôi phục quyền suy ra từ quan hệ hiện tại, không cấp camera tùy ý.
8. `enabled = false` trên camera nghĩa là nhà trường ngừng cho xem; `connectionStatus = offline` chỉ là trạng thái kết nối demo. Camera hợp lệ nhưng tắt/offline có thể hiện trên dashboard với nhãn rõ, không phát video.
9. Admin không mặc nhiên có quyền xem video PHHS trong MVP. Admin quản lý dữ liệu và trạng thái, tránh mở rộng role ngoài nhu cầu hiện tại.
10. Trong production, dữ liệu học sinh/lớp dự kiến đến từ hệ thống trường. Nút đổi lớp/nghỉ học trong FE phải ghi “Mô phỏng cập nhật dữ liệu trường”, không ngụ ý đã kết nối API thật.

Không lưu một danh sách quyền PHHS–camera độc lập để thay thế quan hệ con/lớp. Chưa cần hệ thống override cấp quyền riêng từng camera; chỉ bổ sung khi có yêu cầu thật.

## 6. Cấu trúc thư mục đã chọn cho FE

Dùng `css/`, `js/`, `assets/`, `docs/` gần với mẫu giáo trình. Danh sách dưới đây là thiết kế triển khai, không phải danh sách file đã tồn tại trong repo.

```text
README.md
PLAN.md
prompt_log.md
.gitignore
.skill/skill.md
index.html
pages/parent-dashboard.html
pages/camera-viewer.html
pages/profile.html
pages/admin-access.html
css/global.css
css/pages/login.css
css/pages/parent-dashboard.css
css/pages/camera-viewer.css
css/pages/profile.css
css/pages/admin-access.css
js/data.js
js/store.js
js/access.js
js/service.js
js/shared/session.js
js/pages/login.js
js/pages/parent-dashboard.js
js/pages/camera-viewer.js
js/pages/profile.js
js/pages/admin-access.js
assets/images/
assets/media/
docs/PHAN_CONG_CONG_VIEC.md
docs/data-contract.md
docs/qa-checklist.md
docs/wireframes/
docs/prompt-logs/tv1.md
docs/prompt-logs/tv2.md
docs/prompt-logs/tv3.md
docs/prompt-logs/tv4.md
docs/prompt-logs/tv5.md
docs/evidence/
```

Không tạo thư mục backend, database, SDK hoặc một hệ thống component riêng lúc này. Không thêm file dùng chung nếu chưa có nhu cầu dùng lại rõ ràng.

| File/lớp | Trách nhiệm | Không được làm |
| --- | --- | --- |
| `data.js` | Dữ liệu seed dạng mảng object và phiên bản dữ liệu | Không thao tác DOM hoặc tự ghi đè storage khi import |
| `store.js` | Khởi tạo một lần, đọc/ghi/reset dữ liệu demo và phiên demo | Không tự quyết định quyền nghiệp vụ |
| `access.js` | Hàm thuần tính quyền từ PHHS–HS–lớp–camera | Không DOM, không storage, không redirect |
| `service.js` | API nội bộ async, lấy danh tính phiên, kiểm tra role/quyền, validate, gọi store/access | Không render HTML |
| `shared/session.js` | Gọi service để kiểm tra phiên/role, redirect và xử lý đăng xuất | Không tự tin vào role đọc trực tiếp từ storage |
| `js/pages/*` | Sự kiện, gọi service, hiển thị loading/empty/error/success | Không tự đọc LocalStorage, không sao chép thuật toán cấp quyền |
| `global.css` | Token màu/khoảng cách, reset, typography, button/form/layout chung | Không chứa toàn bộ CSS riêng của mọi trang |

Trang chỉ import `service.js` và helper phiên khi cần. Luồng dữ liệu: page → service → store/access; store dùng seed. Tách `access.js` vì đây là phần lõi cần kiểm thử rõ, không phải để thêm lớp cho đủ hình thức.

Mọi hàm service trả Promise ngay ở bản mock. Khi có backend, giữ tên hàm, dữ liệu trả về và mã lỗi ổn định; thay phần triển khai service bằng HTTP. Logic quyền phải được backend thực thi lại; không lấy logic frontend làm bảo mật. UI vẫn có thể cần thay đổi khi có phiên hết hạn, phân trang và player thật.

## 7. Hợp đồng tối thiểu để giao việc

Leader chép/chốt chi tiết vào `docs/data-contract.md` trước khi các bạn tích hợp. Không để từng AI tự đặt tên field. Các kiểu dưới đây là ký hiệu tài liệu, không yêu cầu dùng TypeScript.

| Dữ liệu gốc | Trường tối thiểu |
| --- | --- |
| User công khai | `id`, `username`, `displayName`, `role`, `email`, `phone`, `accessEnabled` |
| Student | `id`, `fullName`, `classId`, `status` (`active`/`inactive`) |
| ParentStudent | `parentId`, `studentId` |
| Class | `id`, `name` |
| Camera | `id`, `classId`, `name`, `enabled`, `connectionStatus` (`online`/`offline`) |

Credential demo và đường dẫn video mẫu do Leader quản lý riêng trong implementation mock, không trả mật khẩu trong User. `classId` có thể là `null` với học sinh inactive. ID là chuỗi; không lấy index mảng làm ID. Quan hệ không hợp lệ phải bị từ chối hoặc không tạo quyền, không mặc định cho xem.

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

## 8. Quy ước triển khai và UX

- Dùng ES modules qua `script type="module"`, chạy bằng HTTP server tĩnh. Không dùng `file://`.
- CSS trang có tiền tố `login-`, `dashboard-`, `viewer-`, `profile-`, `admin-`; dùng biến trong global.css.
- Leader cấp mẫu header/navigation và bộ token tối thiểu trước khi chia việc. Thành viên không tự đổi link, tên class hoặc token chung.
- Dùng HTML semantic đúng ý nghĩa, label gắn với input, focus bàn phím rõ, nút có type phù hợp.
- Dữ liệu do người dùng nhập hiển thị bằng `textContent`/DOM an toàn; không ghép trực tiếp vào `innerHTML`.
- Seed chỉ khởi tạo khi chưa có dữ liệu. Dùng key có namespace/version, ví dụ `school-camera:v1`. Reset chỉ xóa key của ứng dụng, không `localStorage.clear()`.
- Bản tối thiểu dùng một phiên đăng nhập demo trong LocalStorage; demo hai role tuần tự trên một trình duyệt. Không hứa nhiều tài khoản đồng thời ở nhiều tab; không có đồng bộ giữa máy.
- Mỗi lần mở viewer phải kiểm tra quyền qua service. Helper Leader cung cấp kiểm tra lại khi trang được focus và khi phát hiện dữ liệu thay đổi; nếu mất quyền thì dừng, bỏ nguồn video và hiện thông báo. Đây vẫn chỉ là hành vi mô phỏng.
- Video phải có nhãn “VIDEO MẪU – KHÔNG PHẢI CAMERA TRỰC TIẾP”. Không cam kết thu hồi stream thật tức thời ở phase FE.

## 9. Nhóm và phân công

| Thành viên giả định | Vai trò | Phạm vi |
| --- | --- | --- |
| TV1 — Leader | Product Owner kiêm điều phối/Scrum Master theo quy mô lớp; Developer lõi | Data/store/access/service, file chung, Admin, review/merge |
| TV2 — thành viên khá hơn | Developer, hỗ trợ kiểm tra UI | Parent Dashboard, tìm kiếm và responsive |
| TV3 | Developer | Login demo |
| TV4 | Developer | Camera Viewer demo, hỗ trợ kịch bản demo |
| TV5 | Developer kiêm QA | Profile nhỏ, checklist và báo lỗi có bước tái hiện |

Tên TV2–TV5 là giả định theo yêu cầu hiện tại, chưa thay bằng tên người trong core notes. Leader phân phối việc theo kết quả bài thử; không mặc định giao cả trang phức tạp cho người chưa vượt bài thử.

Xem file phân công `docs/PHAN_CONG_CONG_VIEC.md` khi đưa hai tài liệu vào repo. Bản giao kèm hiện mang tên `PHAN_CONG_CONG_VIEC.md`; đặt vào `docs/` theo cấu trúc trên.

## 10. Git, Agile và AI

- Một repo; main giữ bản tích hợp chạy được; không thay/xóa nhánh bài tập cũ.
- Repo ghi trong core notes: https://github.com/CaoXuanThanh/FE-developer. Chưa kiểm tra hiện trạng repo trong lần lập tài liệu này.
- Mỗi task có người phụ trách, file được sửa, đầu vào/đầu ra và tiêu chí nghiệm thu; mỗi tính năng dùng nhánh riêng từ main.
- Thành viên tự commit phần thực sự làm; PR nhỏ, Leader review và merge tuần tự. Không đợi cuối giờ mới push toàn bộ.
- GitHub Projects dùng To-do → In Progress → Done; Done là đã kiểm tra và merge. PR chờ review vẫn để In Progress.
- Mỗi đợt có mục tiêu, chọn backlog, cập nhật ngắn, review bản chạy và ghi điều cần cải tiến. Không gọi bảng task đơn thuần là toàn bộ Scrum.
- Mỗi người ghi prompt vào file riêng `docs/prompt-logs/tvN.md`. Leader tổng hợp `prompt_log.md` và 3–5 prompt nổi bật trong README sau khi sử dụng thật.
- `.skill/skill.md` là quy tắc nhóm phải chủ động đưa cho công cụ AI đọc; không giả định công cụ tự nạp. Chưa tạo file quy tắc này trong lần bàn giao hiện tại.
- Người dùng AI phải chỉ ra được sự kiện đầu vào, hàm xử lý, dữ liệu và DOM thay đổi; sửa được một chi tiết nhỏ mà không yêu cầu AI viết lại cả dự án.

### Prompt nổi bật

**Chưa ghi nhận prompt triển khai thật.** Trước nộp, điền 3–5 mục theo dạng: mục tiêu → prompt thực tế → file/PR → AI làm sai gì → tự sửa gì → kiểm thử. Ví dụ prompt luyện tập ở tài liệu phân công không được ghi thành lịch sử đã thực hiện.

## 11. Cách chạy và demo

Sau khi triển khai source: clone repo, mở thư mục gốc bằng VS Code, chạy `index.html` bằng Live Server hoặc HTTP server tĩnh tương đương; giữ cùng host/port để dùng cùng bộ dữ liệu.

- Live Demo: **chưa triển khai/chưa có URL xác minh**.
- Tài khoản demo: **Leader điền sau khi tạo seed**, không tự đoán tài khoản từ tài liệu này.
- Công cụ chạy tham chiếu: Chrome/Edge và VS Code theo giáo trình.

Kịch bản nghiệm thu tuần tự:

1. PHHS A có con đang học lớp A → đăng nhập thấy camera lớp A → mở được video mẫu.
2. Đăng xuất → Admin tìm học sinh → chuyển sang lớp B → đăng xuất.
3. PHHS A đăng nhập lại → mất camera lớp A, thấy camera lớp B, trừ trường hợp vẫn có con khác ở lớp A.
4. Admin đổi học sinh sang inactive → PHHS mất quyền tương ứng.
5. Admin khóa quyền xem của PHHS → mọi camera của PHHS bị chặn; mở lại tính theo quan hệ hiện tại.
6. Profile lưu thông tin hợp lệ, refresh vẫn giữ; nhập sai email/số điện thoại phải có lỗi và không lưu.
7. Thử camera ID không được phép, camera offline, không có con đang học và đăng nhập sai.

## 12. Definition of Done

- Chức năng đạt tiêu chí task, dùng đúng contract, không sửa file ngoài phạm vi.
- Không có lỗi console chưa xử lý; thông báo loading/rỗng/lỗi có ý nghĩa.
- Kiểm tra ở 375 px và 1280 px, thao tác bàn phím, không tràn ngang ngoài ý muốn.
- Danh sách đến từ dữ liệu; tìm kiếm và form hoạt động; logic quan hệ được kiểm thử cả trường hợp nhiều con.
- Có commit của người làm, PR, kiểm thử ghi rõ, prompt log thật và người làm giải thích được code.
- Chỉ đánh dấu Done sau khi tích hợp và chạy lại luồng liên quan.

## 13. Việc để giai đoạn sau và điều còn cần xác nhận

Sau môn FE: thiết kế DB/API, xác thực và phân quyền phía server, tích hợp hệ thống học sinh và NVR thử nghiệm được phép, chọn cách phát video theo thiết bị thực tế, rồi mới pilot và đo giá trị kinh tế. Chưa chọn FastAPI hay Node.js chỉ để hoàn thành đồ án FE.

Cần xác nhận với thầy: thời lượng thực tế; có được dùng repo/source chuẩn bị ở nhà hay phải bắt đầu lại; tài liệu/prompt được mang vào; rubric cuối cùng và định dạng nhật ký. Tài liệu này đủ để luyện tập ở nhà, không mặc định là quy chế thi.

Cần xác nhận với trường trước pilot: ai được khóa quyền, xử lý học sinh nghỉ/chuyển thế nào, camera lớp/khu vực, nguồn dữ liệu và quyền dùng API, model/firmware NVR và khả năng truy cập. Các điểm này không chặn bản demo FE hiện tại.

## 14. Nguồn lập tài liệu

- CAMERA_PROJECT_CORE_V2.docx: mục 1–3 (bài toán và phần chưa xác minh), 5–8 (FE/team), 9–10 (roadmap).
- Giáo trình - Thiết kế Web.pdf: trang 3, 75–77, 85–88, 97–102.
- Các quyết định của Leader ngày 03/11/2026: một trường, quyền thông qua con/lớp, tự nắm lõi, nhóm có một thành viên khá hơn và ba thành viên cần hướng dẫn từng bước.
