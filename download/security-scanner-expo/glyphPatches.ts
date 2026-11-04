/**
 * Glyph aliases for the file-selection, scan-result and admin-dashboard
 * and help-content screens (see README "Known notes").
 *
 * Three hand-off icon names do not exist in their icon family's glyphmap:
 * - `file-archive` (file-selection screen, MaterialCommunityIcons — 7,448
 *   names checked) — real glyph: `zip-box`
 * - `shield-minus` (scan-result quarantined banner, MaterialCommunityIcons)
 *   — the real minus-shield glyph is `shield-remove` (Material Design Icons
 *   names "minus" "remove")
 * - `shield-check` (admin-dashboard Service-Health metric, Feather — only
 *   `shield`/`shield-off` exist) — real glyph: `shield`
 *
 * The glyphmap JSON is a shared module instance and names resolve at render
 * time, so aliasing them here maps the hand-offs' names to the intended
 * glyphs WITHOUT touching the byte-identical screen code.
 */
/**
 * The help-content hand-off (screen 17) uses two more names that do not
 * exist in the Ionicons glyphmap (1,357 names checked — there is no
 * bold/italic glyph family at all):
 * - `bold` (rich-text toolbar, Bold button) — real typography glyph: `text`
 * - `italic` (rich-text toolbar, Italic button) — real typography glyph:
 *   `text-outline` (same "Aa" family as `text`, visually distinct from it;
 *   the toolbar's own buttons are placeholder formatting per the hand-off's
 *   integration notes, and each button keeps its "Bold"/"Italic"
 *   accessibility label)
 */
import IoniconsGlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Ionicons.json';

const ioniconsGlyphMap = IoniconsGlyphMap as Record<string, number>;
if (!ioniconsGlyphMap['bold']) {
  ioniconsGlyphMap['bold'] = ioniconsGlyphMap['text'];
}
if (!ioniconsGlyphMap['italic']) {
  ioniconsGlyphMap['italic'] = ioniconsGlyphMap['text-outline'];
}

import MaterialCommunityIconsGlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';
import FeatherGlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/Feather.json';

const mciGlyphMap = MaterialCommunityIconsGlyphMap as Record<string, number>;
if (!mciGlyphMap['file-archive']) {
  mciGlyphMap['file-archive'] = mciGlyphMap['zip-box'];
}
if (!mciGlyphMap['shield-minus']) {
  mciGlyphMap['shield-minus'] = mciGlyphMap['shield-remove'];
}

const featherGlyphMap = FeatherGlyphMap as Record<string, number>;
if (!featherGlyphMap['shield-check']) {
  featherGlyphMap['shield-check'] = featherGlyphMap['shield'];
}
