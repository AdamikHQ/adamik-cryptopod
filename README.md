# CryptoPod

CryptoPod is a configurable, modular, deployable solution that brings full blockchain support to your existing systems in just a few clicks.

## Features

- [ ] Fully configurable
  - Supports multiple blockchains
  - Supports multiple wallet providers
- Modular
- [ ] Deployable <!-- TODO: Add a deployable HOWTO -->

## Quickstart

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18.x)
- [pnpm](https://pnpm.io/installation)
- [Postgres](https://www.postgresql.org/download/)

### Global Setup

```bash
pnpm install -g prisma vercel
```

### Local Setup

```bash
# Install dependencies
pnpm install
# Create a .env file
touch .env
# Compile the project
pnpm run watch
# Run the server
pnpm run start
```

## Development

### Prisma

If you modify the Prisma schema, you need to run:

```bash
pnpx prisma migrate dev --name "<migration_name>"
git add prisma/migrations
```
