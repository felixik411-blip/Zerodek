import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const C = {
  navy: '#1D3049',
  navyDeep: '#17283E',
  blue: '#1877F2',
  blueLight: '#E6F0FF',
  background: '#F8FAFD',
  text: '#20334F',
  muted: '#607493',
  green: '#43CDA0',
  white: '#FFFFFF',
};

type FeatureProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
};

function FeatureRow({ icon, title, description }: FeatureProps) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>
        <MaterialCommunityIcons name={icon} size={38} color={C.blue} />
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

function SecurityIllustration() {
  return (
    <View style={styles.illustration}>
      <View style={styles.illustrationCircle} />

      <View style={[styles.floatCard, styles.documentCard]}>
        <MaterialCommunityIcons name="file-document" size={62} color={C.blue} />
      </View>
      <View style={[styles.floatCard, styles.linkCard]}>
        <Feather name="link" size={54} color={C.blue} />
      </View>

      <View style={styles.laptop}>
        <View style={styles.laptopCamera} />
        <View style={styles.laptopScreen}>
          <View style={styles.screenGlow}>
            <View style={styles.mainShield}>
              <MaterialCommunityIcons name="shield-check" size={116} color={C.blue} />
            </View>
          </View>
        </View>
        <View style={styles.laptopBase}>
          <View style={styles.laptopNotch} />
        </View>
      </View>

      <View style={styles.statusCard}>
        <MaterialCommunityIcons name="shield-outline" size={42} color={C.blue} />
        <View style={styles.statusLines}>
          <View style={styles.statusLineLong} />
          <View style={styles.statusLineShort} />
          <View style={styles.statusLineMedium} />
        </View>
        <View style={styles.successCircle}>
          <MaterialCommunityIcons name="check" size={25} color={C.white} />
        </View>
      </View>

      <View style={styles.decorMarkOne} />
      <View style={styles.decorMarkTwo} />
      <View style={styles.decorMarkThree} />
    </View>
  );
}

type GetStartedState = 'idle' | 'loading' | 'done';

