import type { Stmt, Expr, VarDecl, VarType, Program, FuncDecl, LeiaTarget } from './ast'

export type Value = number | string | boolean | Value[]

export interface PortugolIo {
  write(text: string): void
  read(): Promise<string>
  clear(): void
}

export class ExecutionError extends Error {
  line?: number

  constructor(message: string, line?: number) {
    super(message)
    this.line = line
  }
}

class ReturnSignal {
  value: Value
  constructor(value: Value) {
    this.value = value
  }
}

interface Frame {
  vars: Map<string, Value>
  types: Map<string, VarType>
}

function defaultFor(type: VarType): Value {
  if (typeof type === 'object') {
    const size = type.upper - type.lower + 1
    const elem = defaultFor(type.elem)
    return Array.from({ length: size }, () => elem)
  }
  switch (type) {
    case 'inteiro':
      return 0
    case 'real':
      return 0
    case 'caractere':
      return ''
    case 'logico':
      return false
  }
}

function isTruthy(v: Value): boolean {
  if (typeof v === 'boolean') return v
  if (typeof v === 'number') return v !== 0
  if (typeof v === 'string') return v.length > 0
  return true
}

function equal(a: Value, b: Value): boolean {
  if (typeof a === 'number' && typeof b === 'number') return a === b
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b
  return String(a) === String(b)
}

function format(v: Value): string {
  if (typeof v === 'boolean') return v ? 'verdadeiro' : 'falso'
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : String(v)
  }
  if (typeof v === 'string') return v
  return '[vetor]'
}

function compareNum(a: Value, b: Value, op: string): boolean {
  if (typeof a === 'string' && typeof b === 'string') {
    const c = a.localeCompare(b)
    switch (op) {
      case '>':
        return c > 0
      case '<':
        return c < 0
      case '>=':
        return c >= 0
      case '<=':
        return c <= 0
    }
  }
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new ExecutionError('Comparação só pode usar números (ou dois caracteres).')
  }
  switch (op) {
    case '>':
      return a > b
    case '<':
      return a < b
    case '>=':
      return a >= b
    case '<=':
      return a <= b
  }
  return false
}

export class PortugolInterpreter {
  private io!: PortugolIo
  private functions = new Map<string, FuncDecl>()
  private steps = 0
  private maxSteps = 600000
  private callDepth = 0

  async run(program: Program, io: PortugolIo): Promise<void> {
    this.io = io
    this.steps = 0
    this.callDepth = 0
    this.functions.clear()
    for (const fn of program.functions) {
      this.functions.set(fn.name.toLowerCase(), fn)
    }
    const g: Frame = { vars: new Map(), types: new Map() }
    await this.applyDecls(g, program.constants)
    await this.applyDecls(g, program.declarations)
    try {
      await this.execBlock(g, program.body)
    } catch (e) {
      if (e instanceof ReturnSignal) {
        throw new ExecutionError('retorne usado fora de uma função.', 1)
      }
      throw e
    }
  }

  private async applyDecls(frame: Frame, decls: VarDecl[]): Promise<void> {
    for (const decl of decls) {
      const type = decl.type
      if (decl.names.length > 1 && decl.init) {
        throw new ExecutionError(
          'Não posso inicializar mais de uma variável na mesma linha.',
          1,
        )
      }
      for (const name of decl.names) {
        const key = name.toLowerCase()
        if (frame.vars.has(key)) {
          throw new ExecutionError(`A variável "${name}" já foi declarada.`, 1)
        }
        frame.types.set(key, type)
        frame.vars.set(key, defaultFor(type))
        if (decl.init) {
          frame.vars.set(key, await this.evalExpr(decl.init, frame))
        }
      }
    }
  }

  private async execBlock(frame: Frame, stmts: Stmt[]): Promise<void> {
    for (const stmt of stmts) {
      this.steps++
      if (this.steps > this.maxSteps) {
        throw new ExecutionError(
          'O programa rodou por tempo demais (talvez um laço infinito).',
        )
      }
      try {
        await this.execStmt(frame, stmt)
      } catch (e) {
        if (
          e instanceof ExecutionError &&
          e.line === undefined &&
          stmt._line !== undefined
        ) {
          throw new ExecutionError(e.message, stmt._line)
        }
        throw e
      }
    }
  }

