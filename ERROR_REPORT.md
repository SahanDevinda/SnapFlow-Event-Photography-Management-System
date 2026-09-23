# SnapFlow — Error Report & Fix Log

**Project:** SnapFlow (Lanka Moments Pvt Ltd) — Spring Boot 3 backend + React 18 / Vite / Tailwind frontend
**Source archive:** `50.zip`
**Files changed:** 62 modified, 7 added

---

## 1. How the code was checked

| Check | Result before | Result after |
|---|---|---|
| `npm ci` | OK | OK |
| `npm run build` (Vite production) | Passed | Passed |
| `npm test` (Vitest) | 6/6 passed, but with Axios `Network Error` noise and React `act()` warnings | 14/14 passed, clean output |
| Undefined-identifier scan (custom AST-ish scan of all `.jsx`) | 1 real hit | 0 |
| `lucide-react` import validity | OK | OK |
| Java syntax check (`javac -proc:none`) | 11 dependency-only errors | 12 dependency-only errors (identical class, +1 from the new DTO) |
| Frontend field access vs backend DTO fields | 30 mismatches | 0 |
| Frontend API paths vs backend `@RequestMapping` | 23 mismatches | 0 |

**Important:** the build and tests passing in the original archive was misleading. Vite only checks that the code *parses*; it cannot detect a missing Tailwind colour, an undefined component prop, a wrong REST path, or a field name that does not exist on the response. Every bug below would have appeared only at runtime, in the browser.

**Backend limitation:** Maven Central is not reachable from this environment, so `./mvnw test` could not be run. Instead a JDK was installed and every `.java` file was passed through `javac`. All remaining errors are "cannot find symbol" / "package does not exist" caused by absent Spring/Lombok jars, and the set is byte-for-byte the same as the unmodified source. **No new structural errors were introduced**, but the backend still needs one `./mvnw clean test` run on a machine with internet access before hand-in.

---

## 2. Critical defects (application-breaking)

### 2.1 The entire `navy-*` colour palette was undefined
`tailwind.config.js` defined only `charcoal` and `gold`, but the source uses `navy-50` … `navy-950` **528 times** across every page. Tailwind silently drops unknown classes, so all headings, borders, table rules, empty-state text and card chrome rendered with no colour at all.

Also missing: `gold-50`, `gold-300`, `gold-700`, the `animate-slide-in` keyframes used by the toast, `backdrop-blur-xs`, `shadow-xs`, `border-3`.

**Fix:** full 11-step `navy` scale, missing `gold` shades, keyframes/animation, and the three missing utility scales added to `theme.extend`. CSS output grew 33.15 kB → 38.78 kB, confirming the rules now generate.

### 2.2 `Button variant="gold"` did not exist
Used **38 times** — it is the primary call-to-action across the app. `variants[variant]` returned `undefined`, producing `class="... undefined ..."`, i.e. an unstyled button. `size="xs"` (17 uses) and `size="xl"` (1) were likewise undefined.

**Fix:** added `gold` and `success` variants, `xs`/`xl` sizes, a safe fallback for unknown values, and icon sizing that tracks the button size.

### 2.3 Modal footers were never rendered — all dialog actions were unreachable
Every modal in the app is written as `<Modal footer={<><Button>Cancel</Button><Button>Save</Button></>}>`, but `Modal.jsx` accepted only `isOpen/onClose/title/children/maxWidth`. **The Save, Confirm, Verify and Cancel buttons in all 10 modals never appeared**, so no record could be created or edited from the UI.

Affected: `UserManagement`, `PackageCrud`, `AddOnCrud`, `PendingPayments`, `OpsAssignments`, `EquipmentInventory`, `CROBookingsList`, `CustomerBookingDetail` (×2), `CustomerGalleryView`.

**Fix:** `Modal` now renders a `footer` region and supports `size` (`sm`…`full`). Also added background scroll-lock, `role="dialog"`, and an accessible close label.

### 2.4 Every status badge rendered empty
21 call sites use `<Badge status={x} />`, but `Badge.jsx` only read `children`. Result: an empty coloured pill everywhere a booking, payment, gallery, equipment or user status should have been shown.

**Fix:** `Badge` now accepts `status`, `children` or an explicit `variant`; the status→variant map was extended (`APPROVED`, `ACTIVE`, `INACTIVE`, `PAID`, `PARTIALLY_PAID`, `OVERDUE`, `UNDER_REVIEW`, `MAINTENANCE`, …) and values are prettified (`IN_PROGRESS` → "In Progress").

