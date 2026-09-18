export type VarKind = 'inteiro' | 'real' | 'caractere' | 'logico'

export interface ArrayType {
  kind: 'vetor'
  lower: number
  upper: number
  elem: VarKind
}

export type VarType = VarKind | ArrayType

export type Expr =
  | { kind: 'number'; value: number }
  | { kind: 'string'; value: string }
  | { kind: 'bool'; value: boolean }
  | { kind: 'var'; name: string }
  | { kind: 'array'; name: string; index: Expr }
  | { kind: 'call'; name: string; args: Expr[] }
  | { kind: 'unary'; op: '-' | 'nao'; expr: Expr }
  | {
      kind: 'binary'
      op: string
      left: Expr
      right: Expr
    }

export interface VarDecl {
  names: string[]
  type: VarType
  init?: Expr
}

export interface LeiaTarget {
  name: string
  index?: Expr
}

export type Stmt = (
  | { kind: 'assign'; target: string; index?: Expr; value: Expr }
  | { kind: 'leia'; targets: LeiaTarget[] }
  | { kind: 'escreva'; exprs: Expr[]; newline: boolean }
  | {
      kind: 'se'
      cond: Expr
      then: Stmt[]
      otherwise: Stmt[]
    }
  | { kind: 'escolha'; expr: Expr; casos: EscolhaCaso[]; default: Stmt[] }
  | { kind: 'para'; variable: string; from: Expr; to: Expr; step?: Expr; body: Stmt[] }
  | { kind: 'enquanto'; cond: Expr; body: Stmt[] }
  | { kind: 'repita'; body: Stmt[]; until: Expr }
  | { kind: 'retorne'; expr: Expr }
  | { kind: 'chamada'; name: string; args: Expr[] }
) & { _line?: number }

export interface EscolhaCaso {
  values: Expr[]
  ranges: Array<{ from: number; to: number }>
  body: Stmt[]
}

export interface Param {
  name: string
  type: VarType
}

export interface FuncDecl {
  name: string
  params: Param[]
  returnType?: VarKind
  constants: VarDecl[]
  declarations: VarDecl[]
  body: Stmt[]
}

export interface Program {
  name?: string
  constants: VarDecl[]
  declarations: VarDecl[]
  functions: FuncDecl[]
  body: Stmt[]
}

export interface ParseError {
  line: number
  col: number
  message: string
  tokens: number
}