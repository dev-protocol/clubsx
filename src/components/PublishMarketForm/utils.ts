interface IQueryString {
  [key: string]: string
}

export const useQuery = (target: string) =>
  target
    .slice(1)
    .split('&')
    .map((str) => [str.split('=')[0], str.split('=')[1]])
    .reduce((acc, a) => {
      acc[a[0]] = a[1]
      return acc
    }, {} as IQueryString)
