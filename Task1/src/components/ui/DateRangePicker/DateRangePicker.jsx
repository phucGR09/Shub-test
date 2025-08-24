import React from 'react';
import Typography from '../Typography';
import './DateRangePicker.css';

/**
 * Date Range Picker Component
 * @param {Object} props
 * @param {Date} props.startDate - Start date
 * @param {Date} props.endDate - End date
 * @param {Function} props.onStartDateChange - Start date change handler
 * @param {Function} props.onEndDateChange - End date change handler
 * @param {string} props.label - Label for the component
 */
const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = 'Chọn khoảng thời gian'
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
  };

  return (
    <div className="date-range-picker">
      <Typography variant="h6" color="primary" className="date-range-picker__label">
        {label}
      </Typography>

      <div className="date-range-picker__inputs">
        <div className="date-range-picker__field">
          <label className="date-range-picker__field-label">
            Từ ngày
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartDateChange}
            className="date-range-picker__input"
            max={formatDateForInput(endDate)}
          />
        </div>

        <div className="date-range-picker__separator">—</div>

        <div className="date-range-picker__field">
          <label className="date-range-picker__field-label">
            Đến ngày
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndDateChange}
            className="date-range-picker__input"
            min={formatDateForInput(startDate)}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;
