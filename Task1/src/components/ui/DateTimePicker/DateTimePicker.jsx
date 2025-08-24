import React from 'react';
import Typography from '../Typography';
import './DateTimePicker.css';
import { HiFilter } from "react-icons/hi";
/**
 * Separate Date and Time Picker Component
 * @param {Object} props
 * @param {Date} props.startDate - Start date
 * @param {Date} props.endDate - End date
 * @param {string} props.startTime - Start time (HH:mm format)
 * @param {string} props.endTime - End time (HH:mm format)
 * @param {Function} props.onStartDateChange - Start date change handler
 * @param {Function} props.onEndDateChange - End date change handler
 * @param {Function} props.onStartTimeChange - Start time change handler
 * @param {Function} props.onEndTimeChange - End time change handler
 * @param {Function} props.onApplyFilter - Apply filter handler
 * @param {Function} props.onClearFilter - Clear filter handler
 * @param {boolean} props.hasActiveFilter - Whether filter is active
 */
const DateTimePicker = ({
  startDate,
  endDate,
  startTime,
  endTime,
  onStartDateChange,
  onEndDateChange,
  onStartTimeChange,
  onEndTimeChange,
  onApplyFilter,
  onClearFilter,
  hasActiveFilter = false
}) => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onStartDateChange(date);
  };

  const handleEndDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onEndDateChange(date);
  };  // Quick filter presets
  const applyQuickFilter = (type) => {
    const now = new Date();
    let start, end;

    switch (type) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        onStartTimeChange('00:00');
        onEndTimeChange('23:59');
        break;
      case 'yesterday':
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        onStartTimeChange('00:00');
        onEndTimeChange('23:59');
        break;
      case 'thisWeek':
        const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
        start = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        onStartTimeChange('00:00');
        onEndTimeChange('23:59');
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        onStartTimeChange('00:00');
        onEndTimeChange('23:59');
        break;
      case 'last7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        onStartTimeChange('00:00');
        onEndTimeChange('23:59');
        break;
      case 'last30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        onStartTimeChange('00:00');
        onEndTimeChange('23:59');
        break;
      default:
        return;
    }

    onStartDateChange(start);
    onEndDateChange(end);
  };

  const isFilterValid = startDate && endDate && startTime && endTime;

  return (
    <div className="datetime-picker">
      <div className="datetime-picker__header">
        <Typography variant="h6" color="primary">
          <HiFilter color='white' /> <span style={{ color: 'white' }}>Bộ lọc thời gian</span>
        </Typography>
        {hasActiveFilter && (
          <div className="datetime-picker__status">
            <span className="datetime-picker__status-indicator">●</span>
            Đã áp dụng
          </div>
        )}
      </div>

      {/* Quick filters */}
      <div className="datetime-picker__quick-section">
        <Typography variant="body2" color="secondary" className="datetime-picker__section-title">
          Bộ lọc nhanh
        </Typography>
        <div className="datetime-picker__quick-filters">
          <button
            type="button"
            className="datetime-picker__quick-btn"
            onClick={() => applyQuickFilter('today')}
          >
            Hôm nay
          </button>
          <button
            type="button"
            className="datetime-picker__quick-btn"
            onClick={() => applyQuickFilter('yesterday')}
          >
            Hôm qua
          </button>
          <button
            type="button"
            className="datetime-picker__quick-btn"
            onClick={() => applyQuickFilter('last7days')}
          >
            7 ngày qua
          </button>
          <button
            type="button"
            className="datetime-picker__quick-btn"
            onClick={() => applyQuickFilter('last30days')}
          >
            30 ngày qua
          </button>
          <button
            type="button"
            className="datetime-picker__quick-btn"
            onClick={() => applyQuickFilter('thisWeek')}
          >
            Tuần này
          </button>
          <button
            type="button"
            className="datetime-picker__quick-btn"
            onClick={() => applyQuickFilter('thisMonth')}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* DateTime range selection */}
      <div className="datetime-picker__datetime-section">
        <Typography variant="body2" color="secondary" className="datetime-picker__section-title">
          Chọn khoảng thời gian
        </Typography>

        {/* Start DateTime */}
        <div className="datetime-picker__datetime-group">
          <div className="datetime-picker__group-title">Bắt đầu</div>
          <div className="datetime-picker__datetime-row">
            <div className="datetime-picker__field">
              <label className="datetime-picker__field-label">Ngày</label>
              <input
                type="date"
                value={formatDateForInput(startDate)}
                onChange={handleStartDateChange}
                className="datetime-picker__input"
                max={formatDateForInput(endDate)}
              />
            </div>
            <div className="datetime-picker__field">
              <label className="datetime-picker__field-label">Giờ</label>
              <input
                type="time"
                value={startTime || '00:00'}
                onChange={(e) => onStartTimeChange(e.target.value)}
                className="datetime-picker__input"
              />
            </div>
          </div>
        </div>

        {/* End DateTime */}
        <div className="datetime-picker__datetime-group">
          <div className="datetime-picker__group-title">Kết thúc</div>
          <div className="datetime-picker__datetime-row">
            <div className="datetime-picker__field">
              <label className="datetime-picker__field-label">Ngày</label>
              <input
                type="date"
                value={formatDateForInput(endDate)}
                onChange={handleEndDateChange}
                className="datetime-picker__input"
                min={formatDateForInput(startDate)}
              />
            </div>
            <div className="datetime-picker__field">
              <label className="datetime-picker__field-label">Giờ</label>
              <input
                type="time"
                value={endTime || '23:59'}
                onChange={(e) => onEndTimeChange(e.target.value)}
                className="datetime-picker__input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="datetime-picker__actions">
        <button
          type="button"
          className="datetime-picker__btn datetime-picker__btn--secondary"
          onClick={onClearFilter}
          disabled={!hasActiveFilter}
        >
          Xóa bộ lọc
        </button>
        <button
          type="button"
          className={`datetime-picker__btn datetime-picker__btn--primary ${!isFilterValid ? 'datetime-picker__btn--disabled' : ''}`}
          onClick={onApplyFilter}
          disabled={!isFilterValid}
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </div>
  );
};

export default DateTimePicker;