export default function SecurityScannerWelcomeScreen() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  // Interactive states for the Get started button (design brief section 10A:
  // "Show clear loading, empty, error, and confirmation states where relevant").
  const [getStartedState, setGetStartedState] = React.useState<GetStartedState>('idle');
  const [buttonFocused, setButtonFocused] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleGetStarted = () => {
    if (getStartedState === 'loading') {
      return;
    }
    // TODO: Navigate to your scanner/onboarding route when it exists.
    // Example: navigation.navigate('Scanner');
    // Until that route exists, show an honest loading state followed by a
    // confirmation state — the app must never pretend a step happened.
    setGetStartedState('loading');
    timerRef.current = setTimeout(() => setGetStartedState('done'), 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={C.navyDeep} />

      <View style={styles.appHeader}>
        <View style={styles.brand}>
          <MaterialCommunityIcons name="shield-check" size={42} color={C.blue} />
          <Text style={styles.brandText}>
            Security <Text style={styles.brandAccent}>Scanner</Text>
          </Text>
        </View>
        <Text style={styles.headerTagline}>Safe files. Safer browsing.</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isWide ? styles.wideContent : styles.narrowContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainLayout, isWide && styles.mainLayoutWide]}>
          <View style={[styles.leftColumn, isWide && styles.leftColumnWide]}>
            <Text style={styles.eyebrow}>WELCOME</Text>
            <Text style={[styles.heroTitle, !isWide && styles.heroTitleNarrow]}>
              Security <Text style={styles.heroAccent}>Scanner</Text>
            </Text>
            <Text style={styles.subtitle}>
              Check files and links for possible threats.
            </Text>

            <View style={styles.features}>
              <FeatureRow
                icon="file-document-outline"
                title="Scan selected files"
                description="Check files on your device for malware, viruses and other threats."
              />
              <FeatureRow
                icon="link-variant"
                title="Check website links"
                description="Verify links and URLs for malicious content before you open them."
              />
              <FeatureRow
                icon="shield-check-outline"
                title="Review quarantined files"
                description="See and manage files that were flagged as suspicious or dangerous."
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get started"
              accessibilityState={{
                busy: getStartedState === 'loading',
                disabled: getStartedState === 'loading',
              }}
              onPress={handleGetStarted}
              onFocus={() => setButtonFocused(true)}
              onBlur={() => setButtonFocused(false)}
              disabled={getStartedState === 'loading'}
              style={({ pressed }) => [
                styles.getStartedButton,
                pressed && styles.getStartedButtonPressed,
                buttonFocused && styles.getStartedButtonFocused,
                getStartedState === 'loading' && styles.getStartedButtonLoading,
              ]}
            >
              {getStartedState === 'loading' ? (
                <>
                  <ActivityIndicator size="small" color={C.white} />
                  <Text style={styles.getStartedText}>Getting started…</Text>
                </>
              ) : (
                <>
                  <Text style={styles.getStartedText}>Get started</Text>
                  <Feather name="arrow-right" size={28} color={C.white} />
                </>
              )}
            </Pressable>

            <View style={styles.privacyNote}>
              <MaterialCommunityIcons name="lock" size={22} color="#7B8DA8" />
              <Text style={styles.privacyText}>
                Files stay on your phone by default.
              </Text>
            </View>

            {getStartedState === 'done' && (
              <View style={styles.nextStepCard} accessibilityRole="alert">
                <View style={styles.nextStepIcon}>
                  <MaterialCommunityIcons name="check" size={18} color={C.white} />
                </View>
                <View style={styles.nextStepCopy}>
                  <Text style={styles.nextStepTitle}>You're all set for now</Text>
                  <Text style={styles.nextStepBody}>
                    The next step — the scanner screen — isn't connected in this
                    preview yet.
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={isWide ? styles.rightColumn : styles.mobileIllustration}>
            <SecurityIllustration />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.background,
  },
  appHeader: {
    minHeight: 76,
    paddingHorizontal: 22,
    paddingVertical: 14,
    backgroundColor: C.navyDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandText: {
    color: C.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#9BC8FF',
  },
  headerTagline: {
    color: '#D1D9E5',
    fontSize: 13,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 38,
    paddingBottom: 42,
  },
  wideContent: {
    paddingHorizontal: '7.4%',
    paddingTop: 58,
  },
  narrowContent: {
    paddingHorizontal: 22,
    paddingTop: 32,
  },
  mainLayout: {
    width: '100%',
  },
  mainLayoutWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  leftColumn: {
    width: '100%',
  },
  leftColumnWide: {
    flex: 1,
    maxWidth: 600,
  },
  eyebrow: {
    color: '#7899D2',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  heroTitle: {
    color: C.navy,
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  heroTitleNarrow: {
    fontSize: 38,
    lineHeight: 46,
    letterSpacing: -1.5,
  },
  heroAccent: {
    color: C.blue,
  },
  subtitle: {
    color: C.muted,
    fontSize: 20,
    lineHeight: 29,
    marginTop: 14,
    marginBottom: 30,
  },
  features: {
    gap: 25,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 17,
  },
  featureIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureCopy: {
    flex: 1,
    paddingTop: 5,
  },
  featureTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  featureDescription: {
    color: C.muted,
    fontSize: 15,
    lineHeight: 23,
  },
  getStartedButton: {
    minHeight: 64,
    borderRadius: 16,
    backgroundColor: C.blue,
    marginTop: 38,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
  },
  getStartedButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  getStartedButtonFocused: {
    transform: [{ scale: 1.015 }],
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  getStartedButtonLoading: {
    opacity: 0.9,
  },
  getStartedText: {
    color: C.white,
    fontSize: 18,
    fontWeight: '700',
  },
  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginTop: 18,
    backgroundColor: C.blueLight,
    borderRadius: 14,
    padding: 14,
  },
  nextStepIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  nextStepCopy: {
    flex: 1,
  },
  nextStepTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  nextStepBody: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginTop: 22,
  },
  privacyText: {
    color: C.muted,
    fontSize: 14,
  },
  rightColumn: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileIllustration: {
    marginTop: 28,
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    maxWidth: 610,
    aspectRatio: 1.05,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationCircle: {
    position: 'absolute',
    width: '92%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#E8F2FF',
    top: '7%',
    left: '4%',
  },
  floatCard: {
    position: 'absolute',
    width: 94,
    height: 94,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 3,
    shadowColor: '#7EA7DC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },
  documentCard: {
    top: '18%',
    left: '16%',
  },
  linkCard: {
    top: '22%',
    right: '12%',
  },
  laptop: {
    position: 'absolute',
    width: '68%',
    height: '43%',
    top: '40%',
    left: '16%',
    zIndex: 2,
  },
  laptopCamera: {
    position: 'absolute',
    top: 4,
    alignSelf: 'center',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#416184',
    zIndex: 2,
  },
  laptopScreen: {
    flex: 1,
    borderWidth: 12,
    borderColor: C.navy,
    borderRadius: 14,
    backgroundColor: '#F7FBFF',
    padding: 12,
  },
  screenGlow: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#F0F7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainShield: {
    width: '70%',
    height: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.48)',
    borderRadius: 12,
  },
  laptopBase: {
    height: 16,
    width: '118%',
    alignSelf: 'center',
    backgroundColor: '#9ABCEB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: '-9%',
  },
  laptopNotch: {
    width: '24%',
    height: 7,
    alignSelf: 'center',
    backgroundColor: '#6D8FBF',
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  statusCard: {
    position: 'absolute',
    width: '39%',
    height: '21%',
    top: '53%',
    right: '0%',
    zIndex: 4,
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    shadowColor: '#7EA7DC',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.17,
    shadowRadius: 16,
    elevation: 5,
  },
  statusLines: {
    flex: 1,
    gap: 7,
  },
  statusLineLong: {
    width: '100%',
    height: 8,
    borderRadius: 5,
    backgroundColor: '#D8E6FA',
  },
  statusLineShort: {
    width: '60%',
    height: 8,
    borderRadius: 5,
    backgroundColor: '#D8E6FA',
  },
  statusLineMedium: {
    width: '78%',
    height: 8,
    borderRadius: 5,
    backgroundColor: '#C7DBF7',
    marginTop: 4,
  },
  successCircle: {
    position: 'absolute',
    right: 10,
    bottom: 12,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorMarkOne: {
    position: 'absolute',
    top: '42%',
    right: '9%',
    width: 5,
    height: 23,
    borderRadius: 4,
    backgroundColor: C.blue,
  },
  decorMarkTwo: {
    position: 'absolute',
    top: '44%',
    right: '3%',
    width: 5,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#A5C9FA',
    transform: [{ rotate: '35deg' }],
  },
  decorMarkThree: {
    position: 'absolute',
    top: '49%',
    right: '1%',
    width: 5,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#A5C9FA',
    transform: [{ rotate: '70deg' }],
  },
});
