"use client"

import { Deal, CalculatedField } from "@/types/deal"

// Supported operators and functions
const OPERATORS = ['+', '-', '*', '/', '%', '(', ')']
const FUNCTIONS = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT', 'IF', 'ABS', 'ROUND', 'FLOOR', 'CEIL']

// Token types
type TokenType = 'NUMBER' | 'FIELD' | 'OPERATOR' | 'FUNCTION' | 'COMMA'

interface Token {
  type: TokenType
  value: string | number
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

  // Parse arguments
  const args: number[] = []
  while (currentIndex < tokens.length) {
    if (tokens[currentIndex]?.type === 'OPERATOR' && tokens[currentIndex]?.value === ')') {
      currentIndex++
      break
    }

    const argResult = parseExpression(tokens, deal, currentIndex)
    args.push(argResult.value)
    currentIndex = argResult.index

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
  }

  return { value: result, index: currentIndex }
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
export function getAvailableFormulaFields(): { name: string; label: string; description: string }[] {
  return [
    { name: 'amount', label: '金額', description: '商談金額' },
    { name: 'probability', label: '確度', description: '成約確度(0-100)' },
    { name: 'expectedValue', label: '期待値', description: '金額 × 確度 / 100' },
  ]
}

// Get list of available functions
export function getAvailableFunctions(): { name: string; syntax: string; description: string }[] {
  return [
    { name: 'SUM', syntax: 'SUM(a, b, ...)', description: '引数の合計' },
    { name: 'AVG', syntax: 'AVG(a, b, ...)', description: '引数の平均' },
    { name: 'MIN', syntax: 'MIN(a, b, ...)', description: '引数の最小値' },
    { name: 'MAX', syntax: 'MAX(a, b, ...)', description: '引数の最大値' },
    { name: 'IF', syntax: 'IF(条件, 真の値, 偽の値)', description: '条件分岐' },
    { name: 'ABS', syntax: 'ABS(数値)', description: '絶対値' },
    { name: 'ROUND', syntax: 'ROUND(数値)', description: '四捨五入' },
    { name: 'FLOOR', syntax: 'FLOOR(数値)', description: '切り捨て' },
    { name: 'CEIL', syntax: 'CEIL(数値)', description: '切り上げ' },
  ]
}
