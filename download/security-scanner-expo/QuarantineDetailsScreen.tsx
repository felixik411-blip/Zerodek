import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  File,
  FileText,
  History,
  Home,
  Info,
  LockKeyhole,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  TriangleAlert,
  UserCircle,
  Archive,
  Zap,
} from 'lucide-react-native';

type Props = {
  onBack?: () => void;
  onHome?: () => void;
  onHistory?: () => void;
  onSettings?: () => void;
  onOpenQuarantine?: () => void;
  /// Live quarantined item from GET /api/quarantine, forwarded by the glue
  /// via query params. Undefined keeps the hand-off's designed sample.
  itemId?: string;
  itemName?: string;
  itemType?: string;
  itemSize?: string;
  itemReason?: string;
  itemDate?: string;
  /// Called on confirmed delete so the glue can hit DELETE
  /// /api/quarantine/:id; without it the hand-off keeps its demo notice.
  onDelete?: (id: string) => void;
};

const BLUE = '#0878F9';
const NAVY = '#142943';
const MUTED = '#58729B';
const BORDER = '#DCE9FA';

function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'outline';
  icon?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'danger' && styles.dangerButton,
        variant === 'outline' && styles.outlineButton,
      ]}
    >
      {icon}
      <Text
        style={[
          styles.buttonText,
          variant === 'outline' && styles.outlineButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Sidebar({
  onHome,
  onHistory,
  onSettings,
  onOpenQuarantine,
}: Pick<Props, 'onHome' | 'onHistory' | 'onSettings' | 'onOpenQuarantine'>) {
  const navItems = [
    { label: 'Home', icon: Home, onPress: onHome },
    { label: 'History', icon: History, onPress: onHistory },
    { label: 'Quarantine', icon: Archive, onPress: onOpenQuarantine, active: true },
    { label: 'Settings', icon: Settings, onPress: onSettings },
  ];

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.brandShield}>
          <ShieldCheck size={27} color="#FFFFFF" strokeWidth={2.8} />
        </View>
        <Text style={styles.brandText}>
          Security <Text style={styles.brandAccent}>Scanner</Text>
        </Text>
      </View>

      <View style={styles.navList}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <TouchableOpacity
              key={item.label}
              accessibilityRole="button"
              onPress={item.onPress}
              style={[styles.navItem, item.active && styles.navItemActive]}
            >
              <Icon size={21} color="#EAF3FF" strokeWidth={2.5} />
              <Text style={styles.navText}>{item.label}</Text>
              {item.active && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>2</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sidebarPrivacy}>
        <ShieldCheck size={25} color="#63B6FF" />
        <View style={{ flex: 1 }}>
          <Text style={styles.privacyTitle}>Files stay on your phone</Text>
          <Text style={styles.privacyText}>by default.</Text>
          <Text style={[styles.privacyText, { marginTop: 7 }]}>
            We don't upload your files without your permission.
          </Text>
        </View>
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function QuarantineDetailsScreen({
  onBack,
  onHome,
  onHistory,
  onSettings,
  onOpenQuarantine,
  itemId,
  itemName = 'Project_Proposal.pdf',
  itemType = 'PDF document',
  itemSize = '2.4 MB',
  itemReason = 'Malicious content detected',
  itemDate = 'Oct 30, 2025  •  10:24 AM',
  onDelete,
}: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = () => {
    Alert.alert(
      'Delete file permanently?',
      'This removes the quarantined file from your device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: () => {
            setDeleting(true);
            // With the glue's onDelete this really removes the quarantined
            // item (DELETE /api/quarantine/:id); without it the hand-off
            // keeps its honest demo notice.
            if (onDelete && itemId) {
              onDelete(itemId);
              Alert.alert('File deleted', `${itemName} has been permanently removed.`);
            } else {
              Alert.alert(
                'Demo action',
                'Connect your quarantine service to permanently delete the actual file.',
              );
            }
            setDeleting(false);
          },
        },
      ],
    );
  };

  const scanBeforeRestore = () => {
    // TODO: Call the scanner service. Only offer restore after a real scan
    // reports a result that your security policy considers safe.
    Alert.alert(
      'Scan before restoring',
      'Connect your scanner service to rescan this quarantined file before allowing restoration.',
    );
  };

  return (
    <View style={styles.app}>
      <Sidebar
        onHome={onHome}
        onHistory={onHistory}
        onSettings={onSettings}
        onOpenQuarantine={onOpenQuarantine}
      />

      <View style={styles.main}>
        <View style={styles.topbar}>
          <View />
          <View style={styles.userMenu}>
            <UserCircle size={24} color={NAVY} fill="#E7EFFB" />
            <Text style={styles.userText}>User</Text>
            <Text style={styles.userChevron}>⌄</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={onBack ?? onOpenQuarantine}
            style={styles.backLink}
            accessibilityRole="button"
          >
            <ArrowLeft size={18} color={BLUE} />
            <Text style={styles.backLinkText}>Back to Quarantine</Text>
          </TouchableOpacity>

          <View style={[styles.summaryGrid, compact && styles.summaryGridCompact]}>
            <View style={[styles.fileSummary, compact && styles.fullWidth]}>
              <View style={styles.pdfIconBox}>
                <FileText size={46} color="#FFFFFF" fill="#FF454B" />
                <Text style={styles.pdfLabel}>PDF</Text>
              </View>
              <View style={styles.fileSummaryText}>
                <Text style={styles.fileTitle}>{itemName}</Text>
                <Text style={styles.fileSubtitle}>{itemType}  •  {itemSize}</Text>
                <View style={styles.quarantinedBanner}>
                  <View style={styles.redCircle}>
                    <ShieldAlert size={17} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.redBannerTitle}>Quarantined</Text>
                    <Text style={styles.redBannerText}>
                      This file is isolated and should not be opened.
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.metadataCard, compact && styles.fullWidth]}>
              <View style={styles.metadataRow}>
                <CalendarDays size={23} color="#49658F" />
                <View>
                  <Text style={styles.metadataLabel}>Quarantined on</Text>
                  <Text style={styles.metadataValue}>{itemDate}</Text>
                </View>
              </View>
              <View style={styles.metadataRow}>
                <Shield size={23} color="#49658F" />
                <View>
                  <Text style={styles.metadataLabel}>Reason</Text>
                  <Text style={styles.metadataValue}>{itemReason}</Text>
                </View>
              </View>
              <View style={styles.metadataRow}>
                <Search size={23} color="#49658F" />
                <View>
                  <Text style={styles.metadataLabel}>Current state</Text>
                  <Text style={styles.metadataValue}>Isolated (in quarantine)</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.actionsPanel, compact && styles.actionsPanelCompact]}>
            <View style={[styles.fileInformation, compact && styles.fullWidth]}>
              <View style={styles.sectionHeading}>
                <File size={22} color={NAVY} />
                <Text style={styles.sectionTitle}>File information</Text>
              </View>

              <View style={styles.detailsList}>
                <DetailRow label="File name" value={itemName} />
                <DetailRow label="File type" value={itemType} />
                <DetailRow label="File size" value={itemSize} />
              </View>

              <View style={styles.infoBox}>
                <Info size={23} color={BLUE} fill={BLUE} />
                <Text style={styles.infoText}>
                  This file is quarantined. You can choose to scan it before restoring, or delete it permanently.
                </Text>
              </View>
            </View>

            <View style={[styles.availableActions, compact && styles.fullWidth]}>
              <View style={styles.sectionHeading}>
                <Zap size={22} color={NAVY} />
                <Text style={styles.sectionTitle}>Available actions</Text>
              </View>

              <View style={[styles.actionCards, compact && styles.actionCardsCompact]}>
                <View style={styles.scanActionCard}>
                  <View style={styles.actionCardHeading}>
                    <View style={styles.blueActionIcon}>
                      <Search size={25} color="#FFFFFF" />
                    </View>
                    <Text style={styles.scanActionTitle}>Scan before restoring</Text>
                  </View>
                  <Text style={styles.actionDescription}>
                    We'll scan the file again to check if it's safe. If it's clean, you can restore it to your device.
                  </Text>
                  <AppButton
                    label="Scan and check"
                    onPress={scanBeforeRestore}
                    icon={<Search size={17} color="#FFFFFF" />}
                  />
                </View>

                <View style={styles.deleteActionCard}>
                  <View style={styles.actionCardHeading}>
                    <View style={styles.redActionIcon}>
                      <Trash2 size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.deleteActionTitle}>Delete permanently</Text>
                  </View>
                  <Text style={styles.actionDescription}>
                    This will remove the file from quarantine and your device. This action can't be undone.
                  </Text>
                  <AppButton
                    label={deleting ? 'Deleting…' : 'Delete permanently'}
                    onPress={confirmDelete}
                    variant="danger"
                    icon={<Trash2 size={17} color="#FFFFFF" />}
                  />
                </View>
              </View>
            </View>

            <View style={styles.warningBox}>
              <View style={styles.warningIcon}>
                <TriangleAlert size={21} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.warningTitle}>
                  Restoring a file may put a risky file back on your device.
                </Text>
                <Text style={styles.warningText}>
                  Only restore if you're sure the file is safe. Always scan before restoring.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.historyPanel}>
            <View style={styles.sectionHeading}>
              <History size={23} color={NAVY} />
              <Text style={styles.sectionTitle}>Scan history</Text>
            </View>
            <View style={[styles.historyEntry, compact && styles.historyEntryCompact]}>
              <View style={styles.historySearchIcon}>
                <Search size={19} color={BLUE} />
              </View>
              <View style={styles.historyDescription}>
                <Text style={styles.historyTitle}>Initial scan (when quarantined)</Text>
                <Text style={styles.historySubtitle}>Detected as malicious content.</Text>
              </View>
              <Text style={styles.historyDate}>Oct 30, 2025  •  10:24 AM</Text>
              <View style={styles.threatPill}>
                <ShieldAlert size={14} color="#FF3F45" />
                <Text style={styles.threatPillText}>Threat found</Text>
              </View>
            </View>
          </View>

          <View style={[styles.helpBar, compact && styles.helpBarCompact]}>
            <ShieldCheck size={28} color={BLUE} fill="#E0EEFF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.helpTitle}>Need help?</Text>
              <Text style={styles.helpText}>
                If you're unsure what to do, keep the file quarantined. You can always scan it later or contact support.
              </Text>
            </View>
            <AppButton
              label="Back to list"
              variant="outline"
              onPress={onBack ?? onOpenQuarantine ?? (() => {})}
              icon={<ArrowLeft size={17} color={BLUE} />}
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F5F9FE',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#14283F',
    paddingTop: 18,
    paddingHorizontal: 15,
    minHeight: '100%',
  },
  brand: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#263D57',
    marginBottom: 13,
  },
  brandShield: {
    width: 39,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#0878F9',
    borderRadius: 13,
  },
  brandText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  brandAccent: { color: '#69BEFF' },
  navList: { gap: 7 },
  navItem: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 13,
    borderRadius: 8,
  },
  navItemActive: { backgroundColor: '#174B85' },
  navText: { color: '#F4F8FF', fontSize: 15, fontWeight: '500', flex: 1 },
  countBadge: {
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4A50',
  },
  countText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  sidebarPrivacy: {
    marginTop: 'auto',
    marginBottom: 78,
    borderTopWidth: 1,
    borderTopColor: '#263D57',
    paddingTop: 19,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 12,
  },
  privacyTitle: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', lineHeight: 18 },
  privacyText: { color: '#C5D5E9', fontSize: 12, lineHeight: 18 },
  main: { flex: 1, minWidth: 0 },
  topbar: {
    height: 62,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E4EDF8',
    paddingHorizontal: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userMenu: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  userText: { color: NAVY, fontSize: 14, fontWeight: '600' },
  userChevron: { color: '#7D91B1', fontSize: 19, marginLeft: 2 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 33, paddingTop: 22, paddingBottom: 26, gap: 20 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' },
  backLinkText: { color: BLUE, fontSize: 13, fontWeight: '600' },
  summaryGrid: { flexDirection: 'row', gap: 20, alignItems: 'stretch' },
  summaryGridCompact: { flexDirection: 'column' },
  fullWidth: { width: '100%', flexBasis: 'auto' },
  fileSummary: {
    flex: 1.15,
    flexDirection: 'row',
    gap: 25,
    padding: 16,
    minHeight: 190,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
  },
  pdfIconBox: {
    width: 72,
    height: 78,
    borderRadius: 15,
    backgroundColor: '#EAF3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfLabel: { position: 'absolute', color: '#FFFFFF', fontSize: 11, fontWeight: '900', top: 43 },
  fileSummaryText: { flex: 1, minWidth: 0 },
  fileTitle: { color: '#102747', fontSize: 25, fontWeight: '800', marginTop: 7 },
  fileSubtitle: { color: MUTED, fontSize: 17, marginTop: 7 },
  quarantinedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 11,
    padding: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFDDE0',
    backgroundColor: '#FFF5F5',
  },
  redCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FF454B', alignItems: 'center', justifyContent: 'center' },
  redBannerTitle: { color: '#D9272D', fontWeight: '700', fontSize: 13 },
  redBannerText: { color: MUTED, fontSize: 12, marginTop: 3, lineHeight: 17 },
  metadataCard: {
    flex: 0.85,
    justifyContent: 'center',
    gap: 19,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
  },
  metadataRow: { flexDirection: 'row', gap: 17, alignItems: 'flex-start' },
  metadataLabel: { color: MUTED, fontSize: 12, marginBottom: 3 },
  metadataValue: { color: '#49658F', fontSize: 13, lineHeight: 19 },
  actionsPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    padding: 23,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 22,
  },
  actionsPanelCompact: { flexDirection: 'column' },
  fileInformation: {
    flex: 0.92,
    minWidth: 250,
    paddingRight: 22,
    borderRightWidth: 1,
    borderRightColor: '#E5EDF8',
  },
  availableActions: { flex: 1.25, minWidth: 300 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  sectionTitle: { color: '#102747', fontSize: 16, fontWeight: '800' },
  detailsList: { gap: 17, marginTop: 8, marginBottom: 34 },
  detailRow: { flexDirection: 'row', gap: 12 },
  detailLabel: { width: 150, color: MUTED, fontSize: 13 },
  detailValue: { flex: 1, color: '#19375E', fontSize: 13 },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    padding: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#CFE4FF',
    backgroundColor: '#F0F7FF',
  },
  infoText: { flex: 1, color: '#3568B4', fontSize: 12, lineHeight: 19 },
  actionCards: { flexDirection: 'row', gap: 18 },
  actionCardsCompact: { flexDirection: 'column' },
  scanActionCard: {
    flex: 1,
    minWidth: 220,
    padding: 20,
    borderWidth: 1,
    borderColor: '#C7E0FF',
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  deleteActionCard: {
    flex: 1,
    minWidth: 220,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFD8DB',
    borderRadius: 8,
    backgroundColor: '#FFF6F6',
  },
  actionCardHeading: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  blueActionIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: BLUE, alignItems: 'center', justifyContent: 'center' },
  redActionIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#FF3E45', alignItems: 'center', justifyContent: 'center' },
  scanActionTitle: { flex: 1, color: '#0349AD', fontSize: 15, fontWeight: '800' },
  deleteActionTitle: { flex: 1, color: '#F12E35', fontSize: 15, fontWeight: '800' },
  actionDescription: { color: '#4E70A5', fontSize: 12, lineHeight: 21, marginLeft: 66, marginBottom: 17 },
  button: {
    minHeight: 42,
    borderRadius: 7,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  primaryButton: { backgroundColor: BLUE },
  dangerButton: { backgroundColor: '#FF3E45' },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#9CC4FF' },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  outlineButtonText: { color: BLUE },
  warningBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    padding: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFE2A0',
    backgroundColor: '#FFFAED',
  },
  warningIcon: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#FFB83E', alignItems: 'center', justifyContent: 'center' },
  warningTitle: { color: '#183357', fontSize: 12, fontWeight: '800', marginBottom: 5 },
  warningText: { color: MUTED, fontSize: 12, lineHeight: 18 },
  historyPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 9,
    padding: 16,
  },
  historyEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0EBFA',
    borderRadius: 8,
  },
  historyEntryCompact: { flexWrap: 'wrap' },
  historySearchIcon: { width: 39, height: 39, borderRadius: 20, backgroundColor: '#E8F3FF', alignItems: 'center', justifyContent: 'center' },
  historyDescription: { flex: 1, minWidth: 170 },
  historyTitle: { color: '#365787', fontSize: 12, fontWeight: '700', marginBottom: 5 },
  historySubtitle: { color: MUTED, fontSize: 12 },
  historyDate: { color: MUTED, fontSize: 12 },
  threatPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFF0F0', borderColor: '#FFD9DC', borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  threatPillText: { color: '#F12F36', fontSize: 11, fontWeight: '700' },
  helpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: '#CFE4FF',
    borderRadius: 8,
    backgroundColor: '#F0F7FF',
  },
  helpBarCompact: { flexWrap: 'wrap' },
  helpTitle: { color: '#163458', fontSize: 12, fontWeight: '800', marginBottom: 4 },
  helpText: { color: '#4770AA', fontSize: 11, lineHeight: 17 },
});