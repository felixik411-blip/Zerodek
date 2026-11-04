import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const C = {
  navy: '#192D47', blue: '#0878F9', pale: '#E8F2FF',
  bg: '#F7FAFE', text: '#172B49', muted: '#60779A',
  border: '#E0EAF6', white: '#FFFFFF', red: '#FF5559',
};

type Props = {
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  onCancel?: () => void;
  onBackHome?: () => void;
  onScanComplete?: () => void;
};

export default function SecurityScannerScanProgressScreen({
  fileName = 'Project_Proposal.pdf',
  fileType = 'PDF document',
  fileSize = '2.4 MB',
  onCancel,
  onBackHome,
  onScanComplete,
}: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const [progress, setProgress] = useState(48);
  const [cancelled, setCancelled] = useState(false);

  // Demo animation only; replace with real scanner progress.
  useEffect(() => {
    if (cancelled || progress >= 100) return;
    const timer = setInterval(() => {
      setProgress(value => {
        const next = Math.min(value + 2, 100);
        if (next === 100) onScanComplete?.();
        return next;
      });
    }, 350);
    return () => clearInterval(timer);
  }, [cancelled, progress >= 100, onScanComplete]);

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
        {desktop && (
          <View style={s.sidebar}>
            <View style={s.brand}>
              <MaterialCommunityIcons name="shield-check" size={39} color={C.blue} />
              <Text style={s.brandText}>Security <Text style={s.brandAccent}>Scanner</Text></Text>
            </View>
            {navItems.map(item => (
              <Pressable key={item.label} onPress={() => item.label === 'Home' && onBackHome?.()} style={s.navItem}>
                <Feather name={item.icon} size={21} color="#D4E0F0" />
                <Text style={s.navText}>{item.label}</Text>
                {item.label === 'Quarantine' && <View style={s.badge}><Text style={s.badgeText}>2</Text></View>}
              </Pressable>
            ))}
            <View style={s.privacy}>
              <MaterialCommunityIcons name="shield-check-outline" size={26} color="#75B8FF" />
              <View style={{ flex: 1 }}>
                <Text style={s.privacyTitle}>Files stay on your phone by default.</Text>
                <Text style={s.privacyCopy}>We don't upload your files without your permission.</Text>
              </View>
            </View>
          </View>
        )}

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

            <View style={s.fileHeader}>
              <View style={s.pdfBox}>
                <MaterialCommunityIcons name="file-pdf-box" size={44} color="#F0444A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fileName}>{fileName}</Text>
                <Text style={s.fileDetails}>{fileType}  •  {fileSize}</Text>
              </View>
            </View>

            <View style={s.card}>
              <View style={s.progressCircle}>
                <View style={s.circleInner}>
                  <MaterialCommunityIcons name="shield-search" size={65} color={C.blue} />
                </View>
              </View>
              <Text style={s.title}>
                {cancelled ? 'Scan cancelled' : progress >= 100 ? 'Scan complete' : 'Checking this file...'}
              </Text>
              <Text style={s.description}>
                {cancelled
                  ? 'The scan was cancelled.'
                  : progress >= 100
                    ? 'The file scan has finished.'
                    : "We’re looking for signs of malware, suspicious content\nand other potential threats."}
              </Text>
              <View style={s.track}>
                <View style={[s.fill, { width: `${progress}%` }]} />
              </View>
              <Pressable
                onPress={() => { setCancelled(true); onCancel?.(); }}
                disabled={cancelled || progress >= 100}
                style={[s.cancelButton, (cancelled || progress >= 100) && { opacity: 0.6 }]}
              >
                <Text style={s.cancelText}>{cancelled ? 'Cancelled' : progress >= 100 ? 'Finished' : 'Cancel'}</Text>
              </Pressable>
            </View>

            <View style={s.info}>
              <View style={s.infoIcon}><Feather name="info" size={21} color={C.white} /></View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={s.infoTitle}>This scan only checks the file you selected.</Text>
                <Text style={s.infoText}>Your other files and apps are not scanned.</Text>
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
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, paddingBottom: 22, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#263D58' },
  brandText: { color: C.white, fontSize: 21, fontWeight: '800' },
  brandAccent: { color: '#8EC5FF' },
  navItem: { minHeight: 45, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  navText: { color: '#F0F5FC', fontSize: 15, flex: 1 },
  badge: { minWidth: 23, height: 23, borderRadius: 12, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: C.white, fontSize: 12, fontWeight: '700' },
  privacy: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#314660', paddingTop: 18, flexDirection: 'row', gap: 12 },
  privacyTitle: { color: C.white, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  privacyCopy: { color: '#CBD7E8', fontSize: 11, lineHeight: 17, marginTop: 5 },
  content: { flex: 1, minWidth: 0 },
  topbar: { height: 62, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#E8EEF6', paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  mobileBrand: { color: C.text, fontSize: 14, fontWeight: '800', marginRight: 'auto' },
  user: { color: C.text, fontSize: 14 },
  page: { paddingHorizontal: 44, paddingTop: 26, paddingBottom: 40, flexGrow: 1 },
  pageMobile: { paddingHorizontal: 16, paddingTop: 20 },
  back: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  backText: { color: C.blue, fontSize: 13, fontWeight: '500' },
  fileHeader: { flexDirection: 'row', alignItems: 'center', gap: 24, marginTop: 26, marginBottom: 32, paddingHorizontal: 16 },
  pdfBox: { width: 70, height: 74, borderRadius: 15, backgroundColor: C.pale, alignItems: 'center', justifyContent: 'center' },
  fileName: { color: C.text, fontSize: 25, lineHeight: 31, fontWeight: '800' },
  fileDetails: { color: C.muted, fontSize: 18, marginTop: 3 },
  card: { minHeight: 504, backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 11, alignItems: 'center', paddingHorizontal: 28, paddingTop: 46, paddingBottom: 42 },
  progressCircle: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: '#DDEBFF', borderTopColor: '#4C9AFF', borderRightColor: '#4C9AFF', alignItems: 'center', justifyContent: 'center', marginBottom: 29 },
  circleInner: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#F0F6FF', alignItems: 'center', justifyContent: 'center' },
  title: { color: C.text, fontSize: 29, lineHeight: 36, fontWeight: '800', textAlign: 'center' },
  description: { color: C.muted, fontSize: 18, lineHeight: 28, textAlign: 'center', marginTop: 10 },
  track: { width: '64%', maxWidth: 680, minWidth: 230, height: 9, borderRadius: 6, backgroundColor: '#E0E9F7', overflow: 'hidden', marginTop: 37 },
  fill: { height: '100%', backgroundColor: C.blue, borderRadius: 6 },
  cancelButton: { marginTop: 59, width: 192, minHeight: 46, borderRadius: 9, borderWidth: 1.5, borderColor: '#80B5FF', alignItems: 'center', justifyContent: 'center', backgroundColor: C.white },
  cancelText: { color: C.blue, fontSize: 15, fontWeight: '600' },
  info: { flexDirection: 'row', alignItems: 'center', gap: 26, marginTop: 26, paddingVertical: 20, paddingHorizontal: 26, borderWidth: 1, borderColor: '#D9E9FF', borderRadius: 10, backgroundColor: '#EFF6FF' },
  infoIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#6595D8', alignItems: 'center', justifyContent: 'center' },
  infoTitle: { color: '#58749C', fontSize: 14, fontWeight: '700' },
  infoText: { color: '#58749C', fontSize: 14 },
});