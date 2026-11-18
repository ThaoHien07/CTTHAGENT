# AI Agent Quản Trị & Đối Soát Bán Hàng - Phúc An Retail

Hệ thống AI Agent tự động hóa tiếp nhận dữ liệu, lọc đơn trùng POS, loại đơn hủy, xử lý hàng trả, chuẩn hóa kỳ đối chiếu và hỗ trợ Giám đốc Kinh doanh ra quyết định theo quy trình BPMN 3.0.

---

## 📁 Danh Sách File Trong Thư Mục Này:
1. `index.html`: Giao diện chính của ứng dụng Dashboard (theo phong cách Dabang pastel).
2. `style.css`: Bộ stylesheet tùy biến màu sắc, hiệu ứng thẻ card, thanh cuộn và nút bấm.
3. `app.js`: Toàn bộ logic xử lý của AI Agent (Engine làm sạch, biểu đồ Chart.js, tương tác BPMN, AI Copilot).
4. `data.js`: Dữ liệu mẫu chuẩn 18 cửa hàng Phúc An và danh mục sản phẩm (sẵn sàng khi bấm "Dữ Liệu Mẫu").
5. `xlsx.full.min.js`: Thư viện SheetJS offline hỗ trợ đọc, ghi và xử lý file Excel (.xlsx, .xls).
6. `papaparse.min.js`: Thư viện PapaParse đọc và phân tích file CSV tốc độ cao.
7. `vercel.json`: Tệp cấu hình chuẩn tối ưu cho Vercel.
8. `package.json`: Tệp định danh dự án.

---

## 🚀 Hướng Dẫn Đẩy Lên Vercel (Chọn 1 Trong 3 Cách):

### Cách 1: Đẩy Qua GitHub (Khuyên dùng - Nhanh & Tự Động Cập Nhật)
1. Tạo một repository mới trên [GitHub](https://github.com/new) (ví dụ đặt tên: `phuc-an-agent`).
2. Mở terminal tại thư mục này và chạy các lệnh:
   ```bash
   git init
   git add .
   git commit -m "Khoi tao AI Agent Phuc An Retail"
   git branch -M main
   git remote add origin <LINK_GITHUB_REPO_CUA_BAN>
   git push -u origin main
   ```
3. Truy cập [vercel.com](https://vercel.com/) -> Đăng nhập -> Chọn **"Add New..."** -> **"Project"**.
4. Chọn repo GitHub vừa tạo -> Nhấn **Deploy** (Vercel sẽ tự động build và cấp link `.vercel.app` miễn phí trong 10 giây).

---

### Cách 2: Triển Khai Bằng Vercel CLI (Trực tiếp từ dòng lệnh)
1. Mở PowerShell hoặc Terminal tại thư mục này.
2. Chạy lệnh:
   ```bash
   npx vercel
   ```
3. Đăng nhập tài khoản Vercel theo hướng dẫn trên màn hình và chọn `Y` để deploy. Link web public sẽ hiện ra ngay lập tức.

---

### Cách 3: Kéo Thả Trực Tiếp Trên Trình Duyệt (Không Cần Cài Đặt Gì)
1. Nén toàn bộ các file trong thư mục này thành file `.zip`.
2. Truy cập [vercel.com](https://vercel.com/) và vào trang tổng quan Projects.
3. Kéo thả file `.zip` hoặc chọn Import folder để Vercel deploy ngay tức thì.

