import React, { useState } from 'react'

import KYCInfo from './KYCInfo'
import FundsInfo from './Funds'

export enum KYCStatuses {
  VERIFIED,
  IN_PROCESS,
  NOT_VERIFIED,
}

export const Withdrawal = (props: {
  propertyAddress: string
  chainId: number
  uniqueBeneficiaries: string[]
}) => {
  const [KYCStatus, setKYCStatus] = useState<KYCStatuses>(
    KYCStatuses.NOT_VERIFIED,
  )

  return (
    <>
      <KYCInfo
        KYCStatus={KYCStatus}
        setKYCStatus={setKYCStatus}
        chainId={props.chainId}
        uniqueBeneficiaries={props.uniqueBeneficiaries}
        propertyAddress={props.propertyAddress}
      />
      <FundsInfo
        KYCStatus={KYCStatus}
        chainId={props.chainId}
        uniqueBeneficiaries={props.uniqueBeneficiaries}
        propertyAddress={props.propertyAddress}
      />
    </>
  )
}
