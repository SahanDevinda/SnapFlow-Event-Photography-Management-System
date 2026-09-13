# SnapFlow API Documentation

Base URL: `http://localhost:8080/api`  
Auth: Bearer JWT token in `Authorization` header

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register new customer |
| POST | `/auth/login` | Public | Login, returns JWT |

**Register body:**
```json
{ "firstName": "Amaya", "lastName": "Rathnayake", "email": "amaya@email.com", "password": "Password1!", "phone": "0711111111" }
```

**Login body:**
```json
{ "email": "customer1@email.com", "password": "Password1!" }
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbG...",
    "type": "Bearer",
    "id": 8,
    "email": "customer1@email.com",
    "firstName": "Amaya",
    "lastName": "Rathnayake",
    "role": "CUSTOMER"
  }
}
```

---

## Packages

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/packages` | Public | — |
| GET | `/packages/{id}` | Public | — |
| GET | `/packages/all` | JWT | DIRECTOR, CRO |
| POST | `/packages` | JWT | DIRECTOR |
| PUT | `/packages/{id}` | JWT | DIRECTOR |
| DELETE | `/packages/{id}` | JWT | DIRECTOR |

---

## Bookings

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/bookings` | JWT | CUSTOMER, CRO, DIRECTOR |
| GET | `/bookings/my` | JWT | CUSTOMER |
| GET | `/bookings` | JWT | CRO, OPS, DIRECTOR, FINANCE |
| GET | `/bookings/{id}` | JWT | Authenticated |
| GET | `/bookings/status/{status}` | JWT | CRO, OPS, DIRECTOR |
| PATCH | `/bookings/{id}/status` | JWT | CRO, OPS, DIRECTOR |

**Create booking body:**
```json
{
  "packageId": 2,
  "eventDate": "2026-10-15",
  "eventTime": "09:00",
  "venue": "Galle Face Hotel",
  "eventType": "Wedding",
  "specialRequests": "Outdoor ceremony",
  "addOnIds": [1, 3]
}
```

---

## Assignments

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/assignments` | JWT | OPS, DIRECTOR |
| PUT | `/assignments/{id}/reassign` | JWT | OPS, DIRECTOR |
| PATCH | `/assignments/{id}/progress` | JWT | PHOTOGRAPHER, OPS, DIRECTOR |
| GET | `/assignments/my` | JWT | PHOTOGRAPHER |
| GET | `/assignments/booking/{id}` | JWT | OPS, DIRECTOR, CRO |
| GET | `/assignments/photographers` | JWT | OPS, DIRECTOR, CRO |

**Assign body:**
```json
{ "bookingId": 1, "photographerId": 5, "notes": "Lead photographer" }
```

Conflict detection returns **409 Conflict** if photographer is already booked on that date.

---

## Change Requests

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/change-requests` | JWT | CUSTOMER, CRO |
| PUT | `/change-requests/{id}/review` | JWT | CRO, OPS, DIRECTOR |
| GET | `/change-requests/pending` | JWT | CRO, OPS, DIRECTOR |
| GET | `/change-requests/my` | JWT | Authenticated |
| GET | `/change-requests/booking/{id}` | JWT | Authenticated |

**Review body:**
```json
{ "approved": true, "reviewNotes": "Approved – resources available" }
```

---

## Payments

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/payments` | JWT | CUSTOMER, FINANCE, CRO, DIRECTOR |
| PUT | `/payments/{id}/verify` | JWT | FINANCE, DIRECTOR |
| GET | `/payments/pending` | JWT | FINANCE, DIRECTOR |
| GET | `/payments/booking/{id}` | JWT | Authenticated |
| GET | `/payments` | JWT | FINANCE, DIRECTOR |

**Record payment:**
```json
{ "bookingId": 1, "amount": 50000, "paymentType": "DEPOSIT", "paymentMethod": "Bank Transfer" }
```

**Verify:**
```json
{ "approved": true, "notes": "Receipt verified" }
```

---

## Galleries

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| POST | `/galleries` | JWT | PHOTOGRAPHER, OPS, DIRECTOR |
| POST | `/galleries/{id}/photos` | JWT | PHOTOGRAPHER, OPS, DIRECTOR |
| PUT | `/galleries/{id}/publish` | JWT | PHOTOGRAPHER, OPS, DIRECTOR |
| GET | `/galleries/{id}` | JWT | Authenticated |
| GET | `/galleries/booking/{id}` | JWT | Authenticated |
| GET | `/galleries/access/{code}` | Public | — |

---

## Dashboard

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/dashboard/summary` | JWT | DIRECTOR, OPS, FINANCE |

---

## Users

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/users/me` | JWT | Authenticated |
| PUT | `/users/me` | JWT | Authenticated |
| GET | `/users` | JWT | DIRECTOR |
| GET | `/users/customers` | JWT | CRO, DIRECTOR |
| GET | `/users/photographers` | JWT | OPS, DIRECTOR, CRO |
| PATCH | `/users/{id}/toggle-active` | JWT | DIRECTOR |

---

## Notifications

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/notifications` | JWT |
| GET | `/notifications/unread` | JWT |
| GET | `/notifications/unread/count` | JWT |
| PATCH | `/notifications/{id}/read` | JWT |
| PATCH | `/notifications/read-all` | JWT |

---

## Equipment

| Method | Endpoint | Auth | Roles |
|--------|----------|------|-------|
| GET | `/equipment` | JWT | OPS, DIRECTOR |
| GET | `/equipment/available` | JWT | OPS, DIRECTOR |
| POST | `/equipment` | JWT | OPS, DIRECTOR |
| POST | `/equipment/allocate` | JWT | OPS, DIRECTOR |
| PUT | `/equipment/allocations/{id}/return` | JWT | OPS, DIRECTOR |

---

## Error Response Format

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Photographer is already assigned to another event on 2026-09-15",
  "timestamp": "2026-08-16T10:30:00"
}
```

Common status codes: `400` validation, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict, `500` server error.
