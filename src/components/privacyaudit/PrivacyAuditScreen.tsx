import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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
  Bell,
  BookOpen,
  Camera,
  ChevronDown,
  FileText,
  FolderLock,
  List,
  Lock,
  Mail,
  MessageSquare,
  PackageSearch,
  Search,
  Settings,
  ShieldCheck,
  ShieldQuestion,
  Users,
  Home,
  Zap,
  MapPin,
  BellRing,
  X,
} from "lucide-react-native";

type Risk = "Low" | "Medium" | "High";

type AppAccess = {
  id: number;
  app: string;
  permission: string;
  lastAccess: string;
  risk: Risk;
};

type Recommendation = {
  id: number;
  text: string;
  action: "revoke" | "review";
  appId?: number;
};

type PermissionKey = "camera" | "microphone" | "location" | "contacts" | "files" | "notifications";

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

const PERMISSIONS: Array<{
  key: PermissionKey;
  title: string;
  apps: string;
  lastUsed: string;
  icon: typeof Camera;
}> = [
  { key: "camera", title: "Camera", apps: "2 apps", lastUsed: "2h ago", icon: Camera },
  { key: "microphone", title: "Microphone", apps: "1 app", lastUsed: "Yesterday", icon: MessageSquare },
  { key: "location", title: "Location", apps: "1 app", lastUsed: "32 days ago", icon: MapPin },
  { key: "contacts", title: "Contacts", apps: "1 app", lastUsed: "3 days ago", icon: Mail },
  { key: "files", title: "Files & folders", apps: "3 apps", lastUsed: "5m ago", icon: FolderLock },
  { key: "notifications", title: "Notifications", apps: "4 apps", lastUsed: "1h ago", icon: BellRing },
];

const INITIAL_APPS: AppAccess[] = [
  { id: 1, app: "Cloud Backup", permission: "Files & folders", lastAccess: "5m ago", risk: "Low" },
  { id: 2, app: "Photo Editor Pro", permission: "Camera", lastAccess: "2h ago", risk: "Medium" },
  { id: 3, app: "Chat Messenger", permission: "Microphone", lastAccess: "Yesterday", risk: "Medium" },
  { id: 4, app: "Free Game", permission: "Location", lastAccess: "32 days ago", risk: "High" },
  { id: 5, app: "Fitness Tracker", permission: "Contacts", lastAccess: "3 days ago", risk: "High" },
  { id: 6, app: "News Reader", permission: "Notifications", lastAccess: "1h ago", risk: "Low" },
];

const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 1,
    text: "Free Game hasn't used Location in 32 days — revoke the access.",
    action: "revoke",
    appId: 4,
  },
  {
    id: 2,
    text: "Fitness Tracker reads your Contacts but doesn't need them.",
    action: "revoke",
    appId: 5,
  },
  {
    id: 3,
    text: "4 apps are allowed to start with the device — review startup apps.",
    action: "review",
  },
];

const RISK_GAIN: Record<Risk, number> = { High: 5, Medium: 3, Low: 2 };

const clockStamp = () => {
  const now = new Date();
  let hours = now.getHours();
  const minutes = `${now.getMinutes()}`.padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `Audited ${hours}:${minutes} ${meridiem}`;
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
  const [active, setActive] = useState("Privacy Audit");

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
              <Text style={styles.footerTitle}>Privacy posture</Text>
              <Text style={styles.footerSub}>Permissions reviewed weekly</Text>
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
        onPress={() => onNotice("No new privacy notifications.")}
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
        <Lock size={compact ? 31 : 40} color="#0877FF" strokeWidth={2.8} />
      </View>
      <View style={styles.headingCopy}>
        <Text style={[styles.pageTitle, compact && styles.pageTitleCompact]}>
          Privacy &amp; Permission Audit
        </Text>
        <Text style={styles.pageSubtitle}>
          See which apps use your data and tighten permissions.
        </Text>
      </View>
    </View>
  );
}

function RiskPill({ risk }: { risk: Risk }) {
  return (
    <View
      style={[
        styles.riskPill,
        risk === "High"
          ? styles.riskHigh
          : risk === "Medium"
            ? styles.riskMedium
            : styles.riskLow,
      ]}
    >
      <Text
        style={[
          styles.riskText,
          risk === "High"
            ? styles.riskTextHigh
            : risk === "Medium"
              ? styles.riskTextMedium
              : styles.riskTextLow,
        ]}
      >
        {risk} risk
      </Text>
    </View>
  );
}

