# SNAPFLOW - Web-based Event Photography Management System
**Client:** Lanka Moments (Pvt) Ltd.  
**Course:** SE2030 Software Engineering  
**Package:** `com.snapflow`  

---

## Executive Summary
SnapFlow is an enterprise-grade web application tailored for Lanka Moments (Pvt) Ltd., a premier Sri Lankan event photography studio. The system centralizes customer event bookings, real-time photographer availability checking, crew and equipment resource scheduling, bank transfer payment verifications, high-resolution client galleries with proof selection, and executive business analytics.

---

## Architecture & Technology Stack
- **Backend:** Java 17, Spring Boot 3.2.5, Spring Data JPA, Spring Security (Stateless JWT JJWT 0.12.5), Hibernate, Flyway Migration, Maven Wrapper.
- **Frontend:** React 18, Vite 5, Tailwind CSS, React Router v6, Lucide Icons, Axios.
- **Database:** MySQL 8.0 with InnoDB engine and 3NF normalized schema (14 tables).
- **Security:** BCrypt password encryption, stateless JWT filter, strict role authorization (`CUSTOMER`, `CUSTOMER_RELATIONS_OFFICER`, `OPERATIONS_MANAGER`, `PHOTOGRAPHER`, `FINANCE_EXECUTIVE`, `COMPANY_DIRECTOR`).
- **Navigation Invariant:** Strict separation between public marketing views (`PublicLayout`) and authenticated management views (`DashboardLayout`).

---

## Quick Start Guide

### 1. Database Setup
1. Ensure MySQL 8 is running locally on port 3306.
2. Create database: `CREATE DATABASE snapflow_db;`
3. Check credentials in `backend/src/main/resources/application.properties` (default: root / `Ruwandika@123456`).

### 2. Backend Execution
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
Backend starts on `http://localhost:8080`. Flyway automatically runs database migrations on initial startup.

To execute backend automated tests:
```powershell
cd backend
.\mvnw.cmd test
```

### 3. Frontend Execution
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Frontend runs on `http://localhost:5173`.

To execute frontend tests:
```powershell
cd frontend
npm.cmd test
```

To build production bundle:
```powershell
cd frontend
npm.cmd run build
```

---

## Default Seeded Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Company Director** | `director@lankamoments.lk` | `Admin@1234` |
| **Operations Manager** | `operations@lankamoments.lk`| `Ops@1234` |
| **Customer Relations** | `cro@lankamoments.lk` | `Cro@1234` |
| **Finance Executive** | `finance@lankamoments.lk` | `Finance@1234` |
| **Lead Photographer** | `photographer@lankamoments.lk` | `Photo@1234` |
| **Client / Customer** | `customer@example.com` | `Customer@1234` |

---

## Detailed Documentation Directory
- [API Documentation](docs/API_DOCUMENTATION.md)
- [Database Schema & Data Dictionary](docs/DATABASE_DESIGN.md)
- [Object-Oriented Design & Patterns](docs/OOP_RELATIONSHIPS.md)
- [Requirement Traceability Matrix](docs/REQUIREMENT_TRACEABILITY.md)
- [Testing & Verification Guide](docs/TESTING_GUIDE.md)
- [Entity-Relationship Diagram](docs/SnapFlow_ERD.mmd)
