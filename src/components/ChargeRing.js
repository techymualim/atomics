import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { C } from "../lib/constants";

const R = 46;
const CIRC = 2 * Math.PI * R;

export default function ChargeRing({ pct }) {
  const spin = useRef(new Animated.Value(0)).current;
  const offset = CIRC - (pct / 100) * CIRC;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [spin]);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Svg width={112} height={112} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={56}
          cy={56}
          r={R}
          fill="none"
          stroke={C.line}
          strokeWidth={7}
        />
        <Circle
          cx={56}
          cy={56}
          r={R}
          fill="none"
          stroke={C.accent}
          strokeWidth={7}
          strokeLinecap="round"
          strokeDasharray={`${CIRC}`}
          strokeDashoffset={offset}
        />
      </Svg>
      <Animated.View
        style={[styles.orbit, { transform: [{ rotate }] }]}
      >
        <View style={styles.electron} />
      </Animated.View>
      <View style={styles.label}>
        <Animated.Text style={styles.labelText}>nucleus</Animated.Text>
        <Animated.Text style={styles.labelSub}>→ 100%</Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 112,
    height: 112,
    position: "relative",
  },
  orbit: {
    position: "absolute",
    width: 112,
    height: 112,
  },
  electron: {
    position: "absolute",
    top: 4,
    left: 52.5,
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: C.accent,
  },
  label: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    fontFamily: "monospace",
    fontSize: 11,
    color: C.muted,
  },
  labelSub: {
    fontFamily: "monospace",
    fontSize: 9,
    color: C.faint,
    marginTop: 2,
  },
});
