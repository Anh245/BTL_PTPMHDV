import { Edit, Trash2, Power, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';

export default function StationList({ stations, onEdit, onDelete, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Tên ga</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Địa chỉ</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Trạng thái</th>
            <th className="px-6 py-3 text-right font-medium text-slate-900 dark:text-slate-100">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {stations.map(station => (
            <tr key={station.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {station.name}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-md">
                <div className="truncate">
                  {station.address || <span className="text-slate-400 italic">Chưa có địa chỉ</span>}
                </div>
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={station.isActive} type="station" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(station)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(station.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onToggle(station.id)}
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                    title="Bật/Tắt"
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {stations.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có ga nào</p>
        </div>
      )}
    </div>
  );
}
