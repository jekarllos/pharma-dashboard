# EasyPharma Dashboard

![React](https://img.shields.io/badge/React-18-blue)
![Node](https://img.shields.io/badge/Node.js-18-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Database-red)
![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

---

Dashboard Full-Stack para gestão de vendas e estoque no varejo farmacêutico, com foco em segurança, performance e uso em cenários reais de sistema corporativo.

O projeto foi construído como parte do meu processo de transição de carreira da área de **suporte técnico** para **desenvolvimento de software**, utilizando uma arquitetura moderna e boas práticas aplicadas a sistemas empresariais.

---

## Visão Geral

O **EasyPharma Dashboard** tem como objetivo fornecer uma visão operacional e analítica sobre:

- faturamento
- volume de vendas
- ticket médio
- estoque crítico
- tendência de vendas por período
- consulta detalhada de movimentações

A proposta do sistema é reproduzir um cenário real de software corporativo utilizado em empresas do segmento farmacêutico, com foco em **dados de negócio**, **segurança da informação** e **desempenho em consultas com alto volume de dados**.

---

## Stack utilizada

### Front-end
- **React**
- **Vite**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn/ui**
- **TanStack Query**

### Back-end
- **Node.js**
- **Express**
- **TypeScript**

### Banco de Dados
- **SQL Server**

---

## Destaques de Segurança

Este projeto foi construído com foco em práticas de segurança aplicadas a aplicações web corporativas.

### Autenticação com Cookies HttpOnly
A autenticação utiliza **JWT armazenado em Cookie HttpOnly**, evitando exposição do token no `localStorage` e reduzindo riscos de ataques XSS.

### Proteção contra SQL Injection
As consultas ao SQL Server utilizam **queries parametrizadas / prepared statements**, impedindo concatenação insegura de valores e aumentando a proteção contra SQL Injection.

### Validação de entrada com Zod
Os dados recebidos pelas rotas são validados com **Zod**, garantindo:
- tipos corretos
- parâmetros esperados
- rejeição de payloads inválidos

### Middleware de autenticação JWT
As rotas protegidas utilizam middleware para:
- validar o token
- bloquear acesso não autorizado
- impedir acesso direto a recursos sensíveis

### Hardening básico de API
Também foram aplicadas práticas como:
- **Helmet** para segurança de headers
- **CORS configurado**
- uso de **.env**
- limite de payload em requisições JSON

---

## Destaques de Performance

O projeto também foi estruturado com foco em desempenho, especialmente para cenários de alto volume de dados.

### Paginação Server-side no SQL Server
As tabelas principais utilizam **paginação no back-end**, evitando trazer grandes volumes de dados para o navegador de uma só vez.

Isso reduz:
- consumo de memória no front-end
- tráfego de rede desnecessário
- custo de renderização no React

### Cache com TanStack Query
No front-end, o **TanStack Query** foi utilizado para:
- cache de respostas
- reaproveitamento de requisições
- melhor controle de loading, refetch e estados assíncronos

### Debounce em buscas
A estratégia de **debounce** foi planejada para buscas, evitando múltiplas chamadas consecutivas ao servidor enquanto o usuário ainda está digitando.

### Consultas filtradas por período
As consultas de vendas e indicadores operam com filtros por data e paginação, reduzindo impacto no banco e tornando a experiência mais fluida.

---

## Diferenciais técnicos

- Paginação server-side integrada com SQL Server
- Autenticação segura com JWT em cookie HttpOnly
- Separação clara entre front-end e back-end
- Uso consistente de TypeScript em toda a aplicação
- Estrutura preparada para evolução com filtros, busca e análise de dados


## Contexto de Negócio

O sistema foi pensado para o contexto de **varejo farmacêutico**, onde é fundamental acompanhar:

- vendas por período
- tendência de faturamento
- ticket médio
- movimentações diárias
- estoque crítico

A proposta é simular um dashboard utilizado por gestores e equipes operacionais para apoio à tomada de decisão, com dados apresentados de forma clara, rápida e segura.

---

## Funcionalidades implementadas

- Login com autenticação segura
- Dashboard com indicadores de vendas
- Gráfico de tendência de faturamento
- Consulta de estoque crítico
- Tela de vendas com filtro por período
- Paginação de resultados
- Cards com resumo financeiro
- Estrutura preparada para evolução com busca, ordenação, exportação e detalhamento por venda

---

## Arquitetura do Projeto

O projeto foi organizado em estrutura **Full-Stack separada por client/server**, mantendo responsabilidades bem definidas entre front-end e back-end.

```txt
pharma-dashboard/
├── client/
│   ├── src/
│   └── ...
├── server/
│   ├── src/
│   └── ...
└── README.md
```

## Como executar localmente

1. **Clone o repositório**
2. **Configuração do Server:**
   - Acesse a pasta `/server`, instale as dependências (`npm install`).
   - Crie um arquivo `.env` baseado no `.env.example`.
   - Inicie o servidor: `npm run dev`.
3. **Configuração do Client:**
   - Acesse a pasta `/client`, instale as dependências (`npm install`).
   - Inicie o front-end: `npm run dev`.

   ---

## Autor

Jean Silva

Atualmente em transição de carreira da área de suporte técnico para desenvolvimento.

Este projeto foi desenvolvido como forma de aplicar na prática conceitos de back-end, segurança, integração com banco SQL Server e construção de interfaces voltadas para uso real.

A proposta foi construir algo próximo de um sistema corporativo, indo além de exemplos simples de portfólio.
