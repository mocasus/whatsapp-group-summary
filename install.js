#!/usr/bin/env node
/**
 * WhatsApp Group Summary Bot — Installer
 * 
 * Usage: npx whatsapp-group-summary
 * 
 * Copies the skill to ~/.hermes/skills/whatsapp-group-summary-bot
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SKILL_NAME = 'whatsapp-group-summary-bot';
const HERMES_HOME = process.env.HERMES_HOME || path.join(require('os').homedir(), '.hermes');
const TARGET_DIR = path.join(HERMES_HOME, 'skills', SKILL_NAME);
const REPO_URL = 'https://github.com/mocasus/whatsapp-group-summary.git';

console.log('🤖 WhatsApp Group Summary Bot — Installer');
console.log(`   Target: ${TARGET_DIR}\n`);

if (fs.existsSync(TARGET_DIR)) {
  console.log('⚠️  Skill already exists. Updating...');
  try {
    execSync(`git -C "${TARGET_DIR}" pull`, { stdio: 'inherit' });
    console.log('✅ Updated successfully!');
  } catch {
    console.log('⚠️  Git pull failed. Re-cloning...');
    fs.rmSync(TARGET_DIR, { recursive: true, force: true });
  }
}

if (!fs.existsSync(TARGET_DIR)) {
  console.log('📦 Cloning skill...');
  try {
    execSync(`git clone "${REPO_URL}" "${TARGET_DIR}"`, { stdio: 'inherit' });
    console.log('✅ Skill installed!');
  } catch (e) {
    console.error('❌ Failed to clone. Trying manual copy...');
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    const sourceDir = path.join(__dirname, '..');
    const files = fs.readdirSync(sourceDir);
    for (const file of files) {
      if (file === 'node_modules' || file === '.git' || file === 'package.json') continue;
      const src = path.join(sourceDir, file);
      const dest = path.join(TARGET_DIR, file);
      fs.cpSync(src, dest, { recursive: true });
    }
    console.log('✅ Skill installed (manual copy)!');
  }
}

console.log('\n📋 Next steps:');
console.log('   1. Apply 3 source patches (see README)');
console.log('   2. Set WHATSAPP_REQUIRE_MENTION=true in Hermes env');
console.log('   3. Restart gateway: hermes gateway restart');
console.log('   4. Tag @Hermes in group: "apa id grup ini?"');
console.log('   5. Setup 2 cron jobs (morning 07:00 + evening 23:00 WIB)');
console.log('\n   Full guide: https://github.com/mocasus/whatsapp-group-summary');
