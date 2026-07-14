import React from "react";
import ResponsiveImage from "./ResponsiveImage";

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function GalleryImage({ src, alt, className = "", width, height }: GalleryImageProps) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      width={width}
      height={height}
    />
  );
}
