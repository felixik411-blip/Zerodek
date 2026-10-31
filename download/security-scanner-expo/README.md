# Security Scanner — Welcome Screen (Expo + React Native)

The first screen of the Android security scanner, implemented with the exact
`SecurityScannerWelcomeScreen.tsx` code from the design hand-off.

## Run it

```bash
npm install
npx expo install --fix   # aligns library versions with the installed Expo SDK
npx expo start           # scan the QR code with the Expo Go app, or press `a` for Android
```

## Files

| File | Purpose |
| --- | --- |
| `SecurityScannerWelcomeScreen.tsx` | The welcome screen (exact code from the design hand-off) |
| `App.tsx` | Renders the welcome screen |
| `index.ts` | Expo entry point (`registerRootComponent`) |
| `app.json` | Expo app configuration |
| `package.json` | Dependencies (Expo SDK 58 aligned) |

## Scope

This implements the welcome UI only, per the product decisions document:

- File scanning, URL checking, quarantine management, and navigation are **not**
  part of this screen and must be implemented separately.
- The `Get started` button currently does nothing — its handler contains the
  `TODO` to connect the onboarding/scanner route when it exists.
- The illustration is built entirely with React Native views and Expo icons, so
  it needs no image assets.

## Design system (from the product decisions, section 10)

- Navy/charcoal base (`#1D3049`, `#17283E`), light surfaces (`#F8FAFD`), one blue accent (`#1877F2`).
- Green is used only for positive results, large tap targets, and plain-language text.
- Privacy message on screen: "Files stay on your phone by default."
