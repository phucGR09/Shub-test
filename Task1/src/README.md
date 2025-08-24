# React Vite Professional Application

Dự án React Vite được cấu trúc theo hướng chuyên nghiệp với khả năng tái sử dụng cao và dễ bảo trì.

## 🚀 Tính năng

- ✅ Màn hình chào mừng với animation (2 giây)
- ✅ Màn hình chính hiển thị "Hello World"
- ✅ Cấu trúc dự án chuyên nghiệp
- ✅ Components tái sử dụng
- ✅ Custom hooks
- ✅ CSS Variables và animations
- ✅ TypeScript ready
- ✅ Responsive design

## 📁 Cấu trúc dự án

```
src/
├── components/          # Các component tái sử dụng
│   ├── ui/             # UI components cơ bản
│   │   ├── LoadingSpinner/
│   │   ├── Typography/
│   │   └── index.js
│   └── layout/         # Layout components
│       ├── AppLayout/
│       └── index.js
├── pages/              # Các trang chính
│   ├── WelcomePage/
│   ├── HomePage/
│   └── index.js
├── hooks/              # Custom hooks
│   ├── useWelcomeScreen.js
│   └── index.js
├── utils/              # Utility functions
│   └── index.js
├── constants/          # Constants và cấu hình
│   └── index.js
├── styles/             # Global styles
│   ├── globals.css
│   └── animations.css
├── context/            # React Context (cho state management)
├── assets/             # Static assets
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

## 🛠️ Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
```

## 🎨 Design System

### Colors

- Primary: `#667eea`
- Secondary: `#764ba2`
- Background: `#f5f5f5`
- Surface: `#ffffff`
- Text Primary: `#333333`
- Text Secondary: `#666666`

### Typography

- Font Family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Font Sizes: xs(12px) → 6xl(64px)
- Font Weights: 300, 400, 500, 600, 700

### Spacing

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px
- 3xl: 64px

## 🧩 Components

### UI Components

#### LoadingSpinner

```jsx
import { LoadingSpinner } from "./components/ui";

<LoadingSpinner size="lg" color="primary" />;
```

#### Typography

```jsx
import { Typography } from "./components/ui";

<Typography variant="h1" color="primary" align="center">
  Hello World
</Typography>;
```

### Hooks

#### useWelcomeScreen

```jsx
import { useWelcomeScreen } from "./hooks";

const showWelcome = useWelcomeScreen(2000); // 2 seconds
```

## 🔧 Utilities

- `delay(ms)` - Delay execution
- `generateId()` - Generate unique ID
- `formatDate(date)` - Format date
- `debounce(func, wait)` - Debounce function
- `throttle(func, limit)` - Throttle function

## 📱 Responsive Design

Dự án được thiết kế responsive với breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Performance

- Lazy loading cho components
- CSS-in-CSS với variables
- Optimized animations
- Tree shaking ready

## 🧪 Testing

```bash
# Chạy tests
npm run test

# Coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Build production
npm run build

# Analyze bundle
npm run analyze
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.
