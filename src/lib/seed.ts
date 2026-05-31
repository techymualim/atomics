import type { NewAtomicInput } from "../types/atomic";

interface SeedAtomic extends NewAtomicInput {
  code: string;
  note: string;
}

/** The starter set, in install order. Three of four reduce load — deliberate. */
export const SEED_ATOMICS: SeedAtomic[] = [
  {
    code: "A-01",
    name: "COMPRESS",
    trigger: "I'm about to start any task",
    oldBehavior: "Build the complete, impressive version",
    newBehavior:
      "Write the problem in one sentence, then ship the minimum that solves it",
    note: "Frees capacity. Install this first — everything else needs the slack.",
  },
  {
    code: "A-02",
    name: "SHIP IN PUBLIC",
    trigger: "I catch myself looping in analysis or rumination",
    oldBehavior: "Spiral inward",
    newBehavior: "Write one 5-min build-log entry from work I already did",
    note: "Redirects your analysis tendency outward into legibility.",
  },
  {
    code: "A-03",
    name: "DISPLACEMENT",
    trigger: "A new ask arrives (inside the 48h rule)",
    oldBehavior: "Ask 'is this interesting?' → say yes",
    newBehavior:
      "Ask 'what does this displace?' → default no unless it compounds",
    note: "Most opportunities look good alone and bad in a portfolio.",
  },
  {
    code: "A-04",
    name: "SHARED VERTEX",
    trigger: "I've decided to take something on",
    oldBehavior: "Take it standalone",
    newBehavior:
      "Require it shares a vertex — skill, audience, or artifact — with current work",
    note: "One effort, multiple compounding surfaces.",
  },
];

export const SEED_CODES = new Set(SEED_ATOMICS.map((s) => s.code));
