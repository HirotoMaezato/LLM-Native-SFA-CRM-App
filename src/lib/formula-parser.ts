"use client"

import { Deal, CalculatedField } from "@/types/deal"

// Supported operators and functions
const OPERATORS = ['+', '-', '*', '/', '%', '(', ')']
const FUNCTIONS = [
  'SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'IF', 'ABS', 'ROUND', 'FLOOR', 'CEIL',
  // Text manipulation functions
  'LEN', 'LEFT', 'RIGHT', 'MID', 'UPPER', 'LOWER', 'TRIM', 'CONCAT', 'SUBSTITUTE',
  'FIND', 'TEXT', 'VALUE', 'ISNUMBER', 'ISTEXT'
]

// Token types
type TokenType = 'NUMBER' | 'FIELD' | 'OPERATOR' | 'FUNCTION' | 'COMMA' | 'STRING'

interface Token {
  type: TokenType
  value: string | number
}

// Result type for formula evaluation
interface FormulaResult {
  value: number
  stringValue?: string
}

// Tokenize the formula string
function tokenize(formula: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < formula.length) {
    const char = formula[i]

    // Skip whitespace
    if (/\s/.test(char)) {
      i++
      continue
    }

    // Numbers
    if (/\d/.test(char) || (char === '.' && /\d/.test(formula[i + 1]))) {
      let num = ''
      while (i < formula.length && (/\d/.test(formula[i]) || formula[i] === '.')) {
        num += formula[i]
        i++
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(num) })
      continue
    }

    // Operators
    if (OPERATORS.includes(char)) {
      tokens.push({ type: 'OPERATOR', value: char })
      i++
      continue
    }

    // Comma
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' })
      i++
      continue
    }

    // String literals
    if (char === '"' || char === "'") {
      const quote = char
      let str = ''
      i++
      while (i < formula.length && formula[i] !== quote) {
        str += formula[i]
        i++
      }
      i++ // Skip closing quote
      tokens.push({ type: 'STRING', value: str })
      continue
    }

    // Identifiers (fields or functions)
    if (/[a-zA-Z_]/.test(char)) {
      let identifier = ''
      while (i < formula.length && /[a-zA-Z0-9_]/.test(formula[i])) {
        identifier += formula[i]
        i++
      }

      if (FUNCTIONS.includes(identifier.toUpperCase())) {
        tokens.push({ type: 'FUNCTION', value: identifier.toUpperCase() })
      } else {
        tokens.push({ type: 'FIELD', value: identifier })
      }
      continue
    }

    // Unknown character, skip
    i++
  }

  return tokens
}

// Evaluate a formula for a single deal
export function evaluateFormula(formula: string, deal: Deal): number {
  try {
    const tokens = tokenize(formula)
    const result = parseExpression(tokens, deal, 0)
    return result.value
  } catch {
    return 0
  }
}

// Parse expression with operator precedence
function parseExpression(tokens: Token[], deal: Deal, index: number): { value: number; index: number } {
  let result = parseTerm(tokens, deal, index)

  while (result.index < tokens.length) {
    const token = tokens[result.index]
    if (token.type === 'OPERATOR' && (token.value === '+' || token.value === '-')) {
      const operator = token.value
      const right = parseTerm(tokens, deal, result.index + 1)
      result.value = operator === '+' ? result.value + right.value : result.value - right.value
      result.index = right.index
    } else {
      break
    }
  }

  return result
}

// Parse term (multiplication and division)
function parseTerm(tokens: Token[], deal: Deal, index: number): { value: number; index: number } {
  let result = parseFactor(tokens, deal, index)

  while (result.index < tokens.length) {
    const token = tokens[result.index]
    if (token.type === 'OPERATOR' && (token.value === '*' || token.value === '/' || token.value === '%')) {
      const operator = token.value
      const right = parseFactor(tokens, deal, result.index + 1)
      if (operator === '*') {
        result.value = result.value * right.value
      } else if (operator === '/') {
        result.value = right.value !== 0 ? result.value / right.value : 0
      } else {
        result.value = right.value !== 0 ? result.value % right.value : 0
      }
      result.index = right.index
    } else {
      break
    }
  }

  return result
}

