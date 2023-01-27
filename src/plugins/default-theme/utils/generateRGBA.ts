export const generateRGBA = (
  rgb: [number, number, number],
  a: 1 | 0.5 | 0
): string => `rgba(${[rgb]}, ${a})`
