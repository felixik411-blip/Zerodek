/**
 * Glyph alias for the file-selection screen (see README "Known notes").
 *
 * The hand-off uses the icon name `file-archive`, which does not exist in
 * the MaterialCommunityIcons glyphmap — the real glyph is `zip-box`. The
 * glyphmap JSON is a shared module instance and names resolve at render
 * time, so aliasing it here maps the hand-off's name to the intended
 * archive glyph WITHOUT touching the byte-identical screen code.
 */
import MaterialCommunityIconsGlyphMap from '@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json';

const mciGlyphMap = MaterialCommunityIconsGlyphMap as Record<string, number>;
if (!mciGlyphMap['file-archive']) {
  mciGlyphMap['file-archive'] = mciGlyphMap['zip-box'];
}
