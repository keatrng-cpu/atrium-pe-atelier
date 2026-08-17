import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { MarketSnapshot } from "@/lib/engines/market";

export function TapeChart({ market }: { market: MarketSnapshot }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const data = market.series.map((p) => ({
    t: new Date(p.t).toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    close: p.close,
  }));
  if (!ready) return <div className="h-48 rounded-xl bg-elevated" />;
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="t" hide />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              background: "#131410",
              border: "1px solid rgba(243,239,228,0.12)",
              borderRadius: 8,
              color: "#f3efe4",
              fontSize: 12,
            }}
          />
          <Line type="monotone" dataKey="close" stroke="#c9b89a" strokeWidth={1.6} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
