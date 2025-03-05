import { motion } from "framer-motion";

/**
 * Interface for the component props
 * 
 * @interface IndicatorProps
 * @property {string} delay - The delay of the animation for the point
 */
interface IndicatorProps {
  delay: string;
}

/**
 * Component of a single animated point
 * 
 * @component
 * @param {IndicatorProps} props - The component props
 * @returns {JSX.Element} Animated point of the indicator
 */
const Indicator = ({ delay }: IndicatorProps) => (
  <div
    className="w-2 h-2 rounded-full bg-current animate-bounce"
    style={{ animationDelay: delay }}
  />
)

/**
 * Component of the typing indicator
 * 
 * Displays three animated points, showing that the assistant is typing.
 * Uses appearance animation and sequential animation of points.
 * 
 * @component
 * @returns {JSX.Element} Animated typing indicator
 * 
 * @example
 * ```tsx
 * <TypingIndicator />
 * ```
 * 
 * @remarks
 * - Uses Framer Motion for animation appearance
 * - Each point has its own animation delay
 * - Styled according to the application theme
 */
export const TypingIndicator = () => {
  return (
    <motion.div
      // Animation of appearance
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      {/* Container with background and shadow */}
      <div className="bg-secondary text-secondary-foreground rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%] shadow-sm">
        {/* Container for points */}
        <div className="flex items-center space-x-2">
          {/* Points with different animation delay */}
          <Indicator delay="0ms" />
          <Indicator delay="150ms" />
          <Indicator delay="300ms" />
        </div>
      </div>
    </motion.div>
  );
}