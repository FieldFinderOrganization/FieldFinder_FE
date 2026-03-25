/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from "react";
import { Button } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

interface ImageEditorUploaderProps {
  onUploadSuccess: (imageUrl: string) => void;
}

const ImageEditorUploader: React.FC<ImageEditorUploaderProps> = ({
  onUploadSuccess,
}) => {
  const cloudinaryRef = useRef<any>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    cloudinaryRef.current = (window as any).cloudinary;
    if (cloudinaryRef.current) {
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName:
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dxgy8ilqu",
          uploadPreset:
            process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "chat_preset",
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: false,
          multiple: false,
          clientAllowedFormats: ["png", "jpeg", "jpg", "webp"],
        },
        function (error: any, result: any) {
          if (!error && result && result.event === "success") {
            console.log("Ảnh đã upload và chỉnh sửa xong: ", result.info);
            onUploadSuccess(result.info.secure_url);
          }
        },
      );
    }
  }, [onUploadSuccess]);

  return (
    <Button
      variant="outlined"
      startIcon={<AddPhotoAlternateIcon />}
      onClick={() => widgetRef.current?.open()}
    >
      Tải lên & Chỉnh sửa ảnh
    </Button>
  );
};

export default ImageEditorUploader;
