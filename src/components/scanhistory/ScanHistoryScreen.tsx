import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ScanType = 'File' | 'Link';
type ScanResult =
  | 'Threat found'
  | 'No known threat'
  | 'Likely dangerous'
  | 'Needs your review'
  | 'Could not decide';

type ScanRecord = {
  id: string;
  date: string;
  time: string;
  item: string;
  subtitle?: string;
  type: ScanType;
  result: ScanResult;
  detail: string;
  icon: 'document' | 'image' | 'link';
};

type Filter = 'All' | 'Files' | 'Links';

const INITIAL_RECORDS: ScanRecord[] = [
  {
    id: '1',
    date: 'Oct 30, 2025',
    time: '10:24 AM',
    item: 'Project_Proposal.pdf',
    subtitle: '2.4 MB',
    type: 'File',
    result: 'Threat found',
    detail: 'Malicious content detected.',
    icon: 'document',
  },
  {
    id: '2',
    date: 'Oct 30, 2025',
    time: '09:17 AM',
    item: 'Screenshot_20251030.png',
    subtitle: '1.2 MB',
    type: 'File',
    result: 'No known threat',
    detail: 'No known threat found.',
    icon: 'image',
  },
  {
    id: '3',
    date: 'Oct 29, 2025',
    time: '06:42 PM',
    item: 'https://malicious-site.fake',
    type: 'Link',
    result: 'Likely dangerous',
    detail: 'This link is associated with malicious activity.',
    icon: 'link',
  },
  {
    id: '4',
    date: 'Oct 29, 2025',
    time: '02:13 PM',
    item: 'https://example.com',
    type: 'Link',
    result: 'No known threat',
    detail: 'No known threat found.',
    icon: 'link',
  },
  {
    id: '5',
    date: 'Oct 28, 2025',
    time: '11:07 AM',
    item: 'photo_20251028.jpg',
    subtitle: '3.6 MB',
    type: 'File',
    result: 'Needs your review',
    detail: 'Suspicious patterns detected.',
    icon: 'image',
  },
  {
    id: '6',
    date: 'Oct 27, 2025',
    time: '08:32 PM',
    item: 'https://bit.ly/abc123',
    type: 'Link',
    result: 'Could not decide',
    detail: 'Unable to confirm the safety of this link.',
    icon: 'link',
  },
  {
    id: '7',
    date: 'Oct 27, 2025',
    time: '01:15 PM',
    item: 'Notes_backup.docx',
    subtitle: '1.1 MB',
    type: 'File',
    result: 'No known threat',
    detail: 'No known threat found.',
    icon: 'document',
  },
  {
    id: '8',
    date: 'Oct 26, 2025',
    time: '09:03 AM',
    item: 'https://safe-site.com',
    type: 'Link',
    result: 'No known threat',
    detail: 'No known threat found.',
    icon: 'link',
  },
];

const COLORS = {
  navy: '#102746',
  muted: '#5D76A0',
  blue: '#0878FF',
  paleBlue: '#E7F1FF',
  border: '#DFEAF8',
  green: '#0AA66A',
  red: '#FF4148',
  orange: '#FF9E1B',
  white: '#FFFFFF',
};

function ResultStyle({ result }: { result: ScanResult }) {
  const config: Record<ScanResult, { color: string; background: string; icon: keyof typeof Ionicons.glyphMap }> = {
    'Threat found': { color: '#FF3038', background: '#FFF0F1', icon: 'alert-circle' },
    'No known threat': { color: '#079D66', background: '#EAF9F3', icon: 'checkmark-circle' },
    'Likely dangerous': { color: '#FF3038', background: '#FFF0F1', icon: 'alert-circle' },
    'Needs your review': { color: '#F29A00', background: '#FFF7E8', icon: 'warning' },
    'Could not decide': { color: '#E88A00', background: '#FFF7E8', icon: 'warning' },
  };
  const item = config[result];

  return (
    <View style={styles.resultCell}>
      <View style={[styles.resultIcon, { backgroundColor: item.background }]}>
        <Ionicons name={item.icon} size={21} color={item.color} />
      </View>
      <View style={styles.resultText}>
        <View style={[styles.resultPill, { backgroundColor: item.background }]}>
          <Text style={[styles.resultLabel, { color: item.color }]}>{result}</Text>
        </View>
        <Text style={styles.detailText}>{result === 'Threat found' ? 'Malicious content detected.' : result === 'Likely dangerous' ? 'This link is associated with malicious activity.' : result === 'Needs your review' ? 'Suspicious patterns detected.' : result === 'Could not decide' ? 'Unable to confirm the safety of this link.' : 'No known threat found.'}</Text>
      </View>
    </View>
  );
}

