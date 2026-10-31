# Security Scanner — Screens 1–3 (Expo + React Native)

The first three screens of the Android security scanner:

1. **Welcome screen** — from the `SecurityScannerWelcomeScreen.tsx` design hand-off, plus the interactive and UI states added during review (see below), and "Get started" wired to the dashboard via an optional `onGetStarted` prop.
2. **Dashboard screen** — from the `SecurityScannerDashboard.tsx` design hand-off. The Home screen content is unchanged from the hand-off; the sidebar now switches to three **real sub-screens** (History, Quarantine, Settings) built to the product decisions doc, instead of the hand-off's "not included yet" notices.
3. **File-selection screen** — `SecurityScannerFileSelectionScreen.tsx`, byte-identical to the design hand-off (`upload/3.md`). Sample file list with tabs, row selection, "Browse device" via the native document picker, and honest scanner notices.

## Run it

```bash
npm install
npx expo install --fix   # aligns library versions with the installed Expo SDK
npx expo start           # scan the QR code with the Expo Go app, or press `a` for Android
```

By default `App.tsx` shows the welcome screen. To preview the dashboard or the
file-selection screen instead, swap the import:

```tsx
import SecurityScannerDashboard from './SecurityScannerDashboard';
// or
import SecurityScannerFileSelectionScreen from './SecurityScannerFileSelectionScreen';

export default function App() {
  return <SecurityScannerDashboard />; // or <SecurityScannerFileSelectionScreen />
}
```

Keep `import './glyphPatches';` as the first import in `App.tsx` (see
"Known notes" below).

## Files

| File | Purpose |
| --- | --- |
| `SecurityScannerWelcomeScreen.tsx` | Screen 1: welcome (hand-off design + interactive states) |
| `SecurityScannerDashboard.tsx` | Screen 2: dashboard (hand-off Home + real History/Quarantine/Settings sub-screens) |
| `SecurityScannerFileSelectionScreen.tsx` | Screen 3: file selection (byte-identical to the hand-off) |
| `glyphPatches.ts` | Icon glyph alias (`file-archive` → `zip-box`), imported first in `App.tsx` |
| `App.tsx` | Renders the welcome screen (swap to preview the dashboard or file selection) |
| `index.ts` | Expo entry point (`registerRootComponent`) |
| `app.json` | Expo app configuration |
| `package.json` | Dependencies (Expo SDK 58 aligned, incl. `expo-document-picker`) |

## Dashboard scope

**Home (unchanged from the hand-off):** dashboard UI with URL input, notices,
sidebar highlighting, sample scan table.

**New sub-screens** (built to the product decisions doc, §3 and §10B screens 8/10/11):

- **History** — chronological list of file scans and link checks, "All / Files /
  Links" filters, status icons + words (never colour alone), empty state, and a
  notice if a record's details aren't saved yet.
- **Quarantine** — isolated-items list with lock icons, quarantine date, and the
  auto-purge date computed from the configurable retention period (30-day
  default). Restore and Delete demonstrate the confirmation-first pattern:
  permanent deletion asks first, then reports honestly that the quarantine
  service isn't connected in this preview yet — nothing is faked.
- **Settings & privacy** — grouped Privacy / Quarantine retention / App
  information sections. Files-stay-on-your-phone policy, retention chooser
  (14/30/90 days) that propagates to the Quarantine screen, expiry warning
  toggle. **No cloud-upload controls** — per the rulebook, they must not appear
  until a real cloud-analysis feature with a consent flow exists.
- **Mobile bottom navigation** — on narrow layouts the sidebar is hidden, so a
  bottom tab bar (Home / History / Quarantine / Settings, with the badge) was
  added, as required by the design brief §10A "main mobile navigation".

**Still honest by design:** no real malware scanning or URL reputation checking
happens — actions that need the scanner backend or native quarantine service
show plain-language notices instead of pretending to succeed. The retention and
notification controls work locally but are not persisted yet.

- The sidebar appears on wide layouts (width ≥ 1100); on narrow layouts the
  brand moves into the top bar and navigation moves to the bottom tab bar.
- The scan table contains sample data matching the reference design.

## File-selection screen (screen 3)

Byte-identical to the hand-off. What it does:

- **Tabs** — Recent files / Documents / Images / Downloads, each with its own
  sample rows; switching tabs clears the selection.
- **Row selection** — tapping a row highlights it and shows the radio dot plus
  a "Selected: <name>" chip.
- **Browse device** — opens the native document picker (`expo-document-picker`,
  already added to `package.json`; `npx expo install --fix` will align it).
  Picking a file selects it and shows a confirmation message.
- **Scan selected file** — with a selection it reports that the scanning
  engine isn't connected yet ("Connect your scanning engine to perform an
  actual threat scan."); with none it asks you to pick a file first. Nothing
  is faked, per the product decisions doc.
- **Cancel / Back to Home** — sidebar pages and Home are still placeholders in
  this component; the hand-off shows a plain-language notice instead.
- **Responsive** — sidebar on layouts ≥ 1000px wide; below that the brand
  moves into the top bar.

## Known notes

- The hand-off references the icon name `file-archive`, which does not exist
  in the MaterialCommunityIcons glyphmap (7,448 names checked — the closest
  real glyph is `zip-box`). Without a fix the two ZIP rows render a "?"
  fallback glyph. `glyphPatches.ts` (imported first in `App.tsx`) aliases
  `file-archive` → `zip-box` at runtime so the intended archive icon renders,
  **without touching the byte-identical screen code**. If you'd rather change
  the design source, replace `'file-archive'` with `'zip-box'` in the screen
  and delete the patch file.

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
