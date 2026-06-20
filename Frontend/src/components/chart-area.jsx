import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
}

export function ChartArea({ title, description, data, dataKey = "value", nameKey = "name", color, height = 250 }) {
  const config = {
    [dataKey]: {
      label: title || "Value",
      color: color || "hsl(var(--primary))",
    },
  }

  return (
    <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        <ChartContainer config={config} className={`w-full`} style={{ height }}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color || "var(--color-value)"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color || "var(--color-value)"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey={nameKey} tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color || "var(--color-value)"}
              fill={`url(#fill-${dataKey})`}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
