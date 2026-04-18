import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function SalesReport({
  daily,
  weekly,
  monthly,
  range,
  onRangeChange,
}) {
  const map = { daily, weekly, monthly };
  const report = map[range];

  if (!report || !report.buckets.length) return null;

  return (
    <section>
      <div className="section-header">
        <div>
          <p className="eyebrow">Sales</p>
          <h2>Daily, Weekly & Monthly Report</h2>
        </div>

        <div className="actions">
          {["daily", "weekly", "monthly"].map((r) => (
            <button
              key={r}
              className={range === r ? "ghost active" : "ghost"}
              onClick={() => onRangeChange(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="report-summary">
          <p className="muted">Total Sales</p>
          <p className="report-total">₹{report.total}</p>
        </div>

        <div style={{ width: "100%", height: "300px", marginTop: "24px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report.buckets}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="label"
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#94a3b8"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  color: "#e5e7eb",
                }}
                formatter={(value) => [`₹${value}`, "Sales"]}
              />
              <Bar
                dataKey="total"
                fill="url(#colorGradient)"
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                  <stop offset="100%" stopColor="#1e40af" stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
