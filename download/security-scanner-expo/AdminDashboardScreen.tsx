import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const C = {
  navy: '#10243B', blue: '#0878F9', bg: '#F5F9FE', white: '#FFFFFF',
  text: '#10284A', muted: '#5D78A5', border: '#DFEAF8',
  green: '#10A979', greenBg: '#E9FAF5', red: '#F04449', redBg: '#FFF0F1',
  amber: '#F59E0B', amberBg: '#FFF6E7', purple: '#8B2CF5',
  purpleBg: '#F3EAFF', teal: '#11B9B3', tealBg: '#E4FAF8',
};

type Result = 'Threat found' | 'No known threat' | 'Likely dangerous' | 'Needs your review' | 'Could not decide';
type Activity = { date: string; time: string; item: string; size?: string; type: 'File' | 'Link'; result: Result };

const ACTIVITY: Activity[] = [
  { date: 'Oct 30, 2025', time: '10:24 AM', item: 'Project_Proposal.pdf', size: '2.4 MB', type: 'File', result: 'Threat found' },
  { date: 'Oct 30, 2025', time: '09:17 AM', item: 'Screenshot_20251030.png', size: '1.2 MB', type: 'File', result: 'No known threat' },
  { date: 'Oct 29, 2025', time: '06:42 PM', item: 'https://malicious-site.fake', type: 'Link', result: 'Likely dangerous' },
  { date: 'Oct 29, 2025', time: '02:13 PM', item: 'https://example.com', type: 'Link', result: 'No known threat' },
  { date: 'Oct 28, 2025', time: '11:07 AM', item: 'photo_20251028.jpg', size: '3.6 MB', type: 'File', result: 'Needs your review' },
  { date: 'Oct 27, 2025', time: '08:32 PM', item: 'https://bit.ly/abc123', type: 'Link', result: 'Could not decide' },
  { date: 'Oct 27, 2025', time: '01:15 PM', item: 'Notes_backup.docx', size: '1.1 MB', type: 'File', result: 'No known threat' },
];

const SERVICES = ['File Scanner', 'Link Checker', 'Quarantine Service', 'Database', 'API'];

function Panel({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.panel, style]}>{children}</View>;
}

function ResultPill({ result }: { result: Result }) {
  const config = {
    'Threat found': [C.redBg, C.red, 'alert-circle'],
    'Likely dangerous': [C.redBg, C.red, 'alert-circle'],
    'No known threat': [C.greenBg, C.green, 'check-circle'],
    'Needs your review': [C.amberBg, '#C77700', 'alert-triangle'],
    'Could not decide': [C.amberBg, '#C77700', 'alert-triangle'],
  }[result] as [string, string, React.ComponentProps<typeof Feather>['name']];
  return <View style={[s.resultPill, { backgroundColor: config[0] }]}><Feather name={config[2]} size={12} color={config[1]} /><Text numberOfLines={1} style={[s.resultText, { color: config[1] }]}>{result}</Text></View>;
}

function NavItem({ icon, label, active, onPress }: {
  icon: React.ComponentProps<typeof Feather>['name']; label: string; active: boolean; onPress: () => void;
}) {
  return <Pressable onPress={onPress} style={({ pressed }) => [s.navItem, active && s.navActive, pressed && { opacity: 0.8 }]}>
    <Feather name={icon} size={21} color="#FFFFFF" /><Text style={s.navLabel}>{label}</Text>
  </Pressable>;
}

function Metric({ icon, label, value, caption, bg, iconBg, color }: {
  icon: React.ComponentProps<typeof Feather>['name']; label: string; value: string; caption: string;
  bg: string; iconBg: string; color: string;
}) {
  return <View style={[s.metric, { backgroundColor: bg, borderColor: iconBg }]}>
    <View style={[s.metricIcon, { backgroundColor: iconBg }]}><Feather name={icon} size={23} color={color} /></View>
    <View style={s.metricText}><Text style={s.metricLabel}>{label}</Text><Text style={s.metricValue}>{value}</Text><Text style={s.metricCaption}>{caption}</Text></View>
  </View>;
}

