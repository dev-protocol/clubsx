import {callSimpleCollections} from './simpleCollections'
import { BaseProvider } from '@ethersproject/providers';
import {setImagesProps} from './types/setImageArg';
import { ClubsConfiguration, setConfig } from '@devprotocol/clubs-core'

const args: setImagesProps = {
}
const config: ClubsConfiguration
const {propertyAddress} = config


export const example = async (provider: BaseProvider) => {
    const setImage = await callSimpleCollections(provider, 'setImage', [])
    }
