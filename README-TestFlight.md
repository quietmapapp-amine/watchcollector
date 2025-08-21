# TestFlight Deployment Guide

## Quick Start

1. **Setup environment variables** in `.env`:
   ```bash
   APPLE_TEAM_ID=your_team_id
   APP_IDENTIFIER=com.yourcompany.appname
   ASC_KEY_ID=your_key_id
   ASC_ISSUER_ID=your_issuer_id
   ASC_KEY_FILE=.private/appstoreconnect_api_key.p8
   ```

2. **Deploy to TestFlight**:
   ```bash
   make release
   ```

## Debug Build Failures (exit 65)

When Fastlane fails with exit code 65, the real error is often hidden. Use these tools to surface the true xcodebuild error:

### 1. Fix Code Signing
```bash
bash scripts/ios_signing_fix.sh
```

### 2. Probe Raw Build
```bash
bash scripts/ios_build_probe.sh
```

### 3. Retry Release
```bash
make release
```

## Troubleshooting

- **Build probe script** logs to `build/ios_build_probe.log`
- **Check Xcode** for signing & capabilities configuration
- **Verify provisioning profiles** in Apple Developer portal
- **Ensure bundle identifier** matches App Store Connect

## Manual Steps

If automated fixes fail:
1. Open project in Xcode
2. Set signing to "Automatic"
3. Select correct team
4. Verify bundle identifier
5. Clean build folder
6. Retry `make release`
