import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, ScrollView, Alert, Image, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { User, LogOut, Phone, Shield, BookOpen, UserCheck, Edit3, Save, X, Mail, MapPin, Sun, Moon, Settings } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Spacing } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { themeMode, selectThemeMode, colors } = useAppTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setAddress(user.address || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      logout();
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out of AIM Institute?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: logout }
        ]
      );
    }
  };

  const handleSave = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !address.trim()) {
      setError("First name, last name, and address are required.");
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
        email: email.trim(),
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
      console.error(e);
      setError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.offWhite }]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.navyPrimary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.navyPrimary, borderBottomColor: colors.navySecondary }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <User color={colors.textLight} size={24} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your student account & preferences</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background, borderColor: colors.border }, colors.cardShadow]}>
          <View style={styles.profileHeader}>
            <Image
              source={require("../../../assets/images/logo.jpg")}
              style={styles.profileAvatarLogo}
              resizeMode="contain"
            />
            <View style={styles.profileTextContainer}>
              <Text style={[styles.profileHeading, { color: colors.text }]}>
                {user?.name || "Student User"}
              </Text>
              <Text style={[styles.profileSubheading, { color: colors.textSecondary }]}>
                AIM Institute Learning Platform
              </Text>
            </View>
          </View>

          {/* User Details Display & Form */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isEditing ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.offWhite, borderColor: colors.border }]}
                  placeholder="Enter first name"
                  placeholderTextColor="#A0AEC0"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (error) setError("");
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.offWhite, borderColor: colors.border }]}
                  placeholder="Enter last name"
                  placeholderTextColor="#A0AEC0"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (error) setError("");
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.offWhite, borderColor: colors.border }]}
                  placeholder="Enter email address"
                  placeholderTextColor="#A0AEC0"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
                      color: colors.text, 
                      backgroundColor: colors.offWhite, 
                      borderColor: colors.border,
                      height: 80, 
                      textAlignVertical: "top" 
                    }
                  ]}
                  placeholder="Enter complete address"
                  placeholderTextColor="#A0AEC0"
                  multiline
                  numberOfLines={3}
                  value={address}
                  onChangeText={(text) => {
                    setAddress(text);
                    if (error) setError("");
                  }}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={() => setIsEditing(false)}
                  style={[styles.btnCancel, { borderColor: colors.border }]}
                  disabled={updating}
                >
                  <X color={colors.textSecondary} size={18} />
                  <Text style={[styles.btnCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.btnSave, { backgroundColor: colors.accentBlue }]}
                  disabled={updating}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Save color="#FFFFFF" size={18} />
                      <Text style={styles.btnSaveText}>Save</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.detailsList}>
                <View style={[styles.detailsItem, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
                  <Phone color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Mobile Number</Text>
                    <Text style={[styles.detailsValue, { color: colors.text }]}>{user?.mobile || 'N/A'}</Text>
                  </View>
                </View>

                <View style={[styles.detailsItem, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
                  <Mail color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Email Address</Text>
                    <Text style={[styles.detailsValue, { color: colors.text }]}>{user?.email || 'Not Provided'}</Text>
                  </View>
                </View>

                <View style={[styles.detailsItem, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
                  <MapPin color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Address</Text>
                    <Text style={[styles.detailsValue, { color: colors.text }]}>{user?.address || 'Not Provided'}</Text>
                  </View>
                </View>

                <View style={[styles.detailsItem, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
                  <UserCheck color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Account Status</Text>
                    <Text style={[styles.detailsValue, styles.statusActive]}>
                      {user?.status ? user.status.toUpperCase() : 'ACTIVE'}
                    </Text>
                  </View>
                </View>

                <View style={[styles.detailsItem, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
                  <Shield color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Access Role</Text>
                    <Text style={[styles.detailsValue, styles.uppercase, { color: colors.text }]}>
                      {user?.role || 'Student'}
                    </Text>
                  </View>
                </View>
                
                <View style={[styles.detailsItem, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
                  <BookOpen color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Enrolled Courses</Text>
                    <Text style={[styles.detailsValue, { color: colors.text }]}>
                      {user?.assignedCourses?.length || 0} Courses Enrolled
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={[styles.editBtn, { borderColor: colors.accentBlue }]}
                activeOpacity={0.8}
              >
                <Edit3 color={colors.accentBlue} size={18} />
                <Text style={[styles.editBtnText, { color: colors.accentBlue }]}>Edit Profile Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Theme Settings Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background, borderColor: colors.border }, colors.cardShadow]}>
          <View style={styles.sectionHeader}>
            <Settings color={colors.text} size={20} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Customize the look and feel of the AIM application.
          </Text>

          <View style={[styles.themeSwitcher, { backgroundColor: colors.offWhite, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => selectThemeMode("light")}
              style={[
                styles.themeBtn,
                themeMode === "light" ? { backgroundColor: colors.accentBlue } : null
              ]}
            >
              <Sun color={themeMode === "light" ? "#FFFFFF" : colors.textSecondary} size={16} />
              <Text style={[
                styles.themeBtnText,
                themeMode === "light" ? { color: "#FFFFFF", fontWeight: "bold" } : { color: colors.textSecondary }
              ]}>Light</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectThemeMode("dark")}
              style={[
                styles.themeBtn,
                themeMode === "dark" ? { backgroundColor: colors.accentBlue } : null
              ]}
            >
              <Moon color={themeMode === "dark" ? "#FFFFFF" : colors.textSecondary} size={16} />
              <Text style={[
                styles.themeBtnText,
                themeMode === "dark" ? { color: "#FFFFFF", fontWeight: "bold" } : { color: colors.textSecondary }
              ]}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectThemeMode("system")}
              style={[
                styles.themeBtn,
                themeMode === "system" ? { backgroundColor: colors.accentBlue } : null
              ]}
            >
              <Settings color={themeMode === "system" ? "#FFFFFF" : colors.textSecondary} size={16} />
              <Text style={[
                styles.themeBtnText,
                themeMode === "system" ? { color: "#FFFFFF", fontWeight: "bold" } : { color: colors.textSecondary }
              ]}>System</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button: Sign Out */}
        <TouchableOpacity
          onPress={handleLogoutPress}
          style={styles.logoutBtn}
          activeOpacity={0.8}
        >
          <LogOut color={colors.blocked} size={20} />
          <Text style={styles.logoutBtnText}>Sign Out Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
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
    color: '#FFFFFF',
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
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    marginBottom: Spacing.four,
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
    fontWeight: 'bold',
    fontSize: 18,
  },
  profileSubheading: {
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
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  detailsTextContainer: {
    marginLeft: Spacing.three,
    flex: 1,
  },
  detailsLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  detailsValue: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 2,
  },
  statusActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: Spacing.two,
    paddingVertical: 12,
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  editBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  formContainer: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  btnCancel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: 12,
    gap: Spacing.one,
  },
  btnCancelText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  btnSave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.two,
    paddingVertical: 12,
    gap: Spacing.one,
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: Spacing.three,
  },
  themeSwitcher: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Spacing.one,
    gap: Spacing.one,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '500',
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
    marginBottom: Spacing.six,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Spacing.two,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: Spacing.three,
    fontWeight: '500',
  },
});
