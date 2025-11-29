import { useEffect } from 'react';
import { 
  MapPin, 
  Train, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  Ticket,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/stores/useDashboardStore';

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        {change && (
          <p className="text-sm text-green-600 flex items-center mt-1">
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}
          </p>
        )}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status, type }) => {
  const styles = {
    station: {
      true: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      false: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
    },
    train: {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      inactive: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
    },
    schedule: {
      scheduled: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      boarding: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      departed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      arrived: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300",
      delayed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
  };

  const text = {
    station: { true: 'Hoạt động', false: 'Ngừng hoạt động' },
    train: { active: 'Hoạt động', maintenance: 'Bảo trì', inactive: 'Ngừng hoạt động' },
    schedule: { scheduled: 'Đã lên lịch', boarding: 'Đang lên tàu', departed: 'Đã khởi hành', arrived: 'Đã đến', delayed: 'Trễ', cancelled: 'Đã hủy'},
  };

  const statusKey = String(status);
  const styleClass = styles[type][statusKey] || styles.station[false];
  const statusText = text[type][statusKey] || 'Unknown';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styleClass}`}>
      {statusText}
    </span>
  );
};

const Dashboard = () => {
  const {
    stats: dashboardStats,
    allStations,
    allTrains,
    allTickets,
    allSchedules,
    todaySchedules,
    loading,
    error,
    fetchDashboardData
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    await fetchDashboardData();
  };

  const stats = [
    { 
      title: 'Tổng số ga', 
      value: dashboardStats.totalStations, 
      icon: MapPin, 
      color: 'bg-blue-500', 
      change: `${allStations.filter(s => s.isActive).length} đang hoạt động` 
    },
    { 
      title: 'Tổng số tàu', 
      value: dashboardStats.totalTrains, 
      icon: Train, 
      color: 'bg-green-500', 
      change: `${allTrains.filter(t => t.status === 'active').length} đang hoạt động` 
    },
    { 
      title: 'Tổng số vé', 
      value: dashboardStats.totalTickets, 
      icon: Ticket, 
      color: 'bg-indigo-500', 
      change: `${allTickets.filter(t => t.status === 'active').length} đang bán` 
    },
    { 
      title: 'Lịch trình hôm nay', 
      value: dashboardStats.todaySchedules, 
      icon: Calendar, 
      color: 'bg-purple-500', 
      change: `${todaySchedules.filter(s => s.status === 'scheduled').length} đã lên lịch` 
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Lỗi tải bảng điều khiển</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Tổng quan</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Tổng quan hệ thống quản lý ga tàu điện
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Cập nhật
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>

      {/* Danh sách chi tiết */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Danh sách Ga */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">
            Danh sách Ga ({allStations.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Tên ga</th>
                  <th scope="col" className="px-4 py-3">Địa chỉ</th>
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {allStations.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-4 py-8 text-center text-slate-500">
                      Không có ga nào
                    </td>
                  </tr>
                ) : (
                  allStations.slice(0, 10).map((station) => (
                    <tr key={station.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{station.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {station.address || 'Chưa có địa chỉ'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={station.isActive} type="station" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danh sách Tàu */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">
            Danh sách Tàu ({allTrains.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Tên tàu</th>
                  <th scope="col" className="px-4 py-3">Số hiệu</th>
                  
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {allTrains.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      Không có tàu nào
                    </td>
                  </tr>
                ) : (
                  allTrains.slice(0, 10).map((train) => (
                    <tr key={train.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{train.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{train.trainNumber}</td>
                      
                      <td className="px-4 py-3">
                        <StatusBadge status={train.status} type="train" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Danh sách Vé và Lịch trình */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Danh sách Vé */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">
            Danh sách Vé ({allTickets.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Tên vé</th>
                  <th scope="col" className="px-4 py-3">Tuyến</th>
                  <th scope="col" className="px-4 py-3">Giá</th>
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {allTickets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      Không có vé nào
                    </td>
                  </tr>
                ) : (
                  allTickets.slice(0, 10).map((ticket) => (
                    <tr key={ticket.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{ticket.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {ticket.fromStation} → {ticket.toStation}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ticket.price)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ticket.status} type="station" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Danh sách Lịch trình */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">
            Tất cả Lịch trình ({allSchedules.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-4 py-3">Tàu</th>
                  <th scope="col" className="px-4 py-3">Tuyến</th>
                  <th scope="col" className="px-4 py-3">Khởi hành</th>
                  <th scope="col" className="px-4 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {allSchedules.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      Không có lịch trình nào
                    </td>
                  </tr>
                ) : (
                  allSchedules.slice(0, 10).map((schedule) => (
                    <tr key={schedule.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{schedule.trainNumber}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {schedule.departureStation} → {schedule.arrivalStation}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {new Date(schedule.departureTime).toLocaleDateString('vi-VN')} {new Date(schedule.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={schedule.status} type="schedule" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lịch trình hôm nay */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            Lịch trình hôm nay ({todaySchedules.length})
          </h3>
          <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
            <Clock className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString('vi-VN')}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">Tàu</th>
                <th scope="col" className="px-6 py-3">Tuyến đường</th>
                <th scope="col" className="px-6 py-3">Khởi hành</th>
                <th scope="col" className="px-6 py-3">Đến nơi</th>
                <th scope="col" className="px-6 py-3">Ghế trống</th>
                <th scope="col" className="px-6 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200 dark:divide-slate-700'>
              {todaySchedules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    Không có lịch trình hôm nay
                  </td>
                </tr>
              ) : (
                todaySchedules.map((schedule) => (
                  <tr key={schedule.id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{schedule.trainNumber}</td>
                    <td className="px-6 py-4">{schedule.departureStation} → {schedule.arrivalStation}</td>
                    <td className="px-6 py-4">{new Date(schedule.departureTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">{new Date(schedule.arrivalTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="px-6 py-4">
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        {schedule.availableSeats || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={schedule.status} type="schedule" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
