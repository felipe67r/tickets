# Controle de Atendimento

Este projeto é um sistema de controle de atendimento que possui um back-end em Node.js e um front-end em Angular com Ionic.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:

- [Node.js](https://nodejs.org/) (versão 16 ou superior)
- [NPM](https://www.npmjs.com/) (geralmente instalado junto com o Node.js)
- [Ionic CLI](https://ionicframework.com/docs/cli) (instale com `npm install -g @ionic/cli`)
- Banco de dados MySQL

## Configuração do Banco de Dados

1. O repositório já contém o dump do banco de dados com a criação automática do schema. Certifique-se de que o servidor MySQL esteja rodando e importe o arquivo de dump para o seu banco de dados MySQL.

   ```bash
   mysql -u <seu_usuario> -p < nome_do_banco > < caminho_para_o_dump.sql >
   ```

2. Configure as credenciais de acesso ao banco de dados no arquivo `back-end/config/db.js` ou crie um arquivo `.env` na pasta `back-end/config` com base no arquivo `.env.example`.

Exemplo de configuração no `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=sistema
```

## Instruções para Rodar o Projeto

### Back-end

1. Navegue até a pasta do back-end:

   ```bash
   cd back-end
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Certifique-se de que o servidor MySQL esteja rodando.

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

O servidor estará disponível em `http://localhost:3000`.

### Front-end

1. Navegue até a pasta do front-end:

   ```bash
   cd front-end
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:

   ```bash
   ionic serve
   ```

O aplicativo estará disponível em `http://localhost:8100`.

## Observações

- Certifique-se de que o back-end esteja rodando antes de usar o front-end.
- O front-end está configurado para se comunicar com o back-end através do proxy configurado no arquivo `front-end/proxy.conf.json`. Certifique-se de que o back-end esteja rodando na porta correta (3000 por padrão).
