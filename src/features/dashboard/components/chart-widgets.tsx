"use client";

import { useMemo } from "react";
import type { EChartsOption } from "echarts";

import { useTheme } from "@/hooks/use-theme";

import type {
    ActivityPoint,
    ContributorStat,
    PrioritySlice,
    StatusSlice,
} from "../types";
import { baseChartStyles, readChartPalette } from "../lib/chart-theme";

import { EChart } from "./echart";

/**
 * Every widget here is drawn on the analytics night band. Counts are not
 * people, so the series use lime, paper and neutrals from `readChartPalette()`
 * and never a presence hue.
 */

export interface CompletionGaugeProps {
    completionRate: number;
    tasksDone: number;
    tasksTotal: number;
}

/** Share of the board that has reached Done, as a lime arc on a half dial. */
export function CompletionGauge({
    completionRate,
    tasksDone,
    tasksTotal,
}: CompletionGaugeProps) {
    const { resolvedTheme } = useTheme();

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);

        return {
            textStyle: base.textStyle,
            series: [
                {
                    type: "gauge",
                    startAngle: 180,
                    endAngle: 0,
                    min: 0,
                    max: 100,
                    radius: "96%",
                    center: ["50%", "68%"],
                    progress: {
                        show: true,
                        width: 18,
                        roundCap: true,
                        itemStyle: { color: palette.accent },
                    },
                    axisLine: {
                        roundCap: true,
                        lineStyle: { width: 18, color: [[1, palette.track]] },
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    pointer: { show: false },
                    anchor: { show: false },
                    title: {
                        offsetCenter: [0, "30%"],
                        color: palette.muted,
                        fontFamily: palette.fontSans,
                        fontSize: 14,
                    },
                    detail: {
                        offsetCenter: [0, "-14%"],
                        formatter: "{value}%",
                        color: palette.strong,
                        fontFamily: palette.fontSans,
                        fontSize: 44,
                        fontWeight: 800,
                    },
                    data: [
                        {
                            value: completionRate,
                            name: `${tasksDone} of ${tasksTotal} tasks done`,
                        },
                    ],
                },
            ],
        };
    }, [completionRate, tasksDone, tasksTotal, resolvedTheme]);

    return (
        <EChart
            option={option}
            height={240}
            testId="chart-completion-rate"
            ariaLabel={`Task completion rate: ${completionRate}% — ${tasksDone} of ${tasksTotal} tasks done`}
        />
    );
}

export interface ActivityChartProps {
    points: ActivityPoint[];
}

/** Daily workspace activity across tasks, documents and chat. */
export function ActivityChart({ points }: ActivityChartProps) {
    const { resolvedTheme } = useTheme();

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);
        const labels = points.map((point) => point.label);

        // Lime leads; the rest recede in order. Documents are dashed so the
        // two neutral lines differ by more than lightness alone.
        const series = [
            {
                name: "Tasks created",
                data: points.map((point) => point.tasksCreated),
                color: palette.accent,
                width: 3,
                dashed: false,
                area: true,
            },
            {
                name: "Tasks completed",
                data: points.map((point) => point.tasksCompleted),
                color: palette.strong,
                width: 2.2,
                dashed: false,
                area: false,
            },
            {
                name: "Documents",
                data: points.map((point) => point.documents),
                color: palette.muted,
                width: 2,
                dashed: true,
                area: false,
            },
            {
                name: "Messages",
                data: points.map((point) => point.messages),
                color: palette.faint,
                width: 2,
                dashed: false,
                area: false,
            },
        ];

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "axis" },
            legend: {
                ...base.legend,
                bottom: undefined,
                top: 0,
                left: 0,
                icon: "roundRect",
                itemWidth: 16,
                itemHeight: 3,
            },
            grid: {
                top: 44,
                left: 4,
                right: 12,
                bottom: 4,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: labels,
                boundaryGap: false,
                axisLine: base.axisLine,
                axisTick: { show: false },
                axisLabel: { ...base.axisLabel, hideOverlap: true },
            },
            yAxis: {
                type: "value",
                minInterval: 1,
                axisLine: { show: false },
                splitLine: base.splitLine,
                axisLabel: base.axisLabel,
            },
            series: series.map((entry) => ({
                name: entry.name,
                type: "line",
                showSymbol: false,
                lineStyle: {
                    width: entry.width,
                    color: entry.color,
                    type: entry.dashed ? "dashed" : "solid",
                },
                itemStyle: { color: entry.color },
                areaStyle: entry.area
                    ? { color: entry.color, opacity: 0.14 }
                    : undefined,
                data: entry.data,
            })),
        };
    }, [points, resolvedTheme]);

    const totals = points.reduce(
        (sum, point) =>
            sum +
            point.tasksCreated +
            point.tasksCompleted +
            point.documents +
            point.messages,
        0,
    );

    return (
        <EChart
            option={option}
            height={300}
            testId="chart-activity"
            ariaLabel={`Workspace activity over ${points.length} days, ${totals} events in total`}
        />
    );
}