### 2.5 Every toast call threw a `TypeError`
Pages call `toast.success(...)` / `toast.error(...)` **67 times**, but `ToastContext` exposed only `showSuccess` / `showError` / `showInfo`. Every successful save and every error handler crashed the component.

**Fix:** the context value now exposes both naming styles (`success`/`error`/`warning`/`info` plus the `show*` aliases), adds a `warning` level, and `useToast()` throws a clear message if used outside the provider.

### 2.6 Sidebar crashed for Operations Managers
`Sidebar.jsx` referenced `icon: Tool`, but `Tool` was never imported from `lucide-react` (it was removed from the library). Calling `getNavLinks('OPERATIONS_MANAGER')` threw `ReferenceError: Tool is not defined`, taking down the whole sidebar.

**Fix:** changed to `Wrench` (already imported).

### 2.7 Spring `Page` objects treated as arrays
Seven endpoints return a paginated `Page` (`{content, totalElements, …}`), but the pages did `setX(res.data)` then `.filter()` / `.map()` / `.length` on it — `TypeError: payments.filter is not a function`.

Affected endpoints: `/bookings`, `/users`, `/payments`, `/galleries`, `/equipment`, `/feedback`, `/activity-logs`, `/notifications`.

**Fix:** added a `listOf(res)` normaliser in `services/api.js` that unwraps `Page`, passes plain arrays through, and returns `[]` for anything else. Applied at 27 call sites.

### 2.8 File uploads could never work
`api.js` set `'Content-Type': 'application/json'` as an instance default. Axios does not overwrite an explicitly-set content type, so `FormData` was sent **without the multipart boundary** — the server cannot parse such a request. This broke both payment-receipt upload and gallery photo upload.

**Fix:** the default header was removed; the request interceptor now deletes `Content-Type` for `FormData` (letting the browser generate the boundary) and applies `application/json` only to non-FormData bodies.

---

## 3. Routing defects

| Location | Problem | Fix |
|---|---|---|
| `Sidebar.jsx` | 6 Operations links point at `/ops/*`; the routes are `/operations/*` | corrected |
| `Sidebar.jsx` | `/cro/bookings/new` → route is `/cro/new-booking` | corrected |
| `Sidebar.jsx` | `/admin/add-ons` → route is `/admin/addons` | corrected |
| `Sidebar.jsx` | `/admin/branding` → route is `/admin/settings` | corrected |
| `AuthContext.getDashboardPath` | returns `/ops` for `OPERATIONS_MANAGER`; Ops Managers landed on a 404 immediately after login | returns `/operations` |
| `DashboardLayout.jsx` | header links to `/profile` and `/notifications`, which are not routes (they exist per-portal) | now role-scoped via `getDashboardPath(user.role)` |

---

## 4. Frontend ↔ backend contract mismatches

### 4.1 Wrong endpoint paths (23 fixed)

| Frontend called | Backend actually exposes |
|---|---|
| `/addons`, `/addons/active`, `/addons/{id}` | `/add-ons`, `/add-ons/all`, `/add-ons/{id}` |
| `/bookings/my-bookings` | `/bookings/my` |
| `/assignments/my-assignments` | `/assignments/my` |
| `/galleries/my-galleries` | `/galleries/my` |
| `/galleries/{id}/download-zip` | `/galleries/{id}/zip` |
| `DELETE /galleries/photos/{photoId}` | `DELETE /galleries/{id}/photos/{photoId}` |
| `PATCH /galleries/photos/{photoId}/cover` | *(does not exist)* → `PUT /galleries/{id}` with `coverPhotoId` |
| `PATCH /galleries/photos/{photoId}/proof` + JSON body | `PATCH /galleries/{id}/photos/{photoId}/proof?selected=` |
| `/packages/active` | `/packages` |
| `POST /users/staff` | `POST /users` |
| `POST /users/change-password` | `POST /auth/change-password` |
| `PUT /users/profile` | *(did not exist — added as `PUT /users/me`)* |
| `PATCH /users/{id}/status` | `PATCH /users/{id}/deactivate` \| `/reactivate` |
| `DELETE /packages/{id}`, `DELETE /addons/{id}` | *(no hard delete)* → `PATCH …/deactivate` \| `/reactivate` |
| `POST /payments/manual-receipt` | `POST /payments` (multipart) |
| `POST /bookings/cro-create` | `POST /bookings` |
| `GET /change-requests` | `GET /change-requests/pending` |
| `POST /change-requests` | `POST /change-requests/booking/{bookingId}` |
| `PUT /settings` (whole object) | `POST /settings` (one key/value per call) |
| `/dashboard/{role}` ×6 | see §4.3 |

