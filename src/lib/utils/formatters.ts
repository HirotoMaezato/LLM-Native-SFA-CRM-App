// 金額の単位定数
const ONE_MAN = 10000 // 1万円
const ONE_OKU = 100000000 // 1億円

/**
 * 金額を日本円の単位でフォーマットします
 * @param amount - 金額（円単位）
 * @returns フォーマットされた金額文字列（例: "5.0億円", "1000万円"）
 */
export function formatRevenue(amount?: number): string {
  if (!amount) return "-"

  // 1億円以上の場合は億円単位
  if (amount >= ONE_OKU) {
    return `${(amount / ONE_OKU).toFixed(1)}億円`
  }

  // それ以外は万円単位
  return `${(amount / ONE_MAN).toFixed(0)}万円`
}

/**
 * 金額を万円単位でフォーマットします
 * @param amount - 金額（円単位）
 * @returns フォーマットされた金額文字列（例: "¥1000万"）
 */
export function formatAmount(amount: number): string {
  return `¥${(amount / ONE_MAN).toFixed(0)}万`
}
