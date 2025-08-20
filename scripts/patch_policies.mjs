#!/usr/bin/env node
/**
 * Replace:
 *   CREATE POLICY IF NOT EXISTS "name" ON table ...
 * with:
 *   DROP POLICY IF EXISTS "name" ON table;
 *   CREATE POLICY "name" ON table ...
 *
 * Usage:
 *   node scripts/patch_policies.mjs          # dry-run (no write)
 *   node scripts/patch_policies.mjs --write  # apply changes (creates .bak backups)
 */

import fs from "node:fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const MIGR = path.join(ROOT, "supabase", "migrations");
const WRITE = process.argv.includes("--write");

function listSqlFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSqlFiles(p));
    else if (entry.isFile() && p.toLowerCase().endsWith(".sql")) out.push(p);
  }
  return out;
}

// case-insensitive: capture policy name and table ident (may be on next line)
const RE = /create\s+policy\s+if\s+not\s+exists\s+("([^"]+)"|([^\s"]+))\s*\n\s*on\s+([a-zA-Z0-9_."]+)/i;

function patchContent(src) {
  const lines = src.split(/\r?\n/);
  let changes = 0;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/create\s+policy\s+if\s+not\s+exists\s+("([^"]+)"|([^\s"]+))/i);
    
    if (m && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      const onMatch = nextLine.match(/^\s*on\s+([a-zA-Z0-9_."]+)/i);
      
      if (onMatch) {
        const rawName = m[1];
        const policyName = rawName.startsWith('"') ? rawName : `"${rawName}"`;
        const tableIdent = onMatch[1];

        const dropLine = `drop policy if exists ${policyName} on ${tableIdent};`;
        const createLine = line.replace(/if\s+not\s+exists\s+/i, "");

        lines.splice(i, 0, dropLine);
        lines[i + 1] = createLine;
        i += 2; // Skip the next line since we've processed it
        changes++;
        continue;
      }
    }
    i++;
  }
  
  return { content: lines.join("\n"), changes };
}

function main() {
  if (!fs.existsSync(MIGR)) {
    console.error(`❌ Migrations folder not found: ${MIGR}`);
    process.exit(1);
  }

  const files = listSqlFiles(MIGR);
  let totalChanges = 0;

  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { content, changes } = patchContent(src);
    if (changes > 0) {
      totalChanges += changes;
      if (WRITE) {
        const bak = f + ".bak";
        fs.writeFileSync(bak, src, "utf8");
        fs.writeFileSync(f, content, "utf8");
        console.log(`✍️  Patched ${path.basename(f)} (${changes} change${changes>1?"s":""}) — backup: ${path.basename(bak)}`);
      } else {
        console.log(`🟡 Would patch ${path.basename(f)} — ${changes} occurrence${changes>1?"s":""}`);
      }
    }
  }

  if (totalChanges === 0) {
    console.log("✅ No 'CREATE POLICY IF NOT EXISTS' found.");
  } else if (!WRITE) {
    console.log(`\nDry-run complete. Run again with --write to apply ${totalChanges} change${totalChanges>1?"s":""}.`);
  } else {
    console.log(`\n✅ Applied ${totalChanges} change${totalChanges>1?"s":""}.`);
  }
}

main();
