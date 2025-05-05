// src/components/common/ToastWithCountdown.tsx
import React, { useState, useEffect } from 'react';

interface ToastWithCountdownProps {
  message: string;
  initialDurationSeconds?: number; // Thời gian bắt đầu đếm ngược (mặc định 10)
}

const ToastWithCountdown: React.FC<ToastWithCountdownProps> = ({
  message,
  initialDurationSeconds = 5 // Mặc định là 10 giây
}) => {
  const [countdown, setCountdown] = useState(initialDurationSeconds);

  useEffect(() => {
    // Chỉ chạy bộ đếm nếu countdown > 0
    if (countdown <= 0) return;

    // Tạo interval để giảm countdown mỗi giây
    const intervalId = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    // Clear interval khi component unmount hoặc countdown về 0
    return () => clearInterval(intervalId);

  }, [countdown]); // Chạy lại effect khi countdown thay đổi

  return (
    <div className="flex flex-col">
      <span>{message}</span>
      {countdown > 0 && (
        <span className="text-xs opacity-70 mt-1">
          (Auto-closing in {countdown}s)
          {/* Hoặc dùng tiếng Việt: (Tự động đóng sau {countdown} giây) */}
        </span>
      )}
    </div>
  );
};

export default ToastWithCountdown;