export type HomeConfig = {
  hero: {
    image: string
    text: string
  }
  whatWeDo: {
    text: string
    images: {
      image: string
      description: string
    }[]
  }
  perks: {
    headerText: string
    subText: string
    images: {
      image: string
      description: string
    }[]
  }
  quote: string
  body: string
}
