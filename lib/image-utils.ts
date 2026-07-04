import fs from "node:fs/promises";
import { join } from "node:path";

// Server-side cache for media metadata
const mediaMetaCache = new Map<string, { width: number; height: number } | null>();

function readImageSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer[0] === 0x89 && buffer.toString("ascii", 1, 4) === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (offset + 4 > buffer.length) return null;
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      if (offset + 9 > buffer.length) return null;
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7)
      };
    }
    offset += 2 + length;
  }

  return null;
}

export async function getImageSize(src: string): Promise<{ width: number; height: number } | null> {
  if (mediaMetaCache.has(src)) {
    return mediaMetaCache.get(src) || null;
  }

  try {
    const root = process.cwd();
    // Resolve path. Since assets are in public/, we look in public/ if it's not found in root
    let path = join(/*turbopackIgnore: true*/ root, src.replace(/^\//, ""));
    try {
      await fs.access(path);
    } catch {
      // Try public path
      path = join(/*turbopackIgnore: true*/ root, "public", src.replace(/^\//, ""));
    }

    const buffer = await fs.readFile(path);
    const size = readImageSize(buffer);
    mediaMetaCache.set(src, size);
    return size;
  } catch (err) {
    mediaMetaCache.set(src, null);
    return null;
  }
}

export async function getImageAspectRatioClass(src: string): Promise<string> {
  const size = await getImageSize(src);
  if (!size) return "";
  if (size.width > size.height) return "landscape";
  if (size.height > size.width) return "portrait";
  return "square";
}
