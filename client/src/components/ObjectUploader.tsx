import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onComplete?: (result: { uploadURL: string; fileName: string }) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that renders as a button for local file storage.
 * 
 * Features:
 * - Renders as a customizable button that opens a file selection dialog
 * - Validates file type and size
 * - Stores images locally using browser localStorage
 * - Provides upload progress feedback
 * 
 * @param props - Component props
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onComplete - Callback function called when upload is complete
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 */
export function ObjectUploader({
  maxFileSize = 10485760, // 10MB default
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleButtonClick = () => {
    const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size
    if (file.size > maxFileSize) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${Math.round(maxFileSize / 1024 / 1024)}MB`,
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to data URL for local storage
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Store in localStorage with a unique key
        const storageKey = `screenshot-${fileName}`;
        localStorage.setItem(storageKey, dataUrl);

        toast({
          title: "Upload Successful",
          description: `${file.name} uploaded successfully!`,
        });

        onComplete?.({
          uploadURL: dataUrl, // Use the data URL directly
          fileName: file.name
        });
        
        setIsUploading(false);
        // Reset input
        event.target.value = '';
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id="file-upload-input"
      />
      <Button 
        type="button"
        className={buttonClassName}
        disabled={isUploading}
        onClick={handleButtonClick}
      >
        {isUploading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Uploading...
          </>
        ) : (
          children
        )}
      </Button>
    </div>
  );
}
