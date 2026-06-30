# HIS Infrastructure Modules Catalog

This document details the boundaries, interfaces, and responsibilities of the seven foundational infrastructure modules in the Hospital Information System (HIS).

---

## 1. Authentication (`auth`)
Manages security check gates, JWT sessions, and credential validation.
- **Location**: `apps/backend/src/modules/auth/`
- **Exposed Endpoints**:
  - `POST /auth/login` (Issue JWT and Refresh token pairs)
  - `POST /auth/refresh` (Exchange expired JWT for a fresh session)
  - `POST /auth/logout` (De-authenticate JWT session)
- **External Dependencies**: `@nestjs/jwt`, `@nestjs/passport`, `bcrypt`.

---

## 2. Role-Based Access Control (`rbac`)
Decides which actions are permitted based on corporate roles (e.g. Doctor, Pharmacist, Nurse, Admin).
- **Location**: `apps/backend/src/modules/rbac/`
- **Clearance Level Controls**: Custom `@Roles()` decorator checks user metadata values against access lists.
- **Exposed Endpoints**:
  - `GET /rbac/roles` (Fetch all registered system roles, Admin restricted)
  - `GET /rbac/roles/:role/permissions` (Fetch permission mappings)

---

## 3. Audit Logs (`audit`)
Constructs an immutable history trail tracking logins and record modifications.
- **Location**: `apps/backend/src/modules/audit/`
- **Global Context**: Configured as a `@Global()` NestJS Provider. Any module service can invoke `auditService.logAction()` to save records without circular imports.
- **Exposed Endpoints**:
  - `GET /audit/logs` (Retrieve filterable logs ledger, Admin restricted)

---

## 4. Notifications (`notifications`)
Transactional system alerts manager.
- **Location**: `apps/backend/src/modules/notifications/`
- **Dispatches**:
  - **Email**: Billing receipts, test result alert notifications.
  - **SMS**: Time-sensitive updates and verification codes.
  - **In-App**: Real-time websocket announcements.
- **Exposed Endpoints**:
  - `POST /notifications/send` (System-wide alert broadcast)

---

## 5. Digital Storage (`storage`)
Handles storage of clinical scan files, invoices, and diagnostic imagery.
- **Location**: `apps/backend/src/modules/storage/`
- **Drivers**: Configured via `.env` parameter `STORAGE_DRIVER` to target local filesystem directory pathing or AWS S3 containers.
- **Exposed Endpoints**:
  - `POST /storage/upload` (Accepts `multipart/form-data`)
  - `DELETE /storage/:id` (Invalidates file assets)

---

## 6. Feedback Suggestions (`suggestions`)
A clinician/patient review channel to log ideas or bugs.
- **Location**: `apps/backend/src/modules/suggestions/`
- **Flow**: Submissions are logged as `PENDING` and must be checked by Admins to become `APPROVED` or `REJECTED`.
- **Exposed Endpoints**:
  - `POST /suggestions` (Create feedback item)
  - `GET /suggestions` (List logs, Manager restricted)
  - `PATCH /suggestions/:id/status` (Approve/Reject submissions)

---

## 7. Hospital Management (`management`)
Handles branches, metadata contact details, and local API whitelist configurations.
- **Location**: `apps/backend/src/modules/management/`
- **Exposed Endpoints**:
  - `GET /management/config` (Read hospital information settings)
  - `POST /management/config` (Overwrite branch configurations, Admin restricted)
