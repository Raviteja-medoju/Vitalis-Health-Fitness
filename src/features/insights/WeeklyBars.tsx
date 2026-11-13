import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { Text, useTheme } from '@/design-system';
import { weekdayShort, type DayKey } from '@/lib/date';

export interface WeeklyBarsProps {
  title: string;
  unit: string;
  data: { day: DayKey; value: number }[];
  goal?: number;
  color: string;
  format?: (v: number) => string;
}

/**
 * Single-series weekly bar chart (magnitude over time).
 * - One series -> no legend; the title names it.
 * - Thin bars, 4px rounded data-ends anchored at the baseline, 2px surface gaps.
 * - Goal line is a dashed reference, not a second series.
 * - Tap/press a bar to show its value (hover layer); a table view sits below for AT & print.
 */
export function WeeklyBars({
  title,
  unit,
  data,
  goal,
  color,
  format = (v) => Math.round(v).toLocaleString(),
}: WeeklyBarsProps) {
  const { colors, spacing, radii, typography } = useTheme();
  const [width, setWidth] = useState(280);
  const [selected, setSelected] = useState<number | null>(data.length - 1);
  const [table, setTable] = useState(false);

  const height = 160;
  const padTop = 24;
  const padBottom = 24;
  const plotH = height - padTop - padBottom;
  const max = useMemo(() => Math.max(goal ?? 0, ...data.map((d) => d.value), 1), [data, goal]);
  const slot = width / Math.max(data.length, 1);
  const barW = Math.max(1, Math.min(28, slot - 8));
  const y = (v: number) => padTop + plotH - (v / max) * plotH;
  const today = data.length - 1;

  const summary = `${title}: ${data.map((d) => `${weekdayShort(d.day)} ${format(d.value)}`).join(', ')}${goal ? `. Goal ${format(goal)} ${unit}` : ''}.`;

  return (
    <View
      style={{ gap: spacing['3'] }}
      onLayout={(event) => setWidth(Math.max(1, event.nativeEvent.layout.width))}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text variant="subhead" heading={2}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={table ? 'Show chart' : 'Show table'}
          onPress={() => setTable((t) => !t)}
          hitSlop={8}
          style={{ minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'center' }}
        >
          <Text variant="label" color="link">
            {table ? 'Chart' : 'Table'}
          </Text>
        </Pressable>
      </View>

      {table ? (
        <View
          accessibilityRole="list"
          style={{
            borderRadius: radii.md,
            borderWidth: 1,
            borderColor: colors.border.default,
            overflow: 'hidden',
          }}
        >
          {data.map((d, i) => (
            <View
              key={d.day}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: spacing['3'],
                paddingVertical: spacing['2'],
                backgroundColor: i % 2 ? colors.bg.subtle : colors.bg.surface,
              }}
            >
              <Text variant="label" color="secondary">
                {weekdayShort(d.day)} {d.day.slice(5)}
              </Text>
              <Text variant="label">
                {format(d.value)} {unit}
                {goal ? (d.value >= goal ? ' ✓' : '') : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View accessible accessibilityRole="image" accessibilityLabel={summary}>
          <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* recessive baseline */}
            <Line
              x1={0}
              x2={width}
              y1={padTop + plotH}
              y2={padTop + plotH}
              stroke={colors.border.default}
              strokeWidth={1}
            />
            {goal ? (
              <>
                <Line
                  x1={0}
                  x2={width}
                  y1={y(goal)}
                  y2={y(goal)}
                  stroke={colors.fg.muted}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  fontFamily="sans-serif"
                  x={width}
                  y={y(goal) - 4}
                  fontSize={typography.caption.fontSize}
                  fill={colors.fg.muted}
                  textAnchor="end"
                >
                  goal {format(goal)}
                </SvgText>
              </>
            ) : null}
            {data.map((d, i) => {
              const x = i * slot + (slot - barW) / 2;
              const top = y(d.value);
              const h = Math.max(0, padTop + plotH - top);
              const isSel = selected === i;
              return (
                <React.Fragment key={d.day}>
                  {/* 2px surface gap is implicit via slot spacing; rounded data end anchored at baseline */}
                  <Rect
                    x={x}
                    y={top}
                    width={barW}
                    height={h}
                    rx={4}
                    fill={color}
                    opacity={selected == null || isSel ? 1 : 0.55}
                  />
                  <Rect
                    x={x}
                    y={padTop + plotH - Math.min(4, h)}
                    width={barW}
                    height={Math.min(4, h)}
                    fill={color}
                    opacity={selected == null || isSel ? 1 : 0.55}
                  />
                  {isSel ? (
                    <SvgText
                      fontFamily="sans-serif"
                      x={x + barW / 2}
                      y={Math.max(12, top - 6)}
                      fontSize={typography.caption.fontSize}
                      fontWeight="600"
                      fill={colors.fg.primary}
                      textAnchor="middle"
                    >
                      {format(d.value)}
                    </SvgText>
                  ) : null}
                  <SvgText
                    fontFamily="sans-serif"
                    x={x + barW / 2}
                    y={height - 6}
                    fontSize={typography.caption.fontSize}
                    fontWeight={i === today ? '700' : '400'}
                    fill={i === today ? colors.fg.primary : colors.fg.muted}
                    textAnchor="middle"
                  >
                    {weekdayShort(d.day).slice(0, 2)}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </Svg>
          {/* Hit targets larger than the marks */}
          <View
            style={{ position: 'absolute', left: 0, top: 0, width, height, flexDirection: 'row' }}
            importantForAccessibility="no-hide-descendants"
          >
            {data.map((d, i) => (
              <Pressable
                key={d.day}
                onPress={() => setSelected(i)}
                style={{ width: slot, height }}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
