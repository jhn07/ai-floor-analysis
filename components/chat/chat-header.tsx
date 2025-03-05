/**
 * Component for the chat header
 * 
 * Displays the chat interface header with a name and description.
 * Uses system colors and borders from the application theme.
 * 
 * @component
 * @returns {JSX.Element} The component for the chat header
 * 
 * @example
 * ```tsx
 * <ChatHeader />
 * ```
 * 
 * @remarks
 * - Uses system classes for colors and margins
 * - Adapts to the current application theme
 * - Contains the main header and subtitle
 */
export const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      {/* Container with information */}
      <div>
        {/* Main header */}
        <h3 className="font-medium text-foreground">
          Floorplan Assistant
        </h3>
        {/* Subheader with description */}
        <p className="text-xs text-muted-foreground">
          Ask questions about your analysis
        </p>
      </div>
    </div>
  );
}