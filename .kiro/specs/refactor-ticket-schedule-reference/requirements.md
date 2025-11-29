# Requirements Document

## Introduction

This specification defines the refactoring of the Ticket management system to properly reference Schedule entities instead of collecting individual departure/arrival station information. Currently, the Ticket entity in the backend has a `scheduleRefId` field with snapshot data, but the frontend form still collects individual fields (train number, departure station, arrival station, date). This refactoring will align the frontend with the backend architecture, ensuring tickets are created by selecting from existing schedules, which improves data consistency and reduces redundancy.

## Glossary

- **Ticket**: A purchasable item representing travel authorization on a specific train schedule
- **Schedule**: An entity defining a train's journey from a departure station to an arrival station at specific times
- **Snapshot Data**: Read-only copies of referenced entity data stored for historical accuracy
- **TicketForm**: The React component used to create and edit tickets in the frontend
- **ScheduleStore**: The Zustand state management store for schedule data
- **TicketService**: The backend service handling ticket business logic
- **ScheduleService**: The backend service handling schedule business logic

## Requirements

### Requirement 1

**User Story:** As a ticket administrator, I want to create tickets by selecting from existing schedules, so that ticket data is consistent with actual train schedules.

#### Acceptance Criteria

1. WHEN the TicketForm component loads THEN the system SHALL fetch and display all available schedules with status "scheduled"
2. WHEN a user selects a schedule THEN the system SHALL automatically populate snapshot fields (train number, route, departure time) from the selected schedule
3. WHEN a user submits the ticket form THEN the system SHALL send the scheduleRefId along with ticket-specific data (name, price, quantity, description)
4. WHEN the backend receives a ticket creation request THEN the system SHALL validate that the referenced schedule exists and has status "scheduled"
5. WHEN creating a ticket THEN the system SHALL store snapshot data from the schedule for historical accuracy

### Requirement 2

**User Story:** As a ticket administrator, I want to see schedule information clearly when creating tickets, so that I can make informed decisions about ticket pricing and availability.

#### Acceptance Criteria

1. WHEN viewing the schedule dropdown THEN the system SHALL display schedule information in the format "Train Number: Departure Station → Arrival Station (Departure Time)"
2. WHEN a schedule is selected THEN the system SHALL display the full schedule details including train number, route, departure time, and arrival time
3. WHEN no schedules are available THEN the system SHALL display a message indicating no schedules exist and provide a link to create schedules
4. WHEN schedules are loading THEN the system SHALL display a loading indicator
5. WHEN schedule loading fails THEN the system SHALL display an error message with a retry option

### Requirement 3

**User Story:** As a system architect, I want the ticket service to communicate with the schedule service, so that ticket data remains synchronized with schedule data.

#### Acceptance Criteria

1. WHEN creating a ticket THEN the TicketService SHALL query the ScheduleService to retrieve schedule details
2. WHEN the schedule service is unavailable THEN the system SHALL return an appropriate error message to the user
3. WHEN a schedule is not found THEN the system SHALL return a 404 error with a descriptive message
4. WHEN snapshot data is stored THEN the system SHALL include trainNumberSnapshot, routeSnapshot, and departureTimeSnapshot fields
5. WHEN retrieving ticket data THEN the system SHALL return both the scheduleRefId and snapshot data

### Requirement 4

**User Story:** As a ticket administrator, I want to update ticket pricing and availability without changing schedule references, so that I can manage ticket inventory independently.

#### Acceptance Criteria

1. WHEN editing a ticket THEN the system SHALL allow modification of name, price, totalQuantity, and description fields
2. WHEN editing a ticket THEN the system SHALL prevent modification of the scheduleRefId field
3. WHEN editing a ticket THEN the system SHALL display the current schedule information as read-only
4. WHEN updating a ticket THEN the system SHALL preserve the original snapshot data
5. WHEN a ticket is updated THEN the system SHALL validate that price is positive and totalQuantity is greater than soldQuantity

### Requirement 5

**User Story:** As a developer, I want the frontend to use a ScheduleStore for state management, so that schedule data is efficiently cached and shared across components.

#### Acceptance Criteria

1. WHEN the application initializes THEN the system SHALL create a ScheduleStore using Zustand
2. WHEN the ScheduleStore fetches schedules THEN the system SHALL call the schedule service API endpoint
3. WHEN schedule data is received THEN the system SHALL store it in the ScheduleStore state
4. WHEN multiple components need schedule data THEN the system SHALL reuse cached data from the ScheduleStore
5. WHEN schedule data becomes stale THEN the system SHALL provide a method to refresh the data

### Requirement 6

**User Story:** As a ticket administrator, I want validation to prevent creating tickets for invalid schedules, so that data integrity is maintained.

#### Acceptance Criteria

1. WHEN submitting a ticket form without selecting a schedule THEN the system SHALL display a validation error "Schedule is required"
2. WHEN the backend receives a scheduleRefId that does not exist THEN the system SHALL return a 400 error with message "Schedule not found"
3. WHEN the backend receives a scheduleRefId for a cancelled schedule THEN the system SHALL return a 400 error with message "Cannot create ticket for cancelled schedule"
4. WHEN the backend receives a scheduleRefId for a departed schedule THEN the system SHALL return a 400 error with message "Cannot create ticket for departed schedule"
5. WHEN validation fails THEN the system SHALL display the error message to the user in the form

### Requirement 7

**User Story:** As a system maintainer, I want the ticket list to display schedule information, so that administrators can quickly identify which schedule each ticket belongs to.

#### Acceptance Criteria

1. WHEN displaying the ticket list THEN the system SHALL show the routeSnapshot field for each ticket
2. WHEN displaying the ticket list THEN the system SHALL show the departureTimeSnapshot field formatted as a readable date and time
3. WHEN displaying the ticket list THEN the system SHALL show the trainNumberSnapshot field
4. WHEN a user clicks on a ticket THEN the system SHALL display full ticket details including all snapshot data
5. WHEN snapshot data is missing THEN the system SHALL display "N/A" for the missing fields

### Requirement 8

**User Story:** As a developer, I want to remove obsolete fields from the ticket creation flow, so that the codebase remains clean and maintainable.

#### Acceptance Criteria

1. WHEN refactoring is complete THEN the system SHALL remove trainNumber, fromStation, toStation, and date fields from the TicketForm component
2. WHEN refactoring is complete THEN the system SHALL remove validation rules for the removed fields
3. WHEN refactoring is complete THEN the system SHALL update the ticket schema to include scheduleRefId validation
4. WHEN refactoring is complete THEN the system SHALL remove any backend code that processes individual station fields for ticket creation
5. WHEN refactoring is complete THEN the system SHALL update API documentation to reflect the new ticket creation payload structure
