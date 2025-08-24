import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Typography,
  FileUpload,
  LoadingSpinner,
  Toast,
  ProcessingScreen
} from '../../components/ui';
import DateTimePicker from '../../components/ui/DateTimePicker/DateTimePicker';
import TransactionStatistics from '../../components/ui/TransactionStatistics/TransactionStatistics';
import { TransactionTable } from '../../components';
import { useTransactionContext } from '../../context';
import {
  parseExcelFile,
  calculateTransactionStatistics,
  formatCurrency
} from '../../utils';
import './TransactionPage.css';
import { FaFolderOpen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
/**
 * Transaction Page Component
 * Main page for uploading and analyzing Excel transaction data
 */
const TransactionPage = () => {
  const {
    transactions,
    loading,
    error,
    fileInfo,
    isRestored,
    setTransactions,
    setLoading,
    setError,
    setFileInfo,
    clearData
  } = useTransactionContext();

  // Filter states
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);
  const [filterStartTime, setFilterStartTime] = useState('00:00');
  const [filterEndTime, setFilterEndTime] = useState('23:59');
  const [hasActiveFilter, setHasActiveFilter] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Animation states
  const [showProcessing, setShowProcessing] = useState(false);
  const [componentsVisible, setComponentsVisible] = useState({
    fileInfo: false,
    filters: false,
    statistics: false,
    table: false
  });

  // localStorage keys for filters
  const FILTER_STORAGE_KEY = 'gas_station_filters';

  // Save filter states to localStorage
  const saveFilterStates = useCallback(() => {
    const filterData = {
      startDate: filterStartDate?.toISOString(),
      endDate: filterEndDate?.toISOString(),
      startTime: filterStartTime,
      endTime: filterEndTime,
      hasActiveFilter
    };
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterData));
    } catch (error) {
      console.warn('Failed to save filter states:', error);
    }
  }, [filterStartDate, filterEndDate, filterStartTime, filterEndTime, hasActiveFilter]);

  // Restore filter states from localStorage
  useEffect(() => {
    if (isRestored && transactions.length > 0) {
      try {
        const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
        if (savedFilters) {
          const filterData = JSON.parse(savedFilters);
          setFilterStartDate(filterData.startDate ? new Date(filterData.startDate) : null);
          setFilterEndDate(filterData.endDate ? new Date(filterData.endDate) : null);
          setFilterStartTime(filterData.startTime || '00:00');
          setFilterEndTime(filterData.endTime || '23:59');
          setHasActiveFilter(filterData.hasActiveFilter || false);
        }

        // Show toast notification
        setToast({
          show: true,
          message: 'Đã khôi phục dữ liệu từ phiên trước',
          type: 'success'
        });
      } catch (error) {
        console.warn('Failed to restore filter states:', error);
      }
    }
  }, [isRestored, transactions.length]);

  // Save filter states when they change
  useEffect(() => {
    if (transactions.length > 0) {
      saveFilterStates();
    }
  }, [filterStartDate, filterEndDate, filterStartTime, filterEndTime, hasActiveFilter, saveFilterStates, transactions.length]);

  // Animate components when data is loaded
  useEffect(() => {
    if (transactions.length > 0 && !showProcessing) {
      const timeouts = [
        setTimeout(() => setComponentsVisible(prev => ({ ...prev, fileInfo: true })), 100),
        setTimeout(() => setComponentsVisible(prev => ({ ...prev, filters: true })), 300),
        setTimeout(() => setComponentsVisible(prev => ({ ...prev, statistics: true })), 500),
        setTimeout(() => setComponentsVisible(prev => ({ ...prev, table: true })), 700)
      ];

      return () => timeouts.forEach(clearTimeout);
    }
  }, [transactions.length, showProcessing]);

  // Create datetime objects for filtering
  const filterStartDateTime = useMemo(() => {
    if (!filterStartDate || !filterStartTime) return null;
    const [hours, minutes] = filterStartTime.split(':').map(Number);
    const dateTime = new Date(filterStartDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  }, [filterStartDate, filterStartTime]);

  const filterEndDateTime = useMemo(() => {
    if (!filterEndDate || !filterEndTime) return null;
    const [hours, minutes] = filterEndTime.split(':').map(Number);
    const dateTime = new Date(filterEndDate);
    dateTime.setHours(hours, minutes, 59, 999);
    return dateTime;
  }, [filterEndDate, filterEndTime]);

  // Filter transactions based on datetime range
  const filteredTransactions = useMemo(() => {
    if (!hasActiveFilter || !filterStartDateTime || !filterEndDateTime) {
      return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = transaction.ngay;
      if (!transactionDate || !(transactionDate instanceof Date)) return false;

      // Combine date with time if available
      let transactionDateTime = new Date(transactionDate);

      if (transaction.gio && typeof transaction.gio === 'string') {
        const timeMatch = transaction.gio.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
          transactionDateTime.setHours(hours, minutes, seconds, 0);
        }
      }

      return transactionDateTime >= filterStartDateTime && transactionDateTime <= filterEndDateTime;
    });
  }, [transactions, hasActiveFilter, filterStartDateTime, filterEndDateTime]);

  // Calculate statistics
  const statistics = useMemo(() => {
    return calculateTransactionStatistics(filteredTransactions);
  }, [filteredTransactions]);

  // Filter handlers
  const handleApplyFilter = useCallback(() => {
    if (filterStartDate && filterEndDate && filterStartTime && filterEndTime) {
      setHasActiveFilter(true);
    }
  }, [filterStartDate, filterEndDate, filterStartTime, filterEndTime]);

  const handleClearFilter = useCallback(() => {
    setHasActiveFilter(false);
    setFilterStartDate(null);
    setFilterEndDate(null);
    setFilterStartTime('00:00');
    setFilterEndTime('23:59');
  }, []);

  const handleFileSelect = async (file, errorMessage = null) => {
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    if (!file) {
      setError('Vui lòng chọn file');
      return;
    }

    setLoading(true);
    setError(null);
    setShowProcessing(true);

    try {
      // Parse Excel file
      const parsedTransactions = await parseExcelFile(file);

      if (parsedTransactions.length === 0) {
        throw new Error('File Excel không có dữ liệu hợp lệ');
      }

      // Show processing for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Set file info
      setFileInfo({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        recordCount: parsedTransactions.length
      });

      // Set transactions
      setTransactions(parsedTransactions);

      // Auto-set initial filter dates based on transaction data
      const dateTimes = parsedTransactions
        .map(t => t.ngay)
        .filter(date => date && !isNaN(date.getTime()))
        .sort((a, b) => a - b);

      if (dateTimes.length > 0) {
        setFilterStartDate(dateTimes[0]);
        setFilterEndDate(dateTimes[dateTimes.length - 1]);
        setFilterStartTime('00:00');
        setFilterEndTime('23:59');
      }

      setShowProcessing(false);

    } catch (err) {
      setError(err.message);
      setShowProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    clearData();
    handleClearFilter();
    setComponentsVisible({
      fileInfo: false,
      filters: false,
      statistics: false,
      table: false
    });
    // Clear filter states from localStorage
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear filter states:', error);
    }
  };

  return (
    <div className="transaction-page">
      {/* Processing Screen */}
      {showProcessing && <ProcessingScreen />}

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* <div className="transaction-page__header">
        <Typography variant="h2" color="primary" align="center">
          Phân tích dữ liệu giao dịch cây xăng
        </Typography>
        <Typography variant="body1" color="secondary" align="center">
          Tải lên file Excel để xem chi tiết giao dịch và thống kê doanh thu
        </Typography>
      </div> */}

      {!transactions.length ? (
        <div className="transaction-page__upload animate-fade-in">
          <FileUpload
            onFileSelect={handleFileSelect}
            loading={loading}
            error={error}
          />
        </div>
      ) : (
        <div className="transaction-page__content">
          {/* File Info */}
          {fileInfo && (
            <div className={`transaction-page__file-info ${componentsVisible.fileInfo ? 'animate-slide-up' : 'animate-hidden'}`}>
              <div className="transaction-page__file-info-content">
                <Typography variant="h6" color='primary'>
                  <FaFolderOpen width={20} height={20} color='#3b82f6' />
                  {fileInfo.name}
                </Typography>
                <Typography variant="body2" color="secondary">
                  {fileInfo.recordCount} giao dịch • {(fileInfo.size / 1024).toFixed(1)} KB
                </Typography>
              </div>
              <button
                className="transaction-page__clear-btn"
                onClick={handleClearData}
              >
                <MdDelete width={24} height={24} />
                Xóa dữ liệu
              </button>
            </div>
          )}

          {/* Filters Section */}
          <div className={`transaction-page__filters-section ${componentsVisible.filters ? 'animate-slide-up' : 'animate-hidden'}`}>
            <DateTimePicker
              startDate={filterStartDate}
              endDate={filterEndDate}
              startTime={filterStartTime}
              endTime={filterEndTime}
              onStartDateChange={setFilterStartDate}
              onEndDateChange={setFilterEndDate}
              onStartTimeChange={setFilterStartTime}
              onEndTimeChange={setFilterEndTime}
              onApplyFilter={handleApplyFilter}
              onClearFilter={handleClearFilter}
              hasActiveFilter={hasActiveFilter}
            />
          </div>

          {/* Main Content */}
          <div className="transaction-page__main-content">
            {/* Statistics Section */}
            <div className={`transaction-page__statistics-section ${componentsVisible.statistics ? 'animate-slide-up' : 'animate-hidden'}`}>
              <TransactionStatistics
                statistics={statistics}
                loading={loading}
              />
            </div>

            {/* Transaction Table */}
            <div className={`transaction-page__table ${componentsVisible.table ? 'animate-slide-up' : 'animate-hidden'}`}>
              <TransactionTable transactions={filteredTransactions} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
