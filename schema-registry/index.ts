import {
  SchemaRegistry,
  readAVSCAsync,
  COMPATIBILITY,
} from '@kafkajs/confluent-schema-registry';
import * as path from "path";
import * as fs from "fs";

const registry = new SchemaRegistry({
  host: 'http://ates_schema-registry:8081', // todo: hardcode
});

const run = async () => {
  const dirs = [
    'auth/cud',
    'tasks/bl',
    'tasks/cud',
  ];

  const results = [];

  for (const dir of dirs) {
    for (const subject of fs.readdirSync(path.join(__dirname, 'schema', dir))) {
      for (const version of fs.readdirSync(path.join(__dirname, 'schema', dir, subject))) {
        const filename = path.join(__dirname, 'schema', dir, subject, version);
        console.log(`Processing ${filename}...`);
        const content = await readAVSCAsync(filename);
        const { id } = await registry.register(content, { subject, compatibility: COMPATIBILITY.NONE });

        results.push(`${dir}/${subject}/${version}: ${id}`);
      }
    }
  }

  return results;
}

run()
  .then(res => console.log('Finished', res))
  .catch(err => console.error('Error', err));