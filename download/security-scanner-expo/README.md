# Security Scanner — Screens 1–10 (Expo + React Native)

The first ten screens of the Android security scanner:

1. **Welcome screen** — from the `SecurityScannerWelcomeScreen.tsx` design hand-off, plus the interactive and UI states added during review (see below), and "Get started" wired to the dashboard via an optional `onGetStarted` prop.
2. **Dashboard screen** — from the `SecurityScannerDashboard.tsx` design hand-off. The Home screen content is unchanged from the hand-off; the sidebar now switches to three **real sub-screens** (History, Quarantine, Settings) built to the product decisions doc, instead of the hand-off's "not included yet" notices.
3. **File-selection screen** — `SecurityScannerFileSelectionScreen.tsx`, byte-identical to the design hand-off (`upload/3.md`). Sample file list with tabs, row selection, "Browse device" via the native document picker, and honest scanner notices.
4. **Scan-progress screen** — `SecurityScannerScanProgressScreen.tsx`, byte-identical to the design hand-off (`upload/4.md`). Live progress ring + bar demo, honest "this is placeholder UI, not a real scan" messaging, cancel and finish states, and optional `onBackHome` / `onCancel` / `onScanComplete` callbacks for the app shell.
5. **Scan-result screen** — `SecurityScannerResultScreen.tsx`, byte-identical to the design hand-off (`upload/5.md`). "Threat found" result card, file metadata, quarantine explainer, next steps, and View quarantine / Delete permanently (confirm first) / Scan another actions with optional callbacks.
6. **Website-link screen** — `WebsiteLinkScreen.tsx`, byte-identical to the design hand-off (`upload/6.md`). URL input with inline validation, Paste from clipboard (`expo-clipboard`), example chips, honest "this cannot guarantee a website is safe" messaging, and `onBackHome` / `onCheckLink` callbacks.
7. **Link-scan-result screen** — `LinkScanResultScreen.tsx`, byte-identical to the design hand-off (`upload/7.md`). "Likely dangerous" verdict card for a checked URL, copy/open-link actions, what-we-checked list, scan details, and Check-another-link / Back-to-Home actions with optional callbacks.
8. **Quarantined-files screen** — `QuarantineScreen.tsx`, byte-identical to the design hand-off (`upload/8.md`). Isolated-files list with search, per-row details, three-dot restore/delete menu with confirmation-first dialogs, live count badge, and `onBackHome` / `onScanFile` / `onViewDetails` callbacks.
9. **Quarantined-file-details screen** — `QuarantineDetailsScreen.tsx`, byte-identical to the design hand-off (`upload/9.md`). Details for a quarantined file: status banner, metadata, scan-before-restoring, permanent-delete confirmation, scan history, and full sidebar navigation (uses `lucide-react-native` + `react-native-svg`).
10. **Scan-history screen** — `ScanHistoryScreen.tsx`, byte-identical to the design hand-off (`upload/10.md`). Chronological list of file scans and link checks with All/Files/Links filters, search, colour + word result statuses, and clickable rows (uses `Ionicons`).

## Run it

```bash
npm install
npx expo install --fix   # aligns library versions with the installed Expo SDK
npx expo start           # scan the QR code with the Expo Go app, or press `a` for Android
```

By default `App.tsx` shows the welcome screen. To preview any of the other
screens instead, swap the import:

