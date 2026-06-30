# Notifications Module

This module manages communication channels (Email, SMS, In-App) for patient messaging, alerts, reminders, and security tokens.

## Supported Protocols
- **EMAIL**: Dispatch for invoice billing, patient reports, or login updates.
- **SMS**: Transaction OTP verification or emergency alerts.
- **IN_APP**: Real-time websocket pushes for local client alerts.

## Directory Structure
- `notifications.service.ts`: Handlers for sending messages.
- `notifications.controller.ts`: Endpoint exposure for client-side custom dispatches.
