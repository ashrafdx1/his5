# Audit Logs Module

This module tracks modifications to clinical documentation, configuration adjustments, and user authentications.

## Design
- Decorated as a `@Global()` NestJS Module so other domain packages can record activities without circular dependency issues.
- Outputs standardized logs mapping IP addresses, user IDs, affected resources, and data payloads.

## Directory Structure
- `audit.service.ts`: Logs and queries audit history records.
- `audit.controller.ts`: REST interface restricted to administration roles.
