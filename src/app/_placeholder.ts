export const PLACEHOLDER_SIDEBAR = [
  {
    num: "02",
    title: "The Hallucination Will Be Cited",
    excerpt:
      "A field guide to the model's most confident lie: the source that sounds perfect and does not exist.",
    meta: "DISPATCH · 7 MIN",
  },
  {
    num: "03",
    title: "Prompt & Circumstance",
    excerpt:
      "We published every prompt behind this issue. Read them and judge how much was really ours.",
    meta: "DISPATCH · 5 MIN",
  },
  {
    num: "04",
    title: "A Brief History of Confidently Wrong",
    excerpt:
      "From the Delphic oracle to the autocomplete bar — humanity's long romance with the assured guess.",
    meta: "DISPATCH · 9 MIN",
  },
];

export const PLACEHOLDER_DISPATCHES = [
  {
    tag: "On Method",
    title: "How to Read a Machine That Cannot Read You Back",
    excerpt:
      "A working etiquette for collaborating with something that has opinions but no memory, no stake, and no shame.",
    min: 6,
  },
  {
    tag: "On Taste",
    title: "The Median Is Not Your Friend",
    excerpt:
      "Why a model trained on everyone's writing will, by design, hand you the most forgettable sentence available.",
    min: 8,
  },
  {
    tag: "On Labour",
    title: "Who Does the Dishes After the Renaissance?",
    excerpt:
      "The miracle does the fun part. Someone still has to check, credit, and sign. A note on the unglamorous remainder.",
    min: 7,
  },
];

export const PLACEHOLDER_TOOLS = [
  {
    title: "The Provenance Stamp",
    version: "v0.3",
    svgContent:
      '<svg width="150" height="110" viewBox="0 0 150 110" fill="none"><rect x="22" y="18" width="106" height="74" rx="3" fill="#FAF6EE" stroke="#3A2E1C" stroke-width="1.1"/><line x1="22" y1="34" x2="128" y2="34" stroke="#3A2E1C" stroke-width="0.8"/><text x="30" y="30" font-family="\'Courier Prime\', monospace" font-size="6.5" fill="#3A2E1C" opacity="0.7">PROVENANCE</text><g font-family="\'Courier Prime\', monospace" font-size="6" fill="#3A2E1C" opacity="0.55"><text x="30" y="48">AUTHOR ........</text><text x="30" y="60">MODEL .........</text><text x="30" y="72">TOKENS ........</text><text x="30" y="84">PROMPT ........</text></g><circle cx="108" cy="74" r="15" fill="none" stroke="#ED1C2E" stroke-width="1.4"/><circle cx="108" cy="74" r="11" fill="none" stroke="#ED1C2E" stroke-width="0.6" stroke-dasharray="2 2"/><text x="108" y="77" font-family="\'Cormorant Garamond\', serif" font-size="9" font-style="italic" font-weight="600" fill="#ED1C2E" text-anchor="middle">RenAI</text></svg>',
    description:
      "Paste anything a model helped you make. It returns the spec sheet — author, version, tokens, prompt — ready to print in ink.",
  },
  {
    title: "Footnote Forge",
    version: "v0.2",
    svgContent:
      '<svg width="150" height="110" viewBox="0 0 150 110" fill="none"><path d="M40 24 H110 M40 38 H110 M40 52 H92" stroke="#3A2E1C" stroke-width="1.4" stroke-linecap="round"/><text x="40" y="80" font-family="\'Courier Prime\', monospace" font-size="8" fill="#ED1C2E">[1]</text><text x="62" y="80" font-family="\'Courier Prime\', monospace" font-size="8" fill="#ED1C2E">[2]</text><text x="84" y="80" font-family="\'Courier Prime\', monospace" font-size="8" fill="#ED1C2E">[3]</text><line x1="40" y1="88" x2="110" y2="88" stroke="#3A2E1C" stroke-width="0.6"/><text x="40" y="100" font-family="\'Courier Prime\', monospace" font-size="5.5" fill="#3A2E1C" opacity="0.55">claims &#x2192; checkable sources</text></svg>',
    description:
      "Feed it a confident paragraph. It hunts down a real citation for every claim — and flags the ones it can't, instead of inventing them.",
  },
  {
    title: "The Bluff Detector",
    version: "v0.1",
    svgContent:
      '<svg width="150" height="110" viewBox="0 0 150 110" fill="none"><circle cx="62" cy="55" r="30" fill="none" stroke="#3A2E1C" stroke-width="1.2"/><line x1="84" y1="77" x2="104" y2="97" stroke="#3A2E1C" stroke-width="2.4" stroke-linecap="round"/><circle cx="62" cy="55" r="3" fill="#ED1C2E"/><path d="M48 55 Q62 42 76 55" stroke="#ED1C2E" stroke-width="1.2" fill="none" stroke-dasharray="2 2"/><text x="62" y="92" font-family="\'Courier Prime\', monospace" font-size="6" fill="#ED1C2E" text-anchor="middle">SOURCE NOT FOUND</text></svg>',
    description:
      "Reads a model's answer and underlines every spot where it sounds certain but has nothing underneath. A confidence X-ray.",
  },
];