export default function PrivacyAuditScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 1100;
  const narrow = width < 760;

  const [score, setScore] = useState(78);
  const [auditedAt, setAuditedAt] = useState("Audited today, 09:12 AM");
  const [auditing, setAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [permissions, setPermissions] = useState<Record<PermissionKey, boolean>>({
    camera: true,
    microphone: true,
    location: true,
    contacts: true,
    files: true,
    notifications: true,
  });
  const [apps, setApps] = useState<AppAccess[]>(INITIAL_APPS);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    INITIAL_RECOMMENDATIONS,
  );
  const [notice, setNotice] = useState("");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const grantedCount = useMemo(
    () => Object.values(permissions).filter(Boolean).length,
    [permissions],
  );

  const scoreTone = score >= 80 ? "#00A86B" : score >= 60 ? "#C77700" : "#FF3B45";
  const scoreLabel = score >= 80 ? "Good" : score >= 60 ? "Needs attention" : "At risk";

  const showNotice = useCallback((text: string) => {
    setNotice(text);
  }, []);

  const revokeApp = useCallback(
    (app: AppAccess, viaRecommendation?: boolean) => {
      setApps((current) => current.filter((row) => row.id !== app.id));
      setScore((value) => Math.min(99, value + RISK_GAIN[app.risk]));
      if (viaRecommendation) {
        setRecommendations((current) => current.filter((rec) => rec.appId !== app.id));
      }
      showNotice(`${app.app} no longer has ${app.permission.toLowerCase()} access.`);
    },
    [showNotice],
  );

  const actOnRecommendation = useCallback(
    (rec: Recommendation) => {
      if (rec.action === "revoke") {
        const app = apps.find((row) => row.id === rec.appId);
        if (app) {
          revokeApp(app, true);
          return;
        }
        setRecommendations((current) => current.filter((item) => item.id !== rec.id));
        showNotice("That access is already revoked.");
        return;
      }
      showNotice("Startup-app review is not part of this audit yet — dismissed for now.");
      setRecommendations((current) => current.filter((item) => item.id !== rec.id));
    },
    [apps, revokeApp, showNotice],
  );

  const togglePermission = (key: PermissionKey, value: boolean) => {
    setPermissions((current) => ({ ...current, [key]: value }));
    setScore((current) => Math.min(99, Math.max(20, current + (value ? -1 : 1))));
    const permission = PERMISSIONS.find((item) => item.key === key);
    showNotice(
      `${permission?.title ?? "Permission"} ${value ? "granted again" : "revoked"} — ${value ? "apps can use it" : "apps are blocked"}.`,
    );
  };

  const runAudit = () => {
    if (auditing) return;
    setAuditing(true);
    setProgress(0);
    setNotice("");
    const tick = setInterval(() => {
      setProgress((value) => Math.min(100, value + 7));
    }, 90);
    intervalRef.current = tick;
    // The audit resolves after ~1.5s; the bar has been filling meanwhile.
    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      setProgress(100);
      setAuditing(false);
      const resolvedGain =
        recommendations.filter((rec) => rec.action === "revoke").length * 4;
      setScore((current) => Math.min(99, current + 8 + resolvedGain));
      setAuditedAt(clockStamp());
      showNotice(
        "Audit complete — unused permissions surfaced below. Revoke or review each one.",
      );
    }, 1500);
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

            {/* Privacy score */}
            <View style={[styles.scoreCard, compact && styles.scoreCardCompact]}>
              <View style={styles.scoreRing}>
                <Text style={[styles.scoreValue, { color: scoreTone }]}>{score}</Text>
                <Text style={styles.scoreOutOf}>/100</Text>
              </View>
              <View style={styles.scoreCopy}>
                <Text style={styles.scoreTitle}>
                  Privacy score: <Text style={{ color: scoreTone }}>{scoreLabel}</Text>
                </Text>
                <Text style={styles.scoreSub}>
                  {grantedCount} of {PERMISSIONS.length} permission groups granted ·{" "}
                  {apps.length} apps with access · {auditedAt}
                </Text>
                <View style={styles.scoreBarTrack}>
                  <View
                    style={[
                      styles.scoreBarFill,
                      { width: `${score}%`, backgroundColor: scoreTone },
                    ]}
                  />
                </View>
                {auditing && (
                  <Text style={styles.auditProgress}>Auditing apps and permissions… {progress}%</Text>
                )}
                <TouchableOpacity
                  style={[styles.auditButton, auditing && styles.auditButtonBusy]}
                  onPress={runAudit}
                  disabled={auditing}
                >
                  <ShieldQuestion size={15} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.auditButtonText}>
                    {auditing ? "Auditing…" : "Re-run full audit"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Permissions */}
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.smallHeaderIcon}>
                  <Lock size={23} color="#0877FF" strokeWidth={2.8} />
                </View>
                <View style={styles.panelTitleGroup}>
                  <Text style={styles.panelTitle}>Device permissions</Text>
                  <Text style={styles.panelSubtitle}>
                    Toggle a group to grant or revoke it for every app at once.
                  </Text>
                </View>
              </View>
              {PERMISSIONS.map((permission, index) => {
                const Icon = permission.icon;
                const granted = permissions[permission.key];
                return (
                  <View
                    key={permission.key}
                    style={[
                      styles.permissionRow,
                      index === PERMISSIONS.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={[styles.permissionIcon, granted && styles.permissionIconOn]}>
                      <Icon
                        size={19}
                        color={granted ? "#0877FF" : "#7188BD"}
                        strokeWidth={2.4}
                      />
                    </View>
                    <View style={styles.permissionCopy}>
                      <Text style={styles.permissionTitle}>{permission.title}</Text>
                      <Text style={styles.permissionSub}>
                        {permission.apps} · last used {permission.lastUsed}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.permissionState,
                        granted ? styles.permissionStateOn : styles.permissionStateOff,
                      ]}
                    >
                      {granted ? "Granted" : "Revoked"}
                    </Text>
                    <Switch
                      value={granted}
                      onValueChange={(value) => togglePermission(permission.key, value)}
                      trackColor={{ false: "#C9D6EE", true: "#0877FF" }}
                      thumbColor="#FFFFFF"
                      accessibilityLabel={permission.title}
                    />
                  </View>
                );
              })}
            </View>

            {/* App access table */}
            <View style={styles.panel}>
              <View style={[styles.panelHeader, compact && styles.panelHeaderCompact]}>
                <View style={styles.smallHeaderIcon}>
                  <Users size={23} color="#0877FF" strokeWidth={2.8} />
                </View>
                <View style={styles.panelTitleGroup}>
                  <Text style={styles.panelTitle}>Which app used what</Text>
                  <Text style={styles.panelSubtitle}>
                    Revoking removes the access immediately and raises the score.
                  </Text>
                </View>
              </View>
              <View style={styles.table}>
                <View style={styles.tableHead}>
                  <Text style={[styles.tableHeaderText, styles.colApp]}>App</Text>
                  <Text style={[styles.tableHeaderText, styles.colPerm]}>Permission</Text>
                  <Text style={[styles.tableHeaderText, styles.colAccess]}>Last access</Text>
                  <Text style={[styles.tableHeaderText, styles.colRisk]}>Risk</Text>
                  <Text style={[styles.tableHeaderText, styles.colAction]}>Action</Text>
                </View>
                {apps.length ? (
                  apps.map((app) => (
                    <View key={app.id} style={styles.tableRow}>
                      <Text numberOfLines={1} style={[styles.tableCellText, styles.colApp, styles.appName]}>
                        {app.app}
                      </Text>
                      <Text numberOfLines={1} style={[styles.tableCellText, styles.colPerm]}>
                        {app.permission}
                      </Text>
                      <Text style={[styles.tableCellText, styles.colAccess, styles.mutedText]}>
                        {app.lastAccess}
                      </Text>
                      <View style={styles.colRisk}>
                        <RiskPill risk={app.risk} />
                      </View>
                      <View style={styles.colAction}>
                        <TouchableOpacity
                          style={styles.revokeButton}
                          onPress={() => revokeApp(app)}
                        >
                          <X size={13} color="#E5252D" strokeWidth={3} />
                          <Text style={styles.revokeText}>Revoke</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <ShieldCheck size={22} color="#00A86B" strokeWidth={2.4} />
                    <Text style={styles.emptyStateText}>
                      Every app's access has been revoked. Clean slate.
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Recommendations */}
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.smallHeaderIcon}>
                  <ShieldQuestion size={23} color="#0877FF" strokeWidth={2.8} />
                </View>
                <View style={styles.panelTitleGroup}>
                  <Text style={styles.panelTitle}>Recommendations</Text>
                  <Text style={styles.panelSubtitle}>
                    Acting on these raises the privacy score.
                  </Text>
                </View>
              </View>
              {recommendations.length ? (
                recommendations.map((rec, index) => (
                  <View
                    key={rec.id}
                    style={[
                      styles.recRow,
                      index === recommendations.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={styles.recIcon}>
                      <ShieldQuestion size={16} color="#C77700" strokeWidth={2.6} />
                    </View>
                    <Text style={styles.recText}>{rec.text}</Text>
                    <TouchableOpacity
                      style={[styles.recButton, rec.action === "revoke" && styles.recButtonDanger]}
                      onPress={() => actOnRecommendation(rec)}
                    >
                      <Text
                        style={[
                          styles.recButtonText,
                          rec.action === "revoke" && styles.recButtonTextDanger,
                        ]}
                      >
                        {rec.action === "revoke" ? "Revoke" : "Review"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <ShieldCheck size={22} color="#00A86B" strokeWidth={2.4} />
                  <Text style={styles.emptyStateText}>
                    No open recommendations — privacy posture looks healthy.
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
  scoreCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8E6FF",
    backgroundColor: "#FBFDFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 22,
    padding: 20,
  },
  scoreCardCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  scoreRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 10,
    borderColor: "#E7F1FF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },
  scoreOutOf: {
    fontSize: 11,
    color: "#6680B6",
    fontWeight: "600",
  },
  scoreCopy: {
    flex: 1,
    minWidth: 0,
  },
  scoreTitle: {
    color: "#0B1F4B",
    fontSize: 19,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  scoreSub: {
    color: "#5574B5",
    fontSize: 12.5,
    marginTop: 5,
  },
  scoreBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E7EEFC",
    marginTop: 12,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
  },
  auditProgress: {
    color: "#0877FF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  auditButton: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#0877FF",
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 38,
    alignSelf: "flex-start",
  },
  auditButtonBusy: {
    opacity: 0.75,
  },
  auditButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
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
  permissionRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
    backgroundColor: "#FFFFFF",
  },
  permissionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#EFF4FC",
    borderWidth: 1,
    borderColor: "#E2ECFF",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionIconOn: {
    backgroundColor: "#E7F1FF",
  },
  permissionCopy: {
    flex: 1,
    minWidth: 0,
  },
  permissionTitle: {
    color: "#102958",
    fontSize: 14,
    fontWeight: "700",
  },
  permissionSub: {
    color: "#6680B6",
    fontSize: 12,
    marginTop: 3,
  },
  permissionState: {
    fontSize: 12,
    fontWeight: "700",
  },
  permissionStateOn: {
    color: "#008B5B",
  },
  permissionStateOff: {
    color: "#E5252D",
  },
  table: {
    minWidth: 720,
  },
  tableHead: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#F1F6FF",
  },
  tableHeaderText: {
    color: "#102958",
    fontSize: 12,
    fontWeight: "800",
  },
  tableRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
    backgroundColor: "#FFFFFF",
  },
  tableCellText: {
    color: "#102958",
    fontSize: 13,
  },
  appName: {
    fontWeight: "700",
  },
  mutedText: {
    color: "#5C79B6",
  },
  colApp: {
    width: "26%",
    paddingRight: 10,
  },
  colPerm: {
    width: "24%",
    paddingRight: 10,
  },
  colAccess: {
    width: "18%",
    paddingRight: 10,
  },
  colRisk: {
    width: "16%",
    flexDirection: "row",
    alignItems: "center",
  },
  colAction: {
    width: "16%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 13,
  },
  riskHigh: {
    backgroundColor: "#FFE4E6",
  },
  riskMedium: {
    backgroundColor: "#FBEEDB",
  },
  riskLow: {
    backgroundColor: "#DDF8EF",
  },
  riskText: {
    fontSize: 11,
    fontWeight: "700",
  },
  riskTextHigh: {
    color: "#E5252D",
  },
  riskTextMedium: {
    color: "#C77700",
  },
  riskTextLow: {
    color: "#008B5B",
  },
  revokeButton: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F5C6C9",
    backgroundColor: "#FFF6F6",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  revokeText: {
    color: "#E5252D",
    fontSize: 12,
    fontWeight: "700",
  },
  recRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
    backgroundColor: "#FFFFFF",
  },
  recIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#FBEEDB",
    alignItems: "center",
    justifyContent: "center",
  },
  recText: {
    flex: 1,
    minWidth: 0,
    color: "#173365",
    fontSize: 13,
    lineHeight: 19,
  },
  recButton: {
    minHeight: 32,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E5FF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  recButtonDanger: {
    borderColor: "#F5C6C9",
    backgroundColor: "#FFF6F6",
  },
  recButtonText: {
    color: "#3D5B9C",
    fontSize: 12,
    fontWeight: "700",
  },
  recButtonTextDanger: {
    color: "#E5252D",
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
