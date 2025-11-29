import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTicketStore } from '@/stores/useTicketStore';
import TicketList from '@/components/TicketList';
import TicketForm from '@/components/TicketForm';

export default function TicketManagement() {
  const { tickets, loading, fetchTickets, createTicket, updateTicket, deleteTicket, purchaseTickets } = useTicketStore();
  const [editingTicket, setEditingTicket] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (data) => {
    try {
      console.log('Submitting ticket data:', data); // Debug log
      if (editingTicket) {
        await updateTicket(editingTicket.id, data);
        alert('Cập nhật vé thành công!');
      } else {
        await createTicket(data);
        alert('Tạo vé thành công!');
      }
      setEditingTicket(null);
      setShowForm(false);
    } catch (err) {
      console.error('Lỗi lưu vé:', err);
      console.error('Error details:', err.response?.data);
      const errorMsg = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Không thể lưu vé';
      alert(`Lỗi: ${errorMsg}\n\nChi tiết: ${JSON.stringify(err.response?.data, null, 2)}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vé này?')) return;
    
    try {
      await deleteTicket(id);
    } catch (err) {
      console.error('Lỗi xóa vé:', err);
    }
  };

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTicket(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTicket(null);
    setShowForm(false);
  };

  const handlePurchase = async (ticketId) => {
    const quantity = prompt('Nhập số lượng vé muốn mua:', '1');
    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return;
    }

    try {
      await purchaseTickets(ticketId, parseInt(quantity));
      alert(`Mua ${quantity} vé thành công!`);
    } catch (err) {
      console.error('Lỗi mua vé:', err);
      alert(`Lỗi: ${err.response?.data?.message || err.message || 'Không thể mua vé'}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Quản lý Vé tàu</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Quản lý tất cả các vé tàu trong hệ thống
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Vé
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTicket ? 'Chỉnh sửa Vé' : 'Thêm Vé Mới'}</CardTitle>
            <CardDescription>
              {editingTicket ? 'Cập nhật thông tin vé' : 'Nhập thông tin chi tiết cho vé mới'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TicketForm 
              initialData={editingTicket} 
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-blue-600" />
            <CardTitle>Danh sách Vé tàu</CardTitle>
          </div>
          <CardDescription>
            Xem và quản lý tất cả các vé trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải danh sách vé...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy vé. Nhấn "Thêm Vé" để tạo mới.
            </div>
          ) : (
            <TicketList
              tickets={tickets}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPurchase={handlePurchase}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
