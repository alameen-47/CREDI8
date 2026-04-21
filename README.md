# CREDI8

React Native client with a Node/Mongo backend. Billing runs on the server; the mobile app talks to your API over HTTPS using a JWT from login (stored in AsyncStorage).

## Prerequisites

- Node.js 18+
- Android Studio for Android builds
- Xcode on macOS for iOS builds
- CocoaPods for iOS

## Environment variables (mobile)

Use `react-native-config`. Copy `.env.example` to `.env.development` and `.env.production` (gitignored). Set `API_BASE_URL` in `.env.production` for release builds.

Razorpay secrets, JWT, Mongo: **backend/.env** only (`backend/.env.example`).

## Install and run

```bash
npm install --legacy-peer-deps
npm run backend
npm start
npx react-native run-android
npx react-native run-ios
```

iOS: `cd ios && pod install`

## Android release

Set signing in `android/gradle.properties` (see `gradle.properties.example`). Then:

```bash
cd android && ./gradlew assembleRelease && ./gradlew bundleRelease
```

## iOS release

Open `ios/CREDI8.xcworkspace`, Product - Archive.

## Security

Razorpay/JWT/Mongo secrets belong on the server. Do not put any private keys in the mobile `.env`.

**iOS ATS:** `Info.plist` uses `NSAllowsArbitraryLoads=false` and `NSAllowsLocalNetworking=true` for dev.

**Android:** Hermes is on (`gradle.properties`). Release builds enable R8/ProGuard (`android/app/build.gradle`).

**Production JS:** Babel strips `console.*` except `console.error` when `BABEL_ENV=production` (release bundles).

Scan history: `git log -p --all -S "secret_substring"`

## Scripts

- `npm run lint`
- `npm test`
