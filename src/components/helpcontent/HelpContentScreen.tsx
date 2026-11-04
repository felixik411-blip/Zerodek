import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ContentTab = "Articles" | "FAQs" | "Security Tips" | "Announcements";
type ContentStatus = "Published" | "Draft";

type HelpItem = {
  id: string;
  title: string;
  content: string;
  status: ContentStatus;
  updated: string;
};

const INITIAL_ITEMS: HelpItem[] = [
  {
    id: "1",
    title: "How file scanning works",
    content:
      "File scanning checks files on your device for known malware and other threats. It helps keep your device safe.",
    status: "Published",
    updated: "Oct 29, 2025",
  },
  {
    id: "2",
    title: "What scan results mean",
    content:
      "Scan results explain whether a file or link appears dangerous, needs review, has no known threat, or could not be checked.",
    status: "Published",
    updated: "Oct 28, 2025",
  },
  {
    id: "3",
    title: "What quarantine does",
    content:
      "Quarantine isolates risky files so they cannot be used normally. You can review, restore, or delete quarantined files later.",
    status: "Published",
    updated: "Oct 27, 2025",
  },
  {
    id: "4",
    title: "How link checking works",
    content:
      "Link checking looks for known dangerous domains, phishing indicators, and suspicious patterns.",
    status: "Draft",
    updated: "Oct 26, 2025",
  },
  {
    id: "5",
    title: "Your privacy",
    content:
      "Files remain on your device by default. The app does not upload your files without your permission.",
    status: "Published",
    updated: "Oct 25, 2025",
  },
  {
    id: "6",
    title: "Security tips",
    content:
      "Keep your device updated, avoid unfamiliar links, and only install files from sources you trust.",
    status: "Published",
    updated: "Oct 24, 2025",
  },
];

const COLORS = {
  navy: "#0B1D3B",
  sidebar: "#101D2D",
  sidebarBottom: "#0D1928",
  blue: "#0875FF",
  blueDark: "#0759D5",
  paleBlue: "#E7F1FF",
  border: "#DCE8FF",
  text: "#0C2146",
  muted: "#5875B1",
  background: "#F4F8FE",
  white: "#FFFFFF",
  green: "#079B63",
  greenBg: "#E4F8F1",
  draftBg: "#E5F0FF",
};

const NAV_ITEMS = [
  { label: "Dashboard", icon: "grid-outline" as const },
  { label: "Scans", icon: "search-outline" as const },
  { label: "Quarantine", icon: "file-tray-full-outline" as const },
  { label: "Users", icon: "people-outline" as const },
  { label: "Settings", icon: "settings-outline" as const },
  { label: "Threat Intelligence", icon: "shield-checkmark-outline" as const },
  { label: "Help Content", icon: "help-circle" as const },
  { label: "Real-Time Protection", icon: "pulse-outline" as const },
  { label: "Privacy Audit", icon: "lock-closed-outline" as const },
];