function ActivityRow({ item, onPress }: { item: Activity; onPress: () => void }) {
  const icon = item.type === 'Link' ? 'link' : item.item.endsWith('.pdf') || item.item.endsWith('.docx') ? 'file-text' : 'image';
  return <Pressable onPress={onPress} style={({ pressed }) => [s.activityRow, pressed && { backgroundColor: '#F7FAFF' }]}>
    <View style={s.dateCol}><Text style={s.date}>{item.date}</Text><Text style={s.date}>{item.time}</Text></View>
    <View style={s.itemCol}>
      <View style={[s.itemIcon, { backgroundColor: item.type === 'Link' ? '#E5F0FF' : '#0878F9' }]}>
        <Feather name={icon} size={16} color={item.type === 'Link' ? C.blue : C.white} />
      </View>
      <View style={s.itemCopy}><Text numberOfLines={1} style={s.itemName}>{item.item}</Text>{!!item.size && <Text style={s.itemSize}>{item.size}</Text>}</View>
    </View>
    <View style={s.typeCol}><Text style={s.typePill}>{item.type}</Text></View>
    <View style={s.resultCol}><ResultPill result={item.result} /></View>
    <Feather name="chevron-right" size={18} color="#7194C8" />
  </Pressable>;
}

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1100;
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [period, setPeriod] = useState('Last 7 days');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const navigate = (page: string) => {
    setActiveNav(page);
    setNotice(page === 'Dashboard' ? '' : `${page} screen is not included in this dashboard component yet.`);
  };
  const showDetails = (item: Activity) => setNotice(`${item.item}: ${item.result}. Connect the scan-details route to open the full record.`);

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" backgroundColor={C.navy} />
    <View style={s.app}>
      {desktop && <View style={s.sidebar}>
        <View style={s.brand}><MaterialCommunityIcons name="shield-check" size={38} color={C.blue} /><Text style={s.brandText}>Security <Text style={{ color: '#65BFFF' }}>Scanner</Text></Text></View>
        <View style={s.navList}>
          <NavItem icon="home" label="Dashboard" active={activeNav === 'Dashboard'} onPress={() => navigate('Dashboard')} />
          <NavItem icon="search" label="Scans" active={activeNav === 'Scans'} onPress={() => navigate('Scans')} />
          <NavItem icon="archive" label="Quarantine" active={activeNav === 'Quarantine'} onPress={() => navigate('Quarantine')} />
          <NavItem icon="user" label="Users" active={activeNav === 'Users'} onPress={() => navigate('Users')} />
          <NavItem icon="settings" label="Settings" active={activeNav === 'Settings'} onPress={() => navigate('Settings')} />
          <NavItem icon="help-circle" label="Help & Support" active={activeNav === 'Help & Support'} onPress={() => navigate('Help & Support')} />
        </View>
        <View style={s.sidebarFooter}>
          <MaterialCommunityIcons name="shield-check" size={26} color="#73BDFF" />
          <View style={{ flex: 1 }}><Text style={s.footerTitle}>Keep your organisation safer, one scan at a time.</Text><Text style={s.footerVersion}>Security Scanner v1.0.0</Text></View>
        </View>
      </View>}

      <View style={s.main}>
        <View style={s.topbar}>
          {!desktop && <View style={s.mobileBrand}><MaterialCommunityIcons name="shield-check" size={27} color={C.blue} /><Text style={s.mobileBrandText}>Security <Text style={{ color: C.blue }}>Scanner</Text></Text></View>}
          <Pressable onPress={() => setNotice('Use the navigation links when the desktop sidebar is visible.')} style={s.menuButton}><Feather name="menu" size={21} color={C.muted} /></Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={() => setNotice('You have no unread notifications in this demo.')} style={s.bell}><Feather name="bell" size={20} color="#35577F" /><View style={s.bellDot} /></Pressable>
          <Pressable onPress={() => setNotice('Admin account menu is not connected yet.')} style={s.adminButton}><View style={s.avatar}><Text style={s.avatarText}>AD</Text></View><Text style={s.adminText}>Admin</Text><Feather name="chevron-down" size={16} color="#7D91AC" /></Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[s.page, !desktop && s.pageNarrow]}>
          <View style={[s.headingRow, !desktop && { flexDirection: 'column', alignItems: 'stretch' }]}>
            <View style={{ flex: 1 }}><Text style={s.pageTitle}>Dashboard</Text><Text style={s.pageSubtitle}>Overview of your security scanner activity and system health.</Text></View>
            <View style={s.periodWrap}>
              <Pressable onPress={() => setPeriodOpen(v => !v)} style={s.periodButton}><Feather name="calendar" size={17} color={C.muted} /><Text style={s.periodText}>{period}</Text><Feather name="chevron-down" size={16} color={C.muted} /></Pressable>
              {periodOpen && <View style={s.periodMenu}>{['Today', 'Last 7 days', 'Last 30 days', 'This year'].map(p => <Pressable key={p} onPress={() => { setPeriod(p); setPeriodOpen(false); }} style={s.periodOption}><Text style={{ color: p === period ? C.blue : C.text, fontWeight: p === period ? '700' : '400' }}>{p}</Text></Pressable>)}</View>}
            </View>
          </View>

          {!!notice && <Pressable onPress={() => setNotice('')} style={s.notice}><Feather name="info" size={16} color={C.blue} /><Text style={s.noticeText}>{notice}</Text><Feather name="x" size={15} color={C.muted} /></Pressable>}

          <View style={[s.metrics, !desktop && s.metricsNarrow]}>
            <Metric icon="shield-check" label="Service Health" value="Healthy" caption="All systems operational" bg="#F4FCFA" iconBg="#D9F7EF" color="#00A878" />
            <Metric icon="image" label="Total Scans" value="248" caption="Files and links scanned" bg="#F8FBFF" iconBg="#DCEBFF" color={C.blue} />
            <Metric icon="file-text" label="File Scans" value="173" caption="Successful scans" bg="#FCFAFF" iconBg={C.purpleBg} color={C.purple} />
            <Metric icon="link" label="Link Checks" value="75" caption="Links checked" bg="#F4FCFC" iconBg="#D8F8F4" color={C.teal} />
            <Metric icon="alert-triangle" label="Recent Errors" value="3" caption={`In the ${period.toLowerCase()}`} bg="#FFFAFA" iconBg="#FFE3E5" color={C.red} />
          </View>

          <View style={[s.contentGrid, !desktop && s.contentGridNarrow]}>
            <Panel style={s.activityPanel}>
              <View style={s.panelHeader}>
                <View style={s.headerIcon}><MaterialCommunityIcons name="shield-check" size={22} color={C.blue} /></View>
                <View style={{ flex: 1 }}><Text style={s.panelTitle}>Recent Activity</Text><Text style={s.panelSubtitle}>Latest scans and system events.</Text></View>
                <Pressable onPress={() => navigate('Scans')} style={s.viewAll}><Text style={s.viewAllText}>View all</Text><Feather name="arrow-right" size={14} color={C.blue} /></Pressable>
              </View>
              <View style={s.tableHeader}><Text style={[s.tableHead, s.dateCol]}>Date & time</Text><Text style={[s.tableHead, s.itemCol]}>Item</Text><Text style={[s.tableHead, s.typeCol]}>Type</Text><Text style={[s.tableHead, s.resultCol]}>Result</Text><View style={{ width: 16 }} /></View>
              {ACTIVITY.map((item, i) => <ActivityRow key={`${item.item}-${i}`} item={item} onPress={() => showDetails(item)} />)}
            </Panel>

            <View style={s.rightCol}>
              <Panel>
                <View style={s.panelHeader}><View style={s.headerIcon}><Feather name="activity" size={22} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={s.panelTitle}>Service Status</Text><Text style={s.panelSubtitle}>Current status of scanner services.</Text></View></View>
                {SERVICES.map((service, i) => <View key={service} style={[s.serviceRow, i === SERVICES.length - 1 && { borderBottomWidth: 0 }]}><View style={s.statusDotOuter}><View style={s.statusDot} /></View><Text style={s.serviceName}>{service}</Text><View style={s.operational}><Text style={s.operationalText}>Operational</Text></View></View>)}
              </Panel>

              <Panel>
                <View style={s.panelHeader}><View style={s.headerIcon}><Feather name="bell" size={22} color={C.blue} /></View><View style={{ flex: 1 }}><Text style={s.panelTitle}>Alerts</Text><Text style={s.panelSubtitle}>Important events and issues.</Text></View><Pressable onPress={() => setNotice('All alerts view is not connected yet.')} style={s.viewAll}><Text style={s.viewAllText}>View all</Text><Feather name="arrow-right" size={14} color={C.blue} /></Pressable></View>
                <View style={s.alertRow}><View style={[s.alertIcon, { backgroundColor: C.redBg }]}><Feather name="alert-triangle" size={14} color={C.red} /></View><View style={s.alertBody}><Text style={s.alertTitle}>Malicious link detected</Text><Text style={s.alertDescription}>https://malicious-site.fake was flagged as dangerous.</Text></View><Text style={s.alertDate}>Oct 29, 2025{"\n"}06:42 PM</Text></View>
                <View style={s.alertRow}><View style={[s.alertIcon, { backgroundColor: C.amberBg }]}><Feather name="alert-triangle" size={14} color={C.amber} /></View><View style={s.alertBody}><Text style={s.alertTitle}>Quarantine action failed</Text><Text style={s.alertDescription}>Failed to quarantine a file. Please check device storage and permissions.</Text></View><Text style={s.alertDate}>Oct 28, 2025{"\n"}11:16 AM</Text></View>
                <View style={[s.alertRow, { borderBottomWidth: 0 }]}><View style={[s.alertIcon, { backgroundColor: '#E8F2FF' }]}><Feather name="info" size={14} color={C.blue} /></View><View style={s.alertBody}><Text style={s.alertTitle}>New admin login</Text><Text style={s.alertDescription}>Admin user signed in from 192.168.1.10.</Text></View><Text style={s.alertDate}>Oct 27, 2025{"\n"}09:03 AM</Text></View>
              </Panel>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  app: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  sidebar: { width: 275, backgroundColor: C.navy, paddingHorizontal: 14, paddingTop: 17, paddingBottom: 22 },
  brand: { height: 49, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 6 },
  brandText: { color: C.white, fontSize: 20, fontWeight: '800', letterSpacing: -0.45 },
  navList: { marginTop: 27, gap: 7 },
  navItem: { minHeight: 48, borderRadius: 9, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 16 },
  navActive: { backgroundColor: '#174A88' },
  navLabel: { color: '#F4F7FC', fontSize: 14, fontWeight: '500' },
  sidebarFooter: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#24405E', paddingTop: 17, paddingHorizontal: 9, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  footerTitle: { color: C.white, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  footerVersion: { color: '#B8CBE2', fontSize: 11, marginTop: 17 },
  main: { flex: 1, minWidth: 0 },
  topbar: { height: 64, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#E7EEF8', paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center' },
  menuButton: { width: 30, height: 38, alignItems: 'center', justifyContent: 'center' },
  mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  mobileBrandText: { color: C.text, fontSize: 16, fontWeight: '800' },
  bell: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', marginRight: 19, position: 'relative' },
  bellDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, top: 8, right: 8 },
  adminButton: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 5 },
  avatar: { width: 33, height: 33, borderRadius: 18, backgroundColor: C.navy, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.white, fontSize: 12, fontWeight: '700' },
  adminText: { color: C.text, fontSize: 13, fontWeight: '600' },
  page: { paddingHorizontal: 26, paddingTop: 26, paddingBottom: 36 },
  pageNarrow: { paddingHorizontal: 16, paddingTop: 22 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 30 },
  pageTitle: { color: C.text, fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: -0.6 },
  pageSubtitle: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 4 },
  periodWrap: { position: 'relative', zIndex: 10 },
  periodButton: { minWidth: 210, height: 42, paddingHorizontal: 13, borderWidth: 1, borderColor: C.border, borderRadius: 8, backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', gap: 10 },
  periodText: { flex: 1, color: C.text, fontSize: 13 },
  periodMenu: { position: 'absolute', top: 46, right: 0, minWidth: 210, paddingVertical: 5, borderWidth: 1, borderColor: C.border, borderRadius: 8, backgroundColor: C.white, zIndex: 20, elevation: 6 },
  periodOption: { paddingHorizontal: 14, paddingVertical: 10 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#CFE2FF', backgroundColor: '#EDF6FF', padding: 12, borderRadius: 8, marginBottom: 18 },
  noticeText: { flex: 1, color: C.text, fontSize: 12, lineHeight: 18 },
  metrics: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metricsNarrow: { flexWrap: 'wrap' },
  metric: { flex: 1, minWidth: 145, minHeight: 147, borderWidth: 1, borderRadius: 9, padding: 15, flexDirection: 'row', gap: 12 },
  metricIcon: { width: 56, height: 56, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  metricText: { flex: 1, minWidth: 0, paddingTop: 8 },
  metricLabel: { color: C.text, fontSize: 12, fontWeight: '500' },
  metricValue: { color: C.text, fontSize: 23, lineHeight: 29, fontWeight: '800', marginTop: 8 },
  metricCaption: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 7 },
  contentGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 17 },
  contentGridNarrow: { flexDirection: 'column' },
  panel: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 9, padding: 16 },
  activityPanel: { flex: 1.45, minWidth: 0, paddingHorizontal: 16, paddingTop: 17, paddingBottom: 20 },
  rightCol: { flex: 1, minWidth: 280, gap: 17 },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 22 },
  headerIcon: { width: 41, height: 41, borderRadius: 13, backgroundColor: '#E8F2FF', alignItems: 'center', justifyContent: 'center' },
  panelTitle: { color: C.text, fontSize: 15, fontWeight: '800' },
  panelSubtitle: { color: C.muted, fontSize: 11, lineHeight: 16, marginTop: 5 },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6 },
  viewAllText: { color: C.blue, fontSize: 12, fontWeight: '600' },
  tableHeader: { minHeight: 40, backgroundColor: '#F5F9FE', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  tableHead: { color: C.muted, fontSize: 10, fontWeight: '700' },
  dateCol: { width: 110 },
  itemCol: { flex: 1.5, minWidth: 100, flexDirection: 'row', alignItems: 'center', gap: 9 },
  typeCol: { width: 56 },
  resultCol: { flex: 1.1, minWidth: 95 },
  activityRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8, borderBottomWidth: 1, borderBottomColor: '#EAF0F8' },
  date: { color: C.muted, fontSize: 10, lineHeight: 16 },
  itemIcon: { width: 32, height: 32, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  itemCopy: { flex: 1, minWidth: 0 },
  itemName: { color: C.text, fontSize: 11, fontWeight: '600' },
  itemSize: { color: C.muted, fontSize: 10, marginTop: 4 },
  typePill: { color: C.blue, backgroundColor: '#E8F2FF', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, overflow: 'hidden', fontSize: 10, alignSelf: 'flex-start' },
  resultPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 5, borderRadius: 14, maxWidth: '100%' },
  resultText: { fontSize: 9, fontWeight: '600' },
  serviceRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ECF1F8', gap: 12, paddingHorizontal: 3 },
  statusDotOuter: { width: 15, height: 15, borderRadius: 8, backgroundColor: '#DDF7EE', alignItems: 'center', justifyContent: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 5, backgroundColor: C.green },
  serviceName: { flex: 1, color: C.text, fontSize: 11, fontWeight: '600' },
  operational: { backgroundColor: C.greenBg, borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5 },
  operationalText: { color: '#079A69', fontSize: 10, fontWeight: '600' },
  alertRow: { minHeight: 77, flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#ECF1F8' },
  alertIcon: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  alertBody: { flex: 1, minWidth: 0, paddingTop: 1 },
  alertTitle: { color: C.text, fontSize: 11, fontWeight: '700', lineHeight: 16 },
  alertDescription: { color: C.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  alertDate: { color: C.muted, fontSize: 9, lineHeight: 14, textAlign: 'right', minWidth: 65 },
});