
"use client"

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/components/ui/card"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"

interface DataChartProps {
  data: any[]
  fields: { key: string; label: string; color: string }[]
  title: string
  description?: string
  defaultTimeRange?: string
  timeRangeLabels?: Record<string, string>
}

export default function DataCharts({
  data,
  fields,
  title,
  description,
  defaultTimeRange = "90d",
  timeRangeLabels = {
    "90d": "Last 3 months",
    "30d": "Last 30 days",
    "7d": "Last 7 days"
  }
}: DataChartProps) {
  const [timeRange, setTimeRange] = useState(defaultTimeRange)

  return (
    <Card className="bg-card text-card-foreground border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
             <div className="flex items-center space-x-2">
                <Button variant={timeRange==="90d"?"secondary":"ghost"} size="sm" onClick={()=>setTimeRange("90d")}>{timeRangeLabels["90d"]}</Button>
                <Button variant={timeRange==="30d"?"secondary":"ghost"} size="sm" onClick={()=>setTimeRange("30d")}>{timeRangeLabels["30d"]}</Button>
                <Button variant={timeRange==="7d"?"secondary":"ghost"} size="sm" onClick={()=>setTimeRange("7d")}>{timeRangeLabels["7d"]}</Button>
             </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: "#1f2937", border: "none", color: "#fff", borderRadius: "0.5rem" }}
            />
            {fields.map((field) => (
              <Area
                key={field.key}
                type="monotone"
                dataKey={field.key}
                stroke={field.color}
                fill={field.color}
                fillOpacity={0.2}
                stackId="1" 
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
