import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // Quan trọng: Import 'auto' để tự động đăng ký các thành phần

const AnalysPage = () => {
  // 1. Sử dụng useRef để tham chiếu đến thẻ canvas thay vì getElementById
  const chartRef = useRef(null);
  // 2. Sử dụng useRef để lưu trữ instance của biểu đồ (để destroy sau này)
  const chartInstance = useRef(null);

  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  useEffect(() => {
    // Chỉ chạy code này sau khi HTML đã được render xong
    if (chartRef.current) {
      
      // Quan trọng: Hủy biểu đồ cũ nếu nó đã tồn tại
      // (Tránh lỗi "Canvas is already in use")
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Tạo context từ ref
      const ctx = chartRef.current.getContext('2d');

      // Tạo biểu đồ mới và lưu vào biến ref
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: data.map(row => row.year),
          datasets: [
            {
              label: 'Acquisitions by year',
              data: data.map(row => row.count),
            }
          ]
        }
      });
    }

    // Cleanup function: Chạy khi component bị xóa khỏi màn hình (unmount)
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []); // [] có nghĩa là chỉ chạy 1 lần khi trang vừa load

  return (
    <div className="w-200">
      {/* Gán biến ref vào thẻ canvas */}
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default AnalysPage;