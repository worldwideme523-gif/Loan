import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

export function ChartBar({ title, description, data, dataKey = "value", nameKey = "name", color, height = 250 }) {
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
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey={nameKey} tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey={dataKey} fill={color || "var(--color-value)"} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ChartBarGroup({ title, description, data, config, height = 250 }) {
  return (
    <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            {Object.keys(config).map((key) => (
              <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
