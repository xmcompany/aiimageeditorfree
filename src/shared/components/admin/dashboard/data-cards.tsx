
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

export interface DataCard {
  title: string
  value: string
  description?: string
  label?: string
}

export default function DataCards({ dataCards }: { dataCards: DataCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {dataCards.map((card, index) => (
        <Card key={index} className="bg-card text-card-foreground border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
