// Service để quản lý schedules (lịch trình tàu)
// Kết nối với schedules-service qua API Gateway
import api from "../lib/axios";

export const scheduleAPI = {
  // Lấy danh sách tất cả schedules
  // Params: { page, size, trainNumber, departureStation, arrivalStation, status }
  // Output: Array of schedules
  getSchedules: async (params = {}) => {
    const res = await api.get('/schedules', { params });
    return res.data;
  },
  
  // Lấy thông tin 1 schedule theo ID
  // Input: schedule ID
  // Output: Schedule object with ticket info
  getSchedule: async (id) => {
    const res = await api.get(`/schedules/${id}`);
    const schedule = res.data;
    
    // Lấy tickets cho schedule này để tính số vé và giá
    try {
      const ticketsRes = await api.get('/tickets');
      const allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      
      const scheduleTickets = allTickets.filter(ticket => 
        ticket.scheduleId === schedule.id || 
        ticket.scheduleRefId === schedule.id
      );
      
      let totalAvailableSeats = 0;
      let ticketPrice = schedule.basePrice || 0;
      
      scheduleTickets.forEach(ticket => {
        const ticketStatus = (ticket.status || '').toUpperCase();
        
        if (ticketStatus === 'ACTIVE') {
          const totalQty = ticket.totalQuantity || 0;
          const soldQty = ticket.soldQuantity || 0;
          const availableQty = totalQty - soldQty;
          
          totalAvailableSeats += availableQty;
          
          if (availableQty > 0 && ticket.price) {
            ticketPrice = ticket.price;
          }
        }
      });
      
      return {
        ...schedule,
        availableSeats: totalAvailableSeats,
        basePrice: ticketPrice,
        ticketPrice: ticketPrice
      };
    } catch (error) {
      console.error('Error fetching tickets for schedule:', error);
      return schedule; // Return schedule without ticket info if error
    }
  },

  // Tìm kiếm schedules theo route (tuyến đường)
  // Params: { departureStation, arrivalStation, date }
  // Output: Array of matching schedules
  searchSchedules: async (params) => {
    try {
      // Lấy tất cả schedules từ backend
      const res = await api.get('/schedules');
      let schedules = res.data || [];

      // Filter theo departureStation (tìm chính xác hoặc chứa chuỗi)
      if (params.departureStation) {
        schedules = schedules.filter(s => {
          if (!s.departureStation && !s.departureStationNameSnapshot) return false;
          const stationName = s.departureStationNameSnapshot || s.departureStation || '';
          return stationName.toLowerCase().includes(params.departureStation.toLowerCase()) ||
                 stationName.toLowerCase() === params.departureStation.toLowerCase();
        });
      }

      // Filter theo arrivalStation (tìm chính xác hoặc chứa chuỗi)
      if (params.arrivalStation) {
        schedules = schedules.filter(s => {
          if (!s.arrivalStation && !s.arrivalStationNameSnapshot) return false;
          const stationName = s.arrivalStationNameSnapshot || s.arrivalStation || '';
          return stationName.toLowerCase().includes(params.arrivalStation.toLowerCase()) ||
                 stationName.toLowerCase() === params.arrivalStation.toLowerCase();
        });
      }

      // Filter theo date (nếu có)
      if (params.date) {
        schedules = schedules.filter(s => {
          // Kiểm tra departureTime (LocalDateTime format từ backend)
          if (!s.departureTime) return false;
          
          try {
            // Parse departureTime (có thể là ISO string hoặc LocalDateTime)
            const scheduleDate = new Date(s.departureTime).toISOString().split('T')[0];
            const searchDate = new Date(params.date).toISOString().split('T')[0];
            return scheduleDate === searchDate;
          } catch (error) {
            console.error('Error parsing date for schedule:', s, error);
            return false;
          }
        });
      }

      // Lấy TẤT CẢ tickets để tính số vé available và giá thực tế
      let allTickets = [];
      try {
        const ticketsRes = await api.get('/tickets');
        allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      } catch (error) {
        console.error('Error fetching tickets for search:', error);
      }

      // Đảm bảo mỗi schedule có đầy đủ thông tin + tính số vé từ tickets
      schedules = schedules.map(schedule => {
        // Tính số vé available và giá từ tickets
        const scheduleTickets = allTickets.filter(ticket => 
          ticket.scheduleId === schedule.id || 
          ticket.scheduleRefId === schedule.id
        );
        
        let totalAvailableSeats = 0;
        let ticketPrice = schedule.basePrice || 0;
        
        scheduleTickets.forEach(ticket => {
          const ticketStatus = (ticket.status || '').toUpperCase();
          
          if (ticketStatus === 'ACTIVE') {
            const totalQty = ticket.totalQuantity || 0;
            const soldQty = ticket.soldQuantity || 0;
            const availableQty = totalQty - soldQty;
            
            totalAvailableSeats += availableQty;
            
            // Lấy giá từ ticket đầu tiên có vé available
            if (availableQty > 0 && ticket.price && ticketPrice === (schedule.basePrice || 0)) {
              ticketPrice = ticket.price;
            }
          }
        });

        return {
          ...schedule,
          // Ưu tiên dữ liệu mới nhất từ schedule, fallback về snapshot
          trainNumber: schedule.trainNumber || schedule.trainNumberSnapshot || 'N/A',
          // Ưu tiên tên ga mới nhất
          departureStation: schedule.departureStation || schedule.departureStationNameSnapshot || 'N/A',
          arrivalStation: schedule.arrivalStation || schedule.arrivalStationNameSnapshot || 'N/A',
          // Giá từ ticket (đã cập nhật)
          basePrice: ticketPrice,
          ticketPrice: ticketPrice,
          // Số vé thực tế từ tickets
          availableSeats: totalAvailableSeats,
          totalSeats: totalAvailableSeats, // Tạm thời set = availableSeats
          // Đảm bảo có status
          status: schedule.status || 'scheduled',
          // Parse time từ departureTime và arrivalTime
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime
        };
      });

      return schedules;
    } catch (error) {
      console.error('Error in searchSchedules:', error);
      throw error;
    }
  },

  // Lấy schedules theo train number
  // Input: train number
  // Output: Array of schedules
  getSchedulesByTrain: async (trainNumber) => {
    const res = await api.get(`/schedules/train/${trainNumber}`);
    return res.data;
  },

  // Lấy schedules hôm nay
  // Output: Array of today's schedules
  getTodaySchedules: async () => {
    const res = await api.get('/schedules/today');
    return res.data;
  },

  // Đặt chỗ (reserve seats) trên schedule
  // Input: schedule ID, { numberOfSeats }
  // Output: Updated schedule
  reserveSeats: async (id, data) => {
    const res = await api.patch(`/schedules/${id}/reserve`, data);
    return res.data;
  },

  // Lấy schedules đang available
  // Output: Array of available schedules
  getAvailableSchedules: async () => {
    try {
      const res = await api.get('/schedules');
      
      // Xử lý trường hợp response không phải array
      if (!Array.isArray(res.data)) {
        console.warn('Schedules API did not return an array:', res.data);
        return [];
      }
      
      // Filter schedules có status scheduled
      const scheduledSchedules = res.data.filter(schedule => {
        if (!schedule) return false;
        const status = (schedule.status || '').toLowerCase();
        return status === 'scheduled';
      });
      
      // Lấy TẤT CẢ tickets một lần (vì API không hỗ trợ filter theo scheduleId)
      let allTickets = [];
      try {
        const ticketsRes = await api.get('/tickets');
        allTickets = Array.isArray(ticketsRes.data) ? ticketsRes.data : [];
      } catch (error) {
        console.error('Error fetching tickets:', error);
        // Nếu không lấy được tickets, trả về schedules với availableSeats = null
        return scheduledSchedules.map(s => ({ ...s, availableSeats: null }));
      }
      
      // Với mỗi schedule, tính tổng số vé available và lấy giá từ tickets
      const schedulesWithTicketInfo = scheduledSchedules.map((schedule) => {
        // Filter tickets thuộc schedule này
        const scheduleTickets = allTickets.filter(ticket => 
          ticket.scheduleId === schedule.id || 
          ticket.scheduleRefId === schedule.id
        );
        
        // Tính tổng số vé available từ TẤT CẢ tickets của schedule
        let totalAvailableSeats = 0;
        let ticketPrice = schedule.basePrice; // Fallback to schedule price
        
        scheduleTickets.forEach(ticket => {
          const ticketStatus = (ticket.status || '').toUpperCase();
          
          // Chỉ tính vé từ tickets có status ACTIVE (không INACTIVE hoặc SOLD_OUT)
          if (ticketStatus === 'ACTIVE') {
            // Mỗi ticket có totalQuantity và soldQuantity
            const totalQty = ticket.totalQuantity || 0;
            const soldQty = ticket.soldQuantity || 0;
            const availableQty = totalQty - soldQty;
            
            totalAvailableSeats += availableQty;
            
            // Lấy giá từ ticket đầu tiên có vé available
            if (availableQty > 0 && ticket.price && ticketPrice === schedule.basePrice) {
              ticketPrice = ticket.price;
            }
          }
        });
        
        return {
          ...schedule,
          availableSeats: totalAvailableSeats,
          basePrice: ticketPrice, // Override với giá từ ticket
          ticketPrice: ticketPrice // Thêm field riêng cho giá ticket
        };
      });
      
      // Filter chỉ lấy schedules còn vé
      return schedulesWithTicketInfo.filter(schedule => schedule.availableSeats > 0);
    } catch (error) {
      console.error('Error fetching available schedules:', error);
      // Trả về mảng rỗng thay vì throw error để UI không bị crash
      return [];
    }
  }
};
