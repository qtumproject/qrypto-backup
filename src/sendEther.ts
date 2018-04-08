import { IInternalAPIMessage, ISendEtherRequestPayload, ISendEtherResponsePayload } from './types'
import { INTERNAL_API_TYPE } from './constants'

const processingRequests: { [id: string]: IProcessingRequest } = {}

export function sendEther(
  port: chrome.runtime.Port,
  privateKey: string,
  toAddress: string,
  amount: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString().slice(-8)
    processingRequests[id] = { resolve, reject }

    const request: IInternalAPIMessage<ISendEtherRequestPayload> = {
      type: INTERNAL_API_TYPE.SEND_ETHER_REQUEST,
      payload: {
        id,
        privateKey,
        toAddress,
        amount,
      },
    }
    port.postMessage(request)
  })
}

export function handleSendEtherResponse(message: IInternalAPIMessage<ISendEtherResponsePayload>) {
  if (message.type !== INTERNAL_API_TYPE.SEND_ETHER_RESPONSE) {
    return
  }

  const response = message.payload

  const request = processingRequests[response.id]
  if (!request) {
    return
  }

  if (response.error != null) {
    request.reject(response.error)
    return
  }

  request.resolve(response.transactionHash)
}

interface IProcessingRequest {
  resolve: (transactionHash?: string) => void
  reject: (reason?: any) => void
}
