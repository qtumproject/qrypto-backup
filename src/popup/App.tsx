import * as React from 'react'
import { networks, Wallet, Insight} from 'qtumjs-wallet'


function recoverWallet(mnemonic: string): Wallet {
  const network = networks.testnet
  return network.fromMnemonic(mnemonic)
}

class App extends React.Component<IProps, IState> {

  public constructor(props: IProps) {
    super(props)

    this.state = {
      mnemonic: 'hold struggle ready lonely august napkin enforce retire pipe where avoid drip',
      amount: 0,
      tip: ''
    }
  }

  public componentDidMount() {
    
  }

  private async getWalletInfo(wallet: Wallet) {
    const info = await wallet.getInfo()
    this.setState({wallet, info, tip: ''});
  }

  public renderWallet() {
    const {info, tip} = this.state;

    return (
      <div>
        {info && this.renderInfo()}
        {tip && this.renderTip()}
      </div>
    )
  }

  public renderInfo() {
    const info = this.state.info!;
    const { amount, receiver } = this.state;

    return (
      <div>
        <p>Address: {info.addrStr}</p>
        <p>
          Balance: {info.balance} QTUM
          <button onClick={this.handleRefresh}>Refresh</button>
        </p>
        <p>Pending txs: {info.unconfirmedTxApperances}</p>
        <p>Send to address:</p>
        <input type="text" onChange={this.handleReceiverChange} value={receiver}/>
        <p>Amount:</p>
        <input type="number" onChange={this.handleAmountChange} value={amount} />
        <button onClick={this.handleSendTo} disabled={!(amount && receiver)}>send!</button>
      </div>
    );
  }

  public renderTip() {
    const tip = this.state.tip!

    return (
      <p>{tip}</p>
    )
  }

  private handleAmountChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const value = event.target.value
    this.setState({ amount: value ? parseFloat(value) : 0 })
  }

  private handleReceiverChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ receiver: event.target.value })
  }

  private handleRefresh = () => {
    const wallet = this.state.wallet!
    this.setState({ tip: 'refreshing balance...' })
    this.getWalletInfo(wallet)
  }

  private handleSendTo =  async () => {
    this.setState({ tip: 'sending...'});

    const { receiver, amount } = this.state
    
    const wallet = this.state.wallet!

    try {
      await wallet.send(receiver, amount * 1e8, {
        feeRate: 400
      })
  
      this.setState({ tip: 'done' })
    } catch (err) {
      console.log(err)
      this.setState({ tip: err.message })
    }

  }

  public render() {

    const { mnemonic, wallet } = this.state

    return (
      <div>
        <input type="text" onChange={this.handleInputChange} value={mnemonic} />
        <button onClick={this.handleRecover}>
          create wallet
        </button>

        {wallet && this.renderWallet()}
      </div>
    )
  }

  private handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ mnemonic: event.target.value })
  }

  private handleRecover: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.setState({ wallet: undefined, receiver: '', amount: 0, tip: '' })

    const { mnemonic } = this.state

    try {
      const wallet = recoverWallet(mnemonic)
      this.getWalletInfo(wallet)
    } catch (err) {
      console.log('cannot set mnemonic', err)
    }
  }
}

interface IProps {
  port: chrome.runtime.Port
}

interface IState {
  mnemonic: string
  wallet?: Wallet
  info?: Insight.IGetInfo
  receiver: string
  amount: number
  tip: string
}

export default App
