type Value = string | boolean | number | undefined | null | Array<Value>

export type JSON =
  | Readonly<
      Record<
        string,
        | Value
        | Readonly<Record<string, Value>>
        | ReadonlyArray<Value | Record<string, Value>>
      >
    >
  | ReadonlyArray<Value | Record<string, Value>>

export const json = (json: JSON): string => JSON.stringify(json)
