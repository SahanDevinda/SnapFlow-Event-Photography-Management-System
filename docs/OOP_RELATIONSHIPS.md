# SNAPFLOW - Object-Oriented Architecture & Relationships
**Course:** SE2030 Software Engineering  
**Company:** Lanka Moments (Pvt) Ltd.  

---

## 1. Core Object-Oriented Pillars in SnapFlow

### A. Encapsulation
- All entity attributes (`Booking`, `User`, `Payment`, `Gallery`) are protected with private fields and exposed strictly through getters, setters, and business mutator methods.
- Service interfaces (`BookingService`, `AuthService`, `PaymentService`) isolate internal database transaction mechanisms from external REST controllers.

### B. Inheritance & Polymorphism
- **Base Entity Hierarchy:** Entities inherit lifecycle auditing metadata (`createdAt`, `updatedAt`) via JPA `@MappedSuperclass` or entity lifecycle callbacks (`@PrePersist`, `@PreUpdate`).
- **DTO Inheritance / Abstraction:** Request and response DTOs inherit validation semantics and standard status responses (`ApiResponse<T>`).
- **Spring Security Authentication:** Custom `UserDetailsServiceImpl` implements Spring Security's `UserDetailsService` contract to provide polymorphism between domain `User` and security credentials.

### C. Association, Aggregation & Composition
1. **Composition (Strong Lifecycle Dependency):**
   - `Gallery` **1 ─── * `Photo`**: Photos cannot exist independently without a parent Gallery container. Deleting a Gallery cascades deletion to all associated Photo entities.
   - `Booking` **1 ─── * `BookingAddOn`**: The junction of selected add-ons is bound to the booking entity.
2. **Aggregation (Independent Existence):**
   - `Booking` **1 ─── 1 `Package`**: A Package exists independently in the studio catalog even if specific event Bookings are cancelled or completed.
   - `Assignment` **1 ─── 1 `Equipment`**: Equipment pieces belong to studio inventory and are allocated to events temporarily.
3. **Association (Collaborative Relationship):**
   - `User (Customer)` **1 ─── * `Booking`**: A client associates with multiple photography reservations over time.
   - `User (Photographer)` **1 ─── * `Assignment`**: Photographers collaborate on events as lead or secondary shooters.

---

## 2. Design Patterns Implemented

| Pattern | Architectural Role in SnapFlow |
| :--- | :--- |
| **Data Transfer Object (DTO)** | Complete separation between JPA database models and JSON REST API payloads, preventing over-posting vulnerabilities and lazy-loading serialization issues. |
| **Repository Pattern** | Spring Data JPA interfaces (`BookingRepository`, `UserRepository`) provide high-level data access abstraction without raw SQL leaks. |
| **Service Layer Pattern** | Encapsulates enterprise business rules, multi-entity transactions (`@Transactional`), and conflict prevention logic. |
| **Builder / Factory Pattern** | Used in DTO response mapping and Reference Generation (`SF-YYYY-XXXX`). |
| **Strategy Pattern** | Payment verification handling different strategies for bank deposit slip reviews vs automated gateway validations. |
| **Observer / Audit Trail** | `AuditService` logs every critical business transition across the lifecycle without coupling to controllers. |
