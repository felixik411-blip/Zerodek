/**
 * Glyph aliases for the file-selection and scan-result screens (see README
 * "Known notes").
 *
 * Two hand-off icon names do not exist in the MaterialCommunityIcons
 * glyphmap (7,448 names checked):
 * - `file-archive` (file-selection screen) — real glyph: `zip-box`
 * - `shield-minus` (scan-result quarantined banner) — the real minus-shield
 *   glyph is `shield-remove` (Material Design Icons names "minus" "remove")
 *
 * The glyphmap JSON is a shared module instance and names resolve at render
 * time, so aliasing them here maps the hand-offs' names to the intended
 * glyphs WITHOUT touching the byte-identical screen code.
 */
import MaterialCommunityIconsGlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';

const mciGlyphMap = MaterialCommunityIconsGlyphMap as Record<string, number>;
if (!mciGlyphMap['file-archive']) {
  mciGlyphMap['file-archive'] = mciGlyphMap['zip-box'];
}
if (!mciGlyphMap['shield-minus']) {
  mciGlyphMap['shield-minus'] = mciGlyphMap['shield-remove'];
}
