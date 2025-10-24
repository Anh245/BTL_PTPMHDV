import { 
  MapPin, 
  Train, 
  Calendar, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react'

// --- Dữ liệu giả (Mock Data) ---
const mockStations = {
  total: 12,
  stations: [
    { _id: '1', name: 'Ga Hà Nội', city: 'Hà Nội', isActive: true },
    { _id: '2', name: 'Ga Sài Gòn', city: 'TP. Hồ Chí Minh', isActive: true },
    { _id: '3', name: 'Ga Đà Nẵng', city: 'Đà Nẵng', isActive: false },
    { _id: '4', name: 'Ga Long Biên', city: 'Hà Nội', isActive: true },
  ]
};
const mockTrains = {
  total: 8,
  trains: [
    { _id: 't1', name: 'Tàu Thống Nhất', trainNumber: 'SE1', status: 'active' },
    { _id: 't2', name: 'Tàu Tốc hành', trainNumber: 'TN5', status: 'maintenance' },
    { _id: 't3', name: 'Tàu Sông Lam', trainNumber: 'NA2', status: 'inactive' },
    { _id: 't4', name: 'Tàu Sapa Express', trainNumber: 'SP3', status: 'active' },
  ]
};
const mockTodaySchedules = [
  { _id: 's1', trainNumber: 'SE1', route: { from: 'Hà Nội', to: 'Sài Gòn' }, schedule: { departure: '06:00', arrival: '10:00' }, status: 'departed' },
  { _id: 's2', trainNumber: 'SP3', route: { from: 'Hà Nội', to: 'Lào Cai' }, schedule: { departure: '09:15', arrival: '17:30' }, status: 'boarding' },
  { _id: 's3', trainNumber: 'LC3', route: { from: 'Lào Cai', to: 'Hải Phòng' }, schedule: { departure: '11:00', arrival: '19:45' }, status: 'scheduled' },
  { _id: 's4', trainNumber: 'TN5', route: { from: 'Đà Nẵng', to: 'Nha Trang' }, schedule: { departure: '13:30', arrival: '21:00' }, status: 'delayed' },
  { _id: 's5', trainNumber: 'SE2', route: { from: 'Sài Gòn', to: 'Hà Nội' }, schedule: { departure: '14:00', arrival: '18:00' }, status: 'arrived' },
];
const mockMaintenanceTrains = [
  { _id: 't2', name: 'Tàu Tốc hành', trainNumber: 'TN5', status: 'maintenance' },
];

// --- Components ---

// ## Thẻ thống kê được làm mới
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

// ## Huy hiệu trạng thái được làm mới
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
    station: { true: 'Hoạt động', false: 'Tạm dừng' },
    train: { active: 'Hoạt động', maintenance: 'Bảo trì', inactive: 'Tạm dừng' },
    schedule: { scheduled: 'Đã lên lịch', boarding: 'Đang lên tàu', departed: 'Đã khởi hành', arrived: 'Đã đến', delayed: 'Trễ giờ', cancelled: 'Đã hủy'},
  }

  const statusKey = String(status);
  const styleClass = styles[type][statusKey] || styles.station[false];
  const statusText = text[type][statusKey] || 'Không xác định';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styleClass}`}>
      {statusText}
    </span>
  );
};


const Dashboard = () => {
  const stats = [
    { title: 'Tổng số ga', value: mockStations.total, icon: MapPin, color: 'bg-blue-500', change: '+2 tháng này' },
    { title: 'Tổng số tàu', value: mockTrains.total, icon: Train, color: 'bg-green-500', change: '+1 tuần này' },
    { title: 'Lịch trình hôm nay', value: mockTodaySchedules.length, icon: Calendar, color: 'bg-purple-500', change: 'Đúng giờ 95%' },
    { title: 'Cần bảo trì', value: mockMaintenanceTrains.length, icon: AlertCircle, color: 'bg-red-500', change: mockMaintenanceTrains.length > 0 ? 'Cần xử lý' : 'Tất cả OK' }
  ];

  return (
    // ## Layout chính với nền và padding
    <main className="bg-slate-100 dark:bg-slate-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-full w-full space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Tổng quan hệ thống quản lý ga tàu điện
          </p>
        </div>

        {/* Lưới Thống kê */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
        </div>

        {/* Hoạt động gần đây */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* ## Card được làm mới */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">Ga tàu gần đây</h3>
            <div className="p-5 space-y-4">
              {mockStations.stations.map((station) => (
                <div key={station._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{station.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{station.city}</p>
                    </div>
                  </div>
                  <StatusBadge status={station.isActive} type="station" />
                </div>
              ))}
            </div>
          </div>
          
          {/* Card Tàu gần đây */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">Tàu gần đây</h3>
            <div className="p-5 space-y-4">
              {mockTrains.trains.map((train) => (
                <div key={train._id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                      <Train className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{train.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{train.trainNumber}</p>
                    </div>
                  </div>
                  <StatusBadge status={train.status} type="train" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ## Bảng biểu được thiết kế lại */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">Lịch trình hôm nay</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Tàu</th>
                  <th scope="col" className="px-6 py-3">Tuyến</th>
                  <th scope="col" className="px-6 py-3">Khởi hành</th>
                  <th scope="col" className="px-6 py-3">Đến</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 dark:divide-slate-700'>
                {mockTodaySchedules.slice(0, 10).map((schedule) => (
                  <tr key={schedule._id} className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{schedule.trainNumber}</td>
                    <td className="px-6 py-4">{schedule.route.from} → {schedule.route.to}</td>
                    <td className="px-6 py-4">{schedule.schedule.departure}</td>
                    <td className="px-6 py-4">{schedule.schedule.arrival}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={schedule.status} type="schedule" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </main>
  )
}

export default Dashboard;