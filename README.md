# clone-tabnews

Para acompanhar o https://curso.dev

Algumas notas

- ### Set up

  - 📄 `.nvmrc`
  - 🛠️ `npm init`
  - 📄 `.editorconfig` (+VSCode⚙️)
  - 📄 `.gitignore`
  - 📄 `jsconfig.json`

- ### Linters

  - Commits: commitizen
    - 🔧`npm i -D commitizen`
    - 🔧`npx commitizen init cz-conventional-changelog --save-dev --save-exact`
    - 📜`"commit": "cz"`
  - Estilo: prettier (+VSCode⚙️)
    - 🔧`npm i -D prettier`
    - 📜`"lint:prettier:check": "prettier --check ."`
    - 📜`"lint:prettier:fix": "prettier --write ."`
  - Qualidade: ESLint (+VSCode⚙️) - WIP
    - 🔧`next lint` instalará `eslint` e `eslint-config-next`
    - 📜`"lint:eslint:check": "next lint"`
    - 📄`.eslintrc.json`

- ### Web

  - next.js
    - 🛠️`npm i next`
    - 🛠️`npm i next-connect` (router)
    - 📜`"dev": "next dev"`
  - react
    - 🛠️`npm i react`
    - 🛠️`npm i react-dom`
    - 🛠️`npm i swr` (data fetcher)

- ### Database (Docker/PostgreSQL)

  - docker
    - 📄`infra/compose.yaml`
    - 📜`"services:up": "docker compose -f infra/compose.yaml up -d"`
    - 📜`"services:stop": "docker compose -f infra/compose.yaml stop"`
    - 📜`"services:down": "docker compose -f infra/compose.yaml down"`
    - 📜`"dev": "npm run services:up && next dev"`
  - pg
    - 🛠️`npm i pg`
  - node-pg-migrate - 22c
    - 🛠️`npm i node-pg-migrate`
    - 🛠️`npm i dotenv`
    - 🛠️`npm i dotenv-expand`
    - 📜`"migrations:create": "node-pg-migrate -m infra/migrations create"`
    - 📜`"migrations:up": "node-pg-migrate -m infra/migrations --envPath .env.development up",`
  - key files
    - 📄`infra/database.js`
    - 📄`infra/scripts/wait-for-postgres.js`

- ### Testes automatizados - WIP

  - jest
    - 🔧`npm i -D jest`
    - 📜`"test": "jest"`
    - 📜`"test:watch": "jest --watchAll --runInBand --verbose"`
    - 📄`jest.config.js`

- ### Infra

  - controller
  - custom errors

- ### Variáveis de ambiente

- ### CI / github - WIP
  - husky
    - 🔧`npm i -D husky`
    - 🔧`npx husky init`
    - 📄`commit-msg`
  - scripts
  - um monte de plugin do ESLint
  - arquivos yaml
  - github actions
  - Commits: commitlint
    - 🔧`npm i -D @commitlint/cli`
    - 🔧`npm i -D @commitlint/config-conventional`
    - 📄`commitlint.config.js`

## Algumas referências

| dependencies    | slug                                            |
| --------------- | ----------------------------------------------- |
| async-retry     | estabilizar-npm-test-orchestrator               |
| dotenv          | executando-migrations-cli                       |
| dotenv-expand   | executando-migrations-endpoint-live-run-parte-5 |
| next            | nextjs                                          |
| next-connect    | padronizar-controllers-abstracao-1              |
| node-pg-migrate | executando-migrations-cli                       |
| pg              | criar-modulo-database                           |
| react           | nextjs                                          |
| react-dom       | nextjs                                          |
| swr             | pagina-status-inicio                            |
| uuid            | model-user-criar                                |

| devDependencies                 | slug                              |
| ------------------------------- | --------------------------------- |
| @commitlint/cli                 | git-commit-lint                   |
| @commitlint/config-conventional | git-commit-lint                   |
| commitizen                      | git-commit-hooks                  |
| concurrently                    | estabilizar-npm-test-concurrently |
| cz-conventional-changelog       | git-commit-hooks                  |
| eslint                          | github-actions-lint-code-quality  |
| eslint-config-next              | github-actions-lint-code-quality  |
| eslint-config-prettier          | github-actions-lint-code-quality  |
| eslint-plugin-jest              | github-actions-lint-code-quality  |
| husky                           | git-commit-hooks                  |
| jest                            | testes-automatizados-test-runner  |
| prettier                        | configurar-prettier               |

| file                           | slug                                            |
| ------------------------------ | ----------------------------------------------- |
| .commitlint.config.js          | WIP                                             |
| .editorconfig                  | configurar-editorconfig                         |
| .eslintrc.json                 | WIP                                             |
| .nvmrc                         | nvm-e-nodejs                                    |
| jest.config.js                 | executando-migrations-endpoint-live-run-parte-2 |
| jsconfig.json                  | configurar-base-url                             |
| infra/compose.yaml             | banco-de-dados-local-conectando                 |
| .github/workflows/linting.yaml | WIP                                             |
| .github/workflows/tests.yaml   | WIP                                             |
| .husky/commit-msg              | git-commit-hooks                                |