  private async execStmt(frame: Frame, stmt: Stmt): Promise<void> {
    switch (stmt.kind) {
      case 'assign': {
        const key = stmt.target.toLowerCase()
        const type = frame.types.get(key)
        if (!type) {
          throw new ExecutionError(
            `Variável "${stmt.target}" não declarada.`,
            stmt._line,
          )
        }
        const value = await this.evalExpr(stmt.value, frame)
        if (stmt.index) {
          const arr = frame.vars.get(key)
          if (!Array.isArray(arr) || typeof type !== 'object') {
            throw new ExecutionError(`"${stmt.target}" não é um vetor.`, stmt._line)
          }
          const idx = await this.evalExpr(stmt.index, frame)
          arr[this.storageIndex(type, idx)] = value
        } else {
          frame.vars.set(key, value)
        }
        return
      }
      case 'leia': {
        for (const target of stmt.targets) {
          await this.doLeia(frame, target, stmt._line)
        }
        return
      }
      case 'escreva': {
        const parts: string[] = []
        for (const e of stmt.exprs) {
          parts.push(format(await this.evalExpr(e, frame)))
        }
        if (stmt.newline) {
          this.io.write(parts.join('') + '\n')
        } else {
          this.io.write(parts.join(''))
        }
        return
      }
      case 'se': {
        if (isTruthy(await this.evalExpr(stmt.cond, frame))) {
          await this.execBlock(frame, stmt.then)
        } else {
          await this.execBlock(frame, stmt.otherwise)
        }
        return
      }
      case 'escolha': {
        const val = await this.evalExpr(stmt.expr, frame)
        for (const caso of stmt.casos) {
          let matched = false
          for (const v of caso.values) {
            if (equal(val, await this.evalExpr(v, frame))) {
              matched = true
              break
            }
          }
          if (!matched && typeof val === 'number') {
            for (const r of caso.ranges) {
              if (val >= r.from && val <= r.to) {
                matched = true
                break
              }
            }
          }
          if (matched) {
            await this.execBlock(frame, caso.body)
            return
          }
        }
        await this.execBlock(frame, stmt.default)
        return
      }
      case 'para': {
        const key = stmt.variable.toLowerCase()
        if (!frame.types.has(key)) {
          throw new ExecutionError(
            `Variável "${stmt.variable}" não declarada.`,
            stmt._line,
          )
        }
        const from = await this.evalExpr(stmt.from, frame)
        const to = await this.evalExpr(stmt.to, frame)
        const step = stmt.step ? await this.evalExpr(stmt.step, frame) : 1
        if (
          typeof from !== 'number' ||
          typeof to !== 'number' ||
          typeof step !== 'number'
        ) {
          throw new ExecutionError(
            'Os limites do para precisam ser números.',
            stmt._line,
          )
        }
        if (step === 0) {
          throw new ExecutionError('O passo do para não pode ser zero.', stmt._line)
        }
        if (Math.abs(to - from) / Math.abs(step) > this.maxSteps) {
          throw new ExecutionError(
            'O para executaria por tempo demais.',
            stmt._line,
          )
        }
        for (let i = from; step > 0 ? i <= to : i >= to; i += step) {
          frame.vars.set(key, i)
          await this.execBlock(frame, stmt.body)
        }
        return
      }
      case 'enquanto': {
        while (isTruthy(await this.evalExpr(stmt.cond, frame))) {
          await this.execBlock(frame, stmt.body)
        }
        return
      }
      case 'repita': {
        do {
          await this.execBlock(frame, stmt.body)
        } while (!isTruthy(await this.evalExpr(stmt.until, frame)))
        return
      }
      case 'retorne': {
        throw new ReturnSignal(await this.evalExpr(stmt.expr, frame))
      }
      case 'chamada': {
        await this.callByName(stmt.name, stmt.args, frame, stmt._line)
        return
      }
    }
  }

