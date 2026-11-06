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

type Period = 'today' | 'week' | 'all';

type ActivityStatus = 'clean' | 'threat' | 'scanning';

/**
 * Where a dashboard element wants to navigate. The web preview maps these
 * ids to real routes; the Expo app (no navigator wired yet) shows an honest
 * inline notice instead of pretending a navigation happened.
 */
type NavTarget =
  | 'scan-history'
  | 'threat-information'
  | 'website-link'
  | 'file-selection'
  | 'quarantine'
  | 'settings'
  | 'real-time-protection'
  | 'privacy-audit'
  | 'dashboard'
  | 'system-health'
  | 'admin-dashboard';

type ActivityItem = {
  id: string;
  name: string;
  kind: 'file' | 'link';
  status: ActivityStatus;
  time: string;
};

type OverviewSnapshot = {
  scans: number;
  scansDelta: string;
  threats: number;
  threatsDetail: string;
  links: number;
  linksDetail: string;
  recent: ActivityItem[];
};

const PERIODS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'all', label: 'All time' },
];

/**
 * Illustrative overview data for the dashboard band. It is clearly a demo
 * snapshot on a welcome screen — no live scan results are implied, per the
 * honesty rules in the product decisions document.
 */
const OVERVIEW: Record<Period, OverviewSnapshot> = {
  today: {
    scans: 4,
    scansDelta: '+2 vs yesterday',
    threats: 0,
    threatsDetail: 'Nothing quarantined',
    links: 9,
    linksDetail: '1 flagged unsafe',
    recent: [
      { id: 't1', name: 'report-q3-final.pdf', kind: 'file', status: 'clean', time: '2 min ago' },
      { id: 't2', name: 'setup-installer.exe', kind: 'file', status: 'scanning', time: '18 min ago' },
      { id: 't3', name: 'docs.example.com/release-notes', kind: 'link', status: 'clean', time: '1 hr ago' },
      { id: 't4', name: 'promo-codes.docx', kind: 'file', status: 'clean', time: '3 hrs ago' },
    ],
  },
  week: {
    scans: 12,
    scansDelta: '+5 vs last week',
    threats: 1,
    threatsDetail: 'Blocked and quarantined',
    links: 34,
    linksDetail: '2 flagged unsafe',
    recent: [
      { id: 'w1', name: 'invoice-0847.pdf', kind: 'file', status: 'threat', time: 'Yesterday' },
      { id: 'w2', name: 'bit.ly/freecoupons', kind: 'link', status: 'threat', time: 'Yesterday' },
      { id: 'w3', name: 'holiday-photos.zip', kind: 'file', status: 'clean', time: '2 days ago' },
      { id: 'w4', name: 'github.com/reactnative.dev/docs', kind: 'link', status: 'clean', time: '3 days ago' },
    ],
  },
  all: {
    scans: 148,
    scansDelta: 'Since installation',
    threats: 9,
    threatsDetail: 'All auto-quarantined',
    links: 417,
    linksDetail: '17 flagged unsafe',
    recent: [
      { id: 'a1', name: 'setup-tool-2026.exe', kind: 'file', status: 'threat', time: 'Last week' },
      { id: 'a2', name: 'backup-old-drive.img', kind: 'file', status: 'clean', time: 'Last week' },
      { id: 'a3', name: 'cdn-assets.example.net/pack', kind: 'link', status: 'clean', time: '2 weeks ago' },
      { id: 'a4', name: 'resume-2025.docx', kind: 'file', status: 'clean', time: '3 weeks ago' },
    ],
  },
};

/** Free-plan monthly scan quota shown on the dashboard (demo values). */
const QUOTA = { used: 12, total: 20 };

/**
 * Security-operations band (dark ops-style layout): threat-severity and
 * system-health arc gauges plus alert-statistics tiles. The figures are the
 * illustrative demo snapshot from the reference layout — clearly labelled as
 * such, never presented as live monitoring output.
 */
type OpsTone = 'blue' | 'red' | 'amber' | 'cyan';

