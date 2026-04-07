// 1 USD ≈ 84 INR (approximate fixed rate — update as needed)
const USD_TO_INR = 84

export function toINR(usd: number | string): string {
  const amount = typeof usd === 'string' ? parseFloat(usd) : usd
  if (isNaN(amount)) return '—'
  const inr = Math.round(amount * USD_TO_INR)
  return `₹${inr.toLocaleString('en-IN')}`
}
