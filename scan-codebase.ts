// scan-codebase.ts
// 🔒 Type-safe, read-only script to scan your project for suspicious code patterns

const fs = require('fs');
const path = require('path');

const suspiciousPatterns: string[] = [
  'eval(',
  'new Function(',
  'fetch("http',
  'fetch(\'http',
  'XMLHttpRequest(',
  'require("child_process"',
  'import("child_process")',
  'postinstall',
  'curl ',
  'wget ',
  'process.env'
];

// Check if a line contains suspicious content
function isSuspiciousLine(line: string): boolean {
  return suspiciousPatterns.some((pattern: string) => line.includes(pattern));
}

// Scan one file, line by line
function scanFile(filePath: string): void {
  try {
    const content: string = fs.readFileSync(filePath, 'utf-8');
    const lines: string[] = content.split('\n');
    lines.forEach((line: string, index: number) => {
      if (isSuspiciousLine(line)) {
        console.log(`⚠️  [${filePath}:${index + 1}] ${line.trim()}`);
      }
    });
  } catch (err) {
    console.warn(`Could not read file: ${filePath}`);
  }
}

// Recursively scan all .ts/.tsx/.js files in a folder
function scanDirectory(dir: string): void {
  const entries: string[] = fs.readdirSync(dir);
  entries.forEach((entry: string) => {
    const fullPath: string = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
      scanDirectory(fullPath);
    } else if (
      entry.endsWith('.ts') ||
      entry.endsWith('.tsx') ||
      entry.endsWith('.js')
    ) {
      scanFile(fullPath);
    }
  });
}

// Run the scan
console.log('🔍 Starting codebase security scan...\n');
scanDirectory('./');
console.log('\n✅ Scan complete. Review any ⚠️ lines shown above.');
