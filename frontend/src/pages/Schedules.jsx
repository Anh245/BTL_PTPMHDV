import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScheduleStore } from '@/stores/useScheduleStore';
import ScheduleList from '@/components/ScheduleList';
import ScheduleForm from '@/components/ScheduleForm';

export default function Schedules() {
  const { schedules, loading, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } = useScheduleStore();
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleSubmit = async (data) => {
    try {
      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, data);
      } else {
        await createSchedule(data);
      }
      setEditingSchedule(null);
      setShowForm(false);
    } catch (err) {
      alert('Lỗi lưu lịch trình: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch trình này?')) return;
    
    try {
      await deleteSchedule(id);
    } catch (err) {
      alert('Lỗi xóa lịch trình: ' + err.message);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingSchedule(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Quản lý Lịch trình</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Quản lý lịch trình tàu và đặt chỗ
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Lịch trình
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingSchedule ? 'Chỉnh sửa Lịch trình' : 'Thêm Lịch trình Mới'}</CardTitle>
            <CardDescription>
              {editingSchedule ? 'Cập nhật thông tin lịch trình' : 'Nhập thông tin chi tiết cho lịch trình mới'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScheduleForm 
              initialData={editingSchedule} 
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <CardTitle>Danh sách Lịch trình</CardTitle>
          </div>
          <CardDescription>
            Xem và quản lý tất cả các lịch trình tàu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải danh sách lịch trình...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy lịch trình. Nhấn "Thêm Lịch trình" để tạo mới.
            </div>
          ) : (
            <ScheduleList
              schedules={schedules}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
