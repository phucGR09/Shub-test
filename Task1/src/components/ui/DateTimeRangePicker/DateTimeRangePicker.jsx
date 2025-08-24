import React from 'react';
import Typography from '../Typography';
import './DateTimeRangePicker.css';

/**
 * Date Time Range Picker Component
 * @param {Object} props
 * @param {Date} props.startDateTime - Start date time
 * @param {Date} props.endDateTime - End date time
 * @param {Function} props.onStartDateTimeChange - Start date time change handler
 * @param {Function} props.onEndDateTimeChange - End date time change handler
 * @param {string} props.label - Label for the component
 */
const DateTimeRangePicker = ({
  startDateTime,
  endDateTime,
  onStartDateTimeChange,
  onEndDateTimeChange,
  label = 'Chọn khoảng thời gian'
}) => {
  const formatDateTimeForInput = (date) => {
    if (!date) return '';
    const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const handleStartDateTimeChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onStartDateTimeChange(date);
  };

  const handleEndDateTimeChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    onEndDateTimeChange(date);
  };

  // Quick filter buttons
  const setQuickFilter = (hours) => {
    const now = new Date();
    const start = new Date(now.getTime() - hours * 60 * 60 * 1000);
    onStartDateTimeChange(start);
    onEndDateTimeChange(now);
  };

  const setTodayFilter = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    onStartDateTimeChange(startOfDay);
    onEndDateTimeChange(endOfDay);
  };

  const setYesterdayFilter = () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
    const endOfDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
    onStartDateTimeChange(startOfDay);
    onEndDateTimeChange(endOfDay);
  };

  const setThisWeekFilter = () => {
    const now = new Date();
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek.getTime() + (6 * 24 * 60 * 60 * 1000));
    endOfWeek.setHours(23, 59, 59, 999);
    onStartDateTimeChange(startOfWeek);
    onEndDateTimeChange(endOfWeek);
  };

  return (
    <div className="datetime-range-picker">
      <Typography variant="h6" color="primary" className="datetime-range-picker__label">
        {label}
      </Typography>

      {/* Quick filter buttons */}
      <div className="datetime-range-picker__quick-filters">
        <button
          type="button"
          className="datetime-range-picker__quick-btn"
          onClick={() => setQuickFilter(1)}
        >
          1 giờ qua
        </button>
        <button
          type="button"
          className="datetime-range-picker__quick-btn"
          onClick={() => setQuickFilter(6)}
        >
          6 giờ qua
        </button>
        <button
          type="button"
          className="datetime-range-picker__quick-btn"
          onClick={() => setQuickFilter(24)}
        >
          24 giờ qua
        </button>
        <button
          type="button"
          className="datetime-range-picker__quick-btn"
          onClick={setTodayFilter}
        >
          Hôm nay
        </button>
        <button
          type="button"
          className="datetime-range-picker__quick-btn"
          onClick={setYesterdayFilter}
        >
          Hôm qua
        </button>
        <button
          type="button"
          className="datetime-range-picker__quick-btn"
          onClick={setThisWeekFilter}
        >
          Tuần này
        </button>
      </div>

      {/* Date time range inputs */}
      <div className="datetime-range-picker__range-container">
        {/* Start date time frame */}
        <div className="datetime-range-picker__frame">
          <div className="datetime-range-picker__frame-header">
            <span className="datetime-range-picker__frame-title">Từ ngày giờ bắt đầu</span>
          </div>
          <div className="datetime-range-picker__frame-content">
            <input
              type="datetime-local"
              value={formatDateTimeForInput(startDateTime)}
              onChange={handleStartDateTimeChange}
              className="datetime-range-picker__input"
              max={formatDateTimeForInput(endDateTime)}
              placeholder="Chọn ngày giờ bắt đầu"
            />
          </div>
        </div>

        {/* End date time frame */}
        <div className="datetime-range-picker__frame">
          <div className="datetime-range-picker__frame-header">
            <span className="datetime-range-picker__frame-title">Đến ngày giờ kết thúc</span>
          </div>
          <div className="datetime-range-picker__frame-content">
            <input
              type="datetime-local"
              value={formatDateTimeForInput(endDateTime)}
              onChange={handleEndDateTimeChange}
              className="datetime-range-picker__input"
              min={formatDateTimeForInput(startDateTime)}
              placeholder="Chọn ngày giờ kết thúc"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeRangePicker;
