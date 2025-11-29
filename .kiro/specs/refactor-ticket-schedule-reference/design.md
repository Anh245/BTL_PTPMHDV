# Design Document

## Overview

This design document outlines the refactoring of the Ticket management system to properly utilize Schedule references. The current implementation has a mismatch: the backend Ticket entity already has `scheduleRefId` and snapshot fields, but the frontend TicketForm collects individual fields (trainNumber, fromStation, toStation, date) that are then processed into the ticket. This refactoring will align the frontend with the backend architecture by having users select from existing schedules when creating tickets.

The refactoring involves:
1. Updating the TicketForm component to use a schedule selector instead of individual fields
2. Modifying the TicketRequest DTO to accept scheduleRefId
3. Implementing schedule validation and snapshot data population in the TicketService
4. Adding inter-service communication between TicketService and ScheduleService
5. Updating the ticket display to show schedule information from snapshots

## Architecture

### Current Architecture

```
Frontend (TicketForm)
  ├─ Collects: trainNumber, fromStation, toStation, date
  └─ Sends to: TicketService

TicketService
  ├─ Receives: individual fields
  ├─ Stores: scheduleRefId (unused), snapshot fields (empty)
  └─ No communication with ScheduleService
```

### Target Architecture

```
Frontend (TicketForm)
  ├─ Fetches: Available schedules from ScheduleStore
  ├─ User selects: Schedule from dropdown
  └─ Sends: scheduleRefId + ticket-specific data

TicketService
  ├─ Receives: scheduleRefId
  ├─ Validates: Schedule exists and is valid
  ├─ Fetches: Schedule details from ScheduleService (via RestTemplate/WebClient)
  ├─ Populates: Snapshot fields from schedule
  └─ Stores: Complete ticket with schedule reference
```

### Service Communication

The TicketService will communicate with the ScheduleService using Spring's RestTemplate to fetch schedule data via REST API:

```
TicketService → ScheduleClient → HTTP GET → ScheduleService API
  Request: GET http://localhost:8083/api/schedules/{id}
  Response: ScheduleResponse with full schedule details
  
Flow:
1. User creates ticket with scheduleRefId
2. TicketService calls ScheduleClient.getScheduleById(scheduleRefId)
3. ScheduleClient makes HTTP GET request to Schedule Service
4. Schedule Service returns schedule data (train, stations, times)
5. TicketService populates snapshot fields from API response
6. TicketService saves ticket with schedule reference and snapshots
```

**Why fetch from API:**
- Ensures data consistency - always get latest schedule information
- Validates schedule exists before creating ticket
- Validates schedule status (must be "scheduled")
- Decouples services - Ticket Service doesn't need direct database access to schedules
- Follows microservices best practices

## Components and Interfaces

### Frontend Components

#### 1. TicketForm Component (Refactored)

**Location:** `frontend/src/components/TicketForm.jsx`

**Props:**
- `initialData`: Ticket object for editing (optional)
- `onSubmit`: Callback function when form is submitted
- `onCancel`: Callback function when form is cancelled

**State Management:**
- Uses `useScheduleStore` for schedule data
- Uses `react-hook-form` for form validation

**Key Changes:**
- Remove fields: `trainNumber`, `fromStation`, `toStation`, `date`
- Add field: `scheduleRefId` (dropdown selector)
- Display schedule details when selected
- Auto-populate snapshot preview from selected schedule

**Form Schema:**
```javascript
{
  name: string (required),
  scheduleRefId: number (required),
  price: number (required, positive),
  totalQuantity: number (required, positive integer),
  description: string (optional),
  status: string (default: 'active')
}
```

#### 2. ScheduleStore (Already Exists)

**Location:** `frontend/src/stores/useScheduleStore.js`

**Additional Method Needed:**
```javascript
getActiveSchedules: async () => {
  // Fetch schedules with status 'scheduled'
  // Filter out cancelled, departed, or delayed schedules
}
```

### Backend Components

#### 1. TicketRequest DTO (Refactored)

**Location:** `multie_services/tickets-service/src/main/java/com/example/tickets_service/dto/TicketRequest.java`

