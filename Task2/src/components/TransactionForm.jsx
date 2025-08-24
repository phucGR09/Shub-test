import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './TransactionForm.css';

// Validation schema
const schema = yup.object({
  time: yup.date().required('Thời gian là bắt buộc'),
  quantity: yup
    .number()
    .typeError('Số lượng phải là số')
    .positive('Số lượng phải lớn hơn 0')
    .required('Số lượng là bắt buộc'),
  pump: yup.string().required('Trụ là bắt buộc'),
  revenue: yup
    .number()
    .typeError('Doanh thu phải là số')
    .positive('Doanh thu phải lớn hơn 0')
    .required('Doanh thu là bắt buộc'),
  unitPrice: yup
    .number()
    .typeError('Đơn giá phải là số')
    .positive('Đơn giá phải lớn hơn 0')
    .required('Đơn giá là bắt buộc'),
}).required();

const TransactionForm = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      time: new Date(),
      quantity: 3.03,
      pump: '',
      revenue: 60000,
      unitPrice: 19800,
    },
  });

  const selectedTime = watch('time');
  const selectedQuantity = watch('quantity');
  const selectedUnitPrice = watch('unitPrice');

  // Auto-calculate revenue when quantity or unit price changes
  React.useEffect(() => {
    if (selectedQuantity && selectedUnitPrice) {
      const calculatedRevenue = selectedQuantity * selectedUnitPrice;
      setValue('revenue', Math.round(calculatedRevenue));
    }
  }, [selectedQuantity, selectedUnitPrice, setValue]);

  const onSubmit = (data) => {
    console.log('Form data:', data);
    setShowSuccess(true);
    setShowError(false);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const onError = (errors) => {
    console.log('Form errors:', errors);
    setShowError(true);
    setShowSuccess(false);
    setErrorMessage('Vui lòng kiểm tra lại thông tin nhập vào');
  };

  const pumpOptions = [
    { value: '', label: 'Chọn trụ' },
    { value: 'trụ-1', label: 'Trụ 1' },
    { value: 'trụ-2', label: 'Trụ 2' },
    { value: 'trụ-3', label: 'Trụ 3' },
    { value: 'trụ-4', label: 'Trụ 4' },
  ];

  return (
    <div className="transaction-form-container">
      <div className="transaction-form-header">
        <div className="header-left">
          <button className="back-button">
            <span>←</span> Đóng
          </button>
        </div>
        <div className="header-right">
          <button 
            className="update-button"
            onClick={handleSubmit(onSubmit, onError)}
          >
            Cập nhật
          </button>
        </div>
      </div>

      <div className="transaction-form-content">
        <h1 className="form-title">Nhập giao dịch</h1>

        <form className="transaction-form" onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="form-group">
            <label htmlFor="time">Thời gian</label>
            <div className="input-wrapper">
              <DatePicker
                selected={selectedTime}
                onChange={(date) => setValue('time', date)}
                showTimeSelect
                dateFormat="dd/MM/yyyy HH:mm:ss"
                className={`form-input ${errors.time ? 'error' : ''}`}
                placeholderText="Chọn ngày giờ"
              />
              <span className="calendar-icon">📅</span>
            </div>
            {errors.time && <span className="error-message">{errors.time.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Số lượng</label>
            <input
              type="number"
              step="0.01"
              {...register('quantity')}
              className={`form-input ${errors.quantity ? 'error' : ''}`}
              placeholder="Nhập số lượng"
            />
            {errors.quantity && <span className="error-message">{errors.quantity.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="pump">Trụ</label>
            <div className="input-wrapper">
              <select
                {...register('pump')}
                className={`form-input ${errors.pump ? 'error' : ''}`}
              >
                {pumpOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="dropdown-icon">▼</span>
            </div>
            {errors.pump && <span className="error-message">{errors.pump.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="revenue">Doanh thu</label>
            <input
              type="number"
              {...register('revenue')}
              className={`form-input ${errors.revenue ? 'error' : ''}`}
              placeholder="Nhập doanh thu"
              readOnly
            />
            {errors.revenue && <span className="error-message">{errors.revenue.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="unitPrice">Đơn giá</label>
            <input
              type="number"
              {...register('unitPrice')}
              className={`form-input ${errors.unitPrice ? 'error' : ''}`}
              placeholder="Nhập đơn giá"
            />
            {errors.unitPrice && <span className="error-message">{errors.unitPrice.message}</span>}
          </div>
        </form>

        {showSuccess && (
          <div className="success-message">
            ✅ Cập nhật thành công!
          </div>
        )}

        {showError && (
          <div className="error-message-global">
            ❌ {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionForm;
