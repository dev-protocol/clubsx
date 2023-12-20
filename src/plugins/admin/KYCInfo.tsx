import React, { useEffect, useState } from 'react'

import { hashMessage, type Signer } from 'ethers'

import { KYCStatuses } from './Withdrawal'
import NotVerifiedBannerImg from './assets/NotVerifiedBannerImg.svg'
import IdentityVerificationBg from './assets/Identity-Verification.mp4'

const lazySetter = <T extends (v: any) => void>(
  setter: T,
  value: T extends (v: infer P) => void ? P : never,
  delay: number,
) => setTimeout(() => setter(value), delay)

const FundsInfo = (props: {
  propertyAddress: string
  chainId: number
  uniqueBeneficiaries: string[]
  KYCStatus: KYCStatuses
  setKYCStatus: (status: KYCStatuses) => void
}) => {
  const { KYCStatus, setKYCStatus } = props

  const [signer, setSigner] = useState<Signer>()
  const [connection, setConnection] = useState<any>(undefined)
  const [isFetchingIDVId, setIsFetchingIDVId] = useState<boolean>(false)
  const [kycButtonTxt, setKYCButtonText] = useState<string>('Verify')
  const [isFetchingKYCStatus, setIsFetchingKYCStatus] = useState<boolean>(true)
  const [currentKYCStatusTxt, setCurrentKYCStatusText] =
    useState<string>('Not verified')

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
      lazySetter(setIsFetchingIDVId, false, 1000)
      lazySetter(setIsFetchingKYCStatus, false, 1000)
      setKYCStatus(KYCStatuses.NOT_VERIFIED)
      setCurrentKYCStatusText('Not verified')
      setKYCButtonText('Verify')
      return
    }

    fetchKYCStatus()
    const interval = setInterval(() => fetchKYCStatus(true), 10 * 1000)
    return () => clearInterval(interval) // Cleanup.
  }, [signer])

  const fetchKYCStatus = async (isPolling: boolean = false) => {
    if (isPolling) {
      // Ignore triggering animate-pulse when polling for better UX.
      setIsFetchingKYCStatus(true)
    }

    const accountAddress = await signer?.getAddress()
    if (!accountAddress) {
      lazySetter(setIsFetchingIDVId, false, 1000)
      lazySetter(setIsFetchingKYCStatus, false, 1000)
      setKYCButtonText('Verify')
      setCurrentKYCStatusText('Not verified')
      setKYCStatus(KYCStatuses.NOT_VERIFIED)
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
      .then(
        (res) => res.json(),
        (err) => {
          throw new Error(err.message)
        },
      )
      .then(
        (res) =>
          res as {
            data?: {
              status?: string
            }
          },
        (err) => {
          throw new Error(err.message)
        },
      )
      .then(
        (res) =>
          res && res.data && res.data.status
            ? res.data.status.toLowerCase()
            : 'unverified',
        (err) => {
          throw new Error(err.message)
        },
      )
      .catch((err) => {
        setCurrentKYCStatusText('Not verified')
        setKYCButtonText('Verify')
        setKYCStatus(KYCStatuses.NOT_VERIFIED)
        return undefined
      })

    if (res) {
      switch (res) {
        case 'inprogress':
          setCurrentKYCStatusText(
            `Your KYC application is in progress.\nComplete your KYC application and return to this page.\nYou can start a fresh application by clicking on the Verify button below.`,
          )
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.IN_PROCESS)
          break
        case 'aborted':
          setCurrentKYCStatusText(
            `Your KYC application was incomplete.\nYou must start a fresh application by clicking on the Verify button below.`,
          )
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.NOT_VERIFIED)
          break
        case 'expired':
          setCurrentKYCStatusText(
            `Your previous KYC application was incomplete and it has expired.\nYou must start a fresh application by clicking on the Verify button below.`,
          )
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.NOT_VERIFIED)
          break
        case 'awaiting':
          setCurrentKYCStatusText(
            `Your previous KYC application is either in review or was left incomplete.\nIf you have completed the application process please wait for the verification.\nIf not, you can start a fresh application by clicking on the Verify button below.`,
          )
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.IN_PROCESS)
          break
        case 'approved':
          setCurrentKYCStatusText('Your KYC application is approved.')
          setKYCButtonText('Verified')
          setKYCStatus(KYCStatuses.VERIFIED)
          break
        case 'rejected':
          setCurrentKYCStatusText('Your KYC application was rejected.')
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.NOT_VERIFIED)
          break
        case 'unverified':
          setCurrentKYCStatusText('Not verified')
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.NOT_VERIFIED)
          break
        default:
          setCurrentKYCStatusText(
            `Not verified.\nYou can start a fresh application clicking on the Verify button below.`,
          )
          setKYCButtonText('Verify')
          setKYCStatus(KYCStatuses.NOT_VERIFIED)
          break
      }
    }

    lazySetter(setIsFetchingKYCStatus, false, 1000)
  }

  const setKYCInitiationFailed = (
    btnTxt?: string,
    currentStatusTxt?: string,
  ) => {
    setIsFetchingIDVId(false)
    setKYCButtonText(btnTxt || 'Verify')
    setCurrentKYCStatusText(currentStatusTxt || 'Not verified')
  }

  const initiateKYC = async () => {
    setIsFetchingIDVId(true)
    setKYCButtonText('Processing...')

    if (KYCStatus === KYCStatuses.VERIFIED || !signer) {
      setKYCInitiationFailed('Verified', 'Verified')
      return
    }

    const hash = hashMessage(`Verifying Clubs KYC`)
    const signature = await signer
      .signMessage(hash)
      .catch((err: any) => new Error(err))
    if (!signature || !hash || signature instanceof Error) {
      setKYCInitiationFailed('Verify', 'Not verified')
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
        setKYCInitiationFailed('Verify', 'Not verified')
      })

    if (!(res instanceof Error)) {
      if (res?.data?.id) {
        setCurrentKYCStatusText(
          'Complete your KYC application and return to this page.',
        )
        window.open(
          `${import.meta.env.PUBLIC_ONDATO_VERIFICATION_URL}/?id=${res?.data
            ?.id}`,
          '_blank',
        )
        setTimeout(() => setIsFetchingIDVId(false), 30 * 1000) // Set isFetchingIDVId to false in 30 secs.
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
              <p className="w-fit font-body text-base text-center font-bold text-dp-white-ink">
                {currentKYCStatusTxt.split('\n').map((text: string) => (
                  <>
                    {text} <br />
                  </>
                ))}
              </p>
              <button
                disabled={isFetchingKYCStatus || isFetchingIDVId}
                onClick={initiateKYC}
                className={`hs-button is-filled py-6 px-8 bg-dp-blue-grey-600 text-dp-blue-grey-ink ${
                  isFetchingKYCStatus ||
                  isFetchingIDVId ||
                  KYCStatus === KYCStatuses.IN_PROCESS
                    ? 'animate-pulse bg-dp-blue-grey-600'
                    : ''
                }`}
              >
                {kycButtonTxt}
              </button>
            </div>
          </div>
          {/* <a
            href="https://www.vecteezy.com/video/14415199-white-background-stripe-curve-wave-4k-resolution-clean-seamless-loop"
            target="_blank"
            rel="noopneer"
            className="absolute right-0 opacity-50 translate-y-9 text-xs"
          >
            White Background Stripe Curve Wave 4K resolution clean, Seamless
            loop Stock Videos by Vecteezy
          </a> */}
        </div>
      )}
    </>
  )
}

export default FundsInfo
