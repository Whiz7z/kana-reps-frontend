import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { KanaStrokeHintPayload, KanaSvgJson } from "@/lib/kanaStrokeData";

const VIEWBOX_SIZE = 1024;

/** Wider column / narrow column ≈ 3 / 1.15 — boost labels in the small slot so they stay legible on screen. */
const YOON_SECOND_GLYPH_MARKER_SCALE = 2.45;

function sortByNumericId<T extends { id: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => Number(a.id) - Number(b.id));
}

type SvgProps = {
  data: KanaSvgJson;
  /** Add to each median label so yoon strokes are 1…n across glyphs. */
  strokeLabelOffset: number;
  /** Multiplier for circle + text in viewBox units (compensates for narrower flex column). */
  strokeMarkerScale?: number;
};

function HintGlyphSvg({ data, strokeLabelOffset, strokeMarkerScale = 1 }: SvgProps) {
  const strokes = useMemo(() => sortByNumericId(data.strokes), [data]);
  const medians = useMemo(() => sortByNumericId(data.medians), [data]);
  const r = 38 * strokeMarkerScale;
  const fontSize = 52 * strokeMarkerScale;

  return (
    <svg
      className="block h-full max-h-full w-full"
      viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <g fill="var(--practice-text-tertiary)" fillOpacity={0.26}>
        {strokes.map((s) => (
          <path key={s.id} d={s.value} />
        ))}
      </g>
      {medians.map((m) => {
        const start = m.value[0];
        if (!start) return null;
        const [x, y] = start;
        const local = Number(m.id);
        if (!Number.isFinite(local)) return null;
        const label = local + strokeLabelOffset;
        return (
          <g key={`stroke-num-${m.id}`}>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill="var(--practice-surface-elev)"
              fillOpacity={0.92}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--practice-text)"
              fillOpacity={0.88}
              fontSize={fontSize}
              fontWeight={600}
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type Props = {
  payload: KanaStrokeHintPayload;
};

export function KanaStrokeHint({ payload }: Props) {
  if (payload.layout === "single") {
    return (
      <div className="flex h-full min-h-0 w-full items-stretch justify-center">
        <div className="min-h-0 min-w-0 flex-1">
          <HintGlyphSvg data={payload.data} strokeLabelOffset={0} />
        </div>
      </div>
    );
  }

  const { parts } = payload;
  let offset = 0;
  return (
    <div className="flex h-full min-h-0 w-full flex-row items-stretch justify-center gap-0.5 px-0.5">
      {parts.map((part, i) => {
        const strokeLabelOffset = offset;
        offset += part.strokes.length;
        const flexClass =
          parts.length === 2
            ? i === 0
              ? "flex-[3] min-h-0 min-w-0"
              : "flex-[1.15] min-h-0 min-w-0"
            : "min-h-0 min-w-0 flex-1";
        const markerScale =
          parts.length === 2 && i === 1 ? YOON_SECOND_GLYPH_MARKER_SCALE : 1;
        return (
          <div key={i} className={cn("flex items-stretch justify-center", flexClass)}>
            <HintGlyphSvg
              data={part}
              strokeLabelOffset={strokeLabelOffset}
              strokeMarkerScale={markerScale}
            />
          </div>
        );
      })}
    </div>
  );
}
