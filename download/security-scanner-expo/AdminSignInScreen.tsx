import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  FileText,
  Info,
  Lock,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react-native';

/*
 * Admin sign-in screen (screen 13).
 *
 * Authored from the implementation brief in upload/13.md: the brief defines
 * requirements, copy and design tokens (there is no code hand-off), so this
 * file implements the two-column Admin Portal layout with the sign-in card.
 *
 * Authentication and password recovery are integration points only, exactly
 * as the brief demands: `onSignIn` and `onForgotPassword` are injected
 * callbacks, the screen itself never claims that a sign-in succeeded, and no
 * credentials are stored anywhere. The hero illustration is a React Native
 * composition of simple shapes and icons (no remote image URL), and the
 * icons come from lucide-react-native, which is already a project
 * dependency — no new dependency is introduced.
 */

const C = {
  primary: '#0878F9',
  primaryPressed: '#0663D6',
  navy: '#10284A',
  panelNavy: '#173B69',
  muted: '#5D79A7',
  placeholder: '#8FA9CF',
  pale: '#F3F8FE',
  tile: '#E3F0FF',
  border: '#D7E6FA',
  divider: '#E4EEFB',
  white: '#FFFFFF',
  error: '#E53935',
  errorBg: '#FDECEA',
  errorText: '#C62828',
};

/** Below this viewport width the two panels stack vertically. */
const STACK_BREAKPOINT = 900;

export type AdminSignInCredentials = {
  emailOrUsername: string;
  password: string;
};

export interface AdminSignInScreenProps {
  /**
   * Injected authentication handler. Called only after both fields pass
   * validation. Reject to surface an inline error; this screen never shows
   * a success state of its own — reporting success is the real handler's
   * job (the brief forbids fabricating one).
   */
  onSignIn?: (credentials: AdminSignInCredentials) => Promise<void>;
  /**
   * Injected password-recovery integration point. No recovery screen exists
   * in the app yet and the brief says not to invent a route, so the action
   * stays a callback.
   */
  onForgotPassword?: () => void;
}

/** Copy for the three Admin Portal feature rows (kept in one typed array). */
type AdminPortalFeature = {
  key: string;
  Icon: typeof ShieldCheck;
  title: string;
  description: string;
};

const FEATURES: AdminPortalFeature[] = [
  {
    key: 'scan-history',
    Icon: ShieldCheck,
    title: 'View scan history',
    description: 'Track file and link scans across your organisation.',
  },
  {
    key: 'quarantine',
    Icon: FileText,
    title: 'Manage quarantined files',
    description: 'Review and take action on isolated threats.',
  },
  {
    key: 'settings',
    Icon: Settings,
    title: 'Configure settings',
    description: 'Adjust security and retention policies.',
  },
];

/** Widths of the pale dashboard rows inside the hero illustration. */
const HERO_ROWS = [
  { titleWidth: '62%' as const, subWidth: '40%' as const },
  { titleWidth: '78%' as const, subWidth: '34%' as const },
  { titleWidth: '55%' as const, subWidth: '46%' as const },
  { titleWidth: '70%' as const, subWidth: '38%' as const },
];

