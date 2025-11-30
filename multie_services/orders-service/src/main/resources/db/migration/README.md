# Database Migration Scripts

This directory contains SQL migration scripts for the Orders Service database.

## Migration Files

### V1__add_booking_fields.sql
Adds three new fields to the `orders` table to support booking management:
- `passenger_details` (TEXT): Stores JSON array of passenger information
- `confirmation_code` (VARCHAR(50), UNIQUE): Unique confirmation code for confirmed orders
- `confirmed_at` (DATETIME): Timestamp when order was confirmed

Also creates an index on `confirmation_code` for faster lookups.

### V1__add_booking_fields_rollback.sql
Rollback script to remove the booking management fields if needed.

## How to Apply Migrations

### Option 1: Automatic (Hibernate)
The application is configured with `spring.jpa.hibernate.ddl-auto=update`, so Hibernate will automatically create the new columns when the application starts.

### Option 2: Manual (Recommended for Production)
Execute the migration script manually:

```bash
mysql -u root -p orders-service < src/main/resources/db/migration/V1__add_booking_fields.sql
```

### Option 3: Using Flyway (Future Enhancement)
To use Flyway for automated migrations:

1. Add Flyway dependency to `pom.xml`:
```xml
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>
```

2. Update `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```

3. Restart the application - Flyway will automatically apply migrations.

## Rollback

To rollback the migration:

```bash
mysql -u root -p orders-service < src/main/resources/db/migration/V1__add_booking_fields_rollback.sql
```

## Requirements Validated

This migration supports the following requirements:
- 1.4: Store passenger details for each ticket in the booking
- 5.3: Generate a booking confirmation code
- 5.4: Record the confirmation timestamp
- 6.1-6.4: Support snapshot data storage (already exists in schedule_info_snapshot)