/** One colour per status, read from the chart tokens so the HTML legend matches. */
const STATUS_TOKENS = {
    TODO: "muted",
    IN_PROGRESS: "strong",
    DONE: "accent",
} as const;

export interface StatusDonutProps {
    slices: StatusSlice[];
}

/** Current distribution of tasks across the Kanban columns. */
export function StatusDonut({ slices }: StatusDonutProps) {
    const { resolvedTheme } = useTheme();
    const total = slices.reduce((sum, slice) => sum + slice.count, 0);

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "item" },
            title: {
                text: String(total),
                subtext: "tasks",
                left: "center",
                top: "middle",
                itemGap: 2,
                textStyle: {
                    color: palette.strong,
                    fontFamily: palette.fontSans,
                    fontSize: 32,
                    fontWeight: 800,
                },
                subtextStyle: {
                    color: palette.muted,
                    fontFamily: palette.fontMono,
                    fontSize: 11,
                },
            },
            series: [
                {
                    type: "pie",
                    radius: ["58%", "92%"],
                    center: ["50%", "50%"],
                    itemStyle: {
                        borderColor: palette.surface,
                        borderWidth: 3,
                    },
                    label: { show: false },
                    emphasis: { scale: false },
                    data: slices.map((slice) => ({
                        name: slice.label,
                        value: slice.count,
                        itemStyle: {
                            color: palette[STATUS_TOKENS[slice.status]],
                        },
                    })),
                },
            ],
        };
    }, [slices, total, resolvedTheme]);

    const summary = slices
        .map((slice) => `${slice.label}: ${slice.count}`)
        .join(", ");

    return (
        <div className="flex flex-wrap items-center gap-5">
            <EChart
                option={option}
                height={170}
                className="w-[170px] shrink-0"
                testId="chart-status"
                ariaLabel={`Task status distribution — ${summary}`}
            />
            {/* The chart is an image; this list is the same data as text. */}
            <ul
                aria-hidden="true"
                className="m-0 flex min-w-36 flex-1 list-none flex-col gap-2.5 p-0 text-sm"
            >
                {slices.map((slice) => (
                    <li
                        key={slice.status}
                        className="flex items-center gap-2.5"
                    >
                        <span
                            className="size-3 shrink-0 rounded-[3px]"
                            style={{
                                backgroundColor: `var(--color-paddock-chart-${STATUS_TOKENS[slice.status]})`,
                            }}
                        />
                        {slice.label}
                        <span className="paddock-mono ml-auto pl-3.5 text-paddock-night-subtle">
                            {slice.count}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Priority is weight, not a person: neutrals rising to warning and danger. */
const PRIORITY_TOKENS = {
    LOW: "muted",
    MEDIUM: "strong",
    HIGH: "warning",
    URGENT: "danger",
} as const;

export interface PriorityBarsProps {
    slices: PrioritySlice[];
}

/** How work is weighted across the four priority levels. */
export function PriorityBars({ slices }: PriorityBarsProps) {
    const { resolvedTheme } = useTheme();

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "item" },
            grid: {
                top: 24,
                left: 4,
                right: 4,
                bottom: 4,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: slices.map((slice) => slice.label),
                axisLine: base.axisLine,
                axisTick: { show: false },
                axisLabel: {
                    color: palette.muted,
                    fontFamily: palette.fontSans,
                    fontSize: 12,
                    fontWeight: 600,
                },
            },
            yAxis: {
                type: "value",
                minInterval: 1,
                show: false,
            },
            series: [
                {
                    type: "bar",
                    barWidth: "56%",
                    label: {
                        show: true,
                        position: "top",
                        color: palette.strong,
                        fontFamily: palette.fontMono,
                        fontSize: 12,
                    },
                    data: slices.map((slice) => ({
                        value: slice.count,
                        itemStyle: {
                            color: palette[PRIORITY_TOKENS[slice.priority]],
                            borderRadius: [4, 4, 0, 0],
                        },
                    })),
                },
            ],
        };
    }, [slices, resolvedTheme]);

    const summary = slices
        .map((slice) => `${slice.label}: ${slice.count}`)
        .join(", ");

    return (
        <EChart
            option={option}
            height={220}
            testId="chart-priority"
            ariaLabel={`Task priority mix — ${summary}`}
        />
    );
}

