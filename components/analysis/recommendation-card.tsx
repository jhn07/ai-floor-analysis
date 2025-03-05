import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

/**
 * Interface for the component props
 * 
 * @interface RecommendationCardProps
 * @property {string} area - The area of the floor plan to which the recommendation belongs
 * @property {string} priority - The priority of the recommendation ('high', 'medium', 'low')
 * @property {string} issue - The description of the problem
 * @property {string} suggestion - The suggested solution
 */
interface RecommendationCardProps {
  area: string;
  priority: string;
  issue: string;
  suggestion: string;
}

/**
 * Component of the recommendation card
 * 
 * Displays a recommendation for improving the floor plan with the specified area,
 * priority, problem description, and suggested solution.
 * 
 * @component
 * @param {RecommendationCardProps} props - The component props
 * 
 * @example
 * ```tsx
 * <RecommendationCard
 *   area="Kitchen"
 *   priority="high"
 *   issue="Limited counter space"
 *   suggestion="Add an island for more workspace"
 * />
 * ```
 */
export const RecommendationCard = ({ area, priority, issue, suggestion }: RecommendationCardProps) => {
  /**
   * Determines the color scheme of the badge depending on the priority
   * 
   * @param {string} priority - The priority of the recommendation
   * @returns {string} CSS classes for styling the badge
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <Card className="analysis-card shadow-card hover:shadow-card-hover transition-shadow animate-fade-in">
      {/* Header with area and priority */}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          {/* Area name */}
          <CardTitle className="text-base">{area}</CardTitle>
          {/* Priority badge */}
          <Badge
            variant="outline"
            className={cn("ml-2 glass-card", getPriorityColor(priority))}
          >
            {priority} priority
          </Badge>
        </div>
        {/* Problem description */}
        <CardDescription className="font-medium text-foreground">
          {issue}
        </CardDescription>
      </CardHeader>
      {/* Suggested solution */}
      <CardContent>
        <p className="text-sm">{suggestion}</p>
      </CardContent>
    </Card>
  )
}