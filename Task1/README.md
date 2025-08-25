# Task 1: Ứng dụng Phân tích Dữ liệu Giao dịch Cây xăng

## DEMO: 
https://drive.google.com/file/d/1dX4eoHeEPReYCKg71z07hQnjMHS9H4bL/view?usp=sharing
## 1. Mục đích dự án

Một ứng dụng web cho việc phân tích dữ liệu giao dịch tại các cây xăng. Ứng dụng giúp người dùng có thể upload file Excel chứa dữ liệu giao dịch, theo dõi thống kê và các chỉ số kinh doanh một cách trực quan và hiệu quả.

### Các chức năng chính:

- **Upload và xử lý file Excel**: Hỗ trợ import dữ liệu từ file .xlsx/.xls với khả năng tự động phát hiện header và validate dữ liệu
- **Bộ lọc thời gian**: Lọc giao dịch theo khoảng thời gian (ngày, giờ) với giao diện trực quan
- **Thống kê tự động**: Tính toán và hiển thị các chỉ số như tổng số giao dịch, tổng doanh thu, doanh thu trung bình
- **Hiển thị dữ liệu**: Bảng chi tiết với pagination, sorting và responsive design
- **Persistence**: Tự động lưu trữ dữ liệu và trạng thái bộ lọc khi reload trang
- **Giao diện hiện đại**: UI/UX responsive với animation và hiệu ứng chuyển tiếp mượt mà
- **Tối ưu đa thiết bị**: Hoạt động tốt trên desktop, tablet và mobile

## 2. Cấu trúc dự án

