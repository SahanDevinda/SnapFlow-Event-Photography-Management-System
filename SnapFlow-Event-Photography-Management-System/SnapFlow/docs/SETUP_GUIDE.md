# SnapFlow Setup Guide

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MySQL 8

## 1. Database

```bash
# Login to MySQL
mysql -u root -p

# Run the schema + sample data
source /path/to/SnapFlow/database/snapflow.sql
```

Or:
```bash
mysql -u root -p < database/snapflow.sql
```

Update credentials in:
`backend/src/main/resources/application.properties`

```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

## 2. Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend starts at: **http://localhost:8080**

## 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at: **http://localhost:5173**

The Vite dev server proxies `/api` requests to `http://localhost:8080`.

## 4. Demo Accounts

All passwords: **Password1!**

| Role | Email |
|------|-------|
| Company Director | director@lankamoments.lk |
| Operations Manager | ops@lankamoments.lk |
| Customer Relations Officer | cro@lankamoments.lk |
| Finance Executive | finance@lankamoments.lk |
| Photographer | photo1@lankamoments.lk |
| Photographer | photo2@lankamoments.lk |
| Customer | customer1@email.com |
| Customer | customer2@email.com |

## 5. Quick Test Flow

1. Login as `customer1@email.com`
2. Browse packages → Create a booking
3. Login as `ops@lankamoments.lk`
4. Assign a photographer (conflict detection works)
5. Login as `photo1@lankamoments.lk`
6. Update assignment progress
7. Login as `finance@lankamoments.lk`
8. Verify pending payments
9. Login as `director@lankamoments.lk`
10. View executive dashboard

## Troubleshooting

**Backend won't start**
- Check MySQL is running
- Verify credentials in `application.properties`
- Ensure port 8080 is free

**Frontend API errors**
- Ensure backend is running on 8080
- Check browser console / Network tab
- Clear localStorage if stuck on old token: `localStorage.clear()`

**JWT / 401 errors**
- Token expires after 24 hours
- Re-login

**Maven compile issues**
```bash
export JAVA_HOME=/path/to/java-17
mvn clean compile
```
