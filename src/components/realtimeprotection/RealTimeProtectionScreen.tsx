import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  FileText,
  Link as LinkIcon,
  List,
  Lock,
  Mail,
  PackageSearch,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Usb,
  Users,
  Home,
  Zap,
  X,
} from "lucide-react-native";

type FeedStatus = "Scanning" | "Clean" | "Blocked";

type FeedEvent = {
  id: number;
  time: string;
  item: string;
  detail: string;
  kind: "Download" | "Link" | "Email" | "USB";
  status: FeedStatus;
};

type LayerKey = "downloads" | "links" | "email" | "usb";

const INITIAL_FEED: FeedEvent[] = [
  {
    id: 4,
    time: "09:41:12 AM",
    item: "setup-wizard.exe",
    detail: "Blocked before it touched the disk (Trojan signature)",
    kind: "Download",
    status: "Blocked",
  },
  {
    id: 3,
    time: "09:38:47 AM",
    item: "https://bit.ly/abc123",
    detail: "Redirect resolved, page clean — allowed",
    kind: "Link",
    status: "Clean",
  },
  {
    id: 2,
    time: "09:31:05 AM",
    item: "Invoice_2419.pdf",
    detail: "Email attachment scanned, no active content",
    kind: "Email",
    status: "Clean",
  },
  {
    id: 1,
    time: "09:22:58 AM",
    item: "backup-drive-usb.zip",
    detail: "Blocked — masqueraded as an archive (double extension)",
    kind: "USB",
    status: "Blocked",
  },
];

/** Deterministic script the "Simulate event" button walks through. */
const SIMULATED_EVENTS: Array<Omit<FeedEvent, "id" | "time" | "status">> = [
  {
    item: "annual-report-2025.pdf",
    detail: "Downloading from https://files.example.com…",
    kind: "Download",
  },
  {
    item: "https://cdn-media.example.net/movie",
    detail: "Checking link reputation…",
    kind: "Link",
  },
  {
    item: "presentation-final.pptx",
    detail: "Downloading from mail attachment…",
    kind: "Email",
  },
  {
    item: "photos-backup-usb.rar",
    detail: "USB drive mounted — inspecting files…",
    kind: "USB",
  },
  {
    item: "free-tool-installer.exe",
    detail: "Downloading from https://downloads.example.io…",
    kind: "Download",
  },
];

const SIM_OUTCOMES: FeedStatus[] = ["Clean", "Clean", "Blocked", "Clean"];

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home },
  { label: "Scans", icon: Search },
  { label: "Quarantine", icon: PackageSearch },
  { label: "Users", icon: Users },
  { label: "Settings", icon: Settings },
  { label: "Threat Intelligence", icon: ShieldCheck },
  { label: "Help Content", icon: BookOpen },
  { label: "System Health", icon: Activity },
  { label: "Audit Logs", icon: FileText },
  { label: "Real-Time Protection", icon: Zap },
  { label: "Privacy Audit", icon: Lock },
];

const LAYERS: Array<{ key: LayerKey; title: string; sub: string; icon: typeof Download }> = [
  {
    key: "downloads",
    title: "Download scanning",
    sub: "Every file is inspected the moment the download starts",
    icon: Download,
  },
  {
    key: "links",
    title: "Link & URL checking",
    sub: "Links in messages, mail and pages are checked before opening",
    icon: LinkIcon,
  },
  {
    key: "email",
    title: "Email attachment scanning",
    sub: "Attachments are unpacked and scanned in a sandbox",
    icon: Mail,
  },
  {
    key: "usb",
    title: "Removable drive scanning",
    sub: "USB and external drives are scanned on mount",
    icon: Usb,
  },
];

