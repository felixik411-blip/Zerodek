# Security Scanner — Screens 1–17 (Expo + React Native)

The first seventeen screens of the Android security scanner:

1. **Welcome screen** — from the `SecurityScannerWelcomeScreen.tsx` design hand-off, plus the interactive and UI states added during review (see below), and "Get started" wired to the dashboard via an optional `onGetStarted` prop. Below the hero it now carries a **Security overview dashboard band** (scans, threats, links checked, scans remaining, recent activity, protection toggle, quick actions — see the welcome section).
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
| `AdminSignInScreen.tsx` | Screen 13: admin sign-in (authored to the brief in `13.md`) |
| `AdminDashboardScreen.tsx` | Screen 14: admin dashboard (byte-identical to the hand-off in `14.md`) |
| `UserManagementScreen.tsx` | Screen 15: user management (byte-identical to the hand-off in `15.md`) |
| `ThreatInformationScreen.tsx` | Screen 16: threat information management (byte-identical to the hand-off in `16.md`) |
| `HelpContentScreen.tsx` | Screen 17: help content management (byte-identical to the hand-off in `17.md`) |
| `glyphPatches.ts` | Icon glyph aliases (`file-archive` → `zip-box`, `shield-minus` → `shield-remove`, Feather `shield-check` → `shield`, Ionicons `bold` → `text`, Ionicons `italic` → `text-outline`), imported first in `App.tsx` |
| `App.tsx` | Renders the welcome screen (swap to preview any of the seventeen screens) |
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

## Admin sign-in screen (screen 13)

Authored to the implementation brief (`13.md`) — the brief defines
requirements, copy and design tokens instead of shipping code, so the screen
was written to spec. What it does:

- **Two-column desktop layout** — pale-blue Admin Portal panel (46%: brand
  lockup with tagline, browser-window hero illustration composed from plain
  Views + lucide icons, "Admin Portal" copy, three feature rows from one
  typed array) beside a white panel holding the centred sign-in card
  (~554px, thin pale-blue border, 12px radius). A subtle divider separates
  the panels.
- **Form** — email/username and password fields with leading icons, 50px
  height, 7px radius, muted-blue placeholders; password visibility toggle
  (eye/eye-off); right-aligned "Forgot your password?" link; full-width
  "Sign in" button with arrow icon; pale-blue security notice strip with an
  info icon at the bottom of the card.
- **Validation & loading** — empty fields show concise inline errors
  ("Enter your email or username." / "Enter your password.") that clear as
  you type; the button shows a spinner + "Signing in…" and is disabled
  (with `busy` accessibility state) while the injected `onSignIn` callback
  runs; a rejected callback surfaces a concise inline error strip. The
  screen never fabricates a success state, exactly as the brief demands —
  reporting success is the real handler's job.
- **Integration points** — `onSignIn(credentials)` and `onForgotPassword()`
  are optional props; no credentials are stored and no recovery route is
  invented. The web preview wires sign-in to an honest "not connected in
  this preview" rejection (so the loading + error states can be exercised)
  and forgot-password to the existing Help & About screen (the app's
  support surface). In your Expo app pass your real handlers.
- **Dependencies** — `lucide-react-native` only (already in
  `package.json`); no new dependency and no remote image URL (the hero is a
  React Native composition of shapes and icons).
- **Responsive** — two columns at ≥900px; below that the panels stack
  vertically (intro on the pale background, card section in white) in a
  single scrollable view with no horizontal overflow. Tap-outside keyboard
  dismissal is included for mobile.

## Admin dashboard screen (screen 14)

Byte-identical to the code hand-off in `14.md`. What it does and how it is
wired:

- **Desktop layout (≥1100px)** — navy sidebar (brand, six nav items,
  footer card), white top bar (menu, bell with red dot, AD admin account),
  and a dashboard page: heading with a period dropdown, five metric cards
  (Service Health / Total Scans / File Scans / Link Checks / Recent
  Errors), the Recent Activity table (7 sample rows with type and result
  pills), a Service Status panel (5 services, all Operational) and an
  Alerts panel (3 sample alerts).
