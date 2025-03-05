import { cn } from "@/lib/utils";


/**
 * Interface for the score item component props
 * 
 * @interface ScoreItemProps
 * @property {string} label - The label of the score item
 * @property {number} score - The score value
 */
interface ScoreItemProps {
  label: string;
  score: number;
}

/**
 * Component of the score item
 * 
 * Displays a score item with a label and score value.
 * 
 * @component
 * @param {ScoreItemProps} props - The component props
 * 
 * @example
 * ```tsx
 * <ScoreItem label="Lighting" score={85} />
 * ```
 */
export const ScoreItem = ({ label, score }: ScoreItemProps) => {
  /**
   * Determines the color of the score text based on the score value
   * 
   * @param {number} score - The score value
   * @returns {string} The CSS class for the score text color
   */
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  }

  return (
    <div className="flex flex-col">
      {/* Label */}
      <span className="text-sm text-muted-foreground">{label}</span>
      {/* Score */}
      <span className={cn("text-lg font-medium", getScoreColor(score))}>
        {score} / 100
      </span>
    </div>
  )
}