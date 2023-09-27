export const formatUnixTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000) // Convert seconds to milliseconds
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const emptyDummyImage = (width: number, height: number) => {
  return `https://dummyimage.com/${width}x${height}/c7c7c7/000000&text=Empty+Image`
}