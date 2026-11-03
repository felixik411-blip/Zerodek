import React, { useMemo, useState } from "react";
import {
  Alert, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Kind = "Domain" | "IP" | "Hash";
type State = "Active" | "Pending" | "Blocked";
type Indicator = {
  id: string; value: string; type: Kind; source: string; status: State;
  added: string; updated: string;
};

const initial: Indicator[] = [
  { id: "1", value: "malicious-domain.com", type: "Domain", source: "Threat Feed", status: "Active", added: "Oct 29, 2025", updated: "Oct 30, 2025" },
  { id: "2", value: "e7f3a9d4e2f1...", type: "Hash", source: "Community", status: "Active", added: "Oct 28, 2025", updated: "Oct 29, 2025" },
  { id: "3", value: "192.168.1.100", type: "IP", source: "Feed", status: "Active", added: "Oct 27, 2025", updated: "Oct 28, 2025" },
  { id: "4", value: "trojan.carrier.net", type: "Domain", source: "Research", status: "Pending", added: "Oct 26, 2025", updated: "Oct 26, 2025" },
  { id: "5", value: "d41d8cd98f00b...", type: "Hash", source: "Feed", status: "Blocked", added: "Oct 25, 2025", updated: "Oct 27, 2025" },
  { id: "6", value: "bad-site.example", type: "Domain", source: "Community", status: "Active", added: "Oct 24, 2025", updated: "Oct 25, 2025" },
  { id: "7", value: "203.0.113.17", type: "IP", source: "Threat Feed", status: "Pending", added: "Oct 23, 2025", updated: "Oct 24, 2025" },
  { id: "8", value: "old-threat.net", type: "Domain", source: "Research", status: "Blocked", added: "Oct 22, 2025", updated: "Oct 23, 2025" },
  { id: "9", value: "f5a1b7c9...", type: "Hash", source: "Feed", status: "Active", added: "Oct 21, 2025", updated: "Oct 22, 2025" },
  { id: "10", value: "198.51.100.8", type: "IP", source: "Community", status: "Active", added: "Oct 20, 2025", updated: "Oct 21, 2025" },
  { id: "11", value: "phishing-login.example", type: "Domain", source: "Threat Feed", status: "Pending", added: "Oct 19, 2025", updated: "Oct 20, 2025" },
  { id: "12", value: "9b74c9897bac...", type: "Hash", source: "Research", status: "Blocked", added: "Oct 18, 2025", updated: "Oct 19, 2025" },
];

const activity = [
  { action: "Added", indicator: "bad-site.example", by: "Admin", date: "Oct 30, 2025 – 09:20 AM", icon: "add-circle" as const, color: "#10A66A" },
  { action: "Updated", indicator: "malicious-domain.com", by: "Admin", date: "Oct 29, 2025 – 04:15 PM", icon: "create" as const, color: "#0878F9" },
  { action: "Removed", indicator: "old-threat.net", by: "Admin", date: "Oct 28, 2025 – 11:32 AM", icon: "trash" as const, color: "#EF4444" },
];

const C = { blue: "#0878F9", navy: "#0E2345", muted: "#5D78AD", border: "#DCE9FF", page: "#F4F8FF" };

function I({ name, size = 18, color = C.blue }: {
  name: React.ComponentProps<typeof Ionicons>["name"]; size?: number; color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

function Pill({ status }: { status: State }) {
  const p = {
    Active: { bg: "#DDF8EE", fg: "#008B5A", dot: "#12A66A" },
    Pending: { bg: "#FFF0D9", fg: "#A95A00", dot: "#F59E0B" },
    Blocked: { bg: "#FFE1E3", fg: "#C91F2B", dot: "#EF4444" },
  }[status];
  return <View style={[s.pill, { backgroundColor: p.bg }]}><View style={[s.dot, { backgroundColor: p.dot }]} /><Text style={{ color: p.fg, fontSize: 12 }}>{status}</Text></View>;
}

function Picker({ value, options, onChange }: {
  value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return <View style={s.pickerWrap}>
    <TouchableOpacity style={s.picker} onPress={() => setOpen(!open)}>
      <Text style={s.pickerText} numberOfLines={1}>{value}</Text><I name={open ? "chevron-up" : "chevron-down"} color={C.muted} />
    </TouchableOpacity>
    {open && <View style={s.options}>{options.map(o =>
      <TouchableOpacity key={o} style={s.option} onPress={() => { onChange(o); setOpen(false); }}>
        <Text style={[s.optionText, value === o && { color: C.blue, fontWeight: "700" }]}>{o}</Text>
      </TouchableOpacity>)}</View>}
  </View>;
}

export default function ThreatInformationScreen() {
  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState("Select type");
  const [source, setSource] = useState("Select source");
  const [newStatus, setNewStatus] = useState<State>("Active");
  const [menuId, setMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => items.filter(x =>
    (x.value + " " + x.source + " " + x.type).toLowerCase().includes(query.toLowerCase()) &&
    (typeFilter === "All Types" || x.type === typeFilter) &&
    (statusFilter === "All Status" || x.status === statusFilter)
  ), [items, query, typeFilter, statusFilter]);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function addIndicator() {
    const value = newValue.trim();
    if (!value || !["Domain", "IP", "Hash"].includes(newType) || source === "Select source") {
      Alert.alert("Missing information", "Enter an indicator value and select its type and source.");
      return;
    }
    if (items.some(x => x.value.toLowerCase() === value.toLowerCase())) {
      Alert.alert("Already exists", "This indicator is already listed.");
      return;
    }
    setItems(old => [{
      id: String(Date.now()), value, type: newType as Kind, source, status: newStatus,
      added: "Nov 3, 2026", updated: "Nov 3, 2026",
    }, ...old]);
    setNewValue(""); setNewType("Select type"); setSource("Select source");
    setTypeFilter("All Types"); setStatusFilter("All Status"); setQuery(""); setPage(1);
    Alert.alert("Indicator added", `${value} was added.`);
  }

  function remove(item: Indicator) {
    Alert.alert("Remove indicator?", `Remove ${item.value}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => {
        setItems(old => old.filter(x => x.id !== item.id)); setMenuId(null);
      }},
    ]);
  }

  function changeStatus(item: Indicator) {
    const next: State = item.status === "Active" ? "Pending" : item.status === "Pending" ? "Blocked" : "Active";
    setItems(old => old.map(x => x.id === item.id ? { ...x, status: next, updated: "Nov 3, 2026" } : x));
    setMenuId(null);
  }

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    <View style={s.topbar}>
      <TouchableOpacity onPress={() => Alert.alert("Navigation", "Connect your admin drawer here.")}><I name="menu" size={25} color={C.muted} /></TouchableOpacity>
      <View style={s.topRight}>
        <TouchableOpacity onPress={() => Alert.alert("Notifications", "No new notifications.")}><I name="notifications-outline" size={22} color={C.muted} /><View style={s.notifDot} /></TouchableOpacity>
        <View style={s.avatar}><Text style={s.avatarText}>AD</Text></View><Text style={s.admin}>Admin</Text><I name="chevron-down" color={C.muted} size={16} />
      </View>
    </View>

    <ScrollView style={s.page} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.heading}>
        <View style={s.headingIcon}><I name="shield-checkmark" size={35} /></View>
        <View style={{ flex: 1 }}><Text style={s.title}>Threat Information Management</Text><Text style={s.subtitle}>View and manage threat indicators used by the scanner.</Text></View>
      </View>

      <View style={s.filterBar}>
        <View style={s.search}>
          <I name="search" size={22} color={C.muted} />
          <TextInput value={query} onChangeText={v => { setQuery(v); setPage(1); }} placeholder="Search indicators..." placeholderTextColor="#8195BE" style={s.searchInput} />
          {!!query && <TouchableOpacity onPress={() => setQuery("")}><I name="close-circle" color={C.muted} /></TouchableOpacity>}
        </View>
        <View style={s.filterPicker}><Picker value={typeFilter} options={["All Types", "Domain", "IP", "Hash"]} onChange={v => { setTypeFilter(v); setPage(1); }} /></View>
        <View style={s.filterPicker}><Picker value={statusFilter} options={["All Status", "Active", "Pending", "Blocked"]} onChange={v => { setStatusFilter(v); setPage(1); }} /></View>
        <TouchableOpacity style={s.primary} onPress={() => Alert.alert("Add Threat Indicator", "Use the form on the right to add an indicator.")}><I name="add" color="#FFFFFF" size={22} /><Text style={s.primaryText}>Add Indicator</Text></TouchableOpacity>
      </View>

      <View style={s.mainRow}>
        <View style={s.tableCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View>
              <View style={s.tableHeader}>
                {["Indicator", "Type", "Source", "Status", "Date Added", "Last Updated", "Actions"].map((h, i) =>
                  <Text key={h} style={[s.th, { width: [182, 104, 101, 112, 130, 130, 65][i] }]}>{h}</Text>)}
              </View>
              {visible.map(item => <View key={item.id} style={s.row}>
                <Text numberOfLines={1} style={[s.cell, { width: 182, paddingLeft: 14, paddingRight: 8 }]}>{item.value}</Text>
                <View style={{ width: 104, paddingHorizontal: 8 }}><View style={s.typePill}>
                  <I name={item.type === "Domain" ? "globe-outline" : item.type === "IP" ? "location" : "pricetag"} size={14} />
                  <Text style={s.typeText}>{item.type}</Text>
                </View></View>
                <Text numberOfLines={1} style={[s.cell, { width: 101, paddingHorizontal: 8 }]}>{item.source}</Text>
                <View style={{ width: 112, paddingHorizontal: 8 }}><Pill status={item.status} /></View>
                <Text style={[s.cell, { width: 130, paddingHorizontal: 8 }]}>{item.added}</Text>
                <Text style={[s.cell, { width: 130, paddingHorizontal: 8 }]}>{item.updated}</Text>
                <View style={s.actionCell}>
                  <TouchableOpacity style={s.iconButton} onPress={() => setMenuId(menuId === item.id ? null : item.id)}><I name="ellipsis-vertical" /></TouchableOpacity>
                  {menuId === item.id && <View style={s.rowMenu}>
                    <TouchableOpacity style={s.menuItem} onPress={() => changeStatus(item)}><I name="sync-outline" size={16} /><Text style={s.menuText}>Change status</Text></TouchableOpacity>
                    <TouchableOpacity style={s.menuItem} onPress={() => { Alert.alert("Indicator details", `${item.value}\nType: ${item.type}\nSource: ${item.source}\nStatus: ${item.status}`); setMenuId(null); }}><I name="information-circle-outline" size={16} /><Text style={s.menuText}>View details</Text></TouchableOpacity>
                    <TouchableOpacity style={s.menuItem} onPress={() => remove(item)}><I name="trash-outline" color="#E32636" size={16} /><Text style={[s.menuText, { color: "#E32636" }]}>Remove</Text></TouchableOpacity>
                  </View>}
                </View>
              </View>)}
              {visible.length === 0 && <View style={s.empty}><I name="search-outline" size={27} color={C.muted} /><Text style={s.emptyTitle}>No indicators found</Text><Text style={s.muted}>Try another search or filter.</Text></View>}
              <View style={s.pagination}>
                <Text style={s.muted}>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} indicators</Text>
                <View style={s.pages}>
                  <TouchableOpacity style={s.pageButton} disabled={currentPage === 1} onPress={() => setPage(currentPage - 1)}><I name="chevron-back" color={currentPage === 1 ? "#B9C9E3" : C.blue} /></TouchableOpacity>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(n => <TouchableOpacity key={n} style={[s.pageButton, currentPage === n && s.pageActive]} onPress={() => setPage(n)}><Text style={[s.pageNum, currentPage === n && { color: "#FFFFFF" }]}>{n}</Text></TouchableOpacity>)}
                  <TouchableOpacity style={s.pageButton} disabled={currentPage === pageCount} onPress={() => setPage(currentPage + 1)}><I name="chevron-forward" color={currentPage === pageCount ? "#B9C9E3" : C.blue} /></TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={s.addCard}>
          <View style={s.addHeading}><View style={s.addIcon}><I name="add" size={28} /></View><View style={{ flex: 1 }}><Text style={s.addTitle}>Add Threat Indicator</Text><Text style={s.muted}>Add a new indicator to help detect threats.</Text></View></View>
          <Text style={s.label}>Indicator Value *</Text>
          <TextInput value={newValue} onChangeText={setNewValue} autoCapitalize="none" placeholder="Enter domain, IP, or hash..." placeholderTextColor="#8195BE" style={s.formInput} />
          <Text style={s.label}>Type *</Text>
          <Picker value={newType} options={["Select type", "Domain", "IP", "Hash"]} onChange={setNewType} />
          <Text style={s.label}>Source</Text>
          <Picker value={source} options={["Select source", "Threat Feed", "Community", "Feed", "Research", "Manual"]} onChange={setSource} />
          <Text style={s.label}>Status</Text>
          <Picker value={newStatus} options={["Active", "Pending", "Blocked"]} onChange={v => setNewStatus(v as State)} />
          <TouchableOpacity style={[s.primary, s.submit]} onPress={addIndicator}><Text style={s.primaryText}>Add Indicator</Text></TouchableOpacity>
        </View>
      </View>

      <View style={s.activityCard}>
        <View style={s.activityHeading}><View style={s.addIcon}><I name="time-outline" size={25} /></View><Text style={s.activityTitle}>Recent Activity</Text><TouchableOpacity style={s.viewAll} onPress={() => Alert.alert("Recent Activity", "Showing recent threat indicator changes.")}><Text style={s.link}>View all activity</Text><I name="arrow-forward" size={15} /></TouchableOpacity></View>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View>
            <View style={[s.activityRow, s.activityHeader]}>
              {["Action", "Indicator", "Performed by", "Date & Time"].map((v, i) => <Text key={v} style={[s.activityTh, { width: [190, 410, 220, 330][i] }]}>{v}</Text>)}
            </View>
            {activity.map(a => <View key={a.action} style={s.activityRow}>
              <View style={[s.activityCell, { width: 190, flexDirection: "row", alignItems: "center", gap: 9 }]}><I name={a.icon} size={19} color={a.color} /><Text style={s.cell}>{a.action}</Text></View>
              <Text style={[s.activityCell, s.cell, { width: 410 }]}>{a.indicator}</Text>
              <Text style={[s.activityCell, s.cell, { width: 220 }]}>{a.by}</Text>
              <Text style={[s.activityCell, s.cell, { width: 330 }]}>{a.date}</Text>
            </View>)}
          </View>
        </ScrollView>
      </View>

      <View style={s.footer}><View style={s.healthDot} /><View><Text style={s.footerTitle}>System Healthy</Text><Text style={s.muted}>All services running</Text></View><Text style={s.version}>Security Scanner v1.0.0</Text></View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.page },
  topbar: { height: 64, backgroundColor: "#FFFFFF", borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 22, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  topRight: { flexDirection: "row", alignItems: "center", gap: 11 },
  notifDot: { position: "absolute", right: 0, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#0B1E45", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  avatarText: { color: "#FFFFFF", fontWeight: "700", fontSize: 12 },
  admin: { color: C.navy, fontWeight: "600", fontSize: 14 },
  page: { flex: 1 },
  content: { padding: 22, paddingBottom: 36, gap: 16 },
  heading: { flexDirection: "row", alignItems: "center", gap: 18, marginBottom: 2 },
  headingIcon: { width: 78, height: 78, borderRadius: 22, backgroundColor: "#E2EEFF", alignItems: "center", justifyContent: "center" },
  title: { color: C.navy, fontSize: 28, fontWeight: "800", letterSpacing: -0.7 },
  subtitle: { color: C.muted, fontSize: 16, marginTop: 5 },
  filterBar: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border, borderRadius: 11, padding: 10, flexDirection: "row", alignItems: "center", gap: 12, zIndex: 10 },
  search: { flex: 1, minWidth: 180, height: 42, borderWidth: 1, borderColor: "#CFE0FF", borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 10 },
  searchInput: { flex: 1, color: C.navy, paddingVertical: 7, fontSize: 14 },
  filterPicker: { width: 160 },
  pickerWrap: { position: "relative", marginBottom: 10, zIndex: 4 },
  picker: { minHeight: 39, borderWidth: 1, borderColor: "#CFE0FF", backgroundColor: "#FFFFFF", borderRadius: 8, paddingHorizontal: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
  pickerText: { color: C.navy, fontSize: 13, flexShrink: 1 },
  options: { position: "absolute", top: 42, left: 0, right: 0, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border, borderRadius: 8, zIndex: 40, elevation: 9, shadowColor: "#142C52", shadowOpacity: 0.12, shadowRadius: 8 },
  option: { paddingHorizontal: 12, paddingVertical: 10 },
  optionText: { color: C.navy, fontSize: 13 },
  primary: { minHeight: 43, borderRadius: 8, backgroundColor: C.blue, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  primaryText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  mainRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tableCard: { flex: 1, minWidth: 0, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border, borderRadius: 10, overflow: "visible" },
  tableHeader: { height: 58, flexDirection: "row", alignItems: "center", backgroundColor: "#F0F6FF", borderBottomWidth: 1, borderBottomColor: C.border },
  th: { color: C.navy, fontWeight: "700", fontSize: 12, paddingHorizontal: 12 },
  row: { minHeight: 57, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#E7EFFC" },
  cell: { color: C.navy, fontSize: 13 },
  typePill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#E6F1FF", borderRadius: 15, paddingHorizontal: 9, paddingVertical: 5 },
  typeText: { color: C.blue, fontSize: 12 },
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, borderRadius: 15, paddingHorizontal: 9, paddingVertical: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  actionCell: { width: 65, alignItems: "center", justifyContent: "center", position: "relative" },
  iconButton: { width: 40, height: 36, borderWidth: 1, borderColor: "#CFE0FF", borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  rowMenu: { position: "absolute", top: 39, right: 4, width: 165, backgroundColor: "#FFFFFF", borderColor: C.border, borderWidth: 1, borderRadius: 8, zIndex: 50, elevation: 12, paddingVertical: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 9 },
  menuText: { color: C.navy, fontSize: 12 },
  empty: { alignItems: "center", padding: 26, gap: 6 },
  emptyTitle: { color: C.navy, fontWeight: "700", fontSize: 15 },
  muted: { color: C.muted, fontSize: 12 },
  pagination: { minHeight: 54, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15, gap: 8 },
  pages: { flexDirection: "row", alignItems: "center", gap: 5 },
  pageButton: { minWidth: 33, height: 33, borderWidth: 1, borderColor: "#CFE0FF", borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", paddingHorizontal: 5 },
  pageActive: { backgroundColor: C.blue, borderColor: C.blue },
  pageNum: { color: C.navy, fontSize: 13 },
  addCard: { width: 330, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 15 },
  addHeading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 15 },
  addIcon: { width: 43, height: 43, borderRadius: 13, backgroundColor: "#E6F1FF", alignItems: "center", justifyContent: "center" },
  addTitle: { color: C.navy, fontSize: 18, fontWeight: "800" },
  label: { fontSize: 13, fontWeight: "600", color: C.navy, marginBottom: 7 },
  formInput: { height: 39, borderWidth: 1, borderColor: "#CFE0FF", borderRadius: 8, paddingHorizontal: 12, color: C.navy, fontSize: 13, marginBottom: 12 },
  submit: { marginTop: 0, width: "100%" },
  activityCard: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 10 },
  activityHeading: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4, paddingBottom: 10 },
  activityTitle: { color: C.navy, fontSize: 18, fontWeight: "800", flex: 1 },
  viewAll: { flexDirection: "row", alignItems: "center", gap: 5 },
  link: { color: C.blue, fontSize: 12, fontWeight: "600" },
  activityRow: { flexDirection: "row", alignItems: "center", minHeight: 41, borderBottomWidth: 1, borderBottomColor: "#E7EFFC" },
  activityHeader: { backgroundColor: "#F0F6FF", minHeight: 38 },
  activityTh: { paddingHorizontal: 12, color: C.navy, fontWeight: "700", fontSize: 12 },
  activityCell: { paddingHorizontal: 12 },
  footer: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderWidth: 1, borderColor: C.border, borderRadius: 10, backgroundColor: "#FFFFFF" },
  healthDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#10A66A" },
  footerTitle: { color: C.navy, fontWeight: "700", fontSize: 13 },
  version: { marginLeft: "auto", color: C.muted, fontSize: 12 },
});
