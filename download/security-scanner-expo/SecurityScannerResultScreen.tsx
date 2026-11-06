import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, StatusBar, useWindowDimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const C = {
  navy: '#192D47', blue: '#0878F9', paleBlue: '#EAF3FF',
  bg: '#F7FAFE', text: '#172B49', muted: '#5E7599',
  border: '#E0EAF6', white: '#FFFFFF', red: '#F04444',
  paleRed: '#FFF5F5', green: '#20A36D', paleGreen: '#F0FBF7',
  amber: '#B47B1B', paleAmber: '#FFF8E9',
};

type Props = {
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  scanDate?: string;
  scanTime?: string;
  /// Live verdict from POST /api/scan/file, forwarded by the flow glue.
  /// Undefined keeps the hand-off's original threat-found demo, so a direct
  /// visit to /scan-result/ still renders the designed sample.
  verdict?: 'clean' | 'suspicious' | 'malicious';
  threatName?: string;
  reasons?: string[];
  onBackHome?: () => void;
  onViewQuarantine?: () => void;
  onDeletePermanently?: () => void;
  onScanAnother?: () => void;
};

export default function SecurityScannerResultScreen({
  fileName = 'Project_Proposal.pdf',
  fileType = 'PDF document',
  fileSize = '2.4 MB',
  scanDate = 'Oct 30, 2025',
  scanTime = '10:24 AM',
  verdict,
  threatName,
  reasons,
  onBackHome,
  onViewQuarantine,
  onDeletePermanently,
  onScanAnother,
}: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const [deleted, setDeleted] = useState(false);

  // Verdict-driven presentation shared by the banner, metadata row, copy and
  // actions, so the whole screen stays consistent for every outcome.
  const outcome = verdict ?? 'malicious';
  const state = outcome === 'malicious'
    ? {
        tone: 'red' as const,
        title: 'Threat found',
        description: 'This file contains malicious content and should not be opened.',
        result: 'Threat found',
        body: 'The file contains known malicious content (e.g., suspicious scripts) that could harm your device or steal your data.',
        means: 'This file may be dangerous. It could try to install unwanted software, steal information, or damage your device.',
        tip: 'Quarantining keeps it isolated so it can’t harm your device.',
        steps: [
          "Keep the file quarantined unless you're sure it's safe.",
          'If you need the file, only restore it if you trust the source and understand the risk.',
          "If you're unsure, delete it permanently.",
        ],
      }
    : outcome === 'suspicious'
      ? {
          tone: 'amber' as const,
          title: 'Needs your review',
          description: 'We found suspicious signals but no confirmed threat.',
          result: 'Needs your review',
          body: 'The file showed risky signals (for example an unusual file type or a suspicious structure) but no signature match. Review it before opening.',
          means: 'This file is not confirmed malware, but something about it looked off. Treat it carefully until you know where it came from.',
          tip: 'It has been quarantined meanwhile, so it cannot run or be opened by accident.',
          steps: [
            'Check where the file came from before restoring it.',
            'If you trust the source, restore it from quarantine and rescan it later.',
            "If you're unsure, delete it permanently.",
          ],
        }
      : {
          tone: 'green' as const,
          title: 'No threats detected',
          description: 'This file checked out clean — it is safe to keep using.',
          result: 'No known threat',
          body: 'No signature matched and no risky file-type signals fired, so the file checked out clean.',
          means: 'This file passed the scan with no known threats. You can open, share, or keep it as usual.',
          tip: 'Even clean files can age badly — rescan anything you download a long time after saving it.',
          steps: [
            'No action needed — the file is safe to use.',
            'Keep real-time protection on so future downloads are checked too.',
            'Rescan a file whenever its source or contents change.',
          ],
        };

  const confirmDelete = () => Alert.alert(
    'Delete file permanently?',
    `This action cannot be undone. Delete ${fileName}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete permanently', style: 'destructive', onPress: () => {
        setDeleted(true);
        onDeletePermanently?.();
      }},
    ],
  );

  const navItems = [
    { label: 'Home', icon: 'home' as const },
    { label: 'History', icon: 'clock' as const },
    { label: 'Quarantine', icon: 'archive' as const },
    { label: 'Settings', icon: 'settings' as const },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />
      <View style={s.app}>
        {desktop && <View style={s.sidebar}>
          <View style={s.brand}>
            <MaterialCommunityIcons name="shield-check" size={39} color={C.blue} />
            <Text style={s.brandText}>Security <Text style={s.brandAccent}>Scanner</Text></Text>
          </View>
          <View style={s.navList}>
            {navItems.map(item => <Pressable key={item.label}
              onPress={() => item.label === 'Home' ? onBackHome?.() : item.label === 'Quarantine' ? onViewQuarantine?.() : undefined}
              style={s.navItem}>
              <Feather name={item.icon} size={21} color="#D4E0F0" />
              <Text style={s.navText}>{item.label}</Text>
              {item.label === 'Quarantine' && <View style={s.badge}><Text style={s.badgeText}>2</Text></View>}
            </Pressable>)}
          </View>
          <View style={s.privacy}>
            <MaterialCommunityIcons name="shield-check-outline" size={26} color="#75B8FF" />
            <View style={{ flex: 1 }}>
              <Text style={s.privacyTitle}>Files stay on your phone by default.</Text>
              <Text style={s.privacyCopy}>We don't upload your files without your permission.</Text>
            </View>
          </View>
        </View>}

        <View style={s.content}>
          <View style={s.topbar}>
            {!desktop && <Text style={s.mobileBrand}>🛡 Security <Text style={s.brandAccent}>Scanner</Text></Text>}
            <Feather name="user" size={20} color={C.navy} />
            <Text style={s.user}>User</Text>
            <Feather name="chevron-down" size={16} color="#8CA0BC" />
          </View>

          <ScrollView contentContainerStyle={[s.page, !desktop && s.pageMobile]}>
            <Pressable onPress={onBackHome} style={s.back}>
              <Feather name="arrow-left" size={20} color={C.blue} />
              <Text style={s.backText}>Back to Home</Text>
            </Pressable>
            <Text style={s.pageTitle}>Scan result</Text>
            <Text style={s.pageSubtitle}>Here’s what we found in your file.</Text>

            <View style={[s.columns, !desktop && s.columnsMobile]}>
              <View style={[s.mainColumn, !desktop && s.mainColumnMobile]}>
                <View style={s.resultCard}>
                  {deleted ? <View style={s.deletedState}>
                    <Feather name="check-circle" size={54} color={C.green} />
                    <Text style={s.sectionTitle}>File deleted</Text>
                    <Text style={s.bodyText}>{fileName} has been marked as deleted.</Text>
                    <Text style={s.smallNote}>Connect the delete callback to your actual file storage.</Text>
                  </View> : <>
                    <View style={[s.threatBanner, state.tone === 'amber' && s.bannerAmber, state.tone === 'green' && s.bannerGreen]}>
                      <View style={[s.alertCircle, state.tone === 'amber' && s.circleAmber, state.tone === 'green' && s.circleGreen]}>
                        {state.tone === 'green'
                          ? <Feather name="check" size={40} color={C.white} />
                          : <Text style={s.alertMark}>{state.tone === 'amber' ? '?' : '!'}</Text>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.threatTitle, state.tone === 'amber' && s.titleAmber, state.tone === 'green' && s.titleGreen]}>{state.title}</Text>
                        <Text style={s.threatDescription}>{state.description}</Text>
                      </View>
                    </View>

                    <View style={s.fileSummary}>
                      <View style={s.fileIconBox}><MaterialCommunityIcons name="file-pdf-box" size={48} color={C.red} /></View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.fileName}>{fileName}</Text>
                        <Text style={s.fileMeta}>{fileType}  •  {fileSize}</Text>
                      </View>
                    </View>

                    <View style={[s.metadata, !desktop && s.metadataMobile]}>
                      <View style={s.metaItem}>
                        <Text style={s.metaLabel}>Scan date</Text>
                        <Text style={s.metaValue}>{scanDate}  •  {scanTime}</Text>
                      </View>
                      <View style={s.metaItem}>
                        <Text style={s.metaLabel}>Scan type</Text>
                        <Text style={s.metaValue}>File scan</Text>
                      </View>
                      <View style={s.metaItem}>
                        <Text style={s.metaLabel}>Result</Text>
                        <View style={s.resultValue}>
                          <Feather name={state.tone === 'green' ? 'check-circle' : 'alert-circle'} size={18} color={state.tone === 'red' ? C.red : state.tone === 'amber' ? C.amber : C.green} />
                          <Text style={[s.resultValueText, state.tone === 'amber' && { color: C.amber }, state.tone === 'green' && { color: C.green }]}>{state.result}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={s.whatHappened}>
                      <Text style={s.sectionTitle}>What happened?</Text>
                      <Text style={s.bodyText}>{state.body}</Text>
                      {!!threatName && outcome === 'malicious' && (
                        <Text style={s.threatNameText}>Detected threat: {threatName}</Text>
                      )}
                      {!!reasons && reasons.length > 0 && (
                        <View style={{ marginTop: 10, gap: 6 }}>
                          {reasons.map((reason, index) => (
                            <View key={`${index}-${reason.slice(0, 24)}`} style={s.reasonRow}>
                              <Text style={s.reasonBullet}>{'•'}</Text>
                              <Text style={s.reasonText}>{reason}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {outcome !== 'clean' && <View style={s.quarantinedBanner}>
                      <MaterialCommunityIcons name="shield-minus" size={40} color={C.green} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.quarantinedTitle}>This file has been quarantined.</Text>
                        <Text style={s.quarantinedText}>It's isolated and won’t run or be accessible from your device.</Text>
                      </View>
                    </View>}

                    {outcome === 'clean' ? <View style={[s.actions, !desktop && s.actionsMobile]}>
                      <Pressable style={s.primaryButton} onPress={onScanAnother}>
                        <Feather name="refresh-cw" size={19} color={C.white} />
                        <Text style={s.primaryButtonText}>Scan another file</Text>
                      </Pressable>
                      <Pressable style={s.outlineButton} onPress={onBackHome}>
                        <Feather name="home" size={19} color={C.blue} />
                        <Text style={s.outlineButtonText}>Back to Home</Text>
                      </Pressable>
                    </View> : <View style={[s.actions, !desktop && s.actionsMobile]}>
                      <Pressable style={s.primaryButton} onPress={onViewQuarantine}>
                        <MaterialCommunityIcons name="shield-check" size={21} color={C.white} />
                        <Text style={s.primaryButtonText}>View quarantine</Text>
                      </Pressable>
                      <Pressable style={s.outlineButton} onPress={confirmDelete}>
                        <Feather name="trash-2" size={19} color={C.blue} />
                        <Text style={s.outlineButtonText}>Delete permanently</Text>
                      </Pressable>
                      <Pressable style={s.textButton} onPress={onScanAnother}><Text style={s.textButtonText}>Scan another file</Text></Pressable>
                    </View>}
                  </>}
                </View>
              </View>

              <View style={[s.sideColumn, !desktop && s.sideColumnMobile]}>
                <View style={s.sideCard}>
                  <View style={s.sideHeading}>
                    <View style={s.infoBadge}><Feather name="info" size={19} color={C.white} /></View>
                    <Text style={s.sideTitle}>What this means</Text>
                  </View>
                  <Text style={s.sideBody}>{state.means}</Text>
                  <View style={s.tipBox}>
                    <MaterialCommunityIcons name="shield-check" size={30} color={C.blue} />
                    <Text style={s.tipText}>{state.tip}</Text>
                  </View>
                </View>

                <View style={s.sideCard}>
                  <View style={s.sideHeading}>
                    <View style={s.nextBadge}><MaterialCommunityIcons name="shield-check" size={22} color={C.navy} /></View>
                    <Text style={s.sideTitle}>Next steps</Text>
                  </View>
                  {state.steps.map((item, index) => <View key={item} style={s.stepRow}>
                    <View style={s.stepNumber}><Text style={s.stepNumberText}>{index + 1}</Text></View>
                    <Text style={s.stepText}>{item}</Text>
                  </View>)}
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  app: { flex: 1, flexDirection: 'row', backgroundColor: C.bg },
  sidebar: { width: 280, backgroundColor: C.navy, paddingHorizontal: 16, paddingTop: 15, paddingBottom: 22 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: '#263D58' },
  brandText: { color: C.white, fontSize: 21, fontWeight: '800' },
  brandAccent: { color: '#8EC5FF' },
  navList: { marginTop: 10, gap: 7 },
  navItem: { minHeight: 45, borderRadius: 10, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 14 },
  navText: { color: '#F0F5FC', fontSize: 15, flex: 1 },
  badge: { minWidth: 23, height: 23, borderRadius: 12, backgroundColor: '#FF5559', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: C.white, fontSize: 12, fontWeight: '700' },
  privacy: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#314660', paddingTop: 18, flexDirection: 'row', gap: 12 },
  privacyTitle: { color: C.white, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  privacyCopy: { color: '#CBD7E8', fontSize: 11, lineHeight: 17, marginTop: 5 },
  content: { flex: 1, minWidth: 0 },
  topbar: { height: 62, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#E8EEF6', paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  mobileBrand: { color: C.text, fontSize: 14, fontWeight: '800', marginRight: 'auto' },
  user: { color: C.text, fontSize: 14 },
  page: { paddingHorizontal: 38, paddingTop: 26, paddingBottom: 40, flexGrow: 1 },
  pageMobile: { paddingHorizontal: 16, paddingTop: 20 },
  back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  backText: { color: C.blue, fontSize: 13 },
  pageTitle: { color: C.text, fontSize: 32, lineHeight: 39, fontWeight: '800', marginTop: 25 },
  pageSubtitle: { color: C.muted, fontSize: 17, marginTop: 6, marginBottom: 24 },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  columnsMobile: { flexDirection: 'column' },
  mainColumn: { flex: 1, minWidth: 0 },
  mainColumnMobile: { width: '100%' },
  resultCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 26 },
  threatBanner: { flexDirection: 'row', alignItems: 'center', gap: 23, padding: 18, borderRadius: 10, borderWidth: 1, borderColor: '#FFDCDD', backgroundColor: C.paleRed },
  bannerAmber: { borderColor: '#F0DDB0', backgroundColor: C.paleAmber },
  bannerGreen: { borderColor: '#CBEEDD', backgroundColor: C.paleGreen },
  alertCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF454A', alignItems: 'center', justifyContent: 'center' },
  circleAmber: { backgroundColor: '#E0A33C' },
  circleGreen: { backgroundColor: C.green },
  alertMark: { color: C.white, fontSize: 43, lineHeight: 48, fontWeight: '800' },
  threatTitle: { color: '#D92F2F', fontSize: 28, lineHeight: 34, fontWeight: '800' },
  titleAmber: { color: '#8F6210' },
  titleGreen: { color: '#157A50' },
  threatDescription: { color: C.muted, fontSize: 15, lineHeight: 23, marginTop: 4 },
  fileSummary: { flexDirection: 'row', alignItems: 'center', gap: 17, marginTop: 20, marginBottom: 16 },
  fileIconBox: { width: 79, height: 81, borderRadius: 16, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  fileName: { color: C.text, fontSize: 19, fontWeight: '700' },
  fileMeta: { color: C.muted, fontSize: 14, marginTop: 7 },
  metadata: { flexDirection: 'row', borderWidth: 1, borderColor: C.border, borderRadius: 9, paddingVertical: 17, paddingHorizontal: 15, backgroundColor: '#FBFDFF', gap: 12 },
  metadataMobile: { flexDirection: 'column', gap: 12 },
  metaItem: { flex: 1, minWidth: 0, gap: 9 },
  metaLabel: { color: C.muted, fontSize: 13, fontWeight: '500' },
  metaValue: { color: C.text, fontSize: 13 },
  resultValue: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  resultValueText: { color: '#E33232', fontSize: 13 },
  whatHappened: { marginTop: 27, paddingHorizontal: 2 },
  threatNameText: { color: C.red, fontSize: 13, fontWeight: '700', marginTop: 10 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reasonBullet: { color: C.muted, fontSize: 13, lineHeight: 21 },
  reasonText: { color: C.muted, fontSize: 13, lineHeight: 21, flex: 1 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: '800' },
  bodyText: { color: C.muted, fontSize: 14, lineHeight: 23, marginTop: 8 },
  quarantinedBanner: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 23, padding: 16, borderRadius: 9, borderWidth: 1, borderColor: '#D8F3E8', backgroundColor: C.paleGreen },
  quarantinedTitle: { color: C.text, fontSize: 12, fontWeight: '800' },
  quarantinedText: { color: C.muted, fontSize: 12, lineHeight: 19, marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 34 },
  actionsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  primaryButton: { minHeight: 48, borderRadius: 8, backgroundColor: C.blue, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  primaryButtonText: { color: C.white, fontSize: 13, fontWeight: '700' },
  outlineButton: { minHeight: 48, borderRadius: 8, borderWidth: 1.5, borderColor: '#8AB9FF', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  outlineButtonText: { color: C.blue, fontSize: 13, fontWeight: '600' },
  textButton: { minHeight: 44, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  textButtonText: { color: C.blue, fontSize: 13, fontWeight: '500' },
  sideColumn: { width: 370, gap: 20 },
  sideColumnMobile: { width: '100%', marginTop: 16 },
  sideCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 20 },
  sideHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 13 },
  infoBadge: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#69A9FF', alignItems: 'center', justifyContent: 'center' },
  sideTitle: { color: C.text, fontSize: 16, fontWeight: '800', flex: 1 },
  sideBody: { color: C.muted, fontSize: 14, lineHeight: 25 },
  tipBox: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, padding: 13, borderWidth: 1, borderColor: '#DCEBFF', backgroundColor: '#F1F7FF', borderRadius: 8 },
  tipText: { color: '#49658F', fontSize: 12, lineHeight: 20, flex: 1 },
  nextBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E5EDF8', alignItems: 'center', justifyContent: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, marginTop: 13 },
  stepNumber: { width: 29, height: 29, borderRadius: 15, backgroundColor: '#E7F1FF', alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: C.text, fontSize: 14, fontWeight: '700' },
  stepText: { flex: 1, color: C.muted, fontSize: 13, lineHeight: 22, paddingTop: 1 },
  deletedState: { minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: 10 },
  smallNote: { color: C.muted, fontSize: 12, lineHeight: 19, textAlign: 'center', marginTop: 6 },
});