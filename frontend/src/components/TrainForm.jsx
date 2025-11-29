import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TrainForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    trainNumber: '',
    totalSeats: '',
    status: 'active',
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Transform data to match backend format
    const submitData = {
      ...form,
      totalSeats: parseInt(form.totalSeats) || 0
    };
    
    onSubmit(submitData);
    setForm({ name: '', trainNumber: '',  status: 'active' });
  };
  console.log(form);
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Tên tàu *</Label>
          <Input 
            id="name"
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="VD: Unity Express" 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="trainNumber">Số hiệu tàu *</Label>
          <Input 
            id="trainNumber"
            name="trainNumber" 
            value={form.trainNumber} 
            onChange={handleChange} 
            placeholder="VD: SE1, SE2" 
            required 
          />
        </div>



        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái</Label>
          <select 
            id="status"
            name="status" 
            value={form.status} 
            onChange={handleChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="maintenance">Đang bảo trì</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit">
          {initialData ? 'Cập nhật tàu' : 'Tạo tàu'}
        </Button>
      </div>
    </form>
  );
}
