# Implementation Plan

- [x] 1. Backend: Create ScheduleClient for inter-service communication

  - Create ScheduleClient component to fetch schedule data from Schedule Service API
  - Implement getScheduleById() method with HTTP GET request
  - Add error handling for schedule not found and service unavailable
  - Add configuration for schedule service URL
  - _Requirements: 3.1, 3.2, 3.3_

- [ ]* 1.1 Write property test for ScheduleClient
  - **Property 7: Service communication on ticket creation**
  - **Validates: Requirements 3.1**

- [x] 2. Backend: Update TicketRequest DTO



  - Add scheduleRefId field with validation
  - Remove obsolete fields: trainNumber, fromStation, toStation, date
  - Add validation annotations (@NotNull for scheduleRefId)
  - Update field constraints (price, totalQuantity)
  - _Requirements: 1.3, 8.1, 8.2, 8.3, 8.4_

- [ ]* 2.1 Write unit tests for TicketRequest validation
  - Test scheduleRefId required validation
  - Test price and quantity constraints
  - _Requirements: 1.3, 6.1_

- [x] 3. Backend: Create ScheduleResponse DTO in tickets-service





  - Create DTO to receive schedule data from Schedule Service API
  - Include fields: id, trainNumberSnapshot, departureStationNameSnapshot, arrivalStationNameSnapshot, departureTime, arrivalTime, status
  - _Requirements: 3.1, 3.4_

- [x] 4. Backend: Enhance TicketService with schedule validation and snapshot population





  - Inject ScheduleClient dependency
  - Implement validateAndPopulateScheduleData() method
  - Implement populateSnapshotData() method
  - Update create() method to fetch schedule from API and populate snapshots
  - Add validation for schedule status (must be "scheduled")
  - _Requirements: 1.4, 1.5, 3.1, 3.4, 6.2, 6.3, 6.4_

- [ ]* 4.1 Write property test for snapshot data persistence
  - **Property 4: Snapshot data persistence**
  - **Validates: Requirements 1.5, 3.4**

- [ ]* 4.2 Write property test for schedule validation
  - **Property 3: Schedule validation on ticket creation**
  - **Validates: Requirements 1.4**

- [x] 5. Backend: Update TicketResponse DTO





  - Ensure includes scheduleRefId field
  - Ensure includes all snapshot fields (trainNumberSnapshot, routeSnapshot, departureTimeSnapshot)
  - Add availableQuantity calculated field
  - _Requirements: 3.5, 7.1, 7.2, 7.3_

- [ ]* 5.1 Write property test for response structure
  - **Property 8: Response includes reference and snapshot data**
  - **Validates: Requirements 3.5**
-

- [x] 6. Backend: Update ticket update logic to preserve immutable fields




  - Ensure scheduleRefId cannot be modified in update
  - Ensure snapshot fields are not modified in update
  - Validate price and totalQuantity constraints
  - _Requirements: 4.2, 4.4, 4.5_

- [ ]* 6.1 Write property test for schedule reference immutability
  - **Property 10: Schedule reference immutability**
  - **Validates: Requirements 4.2**

- [ ]* 6.2 Write property test for snapshot data immutability
  - **Property 11: Snapshot data immutability**
  - **Validates: Requirements 4.4**

- [ ]* 6.3 Write property test for update validation
  - **Property 12: Update validation constraints**
  - **Validates: Requirements 4.5**

- [x] 7. Backend: Add RestTemplate configuration





  - Create RestTemplateConfig class with RestTemplate bean
  - Add schedule.service.url to application.properties
  - _Requirements: 3.1_

- [x] 8. Checkpoint - Backend tests passing





  - Ensure all tests pass, ask the user if questions arise.
-

- [x] 9. Frontend: Add getActiveSchedules method to ScheduleStore




  - Implement method to fetch schedules with status "scheduled"
  - Filter out cancelled, departed, or delayed schedules
  - _Requirements: 1.1, 5.2, 5.3_

- [ ]* 9.1 Write property test for schedule store API invocation
  - **Property 13: Schedule store API invocation**
  - **Validates: Requirements 5.2**

- [ ]* 9.2 Write property test for schedule data storage
  - **Property 14: Schedule data storage**
  - **Validates: Requirements 5.3**

