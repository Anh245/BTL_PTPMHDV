# Implementation Plan

- [x] 1. Refactor TicketForm to use Zustand stores
  - Replace local useState with useTrainStore and useStationStore hooks
  - Update useEffect to call store actions instead of direct API calls
  - Update component to read data from store state
  - Implement combined loading and error states
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x]* 1.1 Write property test for store data consistency
  - **Property 1: Store data consistency**
  - **Validates: Requirements 1.3, 1.4, 3.1, 3.2**
  - Generate random train and station data
  - Set store state and verify component displays exact data from stores
  - Run 100 iterations

- [ ]* 1.2 Write property test for store reactivity
  - **Property 2: Store reactivity**
  - **Validates: Requirements 3.3**
  - Render component with initial data
  - Update store state and verify component reflects changes
  - Run 100 iterations

- [ ]* 1.3 Write unit tests for component lifecycle
  - Test fetchTrains() and fetchStations() are called on mount
  - Test loading state displays correctly
  - Test error state displays correctly
  - Test retry functionality
  - _Requirements: 1.1, 1.2, 1.5, 4.1, 4.2, 4.4_

- [x] 2. Add error handling UI
  - Display combined error message from both stores
  - Add retry button when errors occur
  - Implement handleRetry function
  - _Requirements: 4.1, 4.2, 4.4_

- [ ]* 2.1 Write unit tests for error handling
  - Test error message displays when store has error
  - Test retry button appears on error
  - Test retry button calls fetchTrains/fetchStations
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3. Verify form functionality preservation
  - Test form submission with valid data
  - Test form validation with invalid data
  - Test onSubmit callback is invoked correctly
  - Test onCancel callback is invoked correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ]* 3.1 Write property test for form validation preservation
  - **Property 3: Form validation preservation**
  - **Validates: Requirements 5.1**
  - Generate random invalid form inputs
  - Submit form and verify validation errors
  - Run 100 iterations

- [x]* 3.2 Write unit tests for form callbacks
  - Test onSubmit is called with transformed data
  - Test onCancel is called when cancel button clicked
  - Test form submission with initialData (edit mode)
  - Test form submission without initialData (create mode)
  - _Requirements: 5.2, 5.3, 5.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
