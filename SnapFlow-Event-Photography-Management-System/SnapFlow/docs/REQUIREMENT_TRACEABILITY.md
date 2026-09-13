# Requirement Traceability Matrix

This document maps the functional requirements and Product Backlog Items from the project documents to the implementation.

## Functional Requirements (from Project Report)

| FR ID  | Description                                      | Backend                              | Frontend                              | Database                  | Status      |
|--------|--------------------------------------------------|--------------------------------------|---------------------------------------|---------------------------|-------------|
| FR-01  | Booking and Customer Management                  | Auth, Booking, Package controllers   | Packages, Booking forms, My Bookings  | users, bookings, packages | Implemented |
| FR-02  | Event Scheduling & Resource Allocation           | Assignment, Calendar, Equipment      | Master Calendar, Assignments          | photographer_assignments, equipment | Implemented |
| FR-03  | Customer Request & Change Management             | ChangeRequest service/controller     | Request Change, Approve/Reject        | change_requests           | Implemented |
| FR-04  | Photography Workflow Management                  | Assignment status updates            | Photographer Dashboard, Progress      | photographer_assignments  | Implemented |
| FR-05  | Photo Delivery & Gallery Management              | Gallery + Photo controllers          | Gallery view, Upload                  | galleries, photos         | Implemented |
| FR-06  | Photography Package Management                   | Package CRUD                         | Package list, Admin package mgmt      | packages, add_ons         | Implemented |

## Key Product Backlog Items

| PBI    | Summary                                          | Implementation Notes                                      | Status      |
|--------|--------------------------------------------------|-----------------------------------------------------------|-------------|
| PBI-01 | Secure registration, login, RBAC                 | JWT + Spring Security + Role enum                         | Implemented |
| PBI-02 | Browse packages & check date availability        | Public package API + booking form                         | Implemented |
| PBI-03 | Interactive master calendar & assign photographers | Calendar view + assignment endpoints                    | Implemented |
| PBI-04 | Access event details                             | Booking/Event detail APIs + Photographer view             | Implemented |
| PBI-05 | Request specific photographers                   | Optional photographer preference on booking               | Implemented |
| PBI-06 | Change assigned photographer (emergency)         | Reassignment endpoint with conflict check                 | Implemented |
| PBI-07 | Upload & verify bank transfer receipts           | Payment + receipt path + verify/reject                    | Implemented |
| PBI-08 | Track booking status                             | Status enum + history via activity log                    | Implemented |
| PBI-09 | Automated notifications                          | Simple DB-backed notification system                      | Implemented |
| PBI-10 | Edit package selection & add-ons                 | Change request + booking update                           | Implemented |
| PBI-11 | Balance notifications (2 weeks before)           | Notification generation logic (manual trigger for demo)   | Partial     |
| PBI-12 | Clear payment breakdowns                         | Deposit / Balance / Additional fields                     | Implemented |
| PBI-13 | Review accept/reject change requests             | Approve / Reject endpoints + resource check               | Implemented |
| PBI-14 | Executive dashboard                              | Dashboard summary API + charts                            | Implemented |
| PBI-15 | Event coverage metrics                           | Basic metrics on dashboard                                | Partial     |
| PBI-16 | Monthly coverage summary                         | Photographer workload summary                             | Partial     |
| PBI-17 | Customer suggestions & complaints                | Simple feedback via change request / notes                | Partial     |
| PBI-18 | Public service information                       | Public home, packages, about, contact pages               | Implemented |
| PBI-19 | System branding & professional appearance        | Tailwind + professional photography theme                 | Implemented |
| PBI-20 | Financial transaction records                    | Payments table + history                                  | Implemented |
| PBI-21 | Track equipment allocation                       | Equipment + allocation tables                             | Implemented |
| PBI-22 | Create bookings for phone-in / walk-in           | CRO can create bookings on behalf of customers            | Implemented |
| PBI-23 | Process package upgrades & add-ons               | Change request flow                                       | Implemented |
| PBI-24 | Update assigned event progress/status            | Photographer progress updates                             | Implemented |

## Notes on Status

- **Implemented** = Full working flow present in code (backend + frontend connection)
- **Partial** = Core data model and basic endpoints exist; advanced automation (e.g. scheduled balance emails) is simplified for university scope

All six major functions from the Project Report are covered.
All high-priority PBIs from the Product Backlog are covered.
