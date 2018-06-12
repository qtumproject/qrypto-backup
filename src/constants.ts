export enum TARGET_NAME {
  INPAGE = 'my_extension_inpage',
  CONTENTSCRIPT = 'my_extension_contentscript',
}

export enum PORT_NAME {
  POPUP = 'my_extension_popup',
  CONTENTSCRIPT = 'my_extension_contentscript',
}

export enum API_TYPE {
  SIGN_MESSAGE_REQUEST,
  SIGN_MESSAGE_RESPONSE,
  SEND_QTUM_REQUEST,
  SEND_QTUM_RESPONSET,
}

export enum INTERNAL_API_TYPE {
  GET_BALANCE_REQUEST,
  GET_BALANCE_RESPONSE,
  SEND_ETHER_REQUEST,
  SEND_ETHER_RESPONSE,
  GET_RECEIPT_REQUEST,
  GET_RECEIPT_RESPONSE,
}
