import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Activity,
  AlertTriangle,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  FileText,
  Info,
  Link as LinkIcon,
  List,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  Home,
  PackageSearch,
  BookOpen,
  HeartPulse,
  X,
} from "lucide-react-native";

type AuditEvent = {
  id: number;
  time: string;
  event: string;
  result: "Success" | "Failed";
  actor: string;
  details: string;
  icon: "settings" | "user" | "scan" | "link" | "content";
};

const INITIAL_EVENTS: AuditEvent[] = [
  {
    id: 1,
    time: "Oct 30, 2025 – 09:24 AM",
    event: "Settings Update",
    result: "Success",
    actor: "Admin",
    details: "Updated quarantine retention (30 days)",
    icon: "settings",
  },
  {
    id: 2,
    time: "Oct 30, 2025 – 08:50 AM",
    event: "User Action",
    result: "Success",
    actor: "Admin",
    details: "Viewed user list",
    icon: "user",
  },
  {
    id: 3,
    time: "Oct 29, 2025 – 06:17 PM",
    event: "Scan Completed",
    result: "Success",
    actor: "Admin",
    details: "Scanned 42 files, 0 threats",
    icon: "scan",
  },
  {
    id: 4,
    time: "Oct 29, 2025 – 04:12 PM",
    event: "Link Check",
    result: "Failed",
    actor: "Admin",
    details: "Timeout checking example.com",
    icon: "link",
  },
  {
    id: 5,
    time: "Oct 29, 2025 – 11:03 AM",
    event: "Content Update",
    result: "Success",
    actor: "Admin",
    details: "Published help article",
    icon: "content",
  },
  {
    id: 6,
    time: "Oct 28, 2025 – 02:20 PM",
    event: "Scan Completed",
    result: "Success",
    actor: "Admin",
    details: "Scanned 37 files, 1 threat",
    icon: "scan",
  },
];

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
];

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
  const [active, setActive] = useState("System Health");

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
              <Text style={styles.footerTitle}>System Healthy</Text>
              <Text style={styles.footerSub}>All services running</Text>
            </View>
          </View>
          <View style={styles.sidebarDivider} />
          <Text style={styles.versionText}>Security Scanner v1.0.0</Text>
        </View>
      )}
    </View>
  );
}

function TopBar({ compact }: { compact: boolean }) {
  return (
    <View style={styles.topBar}>
      <TouchableOpacity style={styles.iconButton} accessibilityLabel="Open menu">
        <List size={23} color="#5574B5" />
      </TouchableOpacity>
      <View style={{ flex: 1 }} />
      <TouchableOpacity style={styles.notificationButton} accessibilityLabel="Notifications">
        <Bell size={22} color="#5574B5" />
        <View style={styles.notificationDot} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.adminButton}>
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
        <Activity size={compact ? 31 : 40} color="#0877FF" strokeWidth={2.8} />
      </View>
      <View style={styles.headingCopy}>
        <Text style={[styles.pageTitle, compact && styles.pageTitleCompact]}>
          System Health / Audit Logs
        </Text>
        <Text style={styles.pageSubtitle}>
          Monitor system health and review important events.
        </Text>
      </View>
      <TouchableOpacity style={styles.dateSelect}>
        <View style={styles.dateSelectInner}>
          <Clock3 size={19} color="#5574B5" />
          <Text style={styles.dateSelectText}>Last 30 days</Text>
        </View>
        <ChevronDown size={17} color="#5574B5" />
      </TouchableOpacity>
    </View>
  );
}

