export interface Segment {
  text: string
  cls: string
}

const STRUCT = new Set([
  'algoritmo',
  'programa',
  'var',
  'declare',
  'const',
  'inicio',
  'fim_algoritmo',
  'fimalgoritmo',
  'funcao',
  'procedimento',
  'fimfuncao',
  'fimprocedimento',
  'retorne',
  'se',
  'entao',
  'então',
  'senao',
  'senão',
  'fimse',
  'escolha',
  'caso',
  'outrocaso',
  'fimescolha',
  'para',
  'ate',
  'até',
  'passo',
  'faca',
  'faça',
  'fimpara',
  'enquanto',
  'fimenquanto',
  'repita',
  'fimrepita',
  'fim',
])

const TYPES = new Set([
  'inteiro',
  'real',
  'caractere',
  'logico',
  'logico',
  'booleano',
  'vetor',
  'de',
])

const LOGIC = new Set([
  'verdadeiro',
  'falso',
  'e',
  'ou',
  'nao',
  'não',
  'div',
  'mod',
])

const BUILTINS = new Set([
  'escreva',
  'escreval',
  'leia',
  'limpatela',
  'abs',
  'raiz',
  'potencia',
  'comprimento',
  'quadrado',
  'inteiro',
  'arredondar',
  'aleatorio',
])

const TWO_CHAR_OPS = new Set(['<-', ':=', '**', '<>', '>=', '<=', '..', '//', '/*'])
const ONE_CHAR_OPS = new Set([
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
  '.',
])

const IDENT_START = /[A-Za-zÁ-Úá-ú_]/
const IDENT = /[A-Za-zÁ-Úá-ú0-9_]/

export function tokenizeHighlight(source: string): Segment[] {
  const segs: Segment[] = []
  let i = 0
  const len = source.length

  const push = (text: string, cls: string) => {
    if (!text) return
    segs.push({ text, cls })
  }

  while (i < len) {
    const ch = source[i]

    if (ch === '\n') {
      push('\n', 'nl')
      i++
      continue
    }
    if (ch === ' ' || ch === '\t') {
      let t = ''
      while (i < len && (source[i] === ' ' || source[i] === '\t')) {
        t += source[i]
        i++
      }
      push(t, 'ws')
      continue
    }
    if (ch === '/' && source[i + 1] === '/') {
      let t = ''
      while (i < len && source[i] !== '\n') {
        t += source[i]
        i++
      }
      push(t, 'cmt')
      continue
    }
    if (ch === '/' && source[i + 1] === '*') {
      let t = ''
      while (
        i < len &&
        !(source[i] === '*' && source[i + 1] === '/')
      ) {
        t += source[i]
        i++
      }
      if (i < len) {
        t += source[i] + source[i + 1]
        i += 2
      }
      push(t, 'cmt')
      continue
    }
    if (ch === '{') {
      let t = ''
      while (i < len && source[i] !== '}') {
        t += source[i]
        i++
      }
      if (i < len) {
        t += '}'
        i++
      }
      push(t, 'cmt')
      continue
    }
    if (ch === '"' || ch === "'") {
      const quote = ch
      let t = quote
      i++
      while (i < len) {
        if (source[i] === quote && source[i + 1] === quote) {
          t += quote + quote
          i += 2
          continue
        }
        t += source[i]
        if (source[i] === quote) {
          i++
          break
        }
        if (source[i] === '\n') break
        i++
      }
      push(t, 'str')
      continue
    }
    if (/\d/.test(ch)) {
      let t = ''
      while (i < len && /\d/.test(source[i])) {
        t += source[i]
        i++
      }
      if (source[i] === '.' && /\d/.test(source[i + 1] ?? '')) {
        t += '.'
        i++
        while (i < len && /\d/.test(source[i])) {
          t += source[i]
          i++
        }
      }
      push(t, 'num')
      continue
    }
    if (IDENT_START.test(ch)) {
      let t = ''
      while (i < len && IDENT.test(source[i])) {
        t += source[i]
        i++
      }
      const lower = t.toLowerCase()
      if (STRUCT.has(lower)) push(t, 'strct')
      else if (TYPES.has(lower)) push(t, 'type')
      else if (LOGIC.has(lower)) push(t, 'logic')
      else if (BUILTINS.has(lower)) push(t, 'builtin')
      else push(t, 'id')
      continue
    }

    const two = source.slice(i, i + 2)
    if (TWO_CHAR_OPS.has(two)) {
      push(two, 'op')
      i += 2
      continue
    }
    if (OPERATOR_HIT(ch)) {
      push(ch, 'op')
      i++
      continue
    }
    push(ch, 'err')
    i++
  }
  return segs
}

function OPERATOR_HIT(ch: string): boolean {
  return ONE_CHAR_OPS.has(ch)
}