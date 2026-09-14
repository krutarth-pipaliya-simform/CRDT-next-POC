"use client";

import { useEffect, useRef, useState } from "react";
import type { ECharts, EChartsOption } from "echarts";

import { cn } from "@/lib/cn";

export interface EChartProps {
    option: EChartsOption;
    /** Rendered height in pixels; ECharts needs a sized container to draw into. */
    height?: number;
    /** Describes the chart for assistive technology — charts are images, not text. */
    ariaLabel: string;
    className?: string;
    testId?: string;
}

/**
 * Thin ECharts host.
 *
 * The library is imported dynamically so its ~300KB payload only loads on the
 * analytics route, and the instance is created once per mount — option updates
 * go through `setOption` instead of re-initialising the canvas.
 */
export function EChart({
    option,
    height = 280,
    ariaLabel,
    className,
    testId,
}: EChartProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<ECharts | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        let disposed = false;
        let observer: ResizeObserver | null = null;

        void import("echarts").then((echarts) => {
            if (disposed || !containerRef.current) {
                return;
            }

            const chart = echarts.init(containerRef.current, undefined, {
                renderer: "canvas",
            });
            chartRef.current = chart;

            observer = new ResizeObserver(() => chart.resize());
            observer.observe(containerRef.current);

            setReady(true);
        });

        return () => {
            disposed = true;
            observer?.disconnect();
            chartRef.current?.dispose();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!ready || !chartRef.current) {
            return;
        }
        // `true` replaces the previous option rather than merging, so a range
        // change cannot leave stale series behind.
        chartRef.current.setOption(option, true);
    }, [option, ready]);

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label={ariaLabel}
            data-testid={testId}
            data-chart-ready={ready ? "true" : "false"}
            className={cn("w-full", className)}
            style={{ height }}
        />
    );
}