- **Built-in interactions (from the hand-off)** — the period dropdown opens
  and selects Today / Last 7 days / Last 30 days / This year (label only,
  per the brief — it does not refetch metrics); every control gives inline
  feedback through a dismissable notice strip (nav without a route,
  bell, admin menu, activity rows, "View all").
- **Wired to the real app (glue, not in the hand-off)** — the web preview
  wraps the screen in a click-capture bridge: sidebar Dashboard / Scans /
  Quarantine / Settings / Help & Support route to the real dashboard,
  scan-history, quarantine, settings and help-about screens; activity rows
  and the Recent Activity "View all" route to scan-history. Sidebar clicks
  are told apart from the "Dashboard" page title via the sidebar's navy
  background colour. "Users" and the Alerts "View all" keep the hand-off's
  honest notices (no such screens exist).
- **Icon glyph alias** — the hand-off names the Feather icon
  `shield-check` (Service-Health metric), which does not exist in the
  Feather glyphmap (only `shield`/`shield-off`); `glyphPatches.ts` aliases
  it to `shield` without touching the byte-identical screen code.
- **Responsive** — below 1100px the sidebar disappears (mobile brand in
  the top bar), metrics wrap and the panels stack, per the hand-off. One
  web-preview glue rule (media query only, hand-off untouched): the
  activity table cannot shrink below its `numberOfLines={1}` contents, so
  on a 390px viewport the Result column was silently clipped — the panel
  now scrolls sideways instead, keeping every column reachable.

## User-management screen (screen 15)

Byte-identical to the code hand-off in `15.md`. What it does and how it is
wired:

- **Desktop layout (≥900px)** — navy sidebar (brand, six nav items, System
  Healthy footer), white top bar (menu, bell with red dot, AD admin
  account), and a user-management page: heading with a people icon tile, a
  dismissable notice strip, a toolbar (search, status filter, Export), the
  users table (User / Status / Role / Joined On / Last Active / Actions,
  5 sample users with status + role pills), pagination footer, and an
  Audit Trail card (3 sample rows, "View all logs").
- **Built-in interactions (from the hand-off)** — live search across name,
  email and role with a "No users found" empty state; the status filter
  dropdown (All Statuses / Active / Disabled) filters the table; View
  opens a detail dialog (avatar, email, status/role/joined/last-active
  rows); the row ⋯ menu offers View details plus Disable account (red) or
  Re-enable account (green) guarded by a confirmation dialog; disabling
  and re-enabling actually flip the user's status pill in the table and
  fire a dismissable notice; Export CSV/JSON and every nav-without-a-route
  control show honest inline notices (the integration notes leave export
  as a connect-later point — no export service is faked).
