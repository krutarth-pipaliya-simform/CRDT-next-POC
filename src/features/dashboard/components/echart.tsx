"use client";

import { useEffect, useRef, useState } from "react";
import type { ECharts, EChartsOption } from "echarts";
import { Download } from "lucide-react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { cn } from "@/lib/cn";

import {
    type CsvTable,
    downloadCsv,
    downloadFile,
    exportFileName,
    toCsv,
} from "../lib/chart-export";
import { readChartPalette } from "../lib/chart-theme";

export interface EChartProps {
    option: EChartsOption;
    /** Rendered height in pixels; ECharts needs a sized container to draw into. */
    height?: number;
    /** Describes the chart for assistive technology — charts are images, not text. */
    ariaLabel: string;
    className?: string;
    testId?: string;
    /**
     * Export (FR-18): when given, PNG and CSV download buttons sit above the
     * chart. `title` names the files and the buttons; `csv` is the chart's
     * data as a table.
     */
    exportable?: { title: string; csv: CsvTable };
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
    exportable,
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

    const exportPng = () => {
        const chart = chartRef.current;
        if (!chart || !exportable) return;
        // The canvas is transparent; paint the card colour behind it so the
        // image matches what is on screen.
        const url = chart.getDataURL({
            type: "png",
            pixelRatio: 2,
            backgroundColor: readChartPalette().surface,
        });
        downloadFile(exportFileName(exportable.title, "png"), url);
    };

    const exportCsv = () => {
        if (!exportable) return;
        downloadCsv(
            exportFileName(exportable.title, "csv"),
            toCsv(exportable.csv),
        );
    };

    const canvas = (
        <div
            ref={containerRef}
            role="img"
            aria-label={ariaLabel}
            data-testid={testId}
            data-chart-ready={ready ? "true" : "false"}
            className={cn("w-full", !exportable && className)}
            style={{ height }}
        />
    );

    if (!exportable) {
        return canvas;
    }

    return (
        <div className={cn("flex min-w-0 flex-col gap-1", className)}>
            <div className="-mt-2 flex justify-end gap-1">
                <PaddockButton
                    variant="ghost"
                    voice="plain"
                    surface="night"
                    size="sm"
                    onClick={exportPng}
                    disabled={!ready}
                    aria-label={`Download ${exportable.title} as PNG`}
                    className="px-3"
                >
                    <Download
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2.2}
                    />
                    PNG
                </PaddockButton>
                <PaddockButton
                    variant="ghost"
                    voice="plain"
                    surface="night"
                    size="sm"
                    onClick={exportCsv}
                    aria-label={`Download ${exportable.title} data as CSV`}
                    className="px-3"
                >
                    <Download
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={2.2}
                    />
                    CSV
                </PaddockButton>
            </div>
            {canvas}
        </div>
    );
}
