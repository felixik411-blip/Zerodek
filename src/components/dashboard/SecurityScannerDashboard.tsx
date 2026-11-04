import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, StyleSheet,
  useWindowDimensions, StatusBar, Switch,
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

// Older sample records so the History screen shows more than the Home
// "recent activity" list. None of these would be quarantined, so the
// quarantine count stays consistent with the Home badge.
const HISTORY_ITEMS: ScanItem[] = [
  ...INITIAL_ITEMS,
  { name: 'report_draft.docx', type: 'File', result: 'No known threat', date: 'Oct 28, 2025  ·  07:15 PM' },
  { name: 'https://shop-example.org', type: 'Link', result: 'Could not decide', date: 'Oct 28, 2025  ·  11:02 AM' },
  { name: 'holiday_photo.jpg', type: 'File', result: 'No known threat', date: 'Oct 27, 2025  ·  09:40 PM' },
];

type ScreenName = 'Home' | 'History' | 'Quarantine' | 'Settings';

// Date each sample item was quarantined (UTC-safe tuple), used with the
// configurable retention period to compute the automatic-purge date.
const QUARANTINE_ON: Record<string, { y: number; m: number; d: number }> = {
  'project.zip': { y: 2025, m: 9, d: 30 },
  'https://example.com': { y: 2025, m: 9, d: 30 },
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function purgeDate(quarantined: { y: number; m: number; d: number }, retentionDays: number) {
  const d = new Date(quarantined.y, quarantined.m, quarantined.d);
  d.setDate(d.getDate() + retentionDays);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

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

function ScreenHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return <>
    <Text style={s.eyebrow}>{eyebrow}</Text>
    <Text style={s.pageTitle}>{title}</Text>
    <Text style={s.pageSubtitle}>{subtitle}</Text>
  </>;
}

function ScreenNotice({ notice, onClose }: { notice: string; onClose: () => void }) {
  return <View style={s.notice}>
    <Text style={s.noticeText}>{notice}</Text>
    <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Dismiss message">
      <Feather name="x" size={17} color={C.muted} />
    </Pressable>
  </View>;
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }}
    style={({ pressed }) => [s.chip, active && s.chipActive, pressed && s.pressed]}>
    <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
  </Pressable>;
}

function HistoryScreen({ items, notice, onNotice, onCloseNotice }: {
  items: ScanItem[]; notice: string; onNotice: (m: string) => void; onCloseNotice: () => void;
}) {
  const [filter, setFilter] = useState<'All' | 'Files' | 'Links'>('All');
  const filtered = items.filter(x => filter === 'All' || x.type === (filter === 'Files' ? 'File' : 'Link'));
  return <>
    <ScreenHeader eyebrow="HISTORY" title="Scan history" subtitle="Every file scan and link check, newest first." />
    {!!notice && <ScreenNotice notice={notice} onClose={onCloseNotice} />}
    <View style={s.chipRow}>
      {(['All', 'Files', 'Links'] as const).map(f =>
        <FilterChip key={f} label={f} active={filter === f} onPress={() => setFilter(f)} />)}
    </View>
    <Panel style={s.historyPanel}>
      {filtered.length === 0 ? (
        <View style={s.emptyState}>
          <Feather name="inbox" size={34} color="#7E94B2" />
          <Text style={s.emptyTitle}>Nothing here yet</Text>
          <Text style={s.emptyBody}>Scans you run will show up in this list. Use the All filter to see everything.</Text>
        </View>
      ) : <>
        <View style={s.tableHeader}>
          <Text style={[s.tableHead, s.itemCol]}>Item</Text>
          <Text style={[s.tableHead, s.typeCol]}>Type</Text>
          <Text style={[s.tableHead, s.resultCol]}>Result</Text>
          <Text style={[s.tableHead, s.dateCol]}>Date</Text>
        </View>
        {filtered.map((item, i) => <Pressable
          key={`${item.name}-${i}`}
          onPress={() => onNotice('Full scan details aren’t saved in this preview yet.')}
          style={({ pressed }) => [s.tableRow, pressed && s.rowPressed]}>
          <View style={[s.tableItem, s.itemCol]}><TypeIcon type={item.type} /><Text numberOfLines={1} style={s.itemName}>{item.name}</Text></View>
          <View style={s.typeCol}><View style={s.typePill}><Text style={s.typeText}>{item.type}</Text></View></View>
          <View style={s.resultCol}><ResultPill result={item.result} /></View>
          <Text numberOfLines={1} style={[s.dateText, s.dateCol]}>{item.date}</Text>
        </Pressable>)}
      </>}
    </Panel>
  </>;
}

