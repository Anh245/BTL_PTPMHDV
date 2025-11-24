import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import vi from '@/lib/translations';

export default function TrainForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    type: 'local',
    status: 'active',
    maintenance: false,
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
    setForm({ name: '', type: 'local', status: 'active', maintenance: false });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">{vi.trains.form.trainName}</Label>
          <Input 
            id="name"
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            placeholder={vi.trains.form.trainNamePlaceholder} 
            required 
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{vi.trains.form.trainType}</Label>
          <select 
            id="type"
            name="type" 
            value={form.type} 
            onChange={handleChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="express">{vi.trains.form.types.express}</option>
            <option value="local">{vi.trains.form.types.local}</option>
            <option value="freight">{vi.trains.form.types.freight}</option>
            <option value="high-speed">{vi.trains.form.types.highSpeed}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{vi.trains.form.status}</Label>
          <select 
            id="status"
            name="status" 
            value={form.status} 
            onChange={handleChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="active">{vi.common.active}</option>
            <option value="inactive">{vi.common.inactive}</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 pt-8">
          <input 
            type="checkbox" 
            id="maintenance"
            name="maintenance" 
            checked={form.maintenance} 
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <Label htmlFor="maintenance" className="!mb-0">
            {vi.trains.form.underMaintenance}
          </Label>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {vi.common.cancel}
          </Button>
        )}
        <Button type="submit">
          {initialData ? vi.trains.form.updateTrain : vi.trains.form.createTrain}
        </Button>
      </div>
    </form>
  );
}
