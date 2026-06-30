# Storage Module

This module abstracts file uploads (medical imagery, lab scans, patient consent PDFs, billing statements).

## Features
- **Local Disk Driver**: Saves files to a designated workspace directory (for local development).
- **Amazon S3 Driver**: Integrates AWS SDK bucket uploads (for staging/production).
- **Multipart Form Upload**: Native integration via NestJS interceptors.

## Directory Structure
- `storage.service.ts`: Abstraction rules for uploading and delete operations.
- `storage.controller.ts`: Endpoint routing accepting `multipart/form-data`.
