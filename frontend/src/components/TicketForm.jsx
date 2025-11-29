import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useScheduleStore } from '@/stores/useScheduleStore';

const ticketSchema = yup.object({
  name: yup.string().required('Tên vé là bắt buộc'),
  scheduleRefId: yup.number().required('Lịch trình là bắt buộc').positive('Lịch trình là bắt buộc'),
  price: yup.number().positive('Giá phải lớn hơn 0').required('Giá là bắt buộc'),
  totalQuantity: yup.number().positive('Số lượng vé phải lớn hơn 0').integer('Số lượng vé phải là số nguyên').required('Số lượng vé là bắt buộc'),
  description: yup.string(),
});

export default function TicketForm({ initialData, onSubmit, onCancel }) {
  // Use ScheduleStore for fetching schedules
  const { schedules, loading, error, getActiveSchedules } = useScheduleStore();
  
  // Local state for selected schedule details
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  // Local state for backend validation errors
  const [backendErrors, setBackendErrors] = useState(null);
  
  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(ticketSchema),
    defaultValues: initialData ? {
      name: initialData.name || '',
      scheduleRefId: initialData.scheduleRefId || '',
      price: initialData.price || '',
      totalQuantity: initialData.totalQuantity || '',
      description: initialData.description || '',
    } : {
      name: '',
      scheduleRefId: '',
      price: '',
      totalQuantity: '',
      description: '',
    }
  });
  
  // Watch scheduleRefId changes
  const watchScheduleRefId = watch('scheduleRefId');

  // Update selected schedule when scheduleRefId changes
  useEffect(() => {
    if (watchScheduleRefId) {
      const schedule = schedules.find(s => s.id === parseInt(watchScheduleRefId));
      setSelectedSchedule(schedule || null);
    } else {
      setSelectedSchedule(null);
    }
  }, [watchScheduleRefId, schedules]);

  // Clear backend errors when form values change
  useEffect(() => {
    if (backendErrors) {
      setBackendErrors(null);
    }
  }, [watchScheduleRefId, watch('name'), watch('price'), watch('totalQuantity'), watch('description')]);

  const onFormSubmit = async (data) => {
    // Clear previous backend errors
    setBackendErrors(null);
    
    // Transform data to match backend format
    const price = parseFloat(data.price);
    const totalQuantity = parseInt(data.totalQuantity, 10);
    const scheduleRefId = parseInt(data.scheduleRefId, 10);
    
    // Validate price range (max 99,999,999.99 for DECIMAL(12,2))
    if (price > 9999999999.99) {
      setBackendErrors({
        general: 'Giá vé không được vượt quá 9,999,999,999.99 VNĐ'
      });
      return;
    }
    
    const transformedData = {
      name: data.name,
      scheduleRefId: scheduleRefId,
      price: price,
      totalQuantity: totalQuantity,
      description: data.description || '',
      status: 'active'
    };
    
    try {
      await onSubmit(transformedData);
    } catch (error) {
      // Handle backend validation errors
      handleBackendError(error);
    }
  };

  const onFormError = (errors) => {
    console.log('Form validation failed:', errors);
  };

  // Handle backend validation errors
  const handleBackendError = (error) => {
    console.error('Backend error:', error);
    
    const errorData = error.response?.data;
    const errorMessage = errorData?.message || error.message || 'Đã xảy ra lỗi không xác định';
    
    // Parse backend error and map to field-specific errors
    const errors = {
      general: errorMessage
    };
    
    // Map specific error messages to fields
    if (errorMessage.includes('Schedule not found') || errorMessage.includes('Lịch trình không tồn tại')) {
      errors.scheduleRefId = 'Lịch trình không tồn tại';
    } else if (errorMessage.includes('cancelled schedule') || errorMessage.includes('lịch trình đã hủy')) {
      errors.scheduleRefId = 'Không thể tạo vé cho lịch trình đã hủy';
    } else if (errorMessage.includes('departed schedule') || errorMessage.includes('lịch trình đã khởi hành')) {
      errors.scheduleRefId = 'Không thể tạo vé cho lịch trình đã khởi hành';
    } else if (errorMessage.includes('price') || errorMessage.includes('giá')) {
      errors.price = errorMessage;
    } else if (errorMessage.includes('quantity') || errorMessage.includes('số lượng')) {
      errors.totalQuantity = errorMessage;
    } else if (errorMessage.includes('name') || errorMessage.includes('tên')) {
      errors.name = errorMessage;
    }
    
    // Handle validation errors from Spring Boot (field-level errors)
    if (errorData?.errors) {
      Object.keys(errorData.errors).forEach(field => {
        errors[field] = errorData.errors[field];
      });
    }
    
    setBackendErrors(errors);
  };

  // Fetch active schedules on component mount (only in create mode)
  useEffect(() => {
    if (!isEditMode) {
      getActiveSchedules();
    }
  }, [getActiveSchedules, isEditMode]);

  // Handle retry when errors occur
  const handleRetry = () => {
    getActiveSchedules();
  };
  
  // Format schedule display: "Train Number: Departure → Arrival (Time)"
  const formatScheduleDisplay = (schedule) => {
    const departureTime = new Date(schedule.departureTime).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${schedule.trainNumberSnapshot}: ${schedule.departureStationNameSnapshot} → ${schedule.arrivalStationNameSnapshot} (${departureTime})`;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-6">
      {/* Backend validation errors - Display at top of form */}
      {backendErrors && backendErrors.general && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium">Lỗi xác thực</p>
              <p className="text-sm mt-1">{backendErrors.general}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error handling UI - Display error message with retry button on failure */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md flex items-center justify-between">
          <div>
            <p className="font-medium">Lỗi khi tải dữ liệu lịch trình</p>
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

      {/* Schedule selector - Read-only in edit mode */}
      <div className="space-y-2">
        <Label htmlFor="scheduleRefId">Lịch trình *</Label>
        {isEditMode ? (
          // Display schedule information as read-only in edit mode
          <div className="bg-slate-100 border border-slate-300 rounded-md p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm text-slate-600 font-medium">Thông tin lịch trình (Không thể thay đổi)</span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-sm mt-2">
                <div className="flex">
                  <span className="text-slate-600 w-32">Số hiệu tàu:</span>
                  <span className="font-medium text-slate-900">{initialData.trainNumberSnapshot || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-600 w-32">Tuyến đường:</span>
                  <span className="font-medium text-slate-900">{initialData.routeSnapshot || 'N/A'}</span>
                </div>
                <div className="flex">
                  <span className="text-slate-600 w-32">Giờ khởi hành:</span>
                  <span className="font-medium text-slate-900">
                    {initialData.departureTimeSnapshot 
                      ? new Date(initialData.departureTimeSnapshot).toLocaleString('vi-VN')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
            {/* Hidden input to maintain scheduleRefId in form data */}
            <input type="hidden" {...register('scheduleRefId')} />
          </div>
        ) : (
          // Show schedule selector in create mode
          <>
            <select
              id="scheduleRefId"
              {...register('scheduleRefId')}
              disabled={loading || error}
              className={`flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                (errors.scheduleRefId || backendErrors?.scheduleRefId) 
                  ? 'border-red-500 focus-visible:ring-red-500' 
                  : 'border-input'
              }`}
            >
              <option value="">
                {loading ? '-- Đang tải... --' : '-- Chọn lịch trình --'}
              </option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {formatScheduleDisplay(schedule)}
                </option>
              ))}
            </select>
            {errors.scheduleRefId && <p className="text-sm text-red-500 mt-1">{errors.scheduleRefId.message}</p>}
            {backendErrors?.scheduleRefId && <p className="text-sm text-red-500 mt-1">{backendErrors.scheduleRefId}</p>}
            
            {/* Display loading indicator while fetching schedules */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang tải danh sách lịch trình...</span>
              </div>
            )}
            
            {/* Display "no schedules available" message when list is empty */}
            {!loading && !error && schedules.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2 rounded-md text-sm">
                <p className="font-medium">Không có lịch trình khả dụng</p>
                <p className="text-xs mt-1">Vui lòng tạo lịch trình trước khi tạo vé.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Schedule details preview - Only show in create mode */}
      {!isEditMode && selectedSchedule && (
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-2">
          <h3 className="font-medium text-sm text-slate-700">Thông tin lịch trình</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-600">Số hiệu tàu:</span>
              <span className="ml-2 font-medium">{selectedSchedule.trainNumberSnapshot}</span>
            </div>
            <div>
              <span className="text-slate-600">Tuyến:</span>
              <span className="ml-2 font-medium">
                {selectedSchedule.departureStationNameSnapshot} → {selectedSchedule.arrivalStationNameSnapshot}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Giờ khởi hành:</span>
              <span className="ml-2 font-medium">
                {new Date(selectedSchedule.departureTime).toLocaleString('vi-VN')}
              </span>
            </div>
            <div>
              <span className="text-slate-600">Giờ đến:</span>
              <span className="ml-2 font-medium">
                {new Date(selectedSchedule.arrivalTime).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
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
            className={`${(errors.name || backendErrors?.name) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          {backendErrors?.name && <p className="text-sm text-red-500 mt-1">{backendErrors.name}</p>}
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
            className={`${(errors.price || backendErrors?.price) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>}
          {backendErrors?.price && <p className="text-sm text-red-500 mt-1">{backendErrors.price}</p>}
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
            className={`${(errors.totalQuantity || backendErrors?.totalQuantity) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
          />
          {errors.totalQuantity && <p className="text-sm text-red-500 mt-1">{errors.totalQuantity.message}</p>}
          {backendErrors?.totalQuantity && <p className="text-sm text-red-500 mt-1">{backendErrors.totalQuantity}</p>}
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
          className={`${(errors.description || backendErrors?.description) ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
        />
        {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
        {backendErrors?.description && <p className="text-sm text-red-500 mt-1">{backendErrors.description}</p>}
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
