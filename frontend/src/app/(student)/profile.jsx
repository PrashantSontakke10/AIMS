import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, ScrollView, Alert, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Phone, Shield, BookOpen, UserCheck } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of AIM Institute?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navyPrimary} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <User color={Colors.textLight} size={24} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your student account</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Image
              source={require("../../../assets/images/logo.jpg")}
              style={styles.profileAvatarLogo}
              resizeMode="contain"
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileHeading}>Student Profile</Text>
              <Text style={styles.profileSubheading}>AIM Institute Learning Platform</Text>
            </View>
          </View>

          {/* User Details */}
          <View style={styles.detailsList}>
            <View style={styles.detailsItem}>
              <Phone color={Colors.textSecondary} size={18} />
              <View style={styles.detailsTextContainer}>
                <Text style={styles.detailsLabel}>Mobile Number</Text>
                <Text style={styles.detailsValue}>{user?.mobile || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.detailsItem}>
              <UserCheck color={Colors.textSecondary} size={18} />
              <View style={styles.detailsTextContainer}>
                <Text style={styles.detailsLabel}>Account Status</Text>
                <Text style={[styles.detailsValue, styles.statusActive]}>
                  {user?.status ? user.status.toUpperCase() : 'ACTIVE'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsItem}>
              <Shield color={Colors.textSecondary} size={18} />
              <View style={styles.detailsTextContainer}>
                <Text style={styles.detailsLabel}>Access Role</Text>
                <Text style={[styles.detailsValue, styles.uppercase]}>
                  {user?.role || 'Student'}
                </Text>
              </View>
            </View>
            
            <View style={styles.detailsItem}>
              <BookOpen color={Colors.textSecondary} size={18} />
              <View style={styles.detailsTextContainer}>
                <Text style={styles.detailsLabel}>Enrolled Courses</Text>
                <Text style={styles.detailsValue}>
                  {user?.assignedCourses?.length || 0} Courses Enrolled
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button: Sign Out */}
        <TouchableOpacity
          onPress={handleLogoutPress}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <LogOut color={Colors.blocked} size={20} />
          <Text style={styles.logoutBtnText}>Sign Out Account</Text>
        </TouchableOpacity>
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
    padding: Spacing.four,
    paddingTop: Spacing.four,
  },
  profileCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    ...Colors.cardShadow,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  profileAvatarLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: Spacing.three,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileHeading: {
    color: Colors.navyPrimary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  profileSubheading: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  detailsList: {
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  detailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.two,
  },
  detailsTextContainer: {
    marginLeft: Spacing.three,
    flex: 1,
  },
  detailsLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  detailsValue: {
    color: Colors.navyPrimary,
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  statusActive: {
    color: Colors.active,
    fontWeight: 'bold',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutBtnText: {
    color: Colors.blocked,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Spacing.two,
  },
});
