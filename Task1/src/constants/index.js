// Timing constants
export const TIMING = {
  WELCOME_SCREEN_DURATION: 2000, // 2 seconds
  ANIMATION_DURATION: {
    FAST: 300,
    NORMAL: 500,
    SLOW: 800,
  },
};

// App configuration
export const APP_CONFIG = {
  NAME: "SHub - Gas Station Analytics",
  VERSION: "1.0.0",
  DESCRIPTION: "Ứng dụng phân tích dữ liệu giao dịch cây xăng",
};

// Route paths
export const ROUTES = {
  HOME: "/",
  TRANSACTIONS: "/transactions",
  ANALYTICS: "/analytics",
};

// Export transaction constants
export * from "./transactions";
