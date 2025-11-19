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

// Table/Category definition for organized field selection
export interface TableDefinition {
  id: string
  name: string
  description: string
  fields: FormulaField[]
}

export interface FormulaField {
  name: string
  label: string
  description: string
  type: 'number' | 'text' | 'date'
}

// Get all available tables with their fields
export function getAvailableTables(): TableDefinition[] {
  return [
    {
      id: 'deal',
      name: '商談',
      description: '商談・案件に関するデータ',
      fields: [
        // Numeric fields
        { name: 'amount', label: '金額', description: '商談金額', type: 'number' },
        { name: 'probability', label: '確度', description: '成約確度(0-100)', type: 'number' },
        { name: 'expectedValue', label: '期待値', description: '金額 × 確度 / 100', type: 'number' },
        // Text fields
        { name: 'title', label: '案件名', description: '商談のタイトル', type: 'text' },
        { name: 'company', label: '会社名', description: '取引先会社', type: 'text' },
        { name: 'contactPerson', label: '担当者', description: '顧客担当者', type: 'text' },
        { name: 'contactEmail', label: 'メール', description: '連絡先メール', type: 'text' },
        { name: 'contactPhone', label: '電話', description: '連絡先電話番号', type: 'text' },
        { name: 'status', label: 'ステータス', description: '商談ステータス', type: 'text' },
        { name: 'priority', label: '優先度', description: '優先度', type: 'text' },
        { name: 'area', label: 'エリア', description: '担当エリア', type: 'text' },
        { name: 'product', label: '商材', description: '商品・サービス', type: 'text' },
        { name: 'team', label: 'チーム', description: '営業チーム', type: 'text' },
        { name: 'description', label: '説明', description: '商談の説明', type: 'text' },
        { name: 'notes', label: 'メモ', description: '備考', type: 'text' },
        // Date fields
        { name: 'expectedCloseDate', label: '予定完了日', description: '成約予定日', type: 'date' },
        { name: 'createdAt', label: '作成日', description: '案件作成日時', type: 'date' },
        { name: 'updatedAt', label: '更新日', description: '最終更新日時', type: 'date' },
      ]
    },
    {
      id: 'company',
      name: '会社',
      description: '取引先会社に関するデータ（将来拡張予定）',
      fields: [
        { name: 'company_name', label: '会社名', description: '取引先会社名', type: 'text' },
        { name: 'company_industry', label: '業種', description: '会社の業種', type: 'text' },
        { name: 'company_size', label: '従業員数', description: '会社の規模', type: 'number' },
        { name: 'company_revenue', label: '年間売上', description: '会社の年間売上', type: 'number' },
      ]
    },
    {
      id: 'activity',
      name: 'アクティビティ',
      description: '営業活動に関するデータ（将来拡張予定）',
      fields: [
        { name: 'activity_count', label: '活動回数', description: 'アクティビティの総数', type: 'number' },
        { name: 'call_count', label: '電話回数', description: '電話活動の回数', type: 'number' },
        { name: 'meeting_count', label: '会議回数', description: '会議の回数', type: 'number' },
        { name: 'email_count', label: 'メール回数', description: 'メール送信回数', type: 'number' },
      ]
    },
    {
      id: 'performance',
      name: 'パフォーマンス',
      description: '営業成績に関する計算フィールド',
      fields: [
        { name: 'win_rate', label: '成約率', description: '成約した案件の割合', type: 'number' },
        { name: 'average_deal_size', label: '平均案件金額', description: '案件の平均金額', type: 'number' },
        { name: 'pipeline_value', label: 'パイプライン価値', description: '進行中案件の合計金額', type: 'number' },
        { name: 'forecast_value', label: '予測金額', description: '期待値の合計', type: 'number' },
      ]
    }
  ]
}

// Get list of available fields for formulas (backward compatibility)
export function getAvailableFormulaFields(): FormulaField[] {
  const tables = getAvailableTables()
  // Return only the main deal table fields for backward compatibility
  return tables.find(t => t.id === 'deal')?.fields || []
}

// Get all fields from all tables flattened
export function getAllFormulaFields(): FormulaField[] {
  const tables = getAvailableTables()
  return tables.flatMap(table => table.fields)
}

// AI Formula Generation - Generate formula from natural language description
export interface AIFormulaResult {
  formula: string
  explanation: string
  usedFields: string[]
  usedFunctions: string[]
}

