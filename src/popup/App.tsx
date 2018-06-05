import * as React from 'react'
import { networks, Wallet, Insight} from 'qtumjs-wallet'

// import SendEther from './pages/sendEther'

// import HDWallet from '../HDWallet'

// import { utils } from 'ethers'
// import { getBalance } from '../getBalance'

let storageMnemonic: string = ''
// let storageWallet: HDWallet
chrome.storage.local.get('mnemonic', ({ mnemonic }) => {
  if (mnemonic == null) {
    return
  }

  storageMnemonic = mnemonic
  // storageWallet = new HDWallet(mnemonic)
})

function recoverWallet(mnemonic: string): Wallet {
  const network = networks.testnet
  return network.fromMnemonic(mnemonic)
}

class App extends React.Component<IProps, IState> {
  private hasUnmounted = false
  public constructor(props: IProps) {
    super(props)

    this.state = {
      mnemonic: 'hold struggle ready lonely august napkin enforce retire pipe where avoid drip',
      amount: 0
      // wallet: undefined,
      // balances: {},
      tip: ''
    }
  }

  public componentDidMount() {
    // if (this.state.mnemonic !== '') {
    //   return
    // }

    // chrome.storage.local.get('mnemonic', ({ mnemonic }) => {
    //   if (mnemonic == null || this.hasUnmounted) {
    //     return
    //   }

    //   const wallet = new HDWallet(mnemonic)

    //   this.setState({ mnemonic, wallet })
    // })
  }

  // public componentWillUnmount() {
  //   this.hasUnmounted = true
  // }

  private async getWalletInfo(wallet: Wallet) {
    const info = await wallet.getInfo()
    this.setState({wallet, info, tip: ''});
  }

  public renderWallet() {
    const {info, tip} = this.state;
    // if(wallet) {
    //   wallet.
    // }
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

  private async handleSendTo = () => {
    this.setState({ tip: 'sending...'});

    const { receiver, amount } = this.state
    
    const wallet = this.state.wallet!

    const tx = wallet.send(receiver, amount * 1e8, {
      feeRate: 400
    })

    this.setState({ tip: 'done' })
    
    tx.catch(err => {
      console.log(err)
      this.setState({ tip: err.message })
    })
  }

  public render() {
    // const mnemonic = 'foobar'

    const { mnemonic, wallet, info } = this.state

    return (
      <div>
        <input type="text" onChange={this.handleInputChange} value={mnemonic} />
        <button onClick={this.handleRecover}>
          create wallet
        </button>

        {wallet && this.renderWallet()}
      </div>
    )
    // const { page, usingAddress, wallet, balances, mnemonic } = this.state

    // if (page != null) {
    //   switch (page) {
    //     case 'sendEther':
    //       if (usingAddress == null || wallet == null || balances[usingAddress] == null) {
    //         throw new Error('cannot render sendEther page')
    //       }
    //       return (
    //         <SendEther
    //           address={usingAddress}
    //           port={this.props.port}
    //           hdWallet={wallet}
    //           balance={balances[usingAddress]}
    //         />
    //       )

    //     default:
    //   }
    // }

    // return (
    //   <div className={'container'}>
    //     {this.renderAccounts()}
    //     <input type="text" onChange={this.handleInputChange} value={mnemonic} />
    //     <button onClick={this.handleRecover}>
    //       recover
    //     </button>
    //     <button onClick={this.handleReset}>
    //       reset
    //     </button>
    //   </div>
    // )
  }

  private renderAccounts() {
    const { wallet } = this.state
    if (wallet == null) {
      return null
    }

    return (
      wallet.addresses.map((address) => (
        <div key={address}>
          {address}
          {' '}
          {this.renderBalance(address)}
        </div>
      ))
    )
  }

  private renderBalance(address: string) {
    const balance = this.state.balances[address]
    if (this.state.balances[address] == null) {
      this.fetchBalance(address)
      return
    }

    const balanceStr = utils.formatEther(utils.bigNumberify(balance))
    const [intergerPart, decimalPart] = balanceStr.split('.')

    return (
      <>
        <span>
          Balance: {intergerPart}{decimalPart == null ? null : `.${decimalPart.slice(0, 3)}`}
        </span>
        <button onClick={() => this.handleSend(address)}>
          Transfer
        </button>
      </>
    )
  }

  private async fetchBalance(address: string) {
    const balance = await getBalance(this.props.port, address)
    if (this.hasUnmounted) {
      return
    }

    this.setState(({ balances }) => ({
      balances: Object.assign(balances, {
        [address]: balance,
      }),
    }))
  }

  private handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    this.setState({ mnemonic: event.target.value })
  }

  private handleRecover: React.MouseEventHandler<HTMLButtonElement> = () => {
    this.setState({ wallet: undefined, receiver: '', amount: 0, tip: '' })

    const { mnemonic } = this.state

    try {
      // const wallet = new HDWallet(mnemonic)
      const wallet = recoverWallet(mnemonic)
      // chrome.storage.local.set({ mnemonic })
      this.getWalletInfo(wallet)
    } catch (err) {
      console.log('cannot set mnemonic', err)
    }
  }

  private handleReset: React.MouseEventHandler<HTMLButtonElement> = () => {
    chrome.storage.local.remove('mnemonic')
    this.setState({ mnemonic: '', wallet: undefined })
  }

  private handleSend = (address: string) => {
    this.setState({
      page: 'sendEther',
      usingAddress: address,
    })
  }
}

interface IProps {
  port: chrome.runtime.Port
}

interface IState {
  mnemonic: string
  // balances: { [address: string]: string }
  wallet?: Wallet
  info?: Insight.IGetInfo
  receiver: string
  amount: number
  tip: string
  // page?: string
  // usingAddress?: string
}

export default App
