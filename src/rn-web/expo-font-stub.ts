/**
 * Minimal web stub for `expo-font`.
 *
 * `@expo/vector-icons` imports expo-font to load icon fonts on native.
 * On this web preview the icon fonts are loaded with CSS `@font-face`
 * (see `src/app/globals.css`), so the stub only needs to report that
 * fonts are "already loaded" and never touch the network or native modules.
 */
export async function loadAsync(
  _source?: unknown,
): Promise<Record<string, unknown>> {
  return {};
}

export function isLoaded(_familyName?: string): boolean {
  return true;
}

export async function renderToImageAsync(): Promise<{
  uri: string;
  width: number;
  height: number;
}> {
  throw new Error(
    "expo-font.renderToImageAsync is not supported in this web preview",
  );
}
