import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, StatusBar, ScrollView, Alert, Image, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { User, LogOut, Phone, Shield, BookOpen, UserCheck, Edit3, Save, X, Mail, MapPin, Sun, Moon, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const { themeMode, selectThemeMode, colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navyPrimary} />

      {/* Rounded Header Card */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIconContainer}>
            <User color={colors.textLight} size={24} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Profile</Text>
            <Text style={styles.headerSubtitle}>Manage your student account & preferences</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Card */}
        <View style={[styles.profileCard, colors.cardShadow]}>
          <View style={styles.profileHeader}>
            <Image
              source={require("../../../assets/images/logo.jpg")}
              style={styles.profileAvatarLogo}
              resizeMode="contain"
            />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileHeading}>
                {user?.name || "Student User"}
              </Text>
              <Text style={styles.profileSubheading}>
                AIM Institute Learning Platform
              </Text>
            </View>
          </View>

          {/* User Details Display & Form */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isEditing ? (
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={styles.input}
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
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={styles.input}
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
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
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
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[
                    styles.input, 
                    { 
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
                  style={styles.btnCancel}
                  disabled={updating}
                >
                  <X color={colors.textSecondary} size={18} />
                  <Text style={styles.btnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSave}
                  style={styles.btnSave}
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
                <View style={styles.detailsItem}>
                  <Phone color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Mobile Number</Text>
                    <Text style={styles.detailsValue}>{user?.mobile || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.detailsItem}>
                  <Mail color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Email Address</Text>
                    <Text style={styles.detailsValue}>{user?.email || 'Not Provided'}</Text>
                  </View>
                </View>

                <View style={styles.detailsItem}>
                  <MapPin color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Address</Text>
                    <Text style={styles.detailsValue}>{user?.address || 'Not Provided'}</Text>
                  </View>
                </View>

                <View style={styles.detailsItem}>
                  <UserCheck color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Account Status</Text>
                    <Text style={[styles.detailsValue, styles.statusActive]}>
                      {user?.status ? user.status.toUpperCase() : 'ACTIVE'}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailsItem}>
                  <Shield color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Access Role</Text>
                    <Text style={[styles.detailsValue, styles.uppercase]}>
                      {user?.role || 'Student'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailsItem}>
                  <BookOpen color={colors.textSecondary} size={18} />
                  <View style={styles.detailsTextContainer}>
                    <Text style={styles.detailsLabel}>Enrolled Courses</Text>
                    <Text style={styles.detailsValue}>
                      {user?.assignedCourses?.length || 0} Courses Enrolled
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editBtn}
                activeOpacity={0.8}
              >
                <Edit3 color={colors.accentBlue} size={18} />
                <Text style={styles.editBtnText}>Edit Profile Details</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Theme Settings Card */}
        <View style={[styles.profileCard, colors.cardShadow]}>
          <View style={styles.sectionHeader}>
            <Settings color={colors.text} size={20} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Customize the look and feel of the AIM application.
          </Text>

          <View style={styles.themeSwitcher}>
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
    </View>
  );
}

const getStyles = (colors, insets) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.offWhite,
  },
  header: {
    backgroundColor: colors.navyPrimary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: insets.top + Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    ...colors.cardShadow,
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
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: colors.textLight,
    fontWeight: 'bold',
    fontSize: 20,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  scrollContainer: {
    padding: Spacing.four,
    paddingTop: Spacing.four,
  },
  profileCard: {
    backgroundColor: colors.background,
    borderColor: colors.border,
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
    color: colors.text,
  },
  profileSubheading: {
    fontSize: 14,
    color: colors.textSecondary,
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
    backgroundColor: colors.offWhite,
    borderColor: colors.border,
    marginBottom: Spacing.two,
  },
  detailsTextContainer: {
    marginLeft: Spacing.three,
    flex: 1,
  },
  detailsLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  detailsValue: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  statusActive: {
    color: colors.active,
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
    borderColor: colors.accentBlue,
    paddingVertical: 12,
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  editBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.accentBlue,
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
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    color: colors.text,
    backgroundColor: colors.offWhite,
    borderColor: colors.border,
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
    borderColor: colors.border,
    borderRadius: Spacing.two,
    paddingVertical: 12,
    gap: Spacing.one,
  },
  btnCancelText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.textSecondary,
  },
  btnSave: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentBlue,
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
    color: colors.text,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: Spacing.three,
  },
  themeSwitcher: {
    flexDirection: 'row',
    borderRadius: Spacing.two,
    borderWidth: 1,
    backgroundColor: colors.offWhite,
    borderColor: colors.border,
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
    color: colors.blocked,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: Spacing.two,
  },
  errorText: {
    color: colors.blocked,
    fontSize: 13,
    marginBottom: Spacing.three,
    fontWeight: '500',
  },
});
