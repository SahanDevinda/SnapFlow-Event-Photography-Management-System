# SNAPFLOW - REST API Specification
**Company:** Lanka Moments (Pvt) Ltd.  
**Course:** SE2030 Software Engineering  
**Base URL:** `http://localhost:8080/api`  
**Authentication:** Bearer JWT Token in `Authorization: Bearer <token>` header  

---

## 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new customer client profile |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT token + role metadata |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user's profile and active session |

---

## 2. User & Profile Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users` | COMPANY_DIRECTOR | List all system user accounts |
| `GET` | `/api/users/photographers` | OPERATIONS_MANAGER, COMPANY_DIRECTOR | List all active photographers |
| `GET` | `/api/users/customers` | CRO, COMPANY_DIRECTOR | List all registered clients |
| `POST` | `/api/users/staff` | COMPANY_DIRECTOR | Create internal staff user account |
| `PUT` | `/api/users/profile` | Authenticated | Update full name, phone number, and avatar |
| `POST` | `/api/users/change-password` | Authenticated | Change account password |
| `PATCH` | `/api/users/{id}/status` | COMPANY_DIRECTOR | Activate or deactivate account access |

---

## 3. Package & Add-On Management (`/api/packages`, `/api/addons`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/packages` | Authenticated | Retrieve all packages (including draft/inactive) |
| `GET` | `/api/packages/active` | Public | Retrieve active packages for catalogue and booking |
| `GET` | `/api/packages/{id}` | Public | Retrieve package detail with feature inclusions |
| `POST` | `/api/packages` | COMPANY_DIRECTOR | Create new photography tier package |
| `PUT` | `/api/packages/{id}` | COMPANY_DIRECTOR | Update photography package |
| `DELETE` | `/api/packages/{id}` | COMPANY_DIRECTOR | Delete photography package |
| `GET` | `/api/addons/active` | Public | Retrieve active add-on services |
| `POST` | `/api/addons` | COMPANY_DIRECTOR | Create add-on service |
| `PUT` | `/api/addons/{id}` | COMPANY_DIRECTOR | Update add-on service |
| `DELETE` | `/api/addons/{id}` | COMPANY_DIRECTOR | Delete add-on service |

---

## 4. Bookings & Availability (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/bookings` | Staff Roles | List all bookings across the enterprise |
| `GET` | `/api/bookings/my-bookings` | CUSTOMER | List bookings for current authenticated client |
| `GET` | `/api/bookings/{id}` | Authenticated | Retrieve complete booking breakdown with payments & add-ons |
| `POST` | `/api/bookings` | CUSTOMER | Self-service booking creation |
| `POST` | `/api/bookings/cro-create` | CRO, COMPANY_DIRECTOR | Create booking on behalf of telephone/walk-in client |
| `PATCH` | `/api/bookings/{id}/status` | Staff Roles | Transition booking lifecycle status |
| `GET` | `/api/bookings/availability` | Public | Check date availability for photography sessions |

---

## 5. Crew Assignments (`/api/assignments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/assignments/booking/{bookingId}` | Staff Roles | Get photographers assigned to a booking |
| `GET` | `/api/assignments/my-assignments` | PHOTOGRAPHER | Get events assigned to the logged-in photographer |
| `GET` | `/api/assignments/{id}` | PHOTOGRAPHER, Staff | Get assignment detail and shoot brief |
| `POST` | `/api/assignments` | OPERATIONS_MANAGER, COMPANY_DIRECTOR | Allocate photographer with overlap conflict prevention |
| `DELETE` | `/api/assignments/{id}` | OPERATIONS_MANAGER, COMPANY_DIRECTOR | Unassign photographer |

---

## 6. Equipment Inventory (`/api/equipment`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/equipment` | Staff Roles | List all equipment assets |
| `GET` | `/api/equipment/available` | OPERATIONS_MANAGER | List available equipment for deployment |
| `POST` | `/api/equipment` | OPERATIONS_MANAGER, COMPANY_DIRECTOR | Register gear (camera, lens, drone, lighting) |
| `POST` | `/api/equipment/allocate` | OPERATIONS_MANAGER | Allocate equipment asset to event booking |
| `PATCH` | `/api/equipment/{id}/status` | OPERATIONS_MANAGER | Update maintenance/availability status |

---

## 7. Change Requests (`/api/change-requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/change-requests` | Staff Roles | List all client rescheduling/change requests |
| `GET` | `/api/change-requests/booking/{bookingId}` | Authenticated | List change requests for specific booking |
| `POST` | `/api/change-requests` | CUSTOMER | Submit rescheduling or venue change request |
| `PATCH` | `/api/change-requests/{id}/review` | OPERATIONS_MANAGER, CRO, COMPANY_DIRECTOR | Approve or reject change request with audit notes |

---

## 8. Payments & Billing (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/payments` | FINANCE_EXECUTIVE, COMPANY_DIRECTOR | View global financial ledger |
| `GET` | `/api/payments/pending` | FINANCE_EXECUTIVE, COMPANY_DIRECTOR | View pending payment slips requiring verification |
| `GET` | `/api/payments/booking/{bookingId}` | Authenticated | View payment transactions for a booking |
| `POST` | `/api/payments/manual-receipt` | CUSTOMER, CRO | Upload bank transfer slip image |
| `PATCH` | `/api/payments/{id}/verify` | FINANCE_EXECUTIVE, COMPANY_DIRECTOR | Approve or reject payment with audit note |

---

## 9. Galleries & Deliveries (`/api/galleries`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/galleries` | Staff Roles | List all event galleries |
| `GET` | `/api/galleries/my-galleries` | CUSTOMER | List galleries for current client |
| `GET` | `/api/galleries/{id}` | Authenticated | Retrieve gallery details and photo catalog |
| `POST` | `/api/galleries/access` | Public | Access private gallery via unique client access code |
| `POST` | `/api/galleries` | OPERATIONS_MANAGER, PHOTOGRAPHER, DIRECTOR | Create gallery collection for booking |
| `POST` | `/api/galleries/{id}/photos` | PHOTOGRAPHER, Staff | Upload photos to gallery |
| `PATCH` | `/api/galleries/photos/{photoId}/proof` | CUSTOMER | Toggle proof selection (favorite for album print) |
| `PATCH` | `/api/galleries/photos/{photoId}/cover` | PHOTOGRAPHER, Staff | Set photo as album cover |
| `GET` | `/api/galleries/{id}/download-zip` | Authenticated | Download complete high-res photo collection (.ZIP) |

---

## 10. Feedback, Reviews & Audit (`/api/feedback`, `/api/reviews`, `/api/activity-logs`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/feedback` | CRO, COMPANY_DIRECTOR | List client satisfaction feedback surveys |
| `POST` | `/api/feedback` | CUSTOMER | Submit feedback on completed photography session |
| `GET` | `/api/reviews/featured` | Public | List approved public client testimonials |
| `POST` | `/api/reviews` | CUSTOMER | Submit public testimonial for moderation |
| `GET` | `/api/activity-logs` | COMPANY_DIRECTOR | List immutable system audit trail |
