export const C = {
  bg: "#0C0D0E",
  surface: "#15171A",
  surface2: "#1B1E22",
  line: "#272B31",
  text: "#ECEDEE",
  muted: "#80868D",
  faint: "#4A4F55",
  accent: "#C6F24E",
  accentSoft: "rgba(198,242,78,0.14)",
  amber: "#F2B84B",
  amberSoft: "rgba(242,184,75,0.14)",
  bad: "#FF7A66",
};

export const SEED_ATOMICS = [
  {
    code: "A-01",
    name: "COMPRESS",
    trigger: "I'm about to start any task",
    old_behavior: "Build the complete, impressive version",
    new_behavior:
      "Write the problem in one sentence, then ship the minimum that solves it",
    note: "Frees capacity. Install this first — everything else needs the slack.",
  },
  {
    code: "A-02",
    name: "SHIP IN PUBLIC",
    trigger: "I catch myself looping in analysis or rumination",
    old_behavior: "Spiral inward",
    new_behavior: "Write one 5-min build-log entry from work I already did",
    note: "Redirects your analysis tendency outward into legibility.",
  },
  {
    code: "A-03",
    name: "DISPLACEMENT",
    trigger: "A new ask arrives (inside the 48h rule)",
    old_behavior: "Ask 'is this interesting?' → say yes",
    new_behavior:
      "Ask 'what does this displace?' → default no unless it compounds",
    note: "Most opportunities look good alone and bad in a portfolio.",
  },
  {
    code: "A-04",
    name: "SHARED VERTEX",
    trigger: "I've decided to take something on",
    old_behavior: "Take it standalone",
    new_behavior:
      "Require it shares a vertex — skill, audience, or artifact — with current work",
    note: "One effort, multiple compounding surfaces.",
  },
];
