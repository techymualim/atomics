import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { C } from "../../../lib/theme";
import OnboardingSlide, { Slide } from "../components/onboarding-slide";

const SLIDES: Slide[] = [
  {
    badge: "THE IDEA",
    title: "Swap one default,\nnot ten habits.",
    body: "An atomic is a single trigger → response you run without thinking. You don't stack new habits — you replace the behavior in a slot you already have. Load stays flat; defaults change for free.",
  },
  {
    badge: "EVERY DAY",
    title: "Run the move,\nthen log it.",
    body: "When the trigger fires, do the new move. Tap ✓ Ran or ✕ Missed. That's the whole ritual — a few seconds. Charge builds up and never resets to zero, so one off day can't erase your progress.",
    accent: C.accent,
  },
  {
    badge: "HARD DAYS",
    title: "Surviving a slammed\nday is the real win.",
    body: "Mark a brutal day as ⚡ SLAMMED and a successful check-in counts double. A miss on a slammed day costs nothing — life happened. Holding under pressure is what proves the swap became a default.",
    accent: C.bad,
  },
  {
    badge: "ONE AT A TIME",
    title: "The queue stays\nlocked. On purpose.",
    body: "Only one atomic installs at a time. It graduates once it's fully charged and has held on at least two hard days — then the next one unlocks. Stacking is the overcommit trap, so the app simply won't let you.",
    accent: C.amber,
  },
];

export default function OnboardingView({ onDone }: { onDone: () => void }) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      onDone();
    }
  };

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <View style={styles.dot} />
          <Text style={styles.brandText}>ATOMICS</Text>
        </View>
        {!isLast && (
          <TouchableOpacity onPress={onDone}>
            <Text style={styles.skip}>skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <OnboardingSlide slide={item} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.pageDot,
                i === index && styles.pageDotActive,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.cta} onPress={next}>
          <Text style={styles.ctaText}>{isLast ? "Get started" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: 60, paddingBottom: 40 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  brandText: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 1,
    color: C.text,
  },
  skip: { fontFamily: "monospace", fontSize: 12, color: C.muted },
  footer: { paddingHorizontal: 24 },
  dots: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginBottom: 22,
  },
  pageDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: C.line,
  },
  pageDotActive: { backgroundColor: C.accent, width: 20 },
  cta: {
    backgroundColor: C.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 14,
    color: C.bg,
  },
});