// Parse factor (numbers, fields, functions, parentheses)
function parseFactor(tokens: Token[], deal: Deal, index: number): { value: number; index: number } {
  if (index >= tokens.length) {
    return { value: 0, index }
  }

  const token = tokens[index]

  // Number
  if (token.type === 'NUMBER') {
    return { value: token.value as number, index: index + 1 }
  }

  // String literal (convert to number 0, but store for text functions)
  if (token.type === 'STRING') {
    return { value: 0, index: index + 1 }
  }

  // Field reference
  if (token.type === 'FIELD') {
    const fieldName = token.value as string
    const fieldValue = getFieldValue(deal, fieldName)
    return { value: fieldValue, index: index + 1 }
  }

  // Function call
  if (token.type === 'FUNCTION') {
    return parseFunction(tokens, deal, index)
  }

  // Parentheses
  if (token.type === 'OPERATOR' && token.value === '(') {
    const result = parseExpression(tokens, deal, index + 1)
    if (tokens[result.index]?.type === 'OPERATOR' && tokens[result.index]?.value === ')') {
      result.index++
    }
    return result
  }

  return { value: 0, index: index + 1 }
}

// Parse function calls
function parseFunction(tokens: Token[], deal: Deal, index: number): { value: number; index: number } {
  const funcName = tokens[index].value as string
  let currentIndex = index + 1

  // Expect opening parenthesis
  if (tokens[currentIndex]?.type === 'OPERATOR' && tokens[currentIndex]?.value === '(') {
    currentIndex++
  } else {
    return { value: 0, index: currentIndex }
  }

  // Parse arguments (collect both numeric values and raw tokens for string functions)
  const args: number[] = []
  const stringArgs: string[] = []
  const startArgIndex = currentIndex

  while (currentIndex < tokens.length) {
    if (tokens[currentIndex]?.type === 'OPERATOR' && tokens[currentIndex]?.value === ')') {
      currentIndex++
      break
    }

    // Check if this argument is a string literal
    if (tokens[currentIndex]?.type === 'STRING') {
      stringArgs.push(tokens[currentIndex].value as string)
      args.push(0)
      currentIndex++
    } else if (tokens[currentIndex]?.type === 'FIELD') {
      // For text functions, we need the string value of fields
      const fieldName = tokens[currentIndex].value as string
      const stringValue = getStringFieldValue(deal, fieldName)
      stringArgs.push(stringValue)
      args.push(getFieldValue(deal, fieldName))
      currentIndex++
    } else {
      const argResult = parseExpression(tokens, deal, currentIndex)
      args.push(argResult.value)
      stringArgs.push(String(argResult.value))
      currentIndex = argResult.index
    }

    // Skip comma
    if (tokens[currentIndex]?.type === 'COMMA') {
      currentIndex++
    }
  }

  // Execute function
  let result = 0
  switch (funcName) {
    case 'SUM':
      result = args.reduce((a, b) => a + b, 0)
      break
    case 'AVG':
      result = args.length > 0 ? args.reduce((a, b) => a + b, 0) / args.length : 0
      break
    case 'MIN':
      result = args.length > 0 ? Math.min(...args) : 0
      break
    case 'MAX':
      result = args.length > 0 ? Math.max(...args) : 0
      break
    case 'COUNT':
      result = args.length
      break
    case 'IF':
      result = args[0] ? (args[1] || 0) : (args[2] || 0)
      break
    case 'ABS':
      result = Math.abs(args[0] || 0)
      break
    case 'ROUND':
      result = Math.round(args[0] || 0)
      break
    case 'FLOOR':
      result = Math.floor(args[0] || 0)
      break
    case 'CEIL':
      result = Math.ceil(args[0] || 0)
      break
    // Text manipulation functions
    case 'LEN':
      result = stringArgs[0]?.length || 0
      break
    case 'LEFT':
      // LEFT(text, num_chars) - returns the number of characters from the left
      result = stringArgs[0]?.substring(0, args[1] || 0).length || 0
      break
    case 'RIGHT':
      // RIGHT(text, num_chars) - returns the number of characters from the right
      const rightStr = stringArgs[0] || ''
      result = rightStr.substring(Math.max(0, rightStr.length - (args[1] || 0))).length || 0
      break
    case 'MID':
      // MID(text, start, num_chars) - returns characters from middle
      result = stringArgs[0]?.substring(args[1] - 1 || 0, (args[1] - 1 || 0) + (args[2] || 0)).length || 0
      break
    case 'FIND':
      // FIND(find_text, within_text) - returns position (1-based) or 0 if not found
      const findIndex = stringArgs[1]?.indexOf(stringArgs[0] || '') ?? -1
      result = findIndex >= 0 ? findIndex + 1 : 0
      break
    case 'UPPER':
    case 'LOWER':
    case 'TRIM':
      // These return strings, but for numeric context, return length
      result = stringArgs[0]?.length || 0
      break
    case 'CONCAT':
      // CONCAT returns a string, for numeric context, return combined length
      result = stringArgs.join('').length
      break
    case 'SUBSTITUTE':
      // SUBSTITUTE(text, old_text, new_text) - returns length of result
      const substituted = stringArgs[0]?.replace(new RegExp(stringArgs[1] || '', 'g'), stringArgs[2] || '') || ''
      result = substituted.length
      break
    case 'TEXT':
      // TEXT(value, format) - converts number to text, returns length
      result = String(args[0] || 0).length
      break
    case 'VALUE':
      // VALUE(text) - converts text to number
      result = parseFloat(stringArgs[0]) || 0
      break
    case 'ISNUMBER':
      // ISNUMBER(value) - returns 1 if number, 0 if not
      result = !isNaN(args[0]) ? 1 : 0
      break
    case 'ISTEXT':
      // ISTEXT(value) - returns 1 if text, 0 if not
      result = isNaN(args[0]) ? 1 : 0
      break
  }

  return { value: result, index: currentIndex }
}