**New Structure:**
```java
@Data
public class TicketRequest {
    @NotNull(message = "Schedule reference is required")
    private Long scheduleRefId;
    
    @NotBlank(message = "Ticket name is required")
    @Size(max = 100)
    private String name;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal price;
    
    @Size(max = 500)
    private String description;
    
    @NotNull(message = "Total quantity is required")
    @Min(value = 1)
    private Integer totalQuantity;
    
    private String status; // "active", "inactive", "sold_out"
}
```

**Removed Fields:**
- `trainNumber`
- `fromStation`
- `toStation`
- `date`
- `soldQuantity` (managed internally)

#### 2. ScheduleClient (New)

**Location:** `multie_services/tickets-service/src/main/java/com/example/tickets_service/client/ScheduleClient.java`

**Purpose:** Handle HTTP communication with ScheduleService to fetch schedule data via REST API

```java
@Component
public class ScheduleClient {
    private final RestTemplate restTemplate;
    
    @Value("${schedule.service.url}")
    private String scheduleServiceUrl;
    
    public ScheduleResponse getScheduleById(Long scheduleId) {
        try {
            String url = scheduleServiceUrl + "/" + scheduleId;
            ResponseEntity<ScheduleResponse> response = restTemplate.getForEntity(
                url, 
                ScheduleResponse.class
            );
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            throw new NotFoundException("Schedule not found with ID: " + scheduleId);
        } catch (RestClientException e) {
            throw new ServiceUnavailableException("Schedule service is unavailable");
        }
    }
    
    public boolean isScheduleValid(Long scheduleId) {
        ScheduleResponse schedule = getScheduleById(scheduleId);
        return schedule != null && "scheduled".equals(schedule.getStatus());
    }
}
```

**Key Points:**
- Makes HTTP GET request to Schedule Service API endpoint
- Fetches complete schedule data including train info, stations, and times
- Handles errors when schedule service is unavailable
- Validates schedule exists and has correct status

#### 3. TicketService (Enhanced)

**Location:** `multie_services/tickets-service/src/main/java/com/example/tickets_service/service/impl/TicketServiceImpl.java`

**Dependencies:**
```java
@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {
    private final TicketRepository ticketRepository;
    private final ScheduleClient scheduleClient; // NEW: For fetching schedule data
}
```

**New Methods:**
```java
private void validateAndPopulateScheduleData(Ticket ticket, Long scheduleRefId) {
    // 1. Fetch schedule from ScheduleService via HTTP API
    ScheduleResponse schedule = scheduleClient.getScheduleById(scheduleRefId);
    
    // 2. Validate schedule exists (handled by client)
    if (schedule == null) {
        throw new NotFoundException("Schedule not found");
    }
    
    // 3. Validate schedule status is 'scheduled'
    if (!"scheduled".equals(schedule.getStatus())) {
        throw new BadRequestException(
            "Cannot create ticket for " + schedule.getStatus() + " schedule"
        );
    }
    
    // 4. Populate snapshot fields from API response
    populateSnapshotData(ticket, schedule);
}

private void populateSnapshotData(Ticket ticket, ScheduleResponse schedule) {
    // Set snapshot data from schedule API response
    ticket.setTrainNumberSnapshot(schedule.getTrainNumberSnapshot());
    ticket.setRouteSnapshot(
        schedule.getDepartureStationNameSnapshot() + " → " + 
        schedule.getArrivalStationNameSnapshot()
    );
    ticket.setDepartureTimeSnapshot(schedule.getDepartureTime());
}
```

**Enhanced create() Method:**
```java
public TicketResponse create(TicketRequest request) {
    // 1. Create ticket entity from request
    Ticket ticket = new Ticket();
    ticket.setName(request.getName());
    ticket.setScheduleRefId(request.getScheduleRefId());
    ticket.setPrice(request.getPrice());
    ticket.setDescription(request.getDescription());
    ticket.setTotalQuantity(request.getTotalQuantity());
    
    // 2. Fetch schedule data from API and populate snapshot fields
    validateAndPopulateScheduleData(ticket, request.getScheduleRefId());
    
    // 3. Set default values
    ticket.setSoldQuantity(0);
    ticket.setCreatedAt(LocalDateTime.now());
    ticket.setStatus(Ticket.Status.active);
    
    // 4. Save ticket
    Ticket savedTicket = ticketRepository.save(ticket);
    
    // 5. Return response
    return mapToResponse(savedTicket);
}
```

