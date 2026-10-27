import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const base = (process.env.API_BASE_URL ?? 'https://projectname-api-render.onrender.com').replace(
  /\/+$/,
  '',
);
const prefix = process.env.NEXT_PUBLIC_API_PREFIX ?? '/api/v1';
const bin = join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'openapi-typescript.cmd' : 'openapi-typescript',
);

execFileSync(bin, [`${base}${prefix}/docs.json`, '-o', 'src/types/schema.d.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
