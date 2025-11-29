import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function StationForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    isActive: true,
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
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Tên ga */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên ga *</Label>
          <Input 
            id="name"
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder="VD: Ga Hà Nội, Ga Sài Gòn" 
            required 
          />
        </div>

        {/* Địa chỉ */}
        <div className="space-y-2">
          <Label htmlFor="address">Địa chỉ</Label>
          <Textarea 
            id="address"
            name="address" 
            value={form.address} 
            onChange={handleChange} 
            placeholder="Nhập địa chỉ đầy đủ của ga"
            rows={3}
          />
        </div>

        {/* Trạng thái hoạt động */}
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="isActive"
            name="isActive" 
            checked={form.isActive} 
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="isActive" className="!mb-0">
            Ga đang hoạt động
          </Label>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit">
          {initialData ? 'Cập nhật ga' : 'Tạo ga mới'}
        </Button>
      </div>
    </form>
  );
}
