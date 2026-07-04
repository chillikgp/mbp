export function trackCtaClick(label: string, category: string = "", href: string = "") {
  if (typeof window !== "undefined" && (window as any).mbpTrack) {
    (window as any).mbpTrack("cta_click", { label, category, href });
  }
}

export function trackFormSubmit(formName: string, category: string = "") {
  if (typeof window !== "undefined" && (window as any).mbpTrack) {
    (window as any).mbpTrack("form_submit", { form: formName, category });
  }
}

export function trackGalleryClick(category: string, imageSrc: string) {
  if (typeof window !== "undefined" && (window as any).mbpTrack) {
    (window as any).mbpTrack("gallery_click", { category, image: imageSrc });
  }
}

export function trackVideoPlay(title: string) {
  if (typeof window !== "undefined" && (window as any).mbpTrack) {
    (window as any).mbpTrack("video_play", { label: title });
  }
}
