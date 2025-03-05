import { useState, useCallback, useEffect } from "react";
import { FloorPlanAnalysis } from "@/types/floor-analysis";
import { ChatMessage } from "@/types/chat";
import { apiService } from "@/services/api.service";


/**
 * Interface for the props of the useFloorPlanChat hook
 * 
 * @interface UseFloorPlanChatProps
 * @property {FloorPlanAnalysis | null} [floorplanAnalysis] - The results of the floor plan analysis
 */
interface UseFloorPlanChatProps {
  floorplanAnalysis?: FloorPlanAnalysis | null;
}


/**
 * Hook for managing the chat with the AI assistant for floor plan analysis
 * 
 * Provides functionality for:
 * - Managing chat messages
 * - Sending messages to the assistant
 * - Displaying the typing state
 * - Automatic welcome message
 * 
 * @param {UseFloorPlanChatProps} props - The props of the hook
 * @returns {Object} The object with the chat state and methods for managing
 * 
 * @example
 * ```tsx
 * const { messages, isTyping, sendMessage } = useFloorPlanChat({
 *   floorplanAnalysis: analysis
 * });
 * ```
 */
export const useFloorPlanChat = ({ floorplanAnalysis }: UseFloorPlanChatProps) => {
  // State for storing the chat history
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // State for indicating the assistant's typing
  const [isTyping, setIsTyping] = useState<boolean>(false);


  /**
   * Effect for sending the welcome message
   * Triggers when the floor plan analysis results are received
   */
  useEffect(() => {
    if (!floorplanAnalysis) return;

    const welcomeMessage: ChatMessage = {
      id: Date.now().toString() + "-welcome",
      text: `Hi, I'm the FloorPlanGPT. I can help you analyze your floor plans. Ask me anything!`,
      sender: "assistant",
      timestamp: Date.now(),
    };

    setMessages([welcomeMessage]);
  }, [floorplanAnalysis])


  /**
   * Sending a message to the assistant
   * 
   * The process includes:
   * 1. Adding the user's message to the history
   * 2. Sending a request to the API
   * 3. Adding the assistant's answer to the history
   * 4. Handling errors
   * 
   * @param {string} message - The text of the message to send
   */
  const sendMessage = useCallback(async (message: string) => {
    if (!floorplanAnalysis) return;

    // Creating a user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      sender: "user",
      timestamp: Date.now(),
    };

    // Adding the user's message to the history
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    // Indicating the assistant's typing
    setIsTyping(true);

    try {
      // Sending a request to the API
      const data = await apiService.sendChatMessage(message, {
        analysis: floorplanAnalysis,
        previousMessages: messages,
      });

      // Creating an assistant message
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + "-assistant",
        text: data,
        sender: "assistant",
        timestamp: Date.now(),
      };

      // Adding the assistant's answer to the history
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      // Creating an error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        text: "Sorry, I couldn't process your request. Please try again.",
        sender: "assistant",
        timestamp: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [floorplanAnalysis, messages]);

  return {
    messages,
    isTyping,
    sendMessage,
  };
}