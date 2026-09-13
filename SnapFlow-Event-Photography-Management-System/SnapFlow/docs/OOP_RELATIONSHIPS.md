# OOP Relationships in SnapFlow

This project deliberately uses **exactly five** OOP relationship / concept types.  
These are meaningful, easy to explain in a viva, and appear clearly in the code.

---

## 1. Association

**Classes involved:** `Customer` (via User) ↔ `Booking`

**Why it is used:**  
A Customer can have many Bookings, and each Booking belongs to one Customer.  
Neither object “owns” the lifecycle of the other. A Booking can exist independently of a Customer being deleted in some business cases, but the relationship is strong bidirectional navigation.

**How it appears in code:**
```java
// In Booking entity
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "customer_id", nullable = false)
private User customer;

// In User entity (for customers)
@OneToMany(mappedBy = "customer")
private List<Booking> bookings;
```

**Simple viva explanation:**  
“Association means two independent classes are connected. A Customer places Bookings. We model this with `@ManyToOne` / `@OneToMany`.”

---

## 2. Aggregation

**Classes involved:** `Photographer` (User with PHOTOGRAPHER role) ↔ `Equipment`

**Why it is used:**  
Equipment can exist and be managed independently of any particular Photographer.  
A Photographer may be allocated Equipment for an event, but the Equipment continues to exist after the assignment ends. This is a “has-a” relationship with independent lifecycle.

**How it appears in code:**
```java
// EquipmentAllocation links Photographer and Equipment for an Event
// Equipment entity stands alone
@Entity
public class Equipment { ... }

// Allocation is a separate entity
@ManyToOne
private User photographer;

@ManyToOne
private Equipment equipment;
```

**Simple viva explanation:**  
“Aggregation is a weak has-a relationship. Photographer uses Equipment, but Equipment is not destroyed when the photographer is removed.”

---

## 3. Composition

**Classes involved:** `Gallery` ↔ `Photo`

**Why it is used:**  
A Photo cannot meaningfully exist without its Gallery.  
When a Gallery is deleted, all its Photos must be deleted. This is a strong whole-part relationship with dependent lifecycle.

**How it appears in code:**
```java
// In Gallery entity
@OneToMany(mappedBy = "gallery", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Photo> photos = new ArrayList<>();

// In Photo entity
@ManyToOne(optional = false)
@JoinColumn(name = "gallery_id")
private Gallery gallery;
```

**Simple viva explanation:**  
“Composition means the part cannot live without the whole. Photos are composed inside a Gallery. We use `cascade = ALL` and `orphanRemoval = true`.”

---

## 4. Inheritance

**Classes involved:** Base concept of `User` with role-based specialization

**Why it is used:**  
All system actors (Customer, Photographer, Staff roles) share common attributes (email, password, name, status).  
Instead of creating separate tables for every role (which would be over-engineering), we use a single `User` entity + `Role` enum.  
Behavior differs by role (polymorphic access control and dashboard content).

**How it appears in code:**
```java
public enum Role {
    CUSTOMER,
    CUSTOMER_RELATIONS_OFFICER,
    OPERATIONS_MANAGER,
    PHOTOGRAPHER,
    FINANCE_EXECUTIVE,
    COMPANY_DIRECTOR
}

@Entity
public class User {
    @Enumerated(EnumType.STRING)
    private Role role;
    // common fields...
}
```

**Simple viva explanation:**  
“We use inheritance conceptually: every actor is a User. Different roles inherit the base User attributes and add role-specific behavior through Spring Security and conditional UI. We avoided deep class hierarchies to keep the design clean for a university project.”

---

## 5. Dependency

**Classes involved:** Controllers → Services → Repositories

**Why it is used:**  
A Controller does not own a Service; it depends on the Service to perform business logic.  
A Service depends on a Repository to access data.  
This is a classic layered architecture dependency (uses-a relationship).

**How it appears in code:**
```java
@RestController
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;   // Dependency

    @PostMapping
    public ResponseEntity<?> create(@RequestBody BookingRequest req) {
        return ResponseEntity.ok(bookingService.createBooking(req));
    }
}

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository; // Dependency
    // business logic
}
```

**Simple viva explanation:**  
“Dependency means one class uses another class to do its work. Controllers depend on Services. Services depend on Repositories. We inject them with constructor injection (`@RequiredArgsConstructor`).”

---

## Summary Table

| # | Relationship   | Classes                          | Strength     | Lifecycle     |
|---|----------------|----------------------------------|--------------|---------------|
| 1 | Association    | Customer ↔ Booking               | Medium       | Independent   |
| 2 | Aggregation    | Photographer ↔ Equipment         | Weak         | Independent   |
| 3 | Composition    | Gallery → Photo                  | Strong       | Dependent     |
| 4 | Inheritance    | User (role specialization)       | Hierarchical | Shared base   |
| 5 | Dependency     | Controller → Service → Repo      | Temporary    | Uses          |

These five relationships are sufficient to demonstrate solid OOP understanding without over-engineering the domain model.
