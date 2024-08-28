import React, { useState } from 'react'

import CreateVaultSVG from '../assets/CreateVault.svg'

interface ICreateClubsVaultProps {
  isKYCVerified: boolean
}

const CreateClubsVault = (props: ICreateClubsVaultProps) => {
  const [isCreatingVault, setIsCreatingVault] = useState<boolean>(false)

  const createVault = async () => {
    setIsCreatingVault(true)

    // @TODO: add logic to create vault here.

    setIsCreatingVault(false)
  }

  return (
    <button
      onClick={() => createVault()}
      disabled={!props.isKYCVerified}
      className={`hs-button is-filled col-span-2 flex justify-center items-center py-4 px-8 ${
        !props.isKYCVerified
          ? 'disabled:cursor-not-allowed disabled:hover:animate-[horizontal-shaking_.06s_5]'
          : ''
      } lg:col-span-1 ${
        isCreatingVault ? 'animate-pulse bg-dp-blue-grey-600' : ''
      }`}
    >
      <div className="min-w-6 min-h-6">
        <img src={CreateVaultSVG.src} alt="Create clubs vault" />
      </div>
      <p className="w-fit font-body text-base text-center font-bold text-dp-white-ink">
        Create Clubs Vault
      </p>
    </button>
  )
}

export default CreateClubsVault
