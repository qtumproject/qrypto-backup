import { HDNode, Wallet } from 'ethers'

class HDWallet {
  public readonly addresses: string[] = []
  private readonly rootNode: HDNode
  private readonly wallets: {[address: string]: Wallet} = {}

  constructor(mnemonicPharse: string) {
    const isValidMnemonic: boolean = HDNode.isValidMnemonic(mnemonicPharse)
    if (!isValidMnemonic) {
      throw new Error('invalid mnemonic pharse')
    }

    const masterNode = HDNode.fromMnemonic(mnemonicPharse)
    this.rootNode = masterNode.derivePath(`m/44'/60'/0'/0`)
    this.addAccounts()
  }

  public signMessage(message: string, address = this.addresses[0]): string {
    const wallet = this.wallets[address]
    return wallet.signMessage(message)
  }

  public addAccounts(numberOfAccounts = 1) {
    const oldLen = Object.keys(this.wallets).length
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const childNode = this.rootNode.derivePath(i.toString())
      const wallet = new Wallet(childNode.privateKey)
      const { address } = wallet
      this.wallets[address] = wallet
      this.addresses.push(address)
    }
  }

  public getAccount(address: string): Wallet {
    return this.wallets[address]
  }
}

export default HDWallet