export function generateFormulaFromDescription(description: string): AIFormulaResult {
  const lowerDesc = description.toLowerCase()

  // Pattern matching for common formula requests
  const patterns: Array<{
    keywords: string[]
    formula: string
    explanation: string
    fields: string[]
    functions: string[]
  }> = [
    // Expected value patterns
    {
      keywords: ['期待値', '予想金額', '見込み金額', '期待金額'],
      formula: 'amount * probability / 100',
      explanation: '金額に確度を掛けて期待値を計算します',
      fields: ['amount', 'probability'],
      functions: []
    },
    // Commission/fee patterns
    {
      keywords: ['手数料', 'コミッション', '報酬', '歩合'],
      formula: 'amount * 0.1',
      explanation: '金額の10%を手数料として計算します（率は調整可能）',
      fields: ['amount'],
      functions: []
    },
    // Discount patterns
    {
      keywords: ['値引き', '割引', 'ディスカウント'],
      formula: 'amount * 0.9',
      explanation: '10%値引き後の金額を計算します（率は調整可能）',
      fields: ['amount'],
      functions: []
    },
    // Tax patterns
    {
      keywords: ['税込', '消費税', '税金'],
      formula: 'amount * 1.1',
      explanation: '消費税10%を加算した金額を計算します',
      fields: ['amount'],
      functions: []
    },
    // High value deal patterns
    {
      keywords: ['高額案件', '大型案件', '大口'],
      formula: 'IF(amount > 5000000, 1, 0)',
      explanation: '500万円以上の案件を高額案件として判定します',
      fields: ['amount'],
      functions: ['IF']
    },
    // Hot deal patterns
    {
      keywords: ['ホット案件', '有望案件', '優良案件', '確度高い'],
      formula: 'IF(probability > 70, 1, 0)',
      explanation: '確度70%以上の案件を有望案件として判定します',
      fields: ['probability'],
      functions: ['IF']
    },
    // Weighted value patterns
    {
      keywords: ['重み付け', '加重', 'ウェイト'],
      formula: 'amount * probability / 100 * IF(priority = "高", 1.2, 1)',
      explanation: '期待値に優先度による重み付けを適用します',
      fields: ['amount', 'probability', 'priority'],
      functions: ['IF']
    },
    // Score patterns
    {
      keywords: ['スコア', '評価点', 'ポイント'],
      formula: 'probability + IF(amount > 3000000, 20, IF(amount > 1000000, 10, 0))',
      explanation: '確度と金額に基づいてスコアを計算します',
      fields: ['amount', 'probability'],
      functions: ['IF']
    },
    // Average patterns
    {
      keywords: ['平均', 'アベレージ'],
      formula: 'AVG(amount, probability)',
      explanation: '指定した値の平均を計算します',
      fields: ['amount', 'probability'],
      functions: ['AVG']
    },
    // Sum patterns
    {
      keywords: ['合計', '総計', 'サム'],
      formula: 'SUM(amount, probability)',
      explanation: '指定した値の合計を計算します',
      fields: ['amount', 'probability'],
      functions: ['SUM']
    },
    // Text length patterns
    {
      keywords: ['文字数', '長さ', '文字列の長さ'],
      formula: 'LEN(company)',
      explanation: '会社名の文字数を取得します',
      fields: ['company'],
      functions: ['LEN']
    },
    // Round patterns
    {
      keywords: ['四捨五入', '丸め', 'ラウンド'],
      formula: 'ROUND(amount * probability / 100)',
      explanation: '期待値を四捨五入します',
      fields: ['amount', 'probability'],
      functions: ['ROUND']
    },
    // Absolute value patterns
    {
      keywords: ['絶対値', 'アブソリュート'],
      formula: 'ABS(amount)',
      explanation: '金額の絶対値を取得します',
      fields: ['amount'],
      functions: ['ABS']
    },
    // Min/Max patterns
    {
      keywords: ['最小', 'ミニマム'],
      formula: 'MIN(amount, probability * 100000)',
      explanation: '複数の値から最小値を取得します',
      fields: ['amount', 'probability'],
      functions: ['MIN']
    },
    {
      keywords: ['最大', 'マキシマム'],
      formula: 'MAX(amount, probability * 100000)',
      explanation: '複数の値から最大値を取得します',
      fields: ['amount', 'probability'],
      functions: ['MAX']
    },
    // Profit margin patterns
    {
      keywords: ['利益率', 'マージン', '粗利'],
      formula: 'amount * 0.3',
      explanation: '金額の30%を利益として計算します（率は調整可能）',
      fields: ['amount'],
      functions: []
    },
    // Days until close patterns
    {
      keywords: ['残り日数', 'あと何日'],
      formula: 'IF(probability > 50, amount * probability / 100, 0)',
      explanation: '確度50%以上の案件の期待値を計算します',
      fields: ['amount', 'probability'],
      functions: ['IF']
    }
  ]

  // Find matching pattern
  for (const pattern of patterns) {
    if (pattern.keywords.some(keyword => lowerDesc.includes(keyword))) {
      return {
        formula: pattern.formula,
        explanation: pattern.explanation,
        usedFields: pattern.fields,
        usedFunctions: pattern.functions
      }
    }
  }

  // Default fallback - try to extract field names and create a simple formula
  const availableFields = getAllFormulaFields()
  const mentionedFields: string[] = []

  for (const field of availableFields) {
    if (lowerDesc.includes(field.label.toLowerCase()) || lowerDesc.includes(field.name.toLowerCase())) {
      mentionedFields.push(field.name)
    }
  }

  if (mentionedFields.length > 0) {
    if (mentionedFields.length === 1) {
      return {
        formula: mentionedFields[0],
        explanation: `${mentionedFields[0]}フィールドの値を使用します`,
        usedFields: mentionedFields,
        usedFunctions: []
      }
    } else {
      // Create a simple calculation with mentioned fields
      const formula = mentionedFields.join(' + ')
      return {
        formula,
        explanation: `${mentionedFields.join('と')}を合計します`,
        usedFields: mentionedFields,
        usedFunctions: []
      }
    }
  }

  // Ultimate fallback
  return {
    formula: 'amount * probability / 100',
    explanation: '基本的な期待値の計算式です。説明に合わせて調整してください。',
    usedFields: ['amount', 'probability'],
    usedFunctions: []
  }
}

