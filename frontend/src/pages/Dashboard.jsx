import {
  MapPin,
  Train,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import vi from '@/lib/translations';

const mockStations = {
  total: 12,
  stations: [
    { _id: '1', name: 'Hanoi Station', city: 'Hanoi', isActive: true },
    { _id: '2', name: 'Saigon Station', city: 'Ho Chi Minh City', isActive: true },
    { _id: '3', name: 'Da Nang Station', city: 'Da Nang', isActive: false },
    { _id: '4', name: 'Long Bien Station', city: 'Hanoi', isActive: true },
  ]
};

const mockTrains = {
  total: 8,
  trains: [
    { _id: 't1', name: 'Unity Express', trainNumber: 'SE1', status: 'active' },
    { _id: 't2', name: 'Fast Train', trainNumber: 'TN5', status: 'maintenance' },
    { _id: 't3', name: 'Song Lam', trainNumber: 'NA2', status: 'inactive' },
    { _id: 't4', name: 'Sapa Express', trainNumber: 'SP3', status: 'active' },
  ]
};

const mockTodaySchedules = [
  { _id: 's1', trainNumber: 'SE1', route: { from: 'Hanoi', to: 'Saigon' }, schedule: { departure: '06:00', arrival: '10:00' }, status: 'departed' },
  { _id: 's2', trainNumber: 'SP3', route: { from: 'Hanoi', to: 'Lao Cai' }, schedule: { departure: '09:15', arrival: '17:30' }, status: 'boarding' },
  { _id: 's3', trainNumber: 'LC3', route: { from: 'Lao Cai', to: 'Hai Phong' }, schedule: { departure: '11:00', arrival: '19:45' }, status: 'scheduled' },
  { _id: 's4', trainNumber: 'TN5', route: { from: 'Da Nang', to: 'Nha Trang' }, schedule: { departure: '13:30', arrival: '21:00' }, status: 'delayed' },
  { _id: 's5', trainNumber: 'SE2', route: { from: 'Saigon', to: 'Hanoi' }, schedule: { departure: '14:00', arrival: '18:00' }, status: 'arrived' },
];

const mockMaintenanceTrains = [
  { _id: 't2', name: 'Fast Train', trainNumber: 'TN5', status: 'maintenance' },
];

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
    station: { true: vi.common.active, false: vi.common.inactive },
    train: { active: vi.common.active, maintenance: vi.common.maintenance, inactive: vi.common.inactive },
    schedule: {
      scheduled: vi.dashboard.status.scheduled,
      boarding: vi.dashboard.status.boarding,
      departed: vi.dashboard.status.departed,
      arrived: vi.dashboard.status.arrived,
      delayed: vi.dashboard.status.delayed,
      cancelled: vi.dashboard.status.cancelled
    },
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
  const stats = [
    { title: vi.dashboard.stats.totalStations, value: mockStations.total, icon: MapPin, color: 'bg-blue-500', change: `+2 ${vi.dashboard.stats.thisMonth}` },
    { title: vi.dashboard.stats.totalTrains, value: mockTrains.total, icon: Train, color: 'bg-green-500', change: `+1 ${vi.dashboard.stats.thisWeek}` },
    { title: vi.dashboard.stats.todaySchedules, value: mockTodaySchedules.length, icon: Calendar, color: 'bg-purple-500', change: `95% ${vi.dashboard.stats.onTime}` },
    { title: vi.dashboard.stats.needMaintenance, value: mockMaintenanceTrains.length, icon: AlertCircle, color: 'bg-red-500', change: mockMaintenanceTrains.length > 0 ? vi.dashboard.stats.requiresAttention : vi.dashboard.stats.allOk }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{vi.dashboard.title}</h1>
        <p className="mt-1.5 text-slate-600 dark:text-slate-400">
          {vi.dashboard.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">{vi.dashboard.sections.recentStations}</h3>
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
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">{vi.dashboard.sections.recentTrains}</h3>
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

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 p-5 border-b border-slate-200 dark:border-slate-700">{vi.dashboard.sections.todaySchedule}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-6 py-3">{vi.dashboard.table.train}</th>
                <th scope="col" className="px-6 py-3">{vi.dashboard.table.route}</th>
                <th scope="col" className="px-6 py-3">{vi.dashboard.table.departure}</th>
                <th scope="col" className="px-6 py-3">{vi.dashboard.table.arrival}</th>
                <th scope="col" className="px-6 py-3">{vi.dashboard.table.status}</th>
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
  );
};

export default Dashboard;
