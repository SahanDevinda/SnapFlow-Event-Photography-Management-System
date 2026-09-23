# SNAPFLOW - Database Design Specification
**Database Engine:** MySQL 8.0  
**Database Name:** `snapflow_db`  
**ORM:** Spring Data JPA / Hibernate  
**Migration Tool:** Flyway (`src/main/resources/db/migration/V1__schema.sql`)  

---

## Entity Relationship Overview
The system schema enforces 3rd Normal Form (3NF) relational design across 14 tables with explicit foreign key constraints, indexing on lookup columns (`booking_ref`, `access_code`, `email`), and financial decimal precision (`DECIMAL(12,2)`).

```
   +-------------------+          +---------------------+
   |      users        |<--------+|      bookings       |
   +-------------------+          +---------------------+
     |               ^              |        |        |
     | (photographer)|              |        |        |
     v               |              v        |        v
+--------------+     |       +-----------+   |   +-------------------+
| assignments  +-----+       | payments  |   |   |  change_requests  |
+--------------+             +-----------+   |   +-------------------+
                                             v
                                     +------------------+
                                     |    galleries     |
                                     +------------------+
                                              |
                                              v
                                     +------------------+
                                     |      photos      |
                                     +------------------+
```

---

## Data Dictionary

### 1. `users` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | User surrogate key |
| `email` | VARCHAR(120) | NOT NULL, UNIQUE, INDEX | Login email |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `full_name` | VARCHAR(120) | NOT NULL | Client or staff name |
| `phone` | VARCHAR(30) | NULL | Contact phone |
| `role` | VARCHAR(40) | NOT NULL | `CUSTOMER`, `CRO`, `OPS`, `PHOTO`, `FINANCE`, `DIRECTOR` |
| `active` | BOOLEAN | DEFAULT TRUE | Account state |
| `avatar_url` | VARCHAR(255) | NULL | Profile image link |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification |

### 2. `packages` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Package key |
| `name` | VARCHAR(120) | NOT NULL | Tier title (e.g., Royal Heritage Wedding) |
| `category` | VARCHAR(50) | NOT NULL | `WEDDING`, `BIRTHDAY`, `CORPORATE`, etc. |
| `price` | DECIMAL(12,2)| NOT NULL | Package base price in LKR |
| `hours_included`| INT | NOT NULL | Event coverage hours |
| `photographers_count` | INT | NOT NULL | Required photographers |
| `edited_photos_count` | INT | NOT NULL | Guaranteed edited photos |
| `features` | JSON | NULL | Feature bullet points list |
| `is_popular` | BOOLEAN | DEFAULT FALSE | Highlighted tier flag |
| `active` | BOOLEAN | DEFAULT TRUE | Availability state |

### 3. `bookings` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Booking key |
| `booking_ref` | VARCHAR(40) | NOT NULL, UNIQUE, INDEX | Unique business reference (e.g. `SF-2026-0001`) |
| `customer_id` | BIGINT | NOT NULL, FK(`users.id`) | Client reference |
| `package_id` | BIGINT | NOT NULL, FK(`packages.id`)| Photography tier reference |
| `event_date` | DATE | NOT NULL, INDEX | Event date |
| `start_time` | TIME | NOT NULL | Coverage start |
| `end_time` | TIME | NOT NULL | Coverage end |
| `venue` | VARCHAR(255) | NOT NULL | Location name and address |
| `event_type` | VARCHAR(60) | NOT NULL | Category of event |
| `guest_count` | INT | DEFAULT 100 | Expected attendance |
| `status` | VARCHAR(40) | NOT NULL, INDEX | `INQUIRY`, `PENDING_DEPOSIT`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `total_amount`| DECIMAL(12,2)| NOT NULL | Total cost including add-ons |
| `paid_amount` | DECIMAL(12,2)| DEFAULT 0.00 | Verified payments total |
| `balance_remaining` | DECIMAL(12,2)| NOT NULL | Unpaid balance |

### 4. `payments` Table
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Payment key |
| `booking_id` | BIGINT | NOT NULL, FK(`bookings.id`)| Booking reference |
| `receipt_number` | VARCHAR(40) | NOT NULL, UNIQUE | Official receipt number |
| `amount` | DECIMAL(12,2)| NOT NULL | Transaction value in LKR |
| `payment_type` | VARCHAR(40) | NOT NULL | `ADVANCE_DEPOSIT`, `FINAL_BALANCE`, `FULL_PAYMENT` |
| `payment_method` | VARCHAR(40) | NOT NULL | `BANK_TRANSFER`, `CREDIT_CARD`, `CASH` |
| `transaction_ref` | VARCHAR(100) | NULL | Bank reference ID |
| `receipt_url` | VARCHAR(255) | NULL | Scanned bank transfer slip image |
| `status` | VARCHAR(40) | NOT NULL | `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED` |
| `audit_notes` | TEXT | NULL | Financial auditor commentary |

### 5. `galleries` & `photos` Tables
Enables high-resolution client image hosting with proofing flags (`is_proof_selected`), watermark protection (`is_watermarked`), cover photo designation, and download tracking.