function ItemIcon({ kind }: { kind: ScanRecord['icon'] }) {
  const iconName: keyof typeof Ionicons.glyphMap =
    kind === 'link' ? 'link' : kind === 'image' ? 'image' : 'document-text';
  return (
    <View style={[styles.itemIcon, kind === 'document' && styles.documentIcon]}>
      <Ionicons name={iconName} size={22} color={COLORS.blue} />
    </View>
  );
}

function Sidebar({ active, onNavigate }: { active: string; onNavigate: (name: string) => void }) {
  const navItems: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Home', icon: 'home' },
    { label: 'History', icon: 'time-outline' },
    { label: 'Quarantine', icon: 'file-tray-full-outline' },
    { label: 'Settings', icon: 'settings-outline' },
  ];

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.brandShield}>
          <Ionicons name="shield-checkmark" size={25} color="#FFFFFF" />
        </View>
        <Text style={styles.brandText}>
          Security <Text style={styles.brandBlue}>Scanner</Text>
        </Text>
      </View>

      <View style={styles.navList}>
        {navItems.map((item) => {
          const selected = active === item.label;
          return (
            <Pressable
              key={item.label}
              onPress={() => onNavigate(item.label)}
              style={[styles.navItem, selected && styles.navItemActive]}
            >
              <Ionicons name={item.icon} size={23} color="#EAF3FF" />
              <Text style={styles.navLabel}>{item.label}</Text>
              {item.label === 'Quarantine' && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <Ionicons name="shield-checkmark-outline" size={25} color="#70B7FF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.footerStrong}>Files stay on your phone{'\n'}by default.</Text>
          <Text style={styles.footerCopy}>We don't upload your files{'\n'}without your permission.</Text>
        </View>
      </View>
    </View>
  );
}

export default function ScanHistoryScreen() {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [records] = useState(INITIAL_RECORDS);

  const visibleRecords = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Files' && record.type === 'File') ||
        (filter === 'Links' && record.type === 'Link');
      const matchesSearch =
        !normalized ||
        `${record.item} ${record.type} ${record.result} ${record.detail}`
          .toLowerCase()
          .includes(normalized);
      return matchesFilter && matchesSearch;
    });
  }, [filter, records, search]);

  const navigate = (name: string) => {
    // Replace with your navigation library, e.g. router.push(...).
    console.log(`Navigate to ${name}`);
  };

  const openRecord = (record: ScanRecord) => {
    // Replace with navigation to the appropriate file/link scan result screen.
    console.log('Open scan record:', record.id, record.item);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        {!compact && <Sidebar active="History" onNavigate={navigate} />}

        <View style={styles.main}>
          <View style={styles.topBar}>
            {compact && (
              <Pressable style={styles.mobileMenu} onPress={() => navigate('Menu')}>
                <Ionicons name="menu" size={25} color={COLORS.navy} />
              </Pressable>
            )}
            <View style={styles.userMenu}>
              <Ionicons name="person-circle" size={25} color={COLORS.navy} />
              <Text style={styles.userText}>User</Text>
              <Ionicons name="chevron-down" size={16} color="#8CA0BF" />
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.headingRow, compact && styles.headingCompact]}>
              <View style={styles.headingIcon}>
                <Ionicons name="time" size={48} color={COLORS.blue} />
              </View>
              <View style={styles.headingCopy}>
                <Text style={styles.pageTitle}>Scan history</Text>
                <Text style={styles.pageSubtitle}>View your recent file scans and link checks.</Text>
              </View>
              <View style={[styles.searchBox, compact && styles.searchCompact]}>
                <Ionicons name="search" size={19} color="#6F88B3" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search history..."
                  placeholderTextColor="#8296B8"
                  style={styles.searchInput}
                  accessibilityLabel="Search scan history"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} accessibilityLabel="Clear search">
                    <Ionicons name="close-circle" size={18} color="#8296B8" />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.filters}>
              {(['All', 'Files', 'Links'] as Filter[]).map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={[styles.filterButton, filter === item && styles.filterButtonActive]}
                >
                  <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.tableCard}>
              {compact ? (
                <View style={styles.mobileColumnHead}>
                  <Text style={styles.mobileColumnTitle}>Recent scans</Text>
                  <Text style={styles.mobileCount}>{visibleRecords.length} records</Text>
                </View>
              ) : (
                <View style={styles.tableHeader}>
                  <Text style={[styles.headerCell, styles.dateColumn]}>Date &amp; time</Text>
                  <Text style={[styles.headerCell, styles.itemColumn]}>Item</Text>
                  <Text style={[styles.headerCell, styles.typeColumn]}>Type</Text>
                  <Text style={[styles.headerCell, styles.resultColumn]}>Result</Text>
                  <Text style={[styles.headerCell, styles.detailsColumn]}>Details</Text>
                </View>
              )}

              {visibleRecords.map((record) => (
                <Pressable
                  key={record.id}
                  onPress={() => openRecord(record)}
                  style={({ pressed }) => [
                    styles.tableRow,
                    compact && styles.mobileRecord,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={[styles.dateColumn, compact && styles.mobileDate]}>
                    <Text style={styles.dateText}>{record.date}</Text>
                    <Text style={styles.timeText}>{record.time}</Text>
                  </View>

                  <View style={[styles.itemColumn, styles.itemCell, compact && styles.mobileItem]}>
                    <ItemIcon kind={record.icon} />
                    <View style={styles.itemCopy}>
                      <Text numberOfLines={compact ? 2 : 1} style={styles.itemName}>{record.item}</Text>
                      {!!record.subtitle && <Text style={styles.itemSubtitle}>{record.subtitle}</Text>}
                    </View>
                  </View>

                  <View style={[styles.typeColumn, styles.typeCell, compact && styles.mobileType]}>
                    <Ionicons
                      name={record.type === 'File' ? 'document-outline' : 'link-outline'}
                      size={21}
                      color="#4D6D9E"
                    />
                    <Text style={styles.typeText}>{record.type}</Text>
                  </View>

                  <View style={[styles.resultColumn, compact && styles.mobileResult]}>
                    <ResultStyle result={record.result} />
                  </View>

                  <View style={[styles.detailsColumn, styles.detailsCell]}>
                    <Ionicons name="chevron-forward" size={22} color="#7797C8" />
                  </View>
                </Pressable>
              ))}

              {visibleRecords.length === 0 && (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="time-outline" size={27} color="#4776B7" />
                  </View>
                  <Text style={styles.emptyTitle}>No scan history found</Text>
                  <Text style={styles.emptySubtitle}>
                    {search ? 'Try another search term.' : 'Your recent file scans and link checks will appear here.'}
                  </Text>
                  {(search || filter !== 'All') && (
                    <Pressable
                      onPress={() => {
                        setSearch('');
                        setFilter('All');
                      }}
                      style={styles.resetButton}
                    >
                      <Text style={styles.resetButtonText}>Clear filters</Text>
                    </Pressable>
                  )}
                </View>
              )}

              {visibleRecords.length > 0 && (
                <View style={styles.tableEmptyFooter}>
                  <View style={styles.smallHistoryIcon}>
                    <Ionicons name="time-outline" size={22} color="#3268AE" />
                  </View>
                  <Text style={styles.emptyFooterTitle}>No scan history yet</Text>
                  <Text style={styles.emptyFooterCopy}>Your recent file scans and link checks will appear here.</Text>
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
    backgroundColor: '#F4F8FD',
  },
  app: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F9FE',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#142940',
    paddingTop: 17,
    paddingHorizontal: 15,
    minHeight: '100%',
    borderRightWidth: 1,
    borderRightColor: '#203B59',
  },
  brand: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#203B59',
    marginHorizontal: -15,
    paddingBottom: 15,
    paddingLeft: 24,
  },
  brandShield: {
    width: 38,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#0878FF',
    borderRadius: 13,
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  brandBlue: {
    color: '#70C3FF',
  },
  navList: {
    paddingTop: 20,
    gap: 7,
  },
  navItem: {
    minHeight: 46,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 14,
  },
  navItemActive: {
    backgroundColor: '#1C4F89',
  },
  navLabel: {
    flex: 1,
    color: '#F5F8FE',
    fontSize: 15,
    fontWeight: '500',
  },
  badge: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4A51',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sidebarFooter: {
    position: 'absolute',
    left: 26,
    right: 26,
    bottom: 80,
    borderTopWidth: 1,
    borderTopColor: '#28425E',
    paddingTop: 20,
    flexDirection: 'row',
    gap: 13,
  },
  footerStrong: {
    color: '#F5F8FE',
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '600',
  },
  footerCopy: {
    color: '#C4D3E7',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topBar: {
    height: 62,
    borderBottomWidth: 1,
    borderBottomColor: '#E2ECF8',
    backgroundColor: 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: 30,
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userText: {
    color: COLORS.navy,
    fontSize: 14,
    fontWeight: '600',
  },
  mobileMenu: {
    marginRight: 'auto',
    padding: 5,
  },
  pageContent: {
    paddingTop: 20,
    paddingHorizontal: 36,
    paddingBottom: 36,
    flexGrow: 1,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    minHeight: 78,
  },
  headingIcon: {
    width: 74,
    height: 74,
    borderRadius: 15,
    backgroundColor: '#E4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingCopy: {
    flex: 1,
  },
  pageTitle: {
    color: COLORS.navy,
    fontSize: 30,
    fontWeight: '750',
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    color: '#627DA9',
    fontSize: 16,
    marginTop: 5,
  },
  searchBox: {
    width: 302,
    height: 39,
    borderWidth: 1,
    borderColor: '#D5E5FC',
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 11,
    marginTop: 30,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 7,
    fontSize: 13,
    color: COLORS.navy,
    outlineStyle: 'none',
  } as any,
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 13,
  },
  filterButton: {
    minWidth: 78,
    height: 31,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#EAF2FC',
  },
  filterButtonActive: {
    backgroundColor: COLORS.blue,
  },
  filterText: {
    color: '#506A94',
    fontSize: 13,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  tableCard: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.84)',
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 13,
    overflow: 'hidden',
    shadowColor: '#A7C3E7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFE',
    borderBottomWidth: 1,
    borderBottomColor: '#E4EDF8',
    marginHorizontal: -1,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: '#536D99',
    fontSize: 12,
    fontWeight: '600',
  },
  dateColumn: {
    width: '14%',
  },
  itemColumn: {
    width: '28%',
  },
  typeColumn: {
    width: '15%',
  },
  resultColumn: {
    width: '30%',
  },
  detailsColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  tableRow: {
    minHeight: 73,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E4EDF8',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  rowPressed: {
    backgroundColor: '#F1F7FF',
  },
  dateText: {
    color: '#5D78A5',
    fontSize: 12,
    lineHeight: 19,
  },
  timeText: {
    color: '#7D96BE',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 2,
  },
  itemCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingRight: 12,
  },
  itemIcon: {
    width: 37,
    height: 37,
    borderRadius: 18,
    backgroundColor: '#E4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  documentIcon: {
    backgroundColor: '#E4F0FF',
  },
  itemCopy: {
    flex: 1,
    minWidth: 0,
  },
  itemName: {
    color: '#102B50',
    fontSize: 12,
    fontWeight: '600',
  },
  itemSubtitle: {
    color: '#7790B8',
    fontSize: 11,
    marginTop: 5,
  },
  typeCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  typeText: {
    color: '#5A76A2',
    fontSize: 12,
  },
  resultCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 8,
  },
  resultIcon: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultText: {
    flex: 1,
    minWidth: 0,
    alignItems: 'flex-start',
  },
  resultPill: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailText: {
    color: '#7891B9',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 16,
  },
  detailsCell: {
    justifyContent: 'center',
  },
  tableEmptyFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 14,
  },
  smallHistoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  emptyFooterTitle: {
    color: COLORS.navy,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyFooterCopy: {
    color: '#8097BC',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
    paddingHorizontal: 18,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 25,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    color: COLORS.navy,
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    color: '#7891B9',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 15,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 7,
    backgroundColor: COLORS.blue,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  headingCompact: {
    flexWrap: 'wrap',
    gap: 12,
  },
  searchCompact: {
    width: '100%',
    marginTop: 4,
  },
  mobileColumnHead: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mobileColumnTitle: {
    color: COLORS.navy,
    fontSize: 15,
    fontWeight: '700',
  },
  mobileCount: {
    color: COLORS.muted,
    fontSize: 12,
  },
  mobileRecord: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 10,
    paddingHorizontal: 3,
    paddingVertical: 14,
  },
  mobileDate: {
    width: '100%',
  },
  mobileItem: {
    width: '100%',
    paddingRight: 0,
  },
  mobileType: {
    width: '100%',
  },
  mobileResult: {
    width: '100%',
  },
});