- **Wired to the real app (glue, not in the hand-off)** — the web preview
  wraps the screen in a click-capture bridge: sidebar Dashboard / Scans /
  Quarantine / Settings / Help & Support route to the real dashboard,
  scan-history, quarantine, settings and help-about screens (matched by
  suffix against the sidebar's navy background, as in screen 14). "Users"
  is this screen itself, so it keeps the hand-off's honest notice.
- **Icon glyphs** — all 20 Ionicons names and the MaterialCommunityIcons
  `shield-check` used by this hand-off exist in the installed glyphmaps
  (verified programmatically), so no `glyphPatches.ts` alias is needed for
  this screen.
- **Responsive** — below 900px the hand-off's own `compact` mode collapses
  the sidebar to a 70px icon rail, stacks the toolbar, and keeps the tables
  at their 930/900px minimums inside horizontal ScrollViews, per the
  integration notes. The detail and confirmation dialogs fit a 390px
  viewport with 20px margins.
- **Web-preview glue (hand-off untouched)** — two rules in the preview
  wrapper only: (1) on desktop the tables' `width: "100%"` resolves
  against the horizontal ScrollView's shrink-wrapped content container, so
  the content container is stretched to the card's real width (the
  hand-off's `compact` breakpoint is respected below 900px); (2)
  react-native-web gives every relatively-positioned view a default
  z-index 0, which trapped the row dropdown (z-index 30) inside its own
  row's stacking context so later rows painted over it — while a row menu
  is open, the ancestors between the table card and the dropdown are
  neutralised so the dropdown renders above the rows below it.

## Threat-information screen (screen 16)

Byte-identical to the code hand-off in `16.md`. What it does and how it is
wired:

- **Desktop-style admin layout** — white top bar (menu, bell with red dot,
  AD admin account), heading with a shield tile, a filter bar (search,
  Type + Status dropdowns, "Add Indicator"), an indicators table card
  (Indicator / Type / Source / Status / Date Added / Last Updated /
  Actions — 12 sample indicators with type pills and status pills) with a
  pagination footer (5 per page), an "Add Threat Indicator" form card on
  the right (value, Type, Source, Status, submit), a Recent Activity card
  (3 sample rows, "View all activity"), and a System Healthy footer.
- **Built-in interactions (from the hand-off)** — live search across value,
  source and type with a "No indicators found" empty state; the Type and
  Status dropdowns filter the table (and reset to page 1); the add form
  validates (missing value/type/source, duplicate detection) and prepends
  the new indicator with today's dates; every row's ⋮ menu cycles the
  status (Active → Pending → Blocked, stamping Last Updated), opens a
  details dialog, or removes the row behind a "Remove indicator?"
  confirmation; the table paginates with prev/next and page-number
  buttons and a live "Showing x–y of z" counter. Notifications, the admin
  account, the filter bar's "Add Indicator" placeholder and "View all
  activity" show honest alerts instead of fake screens.
- **Icon glyphs** — all 23 Ionicons names used by this hand-off exist in
  the installed glyphmap (verified programmatically), so no
  `glyphPatches.ts` alias is needed for this screen.
- **Wired to the real app (glue, not in the hand-off)** — the web preview
  wraps the screen in a click-capture bridge: the top-bar menu button —
  the hand-off's own "Connect your admin drawer here." integration point —
  routes to the admin dashboard screen (14), and the filter bar's "Add
  Indicator" button scrolls to and focuses the form's Indicator Value
  input instead of dead-ending in an alert (the form's own submit button,
  which reads the same, is told apart by document order and passes
  through). The hand-off's alert still fires for the menu button, as with
  screens 14/15 (capture-phase bridge, bubble-phase notice). Everything
  else stays inside the screen.
- **Responsive** — the table's columns are fixed-width (824px total) and
  scroll horizontally inside the card, per the hand-off; its own notes
  recommend stacking the table and form for narrow phones.
- **Web-preview glue (hand-off untouched)** — react-native-web gives every
  View a default `z-index: 0` stacking context, which (a) let later rows
  paint over an open row ⋮ menu, (b) let the Recent Activity card paint
  over menus spilling past their card's bottom edge (raising the cards
  alone cannot fix this — their z-index is trapped inside `mainRow`'s
  context, so `mainRow` itself is raised while a menu is open), (c) let
  later add-form picker wraps paint over an open options menu, and (d)
  computed the table's horizontal ScrollView `overflow-y: hidden`, which
  clipped a bottom row's menu at the card's edge — released at ≥1240px
  viewports, where the table never needs the horizontal scroll (below
  that it clips exactly as it does inside a native horizontal ScrollView).
  One more rule re-raises the filter bar above the raised `mainRow` while
  its own dropdown is open, preserving the hand-off's native stacking when
  two menus are open at once.

## Help-content screen (screen 17)

Byte-identical to the code hand-off in `17.md`. What it does and how it is
wired:

