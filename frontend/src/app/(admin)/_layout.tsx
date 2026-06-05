import React, { useState } from 'react';
import { Slot, useRouter, usePathname } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StatusBar,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing } from '../../constants/theme';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const isLargeScreen = width >= 768;

  const navItems = [
    {
      name: 'Dashboard',
      route: '/(admin)/dashboard',
      icon: '📊',
    },
    {
      name: 'Students',
      route: '/(admin)/students',
      icon: '👥',
    },
    {
      name: 'Curriculum',
      route: '/(admin)/curriculum',
      icon: '📚',
    },
  ];

  const handleNav = (route: string) => {
    router.push(route as any);
  };

  const handleProfileOption = (optionName: string) => {
    setProfileMenuVisible(false);
    Alert.alert(optionName, `AimClasses ${optionName} feature will be available in the next version.`);
  };

  const Sidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}>
        <TouchableOpacity 
          style={styles.brandIcon}
          onPress={() => setProfileMenuVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.brandIconText}>👤</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.brandName}>AimClasses</Text>
          <Text style={styles.brandRole}>Admin Console</Text>
        </View>
      </View>

      <View style={styles.sidebarNav}>
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.route);
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.sidebarNavItem, isActive ? styles.sidebarNavItemActive : null]}
              onPress={() => handleNav(item.route)}
              activeOpacity={0.7}
            >
              <Text style={styles.sidebarNavIcon}>{item.icon}</Text>
              <Text style={[styles.sidebarNavLabel, isActive ? styles.sidebarNavLabelActive : null]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.sidebarFooter}>
        <Text style={styles.adminMobile} numberOfLines={1}>
          📱 {user?.mobile}
        </Text>
        <TouchableOpacity style={styles.sidebarLogoutBtn} onPress={logout} activeOpacity={0.8}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const BottomTabs = () => (
    <View style={styles.bottomTabs}>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.route);
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.tabItem}
            onPress={() => handleNav(item.route)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{item.icon}</Text>
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.tabItem} onPress={logout} activeOpacity={0.7}>
        <Text style={styles.tabIcon}>🚪</Text>
        <Text style={[styles.tabLabel, { color: Colors.blocked }]}>Exit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.navyPrimary} />
      <View style={[styles.container, isLargeScreen ? styles.containerRow : styles.containerCol]}>
        {isLargeScreen ? <Sidebar /> : null}
        
        <View style={styles.mainContent}>
          {!isLargeScreen ? (
            <View style={[styles.mobileHeader, { paddingTop: insets.top + Spacing.one, height: 56 + insets.top }]}>
              <TouchableOpacity 
                style={styles.profileAvatarBtn}
                onPress={() => setProfileMenuVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.profileAvatarText}>👤</Text>
              </TouchableOpacity>
              <View style={styles.mobileHeaderTitleContainer}>
                <Text style={styles.mobileHeaderTitle}>AimClasses Admin</Text>
                <Text style={styles.mobileHeaderSubtitle}>{user?.mobile}</Text>
              </View>
              <View style={{ width: 36 }} />
            </View>
          ) : null}
          
          <View style={styles.slotContainer}>
            <Slot />
          </View>
        </View>

        {!isLargeScreen ? <BottomTabs /> : null}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={profileMenuVisible}
        onRequestClose={() => setProfileMenuVisible(false)}
      >

        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Options</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setProfileMenuVisible(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalBody}>
              <View style={styles.profileCard}>
                <View style={styles.profileAvatarLarge}>
                  <Text style={styles.avatarEmojiLarge}>👤</Text>
                </View>
                <Text style={styles.profileMobileText}>{user?.mobile}</Text>
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
                </View>
              </View>

              <View style={styles.optionsList}>
                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => handleProfileOption('Account Settings')}
                >
                  <Text style={styles.optionIcon}>⚙️</Text>
                  <Text style={styles.optionLabel}>Account Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => handleProfileOption('Security & Privacy')}
                >
                  <Text style={styles.optionIcon}>🛡️</Text>
                  <Text style={styles.optionLabel}>Security & Privacy</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.optionItem}
                  onPress={() => handleProfileOption('Help & Support')}
                >
                  <Text style={styles.optionIcon}>📞</Text>
                  <Text style={styles.optionLabel}>Help & Support</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.logoutActionBtn} 
                onPress={() => {
                  setProfileMenuVisible(false);
                  logout();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutActionBtnText}>Sign Out</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.navyPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  containerRow: {
    flexDirection: 'row',
  },
  containerCol: {
    flexDirection: 'column',
  },
  sidebar: {
    width: 240,
    backgroundColor: Colors.navyPrimary,
    borderRightWidth: 1,
    borderRightColor: Colors.navySecondary,
    justifyContent: 'space-between',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.five,
    paddingHorizontal: Spacing.one,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandIconText: {
    fontSize: 18,
    color: Colors.navyPrimary,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  brandRole: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  sidebarNav: {
    flex: 1,
    gap: Spacing.one,
  },
  sidebarNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    gap: Spacing.two,
  },
  sidebarNavItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  sidebarNavIcon: {
    fontSize: 18,
  },
  sidebarNavLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  sidebarNavLabelActive: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  sidebarFooter: {
    paddingTop: Spacing.four,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: Spacing.two,
  },
  adminMobile: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    paddingHorizontal: Spacing.one,
  },
  sidebarLogoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: Colors.blocked,
    borderRadius: Spacing.one,
    paddingVertical: Spacing.one,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#FF6B6B',
    fontWeight: '600',
    fontSize: 13,
  },
  bottomTabs: {
    height: 60,
    backgroundColor: Colors.navyPrimary,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.navySecondary,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
  },
  tabLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: Spacing.half,
  },
  tabLabelActive: {
    color: Colors.textLight,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  mobileHeader: {
    height: 56,
    backgroundColor: Colors.navyPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    justifyContent: 'space-between',
  },
  profileAvatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 18,
  },
  mobileHeaderTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  mobileHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  mobileHeaderSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  slotContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    padding: Spacing.four,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.two,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeBtn: {
    padding: Spacing.one,
  },
  closeBtnText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  modalBody: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  avatarEmojiLarge: {
    fontSize: 40,
  },
  profileMobileText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.one,
  },
  adminBadge: {
    backgroundColor: 'rgba(0, 141, 218, 0.1)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentBlue,
    letterSpacing: 1,
  },
  optionsList: {
    alignSelf: 'stretch',
    backgroundColor: Colors.offWhite,
    borderRadius: Spacing.two,
    padding: Spacing.one,
    marginBottom: Spacing.five,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.three,
  },
  optionIcon: {
    fontSize: 18,
  },
  optionLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
  },
  logoutActionBtn: {
    alignSelf: 'stretch',
    backgroundColor: Colors.blocked,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutActionBtnText: {
    color: Colors.textLight,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