type OpsAlert = {
  id: string;
  label: string;
  value: number;
  tone: OpsTone;
  spark: number[];
  target: NavTarget;
};

const OPS_SEVERITY = 76;
const OPS_HEALTH = 92;

/**
 * Live figures returned by GET /api/stats/overview. The web preview passes
 * a `fetchOverview` callback; the screen overlays these values on top of
 * the demo constants and falls back to them whenever the API is missing or
 * unreachable (e.g. the Expo app running standalone).
 */
export type LiveOverview = {
  cards: {
    scansCompleted: number;
    threatsBlocked: number;
    linksChecked: number;
    quota: { used: number; total: number };
  };
  ops: {
    severityIndex: number;
    health: number;
    alerts: {
      total: { value: number; spark: number[] };
      critical: { value: number; spark: number[] };
      intrusion: { value: number; spark: number[] };
      malware: { value: number; spark: number[] };
    };
  };
};

const OPS_ALERTS: OpsAlert[] = [
  {
    id: 'total',
    label: 'Total alerts',
    value: 324,
    tone: 'blue',
    spark: [42, 55, 38, 61, 47, 70, 52, 64, 58, 72],
    target: 'scan-history',
  },
  {
    id: 'critical',
    label: 'Critical alerts',
    value: 56,
    tone: 'red',
    spark: [12, 18, 9, 22, 15, 26, 19, 24, 21, 28],
    target: 'threat-information',
  },
  {
    id: 'intrusion',
    label: 'Intrusion attempts',
    value: 88,
    tone: 'amber',
    spark: [20, 14, 26, 18, 30, 22, 34, 27, 36, 31],
    target: 'real-time-protection',
  },
  {
    id: 'malware',
    label: 'Malware detections',
    value: 27,
    tone: 'cyan',
    spark: [8, 14, 6, 17, 11, 19, 13, 16, 12, 18],
    target: 'quarantine',
  },
];

const OPS_TONES: Record<OpsTone, string> = {
  blue: '#4DA3FF',
  red: '#FF5C5C',
  amber: '#FFB648',
  cyan: '#3AD3D8',
};

const OPS_TONES_MUTED: Record<OpsTone, string> = {
  blue: 'rgba(77,163,255,0.32)',
  red: 'rgba(255,92,92,0.32)',
  amber: 'rgba(255,182,72,0.32)',
  cyan: 'rgba(58,211,216,0.32)',
};

/** Ease-out 0→1 ramp that drives the band's counters and gauge sweeps. */
function useRampUp(duration = 950): number {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => {
      const linear = Math.min(1, (Date.now() - started) / duration);
      setProgress(1 - Math.pow(1 - linear, 3));
      if (linear >= 1) {
        clearInterval(id);
      }
    }, 33);
    return () => clearInterval(id);
  }, [duration]);
  return progress;
}

/** Zone colour for one arc segment, position 0..1 along the gauge. */
function gaugeZoneColor(kind: 'threat' | 'health', position: number): string {
  if (kind === 'threat') {
    if (position < 0.4) {
      return '#35D08F';
    }
    if (position < 0.7) {
      return '#F5A73B';
    }
    return '#F2555A';
  }
  if (position < 0.72) {
    return '#43CDA0';
  }
  if (position < 0.88) {
    return '#F5C043';
  }
  return '#F2913B';
}

const GAUGE_SEGMENTS = 26;
const GAUGE_SWEEP = 250;

/**
 * Segment-arc gauge built from rotated bars (pure View primitives, no SVG):
 * filled segments up to `value` take their zone colour, the rest stay track-
 * coloured. The count-up and sweep animate in on mount.
 */
