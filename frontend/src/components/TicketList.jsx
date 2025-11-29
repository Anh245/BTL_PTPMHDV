import { Edit, Trash2, Ticket, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TicketList({ tickets, onEdit, onDelete, onPurchase }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <tr>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Tên vé</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Tàu</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Tuyến</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Giá</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Ngày</th>
            <th className="px-6 py-3 text-left font-medium text-slate-900 dark:text-slate-100">Số vé</th>
            <th className="px-6 py-3 text-right font-medium text-slate-900 dark:text-slate-100">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-slate-900 dark:text-slate-100">{ticket.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{ticket.trainNumber}</td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                {ticket.fromStation} → {ticket.toStation}
              </td>
              <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">
                {formatPrice(ticket.price)}
              </td>
              <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{formatDate(ticket.date)}</td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <div className="text-sm">
                    <span className="font-medium text-green-600">Còn: {ticket.availableQuantity || 0}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-slate-600">Tổng: {ticket.totalQuantity || 0}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Đã bán: {ticket.soldQuantity || 0}
                  </div>
                  {ticket.status === 'sold_out' && (
                    <Badge variant="destructive" className="w-fit text-xs">Hết vé</Badge>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-2">
                  {onPurchase && ticket.availableQuantity > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPurchase(ticket.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Mua vé"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(ticket)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Chỉnh sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(ticket.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {tickets.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Chưa có vé nào</p>
        </div>
      )}
    </div>
  );
}