### 4.2 Wrong field names (30 fixed)

Every one of these rendered blank, `undefined`, or caused a 400 on submit:

- **Payments:** `paymentMethod` → `paymentType`; `transactionRef` → `transactionReference`; `receiptNumber` → `receiptOriginalName`; `receiptUrl` → *(no such field; served by `GET /payments/{id}/receipt`)*; verification body `auditNotes` → `verificationNotes` (the field is `@NotBlank`, so every verification was rejected).
- **Bookings:** `balanceRemaining` → `balanceAmount`; `guestCount` is not a column (now folded into `specialRequests`); `endTime` is derived server-side from the package duration and was being sent redundantly.
- **Packages:** `hoursIncluded` → `durationHours` (`@NotNull`, so **every package save returned 400**); `features` was sent as an array where the backend expects a `@NotBlank` String (also always 400); `photographersCount` / `editedPhotosCount` / `popular` have no backing columns and were silently discarded — they are now appended to the features text.
- **Photos:** `photoUrl` and `isCoverPhoto` do not exist on `PhotoResponse` — **every gallery image was blank**; `isProofSelected` → `selectedProof`.
- **Galleries:** `coverPhotoUrl` → `coverPhotoId`; `isWatermarked` does not exist.
- **Feedback:** the customer form posted `{bookingId, rating, category, comments, suggestions}`; `FeedbackCreateRequest` is `{type, subject, message}` — **every submission returned 400**. Now mapped, with rating/category/booking-ref preserved in the subject and message.
- **Reviews:** the form posted `packageId`, but `ReviewCreateRequest` requires `bookingId` (`@NotNull`) — **every review returned 400**. The page now loads the customer's own COMPLETED bookings instead of the package catalogue.
- **Change requests:** `requestType` and `reason` → `description` / `proposedPackageName`.
- **Activity logs:** `entityType` / `entityId` → `details`.
- **Operations dashboard:** `assignedCrew` → `assignments`.

### 4.3 Six dashboard endpoints did not exist

`/dashboard/customer`, `/dashboard/cro`, `/dashboard/operations`, `/dashboard/photographer`, `/dashboard/finance` and `/dashboard/executive` were all called by the frontend. The backend exposes only `/dashboards/executive` and `/dashboards/coverage/{id}`. **Every role's landing page was a guaranteed 404 showing zeroes.**

**Fix:** added `frontend/src/services/dashboards.js`, which rebuilds each metric set from the real secured APIs and returns the exact object shape each page already expects — so no page JSX had to be rewritten. The executive dashboard consumes the genuine `/dashboards/executive` metrics and converts the `monthlyRevenue` map into the array shape the chart needs.

---

## 5. Media / gallery workflow (was broken end to end)

1. **No image ever displayed.** Photos are served by a secured endpoint; a `<img src>` tag cannot send the `Authorization` header, and the code was reading a non-existent `photoUrl` field anyway.
   **Fix:** new `components/common/ProtectedImage.jsx` fetches the bytes as a blob with the token attached and renders from an object URL, with loading and failure states and proper `revokeObjectURL` cleanup.
2. **Upload sent the wrong field.** The editor appended `photo` one file at a time; the controller takes `@RequestParam("files") List<MultipartFile>`. Captions were appended to the same request but the upload endpoint has no caption parameter.
   **Fix:** a single multi-file request on `files`, then captions applied through `PATCH …/photos/{photoId}/caption`.
3. **Public gallery could not load images or download the ZIP.** `GalleryAccessPage` built URLs like `/api/galleries/photos/{id}/stream?accessCode=…`, but that route is behind the security filter chain, so an anonymous visitor got 401.
   **Fix (backend):** added `GET /galleries/public/{accessCode}/photos/{photoId}/stream` and `GET /galleries/public/{accessCode}/zip`. These sit under the already-permitted `/galleries/public/**` prefix, and the service layer still validates the access code against a PUBLISHED gallery.
4. **Receipt links were plain `<a href>`** to a secured endpoint → 401. Replaced with a `ProtectedFileLink` component that fetches the blob and opens it in a new tab.

---

## 6. Security issues