function QuarantineScreen({ items, retentionDays, notice, onNotice, onCloseNotice }: {
  items: ScanItem[]; retentionDays: number; notice: string; onNotice: (m: string) => void; onCloseNotice: () => void;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const quarantined = items.filter(x => x.result === 'Threat found' || x.result === 'Suspicious');
  return <>
    <ScreenHeader eyebrow="QUARANTINE" title="Quarantined files" subtitle="Isolated so they can’t be opened or run normally." />
    {!!notice && <ScreenNotice notice={notice} onClose={onCloseNotice} />}
    <Panel style={s.isolateNote}>
      <MaterialCommunityIcons name="shield-alert-outline" size={22} color="#E52C32" />
      <Text style={s.isolateText}>
        Files here are blocked and kept in encrypted, app-private storage on your phone.
        They stay isolated until you take an allowed action — and they are never uploaded.
      </Text>
    </Panel>
    {quarantined.length === 0 ? (
      <Panel style={s.historyPanel}>
        <View style={s.emptyState}>
          <Feather name="check-circle" size={34} color="#16995F" />
          <Text style={s.emptyTitle}>No files are quarantined yet</Text>
          <Text style={s.emptyBody}>When a scan confirms a threat, the file is isolated here automatically where permitted.</Text>
        </View>
      </Panel>
    ) : quarantined.map(item => {
      const quarantinedOn = QUARANTINE_ON[item.name] ?? { y: 2025, m: 9, d: 30 };
      return (
        <Panel key={item.name} style={s.qCard}>
          <View style={s.qRow}>
            <View style={s.qIconWrap}><MaterialCommunityIcons name="lock" size={20} color="#E52C32" /></View>
            <View style={s.qCopy}>
              <Text numberOfLines={1} style={s.qName}>{item.name}</Text>
              <Text style={s.qMeta}>Quarantined {item.date.split('  ·  ')[0]}</Text>
              <Text style={s.qMeta}>Auto-deletes {purgeDate(quarantinedOn, retentionDays)} · {retentionDays}-day retention</Text>
            </View>
            <ResultPill result={item.result} />
          </View>
          {confirmDeleteId === item.name ? (
            <View style={s.confirmStrip}>
              <Text style={s.confirmText}>Permanently delete “{item.name}”? This can’t be undone.</Text>
              <View style={s.confirmButtons}>
                <Pressable onPress={() => setConfirmDeleteId(null)} style={({ pressed }) => [s.qButton, pressed && s.pressed]}>
                  <Text style={s.qButtonText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={() => {
                  setConfirmDeleteId(null);
                  onNotice('Deletion needs the quarantine service, which isn’t connected in this preview yet — nothing was deleted.');
                }} style={({ pressed }) => [s.qButton, s.qButtonDanger, pressed && s.pressed]}>
                  <Text style={[s.qButtonText, s.qButtonTextDanger]}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={s.qActions}>
              <Pressable onPress={() => onNotice('Restoring needs a fresh scan and your confirmation — the quarantine service isn’t connected in this preview yet.')}
                style={({ pressed }) => [s.qButton, pressed && s.pressed]}>
                <Text style={s.qButtonText}>Restore</Text>
              </Pressable>
              <Pressable onPress={() => setConfirmDeleteId(item.name)}
                style={({ pressed }) => [s.qButton, s.qButtonDanger, pressed && s.pressed]}>
                <Text style={[s.qButtonText, s.qButtonTextDanger]}>Delete</Text>
              </Pressable>
            </View>
          )}
        </Panel>
      );
    })}
  </>;
}

function SettingsScreen({ retentionDays, onRetentionChange, notice, onNotice, onCloseNotice }: {
  retentionDays: number; onRetentionChange: (d: number) => void;
  notice: string; onNotice: (m: string) => void; onCloseNotice: () => void;
}) {
  const [warnBeforeExpiry, setWarnBeforeExpiry] = useState(true);
  return <>
    <ScreenHeader eyebrow="SETTINGS" title="Settings & privacy" subtitle="Plain-language controls. Nothing here uploads your files." />
    {!!notice && <ScreenNotice notice={notice} onClose={onCloseNotice} />}

    <Panel style={s.settingsPanel}>
      <Text style={s.settingsSectionTitle}>Privacy</Text>
      <View style={s.settingsRow}>
        <MaterialCommunityIcons name="lock-outline" size={22} color={C.blue} />
        <View style={s.settingsCopy}>
          <Text style={s.settingsRowTitle}>Files stay on your phone by default</Text>
          <Text style={s.settingsRowBody}>Scanning happens on your device. Files are never uploaded without your clear permission — cloud scanning isn’t part of this app yet.</Text>
        </View>
      </View>
      <View style={s.settingsDivider} />
      <Pressable style={s.settingsRow} onPress={() => onNotice('The privacy explainer page isn’t part of this preview yet.')}>
        <MaterialCommunityIcons name="shield-check-outline" size={22} color={C.blue} />
        <View style={s.settingsCopy}>
          <Text style={s.settingsRowTitle}>How your privacy works</Text>
          <Text style={s.settingsRowBody}>A short, plain-language explanation of what the app does and doesn’t do.</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#7E94B2" />
      </Pressable>
    </Panel>

    <Panel style={s.settingsPanel}>
      <Text style={s.settingsSectionTitle}>Quarantine retention</Text>
      <Text style={s.settingsRowBody}>Quarantined files are deleted automatically after this period. You can also delete them yourself from the Quarantine screen.</Text>
      <View style={s.chipRow}>
        {[14, 30, 90].map(d =>
          <FilterChip key={d} label={`${d} days`} active={retentionDays === d} onPress={() => onRetentionChange(d)} />)}
      </View>
      <View style={[s.settingsRow, s.settingsToggleRow]}>
        <View style={s.settingsCopy}>
          <Text style={s.settingsRowTitle}>Warn me before files expire</Text>
          <Text style={s.settingsRowBody}>Get a heads-up before automatic deletion, where practical.</Text>
        </View>
        <Switch value={warnBeforeExpiry} onValueChange={setWarnBeforeExpiry} trackColor={{ false: '#DFE9F5', true: C.blue }} thumbColor={C.white} />
      </View>
    </Panel>

    <Panel style={s.settingsPanel}>
      <Text style={s.settingsSectionTitle}>App information</Text>
      <View style={s.settingsRow}>
        <MaterialCommunityIcons name="information-outline" size={22} color={C.blue} />
        <View style={s.settingsCopy}>
          <Text style={s.settingsRowTitle}>Version</Text>
          <Text style={s.settingsRowBody}>Security Scanner 0.1.0 (design preview)</Text>
        </View>
      </View>
      <View style={s.settingsDivider} />
      <Pressable style={s.settingsRow} onPress={() => onNotice('Help & About isn’t part of this preview yet.')}>
        <Feather name="help-circle" size={22} color={C.blue} />
        <View style={s.settingsCopy}>
          <Text style={s.settingsRowTitle}>Help & About</Text>
          <Text style={s.settingsRowBody}>How scanning, results, and quarantine work.</Text>
        </View>
        <Feather name="chevron-right" size={20} color="#7E94B2" />
      </Pressable>
      <Text style={s.settingsFooter}>Preview build — changes on this screen aren’t saved yet.</Text>
    </Panel>
  </>;
}

export default function SecurityScannerDashboard() {
  const { width } = useWindowDimensions();
  const desktop = width >= 1100;
  const [activeNav, setActiveNav] = useState('Home');
  const [url, setUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [items] = useState(INITIAL_ITEMS);
  const [retentionDays, setRetentionDays] = useState(30);
  const quarantineItems = items.filter(x => x.result === 'Threat found' || x.result === 'Suspicious');
  const quarantineCount = quarantineItems.length;
  const screen = activeNav as ScreenName;

  const goTo = (name: string) => {
    setActiveNav(name);
    setNotice('');
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
          {screen === 'Home' ? <>
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
          </> : screen === 'History' ? <HistoryScreen
            items={HISTORY_ITEMS}
            notice={notice}
            onNotice={setNotice}
            onCloseNotice={() => setNotice('')}
          /> : screen === 'Quarantine' ? <QuarantineScreen
            items={items}
            retentionDays={retentionDays}
            notice={notice}
            onNotice={setNotice}
            onCloseNotice={() => setNotice('')}
          /> : <SettingsScreen
            retentionDays={retentionDays}
            onRetentionChange={setRetentionDays}
            notice={notice}
            onNotice={setNotice}
            onCloseNotice={() => setNotice('')}
          />}
        </ScrollView>
        {!desktop && <View style={s.mobileNav}>
          {([['Home', 'home'], ['History', 'clock'], ['Quarantine', 'archive'], ['Settings', 'settings']] as const).map(([name, icon]) => (
            <Pressable key={name} onPress={() => goTo(name)} accessibilityRole="button"
              style={({ pressed }) => [s.mobileNavItem, pressed && { opacity: 0.7 }]}>
              <Feather name={icon} size={22} color={screen === name ? C.blue : '#7E94B2'} />
              <Text style={[s.mobileNavLabel, screen === name && s.mobileNavLabelActive]}>{name}</Text>
              {name === 'Quarantine' && quarantineCount > 0 &&
                <View style={s.mobileNavBadge}><Text style={s.navBadgeText}>{quarantineCount}</Text></View>}
            </Pressable>
          ))}
        </View>}
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

  // --- Screens 8, 10, 11 (History, Quarantine, Settings) + mobile nav ---
  historyPanel: { padding: 14 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: C.bluePale, borderColor: '#BBD8FF' },
  chipText: { color: C.muted, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: C.blue },
  rowPressed: { backgroundColor: '#F5F8FC' },
  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 36, paddingHorizontal: 18 },
  emptyTitle: { color: C.text, fontSize: 16, fontWeight: '700' },
  emptyBody: { color: C.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', maxWidth: 340 },
  isolateNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FFF9F9', borderColor: '#FFE4E5', marginBottom: 16 },
  isolateText: { flex: 1, color: C.text, fontSize: 12, lineHeight: 19 },
  qCard: { padding: 14, marginBottom: 12, gap: 12 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFE5E6', alignItems: 'center', justifyContent: 'center' },
  qCopy: { flex: 1, minWidth: 0, gap: 3 },
  qName: { color: C.text, fontSize: 13, fontWeight: '700' },
  qMeta: { color: C.muted, fontSize: 11, lineHeight: 16 },
  qActions: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  qButton: { minHeight: 34, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  qButtonDanger: { borderColor: '#FFC9CB', backgroundColor: '#FFF7F7' },
  qButtonText: { color: C.text, fontSize: 12, fontWeight: '700' },
  qButtonTextDanger: { color: '#E52C32' },
  confirmStrip: { backgroundColor: '#FFF0F1', borderWidth: 1, borderColor: '#FFD4D6', borderRadius: 8, padding: 10, gap: 10 },
  confirmText: { color: C.text, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  confirmButtons: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  settingsPanel: { padding: 18, marginBottom: 14, gap: 14 },
  settingsSectionTitle: { color: C.text, fontSize: 16, fontWeight: '800' },
  settingsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  settingsCopy: { flex: 1, minWidth: 0, gap: 3 },
  settingsRowTitle: { color: C.text, fontSize: 14, fontWeight: '700' },
  settingsRowBody: { color: C.muted, fontSize: 12, lineHeight: 18 },
  settingsDivider: { height: 1, backgroundColor: '#EDF1F7' },
  settingsToggleRow: { alignItems: 'center', paddingTop: 4 },
  settingsFooter: { color: '#8CA0BC', fontSize: 11, marginTop: 2 },
  mobileNav: { flexDirection: 'row', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: '#E8EEF6', paddingHorizontal: 6, paddingTop: 8, paddingBottom: 12, gap: 4 },
  mobileNavItem: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 6, borderRadius: 10 },
  mobileNavLabel: { fontSize: 11, fontWeight: '600', color: '#60779A' },
  mobileNavLabelActive: { color: C.blue },
  mobileNavBadge: { position: 'absolute', top: 0, right: '26%', minWidth: 17, height: 17, borderRadius: 9, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
});
