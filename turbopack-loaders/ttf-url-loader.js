/* eslint-disable @typescript-eslint/no-require-imports --
   Turbopack loaders use the webpack loader API, which is CommonJS. */
/**
 * Turbopack loader: resolves `.ttf` icon font imports from
 * `@expo/vector-icons` to their public URL string.
 *
 * The needed fonts are copied to `public/fonts/` (see next.config.ts),
 * and the CSS `@font-face` rules in `src/app/globals.css` register them
 * with the family names react-native-vector-icons expects. So a font
 * import only needs to become a URL — expo-font itself is stubbed out.
 *
 * Output is treated as a JS module (`as: '*.js'` in the turbopack rule).
 */
const path = require('path');

module.exports = function ttfUrlLoader() {
  const fileName = path.basename(this.resourcePath);
  return `export default "/fonts/${fileName}";`;
};
