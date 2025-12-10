import { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { orderAPI, ticketAPI, scheduleAPI, trainAPI, stationAPI, analyticsAPI } from '@/services/authServicesAPI.js';
import { toast } from 'sonner';

const AnalysPage = () => {
  // Refs cho các biểu đồ
  const ordersChartRef = useRef(null);
  const ticketsChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const dailyTicketsChartRef = useRef(null);
  
  // Instances của các biểu đồ
  const ordersChartInstance = useRef(null);
  const ticketsChartInstance = useRef(null);
  const statusChartInstance = useRef(null);
  const dailyTicketsChartInstance = useRef(null);

  // State cho dữ liệu
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    orders: [],
    tickets: [],
    schedules: [],
    trains: [],
    stations: [],
    ordersSummary: {},
    ordersByDate: {},
    revenueSummary: {},
    ordersByStatus: {},
    ordersByPaymentMethod: {}
  });



  // Fetch dữ liệu từ API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [
        ordersRes, 
        ticketsRes, 
        schedulesRes, 
        trainsRes, 
        stationsRes,
        ordersSummaryRes,
        ordersByDateRes,
        revenueSummaryRes,
        ordersByStatusRes,
        ordersByPaymentMethodRes
      ] = await Promise.all([
        orderAPI.getOrders().catch((err) => { console.error('Orders API error:', err); return { data: [] }; }),
        ticketAPI.getTickets().catch((err) => { console.error('Tickets API error:', err); return { data: [] }; }),
        scheduleAPI.getSchedules().catch((err) => { console.error('Schedules API error:', err); return { data: [] }; }),
        trainAPI.getTrains().catch((err) => { console.error('Trains API error:', err); return { data: [] }; }),
        stationAPI.getStations().catch((err) => { console.error('Stations API error:', err); return { data: [] }; }),
        analyticsAPI.getOrdersSummary().catch((err) => { console.error('Analytics Orders Summary error:', err); return { data: {} }; }),
        analyticsAPI.getOrdersByDate(30).catch((err) => { console.error('Analytics Orders By Date error:', err); return { data: {} }; }),
        analyticsAPI.getRevenueSummary().catch((err) => { console.error('Analytics Revenue Summary error:', err); return { data: {} }; }),
        analyticsAPI.getOrdersByStatus().catch((err) => { console.error('Analytics Orders By Status error:', err); return { data: {} }; }),
        analyticsAPI.getOrdersByPaymentMethod().catch((err) => { console.error('Analytics Orders By Payment Method error:', err); return { data: {} }; })
      ]);

      // Debug logging
      console.log('Orders data:', ordersRes.data);
      console.log('Revenue summary:', revenueSummaryRes.data);
      console.log('Orders summary:', ordersSummaryRes.data);
      console.log('Orders by date:', ordersByDateRes.data);
      console.log('Orders by status:', ordersByStatusRes.data);

      setAnalyticsData({
        orders: ordersRes.data || [],
        tickets: ticketsRes.data || [],
        schedules: schedulesRes.data || [],
        trains: trainsRes.data || [],
        stations: stationsRes.data || [],
        ordersSummary: ordersSummaryRes.data || {},
        ordersByDate: ordersByDateRes.data || {},
        revenueSummary: revenueSummaryRes.data || {},
        ordersByStatus: ordersByStatusRes.data || {},
        ordersByPaymentMethod: ordersByPaymentMethodRes.data || {}
      });
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu analytics:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  // Tạo biểu đồ đơn hàng theo thời gian
  const createOrdersChart = () => {
    if (!ordersChartRef.current) return;

    if (ordersChartInstance.current) {
      ordersChartInstance.current.destroy();
    }

    // Sử dụng dữ liệu từ analytics API hoặc fallback về dữ liệu cũ
    let ordersByDate = {};
    if (analyticsData.ordersByDate && analyticsData.ordersByDate.data) {
      ordersByDate = analyticsData.ordersByDate.data;
    } else if (analyticsData.orders.length) {
      // Fallback: nhóm đơn hàng theo ngày từ dữ liệu thô
      ordersByDate = analyticsData.orders.reduce((acc, order) => {
        const date = new Date(order.createdAt).toLocaleDateString('vi-VN');
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
    }

    const labels = Object.keys(ordersByDate).slice(-7);
    const data = Object.values(ordersByDate).slice(-7);

    const ctx = ordersChartRef.current.getContext('2d');
    ordersChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số đơn hàng',
          data: data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Đơn hàng theo ngày (7 ngày gần nhất)'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };

  // Tạo biểu đồ vé bán được
  const createTicketsChart = () => {
    if (!ticketsChartRef.current || !analyticsData.tickets.length) return;

    if (ticketsChartInstance.current) {
      ticketsChartInstance.current.destroy();
    }

    // Top 5 vé bán chạy nhất
    const topTickets = analyticsData.tickets
      .sort((a, b) => (b.soldQuantity || 0) - (a.soldQuantity || 0))
      .slice(0, 5);

    const ctx = ticketsChartRef.current.getContext('2d');
    ticketsChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topTickets.map(ticket => ticket.name || `Vé ${ticket.id}`),
        datasets: [{
          label: 'Số vé đã bán',
          data: topTickets.map(ticket => ticket.soldQuantity || 0),
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 5 vé bán chạy nhất'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  };



  // Tạo biểu đồ trạng thái đơn hàng
  const createStatusChart = () => {
    if (!statusChartRef.current) return;

    if (statusChartInstance.current) {
      statusChartInstance.current.destroy();
    }

    // Sử dụng dữ liệu từ analytics API hoặc fallback
    let statusCount = {};
    if (analyticsData.ordersByStatus && analyticsData.ordersByStatus.data) {
      statusCount = analyticsData.ordersByStatus.data;
    } else if (analyticsData.orders.length) {
      // Fallback: đếm từ dữ liệu thô
      statusCount = analyticsData.orders.reduce((acc, order) => {
        const status = order.orderStatus || 'unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    }

    const statusMap = {
      'created': 'Đã tạo',
      'confirmed': 'Đã xác nhận', 
      'cancelled': 'Đã hủy',
      'unknown': 'Không xác định'
    };

    const labels = Object.keys(statusCount).map(status => statusMap[status] || status);
    const data = Object.values(statusCount);
    const totalOrders = data.reduce((sum, val) => sum + val, 0);

    const ctx = statusChartRef.current.getContext('2d');
    statusChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Phân bố trạng thái đơn hàng',
            font: {
              size: 16
            }
          },
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed;
                const percentage = ((value / totalOrders) * 100).toFixed(1);
                return `${context.label}: ${value} đơn (${percentage}%)`;
              }
            }
          }
        },
        cutout: '50%'
      }
    });

    // Thêm thông tin tổng kết dưới biểu đồ
    const chartContainer = statusChartRef.current.parentElement;
    let summaryDiv = chartContainer.querySelector('.status-chart-summary');
    if (!summaryDiv) {
      summaryDiv = document.createElement('div');
      summaryDiv.className = 'status-chart-summary mt-4 p-3 bg-gray-50 rounded-lg text-sm';
      chartContainer.appendChild(summaryDiv);
    }
    
    const confirmedCount = statusCount.confirmed || 0;
    const cancelledCount = statusCount.cancelled || 0;
    const successRate = totalOrders > 0 ? ((confirmedCount / totalOrders) * 100).toFixed(1) : 0;
    const cancelRate = totalOrders > 0 ? ((cancelledCount / totalOrders) * 100).toFixed(1) : 0;
    
    summaryDiv.innerHTML = `
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <span class="font-semibold text-green-600">${successRate}%</span>
          <div class="text-gray-500">Tỷ lệ thành công</div>
        </div>
        <div>
          <span class="font-semibold text-red-600">${cancelRate}%</span>
          <div class="text-gray-500">Tỷ lệ hủy đơn</div>
        </div>
        <div>
          <span class="font-semibold text-blue-600">${totalOrders}</span>
          <div class="text-gray-500">Tổng đơn hàng</div>
        </div>
      </div>
    `;
  };

  // Tạo biểu đồ số vé bán theo ngày trong tháng
  const createDailyTicketsChart = () => {
    if (!dailyTicketsChartRef.current) return;

    if (dailyTicketsChartInstance.current) {
      dailyTicketsChartInstance.current.destroy();
    }

    // Tính số vé bán được theo ngày từ orders
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    // Khởi tạo dữ liệu cho tất cả ngày trong tháng
    const dailyTicketsSold = {};
    const dailyRevenue = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailyTicketsSold[day] = 0;
      dailyRevenue[day] = 0;
    }

    // Tính số vé bán được và doanh thu từ orders
    if (analyticsData.orders.length > 0) {
      analyticsData.orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        if (orderDate.getMonth() === currentMonth && 
            orderDate.getFullYear() === currentYear &&
            order.paymentStatus === 'paid') {
          const day = orderDate.getDate();
          dailyTicketsSold[day] += order.quantity || 1;
          dailyRevenue[day] += parseFloat(order.totalAmount || 0);
        }
      });
    }

    const labels = Object.keys(dailyTicketsSold).map(day => `Ngày ${day}`);
    const ticketsData = Object.values(dailyTicketsSold);
    const revenueData = Object.values(dailyRevenue);

    // Tìm ngày có bán nhiều vé nhất
    const maxTicketsDay = Object.keys(dailyTicketsSold).reduce((a, b) => 
      dailyTicketsSold[a] > dailyTicketsSold[b] ? a : b
    );
    const totalTicketsThisMonth = Object.values(dailyTicketsSold).reduce((sum, val) => sum + val, 0);

    const ctx = dailyTicketsChartRef.current.getContext('2d');
    dailyTicketsChartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số vé bán được',
          data: ticketsData,
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: ticketsData.map((_, index) => 
            index + 1 == maxTicketsDay ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
          ),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: ticketsData.map((_, index) => 
            index + 1 == maxTicketsDay ? 6 : 4
          )
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `Số vé bán được theo ngày - Tháng ${currentMonth + 1}/${currentYear}`,
            font: {
              size: 16
            }
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const dayIndex = context.dataIndex;
                const revenue = revenueData[dayIndex];
                return `Doanh thu: ${revenue.toLocaleString('vi-VN')}đ`;
              },
              footer: function(tooltipItems) {
                if (tooltipItems.length > 0) {
                  const dayIndex = tooltipItems[0].dataIndex + 1;
                  if (dayIndex == maxTicketsDay) {
                    return 'Ngày bán nhiều vé nhất!';
                  }
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ngày trong tháng'
            },
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số vé'
            },
            ticks: {
              stepSize: 1
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    });

    // Thêm thông tin tổng kết dưới biểu đồ
    const chartContainer = dailyTicketsChartRef.current.parentElement;
    let summaryDiv = chartContainer.querySelector('.chart-summary');
    if (!summaryDiv) {
      summaryDiv = document.createElement('div');
      summaryDiv.className = 'chart-summary mt-4 p-3 bg-gray-50 rounded-lg text-sm';
      chartContainer.appendChild(summaryDiv);
    }
    
    summaryDiv.innerHTML = `
      <div class="grid grid-cols-3 gap-4 text-center">
        <div>
          <span class="font-semibold text-green-600">${totalTicketsThisMonth}</span>
          <div class="text-gray-500">Tổng vé bán tháng này</div>
        </div>
        <div>
          <span class="font-semibold text-red-600">Ngày ${maxTicketsDay}</span>
          <div class="text-gray-500">Ngày bán nhiều nhất</div>
        </div>
        <div>
          <span class="font-semibold text-blue-600">${dailyTicketsSold[maxTicketsDay]}</span>
          <div class="text-gray-500">Vé bán trong ngày đó</div>
        </div>
      </div>
    `;
  };

  // Tạo tất cả biểu đồ
  const createAllCharts = () => {
    createOrdersChart();
    createTicketsChart();
    createStatusChart();
    createDailyTicketsChart();
  };

  useEffect(() => {
    fetchAnalyticsData();
    
    // Auto-refresh mỗi 30 giây để cập nhật dữ liệu mới
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && analyticsData.orders.length > 0) {
      createAllCharts();
    }

    // Cleanup function
    return () => {
      [ordersChartInstance, ticketsChartInstance, statusChartInstance, dailyTicketsChartInstance]
        .forEach(instance => {
          if (instance.current) {
            instance.current.destroy();
          }
        });
    };
  }, [loading, analyticsData]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Đang tải dữ liệu thống kê...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thống kê & Phân tích</h1>
        <p className="text-gray-600 mt-2">Tổng quan về hoạt động hệ thống</p>
        
      
        
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Tổng đơn hàng</h3>
          <p className="text-2xl font-bold text-blue-600">
            {analyticsData.ordersSummary.totalOrders || analyticsData.orders.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Đã xác nhận: {analyticsData.ordersSummary.confirmedOrders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Doanh thu</h3>
          <p className="text-2xl font-bold text-green-600">
            {(() => {
              // Tính doanh thu từ analytics API hoặc fallback
              let totalRevenue = 0;
              
              if (analyticsData.revenueSummary && analyticsData.revenueSummary.totalRevenue !== undefined) {
                totalRevenue = parseFloat(analyticsData.revenueSummary.totalRevenue || 0);
              } else if (analyticsData.orders.length > 0) {
                // Fallback: tính từ dữ liệu orders thô
                totalRevenue = analyticsData.orders.reduce((sum, order) => {
                  return order.paymentStatus === 'paid' 
                    ? sum + parseFloat(order.totalAmount || 0)
                    : sum;
                }, 0);
              }
              
              return totalRevenue > 0 
                ? `${totalRevenue.toLocaleString('vi-VN')}đ`
                : '0đ';
            })()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Chờ thanh toán: {(() => {
              let pendingRevenue = 0;
              
              if (analyticsData.revenueSummary && analyticsData.revenueSummary.pendingRevenue !== undefined) {
                pendingRevenue = parseFloat(analyticsData.revenueSummary.pendingRevenue || 0);
              } else if (analyticsData.orders.length > 0) {
                pendingRevenue = analyticsData.orders.reduce((sum, order) => {
                  return order.paymentStatus === 'pending' 
                    ? sum + parseFloat(order.totalAmount || 0)
                    : sum;
                }, 0);
              }
              
              return pendingRevenue > 0 
                ? `${pendingRevenue.toLocaleString('vi-VN')}đ`
                : '0đ';
            })()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Tổng vé</h3>
          <p className="text-2xl font-bold text-purple-600">{analyticsData.tickets.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            Đã bán: {analyticsData.tickets.reduce((sum, ticket) => sum + (ticket.soldQuantity || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Hệ thống</h3>
          <p className="text-2xl font-bold text-orange-600">{analyticsData.trains.length}</p>
          <p className="text-xs text-gray-400 mt-1">
            Tàu | {analyticsData.stations.length} ga
          </p>
        </div>
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biểu đồ đơn hàng theo thời gian */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <canvas ref={ordersChartRef}></canvas>
        </div>

        {/* Biểu đồ vé bán chạy */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <canvas ref={ticketsChartRef}></canvas>
        </div>

        {/* Biểu đồ trạng thái đơn hàng */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <div style={{ height: '300px' }}>
            <canvas ref={statusChartRef}></canvas>
          </div>
        </div>

        {/* Biểu đồ số vé bán theo ngày trong tháng */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <canvas ref={dailyTicketsChartRef}></canvas>
        </div>
      </div>

      {/* Nút điều khiển */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={fetchAnalyticsData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      </div>
    </div>
  );
};

export default AnalysPage;