  private async doLeia(
    frame: Frame,
    target: LeiaTarget,
    line: number | undefined,
  ): Promise<void> {
    const key = target.name.toLowerCase()
    const type = frame.types.get(key)
    if (!type) {
      throw new ExecutionError(`Variável "${target.name}" não declarada.`, line)
    }
    const raw = await this.io.read()
    const value = this.parseInput(type, raw, line)
    if (target.index) {
      const arr = frame.vars.get(key)
      if (!Array.isArray(arr) || typeof type !== 'object') {
        throw new ExecutionError(`"${target.name}" não é um vetor.`, line)
      }
      const idx = await this.evalExpr(target.index, frame)
      arr[this.storageIndex(type, idx)] = value
    } else if (typeof type === 'object') {
      throw new ExecutionError(
        `Use leia(${target.name}[índice]) para ler um vetor.`,
        line,
      )
    } else {
      frame.vars.set(key, value)
    }
  }

  private parseInput(type: VarType, raw: string, line?: number): Value {
    const elemType = typeof type === 'object' ? type.elem : type
    const s = raw.trim()
    switch (elemType) {
      case 'inteiro': {
        const n = Number(s.replace(',', '.'))
        if (Number.isNaN(n) || s === '') {
          throw new ExecutionError('Valor inválido para um inteiro.', line)
        }
        return Math.trunc(n)
      }
      case 'real': {
        const n = Number(s.replace(',', '.'))
        if (Number.isNaN(n) || s === '') {
          throw new ExecutionError('Valor inválido para um real.', line)
        }
        return n
      }
      case 'caractere':
        return raw
      case 'logico': {
        const low = s.toLowerCase()
        if (['verdadeiro', 'v', 'true', 'sim', '1'].includes(low)) return true
        if (['falso', 'f', 'false', 'nao', 'não', '0'].includes(low)) return false
        throw new ExecutionError(
          'Valor lógico inválido (use verdadeiro ou falso).',
          line,
        )
      }
    }
  }

  private storageIndex(type: VarType, idx: Value): number {
    if (typeof idx !== 'number') {
      throw new ExecutionError('O índice de um vetor precisa ser um número.')
    }
    if (typeof type !== 'object') {
      throw new ExecutionError('Não é um vetor.')
    }
    const real = Math.trunc(idx) - type.lower
    if (real < 0 || real >= type.upper - type.lower + 1) {
      throw new ExecutionError(
        `Índice fora do intervalo [${type.lower}..${type.upper}].`,
      )
    }
    return real
  }

  private async evalExpr(expr: Expr, frame: Frame): Promise<Value> {
    switch (expr.kind) {
      case 'number':
        return expr.value
      case 'string':
        return expr.value
      case 'bool':
        return expr.value
      case 'var': {
        const v = frame.vars.get(expr.name.toLowerCase())
        if (v === undefined) {
          throw new ExecutionError(`Variável "${expr.name}" não declarada.`)
        }
        return v
      }
      case 'array': {
        const key = expr.name.toLowerCase()
        const v = frame.vars.get(key)
        const type = frame.types.get(key)
        if (!Array.isArray(v) || !type || typeof type !== 'object') {
          throw new ExecutionError(`"${expr.name}" não é um vetor.`)
        }
        const idx = await this.evalExpr(expr.index, frame)
        return v[this.storageIndex(type, idx)]
      }
      case 'call': {
        const r = await this.callByName(expr.name, expr.args, frame, undefined)
        if (r === undefined) {
          throw new ExecutionError(`"${expr.name}" não devolveu um valor.`)
        }
        return r
      }
      case 'unary': {
        const v = await this.evalExpr(expr.expr, frame)
        if (expr.op === '-') {
          if (typeof v !== 'number') {
            throw new ExecutionError('Não posso negar um valor que não é número.')
          }
          return -v
        }
        return !isTruthy(v)
      }
      case 'binary':
        return this.evalBinary(expr, frame)
    }
  }

