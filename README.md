# core.cx — módulo DP

Registro de pessoal em SaaS: ficha dos colaboradores, ocorrências e faltas, atestados e movimentações.
A base de dados é uma planilha do Google Sheets.

Feito em Next.js 15 (App Router), Tailwind CSS e API do Google Sheets. Publica no Vercel.

---

## O que a plataforma faz

| Tela | Endereço | Para que serve |
| --- | --- | --- |
| Entrada | `/entrar` | Acesso com e-mail e senha definidos em variável de ambiente |
| Painel | `/painel` | Quadro de pessoas ativas por área, pendências do dia e últimos lançamentos |
| Indicadores | `/indicadores` | Turnover, absenteísmo, evolução do quadro, reincidência e tempo de casa |
| Colaboradores | `/colaboradores` | Lista com busca e filtros, e cadastro de novas pessoas |
| Ficha | `/colaboradores/MAT001` | Dados cadastrais e todo o histórico da pessoa |
| Ocorrências | `/ocorrencias` | Faltas, atrasos e medidas disciplinares |
| Atestados | `/atestados` | Afastamentos médicos, com aprovar e rejeitar na própria linha |
| Movimentações | `/movimentacoes` | Promoções, transferências e desligamentos, com checklist |

A matrícula e os códigos de registro (`MAT004`, `OCO004`, `ATE004`, `MOV004`) são gerados
automaticamente, seguindo a sequência que já existe na planilha — e a sequência é por empresa:
cada cliente tem o próprio `MAT001`.

## Uma planilha, vários clientes

Todos os clientes vivem na mesma planilha. Cada aba tem uma coluna `Cliente`, e cada usuário do
`AUTH_USUARIOS` tem um campo `cliente`. Ao entrar, a pessoa só enxerga as linhas cujo `Cliente`
bate com o dela — na lista, na busca, na ficha, no painel e nos indicadores. Toda linha gravada
recebe o código da empresa automaticamente; não existe campo na tela para escolher isso, e
alterações em linhas de outra empresa são recusadas.

O recorte não é um parâmetro que alguma tela possa esquecer de passar: ele vem da sessão, dentro
da camada de leitura. Para acrescentar um cliente novo, basta um usuário a mais no
`AUTH_USUARIOS` com um `cliente` novo. Nenhuma mudança de código.

---

## Passo 1 — Preparar a planilha

Crie uma planilha no Google Sheets com quatro abas, com estes nomes exatos e estes cabeçalhos
na primeira linha:

**Colaboradores**

```
Cliente | Matricula | Nome_Completo | CPF | Departamento | Cargo | Gestor_Imediato | Data_Admissao | Status
```

**Ocorrencias_Faltas**

```
Cliente | ID_Ocorrencia | Data_Registro | Matricula | Data_Falta | Tipo_Ocorrencia | Justificada | Motivo
```

**Atestados**

```
Cliente | ID_Atestado | Data_Registro | Matricula | Data_Inicio | Dias_Afastamento | CID | Anexo_URL | Status_Validacao
```

**Movimentacoes_DP**

```
Cliente | ID_Movimentacao | Data_Registro | Matricula | Tipo_Movimentacao | Data_Efetiva | Motivo | Status_Checklist
```

A coluna `Cliente` guarda um código curto, sem espaço nem acento: `conexao`, `super-show`. É esse
código que liga a linha ao login. Se você já tem dados na planilha, acrescente a coluna e preencha
todas as linhas antes de subir — linha com `Cliente` vazio não aparece para ninguém.

O jeito mais rápido é abrir o `Core_CX_DP.xlsx` no Drive e converter para Google Sheets
(Arquivo → Salvar como Planilha Google).

Guarde o **ID da planilha**: é o trecho entre `/d/` e `/edit` no endereço.

```
https://docs.google.com/spreadsheets/d/AQUI_ESTA_O_ID/edit
```

As colunas são localizadas pelo nome do cabeçalho, não pela posição. Você pode reordenar
colunas na planilha sem quebrar o sistema. Só não mude os nomes.

---

## Passo 2 — Criar o acesso do sistema à planilha

