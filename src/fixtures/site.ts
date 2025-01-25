/**
 * This accepts only 3-42 strings includes a-z, 0-9 or -, and returns boolean
 * @param site the string of site name
 * @returns boolean
 */
export const validate = (site?: string): site is string =>
  site ? /^[a-z|0-9|-]{3,42}$/.test(site) : false
