import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Video } from "lucide-react"

export function DrillCard({ drill }) {
  const categoryColors = {
    skill: "bg-category-skill text-black",
    competition: "bg-category-competition text-black",
    gameplay: "bg-category-gameplay text-black",
    team: "bg-category-team text-black"
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-move">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{drill.title}</CardTitle>
          <Badge 
            variant="secondary" 
            className={categoryColors[drill.category.toLowerCase()] || ""}
          >
            {drill.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {drill.duration}min
          </span>
          {drill.playerCount && (
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {drill.playerCount}
            </span>
          )}
          {drill.hasVideo && (
            <Video className="h-4 w-4 text-powlax-blue" />
          )}
        </div>
      </CardContent>
    </Card>
  )
}