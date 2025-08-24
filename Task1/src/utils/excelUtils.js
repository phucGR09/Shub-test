import * as XLSX from "xlsx";
import { format, parse, isValid } from "date-fns";
import { EXCEL_COLUMN_MAPPING } from "../constants/transactions";

/**
 * Find header row by looking for key columns
 * @param {Array} jsonData - Excel data as array of arrays
 * @returns {number} Index of header row, -1 if not found
 */
const findHeaderRow = (jsonData) => {
  const keyColumns = ["STT", "Ngày", "Giờ", "Trạm", "Mặt hàng"];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !Array.isArray(row)) continue;

    // Check if this row contains key column names
    const foundColumns = keyColumns.filter((col) =>
      row.some(
        (cell) =>
          cell &&
          typeof cell === "string" &&
          cell.trim().toLowerCase().includes(col.toLowerCase())
      )
    );

    // If we found at least 3 key columns, this is likely the header row
    if (foundColumns.length >= 3) {
      return i;
    }
  }

  return -1;
};

/**
 * Parse Excel file and convert to JSON
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Array of transaction objects
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Get first worksheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          throw new Error("File Excel phải có ít nhất 2 dòng (header + data)");
        }

        // Find header row automatically
        const headerRowIndex = findHeaderRow(jsonData);
        if (headerRowIndex === -1) {
          throw new Error("Không tìm thấy header row trong file Excel");
        }

        console.log("Header row found at index:", headerRowIndex);

        // Parse headers and data
        const headers = jsonData[headerRowIndex];
        const rows = jsonData.slice(headerRowIndex + 1);

        console.log("Headers found:", headers);
        console.log("Total data rows:", rows.length);

        // Map data to objects
        const transactions = rows
          .filter((row) =>
            row.some(
              (cell) => cell !== null && cell !== undefined && cell !== ""
            )
          )
          .map((row, index) => {
            const transaction = { id: index + 1 };

            headers.forEach((header, colIndex) => {
              if (!header) return; // Skip empty headers

              // Clean header name and find mapping
              const cleanHeader = header.toString().trim();
              const mappedKey =
                EXCEL_COLUMN_MAPPING[cleanHeader] ||
                Object.keys(EXCEL_COLUMN_MAPPING).find(
                  (key) => key.toLowerCase() === cleanHeader.toLowerCase()
                );

              if (mappedKey) {
                const finalKey = EXCEL_COLUMN_MAPPING[mappedKey] || mappedKey;
                let value = row[colIndex];

                // Parse specific data types
                if (finalKey === "ngay" || finalKey === "ngayThanhToan") {
                  value = parseExcelDate(value);
                } else if (
                  finalKey === "thanhTien" ||
                  finalKey === "donGia" ||
                  finalKey === "soLuong"
                ) {
                  value = parseNumber(value);
                } else if (value && typeof value === "string") {
                  value = value.trim(); // Clean string values
                }

                transaction[finalKey] = value;
              }
            });

            return transaction;
          });

        resolve(transactions);
      } catch (error) {
        reject(new Error(`Lỗi đọc file Excel: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Lỗi đọc file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Parse Excel date (can be Excel serial number or string)
 * @param {any} value - Date value from Excel
 * @returns {Date|null} Parsed date or null
 */
export const parseExcelDate = (value) => {
  if (!value) return null;

  // If it's already a Date object
  if (value instanceof Date) return value;

  // If it's an Excel serial number
  if (typeof value === "number") {
    try {
      // Excel date serial number starts from 1900-01-01
      const excelDate = XLSX.SSF.parse_date_code(value);
      if (excelDate) {
        return new Date(excelDate.y, excelDate.m - 1, excelDate.d);
      }
    } catch (e) {
      // Fallback for serial number
      const date = new Date((value - 25569) * 86400 * 1000);
      if (isValid(date)) return date;
    }
  }

  // If it's a string, try to parse
  if (typeof value === "string") {
    const trimmed = value.trim();

    // Try different date formats commonly used in Vietnamese Excel files
    const formats = [
      "dd/MM/yyyy",
      "MM/dd/yyyy",
      "yyyy-MM-dd",
      "dd-MM-yyyy",
      "dd/MM/yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm",
      "yyyy-MM-dd HH:mm:ss",
      "yyyy-MM-dd HH:mm",
    ];

    for (const formatStr of formats) {
      try {
        const parsed = parse(trimmed, formatStr, new Date());
        if (isValid(parsed)) return parsed;
      } catch (e) {
        // Continue to next format
      }
    }

    // Try native Date parsing as last resort
    try {
      const nativeDate = new Date(trimmed);
      if (isValid(nativeDate)) return nativeDate;
    } catch (e) {
      // Continue
    }
  }

  return null;
};

/**
 * Parse number from string or number
 * @param {any} value - Value to parse
 * @returns {number} Parsed number
 */
export const parseNumber = (value) => {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const trimmed = value.trim();

    // Handle Vietnamese number formatting
    // Remove common currency symbols and text
    let cleaned = trimmed
      .replace(/[₫VNĐvnđ]/gi, "") // Remove currency symbols
      .replace(/Tiền mặt/gi, "") // Remove "Tiền mặt" text
      .replace(/\s+/g, "") // Remove all spaces
      .replace(/,/g, "") // Remove commas (thousands separator)
      .replace(/\./g, ""); // Remove dots if used as thousands separator

    // Try to parse the cleaned number
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== "number") return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy");
};

/**
 * Format date time for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date time string
 */
export const formatDateTime = (date) => {
  if (!date || !isValid(date)) return "";
  return format(date, "dd/MM/yyyy HH:mm");
};

/**
 * Combine date and time from transaction
 * @param {Object} transaction - Transaction object
 * @returns {Date|null} Combined date time or null
 */
