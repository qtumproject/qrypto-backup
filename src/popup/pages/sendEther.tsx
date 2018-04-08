import * as React from 'react'

import { utils } from 'ethers'
import { getBalance } from '../../getBalance'
import { sendEther } from '../../sendEther'
import { getReceipt } from '../../getReceipt'

import HDWallet from '../../HDWallet'

class SendEther extends React.Component<IProps, IState> {
  private hasUnmounted = false

  constructor(props: IProps) {
    super(props)

    this.state = {
      toAddress: '',
      ether: '',
      balance: '',
    }
  }
  public componentWillMount() {
    const { balance } = this.props
    if (balance != null) {
      this.setState({ balance })
    }
  }

  public componentWillUnmount() {
    this.hasUnmounted = true
  }

  public render() {
    const { state } = this
    const { transactionHash } = state
    if (transactionHash != null) {
      return (
        <div className={'container'}>
          processing: {transactionHash}
        </div>
      )
    }
    return (
      <div className={'container'}>
        {this.renderBalance()}
        <label>
          Address:
          <input type="text" onChange={this.handleAddressInputChange} value={state.toAddress} />
        </label>
        <label>
          Ether:
          <input type="text" onChange={this.handleEtherInputChange} value={state.ether} />
        </label>
        <button onClick={this.handleSend}>
          send
        </button>
      </div>
    )
  }

  private renderBalance() {
    const balance = this.state.balance
    if (this.state.balance == null) {
      this.fetchBalance()
      return
    }

    const balanceStr = utils.formatEther(utils.bigNumberify(balance))
    const [intergerPart, decimalPart] = balanceStr.split('.')

    return <span>Balance: {intergerPart}{decimalPart == null ? null : `.${decimalPart.slice(0, 3)}`}</span>
  }

  private async fetchBalance() {
    const { port, address } = this.props
    const balance = await getBalance(port, address)
    if (this.hasUnmounted) {
      return
    }

    this.setState({ balance })
  }

  private handleAddressInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ toAddress: event.target.value })
  }

  private handleEtherInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ ether: event.target.value })
  }

  private handleSend = async () => {
    const { hdWallet, address, port } = this.props
    const { toAddress, ether } = this.state
    const wallet = hdWallet.getAccount(address)
    try {
      const transactionHash = await sendEther(port, wallet.privateKey, toAddress, ether)
      if (this.hasUnmounted) {
        return
      }

      this.setState({ transactionHash })

      const receipt = await getReceipt(port, transactionHash)

      console.log(receipt)
      this.setState({ transactionHash: undefined })
      this.fetchBalance()
    } catch (err) {
      console.log(err)
    }
  }
}

interface IProps {
  address: string
  port: chrome.runtime.Port
  hdWallet: HDWallet
  balance?: string
}

interface IState {
  toAddress: string
  ether: string
  balance: string
  transactionHash?: string
}

export default SendEther
