import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { AudioMessage } from '../audio-message'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/utils'
import { Message } from '@/types/chat'

/**
 * Interface for the ChatMessage component props
 * 
 * @interface ChatMessageProps
 * @property {Message} message - The message object to display
 */
interface ChatMessageProps {
  message: Message
}

/**
 * Component for displaying a single message in the chat
 * 
 * Displays a message with an animation of appearance, sending time
 * and an optional playback button for assistant messages.
 * Supports different styles for user and assistant messages.
 * 
 * @component
 * @param {ChatMessageProps} props - The component props
 * @returns {JSX.Element} The animated component for the message
 * 
 * @example
 * ```tsx
 * <ChatMessage
 *   message={{
 *     id: "1",
 *     text: "Hello!",
 *     sender: "user",
 *     timestamp: Date.now()
 *   }}
 * />
 * ```
 */
export const ChatMessage = ({ message }: ChatMessageProps) => {
  // State for formatted time (hydration error fix)
  const [formattedTime, setFormattedTime] = useState<string>("");

  /**
   * Effect for formatting time after component rendering
   * Prevents hydration errors when using SSR
   */
  useEffect(() => {
    setFormattedTime(formatTime(message.timestamp))
  }, [message.timestamp])

  return (
    <motion.div
      // Animation of appearance
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex",
        // Alignment depending on the sender
        message.sender === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 rounded-2xl shadow-sm",
          // Styles depending on the sender
          message.sender === "user"
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : "bg-secondary text-secondary-foreground rounded-tl-none",
        )}
      >
        {/* Container for text and playback button */}
        <div className="flex items-start justify-between gap-2">
          {/* Message text */}
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.text}
          </p>

          {/* Playback button only for assistant messages */}
          {message.sender === "assistant" && (
            <AudioMessage
              text={message.text}
              className="mt-1 hover:bg-secondary-foreground/10"
            />
          )}
        </div>

        {/* Timestamp of sending message */}
        <p className="text-xs opacity-70 mt-1 text-right">
          {formattedTime}
        </p>
      </div>
    </motion.div>
  )
}
