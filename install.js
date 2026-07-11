#!/usr/bin/env node
/**
 * WhatsApp Group Summary Bot — One-Command Installer
 * 
 * Usage: npx whatsapp-group-summary
 * 
 * Installs the skill, validates Hermes setup, and guides through configuration.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// ── Config ──────────────────────────────────────────────
const SKILL_NAME = 'whatsapp-group-summary-bot';
const HERMES_HOME = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
const SKILLS_DIR = path.join(HERMES_HOME, 'skills');
const TARGET_DIR = path.join(SKILLS_DIR, SKILL_NAME);
const HERMES_SRC = path.join(HERMES_HOME, 'hermes-agent');
const REPO_URL = 'https://github.com/mocasus/whatsapp-group-summary.git';
const NPM_URL = 'https://www.npmjs.com/package/whatsapp-group-summary';

// Colors
const c = { r: '\x1b[0m', g: '\x1b[32m', y: '\x1b[33m', b: '\x1b[34m', m: '\x1b[35m', w: '\x1b[37m', dim: '\x1b[2m' };
const ok = s => `${c.g}✅ ${s}${c.r}`;
const warn = s => `${c.y}⚠️  ${s}${c.r}`;
const info = s => `${c.b}ℹ️  ${s}${c.r}`;
const title = s => `${c.m}${s}${c.r}`;
const cmd = s => `${c.dim}   $ ${s}${c.r}`;

// ── Helpers ─────────────────────────────────────────────
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
  } catch { return null; }
}

function exists(p) { return fs.existsSync(p); }

// ── Banner ──────────────────────────────────────────────
console.log('');
console.log(title('🤖  WhatsApp Group Summary Bot'));
console.log(title('   for Hermes Agent'));
console.log(c.dim + `   ${NPM_URL}` + c.r);
console.log('');

// ── Step 0: Check Hermes ────────────────────────────────
console.log(info('Checking Hermes installation...'));

const hermesBin = run('which hermes', { silent: true });
if (!hermesBin) {
  console.log(warn('Hermes CLI not found. Install it first:'));
  console.log(cmd('curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash'));
  process.exit(1);
}
console.log(ok(`Hermes found at ${hermesBin.toString().trim()}`));

// Check if WhatsApp gateway is configured
const hermesHomeExists = exists(HERMES_HOME);
if (!hermesHomeExists) {
  console.log(warn(`Hermes home not found at ${HERMES_HOME}`));
}

// ── Step 1: Install Skill ───────────────────────────────
console.log(`\n${info}Installing ${SKILL_NAME}...`);

fs.mkdirSync(SKILLS_DIR, { recursive: true });

if (exists(TARGET_DIR)) {
  console.log(warn('Existing installation found. Updating...'));
  try {
    run(`git -C "${TARGET_DIR}" pull`, { silent: true });
    console.log(ok('Updated to latest version'));
  } catch {
    console.log(warn('Git pull failed. Reinstalling...'));
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
}

if (!exists(TARGET_DIR)) {
  try {
    run(`git clone "${REPO_URL}" "${TARGET_DIR}"`, { silent: true });
    console.log(ok('Cloned from GitHub'));
  } catch {
    // Fallback: copy from npm package
    const srcDir = __dirname;
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      if (['node_modules', '.git', 'package.json', 'install.js'].includes(file)) continue;
      const src = path.join(srcDir, file);
      const dest = path.join(TARGET_DIR, file);
      if (fs.statSync(src).isDirectory()) {
        fs.cpSync(src, dest, { recursive: true });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    console.log(ok('Installed from package (offline mode)'));
  }
}

// Remove .git to keep it clean
const gitDir = path.join(TARGET_DIR, '.git');
if (exists(gitDir)) fs.rmSync(gitDir, { recursive: true, force: true });

console.log(ok(`Skill installed at ${TARGET_DIR}`));

// ── Step 2: Check Patches ───────────────────────────────
console.log(`\n${info}Checking source patches...`);

const patches = {
  bridge: {
    file: path.join(HERMES_SRC, 'scripts', 'whatsapp-bridge', 'bridge.js'),
    check: (content) => content.includes('!isGroup && WHATSAPP_DM_POLICY'),
    desc: 'Bridge group allowlist bypass',
  },
  adapter: {
    file: path.join(HERMES_SRC, 'gateway', 'platforms', 'whatsapp_common.py'),
    check: (content) => content.includes('patched — allowlist check skipped for groups'),
    desc: 'Adapter group allowlist bypass',
  },
  recorder: {
    file: path.join(HERMES_SRC, 'plugins', 'platforms', 'whatsapp', 'adapter.py'),
    check: (content) => content.includes('_record_group_message_sync'),
    desc: 'Silent group message recorder',
  },
};

let patchesOk = 0;
let patchesMissing = 0;

for (const [key, patch] of Object.entries(patches)) {
  if (!exists(patch.file)) {
    console.log(`   ${warn('?')} ${patch.desc}: file not found (${path.relative(HERMES_HOME, patch.file)})`);
    continue;
  }
  const content = fs.readFileSync(patch.file, 'utf8');
  if (patch.check(content)) {
    patchesOk++;
    console.log(`   ${ok('✓')} ${patch.desc}`);
  } else {
    patchesMissing++;
    console.log(`   ${warn('✗')} ${patch.desc} — NEEDS PATCH`);
  }
}

// ── Step 3: Check Env ───────────────────────────────────
console.log(`\n${info}Checking environment config...`);
const envFile = path.join(HERMES_HOME, '.env');
let mentionSet = false;
if (exists(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  mentionSet = /WHATSAPP_REQUIRE_MENTION\s*=\s*true/i.test(envContent);
}

if (mentionSet) {
  console.log(ok('WHATSAPP_REQUIRE_MENTION=true'));
} else {
  console.log(warn('WHATSAPP_REQUIRE_MENTION=true not set'));
}

// ── Summary & Next Steps ────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(title('📋  Next Steps'));
console.log(`${'─'.repeat(50)}\n`);

const steps = [];

if (patchesMissing > 0) {
  steps.push('1. Apply source patches:');
  steps.push('   See README for detailed diff instructions');
  steps.push(`   ${cmd}cat ${path.join(TARGET_DIR, 'README.md')}`);
  steps.push('');
}

if (!mentionSet) {
  steps.push('2. Set environment variable:');
  steps.push('   Add to Hermes env config:');
  steps.push(`   WHATSAPP_REQUIRE_MENTION=true`);
  steps.push('');
}

steps.push(`${patchesMissing > 0 ? '3' : '1'}. Restart gateway:`);
steps.push(`   ${cmd}hermes gateway restart`);
steps.push('   (Must run from separate SSH terminal)');
steps.push('');
steps.push(`${patchesMissing > 0 ? '4' : '2'}. Get group ID:`);
steps.push('   Tag @Hermes in your WhatsApp group: "apa id grup ini?"');
steps.push('');
steps.push(`${patchesMissing > 0 ? '5' : '3'}. Setup cron jobs:`);
steps.push('   Morning: 0 0 * * *  (07:00 WIB)');
steps.push('   Evening: 0 16 * * * (23:00 WIB)');
steps.push(`   Prompt: ${cmd}cat ${path.join(TARGET_DIR, 'SKILL.md')}`);
steps.push('');

for (const s of steps) console.log(`   ${s}`);

console.log(title('📖  Full Guide'));
console.log(`   ${c.dim}https://github.com/mocasus/whatsapp-group-summary${c.r}`);
console.log('');

if (patchesMissing > 0) {
  console.log(warn(`${patchesMissing} patch(es) need to be applied before recording works.`));
} else {
  console.log(ok('All patches detected! Recording should work after restart.'));
}
