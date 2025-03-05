import { NextResponse } from "next/server";
import { aiAnalyzerService } from "@/services/ai-analyzer.service";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Disables caching for this route
 * This is necessary to ensure the freshness of each analysis
 */
noStore();

/**
 * API route configuration
 * Sets the maximum size of the request body to 5MB
 * 
 * @constant {Object} config
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    }
  }
}

/**
 * Constants for file validation
 * @constant {number} MAX_FILE_SIZE - The maximum file size (5MB)
 * @constant {string[]} ALLOWED_FILE_TYPES - Allowed file types
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];


/**
 * Handler for POST requests for analyzing floor plan images
 * 
 * @async
 * @function POST
 * @param {Request} req - The Next.js request object
 * @returns {Promise<NextResponse>} JSON response with analysis results or an error
 * 
 * @throws {Error} Returns an error 400 if:
 * - The Content-Type is invalid
 * - The file is missing
 * @throws {Error} Returns an error 415 if:
 * - The file type is not supported
 * @throws {Error} Returns an error 413 if:
 * - The file size exceeds the maximum limit
 * @throws {Error} Returns an error 504 if:
 * - The analysis timeout is exceeded
 * @throws {Error} Returns an error 500 for all other errors
 */
export async function POST(req: Request) {
  try {
    // Check if the request contains multipart/form-data
    if (!req.headers.get("Content-Type")?.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content type must be multipart/form-data" },
        { status: 400 }
      );
    }

    // Get the form data and extract the file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Check if the file is present
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    };

    // Check if the file type is supported
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} not supported. Please upload JPEG, PNG or WebP` },
        { status: 415 }
      );
    }

    // Check if the file size exceeds the maximum limit
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB" },
        { status: 413 }
      );
    }

    // Log the file information
    console.log("Processing file: ", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      timestamp: new Date().toISOString(),
    });

    // Convert the file to base64 for sending to the analysis service
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const imageUrl = `data:${file.type};base64,${base64}`;

    // Create a promise for the analysis
    const parsedAnalysis = await aiAnalyzerService.analyzeImage(imageUrl);


    return NextResponse.json({ parsedAnalysis }, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    // Determine the status code based on the error
    const statusCode = error instanceof Error && error.message.includes("Analysis timeout")
      ? 504 // Gateway timeout
      : 500; // Internal server error

    // Determine the error message based on the environment
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'An error occurred while processing your request';

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

