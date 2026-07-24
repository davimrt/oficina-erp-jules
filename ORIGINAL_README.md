# Oficina ERP

MVP de um sistema simples de gestão para oficinas mecânicas, desenvolvido para testar a capacidade do Google Jules em criar e evoluir uma aplicação web completa.

O objetivo principal é permitir que uma oficina pequena registre clientes, veículos e ordens de serviço com o mínimo de etapas possível. A abertura de uma nova ordem de serviço deve levar menos de um minuto e funcionar bem tanto no computador quanto no celular.

## Objetivos do projeto

* Simplificar a abertura de ordens de serviço.
* Evitar telas complexas e campos desnecessários.
* Centralizar clientes, veículos e serviços realizados.
* Permitir o acompanhamento rápido do andamento de cada veículo.
* Criar uma base que possa evoluir posteriormente para estoque, financeiro, WhatsApp e outras integrações.

## Escopo inicial

O MVP deve incluir:

### Dashboard

Visão resumida da operação da oficina, mostrando:

* Ordens de serviço abertas.
* Veículos aguardando diagnóstico.
* Serviços em andamento.
* Veículos prontos para entrega.

### Clientes

Cadastro simples com:

* Nome.
* Telefone.
* Observações opcionais.

O sistema deve permitir criar, editar, visualizar e excluir clientes.

### Veículos

Cadastro com:

* Placa.
* Marca.
* Modelo.
* Ano opcional.
* Cliente vinculado.

O sistema deve permitir criar, editar, visualizar e excluir veículos.

### Abertura rápida de ordem de serviço

A criação de uma nova ordem de serviço deve ser simples, rápida e adequada para uso em celular.

Campos principais:

* Cliente ou telefone.
* Placa do veículo.
* Problema relatado pelo cliente.
* Mecânico responsável, opcional.
* Status inicial.

O problema relatado pelo cliente deve ser o campo de maior destaque da tela.

### Gestão de ordens de serviço

Cada ordem de serviço deve permitir registrar:

* Problema relatado pelo cliente.
* Diagnóstico interno.
* Serviços realizados.
* Peças utilizadas.
* Valor da mão de obra.
* Valor das peças.
* Valor total calculado automaticamente.
* Mecânico responsável.
* Histórico de alterações de status.

Status previstos:

* Nova.
* Em diagnóstico.
* Aguardando aprovação.
* Aprovada.
* Em execução.
* Pronta.
* Entregue.

## Stack sugerida

* Next.js.
* TypeScript.
* App Router.
* Tailwind CSS.
* Prisma ORM.
* SQLite para desenvolvimento local.

## Requisitos de experiência de uso

* Interface responsiva.
* Fluxos curtos e objetivos.
* Textos e botões em português do Brasil.
* Boa utilização em smartphones.
* Poucos campos obrigatórios.
* Navegação clara para usuários com pouca familiaridade com computadores.
* Evitar aparência e comportamento de um ERP tradicional complexo.

## Requisitos técnicos

* Código organizado e tipado.
* Validação dos campos principais.
* Tratamento básico de erros.
* Banco de dados com relacionamentos consistentes.
* Dados demonstrativos para testes.
* Testes automatizados das principais regras de negócio.
* Verificação de lint e build de produção.
* Instruções claras de instalação e execução.

## Estrutura de dados esperada

O projeto deve possuir, no mínimo, as seguintes entidades:

* Customer.
* Vehicle.
* Mechanic.
* ServiceOrder.
* ServiceOrderItem.
* PartItem.
* StatusHistory.

Os nomes internos podem permanecer em inglês, mas toda a interface apresentada ao usuário deve estar em português do Brasil.

## Regras importantes

* Um cliente pode possuir vários veículos.
* Um veículo pertence a um cliente.
* Uma ordem de serviço pertence a um veículo e a um cliente.
* O mecânico responsável pode ser definido posteriormente.
* O valor total da ordem deve ser a soma da mão de obra com as peças.
* Toda mudança de status deve registrar data e hora.
* Uma ordem entregue não deve aparecer entre os serviços ativos do dashboard.

## Dados de demonstração

Criar dados iniciais suficientes para testar imediatamente:

* Clientes fictícios.
* Veículos vinculados.
* Mecânicos.
* Ordens de serviço em diferentes status.
* Serviços e peças de exemplo.

## Critérios de conclusão

O MVP será considerado funcional quando for possível:

1. Cadastrar um cliente.
2. Vincular um veículo ao cliente.
3. Criar uma ordem de serviço rapidamente.
4. Registrar diagnóstico, serviços e peças.
5. Alterar o status da ordem.
6. Consultar o histórico de status.
7. Visualizar os indicadores no dashboard.
8. Executar o projeto localmente sem erros.
9. Executar os testes automatizados.
10. Gerar o build de produção com sucesso.

## Comandos esperados

Depois da implementação, o projeto deve possuir comandos equivalentes a:

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
npm run test
npm run lint
npm run build
```

Os nomes exatos podem variar, mas devem estar documentados no README final do projeto.

## Fora do escopo deste primeiro MVP

Não implementar nesta primeira versão:

* Integração com WhatsApp.
* Processamento de áudio.
* Reconhecimento de imagens.
* Emissão de nota fiscal.
* Pagamentos online.
* Controle financeiro completo.
* Controle avançado de estoque.
* Multiempresa.
* Controle detalhado de permissões.

Esses recursos poderão ser avaliados após a validação do núcleo de ordens de serviço.

## Instrução para o agente de desenvolvimento

Antes de iniciar a implementação:

1. Analise o repositório.
2. Apresente um plano curto de desenvolvimento.
3. Defina a estrutura técnica proposta.
4. Implemente o sistema por etapas.
5. Execute migrações, testes, lint e build.
6. Corrija os erros encontrados.
7. Verifique visualmente as principais telas.
8. Documente as decisões e os comandos necessários.

O foco deve permanecer na simplicidade operacional da oficina, especialmente na abertura rápida de uma nova ordem de serviço.