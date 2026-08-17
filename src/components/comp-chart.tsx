import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ranks, type FirmTier } from "@/data/ranks";

const labels: Record<FirmTier, string> = {
  mega: "Megafund",
  umm: "Upper MM",
  core: "Core / LMM",
};

export function CompChart({ tier }: { tier: FirmTier }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const data = ranks.map((rank) => ({
    name: rank.shortTitle,
    low: rank.cashBand[tier][0],
    high: rank.cashBand[tier][1],
    span: rank.cashBand[tier][1] - rank.cashBand[tier][0],
  }));

  if (!ready) {
    return <div className="h-72 rounded-xl bg-elevated" />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(243,239,228,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#9c9788", fontSize: 11, fontFamily: "Outfit" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#9c9788", fontSize: 11, fontFamily: "Outfit" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${v}k`}
            width={48}
          />
          <Tooltip
            cursor={{ fill: "rgba(243,239,228,0.04)" }}
            contentStyle={{
              background: "#131410",
              border: "1px solid rgba(243,239,228,0.12)",
              borderRadius: 12,
              color: "#f3efe4",
              fontFamily: "Outfit",
              fontSize: 12,
            }}
            formatter={(value, name) => {
              if (name === "low") return [`$${value}k`, "Low"];
              if (name === "span") return [`+$${value}k`, "Range"];
              return [value, name];
            }}
          />
          <Bar dataKey="low" stackId="a" fill="#1b1c17" radius={[0, 0, 0, 0]} />
          <Bar dataKey="span" stackId="a" fill="#c9b89a" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-[11px] uppercase tracking-[0.16em] text-subtle">
        All-in cash, {labels[tier]} · 2025–2026 US major markets
      </p>
    </div>
  );
}
