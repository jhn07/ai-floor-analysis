"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"


/**
 * Interface for the useFileUpload hook
 * 
 * @interface UseFileUploadProps
 * @property {function} onUpload - Callback for processing the uploaded file
 */
interface UseFileUploadProps {
  onUpload: (file: File) => void
}


/**
 * Hook for managing file uploads
 * 
 * Provides functionality for:
 * - Drag and drop file uploads
 * - Selecting files through a dialog
 * - Managing upload state
 * 
 * @param {UseFileUploadProps} props - The hook props
 * @returns {Object} The object with the states and event handlers
 * 
 * @example
 * ```tsx
 * const {
 *   isDragging,
 *   isUploading,
 *   fileInputRef,
 *   handleDrop,
 *   handleClick
 * } = useFileUpload({
 *   onUpload: (file) => handleFileUpload(file)
 * });
 * ```
 */
export const useFileUpload = ({ onUpload }: UseFileUploadProps) => {
  // States for tracking dragging and uploading
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Handler for the drag over event
   * 
   * @param {React.DragEvent<HTMLDivElement>} e - The drag over event
   * 
   * @example
   * ```tsx
   * <div onDragOver={handleDragOver}>
   *   <p>Drag and drop your file here</p>
   * </div>
   * ```
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  /**
   * Handler for the drag leave event
   * 
   * @param {React.DragEvent<HTMLDivElement>} e - The drag leave event
   * 
   * @example
   * ```tsx
   * <div onDragLeave={handleDragLeave}>
   *   <p>Drag and drop your file here</p>
   * </div>
   * ```
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])


  /**
   * Handler for the drop event
   * Handles the file and calls the onUpload callback
   * 
   * @param {React.DragEvent<HTMLDivElement>} e - The drop event
   * 
   * @example
   * ```tsx
   * <div onDrop={handleDrop}>
   *   <p>Drag and drop your file here</p>
   * </div>
   * ```
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0]
        setIsUploading(true)

        // Process the file
        onUpload(file)

        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Simulate upload completion after some time
        setTimeout(() => {
          setIsUploading(false)
        }, 2000)
      }
    },
    [onUpload],
  )

  /**
   * Handler for the click event
   * Opens the file selection dialog
   */
  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  /**
   * Handler for the file change event
   * Called when a file is selected through the dialog
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0]
        setIsUploading(true)

        // Process the file
        onUpload(file)

        // Reset the input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Simulate upload completion after some time
        setTimeout(() => {
          setIsUploading(false)
        }, 2000)
      }
    },
    [onUpload],
  )

  return {
    isDragging,
    isUploading,
    fileInputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClick,
    handleFileChange,
  }
}

