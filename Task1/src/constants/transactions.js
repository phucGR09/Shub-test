// Transaction data structure
export const TRANSACTION_FIELDS = {
  STT: "stt",
  NGAY: "ngay",
  GIO: "gio",
  TRAM: "tram",
  TRU_BOM: "truBom",
  MAT_HANG: "matHang",
  SO_LUONG: "soLuong",
  DON_GIA: "donGia",
  THANH_TIEN: "thanhTien",
  TRANG_THAI_THANH_TOAN: "trangThaiThanhToan",
  MA_KHACH_HANG: "maKhachHang",
  TEN_KHACH_HANG: "tenKhachHang",
  LOAI_KHACH_HANG: "loaiKhachHang",
  NGAY_THANH_TOAN: "ngayThanhToan",
  NHAN_VIEN: "nhanVien",
  BIEN_SO_XE: "bienSoXe",
  TRANG_THAI_HOA_DON: "trangThaiHoaDon",
};

// Excel column mapping (Vietnamese to English)
export const EXCEL_COLUMN_MAPPING = {
  STT: "stt",
  Ngày: "ngay",
  Giờ: "gio",
  Trạm: "tram",
  "Trụ bơm": "truBom",
  "Mặt hàng": "matHang",
  "Số lượng": "soLuong",
  "Đơn giá": "donGia",
  "Thành tiền (VND)": "thanhTien", // Updated to match actual Excel format
  "Thành tiền (VNĐ)": "thanhTien", // Keep both variants
  "Trạng thái thanh toán": "trangThaiThanhToan",
  "Mã khách hàng": "maKhachHang",
  "Tên khách hàng": "tenKhachHang",
  "Loại khách hàng": "loaiKhachHang",
  "Ngày thanh toán": "ngayThanhToan",
  "Nhân viên": "nhanVien",
  "Biển số xe": "bienSoXe",
  "Trạng thái hoá đơn": "trangThaiHoaDon",
};

// File upload settings
export const FILE_UPLOAD = {
  ACCEPTED_TYPES: {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "application/vnd.ms-excel": [".xls"],
  },
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 1,
};
