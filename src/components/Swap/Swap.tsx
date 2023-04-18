import type React from 'react'
import { SwapWidget } from '@uniswap/widgets'
import '@uniswap/widgets/fonts.css'

const Swap: React.FC = () => {
  const defaultOutputTokenAddress = {
    1: '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26',
    137: '0xA5577D1cec2583058A6Bd6d5DEAC44797c205701', // mainnet polygon,
    42161: '0x91F5dC90979b058eBA3be6B7B7e523df7e84e137', // mainnet arbitrum
  }

  return (
    <div className="Uniswap">
      <SwapWidget defaultOutputTokenAddress={defaultOutputTokenAddress} />
    </div>
  )
}

export default Swap