export interface ContributorBarsProps {
    contributors: ContributorStat[];
}

/** Completed versus still-open tasks per assignee. */
export function ContributorBars({ contributors }: ContributorBarsProps) {
    const { resolvedTheme } = useTheme();

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);
        // ECharts stacks a horizontal bar bottom-up, so the order is reversed
        // to keep the strongest contributor at the top of the axis.
        const ordered = [...contributors].reverse();
        const most = Math.max(
            1,
            ...contributors.map((contributor) => contributor.assigned),
        );

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "axis" },
            legend: base.legend,
            grid: {
                top: 4,
                left: 4,
                right: 44,
                bottom: 36,
                containLabel: true,
            },
            xAxis: {
                type: "value",
                max: most,
                show: false,
            },
            yAxis: {
                type: "category",
                data: ordered.map((contributor) => contributor.name),
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: palette.strong,
                    fontFamily: palette.fontSans,
                    fontSize: 13,
                    fontWeight: 600,
                },
            },
            series: [
                {
                    name: "Completed",
                    type: "bar",
                    stack: "tasks",
                    barWidth: 18,
                    showBackground: true,
                    backgroundStyle: {
                        color: palette.track,
                        borderRadius: 4,
                    },
                    itemStyle: { color: palette.accent },
                    data: ordered.map((contributor) => contributor.completed),
                },
                {
                    name: "Open",
                    type: "bar",
                    stack: "tasks",
                    itemStyle: { color: palette.open },
                    label: {
                        show: true,
                        position: "right",
                        distance: 10,
                        color: palette.muted,
                        fontFamily: palette.fontMono,
                        fontSize: 12,
                        formatter: ({ dataIndex }) => {
                            const contributor = ordered.at(dataIndex);
                            return contributor
                                ? `${contributor.completed}/${contributor.assigned}`
                                : "";
                        },
                    },
                    data: ordered.map(
                        (contributor) =>
                            contributor.assigned - contributor.completed,
                    ),
                },
            ],
        };
    }, [contributors, resolvedTheme]);

    const summary = contributors
        .map(
            (contributor) =>
                `${contributor.name}: ${contributor.completed} of ${contributor.assigned} done`,
        )
        .join(", ");

    return (
        <EChart
            option={option}
            height={Math.max(160, contributors.length * 40 + 56)}
            testId="chart-contributors"
            ariaLabel={`Contributor throughput — ${summary}`}
        />
    );
}