**Key Points:**
- Uses ScheduleClient to fetch schedule data from Schedule Service API
- Validates schedule exists and has correct status before creating ticket
- Populates snapshot fields with data from API response
- Ensures data consistency between services

#### 4. TicketResponse DTO (Enhanced)

**Location:** `multie_services/tickets-service/src/main/java/com/example/tickets_service/dto/TicketResponse.java`

**Ensure includes:**
```java
@Data
public class TicketResponse {
    private Long id;
    private String name;
    private Long scheduleRefId;
    private String trainNumberSnapshot;
    private String routeSnapshot;
    private LocalDateTime departureTimeSnapshot;
    private BigDecimal price;
    private String description;
    private Integer totalQuantity;
    private Integer soldQuantity;
    private Integer availableQuantity; // calculated
    private String status;
    private LocalDateTime createdAt;
}
```

## Data Models

### Ticket Entity (Already Correct)

```java
@Entity
@Table(name = "tickets")
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    // Schedule reference
    @Column(name = "schedule_ref_id", nullable = false)
    private Long scheduleRefId;
    
    // Snapshot data
    @Column(name = "train_number_snapshot", nullable = false)
    private String trainNumberSnapshot;
    
    @Column(name = "route_snapshot", nullable = false)
    private String routeSnapshot;
    
    @Column(name = "departure_time_snapshot", nullable = false)
    private LocalDateTime departureTimeSnapshot;
    
    // Ticket-specific data
    private BigDecimal price;
    private String description;
    private Integer totalQuantity;
    private Integer soldQuantity;
    private Status status;
    private LocalDateTime createdAt;
}
```

### Schedule Entity (Reference)

