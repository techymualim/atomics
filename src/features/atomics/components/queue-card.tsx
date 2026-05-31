import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../../../lib/theme";
import { Kicker, cardStyle } from "./ui";
import type { Atomic } from "../../../types/atomic";

interface Props {
  queued: Atomic[];
  isSeed: (atomic: Atomic) => boolean;
  onRemove: (atomic: Atomic) => void;
}

export default function QueueCard({ queued, isSeed, onRemove }: Props) {
  return (
    <View style={cardStyle}>
      <Kicker>QUEUE · LOCKED UNTIL THE ACTIVE ONE GRADUATES</Kicker>
      {queued.length === 0 && (
        <Text style={styles.empty}>Nothing queued.</Text>
      )}
      {queued.map((a) => (
        <View key={a.id} style={styles.item}>
          <Text style={styles.code}>{a.code}</Text>
          <Text style={styles.name}>{a.name}</Text>
          <Text style={styles.lock}>🔒</Text>
          {!isSeed(a) && (
            <TouchableOpacity onPress={() => onRemove(a)}>
              <Text style={styles.remove}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
      <Text style={styles.note}>
        ↳ One at a time, on purpose. Stacking is the overcommit trap — that's
        what this app refuses to let you do.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { color: C.muted, fontSize: 13, marginTop: 10 },
  item: {
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
  code: { fontFamily: "monospace", fontSize: 10, color: C.muted, minWidth: 30 },
  name: {
    fontFamily: "monospace",
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.5,
    flex: 1,
    color: C.text,
  },
  lock: { fontFamily: "monospace", fontSize: 14, color: C.faint },
  remove: { color: C.faint, fontSize: 13 },
  note: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: C.faint,
    lineHeight: 16,
    marginTop: 11,
  },
});
