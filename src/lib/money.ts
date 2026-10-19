const ETH_DECIMALS = 18
const ETH_SCALE = 10n ** BigInt(ETH_DECIMALS)

/** Exact ETH decimal conversion. Monetary calculations never pass through IEEE-754 numbers. */
export function ethToWei(value: string): bigint {
  const normalized = value.trim()
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) throw new Error(`Valor ETH inválido: ${value}`)
  const negative = normalized.startsWith('-')
  const [whole, fraction = ''] = normalized.replace('-', '').split('.')
  const units = BigInt(whole) * ETH_SCALE + BigInt((fraction + '0'.repeat(ETH_DECIMALS)).slice(0, ETH_DECIMALS))
  return negative ? -units : units
}

export function weiToEth(value: bigint, minimumFractionDigits = 0, maximumFractionDigits = ETH_DECIMALS): string {
  const negative = value < 0n
  const absolute = negative ? -value : value
  const whole = absolute / ETH_SCALE
  const fraction = (absolute % ETH_SCALE).toString().padStart(ETH_DECIMALS, '0').slice(0, maximumFractionDigits)
  const trimmed = fraction.replace(/0+$/, '').padEnd(minimumFractionDigits, '0')
  return `${negative ? '-' : ''}${whole}${trimmed ? `.${trimmed}` : ''}`
}

export const multiplyEth = (value: string, quantity: number) => weiToEth(ethToWei(value) * BigInt(quantity))
export const sumEth = (values: string[]) => weiToEth(values.reduce((total, value) => total + ethToWei(value), 0n))
export const percentEth = (value: string, percent: number) => weiToEth((ethToWei(value) * BigInt(percent)) / 100n)
export const formatEth = (value: string, digits = 3) => weiToEth(ethToWei(value), digits, digits)
