# SnapFlow – Web-based Event Photography Management System

**For:** Lanka Moments (Pvt) Ltd.  
**Course:** SE2030 – Software Engineering  
**Group:** 2026-Y2-S1-MLB-WEB2G1-03

## Project Description

SnapFlow is a web-based Event Photography Management System that centralizes bookings, photographer scheduling, customer change requests, payments (manual verification), photo galleries, and executive reporting for a single photography company.

The system replaces manual processes (phone calls, spreadsheets, social media) with a role-based digital platform.

## Features

### Six Major Functions
1. **Booking & Customer Management** – Browse packages, create bookings, track status, customer profiles
2. **Event Scheduling & Resource Allocation** – Master calendar, photographer assignment, conflict detection, equipment allocation
3. **Customer Request & Change Management** – Package upgrades, date/venue changes, special requests, approve/reject
4. **Photography Workflow Management** – Assignments, attendance confirmation, progress updates, completion
5. **Photo Delivery & Gallery Management** – Secure private galleries, photo upload, customer access
6. **Photography Package Management** – CRUD packages, features, pricing, add-ons

### Supporting Features
- Role-based authentication & authorization (JWT)
- Notification system
- Payment recording & receipt verification (no real payment gateway)
- Executive dashboard with statistics
- Search, filter, activity logging
- Responsive professional UI

## Technology Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JWT, Lombok, Maven |
| Database   | MySQL 8                             |
| Frontend   | React 18, Vite, React Router, Axios, Tailwind CSS, Recharts |
| Auth       | JWT (stateless)                     |

## System Architecture

```
Frontend (React + Vite)
        ↕ REST/JSON
Backend (Spring Boot Monolithic REST API)
        ↕ JPA
MySQL Database
```

Clean layered architecture:
Controller → Service → Repository → Database

## Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8
- Maven 3.8+

### 1. Database Setup
```bash
mysql -u root -p < database/snapflow.sql
```
Or run the SQL scripts in order:
```bash
mysql -u root -p < backend/src/main/resources/schema.sql
mysql -u root -p < backend/src/main/resources/data.sql
```

Update `backend/src/main/resources/application.properties` with your MySQL credentials.

### 2. Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
Backend runs at: http://localhost:8080

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## Demo Accounts

| Role                        | Email                        | Password    |
|-----------------------------|------------------------------|-------------|
| Company Director / Admin    | director@lankamoments.lk     | Password1!  |
| Operations Manager          | ops@lankamoments.lk          | Password1!  |
| Customer Relations Officer  | cro@lankamoments.lk          | Password1!  |
| Finance Executive           | finance@lankamoments.lk      | Password1!  |
| Photographer                | photo1@lankamoments.lk       | Password1!  |
| Photographer                | photo2@lankamoments.lk       | Password1!  |
| Customer                    | customer1@email.com          | Password1!  |
| Customer                    | customer2@email.com          | Password1!  |

## OOP Relationships (Exactly 5)

See `docs/OOP_RELATIONSHIPS.md` for full viva-ready explanations.

1. **Association** – Customer ↔ Booking
2. **Aggregation** – Photographer ↔ Equipment
3. **Composition** – Gallery ↔ Photo
4. **Inheritance** – User (base) with role specialization via Role enum + polymorphic behavior
5. **Dependency** – Controllers depend on Services; Services depend on Repositories

## Project Structure

```
SnapFlow/
├── backend/                 # Spring Boot application
├── frontend/                # React + Vite application
├── database/                # Combined SQL script
├── docs/                    # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_DESIGN.md
│   ├── OOP_RELATIONSHIPS.md
│   ├── REQUIREMENT_TRACEABILITY.md
│   └── SETUP_GUIDE.md
└── README.md
```

## Important Scope Limitations (from Project Documents)

- No real payment gateway integration (manual receipt upload + verification only)
- No external accounting / social media integrations
- Supports a single photography company
- File storage is local/simple (suitable for university demonstration)

## Authors

| IT Number   | Name                     |
|-------------|--------------------------|
| IT25101674  | Devinda W.A.S            |
| IT25101653  | Chirantha P.A.A.         |
| IT25101665  | Batugedara B.A.N.B.M.    |
| IT25101616  | Dewdunnu B.H.T.          |
| IT25101635  | Rathnayaka R.M.N.P.      |
| IT25101612  | Afrith M.R.M             |

## License

University project – for educational purposes only.
