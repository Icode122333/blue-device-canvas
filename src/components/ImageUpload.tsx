import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  size?: "sm" | "md" | "lg";
}

export const ImageUpload = ({ currentImageUrl, onImageUploaded, size = "md" }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("User not authenticated");
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.data.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      onImageUploaded(data.publicUrl);
      setPreviewUrl(data.publicUrl);
      
      toast({
        title: "Success",
        description: "Profile image uploaded successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    uploadImage(file);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    onImageUploaded("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        <Avatar className={`${sizeClasses[size]} relative border border-primary/25 bg-white/5 shadow-[0_20px_40px_hsl(79_100%_62%_/_0.16)]`}>
          <AvatarImage src={previewUrl || ""} />
          <AvatarFallback className="bg-secondary text-muted-foreground">
            <Camera className="h-6 w-6 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        
        {previewUrl && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -right-2 -top-2 h-7 w-7 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading..." : previewUrl ? "Change Photo" : "Upload Photo"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground text-center">
        Upload a profile photo (max 5MB)
      </p>
    </div>
  );
};
