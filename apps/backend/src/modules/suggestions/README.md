# Suggestions Module

This module collects clinical or operations improvements suggested by hospital staff (doctors, nurses) or patients.

## Workflow
1. **Submit**: Patient or practitioner writes suggestion in `PENDING` state.
2. **Review**: Administrator or general manager queries proposals and updates status to `APPROVED` or `REJECTED`.

## Directory Structure
- `suggestions.service.ts`: Local memory state tracker (to be mapped to database).
- `suggestions.controller.ts`: Routing permissions checks.
