export const uploadImageAndGetPath = async (image: File) => {
  const imgurClientId = import.meta.env.IMGUR_CLIENT_ID
  if (!imgurClientId) {
    throw Error('No IMGUR_CLIENT_ID set in .env')
  }

  if (!image) return ''

  try {
    const formData = new FormData()
    formData.append('image', image)

    const response = await fetch('https://api.imgur.com/3/upload', {
      method: 'POST',
      body: formData,
      headers: {
        Authorization: `Client-ID ${imgurClientId}`,
        Accept: 'application/json',
      },
    })

    const data = await response.json()
    if (!response.ok || !data || !data.data.link) {
      throw Error(response.statusText)
    }

    return data.data.link
  } catch (e) {
    return ''
  }
}
