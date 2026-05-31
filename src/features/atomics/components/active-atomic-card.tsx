import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../../../lib/theme";
import { Kicker, Stat, cardStyle } from "./ui";
import ChargeRing from "./charge-ring";
import type { Atomic } from "../../../types/atomic";
import type { AtomicMetrics, CheckInStatus, DayLog } from "../../../types/log";

interface Props {
  atomic: Atomic;
  metrics: AtomicMetrics;
  todayLog: DayLog | null;
  onCheckIn: (status: CheckInStatus) => void;
  onToggleBadDay: () => void;
  onSetNote: (note: string) => void;
}

export default function ActiveAtomicCard({
  atomic,
  metrics,
  todayLog,
  onCheckIn,
  onToggleBadDay,
  onSetNote,
}: Props) {
  const mark = todayLog?.status ?? null;
  const bad = todayLog?.badDay ?? false;
  const [note, setNote] = useState(todayLog?.note ?? "");

  useEffect(() => {
    setNote(todayLog?.note ?? "");
  }, [todayLog?.note]);

  return (
    <View style={cardStyle}>
      <View style={styles.headerRow}>
        <Kicker color={C.accent}>● INSTALLING</Kicker>
        <Text style={styles.code}>{atomic.code}</Text>
      </View>
      <Text style={styles.name}>{atomic.name}</Text>

      <View style={styles.metricsRow}>
        <ChargeRing pct={metrics.charge} />
        <View style={{ flex: 1 }}>
          <Stat big value={`${metrics.charge}%`} label="charge" />
          <View style={styles.subStats}>
            <Stat
              value={`${metrics.badHeld}/2`}
              label="hard days held"
              hot={metrics.badHeld >= 2}
            />
            <Stat
              value={`${metrics.completion}%`}
              label={`ran (${metrics.totalDays}d)`}
            />
          </View>
        </View>
      </View>

      <View style={styles.planBox}>
        <Kicker>IF — THEN PLAN</Kicker>
        <Text style={styles.planText}>
          <Text style={{ color: C.muted }}>When </Text>
          <Text style={{ color: C.text }}>{atomic.trigger}</Text>
          <Text style={{ color: C.muted }}>, instead of </Text>
          <Text style={styles.strike}>{atomic.oldBehavior.toLowerCase()}</Text>
          <Text style={{ color: C.muted }}> → </Text>
          <Text style={styles.newBehavior}>{atomic.newBehavior}</Text>
          <Text style={{ color: C.muted }}>.</Text>
        </Text>
      </View>

      <Kicker>TODAY</Kicker>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggle, mark === "ran" && styles.toggleRan]}
          onPress={() => onCheckIn("ran")}
        >
          <Text style={[styles.toggleText, mark === "ran" && { color: C.bg }]}>
            ✓ Ran the new move
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggle, mark === "missed" && styles.toggleMissed]}
          onPress={() => onCheckIn("missed")}
        >
          <Text style={[styles.toggleText, mark === "missed" && { color: C.bg }]}>
            ✕ Missed
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.badBtn, bad && { borderColor: C.bad }]}
        onPress={onToggleBadDay}
      >
        <Text style={[styles.badText, bad && { color: C.bad }]}>
          {bad
            ? "⚡ Marked a SLAMMED day — holding now counts double"
            : "⚡ Was today a slammed / bad day?"}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.note}
        placeholder="one line: what made it run or break today…"
        placeholderTextColor={C.faint}
        value={note}
        onChangeText={setNote}
        onBlur={() => note !== (todayLog?.note ?? "") && onSetNote(note)}
      />

      {mark === "ran" && bad && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            ↳ Held on a hard day. That's the real signal — this is what graduates
            the atomic.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  code: { fontFamily: "monospace", fontSize: 11, color: C.muted },
  name: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 25,
    letterSpacing: 1.5,
    color: C.text,
    marginTop: 10,
    marginBottom: 16,
    lineHeight: 28,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    marginBottom: 18,
  },
  subStats: { flexDirection: "row", gap: 18, marginTop: 12 },
  planBox: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  planText: { marginTop: 8, fontSize: 14, lineHeight: 21 },
  strike: { color: C.bad, textDecorationLine: "line-through" },
  newBehavior: { color: C.accent, fontWeight: "600" },
  toggleRow: { flexDirection: "row", gap: 9, marginTop: 9, marginBottom: 11 },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
  },
  toggleRan: { backgroundColor: C.accent, borderColor: C.accent },
  toggleMissed: { backgroundColor: C.bad, borderColor: C.bad },
  toggleText: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  badBtn: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 11,
  },
  badText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
  },
  note: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 13.5,
  },
  banner: {
    marginTop: 12,
    backgroundColor: C.accentSoft,
    borderRadius: 9,
    padding: 11,
  },
  bannerText: {
    fontFamily: "monospace",
    fontSize: 11.5,
    color: C.accent,
    letterSpacing: 0.3,
    lineHeight: 17,
  },
});
