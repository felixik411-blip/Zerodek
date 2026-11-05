# Security Scanner — Welcome Screen

## Objective
Recreate the supplied Security Scanner welcome-screen reference as closely as practical using:

- **Expo + React Native**
- **TypeScript**
- **Expo Development Build** for native integrations when needed

Build a real React Native screen, not an HTML page or WebView.

## Reference layout

### 1. Top navigation bar
- Full-width dark navy header, approximately 86 px tall in the reference.
- Left: blue shield/check logo followed by the title **Security Scanner**.
- Style the title in bold white, with **Scanner** accented in light blue.
- Right: small muted-white tagline: **Safe files. Safer browsing.**
- Vertically center all header content and provide comfortable horizontal padding.

### 2. Main content
Use a light, nearly white background with a subtle cool-blue tint.

On wide screens, use a two-column layout:
- **Left column:** welcome heading, description, three feature rows, primary action, privacy note.
- **Right column:** security illustration.

On narrow screens, adapt to a single-column layout without horizontal overflow. Keep the heading and actions readable and avoid squeezing the feature descriptions.

### 3. Welcome heading
- Small uppercase eyebrow: **WELCOME**, muted blue, bold.
- Large heading: **Security Scanner**
  - “Security” in dark navy.
  - “Scanner” in vivid blue.
- Supporting text: **Check files and links for possible threats.**
- Use strong, clean typography and spacing similar to the reference.

### 4. Feature rows
Render three feature rows. Each row has a pale-blue rounded-square icon tile on the left and text on the right.

**Feature 1**
- Title: **Scan selected files**
- Description: `Check files on your device for malware, viruses and other threats.`
- Icon: file/document outline in blue.

**Feature 2**
- Title: **Check website links**
- Description: `Verify links and URLs for malicious content before you open them.`
- Icon: chain link in blue.

**Feature 3**
- Title: **Review quarantined files**
- Description: `See and manage files that were flagged as suspicious or dangerous.`
- Icon: shield with checkmark in blue.

Use consistent row spacing, icon-tile dimensions, text alignment, and line heights. Descriptions should wrap naturally.

### 5. Primary action
- Wide blue rounded button with the label **Get started**.
- Place a right-arrow icon after the label.
- Use white semibold text.
- Make the button accessible, with a clear press state.
- Connect it to the app's next onboarding/navigation screen if that route exists. If it does not exist yet, keep the action isolated in a clearly named handler rather than inventing a route.

### 6. Privacy note
Below the primary action, show a small lock icon and the text:

**Files stay on your phone by default.**

Use muted blue-gray styling.

### 7. Right-side security illustration
Recreate the reference illustration with React Native-compatible elements:
- Large, very pale blue circular backdrop.
- Laptop with dark navy frame and light screen.
- Blue shield with a white checkmark on the laptop screen.
- Floating document and link icon cards above the laptop.
- Floating security-status card beside the laptop, with a shield, short text lines, and a green success check.
- Subtle blue highlights and soft shadows.

Prefer a supplied local illustration asset or a custom vector/SVG asset compatible with Expo. If creating the illustration from primitives, keep it isolated in a reusable component. Do not use a remote image that may disappear or require network access at runtime.

## Visual style
- Primary navy: approximately `#172A43` to `#20334D`
- Primary blue: approximately `#1877F2`
- Light blue: approximately `#E6F0FF`
- Muted text: approximately `#607493`
- Main background: approximately `#F8FAFD`
- Success green: approximately `#43CDA0`
- Rounded cards and buttons, subtle shadows, clean spacing, and restrained use of gradients.

Treat these as starting values; tune them against the supplied reference image.

## Implementation requirements
1. Use TypeScript and React Native primitives (`View`, `Text`, `Pressable`, etc.).
2. Use `SafeAreaView` from `react-native-safe-area-context` where appropriate.
3. Use responsive sizing based on available screen width; do not hardcode the reference image's full pixel dimensions as the app layout.
4. Use a consistent icon library compatible with Expo, such as `@expo/vector-icons`, or use local SVG assets with `react-native-svg`.
5. If using SVG, confirm the package is installed; Expo projects commonly use `react-native-svg`.
6. Keep the welcome screen in a reusable component/file and separate the illustration into its own component if that improves maintainability.
7. Use accessible labels and sensible touch targets for interactive controls.
8. Avoid web-only CSS, DOM elements, browser APIs, and WebView-based implementations.
9. Do not add login, registration, scanning logic, or other screens not shown in the reference.
10. Do not claim that scanning or local-only processing works until the corresponding functionality is implemented and verified.

## Expected deliverable
Provide implementation-ready TypeScript/React Native code for the welcome screen, including:
- The main screen component.
- Any reusable illustration component or asset needed to match the reference.
- Required package dependencies and installation commands, if applicable.
- A short note identifying where to connect the **Get started** button to the next route.

Prioritize visual fidelity to the supplied image while keeping the code clean, responsive, and appropriate for an Expo app.
