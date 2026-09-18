export type TokenType =
  | 'keyword'
  | 'identifier'
  | 'number'
  | 'string'
  | 'operator'
  | 'newline'

export interface Token {
  type: TokenType
  value: string
  line: number
  col: number
}

const ACCENT_MAP: Record<string, string> = {
  'então': 'entao',
  'senão': 'senao',
  'até': 'ate',
  'faça': 'faca',
  'não': 'nao',
  'função': 'funcao',
  'booleano': 'logico',
}

const KEYWORDS = new Set([
  'algoritmo',
  'programa',
  'var',
  'declare',
  'const',
  'inicio',
  'fim_algoritmo',
  'fimalgoritmo',
  'inteiro',
  'real',
  'caractere',
  'logico',
  'vetor',
  'de',
  'se',
  'entao',
  'senao',
  'fimse',
  'escolha',
  'caso',
  'outrocaso',
  'fimescolha',
  'para',
  'ate',
  'passo',
  'faca',
  'fimpara',
  'enquanto',
  'fimenquanto',
  'repita',
  'fimrepita',
  'funcao',
  'procedimento',
  'fimfuncao',
  'fimprocedimento',
  'retorne',
  'verdadeiro',
  'falso',
  'e',
  'ou',
  'nao',
  'div',
  'mod',
])

export interface TokenizeError {
  line: number
  col: number
  message: string
  tokens: Token[]
}

const TWO_CHAR_OPERATORS = ['<-', ':=', '**', '<>', '>=', '<=', '..']
const ONE_CHAR_OPERATORS = [
  '=',
  '>',
  '<',
  '+',
  '-',
  '*',
  '/',
  '%',
  '^',
  '(',
  ')',
  '[',
  ']',
  ',',
  ':',
  ';',
]

export function tokenize(source: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  let line = 1
  let col = 1
  let depth = 0

  while (i < source.length) {
    const ch = source[i]

    if (ch === '\n') {
      if (depth === 0) tokens.push({ type: 'newline', value: '\n', line, col })
      i++
      line++
      col = 1
      continue
    }

    if (ch === ' ' || ch === '\t' || ch === '\r') {
      i++
      col++
      continue
    }

    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++
      continue
    }

    if (ch === '/' && source[i + 1] === '*') {
      const startLine = line
      const startCol = col
      i += 2
      col += 2
      while (
        i < source.length &&
        !(source[i] === '*' && source[i + 1] === '/')
      ) {
        if (source[i] === '\n') {
          line++
          col = 1
        } else col++
        i++
      }
      if (i >= source.length) {
        throw {
          line: startLine,
          col: startCol,
          message: 'Comentário sem fechamento.',
          tokens,
        } as TokenizeError
      }
      i += 2
      col += 2
      continue
    }

    if (ch === '{') {
      i++
      col++
      depth++
      continue
    }
    if (ch === '}') {
      i++
      col++
      if (depth > 0) depth--
      continue
    }

    if (ch === '"' || ch === "'") {
      const quote = ch
      const startLine = line
      const startCol = col
      let value = ''
      i++
      col++
      while (i < source.length) {
        if (source[i] === quote) {
          if (source[i + 1] === quote) {
            value += quote
            i += 2
            col += 2
            continue
          }
          i++
          col++
          break
        }
        if (source[i] === '\n') {
          throw {
            line: startLine,
            col: startCol,
            message: 'String sem fechamento.',
            tokens,
          } as TokenizeError
        }
        value += source[i]
        i++
        col++
      }
      if (i >= source.length && source[source.length - 1] !== quote) {
        throw {
          line: startLine,
          col: startCol,
          message: 'String sem fechamento.',
          tokens,
        } as TokenizeError
      }
      tokens.push({ type: 'string', value, line: startLine, col: startCol })
      continue
    }

    if (/\d/.test(ch)) {
      const startLine = line
      const startCol = col
      let value = ''
      while (i < source.length && /\d/.test(source[i])) {
        value += source[i]
        i++
        col++
      }
      if (source[i] === '.' && /\d/.test(source[i + 1] ?? '')) {
        value += '.'
        i++
        col++
        while (i < source.length && /\d/.test(source[i])) {
          value += source[i]
          i++
          col++
        }
      }
      tokens.push({ type: 'number', value, line: startLine, col: startCol })
      continue
    }

    if (/[A-Za-zÁ-Úá-ú_]/.test(ch)) {
      const startLine = line
      const startCol = col
      let value = ''
      while (i < source.length && /[A-Za-zÁ-Úá-ú0-9_]/.test(source[i])) {
        value += source[i]
        i++
        col++
      }
      const lower = value.toLowerCase()
      const canonical = ACCENT_MAP[lower] ?? lower
      const normalized = canonical === 'fimalgoritmo' ? 'fim_algoritmo' : canonical
      if (KEYWORDS.has(normalized)) {
        tokens.push({ type: 'keyword', value: normalized, line: startLine, col: startCol })
      } else {
        tokens.push({ type: 'identifier', value, line: startLine, col: startCol })
      }
      continue
    }

    let matched = false
    for (const op of TWO_CHAR_OPERATORS) {
      if (source.startsWith(op, i)) {
        tokens.push({ type: 'operator', value: op, line, col })
        i += op.length
        col += op.length
        matched = true
        break
      }
    }
    if (matched) continue

    for (const op of ONE_CHAR_OPERATORS) {
      if (source[i] === op) {
        if (op === '(' || op === '[') depth++
        if (op === ')' || op === ']') depth--
        tokens.push({ type: 'operator', value: op, line, col })
        i++
        col++
        matched = true
        break
      }
    }
    if (matched) continue

    const tagged = ch === '.' ? 'operador' : 'caractere inválido'
    throw {
      line,
      col,
      message: `Caractere inválido "${ch}" (${tagged}).`,
      tokens,
    } as TokenizeError
  }

  if (depth > 0) {
    throw {
      line: tokens[tokens.length - 1]?.line ?? 1,
      col: tokens[tokens.length - 1]?.col ?? 1,
      message: 'Faltou fechar um parêntese ou colchete.',
      tokens,
    } as TokenizeError
  }

  return tokens
}