# Database Schema Blueprint (PostgreSQL)

This document describes the conceptual SQL table designs, relationships, and constraints for the Hospital Information System (HIS) core monolith database.

---

## 1. Authentication (`auth`) & Users

### `users`
Represents corporate staff accounts and patients authenticated inside the application.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique user identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Corporate email address. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hashed credential string. |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | User's first name. |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | User's last name. |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Account status flag. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Date of registration. |

---

## 2. Role-Based Access Control (`rbac`)

### `roles`
System-wide designations (e.g., ADMIN, DOCTOR, NURSE).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY` | Unique role identifier. |
| `name` | `VARCHAR(50)` | `UNIQUE`, `NOT NULL` | Uppercase role name. |
| `description` | `TEXT` | | Overview of role responsibilities. |

### `permissions`
Functional clearances associated with API access (e.g., `patient:write`).

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY` | Unique permission identifier. |
| `code` | `VARCHAR(100)` | `UNIQUE`, `NOT NULL` | Machine-readable permission key. |
| `description` | `TEXT` | | Human-readable explanation. |

### `user_roles`
Many-to-many join mapping user identifiers to roles.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `user_id` | `UUID` | `FOREIGN KEY REFERENCES users(id)` | User association. |
| `role_id` | `UUID` | `FOREIGN KEY REFERENCES roles(id)` | Role association. |

---

## 3. Audit Logging (`audit`)

### `audit_logs`
Chronicles security and modification operations.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY` | Log identifier. |
| `user_id` | `UUID` | `NULLABLE` | Triggering user ID (null for system crons). |
| `action` | `VARCHAR(100)` | `NOT NULL` | Verb indicating operation (e.g. `USER_LOGIN`). |
| `resource` | `VARCHAR(255)` | `NOT NULL` | Affected record identifier. |
| `details` | `JSONB` | | Payload diffs or configuration metadata. |
| `ip_address` | `VARCHAR(45)` | `NOT NULL` | Caller IP address (IPv4 or IPv6). |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Action execution timestamp. |

---

## 4. Digital Cabinet Storage (`storage`)

### `file_metadata`
Tracks files uploaded to physical storage nodes or S3 buckets.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY` | File identifier. |
| `owner_id` | `UUID` | `FOREIGN KEY REFERENCES users(id)` | Uploader ID. |
| `filename` | `VARCHAR(255)` | `NOT NULL` | Name of the file on disk. |
| `mime_type` | `VARCHAR(100)` | `NOT NULL` | File format description (e.g., `application/pdf`). |
| `file_size` | `INTEGER` | `NOT NULL` | Size in bytes. |
| `storage_url` | `VARCHAR(2048)` | `NOT NULL` | Public access link or S3 path. |
| `uploaded_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Upload time. |

---

## 5. Suggestions Engine (`suggestions`)

### `suggestions`
Submissions containing clinical and workspace suggestions.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `id` | `UUID` | `PRIMARY KEY` | Suggestion identifier. |
| `user_id` | `UUID` | `FOREIGN KEY REFERENCES users(id)` | Submitter ID. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Brief summary of proposal. |
| `content` | `TEXT` | `NOT NULL` | Comprehensive rationale. |
| `status` | `VARCHAR(20)` | `DEFAULT 'PENDING'` | Options: `PENDING`, `APPROVED`, `REJECTED`. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Timestamp. |

---

## 6. Management Settings (`management`)

### `hospital_settings`
Global enterprise configuration details.

| Column | Type | Constraints | Description |
| --- | --- | --- | --- |
| `key` | `VARCHAR(100)` | `PRIMARY KEY` | Identifier string (e.g. `HOSPITAL_NAME`). |
| `value` | `TEXT` | `NOT NULL` | Configuration value. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp. |
