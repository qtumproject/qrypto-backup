import * as React from 'react'
import { render } from 'react-dom'

import App from './App'
import './global.css'
import { PORT_NAME } from '../constants'

import { handleGetBalanceResponse } from '../getBalance'
import { handleSendEtherResponse } from '../sendEther'
import { handleGetReceiptResponse } from '../getReceipt'

const port = chrome.runtime.connect({ name: PORT_NAME.POPUP })
port.onMessage.addListener(handleGetBalanceResponse)
port.onMessage.addListener(handleSendEtherResponse)
port.onMessage.addListener(handleGetReceiptResponse)

render(<App port={port}/>, document.getElementById('root'))
