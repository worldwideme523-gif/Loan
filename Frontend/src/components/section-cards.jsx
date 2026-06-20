import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function formatValue(value) {
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  if (typeof value === 'string' && value.startsWith('$')) {
    const num = parseFloat(value.replace(/[$,]/g, ''))
    if (!isNaN(num)) {
      return '$' + num.toLocaleString()
    }
  }
  return value
}

export function SectionCards({ cards }) {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <Card key={i} className="shadow-sm border-0 ring-1 ring-foreground/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.label}
              </CardTitle>
              {Icon && <Icon className="size-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatValue(card.value)}</div>
              {card.sub && (
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
