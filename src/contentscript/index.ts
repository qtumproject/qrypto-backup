import chromeCall from 'chrome-call'

import {
  IExtensionMessageData,
  IExtensionAPIMessage,
  ISignMessageRequestPayload,
  ISignMessageResponsePayload,
} from '../types'

import { TARGET_NAME, PORT_NAME, API_TYPE } from '../constants'
import HDWallet from '../HDWallet'

injectScript(chrome.extension.getURL('inpage.js'))

window.addEventListener('message', handleWebPageMessage, false)

const port = chrome.runtime.connect({ name: PORT_NAME.CONTENTSCRIPT })
port.onMessage.addListener(responseExtensionAPI)

function injectScript(src: string) {
  const scriptElement = document.createElement('script')
  const headOrDocumentElement = document.head || document.documentElement

  scriptElement.onload = function onScriptLoad() {
    if (this.parentNode == null) {
      return
    }

    // syncState()

    this.parentNode.removeChild(this)
  }
  scriptElement.src = src
  headOrDocumentElement.insertAdjacentElement('afterbegin', scriptElement)
}

const origin = location.origin
function handleWebPageMessage(event: MessageEvent) {
  // validate message
  const data: IExtensionMessageData<any> = event.data
  if (
    event.origin !== origin ||
    event.source !== window ||
    typeof data !== 'object' ||
    data.message == null ||
    data.target !== TARGET_NAME.CONTENTSCRIPT
  ) {
    return
  }

  const message: IExtensionAPIMessage<any> = data.message
  switch (message.type) {
    case API_TYPE.SIGN_MESSAGE:
      handleSignMessage(message.payload)
      return
    default:
      console.log('receive unknown type message from contentscript:', data.message)
  }

  // forwarding message to background
  // port.postMessage(data.message)
}

function responseExtensionAPI<T>(message: IExtensionAPIMessage<T>) {
  const messagePayload: IExtensionMessageData<typeof message> = {
    target: TARGET_NAME.INPAGE,
    message,
  }

  window.postMessage(messagePayload, '*')
}

async function handleSignMessage(message: ISignMessageRequestPayload) {
  const storage: { mnemonic: string } = await chromeCall(chrome.storage.local, 'get', 'mnemonic')
  const { mnemonic } = storage

  if (mnemonic == null) {
    responseExtensionAPI<ISignMessageResponsePayload>({
      type: API_TYPE.SIGN_MESSAGE,
      payload: {
        id: message.id,
        error: 'cannot find mnemonic',
      },
    })
    return
  }

  const wallet = new HDWallet(mnemonic)
  const signature = wallet.signMessage(message.message)
  responseExtensionAPI<ISignMessageResponsePayload>({
    type: API_TYPE.SIGN_MESSAGE,
    payload: {
      id: message.id,
      signature,
    },
  })
}

// function syncState() {
//   chrome.storage.sync.get('mnemonic', (storage) => {
//     const mnemonic: string = storage.mnemonic
//     responseExtensionAPI<IExtensionState>({
//       type: API_TYPE.SYNC_STATE,
//       payload: { mnemonic },
//     })
//   })
// }
