import type {
  FuncDecl,
  Program,
  Stmt,
  Expr,
  VarDecl,
  VarType,
  VarKind,
  Param,
  EscolhaCaso,
  LeiaTarget,
  ParseError,
} from './ast'
import { tokenize } from './tokenizer'
import type { Token } from './tokenizer'

const TYPE_KEYWORDS = new Set(['inteiro', 'real', 'caractere', 'logico'])

export class PortugolParser {
  private tokens: Token[] = []
  private pos = 0

  parse(source: string): Program {
    this.tokens = tokenize(source)
    this.pos = 0
    const program = this.parseProgram()
    return program
  }

  private parseProgram(): Program {
    this.skipNewlines()
    const first = this.peek()
    if (!first || !(first.type === 'keyword' && first.value === 'algoritmo')) {
      throw this.error(first, "Esperava 'algoritmo' no início do programa.")
    }
    this.pos++
    let name: string | undefined
    while (!this.atEnd() && this.peek().type !== 'newline') {
      const t = this.peek()
      if (t.type === 'string' && name === undefined) name = t.value
      this.pos++
    }
    this.skipNewlines()

    const constants: VarDecl[] = []
    const declarations: VarDecl[] = []
    const functions: FuncDecl[] = []
    let body: Stmt[] = []

    let sawInicio = false
    while (!this.atEnd()) {
      const t = this.peek()
      if (t.type === 'keyword' && (t.value === 'var' || t.value === 'declare')) {
        this.pos++
        declarations.push(...this.parseVarLines())
      } else if (t.type === 'keyword' && t.value === 'const') {
        this.pos++
        constants.push(...this.parseConstLines())
      } else if (t.type === 'keyword' && (t.value === 'funcao' || t.value === 'procedimento')) {
        functions.push(this.parseFunction())
      } else if (t.type === 'keyword' && t.value === 'inicio') {
        this.pos++
        sawInicio = true
        break
      } else {
        if (t.type === 'keyword' && t.value === 'fim_algoritmo') {
          break
        }
        throw this.error(t, "Esperava 'var', 'const', 'funcao' ou 'inicio'.")
      }
      this.skipNewlines()
    }

    if (sawInicio) {
      body = this.parseBlock(new Set(['fim_algoritmo']))
      const end = this.peek()
      if (!end || !(end.value === 'fim_algoritmo')) {
        throw this.error(end, "Esperava 'fim_algoritmo'.")
      }
      this.pos++
    }

    return { name, constants, declarations, functions, body }
  }

  private parseFunction(): FuncDecl {
    const t = this.peek()
    const isFuncao = t.value === 'funcao'
    this.pos++
    const name = this.parseIdentifier()
    this.expectOp('(')
    const params: Param[] = []
    if (!this.matchOp(')')) {
      for (;;) {
        const pname = this.parseIdentifier()
        this.expectOp(':')
        const type = this.parseVarType()
        params.push({ name: pname, type })
        if (this.matchOp(',')) continue
        break
      }
      this.expectOp(')')
    }
    let returnType: VarKind | undefined
    if (isFuncao && this.matchOp(':')) {
      const r = this.parseVarType()
      if (typeof r !== 'string') {
        throw this.error(this.peek(), 'Tipo de retorno inválido.')
      }
      returnType = r
    }

    const constants: VarDecl[] = []
    const declarations: VarDecl[] = []
    for (;;) {
      this.skipNewlines()
      const s = this.peek()
      if (s.type === 'keyword' && (s.value === 'var' || s.value === 'declare')) {
        this.pos++
        declarations.push(...this.parseVarLines())
      } else if (s.type === 'keyword' && s.value === 'const') {
        this.pos++
        constants.push(...this.parseConstLines())
      } else if (s.type === 'keyword' && s.value === 'inicio') {
        this.pos++
        break
      } else {
        break
      }
    }

    const stop = isFuncao ? new Set(['fimfuncao']) : new Set(['fimprocedimento'])
    const body = this.parseBlock(stop)
    const end = this.peek()
    if (!end || !(end.type === 'keyword' && stop.has(end.value))) {
      throw this.error(end, isFuncao ? "Esperava 'fimfuncao'." : "Esperava 'fimprocedimento'.")
    }
    this.pos++
    return { name, params, returnType, constants, declarations, body }
  }

