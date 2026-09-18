export type Categoria = 'basico' | 'condicional' | 'laco' | 'vetor' | 'funcao' | 'desafio'

export type Dificuldade = 1 | 2 | 3 | 4 | 5

export interface Exercicio {
  id: string
  titulo: string
  categoria: Categoria
  dificuldade: Dificuldade
  enunciado: string[]
  entrada?: string
  saida?: string
  inicial: string
  gabarito: string
  dica?: string
}

export const CATEGORIAS: Array<{ key: Categoria; rotulo: string }> = [
  { key: 'basico', rotulo: 'Básico' },
  { key: 'condicional', rotulo: 'Condicionais' },
  { key: 'laco', rotulo: 'Laços' },
  { key: 'vetor', rotulo: 'Vetores' },
  { key: 'funcao', rotulo: 'Funções' },
  { key: 'desafio', rotulo: 'Desafios' },
]

export const DIFICULDADE_LABEL: Record<Dificuldade, string> = {
  1: 'Muito fácil',
  2: 'Fácil',
  3: 'Médio',
  4: 'Difícil',
  5: 'Muito difícil',
}

function indenta(bloco: string): string {
  return bloco
    .split('\n')
    .map((l) => `  ${l}`)
    .join('\n')
}

function monta(
  id: string,
  titulo: string,
  categoria: Categoria,
  dificuldade: Dificuldade,
  enunciado: string[],
  vars: string,
  body: string,
  extras?: { entrada?: string; saida?: string; dica?: string; funcoes?: string },
): Exercicio {
  const funcoes = extras?.funcoes ? indenta(extras.funcoes) : ''
  const inicialVars = vars
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => `  ${l.trim()}`)
    .join('\n')
  const inicial = `algoritmo "${titulo}"\nvar\n${inicialVars}\ninicio\n  // escreva sua solução aqui\nfim_algoritmo`
  const gabarito = `algoritmo "${titulo}"\nvar\n${inicialVars}\n${funcoes}\ninicio\n${indenta(body)}\nfim_algoritmo`
  return {
    id,
    titulo,
    categoria,
    dificuldade,
    enunciado,
    entrada: extras?.entrada,
    saida: extras?.saida,
    inicial,
    gabarito,
    dica: extras?.dica,
  }
}

