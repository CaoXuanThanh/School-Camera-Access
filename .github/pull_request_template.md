## Thông tin PR

- **Task ID:** (ví dụ: `DASH-03`, `LOGIN-02`, `VIEW-04`, `PROFILE-03`)
- **Người thực hiện:**
- **Đã làm:**
- **File thay đổi:**
- **Đã kiểm tra:** (tài khoản demo, 375px / 1280px, trạng thái rỗng/lỗi, không lỗi console)
- **Chưa làm hoặc đang lỗi:**
- **Prompt log:** `docs/prompt-logs/tvN.md`
- **Ảnh minh chứng:** `docs/evidence/tvN/...`

## Checklist trước khi gửi review

- [ ] Chỉ chỉnh sửa các file trong phạm vi được giao (không sửa core hoặc `global.css`).
- [ ] Gọi API qua `service` đúng theo `docs/data-contract.md`, không đọc/ghi `localStorage` trực tiếp và không tự tính quyền ở UI.
- [ ] Không có lỗi console ở luồng mình phụ trách.
- [ ] Có giải thích được sự kiện → service → dữ liệu → DOM trong phần mình làm.
