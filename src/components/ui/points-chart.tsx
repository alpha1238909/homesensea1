"use client";

import * as React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type PointsChartDataPoint = {
  hour: number;
  total: number;
};

type PointsChartProps = {
  data: PointsChartDataPoint[];
  valueLabel: string;
};

const formatMoney = (value: number) => `${Math.round(value).toLocaleString("ru-RU")} ₸`;

export function PointsChart({ data, valueLabel }: PointsChartProps) {
  return (
    <div className="points-chart" aria-label={valueLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 18, right: 18, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id="wasteLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--secondary)" />
              <stop offset="48%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--warn)" />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 5" />
          <XAxis
            type="number"
            dataKey="hour"
            domain={[0, 72]}
            ticks={[0, 12, 24, 36, 48, 60, 72]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            tickFormatter={(hour) => `${hour}ч`}
          />
          <YAxis
            domain={[0, 4860]}
            ticks={[0, 1000, 2000, 3000, 4000, 4860]}
            tickLine={false}
            axisLine={false}
            width={54}
            tick={{ fill: "var(--muted)", fontSize: 10 }}
            tickFormatter={(value) => (value === 4860 ? "4 860 ₸" : `${value}`)}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted)", strokeDasharray: "4 4" }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as PointsChartDataPoint | undefined;
              if (!active || !point) return null;
              return (
                <div className="points-chart-tooltip">
                  <small>{point.hour} ч</small>
                  <strong>{formatMoney(point.total)}</strong>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="url(#wasteLine)"
            strokeWidth={4}
            connectNulls
            dot={(props) => {
              const { cx, cy, index } = props;
              const visible = index % 6 === 0 || index === data.length - 1;
              if (!visible || typeof cx !== "number" || typeof cy !== "number") return <g />;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={index === data.length - 1 ? 6 : 3}
                  className={index === data.length - 1 ? "points-chart-dot final" : "points-chart-dot"}
                />
              );
            }}
            activeDot={{ r: 6, fill: "var(--warn)", stroke: "var(--card)", strokeWidth: 3 }}
            isAnimationActive
            animationDuration={900}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}