- **Desktop-style admin layout** — dark sidebar (brand shield, seven nav
  items with "Help Content" active, System Healthy card, version), white
  top bar (menu, bell with red dot, AD admin account), page header with a
  book tile and "New Article" button, four content tabs (Articles / FAQs /
  Security Tips / Announcements), an articles table card (Title / Status /
  Last Updated / Actions — 6 sample articles with published/draft pills,
  live "Showing x–y of z" footer), an editor panel (title input, rich-text
  toolbar, content area, Preview + Publish Changes, info banner), and a
  preview modal.
- **Built-in interactions (from the hand-off)** — the tabs switch (each
  keeps its own search placeholder); search filters titles and content
  live with a "No content found" empty state; clicking a row or its edit
  button loads it into the editor; "New Article" empties the form into
  new-article mode and the published item is prepended on publish;
  "Publish Changes" validates (missing title/content) and writes back
  with today's date and a published confirmation; every row's ⋮ menu
  publishes/unpublishes or deletes the article behind the
  "Article actions" dialog, clearing the editor if the open article is
  deleted; the toolbar's Preview button and the Preview button open the
  preview modal (✕ / "Close preview" close it); the other toolbar buttons
  are honest "Connect this formatting action" placeholders. Filter,
  notifications, the admin account and the top-bar menu show honest
  alerts instead of fake screens.
- **Icon glyphs** — every Ionicons name used by this hand-off exists in
  the installed glyphmap except the rich-text toolbar's `bold` and
  `italic` (1,357 names checked — the family has no bold/italic glyphs at
  all). `glyphPatches.ts` aliases `bold` → `text` and `italic` →
  `text-outline` (the closest real typography glyphs, visually distinct
  from each other) at runtime, **without touching the byte-identical
  screen code**.
