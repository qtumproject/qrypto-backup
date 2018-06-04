import * as React from 'react'
import { networks, Wallet } from 'qtumjs-wallet'

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
      mnemonic: '',
      // wallet: undefined,
      // balances: {},
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

  public renderWallet() {
    const wallet = this.state.wallet!

    // if(wallet) {
    //   wallet.
    // }
    return (
      <div>{wallet.address}</div>
    )
  }

  public render() {
    // const mnemonic = 'foobar'

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
    const { mnemonic } = this.state

    try {
      // const wallet = new HDWallet(mnemonic)
      const wallet = recoverWallet(mnemonic)
      // chrome.storage.local.set({ mnemonic })
      this.setState({ wallet })
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
  // page?: string
  // usingAddress?: string
}

export default App