```
Task1/
├── public/                     # Static assets
│   ├── index.html             # HTML template
│   └── vite.svg               # App icon
├── src/
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   │   └── Navigation/   # Header navigation
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── DateTimePicker/     # Date/time picker
│   │   │   ├── DateTimeRangePicker/# Date range picker
│   │   │   ├── FileUpload/   # File upload component
│   │   │   ├── ProcessingScreen/ # Loading screen
│   │   │   ├── Toast/        # Notification component
│   │   │   └── Typography/   # Text components
│   │   ├── TransactionTable/ # Data table component
│   │   └── MainScreen.css    # Legacy styles
│   ├── pages/                # Page components
│   │   ├── HomePage/         # Landing page
│   │   ├── TransactionPage/  # Main analysis page
│   │   └── WelcomePage/      # Welcome screen
│   ├── context/              # React Context
│   │   └── TransactionContext.js # Global state management
│   ├── utils/                # Utility functions
│   │   └── excelUtils.js     # Excel processing logic
│   ├── constants/            # App constants
│   │   └── index.js          # Configuration constants
│   ├── styles/               # Global styles
│   │   └── index.css         # CSS variables và reset
│   ├── App.jsx               # Main App component
│   └── main.jsx              # Application entry point
├── package.json              # Dependencies và scripts
├── vite.config.js           # Vite configuration
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

## 3. Công nghệ sử dụng

### Framework và Library chính:
- **React 18.3.1**: Framework frontend chính với Hooks và Context API
- **Vite 5.4.1**: Build tool hiện đại cho development và production
- **React Router DOM**: Routing và navigation giữa các trang

### Thư viện xử lý dữ liệu:
- **xlsx 0.18.5**: Đọc và xử lý file Excel (.xlsx, .xls)
- **react-dropzone 14.2.3**: Component drag & drop cho file upload
- **date-fns 3.6.0**: Thư viện xử lý và format ngày tháng

### UI/UX Libraries:
- **react-icons 5.3.0**: Bộ icon phong phú (HeroIcons, FontAwesome, etc.)
- **CSS3**: Custom CSS với CSS Variables, Flexbox, Grid
- **CSS Animations**: Keyframes và transitions cho hiệu ứng

### Development Tools:
- **@vitejs/plugin-react 4.3.1**: Vite plugin cho React
- **ESLint**: Code linting và formatting

## 4. Logic quản lý State và Bộ nhớ đệm

### 4.1 Quản lý State với React Context

Dự án sử dụng **TransactionContext** để quản lý global state, bao gồm:

```javascript
// TransactionContext.js
const TransactionContext = createContext({
  // Core data
  transactions: [],           // Dữ liệu giao dịch gốc
  filteredTransactions: [],   // Dữ liệu sau khi lọc
  fileName: '',              // Tên file đã upload
  
  // Filter state
  filters: {
    startDate: null,
    endDate: null,
    startTime: '00:00',
    endTime: '23:59'
  },
  
  // UI state
  isRestored: false,         // Trạng thái restore data
  
  // Actions
  setTransactions: () => {},
  updateFilters: () => {},
  clearData: () => {}
});
```

### 4.2 Persistence Logic (Bộ nhớ đệm)

#### **Lưu trữ tự động:**
```javascript
// Lưu data khi có thay đổi
useEffect(() => {
  if (transactions.length > 0) {
    const dataToSave = {
      transactions,
      fileName,
      filters,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('transactionData', JSON.stringify(dataToSave));
  }
}, [transactions, fileName, filters]);
```

#### **Khôi phục khi reload:**
```javascript
// Restore data khi app khởi động
useEffect(() => {
  const savedData = localStorage.getItem('transactionData');
  if (savedData) {
    const { transactions, fileName, filters } = JSON.parse(savedData);
    
    // Restore state
    setTransactions(transactions);
    setFileName(fileName);
    updateFilters(filters);
    setIsRestored(true);
    
    // Hiển thị toast notification
    showToast('Đã khôi phục dữ liệu từ phiên trước');
  }
}, []);
```

### 4.3 Filter State Management

#### **Logic lọc dữ liệu:**
```javascript
const applyFilters = useCallback(() => {
  if (!startDate || !endDate) {
    setFilteredTransactions(transactions);
    return;
  }

  const filtered = transactions.filter(transaction => {
    const transactionDateTime = new Date(transaction.ngayGio);
    const startDateTime = new Date(`${startDate.toDateString()} ${startTime}`);
    const endDateTime = new Date(`${endDate.toDateString()} ${endTime}`);
    
    return transactionDateTime >= startDateTime && 
           transactionDateTime <= endDateTime;
  });
  
  setFilteredTransactions(filtered);
}, [transactions, startDate, endDate, startTime, endTime]);
```

#### **Persistence cho filters:**
- Trạng thái bộ lọc được lưu cùng với dữ liệu
- Khi reload, filters được restore về trạng thái trước đó
- Auto-apply filters sau khi restore

## 5. Cách sử dụng và chạy dự án

### 5.1 Yêu cầu hệ thống
- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **Browser**: Chrome, Firefox, Safari, Edge (modern browsers)

### 5.2 Cài đặt dự án

```bash
# 1. Clone repository
git clone [repository-url]
cd Task1

# 2. Cài đặt dependencies
npm install

# 3. Chạy development server
npm run dev

# 4. Mở browser tại http://localhost:5173
```

### 5.4 Hướng dẫn sử dụng

#### **Bước 1: Upload file Excel**
- Kéo thả file .xlsx hoặc click để chọn file
- File phải có cấu trúc với các cột: Ngày giờ, Trạm, Trụ bơm, Mặt hàng, Số lượng, Đơn giá, Thành tiền

#### **Bước 2: Áp dụng bộ lọc**
- Sử dụng Quick Filters: "Hôm nay", "7 ngày qua", "Tháng này"
- Hoặc chọn custom: Ngày bắt đầu/kết thúc + Giờ bắt đầu/kết thúc
- Click "Áp dụng bộ lọc"

#### **Bước 3: Xem thống kê và dữ liệu**
- Xem thống kê tổng quan ở phần Statistics
- Browse dữ liệu chi tiết trong bảng với pagination
- Dữ liệu tự động lưu, không lo mất khi reload

### 5.5 Cấu trúc file Excel mẫu

| Ngày giờ | Trạm | Trụ bơm | Mặt hàng | Số lượng | Đơn giá | Thành tiền |
|----------|------|---------|----------|----------|---------|------------|
| 2024-01-01 08:30 | 01 | A1 | Xăng RON95 | 50.5 | 25000 | 1262500 |
| 2024-01-01 09:15 | 02 | B2 | Dầu DO | 30.2 | 23000 | 694600 |

---

**Tác giả**: Phan Văn Phúc 
**Ngày tạo**: August 2025  