function BrandLockup({
  logoSize,
  wordmarkSize,
  showTagline,
}: {
  logoSize: number;
  wordmarkSize: number;
  showTagline: boolean;
}) {
  return (
    <View style={styles.brandRow}>
      <View
        style={[
          styles.brandBadge,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: Math.round(logoSize * 0.3),
          },
        ]}
      >
        <ShieldCheck
          color={C.white}
          size={Math.round(logoSize * 0.58)}
          strokeWidth={2.2}
        />
      </View>
      <View style={styles.brandText}>
        <Text style={[styles.brandWordmark, { fontSize: wordmarkSize }]}>
          <Text style={styles.brandWordmarkNavy}>Security </Text>
          <Text style={styles.brandWordmarkBlue}>Scanner</Text>
        </Text>
        {showTagline ? (
          <Text style={styles.brandTagline}>
            Safer devices. Cleaner links. Better protection.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Browser-window dashboard illustration built from plain Views and lucide
 * icons: dark navy navigation rail, pale rows with check icons, a floating
 * shield badge and soft pale-blue background shapes.
 */
function HeroIllustration() {
  return (
    <View style={styles.hero}>
      <View style={styles.heroGlowLarge} />
      <View style={styles.heroGlowSmall} />

      <View style={styles.heroWindow}>
        <View style={styles.heroTitleBar}>
          <View style={[styles.heroDot, { backgroundColor: '#F87171' }]} />
          <View style={[styles.heroDot, { backgroundColor: '#FBBF24' }]} />
          <View style={[styles.heroDot, { backgroundColor: '#34D399' }]} />
          <View style={styles.heroUrlPill}>
            <Lock color={C.placeholder} size={9} strokeWidth={2.6} />
            <View style={styles.heroUrlLine} />
          </View>
        </View>
        <View style={styles.heroBody}>
          <View style={styles.heroRail}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[styles.heroRailItem, index === 0 && styles.heroRailItemActive]}
              />
            ))}
          </View>
          <View style={styles.heroList}>
            {HERO_ROWS.map((row, index) => (
              <View key={index} style={styles.heroRow}>
                <View style={styles.heroRowIcon}>
                  <Check color={C.primary} size={11} strokeWidth={3.2} />
                </View>
                <View style={styles.heroRowLines}>
                  <View style={[styles.heroLine, { width: row.titleWidth }]} />
                  <View style={[styles.heroLineSub, { width: row.subWidth }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.heroBadge}>
        <ShieldCheck color={C.white} size={28} strokeWidth={2.3} />
      </View>
    </View>
  );
}

export default function AdminSignInScreen({
  onSignIn,
  onForgotPassword,
}: AdminSignInScreenProps) {
  const { width } = useWindowDimensions();
  const isStacked = width < STACK_BREAKPOINT;

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChangeEmail = useCallback(
    (value: string) => {
      setEmailOrUsername(value);
      if (emailError && value.trim()) setEmailError(null);
    },
    [emailError],
  );

  const handleChangePassword = useCallback(
    (value: string) => {
      setPassword(value);
      if (passwordError && value) setPasswordError(null);
    },
    [passwordError],
  );

  const handleTogglePassword = useCallback(() => {
    setShowPassword((visible) => !visible);
  }, []);

  const handleSubmit = useCallback(async () => {
    Keyboard.dismiss();
    if (submitting) return;
    const nextEmailError = emailOrUsername.trim()
      ? null
      : 'Enter your email or username.';
    const nextPasswordError = password ? null : 'Enter your password.';
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    if (!onSignIn) {
      setAuthError('No authentication handler is configured for this screen.');
      return;
    }

    setAuthError(null);
    setSubmitting(true);
    try {
      await onSignIn({ emailOrUsername: emailOrUsername.trim(), password });
    } catch (error) {
      setAuthError(
        error instanceof Error && error.message
          ? `Sign-in failed: ${error.message}`
          : 'Sign-in failed. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }, [emailOrUsername, password, onSignIn, submitting]);

  const handleForgotPassword = useCallback(() => {
    onForgotPassword?.();
  }, [onForgotPassword]);

  const renderFeatures = () =>
    FEATURES.map(({ key, Icon, title, description }) => (
      <View key={key} style={styles.featureRow}>
        <View style={styles.featureTile}>
          <Icon color={C.primary} size={20} strokeWidth={2.1} />
        </View>
        <View style={styles.featureCopy}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
      </View>
    ));

  const signInCard = (
    <View style={styles.card}>
      <View style={styles.cardBrandRow}>
        <View style={styles.cardBrandBadge}>
          <ShieldCheck color={C.white} size={15} strokeWidth={2.4} />
        </View>
        <Text style={styles.cardWordmark}>
          <Text style={styles.brandWordmarkNavy}>Security </Text>
          <Text style={styles.brandWordmarkBlue}>Scanner</Text>
        </Text>
      </View>

      <Text style={styles.cardHeading}>Admin sign in</Text>
      <Text style={styles.cardDescription}>
        Access the admin panel to manage security and monitor activity.
      </Text>

      <Text style={[styles.fieldLabel, styles.fieldLabelFirst]}>
        Email or username
      </Text>
      <View style={[styles.field, emailError ? styles.fieldInvalid : null]}>
        <User color={C.muted} size={18} strokeWidth={2} />
        <TextInput
          style={styles.fieldInput}
          value={emailOrUsername}
          onChangeText={handleChangeEmail}
          placeholder="Enter your email or username"
          placeholderTextColor={C.placeholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          returnKeyType="next"
          editable={!submitting}
          accessibilityLabel="Email or username"
        />
      </View>
      {emailError ? (
        <Text
          style={styles.fieldError}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {emailError}
        </Text>
      ) : null}

      <Text style={styles.fieldLabel}>Password</Text>
      <View style={[styles.field, passwordError ? styles.fieldInvalid : null]}>
        <Lock color={C.muted} size={18} strokeWidth={2} />
        <TextInput
          style={styles.fieldInput}
          value={password}
          onChangeText={handleChangePassword}
          placeholder="Enter your password"
          placeholderTextColor={C.placeholder}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          editable={!submitting}
          accessibilityLabel="Password"
        />
        <Pressable
          onPress={handleTogglePassword}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          accessibilityState={{ disabled: submitting }}
          hitSlop={8}
          style={({ pressed }) => [styles.eyeButton, pressed && styles.eyeButtonPressed]}
        >
          {showPassword ? (
            <EyeOff color={C.muted} size={18} strokeWidth={2} />
          ) : (
            <Eye color={C.muted} size={18} strokeWidth={2} />
          )}
        </Pressable>
      </View>
      {passwordError ? (
        <Text
          style={styles.fieldError}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {passwordError}
        </Text>
      ) : null}

      <Pressable
        onPress={handleForgotPassword}
        accessibilityRole="link"
        accessibilityLabel="Forgot your password?"
        hitSlop={6}
        style={({ pressed }) => [styles.forgotButton, pressed && styles.forgotPressed]}
      >
        <Text style={styles.forgotText}>Forgot your password?</Text>
      </Pressable>

      <Pressable
        onPress={handleSubmit}
        disabled={submitting}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
        accessibilityState={{ disabled: submitting, busy: submitting }}
        style={({ pressed }) => [
          styles.signInButton,
          (pressed || submitting) && styles.signInButtonPressed,
        ]}
      >
        {submitting ? (
          <>
            <ActivityIndicator color={C.white} size="small" />
            <Text style={styles.signInButtonText}>Signing in…</Text>
          </>
        ) : (
          <>
            <Text style={styles.signInButtonText}>Sign in</Text>
            <ArrowRight color={C.white} size={18} strokeWidth={2.4} />
          </>
        )}
      </Pressable>

      {authError ? (
        <View
          style={styles.authErrorStrip}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.authErrorText}>{authError}</Text>
        </View>
      ) : null}

      <View style={styles.notice}>
        <Info color={C.muted} size={16} strokeWidth={2} />
        <Text style={styles.noticeText}>
          This area is for authorised staff only. Please do not share your
          login details.
        </Text>
      </View>
    </View>
  );

  if (isStacked) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.stackedContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stackedIntro}>
              <BrandLockup logoSize={46} wordmarkSize={20} showTagline />
              <HeroIllustration />
              <Text style={styles.portalHeading}>Admin Portal</Text>
              <Text style={styles.portalCopy}>
                Monitor security activity, manage quarantined files, and keep
                your organisation protected.
              </Text>
              <View style={styles.featureList}>{renderFeatures()}</View>
            </View>
            <View style={styles.stackedCardSection}>{signInCard}</View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.twoColumns}>
          <View style={styles.leftPanel}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.leftContent}
              keyboardShouldPersistTaps="handled"
            >
              <BrandLockup logoSize={46} wordmarkSize={21} showTagline />
              <HeroIllustration />
              <Text style={styles.portalHeading}>Admin Portal</Text>
              <Text style={styles.portalCopy}>
                Monitor security activity, manage quarantined files, and keep
                your organisation protected.
              </Text>
              <View style={styles.featureList}>{renderFeatures()}</View>
            </ScrollView>
          </View>
          <View style={styles.rightPanel}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.rightContent}
              keyboardShouldPersistTaps="handled"
            >
              {signInCard}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.white,
  },
  scroll: {
    flex: 1,
  },
  twoColumns: {
    flex: 1,
    flexDirection: 'row',
  },

  /* Left panel — Admin Portal introduction */
  leftPanel: {
    width: '46%',
    backgroundColor: C.pale,
    borderRightWidth: 1,
    borderRightColor: C.divider,
  },
  leftContent: {
    paddingHorizontal: 52,
    paddingTop: 44,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  brandBadge: {
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOpacity: 0.32,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  brandText: {
    flexShrink: 1,
  },
  brandWordmark: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandWordmarkNavy: {
    color: C.navy,
  },
  brandWordmarkBlue: {
    color: C.primary,
  },
  brandTagline: {
    marginTop: 3,
    fontSize: 13,
    color: C.muted,
  },

  /* Hero illustration */
  hero: {
    width: '100%',
    maxWidth: 470,
    height: 262,
    alignSelf: 'center',
    marginTop: 38,
  },
  heroGlowLarge: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    backgroundColor: '#E3F0FF',
    top: -34,
    left: -26,
    opacity: 0.8,
  },
  heroGlowSmall: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: '#DCEBFC',
    bottom: -16,
    right: 4,
    opacity: 0.9,
  },
  heroWindow: {
    position: 'absolute',
    top: 12,
    left: 10,
    right: 42,
    bottom: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
    shadowColor: '#12315E',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  heroTitleBar: {
    height: 30,
    backgroundColor: '#F7FAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF4FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 5,
  },
  heroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  heroUrlPill: {
    flex: 1,
    marginLeft: 8,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EDF4FD',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    gap: 4,
  },
  heroUrlLine: {
    width: 92,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#C9DCF5',
  },
  heroBody: {
    flex: 1,
    flexDirection: 'row',
  },
  heroRail: {
    width: 34,
    backgroundColor: C.panelNavy,
    alignItems: 'center',
    paddingTop: 10,
    gap: 9,
  },
  heroRailItem: {
    width: 16,
    height: 16,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroRailItemActive: {
    backgroundColor: C.primary,
  },
  heroList: {
    flex: 1,
    padding: 12,
    gap: 9,
    backgroundColor: '#FBFDFF',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: '#EAF2FC',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  heroRowIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRowLines: {
    flex: 1,
  },
  heroLine: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#D9E6F8',
  },
  heroLineSub: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E7F0FB',
    marginTop: 5,
  },
  heroBadge: {
    position: 'absolute',
    right: 0,
    top: 98,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: C.white,
    shadowColor: C.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  /* Portal copy + features */
  portalHeading: {
    marginTop: 34,
    fontSize: 20,
    fontWeight: '800',
    color: C.navy,
  },
  portalCopy: {
    marginTop: 8,
    fontSize: 14.5,
    lineHeight: 21,
    color: C.muted,
    maxWidth: 470,
  },
  featureList: {
    marginTop: 26,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureTile: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.navy,
  },
  featureDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 18,
    color: C.muted,
    maxWidth: 430,
  },

  /* Right panel + sign-in card */
  rightPanel: {
    flex: 1,
    backgroundColor: C.white,
  },
  rightContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 554,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 34,
    paddingVertical: 32,
    shadowColor: '#12315E',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 3,
  },
  cardBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBrandBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWordmark: {
    fontSize: 16,
    fontWeight: '800',
  },
  cardHeading: {
    marginTop: 22,
    fontSize: 23,
    fontWeight: '800',
    color: C.navy,
  },
  cardDescription: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: C.muted,
  },

  /* Form fields */
  fieldLabel: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '600',
    color: C.navy,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  fieldLabelFirst: {
    marginTop: 26,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 7,
    backgroundColor: C.white,
    paddingHorizontal: 14,
  },
  fieldInvalid: {
    borderColor: C.error,
  },
  fieldInput: {
    flex: 1,
    minHeight: 48,
    fontSize: 15,
    color: C.navy,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 2,
    borderRadius: 6,
  },
  eyeButtonPressed: {
    backgroundColor: C.pale,
  },
  fieldError: {
    marginTop: 6,
    fontSize: 13,
    color: C.error,
  },

  /* Forgot password + sign-in button */
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 6,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  forgotPressed: {
    opacity: 0.7,
  },
  forgotText: {
    color: C.primary,
    fontSize: 13.5,
    fontWeight: '600',
  },
  signInButton: {
    marginTop: 14,
    minHeight: 49,
    borderRadius: 8,
    backgroundColor: C.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInButtonPressed: {
    backgroundColor: C.primaryPressed,
    opacity: 0.9,
  },
  signInButtonText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
  },
  authErrorStrip: {
    marginTop: 14,
    backgroundColor: C.errorBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  authErrorText: {
    color: C.errorText,
    fontSize: 13,
    lineHeight: 18,
  },

  /* Security notice */
  notice: {
    marginTop: 22,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#EAF3FE',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  noticeText: {
    flex: 1,
    color: C.muted,
    fontSize: 12.5,
    lineHeight: 18,
  },

  /* Stacked (narrow) layout */
  stackedContent: {
    backgroundColor: C.pale,
  },
  stackedIntro: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 30,
  },
  stackedCardSection: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.divider,
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
});
