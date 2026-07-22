import { spawnSync } from 'node:child_process';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const folders = [
  'config', 'database', 'models', 'services', 'controllers', 'middleware',
  'routes', 'utils', 'scripts', 'js', 'functions', 'data'
];
const javascriptFiles = [];
const htmlFiles = [];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(filePath);
    if (entry.isFile() && entry.name.endsWith('.js')) javascriptFiles.push(filePath);
    if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(filePath);
  }
}

for (const folder of folders) await walk(path.join(root, folder));
await walk(path.join(root, 'pages'));
await walk(path.join(root, 'views'));
javascriptFiles.push(path.join(root, 'app.js'), path.join(root, 'server.js'));
htmlFiles.push(path.join(root, 'index.html'));

for (const filePath of [...new Set(javascriptFiles)]) {
  const result = spawnSync(process.execPath, ['--check', filePath], {
    cwd: root,
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status || 1);
  }
}

const missingReferences = [];
const dynamicPrefixes = ['/adm', '/api', '/publicacoes', '/health'];

for (const filePath of [...new Set(htmlFiles)]) {
  const source = await readFile(filePath, 'utf8');
  const references = [...source.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
  for (const reference of references) {
    if (/^(?:https?:|mailto:|data:|#)/.test(reference)) continue;
    if (dynamicPrefixes.some((prefix) => reference.startsWith(prefix))) continue;
    const cleanReference = reference.split(/[?#]/)[0];
    const resolved = cleanReference.startsWith('/')
      ? path.join(root, cleanReference.slice(1))
      : path.resolve(path.dirname(filePath), cleanReference);
    try {
      await access(resolved);
    } catch {
      missingReferences.push(`${path.relative(root, filePath)} -> ${reference}`);
    }
  }
}

for (const filePath of [...new Set(javascriptFiles)]) {
  const source = await readFile(filePath, 'utf8');
  const imports = [...source.matchAll(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  for (const modulePath of imports) {
    if (!modulePath.startsWith('.')) continue;
    const resolved = path.resolve(path.dirname(filePath), modulePath);
    const candidate = path.extname(resolved) ? resolved : `${resolved}.js`;
    try {
      await access(candidate);
    } catch {
      missingReferences.push(`${path.relative(root, filePath)} -> ${modulePath}`);
    }
  }
}

if (missingReferences.length) {
  console.error('Referências locais ausentes:');
  missingReferences.forEach((reference) => console.error(`- ${reference}`));
  process.exit(1);
}

JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));

console.info(`${new Set(javascriptFiles).size} arquivos JavaScript validados.`);
console.info(`${new Set(htmlFiles).size} arquivos HTML verificados.`);
console.info('Referências locais e package.json validados com sucesso.');
