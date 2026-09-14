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

export interface CompletionGaugeProps {
    completionRate: number;
    tasksDone: number;
    tasksTotal: number;
}

/** Share of the board that has reached Done. */
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
                    startAngle: 210,
                    endAngle: -30,
                    min: 0,
                    max: 100,
                    radius: "92%",
                    center: ["50%", "58%"],
                    progress: {
                        show: true,
                        width: 14,
                        itemStyle: { color: palette.series[0] },
                    },
                    axisLine: {
                        lineStyle: { width: 14, color: [[1, palette.border]] },
                    },
                    axisTick: { show: false },
                    splitLine: { show: false },
                    axisLabel: { show: false },
                    pointer: { show: false },
                    anchor: { show: false },
                    title: {
                        offsetCenter: [0, "32%"],
                        color: palette.subtle,
                        fontSize: 11,
                    },
                    detail: {
                        offsetCenter: [0, "-2%"],
                        formatter: "{value}%",
                        color: palette.ink,
                        fontSize: 30,
                        fontWeight: 500,
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

        const series = [
            {
                name: "Tasks created",
                data: points.map((point) => point.tasksCreated),
                color: palette.series[0],
            },
            {
                name: "Tasks completed",
                data: points.map((point) => point.tasksCompleted),
                color: palette.series[1],
            },
            {
                name: "Documents",
                data: points.map((point) => point.documents),
                color: palette.series[3],
            },
            {
                name: "Messages",
                data: points.map((point) => point.messages),
                color: palette.series[4],
            },
        ];

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "axis" },
            legend: {
                bottom: 0,
                icon: "rect",
                itemWidth: 10,
                itemHeight: 10,
                textStyle: { color: palette.subtle, fontSize: 11 },
            },
            grid: {
                top: 16,
                left: 8,
                right: 12,
                bottom: 44,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: labels,
                axisLine: base.axisLine,
                axisTick: { show: false },
                axisLabel: { color: palette.subtle, hideOverlap: true },
            },
            yAxis: {
                type: "value",
                minInterval: 1,
                axisLine: { show: false },
                splitLine: base.splitLine,
                axisLabel: { color: palette.subtle },
            },
            series: series.map((entry) => ({
                name: entry.name,
                type: "line",
                smooth: true,
                showSymbol: false,
                lineStyle: { width: 2, color: entry.color },
                itemStyle: { color: entry.color },
                areaStyle: { color: entry.color, opacity: 0.08 },
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

export interface StatusDonutProps {
    slices: StatusSlice[];
}

/** Current distribution of tasks across the Kanban columns. */
export function StatusDonut({ slices }: StatusDonutProps) {
    const { resolvedTheme } = useTheme();

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);
        const colors = [palette.subtle, palette.series[0], palette.success];

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "item" },
            legend: {
                bottom: 0,
                icon: "rect",
                itemWidth: 10,
                itemHeight: 10,
                textStyle: { color: palette.subtle, fontSize: 11 },
            },
            series: [
                {
                    type: "pie",
                    radius: ["52%", "76%"],
                    center: ["50%", "44%"],
                    itemStyle: {
                        borderColor: palette.surface,
                        borderWidth: 2,
                    },
                    label: { show: false },
                    data: slices.map((slice, index) => ({
                        name: slice.label,
                        value: slice.count,
                        itemStyle: { color: colors[index] },
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
            height={240}
            testId="chart-status"
            ariaLabel={`Task status distribution — ${summary}`}
        />
    );
}

export interface PriorityBarsProps {
    slices: PrioritySlice[];
}

/** How work is weighted across the four priority levels. */
export function PriorityBars({ slices }: PriorityBarsProps) {
    const { resolvedTheme } = useTheme();

    const option = useMemo<EChartsOption>(() => {
        const palette = readChartPalette(resolvedTheme);
        const base = baseChartStyles(palette);
        const colors = [
            palette.subtle,
            palette.series[0],
            palette.warning,
            palette.danger,
        ];

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "item" },
            grid: {
                top: 16,
                left: 8,
                right: 16,
                bottom: 8,
                containLabel: true,
            },
            xAxis: {
                type: "category",
                data: slices.map((slice) => slice.label),
                axisLine: base.axisLine,
                axisTick: { show: false },
                axisLabel: { color: palette.subtle },
            },
            yAxis: {
                type: "value",
                minInterval: 1,
                axisLine: { show: false },
                splitLine: base.splitLine,
                axisLabel: { color: palette.subtle },
            },
            series: [
                {
                    type: "bar",
                    barWidth: "46%",
                    data: slices.map((slice, index) => ({
                        value: slice.count,
                        itemStyle: { color: colors[index] },
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
            height={240}
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

        return {
            textStyle: base.textStyle,
            tooltip: { ...base.tooltip, trigger: "axis" },
            legend: {
                bottom: 0,
                icon: "rect",
                itemWidth: 10,
                itemHeight: 10,
                textStyle: { color: palette.subtle, fontSize: 11 },
            },
            grid: {
                top: 12,
                left: 8,
                right: 16,
                bottom: 44,
                containLabel: true,
            },
            xAxis: {
                type: "value",
                minInterval: 1,
                axisLine: { show: false },
                splitLine: base.splitLine,
                axisLabel: { color: palette.subtle },
            },
            yAxis: {
                type: "category",
                data: ordered.map((contributor) => contributor.name),
                axisLine: base.axisLine,
                axisTick: { show: false },
                axisLabel: { color: palette.subtle },
            },
            series: [
                {
                    name: "Completed",
                    type: "bar",
                    stack: "tasks",
                    barWidth: "52%",
                    itemStyle: { color: palette.success },
                    data: ordered.map((contributor) => contributor.completed),
                },
                {
                    name: "Open",
                    type: "bar",
                    stack: "tasks",
                    itemStyle: { color: palette.series[0] },
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
            height={240}
            testId="chart-contributors"
            ariaLabel={`Contributor throughput — ${summary}`}
        />
    );
}
