# Design Document

## Overview

This design document outlines the refactoring of the TicketForm component to integrate with existing Zustand stores (useTrainStore and useStationStore) instead of managing local state and making direct API calls. This refactoring will improve code consistency, reduce duplication, and provide better state management across the application.

## Architecture

### Current Architecture
```
TicketForm Component
├── Local State (useState)
│   ├── trains: []
│   ├── stations: []
│   └── loading: true
├── Direct API Calls
│   ├── trainAPI.getTrains()
│   └── stationAPI.getStations()
└── useForm (react-hook-form)
```

### Target Architecture
```
TicketForm Component
├── Zustand Stores
│   ├── useTrainStore
│   │   ├── trains (state)
│   │   ├── loading (state)
│   │   ├── error (state)
│   │   └── fetchTrains() (action)
│   └── useStationStore
│       ├── stations (state)
│       ├── loading (state)
│       ├── error (state)
│       └── fetchStations() (action)
└── useForm (react-hook-form)
```

## Components and Interfaces

### TicketForm Component

**Props:**
- `initialData?: object` - Initial form data for editing
- `onSubmit: (data) => void` - Callback when form is submitted
- `onCancel?: () => void` - Optional callback for cancel action

**Zustand Store Integration:**

```javascript
// Import stores
import { useTrainStore } from '@/stores/useTrainStore';
import { useStationStore } from '@/stores/useStationStore';

// Inside component
const { trains, loading: trainsLoading, error: trainsError, fetchTrains } = useTrainStore();
const { stations, loading: stationsLoading, error: stationsError, fetchStations } = useStationStore();
```

**Computed Values:**
```javascript
// Combined loading state
const loading = trainsLoading || stationsLoading;

// Combined error state
const error = trainsError || stationsError;

// Filtered active trains
const activeTrains = trains.filter(t => t.status === 'active');

// Filtered active stations
const activeStations = stations.filter(s => s.isActive);
```

## Data Models

### Train Model (from useTrainStore)
```typescript
interface Train {
  id: number;
  trainNumber: string;
  name: string;
  status: 'active' | 'inactive' | 'maintenance';
  type?: string;
  capacity?: number;
}
```

### Station Model (from useStationStore)
```typescript
interface Station {
  id: number;
  name: string;
  code: string;
  city?: string;
  isActive: boolean;
}
```

