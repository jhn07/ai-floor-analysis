import { createClient } from "@deepgram/sdk";
import { NextRequest, NextResponse } from "next/server";

/**
 * Disables caching for this route
 * Each request should generate a new audio stream
 */
export const revalidate = 0;


/**
 * Handler for POST requests for converting text to speech
 * 
 * @async
 * @function POST
 * @param {NextRequest} request - The Next.js request object
 * @returns {Promise<Response>} Audio stream in WAV format or JSON with an error
 * 
 * @description
 * The route uses the Deepgram API to convert text to speech.
 * Supports the aura-asteria-en model for natural sounding speech.
 * 
 * @example
 * // Example request body:
 * {
 *   "text": "Text to convert to speech"
 * }
 * 
 * @throws {Error} Returns an error 500 if:
 * - The DEEPGRAM_API_KEY is missing
 * - Failed to generate audio
 * - An error occurred while processing the stream
 */
export async function POST(request: NextRequest) {
  try {
    // Check if the DEEPGRAM_API_KEY is present
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

    // Get the text from the request body
    const { text } = await request.json();

    // Send a request to the Deepgram API
    const response = await deepgram.speak.request(
      { text },
      {
        model: "aura-asteria-en", // The model to use for the speech
        encoding: "linear16", // Linear 16-bit PCM encoding
        container: "wav", // Format of the audio stream
      }
    );

    // Get the audio stream
    const stream = await response.getStream();
    const headers = await response.getHeaders();

    // Check if the audio stream is present
    if (!stream) throw new Error("Failed to generate audio stream");

    // Get the audio buffer
    const buffer = await getAudioBuffer(stream);

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/wav', // The content type of the audio stream
        'Content-Length': buffer.byteLength.toString(), // The length of the audio stream
      },
    });
  } catch (error) {
    // Log the error
    console.error("TTS API error:", error);

    // Return a JSON response with an error
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}


/**
 * Converts the audio stream to an ArrayBuffer
 * 
 * @async
 * @function getAudioBuffer
 * @param {ReadableStream} response - The audio stream
 * @returns {Promise<ArrayBuffer>} The buffer with the audio data
 * 
 * @description
 * The function reads the stream data in parts and combines them into a single buffer.
 * This is necessary to ensure the correct transmission of audio to the client.
 * 
 * @example
 * const buffer = await getAudioBuffer(audioStream);
 */
async function getAudioBuffer(response: ReadableStream): Promise<ArrayBuffer> {
  // Get the reader for reading the stream
  const reader = response.getReader();
  const chunks = [];

  // Read the stream in parts
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Create a buffer of the appropriate size
  const concatenated = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );

  // Copy the data from the chunks into a single buffer
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.length;
  }

  // Return the final buffer
  return concatenated.buffer;
}