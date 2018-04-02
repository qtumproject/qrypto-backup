import { PORT_NAME } from '../constants'

chrome.runtime.onConnect.addListener((handleConnect))

// let contentScriptPort: chrome.runtime.Port
// let popUpPort: chrome.runtime.Port

function handleConnect(port: chrome.runtime.Port) {
  if (port.name === PORT_NAME.CONTENTSCRIPT) {
    // contentScriptPort = port
    port.onMessage.addListener((message) => {
      console.log('from content script port:', message)
      // port.postMessage(message)
    })
    return
  }

  // if (port.name === PORT_NAME.POPUP) {
  //   popUpPort = port
  //   port.onMessage.addListener((message) => {
  //     if (typeof message === 'object') {
  //       contentScriptPort.postMessage(message)
  //       return
  //     }
  //   })
  //   return
  // }
}
