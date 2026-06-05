import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import { Colors, Spacing } from "../constants/theme";

export default function PendingScreen() {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();

  const isBlocked = user?.status === "blocked";

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.offWhite }]}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.jpg")}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.appTitle, { color: colors.text }]}>AIM Institute</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }, colors.cardShadow]}>
        <View
          style={[
            styles.statusIconBadge,
            { backgroundColor: isBlocked ? colors.blocked : colors.pending },
          ]}
        >
          <Text style={styles.statusIconText}>!</Text>
        </View>

        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {isBlocked ? "Account Blocked" : "Approval Pending"}
        </Text>

        <Text style={[styles.mobileText, { color: colors.textSecondary }]}>Mobile: {user?.mobile}</Text>

        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
          {isBlocked
            ? "Your account has been blocked by the administrator. You can no longer access dashboard materials. Please reach out to customer support."
            : "Your student registration has been received successfully! Before you can view lessons and course materials, an administrator must approve your account and assign your courses."}
        </Text>

        <View style={styles.statusBox}>
          <Text style={[styles.statusBoxLabel, { color: colors.text }]}>Status:</Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isBlocked
                  ? `${colors.blocked}15`
                  : `${colors.pending}15`,
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isBlocked ? colors.blocked : colors.pending },
              ]}
            >
              {user?.status ? user.status.toUpperCase() : "PENDING"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: colors.navyPrimary }]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutButtonText, { color: colors.navyPrimary }]}>Return to Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>AIM Institute Learning Platform</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.four,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.five,
  },
  logoImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.one,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    alignItems: "center",
  },
  statusIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.three,
  },
  statusIconText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.textLight,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
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
    textAlign: "center",
    lineHeight: 20,
    marginBottom: Spacing.four,
  },
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.five,
  },
  statusBoxLabel: {
    fontSize: 14,
    fontWeight: "600",
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
    fontWeight: "bold",
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    width: "100%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: Colors.navyPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.five,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
