import {
  IInternalAPIMessage,
  IGetReceiptRequestPayload,
  IGetReceiptResponsePayload,
  ITransactionReceiptSerialized,
} from './types'
import { INTERNAL_API_TYPE } from './constants'

const processingRequests: { [id: string]: IProcessingRequest } = {}

export function getReceipt(port: chrome.runtime.Port, transactionHash: string): Promise<ITransactionReceiptSerialized> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString().slice(-8)
    processingRequests[id] = { resolve, reject }

    const request: IInternalAPIMessage<IGetReceiptRequestPayload> = {
      type: INTERNAL_API_TYPE.GET_RECEIPT_REQUEST,
      payload: {
        id,
        transactionHash,
      },
    }
    port.postMessage(request)
  })
}

export function handleGetReceiptResponse(message: IInternalAPIMessage<IGetReceiptResponsePayload>) {
  if (message.type !== INTERNAL_API_TYPE.GET_RECEIPT_RESPONSE) {
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

  request.resolve(response.receipt)
}

interface IProcessingRequest {
  resolve: (receipt?: ITransactionReceiptSerialized) => void
  reject: (reason?: any) => void
}
