import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { compile } from 'json-schema-to-typescript';

const root = new URL('../../../', import.meta.url);
for (const [schemaName, typeName, outputName] of [['case-bundle','CaseBundle','generated'],['analysis-report','AnalysisReport','analysis'],['ontology-graph.v2','OntologyGraph','ontology-v2']]) {
const schema = JSON.parse(await readFile(new URL(`schemas/${schemaName}.schema.json`, root), 'utf8'));
const output = await compile(schema, typeName, {
  bannerComment: `/* Generated from schemas/${schemaName}.schema.json. Do not edit. */`,
  additionalProperties: false,
  style: { singleQuote: true, semi: true },
});
const destination = new URL(`../src/contracts/${outputName}.ts`, import.meta.url);
if (process.argv.includes('--check')) {
  if (await readFile(destination, 'utf8') !== output) {
    throw new Error(`Stale TypeScript contract: ${fileURLToPath(destination)}`);
  }
} else {
  await writeFile(destination, output);
}

}
