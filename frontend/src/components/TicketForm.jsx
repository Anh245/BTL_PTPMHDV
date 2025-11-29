import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTrainStore } from '@/stores/useTrainStore';
import { useStationStore } from '@/stores/useStationStore';

const ticketSchema = yup.object({
  name: yup.string().required('Tên vé là bắt buộc'),
  trainNumber: yup.string().required('Số hiệu tàu là bắt buộc'),
  fromStation: yup.string().required('Ga đi là bắt buộc'),
  toStation: yup.string().required('Ga đến là bắt buộc'),
  price: yup.number().positive('Giá phải lớn hơn 0').required('Giá là bắt buộc'),
  date: yup.string().required('Ngày khởi hành là bắt buộc'),
  totalQuantity: yup.number().positive('Số lượng vé phải lớn hơn 0').integer('Số lượng vé phải là số nguyên').required('Số lượng vé là bắt buộc'),
  description: yup.string(),
}).test('different-stations', 'Ga đi và ga đến không thể giống nhau', function(values) {
  return values.fromStation !== values.toStation;
});

export default function TicketForm({ initialData, onSubmit, onCancel }) {
  // Use Zustand stores instead of local state
  const { trains, loading: trainsLoading, error: trainsError, fetchTrains } = useTrainStore();
  const { stations, loading: stationsLoading, error: stationsError, fetchStations } = useStationStore();
  
  // Combined loading and error states
  const loading = trainsLoading || stationsLoading;
  const error = trainsError || stationsError;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(ticketSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      trainNumber: initialData.trainNumber || '',
      fromStation: initialData.fromStation || '',
      toStation: initialData.toStation || '',
      price: initialData.price || '',
      date: initialData.date || '',
      totalQuantity: initialData.totalQuantity || '',
      description: initialData.description || '',
    } : {
      name: '',
      trainNumber: '',
      fromStation: '',
      toStation: '',
      price: '',
      date: '',
      totalQuantity: '',
      description: '',
    }
  });

  // Debug: Log validation errors
  console.log('Form validation errors:', errors);

  const onFormSubmit = (data) => {
    console.log('Form data before transform:', data); // Debug log
    
    // Transform data to match backend format
    const price = parseFloat(data.price);
    const totalQuantity = parseInt(data.totalQuantity, 10);
    
    // Validate price range (max 99,999,999.99 for DECIMAL(12,2))
    if (price > 9999999999.99) {
      alert('Giá vé không được vượt quá 9,999,999,999.99 VNĐ');
      return;
    }
    
    const transformedData = {
      ...data,
      price: price, // Ensure price is number
      totalQuantity: totalQuantity, // Ensure totalQuantity is integer
      status: 'active' // Default status
    };
    console.log('Form data after transform:', transformedData); // Debug log
    
    onSubmit(transformedData);
  };

  const onFormError = (errors) => {
    console.log('Form validation failed:', errors);
  };

  // Fetch trains and stations on component mount using store actions
  useEffect(() => {
    fetchTrains();
    fetchStations();
  }, [fetchTrains, fetchStations]);

  // Handle retry when errors occur
  const handleRetry = () => {
    if (trainsError) {
      fetchTrains();
    }
    if (stationsError) {
      fetchStations();
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-6">
      {/* Error handling UI */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium">Lỗi khi tải dữ liệu</p>
            <p className="text-sm">{error}</p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleRetry}
            className="ml-4"
          >
            Thử lại
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tên vé */}
        <div className="space-y-2">
          <Label htmlFor="name">Tên vé *</Label>
          <Input 
            id="name" 
            {...register('name')} 
            placeholder="VD: Vé Hà Nội - Sài Gòn" 
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        {/* Số hiệu tàu */}
        <div className="space-y-2">
          <Label htmlFor="trainNumber">Số hiệu tàu *</Label>
          <select
            id="trainNumber"
            {...register('trainNumber')}
            disabled={loading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- Chọn tàu --</option>
            {trains.filter(t => t.status === 'active').map((train) => (
              <option key={train.id} value={train.trainNumber}>
                {train.trainNumber} - {train.name}
              </option>
            ))}
          </select>
          {errors.trainNumber && <p className="text-sm text-red-500 mt-1">{errors.trainNumber.message}</p>}
          {loading && <p className="text-xs text-slate-500">Đang tải danh sách tàu...</p>}
        </div>

        {/* Ga đi */}
        <div className="space-y-2">
          <Label htmlFor="fromStation">Ga đi *</Label>
          <select
            id="fromStation"
            {...register('fromStation')}
            disabled={loading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- Chọn ga đi --</option>
            {stations.filter(s => s.isActive).map((station) => (
              <option key={station.id} value={station.name}>
                {station.name}
              </option>
            ))}
          </select>
          {errors.fromStation && <p className="text-sm text-red-500 mt-1">{errors.fromStation.message}</p>}
        </div>

        {/* Ga đến */}
        <div className="space-y-2">
          <Label htmlFor="toStation">Ga đến *</Label>
          <select
            id="toStation"
            {...register('toStation')}
            disabled={loading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">-- Chọn ga đến --</option>
            {stations.filter(s => s.isActive).map((station) => (
              <option key={station.id} value={station.name}>
                {station.name}
              </option>
            ))}
          </select>
          {errors.toStation && <p className="text-sm text-red-500 mt-1">{errors.toStation.message}</p>}
        </div>

        {/* Giá vé */}
        <div className="space-y-2">
          <Label htmlFor="price">Giá vé (VNĐ) *</Label>
          <Input 
            id="price" 
            type="number" 
            step="1000"
            {...register('price')} 
            placeholder="500000" 
          />
          {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
        </div>

        {/* Ngày khởi hành */}
        <div className="space-y-2">
          <Label htmlFor="date">Ngày khởi hành *</Label>
          <Input 
            id="date" 
            type="date"
            {...register('date')} 
          />
          {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
        </div>

        {/* Số lượng vé */}
        <div className="space-y-2">
          <Label htmlFor="totalQuantity">Số lượng vé *</Label>
          <Input 
            id="totalQuantity" 
            type="number" 
            min="1"
            {...register('totalQuantity')} 
            placeholder="100" 
          />
          {errors.totalQuantity && <p className="text-sm text-red-500 mt-1">{errors.totalQuantity.message}</p>}
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả (Tùy chọn)</Label>
        <Textarea 
          id="description" 
          {...register('description')} 
          placeholder="Thông tin thêm về vé..."
          rows={3}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : initialData ? 'Cập nhật vé' : 'Tạo vé'}
        </Button>
      </div>
    </form>
  );
}
