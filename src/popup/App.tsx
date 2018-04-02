import * as React from 'react'

import * as classes from './App.css'

import { PORT_NAME } from '../constants'
import HDWallet from '../HDWallet'

const port = chrome.runtime.connect({ name: PORT_NAME.POPUP })
port.onMessage.addListener(handleBackgroundMessage)
function handleBackgroundMessage(message: any) {
  console.log('from background:', message)
}

let storageMnemonic: string = ''
let addresses: string[] = []
chrome.storage.local.get('mnemonic', ({ mnemonic }) => {
  if (mnemonic == null) {
    return
  }

  storageMnemonic = mnemonic
  const wallet = new HDWallet(mnemonic)
  addresses = wallet.addresses
})

class App extends React.Component<IProps, IState> {
  private hasUnmounted = false
  public constructor(props: IProps) {
    super(props)

    this.state = {
      mnemonic: storageMnemonic,
      addresses,
    }
  }

  public componentDidMount() {
    if (this.state.mnemonic !== '') {
      return
    }

    chrome.storage.local.get('mnemonic', ({ mnemonic }) => {
      if (mnemonic == null || this.hasUnmounted) {
        return
      }

      const wallet = new HDWallet(mnemonic)

      this.setState({ mnemonic, addresses: wallet.addresses })
    })
  }

  public componentWillUnmount() {
    this.hasUnmounted = true
  }

  public render() {
    const { state } = this
    return (
      <div className={classes.container}>
        {state.addresses.map((address) => (
          <p key={address}>{address}</p>
        ))}
        <input type="text" onChange={this.handleInputChange} value={state.mnemonic} />
        <button onClick={this.handleRecover}>
          recover
        </button>
        <button onClick={this.handleReset}>
          reset
        </button>
      </div>
    )
  }

  private handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ mnemonic: event.target.value })
  }

  private handleRecover: React.MouseEventHandler<HTMLButtonElement> = () => {
    const { mnemonic } = this.state

    try {
      // tslint:disable-next-line
      const wallet = new HDWallet(mnemonic)
      chrome.storage.local.set({ mnemonic })
      this.setState({ addresses: wallet.addresses })
    } catch (err) {
      console.log('cannot set mnemonic', err)
    }
  }

  private handleReset: React.MouseEventHandler<HTMLButtonElement> = () => {
    chrome.storage.local.remove('mnemonic')
    this.setState({ mnemonic: '', addresses: [] })
  }
}

interface IProps {
}

interface IState {
  mnemonic: string
  addresses: string[]
}

export default App
