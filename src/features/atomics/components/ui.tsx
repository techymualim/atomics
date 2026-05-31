import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "../../../lib/theme";

export function Kicker({
  children,
  color,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return <Text style={[styles.kicker, color ? { color } : null]}>{children}</Text>;
}

export function Stat({
  value,
  label,
  big,
  hot,
}: {
  value: string;
  label: string;
  big?: boolean;
  hot?: boolean;
}) {
  return (
    <View>
      <Text
        style={[
          styles.statValue,
          { fontSize: big ? 30 : 17 },
          hot ? { color: C.accent } : null,
        ]}
      >
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function Legend({
  color,
  label,
  border,
}: {
  color: string;
  label: string;
  border?: boolean;
}) {
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

export const cardStyle = {
  backgroundColor: C.surface,
  borderWidth: 1,
  borderColor: C.line,
  borderRadius: 16,
  padding: 17,
  marginBottom: 16,
} as const;

const styles = StyleSheet.create({
  kicker: {
    fontFamily: "monospace",
    fontSize: 9.5,
    letterSpacing: 1.5,
    color: C.muted,
    fontWeight: "600",
  },
  statValue: {
    fontFamily: "monospace",
    fontWeight: "700",
    color: C.text,
  },
  statLabel: {
    fontFamily: "monospace",
    fontSize: 9.5,
    color: C.muted,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 11, height: 11, borderRadius: 3 },
  legendText: { fontFamily: "monospace", fontSize: 10, color: C.faint },
});
