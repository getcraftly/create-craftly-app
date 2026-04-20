#!/usr/bin/env node

/**
 * create-craftly-app
 *
 * Scaffold a Next.js project starting from Craftly's free 404 template.
 * This is a small helper around `git clone`, `npm install`, and project setup
 * so you can go from `npx create-craftly-app my-app` to a running dev server
 * in one command.
 */

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const REPO_URL = 'https://github.com/getcraftly/free-404.git';
const CRAFTLY_URL = 'https://getcraftly.dev';

// ── ANSI colors ─────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(msg) { console.log(msg); }
function info(msg) { log(c.cyan + 'ℹ ' + c.reset + msg); }
function success(msg) { log(c.green + '✓ ' + c.reset + msg); }
function warn(msg) { log(c.yellow + '⚠ ' + c.reset + msg); }
function error(msg) { log(c.red + '✗ ' + c.reset + msg); }

// ── Banner ──────────────────────────────────────────
function banner() {
  log('');
  log(c.magenta + c.bold + '  Craftly' + c.reset + c.dim + ' — Next.js templates, shipped fast' + c.reset);
  log(c.dim + '  ' + CRAFTLY_URL + c.reset);
  log('');
}

// ── Arg parsing ─────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = { help: false, version: false, skipInstall: false, skipGit: false };
  let projectName = null;

  for (const a of args) {
    if (a === '-h' || a === '--help') flags.help = true;
    else if (a === '-v' || a === '--version') flags.version = true;
    else if (a === '--skip-install') flags.skipInstall = true;
    else if (a === '--skip-git') flags.skipGit = true;
    else if (!a.startsWith('-') && !projectName) projectName = a;
  }

  return { projectName, flags };
}

function printHelp() {
  log('');
  log(c.bold + 'create-craftly-app' + c.reset);
  log(c.dim + '  Scaffold a Next.js project from a Craftly template.' + c.reset);
  log('');
  log(c.bold + 'Usage:' + c.reset);
  log('  npx create-craftly-app <project-name> [options]');
  log('');
  log(c.bold + 'Options:' + c.reset);
  log('  -h, --help         Show this help');
  log('  -v, --version      Show version');
  log('  --skip-install     Skip `npm install` step');
  log('  --skip-git         Skip `git init` step');
  log('');
  log(c.bold + 'Example:' + c.reset);
  log('  npx create-craftly-app my-app');
  log('');
  log(c.dim + 'More templates (paid) at ' + CRAFTLY_URL + c.reset);
  log('');
}

// ── Validate project name ───────────────────────────
function validateName(name) {
  if (!name) return 'Project name is required.';
  if (!/^[a-z0-9][a-z0-9\-_]*$/.test(name)) {
    return 'Project name must be lowercase letters/numbers/dashes/underscores, starting with a letter or number.';
  }
  const target = resolve(process.cwd(), name);
  if (existsSync(target)) {
    return `Directory "${name}" already exists at ${target}.`;
  }
  return null;
}

// ── Prompt for project name if missing ──────────────
async function promptName() {
  const rl = createInterface({ input, output });
  try {
    while (true) {
      const answer = (await rl.question(c.cyan + '? ' + c.reset + 'Project name: ')).trim();
      const err = validateName(answer);
      if (!err) return answer;
      error(err);
    }
  } finally {
    rl.close();
  }
}

// ── Git clone ───────────────────────────────────────
function cloneRepo(projectName) {
  info(`Cloning Craftly free-404 template into ${c.bold}${projectName}${c.reset}...`);
  try {
    execSync(`git clone --depth 1 ${REPO_URL} ${projectName}`, { stdio: 'inherit' });
    // Remove the cloned .git so the user starts fresh
    rmSync(join(projectName, '.git'), { recursive: true, force: true });
    success('Template cloned.');
  } catch (e) {
    error('Clone failed. Is git installed and are you online?');
    throw e;
  }
}

// ── Update package.json name ────────────────────────
function updatePackageName(projectName) {
  const pkgPath = join(projectName, 'package.json');
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  pkg.name = projectName;
  delete pkg.repository;
  delete pkg.homepage;
  delete pkg.bugs;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  success(`Set package.json name to "${projectName}".`);
}

// ── Init fresh git ──────────────────────────────────
function initGit(projectName) {
  try {
    execSync('git init -q', { cwd: projectName, stdio: 'inherit' });
    execSync('git add -A', { cwd: projectName, stdio: 'ignore' });
    execSync('git commit -q -m "initial commit (via create-craftly-app)"', {
      cwd: projectName,
      stdio: 'ignore',
    });
    success('Fresh git repo initialized.');
  } catch {
    warn('git init failed (skipping). You can run `git init` manually later.');
  }
}

// ── Install deps ────────────────────────────────────
function installDeps(projectName) {
  info('Installing dependencies (npm install)...');
  const result = spawnSync('npm', ['install'], {
    cwd: projectName,
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    warn('npm install failed. You can run it manually later.');
    return false;
  }
  success('Dependencies installed.');
  return true;
}

// ── Finish message ──────────────────────────────────
function printSuccess(projectName) {
  log('');
  log(c.green + c.bold + '  Done!' + c.reset);
  log('');
  log('  Next:');
  log(c.dim + '    $ ' + c.reset + `cd ${projectName}`);
  log(c.dim + '    $ ' + c.reset + 'npm run dev');
  log('');
  log(c.dim + '  Then open http://localhost:3000/missing-page to see the 404.' + c.reset);
  log('');
  log(c.magenta + '  Need more templates?' + c.reset);
  log('  Browse the full catalog at ' + c.cyan + CRAFTLY_URL + c.reset);
  log('');
}

// ── Main ────────────────────────────────────────────
async function main() {
  const { projectName: cliName, flags } = parseArgs(process.argv);

  if (flags.help) { printHelp(); return; }

  if (flags.version) {
    const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
    log(pkg.version);
    return;
  }

  banner();

  let projectName = cliName;
  if (!projectName) {
    projectName = await promptName();
  } else {
    const err = validateName(projectName);
    if (err) { error(err); process.exit(1); }
  }

  cloneRepo(projectName);
  updatePackageName(projectName);

  if (!flags.skipGit) initGit(projectName);

  if (!flags.skipInstall) installDeps(projectName);

  printSuccess(projectName);
}

main().catch((e) => {
  error(`Fatal: ${e.message || e}`);
  process.exit(1);
});
