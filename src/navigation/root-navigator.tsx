import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { C } from "../lib/theme";
import { useAuthContext } from "../features/auth/auth-context";
import { useOnboarding } from "../features/onboarding/onboarding-storage";
import OnboardingView from "../features/onboarding/views/onboarding-view";
import AuthView from "../features/auth/views/auth-view";
import HomeView from "../features/atomics/views/home-view";

/**
 * Top-level flow gate: splash → onboarding (first launch) → auth → home.
 */
export default function RootNavigator() {
  const { session, loading: authLoading } = useAuthContext();
  const { seen, loading: onboardingLoading, complete } = useOnboarding();

  if (authLoading || onboardingLoading) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  if (!seen) {
    return <OnboardingView onDone={complete} />;
  }

  if (!session) {
    return <AuthView />;
  }

  return <HomeView />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
});