  private async evalBinary(expr: Expr, frame: Frame): Promise<Value> {
    if (expr.kind !== 'binary') {
      throw new ExecutionError('Expressão inválida.')
    }
    const a = await this.evalExpr(expr.left, frame)
    const b = await this.evalExpr(expr.right, frame)
    switch (expr.op) {
      case 'ou':
        return isTruthy(a) || isTruthy(b)
      case 'e':
        return isTruthy(a) && isTruthy(b)
      case '=':
        return equal(a, b)
      case '<>':
        return !equal(a, b)
      case '>':
      case '<':
      case '>=':
      case '<=':
        return compareNum(a, b, expr.op)
      case '+':
        if (typeof a === 'string' || typeof b === 'string') {
          return format(a) + format(b)
        }
        return this.asNumber(a) + this.asNumber(b)
      case '-':
        return this.asNumber(a) - this.asNumber(b)
      case '*':
        return this.asNumber(a) * this.asNumber(b)
      case '/':
        return this.asNumber(a) / this.asNumber(b)
      case 'div':
        return Math.trunc(this.asNumber(a) / this.asNumber(b))
      case 'mod':
      case '%':
        return this.asNumber(a) % this.asNumber(b)
      case '^':
        return Math.pow(this.asNumber(a), this.asNumber(b))
    }
    throw new ExecutionError(`Operador "${expr.op}" inválido.`)
  }

  private asNumber(v: Value): number {
    if (typeof v === 'number') return v
    throw new ExecutionError('Operação aritmética exige números.')
  }

  private async callByName(
    name: string,
    args: Expr[],
    frame: Frame,
    line: number | undefined,
  ): Promise<Value | undefined> {
    const lower = name.toLowerCase()
    const fn = this.functions.get(lower)
    if (!fn) {
      const builtin = await this.callBuiltin(lower, args, frame)
      if (builtin !== undefined) return builtin
      throw new ExecutionError(`Função "${name}" não existe.`, line)
    }
    if (args.length !== fn.params.length) {
      throw new ExecutionError(
        `A função "${name}" espera ${fn.params.length} argumento(s), mas recebeu ${args.length}.`,
        line,
      )
    }
    if (this.callDepth > 500) {
      throw new ExecutionError('Recursão muito profunda.', line)
    }
    this.callDepth++
    const local: Frame = { vars: new Map(), types: new Map() }
    for (let i = 0; i < fn.params.length; i++) {
      const p = fn.params[i]
      local.types.set(p.name.toLowerCase(), p.type)
      local.vars.set(p.name.toLowerCase(), await this.evalExpr(args[i], frame))
    }
    await this.applyDecls(local, fn.constants)
    await this.applyDecls(local, fn.declarations)
    try {
      await this.execBlock(local, fn.body)
    } catch (e) {
      if (e instanceof ReturnSignal) {
        return e.value
      }
      throw e
    } finally {
      this.callDepth--
    }
    if (fn.returnType) {
      throw new ExecutionError(
        `A função "${name}" deveria retornar um valor.`,
        line,
      )
    }
    return undefined
  }

  private async callBuiltin(
    name: string,
    args: Expr[],
    frame: Frame,
  ): Promise<Value | undefined> {
    if (name === 'limpatela') {
      this.io.clear()
      return true
    }
    const nums: Value[] = []
    for (const a of args) nums.push(await this.evalExpr(a, frame))
    const need = (n: number) => {
      if (nums.length !== n) {
        throw new ExecutionError(`A função "${name}" espera ${n} argumento(s).`)
      }
      return nums
    }
    switch (name) {
      case 'abs':
        return Math.abs(this.asNumber(need(1)[0]))
      case 'raiz':
        return Math.sqrt(this.asNumber(need(1)[0]))
      case 'potencia': {
        const [b, e] = need(2)
        return Math.pow(this.asNumber(b), this.asNumber(e))
      }
      case 'comprimento': {
        const [v] = need(1)
        if (!Array.isArray(v)) {
          throw new ExecutionError('comprimento espera um vetor.')
        }
        return v.length
      }
      case 'quadrado':
        return Math.pow(this.asNumber(need(1)[0]), 2)
      case 'inteiro': {
        const [v] = need(1)
        return Math.trunc(this.asNumber(v))
      }
      case 'arredondar': {
        const [v] = need(1)
        return Math.round(this.asNumber(v))
      }
      case 'aleatorio': {
        const [v] = need(1)
        return Math.floor(Math.random() * this.asNumber(v))
      }
    }
    return undefined
  }
}