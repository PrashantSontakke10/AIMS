import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Image,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppTheme } from "../context/ThemeContext";
import { Spacing } from "../constants/theme";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mobile = params.mobile || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const { login, loading } = useAuth();
  const { colors } = useAppTheme();

  const handleRegister = async () => {
    setError("");
    if (!firstName.trim() || !lastName.trim() || !address.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      // Complete student login/signup with registration fields
      await login(mobile, "student", {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        address: address.trim(),
      });
      // On success, RootLayout will redirect them to (student)/courses
    } catch (e) {
      console.error(e);
      if (e.response && e.response.data && e.response.data.message) {
        setError(e.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.offWhite }]}
    >
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} backgroundColor={colors.offWhite} />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/logo.jpg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.appTitle, { color: colors.text }]}>AIM Institute</Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            Student Learning Portal
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }, colors.cardShadow]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Complete Registration</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            This mobile number is not registered yet. Please enter your profile details below to create an account.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Read-only Mobile Number display */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Registered Mobile</Text>
            <View style={[
              styles.phoneInputRow,
              { backgroundColor: colors.offWhite, borderColor: colors.border, opacity: 0.7 }
            ]}>
              <View style={[styles.prefixContainer, { backgroundColor: colors.isDark ? "#1E293B" : "#EDF2F7", borderRightColor: colors.border }]}>
                <Text style={[styles.prefixText, { color: colors.text }]}>+91</Text>
              </View>
              <Text style={[styles.phoneInputVal, { color: colors.text }]}>
                {mobile.startsWith("+91") ? mobile.slice(3) : mobile}
              </Text>
            </View>
          </View>

          {/* First Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>First Name</Text>
            <TextInput
              style={[styles.normalInput, { color: colors.text, backgroundColor: colors.offWhite, borderColor: colors.border }]}
              placeholder="Enter first name"
              placeholderTextColor="#A0AEC0"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                if (error) setError("");
              }}
              autoCorrect={false}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Last Name</Text>
            <TextInput
              style={[styles.normalInput, { color: colors.text, backgroundColor: colors.offWhite, borderColor: colors.border }]}
              placeholder="Enter last name"
              placeholderTextColor="#A0AEC0"
              value={lastName}
              onChangeText={(text) => {
                setLastName(text);
                if (error) setError("");
              }}
              autoCorrect={false}
            />
          </View>

          {/* Address Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Address</Text>
            <TextInput
              style={[
                styles.normalInput,
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

          {/* Get Started Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.navyPrimary }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text style={styles.submitButtonText}>Get Started</Text>
            )}
          </TouchableOpacity>

          {/* Return to Login Link */}
          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.cancelLinkText}>Change Mobile Number</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            AIM Institute Learning Platform • Powered by AIM Institute
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  logoImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: Spacing.half,
    fontWeight: "500",
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: Spacing.one,
  },
  cardDescription: {
    fontSize: 13,
    marginBottom: Spacing.four,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: Spacing.one,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Spacing.two,
    overflow: "hidden",
  },
  prefixContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  prefixText: {
    fontSize: 16,
    fontWeight: "600",
  },
  phoneInputVal: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  normalInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: 14,
    fontSize: 16,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: Spacing.three,
    fontWeight: "500",
  },
  submitButton: {
    borderRadius: Spacing.two,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginTop: Spacing.two,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelLink: {
    alignItems: "center",
    marginTop: Spacing.two,
    paddingVertical: 8,
  },
  cancelLinkText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
  footerText: {
    fontSize: 11,
  },
});