function ArcGauge({
  kind,
  value,
  progress,
  size,
}: {
  kind: 'threat' | 'health';
  value: number;
  progress: number;
  size: number;
}) {
  const filled = Math.round((value / 100) * GAUGE_SEGMENTS * progress);
  const step = GAUGE_SWEEP / (GAUGE_SEGMENTS - 1);
  const start = -GAUGE_SWEEP / 2;
  return (
    <View style={[styles.gauge, { width: size, height: size }]}>
      {Array.from({ length: GAUGE_SEGMENTS }, (_, i) => {
        const position = i / (GAUGE_SEGMENTS - 1);
        const active = i < filled;
        return (
          <View
            key={i}
            style={[styles.gaugeArm, { transform: [{ rotate: `${start + i * step}deg` }] }]}
          >
            <View
              style={[
                styles.gaugeSegment,
                {
                  backgroundColor: active
                    ? gaugeZoneColor(kind, position)
                    : '#1C3355',
                },
              ]}
            />
          </View>
        );
      })}
      <View style={styles.gaugeCenter}>
        <Text style={styles.gaugeValue}>{Math.round(value * progress)}%</Text>
        <Text style={styles.gaugeLabel}>
          {kind === 'threat' ? 'Severity index' : 'Normal'}
        </Text>
      </View>
    </View>
  );
}

function AlertTile({
  alert,
  progress,
  onPress,
}: {
  alert: OpsAlert;
  progress: number;
  onPress: () => void;
}) {
  const value = Math.round(alert.value * progress);
  const peak = Math.max(...alert.spark);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${alert.label}: ${alert.value}. Opens the matching screen.`}
      onPress={onPress}
      style={({ pressed }) => [styles.alertTile, pressed && styles.opsPressed]}
    >
      <View style={styles.alertTileTop}>
        <Text style={styles.alertTileLabel}>{alert.label}</Text>
        <View style={[styles.alertTileDot, { backgroundColor: OPS_TONES[alert.tone] }]} />
      </View>
      <Text style={[styles.alertTileValue, { color: OPS_TONES[alert.tone] }]}>{value}</Text>
      <View style={styles.alertSpark}>
        {alert.spark.map((height, i) => (
          <View
            key={i}
            style={[
              styles.alertSparkBar,
              {
                height: `${Math.max(14, Math.round((height / peak) * 100))}%`,
                backgroundColor:
                  i === alert.spark.length - 1
                    ? OPS_TONES[alert.tone]
                    : OPS_TONES_MUTED[alert.tone],
              },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

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

function StatusChip({ status }: { status: ActivityStatus }) {
  const meta =
    status === 'clean'
      ? { label: 'Clean', chip: styles.chipClean, text: styles.chipTextClean }
      : status === 'threat'
        ? { label: 'Threat', chip: styles.chipThreat, text: styles.chipTextThreat }
        : { label: 'Scanning', chip: styles.chipScanning, text: styles.chipTextScanning };
  return (
    <View style={[styles.chip, meta.chip]}>
      <Text style={[styles.chipText, meta.text]}>{meta.label}</Text>
    </View>
  );
}

type StatCardProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string;
  label: string;
  detail: string;
  narrow: boolean;
  onPress: () => void;
};

function StatCard({ icon, value, label, detail, narrow, onPress }: StatCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.statCard,
        narrow && styles.statCardNarrow,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.statIcon}>
        <MaterialCommunityIcons name={icon} size={24} color={C.blue} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statDetail}>{detail}</Text>
    </Pressable>
  );
}

function ActivityRow({ item, onPress }: { item: ActivityItem; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}: ${item.status}`}
      onPress={onPress}
      style={({ pressed }) => [styles.activityRow, pressed && styles.cardPressed]}
    >
      <View style={styles.activityIcon}>
        <MaterialCommunityIcons
          name={item.kind === 'file' ? 'file-document-outline' : 'link-variant'}
          size={20}
          color={C.blue}
        />
      </View>
      <View style={styles.activityCopy}>
        <Text style={styles.activityName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.activityTime}>{item.time}</Text>
      </View>
      <StatusChip status={item.status} />
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
    >
      <MaterialCommunityIcons name={icon} size={20} color={C.blue} />
      <Text style={styles.quickActionText}>{label}</Text>
    </Pressable>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel="Real-time protection"
      onPress={onToggle}
      hitSlop={8}
      style={[styles.toggleTrack, on ? styles.toggleTrackOn : styles.toggleTrackOff]}
    >
      <View style={styles.toggleThumb} />
    </Pressable>
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

