#!/usr/bin/env node
// scripts/check-secrets.js
// Scans staged files (or working tree files) for common secret patterns.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch (err) {
    return [];
  }
}

function getFileContentFromIndex(filePath) {
  try {
    // Use git show to get staged content
    return execSync(`git show :${filePath}`, { encoding: 'utf8' });
  } catch (err) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (e) {
      return '';
    }
  }
}

function scanContent(content, filePath) {
  const findings = [];

  const checks = [
    { name: 'Private key block', regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/i },
    { name: 'Likely JWT / long base64', regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/ },
    { name: 'Possible API key (long base64-ish)', regex: /[A-Za-z0-9_-]{32,}/ },
    { name: 'Supabase service role', regex: /VITE_SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_KEY/ },
    { name: 'Supabase anon key', regex: /VITE_SUPABASE_ANON_KEY/ },
    { name: 'Environment file content', regex: /VITE_SUPABASE_ANON_KEY=|SUPABASE_SERVICE_ROLE_KEY=/i },
    { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/ },
    { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  ];

  for (const check of checks) {
    if (check.regex.test(content)) {
      findings.push({ file: filePath, reason: check.name, snippet: excerpt(content, check.regex) });
    }
  }

  return findings;
}

function excerpt(content, regex) {
  const m = content.match(regex);
  if (!m) return '';
  const idx = content.indexOf(m[0]);
  const start = Math.max(0, idx - 40);
  const end = Math.min(content.length, idx + m[0].length + 40);
  return content.slice(start, end).replace(/\n/g, ' ');
}

async function main() {
  const stagedOnly = process.argv.includes('--staged') || process.argv.includes('-s');
  const files = stagedOnly ? getStagedFiles() : getAllFiles();

  const allowedExt = new Set(['.js', '.jsx', '.ts', '.tsx', '.env', '.env.local', '.json', '.md', '.html']);

  let findings = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!allowedExt.has(ext)) continue;
    if (!fs.existsSync(file)) continue;

    const content = stagedOnly ? getFileContentFromIndex(file) : fs.readFileSync(file, 'utf8');
    const fileFindings = scanContent(content, file);
    if (fileFindings.length) findings = findings.concat(fileFindings);
  }

  if (findings.length) {
    console.error('\n⚠️  Secret scanning detected potential secrets in staged files:');
    for (const f of findings) {
      console.error(` - ${f.file}: ${f.reason}`);
      console.error(`   snippet: "${f.snippet}"\n`);
    }
    console.error('Commit aborted. Remove secrets from files, or move them to environment variables and use placeholders.');
    console.error('To bypass for a single commit (not recommended): git commit -n');
    process.exit(1);
  }

  console.log('✅ Secret scan passed.');
}

function getAllFiles() {
  // Fallback: scan repository files that we care about
  try {
    const out = execSync("git ls-files", { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch (err) {
    return [];
  }
}

main().catch(err => {
  console.error('Secret scan failed:', err);
  process.exit(2);
});
