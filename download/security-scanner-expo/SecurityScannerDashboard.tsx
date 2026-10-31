import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const C = {
  navy: '#192D47', blue: '#0878F9', bluePale: '#E5F0FF', bg: '#F7FAFE',
  text: '#172B49', muted: '#60779A', border: '#DFE9F5', green: '#35C78B',
  greenBg: '#ECFAF3', red: '#FF5559', redBg: '#FFF0F1', amber: '#F59E0B',
  amberBg: '#FFF6E9', slateBg: '#F0F4F9', white: '#FFFFFF',
};

type ScanResult = 'No known threat' | 'Suspicious' | 'Threat found' | 'Could not decide';
type ScanItem = { name: string; type: 'File' | 'Link'; result: ScanResult; date: string };
const INITIAL_ITEMS: ScanItem[] = [
  { name: 'invoice_2025.pdf', type: 'File', result: 'No known threat', date: 'Oct 30, 2025  ·  10:24 AM' },
  { name: 'https://example.com', type: 'Link', result: 'Suspicious', date: 'Oct 30, 2025  ·  09:48 AM' },
  { name: 'project.zip', type: 'File', result: 'Threat found', date: 'Oct 30, 2025  ·  08:12 AM' },
  { name: 'https://testsite.net', type: 'Link', result: 'No known threat', date: 'Oct 29, 2025  ·  06:37 PM' },
  { name: 'image.jpg', type: 'File', result: 'Could not decide', date: 'Oct 29, 2025  ·  04:21 PM' },
];

function ResultPill({ result }: { result: ScanResult }) {
  const cfg = {
    'No known threat': { bg: C.greenBg, fg: '#16995F', icon: 'check-circle' as const },
    Suspicious: { bg: C.amberBg, fg: '#B85A00', icon: 'alert-triangle' as const },
    'Threat found': { bg: C.redBg, fg: '#E52C32', icon: 'alert-circle' as const },
    'Could not decide': { bg: C.slateBg, fg: '#637A9C', icon: 'check-circle' as const },
  }[result];
  return <View style={[s.resultPill, { backgroundColor: cfg.bg }]}><Feather name={cfg.icon} size={14} color={cfg.fg} /><Text style={[s.resultText, { color: cfg.fg }]}>{result}</Text></View>;
}

function NavItem({ icon, label, active, badge, onPress }: {
  icon: React.ComponentProps<typeof Feather>['name']; label: string;
  active?: boolean; badge?: string; onPress: () => void;
}) {
  return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [s.navItem, active && s.navActive, pressed && { opacity: 0.8 }]}>
    <Feather name={icon} size={21} color={active ? C.white : '#D4E0F0'} />
    <Text style={[s.navLabel, active && { color: C.white }]}>{label}</Text>
    {!!badge && <View style={s.navBadge}><Text style={s.navBadgeText}>{badge}</Text></View>}
  </Pressable>;
}

function Panel({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[s.panel, style]}>{children}</View>;
}

function TypeIcon({ type }: { type: 'File' | 'Link' }) {
  return <Feather name={type === 'File' ? 'file-text' : 'link'} size={23} color={type === 'Link' ? C.blue : '#4D6D9A'} />;
}