  private parseVarLines(): VarDecl[] {
    const decls: VarDecl[] = []
    for (;;) {
      this.skipNewlines()
      const t = this.peek()
      if (!t || t.type === 'newline') continue
      if (t.type === 'keyword') break
      if (t.type !== 'identifier') break
      const names = [this.parseIdentifier()]
      while (this.matchOp(',')) names.push(this.parseIdentifier())
      if (!this.matchOp(':')) {
        if (this.matchOp('=')) {
          this.errorAt(this.pos - 1, "Esperava ':' e o tipo da variável.")
        }
        throw this.error(this.peek(), "Esperava ':' após os nomes.")
      }
      const type = this.parseVarType()
      let init: Expr | undefined
      if (this.matchOp('<-') || this.matchOp('=')) init = this.parseExpr()
      decls.push({ names, type, init })
    }
    return decls
  }

  private parseConstLines(): VarDecl[] {
    const decls: VarDecl[] = []
    for (;;) {
      this.skipNewlines()
      const t = this.peek()
      if (!t || t.type === 'newline') continue
      if (t.type === 'keyword') break
      if (t.type !== 'identifier') break
      const names = [this.parseIdentifier()]
      if (!this.matchOp('=')) {
        throw this.error(this.peek(), "Esperava '=' em uma constante.")
      }
      const init = this.parseExpr()
      decls.push({
        names,
        type: 'real',
        init,
      })
    }
    return decls
  }

  private parseVarType(): VarType {
    const t = this.peek()
    if (t.type === 'keyword' && TYPE_KEYWORDS.has(t.value)) {
      this.pos++
      return t.value as 'inteiro' | 'real' | 'caractere' | 'logico'
    }
    if (t.type === 'keyword' && t.value === 'vetor') {
      this.pos++
      if (!this.matchOp('[')) {
        throw this.error(this.peek(), "Esperava '[' após 'vetor'.")
      }
      const lower = this.parseConstNumber()
      if (!this.matchOp('..')) {
        throw this.error(this.peek(), "Esperava '..' no intervalo do vetor.")
      }
      const upper = this.parseConstNumber()
      if (!this.matchOp(']')) {
        throw this.error(this.peek(), "Esperava ']' no intervalo do vetor.")
      }
      const d = this.peek()
      if (!(d.type === 'keyword' && d.value === 'de')) {
        throw this.error(d, "Esperava 'de' após o intervalo do vetor.")
      }
      this.pos++
      const elem = this.peek()
      if (!(elem.type === 'keyword' && TYPE_KEYWORDS.has(elem.value))) {
        throw this.error(elem, 'Tipo inválido para o vetor.')
      }
      this.pos++
      return {
        kind: 'vetor',
        lower,
        upper,
        elem: elem.value as 'inteiro' | 'real' | 'caractere' | 'logico',
      }
    }
    throw this.error(t, 'Tipo inválido.')
  }

  private parseConstNumber(): number {
    const e = this.parseUnary()
    if (e.kind === 'number') return e.value
    throw this.error(this.peek(), "Esperava um número inteiro.")
  }

