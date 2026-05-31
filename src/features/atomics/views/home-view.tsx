import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { C } from "../../../lib/theme";
import { today } from "../../../lib/dates";
import { useAtomicsService } from "../atomic-service";
import { useAuthService } from "../../auth/auth-service";
import { useNotificationService } from "../../notifications/notification-service";
import ActiveAtomicCard from "../components/active-atomic-card";
import HistoryGrid from "../components/history-grid";
import QueueCard from "../components/queue-card";
import GraduatedCard from "../components/graduated-card";
import AddAtomicForm from "../components/add-atomic-form";
import Methodology from "../components/methodology";
import { Kicker, Legend, cardStyle } from "../components/ui";
import type { Atomic } from "../../../types/atomic";

export default function HomeView() {
  const vm = useAtomicsService();
  const { signOut } = useAuthService();
  const { reminderOn, hour, toggleReminder } = useNotificationService();
  const [refreshing, setRefreshing] = useState(false);
  const t = today();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    vm.refresh();
    setTimeout(() => setRefreshing(false), 600);
  }, [vm]);

  const handleRemove = (a: Atomic) => {
    Alert.alert("Remove atomic", `Remove "${a.name}" from the queue?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => vm.removeAtomic(a.id) },
    ]);
  };

  const handleReminder = async () => {
    const enabled = await toggleReminder();
    if (!reminderOn && !enabled) {
      Alert.alert(
        "Notifications off",
        "Enable notification permission in settings to get a daily check-in nudge."
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "You'll need to sign in again.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: signOut },
    ]);
  };

  if (vm.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={C.accent} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.dot} />
            <Text style={styles.headerTitle}>ATOMICS</Text>
          </View>
          <Text style={styles.headerDate}>{t}</Text>
        </View>
        <Text style={styles.headerSub}>
          swap one default at a time · subtraction that compounds
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent}
          />
        }
      >
        {vm.active && vm.activeMetrics ? (
          <ActiveAtomicCard
            atomic={vm.active}
            metrics={vm.activeMetrics}
            todayLog={vm.todayLog}
            onCheckIn={vm.checkIn}
            onToggleBadDay={vm.toggleBadDay}
            onSetNote={vm.setDayNote}
          />
        ) : (
          <View style={[cardStyle, { alignItems: "center" }]}>
            <Text style={styles.allDone}>All queued atomics graduated.</Text>
            <Text style={styles.allDoneSub}>
              Add a new one below when you're ready — not before.
            </Text>
          </View>
        )}

        {vm.active && (
          <View style={cardStyle}>
            <Kicker>LAST 21 DAYS · {vm.active.code}</Kicker>
            <HistoryGrid atomicId={vm.active.id} logs={vm.logs} />
            <View style={styles.legendRow}>
              <Legend color={C.accent} label="held a hard day" />
              <Legend color="rgba(198,242,78,0.55)" label="ran" />
              <Legend color="rgba(255,122,102,0.22)" label="missed" />
              <Legend color="transparent" label="no entry" border />
            </View>
          </View>
        )}

        {/* Daily reminder toggle (Firebase / local notification) */}
        <View style={cardStyle}>
          <Kicker>DAILY NUDGE</Kicker>
          <TouchableOpacity
            style={[styles.reminderBtn, reminderOn && { borderColor: C.accent }]}
            onPress={handleReminder}
          >
            <Text
              style={[styles.reminderText, reminderOn && { color: C.accent }]}
            >
              {reminderOn
                ? `🔔 Reminder on · every day at ${String(hour).padStart(2, "0")}:00`
                : "🔕 Turn on a daily check-in reminder"}
            </Text>
          </TouchableOpacity>
        </View>

        <QueueCard queued={vm.queued} isSeed={vm.isSeed} onRemove={handleRemove} />
        <GraduatedCard graduated={vm.graduated} />
        <AddAtomicForm onAdd={vm.addAtomic} />
        <Methodology />

        <View style={styles.footer}>
          <Text style={styles.footerText}>data synced via Supabase</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={[styles.footerText, { textDecorationLine: "underline" }]}>
              sign out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  center: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "rgba(12,13,14,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 13,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 9 },
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
  headerTitle: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 1,
    color: C.text,
  },
  headerDate: { fontFamily: "monospace", fontSize: 11, color: C.muted },
  headerSub: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: C.faint,
    marginTop: 5,
    letterSpacing: 0.3,
  },
  scrollContent: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 64,
  },
  allDone: { fontFamily: "monospace", color: C.amber, fontSize: 14 },
  allDoneSub: { color: C.muted, fontSize: 13, marginTop: 6 },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  reminderBtn: {
    marginTop: 11,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  reminderText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { fontFamily: "monospace", fontSize: 9.5, color: C.faint },
});
