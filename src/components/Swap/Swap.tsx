import type React from 'react'
import { SwapWidget } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'

const Swap: React.FC = () => {
  return (
    <div className="Uniswap">
      <SwapWidget />
    </div>
  )
}

export default Swap
