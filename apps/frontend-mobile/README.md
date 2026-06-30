# HIS Mobile Client Application

This repository contains the Flutter cross-platform client package supporting both iOS and Android.

## Setup Requirements
1. Install [Flutter SDK](https://docs.flutter.dev/get-started/install) (version `>= 3.0.0`).
2. Run configuration installations:
   ```bash
   flutter pub get
   ```

## Development Run
Ensure a local device emulator is active, and run:
```bash
flutter run
```

## Structure
- `lib/main.dart`: Root widget declaring MaterialApp routing and Dark system visuals.
- `pubspec.yaml`: App assets, package details (Dio, Provider, Secure Storage).
