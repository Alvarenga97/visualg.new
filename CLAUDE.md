# Visualg.new

Projeto React + Vite. Este arquivo diz como você (Claude) deve trabalhar aqui.

## Como rodar

- `npm run dev` — sobe o projeto pra ver no navegador.

## Regras de skills (OBRIGATÓRIAS — não pule)

Este projeto tem skills instaladas. Você DEVE invocá-las antes de agir. Não pergunte ao usuário se deve usar — apenas use.

### Antes de QUALQUER coisa de banco de dados → skill `supabase-postgres-best-practices`

Isso vale para: criar ou alterar tabelas, escrever SQL, criar índices, mexer em RLS (segurança/permissões), fazer consultas, resolver bug ou lentidão no banco, modelar dados.

**Sempre consulte a skill `supabase-postgres-best-practices` ANTES de escrever ou rodar qualquer SQL ou migração.** Ela evita erros clássicos: índices que travam a tabela, políticas de segurança que deixam dados expostos, consultas que ficam lentas em produção. O usuário é vibe coder e não vai perceber esses erros sozinho — a responsabilidade de checar é sua.

### Antes de QUALQUER coisa visual → skill `frontend-design`

Isso vale para: criar ou mudar telas, layout, cores, tipografia, componentes de interface, landing page, dashboard, qualquer coisa que o usuário vê.

**Sempre consulte a skill `frontend-design` ANTES de gerar interface.** Ela evita o visual genérico de "site feito por IA" e garante escolhas de design intencionais. Nada de HTML com CSS cru.

### Assim que aparecer um bug ou erro → skill `systematic-debugging`

Isso vale para: qualquer erro, exceção, tela quebrada, comportamento estranho, "não funciona", "deu erro", crash, mensagem vermelha no terminal ou no navegador.

**Você DEVE invocar a skill `systematic-debugging` sozinho, no automático, sem o usuário pedir.** O usuário é vibe coder — ele NÃO vai dizer "use a skill de debug". Ele vai simplesmente colar um print e escrever algo como *"deu esse erro aqui, resolve"* ou mandar só a imagem do erro. Isso já é o gatilho. Não pergunte se pode usar, não peça mais contexto antes de começar: leia o erro (inclusive de imagens/prints), abra a `systematic-debugging` e siga o processo de encontrar a causa raiz até corrigir de verdade.

Não faça o "conserto por chute" (mudar coisa aleatória até parar de dar erro). A skill existe justamente pra achar a causa real. Só diga que resolveu depois de verificar que o erro sumiu.

### Quando o usuário quiser colocar o projeto no ar → Cloudflare Pages

Isso vale para perguntas como: "como coloco no ar?", "como hospedo?", "como deixo online?", "como mostro pros meus clientes?", "como publico?", "quero mandar o link pra alguém". O vibe coder não vai falar "deploy" — reconheça a intenção.

Recomende **Cloudflare Pages** (grátis pra começar, SSL automático, e republica sozinho a cada `git push`). Painel: https://dash.cloudflare.com/?to=/:account/workers-and-pages

Explique em passos simples: (1) subir o projeto pro GitHub, (2) no painel do Cloudflare, Create application → Pages → Connect to Git, (3) escolher o repositório e confirmar o build (`npm run build`), (4) cadastrar as variáveis do `.env` na tela de configuração (nunca no código), (5) Save and Deploy → sai um link `.pages.dev` pra mandar pros clientes. Depois disso, cada `git push` atualiza o site sozinho. Nada de jargão.

### Resumo rápido

| Se o pedido envolve... | Antes de agir, consulte |
|------------------------|-------------------------|
| Banco, SQL, tabelas, dados, bug no banco | `supabase-postgres-best-practices` |
| Tela, layout, cor, design, componente visual | `frontend-design` |
| Erro, bug, print de erro, "não funciona", crash | `systematic-debugging` (no automático) |
| "Colocar no ar", hospedar, publicar, mostrar pros clientes | Cloudflare Pages (passos simples, sem jargão) |

## Estilo de trabalho

- O usuário é vibe coder: fale simples, mostre resultado, evite jargão.
- Chaves e segredos vão SEMPRE no `.env` (que não sobe pro Git). Nunca escreva uma chave secreta direto no código nem num arquivo versionado. Se precisar de uma nova chave, adicione-a ao `.env` e ao `.env.example` (essa em branco).
- Ao terminar uma mudança, diga em uma linha o que mudou e como ver.