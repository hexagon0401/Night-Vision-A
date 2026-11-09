import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';

const root = new URL('../../../', import.meta.url);
const schema = JSON.parse(await readFile(new URL('schemas/case-bundle.schema.json', root), 'utf8'));
const output = await compile(schema, 'CaseBundle', {
  bannerComment: '/* Generated from schemas/case-bundle.schema.json. Do not edit. */',
  additionalProperties: false,
  style: { singleQuote: true, semi: true },
});
const destination = new URL('../src/contracts/generated.ts', import.meta.url);
if (process.argv.includes('--check')) {
  if (await readFile(destination, 'utf8') !== output) {
    throw new Error(`Stale TypeScript contract: ${fileURLToPath(destination)}`);
  }
} else {
  await writeFile(destination, output);
}
