import React from "react";

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function ResponsiveImage({ src, alt, loading = "lazy", ...props }: ResponsiveImageProps) {
  // Directly render standard img to preserve visual alignment and prepare for future next/image integration
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading={loading} {...props} />;
}
