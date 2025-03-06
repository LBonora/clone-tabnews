# clone-tabnews

Para acompanhar o https://curso.dev

Algumas notas

- ### Set up

  - 📄 `.nvmrc`
  - 🛠️ `npm init`
  - 📄 `.editorconfig` (+VSCode)
  - 📄 `.gitignore`
  - 📄 `jsconfig.json` (can't remember why)

- ### Linters

  - Commits: commitizen
    - 🔧`npm i -D commitizen`
    - 🔧`npx commitizen init cz-conventional-changelog --save-dev --save-exact`
    - 📜`"commit": "cz"`
  - Estilo: prettier (+VSCode)
    - 🔧`npm i -D prettier`
    - 📜`"lint:prettier:check": "prettier --check ."`
    - 📜`"lint:prettier:fix": "prettier --write ."`
  - Qualidade: ESLint (+VSCode) - WIP
    - 🔧`npm i -D ...`
    - 📜` `
    - 📄`.eslintrc.json`

- ### Web

  - next.js
    - 🛠️`npm i next`
    - 🛠️`npm i next-connect`
    - 📜`"dev": "next dev"`
  - react
    - 🛠️`npm i react`
    - 🛠️`npm i react-dom`
    - 🛠️`npm i swr` (data fetcher)

- ### Database (Docker/PostgreSQL)

  - docker
    - 📄`infra/compose.yaml`
    - 📜`services:up": "docker compose -f infra/compose.yaml up -d"`
    - 📜`"services:stop": "docker compose -f infra/compose.yaml stop"`
    - 📜`"services:down": "docker compose -f infra/compose.yaml down"`
    - 📜`"dev": "npm run services:up && next dev"`
  - pg
    - 🛠️`npm i pg`
  - node-pg-migrate
    - 🛠️`npm i node-pg-migrate`
    - 🛠️`npm i dotenv`
    - 🛠️`npm i dotenv-expand`
    - 📜`"migrations:create": "node-pg-migrate -m infra/migrations create"`
    - 📜`"migrations:up": "node-pg-migrate -m infra/migrations --envPath .env.development up",`

- ### Testes automatizados

  - jest
    - 🔧`npm i -D jest`
    - 📜`"test": "jest"`
    - 📜`"test:watch": "jest --watchAll --runInBand --verbose"`
  - jest.config.js

- ### Variáveis de ambiente

- ### CI / github
  - husky
  - scripts
  - um monte de plugin do ESLint
  - arquivos yaml
  - github actions
  - Commits: commitlint
    - 🔧`npm i -D @commitlint/cli`
    - 🔧`npm i -D @commitlint/config-conventional`
    - 📄`commitlint.config.js`