```java
@Entity
@Table(name = "schedules")
public class Schedule {
    private Long id;
    private Long trainRefId;
    private String trainNumberSnapshot;
    private Long departureStationRefId;
    private String departureStationNameSnapshot;
    private Long arrivalStationRefId;
    private String arrivalStationNameSnapshot;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private Status status; // scheduled, departed, delayed, cancelled
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Schedule selection populates snapshot fields

*For any* schedule selected in the TicketForm, the form fields (train number, route, departure time) should be automatically populated with that schedule's corresponding data.

**Validates: Requirements 1.2**

### Property 2: Ticket creation payload includes schedule reference

*For any* valid ticket form submission, the payload sent to the backend should contain the scheduleRefId along with ticket-specific fields (name, price, totalQuantity, description).

**Validates: Requirements 1.3**

### Property 3: Schedule validation on ticket creation

*For any* ticket creation request with a scheduleRefId, the backend should validate that the referenced schedule exists and has status "scheduled" before creating the ticket.

**Validates: Requirements 1.4**

### Property 4: Snapshot data persistence

*For any* ticket created with a schedule reference, the stored snapshot fields (trainNumberSnapshot, routeSnapshot, departureTimeSnapshot) should match the schedule's data at the time of creation.

**Validates: Requirements 1.5, 3.4**

### Property 5: Schedule display format

*For any* schedule displayed in the dropdown, the format should be "Train Number: Departure Station → Arrival Station (Departure Time)".

**Validates: Requirements 2.1**

### Property 6: Schedule details display

*For any* selected schedule, the UI should display all required fields including train number, route, departure time, and arrival time.

**Validates: Requirements 2.2**

### Property 7: Service communication on ticket creation

*For any* ticket creation with a scheduleRefId, the TicketService should make an HTTP request to the ScheduleService to retrieve schedule details.

**Validates: Requirements 3.1**

### Property 8: Response includes reference and snapshot data

*For any* ticket retrieved from the backend, the response should contain both the scheduleRefId and all snapshot data fields.

**Validates: Requirements 3.5**

### Property 9: Mutable fields in ticket update

*For any* ticket update request, the system should allow modification of name, price, totalQuantity, and description fields only.

**Validates: Requirements 4.1**

### Property 10: Schedule reference immutability

*For any* ticket update request, the scheduleRefId field should remain unchanged from its original value.

**Validates: Requirements 4.2**

### Property 11: Snapshot data immutability

*For any* ticket update request, the snapshot fields (trainNumberSnapshot, routeSnapshot, departureTimeSnapshot) should remain unchanged from their original values.

**Validates: Requirements 4.4**

### Property 12: Update validation constraints

*For any* ticket update request, the system should validate that price is positive and totalQuantity is greater than or equal to soldQuantity.

**Validates: Requirements 4.5**

### Property 13: Schedule store API invocation

*For any* schedule fetch operation in the ScheduleStore, the system should call the schedule service API endpoint.

**Validates: Requirements 5.2**

### Property 14: Schedule data storage

*For any* schedule data received from the API, the ScheduleStore should store it in its state.

**Validates: Requirements 5.3**

### Property 15: Validation error display

*For any* validation error that occurs, the system should display the error message to the user in the form.

**Validates: Requirements 6.5**

### Property 16: Ticket list displays route snapshot

*For any* ticket in the ticket list, the UI should display the routeSnapshot field.

**Validates: Requirements 7.1**

### Property 17: Ticket list displays formatted departure time

*For any* ticket in the ticket list, the departureTimeSnapshot should be formatted as a readable date and time.

**Validates: Requirements 7.2**

### Property 18: Ticket list displays train number

*For any* ticket in the ticket list, the UI should display the trainNumberSnapshot field.

**Validates: Requirements 7.3**

### Property 19: Ticket details display

*For any* ticket clicked in the list, the system should display full ticket details including all snapshot data fields.

**Validates: Requirements 7.4**

## Error Handling

### Frontend Error Handling

1. **Schedule Loading Errors**
   - Display error message with retry button
   - Log error to console for debugging
   - Disable form submission until schedules are loaded

2. **Form Validation Errors**
   - Display inline validation messages
   - Highlight invalid fields
   - Prevent form submission until all errors are resolved

3. **API Request Errors**
   - Display user-friendly error messages
   - Provide retry mechanism
   - Log detailed error information for debugging

### Backend Error Handling

1. **Schedule Not Found (404)**
   ```java
   throw new NotFoundException("Schedule with ID " + scheduleRefId + " not found");
   ```

2. **Invalid Schedule Status (400)**
   ```java
   if (!schedule.getStatus().equals(Status.scheduled)) {
       throw new BadRequestException("Cannot create ticket for " + 
           schedule.getStatus() + " schedule");
   }
   ```

3. **Schedule Service Unavailable (503)**
   ```java
   catch (RestClientException e) {
       throw new ServiceUnavailableException("Schedule service is currently unavailable");
   }
   ```

4. **Validation Errors (400)**
   - Use Bean Validation annotations
   - Return structured error responses with field-level details

### Error Response Format

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Schedule with ID 123 not found",
  "path": "/api/tickets/create"
}
```

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
1. TicketForm component rendering with schedule data
2. Schedule selection and form field population
3. Form validation logic
4. Error state handling
5. Schedule dropdown formatting

**Backend Unit Tests:**
1. TicketRequest validation
2. Snapshot data population logic
3. Schedule status validation
4. Error handling for invalid schedule references
5. TicketResponse mapping

### Property-Based Testing

We will use **fast-check** for JavaScript/React property-based testing and **jqwik** for Java property-based testing. Each property-based test should run a minimum of 100 iterations.

**Frontend Property Tests:**

1. **Property 1: Schedule selection populates snapshot fields**
   - Generate random schedules
   - Simulate selection
   - Verify form fields match schedule data
   - **Feature: refactor-ticket-schedule-reference, Property 1: Schedule selection populates snapshot fields**

2. **Property 2: Ticket creation payload includes schedule reference**
   - Generate random valid form data
   - Submit form
   - Verify payload structure
   - **Feature: refactor-ticket-schedule-reference, Property 2: Ticket creation payload includes schedule reference**

