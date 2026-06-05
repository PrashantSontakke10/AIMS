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
import { Colors, Spacing } from "../constants/theme";

export default function LoginScreen() {
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loginMode, setLoginMode] = useState("student"); // "student" or "admin"
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    setError("");
    const digitsOnly = mobile.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }

    try {
      await login(`+91${digitsOnly}`, loginMode);
    } catch (e) {
      console.error(e);
      if (e.response && e.response.data && e.response.data.message) {
        setError(e.response.data.message);
      } else {
        setError("Connection failed. Please check your backend is running.");
      }
    }
  };

  const prefillDemoMobile = () => {
    if (loginMode === "admin") {
      setMobile("9999999999");
    } else {
      setMobile("8888888888");
    }
    setError("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.offWhite} />
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
          <Text style={styles.appTitle}>AIM Institute</Text>
          <Text style={styles.appSubtitle}>
            {loginMode === "admin" ? "Admin Management Portal" : "Student Learning Portal"}
          </Text>
        </View>

        {/* Portal Tabs Selector */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, loginMode === "student" ? styles.tabBtnActive : null]}
            onPress={() => {
              setLoginMode("student");
              setMobile("");
              setError("");
            }}
          >
            <Text style={[styles.tabBtnText, loginMode === "student" ? styles.tabBtnTextActive : null]}>
              Student Login
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabBtn, loginMode === "admin" ? styles.tabBtnActive : null]}
            onPress={() => {
              setLoginMode("admin");
              setMobile("");
              setError("");
            }}
          >
            <Text style={[styles.tabBtnText, loginMode === "admin" ? styles.tabBtnTextActive : null]}>
              Admin Login
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In or Register</Text>
          <Text style={styles.cardDescription}>
            {loginMode === "admin"
              ? "Enter your registered admin mobile number. If verified, you will be granted access to course, student and note managers."
              : "Enter your mobile number to log in or register. Active student numbers will grant instant access to class materials."}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View style={[styles.phoneInputRow, error ? styles.phoneInputRowError : null]}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefixText}>+91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder={loginMode === "admin" ? "99999 99999" : "88888 88888"}
                placeholderTextColor="#A0AEC0"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "");
                  if (cleaned.length <= 10) {
                    setMobile(cleaned);
                  }
                  if (error) setError("");
                }}
                maxLength={10}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textLight} />
            ) : (
              <Text style={styles.loginButtonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoLink} onPress={prefillDemoMobile}>
            <Text style={styles.demoLinkText}>
              {loginMode === "admin" ? "Use Demo Admin Mobile" : "Use Demo Student Mobile (Active)"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
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
    backgroundColor: Colors.offWhite,
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
    color: Colors.navyPrimary,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.half,
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: Spacing.two,
    padding: 4,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: Spacing.one,
  },
  tabBtnActive: {
    backgroundColor: Colors.navyPrimary,
  },
  tabBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.textLight,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Colors.cardShadow,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.navyPrimary,
    marginBottom: Spacing.one,
  },
  cardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.four,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: Spacing.four,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.navyPrimary,
    marginBottom: Spacing.one,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  phoneInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.two,
    backgroundColor: Colors.offWhite,
    overflow: "hidden",
  },
  phoneInputRowError: {
    borderColor: Colors.blocked,
  },
  prefixContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    backgroundColor: "#EDF2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  prefixText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.navyPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    color: Colors.blocked,
    fontSize: 13,
    marginBottom: Spacing.three,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: Colors.navyPrimary,
    borderRadius: Spacing.two,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    marginBottom: Spacing.three,
  },
  loginButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: "bold",
  },
  demoLink: {
    alignItems: "center",
    paddingVertical: 4,
  },
  demoLinkText: {
    color: Colors.accentBlue,
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
