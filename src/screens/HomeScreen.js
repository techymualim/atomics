import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { C } from "../lib/constants";
import { today } from "../lib/dates";
import { useAuth } from "../hooks/useAuth";
import { useAtomics } from "../hooks/useAtomics";
import ChargeRing from "../components/ChargeRing";
import HistoryGrid from "../components/HistoryGrid";

export default function HomeScreen() {
  const { signOut } = useAuth();
  const {
    active,
    queued,
    graduated,
    logs,
    todayLog,
    activeMetrics,
    loading,
    checkIn,
    toggleBadDay,
    setDayNote,
    addAtomic,
    removeAtomic,
    refresh,
  } = useAtomics();

  const [showAdd, setShowAdd] = useState(false);
  const [showMethod, setShowMethod] = useState(false);
  const [draft, setDraft] = useState({ name: "", trigger: "", oldB: "", newB: "" });
  const [noteText, setNoteText] = useState(todayLog?.note || "");
  const [refreshing, setRefreshing] = useState(false);

  const t = today();
  const todayMark = todayLog?.status || null;
  const todayBad = todayLog?.bad_day || false;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleAdd = async () => {
    if (!draft.name.trim() || !draft.newB.trim()) return;
    await addAtomic({
      name: draft.name.trim(),
      trigger: draft.trigger.trim(),
      oldBehavior: draft.oldB.trim(),
      newBehavior: draft.newB.trim(),
    });
    setDraft({ name: "", trigger: "", oldB: "", newB: "" });
    setShowAdd(false);
  };

  const handleRemove = (id, name) => {
    Alert.alert("Remove atomic", `Remove "${name}" from the queue?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeAtomic(id) },
    ]);
  };

  const handleNoteBlur = () => {
    if (active && noteText !== (todayLog?.note || "")) {
      setDayNote(active.id, noteText);
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Sign out",
      "You'll need to sign in again.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: signOut },
      ]
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
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
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent}
          />
        }
      >
        {/* ACTIVE ATOMIC */}
        {active ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.kicker, { color: C.accent }]}>● INSTALLING</Text>
              <Text style={styles.codeLabel}>{active.code}</Text>
            </View>
            <Text style={styles.atomicName}>{active.name}</Text>

            {/* Charge + stats */}
            <View style={styles.metricsRow}>
              <ChargeRing pct={activeMetrics?.charge || 0} />
              <View style={styles.metricsRight}>
                <Text style={styles.bigStat}>{activeMetrics?.charge || 0}%</Text>
                <Text style={styles.statLabel}>charge</Text>
                <View style={styles.subStatsRow}>
                  <View>
                    <Text
                      style={[
                        styles.stat,
                        activeMetrics?.badHeld >= 2 && { color: C.accent },
                      ]}
                    >
                      {activeMetrics?.badHeld || 0}/2
                    </Text>
                    <Text style={styles.statLabel}>hard days held</Text>
                  </View>
                  <View>
                    <Text style={styles.stat}>
                      {activeMetrics?.completion || 0}%
                    </Text>
                    <Text style={styles.statLabel}>
                      ran ({activeMetrics?.totalDays || 0}d)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* If-then plan */}
            <View style={styles.planBox}>
              <Text style={styles.kicker}>IF — THEN PLAN</Text>
              <Text style={styles.planText}>
                <Text style={{ color: C.muted }}>When </Text>
                <Text style={{ color: C.text }}>{active.trigger}</Text>
                <Text style={{ color: C.muted }}>, instead of </Text>
                <Text style={{ color: C.bad, textDecorationLine: "line-through" }}>
                  {active.old_behavior?.toLowerCase()}
                </Text>
                <Text style={{ color: C.muted }}> → </Text>
                <Text style={{ color: C.accent, fontWeight: "600" }}>
                  {active.new_behavior}
                </Text>
                <Text style={{ color: C.muted }}>.</Text>
              </Text>
            </View>

            {/* Today check-in */}
            <Text style={styles.kicker}>TODAY</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  todayMark === "ran" && {
                    backgroundColor: C.accent,
                    borderColor: C.accent,
                  },
                ]}
                onPress={() => checkIn(active.id, "ran")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    todayMark === "ran" && { color: C.bg },
                  ]}
                >
                  ✓ Ran the new move
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  todayMark === "missed" && {
                    backgroundColor: C.bad,
                    borderColor: C.bad,
                  },
                ]}
                onPress={() => checkIn(active.id, "missed")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    todayMark === "missed" && { color: C.bg },
                  ]}
                >
                  ✕ Missed
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.badDayBtn,
                todayBad && { borderColor: C.bad },
              ]}
              onPress={() => toggleBadDay(active.id)}
            >
              <Text
                style={[styles.badDayText, todayBad && { color: C.bad }]}
              >
                {todayBad
                  ? "⚡ Marked a SLAMMED day — holding now counts double"
                  : "⚡ Was today a slammed / bad day?"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.noteInput}
              placeholder="one line: what made it run or break today…"
              placeholderTextColor={C.faint}
              value={noteText}
              onChangeText={setNoteText}
              onBlur={handleNoteBlur}
            />

            {todayMark === "ran" && todayBad && (
              <View style={styles.hardDayBanner}>
                <Text style={styles.hardDayText}>
                  ↳ Held on a hard day. That's the real signal — this is what
                  graduates the atomic.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.card, { alignItems: "center" }]}>
            <Text style={{ fontFamily: "monospace", color: C.amber, fontSize: 14 }}>
              All queued atomics graduated.
            </Text>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 6 }}>
              Add a new one below when you're ready — not before.
            </Text>
          </View>
        )}

        {/* HISTORY */}
        {active && (
          <View style={styles.card}>
            <Text style={styles.kicker}>LAST 21 DAYS · {active.code}</Text>
            <HistoryGrid atomicId={active.id} logs={logs} />
            <View style={styles.legendRow}>
              <Legend color={C.accent} label="held a hard day" />
              <Legend color="rgba(198,242,78,0.55)" label="ran" />
              <Legend color="rgba(255,122,102,0.22)" label="missed" />
              <Legend color="transparent" label="no entry" border />
            </View>
          </View>
        )}

        {/* QUEUE */}
        <View style={styles.card}>
          <Text style={styles.kicker}>
            QUEUE · LOCKED UNTIL THE ACTIVE ONE GRADUATES
          </Text>
          {queued.length === 0 && (
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 10 }}>
              Nothing queued.
            </Text>
          )}
          {queued.map((a) => (
            <View key={a.id} style={styles.queueItem}>
              <Text style={styles.queueCode}>{a.code}</Text>
              <Text style={styles.queueName}>{a.name}</Text>
              <Text style={{ fontFamily: "monospace", fontSize: 14, color: C.faint }}>
                🔒
              </Text>
              {!SEED_CODES.has(a.code) && (
                <TouchableOpacity onPress={() => handleRemove(a.id, a.name)}>
                  <Text style={{ color: C.faint, fontSize: 13 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <Text style={styles.queueNote}>
            ↳ One at a time, on purpose. Stacking is the overcommit trap —
            that's what this app refuses to let you do.
          </Text>
        </View>

        {/* GRADUATED */}
        {graduated.length > 0 && (
          <View style={[styles.card, { borderColor: "rgba(242,184,75,0.3)" }]}>
            <Text style={[styles.kicker, { color: C.amber }]}>
              LOCKED-IN DEFAULTS
            </Text>
            {graduated.map((a) => (
              <View key={a.id} style={styles.gradItem}>
                <Text style={[styles.queueCode, { color: C.amber }]}>
                  {a.code}
                </Text>
                <Text style={[styles.queueName, { color: C.amber }]}>
                  {a.name}
                </Text>
                <Text style={{ fontSize: 13 }}>★</Text>
              </View>
            ))}
          </View>
        )}

        {/* ADD */}
        {showAdd ? (
          <View style={styles.card}>
            <Text style={styles.kicker}>NEW ATOMIC (JOINS THE QUEUE)</Text>
            <View style={styles.addForm}>
              <TextInput
                style={styles.noteInput}
                placeholder="Short name (e.g. DEEP WORK BLOCK)"
                placeholderTextColor={C.faint}
                value={draft.name}
                onChangeText={(v) => setDraft({ ...draft, name: v })}
              />
              <TextInput
                style={styles.noteInput}
                placeholder="When… (the trigger moment)"
                placeholderTextColor={C.faint}
                value={draft.trigger}
                onChangeText={(v) => setDraft({ ...draft, trigger: v })}
              />
              <TextInput
                style={styles.noteInput}
                placeholder="Instead of… (old default)"
                placeholderTextColor={C.faint}
                value={draft.oldB}
                onChangeText={(v) => setDraft({ ...draft, oldB: v })}
              />
              <TextInput
                style={styles.noteInput}
                placeholder="→ Do… (the new move)"
                placeholderTextColor={C.faint}
                value={draft.newB}
                onChangeText={(v) => setDraft({ ...draft, newB: v })}
              />
              <View style={styles.addBtnRow}>
                <TouchableOpacity style={styles.solidBtn} onPress={handleAdd}>
                  <Text style={styles.solidBtnText}>Add to queue</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ghostBtn}
                  onPress={() => setShowAdd(false)}
                >
                  <Text style={styles.ghostBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.ghostBtn, { marginBottom: 16 }]}
            onPress={() => setShowAdd(true)}
          >
            <Text style={styles.ghostBtnText}>+ Add an atomic</Text>
          </TouchableOpacity>
        )}

        {/* Methodology */}
        <TouchableOpacity onPress={() => setShowMethod(!showMethod)}>
          <Text style={styles.methodToggle}>
            {showMethod ? "▾ why it's built this way" : "▸ why it's built this way"}
          </Text>
        </TouchableOpacity>
        {showMethod && (
          <View style={styles.methodBox}>
            <Text style={styles.methodText}>
              No consecutive-day streak — those mostly keep you hooked on the app,
              and one bad day collapses everything into guilt. Instead, charge
              accumulates and never resets to zero. A miss on a normal day stalls
              it slightly; a miss on a slammed day costs nothing. Each atomic is
              an if-then plan (the most evidence-backed way to bind a new response
              to a trigger), and it only graduates once it has held on at least two
              hard days — because surviving pressure is the real test of a default.
              One active at a time, always. For you, the edge is narrowing, not
              adding.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>data synced via Supabase</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={[styles.footerText, { textDecorationLine: "underline" }]}>
              sign out
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const SEED_CODES = new Set(["A-01", "A-02", "A-03", "A-04"]);

function Legend({ color, label, border }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
            borderWidth: border ? 1 : 0,
            borderColor: C.line,
          },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
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
  headerDate: {
    fontFamily: "monospace",
    fontSize: 11,
    color: C.muted,
  },
  headerSub: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: C.faint,
    marginTop: 5,
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 520,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 64,
  },
  card: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 16,
    padding: 17,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  kicker: {
    fontFamily: "monospace",
    fontSize: 9.5,
    letterSpacing: 1.5,
    color: C.muted,
    fontWeight: "600",
  },
  codeLabel: {
    fontFamily: "monospace",
    fontSize: 11,
    color: C.muted,
  },
  atomicName: {
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
  metricsRight: {
    flex: 1,
  },
  bigStat: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 30,
    color: C.text,
    lineHeight: 32,
  },
  stat: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 17,
    color: C.text,
  },
  statLabel: {
    fontFamily: "monospace",
    fontSize: 9.5,
    color: C.muted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  subStatsRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 12,
  },
  planBox: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  planText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 9,
    marginBottom: 11,
  },
  toggle: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
  },
  toggleText: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "600",
    color: C.muted,
  },
  badDayBtn: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 11,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 11,
  },
  badDayText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: C.muted,
    textAlign: "center",
  },
  noteInput: {
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 12,
    color: C.text,
    fontSize: 13.5,
    marginBottom: 8,
  },
  hardDayBanner: {
    marginTop: 4,
    backgroundColor: C.accentSoft,
    borderRadius: 9,
    padding: 11,
  },
  hardDayText: {
    fontFamily: "monospace",
    fontSize: 11.5,
    color: C.accent,
    letterSpacing: 0.3,
    lineHeight: 17,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 3,
  },
  legendText: {
    fontFamily: "monospace",
    fontSize: 10,
    color: C.faint,
  },
  queueItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    marginTop: 8,
    opacity: 0.78,
  },
  queueCode: {
    fontFamily: "monospace",
    fontSize: 10,
    color: C.muted,
    minWidth: 30,
  },
  queueName: {
    fontFamily: "monospace",
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.5,
    flex: 1,
    color: C.text,
  },
  queueNote: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: C.faint,
    lineHeight: 16,
    marginTop: 11,
  },
  gradItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 12,
    backgroundColor: C.amberSoft,
    borderWidth: 1,
    borderColor: "rgba(242,184,75,0.3)",
    borderRadius: 10,
    marginTop: 8,
  },
  addForm: {
    marginTop: 11,
    gap: 4,
  },
  addBtnRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 4,
  },
  solidBtn: {
    flex: 1,
    backgroundColor: C.accent,
    borderRadius: 11,
    paddingVertical: 13,
    alignItems: "center",
  },
  solidBtnText: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 12,
    color: C.bg,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 11,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  ghostBtnText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: C.muted,
    letterSpacing: 0.3,
  },
  methodToggle: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: C.faint,
    letterSpacing: 0.4,
    paddingVertical: 4,
  },
  methodBox: {
    borderLeftWidth: 2,
    borderLeftColor: C.line,
    paddingLeft: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  methodText: {
    fontSize: 12.5,
    color: C.muted,
    lineHeight: 20,
  },
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "monospace",
    fontSize: 9.5,
    color: C.faint,
  },
});