// Get formula suggestions based on context
export function getFormulaSuggestions(): Array<{
  name: string
  formula: string
  description: string
  category: string
}> {
  return [
    // Basic calculations
    {
      name: '期待値',
      formula: 'amount * probability / 100',
      description: '金額 × 確度で期待収益を計算',
      category: '基本計算'
    },
    {
      name: '手数料10%',
      formula: 'amount * 0.1',
      description: '金額の10%を計算',
      category: '基本計算'
    },
    {
      name: '税込金額',
      formula: 'amount * 1.1',
      description: '消費税10%込みの金額',
      category: '基本計算'
    },
    {
      name: '値引き後',
      formula: 'amount * 0.9',
      description: '10%値引き後の金額',
      category: '基本計算'
    },
    // Conditional calculations
    {
      name: '高額案件判定',
      formula: 'IF(amount > 5000000, 1, 0)',
      description: '500万円以上なら1、未満なら0',
      category: '条件判定'
    },
    {
      name: '有望案件判定',
      formula: 'IF(probability > 70, 1, 0)',
      description: '確度70%以上なら1、未満なら0',
      category: '条件判定'
    },
    {
      name: '案件ランク',
      formula: 'IF(amount > 10000000, 3, IF(amount > 5000000, 2, 1))',
      description: '金額に基づく3段階ランク',
      category: '条件判定'
    },
    {
      name: '重み付けスコア',
      formula: 'probability + IF(amount > 3000000, 20, 10)',
      description: '確度と金額に基づくスコア',
      category: '条件判定'
    },
    // Aggregations
    {
      name: '期待値（四捨五入）',
      formula: 'ROUND(amount * probability / 100)',
      description: '期待値を整数に四捨五入',
      category: '集計'
    },
    {
      name: '切り上げ金額',
      formula: 'CEIL(amount / 10000) * 10000',
      description: '万円単位に切り上げ',
      category: '集計'
    },
    // Text analysis
    {
      name: '会社名文字数',
      formula: 'LEN(company)',
      description: '会社名の文字数',
      category: 'テキスト分析'
    },
    {
      name: '案件名文字数',
      formula: 'LEN(title)',
      description: '案件名の文字数',
      category: 'テキスト分析'
    }
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
