import { spawnSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folders = [
  'config',
  'database',
  'models',
  'services',
  'controllers',
  'middleware',
  'routes',
  'utils',
  'scripts',
  'js',
  'functions',
  'data'
];
const javascriptFiles = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filePath);
    if (entry.isFile() && entry.name.endsWith('.js')) javascriptFiles.push(filePath);
  }
}

for (const folder of folders) await walk(path.join(root, folder));
javascriptFiles.push(path.join(root, 'app.js'), path.join(root, 'server.js'));

for (const filePath of javascriptFiles) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    cwd: root,
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

console.info(`${javascriptFiles.length} arquivos JavaScript validados com sucesso.`);
