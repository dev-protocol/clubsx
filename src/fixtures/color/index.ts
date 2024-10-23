import hexRgb from 'hex-rgb'
import { always, tryCatch } from 'ramda'

export const RGBToLightness = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  const l = Math.max(r, g, b)
  return l
}

export const isDark = (hex: string) => {
  const [r, g, b] = tryCatch(
    (value: string) => hexRgb(value, { format: 'array' }),
    always([255, 255, 255]),
  )(hex)
  const l = RGBToLightness(r, g, b)
  return l < 0.75
}
