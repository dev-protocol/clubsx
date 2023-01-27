export const generateRGBA = (
  rgb: [number, number, number],
  a: number
): string => `rgba(${[rgb]}, ${a})`
