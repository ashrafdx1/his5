# Authentication (Auth) Module

This module manages secure system access for the Hospital Information System (HIS).

## Core Capabilities
- **JWT token generation & issuance** (Access and Refresh token flow).
- **Stateless verification** of incoming client sessions via Passport JWT strategy.
- **Mock initial state** with built-in administrator account validation.

## Directory Structure
- `strategies/jwt.strategy.ts`: Validates Bearer tokens and translates claims to context user objects.
- `auth.service.ts`: Handles bcrypt hashing checks and sign signatures.
- `auth.controller.ts`: Declares REST endpoints for login, refresh, and logout.

## Endpoints
| HTTP Method | Route | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Log in with email & password. Returns tokens. | No |
| `POST` | `/auth/refresh` | Swap expired access token for new session. | No |
| `POST` | `/auth/logout` | Invalidate current JWT credentials. | Yes (JWT) |
