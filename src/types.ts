import { API_TYPE, TARGET_NAME } from './constants'

export interface IExtensionMessageData<T> {
  target: TARGET_NAME
  message: T
}

export interface IExtensionAPIMessage<T> {
  type: API_TYPE
  payload: T
}

export interface IExtensionState {
  mnemonic?: string
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
