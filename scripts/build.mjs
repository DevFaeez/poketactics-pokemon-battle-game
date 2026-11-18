import { build } from 'esbuild';
import { cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const project = new URL('../', import.meta.url);
const output = new URL('build/', project);

await cp(new URL('public/', project), output, { recursive: true });
await build({
  absWorkingDir: fileURLToPath(project),
  entryPoints: ['src/index.js'],
  outfile: 'build/app.js',
  loader: { '.js': 'jsx' },
  nodePaths: [fileURLToPath(new URL('node_modules/', project))],
  bundle: true,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});

const policy = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' https://raw.githubusercontent.com",
  "connect-src https://pokeapi.co",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const index = new URL('index.html', output);
const template = await readFile(index, 'utf8');
const html = template
  .replaceAll('%PUBLIC_URL%/', './')
  .replace('<meta charset="utf-8" />', `<meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${policy}" />
    <link rel="stylesheet" href="./app.css" />
    <script defer src="./app.js"></script>`);
await writeFile(index, html);
