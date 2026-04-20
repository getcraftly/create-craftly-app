# create-craftly-app

Scaffold a Next.js project from [Craftly](https://getcraftly.dev)'s free 404 template in one command.

[![npm version](https://img.shields.io/npm/v/create-craftly-app.svg)](https://www.npmjs.com/package/create-craftly-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Usage

```bash
npx create-craftly-app my-app
cd my-app
npm run dev
```

That's it. Opens at http://localhost:3000/missing-page.

## What you get

A fresh Next.js 16 + Tailwind v4 project based on Craftly's free, MIT-licensed 404 template:

- Space-themed 404 page with 120 twinkling stars, floating astronaut, gradient effects
- Framer Motion animations
- Dark mode out of the box
- TypeScript strict mode
- Tailwind v4 config-less setup

## Options

```bash
npx create-craftly-app <project-name> [options]
```

| Flag | Description |
|------|-------------|
| `--skip-install` | Skip running `npm install` |
| `--skip-git` | Skip initializing a fresh git repo |
| `-h, --help` | Show help |
| `-v, --version` | Show version |

## Why

Because `git clone + rm .git + npm install + git init + first commit` is five steps, and this is one.

## More templates

This CLI scaffolds the free 404 template. If you want more (SaaS landing page, dashboard, portfolio, blog, pricing, waitlist), browse the full catalog at [getcraftly.dev](https://getcraftly.dev).

All templates use the same stack. Once you learn one, you know all of them.

## License

MIT © Craftly
