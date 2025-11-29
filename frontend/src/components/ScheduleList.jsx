import { Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

export default function ScheduleList({ schedules, onEdit, onDelete }) {
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diffMs = arr - dep;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Tàu</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Tuyến</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Khởi hành</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Đến</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Thời gian</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Trạng thái</th>
            <th className="px-6 py-3 text-right font-medium text-slate-900 dark:text-slate-100">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {schedules.map(schedule => {
            const departure = formatDateTime(schedule.departureTime);
            const arrival = formatDateTime(schedule.arrivalTime);
            const duration = calculateDuration(schedule.departureTime, schedule.arrivalTime);

            return (
              <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {schedule.trainNumber}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <span>{schedule.departureStation}</span>
                    <span className="text-slate-400">→</span>
                    <span>{schedule.arrivalStation}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div className="text-xs">
                    <div className="font-medium">{departure.date}</div>
                    <div className="text-slate-500">{departure.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                  <div className="text-xs">
                    <div className="font-medium">{arrival.date}</div>
                    <div className="text-slate-500">{arrival.time}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{duration}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={schedule.status} type="schedule" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(schedule)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      title="Chỉnh sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDelete(schedule.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {schedules.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có lịch trình nào</p>
        </div>
      )}
    </div>
  );
}
