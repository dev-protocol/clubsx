import type { ImageMetadata } from 'astro'

export const imageSrc = (img?: string | ImageMetadata): string | undefined => {
  return typeof img === 'string' ? img : img?.src
}
