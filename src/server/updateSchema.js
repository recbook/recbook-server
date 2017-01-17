import 'babel-polyfill';
import { graphql } from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

import fs from 'fs';
import path from 'path';
import schema from './graphQLschema/index';
const sharedSchemaPath = path.join(__dirname, '../..');

graphql(schema, introspectionQuery).then(result => {
  fs.writeFileSync(
    `${sharedSchemaPath}/src/shared/schema.json`,
    JSON.stringify(result, null, 2)
  );
  fs.writeFileSync(
    `${sharedSchemaPath}/src/shared/schema.graphqls`,
    printSchema(schema)
  );
  process.exit(0);
});

