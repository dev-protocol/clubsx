import React from 'react'
import BoringAvatars from 'boring-avatars-esm'

export default ({ id }: { id: string }) => {
  return <BoringAvatars name={id} variant="beam" />
}
