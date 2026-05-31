import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { C } from "../../../lib/theme";
import { useAuthService } from "../auth-service";

export default function AuthView() {
  const { busy, error, clearError, signIn, signUp } = useAuthService();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert("Auth error", error, [{ text: "OK", onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleSubmit = async () => {
    if (isSignUp) {
      const { ok, needsConfirmation } = await signUp(email, password);
      if (ok && needsConfirmation) {
        Alert.alert("Check your email", "We sent you a confirmation link.");
      }
    } else {
      await signIn(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <View style={styles.dot} />
          <Text style={styles.title}>ATOMICS</Text>
        </View>
        <Text style={styles.subtitle}>
          swap one default at a time{"\n"}subtraction that compounds
        </Text>

        <TextInput
          style={styles.input}
          placeholder="email"
          placeholderTextColor={C.faint}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          placeholder="password"
          placeholderTextColor={C.faint}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textContentType="password"
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color={C.bg} />
          ) : (
            <Text style={styles.primaryBtnText}>
              {isSignUp ? "Create account" : "Sign in"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => setIsSignUp((v) => !v)}
        >
          <Text style={styles.switchText}>
            {isSignUp
              ? "Already have an account? Sign in"
              : "No account? Create one"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  header: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 28,
    letterSpacing: 1,
    color: C.text,
  },
  subtitle: {
    fontFamily: "monospace",
    fontSize: 11,
    color: C.faint,
    letterSpacing: 0.3,
    marginBottom: 36,
    lineHeight: 18,
  },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    color: C.text,
    fontSize: 15,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 14,
    color: C.bg,
  },
  switchBtn: { marginTop: 18, alignItems: "center" },
  switchText: { fontFamily: "monospace", fontSize: 12, color: C.muted },
});
