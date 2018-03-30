import {
  IExtensionMessageData,
  IExtensionAPIMessage,
  IExtensionState,
} from '../types'
import { TARGET_NAME, API_TYPE } from '../constants'
import { signMessage, handleSignMessageResponse } from './signMesage'

window.addEventListener('message', handleContentScriptMessage, false)

// expose apis
Object.assign(window, {
  myExtensionApis: {
    signMessage,
  },
})

const origin = location.origin
function handleContentScriptMessage(event: MessageEvent) {
  // validate message
  const data: IExtensionMessageData<any> = event.data
  if (
    event.origin !== origin ||
    event.source !== window ||
    typeof data !== 'object' ||
    data.message == null ||
    data.target !== TARGET_NAME.INPAGE
  ) {
    return
  }

  const message: IExtensionAPIMessage<any> = data.message
  switch (message.type) {
    case API_TYPE.SYNC_STATE:
      handleSyncState(message.payload)
      return
    case API_TYPE.SIGN_MESSAGE:
      handleSignMessageResponse(message.payload)
      return
    default:
      console.log('receive unknown type message from contentscript:', data.message)
  }
}

function handleSyncState(state: IExtensionState) {
  Object.assign(window, {
    myExtensionState: state,
  })
}
