import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Loader2 } from "lucide-react";


/**
 * Interface for the ChatInput component props
 * 
 * @interface ChatInputProps
 * @property {string} value - The current value of the input field
 * @property {function} onChange - Callback for updating the input value
 * @property {function} onSubmit - Callback for sending a message
 * @property {boolean} isAnalyzing - Flag indicating if the analysis is in progress
 * @property {boolean} isAssistantTyping - Flag indicating if the assistant is typing
 */
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  isAnalyzing: boolean;
  isAssistantTyping: boolean;
}


/**
 * Component for the chat input field
 * 
 * Displays a form with an input field and a send button.
 * Supports loading, focus, and blocking states.
 * Adapts to the current state of floorplan analysis.
 * 
 * @component
 * @param {ChatInputProps} props - The component props
 * @returns {JSX.Element} The component for the chat input field
 * 
 * @example
 * ```tsx
 * <ChatInput
 *   value={inputValue}
 *   onChange={handleChange}
 *   onSubmit={handleSubmit}
 *   isAnalyzing={false}
 *   isAssistantTyping={false}
 * />
 * ```
 */
export function ChatInput({
  value,
  onChange,
  onSubmit,
  isAnalyzing,
  isAssistantTyping
}: ChatInputProps) {
  // State for visual effects
  const [isFocused, setIsFocused] = useState(false);

  /**
   * Handler for submitting the form
   * Prevents the default form behavior and sends a non-empty message
   * 
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "p-4 border-t border-border flex gap-2 bg-background transition-all duration-200",
        // Visual effect for focused state
        isFocused ? "bg-background shadow-inner" : "",
      )}
    >
      {/* Input field for sending a message */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={
          isAnalyzing
            ? "Upload a floorplan image to start analysis..."
            : "Ask a question about your floorplan..."
        }
        className="flex-1 focus-visible:ring-1 focus-visible:ring-primary"
        autoComplete="off"
        disabled={isAnalyzing}
      />

      {/* Button for sending a message */}
      <Button
        type="submit"
        size="icon"
        className={cn(
          "transition-all duration-200",
          // Change the style of the button depending on the presence of text
          value.trim()
            ? "bg-primary hover:bg-primary/90 hover:scale-105"
            : "bg-muted text-muted-foreground",
        )}
        disabled={isAnalyzing || !value.trim()}
      >

        {/* Loading indicator or send icon */}
        {isAssistantTyping
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <ArrowUp className="h-4 w-4" />
        }
      </Button>
    </form>
  );
}