type SecurityScannerWelcomeScreenProps = {
  /**
   * Optional navigation hook. When provided (the web preview passes the
   * Next.js router), pressing "Get started" navigates to the real next
   * screen. When omitted (the Expo app has no navigator wired yet), the
   * button falls back to the honest loading + confirmation states.
   */
  onGetStarted?: () => void;
  /**
   * Optional navigation hook for the security-overview dashboard band.
   * Receives one of the NavTarget ids ("scan-history", "quarantine", …).
   * When omitted, dashboard navigation falls back to an honest inline
   * notice instead of pretending a route change happened.
   */
  onNavigate?: (target: NavTarget) => void;
  /**
   * Optional live-data source for the security-overview band. Receives the
   * selected period ('today' | 'week' | 'all') and resolves to the figures
   * from GET /api/stats/overview, or null when the backend is unreachable
   * (the screen then keeps showing the demo snapshot). Omitted on Expo.
   */
  fetchOverview?: (period: Period) => Promise<LiveOverview | null>;
};

export default function SecurityScannerWelcomeScreen({
  onGetStarted,
  onNavigate,
  fetchOverview,
}: SecurityScannerWelcomeScreenProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  // Interactive states for the Get started button (design brief section 10A:
  // "Show clear loading, empty, error, and confirmation states where relevant").
  const [getStartedState, setGetStartedState] = React.useState<GetStartedState>('idle');
  const [buttonFocused, setButtonFocused] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Security-overview dashboard state: the period filter drives the stat
  // cards and the recent-activity list; the refresh and the protection
  // toggle keep honest local feedback; navNotice is the fallback shown when
  // no onNavigate prop is connected (the Expo app).
  const [period, setPeriod] = React.useState<Period>('today');
  const [refreshing, setRefreshing] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState('2 min ago');
  const [liveProtection, setLiveProtection] = React.useState(true);
  const [navNotice, setNavNotice] = React.useState<string | null>(null);
  // Live figures from the scanner backend (web preview only). null = demo
  // snapshot — the screen never fabricates numbers it does not have.
  const [live, setLive] = React.useState<LiveOverview | null>(null);
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const navTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ramp-up progress for the security-operations band's gauges and counters.
  const opsProgress = useRampUp();

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      if (refreshTimerRef.current !== null) {
        clearTimeout(refreshTimerRef.current);
      }
      if (navTimerRef.current !== null) {
        clearTimeout(navTimerRef.current);
      }
    };
  }, []);

  const handleGetStarted = () => {
    if (getStartedState === 'loading') {
      return;
    }
    if (onGetStarted) {
      // A real destination is connected: show the loading state, then go.
      setGetStartedState('loading');
      onGetStarted();
      return;
    }
    // TODO: Navigate to your scanner/onboarding route when it exists.
    // Example: navigation.navigate('Scanner');
    // Until that route exists, show an honest loading state followed by a
    // confirmation state — the app must never pretend a step happened.
    setGetStartedState('loading');
    timerRef.current = setTimeout(() => setGetStartedState('done'), 1200);
  };

  const snapshot = OVERVIEW[period];

  // Live-data overlay: refetch whenever the period changes (and once on
  // mount). Failures keep the demo snapshot — silent by design, the UI
  // simply continues to work offline.
  React.useEffect(() => {
    if (!fetchOverview) return;
    let cancelled = false;
    fetchOverview(period)
      .then((data) => {
        if (!cancelled && data) setLive(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [fetchOverview, period]);

  const scansValue = live?.cards.scansCompleted ?? snapshot.scans;
  const threatsValue = live?.cards.threatsBlocked ?? snapshot.threats;
  const linksValue = live?.cards.linksChecked ?? snapshot.links;
  const quotaUsed = live?.cards.quota.used ?? QUOTA.used;
  const quotaTotal = live?.cards.quota.total ?? QUOTA.total;
  const opsSeverityValue = live?.ops.severityIndex ?? OPS_SEVERITY;
  const opsHealthValue = live?.ops.health ?? OPS_HEALTH;
  // Alert tiles keep their demo tone/target/spark shape; live values (and
  // sparklines, when the API sends a full 10-point series) overlay on top.
  const opsAlertsValue = React.useMemo<OpsAlert[]>(() => {
    if (!live) return OPS_ALERTS;
    const liveAlerts = live.ops.alerts;
    return OPS_ALERTS.map((alert) => {
      const match = liveAlerts[alert.id as keyof typeof liveAlerts];
      if (!match) return alert;
      return {
        ...alert,
        value: match.value,
        spark: match.spark.length === 10 ? match.spark : alert.spark,
      };
    });
  }, [live]);

  const handleNavigate = (target: NavTarget) => {
    if (onNavigate) {
      onNavigate(target);
      return;
    }
    // No navigator connected (the Expo app yet): say so instead of
    // pretending the tap went somewhere.
    setNavNotice("Routing isn't connected in this build yet — it works in the web preview.");
    if (navTimerRef.current !== null) {
      clearTimeout(navTimerRef.current);
    }
    navTimerRef.current = setTimeout(() => setNavNotice(null), 2800);
  };

  const handleRefresh = () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    // Pull fresh backend figures when the live source is connected; the
    // timer keeps the same feedback rhythm in the offline/demo mode.
    if (fetchOverview) {
      fetchOverview(period)
        .then((data) => {
          if (data) setLive(data);
        })
        .catch(() => {});
    }
    refreshTimerRef.current = setTimeout(() => {
      setRefreshing(false);
      setLastUpdated('just now');
    }, 900);
  };

  const handleToggleProtection = () => {
    setLiveProtection((prev) => !prev);
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

        <View style={[styles.dashboard, isWide && styles.dashboardWide]}>
          <View style={styles.dashHeader}>
            <View style={styles.dashHeaderText}>
              <Text style={styles.dashTitle}>Security overview</Text>
              <Text style={styles.dashSubtitle}>
                Scans, threats and protection on this device.
              </Text>
            </View>
            <View style={styles.dashControls}>
              <View style={styles.segmented} accessibilityRole="tablist">
                {PERIODS.map((p) => {
                  const active = period === p.id;
                  return (
                    <Pressable
                      key={p.id}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={`Show ${p.label.toLowerCase()}`}
                      onPress={() => setPeriod(p.id)}
                      style={({ pressed }) => [
                        styles.segment,
                        active && styles.segmentActive,
                        pressed && !active && styles.segmentPressed,
                      ]}
                    >
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {p.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh overview"
                accessibilityState={{ busy: refreshing }}
                onPress={handleRefresh}
                disabled={refreshing}
                style={({ pressed }) => [styles.refreshButton, pressed && styles.cardPressed]}
              >
                {refreshing ? (
                  <ActivityIndicator size="small" color={C.blue} />
                ) : (
                  <MaterialCommunityIcons name="refresh" size={20} color={C.blue} />
                )}
              </Pressable>
            </View>
          </View>
          <Text style={styles.updatedText}>Updated {lastUpdated}</Text>

          <View style={styles.statGrid}>
            <StatCard
              icon="magnify"
              value={String(scansValue)}
              label="Scans completed"
              detail={snapshot.scansDelta}
              narrow={!isWide}
              onPress={() => handleNavigate('scan-history')}
            />
            <StatCard
              icon="shield-alert-outline"
              value={String(threatsValue)}
              label="Threats blocked"
              detail={snapshot.threatsDetail}
              narrow={!isWide}
              onPress={() => handleNavigate('threat-information')}
            />
            <StatCard
              icon="link-variant"
              value={String(linksValue)}
              label="Links checked"
              detail={snapshot.linksDetail}
              narrow={!isWide}
              onPress={() => handleNavigate('website-link')}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Scans remaining: ${quotaTotal - quotaUsed} of ${quotaTotal}`}
              onPress={() => handleNavigate('settings')}
              style={({ pressed }) => [
                styles.statCard,
                !isWide && styles.statCardNarrow,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.statIcon}>
                <MaterialCommunityIcons name="gauge" size={24} color={C.blue} />
              </View>
              <Text style={styles.statValue}>{quotaTotal - quotaUsed}</Text>
              <Text style={styles.statLabel}>Scans remaining</Text>
              <View style={styles.quotaTrack}>
                <View
                  style={[
                    styles.quotaFill,
                    { width: `${Math.round((quotaUsed / quotaTotal) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.statDetail}>
                {quotaUsed} of {quotaTotal} used this month
              </Text>
            </Pressable>
          </View>

          <View style={[styles.dashBottom, isWide && styles.dashBottomWide]}>
            <View style={[styles.dashCard, styles.recentCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Recent activity</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="View all scans"
                  onPress={() => handleNavigate('scan-history')}
                  style={({ pressed }) => [styles.cardLinkHit, pressed && styles.cardPressed]}
                >
                  <Text style={styles.cardLink}>View all</Text>
                </Pressable>
              </View>
              <View style={styles.activityList}>
                {snapshot.recent.map((item) => (
                  <ActivityRow
                    key={item.id}
                    item={item}
                    onPress={() => handleNavigate('scan-history')}
                  />
                ))}
              </View>
            </View>

            <View style={[styles.dashCard, styles.protectionCard]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Protection</Text>
              </View>

              <View style={styles.protectionRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Real-time protection settings"
                  onPress={() => handleNavigate('real-time-protection')}
                  style={({ pressed }) => [
                    styles.protectionRowMain,
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.activityIcon}>
                    <MaterialCommunityIcons name="shield-check-outline" size={20} color={C.blue} />
                  </View>
                  <View style={styles.activityCopy}>
                    <Text style={styles.protectionRowTitle}>Real-time protection</Text>
                    <Text style={styles.protectionRowSub}>
                      {liveProtection
                        ? 'Downloads and links are checked instantly.'
                        : 'Paused — new downloads are not checked.'}
                    </Text>
                  </View>
                </Pressable>
                <Toggle on={liveProtection} onToggle={handleToggleProtection} />
              </View>

              <View style={styles.rowDivider} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Privacy audit: 2 permissions need review"
                onPress={() => handleNavigate('privacy-audit')}
                style={({ pressed }) => [styles.protectionRow, pressed && styles.cardPressed]}
              >
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={C.blue} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.protectionRowTitle}>Privacy audit</Text>
                  <Text style={styles.protectionRowSub}>2 app permissions need review.</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9AAAC4" />
              </Pressable>

              <View style={styles.rowDivider} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Last full scan details"
                onPress={() => handleNavigate('scan-history')}
                style={({ pressed }) => [styles.protectionRow, pressed && styles.cardPressed]}
              >
                <View style={styles.activityIcon}>
                  <MaterialCommunityIcons name="history" size={20} color={C.blue} />
                </View>
                <View style={styles.activityCopy}>
                  <Text style={styles.protectionRowTitle}>Last full scan</Text>
                  <Text style={styles.protectionRowSub}>Today at 09:41 · No threats found.</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#9AAAC4" />
              </Pressable>

              <View style={styles.quickActions}>
                <QuickAction
                  icon="magnify"
                  label="Scan files"
                  onPress={() => handleNavigate('file-selection')}
                />
                <QuickAction
                  icon="link-variant"
                  label="Check a link"
                  onPress={() => handleNavigate('website-link')}
                />
                <QuickAction
                  icon="lock"
                  label="Quarantine"
                  onPress={() => handleNavigate('quarantine')}
                />
              </View>
            </View>
          </View>

          {navNotice && (
            <View style={styles.navNotice} accessibilityRole="alert">
              <MaterialCommunityIcons name="information-outline" size={18} color={C.blue} />
              <Text style={styles.navNoticeText}>{navNotice}</Text>
            </View>
          )}
        </View>

        <View style={[styles.ops, isWide && styles.opsWide]}>
          <View style={styles.opsHeader}>
            <View style={styles.opsHeaderText}>
              <Text style={styles.opsTitle}>Security operations</Text>
              <Text style={styles.opsSubtitle}>
                Threat severity, system health and alert volume — every panel opens the matching screen.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open admin dashboard"
              onPress={() => handleNavigate('admin-dashboard')}
              style={({ pressed }) => [styles.opsLinkHit, pressed && styles.opsPressed]}
            >
              <Text style={styles.opsLink}>Open admin dashboard →</Text>
            </Pressable>
          </View>

          <View style={[styles.opsGrid, !isWide && styles.opsColumn]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Threat severity ${opsSeverityValue} percent. Opens threat information.`}
              onPress={() => handleNavigate('threat-information')}
              style={({ pressed }) => [
                styles.opsCard,
                !isWide && styles.opsCardNarrow,
                pressed && styles.opsPressed,
              ]}
            >
              <Text style={styles.opsCardTitle}>Threat severity</Text>
              <ArcGauge kind="threat" value={opsSeverityValue} progress={opsProgress} size={isWide ? 208 : 178} />
              <View style={styles.opsLegend}>
                <Text style={styles.opsLegendText}>Low</Text>
                <Text style={styles.opsLegendText}>High</Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`System health ${opsHealthValue} percent, normal. Opens the system health screen.`}
              onPress={() => handleNavigate('system-health')}
              style={({ pressed }) => [
                styles.opsCard,
                !isWide && styles.opsCardNarrow,
                pressed && styles.opsPressed,
              ]}
            >
              <Text style={styles.opsCardTitle}>System health</Text>
              <ArcGauge kind="health" value={opsHealthValue} progress={opsProgress} size={isWide ? 208 : 178} />
              <Text style={styles.opsNote}>All services operational · 99.98% uptime</Text>
            </Pressable>

            <View style={[styles.opsCard, !isWide && styles.opsCardNarrow]}>
              <Text style={styles.opsCardTitle}>Alert statistics</Text>
              <View style={styles.alertGrid}>
                {opsAlertsValue.map((alert) => (
                  <AlertTile
                    key={alert.id}
                    alert={alert}
                    progress={opsProgress}
                    onPress={() => handleNavigate(alert.target)}
                  />
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.opsFootnote}>
            {live
              ? 'Live figures from the scanner database · engine heuristic-v1.'
              : 'Illustrative figures from the demo snapshot — not live monitoring output.'}
          </Text>
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
  dashboard: {
    width: '100%',
    marginTop: 54,
    backgroundColor: C.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E3ECF8',
    padding: 22,
    shadowColor: '#7EA7DC',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  dashboardWide: {
    padding: 28,
  },
  dashHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 14,
  },
  dashHeaderText: {
    flexShrink: 1,
    minWidth: 220,
  },
  dashTitle: {
    color: C.navy,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dashSubtitle: {
    color: C.muted,
    fontSize: 15,
    marginTop: 4,
  },
  dashControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: '#EEF4FC',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentActive: {
    backgroundColor: C.blue,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentPressed: {
    opacity: 0.7,
  },
  segmentText: {
    color: C.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: C.white,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EEF4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatedText: {
    color: '#8A9BB5',
    fontSize: 12,
    marginTop: 10,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 16,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '23%',
    minWidth: 150,
    backgroundColor: '#FAFCFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3ECF8',
    padding: 16,
  },
  statCardNarrow: {
    flexBasis: '47%',
  },
  cardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.995 }],
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    color: C.navy,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  statLabel: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  statDetail: {
    color: C.muted,
    fontSize: 13,
    marginTop: 2,
  },
  quotaTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E3ECF8',
    marginTop: 10,
    marginBottom: 2,
    overflow: 'hidden',
  },
  quotaFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: C.blue,
  },
  dashBottom: {
    gap: 14,
    marginTop: 14,
  },
  dashBottomWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  dashCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3ECF8',
    backgroundColor: '#FAFCFF',
    padding: 18,
  },
  recentCard: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '58%',
  },
  protectionCard: {
    flexGrow: 1,
    flexBasis: '38%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: '800',
  },
  cardLinkHit: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardLink: {
    color: C.blue,
    fontSize: 13,
    fontWeight: '700',
  },
  activityList: {
    gap: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  activityCopy: {
    flex: 1,
    minWidth: 0,
  },
  activityName: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipClean: {
    backgroundColor: '#E1F7EE',
  },
  chipThreat: {
    backgroundColor: '#FDE8E8',
  },
  chipScanning: {
    backgroundColor: '#FFF3DC',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextClean: {
    color: '#1E9E6F',
  },
  chipTextThreat: {
    color: '#D64545',
  },
  chipTextScanning: {
    color: '#C77F0A',
  },
  protectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  protectionRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  protectionRowTitle: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
  },
  protectionRowSub: {
    color: C.muted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#EAF1FA',
    marginVertical: 2,
  },
  toggleTrack: {
    width: 52,
    height: 30,
    borderRadius: 16,
    padding: 3,
  },
  toggleTrackOn: {
    backgroundColor: C.green,
    alignItems: 'flex-end',
  },
  toggleTrackOff: {
    backgroundColor: '#C9D6E8',
    alignItems: 'flex-start',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.white,
    shadowColor: '#3A4E6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  quickAction: {
    flexGrow: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: C.blueLight,
    paddingHorizontal: 12,
  },
  quickActionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  quickActionText: {
    color: '#0F62D9',
    fontSize: 13,
    fontWeight: '700',
  },
  navNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: C.blueLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  navNoticeText: {
    color: '#3B5B8C',
    fontSize: 13,
    flex: 1,
  },
  ops: {
    width: '100%',
    marginTop: 18,
    backgroundColor: '#101E36',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#24406B',
    padding: 22,
    shadowColor: '#0A1428',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 6,
  },
  opsWide: {
    padding: 28,
  },
  opsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  opsHeaderText: {
    flexShrink: 1,
    minWidth: 220,
  },
  opsTitle: {
    color: '#F2F7FF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  opsSubtitle: {
    color: '#8FA6C9',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  opsLinkHit: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(77,163,255,0.12)',
  },
  opsLink: {
    color: '#7FB4FF',
    fontSize: 13,
    fontWeight: '700',
  },
  opsPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  opsGrid: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  opsColumn: {
    flexDirection: 'column',
  },
  opsCard: {
    flexGrow: 1,
    flexBasis: '31%',
    minWidth: 240,
    backgroundColor: '#152847',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#27476F',
    padding: 16,
    alignItems: 'center',
  },
  opsCardNarrow: {
    width: '100%',
    flexBasis: 'auto',
  },
  opsCardTitle: {
    color: '#C9D9F2',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  gauge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeArm: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
  },
  gaugeSegment: {
    width: 9,
    height: 24,
    borderRadius: 5,
    marginTop: 5,
  },
  gaugeCenter: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeValue: {
    color: '#FFFFFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  gaugeLabel: {
    color: '#8FA6C9',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  opsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginTop: 10,
  },
  opsLegendText: {
    color: '#6E86AB',
    fontSize: 12,
    fontWeight: '600',
  },
  opsNote: {
    color: '#6E86AB',
    fontSize: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  alertGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignSelf: 'stretch',
  },
  alertTile: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: '#0C1830',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F3A61',
    padding: 12,
  },
  alertTileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  alertTileLabel: {
    color: '#8FA6C9',
    fontSize: 12,
    fontWeight: '600',
  },
  alertTileDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertTileValue: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 6,
  },
  alertSpark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 26,
    marginTop: 10,
  },
  alertSparkBar: {
    width: 6,
    borderRadius: 2,
  },
  opsFootnote: {
    color: '#5F7699',
    fontSize: 11,
    marginTop: 14,
  },
});
