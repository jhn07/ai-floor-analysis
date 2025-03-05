import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Speaker, Pause, Loader2 } from "lucide-react";
import { apiService } from "@/services/api.service";


/**
 * Interface for the AudioMessage component props
 * 
 * @interface AudioMessageProps
 * @property {string} text - The text to be converted to speech
 * @property {string} className - The optional CSS class name for styling
 */
interface AudioMessageProps {
  text: string;
  className?: string;
}

/**
 * Component for playing text as speech
 * 
 * Provides a button for converting text to speech using the API.
 * Supports playback states, loading, and resource cleanup.
 * 
 * @component
 * @param {AudioMessageProps} props - The props for the component
 * @returns {JSX.Element} The button for controlling playback
 * 
 * @example
 * ```tsx
 * <AudioMessage 
 *   text="Text to be converted to speech" 
 *   className="my-custom-class" 
 * />
 * ```
 */
export function AudioMessage({ text, className }: AudioMessageProps) {
  // States for managing playback and loading
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for managing the audio element and abort controller
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Cleans up audio resources: stops playback and revokes the URL
   */
  const cleanupAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
  }

  /**
   * Effect for cleaning up resources when the component is unmounted
   * 
   * @remarks
   * This effect is used to clean up the audio resources when the component is unmounted
   * - Stops the playback of the audio
   * - Revokes the URL of the audio
   */
  useEffect(() => {
    return () => {
      cleanupAudio();

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);



  /**
   * Handler for clicking the playback button
   * 
   * Performs the following actions:
   * 1. Stops the current playback if it is active
   * 2. Generates audio from the text through the API
   * 3. Sets up a new audio element and its handlers
   * 4. Starts playback
   * 
   * @async
   * @returns {Promise<void>}
   * @throws {Error} Can throw an error if there are problems with the API or playback
   */
  const handlePlay = async () => {
    try {
      // Stops the current playback if it is active
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      const audioBlob = await apiService.generateSpeech(text);
      const url = URL.createObjectURL(audioBlob);

      cleanupAudio();

      // Creates and sets up a new audio element
      const audio = new Audio();
      abortControllerRef.current = new AbortController();

      // Sets up handlers before setting the source
      audio.oncanplaythrough = async () => {
        try {
          await audio.play();
          setIsPlaying(true);
          setIsLoading(false);
        } catch (error) {
          console.error('Playback error:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      };

      // Handler for the end of playback
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      // Handler for audio errors
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setIsPlaying(false);
        URL.revokeObjectURL(url);
      };

      // Sets the source of the audio
      audio.src = url;
      audioRef.current = audio;

    } catch (error) {
      console.error('Audio operation error:', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={handlePlay}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <Pause className="h-4 w-4" />
      ) : (
        <Speaker className="h-4 w-4" />
      )}
    </Button>
  );
}