#!/usr/bin/env node
// ============================================================================
// License key generator for the 'offline' provider.
//
// Usage:
//   node tools/generate-keys.mjs 100 > keys-PRIVATE.txt
//
// Output: 100 keys with their SHA-256 hashes, plus a ready-to-paste
// `offlineKeyHashes` block for js/config.js.
//
// IMPORTANT:
//   - Commit ONLY the hashes (in config.js). Never commit the keys file —
//     keys-PRIVATE*.txt is gitignored for you.
//   - Upload the plain keys to your payment provider (e.g. as Gumroad
//     "content" delivered after purchase, or send them manually per sale).
// ============================================================================

import { randomBytes, createHash } from 'node:crypto';

const count = Math.max(1, Math.min(10000, parseInt(process.argv[2] || '50', 10) || 50));

// Unambiguous alphabet (no 0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomBlock(len = 4) {
  const bytes = randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

const keys = [];
for (let i = 0; i < count; i++) {
  const key = `VSME-${randomBlock()}-${randomBlock()}-${randomBlock()}`;
  const hash = createHash('sha256').update(key).digest('hex');
  keys.push({ key, hash });
}

console.log(`# ${count} license keys — generated ${new Date().toISOString()}`);
console.log('# KEEP THIS FILE PRIVATE. Upload/send the keys to buyers; commit only the hashes.\n');
for (const { key, hash } of keys) console.log(`${key}  ${hash}`);

console.log('\n# ---- paste into js/config.js → licensing.offlineKeyHashes ----\n');
console.log('    offlineKeyHashes: [');
for (const { hash } of keys) console.log(`      '${hash}',`);
console.log('    ],');
