import React, { useState } from 'react';
import {
  Alert, Pressable, ScrollView, StatusBar, StyleSheet, Text, View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

const C = {
  navy: '#192D47', text: '#172B49', blue: '#0878F9',
  paleBlue: '#EAF3FF', bg: '#F6FAFF', white: '#FFFFFF',
  muted: '#5D759B', border: '#DFEAF9', red: '#F83F43',
  paleRed: '#FFF6F6', green: '#1EB578',
};

type Verdict = 'clean' | 'suspicious' | 'malicious';

type Props = {
  url?: string;
  checkedAt?: string;
  /** Real engine verdict (POST /api/scan/link). Defaults to the hand-off's danger demo. */
  verdict?: Verdict;
  severity?: string;
  /** Human-readable signals returned by the engine; rendered in Scan details. */
  reasons?: string[];
  onBackHome?: () => void;
  onCheckAnotherLink?: () => void;
};

/** Verdict-dependent copy and palette for the banner, warning box and rows. */
const VERDICT_META: Record<Verdict, {
  bannerBg: string; bannerBorder: string; iconBg: string; titleColor: string;
  title: string; subtitle: string;
  warningTitle: string; warningText: string;
  resultLabel: string; openAlert: string;
}> = {
  malicious: {
    bannerBg: '#FFF6F6', bannerBorder: '#FFDCDD', iconBg: C.red, titleColor: '#D92E30',
    title: 'Likely dangerous',
    subtitle: 'This link shows signs of a known malicious site. Do not open it.',
    warningTitle: "We recommend you don't open this link.",
    warningText: 'It may lead to a fake website, try to steal your information, or install harmful software.',
    resultLabel: 'Likely dangerous',
    openAlert: 'This link was flagged as potentially dangerous. It has not been opened.',
  },
  suspicious: {
    bannerBg: '#FFF7EA', bannerBorder: '#FFE1B0', iconBg: '#F59E0B', titleColor: '#B45309',
    title: 'Suspicious',
    subtitle: 'We found warning signs on this link. Be careful before opening it.',
    warningTitle: 'Think twice before opening this link.',
    warningText: 'It hides its final destination or shows phishing-like patterns. Only continue if you trust it.',
    resultLabel: 'Suspicious',
    openAlert: 'This link was flagged as suspicious. It has not been opened.',
  },
  clean: {
    bannerBg: '#EDFAF3', bannerBorder: '#BFE8D2', iconBg: C.green, titleColor: '#0F8A5F',
    title: 'No dangers found',
    subtitle: "We didn't find any signs of a malicious or suspicious site.",
    warningTitle: 'Safe to open — as far as we can tell.',
    warningText: 'Nothing suspicious was detected. No check can guarantee a site is safe, so stay alert.',
    resultLabel: 'Looks safe',
    openAlert: 'No dangers were found for this link. It has not been opened.',
  },
};

export default function LinkScanResultScreen({
  url = 'https://malicious-site.fake',
  checkedAt = 'Oct 30, 2025  •  10:24 AM',
  verdict = 'malicious',
  severity,
  reasons,
  onBackHome,
  onCheckAnotherLink,
}: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [copied, setCopied] = useState(false);
  const meta = VERDICT_META[verdict];

  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url.replace(/^https?:\/\//i, '').split('/')[0] || url;
    }
  })();

  const copyUrl = async () => {
    await Clipboard.setStringAsync(url);
    setCopied(true);
    Alert.alert('Copied', 'The link has been copied to your clipboard.');
  };

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
            <View style={s.navList}>
              <Pressable style={s.navItem} onPress={onBackHome}>
                <Feather name="home" size={21} color="#E1EAF6" /><Text style={s.navText}>Home</Text>
              </Pressable>
              <Pressable style={s.navItem}>
                <Feather name="clock" size={21} color="#E1EAF6" /><Text style={s.navText}>History</Text>
              </Pressable>
              <Pressable style={s.navItem}>
                <Feather name="archive" size={21} color="#E1EAF6" /><Text style={s.navText}>Quarantine</Text>
                <View style={s.badge}><Text style={s.badgeText}>2</Text></View>
              </Pressable>
              <Pressable style={s.navItem}>
                <Feather name="settings" size={21} color="#E1EAF6" /><Text style={s.navText}>Settings</Text>
              </Pressable>
            </View>
            <View style={s.privacy}>
              <MaterialCommunityIcons name="shield-check-outline" size={26} color="#75B8FF" />
              <View style={{ flex: 1 }}>
                <Text style={s.privacyTitle}>Files stay on your phone by default.</Text>
                <Text style={s.privacyCopy}>We don't upload your files without your permission.</Text>
              </View>
            </View>
          </View>
        )}

        <View style={s.main}>
          <View style={s.topbar}>
            {!desktop && <Text style={s.mobileBrand}>Security <Text style={s.brandAccent}>Scanner</Text></Text>}
            <View style={s.userIcon}><Feather name="user" size={17} color={C.navy} /></View>
            <Text style={s.userText}>User</Text>
            <Feather name="chevron-down" size={16} color="#8CA0BC" />
          </View>

          <ScrollView contentContainerStyle={[s.page, !desktop && s.pageMobile]}>
            <Pressable style={s.backLink} onPress={onBackHome}>
              <Feather name="arrow-left" size={18} color={C.blue} />
              <Text style={s.backText}>Back to Home</Text>
            </Pressable>

            <View style={s.heading}>
              <View style={s.headingIcon}><Feather name="link" size={39} color={C.blue} /></View>
              <View style={s.headingText}>
                <Text style={s.pageTitle}>Link scan result</Text>
                <Text style={s.subtitle}>Here's what we found for the link you checked.</Text>
              </View>
            </View>

            <View style={s.resultCard}>
              <View style={[s.dangerBanner, { backgroundColor: meta.bannerBg, borderColor: meta.bannerBorder }]}>
                <View style={[s.dangerIcon, { backgroundColor: meta.iconBg }]}>
                  {verdict === 'clean' ? (
                    <Feather name="check-circle" size={38} color={C.white} />
                  ) : (
                    <Feather name="alert-circle" size={38} color={C.white} />
                  )}
                </View>
                <View style={s.dangerCopy}>
                  <Text style={[s.dangerTitle, { color: meta.titleColor }]}>{meta.title}</Text>
                  <Text style={s.dangerSubtitle}>{meta.subtitle}</Text>
                </View>
              </View>

              <View style={[s.topGrid, !desktop && s.topGridMobile]}>
                <View style={s.linkColumn}>
                  <Text style={s.fieldLabel}>Link checked</Text>
                  <View style={s.urlRow}>
                    <Text numberOfLines={1} style={s.urlText}>{url}</Text>
                    <Pressable
                      accessibilityLabel="Open link in browser"
                      style={s.externalButton}
                      onPress={() => Alert.alert('Caution', meta.openAlert)}
                    >
                      <Feather name="external-link" size={17} color={C.muted} />
                    </Pressable>
                    <Pressable style={s.copyButton} onPress={copyUrl}>
                      <Feather name="copy" size={18} color={C.blue} />
                      <Text style={s.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
                    </Pressable>
                  </View>
                  <View style={s.domainRow}>
                    <Feather name="link" size={15} color={C.muted} />
                    <Text style={s.domainText}>{hostname}</Text>
                  </View>
                  <View style={s.warningBox}>
                    <Feather
                      name={verdict === 'clean' ? 'shield' : 'alert-triangle'}
                      size={19}
                      color={verdict === 'clean' ? C.green : verdict === 'suspicious' ? '#F59E0B' : C.red}
                    />
                    <View style={s.warningCopy}>
                      <Text style={[s.warningTitle, { color: verdict === 'clean' ? '#0F8A5F' : verdict === 'suspicious' ? '#B45309' : '#E02F32' }]}>{meta.warningTitle}</Text>
                      <Text style={s.warningText}>{meta.warningText}</Text>
                    </View>
                  </View>
                </View>

                <View style={s.checkedCard}>
                  <View style={s.checkedHeading}>
                    <MaterialCommunityIcons name="shield-check" size={22} color={C.green} />
                    <Text style={s.checkedTitle}>What we checked</Text>
                  </View>
                  {['Known malicious domains', 'Phishing indicators', 'Suspicious patterns', 'Reputation data'].map((item) => (
                    <View key={item} style={s.checkedItem}>
                      <Feather name="check-circle" size={16} color={C.green} />
                      <Text style={s.checkedText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={s.detailsCard}>
                <Text style={s.detailsTitle}>Scan details</Text>
                <View style={[s.detailsGrid, !desktop && s.detailsGridMobile]}>
                  <View style={s.detailsLeft}>
                    <View style={s.detailRow}>
                      <Text style={s.detailLabel}>Link</Text>
                      <Text numberOfLines={2} style={s.detailValueLink}>{url}</Text>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailLabel}>Result</Text>
                      <View style={s.resultValue}>
                        <Feather
                          name={verdict === 'clean' ? 'check-circle' : 'alert-circle'}
                          size={17}
                          color={verdict === 'clean' ? C.green : verdict === 'suspicious' ? '#F59E0B' : C.red}
                        />
                        <Text style={[s.resultValueText, { color: verdict === 'clean' ? C.green : verdict === 'suspicious' ? '#B45309' : C.red }]}>
                          {meta.resultLabel}{severity && verdict !== 'clean' ? ` · ${severity}` : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={s.detailRow}>
                      <Text style={s.detailLabel}>Checked on</Text>
                      <Text style={s.detailValue}>{checkedAt}</Text>
                    </View>
                  </View>
                  <View style={s.detailsRight}>
                    <Text style={s.detailLabel}>Scan type</Text>
                    <Text style={s.detailValueDark}>URL check</Text>
                    <Text style={[s.detailLabel, { marginTop: 18 }]}>What was checked</Text>
                    <Text style={s.description}>The link's domain, reputation and known malicious indicators.</Text>
                    {reasons && reasons.length > 0 && (
                      <>
                        <Text style={[s.detailLabel, { marginTop: 18 }]}>What we found</Text>
                        <View style={{ marginTop: 6, gap: 7 }}>
                          {reasons.slice(0, 5).map((reason) => (
                            <View key={reason} style={{ flexDirection: 'row', gap: 8, maxWidth: 320 }}>
                              <Feather
                                name={verdict === 'clean' ? 'check-circle' : 'alert-circle'}
                                size={14}
                                color={verdict === 'clean' ? C.green : verdict === 'suspicious' ? '#F59E0B' : C.red}
                              />
                              <Text style={[s.description, { marginTop: 0, flex: 1 }]}>{reason}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>

              <View style={[s.actions, !desktop && s.actionsMobile]}>
                <Pressable style={s.primaryButton} onPress={onCheckAnotherLink}>
                  <Feather name="rotate-cw" size={17} color={C.white} />
                  <Text style={s.primaryButtonText}>Check another link</Text>
                </Pressable>
                <Pressable style={s.secondaryButton} onPress={onBackHome}>
                  <Feather name="home" size={17} color={C.blue} />
                  <Text style={s.secondaryButtonText}>Back to Home</Text>
                </Pressable>
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
  main: { flex: 1, minWidth: 0 },
  topbar: { height: 62, backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: '#E8EEF6', paddingHorizontal: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  mobileBrand: { color: C.text, fontSize: 14, fontWeight: '800', marginRight: 'auto' },
  userIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#EDF3FC', alignItems: 'center', justifyContent: 'center' },
  userText: { color: C.text, fontSize: 14 },
  page: { paddingHorizontal: 35, paddingTop: 24, paddingBottom: 40, flexGrow: 1 },
  pageMobile: { paddingHorizontal: 15, paddingTop: 18 },
  backLink: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 10 },
  backText: { color: C.blue, fontSize: 13, fontWeight: '500' },
  heading: { flexDirection: 'row', alignItems: 'center', gap: 23, marginTop: 27, marginBottom: 18 },
  headingIcon: { width: 70, height: 70, borderRadius: 16, backgroundColor: C.paleBlue, alignItems: 'center', justifyContent: 'center' },
  headingText: { flex: 1 },
  pageTitle: { color: C.text, fontSize: 30, lineHeight: 37, fontWeight: '800' },
  subtitle: { color: C.muted, fontSize: 16, lineHeight: 24, marginTop: 2 },
  resultCard: { backgroundColor: C.white, borderWidth: 1, borderColor: C.border, borderRadius: 9, padding: 23 },
  dangerBanner: { minHeight: 99, borderWidth: 1, borderColor: '#FFDCDD', borderRadius: 9, backgroundColor: C.paleRed, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 23, paddingVertical: 14, gap: 24 },
  dangerIcon: { width: 66, height: 66, borderRadius: 33, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' },
  dangerCopy: { flex: 1 },
  dangerTitle: { color: '#D92E30', fontSize: 26, fontWeight: '800', marginBottom: 5 },
  dangerSubtitle: { color: C.muted, fontSize: 14, lineHeight: 21 },
  topGrid: { flexDirection: 'row', alignItems: 'flex-start', gap: 21, marginTop: 17 },
  topGridMobile: { flexDirection: 'column' },
  linkColumn: { flex: 1, minWidth: 0 },
  fieldLabel: { color: C.muted, fontSize: 13, marginBottom: 7 },
  urlRow: { minHeight: 49, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F7FD', borderWidth: 1, borderColor: C.border, borderRadius: 8, paddingLeft: 15 },
  urlText: { flex: 1, minWidth: 0, color: C.text, fontSize: 14 },
  externalButton: { paddingHorizontal: 10, paddingVertical: 12 },
  copyButton: { minHeight: 49, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, paddingHorizontal: 15, borderWidth: 1, borderColor: C.border, borderRadius: 8, backgroundColor: C.white, marginLeft: 4 },
  copyText: { color: C.blue, fontSize: 13, fontWeight: '600' },
  domainRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 11, marginLeft: 11 },
  domainText: { color: C.muted, fontSize: 13 },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 26, padding: 17, borderWidth: 1, borderColor: '#FFDCDD', borderRadius: 9, backgroundColor: '#FFF8F8' },
  warningCopy: { flex: 1 },
  warningTitle: { color: '#E02F32', fontSize: 14, fontWeight: '700', marginBottom: 5 },
  warningText: { color: C.muted, fontSize: 12, lineHeight: 19 },
  checkedCard: { width: '34%', minWidth: 210, borderWidth: 1, borderColor: C.border, borderRadius: 9, backgroundColor: '#F8FBFF', padding: 20 },
  checkedHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  checkedTitle: { color: C.text, fontSize: 13, fontWeight: '700' },
  checkedItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  checkedText: { color: C.muted, fontSize: 13, flexShrink: 1 },
  detailsCard: { borderWidth: 1, borderColor: C.border, borderRadius: 9, padding: 10, marginTop: 30, backgroundColor: C.white },
  detailsTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 9 },
  detailsGrid: { flexDirection: 'row' },
  detailsGridMobile: { flexDirection: 'column' },
  detailsLeft: { flex: 1, paddingHorizontal: 11, paddingVertical: 8, gap: 17 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailLabel: { color: C.muted, fontSize: 13, width: 128 },
  detailValueLink: { color: C.blue, fontSize: 13, flex: 1 },
  detailValue: { color: C.muted, fontSize: 13, flex: 1 },
  resultValue: { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  resultValueText: { color: C.red, fontSize: 13 },
  detailsRight: { flex: 1, paddingHorizontal: 43, paddingVertical: 10, borderLeftWidth: 1, borderLeftColor: C.border },
  detailValueDark: { color: C.text, fontSize: 13, marginTop: 6 },
  description: { color: C.muted, fontSize: 13, lineHeight: 22, marginTop: 5, maxWidth: 300 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 28 },
  actionsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  primaryButton: { minHeight: 46, minWidth: 278, borderRadius: 8, backgroundColor: C.blue, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 18 },
  primaryButtonText: { color: C.white, fontSize: 13, fontWeight: '600' },
  secondaryButton: { minHeight: 46, minWidth: 264, borderRadius: 8, borderWidth: 1.5, borderColor: '#8AB7FF', backgroundColor: C.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 18 },
  secondaryButtonText: { color: C.blue, fontSize: 13, fontWeight: '600' },
});