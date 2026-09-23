# SNAPFLOW - Requirement Traceability Matrix (RTM)
**Course:** SE2030 Software Engineering  
**Project:** Web-based Event Photography Management System  
**Client:** Lanka Moments (Pvt) Ltd.  

---

| Req ID | Business Requirement Description | Database Entity | Spring Boot Backend Service & Controller | Frontend React View / Component | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Client Registration & Authentication with JWT | `users` | `AuthService`, `AuthController` | `RegisterPage.jsx`, `LoginPage.jsx` | **Complete** |
| **FR-02** | Role-Based Access Control (6 Distinct Roles) | `users.role` | `JwtAuthenticationFilter`, `SecurityConfig` | `ProtectedRoute.jsx`, `Sidebar.jsx` | **Complete** |
| **FR-03** | Public Photography Catalogue & Package Details | `packages`, `add_ons` | `PackageService`, `PackageController` | `PackagesPage.jsx`, `PackageDetailPage.jsx` | **Complete** |
| **FR-04** | Live Event Date & Slot Availability Checking | `bookings` | `BookingService.checkAvailability()` | `AvailabilityPage.jsx` | **Complete** |
| **FR-05** | Customer Self-Service Event Booking Wizard | `bookings`, `booking_add_ons` | `BookingService.createBooking()` | `BookPackage.jsx` | **Complete** |
| **FR-06** | 30% Advance Deposit & 70% Balance Computation | `bookings`, `payments` | `BookingService.calculatePricing()` | `BookPackage.jsx`, `CustomerBookingDetail.jsx` | **Complete** |
| **FR-07** | Bank Transfer Receipt Upload & Verification | `payments` | `PaymentService.uploadManualReceipt()` | `CustomerBookingDetail.jsx`, `PendingPayments.jsx` | **Complete** |
| **FR-08** | CRO Manual Booking Creation for Walk-in Clients | `bookings` | `BookingService.createBookingByCRO()` | `CRONewBooking.jsx` | **Complete** |
| **FR-09** | Operations Master Calendar & Conflict Prevention | `assignments` | `AssignmentService.assignPhotographer()` | `MasterCalendar.jsx`, `OpsAssignments.jsx` | **Complete** |
| **FR-10** | Studio Equipment Inventory & Asset Allocation | `equipment` | `EquipmentService` | `EquipmentInventory.jsx` | **Complete** |
| **FR-11** | Rescheduling & Event Change Request Workflow | `change_requests` | `ChangeRequestService` | `CustomerBookingDetail.jsx`, `OpsChangeRequests.jsx` | **Complete** |
| **FR-12** | High-Resolution Photo Gallery & Watermark Proofing | `galleries`, `photos` | `GalleryService` | `CustomerGalleryView.jsx`, `GalleryEditor.jsx` | **Complete** |
| **FR-13** | Gallery ZIP Batch Download & Access Code Login | `galleries` | `GalleryService.downloadZip()` | `GalleryAccessPage.jsx`, `CustomerGalleryView.jsx`| **Complete** |
| **FR-14** | Client Satisfaction Feedback & Public Testimonials | `feedback`, `reviews` | `FeedbackService`, `ReviewService` | `CustomerFeedback.jsx`, `CustomerReviews.jsx` | **Complete** |
| **FR-15** | Executive Analytics & Comprehensive Audit Logging | `activity_logs`, `system_settings`| `DashboardService`, `AuditService` | `ExecutiveDashboard.jsx`, `ActivityLogs.jsx` | **Complete** |
| **NFR-01**| Separation of Public Website & Dashboard Shells | N/A | React Router Layout Architecture | `PublicLayout.jsx` vs `DashboardLayout.jsx` | **Complete** |
| **NFR-02**| Automated Unit & Integration Testing Suite | N/A | JUnit 5, Mockito, Spring Boot Test | `src/test/java`, `frontend/src/tests` | **Complete** |
