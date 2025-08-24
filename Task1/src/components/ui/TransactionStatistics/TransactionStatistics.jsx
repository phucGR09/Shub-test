import React from 'react';
import Typography from '../Typography';
import { formatCurrency, formatDateTime } from '../../../utils/excelUtils';
import './TransactionStatistics.css';
import { SiVirustotal } from "react-icons/si";
import { TbMoneybag } from "react-icons/tb";
import { MdNumbers } from "react-icons/md";
import { IoIosWater } from "react-icons/io";
import { MdOutlineAttachMoney } from "react-icons/md";
import { BiSolidPurchaseTag } from "react-icons/bi";
import { FaRegCalendarDays } from "react-icons/fa6";
/**
 * Transaction Statistics Component
 * @param {Object} props
 * @param {Object} props.statistics - Statistics object
 * @param {boolean} props.loading - Loading state
 */
const TransactionStatistics = ({ statistics, loading = false }) => {
  if (loading) {
    return (
      <div className="transaction-stats">
        <div className="transaction-stats__loading">
          Đang tính toán thống kê...
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="transaction-stats">
        <Typography variant="body2" color="secondary">
          Chưa có dữ liệu để hiển thị thống kê
        </Typography>
      </div>
    );
  }

  const {
    totalTransactions,
    totalAmount,
    totalQuantity,
    averageAmount,
    averageQuantity,
    uniqueStations,
    uniqueProducts,
    timeRange
  } = statistics;

  return (
    <div className="transaction-stats">
      <Typography variant="h6" color="primary" className="transaction-stats__title">
        <SiVirustotal color='primary' /> Thống kê giao dịch
      </Typography >

      <div className="transaction-stats__grid">
        {/* Main metrics */}
        <div className="transaction-stats__card transaction-stats__card--primary">
          <div className="transaction-stats__icon">
            <TbMoneybag color='primary' />
          </div>
          <div className="transaction-stats__content">
            <div className="transaction-stats__value">
              {formatCurrency(totalAmount)}
            </div>
            <div className="transaction-stats__label">Tổng doanh thu</div>
          </div>
        </div>

        <div className="transaction-stats__card">
          <div className="transaction-stats__icon">
            <MdNumbers color='primary' />
          </div>
          <div className="transaction-stats__content">
            <div className="transaction-stats__value">
              {totalTransactions.toLocaleString('vi-VN')}
            </div>
            <div className="transaction-stats__label">Số giao dịch</div>
          </div>
        </div>

        <div className="transaction-stats__card">
          <div className="transaction-stats__icon">
            <IoIosWater color='primary' />
          </div>
          <div className="transaction-stats__content">
            <div className="transaction-stats__value">
              {totalQuantity.toLocaleString('vi-VN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} lít
            </div>
            <div className="transaction-stats__label">Tổng số lượng</div>
          </div>
        </div>

        <div className="transaction-stats__card">
          <div className="transaction-stats__icon">
            <MdOutlineAttachMoney color='primary' />
          </div>
          <div className="transaction-stats__content">
            <div className="transaction-stats__value">
              {formatCurrency(averageAmount)}
            </div>
            <div className="transaction-stats__label">Trung bình/giao dịch</div>
          </div>
        </div>

        {/* <div className="transaction-stats__card">
          <div className="transaction-stats__icon">🏪</div>
          <div className="transaction-stats__content">
            <div className="transaction-stats__value">
              {uniqueStations}
            </div>
            <div className="transaction-stats__label">Số trạm</div>
          </div>
        </div> */}

        <div className="transaction-stats__card">
          <div className="transaction-stats__icon">
            <BiSolidPurchaseTag color='primary' />
          </div>
          <div className="transaction-stats__content">
            <div className="transaction-stats__value">
              {uniqueProducts}
            </div>
            <div className="transaction-stats__label">Loại sản phẩm</div>
          </div>
        </div>
      </div>

      {/* Time range */}
      {timeRange && (
        <div className="transaction-stats__time-range">
          <Typography variant="body2" color="secondary">
            <FaRegCalendarDays />
            Khoảng thời gian: {formatDateTime(timeRange.earliest)} → {formatDateTime(timeRange.latest)}
          </Typography>
        </div>
      )}

      {/* Additional metrics */}
      <div className="transaction-stats__additional">
        <div className="transaction-stats__metric">
          <span className="transaction-stats__metric-label">Trung bình số lượng/giao dịch:</span>
          <span className="transaction-stats__metric-value">
            {averageQuantity.toLocaleString('vi-VN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} lít
          </span>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatistics;
