# Initialization

### Node.js 24.3

```bash
nvm install v24
```

### [Yarn 4.9.2](https://yarnpkg.com/getting-started/install)

Install [Corepack](https://yarnpkg.com/corepack) before Yarn.

Corepack is an intermediary tool that will let you configure your package manager version on a per-project basis.

```bash
npm install -g corepack
```

```bash
yarn init -2
```

Files that appeared once Yarn is installed.

| File | Purpose | Managed By | Should I Edit It? |
| :--- | :------ | :--------- | :---------------- |
| .editorconfig | Enforces consistent coding styles in your editor. | Created by yarn init. | Yes, you can customize it for your team's style preferences. |
| .gitattributes | Tells Git how to handle specific files (e.g., treat Yarn's cache as binary). | Created by yarn init. | Rarely. Usually, the default is sufficient. |
| .pnp.cjs* | CommonJS modules; Replaces node_modules; maps dependencies to their location in the cache. | Automatically by yarn install. | No. This file is auto-generated and should not be manually edited. |
| .pnp.loader.mjs | ES modules; Replaces node_modules | Automatically by yarn install. | No. This file is auto-generated and should not be manually edited. |

Install 'concurrently' in devDependencies

```bash
yarn add concurrently -D
```

## Server

Dependecies: 

```bash
yarn add express graphql cors @apollo/server mongoose
```

Dev Dependencies:

### Typescript & Types

```
yarn add -D typescript @types/node @types/express ts-node-dev @types/cors
```

tsconfig.json

Use [`ts-node-dev`](https://www.npmjs.com/package/ts-node-dev) to run node server.

It restarts target node process when smth change (shares TS compilation process between restarts)

## Client

`yarn create vite client --template react-ts`

```bash
cd client
yarn install
yarn dev
```

## DB

Make sure there isn't any other older version of mongoDb

If yes, then uninstall it first

```bash
brew uninstall mongodb-community 
brew uninstall mongodb-database-tools
brew uninstall mongosh
brew untap mongodb/brew
```

Install `mongodb-commuinty@8.0` 

```bash
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
brew services list
```

Run `mongodb-commuinty@8.0` shell

```bash
mongosh
```

You should see

```bash
Current Mongosh Log ID: 6862ba5788fc7a54cdf49edb
Connecting to:          mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.3
Using MongoDB:          8.0.10
Using Mongosh:          2.5.3

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/

------
   The server generated these startup warnings when booting
   2025-06-30T18:24:47.997+02:00: Access control is not enabled for the database. Read and write access to data and configuration is unrestricted
------

test>
```
