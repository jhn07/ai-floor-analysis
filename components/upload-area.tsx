"use client"

import { useState } from "react"
import { Upload, Loader2, FileText, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useFileUpload } from "@/hooks/use-file-upload"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"

/**
 * Interface for the information about the uploaded file
 * 
 * @interface FileInfo
 * @property {string | null} fileName - The name of the uploaded file
 * @property {string | null} fileType - The type of the uploaded file
 * @property {string | null} fileSize - The size of the uploaded file
 */
interface FileInfo {
  fileName: string | null
  fileType: string | null
  fileSize: string | null
}

/**
 * Interface for the component props
 * 
 * @interface UploadAreaProps
 * @property {function} onUpload - Callback for processing the uploaded file
 * @property {function} [onReset] - Optional callback for resetting the state
 * @property {number} [maxSizeMB=10] - Maximum file size in MB
 * @property {string[]} [allowedTypes] - Allowed file types
 * @property {boolean} [multiple=false] - Allow multiple uploads
 * @property {boolean} [isAnalyzing=false] - Flag for the analysis process
 * @property {boolean} [isUploaded=false] - Flag for successful upload
 */
interface UploadAreaProps {
  onUpload: (file: File) => void
  onReset?: () => void
  maxSizeMB?: number
  allowedTypes?: string[]
  multiple?: boolean
  isAnalyzing?: boolean
  isUploaded?: boolean
}


/**
 * Component of the upload area
 * 
 * Provides an interface for uploading files through drag-n-drop or file selection.
 * Supports preview, validation, and displaying upload states.
 * 
 * @component
 * @param {UploadAreaProps} props - The component props
 */
export const UploadArea = ({
  onUpload,
  onReset,
  maxSizeMB = 10,
  allowedTypes = ["image/jpeg", "image/png", "application/pdf"],
  multiple = false,
  isAnalyzing = false,
  isUploaded = false,
}: UploadAreaProps) => {
  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  // State for upload error
  const [uploadError, setUploadError] = useState<string | null>(null)
  // State for preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  // State for file info
  const [fileInfo, setFileInfo] = useState<FileInfo>({
    fileName: null,
    fileType: null,
    fileSize: null,
  })


  /**
   * File validation
   * 
   * @param {File} file - The file to check
   * @returns {boolean} The result of validation
   */
  const validateFile = (file: File): boolean => {
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        `Invalid file type. Please upload ${allowedTypes.map((type) => type.split("/")[1]).join(", ")} files.`,
      )
      return false
    }

    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`File is too large. Maximum size is ${maxSizeMB}MB.`)
      return false
    }

    return true
  }


  /**
   * Format file size
   * 
   * @param {number} bytes - The size of the file in bytes
   * @returns {string} The formatted file size
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  /**
   * Handle upload start
   * 
   * @param {File} file - The file to upload
   * @returns {boolean} The result of the upload
   */
  const handleUploadStart = (file: File) => {
    setUploadError(null)

    if (!validateFile(file)) return false

    // Set file info
    setFileInfo(prev => ({
      ...prev,
      fileName: file.name,
      fileType: file.type,
      fileSize: formatFileSize(file.size),
    }))

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }

    return true
  }


  /**
   * Reset upload state
   */
  const resetUpload = () => {
    setPreviewUrl(null)
    setFileInfo(prev => ({
      ...prev,
      fileName: null,
      fileType: null,
      fileSize: null,
    }))
    setUploadProgress(0)
    setUploadError(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    if (onReset) {
      onReset()
    }
  }

  // Hook for handling file uploads
  const {
    isDragging,
    isUploading,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    handleFileChange,
  } = useFileUpload({
    onUpload: (file) => {
      const isValid = handleUploadStart(file)
      if (isValid) onUpload(file)
    },
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {uploadError ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-destructive">{uploadError}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                setUploadError(null)
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div
        className={cn(
          "relative w-full border-2 border-dashed rounded-lg transition-all duration-300 flex flex-col items-center justify-center",
          isDragging
            ? "border-primary bg-primary/5"
            : isUploaded
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : uploadError
                ? "border-destructive bg-destructive/5"
                : "border-border hover:border-primary/50 hover:bg-primary/5",
          (isUploading || isAnalyzing)
            ? "pointer-events-none"
            : "cursor-pointer",
          previewUrl
            ? "p-4"
            : "p-8",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple={multiple}
          className="hidden"
          aria-label="Upload file"
        />

        <AnimatePresence mode="wait">
          {isAnalyzing ? (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center w-full p-4"
            >
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Analyzing your floorplan...</p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                This will only take a moment
              </p>
            </motion.div>
          ) : isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center w-full p-4"
            >
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium">Processing your floorplan...</p>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                This will only take a moment
              </p>
              <div className="w-full max-w-md">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-right mt-1 text-muted-foreground">{uploadProgress}%</p>
              </div>
            </motion.div>
          ) : isUploaded ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center p-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">Upload Complete!</h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Your floorplan has been successfully uploaded and is ready for analysis.
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  resetUpload()
                }}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Another</span>
              </Button>
            </motion.div>
          ) : previewUrl ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted flex-shrink-0">
                  {previewUrl ? (
                    <Image src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" width={400} height={300} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg truncate">{fileInfo.fileName}</h3>
                  <div className="text-sm text-muted-foreground space-y-1 mt-1">
                    <p>{fileInfo.fileType?.split("/")[1].toUpperCase()}</p>
                    <p>{fileInfo.fileSize}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        resetUpload()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center p-4"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-1">Upload your floorplan</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                Drag and drop your floorplan image, or click to browse. We support{" "}
                {allowedTypes.map((type) => type.split("/")[1].toUpperCase()).join(", ")} files up to {maxSizeMB}MB.
              </p>
              <Button variant="outline" className="gap-2 group">
                <Upload className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
                <span>Select File</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg flex items-center justify-center">
            <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
              <p className="text-lg font-medium text-primary">Drop your file here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