export default function SecurityScannerDashboard() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1100;
  const [activeNav, setActiveNav] = useState('Home');
  const [url, setUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [items] = useState(INITIAL_ITEMS);
  const quarantineCount = items.filter(x => x.result === 'Threat found' || x.result === 'Suspicious').length;

  const goTo = (name: string) => {
    setActiveNav(name);
    setNotice(name === 'Home' ? '' : `${name} screen is not included in this dashboard component yet.`);
  };
  const checkUrl = () => setNotice(url.trim() ? 'URL entered. Connect your URL-scanning service to check it for threats.' : 'Enter a website URL first.');
  const selectFile = () => setNotice('Connect Expo DocumentPicker and your scanning service to scan a selected file.');

  return <SafeAreaView style={s.safe}>
    <StatusBar barStyle="light-content" backgroundColor={C.navy} />
    <View style={s.app}>
      {desktop && <View style={s.sidebar}>
        <View style={s.logoRow}><MaterialCommunityIcons name="shield-check" size={39} color={C.blue} /><Text style={s.logoText}>Security <Text style={s.logoAccent}>Scanner</Text></Text></View>
        <View style={s.navList}>
          <NavItem icon="home" label="Home" active={activeNav === 'Home'} onPress={() => goTo('Home')} />
          <NavItem icon="clock" label="History" active={activeNav === 'History'} onPress={() => goTo('History')} />
          <NavItem icon="archive" label="Quarantine" active={activeNav === 'Quarantine'} badge={String(quarantineCount)} onPress={() => goTo('Quarantine')} />
          <NavItem icon="settings" label="Settings" active={activeNav === 'Settings'} onPress={() => goTo('Settings')} />
        </View>
        <View style={s.sidebarPrivacy}><MaterialCommunityIcons name="shield-check-outline" size={26} color="#75B8FF" /><View style={{ flex: 1 }}><Text style={s.privacyTitle}>Files stay on your phone by default.</Text><Text style={s.privacyCopy}>We don’t upload your files without your permission.</Text></View></View>
      </View>}

      <View style={s.contentArea}>
        <View style={s.topBar}>
          {!desktop && <View style={s.mobileBrand}><MaterialCommunityIcons name="shield-check" size={30} color={C.blue} /><Text style={s.mobileBrandText}>Security <Text style={s.logoAccent}>Scanner</Text></Text></View>}
          <Pressable style={s.userButton} onPress={() => setNotice('User account menu is not connected yet.')}><Feather name="user" size={20} color={C.navy} /><Text style={s.userText}>User</Text><Feather name="chevron-down" size={16} color="#8CA0BC" /></Pressable>
        </View>
        <ScrollView contentContainerStyle={[s.page, !desktop && s.pageNarrow]} showsVerticalScrollIndicator={false}>
          <Text style={s.eyebrow}>WELCOME BACK</Text>
          <Text style={s.pageTitle}>Your security</Text>
          <Text style={s.pageSubtitle}>Scan files and links to stay safer online.</Text>
          {!!notice && <View style={s.notice}><Text style={s.noticeText}>{notice}</Text><Pressable onPress={() => setNotice('')}><Feather name="x" size={17} color={C.muted} /></Pressable></View>}

          <View style={[s.grid, !desktop && s.gridNarrow]}>
            <View style={s.primaryColumn}>
              <View style={[s.actionCards, !desktop && s.actionCardsNarrow]}>
                <Panel style={s.actionCard}>
                  <View style={s.actionIcon}><MaterialCommunityIcons name="file-document-check-outline" size={43} color={C.blue} /></View>
                  <Text style={s.cardTitle}>Scan a file</Text>
                  <Text style={s.cardDescription}>Check a file on your device for possible threats.</Text>
                  <Pressable onPress={selectFile} accessibilityRole="button" style={({ pressed }) => [s.primaryButton, pressed && s.pressed]}><Text style={s.primaryButtonText}>Scan file</Text><Feather name="arrow-right" size={19} color={C.white} /></Pressable>
                </Panel>
                <Panel style={s.actionCard}>
                  <View style={s.actionIcon}><Feather name="link" size={42} color={C.blue} /></View>
                  <Text style={s.cardTitle}>Check a link</Text>
                  <Text style={s.cardDescription}>Verify a website or URL for malicious content.</Text>
                  <View style={s.urlRow}><TextInput value={url} onChangeText={setUrl} placeholder="https://example.com" placeholderTextColor="#7187A7" autoCapitalize="none" autoCorrect={false} keyboardType="url" accessibilityLabel="Website URL to check" style={s.urlInput} /><Pressable onPress={checkUrl} style={({ pressed }) => [s.checkButton, pressed && s.pressed]}><Text style={s.checkButtonText}>Check</Text></Pressable></View>
                </Panel>
              </View>

              <Panel style={s.activityPanel}>
                <View style={s.panelHeader}><Text style={s.panelTitle}>Recent scan activity</Text><Pressable onPress={() => goTo('History')}><Text style={s.viewAll}>View all</Text></Pressable></View>
                <View style={s.tableHeader}><Text style={[s.tableHead, s.itemCol]}>Item</Text><Text style={[s.tableHead, s.typeCol]}>Type</Text><Text style={[s.tableHead, s.resultCol]}>Result</Text><Text style={[s.tableHead, s.dateCol]}>Date</Text></View>
                {items.map((item, i) => <View key={`${item.name}-${i}`} style={s.tableRow}>
                  <View style={[s.tableItem, s.itemCol]}><TypeIcon type={item.type} /><Text numberOfLines={1} style={s.itemName}>{item.name}</Text></View>
                  <View style={s.typeCol}><View style={s.typePill}><Text style={s.typeText}>{item.type}</Text></View></View>
                  <View style={s.resultCol}><ResultPill result={item.result} /></View>
                  <Text numberOfLines={1} style={[s.dateText, s.dateCol]}>{item.date}</Text>
                </View>)}
              </Panel>
            </View>

            <View style={[s.secondaryColumn, !desktop && s.secondaryNarrow]}>
              <Panel style={s.latestPanel}>
                <View style={s.panelHeader}><Text style={s.panelTitle}>Latest scan result</Text><Pressable onPress={() => goTo('History')}><Text style={s.viewAll}>View all</Text></Pressable></View>
                <View style={s.latestSuccess}><View style={s.largeCheck}><Feather name="check" size={25} color={C.white} /></View><View style={{ flex: 1 }}><Text style={s.latestTitle}>No known threat found</Text><Text style={s.latestMeta}>sample-file.pdf</Text><Text style={s.latestMeta}>Oct 30, 2025  ·  10:24 AM</Text></View></View>
                <Pressable style={s.fileRow} onPress={() => setNotice('File details are not connected yet.')}><Feather name="file-text" size={24} color="#526F98" /><View style={{ flex: 1 }}><Text style={s.fileName}>sample-file.pdf</Text><Text style={s.fileSize}>2.4 MB</Text></View><Feather name="chevron-right" size={20} color="#7E94B2" /></Pressable>
              </Panel>
              <Pressable onPress={() => goTo('Quarantine')}><Panel style={s.quarantinePanel}><View style={s.quarantineIcon}><MaterialCommunityIcons name="shield-alert-outline" size={28} color={C.navy} /></View><View style={s.quarantineCopy}><View style={s.quarantineHeading}><Text style={s.panelTitle}>Quarantine</Text><View style={s.quarantineBadge}><Text style={s.navBadgeText}>{quarantineCount}</Text></View></View><Text style={s.quarantineDescription}>Files that were blocked and isolated from your device.</Text></View><Feather name="chevron-right" size={20} color="#7E94B2" /></Panel></Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg }, app: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  sidebar: { width: 280, backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 22 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8 }, logoText: { color: C.white, fontSize: 21, fontWeight: '800', letterSpacing: -0.5 }, logoAccent: { color: '#8EC5FF' },
  navList: { marginTop: 35, gap: 7 }, navItem: { minHeight: 45, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }, navActive: { backgroundColor: '#2D5789' }, navLabel: { color: '#F0F5FC', fontSize: 15, fontWeight: '500', flex: 1 }, navBadge: { minWidth: 23, height: 23, borderRadius: 12, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }, navBadgeText: { color: C.white, fontSize: 12, fontWeight: '700' },
  sidebarPrivacy: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#314660', paddingTop: 18, flexDirection: 'row', gap: 12 }, privacyTitle: { color: C.white, fontSize: 12, lineHeight: 18, fontWeight: '700' }, privacyCopy: { color: '#CBD7E8', fontSize: 11, lineHeight: 17, marginTop: 5 },
  contentArea: { flex: 1, minWidth: 0 }, topBar: { height: 62, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#E8EEF6', paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }, mobileBrand: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 'auto' }, mobileBrandText: { color: C.text, fontSize: 16, fontWeight: '800' }, userButton: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }, userText: { color: C.text, fontSize: 14, fontWeight: '500' },
  page: { paddingHorizontal: 44, paddingTop: 35, paddingBottom: 42 }, pageNarrow: { paddingHorizontal: 18, paddingTop: 25 }, eyebrow: { color: C.muted, fontSize: 12, fontWeight: '700', marginBottom: 8 }, pageTitle: { color: C.text, fontSize: 35, lineHeight: 42, fontWeight: '800', letterSpacing: -0.8 }, pageSubtitle: { color: C.muted, fontSize: 18, lineHeight: 26, marginTop: 7, marginBottom: 27 }, notice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: '#EDF5FF', borderColor: '#D5E6FF', borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 16 }, noticeText: { flex: 1, color: C.text, fontSize: 13, lineHeight: 19 },
  grid: { flexDirection: 'row', alignItems: 'flex-start', gap: 18 }, gridNarrow: { flexDirection: 'column' }, primaryColumn: { flex: 1, minWidth: 0, gap: 20 }, secondaryColumn: { width: 320, gap: 18 }, secondaryNarrow: { width: '100%' }, actionCards: { flexDirection: 'row', gap: 16 }, actionCardsNarrow: { flexDirection: 'column' },
  panel: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 22, shadowColor: '#233B5D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.025, shadowRadius: 8, elevation: 1 }, actionCard: { flex: 1, minWidth: 0, backgroundColor: '#F5F9FF', borderColor: '#D5E5FF', padding: 20, minHeight: 286 }, actionIcon: { width: 76, height: 76, borderRadius: 40, backgroundColor: '#E0EDFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, cardTitle: { color: C.text, fontSize: 22, fontWeight: '800', marginBottom: 7 }, cardDescription: { color: C.muted, fontSize: 15, lineHeight: 23, minHeight: 48 },
  primaryButton: { marginTop: 'auto', minHeight: 44, borderRadius: 8, backgroundColor: C.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 12 }, primaryButtonText: { color: C.white, fontSize: 14, fontWeight: '700' }, pressed: { opacity: 0.82 }, urlRow: { flexDirection: 'row', gap: 10, marginTop: 'auto', paddingTop: 16 }, urlInput: { flex: 1, minWidth: 0, height: 44, borderWidth: 1, borderColor: '#D5E2F3', borderRadius: 8, backgroundColor: C.white, paddingHorizontal: 12, color: C.text, fontSize: 13 }, checkButton: { minWidth: 75, height: 44, borderRadius: 8, backgroundColor: C.blue, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13 }, checkButtonText: { color: C.white, fontSize: 14, fontWeight: '700' },
  activityPanel: { padding: 14 }, panelHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 17, paddingHorizontal: 7 }, panelTitle: { color: C.text, fontSize: 15, fontWeight: '700' }, viewAll: { color: C.blue, fontSize: 13, fontWeight: '600' }, tableHeader: { minHeight: 36, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F8FC', paddingHorizontal: 10 }, tableHead: { color: '#465F85', fontSize: 11, fontWeight: '700' }, itemCol: { flex: 2.2, minWidth: 0 }, typeCol: { flex: 0.85, minWidth: 54 }, resultCol: { flex: 1.7, minWidth: 0 }, dateCol: { flex: 1.9, minWidth: 0 }, tableRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#EDF1F7', gap: 6 }, tableItem: { flexDirection: 'row', alignItems: 'center', gap: 10 }, itemName: { flex: 1, color: C.text, fontSize: 12 }, typePill: { alignSelf: 'flex-start', backgroundColor: '#EAF3FF', borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 }, typeText: { color: C.blue, fontSize: 11, fontWeight: '700' }, resultPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 9, paddingHorizontal: 8, paddingVertical: 6 }, resultText: { fontSize: 10, fontWeight: '600' }, dateText: { color: C.muted, fontSize: 11 },
  latestPanel: { padding: 15 }, latestSuccess: { backgroundColor: '#F0FAF5', borderWidth: 1, borderColor: '#E4F6EC', borderRadius: 9, padding: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }, largeCheck: { width: 43, height: 43, borderRadius: 24, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }, latestTitle: { color: C.text, fontSize: 14, fontWeight: '700', marginTop: 4, marginBottom: 12 }, latestMeta: { color: C.muted, fontSize: 12, lineHeight: 20 }, fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, padding: 13, borderWidth: 1, borderColor: C.border, borderRadius: 9, backgroundColor: '#F8FAFD' }, fileName: { color: C.text, fontSize: 12, fontWeight: '600' }, fileSize: { color: C.muted, fontSize: 11, marginTop: 4 },
  quarantinePanel: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, backgroundColor: '#FFF9F9', borderColor: '#FFE4E5' }, quarantineIcon: { width: 40, height: 40, borderRadius: 22, backgroundColor: '#FFE5E6', alignItems: 'center', justifyContent: 'center' }, quarantineCopy: { flex: 1, minWidth: 0 }, quarantineHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8 }, quarantineBadge: { width: 22, height: 22, borderRadius: 12, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' }, quarantineDescription: { color: C.muted, fontSize: 12, lineHeight: 19 },
});