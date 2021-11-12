import {
  SchemaRegistry,
  readAVSCAsync,
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
  ];

  const results = [];

  for (const dir of dirs) {
    for (const file of fs.readdirSync(path.join(__dirname, `schema/${dir}`))) {
      const schema = await readAVSCAsync(path.join(__dirname, `schema/${dir}/${file}`));
      const { id } = await registry.register(schema, { subject: file.split('.')[0] });

      results.push(`${dir}/${file}: ${id}`);
    }
  }

  return results;
}

run()
  .then(res => console.log('Finished', res))
  .catch(err => console.error('Error', err));