export default function HelpContentScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 1050;

  const [activeTab, setActiveTab] = useState<ContentTab>("Articles");
  const [items, setItems] = useState<HelpItem[]>(INITIAL_ITEMS);
  const [selectedId, setSelectedId] = useState("1");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState(INITIAL_ITEMS[0].title);
  const [content, setContent] = useState(INITIAL_ITEMS[0].content);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [newArticleMode, setNewArticleMode] = useState(false);

  const selectedItem = items.find((item) => item.id === selectedId);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query),
    );
  }, [items, search]);

  const selectItem = (item: HelpItem) => {
    setSelectedId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setNewArticleMode(false);
  };

  const startNewArticle = () => {
    setSelectedId("");
    setTitle("");
    setContent("");
    setNewArticleMode(true);
  };

  const publishChanges = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing information", "Enter an article title and content.");
      return;
    }

    const now = new Date();
    const updated = now.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    if (newArticleMode) {
      const newItem: HelpItem = {
        id: String(Date.now()),
        title: title.trim(),
        content: content.trim(),
        status: "Published",
        updated,
      };
      setItems((current) => [newItem, ...current]);
      setSelectedId(newItem.id);
      setNewArticleMode(false);
    } else {
      setItems((current) =>
        current.map((item) =>
          item.id === selectedId
            ? { ...item, title: title.trim(), content: content.trim(), status: "Published", updated }
            : item,
        ),
      );
    }

    Alert.alert("Published", "The content is now marked as published.");
  };

  const renderNavItem = (label: string, icon: keyof typeof Ionicons.glyphMap) => {
    const active = label === "Help Content";
    return (
      <Pressable
        key={label}
        style={[styles.navItem, active && styles.navItemActive]}
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => {
          if (!active) Alert.alert(label, `${label} navigation is not wired in this screen.`);
        }}
      >
        <Ionicons name={icon} size={23} color="#FFFFFF" />
        <Text style={styles.navLabel}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        {!isCompact && (
          <View style={styles.sidebar}>
            <View style={styles.brand}>
              <View style={styles.brandShield}>
                <Ionicons name="shield-checkmark" size={25} color="#FFFFFF" />
              </View>
              <Text style={styles.brandText}>
                Security <Text style={styles.brandAccent}>Scanner</Text>
              </Text>
            </View>

            <View style={styles.navList}>
              {NAV_ITEMS.map((item) => renderNavItem(item.label, item.icon))}
            </View>

            <View style={styles.sidebarBottom}>
              <View style={styles.healthDot}>
                <Ionicons name="add-circle" size={20} color="#08B77A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.healthTitle}>System Healthy</Text>
                <Text style={styles.healthSubtitle}>All services running</Text>
              </View>
            </View>
            <Text style={styles.version}>Security Scanner v1.0.0</Text>
          </View>
        )}

        <View style={styles.main}>
          <View style={styles.topbar}>
            <Pressable
              onPress={() => Alert.alert("Navigation", "Connect this menu to your app navigation.")}
              style={styles.menuButton}
            >
              <Ionicons name="menu" size={25} color={COLORS.muted} />
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              style={styles.topAction}
              onPress={() => Alert.alert("Notifications", "No new notifications.")}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.muted} />
              <View style={styles.notificationDot} />
            </Pressable>
            <Pressable
              style={styles.adminButton}
              onPress={() => Alert.alert("Admin", "Connect this menu to your account actions.")}
            >
              <View style={styles.avatarAdmin}>
                <Text style={styles.avatarAdminText}>AD</Text>
              </View>
              <Text style={styles.adminText}>Admin</Text>
              <Ionicons name="chevron-down" size={17} color={COLORS.muted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.pageScroll}
            contentContainerStyle={styles.pageContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pageHeader}>
              <View style={styles.pageIcon}>
                <Ionicons name="book-outline" size={43} color={COLORS.blue} />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.pageTitle}>Help Content Management</Text>
                <Text style={styles.pageSubtitle}>
                  Manage help articles, FAQs, security tips and announcements.
                </Text>
              </View>
              <Pressable style={styles.primaryButton} onPress={startNewArticle}>
                <Ionicons name="add" size={23} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>New Article</Text>
              </Pressable>
            </View>

            <View style={styles.tabs}>
              {(["Articles", "FAQs", "Security Tips", "Announcements"] as ContentTab[]).map(
                (tab) => (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    style={[styles.tab, activeTab === tab && styles.tabActive]}
                  >
                    <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                      {tab}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>

            <View style={[styles.workspace, isCompact && styles.workspaceCompact]}>
              <View style={[styles.listPanel, isCompact && styles.panelCompact]}>
                <View style={styles.searchRow}>
                  <View style={styles.searchBox}>
                    <Ionicons name="search" size={22} color={COLORS.muted} />
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder={`Search ${activeTab.toLowerCase()}...`}
                      placeholderTextColor="#7890BD"
                      style={styles.searchInput}
                    />
                  </View>
                  <Pressable
                    style={styles.filterButton}
                    onPress={() => Alert.alert("Filter", "Add status/category filter options here.")}
                  >
                    <Ionicons name="filter-outline" size={21} color={COLORS.muted} />
                    <Text style={styles.filterText}>Filter</Text>
                  </Pressable>
                </View>

                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderText, { flex: 2.1 }]}>Title</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.25 }]}>Status</Text>
                  <Text style={[styles.tableHeaderText, { flex: 1.25 }]}>Last Updated</Text>
                  <Text style={[styles.tableHeaderText, { width: 90, textAlign: "center" }]}>
                    Actions
                  </Text>
                </View>

                {filteredItems.map((item) => (
                  <View key={item.id} style={styles.articleRow}>
                    <Pressable style={styles.articleTitleCell} onPress={() => selectItem(item)}>
                      <Text numberOfLines={2} style={styles.articleTitle}>
                        {item.title}
                      </Text>
                    </Pressable>
                    <View style={{ flex: 1.25 }}>
                      <View
                        style={[
                          styles.statusBadge,
                          item.status === "Published" ? styles.publishedBadge : styles.draftBadge,
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: item.status === "Published" ? COLORS.green : COLORS.blue },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: item.status === "Published" ? "#078454" : COLORS.blueDark },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.updatedText, { flex: 1.25 }]}>{item.updated}</Text>
                    <View style={styles.rowActions}>
                      <Pressable style={styles.iconButton} onPress={() => selectItem(item)}>
                        <Ionicons name="create-outline" size={22} color={COLORS.blue} />
                      </Pressable>
                      <Pressable
                        style={styles.iconButtonSmall}
                        onPress={() =>
                          Alert.alert("Article actions", item.title, [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: item.status === "Published" ? "Unpublish" : "Publish",
                              onPress: () =>
                                setItems((current) =>
                                  current.map((entry) =>
                                    entry.id === item.id
                                      ? {
                                          ...entry,
                                          status: entry.status === "Published" ? "Draft" : "Published",
                                        }
                                      : entry,
                                  ),
                                ),
                            },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () => {
                                setItems((current) => current.filter((entry) => entry.id !== item.id));
                                if (selectedId === item.id) {
                                  setSelectedId("");
                                  setTitle("");
                                  setContent("");
                                }
                              },
                            },
                          ])
                        }
                      >
                        <Ionicons name="ellipsis-vertical" size={18} color={COLORS.blue} />
                      </Pressable>
                    </View>
                  </View>
                ))}

                {filteredItems.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={28} color={COLORS.muted} />
                    <Text style={styles.emptyTitle}>No content found</Text>
                    <Text style={styles.emptySubtitle}>Try another search or create new content.</Text>
                  </View>
                )}

                <View style={styles.tableFooter}>
                  <Text style={styles.footerText}>
                    Showing {filteredItems.length ? 1 : 0}–{filteredItems.length} of {items.length}{" "}
                    {activeTab.toLowerCase()}
                  </Text>
                </View>
              </View>

              <View style={[styles.editorPanel, isCompact && styles.panelCompact]}>
                <View style={styles.editorHeading}>
                  <Ionicons name="create" size={25} color={COLORS.blue} />
                  <Text style={styles.editorHeadingText}>
                    {newArticleMode ? "New Article" : "Edit Article"}
                  </Text>
                </View>

                <View style={styles.editorBody}>
                  <Text style={styles.fieldLabel}>Title *</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter content title"
                    placeholderTextColor="#7890BD"
                    style={styles.titleInput}
                  />

                  <Text style={[styles.fieldLabel, { marginTop: 19 }]}>Content *</Text>
                  <View style={styles.richEditor}>
                    <View style={styles.toolbar}>
                      {[
                        { icon: "bold" as const, label: "Bold" },
                        { icon: "italic" as const, label: "Italic" },
                        { icon: "link-outline" as const, label: "Insert link" },
                        { icon: "list-outline" as const, label: "Bulleted list" },
                        { icon: "list" as const, label: "Numbered list" },
                        { icon: "reader-outline" as const, label: "Paragraph" },
                        { icon: "eye-outline" as const, label: "Preview" },
                      ].map((tool) => (
                        <Pressable
                          key={tool.label}
                          accessibilityLabel={tool.label}
                          style={styles.toolbarButton}
                          onPress={() => {
                            if (tool.label === "Preview") setPreviewVisible(true);
                            else Alert.alert(tool.label, "Connect this formatting action to your rich-text editor.");
                          }}
                        >
                          <Ionicons name={tool.icon} size={19} color={COLORS.muted} />
                        </Pressable>
                      ))}
                    </View>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      multiline
                      textAlignVertical="top"
                      placeholder="Write the help content here..."
                      placeholderTextColor="#7890BD"
                      style={styles.contentInput}
                    />
                  </View>

                  <View style={styles.editorActions}>
                    <Pressable style={styles.previewButton} onPress={() => setPreviewVisible(true)}>
                      <Ionicons name="eye-outline" size={21} color={COLORS.blue} />
                      <Text style={styles.previewButtonText}>Preview</Text>
                    </Pressable>
                    <Pressable style={styles.publishButton} onPress={publishChanges}>
                      <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.publishButtonText}>Publish Changes</Text>
                    </Pressable>
                  </View>

                  <View style={styles.infoBanner}>
                    <Ionicons name="information-circle" size={23} color="#367FE0" />
                    <Text style={styles.infoBannerText}>
                      Changes will be visible to users after publishing.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={previewVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPreviewVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.previewModal}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>Article preview</Text>
                <Pressable onPress={() => setPreviewVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </Pressable>
              </View>
              <ScrollView>
                <Text style={styles.previewArticleTitle}>{title || "Untitled article"}</Text>
                <Text style={styles.previewArticleContent}>{content || "No content entered yet."}</Text>
              </ScrollView>
              <Pressable style={styles.primaryButton} onPress={() => setPreviewVisible(false)}>
                <Text style={styles.primaryButtonText}>Close preview</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  app: { flex: 1, flexDirection: "row", backgroundColor: COLORS.background },
  sidebar: {
    width: 272,
    backgroundColor: COLORS.sidebar,
    paddingTop: 15,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#1D3550",
  },
  brand: {
    height: 63,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 27,
  },
  brandShield: {
    width: 38,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.blue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  brandText: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", letterSpacing: -0.5 },
  brandAccent: { color: "#47B8FF" },
  navList: { gap: 5 },
  navItem: {
    height: 48,
    borderRadius: 9,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  navItemActive: { backgroundColor: "#174783" },
  navLabel: { color: "#FFFFFF", fontSize: 15, fontWeight: "500" },
  sidebarBottom: {
    marginTop: "auto",
    marginHorizontal: 5,
    marginBottom: 18,
    padding: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#203B59",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  healthDot: { width: 24, alignItems: "center" },
  healthTitle: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
  healthSubtitle: { color: "#9CCBEE", fontSize: 12, marginTop: 4 },
  version: { color: "#A9C5E6", fontSize: 12, textAlign: "center", marginBottom: 20 },
  main: { flex: 1, minWidth: 0 },
  topbar: {
    height: 64,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    gap: 22,
  },
  menuButton: { padding: 4 },
  topAction: { padding: 5, position: "relative" },
  notificationDot: {
    position: "absolute",
    right: 2,
    top: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4545",
  },
  adminButton: { flexDirection: "row", alignItems: "center", gap: 9 },
  avatarAdmin: {
    width: 37,
    height: 37,
    borderRadius: 20,
    backgroundColor: "#081A43",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarAdminText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  adminText: { color: COLORS.text, fontSize: 14, fontWeight: "600" },
  pageScroll: { flex: 1 },
  pageContent: { padding: 30, paddingTop: 26, paddingBottom: 40 },
  pageHeader: { flexDirection: "row", alignItems: "center", gap: 20, marginBottom: 22 },
  pageIcon: {
    width: 80,
    height: 82,
    borderRadius: 18,
    backgroundColor: "#DDEBFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: { flex: 1, minWidth: 0 },
  pageTitle: { color: "#0C1F50", fontSize: 34, fontWeight: "750", letterSpacing: -0.8 },
  pageSubtitle: { color: "#5574B8", fontSize: 17, marginTop: 5 },
  primaryButton: {
    minHeight: 46,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 16,
    gap: 12,
  },
  tab: {
    minWidth: 124,
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: COLORS.blue },
  tabText: { color: "#36599B", fontSize: 16, fontWeight: "600" },
  tabTextActive: { color: COLORS.blue, fontWeight: "700" },
  workspace: { flexDirection: "row", alignItems: "flex-start", gap: 20 },
  workspaceCompact: { flexDirection: "column" },
  listPanel: {
    flex: 1.15,
    minWidth: 0,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  editorPanel: {
    flex: 0.95,
    minWidth: 0,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  panelCompact: { width: "100%", flex: 0, alignSelf: "stretch" },
  searchRow: {
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EDF3FF",
  },
  searchBox: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#D2E1FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, minWidth: 0, color: COLORS.text, fontSize: 15, paddingVertical: 7 },
  filterButton: {
    height: 44,
    borderWidth: 1,
    borderColor: "#D2E1FF",
    borderRadius: 8,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filterText: { color: COLORS.text, fontSize: 15, fontWeight: "600" },
  tableHeader: {
    minHeight: 54,
    backgroundColor: "#F0F5FC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
  },
  tableHeaderText: { color: "#10285A", fontSize: 14, fontWeight: "700" },
  articleRow: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E4EDFC",
  },
  articleTitleCell: { flex: 2.1, justifyContent: "center", minWidth: 0, paddingVertical: 10 },
  articleTitle: { color: "#0C1F50", fontSize: 15, fontWeight: "600" },
  statusBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  publishedBadge: { backgroundColor: COLORS.greenBg },
  draftBadge: { backgroundColor: COLORS.draftBg },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 13, fontWeight: "600" },
  updatedText: { color: COLORS.text, fontSize: 14 },
  rowActions: { width: 90, flexDirection: "row", justifyContent: "center", gap: 6 },
  iconButton: {
    width: 42,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4E3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonSmall: {
    width: 38,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4E3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: { alignItems: "center", padding: 28, gap: 8 },
  emptyTitle: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
  emptySubtitle: { color: COLORS.muted, fontSize: 13, textAlign: "center" },
  tableFooter: { paddingHorizontal: 19, paddingVertical: 23 },
  footerText: { color: "#5574B8", fontSize: 15 },
  editorHeading: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: "#E3ECFC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 14,
  },
  editorHeadingText: { color: "#0C1F50", fontSize: 21, fontWeight: "700" },
  editorBody: { padding: 18 },
  fieldLabel: { color: "#0C1F50", fontSize: 16, fontWeight: "700", marginBottom: 8 },
  titleInput: {
    height: 43,
    borderWidth: 1,
    borderColor: "#AFCBFF",
    borderRadius: 8,
    paddingHorizontal: 13,
    color: COLORS.text,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  richEditor: {
    height: 264,
    borderWidth: 1,
    borderColor: "#BCD2FF",
    borderRadius: 8,
    overflow: "hidden",
  },
  toolbar: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D8E5FF",
    backgroundColor: "#F4F7FC",
    paddingHorizontal: 7,
  },
  toolbarButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  contentInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 25,
    paddingHorizontal: 15,
    paddingVertical: 14,
  },
  editorActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 28,
  },
  previewButton: {
    height: 46,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderColor: "#C8DBFF",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  previewButtonText: { color: COLORS.blue, fontSize: 15, fontWeight: "700" },
  publishButton: {
    minHeight: 46,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: COLORS.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  publishButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  infoBanner: {
    minHeight: 58,
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 9,
    backgroundColor: "#EAF3FF",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoBannerText: { flex: 1, color: "#2F5CB0", fontSize: 14, lineHeight: 21 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(7, 24, 55, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  previewModal: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "80%",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 24,
    gap: 20,
  },
  previewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  previewTitle: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  previewArticleTitle: { color: COLORS.text, fontSize: 24, fontWeight: "700", marginBottom: 14 },
  previewArticleContent: { color: "#334E7E", fontSize: 16, lineHeight: 26, marginBottom: 20 },
});
