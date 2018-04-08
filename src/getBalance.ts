import { IGetBalanceResponsePayload, IInternalAPIMessage, IGetBalanceRequestPayload } from './types'
import { INTERNAL_API_TYPE } from './constants'

const processingRequests: { [id: string]: IProcessingRequest } = {}

export function getBalance(port: chrome.runtime.Port, address: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString().slice(-8)
    processingRequests[id] = { resolve, reject }

    const request: IInternalAPIMessage<IGetBalanceRequestPayload> = {
      type: INTERNAL_API_TYPE.GET_BALANCE_REQUEST,
      payload: {
        id,
        address,
      },
    }
    port.postMessage(request)
  })
}

export function handleGetBalanceResponse(message: IInternalAPIMessage<IGetBalanceResponsePayload>) {
  if (message.type !== INTERNAL_API_TYPE.GET_BALANCE_RESPONSE) {
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

  request.resolve(response.balance)
}

interface IProcessingRequest {
  resolve: (balance?: string) => void
  reject: (reason?: any) => void
}