const clockTime = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = `${now.getMinutes()}`.padStart(2, "0");
  const seconds = `${now.getSeconds()}`.padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes}:${seconds} ${meridiem}`;
};

function Brand() {
  return (
    <View style={styles.brand}>
      <View style={styles.brandMark}>
        <ShieldCheck size={25} color="#FFFFFF" strokeWidth={2.8} />
      </View>
      <Text style={styles.brandName}>
        Security <Text style={styles.brandAccent}>Scanner</Text>
      </Text>
    </View>
  );
}

function Sidebar({ compact }: { compact: boolean }) {
  const [active, setActive] = useState("Real-Time Protection");

  return (
    <View style={[styles.sidebar, compact && styles.sidebarCompact]}>
      <Brand />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.navList}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const selected = item.label === active;
          return (
            <TouchableOpacity
              key={item.label}
              onPress={() => setActive(item.label)}
              style={[styles.navItem, selected && styles.navItemActive]}
              accessibilityRole="button"
              accessibilityLabel={item.label}
            >
              <Icon
                size={21}
                color="#F7FAFF"
                strokeWidth={selected ? 2.7 : 2.3}
              />
              {!compact && <Text style={styles.navText}>{item.label}</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {!compact && (
        <View style={styles.sidebarFooter}>
          <View style={styles.healthFooterRow}>
            <View style={styles.footerShield}>
              <ShieldCheck size={22} color="#39B9FF" strokeWidth={2.7} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerTitle}>Engine v2.4.1</Text>
              <Text style={styles.footerSub}>Threat signatures current</Text>
            </View>
          </View>
          <View style={styles.sidebarDivider} />
          <Text style={styles.versionText}>Security Scanner v1.0.0</Text>
        </View>
      )}
    </View>
  );
}

function TopBar({ compact, onNotice }: { compact: boolean; onNotice: (text: string) => void }) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity
        style={styles.iconButton}
        accessibilityLabel="Open menu"
        onPress={() => onNotice("Use the sidebar links to move between admin screens.")}
      >
        <List size={23} color="#5574B5" />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity
        style={styles.notificationButton}
        accessibilityLabel="Notifications"
        onPress={() => onNotice("No new protection notifications.")}
      >
        <Bell size={22} color="#5574B5" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.adminButton}
        onPress={() => onNotice("Connect this menu to your account actions.")}
      >
        <View style={styles.adminAvatar}>
          <Text style={styles.adminAvatarText}>AD</Text>
        </View>
        {!compact && (
          <>
            <Text style={styles.adminName}>Admin</Text>
            <ChevronDown size={16} color="#5574B5" />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function PageHeading({ compact }: { compact: boolean }) {
  return (
    <View style={styles.pageHeading}>
      <View style={styles.pageHeadingIcon}>
        <Zap size={compact ? 31 : 40} color="#0877FF" strokeWidth={2.8} />
      </View>
      <View style={styles.headingCopy}>
        <Text style={[styles.pageTitle, compact && styles.pageTitleCompact]}>
          Real-Time Download / Link Protection
        </Text>
        <Text style={styles.pageSubtitle}>
          Downloads and links are scanned the moment they arrive.
        </Text>
      </View>
    </View>
  );
}

function StatusPill({ status, pulse }: { status: FeedStatus; pulse: Animated.Value }) {
  const scanning = status === "Scanning";
  const blocked = status === "Blocked";
  const opacity = scanning ? pulse : 1;

  return (
    <Animated.View
      style={[
        styles.statusPill,
        scanning
          ? styles.pillScanning
          : blocked
            ? styles.pillBlocked
            : styles.pillClean,
        { opacity },
      ]}
    >
      {scanning ? null : blocked ? (
        <X size={12} color="#FFFFFF" strokeWidth={3.2} />
      ) : (
        <Check size={12} color="#FFFFFF" strokeWidth={3.2} />
      )}
      <Text style={styles.statusPillText}>{status}</Text>
    </Animated.View>
  );
}

function KindPill({ kind }: { kind: FeedEvent["kind"] }) {
  return (
    <View style={styles.kindPill}>
      <Text style={styles.kindPillText}>{kind}</Text>
    </View>
  );
}

export default function RealTimeProtectionScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 1100;
  const narrow = width < 760;

  const [protectionOn, setProtectionOn] = useState(true);
  const [pausedUntil, setPausedUntil] = useState<string | null>(null);
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    downloads: true,
    links: true,
    email: true,
    usb: false,
  });
  const [feed, setFeed] = useState<FeedEvent[]>(INITIAL_FEED);
  const [blocked, setBlocked] = useState(3);
  const [linksChecked, setLinksChecked] = useState(128);
  const [downloadsScanned, setDownloadsScanned] = useState(57);
  const [notice, setNotice] = useState("");

  const pulse = useRef(new Animated.Value(1)).current;
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const simStep = useRef(0);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 620,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 620,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [pulse]);

  const activeLayers = useMemo(
    () => Object.values(layers).filter(Boolean).length,
    [layers],
  );

  const paused = !protectionOn || pausedUntil !== null;

  const showNotice = useCallback((text: string) => {
    setNotice(text);
  }, []);

  const toggleProtection = (value: boolean) => {
    setProtectionOn(value);
    if (value) {
      setPausedUntil(null);
      showNotice("Real-time protection resumed — downloads and links are scanned again.");
    } else {
      setPausedUntil(null);
      showNotice("Real-time protection is OFF. New downloads are NOT being scanned.");
    }
  };

  const pauseFor = (label: string) => {
    setProtectionOn(false);
    setPausedUntil(label);
    showNotice(`Protection paused for ${label}. Tap "Resume now" to turn it back on.`);
  };

  const toggleLayer = (key: LayerKey, value: boolean) => {
    if (paused) {
      showNotice("Turn real-time protection on before changing its layers.");
      return;
    }
    setLayers((current) => ({ ...current, [key]: value }));
    const layer = LAYERS.find((item) => item.key === key);
    showNotice(
      `${layer?.title ?? "Layer"} ${value ? "enabled" : "disabled"} — ${value ? "active" : "skipped"} for new items.`,
    );
  };

  const simulateEvent = () => {
    if (paused) {
      showNotice("Protection is paused — nothing is being scanned right now.");
      return;
    }
    const template = SIMULATED_EVENTS[simStep.current % SIMULATED_EVENTS.length];
    const outcome = SIM_OUTCOMES[simStep.current % SIM_OUTCOMES.length];
    simStep.current += 1;

    const id = Date.now();
    const started: FeedEvent = { id, time: clockTime(), status: "Scanning", ...template };
    setFeed((current) => [started, ...current].slice(0, 12));

    const timer = setTimeout(() => {
      setFeed((current) =>
        current.map((event) =>
          event.id === id
            ? {
                ...event,
                status: outcome,
                detail:
                  outcome === "Blocked"
                    ? "Blocked — threat signature matched in the stream"
                    : "Scanned in the stream — no threats found",
              }
            : event,
        ),
      );
      if (outcome === "Blocked") {
        setBlocked((value) => value + 1);
        showNotice(`${template.item} was blocked in real time.`);
      } else if (template.kind === "Link") {
        setLinksChecked((value) => value + 1);
      } else {
        setDownloadsScanned((value) => value + 1);
      }
    }, 1400);
    timers.current.push(timer);
  };

  const clearFeed = () => {
    setFeed([]);
    showNotice("Live feed cleared — the engine keeps running in the background.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.app}>
        {!narrow && <Sidebar compact={compact} />}
        <View style={styles.mainArea}>
          <TopBar compact={narrow} onNotice={showNotice} />
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={[styles.content, narrow && styles.contentNarrow]}
            showsVerticalScrollIndicator={false}
          >
            {narrow && <Sidebar compact />}
            <PageHeading compact={compact} />

            {!!notice && (
              <Pressable onPress={() => setNotice("")} style={styles.notice}>
                <ShieldCheck size={17} color="#0877FF" strokeWidth={2.5} />
                <Text style={styles.noticeText}>{notice}</Text>
                <X size={15} color="#7188BD" />
              </Pressable>
            )}

            {/* Master status hero */}
            <View
              style={[
                styles.hero,
                paused ? styles.heroPaused : styles.heroActive,
                compact && styles.heroCompact,
              ]}
            >
              <View
                style={[
                  styles.heroIcon,
                  paused ? styles.heroIconPaused : styles.heroIconActive,
                ]}
              >
                {paused ? (
                  <ShieldAlert size={34} color={pausedUntil ? "#C77700" : "#FF3B45"} strokeWidth={2.4} />
                ) : (
                  <ShieldCheck size={34} color="#00A86B" strokeWidth={2.4} />
                )}
              </View>
              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>
                  {paused
                    ? pausedUntil
                      ? `Protection paused for ${pausedUntil}`
                      : "Real-time protection is OFF"
                    : "Real-time protection is ON"}
                </Text>
                <Text style={styles.heroSub}>
                  {paused
                    ? "New downloads and links are NOT being scanned."
                    : "Every download and link is scanned in the stream — last threat blocked 12 minutes ago."}
                </Text>
                {paused && (
                  <TouchableOpacity
                    style={styles.resumeButton}
                    onPress={() => toggleProtection(true)}
                  >
                    <Zap size={15} color="#FFFFFF" strokeWidth={2.6} />
                    <Text style={styles.resumeText}>Resume now</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Switch
                value={protectionOn}
                onValueChange={toggleProtection}
                trackColor={{ false: "#C9D6EE", true: "#00A86B" }}
                thumbColor="#FFFFFF"
                style={styles.heroSwitch}
                accessibilityLabel="Real-time protection"
              />
            </View>

            {!paused && (
              <View style={styles.pauseRow}>
                <Text style={styles.pauseLabel}>Pause briefly:</Text>
                {["15 minutes", "1 hour", "Until tomorrow"].map((label) => (
                  <TouchableOpacity
                    key={label}
                    style={styles.pauseChip}
                    onPress={() => pauseFor(label)}
                  >
                    <Text style={styles.pauseChipText}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Stats */}
            <View style={[styles.statsGrid, compact && styles.statsGridCompact]}>
              <View style={[styles.statCard, compact && styles.statCardCompact]}>
                <View style={styles.statIconRed}>
                  <ShieldAlert size={19} color="#FF3B45" strokeWidth={2.5} />
                </View>
                <View style={styles.statCopy}>
                  <Text style={styles.statValue}>{blocked}</Text>
                  <Text style={styles.statLabel}>Threats blocked today</Text>
                </View>
              </View>
              <View style={[styles.statCard, compact && styles.statCardCompact]}>
                <View style={styles.statIconBlue}>
                  <LinkIcon size={19} color="#0877FF" strokeWidth={2.5} />
                </View>
                <View style={styles.statCopy}>
                  <Text style={styles.statValue}>{linksChecked}</Text>
                  <Text style={styles.statLabel}>Links checked today</Text>
                </View>
              </View>
              <View style={[styles.statCard, compact && styles.statCardCompact]}>
                <View style={styles.statIconTeal}>
                  <Download size={19} color="#0E9F8A" strokeWidth={2.5} />
                </View>
                <View style={styles.statCopy}>
                  <Text style={styles.statValue}>{downloadsScanned}</Text>
                  <Text style={styles.statLabel}>Downloads scanned</Text>
                </View>
              </View>
              <View style={[styles.statCard, compact && styles.statCardCompact]}>
                <View style={styles.statIconAmber}>
                  <Zap size={19} color="#C77700" strokeWidth={2.5} />
                </View>
                <View style={styles.statCopy}>
                  <Text style={styles.statValue}>0.4s</Text>
                  <Text style={styles.statLabel}>Avg. scan time</Text>
                </View>
              </View>
            </View>

            {/* Protection layers */}
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.smallHeaderIcon}>
                  <ShieldCheck size={23} color="#0877FF" strokeWidth={2.8} />
                </View>
                <View style={styles.panelTitleGroup}>
                  <Text style={styles.panelTitle}>Protection layers</Text>
                  <Text style={styles.panelSubtitle}>
                    {paused ? "All layers idle — protection is paused." : `${activeLayers} of 4 layers active`}
                  </Text>
                </View>
              </View>
              {LAYERS.map((layer, index) => {
                const Icon = layer.icon;
                const enabled = layers[layer.key];
                return (
                  <View
                    key={layer.key}
                    style={[styles.layerRow, index === LAYERS.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={[styles.layerIcon, enabled && !paused && styles.layerIconOn]}>
                      <Icon
                        size={19}
                        color={enabled && !paused ? "#0877FF" : "#7188BD"}
                        strokeWidth={2.4}
                      />
                    </View>
                    <View style={styles.layerCopy}>
                      <Text style={styles.layerTitle}>{layer.title}</Text>
                      <Text style={styles.layerSub}>{layer.sub}</Text>
                    </View>
                    <Switch
                      value={enabled}
                      onValueChange={(value) => toggleLayer(layer.key, value)}
                      trackColor={{ false: "#C9D6EE", true: "#0877FF" }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel={layer.title}
                    />
                  </View>
                );
              })}
            </View>

            {/* Live feed */}
            <View style={styles.panel}>
              <View style={[styles.panelHeader, compact && styles.panelHeaderCompact]}>
                <View style={styles.smallHeaderIcon}>
                  <Activity size={23} color="#0877FF" strokeWidth={2.8} />
                </View>
                <View style={styles.panelTitleGroup}>
                  <Text style={styles.panelTitle}>Live protection feed</Text>
                  <Text style={styles.panelSubtitle}>
                    {paused ? "Paused — no items are being scanned." : "Most recent downloads and links, newest first."}
                  </Text>
                </View>
                <View style={[styles.feedActions, compact && styles.feedActionsCompact]}>
                  <TouchableOpacity
                    style={[styles.feedButton, styles.feedButtonPrimary]}
                    onPress={simulateEvent}
                  >
                    <Zap size={15} color="#FFFFFF" strokeWidth={2.6} />
                    <Text style={styles.feedButtonPrimaryText}>Simulate event</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.feedButton} onPress={clearFeed}>
                    <Text style={styles.feedButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {feed.length ? (
                feed.map((event, index) => (
                  <View
                    key={event.id}
                    style={[styles.feedRow, index === 0 && styles.feedRowFirst, index === feed.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <View style={styles.feedTimeCol}>
                      <Text style={styles.feedTime}>{event.time}</Text>
                    </View>
                    <View style={styles.feedMain}>
                      <View style={styles.feedItemRow}>
                        {event.kind === "Link" ? (
                          <LinkIcon size={15} color="#0877FF" strokeWidth={2.6} />
                        ) : event.kind === "Email" ? (
                          <Mail size={15} color="#7A5AF8" strokeWidth={2.6} />
                        ) : event.kind === "USB" ? (
                          <Usb size={15} color="#C77700" strokeWidth={2.6} />
                        ) : (
                          <Download size={15} color="#0E9F8A" strokeWidth={2.6} />
                        )}
                        <Text numberOfLines={1} style={styles.feedItem}>
                          {event.item}
                        </Text>
                        <KindPill kind={event.kind} />
                      </View>
                      <Text numberOfLines={1} style={styles.feedDetail}>
                        {event.detail}
                      </Text>
                    </View>
                    <StatusPill status={event.status} pulse={pulse} />
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <CircleCheck size={22} color="#00A86B" strokeWidth={2.4} />
                  <Text style={styles.emptyStateText}>
                    Feed is clear — nothing scanned in this session yet.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FF",
  },
  app: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F4F8FF",
  },
  sidebar: {
    width: 272,
    backgroundColor: "#101E30",
    borderRightWidth: 1,
    borderRightColor: "#203A56",
    paddingBottom: 20,
  },
  sidebarCompact: {
    width: 76,
  },
  brand: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#203A56",
    gap: 12,
  },
  brandMark: {
    width: 37,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0877FF",
    borderRadius: 12,
  },
  brandName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.45,
  },
  brandAccent: {
    color: "#38BDF8",
  },
  navList: {
    paddingHorizontal: 10,
    paddingTop: 22,
    gap: 7,
  },
  navItem: {
    minHeight: 48,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
    borderRadius: 9,
  },
  navItemActive: {
    backgroundColor: "#174A8D",
    borderWidth: 1,
    borderColor: "#1C579E",
  },
  navText: {
    color: "#F5F8FF",
    fontSize: 14,
    fontWeight: "500",
  },
  sidebarFooter: {
    marginTop: "auto",
    marginHorizontal: 17,
    paddingTop: 17,
  },
  healthFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  footerShield: {
    width: 34,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  footerTitle: {
    color: "#F4F8FF",
    fontWeight: "700",
    fontSize: 12,
  },
  footerSub: {
    color: "#9CCFFF",
    fontSize: 11,
    marginTop: 4,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: "#203A56",
    marginTop: 18,
    marginBottom: 18,
  },
  versionText: {
    color: "#9CCFFF",
    fontSize: 11,
    textAlign: "center",
  },
  mainArea: {
    flex: 1,
    minWidth: 0,
  },
  topBar: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2ECFF",
  },
  iconButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 21,
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4048",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  adminAvatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D2045",
  },
  adminAvatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  adminName: {
    color: "#0D2045",
    fontWeight: "600",
    fontSize: 14,
  },
  contentScroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 27,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 23,
  },
  contentNarrow: {
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 16,
  },
  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    minHeight: 78,
  },
  pageHeadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#DFECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: {
    flex: 1,
    minWidth: 0,
  },
  pageTitle: {
    color: "#0B1F4B",
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  pageTitleCompact: {
    fontSize: 22,
  },
  pageSubtitle: {
    color: "#5574B5",
    fontSize: 14,
    marginTop: 5,
  },
  notice: {
    minHeight: 46,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#C9DFFD",
    backgroundColor: "#EAF3FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  noticeText: {
    flex: 1,
    color: "#173365",
    fontSize: 13,
    fontWeight: "500",
  },
  hero: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    padding: 20,
  },
  heroActive: {
    backgroundColor: "#F6FFFB",
    borderColor: "#BFE9D8",
  },
  heroPaused: {
    backgroundColor: "#FFF9F4",
    borderColor: "#F2D9B8",
  },
  heroCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  heroIconActive: {
    backgroundColor: "#D8F7EC",
  },
  heroIconPaused: {
    backgroundColor: "#FBEEDB",
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  heroTitle: {
    color: "#0B1F4B",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroSub: {
    color: "#5574B5",
    fontSize: 13,
    marginTop: 6,
    lineHeight: 19,
  },
  resumeButton: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#0877FF",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 36,
    alignSelf: "flex-start",
  },
  resumeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  heroSwitch: {
    transform: [{ scale: 1.15 }],
  },
  pauseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: -8,
  },
  pauseLabel: {
    color: "#5574B5",
    fontSize: 13,
    fontWeight: "600",
  },
  pauseChip: {
    minHeight: 32,
    paddingHorizontal: 13,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D7E5FF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseChipText: {
    color: "#3D5B9C",
    fontSize: 12,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 18,
  },
  statsGridCompact: {
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DDE8FF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 14,
  },
  statCardCompact: {
    minWidth: "47%",
  },
  statIconRed: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFE4E5",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconBlue: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#DCEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconTeal: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#D8F5F0",
    alignItems: "center",
    justifyContent: "center",
  },
  statIconAmber: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FBEEDB",
    alignItems: "center",
    justifyContent: "center",
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
  },
  statValue: {
    color: "#0B1F4B",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: {
    color: "#6680B6",
    fontSize: 12,
    marginTop: 2,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8FF",
    borderRadius: 10,
    overflow: "hidden",
  },
  panelHeader: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#E2ECFF",
  },
  panelHeaderCompact: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  smallHeaderIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitleGroup: {
    flex: 1,
    minWidth: 0,
  },
  panelTitle: {
    color: "#0D2351",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  panelSubtitle: {
    color: "#6680B6",
    fontSize: 12,
    marginTop: 3,
  },
  feedActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  feedActionsCompact: {
    alignSelf: "flex-start",
  },
  feedButton: {
    minHeight: 34,
    paddingHorizontal: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E5FF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  feedButtonPrimary: {
    backgroundColor: "#0877FF",
    borderColor: "#0877FF",
  },
  feedButtonPrimaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  feedButtonText: {
    color: "#3D5B9C",
    fontSize: 12,
    fontWeight: "600",
  },
  layerRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
    backgroundColor: "#FFFFFF",
  },
  layerIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF4FC",
    borderWidth: 1,
    borderColor: "#E2ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  layerIconOn: {
    backgroundColor: "#E7F1FF",
  },
  layerCopy: {
    flex: 1,
    minWidth: 0,
  },
  layerTitle: {
    color: "#102958",
    fontSize: 14,
    fontWeight: "700",
  },
  layerSub: {
    color: "#6680B6",
    fontSize: 12,
    marginTop: 3,
  },
  feedRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
    backgroundColor: "#FFFFFF",
  },
  feedRowFirst: {
    backgroundColor: "#FBFDFF",
  },
  feedTimeCol: {
    width: 96,
  },
  feedTime: {
    color: "#5C79B6",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
  feedMain: {
    flex: 1,
    minWidth: 0,
  },
  feedItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedItem: {
    color: "#102958",
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  feedDetail: {
    color: "#6680B6",
    fontSize: 12,
    marginTop: 3,
  },
  kindPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#EFF4FC",
    borderWidth: 1,
    borderColor: "#E2ECFF",
  },
  kindPillText: {
    color: "#3D5B9C",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  statusPill: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pillClean: {
    backgroundColor: "#00A86B",
  },
  pillBlocked: {
    backgroundColor: "#FF3B45",
  },
  pillScanning: {
    backgroundColor: "#0877FF",
  },
  statusPillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  emptyState: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    color: "#6680B6",
    fontSize: 13,
  },
});