```tsx
import SecurityScannerDashboard from './SecurityScannerDashboard';
// or
import SecurityScannerFileSelectionScreen from './SecurityScannerFileSelectionScreen';
// or
import SecurityScannerScanProgressScreen from './SecurityScannerScanProgressScreen';
// or
import SecurityScannerResultScreen from './SecurityScannerResultScreen';
// or
import WebsiteLinkScreen from './WebsiteLinkScreen';
// or
import LinkScanResultScreen from './LinkScanResultScreen';
// or
import QuarantineScreen from './QuarantineScreen';
// or
import QuarantineDetailsScreen from './QuarantineDetailsScreen';
// or
import ScanHistoryScreen from './ScanHistoryScreen';

export default function App() {
  return <ScanHistoryScreen />;
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
| `SecurityScannerScanProgressScreen.tsx` | Screen 4: scan progress (byte-identical to the hand-off) |
| `SecurityScannerResultScreen.tsx` | Screen 5: scan result (byte-identical to the hand-off) |
| `WebsiteLinkScreen.tsx` | Screen 6: website link check (byte-identical to the hand-off) |
| `LinkScanResultScreen.tsx` | Screen 7: link scan result (byte-identical to the hand-off) |
| `QuarantineScreen.tsx` | Screen 8: quarantined files (byte-identical to the hand-off) |
| `QuarantineDetailsScreen.tsx` | Screen 9: quarantined file details (byte-identical to the hand-off) |
| `ScanHistoryScreen.tsx` | Screen 10: scan history (byte-identical to the hand-off) |
| `SettingsScreen.tsx` | Screen 11: settings (byte-identical to the hand-off) |
| `HelpAboutScreen.tsx` | Screen 12: help & about (authored to the brief in `12.md`) |
| `glyphPatches.ts` | Icon glyph aliases (`file-archive` → `zip-box`, `shield-minus` → `shield-remove`), imported first in `App.tsx` |
| `App.tsx` | Renders the welcome screen (swap to preview any of the twelve screens) |
| `index.ts` | Expo entry point (`registerRootComponent`) |
| `app.json` | Expo app configuration |
| `package.json` | Dependencies (Expo SDK 58 aligned, incl. `expo-document-picker`, `expo-clipboard`, `lucide-react-native`, `react-native-svg`) |

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

## Scan-progress screen (screen 4)

Byte-identical to the hand-off. What it does:

- **Demo progress** — starts at 48% and animates to 100% (2% every 350 ms).
  The hand-off marks it clearly: placeholder UI, not a real malware scan.
- **States** — "Checking this file…" while running, "Scan complete" at 100%
  (button flips to a disabled "Finished"), and "Scan cancelled" after Cancel
  (button flips to a disabled "Cancelled").
- **File header** — takes optional `fileName` / `fileType` / `fileSize` props
  (defaults: `Project_Proposal.pdf`, PDF document, 2.4 MB). The web preview
  passes the file chosen on the file-selection screen through query params.
- **Callbacks** — `onCancel`, `onBackHome`, `onScanComplete` are optional;
  wire them to your navigator when it exists. In the web preview,
  `onBackHome` returns to the dashboard.
- **Responsive** — sidebar on layouts ≥ 1000px wide; below that the brand
  moves into the top bar.

## Scan-result screen (screen 5)

Byte-identical to the hand-off. What it does:

- **Result card** — "Threat found" banner (sample result content, as the
  hand-off notes: only show it when the scanner really detected a threat),
  file summary, scan date/type/result metadata, "What happened?" explainer,
  and the quarantined banner.
- **Delete permanently** — asks for confirmation first (`Alert.alert` on
  native; the web preview bridges it to a browser confirm dialog). On
  confirm the card flips to the hand-off's "File deleted" state; the
  `onDeletePermanently` callback is where real file storage removal goes.
- **View quarantine** — `onViewQuarantine` callback; the web preview
  deep-links to the dashboard's Quarantine sub-screen.
- **Scan another file** — `onScanAnother` callback; the web preview returns
  to the file-selection screen.
- **File details** — configurable via `fileName` / `fileType` / `fileSize` /
  `scanDate` / `scanTime` props (defaults match the hand-off sample). The
  web preview passes the scanned file's metadata through query params.
- **Responsive** — two-column layout (result + side cards) on wide screens;
  stacked single column, stacked action buttons and stacked metadata below
  1000px.

## Website-link screen (screen 6)

Byte-identical to the hand-off. What it does:

- **URL input** — inline validation (HTTP/HTTPS + hostname with a dot), the
  error shows only once you've attempted a check (or while editing after one),
  and Enter/submits run the same validation.
- **Paste** — reads the device clipboard via `expo-clipboard` (already in
  `package.json`; `npx expo install --fix` will align it). On Android/iOS this
  is the native clipboard; browsers may show a one-time permission prompt and
  can deny reads on insecure origins.
- **Example chips** — fill the input for UI testing; the hand-off notes they
  are not claims about those websites' safety.
- **Check link** — calls `onCheckLink(url)` with the validated URL. The
  hand-off deliberately does NOT decide the result: connect your real URL
  reputation/scanning service there. In the web preview, a valid check now
  forwards the URL and the live check timestamp to the link-scan-result
  screen (screen 7); an invalid one shows the validation error.
- **Back to Home** — `onBackHome` callback; the web preview returns to the
  dashboard, and the dashboard's "Check a link" card routes here.
- **Responsive** — sidebar on layouts ≥ 900px wide; below that the brand
  moves into the top bar.

## Link-scan-result screen (screen 7)

Byte-identical to the hand-off. What it does:

- **Verdict card** — "Likely dangerous" banner and recommendation copy are the
  hand-off's sample result; connect a real URL reputation service to drive the
  actual verdict, as the hand-off notes.
- **Link actions** — Copy writes the URL to the clipboard via `expo-clipboard`
  and flips to "Copied" (with an `Alert.alert` confirmation on native; the web
  preview bridges it to a browser dialog). The external-link button shows a
  caution dialog and intentionally does NOT open the flagged URL.
- **What we checked / Scan details** — checklist and metadata grid, including
  the checked URL and the `checkedAt` timestamp.
- **Props** — `url` / `checkedAt` are optional (defaults match the hand-off
  sample). The web preview passes the URL typed on screen 6 through query
  params, plus a live "Nov 2, 2026  •  10:24 AM"-style timestamp.
- **Callbacks** — `onBackHome` and `onCheckAnotherLink` are optional; in the
  web preview they return to the dashboard and to the website-link screen.
- **Responsive** — sidebar on layouts ≥ 900px wide; the top grid, details grid
  and action buttons stack below that.

## Quarantined-files screen (screen 8)

Byte-identical to the hand-off. What it does:

- **List** — the two sample quarantined files from the hand-off, with type
  icons, quarantine date/time, and colour + word status ("Threat found" red /
  "Suspicious" orange — never colour alone). The sidebar badge shows the live
  count and updates as rows are removed.
- **Search** — filters by name, description, type, status and reason; an
  x-circle button clears the field; an empty result shows the hand-off's "No
  matching files" state with its own Clear-search button.
- **View details** — `onViewDetails(file)` callback (falls back to an
  `Alert.alert` summary when the callback isn't provided). In the web preview
  it navigates to the quarantined-file-details screen (screen 9), whose
  hand-off shows the same sample file; connect your real details/route here
  per file if you need per-row content.
- **Three-dot menu** — Restore file and Delete permanently, both asking for
  confirmation first (`Alert.alert` on native; the web preview bridges it to
  a browser dialog). Restore shows the hand-off's honest "no real file was
  restored" follow-up notice; delete removes the row from the demo list. Per
  the hand-off notes, connect a native quarantine service before treating
  these as real security operations.
- **Scan a file** — `onScanFile` callback; the web preview goes to the
  file-selection screen.
- **Responsive** — sidebar on layouts ≥ 950px wide; below that the table
  columns stack per-row and the search box moves under the count.

## Quarantined-file-details screen (screen 9)

Byte-identical to the hand-off. What it does:

- **Summary** — sample file header (Project_Proposal.pdf, PDF, 2.4 MB — the
  hand-off's own sample data) with the red "Quarantined" banner, plus the
  quarantined-on date, reason and current-state metadata card.
- **Scan before restoring** — "Scan and check" shows the hand-off's
  placeholder `Alert.alert` ("connect your scanner service..."); connect a
  real scan service and only offer restore per your security policy.
- **Delete permanently** — confirmation dialog first (`Alert.alert` on
  native; the web preview bridges it to a browser dialog), then the
  hand-off's honest "demo action" notice — no real file is deleted until
  your native quarantine service is connected.
- **Scan history** — the initial-scan entry with the "Threat found" pill.
- **Navigation** — `onBack` / `onOpenQuarantine` return to the quarantined
  files list (screen 8), `onHome` to the dashboard, and `onHistory` /
  `onSettings` deep-link into the dashboard's internal History / Settings
  sub-screens via the `?view=` bridge.
- **Dependencies** — this hand-off uses `lucide-react-native` with
  `react-native-svg` (already in `package.json`; `npx expo install --fix`
  aligns versions). On web, react-native-svg needs `@react-native/assets-registry`.
- **Responsive** — sidebar always rendered by the hand-off (desktop-first,
  per its notes); the web preview's glue CSS hides it below 900px and
  relaxes the hand-off's desktop min-widths so phones don't overflow.

## Scan-history screen (screen 10)

Byte-identical to the hand-off. What it does:

- **Records** — the eight sample scans from the hand-off (files + links,
  Oct 26–30), each with date/time, item icon, size subtitle, and a colour +
  word result pill ("Threat found", "No known threat", "Likely dangerous",
  "Needs your review", "Could not decide" — never colour alone).
- **Filters and search** — All / Files / Links chips combine with the search
  field (matches item, type, result and detail); an empty result shows the
  hand-off's empty state with a Clear-filters button.
- **Clickable rows** — the hand-off's `openRecord()` is a console.log stub;
  the hand-off notes say to connect rows to the file/link result screens
  "when those routes are ready". In the web preview they are, so the glue
  bridge routes File rows to the scan-result screen (screen 5, carrying
  name/size/date/time) and Link rows to the link-scan-result screen
  (screen 7, carrying URL + checked-at timestamp).
- **Sidebar** — the hand-off's `navigate()` is also a stub; the glue bridge
  routes Home to the dashboard, Quarantine to the quarantined-files screen
  (screen 8) and Settings into the dashboard's internal Settings view.
- **Dependencies** — uses `Ionicons` from `@expo/vector-icons` (already in
  `package.json`). On web, the Ionicons font file and @font-face rule ship
  with the preview app.
- **Responsive** — the sidebar hides below 900px (hand-off behaviour), the
  table becomes stacked cards, and a menu placeholder appears in the top
  bar; connect it to your navigation drawer when one exists.

## Settings screen (screen 11)

Byte-identical to the hand-off. What it does:

- **Notifications** — the "Enable notifications" switch is live local state
  (`notificationsEnabled`, on by default) with the hand-off's track colours.
- **Quarantine retention** — live local state (`retentionDays`, 30 by
  default) reflected in "Current retention period" and the auto-delete
  sentence. The hand-off wires the "Delete quarantined files" action to
  toggle the period 30 ↔ 14 as a placeholder demo; its own note says to
  connect that action to the app's real screens, so the web preview bridges
  it to the quarantined-files screen (screen 8), where deletion actually
  lives. In this package you may keep the demo toggle or replace the
  `onPress` with a call into your quarantine storage.
- **Sidebar** — Home, History, Quarantine (badge "2") and Settings (active).
  The hand-off renders the items without `onPress`; in the web preview a
  glue bridge routes them to the dashboard, scan-history (screen 10) and
  quarantined-files (screen 8) screens.
- **Placeholders by design** — "Learn more about our privacy", "Terms of
  service" and "Privacy policy" render as tappable rows with no navigation,
  exactly as the hand-off ships them.
- **Dependencies** — uses `lucide-react-native`, which requires
  `react-native-svg`; both are already in `package.json` (screen 9).
- **Responsive** — the sidebar shows at ≥900px; below that the hand-off
  renders a compact top bar. Note the hand-off keeps its root container in
  `flexDirection: "row"` at every width, so on narrow screens the top bar
  sits beside the content and the fixed 74/76px card indents squeeze the
  columns. The web preview compensates with glue-only CSS in
  `SettingsPreview.tsx` (stacked top bar and card rows); this package keeps
  the hand-off file byte-identical, so on a device it renders as written.

## Help & About screen (screen 12)

Authored to the implementation brief (`12.md`) — this hand-off defines
requirements and copy instead of shipping code, so the screen was written to
the app's shared design system. What it does:

- **Search** — live case-insensitive filter over each topic's title,
  description and answer text, per the brief. No matches shows the compact
  empty state ("No help topics found." + a muted hint). It filters only the
  five local topics; no knowledge base is claimed.
- **Topics** — the five cards from the brief with their accent tiles (blue
  shield, green document, orange archive, purple link, teal lock). Tapping a
  card opens an in-screen detail panel (title + answer, paragraphs and
  labelled bullets) with a "Back to topics" control.
- **Sidebar** — Home, History, Quarantine (badge "2"), Settings and
  Help & About (active). The brief says to accept navigation callbacks as
  props, so the screen takes `onNavigate(destination)`; the web preview
  wires it to the dashboard, scan-history, quarantined-files and settings
  routes. In your Expo app pass your navigator's calls.
- **Footer card** — two columns split by a thin divider: App version 1.0.0,
  and "Need more help?" with the support email rendered blue and selectable
  (styled text, as the brief permits — no mailto navigation).
- **Dependencies** — `lucide-react-native` only (already in
  `package.json`); all icon names verified against the installed version,
  including the `History` and `HelpCircle` export aliases.
- **Responsive** — authored correctly at both sizes: sidebar at ≥900px, and
  below that the root switches to a column with a compact top bar, stacked
  footer and 16px gutters. Unlike screen 11, no glue CSS is needed in the
  preview.

## Known notes

- The hand-off references the icon name `file-archive`, which does not exist
  in the MaterialCommunityIcons glyphmap (7,448 names checked — the closest
  real glyph is `zip-box`). Without a fix the two ZIP rows render a "?"
  fallback glyph. `glyphPatches.ts` (imported first in `App.tsx`) aliases
  `file-archive` → `zip-box` at runtime so the intended archive icon renders,
  **without touching the byte-identical screen code**. If you'd rather change
  the design source, replace `'file-archive'` with `'zip-box'` in the screen
  and delete the patch file.
- Same situation on the scan-result screen: the hand-off uses `shield-minus`,
  which also does not exist in the glyphmap. `glyphPatches.ts` aliases it to
  the real minus-shield glyph `shield-remove` (Material Design Icons names
  "minus" "remove"), again without touching the byte-identical screen code.
- On Android/iOS `Alert.alert` is the real native dialog. react-native-web's
  `Alert` is a silent no-op, which the web preview bridges to a browser
  confirm dialog — not part of this Expo package.

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
