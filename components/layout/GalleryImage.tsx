import React from "react";
import ResponsiveImage from "./ResponsiveImage";

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function GalleryImage({ src, alt, className = "" }: GalleryImageProps) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
    />
  );
}
