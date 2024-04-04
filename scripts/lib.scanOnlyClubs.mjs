import { Repeater } from '@repeaterjs/repeater'

const SINGLE_LETTER = '[a-z0-9\\-]'
const genMatch = (length) =>
  Array.from({ length }, (_, i) => i).reduce((p) => `${p}${SINGLE_LETTER}`, '')

export const scanOnlyClubs = (redis) => {
  const patterns = Array.from({ length: 42 }, (_, i) => i).map((_, i) =>
    genMatch(i + 1),
  )

  const iterators = patterns.map((MATCH) => {
    return redis.scanIterator({
      MATCH,
      COUNT: 1000,
    })
  })

  return Repeater.merge(iterators)
}
