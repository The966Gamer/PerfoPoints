
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Image, X } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";

interface TaskProofUploaderProps {
  selectedImage: File | null;
  setSelectedImage: (file: File | null) => void;
  previewUrl: string | null;
  setPreviewUrl: (url: string | null) => void;
}

export function TaskProofUploader({ 
  selectedImage, 
  setSelectedImage, 
  previewUrl, 
  setPreviewUrl 
}: TaskProofUploaderProps) {
  const { theme } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Please upload an image smaller than 10MB");
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Please upload an image smaller than 10MB");
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };
  
  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor="image">Upload photo proof (optional)</Label>
      <div className="grid gap-2">
        {previewUrl && (
          <div className="relative border rounded-md overflow-hidden group">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-auto object-cover max-h-[200px]" 
            />
            <button 
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black/70 rounded-full 
                         text-white opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        )}
        
        {!previewUrl && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              flex flex-col justify-center items-center gap-2
              border-2 border-dashed rounded-md p-8 cursor-pointer
              transition-all duration-200
              ${dragActive ? 'border-primary bg-primary/5' : 'border-muted hover:bg-muted/50'}
              ${theme === 'dark' ? 'hover:border-gray-500' : ''}
            `}
          >
            <Image size={32} className={dragActive ? 'text-primary' : 'text-muted-foreground'} />
            <div className="text-center">
              <p className={dragActive ? 'text-primary' : 'text-muted-foreground'}>
                Drag and drop your image here
              </p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            </div>
            <Label
              htmlFor="image" 
              className="mt-2 cursor-pointer text-sm px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
            >
              Select file
            </Label>
          </div>
        )}
        
        <input 
          type="file" 
          id="image" 
          className="hidden" 
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
}
