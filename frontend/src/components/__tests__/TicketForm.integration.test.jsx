/**
 * Integration Tests for Ticket-Schedule Reference Refactoring
 * 
 * Tests the complete ticket creation and update flow with schedule selection,
 * including error scenarios and snapshot data consistency.
 * 
 * Requirements: All (End-to-end testing)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketForm from '../TicketForm';
import { useScheduleStore } from '@/stores/useScheduleStore';
import { scheduleAPI } from '@/services/scheduleServiceAPI';

// Mock the schedule API
vi.mock('@/services/scheduleServiceAPI', () => ({
  scheduleAPI: {
    getSchedules: vi.fn(),
  },
}));

// Mock the schedule store
vi.mock('@/stores/useScheduleStore', () => ({
  useScheduleStore: vi.fn(),
}));

describe('TicketForm Integration Tests - Ticket-Schedule Reference', () => {
  let mockSchedules;
  let mockOnSubmit;
  let mockOnCancel;
  let mockGetActiveSchedules;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup mock schedules
    mockSchedules = [
      {
        id: 1,
        trainNumberSnapshot: 'SE1',
        departureStationNameSnapshot: 'Hà Nội',
        arrivalStationNameSnapshot: 'Sài Gòn',
        departureTime: '2024-12-01T08:00:00',
        arrivalTime: '2024-12-01T20:00:00',
        status: 'scheduled',
      },
      {
        id: 2,
        trainNumberSnapshot: 'SE2',
        departureStationNameSnapshot: 'Đà Nẵng',
        arrivalStationNameSnapshot: 'Huế',
        departureTime: '2024-12-02T10:00:00',
        arrivalTime: '2024-12-02T12:00:00',
        status: 'scheduled',
      },
    ];

    // Setup mock functions
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    mockOnCancel = vi.fn();
    mockGetActiveSchedules = vi.fn().mockResolvedValue(mockSchedules);

    // Setup schedule store mock
    useScheduleStore.mockReturnValue({
      schedules: mockSchedules,
      loading: false,
      error: null,
      getActiveSchedules: mockGetActiveSchedules,
    });
  });

  describe('Complete Ticket Creation Flow with Schedule Selection', () => {
    test('should load schedules on mount and display them in dropdown', async () => {
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify getActiveSchedules was called
      expect(mockGetActiveSchedules).toHaveBeenCalledTimes(1);

      // Verify schedules are displayed in dropdown
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      expect(scheduleSelect).toBeInTheDocument();

      // Check that schedules are in the dropdown
      const options = within(scheduleSelect).getAllByRole('option');
      // Should have placeholder + 2 schedules
      expect(options).toHaveLength(3);
      expect(options[1]).toHaveTextContent('SE1');
      expect(options[1]).toHaveTextContent('Hà Nội → Sài Gòn');
    });

    test('should auto-populate schedule details when schedule is selected', async () => {
      const user = userEvent.setup();
      
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Select a schedule
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      // Verify schedule details are displayed
      await waitFor(() => {
        expect(screen.getByText(/thông tin lịch trình/i)).toBeInTheDocument();
        expect(screen.getByText('SE1')).toBeInTheDocument();
        // Use getAllByText since the route appears in both dropdown and details
        expect(screen.getAllByText(/Hà Nội → Sài Gòn/i).length).toBeGreaterThan(0);
      });
    });

    test('should submit ticket with scheduleRefId and ticket-specific data', async () => {
      const user = userEvent.setup();
      
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Fill in the form
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.type(nameInput, 'Vé Hà Nội - Sài Gòn');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.type(priceInput, '500000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.type(quantityInput, '100');

      const descriptionInput = screen.getByLabelText(/mô tả/i);
      await user.type(descriptionInput, 'Vé tàu cao tốc');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Verify onSubmit was called with correct data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Vé Hà Nội - Sài Gòn',
          scheduleRefId: 1,
          price: 500000,
          totalQuantity: 100,
          description: 'Vé tàu cao tốc',
          status: 'active',
        });
      });
    });

    test('should validate required fields before submission', async () => {
      const user = userEvent.setup();
      
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Verify validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/tên vé là bắt buộc/i)).toBeInTheDocument();
        // Note: Yup validation messages for number fields show type errors when empty
        expect(screen.getAllByText(/must be a `number` type/i).length).toBeGreaterThan(0);
      });

      // Verify onSubmit was not called
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Ticket Update Flow with Immutable Schedule Reference', () => {
    test('should display schedule information as read-only in edit mode', async () => {
      const initialData = {
        id: 1,
        name: 'Existing Ticket',
        scheduleRefId: 1,
        trainNumberSnapshot: 'SE1',
        routeSnapshot: 'Hà Nội → Sài Gòn',
        departureTimeSnapshot: '2024-12-01T08:00:00',
        price: 500000,
        totalQuantity: 100,
        description: 'Test ticket',
      };

      render(
        <TicketForm 
          initialData={initialData}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify schedule information is displayed as read-only
      expect(screen.getByText(/không thể thay đổi/i)).toBeInTheDocument();
      expect(screen.getByText('SE1')).toBeInTheDocument();
      expect(screen.getByText(/Hà Nội → Sài Gòn/i)).toBeInTheDocument();

      // Verify schedule dropdown is not present (it's a hidden input in edit mode)
      const scheduleSelect = screen.queryByRole('combobox', { name: /lịch trình/i });
      expect(scheduleSelect).not.toBeInTheDocument();
    });

    test('should allow modification of mutable fields only', async () => {
      const user = userEvent.setup();
      
      const initialData = {
        id: 1,
        name: 'Existing Ticket',
        scheduleRefId: 1,
        trainNumberSnapshot: 'SE1',
        routeSnapshot: 'Hà Nội → Sài Gòn',
        departureTimeSnapshot: '2024-12-01T08:00:00',
        price: 500000,
        totalQuantity: 100,
        description: 'Test ticket',
      };

      render(
        <TicketForm 
          initialData={initialData}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Modify mutable fields
      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Ticket Name');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.clear(priceInput);
      await user.type(priceInput, '600000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.clear(quantityInput);
      await user.type(quantityInput, '150');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /cập nhật vé/i });
      await user.click(submitButton);

      // Verify onSubmit was called with updated data
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Ticket Name',
            scheduleRefId: 1, // Should remain unchanged
            price: 600000,
            totalQuantity: 150,
          })
        );
      });
    });

    test('should not call getActiveSchedules in edit mode', async () => {
      const initialData = {
        id: 1,
        name: 'Existing Ticket',
        scheduleRefId: 1,
        trainNumberSnapshot: 'SE1',
        routeSnapshot: 'Hà Nội → Sài Gòn',
        departureTimeSnapshot: '2024-12-01T08:00:00',
        price: 500000,
        totalQuantity: 100,
        description: 'Test ticket',
      };

      render(
        <TicketForm 
          initialData={initialData}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify getActiveSchedules was not called in edit mode
      expect(mockGetActiveSchedules).not.toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    test('should display error message when schedule loading fails', async () => {
      // Mock error state
      useScheduleStore.mockReturnValue({
        schedules: [],
        loading: false,
        error: 'Failed to load schedules',
        getActiveSchedules: mockGetActiveSchedules,
      });

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify error message is displayed
      expect(screen.getByText(/lỗi khi tải dữ liệu lịch trình/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to load schedules/i)).toBeInTheDocument();

      // Verify retry button is present
      const retryButton = screen.getByRole('button', { name: /thử lại/i });
      expect(retryButton).toBeInTheDocument();
    });

    test('should retry loading schedules when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock error state
      useScheduleStore.mockReturnValue({
        schedules: [],
        loading: false,
        error: 'Failed to load schedules',
        getActiveSchedules: mockGetActiveSchedules,
      });

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /thử lại/i });
      await user.click(retryButton);

      // Verify getActiveSchedules was called again (initial call + retry = 2 times)
      expect(mockGetActiveSchedules).toHaveBeenCalledTimes(2);
    });

    test('should display loading indicator while fetching schedules', async () => {
      // Mock loading state
      useScheduleStore.mockReturnValue({
        schedules: [],
        loading: true,
        error: null,
        getActiveSchedules: mockGetActiveSchedules,
      });

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify loading indicator is displayed
      expect(screen.getByText(/đang tải danh sách lịch trình/i)).toBeInTheDocument();
    });

    test('should display message when no schedules are available', async () => {
      // Mock empty schedules
      useScheduleStore.mockReturnValue({
        schedules: [],
        loading: false,
        error: null,
        getActiveSchedules: mockGetActiveSchedules,
      });

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify empty state message is displayed
      expect(screen.getByText(/không có lịch trình khả dụng/i)).toBeInTheDocument();
    });

    test('should handle backend validation error for invalid schedule', async () => {
      const user = userEvent.setup();
      
      // Mock onSubmit to reject with schedule not found error
      const mockError = {
        response: {
          data: {
            message: 'Schedule not found with ID: 999',
          },
        },
      };
      mockOnSubmit.mockRejectedValue(mockError);

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Fill in the form with valid data
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.type(nameInput, 'Test Ticket');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.type(priceInput, '500000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.type(quantityInput, '100');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/lỗi xác thực/i)).toBeInTheDocument();
        expect(screen.getByText(/lịch trình không tồn tại/i)).toBeInTheDocument();
      });
    });

    test('should handle backend validation error for cancelled schedule', async () => {
      const user = userEvent.setup();
      
      // Mock onSubmit to reject with cancelled schedule error
      const mockError = {
        response: {
          data: {
            message: 'Cannot create ticket for cancelled schedule',
          },
        },
      };
      mockOnSubmit.mockRejectedValue(mockError);

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Fill in the form
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.type(nameInput, 'Test Ticket');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.type(priceInput, '500000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.type(quantityInput, '100');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/không thể tạo vé cho lịch trình đã hủy/i)).toBeInTheDocument();
      });
    });

    test('should handle backend validation error for departed schedule', async () => {
      const user = userEvent.setup();
      
      // Mock onSubmit to reject with departed schedule error
      const mockError = {
        response: {
          data: {
            message: 'Cannot create ticket for departed schedule',
          },
        },
      };
      mockOnSubmit.mockRejectedValue(mockError);

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Fill in the form
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.type(nameInput, 'Test Ticket');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.type(priceInput, '500000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.type(quantityInput, '100');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/không thể tạo vé cho lịch trình đã khởi hành/i)).toBeInTheDocument();
      });
    });

    test('should clear backend errors when form values change', async () => {
      const user = userEvent.setup();
      
      // Mock onSubmit to reject with error
      const mockError = {
        response: {
          data: {
            message: 'Schedule not found',
          },
        },
      };
      mockOnSubmit.mockRejectedValueOnce(mockError).mockResolvedValue(undefined);

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Fill in the form and submit to trigger error
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.type(nameInput, 'Test');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.type(priceInput, '500000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.type(quantityInput, '100');

      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/lỗi xác thực/i)).toBeInTheDocument();
      });

      // Change a form value
      await user.type(nameInput, ' Updated');

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/lỗi xác thực/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Snapshot Data Consistency', () => {
    test('should display correct schedule format in dropdown', async () => {
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      const options = within(scheduleSelect).getAllByRole('option');

      // Verify format: "Train Number: Departure → Arrival (Time)"
      expect(options[1]).toHaveTextContent('SE1: Hà Nội → Sài Gòn');
      expect(options[2]).toHaveTextContent('SE2: Đà Nẵng → Huế');
    });

    test('should display all schedule details when selected', async () => {
      const user = userEvent.setup();
      
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Select a schedule
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      // Verify all details are displayed
      await waitFor(() => {
        expect(screen.getByText('SE1')).toBeInTheDocument();
        // Use getAllByText since the route appears in both dropdown and details
        expect(screen.getAllByText(/Hà Nội → Sài Gòn/i).length).toBeGreaterThan(0);
        // Check for formatted dates (Vietnamese format: 1/12/2024) - appears multiple times
        expect(screen.getAllByText(/1\/12\/2024/).length).toBeGreaterThan(0);
      });
    });

    test('should preserve snapshot data in edit mode', async () => {
      const initialData = {
        id: 1,
        name: 'Existing Ticket',
        scheduleRefId: 1,
        trainNumberSnapshot: 'SE1',
        routeSnapshot: 'Hà Nội → Sài Gòn',
        departureTimeSnapshot: '2024-12-01T08:00:00',
        price: 500000,
        totalQuantity: 100,
        description: 'Test ticket',
      };

      render(
        <TicketForm 
          initialData={initialData}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify snapshot data is displayed correctly
      expect(screen.getByText('SE1')).toBeInTheDocument();
      expect(screen.getByText(/Hà Nội → Sài Gòn/i)).toBeInTheDocument();
      
      // Verify departure time is formatted (Vietnamese format: 1/12/2024)
      const departureTimeText = screen.getByText(/1\/12\/2024/);
      expect(departureTimeText).toBeInTheDocument();
    });

    test('should handle missing snapshot data gracefully', async () => {
      const initialData = {
        id: 1,
        name: 'Existing Ticket',
        scheduleRefId: 1,
        trainNumberSnapshot: null,
        routeSnapshot: null,
        departureTimeSnapshot: null,
        price: 500000,
        totalQuantity: 100,
        description: 'Test ticket',
      };

      render(
        <TicketForm 
          initialData={initialData}
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Verify N/A is displayed for missing data
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThan(0);
    });
  });

  describe('Form Behavior', () => {
    test('should disable schedule selector when loading', async () => {
      // Mock loading state
      useScheduleStore.mockReturnValue({
        schedules: [],
        loading: true,
        error: null,
        getActiveSchedules: mockGetActiveSchedules,
      });

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      expect(scheduleSelect).toBeDisabled();
    });

    test('should disable schedule selector when error occurs', async () => {
      // Mock error state
      useScheduleStore.mockReturnValue({
        schedules: [],
        loading: false,
        error: 'Failed to load',
        getActiveSchedules: mockGetActiveSchedules,
      });

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      expect(scheduleSelect).toBeDisabled();
    });

    test('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      const cancelButton = screen.getByRole('button', { name: /hủy/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    test('should disable submit button while submitting', async () => {
      const user = userEvent.setup();
      
      // Mock slow submission
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(
        <TicketForm 
          onSubmit={mockOnSubmit} 
          onCancel={mockOnCancel} 
        />
      );

      // Fill in required fields
      const scheduleSelect = screen.getByLabelText(/lịch trình/i);
      await user.selectOptions(scheduleSelect, '1');

      const nameInput = screen.getByLabelText(/tên vé/i);
      await user.type(nameInput, 'Test');

      const priceInput = screen.getByLabelText(/giá vé/i);
      await user.type(priceInput, '500000');

      const quantityInput = screen.getByLabelText(/số lượng vé/i);
      await user.type(quantityInput, '100');

      // Submit the form
      const submitButton = screen.getByRole('button', { name: /tạo vé/i });
      await user.click(submitButton);

      // Verify button shows loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /đang lưu/i })).toBeDisabled();
      });
    });
  });
});