3. **Property 5: Schedule display format**
   - Generate random schedules
   - Verify display string format
   - **Feature: refactor-ticket-schedule-reference, Property 5: Schedule display format**

**Backend Property Tests:**

1. **Property 3: Schedule validation on ticket creation**
   - Generate random scheduleRefIds (valid and invalid)
   - Attempt ticket creation
   - Verify validation behavior
   - **Feature: refactor-ticket-schedule-reference, Property 3: Schedule validation on ticket creation**

2. **Property 4: Snapshot data persistence**
   - Generate random schedules and ticket data
   - Create tickets
   - Verify snapshot fields match schedule data
   - **Feature: refactor-ticket-schedule-reference, Property 4: Snapshot data persistence**

3. **Property 10: Schedule reference immutability**
   - Generate random tickets and update requests
   - Attempt to update scheduleRefId
   - Verify scheduleRefId remains unchanged
   - **Feature: refactor-ticket-schedule-reference, Property 10: Schedule reference immutability**

4. **Property 11: Snapshot data immutability**
   - Generate random tickets and update requests
   - Update ticket
   - Verify snapshot fields remain unchanged
   - **Feature: refactor-ticket-schedule-reference, Property 11: Snapshot data immutability**

5. **Property 12: Update validation constraints**
   - Generate random ticket updates with various price and quantity values
   - Verify validation rules are enforced
   - **Feature: refactor-ticket-schedule-reference, Property 12: Update validation constraints**

### Integration Testing

1. **End-to-End Ticket Creation Flow**
   - Load TicketForm
   - Fetch schedules
   - Select schedule
   - Submit form
   - Verify ticket created with correct data

2. **Service Communication**
   - Mock ScheduleService responses
   - Test TicketService calls to ScheduleService
   - Verify error handling for service failures

3. **Ticket Update Flow**
   - Load existing ticket
   - Modify allowed fields
   - Submit update
   - Verify changes persisted correctly

### Edge Cases

1. Empty schedule list (no schedules available)
2. Schedule service unavailable
3. Schedule not found (invalid scheduleRefId)
4. Cancelled or departed schedule selected
5. Missing snapshot data in ticket response
6. Network timeout during schedule fetch
7. Concurrent ticket creation for same schedule

## Implementation Notes

### Configuration

**ScheduleService URL Configuration:**

Add to `application.properties`:
```properties
schedule.service.url=http://localhost:8083/api/schedules
```

### RestTemplate Bean

Create RestTemplate configuration:
```java
@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

### Frontend Environment Variables

Ensure API base URL is configured in `.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### Migration Considerations

1. **Backward Compatibility:** Existing tickets may have empty snapshot fields. Handle gracefully in UI.
2. **Data Migration:** Consider running a script to populate snapshot data for existing tickets if needed.
3. **API Versioning:** If external clients depend on old API structure, consider versioning the API.

### Performance Considerations

1. **Caching:** Cache schedule data in frontend to reduce API calls
2. **Lazy Loading:** Load schedules only when TicketForm is opened
3. **Pagination:** If schedule list is large, implement pagination or search
4. **Connection Pooling:** Use connection pooling for inter-service HTTP calls

## Dependencies

### Frontend Dependencies (Already Installed)
- React Hook Form
- Yup (validation)
- Zustand (state management)
- Axios (HTTP client)

### Backend Dependencies (Already Installed)
- Spring Boot Web
- Spring Boot Validation
- Lombok
- JPA/Hibernate

### New Backend Dependencies
None required - RestTemplate is part of Spring Web

## Rollout Plan

1. **Phase 1:** Backend refactoring
   - Update TicketRequest DTO
   - Implement ScheduleClient
   - Update TicketService with validation and snapshot logic
   - Add unit and property tests

2. **Phase 2:** Frontend refactoring
   - Update TicketForm component
   - Add schedule selector
   - Remove obsolete fields
   - Add frontend tests

3. **Phase 3:** Integration and testing
   - End-to-end testing
   - Error scenario testing
   - Performance testing

4. **Phase 4:** Deployment
   - Deploy backend changes
   - Deploy frontend changes
   - Monitor for errors
   - Gather user feedback
