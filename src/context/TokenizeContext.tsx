import React, {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react'

export type GithubFormParams = {}

export type ITokenize = {
  assetName: string
  setAssetName: Dispatch<SetStateAction<string>>
  tokenName: string
  setTokenName: Dispatch<SetStateAction<string>>
  tokenSymbol: string
  setTokenSymbol: Dispatch<SetStateAction<string>>
  personalAccessToken: string
  setPersonalAccessToken: Dispatch<SetStateAction<string>>
  isValid: boolean
  setIsValid: Dispatch<SetStateAction<boolean>>
  address: string
  setAddress: Dispatch<SetStateAction<string>>
  validateForm: () => void
  agreedToTerms: boolean
  setAgreedToTerms: Dispatch<SetStateAction<boolean>>
  reset: () => void
}

const tokenize: ITokenize = {
  assetName: '',
  setAssetName: () => {},
  tokenName: '',
  setTokenName: () => {},
  tokenSymbol: '',
  setTokenSymbol: () => {},
  personalAccessToken: '',
  setPersonalAccessToken: () => {},
  isValid: false,
  setIsValid: () => {},
  address: '',
  setAddress: () => {},
  validateForm: () => {},
  agreedToTerms: false,
  setAgreedToTerms: () => {},
  reset: () => {},
}

export const TokenizeContext = React.createContext(tokenize)

interface ITokenizeContextProps {
  children: React.ReactNode
}

export const TokenizeProvider: React.FC<ITokenizeContextProps> = ({
  children,
}: ITokenizeContextProps) => {
  const [assetName, setAssetName] = useState('')
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [personalAccessToken, setPersonalAccessToken] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [address, setAddress] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const validateForm = useCallback(() => {
    if (assetName.length <= 0) {
      setIsValid(false)
      return
    }

    if (tokenName.length < 3) {
      setIsValid(false)
      return
    }

    if (tokenSymbol.length < 3 || tokenSymbol.length > 4) {
      setIsValid(false)
      return
    }
    if (personalAccessToken.length <= 0) {
      setIsValid(false)
      return
    }

    setIsValid(true)
  }, [
    assetName.length,
    tokenName.length,
    tokenSymbol.length,
    personalAccessToken.length,
  ])

  useEffect(
    () => validateForm(),
    [assetName, tokenName, tokenSymbol, personalAccessToken, validateForm],
  )

  const reset = () => {
    setAssetName('')
    setTokenName('')
    setTokenSymbol('')
    setPersonalAccessToken('')
    setIsValid(false)
    setAgreedToTerms(false)
  }

  return (
    <TokenizeContext.Provider
      value={{
        assetName,
        setAssetName,
        tokenName,
        setTokenName,
        tokenSymbol,
        setTokenSymbol,
        personalAccessToken,
        setPersonalAccessToken,
        isValid,
        setIsValid,
        address,
        setAddress,
        validateForm,
        agreedToTerms,
        setAgreedToTerms,
        reset,
      }}
    >
      {children}
    </TokenizeContext.Provider>
  )
}
