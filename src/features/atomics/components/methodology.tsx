import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { C } from "../../../lib/theme";

export default function Methodology() {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen((v) => !v)}>
        <Text style={styles.toggle}>
          {open ? "▾ why it's built this way" : "▸ why it's built this way"}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.box}>
          <Text style={styles.text}>
            No consecutive-day streak — those mostly keep you hooked on the app,
            and one bad day collapses everything into guilt. Instead, charge
            accumulates and never resets to zero. A miss on a normal day stalls
            it slightly; a miss on a slammed day costs nothing. Each atomic is an
            if-then plan (the most evidence-backed way to bind a new response to
            a trigger), and it only graduates once it has held on at least two
            hard days — because surviving pressure is the real test of a default.
            One active at a time, always. For you, the edge is narrowing, not
            adding.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    fontFamily: "monospace",
    fontSize: 10.5,
    color: C.faint,
    letterSpacing: 0.4,
    paddingVertical: 4,
  },
  box: {
    borderLeftWidth: 2,
    borderLeftColor: C.line,
    paddingLeft: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  text: { fontSize: 12.5, color: C.muted, lineHeight: 20 },
});
