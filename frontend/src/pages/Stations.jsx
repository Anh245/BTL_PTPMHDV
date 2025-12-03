import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStationStore } from '@/stores/useStationStore';
import StationList from '@/components/StationList';
import StationForm from '@/components/StationForm';
import { toast } from 'sonner';

export default function Stations() {
  const { stations, loading, fetchStations, createStation, updateStation, deleteStation, toggleStation } = useStationStore();
  const [editingStation, setEditingStation] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const handleSubmit = async (data) => {
    try {
      if (editingStation) {
        await updateStation(editingStation.id, data);
        toast.success('Cập nhật ga thành công!');
      } else {
        await createStation(data);
        toast.success('Tạo ga thành công!');
      }
      setEditingStation(null);
      setShowForm(false);
    } catch (err) {
      toast.error('Lỗi lưu ga: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ga này?')) return;
    
    try {
      await deleteStation(id);
      toast.success('Xóa ga thành công!');
    } catch (err) {
      toast.error('Lỗi xóa ga: ' + err.message);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleStation(id);
      toast.success('Chuyển đổi trạng thái ga thành công!');
    } catch (err) {
      toast.error('Lỗi chuyển đổi trạng thái ga: ' + err.message);
    }
  };

  const handleEdit = (station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingStation(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingStation(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Quản lý Ga tàu</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Quản lý tất cả các ga tàu trong hệ thống
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Ga
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingStation ? 'Chỉnh sửa Ga' : 'Thêm Ga Mới'}</CardTitle>
            <CardDescription>
              {editingStation ? 'Cập nhật thông tin ga' : 'Nhập thông tin chi tiết cho ga mới'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StationForm 
              initialData={editingStation} 
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <CardTitle>Danh sách Ga tàu</CardTitle>
          </div>
          <CardDescription>
            Xem và quản lý tất cả các ga trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-slate-500">Đang tải danh sách ga...</div>
          ) : stations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Không tìm thấy ga. Nhấn "Thêm Ga" để tạo mới.
            </div>
          ) : (
            <StationList
              stations={stations}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