// Get string field value from deal
function getStringFieldValue(deal: Deal, fieldName: string): string {
  switch (fieldName.toLowerCase()) {
    case 'title':
      return deal.title
    case 'company':
      return deal.company
    case 'contactperson':
    case 'contact_person':
      return deal.contactPerson
    case 'contactemail':
    case 'contact_email':
      return deal.contactEmail || ''
    case 'contactphone':
    case 'contact_phone':
      return deal.contactPhone || ''
    case 'status':
      return deal.status
    case 'priority':
      return deal.priority
    case 'description':
      return deal.description || ''
    case 'area':
      return deal.area || ''
    case 'product':
      return deal.product || ''
    case 'team':
      return deal.team || ''
    case 'notes':
      return deal.notes || ''
    case 'amount':
      return String(deal.amount)
    case 'probability':
      return String(deal.probability)
    default:
      const value = (deal as unknown as Record<string, unknown>)[fieldName]
      return String(value || '')
  }
}

// Get numeric field value from deal
function getFieldValue(deal: Deal, fieldName: string): number {
  switch (fieldName.toLowerCase()) {
    case 'amount':
      return deal.amount
    case 'probability':
      return deal.probability
    case 'expectedvalue':
    case 'expected_value':
      return deal.amount * deal.probability / 100
    default:
      // Try to get any numeric field
      const value = (deal as unknown as Record<string, unknown>)[fieldName]
      if (typeof value === 'number') {
        return value
      }
      return 0
  }
}

// Evaluate calculated fields for a deal
export function evaluateCalculatedFields(
  deal: Deal,
  calculatedFields: CalculatedField[]
): Record<string, number> {
  const results: Record<string, number> = {}

  for (const field of calculatedFields) {
    results[field.id] = evaluateFormula(field.formula, deal)
  }

  return results
}

// Aggregate function for multiple deals
export function aggregateFormulaOverDeals(
  formula: string,
  deals: Deal[],
  aggregationType: 'sum' | 'average' | 'min' | 'max' | 'count'
): number {
  if (deals.length === 0) return 0

  const values = deals.map(deal => evaluateFormula(formula, deal))

  switch (aggregationType) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0)
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length
    case 'min':
      return Math.min(...values)
    case 'max':
      return Math.max(...values)
    case 'count':
      return deals.length
    default:
      return 0
  }
}

