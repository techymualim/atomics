import React from "react";
import { View, Text, StyleSheet, useWindowDimensions } from "react-native";
import { C } from "../../../lib/theme";

export interface Slide {
  badge: string;
  title: string;
  body: string;
  accent?: string;
}

export default function OnboardingSlide({ slide }: { slide: Slide }) {
  const { width } = useWindowDimensions();
  const accent = slide.accent ?? C.accent;
  return (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.badge, { borderColor: accent }]}>
        <Text style={[styles.badgeText, { color: accent }]}>{slide.badge}</Text>
      </View>
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    paddingHorizontal: 36,
    alignItems: "flex-start",
    justifyContent: "center",
    flex: 1,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 22,
  },
  badgeText: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "700",
  },
  title: {
    fontFamily: "monospace",
    fontSize: 26,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
    lineHeight: 32,
    marginBottom: 16,
  },
  body: {
    fontSize: 15,
    color: C.muted,
    lineHeight: 24,
  },
});
