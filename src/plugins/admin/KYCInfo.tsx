import React, { useEffect, useState } from 'react'

import { hashMessage, type Signer } from 'ethers'

import NotVerifiedBannerImg from './assets/NotVerifiedBannerImg.svg'
import IdentityVerificationBg from './assets/Identity-Verification.mp4'

enum KYCStatuses {
  VERIFIED,
  IN_PROCESS,
  NOT_VERIFIED,
}

const lazySetter = <T extends (v: any) => void>(
  setter: T,
  value: T extends (v: infer P) => void ? P : never,
  delay: number,
) => setTimeout(() => setter(value), delay)

const FundsInfo = (props: {
  propertyAddress: string
  chainId: number
  uniqueBeneficiaries: string[]
}) => {
  const [signer, setSigner] = useState<Signer>()
  const [connection, setConnection] = useState<any>(undefined)
  const [isFetchingIDVId, setIsFetchingIDVId] = useState<boolean>(false)
  const [kycProcessingTxt, setKYCProcessingText] = useState<string>('Verify')
  const [isFetchingKYCStatus, setIsFetchingKYCStatus] = useState<boolean>(true)
  const [KYCStatus, setKYCStatus] = useState<KYCStatuses>(
    KYCStatuses.NOT_VERIFIED,
  )

  useEffect(() => {
    const checkConnection = async () => {
      const _connection = await import('@devprotocol/clubs-core/connection')
      setConnection(_connection)
    }

    checkConnection()
  }, [props])

  useEffect(() => {
    if (!connection) {
      setSigner(undefined)
      return
    }

    setSigner(connection.connection().signer.getValue())
    const connectionSub = connection
      .connection()
      .signer.subscribe((s: Signer) => setSigner(s))
    return () => connectionSub.unsubscribe() // Cleanup to remove pervious subscribers.
  }, [connection])

  useEffect(() => {
    if (!signer) {
      lazySetter(setIsFetchingKYCStatus, false, 1000)
      setKYCStatus(KYCStatuses.NOT_VERIFIED)
      return
    }

    fetchKYCStatus()
    const interval = setInterval(() => fetchKYCStatus(true), 10 * 1000)
    return () => clearInterval(interval) // Cleanup.
  }, [signer])

  const fetchKYCStatus = async (isPolling: boolean = false) => {
    setIsFetchingKYCStatus(true)

    const accountAddress = await signer?.getAddress()
    if (!accountAddress) {
      lazySetter(setIsFetchingKYCStatus, false, 1000)
      setKYCProcessingText('Verify')
      return
    }

    const url = `https://kyc.clubs.place/api/user-status?address=${accountAddress}`
    const res = await fetch(url)
      .then(
        (res) => {
          if (res.ok) {
            return res
          }
          throw new Error('Error ' + res.status + ': ' + res.statusText)
        },
        (err) => {
          throw new Error(err.message)
        },
      )
      .then((res) => res.json())
      .then(
        (res) =>
          res as {
            data?: {
              status?: string
            }
          },
      )
      .catch((err) => {
        setKYCProcessingText('Verify')
      })

    if (!(res instanceof Error)) {
      const statusInDB = res?.data?.status?.toLowerCase()
      const [statusText, status] =
        statusInDB === 'rejected'
          ? ['KYC rejected, try again', KYCStatuses.NOT_VERIFIED]
          : statusInDB === 'approved'
            ? ['Verified', KYCStatuses.VERIFIED]
            : statusInDB === 'processed' || statusInDB === 'completed'
              ? [
                  'KYC in process, please wait for update',
                  KYCStatuses.IN_PROCESS,
                ]
              : ['Verify', KYCStatuses.NOT_VERIFIED]

      setKYCProcessingText(statusText)
      setKYCStatus(status)
    }

    lazySetter(setIsFetchingKYCStatus, false, 1000)
  }

  const setKYCInitiationFailed = (text?: string) => {
    setIsFetchingIDVId(false)
    setKYCProcessingText(text || 'Failed, try again.') // TODO: replace with a user friendly feedback text.
  }

  const initiateKYC = async () => {
    setIsFetchingIDVId(true)
    setKYCProcessingText('Initiating KYC process...')

    if (KYCStatus === KYCStatuses.VERIFIED) {
      setKYCInitiationFailed('KYC already verified')
      return
    }
    if (KYCStatus === KYCStatuses.IN_PROCESS) {
      setKYCInitiationFailed('KYC in process, please wait for updates')
      return
    }

    if (!signer) {
      setKYCInitiationFailed()
      return
    }

    const hash = hashMessage(`Verifying Clubs KYC`)
    const signature = await signer
      .signMessage(hash)
      .catch((err: any) => new Error(err))
    if (!signature || !hash || signature instanceof Error) {
      setKYCInitiationFailed()
      return
    }

    const url = `https://kyc.clubs.place/api/createIDVId`
    const headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    }
    const body = JSON.stringify({
      hash,
      signature,
    })
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
      .then(
        (res) => {
          if (res.ok) {
            return res
          }
          throw new Error('Error ' + res.status + ': ' + res.statusText)
        },
        (err) => {
          throw new Error(err.message)
        },
      )
      .then((res) => res.json())
      .then(
        (res) =>
          res as {
            data: { id: string }
            message: string
          },
      )
      .catch((err) => {
        setKYCInitiationFailed()
      })

    if (!(res instanceof Error)) {
      if (res?.data?.id) {
        setKYCProcessingText('KYC is in progress...')
        window.open(
          `${import.meta.env.PUBLIC_ONDATO_VERIFICATION_URL}/?id=${res?.data
            ?.id}`,
          '_blank',
        )
      } else {
        setKYCInitiationFailed()
      }
    }
  }

  return (
    <>
      {/* <!------ Loggin/Connection status --------------> */}
      {!signer && (
        <div className="mb-16 flex w-fit max-w-full items-center justify-center gap-5 rounded-md bg-dp-yellow-400 px-8 py-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.9825 16.725C15.2838 15.7999 14.3798 15.0496 13.3417 14.5334C12.3036 14.0171 11.1599 13.7489 10.0005 13.75C8.84115 13.7489 7.69739 14.0171 6.65932 14.5334C5.62125 15.0496 4.71724 15.7999 4.0185 16.725M15.9825 16.725C17.346 15.5122 18.3076 13.9136 18.7417 12.1411C19.1758 10.3686 19.0608 8.50609 18.412 6.80048C17.7632 5.09487 16.6112 3.62678 15.1089 2.5909C13.6066 1.55502 11.8248 1.00029 10 1.00029C8.17516 1.00029 6.39343 1.55502 4.89111 2.5909C3.38878 3.62678 2.23683 5.09487 1.58804 6.80048C0.939242 8.50609 0.824253 10.3686 1.25832 12.1411C1.69239 13.9136 2.655 15.5122 4.0185 16.725M15.9825 16.725C14.3365 18.1932 12.2061 19.0031 10.0005 19C7.79453 19.0034 5.66474 18.1934 4.0185 16.725M13.0005 7.75C13.0005 8.54565 12.6844 9.30871 12.1218 9.87132C11.5592 10.4339 10.7962 10.75 10.0005 10.75C9.20485 10.75 8.44179 10.4339 7.87918 9.87132C7.31657 9.30871 7.0005 8.54565 7.0005 7.75C7.0005 6.95435 7.31657 6.19129 7.87918 5.62868C8.44179 5.06607 9.20485 4.75 10.0005 4.75C10.7962 4.75 11.5592 5.06607 12.1218 5.62868C12.6844 6.19129 13.0005 6.95435 13.0005 7.75Z"
              stroke={signer ? 'white' : 'black'}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-black">Not connected to a wallet</p>
        </div>
      )}

      {KYCStatus === KYCStatuses.VERIFIED && (
        <div className="w-full grid lg:grid-cols-2 gap-5 py-5 px-8 rounded-2xl bg-dp-blue-grey-300 dark:bg-dp-blue-grey-200 justify-center items-center">
          <p className="font-bold text-xl text-center">Identity Verification</p>
          <div className="flex justify-center items-center">
            <p className="w-fit rounded-lg p-1.5 bg-dp-green-400 text-center">
              Verified
            </p>
          </div>
        </div>
      )}

      {KYCStatus !== KYCStatuses.VERIFIED && (
        <div className="relative w-full max-w-full min-h-[292px] rounded-2xl p-8">
          <video
            autoPlay={true}
            loop
            muted
            className="absolute inset-0 w-full h-full max-w-full max-h-full object-cover rounded-2xl"
          >
            <source src={IdentityVerificationBg} type="video/mp4" />
          </video>
          <div className="relative w-full h-full grid lg:grid-cols-2 gap-5 justify-center items-center z-1 rounded-2xl">
            <p className="font-bold text-2xl text-center text-dp-white-ink">
              Identity Verification
            </p>
            <div className="flex flex-col justify-center items-center gap-5">
              <div className="w-fit rounded-lg bg-native-blue-400 p-5">
                <img src={NotVerifiedBannerImg.src} alt="Not verified" />
              </div>
              <p className="w-fit font-body text-base font-bold text-dp-white-ink">
                Not verified
              </p>
              <button
                disabled={
                  isFetchingKYCStatus ||
                  isFetchingIDVId ||
                  KYCStatus === KYCStatuses.IN_PROCESS
                }
                onClick={initiateKYC}
                className={`hs-button is-filled py-6 px-8 bg-dp-blue-grey-600 text-dp-blue-grey-ink ${
                  isFetchingKYCStatus || isFetchingIDVId
                    ? 'animate-pulse bg-dp-blue-grey-600'
                    : ''
                }`}
              >
                {kycProcessingTxt}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default FundsInfo
