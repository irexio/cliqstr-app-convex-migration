// list-files.mjs
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir, base = '') {
  return readdirSync(dir).flatMap(file => {
    const fullPath = join(dir, file);
    const relPath = join(base, file);
    return statSync(fullPath).isDirectory()
      ? walk(fullPath, relPath)
      : relPath;
  });
}

const appFiles = walk('app');
const apiFiles = walk('src/app/api');
const componentFiles = walk('components');

const allFiles = [...appFiles, ...apiFiles, ...componentFiles];
console.log(allFiles.join('\n'));

