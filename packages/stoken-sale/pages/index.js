import Navbar from '../components/Global/navbar'
import Hero from '../components/Hero/hero'
import Cards from '../components/list/cards'
import Hero2 from '../components/Hero/hero2'

export default function Home() {
  return (
    <div className="bg-black">
      <Navbar />
      <Hero />
      <Hero2 />
      <Cards />
    </div>
  )
}
