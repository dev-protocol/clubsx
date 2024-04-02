export type JSON = Readonly<
  Record<
    string,
    | string
    | boolean
    | number
    | undefined
    | null
    | Readonly<Record<string, string | boolean | number | undefined | null>>
    | ReadonlyArray<
        | string
        | boolean
        | number
        | undefined
        | null
        | Record<string, string | boolean | number | undefined | null>
      >
  >
>

export const json = (json: JSON): string => JSON.stringify(json)
