
// Interface for floor plan analysis

type Priority = "high" | "medium" | "low";

type Score = {
  lighting: number;
  space: number;
  flow: number;
  accessibility: number;
}

type Recommendation = {
  area: string;
  issue: string;
  suggestion: string;
  priority: Priority;
}

export interface FloorPlanAnalysis {
  scores: Score;
  recommendations: Recommendation[];
}