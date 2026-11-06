/** Return an absolute HTTP(S) URL suitable for a user-initiated external link. */
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}


const IMAGE_URL_PATTERN = /\.(?:apng|avif|bmp|gif|jpe?g|png|svg|webp)$/i;

/** True only for absolute HTTP(S) URLs with a recognizable image file extension. */
export function isImageUrl(value: unknown): boolean {
  const safeUrl = safeExternalUrl(value);
  if (!safeUrl) return false;

  try {
    return IMAGE_URL_PATTERN.test(new URL(safeUrl).pathname);
  } catch {
    return false;
  }
}
