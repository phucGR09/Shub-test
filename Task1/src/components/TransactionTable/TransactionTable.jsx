import React, { useState } from 'react';
import { Typography } from '../ui';
import { formatCurrency, formatDate, formatDateTime, getTransactionDateTime } from '../../utils';
import './TransactionTable.css';

/**
 * Transaction Table Component
 * Displays transaction data in a paginated table
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 */
const TransactionTable = ({ transactions = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactions.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="transaction-table__empty">
        <Typography variant="h6" color="secondary" align="center">
          Không có dữ liệu giao dịch trong khoảng thời gian này
        </Typography>
      </div>
    );
  }

  return (
    <div className="transaction-table">
      <div className="transaction-table__header">
        <Typography variant="h5" color="primary">
          Chi tiết giao dịch
        </Typography>
        <Typography variant="body2" color="secondary">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, transactions.length)} của {transactions.length} giao dịch
        </Typography>
      </div>

      <div className="transaction-table__container">
        <table className="transaction-table__table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Ngày & Giờ</th>
              <th>Trạm</th>
              <th>Trụ bơm</th>
              <th>Mặt hàng</th>
              <th>Số lượng (lít)</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.map((transaction, index) => {
              const transactionDateTime = getTransactionDateTime(transaction);
              return (
                <tr key={transaction.id || index}>
                  <td>{transaction.stt || startIndex + index + 1}</td>
                  <td>
                    <div className="transaction-table__datetime">
                      <div className="transaction-table__date">
                        {formatDate(transaction.ngay)}
                      </div>
                      {transaction.gio && (
                        <div className="transaction-table__time">
                          {transaction.gio}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{transaction.tram || ''}</td>
                  <td>{transaction.truBom || ''}</td>
                  <td>{transaction.matHang || ''}</td>
                  <td>{transaction.soLuong ? transaction.soLuong.toLocaleString('vi-VN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  }) : ''}</td>
                  <td>{transaction.donGia ? formatCurrency(transaction.donGia) : ''}</td>
                  <td className="transaction-table__amount">
                    {formatCurrency(transaction.thanhTien)}
                  </td>
                  <td>{transaction.tenKhachHang || ''}</td>
                  <td>{transaction.bienSoXe || ''}</td>
                  <td>
                    <span className={`transaction-table__status ${transaction.trangThaiThanhToan === 'Đã thanh toán' ||
                        transaction.trangThaiThanhToan === 'Tiền mặt'
                        ? 'transaction-table__status--paid'
                        : 'transaction-table__status--pending'
                      }`}>
                      {transaction.trangThaiThanhToan || 'Chưa xác định'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="transaction-table__pagination">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="transaction-table__pagination-btn"
          >
            ‹ Trước
          </button>

          <div className="transaction-table__pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`transaction-table__pagination-btn ${currentPage === page ? 'transaction-table__pagination-btn--active' : ''
                    }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="transaction-table__pagination-btn"
          >
            Sau ›
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
