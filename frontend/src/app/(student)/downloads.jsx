import React from 'react';
import { StyleSheet, View, Text, StatusBar, ScrollView } from 'react-native';
import { Download, Inbox } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';

export default function DownloadsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navyPrimary} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <Download color={Colors.textLight} size={24} />
          </View>
          <View>
            <Text style={styles.headerTitle}>My Downloads</Text>
            <Text style={styles.headerSubtitle}>Offline study notes and materials</Text>
          </View>
        </View>
      </View>

      {/* Empty State */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.emptyCard}>
          <Inbox color={Colors.textSecondary} size={50} />
          <Text style={styles.emptyTitle}>No downloads yet</Text>
          <Text style={styles.emptySubtitle}>
            Notes and handouts you choose to save offline will appear here for access without an active internet connection.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.navySecondary,
    backgroundColor: Colors.navyPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginRight: Spacing.three,
  },
  headerTitle: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 20,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.five,
  },
  emptyCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.five,
    borderRadius: Spacing.three,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    ...Colors.cardShadow,
  },
  emptyTitle: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: Spacing.three,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: Spacing.two,
    textAlign: 'center',
    lineHeight: 20,
  },
});
