import React, { useMemo, useState } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity,
  View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Archive, ArrowLeft, ChevronDown, ChevronRight, FileText, HelpCircle,
  History, House, Info, LifeBuoy, Link2, Lock, Mail, Search, Settings,
  ShieldCheck,
} from 'lucide-react-native';

/*
 * Help & About screen (screen 12).
 *
 * Authored from the implementation brief in upload/12.md: the brief defines
 * requirements and copy (no code hand-off), so this file follows the app's
 * shared design system — same palette, sidebar, header and card styles as
 * the dashboard and settings screens — and reuses lucide-react-native
 * (already a project dependency). No backend behaviour is claimed anywhere:
 * search filters only the five local topics, and the support email is
 * selectable styled text.
 */

const C = {
  primary: '#0877ff',
  navy: '#14263b',
  navyBorder: '#263b54',
  noteBorder: '#2b4058',
  text: '#142a47',
  body: '#33507e',
  muted: '#5b77a7',
  faint: '#7896c8',
  label: '#526f9f',
  border: '#dcecff',
  borderSoft: '#e7f0fb',
  bg: '#f5f9fe',
  card: '#ffffff',
  tileBg: '#e3f0ff',
  activeNav: '#174b87',
  badge: '#ff4d55',
  white: '#ffffff',
  brandAccent: '#68c1ff',
  sidebarText: '#f3f7ff',
  sidebarBody: '#c5d3e7',
  sidebarIcon: '#dceaff',
};

export type HelpNavDestination = 'home' | 'history' | 'quarantine' | 'settings';

/** One block of a topic's answer. */
type HelpAnswerBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; label: string; text: string };

type HelpTopic = {
  id: string;
  title: string;
  description: string;
  /** lucide icon key — resolved through TOPIC_ICONS. */
  icon: 'shield-check' | 'file-text' | 'archive' | 'link' | 'lock';
  iconColor: string;
  tileColor: string;
  answer: HelpAnswerBlock[];
};

const TOPIC_ICONS = {
  'shield-check': ShieldCheck,
  'file-text': FileText,
  archive: Archive,
  link: Link2,
  lock: Lock,
} as const;

