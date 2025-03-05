import { NextResponse } from "next/server";
import { aiChatService } from "@/services/ai-chat.service";

/**
 * Handler for POST requests for chat interaction
 * 
 * @async
 * @function POST
 * @param {Request} req - The Next.js request object
 * @returns {Promise<NextResponse>} JSON response with the assistant's message or an error
 * 
 * @description
 * The route handles requests for generating responses in the chat.
 * Expects a JSON with the following fields:
 * - message: the text of the user's message
 * - context: an object containing the analysis of the floor plan and the history of messages
 * 
 * @example
 * // Example request body:
 * {
 *   "message": "Tell me about the lighting in the living room",
 *   "context": {
 *     "analysis": { ... },
 *     "previousMessages": [ ... ]
 *   }
 * }
 * 
 * @throws {Error} Returns an error 400 if:
 * - The message is missing
 * - The context is missing
 * @throws {Error} Returns an error 500 if:
 * - An error occurs while generating the response
 */
export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    // Check if the message is present
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Check if the context is present
    if (!context) {
      return NextResponse.json({ error: "Context is required" }, { status: 400 });
    }


    // Generate the assistant message
    const assistantMessage = await aiChatService.generateResponse(message, context);

    return NextResponse.json({ text: assistantMessage });
  } catch (error) {
    console.error("Chat API Error:", error);

    // Return a general error message
    // In production, do not expose error details to the client
    return NextResponse.json(
      { error: "Failed to process chat message." },
      { status: 500 }
    );
  }
}