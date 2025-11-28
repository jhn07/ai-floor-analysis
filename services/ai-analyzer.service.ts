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
      // ONE SINGLE GPT REQUEST (validation + analysis in 1 step)
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini", // Fast Vision model
        messages: [
          {
            role: "system",
            content: `
            You are an expert in analyzing floor plans, architectural drawings, and interior layouts.
                      
            Your task:
                      
            1) First, determine whether the image is a valid floor plan / architectural layout / interior space.
                      
               - If the image is NOT related to rooms, interior spaces, or floor plans → respond ONLY with:
                      
                 {
                   "scores": {
                     "lighting": 0,
                     "space": 0,
                     "flow": 0,
                     "accessibility": 0
                   },
                   "recommendations": []
                 }
                      
            2) If the image IS valid → perform full analysis.
                      
            RETURN JSON ONLY IN THIS FORMAT:
                      
            {
              "scores": {
                "lighting": number (0-100),
                "space": number (0-100),
                "flow": number (0-100),
                "accessibility": number (0-100)
              },
              "recommendations": [
                {
                  "area": "string",
                  "issue": "string",
                  "suggestion": "string",
                  "priority": "low | medium | high"
                }
              ]
            }
                      
            Always return VALID JSON and NOTHING ELSE.
            `
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: imageUrl, detail: "low" }
              },
              {
                type: "text",
                text: `
                Perform the combined validation and analysis as instructed.
                If not a floor plan/interior, return the EMPTY version.
                Otherwise, return the full JSON analysis.
                `
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1500,
        temperature: 0.1
      });

      // Check for errors
      if (!response.choices || response.choices.length === 0) {
        throw new Error("No response received from OpenAI");
      }

      if (response.choices[0].finish_reason === "length") {
        throw new Error("The response is too long. Please try again.");
      }

      if (response.choices[0].finish_reason === "content_filter") {
        throw new Error("The response was filtered due to content restrictions");
      }

      const content = response.choices[0].message.content;
      if (!content) throw new Error("Empty response received");

      let parsedAnalysis: FloorPlanAnalysis;
      try {
        parsedAnalysis = JSON.parse(content);
      } catch (e) {
        throw new Error("Invalid JSON response received");
      }

      // Check the JSON structure
      if (!parsedAnalysis.scores || !parsedAnalysis.recommendations) {
        throw new Error("Invalid JSON structure");
      }

      // Check the range of scores
      if (!this.areaScoreValid(parsedAnalysis.scores)) {
        throw new Error("Scores are outside valid range (0-100)");
      }

      return parsedAnalysis;
    } catch (error) {
      // Retry on certain errors
      if (retryCount < this.MAX_RETRIES && this.shouldRetry(error)) {
        await this.delay(this.RETRY_DELAY * (retryCount + 1));
        return this.analyzeImage(imageUrl, retryCount + 1);
      }

      this.loggerError(error);
      return this.emptyResponse();
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