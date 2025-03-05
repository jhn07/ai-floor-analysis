import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "../ui/card";
import { Button } from '../ui/button';
import { Maximize2, X } from 'lucide-react';
import { useScroll } from '@/hooks/use-scroll';


/**
 * Interface for the component props
 * 
 * @interface FloorplanCardProps
 * @property {string} imageUrl - The URL of the floor plan image
 * @property {React.ReactNode} children - The child elements (scores and metrics)
 */
interface FloorplanCardProps {
  imageUrl: string;
  children: React.ReactNode;
}


/**
 * Component of the floor plan card
 * 
 * Displays the floor plan image with the ability to view in full screen mode.
 * Includes a button for expanding, animations, and handling the Escape key.
 * 
 * @component
 * @param {FloorplanCardProps} props - The component props
 * 
 * @example
 * ```tsx
 * <FloorplanCard imageUrl="/path/to/image.jpg">
 *   <ScoreMetrics />
 * </FloorplanCard>
 * ```
 */
export const FloorplanCard = ({ imageUrl, children }: FloorplanCardProps) => {
  // State for full screen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Hook for handling scroll
  useScroll(isFullscreen);

  /**
   * Effect for handling the Escape key
   * Closes the full screen mode when the Escape key is pressed
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen]);

  return (
    <>
      {/* Main card with floor plan */}
      <Card className="shadow-card overflow-hidden max-h-[600px] flex flex-col">
        {/* Container with image and expand button */}
        <div className="relative aspect-[3/4] w-full shrink-0 group">
          <img
            src={imageUrl}
            alt="Floorplan"
            className="object-contain w-full h-full p-1.5"
          />
          {/* Expand button (appears on hover) */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => setIsFullscreen(true)}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        {/* Container for child elements (metrics) */}
        <CardContent className="pt-6 overflow-y-auto">
          {children}
        </CardContent>
      </Card>

      {/* Animate presence for full screen mode */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Container for full screen image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full h-full p-8"
            >
              {/* Close full screen button */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 z-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFullscreen(false);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              {/* Full screen image */}
              <img
                src={imageUrl}
                alt="Floorplan Fullscreen"
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}