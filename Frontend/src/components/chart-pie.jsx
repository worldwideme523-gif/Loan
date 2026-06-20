import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell } from "recharts"

const DEFAULT_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

export function ChartDonut({ title, description, data, nameKey = "name", valueKey = "value", colors = DEFAULT_COLORS, height = 300 }) {
  const config = {}
  data.forEach((d, i) => {
    config[d[nameKey]] = {
      label: d[nameKey],
      color: colors[i % colors.length],
    }
  })

  return (
    <Card className="shadow-sm border-0 ring-1 ring-foreground/5">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
        {description && <CardDescription className="text-sm">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        <ChartContainer config={config} className="w-full" style={{ height }}>
          <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              strokeWidth={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-3 mt-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
              <span>{d[nameKey]}: <strong>{d[valueKey]}</strong></span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
