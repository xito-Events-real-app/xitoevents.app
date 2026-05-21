import { useState, useRef } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";
import { Image, Camera as CameraIcon, UploadCloud, X, Film, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MediaUploadProps {
  onSuccess: (imageUrl: string, caption: string) => void;
  onClose: () => void;
}

export const MediaUpload = ({ onSuccess, onClose }: MediaUploadProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNative = Capacitor.isNativePlatform();

  // Handle native camera capture
  const captureNativeImage = async () => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Prompts user to select Camera or Photo Library
      });

      if (photo.webPath) {
        setImage(photo.webPath);
        toast.success("Image selected successfully!");
      }
    } catch (error: any) {
      // Don't toast if user cancelled
      if (error?.message !== "User cancelled photos app") {
        toast.error("Failed to capture image: " + error.message);
      }
    }
  };

  // Handle web file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
        toast.success("Image uploaded successfully!");
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImage(null);
  };

  // Simulated upload to mock Supabase or storage
  const handleSubmit = () => {
    if (!image) {
      toast.error("Please capture or select an image first!");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    // Simulate standard progress bar upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setUploading(false);
      toast.success("Post shared successfully on your profile!");
      onSuccess(image, caption);
    }, 1000);
  };

  return (
    <div className="space-y-5">
      {/* Platform Indicator */}
      <div className="flex items-center justify-between text-xs bg-brand-soft border border-brand-soft-border text-brand-dark px-3 py-2 rounded-lg font-medium">
        <span>Platform Mode:</span>
        <span className="bg-brand/10 border border-brand/20 text-brand px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
          {isNative ? " iOS Native (Capacitor)" : "🌐 Web Browser"}
        </span>
      </div>

      {/* Upload Zone */}
      {!image ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={isNative ? captureNativeImage : triggerFileSelect}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] text-center ${
            isDragging
              ? "border-brand bg-[hsl(var(--brand)/0.04)] scale-[0.98]"
              : "border-border hover:border-brand/60 hover:bg-brand-soft/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="w-14 h-14 rounded-full bg-brand-soft flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            {isNative ? (
              <CameraIcon className="w-7 h-7 text-brand animate-pulse" />
            ) : (
              <UploadCloud className="w-7 h-7 text-brand" />
            )}
          </div>

          <h4 className="font-semibold text-sm text-ink mb-1">
            {isNative ? "Tap to open Camera or Gallery" : "Drag & drop image, or browse"}
          </h4>
          <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed">
            {isNative
              ? "Access native camera features instantly using iOS Capacitor plugins."
              : "Supports PNG, JPG, or WEBP. Max file size 10MB."}
          </p>

          {isNative && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 border-brand/20 text-brand hover:bg-brand-soft"
            >
              Select Media
            </Button>
          )}
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted aspect-video max-h-[260px] flex items-center justify-center group">
          <img
            src={image}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            {isNative && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={captureNativeImage}
                className="w-9 h-9 rounded-full bg-white hover:bg-neutral-100 shadow text-neutral-800"
                title="Retake Photo"
              >
                <CameraIcon className="w-4 h-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeImage}
              className="w-9 h-9 rounded-full shadow"
              title="Remove Image"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Post Details Form */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground/80 mb-1.5 block uppercase tracking-wider">
            Caption / Description
          </label>
          <Textarea
            placeholder="Describe your photography, event, or setup details..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="resize-none min-h-[90px] border-border focus-visible:ring-brand font-sans text-sm"
          />
        </div>

        {uploading && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>Uploading to portfolio...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-brand hover:bg-[hsl(var(--primary-hover))] text-white font-semibold"
            disabled={!image || uploading}
            onClick={handleSubmit}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sharing...
              </span>
            ) : (
              "Share to Profile"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