1. Entre no [Google Cloud Console](https://console.cloud.google.com) e crie um projeto.
2. Em **APIs e serviços → Biblioteca**, procure **Google Sheets API** e ative.
3. Em **APIs e serviços → Credenciais**, clique em **Criar credenciais → Conta de serviço**.
   Dê um nome (por exemplo `core-cx-dp`) e conclua.
4. Abra a conta de serviço criada, vá em **Chaves → Adicionar chave → Criar nova chave → JSON**.
   O arquivo baixa automaticamente. Dentro dele estão dois valores que você vai usar:
   `client_email` e `private_key`.
5. Volte à planilha, clique em **Compartilhar** e adicione o `client_email` da conta de serviço
   como **Editor**.

Sem o passo 5 o sistema não enxerga a planilha, mesmo com as credenciais certas.

---

## Passo 3 — Rodar na sua máquina

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha o `.env.local`:

```ini
GOOGLE_SHEET_ID=id_da_sua_planilha

GOOGLE_CLIENT_EMAIL=core-cx-dp@seu-projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"

AUTH_SECRET=gere_com_openssl_rand_base64_32

AUTH_USUARIOS=[{"nome":"Equipe de DP","email":"dp@conexao.com.br","senha":"troque-esta-senha","cliente":"conexao","empresa":"Conexão"}]
```

Sobre a chave privada: copie o valor de `private_key` do JSON exatamente como está, entre aspas
duplas, com os `\n` literais. O sistema converte para quebras de linha sozinho.

Para gerar o `AUTH_SECRET`:

```bash
openssl rand -base64 32
```

Cada usuário tem quatro campos obrigatórios e um opcional:

- `email` e `senha` — o acesso
- `cliente` — o código que casa com a coluna `Cliente` da planilha
- `nome` — aparece no rodapé da navegação
- `empresa` — o nome da empresa que aparece na tela (se faltar, usa o código)

Para atender mais de um cliente, é só somar objetos na lista:

```ini
AUTH_USUARIOS=[{"nome":"Mariana Costa","email":"mariana@conexao.com.br","senha":"...","cliente":"conexao","empresa":"Conexão"},{"nome":"Lucas Alves","email":"lucas@supershow.com.br","senha":"...","cliente":"super-show","empresa":"Super Show"}]
```

Abra `http://localhost:3000`.

---

## Passo 4 — Subir para o GitHub

```bash
git init
git add .
git commit -m "core.cx modulo DP"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/core-cx-dp.git
git push -u origin main
```

O `.gitignore` já bloqueia `.env`, `.env.local` e `node_modules`. Nunca suba a chave privada
para o repositório.

---

## Passo 5 — Publicar no Vercel

1. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
2. O Vercel detecta Next.js sozinho. Não mexa em build command nem output directory.
3. Antes de clicar em **Deploy**, abra **Environment Variables** e cadastre as cinco variáveis do
   `.env.local`, uma a uma, marcando Production, Preview e Development.
4. Deploy.

Ao colar a `GOOGLE_PRIVATE_KEY` no Vercel, cole o valor entre aspas duplas, igual ao do arquivo
local. Se alterar qualquer variável depois, é preciso fazer um novo deploy para valer.

---

## Estrutura do código

```
app/
  acoes.js                      ações de servidor: entrar, sair e gravar registros
  layout.js                     tipografia e metadados
  entrar/                       tela de acesso
  (sistema)/
    layout.js                   navegação e proteção das telas internas
    painel/                     quadro de pessoal, pendências e lançamentos
    indicadores/                turnover, absenteísmo, quadro e distribuições
    colaboradores/              lista, cadastro e ficha individual
    ocorrencias/
    atestados/
    movimentacoes/
componentes/                    marca, carimbo, tabelas, campos, filtros, painel lateral
lib/
  planilha.js                   conversa com a API do Google Sheets
  contexto.js                   descobre de qual cliente é a sessão
  registros.js                  leitura e escrita dos quatro livros, já filtrados
  indicadores.js                cálculo de turnover, absenteísmo e séries mensais
  formato.js                    datas, CPF, tempo de casa
  sessao.js                     cookie de sessão assinado
middleware.js                   redireciona quem não está autenticado
```

---

## Decisões que valem conhecer

**Datas.** A leitura pede número de série ao Google e converte aqui. Assim as datas não quebram
se o idioma da planilha mudar. A gravação usa formato ISO (`2026-09-14`), que o Sheets reconhece
em qualquer configuração regional. Se quiser ver `14/09/2026` na planilha, formate a coluna como
data — o sistema continua lendo certo.

**Colunas.** São encontradas pelo nome no cabeçalho. Reordenar não quebra; renomear sim.

**Acesso.** As senhas ficam em variável de ambiente, não na planilha. É o suficiente para uma
equipe pequena de DP. Se o time crescer ou se for preciso trilha de auditoria por pessoa, o
próximo passo é trocar por um provedor de identidade.

**Dados sensíveis.** CPF e CID ficam na planilha, sob as permissões que você definir no Drive.
Quem tem acesso à planilha vê tudo, independentemente do que a plataforma mostra.

---

## Quando algo não funciona

| O que aparece | O que resolve |
| --- | --- |
| "A conta de serviço não tem acesso à planilha" | Compartilhe a planilha com o `client_email` como Editor |
| "Uma das abas não foi encontrada" | Confira os nomes das abas, sem acento e com underline |
| "A conexão com a planilha não está configurada" | Falta `GOOGLE_CLIENT_EMAIL` ou `GOOGLE_PRIVATE_KEY` |
| "Nenhum acesso foi configurado ainda" | Falta `AUTH_USUARIOS` |
| "A aba X ainda não tem a coluna Cliente" | Acrescente a coluna `Cliente` no cabeçalho daquela aba |
| "Este acesso não está ligado a nenhuma empresa" | Falta o campo `cliente` naquele usuário |
| Entrou e não vê nada | O código em `cliente` não bate com o da coluna `Cliente` |
| Erro de chave inválida no deploy | A `GOOGLE_PRIVATE_KEY` perdeu os `\n`. Cole de novo entre aspas |
