import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { trainAPI } from '@/services/trainServiceAPI';
import { stationAPI } from '@/services/stationServiceAPI';

export default function ScheduleForm({ initialData, onSubmit, onCancel }) {
  const [trains, setTrains] = useState([]);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    trainRefId: '',
    trainNumberSnapshot: '',
    departureStationRefId: '',
    departureStationNameSnapshot: '',
    arrivalStationRefId: '',
    arrivalStationNameSnapshot: '',
    date: '',
    departureTime: '',
    arrivalTime: '',
    status: 'scheduled',
  });

  // Fetch trains and stations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [trainsResponse, stationsResponse] = await Promise.all([
          trainAPI.getTrains(),
          stationAPI.getStations()
        ]);
        
        setTrains(trainsResponse.data || []);
        setStations(stationsResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (initialData) {
      // Parse departureTime and arrivalTime from backend (LocalDateTime format)
      const depDateTime = initialData.departureTime ? new Date(initialData.departureTime) : null;
      const arrDateTime = initialData.arrivalTime ? new Date(initialData.arrivalTime) : null;

      setForm({
        trainRefId: initialData.trainRefId || '',
        trainNumberSnapshot: initialData.trainNumber || '',
        departureStationRefId: initialData.departureStationRefId || '',
        departureStationNameSnapshot: initialData.departureStation || '',
        arrivalStationRefId: initialData.arrivalStationRefId || '',
        arrivalStationNameSnapshot: initialData.arrivalStation || '',
        date: depDateTime ? depDateTime.toISOString().split('T')[0] : '',
        departureTime: depDateTime ? depDateTime.toTimeString().slice(0, 5) : '',
        arrivalTime: arrDateTime ? arrDateTime.toTimeString().slice(0, 5) : '',
        status: initialData.status || 'scheduled',
      });
    }
  }, [initialData]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTrainChange = (e) => {
    const trainId = e.target.value;
    const selectedTrain = trains.find(t => t.id === parseInt(trainId));
    
    setForm(prev => ({
      ...prev,
      trainRefId: trainId,
      trainNumberSnapshot: selectedTrain?.trainNumber || ''
    }));
  };

  const handleStationChange = (e, type) => {
    const stationId = e.target.value;
    const selectedStation = stations.find(s => s.id === parseInt(stationId));
    
    if (type === 'departure') {
      setForm(prev => ({
        ...prev,
        departureStationRefId: stationId,
        departureStationNameSnapshot: selectedStation?.name || ''
      }));
    } else {
      setForm(prev => ({
        ...prev,
        arrivalStationRefId: stationId,
        arrivalStationNameSnapshot: selectedStation?.name || ''
      }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    
    // Combine date with time to create LocalDateTime format
    const departureDateTime = `${form.date}T${form.departureTime}:00`;
    const arrivalDateTime = `${form.date}T${form.arrivalTime}:00`;
    
    const submitData = {
      trainRefId: parseInt(form.trainRefId),
      trainNumberSnapshot: form.trainNumberSnapshot,
      departureStationRefId: parseInt(form.departureStationRefId),
      departureStationNameSnapshot: form.departureStationNameSnapshot,
      arrivalStationRefId: parseInt(form.arrivalStationRefId),
      arrivalStationNameSnapshot: form.arrivalStationNameSnapshot,
      departureTime: departureDateTime,
      arrivalTime: arrivalDateTime,
      status: form.status
    };
    
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chọn tàu */}
        <div className="space-y-2">
          <Label htmlFor="trainRefId">Tàu *</Label>
          <select 
            id="trainRefId"
            value={form.trainRefId} 
            onChange={handleTrainChange}
            disabled={loading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">-- Chọn tàu --</option>
            {trains.filter(t => t.status === 'active').map(train => (
              <option key={train.id} value={train.id}>
                {train.trainNumber} - {train.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ga đi */}
        <div className="space-y-2">
          <Label htmlFor="departureStationRefId">Ga đi *</Label>
          <select 
            id="departureStationRefId"
            value={form.departureStationRefId} 
            onChange={(e) => handleStationChange(e, 'departure')}
            disabled={loading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">-- Chọn ga đi --</option>
            {stations.filter(s => s.isActive).map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ga đến */}
        <div className="space-y-2">
          <Label htmlFor="arrivalStationRefId">Ga đến *</Label>
          <select 
            id="arrivalStationRefId"
            value={form.arrivalStationRefId} 
            onChange={(e) => handleStationChange(e, 'arrival')}
            disabled={loading}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="">-- Chọn ga đến --</option>
            {stations.filter(s => s.isActive).map(station => (
              <option key={station.id} value={station.id}>
                {station.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ngày */}
        <div className="space-y-2">
          <Label htmlFor="date">Ngày *</Label>
          <Input 
            id="date"
            name="date" 
            type="date"
            value={form.date} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Giờ khởi hành */}
        <div className="space-y-2">
          <Label htmlFor="departureTime">Giờ khởi hành *</Label>
          <Input 
            id="departureTime"
            name="departureTime" 
            type="time"
            value={form.departureTime} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Giờ đến */}
        <div className="space-y-2">
          <Label htmlFor="arrivalTime">Giờ đến *</Label>
          <Input 
            id="arrivalTime"
            name="arrivalTime" 
            type="time"
            value={form.arrivalTime} 
            onChange={handleChange} 
            required 
          />
        </div>

        {/* Trạng thái */}
        <div className="space-y-2">
          <Label htmlFor="status">Trạng thái *</Label>
          <select 
            id="status"
            name="status" 
            value={form.status} 
            onChange={handleChange}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="scheduled">Đã lên lịch</option>
            <option value="departed">Đã khởi hành</option>
            <option value="delayed">Bị trễ</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {initialData ? 'Cập nhật lịch trình' : 'Tạo lịch trình'}
        </Button>
      </div>
    </form>
  );
}