  private parseStmt(): Stmt {
    const t = this.peek()
    if (t.type === 'keyword') {
      switch (t.value) {
        case 'se':
          return this.parseSe()
        case 'escolha':
          return this.parseEscolha()
        case 'para':
          return this.parsePara()
        case 'enquanto':
          return this.parseEnquanto()
        case 'repita':
          return this.parseRepita()
        case 'retorne':
          this.pos++
          return { kind: 'retorne', expr: this.parseExpr() }
        default:
          throw this.error(
            t,
            `Palavra reservada "${t.value}" não pode iniciar um comando.`,
          )
      }
    }
    if (t.type === 'identifier') {
      const name = this.parseIdentifier()
      if (this.matchOp('[')) {
        const index = this.parseExpr()
        this.expectOp(']')
        if (this.matchOp('<-') || this.matchOp(':=')) {
          return {
            kind: 'assign',
            target: name,
            index,
            value: this.parseExpr(),
          }
        }
        throw this.error(this.peek(), "Esperava '<-' na atribuição.")
      }
      if (this.matchOp('<-') || this.matchOp(':=')) {
        return { kind: 'assign', target: name, value: this.parseExpr() }
      }
      if (this.matchOp('(')) {
        const args = this.parseCallArgs()
        const lower = name.toLowerCase()
        if (lower === 'leia') {
          const targets: LeiaTarget[] = []
          for (const a of args) {
            if (a.kind === 'array') targets.push({ name: a.name, index: a.index })
            else if (a.kind === 'var') targets.push({ name: a.name })
            else {
              throw this.error(
                this.tokens[this.pos - 1],
                'leia espera nomes de variáveis.',
              )
            }
          }
          return { kind: 'leia', targets }
        }
        if (lower === 'escreva' || lower === 'escreval') {
          return { kind: 'escreva', exprs: args, newline: lower === 'escreval' }
        }
        return { kind: 'chamada', name, args }
      }
      throw this.error(
        this.peek(),
        `Esperava '<-', ':=', '(' ou '[' após "${name}".`,
      )
    }
    throw this.error(t, 'Comando inválido.')
  }

  private parseSe(): Stmt {
    this.pos++
    const cond = this.parseExpr()
    this.skipNewlines()
    const thenAs = this.matchKeyword('entao')
    if (!thenAs) throw this.error(this.peek(), "Esperava 'entao'.")
    this.skipNewlines()
    const then = this.parseBlock(new Set(['senao', 'fimse']))
    let otherwise: Stmt[] = []
    if (this.matchKeyword('senao')) {
      this.skipNewlines()
      otherwise = this.parseBlock(new Set(['fimse']))
    }
    this.expectKeyword('fimse')
    return { kind: 'se', cond, then, otherwise }
  }

  private parseEscolha(): Stmt {
    this.pos++
    const expr = this.parseExpr()
    const casos: EscolhaCaso[] = []
    let default_: Stmt[] = []
    let closed = false
    for (;;) {
      this.skipNewlines()
      const t = this.peek()
      if (!t) throw this.error(t, "Esperava 'fimescolha'.")
      if (t.type === 'keyword' && t.value === 'caso') {
        this.pos++
        const values: Expr[] = []
        const ranges: Array<{ from: number; to: number }> = []
        for (;;) {
          const e = this.parseExpr()
          if (this.matchOp('..')) {
            const from = this.toConstNumber(e)
            const r2 = this.toConstNumber(this.parseExpr())
            ranges.push({ from, to: r2 })
          } else {
            values.push(e)
          }
          if (this.matchOp(',')) continue
          break
        }
        this.expectOp(':')
        this.skipNewlines()
        const body = this.parseBlock(new Set(['caso', 'outrocaso', 'fimescolha']))
        casos.push({ values, ranges, body })
      } else if (t.type === 'keyword' && t.value === 'outrocaso') {
        this.pos++
        if (this.peek().type === 'operator' && this.peek().value === ':') {
          this.pos++
        }
        this.skipNewlines()
        default_ = this.parseBlock(new Set(['caso', 'outrocaso', 'fimescolha']))
      } else if (t.type === 'keyword' && t.value === 'fimescolha') {
        this.pos++
        closed = true
        break
      } else {
        throw this.error(t, "Esperava 'caso', 'outrocaso' ou 'fimescolha'.")
      }
    }
    if (!closed) throw this.error(this.peek(), "Esperava 'fimescolha'.")
    return { kind: 'escolha', expr, casos, default: default_ }
  }

