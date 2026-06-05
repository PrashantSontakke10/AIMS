import React, { useState } from 'react';
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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing } from '../constants/theme';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    setError('');
    
    // Simple validation: 10 to 15 digits, optional +
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(mobile.trim())) {
      setError('Invalid mobile number. Must be 10-15 digits.');
      return;
    }

    try {
      await login(mobile.trim());
    } catch (e: any) {
      console.error(e);
      if (e.response && e.response.data && e.response.data.message) {
        setError(e.response.data.message);
      } else {
        setError('Connection failed. Please check your backend is running.');
      }
    }
  };

  const prefillTestAdmin = () => {
    setMobile('+919999999999');
    setError('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>A</Text>
          </View>
          <Text style={styles.appTitle}>AimClasses</Text>
          <Text style={styles.appSubtitle}>Admin Management Portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In or Register</Text>
          <Text style={styles.cardDescription}>
            Enter your mobile number to get started. If your number is listed as admin in the backend's `.env`, you will log in as an administrator.
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              placeholder="+919999999999"
              placeholderTextColor="#A0AEC0"
              keyboardType="phone-pad"
              value={mobile}
              onChangeText={(text) => {
                setMobile(text);
                if (error) setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
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

          <TouchableOpacity style={styles.demoLink} onPress={prefillTestAdmin}>
            <Text style={styles.demoLinkText}>Use Default Admin Mobile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Secure Admin Panel • Powered by AimClasses</Text>
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
    justifyContent: 'space-between',
    paddingVertical: Spacing.four,
  },
  header: {
    alignItems: 'center',
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
    backgroundColor: Colors.navyPrimary,
    borderBottomLeftRadius: Spacing.five,
    borderBottomRightRadius: Spacing.five,
    marginBottom: Spacing.five,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
    ...Colors.cardShadow,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.navyPrimary,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textLight,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.half,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: Spacing.three,
    padding: Spacing.four,
    marginHorizontal: Spacing.three,
    ...Colors.cardShadow,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
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
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.offWhite,
  },
  inputError: {
    borderColor: Colors.blocked,
  },
  errorText: {
    color: Colors.blocked,
    fontSize: 13,
    marginBottom: Spacing.three,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: Colors.navySecondary,
    borderRadius: Spacing.two,
    padding: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginBottom: Spacing.three,
  },
  loginButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  demoLink: {
    alignItems: 'center',
    paddingVertical: Spacing.one,
  },
  demoLinkText: {
    color: Colors.accentBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.five,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
