# Gas Station Analytics - Ứng dụng phân tích dữ liệu cây xăng

Ứng dụng React Vite chuyên nghiệp để phân tích dữ liệu giao dịch cây xăng từ file Excel.

## 🚀 Tính năng chính

- ✅ **Upload file Excel**: Tải lên file dữ liệu giao dịch (.xlsx, .xls)
- ✅ **Phân tích dữ liệu**: Hiển thị và phân tích dữ liệu giao dịch chi tiết
- ✅ **Lọc theo thời gian**: Tính tổng doanh thu trong khoảng thời gian tùy chọn
- ✅ **Hiển thị bảng**: Xem chi tiết từng giao dịch với phân trang
- ✅ **Responsive design**: Tối ưu cho mọi thiết bị
- ✅ **Professional UI**: Giao diện đẹp, dễ sử dụng

## 📊 Dữ liệu Excel hỗ trợ

Ứng dụng hỗ trợ file Excel với các cột sau:

| Cột                   | Mô tả                         |
| --------------------- | ----------------------------- |
| STT                   | Số thứ tự                     |
| Ngày                  | Ngày giao dịch                |
| Giờ                   | Giờ giao dịch                 |
| Trạm                  | Tên trạm xăng                 |
| Trụ bơm               | Số trụ bơm                    |
| Mặt hàng              | Loại xăng/dầu                 |
| Số lượng              | Số lít                        |
| Đơn giá               | Giá trên lít                  |
| Thành tiền (VNĐ)      | Tổng tiền                     |
| Trạng thái thanh toán | Đã thanh toán/Chưa thanh toán |
| Mã khách hàng         | ID khách hàng                 |
| Tên khách hàng        | Tên khách hàng                |
| Loại khách hàng       | VIP/Thường                    |
| Ngày thanh toán       | Ngày thanh toán               |
| Nhân viên             | Tên nhân viên                 |
| Biển số xe            | Biển số xe                    |
| Trạng thái hoá đơn    | Trạng thái hóa đơn            |

## 🛠️ Cài đặt và chạy

```bash
# Clone dự án
git clone [repository-url]
cd Task1

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build
```

## 🎯 Cách sử dụng

### 1. Khởi động ứng dụng

- Mở trình duyệt tại `http://localhost:5173`
- Xem màn hình chào mừng (2 giây)
- Điều hướng đến trang "Phân tích dữ liệu"

### 2. Upload file Excel

- Kéo thả file Excel vào vùng upload
- Hoặc click để chọn file từ máy tính
- File tối đa 10MB, định dạng .xlsx hoặc .xls

### 3. Phân tích dữ liệu

- Xem tổng số giao dịch và doanh thu
- Sử dụng bộ lọc thời gian để tính toán theo khoảng
- Xem chi tiết từng giao dịch trong bảng
- Phân trang để duyệt qua nhiều giao dịch