const FIXOS: Exercicio[] = [
  monta(
    'ola-mundo',
    'Olá, mundo!',
    'basico',
    1,
    [
      'Todo programador começa por aqui. Escreva um programa que mostre a mensagem "Olá, mundo!" na tela.',
    ],
    '',
    '  escreval("Olá, mundo!")',
    { saida: 'Olá, mundo!' },
  ),
  monta(
    'meu-nome',
    'Prazer em conhecer',
    'basico',
    1,
    ['Leia o nome de uma pessoa e mostre a mensagem "Olá, [nome]!" usando o valor lido.'],
    'nome: caractere',
    '  leia(nome)\n  escreval("Olá, ", nome, "!")',
    { entrada: 'Maria', saida: 'Olá, Maria!', dica: 'Use leia(nome) e escreval("Olá, ", nome)' },
  ),
  monta(
    'soma-dois',
    'Soma de dois números',
    'basico',
    1,
    ['Leia dois números inteiros e mostre a soma deles.'],
    'a, b: inteiro',
    '  leia(a)\n  leia(b)\n  escreval(a + b)',
    { entrada: '7\n3', saida: '10', dica: 'Some dentro do escreval: a + b' },
  ),
  monta(
    'dobro',
    'O dobro',
    'basico',
    1,
    ['Leia um número inteiro e mostre o dobro dele.'],
    'n: inteiro',
    '  leia(n)\n  escreval("O dobro é ", n * 2)',
    { entrada: '21', saida: 'O dobro é 42' },
  ),
  monta(
    'area-retangulo',
    'Área do retângulo',
    'basico',
    1,
    ['Leia a base e a altura de um retângulo e mostre sua área (base x altura).'],
    'base, altura: real',
    '  leia(base)\n  leia(altura)\n  escreval("Área: ", base * altura)',
    { entrada: '5,5\n2', saida: 'Área: 11', dica: 'Use vírgula como separador decimal, ex. 5,5' },
  ),
  monta(
    'media-tres',
    'Média de três notas',
    'basico',
    2,
    ['Leia três notas de um aluno e mostre a média aritmética.'],
    'n1, n2, n3, media: real',
    '  leia(n1)\n  leia(n2)\n  leia(n3)\n  media <- (n1 + n2 + n3) / 3\n  escreval("Média: ", media)',
    { entrada: '6\n8\n10', saida: 'Média: 8' },
  ),
  monta(
    'celsius-fahrenheit',
    'Celsius para Fahrenheit',
    'basico',
    2,
    ['Leia uma temperatura em graus Celsius e converta para Fahrenheit. A fórmula é: F = (C x 9/5) + 32.'],
    'c, f: real',
    '  leia(c)\n  f <- c * 9 / 5 + 32\n  escreval(f, " graus Fahrenheit")',
    { entrada: '30', saida: '86 graus Fahrenheit', dica: 'F = c * 9 / 5 + 32' },
  ),
  monta(
    'antecessor-sucessor',
    'Antecessor e sucessor',
    'basico',
    1,
    ['Leia um número inteiro e mostre o antecessor e o sucessor dele.'],
    'n: inteiro',
    '  leia(n)\n  escreval(n - 1)\n  escreval(n + 1)',
    { entrada: '10', saida: '9\n11' },
  ),
  monta(
    'resto-divisao',
    'Quociente e resto',
    'basico',
    2,
    ['Leia dois números inteiros. Mostre o quociente da divisão inteira (div) e o resto (mod).'],
    'a, b: inteiro',
    '  leia(a)\n  leia(b)\n  escreval("Quociente: ", a div b)\n  escreval("Resto: ", a mod b)',
    { entrada: '17\n5', saida: 'Quociente: 3\nResto: 2', dica: 'Use div para quociente e mod para resto' },
  ),
  monta(
    'par-impar',
    'Par ou ímpar?',
    'condicional',
    2,
    ['Leia um número inteiro e diga se ele é par ou ímpar.'],
    'n: inteiro',
    '  leia(n)\n  se (n mod 2 = 0) entao\n   escreval("par")\n  senao\n   escreval("impar")\n  fimse',
    { entrada: '7', saida: 'impar', dica: 'se n mod 2 = 0, então é par' },
  ),
  monta(
    'maior-dois',
    'Maior de dois números',
    'condicional',
    2,
    ['Leia dois números e mostre o maior deles.'],
    'a, b: inteiro',
    '  leia(a)\n  leia(b)\n  se (a > b) entao\n   escreval(a)\n  senao\n   escreval(b)\n  fimse',
    { entrada: '4\n9', saida: '9' },
  ),
  monta(
    'maior-tres',
    'Maior de três números',
    'condicional',
    3,
    ['Leia três números e mostre o maior deles. Tente comparar aos pares.'],
    'a, b, c, maior: inteiro',
    '  leia(a)\n  leia(b)\n  leia(c)\n  maior <- a\n  se (b > maior) entao\n   maior <- b\n  fimse\n  se (c > maior) entao\n   maior <- c\n  fimse\n  escreval(maior)',
    { entrada: '3\n9\n5', saida: '9' },
  ),
  monta(
    'positivo-negativo',
    'Positivo, negativo ou zero',
    'condicional',
    2,
    ['Leia um número e diga se é positivo, negativo ou zero.'],
    'n: inteiro',
    '  leia(n)\n  se (n > 0) entao\n   escreval("positivo")\n  senao\n   se (n < 0) entao\n    escreval("negativo")\n   senao\n    escreval("zero")\n   fimse\n  fimse',
    { entrada: '-5', saida: 'negativo' },
  ),
  monta(
    'aprovado',
    'Aprovado ou reprovado',
    'condicional',
    2,
    ['Leia a nota de um aluno (0 a 10). Se for maior ou igual a 6, mostre "aprovado". Caso contrário, "reprovado".'],
    'nota: real',
    '  leia(nota)\n  se (nota >= 6) entao\n   escreval("aprovado")\n  senao\n   escreval("reprovado")\n  fimse',
    { entrada: '6', saida: 'aprovado' },
  ),
  monta(
    'ano-bissexto',
    'Ano bissexto',
    'condicional',
    3,
    ['Um ano é bissexto se for divisível por 400, ou divisível por 4 mas não por 100. Leia um ano e diga se é bissexto.'],
    'ano: inteiro',
    '  leia(ano)\n  se (ano mod 400 = 0) ou ((ano mod 4 = 0) e (ano mod 100 <> 0)) entao\n   escreval("bissexto")\n  senao\n   escreval("nao bissexto")\n  fimse',
    { entrada: '2024', saida: 'bissexto' },
  ),
  monta(
    'desconto',
    'Loja com desconto',
    'condicional',
    3,
    ['Uma loja dá 10% de desconto para compras acima de R$ 100. Leia o valor da compra e mostre o valor final.'],
    'valor, final: real',
    '  leia(valor)\n  se (valor > 100) entao\n   final <- valor - valor * 10 / 100\n  senao\n   final <- valor\n  fimse\n  escreval("Total: R$ ", final)',
    { entrada: '120', saida: 'Total: R$ 108', dica: 'valor - valor * 10 / 100' },
  ),
  monta(
    'triangulo',
    'Triângulo válido?',
    'condicional',
    3,
    ['Leia três medidas e verifique se podem formar um triângulo. Regra: a soma de dois lados deve ser maior que o terceiro.'],
    'a, b, c: real',
    '  leia(a)\n  leia(b)\n  leia(c)\n  se (a + b > c) e (a + c > b) e (b + c > a) entao\n   escreval("é triangulo")\n  senao\n   escreval("não é triangulo")\n  fimse',
    { entrada: '3\n4\n5', saida: 'é triangulo' },
  ),
  monta(
    'calculadora',
    'Calculadora simples',
    'condicional',
    3,
    ['Leia dois números e um operador (+ - * /) e mostre o resultado da operação. Use o comando escolha.'],
    'a, b: real\nop: caractere',
    '  leia(a)\n  leia(op)\n  leia(b)\n  escolha op\n  caso "+":\n   escreval(a + b)\n  caso "-":\n   escreval(a - b)\n  caso "*":\n   escreval(a * b)\n  caso "/":\n   escreval(a / b)\n  fimescolha',
    { entrada: '8\n*\n5', saida: '40', dica: 'Leia o operador depois do primeiro número' },
  ),
  monta(
    'contar-dez',
    'Conte de 1 a 10',
    'laco',
    1,
    ['Use um laço para mostrar os números de 1 até 10, um por linha.'],
    'i: inteiro',
    '  para i de 1 ate 10 faca\n   escreval(i)\n  fimpara',
    { saida: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10' },
  ),
  monta(
    'soma-n',
    'Soma de 1 até N',
    'laco',
    2,
    ['Leia um número N e calcule a soma de todos os números de 1 até N. Exemplo: N = 4 → 10.'],
    'n, i, soma: inteiro',
    '  leia(n)\n  soma <- 0\n  para i de 1 ate n faca\n   soma <- soma + i\n  fimpara\n  escreval(soma)',
    { entrada: '4', saida: '10', dica: 'Acumule numa variável soma' },
  ),
  monta(
    'tabuada',
    'Tabuada do 7',
    'laco',
    2,
    ['Mostre a tabuada do 7, de 1x7 até 10x7.'],
    'i: inteiro',
    '  para i de 1 ate 10 faca\n   escreval("7 x ", i, " = ", 7 * i)\n  fimpara',
    { saida: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70', dica: 'escreval("7 x ", i, " = ", 7 * i)' },
  ),
  monta(
    'pares-ate-n',
    'Números pares até N',
    'laco',
    2,
    ['Leia um número N e mostre todos os números pares de 2 até N.'],
    'n, i: inteiro',
    '  leia(n)\n  para i de 2 ate n passo 2 faca\n   escreval(i)\n  fimpara',
    { entrada: '10', saida: '2\n4\n6\n8\n10', dica: 'Use passo 2' },
  ),
  monta(
    'fatorial',
    'Fatorial',
    'laco',
    3,
    ['Leia um número N e calcule o fatorial de N. Por convenção, 0! = 1.'],
    'n, i, fat: inteiro',
    '  leia(n)\n  fat <- 1\n  para i de 1 ate n faca\n   fat <- fat * i\n  fimpara\n  escreval(fat)',
    { entrada: '5', saida: '120', dica: 'fat <- 1 e depois fat <- fat * i' },
  ),
  monta(
    'contar-digitos',
    'Quantos dígitos?',
    'laco',
    3,
    ['Leia um número inteiro positivo e conte quantos dígitos ele tem. Dica: divida por 10 até chegar a zero.'],
    'n, digitos: inteiro',
    '  leia(n)\n  digitos <- 0\n  enquanto (n > 0) faca\n   digitos <- digitos + 1\n   n <- n div 10\n  fimenquanto\n  escreval(digitos)',
    { entrada: '98765', saida: '5', dica: 'n div 10 reduz um dígito' },
  ),
  monta(
    'potencia-laco',
    'Potência com laço',
    'laco',
    3,
    ['Leia a base e o expoente e calcule a potência usando um laço (sem função pronta).'],
    'base, expoente, i, resultado: inteiro',
    '  leia(base)\n  leia(expoente)\n  resultado <- 1\n  para i de 1 ate expoente faca\n   resultado <- resultado * base\n  fimpara\n  escreval(resultado)',
    { entrada: '2\n5', saida: '32' },
  ),
  monta(
    'media-repita',
    'Média de vários números',
    'laco',
    3,
    ['Leia números até que um deles seja 0 e mostre a média dos números lidos (ignorando o 0).'],
    'n, soma, qtd: inteiro\nmedia: real',
    '  qtd <- 0\n  soma <- 0\n  repita\n   leia(n)\n   se (n <> 0) entao\n    soma <- soma + n\n    qtd <- qtd + 1\n   fimse\n  ate (n = 0)\n  media <- soma / qtd\n  escreval(media)',
    { entrada: '8\n10\n5\n0', saida: '7.666666666666667', dica: 'Use repita e pare ao ler 0' },
  ),
  monta(
    'maior-do-vetor',
    'Maior do vetor',
    'vetor',
    3,
    ['Leia 10 números inteiros, guarde num vetor e mostre o maior valor.'],
    'nums: vetor[1..10] de inteiro\ni, maior: inteiro',
    '  para i de 1 ate 10 faca\n   leia(nums[i])\n  fimpara\n  maior <- nums[1]\n  para i de 2 ate 10 faca\n   se (nums[i] > maior) entao\n    maior <- nums[i]\n   fimse\n  fimpara\n  escreval(maior)',
    { entrada: '3\n9\n2\n15\n4\n6\n1\n8\n7\n10', saida: '15', dica: 'Comece assumindo o primeiro elemento' },
  ),
  monta(
    'soma-vetor',
    'Soma dos elementos',
    'vetor',
    3,
    ['Leia 8 números, guarde num vetor e mostre a soma de todos.'],
    'nums: vetor[1..8] de inteiro\ni, soma: inteiro',
    '  soma <- 0\n  para i de 1 ate 8 faca\n   leia(nums[i])\n   soma <- soma + nums[i]\n  fimpara\n  escreval(soma)',
    { entrada: '1\n2\n3\n4\n5\n6\n7\n8', saida: '36' },
  ),
  monta(
    'media-vetor',
    'Média dos elementos',
    'vetor',
    3,
    ['Leia 6 notas, guarde num vetor e mostre a média.'],
    'notas: vetor[1..6] de real\ni: inteiro\nsoma, media: real',
    '  soma <- 0\n  para i de 1 ate 6 faca\n   leia(notas[i])\n   soma <- soma + notas[i]\n  fimpara\n  media <- soma / 6\n  escreval(media)',
    { entrada: '6\n7\n8\n9\n5\n10', saida: '7.5' },
  ),
  monta(
    'contar-pares-vetor',
    'Quantos pares no vetor',
    'vetor',
    3,
    ['Leia 10 números e mostre quantos deles são pares.'],
    'nums: vetor[1..10] de inteiro\ni, qtd: inteiro',
    '  qtd <- 0\n  para i de 1 ate 10 faca\n   leia(nums[i])\n   se (nums[i] mod 2 = 0) entao\n    qtd <- qtd + 1\n   fimse\n  fimpara\n  escreval(qtd)',
    { entrada: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10', saida: '5' },
  ),
  monta(
    'vetor-invertido',
    'Vetor invertido',
    'vetor',
    3,
    ['Leia 6 números, guarde num vetor e mostre-os na ordem inversa.'],
    'nums: vetor[1..6] de inteiro\ni: inteiro',
    '  para i de 1 ate 6 faca\n   leia(nums[i])\n  fimpara\n  para i de 6 ate 1 passo -1 faca\n   escreval(nums[i])\n  fimpara',
    { entrada: '1\n2\n3\n4\n5\n6', saida: '6\n5\n4\n3\n2\n1', dica: 'Use passo -1 para descer' },
  ),
  monta(
    'procurar-valor',
    'Procurar no vetor',
    'vetor',
    4,
    ['Leia 8 números e depois um valor X. Diga se X aparece no vetor e em que posição (da primeira aparição).'],
    'nums: vetor[1..8] de inteiro\ni, x, achou: inteiro',
    '  para i de 1 ate 8 faca\n   leia(nums[i])\n  fimpara\n  leia(x)\n  achou <- 0\n  para i de 1 ate 8 faca\n   se (nums[i] = x) entao\n    achou <- i\n    i <- 8\n   fimse\n  fimpara\n  se (achou = 0) entao\n   escreval("não encontrado")\n  senao\n   escreval("encontrado na posição ", achou)\n  fimse',
    { entrada: '5\n2\n9\n1\n8\n4\n3\n7\n9', saida: 'encontrado na posição 3', dica: 'Marque a posição e pare o laço' },
  ),
  monta(
    'funcao-dobra',
    'Função que dobra',
    'funcao',
    2,
    [
      'Crie uma função chamada dobra que recebe um número e retorna o dobro dele.',
      'Use-a para mostrar o dobro de 5 e de 9.',
    ],
    '',
    '  escreval(dobra(5))\n  escreval(dobra(9))',
    {
      saida: '10\n18',
      dica: 'funcao dobra(x: inteiro): inteiro ... fimfuncao',
      funcoes: 'funcao dobra(x: inteiro): inteiro\ninicio\n retorne x * 2\nfimfuncao',
    },
  ),
  monta(
    'funcao-soma',
    'Função somar',
    'funcao',
    2,
    ['Crie uma função somar que recebe dois números e retorna a soma. Use-a para somar 3 e 4, e 10 e 20.'],
    '',
    '  escreval(somar(3, 4))\n  escreval(somar(10, 20))',
    {
      saida: '7\n30',
      funcoes: 'funcao somar(a: inteiro, b: inteiro): inteiro\ninicio\n retorne a + b\nfimfuncao',
    },
  ),
  monta(
    'funcao-par',
    'Função que diz se é par',
    'funcao',
    3,
    ['Crie uma função éPar(n) que retorna verdadeiro se o número for par e falso caso contrário. Teste com 10 e 7.'],
    '',
    '  escreval(ePar(10))\n  escreval(ePar(7))',
    {
      saida: 'verdadeiro\nfalso',
      dica: 'O retorno é do tipo logico',
      funcoes: 'funcao ePar(n: inteiro): logico\ninicio\n se (n mod 2 = 0) entao\n  retorne verdadeiro\n fimse\n retorne falso\nfimfuncao',
    },
  ),
  monta(
    'funcao-maximo',
    'Função máximo de três',
    'funcao',
    3,
    ['Crie uma função max3 que recebe três números e retorna o maior. Mostre o resultado de max3(5, 9, 2).'],
    '',
    '  escreval(max3(5, 9, 2))',
    {
      saida: '9',
      funcoes: 'funcao max3(a: inteiro, b: inteiro, c: inteiro): inteiro\ninicio\n se (a >= b) e (a >= c) entao\n  retorne a\n fimse\n se (b >= c) entao\n  retorne b\n fimse\n retorne c\nfimfuncao',
    },
  ),
  monta(
    'fatorial-funcao',
    'Fatorial recursivo',
    'funcao',
    4,
    ['Crie uma função fatorial que calcula o fatorial usando recursão. Mostre o fatorial de 5 e de 0.'],
    '',
    '  escreval(fatorial(5))\n  escreval(fatorial(0))',
    {
      saida: '120\n1',
      dica: 'Caso base: fatorial(0) = 1',
      funcoes: 'funcao fatorial(n: inteiro): inteiro\ninicio\n se (n <= 1) entao\n  retorne 1\n fimse\n retorne n * fatorial(n - 1)\nfimfuncao',
    },
  ),
  monta(
    'fibonacci',
    'Sequência de Fibonacci',
    'desafio',
    4,
    [
      'Mostre os primeiros N números da sequência de Fibonacci.',
      'Ela começa com 1, 1 e cada próximo número é a soma dos dois anteriores.',
    ],
    'n, i, termo: inteiro',
    '  leia(n)\n  para i de 1 ate n faca\n   termo <- fib(i)\n   escreval(termo)\n  fimpara',
    {
      entrada: '6',
      saida: '1\n1\n2\n3\n5\n8',
      dica: 'Crie uma função fib recursiva',
      funcoes: 'funcao fib(n: inteiro): inteiro\ninicio\n se (n <= 2) entao\n  retorne 1\n fimse\n retorne fib(n - 1) + fib(n - 2)\nfimfuncao',
    },
  ),
  monta(
    'triangulo-asteriscos',
    'Triângulo de asteriscos',
    'desafio',
    3,
    ['Leia a altura e desenhe um triângulo de asteriscos, linha a linha. Exemplo com altura 3:'],
    'alt, i, j: inteiro',
    '  leia(alt)\n  para i de 1 ate alt faca\n   para j de 1 ate i faca\n    escreva("*")\n   fimpara\n   escreval("")\n  fimpara',
    { entrada: '3', saida: '*\n**\n***', dica: 'Um para dentro do outro' },
  ),
  monta(
    'num-binario',
    'Número binário',
    'desafio',
    4,
    ['Leia um número inteiro e mostre sua representação binária. Dica: divida por 2 e acumule os restos de trás para frente.'],
    'n, r: inteiro\nbin: caractere',
    '  leia(n)\n  bin <- ""\n  enquanto (n > 0) faca\n   r <- n mod 2\n   se (r = 1) entao\n    bin <- "1" + bin\n   senao\n    bin <- "0" + bin\n   fimse\n   n <- n div 2\n  fimenquanto\n  escreval(bin)',
    { entrada: '13', saida: '1101', dica: 'r <- n mod 2 e monte de trás pra frente' },
  ),
  monta(
    'adivinhe',
    'Adivinhe o número',
    'desafio',
    3,
    ['O programa sorteia um número de 0 a 100. O usuário tenta adivinhar; o programa responde se o palpite é alto ou baixo. Ao acertar, mostre as tentativas.'],
    'segredo, palpite, tentativas: inteiro',
    '  segredo <- aleatorio(101)\n  tentativas <- 0\n  repita\n   leia(palpite)\n   tentativas <- tentativas + 1\n   se (palpite > segredo) entao\n    escreval("Muito alto")\n   senao\n    se (palpite < segredo) entao\n     escreval("Muito baixo")\n    fimse\n   fimse\n  ate (palpite = segredo)\n  escreval("Acertou em ", tentativas, " tentativas")',
    { saida: 'pistas até o acerto', dica: 'Use aleatorio(101) para sortear de 0 a 100' },
  ),
  monta(
    'collatz',
    'Sequência de Collatz',
    'desafio',
    4,
    [
      'Comece com um número N. Enquanto for diferente de 1: se for par, N = N/2; se for ímpar, N = 3*N + 1. Mostre a sequência.',
      'Toda sequência de Collatz termina em 1.',
    ],
    'n: inteiro',
    '  leia(n)\n  enquanto (n <> 1) faca\n   escreval(n)\n   se (n mod 2 = 0) entao\n    n <- n div 2\n   senao\n    n <- n * 3 + 1\n   fimse\n  fimenquanto\n  escreval(1)',
    { entrada: '6', saida: '6\n3\n10\n5\n16\n8\n4\n2\n1' },
  ),
]

function gerar(): Exercicio[] {
  const lista: Exercicio[] = []
  let n = 0

  for (const c of [5, 8, 12, 20, 30, 50]) {
    n++
    lista.push(
      monta(
        `gen-contagem-${n}`,
        `Conte de 1 até ${c}`,
        'laco',
        1,
        [`Mostre os números de 1 até ${c}, um por linha, usando um laço.`],
        'i: inteiro',
        `  para i de 1 ate ${c} faca\n   escreval(i)\n  fimpara`,
        { saida: Array.from({ length: c }, (_, k) => k + 1).join('\n') },
      ),
    )
  }

  for (const t of [3, 6, 9, 12, 15]) {
    n++
    lista.push(
      monta(
        `gen-tabuada-${n}`,
        `Tabuada do ${t}`,
        'laco',
        1,
        [`Mostre a tabuada do ${t}, de ${t} x 1 até ${t} x 10.`],
        'i: inteiro',
        `  para i de 1 ate 10 faca\n   escreval("${t} x ", i, " = ", ${t} * i)\n  fimpara`,
        {
          saida: Array.from({ length: 10 }, (_, k) => `${t} x ${k + 1} = ${t * (k + 1)}`).join('\n'),
        },
      ),
    )
  }

  for (const s of [3, 5, 10, 15, 25, 40]) {
    n++
    lista.push(
      monta(
        `gen-soma-${n}`,
        `Soma de 1 até ${s}`,
        'laco',
        2,
        [`Calcule e mostre a soma de 1 até ${s}.`],
        'i, soma: inteiro',
        `  soma <- 0\n  para i de 1 ate ${s} faca\n   soma <- soma + i\n  fimpara\n  escreval(soma)`,
        { saida: String((s * (s + 1)) / 2) },
      ),
    )
  }

  for (const q of [3, 5, 7, 9, 12]) {
    n++
    lista.push(
      monta(
        `gen-quadrado-${n}`,
        `Quadrado de 1 até ${q}`,
        'laco',
        2,
        [`Mostre o quadrado de cada número de 1 até ${q}, um por linha.`],
        'i: inteiro',
        `  para i de 1 ate ${q} faca\n   escreval(i, " ao quadrado = ", i * i)\n  fimpara`,
        {
          saida: Array.from({ length: q }, (_, k) => `${k + 1} ao quadrado = ${(k + 1) * (k + 1)}`).join('\n'),
        },
      ),
    )
  }

  for (const p of [6, 10, 14, 20, 32]) {
    n++
    lista.push(
      monta(
        `gen-pares-${n}`,
        `Números pares até ${p}`,
        'laco',
        2,
        [`Mostre todos os números pares de 2 até ${p}.`],
        'i: inteiro',
        `  para i de 2 ate ${p} passo 2 faca\n   escreval(i)\n  fimpara`,
        {
          saida: Array.from({ length: Math.floor(p / 2) }, (_, k) => (k + 1) * 2).join('\n'),
        },
      ),
    )
  }

  for (const [a, b, area] of [
    [4, 3, 12],
    [5, 7, 35],
    [6, 9, 54],
    [12, 2, 24],
    [15, 4, 60],
  ] as Array<[number, number, number]>) {
    n++
    lista.push(
      monta(
        `gen-area-${n}`,
        `Área do retângulo ${a} x ${b}`,
        'basico',
        1,
        [`Leia a base (${a}) e a altura (${b}) de um retângulo e mostre a área.`],
        'base, altura: real',
        '  leia(base)\n  leia(altura)\n  escreval(base * altura)',
        { entrada: `${a}\n${b}`, saida: String(area) },
      ),
    )
  }

  for (const d of [12, 21, 33, 47, 100]) {
    n++
    lista.push(
      monta(
        `gen-dobro-${n}`,
        `O dobro de ${d}`,
        'basico',
        1,
        [`Leia ${d} e mostre o dobro dele.`],
        'n: inteiro',
        '  leia(n)\n  escreval(n * 2)',
        { entrada: String(d), saida: String(d * 2) },
      ),
    )
  }

  return lista
}

export const EXERCICIOS: Exercicio[] = [...FIXOS, ...gerar()]

export function exercicioPorId(id: string): Exercicio | undefined {
  return EXERCICIOS.find((e) => e.id === id)
}

export function filtrarExercicios(opts: {
  categoria?: Categoria | 'todas'
  dificuldade?: Dificuldade | 'todas'
  busca?: string
}): Exercicio[] {
  return EXERCICIOS.filter((e) => {
    if (opts.categoria && opts.categoria !== 'todas' && e.categoria !== opts.categoria) return false
    if (opts.dificuldade && opts.dificuldade !== 'todas' && e.dificuldade !== opts.dificuldade) return false
    if (opts.busca) {
      const q = opts.busca.toLowerCase()
      const alvo = `${e.titulo} ${e.enunciado.join(' ')}`.toLowerCase()
      if (!alvo.includes(q)) return false
    }
    return true
  })
}