// Validate formula syntax
export function validateFormula(formula: string): { valid: boolean; error?: string } {
  try {
    const tokens = tokenize(formula)

    if (tokens.length === 0) {
      return { valid: false, error: '数式が空です' }
    }

    // Check for balanced parentheses
    let parenCount = 0
    for (const token of tokens) {
      if (token.type === 'OPERATOR') {
        if (token.value === '(') parenCount++
        if (token.value === ')') parenCount--
        if (parenCount < 0) {
          return { valid: false, error: '括弧の対応が正しくありません' }
        }
      }
    }

    if (parenCount !== 0) {
      return { valid: false, error: '括弧の対応が正しくありません' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, error: '数式の解析に失敗しました' }
  }
}

// Get list of available fields for formulas
export function getAvailableFormulaFields(): { name: string; label: string; description: string; type: 'number' | 'text' }[] {
  return [
    // Numeric fields
    { name: 'amount', label: '金額', description: '商談金額', type: 'number' },
    { name: 'probability', label: '確度', description: '成約確度(0-100)', type: 'number' },
    { name: 'expectedValue', label: '期待値', description: '金額 × 確度 / 100', type: 'number' },
    // Text fields
    { name: 'title', label: '案件名', description: '商談のタイトル', type: 'text' },
    { name: 'company', label: '会社名', description: '取引先会社', type: 'text' },
    { name: 'contactPerson', label: '担当者', description: '顧客担当者', type: 'text' },
    { name: 'contactEmail', label: 'メール', description: '連絡先メール', type: 'text' },
    { name: 'status', label: 'ステータス', description: '商談ステータス', type: 'text' },
    { name: 'priority', label: '優先度', description: '優先度', type: 'text' },
    { name: 'area', label: 'エリア', description: '担当エリア', type: 'text' },
    { name: 'product', label: '商材', description: '商品・サービス', type: 'text' },
    { name: 'team', label: 'チーム', description: '営業チーム', type: 'text' },
    { name: 'description', label: '説明', description: '商談の説明', type: 'text' },
    { name: 'notes', label: 'メモ', description: '備考', type: 'text' },
  ]
}

// Get list of available functions
export function getAvailableFunctions(): { name: string; syntax: string; description: string; category: 'math' | 'text' | 'logic' }[] {
  return [
    // Math functions
    { name: 'SUM', syntax: 'SUM(a, b, ...)', description: '引数の合計', category: 'math' },
    { name: 'AVG', syntax: 'AVG(a, b, ...)', description: '引数の平均', category: 'math' },
    { name: 'MIN', syntax: 'MIN(a, b, ...)', description: '引数の最小値', category: 'math' },
    { name: 'MAX', syntax: 'MAX(a, b, ...)', description: '引数の最大値', category: 'math' },
    { name: 'ABS', syntax: 'ABS(数値)', description: '絶対値', category: 'math' },
    { name: 'ROUND', syntax: 'ROUND(数値)', description: '四捨五入', category: 'math' },
    { name: 'FLOOR', syntax: 'FLOOR(数値)', description: '切り捨て', category: 'math' },
    { name: 'CEIL', syntax: 'CEIL(数値)', description: '切り上げ', category: 'math' },
    // Logic functions
    { name: 'IF', syntax: 'IF(条件, 真の値, 偽の値)', description: '条件分岐', category: 'logic' },
    { name: 'ISNUMBER', syntax: 'ISNUMBER(値)', description: '数値かどうか判定', category: 'logic' },
    { name: 'ISTEXT', syntax: 'ISTEXT(値)', description: 'テキストかどうか判定', category: 'logic' },
    // Text functions
    { name: 'LEN', syntax: 'LEN(テキスト)', description: '文字数を取得', category: 'text' },
    { name: 'LEFT', syntax: 'LEFT(テキスト, 文字数)', description: '左から指定文字数を取得', category: 'text' },
    { name: 'RIGHT', syntax: 'RIGHT(テキスト, 文字数)', description: '右から指定文字数を取得', category: 'text' },
    { name: 'MID', syntax: 'MID(テキスト, 開始, 文字数)', description: '中間の文字を取得', category: 'text' },
    { name: 'FIND', syntax: 'FIND(検索文字, テキスト)', description: '文字の位置を検索', category: 'text' },
    { name: 'CONCAT', syntax: 'CONCAT(テキスト1, テキスト2, ...)', description: '文字列を連結', category: 'text' },
    { name: 'SUBSTITUTE', syntax: 'SUBSTITUTE(テキスト, 旧, 新)', description: '文字を置換', category: 'text' },
    { name: 'UPPER', syntax: 'UPPER(テキスト)', description: '大文字に変換', category: 'text' },
    { name: 'LOWER', syntax: 'LOWER(テキスト)', description: '小文字に変換', category: 'text' },
    { name: 'TRIM', syntax: 'TRIM(テキスト)', description: '前後の空白を除去', category: 'text' },
    { name: 'VALUE', syntax: 'VALUE(テキスト)', description: '数値に変換', category: 'text' },
    { name: 'TEXT', syntax: 'TEXT(数値)', description: 'テキストに変換', category: 'text' },
  ]
}
