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

export const passportSpotlightClass = (i: 0 | 1 | 2 | 3 | number) => {
  return i === 1
    ? // when # of items == 1
      {
        container:
          'grid gap-1 lg:gap-4 items-center grid-cols-[2fr_3fr_2fr] grid-rows-[repeat(5,minmax(100px,1fr))]',
        child: ['col-start-2 col-span-1 row-start-1 row-span-5'],
      }
    : i === 2
      ? // when # of items == 2
        {
          container:
            'grid gap-4 items-stretch grid-cols-[1fr_4fr_4fr_1fr] grid-rows-1',
          child: [
            'col-start-2 col-span-1 row-start-1 row-span-1',
            'col-start-3 col-span-1 row-start-1 row-span-1',
          ],
        }
      : // when # of items == 3 or 0
        {
          container:
            'grid gap-1 lg:gap-4 items-center grid-cols-[2fr_3fr_2fr] grid-rows-[repeat(5,minmax(20px,1fr))] lg:grid-rows-[repeat(5,minmax(100px,1fr))]',
          child: [
            'col-start-1 col-span-1 row-start-2 row-span-3',
            'col-start-2 col-span-1 row-start-1 row-span-5',
            'col-start-3 col-span-1 row-start-2 row-span-3',
          ],
        }
}
