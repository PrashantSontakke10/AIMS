import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../constants/theme';

export default function PendingScreen() {
  const { user, logout } = useAuth();

  const isBlocked = user?.status === 'blocked';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>A</Text>
        </View>
        <Text style={styles.appTitle}>AimClasses</Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.statusIconBadge, { backgroundColor: isBlocked ? Colors.blocked : Colors.pending }]}>
          <Text style={styles.statusIconText}>!</Text>
        </View>

        <Text style={styles.cardTitle}>
          {isBlocked ? 'Account Blocked' : 'Approval Pending'}
        </Text>
        
        <Text style={styles.mobileText}>Mobile: {user?.mobile}</Text>

        <Text style={styles.cardDescription}>
          {isBlocked
            ? 'Your account has been blocked by the administrator. You can no longer access dashboard materials. Please reach out to customer support.'
            : 'Your student registration has been received successfully! Before you can view lessons and course materials, an administrator must approve your account and assign your courses.'}
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.statusBoxLabel}>Status:</Text>
          <View style={[styles.badge, { backgroundColor: isBlocked ? `${Colors.blocked}15` : `${Colors.pending}15` }]}>
            <Text style={[styles.badgeText, { color: isBlocked ? Colors.blocked : Colors.pending }]}>
              {user?.status ? user.status.toUpperCase() : 'PENDING'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutButtonText}>Return to Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AimClasses Learning Platform</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: Colors.offWhite,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navyPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: 'center',
    ...Colors.cardShadow,
  },
  statusIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  statusIconText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.one,
  },
  mobileText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  statusBoxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginRight: Spacing.two,
  },
  badge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: Colors.navyPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