  private parsePara(): Stmt {
    this.pos++
    const variable = this.parseIdentifier()
    if (!this.matchKeyword('de')) {
      throw this.error(this.peek(), "Esperava 'de' após a variável do 'para'.")
    }
    const from = this.parseExpr()
    if (!this.matchKeyword('ate')) {
      throw this.error(this.peek(), "Esperava 'ate' no 'para'.")
    }
    const to = this.parseExpr()
    let step: Expr | undefined
    if (this.matchKeyword('passo')) step = this.parseExpr()
    if (!this.matchKeyword('faca')) {
      throw this.error(this.peek(), "Esperava 'faca' no 'para'.")
    }
    this.skipNewlines()
    const body = this.parseBlock(new Set(['fimpara']))
    this.expectKeyword('fimpara')
    return { kind: 'para', variable, from, to, step, body }
  }

  private parseEnquanto(): Stmt {
    this.pos++
    const cond = this.parseExpr()
    if (!this.matchKeyword('faca')) {
      throw this.error(this.peek(), "Esperava 'faca' no 'enquanto'.")
    }
    this.skipNewlines()
    const body = this.parseBlock(new Set(['fimenquanto']))
    this.expectKeyword('fimenquanto')
    return { kind: 'enquanto', cond, body }
  }

  private parseRepita(): Stmt {
    this.pos++
    this.skipNewlines()
    const body = this.parseBlock(new Set(['ate']))
    if (!this.matchKeyword('ate')) {
      throw this.error(this.peek(), "Esperava 'ate' para fechar o 'repita'.")
    }
    const until = this.parseExpr()
    return { kind: 'repita', body, until }
  }

  private parseBlock(stop: Set<string>): Stmt[] {
    const stmts: Stmt[] = []
    for (;;) {
      this.skipNewlines()
      if (this.atEnd()) break
      const t = this.peek()
      if (t.type === 'keyword' && stop.has(t.value)) break
      const stmt = this.parseStmt()
      stmt._line = t.line
      stmts.push(stmt)
      this.skipAfterStatement()
    }
    return stmts
  }

  private skipAfterStatement(): void {
    if (!this.atEnd() && this.peek().type === 'newline') this.pos++
  }

  private parseExpr(): Expr {
    return this.parseOr()
  }

  private parseOr(): Expr {
    let left = this.parseAnd()
    while (this.matchKeyword('ou')) {
      left = {
        kind: 'binary',
        op: 'ou',
        left,
        right: this.parseAnd(),
      }
    }
    return left
  }

  private parseAnd(): Expr {
    let left = this.parseComparison()
    while (this.matchKeyword('e')) {
      left = {
        kind: 'binary',
        op: 'e',
        left,
        right: this.parseComparison(),
      }
    }
    return left
  }

  private parseComparison(): Expr {
    let left = this.parseAdd()
    for (;;) {
      const t = this.peek()
      if (
        t.type === 'operator' &&
        ['=', '<>', '>', '<', '>=', '<='].includes(t.value)
      ) {
        this.pos++
        left = { kind: 'binary', op: t.value, left, right: this.parseAdd() }
      } else break
    }
    return left
  }

  private parseAdd(): Expr {
    let left = this.parseMul()
    for (;;) {
      const t = this.peek()
      if (t.type === 'operator' && (t.value === '+' || t.value === '-')) {
        this.pos++
        left = { kind: 'binary', op: t.value, left, right: this.parseMul() }
      } else break
    }
    return left
  }

  private parseMul(): Expr {
    let left = this.parsePow()
    for (;;) {
      const t = this.peek()
      if (
        t.type === 'operator' &&
        ['*', '/', '%'].includes(t.value)
      ) {
        this.pos++
        left = { kind: 'binary', op: t.value, left, right: this.parsePow() }
      } else if (t.type === 'keyword' && (t.value === 'div' || t.value === 'mod')) {
        this.pos++
        const op = t.value
        left = { kind: 'binary', op, left, right: this.parsePow() }
      } else break
    }
    return left
  }

  private parsePow(): Expr {
    const left = this.parseUnary()
    const t = this.peek()
    if (t.type === 'operator' && (t.value === '^' || t.value === '**')) {
      this.pos++
      return { kind: 'binary', op: '^', left, right: this.parsePow() }
    }
    return left
  }

