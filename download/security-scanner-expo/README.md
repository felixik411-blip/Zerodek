# Security Scanner — Welcome Screen (Expo + React Native)

The first screen of the Android security scanner, implemented from the
`SecurityScannerWelcomeScreen.tsx` design hand-off, plus the interactive and
UI states added during review (see below).

## Run it

```bash
npm install
npx expo install --fix   # aligns library versions with the installed Expo SDK
npx expo start           # scan the QR code with the Expo Go app, or press `a` for Android
```

## Files

| File | Purpose |
| --- | --- |
| `SecurityScannerWelcomeScreen.tsx` | The welcome screen (hand-off design + interactive states) |
| `App.tsx` | Renders the welcome screen |
| `index.ts` | Expo entry point (`registerRootComponent`) |
| `app.json` | Expo app configuration |
| `package.json` | Dependencies (Expo SDK 58 aligned) |

## Scope

This implements the welcome UI only, per the product decisions document:

- File scanning, URL checking, quarantine management, and navigation are **not**
  part of this screen and must be implemented separately.
- The `Get started` handler still contains the `TODO` to connect the
  onboarding/scanner route when it exists. Until then it shows the honest
  loading + confirmation states instead of navigating.
- The illustration is built entirely with React Native views and Expo icons, so
  it needs no image assets.

## Interactive & UI states (added during review)

Per the design brief section 10A — "Show clear loading, empty, error, and
confirmation states where relevant":

| State | Behaviour |
| --- | --- |
| Idle | Button: "Get started" with arrow icon (unchanged from hand-off) |
| Pressed / hover | Slight opacity + scale feedback (from the hand-off `Pressable` style) |
| Keyboard focus | Subtle scale + shadow emphasis, announced to screen readers |
| Loading | Spinner + "Getting started…", button disabled (`busy` accessibility state), double-tap safe |
| Confirmation | Calm blue card with a green check: "You're all set for now — the next step (scanner screen) isn't connected in this preview yet." Exposed as an `alert` role (aria-live) |
| Error / empty | Not applicable to a welcome screen — no fake errors are shown, per the honesty rules in the product decisions document |

The added states keep the hand-off design system: one blue accent, green only
for positive results, plain-language text, and no unsupported claims.

## Design system (from the product decisions, section 10)

- Navy/charcoal base (`#1D3049`, `#17283E`), light surfaces (`#F8FAFD`), one blue accent (`#1877F2`).
- Green is used only for positive results, large tap targets, and plain-language text.
- Privacy message on screen: "Files stay on your phone by default."