function Sparkline({ color }: { color: string }) {
  // A lightweight decorative trend line built from text glyphs, avoiding chart dependencies.
  return (
    <View style={styles.sparkline}>
      <View style={[styles.sparkBar, { height: 8, backgroundColor: color, opacity: 0.35 }]} />
      <View style={[styles.sparkBar, { height: 15, backgroundColor: color, opacity: 0.45 }]} />
      <View style={[styles.sparkBar, { height: 11, backgroundColor: color, opacity: 0.4 }]} />
      <View style={[styles.sparkBar, { height: 22, backgroundColor: color, opacity: 0.55 }]} />
      <View style={[styles.sparkBar, { height: 17, backgroundColor: color, opacity: 0.45 }]} />
      <View style={[styles.sparkBar, { height: 29, backgroundColor: color, opacity: 0.65 }]} />
      <View style={[styles.sparkBar, { height: 23, backgroundColor: color, opacity: 0.5 }]} />
      <View style={[styles.sparkBar, { height: 35, backgroundColor: color, opacity: 0.7 }]} />
      <View style={[styles.sparkBar, { height: 28, backgroundColor: color, opacity: 0.55 }]} />
      <View style={[styles.sparkBar, { height: 40, backgroundColor: color, opacity: 0.8 }]} />
      <View style={[styles.sparkBar, { height: 31, backgroundColor: color, opacity: 0.6 }]} />
      <View style={[styles.sparkBar, { height: 37, backgroundColor: color, opacity: 0.72 }]} />
    </View>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
  tone,
  subtitle,
}: {
  title: string;
  value: string;
  change?: string;
  icon: "check" | "alert" | "info";
  tone: "green" | "red" | "blue";
  subtitle?: string;
}) {
  const Icon = icon === "check" ? CircleCheck : icon === "alert" ? AlertTriangle : Info;
  const toneColor = tone === "green" ? "#00A86B" : tone === "red" ? "#FF3B45" : "#0877FF";

  return (
    <View style={[styles.metricCard, styles[`metric${tone.charAt(0).toUpperCase()}${tone.slice(1)}` as keyof typeof styles]]}>
      <View style={[styles.metricIconWrap, { backgroundColor: tone === "green" ? "#D9F7ED" : tone === "red" ? "#FFE4E5" : "#DCEBFF" }]}>
        <Icon size={29} color={toneColor} fill={icon === "check" || icon === "alert" ? toneColor : "none"} strokeWidth={2.6} />
      </View>
      <View style={styles.metricTextArea}>
        <Text style={styles.metricTitle}>{title}</Text>
        <View style={styles.metricValueRow}>
          <Text style={styles.metricValue}>{value}</Text>
          {change ? (
            <Text style={[styles.metricChange, { color: toneColor }]}>{change}</Text>
          ) : null}
        </View>
      </View>
      <Sparkline color={toneColor} />
      {subtitle ? <Text style={styles.metricSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function EventIcon({ type }: { type: AuditEvent["icon"] }) {
  const Icon =
    type === "settings" ? Settings :
    type === "user" ? UserRound :
    type === "link" ? LinkIcon :
    type === "content" ? FileText : ShieldCheck;

  return (
    <View style={styles.eventIcon}>
      <Icon size={15} color="#0877FF" strokeWidth={2.7} />
    </View>
  );
}

function ResultPill({ result }: { result: AuditEvent["result"] }) {
  const success = result === "Success";
  return (
    <View style={[styles.resultPill, success ? styles.resultSuccess : styles.resultFailed]}>
      {success ? (
        <Check size={13} color="#FFFFFF" strokeWidth={3} />
      ) : (
        <X size={13} color="#FFFFFF" strokeWidth={3} />
      )}
      <Text style={[styles.resultText, success ? styles.resultTextSuccess : styles.resultTextFailed]}>
        {result}
      </Text>
    </View>
  );
}

function AuditTable({ compact }: { compact: boolean }) {
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [resultFilter, setResultFilter] = useState("All Results");
  const [page, setPage] = useState(1);

  const filteredEvents = useMemo(() => {
    return INITIAL_EVENTS.filter((event) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        event.time.toLowerCase().includes(q) ||
        event.event.toLowerCase().includes(q) ||
        event.actor.toLowerCase().includes(q) ||
        event.details.toLowerCase().includes(q);
      const matchesEvent = eventFilter === "All Events" || event.event === eventFilter;
      const matchesResult = resultFilter === "All Results" || event.result === resultFilter;
      return matchesQuery && matchesEvent && matchesResult;
    });
  }, [query, eventFilter, resultFilter]);

  const selectStyle = styles.filterSelect;

  return (
    <View style={styles.panel}>
      <View style={[styles.panelHeader, compact && styles.panelHeaderCompact]}>
        <View style={styles.panelTitleGroup}>
          <View style={styles.smallHeaderIcon}>
            <List size={23} color="#0877FF" strokeWidth={2.8} />
          </View>
          <Text style={styles.panelTitle}>Recent Audit Logs</Text>
        </View>
        <View style={[styles.tableFilters, compact && styles.tableFiltersCompact]}>
          <View style={styles.searchInputWrap}>
            <Search size={19} color="#7188BD" />
            <TextInput
              value={query}
              onChangeText={(value) => {
                setQuery(value);
                setPage(1);
              }}
              placeholder="Search logs..."
              placeholderTextColor="#7B90BD"
              style={styles.searchInput}
              accessibilityLabel="Search audit logs"
            />
          </View>
          <TouchableOpacity
            style={selectStyle}
            onPress={() => setEventFilter(eventFilter === "All Events" ? "Scan Completed" : "All Events")}
          >
            <Text style={styles.filterSelectText}>{eventFilter}</Text>
            <ChevronDown size={16} color="#5574B5" />
          </TouchableOpacity>
          <TouchableOpacity
            style={selectStyle}
            onPress={() => setResultFilter(resultFilter === "All Results" ? "Failed" : "All Results")}
          >
            <Text style={styles.filterSelectText}>{resultFilter}</Text>
            <ChevronDown size={16} color="#5574B5" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.tableHeaderText, styles.colTime]}>Time</Text>
            <Text style={[styles.tableHeaderText, styles.colEvent]}>Event Type</Text>
            <Text style={[styles.tableHeaderText, styles.colResult]}>Result</Text>
            <Text style={[styles.tableHeaderText, styles.colActor]}>Actor</Text>
            <Text style={[styles.tableHeaderText, styles.colDetails]}>Details</Text>
            <View style={styles.colArrow} />
          </View>

          {filteredEvents.length ? (
            filteredEvents.map((event) => (
              <TouchableOpacity key={event.id} style={styles.tableRow} activeOpacity={0.75}>
                <Text style={[styles.tableCellText, styles.colTime]}>{event.time}</Text>
                <View style={[styles.eventCell, styles.colEvent]}>
                  <EventIcon type={event.icon} />
                  <Text style={styles.tableCellText}>{event.event}</Text>
                </View>
                <View style={[styles.colResult, styles.resultCell]}>
                  <ResultPill result={event.result} />
                </View>
                <Text style={[styles.tableCellText, styles.colActor]}>{event.actor}</Text>
                <Text style={[styles.tableCellText, styles.colDetails]} numberOfLines={1}>
                  {event.details}
                </Text>
                <View style={styles.colArrow}>
                  <ChevronRight size={21} color="#7896D5" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Search size={22} color="#7896D5" />
              <Text style={styles.emptyStateText}>No audit logs match your filters.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.tableFooter}>
        <Text style={styles.showingText}>
          Showing {filteredEvents.length ? 1 : 0}–{filteredEvents.length} of 50 events
        </Text>
        <View style={styles.pagination}>
          <TouchableOpacity
            style={styles.pageButton}
            onPress={() => setPage(Math.max(1, page - 1))}
            accessibilityLabel="Previous page"
          >
            <ChevronLeft size={18} color="#0877FF" />
          </TouchableOpacity>
          {[1, 2, 3].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setPage(n)}
              style={[styles.pageButton, page === n && styles.pageButtonActive]}
            >
              <Text style={[styles.pageButtonText, page === n && styles.pageButtonTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.paginationDots}>…</Text>
          <TouchableOpacity onPress={() => setPage(9)} style={styles.pageButton}>
            <Text style={styles.pageButtonText}>9</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pageButton}
            onPress={() => setPage(Math.min(9, page + 1))}
            accessibilityLabel="Next page"
          >
            <ChevronRight size={18} color="#0877FF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function RecentErrors({ compact }: { compact: boolean }) {
  const errors = [
    { date: "Oct 29, 2025 – 04:12 PM", label: "Link check timeout", tag: "Link", tone: "red" },
    { date: "Oct 28, 2025 – 09:11 AM", label: "Scan engine error", tag: "Scan", tone: "blue" },
    { date: "Oct 27, 2025 – 07:36 PM", label: "Database connection failed", tag: "System", tone: "purple" },
  ];

  return (
    <View style={styles.bottomPanel}>
      <View style={styles.bottomPanelHeader}>
        <View style={styles.errorIcon}>
          <AlertTriangle size={20} color="#FF343B" fill="#FF343B" />
        </View>
        <Text style={styles.bottomPanelTitle}>Recent Errors</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.viewLink}>
          <Text style={styles.viewLinkText}>View all errors</Text>
          <ChevronRight size={17} color="#0877FF" />
        </TouchableOpacity>
      </View>
      {errors.map((error) => (
        <View key={error.label} style={styles.errorRow}>
          <Text style={[styles.errorDate, compact && styles.errorDateCompact]}>{error.date}</Text>
          <Text style={styles.errorLabel}>{error.label}</Text>
          <View
            style={[
              styles.errorTag,
              error.tone === "red" ? styles.tagRed : error.tone === "blue" ? styles.tagBlue : styles.tagPurple,
            ]}
          >
            <Text style={styles.errorTagText}>{error.tag}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SystemStatus() {
  return (
    <View style={styles.bottomPanel}>
      <View style={styles.bottomPanelHeader}>
        <View style={styles.statusHeaderIcon}>
          <ShieldCheck size={21} color="#0877FF" fill="#0877FF" />
        </View>
        <Text style={styles.bottomPanelTitle}>System Status</Text>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.viewLink}>
          <Text style={styles.viewLinkText}>View details</Text>
          <ChevronRight size={17} color="#0877FF" />
        </TouchableOpacity>
      </View>
      <View style={styles.statusBody}>
        <View style={styles.statusCheckCircle}>
          <Check size={32} color="#FFFFFF" strokeWidth={3.5} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusMainText}>All Systems Operational</Text>
          <Text style={styles.statusSubText}>Core services are running normally.</Text>
        </View>
        <View style={styles.statusSparkline}>
          {[23, 36, 28, 47, 62, 24, 15, 39, 29, 52, 43].map((height, index) => (
            <View key={index} style={[styles.statusSparkBar, { height }]} />
          ))}
        </View>
      </View>
    </View>
  );
}

export default function SystemHealthScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 1100;
  const narrow = width < 760;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.app}>
        {!narrow && <Sidebar compact={compact} />}
        <View style={styles.mainArea}>
          <TopBar compact={narrow} />
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={[styles.content, narrow && styles.contentNarrow]}
            showsVerticalScrollIndicator={false}
          >
            {narrow && <Sidebar compact />}
            <PageHeading compact={compact} />

            <View style={[styles.metricsGrid, compact && styles.metricsGridCompact]}>
              <MetricCard
                title="Service Availability"
                value="99.8%"
                change="↑ 0.1%"
                icon="check"
                tone="green"
              />
              <MetricCard
                title="Recent Errors"
                value="3"
                change="↑ 1"
                icon="alert"
                tone="red"
              />
              <MetricCard
                title="Admin Actions"
                value="12"
                change="↑ 2"
                icon="info"
                tone="blue"
              />
            </View>

            <AuditTable compact={compact} />

            <View style={[styles.bottomGrid, compact && styles.bottomGridCompact]}>
              <RecentErrors compact={compact} />
              <SystemStatus />
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
  dateSelect: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderWidth: 1,
    borderColor: "#D7E5FF",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  dateSelectInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  dateSelectText: {
    color: "#3D5B9C",
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 22,
  },
  metricsGridCompact: {
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 210,
    minHeight: 130,
    borderWidth: 1,
    borderRadius: 9,
    padding: 15,
    flexDirection: "row",
    alignItems: "flex-start",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  metricGreen: {
    backgroundColor: "#F8FFFC",
    borderColor: "#CFEFE5",
  },
  metricRed: {
    backgroundColor: "#FFFAFA",
    borderColor: "#F8DDE1",
  },
  metricBlue: {
    backgroundColor: "#FBFDFF",
    borderColor: "#D8E6FF",
  },
  metricIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  metricTextArea: {
    flex: 1,
    paddingTop: 7,
  },
  metricTitle: {
    color: "#112958",
    fontSize: 13,
    fontWeight: "500",
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 17,
    marginTop: 4,
  },
  metricValue: {
    color: "#0B1F4B",
    fontSize: 28,
    fontWeight: "800",
  },
  metricChange: {
    fontSize: 12,
    fontWeight: "700",
  },
  metricSubtitle: {
    color: "#6680B6",
    fontSize: 10,
    position: "absolute",
    bottom: 10,
    left: 88,
  },
  sparkline: {
    height: 47,
    position: "absolute",
    left: 88,
    right: 14,
    bottom: 9,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    opacity: 0.9,
  },
  sparkBar: {
    width: "7%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  panel: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8FF",
    borderRadius: 9,
    overflow: "hidden",
  },
  panelHeader: {
    minHeight: 67,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2ECFF",
  },
  panelHeaderCompact: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  panelTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  smallHeaderIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#E7F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: {
    color: "#0D2351",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  tableFilters: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tableFiltersCompact: {
    flexWrap: "wrap",
  },
  searchInputWrap: {
    width: 265,
    height: 41,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E5FF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: "#16305D",
    fontSize: 13,
    paddingVertical: 7,
    outlineStyle: "none",
  } as any,
  filterSelect: {
    height: 41,
    minWidth: 124,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D7E5FF",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  filterSelectText: {
    color: "#152A55",
    fontSize: 13,
  },
  table: {
    minWidth: 1060,
  },
  tableRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
    backgroundColor: "#FFFFFF",
  },
  tableHead: {
    minHeight: 44,
    backgroundColor: "#F1F6FF",
  },
  tableHeaderText: {
    color: "#102958",
    fontSize: 12,
    fontWeight: "800",
  },
  tableCellText: {
    color: "#102958",
    fontSize: 13,
  },
  colTime: {
    width: 225,
    paddingRight: 12,
  },
  colEvent: {
    width: 245,
    paddingRight: 10,
  },
  colResult: {
    width: 165,
    paddingRight: 10,
  },
  colActor: {
    width: 155,
    paddingRight: 10,
  },
  colDetails: {
    width: 310,
    paddingRight: 10,
  },
  colArrow: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  eventCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  eventIcon: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: "#E6F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  resultCell: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  resultPill: {
    minHeight: 25,
    paddingHorizontal: 9,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resultSuccess: {
    backgroundColor: "#DDF8EF",
  },
  resultFailed: {
    backgroundColor: "#FFE4E6",
  },
  resultText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resultTextSuccess: {
    color: "#008B5B",
  },
  resultTextFailed: {
    color: "#E5252D",
  },
  emptyState: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  emptyStateText: {
    color: "#6680B6",
    fontSize: 13,
  },
  tableFooter: {
    minHeight: 53,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#FFFFFF",
  },
  showingText: {
    color: "#5C79B6",
    fontSize: 13,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#D8E5FF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  pageButtonActive: {
    backgroundColor: "#0877FF",
    borderColor: "#0877FF",
  },
  pageButtonText: {
    color: "#1B376C",
    fontSize: 13,
  },
  pageButtonTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  paginationDots: {
    color: "#6E86BA",
    paddingHorizontal: 2,
  },
  bottomGrid: {
    flexDirection: "row",
    gap: 20,
  },
  bottomGridCompact: {
    flexDirection: "column",
  },
  bottomPanel: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8FF",
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  bottomPanelHeader: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
  },
  errorIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#FFE5E6",
    alignItems: "center",
    justifyContent: "center",
  },
  statusHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#E6F1FF",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPanelTitle: {
    color: "#0D2351",
    fontSize: 16,
    fontWeight: "800",
  },
  viewLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewLinkText: {
    color: "#0877FF",
    fontSize: 12,
    fontWeight: "600",
  },
  errorRow: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E7EEFC",
  },
  errorDate: {
    width: 218,
    color: "#243F77",
    fontSize: 12,
  },
  errorDateCompact: {
    width: 180,
  },
  errorLabel: {
    flex: 1,
    minWidth: 100,
    color: "#102958",
    fontSize: 13,
  },
  errorTag: {
    minWidth: 51,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    alignItems: "center",
  },
  tagRed: {
    backgroundColor: "#FFE3E5",
  },
  tagBlue: {
    backgroundColor: "#E2EEFF",
  },
  tagPurple: {
    backgroundColor: "#F0E6FF",
  },
  errorTagText: {
    color: "#173365",
    fontSize: 11,
    fontWeight: "600",
  },
  statusBody: {
    minHeight: 118,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 12,
  },
  statusCheckCircle: {
    width: 78,
    height: 78,
    borderRadius: 40,
    backgroundColor: "#00A86B",
    borderWidth: 12,
    borderColor: "#D8F7EC",
    alignItems: "center",
    justifyContent: "center",
  },
  statusCopy: {
    flex: 1,
  },
  statusMainText: {
    color: "#102958",
    fontSize: 18,
    fontWeight: "800",
  },
  statusSubText: {
    color: "#5574B5",
    fontSize: 13,
    marginTop: 7,
  },
  statusSparkline: {
    height: 70,
    width: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    opacity: 0.75,
  },
  statusSparkBar: {
    width: 9,
    backgroundColor: "#41D0A6",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});