export const getTransactionDateTime = (transaction) => {
  if (!transaction.ngay) return null;

  const baseDate = transaction.ngay;
  if (!isValid(baseDate)) return null;

  // If we have time information in 'gio' field
  if (transaction.gio && typeof transaction.gio === "string") {
    const timeStr = transaction.gio.trim();
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);

    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

      const dateTime = new Date(baseDate);
      dateTime.setHours(hours, minutes, seconds, 0);
      return dateTime;
    }
  }

  return baseDate;
};

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transactions
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByDate = (transactions, startDate, endDate) => {
  if (!startDate || !endDate || !Array.isArray(transactions)) {
    return transactions || [];
  }

  return transactions.filter((transaction) => {
    const transactionDate = transaction.ngay;
    if (!transactionDate || !isValid(transactionDate)) return false;

    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Filter transactions by date time range (including time)
 * @param {Array} transactions - Array of transactions
 * @param {Date} startDateTime - Start date time
 * @param {Date} endDateTime - End date time
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByDateTime = (
  transactions,
  startDateTime,
  endDateTime
) => {
  if (!startDateTime || !endDateTime || !Array.isArray(transactions)) {
    return transactions || [];
  }

  return transactions.filter((transaction) => {
    const transactionDateTime = getTransactionDateTime(transaction);
    if (!transactionDateTime || !isValid(transactionDateTime)) return false;

    return (
      transactionDateTime >= startDateTime && transactionDateTime <= endDateTime
    );
  });
};

/**
 * Calculate total amount from transactions
 * @param {Array} transactions - Array of transactions
 * @returns {number} Total amount
 */
export const calculateTotalAmount = (transactions) => {
  if (!Array.isArray(transactions)) return 0;

  return transactions.reduce((total, transaction) => {
    const amount = transaction.thanhTien || 0;
    return total + (typeof amount === "number" ? amount : 0);
  }, 0);
};

/**
 * Calculate detailed statistics from transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Detailed statistics
 */
export const calculateTransactionStatistics = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      totalTransactions: 0,
      totalAmount: 0,
      totalQuantity: 0,
      averageAmount: 0,
      averageQuantity: 0,
      uniqueStations: 0,
      uniqueProducts: 0,
      timeRange: null,
    };
  }

  const totalAmount = calculateTotalAmount(transactions);
  const totalQuantity = transactions.reduce((total, transaction) => {
    const quantity = transaction.soLuong || 0;
    return total + (typeof quantity === "number" ? quantity : 0);
  }, 0);

  const uniqueStations = new Set(
    transactions
      .map((t) => t.tram)
      .filter((station) => station && station.toString().trim())
  ).size;

  const uniqueProducts = new Set(
    transactions
      .map((t) => t.matHang)
      .filter((product) => product && product.toString().trim())
  ).size;

  // Find time range
  const dateTimes = transactions
    .map((t) => getTransactionDateTime(t))
    .filter((dt) => dt && isValid(dt))
    .sort((a, b) => a.getTime() - b.getTime());

  const timeRange =
    dateTimes.length > 0
      ? {
          earliest: dateTimes[0],
          latest: dateTimes[dateTimes.length - 1],
        }
      : null;

  return {
    totalTransactions: transactions.length,
    totalAmount,
    totalQuantity,
    averageAmount:
      transactions.length > 0 ? totalAmount / transactions.length : 0,
    averageQuantity:
      transactions.length > 0 ? totalQuantity / transactions.length : 0,
    uniqueStations,
    uniqueProducts,
    timeRange,
  };
};

/**
 * Group transactions by time period
 * @param {Array} transactions - Array of transactions
 * @param {string} period - 'hour', 'day', 'week', 'month'
 * @returns {Object} Grouped transactions with statistics
 */
export const groupTransactionsByPeriod = (transactions, period = "day") => {
  if (!Array.isArray(transactions)) return {};

  const groups = {};

  transactions.forEach((transaction) => {
    const dateTime = getTransactionDateTime(transaction);
    if (!dateTime || !isValid(dateTime)) return;

    let key;
    switch (period) {
      case "hour":
        key = format(dateTime, "yyyy-MM-dd HH:00");
        break;
      case "day":
        key = format(dateTime, "yyyy-MM-dd");
        break;
      case "week":
        // Start of week (Monday)
        const startOfWeek = new Date(dateTime);
        startOfWeek.setDate(dateTime.getDate() - dateTime.getDay() + 1);
        key = format(startOfWeek, "yyyy-MM-dd");
        break;
      case "month":
        key = format(dateTime, "yyyy-MM");
        break;
      default:
        key = format(dateTime, "yyyy-MM-dd");
    }

    if (!groups[key]) {
      groups[key] = {
        transactions: [],
        statistics: null,
      };
    }

    groups[key].transactions.push(transaction);
  });

  // Calculate statistics for each group
  Object.keys(groups).forEach((key) => {
    groups[key].statistics = calculateTransactionStatistics(
      groups[key].transactions
    );
  });

  return groups;
};

/**
 * Get hourly distribution of transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Hourly distribution data
 */
export const getHourlyDistribution = (transactions) => {
  if (!Array.isArray(transactions)) return [];

  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: 0,
    totalAmount: 0,
    transactions: [],
  }));

  transactions.forEach((transaction) => {
    const dateTime = getTransactionDateTime(transaction);
    if (!dateTime || !isValid(dateTime)) return;

    const hour = dateTime.getHours();
    hourlyData[hour].count++;
    hourlyData[hour].totalAmount += transaction.thanhTien || 0;
    hourlyData[hour].transactions.push(transaction);
  });

  return hourlyData;
};
