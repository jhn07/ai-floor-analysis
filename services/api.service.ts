import { ChatMessage } from "@/types/chat";
import { FloorPlanAnalysis } from "@/types/floor-analysis";

/**
 * Interface for the response from the API
 * 
 * @interface ApiResponse
 * @property {FloorPlanAnalysis} [parsedAnalysis] - The result of the floor plan analysis
 * @property {string} [error] - The error message
 */
interface ApiResponse {
  parsedAnalysis?: FloorPlanAnalysis;
  error?: string;
}

/**
 * Configuration for the API service
 * 
 * @interface ApiServiceConfig
 * @property {string} baseUrl - The base URL of the API
 * @property {number} [timeout] - The timeout for requests in milliseconds
 * @property {number} [maxRetries] - The maximum number of retries
 */
interface ApiServiceConfig {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
}


/**
 * Service for interacting with the API
 * 
 * @class ApiService
 * @description Provides interaction with the backend for analyzing floor plans,
 * generating speech and processing chat messages
 */
class ApiService {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(config: ApiServiceConfig) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    this.timeout = config.timeout || 30000; // 30 seconds
    this.maxRetries = config.maxRetries || 3; // 3 retries
  }


  /**
   * Sends an image for analysis
   * 
   * @param {File} file - The file of the image to analyze
   * @param {number} [retryCount=0] - The current number of attempts
   * @returns {Promise<FloorPlanAnalysis>} The result of the floor plan analysis
   * 
   * @throws {ApiError} If the request failed
   * @throws {Error} If the file is not valid or the size is exceeded
   */
  async analyzeImage(file: File, retryCount = 0): Promise<FloorPlanAnalysis> {
    try {

      // Validate the file
      this.validateFile(file);

      // Create AbortController for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
        }
      });

      clearTimeout(timeoutId);

      const data: ApiResponse = await response.json();

      if (!response.ok) throw new ApiError(
        data.error || "Failed to analyze image",
        response.status
      );

      if (!data.parsedAnalysis) throw Error("Invalid response format");

      return data.parsedAnalysis;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }

        if (this.shouldRetry(error) && retryCount < this.maxRetries) {
          await this.delay(1000 * (retryCount + 1));
          return this.analyzeImage(file, retryCount + 1);
        }
      }

      this.logError('Image analysis error:', error);
      throw this.normalizeError(error);
    }
  }


  /**
   * Generates speech from text
   * 
   * @param {string} text - The text to convert to speech
   * @param {number} [retryCount=0] - The current number of attempts
   * @returns {Promise<Blob>} The audio data in the Blob format
   * 
   * @throws {ApiError} If the request failed
   */
  async generateSpeech(text: string, retryCount = 0): Promise<Blob> {
    try {
      // Create AbortController for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          "Failed to generate speech",
          response.status
        );
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }

        if (this.shouldRetry(error) && retryCount < this.maxRetries) {
          await this.delay(1000 * (retryCount + 1));
          return this.generateSpeech(text, retryCount + 1);
        }
      }

      this.logError('Speech generation error:', error);
      throw this.normalizeError(error);
    }
  }



  /**
   * Sends a message to the chat and receives a response
   * 
   * @param {string} message - The user's message
   * @param {Object} context - The chat context
   * @param {FloorPlanAnalysis} context.analysis - The floor plan analysis
   * @param {ChatMessage[]} context.previousMessages - The history of previous messages
   * @param {number} [retryCount=0] - The current number of attempts
   * @returns {Promise<string>} The response from the chatbot
   * 
   * @throws {ApiError} If the request failed
   */
  async sendChatMessage(
    message: string,
    context: {
      analysis: FloorPlanAnalysis;
      previousMessages: ChatMessage[];
    },
    retryCount = 0
  ): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          message,
          context: {
            analysis: context.analysis,
            previousMessages: context.previousMessages.slice(-5)
          }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || "Failed to send chat message",
          response.status
        );
      }

      return data.text;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }

        if (this.shouldRetry(error) && retryCount < this.maxRetries) {
          await this.delay(1000 * (retryCount + 1));
          return this.sendChatMessage(message, context, retryCount + 1);
        }
      }

      this.logError('Chat message error:', error);
      throw this.normalizeError(error);
    }
  }



  /**
   * Checks the file for compliance with the requirements
   * 
   * @private
   * @param {File} file - The file to check
   * 
   * @throws {Error} If the file does not meet the requirements
   */
  private validateFile(file: File) {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];

    if (!file) {
      throw new Error('No file provided');
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Unsupported file type. Please upload JPEG, PNG or WebP');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File is too large. Maximum size is 5MB');
    }
  }




  /**
   * Checks if the request should be retried
   * 
   * @private
   * @param {Error} error - The error object
   * 
   * @returns {boolean} True, if the request should be retried
   */
  private shouldRetry(error: Error): boolean {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return error instanceof ApiError && retryableStatuses.includes(error.status);
  }


  /**
   * Creates a delay before retrying the request
   * 
   * @private
   * @param {number} ms - The delay time in milliseconds
   * 
   * @returns {Promise<void>} A promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }




  /**
   * Logs errors
   * 
   * @private
   * @param {string} message - The error message
   * @param {unknown} error - The error object
   */
  private logError(message: string, error: unknown): void {
    console.error(message, {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      ...(error instanceof ApiError && { status: error.status })
    });
  }


  /**
   * Normalizes the error
   * 
   * @private
   * @param {unknown} error - The error object
   * @returns {Error} The normalized error
   */
  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    return new Error('An unexpected error occurred');
  }
}

/**
 * Custom API error class
 * 
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Creating and exporting the instance of the service
export const apiService = new ApiService({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  maxRetries: 3,
});