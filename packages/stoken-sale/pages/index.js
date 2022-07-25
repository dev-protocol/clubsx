import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
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
