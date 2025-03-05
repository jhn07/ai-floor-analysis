import { FloorPlanAnalysis } from "@/types/floor-analysis";
import { ScoreItem } from "@/components/analysis/score-card";
import { RecommendationCard } from "@/components/analysis/recommendation-card";
import { FloorplanCard } from "@/components/analysis/floorplan-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";



/**
 * Interface for the analysis component props
 * 
 * @interface AnalysisProps
 * @property {FloorPlanAnalysis} analysis - The floor plan analysis data
 * @property {string} imageUrl - The URL of the uploaded floor plan image
 */
interface AnalysisProps {
  analysis: FloorPlanAnalysis;
  imageUrl: string;
}


/**
 * Component for displaying the floor plan analysis results
 * 
 * Displays:
 * - Floor plan image
 * - Scores for different criteria (lighting, space, flow, accessibility)
 * - List of recommendations for improving the floor plan
 * 
 * @component
 * @param {AnalysisProps} props - The props for the component
 * @returns {JSX.Element} The component with the analysis results
 * 
 * @example
 * ```tsx
 * <Analysis 
 *   analysis={floorPlanAnalysis} 
 *   imageUrl="path/to/image.jpg" 
 * />
 * ```
 */

export default function Analysis({ analysis, imageUrl }: AnalysisProps) {
  /**
   * Array of scores for display
   * Converts the analysis data into a format suitable for display
   */
  const scores = [
    { label: "Lighting", score: analysis.scores.lighting },
    { label: "Space", score: analysis.scores.space },
    { label: "Flow", score: analysis.scores.flow },
    { label: "Accessibility", score: analysis.scores.accessibility },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      {/* Section with the floor plan image and scores */}
      <FloorplanCard imageUrl={imageUrl}>
        <div className="grid grid-cols-2 gap-4">
          {scores.map(({ label, score }) => (
            <ScoreItem
              key={label}
              label={label}
              score={score}
            />
          ))}
        </div>
      </FloorplanCard>

      {/* Section with the recommendations */}
      <div className="lg:col-span-2 flex flex-col h-[600px]">
        {/* Section title */}
        <Card className="shadow-card mb-4">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              We've analyzed your floorplan and identified the following issues and recommendations.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Scrollable area for the recommendations */}
        <ScrollArea className="h-[calc(100%-100px)]">
          <div className="space-y-4 pr-4">
            {analysis.recommendations.map((recommendation, index) => (
              <RecommendationCard
                key={`${recommendation.area}-${index}`}
                {...recommendation}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
} 