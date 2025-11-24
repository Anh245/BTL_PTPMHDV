import { Edit, Trash2, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import vi from '@/lib/translations';

export default function TrainList({ trains, onEdit, onDelete, onStatusUpdate }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">{vi.trains.table.trainName}</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">{vi.trains.table.type}</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">{vi.trains.table.status}</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">{vi.trains.table.maintenance}</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">{vi.trains.table.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {trains.map(train => (
            <tr key={train.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{train.name}</td>
              <td className="px-6 py-4 capitalize text-slate-600 dark:text-slate-400">{train.type}</td>
              <td className="px-6 py-4">
                <StatusBadge
                  status={
                    train.status === 'active' ? 'active' :
                    train.status === 'inactive' ? 'inactive' :
                    'unknown'
                  }
                  type="train"
                />
              </td>
              <td className="px-6 py-4">
                <StatusBadge status={train.maintenance} type="station" />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onEdit(train)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(train.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() =>
                      onStatusUpdate(train.id, train.status === 'active' ? 'inactive' : 'active')
                    }
                    className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
