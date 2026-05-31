import React from "react";
import { View, StyleSheet } from "react-native";
import { C } from "../lib/constants";
import { lastNDates } from "../lib/dates";

export default function HistoryGrid({ atomicId, logs }) {
  const dates = lastNDates(21);

  return (
    <View style={styles.grid}>
      {dates.map((d) => {
        const entry = logs.find(
          (l) => l.atomic_id === atomicId && l.date === d
        );
        const status = entry?.status;
        const bad = entry?.bad_day;

        let bg = "transparent";
        let border = C.line;
        if (status === "ran" && bad) bg = C.accent;
        else if (status === "ran") bg = "rgba(198,242,78,0.55)";
        else if (status === "missed" && bad) bg = C.surface2;
        else if (status === "missed") bg = "rgba(255,122,102,0.22)";

        return (
          <View
            key={d}
            style={[
              styles.dot,
              {
                backgroundColor: bg,
                borderColor: border,
                ...(status === "ran" && bad ? { shadowColor: C.accent, shadowOpacity: 0.6, shadowRadius: 4, elevation: 4 } : {}),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 12,
  },
  dot: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1,
  },
});
