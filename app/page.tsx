"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UploadArea } from "@/components/upload-area";
import { MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import Analysis from "@/components/analysys";
import { FloorPlanAnalysis } from "@/types/floor-analysis";
import { apiService } from "@/services/api.service";
import { useFloorPlanChat } from "@/hooks/use-floor-plan-chat";
import { toast } from "sonner";


/**
 * Main page of the application for analyzing floor plans
 * 
 * @component
 * @returns {JSX.Element} Main page component
 *
 * @example
 * ```tsx
 * <Home />
 * ```
 */


export default function Home() {
  // States for managing the uploaded file and its URL
  const [, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // States for managing the tabs and analysis
  const [activeTab, setActiveTab] = useState<"upload" | "analysis">("upload");
  const [analysis, setAnalysis] = useState<FloorPlanAnalysis | null>(null);

  // States for tracking the upload and analysis process
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);

  // Hook for managing the chat interface and AI assistant
  // Uses floorplan analysis data to provide better responses
  const { messages, isTyping, sendMessage } = useFloorPlanChat({
    floorplanAnalysis: analysis,
  });


  /**
   * Handler for uploading the floor plan file
   * 
   * The function performs the following actions:
   * 1. Creates a URL for previewing the uploaded image
   * 2. Updates the file upload state
   * 3. Sends the file to analysis through the API service
   * 4. Processes the analysis results and updates the UI
   * 
   * @param {File} file - Uploaded floor plan image file
   * @throws {Error} Can throw an error if there are problems with uploading or analyzing the file
   * @returns {Promise<void>}
   * 
   * @remarks
   * This function is used to upload the floor plan file and analyze it
   * - Automatically switches to the analysis tab after successful processing
   * - Manages the loading state through isAnalyzing
   * - Releases resources when an error occurs
   */
  const handleUpload = async (file: File) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedFile(file);
    setImageUrl(imageUrl);
    setIsUploaded(true);

    try {
      setIsAnalyzing(true);

      const parsedAnalysis = await apiService.analyzeImage(file);

      // If the image is not a floor plan, show a message to the user
      const isValidFloorPlan = Object.values(parsedAnalysis.scores).some(
        score => score > 0
      );

      if (!isValidFloorPlan) {
        setUploadedFile(null);
        setImageUrl(prev => {
          if (prev) URL.revokeObjectURL(prev);
          return null;
        });
        setIsUploaded(false);
        setIsAnalyzing(false);
        setAnalysis(null);
        setActiveTab("upload");


        // Show a toast message to the user
        toast.error(
          "The uploaded image is not a floor plan. Please try again with a valid floor plan image.",
          {
            description: "Floor plans should include rooms, walls, and other structural elements.",
            duration: 5000, // 5 seconds
          }
        );

        return;
      }

      setAnalysis(parsedAnalysis);
      setActiveTab("analysis");
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Reset all states to initial values
   * Clears the uploaded file, image URL, and analysis results
   * 
   * @remarks
   * This function is used to reset the state of the application
   * - Resets the uploaded file, image URL, analysis results, active tab, and upload status
   * - Revokes the object URL of the image
   * - Revokes object URL to free memory
   */
  const handleReset = () => {
    setUploadedFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setActiveTab("upload");
    setIsUploaded(false);
    setIsAnalyzing(false);

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white via-blue-50/20 to-white">
      <main className="flex-1 flex flex-col">
        {/* Hero Section with the main title and description */}
        <section className="py-12 px-6 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10">
            <Badge variant="outline" className="mb-4 py-1.5 px-4 bg-white/50 gradient-border">
              AI-Powered Floorplan Analysis
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Optimize Your Space with Intelligent Insights
            </h1>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Upload your floorplan and get instant analysis with AI-powered recommendations.
            </p>
          </div>

          {/* Более тонкие декоративные элементы */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-100/10 rounded-full blur-3xl" />
          </div>
        </section>

        {/* Main Content Section */}
        <section className="flex-1 px-6 pb-16 relative">
          {/* Thin background gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/20 via-transparent to-blue-50/10" />

          {/* Main content container */}
          <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">

            {/* Left column with the upload area and analysis results */}
            <div className="w-full lg:w-3/5 flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "upload" | "analysis")}
                className="w-full"
              >
                <div className="flex justify-center mb-6">
                  <TabsList className="bg-white/70 backdrop-blur-sm border border-gray-100 shadow-card gradient-border">
                    <TabsTrigger value="upload" className="px-6">Upload</TabsTrigger>
                    <TabsTrigger value="analysis" className="px-6" disabled={!analysis}>Analysis</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="upload" className="py-6">
                  <UploadArea
                    onUpload={handleUpload}
                    onReset={handleReset}
                    isAnalyzing={isAnalyzing}
                    isUploaded={isUploaded}
                  />
                </TabsContent>

                <TabsContent value="analysis" className="py-4">
                  {analysis && imageUrl && (
                    <Analysis analysis={analysis} imageUrl={imageUrl} />
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Right column with the chat interface */}
            <div className="w-full lg:w-2/5 mt-8 lg:mt-16">
              <div className="mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>FloorSense Chat</span>
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ask questions about your floorplan analysis
                </p>
              </div>
              <div className="h-[calc(100vh-theme(spacing.64))] rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm">
                <ChatInterface
                  messages={messages}
                  onSendMessage={sendMessage}
                  isAssistantTyping={isTyping}
                  isAnalyzing={!analysis}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
