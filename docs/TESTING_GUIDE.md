# SNAPFLOW - Verification & Testing Guide
**Company:** Lanka Moments (Pvt) Ltd.  
**Course:** SE2030 Software Engineering  

---

## 1. Automated Test Execution

### Backend Test Suite (JUnit 5 + Spring Boot Test)
The backend test suite verifies core business invariants:
- BCrypt authentication, password encryption, and duplicate account rejection.
- Pricing engine (30% advance deposit and 70% balance calculations).
- Resource conflict prevention (prevents assigning a photographer to two overlapping shoots).
- Payment verification workflow and private gallery generation.

**To run backend tests:**
```powershell
cd C:\Users\ruwan\.gemini\antigravity\scratch\SnapFlow\backend
$env:JAVA_HOME = "C:\Users\ruwan\.antigravity-ide\extensions\redhat.java-1.56.0-win32-x64\jre\21.0.12.1-win32-x86_64"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
.\mvnw.cmd test
```
*Expected Output:* `Tests run: 14, Failures: 0, Errors: 0, Skipped: 0. BUILD SUCCESS.`

---

### Frontend Test Suite (Vitest + React Testing Library)
The frontend test suite verifies:
- Routing and layout separation (PublicLayout vs DashboardLayout).
- Authentication guard redirects (`/customer/dashboard` -> `/login`).
- Currency formatting (`formatLKR`) and financial calculation helpers.

**To run frontend tests:**
```powershell
cd C:\Users\ruwan\.gemini\antigravity\scratch\SnapFlow\frontend
npm.cmd test
```
*Expected Output:* `Test Files: 2 passed (2), Tests: 6 passed (6).`

---

### Frontend Production Build
To verify the production compilation of Vite and Tailwind:
```powershell
cd C:\Users\ruwan\.gemini\antigravity\scratch\SnapFlow\frontend
npm.cmd run build
```
*Expected Output:* `built in ~2s -> dist/index.html, dist/assets/*.js, dist/assets/*.css.`

---

## 2. Default Seeded Credentials for Testing

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Company Director** | `director@lankamoments.lk` | `Admin@1234` | `/admin/dashboard` |
| **Operations Manager** | `operations@lankamoments.lk`| `Ops@1234` | `/operations/dashboard` |
| **Customer Relations** | `cro@lankamoments.lk` | `Cro@1234` | `/cro/dashboard` |
| **Finance Executive** | `finance@lankamoments.lk` | `Finance@1234` | `/finance/dashboard` |
| **Lead Photographer** | `photographer@lankamoments.lk` | `Photo@1234` | `/photographer/dashboard` |
| **Client / Customer** | `customer@example.com` | `Customer@1234` | `/customer/dashboard` |
