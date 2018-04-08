import { INTERNAL_API_TYPE } from '../constants'
import { providers, Wallet, utils } from 'ethers'
import {
  IInternalAPIMessage,
  IGetBalanceRequestPayload,
  IGetBalanceResponsePayload,
  ISendEtherRequestPayload,
  ISendEtherResponsePayload,
  IGetReceiptRequestPayload,
  IGetReceiptResponsePayload,
  ITransactionReceipt,
} from '../types'

const provider = providers.getDefaultProvider('rinkeby')
chrome.runtime.onConnect.addListener(handleConnect)

function handleConnect(port: chrome.runtime.Port) {
  port.onMessage.addListener(handleMessage.bind(port, port))
  return
}

function handleMessage(port: chrome.runtime.Port, message: IInternalAPIMessage<any>) {
  switch (message.type) {
    case INTERNAL_API_TYPE.GET_BALANCE_REQUEST:
      handleGetBalance(port, message.payload)
      break
    case INTERNAL_API_TYPE.SEND_ETHER_REQUEST:
      handleSendEther(port, message.payload)
      break
    case INTERNAL_API_TYPE.GET_RECEIPT_REQUEST:
      handleGetReceipt(port, message.payload)
      break
    default:
      throw new Error('unknown api message type')
  }
}

async function handleGetBalance(port: chrome.runtime.Port, payload: IGetBalanceRequestPayload) {
  const { address, block, id } = payload
  const balance = await provider.getBalance(address, block)
  const response: IInternalAPIMessage<IGetBalanceResponsePayload> = {
    type: INTERNAL_API_TYPE.GET_BALANCE_RESPONSE,
    payload: {
      id,
      balance: balance.toString(),
    },
  }

  port.postMessage(response)
}

async function handleSendEther(port: chrome.runtime.Port, payload: ISendEtherRequestPayload) {
  const { privateKey, toAddress, amount, id } = payload
  const wallet = new Wallet(privateKey, provider)
  const wei = utils.parseEther(amount)
  const transaction = await wallet.send(toAddress, wei)
  const response: IInternalAPIMessage<ISendEtherResponsePayload> = {
    type: INTERNAL_API_TYPE.SEND_ETHER_RESPONSE,
    payload: {
      id,
      transactionHash: transaction.hash,
    },
  }

  port.postMessage(response)
}

async function handleGetReceipt(port: chrome.runtime.Port, payload: IGetReceiptRequestPayload) {
  const { transactionHash, id } = payload
  let receipt: ITransactionReceipt | null = null
  while (receipt == null) {
    receipt = await provider.getTransactionReceipt(transactionHash)
    await sleep(3000)
  }
  const response: IInternalAPIMessage<IGetReceiptResponsePayload> = {
    type: INTERNAL_API_TYPE.GET_RECEIPT_RESPONSE,
    payload: {
      id,
      receipt: Object.assign({}, receipt, {
        cumulativeGasUsed: receipt.cumulativeGasUsed.toString(),
        gasUsed: receipt.gasUsed.toString(),
      }),
    },
  }

  port.postMessage(response)
}

export async function sleep(ms: number) {
  return new Promise((resolve) => { setTimeout(() => { resolve() }, ms) })
}
