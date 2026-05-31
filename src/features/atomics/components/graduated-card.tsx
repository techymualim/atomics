import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../../../lib/theme";
import { Kicker, cardStyle } from "./ui";
import type { Atomic } from "../../../types/atomic";

export default function GraduatedCard({ graduated }: { graduated: Atomic[] }) {
  if (graduated.length === 0) return null;

  return (
    <View style={[cardStyle, { borderColor: "rgba(242,184,75,0.3)" }]}>
      <Kicker color={C.amber}>LOCKED-IN DEFAULTS</Kicker>
      {graduated.map((a) => (
        <View key={a.id} style={styles.item}>
          <Text style={styles.code}>{a.code}</Text>
          <Text style={styles.name}>{a.name}</Text>
          <Text style={styles.star}>★</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
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
  code: { fontFamily: "monospace", fontSize: 10, color: C.amber, minWidth: 30 },
  name: {
    fontFamily: "monospace",
    fontSize: 12.5,
    fontWeight: "600",
    letterSpacing: 0.5,
    flex: 1,
    color: C.amber,
  },
  star: { fontSize: 13, color: C.amber },
});
