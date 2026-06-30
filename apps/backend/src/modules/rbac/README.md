# Role-Based Access Control (RBAC) Module

This module governs request access levels across clinical, medical, administrative, and patient boundaries.

## Roles Matrix
- **ADMIN**: Complete wildcard (`*`) override capability.
- **DOCTOR**: Clinical reads/writes, patient records updates.
- **NURSE**: Clinical reads, record adjustments, basic storage logs.
- **PHARMACIST**: Prescription writing, verification matching, patient overview.
- **PATIENT**: Self-record readings and feedback suggestions submission.

## Directory Structure
- `rbac.service.ts`: Resolves query credentials.
- `rbac.controller.ts`: Rest routes for checking roles configuration.
- `rbac.module.ts`: NestJS wrapper module mapping exports.
