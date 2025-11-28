import OpenAI from "openai";
import { FloorPlanAnalysis } from "@/types/floor-analysis";

// Check if the OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set");
}



/**
 * Service for analyzing floor plans using the OpenAI API
 * 
 * @class AiAnalyzerService
 * @description Provides functionality for analyzing floor plan images
 * using GPT-4 Vision and returning structured analysis results
 */
class AiAnalyzerService {
  // Maximum number of retries
  private readonly MAX_RETRIES = 2;
  // Delay between retries
  private readonly RETRY_DELAY = 500;

  constructor(private openai: OpenAI) { }

  /**
   * Analyzes the floor plan image and returns a structured result
   * 
   * @param {string} imageUrl - URL of the image to analyze
   * @param {number} retryCount - Current number of attempts (for internal use)
   * @returns {Promise<FloorPlanAnalysis>} The result of the analysis
   * 
   * @throws {Error} Error when the analysis fails after all attempts
   * 
   * @example
   * ```typescript
   * const analysis = await aiAnalyzerService.analyzeImage("https://example.com/floorplan.jpg");
   * ```
   */
  async analyzeImage(imageUrl: string, retryCount = 0): Promise<FloorPlanAnalysis> {
    try {

      // Validate the image
      const isValidFloorPlan = await this.validateImageAI(imageUrl);

      if (!isValidFloorPlan) {
        return this.emptyResponse();
      }


      // Creating a response from the OpenAI API
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert in analyzing floor plans. Analyze the floor plan and provide the result in JSON format.
            Scores should be from 0 to 100.
            
            {
              "scores": {
                "lighting": 0-100,
                "space": 0-100,
                "flow": 0-100,
                "accessibility": 0-100
              },
              "recommendations": [
                {
                  "area": "string",
                  "issue": "string",
                  "suggestion": "string",
                  "priority": "string"
                }
              ]
            }
            `
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl, detail: "auto" } },
              {
                type: "text",
                text: `Analyze the floor plan and provide:
                1. Scores from 0 to 100 for: lighting, space utilization, flow, and accessibility
                2. Specific recommendations for each room`
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 2500,
        temperature: 0.1,
      });

      // Check if the response is received
      if (!response.choices || response.choices.length === 0) {
        throw new Error("No response received from OpenAI");
      }

      // Check the reason for the completion of the generation
      if (response.choices[0].finish_reason === "length") {
        throw new Error("The response is too long. Please try again.");
      }

      // If the response was filtered due to content restrictions
      if (response.choices[0].finish_reason === "content_filter") {
        throw new Error("The response was filtered due to content restrictions");
      }

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error("Empty response received");
      }

      // Parse the JSON response
      let parsedAnalysis: FloorPlanAnalysis;
      try {
        parsedAnalysis = JSON.parse(content);
      } catch (e) {
        throw new Error("Invalid JSON response received");
      }

      // Check if the scores are valid
      if (!this.areaScoreValid(parsedAnalysis.scores)) {
        throw new Error("Scores are outside valid range (0-100)");
      }

      return parsedAnalysis;

    } catch (error) {
      // Retry if the error is an OpenAI API error and the status is 429 (rate limit) or 500 (server error)
      if (retryCount < this.MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.analyzeImage(imageUrl, retryCount + 1);
      }
      this.loggerError(error);
      throw error;
    }
  }


  /**
   * Validates the image using the OpenAI API
   * - Determines if the image is a floor plan or not
   * - Returns true if the image is a floor plan, false otherwise
   * 
   * @param {string} imageUrl - URL of the image to validate
   * @returns {Promise<boolean>} True, if the image is a floor plan
   * 
   * @throws {Error} Error when the validation fails
   */
  private async validateImageAI(imageUrl: string): Promise<boolean> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert in determining the types of images. 
            Analyze the image and determine if it belongs to one of the following categories:
            - Room/apartment layout
            - Architectural plan
            - Floor plan
            - Design project of a room
            - Interior design layout
            - Building plan
            - Interior photo of a room or apartment
            - Interior visualization
            - 3D-render of a room

            Respond strictly with "true" or "false".
            Respond with "true" if the image belongs to any of these categories or shows an interior space of a room.
            Respond with "false" only for images that are completely unrelated to rooms (e.g. landscapes, portraits, animals, etc.).`
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                  detail: "auto"
                }
              }
            ]
          }
        ],
        max_tokens: 50
      })

      const result = response.choices[0].message.content;

      if (!result) {
        throw new Error("Empty response received");
      }

      return result.includes("true");
    } catch (error) {
      this.loggerError(error);
      throw error;
    }
  }


  /**
   * Checks if the request should be retried given the error
   * 
   * @private
   * @param {any} error - The error object
   * @returns {boolean} True, if the request should be retried
   */
  private shouldRetry(error: any): boolean {
    return error instanceof OpenAI.APIError
      ? (error.status === 429 || error.status === 500)
      : false;
  }



  /**
   * Creates a delay before retrying the request
   * 
   * @private
   * @param {number} ms - The delay time in milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }



  /**
   * Logs errors
   * 
   * @private
   * @param {any} error - The error object to log
   */
  private loggerError(error: any) {
    console.log("AI Analyzer Error: ")
    if (error instanceof OpenAI.APIError) {
      console.log({
        message: error.message,
        code: error.code,
        type: error.type,
        status: error.status,
      });
    } else {
      console.error("Unexpected error in AiAnalyzerService:", error);
    }
  }





  /**
   * Checks if the scores are valid
   * 
   * @private
   * @param {Record<string, number>} scores - The object with the scores
   * @returns {boolean} True, if all scores are valid
   */
  private areaScoreValid(scores: Record<string, number>) {
    return Object.values(scores).every(score =>
      typeof score === "number" &&
      score >= 0 &&
      score <= 100
    );
  }


  /**
   * Returns an empty response
   * 
   * @returns {FloorPlanAnalysis} The empty response
   */
  private emptyResponse(): FloorPlanAnalysis {
    return {
      scores: { lighting: 0, space: 0, flow: 0, accessibility: 0 },
      recommendations: []
    };
  }
}

// Export the instance of the service
export const aiAnalyzerService = new AiAnalyzerService(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
);