const TOPICS: HelpTopic[] = [
  {
    id: 'file-scanning',
    title: 'How file scanning works',
    description:
      'We check files for known signs of malware using trusted threat information.',
    icon: 'shield-check',
    iconColor: C.primary,
    tileColor: C.tileBg,
    answer: [
      {
        type: 'paragraph',
        text: 'When you scan a file, the app looks for known indicators of malware — patterns that are already documented in trusted threat information sources.',
      },
      {
        type: 'paragraph',
        text: 'A scan is a check against what is already known. It is a helpful signal, but no scanner can guarantee that a file is completely safe. If a file comes from a source you do not trust, treat it with care even after a clean result.',
      },
    ],
  },
  {
    id: 'scan-results',
    title: 'What scan results mean',
    description:
      'Learn what the different results (threat found, needs review, no known threat, or could not decide) mean and what to do next.',
    icon: 'file-text',
    iconColor: '#1e9e5a',
    tileColor: '#e6f6ee',
    answer: [
      {
        type: 'paragraph',
        text: 'Each scan ends in one of four results. Here is what each one means and what to do next:',
      },
      {
        type: 'bullet',
        label: 'Threat found',
        text: 'Known malicious indicators were detected. Do not open or share the file or link, and let quarantine handle it.',
      },
      {
        type: 'bullet',
        label: 'Needs your review',
        text: 'Suspicious indicators were detected, but the scan could not confirm anything. Treat the item cautiously and avoid opening it unless you trust the source.',
      },
      {
        type: 'bullet',
        label: 'No known threat',
        text: 'No known indicators were found. This is not a guarantee of safety — new threats can take time to be documented.',
      },
      {
        type: 'bullet',
        label: 'Could not decide',
        text: 'The scan could not reach a reliable conclusion, for example because the file is packed or partially unreadable. Handle it as if it needs review.',
      },
    ],
  },
  {
    id: 'quarantine',
    title: 'What quarantine does',
    description:
      'Quarantine isolates risky files so they can’t harm your device. You can restore or delete them later.',
    icon: 'archive',
    iconColor: '#e8850c',
    tileColor: '#fef3e6',
    answer: [
      {
        type: 'paragraph',
        text: 'Quarantine isolates files that were flagged as risky so they cannot run or harm your device. The file stays on your phone, but in a locked storage area.',
      },
      {
        type: 'paragraph',
        text: 'You can restore a file once you have verified it is safe, or delete it. Keep a risky file quarantined unless you are sure. Deleting a quarantined file is permanent — it cannot be recovered.',
      },
    ],
  },
  {
    id: 'link-checking',
    title: 'How link checking works',
    description:
      'We check links for known dangerous patterns and domains. This helps you avoid risky websites and phishing attempts.',
    icon: 'link',
    iconColor: '#7c5ce0',
    tileColor: '#f1edfd',
    answer: [
      {
        type: 'paragraph',
        text: 'A link check compares the address you entered with known dangerous patterns and domains — for example pages tied to phishing or malware distribution.',
      },
      {
        type: 'paragraph',
        text: 'It helps you avoid risky websites, but it cannot guarantee that a site is safe. Stay cautious with links from messages or emails you did not expect.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Your privacy',
    description:
      'We keep your files on your device by default and don’t upload them without your permission.',
    icon: 'lock',
    iconColor: '#14a8a0',
    tileColor: '#e4f6f4',
    answer: [
      {
        type: 'paragraph',
        text: 'Your files stay on your device by default. Scanning and quarantine run locally, and we do not upload your files or personal data without your permission.',
      },
      {
        type: 'paragraph',
        text: 'You stay in control: nothing leaves your phone unless you explicitly choose to share it.',
      },
    ],
  },
];

/** Case-insensitive search haystack for one topic (title, description, answer). */
function topicHaystack(topic: HelpTopic): string {
  return [
    topic.title,
    topic.description,
    ...topic.answer.map((block) =>
      block.type === 'bullet' ? `${block.label} ${block.text}` : block.text,
    ),
  ]
    .join(' ')
    .toLowerCase();
}

type NavItemProps = {
  label: string;
  active?: boolean;
  badge?: string;
  icon: React.ReactNode;
  onPress?: () => void;
};

function NavItem({ label, active, badge, icon, onPress }: NavItemProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.navItem, active && styles.navItemActive]}
    >
      {icon}
      <Text style={styles.navLabel}>{label}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

type Props = {
  /** Called when a sidebar item is pressed. The active "Help & About" item
   * does not navigate. Without the prop (bare Expo usage) items are
   * pressable no-ops, exactly like the other screens' optional callbacks. */
  onNavigate?: (destination: HelpNavDestination) => void;
};

export default function HelpAboutScreen({ onNavigate }: Props) {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [query, setQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const visibleTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOPICS;
    return TOPICS.filter((topic) => topicHaystack(topic).includes(q));
  }, [query]);

  const selectedTopic = selectedTopicId
    ? TOPICS.find((topic) => topic.id === selectedTopicId) ?? null
    : null;

  const handleNav = (destination: HelpNavDestination) => {
    onNavigate?.(destination);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={[styles.app, !isWide && styles.appNarrow]}>
        {/* Desktop sidebar; narrow screens get a compact top bar instead. */}
        {isWide ? (
          <View style={styles.sidebar}>
            <View style={styles.brand}>
              <View style={styles.brandMark}>
                <ShieldCheck size={28} color={C.white} strokeWidth={2.8} />
              </View>
              <Text style={styles.brandText}>
                Security <Text style={styles.brandAccent}>Scanner</Text>
              </Text>
            </View>

            <View style={styles.nav}>
              <NavItem
                label="Home"
                icon={<House size={21} color={C.sidebarIcon} />}
                onPress={() => handleNav('home')}
              />
              <NavItem
                label="History"
                icon={<History size={22} color={C.sidebarIcon} />}
                onPress={() => handleNav('history')}
              />
              <NavItem
                label="Quarantine"
                badge="2"
                icon={<Archive size={21} color={C.sidebarIcon} />}
                onPress={() => handleNav('quarantine')}
              />
              <NavItem
                label="Settings"
                icon={<Settings size={21} color={C.sidebarIcon} />}
                onPress={() => handleNav('settings')}
              />
              <NavItem
                label="Help & About"
                active
                icon={<LifeBuoy size={21} color={C.white} strokeWidth={2.4} />}
              />
            </View>

            <View style={styles.sidebarNote}>
              <ShieldCheck size={25} color="#65b9ff" />
              <View style={styles.sidebarNoteText}>
                <Text style={styles.sidebarNoteTitle}>
                  Files stay on your phone{"\n"}by default.
                </Text>
                <Text style={styles.sidebarNoteBody}>
                  We don't upload your files without your permission.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.mobileTopbar}>
            <View style={styles.mobileBrandMark}>
              <ShieldCheck size={22} color={C.white} strokeWidth={2.8} />
            </View>
            <Text style={styles.mobileBrand}>
              Security <Text style={styles.brandAccent}>Scanner</Text>
            </Text>
            <Text style={styles.mobileUser}>● User</Text>
          </View>
        )}

        <View style={styles.main}>
          {isWide ? (
            <View style={styles.topbar}>
              <View />
              <View style={styles.userMenu}>
                <Text style={styles.userMenuText}>●  User</Text>
                <ChevronDown size={16} color={C.text} />
              </View>
            </View>
          ) : null}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.content,
              !isWide && styles.contentMobile,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pageHeader}>
              <View style={styles.pageIcon}>
                <HelpCircle size={35} color={C.primary} strokeWidth={2.4} />
              </View>
              <View style={styles.pageHeaderText}>
                <Text style={styles.pageTitle}>Help & About</Text>
                <Text style={styles.pageSubtitle}>
                  Find answers to common questions and learn more about
                  Security Scanner.
                </Text>
              </View>
            </View>

            {selectedTopic ? (
              /* In-screen detail panel: title + answer with a clear back
                 control, replacing the search and topic list. */
              <View style={styles.detailCard}>
                <TouchableOpacity
                  accessibilityRole="button"
                  style={styles.backButton}
                  onPress={() => setSelectedTopicId(null)}
                >
                  <ArrowLeft size={18} color={C.primary} />
                  <Text style={styles.backButtonText}>Back to topics</Text>
                </TouchableOpacity>

                <View style={styles.detailHeader}>
                  <View
                    style={[
                      styles.topicTile,
                      { backgroundColor: selectedTopic.tileColor },
                    ]}
                  >
                    {React.createElement(TOPIC_ICONS[selectedTopic.icon], {
                      size: 24,
                      color: selectedTopic.iconColor,
                      strokeWidth: 2.4,
                    })}
                  </View>
                  <Text style={styles.detailTitle}>{selectedTopic.title}</Text>
                </View>

                <View style={styles.detailDivider} />

                {selectedTopic.answer.map((block, index) =>
                  block.type === 'paragraph' ? (
                    <Text key={index} style={styles.answerParagraph}>
                      {block.text}
                    </Text>
                  ) : (
                    <View key={index} style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.answerParagraph}>
                        <Text style={styles.bulletLabel}>{block.label}</Text>
                        {' — '}
                        {block.text}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            ) : (
              <>
                <View style={styles.searchCard}>
                  <Search size={18} color={C.muted} />
                  <TextInput
                    accessibilityLabel="Search help topics"
                    style={styles.searchInput}
                    value={query}
                    onChangeText={setQuery}
                    placeholder="Search help topics..."
                    placeholderTextColor="#8aa8cf"
                  />
                </View>

                <Text style={styles.sectionLabel}>Suggested topics</Text>

                {visibleTopics.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Search size={26} color="#9db8dc" />
                    <Text style={styles.emptyStateText}>
                      No help topics found.
                    </Text>
                    <Text style={styles.emptyStateHint}>
                      Try a different keyword.
                    </Text>
                  </View>
                ) : (
                  visibleTopics.map((topic) => (
                    <TouchableOpacity
                      key={topic.id}
                      accessibilityRole="button"
                      style={styles.topicCard}
                      onPress={() => setSelectedTopicId(topic.id)}
                    >
                      <View
                        style={[
                          styles.topicTile,
                          { backgroundColor: topic.tileColor },
                        ]}
                      >
                        {React.createElement(TOPIC_ICONS[topic.icon], {
                          size: 22,
                          color: topic.iconColor,
                          strokeWidth: 2.4,
                        })}
                      </View>
                      <View style={styles.topicText}>
                        <Text style={styles.topicTitle}>{topic.title}</Text>
                        <Text style={styles.topicDescription}>
                          {topic.description}
                        </Text>
                      </View>
                      <ChevronRight size={20} color={C.faint} />
                    </TouchableOpacity>
                  ))
                )}
              </>
            )}

            {/* Footer information card */}
            <View style={[styles.footerCard, !isWide && styles.footerCardNarrow]}>
              <View style={styles.footerColumn}>
                <View style={[styles.footerTile, { backgroundColor: C.tileBg }]}>
                  <Info size={20} color={C.primary} />
                </View>
                <View style={styles.footerText}>
                  <Text style={styles.footerLabel}>App version</Text>
                  <Text style={styles.footerValue}>1.0.0</Text>
                </View>
              </View>

              <View
                style={[
                  styles.footerDivider,
                  !isWide && styles.footerDividerNarrow,
                ]}
              />

              <View style={styles.footerColumn}>
                <View style={[styles.footerTile, { backgroundColor: C.tileBg }]}>
                  <Mail size={20} color={C.primary} />
                </View>
                <View style={styles.footerText}>
                  <Text style={styles.footerLabel}>Need more help?</Text>
                  <Text style={styles.footerBody}>
                    Contact support at{' '}
                    <Text selectable style={styles.footerEmail}>
                      support@securityscanner.app
                    </Text>
                  </Text>
                </View>
              </View>
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
    backgroundColor: C.bg,
  },
  app: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: C.bg,
  },
  appNarrow: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 280,
    backgroundColor: C.navy,
    paddingTop: 17,
    paddingHorizontal: 15,
  },
  brand: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.navyBorder,
    marginHorizontal: -15,
    paddingLeft: 25,
    paddingBottom: 15,
  },
  brandMark: {
    width: 38,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandText: {
    color: C.white,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: C.brandAccent,
  },
  nav: {
    paddingTop: 9,
    gap: 6,
  },
  navItem: {
    minHeight: 46,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    gap: 14,
  },
  navItemActive: {
    backgroundColor: C.activeNav,
  },
  navLabel: {
    color: C.sidebarText,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    minWidth: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: C.badge,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '700',
  },
  sidebarNote: {
    marginTop: 'auto',
    marginBottom: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: C.noteBorder,
    flexDirection: 'row',
    gap: 12,
  },
  sidebarNoteText: {
    flex: 1,
  },
  sidebarNoteTitle: {
    color: C.sidebarText,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 19,
  },
  sidebarNoteBody: {
    color: C.sidebarBody,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  mobileTopbar: {
    minHeight: 62,
    backgroundColor: C.navy,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  mobileBrandMark: {
    width: 34,
    height: 38,
    borderRadius: 11,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  mobileBrand: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    flex: 1,
  },
  mobileUser: {
    color: C.white,
    fontSize: 13,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  topbar: {
    height: 62,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderBottomColor: '#e3edf9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 29,
  },
  userMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  userMenuText: {
    color: C.text,
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 38,
    paddingTop: 20,
    paddingBottom: 34,
    gap: 14,
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 23,
    marginBottom: 5,
  },
  pageIcon: {
    width: 71,
    height: 71,
    borderRadius: 15,
    backgroundColor: C.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeaderText: {
    flex: 1,
  },
  pageTitle: {
    color: C.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    color: C.muted,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 2,
  },
  searchCard: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 42,
    fontSize: 14,
    color: C.text,
    paddingVertical: 0,
  },
  sectionLabel: {
    color: C.text,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  topicCard: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#91afd4',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  topicTile: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    flex: 1,
  },
  topicTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: '700',
  },
  topicDescription: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 3,
  },
  emptyState: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 30,
    alignItems: 'center',
    gap: 8,
  },
  emptyStateText: {
    color: C.label,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateHint: {
    color: '#8aa8cf',
    fontSize: 12,
  },
  detailCard: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 8,
  },
  backButtonText: {
    color: C.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailTitle: {
    color: C.text,
    fontSize: 19,
    fontWeight: '800',
    flex: 1,
  },
  detailDivider: {
    height: 1,
    backgroundColor: C.borderSoft,
  },
  answerParagraph: {
    color: C.body,
    fontSize: 14,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 4,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.primary,
    marginTop: 8,
  },
  bulletLabel: {
    color: C.text,
    fontWeight: '700',
  },
  footerCard: {
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 8,
  },
  footerCardNarrow: {
    flexDirection: 'column',
  },
  footerColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    flex: 1,
  },
  footerLabel: {
    color: C.label,
    fontSize: 12,
  },
  footerValue: {
    color: C.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  footerBody: {
    color: C.body,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  footerEmail: {
    color: C.primary,
    fontWeight: '600',
  },
  footerDivider: {
    width: 1,
    backgroundColor: C.borderSoft,
    marginHorizontal: 18,
  },
  footerDividerNarrow: {
    width: 'auto',
    height: 1,
    marginHorizontal: 0,
    marginVertical: 14,
  },
});
