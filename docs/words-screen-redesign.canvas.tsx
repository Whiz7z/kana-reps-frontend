import type { CSSProperties, ReactNode } from "react";
import {
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

// ---------------------------------------------------------------------------
// Shared Washi + Dark palette (same as the other redesign canvases).
// Both keep a small 6px radius. Literal hex values are the deliverable;
// canvas host tokens only wrap the outer frames.
// ---------------------------------------------------------------------------

type VariantTokens = {
  name: string;
  subtitle: string;
  bg: string;
  surface: string;
  surfaceElevated: string;
  stroke: string;
  strokeSubtle: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentSoft: string;
  accentContrast: string;
  success: string;
  danger: string;
  kanaFont: string;
  uiFont: string;
  radius: number;
};

const WASHI: VariantTokens = {
  name: "Minimal 和紙",
  subtitle: "Warm paper, sumi ink, vermillion accent",
  bg: "#F4EEE2",
  surface: "#FBF6EB",
  surfaceElevated: "#FFFDF7",
  stroke: "#D8CFBB",
  strokeSubtle: "#E7DFCB",
  text: "#1E1A14",
  textSecondary: "#5A5141",
  textTertiary: "#8C8471",
  accent: "#B13A2F",
  accentSoft: "#F1DAD4",
  accentContrast: "#FFFDF7",
  success: "#4F7A4B",
  danger: "#B13A2F",
  kanaFont: '"Noto Serif JP", "Hiragino Mincho ProN", "Yu Mincho", serif',
  uiFont: '"Inter", "Noto Sans JP", system-ui, sans-serif',
  radius: 6,
};

const DARK: VariantTokens = {
  name: "Modern Dark",
  subtitle: "Near-black canvas, violet accent, small radius",
  bg: "#0B0C12",
  surface: "#14161F",
  surfaceElevated: "#1B1E2A",
  stroke: "#2A2E3D",
  strokeSubtle: "#20232F",
  text: "#F3F4F9",
  textSecondary: "#A6ABBE",
  textTertiary: "#6C7186",
  accent: "#8B7CFF",
  accentSoft: "#2A2649",
  accentContrast: "#0B0C12",
  success: "#4ADE80",
  danger: "#F87171",
  kanaFont: '"Zen Kaku Gothic New", "Noto Sans JP", system-ui, sans-serif',
  uiFont: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radius: 6,
};

// ---------------------------------------------------------------------------
// Illustrative data — real word lists from the app's catalog, trimmed.
// ---------------------------------------------------------------------------

type CategoryChip = { id: string; label: string; count: number };

const CATEGORIES: CategoryChip[] = [
  { id: "greetings_social", label: "Greetings Social", count: 12 },
  { id: "food_drink", label: "Food Drink", count: 12 },
  { id: "house_daily", label: "House Daily", count: 15 },
  { id: "animals_nature", label: "Animals Nature", count: 15 },
  { id: "people_pronouns", label: "People Pronouns", count: 10 },
  { id: "places_directions", label: "Places Directions", count: 11 },
  { id: "adjectives_descriptors", label: "Adjectives Descriptors", count: 15 },
  { id: "common_verbs", label: "Common Verbs", count: 15 },
  { id: "time_numbers", label: "Time Numbers", count: 10 },
];

type WordCell = {
  char: string;
  romaji: string;
  meaning: string;
  selected?: boolean;
};

type CategoryGroup = {
  id: string;
  label: string;
  expanded: boolean;
  rows: WordCell[];
};

const GREETINGS: WordCell[] = [
  { char: "こんにちは", romaji: "konnichiwa", meaning: "Hello / Good afternoon" },
  { char: "いいえ", romaji: "iie", meaning: "No", selected: true },
  { char: "おやすみ", romaji: "oyasumi", meaning: "Goodnight (informal)" },
  { char: "さようなら", romaji: "sayounara", meaning: "Goodbye", selected: true },
  { char: "どうぞ", romaji: "douzo", meaning: "Here you go / After you" },
  { char: "おはよう", romaji: "ohayou", meaning: "Good morning" },
  { char: "こんばんは", romaji: "konbanwa", meaning: "Good evening" },
  { char: "はい", romaji: "hai", meaning: "Yes" },
  { char: "ごめんなさい", romaji: "gomen nasai", meaning: "I am sorry" },
  { char: "おねがいします", romaji: "onegaishimasu", meaning: "Please (polite)" },
  { char: "ありがとう", romaji: "arigatou", meaning: "Thank you", selected: true },
  { char: "すみません", romaji: "sumimasen", meaning: "Excuse me / I'm sorry" },
];

const ANIMALS: WordCell[] = [
  { char: "あめ", romaji: "ame", meaning: "Rain" },
  { char: "やま", romaji: "yama", meaning: "Mountain", selected: true },
  { char: "さかな", romaji: "sakana", meaning: "Fish" },
  { char: "き", romaji: "ki", meaning: "Tree" },
  { char: "むし", romaji: "mushi", meaning: "Insect" },
  { char: "ねこ", romaji: "neko", meaning: "Cat", selected: true },
  { char: "さる", romaji: "saru", meaning: "Monkey" },
  { char: "うみ", romaji: "umi", meaning: "Sea / Ocean" },
  { char: "くま", romaji: "kuma", meaning: "Bear" },
  { char: "とり", romaji: "tori", meaning: "Bird" },
  { char: "はな", romaji: "hana", meaning: "Flower", selected: true },
  { char: "いぬ", romaji: "inu", meaning: "Dog" },
  { char: "ゆき", romaji: "yuki", meaning: "Snow" },
  { char: "そら", romaji: "sora", meaning: "Sky" },
  { char: "うさぎ", romaji: "usagi", meaning: "Rabbit" },
];

const OPEN_GROUPS: CategoryGroup[] = [
  {
    id: "greetings_social",
    label: "Greetings Social",
    expanded: true,
    rows: GREETINGS,
  },
  {
    id: "food_drink",
    label: "Food Drink",
    expanded: false,
    rows: [],
  },
  {
    id: "animals_nature",
    label: "Animals Nature",
    expanded: true,
    rows: ANIMALS,
  },
  {
    id: "places_directions",
    label: "Places Directions",
    expanded: false,
    rows: [],
  },
];

// ---------------------------------------------------------------------------

export default function WordsScreenRedesign() {
  const { tokens: t } = useHostTheme();
  const [focused, setFocused] = useCanvasState<"washi" | "dark">(
    "words-focused-variant",
    "washi"
  );
  const [state, setState] = useCanvasState<"categories" | "custom">(
    "words-focused-state",
    "categories"
  );
  const focusedTokens = focused === "washi" ? WASHI : DARK;

  return (
    <Stack gap={28}>
      <Stack gap={8}>
        <H1>Word Practice — Two Directions</H1>
        <Text tone="secondary">
          Theme-based word picker with a collapsible{" "}
          <Text weight="semibold">Custom words</Text> panel that contains per-
          category accordions of word cells. Key design axis here is the
          expand/collapse hierarchy — page-level detail, then category-level
          accordion, then individual word selection.
        </Text>
      </Stack>

      <H2>Side-by-side comparison</H2>
      <Grid columns={2} gap={20} align="start">
        <VariantFrame variant={WASHI} tokens={t}>
          <WordsMock variant={WASHI} />
        </VariantFrame>
        <VariantFrame variant={DARK} tokens={t}>
          <WordsMock variant={DARK} />
        </VariantFrame>
      </Grid>

      <Divider />

      <Stack gap={12}>
        <H2>Focused preview</H2>
        <Text tone="secondary">
          Toggle the variant AND the interaction state. Categories mode shows
          the categories card active with the Custom words detail collapsed.
          Custom mode flips it: the categories card dims (overridden) and the
          Custom words panel expands with two category accordions open.
        </Text>
        <Row gap={16} wrap>
          <Row gap={8}>
            <Pill
              active={focused === "washi"}
              onClick={() => setFocused("washi")}
            >
              Minimal 和紙
            </Pill>
            <Pill
              active={focused === "dark"}
              onClick={() => setFocused("dark")}
            >
              Modern Dark
            </Pill>
          </Row>
          <Row gap={8}>
            <Pill
              active={state === "categories"}
              onClick={() => setState("categories")}
            >
              Categories mode
            </Pill>
            <Pill
              active={state === "custom"}
              onClick={() => setState("custom")}
            >
              Custom words expanded
            </Pill>
          </Row>
        </Row>
        <div
          style={{
            background: focusedTokens.bg,
            borderRadius: 12,
            border: `1px solid ${t.stroke.primary}`,
            padding: 28,
          }}
        >
          <WordsFocusedMock variant={focusedTokens} state={state} />
        </div>
      </Stack>

      <Divider />

      <Stack gap={12}>
        <H2>Open accordions comparison</H2>
        <Text tone="secondary">
          Both variants rendered with the Custom words panel fully expanded and
          two categories open — Greetings Social (12) and Animals Nature (15).
          This is the state to scrutinize for the word-cell design: kana
          hierarchy, romaji · meaning line, selected fill, wrap behavior, and
          header <Code>All</Code> / <Code>Clear</Code> affordances.
        </Text>
        <Grid columns={2} gap={20} align="start">
          <VariantFrame variant={WASHI} tokens={t}>
            <MockCustomDetail
              v={WASHI}
              expanded
              selectedCount={
                GREETINGS.filter((w) => w.selected).length +
                ANIMALS.filter((w) => w.selected).length
              }
              groups={OPEN_GROUPS}
            />
          </VariantFrame>
          <VariantFrame variant={DARK} tokens={t}>
            <MockCustomDetail
              v={DARK}
              expanded
              selectedCount={
                GREETINGS.filter((w) => w.selected).length +
                ANIMALS.filter((w) => w.selected).length
              }
              groups={OPEN_GROUPS}
            />
          </VariantFrame>
        </Grid>
      </Stack>

      <Divider />

      <H2>Expandable elements</H2>
      <Grid columns={2} gap={20} align="start">
        <Stack gap={8}>
          <H3>Page-level detail</H3>
          <Text size="small" tone="secondary">
            "Custom words" is the outermost collapsible. Closed state shows the
            subtitle + a trailing Clear pill (if a selection exists) and a
            chevron. Open state reveals the inner category accordions. This is
            the highest disclosure tier — opening it is a{" "}
            <Text weight="semibold">mode switch</Text>, not just a reveal, so
            the categories card dims when custom selections exist.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Category accordion</H3>
          <Text size="small" tone="secondary">
            Inside the Custom panel, each category is its own accordion.
            Header carries <Code>{"Greetings Social (12)"}</Code> plus an{" "}
            <Code>All</Code> / <Code>Clear</Code> toggle. Chevron rotates on
            open. Open accordions stack vertically — the grid inside wraps at
            the container width.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Category chips (single-level)</H3>
          <Text size="small" tone="secondary">
            Category pills in the main Categories card are not collapsible —
            just toggleable. They display count badges in a quieter tone so
            the label reads first. Selected state fills with the accent color.
          </Text>
        </Stack>
        <Stack gap={8}>
          <H3>Word cells</H3>
          <Text size="small" tone="secondary">
            Inside each expanded category accordion, word cells show the kana
            prominently and <Code>romaji · meaning</Code> beneath in muted
            text. Selected state fills with accent. Cells wrap freely — no
            fixed column count, since words vary in length.
          </Text>
        </Stack>
      </Grid>

      <Divider />

      <H2>Token recap</H2>
      <Grid columns={2} gap={20} align="start">
        <TokenBlock variant={WASHI} />
        <TokenBlock variant={DARK} />
      </Grid>
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

function VariantFrame({
  variant,
  tokens,
  children,
}: {
  variant: VariantTokens;
  tokens: ReturnType<typeof useHostTheme>["tokens"];
  children: ReactNode;
}) {
  return (
    <Stack gap={8}>
      <Stack gap={2}>
        <Text weight="semibold">{variant.name}</Text>
        <Text size="small" tone="secondary">
          {variant.subtitle}
        </Text>
      </Stack>
      <div
        style={{
          background: variant.bg,
          borderRadius: 12,
          border: `1px solid ${tokens.stroke.primary}`,
          padding: 16,
        }}
      >
        {children}
      </div>
    </Stack>
  );
}

function WordsMock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={12}>
      <MockHeader v={v} compact />
      <MockModePicker v={v} compact />
      <MockScriptToggle v={v} compact />
      <MockCategoriesCard v={v} compact customsActive={false} />
      <MockCustomDetail
        v={v}
        compact
        expanded={false}
        selectedCount={0}
        groups={[]}
      />
      <MockBottomBar v={v} mode="categories" selectedCount={3} compact />
    </Stack>
  );
}

function WordsFocusedMock({
  variant: v,
  state,
}: {
  variant: VariantTokens;
  state: "categories" | "custom";
}) {
  const isCustom = state === "custom";
  const groups: CategoryGroup[] = [
    {
      id: "greetings_social",
      label: "Greetings Social",
      expanded: true,
      rows: GREETINGS,
    },
    {
      id: "food_drink",
      label: "Food Drink",
      expanded: false,
      rows: [],
    },
    {
      id: "house_daily",
      label: "House Daily",
      expanded: false,
      rows: [],
    },
    {
      id: "animals_nature",
      label: "Animals Nature",
      expanded: true,
      rows: ANIMALS,
    },
    {
      id: "places_directions",
      label: "Places Directions",
      expanded: false,
      rows: [],
    },
  ];
  const customSelected = GREETINGS.filter((w) => w.selected).length +
    ANIMALS.filter((w) => w.selected).length;

  return (
    <Stack gap={16}>
      <MockHeader v={v} />
      <MockModePicker v={v} />
      <MockScriptToggle v={v} />
      <MockCategoriesCard v={v} customsActive={isCustom} />
      <MockCustomDetail
        v={v}
        expanded={isCustom}
        selectedCount={isCustom ? customSelected : 0}
        groups={isCustom ? groups : []}
      />
      <MockBottomBar
        v={v}
        mode={isCustom ? "custom" : "categories"}
        selectedCount={isCustom ? customSelected : 4}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

function MockHeader({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        aria-hidden
        style={{
          width: compact ? 28 : 32,
          height: compact ? 28 : 32,
          borderRadius: v.radius,
          border: `1px solid ${v.stroke}`,
          background: v.surface,
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        ←
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: v.text,
            fontFamily: v.kanaFont,
            fontWeight: 600,
            fontSize: compact ? 16 : 22,
            letterSpacing: v === WASHI ? "-0.005em" : "-0.015em",
          }}
        >
          Word practice
        </div>
        <div
          style={{
            color: v.textSecondary,
            fontFamily: v.uiFont,
            fontSize: compact ? 11 : 13,
            marginTop: 2,
          }}
        >
          Real Japanese words grouped by theme. Pick categories or cherry-pick
          a custom list.
        </div>
      </div>
    </div>
  );
}

function MockModePicker({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <Card v={v} compact={compact}>
      <SectionLabel v={v}>Practice mode</SectionLabel>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: compact ? 8 : 10,
        }}
      >
        <ModeChip v={v} active compact={compact}>
          Kana → Romaji
        </ModeChip>
        <ModeChip v={v} compact={compact} leading={<FeatherIcon v={v} />}>
          Writing (trace)
        </ModeChip>
      </div>
    </Card>
  );
}

function MockScriptToggle({
  v,
  compact = false,
}: {
  v: VariantTokens;
  compact?: boolean;
}) {
  return (
    <Card v={v} compact={compact}>
      <SectionLabel v={v}>Script</SectionLabel>
      <div
        style={{
          display: "flex",
          background: v.bg,
          border: `1px solid ${v.strokeSubtle}`,
          borderRadius: v.radius,
          padding: 3,
          gap: 3,
        }}
      >
        <SegmentedOption v={v} active compact={compact}>
          Hiragana
        </SegmentedOption>
        <SegmentedOption v={v} compact={compact}>
          Katakana
        </SegmentedOption>
      </div>
    </Card>
  );
}

function MockCategoriesCard({
  v,
  compact = false,
  customsActive,
}: {
  v: VariantTokens;
  compact?: boolean;
  customsActive: boolean;
}) {
  const activeIds = new Set<string>(
    customsActive ? [] : ["food_drink", "places_directions"]
  );
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? 14 : 18,
        opacity: customsActive ? 0.55 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: customsActive ? 6 : 12,
        }}
      >
        <div
          style={{
            color: v.text,
            fontFamily: v.uiFont,
            fontWeight: 600,
            fontSize: compact ? 13 : 14,
          }}
        >
          Categories{" "}
          <span
            style={{
              color: v.textTertiary,
              fontWeight: 500,
            }}
          >
            (hiragana)
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <ToolbarButton v={v} primary compact={compact}>
            Select all
          </ToolbarButton>
          <ToolbarButton v={v} compact={compact}>
            Clear
          </ToolbarButton>
        </div>
      </div>
      {customsActive && (
        <div
          style={{
            color: v.textTertiary,
            fontFamily: v.uiFont,
            fontSize: 11,
            fontStyle: "italic",
            marginBottom: 10,
          }}
        >
          Custom list overrides category filters.
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: compact ? 5 : 7,
        }}
      >
        {CATEGORIES.slice(0, compact ? 6 : CATEGORIES.length).map((c) => (
          <CategoryChipEl
            key={c.id}
            v={v}
            category={c}
            active={activeIds.has(c.id)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function MockCustomDetail({
  v,
  compact = false,
  expanded,
  selectedCount,
  groups,
}: {
  v: VariantTokens;
  compact?: boolean;
  expanded: boolean;
  selectedCount: number;
  groups: CategoryGroup[];
}) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? 14 : 18,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          justifyContent: "space-between",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              color: v.text,
              fontFamily: v.uiFont,
              fontWeight: 600,
              fontSize: compact ? 13 : 14,
            }}
          >
            Custom words{" "}
            <span style={{ color: v.textTertiary, fontWeight: 500 }}>
              (hiragana)
            </span>
          </div>
          <div
            style={{
              color: v.textSecondary,
              fontFamily: v.uiFont,
              fontSize: compact ? 11 : 12,
              marginTop: 2,
            }}
          >
            Cherry-pick individual words. Overrides categories when non-empty.
            {selectedCount > 0 && (
              <>
                {" "}
                <span style={{ color: v.accent, fontWeight: 600 }}>
                  · Selected: {selectedCount}
                </span>
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {selectedCount > 0 && (
            <ToolbarButton v={v} compact={compact}>
              Clear
            </ToolbarButton>
          )}
          <Chevron v={v} expanded={expanded} />
        </div>
      </div>
      {expanded && (
        <div
          style={{
            marginTop: compact ? 10 : 14,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {groups.map((g) => (
            <CategoryAccordion key={g.id} v={v} group={g} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryAccordion({
  v,
  group,
  compact = false,
}: {
  v: VariantTokens;
  group: CategoryGroup;
  compact?: boolean;
}) {
  const count = group.rows.length > 0 ? group.rows.length : fallbackCount(group.id);
  const allOn = group.rows.length > 0 && group.rows.every((r) => r.selected);
  return (
    <div
      style={{
        background: v.surfaceElevated,
        border: `1px solid ${v.strokeSubtle}`,
        borderRadius: v.radius,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: compact ? "7px 10px" : "9px 12px",
          borderBottom: group.expanded
            ? `1px solid ${v.strokeSubtle}`
            : "1px solid transparent",
          background: group.expanded
            ? v === WASHI
              ? v.surface
              : v.surfaceElevated
            : v.surfaceElevated,
        }}
      >
        <Chevron v={v} expanded={group.expanded} small />
        <span
          style={{
            color: v.text,
            fontFamily: v.uiFont,
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            flex: 1,
          }}
        >
          {group.label}{" "}
          <span style={{ color: v.textTertiary, fontWeight: 500 }}>
            ({count})
          </span>
        </span>
        <span
          style={{
            background: allOn ? v.surfaceElevated : v.accent,
            color: allOn ? v.textSecondary : v.accentContrast,
            border: allOn ? `1px solid ${v.stroke}` : `1px solid ${v.accent}`,
            borderRadius: v.radius,
            padding: "2px 8px",
            fontFamily: v.uiFont,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          {allOn ? "Clear" : "All"}
        </span>
      </div>
      {group.expanded && group.rows.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            padding: compact ? 8 : 12,
          }}
        >
          {group.rows.map((w) => (
            <WordPill key={w.char} v={v} word={w} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
}

function WordPill({
  v,
  word,
  compact = false,
}: {
  v: VariantTokens;
  word: WordCell;
  compact?: boolean;
}) {
  const selected = !!word.selected;
  const style: CSSProperties = selected
    ? {
        background: v.accent,
        border: `1px solid ${v.accent}`,
        color: v.accentContrast,
      }
    : {
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        color: v.text,
      };
  return (
    <div
      style={{
        ...style,
        borderRadius: v.radius,
        padding: compact ? "6px 10px" : "8px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 1,
        minWidth: 0,
      }}
    >
      <span
        style={{
          fontFamily: v.kanaFont,
          fontWeight: 500,
          fontSize: compact ? 14 : 16,
          lineHeight: 1.1,
        }}
      >
        {word.char}
      </span>
      <span
        style={{
          fontFamily: v.uiFont,
          fontSize: compact ? 10 : 11,
          opacity: selected ? 0.85 : 0.7,
          marginTop: 2,
        }}
      >
        {word.romaji} · {word.meaning}
      </span>
    </div>
  );
}

function MockBottomBar({
  v,
  mode,
  selectedCount,
  compact = false,
}: {
  v: VariantTokens;
  mode: "categories" | "custom";
  selectedCount: number;
  compact?: boolean;
}) {
  const disabled = selectedCount === 0;
  const label = disabled
    ? "Pick at least one category"
    : mode === "custom"
      ? `Start practice · ${selectedCount} word${selectedCount === 1 ? "" : "s"}`
      : "Start practice";
  return (
    <div
      style={{
        background: v.surface,
        borderTop: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? "10px 12px" : "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          color: v.textSecondary,
          fontFamily: v.uiFont,
          fontSize: compact ? 11 : 13,
          flex: 1,
        }}
      >
        {mode === "custom" ? (
          <>
            <span style={{ color: v.text, fontWeight: 600 }}>Custom</span>
            {" · overrides categories"}
          </>
        ) : (
          <>
            <span style={{ color: v.text, fontWeight: 600 }}>
              {selectedCount}
            </span>{" "}
            {selectedCount === 1 ? "category" : "categories"} selected
          </>
        )}
      </div>
      <div
        style={{
          background: disabled ? v.stroke : v.accent,
          color: disabled ? v.textTertiary : v.accentContrast,
          fontFamily: v.uiFont,
          fontWeight: 700,
          fontSize: compact ? 12 : 14,
          padding: compact ? "8px 14px" : "11px 20px",
          borderRadius: v.radius,
          letterSpacing: 0.2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function Card({
  v,
  compact,
  children,
}: {
  v: VariantTokens;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: v.surface,
        border: `1px solid ${v.stroke}`,
        borderRadius: v.radius,
        padding: compact ? 14 : 18,
      }}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  v,
  children,
}: {
  v: VariantTokens;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        color: v.textTertiary,
        fontFamily: v.uiFont,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function ModeChip({
  v,
  active = false,
  compact = false,
  leading,
  children,
}: {
  v: VariantTokens;
  active?: boolean;
  compact?: boolean;
  leading?: ReactNode;
  children: ReactNode;
}) {
  const style: CSSProperties = active
    ? {
        background: v.accent,
        color: v.accentContrast,
        border: `1px solid ${v.accent}`,
      }
    : {
        background: v.surfaceElevated,
        color: v.textSecondary,
        border: `1px solid ${v.stroke}`,
      };
  return (
    <div
      style={{
        ...style,
        borderRadius: v.radius,
        padding: compact ? "10px 12px" : "14px 16px",
        fontFamily: v.uiFont,
        fontSize: compact ? 13 : 14,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      {leading}
      {children}
    </div>
  );
}

function SegmentedOption({
  v,
  active = false,
  compact = false,
  children,
}: {
  v: VariantTokens;
  active?: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = active
    ? {
        background: v.surfaceElevated,
        color: v.text,
        border: `1px solid ${v.stroke}`,
      }
    : {
        background: "transparent",
        color: v.textSecondary,
        border: "1px solid transparent",
      };
  return (
    <div
      style={{
        ...style,
        flex: 1,
        textAlign: "center",
        borderRadius: v.radius - 2,
        padding: compact ? "8px 10px" : "10px 14px",
        fontFamily: v.uiFont,
        fontSize: compact ? 12 : 13,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function CategoryChipEl({
  v,
  category,
  active,
  compact,
}: {
  v: VariantTokens;
  category: CategoryChip;
  active: boolean;
  compact?: boolean;
}) {
  const style: CSSProperties = active
    ? {
        background: v.accent,
        color: v.accentContrast,
        border: `1px solid ${v.accent}`,
      }
    : {
        background: v.surfaceElevated,
        color: v.textSecondary,
        border: `1px solid ${v.stroke}`,
      };
  return (
    <span
      style={{
        ...style,
        borderRadius: 999,
        padding: compact ? "5px 10px" : "6px 12px",
        fontFamily: v.uiFont,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
      }}
    >
      {category.label}
      <span
        style={{
          opacity: active ? 0.8 : 0.6,
          fontWeight: 500,
        }}
      >
        ({category.count})
      </span>
    </span>
  );
}

function ToolbarButton({
  v,
  primary = false,
  compact = false,
  children,
}: {
  v: VariantTokens;
  primary?: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  const style: CSSProperties = primary
    ? {
        background: v.accent,
        color: v.accentContrast,
        border: `1px solid ${v.accent}`,
      }
    : {
        background: v.surfaceElevated,
        color: v.textSecondary,
        border: `1px solid ${v.stroke}`,
      };
  return (
    <span
      style={{
        ...style,
        borderRadius: v.radius,
        padding: compact ? "4px 10px" : "6px 12px",
        fontFamily: v.uiFont,
        fontSize: compact ? 11 : 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function Chevron({
  v,
  expanded,
  small = false,
}: {
  v: VariantTokens;
  expanded: boolean;
  small?: boolean;
}) {
  const size = small ? 10 : 14;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={small ? v.accent : v.textSecondary}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
        flexShrink: 0,
      }}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FeatherIcon({ v }: { v: VariantTokens }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={v.textSecondary}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

function fallbackCount(id: string): number {
  const entry = CATEGORIES.find((c) => c.id === id);
  return entry?.count ?? 10;
}

// ---------------------------------------------------------------------------
// Token recap
// ---------------------------------------------------------------------------

function TokenBlock({ variant: v }: { variant: VariantTokens }) {
  return (
    <Stack gap={12}>
      <H3>{v.name}</H3>
      <SwatchStrip v={v} />
      <Table
        headers={["Token", "Role", "Value"]}
        rows={[
          [<Code>bg</Code>, "Page background", v.bg],
          [<Code>surface</Code>, "Cards, panels", v.surface],
          [<Code>surface.elev</Code>, "Accordion interiors", v.surfaceElevated],
          [<Code>accent</Code>, "Active chip, CTA, All button", v.accent],
          [<Code>stroke</Code>, "Card borders", v.stroke],
          [<Code>text.primary</Code>, "Titles, kana", v.text],
          [<Code>text.secondary</Code>, "Subtitles, body", v.textSecondary],
          [<Code>text.tertiary</Code>, "Counts, section labels", v.textTertiary],
        ]}
        columnAlign={["left", "left", "right"]}
      />
    </Stack>
  );
}

function SwatchStrip({ v }: { v: VariantTokens }) {
  const swatches: { name: string; color: string }[] = [
    { name: "bg", color: v.bg },
    { name: "surf", color: v.surface },
    { name: "elev", color: v.surfaceElevated },
    { name: "stroke", color: v.stroke },
    { name: "text", color: v.text },
    { name: "accent", color: v.accent },
    { name: "soft", color: v.accentSoft },
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {swatches.map((s) => (
        <Swatch key={s.name} v={v} color={s.color} label={s.name} />
      ))}
    </div>
  );
}

function Swatch({
  v,
  color,
  label,
}: {
  v: VariantTokens;
  color: string;
  label: string;
}) {
  return (
    <Stack gap={4} style={{ alignItems: "center" }}>
      <div
        aria-hidden
        style={{
          background: color,
          width: 44,
          height: 28,
          borderRadius: 4,
          border: `1px solid ${v.stroke}`,
        }}
      />
      <Text size="small" tone="tertiary">
        {label}
      </Text>
    </Stack>
  );
}