  private parseUnary(): Expr {
    const t = this.peek()
    if (t.type === 'operator' && t.value === '-') {
      this.pos++
      return { kind: 'unary', op: '-', expr: this.parseUnary() }
    }
    if (t.type === 'keyword' && t.value === 'nao') {
      this.pos++
      return { kind: 'unary', op: 'nao', expr: this.parseUnary() }
    }
    return this.parsePrimary()
  }

  private parsePrimary(): Expr {
    const t = this.peek()
    if (!t) throw this.error(t, 'Expressão incompleta.')
    if (t.type === 'number') {
      this.pos++
      return { kind: 'number', value: Number(t.value) }
    }
    if (t.type === 'string') {
      this.pos++
      return { kind: 'string', value: t.value }
    }
    if (t.type === 'keyword') {
      if (t.value === 'verdadeiro' || t.value === 'falso') {
        this.pos++
        return { kind: 'bool', value: t.value === 'verdadeiro' }
      }
      throw this.error(t, `Palavra reservada "${t.value}" inválida aqui.`)
    }
    if (t.type === 'identifier') {
      const name = t.value
      this.pos++
      if (this.peek().type === 'operator' && this.peek().value === '[') {
        this.pos++
        const index = this.parseExpr()
        this.expectOp(']')
        return { kind: 'array', name, index }
      }
      if (this.peek().type === 'operator' && this.peek().value === '(') {
        this.pos++
        const args = this.parseCallArgs()
        return { kind: 'call', name, args }
      }
      return { kind: 'var', name }
    }
    if (t.type === 'operator' && t.value === '(') {
      this.pos++
      const inner = this.parseExpr()
      this.expectOp(')')
      return inner
    }
    throw this.error(t, 'Expressão inválida.')
  }

  private parseCallArgs(): Expr[] {
    const args: Expr[] = []
    if (this.matchOp(')')) return args
    for (;;) {
      args.push(this.parseExpr())
      if (this.matchOp(',')) continue
      break
    }
    this.expectOp(')')
    return args
  }

  private parseIdentifier(): string {
    const t = this.peek()
    if (!t || t.type !== 'identifier') {
      throw this.error(t, 'Esperava um nome de variável.')
    }
    this.pos++
    return t.value
  }

  private toConstNumber(e: Expr): number {
    if (e.kind === 'number') return e.value
    throw this.error(this.peek(), "Esperava um número (constante).")
  }

  private expectOp(op: string): void {
    const t = this.peek()
    if (!t || t.type !== 'operator' || t.value !== op) {
      throw this.error(t, `Esperava "${op}".`)
    }
    this.pos++
  }

  private matchOp(op: string): boolean {
    const t = this.peek()
    if (t && t.type === 'operator' && t.value === op) {
      this.pos++
      return true
    }
    return false
  }

  private matchKeyword(kw: string): boolean {
    const t = this.peek()
    if (t && t.type === 'keyword' && t.value === kw) {
      this.pos++
      return true
    }
    return false
  }

  private expectKeyword(kw: string): void {
    if (!this.matchKeyword(kw)) {
      throw this.error(this.peek(), `Esperava "${kw}".`)
    }
  }

  private skipNewlines(): void {
    while (this.peek().type === 'newline') this.pos++
  }

  private peek(): Token {
    if (this.pos >= this.tokens.length) {
      const last = this.tokens[this.tokens.length - 1]
      return { type: 'newline', value: '', line: last?.line ?? 1, col: last?.col ?? 1 }
    }
    return this.tokens[this.pos]
  }

  private atEnd(): boolean {
    return this.pos >= this.tokens.length
  }

  private error(t: Token | undefined, message: string): ParseError {
    return {
      line: t?.line ?? 1,
      col: t?.col ?? 1,
      message,
      tokens: this.tokens.length,
    }
  }

  private errorAt(index: number, message: string): ParseError {
    const t = this.tokens[index]
    return {
      line: t?.line ?? 1,
      col: t?.col ?? 1,
      message,
      tokens: this.tokens.length,
    }
  }
}