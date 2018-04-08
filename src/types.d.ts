import { utils } from 'ethers'
import { API_TYPE, TARGET_NAME, INTERNAL_API_TYPE } from './constants'

export interface IExtensionMessageData<T> {
  target: TARGET_NAME
  message: T
}

export interface IExtensionAPIMessage<T> {
  type: API_TYPE
  payload: T
}

export interface IInternalAPIMessage<T> {
  type: INTERNAL_API_TYPE
  payload: T
}

export interface ISignMessageRequestPayload {
  id: string
  message: string
}

export interface ISignMessageResponsePayload {
  id: string
  signature?: string
  error?: string
}

export interface IGetBalanceRequestPayload {
  id: string
  address: string
  block?: string
}

export interface IGetBalanceResponsePayload {
  id: string
  balance?: string
  error?: string
}

export interface ISendEtherRequestPayload {
  id: string
  privateKey: string
  toAddress: string
  amount: string
}

export interface ISendEtherResponsePayload {
  id: string
  transactionHash?: string
  error?: string
}

export interface IGetReceiptRequestPayload {
  id: string
  transactionHash: string
}

export interface IGetReceiptResponsePayload {
  id: string
  receipt?: ITransactionReceiptSerialized
  error?: string
}

interface ITransactionReceipt {
  transactionHash: string
  blockHash: string
  blockNumber: number
  transactionIndex: number
  contractAddress: null | string
  cumulativeGasUsed: utils.BigNumber
  gasUsed: utils.BigNumber
  log: any[]
  logsBloom: string
  byzantium: boolean
  root: string
  status: number
}

interface ITransactionReceiptSerialized extends ITransactionReceipt {
  cumulativeGasUsed: string
  gasUsed: string
}
