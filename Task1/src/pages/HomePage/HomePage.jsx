import React, { useEffect, useState } from 'react';
import { Typography } from '../../components/ui';
import { APP_CONFIG } from '../../constants';
import {
  HiDocumentText,
  HiFilter,
  HiChartPie,
  HiArrowRight,
  HiUpload,
  HiAdjustments,
  HiPresentationChartLine
} from 'react-icons/hi';
import './HomePage.css?v=1.0';

/**
 * Home Page Component - Interactive guide page with 3 steps
 */
const HomePage = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('transactions');
    }
  };

  const steps = [
    {
      id: 1,
      icon: <HiUpload width={15} height={15} color='#3b82f6' />,
      title: 'Nhập file Excel',
      description: 'Tải lên file dữ liệu giao dịch định dạng .xlsx để bắt đầu phân tích',
      color: '#3b82f6',
      delay: '0.2s'
    },
    {
      id: 2,
      icon: <HiAdjustments width={15} height={15} color='#10b981' />,
      title: 'Áp dụng bộ lọc',
      description: 'Chọn khoảng thời gian và thiết lập bộ lọc theo nhu cầu phân tích',
      color: '#10b981',
      delay: '0.4s'
    },
    {
      id: 3,
      icon: <HiPresentationChartLine width={15} height={15} color='#f59e0b' />,
      title: 'Xem phân tích',
      description: 'Xem báo cáo chi tiết, thống kê doanh thu và biểu đồ trực quan',
      color: '#f59e0b',
      delay: '0.6s'
    }
  ];

  return (
    <div className="home-page">
      {/* Navigation overlay for non-home pages */}
      <div className="home-page__nav-overlay">
        <button
          className="home-page__nav-btn"
          onClick={() => onNavigate && onNavigate('transactions')}
          title="Đi tới phân tích dữ liệu"
        >
          <HiChartPie />
        </button>
      </div>

      <div className="home-page__content">
        {/* Header Section */}
        <div className={`home-page__header ${isVisible ? 'home-page__header--visible' : ''}`}>
          <Typography
            variant="h1"
            color="primary"
            align="center"
            className="home-page__title"
          >
            {APP_CONFIG.NAME}
          </Typography>

          {/* <Typography
            variant="h5"
            color="secondary"
            align="center"
            className="home-page__subtitle"
          >
            Hệ thống phân tích dữ liệu giao dịch chuyên nghiệp
          </Typography> */}

          <Typography
            variant="body1"
            color="secondary"
            align="center"
            className="home-page__description"
          >
            Làm theo 3 bước đơn giản để bắt đầu phân tích dữ liệu của bạn
          </Typography>
        </div>

        {/* Steps Section */}
        <div className={`home-page__steps ${isVisible ? 'home-page__steps--visible' : ''}`}>
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div
                className="home-page__step"
                style={{
                  animationDelay: step.delay,
                  '--step-color': step.color
                }}
              >
                <div className="home-page__step-number">
                  {step.id}
                </div>
                <div className="home-page__step-icon">
                  {step.icon}
                </div>
                <div className="home-page__step-content">
                  <Typography variant="h6" color="primary" className="home-page__step-title">
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="secondary" className="home-page__step-description">
                    {step.description}
                  </Typography>
                </div>
              </div>

              {/* Connector line between steps */}
              {index < steps.length - 1 && (
                <div
                  className="home-page__connector"
                  style={{ animationDelay: `calc(${step.delay} + 0.3s)` }}
                >
                  <div className="home-page__connector-line"></div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* CTA Section */}
        <div className={`home-page__cta ${isVisible ? 'home-page__cta--visible' : ''}`}>
          <button
            className="home-page__start-button"
            onClick={handleGetStarted}
          >
            <span className="home-page__start-button-text">Bắt đầu phân tích</span>
            <HiArrowRight className="home-page__cta-icon" />
          </button>

          <Typography variant="body2" color="secondary" className="home-page__cta-note">
            Hỗ trợ file Excel (.xlsx) với dữ liệu giao dịch cây xăng
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
