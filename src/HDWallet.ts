import { HDKey, Mnemonic, EthereumAddress } from 'wallet.ts'
import * as ethUtil from 'ethereumjs-util'

class HDWallet {
  public readonly addresses: string[] = []
  private readonly root: HDKey
  private readonly wallets: {[address: string]: HDKey} = {}

  constructor(mnemonicPharse: string) {
    const mnemonic = Mnemonic.parse(mnemonicPharse)
    if (mnemonic == null) {
      throw new Error('invalid mnemonic')
    }
    const seed = mnemonic.toSeed()
    const hdWallet = HDKey.parseMasterSeed(seed)
    this.root = hdWallet.derive(`m/44'/60'/0'/0`)
    this.addAccounts()
  }

  public signMessage(str: string): string {
    // @types/ethereumjs-util wrong typing..
    const messageHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(str) as any)
    const privateKey = this.wallets[this.addresses[0]].privateKey!
    const rawSignature = ethUtil.ecsign(messageHash, privateKey)
    const signature = concatSig(rawSignature.v, rawSignature.r, rawSignature.s)
    return signature
  }

  public addAccounts(numberOfAccounts = 1) {
    const oldLen = Object.keys(this.wallets).length
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const childWallet = this.root.derive(i.toString())
      const address = EthereumAddress.from(childWallet.publicKey).address
      this.wallets[address] = childWallet
      this.addresses.push(address)
    }
  }
}

function removeHexPrefix(hex: string): string {
  return hex.startsWith('0x') ? hex.slice(2) : hex
}

function concatSig(r: Buffer, s: Buffer, v: Buffer): string {
  const { fromSigned } = ethUtil
  const rSig = fromSigned(r)
  const sSig = fromSigned(s)

  const { toUnsigned } = ethUtil
  const rStr = padWithZeroes(toUnsigned(rSig).toString('hex'), 64)
  const sStr = padWithZeroes(toUnsigned(sSig).toString('hex'), 64)
  const vStr = removeHexPrefix(ethUtil.bufferToHex(v))
  return ethUtil.addHexPrefix(rStr.concat(sStr, vStr))
}

function padWithZeroes(num: string, length: number): string {
  return num.padStart(length, '0')
}

export default HDWallet
