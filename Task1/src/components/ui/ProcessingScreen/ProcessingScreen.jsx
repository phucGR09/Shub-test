import React, { useState, useEffect } from 'react';
import './ProcessingScreen.css';
import { PiFastForwardBold } from "react-icons/pi";

/**
 * Processing Screen Component
 * Shows animated processing screen with progress bar
 */
const ProcessingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Đang đọc file...');

  useEffect(() => {
    const stages = [
      { text: 'Đang đọc file...', duration: 500 },
      { text: 'Phân tích cấu trúc dữ liệu...', duration: 600 },
      { text: 'Xử lý giao dịch...', duration: 500 },
      { text: 'Tạo thống kê...', duration: 400 }
    ];

    let currentProgress = 0;
    let stageIndex = 0;

    const progressInterval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      // Update stage based on progress
      const progressPerStage = 100 / stages.length;
      const newStageIndex = Math.floor(currentProgress / progressPerStage);

      if (newStageIndex !== stageIndex && newStageIndex < stages.length) {
        stageIndex = newStageIndex;
        setStage(stages[stageIndex].text);
      }

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setStage('Hoàn tất!');
      }
    }, 40);

    return () => clearInterval(progressInterval);
  }, []);

  return (
    <div className="processing-screen">
      <div className="processing-screen__content">
        {/* Processing Animation */}
        <div className="processing-screen__animation">
          <div className="processing-screen__loader">
            <div className="processing-screen__loader-circle"></div>
            <div className="processing-screen__loader-circle"></div>
            <div className="processing-screen__loader-circle"></div>
          </div>
          <div className="processing-screen__file-icon">
            <PiFastForwardBold width={15} height={15} color='white' />
          </div>
        </div>

        {/* Progress Info */}
        <div className="processing-screen__info">
          <h2 className="processing-screen__title">Đang xử lý dữ liệu</h2>
          <p className="processing-screen__stage">{stage}</p>
        </div>

        {/* Progress Bar */}
        <div className="processing-screen__progress">
          <div className="processing-screen__progress-bar">
            <div
              className="processing-screen__progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="processing-screen__progress-text">{progress}%</span>
        </div>

        {/* Background Particles */}
        <div className="processing-screen__particles">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="processing-screen__particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