### Ticket Form Data
```typescript
interface TicketFormData {
  name: string;
  trainNumber: string;
  fromStation: string;
  toStation: string;
  price: number;
  date: string;
  description?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework:

1.1 WHEN TicketForm component mounts THEN the system SHALL fetch trains data using useTrainStore.fetchTrains()
  Thoughts: This is about component lifecycle behavior. We can test that when the component mounts, the fetchTrains function is called. This is testable through mocking and verifying function calls.
  Testable: yes - example

1.2 WHEN TicketForm component mounts THEN the system SHALL fetch stations data using useStationStore.fetchStations()
  Thoughts: Similar to 1.1, this is about component lifecycle. We can verify the fetchStations function is called on mount.
  Testable: yes - example

1.3 WHEN TicketForm accesses trains data THEN the system SHALL retrieve it from useTrainStore.trains state
  Thoughts: This is about data source verification. We can test that the component reads from the store state rather than local state.
  Testable: yes - example

1.4 WHEN TicketForm accesses stations data THEN the system SHALL retrieve it from useStationStore.stations state
  Thoughts: Similar to 1.3, verifying data source.
  Testable: yes - example

1.5 WHEN TicketForm displays loading state THEN the system SHALL use the loading state from Zustand stores
  Thoughts: This verifies that loading indicators come from store state.
  Testable: yes - example

2.1 WHEN TicketForm is refactored THEN the system SHALL remove local useState for trains array
  Thoughts: This is a code structure requirement, not a runtime behavior. We verify by code inspection.
  Testable: no

2.2 WHEN TicketForm is refactored THEN the system SHALL remove local useState for stations array
  Thoughts: Code structure requirement.
  Testable: no

2.3 WHEN TicketForm is refactored THEN the system SHALL remove local useState for loading state
  Thoughts: Code structure requirement.
  Testable: no

2.4 WHEN TicketForm is refactored THEN the system SHALL remove direct API calls to trainAPI.getTrains()
  Thoughts: Code structure requirement.
  Testable: no

2.5 WHEN TicketForm is refactored THEN the system SHALL remove direct API calls to stationAPI.getStations()
  Thoughts: Code structure requirement.
  Testable: no

3.1 WHEN trains are loaded in other components THEN TicketForm SHALL display the same trains from the shared store
  Thoughts: This is about data consistency across components. We can test by loading data in one component and verifying another component sees the same data.
  Testable: yes - property

3.2 WHEN stations are loaded in other components THEN TicketForm SHALL display the same stations from the shared store
  Thoughts: Similar to 3.1, testing shared state consistency.
  Testable: yes - property

3.3 WHEN data is updated in the store THEN TicketForm SHALL automatically reflect those changes
  Thoughts: This tests reactivity - when store state changes, component re-renders with new data.
  Testable: yes - property

3.4 WHEN TicketForm is unmounted and remounted THEN the system SHALL reuse cached data from stores if available
  Thoughts: This tests that stores persist data across component lifecycles.
  Testable: yes - example

4.1 WHEN train data fetching fails THEN the system SHALL display the error from useTrainStore.error
  Thoughts: This is testing error handling for a specific scenario.
  Testable: yes - example

4.2 WHEN station data fetching fails THEN the system SHALL display the error from useStationStore.error
  Thoughts: Similar error handling test.
  Testable: yes - example

4.3 WHEN errors occur THEN the system SHALL provide user-friendly error messages
  Thoughts: This is about UI/UX quality, which is subjective.
  Testable: no

4.4 WHEN form is in error state THEN the system SHALL allow users to retry the operation
  Thoughts: This tests that retry functionality exists when errors occur.
  Testable: yes - example

5.1 WHEN TicketForm is refactored THEN the system SHALL maintain all form validation rules
  Thoughts: This is about ensuring existing validation (yup schema) still works. We can test by submitting invalid data.
  Testable: yes - property

5.2 WHEN TicketForm is refactored THEN the system SHALL maintain the ability to create new tickets
  Thoughts: Testing that form submission for new tickets still works.
  Testable: yes - example

5.3 WHEN TicketForm is refactored THEN the system SHALL maintain the ability to edit existing tickets
  Thoughts: Testing that form submission for editing tickets still works.
  Testable: yes - example

5.4 WHEN TicketForm is refactored THEN the system SHALL maintain all UI elements and styling
  Thoughts: This is about visual appearance, which is subjective and hard to test programmatically.
  Testable: no

5.5 WHEN TicketForm is refactored THEN the system SHALL maintain the onSubmit and onCancel callback functionality
  Thoughts: Testing that callbacks are still invoked correctly.
  Testable: yes - example

### Property Reflection:

After reviewing the testable properties, I identify the following:

**Redundancies to address:**
- Properties 1.3 and 1.4 are essentially the same pattern (reading from store state) - can be combined
- Properties 3.1 and 3.2 are the same pattern (shared state consistency) - can be combined
- Properties 4.1 and 4.2 are the same pattern (error display) - can be combined

**Consolidated properties:**
- Combine 1.3 and 1.4 into "Component reads data from stores"
- Combine 3.1 and 3.2 into "Shared state consistency"
- Combine 4.1 and 4.2 into "Error state display"

### Correctness Properties:

Property 1: Store data consistency
*For any* component instance, when accessing trains or stations data, the data should come from the respective Zustand store state, not local component state
**Validates: Requirements 1.3, 1.4, 3.1, 3.2**

Property 2: Store reactivity
*For any* data update in useTrainStore or useStationStore, all components using that store should automatically reflect the updated data
**Validates: Requirements 3.3**

Property 3: Form validation preservation
*For any* form input that was invalid before refactoring, it should remain invalid after refactoring with the same validation message
**Validates: Requirements 5.1**

## Error Handling

### Error Display Strategy

1. **Store-level errors**: Display errors from `useTrainStore.error` and `useStationStore.error`
2. **Combined error state**: Show a single error message if either store has an error
3. **Error UI**: Display error message above the form with retry option
4. **Graceful degradation**: If data fails to load, show empty dropdowns with error message

### Error Recovery

```javascript
const handleRetry = () => {
  if (trainsError) {
    fetchTrains();
  }
  if (stationsError) {
    fetchStations();
  }
};
```

## Testing Strategy

### Unit Testing

**Test cases for TicketForm:**
1. Component mounts and calls fetchTrains() and fetchStations()
2. Component displays loading state when stores are loading
3. Component displays trains from useTrainStore.trains
4. Component displays stations from useStationStore.stations
5. Component displays error message when store has error
6. Component allows retry when error occurs
7. Form validation still works (invalid inputs show errors)
8. onSubmit callback is called with correct data
9. onCancel callback is called when cancel button clicked

**Mocking strategy:**
- Mock useTrainStore and useStationStore using Zustand's testing utilities
- Mock initial store states (empty, loading, with data, with error)
- Verify component behavior for each state

### Property-Based Testing

We will use **@testing-library/react** and **vitest** for testing React components with Zustand stores.

**Property tests:**

1. **Store data consistency property** (Property 1)
   - Generate random train and station data
   - Set store state with this data
   - Render TicketForm
   - Verify component displays exactly the data from stores
   - Run 100 iterations with different random data

2. **Store reactivity property** (Property 2)
   - Render TicketForm with initial store data
   - Update store state with new data
   - Verify component re-renders and displays new data
   - Test with various data mutations
   - Run 100 iterations

3. **Form validation preservation property** (Property 3)
   - Generate random invalid form inputs (empty required fields, negative prices, same from/to stations)
   - Submit form
   - Verify same validation errors appear as before refactoring
   - Run 100 iterations with different invalid inputs

**Configuration:**
- Each property test should run minimum 100 iterations
- Use `faker` or similar library for generating random test data
- Tag each test with: `**Feature: refactor-ticket-form-zustand, Property {number}: {property_text}**`

## Implementation Notes

### Key Changes

1. **Remove local state:**
   ```javascript
   // REMOVE these lines
   const [trains, setTrains] = useState([]);
   const [stations, setStations] = useState([]);
   const [loading, setLoading] = useState(true);
   ```

2. **Add store hooks:**
   ```javascript
   // ADD these lines
   const { trains, loading: trainsLoading, fetchTrains } = useTrainStore();
   const { stations, loading: stationsLoading, fetchStations } = useStationStore();
   const loading = trainsLoading || stationsLoading;
   ```

3. **Update useEffect:**
   ```javascript
   // CHANGE from direct API calls to store actions
   useEffect(() => {
     fetchTrains();
     fetchStations();
   }, [fetchTrains, fetchStations]);
   ```

4. **Filter data in render:**
   ```javascript
   // Filter active trains and stations
   const activeTrains = trains.filter(t => t.status === 'active');
   const activeStations = stations.filter(s => s.isActive);
   ```

### Backward Compatibility

- All props remain the same
- Form validation schema unchanged
- onSubmit and onCancel callbacks work identically
- UI/UX remains identical to users

### Performance Considerations

- Stores cache data, reducing unnecessary API calls
- Multiple TicketForm instances share the same data
- Data persists across component unmount/remount cycles