- [x] 10. Frontend: Refactor TicketForm component





  - Remove fields: trainNumber, fromStation, toStation, date
  - Add scheduleRefId dropdown selector
  - Fetch schedules on component mount using ScheduleStore
  - Display schedules in format "Train Number: Departure → Arrival (Time)"
  - _Requirements: 1.1, 2.1, 8.1_

- [ ]* 10.1 Write property test for schedule display format
  - **Property 5: Schedule display format**
  - **Validates: Requirements 2.1**
-

- [x] 11. Frontend: Implement schedule selection and auto-population




  - Add onChange handler for schedule selector
  - Auto-populate form preview with selected schedule details
  - Display train number, route, departure time, arrival time
  - _Requirements: 1.2, 2.2_

- [ ]* 11.1 Write property test for schedule selection
  - **Property 1: Schedule selection populates snapshot fields**
  - **Validates: Requirements 1.2**

- [ ]* 11.2 Write property test for schedule details display
  - **Property 6: Schedule details display**
  - **Validates: Requirements 2.2**

- [x] 12. Frontend: Update form validation schema




  - Remove validation for trainNumber, fromStation, toStation, date
  - Add scheduleRefId validation (required)
  - Keep validation for name, price, totalQuantity, description
  - _Requirements: 6.1, 8.2, 8.3_

- [ ]* 12.1 Write unit test for form validation
  - Test scheduleRefId required validation
  - Test validation error display
  - _Requirements: 6.1_

- [x] 13. Frontend: Update form submission payload





  - Transform form data to include scheduleRefId
  - Remove obsolete fields from payload
  - Ensure payload matches new TicketRequest structure
  - _Requirements: 1.3_

- [ ]* 13.1 Write property test for payload structure
  - **Property 2: Ticket creation payload includes schedule reference**
  - **Validates: Requirements 1.3**

- [x] 14. Frontend: Add error handling for schedule loading





  - Display loading indicator while fetching schedules
  - Display error message with retry button on failure
  - Display "no schedules available" message when list is empty
  - _Requirements: 2.3, 2.4, 2.5_

- [ ]* 14.1 Write unit tests for error states
  - Test loading state display
  - Test error state display with retry
  - Test empty state display
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 15. Frontend: Update TicketForm for edit mode




  - Display schedule information as read-only in edit mode
  - Prevent modification of scheduleRefId
  - Allow modification of name, price, totalQuantity, description
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 15.1 Write property test for mutable fields
  - **Property 9: Mutable fields in ticket update**
  - **Validates: Requirements 4.1**

- [ ]* 15.2 Write property test for read-only schedule display
  - **Property 3: Schedule details display in edit mode**
  - **Validates: Requirements 4.3**

- [x] 16. Frontend: Update TicketList component to display snapshot data





  - Display routeSnapshot for each ticket
  - Display departureTimeSnapshot formatted as readable date/time
  - Display trainNumberSnapshot
  - Handle missing snapshot data with "N/A"
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ]* 16.1 Write property tests for ticket list display
  - **Property 16: Ticket list displays route snapshot**
  - **Property 17: Ticket list displays formatted departure time**
  - **Property 18: Ticket list displays train number**
  - **Validates: Requirements 7.1, 7.2, 7.3**
-

- [x] 17. Frontend: Update ticket details view




  - Display full ticket details including all snapshot data
  - Display scheduleRefId
  - Format data for readability
  - _Requirements: 7.4_

- [ ]* 17.1 Write property test for ticket details display
  - **Property 19: Ticket details display**
  - **Validates: Requirements 7.4**

- [x] 18. Frontend: Add validation error display





  - Display backend validation errors in form
  - Show user-friendly error messages
  - Highlight invalid fields
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ]* 18.1 Write property test for error display
  - **Property 15: Validation error display**
  - **Validates: Requirements 6.5**

- [x] 19. Checkpoint - All tests passing





  - Ensure all tests pass, ask the user if questions arise.
-

- [x] 20. Integration: End-to-end testing




  - Test complete ticket creation flow with schedule selection
  - Test ticket update flow with immutable schedule reference
  - Test error scenarios (invalid schedule, service unavailable)
  - Verify snapshot data consistency
  - _Requirements: All_

- [ ]* 20.1 Write integration tests
  - Test ticket creation with schedule API call
  - Test error handling for service failures
  - Test ticket update preserves schedule data
  - _Requirements: All_