| Issue | Detail | Fix |
|---|---|---|
| Hard-coded database password | `application-dev.properties` contained `${DB_PASSWORD:Ruwandika@123456}` as the default — a real credential committed to source | default removed; `DB_PASSWORD` must now come from the environment |
| `/auth/**` fully anonymous | `permitAll()` on the whole prefix also exposed `/auth/me` and `/auth/change-password`, both of which act on the current principal | narrowed to `POST /auth/login` and `POST /auth/register` only |
| Blanket `GET /packages/**` and `/add-ons/**` | also matched the staff-only `/all` routes that return inactive records | narrowed to the collection and numeric-id routes |
| Staff contact details exposed | making `/users/photographers` public for the availability page would have leaked every photographer's email and phone number | added a name-only `GET /users/public/photographers` (new `PublicPhotographerResponse`); the full route stays authenticated |
| Missing self-service profile endpoint | `ProfilePage` had nowhere to save to | added `PUT /users/me` + `ProfileUpdateRequest` (name and phone only — role and active status remain director-controlled) |

---

## 7. Functional gaps closed

- **Photographers could not update an assignment.** `PATCH /assignments/{id}/status` existed on the backend but `AssignmentDetail` was read-only, so a shoot could never be confirmed, started or completed. Added a progress action (Assigned → Confirmed → In Progress → Completed). The page also displayed `assignment.role`, which is not a field on `AssignmentResponse`; replaced with the status badge and package name.
- **Photographers could not see their galleries.** `PhotographerGalleries` called `GET /galleries`, which is restricted to Operations/Director → 403 for the one role that needs it. Now resolved through `/assignments/my` → `/galleries/booking/{bookingId}`.
- **The finance CSV export buttons were fake.** They only fired a success toast and downloaded nothing, while `GET /payments/export` existed and was unused. `FinancialReports` now performs a real export with an optional date range, for both verified revenue and the full ledger.
- **Settings could never be saved.** `BrandingSettings` sent one `PUT` with the whole object; the backend stores one key/value pair per `POST`. Now iterated correctly.

---

## 8. Test suite

The original suite passed but was not trustworthy — it rendered the whole app against a live Axios instance, so every run printed `Network Error` stack traces, and React `act()` warnings were being ignored.

- `tests/setup.js` now stubs the API module, `window.matchMedia` and `URL.createObjectURL`.
- `navigation.test.jsx` uses `findAllBy*` so effects settle before assertions, and opts into the React Router v7 future flags (also set on the real `BrowserRouter` in `main.jsx`) — this removes the upgrade warnings.
- Three new files add regression coverage for the bugs above: `components.test.jsx` (Button `gold`/`xs` produces no `undefined` class, Badge renders from `status`, Modal renders its footer, Card honours `padding`/`headerAction`), `toast.test.jsx` (both call styles work), `api.test.js` (`listOf` unwraps a `Page`).

**Result: 14/14 passing with no warnings and no network noise.**

---

## 8a. Second review pass — additional defects found

A second, targeted pass over every `PATCH`/`POST` body and every field read from an
`AssignmentResponse`/`BookingStatus` turned up five more mismatches that the first
pass's automated field-name scan didn't catch (they involve enum *values*, not field
*names*, and a body key that was wrong rather than missing):

| File | Problem | Fix |
|---|---|---|
| `CROBookingsList.jsx` | `PATCH /bookings/{id}/status` was sent as `{ status }`; the DTO field is `newStatus` (`@NotNull`) — **every CRO status change returned 400** | body key corrected to `newStatus` |
| `CROBookingsList.jsx` | The "Request Deposit" button checked `selectedBooking.status === 'INQUIRY'` and sent `'PENDING_DEPOSIT'` — **neither value exists in `BookingStatus`** (`PENDING, CONFIRMED, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED`), so the button could never appear and would have failed validation if it had | replaced with a "Confirm Booking" action gated on `status === 'PENDING'`, transitioning to `CONFIRMED` |
| `OpsAssignments.jsx` | The assign-photographer form collected a `role` (Lead/Secondary/Drone/Assistant) and posted it as `role: assignForm.role` — **`AssignmentCreateRequest` has no `role` field**, so the choice was silently discarded every time | role is now folded into the `notes` text so the information isn't lost; the crew list on the bookings table shows the assignment's real `status` badge instead of the non-existent `a.role` |
| `AssignedEvents.jsx`, `PhotographerDashboard.jsx` | Both rendered `{a.role}` next to each assignment — `AssignmentResponse` has no `role` field, so this printed the literal text `undefined` | replaced with a `Badge status={a.status}` |
| `PackageCard.jsx`, `PackageDetailPage.jsx` (public site) | Split `pkg.features` on commas, but the admin form (`PackageCrud.jsx`) saves one feature per **line** — every multi-line features list rendered as a single run-on sentence on the public packages page | added `utils/features.js` (`parseFeatures`), which prefers `\n` and falls back to `,` for older data, and pointed both components at it |