- **Wired to the real app (glue, not in the hand-off)** — the web preview
  wraps the screen in a click-capture bridge: the sidebar items route to
  the real admin screens (Dashboard → 2, Scans → 10, Quarantine → 8,
  Users → 15, Settings → 11, Threat Intelligence → 16), told apart from
  same-text page content by the sidebar's dark background colour; the
  top-bar menu button — the hand-off's own "Connect this menu to your app
  navigation." integration point, and the same button as screens 14–16 —
  routes to the admin dashboard screen (14). Bridged items suppress the
  hand-off's placeholder alerts with a capture-phase stopPropagation
  (same rationale as screen 16's "Add Indicator" bridge): unlike screens
  14–16, where the placeholder alert is an inline notice or a silent
  no-op, here every placeholder becomes a BLOCKING web confirm dialog
  that would otherwise pop up on every navigation. "Help Content" is this
  screen (marked active in the hand-off), so it keeps the hand-off's
  alert, as do the bell and admin-account buttons (no notifications or
  account screen exists). Everything else stays inside the screen.
- **Responsive** — below the hand-off's own 1050px breakpoint the sidebar
  hides and the two workspace panels stack full-width, per the hand-off.
- **Web-preview glue (hand-off untouched)** — one rule: react-native-web
  compiles the compact panels' `flex: 0` (`panelCompact`) to a definite
  `flex-basis: 0%`, which collapses both stacked panels to their 2px
  borders in the browser (native Yoga cannot resolve the 0% basis
  against the workspace's auto height, so on a device the panels keep
  their natural content height). The preview gives those panels
  `flex-basis: auto`, restoring the intended behaviour; the rule
  self-scopes because the `panelCompact` style only exists below the
  hand-off's own breakpoint. No stacking or clip fixes were needed —
  unlike screens 15/16 this hand-off opens no inline absolute menus (row
  actions are Alert dialogs, the preview is a real Modal), verified with
  elementsFromPoint during review.

## System-health screen (screen 18)

Byte-identical to the code hand-off in `18.md`. What it does and how it is
wired:

- **Desktop-style admin layout** — dark sidebar (brand shield, nine nav
  items with "System Health" active, System Healthy footer card, version),
  white top bar (menu, bell with red dot, AD admin account), page header
  with an activity tile and a "Last 30 days" selector, three metric cards
  (Service Availability 99.8%, Recent Errors 3, Admin Actions 12) with
  decorative sparklines, a "Recent Audit Logs" card (search box, event and
  result filter selects, Time / Event Type / Result / Actor / Details
  columns, six sample rows with Success/Failed pills, a chevron per row
  and a 1…9 pagination footer), and a bottom row with a "Recent Errors"
  panel (three tagged rows) and a "System Status" panel ("All Systems
  Operational" with a status sparkline).
- **Built-in interactions (from the hand-off)** — the search box filters
  the audit rows live across time, event, actor and details, with a
  "No audit logs match your filters." empty state; the event and result
  selects toggle between "All …" and one sample filter each ("Scan
  Completed" / "Failed"); the pagination buttons move the selected page
  (1–9, prev/next, active page highlighted blue) and the "Showing x–y"
  footer tracks the visible rows; sidebar items highlight on tap. All
  data is sample data, per the hand-off's own notes.
- **Icons** — this hand-off uses `lucide-react-native`, whose icons are
  real SVG components (not glyphmap fonts), so no `glyphPatches.ts`
  aliases are needed — the glyphmap checks of screens ≤ 17 don't apply.
- **Wired to the real app (glue, not in the hand-off)** — the web preview
  wraps the screen in a click-capture bridge: the sidebar items route to
  the real admin screens (Dashboard → 2, Scans → 10, Quarantine → 8,
  Users → 15, Settings → 11, Threat Intelligence → 16, Help Content →
  17), told apart from same-text page content by the sidebar's dark
  background colour; "System Health" is this screen itself (marked active
  in the hand-off) and "Audit Logs" is this screen's own table, so both
  keep the hand-off's highlight-only behaviour. The top-bar menu button —
  the same integration point as screens 14–17 — routes to the admin
  dashboard screen (14); it is matched by its "Open menu" accessibility
  label because lucide icons are SVGs with no text glyph to match. The
  hand-off raises no placeholder alerts, so — unlike screen 17 — there is
  nothing to suppress; the bridge only keeps routed clicks from also
  mutating the hand-off's local `active` state right before the route
  change unmounts the screen. The bell, admin account, "Last 30 days"
  selector and the two "View …" links are hand-off placeholders and stay
  as they are (no notifications, account or error-details screens exist).
- **Responsive** — the hand-off's own breakpoints: below 1100px the
  sidebar collapses to a 76px icon rail, the metric cards wrap and the
  panel header stacks its filters under the title; below 760px the
  sidebar moves inside the scroll content and the top bar drops the
  "Admin" name; the audit table keeps its 1060px min-width and scrolls
  horizontally inside the card. The brand text is not guarded at compact
  widths in the hand-off (it clips against the 76px rail on web; native
  Yoga would wrap it letter-by-letter) — left byte-identical, like the
  sample data.
- **Web-preview glue (hand-off untouched)** — none needed: unlike
  screens 15–17 this hand-off opens no inline absolute menus or modals
  (the filters toggle in place, pagination is inline) and its breakpoints
  run off `useWindowDimensions`, which react-native-web wires to the
  visual viewport; verified with an interaction pass and a clean console
  sweep during review.

## Real-time protection screen (screen 19)

Authored to the app's design system (no hand-off was supplied for this
one) using the screen-18 shell: same dark sidebar (#101E30) and top bar,
lucide icons, same 1100px/760px breakpoints. `RealTimeProtectionScreen.tsx`
is the single source; the web copy under `src/components/`
realtimeprotection/ is byte-identical to it. What it does:

- **Master switch hero** — "Real-time protection is ON" with a live
  green shield card; flipping the switch turns the card amber/red
  ("Real-time protection is OFF"), stops the feed and layers, and shows
  a "Resume now" button. While protection is ON, three pause chips
  ("15 minutes" / "1 hour" / "Until tomorrow") pause with an explicit
  notice instead of a bare toggle.
- **Protection layers** — four rows (Download scanning, Link & URL
  checking, Email attachment scanning, Removable drive scanning), each
  its own switch with a live "x of 4 layers active" summary; toggles
  are blocked with an inline notice while protection is paused.
- **Live protection feed** — sample events with Download/Link/Email/USB
  pills and Scanning (pulsing blue) / Clean (green) / Blocked (red)
  status pills; "Simulate event" prepends a row that scans for ~1.4s
  then resolves, bumping the matching stat and (on a block) raising a
  notice; "Clear" empties the feed into an honest empty state.
- **Stats row** — threats blocked, links checked, downloads scanned and
  average scan time, all updating from the feed.
- **Wired to the real app** — sidebar carries the full admin nav
  (including the new items); the web preview bridges it exactly like
  screens 15–18 (suffix match inside the #101E30 sidebar; "Real-Time
  Protection" is this screen), and the top-bar menu button routes to the
  admin dashboard (14) via its "Open menu" accessibility label.

## Privacy-audit screen (screen 20)

Same authored-to-design-system approach as screen 19 (screen-18 shell,
lucide icons, identical breakpoints). `PrivacyAuditScreen.tsx`; the web
copy is byte-identical. What it does:

- **Privacy score card** — score ring + bar with tone logic (amber
  below 80, green at/above, red below 60), a live "x of 6 permission
  groups granted · y apps with access" summary and the audit timestamp.
  "Re-run full audit" runs a ~1.5s animated progress pass and lifts the
  score (+8, plus +4 per still-open revoke recommendation) with an
  "Audit complete" notice.
- **Device permissions** — six groups (Camera, Microphone, Location,
  Contacts, Files & folders, Notifications) with grant/revoke switches,
  Granted/Revoked state text, per-group app counts and last-used times;
  every flip adjusts the score and drops an inline notice.
- **Which app used what** — six sample app rows with risk pills
  (High/Medium/Low) and a "Revoke" button per row; revoking removes the
  row, raises the score by risk (High +5, Medium +3, Low +2, capped at
  99) and clears any recommendation tied to that app. Empty state after
  the last revoke.
- **Recommendations** — actionable rows ("Free Game hasn't used Location
  in 32 days", "Fitness Tracker reads your Contacts", startup apps):
  "Revoke" acts on the matching app row, "Review" dismisses with an
  honest notice; the panel collapses to an empty state when clear.
- **Wired to the real app** — same bridge pattern as screen 19 (full
  admin sidebar, "Privacy Audit" is this screen, menu button routes to
  the admin dashboard).

## App-wide edits for screens 19–20 (user-requested)

At the user's request ("customize the layout, style, do some edits on
the screens and add real-time download/link protection + privacy and
permission audit"), the previously byte-identical screens below were
edited. The exact deltas, so nothing else moves:

- **Admin dashboard (14)** — two new sidebar items ("Real-Time
  Protection" with Feather `zap`, "Privacy Audit" with Feather `eye`;
  same notice-based navigate as the other items) and a new "Protection
  & Privacy" section between the metrics and the content grid: two
  tiles (live-status line for protection, score line for the audit)
  that navigate the same way and route on the web via unique subtitle
  matches in the preview bridge.
- **User management (15)** — two entries appended to the sidebar
  `navItems` array (Ionicons `pulse`, `lock-closed`; both verified in
  the glyphmap). Behaviour unchanged (same inline notice).
- **Help content (17)** — two entries appended to `NAV_ITEMS`
  (Ionicons `pulse-outline`, `lock-closed-outline`). They inherit the
  hand-off's "navigation is not wired" alert, which the web preview
  suppresses and routes, exactly like the other bridged items.
- **System health (18)** — two entries appended to its lucide
  `NAV_ITEMS` (`Zap`, `Lock`) plus the two new imports. No other
  changes.
- The previews of 14/15/17/18 gained the two suffix rules
  (`'Real-Time Protection'` → `/real-time-protection/`,
  `'Privacy Audit'` → `/privacy-audit/`); screen 16 (threat
  information) has no sidebar and was left untouched.

## Known notes

- The hand-off references the icon name `file-archive`, which does not exist
  in the MaterialCommunityIcons glyphmap (7,448 names checked — the closest
  real glyph is `zip-box`). Without a fix the two ZIP rows render a "?"
  fallback glyph. `glyphPatches.ts` (imported first in `App.tsx`) aliases
  `file-archive` → `zip-box` at runtime so the intended archive icon renders,
  **without touching the byte-identical screen code**. If you'd rather change
  the design source, replace `'file-archive'` with `'zip-box'` in the screen
  and delete the patch file.
- The admin-dashboard hand-off (screen 14) names the Feather icon
  `shield-check`, which also does not exist in the Feather glyphmap (only
  `shield` / `shield-off`). `glyphPatches.ts` aliases it to `shield` the
  same way, again without touching the byte-identical screen code.
- The help-content hand-off (screen 17) names the Ionicons icons `bold`
  and `italic`, which do not exist in the Ionicons glyphmap (1,357 names
  checked — no bold/italic family at all). `glyphPatches.ts` aliases
  `bold` → `text` and `italic` → `text-outline` (the closest real
  typography glyphs) the same way, again without touching the
  byte-identical screen code.
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
<SecurityScannerWelcomeScreen
  onGetStarted={() => navigation.navigate('Dashboard')}
  onNavigate={(target) => navigation.navigate(NAV_ROUTE[target])}
/>
```

`onNavigate` receives one of the dashboard band's targets: `scan-history`,
`threat-information`, `website-link`, `file-selection`, `quarantine`,
`settings`, `real-time-protection`, `privacy-audit` or `dashboard`. Until a
navigator exists, `App.tsx` renders the screen without the props and the
honest fallbacks apply (loading + confirmation card for Get started, an
inline notice for dashboard navigation).

### Security overview dashboard band (added later)

Below the hero, the welcome screen now carries a dashboard-style overview of
scans and what's left of the free quota. It reuses the hand-off palette and
icon set, and every element is interactive:

| Element | Behaviour |
| --- | --- |
| Period segmented control | Today / This week / All time switches the stat values and the recent-activity list (`tablist` / `tab` roles, selected state announced) |
| Refresh button | Honest 0.9 s spinner, then the caption reads "Updated just now" — no fake data changes |
| Scans completed / Threats blocked / Links checked cards | Pressable, navigate to scan history / threat intelligence / website link via `onNavigate` |
| Scans remaining card | Free-plan quota (8 of 20 left) with a used-quota progress bar; press goes to settings |
| Recent activity list | Per-period rows with Clean / Threat / Scanning chips; rows and "View all" go to scan history |
| Real-time protection row | Local toggle flips the sub-copy between active and paused states; the row itself opens the real-time-protection screen |
| Privacy audit row | "2 app permissions need review" — opens the privacy-audit screen |
| Last full scan row | Summary line; opens scan history |
| Quick actions | Scan files → file-selection, Check a link → website-link, Quarantine → quarantine |
| No navigator connected | Every navigation falls back to a calm inline notice ("Routing isn't connected in this build yet — it works in the web preview.") instead of pretending a route change |

The demo numbers are clearly illustrative (welcome/preview context) and no
live scan result is implied, per the honesty rules in the product decisions
document.

## Design system (from the product decisions, section 10)

- Navy/charcoal base (`#1D3049`, `#17283E`), light surfaces (`#F8FAFD`), one blue accent (`#1877F2`).
- Green is used only for positive results, large tap targets, and plain-language text.
- Privacy message on screen: "Files stay on your phone by default."
