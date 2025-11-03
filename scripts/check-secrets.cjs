#!/usr/bin/env node
// scripts/check-secrets.cjs
// CommonJS version for projects with "type": "module" in package.json

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
  // Focused checks to avoid false positives (only high-confidence secrets)
  // 1) Environment assignments with non-placeholder values (e.g. VITE_SUPABASE_ANON_KEY=....)
  // Skip env-assignment checks for server-side functions that legitimately reference
  // service role env names (e.g. supabase edge functions or other server code).
  const serverPaths = ['supabase/functions/', 'supabase/edge/', 'server/'];
  const isServerFile = serverPaths.some(p => filePath.startsWith(p) || filePath.includes(`/${p}`));

  if (!isServerFile) {
    const envAssignRegex = /(VITE_SUPABASE_ANON_KEY|VITE_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)\s*=\s*([^#\n\r]+)/i;
    const envMatch = content.match(envAssignRegex);
    if (envMatch) {
      const key = envMatch[1];
      const value = envMatch[2].trim();
      // Allow common placeholders
      if (!/your|example|anon-key|REPLACE|<|\{\{/.test(value) && value.length > 20) {
        findings.push({ file: filePath, reason: `Environment variable ${key} appears to have a real value`, snippet: value.slice(0, 120) });
      }
    }
  }

  // Additional server-file validation: if server files reference the service role variable,
  // ensure they access it via Deno.env.get(...) or process.env[...] patterns. If a server file
  // contains the literal name but not an access call, flag it (possible hardcoded secret).
  if (isServerFile) {
    const serviceVarNameRegex = /SUPABASE_SERVICE_ROLE_KEY/;
    if (serviceVarNameRegex.test(content)) {
      const allowedAccessRegex = /(Deno\.env\.get\(['"`]SUPABASE_SERVICE_ROLE_KEY['"`]\)|process\.env\[['"`]SUPABASE_SERVICE_ROLE_KEY['"`]\]|Deno\.env\(['"`]SUPABASE_SERVICE_ROLE_KEY['"`]\))/;
      if (!allowedAccessRegex.test(content)) {
        findings.push({ file: filePath, reason: 'Service role variable referenced but not accessed via Deno.env.get/process.env', snippet: excerpt(content, /SUPABASE_SERVICE_ROLE_KEY/) });
      }
    }
  }

  // 3) JWT-like strings (high-confidence token pattern) but only in code/json files
  if (/(?:\.js|\.ts|\.cjs|\.mjs|\.json|\.jsx|\.tsx)$/.test(filePath)) {
    const jwtRegex = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;
    const jm = content.match(jwtRegex);
    if (jm && jm.length) {
      for (const token of jm) {
        findings.push({ file: filePath, reason: 'Possible JWT or token', snippet: token.slice(0, 120) });
      }
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

  const allowedExt = new Set(['.js', '.jsx', '.ts', '.tsx', '.cjs', '.mjs', '.env', '.env.local', '.json']);
  const excludedPaths = ['docs/', 'public/', 'node_modules/', '.github/', 'package-lock.json'];
  // Exclude the scanner script itself to avoid self-matching
  excludedPaths.push('scripts/');

  let findings = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
  if (!allowedExt.has(ext)) continue;
  if (excludedPaths.some(p => file.startsWith(p) || file === p)) continue;
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
