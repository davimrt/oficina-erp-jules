# Oficina ERP - MVP Sistema de Gestão de Oficina Mecânica

Este é um MVP funcional de um sistema de gestão simples, limpo e intuitivo para oficinas mecânicas de pequeno porte. Ele foi desenvolvido com foco total na rapidez operacional: um mecânico consegue abrir uma nova Ordem de Serviço em **menos de um minuto** usando o celular.

## 🚀 Tecnologias Utilizadas

* **Next.js 16 (App Router)** com Turbopack e TypeScript.
* **Tailwind CSS v4** para uma interface limpa, ultra-responsiva e adaptada para celulares.
* **Prisma ORM v7** para modelagem de banco de dados e controle seguro de tipos.
* **SQLite** como banco de dados local leve.
* **Jest + ts-jest** para testes unitários automatizados rápidos e eficientes.
* **Lucide React** para iconografia moderna.

---

## 🛠️ Instalação e Configuração

Siga os passos abaixo para configurar o ambiente localmente:

### 1. Instalar as dependências

Certifique-se de que possui o Node.js instalado (v18 ou superior recomendado). Na raiz do projeto, execute:

```bash
npm install
```

### 2. Criar o Banco de Dados e Aplicar Migrações

Crie o arquivo SQLite local e aplique a estrutura das tabelas executando:

```bash
npm run db:migrate
```

### 3. Popular com Dados de Demonstração (Seed)

Popule o banco de dados imediatamente com dados fictícios prontos para testes rápidos (clientes, veículos, mecânicos e ordens de serviço em diversos status):

```bash
npm run db:seed
```

---

## 💻 Executando o Projeto

### Rodar em modo de desenvolvimento

Inicie o servidor de desenvolvimento local:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador ou acesse pelo celular na mesma rede local.

---

## 🧪 Testes Automatizados e Qualidade

O sistema possui uma suíte de testes focada nas principais regras de negócio (cálculos financeiros, validações de duplicidade de placas, criação rápida de clientes e vínculos).

### Executar testes automatizados

```bash
npm run test
```

### Executar o Linter de código

```bash
npm run lint
```

### Gerar Build de Produção

Para testar a compilação final otimizada para produção:

```bash
npm run build
```

---

## 🌟 Funcionalidades Implementadas

1. **Painel Geral (Dashboard)**:
   * Métricas em tempo real de: *Ordens de Serviço Ativas*, *Aguardando Diagnóstico*, *Serviços em Execução* e *Prontos para Entrega*.
   * Listas detalhadas de veículos em cada etapa, facilitando a visualização rápida pelo proprietário da oficina.

2. **Abertura Rápida de OS (Modo Mobile)**:
   * Formulado especificamente para celulares (botões grandes e fáceis de tocar).
   * Campo de "Queixa do Cliente" com maior destaque na tela.
   * Autocomplete instantâneo para clientes e placas existentes.
   * **Criação Automática**: Caso digite um cliente ou placa inexistente, o sistema cria o cadastro do cliente e do veículo automaticamente em segundo plano.

3. **Gestão de Ordens de Serviço**:
   * Descrição de diagnóstico interno e atribuição de mecânico.
   * Adicionar e remover itemizado de **Serviços Prestados** e **Peças Utilizadas**.
   * **Cálculo Financeiro Automático**: Atualização automática e segura do preço total somando mão de obra e peças.
   * **Histórico de Status**: Registro automático com carimbo de data e hora para cada alteração de status (Nova, Em Diagnóstico, Aguardando Aprovação, Aprovada, Em Execução, Pronta, Entregue).

4. **Cadastro de Clientes**:
   * CRUD completo (Criar, Visualizar, Editar e Excluir) de clientes com Notas Internas.

5. **Cadastro de Veículos**:
   * CRUD completo vinculado aos clientes com placa no padrão Mercosul/tradicional.

---

## 📂 Estrutura de Pastas Técnica

* `prisma/schema.prisma` - Definição dos modelos de dados (Customer, Vehicle, Mechanic, ServiceOrder, etc.).
* `prisma/seed.ts` - Script para popular dados iniciais.
* `src/app/actions/` - Server Actions contendo todas as regras de negócio de backend seguras contra injeção de dados.
* `src/app/` - Estrutura de rotas do Next.js App Router (Páginas, formulários e layouts).
* `src/__tests__/` - Testes automatizados escritos em Jest.
* `src/lib/prisma.ts` - Instanciação e adaptadores para o Prisma Client local.
