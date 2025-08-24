# Biểu Mẫu Giao Dịch Trạm Xăng

Ứng dụng React để nhập dữ liệu giao dịch trạm xăng với kiểm tra hợp lệ và giao diện hiện đại.

## Tính Năng

- **Nhập Dữ Liệu Giao Dịch**: Biểu mẫu nhập thông tin giao dịch trạm xăng
- **Kiểm Tra Hợp Lệ**: Kiểm tra dữ liệu đầu vào bằng Yup
- **Chọn Ngày/Giờ**: Bộ chọn ngày và giờ tương tác
- **Tự Động Tính Toán**: Doanh thu tự động tính từ số lượng và đơn giá
- **Thiết Kế Responsive**: Hiển thị tốt trên máy tính và thiết bị di động
- **Xử Lý Lỗi**: Hiển thị thông báo lỗi rõ ràng và thông báo thành công

## Trường Biểu Mẫu

1. **Thời gian**: Bộ chọn ngày giờ cho thời điểm giao dịch
2. **Số lượng**: Nhập số lít giao dịch
3. **Trụ**: Chọn số trụ từ danh sách
4. **Doanh thu**: Tự động tính tổng tiền (chỉ đọc)
5. **Đơn giá**: Nhập đơn giá mỗi lít

## Công Nghệ Sử Dụng

- React 18
- Vite (Công cụ build)
- React Hook Form (Quản lý biểu mẫu)
- Yup (Kiểm tra hợp lệ)
- React DatePicker (Chọn ngày/giờ)
- CSS3 (Thiết kế giao diện)

## Bắt Đầu

### Yêu Cầu

- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Cài Đặt

1. Clone repo hoặc chuyển đến thư mục dự án
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

### Chạy Ứng Dụng

1. Khởi động server phát triển:
   ```bash
   npm run dev
   ```

2. Mở trình duyệt và truy cập `http://localhost:5173`

### Build Sản Phẩm

```bash
npm run build
```

## Quy Tắc Kiểm Tra Biểu Mẫu

- **Thời gian**: Bắt buộc nhập
- **Số lượng**: Bắt buộc, phải là số dương
- **Trụ**: Bắt buộc, phải chọn từ danh sách
- **Doanh thu**: Tự động tính, chỉ đọc
- **Đơn giá**: Bắt buộc, phải là số dương

## Cấu Trúc Dự Án

```
src/
├── components/
│   ├── TransactionForm.jsx    # Thành phần biểu mẫu chính
│   └── TransactionForm.css    # CSS cho biểu mẫu
├── App.jsx                    # Thành phần chính của ứng dụng
├── App.css                    # CSS cho ứng dụng
├── main.jsx                   # Điểm khởi đầu
└── index.css                  # CSS toàn cục
```

## Hướng Dẫn Sử Dụng

1. Nhập thông tin giao dịch
2. Doanh thu sẽ tự động tính toán
3. Nhấn "Cập nhật" để gửi biểu mẫu
4. Nếu có lỗi, thông báo sẽ hiển thị
5. Nếu thành công, sẽ có thông báo xác nhận

## Tùy Biến

- Thay đổi danh sách trụ trong mảng `pumpOptions` tại `TransactionForm.jsx`
- Điều chỉnh quy tắc kiểm tra trong Yup schema
- Tùy chỉnh giao diện trong các file CSS
- Thêm trường mới nếu cần