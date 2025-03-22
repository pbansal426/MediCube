"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

interface PrescriptionChartProps {
  taken: number
  missed: number
  upcoming: number
}

export function PrescriptionChart({ taken, missed, upcoming }: PrescriptionChartProps) {
  // Create data for the chart
  const data = [
    {
      name: "Medication Status",
      taken,
      missed,
      upcoming,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" barCategoryGap={24}>
        <XAxis type="number" />
        <YAxis type="category" dataKey="name" hide />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            border: "none",
          }}
        />
        <Legend />
        <Bar dataKey="taken" name="Taken" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="missed" name="Missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="upcoming" name="Upcoming" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

