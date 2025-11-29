import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Ticket, 
  Train, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Package, 
  ShoppingCart,
  Clock,
  FileText,
  Hash
} from 'lucide-react';

export default function TicketDetails({ ticket, open, onOpenChange }) {
  if (!ticket) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'N/A';
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Đang bán', variant: 'default', className: 'bg-green-500' },
      inactive: { label: 'Ngừng bán', variant: 'secondary' },
      sold_out: { label: 'Hết vé', variant: 'destructive' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Ticket className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl">{ticket.name}</DialogTitle>
                <DialogDescription className="mt-1">
                  Chi tiết thông tin vé tàu
                </DialogDescription>
              </div>
            </div>
            {getStatusBadge(ticket.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Schedule Reference */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Hash className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Mã tham chiếu lịch trình
              </h3>
            </div>
            <p className="text-lg font-mono text-blue-600 dark:text-blue-400">
              {ticket.scheduleRefId || 'N/A'}
            </p>
          </div>

          <Separator />

          {/* Snapshot Data Section */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Thông tin lịch trình (Snapshot)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Train Number */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Train className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Số hiệu tàu</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {ticket.trainNumberSnapshot || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Tuyến đường</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {ticket.routeSnapshot || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Departure Time */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg md:col-span-2">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Thời gian khởi hành</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDateTime(ticket.departureTimeSnapshot)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ticket Information */}
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Thông tin vé
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Giá vé</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {formatPrice(ticket.price)}
                  </p>
                </div>
              </div>

              {/* Quantity Info */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <Package className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Số lượng</p>
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Tổng số:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {ticket.totalQuantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Đã bán:</span>
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {ticket.soldQuantity || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400">Còn lại:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {ticket.availableQuantity || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg md:col-span-2">
                <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ngày tạo</p>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatDateTime(ticket.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả
                </h3>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
