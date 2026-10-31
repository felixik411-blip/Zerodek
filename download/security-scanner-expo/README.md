# Security Scanner — Screens 1 & 2 (Expo + React Native)

The first two screens of the Android security scanner:

1. **Welcome screen** — from the `SecurityScannerWelcomeScreen.tsx` design hand-off, plus the interactive and UI states added during review (see below).
2. **Dashboard screen** — from the `SecurityScannerDashboard.tsx` design hand-off, used exactly as supplied (it already ships with its own states: URL input, notices, active nav, pressed feedback).

## Run it

```bash
npm install
npx expo install --fix   # aligns library versions with the installed Expo SDK
npx expo start           # scan the QR code with the Expo Go app, or press `a` for Android
```

By default `App.tsx` shows the welcome screen. To preview the dashboard instead,
swap the import:

```tsx
import SecurityScannerDashboard from './SecurityScannerDashboard';

export default function App() {
  return <SecurityScannerDashboard />;
}
```

## Files

| File | Purpose |
| --- | --- |
| `SecurityScannerWelcomeScreen.tsx` | Screen 1: welcome (hand-off design + interactive states) |
| `SecurityScannerDashboard.tsx` | Screen 2: dashboard (hand-off code, byte-identical) |
| `App.tsx` | Renders the welcome screen (swap to preview the dashboard) |
| `index.ts` | Expo entry point (`registerRootComponent`) |
| `app.json` | Expo app configuration |
| `package.json` | Dependencies (Expo SDK 58 aligned) |

## Dashboard scope (from the hand-off's own notes)

- Implements the dashboard UI and basic local interactions: URL input, notices,
  and highlighting the selected sidebar item.
- It does **not** perform real malware scans or URL reputation checks. Connect a
  scanner backend / native scanning implementation before presenting results as real.
- History, Quarantine, and Settings show a notice — their full screens are
  outside this component.
- The sidebar appears on wide layouts (width ≥ 1100); on narrow layouts the
  brand moves into the top bar.
- The scan table contains sample data matching the reference design.

## Welcome screen: interactive & UI states (added during review)

Per the design brief section 10A — "Show clear loading, empty, error, and
confirmation states where relevant":

| State | Behaviour |
| --- | --- |
| Idle | Button: "Get started" with arrow icon (unchanged from hand-off) |
| Pressed / hover | Slight opacity + scale feedback (from the hand-off `Pressable` style) |
| Keyboard focus | Subtle scale + shadow emphasis, announced to screen readers |
| Loading | Spinner + "Getting started…", button disabled (`busy` accessibility state), double-tap safe |
| Confirmation | Calm blue card with a green check: "You're all set for now — the next step (scanner screen) isn't connected in this preview yet." Exposed as an `alert` role (aria-live) |
| Navigation (connected) | When the optional `onGetStarted` prop is passed, the loading state shows and the callback runs — the web preview wires it to the dashboard screen, so Get started goes there for real |
| Error / empty | Not applicable to a welcome screen — no fake errors are shown, per the honesty rules in the product decisions document |

The added states keep the hand-off design system: one blue accent, green only
for positive results, plain-language text, and no unsupported claims.

### Wiring Get started in the Expo app

The component stays navigator-agnostic. When you add React Navigation (or
Expo Router), connect it like this:

```tsx
<SecurityScannerWelcomeScreen onGetStarted={() => navigation.navigate('Dashboard')} />
```

Until then, `App.tsx` renders the screen without the prop and the honest
loading + confirmation states apply (the `TODO` comment remains in the code).

## Design system (from the product decisions, section 10)

- Navy/charcoal base (`#1D3049`, `#17283E`), light surfaces (`#F8FAFD`), one blue accent (`#1877F2`).
- Green is used only for positive results, large tap targets, and plain-language text.
- Privacy message on screen: "Files stay on your phone by default."
