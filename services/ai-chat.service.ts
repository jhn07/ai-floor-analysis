import OpenAI from "openai";
import { FloorPlanAnalysis } from "@/types/floor-analysis";

// Check if the OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}

/**
 * Interface for the chat message
 * 
 * @interface ChatMessage
 * @property {("user" | "assistant")} sender - The sender of the message
 * @property {string} text - The text of the message
 */
interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
}


/**
 * Service for managing chat interactions with AI for floor plan analysis
 * 
 * @class AiChatService
 * @description Provides interaction with the OpenAI API for generating
 * context-based answers based on the floor plan analysis and message history
 */
class AiChatService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(private openai: OpenAI) { }

  /**
   * Generates the assistant's response to the user's message
   * 
   * @param {string} message - The user's message
   * @param {Object} context - The conversation context
   * @param {FloorPlanAnalysis} context.analysis - The results of the floor plan analysis
   * @param {ChatMessage[]} context.previousMessages - The history of previous messages
   * @param {number} retryCount - The number of attempts (for internal use)
   * @returns {Promise<string>} The assistant's response
   * 
   * @throws {Error} Error when the response generation fails
   * 
   * @example
   * ```typescript
   * const response = await aiChatService.generateResponse(
   *   "Tell me about the lighting in the living room",
   *   { analysis, previousMessages }
   * );
   * ```
   */
  async generateResponse(
    message: string,
    context: {
      analysis: FloorPlanAnalysis;
      previousMessages: ChatMessage[];
    },
    retryCount = 0
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: this.createSystemPrompt(context.analysis)
          },
          ...this.formatPreviousMessages(context.previousMessages),
          { role: "user", content: message }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      // Проверки ответа
      if (!response.choices || response.choices.length === 0) {
        throw new Error("No response received from OpenAI");
      }

      if (response.choices[0].finish_reason === "length") {
        throw new Error("The response is too long");
      }

      if (response.choices[0].finish_reason === "content_filter") {
        throw new Error("The response was filtered");
      }

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error("Empty response received");
      }

      return content;

    } catch (error) {
      if (retryCount < this.MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.generateResponse(message, context, retryCount + 1);
      }
      this.logError(error);
      throw error;
    }
  }





  /**
   * Creates the system prompt for the OpenAI API
   * 
   * @param {FloorPlanAnalysis} analysis - The floor plan analysis
   * @returns {string} The system prompt
   */
  private createSystemPrompt(analysis: FloorPlanAnalysis): string {
    return `You are an expert in analyzing floor plans, analyzing the following plan:

    Floor plan analysis:
    ${JSON.stringify(analysis, null, 2)}

    Answer the user's questions ONLY in the context of this plan and the provided analysis.
    If the question is not related to the plan or analysis, politely redirect the conversation back to the plan topic.
    
    Use specific data from the analysis in your answers:
    - Refer to specific assessments (lighting, space, etc.)
    - Mention specific recommendations for rooms
    - Give practical advice based on the analysis`;
  }





  /**
   * Formats the previous messages for the OpenAI API
   * 
   * @param {ChatMessage[]} messages - The history of previous messages
   * @returns {Object[]} The formatted messages
   */
  private formatPreviousMessages(messages: ChatMessage[]) {
    return messages.map(msg => ({
      role: msg.sender === "user" ? "user" as const : "assistant" as const,
      content: msg.text
    }));
  }

  /**
   * Checks if the request should be retried given the error
   * 
   * @param {any} error - The error object
   * @returns {boolean} True, if the request should be retried
   */
  private shouldRetry(error: any): boolean {
    return error instanceof OpenAI.APIError
      ? (error.status === 429 || error.status >= 500)
      : false;
  }

  /**
   * Creates a delay before retrying the request
   * 
   * @param {number} ms - The delay time in milliseconds
   * @returns {Promise<void>} A promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Logs the error
   * 
   * @param {any} error - The error object
   */
  private logError(error: any) {
    console.error("AI Chat Error:");
    if (error instanceof OpenAI.APIError) {
      console.error({
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status
      });
    } else {
      console.error("Unexpected error in AiChatService:", error);
    }
  }
}

// Create and export the instance of the service
export const aiChatService = new AiChatService(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
);