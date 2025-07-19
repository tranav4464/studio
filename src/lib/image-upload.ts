import { toast } from "@/components/ui/use-toast";
const { v4: uuidv4 } = require('uuid');

type UploadResponse = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export async function uploadImage(file: File): Promise<UploadResponse> {
  // In a real app, you would upload to a storage service like Cloudinary, S3, etc.
  // This is a mock implementation that returns a base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error("Failed to read file"));
        return;
      }
      
      // Create an image to get dimensions
      const img = new Image();
      img.onload = () => {
        resolve({
          url: e.target?.result as string,
          width: img.width,
          height: img.height,
          alt: file.name.split('.')[0] // Use filename as alt text
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target.result as string;
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function handleImageUpload(editor: any, file: File) {
  if (!file) return;
  
  // Check if file is an image
  if (!file.type.match('image.*')) {
    toast({
      title: "Invalid file type",
      description: "Please upload an image file",
      variant: "destructive",
    });
    return;
  }
  
  // Generate a unique ID for the loading toast
  const toastId = `toast-${uuidv4()}`;
  
  // Show loading toast
  toast({
    id: toastId,
    title: "Uploading image...",
    description: "Please wait",
    duration: 0, // Don't auto-dismiss
  });
  
  uploadImage(file)
    .then(({ url, alt, width, height }) => {
      // Dismiss loading toast
      const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`);
      if (toastElement) {
        toastElement.remove();
      }
      
      // Show success toast
      toast({
        title: "Image uploaded",
        description: "Image has been added to your post",
      });
      
      // Insert image at current cursor position
      editor
        .chain()
        .focus()
        .setImage({ 
          src: url,
          alt: alt || "",
          title: alt || "",
          width: Math.min(width || 800, 800), // Limit width
        })
        .run();
    })
    .catch((error) => {
      console.error("Upload failed:", error);
      // Dismiss loading toast
      const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`);
      if (toastElement) {
        toastElement.remove();
      }
      
      // Show error toast
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    });
}

// Drag and drop handler
export function handleDrop(editor: any, event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  
  const files = Array.from(event.dataTransfer?.files || []);
  const imageFiles = files.filter(file => file.type.match('image.*'));
  
  if (imageFiles.length > 0) {
    // Handle first image
    handleImageUpload(editor, imageFiles[0]);
  }
}

export function handlePaste(editor: any, event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return;
  
  // Find pasted image
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile();
      if (file) {
        handleImageUpload(editor, file);
        return; // Only handle first image
      }
    }
  }
}
