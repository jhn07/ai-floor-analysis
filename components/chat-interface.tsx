"use client";

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence } from "framer-motion"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessage } from "@/components/chat/chat-message"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { ChatInput } from "@/components/chat/chat-input"
import { Message } from "@/types/chat"



/**
 * Interface for the ChatInterface component props
 * 
 * @interface ChatInterfaceProps
 * @property {Message[]} messages - The messages to be displayed in the chat
 * @property {function} onSendMessage - The function to be called when a message is sent
 * @property {boolean} [isAssistantTyping] - Flag indicating if the assistant is typing
 * @property {boolean} [isAnalyzing] - Flag indicating if the analysis is in progress
 */
interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
  isAssistantTyping?: boolean
  isAnalyzing?: boolean
}



/**
 * Component for the chat interface
 * 
 * Displays a full chat interface with a header, message area,
 * typing indicator, and input field. Supports auto-scrolling and animations.
 * 
 * @component
 * @param {ChatInterfaceProps} props - The props for the component
 * @returns {JSX.Element} The component for the chat interface
 * 
 * @example
 * ```tsx
 * <ChatInterface
 *   messages={messages}
 *   onSendMessage={handleSendMessage}
 *   isAssistantTyping={true}
 *   isAnalyzing={false}
 * />
 * ```
 */
export function ChatInterface({
  messages,
  onSendMessage,
  isAssistantTyping = false,
  isAnalyzing = false,
}: ChatInterfaceProps) {
  // Ref for auto-scrolling to the last message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // State for the input value
  const [inputValue, setInputValue] = useState<string>("");

  /**
   * Effect for auto-scrolling to the last message
   * Triggers when the list of messages changes
   * 
   * @effect
   * @dependency {Message[]} messages
   */
  useEffect(() => {
    if (messagesEndRef.current) {
      // Small delay for correct animation work
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [messages])

  /**
   * Handler for sending a message
   * Calls the callback and clears the input field
   */
  const handleSendMessage = () => {
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg border border-border overflow-hidden shadow-lg bg-background glass-card">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages area with scrolling */}
      <div className="flex-1 p-4 overflow-y-auto bg-background/50 backdrop-blur-sm">
        <AnimatePresence initial={false}>
          <div className="space-y-4">
            {isAnalyzing ? (
              // Message with a request to upload an image
              <ChatMessage
                message={{
                  id: "1",
                  text: "Please upload a floorplan image to start analysis.",
                  sender: "assistant",
                  timestamp: Date.now(),
                }}
              />
            ) : (
              // Displaying a list of messages
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}

            {/* Typing indicator for the assistant */}
            {isAssistantTyping && <TypingIndicator />}

            {/* Element for auto-scrolling */}
            <div ref={messagesEndRef} />
          </div>
        </AnimatePresence>
      </div>

      {/* Input area for sending a message */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSendMessage}
        isAnalyzing={isAnalyzing}
        isAssistantTyping={isAssistantTyping}
      />
    </div>
  )
}

