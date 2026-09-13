# Database Design – SnapFlow

## Overview

Clean relational MySQL schema designed for a single photography company.  
Focus on clarity and viva-friendly relationships.

## Core Tables

### users
- Primary entity for all roles (Customer, Photographer, Staff, Director)
- Role stored as ENUM
- Password stored as BCrypt hash only

### packages / add_ons
- Catalog of photography packages and optional add-ons
- Soft delete via `is_active`

### bookings
- Central transaction table
- Links Customer + Package
- Contains event details, financial summary, and status

### photographer_assignments
- Links Booking ↔ Photographer
- Tracks attendance and progress status
- Unique constraint prevents duplicate assignment of same photographer to same booking

### change_requests
- Customer or staff initiated modifications
- Status: PENDING → APPROVED / REJECTED

### payments
- Manual payment recording + receipt verification
- Supports DEPOSIT, BALANCE, ADDITIONAL, REFUND

### galleries / photos
- **Composition**: Photos belong to a Gallery and are cascade-deleted
- One Gallery per Booking

### equipment / equipment_allocations
- **Aggregation**: Equipment exists independently
- Allocations link Equipment + Photographer + Booking

### notifications
- Simple user-targeted notifications

### activity_logs
- Audit trail of important actions

## Key Relationships

| Parent              | Child                    | Type         | Cardinality |
|---------------------|--------------------------|--------------|-------------|
| users (Customer)    | bookings                 | Association  | 1 : N       |
| packages            | bookings                 | Association  | 1 : N       |
| bookings            | photographer_assignments | Association  | 1 : N       |
| bookings            | change_requests          | Association  | 1 : N       |
| bookings            | payments                 | Association  | 1 : N       |
| bookings            | galleries                | Association  | 1 : 1       |
| galleries           | photos                   | Composition  | 1 : N       |
| users (Photographer)| equipment_allocations    | Aggregation  | 1 : N       |
| equipment           | equipment_allocations    | Aggregation  | 1 : N       |

## Indexes & Constraints

- Unique email on users
- Unique booking_ref
- Unique (booking_id, photographer_id) on assignments
- Foreign keys with appropriate ON DELETE behavior
- Status fields as ENUMs for data integrity

## Design Decisions (University Scope)

- Single `users` table + Role enum instead of table-per-role (avoids over-engineering)
- Local file paths for photos/receipts (no cloud storage required)
- No soft-delete on most transactional tables (simpler for demo)
- Financial calculations stored (deposit, balance, additional) for clear reporting
