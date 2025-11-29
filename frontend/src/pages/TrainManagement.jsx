import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTrainStore } from '@/stores/useTrainStore';
import TrainList from '../components/TrainList';
import TrainForm from '../components/TrainForm';

export default function TrainManagement() {
  const { trains, loading, fetchTrains, createTrain, updateTrain, deleteTrain, updateTrainStatus } = useTrainStore();
  const [editingTrain, setEditingTrain] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchTrains();
  }, [fetchTrains]);

  const handleSubmit = async (data) => {
    try {
      if (editingTrain) {
        await updateTrain(editingTrain.id, data);
      } else {
        await createTrain(data);
      }
      setEditingTrain(null);
      setShowForm(false);
    } catch (err) {
      alert('Lỗi lưu tàu: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tàu này?')) return;
    
    try {
      await deleteTrain(id);
    } catch (err) {
      alert('Lỗi xóa tàu: ' + err.message);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateTrainStatus(id, newStatus);
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message);
    }
  };

  const handleEdit = (train) => {
    setEditingTrain(train);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingTrain(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingTrain(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Quản lý Tàu</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Quản lý đoàn tàu và hoạt động vận hành
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Tàu
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingTrain ? 'Chỉnh sửa Tàu' : 'Thêm Tàu Mới'}</CardTitle>
            <CardDescription>
              {editingTrain ? 'Cập nhật thông tin tàu' : 'Nhập thông tin chi tiết cho tàu mới'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrainForm 
              initialData={editingTrain} 
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Danh sách Tàu</CardTitle>
          <CardDescription>
            Xem và quản lý tất cả các tàu trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải danh sách tàu...</div>
          ) : trains.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy tàu. Nhấn "Thêm Tàu" để tạo mới.
            </div>
          ) : (
            <TrainList
              trains={trains}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusUpdate={handleStatusUpdate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