`OpsAssignments.jsx` also had a smaller robustness issue: it read `pRes.data.length`
directly instead of going through the `listOf()` normaliser used everywhere else. The
photographer list happens to come back as a plain array today, so this one wasn't
actively broken, but it was inconsistent with the rest of the codebase and would break
silently if that endpoint were ever changed to a paginated response — fixed for
consistency.

Frontend build and the full Vitest suite were re-run after this pass: **build clean,
14/14 tests passing**, no new warnings.

---

## 8b. Database swapped from MySQL to Microsoft SQL Server (SSMS)

The project originally targeted MySQL. Since the requirement was to connect through
**SQL Server Management Studio (SSMS)**, which only manages Microsoft SQL Server, the
backend's database layer was ported:

| File | Change |
|---|---|
| `backend/pom.xml` | `mysql-connector-j` → `mssql-jdbc`; `flyway-mysql` → `flyway-sqlserver` |
| `application-dev.properties` | driver class → `com.microsoft.sqlserver.jdbc.SQLServerDriver`; JDBC URL → `jdbc:sqlserver://localhost:1433;databaseName=snapflow_db;encrypt=true;trustServerCertificate=true`; Hibernate dialect → `SQLServerDialect`; default username → `sa` |
| `application-test.properties`, `test/resources/application.properties` | H2's compatibility mode switched `MODE=MySQL` → `MODE=MSSQLServer` so the in-memory tests exercise SQL Server syntax quirks too |
| `db/migration/V1__schema.sql` | fully rewritten in T-SQL: `AUTO_INCREMENT` → `IDENTITY(1,1)`, `BOOLEAN` → `BIT`, `TEXT`/`TIMESTAMP` → `VARCHAR(MAX)`/`DATETIME2`, inline `INDEX (...)` → separate `CREATE INDEX` statements, `ENGINE=InnoDB DEFAULT CHARSET=...` dropped (not a SQL Server concept), `ON UPDATE CURRENT_TIMESTAMP` dropped (the app already sets `updated_at` in Java via `@UpdateTimestamp` on `BaseEntity`, so the database-level auto-touch was redundant) |
| `.env.example`, `docker-compose.yml` | updated to the SQL Server connection string / image (`mcr.microsoft.com/mssql/server:2022-latest`) |

**A couple of `ON DELETE SET NULL` foreign keys were made plain (`NO ACTION`) during the port** — specifically `reviews.photographer_id` and `feedback.responded_by_id`. SQL Server refuses to create a table (error 1785) when two cascading paths could reach the same row, which happens more easily than in MySQL when several foreign keys in one table point at the same parent. Since the API never hard-deletes a `User` (staff are deactivated, not removed — see §7), this has no practical effect; deleting a user row directly in SSMS for testing will now be blocked by these constraints instead of silently nulling the reference, which is arguably safer for an audit-trail system like this one anyway.

**No Java source files needed to change** — all queries in the repositories are JPQL or Spring Data derived queries, none of which contain MySQL-specific SQL functions, so Hibernate's `SQLServerDialect` translates everything automatically.

**Before first run:** SQL Server has no equivalent of MySQL's `createDatabaseIfNotExist=true`. Create the `snapflow_db` database once yourself in SSMS (right-click **Databases → New Database**) before starting the backend — Flyway will create the tables inside it on first boot.

---

## 9. Remaining work / notes

1. **Run `./mvnw clean test` on a machine with internet access.** The backend changes are syntax-verified but have not been compiled against Spring and Lombok.
2. **Set `DB_PASSWORD`** in your environment (or a `.env` file) before starting the backend — there is deliberately no default any more.
3. `PackageResponse` has no columns for crew size, edited-photo count or a "most popular" flag. These are currently written into the free-text `features` field. If they matter for the report, add the columns to `Package`, the DTOs and a Flyway migration.
4. `Feedback` has no booking, rating or category columns; the customer feedback form encodes them into `subject`/`message`. Consider whether the marking scheme requires them as first-class fields.
5. The bundle is 458 kB (121 kB gzipped) in a single chunk. Not a defect, but route-level `React.lazy` would improve first load if you want to mention performance.
6. `spring.jpa.hibernate.ddl-auto=validate` with Flyway means the schema must already exist and match `V1__schema.sql`. `createDatabaseIfNotExist=true` was added to the dev JDBC URL to make first run smoother.
