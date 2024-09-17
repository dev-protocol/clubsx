const PASSPORT_PREFIX = '_p'

const genClass = (c?: string) =>
  c ? `${PASSPORT_PREFIX}-${c}` : PASSPORT_PREFIX

export const passportClass = (...str: string[]) => {
  const list = str ?? ['']
  const [initial] = list
  return list.reduce(
    (p, c, i) => (i === 0 ? genClass(c) : `${p} ${genClass(c)}`),
    genClass(initial),
  )
}
